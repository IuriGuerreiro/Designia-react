export interface MinimalSeller {
  id: string
  username: string
}

export interface MinimalCategory {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string
  seller: MinimalSeller
  category: MinimalCategory
  price: string // Decimal as string
  original_price: string | null // Decimal as string, nullable
  stock_quantity: number
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand: string
  primary_image: string // URL for the image
  is_featured: boolean
  is_digital: boolean
  is_active: boolean
  average_rating: string // Decimal as string
  review_count: string // Number as string
  is_in_stock: boolean
  is_on_sale: boolean
  discount_percentage: string // Decimal as string
  is_favorited: boolean
  created_at: string
  view_count: number
  favorite_count: number
}

export interface PaginatedProducts {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export interface GetProductsParams {
  page?: number
  page_size?: number
  is_featured?: boolean
  q?: string // Search query
  category?: string // Category slug
  price_min?: number
  price_max?: number
  brand?: string
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  min_rating?: number
  in_stock?: boolean
  sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating'
}

export interface AutocompleteResult {
  suggestions: Array<{
    id: string
    name: string
    type: 'product' | 'category' | 'brand'
    slug?: string
  }>
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
}
