# Detailed Task Breakdown: REQ-090 - Create ItemManager Test Harness

**Document Type**: Detailed Implementation Tasks
**Request Reference**: Task 6.6 from ItemManager Implementation Plan (Phase 6 - Inline Edit & Polish)
**Overview Document**: `docs/REQ-090-create-test-harness-overview.md`
**Implementation Plan**: `docs/prd/item-capture-manager-implementation-plan.md`
**Created**: 2026-01-03 09:45:00 UTC
**Last Modified**: 2026-01-03 09:45:00 UTC

---

## Executive Summary

This document provides granular, actionable tasks for implementing a standalone developer test harness page for the ItemManager component. The test harness enables manual verification of all ItemManager functionality, callback inspection, and confirmation of zero network requests during operation. Each task is sized at <= 1 story point (a few hours of focused work).

---

## Task Context

| Attribute | Value |
|-----------|-------|
| **Phase** | 6 - Inline Edit & Polish |
| **Task ID** | 6.6 |
| **Title** | Create test harness |
| **Complexity** | Small (S) |
| **Estimated Story Points** | 6 total (broken into tasks below) |
| **Dependencies** | Phases 1-5 complete, Task 6.4 (Mobile polish) |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/app/test/item-manager/page.tsx` | Main test harness page component |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/app/test/page.tsx` | Add ItemManager link and use cases to test index |

### Read-Only Dependencies (Reference Only)

| File Path | Usage |
|-----------|-------|
| `src/components/ItemManager/index.ts` | Import ItemManager component |
| `src/components/ItemManager/ItemManager.types.ts` | Import type definitions |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem types |
| `src/app/test/item-capture/page.tsx` | Reference pattern for test harness structure |

---

## Detailed Task Breakdown

### Task 1: Create Test Page Directory and File Structure

**Story Points**: 0.5
**Estimated Time**: 30 minutes

**Description**: Create the directory structure and base file for the ItemManager test harness page.

**File to Create**: `src/app/test/item-manager/page.tsx`

**Implementation Steps**:

1.1. Create directory `src/app/test/item-manager/`

1.2. Create `page.tsx` file with:
   - `'use client'` directive at top of file
   - JSDoc header comment with:
     - Description: "ItemManager Test Harness Page"
     - Features list (console output, session counter, mock data, zero network)
     - Route: `/test/item-manager`
     - Created date: current system date
     - Last modified date: current system date
     - Request reference: REQ-090 (Task 6.6)
   - Import statements for React hooks (`useState`, `useCallback`)
   - Export default function `TestItemManagerPage`

1.3. Add minimal return JSX with placeholder content:
```tsx
return (
  <div className="min-h-screen bg-gray-100 p-4">
    <h1 className="text-2xl font-bold">ItemManager Test Harness</h1>
    <p className="text-gray-600">Loading...</p>
  </div>
);
```

**Code Template**:
```tsx
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
 * @created 2026-01-03
 * @lastModified 2026-01-03
 * @request REQ-090 (Task 6.6)
 */

import { useState, useCallback } from 'react';

export default function TestItemManagerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <p>ItemManager Test Harness - Coming Soon</p>
    </div>
  );
}
```

**Verification Steps**:
- [ ] Directory `src/app/test/item-manager/` exists
- [ ] File `page.tsx` exists with proper structure
- [ ] Run `npm run dev` and navigate to `/test/item-manager`
- [ ] Page loads without errors
- [ ] No TypeScript compilation errors

**Acceptance Criteria**:
- Page loads at `/test/item-manager` without errors
- Basic placeholder content displays

---

### Task 2: Implement JSON Serialization Utilities

**Story Points**: 0.5
**Estimated Time**: 30 minutes

**Description**: Create utility functions for serializing Blob, File, and Date objects in console output. This follows the pattern established in the ItemCapture test harness.

**File**: `src/app/test/item-manager/page.tsx` (within component)

**Implementation Steps**:

2.1. Add `jsonReplacer` callback function to handle non-standard JSON types:
   - Blob: Display as `[Blob: X bytes, type/mime]`
   - File: Display as `[File: name, X bytes, type/mime]`
   - Date: Convert to ISO string

2.2. Add `logCallback` wrapper function for structured console logging:
   - Accept callback name and data parameters
   - Add timestamp to all log entries
   - Use separator lines for visibility
   - Return formatted string for UI display

