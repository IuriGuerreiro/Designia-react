import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

import AuthScreen from './components/Auth/AuthScreen';
import EmailVerification from './components/Auth/EmailVerification';
import EmailVerificationPending from './components/Auth/EmailVerificationPending';
import RoleGuard from './components/Auth/RoleGuard';
// Marketplace Components
import ProductList from './components/Marketplace/Products/ProductList';
// Chat Components
import { ChatPage } from './components/chat';
import ProductDetailPage from './components/Marketplace/Products/ProductDetailPage';
import ProductForm from './components/Marketplace/Products/ProductForm';
import FavoritesPage from './components/Marketplace/Products/FavoritesPage';
import MyProductsPage from './components/Marketplace/Products/MyProductsPage';
import CartPage from './components/Marketplace/Cart/CartPage';
import SimpleCheckoutPage from './components/Marketplace/Checkout/SimpleCheckoutPage';
import CheckoutSuccess from './components/Marketplace/Checkout/CheckoutSuccess';
import PaymentPage from './components/Marketplace/Checkout/PaymentPage';
import MyOrdersPage from './components/Marketplace/Orders/MyOrdersPage';
import OrderSuccessPage from './components/Marketplace/Orders/OrderSuccessPage';
import MyOrderDetailView from './components/Marketplace/Orders/MyOrderDetailView';
import UserOrdersManagement from './components/Marketplace/Orders/UserOrdersManagement';
import ProductMetricsPage from './components/Marketplace/Metrics/ProductMetricsPage';

// Settings Components
import Settings from './components/Settings/Settings';

// Pages Components  
import EditProfile from './components/Pages/Profile/EditProfile';

// Settings Components (moved from Pages)
import BecomeSellerForm from './components/Settings/Forms/BecomeSellerForm';
import SellerProfilePage from './components/Marketplace/Seller/SellerProfilePage';



import NotFound from './components/NotFound/NotFound';
import './App.css';
//stripe testing REMOVE AFTER TESTING
import StripeOnboarding from './components/Marketplace/Stripe/StripeOnboarding';
import StripeHolds from './pages/StripeHolds';
import Payouts from './pages/Payouts';

// Admin Components
import SellerApplicationList from './components/Admin/SellerApplicationList';
import AdminPayouts from './components/Admin/AdminPayouts';
import AdminTransactions from './components/Admin/AdminTransactions';

const AppContent: React.FC = () => {
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.error('Auth context error:', error);
    // Fallback: redirect to login
    return <Navigate to="/login" />;
  }
  if(!isAuthenticated) {
    return (
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen />} />
        <Route path="/password-reset" element={<AuthScreen />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/verify-email-pending" element={<EmailVerificationPending />} />
      
        <Route path="/*" element={<AuthScreen />} />
      </Routes>
      )
    }
  else if (isAuthenticated) {
    return (
      <ActivityProvider>
        <CartProvider>
          <Routes>
          {/* Protected Routes */}
            <Route path="/logout" element={<Navigate to="/login" />} />
            <Route path="/" element={<ProductList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<RoleGuard requiredRole="seller"><ProductForm /></RoleGuard>} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/products/:slug/edit" element={<RoleGuard requiredRole="seller"><ProductForm /></RoleGuard>} />
            <Route path="/my-products" element={<RoleGuard requiredRole="seller"><MyProductsPage /></RoleGuard>} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/become-seller" element={<BecomeSellerForm />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/metrics" element={<RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard>} />
            <Route path="/metrics/product/:productId" element={<RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard>} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/my-orders/:orderId" element={<MyOrderDetailView />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/order-management" element={<RoleGuard requiredRole="seller"><UserOrdersManagement /></RoleGuard>} />
            <Route path="/checkout" element={<SimpleCheckoutPage />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/stripe-onboarding" element={<RoleGuard requiredRole="seller"><StripeOnboarding /></RoleGuard>} />
            <Route path="/stripe-holds" element={<RoleGuard requiredRole="seller"><StripeHolds /></RoleGuard>} />
            <Route path="/payouts" element={<RoleGuard requiredRole="seller"><Payouts /></RoleGuard>} />

            {/* Chat routes */}
            <Route path="/chat" element={<ChatPage />} />

            {/* Admin routes */}
            <Route path="/admin/seller-applications" element={<RoleGuard requiredRole="admin"><SellerApplicationList /></RoleGuard>} />
            <Route path="/admin/payouts" element={<RoleGuard requiredRole="admin"><AdminPayouts /></RoleGuard>} />
            <Route path="/admin/transactions" element={<RoleGuard requiredRole="admin"><AdminTransactions /></RoleGuard>} />

            {/* 404 catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </ActivityProvider>
    );
  }
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
