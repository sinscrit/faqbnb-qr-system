'use client';

/**
 * ItemManager Shell Test Page
 *
 * Test harness for verifying the basic ItemManager shell component
 * renders correctly in all states (empty, loading, error, with items).
 *
 * @module test/item-manager
 * @lastModified 2026-01-03 (REQ-080 Task 7 - Added useAssetManagement hook tests)
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ItemManager, ItemCard, ItemRow, useAssetManagement, AssetPanel } from '@/components/ItemManager';
import { MediaGallery } from '@/components/ItemManager/components/ItemPreview';
import type { ItemRecord, MediaItem } from '@/components/ItemCapture';

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
// ItemCard Test Mock Data (REQ-058)
// =============================================================================

/**
 * Creates a mock media item for testing thumbnails.
 */
function createMockMedia(type: 'video' | 'image' | 'pdf', withThumbnail = false): MediaItem {
  // Create a simple colored blob as a mock image
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  let blob: Blob | null = null;

  if (canvas) {
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Different colors for different types
      const colors: Record<string, string> = {
        video: '#ef4444',
        image: '#22c55e',
        pdf: '#3b82f6',
      };
      ctx.fillStyle = colors[type] || '#888';
      ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = '#fff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(type.toUpperCase(), 160, 90);
    }
  }

  return {
    id: `media-${type}-${Date.now()}`,
    type,
    file: new Blob(['mock file content'], { type: type === 'pdf' ? 'application/pdf' : `${type === 'video' ? 'video' : 'image'}/mp4` }),
    thumbnail: withThumbnail && blob ? blob : undefined,
    order: 0,
    metadata: {
      mimeType: type === 'pdf' ? 'application/pdf' : type === 'video' ? 'video/mp4' : 'image/jpeg',
      fileSize: 1024,
      source: 'capture',
    },
  };
}

/**
 * Mock items specifically for ItemCard testing with various content types and states.
 */
const itemCardMockItems: ItemRecord[] = [
  {
    id: 'video-item',
    title: 'How to use the coffee maker - this is a very long title that should truncate after two lines of text display',
    location: 'Kitchen',
    contentType: 'media',
    media: [createMockMedia('video')],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'image-item',
    title: 'Thermostat Settings',
    location: 'Living Room',
    contentType: 'media',
    media: [createMockMedia('image')],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'pdf-item',
    title: 'Pool Maintenance Manual',
    location: 'Backyard',
    contentType: 'media',
    media: [createMockMedia('pdf')],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'text-item',
    title: 'WiFi Password Instructions',
    location: 'Office',
    contentType: 'text-only',
    media: [],
    instructions: 'Network: GuestWiFi\nPassword: Welcome123',
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'mixed-item',
    title: 'Complete House Guide with Video and PDF',
    location: 'All Rooms',
    contentType: 'mixed',
    media: [createMockMedia('video'), createMockMedia('pdf')],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'no-location-item',
    title: 'General Instructions',
    contentType: 'media',
    media: [createMockMedia('image')],
    createdAt: new Date('2026-01-02'),
  },
];

// =============================================================================
// MediaGallery Test Mock Data (REQ-075)
// =============================================================================

/**
 * Creates mock media items for MediaGallery testing.
 * Uses colored canvas blobs to simulate different media types.
 */
