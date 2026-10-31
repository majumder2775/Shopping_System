import mongoose, { Schema } from 'mongoose';

const OID = Schema.Types.ObjectId;

// Adds the id aliases the frontend expects (productId / orderId / userId) and strips internals
const toJSON = (alias?: string, hide: string[] = []) => ({
  virtuals: false,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret._id = String(ret._id);
    if (alias) ret[alias] = ret._id;
    hide.forEach((k) => delete ret[k]);
    return ret;
  },
});

const addressSchema = new Schema(
  {
    addressId: String,
    fullName: String,
    email: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    isDefault: Boolean,
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    reviewId: String,
    userId: OID,
    userName: String,
    productId: OID,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: Number,
    inventoryCount: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
    images: [String],
    description: { type: String, default: '' },
    features: [String],
    dimensions: String,
    materials: String,
    warranty: String,
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: toJSON('productId') }
);
productSchema.index({ name: 'text', brand: 'text', description: 'text', sku: 'text' });

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    // Optional for accounts created through Google OAuth.
    passwordHash: { type: String, required: false, select: true },
    googleId: { type: String, unique: true, sparse: true, index: true },
    avatar: String,
    savedAddresses: [addressSchema],
  },
  { timestamps: true, toJSON: toJSON('userId', ['passwordHash', 'createdAt', 'updatedAt']) }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: OID, ref: 'User', required: true, index: true },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    shippingAddress: addressSchema,
    items: [
      {
        _id: false,
        productId: OID,
        sku: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: Number,
    tax: Number,
    shippingFee: Number,
    discount: Number,
    discountCode: String,
    total: Number,
    paymentMethod: { type: String, enum: ['card', 'upi', 'net_banking', 'cod'] },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
    paymentTransactionId: String,
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    trackingNumber: String,
    expectedDelivery: String,
    trackingHistory: [
      { _id: false, status: String, label: String, timestamp: String, note: String, completed: Boolean },
    ],
    emailConfirmationSent: Boolean,
  },
  { timestamps: true, toJSON: toJSON('orderId') }
);

const auditLogSchema = new Schema(
  {
    productId: OID,
    productName: String,
    sku: String,
    previousStock: Number,
    newStock: Number,
    delta: Number,
    reason: String,
    referenceId: String,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { toJSON: toJSON() }
);

const emailSchema = new Schema(
  {
    to: { type: String, index: true },
    subject: String,
    orderNumber: String,
    body: String,
    deliveryStatus: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    timestamp: { type: Date, default: Date.now },
  },
  { toJSON: toJSON('id') }
);

export const Product = mongoose.model('Product', productSchema);
export const User = mongoose.model('User', userSchema);
export const Order = mongoose.model('Order', orderSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export const Email = mongoose.model('Email', emailSchema);
