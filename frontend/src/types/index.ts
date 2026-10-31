export type ProductCategory =
  | 'All'
  | 'Laptops & Computers'
  | 'Mobile Phones'
  | 'Audio & Headphones'
  | 'TVs & Displays'
  | 'Printers & Scanners'
  | 'Accessories'
  | 'Home Electronics';

export interface ProductReview {
  reviewId: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string; // MongoDB ObjectId representation
  productId?: string; // SDD class attribute alias
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // in INR (₹)
  compareAtPrice?: number;
  inventoryCount: number; // stock
  lowStockThreshold: number;
  rating: number; // avgRating
  reviewCount: number;
  reviews?: ProductReview[];
  images: string[];
  description: string;
  features: string[];
  dimensions?: string;
  materials?: string;
  warranty?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

// SDD Figure 6 Order state diagram states
export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

// FR11: card, UPI, net banking and Cash on Delivery
export type PaymentMethod = 'card' | 'upi' | 'net_banking' | 'cod';

export interface Address {
  addressId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export type ShippingAddress = Address;

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note: string;
  completed: boolean;
}

export interface Order {
  _id: string; // MongoDB ObjectId format (24 hex characters)
  orderId?: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  discountCode?: string;
  total: number; // in INR (₹)
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  trackingNumber: string;
  expectedDelivery: string;
  trackingHistory: TrackingStep[];
  emailConfirmationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string;
  avatar?: string;
  savedAddresses: Address[];
  token?: string;
}

export interface InventoryAuditLog {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  delta: number;
  reason: 'order_placed' | 'order_cancelled' | 'manual_adjustment' | 'restock_batch' | 'product_created' | 'product_edited';
  referenceId: string;
  timestamp: string;
}

export interface MernApiLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  requestBody?: any;
  responseBody?: any;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  orderNumber: string;
  body: string;
  deliveryStatus?: 'queued' | 'sent' | 'failed';
  timestamp: string;
}

export interface TestCaseResult {
  id: string;
  category: 'Unit' | 'Integration' | 'System' | 'Acceptance';
  title: string;
  input: string;
  expectedResult: string;
  actualResult: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

