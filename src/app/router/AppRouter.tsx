import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityProvider } from '../../contexts/ActivityContext';
import { CartProvider } from '../../contexts/CartContext';
import AuthScreen from '../../components/Auth/AuthScreen';
import EmailVerification from '../../components/Auth/EmailVerification';
import EmailVerificationPending from '../../components/Auth/EmailVerificationPending';
import RoleGuard from '../../components/Auth/RoleGuard';
import ProductList from '../../components/Marketplace/Products/ProductList';
import { ChatPage } from '../../components/chat';
import ProductDetailPage from '../../components/Marketplace/Products/ProductDetailPage';
import ProductForm from '../../components/Marketplace/Products/ProductForm';
import FavoritesPage from '../../components/Marketplace/Products/FavoritesPage';
import MyProductsPage from '../../components/Marketplace/Products/MyProductsPage';
import CartPage from '../../components/Marketplace/Cart/CartPage';
import SimpleCheckoutPage from '../../components/Marketplace/Checkout/SimpleCheckoutPage';
import CheckoutSuccess from '../../components/Marketplace/Checkout/CheckoutSuccess';
import PaymentPage from '../../components/Marketplace/Checkout/PaymentPage';
import MyOrdersPage from '../../components/Marketplace/Orders/MyOrdersPage';
import OrderSuccessPage from '../../components/Marketplace/Orders/OrderSuccessPage';
import MyOrderDetailView from '../../components/Marketplace/Orders/MyOrderDetailView';
import UserOrdersManagement from '../../components/Marketplace/Orders/UserOrdersManagement';
import ProductMetricsPage from '../../components/Marketplace/Metrics/ProductMetricsPage';
import Settings from '../../components/Settings/Settings';
import EditProfile from '../../components/Pages/Profile/EditProfile';
import BecomeSellerForm from '../../components/Settings/Forms/BecomeSellerForm';
import SellerProfilePage from '../../components/Marketplace/Seller/SellerProfilePage';
import NotFound from '../../components/NotFound/NotFound';
import StripeOnboarding from '../../components/Marketplace/Stripe/StripeOnboarding';
import StripeHolds from '../../pages/StripeHolds';
import Payouts from '../../pages/Payouts';
import SellerApplicationList from '../../components/Admin/SellerApplicationList';
import AdminPayouts from '../../components/Admin/AdminPayouts';
import AdminTransactions from '../../components/Admin/AdminTransactions';

const LoadingScreen = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
    <p>Loading your experience…</p>
  </div>
);

type AppRoute = {
  path: string;
  element: ReactElement;
};

const publicRoutes: AppRoute[] = [
  { path: '/login', element: <AuthScreen /> },
  { path: '/register', element: <AuthScreen /> },
  { path: '/password-reset', element: <AuthScreen /> },
  { path: '/verify-email/:token', element: <EmailVerification /> },
  { path: '/verify-email-pending', element: <EmailVerificationPending /> },
  { path: '/*', element: <Navigate to="/login" /> },
];

const protectedRoutes: AppRoute[] = [
  { path: '/logout', element: <Navigate to="/login" /> },
  { path: '/', element: <ProductList /> },
  { path: '/products', element: <ProductList /> },
  { path: '/products/new', element: <RoleGuard requiredRole="seller"><ProductForm /></RoleGuard> },
  { path: '/products/:slug', element: <ProductDetailPage /> },
  { path: '/products/:slug/edit', element: <RoleGuard requiredRole="seller"><ProductForm /></RoleGuard> },
  { path: '/my-products', element: <RoleGuard requiredRole="seller"><MyProductsPage /></RoleGuard> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/settings', element: <Settings /> },
  { path: '/settings/become-seller', element: <BecomeSellerForm /> },
  { path: '/profile/edit', element: <EditProfile /> },
  { path: '/seller/:sellerId', element: <SellerProfilePage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/metrics', element: <RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard> },
  { path: '/metrics/product/:productId', element: <RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard> },
  { path: '/my-orders', element: <MyOrdersPage /> },
  { path: '/my-orders/:orderId', element: <MyOrderDetailView /> },
  { path: '/order-success/:orderId', element: <OrderSuccessPage /> },
  { path: '/order-management', element: <RoleGuard requiredRole="seller"><UserOrdersManagement /></RoleGuard> },
  { path: '/checkout', element: <SimpleCheckoutPage /> },
  { path: '/checkout-success', element: <CheckoutSuccess /> },
  { path: '/payment', element: <PaymentPage /> },
  { path: '/stripe-onboarding', element: <RoleGuard requiredRole="seller"><StripeOnboarding /></RoleGuard> },
  { path: '/stripe-holds', element: <RoleGuard requiredRole="seller"><StripeHolds /></RoleGuard> },
  { path: '/payouts', element: <RoleGuard requiredRole="seller"><Payouts /></RoleGuard> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/admin/seller-applications', element: <RoleGuard requiredRole="admin"><SellerApplicationList /></RoleGuard> },
  { path: '/admin/payouts', element: <RoleGuard requiredRole="admin"><AdminPayouts /></RoleGuard> },
  { path: '/admin/transactions', element: <RoleGuard requiredRole="admin"><AdminTransactions /></RoleGuard> },
  { path: '*', element: <NotFound /> },
];

const renderRoutes = (routes: AppRoute[]) =>
  routes.map((route) => <Route key={route.path} path={route.path} element={route.element} />);

export const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Routes>{renderRoutes(publicRoutes)}</Routes>;
  }

  return (
    <ActivityProvider>
      <CartProvider>
        <Routes>{renderRoutes(protectedRoutes)}</Routes>
      </CartProvider>
    </ActivityProvider>
  );
};
