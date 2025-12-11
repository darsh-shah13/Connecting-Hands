export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  apiKey?: string;
}

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}
