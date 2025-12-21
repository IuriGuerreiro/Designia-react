import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Loader2, Package, Truck, ExternalLink, MapPin } from 'lucide-react'
import { getSellerOrders } from '../../api/ordersApi'
import { FulfillmentDialog } from './FulfillmentDialog'
import type { OrderDetail, OrderStatus } from '@/features/orders/types'

export function SellerOrderList() {
  const [page] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [isFulfillOpen, setIsFulfillOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller-orders', page, status],
    queryFn: () => getSellerOrders(page, 10, status === 'all' ? undefined : status),
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

  const handleFulfill = (order: OrderDetail) => {
    setSelectedOrder(order)
    setIsFulfillOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Failed to load orders.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage your sales and fulfill pending orders.</p>
        </div>
        <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 md:inline-flex">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="awaiting_shipment">Pending</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.results.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}</TableCell>
                <TableCell className="text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {order.buyer.first_name} {order.buyer.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {order.shipping_address.city},{' '}
                      {order.shipping_address.country}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(order.total_amount)
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  {['payment_confirmed', 'awaiting_shipment'].includes(order.status) ? (
                    <Button size="sm" onClick={() => handleFulfill(order)}>
                      <Truck className="mr-2 h-4 w-4" /> Ship
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/orders/${order.id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {data?.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-20" />
                    <p>No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FulfillmentDialog
        order={selectedOrder}
        open={isFulfillOpen}
        onOpenChange={setIsFulfillOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['seller-orders'] })}
      />
    </div>
  )
}
