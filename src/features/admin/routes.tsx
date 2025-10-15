import RoleGuard from '../../components/Auth/RoleGuard';
import AdminPayouts from '../../components/Admin/AdminPayouts';
import AdminTransactions from '../../components/Admin/AdminTransactions';
import SellerApplicationList from '../../components/Admin/SellerApplicationList';
import type { AppRoute } from '../../app/router/types';

export const adminRoutes: AppRoute[] = [
  {
    path: '/admin/seller-applications',
    element: <RoleGuard requiredRole="admin"><SellerApplicationList /></RoleGuard>,
  },
  { path: '/admin/payouts', element: <RoleGuard requiredRole="admin"><AdminPayouts /></RoleGuard> },
  {
    path: '/admin/transactions',
    element: <RoleGuard requiredRole="admin"><AdminTransactions /></RoleGuard>,
  },
];
