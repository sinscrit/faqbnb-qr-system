'use client';

/**
 * VideoTrimmer Test Page
 *
 * Interactive test page for the VideoTrimmer component.
 * Allows testing with sample videos and displays the resulting TrimDescriptor.
 *
 * @lastModified 2025-12-31 (REQ-049)
 */

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { TrimDescriptor } from '@/components/ItemCapture/editors/VideoTrimmer';

// Lazy load VideoTrimmer for optimal bundle size
const VideoTrimmer = dynamic(
  () => import('@/components/ItemCapture/editors/VideoTrimmer'),
  { ssr: false, loading: () => <div className="p-4">Loading VideoTrimmer...</div> }
);

// Sample video URL (using a public test video)
const SAMPLE_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export default function VideoTrimmerTestPage() {
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [videoSource, setVideoSource] = useState<string | File | null>(null);
  const [result, setResult] = useState<TrimDescriptor | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(true);
  const [customUrl, setCustomUrl] = useState(SAMPLE_VIDEO_URL);

  const handleTrimComplete = useCallback((trimDescriptor: TrimDescriptor) => {
    console.log('Trim completed:', trimDescriptor);
    setResult(trimDescriptor);
    setShowTrimmer(false);
  }, []);

  const handleCancel = useCallback(() => {
    console.log('Trim cancelled');
    setShowTrimmer(false);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSource(file);
      setShowTrimmer(true);
      setResult(null);
    }
  }, []);

  const handleUseSampleVideo = useCallback(() => {
    setVideoSource(customUrl);
    setShowTrimmer(true);
    setResult(null);
  }, [customUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          VideoTrimmer Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          Test the VideoTrimmer component (V1 Simplified). This component captures
          trim markers as metadata only - actual video encoding is deferred to the server.
        </p>

        {!showTrimmer && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Select Video Source</h2>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setUseUrlInput(true)}
                className={`px-4 py-2 rounded ${
                  useUrlInput
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Use URL
              </button>
              <button
                onClick={() => setUseUrlInput(false)}
                className={`px-4 py-2 rounded ${
                  !useUrlInput
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
            </div>

            {useUrlInput ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter video URL..."
                  />
                </div>
                <button
                  onClick={handleUseSampleVideo}
                  className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Load Video from URL
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Select video file
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {showTrimmer && videoSource && (
          <div className="bg-white rounded-lg shadow p-4" style={{ height: '80vh' }}>
            <VideoTrimmer
              videoSrc={videoSource}
              onTrimComplete={handleTrimComplete}
              onCancel={handleCancel}
              debug={true}
            />
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Trim Result
            </h3>
            <div className="bg-white p-4 rounded border border-green-200">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>
                <strong>Start Time:</strong> {result.startTime.toFixed(2)}s
              </p>
              <p>
                <strong>End Time:</strong> {result.endTime.toFixed(2)}s
              </p>
              <p>
                <strong>Trimmed Duration:</strong>{' '}
                {(result.endTime - result.startTime).toFixed(2)}s
              </p>
              <p>
                <strong>Original Duration:</strong>{' '}
                {result.originalDuration.toFixed(2)}s
              </p>
              <p>
                <strong>Reduction:</strong>{' '}
                {(
                  (1 - (result.endTime - result.startTime) / result.originalDuration) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <button
              onClick={() => {
                setResult(null);
                setVideoSource(null);
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Another Video
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Features to Test:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Drag start (S) and end (E) markers on the timeline</li>
            <li>Click on timeline to seek video</li>
            <li>Play/Pause to preview the trimmed region</li>
            <li>Use keyboard arrows to adjust markers (Shift+Arrow for 5s steps)</li>
            <li>Press Space to play/pause, Escape to cancel</li>
            <li>Observe the trim savings indicator</li>
            <li>Apply Trim to get the TrimDescriptor output</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
