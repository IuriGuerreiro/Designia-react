import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../api/ordersApi'
import { OrderCard } from './OrderCard'
import { useNavigate } from 'react-router-dom'
import { Loader2, Package } from 'lucide-react'
import { EmptyState } from '@/shared/components/ui/EmptyState'

export function OrderList() {
  const navigate = useNavigate()
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
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Looks like you haven't placed any orders yet."
        action={{
          label: 'Start Shopping',
          onClick: () => navigate('/products'),
        }}
        className="py-12"
      />
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
