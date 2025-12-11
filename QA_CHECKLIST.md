# Hand Scan Capture - Manual QA Checklist

## Overview
This document outlines the manual QA test cases and expected behaviors for the hand scan capture feature.

## Test Environment
- Device: iOS/Android (physical device or emulator)
- App Version: Latest development build
- Backend: Running locally or on test server

## Permissions Flow

### TC-001: Camera Permission Request
- **Steps:**
  1. Launch app and navigate to Hand Detection tab
  2. Tap "Start Hand Scan" button
- **Expected:**
  - Permissions screen displays with camera and media library requirements
  - Camera permission status shows as "Not Granted"
  - Media library permission status shows as "Not Granted"

### TC-002: Grant Camera Permissions
- **Steps:**
  1. From permissions screen, tap "Grant Permissions"
  - **Expected (iOS):**
    - System permission dialog appears for camera
    - Tap "Allow"
    - Dialog closes
    - Permissions screen updates to show "✓ Granted" for camera
    
  - **Expected (Android):**
    - System permission dialog appears for camera
    - Tap "Allow"
    - Dialog closes or system permission prompt appears for media library
    - Tap "Allow"
    - Permissions screen updates to show both permissions granted

### TC-003: Deny Camera Permission
- **Steps:**
  1. From permissions screen, tap "Grant Permissions"
  2. Tap "Deny" on system permission dialog
- **Expected:**
  - Permission dialog closes
  - Permissions screen shows camera as "✗ Not Granted"
  - "Grant Permissions" button remains enabled
  - User can retry

### TC-004: Permission Already Granted
- **Steps:**
  1. Allow permissions once
  2. Restart app and navigate to Hand Detection tab
  3. Tap "Start Hand Scan"
- **Expected:**
  - Permissions screen shows both permissions as "✓ Granted"
  - Can proceed directly to guide screen

### TC-005: Cancel at Permissions Screen
- **Steps:**
  1. Open hand scan and reach permissions screen
  2. Tap "Cancel" button
- **Expected:**
  - Hand scan screen closes
  - Returns to Hand Detection tab

## Guidance Screen

### TC-006: View Hand Scan Guide
- **Steps:**
  1. Start hand scan with permissions granted
- **Expected:**
  - Guidance screen displays with 4 key guidelines:
    - Positioning: Place hand at arm's length
    - Lighting: Good lighting needed
    - Hand Position: Keep steady and centered
    - Fingers Visible: All fingertips clear
  - "Start Scan" button is enabled
  - "Cancel" button is visible

### TC-007: Start Capture from Guide
- **Steps:**
  1. On guidance screen, tap "Start Scan"
- **Expected:**
  - Transitions to camera capture screen
  - Camera view is displayed with feed

### TC-008: Cancel from Guide Screen
- **Steps:**
  1. On guidance screen, tap "Cancel"
- **Expected:**
  - Returns to Hand Detection tab
  - Camera resources are released

## Camera Capture Screen

### TC-009: Camera Feed Displays
- **Steps:**
  1. Start scan and proceed to capture screen
- **Expected:**
  - Camera feed displays in real-time
  - Hand outline (green rectangle) is visible
  - Frame counter shows "Frames: 0/5"
  - "Start Capture" button is enabled

### TC-010: Manual Frame Capture
- **Steps:**
  1. Position hand in frame
  2. Tap "Start Capture" button
- **Expected:**
  - Button text changes to "Capturing... X/5" where X increments
  - Camera captures frames automatically every 500ms
  - Frame counter updates (0, 1, 2, 3, 4, 5)
  - Button is disabled during capture

### TC-011: Auto-Complete After 5 Frames
- **Steps:**
  1. Start capture and hold hand steady
  2. Wait for 5 frames to be captured (~3 seconds)
- **Expected:**
  - Frame counter reaches "5/5"
  - Capture automatically stops
  - Transitions to review screen

### TC-012: Hand Landmarks Display (if available)
- **Steps:**
  1. During capture, observe hand position
