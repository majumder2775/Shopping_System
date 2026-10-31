import bcrypt from 'bcryptjs';
import { Product, User, Order, AuditLog, Email } from './models';
import {
  INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS, INITIAL_AUDIT_LOGS, INITIAL_EMAILS,
} from './seed-data';

export const DEMO_PASSWORD = 'Shop@1234';

export async function seedDatabase(force = false) {
  if (!force && (await Product.estimatedDocumentCount()) > 0) return false;

  await Promise.all([Product.deleteMany({}), User.deleteMany({}), Order.deleteMany({}), AuditLog.deleteMany({}), Email.deleteMany({})]);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await Product.insertMany(INITIAL_PRODUCTS);
  await User.insertMany(INITIAL_USERS.map(({ token, ...u }) => ({ ...u, passwordHash })));
  await Order.insertMany(INITIAL_ORDERS);
  await AuditLog.insertMany(INITIAL_AUDIT_LOGS);
  await Email.insertMany(INITIAL_EMAILS.map(({ id, ...e }) => e));
  return true;
}
