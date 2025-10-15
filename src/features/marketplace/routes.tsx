import RoleGuard from '../../components/Auth/RoleGuard';
import FavoritesPage from '../../components/Marketplace/Products/FavoritesPage';
import ProductDetailPage from '../../components/Marketplace/Products/ProductDetailPage';
import ProductForm from '../../components/Marketplace/Products/ProductForm';
import ProductList from '../../components/Marketplace/Products/ProductList';
import MyProductsPage from '../../components/Marketplace/Products/MyProductsPage';
import Settings from '../../components/Settings/Settings';
import BecomeSellerForm from '../../components/Settings/Forms/BecomeSellerForm';
import EditProfile from '../../components/Pages/Profile/EditProfile';
import SellerProfilePage from '../../components/Marketplace/Seller/SellerProfilePage';
import CartPage from '../../components/Marketplace/Cart/CartPage';
import ProductMetricsPage from '../../components/Marketplace/Metrics/ProductMetricsPage';
import MyOrdersPage from '../../components/Marketplace/Orders/MyOrdersPage';
import MyOrderDetailView from '../../components/Marketplace/Orders/MyOrderDetailView';
import OrderSuccessPage from '../../components/Marketplace/Orders/OrderSuccessPage';
import UserOrdersManagement from '../../components/Marketplace/Orders/UserOrdersManagement';
import type { AppRoute } from '../../app/router/types';

export const marketplaceRoutes: AppRoute[] = [
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
];
