import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatService from '../../services/ChatService';
import webSocketService from '../../services/WebSocketService';
import globalWebSocketService from '../../services/GlobalWebSocketService';
import { useChatContext } from '../../contexts/ChatContext';
import { type Chat, type Message, type User } from '../../types/chat';
import Layout from '../Layout/Layout';
import styles from './Chat.module.css';

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    // Today - show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (diffInDays < 7) {
    // This week - show day
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Helper function to get user initials
const getUserInitials = (user: User): string => {
  const firstName = user.first_name || user.username;
  const lastName = user.last_name;
  
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  } else if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  } else {
    return user.username.substring(0, 2).toUpperCase();
  }
};

// User Avatar Component
const UserAvatar: React.FC<{ user: User; size?: number }> = ({ user, size = 40 }) => {
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundImage: user.profile_picture_temp_url ? `url(${user.profile_picture_temp_url})` : undefined,
  };

  return (
    <div className={styles['user-avatar']} style={style}>
      {!user.profile_picture_temp_url && getUserInitials(user)}
    </div>
  );
};

// User Search Modal Component
const UserSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}> = ({ isOpen, onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await ChatService.searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  if (!isOpen) return null;

  return (
    <div className={styles['user-search-modal']} onClick={onClose}>
      <div className={styles['user-search-content']} onClick={e => e.stopPropagation()}>
        <div className={styles['user-search-header']}>
          <h3>Start New Chat</h3>
          <button className={styles['close-btn']} onClick={onClose}>×</button>
        </div>
        
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles['user-search-input']}
          autoFocus
        />

        <div className={styles['user-results']}>
          {isSearching ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Searching...
            </div>
          ) : (
            searchResults.map(user => (
              <div
                key={user.id}
                className={styles['user-result']}
                onClick={() => onSelectUser(user)}
              >
                <UserAvatar user={user} size={36} />
                <div className={styles['user-result-info']}>
                  <h4>{user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}</h4>
                  <p>@{user.username}</p>
                </div>
              </div>
            ))
          )}
          
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className={styles['empty-state']}>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Chat Component
const ChatComponent: React.FC = () => {
  // Context
  const { chats, refreshChats, markChatAsRead, isConnected: contextIsConnected } = useChatContext();
  
  // State
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  const [typingUserNames, setTypingUserNames] = useState<Map<number, string>>(new Map()); // userId -> username
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chats are loaded from ChatContext - no need for separate loading function

  // Load messages for selected chat
  const loadMessages = useCallback(async (chatId: number) => {
    setIsLoadingMessages(true);
    try {
      const response = await ChatService.getMessages(chatId);
      setMessages(response.results);
      
      // Mark messages as read
      await ChatService.markMessagesAsRead(chatId);
      
      // Update context to reflect read status
      markChatAsRead(chatId);
      
      // Also notify via WebSocket for real-time updates
      if (globalWebSocketService.isConnected()) {
        globalWebSocketService.markMessagesAsRead(chatId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send text message
  const sendMessage = async () => {
    if (!selectedChat || !messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput(''); // Clear input immediately for better UX
    setIsSending(true);

    try {
      if (isConnected && globalWebSocketService.isConnected()) {
        // Send via global WebSocket for real-time delivery
        const success = globalWebSocketService.sendTextMessage(selectedChat.id, messageText);
        if (!success) {
          throw new Error('Global WebSocket send failed');
        }
        // Note: The actual message will be added to the UI via WebSocket onMessage callback
      } else {
        // Fallback to HTTP API if WebSocket not connected
        const message = await ChatService.sendTextMessage(selectedChat.id, messageText);
        setMessages(prev => [...prev, message]);
        // No need to call loadChats - context WebSocket will handle updates
      }
    } catch (error) {
      setMessageInput(messageText); // Restore message on error
      
      // Try HTTP fallback if WebSocket failed
      if (isConnected) {
        try {
          const message = await ChatService.sendTextMessage(selectedChat.id, messageText);
          setMessages(prev => [...prev, message]);
          // No need to call loadChats - context WebSocket will handle updates
        } catch (fallbackError) {
          alert('Failed to send message. Please try again.');
        }
      } else {
        alert('Connection error. Please check your internet connection.');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle file selection and upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setIsSending(true);
    try {
      // First upload the image (this still needs to be done via HTTP)
      const uploadResult = await ChatService.uploadImage(file);
      
      // Then send via WebSocket if connected, otherwise HTTP
      if (isConnected && webSocketService.isConnected()) {
        const success = webSocketService.sendImageMessage(uploadResult.image_url);
        if (!success) {
          throw new Error('WebSocket send failed');
        }
        // Note: The actual message will be added to the UI via WebSocket onMessage callback
      } else {
        // Fallback to HTTP API
        const message = await ChatService.sendImageMessage(selectedChat.id, uploadResult.image_url);
        setMessages(prev => [...prev, message]);
        // No need to call loadChats - context WebSocket will handle updates
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to send image. Please try again.');
    } finally {
      setIsSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle key press in message input
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Connect to global WebSocket for all chats
  const connectToGlobalWebSocket = useCallback(async () => {
    try {
      setConnectionError(null);
      await globalWebSocketService.connect({
        onConnect: () => {
          setIsConnected(true);
        },
        onDisconnect: () => {
          setIsConnected(false);
          setTypingUsers(new Map()); // Clear typing indicators when disconnected
          setTypingUserNames(new Map());
        },
        onMessage: (message: Message, chatId: number) => {
          // Update messages if this is the currently selected chat
          if (selectedChat && selectedChat.id === chatId) {
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(m => m.id === message.id);
              if (exists) {
                return prev;
              }
              return [...prev, message];
            });
          }
          
          // No need to loadChats - the ChatContext WebSocket already handles this
        },
        onTypingStart: (userId: number, username: string, chatId: number) => {
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
        },
        onTypingStop: (userId: number, username: string, chatId: number) => {
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
        },
        onMessagesRead: (userId: number, chatId: number) => {
          // You could add logic here to update message read status in the UI if needed
        },
        onError: (error: string) => {
          setConnectionError(error);
        }
      });
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
    }
  }, [loadChats, selectedChat]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!isConnected || !selectedChat) {
      return;
    }

    // Send typing start for the current chat
    globalWebSocketService.sendTypingStart(selectedChat.id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      globalWebSocketService.sendTypingStop(selectedChat.id);
    }, 5000);
  }, [isConnected, selectedChat]);

  // Select chat
  const selectChat = (chat: Chat) => {
    // Leave previous chat if any
    if (selectedChat) {
      // Send typing stop for previous chat if user was typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        globalWebSocketService.sendTypingStop(selectedChat.id);
        typingTimeoutRef.current = null;
      }
      globalWebSocketService.leaveActiveChat();
    }
    
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile
    
    // Set this chat as active in global WebSocket
    globalWebSocketService.setActiveChat(chat.id);
    
    loadMessages(chat.id);
  };

  // Create new chat with user
  const createChatWithUser = async (user: User) => {
    setShowUserSearch(false);
    try {
      const chat = await ChatService.createChat(user.id);
      // Refresh chats from context to get updated list
      await refreshChats();
      selectChat(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Initial setup - no need to load chats as they come from context
  useEffect(() => {
    // Just update loading state since chats come from context
    setIsLoading(false);
    
    // Use the WebSocket connection from ChatContext instead of connecting here
    setIsConnected(contextIsConnected);
  }, [contextIsConnected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      globalWebSocketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing states
      setTypingUsers(new Map());
      setTypingUserNames(new Map());
    };
  }, []);

  // Handle message input changes for typing indicators
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  return (
    <Layout maxWidth="full" padding="minimal">
      <div className={styles['chat-container']}>
        {/* Chat List */}
        <div className={`${styles['chat-list']} ${showChatList ? styles.open : ''}`}>
          <div className={styles['chat-list-header']}>
            <h2 className={styles['chat-list-title']}>Messages</h2>
            <button 
              className={styles['new-chat-btn']}
              onClick={() => setShowUserSearch(true)}
            >
              + New Chat
            </button>
          </div>

          <div className={styles['chat-list-content']}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className={styles['empty-state']}>
                <p>No chats yet. Start a new conversation!</p>
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  className={`${styles['chat-item']} ${selectedChat?.id === chat.id ? styles.active : ''}`}
                  onClick={() => selectChat(chat)}
                >
                  <div className={styles['chat-item-user']}>
                    <UserAvatar user={chat.other_user} />
                    <div className={styles['user-info']}>
                      <h4>{chat.other_user.first_name && chat.other_user.last_name
                        ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                        : chat.other_user.username}</h4>
                      <p>@{chat.other_user.username}</p>
                    </div>
                  </div>
                  
                  {/* Show typing indicator if someone is typing in this chat */}
                  {typingUsers.has(chat.id) && typingUsers.get(chat.id)!.size > 0 ? (
                    <div className={`${styles['last-message']} ${styles['typing-indicator']}`}>
                      <span className={styles['typing-dots']}>💬 {
                        Array.from(typingUsers.get(chat.id)!).map(userId => {
                          // Use stored username or fallback to chat's other_user info
                          const storedName = typingUserNames.get(userId);
                          if (storedName) {
                            return storedName;
                          }
                          // Fallback to chat's other_user if it matches
                          if (chat.other_user.id === userId) {
                            return chat.other_user.first_name || chat.other_user.username;
                          }
                          return `User ${userId}`;
                        }).join(', ')
                      } typing...</span>
                    </div>
                  ) : chat.last_message ? (
                    <div className={`${styles['last-message']} ${chat.unread_count > 0 ? styles.unread : ''}`}>
                      {chat.last_message.message_type === 'image' ? '📷 Image' : chat.last_message.text_content}
                    </div>
                  ) : null}
                  
                  <div className={styles['chat-item-meta']}>
                    <span>{chat.last_message ? formatTime(chat.last_message.created_at) : ''}</span>
                    {chat.unread_count > 0 && (
                      <span className={styles['unread-badge']}>{chat.unread_count}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className={styles['chat-content']}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={styles['chat-header']}>
                <button 
                  className={styles['mobile-back-btn']}
                  onClick={() => setShowChatList(true)}
                >
                  ←
                </button>
                <UserAvatar user={selectedChat.other_user} size={36} />
                <div>
                  <h3 className={styles['chat-user-name']}>
                    {selectedChat.other_user.first_name && selectedChat.other_user.last_name
                      ? `${selectedChat.other_user.first_name} ${selectedChat.other_user.last_name}`
                      : selectedChat.other_user.username}
                  </h3>
                  <div className={styles['chat-user-status']}>
                    <span className={styles.username}>@{selectedChat.other_user.username}</span>
                    <div className={styles['connection-status']}>
                      {isConnected ? (
                        <span className={`${styles['status-indicator']} ${styles.online}`}>● Online</span>
                      ) : (
                        <span className={`${styles['status-indicator']} ${styles.offline}`}>● Offline</span>
                      )}
                      {connectionError && (
                        <div className={styles['connection-error-inline']}>
                          Error: {connectionError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Error */}
              {connectionError && (
                <div className={styles['connection-error']}>
                  ⚠️ Connection error: {connectionError}
                </div>
              )}

              {/* Messages */}
              <div className={styles['messages-container']}>
                {isLoadingMessages ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className={styles['empty-state']}>
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${message.sender.id === selectedChat.user1.id || 
                        message.sender.id === selectedChat.user2.id ? 
                        (message.sender.id !== selectedChat.other_user.id ? styles.own : styles.other) : styles.other}`}
                    >
                      <div className={styles['message-bubble']}>
                        {message.message_type === 'text' ? (
                          <p className={styles['message-text']}>{message.text_content}</p>
                        ) : (
                          <img
                            src={message.image_temp_url}
                            alt="Shared image"
                            className={styles['message-image']}
                            onClick={() => window.open(message.image_temp_url, '_blank')}
                          />
                        )}
                        <div className={styles['message-time']}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Typing indicators */}
                {selectedChat && typingUsers.has(selectedChat.id) && typingUsers.get(selectedChat.id)!.size > 0 && (
                  <div className={styles['typing-indicator']}>
                    <div className={styles['typing-bubble']}>
                      <div className={styles['typing-dots']}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <span className={styles['typing-text']}>{
                      Array.from(typingUsers.get(selectedChat.id)!).map(userId => {
                        // Use stored username or fallback to chat's other_user info
                        const storedName = typingUserNames.get(userId);
                        if (storedName) {
                          return storedName;
                        }
                        // Fallback to chat's other_user if it matches
                        if (selectedChat.other_user.id === userId) {
                          return selectedChat.other_user.first_name || selectedChat.other_user.username;
                        }
                        return `User ${userId}`;
                      }).join(', ')
                    } {typingUsers.get(selectedChat.id)!.size === 1 ? 'is' : 'are'} typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={styles['message-input-container']}>
                <div className={styles['message-input']}>
                  <textarea
                    className={styles['input-field']}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                    rows={1}
                  />
                  <div className={styles['input-buttons']}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      disabled={isSending}
                    />
                    <button
                      className={styles['input-btn']}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending}
                      title="Send image"
                    >
                      📷
                    </button>
                    <button
                      className={`${styles['input-btn']} ${styles.send} ${!messageInput.trim() || isSending ? styles.disabled : ''}`}
                      onClick={sendMessage}
                      disabled={!messageInput.trim() || isSending}
                      title="Send message"
                    >
                      {isSending ? '⏳' : '→'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles['empty-state']}>
              <h3>Select a chat</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>

        {/* User Search Modal */}
        <UserSearchModal
          isOpen={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelectUser={createChatWithUser}
        />
      </div>
    </Layout>
  );
};

export default ChatComponent;