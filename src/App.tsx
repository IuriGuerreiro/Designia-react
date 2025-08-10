import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
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
// Marketplace Components
import ProductList from './components/Marketplace/Products/ProductList';
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
import UserProfileScreen from './components/Pages/UserProfileScreen';

// Settings Components (moved from Pages)
import BecomeSellerForm from './components/Settings/Forms/BecomeSellerForm';

// SocialMedia Components
import SocialMediaScreen from './components/SocialMedia/SocialMediaScreen';
import PostDetailScreen from './components/SocialMedia/PostDetailScreen';
import NotFound from './components/NotFound/NotFound';
import './App.css';

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
      <Routes>
        {/* Protected Routes */}
          <Route path="/logout" element={<Navigate to="/login" />} />
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/products/:slug/edit" element={<ProductForm />} />
          <Route path="/my-products" element={<MyProductsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/become-seller" element={<BecomeSellerForm />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/metrics" element={<ProductMetricsPage />} />
          <Route path="/metrics/product/:productId" element={<ProductMetricsPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/my-orders/:orderId" element={<MyOrderDetailView />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/order-management" element={<UserOrdersManagement />} />
          <Route path="/checkout" element={<SimpleCheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/social-media" element={<SocialMediaScreen />} />
          <Route path="/social-media/:postId" element={<PostDetailScreen />} />
          <Route path="/users/:userId" element={<UserProfileScreen />} />
          
          {/* 404 catch-all route */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
