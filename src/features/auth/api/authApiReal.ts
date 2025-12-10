import apiClient from '@/shared/api/axios'
import { tokenStorage } from '@/shared/utils/tokenStorage'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types'

interface BackendUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  role: 'customer' | 'seller' | 'admin'
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
 * Backend endpoint: POST /api/auth/login/
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login/', {
    email: credentials.email,
    password: credentials.password,
  })

  // Store JWT tokens
  if (response.data.access && response.data.refresh) {
    tokenStorage.setTokens(response.data.access, response.data.refresh)
  }

  return {
    user: transformUser(response.data.user),
    message: response.data.message || 'Login successful',
    access: response.data.access,
    refresh: response.data.refresh,
  }
}

/**
 * Register new user
 * Backend endpoint: POST /api/auth/register/
 * NOTE: Registration does NOT return tokens. User must verify email first, then login.
 */
export const register = async (credentials: RegisterCredentials): Promise<{ message: string; user: User }> => {
  const [firstName, ...lastNameParts] = credentials.name.split(' ')
  const lastName = lastNameParts.join(' ')

  const response = await apiClient.post('/auth/register/', {
    username: credentials.email.split('@')[0], // Use email prefix as username
    email: credentials.email,
    first_name: firstName,
    last_name: lastName || '',
    password: credentials.password,
    password_confirm: credentials.confirmPassword,
  })

  // Register does NOT return tokens - user must verify email first
  return {
    user: transformUser(response.data.user),
    message: response.data.message || 'Registration successful. Please check your email to verify your account.',
  }
}

/**
 * Logout user
 * JWT tokens are stateless, so logout is handled client-side by clearing tokens
 */
export const logout = async (): Promise<void> => {
  // Clear tokens from storage
  tokenStorage.clearTokens()
}

/**
 * Refresh access token
 * Backend endpoint: POST /api/auth/token/refresh/
 */
export const refreshToken = async (): Promise<{ access: string; refresh?: string }> => {
  const refresh = tokenStorage.getRefreshToken()
  if (!refresh) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await apiClient.post('/auth/token/refresh/', { refresh })

    // Store new tokens
    if (response.data.access) {
      tokenStorage.setAccessToken(response.data.access)
      if (response.data.refresh) {
        tokenStorage.setTokens(response.data.access, response.data.refresh)
      }
    }

    return response.data
  } catch (error) {
    // Clear tokens if refresh fails
    tokenStorage.clearTokens()
    throw error
  }
}

/**
 * Get current user profile
 * Backend endpoint: GET /api/auth/profile/
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/profile/')
    const user = transformUser(response.data)
    return user
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
 * Backend endpoint: POST /api/auth/google/login/
 *
 * Flow:
 * 1. Frontend uses Google Sign-In to get OAuth token
 * 2. Send token to backend
 * 3. Backend verifies with Google and returns JWT tokens
 *
 * NOTE: This requires implementing Google Sign-In button on frontend
 * For now, this is a placeholder - full implementation requires @react-oauth/google
 */
export const loginWithGoogle = async (googleToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/google/login/', {
    token: googleToken,
  })

  // Store JWT tokens
  if (response.data.access && response.data.refresh) {
    tokenStorage.setTokens(response.data.access, response.data.refresh)
  }

  return {
    user: transformUser(response.data.user),
    message: response.data.message || 'Google login successful',
    access: response.data.access,
    refresh: response.data.refresh,
  }
}
