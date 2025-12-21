export interface SellerApplication {
  business_name: string
  motivation: string
  seller_type: 'individual' | 'business'
  portfolio_url?: string
  shop_logo?: string // Base64 string for upload or File
  uploaded_images?: string[] // Array of base64 strings or Files
}

export type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface SellerApplicationStatus {
  has_application: boolean
  is_seller: boolean
  status: ApplicationStatus
  application_id?: number
  submitted_at?: string
  admin_notes?: string
  rejection_reason?: string
}

export interface SellerApplicationSubmitResponse {
  message: string
  application_id: number
  images_uploaded: number
}
