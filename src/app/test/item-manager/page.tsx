'use client';

/**
 * ItemManager Test Harness Page
 *
 * Developer test environment for isolated testing of the ItemManager component.
 * Features:
 * - Console output of all callbacks with structured formatting
 * - Session counter for tracking operations
 * - Mock data covering all item type variations
 * - Zero network requests (verify in DevTools -> Network tab)
 *
 * @route /test/item-manager
 * @created 2025-12-31
 * @lastModified 2026-01-03
 * @request REQ-090 (Task 6.6)
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ItemManager, ItemCard, ItemRow, useAssetManagement, AssetPanel, AssetItem, SortableAssetList } from '@/components/ItemManager';
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

// =============================================================================
// REQ-090 Test Harness Mock Data
// =============================================================================

/**
 * Creates a simple mock Blob for testing (REQ-090).
 */
const createTestHarnessMockBlob = (type: string, size: number = 1024): Blob => {
  const content = new Array(size).fill('x').join('');
  return new Blob([content], { type });
};

/**
 * Creates a mock MediaItem for test harness (REQ-090).
 */
const createTestHarnessMedia = (
  id: string,
  type: 'video' | 'image' | 'pdf',
  order: number,
  options: Partial<MediaItem['metadata']> = {}
): MediaItem => ({
  id,
  type,
  order,
  file: createTestHarnessMockBlob(
    type === 'video' ? 'video/mp4' :
    type === 'pdf' ? 'application/pdf' : 'image/jpeg',
    type === 'video' ? 5242880 : 1048576
  ),
  metadata: {
    mimeType: type === 'video' ? 'video/mp4' :
              type === 'pdf' ? 'application/pdf' : 'image/jpeg',
    fileSize: type === 'video' ? 5242880 : 1048576,
    source: 'capture',
    ...options,
  },
});

/**
 * Generates 8 diverse mock items covering all content type variations (REQ-090).
 * Items span different dates for sort testing.
 */
const generateTestHarnessMockItems = (): ItemRecord[] => {
  return [
    // 1. Video item - Coffee Maker
    {
      id: 'item-001',
      title: 'How to Use the Coffee Maker',
      location: 'Kitchen',
      tags: ['appliances', 'kitchen'],
      applianceType: 'other',
      contentType: 'media',
      media: [createTestHarnessMedia('media-001', 'video', 0, { duration: 45 })],
      instructions: 'Fill reservoir, add grounds, press start.',
      createdAt: new Date('2026-01-01'),
    },

    // 2. Photo item - Thermostat (3 images)
    {
      id: 'item-002',
      title: 'Thermostat Settings',
      location: 'Hallway',
      tags: ['hvac'],
      applianceType: 'hvac',
      contentType: 'media',
      media: [
        createTestHarnessMedia('media-002a', 'image', 0),
        createTestHarnessMedia('media-002b', 'image', 1),
        createTestHarnessMedia('media-002c', 'image', 2),
      ],
      instructions: 'Adjust temperature using up/down arrows.',
      createdAt: new Date('2026-01-02'),
    },

    // 3. PDF item - Dishwasher Manual
    {
      id: 'item-003',
      title: 'Dishwasher Manual',
      location: 'Kitchen',
      tags: [],
      applianceType: 'dishwasher',
      contentType: 'pdf-only',
      media: [createTestHarnessMedia('media-003', 'pdf', 0, {
        mimeType: 'application/pdf',
        fileSize: 2097152,
        source: 'upload',
        pageCount: 24,
      })],
      createdAt: new Date('2025-12-15'),
    },

    // 4. Text-only item - WiFi Info
    {
      id: 'item-004',
      title: 'WiFi Network Information',
      location: 'Living Room',
      tags: ['wifi', 'internet', 'connectivity'],
      contentType: 'text-only',
      media: [],
      instructions: '# WiFi Access\n\n**Network:** GuestNet\n**Password:** Welcome123\n\n## Troubleshooting\n- Restart router if issues occur\n- Check signal strength near windows',
      createdAt: new Date('2025-12-28'),
    },

    // 5. Mixed item - Pool Equipment
    {
      id: 'item-005',
      title: 'Pool Equipment Guide',
      location: 'Backyard',
      tags: ['pool', 'outdoor'],
      contentType: 'mixed',
      media: [
        createTestHarnessMedia('media-005a', 'video', 0, { duration: 120, fileSize: 8388608 }),
        createTestHarnessMedia('media-005b', 'video', 1, { duration: 60, fileSize: 4194304 }),
        createTestHarnessMedia('media-005c', 'image', 2),
      ],
      instructions: '## Pool Pump Operation\n\n1. Check water level\n2. Ensure valves are open\n3. Turn on pump at breaker',
      createdAt: new Date('2025-12-20'),
    },

    // 6. Item with empty tags - Garbage Disposal
    {
      id: 'item-006',
      title: 'Garbage Disposal',
      location: 'Kitchen',
      tags: [],
      applianceType: 'other',
      contentType: 'media',
      media: [createTestHarnessMedia('media-006', 'image', 0, { fileSize: 524288 })],
      instructions: 'Run cold water, flip switch under sink.',
      createdAt: new Date('2025-12-10'),
    },

    // 7. Long title - Test truncation
    {
      id: 'item-007',
      title: 'Extremely Long Title for Testing Text Truncation Behavior in Various UI Components and Views',
      location: 'Utility Room',
      tags: ['testing'],
      contentType: 'media',
      media: [createTestHarnessMedia('media-007', 'video', 0, { duration: 30, fileSize: 3145728 })],
      createdAt: new Date('2025-12-05'),
    },

    // 8. No location - Emergency Shutoffs
    {
      id: 'item-008',
      title: 'Emergency Shutoffs',
      // location intentionally omitted
      tags: ['safety', 'emergency'],
      contentType: 'media',
      media: [createTestHarnessMedia('media-008', 'image', 0, { fileSize: 786432 })],
      instructions: 'Water shutoff: basement near water heater\nGas shutoff: side of house near meter\nElectrical: main breaker in garage',
      createdAt: new Date('2025-11-30'),
    },
  ];
};

