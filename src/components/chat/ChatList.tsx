import React, { useState } from 'react';
import { useChat } from './ChatContext';
import styles from './ChatList.module.css';

interface Chat {
  id: number;
  other_user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  last_message?: {
    id: number;
    sender: {
      id: number;
      username: string;
      first_name?: string;
      last_name?: string;
    };
    message_type: 'text' | 'image';
    text_content?: string;
    created_at: string;
    is_read: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface ChatUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: number;
}

// Skeleton Loading Component
const ChatItemSkeleton: React.FC = () => {
  return (
    <div className={styles.chatItemSkeleton}>
      <div className={styles.skeletonAvatar}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonName}></div>
        <div className={styles.skeletonMessage}></div>
      </div>
    </div>
  );
};

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const { chats, createChat, searchUsers, getUnreadCount, getTotalUnreadCount } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      // Less than 24 hours - show time
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // Less than 7 days - show day
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Show date
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getUserDisplayName = (user: { username: string; first_name?: string; last_name?: string }) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username;
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.last_message) {
      return 'No messages yet';
    }

    const message = chat.last_message;
    if (message.message_type === 'image') {
      return '📷 Image';
    }
    
    return message.text_content || 'Message';
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (query.length < 2) {
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = async (user: ChatUser) => {
    setIsCreatingChat(true);
    try {
      const chat = await createChat(user.id);
      onChatSelect(chat);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const clearSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Render loading skeletons
  const renderLoadingSkeletons = () => {
    return (
      <div className={styles.chatList}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ChatItemSkeleton key={index} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.chatListContainer}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>Messages</h2>
          {getTotalUnreadCount() > 0 && (
            <span className={styles.totalUnreadBadge}>
              {getTotalUnreadCount()}
            </span>
          )}
        </div>
        <button
          className={styles.newChatButton}
          onClick={() => setShowSearch(!showSearch)}
          title="Start new chat"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {showSearch && (
        <div className={styles.searchSection}>
          <div className={styles.searchHeader}>
            <h3>New Conversation</h3>
            <button 
              className={styles.closeSearchButton}
              onClick={clearSearch}
              title="Close search"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className={styles.searchInputWrapper}>
            <div className={styles.searchIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users to chat with..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
          
          {isSearching && (
            <div className={styles.searchStatus}>
              <div className={styles.searchSpinner}></div>
              <span>Searching...</span>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className={styles.searchResult}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className={styles.userAvatar}>
                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {getUserDisplayName(user)}
                    </div>
                    <div className={styles.userEmail}>
                      @{user.username}
                    </div>
                  </div>
                  {isCreatingChat && (
                    <div className={styles.creatingIndicator}>
                      <div className={styles.creatingSpinner}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>No users found</h4>
              <p>No users match "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      <div className={styles.chatList}>
        {chats.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>No conversations yet</h3>
            <p>Start a new chat by searching for users above</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.selected : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div className={styles.chatAvatar}>
                {getUserDisplayName(chat.other_user).charAt(0).toUpperCase()}
              </div>
              
              <div className={styles.chatContent}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatName}>
                    {getUserDisplayName(chat.other_user)}
                  </span>
                  <span className={styles.chatTime}>
                    {formatTime(chat.last_message?.created_at || chat.created_at)}
                  </span>
                </div>
                
                <div className={styles.chatPreview}>
                  <span className={styles.lastMessage}>
                    {getLastMessagePreview(chat)}
                  </span>
                  {getUnreadCount(chat.id) > 0 && (
                    <span className={styles.unreadBadge}>
                      {getUnreadCount(chat.id)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};