export interface StripeAccountStatus {
  has_account: boolean
  has_stripe_account: boolean
  account_id: string | null
  status: string
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
    past_due?: string[]
    pending_verification?: string[]
    disabled_reason?: string | null
  }
  message: string
  account_created: boolean
  next_step: string
  eligible_for_creation: boolean
  eligibility_errors?: string[]
}

export interface CreateStripeAccountRequest {
  country?: string
  business_type?: 'individual' | 'company'
}

export interface StripeAccountSessionResponse {
  message: string
  client_secret: string
  account_id: string
}
