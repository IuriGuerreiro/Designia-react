import { useState, useEffect } from 'react'
import { getStripeAccountStatus } from '../api/stripeApi'
import type { StripeAccountStatus } from '../types/stripe'

export function useStripeAccountStatus() {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getStripeAccountStatus()
      setStatus(data)
    } catch (err: unknown) {
      console.error('Failed to fetch Stripe account status:', err)
      const message = err instanceof Error ? err.message : 'Failed to load Stripe account status'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const needsOnboarding = status
    ? !status.details_submitted || !status.charges_enabled || !status.payouts_enabled
    : false

  const hasRequirements = status?.requirements
    ? (status.requirements.currently_due?.length || 0) > 0 ||
      (status.requirements.past_due?.length || 0) > 0
    : false

  const isFullySetup =
    status?.has_stripe_account &&
    status.details_submitted &&
    status.charges_enabled &&
    status.payouts_enabled &&
    !hasRequirements

  return {
    status,
    loading,
    error,
    needsOnboarding,
    hasRequirements,
    isFullySetup,
    refetch: fetchStatus,
  }
}
