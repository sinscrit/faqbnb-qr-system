# REQ-E05-017: Add Translation Status Column to Items List - Implementation Overview

**Created**: 2026-01-22 19:44
**Last Modified**: 2026-01-22 19:44
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.5

---

## 1. Goal

Add an optional translation status indicator to the ItemGrid component that displays compact translation coverage status for each item. The indicator shows 6 colored dots representing each supported language (es, fr, de, it, nl, pt), is toggleable via column visibility settings, and clicking it opens the TranslationPreviewPanel for detailed translation management.

**Primary Files**:
- `/src/components/ItemManager/components/ItemGrid.tsx` (modify)
- `/src/components/ItemManager/ItemManager.types.ts` (modify)
- `/src/components/ItemManager/hooks/useColumnVisibility.ts` (modify)

**Key Features**:
- Optional translation status display (controlled by column visibility)
- 6-dot indicator per item showing language-specific translation status
- Color-coded status: green (complete), orange (pending), red (failed), amber (stale), gray (missing)
- Clickable indicator opens TranslationPreviewPanel
- Integration with existing column visibility system
- Responsive layout with indicator positioned below ItemCard

---

## 2. Implementation Plan

### Step 1: Update ColumnVisibilityState Type Definition
**File**: `/src/components/ItemManager/ItemManager.types.ts`

Add `translationStatus` property to ColumnVisibilityState interface.

**Current Interface** (lines 377-380):
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
}
```

**Updated Interface**:
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
  /** Whether the Translation Status column is visible */
  translationStatus: boolean;
}
```

**Actions**:
- Add `translationStatus: boolean` property to interface (line ~380)
- Add JSDoc comment explaining the field
- Update `@lastModified` comment

### Step 2: Update useColumnVisibility Hook Default State
**File**: `/src/components/ItemManager/hooks/useColumnVisibility.ts`

Add `translationStatus` to DEFAULT_VISIBILITY constant.

**Current Default** (lines 45-47):
```typescript
const DEFAULT_VISIBILITY: ColumnVisibilityState = {
  property: false, // Hidden by default as per requirements
};
```

**Updated Default**:
```typescript
const DEFAULT_VISIBILITY: ColumnVisibilityState = {
  property: false, // Hidden by default as per requirements
  translationStatus: false, // Hidden by default, opt-in feature
};
```

**Actions**:
- Add `translationStatus: false` to DEFAULT_VISIBILITY (line ~47)
- Add comment explaining default visibility
- Update `@lastModified` comment

### Step 3: Update useColumnVisibility Hook Type Definition
**File**: `/src/components/ItemManager/hooks/useColumnVisibility.ts`

Ensure local ColumnVisibilityState type matches ItemManager.types.ts.

**Current Type** (lines 25-28):
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible (default: false) */
  property: boolean;
}
```

**Decision**: Remove local type definition, import from ItemManager.types.ts instead.

**Implementation**:
```typescript
// Remove local interface (lines 25-28)
// Add import at top of file
import type { ColumnVisibilityState } from '../ItemManager.types';
```

**Actions**:
- Remove duplicate ColumnVisibilityState interface (lines 25-28)
- Add import statement for ColumnVisibilityState from ItemManager.types
- Ensure no TypeScript errors from type consolidation

### Step 4: Update ItemGridProps Interface
**File**: `/src/components/ItemManager/ItemManager.types.ts`

Add props for translation status display to ItemGridProps.

**Current Interface** (lines 649-670):
```typescript
export interface ItemGridProps {
  /** Array of item records to display */
  items: ItemRecord[];
  /** Callback when an item card is clicked for preview */
  onItemPreview: (item: ItemRecord) => void;
  /** Callback when selection state changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Set of currently selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Callback when long-press gesture triggers selection mode (mobile) */
  onLongPressSelect?: (id: string) => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Enable inline editing of title/location/tags */
  enableInlineEdit?: boolean;
  /** Callback when item is updated via inline edit */
  onUpdateItem?: (item: ItemRecord) => Promise<void>;
  /** Existing tags from all items for autocomplete suggestions */
  existingTags?: string[];
}
```

**Updated Interface**:
```typescript
export interface ItemGridProps {
  // ... existing props ...

