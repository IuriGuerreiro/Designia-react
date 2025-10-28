import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { apiRequest, API_ENDPOINTS } from '@/shared/api';
import { useCart } from '@/shared/state/CartContext';
import styles from './CheckoutSuccess.module.css';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { syncWithServer, setPaymentProcessing } = useCart();
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartRefreshed, setCartRefreshed] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError(t('checkout.success.no_session'));
      setLoading(false);
      return;
    }

    // Fetch session status and refresh cart
    const fetchSessionStatusAndRefreshCart = async () => {
      try {
        console.log('🔍 Verifying payment status...');
        const response = await apiRequest(
          `${API_ENDPOINTS.CHECKOUT_SESSION_STATUS}?session_id=${sessionId}`,
          { method: 'GET' }
        );
        setSessionStatus(response);

        // Clear any persisted checkout clientSecret so a new checkout starts clean
        try {
          Object.keys(sessionStorage)
            .filter((k) => k.startsWith('designia:checkout:'))
            .forEach((k) => sessionStorage.removeItem(k));
        } catch (_) {
          // ignore storage issues
        }

        // If payment was successful, refresh the cart to get updated information
        if (response.payment_status === 'paid' && !cartRefreshed) {
          console.log('✅ Payment successful! Refreshing cart...');
          
          // Stop payment processing state
          setPaymentProcessing(false);
          
          // Refresh cart to get updated information (should be empty after webhook processing)
          try {
            await syncWithServer();
            setCartRefreshed(true);
            console.log('🛒 Cart refreshed successfully after successful payment');
          } catch (cartError) {
            console.error('Failed to refresh cart after successful payment:', cartError);
            // Don't fail the entire flow if cart refresh fails
          }
        }
      } catch (err) {
        console.error('Failed to fetch session status:', err);
        setError(t('checkout.success.verify_failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStatusAndRefreshCart();
  }, [sessionId]); // Removed syncWithServer and setPaymentProcessing from dependencies

  if (loading) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={`${styles.stateIcon} ${styles.pending}`} aria-hidden>
              ⏳
            </div>
            <h1 className={styles.title}>{t('checkout.success.verifying_title')}</h1>
            <p className={styles.subtitle}>{t('checkout.success.verifying_subtitle')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !sessionStatus) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={`${styles.stateIcon} ${styles.pending}`} aria-hidden>
              ⚠️
            </div>
            <h1 className={styles.title}>{t('checkout.success.verify_error_title')}</h1>
            <p className={styles.subtitle}>{error || t('checkout.success.verify_error_subtitle')}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => navigate('/cart')}>
                {t('checkout.success.return_to_cart')}
              </button>
              <button type="button" className={styles.secondary} onClick={() => window.location.reload()}>
                {t('checkout.success.retry_verification')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaymentSuccessful = sessionStatus.payment_status === 'paid';
  const formattedAmount = sessionStatus.amount_total ? (sessionStatus.amount_total / 100).toFixed(2) : '0.00';

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.card}>
          <div
            className={`${styles.stateIcon} ${isPaymentSuccessful ? '' : styles.pending}`.trim()}
            aria-hidden
          >
            {isPaymentSuccessful ? '🎉' : '⏳'}
          </div>
          <h1 className={styles.title}>
            {isPaymentSuccessful ? t('checkout.success.confirmed_title') : t('checkout.success.processing_title')}
          </h1>
          <p className={styles.subtitle}>
            {isPaymentSuccessful
              ? t('checkout.success.confirmed_subtitle')
              : t('checkout.success.processing_subtitle')}
          </p>

          <div className={styles.metaCard}>
            <ul className={styles.metaList}>
              <li className={styles.metaItem}>
                <span>{t('checkout.success.session_id')}</span>
                <strong>{sessionId}</strong>
              </li>
              <li className={styles.metaItem}>
                <span>{t('checkout.success.amount')}</span>
                <strong>${formattedAmount}</strong>
              </li>
              {sessionStatus.customer_email && (
                <li className={styles.metaItem}>
                  <span>{t('checkout.success.receipt_sent_to')}</span>
                  <strong>{sessionStatus.customer_email}</strong>
                </li>
              )}
              <li className={styles.metaItem}>
                <span>{t('checkout.success.stripe_status')}</span>
                <strong>{sessionStatus.payment_status}</strong>
              </li>
            </ul>
          </div>

          {cartRefreshed && (
            <p className={styles.note}>🛒 {t('checkout.success.cart_refreshed')}</p>
          )}

          {!isPaymentSuccessful && (
            <p className={`${styles.note} ${styles.pendingNote}`}>{t('checkout.success.waiting_confirmation')}</p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => navigate('/marketplace')}>
              {t('orders.success.continue_shopping')}
            </button>
            <button type="button" className={styles.secondary} onClick={() => navigate('/orders')}>
              {t('orders.success.view_my_orders')}
            </button>
            {!isPaymentSuccessful && (
              <button type="button" className={styles.secondary} onClick={() => window.location.reload()}>
                {t('checkout.success.refresh_status')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
