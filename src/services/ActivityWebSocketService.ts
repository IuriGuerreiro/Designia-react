// Activity WebSocket service for cart notifications and activity tracking
export interface ActivityWebSocketMessage {
  type: 'connection_success' | 'cart_updated' | 'activity_notification' | 'cart_count_update' | 'unread_messages_count_update' | 'error';
  user_id?: number;
  cart_count?: number;
  unread_messages_count?: number;
  action?: string;
  product_id?: number;
  message?: string;
  notification_type?: string;
  title?: string;
  data?: any;
  error?: string;
}

export interface ActivityWebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCartUpdate?: (cartCount: number) => void;
  onUnreadMessagesUpdate?: (unreadCount: number) => void;
  onActivityNotification?: (notification: any) => void;
  onError?: (error: string) => void;
}

export class ActivityWebSocketService {
  private static instance: ActivityWebSocketService;
  private socket: WebSocket | null = null;
  private callbacks: ActivityWebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  public static getInstance(): ActivityWebSocketService {
    if (!ActivityWebSocketService.instance) {
      ActivityWebSocketService.instance = new ActivityWebSocketService();
    }
    return ActivityWebSocketService.instance;
  }

  /**
   * Connect to activity WebSocket
   */
  connect(callbacks: ActivityWebSocketCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('⚡✅ Already connected to activity WebSocket - merging callbacks');
        // Merge new callbacks with existing ones
        this.callbacks = { ...this.callbacks, ...callbacks };
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('⚡🔄 Connection already in progress - merging callbacks');
        // Merge callbacks and resolve once current connection completes
        this.callbacks = { ...this.callbacks, ...callbacks };
        // Wait for existing connection to complete
        const checkConnection = () => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;
      this.callbacks = callbacks;

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token');
      console.log('🔑 ActivityWebSocketService creating new connection:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        timestamp: new Date().toISOString(),
        currentSocketState: this.socket?.readyState || 'none'
      });
      
      if (!token) {
        console.error('❌ No authentication token found in localStorage');
        this.isConnecting = false;
        reject(new Error('No authentication token found'));
        return;
      }

      // Construct WebSocket URL for activity
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
      const wsHost = new URL(apiBaseUrl).host;
      const wsUrl = `${protocol}//${wsHost}/ws/activity/?token=${encodeURIComponent(token)}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('⚡🔌 Connected to activity WebSocket');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log('⚡🔌 Disconnected from activity WebSocket', event.code, event.reason);
          this.isConnecting = false;
          this.callbacks.onDisconnect?.();
          
          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('⚡🔌 Activity WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('Activity WebSocket connection failed'));
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
    console.log('⚡🔌 ActivityWebSocketService disconnect called');
    if (this.socket) {
      console.log(`⚡🔌 Closing WebSocket connection (readyState: ${this.socket.readyState})`);
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Send cart update notification to trigger cart count refresh
   */
  sendCartUpdateNotification(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⚡⚠️ Cannot send cart update notification: WebSocket not connected');
      return false;
    }

    console.log('🛒📤 Sending cart update notification');
    return this.sendMessage({
      type: 'get_cart_count'
    });
  }

  /**
   * Send unread messages request to trigger unread count refresh
   */
  sendUnreadMessagesRequest(): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⚡⚠️ Cannot send unread messages request: WebSocket not connected');
      return false;
    }

    console.log('💬📤 Sending unread messages count request');
    return this.sendMessage({
      type: 'get_unread_count'
    });
  }

  /**
   * Track product activity
   */
  trackActivity(productId: number, action: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⚡⚠️ Cannot track activity: WebSocket not connected');
      return false;
    }

    console.log(`📊📤 Tracking activity: ${action} for product ${productId}`);
    return this.sendMessage({
      type: 'track_activity',
      product_id: productId,
      action: action
    });
  }

  /**
   * Send a message to the WebSocket
   */
  private sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        console.log('⚡📤 Sent message to activity WebSocket:', message);
        return true;
      } catch (error) {
        console.error('⚡❌ Failed to send message to activity WebSocket:', error);
        return false;
      }
    } else {
      console.warn('⚡⚠️ Cannot send message: WebSocket not connected');
      return false;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: ActivityWebSocketMessage = JSON.parse(data);
      console.log('⚡📥 Activity WebSocket message:', message);

      switch (message.type) {
        case 'connection_success':
          console.log(`✅ ActivityWebSocketService connection successful for user ${message.user_id}`);
          if (message.cart_count !== undefined) {
            this.callbacks.onCartUpdate?.(message.cart_count);
          }
          if (message.unread_messages_count !== undefined) {
            this.callbacks.onUnreadMessagesUpdate?.(message.unread_messages_count);
          }
          break;

        case 'cart_updated':
          console.log('🛒📥 Cart updated notification:', message);
          if (message.cart_count !== undefined) {
            this.callbacks.onCartUpdate?.(message.cart_count);
          }
          break;

        case 'cart_count_update':
          console.log('🛒📥 Cart count update:', message);
          if (message.cart_count !== undefined) {
            this.callbacks.onCartUpdate?.(message.cart_count);
          }
          break;

        case 'unread_messages_count_update':
          console.log('💬📥 Unread messages count update:', message);
          if (message.unread_messages_count !== undefined) {
            this.callbacks.onUnreadMessagesUpdate?.(message.unread_messages_count);
          }
          break;

        case 'activity_notification':
          console.log('📥 Activity notification:', message);
          this.callbacks.onActivityNotification?.(message);
          break;

        case 'error':
          console.error('⚡❌ Activity WebSocket error:', message.error);
          this.callbacks.onError?.(message.error || 'Unknown WebSocket error');
          break;

        default:
          console.warn('⚡❓ Unknown activity WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('⚡❌ Error parsing activity WebSocket message:', error);
      console.error('⚡❌ Raw data that failed to parse:', data);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('⚡❌ Max reconnect attempts reached for activity WebSocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`⚡🔄 Attempting to reconnect activity WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(this.callbacks).catch((error) => {
        console.error('⚡❌ Activity WebSocket reconnect attempt failed:', error);
      });
    }, delay);
  }
}

// Export singleton instance
export const activityWebSocketService = ActivityWebSocketService.getInstance();
export default activityWebSocketService;