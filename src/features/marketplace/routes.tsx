import { RoleGuard } from '../auth/ui';
import CartPage from './ui/cart/CartPage';
import ProductMetricsPage from './ui/metrics/ProductMetricsPage';
import MyOrderDetailView from './ui/orders/MyOrderDetailView';
import MyOrdersPage from './ui/orders/MyOrdersPage';
import OrderSuccessPage from './ui/orders/OrderSuccessPage';
import UserOrdersManagement from './ui/orders/UserOrdersManagement';
import FavoritesPage from './ui/products/FavoritesPage';
import MyProductsPage from './ui/products/MyProductsPage';
import ProductDetailPage from './ui/products/ProductDetailPage';
import ProductForm from './ui/products/ProductForm';
import ProductList from './ui/products/ProductList';
import SellerProfilePage from './ui/seller/SellerProfilePage';
import type { AppRoute } from '@/app/router/types';

export const marketplaceRoutes: AppRoute[] = [
  { path: '/', element: <ProductList /> },
  { path: '/products', element: <ProductList /> },
  { path: '/products/new', element: <RoleGuard requiredRole="seller"><ProductForm /></RoleGuard> },
  { path: '/products/:slug', element: <ProductDetailPage /> },
  { path: '/products/:slug/edit', element: <RoleGuard requiredRole="seller"><ProductForm /></RoleGuard> },
  { path: '/my-products', element: <RoleGuard requiredRole="seller"><MyProductsPage /></RoleGuard> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/seller/:sellerId', element: <SellerProfilePage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/metrics', element: <RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard> },
  { path: '/metrics/product/:productId', element: <RoleGuard requiredRole="seller"><ProductMetricsPage /></RoleGuard> },
  { path: '/my-orders', element: <MyOrdersPage /> },
  { path: '/my-orders/:orderId', element: <MyOrderDetailView /> },
  { path: '/order-success/:orderId', element: <OrderSuccessPage /> },
  { path: '/order-management', element: <RoleGuard requiredRole="seller"><UserOrdersManagement /></RoleGuard> },
];
