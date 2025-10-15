export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.3.2:8001';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  LOGIN_VERIFY_2FA: `${API_BASE_URL}/api/auth/login/verify-2fa/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/token/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email/`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification/`,
  CHECK_EMAIL_RATE_LIMIT: `${API_BASE_URL}/api/auth/check-rate-limit/`,
  RESEND_2FA_CODE: `${API_BASE_URL}/api/auth/resend-2fa-code/`,
  GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google/login/`,
  GOOGLE_REGISTER: `${API_BASE_URL}/api/auth/google/register/`,
  GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google-oauth/`,
  USER_PROFILE: `${API_BASE_URL}/api/auth/profile/`,
  CHANGE_LANGUAGE: `${API_BASE_URL}/api/auth/change-language/`,
  TWO_FACTOR_TOGGLE: `${API_BASE_URL}/api/auth/2fa/toggle/`,
  TWO_FACTOR_VERIFY: `${API_BASE_URL}/api/auth/2fa/verify/`,
  TWO_FACTOR_STATUS: `${API_BASE_URL}/api/auth/2fa/status/`,
  PASSWORD_SETUP_REQUEST: `${API_BASE_URL}/api/auth/password/request/`,
  PASSWORD_SETUP_SET: `${API_BASE_URL}/api/auth/password/set/`,
  PASSWORD_RESET_REQUEST: `${API_BASE_URL}/api/auth/password/reset/request/`,
  PASSWORD_RESET: `${API_BASE_URL}/api/auth/password/reset/`,
  TODOS: `${API_BASE_URL}/api/todos/`,
  CATEGORIES: `${API_BASE_URL}/api/marketplace/categories/`,
  CATEGORY_DETAIL: (slug: string) => `${API_BASE_URL}/api/marketplace/categories/${slug}/`,
  CATEGORY_PRODUCTS: (slug: string) => `${API_BASE_URL}/api/marketplace/categories/${slug}/products/`,
  PRODUCTS: `${API_BASE_URL}/api/marketplace/products/`,
  PRODUCT_DETAIL: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/`,
  PRODUCT_FAVORITE: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/favorite/`,
  PRODUCT_CLICK: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/click/`,
  PRODUCT_REVIEWS: (slug: string) => `${API_BASE_URL}/api/marketplace/reviews/?product_slug=${slug}`,
  PRODUCT_ADD_REVIEW: `${API_BASE_URL}/api/marketplace/reviews/`,
  PRODUCT_REVIEW_DETAIL: (reviewId: number) => `${API_BASE_URL}/api/marketplace/reviews/${reviewId}/`,
  MY_PRODUCTS: `${API_BASE_URL}/api/marketplace/products/my_products/`,
  FAVORITES: `${API_BASE_URL}/api/marketplace/products/favorites/`,
  PRODUCT_IMAGES: (slug: string) => `${API_BASE_URL}/api/marketplace/products/${slug}/images/`,
  PRODUCT_IMAGE_DETAIL: (slug: string, id: number) => `${API_BASE_URL}/api/marketplace/products/${slug}/images/${id}/`,
  CART: `${API_BASE_URL}/api/marketplace/cart/`,
  CART_ADD_ITEM: `${API_BASE_URL}/api/marketplace/cart/add_item/`,
  CART_UPDATE_ITEM: `${API_BASE_URL}/api/marketplace/cart/update_item/`,
  CART_REMOVE_ITEM: `${API_BASE_URL}/api/marketplace/cart/remove_item/`,
  CART_CLEAR: `${API_BASE_URL}/api/marketplace/cart/clear/`,
  CART_UPDATE_ITEM_STATUS: `${API_BASE_URL}/api/marketplace/cart/update_item_status/`,
  CART_VALIDATE_STOCK: `${API_BASE_URL}/api/marketplace/cart/validate_stock/`,
  ORDERS: `${API_BASE_URL}/api/marketplace/orders/`,
  ORDER_DETAIL: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/update_status/`,
  UPDATE_ORDER_STATUS_VALIDATED: (id: string) => `${API_BASE_URL}/api/marketplace/orders/${id}/update_order_status/`,
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
  STRIPE_ACCOUNT: `${API_BASE_URL}/api/payments/stripe/account/`,
  STRIPE_CREATE_SESSION: `${API_BASE_URL}/api/payments/stripe/create-session/`,
  STRIPE_VALIDATE_ELIGIBILITY: `${API_BASE_URL}/api/payments/stripe/validate-eligibility/`,
  STRIPE_ACCOUNT_STATUS_CONNECT: `${API_BASE_URL}/api/payments/stripe/account-status/`,
  STRIPE_PAYMENT_HOLDS: `${API_BASE_URL}/api/payments/stripe/holds/`,
  STRIPE_TRANSFER_PAYMENT: `${API_BASE_URL}/api/payments/transfer/`,
  SELLER_PAYOUT: `${API_BASE_URL}/api/payments/payout/`,
  GET_PAYOUT: (payoutId: string) => `${API_BASE_URL}/api/payments/payout/${payoutId}/`,
  LIST_PAYOUTS: `${API_BASE_URL}/api/payments/payouts/`,
  PAYOUT_DETAIL: (payoutId: string) => `${API_BASE_URL}/api/payments/payouts/${payoutId}/`,
  PAYOUT_ORDERS: (payoutId: string) => `${API_BASE_URL}/api/payments/payouts/${payoutId}/orders/`,
  ELIGIBLE_TRANSFERS: `${API_BASE_URL}/api/payments/eligible-transfers/`,
  ADMIN_PAYOUTS: `${API_BASE_URL}/api/payments/admin/payouts/`,
  ADMIN_TRANSACTIONS: `${API_BASE_URL}/api/payments/admin/transactions/`,
  METRICS: `${API_BASE_URL}/api/marketplace/metrics/`,
  SELLER_PROFILE: (sellerId: number) => `${API_BASE_URL}/api/marketplace/sellers/${sellerId}/`,
  SELLER_APPLICATION_APPLY: `${API_BASE_URL}/api/auth/seller/apply/`,
  SELLER_APPLICATION_STATUS: `${API_BASE_URL}/api/auth/seller/application/status/`,
  USER_ROLE_INFO: `${API_BASE_URL}/api/auth/user/role/`,
  ADMIN_SELLER_APPLICATIONS: `${API_BASE_URL}/api/auth/admin/seller/applications/`,
  ADMIN_APPROVE_SELLER: (applicationId: number) => `${API_BASE_URL}/api/auth/admin/seller/approve/${applicationId}/`,
  ADMIN_REJECT_SELLER: (applicationId: number) => `${API_BASE_URL}/api/auth/admin/seller/reject/${applicationId}/`,
  CHAT: `${API_BASE_URL}/api/chat/`,
  CHAT_DETAIL: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/`,
  CHAT_CREATE: `${API_BASE_URL}/api/chat/`,
  CHAT_MESSAGES: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/`,
  CHAT_SEND_MESSAGE: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/`,
  CHAT_MARK_READ: (chatId: number) => `${API_BASE_URL}/api/chat/${chatId}/messages/mark-read/`,
  CHAT_UPLOAD_IMAGE: `${API_BASE_URL}/api/chat/upload-image/`,
  CHAT_SEARCH_USERS: `${API_BASE_URL}/api/chat/search-users/`,
} as const;

type JsonRecord = Record<string, unknown>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJsonSafely = async (response: Response): Promise<JsonRecord | null> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }

  const data = await response.json();
  return data as T;
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};

const shouldRetry = (error: unknown) => error instanceof TypeError;

export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = localStorage.getItem('access_token');
      const isFormData = options.body instanceof FormData;

      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      };

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
          throw new Error('Authentication failed');
        }

        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            Authorization: `Bearer ${refreshedToken}`,
          },
        });

        if (!retryResponse.ok) {
          const errorData = await parseJsonSafely(retryResponse);
          const message = typeof errorData?.message === 'string' ? errorData.message : undefined;
          throw new Error(message ?? `HTTP error! status: ${retryResponse.status}`);
        }

        return parseResponse<T>(retryResponse);
      }

      if (!response.ok) {
        const errorData = await parseJsonSafely(response);
        const message = typeof errorData?.message === 'string' ? errorData.message : undefined;
        throw new Error(message ?? `HTTP error! status: ${response.status}`);
      }

      return parseResponse<T>(response);
    } catch (error) {
      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error instanceof Error ? error : new Error('Request failed');
      }

      const delayMs = Math.min(1000 * 2 ** attempt, 5000);
      await delay(delayMs);
    }
  }

  throw new Error('Max retries exceeded');
};

export default API_ENDPOINTS;