  /** Whether to show translation status indicator on each item card */
  showTranslationStatus?: boolean;
  /** Callback when translation status indicator is clicked (opens preview panel) */
  onTranslationStatusClick?: (item: ItemRecord) => void;
  /** Translation status data for items, keyed by item ID */
  translationStatuses?: Record<string, LanguageTranslationSummary[]>;
}
```

**Actions**:
- Add three new optional props after `existingTags` (line ~670)
- Add JSDoc comments for each prop
- Import `LanguageTranslationSummary` type (see Step 5)
- Update `@lastModified` comment

### Step 5: Import LanguageTranslationSummary Type
**File**: `/src/components/ItemManager/ItemManager.types.ts`

Import translation types from TranslationManagement namespace.

**Current Imports** (line 12):
```typescript
import type { ItemRecord, MediaItem, MediaMetadata, ApplianceType } from '@/components/ItemCapture';
```

**Add Import**:
```typescript
import type { ItemRecord, MediaItem, MediaMetadata, ApplianceType } from '@/components/ItemCapture';
import type { LanguageTranslationSummary } from '@/components/TranslationManagement/TranslationManagement.types';
```

**Note**: Assumes LanguageTranslationSummary is exported from REQ-E05-006. If not available, define locally:
```typescript
// Fallback if not exported from TranslationManagement
interface LanguageTranslationSummary {
  language: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual';
  translatedAt?: string;
}
```

**Actions**:
- Attempt import from TranslationManagement.types
- If not available, define interface locally in ItemManager.types.ts
- Document decision in code comment

### Step 6: Update ItemGrid Component Props Destructuring
**File**: `/src/components/ItemManager/components/ItemGrid.tsx`

Add new props to component function signature.

**Current Props** (lines 17-29):
```typescript
export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
}: ItemGridProps & { loading?: boolean }) {
```

**Updated Props**:
```typescript
export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
  // Translation status props
  showTranslationStatus,
  onTranslationStatusClick,
  translationStatuses,
}: ItemGridProps & { loading?: boolean }) {
```

**Actions**:
- Add three new props to destructuring (after `loading`)
- Add comment grouping translation status props
- Maintain consistent formatting

### Step 7: Import TranslationStatusColumn Component
**File**: `/src/components/ItemManager/components/ItemGrid.tsx`

Add import for TranslationStatusColumn component.

**Current Imports** (lines 12-15):
```typescript
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';
```

**Add Import**:
```typescript
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';
import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';
```

**Actions**:
- Add import after ItemCard import (line ~15)
- Maintain alphabetical ordering of component imports

### Step 8: Add Translation Status Indicator to JSX
**File**: `/src/components/ItemManager/components/ItemGrid.tsx`

Render TranslationStatusColumn conditionally for each item.

**Current JSX** (lines 45-58):
```tsx
{items.map((item) => (
  <div key={item.id} role="gridcell">
    <ItemCard
      item={item}
      onPreviewClick={onItemPreview}
      onSelectionChange={onSelectionChange}
      isSelected={selectedIds.has(item.id)}
      isSelectionMode={isSelectionMode}
      onLongPressSelect={onLongPressSelect}
      enableInlineEdit={enableInlineEdit}
      onUpdateItem={onUpdateItem}
      existingTags={existingTags}
    />
  </div>
))}
```

**Updated JSX**:
```tsx
{items.map((item) => (
  <div key={item.id} role="gridcell">
    <ItemCard
      item={item}
      onPreviewClick={onItemPreview}
      onSelectionChange={onSelectionChange}
      isSelected={selectedIds.has(item.id)}
      isSelectionMode={isSelectionMode}
      onLongPressSelect={onLongPressSelect}
      enableInlineEdit={enableInlineEdit}
      onUpdateItem={onUpdateItem}
      existingTags={existingTags}
    />

    {/* REQ-E05-017: Translation Status Indicator */}
    {showTranslationStatus && translationStatuses?.[item.id] && (
      <div className="mt-2 flex justify-center">
        <TranslationStatusColumn
          entityId={item.id}
          entityType="item"
          translations={translationStatuses[item.id]}
          size="sm"
          onClick={() => onTranslationStatusClick?.(item)}
          showTooltip={true}
        />
      </div>
    )}
  </div>
))}
```

**Actions**:
- Add conditional rendering after ItemCard (line ~58)
- Wrap TranslationStatusColumn in centered div with mt-2 spacing
- Pass required props: entityId, entityType, translations, size, onClick
- Only render when showTranslationStatus is true AND translation data exists
- Add REQ comment for traceability

### Step 9: Update ItemGrid Component Documentation
**File**: `/src/components/ItemManager/components/ItemGrid.tsx`

Update file-level JSDoc to document translation status feature.

**Current JSDoc** (lines 2-10):
```typescript
/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-22 (REQ-E02-080 - Updated i18n to use items.grid namespace)
 */
```

**Updated JSDoc**:
```typescript
/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 * Optionally displays translation status indicator below each card.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-22 (REQ-E05-017 - Added translation status indicator support)
 */
```

**Actions**:
- Add note about optional translation status indicator
- Update @lastModified with REQ-E05-017

### Step 10: Add Translation Status Column Option to ColumnSettingsPopup
**File**: `/src/components/ItemManager/components/ColumnSettingsPopup.tsx` (assumed to exist)

Add translation status to column visibility options.

**Note**: Need to locate ColumnSettingsPopup component first. If it doesn't exist, this step may be part of a different component.

**Expected Implementation**:
```typescript
const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'property', labelKey: 'property' },
  { key: 'translationStatus', labelKey: 'translationStatus' },
];
```

**Actions**:
- Locate ColumnSettingsPopup or similar column visibility UI component
- Add 'translationStatus' to COLUMN_OPTIONS array
- Ensure labelKey maps to translation namespace

### Step 11: Add Translation Keys to Message Files
**Files**:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Add translation keys for column label and description.

**English Template** (`/messages/en.json`):
```json
{
  "items": {
    "columns": {
      "translationStatus": "Translation Status",
      "translationStatusDescription": "Show translation coverage for each item"
    }
  }
}
```

**Actions**:
- Add keys to English file first (source language)
- Copy structure to all target language files (fr, es, de, nl, it)
- Translate text appropriately for each language
- Ensure consistent key structure across all files
- Validate JSON syntax

### Step 12: Update ItemManager Parent Component Integration
**File**: `/src/components/ItemManager/ItemManager.tsx` (or parent component)

Pass translation status props to ItemGrid when rendering.

**Pattern Reference**: Parent component needs to:
1. Fetch translation status data for displayed items
2. Pass showTranslationStatus based on column visibility
3. Pass onTranslationStatusClick callback
4. Pass translationStatuses data

**Implementation Example**:
```tsx
// In parent component (ItemManager.tsx or similar)
const { columnVisibility } = useColumnVisibility();
const [translationStatuses, setTranslationStatuses] = useState<Record<string, LanguageTranslationSummary[]>>({});

