'use client';

/**
 * ItemManager Shell Test Page
 *
 * Test harness for verifying the basic ItemManager shell component
 * renders correctly in all states (empty, loading, error, with items).
 *
 * @module test/item-manager
 * @lastModified 2026-01-03 (REQ-057 Task 1.3.10)
 */

import { useState } from 'react';
import { ItemManager } from '@/components/ItemManager';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Mock Data
// =============================================================================

const mockItems: ItemRecord[] = [
  {
    id: '1',
    title: 'Kitchen Dishwasher',
    location: 'Kitchen',
    contentType: 'video',
    media: [],
    tags: ['appliance', 'kitchen'],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '2',
    title: 'Thermostat Operation',
    location: 'Living Room',
    contentType: 'image',
    media: [],
    tags: ['hvac', 'controls'],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: '3',
    title: 'Pool Maintenance Guide',
    contentType: 'pdf',
    media: [],
    tags: ['outdoor', 'maintenance'],
    createdAt: new Date('2026-01-03'),
  },
  {
    id: '4',
    title: 'WiFi Network Instructions',
    location: 'Office',
    contentType: 'text-only',
    media: [],
    instructions: 'Network name: GuestWifi\nPassword: welcome123',
    createdAt: new Date('2025-12-30'),
  },
];

// =============================================================================
// Test Page Component
// =============================================================================

export default function TestItemManagerPage() {
  const [testState, setTestState] = useState<'empty' | 'loading' | 'error' | 'items'>('items');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Determine what to render based on test state
  const getTestProps = () => {
    switch (testState) {
      case 'loading':
        return { items: [], loading: true };
      case 'error':
        return { items: [], error: new Error('Failed to load items - test error') };
      case 'empty':
        return { items: [] };
      case 'items':
      default:
        return { items: mockItems };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">ItemManager Shell Test</h1>
        <p className="text-sm text-gray-500 mt-1">REQ-057 Task 1.3.10 - Basic Usage Test</p>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Test State:</span>
          <div className="flex gap-2">
            {(['items', 'empty', 'loading', 'error'] as const).map((state) => (
              <button
                key={state}
                onClick={() => setTestState(state)}
                className={`px-3 py-1 text-sm rounded ${
                  testState === state
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected IDs: {selectedIds.join(', ')}
          </div>
        )}
      </div>

      {/* Test Container */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[500px]">
          <ItemManager
            {...getTestProps()}
            onEditItem={(item) => {
              console.log('[TEST] onEditItem:', item.id, item.title);
              alert(`Edit: ${item.title}`);
            }}
            onDeleteItems={(ids) => {
              console.log('[TEST] onDeleteItems:', ids);
              alert(`Delete: ${ids.join(', ')}`);
            }}
            onUpdateItem={(item) => {
              console.log('[TEST] onUpdateItem:', item.id, item);
            }}
            onDuplicateItem={(item) => {
              console.log('[TEST] onDuplicateItem:', item.id);
              alert(`Duplicate: ${item.title}`);
            }}
            onSelectionChange={(ids) => {
              console.log('[TEST] onSelectionChange:', ids);
              setSelectedIds(ids);
            }}
            config={{
              defaultView: 'grid',
              enableDuplicate: true,
            }}
          />
        </div>
      </div>

      {/* Console Log Info */}
      <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Open browser console to see callback invocations.
          Click Grid/List buttons to toggle view mode.
        </p>
      </div>
    </div>
  );
}
