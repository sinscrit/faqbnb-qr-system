'use client';

/**
 * MediaEditorStep Test Page
 *
 * Interactive test page for the MediaEditorStep component.
 * Allows testing image crop/rotate and video trim flows with mock data.
 *
 * @lastModified 2025-12-31 (REQ-050)
 */

import { useState, useCallback, useRef } from 'react';
import { MediaEditorStep } from '@/components/ItemCapture/components/steps/MediaEditorStep';
import type { MediaItem, MediaMetadata } from '@/components/ItemCapture/ItemCapture.types';

/**
 * Create a mock image blob for testing
 */
async function createMockImageBlob(color: string = 'blue'): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Draw colored rectangle
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some text
  ctx.fillStyle = 'white';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Test Image (${color})`, canvas.width / 2, canvas.height / 2);
  ctx.font = '24px sans-serif';
  ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 50);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

/**
 * Create a mock video blob for testing
 * This creates a simple video using MediaRecorder and canvas
 */
async function createMockVideoBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Create a stream from canvas
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };

    recorder.start();

    // Animate for 2 seconds
    let frame = 0;
    const animate = () => {
      if (frame < 60) {
        ctx.fillStyle = `hsl(${frame * 6}, 70%, 50%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Test Video', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillText(`Frame ${frame}`, canvas.width / 2, canvas.height / 2 + 40);
        frame++;
        requestAnimationFrame(animate);
      } else {
        recorder.stop();
      }
    };
    animate();
  });
}

/**
 * Create a mock MediaItem
 */
function createMockMediaItem(
  id: string,
  type: 'image' | 'video',
  file: Blob,
  order: number
): MediaItem {
  const metadata: MediaMetadata = {
    mimeType: type === 'image' ? 'image/jpeg' : 'video/webm',
    fileSize: file.size,
    source: 'upload',
    dimensions: type === 'image' ? { width: 800, height: 600 } : { width: 640, height: 480 },
    duration: type === 'video' ? 2 : undefined,
  };

  return {
    id,
    type,
    file,
    order,
    metadata,
  };
}

export default function MediaEditorStepTestPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    setTimeout(() => {
      logsRef.current?.scrollTo(0, logsRef.current.scrollHeight);
    }, 0);
  }, []);

  const handleLoadImages = useCallback(async () => {
    setIsLoading(true);
    addLog('Creating mock images...');
    try {
      const blob1 = await createMockImageBlob('blue');
      const blob2 = await createMockImageBlob('green');
      const blob3 = await createMockImageBlob('purple');

      setMediaItems([
        createMockMediaItem('img-1', 'image', blob1, 0),
        createMockMediaItem('img-2', 'image', blob2, 1),
        createMockMediaItem('img-3', 'image', blob3, 2),
      ]);
      addLog('Created 3 mock images');
      setCompletedMessage(null);
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const handleLoadVideo = useCallback(async () => {
    setIsLoading(true);
    addLog('Creating mock video...');
    try {
      const blob = await createMockVideoBlob();
      setMediaItems([createMockMediaItem('vid-1', 'video', blob, 0)]);
      addLog('Created mock video');
      setCompletedMessage(null);
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const handleLoadMixed = useCallback(async () => {
    setIsLoading(true);
    addLog('Creating mixed media (images + video)...');
    try {
      const imgBlob = await createMockImageBlob('red');
      const vidBlob = await createMockVideoBlob();

      setMediaItems([
        createMockMediaItem('img-1', 'image', imgBlob, 0),
        createMockMediaItem('vid-1', 'video', vidBlob, 1),
      ]);
      addLog('Created 1 image + 1 video');
      setCompletedMessage(null);
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const handleComplete = useCallback(() => {
    addLog('MediaEditorStep completed!');
    setCompletedMessage('Editing complete! All media items processed.');
    setMediaItems([]);
  }, [addLog]);

  const handleUpdateMedia = useCallback(
    (mediaId: string, updates: Partial<MediaItem>) => {
      addLog(`Media updated: ${mediaId} - ${JSON.stringify(Object.keys(updates))}`);
      setMediaItems((prev) =>
        prev.map((item) => (item.id === mediaId ? { ...item, ...updates } : item))
      );
    },
    [addLog]
  );

  const handleCancel = useCallback(() => {
    addLog('Editing cancelled');
    setCompletedMessage('Editing was cancelled.');
    setMediaItems([]);
  }, [addLog]);

  const handleReset = useCallback(() => {
    setMediaItems([]);
    setCompletedMessage(null);
    addLog('State reset');
  }, [addLog]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">MediaEditorStep Test Page</h1>
        <p className="text-gray-600 mb-6">
          Test the MediaEditorStep component with mock media items. This component orchestrates
          crop/rotate for images and trim for videos.
        </p>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Load Test Data</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleLoadImages}
              disabled={isLoading || mediaItems.length > 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load 3 Images
            </button>
            <button
              onClick={handleLoadVideo}
              disabled={isLoading || mediaItems.length > 0}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load 1 Video
            </button>
            <button
              onClick={handleLoadMixed}
              disabled={isLoading || mediaItems.length > 0}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Mixed (Image + Video)
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">Creating mock media...</p>
          )}
        </div>

        {/* Completion Message */}
        {completedMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {completedMessage}
          </div>
        )}

        {/* MediaEditorStep */}
        {mediaItems.length > 0 && (
          <div className="bg-white rounded-lg shadow" style={{ height: '70vh' }}>
            <MediaEditorStep
              mediaItems={mediaItems}
              onComplete={handleComplete}
              onUpdateMedia={handleUpdateMedia}
              onCancel={handleCancel}
              debug
              className="h-full p-4"
            />
          </div>
        )}

        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">Current State</h2>
          <div className="text-sm">
            <p>
              <span className="font-medium">Media Items:</span> {mediaItems.length}
            </p>
            {mediaItems.map((item, i) => (
              <p key={item.id} className="ml-4 text-gray-600">
                {i + 1}. {item.type} - {item.id} ({Math.round(item.file.size / 1024)}KB)
              </p>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">Event Log</h2>
          <div
            ref={logsRef}
            className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs h-40 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <span className="text-gray-500">No events yet...</span>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
