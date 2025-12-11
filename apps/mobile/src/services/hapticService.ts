import * as Haptics from 'expo-haptics';

export enum HapticFeedbackType {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Selection = 'selection',
  Impact = 'impact',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export class HapticService {
  private lastFeedbackTime: number = 0;
  private minInterval: number = 50;

  async triggerFeedback(type: HapticFeedbackType, intensity: number = 1.0): Promise<void> {
    const now = Date.now();
    if (now - this.lastFeedbackTime < this.minInterval) {
      return;
    }

    this.lastFeedbackTime = now;

    try {
      switch (type) {
        case HapticFeedbackType.Light:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticFeedbackType.Medium:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticFeedbackType.Heavy:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticFeedbackType.Selection:
          await Haptics.selectionAsync();
          break;
        case HapticFeedbackType.Success:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticFeedbackType.Warning:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticFeedbackType.Error:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticFeedbackType.Impact:
        default: {
          const feedbackStyle = this.getImpactStyle(intensity);
          await Haptics.impactAsync(feedbackStyle);
          break;
        }
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  private getImpactStyle(intensity: number): Haptics.ImpactFeedbackStyle {
    if (intensity < 0.3) {
      return Haptics.ImpactFeedbackStyle.Light;
    } else if (intensity < 0.7) {
      return Haptics.ImpactFeedbackStyle.Medium;
    } else {
      return Haptics.ImpactFeedbackStyle.Heavy;
    }
  }

  async triggerProximityFeedback(distance: number, threshold: number): Promise<void> {
    if (distance > threshold) {
      return;
    }

    const intensity = 1 - distance / threshold;
    await this.triggerFeedback(HapticFeedbackType.Impact, intensity);
  }

  setMinInterval(interval: number): void {
    this.minInterval = interval;
  }
}

export const hapticService = new HapticService();
