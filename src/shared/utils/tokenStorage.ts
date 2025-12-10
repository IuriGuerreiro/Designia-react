/**
 * Token Storage Utility
 *
 * Manages JWT access and refresh tokens in localStorage.
 * Note: localStorage is used here as the backend returns tokens in response body.
 * For production, consider more secure alternatives or ensure HTTPS is enforced.
 */

const ACCESS_TOKEN_KEY = 'designia_access_token'
const REFRESH_TOKEN_KEY = 'designia_refresh_token'
const USER_DATA_KEY = 'designia_user_data'

/**
 * Decode JWT token payload
 */
function decodeToken(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const tokenStorage = {
  /**
   * Save both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  /**
   * Get the access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Update just the access token (used after refresh)
   */
  setAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },

  /**
   * Clear all tokens and user data (logout)
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
  },

  /**
   * Save user data
   */
  setUserData(user: any): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
  },

  /**
   * Get cached user data
   */
  getUserData(): any | null {
    const data = localStorage.getItem(USER_DATA_KEY)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  /**
   * Clear user data
   */
  clearUserData(): void {
    localStorage.removeItem(USER_DATA_KEY)
  },

  /**
   * Check if user has valid tokens (basic check)
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken())
  },

  /**
   * Check if access token is expired or about to expire (within 5 minutes)
   */
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true

    // Check if token expires in less than 5 minutes (300 seconds)
    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return expirationTime - currentTime < fiveMinutes
  },
}
