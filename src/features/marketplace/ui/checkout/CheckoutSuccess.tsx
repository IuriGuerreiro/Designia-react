import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { apiRequest, API_ENDPOINTS } from '@/shared/api';
import { useCart } from '@/shared/state/CartContext';

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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>🔄 Verifying your payment...</div>
        </div>
      </Layout>
    );
  }

  if (error || !sessionStatus) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>❌ Payment Verification Failed</h1>
          <p>{error || 'Unable to verify payment status'}</p>
          <button onClick={() => navigate('/cart')} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
            Return to Cart
          </button>
        </div>
      </Layout>
    );
  }

  const isPaymentSuccessful = sessionStatus.payment_status === 'paid';

  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {isPaymentSuccessful ? (
          <>
            <h1>🎉 Payment Successful!</h1>
            <p>Thank you for your purchase!</p>
            
            {/* Cart refresh status */}
            {cartRefreshed && (
              <div style={{ backgroundColor: '#d1ecf1', padding: '0.75rem', borderRadius: '4px', margin: '0.5rem 0', fontSize: '0.9rem', color: '#0c5460' }}>
                🛒 Your cart has been updated and is ready for your next purchase!
              </div>
            )}
            
            <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '4px', margin: '1rem 0', display: 'inline-block' }}>
              <p><strong>Session ID:</strong> {sessionId}</p>
              <p><strong>Amount:</strong> ${(sessionStatus.amount_total / 100).toFixed(2)}</p>
              <p><strong>Email:</strong> {sessionStatus.customer_email}</p>
            </div>
            <div>
              <button onClick={() => navigate('/marketplace')} style={{ padding: '0.5rem 1rem', margin: '0.5rem' }}>
                Continue Shopping
              </button>
              <button onClick={() => navigate('/orders')} style={{ padding: '0.5rem 1rem', margin: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                View My Orders
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>⚠️ Payment Processing</h1>
            <p>Your payment is being processed. Please check back shortly.</p>
            <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '4px', margin: '1rem 0', display: 'inline-block' }}>
              <p><strong>Status:</strong> {sessionStatus.status}</p>
              <p><strong>Payment Status:</strong> {sessionStatus.payment_status}</p>
            </div>
            <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', margin: '0.5rem' }}>
              Refresh Status
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;