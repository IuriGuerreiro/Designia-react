// Global WebSocket service for user-level real-time notifications
import { type Message, type User } from '../types/chat';

export interface GlobalWebSocketMessage {
  type: 'chat_message' | 'typing_start' | 'typing_stop' | 'messages_read' | 'connection_success' | 'error';
  message?: Message;
  user_id?: number;
  username?: string;
  chat_id?: number;
  error?: string;
}

export interface GlobalWebSocketCallbacks {
  onMessage?: (message: Message, chatId: number) => void;
  onTypingStart?: (userId: number, username: string, chatId: number) => void;
  onTypingStop?: (userId: number, username: string, chatId: number) => void;
  onMessagesRead?: (userId: number, chatId: number) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class GlobalWebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: GlobalWebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private activeChatId: number | null = null;

  /**
   * Connect to global user WebSocket
   */
  connect(callbacks: GlobalWebSocketCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('🌐✅ Already connected to global WebSocket');
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
      if (!token) {
        this.isConnecting = false;
        reject(new Error('No authentication token found'));
        return;
      }

      // Construct WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      const wsHost = new URL(apiBaseUrl).host;
      const wsUrl = `${protocol}//${wsHost}/ws/user/?token=${encodeURIComponent(token)}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`🌐🔌 Connected to global WebSocket`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log(`🌐🔌 Disconnected from global WebSocket`, event.code, event.reason);
          this.isConnecting = false;
          this.callbacks.onDisconnect?.();
          
          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('🌐🔌 Global WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('Global WebSocket connection failed'));
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
      console.log(`🌐💬 Setting active chat to ${chatId}`);
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
      console.log(`🌐💬 Leaving active chat ${this.activeChatId}`);
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
      console.error('🌐❌ WebSocket not connected');
      return false;
    }

    console.log(`🌐📤 Sending text message to chat ${chatId}`);
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
      console.error('🌐❌ WebSocket not connected');
      return false;
    }

    console.log(`🌐📤 Sending image message to chat ${chatId}`);
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
      console.warn('🌐🔤❌ Cannot send typing_start: WebSocket not connected');
      return false;
    }

    console.log(`🌐🔤📤 Sending typing_start for chat ${chatId}`);
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
      console.warn('🌐⏹️❌ Cannot send typing_stop: WebSocket not connected');
      return false;
    }

    console.log(`🌐⏹️📤 Sending typing_stop for chat ${chatId}`);
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

    console.log(`🌐👁️📤 Marking messages as read for chat ${chatId}`);
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
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: GlobalWebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case 'connection_success':
          console.log('🌐✅ Global WebSocket connection confirmed');
          break;

        case 'chat_message':
          if (message.message && message.chat_id) {
            console.log(`🌐📥 Received message from chat ${message.chat_id}:`, message.message);
            this.callbacks.onMessage?.(message.message, message.chat_id);
          }
          break;

        case 'typing_start':
          if (message.user_id && message.username && message.chat_id) {
            console.log(`🌐🔤📥 Received typing_start from ${message.username} in chat ${message.chat_id}`);
            this.callbacks.onTypingStart?.(message.user_id, message.username, message.chat_id);
          }
          break;

        case 'typing_stop':
          if (message.user_id && message.username && message.chat_id) {
            console.log(`🌐⏹️📥 Received typing_stop from ${message.username} in chat ${message.chat_id}`);
            this.callbacks.onTypingStop?.(message.user_id, message.username, message.chat_id);
          }
          break;

        case 'messages_read':
          if (message.user_id && message.chat_id) {
            console.log(`🌐👁️📥 Messages read by user ${message.user_id} in chat ${message.chat_id}`);
            this.callbacks.onMessagesRead?.(message.user_id, message.chat_id);
          }
          break;

        case 'error':
          console.error('🌐❌ Global WebSocket error:', message.error);
          this.callbacks.onError?.(message.error || 'Unknown WebSocket error');
          break;

        default:
          console.warn('🌐❓ Unknown global WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('🌐❌ Error parsing global WebSocket message:', error);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🌐❌ Max reconnect attempts reached for global WebSocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🌐🔄 Attempting to reconnect global WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(this.callbacks).catch((error) => {
        console.error('🌐❌ Global WebSocket reconnect attempt failed:', error);
      });
    }, delay);
  }
}

// Export singleton instance
export const globalWebSocketService = new GlobalWebSocketService();
export default globalWebSocketService;