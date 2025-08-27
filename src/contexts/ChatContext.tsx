import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import ChatService from '../services/ChatService';
import globalWebSocketService from '../services/GlobalWebSocketService';
import webSocketService from '../services/WebSocketService';
import { useAuth } from './AuthContext';
import { type Chat, type Message, type User } from '../types/chat';

interface ChatContextType {
  totalUnreadCount: number;
  chats: Chat[];
  isConnected: boolean;
  refreshChats: () => Promise<void>;
  markChatAsRead: (chatId: number) => void;
  
  // Chat-specific functionality
  sendTextMessage: (chatId: number, text: string) => boolean;
  sendImageMessage: (chatId: number, imageUrl: string) => boolean;
  sendTypingStart: (chatId: number) => boolean;
  sendTypingStop: (chatId: number) => boolean;
  setActiveChat: (chatId: number) => void;
  leaveActiveChat: () => void;
  getMessages: (chatId: number) => Promise<any>;
  uploadImage: (file: File) => Promise<any>;
  searchUsers: (query: string) => Promise<User[]>;
  createChat: (userId: number) => Promise<Chat>;
  markMessagesAsRead: (chatId: number) => Promise<void>;
  
  // Typing indicators and message callbacks for Chat component
  typingUsers: Map<number, Set<number>>;
  typingUserNames: Map<number, string>;
  
  // Callback setters for Chat component
  setMessageCallback: (callback: ((message: Message, chatId: number) => void) | undefined) => void;
  setTypingStartCallback: (callback: ((userId: number, username: string, chatId: number) => void) | undefined) => void;
  setTypingStopCallback: (callback: ((userId: number, username: string, chatId: number) => void) | undefined) => void;
  