2.3. Add state for tracking last output:
```tsx
interface CallbackOutput {
  callbackName: string;
  timestamp: string;
  data: string;
}
const [lastOutput, setLastOutput] = useState<CallbackOutput | null>(null);
```

**Code Template**:
```tsx
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
```

**Verification Steps**:
- [ ] No TypeScript errors in utility functions
- [ ] Test with sample data: `logCallback('TEST', { date: new Date(), blob: new Blob(['test']) })`
- [ ] Console output is properly formatted with separators and timestamps
- [ ] Blob/File/Date objects display human-readable format instead of `[object Object]`

**Acceptance Criteria**:
- Console output is clearly formatted with separators
- Non-serializable types display type and size
- Dates display in ISO format

---

### Task 3: Generate Comprehensive Mock Item Data

**Story Points**: 1
**Estimated Time**: 1-2 hours

**Description**: Create a `generateMockItems` function that produces 8 diverse mock items covering all content type variations, edge cases, and media combinations.

**File**: `src/app/test/item-manager/page.tsx` (above component)

**Implementation Steps**:

3.1. Add import for types from ItemCapture:
```tsx
import { ItemManager } from '@/components/ItemManager';
import type { ItemRecord, MediaItem } from '@/components/ItemCapture';
```

3.2. Create helper function `createMockBlob` for generating mock Blob objects:
```tsx
const createMockBlob = (type: string, size: number = 1024): Blob => {
  const content = new Array(size).fill('x').join('');
  return new Blob([content], { type });
};
```

3.3. Create helper function `createMockMedia` for generating media items:
```tsx
const createMockMedia = (
  id: string,
  type: 'video' | 'image' | 'pdf',
  order: number,
  options: Partial<MediaItem['metadata']> = {}
): MediaItem => ({
  id,
  type,
  order,
  file: createMockBlob(
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
```

3.4. Create `generateMockItems` function returning array of 8 `ItemRecord` objects:

| Item # | Title | Content Type | Media | Tags | Special Test Case |
|--------|-------|--------------|-------|------|-------------------|
| 1 | "How to Use the Coffee Maker" | media | 1 video | 2 tags | Standard video item |
| 2 | "Thermostat Settings" | media | 3 images | 1 tag | Multi-image gallery |
| 3 | "Dishwasher Manual" | pdf-only | 1 PDF | 0 tags | PDF with page count |
| 4 | "WiFi Network Information" | text-only | 0 | 3 tags | Text-only, markdown |
| 5 | "Pool Equipment Guide" | mixed | 2 videos + 1 image + text | 2 tags | Mixed content |
| 6 | "Garbage Disposal" | media | 1 image | 0 tags | Empty tags array |
| 7 | "Extremely Long Title..." | media | 1 video | 1 tag | Title truncation |
| 8 | "Emergency Shutoffs" | media | 1 image | 2 tags | No location field |

3.5. Ensure varied `createdAt` dates for sort testing (spread over past 2 weeks)

**Verification Steps**:
- [ ] `generateMockItems()` returns exactly 8 items
- [ ] Each item has unique `id` field
- [ ] Content types match media array contents
- [ ] No TypeScript type errors
- [ ] Mock blobs have appropriate MIME types
- [ ] Dates span a reasonable range for testing sort

**Acceptance Criteria**:
- Mock data covers all item type variations from overview document
- Mock data compiles without TypeScript errors
- Items have realistic, varied content

---

### Task 4: Implement All Callback Handlers

**Story Points**: 1
**Estimated Time**: 1-2 hours

**Description**: Implement callback handler functions for all 8 ItemManager callbacks with console logging and state updates where applicable.

**File**: `src/app/test/item-manager/page.tsx`

**Implementation Steps**:

4.1. Add state variables for items and UI tracking:
```tsx
const [items, setItems] = useState<ItemRecord[]>(generateMockItems);
const [sessionCount, setSessionCount] = useState(0);
```

4.2. Implement `handleEditItem` callback (log only):
```tsx
const handleEditItem = useCallback((item: ItemRecord) => {
  logCallback('EDIT_ITEM', item);
}, [logCallback]);
```

