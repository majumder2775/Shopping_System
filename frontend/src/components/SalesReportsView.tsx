import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { db } from '../services/api';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  PackageX,
  PieChart,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const SalesReportsView: React.FC = () => {
  const { dbVersion } = useShop();

  void dbVersion;
  const report = useMemo(() => db.getSalesReport(), [dbVersion]);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Administrative Intelligence (FR22)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white mt-1">
            Store Sales & Revenue Reports (INR ₹)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time sales aggregation across categories, average order values, and fulfillment metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Quarter 4, 2026</span>
        </div>
      </div>

      {/* KPI Summary Strip in INR (₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Net Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            ₹{report.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Excluding cancelled transactions
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {report.totalOrders}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {report.successfulOrders} fulfilled, {report.cancelledOrders} cancelled
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Average Order Value</span>
            <PackageCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
            ₹{report.averageOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            AOV per customer checkout
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Cancellation Rate</span>
            <PackageX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-300 tabular-nums">
            {report.totalOrders > 0
              ? `${Math.round((report.cancelledOrders / report.totalOrders) * 100)}%`
              : '0%'}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Pre-shipment customer cancellations
          </div>
        </div>
      </div>

      {/* Two Column Breakdown: Category Sales & Top Selling SKUs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Revenue by Product Category (FR22)</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">Sales Weight</span>
          </div>

          <div className="space-y-4">
            {Object.entries(report.categorySales).map(([category, data]) => {
              const pct = report.totalRevenue > 0 ? Math.round((data.revenue / report.totalRevenue) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-200 font-medium">{category}</span>
                    <span className="font-mono text-neutral-400">
                      ₹{data.revenue.toLocaleString('en-IN')} ({data.units} units) · <strong className="text-amber-300">{pct}%</strong>
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Top Velocity Products</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">By Units Sold</span>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {report.topSelling.map((prod, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-medium text-neutral-200">{prod.name}</div>
                  <div className="text-[11px] font-mono text-neutral-500">{prod.sku}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-white font-semibold">{prod.units} units sold</div>
                  <div className="text-[11px] text-amber-300">
                    ₹{prod.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
