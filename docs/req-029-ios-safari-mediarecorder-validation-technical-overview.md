# REQ-029: iOS Safari MediaRecorder API Compatibility Validation - Technical Overview

**Document Created**: 2025-12-30 14:08
**Last Modified**: 2025-12-30 14:08
**Request Reference**: REQ-029 in `/docs/gen_requests.md`
**Implementation Plan Reference**: `/docs/prd/item-capture-implementation-plan.md`

---

## Purpose

This document outlines the technical approach for validating MediaRecorder API compatibility on iOS Safari before implementing video recording features in the ItemCapture component. The spike prevents wasted development effort by confirming technical feasibility early.

---

## Executive Summary

The MediaRecorder API has a complex history on iOS Safari:

| iOS Version | MediaRecorder Status | Notes |
|-------------|---------------------|-------|
| iOS 14.2 and earlier | Not supported | No video recording capability |
| iOS 14.3 - 14.8 | Partial support | Limited codec support, stability issues |
| iOS 15.x | Supported | More stable, improved codec support |
| iOS 16.x | Supported | Better performance, additional codecs |
| iOS 17.x | Supported | Most reliable, broader codec compatibility |

**Critical validation required**: While support exists on paper, real-world behavior on iOS Safari can differ significantly from desktop browsers. This spike confirms actual functionality.

---

## Technical Approach

### Phase 1: Test Page Development (60 minutes)

**Objective**: Create a minimal, self-contained HTML page that exercises the MediaRecorder API.

**Test Page Requirements**:

1. **Camera Access**
   - Request getUserMedia with video constraints
   - Handle permission grant and denial gracefully
   - Display live camera preview

2. **Recording Controls**
   - Start recording button
   - Stop recording button
   - Recording duration timer (target: 30 seconds)

3. **Camera Switching**
   - Toggle between front (facingMode: "user") and back (facingMode: "environment") cameras
   - Test switching during active recording

4. **Playback Verification**
   - Display recorded video in a video element
   - Confirm playback works natively in Safari

5. **Diagnostic Output**
   - Display detected codecs
   - Show actual MIME type used
   - Report any errors encountered
   - Log blob size after recording

**Test Page Location**: `/public/test/ios-mediarecorder.html`

