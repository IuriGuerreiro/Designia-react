import apiClient from '@/shared/api/axios'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types'

interface BackendUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  role: 'buyer' | 'seller' | 'admin'
  is_email_verified: boolean
  two_factor_enabled: boolean
  profile?: {
    bio?: string
    location?: string
    phone_number?: string
    profile_picture_url?: string
  }
}

// Transform backend user to frontend User type
const transformUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  name: `${backendUser.first_name} ${backendUser.last_name}`.trim() || backendUser.username,
  avatar: backendUser.profile?.profile_picture_url || backendUser.avatar,
  role: backendUser.role,
})

/**
 * Login with email/password
 * Backend endpoint: POST /api/authentication/login/
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/authentication/login/', {
    email: credentials.email,
    password: credentials.password,
  })

  return {
    user: transformUser(response.data.user),
    message: 'Login successful',
  }
}

/**
 * Register new user
 * Backend endpoint: POST /api/authentication/register/
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const [firstName, ...lastNameParts] = credentials.name.split(' ')
  const lastName = lastNameParts.join(' ')

  const response = await apiClient.post('/authentication/register/', {
    username: credentials.email.split('@')[0], // Use email prefix as username
    email: credentials.email,
    first_name: firstName,
    last_name: lastName || '',
    password: credentials.password,
    password_confirm: credentials.confirmPassword,
  })

  return {
    user: transformUser(response.data.user),
    message: 'Registration successful',
  }
}

/**
 * Logout user
 * Backend endpoint: POST /api/authentication/logout/ (if exists) or just client-side
 */
export const logout = async (): Promise<void> => {
  // Django JWT uses HttpOnly cookies, so we just clear client state
  // Backend will invalidate the token automatically on next request
  try {
    await apiClient.post('/authentication/logout/')
  } catch (error) {
    // Even if logout endpoint doesn't exist, clear client state
    console.error('Logout error:', error)
  }
}

/**
 * Get current user profile
 * Backend endpoint: GET /api/authentication/profile/
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/authentication/profile/')
    return transformUser(response.data)
  } catch (error) {
    // If 401, user is not authenticated
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 401) {
        return null
      }
    }
    throw error
  }
}

/**
 * Google OAuth login
 * Backend endpoint: POST /api/authentication/google/login/
 */
export const loginWithGoogle = async (): Promise<void> => {
  // For Google OAuth, we redirect to backend which handles the OAuth flow
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const redirectUrl = `${backendUrl}/api/authentication/google/login/`

  window.location.href = redirectUrl
}
