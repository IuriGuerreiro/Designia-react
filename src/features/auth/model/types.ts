export type UserRole = 'user' | 'seller' | 'admin';

export interface UserProfile {
  bio?: string;
  location?: string;
  birth_date?: string;
  gender?: string;
  pronouns?: string;
  phone_number?: string;
  country_code?: string;
  website?: string;
  job_title?: string;
  company?: string;
  street_address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  postal_code?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  timezone?: string;
  language_preference?: string;
  currency_preference?: string;
  account_type?: string;
  profile_visibility?: string;
  is_verified?: boolean;
  is_verified_seller?: boolean;
  seller_type?: string;
  created_at?: string;
  updated_at?: string;
  profile_completion_percentage?: number;
  marketing_emails_enabled?: boolean;
  newsletter_enabled?: boolean;
  notifications_enabled?: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_email_verified?: boolean;
  two_factor_enabled?: boolean;
  is_oauth_only_user?: boolean;
  is_verified_seller?: boolean;
  seller_type?: string;
  language?: string;
  role?: UserRole;
  profile?: UserProfile;
}

export interface RateLimitStatus {
  can_send: boolean;
  time_remaining: number;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface SellerApplicationRequest {
  businessName: string;
  sellerType: string;
  motivation: string;
  portfolio: string;
  socialMedia?: string;
  workshopPhotos: File[];
}

export interface SellerApplicationStatus {
  has_application: boolean;
  is_seller: boolean;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  application_id?: number;
  submitted_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}
