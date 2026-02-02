/* eslint-disable react/no-unescaped-entities */
/**
 * CameraPreview Test Page
 *
 * Manual testing page for the CameraPreview component.
 * Tests all states: loading, error, active, mirror mode, compact mode.
 *
 * @module test/camera-preview
 * @lastModified 2025-12-31 (REQ-037)
 */

'use client';

import { useState, useCallback } from 'react';
import { CameraPreview, useMediaCapture } from '@/components/ItemCapture';
import type { MediaCaptureError } from '@/components/ItemCapture';

export default function CameraPreviewTestPage() {
  const [isMirrored, setIsMirrored] = useState(true);
  const [compact, setCompact] = useState(false);
  const [customAspectRatio, setCustomAspectRatio] = useState(16 / 9);
  const [showMockError, setShowMockError] = useState(false);
  const [mockErrorType, setMockErrorType] = useState<
    'PERMISSION_DENIED' | 'NO_DEVICE_FOUND' | 'DEVICE_IN_USE' | 'BROWSER_NOT_SUPPORTED' | 'STREAM_ERROR'
  >('PERMISSION_DENIED');

  const {
    stream,
    isCameraActive,
    facingMode,
    error: realError,
    startCamera,
    stopCamera,
    clearError,
    permissionStatus,
    capabilities,
  } = useMediaCapture({ debug: true });

  const [isLoading, setIsLoading] = useState(false);

  const handleStartCamera = useCallback(async () => {
    setIsLoading(true);
    setShowMockError(false);
    await startCamera();
    setIsLoading(false);
  }, [startCamera]);

  const handleStopCamera = useCallback(() => {
    stopCamera();
    setIsLoading(false);
  }, [stopCamera]);

  const handleRetry = useCallback(() => {
    clearError();
    setShowMockError(false);
    handleStartCamera();
  }, [clearError, handleStartCamera]);

  const handleOpenSettings = useCallback(() => {
    alert('In a real app, this would open browser/device settings or show instructions.');
  }, []);

  // Mock errors for testing UI states
  const mockErrors: Record<string, MediaCaptureError> = {
    PERMISSION_DENIED: {
      code: 'PERMISSION_DENIED',
      message: 'Camera access was denied. Please allow camera permissions in your browser settings.',
      action: 'Go to your browser settings and enable camera permissions for this site.',
      recoverable: true,
    },
    NO_DEVICE_FOUND: {
      code: 'NO_DEVICE_FOUND',
      message: 'No camera was found on your device.',
      action: 'Connect a camera or use a device with a built-in camera.',
      recoverable: false,
    },
    DEVICE_IN_USE: {
      code: 'DEVICE_IN_USE',
      message: 'Your camera is being used by another application.',
      action: 'Close other apps that might be using the camera and try again.',
      recoverable: true,
    },
    BROWSER_NOT_SUPPORTED: {
      code: 'BROWSER_NOT_SUPPORTED',
      message: 'Your browser does not support camera access.',
      action: 'Please use a modern browser like Chrome, Firefox, or Safari.',
      recoverable: false,
    },
    STREAM_ERROR: {
      code: 'STREAM_ERROR',
      message: 'An error occurred while accessing the camera stream.',
      action: 'Please try again or restart your browser.',
      recoverable: true,
    },
  };

  const activeError = showMockError ? mockErrors[mockErrorType] : realError;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          CameraPreview Component Test
        </h1>

        {/* Browser Capabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Browser Capabilities
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Supported: {capabilities.isSupported ? '✅ Yes' : '❌ No'}</p>
            <p>MediaDevices: {capabilities.hasMediaDevices ? '✅' : '❌'}</p>
            <p>getUserMedia: {capabilities.hasGetUserMedia ? '✅' : '❌'}</p>
            <p>MediaRecorder: {capabilities.hasMediaRecorder ? '✅' : '❌'}</p>
            <p>Permission Status: {permissionStatus}</p>
            {!capabilities.isSupported && (
              <p className="text-red-500">{capabilities.unsupportedReason}</p>
            )}
          </div>
        </div>

        {/* Camera Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Camera Preview
          </h2>
          <CameraPreview
            stream={stream}
            isLoading={isLoading}
            error={activeError}
            isMirrored={isMirrored}
            onMirrorToggle={() => setIsMirrored(!isMirrored)}
            facingMode={facingMode}
            aspectRatio={customAspectRatio}
            compact={compact}
            onRetry={handleRetry}
            onOpenSettings={handleOpenSettings}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Camera'}
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Controls
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mirror Toggle */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isMirrored}
                  onChange={(e) => setIsMirrored(e.target.checked)}
                  className="w-4 h-4"
                />
                Mirror Mode
              </label>
            </div>

            {/* Compact Toggle */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={compact}
                  onChange={(e) => setCompact(e.target.checked)}
                  className="w-4 h-4"
                />
                Compact Mode
              </label>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Aspect Ratio
              </label>
              <select
                value={customAspectRatio}
                onChange={(e) => setCustomAspectRatio(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={16 / 9}>16:9 (Widescreen)</option>
                <option value={4 / 3}>4:3 (Standard)</option>
                <option value={1}>1:1 (Square)</option>
                <option value={9 / 16}>9:16 (Portrait)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mock Error Testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Error States
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Error Type
              </label>
              <select
                value={mockErrorType}
                onChange={(e) => setMockErrorType(e.target.value as typeof mockErrorType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="PERMISSION_DENIED">Permission Denied</option>
                <option value="NO_DEVICE_FOUND">No Device Found</option>
                <option value="DEVICE_IN_USE">Device In Use</option>
                <option value="BROWSER_NOT_SUPPORTED">Browser Not Supported</option>
                <option value="STREAM_ERROR">Stream Error</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  stopCamera();
                  setShowMockError(true);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Show Mock Error
              </button>
              <button
                onClick={() => {
                  setShowMockError(false);
                  clearError();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Error
              </button>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Current State
          </h2>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
            {JSON.stringify(
              {
                isCameraActive,
                isLoading,
                isMirrored,
                facingMode,
                compact,
                aspectRatio: customAspectRatio,
                hasStream: !!stream,
                hasError: !!activeError,
                errorCode: activeError?.code,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
