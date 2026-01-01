import React, { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import type { ChatMessage } from '../api/chatApi'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Check, CheckCheck, MoreHorizontal, Flag } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { ReportMessageDialog } from './ReportMessageDialog'

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
  const lastMessageIdRef = useRef<string | null>(null)
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null)

  // Scroll to bottom logic
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (!scrollContainer) return

      const newestMessage = messages[messages.length - 1]
      const isInitialLoad = !lastMessageIdRef.current
      const isNewMessageAtBottom = newestMessage.id !== lastMessageIdRef.current

      // Update ref
      lastMessageIdRef.current = newestMessage.id

      // Only scroll to bottom if it's the first load or a new message arrived at the bottom
      // We don't want to scroll to bottom when loading older messages (which are prepended)
      if (isInitialLoad || isNewMessageAtBottom) {
        // Use a small timeout to ensure the DOM has updated
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 50)
      }
    }
  }, [messages])

  return (
    <>
      <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-slate-50/50">
        <div className="flex flex-col gap-4">
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-primary py-2 transition-colors mx-auto"
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
                  'flex items-end gap-2 max-w-[85%] group',
                  isMe ? 'self-end flex-row-reverse' : 'self-start'
                )}
              >
                <div className="w-8 h-8 flex-shrink-0">
                  {!isMe && showAvatar && (
                    <Avatar className="h-8 w-8 border shadow-sm">
                      <AvatarFallback className="text-[10px] bg-slate-100">
                        {message.sender_username
                          ? message.sender_username.slice(0, 2).toUpperCase()
                          : '??'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <div className={cn('flex flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all relative',
                        isMe
                          ? 'bg-[#0f172a] text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
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

                    {!isMe && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setReportingMessageId(message.id)}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
                    <span>{format(new Date(message.created_at), 'p')}</span>
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

      <ReportMessageDialog
        messageId={reportingMessageId}
        isOpen={!!reportingMessageId}
        onClose={() => setReportingMessageId(null)}
      />
    </>
  )
}
