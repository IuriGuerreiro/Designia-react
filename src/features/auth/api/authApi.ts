import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types'

// Mock user database (localStorage)
const USERS_KEY = 'desginia_mock_users'
const CURRENT_USER_KEY = 'desginia_current_user'

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Get all users from localStorage
const getUsers = (): Array<User & { password: string }> => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

// Save users to localStorage
const saveUsers = (users: Array<User & { password: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Get current user from localStorage
const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

// Save current user to localStorage
const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

/**
 * Mock login API call
 * Simulates backend authentication with HttpOnly cookies
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await delay(800) // Simulate network delay

  const users = getUsers()
  const user = users.find(
    u =>
      u.email.toLowerCase() === credentials.email.toLowerCase() &&
      u.password === credentials.password
  )

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Remove password from response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user

  // Save to "session" (simulating HttpOnly cookie)
  saveCurrentUser(userWithoutPassword)

  return {
    user: userWithoutPassword,
    message: 'Login successful',
  }
}

/**
 * Mock register API call
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  await delay(1000) // Simulate network delay

  const users = getUsers()

  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === credentials.email.toLowerCase())) {
    throw new Error('An account with this email already exists')
  }

  // Create new user
  const newUser: User & { password: string } = {
    id: crypto.randomUUID(),
    email: credentials.email,
    name: credentials.name,
    role: 'buyer',
    password: credentials.password, // In real app, this would be hashed by backend
  }

  users.push(newUser)
  saveUsers(users)

  // Remove password from response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = newUser

  // Auto-login after registration
  saveCurrentUser(userWithoutPassword)

  return {
    user: userWithoutPassword,
    message: 'Registration successful',
  }
}

/**
 * Mock logout API call
 */
export const logout = async (): Promise<void> => {
  await delay(300)
  saveCurrentUser(null)
}

/**
 * Mock get current user API call
 * Simulates checking HttpOnly cookie session
 */
export const getUser = async (): Promise<User | null> => {
  await delay(500) // Simulate network delay
  return getCurrentUser()
}

/**
 * Mock Google OAuth redirect
 * In real implementation, this would redirect to backend OAuth endpoint
 */
export const loginWithGoogle = async (): Promise<void> => {
  // Simulate OAuth flow
  alert(
    'Google OAuth not implemented in mock. In production, this would redirect to: /api/auth/google'
  )

  // For demo purposes, create a mock Google user
  await delay(1500)

  const mockGoogleUser: User = {
    id: crypto.randomUUID(),
    email: 'demo@google.com',
    name: 'Google User Demo',
    avatar: 'https://ui-avatars.com/api/?name=Google+User&background=0f172a&color=fff',
    role: 'buyer',
  }

  saveCurrentUser(mockGoogleUser)
}
