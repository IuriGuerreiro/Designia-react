import { useCartStore, useCartSubtotal } from '@/features/cart/stores/cartStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

interface OrderSummaryProps {
  shippingCost?: number
}

export function OrderSummary({ shippingCost = 0 }: OrderSummaryProps) {
  const { items } = useCartStore()
  const subtotal = useCartSubtotal()

  // Tax calculation (mock - usually from backend)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[300px] -mr-4 pr-4">
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.productId} className="flex gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md border bg-white flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <span className="font-medium line-clamp-1">{item.name}</span>
                  <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                </div>
                <div className="font-medium">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (est.)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
