import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerStatus } from '../../api/sellerApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SellerOnboardingReturn() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Poll status or just check once
        const profile = await getSellerStatus()

        if (profile.payouts_enabled) {
          setStatus('success')
        } else if (profile.status === 'pending' || profile.status === 'verified') {
          setStatus('pending')
        } else {
          setStatus('error')
          setErrorDetails('Your account setup is incomplete.')
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Failed to check status', error)
        setStatus('error')

        const details = error.response?.data?.details
        const errorMsg = Array.isArray(details)
          ? details.join(' ')
          : details || error.message || 'Unknown error'
        setErrorDetails(errorMsg)

        if (errorMsg.includes('Two-factor authentication') || errorMsg.includes('2FA')) {
          toast.error('Security Requirement: 2FA Required', {
            description: 'You must enable Two-Factor Authentication to manage your seller account.',
            action: {
              label: 'Enable 2FA',
              onClick: () => navigate('/settings?tab=security'),
            },
            duration: 8000,
          })
        }
      }
    }

    checkStatus()
  }, [navigate])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Verifying your account...</h2>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
            {status === 'pending' && <CheckCircle2 className="h-16 w-16 text-yellow-500" />}
            {status === 'error' && <AlertTriangle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle>
            {status === 'success' && "You're all set!"}
            {status === 'pending' && 'Verification in Progress'}
            {status === 'error' && 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-6">
            {status === 'success' && (
              <p>Your seller account is active. You can now start listing products.</p>
            )}
            {status === 'pending' && (
              <p>
                We've received your details. Stripe is currently verifying your information. This
                usually takes a few minutes.
              </p>
            )}
            {status === 'error' && (
              <div className="space-y-2">
                <p>We couldn't verify your account setup.</p>
                {errorDetails && (
                  <p className="text-sm p-3 bg-destructive/10 text-destructive rounded-md font-mono break-words">
                    {errorDetails}
                  </p>
                )}
                <p className="text-sm">Please try again or contact support.</p>
              </div>
            )}
          </div>

          <Button
            onClick={() =>
              navigate(status === 'error' ? '/seller/onboarding' : '/seller/dashboard')
            }
            className="w-full"
          >
            {status === 'error' ? 'Back to Onboarding' : 'Go to Seller Dashboard'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
