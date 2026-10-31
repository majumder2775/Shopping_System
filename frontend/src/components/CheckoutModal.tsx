import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { mernApi } from '../services/api';
import { Address, PaymentMethod, OrderItem } from '../types';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Truck,
  CheckCircle2,
  Lock,
  Loader2,
  AlertTriangle,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartDiscount,
    appliedPromo,
    cartTotal,
    currentUser,
    setIsAuthModalOpen,
    setConfirmedOrder,
    showToast,
    paymentSimulationSuccess,
    setPaymentSimulationSuccess,
  } = useShop();

  const [shipping, setShipping] = useState<Address>({
    addressId: 'addr-active',
    fullName: currentUser?.name || 'Alex Morgan',
    email: currentUser?.email || 'alex@atelier.in',
    phone: currentUser?.phone || '+91 98765 43210',
    line1: currentUser?.savedAddresses?.[0]?.line1 || 'Flat 402, Prestige Tower, Indiranagar',
    city: currentUser?.savedAddresses?.[0]?.city || 'Bengaluru',
    state: currentUser?.savedAddresses?.[0]?.state || 'Karnataka',
    pincode: currentUser?.savedAddresses?.[0]?.pincode || '560038',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // Payment method specific fields (FR11)
  const [upiId, setUpiId] = useState('alex@oksbi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 8920 1024 8824');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('412');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSelectSavedAddress = (addr: Address) => {
    setShipping({
      ...addr,
      fullName: currentUser?.name || addr.fullName,
      email: currentUser?.email || addr.email,
      phone: currentUser?.phone || addr.phone,
    });
    showToast(`Applied saved address: ${addr.city}`);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!shipping.fullName || !shipping.email || !shipping.line1 || !shipping.city || !shipping.pincode) {
      setErrorMessage('Please fill in all mandatory shipping address fields including Pincode.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (!currentUser) {
      setErrorMessage('Please sign in to place your order.');
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.productId,
        sku: item.product.sku,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
      }));

      // Call MERN backend REST API
      const order = await mernApi.createOrder({
        userId: currentUser?._id || 'guest_user',
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        shippingAddress: shipping,
        items: orderItems,
        subtotal: cartSubtotal,
        tax: cartTax,
        shippingFee: cartShipping,
        discount: cartDiscount,
        discountCode: appliedPromo || undefined,
        total: cartTotal,
        paymentMethod,
      });

      // Clear cart, close checkout, trigger confirmation
      clearCart();
      setIsCheckoutOpen(false);
      setConfirmedOrder(order);
      showToast(`Order ${order.orderNumber} placed & confirmed! Stock reduced.`);
    } catch (err: any) {
      // Payment failure or stock error handling (FR12, IT-04)
      setErrorMessage(err.message || 'Transaction failed. Gateway declined payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white tracking-wide">
              Secure Checkout & Order Placement (INR ₹)
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCompleteOrder} className="p-6 space-y-6">
          {/* Saved Addresses Selector (FR9) */}
          {currentUser && currentUser.savedAddresses && currentUser.savedAddresses.length > 0 && (
            <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Select from Saved Addresses (FR3 / FR9):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentUser.savedAddresses.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    {addr.city} ({addr.pincode})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Shipping Address (FR9) */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" />
              <span>01. Delivery Address (India)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email (Order Confirmation FR13) *</label>
                <input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={shipping.pincode}
                  onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-400 mb-1">Street Address (Line 1) *</label>
                <input
                  type="text"
                  required
                  value={shipping.line1}
                  onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Methods (FR11) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>02. Payment Gateway (FR11)</span>
              </div>

              {/* Payment Status */}
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-neutral-500">Gateway Sandbox:</span>
                <button
                  type="button"
                  onClick={() => setPaymentSimulationSuccess(!paymentSimulationSuccess)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    paymentSimulationSuccess
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                  title="Toggle payment outcome to test IT-03 (success) or IT-04 (failure)"
                >
                  {paymentSimulationSuccess ? 'Simulate Success (IT-03)' : 'Simulate Failure (IT-04)'}
                </button>
              </div>
            </div>

            {/* 4 Supported Payment Methods (FR11: card, UPI, net banking, Cash on Delivery) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  paymentMethod === 'upi'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  paymentMethod === 'net_banking'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  paymentMethod === 'cod'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* UPI Details */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Enter UPI ID (Google Pay, PhonePe, Paytm, BHIM)</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okhdfcbank"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Instant sandbox authorization on submit</span>
                </div>
              </div>
            )}

            {/* Net Banking Details */}
            {paymentMethod === 'net_banking' && (
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash on Delivery Details */}
            {paymentMethod === 'cod' && (
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-semibold">Cash on Delivery (COD) Selected</div>
                <div className="text-neutral-400 text-[11px]">
                  Please keep exact cash amount of ₹{cartTotal.toLocaleString('en-IN')} ready for the courier agent upon arrival. Stock is reserved immediately.
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Final Submission in INR (₹) */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 font-mono w-full sm:w-auto">
              <div>
                Total Due:{' '}
                <span className="text-base font-bold text-amber-300 tabular-nums">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>{' '}
                ({cart.length} items)
              </div>
              <div className="text-[11px] text-neutral-500">
                Atomic MongoDB transaction with stock reduction
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 text-neutral-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment & Stock...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Place Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
