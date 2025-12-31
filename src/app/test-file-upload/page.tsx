'use client';

/**
 * Test page for useFileUpload hook (REQ-041)
 * This page allows manual testing of all file upload functionality.
 * @lastModified 2025-12-31
 */

import React from 'react';
import { useFileUpload } from '@/components/ItemCapture';

export default function TestFileUploadPage() {
  const {
    files,
    rejectedFiles,
    totalSize,
    hasFiles,
    isDragActive,
    isDragValid,
    error,
    openFilePicker,
    removeFile,
    clearFiles,
    clearError,
    validateFile,
    getDropZoneProps,
    getInputProps,
  } = useFileUpload({
    allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB for testing
    maxTotalSize: 50 * 1024 * 1024, // 50MB for testing
    maxFiles: 5,
    debug: true,
    onFilesAdded: (added) => {
      console.log('Files added:', added);
    },
    onFilesRejected: (rejected) => {
      console.log('Files rejected:', rejected);
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Test validation without adding
  const handleTestValidate = () => {
    const testFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });
    const result = validateFile(testFile);
    console.log('Validation result:', result);
    alert(`Validation result: ${result.valid ? 'VALID' : 'INVALID - ' + result.rejection?.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">useFileUpload Hook Test (REQ-041)</h1>

        {/* Status Panel */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow">
          <h2 className="font-semibold mb-2">Status</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Files: <span data-testid="file-count">{files.length}</span></div>
            <div>Has Files: <span data-testid="has-files">{hasFiles ? 'Yes' : 'No'}</span></div>
            <div>Total Size: <span data-testid="total-size">{formatBytes(totalSize)}</span></div>
            <div>Drag Active: <span data-testid="drag-active">{isDragActive ? 'Yes' : 'No'}</span></div>
            <div>Drag Valid: <span data-testid="drag-valid">{isDragValid ? 'Yes' : 'No'}</span></div>
            <div>Rejections: <span data-testid="rejection-count">{rejectedFiles.length}</span></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6" data-testid="error-message">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-red-800">{error.message}</p>
                <p className="text-sm text-red-600">{error.action}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
                data-testid="clear-error-btn"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          {...getDropZoneProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors
            ${isDragActive
              ? isDragValid
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
            }
          `}
          data-testid="drop-zone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="text-gray-600">
            {isDragActive ? (
              isDragValid ? (
                <p className="text-green-600">Drop files here...</p>
              ) : (
                <p className="text-red-600">Invalid file type</p>
              )
            ) : (
              <>
                <p className="text-lg mb-2">Drop files here or click to select</p>
                <p className="text-sm text-gray-400">
                  Images, Videos, PDF • Max 10MB per file • Max 5 files
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={openFilePicker}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            data-testid="open-picker-btn"
          >
            Open File Picker
          </button>
          <button
            onClick={clearFiles}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={!hasFiles}
            data-testid="clear-files-btn"
          >
            Clear All Files
          </button>
          <button
            onClick={handleTestValidate}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            data-testid="test-validate-btn"
          >
            Test Validate .txt
          </button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow">
            <h2 className="font-semibold mb-4">Added Files ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded"
                  data-testid={`file-item-${index}`}
                >
                  {/* Thumbnail Preview */}
                  {file.previewUrl && file.category === 'image' && (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                      data-testid={`preview-${index}`}
                    />
                  )}
                  {file.previewUrl && file.category === 'video' && (
                    <video
                      src={file.previewUrl}
                      className="w-16 h-16 object-cover rounded"
                      data-testid={`preview-${index}`}
                    />
                  )}
                  {file.category === 'pdf' && (
                    <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center text-red-600">
                      PDF
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`file-name-${index}`}>
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.mimeType} • {formatBytes(file.size)} • {file.category}
                    </p>
                    <p className="text-xs text-gray-400">ID: {file.id}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    data-testid={`remove-btn-${index}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Files */}
        {rejectedFiles.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-4 text-orange-800">
              Rejected Files ({rejectedFiles.length})
            </h2>
            <div className="space-y-2">
              {rejectedFiles.map((rejection, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-100 rounded"
                  data-testid={`rejection-${index}`}
                >
                  <p className="font-medium">{rejection.file.name}</p>
                  <p className="text-sm text-orange-700">{rejection.message}</p>
                  <p className="text-xs text-orange-600">{rejection.action}</p>
                  <p className="text-xs text-gray-500">Code: {rejection.code}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
