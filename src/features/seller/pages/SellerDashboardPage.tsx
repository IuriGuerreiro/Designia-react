import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'

export function SellerDashboardPage() {
  const stats = [
    {
      title: 'Total Sales',
      value: '$12,450.00',
      icon: DollarSign,
      trend: '+12% from last month',
    },
    {
      title: 'Active Orders',
      value: '24',
      icon: ShoppingBag,
      trend: '5 awaiting shipment',
    },
    {
      title: 'Active Products',
      value: '48',
      icon: Package,
      trend: '2 out of stock',
    },
    {
      title: 'Total Views',
      value: '1.2k',
      icon: TrendingUp,
      trend: '+5% from yesterday',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
          Chart placeholder - Integration with analytics coming soon
        </CardContent>
      </Card>
    </div>
  )
}
