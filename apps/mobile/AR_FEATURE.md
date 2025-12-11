# AR Hand Viewing Experience

## Overview

This feature provides a partner-side AR experience that allows users to view and interact with a received 3D hand model in augmented reality. Users can visualize the hand aligned with their palm, interact with it through gestures, and receive haptic feedback.

## Features

### 1. 3D Hand Model Display

- Loads GLB hand models from remote URLs
- Caches models locally for performance
- Displays hand in 3D space using Three.js
- Smooth rendering with WebGL via expo-gl

### 2. AR Plane Detection

- Detects flat surfaces (tables, floors) for hand placement
- Visual indicator when surface is detected
- Anchors hand model to detected plane

### 3. Gesture Controls

- **Pinch**: Scale the hand model
- **Drag**: Move the hand position
- **Rotate**: Rotate the hand with two fingers

### 4. Joint Markers

- Visual markers on each hand joint
- Glow effect when joint is active (partner squeezes)
- Pulsing animation for active joints
- Configurable marker size

### 5. Haptic Feedback

- Proximity-based haptic feedback
- Triggers when hand approaches detected palm
- Intensity scales with proximity
- Configurable sensitivity and threshold

### 6. Calibration Wizard

- Step-by-step setup guide
- Surface detection validation
- Hand alignment instructions
- Haptic feedback testing
- Settings customization

## Architecture

### State Management (`arStore.ts`)

- Zustand store for AR state
- Hand model data and transforms
- Joint activation states
- Calibration settings
- Haptic timing

### Services

#### `glbLoader.ts`

- Downloads GLB models from URLs
- Caches models locally
- Loads models into Three.js scene
- Extracts joint information

#### `hapticService.ts`

- Manages haptic feedback
- Multiple feedback types (light, medium, heavy, success, etc.)
- Rate limiting to prevent spam
- Proximity-based feedback

### Components

#### `ARScene.tsx`

- WebGL rendering via expo-gl
- Three.js scene setup
- Hand model rendering
- Joint marker management
- Proximity detection

#### `CalibrationWizard.tsx`

- Multi-step calibration flow
- Progress tracking
- Interactive guidance
- Settings configuration

#### `ar-hand.tsx` (Screen)

- Main AR view screen
- Camera integration
- Gesture handling
- UI overlays and controls

## Usage

### Basic Setup

1. Navigate to the "AR View" tab
2. Grant camera permissions when prompted
3. Start the calibration wizard
4. Follow the on-screen instructions

### Calibration Steps

1. **Welcome**: Introduction to the feature
2. **Plane Detection**: Point camera at a flat surface
3. **Hand Alignment**: Adjust hand position and scale
4. **Haptic Test**: Test and adjust haptic feedback
5. **Complete**: Finish calibration

### Interaction

- **View Hand**: Point camera at a flat surface
- **Scale**: Pinch to zoom in/out
- **Move**: Drag with one finger
- **Rotate**: Rotate with two fingers
- **Feel Touch**: Bring your palm close to the virtual hand

## Configuration

### Calibration Settings

```typescript
{
  sensitivity: number; // 0.0 - 1.0
  hapticIntensity: number; // 0.0 - 1.0
  proximityThreshold: number; // Distance in meters
  markerSize: number; // Size of joint markers
  autoAlign: boolean; // Auto-align to palm
}
```

### Default Values

- Sensitivity: 0.5
- Haptic Intensity: 0.8
- Proximity Threshold: 0.05m (5cm)
- Marker Size: 0.02m (2cm)
- Auto Align: true

## Testing

### Unit Tests

Run tests with:

```bash
pnpm test
```

### Test Coverage

- **arStore.test.ts**: State management
- **hapticService.test.ts**: Haptic feedback
- **glbLoader.test.ts**: Model loading
- **ar-integration.test.ts**: Integration tests

### Test Scenarios

✓ GLB loading and display
✓ Plane detection and anchoring
✓ Haptic feedback on proximity
✓ Joint marker activation
✓ Gesture controls (pinch, drag, rotate)
✓ Calibration workflow

## Dependencies

### Core

- `expo-gl`: WebGL rendering
- `expo-three`: Three.js for Expo
- `three`: 3D graphics library
- `expo-camera`: Camera access
- `expo-haptics`: Haptic feedback
- `expo-file-system`: File downloads

### UI

- `react-native-gesture-handler`: Gesture recognition
- `react-native-paper`: Material Design components

## Permissions

### iOS

- Camera: NSCameraUsageDescription

### Android

- Camera: CAMERA permission

## Performance Considerations

1. **Model Caching**: GLB files are cached locally after first download
2. **Rate Limiting**: Haptic feedback is rate-limited to prevent spam
3. **Efficient Rendering**: Uses requestAnimationFrame for smooth animation
4. **Lazy Loading**: Models loaded on-demand

## Future Enhancements

- [ ] Real ARKit/ARCore integration for better plane detection
- [ ] Hand tracking for automatic alignment
- [ ] Multi-hand support
- [ ] Custom model uploads
- [ ] Recording and playback of interactions
- [ ] Social sharing of AR experiences

## Troubleshooting

### Camera Permission Denied

- Go to device settings
- Enable camera permission for the app

### Model Not Loading

- Check internet connection
- Verify GLB URL is accessible
- Clear app cache and retry

### Haptics Not Working

- Check device haptic support
- Adjust haptic intensity in settings
- Test with calibration wizard

### Poor Performance

- Reduce marker count
- Lower model complexity
- Close background apps

## API Integration

To integrate with backend hand models:

```typescript
// Fetch hand model from API
const response = await apiClient.get('/hand-models/latest');

// Set in AR store
useARStore.getState().setHandModel({
  id: response.data.id,
  glbUrl: response.data.glbUrl,
  joints: response.data.joints,
  scale: 0.1,
  position: [0, -0.1, 0],
  rotation: [0, 0, 0],
});
```

## Contact

For questions or issues with the AR feature, please contact the development team.
