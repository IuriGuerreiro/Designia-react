import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, Loader2 } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { ShippingForm } from '../components/ShippingForm'
import { OrderSummary } from '../components/OrderSummary'
import { PaymentForm } from '../components/PaymentForm'
import { useCartStore, useCartSubtotal } from '@/features/cart/stores/cartStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { stripePromise } from '@/shared/lib/stripe'
import { createPaymentIntent } from '../api/checkoutApi'
import type { ShippingAddress } from '../types'
import { Button } from '@/shared/components/ui/button'

export function CheckoutPage() {
  const { items } = useCartStore()
  const subtotal = useCartSubtotal()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

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

  const handleShippingSubmit = async (data: ShippingAddress) => {
    setShippingAddress(data)
    setStep('payment')
    setIsLoadingPayment(true)

    try {
      // Calculate total (mock tax/shipping logic from OrderSummary should be centralized ideally)
      const taxRate = 0.08
      const shippingCost = 0
      const total = subtotal + shippingCost + subtotal * taxRate

      // Amount in cents
      const amountInCents = Math.round(total * 100)

      // Fetch client secret from backend
      const { clientSecret } = await createPaymentIntent(amountInCents)
      setClientSecret(clientSecret)
    } catch (error) {
      console.error('Failed to init payment:', error)
      // For Demo/Dev purposes without a real backend payment intent endpoint:
      // We might mock it or show error.
      // If VITE_STRIPE_PUBLISHABLE_KEY is valid but no backend intent, Elements won't load.
      // alert('Backend payment intent creation failed. Check console.')
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handlePaymentSuccess = () => {
    navigate('/checkout/confirmation')
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
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${step === 'shipping' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  1
                </div>
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>

              {step === 'shipping' ? (
                <div className="pl-12">
                  <ShippingForm onSubmit={handleShippingSubmit} />
                </div>
              ) : (
                <div className="pl-12 p-4 bg-muted/20 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{shippingAddress?.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {shippingAddress?.city}, {shippingAddress?.state}{' '}
                        {shippingAddress?.postal_code}
                      </p>
                      <p className="text-sm text-muted-foreground">{shippingAddress?.country}</p>
                    </div>
                    <Button variant="link" onClick={() => setStep('shipping')}>
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`space-y-6 ${step === 'shipping' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${step === 'payment' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  2
                </div>
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              {step === 'payment' && (
                <div className="pl-12">
                  {isLoadingPayment ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <div className="p-4 border border-destructive/20 bg-destructive/5 text-destructive rounded-md text-sm">
                      Unable to initialize payment system. Please try again or contact support.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
