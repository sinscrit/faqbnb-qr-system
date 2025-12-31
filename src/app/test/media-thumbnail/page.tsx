'use client';

/**
 * Test Page for MediaThumbnail Component
 *
 * This page demonstrates the MediaThumbnail component in isolation for testing.
 * Access at: /test/media-thumbnail
 *
 * @lastModified 2025-12-31 (REQ-051 Browser Testing)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { MediaThumbnail } from '@/components/ItemCapture';
import type { MediaItem } from '@/components/ItemCapture';

// Create a sample image as a canvas blob
function createSampleImageBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#06B6D4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);

      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Image', 200, 150);
      ctx.font = '16px sans-serif';
      ctx.fillText('Test Thumbnail', 200, 180);
    }
    canvas.toBlob((blob) => {
      resolve(blob || new Blob(['sample'], { type: 'image/png' }));
    }, 'image/png');
  });
}

// Create mock media items
const createMockMediaItems = async (): Promise<MediaItem[]> => {
  const imageBlob = await createSampleImageBlob();

  return [
    {
      id: 'image-1',
      type: 'image',
      file: imageBlob,
      thumbnail: imageBlob,
      order: 0,
      metadata: {
        dimensions: { width: 400, height: 300 },
        mimeType: 'image/png',
        fileSize: 12345,
        source: 'capture',
        originalFilename: 'sample-photo.png',
      },
    },
    {
      id: 'video-1',
      type: 'video',
      file: new Blob(['mock video'], { type: 'video/mp4' }),
      thumbnail: imageBlob,
      order: 1,
      metadata: {
        duration: 45,
        dimensions: { width: 1920, height: 1080 },
        mimeType: 'video/mp4',
        fileSize: 10485760,
        source: 'capture',
      },
    },
    {
      id: 'pdf-1',
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
    {
      id: 'pdf-2',
      type: 'pdf',
      file: new Blob(['mock pdf single'], { type: 'application/pdf' }),
      order: 3,
      metadata: {
        pageCount: 1,
        mimeType: 'application/pdf',
        fileSize: 102400,
        source: 'upload',
        originalFilename: 'single-page.pdf',
      },
    },
  ];
};

export default function MediaThumbnailTestPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [logs, setLogs] = useState<string[]>([]);
  const [clickedId, setClickedId] = useState<string | null>(null);

  // Initialize mock data
  useEffect(() => {
    createMockMediaItems().then(setMediaItems);
  }, []);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // Handlers
  const handleDelete = useCallback((id: string) => {
    addLog(`onDelete called with ID: ${id}`);
    setMediaItems(prev => prev.filter(item => item.id !== id));
  }, [addLog]);

  const handleClick = useCallback((id: string) => {
    addLog(`onClick called with ID: ${id}`);
    setClickedId(id);
    setTimeout(() => setClickedId(null), 1000);
  }, [addLog]);

  const handleToggleLoading = () => {
    setIsLoading(prev => !prev);
    addLog(`Loading state toggled: ${!isLoading}`);
  };

  const handleReset = async () => {
    const items = await createMockMediaItems();
    setMediaItems(items);
    addLog('Media items reset');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            MediaThumbnail Component Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test page for REQ-051 MediaThumbnail implementation
          </p>
        </div>

        {/* Size Selector */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Size Variants</h2>
          <div className="flex gap-4">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedSize === size
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {size} ({size === 'small' ? '80px' : size === 'medium' ? '120px' : '200px'})
              </button>
            ))}
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            MediaThumbnail Gallery ({mediaItems.length} items)
          </h2>

          {mediaItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No media items. Click &quot;Reset Media Items&quot; to add some.
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {mediaItems.map((media) => (
                <div key={media.id} className="relative">
                  <MediaThumbnail
                    media={media}
                    onDelete={handleDelete}
                    onClick={handleClick}
                    isLoading={isLoading}
                    size={selectedSize}
                    className={clickedId === media.id ? 'ring-4 ring-blue-500' : ''}
                  />
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {media.type} ({media.id})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State Test */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Loading State Test</h2>
          <p className="text-sm text-gray-600 mb-3">
            Toggle loading to see spinner overlay on all thumbnails:
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleLoading}
              className={`px-4 py-2 rounded-lg ${
                isLoading
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {isLoading ? 'Disable Loading' : 'Enable Loading'}
            </button>
            <span className={`text-sm ${isLoading ? 'text-red-600' : 'text-green-600'}`}>
              Loading: {isLoading ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Media Items
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Logs
            </button>
            <button
              onClick={() => setMediaItems([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear All Media
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 text-white">
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

        {/* Test Scenarios */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Image Thumbnail:</strong> Should display the generated image with proper scaling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Video Thumbnail:</strong> Should show play icon overlay on the thumbnail</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>PDF Thumbnail:</strong> Should display document icon with page count</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Delete Button:</strong> Hover over thumbnail to see delete button, click to remove</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Click Handler:</strong> Click thumbnail to see blue ring highlight (1 second)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Loading State:</strong> Toggle loading to see spinner on all thumbnails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Size Variants:</strong> Switch between small, medium, large sizes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span><strong>Page Count:</strong> PDFs should show &quot;5 pages&quot; and &quot;1 page&quot; correctly</span>
            </li>
          </ul>
        </div>

        {/* Current State */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Media Items:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto max-h-48">
                {JSON.stringify(mediaItems.map(m => ({
                  id: m.id,
                  type: m.type,
                  pageCount: m.metadata.pageCount,
                })), null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Settings:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto max-h-48">
                {JSON.stringify({
                  size: selectedSize,
                  isLoading,
                  itemCount: mediaItems.length,
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
