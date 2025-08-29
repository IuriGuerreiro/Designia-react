import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';
import { ChatList } from './ChatList';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Chat.module.css';

interface Chat {
  id: number;
  other_user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  last_message?: any;
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

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentChat, 
    messages, 
    isConnected, 
    connectionError,
    selectChat,
    setCurrentChat,
    getUnreadCount,
    getTotalUnreadCount,
    markChatAsViewed
  } = useChat();
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChat?.id]);

  // Mark messages as read when user scrolls or interacts with chat
  useEffect(() => {
    if (!selectedChat) return;

    // Mark as read when chat is selected and has focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && selectedChat) {
        markChatAsViewed(selectedChat.id);
      }
    };

    const handleFocus = () => {
      if (selectedChat) {
        markChatAsViewed(selectedChat.id);
      }
    };

    // Mark as read when messages container is scrolled (user is actively viewing)
    const handleScroll = () => {
      if (selectedChat && messagesContainerRef.current) {
        // Debounce the mark as read call
        clearTimeout((handleScroll as any).timeout);
        (handleScroll as any).timeout = setTimeout(() => {
          markChatAsViewed(selectedChat.id);
        }, 1000);
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    if (messagesContainerRef.current) {
      messagesContainerRef.current.addEventListener('scroll', handleScroll);
    }

    // Mark as read immediately when chat is first opened
    const initialMarkTimeout = setTimeout(() => {
      markChatAsViewed(selectedChat.id);
    }, 500); // Small delay to allow messages to load

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      if (messagesContainerRef.current) {
        messagesContainerRef.current.removeEventListener('scroll', handleScroll);
      }
      
      clearTimeout(initialMarkTimeout);
      clearTimeout((handleScroll as any).timeout);
    };
  }, [selectedChat, markChatAsViewed]);

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    await selectChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setCurrentChat(null);
  };

  const getUserDisplayName = (userObj: { username: string; first_name?: string; last_name?: string }) => {
    if (userObj.first_name || userObj.last_name) {
      return `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim();
    }
    return userObj.username;
  };

  const getCurrentChatMessages = (): Message[] => {
    if (!selectedChat) return [];
    return messages[selectedChat.id] || [];
  };

  const isOwnMessage = (message: Message): boolean => {
    return user?.id === message.sender.id;
  };

  return (
    <div className={styles.chatContainer}>
      {/* Connection Status */}
      {connectionError && (
        <div className={styles.connectionError}>
          <span>⚠️</span>
          <span>Connection Error: {connectionError}</span>
        </div>
      )}

      <div className={styles.chatLayout}>
        {/* Chat List - Desktop always visible, Mobile conditionally visible */}
        <div className={`${styles.chatListPanel} ${selectedChat ? styles.hiddenOnMobile : ''}`}>
          <ChatList 
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>

        {/* Chat View */}
        <div className={`${styles.chatViewPanel} ${!selectedChat ? styles.hiddenOnMobile : ''}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.headerLeft}>
                  <button 
                    className={styles.backButton}
                    onClick={handleBackToList}
                    title="Back to chats"
                  >
                    ←
                  </button>
                  <div className={styles.chatInfo}>
                    <h3 className={styles.chatTitle}>
                      {getUserDisplayName(selectedChat.other_user)}
                    </h3>
                    <div className={styles.connectionStatus}>
                      <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
                      <span className={styles.statusText}>
                        {isConnected ? 'Online' : 'Connecting...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className={styles.messagesContainer}
              >
                {getCurrentChatMessages().length === 0 ? (
                  <div className={styles.emptyMessages}>
                    <div className={styles.emptyIcon}>💬</div>
                    <p>Start your conversation with {getUserDisplayName(selectedChat.other_user)}</p>
                  </div>
                ) : (
                  <div className={styles.messagesList}>
                    {getCurrentChatMessages().map((message, index) => {
                      const prevMessage = getCurrentChatMessages()[index - 1];
                      const showSenderName = !isOwnMessage(message) && (
                        !prevMessage || 
                        isOwnMessage(prevMessage) || 
                        prevMessage.sender.id !== message.sender.id
                      );

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwnMessage={isOwnMessage(message)}
                          showSenderName={showSenderName}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <MessageInput 
                chatId={selectedChat.id}
                disabled={!isConnected}
              />
            </>
          ) : (
            <div className={styles.emptyChatView}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};