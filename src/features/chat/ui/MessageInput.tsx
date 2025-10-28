import { useRef, useState, type ChangeEvent, type KeyboardEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/features/chat/state/ChatContext';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  chatId: number;
  disabled?: boolean;
}

export const MessageInput: FC<MessageInputProps> = ({ chatId, disabled = false }) => {
  const { t } = useTranslation();
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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const isDisabled = disabled || !isConnected || isSending;

  const getPlaceholderText = () => {
    if (!isConnected) return t('chat.input.connecting');
    if (disabled) return t('chat.input.unavailable');
    return t('chat.input.placeholder');
  };

  const getSendButtonIcon = () => {
    if (isSending) {
      return (
        <div className={styles.spinner}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M7.76 16.24L4.93 19.07M19.07 4.93L16.24 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
    return (
      <span className="material-symbols-outlined" aria-hidden="true">send</span>
    );
  };

  return (
    <div className={styles.messageInputContainer}>
      <div className={styles.inputWrapper}>
        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            disabled={isDisabled}
            className={styles.messageInput}
            rows={1}
          />
          <div className={styles.inputActions}>
            <button
              className={styles.attachButton}
              disabled={isDisabled}
              title={t('chat.input.attach_file')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.44 11.05L9.62 22.88C9.23 23.27 8.69 23.27 8.3 22.88L1.56 16.14C1.17 15.75 1.17 15.21 1.56 14.82L13.38 3C13.77 2.61 14.31 2.61 14.7 3L21.44 9.74C21.83 10.13 21.83 10.67 21.44 11.05Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={isDisabled || !message.trim()}
          className={styles.sendButton}
          title={t('chat.input.send_hint')}
        >
          {getSendButtonIcon()}
        </button>
      </div>
      
      {!isConnected && (
        <div className={styles.connectionStatus}>
          <div className={styles.connectionIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>{t('chat.input.connecting_banner')}</span>
        </div>
      )}
      
      <div className={styles.inputFooter}>
        <span className={styles.inputHint}>
          {t('chat.input.footer_hint')}
        </span>
      </div>
    </div>
  );
};
