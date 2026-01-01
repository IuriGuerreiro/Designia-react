import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getMessages, markThreadRead } from '../api/chatApi'
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
        const url = new URL(lastPage.next)
        return parseInt(url.searchParams.get('page') || '1')
      } catch {
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
    return [...allMessages].reverse()
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
        // Update messages to be read
        // Ideally we check payload.read_at but simpler to just mark all sent by current user as read
        const readerId = payload.data.reader_id

        if (String(readerId) !== String(user?.id)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryClient.setQueryData(['messages', threadId], (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newPages = oldData.pages.map((page: any) => ({
              ...page,
              results: page.results.map((msg: ChatMessage) => {
                // If message was sent by me and is not read, mark it read
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

        // Update the query cache
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['messages', threadId], (oldData: any) => {
          if (!oldData || !oldData.pages)
            return {
              pages: [{ results: [newMessage], count: 1, next: null, previous: null }],
              pageParams: [1],
            }

          // Avoid duplication (e.g. from optimistic update if we could track it better,
          // or if the message was already added by another event)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const alreadyExists = oldData.pages.some(
            (page: any) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Array.isArray(page?.results) && page.results.some((m: any) => m.id === newMessage.id)
          )
          if (alreadyExists) return oldData

          // Remove any optimistic message that matches this text and sender
          // This is a bit fuzzy but works for basic cases
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newPages = oldData.pages.map((page: any, idx: number) => {
            if (idx === 0) {
              const currentResults = Array.isArray(page.results) ? page.results : []
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filteredResults = currentResults.filter(
                (m: any) =>
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['messages', threadId], (oldData: any) => {
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
