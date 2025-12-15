import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Star } from 'lucide-react'
import type { ProductList } from '../types'
import { useCartStore } from '@/features/cart/stores/cartStore'

interface ProductCardProps {
  product: ProductList
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem)

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(product.price))

  const displayRating = parseFloat(product.average_rating).toFixed(1)
  const isInStock = String(product.is_in_stock).toLowerCase() === 'true'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.primary_image,
      quantity: 1,
      maxStock: product.stock_quantity,
    })
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/product/${product.slug}`} className="block relative h-48 overflow-hidden">
        <img
          src={product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          loading="lazy"
        />
      </Link>
      <CardHeader className="p-4 pb-2 flex-grow">
        <Link to={`/product/${product.slug}`}>
          <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight hover:text-primary transition-colors duration-200">
            {product.name}
          </CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span>
            {displayRating} ({product.review_count})
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xl font-bold text-primary">{formattedPrice}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm" onClick={handleAddToCart} disabled={!isInStock}>
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  )
}