function createGalleryMockMediaItems(): MediaItem[] {
  // Create colored canvas blobs for each type
  const createColoredBlob = (color: string, text: string): Blob | null => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 320, 240);
    // Convert to blob synchronously using toDataURL
    const dataUrl = canvas.toDataURL('image/png');
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const imageBlob1 = createColoredBlob('#22c55e', 'IMAGE 1');
  const imageBlob2 = createColoredBlob('#16a34a', 'IMAGE 2');
  const videoBlob = createColoredBlob('#9333ea', 'VIDEO');
  const pdfBlob = createColoredBlob('#f59e0b', 'PDF');

  return [
    {
      id: 'gallery-img-1',
      type: 'image',
      file: imageBlob1 || new Blob(['image'], { type: 'image/png' }),
      thumbnail: imageBlob1 || undefined,
      order: 0,
      metadata: {
        mimeType: 'image/png',
        fileSize: 1024,
        source: 'capture',
        originalFilename: 'photo-1.png',
      },
    },
    {
      id: 'gallery-vid-1',
      type: 'video',
      file: new Blob(['video'], { type: 'video/mp4' }),
      thumbnail: videoBlob || undefined,
      order: 1,
      metadata: {
        mimeType: 'video/mp4',
        fileSize: 5120,
        source: 'upload',
        duration: 125,
        originalFilename: 'demo-video.mp4',
      },
    },
    {
      id: 'gallery-pdf-1',
      type: 'pdf',
      file: new Blob(['pdf'], { type: 'application/pdf' }),
      thumbnail: pdfBlob || undefined,
      order: 2,
      metadata: {
        mimeType: 'application/pdf',
        fileSize: 2048,
        source: 'upload',
        pageCount: 5,
        originalFilename: 'manual.pdf',
      },
    },
    {
      id: 'gallery-img-2',
      type: 'image',
      file: imageBlob2 || new Blob(['image'], { type: 'image/png' }),
      thumbnail: imageBlob2 || undefined,
      order: 3,
      metadata: {
        mimeType: 'image/png',
        fileSize: 2048,
        source: 'capture',
        originalFilename: 'photo-2.png',
      },
    },
  ];
}

// =============================================================================
// ItemRow Test Mock Data (REQ-059)
// =============================================================================

/**
 * Mock items specifically for ItemRow testing with various content types, tags, and states.
 */
const itemRowMockItems: ItemRecord[] = [
  {
    id: 'row-video-item',
    title: 'How to use the coffee maker in the kitchen - this is a very long title that should truncate properly',
    location: 'Kitchen',
    contentType: 'media',
    media: [createMockMedia('video')],
    instructions: 'Press the power button and wait for it to heat up before brewing.',
    tags: ['appliances', 'morning', 'essential', 'daily', 'breakfast'],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'row-image-item',
    title: 'Thermostat Settings Guide',
    location: 'Living Room',
    contentType: 'media',
    media: [createMockMedia('image')],
    instructions: 'Set to 72F for comfortable temperature.',
    tags: ['hvac', 'controls'],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'row-pdf-item',
    title: 'Pool Maintenance Schedule',
    location: 'Backyard',
    contentType: 'pdf-only',
    media: [createMockMedia('pdf')],
    tags: ['outdoor', 'maintenance', 'weekly'],
    createdAt: new Date('2025-12-28'),
  },
  {
    id: 'row-text-item',
    title: 'WiFi Network Credentials',
    location: 'Office',
    contentType: 'text-only',
    media: [],
    instructions: 'Network: GuestWiFi | Password: Welcome2026!',
    tags: ['internet'],
    createdAt: new Date('2025-12-15'),
  },
  {
    id: 'row-mixed-item',
    title: 'Complete House Tour with Video and Instructions',
    location: 'All Areas',
    contentType: 'mixed',
    media: [createMockMedia('video'), createMockMedia('pdf')],
    instructions: 'Watch the video for a full house tour, refer to PDF for details.',
    tags: ['welcome', 'tour', 'overview'],
    createdAt: new Date('2026-01-03'),
  },
  {
    id: 'row-no-tags-item',
    title: 'Simple Item Without Tags',
    location: 'Garage',
    contentType: 'media',
    media: [createMockMedia('image')],
    createdAt: new Date('2025-11-01'),
  },
  {
    id: 'row-no-location-item',
    title: 'Item Without Location Field',
    contentType: 'media',
    media: [createMockMedia('image')],
    tags: ['misc'],
    createdAt: new Date('2025-10-15'),
  },
  {
    id: 'row-no-instructions-item',
    title: 'Item With No Instructions',
    location: 'Basement',
    contentType: 'media',
    media: [createMockMedia('video')],
    tags: ['storage'],
    createdAt: new Date('2025-09-20'),
  },
];

// =============================================================================
// useAssetManagement Hook Test Component (REQ-080)
// =============================================================================

/**
 * Mock MediaItem data for testing useAssetManagement hook.
 */
function createAssetMockMediaItem(id: string, type: 'video' | 'image' | 'pdf'): MediaItem {
  return {
    id,
    type,
    file: new Blob(['mock content'], { type: type === 'pdf' ? 'application/pdf' : `${type}/mock` }),
    order: 0,
    metadata: {
      mimeType: type === 'pdf' ? 'application/pdf' : `${type}/mock`,
      fileSize: 1024,
      source: 'upload',
    },
  };
}

