import type { ApiEndpointKey } from './endpoints';
import { API_ENDPOINTS } from './endpoints';

export class HttpError extends Error {
  status: number;
  data?: JsonRecord | null;

  constructor(status: number, message: string, data?: JsonRecord | null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

type JsonRecord = Record<string, unknown>;

type RequestConfig = RequestInit & { retryCount?: number };

const DEFAULT_MAX_RETRIES = 3;

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

const resolveUrl = (endpoint: string | ((...args: any[]) => string), ...params: any[]) =>
  typeof endpoint === 'function' ? endpoint(...params) : endpoint;

export const apiRequest = async <T = unknown>(
  urlOrEndpoint: string | ApiEndpointKey,
  options: RequestConfig = {},
  ...endpointParams: any[]
): Promise<T> => {
  const endpoint =
    typeof urlOrEndpoint === 'string' && urlOrEndpoint in API_ENDPOINTS
      ? (API_ENDPOINTS[urlOrEndpoint as ApiEndpointKey] as string | ((...args: any[]) => string))
      : urlOrEndpoint;

  const url =
    typeof endpoint === 'string' && urlOrEndpoint in API_ENDPOINTS
      ? endpoint
      : resolveUrl(endpoint as string | ((...args: any[]) => string), ...endpointParams);

  const maxRetries = options.retryCount ?? DEFAULT_MAX_RETRIES;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = localStorage.getItem('access_token');
      const isFormData = options.body instanceof FormData;

      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      };

      const response = await fetch(
        typeof url === 'string' ? url : resolveUrl(url as any, ...endpointParams),
        {
          ...options,
          headers,
        },
      );

      if (response.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
          throw new HttpError(401, 'Authentication failed');
        }

        const retryResponse = await fetch(
          typeof url === 'string' ? url : resolveUrl(url as any, ...endpointParams),
          {
            ...options,
            headers: {
              ...(options.headers ?? {}),
              ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
              Authorization: `Bearer ${refreshedToken}`,
            },
          },
        );

        if (!retryResponse.ok) {
          const errorData = await parseJsonSafely(retryResponse);
          const message = typeof errorData?.message === 'string' ? errorData.message : undefined;
          throw new HttpError(
            retryResponse.status,
            message ?? `HTTP error! status: ${retryResponse.status}`,
            errorData,
          );
        }

        return parseResponse<T>(retryResponse);
      }

      if (!response.ok) {
        const errorData = await parseJsonSafely(response);
        const message = typeof errorData?.message === 'string' ? errorData.message : undefined;
        throw new HttpError(response.status, message ?? `HTTP error! status: ${response.status}`, errorData);
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

export type { RequestConfig };
