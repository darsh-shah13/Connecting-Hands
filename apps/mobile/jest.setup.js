import '@testing-library/jest-native/extend-expect';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/directory/',
  getInfoAsync: jest.fn(),
  downloadAsync: jest.fn(),
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

jest.mock('expo-three', () => ({
  Renderer: jest.fn(),
  THREE: {
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    PlaneGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(),
    Vector3: jest.fn(),
  },
}));

jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  PlaneGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  SphereGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(),
  Vector3: jest.fn(),
  Group: jest.fn(),
  DoubleSide: 2,
}));

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
  })),
}));

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
  return 0;
};
// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('expo-camera', () => ({
  CameraView: () => null,
}));

jest.mock('expo-media-library', () => ({
  getCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: false, status: 'undetermined' })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, status: 'granted' })
  ),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: false, status: 'undetermined' })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, status: 'granted' })
  ),
}));

jest.mock('react-native-paper', () => ({
  Button: () => null,
  Text: () => null,
  Card: () => ({
    Content: () => null,
    Actions: () => null,
  }),
  Surface: () => null,
  MD3Colors: {
    primary: '#6200EE',
  },
}));
