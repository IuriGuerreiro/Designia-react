import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/features/auth/state/AuthContext';
import { API_ENDPOINTS } from '@/shared/api';
import type {
  ChatContextValue,
  ChatMessage,
  ChatMessageType,
  ChatSummary,
  ChatUser,
  ChatWebSocketMessage,
} from '@/features/chat/model';

type Chat = ChatSummary;
type Message = ChatMessage;
type WebSocketMessage = ChatWebSocketMessage;
type ChatContextType = ChatContextValue;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  
  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ [chatId: number]: Message[] }>({});

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

  // WebSocket connection management
  const connect = () => {
    if (!isAuthenticated || !user) {
      console.log('Chat: Cannot connect - user not authenticated');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Chat: WebSocket already connected');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('Chat: No access token available');
      setConnectionError('No authentication token available');
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/chat/user/?token=${encodeURIComponent(token)}`;
      console.log('Chat: Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Chat: WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('Chat: WebSocket message received:', data);
          
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Chat: Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Chat: WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

      wsRef.current.onclose = (event) => {
        console.log('Chat: WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(`Chat: Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

    } catch (error) {
      console.error('Chat: Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  };

  const disconnect = () => {
    console.log('Chat: Disconnecting WebSocket');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'connection_success':
        console.log('Chat: Connection confirmed by server');
        break;
        
      case 'new_message':
        if (data.message_data) {
          handleNewMessage(data.message_data);
        }
        break;
        
      case 'new_chat':
        if (data.chat_data) {
          handleNewChat(data.chat_data);
        }
        break;
        
      case 'message_read':
        if (data.chat_id) {
          handleMessageRead(data.chat_id);
        }
        break;
        
      case 'error':
        console.error('Chat: Server error:', data.message);
        setConnectionError(data.message || 'Server error');
        break;
        
      default:
        console.log('Chat: Unknown message type:', data.type);
    }
  };

  const handleNewMessage = (message: Message) => {
    console.log('Chat: New message received via WebSocket:', message);
    
    // Check if this is our own message coming back (update status to delivered)
    const isOwnMessage = user?.id === message.sender.id;
    
    // Add message to the appropriate chat, avoiding duplicates
    setMessages(prev => {
      const existingMessages = prev[message.chat] || [];
      
      // For own messages, try to find and update temp message first
      if (isOwnMessage) {
        const tempMessageIndex = existingMessages.findIndex(msg => 
          msg.isTemp && 
          msg.text_content === message.text_content &&
          msg.message_type === message.message_type
        );
        
        if (tempMessageIndex !== -1) {
          // Replace temp message with actual message and mark as delivered
          const updatedMessages = [...existingMessages];
          updatedMessages[tempMessageIndex] = { ...message, status: 'delivered' };
          console.log('Chat: Updated temp message with delivered status');
          return {
            ...prev,
            [message.chat]: updatedMessages
          };
        }
      }
      
      // Check if message already exists by ID
      if (existingMessages.some(msg => msg.id === message.id)) {
        console.log('Chat: Message already exists, skipping duplicate');
        return prev;
      }
      
      // Add new message (for other users' messages)
      return {
        ...prev,
        [message.chat]: [...existingMessages, message].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      };
    });

    // Update chat's last message and increment unread count if message is from other user
    setChats(prev => prev.map(chat => {
      if (chat.id === message.chat) {
        const isFromOtherUser = message.sender.id !== user?.id;
        return {
          ...chat, 
          last_message: message, 
          updated_at: message.created_at,
          unread_count: isFromOtherUser 
            ? (chat.unread_count || 0) + 1 
            : chat.unread_count
        };
      }
      return chat;
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    
    // Show notification if message is from another user and not in current chat
    if (message.sender.id !== user?.id && (!currentChat || currentChat.id !== message.chat)) {
      console.log('Chat: New message from other user in background chat');
      // Could add browser notification here later
    }
  };

  const handleNewChat = (chat: Chat) => {
    console.log('Chat: New chat received:', chat);
    setChats(prev => [chat, ...prev]);
  };

  const handleMessageRead = (chatId: number) => {
    console.log('Chat: Messages marked as read for chat:', chatId);
    // Update local message state to mark our own messages as read (blue checkmarks)
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(msg => 
        msg.sender.id === user?.id 
          ? { ...msg, is_read: true, status: 'read' }
          : { ...msg, is_read: true }
      )
    }));
  };

  // Token refresh function
  const refreshAccessToken = async (): Promise<string | null> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingToken) {
      // Wait for the current refresh to complete
      while (isRefreshingToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return the new token that was just refreshed
      return localStorage.getItem('access_token');
    }

    try {
      setIsRefreshingToken(true);
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('Chat: No refresh token available');
        return null;
      }

      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.log('Chat: Token refresh failed');
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      console.log('Chat: Token refreshed successfully');
      return data.access;
    } catch (error) {
      console.error('Chat: Token refresh error:', error);
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Enhanced API request with token refresh
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('access_token');
    let url = `${API_BASE_URL}${endpoint}`;
    
    // First attempt with current token
    let response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // If 401 Unauthorized, try to refresh token
    if (response.status === 401) {
      console.log('Chat: Token expired, attempting refresh...');
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry with new token
        console.log('Chat: Retrying request with new token...');
        response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
        });
      } else {
        // Token refresh failed, user needs to re-authenticate
        console.log('Chat: Token refresh failed, user needs to re-authenticate');
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  };

  const loadChats = async () => {
    try {
      console.log('Chat: Loading chats...');
      const data = await apiRequest('/api/chat/');
      setChats(data);
      console.log('Chat: Loaded chats:', data);
    } catch (error) {
      console.error('Chat: Failed to load chats:', error);
      throw error;
    }
  };

  const selectChat = async (chat: Chat) => {
    console.log('Chat: Selecting chat:', chat);
    setCurrentChat(chat);
    await loadMessages(chat.id);
    // Note: Not automatically marking messages as read here
    // Messages should only be marked as read when user actually views them
  };

  const createChat = async (userId: number): Promise<Chat> => {
    try {
      console.log('Chat: Creating chat with user:', userId);
      const data = await apiRequest('/api/chat/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      
      console.log('Chat: Chat created:', data);
      
      // Add to chats if it's new
      setChats(prev => {
        const exists = prev.some(chat => chat.id === data.id);
        if (!exists) {
          return [data, ...prev];
        }
        return prev;
      });
      
      return data;
    } catch (error) {
      console.error('Chat: Failed to create chat:', error);
      throw error;
    }
  };

  const loadMessages = async (chatId: number, page: number = 1) => {
    try {
      console.log('Chat: Loading messages for chat:', chatId, 'page:', page);
      const data = await apiRequest(`/api/chat/${chatId}/messages/?page=${page}`);
      
      if (page === 1) {
        // First page - replace messages (API returns newest first, reverse to get oldest first)
        setMessages(prev => ({
          ...prev,
          [chatId]: [...data.results].reverse()
        }));
      } else {
        // Additional pages - prepend older messages
        setMessages(prev => ({
          ...prev,
          [chatId]: [[...data.results].reverse(), ...(prev[chatId] || [])].flat()
        }));
      }
      
      console.log('Chat: Loaded messages:', data.results.length);
    } catch (error) {
      console.error('Chat: Failed to load messages:', error);
      throw error;
    }
  };

  const sendMessage = async (chatId: number, content: string, messageType: 'text' | 'image' = 'text') => {
    // Generate temporary ID for instant display
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create instant message for immediate display
    const tempMessage: Message = {
      id: tempId,
      chat: chatId,
      sender: {
        id: user!.id,
        username: user!.username,
        first_name: user!.first_name,
        last_name: user!.last_name,
      },
      message_type: messageType,
      text_content: messageType === 'text' ? content : undefined,
      image_url: messageType === 'image' ? content : undefined,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending',
      isTemp: true
    };

    // Add temporary message immediately for instant display
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), tempMessage]
    }));

    try {
      console.log('Chat: Sending message to chat:', chatId, messageType, content);
      
      const payload = messageType === 'text' 
        ? { message_type: 'text', text_content: content }
        : { message_type: 'image', image_url: content };
      
      const actualMessage = await apiRequest(`/api/chat/${chatId}/messages/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Chat: Message sent successfully:', actualMessage);
      
      // Replace temporary message with actual message
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg.id === tempId 
            ? { ...actualMessage, status: 'sent' } 
            : msg
        )
      }));

      // Update chat's last message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, last_message: actualMessage, updated_at: actualMessage.created_at }
          : chat
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

      // When user sends a message, they've likely seen the conversation
      // Mark any unread messages as read after a short delay
      setTimeout(() => {
        if (getUnreadCount(chatId) > 0) {
          console.log('Chat: User sent message, marking previous messages as read');
          markMessagesAsRead(chatId);
        }
      }, 500);

    } catch (error) {
      console.error('Chat: Failed to send message:', error);
      
      // Update temporary message to show error state
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                status: 'error', 
                error: 'Error sending message'
              } 
            : msg
        )
      }));

      // Don't throw error - message stays in UI with error state
      console.log('Chat: Message marked as failed, staying in UI for retry');
    }
  };

  const markMessagesAsRead = async (chatId: number) => {
    try {
      await apiRequest(`/api/chat/${chatId}/messages/mark-read/`, {
        method: 'POST',
      });
      
      // Update local state - mark messages as read
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg.sender.id !== user?.id ? { ...msg, is_read: true } : msg
        )
      }));
      
      // Update chat's unread count to 0
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, unread_count: 0 }
          : chat
      ));
      
    } catch (error) {
      console.error('Chat: Failed to mark messages as read:', error);
    }
  };

  const markChatAsViewed = async (chatId: number) => {
    // Only mark as read if there are unread messages
    if (getUnreadCount(chatId) > 0) {
      console.log('Chat: Marking chat as viewed:', chatId);
      await markMessagesAsRead(chatId);
    }
  };

  const searchUsers = async (query: string): Promise<ChatUser[]> => {
    try {
      const data = await apiRequest(`/api/chat/search-users/?q=${encodeURIComponent(query)}`);
      return data.users;
    } catch (error) {
      console.error('Chat: Failed to search users:', error);
      throw error;
    }
  };

  const clearMessages = (chatId: number) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: []
    }));
  };

  // Unread message count functions
  const getUnreadCount = (chatId: number): number => {
    if (!user) return 0;
    
    const chatMessages = messages[chatId] || [];
    
    // If messages are loaded for this chat, calculate from messages
    if (chatMessages.length > 0) {
      return chatMessages.filter(message => 
        !message.is_read && message.sender.id !== user.id
      ).length;
    }
    
    // If messages aren't loaded yet, use backend's unread count from chat data
    const chat = chats.find(c => c.id === chatId);
    return chat?.unread_count || 0;
  };

  const getTotalUnreadCount = (): number => {
    if (!user) return 0;
    
    // Calculate total from all chats (using getUnreadCount which handles loaded/unloaded messages)
    return chats.reduce((total, chat) => {
      return total + getUnreadCount(chat.id);
    }, 0);
  };

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Chat: User authenticated, connecting WebSocket');
      connect();
      loadChats();
    } else {
      console.log('Chat: User not authenticated, disconnecting');
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: ChatContextType = {
    // Connection state
    isConnected,
    connectionError,
    
    // Chat management
    chats,
    currentChat,
    messages,
    
    // WebSocket methods
    connect,
    disconnect,
    sendMessage,
    
    // Chat operations
    loadChats,
    selectChat,
    createChat,
    loadMessages,
    markMessagesAsRead,
    markChatAsViewed,
    searchUsers,
    
    // Unread message functionality
    getUnreadCount,
    getTotalUnreadCount,
    
    // State management
    setCurrentChat,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};