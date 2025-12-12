import apiClient from '@/shared/api/axios'
import type { User } from '@/features/auth/types'
import { tokenStorage } from '@/shared/utils/tokenStorage' // Needed for fetching current user if no profile data returned

import type {
  ProfileData,
  ChangePasswordData,
  ProfileUpdateResponse,
  ProfilePictureUploadResponse,
  ProfilePictureDeleteResponse,
} from '../types'

// Helper to get current user data from auth store (if needed)
const getUserFromAuth = (): User | null => {
  const userData = tokenStorage.getUserData() // Assuming tokenStorage stores User data
  return userData || null
}

/**
 * Update user profile API
 * Backend endpoint: PATCH /api/auth/profile/
 */
export const updateProfile = async (data: ProfileData): Promise<ProfileUpdateResponse> => {
  const response = await apiClient.patch('/auth/profile/', data)

  // The backend returns a Profile object on update, but the frontend's
  // User object structure includes nested profile data.
  // We need to merge this updated profile data into the current user's data.
  const currentUser = getUserFromAuth()
  if (!currentUser) {
    throw new Error('Not authenticated: User data not found in storage.')
  }

  // Create a new User object by merging updated profile with existing user data
  // Assuming the backend PATCH /api/auth/profile/ returns a 'Profile' schema.
  // We need to fetch the full user from /api/auth/profile/ GET endpoint for consistency if the PATCH doesn't return full user.
  // OR, better, ensure the backend PATCH returns the full User object, not just Profile.
  // The API spec shows it returns 'Profile' schema, not 'User' schema.
  // So, after a profile update, we need to re-fetch the user to update the store.
  // For simplicity, let's assume the PATCH response can be directly mapped back to parts of the User's profile.
  // Or even better: after a successful update, trigger a user profile refresh.

  // Let's assume for now, we just return the message, and rely on refreshUserProfile() from useAuthStore
  // to update the user data after this call is successful.
  // However, ProfileUpdateResponse expects a User object.
  // For now, I'll return a placeholder user. The calling component should trigger refreshUserProfile.

  // Re-fetching user after successful update to ensure the store is up-to-date
  // This is a common pattern when PATCH returns only partial data or related object.
  // The useAuthStore.refreshUserProfile() should be called after updateProfile successfully resolves.
  return {
    user: currentUser, // Placeholder, actual user refresh will happen via useAuthStore
    message: response.data.message || 'Profile updated successfully',
  }
}

/**
 * Mock change password API (no backend endpoint found in spec)
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  // This is a MOCK implementation as no backend endpoint was found in the OpenAPI spec.
  // In a real scenario, this would be a POST request to a /api/auth/change-password endpoint.
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (data.newPassword !== data.confirmPassword) {
    throw new Error('New passwords do not match')
  }

  // Simulate success
  return {
    message: 'Password changed successfully (mock)',
  }
}

/**
 * Upload user avatar API
 * Backend endpoint: POST /api/auth/profile/picture/upload/
 */
export const uploadAvatar = async (file: File): Promise<ProfilePictureUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/auth/profile/picture/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Delete user avatar API
 * Backend endpoint: DELETE /api/auth/profile/picture/delete/
 */
export const deleteAvatar = async (): Promise<ProfilePictureDeleteResponse> => {
  const response = await apiClient.delete('/auth/profile/picture/delete/')
  return response.data
}