// Fetch translation data (using useTranslationStatus or similar)
useEffect(() => {
  if (columnVisibility.translationStatus) {
    // Fetch translation data for items
    fetchTranslationStatuses(items.map(i => i.id)).then(setTranslationStatuses);
  }
}, [columnVisibility.translationStatus, items]);

// Pass to ItemGrid
<ItemGrid
  // ... existing props ...
  showTranslationStatus={columnVisibility.translationStatus}
  onTranslationStatusClick={handleTranslationStatusClick}
  translationStatuses={translationStatuses}
/>
```

**Actions**:
- Locate parent component that renders ItemGrid
- Add column visibility integration
- Add translation data fetching logic
- Implement click handler for opening TranslationPreviewPanel
- Pass props to ItemGrid component

### Step 13: Implement Translation Status Click Handler
**Context**: Parent component (ItemManager.tsx or similar)

Create callback function to open TranslationPreviewPanel when status is clicked.

**Implementation Example**:
```typescript
const [previewPanelState, setPreviewPanelState] = useState<{
  open: boolean;
  item: ItemRecord | null;
}>({ open: false, item: null });

const handleTranslationStatusClick = useCallback((item: ItemRecord) => {
  setPreviewPanelState({ open: true, item });
}, []);

// In JSX
<TranslationPreviewPanel
  isOpen={previewPanelState.open}
  onClose={() => setPreviewPanelState({ open: false, item: null })}
  entityId={previewPanelState.item?.id}
  entityType="item"
  // ... other props
