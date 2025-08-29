import React from 'react';
import styles from './MessageBubble.module.css';

interface Message {
  id: number;
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
  // Local states for instant messaging
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  error?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSenderName?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showSenderName = false
}) => {
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
            ✓
          </span>
        );
      case 'delivered':
        return (
          <span className={`${styles.messageStatus} ${styles.delivered}`}>
            ✓✓
          </span>
        );
      case 'read':
        return (
          <span className={`${styles.messageStatus} ${styles.read}`}>
            ✓✓
          </span>
        );
      case 'error':
        return (
          <span className={`${styles.messageStatus} ${styles.error}`}>
            ⚠️
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}>
      {showSenderName && !isOwnMessage && (
        <div className={styles.senderName}>{getSenderName()}</div>
      )}
      
      <div className={styles.messageContent}>
        {message.message_type === 'text' ? (
          <div className={styles.textMessage}>
            {message.text_content}
          </div>
        ) : (
          <div className={styles.imageMessage}>
            {message.image_temp_url ? (
              <img 
                src={message.image_temp_url} 
                alt="Shared image"
                className={styles.messageImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📷</span>
                <span>Image</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.messageMeta}>
        <span className={styles.messageTime}>{formatTime(message.created_at)}</span>
        {getMessageStatus()}
      </div>
      
      {/* Error message display */}
      {message.error && (
        <div className={styles.errorMessage}>
          {message.error}
        </div>
      )}
    </div>
  );
};