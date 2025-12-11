import { useARStore } from '@/store/arStore';

describe('AR Store', () => {
  beforeEach(() => {
    useARStore.getState().reset();
  });

  describe('Hand Model Management', () => {
    it('should set hand model', () => {
      const mockModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockModel);
      expect(useARStore.getState().handModel).toEqual(mockModel);
    });

    it('should update joint properties', () => {
      const mockModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [
          {
            id: 'joint-1',
            name: 'Test Joint',
            position: [0, 0, 0] as [number, number, number],
            isActive: false,
            intensity: 0,
          },
        ],
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockModel);
      useARStore.getState().updateJoint('joint-1', { isActive: true, intensity: 0.8 });

      const updatedJoint = useARStore.getState().handModel?.joints[0];
      expect(updatedJoint?.isActive).toBe(true);
      expect(updatedJoint?.intensity).toBe(0.8);
    });

    it('should update hand model transform', () => {
      const mockModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockModel);
      useARStore.getState().updateHandModelTransform({
        scale: 2,
        position: [1, 2, 3],
      });

      const updated = useARStore.getState().handModel;
      expect(updated?.scale).toBe(2);
      expect(updated?.position).toEqual([1, 2, 3]);
    });
  });

  describe('Calibration Settings', () => {
    it('should update calibration settings', () => {
      useARStore.getState().updateCalibrationSettings({
        sensitivity: 0.7,
        hapticIntensity: 0.9,
      });

      const settings = useARStore.getState().calibrationSettings;
      expect(settings.sensitivity).toBe(0.7);
      expect(settings.hapticIntensity).toBe(0.9);
    });

    it('should maintain default values for non-updated settings', () => {
      useARStore.getState().updateCalibrationSettings({
        sensitivity: 0.7,
      });

      const settings = useARStore.getState().calibrationSettings;
      expect(settings.sensitivity).toBe(0.7);
      expect(settings.proximityThreshold).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should set model loaded state', () => {
      useARStore.getState().setModelLoaded(true);
      expect(useARStore.getState().isModelLoaded).toBe(true);
    });

    it('should set plane detected state', () => {
      useARStore.getState().setPlaneDetected(true);
      expect(useARStore.getState().isPlaneDetected).toBe(true);
    });

    it('should set calibrated state', () => {
      useARStore.getState().setCalibrated(true);
      expect(useARStore.getState().isCalibrated).toBe(true);
    });

    it('should reset all state', () => {
      useARStore.getState().setModelLoaded(true);
      useARStore.getState().setPlaneDetected(true);
      useARStore.getState().setCalibrated(true);

      useARStore.getState().reset();

      expect(useARStore.getState().isModelLoaded).toBe(false);
      expect(useARStore.getState().isPlaneDetected).toBe(false);
      expect(useARStore.getState().isCalibrated).toBe(false);
      expect(useARStore.getState().handModel).toBeNull();
    });
  });

  describe('Haptic Feedback Tracking', () => {
    it('should track last haptic time', () => {
      const now = Date.now();
      useARStore.getState().setLastHapticTime(now);
      expect(useARStore.getState().lastHapticTime).toBe(now);
    });
  });
});
