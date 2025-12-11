import { renderHook, act } from '@testing-library/react';
import { useHandScanStore, type ScanState } from '@/store/handScanStore';

describe('Hand Scan Store', () => {
  beforeEach(() => {
    useHandScanStore.setState({
      state: 'idle',
      capturedFrames: [],
      landmarks: [],
      deviceMetadata: {
        cameraType: 'back',
        zoom: 1,
        flashMode: 'off',
      },
      error: null,
      uploadProgress: 0,
      cameraPermissionStatus: 'undetermined',
    });
  });

  describe('State Management', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => useHandScanStore());
      expect(result.current.state).toBe('idle');
    });

    it('should transition between states', () => {
      const { result } = renderHook(() => useHandScanStore());

      act(() => {
        result.current.setState('permissions-check');
      });
      expect(result.current.state).toBe('permissions-check');

      act(() => {
        result.current.setState('guide');
      });
      expect(result.current.state).toBe('guide');

      act(() => {
        result.current.setState('capturing');
      });
      expect(result.current.state).toBe('capturing');
    });

    it('should handle all valid state transitions', () => {
      const { result } = renderHook(() => useHandScanStore());
      const states: ScanState[] = [
        'idle',
        'permissions-check',
        'guide',
        'capturing',
        'processing',
        'review',
        'uploading',
        'success',
        'error',
      ];

      states.forEach((state) => {
        act(() => {
          result.current.setState(state);
        });
        expect(result.current.state).toBe(state);
      });
    });
  });

  describe('Frame Capture', () => {
    it('should add captured frames', () => {
      const { result } = renderHook(() => useHandScanStore());

      const frame1 = {
        uri: 'file://frame1.jpg',
        timestamp: Date.now(),
        width: 1080,
        height: 1920,
      };

      act(() => {
        result.current.addFrame(frame1);
      });

      expect(result.current.capturedFrames).toHaveLength(1);
      expect(result.current.capturedFrames[0]).toEqual(frame1);
    });

    it('should add multiple frames in order', () => {
      const { result } = renderHook(() => useHandScanStore());

      const frames = [
        {
          uri: 'file://frame1.jpg',
          timestamp: Date.now(),
          width: 1080,
          height: 1920,
        },
        {
          uri: 'file://frame2.jpg',
          timestamp: Date.now() + 500,
          width: 1080,
          height: 1920,
        },
        {
          uri: 'file://frame3.jpg',
          timestamp: Date.now() + 1000,
          width: 1080,
          height: 1920,
        },
      ];

      act(() => {
        frames.forEach((frame) => {
          result.current.addFrame(frame);
        });
      });

      expect(result.current.capturedFrames).toHaveLength(3);
      expect(result.current.capturedFrames).toEqual(frames);
    });

    it('should set frames directly', () => {
      const { result } = renderHook(() => useHandScanStore());

      const frames = [
        {
          uri: 'file://frame1.jpg',
          timestamp: Date.now(),
          width: 1080,
          height: 1920,
        },
      ];

      act(() => {
        result.current.setCapturedFrames(frames);
      });

      expect(result.current.capturedFrames).toEqual(frames);
    });

    it('should clear frames', () => {
      const { result } = renderHook(() => useHandScanStore());

      act(() => {
        result.current.addFrame({
          uri: 'file://frame1.jpg',
          timestamp: Date.now(),
          width: 1080,
          height: 1920,
        });
      });

      expect(result.current.capturedFrames).toHaveLength(1);

      act(() => {
        result.current.clearFrames();
      });

      expect(result.current.capturedFrames).toHaveLength(0);
    });
  });

  describe('Landmarks', () => {
    it('should set landmarks', () => {
      const { result } = renderHook(() => useHandScanStore());

      const landmarks = [
        { x: 0.5, y: 0.4, z: 0.0, confidence: 0.95 },
        { x: 0.52, y: 0.42, z: 0.01, confidence: 0.92 },
      ];

      act(() => {
        result.current.setLandmarks(landmarks);
      });

      expect(result.current.landmarks).toEqual(landmarks);
    });

    it('should initialize with empty landmarks', () => {
      const { result } = renderHook(() => useHandScanStore());
      expect(result.current.landmarks).toEqual([]);
    });
  });

  describe('Device Metadata', () => {
    it('should initialize with default metadata', () => {
      const { result } = renderHook(() => useHandScanStore());

      expect(result.current.deviceMetadata.cameraType).toBe('back');
      expect(result.current.deviceMetadata.zoom).toBe(1);
      expect(result.current.deviceMetadata.flashMode).toBe('off');
    });

    it('should update device metadata partially', () => {
      const { result } = renderHook(() => useHandScanStore());

      act(() => {
        result.current.setDeviceMetadata({
          zoom: 2,
          flashMode: 'on',
        });
      });

      expect(result.current.deviceMetadata.cameraType).toBe('back');
      expect(result.current.deviceMetadata.zoom).toBe(2);
      expect(result.current.deviceMetadata.flashMode).toBe('on');
    });
  });

  describe('Error Handling', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useHandScanStore());

      const errorMessage = 'Camera permission denied';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useHandScanStore());

      act(() => {
        result.current.setError('Some error');
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Upload Progress', () => {
    it('should track upload progress', () => {
      const { result } = renderHook(() => useHandScanStore());

      expect(result.current.uploadProgress).toBe(0);

      act(() => {
        result.current.setUploadProgress(25);
      });
      expect(result.current.uploadProgress).toBe(25);

      act(() => {
        result.current.setUploadProgress(50);
      });
      expect(result.current.uploadProgress).toBe(50);

      act(() => {
        result.current.setUploadProgress(100);
      });
      expect(result.current.uploadProgress).toBe(100);
    });
  });

  describe('Camera Permissions', () => {
    it('should manage camera permission status', () => {
      const { result } = renderHook(() => useHandScanStore());

      expect(result.current.cameraPermissionStatus).toBe('undetermined');

      act(() => {
        result.current.setCameraPermissionStatus('granted');
      });
      expect(result.current.cameraPermissionStatus).toBe('granted');

      act(() => {
        result.current.setCameraPermissionStatus('denied');
      });
      expect(result.current.cameraPermissionStatus).toBe('denied');
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useHandScanStore());

      // Set various state values
      act(() => {
        result.current.setState('uploading');
        result.current.addFrame({
          uri: 'file://frame1.jpg',
          timestamp: Date.now(),
          width: 1080,
          height: 1920,
        });
        result.current.setLandmarks([
          { x: 0.5, y: 0.4, z: 0.0, confidence: 0.95 },
        ]);
        result.current.setError('Some error');
        result.current.setUploadProgress(50);
        result.current.setCameraPermissionStatus('granted');
      });

      // Verify state was changed
      expect(result.current.state).toBe('uploading');
      expect(result.current.capturedFrames).toHaveLength(1);
      expect(result.current.landmarks).toHaveLength(1);
      expect(result.current.error).toBe('Some error');
      expect(result.current.uploadProgress).toBe(50);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify state is reset
      expect(result.current.state).toBe('idle');
      expect(result.current.capturedFrames).toHaveLength(0);
      expect(result.current.landmarks).toHaveLength(0);
      expect(result.current.error).toBeNull();
      expect(result.current.uploadProgress).toBe(0);
      expect(result.current.cameraPermissionStatus).toBe('undetermined');
      expect(result.current.deviceMetadata.cameraType).toBe('back');
    });
  });
});
