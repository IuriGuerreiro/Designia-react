import React, { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import type { ChatMessage } from '../api/chatApi'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Check, CheckCheck } from 'lucide-react'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  const { user } = useAuthStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages.length])

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="flex flex-col gap-4">
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs text-muted-foreground hover:text-primary py-2 transition-colors"
          >
            {isLoading ? 'Loading older messages...' : 'Load older messages'}
          </button>
        )}

        {(messages || []).map((message, index) => {
          if (!message) return null
          const isMe = String(message.sender) === String(user?.id)
          const showAvatar =
            index === 0 || (messages[index - 1] && messages[index - 1].sender !== message.sender)

          return (
            <div
              key={message.id || index}
              className={cn(
                'flex items-end gap-2 max-w-[80%]',
                isMe ? 'self-end flex-row-reverse' : 'self-start'
              )}
            >
              <div className="w-8 h-8 flex-shrink-0">
                {!isMe && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">
                      {message.sender_username
                        ? message.sender_username.slice(0, 2).toUpperCase()
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className={cn('flex flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl text-sm',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  )}
                >
                  {message.message_type === 'text' ? (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  ) : (
                    <img
                      src={message.image_url}
                      alt="Sent image"
                      className="max-w-full rounded-lg"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                  <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                  {isMe &&
                    (message.is_read ? (
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Check className="h-3 w-3" />
                    ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
