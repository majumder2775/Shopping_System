import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Product, User, Order, AuditLog, Email } from './models';
import { requireAuth, requireAdmin, signToken, HttpError } from './auth';
import { seedDatabase } from './seed';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import { sendGmailMessage } from './emailService';

const r = Router();
const wrap = (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
const me = (req: Request) => (req as any).user;
const isOid = (id: string) => mongoose.isValidObjectId(id);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authPayload = (u: any) => ({ ...u.toJSON(), token: signToken(String(u._id), u.role) });

// ---------- Auth ----------
r.post('/auth/register', wrap(async (req, res) => {
  const { name, email, phone = '', password } = req.body || {};
  if (!name?.trim()) throw new HttpError(400, 'Name is required.');
  if (typeof password !== 'string' || password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters long.');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw new HttpError(400, 'Invalid email address format.');
  if (await User.exists({ email: email.toLowerCase() })) throw new HttpError(409, 'An account with this email address already exists.');
  const user = await User.create({
    name: name.trim(), email, phone, role: 'customer', status: 'active',
    avatar: name.trim().slice(0, 2).toUpperCase(), passwordHash: await bcrypt.hash(password, 10),
  });
  res.status(201).json(authPayload(user));
}));

r.post('/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') throw new HttpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // same message for unknown email / wrong password: no account enumeration
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, 'Invalid email or password. If you registered with Google, use Google sign-in.');
  if (user.status === 'blocked') throw new HttpError(403, 'Your account has been suspended by the administrator.');
  res.json(authPayload(user));
}));

// Google Identity Services: verify the ID token on the server, then issue our normal JWT.
r.post('/auth/google', wrap(async (req, res) => {
  const credential = req.body?.credential;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(503, 'Google sign-in is not configured on the server.');
  if (typeof credential !== 'string' || !credential) throw new HttpError(400, 'Google credential is required.');

  let payload: any;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Google identity could not be verified. Please try again.');
  }
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new HttpError(401, 'A verified Google email address is required.');
  }

  const email = String(payload.email).toLowerCase().trim();
  let user = await User.findOne({ email });
  if (user) {
    if (user.status === 'blocked') throw new HttpError(403, 'Your account has been suspended by the administrator.');
    // Link the verified Google identity to an existing account instead of creating a duplicate.
    if (user.googleId && user.googleId !== payload.sub) throw new HttpError(409, 'This email is already linked to another Google account.');
    if (!user.googleId) user.googleId = payload.sub;
    // CHANGED: use initials (not Google picture URL) so the header avatar renders correctly
    if (!user.avatar) user.avatar = String(payload.name || email).slice(0, 2).toUpperCase();
    await user.save();
  } else {
    user = await User.create({
      name: String(payload.name || email.split('@')[0]),
      email,
      phone: '',
      role: 'customer',
      status: 'active',
      googleId: payload.sub,
      // CHANGED: initials instead of payload.picture
      avatar: String(payload.name || email).slice(0, 2).toUpperCase(),
      // Google-authenticated accounts do not need a local password hash.
    });
  }
  res.json(authPayload(user));
}));

// Demo role switcher (header toggle). Disabled unless ALLOW_DEMO_LOGIN=true.
r.post('/auth/demo/:role', wrap(async (req, res) => {
  if (process.env.ALLOW_DEMO_LOGIN !== 'true') throw new HttpError(404, 'Not found.');
  const user = await User.findOne({ role: req.params.role === 'admin' ? 'admin' : 'customer' }).sort({ _id: 1 });
  if (!user) throw new HttpError(404, 'No demo user found. Run the seed.');
  res.json(authPayload(user));
}));

r.get('/auth/me', requireAuth, wrap(async (req, res) => res.json(me(req))));

// ---------- Image upload (admin) ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (_req, f, cb) => cb(null, `${Date.now()}-${f.originalname.replace(/[^\w.-]/g, '_')}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, f, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.mimetype)),
});

