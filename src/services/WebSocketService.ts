// WebSocket service for real-time chat functionality
import { type Message, type User } from '../types/chat';

export interface WebSocketMessage {
  type: 'chat_message' | 'user_joined' | 'user_left' | 'typing_start' | 'typing_stop' | 'messages_read' | 'error';
  message?: Message;
  user_id?: number;
  username?: string;
  chat_id?: number;
  error?: string;
}

export interface WebSocketCallbacks {
  onMessage?: (message: Message) => void;
  onUserJoined?: (userId: number, username: string) => void;
  onUserLeft?: (userId: number, username: string) => void;
  onTypingStart?: (userId: number, username: string) => void;
  onTypingStop?: (userId: number, username: string) => void;
  onMessagesRead?: (userId: number, chatId: number) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private chatId: number | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  /**
   * Connect to WebSocket for a specific chat
   */
  connect(chatId: number, callbacks: WebSocketCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Already connected to the same chat
        if (this.chatId === chatId) {
          resolve();
          return;
        }
        // Disconnect from current chat first
        this.disconnect();
      }

      if (this.isConnecting) {
        reject(new Error('Already attempting to connect'));
        return;
      }

      this.isConnecting = true;
      this.chatId = chatId;
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
      // Use environment variable for API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      const wsHost = new URL(apiBaseUrl).host;
      const wsUrl = `${protocol}//${wsHost}/ws/chat/${chatId}/?token=${encodeURIComponent(token)}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`🔌 WebSocket connected to chat ${chatId}`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log(`🔌 WebSocket disconnected from chat ${chatId}`, event.code, event.reason);
          this.isConnecting = false;
          this.callbacks.onDisconnect?.();
          
          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('🔌 WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('WebSocket connection failed'));
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
    this.chatId = null;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Send a text message
   */
  sendTextMessage(text: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      const message = {
        type: 'chat_message',
        message_type: 'text',
        text_content: text.trim()
      };

      this.socket.send(JSON.stringify(message));
      console.log('📤 Text message sent successfully:', { text: text.substring(0, 50) });
      return true;
    } catch (error) {
      console.error('❌ WebSocket send failed:', error);
      return false;
    }
  }

  /**
   * Send an image message
   */
  sendImageMessage(imageUrl: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      const message = {
        type: 'chat_message',
        message_type: 'image',
        image_url: imageUrl
      };

      this.socket.send(JSON.stringify(message));
      console.log('📤 Image message sent successfully:', { imageUrl: imageUrl.substring(0, 50) });
      return true;
    } catch (error) {
      console.error('❌ WebSocket send failed:', error);
      return false;
    }
  }

  /**
   * Send typing start notification
   */
  sendTypingStart(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('🔤❌ Cannot send typing_start: WebSocket not connected');
      return false;
    }

    try {
      console.log('🔤📤 Sending typing_start to server');
      this.socket.send(JSON.stringify({ type: 'typing_start' }));
      return true;
    } catch (error) {
      console.error('❌ WebSocket send failed for typing_start:', error);
      return false;
    }
  }

  /**
   * Send typing stop notification
   */
  sendTypingStop(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⏹️❌ Cannot send typing_stop: WebSocket not connected');
      return false;
    }

    try {
      console.log('⏹️📤 Sending typing_stop to server');
      this.socket.send(JSON.stringify({ type: 'typing_stop' }));
      return true;
    } catch (error) {
      console.error('❌ WebSocket send failed for typing_stop:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.socket.send(JSON.stringify({ type: 'mark_read' }));
      console.log('👁️📤 Mark messages as read sent successfully');
      return true;
    } catch (error) {
      console.error('❌ WebSocket send failed for mark_read:', error);
      return false;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get current chat ID
   */
  getCurrentChatId(): number | null {
    return this.chatId;
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case 'chat_message':
          if (message.message) {
            this.callbacks.onMessage?.(message.message);
          }
          break;

        case 'user_joined':
          if (message.user_id && message.username) {
            this.callbacks.onUserJoined?.(message.user_id, message.username);
          }
          break;

        case 'user_left':
          if (message.user_id && message.username) {
            this.callbacks.onUserLeft?.(message.user_id, message.username);
          }
          break;

        case 'typing_start':
          if (message.user_id && message.username) {
            console.log(`🔤📥 Received typing_start from ${message.username} (ID: ${message.user_id})`);
            this.callbacks.onTypingStart?.(message.user_id, message.username);
          }
          break;

        case 'typing_stop':
          if (message.user_id && message.username) {
            console.log(`⏹️📥 Received typing_stop from ${message.username} (ID: ${message.user_id})`);
            this.callbacks.onTypingStop?.(message.user_id, message.username);
          }
          break;

        case 'messages_read':
          if (message.user_id && message.chat_id) {
            this.callbacks.onMessagesRead?.(message.user_id, message.chat_id);
          }
          break;

        case 'error':
          console.error('WebSocket error:', message.error);
          this.callbacks.onError?.(message.error || 'Unknown WebSocket error');
          break;

        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.chatId) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.chatId) {
        this.connect(this.chatId, this.callbacks).catch((error) => {
          console.error('Reconnect attempt failed:', error);
        });
      }
    }, delay);
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;