# Hand Scan Capture Implementation Guide

## Overview
This guide provides detailed information about the Hand Scan Capture feature implementation, including file structure, component interactions, and state management.

## File Structure

```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── hand-detection.tsx (UPDATED)
│   │   │   └── settings.tsx
│   │   ├── _layout.tsx
│   │   ├── modal.tsx
│   │   └── hand-scan.tsx (NEW) - Main hand scan screen
│   ├── components/
│   │   ├── CameraGuideScreen.tsx (NEW)
│   │   ├── CameraCaptureScreen.tsx (NEW)
│   │   ├── ReviewScreen.tsx (NEW)
│   │   ├── PermissionsScreen.tsx (NEW)
│   │   └── SuccessScreen.tsx (NEW)
│   ├── hooks/
│   │   ├── useCameraPermissions.ts (NEW)
│   │   └── useHandScanFlow.ts (NEW)
│   ├── services/
│   │   ├── apiClient.ts (EXISTING)
│   │   └── handScanService.ts (NEW)
│   ├── store/
│   │   ├── appStore.ts (EXISTING)
│   │   └── handScanStore.ts (NEW)
│   ├── __tests__/
│   │   └── handScanStore.test.ts (NEW)
│   ├── theme.ts
│   └── index.ts
├── package.json (UPDATED)
├── tsconfig.json (EXISTING - already configured)
└── app.json

services/hand-modeler/
├── app/
│   ├── main.py (UPDATED)
│   ├── models/
│   │   ├── hand_detection.py (EXISTING)
│   │   └── hand_scan.py (NEW)
│   └── routers/
│       ├── health.py (EXISTING)
│       ├── hand_detection.py (EXISTING)
│       └── hand_scan.py (NEW)
├── tests/
│   ├── test_health.py (EXISTING)
│   └── test_hand_scan.py (NEW)
└── pyproject.toml

Root
├── QA_CHECKLIST.md (NEW)
├── HAND_SCAN_FEATURE.md (NEW)
├── IMPLEMENTATION_GUIDE.md (THIS FILE)
└── README.md (EXISTING)
```

## Component Interaction Flow

### 1. Navigation Entry Point
**File:** `apps/mobile/src/app/(tabs)/hand-detection.tsx`

```typescript
const handleStartScan = () => {
  router.push('/hand-scan');
};
```

Routes to the main hand scan screen.

### 2. Main Screen Orchestration
**File:** `apps/mobile/src/app/hand-scan.tsx`

Manages the overall flow:
- Uses `useHandScanFlow` hook for state management
- Uses `useCameraPermissions` hook for permission handling
- Conditionally renders screens based on current state
- Handles all user interactions (button presses, callbacks)

State flow:
```
permissions-check 
  → guide 
  → capturing 
  → review 
  → uploading 
  → success (or error)
```

### 3. Permission Flow

**Component:** `PermissionsScreen`
**Hook:** `useCameraPermissions`

Process:
1. Check initial permission status on component mount
2. User taps "Grant Permissions"
3. Hook requests camera permission first
4. Then requests media library permission
5. Screen updates with new status
6. User can retry if denied

```typescript
const { 
  cameraPermission,
  mediaLibraryPermission,
  requestCameraPermission,
  requestMediaLibraryPermission 
} = useCameraPermissions();
```

### 4. Guidance
**Component:** `CameraGuideScreen`

Simple informational screen with:
- 4 key positioning/lighting guidelines
- "Start Scan" button → triggers capture state
- "Cancel" button → returns to home

### 5. Camera Capture
**Component:** `CameraCaptureScreen`
**Library:** `expo-camera`

Features:
- Uses `CameraView` from expo-camera
- Real-time camera feed
- SVG overlay for:
  - Hand outline (green rectangle)
  - Landmark points (circles)
- Auto-capture mechanism:
  - Interval-based capture (500ms)
  - Stops after 5 frames
  - Shows progress counter

