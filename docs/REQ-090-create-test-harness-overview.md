# Implementation Breakdown: ItemManager Test Harness

**Request Reference**: Task 6.6 from ItemManager Implementation Plan (Phase 6 - Inline Edit & Polish)
**Related PRD**: `/docs/prd/item-capture-manager-implementation-plan.md`
**Document Type**: Technical Implementation Breakdown
**Created**: 2026-01-03
**Last Modified**: 2026-01-03

---

## Summary

Create a standalone developer test harness page at `/test/item-manager` for the ItemManager component. This page enables developers to manually verify all ItemManager functionality, inspect callback outputs, and confirm zero network requests during operation. The harness follows the established pattern from the existing ItemCapture test harness at `/test/item-capture`.

---

## Task Context

| Attribute | Value |
|-----------|-------|
| **Phase** | 6 - Inline Edit & Polish |
| **Task ID** | 6.6 |
| **Title** | Create test harness |
| **Dependencies** | Phases 1-5 complete, Task 6.4 (Mobile polish) |
| **Complexity** | Small (S) |

### Task Requirements (from Implementation Plan)

- Standalone page at `/test/item-manager`
- Mock data with various item types
- Console output of all callbacks
- Network monitor confirmation (zero requests)

---

## Component Dependencies

### Required Components (Must Exist Before Implementation)

| Component | Path | Status |
|-----------|------|--------|
| ItemManager | `src/components/ItemManager/ItemManager.tsx` | Pending (Phases 1-5) |
| ItemRecord type | `src/components/ItemCapture/ItemCapture.types.ts` | Exists |
| MediaItem type | `src/components/ItemCapture/ItemCapture.types.ts` | Exists |

### Test Page Index (To Be Updated)

| Component | Path | Purpose |
|-----------|------|---------|
| Test Index | `src/app/test/page.tsx` | Central test hub - add ItemManager link |

---

## Technical Approach

### 1. Page Structure

Follow the established pattern from `/test/item-capture/page.tsx`:

```
src/app/test/item-manager/
└── page.tsx              # Test harness page component
```

### 2. Mock Data Strategy

Create comprehensive mock data covering all item variations:

| Item Variant | Content Type | Media | Tags | Purpose |
|--------------|--------------|-------|------|---------|
| Video item | `media` | 1 video | 2 tags | Test video thumbnail, playback |
| Photo item | `media` | 3 images | 1 tag | Test photo gallery, carousel |
| PDF item | `pdf-only` | 1 PDF | 0 tags | Test PDF thumbnail, page count |
| Text item | `text-only` | 0 | 3 tags | Test text-only display |
| Mixed item | `mixed` | 2 videos + 1 image + text | 2 tags | Test mixed content handling |
| Empty tags | `media` | 1 image | 0 tags | Test empty tag display |
| Long title | `media` | 1 video | 1 tag | Test title truncation |
| No location | `media` | 1 image | 0 tags | Test missing location |

### 3. Callback Logging Pattern

All callbacks log to console with structured formatting:

```typescript
const handleCallback = (callbackName: string, data: unknown) => {
  const timestamp = new Date().toISOString();
  console.log('==================================================');
  console.log(`=== ${callbackName} [${timestamp}] ===`);
  console.log('==================================================');
  console.log(JSON.stringify(data, jsonReplacer, 2));
  console.log('==================================================');
};
```

### 4. Callbacks to Monitor

| Callback | Description | Expected Data |
|----------|-------------|---------------|
| `onEditItem` | User wants to edit item | `ItemRecord` |
| `onDeleteItems` | Delete single or bulk | `string[]` (IDs) |
| `onUpdateItem` | Inline edit changes | `ItemRecord` |
| `onAddAssets` | Quick add media | `{ itemId: string, assets: File[] }` |
| `onRemoveAssets` | Remove assets | `{ itemId: string, assetIds: string[] }` |
| `onReorderAssets` | Drag reorder assets | `{ itemId: string, orderedIds: string[] }` |
| `onDuplicateItem` | Duplicate item | `ItemRecord` |
| `onSelectionChange` | Selection changes | `string[]` (selected IDs) |

---

## Implementation Tasks

### Task 1: Create Test Page File Structure

**File**: `src/app/test/item-manager/page.tsx`

**Actions**:
1. Create directory `src/app/test/item-manager/`
2. Create `page.tsx` with `'use client'` directive
3. Add page metadata header comment

**Verification**: File exists, compiles without errors

---

### Task 2: Implement Mock Data Generation

**Within**: `src/app/test/item-manager/page.tsx`

