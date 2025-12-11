import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Button, Surface, MD3Colors } from 'react-native-paper';

const { height, width } = Dimensions.get('window');

interface CameraGuideScreenProps {
  onStartCapture: () => void;
  onCancel: () => void;
}

export const CameraGuideScreen = ({
  onStartCapture,
  onCancel,
}: CameraGuideScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Hand Scan Guide
        </Text>

        <Surface style={styles.guideSurface}>
          <View style={styles.guideLine}>
            <Text variant="titleMedium">📍 Positioning</Text>
            <Text variant="bodySmall">
              Place your hand at arm's length, palm facing the camera
            </Text>
          </View>

          <View style={styles.guideLine}>
            <Text variant="titleMedium">💡 Lighting</Text>
            <Text variant="bodySmall">
              Ensure good lighting to capture clear hand details
            </Text>
          </View>

          <View style={styles.guideLine}>
            <Text variant="titleMedium">👆 Hand Position</Text>
            <Text variant="bodySmall">
              Keep your hand steady and centered in the frame
            </Text>
          </View>

          <View style={styles.guideLine}>
            <Text variant="titleMedium">✋ Fingers Visible</Text>
            <Text variant="bodySmall">
              Make sure all fingertips are clearly visible
            </Text>
          </View>
        </Surface>

        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            onPress={onStartCapture}
            style={styles.startButton}
          >
            Start Scan
          </Button>
          <Button mode="outlined" onPress={onCancel}>
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  content: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  guideSurface: {
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  guideLine: {
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  startButton: {
    marginBottom: 8,
  },
});