- **Expected:**
  - If device detects hand landmarks, they display as small circles on screen
  - Circle color indicates confidence:
    - Green: High confidence (>0.8)
    - Amber/Orange: Lower confidence (≤0.8)
  - Outline rectangle adjusts to fit detected hand region

### TC-013: Camera Permission Required
- **Steps:**
  1. Deny camera permission and try to start capture
- **Expected:**
  - Cannot proceed to camera capture screen
  - Remains on guidance screen or shows error

### TC-014: Cancel During Capture
- **Steps:**
  1. Start capture, let it run for 1-2 frames
  2. Tap "Cancel" button
- **Expected:**
  - Capture stops immediately
  - Button becomes enabled again
  - Can retry or proceed with captured frames

### TC-015: Poor Lighting Handling
- **Steps:**
  1. Start capture in very dark environment
- **Expected:**
  - Camera feed is very dark but functional
  - Can still capture (app doesn't prevent it)
  - User sees poor quality on review screen

## Review Screen

### TC-016: Review Screen Displays
- **Steps:**
  1. Complete capturing 5 frames
- **Expected:**
  - Review screen displays with:
    - Large view of first captured frame
    - "Frame 1 of X" indicator below image
    - Thumbnail carousel showing all frames
    - Frame details card showing dimensions and timestamp
    - "Submit Scan" button (enabled)
    - "Retake" button (enabled)

### TC-017: Frame Selection
- **Steps:**
  1. On review screen, tap different frame thumbnails or frame buttons
- **Expected:**
  - Main frame view updates to selected frame
  - Frame counter updates (e.g., "Frame 2 of 5")
  - Frame details update with new dimensions/timestamp

### TC-018: Review Before Submit
- **Steps:**
  1. Review all captured frames
  2. Verify hand visibility and positioning
- **Expected:**
  - All frames are visible
  - Images are clear and properly exposed
  - Hand is visible in all frames
  - Fingers are visible

### TC-019: Retake Scan
- **Steps:**
  1. On review screen, tap "Retake" button
- **Expected:**
  - Returns to guidance screen
  - Previously captured frames are cleared
  - Can start new capture

### TC-020: Submit Scan
- **Steps:**
  1. On review screen, tap "Submit Scan"
- **Expected:**
  - Button is disabled
  - Loading indicator shows "Uploading scan..."
  - Upload progress bar visible (optional)

### TC-021: Frame Details Accuracy
- **Steps:**
  1. On review screen, check frame details
- **Expected:**
  - Dimensions match actual image size
  - Timestamp is reasonable (recent, not future)
  - All frames have unique timestamps (sequential)

## Upload & Success Flow

### TC-022: Successful Upload
- **Steps:**
  1. Submit scan with captured frames
  2. Wait for upload to complete (backend processing)
- **Expected:**
  - Upload completes successfully
  - Success screen displays with:
    - "✓" checkmark icon
    - "Scan Submitted" title
    - Scan ID (e.g., "SCAN-12345678")
    - Confirmation message
  - "Back to Home" button is visible

### TC-023: Upload Progress
- **Steps:**
  1. Submit scan and observe upload
- **Expected (Large files):**
  - Upload progress indicator shows (0% → 100%)
  - Progress is smooth and continuous
  - Completes within reasonable time (< 30 seconds for typical speeds)

### TC-024: Upload Error Handling
- **Steps:**
  1. Submit scan while offline (airplane mode)
  - **Expected:**
    - Upload fails
    - Error screen displays with error message
    - "Try Again" button is available
    - Can retry when connectivity restored
    
- **Steps:**
  2. Submit scan while backend is down
  - **Expected:**
    - Upload fails with appropriate error message
    - User can retry or retake

### TC-025: Network Interruption During Upload
- **Steps:**
  1. Start upload
  2. Toggle airplane mode during upload
- **Expected:**
  - Upload fails gracefully
  - Error screen shows with retry option
  - No app crash or freeze

### TC-026: Success Scan ID Display
- **Steps:**
  1. Successful upload completes
- **Expected:**
  - Scan ID is displayed in special container
  - ID format is recognizable (e.g., SCAN-XXXXX or UUID)
  - User can reference this ID later

### TC-027: Return from Success Screen
- **Steps:**
  1. On success screen, tap "Back to Home"
- **Expected:**
  - Returns to Hand Detection tab
  - Scan state is reset
  - Can initiate new scan

## Offline Handling

### TC-028: Offline Permission Check
- **Steps:**
  1. Enable airplane mode
  2. Open app and start hand scan
- **Expected:**
  - Permissions can still be granted (local operation)
  - Proceeds to guidance screen normally

### TC-029: Offline Capture
- **Steps:**
  1. Enable airplane mode
  2. Complete hand scan capture to review screen
- **Expected:**
  - Camera capture works normally (no network needed)
  - Review screen displays captured frames
  - Submit button is visible

### TC-030: Offline Submit Attempt
- **Steps:**
  1. Airplane mode enabled
  2. Try to submit scan
- **Expected:**
  - Upload fails immediately or after timeout
  - Error message: "Network error" or similar
  - "Try Again" button available
  - Can disable airplane mode and retry

### TC-031: Offline → Online Transition
- **Steps:**
  1. Enable airplane mode and attempt upload
  2. Disable airplane mode while error screen showing
  3. Tap "Try Again"
- **Expected:**
  - Upload retries with new connectivity
  - Succeeds if backend available
  - Shows success screen on completion

## Edge Cases

### TC-032: Rapid Permission Toggle
- **Steps:**
  1. Grant permissions
  2. Quickly deny and grant again
- **Expected:**
  - App handles state correctly
  - No crashes or inconsistent state

### TC-033: Orientation Change During Capture
- **Steps:**
  1. Start capture
  2. Rotate device during capture
- **Expected (Portrait focus):**
  - App maintains portrait orientation
  - Capture continues smoothly
  - No frame loss

### TC-034: Background/Foreground Transition
- **Steps:**
  1. Start capture
  2. Press home button
  3. Return to app
- **Expected:**
  - Camera pauses when backgrounded
  - Resumes when app returns to foreground
  - Previous state maintained

### TC-035: Memory Pressure
- **Steps:**
  1. Capture multiple frames with large file sizes
  2. Monitor memory usage
- **Expected:**
  - App manages memory efficiently
  - No crashes due to memory pressure
  - Upload completes successfully

### TC-036: Large Frame Files
- **Steps:**
  1. Capture frames at high resolution
  2. Submit scan
- **Expected:**
  - Upload completes successfully
  - Takes longer but completes
  - Large file handling is efficient

## Performance Metrics

### TC-037: Frame Capture Performance
- **Expected:**
  - Frame capture should occur every ~500ms
  - Actual timing: 450-550ms per frame
  - No dropped frames

### TC-038: Upload Performance
- **Expected:**
  - Upload speed varies with network
  - Typical: 500KB-2MB per second
  - 5 frames (~2-5MB total): 5-30 seconds typical
  - Shows progress to user

### TC-039: UI Responsiveness
- **Expected:**
  - All button taps respond immediately
  - No UI freezing
  - Smooth transitions between screens
  - Animations are fluid

## Accessibility

### TC-040: Touch Target Sizes
- **Expected:**
  - All buttons are at least 44x44 points
  - Easy to tap on phone devices
  - No accidental taps needed to retry

### TC-041: Text Readability
- **Expected:**
  - Text is legible on all screen sizes
  - Sufficient contrast ratios
  - No text overflow issues

### TC-042: Error Messages
- **Expected:**
  - Error messages are clear and actionable
  - User knows what went wrong
  - Recovery path is obvious

## Summary
- **Total Test Cases:** 42
- **Priority:**
  - Critical: TC-001, TC-002, TC-009, TC-020, TC-022
  - High: TC-006, TC-010, TC-016, TC-024, TC-030
  - Medium: TC-003, TC-007, TC-012, TC-019, TC-031
  - Low: TC-035, TC-037, TC-040

## Sign-Off
- QA Engineer: ____________________ Date: __________
- Product Owner: ____________________ Date: __________
- Release Manager: ____________________ Date: __________
