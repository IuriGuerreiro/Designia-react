import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { HeaderSearchBar } from '@/features/products/components/filters/HeaderSearchBar'
import { CartIndicator } from '@/features/cart/components/CartIndicator'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/components/ui/sonner'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { HomePage } from './pages/HomePage'
import { PageSkeleton } from '@/shared/components/skeletons/PageSkeleton'

// Lazy loaded components
const ProductBrowsePage = lazy(() =>
  import('./pages/ProductBrowsePage').then(m => ({ default: m.ProductBrowsePage }))
)
const ProductDetailPage = lazy(() =>
  import('@/features/products/pages/ProductDetailPage').then(m => ({
    default: m.ProductDetailPage,
  }))
)
const SettingsPage = lazy(() =>
  import('@/features/account/pages/SettingsPage').then(m => ({ default: m.SettingsPage }))
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage }))
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage }))
)
const CheckoutPage = lazy(() =>
  import('@/features/checkout/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage }))
)
const OrderConfirmationPage = lazy(() =>
  import('@/features/checkout/pages/OrderConfirmationPage').then(m => ({
    default: m.OrderConfirmationPage,
  }))
)
const OrderHistoryPage = lazy(() =>
  import('@/features/orders/pages/OrderHistoryPage').then(m => ({ default: m.OrderHistoryPage }))
)
const OrderDetailPage = lazy(() =>
  import('@/features/orders/pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage }))
)
const SellerOnboardingPage = lazy(() =>
  import('@/features/seller/pages/SellerOnboardingPage').then(m => ({
    default: m.SellerOnboardingPage,
  }))
)
const SellerOnboardingEmbedded = lazy(() =>
  import('@/features/seller/components/onboarding/SellerOnboardingEmbedded').then(m => ({
    default: m.SellerOnboardingEmbedded,
  }))
)
const SellerOnboardingReturn = lazy(() =>
  import('@/features/seller/components/onboarding/SellerOnboardingReturn').then(m => ({
    default: m.SellerOnboardingReturn,
  }))
)
const SellerDashboardPage = lazy(() =>
  import('@/features/seller/pages/SellerDashboardPage').then(m => ({
    default: m.SellerDashboardPage,
  }))
)
const SellerProductsPage = lazy(() =>
  import('@/features/seller/pages/SellerProductsPage').then(m => ({
    default: m.SellerProductsPage,
  }))
)
const SellerProductCreatePage = lazy(() =>
  import('@/features/seller/pages/SellerProductCreatePage').then(m => ({
    default: m.SellerProductCreatePage,
  }))
)
const SellerProductEditPage = lazy(() =>
  import('@/features/seller/pages/SellerProductEditPage').then(m => ({
    default: m.SellerProductEditPage,
  }))
)
const SellerOrdersPage = lazy(() =>
  import('@/features/seller/pages/SellerOrdersPage').then(m => ({ default: m.SellerOrdersPage }))
)
const SellerOrderDetailPage = lazy(() =>
  import('@/features/seller/pages/SellerOrderDetailPage').then(m => ({
    default: m.SellerOrderDetailPage,
  }))
)
const SellerAnalyticsPage = lazy(() =>
  import('@/features/seller/pages/SellerAnalyticsPage').then(m => ({
    default: m.SellerAnalyticsPage,
  }))
)
const ChatPage = lazy(() =>
  import('@/features/chat/pages/ChatPage').then(m => ({ default: m.ChatPage }))
)
const SellerLayout = lazy(() =>
  import('@/features/seller/components/SellerLayout').then(m => ({ default: m.SellerLayout }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/error/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
)
const ServerErrorPage = lazy(() =>
  import('@/pages/error/ServerErrorPage').then(m => ({ default: m.ServerErrorPage }))
)

import { SkipToContent } from '@/shared/components/a11y/SkipToContent'
import { ProtectedRoute } from './components/ProtectedRoute'
import { WebSocketProvider } from '@/context/WebSocketContext'

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  const navigate = useNavigate()
  const { checkAuth, isAuthenticated } = useAuthStore()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login')
  const [isProtectedRouteAuth, setIsProtectedRouteAuth] = useState(false)
  const [loginWasSuccessful, setLoginWasSuccessful] = useState(false)

  const handleOpenLogin = (fromProtectedRoute = false) => {
    setAuthView('login')
    setAuthDialogOpen(true)
    setIsProtectedRouteAuth(fromProtectedRoute)
    setLoginWasSuccessful(false) // Reset on open
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()

    // Handle session expired redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('session') === 'expired') {
      toast.error('Session Expired', {
        description: 'Please sign in again to continue.',
        duration: 5000,
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleOpenLogin(false)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [checkAuth])

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
      <SkipToContent />
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
                <Button variant="outline" onClick={() => handleOpenLogin()}>
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

      <main id="main-content" className="flex-1 flex flex-col w-full">
        <Suspense fallback={<PageSkeleton />}>
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
              <Route path="orders/:id" element={<SellerOrderDetailPage />} />
              <Route path="analytics" element={<SellerAnalyticsPage />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:threadId"
              element={
                <ProtectedRoute onAuthRequired={() => handleOpenLogin(true)}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Error Pages */}
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
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
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </QueryClientProvider>
    </Router>
  )
}
