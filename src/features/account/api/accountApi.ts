import type { User } from '@/features/auth/types'
import type { UpdateProfileData, ChangePasswordData, ProfileUpdateResponse } from '../types'

const USERS_KEY = 'desginia_mock_users'
const CURRENT_USER_KEY = 'desginia_current_user'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getCurrentUser = (): (User & { password: string }) | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY)
  if (!user) return null

  const userData = JSON.parse(user) as User
  const users = getUsers()
  return users.find(u => u.id === userData.id) || null
}

const getUsers = (): Array<User & { password: string }> => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

const saveUsers = (users: Array<User & { password: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const saveCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

/**
 * Mock update profile API
 */
export const updateProfile = async (data: UpdateProfileData): Promise<ProfileUpdateResponse> => {
  await delay(800)

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === currentUser.id)

  if (userIndex === -1) {
    throw new Error('User not found')
  }

  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    name: data.name,
  }

  saveUsers(users)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = users[userIndex]
  saveCurrentUser(userWithoutPassword)

  return {
    user: userWithoutPassword,
    message: 'Profile updated successfully',
  }
}

/**
 * Mock change password API
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  await delay(1000)

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  // Check current password
  if (currentUser.password !== data.currentPassword) {
    throw new Error('Current password is incorrect')
  }

  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === currentUser.id)

  if (userIndex === -1) {
    throw new Error('User not found')
  }

  // Update password
  users[userIndex].password = data.newPassword
  saveUsers(users)

  return {
    message: 'Password changed successfully',
  }
}

/**
 * Mock upload avatar API
 */
export const uploadAvatar = async (file: File): Promise<ProfileUpdateResponse> => {
  await delay(1500)

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  // In real app, this would upload to cloud storage
  // For mock, we'll use a data URL or placeholder
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const avatarUrl = reader.result as string

      const users = getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)

      if (userIndex === -1) {
        reject(new Error('User not found'))
        return
      }

      users[userIndex].avatar = avatarUrl
      saveUsers(users)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = users[userIndex]
      saveCurrentUser(userWithoutPassword)

      resolve({
        user: userWithoutPassword,
        message: 'Avatar updated successfully',
      })
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
