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
