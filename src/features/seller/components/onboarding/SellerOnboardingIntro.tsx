import { useState } from 'react'
import { initiateOnboarding } from '../../api/sellerApi'
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

export function SellerOnboardingIntro() {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartOnboarding = async () => {
    try {
      setIsLoading(true)
      const response = await initiateOnboarding()
      if (response.url) {
        window.location.href = response.url // Redirect to Stripe
      } else {
        toast.error('Failed to start onboarding. No URL returned.')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to initiate onboarding.')
    } finally {
      setIsLoading(false)
    }
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
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting to Stripe...
              </>
            ) : (
              <>
                Connect with Stripe <ArrowRight className="ml-2 h-5 w-5" />
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
