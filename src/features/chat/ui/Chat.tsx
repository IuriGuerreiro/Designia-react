import { Fragment, useEffect, useRef, useState, type FC } from 'react';
import type { ChatMessage, ChatSummary } from '@/features/chat/model';
import { useChat } from '@/features/chat/state/ChatContext';
import { useAuth } from '@/features/auth/state/AuthContext';
import { ChatList } from './ChatList';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import styles from './Chat.module.css';

// Date Separator Component
const DateSeparator: FC<{ date: Date }> = ({ date }) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className={styles.dateSeparator}>
      <div className={styles.dateSeparatorLine}></div>
      <span className={styles.dateSeparatorText}>{formatDate(date)}</span>
      <div className={styles.dateSeparatorLine}></div>
    </div>
  );
};

// Skeleton Loading Component
const ChatSkeleton: FC = () => {
  return (
    <div className={styles.chatSkeleton}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonName}></div>
          <div className={styles.skeletonStatus}></div>
        </div>
      </div>
      <div className={styles.skeletonMessages}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonMessage}></div>
        ))}
      </div>
      <div className={styles.skeletonInput}></div>
    </div>
  );
};

export const Chat: FC = () => {
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
  
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<{
    title: string;
    message: string;
    isAuthError: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive (within container only)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    // Fallback for safety
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

  // Clear chat error when chat is successfully selected
  useEffect(() => {
    if (selectedChat && chatError) {
      setChatError(null);
    }
  }, [selectedChat, chatError]);

  // Handle chat selection
  const handleChatSelect = async (chat: Chat) => {
    try {
      setLoading(true);
      await selectChat(chat);
      setSelectedChat(chat); // Set the selected chat after successful selection
    } catch (error: any) {
      console.error('Failed to select chat:', error);
      
      // Handle authentication errors specifically
      if (error.message && error.message.includes('Authentication expired')) {
        setChatError({
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again to continue chatting.',
          isAuthError: true
        });
      } else {
        setChatError({
          title: 'Connection Error',
          message: 'Failed to load chat. Please try again.',
          isAuthError: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle authentication redirect
  const handleAuthRedirect = () => {
    // Clear any stored tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Render chat error with different styles for auth errors
  const renderChatError = () => {
    if (!chatError) return null;

    return (
      <div className={`${styles.connectionError} ${chatError.isAuthError ? styles.authError : ''}`}>
        <div className={styles.errorIcon}>
          {chatError.isAuthError ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
        </div>
        <div className={styles.errorContent}>
          <h4>{chatError.title}</h4>
          <p>{chatError.message}</p>
        </div>
        {chatError.isAuthError ? (
          <button 
            className={styles.authButton}
            onClick={handleAuthRedirect}
          >
            Log In
          </button>
        ) : (
          <button 
            className={styles.retryButton}
            onClick={() => setChatError(null)}
          >
            Retry
          </button>
        )}
      </div>
    );
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

  const getCurrentChatMessages = (): ChatMessage[] => {
    if (!selectedChat) return [];
    return messages[selectedChat.id] || [];
  };

  const isOwnMessage = (message: ChatMessage): boolean => user?.id === message.sender.id;

  const shouldShowDateSeparator = (
    currentMessage: ChatMessage,
    previousMessage?: ChatMessage,
  ): boolean => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.created_at);
    const previousDate = new Date(previousMessage.created_at);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const renderMessages = () => {
    const chatMessages = getCurrentChatMessages();
    
    if (chatMessages.length === 0) {
      return (
        <div className={styles.emptyMessages}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Start your conversation</h3>
          <p>Begin messaging with {getUserDisplayName(selectedChat!.other_user)}</p>
        </div>
      );
    }

    return (
      <div className={styles.messagesList}>
        {chatMessages.map((message, index) => {
          const prevMessage = chatMessages[index - 1];
          const showSenderName = !isOwnMessage(message) && (
            !prevMessage || 
            isOwnMessage(prevMessage) || 
            prevMessage.sender.id !== message.sender.id
          );

          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

          return (
            <Fragment key={message.id}>
              {showDateSeparator && (
                <DateSeparator date={new Date(message.created_at)} />
              )}
              <MessageBubble
                message={message}
                isOwnMessage={isOwnMessage(message)}
                showSenderName={showSenderName}
              />
            </Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => {
    return <ChatSkeleton />;
  };

  return (
    <div className={styles.chatContainer}>
      {/* Connection Status */}
              {renderChatError()}

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
          {loading ? (
            renderLoadingSkeleton()
          ) : selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.headerLeft}>
                  <button 
                    className={styles.backButton}
                    onClick={handleBackToList}
                    title="Back to chats"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                {renderMessages()}
              </div>

              {/* Message Input */}
              <MessageInput 
                chatId={selectedChat.id}
                disabled={!isConnected}
              />
            </>
          ) : (
            <div className={styles.emptyChatView}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
