import { ApiClient } from '../client';

export interface HandPoint {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface DetectionRequest {
  imageData: string;
  model?: string;
}

export interface DetectionResponse {
  success: boolean;
  landmarks: HandPoint[];
  confidence: number;
  message: string;
}

export function createHandDetectionApi(client: ApiClient) {
  return {
    detect: async (request: DetectionRequest): Promise<DetectionResponse> => {
      return client.post<DetectionResponse>('/detect', {
        image_data: request.imageData,
        model: request.model,
      });
    },

    listModels: async (): Promise<{ models: string[] }> => {
      return client.get<{ models: string[] }>('/models');
    },
  };
}
