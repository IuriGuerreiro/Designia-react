import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { getOrderById } from '../api/ordersApi'
import { OrderStatusBadge } from './OrderStatusBadge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { Loader2, ArrowLeft, Package, Truck, MapPin, RotateCcw, XCircle } from 'lucide-react'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { toast } from 'sonner'
import { ReturnRequestDialog } from './returns/ReturnRequestDialog'
import { CancelOrderDialog } from './cancel/CancelOrderDialog'
import type { OrderItem } from '../types'

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const addItem = useCartStore(state => state.addItem)
  const setIsOpen = useCartStore(state => state.setIsOpen)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  })

  const handleBuyAgain = (item: OrderItem) => {
    addItem({
      productId: item.product.id,
      name: item.product_name,
      price: item.unit_price,
      image: item.product_image,
      maxStock: 99,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    setIsOpen(true)
    toast.success('Added to cart')
  }

  const isCancellable =
    order && ['pending_payment', 'payment_confirmed', 'awaiting_shipment'].includes(order.status)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Failed to load order details.</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-1">
            Placed on{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(order.created_at)
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">ID: {order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.status === 'delivered' && (
            <Button variant="outline" size="sm" onClick={() => setReturnDialogOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Return Items
            </Button>
          )}
          {isCancellable && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={order}
      />

      <CancelOrderDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} order={order} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-24 w-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0 border overflow-hidden">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Assuming we can link to product via slug or id. Backend response doesn't explicitly guarantee slug in 'product' snapshot object, but we can try. */}
                        <Link
                          to={`/products/${item.product.slug || item.product.id || '#'}`}
                          className="font-medium hover:underline text-lg"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity} ×{' '}
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(parseFloat(item.unit_price))}
                        </p>
                      </div>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(parseFloat(item.total_price))}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleBuyAgain(item)}>
                        Buy Again
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Summary & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(order.subtotal)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(order.shipping_cost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(order.tax_amount)
                  )}
                </span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>
                    -
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                      parseFloat(order.discount_amount)
                    )}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(order.total_amount)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </CardContent>
            </Card>
          )}

          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    Tracking Number
                  </span>
                  <p className="font-mono text-sm">{order.tracking_number}</p>
                  {order.shipping_carrier && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Carrier: {order.shipping_carrier}
                    </p>
                  )}
                </div>
                {/* Add tracking URL if available, currently schema says tracking_number only but usually backend provides url or we construct it. Schema doesn't have tracking_url explicit in OrderDetailResponse but let's check. */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
