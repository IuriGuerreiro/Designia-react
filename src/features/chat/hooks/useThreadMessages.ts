import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getMessages, markThreadRead, type MessagePage } from '../api/chatApi'
import type { ChatMessage } from '../api/chatApi'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { tokenStorage } from '@/shared/utils/tokenStorage'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

export const useThreadMessages = (threadId?: string) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['messages', threadId],
    queryFn: ({ pageParam = 1 }) => getMessages(threadId!, pageParam as number),
    getNextPageParam: lastPage => {
      if (!lastPage.next) return undefined
      try {
        // Handle absolute or relative URLs
        const urlString = lastPage.next
        const pageMatch = urlString.match(/[?&]page=(\d+)/)
        const page = pageMatch ? parseInt(pageMatch[1], 10) : undefined

        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('[Pagination] Next page:', page)
        }

        return page
      } catch (err) {
        console.error('[Pagination] Error parsing next page URL:', err)
        return undefined
      }
    },
    enabled: !!threadId,
    initialPageParam: 1,
  })

  // Flatten messages and reverse them so they are in chronological order (oldest first)
  const messages = useMemo(() => {
    if (!data) return []
    const allMessages = data.pages.flatMap(page => page.results)
    // Reverse because API returns newest first, but we want to show oldest first in the list
    const reversed = [...allMessages].reverse()

    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('[Messages] Total pages:', data.pages.length)
      console.log('[Messages] Total messages:', reversed.length)
      console.log('[Messages] First message ID:', reversed[0]?.id)
      console.log('[Messages] Last message ID:', reversed[reversed.length - 1]?.id)
    }

    return reversed
  }, [data])

  const markRead = useCallback(async () => {
    if (threadId) {
      try {
        await markThreadRead(threadId)
      } catch (error) {
        console.error('Failed to mark thread as read', error)
      }
    }
  }, [threadId])

  // Mark read on initial load and when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // Only mark read if the last message is NOT from me and is unread
      if (lastMessage && String(lastMessage.sender) !== String(user?.id) && !lastMessage.is_read) {
        markRead()
      }
    }
  }, [messages, user?.id, markRead])

  useEffect(() => {
    if (!threadId || !user) return

    const token = tokenStorage.getAccessToken()
    const url = `${WS_BASE_URL}/ws/chat/${threadId}/?token=${token}`

    const ws = new WebSocket(url)

    ws.onmessage = event => {
      const payload = JSON.parse(event.data)

      if (payload.type === 'chat.typing') {
        setTypingUser(payload.username)

        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null)
        }, 3000)
        return
      }

      if (payload.type === 'chat.read') {
        const readerId = payload.data.reader_id

        if (String(readerId) !== String(user?.id)) {
          queryClient.setQueryData<InfiniteData<MessagePage>>(['messages', threadId], oldData => {
            if (!oldData || !oldData.pages) return oldData

            const newPages = oldData.pages.map(page => ({
              ...page,
              results: page.results.map((msg: ChatMessage) => {
                if (String(msg.sender) === String(user?.id) && !msg.is_read) {
                  return { ...msg, is_read: true }
                }
                return msg
              }),
            }))

            return { ...oldData, pages: newPages }
          })
        }
        return
      }

      if (payload.type === 'chat.message') {
        const msgData = payload.data
        const newMessage: ChatMessage = {
          id: msgData.id,
          sender: msgData.sender_id,
          sender_username: msgData.sender_username,
          message_type: 'text',
          text: msgData.text,
          image_url: msgData.image_url,
          created_at: msgData.created_at,
          is_read: false,
        }

        queryClient.setQueryData<InfiniteData<MessagePage>>(['messages', threadId], oldData => {
          if (!oldData || !oldData.pages)
            return {
              pages: [{ results: [newMessage], count: 1, next: null, previous: null }],
              pageParams: [1],
            }

          const alreadyExists = oldData.pages.some(
            page =>
              Array.isArray(page?.results) &&
              page.results.some((m: ChatMessage) => m.id === newMessage.id)
          )
          if (alreadyExists) return oldData

          const newPages = oldData.pages.map((page, idx: number) => {
            if (idx === 0) {
              const currentResults = Array.isArray(page.results) ? page.results : []
              const filteredResults = currentResults.filter(
                (m: ChatMessage) =>
                  !(
                    m.id.startsWith('temp-') &&
                    m.text === newMessage.text &&
                    String(m.sender) === String(newMessage.sender)
                  )
              )
              return {
                ...page,
                results: [newMessage, ...filteredResults],
              }
            }
            return page
          })

          return {
            ...oldData,
            pages: newPages,
          }
        })
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [threadId, user, queryClient, markRead])

  const sendMessage = useCallback(
    (text: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'chat.message',
            payload: { text },
          })
        )

        // Optimistic update
        const tempId = `temp-${Date.now()}`
        const optimisticMessage: ChatMessage = {
          id: tempId,
          sender: user?.id || '',
          sender_username: user?.username || '',
          message_type: 'text',
          text,
          created_at: new Date().toISOString(),
          is_read: false,
        }

        queryClient.setQueryData<InfiniteData<MessagePage>>(['messages', threadId], oldData => {
          if (!oldData)
            return {
              pages: [{ results: [optimisticMessage], count: 1, next: null, previous: null }],
              pageParams: [1],
            }

          const newPages = [...oldData.pages]
          const currentResults = Array.isArray(newPages[0]?.results) ? newPages[0].results : []
          newPages[0] = {
            ...newPages[0],
            results: [optimisticMessage, ...currentResults],
          }

          return {
            ...oldData,
            pages: newPages,
          }
        })
      }
    },
    [socket, threadId, user, queryClient]
  )

  const sendTyping = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'chat.typing',
        })
      )
    }
  }, [socket])

  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('[useThreadMessages] hasNextPage:', hasNextPage)
    console.log('[useThreadMessages] isFetchingNextPage:', isFetchingNextPage)
    console.log('[useThreadMessages] total messages:', messages.length)
  }

  return {
    messages,
    isLoading,
    sendMessage,
    sendTyping,
    typingUser,
    isSocketOpen: socket?.readyState === WebSocket.OPEN,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
  }
}
