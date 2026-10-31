import { Product, Order, User, InventoryAuditLog, EmailNotification } from './types';

export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + random).substring(0, 24);
}

const now = new Date().toISOString();
const catalogue = [
  ['DST-LP-001','Everyday 15.6-inch Laptop','TechCore','Laptops & Computers',48990,12,'A reliable 15.6-inch laptop for study, office work and everyday multitasking.'],
  ['DST-LP-002','Performance 14-inch Laptop','TechCore','Laptops & Computers',72990,8,'A compact performance laptop designed for productivity and travel.'],
  ['DST-MB-003','5G Android Smartphone 128GB','Nova Mobile','Mobile Phones',18999,24,'A 5G smartphone with a vivid display, capable camera and all-day battery.'],
  ['DST-MB-004','Smartphone 256GB','Nova Mobile','Mobile Phones',32999,15,'A responsive smartphone with ample storage for apps, photos and media.'],
  ['DST-AU-005','Wireless Over-Ear Headphones','SonicWave','Audio & Headphones',3999,30,'Comfortable wireless headphones for music, calls and commuting.'],
  ['DST-AU-006','True Wireless Earbuds','SonicWave','Audio & Headphones',2499,36,'Compact true wireless earbuds with a pocket-sized charging case.'],
  ['DST-TV-007','43-inch 4K Smart LED TV','ViewMax','TVs & Displays',27990,10,'A 4K smart television for streaming, entertainment and everyday viewing.'],
  ['DST-TV-008','27-inch Full HD Monitor','ViewMax','TVs & Displays',11990,14,'A sharp Full HD monitor for home offices, learning and entertainment.'],
  ['DST-PR-009','All-in-One Wi-Fi Inkjet Printer','PrintPro','Printers & Scanners',6499,11,'Print, scan and copy documents from a compact home-office printer.'],
  ['DST-PR-010','Wireless Laser Printer','PrintPro','Printers & Scanners',12499,7,'A practical monochrome laser printer for frequent document printing.'],
  ['DST-AC-011','65W USB-C Fast Charger','Connectix','Accessories',1299,40,'A compact USB-C fast charger for compatible phones, tablets and laptops.'],
  ['DST-AC-012','USB-C Hub 7-in-1','Connectix','Accessories',2199,28,'Expand a compatible laptop with HDMI, USB and card-reader connectivity.'],
  ['DST-AC-013','Wireless Keyboard and Mouse Combo','Connectix','Accessories',1799,22,'A wireless keyboard and mouse set for a clean desk setup.'],
  ['DST-HE-014','1.5 Ton Inverter Air Conditioner','HomeTech','Home Electronics',34990,6,'An inverter air conditioner designed for efficient room cooling.'],
  ['DST-HE-015','Convection Microwave Oven','HomeTech','Home Electronics',9990,9,'A versatile microwave for reheating, cooking and everyday kitchen use.'],
] as const;

export const INITIAL_PRODUCTS: Product[] = catalogue.map((p, i) => ({
  _id: `6720fc8a9b3e1a001f01${String(i + 1).padStart(4, '0')}`,
  productId: `6720fc8a9b3e1a001f01${String(i + 1).padStart(4, '0')}`,
  sku: p[0], name: p[1], brand: p[2], category: p[3], price: p[4],
  inventoryCount: p[5], lowStockThreshold: 4, rating: 0, reviewCount: 0,
  reviews: [], images: [], description: p[6],
  features: ['Manufacturer warranty', 'Product support', 'Secure checkout'],
  warranty: 'Manufacturer warranty applies; refer to product documentation.',
  featured: i < 6, createdAt: now, updatedAt: now,
}));

// A new installation starts without fabricated customer accounts, orders, reviews or audit history.
export const INITIAL_USERS: User[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_AUDIT_LOGS: InventoryAuditLog[] = [];
export const INITIAL_EMAILS: EmailNotification[] = [];