  // Debug method
  getWebSocketStatus: () => {
    globalWebSocket: boolean;
    activeChatId: number | null;
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  const [typingUserNames, setTypingUserNames] = useState<Map<number, string>>(new Map());
  
  // Callbacks for Chat component - use refs to avoid closure issues
  const messageCallbackRef = useRef<((message: Message, chatId: number) => void) | undefined>(undefined);
  const typingStartCallbackRef = useRef<((userId: number, username: string, chatId: number) => void) | undefined>(undefined);
  const typingStopCallbackRef = useRef<((userId: number, username: string, chatId: number) => void) | undefined>(undefined);

  // Track active chat for global WebSocket
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const calculateTotalUnread = (chatList: Chat[]) => {
    if (!Array.isArray(chatList)) {
      return 0;
    }
    return chatList.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const refreshChats = async () => {
    try {
      console.log('🔄 ChatContext refreshing chats...');
      const token = localStorage.getItem('access_token');
      console.log('Has token for chat request:', !!token);
      
      const response = await ChatService.getChats();
      const chatList = Array.isArray(response) ? response : (response?.results || []);
      console.log('✅ Chats loaded successfully:', { count: chatList.length });
      setChats(chatList);
      setTotalUnreadCount(calculateTotalUnread(chatList));
    } catch (error) {
      console.error('Error refreshing chats:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        console.error('❌ Authentication failed - user needs to log in');
      } else if (error instanceof Error && error.message.includes('500')) {
        console.error('❌ Server error - backend issue');
      }
      
      // Set empty arrays on error to prevent further issues
      setChats([]);
      setTotalUnreadCount(0);
    }
  };

  const markChatAsRead = (chatId: number) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => 
        chat.id === chatId ? { ...chat, unread_count: 0 } : chat
      );
      setTotalUnreadCount(calculateTotalUnread(updatedChats));
      return updatedChats;
    });
  };

  // Initialize WebSocket connection and load chats
  useEffect(() => {
    const initializeChat = async () => {
      console.log('🚀 ChatContext initializing...');
      
      // Check authentication first
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping chat initialization');
        return;
      }
      
      // Load initial chats
      await refreshChats();

      // Connect to global WebSocket only if we have authentication and not already connected
      if (!globalWebSocketService.isConnected()) {
        try {
          console.log('🌐 Attempting WebSocket connection...');
          await globalWebSocketService.connect({
          onConnect: () => {
            setIsConnected(true);
          },
          onDisconnect: () => {
            setIsConnected(false);
          },
          onMessage: (message, chatId) => {
            // Safety check - ensure message exists
            if (!message || !message.id) {
              console.error('❌ ChatContext received invalid message:', { message, chatId });
              return;
            }
            
            // Update the chat list when new messages arrive
            setChats(prevChats => {
              const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId) {
                  // Only increment unread count if message is not from current user
                  const isOwnMessage = user && message.sender && message.sender.id === user.id;
                  const newUnreadCount = isOwnMessage ? chat.unread_count : chat.unread_count + 1;
                  
                  return {
                    ...chat,
                    last_message: message,
                    unread_count: newUnreadCount,
                    updated_at: message.created_at
                  };
                }
                return chat;
              });
              
              // Calculate new total and update
              const newTotal = calculateTotalUnread(updatedChats);
              setTotalUnreadCount(newTotal);
              
              return updatedChats;
            });
            
            // Debug: Check callback conditions
            console.log('🔍 CHATCONTEXT CALLBACK CHECK:', {
              hasMessageCallback: !!messageCallbackRef.current,
              messageCallbackType: typeof messageCallbackRef.current,
              hasMessage: !!message,
              hasMessageId: !!(message && message.id),
              chatIdType: typeof chatId,
              chatIdValue: chatId,
              allConditionsMet: !!(messageCallbackRef.current && 
                typeof messageCallbackRef.current === 'function' && 
                message && 
                message.id && 
                typeof chatId === 'number' && 
                chatId > 0)
            });
            
            if (messageCallbackRef.current && 
                typeof messageCallbackRef.current === 'function' && 
                message && 
                message.id && 
                typeof chatId === 'number' && 
                chatId > 0) {
              try {
                console.log('🔄 Executing Chat component callback with valid data...');
                // Use setTimeout to ensure this runs outside React's render cycle
                setTimeout(() => {
                  if (messageCallbackRef.current) { // Double-check callback still exists
                    messageCallbackRef.current(message, chatId);
                    console.log('✅ Chat component callback executed successfully');
                  }
                }, 0);
              } catch (error) {
                console.error('❌ Error in Chat component message callback:', error);
                console.error('Callback details:', {
                  messageCallback: typeof messageCallbackRef.current,
                  message: message ? { id: message.id, type: message.message_type } : null,
                  chatId
                });
              }
            }
          },
          onTypingStart: (userId, username, chatId) => {
            // Store the username for this user
            setTypingUserNames(prev => {
              const newMap = new Map(prev);
              newMap.set(userId, username);
              return newMap;
            });
            
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              if (!newMap.has(chatId)) {
                newMap.set(chatId, new Set());
              }
              newMap.get(chatId)!.add(userId);
              return newMap;
            });
            
            // Call Chat component callback if registered
            typingStartCallbackRef.current?.(userId, username, chatId);
          },
          onTypingStop: (userId, username, chatId) => {
            // Store the username for this user (in case we didn't have it)
            setTypingUserNames(prev => {
              const newMap = new Map(prev);
              newMap.set(userId, username);
              return newMap;
            });
            
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              if (newMap.has(chatId)) {
                newMap.get(chatId)!.delete(userId);
                if (newMap.get(chatId)!.size === 0) {
                  newMap.delete(chatId);
                }
              }
              return newMap;
            });
            
            // Call Chat component callback if registered
            typingStopCallbackRef.current?.(userId, username, chatId);
          },
          onMessagesRead: (userId, chatId) => {
            // Update read status if needed
          },
          onNewChat: (chat) => {
            console.log('🌐💬 ChatContext received new chat notification:', { 
              chatId: chat.id, 
              otherUser: chat.other_user?.username,
              currentChatCount: chats.length 
            });
            
            // Add new chat to the beginning of the chat list
            setChats(prevChats => {
              // Check if chat already exists to avoid duplicates
              const exists = prevChats.some(c => c.id === chat.id);
              if (exists) {
                console.log('🔄 Chat already exists, ignoring duplicate:', chat.id);
                return prevChats;
              }
              
              console.log('✅ Adding new chat to list:', { 
                chatId: chat.id, 
                otherUser: chat.other_user?.username,
                newTotal: prevChats.length + 1 
              });
              
              return [chat, ...prevChats];
            });
          },
          onError: (error) => {
            console.error('Chat WebSocket error:', error);
          }
        });
        } catch (error) {
          console.error('Failed to connect to chat WebSocket:', error);
        }
      } else {
        console.log('🌐 Global WebSocket already connected, skipping connection attempt');
        setIsConnected(true);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      globalWebSocketService.disconnect();
    };
  }, []);

  // Update total unread count when chats change
  useEffect(() => {
    setTotalUnreadCount(calculateTotalUnread(chats));
  }, [chats]);

  // Chat service methods
  const sendTextMessage = (chatId: number, text: string): boolean => {
    // Use global WebSocket for sending messages
    if (globalWebSocketService.isConnected()) {
      return globalWebSocketService.sendTextMessage(chatId, text);
    } else {
      // Fallback to HTTP API
      ChatService.sendTextMessage(chatId, text).catch((error) => {
        console.error('❌ HTTP API send failed:', error);
      });
      return false;
    }
  };

  const sendImageMessage = (chatId: number, imageUrl: string): boolean => {
    // Use global WebSocket for sending image messages
    if (globalWebSocketService.isConnected()) {
      return globalWebSocketService.sendImageMessage(chatId, imageUrl);
    } else {
      // Fallback to HTTP API
      ChatService.sendImageMessage(chatId, imageUrl).catch(console.error);
      return false;
    }
  };

  const sendTypingStart = (chatId: number): boolean => {
    if (globalWebSocketService.isConnected()) {
      return globalWebSocketService.sendTypingStart(chatId);
    }
    return false;
  };

  const sendTypingStop = (chatId: number): boolean => {
    if (globalWebSocketService.isConnected()) {
      return globalWebSocketService.sendTypingStop(chatId);
    }
    return false;
  };

  const setActiveChat = (chatId: number): void => {
    setActiveChatId(chatId);
    
    // Use global WebSocket to set active chat
    if (globalWebSocketService.isConnected()) {
      globalWebSocketService.setActiveChat(chatId);
    }
  };

  const leaveActiveChat = (): void => {
    setActiveChatId(null);
    
    // Use global WebSocket to leave active chat
    if (globalWebSocketService.isConnected()) {
      globalWebSocketService.leaveActiveChat();
    }
  };

  const getMessages = async (chatId: number) => {
    return await ChatService.getMessages(chatId);
  };

  const uploadImage = async (file: File) => {
    return await ChatService.uploadImage(file);
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    return await ChatService.searchUsers(query);
  };

  const createChat = async (userId: number): Promise<Chat> => {
    const chat = await ChatService.createChat(userId);
    // Refresh chats after creation
    await refreshChats();
    return chat;
  };

  const markMessagesAsReadService = async (chatId: number): Promise<void> => {
    await ChatService.markMessagesAsRead(chatId);
    // Update context to reflect read status
    markChatAsRead(chatId);
    // Also notify via global WebSocket
    if (globalWebSocketService.isConnected()) {
      globalWebSocketService.markMessagesAsRead(chatId);
    }
  };

  // Debug method to check WebSocket status
  const getWebSocketStatus = () => {
    return {
      globalWebSocket: globalWebSocketService.isConnected(),
      activeChatId
    };
  };

  const value: ChatContextType = {
    totalUnreadCount,
    chats,
    isConnected,
    refreshChats,
    markChatAsRead,
    
    // Chat-specific functionality
    sendTextMessage,
    sendImageMessage,
    sendTypingStart,
    sendTypingStop,
    setActiveChat,
    leaveActiveChat,
    getMessages,
    uploadImage,
    searchUsers,
    createChat,
    markMessagesAsRead: markMessagesAsReadService,
    
    // Typing indicators and message callbacks for Chat component
    typingUsers,
    typingUserNames,
    
    // Callback setters for Chat component
    setMessageCallback: useCallback((callback: ((message: Message, chatId: number) => void) | undefined) => {
      console.log('🔄 CHATCONTEXT setMessageCallback called:', {
        callbackType: typeof callback,
        isUndefined: callback === undefined,
        timestamp: new Date().toISOString()
      });
      messageCallbackRef.current = callback;
    }, []),
    setTypingStartCallback: useCallback((callback: ((userId: number, username: string, chatId: number) => void) | undefined) => {
      typingStartCallbackRef.current = callback;
    }, []),
    setTypingStopCallback: useCallback((callback: ((userId: number, username: string, chatId: number) => void) | undefined) => {
      typingStopCallbackRef.current = callback;
    }, []),
    
    // Debug method
    getWebSocketStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};