import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatThread } from '../api/chatApi'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

interface ThreadWithExtras extends ChatThread {
  unread_count?: number
}

interface InboxListProps {
  threads: ChatThread[]
  activeThreadId?: string
  onSelectThread: (threadId: string) => void
}

export const InboxList: React.FC<InboxListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
}) => {
  const { user } = useAuthStore()

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <p>No conversations yet.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {threads.map(thread => {
          const otherParticipant = thread.participants.find(p => p.id !== user?.id)
          const lastMessage = thread.last_message
          const unreadCount = (thread as unknown as ThreadWithExtras).unread_count || 0
          const isActive = activeThreadId === thread.id

          return (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                'flex items-center gap-4 p-4 text-left transition-colors border-b hover:bg-muted/50',
                isActive && 'bg-muted',
                unreadCount > 0 && 'bg-blue-50/30'
              )}
            >
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={otherParticipant?.avatar} />
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  {otherParticipant?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('font-semibold truncate', unreadCount > 0 && 'text-primary')}>
                    {otherParticipant?.username || 'Unknown'}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm truncate',
                      unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {lastMessage ? lastMessage.text : 'No messages yet'}
                  </p>
                  {unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
