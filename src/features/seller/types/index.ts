export type SellerStatus = 'none' | 'pending' | 'verified' | 'rejected'

export interface SellerProfile {
  id: string
  businessName: string
  status: SellerStatus
  onboardingUrl?: string
  charges_enabled: boolean
  payouts_enabled: boolean
}

export interface OnboardingInitResponse {
  url: string
}

export * from './product'
export * from './application'
export * from './stripe'
export * from './analytics'