// =============================================================================
// REQ-090 Test Harness Output Types
// =============================================================================

interface CallbackOutput {
  callbackName: string;
  timestamp: string;
  data: string;
}

// =============================================================================
// REQ-090 Test Harness Component
// =============================================================================

function TestHarnessView() {
  // State for items and UI tracking
  const [items, setItems] = useState<ItemRecord[]>(generateTestHarnessMockItems);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastOutput, setLastOutput] = useState<CallbackOutput | null>(null);

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
   * Structured console logging for callback events.
   */
  const logCallback = useCallback((callbackName: string, data: unknown) => {
    const timestamp = new Date().toISOString();
    const formatted = JSON.stringify(data, jsonReplacer, 2);

    console.log('==================================================');
    console.log(`=== ${callbackName} [${timestamp}] ===`);
    console.log('==================================================');
    console.log(formatted);
    console.log('==================================================');

    setLastOutput({
      callbackName,
      timestamp,
      data: formatted,
    });

    return formatted;
  }, [jsonReplacer]);

  // Callback handlers

  const handleEditItem = useCallback((item: ItemRecord) => {
    logCallback('EDIT_ITEM', item);
  }, [logCallback]);

  const handleDeleteItems = useCallback((ids: string[]) => {
    logCallback('DELETE_ITEMS', { ids, count: ids.length });
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleUpdateItem = useCallback((updatedItem: ItemRecord) => {
    logCallback('UPDATE_ITEM', updatedItem);
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleAddAssets = useCallback((itemId: string, assets: File[]) => {
    logCallback('ADD_ASSETS', {
      itemId,
      assetCount: assets.length,
      assets: assets.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleRemoveAssets = useCallback((itemId: string, assetIds: string[]) => {
    logCallback('REMOVE_ASSETS', { itemId, assetIds, count: assetIds.length });
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleReorderAssets = useCallback((itemId: string, orderedIds: string[]) => {
    logCallback('REORDER_ASSETS', { itemId, orderedIds });
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleDuplicateItem = useCallback((item: ItemRecord) => {
    const newId = `item-dup-${Date.now()}`;
    const duplicated: ItemRecord = { ...item, id: newId, title: `${item.title} (Copy)` };
    logCallback('DUPLICATE_ITEM', { original: item.id, duplicate: duplicated });
    setItems(prev => [...prev, duplicated]);
    setSessionCount(prev => prev + 1);
  }, [logCallback]);

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    logCallback('SELECTION_CHANGE', { selectedIds, count: selectedIds.length });
  }, [logCallback]);

  const handleResetItems = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log('==================================================');
    console.log(`=== ITEMS RESET [${timestamp}] ===`);
    console.log('==================================================');
    setItems(generateTestHarnessMockItems());
    setLastOutput(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header section */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              ItemManager Test Harness
            </h1>
            <p className="text-sm text-gray-500">
              Development & debugging environment (REQ-090)
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-sm text-gray-600">
              Operations: <span className="font-mono font-bold">{sessionCount}</span>
            </span>
            <span className="text-xs text-gray-400">
              Open DevTools → Network to verify zero requests
            </span>
          </div>
        </div>
      </header>

      {/* Item count and reset */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Displaying <strong>{items.length}</strong> mock items
          </span>
          <button
            onClick={handleResetItems}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Reset Items
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="p-4 pb-72">
        <div className="max-w-6xl mx-auto">
          <ItemManager
            items={items}
            onEditItem={handleEditItem}
            onDeleteItems={handleDeleteItems}
            onUpdateItem={handleUpdateItem}
            onAddAssets={handleAddAssets}
            onRemoveAssets={handleRemoveAssets}
            onReorderAssets={handleReorderAssets}
            onDuplicateItem={handleDuplicateItem}
            onSelectionChange={handleSelectionChange}
            config={{
              defaultView: 'grid',
              enableBulkActions: true,
              enableInlineEdit: true,
              enableAssetManagement: true,
              enableDuplicate: true,
              enableSearch: true,
              enableFilters: true,
              enableSort: true,
            }}
          />
        </div>
      </main>

      {/* Output preview panel */}
      {lastOutput && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-green-400 p-4 max-h-64 overflow-auto shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-400">
              {lastOutput.callbackName} [{lastOutput.timestamp}]
            </span>
            <button
              onClick={() => setLastOutput(null)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {lastOutput.data}
          </pre>
        </div>
      )}
    </div>
  );
}

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
  const [testView, setTestView] = useState<'test-harness' | 'manager' | 'card' | 'row' | 'gallery' | 'asset-hook' | 'asset-panel' | 'asset-item' | 'drag-drop'>('test-harness');
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

  // Drag-and-Drop test state (REQ-084)
  const [dragTestAssets, setDragTestAssets] = useState<MediaItem[]>([]);
  const [dragTestRemovalIds, setDragTestRemovalIds] = useState<Set<string>>(new Set());

  // Initialize gallery mock data on client side
  useEffect(() => {
    setGalleryMediaItems(createGalleryMockMediaItems());
  }, []);

  // Initialize drag-and-drop test data on client side (REQ-084)
  useEffect(() => {
    const createDragTestAssets = (): MediaItem[] => [
      {
        id: 'drag-video-1',
        type: 'video',
        file: new Blob(['video'], { type: 'video/mp4' }),
        order: 0,
        metadata: {
          mimeType: 'video/mp4',
          fileSize: 1024000,
          source: 'capture',
          duration: 90,
          originalFilename: 'coffee-maker-demo.mp4',
        },
      },
      {
        id: 'drag-photo-1',
        type: 'image',
        file: new Blob(['image'], { type: 'image/jpeg' }),
        order: 1,
        metadata: {
          mimeType: 'image/jpeg',
          fileSize: 512000,
          source: 'upload',
          originalFilename: 'kitchen-appliance.jpg',
        },
      },
      {
        id: 'drag-pdf-1',
        type: 'pdf',
        file: new Blob(['pdf'], { type: 'application/pdf' }),
        order: 2,
        metadata: {
          mimeType: 'application/pdf',
          fileSize: 256000,
          source: 'upload',
          pageCount: 5,
          originalFilename: 'user-manual.pdf',
        },
      },
      {
        id: 'drag-photo-2',
        type: 'image',
        file: new Blob(['image'], { type: 'image/png' }),
        order: 3,
        metadata: {
          mimeType: 'image/png',
          fileSize: 768000,
          source: 'capture',
          originalFilename: 'thermostat-settings.png',
        },
      },
    ];
    setDragTestAssets(createDragTestAssets());
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
              onClick={() => setTestView('test-harness')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'test-harness'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Test Harness (REQ-090)
            </button>
            <button
              onClick={() => setTestView('drag-drop')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'drag-drop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drag & Drop (REQ-084)
            </button>
            <button
              onClick={() => setTestView('asset-item')}
              className={`px-4 py-2 text-sm font-medium rounded ${
                testView === 'asset-item'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AssetItem (REQ-082)
            </button>
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

      {/* Test Harness Section (REQ-090) */}
      {testView === 'test-harness' && <TestHarnessView />}

      {/* useAssetManagement Hook Test Section (REQ-080) */}
      {testView === 'asset-hook' && <AssetManagementHookTest />}

      {/* Drag-and-Drop Reordering Test Section (REQ-084) */}
      {testView === 'drag-drop' && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Drag-and-Drop Reordering (REQ-084)</h2>
          <p className="text-sm text-gray-600 mb-6">
            Drag assets using the grip handle to reorder. Works with mouse, touch, and keyboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SortableAssetList Test */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-800 mb-4">SortableAssetList Component</h3>

              {dragTestAssets.length > 0 ? (
                <SortableAssetList
                  assets={dragTestAssets}
                  onReorder={(from, to) => {
                    console.log(`=== REORDER: ${from} -> ${to} ===`);
                    setDragTestAssets(prev => {
                      const result = [...prev];
                      const [removed] = result.splice(from, 1);
                      result.splice(to, 0, removed);
                      return result;
                    });
                  }}
                  onRemove={(id) => {
                    console.log('=== MARK FOR REMOVAL:', id, '===');
                    setDragTestRemovalIds(prev => new Set([...prev, id]));
                  }}
                  onRestore={(id) => {
                    console.log('=== RESTORE:', id, '===');
                    setDragTestRemovalIds(prev => {
                      const next = new Set(prev);
                      next.delete(id);
                      return next;
                    });
                  }}
                  markedForRemovalIds={dragTestRemovalIds}
                />
              ) : (
                <p className="text-gray-500 text-sm">Loading test assets...</p>
              )}

              {/* Current Order Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <strong>Current Order:</strong>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  {dragTestAssets.map((asset, index) => (
                    <li key={asset.id} className={dragTestRemovalIds.has(asset.id) ? 'line-through text-gray-400' : ''}>
                      {asset.metadata?.originalFilename || asset.id}
                      {dragTestRemovalIds.has(asset.id) && ' (removed)'}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setDragTestRemovalIds(new Set());
                  setDragTestAssets([
                    {
                      id: 'drag-video-1',
                      type: 'video',
                      file: new Blob(['video'], { type: 'video/mp4' }),
                      order: 0,
                      metadata: { mimeType: 'video/mp4', fileSize: 1024000, source: 'capture', duration: 90, originalFilename: 'coffee-maker-demo.mp4' },
                    },
                    {
                      id: 'drag-photo-1',
                      type: 'image',
                      file: new Blob(['image'], { type: 'image/jpeg' }),
                      order: 1,
                      metadata: { mimeType: 'image/jpeg', fileSize: 512000, source: 'upload', originalFilename: 'kitchen-appliance.jpg' },
                    },
                    {
                      id: 'drag-pdf-1',
                      type: 'pdf',
                      file: new Blob(['pdf'], { type: 'application/pdf' }),
                      order: 2,
                      metadata: { mimeType: 'application/pdf', fileSize: 256000, source: 'upload', pageCount: 5, originalFilename: 'user-manual.pdf' },
                    },
                    {
                      id: 'drag-photo-2',
                      type: 'image',
                      file: new Blob(['image'], { type: 'image/png' }),
                      order: 3,
                      metadata: { mimeType: 'image/png', fileSize: 768000, source: 'capture', originalFilename: 'thermostat-settings.png' },
                    },
                  ]);
                }}
                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                Reset Order
              </button>
            </div>

            {/* Test Cases and Controls */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Controls:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><span className="font-medium">Mouse:</span> Click and drag the grip icon</li>
                  <li><span className="font-medium">Touch:</span> Long-press (250ms) and drag</li>
                  <li><span className="font-medium">Keyboard:</span> Tab to grip, Space to pick up, Arrows to move, Space to drop, Esc to cancel</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Test Cases:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><span className="font-medium">Drag handle visible:</span> Grip icon appears on left of each item</li>
                  <li><span className="font-medium">Visual feedback:</span> Item lifts with shadow when dragging</li>
                  <li><span className="font-medium">Placeholder:</span> Original position shows faded placeholder</li>
                  <li><span className="font-medium">Drop animation:</span> Smooth transition to new position</li>
                  <li><span className="font-medium">Removed items:</span> No drag handle, cannot be moved</li>
                  <li><span className="font-medium">Single item:</span> Drag handle hidden (nothing to reorder)</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">Accessibility (VoiceOver/NVDA):</h4>
                <ul className="text-sm text-blue-600 space-y-2">
                  <li>Announces &quot;Picked up [name]. Current position: X of Y&quot;</li>
                  <li>Announces position changes during drag</li>
                  <li>Announces &quot;Dropped [name]. New position: X of Y&quot;</li>
                  <li>Announces if drag is cancelled</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                <h4 className="text-sm font-semibold text-yellow-700 mb-3">Check Console:</h4>
                <p className="text-sm text-yellow-600">
                  Watch the browser console for REORDER, MARK FOR REMOVAL, and RESTORE log messages.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AssetItem Component Test Section (REQ-082) */}
      {testView === 'asset-item' && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AssetItem Visual Test Cases (REQ-082)</h2>

          <div className="space-y-3 max-w-md bg-white rounded-lg shadow p-4">
            {/* Normal Video */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Video Asset (with duration)</h3>
              <AssetItem
                asset={{
                  id: 'video-1',
                  type: 'video',
                  file: new Blob([''], { type: 'video/mp4' }),
                  order: 0,
                  metadata: {
                    mimeType: 'video/mp4',
                    fileSize: 1024000,
                    source: 'capture',
                    duration: 90,
                    originalFilename: 'coffee-maker-demo.mp4',
                  },
                }}
                index={0}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Normal Photo */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Photo Asset</h3>
              <AssetItem
                asset={{
                  id: 'photo-1',
                  type: 'image',
                  file: new Blob([''], { type: 'image/jpeg' }),
                  order: 1,
                  metadata: {
                    mimeType: 'image/jpeg',
                    fileSize: 512000,
                    source: 'upload',
                    originalFilename: 'kitchen-appliance.jpg',
                  },
                }}
                index={1}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Normal PDF */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">PDF Asset (with page count)</h3>
              <AssetItem
                asset={{
                  id: 'pdf-1',
                  type: 'pdf',
                  file: new Blob([''], { type: 'application/pdf' }),
                  order: 2,
                  metadata: {
                    mimeType: 'application/pdf',
                    fileSize: 256000,
                    source: 'upload',
                    pageCount: 5,
                    originalFilename: 'user-manual.pdf',
                  },
                }}
                index={2}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Pending Addition */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Pending Addition (New)</h3>
              <AssetItem
                asset={{
                  id: 'pending-photo',
                  type: 'image',
                  file: new Blob([''], { type: 'image/jpeg' }),
                  order: 3,
                  metadata: {
                    mimeType: 'image/jpeg',
                    fileSize: 512000,
                    source: 'upload',
                    originalFilename: 'new-photo.jpg',
                  },
                }}
                index={3}
                isPending={true}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Pending Removal */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Marked for Removal</h3>
              <AssetItem
                asset={{
                  id: 'remove-video',
                  type: 'video',
                  file: new Blob([''], { type: 'video/mp4' }),
                  order: 4,
                  metadata: {
                    mimeType: 'video/mp4',
                    fileSize: 1024000,
                    source: 'capture',
                    duration: 45,
                    originalFilename: 'old-video.mp4',
                  },
                }}
                index={4}
                isMarkedForRemoval={true}
                onRemove={(id) => console.log('Remove:', id)}
                onRestore={(id) => console.log('Restore:', id)}
              />
            </div>

            {/* With Drag Handle */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">With Drag Handle</h3>
              <AssetItem
                asset={{
                  id: 'draggable-photo',
                  type: 'image',
                  file: new Blob([''], { type: 'image/png' }),
                  order: 5,
                  metadata: {
                    mimeType: 'image/png',
                    fileSize: 256000,
                    source: 'capture',
                    originalFilename: 'draggable-image.png',
                  },
                }}
                index={5}
                showDragHandle={true}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Clickable Asset */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Clickable (with onClick)</h3>
              <AssetItem
                asset={{
                  id: 'clickable-pdf',
                  type: 'pdf',
                  file: new Blob([''], { type: 'application/pdf' }),
                  order: 6,
                  metadata: {
                    mimeType: 'application/pdf',
                    fileSize: 512000,
                    source: 'upload',
                    pageCount: 10,
                    originalFilename: 'instructions.pdf',
                  },
                }}
                index={6}
                onClick={(id) => {
                  console.log('Click:', id);
                  alert(`Asset clicked: ${id}`);
                }}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Different Sizes */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Size: Small</h3>
              <AssetItem
                asset={{
                  id: 'small-photo',
                  type: 'image',
                  file: new Blob([''], { type: 'image/jpeg' }),
                  order: 7,
                  metadata: {
                    mimeType: 'image/jpeg',
                    fileSize: 256000,
                    source: 'upload',
                    originalFilename: 'small-size.jpg',
                  },
                }}
                index={7}
                size="small"
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Size: Large</h3>
              <AssetItem
                asset={{
                  id: 'large-photo',
                  type: 'image',
                  file: new Blob([''], { type: 'image/jpeg' }),
                  order: 8,
                  metadata: {
                    mimeType: 'image/jpeg',
                    fileSize: 1024000,
                    source: 'upload',
                    originalFilename: 'large-size.jpg',
                  },
                }}
                index={8}
                size="large"
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>

            {/* Long filename */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Long Filename (Truncation)</h3>
              <AssetItem
                asset={{
                  id: 'long-name',
                  type: 'video',
                  file: new Blob([''], { type: 'video/mp4' }),
                  order: 9,
                  metadata: {
                    mimeType: 'video/mp4',
                    fileSize: 2048000,
                    source: 'upload',
                    duration: 120,
                    originalFilename: 'this-is-a-very-long-filename-that-should-be-truncated-with-ellipsis-in-the-display.mp4',
                  },
                }}
                index={9}
                onRemove={(id) => console.log('Remove:', id)}
              />
            </div>
          </div>

          {/* Test Cases Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Cases Legend:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><span className="font-medium">Video Asset:</span> Play overlay, duration badge (1:30)</li>
              <li><span className="font-medium">Photo Asset:</span> Image thumbnail, no overlay</li>
              <li><span className="font-medium">PDF Asset:</span> Document icon, page count badge</li>
              <li><span className="font-medium">Pending Addition:</span> Green border, &quot;New&quot; badge</li>
              <li><span className="font-medium">Marked for Removal:</span> Red/dimmed, strikethrough, Restore button</li>
              <li><span className="font-medium">Drag Handle:</span> Shows grip icon for reordering</li>
              <li><span className="font-medium">Clickable:</span> Cursor pointer, hover state, click triggers callback</li>
              <li><span className="font-medium">Sizes:</span> Small (48px), Medium (64px), Large (80px)</li>
              <li><span className="font-medium">Long Filename:</span> Truncated with ellipsis, hover for full name</li>
            </ul>
            <div className="mt-3 text-sm text-gray-500">
              <p>Check browser console for Remove/Restore/Click callback invocations.</p>
            </div>
          </div>
        </div>
      )}

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