r.post('/upload', requireAuth, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) throw new HttpError(400, 'No valid image uploaded (JPG, PNG, WEBP or GIF, max 2 MB).');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ---------- Products ----------
r.get('/products', wrap(async (req, res) => {
  const { category, search, minPrice, maxPrice, rating, inStockOnly, sort } = req.query as Record<string, string>;
  const q: any = {};
  if (category && category !== 'All') q.category = category;
  if (search?.trim()) {
    const re = new RegExp(escapeRe(search.trim()), 'i');
    q.$or = [{ name: re }, { brand: re }, { description: re }, { sku: re }];
  }
  if (minPrice || maxPrice) q.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  if (rating && +rating > 0) q.rating = { $gte: +rating };
  if (inStockOnly === 'true') q.inventoryCount = { $gt: 0 };
  const sorts: Record<string, any> = {
    'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 },
  };
  res.json(await Product.find(q).sort(sorts[sort] || { featured: -1, createdAt: -1 }));
}));

r.get('/products/:id', wrap(async (req, res) => {
  const p = await Product.findOne(isOid(req.params.id) ? { _id: req.params.id } : { sku: req.params.id });
  if (!p) throw new HttpError(404, 'Product not found in database');
  res.json(p);
}));

const PRODUCT_FIELDS = ['sku', 'name', 'brand', 'category', 'price', 'compareAtPrice', 'inventoryCount',
  'lowStockThreshold', 'images', 'description', 'features', 'dimensions', 'materials', 'warranty', 'featured'];
const pick = (o: any, keys: string[]) => Object.fromEntries(keys.filter((k) => o?.[k] !== undefined).map((k) => [k, o[k]]));

r.post('/products', requireAuth, requireAdmin, wrap(async (req, res) => {
  const p = await Product.create({ ...pick(req.body, PRODUCT_FIELDS), rating: 5, reviewCount: 0 });
  await AuditLog.create({
    productId: p._id, productName: p.name, sku: p.sku, previousStock: 0, newStock: p.inventoryCount,
    delta: p.inventoryCount, reason: 'product_created', referenceId: 'ADMIN-NEW-SKU',
  });
  res.status(201).json(p);
}));

r.put('/products/:id', requireAuth, requireAdmin, wrap(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body, PRODUCT_FIELDS), { new: true, runValidators: true });
  if (!p) throw new HttpError(404, 'Product not found in database');
  res.json(p);
}));

r.delete('/products/:id', requireAuth, requireAdmin, wrap(async (req, res) => {
  const del = await Product.findByIdAndDelete(req.params.id);
  res.json({ success: !!del });
}));

r.post('/products/:id/reviews', requireAuth, wrap(async (req, res) => {
  const rating = Math.max(1, Math.min(5, Number(req.body?.rating)));
  const comment = String(req.body?.comment || '').trim().slice(0, 1000);
  if (!rating || !comment) throw new HttpError(400, 'Rating and comment are required.');
  const p = await Product.findById(req.params.id);
  if (!p) throw new HttpError(404, 'Product not found');
  const review = {
    reviewId: `rev-${Date.now()}`, userId: me(req)._id, userName: me(req).name, productId: p._id, rating, comment,
  };
  p.reviews.unshift(review as any);
  p.reviewCount = p.reviews.length;
  p.rating = +(p.reviews.reduce((a, x) => a + (x.rating || 0), 0) / p.reviews.length).toFixed(1);
  await p.save();
  res.status(201).json({ review: p.reviews[0], product: p });
}));

// ---------- Inventory (admin) ----------
r.put('/inventory/:id', requireAuth, requireAdmin, wrap(async (req, res) => {
  const qty = Math.max(0, Math.floor(Number(req.body?.quantity)));
  if (!Number.isFinite(qty)) throw new HttpError(400, 'Invalid quantity.');
  const before = await Product.findById(req.params.id);
  if (!before) throw new HttpError(404, 'Product not found in database');
  const p = await Product.findByIdAndUpdate(before._id, { inventoryCount: qty }, { new: true });
  await AuditLog.create({
    productId: before._id, productName: before.name, sku: before.sku, previousStock: before.inventoryCount,
    newStock: qty, delta: qty - before.inventoryCount, reason: 'manual_adjustment', referenceId: 'EXPRESS-ADMIN-API',
  });
  res.json(p);
}));

r.post('/inventory/batch-restock', requireAuth, requireAdmin, wrap(async (req, res) => {
  const units = Math.max(1, Math.floor(Number(req.body?.units) || 10));
  const low = await Product.find({ $expr: { $lte: ['$inventoryCount', '$lowStockThreshold'] } });
  for (const p of low) {
    const prev = p.inventoryCount;
    p.inventoryCount += units;
    await p.save();
    await AuditLog.create({
      productId: p._id, productName: p.name, sku: p.sku, previousStock: prev, newStock: p.inventoryCount,
      delta: units, reason: 'restock_batch', referenceId: `BATCH-RESTOCK-+${units}`,
    });
  }
  res.json({ count: low.length, updatedProducts: low });
}));

