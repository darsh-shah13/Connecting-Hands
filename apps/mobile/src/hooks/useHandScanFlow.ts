import { useCallback } from 'react';
import {
  useHandScanStore,
  type ScanState,
  type CapturedFrame,
} from '@/store/handScanStore';
import { handScanService } from '@/services/handScanService';

export const useHandScanFlow = () => {
  const store = useHandScanStore();

  const setState = useCallback(
    (state: ScanState) => {
      store.setState(state);
    },
    [store]
  );

  const addCapturedFrame = useCallback(
    (frame: CapturedFrame) => {
      store.addFrame(frame);
    },
    [store]
  );

  const submitScan = useCallback(async () => {
    try {
      store.setState('uploading');
      store.setError(null);

      const frames = store.capturedFrames;
      if (frames.length === 0) {
        throw new Error('No frames captured');
      }

      const request = {
        frames,
        deviceMetadata: store.deviceMetadata,
        timestamp: Date.now(),
      };

      const response = await handScanService.uploadHandScan(
        request,
        (progress) => {
          store.setUploadProgress(progress);
        }
      );

      if (response.success) {
        store.setState('success');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      store.setError(errorMessage);
      store.setState('error');
    }
  }, [store]);

  const retakeScan = useCallback(() => {
    store.clearFrames();
    store.setState('guide');
  }, [store]);

  const cancelScan = useCallback(() => {
    store.reset();
  }, [store]);

  const detectLandmarks = useCallback(
    async (frameUri: string) => {
      try {
        const landmarks = await handScanService.detectLandmarks(frameUri);
        store.setLandmarks(landmarks);
        return landmarks;
      } catch (error) {
        console.error('Failed to detect landmarks:', error);
        return [];
      }
    },
    [store]
  );

  return {
    // State
    state: store.state,
    capturedFrames: store.capturedFrames,
    landmarks: store.landmarks,
    error: store.error,
    uploadProgress: store.uploadProgress,
    deviceMetadata: store.deviceMetadata,
    cameraPermissionStatus: store.cameraPermissionStatus,

    // Actions
    setState,
    addCapturedFrame,
    submitScan,
    retakeScan,
    cancelScan,
    detectLandmarks,
    setLandmarks: store.setLandmarks,
    setDeviceMetadata: store.setDeviceMetadata,
    setCameraPermissionStatus: store.setCameraPermissionStatus,
  };
};
