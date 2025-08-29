import React, { useState, useRef, KeyboardEvent } from 'react';
import { useChat } from './ChatContext';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  chatId: number;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ chatId, disabled = false }) => {
  const { sendMessage, isConnected } = useChat();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await sendMessage(chatId, messageToSend, 'text');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }

    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const isDisabled = disabled || !isConnected || isSending;

  return (
    <div className={styles.messageInputContainer}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : disabled 
                ? "Chat unavailable"
                : "Type a message..."
          }
          disabled={isDisabled}
          className={styles.messageInput}
          rows={1}
        />
        
        <button
          onClick={handleSend}
          disabled={isDisabled || !message.trim()}
          className={styles.sendButton}
          title="Send message (Enter)"
        >
          {isSending ? (
            <span className={styles.spinner}>⟳</span>
          ) : (
            <span className={styles.sendIcon}>➤</span>
          )}
        </button>
      </div>
      
      {!isConnected && (
        <div className={styles.connectionStatus}>
          <span className={styles.disconnectedDot}></span>
          Connecting to chat...
        </div>
      )}
    </div>
  );
};