// ---------- Orders ----------
const PROMOS: Record<string, (sub: number) => number> = {
  MERN1000: () => 1000,
  STUDIO500: () => 500,
  WELCOME10: (sub) => Math.round(sub * 0.1),
};

const STEPS = [
  ['Placed', 'Order Placed', 'Order submitted with verified checkout payload.'],
  ['Confirmed', 'Order Confirmed & Stock Allocated', 'Payment authorized via gateway. Stock deducted atomically.'],
  ['Packed', 'Packed at Warehouse', 'Items grouped, protected, and assigned air waybill.'],
  ['Shipped', 'Dispatched to Courier', 'Handed over to carrier for inter-city transit.'],
  ['Out for Delivery', 'At Destination Hub', 'Out with delivery agent.'],
  ['Delivered', 'Delivered to Recipient', 'Signature verification confirmed.'],
] as const;
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

r.get('/orders', requireAuth, wrap(async (req, res) => {
  const filter = me(req).role === 'admin' ? {} : { userId: me(req)._id };
  res.json(await Order.find(filter).sort({ createdAt: -1 }));
}));

r.post('/orders', requireAuth, wrap(async (req, res) => {
  const { items, shippingAddress, paymentMethod, discountCode, simulatePaymentFailure } = req.body || {};
  if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'Cart is empty.');
  if (!['card', 'upi', 'net_banking', 'cod'].includes(paymentMethod)) throw new HttpError(400, 'Invalid payment method.');
  if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.pincode) throw new HttpError(400, 'Complete shipping address is required.');

  // Payment sandbox (IT-03 / IT-04): declined before any stock is touched
  if (simulatePaymentFailure && paymentMethod !== 'cod')
    throw new HttpError(402, 'Payment Gateway Error: Transaction declined by issuing bank sandbox.');

  const session = await mongoose.startSession();
  try {
    let order: any;
    await session.withTransaction(async () => {
      const nowIso = new Date().toISOString();
      const orderNumber = `ORD-${rand(10000, 100000)}`;
      const lines: any[] = [];
      let subtotal = 0;

      for (const it of items) {
        const qty = Math.floor(Number(it.quantity));
        if (!isOid(it.productId) || !(qty > 0)) throw new HttpError(400, 'Invalid cart item.');
        // atomic check-and-decrement: fails if stock is insufficient (UT-04 / IT-02), safe under concurrency
        const p = await Product.findOneAndUpdate(
          { _id: it.productId, inventoryCount: { $gte: qty } },
          { $inc: { inventoryCount: -qty } },
          { new: true, session }
        );
        if (!p) {
          const cur = await Product.findById(it.productId).session(session);
          throw new HttpError(409, cur
            ? `Insufficient stock: Only ${cur.inventoryCount} unit(s) available for "${cur.name}".`
            : `Product "${it.name}" not found in inventory catalogue.`);
        }
        subtotal += p.price * qty; // price always from DB, never from the client
        lines.push({ productId: p._id, sku: p.sku, name: p.name, price: p.price, quantity: qty, image: p.images[0] });
        await AuditLog.create([{
          productId: p._id, productName: p.name, sku: p.sku, previousStock: p.inventoryCount + qty,
          newStock: p.inventoryCount, delta: -qty, reason: 'order_placed', referenceId: orderNumber,
        }], { session });
      }

      const code = String(discountCode || '').toUpperCase();
      const discount = Math.min(subtotal, PROMOS[code]?.(subtotal) ?? 0);
      const tax = Math.round((subtotal - discount) * 0.08);
      const shippingFee = subtotal >= 1500 ? 0 : 99;
      const total = subtotal - discount + tax + shippingFee;
      const u = me(req);

      [order] = await Order.create([{
        orderNumber, userId: u._id,
        customerName: shippingAddress.fullName || u.name, customerEmail: shippingAddress.email || u.email,
        customerPhone: shippingAddress.phone || u.phone,
        shippingAddress, items: lines, subtotal, tax, shippingFee, discount,
        discountCode: PROMOS[code] ? code : undefined, total, paymentMethod, paymentStatus: 'paid',
        paymentTransactionId: `${paymentMethod.toUpperCase()}-TXN-${rand(10000000, 100000000)}`,
        orderStatus: 'Confirmed', trackingNumber: `EXP-IN-${rand(10000000, 100000000)}`,
        expectedDelivery: '3 to 5 business days', emailConfirmationSent: false,
        trackingHistory: STEPS.map(([status, label, note], i) => ({
          status, label, note, timestamp: i < 2 ? nowIso : '', completed: i < 2,
        })),
      }], { session });

      await Email.create([{
        to: order.customerEmail, subject: `Order Confirmation: ${orderNumber} - DIGITAL STORE`, orderNumber,
        body: `Hello ${order.customerName},\n\nYour order ${orderNumber} for ₹${total.toLocaleString('en-IN')} has been successfully confirmed. Tracking number: ${order.trackingNumber}.\nDelivery to: ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.pincode}.\n\nThank you for choosing DIGITAL STORE!`,
        deliveryStatus: 'queued',
      }], { session });
    });
    // Email is sent after the DB transaction commits: mail failure must not roll back an order.
    const confirmationText = `Hello ${order.customerName},\n\nYour order ${order.orderNumber} for ₹${order.total.toLocaleString('en-IN')} has been confirmed. Tracking number: ${order.trackingNumber}.\nDelivery to: ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.pincode}.\n\nThank you for choosing DIGITAL STORE!`;
    const emailSent = await sendGmailMessage(order.customerEmail, `Order Confirmation: ${order.orderNumber} - DIGITAL STORE`, confirmationText);
    order.emailConfirmationSent = emailSent;
    await order.save();
    await Email.updateOne({ orderNumber: order.orderNumber, subject: `Order Confirmation: ${order.orderNumber} - DIGITAL STORE` }, { $set: { deliveryStatus: emailSent ? 'sent' : 'failed' } });
    res.status(201).json(order);
  } finally {
    await session.endSession();
  }
}));

