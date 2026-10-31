import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { db, mernApi } from '../services/api';
import {
  Database,
  Terminal,
  Code2,
  X,
  RotateCcw,
  Check,
  Copy,
  Server,
  Mail,
} from 'lucide-react';

export const MernInspectorDrawer: React.FC = () => {
  const { isMernInspectorOpen, setIsMernInspectorOpen, showToast, dbVersion } = useShop();
  const [activeTab, setActiveTab] = useState<'collections' | 'network' | 'schema'>('collections');
  const [selectedCollection, setSelectedCollection] = useState<'products' | 'orders' | 'users' | 'audit_logs' | 'emails'>('products');
  const [copied, setCopied] = useState(false);

  if (!isMernInspectorOpen) return null;

  void dbVersion;
  const rawDb = db.getRawDbDump();
  const apiLogs = db.getApiLogs();

  const handleCopyJson = () => {
    const data = (rawDb as any)[selectedCollection];
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    showToast(`Copied ${selectedCollection} JSON to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetDb = async () => {
    if (!confirm('Reset the MongoDB Atlas database to the default seed data? This deletes all current data.')) return;
    try {
      await mernApi.resetDatabase();
      showToast('MongoDB database reset to initial seed state.');
    } catch (err: any) {
      showToast(err.message || 'Reset failed (admin only).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/80 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0d0e11] border-l border-neutral-800 flex flex-col h-full shadow-2xl text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>MERN Architecture & Database Inspector</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                  Mongo + Express (INR ₹)
                </span>
              </h2>
              <div className="text-[11px] font-mono text-neutral-400">
                Live document store & Express REST route monitor
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMernInspectorOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 px-5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('collections')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'collections'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB Collections</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'network'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Express API Calls ({apiLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'schema'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mongoose Schemas</span>
          </button>
        </div>

        {/* Tab 1: MongoDB Collections */}
        {activeTab === 'collections' && (
          <div className="flex-1 overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Collection Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-mono">
                <button
                  onClick={() => setSelectedCollection('products')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    selectedCollection === 'products'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  products ({rawDb.productsCount})
                </button>
                <button
                  onClick={() => setSelectedCollection('orders')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    selectedCollection === 'orders'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  orders ({rawDb.ordersCount})
                </button>
                <button
                  onClick={() => setSelectedCollection('users')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    selectedCollection === 'users'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  users ({rawDb.usersCount})
                </button>
                <button
                  onClick={() => setSelectedCollection('audit_logs')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    selectedCollection === 'audit_logs'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  audit_logs ({rawDb.auditLogsCount})
                </button>
                <button
                  onClick={() => setSelectedCollection('emails')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    selectedCollection === 'emails'
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  emails ({rawDb.emailsCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={handleResetDb}
                  className="px-3 py-1 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800 rounded text-xs font-mono text-rose-300 flex items-center gap-1.5 cursor-pointer"
                  title="Reset DB to initial seed"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset DB</span>
                </button>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-neutral-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify((rawDb as any)[selectedCollection], null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Express API Route Network Logs */}
        {activeTab === 'network' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pb-2 border-b border-neutral-800">
              <span>Recent Express REST Calls</span>
              <button
                onClick={() => db.clearApiLogs()}
                className="text-[11px] text-neutral-500 hover:text-white cursor-pointer"
              >
                Clear Stream
              </button>
            </div>

            {apiLogs.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-500 font-mono">
                No recent API requests. Browse products or add items to trigger REST calls.
              </div>
            ) : (
              apiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          log.method === 'GET'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : log.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-white font-medium">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span
                        className={
                          log.statusCode >= 400 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                        }
                      >
                        HTTP {log.statusCode}
                      </span>
                      <span className="text-neutral-500">{log.durationMs}ms</span>
                    </div>
                  </div>

                  {log.requestBody && (
                    <div className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2 rounded border border-neutral-850">
                      <span className="text-neutral-500 block mb-0.5">Payload:</span>
                      <pre className="text-neutral-300 truncate">
                        {JSON.stringify(log.requestBody)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Mongoose Schemas & Full-Stack Architecture */}
        {activeTab === 'schema' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-amber-400 font-semibold flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>DIGITAL STORE Architecture (INR ₹)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                <strong>MongoDB:</strong> Document collections (`products`, `orders`, `users`, `audit_logs`, `emails`) featuring 24-character hexadecimal `_id` ObjectIDs, atomic stock decrement transactions, and inventory ledger trails in Indian Rupee pricing.
                <br /><br />
                <strong>Express & Node.js:</strong> Controller layer handling REST endpoints (`/api/products`, `/api/orders`, `/api/inventory/:id`, `/api/auth/register`, `/api/reports/sales`) with input validation, error trapping, and simulated JWT tokens.
                <br /><br />
                <strong>React:</strong> State-driven e-commerce interface with responsive catalog discovery, shopping bag calculations, live carrier tracking, and inventory management.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-neutral-400 font-semibold uppercase text-[11px]">
                Product Mongoose Schema Definition
              </div>
              <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-emerald-400 text-[11px] overflow-x-auto">
{`const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, enum: ['Laptops & Computers', 'Mobile Phones', 'Audio & Headphones', 'TVs & Displays', 'Printers & Scanners', 'Accessories', 'Home Electronics'] },
  price: { type: Number, required: true, min: 0 }, // in INR (₹)
  inventoryCount: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  reviews: [{
    reviewId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: Number,
    comment: String
  }],
  images: [{ type: String }],
  description: { type: String }
}, { timestamps: true });`}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="text-neutral-400 font-semibold uppercase text-[11px]">
                Order Transaction Mongoose Schema
              </div>
              <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sky-400 text-[11px] overflow-x-auto">
{`const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: String,
    name: String,
    price: Number, // in INR
    quantity: Number
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'net_banking', 'cod'] },
  orderStatus: { type: String, enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] },
  trackingNumber: String
}, { timestamps: true });`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
