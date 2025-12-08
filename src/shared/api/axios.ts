import axios from 'axios'

// Get API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for JWT cookies
})

// Request interceptor to add JWT token if available
apiClient.interceptors.request.use(
  config => {
    // JWT tokens are handled via HttpOnly cookies by Django
    // No need to manually add Authorization header
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
      originalRequest._retry = true

      try {
        // Try to refresh token
        await apiClient.post('/authentication/token/refresh/')
        // Retry the original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login or clear auth state
        // This will be handled by the auth store
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
