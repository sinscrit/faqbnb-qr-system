'use client';

/**
 * PrintOptionsPanel Test Page
 *
 * Test harness for the PrintOptionsPanel component.
 * Allows manual testing of the print scope selection and action buttons.
 *
 * @module test/print-options-panel
 * @lastModified 2026-01-05 (REQ-110 Print Options Panel)
 */

import { useState, useCallback } from 'react';
import { PrintOptionsPanel } from '@/components/ItemCreationWorkflow/components/shared';
import type { SessionItem, PrintScope, ContentPiece } from '@/components/ItemCreationWorkflow';

// =============================================================================
// Mock Data
// =============================================================================

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: { type: 'url', url: 'https://example.com' },
  order: 0,
};

const mockSessionItems: SessionItem[] = [
  {
    id: 'session-1',
    name: 'Dishwasher',
    room: 'kitchen',
    itemType: 'appliance',
    content: [mockPhotoContent],
    createdAt: new Date(),
  },
  {
    id: 'session-2',
    name: 'Microwave',
    room: 'kitchen',
    itemType: 'appliance',
    content: [mockTextContent],
    createdAt: new Date(),
  },
  {
    id: 'session-3',
    name: 'Smart TV',
    room: 'living-room',
    itemType: 'appliance',
    content: [mockUrlContent],
    createdAt: new Date(),
  },
];

const mockExistingItems: SessionItem[] = [
  {
    id: 'existing-1',
    name: 'Refrigerator',
    room: 'kitchen',
    itemType: 'appliance',
    content: [mockPhotoContent],
    createdAt: new Date(Date.now() - 86400000),
    qrCodeUrl: 'https://example.com/qr/fridge',
  },
  {
    id: 'existing-2',
    name: 'Washing Machine',
    room: 'laundry',
    itemType: 'appliance',
    content: [mockTextContent],
    createdAt: new Date(Date.now() - 172800000),
    qrCodeUrl: 'https://example.com/qr/washer',
  },
];

// =============================================================================
// Test Page Component
// =============================================================================

export default function PrintOptionsPanelTestPage() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState(false);
  const [simulateDelay, setSimulateDelay] = useState(true);

  const logEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${event}`;
    setEventLog(prev => [...prev.slice(-19), logEntry]);
  }, []);

  const handleGeneratePDF = useCallback(async (scope: PrintScope) => {
    logEvent(`Generate PDF clicked - scope: ${scope.type}`);
    if (scope.type === 'selected') {
      logEvent(`  Selected IDs: ${(scope as { itemIds: string[] }).itemIds.join(', ')}`);
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (simulateDelay) {
        setProcessingStatus('Preparing items...');
        await new Promise(r => setTimeout(r, 500));
        setProcessingStatus('Generating QR codes...');
        await new Promise(r => setTimeout(r, 1000));
        setProcessingStatus('Creating PDF...');
        await new Promise(r => setTimeout(r, 1000));
      }

      if (simulateError) {
        throw new Error('Simulated PDF generation error');
      }

      logEvent('PDF generated successfully!');
      setProcessingStatus('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logEvent(`Error: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  }, [logEvent, simulateError, simulateDelay]);

  const handlePrintDirect = useCallback(async (scope: PrintScope) => {
    logEvent(`Print Directly clicked - scope: ${scope.type}`);
    if (scope.type === 'selected') {
      logEvent(`  Selected IDs: ${(scope as { itemIds: string[] }).itemIds.join(', ')}`);
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (simulateDelay) {
        setProcessingStatus('Preparing print job...');
        await new Promise(r => setTimeout(r, 1000));
      }

      if (simulateError) {
        throw new Error('Simulated print error');
      }

      logEvent('Print job sent successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logEvent(`Error: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  }, [logEvent, simulateError, simulateDelay]);

  const handleSkipPrint = useCallback(() => {
    logEvent('Done for Now clicked - skipping print');
  }, [logEvent]);

  const handleClearError = useCallback(() => {
    setError(null);
    logEvent('Error dismissed');
  }, [logEvent]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header with Controls */}
      <div className="bg-gray-900 text-white p-4 shrink-0">
        <h1 className="text-lg font-bold mb-3">PrintOptionsPanel Test Page</h1>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={simulateDelay}
              onChange={(e) => setSimulateDelay(e.target.checked)}
              className="rounded"
            />
            <span>Simulate Delay</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="rounded"
            />
            <span>Simulate Error</span>
          </label>

          <button
            onClick={() => setError('Manual test error message')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Trigger Error
          </button>

          <button
            onClick={() => setEventLog([])}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Main Content Area - Simulating Mobile View */}
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <PrintOptionsPanel
            sessionItems={mockSessionItems}
            existingItems={mockExistingItems}
            onGeneratePDF={handleGeneratePDF}
            onPrintDirect={handlePrintDirect}
            onSkipPrint={handleSkipPrint}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
            error={error}
            onClearError={handleClearError}
          />
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-gray-800 text-white p-3 text-xs shrink-0 max-h-48 overflow-auto">
        <div className="font-bold text-gray-400 mb-2">Event Log:</div>
        {eventLog.length === 0 ? (
          <div className="text-gray-500">No events yet... Interact with the component above.</div>
        ) : (
          <div className="space-y-1">
            {eventLog.map((log, i) => (
              <div key={i} className="text-gray-300 font-mono">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
