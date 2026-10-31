import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { db, mernApi } from '../services/api';
import { Order, OrderStatus } from '../types';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Shield,
  Send,
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const { currentUser, dbVersion, addToCart, showToast, setCurrentView } = useShop();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Fetch orders
  void dbVersion;
  const orders = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return db.getOrders(); // Admin views all store orders (FR20)
    }
    return db.getOrders(currentUser?._id); // Customer views their past orders (FR15)
  }, [currentUser, dbVersion]);

  // Cancel order (FR16, UT-05, IT-05)
  const handleCancelOrder = async (order: Order) => {
    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Out for Delivery' || order.orderStatus === 'Delivered') {
      showToast(`Cannot cancel: Order is already "${order.orderStatus}". Cancellation only allowed before shipping.`);
      return;
    }

    if (
      !confirm(
        `Cancel order ${order.orderNumber}? Items will be automatically returned to MongoDB inventory catalog (IT-05).`
      )
    ) {
      return;
    }

    try {
      await mernApi.updateOrderStatus(order._id, 'Cancelled');
      showToast(`Order ${order.orderNumber} cancelled. Stock restored in warehouse.`);
    } catch (err: any) {
      showToast(`Cancellation error: ${err.message}`);
    }
  };

  // Admin status update (FR20)
  const handleAdminStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await mernApi.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to: ${newStatus}`);
    } catch (err: any) {
      showToast(`Status update error: ${err.message}`);
    }
  };

  const handleReorder = (order: Order) => {
    let count = 0;
    for (const item of order.items) {
      const prod = db.getProductById(item.productId);
      if (prod && prod.inventoryCount > 0) {
        addToCart(prod, item.quantity);
        count++;
      }
    }
    if (count > 0) {
      showToast(`Re-added items from order ${order.orderNumber} to cart.`);
    } else {
      showToast('Items from this order are currently out of stock.');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 'text-sky-300 bg-sky-950/60 border-sky-800/60';
      case 'Confirmed':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'Packed':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'Shipped':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60';
      case 'Out for Delivery':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
      case 'Cancelled':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      default:
        return 'text-neutral-400 bg-neutral-900 border-neutral-800';
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-serif text-white tracking-wide">
            {currentUser?.role === 'admin' ? 'Store Orders & Dispatch Operations (FR20)' : 'Order History & Real-Time Tracking (FR14, FR15)'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tracking lifecycle adhering to SDD State Diagram Figure 6: Placed &rarr; Confirmed &rarr; Packed &rarr; Shipped &rarr; Out for Delivery &rarr; Delivered.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span>Active User:</span>
          <span className="text-amber-300 font-medium">{currentUser?.name || 'Guest'}</span>
          <span className="text-neutral-600">·</span>
          <span>{orders.length} Total Orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center text-neutral-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-medium text-neutral-200">No Orders in Record</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Browse our handcrafted collection and place your first order.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('shop')}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors cursor-pointer"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const canCancel =
              order.orderStatus === 'Placed' ||
              order.orderStatus === 'Confirmed' ||
              order.orderStatus === 'Packed';

            return (
              <div
                key={order._id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Collapsed Bar / Summary Header */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-850/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">Order Ref</div>
                      <div className="font-mono font-semibold text-white mt-0.5">
                        {order.orderNumber}
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">Placed Date</div>
                      <div className="text-neutral-300 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">Total Amount (₹)</div>
                      <div className="font-mono font-semibold text-amber-300 mt-0.5 tabular-nums">
                        ₹{order.total.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">Customer</div>
                      <div className="text-neutral-300 mt-0.5 truncate max-w-[140px]">
                        {order.customerName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <button
                      className="p-1 text-neutral-400 hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Fulfillment Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-neutral-800/80 bg-neutral-950/60 space-y-6 animate-fade-in">
                    {/* Admin Status Transition Control (FR20) */}
                    {currentUser?.role === 'admin' && order.orderStatus !== 'Cancelled' && (
                      <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
                        <div className="text-xs font-mono uppercase text-amber-300 flex items-center gap-1.5 font-semibold">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Order Status Dispatch Controls (FR20)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {(['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleAdminStatusChange(order._id, st)}
                                className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                                  order.orderStatus === st
                                    ? 'bg-amber-400 text-neutral-950 font-bold'
                                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Carrier Tracking Stepper (FR14) */}
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center justify-between">
                        <span>Fulfillment Timeline · Carrier: BlueDart / FedEx India</span>
                        <span className="text-neutral-500 text-[11px]">
                          AWB: {order.trackingNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {order.trackingHistory.map((step, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs space-y-1 ${
                              step.completed
                                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                                : 'bg-neutral-950/40 border-neutral-850 text-neutral-600'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                              <span>Step {idx + 1}</span>
                              {step.completed ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                              )}
                            </div>
                            <div className="font-semibold text-neutral-100 text-[11px] truncate">
                              {step.label}
                            </div>
                            <div className="text-[10px] text-neutral-400 leading-tight line-clamp-2">
                              {step.note}
                            </div>
                            {step.timestamp && (
                              <div className="text-[9px] font-mono text-neutral-500 pt-1">
                                {new Date(step.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Purchased Items List */}
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                        Items in this Shipment
                      </div>
                      <div className="divide-y divide-neutral-800 rounded-lg border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="p-3.5 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                              />
                              <div>
                                <div className="font-medium text-neutral-200">{item.name}</div>
                                <div className="text-[11px] font-mono text-neutral-500">
                                  SKU: {item.sku} · Qty: {item.quantity} · Price: ₹{item.price.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                            <div className="font-mono font-semibold text-neutral-100 tabular-nums">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics and Actions Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-neutral-400">
                        <span className="font-mono text-neutral-500">Delivery Address: </span>
                        <span>
                          {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Cancellation Button (FR16 & UT-05) */}
                        {order.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={!canCancel}
                            className={`px-3.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              canCancel
                                ? 'border-rose-900/60 hover:bg-rose-950/40 text-rose-300'
                                : 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
                            }`}
                            title={
                              canCancel
                                ? 'Cancel order before shipping & restore stock'
                                : 'Cannot cancel order after dispatch (UT-05)'
                            }
                          >
                            {canCancel ? 'Cancel Order & Restore Stock (FR16)' : 'Cancellation Locked (Shipped/Delivered)'}
                          </button>
                        )}

                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-order Items</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
