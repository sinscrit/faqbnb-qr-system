'use client';

/**
 * ItemCapture Test Harness Page
 *
 * Developer test environment for isolated testing of the ItemCapture wizard.
 * Features:
 * - Console output of onComplete ItemRecord with structured formatting
 * - Session counter for tracking test iterations
 * - Output preview panel for quick visual inspection
 * - Zero network requests (verify in DevTools → Network tab)
 *
 * @route /test/item-capture
 * @created 2025-12-31
 * @lastModified 2025-12-31
 * @request REQ-055
 */

import { useState, useCallback } from 'react';
import { ItemCapture, type ItemRecord } from '@/components/ItemCapture';

export default function TestItemCapturePage() {
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  /**
   * JSON replacer function for serializing non-standard types.
   * Converts Blob, File, and Date objects to human-readable strings.
   */
  const jsonReplacer = useCallback((key: string, value: unknown): unknown => {
    if (value instanceof Blob) {
      return `[Blob: ${value.size} bytes, ${value.type}]`;
    }
    if (value instanceof File) {
      return `[File: ${value.name}, ${value.size} bytes, ${value.type}]`;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }, []);

  /**
   * Handler for successful wizard completion.
   * Logs the ItemRecord to console with structured formatting.
   */
  const handleComplete = useCallback(
    (record: ItemRecord) => {
      const timestamp = new Date().toISOString();
      const formatted = JSON.stringify(record, jsonReplacer, 2);

      // Log to console with clear separator lines
      console.log('==================================================');
      console.log(`=== ITEM CAPTURE OUTPUT [${timestamp}] ===`);
      console.log('==================================================');
      console.log(formatted);
      console.log('==================================================');

      // Update state for UI display
      setLastOutput(formatted);
      setSessionCount((prev) => prev + 1);
    },
    [jsonReplacer]
  );

  /**
   * Handler for wizard cancellation.
   * Logs cancel event to console.
   */
  const handleCancel = useCallback(() => {
    const timestamp = new Date().toISOString();

    console.log('==================================================');
    console.log(`=== ITEM CAPTURE CANCELLED [${timestamp}] ===`);
    console.log('==================================================');

    // Clear the output panel on cancel
    setLastOutput(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header section */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              ItemCapture Test Harness
            </h1>
            <p className="text-sm text-gray-500">
              Development & debugging environment
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-sm text-gray-600">
              Sessions completed:{' '}
              <span className="font-mono font-bold">{sessionCount}</span>
            </span>
            <span className="text-xs text-gray-400">
              Open DevTools → Network to verify zero requests
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <ItemCapture
            onComplete={handleComplete}
            onCancel={handleCancel}
            config={{
              debug: true,
              maxVideoDuration: 120,
              maxPhotos: 10,
            }}
          />
        </div>
      </main>

      {/* Output preview panel - fixed at bottom */}
      {lastOutput && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-green-400 p-4 max-h-48 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-400">
              Last onComplete output (also logged to console):
            </span>
            <button
              onClick={() => setLastOutput(null)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {lastOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
