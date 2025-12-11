import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiClientConfig, ApiError } from './types';

export type { ApiClientConfig };

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    if (config.apiKey) {
      this.client.defaults.headers.common['Authorization'] =
        `Bearer ${config.apiKey}`;
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          status: error.response?.status || 0,
          message: error.message,
          data: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }

  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, { params });
    return response.data;
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, { params });
    return response.data;
  }

  async delete<T = unknown>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.client.delete<T>(url, { params });
    return response.data;
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
