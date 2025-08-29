import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Chat interfaces
interface Chat {
  id: number;
  other_user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  last_message?: Message;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  chat: number;
  sender: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  message_type: 'text' | 'image';
  text_content?: string;
  image_url?: string;
  image_temp_url?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

interface ChatUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// WebSocket message types
interface WebSocketMessage {
  type: 'connection_success' | 'new_message' | 'new_chat' | 'message_read' | 'user_typing' | 'error' | 'pong';
  message?: string;
  user_id?: number;
  chat_data?: Chat;
  message_data?: Message;
  chat_id?: number;
}

// Context interface
interface ChatContextType {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  
  // Chat management
  chats: Chat[];
  currentChat: Chat | null;
  messages: { [chatId: number]: Message[] };
  
  // WebSocket methods
  connect: () => void;
  disconnect: () => void;
  sendMessage: (chatId: number, content: string, messageType?: 'text' | 'image') => Promise<void>;
  
  // Chat operations
  loadChats: () => Promise<void>;
  selectChat: (chat: Chat) => Promise<void>;
  createChat: (userId: number) => Promise<Chat>;
  loadMessages: (chatId: number, page?: number) => Promise<void>;
  markMessagesAsRead: (chatId: number) => Promise<void>;
  markChatAsViewed: (chatId: number) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
  
  // Unread message functionality
  getUnreadCount: (chatId: number) => number;
  getTotalUnreadCount: () => number;
  
  // State management
  setCurrentChat: (chat: Chat | null) => void;
  clearMessages: (chatId: number) => void;
}

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

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
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
    
    // Add message to the appropriate chat, avoiding duplicates
    setMessages(prev => {
      const existingMessages = prev[message.chat] || [];
      // Check if message already exists to avoid duplicates
      if (existingMessages.some(msg => msg.id === message.id)) {
        console.log('Chat: Message already exists, skipping duplicate');
        return prev;
      }
      
      return {
        ...prev,
        [message.chat]: [...existingMessages, message].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      };
    });

    // Update chat's last message
    setChats(prev => prev.map(chat => 
      chat.id === message.chat 
        ? { ...chat, last_message: message, updated_at: message.created_at }
        : chat
    ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    
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
    // Update local message state to mark messages as read
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(msg => ({ ...msg, is_read: true }))
    }));
  };

  // API methods
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

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
    try {
      console.log('Chat: Sending message to chat:', chatId, messageType, content);
      
      const payload = messageType === 'text' 
        ? { message_type: 'text', text_content: content }
        : { message_type: 'image', image_url: content };
      
      const message = await apiRequest(`/api/chat/${chatId}/messages/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Chat: Message sent:', message);
      
      // Add message to local state immediately (sender sees it right away)
      setMessages(prev => {
        const existingMessages = prev[chatId] || [];
        // Check if message already exists to avoid duplicates
        if (existingMessages.some(msg => msg.id === message.id)) {
          return prev;
        }
        return {
          ...prev,
          [chatId]: [...existingMessages, message]
        };
      });

      // Update chat's last message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, last_message: message, updated_at: message.created_at }
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
      throw error;
    }
  };

  const markMessagesAsRead = async (chatId: number) => {
    try {
      await apiRequest(`/api/chat/${chatId}/messages/mark-read/`, {
        method: 'POST',
      });
      
      // Update local state
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => 
          msg.sender.id !== user?.id ? { ...msg, is_read: true } : msg
        )
      }));
      
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
    return chatMessages.filter(message => 
      !message.is_read && message.sender.id !== user.id
    ).length;
  };

  const getTotalUnreadCount = (): number => {
    if (!user) return 0;
    
    return Object.keys(messages).reduce((total, chatIdStr) => {
      const chatId = parseInt(chatIdStr);
      return total + getUnreadCount(chatId);
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