const CANCELLABLE = ['Placed', 'Confirmed', 'Packed'];

r.put('/orders/:id/status', requireAuth, wrap(async (req, res) => {
  const newStatus: string = req.body?.status;
  const allowed = [...STEPS.map((s) => s[0]), 'Cancelled'] as string[];
  if (!allowed.includes(newStatus)) throw new HttpError(400, 'Invalid order status.');

  const isAdmin = me(req).role === 'admin';
  if (!isAdmin && newStatus !== 'Cancelled') throw new HttpError(403, 'Only administrators can advance order status.');

  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const order = await Order.findOne(isOid(req.params.id) ? { _id: req.params.id } : { orderNumber: req.params.id }).session(session);
      if (!order) throw new HttpError(404, 'Order not found');
      if (!isAdmin && String(order.userId) !== String(me(req)._id)) throw new HttpError(403, 'You can only cancel your own orders.');

      if (newStatus === 'Cancelled') {
        if (!CANCELLABLE.includes(order.orderStatus))
          throw new HttpError(400, `Cannot cancel order: Order is already "${order.orderStatus}". Cancellation is only allowed before shipping.`);
        for (const it of order.items) {
          const p = await Product.findByIdAndUpdate(it.productId, { $inc: { inventoryCount: it.quantity! } }, { new: true, session });
          if (p) await AuditLog.create([{
            productId: p._id, productName: p.name, sku: p.sku, previousStock: p.inventoryCount - it.quantity!,
            newStock: p.inventoryCount, delta: it.quantity, reason: 'order_cancelled', referenceId: order.orderNumber,
          }], { session });
        }
      } else if (order.orderStatus === 'Cancelled') {
        throw new HttpError(400, 'Cancelled orders cannot be reopened.');
      }

      order.orderStatus = newStatus as any;
      const idx = STEPS.findIndex((s) => s[0] === newStatus);
      if (idx !== -1) {
        order.trackingHistory.forEach((s, i) => {
          if (i <= idx) { s.completed = true; if (!s.timestamp) s.timestamp = new Date().toISOString(); }
        });
      }
      await order.save({ session });
      result = order;
    });
    const statusSubject = `Order ${result.orderNumber}: ${newStatus} - DIGITAL STORE`;
    const statusBody = `Hello ${result.customerName},\n\nThe status of your order ${result.orderNumber} is now: ${newStatus}.\nTracking number: ${result.trackingNumber || 'Not yet assigned'}.\n\nThank you for choosing DIGITAL STORE!`;
    await Email.create({ to: result.customerEmail, subject: statusSubject, orderNumber: result.orderNumber, body: statusBody, deliveryStatus: 'queued' });
    const statusEmailSent = await sendGmailMessage(result.customerEmail, statusSubject, statusBody);
    await Email.updateOne({ orderNumber: result.orderNumber, subject: statusSubject }, { $set: { deliveryStatus: statusEmailSent ? 'sent' : 'failed' } });
    res.json(result);
  } finally {
    await session.endSession();
  }
}));

