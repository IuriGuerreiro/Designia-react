import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Heart, Share2, ChevronRight, Home } from 'lucide-react'

import { getProductBySlug } from '../api/productsApi'
import { ImageGallery } from '../components/detail/ImageGallery'
import { ReviewList } from '../components/detail/ReviewList'
import { SellerInfo } from '../components/detail/SellerInfo'
import { useCartStore } from '@/features/cart/stores/cartStore'

import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore(state => state.addItem)

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <ProductDetailSkeleton />
  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="text-muted-foreground mt-2">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    const primaryImage =
      product.images.find(img => img.is_primary)?.url || product.images[0]?.url || ''
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      maxStock: product.stock_quantity,
      quantity: 1,
    })
  }

  // Handle potential string boolean from API

  const isInStock = String(product.is_in_stock).toLowerCase() === 'true'

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/20">
        <div
          className="container mx-auto px-6 py-3 flex items-center text-sm text-muted-foreground"
          style={{ maxWidth: '1400px' }}
        >
          <Link to="/" className="hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div
        className="container mx-auto px-6 py-8 grid lg:grid-cols-2 gap-12"
        style={{ maxWidth: '1400px' }}
      >
        {/* Left Column: Images */}
        <div>
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-2xl font-bold text-slate-900">
                ${parseFloat(product.price).toFixed(2)}
              </div>
              {product.original_price && (
                <div className="text-muted-foreground line-through decoration-red-500/50">
                  ${parseFloat(product.original_price).toFixed(2)}
                </div>
              )}
              {product.is_on_sale && <Badge variant="destructive">Sale</Badge>}
            </div>
            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-4 text-sm">
              <div className="flex text-amber-500">
                {'★'.repeat(Math.round(parseFloat(product.average_rating)))}
                {'☆'.repeat(5 - Math.round(parseFloat(product.average_rating)))}
              </div>
              <span className="text-muted-foreground">({product.review_count} reviews)</span>
            </div>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
            {product.description}
          </p>

          {/* Seller Info */}
          {product.seller && <SellerInfo seller={product.seller} />}

          {/* Specs / Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.condition && (
              <div>
                <span className="font-semibold">Condition:</span>{' '}
                {product.condition.replace('_', ' ')}
              </div>
            )}
            {product.brand && (
              <div>
                <span className="font-semibold">Brand:</span> {product.brand}
              </div>
            )}
            {product.materials && (
              <div>
                <span className="font-semibold">Materials:</span> {product.materials}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-background/95 backdrop-blur p-4 lg:p-0 lg:static border-t lg:border-0 z-10 lg:z-auto -mx-6 px-6 lg:mx-0 lg:px-0 shadow-lg lg:shadow-none">
            <Button
              size="lg"
              className="flex-1 text-lg h-12 bg-[#0f172a] hover:bg-[#0f172a]/90 text-white"
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-4 border-[#0f172a] text-[#0f172a] hover:bg-slate-50"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="ghost" className="px-4">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-6 py-16" style={{ maxWidth: '1400px' }}>
        <Separator className="mb-16" />
        <div className="max-w-4xl mx-auto">
          <ReviewList reviews={product.reviews || []} />
        </div>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div
      className="container mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12"
      style={{ maxWidth: '1400px' }}
    >
      <Skeleton className="aspect-square rounded-lg" />
      <div className="space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
