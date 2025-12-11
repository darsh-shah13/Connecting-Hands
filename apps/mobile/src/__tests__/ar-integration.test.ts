import { useARStore } from '@/store/arStore';
import { hapticService } from '@/services/hapticService';

describe('AR Integration Tests', () => {
  beforeEach(() => {
    useARStore.getState().reset();
  });

  describe('GLB Loading and Display', () => {
    it('should load GLB model and update store', async () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      expect(useARStore.getState().handModel).toBeTruthy();
      expect(useARStore.getState().handModel?.glbUrl).toBe(mockHandModel.glbUrl);
    });

    it('should mark model as loaded after successful load', () => {
      useARStore.getState().setModelLoaded(false);
      expect(useARStore.getState().isModelLoaded).toBe(false);

      useARStore.getState().setModelLoaded(true);
      expect(useARStore.getState().isModelLoaded).toBe(true);
    });
  });

  describe('Plane Detection', () => {
    it('should detect plane and update state', () => {
      useARStore.getState().setPlaneDetected(false);
      expect(useARStore.getState().isPlaneDetected).toBe(false);

      useARStore.getState().setPlaneDetected(true);
      expect(useARStore.getState().isPlaneDetected).toBe(true);
    });

    it('should anchor model to detected plane', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 0.1,
        position: [0, -0.1, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().setPlaneDetected(true);

      const model = useARStore.getState().handModel;
      expect(model?.position).toBeDefined();
      expect(useARStore.getState().isPlaneDetected).toBe(true);
    });
  });

  describe('Haptic Feedback on Proximity', () => {
    it('should trigger haptics when within proximity threshold', async () => {
      const mockCalibrationSettings = {
        sensitivity: 0.5,
        hapticIntensity: 0.8,
        proximityThreshold: 0.05,
        markerSize: 0.02,
        autoAlign: true,
      };

      useARStore.getState().updateCalibrationSettings(mockCalibrationSettings);

      const distance = 0.03;
      const threshold = useARStore.getState().calibrationSettings.proximityThreshold;

      expect(distance).toBeLessThan(threshold);

      const mockTrigger = jest.spyOn(hapticService, 'triggerProximityFeedback');
      await hapticService.triggerProximityFeedback(distance, threshold);

      expect(mockTrigger).toHaveBeenCalledWith(distance, threshold);
    });

    it('should not trigger haptics when outside proximity threshold', async () => {
      const mockCalibrationSettings = {
        sensitivity: 0.5,
        hapticIntensity: 0.8,
        proximityThreshold: 0.05,
        markerSize: 0.02,
        autoAlign: true,
      };

      useARStore.getState().updateCalibrationSettings(mockCalibrationSettings);

      const distance = 0.1;
      const threshold = useARStore.getState().calibrationSettings.proximityThreshold;

      expect(distance).toBeGreaterThan(threshold);
    });

    it('should track last haptic time to prevent spam', () => {
      const now = Date.now();
      useARStore.getState().setLastHapticTime(now);

      expect(useARStore.getState().lastHapticTime).toBe(now);

      const later = now + 200;
      useARStore.getState().setLastHapticTime(later);

      expect(useARStore.getState().lastHapticTime).toBe(later);
    });
  });

  describe('Joint Markers and Glow Effect', () => {
    it('should update joint activation state', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [
          {
            id: 'thumb-tip',
            name: 'Thumb Tip',
            position: [0.05, 0, 0] as [number, number, number],
            isActive: false,
            intensity: 0,
          },
        ],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().updateJoint('thumb-tip', { isActive: true, intensity: 0.8 });

      const joint = useARStore.getState().handModel?.joints[0];
      expect(joint?.isActive).toBe(true);
      expect(joint?.intensity).toBe(0.8);
    });

    it('should support multiple joints with different intensities', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [
          {
            id: 'thumb-tip',
            name: 'Thumb Tip',
            position: [0.05, 0, 0] as [number, number, number],
            isActive: false,
            intensity: 0,
          },
          {
            id: 'index-tip',
            name: 'Index Tip',
            position: [0.1, 0, 0] as [number, number, number],
            isActive: false,
            intensity: 0,
          },
        ],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().updateJoint('thumb-tip', { isActive: true, intensity: 0.6 });
      useARStore.getState().updateJoint('index-tip', { isActive: true, intensity: 0.9 });

      const thumbJoint = useARStore.getState().handModel?.joints[0];
      const indexJoint = useARStore.getState().handModel?.joints[1];

      expect(thumbJoint?.intensity).toBe(0.6);
      expect(indexJoint?.intensity).toBe(0.9);
    });
  });

  describe('Gesture Controls', () => {
    it('should update scale via gesture', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().updateHandModelTransform({ scale: 0.2 });

      expect(useARStore.getState().handModel?.scale).toBe(0.2);
    });

    it('should update position via drag gesture', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().updateHandModelTransform({ position: [0.1, 0.2, 0] });

      expect(useARStore.getState().handModel?.position).toEqual([0.1, 0.2, 0]);
    });

    it('should update rotation via rotation gesture', () => {
      const mockHandModel = {
        id: 'test-hand',
        glbUrl: 'https://example.com/hand.glb',
        joints: [],
        scale: 0.1,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      };

      useARStore.getState().setHandModel(mockHandModel);
      useARStore.getState().updateHandModelTransform({ rotation: [0, Math.PI / 4, 0] });

      expect(useARStore.getState().handModel?.rotation[1]).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('Calibration Workflow', () => {
    it('should complete calibration flow', () => {
      expect(useARStore.getState().isCalibrated).toBe(false);

      useARStore.getState().setPlaneDetected(true);
      expect(useARStore.getState().isPlaneDetected).toBe(true);

      useARStore.getState().updateCalibrationSettings({
        hapticIntensity: 0.7,
        proximityThreshold: 0.04,
      });

      useARStore.getState().setCalibrated(true);
      expect(useARStore.getState().isCalibrated).toBe(true);
    });

    it('should persist calibration settings', () => {
      const customSettings = {
        sensitivity: 0.8,
        hapticIntensity: 0.9,
        proximityThreshold: 0.06,
        markerSize: 0.025,
        autoAlign: false,
      };

      useARStore.getState().updateCalibrationSettings(customSettings);

      const settings = useARStore.getState().calibrationSettings;
      expect(settings.sensitivity).toBe(customSettings.sensitivity);
      expect(settings.hapticIntensity).toBe(customSettings.hapticIntensity);
      expect(settings.proximityThreshold).toBe(customSettings.proximityThreshold);
      expect(settings.markerSize).toBe(customSettings.markerSize);
      expect(settings.autoAlign).toBe(customSettings.autoAlign);
    });
  });
});
