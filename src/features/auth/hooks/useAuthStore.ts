import { create } from 'zustand'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types'
import * as authApi from '../api'
import { tokenStorage } from '@/shared/utils/tokenStorage'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  pending2FAUserId: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  verify2FA: (code: string) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<{ message: string; user: User }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  loginWithGoogle: (googleToken: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pending2FAUserId: null,

  login: async credentials => {
    set({ isLoading: true, error: null, pending2FAUserId: null })
    try {
      const response = await authApi.login(credentials)

      if (response.requires_2fa && response.user_id) {
        set({
          isLoading: false,
          error: null,
          pending2FAUserId: response.user_id,
          isAuthenticated: false,
          user: null,
        })
        return response
      }

      // Save user data to localStorage
      tokenStorage.setUserData(response.user)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        pending2FAUserId: null,
      })
      return response
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
        pending2FAUserId: null,
      })
      throw err
    }
  },

  verify2FA: async (code: string) => {
    const { pending2FAUserId } = get()
    if (!pending2FAUserId) {
      throw new Error('No pending login found')
    }

    set({ isLoading: true, error: null })
    try {
      const response = await authApi.verify2FALogin(pending2FAUserId, code)
      tokenStorage.setUserData(response.user)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        pending2FAUserId: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Verification failed',
      })
      throw err
    }
  },

  register: async credentials => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.register(credentials)
      // Registration successful but user is NOT logged in yet
      // They must verify their email first
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      // Return the message to show the user
      return response
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Registration failed',
      })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authApi.logout()
      // Clear user data from localStorage
      tokenStorage.clearUserData()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      // Check if we have tokens
      if (!tokenStorage.hasTokens()) {
        tokenStorage.clearUserData()
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
        return
      }

      // If access token is expired or about to expire, refresh it first
      if (tokenStorage.isAccessTokenExpired()) {
        try {
          await authApi.refreshToken()
        } catch {
          // Refresh failed - clear tokens and user data
          tokenStorage.clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          return
        }
      }

      // Use cached user data instead of fetching from API
      const cachedUser = tokenStorage.getUserData()
      if (cachedUser) {
        set({
          user: cachedUser as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        // No cached data - fetch from API and cache it
        const user = await authApi.getUser()
        if (user) {
          tokenStorage.setUserData(user)
        }
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        })
      }
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Authentication check failed',
      })
    }
  },

  loginWithGoogle: async (googleToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.loginWithGoogle(googleToken)
      // Save user data to localStorage
      tokenStorage.setUserData(response.user)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      // Changed 'error' to 'err' here
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Google login failed',
      })
      throw err
    }
  },

  refreshUserProfile: async () => {
    try {
      const user = await authApi.getUser()
      if (user) {
        tokenStorage.setUserData(user)
        set({ user, isAuthenticated: true })
      }
    } catch {
      // Ignore error
    }
  },

  clearError: () => set({ error: null }),
}))
