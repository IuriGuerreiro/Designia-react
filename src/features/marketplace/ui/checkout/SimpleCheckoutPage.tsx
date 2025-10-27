import React, { useCallback, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { paymentService } from '@/features/payments/api';
import { useCart } from '@/shared/state/CartContext';
import { Layout } from '@/app/layout';
import { useSearchParams } from 'react-router-dom';
import styles from './Checkout.module.css';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Ru8IhCEfT6kDqKIwzLBjlDis4EOPoQYQaU75RjsvZtw4zo6ZlMrPWcuOvD8fSSVkuoeIk51qig1qkqQNvv7cjcx00IE5NsF6L';
const stripePromise = loadStripe(publishableKey);

const SimpleCheckoutPage = () => {
  const [error, setError] = useState<string | null>(null);
  const { syncWithServer } = useCart();
  const [searchParams] = useSearchParams();
  
  // Check if this is a retry for a specific order
  const retryOrderId = searchParams.get('retry_order');

  // Storage helpers (sessionStorage keeps state per-tab and clears on browser close)
  const storageKey = useMemo(() => {
    return retryOrderId
      ? `designia:checkout:retry:${retryOrderId}`
      : 'designia:checkout:new';
  }, [retryOrderId]);

  const saveClientSecret = (clientSecret: string) => {
    try {
      const payload = {
        clientSecret,
        createdAt: Date.now(),
        type: retryOrderId ? 'retry' : 'new',
        orderId: retryOrderId ?? null,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (_) {
      // ignore storage issues
    }
  };

  const readStoredClientSecret = (): string | null => {
    try {
      // Optional kill-switch via query: /checkout?reset_checkout=1
      const reset = searchParams.get('reset_checkout');
      if (reset === '1') {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith('designia:checkout:'))
          .forEach((k) => sessionStorage.removeItem(k));
        return null;
      }

      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.clientSecret === 'string' && parsed.clientSecret.length > 0) {
        return parsed.clientSecret as string;
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  const fetchClientSecret = useCallback(async () => {
    console.log('🚀 Creating checkout session...');
    
    try {
      // If we already have an active clientSecret (e.g., after a page reload), reuse it
      const existing = readStoredClientSecret();
      if (existing) {
        console.log('♻️ Reusing stored checkout clientSecret');
        return existing;
      }

      let response;
      
      if (retryOrderId) {
        console.log('🔄 Creating retry checkout session for order:', retryOrderId);
        response = await paymentService.createRetryCheckoutSession(retryOrderId);
        console.log('✅ Retry checkout session created successfully');
      } else {
        console.log('🛒 Creating new checkout session from cart');
        response = await paymentService.createCheckoutSession({});
        console.log('✅ New checkout session created successfully');
        
        // Only reload cart for new checkouts, not retries
        try {
          await syncWithServer();
          console.log('🛒 Cart reloaded successfully after checkout session creation');
        } catch (cartError: any) {
          console.warn('⚠️ Failed to reload cart after checkout session creation:', cartError);
          // Don't fail the checkout if cart reloading fails - the backend already handled the clearing
        }
      }
      
      if (!response.clientSecret) {
        throw new Error('No clientSecret in response');
      }
      
      // Persist so that reloads can rehydrate the same Embedded Checkout session
      saveClientSecret(response.clientSecret);
      
      return response.clientSecret;
      
    } catch (error: any) {
      console.error('❌ Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
      throw error;
    }
  }, [syncWithServer, retryOrderId]);

  const options = { fetchClientSecret };

  return (
    <Layout maxWidth="full">
      <div className={styles.checkoutShell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>Designia Checkout</span>
            <h1 className={styles.heroTitle}>Secure monochrome checkout, designed to feel effortless.</h1>
            <p className={styles.heroSubtitle}>
              Review your order and complete payment with our encrypted checkout powered by Stripe. Switch themes at any time—
              your experience stays consistent and calm.
            </p>
            <div className={styles.heroMeta}>
              <div className={styles.heroStat}>
                <span>Average completion</span>
                <strong>2m 15s</strong>
              </div>
              <div className={styles.heroStat}>
                <span>Protection</span>
                <strong>3D Secure</strong>
              </div>
              <div className={styles.heroStat}>
                <span>Support</span>
                <strong>24/7</strong>
              </div>
            </div>
            {retryOrderId && (
              <div className={styles.retryBanner}>
                <div className={styles.retryBadge}>↻</div>
                <div className={styles.retryCopy}>
                  <strong>Retrying payment for order #{retryOrderId.slice(-8)}</strong>
                  <span>We have everything ready. Confirm the payment below to continue.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className={styles.errorBanner}>
            <div className={styles.errorIcon}>!</div>
            <div className={styles.errorCopy}>
              <h3 className={styles.errorTitle}>We couldn&apos;t start checkout</h3>
              <p className={styles.errorMessage}>{error}</p>
            </div>
            <button
              type="button"
              className={styles.errorAction}
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        <div className={styles.embeddedCard}>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <section className={styles.supportCard}>
          <div>
            <h2 className={styles.supportTitle}>Need a hand?</h2>
            <p className={styles.supportCopy}>
              Our concierge team is ready to help with payment questions, invoices, or delivery updates. Reach out anytime.
            </p>
          </div>
          <div className={styles.supportActions}>
            <a className={styles.supportLink} href="mailto:support@designia.com">
              <span aria-hidden>✉️</span>
              Contact support
            </a>
            <a className={styles.supportLink} href="/faq">
              <span aria-hidden>📘</span>
              Explore FAQs
            </a>
            <a className={styles.supportLink} href="/policies/security">
              <span aria-hidden>🛡️</span>
              Security policy
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SimpleCheckoutPage;
