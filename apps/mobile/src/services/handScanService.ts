import { apiClient } from './apiClient';
import type { CapturedFrame } from '@/store/handScanStore';

export interface HandScanRequest {
  frames: CapturedFrame[];
  deviceMetadata: {
    cameraType: 'front' | 'back';
    zoom: number;
    flashMode: 'off' | 'on' | 'auto';
  };
  timestamp: number;
}

export interface HandScanResponse {
  success: boolean;
  scanId: string;
  landmarks?: Array<{
    x: number;
    y: number;
    z: number;
    confidence: number;
  }>;
  message: string;
}

export const handScanService = {
  async uploadHandScan(
    request: HandScanRequest,
    onUploadProgress?: (progress: number) => void
  ): Promise<HandScanResponse> {
    const formData = new FormData();

    // Add frames as files
    request.frames.forEach((frame, index) => {
      const filename = `frame_${index}_${frame.timestamp}.jpg`;
      formData.append(`frames`, {
        uri: frame.uri,
        name: filename,
        type: 'image/jpeg',
      } as any);
    });

    // Add metadata
    formData.append('metadata', JSON.stringify(request.deviceMetadata));
    formData.append('timestamp', request.timestamp.toString());

    const response = await apiClient.post<HandScanResponse>(
      '/hands/scan',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const progress =
              (progressEvent.loaded / progressEvent.total) * 100;
            onUploadProgress(Math.min(progress, 100));
          }
        },
      }
    );

    return response.data;
  },

  async detectLandmarks(
    frameUri: string
  ): Promise<
    Array<{
      x: number;
      y: number;
      z: number;
      confidence: number;
    }>
  > {
    const formData = new FormData();
    formData.append('frame', {
      uri: frameUri,
      name: 'frame.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await apiClient.post<{
      landmarks: Array<{
        x: number;
        y: number;
        z: number;
        confidence: number;
      }>;
    }>('/hands/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.landmarks;
  },
};
