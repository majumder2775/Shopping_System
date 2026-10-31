import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Shield,
  Database,
  BarChart3,
  Mail,
  User as UserIcon,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    cartTotal,
    setIsCartOpen,
    currentUser,
    logout,
    setIsMernInspectorOpen,
    setIsProfileOpen,
    setIsEmailInboxOpen,
    setIsAuthModalOpen,
    setIsAdminLoginOpen,
  } = useShop();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0e]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('shop')}
            className="text-xl font-serif tracking-widest uppercase text-white hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 text-left font-semibold cursor-pointer"
          >
            DIGITAL STORE
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
            INR (₹)
          </span>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-neutral-400">
          <button
            onClick={() => setCurrentView('shop')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'shop'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Storefront
          </button>
          <button
            onClick={() => setCurrentView('orders')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'orders'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            Orders & Tracking
          </button>
          {currentUser?.role === 'admin' && (
            <>
          <button
            onClick={() => setCurrentView('inventory')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentView === 'inventory'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Inventory Hub
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentView === 'reports'
                ? 'text-white border-b-2 border-amber-400 font-semibold'
                : 'hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Sales Reports
          </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Shopping Bag + Profile & Email triggers) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Email Confirmation notification drawer trigger */}
          <button
            onClick={() => setIsEmailInboxOpen(true)}
            className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="View Order Confirmation Emails (FR13 / IT-06)"
          >
            <Mail className="w-4 h-4 text-amber-400" />
          </button>

          {/* User profile / role badge */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs text-neutral-300 transition-colors cursor-pointer"
              title="Click to switch role or edit profile"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[11px] font-medium text-amber-400">
                {currentUser?.avatar || 'U'}
              </div>
              <span className="hidden sm:inline font-medium text-neutral-200 max-w-[100px] truncate">
                {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-mono">
                {currentUser?.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </button>

            {/* Quick Account Switcher & Profile Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#121316] border border-neutral-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-neutral-400 font-mono border-b border-neutral-800 mb-1 flex justify-between items-center">
                <span>Account & Roles (FR1-3)</span>
              </div>

              {currentUser && (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg text-neutral-200 hover:bg-neutral-800 cursor-pointer flex items-center gap-2 mb-1"
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage Profile & Addresses</span>
                </button>
              )}

              <div className="px-3 py-2 text-[10px] text-neutral-400 leading-relaxed">
                Sign in with your own account. Admin access is verified by the server.
              </div>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full text-left px-3 py-2 text-xs rounded-lg text-amber-300 hover:bg-neutral-800 cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Separate Admin Login
              </button>
              {currentUser && (
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg text-rose-300 hover:bg-rose-950/40 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              )}
              <div className="pt-1 mt-1 border-t border-neutral-800">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Customer Login / Register
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAdminLoginOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs rounded-lg border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer"
            title="Open separate administrator sign-in"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          {currentUser && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs rounded-lg border border-rose-900/70 text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Sign out of your account"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          )}

          {/* Shopping Bag Button with INR total and count */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-2 text-xs font-medium text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-950" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            <span className="tabular-nums font-mono font-semibold bg-neutral-950 text-amber-300 px-1.5 py-0.2 rounded text-[11px]">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
