import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  onAuthRequired: () => void
}

export function ProtectedRoute({ children, onAuthRequired }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    // If not loading and not authenticated, trigger auth modal
    if (!isLoading && !isAuthenticated) {
      onAuthRequired()
    }
  }, [isAuthenticated, isLoading, onAuthRequired])

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
