import { create } from 'zustand';

export type ScanState =
  | 'idle'
  | 'permissions-check'
  | 'guide'
  | 'capturing'
  | 'processing'
  | 'review'
  | 'uploading'
  | 'success'
  | 'error';

export interface CapturedFrame {
  uri: string;
  timestamp: number;
  width: number;
  height: number;
}

export interface HandScanState {
  // UI state
  state: ScanState;
  setState: (state: ScanState) => void;

  // Camera permissions
  cameraPermissionStatus: 'undetermined' | 'granted' | 'denied';
  setCameraPermissionStatus: (
    status: 'undetermined' | 'granted' | 'denied'
  ) => void;

  // Captured data
  capturedFrames: CapturedFrame[];
  setCapturedFrames: (frames: CapturedFrame[]) => void;
  addFrame: (frame: CapturedFrame) => void;
  clearFrames: () => void;

  // Hand landmarks (from device or backend)
  landmarks: Array<{
    x: number;
    y: number;
    z: number;
    confidence: number;
  }>;
  setLandmarks: (
    landmarks: Array<{ x: number; y: number; z: number; confidence: number }>
  ) => void;

  // Device metadata
  deviceMetadata: {
    cameraType: 'front' | 'back';
    zoom: number;
    flashMode: 'off' | 'on' | 'auto';
  };
  setDeviceMetadata: (metadata: Partial<HandScanState['deviceMetadata']>) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Upload progress
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;

  // Reset state
  reset: () => void;
}

const initialDeviceMetadata = {
  cameraType: 'back' as const,
  zoom: 1,
  flashMode: 'off' as const,
};

export const useHandScanStore = create<HandScanState>((set) => ({
  state: 'idle',
  setState: (state) => set({ state }),

  cameraPermissionStatus: 'undetermined',
  setCameraPermissionStatus: (status) =>
    set({ cameraPermissionStatus: status }),

  capturedFrames: [],
  setCapturedFrames: (frames) => set({ capturedFrames: frames }),
  addFrame: (frame) =>
    set((state) => ({
      capturedFrames: [...state.capturedFrames, frame],
    })),
  clearFrames: () => set({ capturedFrames: [] }),

  landmarks: [],
  setLandmarks: (landmarks) => set({ landmarks }),

  deviceMetadata: initialDeviceMetadata,
  setDeviceMetadata: (metadata) =>
    set((state) => ({
      deviceMetadata: {
        ...state.deviceMetadata,
        ...metadata,
      },
    })),

  error: null,
  setError: (error) => set({ error }),

  uploadProgress: 0,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  reset: () =>
    set({
      state: 'idle',
      capturedFrames: [],
      landmarks: [],
      deviceMetadata: initialDeviceMetadata,
      error: null,
      uploadProgress: 0,
      cameraPermissionStatus: 'undetermined',
    }),
}));
