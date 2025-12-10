export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'customer' | 'seller' | 'admin'
  two_factor_enabled?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthResponse {
  user: User
  message: string
  access: string
  refresh: string
  requires_2fa?: boolean
  user_id?: string
}

export interface AuthError {
  message: string
  field?: string
}
