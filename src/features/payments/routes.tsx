import { RoleGuard } from '../auth/ui';
import CheckoutSuccess from '../marketplace/ui/checkout/CheckoutSuccess';
import PaymentPage from '../marketplace/ui/checkout/PaymentPage';
import SimpleCheckoutPage from '../marketplace/ui/checkout/SimpleCheckoutPage';
import StripeOnboarding from '../marketplace/ui/stripe/StripeOnboarding';
import Payouts from '@/pages/Payouts';
import StripeHolds from '@/pages/StripeHolds';
import type { AppRoute } from '@/app/router/types';

export const paymentRoutes: AppRoute[] = [
  { path: '/checkout', element: <SimpleCheckoutPage /> },
  { path: '/checkout-success', element: <CheckoutSuccess /> },
  { path: '/payment', element: <PaymentPage /> },
  { path: '/stripe-onboarding', element: <RoleGuard requiredRole="seller"><StripeOnboarding /></RoleGuard> },
  { path: '/stripe-holds', element: <RoleGuard requiredRole="seller"><StripeHolds /></RoleGuard> },
  { path: '/payouts', element: <RoleGuard requiredRole="seller"><Payouts /></RoleGuard> },
];