**Actions**:
1. Create mock item factory functions
2. Generate 8-10 diverse mock items covering all variants
3. Create mock Blob/File objects for media items
4. Set realistic dates, tags, and locations

**Mock Items Structure**:
```typescript
const mockItems: ItemRecord[] = [
  // 1. Video item (Coffee Maker)
  // 2. Photo item (Thermostat - 3 photos)
  // 3. PDF item (Appliance Manual)
  // 4. Text-only item (WiFi Instructions)
  // 5. Mixed item (Pool Equipment)
  // 6. Item with no tags
  // 7. Item with very long title (test truncation)
  // 8. Item with no location
];
```

**Verification**: Mock data renders without errors, covers all edge cases

---

### Task 3: Implement Callback Handlers

**Within**: `src/app/test/item-manager/page.tsx`

**Actions**:
1. Create `jsonReplacer` function for Blob/File/Date serialization
2. Create wrapper function for structured console logging
3. Implement all 8 callback handlers with logging
4. Update local state for state-modifying callbacks (delete, update)

**Handler Pattern**:
```typescript
const handleEditItem = useCallback((item: ItemRecord) => {
  logCallback('EDIT_ITEM', item);
}, [logCallback]);

const handleDeleteItems = useCallback((ids: string[]) => {
  logCallback('DELETE_ITEMS', ids);
  setItems(prev => prev.filter(i => !ids.includes(i.id)));
}, [logCallback]);

// ... etc for all callbacks
```

**Verification**: All callbacks log structured output to console

---

### Task 4: Implement Test Harness UI

**Within**: `src/app/test/item-manager/page.tsx`

**Actions**:
1. Create header section with title and description
2. Display session counter (delete/update operations count)
3. Add network verification reminder
4. Render ItemManager component with all props
5. Add output preview panel (fixed at bottom)

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ Header: ItemManager Test Harness        │
│ Session counter | Network reminder      │
├─────────────────────────────────────────┤
│                                         │
│         ItemManager Component           │
│         (Full functionality)            │
│                                         │
├─────────────────────────────────────────┤
│ Output Panel: Last callback output      │
│ (Collapsible, shows JSON)               │
└─────────────────────────────────────────┘
```

**Verification**: UI renders correctly, ItemManager displays mock items

---

### Task 5: Add ItemManager Configuration Options

**Within**: `src/app/test/item-manager/page.tsx`

**Actions**:
1. Enable all features via config prop
2. Add toggleable config options panel (optional)
3. Set debug mode for verbose logging

**Config**:
```typescript
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
```

**Verification**: All features enabled and functional

---

### Task 6: Update Test Index Page

**File**: `src/app/test/page.tsx`

**Actions**:
1. Add ItemManager to `mainTests` or create new section for ItemManager
2. Add link entry with proper title and description

**Addition**:
```typescript
// In mainTests or new "Manager Components" section
{
  href: '/test/item-manager',
  title: 'ItemManager',
  description: 'Browse, filter, select, and manage item collection',
}
```

**Verification**: Link appears on test index, navigation works

---

### Task 7: Add Test Use Cases

**File**: `src/app/test/page.tsx`

**Actions**:
1. Add ItemManager-specific use case scenarios
2. Document step-by-step testing procedures

**Use Cases to Add**:
```typescript
{
  title: 'Use Case: Grid/List View Toggle',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'View items in default grid layout',
    'Click list view toggle',
    'Verify items display as rows with full metadata',
    'Toggle back to grid view',
  ],
},
{
  title: 'Use Case: Multi-Select and Bulk Delete',
  testPath: '/test/item-manager',
  steps: [
    'Enter selection mode',
    'Select 3 items using checkboxes',
    'Verify bulk action bar appears',
    'Click delete button',
    'Confirm deletion in dialog',
    'Verify console logs DELETE_ITEMS with 3 IDs',
  ],
},
// ... additional use cases
```

**Verification**: Use cases documented, test flow works

---

### Task 8: Network Isolation Verification

**Verification Steps** (Manual):
1. Open browser DevTools → Network tab
2. Clear network log
3. Load `/test/item-manager` page
4. Perform all operations (search, filter, select, delete, inline edit)
5. Verify only static asset requests (JS, CSS, fonts)
6. Confirm ZERO API calls to backend endpoints

**Documentation**: Add verification note in page header

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/test/item-manager/page.tsx` | Main test harness page |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/app/test/page.tsx` | Add ItemManager link and use cases |

### Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `src/components/ItemManager/index.ts` | Import ItemManager component |
| `src/components/ItemManager/ItemManager.types.ts` | Import type definitions |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem types |

---

## Acceptance Criteria

- [ ] Test page is accessible at `/test/item-manager`
- [ ] Page renders without console errors
- [ ] 8+ mock items display with varied content types
- [ ] All 8 callbacks log structured output to console
- [ ] Session counter increments on state-modifying operations
- [ ] Grid/list view toggle functions correctly
- [ ] Search filters items in real-time
- [ ] Content type filters work correctly
- [ ] Sort options change item order
- [ ] Multi-select and bulk delete work
- [ ] Inline edit triggers `onUpdateItem` callback
- [ ] Asset panel operations log appropriate callbacks
- [ ] Zero network requests during all operations (verified in DevTools)
- [ ] Test index page includes ItemManager link
- [ ] Use cases documented for manual testing

---

## Code Template

```tsx
// src/app/test/item-manager/page.tsx
'use client';

