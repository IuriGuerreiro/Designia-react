import apiClient from '@/shared/api/axios'
import type { SellerProfile, OnboardingInitResponse } from '../types'

/**
 * Get current seller status and profile.
 * Backend endpoint: GET /api/payments/stripe/account/
 * (Maps to payment_system/api/views/payment_views.py -> stripe_account GET)
 */
export const getSellerStatus = async (): Promise<SellerProfile> => {
  try {
    const response = await apiClient.get('/payments/stripe/account/')
    // Transform backend response to frontend SellerProfile type
    const data = response.data
    return {
      id: data.id,
      businessName: data.business_profile?.name || '',
      status: data.payouts_enabled ? 'verified' : data.details_submitted ? 'pending' : 'none',
      charges_enabled: data.charges_enabled,
      payouts_enabled: data.payouts_enabled,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.status === 404) {
      // No stripe account yet
      return {
        id: '',
        businessName: '',
        status: 'none',
        charges_enabled: false,
        payouts_enabled: false,
      }
    }
    throw error
  }
}

/**
 * Create or get the Stripe Connect account.
 */
export const createStripeAccount = async (): Promise<{ account_id: string }> => {
  const response = await apiClient.post('/payments/stripe/account/')
  return response.data
}

/**
 * Create an Account Session for Embedded Onboarding.
 * Backend endpoint: POST /api/payments/stripe/create-session/
 */
export const createAccountSession = async (): Promise<{ client_secret: string }> => {
  const response = await apiClient.post('/payments/stripe/create-session/')
  return response.data
}

/**
 * Initiate Stripe Connect onboarding (Hosted Flow).
 * 1. Create/Get Account: POST /api/payments/stripe/account/
 * 2. Create Account Link: POST /api/payments/stripe/account-link/
 */
export const initiateOnboarding = async (): Promise<OnboardingInitResponse> => {
  // Step 1: Ensure account exists
  let accountId = ''
  try {
    const accountRes = await createStripeAccount()
    accountId = accountRes.account_id
  } catch (error) {
    console.error('Failed to create/get stripe account', error)
    throw error
  }

  // Step 2: Get onboarding link
  const returnUrl = `${window.location.origin}/seller/onboarding/return`
  const refreshUrl = `${window.location.origin}/seller/onboarding`

  const linkRes = await apiClient.post('/payments/stripe/account-link/', {
    account_id: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return {
    url: linkRes.data.url,
  }
}
