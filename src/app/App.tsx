import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { Toaster } from '@/shared/components/ui/sonner'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from '@/features/account/pages/SettingsPage'

export function App() {
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
    <Router>
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
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-10 h-10 border-input focus-visible:ring-primary"
                />
              </div>
            </div>

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
          <Route path="/settings" element={<SettingsPage />} />
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
    </Router>
  )
}
