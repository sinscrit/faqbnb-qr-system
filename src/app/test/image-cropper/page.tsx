'use client';

/**
 * Test page for ImageCropper component (REQ-047)
 * This page allows manual testing of the image cropping component.
 * @lastModified 2025-12-31
 */

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { AspectRatioPreset } from '@/components/ItemCapture/editors/ImageCropper';

// Lazy-load ImageCropper as it would be in production
const ImageCropper = dynamic(
  () => import('@/components/ItemCapture/editors/ImageCropper'),
  { ssr: false, loading: () => <div className="p-4 text-gray-500">Loading cropper...</div> }
);

export default function TestImageCropperPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [initialAspectRatio, setInitialAspectRatio] = useState<AspectRatioPreset>('free');
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [outputQuality, setOutputQuality] = useState(0.92);
  const [minWidth, setMinWidth] = useState(50);
  const [minHeight, setMinHeight] = useState(50);

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
      setShowCropper(true);
      setCroppedImageUrl(null);
      logEvent(`Image loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  }, [imageSrc, logEvent]);

  // Handle crop completion
  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    // Revoke previous cropped URL if exists
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }

    const url = URL.createObjectURL(croppedBlob);
    setCroppedImageUrl(url);
    setShowCropper(false);
    logEvent(`Crop complete: ${(croppedBlob.size / 1024).toFixed(1)} KB, ${croppedBlob.type}`);
  }, [croppedImageUrl, logEvent]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCropper(false);
    logEvent('Crop cancelled');
  }, [logEvent]);

  // Load sample image
  const loadSampleImage = useCallback((imageUrl: string) => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(imageUrl);
    setShowCropper(true);
    setCroppedImageUrl(null);
    logEvent('Sample image loaded');
  }, [imageSrc, logEvent]);

  // Reset
  const handleReset = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    setImageSrc(null);
    setCroppedImageUrl(null);
    setShowCropper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    logEvent('Reset');
  }, [imageSrc, croppedImageUrl, logEvent]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">ImageCropper Test (REQ-047)</h1>

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
              />
            </div>
            <div className="text-sm text-gray-500">or</div>
            <button
              onClick={() => loadSampleImage('/placeholder-image.jpg')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Load Sample (Landscape)
            </button>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/800/600')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Random Image 800x600
            </button>
            <button
              onClick={() => loadSampleImage('https://picsum.photos/4000/3000')}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
            >
              Large Image (4000x3000)
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Cropper Options */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-3">Cropper Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Initial Aspect</label>
              <select
                value={initialAspectRatio}
                onChange={(e) => setInitialAspectRatio(e.target.value as AspectRatioPreset)}
                className="border rounded px-2 py-2 text-sm w-full"
              >
                <option value="free">Free</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                className="border rounded px-2 py-2 text-sm w-full"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
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
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Width</label>
              <input
                type="number"
                value={minWidth}
                onChange={(e) => setMinWidth(parseInt(e.target.value) || 10)}
                className="border rounded px-2 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Height</label>
              <input
                type="number"
                value={minHeight}
                onChange={(e) => setMinHeight(parseInt(e.target.value) || 10)}
                className="border rounded px-2 py-2 text-sm w-full"
              />
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-40 overflow-y-auto">
          <p className="text-gray-500 mb-1">// Event Log</p>
          {eventLog.length === 0 ? (
            <p className="text-gray-500">No events yet...</p>
          ) : (
            eventLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))
          )}
        </div>

        {/* ImageCropper Component or Result */}
        <div className="bg-white rounded-lg p-6 shadow min-h-[500px]">
          {showCropper && imageSrc ? (
            <ImageCropper
              imageSrc={imageSrc}
              onCropComplete={handleCropComplete}
              onCancel={handleCancel}
              initialAspectRatio={initialAspectRatio}
              outputFormat={outputFormat}
              outputQuality={outputQuality}
              minWidth={minWidth}
              minHeight={minHeight}
            />
          ) : croppedImageUrl ? (
            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-4">Cropped Result</h3>
              <img
                src={croppedImageUrl}
                alt="Cropped result"
                className="max-w-full max-h-[400px] border rounded shadow"
              />
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => {
                    setShowCropper(true);
                    setCroppedImageUrl(null);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Crop Again
                </button>
                <a
                  href={croppedImageUrl}
                  download={`cropped-image.${outputFormat.split('/')[1]}`}
                  className="bg-green-500 text-white px-4 py-2 rounded"
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
              />
              <button
                onClick={() => setShowCropper(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Open Cropper
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              Select an image to start cropping
            </div>
          )}
        </div>

        {/* Testing Checklist */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Testing Checklist</h2>

          <div className="space-y-4 text-sm">
            {/* Basic Functionality */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Basic Functionality (Tasks 1-6)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Component renders image with crop overlay</li>
                <li>[ ] Aspect ratio toolbar shows 4 buttons (Free, 1:1, 4:3, 16:9)</li>
                <li>[ ] Clicking aspect ratio button updates selection</li>
                <li>[ ] Drag handles work for resizing crop area</li>
                <li>[ ] Crop area can be moved</li>
                <li>[ ] Preview thumbnail updates as crop changes</li>
                <li>[ ] Apply button produces correct cropped blob</li>
              </ul>
            </div>

            {/* Cancel and Errors */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Cancel and Error Handling (Task 7)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Cancel button closes cropper</li>
                <li>[ ] Error displays if crop fails</li>
                <li>[ ] Error can be dismissed</li>
                <li>[ ] Invalid image shows error message</li>
              </ul>
            </div>

            {/* Touch and Mobile */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Touch and Mobile (Tasks 8, 11)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Drag handles are large enough on mobile (32px)</li>
                <li>[ ] Touch dragging works on iOS Safari</li>
                <li>[ ] Touch dragging works on Android Chrome</li>
                <li>[ ] Page does not scroll while cropping</li>
                <li>[ ] Buttons are at least 44x44px</li>
                <li>[ ] Layout works at 320px viewport width</li>
                <li>[ ] No horizontal overflow on mobile</li>
              </ul>
            </div>

            {/* Loading States */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Loading States (Tasks 9, 12)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Loading indicator shows while image loads</li>
                <li>[ ] Processing overlay shows during Apply</li>
                <li>[ ] All controls disabled during processing</li>
                <li>[ ] Large image warning appears for 4000x3000 image</li>
              </ul>
            </div>

            {/* Memory Management */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Memory Management (Task 10)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] No memory leak warnings in DevTools</li>
                <li>[ ] Object URLs are cleaned up on unmount</li>
                <li>[ ] State resets when image source changes</li>
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
                <li>[ ] WebP output produces image/webp blob</li>
                <li>[ ] Lower quality = smaller file size</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