/>
```

**Actions**:
- Add state for TranslationPreviewPanel visibility
- Create handleTranslationStatusClick callback
- Pass callback to ItemGrid via onTranslationStatusClick prop
- Render TranslationPreviewPanel (from REQ-E05-007)
- Handle panel close action

### Step 14: Fetch Translation Status Data
**Context**: Parent component data fetching

Implement logic to fetch translation status for visible items.

**Pattern Reference**: Use useTranslationStatus hook (REQ-E05-011) or create batch fetching logic

**Implementation Considerations**:
- Only fetch when column is visible (performance optimization)
- Batch fetch for all visible items (avoid N+1 queries)
- Update when items list changes
- Handle loading and error states

**Implementation Example**:
```typescript
const [translationStatuses, setTranslationStatuses] = useState<Record<string, LanguageTranslationSummary[]>>({});
const [loadingStatuses, setLoadingStatuses] = useState(false);

useEffect(() => {
  if (!columnVisibility.translationStatus || items.length === 0) {
    return;
  }

  setLoadingStatuses(true);

  // Batch fetch translation statuses
  const itemIds = items.map(i => i.id);
  fetchBatchTranslationStatus(itemIds)
    .then(statuses => {
      setTranslationStatuses(statuses);
    })
    .catch(error => {
      console.error('Failed to fetch translation statuses:', error);
    })
    .finally(() => {
      setLoadingStatuses(false);
    });
}, [columnVisibility.translationStatus, items]);
```

**Actions**:
- Add state for translation statuses
- Implement fetch logic (may use API endpoint or hook)
- Handle loading state
- Handle error state
- Optimize to avoid unnecessary refetches

### Step 15: Handle Missing Translation Data Gracefully
**File**: `/src/components/ItemManager/components/ItemGrid.tsx`

Ensure component handles missing or incomplete translation data.

**Current Conditional** (from Step 8):
```tsx
{showTranslationStatus && translationStatuses?.[item.id] && (
  <TranslationStatusColumn ... />
)}
```

**Considerations**:
- If translationStatuses[item.id] is undefined, don't render indicator
- TranslationStatusColumn should handle empty translations array internally
- No error state needed in ItemGrid (component is gracefully hidden)

**Actions**:
- Verify conditional rendering handles all cases
- Test with missing data scenarios
- Ensure no console errors when data is missing

### Step 16: Test Responsive Layout with Translation Status
**Context**: Manual testing for layout verification

Verify translation status indicator doesn't break responsive grid layout.

**Test Scenarios**:
1. Desktop view (xl/2xl): 5-6 columns with indicators
2. Tablet view (md/lg): 3-4 columns with indicators
3. Mobile view (sm): 2 columns with indicators
4. Single column (base): 1 column with indicator
5. Verify spacing between cards maintained
6. Verify indicator centered below each card
7. Verify indicator doesn't overflow card bounds

**Actions**:
- Test all breakpoints
- Verify grid gap maintained
- Check indicator positioning and alignment
- Ensure no horizontal scrolling introduced
- Verify touch targets are adequate (44px min)

### Step 17: Integration Testing
**Context**: Full feature integration testing

Test complete feature from column visibility toggle to preview panel open.

**Test Scenarios**:
1. Toggle translation status column on → indicators appear
2. Toggle translation status column off → indicators disappear
3. Click indicator → TranslationPreviewPanel opens with correct item
4. Missing translation data → indicator hidden (no errors)
5. Column visibility persists to sessionStorage
6. Indicators display correct colors for each status
7. Tooltip appears on hover showing language details
8. Keyboard navigation works (Tab to indicator, Enter to click)
9. Screen reader announces indicator correctly
10. Feature doesn't interfere with existing ItemGrid functionality

**Actions**:
- Perform comprehensive end-to-end testing
- Test with various data scenarios
- Verify accessibility with keyboard and screen reader
- Check performance with large item lists
- Validate i18n for all languages

---

## 3. Authorized Files for Modification

### Files to Modify:
1. `/src/components/ItemManager/ItemManager.types.ts`
   - Update ColumnVisibilityState interface (line ~380)
   - Update ItemGridProps interface (line ~670)
   - Add LanguageTranslationSummary import or definition (line ~12)
   - Modification: ~10-15 lines

2. `/src/components/ItemManager/hooks/useColumnVisibility.ts`
   - Remove duplicate ColumnVisibilityState interface (lines 25-28)
   - Add import from ItemManager.types (line ~14)
   - Update DEFAULT_VISIBILITY constant (line ~47)
   - Modification: ~5 lines

3. `/src/components/ItemManager/components/ItemGrid.tsx`
   - Add TranslationStatusColumn import (line ~15)
   - Update props destructuring (line ~29)
   - Add translation status indicator JSX (line ~58)
   - Update JSDoc (lines 2-10)
   - Modification: ~20-25 lines

4. `/src/components/ItemManager/ItemManager.tsx` (or parent component)
   - Add column visibility integration
   - Add translation data fetching logic
   - Add translation status click handler
   - Pass props to ItemGrid
   - Render TranslationPreviewPanel
   - Modification: ~40-60 lines (depending on existing structure)

5. `/src/components/ItemManager/components/ColumnSettingsPopup.tsx` (if exists)
   - Add translationStatus to COLUMN_OPTIONS
   - Modification: ~1-2 lines

6. `/messages/en.json`
   - Add items.columns.translationStatus keys
   - Modification: Add nested object

7. `/messages/fr.json`
   - Add items.columns.translationStatus keys
   - Modification: Add nested object

8. `/messages/es.json`
   - Add items.columns.translationStatus keys
   - Modification: Add nested object

9. `/messages/de.json`
   - Add items.columns.translationStatus keys
   - Modification: Add nested object

10. `/messages/nl.json`
    - Add items.columns.translationStatus keys
    - Modification: Add nested object

11. `/messages/it.json`
    - Add items.columns.translationStatus keys
    - Modification: Add nested object

### Files Referenced (No Modification):
12. `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
    - Referenced: Component being integrated
    - No modification needed

