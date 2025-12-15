import { Link } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useState } from 'react'

export function OrderConfirmationPage() {
  const [orderId] = useState(() => Math.floor(Math.random() * 100000))

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-sm border animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-md text-sm text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium font-mono">#ORD-{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-medium">3-5 Business Days</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/products">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
