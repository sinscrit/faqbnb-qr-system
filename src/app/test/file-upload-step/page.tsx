'use client';

/**
 * Test page for FileUploadStep component (REQ-042)
 * This page allows manual testing of the file upload wizard step.
 * @lastModified 2025-12-31
 */

import React, { useState, useCallback } from 'react';
import { FileUploadStep, type ItemCaptureState, type MediaItem, type WizardStep } from '@/components/ItemCapture';

export default function TestFileUploadStepPage() {
  // Mock state management
  const [state, setState] = useState<ItemCaptureState>({
    currentStep: 'upload-file',
    stepHistory: ['metadata', 'content-type'],
    metadata: {
      title: 'Test Item',
      location: 'Kitchen',
      tags: [],
      applianceType: undefined,
    },
    mediaItems: [],
    instructions: '',
    errors: {},
    isRecording: false,
    isCameraActive: false,
    isSubmitting: false,
    isDirty: false,
  });

  // Navigation tracking
  const [navigationLog, setNavigationLog] = useState<string[]>([]);

  const addMedia = useCallback((media: MediaItem) => {
    setState((prev) => ({
      ...prev,
      mediaItems: [...prev.mediaItems, media],
      isDirty: true,
    }));
    setNavigationLog((prev) => [...prev, `ADD_MEDIA: ${media.id} (${media.type})`]);
  }, []);

  const removeMedia = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      mediaItems: prev.mediaItems.filter((m) => m.id !== id),
      isDirty: true,
    }));
    setNavigationLog((prev) => [...prev, `REMOVE_MEDIA: ${id}`]);
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setNavigationLog((prev) => [...prev, `GO_TO_STEP: ${step}`]);
    alert(`Would navigate to: ${step}`);
  }, []);

  const prevStep = useCallback(() => {
    setNavigationLog((prev) => [...prev, 'PREV_STEP']);
    alert('Would go to previous step');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">FileUploadStep Test (REQ-042)</h1>

        {/* Debug Panel */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-2">State</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Media Items: {state.mediaItems.length}</div>
            <div>Is Dirty: {state.isDirty ? 'Yes' : 'No'}</div>
          </div>
          {state.mediaItems.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-sm">Media Items:</p>
              <ul className="text-xs text-gray-600">
                {state.mediaItems.map((m) => (
                  <li key={m.id}>
                    {m.id.slice(0, 8)}... - {m.type} ({m.metadata.fileSize} bytes)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation Log */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-32 overflow-y-auto">
          <p className="text-gray-500 mb-1">// Navigation Log</p>
          {navigationLog.length === 0 ? (
            <p className="text-gray-500">No actions yet...</p>
          ) : (
            navigationLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))
          )}
        </div>

        {/* FileUploadStep Component */}
        <div className="bg-white rounded-lg p-6 shadow">
          <FileUploadStep
            state={state}
            addMedia={addMedia}
            removeMedia={removeMedia}
            goToStep={goToStep}
            prevStep={prevStep}
            config={{}}
          />
        </div>
      </div>
    </div>
  );
}
