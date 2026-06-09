import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse, ApiResponse } from '~/types/httpService';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _isRetry?: boolean;
    _skipAuthRedirect?: boolean;
  }
}

class HttpService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 10000,
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;

        // Don't retry on 429 (rate limit)
        if (error.response?.status === 429) {
          return Promise.reject(error);
        }

        // Handle 401: try refresh token once, then redirect (unless skipped)
        if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
          // Skip redirect for auth check endpoints to avoid loops
          if (originalRequest.url?.includes('/auth/me') || originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
          }

          originalRequest._isRetry = true;
          try {
            await this.api.post('/auth/refresh');
            return this.api(originalRequest);
          } catch {
            // Only redirect if not already on an auth page
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private extractData<T>(responsePayload: ApiResponse<T>): T {
    return responsePayload.data as T;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return this.extractData(response.data);
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return this.extractData(response.data);
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return this.extractData(response.data);
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config);
    return this.extractData(response.data);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return this.extractData(response.data);
  }

  public async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const httpService = new HttpService();
