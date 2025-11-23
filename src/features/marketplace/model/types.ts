// Marketplace Types for all services

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent?: Category;
  subcategories: Category[];
  product_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
  // S3 fields for presigned URL support
  presigned_url?: string;
  image_url?: string;
  s3_key?: string;
  original_filename?: string;
  file_size?: number;
  content_type?: string;
  // Automatic image URL assimilation fields
  display_url?: string;
  url_source?: 'presigned_url' | 'image_url' | 'image' | 'placeholder';
}

export interface ReviewImage {
  id: number;
  image: string;
  alt_text?: string;
}

export interface ProductReview {
  id: number;
  reviewer: User;
  reviewer_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  images: ReviewImage[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  seller: User;
  category: Category;
  price: number;
  original_price?: number;
  stock_quantity: number;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  brand: string;
  model: string;
  weight?: number;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  colors: string[];
  materials: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  images: ProductImage[];
  reviews: ProductReview[];
  average_rating: number;
  review_count: number;
  is_in_stock: boolean;
  is_on_sale: boolean;
  discount_percentage: number;
   is_favorited: boolean;
   seller_product_count?: number;
   has_ar_model?: boolean;
   created_at: string;
  updated_at: string;
  view_count: number;
  click_count: number;
  favorite_count: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  seller: User;
  category: Category;
  price: number;
  original_price?: number;
  stock_quantity: number;
  condition: string;
  brand: string;
  primary_image?: ProductImage;
  is_featured: boolean;
  is_digital: boolean;
  is_active: boolean;
  average_rating: number;
  review_count: number;
  is_in_stock: boolean;
  is_on_sale: boolean;
  discount_percentage: number;
  is_favorited: boolean;
  created_at: string;
  view_count: number;
  favorite_count: number;
}

export interface ProductFilters {
  min_price?: number;
  max_price?: number;
  category?: string;
  category_slug?: string;
  condition?: string[];
  brand?: string;
  brands?: string;
  is_featured?: boolean;
  is_digital?: boolean;
  is_on_sale?: boolean;
  in_stock?: boolean;
  seller?: string;
  seller_id?: number;
  min_rating?: number;
  search?: string;
  tags?: string;
  colors?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  // New offset-based pagination for search endpoint
  startIndex?: number;
  pageSize?: number;
}

export interface ProductFavorite {
  id: number;
  user: User;
  product: ProductListItem;
  created_at: string;
}

export interface CartItem {
  id: number;
  product: ProductListItem;
  product_id: string;
  quantity: number;
  total_price: number;
  added_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: string;
  seller: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_description: string;
  product_image: string;
  product_image_fresh?: string;
}

export interface OrderShipping {
  id: number;
  seller: User;
  tracking_number: string;
  shipping_carrier: string;
  carrier_code: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer: User;
  status: 'pending_payment' | 'payment_confirmed' | 'awaiting_shipment' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: string;
  shipping_address: any;
  tracking_number: string;
  shipping_carrier: string;
  carrier_code: string;
  items: OrderItem[];
  shipping_info: OrderShipping[];
  seller_shipping?: OrderShipping; // For seller-specific views
  seller_items_count?: number; // For seller-specific views
  seller_items_total?: number; // For seller-specific views
  buyer_notes: string;
  cancellation_reason: string;
  cancelled_by?: User;
  cancelled_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}
