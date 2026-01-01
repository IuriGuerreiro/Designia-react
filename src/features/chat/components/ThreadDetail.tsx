import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getConversation } from '../api/chatApi'
import { useThreadMessages } from '../hooks/useThreadMessages'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface ThreadDetailProps {
  threadId: string
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({ threadId }) => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const { data: thread, isLoading: isLoadingThread } = useQuery({
    queryKey: ['conversation', threadId],
    queryFn: () => getConversation(threadId),
    enabled: !!threadId,
  })

  const {
    messages,
    isLoading: isLoadingMessages,
    sendMessage,
    sendTyping,
    typingUser,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useThreadMessages(threadId)

  const otherUser = thread?.participants.find(p => p.id !== currentUser?.id)

  if (isLoadingThread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4 bg-white shadow-sm z-10">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/chat')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <AvatarImage src={(otherUser as any)?.avatar} />
          <AvatarFallback>{otherUser?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{otherUser?.username}</h2>
          {thread.product && (
            <p className="text-xs text-muted-foreground truncate">
              Regarding: {thread.product.name}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              hasMore={hasMore}
              isLoading={isLoadingMore}
              onLoadMore={loadMore}
            />
            {typingUser && <TypingIndicator username={typingUser} />}
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} onTyping={sendTyping} />
    </div>
  )
}
