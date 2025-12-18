import { OrderList } from '../components/OrderList'

export function OrderHistoryPage() {
  return (
    <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1400px' }}>
      <h1 className="text-3xl font-bold mb-2">Order History</h1>
      <p className="text-muted-foreground mb-8">View and manage your past orders.</p>
      <OrderList />
    </div>
  )
}
