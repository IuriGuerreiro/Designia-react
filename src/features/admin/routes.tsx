import type { AppRoute } from '@/app/router/types';
import { RoleGuard } from '@/features/auth/ui';
import { AdminPayouts, AdminTransactions, SellerApplicationList } from '@/features/admin/ui';

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
