/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string
          detail?: string
          error?: string
          email?: string[]
          password?: string[]
          non_field_errors?: string[]
        }
        status?: number
      }
      message?: string
    }

    const data = axiosError.response?.data

    // Try to extract error message from response
    if (data) {
      // Direct message/detail/error fields
      if (data.message) return data.message
      if (data.detail) return data.detail
      if (data.error) return data.error

      // Field-specific errors (Django REST Framework format)
      if (data.email && Array.isArray(data.email)) {
        return `Email: ${data.email.join(', ')}`
      }
      if (data.password && Array.isArray(data.password)) {
        return `Password: ${data.password.join(', ')}`
      }
      if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
        return data.non_field_errors.join(', ')
      }

      // If data is an object with multiple fields, show first error
      const firstKey = Object.keys(data)[0]
      if (firstKey && data[firstKey as keyof typeof data]) {
        const value = data[firstKey as keyof typeof data]
        if (Array.isArray(value)) {
          return `${firstKey}: ${value.join(', ')}`
        }
        if (typeof value === 'string') {
          return value
        }
      }
    }

    // HTTP status-based messages
    const status = axiosError.response?.status
    if (status === 401) return 'Invalid credentials. Please check your email and password.'
    if (status === 403) return 'Access denied. Your email may not be verified or your account is disabled.'
    if (status === 404) return 'Resource not found.'
    if (status === 429) return 'Too many requests. Please try again later.'
    if (status === 500) return 'Server error. Please try again later.'

    // Fallback to axios message
    if (axiosError.message) return axiosError.message
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.'
}
