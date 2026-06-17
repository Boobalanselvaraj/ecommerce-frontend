/**
 * Centralized API Client
 * Built using standard window.fetch.
 * Automatically loads the base URL from Vite's environment variables (VITE_BASE_URL).
 */

const DEFAULT_BASE_URL = 'https://ecommerce-backend-nmet.onrender.com/api';

// Retrieve Vite env variable or use fallback
const BASE_URL = (import.meta.env.VITE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

// Dynamic token storage in memory (can be loaded from localStorage/sessionStorage as needed)
let authToken: string | null = localStorage.getItem('auth_token');

export interface ApiErrorOptions {
  status: number;
  statusText: string;
  data?: any;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
  }
}

/**
 * Configure global auth token. Pass null to clear.
 */
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Get the current auth token
 */
export const getAuthToken = (): string | null => {
  return authToken;
};

/**
 * Helper to build headers with authentication
 */
const buildHeaders = (customHeaders?: HeadersInit, isFormData = false): Headers => {
  const headers = new Headers(customHeaders);

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Inject Bearer token if present
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return headers;
};

/**
 * Central HTTP Request Handler
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${normalizedPath}`;

  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    credentials: 'include', // send cookies for JWT cookie-based auth
    headers: buildHeaders(options.headers, isFormData),
  };

  try {
    const response = await fetch(url, config);

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        responseData?.message || `HTTP error! Status: ${response.status}`,
        {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        }
      );
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error or request aborted',
      {
        status: 0,
        statusText: 'Network Error',
        data: error,
      }
    );
  }
}

/**
 * Centralized API client exposing standard HTTP methods
 */
export const api = {
  get: <T>(path: string, options?: Omit<RequestInit, 'method'>): Promise<T> => {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post: <T>(
    path: string,
    body?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  },

  put: <T>(
    path: string,
    body?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  },

  patch: <T>(
    path: string,
    body?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  },

  delete: <T>(path: string, options?: Omit<RequestInit, 'method'>): Promise<T> => {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};