// ---------- Users ----------
r.put('/users/me', requireAuth, wrap(async (req, res) => {
  const u = me(req);
  if (typeof req.body?.name === 'string' && req.body.name.trim()) u.name = req.body.name.trim();
  if (typeof req.body?.phone === 'string') u.phone = req.body.phone;
  await u.save();
  res.json(u);
}));

r.post('/users/me/addresses', requireAuth, wrap(async (req, res) => {
  const u = me(req);
  const a = req.body || {};
  if (!a.line1 || !a.city || !a.pincode) throw new HttpError(400, 'Address line, city and pincode are required.');
  u.savedAddresses.push({ ...pick(a, ['fullName', 'email', 'phone', 'line1', 'city', 'state', 'pincode', 'country', 'isDefault']), addressId: `addr-${Date.now()}` });
  await u.save();
  res.status(201).json(u);
}));

r.delete('/users/me/addresses/:addressId', requireAuth, wrap(async (req, res) => {
  const u = me(req);
  u.savedAddresses = u.savedAddresses.filter((a: any) => a.addressId !== req.params.addressId) as any;
  await u.save();
  res.json(u);
}));

r.get('/users', requireAuth, requireAdmin, wrap(async (_req, res) => res.json(await User.find().sort({ _id: 1 }))));

r.put('/users/:id/status', requireAuth, requireAdmin, wrap(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, 'User not found');
  if (String(u._id) === String(me(req)._id)) throw new HttpError(400, 'You cannot block your own account.');
  u.status = u.status === 'active' ? 'blocked' : 'active';
  await u.save();
  res.json(u);
}));

// ---------- Logs, emails, reports ----------
r.get('/audit-logs', requireAuth, requireAdmin, wrap(async (_req, res) =>
  res.json(await AuditLog.find().sort({ timestamp: -1 }).limit(100))));

r.get('/emails', requireAuth, wrap(async (req, res) => {
  const filter = me(req).role === 'admin' ? {} : { to: me(req).email };
  res.json(await Email.find(filter).sort({ timestamp: -1 }).limit(100));
}));

r.get('/reports/sales', requireAuth, requireAdmin, wrap(async (_req, res) => {
  const [orders, products] = await Promise.all([Order.find(), Product.find({}, 'category')]);
  const cat = new Map(products.map((p) => [String(p._id), p.category]));
  const ok = orders.filter((o) => o.orderStatus !== 'Cancelled');
  const totalRevenue = ok.reduce((s, o) => s + (o.total || 0), 0);
  const categorySales: Record<string, { revenue: number; units: number }> = {};
  const top: Record<string, { name: string; sku: string; units: number; revenue: number }> = {};
  for (const o of ok) for (const it of o.items) {
    const c = cat.get(String(it.productId)) || 'General';
    const line = (it.price || 0) * (it.quantity || 0);
    (categorySales[c] ||= { revenue: 0, units: 0 }).revenue += line;
    categorySales[c].units += it.quantity || 0;
    const t = (top[String(it.productId)] ||= { name: it.name!, sku: it.sku!, units: 0, revenue: 0 });
    t.units += it.quantity || 0; t.revenue += line;
  }
  res.json({
    totalRevenue, totalOrders: orders.length, successfulOrders: ok.length,
    cancelledOrders: orders.length - ok.length,
    averageOrderValue: ok.length ? Math.round(totalRevenue / ok.length) : 0,
    categorySales, topSelling: Object.values(top).sort((a, b) => b.units - a.units).slice(0, 5),
  });
}));

// Reset to seed data (admin). Used by the inspector's "reset database" button.
r.post('/admin/reset', requireAuth, requireAdmin, wrap(async (_req, res) => {
  await seedDatabase(true);
  res.json({ success: true });
}));

export default r;
