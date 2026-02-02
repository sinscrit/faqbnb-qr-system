'use client';
/* eslint-disable react/no-unescaped-entities */

/**
 * AssetDropZone Test Harness Page
 *
 * Interactive test page for verifying AssetDropZone component states and behaviors.
 *
 * @route /test/asset-dropzone
 * @see docs/REQ-083-implement-assetdropzone-detailed.md
 * @lastModified 2026-01-03 (REQ-083 Task 9 - Test harness page)
 */

import { useState } from 'react';
import Link from 'next/link';
import { AssetDropZone } from '@/components/ItemManager/components/AssetPanel';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AssetDropZoneTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected:', files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/test"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AssetDropZone Test</h1>
            <p className="text-gray-600 text-sm mt-1">REQ-083 - Task 5.4</p>
          </div>
        </div>

        {/* Default State */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Default</h2>
          <p className="text-sm text-gray-600 mb-4">
            Full-size drop zone with all default settings. Try dragging files or clicking to browse.
          </p>
          <AssetDropZone
            onFilesSelected={handleFilesSelected}
          />
        </section>

        {/* Compact Mode */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Compact Mode</h2>
          <p className="text-sm text-gray-600 mb-4">
            Reduced height for use when assets already exist.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Compact:', files)}
            compact={true}
          />
        </section>

        {/* Disabled State */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Disabled</h2>
          <p className="text-sm text-gray-600 mb-4">
            Disabled state - should appear faded and not accept interactions.
          </p>
          <AssetDropZone
            onFilesSelected={() => {}}
            disabled={true}
          />
        </section>

        {/* Images Only */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Images Only</h2>
          <p className="text-sm text-gray-600 mb-4">
            Only accepts image files. Try dragging a PDF or video to see rejection.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Images:', files)}
            allowedMediaTypes={['image']}
          />
        </section>

        {/* Videos Only */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Videos Only</h2>
          <p className="text-sm text-gray-600 mb-4">
            Only accepts video files.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Videos:', files)}
            allowedMediaTypes={['video']}
          />
        </section>

        {/* PDFs Only */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">PDFs Only</h2>
          <p className="text-sm text-gray-600 mb-4">
            Only accepts PDF files.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('PDFs:', files)}
            allowedMediaTypes={['pdf']}
          />
        </section>

        {/* Small File Size Limit */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">1MB Limit (for error testing)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Try uploading a file larger than 1MB to see the error display.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Small:', files)}
            maxFileSize={1 * 1024 * 1024}
          />
        </section>

        {/* Single File Mode */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Single File Mode</h2>
          <p className="text-sm text-gray-600 mb-4">
            Only allows selecting one file at a time.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Single:', files)}
            multiple={false}
          />
        </section>

        {/* Limited Slots */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">2 Remaining Slots (maxFiles: 5, currentCount: 3)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Simulates having 3 files already added with a max of 5.
          </p>
          <AssetDropZone
            onFilesSelected={(files) => console.log('Limited:', files)}
            maxFiles={5}
            currentFileCount={3}
          />
        </section>

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <section className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-800">
                Selected Files ({selectedFiles.length})
              </h2>
              <button
                onClick={clearFiles}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.type || 'unknown type'} • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Testing Instructions */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Testing Checklist</h2>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Drag files over drop zone - should show blue "Drop files here"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Drag invalid file type - should show red "Invalid file type"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Click drop zone - should open file picker
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Tab to drop zone and press Enter/Space - should open file picker
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Upload file exceeding 1MB in the "1MB Limit" section - should show error
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Upload files to Default section - should appear in "Selected Files"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Compact mode should be shorter with less text
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Disabled mode should not accept clicks or drags
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-4">
          AssetDropZone Test Harness • REQ-083 • Generated 2026-01-03
        </footer>
      </div>
    </div>
  );
}
