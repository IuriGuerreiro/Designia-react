import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, Loader2 } from 'lucide-react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { stripePromise } from '@/shared/lib/stripe'
import { createCheckoutSession } from '../api/checkoutApi'
import { Button } from '@/shared/components/ui/button'

export function CheckoutPage() {
  const { items } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(true) // Set to true to start loading immediately

  useEffect(() => {
    // If cart is empty, we don't need to fetch secret, but we let the hook run.
    if (items.length === 0) {
      setIsLoadingPayment(false)
      return
    }

    const fetchClientSecret = async () => {
      setIsLoadingPayment(true)
      try {
        // Create Checkout Session
        const response = await createCheckoutSession()
        console.log('Checkout Session Response:', response)

        // Cast to any to safely check for snake_case fallback without TS errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any
        const secret = responseAny.clientSecret || responseAny.client_secret

        if (secret) {
          setClientSecret(secret)
        } else {
          throw new Error(`No client secret returned. Response: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error('Failed to init payment:', error)
        // alert('Payment initialization failed.')
      } finally {
        setIsLoadingPayment(false)
      }
    }

    fetchClientSecret()
  }, [items.length]) // Add items.length as dependency to re-evaluate if cart changes

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button asChild className="mt-6">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header / Breadcrumb */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/cart" className="hover:text-foreground">
              Cart
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="font-semibold text-foreground">Checkout</span>
          </div>
          {!isAuthenticated && (
            <div className="text-sm">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-12 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={
                    'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold bg-primary text-primary-foreground border-primary'
                  }
                >
                  1
                </div>
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              <div className="pl-12">
                {isLoadingPayment ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : clientSecret ? (
                  <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 text-destructive rounded-md text-sm">
                    Unable to initialize payment system. Please try again or contact support.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
