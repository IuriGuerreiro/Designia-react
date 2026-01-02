import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ProductList } from '@/features/products/components/ProductList'
import { StarRating } from '@/shared/components/ui/star-rating'
import { ProductReviews } from '@/features/products/components/ProductReviews'
import { VerifiedBadge } from '@/features/products/components/VerifiedBadge'
import { ReviewUserMeta } from '@/features/products/components/ReviewUserMeta'

export function HomePage() {
  const [demoRating, setDemoRating] = useState(0)

  return (
    <main>
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
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <a href="/products">Browse All Products</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-6" style={{ maxWidth: '1400px' }}>
          <h2 className="text-3xl font-bold text-foreground mb-8">Featured Products</h2>

          {/* Integrate ProductList */}
          <ProductList />
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
            </div>
          </div>

          {/* Input Fields */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Form Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <Input placeholder="Email address" type="email" />
              <Input placeholder="Password" type="password" />
              <Input placeholder="Disabled" disabled />
            </div>
          </div>

          {/* Review Components (New) */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Review Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div className="space-y-4 p-6 bg-background rounded-lg border">
                <h4 className="font-medium">Interactive Star Rating</h4>
                <div className="flex items-center gap-4">
                  <StarRating value={demoRating} onChange={setDemoRating} size={32} />
                  <span className="text-sm text-muted-foreground">Value: {demoRating}</span>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <span className="text-sm">Read Only:</span>
                  <StarRating value={4} readOnly size={20} />
                </div>
              </div>

              <div className="p-6 bg-background rounded-lg border col-span-1 md:col-span-2">
                <h4 className="font-medium mb-4">Interactive Review Flow (Create & Edit)</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Test the full flow: Write a review, submit it (optimistic update), and then click
                  the pencil icon to edit it.
                </p>
                <ProductReviews productId="demo-product" productSlug="demo-product-slug" />
              </div>

              <div className="space-y-4 p-6 bg-background rounded-lg border">
                <h4 className="font-medium">Trust Indicators</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-20">Badge:</span>
                    <VerifiedBadge />
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-sm text-muted-foreground w-20 pt-2">User Meta:</span>
                    <ReviewUserMeta
                      username="alex_shopper"
                      createdAt="2023-10-15T12:00:00Z" // Static date for demo
                    />
                  </div>
                </div>
              </div>
            </div>
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
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-secondary border-2 border-secondary"></div>
                <p className="text-sm font-semibold">Secondary</p>
                <p className="text-xs text-muted-foreground font-mono">#475569</p>
                <p className="text-xs text-muted-foreground">Slate Medium</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-muted border-2 border-border"></div>
                <p className="text-sm font-semibold">Muted</p>
                <p className="text-xs text-muted-foreground font-mono">#f1f5f9</p>
                <p className="text-xs text-muted-foreground">Light Slate</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-md bg-background border-2 border-border"></div>
                <p className="text-sm font-semibold">Background</p>
                <p className="text-xs text-muted-foreground font-mono">#f8fafc</p>
                <p className="text-xs text-muted-foreground">Off White</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
