import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Config } from '@/constants/Config';
import { Storage } from '@/utils/storage';
import { ApiErrorResponse, ApiStandardError } from '@/types/api.types';

export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let unauthorizedHandler: (() => void) | null = null;
let networkErrorHandler: ((isOffline: boolean) => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const setNetworkErrorHandler = (handler: (isOffline: boolean) => void) => {
  networkErrorHandler = handler;
};

// Request Interceptor: Attach JWT Bearer token & Timezone offset
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await Storage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Timezone offset in minutes (e.g., -360 for UTC+6 Dhaka)
      if (config.headers) {
        config.headers['x-timezone-offset'] = new Date().getTimezoneOffset().toString();
      }
    } catch (err) {
      console.warn('[apiClient] Request interceptor error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize API errors and handle 401 & network disconnects
apiClient.interceptors.response.use(
  (response) => {
    if (networkErrorHandler) {
      networkErrorHandler(false);
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const errorData = error.response?.data?.error;

    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      if (networkErrorHandler) {
        networkErrorHandler(true);
      }
    }

    if (status === 401) {
      console.warn('[apiClient] 401 Unauthorized encountered. Purging token...');
      await Storage.clearAuth();
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    // Standardize error structure
    const normalizedError: ApiStandardError = {
      code: errorData?.code || (error.code ?? 'UNKNOWN_ERROR'),
      message: errorData?.message || error.message || 'An unexpected error occurred.',
      field: errorData?.field ?? null,
      timestamp: errorData?.timestamp || new Date().toISOString(),
      path: errorData?.path || error.config?.url,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
