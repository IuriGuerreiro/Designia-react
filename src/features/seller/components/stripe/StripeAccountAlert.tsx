import { useState } from 'react'
import { useStripeAccountStatus } from '../../hooks/useStripeAccountStatus'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { AlertTriangle, CheckCircle2, Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { StripeAccountSetupDialog } from './StripeAccountSetupDialog'

export function StripeAccountAlert() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { status, loading, error, needsOnboarding, hasRequirements, isFullySetup, refetch } =
    useStripeAccountStatus()

  const handleSetupComplete = () => {
    // Refetch the account status after setup is complete
    refetch()
  }

  if (loading) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking payment account status...</AlertTitle>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to check payment account status</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return null
  }

  // Account is fully set up
  if (isFullySetup) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          Payment account active
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          Your Stripe account is fully set up and ready to receive payments.
        </AlertDescription>
      </Alert>
    )
  }

  // Account has outstanding requirements or needs onboarding
  if (needsOnboarding || hasRequirements) {
    return (
      <>
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-yellow-900 dark:text-yellow-100">
                  Payment account setup required
                </CardTitle>
              </div>
              <CreditCard className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {!status.has_stripe_account
                  ? 'You need to set up your payment account to start selling and receiving payments.'
                  : 'Your payment account needs additional information to process payments.'}
              </p>

              {status.message && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  {status.message}
                </p>
              )}

              {hasRequirements && status.requirements && (
                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-md border border-yellow-300 dark:border-yellow-700">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Required actions:
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside space-y-1">
                    {status.requirements.currently_due?.map((req, idx) => (
                      <li key={idx}>{req.replace(/_/g, ' ')}</li>
                    ))}
                    {status.requirements.past_due?.map((req, idx) => (
                      <li key={idx} className="text-red-600 dark:text-red-400 font-semibold">
                        {req.replace(/_/g, ' ')} (overdue)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button onClick={() => setDialogOpen(true)} className="w-full" size="lg">
              {!status.has_stripe_account ? 'Set up payment account' : 'Complete account setup'}
            </Button>
          </CardContent>
        </Card>
        <StripeAccountSetupDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onComplete={handleSetupComplete}
        />
      </>
    )
  }

  // No account
  if (!status.has_stripe_account && status.eligible_for_creation) {
    return (
      <>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment account not set up</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>You need to set up a payment account to start selling.</p>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              Set up now
            </Button>
          </AlertDescription>
        </Alert>
        <StripeAccountSetupDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onComplete={handleSetupComplete}
        />
      </>
    )
  }

  // Not eligible
  if (!status.eligible_for_creation && status.eligibility_errors) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to create payment account</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {status.eligibility_errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
