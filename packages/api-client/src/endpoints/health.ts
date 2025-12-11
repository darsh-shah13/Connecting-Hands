import { ApiClient } from '../client';

export interface HealthResponse {
  status: string;
  version: string;
}

export function createHealthApi(client: ApiClient) {
  return {
    check: async (): Promise<HealthResponse> => {
      return client.get<HealthResponse>('/health');
    },
  };
}
