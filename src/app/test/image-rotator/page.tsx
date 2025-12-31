'use client';

/**
 * Test page for ImageRotator component (REQ-048)
 * This page allows manual testing of the image rotation component.
 * @lastModified 2025-12-31
 */

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { RotationDegrees } from '@/components/ItemCapture/editors/rotationUtils';

// Lazy-load ImageRotator as it would be in production
const ImageRotator = dynamic(
  () => import('@/components/ItemCapture/editors/ImageRotator'),
  { ssr: false, loading: () => <div className="p-4 text-gray-500">Loading rotator...</div> }
);

export default function TestImageRotatorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotatedImageUrl, setRotatedImageUrl] = useState<string | null>(null);
  const [lastRotation, setLastRotation] = useState<RotationDegrees>(0);
  const [showRotator, setShowRotator] = useState(false);
  const [initialRotation, setInitialRotation] = useState<RotationDegrees>(0);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [outputQuality, setOutputQuality] = useState(0.92);
  const [showProcessingIndicator, setShowProcessingIndicator] = useState(true);

  // Event log for debugging
  const [eventLog, setEventLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [...prev.slice(-19), `[${timestamp}] ${event}`]);
  }, []);

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous URL if exists
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }

      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setShowRotator(true);
      setRotatedImageUrl(null);
      logEvent(`Image loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  }, [imageSrc, logEvent]);

  // Handle rotation completion
  const handleRotationComplete = useCallback((rotatedBlob: Blob, rotation: RotationDegrees) => {
    // Revoke previous rotated URL if exists
    if (rotatedImageUrl) {
      URL.revokeObjectURL(rotatedImageUrl);
    }

    const url = URL.createObjectURL(rotatedBlob);
    setRotatedImageUrl(url);
    setLastRotation(rotation);
    setShowRotator(false);
    logEvent(`Rotation complete: ${rotation}°, ${(rotatedBlob.size / 1024).toFixed(1)} KB, ${rotatedBlob.type}`);
  }, [rotatedImageUrl, logEvent]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowRotator(false);
    logEvent('Rotation cancelled');
  }, [logEvent]);

  // Load sample image
  const loadSampleImage = useCallback((imageUrl: string, label: string) => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(imageUrl);
    setShowRotator(true);
    setRotatedImageUrl(null);
    logEvent(`Sample image loaded: ${label}`);
  }, [imageSrc, logEvent]);

  // Reset
  const handleReset = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (rotatedImageUrl) {
      URL.revokeObjectURL(rotatedImageUrl);
    }
    setImageSrc(null);
    setRotatedImageUrl(null);
    setShowRotator(false);
    setLastRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    logEvent('Reset');
  }, [imageSrc, rotatedImageUrl, logEvent]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">ImageRotator Test (REQ-048)</h1>

        {/* Image Source Selection */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-3">Image Source</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
                data-testid="file-input"
              />
            </div>
            <div className="text-sm text-gray-500">or</div>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/800/600', 'Landscape 800x600')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              data-testid="load-landscape"
            >
              Landscape 800x600
            </button>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/600/800', 'Portrait 600x800')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              data-testid="load-portrait"
            >
              Portrait 600x800
            </button>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/600/600', 'Square 600x600')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              data-testid="load-square"
            >
              Square 600x600
            </button>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/4000/3000', 'Large 4000x3000')}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
              data-testid="load-large"
            >
              Large 4000x3000
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              data-testid="reset-button"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Rotator Options */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-3">Rotator Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Initial Rotation</label>
              <select
                value={initialRotation}
                onChange={(e) => setInitialRotation(parseInt(e.target.value) as RotationDegrees)}
                className="border rounded px-2 py-2 text-sm w-full"
                data-testid="initial-rotation"
              >
                <option value="0">0°</option>
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                className="border rounded px-2 py-2 text-sm w-full"
                data-testid="output-format"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quality ({outputQuality})</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={outputQuality}
                onChange={(e) => setOutputQuality(parseFloat(e.target.value))}
                className="w-full"
                data-testid="output-quality"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Processing Indicator</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProcessingIndicator}
                  onChange={(e) => setShowProcessingIndicator(e.target.checked)}
                  className="w-4 h-4"
                  data-testid="show-processing"
                />
                <span className="text-sm">Show processing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-40 overflow-y-auto" data-testid="event-log">
          <p className="text-gray-500 mb-1">// Event Log</p>
          {eventLog.length === 0 ? (
            <p className="text-gray-500">No events yet...</p>
          ) : (
            eventLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))
          )}
        </div>

        {/* ImageRotator Component or Result */}
        <div className="bg-white rounded-lg p-6 shadow min-h-[500px]" data-testid="main-content">
          {showRotator && imageSrc ? (
            <ImageRotator
              imageSrc={imageSrc}
              initialRotation={initialRotation}
              onRotationComplete={handleRotationComplete}
              onCancel={handleCancel}
              outputFormat={outputFormat}
              outputQuality={outputQuality}
              showProcessingIndicator={showProcessingIndicator}
            />
          ) : rotatedImageUrl ? (
            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-2">Rotated Result</h3>
              <p className="text-sm text-gray-500 mb-4">Applied rotation: {lastRotation}°</p>
              <img
                src={rotatedImageUrl}
                alt="Rotated result"
                className="max-w-full max-h-[400px] border rounded shadow"
                data-testid="rotated-image"
              />
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => {
                    setShowRotator(true);
                    setRotatedImageUrl(null);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  data-testid="rotate-again"
                >
                  Rotate Again
                </button>
                <a
                  href={rotatedImageUrl}
                  download={`rotated-image.${outputFormat.split('/')[1]}`}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  data-testid="download-button"
                >
                  Download
                </a>
              </div>
            </div>
          ) : imageSrc ? (
            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-4">Original Image</h3>
              <img
                src={imageSrc}
                alt="Original"
                className="max-w-full max-h-[400px] border rounded"
                data-testid="original-image"
              />
              <button
                onClick={() => setShowRotator(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                data-testid="open-rotator"
              >
                Open Rotator
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500" data-testid="placeholder">
              Select an image to start rotating
            </div>
          )}
        </div>

        {/* Testing Checklist */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Testing Checklist (REQ-048)</h2>

          <div className="space-y-4 text-sm">
            {/* Basic Rotation */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Rotation Controls (Tasks 1, 5)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Rotate left button (counter-clockwise) shows RotateCcw icon</li>
                <li>[ ] Rotate right button (clockwise) shows RotateCw icon</li>
                <li>[ ] Buttons are minimum 48x48px for touch accessibility</li>
                <li>[ ] Clicking rotate left decreases rotation by 90°</li>
                <li>[ ] Clicking rotate right increases rotation by 90°</li>
                <li>[ ] Rotation wraps correctly: 0 → 270 → 180 → 90 → 0</li>
                <li>[ ] Buttons are disabled during animation</li>
              </ul>
            </div>

            {/* CSS Animation */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                CSS Preview Animation (Task 4)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Image displays at initial rotation</li>
                <li>[ ] Smooth CSS transition animates rotation</li>
                <li>[ ] Animation duration is ~300ms</li>
                <li>[ ] prefers-reduced-motion disables animation</li>
                <li>[ ] Container properly contains rotated image</li>
              </ul>
            </div>

            {/* Apply and Cancel */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Apply and Cancel Actions (Task 6)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Cancel button calls onCancel callback</li>
                <li>[ ] Apply button processes canvas rotation</li>
                <li>[ ] If rotation is 0°, original blob returned</li>
                <li>[ ] Rotated blob has correct orientation</li>
                <li>[ ] Portrait images become landscape at 90°/270°</li>
              </ul>
            </div>

            {/* Error Handling */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Error Handling (Task 7)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Error message displays in styled container</li>
                <li>[ ] &quot;Try Again&quot; button clears error</li>
                <li>[ ] Rotation controls disabled when error present</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Accessibility (Task 8)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Arrow left/right keys rotate image</li>
                <li>[ ] Escape key cancels</li>
                <li>[ ] Ctrl/Cmd+Enter applies rotation</li>
                <li>[ ] Screen reader announces rotation changes</li>
                <li>[ ] Focus indicators visible on buttons</li>
                <li>[ ] ARIA labels present on all controls</li>
              </ul>
            </div>

            {/* Processing Indicator */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Processing Indicator (Task 9)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Spinner appears during processing</li>
                <li>[ ] Overlay covers image preview</li>
                <li>[ ] All buttons disabled during processing</li>
                <li>[ ] showProcessingIndicator=false hides indicator</li>
              </ul>
            </div>

            {/* Image Source Handling */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Image Source Handling (Task 3)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] String URL images work</li>
                <li>[ ] File uploads work</li>
                <li>[ ] Object URLs cleaned up on unmount</li>
                <li>[ ] Loading state shows while image loads</li>
              </ul>
            </div>

            {/* Output Formats */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Output Formats
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] JPEG output produces image/jpeg blob</li>
                <li>[ ] PNG output produces image/png blob</li>
                <li>[ ] Lower quality = smaller file size</li>
              </ul>
            </div>

            {/* Edge Cases */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Edge Cases (Task 11)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Very large images (4000x3000) process correctly</li>
                <li>[ ] Portrait vs landscape handled correctly</li>
                <li>[ ] Square images rotate correctly</li>
                <li>[ ] Rapid button clicks are debounced</li>
                <li>[ ] Component unmount during processing causes no errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
