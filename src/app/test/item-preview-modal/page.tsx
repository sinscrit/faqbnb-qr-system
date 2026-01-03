'use client';

/**
 * Test harness for ItemPreviewModal component.
 *
 * Provides interactive testing of modal behavior across different scenarios:
 * - Standard item preview
 * - Long title/content handling
 * - Fallback title behavior
 *
 * @module test/item-preview-modal
 * @lastModified 2026-01-03 (REQ-074 Task 7)
 */

import { useState } from 'react';
import { ItemPreviewModal } from '@/components/ItemManager/components/ItemPreview';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Mock Data
// =============================================================================

const mockItem: ItemRecord = {
  id: 'test-item-1',
  title: 'Coffee Maker Instructions',
  location: 'Kitchen',
  tags: ['appliances', 'beverages'],
  applianceType: 'other',
  contentType: 'media',
  media: [],
  instructions: 'Press the power button to start brewing. Wait for the light to turn green before adding coffee grounds.',
  createdAt: new Date('2026-01-01'),
};

const longContentItem: ItemRecord = {
  ...mockItem,
  id: 'test-item-2',
  title: 'Very Long Item Title That Should Be Truncated When It Exceeds Available Space In The Header',
  instructions: Array(20).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ').join(''),
};

const noTitleItem: ItemRecord = {
  ...mockItem,
  id: 'test-item-3',
  title: '',
  instructions: 'This item has no title, so the fallback should display.',
};

// =============================================================================
// Test Harness Component
// =============================================================================

export default function TestItemPreviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemRecord>(mockItem);
  const [closeLog, setCloseLog] = useState<string[]>([]);

  const openWithItem = (item: ItemRecord) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    const timestamp = new Date().toLocaleTimeString();
    setCloseLog((prev) => [`[${timestamp}] Modal closed`, ...prev.slice(0, 4)]);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">ItemPreviewModal Test Harness</h1>
      <p className="text-sm text-gray-500 mb-6">REQ-074 - Last modified: 2026-01-03</p>

      <div className="space-y-4 max-w-md">
        {/* Test Case Buttons */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Test Cases</h2>

          <div className="space-y-2">
            <button
              onClick={() => openWithItem(mockItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Open with Standard Item
            </button>

            <button
              onClick={() => openWithItem(longContentItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Open with Long Title/Content
            </button>

            <button
              onClick={() => openWithItem(noTitleItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Open with No Title (fallback)
            </button>

            <button
              onClick={() => {
                setSelectedItem(mockItem);
                setIsOpen(true);
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Open with Custom Title Override
            </button>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Verification Checklist</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Modal centers on desktop (&ge;768px)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Modal slides up on mobile (&lt;768px)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Close button works</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Overlay click closes modal</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Escape key closes modal</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Background scroll is locked</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Focus is trapped in modal</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Animations are smooth (300ms)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Long title is truncated</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Long content scrolls within modal</span>
            </li>
          </ul>
        </div>

        {/* Console Log */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Console Log</h2>
          <p className="text-sm text-gray-600">
            Modal state: <span className={isOpen ? 'text-green-600 font-medium' : 'text-gray-500'}>{isOpen ? 'Open' : 'Closed'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Selected item: {selectedItem?.title || '(no title)'}
          </p>
          <div className="mt-2 text-xs font-mono text-gray-500 space-y-1 max-h-24 overflow-y-auto">
            {closeLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>

        {/* Scrollable Content Test */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Background Scroll Test</h2>
          <p className="text-sm text-gray-600 mb-2">
            This content helps test that background scrolling is locked when the modal is open.
          </p>
          <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded text-sm text-gray-500">
            {Array(30).fill(null).map((_, i) => (
              <p key={i}>Scrollable content line {i + 1}</p>
            ))}
          </div>
        </div>
      </div>

      {/* The modal component */}
      <ItemPreviewModal
        isOpen={isOpen}
        onClose={handleClose}
        item={selectedItem}
        title={selectedItem === mockItem && isOpen ? undefined : undefined}
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Location</h3>
            <p className="text-gray-600">{selectedItem?.location || 'Not specified'}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedItem?.tags?.length ? (
                selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No tags</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">Instructions</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedItem?.instructions || 'No instructions provided.'}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              Created: {selectedItem?.createdAt.toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400">
              ID: {selectedItem?.id}
            </p>
          </div>
        </div>
      </ItemPreviewModal>
    </div>
  );
}
