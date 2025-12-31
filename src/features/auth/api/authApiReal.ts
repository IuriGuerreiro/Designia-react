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
  last_login?: string
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
const transformUser = (backendUser: BackendUser): User => {
  if (!backendUser) {
    console.error('transformUser received undefined backendUser')
    throw new Error('User data is missing from response')
  }
  return {
    id: backendUser.id,
    email: backendUser.email,
    name:
      `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() ||
      backendUser.username,
    avatar: backendUser.profile?.profile_picture_url || backendUser.avatar,
    role: backendUser.role,
    two_factor_enabled: backendUser.two_factor_enabled,
    last_login: backendUser.last_login,
  }
}

/**
 * Get current user profile
 * Backend endpoint: GET /api/auth/profile/
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/profile/')
    // If the response is the user object itself
    if (response.data && response.data.id) {
      return transformUser(response.data)
    }
    // If nested under 'user' key (unlikely for profile endpoint but good for safety)
    if (response.data && response.data.user) {
      return transformUser(response.data.user)
    }
    return null
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
 * Login with email/password
 * Backend endpoint: POST /api/auth/login/
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login/', {
    email: credentials.email,
    password: credentials.password,
  })

  // Check if 2FA is required (Status 202)
  if (response.status === 202) {
    return {
      requires_2fa: true,
      message: response.data.message,
      user_id: response.data.user_id,
      // No tokens yet
      access: '',
      refresh: '',
      user: { id: response.data.user_id || 'pending', email: '', name: '', role: 'customer' }, // Placeholder
    }
  }

  // Store JWT tokens
  if (response.data.access && response.data.refresh) {
    tokenStorage.setTokens(response.data.access, response.data.refresh)
  }

  // Retrieve user data - handle case where 'user' is missing in response
  let user: User | null = null
  if (response.data.user) {
    user = transformUser(response.data.user)
  } else if (response.data.access) {
    // If we have a token but no user data, fetch it
    user = await getUser()
  }

  if (!user) {
    throw new Error('Failed to retrieve user profile after login.')
  }

  return {
    user: user,
    message: response.data.message || 'Login successful',
    access: response.data.access,
    refresh: response.data.refresh,
  }
}

/**
 * Verify 2FA code during login
 * Backend endpoint: POST /api/auth/login/verify-2fa/
 */
export const verify2FALogin = async (userId: string, code: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login/verify-2fa/', {
    user_id: userId,
    code,
  })

  // Store JWT tokens
  if (response.data.access && response.data.refresh) {
    tokenStorage.setTokens(response.data.access, response.data.refresh)
  }

  let user: User | null = null
  if (response.data.user) {
    user = transformUser(response.data.user)
  } else {
    user = await getUser()
  }

  if (!user) {
    throw new Error('Failed to retrieve user profile after 2FA verification.')
  }

  return {
    user: user,
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
export const register = async (
  credentials: RegisterCredentials
): Promise<{ message: string; user: User }> => {
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
    message:
      response.data.message ||
      'Registration successful. Please check your email to verify your account.',
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
 * Google OAuth login
 * Backend endpoint: POST /api/auth/google/login/
 */
export const loginWithGoogle = async (googleToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/google/login/', {
    token: googleToken,
  })

  // Store JWT tokens
  if (response.data.access && response.data.refresh) {
    tokenStorage.setTokens(response.data.access, response.data.refresh)
  }

  let user: User | null = null
  if (response.data.user) {
    user = transformUser(response.data.user)
  } else {
    user = await getUser()
  }

  if (!user) throw new Error('Failed to retrieve user profile after Google login.')

  return {
    user: user,
    message: response.data.message || 'Google login successful',
    access: response.data.access,
    refresh: response.data.refresh,
  }
}

/**
 * Get account status
 * Backend endpoint: GET /api/auth/account/status/
 */
export const getAccountStatus = async (): Promise<{ two_factor_enabled: boolean }> => {
  const response = await apiClient.get('/auth/account/status/')
  return response.data
}

/**
 * Send 2FA code
 * Backend endpoint: POST /api/auth/2fa/send-code/
 */
export const send2FACode = async (purpose: 'enable_2fa' | 'disable_2fa'): Promise<void> => {
  await apiClient.post('/auth/2fa/send-code/', { purpose })
}

/**
 * Enable 2FA
 * Backend endpoint: POST /api/auth/2fa/enable/
 */
export const enable2FA = async (code: string): Promise<void> => {
  await apiClient.post('/auth/2fa/enable/', { code })
}

/**
 * Disable 2FA
 * Backend endpoint: POST /api/auth/2fa/disable/
 */
export const disable2FA = async (code: string): Promise<void> => {
  await apiClient.post('/auth/2fa/disable/', { code })
}

/**
 * Verify Email
 * Backend endpoint: POST /api/auth/verify-email/
 */
export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/verify-email/', { token })
  return {
    message: response.data.message || 'Email verified successfully',
  }
}
