import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { apiRequest, API_ENDPOINTS } from '../../../config/api';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Fetch session status
    const fetchSessionStatus = async () => {
      try {
        const response = await apiRequest(
          `${API_ENDPOINTS.CHECKOUT_SESSION_STATUS}?session_id=${sessionId}`,
          { method: 'GET' }
        );
        setSessionStatus(response);
      } catch (err) {
        console.error('Failed to fetch session status:', err);
        setError('Failed to verify payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStatus();
  }, [sessionId]);

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
            <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '4px', margin: '1rem 0', display: 'inline-block' }}>
              <p><strong>Session ID:</strong> {sessionId}</p>
              <p><strong>Amount:</strong> ${(sessionStatus.amount_total / 100).toFixed(2)}</p>
              <p><strong>Email:</strong> {sessionStatus.customer_email}</p>
            </div>
            <div>
              <button onClick={() => navigate('/marketplace')} style={{ padding: '0.5rem 1rem', margin: '0.5rem' }}>
                Continue Shopping
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