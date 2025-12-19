import { useState } from 'react'
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js'
import { loadConnectAndInitialize } from '@stripe/connect-js'
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

// Ideally move this to a hook or context if used elsewhere
const stripeConnectInstance = loadConnectAndInitialize({
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

export function SellerOnboardingEmbedded() {
  const navigate = useNavigate()
  const [isInitializing, setIsInitializing] = useState(false)
  const [showEmbedded, setShowEmbedded] = useState(false)

  const handleStartOnboarding = async () => {
    try {
      setIsInitializing(true)
      // 1. Ensure Account Exists
      await createStripeAccount()

      // 2. Show Embedded Component (which calls fetchClientSecret -> createAccountSession)
      setShowEmbedded(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Onboarding init error:', error)
      const details = error.response?.data?.details
      const errorMsg = Array.isArray(details) ? details.join(' ') : details || ''

      if (errorMsg.includes('Two-factor authentication') || errorMsg.includes('2FA')) {
        toast.error('Security Requirement: 2FA Required', {
          description: 'You must enable Two-Factor Authentication to become a seller.',
          action: {
            label: 'Enable 2FA',
            onClick: () => navigate('/settings?tab=security'),
          },
          duration: 8000,
        })
      } else {
        toast.error('Failed to initiate onboarding. ' + errorMsg)
      }
    } finally {
      setIsInitializing(false)
    }
  }

  const handleOnboardingExit = () => {
    // Determine where to go - probably verify status or dashboard
    navigate('/seller/onboarding/return')
  }

  if (showEmbedded) {
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
        <CardContent>
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
