import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Package, ChevronRight, Truck } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderDetail } from '../types' // Changed from OrderListItem

interface OrderCardProps {
  order: OrderDetail // Changed from OrderListItem
}

export function OrderCard({ order }: OrderCardProps) {
  const displayedItems = order.items.slice(0, 3) // Show up to 3 items
  const remainingItemsCount = order.items.length - displayedItems.length

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="bg-muted/20 px-6 py-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Order Placed
            </span>
            <span className="text-sm font-medium text-foreground">
              {format(new Date(order.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Order #
            </span>
            <span
              className="text-sm font-medium font-mono text-foreground truncate max-w-[120px]"
              title={order.id}
            >
              {order.id.split('-')[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Total
            </span>
            <span className="text-sm font-bold text-primary">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                parseFloat(order.total_amount)
              )}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Item Preview (Thumbnails) */}
          <div className="flex -space-x-2 overflow-hidden py-1">
            {displayedItems.map((item, index) => (
              <div
                key={item.id}
                className="h-12 w-12 rounded-full border-2 border-background flex items-center justify-center overflow-hidden bg-slate-100"
              >
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-full w-full object-cover"
                    style={{ zIndex: displayedItems.length - index }} // Layering for visual effect
                  />
                ) : (
                  <Package className="h-6 w-6 text-slate-400" />
                )}
              </div>
            ))}
            {remainingItemsCount > 0 && (
              <div
                className="h-12 w-12 rounded-full border-2 border-background bg-slate-50 flex items-center justify-center text-xs font-medium text-slate-600"
                style={{ zIndex: 0 }}
              >
                +{remainingItemsCount}
              </div>
            )}
            {displayedItems.length === 0 &&
              remainingItemsCount === 0 && ( // Fallback if no items at all
                <div className="h-12 w-12 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="h-6 w-6" />
                </div>
              )}
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="font-medium text-foreground">
              {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
            </h4>
            <p className="text-sm text-muted-foreground">
              Payment Status: <span className="capitalize">{order.payment_status}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            {(order.status === 'shipped' || order.status === 'delivered') &&
            order.tracking_number ? (
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Truck className="h-4 w-4 mr-2" />
                Track
              </Button>
            ) : null}
            <Button asChild size="sm" className="flex-1 sm:flex-none">
              <Link to={`/orders/${order.id}`}>
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
