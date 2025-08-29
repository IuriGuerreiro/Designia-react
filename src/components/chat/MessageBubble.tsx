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
        {isOwnMessage && (
          <span className={`${styles.messageStatus} ${message.is_read ? styles.read : styles.sent}`}>
            {message.is_read ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};