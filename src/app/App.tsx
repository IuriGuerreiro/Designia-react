import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { HeaderSearchBar } from '@/features/products/components/filters/HeaderSearchBar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/components/ui/sonner'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { HomePage } from './pages/HomePage'
import { ProductBrowsePage } from './pages/ProductBrowsePage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { SettingsPage } from '@/features/account/pages/SettingsPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  const { checkAuth, isAuthenticated } = useAuthStore()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleOpenLogin = () => {
    setAuthView('login')
    setAuthDialogOpen(true)
  }

  const handleOpenRegister = () => {
    setAuthView('register')
    setAuthDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className="container flex h-20 items-center justify-between px-6 mx-auto"
          style={{ maxWidth: '1400px' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
              DESGINIA
            </Link>
          </div>

          {/* Search Bar */}
          <HeaderSearchBar />

          {/* Auth & Cart */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart (0)</span>
            </Button>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleOpenLogin}>
                  Sign In
                </Button>
                <Button onClick={handleOpenRegister}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultView={authView} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductBrowsePage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      </Routes>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-6 text-center" style={{ maxWidth: '1400px' }}>
          <p className="text-sm text-muted-foreground">
            © 2025 Desginia Marketplace. Design System Foundation Complete.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}

export function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Router>
  )
}
