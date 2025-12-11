import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

export interface CameraPermissionsState {
  cameraPermission: MediaLibrary.PermissionStatus | null;
  mediaLibraryPermission: MediaLibrary.PermissionStatus | null;
  isLoadingPermissions: boolean;
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
}

export const useCameraPermissions = (): CameraPermissionsState => {
  const [cameraPermission, setCameraPermission] =
    useState<MediaLibrary.PermissionStatus | null>(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] =
    useState<MediaLibrary.PermissionStatus | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoadingPermissions(true);
      const cameraStatus = await MediaLibrary.getCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.getPermissionsAsync();
      setCameraPermission(cameraStatus.status);
      setMediaLibraryPermission(mediaStatus.status);
      setIsLoadingPermissions(false);
    })();
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    setIsLoadingPermissions(true);
    try {
      const permission = await MediaLibrary.requestCameraPermissionsAsync();
      setCameraPermission(permission.status);
      return permission.granted;
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    setIsLoadingPermissions(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(permission.status);
      return permission.granted;
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  return {
    cameraPermission,
    mediaLibraryPermission,
    isLoadingPermissions,
    requestCameraPermission,
    requestMediaLibraryPermission,
  };
};
