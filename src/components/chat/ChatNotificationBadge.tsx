import React from 'react';
import { useChat } from './ChatContext';
import styles from './ChatNotificationBadge.module.css';

interface ChatNotificationBadgeProps {
  /**
   * Size variant of the badge
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Position of the badge relative to parent
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  /**
   * Custom className for additional styling
   */
  className?: string;
  /**
   * Maximum count to display before showing "99+"
   */
  maxCount?: number;
  /**
   * Show badge even with 0 count (for testing or always-visible design)
   */
  showWhenZero?: boolean;
}

export const ChatNotificationBadge: React.FC<ChatNotificationBadgeProps> = ({
  size = 'medium',
  position = 'top-right',
  className = '',
  maxCount = 99,
  showWhenZero = false
}) => {
  const { getTotalUnreadCount } = useChat();
  
  const unreadCount = getTotalUnreadCount();
  
  // Don't render if count is 0 and showWhenZero is false
  if (unreadCount === 0 && !showWhenZero) {
    return null;
  }
  
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
  
  const badgeClasses = [
    styles.chatNotificationBadge,
    styles[size],
    styles[position],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <span className={badgeClasses}>
      {displayCount}
    </span>
  );
};

// Hook for getting unread count without rendering badge
export const useChatUnreadCount = () => {
  const { getTotalUnreadCount } = useChat();
  return getTotalUnreadCount();
};