import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { getSellerOrderById } from '../api/ordersApi'
import { FulfillmentDialog } from '../components/orders/FulfillmentDialog'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Mail,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react'
import type { OrderStatus } from '@/features/orders/types'

export function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [isFulfillOpen, setIsFulfillOpen] = useState(false)

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['seller-order', id],
    queryFn: () => getSellerOrderById(id!),
    enabled: !!id,
  })

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'payment_confirmed':
      case 'awaiting_shipment':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Ready to Ship
          </Badge>
        )
      case 'shipped':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Shipped
          </Badge>
        )
      case 'delivered':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            Delivered
          </Badge>
        )
      case 'pending_payment':
        return <Badge variant="outline">Pending Payment</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-order', id] })
    queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
  }

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
          <Link to="/seller/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const canShip = ['payment_confirmed', 'awaiting_shipment'].includes(order.status)

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link to="/seller/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id?.slice(0, 8) ?? 'N/A'}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(order.created_at)
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canShip && (
            <Button onClick={() => setIsFulfillOpen(true)}>
              <Truck className="h-4 w-4 mr-2" />
              Ship Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items to Fulfill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0 border overflow-hidden">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/products/${item.product?.slug || item.product?.id}`}
                          target="_blank"
                          className="font-medium hover:underline text-base"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {item.product?.id?.slice(0, 8) ?? 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(parseFloat(item.total_price))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} ×{' '}
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(parseFloat(item.unit_price))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">
                      {order.payment_status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                      parseFloat(order.total_amount)
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Customer & Shipping */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {order.buyer.first_name} {order.buyer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">@{order.buyer.username}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <a
                    href={`mailto:${order.buyer.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {order.buyer.email}
                  </a>
                </div>
              </div>
              {order.buyer_notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">Note from Buyer:</p>
                  <p className="text-yellow-900">{order.buyer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex items-start gap-3 mb-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
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
                </div>
              </div>
            </CardContent>
          </Card>

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

          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Shipment Info
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <FulfillmentDialog
        order={order}
        open={isFulfillOpen}
        onOpenChange={setIsFulfillOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
