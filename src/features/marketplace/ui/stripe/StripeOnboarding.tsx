import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from '@stripe/react-connect-js';
import { useAuth } from '@/features/auth/state/AuthContext';
import { paymentService } from '@/features/payments/api';
import './StripeOnboarding.css';
import { Layout } from '@/app/layout';

interface StripeOnboardingProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface StripeAccountSession {
  client_secret: string;
  account_id: string;
}

const StripeOnboarding: React.FC<StripeOnboardingProps> = ({
  onComplete,
  onError,
}) => {
  const { t } = useTranslation();
  const { user} = useAuth();
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [eligibilityErrors, setEligibilityErrors] = useState<string[]>([]);

  // Check account status and eligibility using unified approach
  const checkAccountStatus = async () => {
    if (!user) {
      setError(t('stripe.errors.auth_required'));
      return { hasAccount: false, eligible: false };
    }

    try {
      // First get account status/info
      const data = await paymentService.getStripeAccount();
      
      if (data.has_account && data.account_id) {
        // User has an account
        console.log('User has existing Stripe account:', data.account_id);
        setEligible(true);
        setEligibilityErrors([]);
        setEligibilityChecked(true);
        return { hasAccount: true, eligible: true, accountData: data };
      } else {
        // No account exists, check eligibility
        const isEligible = data.eligible_for_creation || false;
        const errors = data.eligibility_errors || [];
        
        setEligible(isEligible);
        setEligibilityErrors(errors);
        setEligibilityChecked(true);
        
        return { hasAccount: false, eligible: isEligible };
      }
    } catch (err: any) {
      const errorMsg = err.message || t('stripe.errors.check_status_failed');
      setError(errorMsg);
      onError?.(errorMsg);
      return { hasAccount: false, eligible: false };
    }
  };

  // Create Stripe account using unified endpoint (handles existing accounts gracefully)
  const ensureStripeAccount = async (): Promise<boolean> => {
    if (!user) {
      setError(t('stripe.errors.auth_required'));
      return false;
    }

    try {
      const data = await paymentService.createStripeConnectAccount({
        country: 'US',
        business_type: 'individual'
      });
      
      // The unified endpoint handles both creation and existing account cases
      console.log('Stripe account response:', data);
      
      if (data.account_id) {
        return true; // Account is ready (either created or already existed)
      }
      
      setError(t('stripe.errors.account_create_failed'));
      return false;
    } catch (err: any) {
      const errorMsg = err.message || t('stripe.errors.ensure_account_failed');
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }
  };

  // Create account session for onboarding
  const createAccountSession = async (): Promise<StripeAccountSession | null> => {
    if (!user) {
      setError(t('stripe.errors.auth_required'));
      return null;
    }

    try {
      const data = await paymentService.createStripeAccountSession();
      return {
        client_secret: data.client_secret,
        account_id: data.account_id
      };
    } catch (err: any) {
      const errorMsg = err.message || t('stripe.errors.create_session_failed');
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }
  };

  // Initialize Stripe Connect
  const initializeStripeConnect = async (clientSecret: string) => {
    try {
      const stripeConnectInstance = await loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret: async () => clientSecret, // wrap it in a function
      });
  
      setStripeConnectInstance(stripeConnectInstance);
    } catch (err: any) {
      const errorMsg = 'Failed to initialize Stripe Connect';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };
  

  // Main initialization flow
  useEffect(() => {
    const initializeOnboarding = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Check account status and eligibility
        const accountStatus = await checkAccountStatus();
        if (!accountStatus.eligible) {
          setLoading(false);
          return;
        }

        // Step 2: Ensure Stripe account exists (create if needed, or use existing)
        const accountReady = await ensureStripeAccount();
        if (!accountReady) {
          setLoading(false);
          return;
        }

        // Step 3: Create account session for onboarding
        const sessionData = await createAccountSession();
        if (!sessionData) {
          setLoading(false);
          return;
        }

        // Step 4: Initialize Stripe Connect with session
        await initializeStripeConnect(sessionData.client_secret);

      } catch (err: any) {
      const errorMsg = err.message || t('stripe.errors.initialize_failed');
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeOnboarding();
    } else {
      setError(t('stripe.errors.auth_required'));
      setLoading(false);
    }
  }, [user]);

  const handleExit = () => {
    console.log('User exited Stripe onboarding');
    onComplete?.();
  };

  const handleStepChange = (stepChange: any) => {
    console.log(`User entered: ${stepChange.step}`);
  };

  if (loading) {
    return (
      <div className="stripe-onboarding-loading">
        <div className="loading-spinner"></div>
        <p>{t('stripe.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="stripe-onboarding-error">
          <h3>{t('stripe.setup_error')}</h3>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            {t('orders.actions.try_again')}
          </button>
        </div>
      </Layout>
    );
  }

  if (!eligible) {
    return (
      <Layout>
        <div className="stripe-onboarding-ineligible">
          <h3>{t('stripe.account_setup_required')}</h3>
          <p>{t('stripe.complete_requirements')}</p>
          <ul className="requirements-list">
            {eligibilityErrors.map((error, index) => (
              <li key={index} className="requirement-item">
                {error}
              </li>
            ))}
          </ul>
          <div className="requirements-actions">
            <button 
              className="check-again-button"
              onClick={() => {
                setEligibilityChecked(false);
                checkAccountStatus();
              }}
            >
              {t('stripe.check_again')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stripeConnectInstance) {
    return (
      <Layout>
        <div className="stripe-onboarding-error">
          <h3>{t('stripe.connection_error')}</h3>
          <p>{t('stripe.connection_failed')}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            {t('orders.actions.try_again')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="stripe-onboarding-container">
        <div className="onboarding-header">
          <h2>{t('stripe.complete_setup')}</h2>
          <p>{t('stripe.provide_business_info')}</p>
        </div>
        
        <div className="onboarding-content">
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={handleExit}
              onStepChange={handleStepChange}
              // Optional: Add terms of service and privacy policy URLs
              // fullTermsOfServiceUrl="https://yoursite.com/terms"
              // recipientTermsOfServiceUrl="https://yoursite.com/recipient-terms"
              // privacyPolicyUrl="https://yoursite.com/privacy"
              // skipTermsOfServiceCollection={false}
              // collectionOptions={{
              //   fields: 'eventually_due',
              //   futureRequirements: 'include',
              // }}
            />
          </ConnectComponentsProvider>
        </div>
      </div>
    </Layout>
  );
};

export default StripeOnboarding;
