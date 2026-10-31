import React from 'react';
import { useShop } from '../context/ShopContext';
import { Database, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsMernInspectorOpen, currentUser } = useShop();

  return (
    <footer className="mt-20 border-t border-neutral-800 bg-[#0a0a0c] text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-850">
          {/* Brand Col */}
          <div className="space-y-3">
            <span className="text-base font-serif tracking-widest uppercase text-white font-semibold block">
              DIGITAL STORE
            </span>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-xs">
              Your destination for laptops, phones, audio, displays, printers and everyday electronics.
            </p>
            <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Electronics for work, study & home</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <div className="font-mono uppercase text-neutral-400 text-[11px]">Storefront Navigation</div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Browse Electronics
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Order Tracking & History
                </button>
              </li>
              {currentUser?.role === 'admin' && (
                <>
                  <li>
                    <button
                      onClick={() => setCurrentView('inventory')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Inventory & Stock Control
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentView('reports')}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Sales & Revenue Reports
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Operational Standards */}
          <div className="space-y-2.5">
            <div className="font-mono uppercase text-neutral-400 text-[11px]">Payment & Logistics (INR)</div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>UPI, Net Banking, Cards & COD (FR11)</li>
              <li>Free Shipping across India over ₹1,500</li>
              <li>Pre-shipment Cancellation & Stock Restoral (FR16)</li>
              <li>GST Compliant Tax Breakdown</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-mono uppercase text-neutral-400 text-[11px]">Store Information</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">Shop technology from everyday essentials to home entertainment, with secure checkout and order tracking.</p>
            <button onClick={() => setIsMernInspectorOpen(true)} className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs flex items-center gap-2 cursor-pointer transition-colors"><Database className="w-3.5 h-3.5 text-amber-400" /><span>Store Data</span></button>
          </div>
        </div>

        {/* Quiet Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            &copy; 2026 DIGITAL STORE · Electronics & Technology
          </div>
          <div className="flex items-center gap-4">
            <span>Currency: INR (₹)</span>
            <span aria-hidden="true">·</span>
            <span>Three-Tier Architecture (SDD 2.1)</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB + Express + React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
