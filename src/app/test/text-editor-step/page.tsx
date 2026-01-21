'use client';

/**
 * Test page for TextEditorStep component (REQ-044)
 * This page allows manual testing of the text editor wizard step.
 * @lastModified 2025-12-31
 */

import React, { useState, useCallback } from 'react';
import {
  TextEditorStep,
  type ItemCaptureState,
  type WizardStep,
} from '@/components/ItemCapture';

export default function TestTextEditorStepPage() {
  // Mock state management
  const [state, setState] = useState<ItemCaptureState>({
    currentStep: 'write-text',
    stepHistory: ['metadata', 'content-type'],
    metadata: {
      title: 'Test Item',
      location: 'Kitchen',
      tags: [],
      applianceType: undefined,
    },
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

  // Event log for debugging
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [...prev.slice(-9), `[${timestamp}] ${event}`]);
  }, []);

  const setInstructions = useCallback(
    (text: string) => {
      setState((prev) => ({
        ...prev,
        instructions: text,
        isDirty: true,
      }));
      logEvent(`SET_INSTRUCTIONS: ${text.length} chars`);
    },
    [logEvent]
  );

  const goToStep = useCallback(
    (step: WizardStep) => {
      logEvent(`GO_TO_STEP: ${step}`);
      alert(`Would navigate to: ${step}`);
    },
    [logEvent]
  );

  const prevStep = useCallback(() => {
    logEvent('PREV_STEP');
    alert('Would go to previous step');
  }, [logEvent]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">TextEditorStep Test (REQ-044)</h1>

        {/* Debug Panel */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-2">State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Instructions Length:</span>{' '}
              {state.instructions.length}
            </div>
            <div>
              <span className="text-gray-500">Is Dirty:</span>{' '}
              {state.isDirty ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="text-gray-500">Current Step:</span>{' '}
              {state.currentStep}
            </div>
            <div>
              <span className="text-gray-500">Media Items:</span>{' '}
              {state.mediaItems.length}
            </div>
          </div>
          {state.instructions && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Current Instructions:</p>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-24 border">
                {state.instructions}
              </pre>
            </div>
          )}
        </div>

        {/* Event Log */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-32 overflow-y-auto">
          <p className="text-gray-500 mb-1">// Event Log</p>
          {eventLog.length === 0 ? (
            <p className="text-gray-500">No events yet...</p>
          ) : (
            eventLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))
          )}
        </div>

        {/* TextEditorStep Component */}
        <div className="bg-white rounded-lg p-6 shadow" style={{ minHeight: '500px' }}>
          <TextEditorStep
            state={state}
            setInstructions={setInstructions}
            goToStep={goToStep}
            prevStep={prevStep}
          />
        </div>

        {/* Testing Checklist */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Testing Checklist</h2>

          <div className="space-y-4 text-sm">
            {/* Basic Editor Flow */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Basic Editor Flow (Task 3.4.15)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Textarea accepts input</li>
                <li>[ ] Character count updates in real-time</li>
                <li>[ ] Content appears in preview pane</li>
                <li>[ ] Bold button wraps selected text with **</li>
                <li>[ ] Italic button wraps selected text with *</li>
                <li>[ ] Heading buttons prepend #, ##, ###</li>
                <li>[ ] Ctrl+B/I/K shortcuts work</li>
                <li>[ ] Warning color at 4500+ characters</li>
                <li>[ ] Error color at 5000+ characters</li>
                <li>[ ] Auto-save after 500ms of no typing</li>
              </ul>
            </div>

            {/* Preview and Responsive */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Preview & Responsive (Task 3.4.16)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] **bold** renders as bold text</li>
                <li>[ ] *italic* renders as italic text</li>
                <li>[ ] # Heading renders correctly sized</li>
                <li>[ ] - items render as bullet list</li>
                <li>[ ] 1. items render as numbered list</li>
                <li>[ ] [link](url) renders as clickable link</li>
                <li>[ ] Mobile: Tab switcher visible under 768px</li>
                <li>[ ] Mobile: Only one pane at a time</li>
                <li>[ ] Desktop: Both panes side-by-side</li>
                <li>[ ] Resize window transitions smoothly</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Accessibility (Task 3.4.17)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Tab key navigates through controls</li>
                <li>[ ] Focus rings visible on all elements</li>
                <li>[ ] Toolbar has role=&quot;toolbar&quot;</li>
                <li>[ ] Buttons have aria-label</li>
                <li>[ ] Character counter has aria-live</li>
                <li>[ ] Error message has role=&quot;alert&quot;</li>
                <li>[ ] Tab panels correctly associated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