/**
 * ItemManager Test Harness Page
 *
 * Developer test environment for isolated testing of the ItemManager component.
 * Features:
 * - Console output of all callbacks with structured formatting
 * - Session counter for tracking operations
 * - Mock data covering all item type variations
 * - Zero network requests (verify in DevTools → Network tab)
 *
 * @route /test/item-manager
 * @created 2026-01-03
 * @lastModified 2026-01-03
 * @request Task 6.6 from ItemManager Implementation Plan
 */

import { useState, useCallback } from 'react';
import { ItemManager } from '@/components/ItemManager';
import type { ItemRecord } from '@/components/ItemCapture';

// Mock data generation
const generateMockItems = (): ItemRecord[] => {
  // ... implementation
};

export default function TestItemManagerPage() {
  const [items, setItems] = useState<ItemRecord[]>(generateMockItems);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Callback handlers with console logging
  // ... implementation

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {/* ItemManager */}
      {/* Output Panel */}
    </div>
  );
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemManager not complete | Medium | High | Gate task on Phases 1-5 completion |
| Mock data doesn't cover edge cases | Low | Medium | Review mock data against PRD requirements |
| Console logging too verbose | Low | Low | Use collapsible output panel, clear separators |

---

## Related Documentation

- [ItemManager Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Full component specification
- [ItemCapture Test Harness](/src/app/test/item-capture/page.tsx) - Reference implementation pattern
- [Test Index Page](/src/app/test/page.tsx) - Central test navigation hub
- [REQ-055](/docs/gen_requests.md#req-055) - Original ItemCapture test harness request

---

## Appendix: Mock Item Examples

```typescript
// Example mock items covering key variations

const mockItems: ItemRecord[] = [
  // Video item
  {
    id: 'item-001',
    title: 'How to Use the Coffee Maker',
    location: 'Kitchen',
    tags: ['appliances', 'kitchen'],
    applianceType: 'other',
    contentType: 'media',
    media: [{
      id: 'media-001',
      type: 'video',
      order: 0,
      file: new Blob(['mock video content'], { type: 'video/mp4' }),
      metadata: {
        mimeType: 'video/mp4',
        fileSize: 5242880,
        source: 'capture',
        duration: 45,
      },
    }],
    instructions: 'Fill reservoir, add grounds, press start.',
    createdAt: new Date('2026-01-01'),
  },

  // Photo item with multiple images
  {
    id: 'item-002',
    title: 'Thermostat Settings',
    location: 'Hallway',
    tags: ['hvac'],
    applianceType: 'hvac',
    contentType: 'media',
    media: [
      { id: 'media-002a', type: 'image', order: 0, /* ... */ },
      { id: 'media-002b', type: 'image', order: 1, /* ... */ },
      { id: 'media-002c', type: 'image', order: 2, /* ... */ },
    ],
    createdAt: new Date('2026-01-02'),
  },

  // Text-only item
  {
    id: 'item-003',
    title: 'WiFi Network Information',
    location: 'Living Room',
    tags: ['wifi', 'internet', 'connectivity'],
    contentType: 'text-only',
    media: [],
    instructions: '# WiFi Access\n\n**Network:** GuestNet\n**Password:** Welcome123',
    createdAt: new Date('2025-12-28'),
  },

  // PDF item
  {
    id: 'item-004',
    title: 'Dishwasher Manual',
    location: 'Kitchen',
    tags: [],
    applianceType: 'dishwasher',
    contentType: 'pdf-only',
    media: [{
      id: 'media-004',
      type: 'pdf',
      order: 0,
      file: new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' }),
      metadata: {
        mimeType: 'application/pdf',
        fileSize: 2097152,
        source: 'upload',
        pageCount: 24,
      },
    }],
    createdAt: new Date('2025-12-15'),
  },

  // ... additional items
];
```
