'use client';

/**
 * ItemCreationWorkflow Test Page
 *
 * Test harness for the ItemCreationWorkflow component.
 * Allows manual testing of the multi-step workflow UI.
 *
 * @module test/item-creation-workflow
 * @lastModified 2026-01-05
 */

import { useCallback, useState } from 'react';
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';
import type {
  CompletedSession,
  PartialSession,
  SessionItem,
  PrintScope
} from '@/components/ItemCreationWorkflow';

export default function ItemCreationWorkflowTestPage() {
  const [lastEvent, setLastEvent] = useState<string>('');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${event}`;
    setEventLog(prev => [...prev.slice(-9), logEntry]);
    setLastEvent(event);
  };

  const handleSessionComplete = useCallback((session: CompletedSession) => {
    logEvent(`Session Complete: ${session.newItems.length} items created`);
    console.log('Session complete:', session);
  }, []);

  const handleSessionExit = useCallback((session: PartialSession) => {
    logEvent(`Session Exit: from step "${session.currentStep}" with ${session.items.length} items`);
    console.log('Session exit:', session);
  }, []);

  const handleGeneratePDF = useCallback(async (items: SessionItem[], scope: PrintScope): Promise<Blob> => {
    logEvent(`Generate PDF: ${items.length} items, scope: ${scope.type}`);
    // Mock PDF generation
    return new Blob(['mock pdf'], { type: 'application/pdf' });
  }, []);

  const handlePrintDirect = useCallback(async (items: SessionItem[], scope: PrintScope): Promise<void> => {
    logEvent(`Print Direct: ${items.length} items, scope: ${scope.type}`);
    // Mock print
  }, []);

  const handleFetchExistingItems = useCallback(async (): Promise<SessionItem[]> => {
    logEvent('Fetch Existing Items');
    return [];
  }, []);

  const handleSaveItem = useCallback(async (item: SessionItem): Promise<{ id: string; qrCodeUrl: string }> => {
    logEvent(`Save Item: ${item.name}`);
    return { id: crypto.randomUUID(), qrCodeUrl: 'https://example.com/qr' };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Test Controls Header - Fixed at top */}
      <div className="bg-gray-900 text-white p-4 shrink-0">
        <h1 className="text-lg font-bold mb-2">ItemCreationWorkflow Test Page</h1>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-400">Last Event:</span>{' '}
            <span className="text-green-400">{lastEvent || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Main Component Area */}
      <div className="flex-1 flex flex-col">
        <ItemCreationWorkflow
          onSessionComplete={handleSessionComplete}
          onSessionExit={handleSessionExit}
          onGeneratePDF={handleGeneratePDF}
          onPrintDirect={handlePrintDirect}
          onFetchExistingItems={handleFetchExistingItems}
          onSaveItem={handleSaveItem}
        />
      </div>

      {/* Event Log - Fixed at bottom */}
      <div className="bg-gray-800 text-white p-2 text-xs max-h-32 overflow-auto shrink-0">
        <div className="font-bold text-gray-400 mb-1">Event Log:</div>
        {eventLog.length === 0 ? (
          <div className="text-gray-500">No events yet...</div>
        ) : (
          eventLog.map((log, i) => (
            <div key={i} className="text-gray-300">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