4.3. Implement `handleDeleteItems` callback (modifies state):
```tsx
const handleDeleteItems = useCallback((ids: string[]) => {
  logCallback('DELETE_ITEMS', { ids, count: ids.length });
  setItems(prev => prev.filter(i => !ids.includes(i.id)));
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.4. Implement `handleUpdateItem` callback (modifies state):
```tsx
const handleUpdateItem = useCallback((updatedItem: ItemRecord) => {
  logCallback('UPDATE_ITEM', updatedItem);
  setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.5. Implement `handleAddAssets` callback:
```tsx
const handleAddAssets = useCallback((itemId: string, assets: File[]) => {
  logCallback('ADD_ASSETS', {
    itemId,
    assetCount: assets.length,
    assets: assets.map(f => ({ name: f.name, size: f.size, type: f.type }))
  });
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.6. Implement `handleRemoveAssets` callback:
```tsx
const handleRemoveAssets = useCallback((itemId: string, assetIds: string[]) => {
  logCallback('REMOVE_ASSETS', { itemId, assetIds, count: assetIds.length });
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.7. Implement `handleReorderAssets` callback:
```tsx
const handleReorderAssets = useCallback((itemId: string, orderedIds: string[]) => {
  logCallback('REORDER_ASSETS', { itemId, orderedIds });
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.8. Implement `handleDuplicateItem` callback (modifies state):
```tsx
const handleDuplicateItem = useCallback((item: ItemRecord) => {
  const newId = `item-dup-${Date.now()}`;
  const duplicated = { ...item, id: newId, title: `${item.title} (Copy)` };
  logCallback('DUPLICATE_ITEM', { original: item.id, duplicate: duplicated });
  setItems(prev => [...prev, duplicated]);
  setSessionCount(prev => prev + 1);
}, [logCallback]);
```

4.9. Implement `handleSelectionChange` callback:
```tsx
const handleSelectionChange = useCallback((selectedIds: string[]) => {
  logCallback('SELECTION_CHANGE', { selectedIds, count: selectedIds.length });
}, [logCallback]);
```

**Verification Steps**:
- [ ] All 8 callback handlers are implemented
- [ ] Each handler calls `logCallback` with appropriate name
- [ ] `handleDeleteItems` removes items from state
- [ ] `handleUpdateItem` replaces items in state
- [ ] `handleDuplicateItem` adds new item with unique ID
- [ ] Session count increments on state-modifying operations
- [ ] No TypeScript errors

**Acceptance Criteria**:
- DELETE_ITEMS removes items from displayed list
- UPDATE_ITEM updates the corresponding item
- All callbacks log structured output to browser console
- Session counter reflects number of operations performed

---

### Task 5: Build Test Harness UI Layout

**Story Points**: 1
**Estimated Time**: 1-2 hours

**Description**: Implement the full UI layout including header, ItemManager component, and output preview panel.

**File**: `src/app/test/item-manager/page.tsx`

**Implementation Steps**:

5.1. Create header section with:
   - Page title: "ItemManager Test Harness"
   - Subtitle: "Development & debugging environment"
   - Session counter display
   - Network verification reminder text

5.2. Add reset functionality:
```tsx
const handleResetItems = useCallback(() => {
  const timestamp = new Date().toISOString();
  console.log('==================================================');
  console.log(`=== ITEMS RESET [${timestamp}] ===`);
  console.log('==================================================');
  setItems(generateMockItems());
  setLastOutput(null);
}, []);
```

5.3. Create info bar displaying:
   - Current item count: `{items.length} items`
   - Reset button

5.4. Render ItemManager component with all props connected:
```tsx
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
```

5.5. Create collapsible output panel at bottom:
   - Fixed position or sticky at bottom
   - Dark background with monospace font
   - Shows last callback name and timestamp
   - Expandable to show full JSON output
   - Dismiss button to hide

5.6. Apply Tailwind CSS styling:
   - Full height layout with proper scrolling
   - Header fixed at top
   - ItemManager takes remaining space
   - Output panel at bottom (collapsible)

**Code Template**:
```tsx
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
            Development & debugging environment
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
        {/* ItemManager component here */}
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
```

**Verification Steps**:
- [ ] Header displays with title, subtitle, and session counter
- [ ] Item count indicator shows correct number
- [ ] Reset button appears and functions correctly
- [ ] Network reminder is visible
- [ ] ItemManager component renders in the main content area
- [ ] Output panel appears when a callback is triggered
- [ ] Dismiss button hides the output panel
- [ ] Layout is responsive on mobile viewports

**Acceptance Criteria**:
- All UI sections render correctly
- ItemManager displays 8 mock items
- Interactions update output panel
- Reset functionality works completely

---

### Task 6: Add ItemManager Link to Test Index Page

**Story Points**: 0.5
**Estimated Time**: 30 minutes

**Description**: Add ItemManager to the main test index page with appropriate link and description.

**File**: `src/app/test/page.tsx`

**Implementation Steps**:

6.1. Locate the `mainTests` array (around line 22)

6.2. Add ItemManager entry to `mainTests`:
```tsx
const mainTests: TestLink[] = [
  {
    href: '/test/item-capture',
    title: 'Full Wizard',
    description: 'Complete ItemCapture flow - metadata → content → capture → edit → review',
  },
  {
    href: '/test/item-manager',
    title: 'ItemManager',
    description: 'Browse, filter, select, and manage item collection with all callbacks',
  },
];
```

6.3. Update page title in JSX to be more inclusive:
   - Change `<h1>` from "ItemCapture Test Harness" to "Component Test Harness"
   - Update description to mention both ItemCapture and ItemManager

6.4. Update the `@lastModified` date in header comment

6.5. Update footer date

**Verification Steps**:
- [ ] Navigate to `/test`
- [ ] ItemManager link appears in Main Wizard section
- [ ] Link has correct title and description
- [ ] Clicking link navigates to `/test/item-manager`
- [ ] Page title reflects broader scope

**Acceptance Criteria**:
- ItemManager appears as a navigable test option
- Test index page organizes tests logically
- Navigation works correctly

---

### Task 7: Add ItemManager Use Cases to Test Index

**Story Points**: 1
**Estimated Time**: 1 hour

**Description**: Add documented test use cases for ItemManager to the test index page, following the pattern of existing ItemCapture use cases.

**File**: `src/app/test/page.tsx`

**Implementation Steps**:

7.1. Locate the `useCases` array (around line 115)

7.2. Add ItemManager-specific use cases after existing use cases:

**Use Case: Grid/List View Toggle**
```tsx
{
  title: 'Use Case: Grid/List View Toggle',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'View items in default grid layout',
    'Click list view toggle button',
    'Verify items display as rows with metadata columns',
    'Toggle back to grid view',
  ],
},
```

**Use Case: Search and Filter Items**
```tsx
{
  title: 'Use Case: Search and Filter Items',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'Type "coffee" in search box',
    'Verify only matching items appear',
    'Click content type filter for "Video"',
    'Verify filter combines with search',
    'Click "Clear filters" to reset',
  ],
},
```

**Use Case: Multi-Select and Bulk Delete**
```tsx
{
  title: 'Use Case: Multi-Select and Bulk Delete',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'Enter selection mode (checkbox icon)',
    'Select 3 items using checkboxes',
    'Verify bulk action bar appears with count',
    'Click delete button in bulk bar',
    'Confirm deletion in dialog',
    'Verify console logs DELETE_ITEMS with 3 IDs',
    'Verify items are removed from display',
  ],
},
```

**Use Case: Inline Edit Title**
```tsx
{
  title: 'Use Case: Inline Edit Title',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'Click on an item title to edit inline',
    'Change the title text',
    'Press Enter or click outside to save',
    'Verify console logs UPDATE_ITEM with new title',
  ],
},
```

**Use Case: Item Preview Modal**
```tsx
{
  title: 'Use Case: Item Preview Modal',
  testPath: '/test/item-manager',
  steps: [
    'Go to ItemManager test page',
    'Click on an item card (not the checkbox)',
    'Verify preview modal opens with item details',
    'Swipe through media gallery if multiple media',
    'Scroll to view instructions text',
    'Click Edit button - verify EDIT_ITEM logged',
    'Close modal with X button or Escape key',
    'Verify focus returns to triggering element',
  ],
},
```

**Use Case: Verify Zero Network Requests**
```tsx
{
  title: 'Use Case: Verify Zero Network Requests',
  testPath: '/test/item-manager',
  steps: [
    'Open browser DevTools → Network tab',
    'Clear network log',
    'Navigate to ItemManager test page',
    'Perform: search, filter, select, delete, inline edit',
    'Verify Network tab shows only static assets (JS, CSS)',
    'Confirm zero API requests to backend endpoints',
  ],
},
```

**Verification Steps**:
- [ ] All 6 new use cases display in "Test Use Cases" section
- [ ] Each use case has "Start Test" button linking to `/test/item-manager`
- [ ] Steps are clear and actionable
- [ ] No duplicate use case titles

**Acceptance Criteria**:
- Use cases cover all major ItemManager features
- Steps are clear and actionable for manual testing
- Network isolation verification is documented

---

### Task 8: Final Integration Testing and Verification

**Story Points**: 0.5
**Estimated Time**: 30-60 minutes

**Description**: Comprehensive verification that the test harness works end-to-end.

**Actions**:

8.1. Run full integration test of test harness:
   - Navigate to `/test/item-manager`
   - Verify all 8 mock items display
   - Test each callback by performing corresponding action
   - Verify console output for each callback
   - Test reset functionality

8.2. Verify all 8 callbacks produce console output:

| Callback | Action to Trigger | Expected Log |
|----------|-------------------|--------------|
| `onEditItem` | Click item "Edit" button | `EDIT_ITEM` with item data |
| `onDeleteItems` | Delete single or bulk items | `DELETE_ITEMS` with ID array |
| `onUpdateItem` | Inline edit title/location | `UPDATE_ITEM` with changed item |
| `onAddAssets` | Add media via asset panel | `ADD_ASSETS` with file info |
| `onRemoveAssets` | Remove asset in panel | `REMOVE_ASSETS` with asset IDs |
| `onReorderAssets` | Drag reorder in panel | `REORDER_ASSETS` with new order |
| `onDuplicateItem` | Click duplicate button | `DUPLICATE_ITEM` with new item |
| `onSelectionChange` | Select/deselect items | `SELECTION_CHANGE` with IDs |

8.3. Verify network isolation:
   - Open DevTools Network tab
   - Clear network log
   - Perform all operations (search, filter, select, delete, edit)
   - Confirm only static asset requests (JS, CSS, fonts)
   - Confirm ZERO API calls to backend

8.4. Test responsive layout:
   - Test on mobile viewport (375px width)
   - Test on tablet viewport (768px width)
   - Test on desktop viewport (1440px width)

8.5. Update page comments with final modification date

**Verification Checklist**:
- [ ] Page loads at `/test/item-manager` without errors
- [ ] All 8 mock items display in grid view
- [ ] Grid/list view toggle works
- [ ] Search filters items by title
- [ ] Content type filters work
- [ ] Sort options change item order
- [ ] Multi-select and bulk delete work
- [ ] Inline edit triggers UPDATE_ITEM
- [ ] All callbacks log structured output
- [ ] Session counter increments correctly
- [ ] Reset button works
- [ ] Output panel appears and dismisses
- [ ] Zero network requests verified
- [ ] Responsive layout works on all viewports

**Acceptance Criteria**:
- Test harness is fully functional
- All features documented in overview are working
- Manual testing can be completed following use cases

---

## Task Dependency Graph

```
Task 1: Create File Structure
    │
    ▼
