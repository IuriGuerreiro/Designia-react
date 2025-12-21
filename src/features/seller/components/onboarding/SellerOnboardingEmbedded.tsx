import { useState } from 'react'
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js'
import { loadConnectAndInitialize } from '@stripe/connect-js'
import type { StripeConnectInstance } from '@stripe/connect-js'
import { createStripeAccount, createAccountSession } from '../../api/sellerApi'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'
import { CheckCircle2, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function SellerOnboardingEmbedded() {
  const navigate = useNavigate()
  const [isInitializing, setIsInitializing] = useState(false)
  const [showEmbedded, setShowEmbedded] = useState(false)
  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(
    null
  )
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const handleStartOnboarding = async () => {
    try {
      setIsInitializing(true)
      setErrorDetails(null)
      // 1. Ensure Account Exists
      await createStripeAccount()

      // 2. Pre-validate that we can create an account session before initializing Stripe
      console.log('Pre-validating account session creation...')
      try {
        const { client_secret } = await createAccountSession()
        console.log(
          'Account session validation successful:',
          client_secret.substring(0, 20) + '...'
        )
      } catch (sessionError: unknown) {
        console.error('Account session creation failed:', sessionError)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = sessionError as any
        const errorData = err.response?.data
        const details = errorData?.details || errorData?.error
        const errorMsg = Array.isArray(details) ? details.join(' ') : details || err.message || ''

        setErrorDetails(errorMsg)

        if (
          errorMsg.includes('Two-factor authentication') ||
          errorMsg.includes('2FA') ||
          errorMsg.includes('two_factor')
        ) {
          toast.error('Security Requirement: 2FA Required', {
            description: 'You must enable Two-Factor Authentication to become a seller.',
            action: {
              label: 'Enable 2FA',
              onClick: () => navigate('/settings?tab=security'),
            },
            duration: 8000,
          })
        } else if (errorMsg.includes('password')) {
          toast.error('Password Required', {
            description: 'You must set up a password to become a seller.',
            action: {
              label: 'Set Password',
              onClick: () => navigate('/settings?tab=security'),
            },
            duration: 8000,
          })
        } else {
          toast.error('Failed to create account session', {
            description: errorMsg || 'Please check your account requirements.',
          })
        }
        setIsInitializing(false)
        return
      }

      // 3. Initialize Stripe Connect Instance AFTER validation
      const instance = loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret: async () => {
          const { client_secret } = await createAccountSession()
          return client_secret
        },
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#0f172a',
          },
        },
      })
      setStripeConnectInstance(instance)

      // 4. Show Embedded Component (now fetchClientSecret will succeed)
      setShowEmbedded(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Onboarding init error:', error)
      const errorData = error.response?.data
      const details = errorData?.details || errorData?.error
      const errorMsg = Array.isArray(details) ? details.join(' ') : details || error.message || ''

      setErrorDetails(errorMsg)

      if (
        errorMsg.includes('Two-factor authentication') ||
        errorMsg.includes('2FA') ||
        errorMsg.includes('two_factor')
      ) {
        toast.error('Security Requirement: 2FA Required', {
          description: 'You must enable Two-Factor Authentication to become a seller.',
          action: {
            label: 'Enable 2FA',
            onClick: () => navigate('/settings?tab=security'),
          },
          duration: 8000,
        })
      } else {
        toast.error('Failed to initiate onboarding', {
          description: errorMsg || 'An unexpected error occurred.',
        })
      }
    } finally {
      setIsInitializing(false)
    }
  }

  const handleOnboardingExit = () => {
    // Determine where to go - probably verify status or dashboard
    navigate('/seller/onboarding/return')
  }

  if (showEmbedded && stripeConnectInstance) {
    return (
      <div className="container mx-auto py-12">
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding onExit={handleOnboardingExit} />
        </ConnectComponentsProvider>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Start Selling on Desginia</h1>
        <p className="text-lg text-muted-foreground">
          Join our marketplace and reach thousands of customers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <Card>
          <CardHeader>
            <ShieldCheck className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Secure Payments</CardTitle>
            <CardDescription>
              We partner with Stripe to ensure safe and timely payouts directly to your bank
              account.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Easy Management</CardTitle>
            <CardDescription>
              Manage your products, orders, and inventory from a dedicated seller dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Ready to get started?</CardTitle>
          <CardDescription>
            You'll need to verify your identity and business details with Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorDetails && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-mono break-words border border-destructive/20">
              <p className="font-bold mb-1">Configuration Error:</p>
              {errorDetails}
            </div>
          )}

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleStartOnboarding}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Start Verification <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Seller Terms of Service and the Stripe Connected Account
            Agreement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
