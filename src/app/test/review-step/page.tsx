'use client';

/**
 * Test Page for ReviewStep Component
 *
 * This page demonstrates the ReviewStep component in isolation for testing.
 * Access at: /test/review-step
 *
 * @lastModified 2025-12-31 (REQ-050 Browser Testing)
 */

import React, { useState, useCallback } from 'react';
import { ReviewStep } from '@/components/ItemCapture';
import type { ItemMetadata, MediaItem } from '@/components/ItemCapture';

// Mock media items for testing
const createMockMediaItems = (): MediaItem[] => [
  {
    id: 'media-1',
    type: 'video',
    file: new Blob(['mock video'], { type: 'video/mp4' }),
    order: 0,
    metadata: {
      duration: 45,
      mimeType: 'video/mp4',
      fileSize: 10485760,
      source: 'capture',
    },
  },
  {
    id: 'media-2',
    type: 'image',
    file: new Blob(['mock image'], { type: 'image/jpeg' }),
    order: 1,
    metadata: {
      dimensions: { width: 1920, height: 1080 },
      mimeType: 'image/jpeg',
      fileSize: 524288,
      source: 'capture',
    },
  },
  {
    id: 'media-3',
    type: 'pdf',
    file: new Blob(['mock pdf'], { type: 'application/pdf' }),
    order: 2,
    metadata: {
      pageCount: 5,
      mimeType: 'application/pdf',
      fileSize: 1048576,
      source: 'upload',
      originalFilename: 'manual.pdf',
    },
  },
];

export default function ReviewStepTestPage() {
  // State
  const [metadata, setMetadata] = useState<ItemMetadata>({
    title: 'Kitchen Dishwasher',
    location: 'Kitchen',
    tags: ['appliance', 'maintenance', 'kitchen'],
    applianceType: 'dishwasher',
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(createMockMediaItems());
  const [instructions, setInstructions] = useState<string>(`# How to run a cleaning cycle

1. **Empty the dishwasher** completely
2. Place a dishwasher-safe cup with **white vinegar** on the top rack
3. Run a **hot water** cycle
4. Sprinkle **baking soda** on the bottom
5. Run a short hot water cycle

## Tips
- Do this monthly for best results
- Check the drain for debris regularly

> Note: Always refer to manufacturer's manual for specific instructions.`);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // Handlers
  const handleSubmit = useCallback(() => {
    addLog('onSubmit called');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addLog('Submission complete');
      alert('Item submitted successfully!');
    }, 2000);
  }, [addLog]);

  const handleCancel = useCallback(() => {
    addLog('onCancel called - would navigate away');
    alert('Cancel confirmed - would navigate away');
  }, [addLog]);

  const handleEditSection = useCallback((section: 'metadata' | 'content-type' | 'capture' | 'text') => {
    addLog(`onEditSection called with: ${section}`);
    alert(`Would navigate to edit: ${section}`);
  }, [addLog]);

  const handleRemoveMedia = useCallback((mediaId: string) => {
    addLog(`onRemoveMedia called with ID: ${mediaId}`);
    setMediaItems(prev => prev.filter(item => item.id !== mediaId));
  }, [addLog]);

  const handleReorderMedia = useCallback((mediaId: string, direction: 'up' | 'down') => {
    addLog(`onReorderMedia called: ${mediaId} ${direction}`);
    setMediaItems(prev => {
      const index = prev.findIndex(item => item.id === mediaId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const reordered = [...prev];
      const [removed] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, removed);

      return reordered.map((item, i) => ({ ...item, order: i }));
    });
  }, [addLog]);

  const handleEditMedia = useCallback((mediaId: string) => {
    addLog(`onEditMedia called with ID: ${mediaId}`);
    alert(`Would open editor for media: ${mediaId}`);
  }, [addLog]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ReviewStep Component Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test page for REQ-050 ReviewStep implementation
          </p>
        </div>

        {/* Component Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ReviewStep
            metadata={metadata}
            mediaItems={mediaItems}
            instructions={instructions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onEditSection={handleEditSection}
            onRemoveMedia={handleRemoveMedia}
            onReorderMedia={handleReorderMedia}
            onEditMedia={handleEditMedia}
            isSubmitting={isSubmitting}
            debug
          />
        </div>

        {/* Test Controls */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setMetadata(prev => ({ ...prev, title: '' }))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Title
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaItems([]);
                setInstructions('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Content
            </button>
            <button
              type="button"
              onClick={() => setMediaItems(createMockMediaItems())}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Media Items
            </button>
            <button
              type="button"
              onClick={() => setInstructions('')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Instructions
            </button>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Event Log</h2>
          <div className="bg-gray-900 rounded p-4 h-48 overflow-auto text-xs font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-500">No events yet. Interact with the component to see logs.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Current State */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Metadata:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto max-h-48">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Media Items ({mediaItems.length}):</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto max-h-48">
                {JSON.stringify(mediaItems.map(m => ({ id: m.id, type: m.type, order: m.order })), null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Metadata section: Click Edit to test navigation callback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Media gallery: Hover over cards to see action buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Reorder: Click up/down arrows on media items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Remove: Click trash icon, then confirm in modal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Instructions: Verify markdown renders correctly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Validation: Use &quot;Clear Content&quot; button to see warning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Submit: Click Submit button to test loading state</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Cancel: Click Cancel to test confirmation modal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>Accessibility: Tab through all interactive elements</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
