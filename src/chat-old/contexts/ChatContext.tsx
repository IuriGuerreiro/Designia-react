import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import ChatService from '../services/ChatService';
import ChatWebSocketService from '../services/ChatWebSocketService';
import WebSocketService from '../services/WebSocketService';
import { type Chat, type Message, type User } from '../types/chat';
import { useAuth } from './AuthContext';

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
  onMessage?: (message: Message, chatId: number) => void;
  onTypingStart?: (userId: number, username: string, chatId: number) => void;
  onTypingStop?: (userId: number, username: string, chatId: number) => void;
  
  // Callback setters for Chat component
  setMessageCallback: (callback: ((message: Message, chatId: number) => void) | undefined) => void;
  setTypingStartCallback: (callback: ((userId: number, username: string, chatId: number) => void) | undefined) => void;
  setTypingStopCallback: (callback: ((userId: number, username: string, chatId: number) => void) | undefined) => void;
  
  // Debug method
  getWebSocketStatus: () => {
    chatWebSocket: boolean;
    activeChatId: number | null;
    hasChatWebSocket: boolean;
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
  
  // Callbacks for Chat component
  const [messageCallback, setMessageCallbackState] = useState<((message: Message, chatId: number) => void) | undefined>(undefined);
  const [typingStartCallback, setTypingStartCallback] = useState<((userId: number, username: string, chatId: number) => void) | undefined>(undefined);
  const [typingStopCallback, setTypingStopCallback] = useState<((userId: number, username: string, chatId: number) => void) | undefined>(undefined);

  // Chat-specific WebSocket service for sending messages
  const [chatWebSocket, setChatWebSocket] = useState<WebSocketService | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const calculateTotalUnread = (chatList: Chat[]) => {
    if (!Array.isArray(chatList)) {
      return 0;
    }
    return chatList.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const refreshChats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await ChatService.getChats();
      // Handle different response formats
      let chatList: Chat[];
      if (Array.isArray(response)) {
        chatList = response;
      } else if (response && typeof response === 'object' && 'results' in response) {
        chatList = (response as any).results || [];
      } else {
        chatList = [];
      }
      
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
      
      // Check authentication first
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping chat initialization');
        return;
      }
      
      // Load initial chats
      await refreshChats();

      // Connect to chat WebSocket for notifications
      try {
        console.log('💬 Attempting chat WebSocket connection...');
        await ChatWebSocketService.connect({
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
            
            
            if (messageCallback && 
                typeof messageCallback === 'function' && 
                message && 
                message.id && 
                typeof chatId === 'number' && 
                chatId > 0) {
              try {
                // Use setTimeout to ensure this runs outside React's render cycle
                setTimeout(() => {
                  if (messageCallback) { // Double-check callback still exists
                    messageCallback(message, chatId);
                  }
                }, 0);
              } catch (error) {
                console.error('❌ Error in Chat component message callback:', error);
                console.error('Callback details:', {
                  messageCallback: typeof messageCallback,
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
            typingStartCallback?.(userId, username, chatId);
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
            typingStopCallback?.(userId, username, chatId);
          },
          onMessagesRead: (userId, chatId) => {
            // Update read status if needed
          },
          onNewChat: (chat) => {
            
            // Add new chat to the beginning of the chat list
            setChats(prevChats => {
              // Check if chat already exists to avoid duplicates
              const exists = prevChats.some(c => c.id === chat.id);
              if (exists) {
                return prevChats;
              }
              
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
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      ChatWebSocketService.disconnect();
      if (chatWebSocket) {
        chatWebSocket.disconnect();
      }
    };
  }, []);

  // Update total unread count when chats change
  useEffect(() => {
    setTotalUnreadCount(calculateTotalUnread(chats));
  }, [chats]);

  // Chat service methods
  const sendTextMessage = (chatId: number, text: string): boolean => {
    // Use chat-specific WebSocket for sending messages
    if (chatWebSocket && activeChatId === chatId) {
      return chatWebSocket.sendTextMessage(text);
    } else {
      // Fallback to HTTP API
      ChatService.sendTextMessage(chatId, text).catch((error) => {
        console.error('❌ HTTP API send failed:', error);
      });
      return false;
    }
  };

  const sendImageMessage = (chatId: number, imageUrl: string): boolean => {
    // Use chat-specific WebSocket for sending image messages
    if (chatWebSocket && activeChatId === chatId) {
      return chatWebSocket.sendImageMessage(imageUrl);
    } else {
      // Fallback to HTTP API
      ChatService.sendImageMessage(chatId, imageUrl).catch(console.error);
      return false;
    }
  };

  const sendTypingStart = (chatId: number): boolean => {
    if (chatWebSocket && activeChatId === chatId) {
      return chatWebSocket.sendTypingStart();
    }
    return false;
  };

  const sendTypingStop = (chatId: number): boolean => {
    if (chatWebSocket && activeChatId === chatId) {
      return chatWebSocket.sendTypingStop();
    }
    return false;
  };

  const setActiveChat = (chatId: number): void => {
    setActiveChatId(chatId);
    
    // Connect to chat-specific WebSocket
    if (chatId) {
      const newChatWebSocket = new WebSocketService();
      newChatWebSocket.connect(chatId, {
        onConnect: () => {
          console.log(`Connected to chat ${chatId} WebSocket`);
          setChatWebSocket(newChatWebSocket);
        },
        onDisconnect: () => {
          console.log(`Disconnected from chat ${chatId} WebSocket`);
          if (chatWebSocket === newChatWebSocket) {
            setChatWebSocket(null);
          }
        },
        onMessage: (message) => {
          console.log(`Chat ${chatId} WebSocket received message:`, message);
          // This will be handled by the global WebSocket for consistency
        },
        onError: (error) => {
          console.error(`Chat ${chatId} WebSocket error:`, error);
          if (chatWebSocket === newChatWebSocket) {
            setChatWebSocket(null);
          }
        }
      }).then(() => {
        console.log(`Chat ${chatId} WebSocket connection established`);
      }).catch((error) => {
        console.error(`Failed to connect to chat ${chatId} WebSocket:`, error);
        setChatWebSocket(null);
      });
    } else {
      // No chat selected, ensure WebSocket is disconnected
      if (chatWebSocket) {
        chatWebSocket.disconnect();
        setChatWebSocket(null);
      }
      setActiveChatId(null);
    }
  };

  const leaveActiveChat = (): void => {
    if (chatWebSocket) {
      chatWebSocket.disconnect();
      setChatWebSocket(null);
    }
    setActiveChatId(null);
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
    // Also notify via chat-specific WebSocket
    if (chatWebSocket && activeChatId === chatId) {
      chatWebSocket.markMessagesAsRead();
    }
  };

  // Debug method to check WebSocket status
  const getWebSocketStatus = () => {
    return {
      chatWebSocket: ChatWebSocketService.isConnected(),
      activeChatId,
      hasChatWebSocket: !!chatWebSocket
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
    onMessage: messageCallback,
    onTypingStart: typingStartCallback,
    onTypingStop: typingStopCallback,
    
    // Callback setters for Chat component
    setMessageCallback: setMessageCallbackState,
    setTypingStartCallback: setTypingStartCallback,
    setTypingStopCallback: setTypingStopCallback,
    
    // Debug method
    getWebSocketStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};