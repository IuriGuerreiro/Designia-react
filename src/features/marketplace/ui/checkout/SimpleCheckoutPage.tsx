import React, { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { paymentService } from '@/features/payments/api';
import { useCart } from '@/shared/state/CartContext';
import { Layout } from '@/app/layout';
import { useSearchParams } from 'react-router-dom';
import './Checkout.css';

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

  const fetchClientSecret = useCallback(async () => {
    console.log('🚀 Creating checkout session...');
    
    try {
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
      <div className="checkout-container">

        {/* Error Display */}
        {error && (
          <div className="checkout-error">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h3 className="error-title">Checkout Error</h3>
              <p className="error-message">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-checkout-btn"
            >
              🔄 Try Again
            </button>
          </div>
        )}
        <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>

        {/* Help Section */}
        <div className="checkout-help">
          <div className="help-card">
            <h3 className="help-title">Need Help?</h3>
            <p className="help-description">
              If you encounter any issues during checkout, our support team is here to help.
            </p>
            <div className="help-actions">
              <a href="mailto:support@designia.com" className="help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Contact Support
              </a>
              <a href="/faq" className="help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimpleCheckoutPage;