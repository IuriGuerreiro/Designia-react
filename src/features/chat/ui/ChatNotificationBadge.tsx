import { type FC } from 'react';
import { useChat } from '@/features/chat/state/ChatContext';
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
  /**
   * Variant of the badge styling
   */
  variant?: 'default' | 'premium' | 'urgent';
}

export const ChatNotificationBadge: FC<ChatNotificationBadgeProps> = ({
  size = 'medium',
  position = 'top-right',
  className = '',
  maxCount = 99,
  showWhenZero = false,
  variant = 'default'
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
    styles[variant],
    className
  ].filter(Boolean).join(' ');
  
  const getBadgeIcon = () => {
    if (variant === 'urgent') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    if (variant === 'premium') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };
  
  return (
    <span className={badgeClasses}>
      {variant !== 'default' && (
        <span className={styles.badgeIcon}>
          {getBadgeIcon()}
        </span>
      )}
      <span className={styles.badgeCount}>
        {displayCount}
      </span>
    </span>
  );
};

// Hook for getting unread count without rendering badge
export const useChatUnreadCount = () => {
  const { getTotalUnreadCount } = useChat();
  return getTotalUnreadCount();
};

// Animated badge for urgent notifications
export const AnimatedChatBadge: FC<ChatNotificationBadgeProps> = (props) => {
  return (
    <div className={styles.animatedBadgeWrapper}>
      <ChatNotificationBadge {...props} variant="urgent" />
    </div>
  );
};