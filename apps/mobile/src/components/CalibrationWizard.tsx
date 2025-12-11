import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ProgressBar, IconButton } from 'react-native-paper';
import { useARStore } from '@/store/arStore';
import { hapticService, HapticFeedbackType } from '@/services/hapticService';

interface CalibrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

enum CalibrationStep {
  Welcome = 0,
  PlaneDetection = 1,
  HandAlignment = 2,
  HapticTest = 3,
  Complete = 4,
}

export const CalibrationWizard: React.FC<CalibrationWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<CalibrationStep>(CalibrationStep.Welcome);
  const { isPlaneDetected, setCalibrated, calibrationSettings } = useARStore();

  const totalSteps = 5;
  const progress = currentStep / totalSteps;

  const handleNext = async () => {
    if (currentStep === CalibrationStep.Complete) {
      setCalibrated(true);
      await hapticService.triggerFeedback(HapticFeedbackType.Success);
      onComplete();
    } else {
      await hapticService.triggerFeedback(HapticFeedbackType.Selection);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > CalibrationStep.Welcome) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleTestHaptic = async () => {
    await hapticService.triggerFeedback(
      HapticFeedbackType.Impact,
      calibrationSettings.hapticIntensity
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case CalibrationStep.Welcome:
        return (
          <View>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Welcome to AR Hand Calibration
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              This wizard will help you set up your AR hand viewing experience. We&apos;ll guide you
              through detecting a surface, aligning the hand model, and testing haptic feedback.
            </Text>
          </View>
        );

      case CalibrationStep.PlaneDetection:
        return (
          <View>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Surface Detection
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              Point your camera at a flat surface like a table or the floor. Move your device slowly
              to help detect the plane.
            </Text>
            {isPlaneDetected ? (
              <View style={styles.statusContainer}>
                <IconButton icon="check-circle" iconColor="#4CAF50" size={48} />
                <Text variant="bodyLarge" style={styles.successText}>
                  Surface detected!
                </Text>
              </View>
            ) : (
              <View style={styles.statusContainer}>
                <IconButton icon="magnify" iconColor="#FF9800" size={48} />
                <Text variant="bodyMedium">Scanning for surface...</Text>
              </View>
            )}
          </View>
        );

      case CalibrationStep.HandAlignment:
        return (
          <View>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Hand Alignment
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              Use pinch and drag gestures to scale and position the virtual hand. Align it with your
              palm for the best experience.
            </Text>
            <View style={styles.instructionsContainer}>
              <Text variant="bodySmall">• Pinch to zoom in/out</Text>
              <Text variant="bodySmall">• Drag to move the hand</Text>
              <Text variant="bodySmall">• Rotate with two fingers</Text>
            </View>
          </View>
        );

      case CalibrationStep.HapticTest:
        return (
          <View>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Test Haptic Feedback
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              Test the haptic feedback intensity. Adjust the slider to your preference.
            </Text>
            <Button
              mode="contained"
              onPress={handleTestHaptic}
              style={styles.testButton}
              icon="vibrate"
            >
              Test Haptics
            </Button>
            <Text variant="bodySmall" style={styles.helpText}>
              Intensity: {Math.round(calibrationSettings.hapticIntensity * 100)}%
            </Text>
          </View>
        );

      case CalibrationStep.Complete:
        return (
          <View>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Calibration Complete!
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              You&apos;re all set! You can now experience the AR hand with optimal settings.
            </Text>
            <View style={styles.statusContainer}>
              <IconButton icon="check-circle-outline" iconColor="#4CAF50" size={64} />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <ProgressBar progress={progress} style={styles.progressBar} />
          <Text variant="labelSmall" style={styles.stepCounter}>
            Step {currentStep + 1} of {totalSteps}
          </Text>
          {renderStepContent()}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button onPress={handleBack}>
            {currentStep === CalibrationStep.Welcome ? 'Cancel' : 'Back'}
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={currentStep === CalibrationStep.PlaneDetection && !isPlaneDetected}
          >
            {currentStep === CalibrationStep.Complete ? 'Finish' : 'Next'}
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  progressBar: {
    marginBottom: 16,
  },
  stepCounter: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  stepTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  stepDescription: {
    marginBottom: 16,
    lineHeight: 24,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  testButton: {
    marginVertical: 16,
  },
  helpText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});
