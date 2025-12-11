import { hapticService, HapticFeedbackType } from '@/services/hapticService';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics');

describe('Haptic Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hapticService.setMinInterval(0);
  });

  describe('Feedback Triggering', () => {
    it('should trigger light feedback', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Light);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should trigger medium feedback', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Medium);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should trigger heavy feedback', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Heavy);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should trigger selection feedback', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Selection);
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should trigger success notification', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Success);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should trigger warning notification', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Warning);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should trigger error notification', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Error);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should trigger impact feedback with intensity', async () => {
      await hapticService.triggerFeedback(HapticFeedbackType.Impact, 0.2);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

      jest.clearAllMocks();
      await hapticService.triggerFeedback(HapticFeedbackType.Impact, 0.5);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

      jest.clearAllMocks();
      await hapticService.triggerFeedback(HapticFeedbackType.Impact, 0.9);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });
  });

  describe('Proximity Feedback', () => {
    it('should trigger feedback when within threshold', async () => {
      await hapticService.triggerProximityFeedback(0.03, 0.05);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should not trigger feedback when outside threshold', async () => {
      await hapticService.triggerProximityFeedback(0.1, 0.05);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should scale intensity based on distance', async () => {
      await hapticService.triggerProximityFeedback(0.01, 0.05);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect minimum interval between feedback', async () => {
      hapticService.setMinInterval(100);

      await hapticService.triggerFeedback(HapticFeedbackType.Light);
      await hapticService.triggerFeedback(HapticFeedbackType.Light);

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    });

    it('should allow feedback after interval has passed', async () => {
      hapticService.setMinInterval(10);

      await hapticService.triggerFeedback(HapticFeedbackType.Light);
      await new Promise((resolve) => setTimeout(resolve, 20));
      await hapticService.triggerFeedback(HapticFeedbackType.Light);

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptics not available'));

      await expect(hapticService.triggerFeedback(HapticFeedbackType.Light)).resolves.not.toThrow();
    });
  });
});
