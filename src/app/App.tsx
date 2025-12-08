import { useEffect, useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { Toaster } from '@/shared/components/ui/sonner'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

// Mock product data
const products = [
  { id: 1, title: 'Premium Running Shoes', price: 129.99, rating: 5, reviews: 128 },
  { id: 2, title: 'Wireless Headphones', price: 89.99, rating: 4, reviews: 64 },
  { id: 3, title: 'Smart Watch Pro', price: 299.99, rating: 5, reviews: 203 },
  { id: 4, title: 'Laptop Backpack', price: 49.99, rating: 4, reviews: 89 },
]

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
    <div className="min-h-screen bg-background">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className="container flex h-20 items-center justify-between px-6 mx-auto"
          style={{ maxWidth: '1400px' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary tracking-tight">DESGINIA</h1>
            <Toaster />
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
              <Toaster />
            </div>
            <Toaster />
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
                <Button variant="ghost" onClick={handleOpenLogin}>
                  Sign In
                </Button>
                <Button onClick={handleOpenRegister}>Sign Up</Button>
                <Toaster />
              </div>
            )}
            <Toaster />
          </div>
          <Toaster />
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultView={authView} />

      {/* Hero Section */}
      <section className="bg-blue-50 border-b">
        <div className="container mx-auto px-6 py-24" style={{ maxWidth: '1400px' }}>
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect Product
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover unique items from trusted sellers. Fast search, secure checkout, exceptional
              quality.
            </p>
            <Button size="lg" className="h-12 px-8 text-base">
              Shop Now
            </Button>
            <Toaster />
          </div>
          <Toaster />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-6" style={{ maxWidth: '1400px' }}>
          <h2 className="text-3xl font-bold text-foreground mb-8">Featured Products</h2>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-0">
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-muted-foreground/20 text-6xl font-bold">
                        {product.id}
                        <Toaster />
                      </div>
                      <Toaster />
                    </div>
                    {/* Verified Badge - Top Left */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-secondary/90 text-white">
                        Verified
                      </Badge>
                      <Toaster />
                    </div>
                    <Toaster />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-base text-foreground line-clamp-2 min-h-[3rem]">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-sm">
                      <div className="flex text-yellow-500">
                        {'★'.repeat(product.rating)}
                        {'☆'.repeat(5 - product.rating)}
                        <Toaster />
                      </div>
                      <span className="text-muted-foreground">({product.reviews})</span>
                      <Toaster />
                    </div>

                    {/* Price */}
                    <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                    <Toaster />
                  </div>
                </CardContent>

                {/* Add to Cart Button */}
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full h-11">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
            <Toaster />
          </div>
          <Toaster />
        </div>
      </section>

      {/* Component Showcase Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-6" style={{ maxWidth: '1400px' }}>
          <h2 className="text-3xl font-bold text-foreground mb-8">Design System Components</h2>

          {/* Button Hierarchy */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Button Hierarchy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Navy Slate primary buttons command attention without being aggressive. Only ONE
              primary button per view.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button>Primary (Navy Fill)</Button>
              <Button variant="outline">Secondary (Navy Border)</Button>
              <Button variant="ghost">Ghost (Transparent)</Button>
              <Button variant="destructive">Destructive (Red)</Button>
              <Toaster />
            </div>
            <Toaster />
          </div>

          {/* Input Fields */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Form Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <Input placeholder="Email address" type="email" />
              <Input placeholder="Password" type="password" />
              <Input placeholder="Disabled" disabled />
              <Toaster />
            </div>
            <Toaster />
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Navy Slate Color System</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Professional, trustworthy aesthetic matching "payment marketplace" positioning.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-primary border-2 border-primary"></div>
                <p className="text-sm font-semibold">Primary</p>
                <p className="text-xs text-muted-foreground font-mono">#0f172a</p>
                <p className="text-xs text-muted-foreground">Navy Slate</p>
                <Toaster />
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-secondary border-2 border-secondary"></div>
                <p className="text-sm font-semibold">Secondary</p>
                <p className="text-xs text-muted-foreground font-mono">#475569</p>
                <p className="text-xs text-muted-foreground">Slate Medium</p>
                <Toaster />
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-muted border-2 border-border"></div>
                <p className="text-sm font-semibold">Muted</p>
                <p className="text-xs text-muted-foreground font-mono">#f1f5f9</p>
                <p className="text-xs text-muted-foreground">Light Slate</p>
                <Toaster />
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-background border-2 border-border"></div>
                <p className="text-sm font-semibold">Background</p>
                <p className="text-xs text-muted-foreground font-mono">#f8fafc</p>
                <p className="text-xs text-muted-foreground">Off White</p>
                <Toaster />
              </div>
              <Toaster />
            </div>
            <Toaster />
          </div>
          <Toaster />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-6 text-center" style={{ maxWidth: '1400px' }}>
          <p className="text-sm text-muted-foreground">
            © 2025 Desginia Marketplace. Design System Foundation Complete.
          </p>
          <Toaster />
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
