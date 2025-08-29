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

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const { chats, createChat, searchUsers, getUnreadCount, getTotalUnreadCount } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
    try {
      const chat = await createChat(user.id);
      onChatSelect(chat);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
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
          ✉️
        </button>
      </div>

      {showSearch && (
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search users to chat with..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          
          {isSearching && (
            <div className={styles.searchStatus}>
              Searching...
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
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {getUserDisplayName(user)}
                    </div>
                    <div className={styles.userEmail}>
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className={styles.noResults}>
              No users found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      <div className={styles.chatList}>
        {chats.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p>No conversations yet</p>
            <p className={styles.emptySubtext}>
              Start a new chat by searching for users above
            </p>
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