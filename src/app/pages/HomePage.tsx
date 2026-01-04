import { Button } from '@/shared/components/ui/button'
import { ProductList } from '@/features/products/components/ProductList'

export function HomePage() {
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
    </main>
  )
}
