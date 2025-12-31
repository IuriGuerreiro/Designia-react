import axios from 'axios'
import { tokenStorage } from '@/shared/utils/tokenStorage'

// Get API base URL from environment variable or default to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

// Request interceptor to add JWT token if available
apiClient.interceptors.request.use(
  config => {
    // Add Authorization header with Bearer token if available
    const accessToken = tokenStorage.getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ignore 401s from login endpoint (invalid credentials)
      if (originalRequest.url?.includes('/auth/login/')) {
        return Promise.reject(error)
      }

      // Prevent infinite loops if the refresh endpoint itself fails
      if (originalRequest.url?.includes('/auth/token/refresh/')) {
        // Refresh failed - clear tokens and redirect to login
        tokenStorage.clearTokens()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        // Try to refresh token using the refresh token
        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) {
          // No refresh token available - user must login again
          tokenStorage.clearTokens()
          window.location.href = `${window.location.pathname}?session=expired`
          return Promise.reject(error)
        }

        const response = await apiClient.post('/auth/token/refresh/', {
          refresh: refreshToken,
        })

        // Update access token (and refresh token if backend sends new one)
        if (response.data.access) {
          tokenStorage.setAccessToken(response.data.access)
          // Some backends rotate refresh tokens
          if (response.data.refresh) {
            tokenStorage.setTokens(response.data.access, response.data.refresh)
          }
        }

        // Retry the original request with new token
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - user session is invalid
        tokenStorage.clearTokens()
        window.location.href = `${window.location.pathname}?session=expired`
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