**Test Page Structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iOS Safari MediaRecorder Test</title>
    <style>
        /* Mobile-optimized styling */
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .container { max-width: 100%; padding: 16px; }
        video { width: 100%; max-height: 50vh; background: #000; }
        button { padding: 12px 24px; margin: 8px; font-size: 16px; }
        .log { background: #f5f5f5; padding: 12px; font-family: monospace; font-size: 12px; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <!-- Test interface elements -->
</body>
</html>
```

---

### Phase 2: Codec Detection and Testing (45 minutes)

**Objective**: Identify which codec/container combinations work on each iOS version.

**Codecs to Test**:

| Priority | MIME Type | Codec | Expected iOS Support |
|----------|-----------|-------|---------------------|
| 1 | video/mp4 | H.264 (AVC) | Best compatibility |
| 2 | video/webm | VP8 | Limited on iOS |
| 3 | video/webm | VP9 | Limited on iOS |
| 4 | video/mp4 | HEVC (H.265) | iOS 16+ potentially |

**Detection Method**:

```javascript
function detectSupportedCodecs() {
    const codecs = [
        'video/mp4; codecs="avc1.42E01E"',   // H.264 Baseline
        'video/mp4; codecs="avc1.4D401E"',   // H.264 Main
        'video/mp4; codecs="avc1.64001E"',   // H.264 High
        'video/webm; codecs="vp8"',          // VP8
        'video/webm; codecs="vp9"',          // VP9
        'video/mp4',                          // Generic MP4
        'video/webm',                         // Generic WebM
    ];

    const supported = [];
    codecs.forEach(codec => {
        if (MediaRecorder.isTypeSupported(codec)) {
            supported.push(codec);
        }
    });

    return supported;
}
```

**Fallback Strategy**:

1. Attempt preferred codec (MP4 with H.264)
2. Fall back to generic MP4 if specific codec fails
3. Fall back to browser default if MP4 fails
4. Report if no recording is possible

---

### Phase 3: Device Testing Matrix (90 minutes)

**Objective**: Execute test page on real iOS devices across versions.

**Required Test Devices**:

| Device Type | iOS Version | Priority | Notes |
|-------------|-------------|----------|-------|
| iPhone | iOS 15.x | High | Oldest supported version for this feature |
| iPhone | iOS 16.x | High | Mid-range support validation |
| iPhone | iOS 17.x | High | Latest version validation |
| iPad | iOS 15+ | Medium | Tablet-specific behavior |

**Testing Checklist Per Device**:

- [ ] Page loads without JavaScript errors
- [ ] Camera permission prompt appears
- [ ] Camera preview displays after permission granted
- [ ] Start recording button works
- [ ] 30-second recording completes without crash
- [ ] Stop recording produces a playable blob
- [ ] Video plays back in the page
- [ ] Front camera works
- [ ] Back camera works
- [ ] Camera switch during recording (if supported)
- [ ] Audio is captured with video
- [ ] Multiple consecutive recordings work
- [ ] Large recording (2 minutes) works
- [ ] Low storage scenario handling

**Test Access Options**:

1. **Physical devices** (preferred)
   - Most accurate results
   - Required for final validation

2. **BrowserStack or Sauce Labs** (fallback)
   - Remote real device testing
   - Useful for version coverage

3. **Xcode Simulator** (not recommended)
   - Camera APIs behave differently
   - Not valid for MediaRecorder testing

---

### Phase 4: Permission Flow Documentation (30 minutes)

**Objective**: Document iOS-specific permission behaviors.

**Permission Scenarios to Document**:

1. **First-time permission request**
   - System prompt appearance
   - User interface behavior
   - Timing considerations

2. **Permission previously granted**
   - Immediate access behavior
   - Session persistence

3. **Permission previously denied**
   - Error handling requirements
   - User guidance for Settings navigation

4. **Permission revoked mid-session**
   - Stream termination behavior
   - Error recovery

**iOS-Specific Considerations**:

| Behavior | Notes |
|----------|-------|
| Safari requires user gesture | Cannot auto-start recording on page load |
| Camera preview may pause in background | Handle visibility change events |
| Audio permission is separate | Request with video for video+audio recording |
| Settings navigation | Deep link to Settings not possible in web |

---

### Phase 5: Findings Documentation (45 minutes)

**Objective**: Produce comprehensive documentation of results.

**Documentation Deliverables**:

1. **Compatibility Matrix**
   - Device/version/codec support table
   - Pass/fail for each acceptance criterion

2. **Implementation Recommendations**
   - Proceed, proceed with workarounds, or abandon
   - Specific code patterns that work
   - Specific patterns to avoid

3. **Fallback Strategy Document**
   - Photo-only mode specification
   - Alternative library evaluation (if needed)
   - Native app consideration (if web is not viable)

---

## Test Page Implementation

### Core JavaScript Structure

```javascript
class iOSMediaRecorderTest {
    constructor() {
        this.stream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.currentCamera = 'user'; // 'user' or 'environment'
    }

    async initialize() {
        // Check API availability
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.logError('getUserMedia not supported');
            return false;
        }

        if (typeof MediaRecorder === 'undefined') {
            this.logError('MediaRecorder not supported');
            return false;
        }

        this.logSuccess('APIs available');
        this.detectCodecs();
        return true;
    }

    detectCodecs() {
        const codecs = [
            'video/mp4; codecs="avc1.42E01E"',
            'video/mp4; codecs="avc1.4D401E"',
            'video/mp4',
            'video/webm; codecs="vp8"',
            'video/webm',
        ];

        codecs.forEach(codec => {
            const supported = MediaRecorder.isTypeSupported(codec);
            this.log(`${codec}: ${supported ? 'YES' : 'NO'}`, supported);
        });
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: true
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.logSuccess('Camera access granted');
            return this.stream;
        } catch (error) {
            this.logError(`Camera error: ${error.name} - ${error.message}`);
            return null;
        }
    }

    async startRecording() {
        if (!this.stream) {
            this.logError('No stream available');
            return;
        }

        this.recordedChunks = [];

        // Try codecs in order of preference
        const mimeTypes = [
            'video/mp4',
            'video/webm',
            ''  // Default
        ];

        let options = {};
        for (const mimeType of mimeTypes) {
            if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
                options = mimeType ? { mimeType } : {};
                break;
            }
        }

        try {
            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.log(`Recording with: ${this.mediaRecorder.mimeType || 'default'}`);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => this.handleRecordingStop();
            this.mediaRecorder.onerror = (e) => this.logError(`Recording error: ${e.error}`);

            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            this.logSuccess('Recording started');
        } catch (error) {
            this.logError(`Failed to start recording: ${error.message}`);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.logSuccess('Recording stopped');
        }
    }

    handleRecordingStop() {
        const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder.mimeType || 'video/mp4'
        });

        this.log(`Blob created: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        this.log(`Blob type: ${blob.type}`);

        // Create playback URL
        const url = URL.createObjectURL(blob);
        this.playRecording(url);
    }

    async switchCamera() {
        this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';

        // Stop current stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        // Restart with new camera
        await this.startCamera();
        this.logSuccess(`Switched to ${this.currentCamera} camera`);
    }

    log(message, isSuccess = null) {
        // Logging implementation
    }

    logSuccess(message) {
        this.log(message, true);
    }

    logError(message) {
        this.log(message, false);
    }

    playRecording(url) {
        // Playback implementation
    }
}
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| iOS 15 has critical bugs | Medium | High | Document bugs; recommend iOS 16+ minimum |
| No reliable codec works | Low | Critical | Pivot to photo-only mode on iOS |
| Camera switching fails during recording | High | Medium | Stop recording before switch; document limitation |
| Audio desync issues | Medium | Medium | Test audio separately; document sync requirements |
| Memory pressure on long recordings | Medium | High | Test 2-minute recordings; set hard limits |

---

## Fallback Strategies

If MediaRecorder is not viable on iOS Safari, consider these alternatives in order of preference:

### Option A: Photo-Only Mode for iOS

**Implementation**:
- Detect iOS Safari
- Disable video recording option
- Offer enhanced photo capture (burst mode, multi-photo)
- Document limitation in user-facing UI

**Pros**: Simple, reliable, no dependencies
**Cons**: Reduced feature parity with Android/desktop

### Option B: Third-Party Recording Library

**Candidates**:
- RecordRTC (may have iOS patches)
- MediaStreamRecorder (wrapper with fallbacks)

**Evaluation Criteria**:
- iOS Safari support documented
- Active maintenance
- Bundle size acceptable

### Option C: Server-Side Recording

**Implementation**:
- Stream video to server via WebRTC
- Server performs recording
- Return recorded file to client

**Pros**: Bypasses client-side API issues
**Cons**: Requires network; increased complexity; server costs

### Option D: Progressive Web App / Native App

**Implementation**:
- Build native iOS app for video capture
- Web app links to native for recording
- Return media via deep links

**Pros**: Full iOS capability access
**Cons**: App Store deployment; maintenance burden

---

## Deliverables

### 1. Test Page

Location: `/public/test/ios-mediarecorder.html`

Contents:
- Self-contained HTML/CSS/JavaScript
- No external dependencies
- Mobile-optimized interface
- Comprehensive diagnostic output

### 2. Compatibility Report

Location: `/docs/req-029-ios-safari-compatibility-report.md`

Contents:
- Device/version matrix with test results
- Codec support by iOS version
- Permission behavior documentation
- Known issues and workarounds
- Screenshots from each tested device

### 3. Implementation Recommendation

Location: Appended to compatibility report

Contents:
- Go/No-Go decision for MediaRecorder
- Recommended minimum iOS version
- Required codec configuration
- Fallback strategy selection
- Impact on Phase 2 timeline

---

## Success Criteria Summary

| Criterion | Measurement Method | Pass Threshold |
|-----------|-------------------|----------------|
| Test page created | File exists at specified path | Binary |
| iOS 15 tested | Documented test results | Any device running iOS 15.x |
| iOS 16 tested | Documented test results | Any device running iOS 16.x |
| iOS 17 tested | Documented test results | Any device running iOS 17.x |
| iPad tested | Documented test results | Any iPad with iOS 15+ |
| Codec documentation | Matrix in report | All tested codecs documented |
| Permission documentation | Section in report | All scenarios documented |
| 30-second recording | Video playback verified | Works on at least iOS 16+ |
| Camera switching | Documented behavior | Behavior documented (pass or limitation) |
| Recommendation provided | Written decision | Clear proceed/fallback guidance |

---

## Estimated Effort Breakdown

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1: Test Page Development | 60 min | Core implementation |
| Phase 2: Codec Detection | 45 min | Testing and logging |
| Phase 3: Device Testing | 90 min | Requires device access |
| Phase 4: Permission Documentation | 30 min | Parallel with testing |
| Phase 5: Findings Documentation | 45 min | Report writing |
| **Total** | **4.5 hours** | Slightly over timebox; prioritize device testing |

**Recommended timebox adjustment**: If device testing takes longer than expected, reduce documentation depth and focus on critical findings.

---

## References

- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [getUserMedia API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Can I Use: MediaRecorder](https://caniuse.com/mediarecorder)
- [WebKit Bug Tracker - MediaRecorder](https://bugs.webkit.org/buglist.cgi?quicksearch=mediarecorder)
- [Safari Release Notes](https://developer.apple.com/documentation/safari-release-notes)
- [Item Capture Implementation Plan](/docs/prd/item-capture-implementation-plan.md)

---

## Appendix A: iOS Safari Detection

```javascript
function isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
    return isIOS && isSafari;
}

