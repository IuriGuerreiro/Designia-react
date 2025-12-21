import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { HeaderSearchBar } from '@/features/products/components/filters/HeaderSearchBar'
import { CartIndicator } from '@/features/cart/components/CartIndicator'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/components/ui/sonner'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { HomePage } from './pages/HomePage'
import { ProductBrowsePage } from './pages/ProductBrowsePage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { SettingsPage } from '@/features/account/pages/SettingsPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/features/checkout/pages/OrderConfirmationPage'
import { OrderHistoryPage } from '@/features/orders/pages/OrderHistoryPage'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'
import { SellerOnboardingPage } from '@/features/seller/pages/SellerOnboardingPage'
import { SellerOnboardingEmbedded } from '@/features/seller/components/onboarding/SellerOnboardingEmbedded'
import { SellerOnboardingReturn } from '@/features/seller/components/onboarding/SellerOnboardingReturn'
import { SellerDashboardPage } from '@/features/seller/pages/SellerDashboardPage'
import { SellerProductsPage } from '@/features/seller/pages/SellerProductsPage'
import { SellerProductCreatePage } from '@/features/seller/pages/SellerProductCreatePage'
import { SellerProductEditPage } from '@/features/seller/pages/SellerProductEditPage'
import { SellerOrdersPage } from '@/features/seller/pages/SellerOrdersPage'
import { SellerLayout } from '@/features/seller/components/SellerLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  const navigate = useNavigate()
  const { checkAuth, isAuthenticated } = useAuthStore()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [isProtectedRouteAuth, setIsProtectedRouteAuth] = useState(false)
  const [loginWasSuccessful, setLoginWasSuccessful] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleOpenLogin = (fromProtectedRoute = false) => {
    setAuthView('login')
    setAuthDialogOpen(true)
    setIsProtectedRouteAuth(fromProtectedRoute)
    setLoginWasSuccessful(false) // Reset on open
  }

  const handleOpenRegister = () => {
    setAuthView('register')
    setAuthDialogOpen(true)
    setIsProtectedRouteAuth(false)
    setLoginWasSuccessful(false)
  }

  const handleAuthSuccess = () => {
    setLoginWasSuccessful(true)
    setAuthDialogOpen(false)
  }

  const handleAuthDialogChange = (open: boolean) => {
    // If dialog is closing
    if (!open) {
      // If login was successful, stay on current page
      if (loginWasSuccessful) {
        setAuthDialogOpen(false)
        setIsProtectedRouteAuth(false)
        setLoginWasSuccessful(false)
      }
      // If user manually closed without login and came from protected route, redirect to home
      else if (isProtectedRouteAuth) {
        setAuthDialogOpen(false)
        navigate('/')
        setIsProtectedRouteAuth(false)
      }
      // Normal close
      else {
        setAuthDialogOpen(false)
      }
    } else {
      setAuthDialogOpen(open)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <CartIndicator />

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

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={handleAuthDialogChange}
        onSuccess={handleAuthSuccess}
        view={authView}
        onViewChange={setAuthView}
      />
      <CartDrawer />

      <main className="flex-1 flex flex-col w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductBrowsePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout/confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/onboarding"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <SellerOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/onboarding/stripe"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <SellerOnboardingEmbedded />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/onboarding/return"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <SellerOnboardingReturn />
              </ProtectedRoute>
            }
          />

          {/* Seller Section */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)} requiredRole="seller">
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboardPage />} />
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="products/new" element={<SellerProductCreatePage />} />
            <Route path="products/:slug/edit" element={<SellerProductEditPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
          </Route>

          <Route
            path="/settings"
            element={
              <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Routes>
      </main>

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
