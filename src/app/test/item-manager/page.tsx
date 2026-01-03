'use client';

/**
 * ItemManager Shell Test Page
 *
 * Test harness for verifying the basic ItemManager shell component
 * renders correctly in all states (empty, loading, error, with items).
 *
 * @module test/item-manager
 * @lastModified 2026-01-03 (REQ-075 Task 12 - Added MediaGallery visual tests)
 */

import { useState, useMemo, useEffect } from 'react';
import { ItemManager, ItemCard, ItemRow } from '@/components/ItemManager';
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
// Test Page Component
// =============================================================================

export default function TestItemManagerPage() {
  const [testState, setTestState] = useState<'empty' | 'loading' | 'error' | 'items'>('items');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [testView, setTestView] = useState<'manager' | 'card' | 'row' | 'gallery'>('gallery');
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