13. `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
    - Referenced: Opened when indicator clicked
    - No modification needed

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-014**: TranslationStatusColumn component
  - Required for: Indicator component to import and render
  - Import: `@/components/TranslationManagement/TranslationStatusColumn`
  - Status: Must be completed before this task

- **REQ-E05-007**: TranslationPreviewPanel component
  - Required for: Panel to open when indicator clicked
  - Import: `@/components/TranslationManagement/TranslationPreviewPanel`
  - Status: Must be completed before this task (for click handler)

- **REQ-E05-006**: TranslationManagement types file
  - Required for: LanguageTranslationSummary type definition
  - Import: `@/components/TranslationManagement/TranslationManagement.types`
  - Status: Must be completed before this task

- **REQ-E05-011**: useTranslationStatus hook
  - Required for: Fetching translation status data (optional, could use API directly)
  - Import: `@/hooks/useTranslationStatus`
  - Status: Recommended to be completed for data fetching pattern

### External Dependencies (Existing):
- **next-intl**: Internationalization
  - Usage: Translation keys for column labels

- **React**: Core framework (v18+)
  - Usage: useState, useEffect, useCallback for state management

- **ItemManager**: Existing component system
  - ItemGrid.tsx: Target component for modification
  - ItemManager.types.ts: Type definitions
  - useColumnVisibility: Column visibility management

### Blocks (This Must Complete First):
None - This is a leaf task that doesn't block other features.

---

## 5. Key Technical Decisions

### 5.1 Translation Status Indicator Placement
**Decision**: Place indicator below ItemCard, not within it.

**Rationale**:
- Avoids modifying ItemCard component (separation of concerns)
- Simpler integration (just add to gridcell div)
- Easier to toggle visibility (conditional render entire div)
- No risk of breaking existing ItemCard layout

**Alternative Considered**: Embed indicator within ItemCard
- Rejected: Requires modifying ItemCard component
- More complex: Need to handle click event propagation
- Harder to maintain: Translation concern mixed with item display

**Implementation**: Render TranslationStatusColumn in separate div after ItemCard.

### 5.2 Column Visibility Integration
**Decision**: Use existing ColumnVisibilityState and useColumnVisibility hook.

**Rationale**:
- Consistent with existing property column visibility pattern
- Reuses established infrastructure
- Persists to sessionStorage automatically
- User-friendly toggle in ColumnSettingsPopup

**Implementation**: Add `translationStatus` boolean to ColumnVisibilityState.

### 5.3 Translation Data Fetching Strategy
**Decision**: Parent component fetches translation data, passes to ItemGrid.

**Rationale**:
- ItemGrid remains presentational (separation of concerns)
- Parent controls data fetching lifecycle
- Allows batch fetching for performance
- Easier to optimize (fetch only when column visible)

**Alternative Considered**: ItemGrid fetches its own data
- Rejected: Violates single responsibility principle
- Harder to test: Component has data fetching logic
- Performance issues: Individual fetches per render

**Implementation**: Parent uses useTranslationStatus or batch API call.

### 5.4 Missing Translation Data Handling
**Decision**: Hide indicator when translation data is missing (no error state).

**Rationale**:
- Graceful degradation
- No visual clutter for items without translation data
- Simpler user experience
- Conditional rendering prevents component errors

**Implementation**: `translationStatuses?.[item.id]` check before rendering.

### 5.5 Translation Status Indicator Size
**Decision**: Use `size="sm"` variant for compact display.

**Rationale**:
- Grid view is compact; small indicator fits better
- Matches grid density and card size
- Doesn't dominate the visual hierarchy
- Tooltip provides detailed info on hover

**Implementation**: Pass `size="sm"` prop to TranslationStatusColumn.

### 5.6 LanguageTranslationSummary Type Source
**Decision**: Import from TranslationManagement.types if available; otherwise define locally.

**Rationale**:
- Prefer shared types from central location
- Fallback to local definition if not yet available
- Allows phased implementation (types can be moved later)
- Documents type shape clearly in code

**Implementation**: Try import first, document fallback in code comment.

---

## 6. Risks and Mitigations

### Risk 1: TranslationStatusColumn Component Not Ready
**Risk**: REQ-E05-014 is not completed, component doesn't exist.

**Impact**: High - Cannot integrate non-existent component

**Mitigation**:
- Verify REQ-E05-014 completion before starting this task
- Check that component exports correctly
- Test component in isolation first
- Document dependency clearly

**Likelihood**: Low (dependencies are explicit)

### Risk 2: LanguageTranslationSummary Type Not Defined
**Risk**: Type doesn't exist in TranslationManagement.types (REQ-E05-006).

**Impact**: Medium - TypeScript errors, need local definition

**Mitigation**:
- Define type locally in ItemManager.types.ts as fallback
- Document intention to move to shared types later
- Ensure type shape matches TranslationStatusColumn expectations
- Add TODO comment for future refactor

**Likelihood**: Medium (depends on REQ-E05-006 implementation)

### Risk 3: Performance Impact with Large Item Lists
**Risk**: Fetching translation status for 100+ items slows down UI.

**Impact**: Medium - Poor user experience, slow page load

**Mitigation**:
- Only fetch when column is visible (conditional logic)
- Implement batch API endpoint for multiple items
- Add loading state while fetching
- Consider pagination or virtualization for very large lists
- Cache translation data to avoid refetching

**Likelihood**: Medium (depends on item count and API performance)

### Risk 4: Layout Breakage on Small Screens
**Risk**: Translation indicator breaks grid layout on mobile.

**Impact**: Medium - Mobile UX issue

**Mitigation**:
- Use TranslationStatusColumn's responsive design (sm size)
- Test on all breakpoints during development
- Ensure indicator doesn't exceed card width
- Verify grid gap maintained
- Use flex-centered container for indicator

**Likelihood**: Low (TranslationStatusColumn is responsive)

### Risk 5: Click Event Conflicts
**Risk**: Clicking indicator also triggers ItemCard click.

**Impact**: Low - Unexpected navigation or preview open

**Mitigation**:
- Indicator is outside ItemCard (separate div)
- No event propagation issues
- TranslationStatusColumn handles its own click events
- Test thoroughly to ensure no conflicts

**Likelihood**: Very Low (architectural decision prevents this)

### Risk 6: ColumnSettingsPopup Component Missing
**Risk**: Column visibility UI component doesn't exist or has different structure.

**Impact**: Medium - User can't toggle column visibility

**Mitigation**:
- Locate actual column visibility UI component
- If doesn't exist, create minimal toggle UI
- Could use checkbox in toolbar as fallback
- Document actual implementation location

**Likelihood**: Low (REQ-218 established column visibility)

---

## 7. Out of Scope

### 7.1 Inline Translation Editing
- Not adding ability to edit translations directly from ItemGrid
- Rationale: Translation editing happens in TranslationPreviewPanel
- Use Case: Click indicator to open panel for editing

### 7.2 Translation Status Sorting/Filtering
- Not adding ability to sort or filter items by translation status
- Rationale: Separate feature, requires ItemManager filter system update
- Future Enhancement: Add to FilterPanel in separate task

### 7.3 Bulk Translation Actions from Grid
- Not adding bulk translation operations from item selection
- Rationale: Bulk operations are separate feature (REQ-E05-018 or similar)
- Use Case: Bulk actions handled by separate BulkTranslationBar component

### 7.4 Translation Progress Bar in Grid
- Not using TranslationProgressBar in grid (only TranslationStatusColumn dots)
- Rationale: Progress bar is too large for grid view
- Use Case: Progress bar is for dashboard widget and detail views

### 7.5 Translation Status in List View
- Only implementing for ItemGrid (grid view), not ItemList (list view)
- Rationale: Spec focuses on grid view integration
- Future Enhancement: ItemList could add similar column

### 7.6 Real-time Translation Status Updates
- No websocket or polling for live translation status updates
- Rationale: Status updates on page load or manual refresh
- Future Enhancement: Could integrate useTranslationRealtime hook

### 7.7 Translation Status for Other Entity Types
- Only implementing for items, not articles, links, or tags
- Rationale: Spec is specific to ItemGrid component
- Future Enhancement: Pattern can be replicated for other entity grids

### 7.8 Custom Translation Status Colors
- Using predefined status colors, no user customization
- Rationale: Consistent color language across app
- Out of Scope: User preference system for colors

---

## 8. Testing Considerations

### Manual Testing (Required):
- ItemGrid renders without errors
- Translation status indicators appear when column is visible
- Indicators hidden when column is invisible
- Correct number of dots (6) per indicator
- Dots are color-coded correctly for each status
- Clicking indicator opens TranslationPreviewPanel with correct item
- Missing translation data handled gracefully (no errors)
- Column visibility toggle works correctly
- Column visibility persists to sessionStorage
- Responsive layout maintained at all breakpoints
- Indicators centered below each ItemCard
- Tooltip appears on hover with language details
- Keyboard navigation works (Tab, Enter)
- Screen reader announces indicators correctly
- i18n works for column label in settings
- Existing ItemGrid functionality not affected
- Performance acceptable with 50+ items

### Integration Testing (Future):
- ItemManager renders ItemGrid with translation status props
- Translation data fetches when column enabled
- Click handler opens preview panel correctly
- Column settings update visibility state
- Translation status integrates with item selection
- No TypeScript compilation errors

### Unit Tests (Future):
- ItemGrid renders with showTranslationStatus=true
- ItemGrid renders indicators only when data exists
- ItemGrid calls onTranslationStatusClick when indicator clicked
- ItemGrid handles missing translationStatuses prop
- useColumnVisibility hook includes translationStatus in state

---

## 9. Estimated Effort

**Total Effort**: 4-6 hours

**Breakdown**:
- Type definitions and interfaces: 0.5 hours
- useColumnVisibility hook updates: 0.25 hours
- ItemGrid component updates: 1.5 hours
- Parent component integration: 2 hours
- Translation data fetching logic: 1 hour
- ColumnSettingsPopup updates: 0.25 hours
- Translation keys addition: 0.25 hours
- Testing and refinement: 1.5-2 hours

**Complexity**: Medium
- Multiple file modifications required
- Integration with existing column visibility system
- Parent component data fetching logic
- Click handler for preview panel
- Responsive layout considerations
- Most complexity in parent component integration

**Assumptions**:
- TranslationStatusColumn component is complete (REQ-E05-014)
- TranslationPreviewPanel component is complete (REQ-E05-007)
- LanguageTranslationSummary type is available
- ColumnSettingsPopup component exists and is accessible

---

## 10. Success Criteria

This task is complete when:

1. ✅ ColumnVisibilityState includes translationStatus boolean
2. ✅ useColumnVisibility hook includes translationStatus in default state
3. ✅ ItemGridProps includes showTranslationStatus, onTranslationStatusClick, translationStatuses props
4. ✅ LanguageTranslationSummary type is imported or defined
5. ✅ ItemGrid imports TranslationStatusColumn component
6. ✅ ItemGrid renders translation status indicator when enabled
7. ✅ Indicator shows 6 dots for supported languages
8. ✅ Dots are color-coded by translation status
9. ✅ Clicking indicator calls onTranslationStatusClick with item
10. ✅ Indicator positioned below ItemCard with proper spacing
11. ✅ Missing translation data handled gracefully (indicator hidden)
12. ✅ Parent component fetches translation data
13. ✅ Parent component implements click handler
14. ✅ TranslationPreviewPanel opens on indicator click
15. ✅ ColumnSettingsPopup includes translation status option
16. ✅ Column visibility toggle works correctly
17. ✅ Translation keys added for column label
18. ✅ Responsive layout maintained at all breakpoints
19. ✅ No TypeScript compilation errors
20. ✅ No console errors or warnings
21. ✅ Existing ItemGrid functionality not affected

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Source Request**: `/docs/gen_requests_epic5.md` (Request #17, lines 2352-2547)
- **REQ-E05-014**: TranslationStatusColumn component (dependency)
- **REQ-E05-007**: TranslationPreviewPanel component (dependency)
- **REQ-E05-006**: TranslationManagement types file (dependency)
- **REQ-E05-011**: useTranslationStatus hook (data fetching pattern)
- **REQ-218**: Column visibility system (existing pattern)
- **ItemGrid Component**: `/src/components/ItemManager/components/ItemGrid.tsx`
- **ItemManager Types**: `/src/components/ItemManager/ItemManager.types.ts`
- **useColumnVisibility Hook**: `/src/components/ItemManager/hooks/useColumnVisibility.ts`

---

## 12. Notes

- This task integrates translation status visibility into the existing ItemGrid component without modifying the ItemCard component itself
- The indicator placement (below card) avoids complex modifications to ItemCard layout and event handling
- Column visibility system (from REQ-218) provides established infrastructure for toggling the feature
- Parent component (ItemManager) handles data fetching and state management, keeping ItemGrid presentational
- Performance optimization: Translation data only fetched when column is visible
- The integration pattern established here can be replicated for other entity types (articles, links) in future tasks
- Consider adding translation status to ItemList (list view) in a future enhancement
- The feature is opt-in via column visibility toggle, ensuring users who don't need it aren't affected

---

**Document Status**: Ready for Implementation
**Next Step**: Verify REQ-E05-014, REQ-E05-007, and REQ-E05-006 are complete, then begin with Step 1 (type definitions)
