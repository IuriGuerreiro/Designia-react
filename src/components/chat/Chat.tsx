import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
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
  searchUsersFromContext: (query: string) => Promise<User[]>;
}> = ({ isOpen, onClose, onSelectUser, searchUsersFromContext }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await searchUsersFromContext(query);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchUsersFromContext]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

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
  // Context - get all chat functionality from context
  const { 
    chats, 
    isConnected,
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
    markMessagesAsRead,
    typingUsers,
    typingUserNames,
    setMessageCallback,
    getWebSocketStatus
  } = useChatContext();
  
  // Get current user for optimistic updates
  const { user } = useAuth();
  
  // Local component state
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

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
      // Always get page 1 which has the most recent messages (backend orders by -created_at)
      const response = await getMessages(chatId, 1);
      console.log('📊 Messages loaded for chat', chatId, ':', {
        totalMessages: response.results.length,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
        count: response.count,
        firstMessageText: response.results[0]?.text_content?.substring(0, 20) + '...',
        firstMessageTime: response.results[0]?.created_at,
        lastMessageText: response.results[response.results.length - 1]?.text_content?.substring(0, 20) + '...',
        lastMessageTime: response.results[response.results.length - 1]?.created_at
      });
      
      // Backend returns 50 most recent messages (newest first), reverse for chat display (oldest first)
      setMessages(response.results.reverse());
      
      // Mark messages as read via context
      await markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [getMessages, markMessagesAsRead]);

  // Send text message
  const sendMessage = async () => {
    if (!selectedChat || !messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput(''); // Clear input immediately for better UX
    setIsSending(true);

    try {
      // Debug WebSocket status
      const wsStatus = getWebSocketStatus();
      console.log('🔍 WebSocket status before sending:', wsStatus);
      
      if (isConnected) {
        // Send via context WebSocket for real-time delivery
        console.log('📤 Attempting to send message via WebSocket...');
        const success = sendTextMessage(selectedChat.id, messageText);
        
        if (success) {
          console.log('✅ Message sent via WebSocket successfully');
          
          // Optimistic update - add message immediately to local state
          // The WebSocket callback will handle adding it again, but we check for duplicates
          const optimisticMessage: Message = {
            id: Date.now(), // Temporary ID, will be replaced when real message comes back
            chat: selectedChat.id,
            text_content: messageText,
            message_type: 'text',
            sender: user!, // Current user is sending the message
            created_at: new Date().toISOString(),
            image_temp_url: '',
            is_read: false
          };
          
          setMessages(prev => [...prev, optimisticMessage]);
        } else {
          console.warn('⚠️ WebSocket send failed, message may not be delivered');
          // Still add optimistic message, but warn user
          const optimisticMessage: Message = {
            id: Date.now(),
            chat: selectedChat.id,
            text_content: messageText,
            message_type: 'text',
            sender: user!,
            created_at: new Date().toISOString(),
            image_temp_url: '',
            is_read: false
          };
          
          setMessages(prev => [...prev, optimisticMessage]);
          
          // Show warning to user
          alert('Message sent but may not be delivered in real-time. Please check your connection.');
        }
      } else {
        console.warn('⚠️ WebSocket not connected, message may not be delivered');
        alert('Connection error. Please check your internet connection.');
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessageInput(messageText); // Restore message on error
      alert('Failed to send message. Please try again.');
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
      // First upload the image via context
      const uploadResult = await uploadImage(file);
      
      // Then send via WebSocket if connected
      if (isConnected) {
        const success = sendImageMessage(selectedChat.id, uploadResult.image_url);
        if (!success) {
          throw new Error('WebSocket send failed');
        }
        // Note: The actual message will be added to the UI via WebSocket onMessage callback
      } else {
        alert('Connection error. Please check your internet connection.');
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

  // Register message callback with ChatContext to update local messages
  useEffect(() => {
    const messageHandler = (message?: Message, chatId?: number) => {
      // Console log when a new message event is received
      console.log('📥 NEW MESSAGE EVENT RECEIVED:', {
        messageId: message?.id,
        chatId,
        selectedChatId: selectedChat?.id,
        messageValid: !!(message && message.id),
        chatIdValid: !!chatId
      });
      
      // Safety check - ensure message and chatId exist
      if (!message || !message.id || !chatId) {
        console.error('❌ Received invalid message in callback:', { 
          message, 
          chatId,
          messageValid: !!(message && message.id),
          chatIdValid: !!chatId,
          messageType: typeof message,
          chatIdType: typeof chatId,
          selectedChatId: selectedChat?.id
        });
        return;
      }
      
      // Check if this message is for the currently selected chat
      if (selectedChat && selectedChat.id === chatId) {
        console.log('✅ THIS IS THE SELECTED CHAT - MESSAGE WILL BE ADDED:', {
          selectedChatId: selectedChat.id,
          eventChatId: chatId,
          messageId: message.id,
          messageText: message.text_content?.substring(0, 50) + '...'
        });
        
        setMessages(prev => {
          // Check if this is a real message replacing an optimistic one
          // Look for optimistic messages with similar content and timestamp
          const optimisticIndex = prev.findIndex(m => 
            m.id > 1000000000000 && // Temporary ID (timestamp)
            m.text_content === message.text_content &&
            m.sender.id === message.sender.id &&
            Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 10000 // Within 10 seconds
          );
          
          if (optimisticIndex !== -1) {
            // Replace the optimistic message with the real one
            const newMessages = [...prev];
            newMessages[optimisticIndex] = message;
            return newMessages;
          }
          
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            return prev;
          }
          
          return [...prev, message];
        });
      }
    };

    // Debug: Check callback registration
    console.log('🔧 CHAT.TSX REGISTERING CALLBACK:', {
      hasSetMessageCallback: !!setMessageCallback,
      setMessageCallbackType: typeof setMessageCallback,
      selectedChatId: selectedChat?.id,
      registering: !!(setMessageCallback && typeof setMessageCallback === 'function')
    });

    // Register the callback
    if (setMessageCallback && typeof setMessageCallback === 'function') {
      console.log('✅ CHAT.TSX CALLBACK REGISTERED for chat:', selectedChat?.id);
      setMessageCallback(messageHandler);
    } else {
      console.log('❌ CHAT.TSX CALLBACK NOT REGISTERED:', {
        hasSetMessageCallback: !!setMessageCallback,
        setMessageCallbackType: typeof setMessageCallback
      });
    }

    return () => {
      console.log('🧹 CHAT.TSX CLEANING UP CALLBACK for chat:', selectedChat?.id);
      if (setMessageCallback && typeof setMessageCallback === 'function') {
        setMessageCallback(undefined);
      }
    };
  }, [selectedChat?.id, isConnected]); // Re-register callback when WebSocket reconnects

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!isConnected || !selectedChat) {
      return;
    }

    // Send typing start for the current chat via context
    sendTypingStart(selectedChat.id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(selectedChat.id);
    }, 5000);
  }, [isConnected, selectedChat, sendTypingStart, sendTypingStop]);

  // Select chat
  const selectChat = (chat: Chat) => {
    console.log('🎯 CHAT SELECTED:', {
      chatId: chat.id,
      otherUser: chat.other_user.username,
      previousSelectedChatId: selectedChat?.id || 'none',
      timestamp: new Date().toISOString()
    });
    
    // Leave previous chat if any
    if (selectedChat) {
      // Send typing stop for previous chat if user was typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        sendTypingStop(selectedChat.id);
        typingTimeoutRef.current = null;
      }
      leaveActiveChat();
    }
    
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile
    
    // Set this chat as active via context
    setActiveChat(chat.id);
    
    loadMessages(chat.id);
  };

  // Create new chat with user
  const createChatWithUser = async (user: User) => {
    console.log('🔨 Creating new chat with user:', { userId: user.id, username: user.username });
    setShowUserSearch(false);
    try {
      const chat = await createChat(user.id);
      console.log('✅ Chat created successfully:', { chatId: chat.id, otherUser: user.username });
      selectChat(chat);
    } catch (error) {
      console.error('❌ Error creating chat:', error);
    }
  };

  // Initial setup - no need to load chats as they come from context
  useEffect(() => {
    // Just update loading state since chats come from context
    setIsLoading(false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
                    </div>
                  </div>
                </div>
              </div>


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
          searchUsersFromContext={searchUsers}
        />
      </div>
    </Layout>
  );
};

export default ChatComponent;