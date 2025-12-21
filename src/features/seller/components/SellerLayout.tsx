import { Link, useLocation, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getSellerOrders } from '../api/ordersApi'
import { Badge } from '@/shared/components/ui/badge'

export function SellerLayout() {
  const location = useLocation()

  const { data: pendingOrders } = useQuery({
    queryKey: ['seller-orders-pending'],
    queryFn: () => getSellerOrders(1, 1, 'awaiting_shipment'),
    refetchInterval: 30000, // Poll every 30s for new orders
  })

  const pendingCount = pendingOrders?.count || 0

  const navItems = [
    {
      title: 'Dashboard',
      href: '/seller/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Products',
      href: '/seller/products',
      icon: Package,
    },
    {
      title: 'Orders',
      href: '/seller/orders',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      title: 'Analytics',
      href: '/seller/analytics',
      icon: BarChart3,
    },
    {
      title: 'Settings',
      href: '/settings?tab=general',
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-1 w-full h-full flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 border-r bg-muted/10">
        <nav className="space-y-1 p-4">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