const assetMockItems: MediaItem[] = [
  createAssetMockMediaItem('asset-1', 'image'),
  createAssetMockMediaItem('asset-2', 'video'),
  createAssetMockMediaItem('asset-3', 'pdf'),
];

/**
 * Test component for useAssetManagement hook.
 */
function AssetManagementHookTest() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const {
    isActive,
    currentAssets,
    pendingAdditions,
    pendingRemovalIds,
    isDirty,
    isCommitting,
    error,
    startSession,
    endSession,
    addAsset,
    removeAsset,
    undoRemoval,
    reorderAssets,
    commit,
    discard,
    isPendingAddition,
    isPendingRemoval,
  } = useAssetManagement({
    debug: true,
    onAddAssets: async (itemId, files) => {
      addLog(`onAddAssets called: itemId=${itemId}, files=${files.length}`);
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onRemoveAssets: async (itemId, assetIds) => {
      addLog(`onRemoveAssets called: itemId=${itemId}, assetIds=${assetIds.join(', ')}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onReorderAssets: async (itemId, orderedIds) => {
      addLog(`onReorderAssets called: itemId=${itemId}, order=${orderedIds.join(', ')}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  const handleStartSession = () => {
    startSession('test-item-123', assetMockItems);
    addLog('Session started with 3 mock assets');
  };

  const handleAddFile = () => {
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    addAsset(file).then((success) => {
      addLog(`Add file result: ${success ? 'success' : 'failed'}`);
    });
  };

  const handleAddInvalidFile = () => {
    const file = new File(['test content'], 'document.txt', { type: 'text/plain' });
    addAsset(file).then((success) => {
      addLog(`Add invalid file result: ${success ? 'success' : 'failed (expected)'}`);
    });
  };

  const handleRemoveFirst = () => {
    if (currentAssets.length > 0) {
      const first = currentAssets[0];
      removeAsset(first.id);
      addLog(`Removed asset: ${first.id}`);
    }
  };

  const handleReorder = () => {
    if (currentAssets.length >= 2) {
      reorderAssets(0, 1);
      addLog('Reordered: moved first asset to second position');
    }
  };

  const handleCommit = async () => {
    addLog('Committing changes...');
    const success = await commit();
    addLog(`Commit result: ${success ? 'success' : 'failed'}`);
  };

  const handleDiscard = () => {
    discard();
    addLog('Changes discarded');
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">useAssetManagement Hook Test (REQ-080)</h2>

      {/* Status Panel */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Hook State</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">isActive:</span>{' '}
            <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
              {isActive ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">isDirty:</span>{' '}
            <span className={isDirty ? 'text-orange-600' : 'text-gray-500'}>
              {isDirty ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">isCommitting:</span>{' '}
            <span className={isCommitting ? 'text-blue-600' : 'text-gray-500'}>
              {isCommitting ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">currentAssets:</span> {currentAssets.length}
          </div>
          <div>
            <span className="font-medium">pendingAdditions:</span> {pendingAdditions.length}
          </div>
          <div>
            <span className="font-medium">pendingRemovals:</span> {pendingRemovalIds.length}
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            Error: {error.message} ({error.code})
          </div>
        )}
      </div>

      {/* Actions Panel */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleStartSession}
            disabled={isActive}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Start Session
          </button>
          <button
            onClick={() => { endSession(); addLog('Session ended'); }}
            disabled={!isActive}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            End Session
          </button>
          <button
            onClick={handleAddFile}
            disabled={!isActive}
            className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Add Valid File
          </button>
          <button
            onClick={handleAddInvalidFile}
            disabled={!isActive}
            className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
          >
            Add Invalid File (Test Error)
          </button>
          <button
            onClick={handleRemoveFirst}
            disabled={!isActive || currentAssets.length === 0}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Remove First
          </button>
          <button
            onClick={handleReorder}
            disabled={!isActive || currentAssets.length < 2}
            className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Swap 1 & 2
          </button>
          <button
            onClick={handleCommit}
            disabled={!isActive || !isDirty || isCommitting}
            className="px-3 py-1 bg-emerald-500 text-white rounded disabled:opacity-50"
          >
            Commit
          </button>
          <button
            onClick={handleDiscard}
            disabled={!isActive || !isDirty}
            className="px-3 py-1 bg-orange-500 text-white rounded disabled:opacity-50"
          >
            Discard
          </button>
        </div>
      </div>

      {/* Current Assets Panel */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Current Assets</h3>
        {currentAssets.length === 0 ? (
          <p className="text-gray-500 text-sm">No assets (start a session to add mock assets)</p>
        ) : (
          <ul className="space-y-2">
            {currentAssets.map((asset, index) => (
              <li
                key={asset.id}
                className={`p-2 rounded text-sm flex justify-between ${
                  isPendingAddition(asset.id)
                    ? 'bg-green-100 border border-green-300'
                    : isPendingRemoval(asset.id)
                    ? 'bg-red-100 border border-red-300'
                    : 'bg-gray-100'
                }`}
              >
                <span>
                  {index + 1}. {asset.id} ({asset.type})
                  {isPendingAddition(asset.id) && ' [PENDING ADD]'}
                  {isPendingRemoval(asset.id) && ' [PENDING REMOVE]'}
                </span>
                {isPendingRemoval(asset.id) && (
                  <button
                    onClick={() => { undoRemoval(asset.id); addLog(`Undo removal: ${asset.id}`); }}
                    className="text-blue-600 hover:underline"
                  >
                    Undo
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logs Panel */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Event Log</h3>
        <div className="h-48 overflow-y-auto bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-500">No events yet. Click &quot;Start Session&quot; to begin.</p>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>

      {/* Test Cases Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><span className="font-medium">Start Session:</span> Initialize with 3 mock assets (image, video, PDF)</li>
          <li><span className="font-medium">Add Valid File:</span> Add a JPG file (should succeed)</li>
          <li><span className="font-medium">Add Invalid File:</span> Add a TXT file (should fail with error)</li>
          <li><span className="font-medium">Remove First:</span> Mark first asset for removal</li>
          <li><span className="font-medium">Swap 1 & 2:</span> Reorder assets (move first to second position)</li>
          <li><span className="font-medium">Commit:</span> Apply all changes (calls onAddAssets, onRemoveAssets, onReorderAssets)</li>
          <li><span className="font-medium">Discard:</span> Revert all changes to original state</li>
        </ul>
        <div className="mt-3 text-sm text-gray-500">
          <p>Check browser console for debug logging. No network requests should be made.</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Test Page Component
// =============================================================================

export default function TestItemManagerPage() {
  const [testState, setTestState] = useState<'empty' | 'loading' | 'error' | 'items'>('items');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [testView, setTestView] = useState<'manager' | 'card' | 'row' | 'gallery' | 'asset-hook' | 'asset-panel'>('asset-panel');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [cardSelectedIds, setCardSelectedIds] = useState<Set<string>>(new Set());
  const [rowSelectedIds, setRowSelectedIds] = useState<Set<string>>(new Set());
  const [showManageAssets, setShowManageAssets] = useState(true);
  const [showDuplicate, setShowDuplicate] = useState(true);

  // MediaGallery state (REQ-075)
  const [galleryMediaItems, setGalleryMediaItems] = useState<MediaItem[]>([]);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const [galleryControlledMode, setGalleryControlledMode] = useState(false);
  const [galleryShowThumbnails, setGalleryShowThumbnails] = useState(true);
  const [galleryEnableFullScreen, setGalleryEnableFullScreen] = useState(true);

  // AssetPanel state (REQ-081)
  const [assetPanelItem, setAssetPanelItem] = useState<ItemRecord | null>(null);

  // Initialize gallery mock data on client side
  useEffect(() => {
    setGalleryMediaItems(createGalleryMockMediaItems());
  }, []);

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

  // Handler for ItemCard selection change
  const handleCardSelectionChange = (id: string, selected: boolean) => {
    console.log('[TEST] ItemCard onSelectionChange:', id, selected);
    setCardSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  // Handler for ItemCard preview click
  const handleCardPreviewClick = (item: ItemRecord) => {
    console.log('[TEST] ItemCard onPreviewClick:', item.id, item.title);
    alert(`Preview: ${item.title}`);
  };

  // Handler for ItemRow selection change
  const handleRowSelectionChange = (id: string, selected: boolean) => {
    console.log('[TEST] ItemRow onSelectionChange:', id, selected);
    setRowSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  // Handler for ItemRow preview click
  const handleRowPreviewClick = (item: ItemRecord) => {
    console.log('[TEST] ItemRow onPreviewClick:', item.id, item.title);
    alert(`Preview: ${item.title}`);
  };

  // Handler for ItemRow edit
  const handleRowEdit = (item: ItemRecord) => {
    console.log('[TEST] ItemRow onEdit:', item.id, item.title);
    alert(`Edit: ${item.title}`);
  };

  // Handler for ItemRow delete
  const handleRowDelete = (item: ItemRecord) => {
    console.log('[TEST] ItemRow onDelete:', item.id, item.title);
    alert(`Delete: ${item.title}`);
  };

  // Handler for ItemRow manage assets
  const handleRowManageAssets = (item: ItemRecord) => {
    console.log('[TEST] ItemRow onManageAssets:', item.id, item.title);
    alert(`Manage Assets: ${item.title}`);
  };

  // Handler for ItemRow duplicate
  const handleRowDuplicate = (item: ItemRecord) => {
    console.log('[TEST] ItemRow onDuplicate:', item.id, item.title);
    alert(`Duplicate: ${item.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">ItemManager Test Suite</h1>
        <p className="text-sm text-gray-500 mt-1">REQ-057, REQ-058, REQ-059 - Component Tests</p>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Test View:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTestView('asset-panel')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'asset-panel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AssetPanel (REQ-081)
            </button>
            <button
              onClick={() => setTestView('asset-hook')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'asset-hook'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              useAssetManagement (REQ-080)
            </button>
            <button
              onClick={() => setTestView('gallery')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'gallery'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MediaGallery (REQ-075)
            </button>
            <button
              onClick={() => setTestView('row')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'row'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ItemRow (REQ-059)
            </button>
            <button
              onClick={() => setTestView('card')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ItemCard (REQ-058)
            </button>
            <button
              onClick={() => setTestView('manager')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ItemManager (REQ-057)
            </button>
          </div>
        </div>
      </div>

      {/* useAssetManagement Hook Test Section (REQ-080) */}
      {testView === 'asset-hook' && <AssetManagementHookTest />}

      {/* AssetPanel Component Test Section (REQ-081) */}
      {testView === 'asset-panel' && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AssetPanel Visual Test Cases (REQ-081)</h2>

          {/* Mock Item Cards for Testing */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-3">Select an item to manage assets:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {itemCardMockItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAssetPanelItem(item)}
                  className="text-left p-4 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.location || 'No location'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.media?.length || 0} asset{(item.media?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Test Cases Legend */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><span className="font-medium">Open Panel:</span> Click any item card above to open the AssetPanel</li>
              <li><span className="font-medium">Add Media:</span> Click &quot;Add Media&quot; button to select files</li>
              <li><span className="font-medium">Remove Asset:</span> Click X button on any asset to mark for removal</li>
              <li><span className="font-medium">Undo Removal:</span> Click &quot;Restore&quot; on removed assets</li>
              <li><span className="font-medium">Cancel:</span> Discard changes and close the panel</li>
              <li><span className="font-medium">Done:</span> Commit changes (enabled when changes exist)</li>
              <li><span className="font-medium">Escape Key:</span> Press Escape to cancel and close</li>
              <li><span className="font-medium">Backdrop Click:</span> Click outside the panel to cancel</li>
            </ul>
            <div className="mt-3 text-sm text-gray-500">
              <p>Check browser console for callback invocations (onAddAssets, onRemoveAssets, onReorderAssets).</p>
            </div>
          </div>

          {/* AssetPanel Component */}
          <AssetPanel
            isOpen={!!assetPanelItem}
            item={assetPanelItem}
            onClose={() => setAssetPanelItem(null)}
            onAddAssets={async (itemId, files) => {
              console.log('=== AssetPanel onAddAssets ===', itemId, files.map(f => f.name));
              // Simulate async operation
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
            onRemoveAssets={async (itemId, ids) => {
              console.log('=== AssetPanel onRemoveAssets ===', itemId, ids);
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
            onReorderAssets={async (itemId, orderedIds) => {
              console.log('=== AssetPanel onReorderAssets ===', itemId, orderedIds);
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
          />
        </div>
      )}

      {/* MediaGallery Test Section (REQ-075) */}
      {testView === 'gallery' && (
        <>
          {/* Gallery Test Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setGalleryControlledMode(!galleryControlledMode)}
                className={`px-3 py-1 text-sm rounded ${
                  galleryControlledMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Controlled Mode: {galleryControlledMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setGalleryShowThumbnails(!galleryShowThumbnails)}
                className={`px-3 py-1 text-sm rounded ${
                  galleryShowThumbnails
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Thumbnails: {galleryShowThumbnails ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setGalleryEnableFullScreen(!galleryEnableFullScreen)}
                className={`px-3 py-1 text-sm rounded ${
                  galleryEnableFullScreen
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Full-Screen: {galleryEnableFullScreen ? 'ON' : 'OFF'}
              </button>
              {galleryControlledMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGalleryActiveIndex(Math.max(0, galleryActiveIndex - 1))}
                    className="px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    disabled={galleryActiveIndex === 0}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Index: {galleryActiveIndex} / {galleryMediaItems.length - 1}
                  </span>
                  <button
                    onClick={() => setGalleryActiveIndex(Math.min(galleryMediaItems.length - 1, galleryActiveIndex + 1))}
                    className="px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    disabled={galleryActiveIndex === galleryMediaItems.length - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MediaGallery Visual Tests */}
          <div className="p-6 space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">MediaGallery Visual Test Cases</h2>

            {/* Multiple Items Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-700 mb-4">Multiple Media Items (Uncontrolled/Controlled)</h3>
              <MediaGallery
                mediaItems={galleryMediaItems}
                activeIndex={galleryControlledMode ? galleryActiveIndex : undefined}
                onActiveIndexChange={(idx) => {
                  console.log('[TEST] MediaGallery onActiveIndexChange:', idx);
                  if (galleryControlledMode) {
                    setGalleryActiveIndex(idx);
                  }
                }}
                onMediaClick={(item, idx) => {
                  console.log('[TEST] MediaGallery onMediaClick:', item.id, idx);
                  alert(`Media clicked: ${item.metadata.originalFilename || item.id}`);
                }}
                enableFullScreen={galleryEnableFullScreen}
                showThumbnails={galleryShowThumbnails}
                debug
              />
            </div>

            {/* Single Item Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-700 mb-4">Single Media Item (No Navigation)</h3>
              <MediaGallery
                mediaItems={galleryMediaItems.slice(0, 1)}
                enableFullScreen={galleryEnableFullScreen}
                onMediaClick={(item, idx) => {
                  console.log('[TEST] Single Item onMediaClick:', item.id, idx);
                }}
              />
            </div>

            {/* Empty Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-700 mb-4">Empty State (No Media)</h3>
              <MediaGallery mediaItems={[]} />
            </div>

            {/* Legend */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases Legend:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">Multiple Items:</span> Tests carousel navigation, swipe gestures, keyboard nav (Arrow keys), thumbnails, full-screen</li>
                <li><span className="font-medium">Single Item:</span> Tests that navigation controls are hidden for single items</li>
                <li><span className="font-medium">Empty State:</span> Tests empty placeholder display</li>
                <li><span className="font-medium">Controlled Mode:</span> Tests external index control via props</li>
              </ul>
              <div className="mt-3 text-sm text-gray-500">
                <p><strong>Keyboard:</strong> Use Arrow Left/Right to navigate. Press Escape to exit full-screen.</p>
                <p><strong>Touch:</strong> Swipe left/right to navigate on mobile devices.</p>
                <p><strong>Debug:</strong> Check console for state changes and callback invocations.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ItemCard Test Section */}
      {testView === 'card' && (
        <>
          {/* Card Test Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`px-3 py-1 text-sm rounded ${
                  isSelectionMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Selection Mode: {isSelectionMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setCardSelectedIds(new Set())}
                className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Selection
              </button>
              {cardSelectedIds.size > 0 && (
                <span className="text-sm text-gray-600">
                  Selected: {Array.from(cardSelectedIds).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* ItemCard Grid Display */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ItemCard Visual Test Cases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {itemCardMockItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPreviewClick={handleCardPreviewClick}
                  onSelectionChange={handleCardSelectionChange}
                  isSelected={cardSelectedIds.has(item.id)}
                  isSelectionMode={isSelectionMode}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases Legend:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">video-item:</span> Video content, long title (tests truncation), red VIDEO badge</li>
                <li><span className="font-medium">image-item:</span> Image content, green PHOTO badge</li>
                <li><span className="font-medium">pdf-item:</span> PDF content, blue PDF badge</li>
                <li><span className="font-medium">text-item:</span> Text-only content, purple TEXT badge</li>
                <li><span className="font-medium">mixed-item:</span> Mixed content, orange MIXED badge</li>
                <li><span className="font-medium">no-location-item:</span> No location field (tests conditional rendering)</li>
              </ul>
              <div className="mt-3 text-sm text-gray-500">
                <p>Toggle Selection Mode to see checkboxes. Click cards to trigger preview callback (shown in console).</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ItemRow Test Section (REQ-059) */}
      {testView === 'row' && (
        <>
          {/* Row Test Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`px-3 py-1 text-sm rounded ${
                  isSelectionMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Selection Mode: {isSelectionMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setRowSelectedIds(new Set())}
                className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowManageAssets(!showManageAssets)}
                className={`px-3 py-1 text-sm rounded ${
                  showManageAssets
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manage Assets: {showManageAssets ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowDuplicate(!showDuplicate)}
                className={`px-3 py-1 text-sm rounded ${
                  showDuplicate
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Duplicate: {showDuplicate ? 'ON' : 'OFF'}
              </button>
              {rowSelectedIds.size > 0 && (
                <span className="text-sm text-gray-600">
                  Selected: {Array.from(rowSelectedIds).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* ItemRow List Display */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ItemRow Visual Test Cases</h2>

            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSelectionMode && <div className="w-8" />}
              <div className="w-12">Thumb</div>
              <div className="flex-1">Title / Description</div>
              <div className="hidden md:block w-24">Location</div>
              <div className="hidden sm:block w-20">Type</div>
              <div className="hidden lg:block w-40">Tags</div>
              <div className="hidden md:block w-28">Date</div>
              <div className="w-10">Actions</div>
            </div>

            {/* Item Rows */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {itemRowMockItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onPreviewClick={handleRowPreviewClick}
                  onSelectionChange={handleRowSelectionChange}
                  isSelected={rowSelectedIds.has(item.id)}
                  isSelectionMode={isSelectionMode}
                  onEdit={handleRowEdit}
                  onDelete={handleRowDelete}
                  onManageAssets={showManageAssets ? handleRowManageAssets : undefined}
                  onDuplicate={showDuplicate ? handleRowDuplicate : undefined}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases Legend:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">row-video-item:</span> Video content, long title (tests truncation), 5 tags (tests overflow), red VIDEO badge</li>
                <li><span className="font-medium">row-image-item:</span> Image content, green PHOTO badge, 2 tags</li>
                <li><span className="font-medium">row-pdf-item:</span> PDF-only content, blue PDF badge, 3 tags (exactly MAX_VISIBLE_TAGS)</li>
                <li><span className="font-medium">row-text-item:</span> Text-only content, purple TEXT badge, 1 tag</li>
                <li><span className="font-medium">row-mixed-item:</span> Mixed content, orange MIXED badge, 3 tags</li>
                <li><span className="font-medium">row-no-tags-item:</span> No tags field (tests empty tags rendering)</li>
                <li><span className="font-medium">row-no-location-item:</span> No location field (shows dash in location column)</li>
                <li><span className="font-medium">row-no-instructions-item:</span> No instructions (tests description hiding)</li>
              </ul>
              <div className="mt-3 text-sm text-gray-500">
                <p>Toggle Selection Mode to see checkboxes. Click rows to trigger preview callback. Click kebab menu for actions.</p>
                <p className="mt-1">Toggle &quot;Manage Assets&quot; and &quot;Duplicate&quot; buttons to show/hide those menu items.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ItemManager Shell Test Section */}
      {testView === 'manager' && (
        <>
          {/* Manager Controls */}
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
        </>
      )}

      {/* Console Log Info */}
      <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Open browser console to see callback invocations.
          {testView === 'manager' && ' Click Grid/List buttons to toggle view mode.'}
          {testView === 'card' && ' Use Tab to navigate cards with keyboard.'}
          {testView === 'row' && ' Use Tab to navigate rows. Press Enter or Space to trigger preview. Try keyboard navigation and kebab menu.'}
        </p>
      </div>
    </div>
  );
}
