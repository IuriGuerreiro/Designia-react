import { apiClient } from '@/shared/api/axios'

export interface ChatMessage {
  id: string
  sender: string // ID
  sender_username: string
  message_type: 'text' | 'image'
  text: string
  image_url?: string
  created_at: string
  is_read: boolean
}

export interface ChatThread {
  id: string
  product?: {
    id: string
    name: string
    image: string
    price: number
  }
  participants: {
    id: string
    username: string
    avatar?: string
  }[]
  last_message?: {
    text: string
    created_at: string
    is_read: boolean
  }
  updated_at: string
}

export interface StartConversationResponse {
  thread_id: string
  is_new: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const startConversation = async (productId: string): Promise<StartConversationResponse> => {
  const { data } = await apiClient.post<StartConversationResponse>('/chat/conversations/', {
    product_id: productId,
  })
  return data
}

export const getConversation = async (threadId: string): Promise<ChatThread> => {
  const { data } = await apiClient.get<ChatThread>(`/chat/conversations/${threadId}/`)
  return data
}

export const getConversations = async (): Promise<ChatThread[]> => {
  const { data } = await apiClient.get<ChatThread[]>('/chat/conversations/')
  return data
}

export const getMessages = async (
  threadId: string,
  page = 1
): Promise<PaginatedResponse<ChatMessage>> => {
  const { data } = await apiClient.get<PaginatedResponse<ChatMessage>>(
    `/chat/conversations/${threadId}/messages/?page=${page}`
  )
  return data
}

export const markThreadRead = async (threadId: string): Promise<void> => {
  await apiClient.post(`/chat/conversations/${threadId}/mark_read/`)
}
