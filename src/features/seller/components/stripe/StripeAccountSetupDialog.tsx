import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js'
import { loadConnectAndInitialize } from '@stripe/connect-js'
import type { StripeConnectInstance } from '@stripe/connect-js'
import { createStripeAccount, createAccountSession } from '../../api/sellerApi'
import { Button } from '@/shared/components/ui/button'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface StripeAccountSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function StripeAccountSetupDialog({
  open,
  onOpenChange,
  onComplete,
}: StripeAccountSetupDialogProps) {
  const navigate = useNavigate()
  const [isInitializing, setIsInitializing] = useState(false)
  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(
    null
  )
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    if (open && !stripeConnectInstance) {
      initializeStripe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const initializeStripe = async () => {
    try {
      setIsInitializing(true)
      setErrorDetails(null)

      // 1. Ensure Account Exists
      await createStripeAccount()

      // 2. Pre-validate account session creation
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
              onClick: () => {
                onOpenChange(false)
                navigate('/settings?tab=security')
              },
            },
            duration: 8000,
          })
        } else if (errorMsg.includes('password')) {
          toast.error('Password Required', {
            description: 'You must set up a password to become a seller.',
            action: {
              label: 'Set Password',
              onClick: () => {
                onOpenChange(false)
                navigate('/settings?tab=security')
              },
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

      // 3. Initialize Stripe Connect Instance
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Stripe initialization error:', error)
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
            onClick: () => {
              onOpenChange(false)
              navigate('/settings?tab=security')
            },
          },
          duration: 8000,
        })
      } else {
        toast.error('Failed to initialize payment setup', {
          description: errorMsg || 'An unexpected error occurred.',
        })
      }
    } finally {
      setIsInitializing(false)
    }
  }

  const handleOnboardingExit = () => {
    onOpenChange(false)
    if (onComplete) {
      onComplete()
    }
  }

  const handleRetry = () => {
    setStripeConnectInstance(null)
    setErrorDetails(null)
    initializeStripe()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment Account Setup</DialogTitle>
          <DialogDescription>
            Provide your business details to receive payments through Stripe.
          </DialogDescription>
        </DialogHeader>

        {isInitializing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing secure setup...</p>
          </div>
        )}

        {errorDetails && !isInitializing && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-destructive">Setup Error</p>
                <p className="text-sm text-muted-foreground max-w-md">{errorDetails}</p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!isInitializing && !errorDetails && stripeConnectInstance && (
          <div className="min-h-[500px]">
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectAccountOnboarding onExit={handleOnboardingExit} />
            </ConnectComponentsProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
