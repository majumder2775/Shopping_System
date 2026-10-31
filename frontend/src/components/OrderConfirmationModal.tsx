import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, Package, Printer, ArrowRight, X, Clock, MapPin, MailCheck } from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const { confirmedOrder, setConfirmedOrder, setCurrentView, setIsEmailInboxOpen } = useShop();

  if (!confirmedOrder) return null;

  const handleGoToOrderHistory = () => {
    setConfirmedOrder(null);
    setCurrentView('orders');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setConfirmedOrder(null)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-900/80 rounded-full border border-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Celebration Stage */}
        <div className="p-8 text-center bg-gradient-to-b from-neutral-900 to-[#111215] border-b border-neutral-800">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-serif text-white">
            Thank you for your order, {confirmedOrder.customerName.split(' ')[0]}.
          </h2>

          <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
            Your studio purchase is verified and committed to the MongoDB database. Stock has been reduced and a confirmation email has been dispatched.
          </p>

          <div className="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            <span>Order Reference: <strong className="text-amber-300">{confirmedOrder.orderNumber}</strong></span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400 text-[10px]">Air Waybill: {confirmedOrder.trackingNumber}</span>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Email Confirmation notification badge (FR13) */}
          <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl flex items-center justify-between text-xs text-sky-300">
            <div className="flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-sky-400" />
              <span>Confirmation email sent to {confirmedOrder.customerEmail} (FR13 / IT-06)</span>
            </div>
            <button
              onClick={() => setIsEmailInboxOpen(true)}
              className="text-[11px] underline font-mono cursor-pointer hover:text-sky-200"
            >
              View In Email Inbox
            </button>
          </div>

          {/* Items Summary */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
              Ordered Items ({confirmedOrder.items.length})
            </div>
            <div className="divide-y divide-neutral-800/80 rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-medium text-neutral-200 truncate">{item.name}</div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {item.sku} · Qty {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-neutral-200 tabular-nums font-semibold shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Address Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
              <div className="font-mono uppercase text-neutral-500 text-[10px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Shipping Destination (India)</span>
              </div>
              <div className="text-neutral-200 font-medium">{confirmedOrder.customerName}</div>
              <div className="text-neutral-400 leading-relaxed text-[11px]">
                {confirmedOrder.shippingAddress.line1}
                <br />
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.pincode}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
              <div className="font-mono uppercase text-neutral-500 text-[10px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Payment & Delivery Timeline</span>
              </div>
              <div className="text-neutral-200 font-medium">Expected Delivery: 3–5 Business Days</div>
              <div className="text-neutral-400 text-[11px]">
                Payment: <span className="uppercase text-emerald-400 font-mono font-semibold">{confirmedOrder.paymentMethod.replace('_', ' ')}</span> ({confirmedOrder.paymentStatus})
              </div>
              {confirmedOrder.paymentTransactionId && (
                <div className="text-[10px] font-mono text-neutral-500 truncate">
                  Txn ID: {confirmedOrder.paymentTransactionId}
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown in INR */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-1.5 text-xs font-mono text-neutral-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums text-neutral-200">₹{confirmedOrder.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {confirmedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({confirmedOrder.discountCode || 'Applied'})</span>
                <span className="tabular-nums">-₹{confirmedOrder.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (8%)</span>
              <span className="tabular-nums text-neutral-200">₹{confirmedOrder.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="tabular-nums text-neutral-200">
                {confirmedOrder.shippingFee === 0 ? 'Complimentary' : `₹${confirmedOrder.shippingFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-semibold text-white">
              <span>Total Paid</span>
              <span className="tabular-nums text-amber-300 font-bold">₹{confirmedOrder.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setConfirmedOrder(null)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Back to Catalogue
              </button>
              <button
                onClick={handleGoToOrderHistory}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Track in Orders (FR14)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
