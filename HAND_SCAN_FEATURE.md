# Hand Scan Capture Feature

## Overview

The Hand Scan Capture feature enables users to capture high-quality hand scans using their device camera. The feature provides a guided workflow with real-time visual feedback, frame validation, and optimized upload handling.

## Features

### 1. Permission Management
- Requests camera and media library permissions
- Clear permission status display
- Graceful handling of denied permissions
- Works offline (permission requests don't require network)

### 2. Guidance Screen
- Visual guidelines for proper hand positioning
- Tips for optimal lighting and visibility
- Preparation before capturing

### 3. Camera Capture
- Real-time camera feed with hand detection outline
- Visual landmark display (finger position indicators)
- Automatic frame capture (~500ms intervals)
- Confidence-based landmark visualization
- Captures 5 frames automatically
- Manual capture controls

### 4. Frame Review
- Large preview of selected frame
- Thumbnail carousel for quick frame selection
- Frame-by-frame inspection
- Frame metadata display (dimensions, timestamp)
- Retake or submit options

### 5. Upload & Processing
- Multipart/form-data upload with device metadata
- Upload progress tracking
- Error handling with retry capability
- Success confirmation with scan ID

### 6. Offline Support
- Permissions: ✅ Works offline
- Capture: ✅ Works offline
- Upload: ❌ Requires network
- Error handling for offline scenarios

## Architecture

### State Management (Zustand)

The feature uses a Zustand store for state management:

```typescript
type ScanState = 
  | 'idle'
  | 'permissions-check'
  | 'guide'
  | 'capturing'
  | 'processing'
  | 'review'
  | 'uploading'
  | 'success'
  | 'error';
```

**Store Location:** `src/store/handScanStore.ts`

### Components

#### PermissionsScreen
- Location: `src/components/PermissionsScreen.tsx`
- Displays permission status
- Triggers permission requests
- Allows user to grant or cancel

#### CameraGuideScreen
- Location: `src/components/CameraGuideScreen.tsx`
- Shows 4 key guidelines
- Starts capture or cancels

#### CameraCaptureScreen
- Location: `src/components/CameraCaptureScreen.tsx`
- Live camera feed using `expo-camera`
- Real-time hand outline overlay (SVG)
- Landmark visualization
- Automatic frame capture
- Progress counter

#### ReviewScreen
- Location: `src/components/ReviewScreen.tsx`
- Frame preview and thumbnails
- Frame details display
- Submit or retake options
- Loading state during upload

#### SuccessScreen
- Location: `src/components/SuccessScreen.tsx`
- Confirmation message
- Scan ID display
- Return to home option

### Hooks

#### useHandScanFlow
- Location: `src/hooks/useHandScanFlow.ts`
- High-level workflow orchestration
- State transitions
- API calls
- Error handling

#### useCameraPermissions
- Location: `src/hooks/useCameraPermissions.ts`
- Permission request handling
- Permission status tracking
- Supports both iOS and Android

### Services

#### handScanService
- Location: `src/services/handScanService.ts`
- `uploadHandScan()` - Submit frames and metadata
- `detectLandmarks()` - Get landmarks for a frame
- Handles multipart/form-data requests
- Upload progress tracking

## API Endpoints

### POST /api/hands/scan

Submit captured frames for processing.

**Request:**
- Multipart form-data with:
  - `frames`: Array of image files
  - `metadata`: JSON string with device metadata
  - `timestamp`: Unix timestamp

**Response:**
```json
{
  "success": true,
  "scan_id": "scan_abc123def456",
  "landmarks": [
    {"x": 0.5, "y": 0.4, "z": 0.0, "confidence": 0.95},
    {"x": 0.52, "y": 0.42, "z": 0.01, "confidence": 0.92}
  ],
  "message": "Hand scan submitted successfully"
}
```

### POST /api/hands/detect

Get landmarks for a single frame (used during capture for real-time feedback).

**Request:**
- Multipart form-data with:
  - `frame`: Single image file

**Response:**
```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.4, "z": 0.0, "confidence": 0.95},
    {"x": 0.52, "y": 0.42, "z": 0.01, "confidence": 0.92}
  ]
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Hand Detection Tab - "Start Hand Scan"                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Permissions Screen     │
        │ (Permission Check)     │
        └────────────┬───────────┘
                     │
        ┌────────────↓───────────┐
        │ YES - Grant?           │
        └────────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Camera Guide Screen    │
        └────────────┬───────────┘
                     │
        ┌────────────↓───────────┐
        │ YES - Start?           │
        └────────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Camera Capture         │
        │ (Capturing ~5 frames)  │
        └────────────┬───────────┘
                     │ (5 frames captured)
                     ↓
        ┌────────────────────────┐
        │ Review Screen          │
        │ (Frame inspection)     │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   YES - Retake?           NO - Submit?
        │                         │
        ↓                         ↓
   (back to guide)     ┌──────────────────────┐
                       │ Uploading            │
                       │ (POST /hands/scan)   │
                       └──────────┬───────────┘
                                  │
                    ┌─────────────┴────────────┐
                    │                         │
              SUCCESS          ERROR/OFFLINE
                    │                         │
                    ↓                         ↓
          ┌──────────────────┐   ┌───────────────────┐
          │ Success Screen   │   │ Error Screen      │
          │ (Show Scan ID)   │   │ (Retry option)    │
          └──────────────────┘   └───────────────────┘
                    │                         │
                    └──────────┬──────────────┘
                               │
                               ↓
                    ┌──────────────────┐
                    │ Back to Home     │
                    │ (Hand Detection) │
                    └──────────────────┘
```

## UI State Machine States

### idle
Initial state. User hasn't started hand scan.

### permissions-check
Checking and requesting camera/media library permissions.

### guide
Showing guidance screen before capture.

### capturing
Active camera capture phase. Frames being captured automatically.

### processing
Post-capture processing (landmark detection, compression).

### review
Showing captured frames for review before upload.

### uploading
Frames being uploaded to backend.

### success
Scan successfully uploaded. Showing confirmation.

### error
Error occurred during capture or upload. Showing error screen.

## Testing

### Unit Tests
Location: `src/__tests__/handScanStore.test.ts`

Tests cover:
- State transitions
- Frame capture and management
- Landmark handling
- Device metadata
- Error handling
- Upload progress
- Permission management
- Reset functionality

Run tests:
```bash
npm test -- handScanStore.test.ts
```

### Manual QA Checklist
Location: `QA_CHECKLIST.md`

Covers:
- 42 test cases
- Permissions flow
- Camera capture
- Frame review
- Upload handling
- Offline scenarios
- Edge cases
- Performance metrics
- Accessibility

## Integration with Hand Detection Tab

The feature is integrated into the existing Hand Detection tab:

```typescript
// apps/mobile/src/app/(tabs)/hand-detection.tsx
<Button onPress={handleStartScan}>
  Start Hand Scan
</Button>
```

This navigates to `/hand-scan` route which is a separate screen.

## Environment Variables

No additional environment variables required. Uses existing `EXPO_PUBLIC_API_URL` for backend communication.

## Performance Considerations

### Frame Capture
- Interval: ~500ms between frames
- Quality: 0.8 (80% JPEG quality)
- Target: 5 frames in ~3 seconds

### Upload
- Supports multiple concurrent uploads
- Progress tracking
- Handles large files gracefully
- Typical: 2-5MB payload per scan

### Memory
- Frames stored in Zustand store
- Cleared on reset
- Efficient cleanup on component unmount

## Error Handling

### Camera Errors
- Permission denied → Show permissions screen
- Camera unavailable → Show error with retry
- Capture failure → Show error, allow retry

### Network Errors
- Offline → Graceful error, allow retry when online
- Server error → Show error message with retry
- Timeout → Show timeout error, allow retry

### User Errors
- Insufficient frames → Block submit
- Poor frame quality → Warn but allow submit
- Device memory low → Show warning

## Security Considerations

- No sensitive data stored locally
- Frames deleted after successful upload
- Device metadata minimal (camera type, zoom, flash)
- Upload over HTTPS (configured by API client)
- No biometric data directly exposed

## Future Enhancements

1. **ML Model Integration**
   - On-device hand detection (MediaPipe or similar)
   - Real-time pose estimation
   - Confidence-based frame quality assessment

2. **Advanced Features**
   - Hand 3D pose estimation
   - Multi-hand detection
   - Gesture recognition
   - Real-time feedback on hand positioning

3. **Optimization**
   - Frame compression
   - Batch upload API
   - Incremental uploads
   - Resume on failure

4. **User Experience**
   - Video capture instead of frames
   - Custom capture duration
   - Retake guidance
   - Hand detection heatmap

## Troubleshooting

### Camera Not Starting
1. Check permissions in system settings
2. Restart app
3. Restart device
4. Check camera hardware

### Upload Failures
1. Check network connectivity
2. Verify backend is running
3. Check file size limits
4. Try again

### Poor Frame Quality
1. Improve lighting
2. Hold hand steadier
3. Position hand in frame center
4. Retake scan

### Landmarks Not Showing
1. Hand may be out of frame
2. Poor lighting conditions
3. Hand occluded or at wrong angle
4. Device running on older OS

## Support

For issues or questions about the Hand Scan feature, check:
1. QA_CHECKLIST.md for known behaviors
2. Component source code for implementation details
3. Test files for expected behavior
4. Backend logs for upload issues
