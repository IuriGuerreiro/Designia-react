import { create } from 'zustand'
import type { User, LoginCredentials, RegisterCredentials } from '../types'
import * as authApi from '../api'
import { tokenStorage } from '@/shared/utils/tokenStorage'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
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

  login: async credentials => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.login(credentials)
      // Save user data to localStorage
      tokenStorage.setUserData(response.user)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
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
        } catch (refreshError) {
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
          user: cachedUser,
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
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
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
    } catch (error) {
      console.error('[Auth] Failed to refresh user profile:', error)
    }
  },

  clearError: () => set({ error: null }),
}))
