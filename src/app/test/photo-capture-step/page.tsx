/**
 * PhotoCaptureStep Test Page
 *
 * Manual testing page for the PhotoCaptureStep component.
 * Tests full photo capture flow: preview, capture, review, accept/retake,
 * thumbnail strip, and gallery mode.
 *
 * @module test/photo-capture-step
 * @lastModified 2025-12-31 (REQ-039)
 */

'use client';

import { useState, useCallback } from 'react';
import { PhotoCaptureStep } from '@/components/ItemCapture/components/steps/PhotoCaptureStep';
import type { ItemCaptureState, MediaItem, WizardStep, ItemCaptureConfig } from '@/components/ItemCapture';

export default function PhotoCaptureStepTestPage() {
  // Wizard state simulation
  const [wizardState, setWizardState] = useState<ItemCaptureState>({
    currentStep: 'capture-photo' as WizardStep,
    stepHistory: ['metadata', 'content-type'] as WizardStep[],
    metadata: { title: 'Test Item for Photo Capture' },
    mediaItems: [],
    urlItems: [],
    instructions: '',
    errors: {},
    isRecording: false,
    isCameraActive: false,
    isSubmitting: false,
    submitError: null,
    isDirty: false,
  });

  // Config options
  const [maxPhotos, setMaxPhotos] = useState(10);
  const [debug, setDebug] = useState(true);

  const config: ItemCaptureConfig = {
    maxPhotos,
    debug,
  };

  // Captured media log
  const [capturedMedia, setCapturedMedia] = useState<MediaItem[]>([]);
  const [navigationLog, setNavigationLog] = useState<string[]>([]);

  // Handlers
  const handleAddMedia = useCallback((media: MediaItem) => {
    console.log('Media added:', media);
    setCapturedMedia((prev) => [...prev, media]);
    setWizardState((prev) => ({
      ...prev,
      mediaItems: [...prev.mediaItems, media],
    }));
  }, []);

  const handleGoToStep = useCallback((step: WizardStep) => {
    console.log('Navigation to:', step);
    setNavigationLog((prev) => [...prev, `goToStep: ${step}`]);
    setWizardState((prev) => ({
      ...prev,
      currentStep: step,
      stepHistory: [...prev.stepHistory, prev.currentStep],
    }));
  }, []);

  const handlePrevStep = useCallback(() => {
    console.log('Previous step');
    setNavigationLog((prev) => [...prev, 'prevStep']);
  }, []);

  const handleReset = useCallback(() => {
    setWizardState({
      currentStep: 'capture-photo' as WizardStep,
      stepHistory: ['metadata', 'content-type'] as WizardStep[],
      metadata: { title: 'Test Item for Photo Capture' },
      mediaItems: [],
      urlItems: [],
      instructions: '',
      errors: {},
      isRecording: false,
      isCameraActive: false,
      isSubmitting: false,
      submitError: null,
      isDirty: false,
    });
    setCapturedMedia([]);
    setNavigationLog([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          PhotoCaptureStep Component Test
        </h1>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-sm text-blue-800 dark:text-blue-200">
          <h2 className="font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the capture button to take a photo</li>
            <li>Review the photo - use Accept or Retake</li>
            <li>Accepted photos appear in the thumbnail strip</li>
            <li>Click a thumbnail to open gallery mode</li>
            <li>Test removing photos from thumbnail strip or gallery</li>
            <li>Try reaching the max photo limit</li>
            <li>Test camera switching if multiple cameras available</li>
            <li>Check captured media and navigation logs below</li>
          </ol>
        </div>

        {/* Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Max Photos
              </label>
              <input
                type="number"
                value={maxPhotos}
                onChange={(e) => setMaxPhotos(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-6">
                <input
                  type="checkbox"
                  checked={debug}
                  onChange={(e) => setDebug(e.target.checked)}
                  className="w-4 h-4"
                />
                Debug Mode (console logs)
              </label>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset All State
          </button>
        </div>

        {/* PhotoCaptureStep Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            PhotoCaptureStep
          </h2>
          <PhotoCaptureStep
            state={wizardState}
            addMedia={handleAddMedia}
            goToStep={handleGoToStep}
            prevStep={handlePrevStep}
            config={config}
          />
        </div>

        {/* Captured Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Captured Media ({capturedMedia.length})
          </h2>
          {capturedMedia.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No media captured yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {capturedMedia.map((media, index) => (
                <div
                  key={media.id}
                  className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {/* Thumbnail */}
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden mb-2">
                    {media.thumbnail ? (
                      <img
                        src={URL.createObjectURL(media.thumbnail)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No thumbnail</span>
                    )}
                  </div>
                  {/* Details */}
                  <div className="text-xs">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Photo {index + 1}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      ID: {media.id.slice(0, 8)}...
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Size: {(media.metadata.fileSize / 1024).toFixed(1)} KB
                    </p>
                    {media.metadata.dimensions && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {media.metadata.dimensions.width}x{media.metadata.dimensions.height}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Log */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Navigation Log
          </h2>
          {navigationLog.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No navigation events yet</p>
          ) : (
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {navigationLog.map((log, index) => (
                <li key={index} className="font-mono">
                  {index + 1}. {log}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current State */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wizard State
          </h2>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
            {JSON.stringify(
              {
                currentStep: wizardState.currentStep,
                stepHistory: wizardState.stepHistory,
                mediaItemsCount: wizardState.mediaItems.length,
                isRecording: wizardState.isRecording,
                isCameraActive: wizardState.isCameraActive,
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