Task 2: Implement JSON Utilities
    │
    ▼
Task 3: Generate Mock Data
    │
    ▼
Task 4: Implement Callbacks
    │
    ▼
Task 5: Build UI Layout
    │
    ├──► Task 6: Update Test Index (can run in parallel)
    │         │
    │         ▼
    │    Task 7: Add Use Cases
    │
    ▼
Task 8: Integration Testing
```

---

## Estimated Total Effort

| Task | Description | Effort |
|------|-------------|--------|
| Task 1 | Create File Structure | ~0.5 SP |
| Task 2 | JSON Serialization Utilities | ~0.5 SP |
| Task 3 | Generate Mock Data | ~1 SP |
| Task 4 | Implement Callbacks | ~1 SP |
| Task 5 | Build UI Layout | ~1 SP |
| Task 6 | Update Test Index Link | ~0.5 SP |
| Task 7 | Add Use Cases | ~1 SP |
| Task 8 | Integration Testing | ~0.5 SP |
| **Total** | | **~6 SP** |

---

## Complete Acceptance Criteria Checklist

From overview document - all must be verified:

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

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemManager component not complete (Phases 1-5) | Medium | High | Task is gated on Phase 5 completion; verify component exists before starting |
| Mock data doesn't cover edge cases | Low | Medium | Review PRD requirements; ensure all content types represented |
| Console logging too verbose | Low | Low | Use collapsible output panel; clear separator lines in console |
| ItemManager props interface changes | Low | Medium | Reference `ItemManager.types.ts` for current interface |

---

## Related Documentation

- [REQ-090 Overview Document](/docs/REQ-090-create-test-harness-overview.md)
- [ItemManager Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [ItemCapture Test Harness Reference](/src/app/test/item-capture/page.tsx)
- [Test Index Page](/src/app/test/page.tsx)

---

## Appendix A: Complete Mock Items Specification

```typescript
const generateMockItems = (): ItemRecord[] => {
  // Helper to create mock blob
  const createMockBlob = (type: string, size: number = 1024): Blob => {
    const content = new Array(size).fill('x').join('');
    return new Blob([content], { type });
  };

  return [
    // 1. Video item - Coffee Maker
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
        file: createMockBlob('video/mp4', 5242880),
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

    // 2. Photo item - Thermostat (3 images)
    {
      id: 'item-002',
      title: 'Thermostat Settings',
      location: 'Hallway',
      tags: ['hvac'],
      applianceType: 'hvac',
      contentType: 'media',
      media: [
        { id: 'media-002a', type: 'image', order: 0, file: createMockBlob('image/jpeg'), metadata: { mimeType: 'image/jpeg', fileSize: 1048576, source: 'capture' } },
        { id: 'media-002b', type: 'image', order: 1, file: createMockBlob('image/jpeg'), metadata: { mimeType: 'image/jpeg', fileSize: 1048576, source: 'capture' } },
        { id: 'media-002c', type: 'image', order: 2, file: createMockBlob('image/jpeg'), metadata: { mimeType: 'image/jpeg', fileSize: 1048576, source: 'capture' } },
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
      media: [{
        id: 'media-003',
        type: 'pdf',
        order: 0,
        file: createMockBlob('application/pdf', 2097152),
        metadata: {
          mimeType: 'application/pdf',
          fileSize: 2097152,
          source: 'upload',
          pageCount: 24,
        },
      }],
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
        { id: 'media-005a', type: 'video', order: 0, file: createMockBlob('video/mp4', 8388608), metadata: { mimeType: 'video/mp4', fileSize: 8388608, source: 'capture', duration: 120 } },
        { id: 'media-005b', type: 'video', order: 1, file: createMockBlob('video/mp4', 4194304), metadata: { mimeType: 'video/mp4', fileSize: 4194304, source: 'upload', duration: 60 } },
        { id: 'media-005c', type: 'image', order: 2, file: createMockBlob('image/jpeg'), metadata: { mimeType: 'image/jpeg', fileSize: 1048576, source: 'capture' } },
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
      media: [{
        id: 'media-006',
        type: 'image',
        order: 0,
        file: createMockBlob('image/jpeg', 524288),
        metadata: { mimeType: 'image/jpeg', fileSize: 524288, source: 'capture' },
      }],
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
      media: [{
        id: 'media-007',
        type: 'video',
        order: 0,
        file: createMockBlob('video/mp4', 3145728),
        metadata: { mimeType: 'video/mp4', fileSize: 3145728, source: 'capture', duration: 30 },
      }],
      createdAt: new Date('2025-12-05'),
    },

    // 8. No location - Emergency Shutoffs
    {
      id: 'item-008',
      title: 'Emergency Shutoffs',
      // location intentionally omitted
      tags: ['safety', 'emergency'],
      contentType: 'media',
      media: [{
        id: 'media-008',
        type: 'image',
        order: 0,
        file: createMockBlob('image/jpeg', 786432),
        metadata: { mimeType: 'image/jpeg', fileSize: 786432, source: 'capture' },
      }],
      instructions: 'Water shutoff: basement near water heater\nGas shutoff: side of house near meter\nElectrical: main breaker in garage',
      createdAt: new Date('2025-11-30'),
    },
  ];
};
```

---

**Document End**
