export interface ProductImage {
  id?: number
  image?: string // URL
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
  condition: 'new' | 'used' | 'refurbished'
  brand?: string
  model?: string
  tags?: string[]
}

export interface ProductFormData {
  name: string
  description: string
  short_description?: string
  price: number
  original_price?: number
  stock_quantity: number
  category: string // Form usually handles string ID from select
  condition: 'new' | 'used' | 'refurbished'
  brand?: string
  model?: string
  tags?: string[] // Comma separated in UI maybe?
  images: ProductImage[]
}

export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}
