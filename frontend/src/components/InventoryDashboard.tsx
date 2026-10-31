import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { db, mernApi } from '../services/api';
import { Product, InventoryAuditLog, User } from '../types';
import {
  Boxes,
  AlertTriangle,
  TrendingUp,
  PackageX,
  Plus,
  RefreshCw,
  Search,
  Shield,
  FileSpreadsheet,
  Users,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';

export const InventoryDashboard: React.FC = () => {
  const { dbVersion, showToast, setIsAddProductModalOpen, currentUser } = useShop();
  const [activeTab, setActiveTab] = useState<'inventory' | 'users'>('inventory');
  const [searchSku, setSearchSku] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isRestocking, setIsRestocking] = useState(false);

  void dbVersion;
  const allProducts = db.getProducts();
  const auditLogs = db.getAuditLogs().slice(0, 15);
  const users = db.getUsers();

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchSku.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchSku.toLowerCase()) ||
        p.category.toLowerCase().includes(searchSku.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'low') {
        return p.inventoryCount > 0 && p.inventoryCount <= p.lowStockThreshold;
      }
      if (statusFilter === 'out') {
        return p.inventoryCount <= 0;
      }
      return true;
    });
  }, [allProducts, searchSku, statusFilter]);

  // Aggregate KPI metrics in INR (₹)
  const totalValuation = allProducts.reduce(
    (sum, p) => sum + p.price * p.inventoryCount,
    0
  );
  const totalUnits = allProducts.reduce((sum, p) => sum + p.inventoryCount, 0);
  const lowStockCount = allProducts.filter(
    (p) => p.inventoryCount > 0 && p.inventoryCount <= p.lowStockThreshold
  ).length;
  const outOfStockCount = allProducts.filter((p) => p.inventoryCount <= 0).length;

  const handleAdjustStock = async (productId: string, delta: number) => {
    const prod = db.getProductById(productId);
    if (!prod) return;
    const newQty = Math.max(0, prod.inventoryCount + delta);
    try {
      await mernApi.updateStock(productId, newQty);
      showToast(`Stock updated for ${prod.sku}: now ${newQty} units.`);
    } catch (err: any) {
      showToast(`Stock adjustment error: ${err.message}`);
    }
  };

  const handleBatchRestock = async () => {
    setIsRestocking(true);
    try {
      const res = await mernApi.batchRestock(10);
      showToast(
        `Batch restock committed: ${res.count} items replenished with +10 units each.`
      );
    } catch (err: any) {
      showToast(`Batch restock error: ${err.message}`);
    } finally {
      setIsRestocking(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the product catalogue? (FR18)`)) return;
    try {
      await mernApi.deleteProduct(id);
      showToast(`Product "${name}" deleted from catalogue.`);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    }
  };

  const handleToggleUserBlock = async (user: User) => {
    try {
      const updated = await mernApi.toggleBlockUser(user._id);
      showToast(
        `User ${updated.name} account is now ${updated.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'} (FR21)`
      );
    } catch (err: any) {
      showToast(`User block update failed: ${err.message}`);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Store Operations Console (FR18, FR19, FR21)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white mt-1">
            Real-Time Inventory & User Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Live catalog control, stock replenishment in INR (₹), and user account access control.
          </p>
        </div>

        {/* Global Hub Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-neutral-800 rounded-lg p-1 bg-neutral-900 text-xs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
                activeTab === 'inventory' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Inventory Hub
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({users.length})</span>
            </button>
          </div>

          <button
            onClick={handleBatchRestock}
            disabled={isRestocking || (lowStockCount === 0 && outOfStockCount === 0)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestocking ? 'animate-spin' : ''}`} />
            <span>Batch Restock (+10)</span>
          </button>

          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU (FR18)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip in INR (₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Inventory Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Across {allProducts.length} active catalog SKUs
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Physical Units</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {totalUnits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Total ready warehouse stock
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Threshold: &le; 5 units remaining
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono">
            <span>Stockouts</span>
            <PackageX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-300 tabular-nums">
            {outOfStockCount}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Immediate replenishment required
          </div>
        </div>
      </div>

      {/* Tab 1: Inventory SKUs Table + Live Audit Log */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Inventory SKUs Table (FR18, FR19) */}
          <div className="lg:col-span-8 bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by SKU or title..."
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono cursor-pointer transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-neutral-200 text-neutral-950 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({allProducts.length})
                </button>
                <button
                  onClick={() => setStatusFilter('low')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono cursor-pointer transition-colors ${
                    statusFilter === 'low'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Low ({lowStockCount})
                </button>
                <button
                  onClick={() => setStatusFilter('out')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono cursor-pointer transition-colors ${
                    statusFilter === 'out'
                      ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Out of Stock ({outOfStockCount})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-neutral-800/80 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[11px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Stock & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/30">
                  {filteredProducts.map((p) => {
                    const isOut = p.inventoryCount <= 0;
                    const isLow = p.inventoryCount > 0 && p.inventoryCount <= p.lowStockThreshold;

                    return (
                      <tr key={p._id} className="hover:bg-neutral-850/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-9 h-9 rounded object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                            />
                            <div className="min-w-0 max-w-[180px]">
                              <div className="font-medium text-neutral-200 truncate">{p.name}</div>
                              <div className="text-[10px] font-mono text-neutral-500">{p.sku}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-400">{p.category}</td>

                        <td className="py-3 px-4 font-mono font-medium text-white tabular-nums">
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold tabular-nums">
                          <span
                            className={
                              isOut
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {p.inventoryCount} units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                              Adequate
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="inline-flex items-center border border-neutral-800 rounded bg-neutral-950 overflow-hidden">
                              <button
                                onClick={() => handleAdjustStock(p._id, -1)}
                                disabled={p.inventoryCount <= 0}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                                title="Decrement stock by 1"
                              >
                                -1
                              </button>
                              <span className="px-2 py-1 font-mono text-[11px] text-white tabular-nums border-x border-neutral-800">
                                {p.inventoryCount}
                              </span>
                              <button
                                onClick={() => handleAdjustStock(p._id, 1)}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                                title="Increment stock by 1"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, 5)}
                                className="px-2 py-1 text-[10px] font-mono bg-neutral-900 text-amber-300 hover:bg-neutral-800 border-l border-neutral-800 cursor-pointer"
                                title="Restock +5 units"
                              >
                                +5
                              </button>
                            </div>

                            {/* Delete Product (FR18) */}
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Product (FR18)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Real-Time Audit Log Ledger */}
          <div className="lg:col-span-4 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Inventory Audit Ledger</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Real-time stock decrement & restore logs
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {auditLogs.map((log) => {
                const isNegative = log.delta < 0;
                return (
                  <div
                    key={log._id}
                    className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-200 truncate max-w-[160px]">
                        {log.productName}
                      </span>
                      <span
                        className={`font-mono font-semibold tabular-nums px-1.5 py-0.2 rounded text-[11px] ${
                          isNegative
                            ? 'text-rose-400 bg-rose-950/50'
                            : 'text-emerald-400 bg-emerald-950/50'
                        }`}
                      >
                        {isNegative ? '' : '+'}
                        {log.delta}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>
                        {log.previousStock} &rarr;{' '}
                        <strong className="text-neutral-300">{log.newStock} units</strong>
                      </span>
                      <span className="text-[10px] text-amber-400/80">
                        Ref: {log.referenceId}
                      </span>
                    </div>

                    <div className="text-[10px] text-neutral-500 flex justify-between pt-1">
                      <span className="capitalize">{log.reason.replace('_', ' ')}</span>
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Account Administration (FR21) */}
      {activeTab === 'users' && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>User Account Control & Access (FR21)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage registered user accounts, view roles, and block or unblock customer access.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Total Users: {users.length}</span>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[11px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status (FR21)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/30">
                {users.map((u) => {
                  const isBlocked = u.status === 'blocked';
                  return (
                    <tr key={u._id} className="hover:bg-neutral-850/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-mono text-[10px] text-amber-400">
                          {u.avatar || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-300">{u.email}</td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-4 uppercase font-mono text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800 text-[10px] font-mono uppercase">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px] font-mono uppercase">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserBlock(u)}
                            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ml-auto ${
                              isBlocked
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Unblock User</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Block User</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
