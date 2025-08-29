// Cart integration utilities for Activity WebSocket
import { ActivityConsumer } from '../../../Designia-backend/activity/consumer';

export const notifyCartUpdate = async (
  userId: number,
  action: 'add' | 'remove' | 'update' | 'clear',
  productId?: number,
  cartCount?: number,
  message?: string
) => {
  try {
    await ActivityConsumer.notify_cart_update(
      userId,
      action,
      productId,
      cartCount,
      message || `Cart ${action}ed`
    );
  } catch (error) {
    console.error('Failed to notify cart update:', error);
  }
};

export const trackProductActivity = (
  activityContext: any,
  productId: number,
  action: string
) => {
  if (activityContext && activityContext.trackActivity) {
    activityContext.trackActivity(productId, action);
  }
};