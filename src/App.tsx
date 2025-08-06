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
import ProductList from './components/Products/ProductList';
import ProductDetailPage from './components/Products/ProductDetailPage';
import ProductForm from './components/Products/ProductForm';
import FavoritesPage from './components/Products/FavoritesPage';
import Settings from './components/Settings/Settings';
import BecomeSellerForm from './components/Forms/BecomeSellerForm';
import EditProfile from './components/Profile/EditProfile';
import CartPage from './components/Cart/CartPage';
import ProductMetricsPage from './components/Metrics/ProductMetricsPage';
import SimpleCheckoutPage from './components/Checkout/SimpleCheckoutPage';
import MyProductsPage from './components/Products/MyProductsPage';
import OrdersPage from './components/Orders/OrdersPage';
import OrderSuccessPage from './components/Orders/OrderSuccessPage';
import OrderManagementPage from './components/Orders/OrderManagementPage';
import PaymentPage from './components/Checkout/PaymentPage';
import SocialMediaScreen from './screens/SocialMedia/SocialMediaScreen';
import PostDetailScreen from './screens/SocialMedia/PostDetailScreen';
import UserProfileScreen from './screens/Profile/UserProfileScreen';
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
          <Route path="/" element={isAuthenticated ? <ProductList /> : <Navigate to="/login" />} />
          <Route path="/products" element={isAuthenticated ? <ProductList /> : <Navigate to="/login" />} />
          <Route path="/products/new" element={isAuthenticated ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="/products/:slug" element={isAuthenticated ? <ProductDetailPage /> : <Navigate to="/login" />} />
          <Route path="/products/:slug/edit" element={isAuthenticated ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="/my-products" element={isAuthenticated ? <MyProductsPage /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={isAuthenticated ? <FavoritesPage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/settings/become-seller" element={isAuthenticated ? <BecomeSellerForm /> : <Navigate to="/login" />} />
          <Route path="/profile/edit" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/metrics" element={isAuthenticated ? <ProductMetricsPage /> : <Navigate to="/login" />} />
          <Route path="/metrics/product/:productId" element={isAuthenticated ? <ProductMetricsPage /> : <Navigate to="/login" />} />
          <Route path="/orders" element={isAuthenticated ? <OrdersPage /> : <Navigate to="/login" />} />
          <Route path="/orders/:orderId" element={isAuthenticated ? <OrderSuccessPage /> : <Navigate to="/login" />} />
          <Route path="/order-success/:orderId" element={isAuthenticated ? <OrderSuccessPage /> : <Navigate to="/login" />} />
          <Route path="/order-management" element={isAuthenticated ? <OrderManagementPage /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={isAuthenticated ? <SimpleCheckoutPage /> : <Navigate to="/login" />} />
          <Route path="/payment" element={isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />} />
          <Route path="/social-media" element={isAuthenticated ? <SocialMediaScreen /> : <Navigate to="/login" />} />
          <Route path="/social-media/:postId" element={isAuthenticated ? <PostDetailScreen /> : <Navigate to="/login" />} />
          <Route path="/users/:userId" element={isAuthenticated ? <UserProfileScreen /> : <Navigate to="/login" />} />
          
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
