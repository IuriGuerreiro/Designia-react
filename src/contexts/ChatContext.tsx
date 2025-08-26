import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ChatService from '../services/ChatService';
import globalWebSocketService from '../services/GlobalWebSocketService';
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
  onMessage?: (message: Message, chatId: number) => void;
  onTypingStart?: (userId: number, username: string, chatId: number) => void;
  onTypingStop?: (userId: number, username: string, chatId: number) => void;
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
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  const [typingUserNames, setTypingUserNames] = useState<Map<number, string>>(new Map());
  
  // Callbacks for Chat component
  const [messageCallback, setMessageCallback] = useState<((message: Message, chatId: number) => void) | undefined>();
  const [typingStartCallback, setTypingStartCallback] = useState<((userId: number, username: string, chatId: number) => void) | undefined>();
  const [typingStopCallback, setTypingStopCallback] = useState<((userId: number, username: string, chatId: number) => void) | undefined>();

  const calculateTotalUnread = (chatList: Chat[]) => {
    if (!Array.isArray(chatList)) {
      return 0;
    }
    return chatList.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const refreshChats = async () => {
    try {
      const response = await ChatService.getChats();
      const chatList = response.results || [];
      setChats(chatList);
      setTotalUnreadCount(calculateTotalUnread(chatList));
    } catch (error) {
      console.error('Error refreshing chats:', error);
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
      // Load initial chats
      await refreshChats();

      // Connect to global WebSocket
      try {
        await globalWebSocketService.connect({
          onConnect: () => {
            setIsConnected(true);
          },
          onDisconnect: () => {
            setIsConnected(false);
          },
          onMessage: (message, chatId) => {
            // Update the chat list when new messages arrive
            setChats(prevChats => {
              return prevChats.map(chat => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    last_message: message,
                    unread_count: chat.unread_count + 1,
                    updated_at: message.created_at
                  };
                }
                return chat;
              });
            });

            // Update total unread count
            setTotalUnreadCount(prevCount => prevCount + 1);
          },
          onTypingStart: () => {
            // Typing events handled in individual chat components
          },
          onTypingStop: () => {
            // Typing events handled in individual chat components
          },
          onMessagesRead: (userId, chatId) => {
            // Update read status if needed
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
      globalWebSocketService.disconnect();
    };
  }, []);

  // Update total unread count when chats change
  useEffect(() => {
    setTotalUnreadCount(calculateTotalUnread(chats));
  }, [chats]);

  const value: ChatContextType = {
    totalUnreadCount,
    chats,
    isConnected,
    refreshChats,
    markChatAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};