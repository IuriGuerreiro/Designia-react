import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/state/AuthContext';
import { ActivityProvider } from '@/shared/state/ActivityContext';
import { CartProvider } from '@/shared/state/CartContext';
import { authProtectedRoutes, authPublicRoutes } from '@/features/auth/routes';
import { marketplaceRoutes } from '@/features/marketplace/routes';
import { paymentRoutes } from '@/features/payments/routes';
import { chatRoutes } from '@/features/chat/routes';
import { adminRoutes } from '@/features/admin/routes';
import { accountRoutes } from '@/features/account/routes';
import NotFound from '@/app/error/NotFound';
import type { AppRoute } from './types';

const LoadingScreen = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
    <p>Loading your experience…</p>
  </div>
);

const publicRoutes: AppRoute[] = [...authPublicRoutes];

const protectedRoutes: AppRoute[] = [
  ...authProtectedRoutes,
  ...accountRoutes,
  ...marketplaceRoutes,
  ...paymentRoutes,
  ...chatRoutes,
  ...adminRoutes,
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
