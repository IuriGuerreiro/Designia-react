import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../api/ordersApi'
import { OrderCard } from './OrderCard'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'
import { Loader2, Package } from 'lucide-react'

export function OrderList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Failed to load orders. Please try again later.</p>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
        <Button asChild>
          <Link to="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {data.results.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
