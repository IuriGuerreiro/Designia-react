import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerStatus } from '../../api/sellerApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

export function SellerOnboardingReturn() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Poll status or just check once
        const profile = await getSellerStatus()

        if (profile.payouts_enabled) {
          setStatus('success')
        } else if (profile.status === 'pending' || profile.status === 'verified') {
          // 'verified' in our type map means payouts_enabled, but if charges_enabled is true and payouts pending?
          // Actually, standard connect: 'details_submitted' means pending verification.
          setStatus('pending')
        } else {
          // User might have bailed out
          setStatus('error')
        }
      } catch (error) {
        console.error('Failed to check status', error)
        setStatus('error')
      }
    }

    checkStatus()
  }, [])

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
          <p className="text-muted-foreground mb-6">
            {status === 'success' &&
              'Your seller account is active. You can now start listing products.'}
            {status === 'pending' &&
              "We've received your details. Stripe is currently verifying your information. This usually takes a few minutes."}
            {status === 'error' &&
              "We couldn't verify your account setup. Please try again or contact support."}
          </p>

          <Button onClick={() => navigate('/seller/dashboard')} className="w-full">
            Go to Seller Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
