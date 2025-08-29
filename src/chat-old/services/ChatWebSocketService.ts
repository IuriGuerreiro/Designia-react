// Dedicated Chat WebSocket service for chat messaging only
import { type Message, type User } from '../types/chat';

export interface ChatWebSocketMessage {
  type: 'chat_message' | 'typing_start' | 'typing_stop' | 'messages_read' | 'new_chat' | 'connection_success' | 'error';
  message?: Message;
  chat?: any; // New chat object
  user_id?: number;
  username?: string;
  chat_id?: number;
  error?: string;
}

export interface ChatWebSocketCallbacks {
  onMessage?: (message: Message, chatId: number) => void;
  onTypingStart?: (userId: number, username: string, chatId: number) => void;
  onTypingStop?: (userId: number, username: string, chatId: number) => void;
  onMessagesRead?: (userId: number, chatId: number) => void;
  onNewChat?: (chat: any) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: ChatWebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private activeChatId: number | null = null;

  /**
   * Connect to dedicated chat WebSocket
   */
  connect(callbacks: ChatWebSocketCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('💬✅ Already connected to chat WebSocket');
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already attempting to connect'));
        return;
      }

      this.isConnecting = true;
      this.callbacks = callbacks;

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token');
      console.log('🔑 ChatWebSocketService checking token:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        timestamp: new Date().toISOString()
      });
      
      if (!token) {
        console.error('❌ No authentication token found in localStorage');
        this.isConnecting = false;
        reject(new Error('No authentication token found'));
        return;
      }

      // Construct WebSocket URL for chat
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      const wsHost = new URL(apiBaseUrl).host;
      const wsUrl = `${protocol}//${wsHost}/ws/chat/?token=${encodeURIComponent(token)}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`💬🔌 Connected to chat WebSocket`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log(`💬🔌 Disconnected from chat WebSocket`, event.code, event.reason);
          this.isConnecting = false;
          this.callbacks.onDisconnect?.();
          
          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('💬🔌 Chat WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('Chat WebSocket connection failed'));
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.activeChatId = null;
  }

  /**
   * Set the currently active chat
   */
  setActiveChat(chatId: number): void {
    if (this.activeChatId !== chatId) {
      console.log(`💬🎯 Setting active chat to ${chatId}`);
      this.activeChatId = chatId;
      
      // Join the chat group
      this.sendMessage({
        type: 'join_chat',
        chat_id: chatId
      });
    }
  }

  /**
   * Leave the currently active chat
   */
  leaveActiveChat(): void {
    if (this.activeChatId) {
      console.log(`💬🚪 Leaving active chat ${this.activeChatId}`);
      this.sendMessage({
        type: 'leave_chat',
        chat_id: this.activeChatId
      });
      this.activeChatId = null;
    }
  }

  /**
   * Send a text message to specific chat
   */
  sendTextMessage(chatId: number, text: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('💬❌ WebSocket not connected');
      return false;
    }

    console.log(`💬📤 Sending text message to chat ${chatId}`);
    return this.sendMessage({
      type: 'chat_message',
      chat_id: chatId,
      message_type: 'text',
      text_content: text.trim()
    });
  }

  /**
   * Send an image message to specific chat
   */
  sendImageMessage(chatId: number, imageUrl: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('💬❌ WebSocket not connected');
      return false;
    }

    console.log(`💬📤 Sending image message to chat ${chatId}`);
    return this.sendMessage({
      type: 'chat_message',
      chat_id: chatId,
      message_type: 'image',
      image_url: imageUrl
    });
  }

  /**
   * Send typing start notification for specific chat
   */
  sendTypingStart(chatId: number): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    return this.sendMessage({
      type: 'typing_start',
      chat_id: chatId
    });
  }

  /**
   * Send typing stop notification for specific chat
   */
  sendTypingStop(chatId: number): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('💬⏹️❌ Cannot send typing_stop: WebSocket not connected');
      return false;
    }

    console.log(`💬⏹️📤 Sending typing_stop for chat ${chatId}`);
    return this.sendMessage({
      type: 'typing_stop',
      chat_id: chatId
    });
  }

  /**
   * Mark messages as read for specific chat
   */
  markMessagesAsRead(chatId: number): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    console.log(`💬👁️📤 Marking messages as read for chat ${chatId}`);
    return this.sendMessage({
      type: 'mark_read',
      chat_id: chatId
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get current active chat ID
   */
  getActiveChatId(): number | null {
    return this.activeChatId;
  }

  /**
   * Send a message to the WebSocket
   */
  private sendMessage(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify(message));
    return true;
  }

  /**
   * Handle valid chat message
   */
  private handleChatMessage(message: Message, chatId: number): void {
    console.log(`💬📥 ChatWebSocketService received message from chat ${chatId}:`, { 
      messageId: message.id, 
      senderId: message.sender?.id,
      text: message.text_content?.substring(0, 50),
      hasCallback: !!this.callbacks.onMessage
    });
    
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage(message, chatId);
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: ChatWebSocketMessage = JSON.parse(data);
      console.log('💬📥 Parsed chat WebSocket message:', message);

      switch (message.type) {
        case 'connection_success':
          if (message.user_id) {
            console.log(`✅ ChatWebSocketService connection successful for user ${message.user_id}`);
          } else {
            console.error('❌ Invalid connection_success format:', { 
              user_id: message.user_id 
            });
          }
          break;

        case 'chat_message':
          console.log('💬📥 Processing chat_message:', {
            hasMessage: !!message.message, 
            hasChatId: !!message.chat_id,
            messageType: typeof message.message, 
            chatIdType: typeof message.chat_id,
            messageKeys: message.message ? Object.keys(message.message) : 'undefined',
            fullMessage: message
          });
          
          // Validate that both message and chat_id are present
          if (message.message && message.chat_id) {
            // Ensure message has required fields
            if (message.message.id && message.message.sender) {
              console.log('✅ Valid chat_message received, processing...');
              // Convert chat_id from string to number
              const chatId = typeof message.chat_id === 'string' ? parseInt(message.chat_id, 10) : message.chat_id;
              this.handleChatMessage(message.message, chatId);
            } else {
              console.error('❌ Invalid message structure in chat_message:', {
                hasId: !!message.message.id,
                hasSender: !!message.message.sender,
                message: message.message
              });
            }
          } else {
            console.error('❌ Invalid chat_message format - missing message or chat_id:', { 
              message: message.message, 
              chat_id: message.chat_id,
              messageValid: !!(message.message && message.message.id), 
              chatIdValid: !!message.chat_id 
            });
          }
          break;

        case 'typing_start':
          if (message.user_id && message.username && message.chat_id) {
            console.log(`🔤📥 ChatWebSocketService received typing_start from ${message.username} in chat ${message.chat_id}`);
            // Convert chat_id from string to number
            const chatId = typeof message.chat_id === 'string' ? parseInt(message.chat_id, 10) : message.chat_id;
            this.callbacks.onTypingStart?.(message.user_id, message.username, chatId);
          } else {
            console.error('❌ Invalid typing_start format:', { 
              user_id: message.user_id, 
              username: message.username, 
              chat_id: message.chat_id 
            });
          }
          break;

        case 'typing_stop':
          if (message.user_id && message.username && message.chat_id) {
            console.log(`⏹️📥 ChatWebSocketService received typing_stop from ${message.username} in chat ${message.chat_id}`);
            // Convert chat_id from string to number
            const chatId = typeof message.chat_id === 'string' ? parseInt(message.chat_id, 10) : message.chat_id;
            this.callbacks.onTypingStop?.(message.user_id, message.username, chatId);
          } else {
            console.error('❌ Invalid typing_stop format:', { 
              user_id: message.user_id, 
              username: message.username, 
              chat_id: message.chat_id 
            });
          }
          break;

        case 'messages_read':
          if (message.user_id && message.chat_id) {
            console.log(`👁️📥 ChatWebSocketService received messages_read from user ${message.user_id} in chat ${message.chat_id}`);
            // Convert chat_id from string to number
            const chatId = typeof message.chat_id === 'string' ? parseInt(message.chat_id, 10) : message.chat_id;
            this.callbacks.onMessagesRead?.(message.user_id, chatId);
          } else {
            console.error('❌ Invalid messages_read format:', { 
              user_id: message.user_id, 
              chat_id: message.chat_id 
            });
          }
          break;

        case 'new_chat':
          if (message.chat && message.chat.id) {
            console.log(`💬📥 ChatWebSocketService received new_chat notification:`, message.chat);
            this.callbacks.onNewChat?.(message.chat);
          } else {
            console.error('❌ Invalid new_chat format:', { 
              hasChat: !!message.chat, 
              chatId: message.chat?.id 
            });
          }
          break;

        case 'error':
          console.error('💬❌ Chat WebSocket error:', message.error);
          this.callbacks.onError?.(message.error || 'Unknown WebSocket error');
          break;

        default:
          console.warn('💬❓ Unknown chat WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('💬❌ Error parsing chat WebSocket message:', error);
      console.error('💬❌ Raw data that failed to parse:', data);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💬❌ Max reconnect attempts reached for chat WebSocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`💬🔄 Attempting to reconnect chat WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(this.callbacks).catch((error) => {
        console.error('💬❌ Chat WebSocket reconnect attempt failed:', error);
      });
    }, delay);
  }
}

// Export singleton instance
export const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;