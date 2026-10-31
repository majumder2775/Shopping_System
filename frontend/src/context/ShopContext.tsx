import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, Address, TestCaseResult } from '../types';
import { db, mernApi } from '../services/api';

interface ShopContextType {
  // User & Auth (FR1, FR2, FR3)
  currentUser: User | null;
  switchUser: (role: 'customer' | 'admin') => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;

  // View Navigation
  currentView: 'shop' | 'orders' | 'inventory' | 'reports';
  setCurrentView: (view: 'shop' | 'orders' | 'inventory' | 'reports') => void;

  // Cart (FR7, FR8)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartShipping: number;
  cartDiscount: number;
  appliedPromo: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  cartTotal: number;

  // Modals & Drawers
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;
  isMernInspectorOpen: boolean;
  setIsMernInspectorOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  isEmailInboxOpen: boolean;
  setIsEmailInboxOpen: (open: boolean) => void;
  isTestRunnerOpen: boolean;
  setIsTestRunnerOpen: (open: boolean) => void;

  // Payment Sandbox state (IT-03 & IT-04)
  paymentSimulationSuccess: boolean;
  setPaymentSimulationSuccess: (success: boolean) => void;

  // Automated Test Suite Results (Section 3 of PDF)
  testSuiteResults: TestCaseResult[];
  runAutomatedTestSuite: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Refresh trigger for DB mutations
  dbVersion: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users (defaults to Alex Morgan in Bengaluru)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active view
  const [currentView, setCurrentView] = useState<'shop' | 'orders' | 'inventory' | 'reports'>('shop');

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mern_cart_inr');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isMernInspectorOpen, setIsMernInspectorOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  // Payment Gateway Sandbox Toggle (IT-03 & IT-04)
  const [paymentSimulationSuccess, setPaymentSimulationSuccess] = useState<boolean>(true);

  // Test suite results
  const [testSuiteResults, setTestSuiteResults] = useState<TestCaseResult[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DB Sync trigger
  const [dbVersion, setDbVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Load catalogue + restore the signed-in session from the API on first render
  useEffect(() => {
    mernApi
      .bootstrap()
      .then(setCurrentUser)
      .catch((e) => showToast(e.message));
  }, []);

  useEffect(() => {
    db.paymentSimulationOutcome = paymentSimulationSuccess ? 'success' : 'failure';
  }, [paymentSimulationSuccess]);

  useEffect(() => {
    try {
      localStorage.setItem('mern_cart_inr', JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const switchUser = async (role: 'customer' | 'admin') => {
    try {
      const target = await mernApi.demoLogin(role);
      setCurrentUser(target);
      showToast(`Switched account to ${target.name} (${target.role.toUpperCase()})`);
      if (role === 'admin') {
        setCurrentView('inventory');
      } else if (currentView === 'inventory' || currentView === 'reports') {
        setCurrentView('shop');
      }
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const logout = () => {
    mernApi.logout();
    setCurrentUser(null);
    if (currentView !== 'shop') setCurrentView('shop');
    showToast('Signed out of session');
  };

  const addToCart = (product: Product, quantity = 1): boolean => {
    const freshProduct = db.getProductById(product._id);
    const availableStock = freshProduct ? freshProduct.inventoryCount : product.inventoryCount;

    if (availableStock <= 0) {
      showToast(`"${product.name}" is currently out of stock.`);
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product._id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + quantity > availableStock) {
      showToast(`Cannot add more: Only ${availableStock} unit(s) available in stock.`);
      return false;
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { productId: product._id, product, quantity }]);
    }

    showToast(`Added ${quantity} × ${product.name} to shopping cart.`);
    setIsCartOpen(true);
    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const freshProduct = db.getProductById(productId);
    const available = freshProduct ? freshProduct.inventoryCount : 99;

    if (quantity > available) {
      showToast(`Maximum available stock is ${available} units.`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MERN1000') {
      setAppliedPromo('MERN1000');
      setDiscountAmount(1000);
      showToast('Promo code MERN1000 applied: ₹1,000 instant discount!');
      return { success: true, message: '₹1,000 discount applied' };
    } else if (clean === 'WELCOME10') {
      setAppliedPromo('WELCOME10');
      const discount = Math.round(cartSubtotal * 0.1);
      setDiscountAmount(discount);
      showToast('Promo code WELCOME10 applied: 10% discount!');
      return { success: true, message: '10% discount applied' };
    } else if (clean === 'STUDIO500') {
      setAppliedPromo('STUDIO500');
      setDiscountAmount(500);
      showToast('Promo code STUDIO500 applied: ₹500 discount!');
      return { success: true, message: '₹500 discount applied' };
    } else {
      return { success: false, message: 'Invalid promo code. Try "MERN1000" or "STUDIO500"' };
    }
  };

  // Run Assignment 4 Test Suite
  const runAutomatedTestSuite = () => {
    const res = db.runAutomatedTestSuite();
    setTestSuiteResults(res);
    setIsTestRunnerOpen(true);
    showToast(`Executed all 25 test cases: ${res.filter((r) => r.status === 'Pass').length}/25 Passed!`);
  };

  // Cart financial calculations in INR (₹)
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const cartDiscount = Math.min(cartSubtotal, discountAmount);
  const cartTax = Math.round((cartSubtotal - cartDiscount) * 0.08); // 8% GST
  // Free delivery threshold in INR: ₹1,500
  const cartShipping = cartSubtotal >= 1500 || cartSubtotal === 0 ? 0 : 99;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax + cartShipping);

  return (
    <ShopContext.Provider
      value={{
        currentUser,
        switchUser,
        setCurrentUser,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        isProfileOpen,
        setIsProfileOpen,
        currentView,
        setCurrentView,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartSubtotal,
        cartTax,
        cartShipping,
        cartDiscount,
        appliedPromo,
        applyPromoCode,
        cartTotal,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        confirmedOrder,
        setConfirmedOrder,
        isMernInspectorOpen,
        setIsMernInspectorOpen,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        isEmailInboxOpen,
        setIsEmailInboxOpen,
        isTestRunnerOpen,
        setIsTestRunnerOpen,
        paymentSimulationSuccess,
        setPaymentSimulationSuccess,
        testSuiteResults,
        runAutomatedTestSuite,
        toastMessage,
        showToast,
        dbVersion,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
