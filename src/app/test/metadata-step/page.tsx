'use client';

/**
 * Test Page for MetadataStep Component
 *
 * This page demonstrates the MetadataStep component in isolation for testing.
 * Access at: /test/metadata-step
 *
 * @lastModified 2025-12-31 (REQ-034 Browser Testing)
 */

import React, { useState, useCallback } from 'react';
import { MetadataStep, validateMetadata } from '@/components/ItemCapture';
import type { ItemMetadata } from '@/components/ItemCapture';

export default function MetadataStepTestPage() {
  const [metadata, setMetadata] = useState<ItemMetadata>({
    title: '',
    location: '',
    tags: [],
    applianceType: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdate = useCallback((updates: Partial<ItemMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete clearedErrors[key];
    });
    setErrors(clearedErrors);
  }, [errors]);

  const handleValidate = useCallback(() => {
    const validationErrors = validateMetadata(metadata);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [metadata]);

  const handleTestSubmit = useCallback(() => {
    const isValid = handleValidate();
    if (isValid) {
      alert('Form is valid! Data:\n' + JSON.stringify(metadata, null, 2));
    } else {
      alert('Form has validation errors. Please fix them.');
    }
  }, [handleValidate, metadata]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            MetadataStep Component Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test page for REQ-034 MetadataStep implementation
          </p>
        </div>

        {/* Component Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <MetadataStep
            metadata={metadata}
            errors={errors}
            onUpdate={handleUpdate}
            onValidate={handleValidate}
          />

          {/* Test Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleTestSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMetadata({
                    title: '',
                    location: '',
                    tags: [],
                    applianceType: undefined,
                  });
                  setErrors({});
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Debug: Current State</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Metadata:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Errors:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Title field: Type text, see character count update</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Title validation: Leave empty and click outside - should show error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Location dropdown: Click to see presets, type to filter, select custom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Location keyboard: Use Arrow keys, Enter, Escape</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Tags: Type and press Enter to add, click X to remove</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Suggested tags: Click to add, verify they disappear from suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Tag limit: Add 10 tags, verify input becomes disabled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Appliance type: Select option, change, clear selection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Form validation: Click &quot;Test Submit&quot; with empty title</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
