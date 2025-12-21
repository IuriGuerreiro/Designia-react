import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { Button } from '@/shared/components/ui/button'
import type { User } from '@/features/auth/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  onAuthRequired: () => void
  requiredRole?: User['role']
}

export function ProtectedRoute({ children, onAuthRequired, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  useEffect(() => {
    // If not loading and not authenticated, trigger auth modal
    if (!isLoading && !isAuthenticated) {
      onAuthRequired()
    }
  }, [isAuthenticated, isLoading, onAuthRequired])

  // Don't render anything while checking auth status to prevent flicker
  // or if not authenticated (waiting for modal or user action)
  if (isLoading || !isAuthenticated) {
    return null
  }

  // Check role requirement
  // We allow 'admin' to access everything
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in zoom-in duration-300">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You don't have permission to access this area. This section is restricted to{' '}
          {requiredRole}s only.
        </p>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
          {requiredRole === 'seller' && (
            <Button asChild>
              <Link to="/seller/onboarding">Become a Seller</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
