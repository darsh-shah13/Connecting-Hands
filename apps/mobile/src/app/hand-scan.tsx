import { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { useHandScanFlow } from '@/hooks/useHandScanFlow';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';
import { CameraGuideScreen } from '@/components/CameraGuideScreen';
import { CameraCaptureScreen } from '@/components/CameraCaptureScreen';
import { ReviewScreen } from '@/components/ReviewScreen';
import { PermissionsScreen } from '@/components/PermissionsScreen';
import { SuccessScreen } from '@/components/SuccessScreen';
import type { CapturedFrame } from '@/store/handScanStore';

export default function HandScanScreen() {
  const router = useRouter();
  const handScanFlow = useHandScanFlow();
  const cameraPermissions = useCameraPermissions();
  const [scanId, setScanId] = useState<string>('');

  useEffect(() => {
    handScanFlow.setState('permissions-check');
  }, []);

  const handleRequestPermissions = async () => {
    const cameraGranted =
      await cameraPermissions.requestCameraPermission();
    const mediaGranted =
      await cameraPermissions.requestMediaLibraryPermission();

    if (cameraGranted && mediaGranted) {
      handScanFlow.setState('guide');
    }
  };

  const handleStartCapture = () => {
    handScanFlow.setState('capturing');
  };

  const handleFrameCapture = async (frameUri: string) => {
    try {
      const frame: CapturedFrame = {
        uri: frameUri,
        timestamp: Date.now(),
        width: 1080,
        height: 1920,
      };

      handScanFlow.addCapturedFrame(frame);

      // Try to detect landmarks on the captured frame
      const landmarks = await handScanFlow.detectLandmarks(frameUri);
      handScanFlow.setLandmarks(landmarks);
    } catch (error) {
      console.error('Error handling captured frame:', error);
    }
  };

  const handleCaptureComplete = () => {
    handScanFlow.setState('review');
  };

  const handleRetake = () => {
    handScanFlow.retakeScan();
  };

  const handleSubmit = async () => {
    await handScanFlow.submitScan();

    if (handScanFlow.state === 'success') {
      // Generate a simple scan ID (in real app, this would come from backend)
      setScanId(
        `SCAN-${Date.now()
          .toString()
          .slice(-8)}`
      );
    }
  };

  const handleCancel = () => {
    handScanFlow.cancelScan();
    router.back();
  };

  const handleDoneSuccess = () => {
    handScanFlow.reset();
    router.back();
  };

  const isCameraPermissionGranted =
    cameraPermissions.cameraPermission === 'granted';
  const isMediaLibraryPermissionGranted =
    cameraPermissions.mediaLibraryPermission === 'granted';

  return (
    <SafeAreaView style={styles.container}>
      {handScanFlow.state === 'permissions-check' && (
        <PermissionsScreen
          cameraPermissionGranted={isCameraPermissionGranted}
          mediaLibraryPermissionGranted={
            isMediaLibraryPermissionGranted
          }
          isLoading={cameraPermissions.isLoadingPermissions}
          onRequestPermissions={handleRequestPermissions}
          onCancel={handleCancel}
        />
      )}

      {handScanFlow.state === 'guide' && (
        <CameraGuideScreen
          onStartCapture={handleStartCapture}
          onCancel={handleCancel}
        />
      )}

      {handScanFlow.state === 'capturing' && (
        <CameraCaptureScreen
          landmarks={handScanFlow.landmarks}
          onFrameCapture={handleFrameCapture}
          onCaptureComplete={handleCaptureComplete}
          onCancel={handleCancel}
          isCapturing={true}
        />
      )}

      {handScanFlow.state === 'review' && (
        <ReviewScreen
          frames={handScanFlow.capturedFrames}
          onRetake={handleRetake}
          onSubmit={handleSubmit}
          isSubmitting={handScanFlow.state === 'uploading'}
          error={handScanFlow.error}
        />
      )}

      {handScanFlow.state === 'success' && (
        <SuccessScreen scanId={scanId} onDone={handleDoneSuccess} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
