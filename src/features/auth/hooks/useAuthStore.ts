import { create } from 'zustand'
import type { User, LoginCredentials, RegisterCredentials } from '../types'
import * as authApi from '../api'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loginWithGoogle: () => Promise<void>
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
        error: err instanceof Error ? error.message : 'Login failed',
      })
      throw err
    }
  },

  register: async credentials => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.register(credentials)
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
        error: err instanceof Error ? error.message : 'Registration failed',
      })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authApi.logout()
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
      const user = await authApi.getUser()
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null })
    try {
      await authApi.loginWithGoogle()
      // After OAuth redirect, check auth status
      await get().checkAuth()
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? error.message : 'Google login failed',
      })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
