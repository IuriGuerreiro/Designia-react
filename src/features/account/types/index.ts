import type { User } from '@/features/auth/types'

export interface ProfileData {
  first_name?: string
  last_name?: string
  bio?: string
  location?: string
  birth_date?: string // YYYY-MM-DD
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other' | '' | null
  pronouns?: string
  phone_number?: string | null
  country_code?: string
  website?: string
  job_title?: string
  company?: string
  street_address?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
  instagram_url?: string
  twitter_url?: string
  linkedin_url?: string
  facebook_url?: string
  timezone?: string
  language_preference?: string
  currency_preference?: string
  account_type?: 'personal' | 'business' | 'creator'
  profile_visibility?: 'public' | 'private' | 'friends_only'
  marketing_emails_enabled?: boolean
  newsletter_enabled?: boolean
  notifications_enabled?: boolean
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileUpdateResponse {
  user: User
  message: string
}

export interface ProfilePictureUploadResponse {
  message: string
  profile_picture_url: string // S3 key/path
  profile_picture_temp_url: string // Temporary presigned URL
  size: number
  content_type: string
}

export interface ProfilePictureDeleteResponse {
  message: string
}
