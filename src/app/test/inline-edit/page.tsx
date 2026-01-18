'use client';

/**
 * InlineEdit Component Test Page
 *
 * Tests all functionality of the InlineEdit component:
 * - Display mode (click to edit)
 * - Edit mode (input field with auto-focus)
 * - Keyboard navigation (Enter to save, Escape to cancel)
 * - Loading state (spinner during save)
 * - Error state (validation and save failures)
 * - Blur to save behavior
 * - Accessibility features
 *
 * @lastModified 2026-01-03 (REQ-086)
 */

import { useState } from 'react';
import { InlineEdit } from '@/components/ItemManager';

export default function InlineEditTestPage() {
  // State for different test scenarios
  const [basicValue, setBasicValue] = useState('Click to edit this text');
  const [emptyValue, setEmptyValue] = useState('');
  const [validatedValue, setValidatedValue] = useState('Must be 3+ chars');
  const [slowSaveValue, setSlowSaveValue] = useState('Slow save (2s delay)');
  const [failingValue, setFailingValue] = useState('Will sometimes fail');
  const [longValue, setLongValue] = useState('This is a longer piece of text that might be truncated in display mode');

  // Track save counts for debugging
  const [saveLog, setSaveLog] = useState<string[]>([]);

  const log = (message: string) => {
    setSaveLog(prev => [...prev.slice(-9), message]);
  };

  // Basic save handler
  const handleBasicSave = async (newValue: string) => {
    log(`Saved basic: "${newValue}"`);
    setBasicValue(newValue);
  };

  // Empty value save handler
  const handleEmptySave = async (newValue: string) => {
    log(`Saved empty: "${newValue}"`);
    setEmptyValue(newValue);
  };

  // Validated save handler
  const handleValidatedSave = async (newValue: string) => {
    log(`Saved validated: "${newValue}"`);
    setValidatedValue(newValue);
  };

  // Slow save handler (simulates network delay)
  const handleSlowSave = async (newValue: string) => {
    log('Starting slow save...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    log(`Completed slow save: "${newValue}"`);
    setSlowSaveValue(newValue);
  };

  // Failing save handler (randomly fails)
  const handleFailingSave = async (newValue: string) => {
    log('Attempting save (may fail)...');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (Math.random() < 0.5) {
      throw new Error('Network error: Connection refused');
    }
    log(`Saved (succeeded): "${newValue}"`);
    setFailingValue(newValue);
  };

  // Long value save handler
  const handleLongSave = async (newValue: string) => {
    log(`Saved long: "${newValue.substring(0, 20)}..."`);
    setLongValue(newValue);
  };

  // Custom validation function
  const customValidate = (value: string): string | null => {
    if (value.toLowerCase().includes('forbidden')) {
      return 'Value cannot contain "forbidden"';
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">InlineEdit Component Test</h1>

        <p className="text-gray-600">
          Test all InlineEdit functionality below. Click on any value to edit it.
          Press Enter to save, Escape to cancel, or click outside to save.
        </p>

        {/* Test Scenarios */}
        <div className="space-y-6">
          {/* Basic Usage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Usage</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Click to edit:</label>
              <InlineEdit
                value={basicValue}
                onSave={handleBasicSave}
                ariaLabel="Basic text field"
              />
            </div>
          </div>

          {/* With Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">With Placeholder (allowEmpty: true)</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Empty value with placeholder:</label>
              <InlineEdit
                value={emptyValue}
                onSave={handleEmptySave}
                placeholder="Enter some text..."
                allowEmpty
                ariaLabel="Empty field with placeholder"
              />
            </div>
          </div>

          {/* With Validation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">With Validation</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-500">Min 3 chars, max 50, no &quot;forbidden&quot;:</label>
                <InlineEdit
                  value={validatedValue}
                  onSave={handleValidatedSave}
                  minLength={3}
                  maxLength={50}
                  validate={customValidate}
                  ariaLabel="Validated field"
                />
              </div>
              <p className="text-xs text-gray-400">
                Try: Empty value, 1-2 chars, or including &quot;forbidden&quot; to see errors
              </p>
            </div>
          </div>

          {/* Loading State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Loading State (2s delay)</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Slow save simulation:</label>
              <InlineEdit
                value={slowSaveValue}
                onSave={handleSlowSave}
                ariaLabel="Slow save field"
              />
            </div>
          </div>

          {/* Error State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Error State (50% failure rate)</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Random save failures:</label>
              <InlineEdit
                value={failingValue}
                onSave={handleFailingSave}
                ariaLabel="Failing field"
              />
            </div>
          </div>

          {/* Long Text with Truncation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Long Text (truncated in display)</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Long value with truncation:</label>
              <div className="max-w-md">
                <InlineEdit
                  value={longValue}
                  onSave={handleLongSave}
                  maxLength={200}
                  ariaLabel="Long text field"
                />
              </div>
            </div>
          </div>

          {/* Disabled State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Disabled State</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Cannot be edited:</label>
              <InlineEdit
                value="This field is disabled"
                onSave={async () => {}}
                disabled
                ariaLabel="Disabled field"
              />
            </div>
          </div>
        </div>

        {/* Save Log */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Save Log:</h3>
          <div className="font-mono text-sm text-green-400 space-y-1">
            {saveLog.length === 0 ? (
              <p className="text-gray-500">No saves yet...</p>
            ) : (
              saveLog.map((log, i) => (
                <p key={i}>{log}</p>
              ))
            )}
          </div>
        </div>

        {/* Keyboard Navigation Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Keyboard Navigation:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><kbd className="px-1 bg-blue-100 rounded">Tab</kbd> - Focus the component</li>
            <li><kbd className="px-1 bg-blue-100 rounded">Enter</kbd> or <kbd className="px-1 bg-blue-100 rounded">Space</kbd> - Enter edit mode (when focused)</li>
            <li><kbd className="px-1 bg-blue-100 rounded">Enter</kbd> - Save changes (while editing)</li>
            <li><kbd className="px-1 bg-blue-100 rounded">Escape</kbd> - Cancel changes (while editing)</li>
            <li>Click outside - Save changes (blur to save)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
