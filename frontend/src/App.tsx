import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderHistoryView } from './components/OrderHistoryView';
import { InventoryDashboard } from './components/InventoryDashboard';
import { SalesReportsView } from './components/SalesReportsView';
import { AddProductModal } from './components/AddProductModal';
import { MernInspectorDrawer } from './components/MernInspectorDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ProfileModal } from './components/ProfileModal';
import { EmailInboxDrawer } from './components/EmailInboxDrawer';
import { Footer } from './components/Footer';
import { CheckCircle } from 'lucide-react';

const ShopContent: React.FC = () => {
  const { currentView, setCurrentView, currentUser, toastMessage } = useShop();

  // Inventory and sales reports are administrator-only views.
  useEffect(() => {
    if (currentUser?.role !== 'admin' && (currentView === 'inventory' || currentView === 'reports')) {
      setCurrentView('shop');
    }
  }, [currentUser?.role, currentView, setCurrentView]);

  const handleExploreClick = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0e] text-neutral-100">
      <Header />

      <main className="flex-1">
        {currentView === 'shop' && (
          <>
            <HeroBanner onExploreClick={handleExploreClick} />
            <ProductGrid />
          </>
        )}

        {currentView === 'orders' && <OrderHistoryView />}

        {currentUser?.role === 'admin' && currentView === 'inventory' && <InventoryDashboard />}

        {currentUser?.role === 'admin' && currentView === 'reports' && <SalesReportsView />}
      </main>

      <Footer />

      {/* Modals & Slide-out Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <AddProductModal />
      <MernInspectorDrawer />
      <AuthModal />
      <AdminLoginModal />
      <ProfileModal />
      <EmailInboxDrawer />

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
          <div className="px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl flex items-center gap-3 text-xs text-neutral-100">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <ShopContent />
    </ShopProvider>
  );
}
