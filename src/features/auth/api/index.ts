/**
 * Auth API - Facade pattern to switch between mock and real API
 *
 * Set VITE_USE_MOCK_API=true to use mock localStorage API
 * Set VITE_USE_MOCK_API=false (or omit) to use real backend API
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

if (USE_MOCK) {
  console.warn('🔧 Using MOCK authentication API (localStorage)')
} else {
  console.log('🌐 Using REAL backend authentication API')
}

// Dynamically import the correct API implementation
export const { login, register, logout, getUser, loginWithGoogle } = USE_MOCK
  ? await import('./authApi') // Mock API
  : await import('./authApiReal') // Real API
