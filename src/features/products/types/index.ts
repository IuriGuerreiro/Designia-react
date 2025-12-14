export interface ProductDetailSeller {
  id: string
  username: string
  seller_rating: string
}

export interface MinimalSeller {
  id: string
  username: string
}

export interface ProductDetailCategory {
  id: number
  name: string
  slug: string
  description?: string
}

export interface ProductDetailImage {
  id: number
  image: string
  url: string
  alt_text?: string
  is_primary: boolean
  order: number
}

export interface ProductList {
  id: string
  name: string
  slug: string
  short_description?: string
  price: string // Decimal as string
  original_price?: string | null
  stock_quantity: number
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand?: string
  primary_image: string
  average_rating: string
  review_count: string
  is_in_stock: string
  is_on_sale: string
  discount_percentage: string
  is_favorited: string
}

export interface ProductListResponse {
  count: number
  page: number
  page_size: number
  num_pages: number
  has_next: boolean
  has_previous: boolean
  results: ProductList[]
}

export interface GetProductsParams {
  page?: number
  page_size?: number
  is_featured?: boolean
  category?: string | string[] // slug(s)
  price_min?: number
  price_max?: number
  brand?: string
  condition?: string | string[]
  in_stock?: boolean
  seller?: number
  ordering?: string
}

export interface SearchProductsParams extends GetProductsParams {
  q?: string
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
  product_count?: string
  subcategories?: string
  created_at: string
}

export interface MinimalProductReview {
  id: number
  reviewer: MinimalSeller
  rating: number
  title?: string
  comment: string
  is_verified_purchase: boolean
  created_at: string
}

export interface Review {
  id: number
  product: { id: string; name?: string }
  reviewer: { id: string; username?: string }
  rating: number
  title?: string
  comment: string
  verified_purchase: boolean
  created_at: string
  updated_at: string
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  short_description?: string
  seller: ProductDetailSeller
  category: ProductDetailCategory
  price: string
  original_price?: string | null
  stock_quantity: number
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand?: string
  model?: string
  weight?: string
  dimensions_length?: string
  dimensions_width?: string
  dimensions_height?: string
  colors?: string
  materials?: string
  tags?: string
  is_featured: boolean
  is_digital: boolean
  images: ProductDetailImage[]
  reviews: MinimalProductReview[]
  average_rating: string
  is_in_stock: string
  is_on_sale: string
  discount_percentage: string
  is_favorited: string
  has_ar_model: string
  view_count: number
  click_count: number
  favorite_count: number
}