function getIOSVersion() {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
        return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3] || 0, 10)
        };
    }
    return null;
}
```

---

## Appendix B: Diagnostic Output Template

The test page should output data in this format for easy copy-paste into the report:

```
=== iOS Safari MediaRecorder Test Results ===
Date: [auto-generated]
User Agent: [auto-detected]
iOS Version: [auto-detected]
Device Type: [iPhone/iPad]

=== API Support ===
navigator.mediaDevices: [YES/NO]
MediaRecorder: [YES/NO]

=== Codec Support ===
video/mp4: [YES/NO]
video/mp4; codecs="avc1.42E01E": [YES/NO]
video/mp4; codecs="avc1.4D401E": [YES/NO]
video/webm: [YES/NO]
video/webm; codecs="vp8": [YES/NO]

=== Camera Tests ===
Front camera access: [PASS/FAIL]
Back camera access: [PASS/FAIL]
Camera switching: [PASS/FAIL/NOT TESTED]

=== Recording Tests ===
30-second recording: [PASS/FAIL]
Blob created: [YES/NO] ([size] bytes)
Blob MIME type: [detected type]
Playback works: [PASS/FAIL]
Audio present: [YES/NO]

=== Errors Encountered ===
[List of any errors]

=== Additional Notes ===
[Tester observations]
```

---

*End of Technical Overview*
