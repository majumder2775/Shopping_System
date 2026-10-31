import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartDiscount,
    appliedPromo,
    applyPromoCode,
    cartTotal,
    setIsCheckoutOpen,
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoFeedback(res.message);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f1012] border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Shopping Cart
              </h2>
              <span className="text-xs font-mono text-neutral-400">({cartCount} items)</span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-500 hover:text-rose-400 transition-colors mr-2 cursor-pointer"
                >
                  Empty
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Complimentary Shipping Progress in INR */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800/80 text-xs">
              {remainingForFreeShipping > 0 ? (
                <p className="text-neutral-300">
                  Add <span className="font-mono text-amber-300 font-semibold">₹{remainingForFreeShipping.toLocaleString('en-IN')}</span> more for complimentary express delivery across India.
                </p>
              ) : (
                <p className="text-amber-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Unlocked complimentary express courier shipping!
                </p>
              )}
              <div className="mt-2 w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List (FR7, FR8) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-neutral-400 text-sm">Your cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition-colors cursor-pointer"
                >
                  Explore Studio Catalogue
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 bg-neutral-900/40 border border-neutral-800/70 rounded-xl"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-950 shrink-0 border border-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-medium text-neutral-100 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                      {item.product.sku}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity stepper (FR8) */}
                      <div className="flex items-center border border-neutral-800 rounded bg-neutral-950">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Total updates automatically (FR8) in INR */}
                      <div className="font-mono text-xs font-semibold text-white tabular-nums">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Financial Summary in INR (₹) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-950 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. MERN1000)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {promoFeedback && (
                <div className="text-[11px] font-mono text-amber-300">{promoFeedback}</div>
              )}

              {/* Financial Breakdown in INR */}
              <div className="space-y-1.5 text-xs text-neutral-400 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-neutral-200">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedPromo})</span>
                    <span className="tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (8%)</span>
                  <span className="tabular-nums text-neutral-200">
                    ₹{cartTax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="tabular-nums text-neutral-200">
                    {cartShipping === 0 ? 'COMPLIMENTARY' : `₹${cartShipping}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-semibold text-white">
                  <span>Grand Total</span>
                  <span className="tabular-nums font-mono text-amber-300 font-bold">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>UPI, Cards, Net Banking & COD with real-time stock lock</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
