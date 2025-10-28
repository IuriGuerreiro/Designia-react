import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/features/chat/model';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSenderName?: boolean;
}

export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showSenderName = false
}) => {
  const { t } = useTranslation();
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getSenderName = () => {
    if (message.sender.first_name || message.sender.last_name) {
      return `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim();
    }
    return message.sender.username;
  };

  const getMessageStatus = () => {
    if (!isOwnMessage) return null;
    
    // Use local status if available, otherwise derive from is_read
    const status = message.status || (message.is_read ? 'read' : 'delivered');
    
    switch (status) {
      case 'sending':
        return (
          <span className={`${styles.messageStatus} ${styles.sending}`}>
            <div className={styles.loadingSpinner}></div>
          </span>
        );
      case 'sent':
        return (
          <span className={`${styles.messageStatus} ${styles.sent}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      case 'delivered':
        return (
          <span className={`${styles.messageStatus} ${styles.delivered}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      case 'read':
        return (
          <span className={`${styles.messageStatus} ${styles.read}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      case 'error':
        return (
          <span className={`${styles.messageStatus} ${styles.error}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    if (message.message_type === 'text') {
      return (
        <div className={styles.textMessage}>
          {message.text_content}
        </div>
      );
    }
    
    if (message.message_type === 'image') {
      if (message.image_temp_url) {
        return (
          <div className={styles.imageMessage}>
            <img 
              src={message.image_temp_url} 
              alt={t('chat.message.image_alt')}
              className={styles.messageImage}
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className={styles.imagePlaceholder}>
            <div className={styles.imageIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>{t('chat.message.image_label')}</span>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}>
      {showSenderName && !isOwnMessage && (
        <div className={styles.senderName}>
          <span>{getSenderName()}</span>
        </div>
      )}
      
      <div className={styles.messageContent}>
        {renderMessageContent()}
      </div>
      
      <div className={styles.messageMeta}>
        <span className={styles.messageTime}>{formatTime(message.created_at)}</span>
        {getMessageStatus()}
      </div>
      
      {/* Error message display */}
      {message.error && (
        <div className={styles.errorMessage}>
          <div className={styles.errorIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>{message.error}</span>
        </div>
      )}
    </div>
  );
};
