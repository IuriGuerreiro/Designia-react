import RoleGuard from '../../components/Auth/RoleGuard';
import CheckoutSuccess from '../../components/Marketplace/Checkout/CheckoutSuccess';
import PaymentPage from '../../components/Marketplace/Checkout/PaymentPage';
import SimpleCheckoutPage from '../../components/Marketplace/Checkout/SimpleCheckoutPage';
import StripeOnboarding from '../../components/Marketplace/Stripe/StripeOnboarding';
import StripeHolds from '../../pages/StripeHolds';
import Payouts from '../../pages/Payouts';
import type { AppRoute } from '../../app/router/types';

export const paymentRoutes: AppRoute[] = [
  { path: '/checkout', element: <SimpleCheckoutPage /> },
  { path: '/checkout-success', element: <CheckoutSuccess /> },
  { path: '/payment', element: <PaymentPage /> },
  { path: '/stripe-onboarding', element: <RoleGuard requiredRole="seller"><StripeOnboarding /></RoleGuard> },
  { path: '/stripe-holds', element: <RoleGuard requiredRole="seller"><StripeHolds /></RoleGuard> },
  { path: '/payouts', element: <RoleGuard requiredRole="seller"><Payouts /></RoleGuard> },
];
