import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'
import { useCartStore } from '@/features/cart/stores/cartStore'

interface PaymentFormProps {
  onSuccess: () => void
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { clearCart } = useCartStore()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
      redirect: 'if_required', // Avoid redirect if backend handles confirmation differently
    })

    if (error) {
      setErrorMessage(error.message ?? 'An unexpected error occurred.')
      setIsProcessing(false)
    } else {
      // Payment succeeded!
      clearCart()
      toast.success('Payment successful!')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={!stripe || isProcessing}
          className="min-w-[150px]"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  )
}
