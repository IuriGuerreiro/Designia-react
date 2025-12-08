import type { User } from '@/features/auth/types'

export interface UpdateProfileData {
  name: string
  phone?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UploadAvatarData {
  file: File
}

export interface ProfileUpdateResponse {
  user: User
  message: string
}
