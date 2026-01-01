import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConversations } from '../api/chatApi'
import { InboxList } from '../components/InboxList'
import { ThreadDetail } from '../components/ThreadDetail'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { MessageSquare, Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'

export const ChatPage = () => {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const { lastMessage } = useWebSocket()

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchOnWindowFocus: true,
  })

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data)

        // Background message notification
        if (data.type === 'chat.message') {
          const msgData = data.data
          // Only show toast if we are not looking at this thread
          if (msgData.thread_id !== threadId) {
            toast('New Message', {
              description: `${msgData.sender_username}: ${msgData.text.slice(0, 50)}${msgData.text.length > 50 ? '...' : ''}`,
              action: {
                label: 'View',
                onClick: () => navigate(`/chat/${msgData.thread_id}`),
              },
            })
          }

          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }

        if (data.type === 'unread_messages_count_update') {
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err)
      }
    }
  }, [lastMessage, queryClient, threadId, navigate])

  const filteredThreads = useMemo(() => {
    // Ensure threads is always an array
    const threadList = Array.isArray(threads) ? threads : []
    if (!searchQuery) return threadList
    return threadList.filter(thread =>
      thread.participants.some(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [threads, searchQuery])

  const sortedThreads = useMemo(() => {
    // Ensure filteredThreads is always an array before spreading
    const threadList = Array.isArray(filteredThreads) ? filteredThreads : []
    return [...threadList].sort((a, b) => {
      const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : 0
      const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : 0
      return timeB - timeA
    })
  }, [filteredThreads])

  const handleSelectThread = (id: string) => {
    navigate(`/chat/${id}`)
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Sidebar / Inbox List */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 border-r flex flex-col bg-slate-50/30',
          threadId ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="p-4 border-b space-y-4 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Messages
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-10 bg-muted/50 border-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InboxList
              threads={sortedThreads}
              activeThreadId={threadId}
              onSelectThread={handleSelectThread}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          'flex-1 flex-col bg-slate-50/20',
          threadId ? 'flex' : 'hidden md:flex items-center justify-center'
        )}
      >
        {!threadId ? (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Your Inbox</h2>
            <p className="text-muted-foreground max-w-xs">
              Select a conversation from the list to start messaging.
            </p>
          </div>
        ) : (
          <ThreadDetail threadId={threadId} />
        )}
      </div>
    </div>
  )
}
