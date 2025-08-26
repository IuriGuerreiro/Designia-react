// Always use the backend server URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.3.2:8001';

console.log('=== API BASE URL DEBUG ===');
console.log('VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Authentication endpoints (matching Django authentication/urls.py)
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  LOGIN_VERIFY_2FA: `${API_BASE_URL}/api/auth/login/verify-2fa/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/token/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email/`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification/`,
  CHECK_EMAIL_RATE_LIMIT: `${API_BASE_URL}/api/auth/check-rate-limit/`,
  RESEND_2FA_CODE: `${API_BASE_URL}/api/auth/resend-2fa-code/`,
  
  // Google OAuth endpoints (YummiAI style)
  GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google/login/`,
  GOOGLE_REGISTER: `${API_BASE_URL}/api/auth/google/register/`,
  GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google-oauth/`, // Legacy endpoint
  
  // User endpoints  
  USER_PROFILE: `${API_BASE_URL}/api/auth/profile/`,
  CHANGE_LANGUAGE: `${API_BASE_URL}/api/auth/change-language/`,
  
  // 2FA endpoints
  TWO_FACTOR_TOGGLE: `${API_BASE_URL}/api/auth/2fa/toggle/`,
  TWO_FACTOR_VERIFY: `${API_BASE_URL}/api/auth/2fa/verify/`,
  TWO_FACTOR_STATUS: `${API_BASE_URL}/api/auth/2fa/status/`,
  
  // Password setup endpoints (OAuth users only)
  PASSWORD_SETUP_REQUEST: `${API_BASE_URL}/api/auth/password/request/`,
  PASSWORD_SETUP_SET: `${API_BASE_URL}/api/auth/password/set/`,
  
  // Password reset endpoints (all users)
  PASSWORD_RESET_REQUEST: `${API_BASE_URL}/api/auth/password/reset/request/`,
  PASSWORD_RESET: `${API_BASE_URL}/api/auth/password/reset/`,
  
  // Todo endpoints (future)
  TODOS: `${API_BASE_URL}/api/todos/`,

  // Marketplace endpoints
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/marketplace/categories/`,
  CATEGORY_DETAIL: (slug: string) => `${API_BASE_URL}/api/marketplace/categories/${slug}/`,
  CATEGORY_PRODUCTS: (slug: string) => `${API_BASE_URL}/api/marketplace/categories/${slug}/products/`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/marketplace/products/`,
  PRODUCT_DETAIL: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/`,
  PRODUCT_FAVORITE: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/favorite/`,
  PRODUCT_CLICK: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/click/`,
  PRODUCT_REVIEWS: (slug: string) => `${API_BASE_URL}/api/marketplace/reviews/?product_slug=${slug}`,
  PRODUCT_ADD_REVIEW: (slug: string) => `${API_BASE_URL}/api/marketplace/reviews/`,
  PRODUCT_REVIEW_DETAIL: (slug: string, reviewId: number) => `${API_BASE_URL}/api/marketplace/reviews/${reviewId}/`,
  MY_PRODUCTS: `${API_BASE_URL}/api/marketplace/products/my_products/`,
  FAVORITES: `${API_BASE_URL}/api/marketplace/products/favorites/`,

  // Product Images
  PRODUCT_IMAGES: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/images/`,
  PRODUCT_IMAGE_DETAIL: (slug: string, id: number) => 
    `${API_BASE_URL}/api/marketplace/products/${slug}/images/${id}/`,

  // Cart
  CART: `${API_BASE_URL}/api/marketplace/cart/`,
  CART_ADD_ITEM: `${API_BASE_URL}/api/marketplace/cart/add_item/`,
  CART_UPDATE_ITEM: `${API_BASE_URL}/api/marketplace/cart/update_item/`,
  CART_REMOVE_ITEM: `${API_BASE_URL}/api/marketplace/cart/remove_item/`,
  CART_CLEAR: `${API_BASE_URL}/api/marketplace/cart/clear/`,
  CART_UPDATE_ITEM_STATUS: `${API_BASE_URL}/api/marketplace/cart/update_item_status/`,
  CART_VALIDATE_STOCK: `${API_BASE_URL}/api/marketplace/cart/validate_stock/`,

  // Orders
  ORDERS: `${API_BASE_URL}/api/marketplace/orders/`,
  ORDER_DETAIL: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/update_status/`,
  UPDATE_ORDER_STATUS_VALIDATED: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/update_order_status/`,

  // Payment System
  CREATE_CHECKOUT_SESSION: `${API_BASE_URL}/api/payments/checkout_session/`,
  CREATE_RETRY_CHECKOUT_SESSION: (orderId: string) => `${API_BASE_URL}/api/payments/checkout_session/retry/${orderId}/`,
  CHECKOUT_SESSION_STATUS: `${API_BASE_URL}/api/payments/session_status/`,
  CREATE_ORDER_FROM_INTENT: `${API_BASE_URL}/api/payments/create-order-from-intent/`,
  PROCESS_ORDER_PAYMENT: `${API_BASE_URL}/api/payments/process-order/`,
  PAYMENT_STATUS: (paymentId: string) => `${API_BASE_URL}/api/payments/status/${paymentId}/`,
  CREATE_STRIPE_ACCOUNT: `${API_BASE_URL}/api/payments/stripe-account/create/`,
  STRIPE_ACCOUNT_STATUS: `${API_BASE_URL}/api/payments/stripe-account/status/`,
  SELLER_PAYOUTS: `${API_BASE_URL}/api/payments/seller-payouts/`,
  REQUEST_REFUND: `${API_BASE_URL}/api/payments/refund/request/`,
  
  // Stripe Connect (Seller Onboarding)
  STRIPE_ACCOUNT: `${API_BASE_URL}/api/payments/stripe/account/`,
  STRIPE_CREATE_SESSION: `${API_BASE_URL}/api/payments/stripe/create-session/`,
  STRIPE_VALIDATE_ELIGIBILITY: `${API_BASE_URL}/api/payments/stripe/validate-eligibility/`,
  STRIPE_ACCOUNT_STATUS_CONNECT: `${API_BASE_URL}/api/payments/stripe/account-status/`,
  STRIPE_PAYMENT_HOLDS: `${API_BASE_URL}/api/payments/stripe/holds/`,
  STRIPE_TRANSFER_PAYMENT: `${API_BASE_URL}/api/payments/transfer/`,
  
  // Payout endpoints
  SELLER_PAYOUT: `${API_BASE_URL}/api/payments/payout/`,
  GET_PAYOUT: (payoutId: string) => `${API_BASE_URL}/api/payments/payout/${payoutId}/`,
  LIST_PAYOUTS: `${API_BASE_URL}/api/payments/payouts/`,
  PAYOUT_DETAIL: (payoutId: string) => `${API_BASE_URL}/api/payments/payouts/${payoutId}/`,
  PAYOUT_ORDERS: (payoutId: string) => `${API_BASE_URL}/api/payments/payouts/${payoutId}/orders/`,
  ELIGIBLE_TRANSFERS: `${API_BASE_URL}/api/payments/eligible-transfers/`,

  // Metrics
  METRICS: `${API_BASE_URL}/api/marketplace/metrics/`,

  // Seller endpoints
  SELLER_PROFILE: (sellerId: number) => `${API_BASE_URL}/api/auth/seller/${sellerId}/`,

  // Chat endpoints
  CHAT: `${API_BASE_URL}/api/chat/`,
  CHAT_DETAIL: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/`,
  CHAT_CREATE: `${API_BASE_URL}/api/chat/`,
  CHAT_MESSAGES: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/`,
  CHAT_SEND_MESSAGE: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/`,
  CHAT_MARK_READ: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/mark-read/`,
  CHAT_UPLOAD_IMAGE: `${API_BASE_URL}/api/chat/upload-image/`,
  CHAT_SEARCH_USERS: `${API_BASE_URL}/api/chat/search-users/`,
};

// API utility functions
export const apiRequest = async (
  url: string, 
  options: RequestInit = {},
  maxRetries: number = 5
): Promise<any> => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    console.log(`=== API REQUEST START (Attempt ${attempt}/${maxRetries}) ===`);
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    
    const token = localStorage.getItem('access_token');
    console.log('Has token:', !!token);
    
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const isFormData = options.body instanceof FormData;
    console.log('Is FormData:', isFormData);
    
    const defaultHeaders: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      // Only set Content-Type if it's not FormData
      ...(!isFormData && { 'Content-Type': 'application/json' }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('Request config:', {
      method: config.method || 'GET',
      headers: config.headers,
      hasBody: !!config.body
    });

    try {
      const response = await fetch(url, config);
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('access_token', data.access);
            
            // Retry original request with new token
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${data.access}`,
            };
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            return retryResponse.json();
          } else {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject('Authentication failed');
          }
        }
      }
      
      if (!response.ok) {
        console.log('Response not OK, parsing error...');
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log('Parsing response JSON...');
      const data = await response.json();
      console.log('Parsed data:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'Not an object',
        isArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'Not an array'
      });
      console.log('=== API REQUEST SUCCESS ===');
      return data;
    } catch (error) {
      console.error(`=== API REQUEST FAILED (Attempt ${attempt}/${maxRetries}) ===`);
      console.error('API request failed:', error);
      
      // Check if we should retry
      const shouldRetry = attempt < maxRetries && 
        (error instanceof TypeError || // Network errors
         (error instanceof Error && error.message.includes('fetch')));
      
      if (shouldRetry) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Continue to next iteration of while loop
      } else {
        // Final attempt failed or non-retryable error
        throw error;
      }
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('Max retries exceeded');
};

export default API_ENDPOINTS;