import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button, IconButton, Surface, ActivityIndicator } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  RotationGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { useARStore, HandModelData } from '@/store/arStore';
import { ARScene } from '@/components/ARScene';
import { CalibrationWizard } from '@/components/CalibrationWizard';
import { hapticService, HapticFeedbackType } from '@/services/hapticService';

export default function ARHandScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCalibration, setShowCalibration] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  const {
    handModel,
    isModelLoaded,
    isPlaneDetected,
    isCalibrated,
    setHandModel,
    updateHandModelTransform,
    updateJoint,
  } = useARStore();

  const baseScaleRef = useRef(1);
  const lastScaleRef = useRef(1);

  useEffect(() => {
    if (!handModel) {
      const demoModel: HandModelData = {
        id: 'demo-hand-1',
        glbUrl: 'https://example.com/hand-model.glb',
        joints: [
          {
            id: 'thumb-tip',
            name: 'Thumb Tip',
            position: [0.05, 0, 0],
            isActive: false,
            intensity: 0,
          },
          {
            id: 'index-tip',
            name: 'Index Tip',
            position: [0.1, 0, 0],
            isActive: false,
            intensity: 0,
          },
          {
            id: 'middle-tip',
            name: 'Middle Tip',
            position: [0.12, 0, 0],
            isActive: false,
            intensity: 0,
          },
          {
            id: 'ring-tip',
            name: 'Ring Tip',
            position: [0.1, 0, 0],
            isActive: false,
            intensity: 0,
          },
          {
            id: 'pinky-tip',
            name: 'Pinky Tip',
            position: [0.08, 0, 0],
            isActive: false,
            intensity: 0,
          },
        ],
        scale: 0.1,
        position: [0, -0.1, 0],
        rotation: [0, 0, 0],
      };
      setHandModel(demoModel);
    }
  }, [handModel, setHandModel]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (handModel) {
        const randomJointIndex = Math.floor(Math.random() * handModel.joints.length);
        const joint = handModel.joints[randomJointIndex];
        const shouldActivate = Math.random() > 0.7;

        updateJoint(joint.id, {
          isActive: shouldActivate,
          intensity: shouldActivate ? Math.random() * 0.8 + 0.2 : 0,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [handModel, updateJoint]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Surface style={styles.permissionCard}>
          <Text variant="headlineSmall" style={styles.permissionTitle}>
            Camera Permission Required
          </Text>
          <Text variant="bodyMedium" style={styles.permissionText}>
            This feature requires camera access to display AR hand visualization.
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            Grant Permission
          </Button>
        </Surface>
      </View>
    );
  }

  const handleCalibrationComplete = () => {
    setShowCalibration(false);
    hapticService.triggerFeedback(HapticFeedbackType.Success);
  };

  const handleCalibrationCancel = () => {
    setShowCalibration(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePinch = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const scale = event.nativeEvent.scale;
      const newScale = baseScaleRef.current * scale;
      updateHandModelTransform({ scale: newScale });
      lastScaleRef.current = scale;
    } else if (event.nativeEvent.state === State.END) {
      baseScaleRef.current = baseScaleRef.current * lastScaleRef.current;
      lastScaleRef.current = 1;
      hapticService.triggerFeedback(HapticFeedbackType.Light);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePan = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE && handModel) {
      const dx = event.nativeEvent.translationX * 0.0005;
      const dy = -event.nativeEvent.translationY * 0.0005;

      updateHandModelTransform({
        position: [handModel.position[0] + dx, handModel.position[1] + dy, handModel.position[2]],
      });
    } else if (event.nativeEvent.state === State.END) {
      hapticService.triggerFeedback(HapticFeedbackType.Light);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRotation = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE && handModel) {
      const rotation = event.nativeEvent.rotation;
      updateHandModelTransform({
        rotation: [
          handModel.rotation[0],
          handModel.rotation[1] + rotation * 0.01,
          handModel.rotation[2],
        ],
      });
    } else if (event.nativeEvent.state === State.END) {
      hapticService.triggerFeedback(HapticFeedbackType.Light);
    }
  };

  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    hapticService.triggerFeedback(HapticFeedbackType.Selection);
  };

  const handleModelLoaded = () => {
    hapticService.triggerFeedback(HapticFeedbackType.Success);
  };

  const handleError = (error: Error) => {
    Alert.alert('AR Error', error.message);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onCameraReady={() => setCameraReady(true)}
        >
          <View style={styles.overlay}>
            {cameraReady && (
              <PinchGestureHandler onGestureEvent={handlePinch}>
                <PanGestureHandler onGestureEvent={handlePan}>
                  <RotationGestureHandler onGestureEvent={handleRotation}>
                    <View style={styles.arContainer}>
                      <ARScene onModelLoaded={handleModelLoaded} onError={handleError} />
                    </View>
                  </RotationGestureHandler>
                </PanGestureHandler>
              </PinchGestureHandler>
            )}

            <View style={styles.topBar}>
              <Surface style={styles.statusBadge}>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isPlaneDetected ? '#4CAF50' : '#FF9800' },
                    ]}
                  />
                  <Text variant="labelSmall">
                    {isPlaneDetected ? 'Surface Detected' : 'Scanning...'}
                  </Text>
                </View>
              </Surface>

              {isModelLoaded && (
                <Surface style={styles.statusBadge}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <Text variant="labelSmall">Model Loaded</Text>
                  </View>
                </Surface>
              )}
            </View>

            <View style={styles.bottomBar}>
              <IconButton
                icon="refresh"
                mode="contained"
                onPress={() => setShowCalibration(true)}
                containerColor="rgba(255, 255, 255, 0.9)"
              />

              <IconButton
                icon="camera-flip"
                mode="contained"
                onPress={toggleCamera}
                containerColor="rgba(255, 255, 255, 0.9)"
              />

              {!isCalibrated && (
                <Button
                  mode="contained"
                  onPress={() => setShowCalibration(true)}
                  style={styles.calibrateButton}
                >
                  Start Calibration
                </Button>
              )}
            </View>

            {!cameraReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text variant="bodyLarge" style={styles.loadingText}>
                  Initializing Camera...
                </Text>
              </View>
            )}
          </View>
        </CameraView>

        {showCalibration && (
          <CalibrationWizard
            onComplete={handleCalibrationComplete}
            onCancel={handleCalibrationCancel}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  arContainer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  calibrateButton: {
    flex: 1,
    maxWidth: 200,
  },
  permissionCard: {
    padding: 24,
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  permissionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  permissionText: {
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
});