```typescript
const handleFrameCapture = async (frameUri: string) => {
  const frame: CapturedFrame = {
    uri: frameUri,
    timestamp: Date.now(),
    width: 1080,
    height: 1920,
  };
  
  handScanFlow.addCapturedFrame(frame);
  
  // Try to detect landmarks for real-time feedback
  const landmarks = await handScanFlow.detectLandmarks(frameUri);
  handScanFlow.setLandmarks(landmarks);
};
```

### 6. Frame Review
**Component:** `ReviewScreen`

Features:
- Large frame preview (swappable)
- Thumbnail carousel for all frames
- Frame metadata display
- Upload progress indication
- Actions: Submit, Retake, or error retry

Data displayed:
- Frame dimensions
- Capture timestamp
- Frame count progress

### 7. Success Confirmation
**Component:** `SuccessScreen`

Shows:
- Checkmark icon
- Scan ID (unique identifier)
- Confirmation message
- "Back to Home" button

## State Management

### Zustand Store: handScanStore
**File:** `src/store/handScanStore.ts`

Schema:
```typescript
interface HandScanState {
  // UI state
  state: ScanState;
  setState: (state: ScanState) => void;

  // Camera permissions
  cameraPermissionStatus: 'undetermined' | 'granted' | 'denied';
  setCameraPermissionStatus: (...) => void;

  // Captured frames
  capturedFrames: CapturedFrame[];
  addFrame: (frame: CapturedFrame) => void;
  clearFrames: () => void;

  // Hand landmarks (from device or backend)
  landmarks: Array<{ x, y, z, confidence }>;
  setLandmarks: (...) => void;

  // Device metadata
  deviceMetadata: { cameraType, zoom, flashMode };
  setDeviceMetadata: (...) => void;

  // Error & progress
  error: string | null;
  uploadProgress: number;
  
  // Reset
  reset: () => void;
}
```

### Hook: useHandScanFlow
**File:** `src/hooks/useHandScanFlow.ts`

Provides high-level interface:
```typescript
const {
  // State
  state,
  capturedFrames,
  landmarks,
  error,
  uploadProgress,
  
  // Actions
  setState,
  addCapturedFrame,
  submitScan,
  retakeScan,
  cancelScan,
  detectLandmarks,
} = useHandScanFlow();
```

## API Integration

### Upload Multipart Request
**File:** `src/services/handScanService.ts`

```typescript
async uploadHandScan(
  request: HandScanRequest,
  onUploadProgress?: (progress: number) => void
): Promise<HandScanResponse>
```

Creates FormData:
```typescript
const formData = new FormData();

// Add each frame as a file
request.frames.forEach((frame, index) => {
  formData.append(`frames`, {
    uri: frame.uri,
    name: `frame_${index}_${frame.timestamp}.jpg`,
    type: 'image/jpeg',
  });
});

// Add metadata
formData.append('metadata', JSON.stringify(request.deviceMetadata));
formData.append('timestamp', request.timestamp.toString());
```

### Backend Endpoints

**POST /api/hands/scan**
- Accepts multipart/form-data
- Returns: scan ID, landmarks, success status
- Handles file storage (in production)

**POST /api/hands/detect**
- Accepts single frame image
- Returns: landmarks array
- Used for real-time feedback during capture

## Testing

### Unit Tests
**File:** `src/__tests__/handScanStore.test.ts`

Uses Jest and React Testing Library:
```typescript
// Test state transitions
act(() => {
  result.current.setState('guide');
});
expect(result.current.state).toBe('guide');

// Test frame management
act(() => {
  result.current.addFrame(frame);
});
expect(result.current.capturedFrames).toHaveLength(1);
```

### Manual Testing Checklist
**File:** `QA_CHECKLIST.md`

42 comprehensive test cases covering:
- Permissions flow
- Camera capture
- Frame review
- Upload handling
- Offline scenarios
- Edge cases
- Performance
- Accessibility

## Error Handling Strategy

### Permission Errors
- User denies permission → Stay on permissions screen
- Retry available
- Cancel available

### Capture Errors
- Camera unavailable → Show error, allow retry
- Capture failure → Show error, allow retry
- Insufficient frames → Block submit

