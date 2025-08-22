import React, { useCallback, useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { paymentService } from "../../../services/paymentService";
import { useCart } from "../../../contexts/CartContext";
import Layout from "../../Layout/Layout";
import { useSearchParams } from "react-router-dom";

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
    <Layout>
      <div id="checkout">
        <h1>{retryOrderId ? 'Retry Payment' : 'Checkout'}</h1>
        {retryOrderId && (
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            Retry payment for order #{retryOrderId.slice(-8)}
          </p>
        )}
        
        {error && (
          <div style={{ color: 'red', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ minHeight: '500px' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={options}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </Layout>
  );
}

export default SimpleCheckoutPage;