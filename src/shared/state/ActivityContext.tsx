import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth/state/AuthContext';
import { ActivityWebSocketService } from '../../services/ActivityWebSocketService';
import { CartService } from '@/features/marketplace/api/cartService';

interface ActivityNotification {
  id: string;
  type: 'cart' | 'product' | 'order' | 'general';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface ActivityContextType {
  // Connection state
  isConnected: boolean;
  
  // Cart state
  cartCount: number;
  
  // Messages state
  unreadMessagesCount: number;
  
  // Notifications
  notifications: ActivityNotification[];
  unreadCount: number;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  trackActivity: (productId: number, action: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  recountCartItems: () => void;
  requestUnreadMessagesCount: () => void;
  
  // WebSocket status
  getWebSocketStatus: () => {
    activityWebSocket: boolean;
  };
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

interface ActivityWebSocketMessage {
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
}

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  
  // Get singleton instance of ActivityWebSocketService
  const activityService = ActivityWebSocketService.getInstance();

  const unreadCount = notifications.filter(n => !n.read).length;

  const generateNotificationId = () => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const connect = useCallback(async (): Promise<void> => {
    console.log('🔌 ActivityContext connecting via ActivityWebSocketService...');
    
    try {
      await activityService.connect({
        onConnect: () => {
          console.log('✅ ActivityContext connected via ActivityWebSocketService');
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log('🔌 ActivityContext disconnected from ActivityWebSocketService');
          setIsConnected(false);
        },
        onCartUpdate: (newCartCount) => {
          console.log('🛒 ActivityContext received cart update:', newCartCount);
          setCartCount(newCartCount);
        },
        onUnreadMessagesUpdate: (newUnreadCount) => {
          console.log('💬 ActivityContext received unread messages update:', newUnreadCount);
          setUnreadMessagesCount(newUnreadCount);
        },
        onActivityNotification: (notification) => {
          console.log('📥 ActivityContext received activity notification:', notification);
          handleActivityNotification(notification);
        },
        onError: (error) => {
          console.error('❌ ActivityContext received error:', error);
        }
      });
    } catch (error) {
      console.error('❌ ActivityContext failed to connect via ActivityWebSocketService:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 ActivityContext disconnecting via ActivityWebSocketService');
    activityService.disconnect();
    setIsConnected(false);
  }, []);

  const handleActivityNotification = (notification: any) => {
    // Convert service notification to ActivityNotification format
    const activityNotification: ActivityNotification = {
      id: generateNotificationId(),
      type: notification.notification_type || 'general',
      title: notification.title || 'Activity Notification',
      message: notification.message || 'New activity',
      data: notification.data || {},
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [activityNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  // trackActivity now uses ActivityWebSocketService
  const trackActivity = (productId: number, action: string) => {
    console.log(`📊 ActivityContext tracking activity: ${action} for product ${productId}`);
    activityService.trackActivity(productId, action);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const recountCartItems = useCallback(() => {
    console.log('🛒🔄 ActivityContext requesting cart recount via WebSocket');
    if (activityService.isConnected()) {
      activityService.sendCartUpdateNotification();
    } else {
      console.warn('⚠️ Cannot recount cart items: WebSocket not connected');
    }
  }, []);

  const requestUnreadMessagesCount = useCallback(() => {
    console.log('💬🔄 ActivityContext requesting unread messages count via WebSocket');
    if (activityService.isConnected()) {
      activityService.sendUnreadMessagesRequest();
    } else {
      console.warn('⚠️ Cannot get unread messages count: WebSocket not connected');
    }
  }, []);

  const getWebSocketStatus = () => {
    return {
      activityWebSocket: activityService.isConnected()
    };
  };

  // Initialize connection when user is available
  useEffect(() => {
    console.log('🔄 ActivityContext useEffect running - user:', !!user, 'userId:', user?.id);
    
    // Skip if no user to prevent unnecessary initialization
    if (!user) {
      return;
    }
    
    const initializeActivity = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ No authentication token - skipping activity initialization');
        return;
      }

      console.log('🚀 ActivityContext initializing for user:', user.id);

      // Prevent multiple connections - check if already connected
      if (activityService.isConnected()) {
        console.log('🟢 ActivityContext - service already connected, skipping initialization');
        setIsConnected(true);
        return;
      }

      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect to activity WebSocket:', error);
      }
    };

    initializeActivity();

    // Cleanup on unmount - only disconnect if we have a user
    return () => {
      if (user) {
        console.log('🧹 ActivityContext cleanup - user:', user.id);
        // Note: Don't disconnect here as it might affect other ActivityProvider instances
        // The singleton service handles connection management properly
      }
    };
  }, [user]);

  // Separate effect to handle CartService callback setup
  useEffect(() => {
    if (user) {
      console.log('🛒 Setting CartService callback for user:', user.id);
      const cartService = CartService.getInstance();
      cartService.setRecountCallback(recountCartItems);

      return () => {
        console.log('🛒 Clearing CartService callback for user:', user.id);
        cartService.setRecountCallback(null);
      };
    }
  }, [recountCartItems, user]);

  // Request current cart count when connected - handled by ActivityWebSocketService

  const value: ActivityContextType = {
    isConnected,
    cartCount,
    unreadMessagesCount,
    notifications,
    unreadCount,
    connect,
    disconnect,
    trackActivity,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    recountCartItems,
    requestUnreadMessagesCount,
    getWebSocketStatus
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};