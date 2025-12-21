import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplicationStatus } from '../../api/applicationApi'
import { SellerApplicationForm } from './SellerApplicationForm'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Loader2, Clock, XCircle, AlertTriangle } from 'lucide-react'
import type { SellerApplicationStatus } from '../../types/application'

export function SellerApplicationFlow() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<SellerApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await getApplicationStatus()
      setStatus(data)

      // If approved, redirect to dashboard or onboarding intro (Stripe setup)
      if (data.status === 'approved') {
        // Check if they need to do stripe onboarding
        // We can navigate to the next step
        navigate('/seller/onboarding/stripe')
      }
    } catch (err: unknown) {
      console.error('Failed to fetch application status', err)
      const message = err instanceof Error ? err.message : 'Failed to load status'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Error: {error}</p>
        <Button variant="link" onClick={fetchStatus}>
          Retry
        </Button>
      </div>
    )
  }

  // State: No Application -> Show Form
  if (!status?.has_application || status.status === 'none') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Apply to Become a Seller</h1>
          <p className="text-muted-foreground">
            Join our community of creators. Tell us about your business to get started.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <SellerApplicationForm onSuccess={fetchStatus} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // State: Pending
  if (status.status === 'pending') {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
        <p className="text-muted-foreground mb-6">
          We received your application on {new Date(status.submitted_at!).toLocaleDateString()}.
          <br />
          Our team is reviewing your details. This usually takes 1-2 business days.
        </p>
        <Button variant="outline" disabled>
          Check Status Again
        </Button>
      </div>
    )
  }

  // State: Rejected
  if (status.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Update</h2>
          <p className="text-muted-foreground">
            Unfortunately, your application was not approved at this time.
          </p>
        </div>

        <Card className="border-destructive/20 bg-destructive/5 mb-8">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Reason for Rejection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{status.rejection_reason || 'Does not meet our current marketplace criteria.'}</p>
            {status.admin_notes && (
              <p className="mt-2 text-sm text-muted-foreground">Note: {status.admin_notes}</p>
            )}
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <p className="mb-4">You can update your information and apply again.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <SellerApplicationForm onSuccess={fetchStatus} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return null // Should be redirected if approved
}
