import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { Package, ShoppingBag, DollarSign, Eye, ArrowRight, AlertCircle, Clock } from 'lucide-react'
import { StripeAccountAlert } from '../components/stripe/StripeAccountAlert'
import { useSellerAnalytics } from '../hooks'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const formatNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}

export function SellerDashboardPage() {
  const { user } = useAuthStore()
  const { data: analytics, isLoading, isError } = useSellerAnalytics('month')

  const stats = [
    {
      title: 'Total Revenue',
      value: isLoading ? null : formatCurrency(analytics?.total_revenue ?? 0),
      icon: DollarSign,
      trend: isLoading ? null : `${analytics?.total_items_sold ?? 0} items sold`,
    },
    {
      title: 'Active Orders',
      value: isLoading ? null : (analytics?.total_orders ?? 0).toString(),
      icon: ShoppingBag,
      trend: isLoading ? null : `${analytics?.pending_fulfillment_count ?? 0} awaiting shipment`,
    },
    {
      title: 'Active Products',
      value: isLoading ? null : (analytics?.active_products ?? 0).toString(),
      icon: Package,
      trend: isLoading
        ? null
        : `${(analytics?.total_products ?? 0) - (analytics?.active_products ?? 0)} inactive`,
    },
    {
      title: 'Total Views',
      value: isLoading ? null : formatNumber(analytics?.total_views ?? 0),
      icon: Eye,
      trend: isLoading ? null : `${analytics?.view_to_click_rate ?? 0}% click rate`,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store this month.
          </p>
        </div>
        {user?.last_login && (
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border flex items-center gap-2 self-start md:self-auto">
            <Clock className="h-4 w-4" />
            <span>
              Last login:{' '}
              <span className="font-medium">{new Date(user.last_login).toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      <StripeAccountAlert />

      {isError && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load analytics data. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link to="/seller/products/new">
            <Button variant="outline" className="w-full justify-between">
              Add New Product
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/seller/orders">
            <Button variant="outline" className="w-full justify-between">
              View Orders
              {analytics?.pending_fulfillment_count ? (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {analytics.pending_fulfillment_count}
                </span>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </Link>
          <Link to="/seller/analytics">
            <Button variant="outline" className="w-full justify-between">
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : analytics?.recent_orders && analytics.recent_orders.length > 0 ? (
            <div className="space-y-4">
              {analytics.recent_orders.slice(0, 3).map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">Order from {order.buyer_username}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''} -{' '}
                      {order.status.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
              ))}
              <Link to="/seller/orders">
                <Button variant="ghost" className="w-full">
                  View all orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent orders. Start by adding products to your store!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
