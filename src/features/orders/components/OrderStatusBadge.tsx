import { Badge } from '@/shared/components/ui/badge'
import type { OrderStatus } from '../types'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200'
      case 'awaiting_shipment':
      case 'payment_confirmed':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200'
      case 'pending_payment':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200'
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
      default:
        return ''
    }
  }

  return (
    <Badge variant="outline" className={`${getBadgeStyle(status)} capitalize`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
