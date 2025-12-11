import { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import { Button, Text, Surface } from 'react-native-paper';
import Svg, { Circle, Line } from 'react-native-svg';

const { height, width } = Dimensions.get('window');

interface CameraCaptureScreenProps {
  landmarks?: Array<{ x: number; y: number; z: number; confidence: number }>;
  onFrameCapture: (frameUri: string) => void;
  onCaptureComplete: () => void;
  onCancel: () => void;
  isCapturing?: boolean;
}

const HAND_OUTLINE_MARGIN = 0.1;
const SAFE_MARGIN = 0.15;

export const CameraCaptureScreen = ({
  landmarks,
  onFrameCapture,
  onCaptureComplete,
  onCancel,
  isCapturing = false,
}: CameraCaptureScreenProps) => {
  const cameraRef = useRef<CameraView>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: true,
        });

        if (photo) {
          onFrameCapture(photo.uri);
          setCaptureCount((prev) => prev + 1);

          if (captureCount >= 4) {
            setIsRecording(false);
            onCaptureComplete();
          }
        }
      }
    } catch (error) {
      Alert.alert('Capture Error', 'Failed to capture frame. Try again.');
      console.error('Camera capture error:', error);
    }
  };

  const startAutomaticCapture = () => {
    setIsRecording(true);
    setCaptureCount(0);

    const captureInterval = setInterval(() => {
      handleCapture();
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(captureInterval);
      setIsRecording(false);
    }, 3000);

    return () => {
      clearInterval(captureInterval);
      clearTimeout(timeout);
    };
  };

  useEffect(() => {
    if (isCapturing && !isRecording) {
      startAutomaticCapture();
    }
  }, [isCapturing]);

  const getHandOutlineProps = () => {
    if (!landmarks || landmarks.length === 0) {
      return {
        x: width * HAND_OUTLINE_MARGIN,
        y: height * HAND_OUTLINE_MARGIN,
        w:
          width *
          (1 - 2 * HAND_OUTLINE_MARGIN -
            SAFE_MARGIN),
        h:
          height *
          (1 - 2 * HAND_OUTLINE_MARGIN -
            SAFE_MARGIN),
      };
    }

    const xs = landmarks.map((l) => l.x * width);
    const ys = landmarks.map((l) => l.y * height);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 20;

    return {
      x: Math.max(minX - padding, SAFE_MARGIN * width),
      y: Math.max(minY - padding, SAFE_MARGIN * height),
      w: Math.min(maxX + padding - (minX - padding), width - 2 * SAFE_MARGIN * width),
      h: Math.min(
        maxY + padding - (minY - padding),
        height - 2 * SAFE_MARGIN * height
      ),
    };
  };

  const outline = getHandOutlineProps();

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        {/* Hand outline overlay */}
        <Svg height={height} width={width} style={styles.overlay}>
          {/* Rectangle outline for hand region */}
          <Line
            x1={outline.x}
            y1={outline.y}
            x2={outline.x + outline.w}
            y2={outline.y}
            stroke="#4CAF50"
            strokeWidth="2"
          />
          <Line
            x1={outline.x + outline.w}
            y1={outline.y}
            x2={outline.x + outline.w}
            y2={outline.y + outline.h}
            stroke="#4CAF50"
            strokeWidth="2"
          />
          <Line
            x1={outline.x + outline.w}
            y1={outline.y + outline.h}
            x2={outline.x}
            y2={outline.y + outline.h}
            stroke="#4CAF50"
            strokeWidth="2"
          />
          <Line
            x1={outline.x}
            y1={outline.y + outline.h}
            x2={outline.x}
            y2={outline.y}
            stroke="#4CAF50"
            strokeWidth="2"
          />

          {/* Landmark points */}
          {landmarks &&
            landmarks.map((landmark, index) => (
              <Circle
                key={index}
                cx={landmark.x * width}
                cy={landmark.y * height}
                r="4"
                fill={
                  landmark.confidence > 0.8
                    ? '#4CAF50'
                    : '#FFC107'
                }
                opacity={landmark.confidence}
              />
            ))}
        </Svg>

        {/* UI Controls overlay */}
        <View style={styles.controlsOverlay}>
          <Text style={styles.frameCounter}>
            Frames: {captureCount}/5
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              disabled={isRecording}
              onPress={startAutomaticCapture}
              style={styles.captureButton}
            >
              {isRecording
                ? `Capturing... ${captureCount}/5`
                : 'Start Capture'}
            </Button>

            <Button mode="outlined" onPress={onCancel}>
              Cancel
            </Button>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  frameCounter: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 8,
  },
  captureButton: {
    marginBottom: 8,
  },
});
