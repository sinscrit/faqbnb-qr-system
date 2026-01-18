'use client';

/**
 * Test harness for ItemPreviewModal component.
 *
 * Provides interactive testing of modal behavior across different scenarios:
 * - Standard item preview
 * - Long title/content handling
 * - Fallback title behavior
 * - Preview actions (Edit, Manage Assets, Delete) - REQ-079
 *
 * @module test/item-preview-modal
 * @lastModified 2026-01-03 (REQ-079 - Added preview actions testing)
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

const itemWithManyTags: ItemRecord = {
  ...mockItem,
  id: 'test-item-4',
  title: 'Item with Many Tags',
  tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'],
};

const itemNoLocation: ItemRecord = {
  ...mockItem,
  id: 'test-item-5',
  title: 'Item without Location',
  location: undefined,
  tags: ['test'],
};

// =============================================================================
// Test Harness Component
// =============================================================================

export default function TestItemPreviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemRecord>(mockItem);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [enableAssetManagement, setEnableAssetManagement] = useState(true);

  const openWithItem = (item: ItemRecord) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [`[${timestamp}] Modal closed`, ...prev.slice(0, 9)]);
    setIsOpen(false);
  };

  const handleEditItem = (item: ItemRecord) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [
      `[${timestamp}] Edit clicked for: "${item.title}"`,
      ...prev.slice(0, 9),
    ]);
  };

  const handleDeleteItems = (ids: string[]) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [
      `[${timestamp}] Delete confirmed for IDs: ${ids.join(', ')}`,
      ...prev.slice(0, 9),
    ]);
  };

  const handleManageAssets = (item: ItemRecord) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [
      `[${timestamp}] Manage Assets clicked for: "${item.title}"`,
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-2">ItemPreviewModal Test Harness</h1>
      <p className="text-sm text-gray-500 mb-6">REQ-079 - Preview Actions - Last modified: 2026-01-03</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {/* Test Case Buttons */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Test Cases</h2>

          <div className="space-y-2">
            <button
              onClick={() => openWithItem(mockItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Standard Item (with location + tags)
            </button>

            <button
              onClick={() => openWithItem(longContentItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Long Title/Content
            </button>

            <button
              onClick={() => openWithItem(noTitleItem)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              No Title (fallback)
            </button>

            <button
              onClick={() => openWithItem(itemWithManyTags)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Many Tags (10 tags)
            </button>

            <button
              onClick={() => openWithItem(itemNoLocation)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              No Location
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">Configuration (REQ-079)</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableAssetManagement}
                onChange={(e) => setEnableAssetManagement(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable Asset Management button</span>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium text-sm mb-2">Callbacks Status:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                onEditItem: Connected
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                onDeleteItems: Connected
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${enableAssetManagement ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                onManageAssets: {enableAssetManagement ? 'Connected' : 'Disabled'}
              </li>
            </ul>
          </div>
        </div>

        {/* Verification Checklist - Metadata (Task 4.6.1) */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">4.6.1 - Metadata Display</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Title displays prominently (text-xl font-semibold)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Location displays with MapPin icon</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Location hidden when undefined/empty</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Tags display as pill badges</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Tags hidden when empty/undefined</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Many tags wrap to multiple lines</span>
            </li>
          </ul>
        </div>

        {/* Verification Checklist - Action Buttons (Tasks 4.6.2-4.6.5) */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">4.6.2-4.6.5 - Action Buttons</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Edit button: Blue primary style</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Manage Assets: White/gray secondary style</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Delete button: Red destructive style</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>All buttons have icons</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>All buttons 44px min height (touch)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Delete aligns right on desktop</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Buttons stack on mobile (&lt;640px)</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Delete shows confirmation dialog</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Confirmation shows item title</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Cancel closes dialog, no delete</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Confirm deletes and closes modal</span>
            </li>
          </ul>
        </div>

        {/* Verification Checklist - Keyboard (Task 4.6.6) */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">4.6.6 - Keyboard Navigation</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Tab cycles through buttons</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Enter/Space activates buttons</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Escape closes delete dialog</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Focus moves to Cancel when dialog opens</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Focus returns to Delete when dialog closes</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Focus trapped in dialog (Tab cycles)</span>
            </li>
          </ul>
        </div>

        {/* Mobile Responsive Testing (Task 4.6.8) */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">4.6.8 - Mobile Responsive</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>320px viewport: buttons stack vertically</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>375px viewport: buttons stack vertically</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>768px+ viewport: buttons horizontal</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>No horizontal scrolling</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Confirmation dialog fits on mobile</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Long titles truncate/wrap properly</span>
            </li>
          </ul>
        </div>

        {/* Action Log */}
        <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
          <h2 className="font-semibold mb-3">Action Log</h2>
          <p className="text-sm text-gray-600 mb-2">
            Modal state: <span className={isOpen ? 'text-green-600 font-medium' : 'text-gray-500'}>{isOpen ? 'Open' : 'Closed'}</span>
            {' | '}
            Selected item: {selectedItem?.title || '(no title)'}
          </p>
          <div className="mt-2 text-xs font-mono text-gray-500 space-y-1 max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
            {actionLog.length === 0 ? (
              <p className="text-gray-400 italic">No actions logged yet. Click buttons in the modal to see logs here.</p>
            ) : (
              actionLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
          <button
            onClick={() => setActionLog([])}
            className="mt-2 px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
          >
            Clear Log
          </button>
        </div>

        {/* Scrollable Content Test */}
        <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
          <h2 className="font-semibold mb-3">Background Scroll Test</h2>
          <p className="text-sm text-gray-600 mb-2">
            This content helps test that background scrolling is locked when the modal is open.
          </p>
          <div className="h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm text-gray-500">
            {Array(30).fill(null).map((_, i) => (
              <p key={i}>Scrollable content line {i + 1}</p>
            ))}
          </div>
        </div>
      </div>

      {/* The modal component with all REQ-079 features */}
      <ItemPreviewModal
        isOpen={isOpen}
        onClose={handleClose}
        item={selectedItem}
        onEditItem={handleEditItem}
        onDeleteItems={handleDeleteItems}
        onManageAssets={enableAssetManagement ? handleManageAssets : undefined}
        config={{
          enableAssetManagement,
        }}
      >
        <div className="space-y-4">
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
