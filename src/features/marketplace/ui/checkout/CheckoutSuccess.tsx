import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { apiRequest, API_ENDPOINTS } from '@/shared/api';
import { useCart } from '@/shared/state/CartContext';
import styles from './CheckoutSuccess.module.css';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { syncWithServer, setPaymentProcessing } = useCart();
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartRefreshed, setCartRefreshed] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
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
        setError('Failed to verify payment status');
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
            <h1 className={styles.title}>Verifying your payment</h1>
            <p className={styles.subtitle}>We&apos;re confirming details with Stripe. This only takes a moment.</p>
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
            <h1 className={styles.title}>We couldn&apos;t verify the payment</h1>
            <p className={styles.subtitle}>{error || 'Unable to confirm your session. Try again from your cart.'}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => navigate('/cart')}>
                Return to cart
              </button>
              <button type="button" className={styles.secondary} onClick={() => window.location.reload()}>
                Retry verification
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
            {isPaymentSuccessful ? 'Payment confirmed!' : 'Payment is still processing'}
          </h1>
          <p className={styles.subtitle}>
            {isPaymentSuccessful
              ? 'Thank you for choosing Designia. Your order details are on their way to your inbox.'
              : 'Your payment is being finalised with Stripe. We will email you as soon as the confirmation arrives.'}
          </p>

          <div className={styles.metaCard}>
            <ul className={styles.metaList}>
              <li className={styles.metaItem}>
                <span>Session ID</span>
                <strong>{sessionId}</strong>
              </li>
              <li className={styles.metaItem}>
                <span>Amount</span>
                <strong>${formattedAmount}</strong>
              </li>
              {sessionStatus.customer_email && (
                <li className={styles.metaItem}>
                  <span>Receipt sent to</span>
                  <strong>{sessionStatus.customer_email}</strong>
                </li>
              )}
              <li className={styles.metaItem}>
                <span>Stripe status</span>
                <strong>{sessionStatus.payment_status}</strong>
              </li>
            </ul>
          </div>

          {cartRefreshed && (
            <p className={styles.note}>
              🛒 Your cart has been refreshed and is ready for your next styling session.
            </p>
          )}

          {!isPaymentSuccessful && (
            <p className={`${styles.note} ${styles.pendingNote}`}>
              We&apos;re still waiting for confirmation. Feel free to stay on this page or refresh in a few seconds.
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => navigate('/marketplace')}>
              Continue shopping
            </button>
            <button type="button" className={styles.secondary} onClick={() => navigate('/orders')}>
              View my orders
            </button>
            {!isPaymentSuccessful && (
              <button type="button" className={styles.secondary} onClick={() => window.location.reload()}>
                Refresh status
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;