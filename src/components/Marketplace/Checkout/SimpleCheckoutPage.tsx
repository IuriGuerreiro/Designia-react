import React, { useCallback, useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { paymentService } from "../../../services/paymentService";
import Layout from "../../Layout/Layout";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Ru8IhCEfT6kDqKIwzLBjlDis4EOPoQYQaU75RjsvZtw4zo6ZlMrPWcuOvD8fSSVkuoeIk51qig1qkqQNvv7cjcx00IE5NsF6L';
const stripePromise = loadStripe(publishableKey);

const SimpleCheckoutPage = () => {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    console.log('🚀 Creating checkout session...');
    
    try {
      const response = await paymentService.createCheckoutSession({});
      console.log('✅ Checkout session created successfully');
      
      if (!response.clientSecret) {
        throw new Error('No clientSecret in response');
      }
      
      return response.clientSecret;
      
    } catch (error: any) {
      console.error('❌ Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
      throw error;
    }
  }, []);

  const options = { fetchClientSecret };

  return (
    <Layout>
      <div id="checkout">
        <h1>Checkout</h1>
        
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