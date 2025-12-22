export interface ProductImage {
  id?: number
  image?: string // Filename or URL depending on context
  url?: string // Signed URL from backend
  image_content?: string // Base64 for upload
  is_primary: boolean
  order: number
  alt_text?: string
}

export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  short_description?: string
  price: string // Decimal string from backend
  original_price?: string | null
  stock_quantity: number
  category: number // ID
  category_name?: string // Read-only
  status: ProductStatus // Backend might calculate this or have a field. Assuming computed or mapping.
  images: ProductImage[]
  created_at: string
  updated_at: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand?: string
  model?: string
  tags?: string[]
  primary_image?: string // From list view
  has_ar_model: boolean
  ar_model_filename?: string
  ar_model_url?: string // Signed URL if available
}

export interface ProductFormData {
  name: string
  description: string
  short_description?: string
  price: number
  original_price?: number
  stock_quantity: number
  category: string // Form usually handles string ID from select
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand?: string
  model?: string
  tags?: string[] // Comma separated in UI maybe?
  images: ProductImage[]
  ar_model_file?: string
  ar_model_filename?: string
}

export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}
