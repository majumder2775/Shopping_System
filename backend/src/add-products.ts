import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, Order, User, AuditLog, Email } from './models';
import { INITIAL_PRODUCTS } from './seed-data';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to your backend .env file.');

async function main() {
  await mongoose.connect(MONGODB_URI!);
  await Product.init();
  const allowedSkus = INITIAL_PRODUCTS.map((p) => p.sku);
  for (const product of INITIAL_PRODUCTS) {
    const { _id, productId, ...fields } = product;
    await Product.updateOne({ sku: product.sku }, { $set: fields, $setOnInsert: { _id } }, { upsert: true });
  }
  const removedProducts = await Product.deleteMany({ sku: { $nin: allowedSkus } });
  // Remove only the known sample records shipped with the original storefront.
  const removedOrders = await Order.deleteMany({ orderNumber: 'ORD-98241' });
  const removedEmails = await Email.deleteMany({ subject: /ORD-98241|Aura Atelier/i });
  const removedUsers = await User.deleteMany({ email: { $in: ['alex@atelier.in', 'rohan@atelier.in'] } });
  await AuditLog.deleteMany({ productName: /carafe|weekender|ceramic|Aura Horizon/i });
  console.log(`DIGITAL STORE catalogue synced: ${INITIAL_PRODUCTS.length} electronics products.`);
  console.log(`Removed ${removedProducts.deletedCount} non-catalogue products, ${removedOrders.deletedCount} sample orders, ${removedEmails.deletedCount} sample emails and ${removedUsers.deletedCount} sample customer accounts.`);
  console.log('Real customer accounts and orders outside the original sample records were left intact.');
  await mongoose.disconnect();
}
main().catch(async (error) => {
  console.error('Could not sync DIGITAL STORE catalogue:', error.message);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