### Network Errors
- Offline → Show error, allow retry when online
- Server error (500) → Show error, allow retry
- Timeout → Show error, allow retry
- Validation error (400) → Show error with details

Error flow:
```
submitScan() 
  → catches error 
  → setState('error')
  → setError(message)
  → Shows error screen with retry
```

## Data Flow: Capture to Upload

1. **Capture Phase**
   - User positions hand
   - Taps "Start Capture"
   - 5 frames captured at ~500ms intervals
   - Each frame added to store
   - Landmarks detected for each frame

2. **Review Phase**
   - All frames displayed
   - User can inspect each frame
   - Metadata shown (dimensions, timestamp)
   - Can retake or proceed

3. **Upload Phase**
   - User taps "Submit"
   - State → uploading
   - FormData created with:
     - 5 frames (image files)
     - Device metadata (JSON)
     - Timestamp
   - POST to `/api/hands/scan`
   - Progress tracked
   - Success or error handled

4. **Completion**
   - Success → Show scan ID
   - Error → Show error with retry
   - Reset available

## Performance Optimization

### Frame Capture
- 500ms interval prevents excessive file I/O
- 5 frames total balances quality and speed
- JPEG quality 0.8 (80%) reduces file size

### Upload
- FormData handles large files efficiently
- Progress callback throttled
- Network timeouts configured

### Memory
- Store cleared on reset
- Frames not duplicated in memory
- Large objects not serialized unnecessarily

### Code Splitting
- Components lazy loaded by Expo Router
- Hooks only execute when needed
- Store accessed via hooks (no direct imports)

## Accessibility Features

- Touch target sizes: 44x44 minimum
- Clear visual feedback
- Error messages descriptive
- Color not sole indicator (landmarks use shape + color)
- Text contrast meets WCAG standards

## Browser/Device Support

### Minimum Requirements
- iOS 13+ (for camera permissions)
- Android 5.0+ (API level 21+)
- Camera hardware required

### Testing Platforms
- iPhone 12+ recommended
- Android 10+ recommended
- Emulator supported (requires camera emulation setup)

## Security Considerations

1. **Data**
   - Frames not persisted after upload
   - Metadata minimal
   - No biometric data stored

2. **Network**
   - HTTPS enforced in production
   - No auth headers in samples (add as needed)
   - Timeout protection

3. **Permissions**
   - Only requests needed permissions
   - No background camera access
   - Respects user choices

## Deployment Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Backend running (`pnpm dev:backend`)
- [ ] Tests passing (`npm test`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Type checking passing (`pnpm type-check`)
- [ ] QA checklist reviewed
- [ ] Environment variables set
- [ ] API endpoints verified
- [ ] Error messages reviewed
- [ ] Accessibility checked

## Common Issues & Solutions

### Issue: "expo-camera not found"
**Solution:** Run `pnpm install` in mobile directory

### Issue: "FormData is not defined"
**Solution:** Use native FormData or react-native-document-picker

### Issue: Landmarks not displaying
**Solution:** Check backend is running and `/api/hands/detect` is accessible

### Issue: Permission dialog not appearing
**Solution:** Check permissions already granted or denied in system settings

### Issue: Frames captured but not showing
**Solution:** Verify frame URIs are valid, check camera permissions

## Next Steps for Production

1. **ML Model Integration**
   - Add MediaPipe or TensorFlow Lite for on-device detection
   - Improve landmark accuracy
   - Implement quality scoring

2. **Database Integration**
   - Store scans in database
   - Link scans to user accounts
   - Implement scan history

3. **Advanced Features**
   - Multi-hand detection
   - Gesture recognition
   - 3D hand pose

4. **Performance**
   - Implement video capture instead of frames
   - Add compression
   - Resume upload on failure

5. **Analytics**
   - Track success rates
   - Monitor upload times
   - Log errors for debugging

## References

- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Expo Media Library: https://docs.expo.dev/versions/latest/sdk/media-library/
- React Native Paper: https://callstack.github.io/react-native-paper/
- Zustand: https://github.com/pmndrs/zustand
- FastAPI: https://fastapi.tiangolo.com/
