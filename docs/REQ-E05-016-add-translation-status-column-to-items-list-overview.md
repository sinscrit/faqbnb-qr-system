# Implementation Overview: REQ-E05-016 - Add Translation Status Column to Items List

**Document Created:** 2026-01-20 20:15 UTC
**Last Modified:** 2026-01-20 20:15 UTC
**Request ID:** REQ-E05-016 (corresponds to gen_requests_epic5.md #17: REQ-E05-017)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.5

---

## Request Summary

**Title:** Items List Translation Status Column Integration

**Type:** ENHANCEMENT

**Size:** M (Medium)

**Description:** Property owners need a translation status indicator column integrated into their Items list view that displays each item's multilingual coverage and provides quick access to translation management for individual items.

---

## Background & Context

### Current State

The ItemManager component renders items in two view modes:
- **Grid View:** Uses `ItemGrid.tsx` which renders `ItemCard` components in a responsive grid
- **List View:** Uses `ItemList.tsx` which renders `ItemRow` components with columns for Title, Location, Guides, Tags, Property, Created, Views, and Reactions

The current ItemRow component (`/src/components/ItemManager/components/ItemRow.tsx`) displays comprehensive metadata but provides no visibility into translation status. Property owners must navigate to separate translation pages to understand which items have complete multilingual coverage.

The ItemGrid component (`/src/components/ItemManager/components/ItemGrid.tsx`) renders cards without translation status information.

### Target State

The Items list includes an optional translation status column:
- **List View:** `ItemList.tsx` adds a new column with `TranslationStatusColumn` component for each row
- **Grid View:** `ItemGrid.tsx` optionally integrates a compact translation indicator on cards
- The column displays a six-dot status indicator showing translation state for all six supported languages
- Clicking the indicator opens the `TranslationPreviewPanel` for detailed review and actions
- Column visibility is optional and can be controlled via column settings
- Supports efficient bulk data fetching to avoid N+1 API calls

### Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Foundation | Translation tables, language types | Required | Database schema exists |
| Epic 3 - Dynamic Content Translation | Translation trigger system, status tracking | Required | Provides translation data |
| REQ-E05-006 | TranslationManagement.types.ts | Required | Shared type definitions |
| REQ-E05-007 | TranslationPreviewPanel component | Required | Opens on column click |
| REQ-E05-014 | TranslationStatusColumn component | Required | Column indicator to integrate |
| REQ-E05-010 | useTranslationStatus hook | Required | Batch status fetching |
| REQ-E05-011 | useTranslationRealtime hook | Required | Real-time status updates |

---

## Technical Analysis

### Existing ItemList Structure

**Reference:** `/src/components/ItemManager/components/ItemList.tsx:1-227`

Current column structure in the header row:
```tsx
<div role="row" className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
  {isSelectionMode && <div role="columnheader" className="w-8 flex-shrink-0" />}
  <div role="columnheader" className="w-12 flex-shrink-0" />  {/* Thumbnail */}
  <SortableColumnHeader label="Title" ... className="flex-1 min-w-[120px]" />
  <SortableColumnHeader label="Location" ... className="w-24 flex-shrink-0" />
  <SortableColumnHeader label="Guides" ... className="w-20 flex-shrink-0" />
  <div role="columnheader" className="hidden lg:block w-40 flex-shrink-0">Tags</div>
  {columnVisibility?.property && <div className="hidden lg:block w-32">Property</div>}
  <SortableColumnHeader label="Created" ... className="w-28 flex-shrink-0" />
  <div role="columnheader" className="hidden lg:block w-20 flex-shrink-0">Views</div>
  <div role="columnheader" className="hidden xl:block w-24 flex-shrink-0">Reactions</div>
  <div role="columnheader" className="w-10 flex-shrink-0">Actions</div>
</div>
```

### Existing ItemRow Structure

**Reference:** `/src/components/ItemManager/components/ItemRow.tsx:1-595`

ItemRow renders columns matching header structure with responsive visibility:
- Selection checkbox (conditional on selection mode)
- Thumbnail area (w-12 h-12)
- Title/description section (flex-1)
- Location column (hidden md:flex w-24)
- Instructions/Guides count column (hidden md:flex w-20)
- Tags column (hidden lg:flex w-40)
- Property column (hidden lg:flex w-32, conditional)
- Created date column (hidden md:flex w-28)
- Views column (hidden lg:flex w-20)
- Reactions column (hidden xl:flex w-24)
- Kebab menu (sticky right-0)

### Existing ItemGrid Structure

**Reference:** `/src/components/ItemManager/components/ItemGrid.tsx:1-62`

ItemGrid renders a responsive grid of ItemCard components:
```tsx
<div className={cn(
  "grid gap-4 sm:gap-5 lg:gap-6",
  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
)}>
  {items.map((item) => (
    <ItemCard item={item} ... />
  ))}
</div>
```

### ItemManager Types

**Reference:** `/src/components/ItemManager/ItemManager.types.ts`

Key existing types to extend:
- `ItemListProps` - Props for ItemList component
- `ItemRowProps` - Props for individual rows
- `ItemGridProps` - Props for grid view
- `ItemCardProps` - Props for card component
- `ColumnVisibilityState` - Controls column visibility

### Translation Status Types

**Reference:** `/src/lib/translation-service/translation-service.types.ts`

Relevant types:
- `SupportedLanguage`: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `TranslationStatus`: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
- `SUPPORTED_LANGUAGES`: Array of 6 languages with metadata

### Integration Points

#### 1. Column Placement

The translation status column should be placed **before the Created column** for logical grouping with content metadata:

```
| Thumbnail | Title | Location | Guides | Tags | Property | Translations | Created | Views | Reactions | Actions |
```

#### 2. Responsive Breakpoint

Use `hidden lg:flex` to match the Tags and Property columns pattern - showing on large screens and above.

#### 3. Column Width

Use `w-24` (96px) to comfortably fit 6 dots (8-10px each) plus spacing (2-4px gaps).

---

## Implementation Details

### Task 1: Extend TypeScript Types

**File:** `/src/components/ItemManager/ItemManager.types.ts`

Add translation status to the extended item type and column visibility:

```typescript
// Add to ColumnVisibilityState interface
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
  /** Whether the Translation Status column is visible */
  translationStatus?: boolean;
}

// Add to ItemRecordExtended interface
export interface ItemRecordExtended extends ItemRecord {
  // ... existing fields ...

  /**
   * Translation status for each language.
   * Populated from batch status API query.
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  translationStatuses?: Partial<Record<SupportedLanguage, TranslationStatus>>;
}

// Add to ItemRowProps interface
export interface ItemRowProps {
  // ... existing fields ...

  /**
   * Translation status for each language.
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  translationStatuses?: Partial<Record<SupportedLanguage, TranslationStatus>>;

  /**
   * Whether the Translation Status column is visible.
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  showTranslationColumn?: boolean;

  /**
   * Callback when translation status indicator is clicked.
   * Opens the TranslationPreviewPanel for this item.
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  onTranslationClick?: (item: ItemRecord) => void;
}

// Add to ItemListProps interface
export interface ItemListProps {
  // ... existing fields ...

  /**
   * Translation statuses map for all items (itemId -> statuses).
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  itemTranslationStatuses?: Record<string, Partial<Record<SupportedLanguage, TranslationStatus>>>;

  /**
   * Callback when translation status indicator is clicked.
   * @lastModified 2026-01-20 (REQ-E05-016)
   */
  onTranslationClick?: (item: ItemRecord) => void;
}
```

### Task 2: Update ItemList Component

**File:** `/src/components/ItemManager/components/ItemList.tsx`

Add translation status column header and pass props to ItemRow:

```tsx
// Add to imports
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// Update component signature to include new props
export function ItemList({
  // ... existing props ...
  itemTranslationStatuses,
  onTranslationClick,
}: ItemListProps) {

// Add column header after Property column, before Created:
{columnVisibility?.translationStatus && (
  <div role="columnheader" className="hidden lg:flex w-24 flex-shrink-0 items-center gap-1">
    <span>Translations</span>
  </div>
)}

// Pass translation data to each ItemRow:
<ItemRow
  key={item.id}
  item={item}
  // ... existing props ...
  translationStatuses={itemTranslationStatuses?.[item.id]}
  showTranslationColumn={columnVisibility?.translationStatus}
  onTranslationClick={onTranslationClick}
/>
```

### Task 3: Update ItemRow Component

**File:** `/src/components/ItemManager/components/ItemRow.tsx`

Add translation status column in the row layout:

```tsx
// Add to imports
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// Add new props
export function ItemRow({
  // ... existing props ...
  translationStatuses,
  showTranslationColumn,
  onTranslationClick,
}: ItemRowProps) {

// Add translation status column after Property column, before Created date:
{/* Translation Status Column (REQ-E05-016) */}
{showTranslationColumn && (
  <div className="hidden lg:flex w-24 items-center justify-center">
    <TranslationStatusColumn
      entityType="item"
      entityId={item.id}
      translationStatuses={translationStatuses || {}}
      onClick={(type, id) => onTranslationClick?.(item)}
      loading={!translationStatuses}
      size="small"
    />
  </div>
)}
```

### Task 4: Update ColumnSettingsPopup

**File:** `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`

Add translation column toggle option:

```tsx
// Add translation toggle checkbox
<label className="flex items-center gap-2 text-sm cursor-pointer">
  <input
    type="checkbox"
    checked={columnVisibility.translationStatus ?? false}
    onChange={() => onToggleColumn('translationStatus')}
    className="w-4 h-4 rounded border-gray-300 text-blue-600"
  />
  <span>Translation Status</span>
</label>
```

### Task 5: Integrate TranslationPreviewPanel in ItemManager

**File:** `/src/components/ItemManager/ItemManager.tsx`

Add state and handlers for the translation preview panel:

```tsx
// Add to imports
import { TranslationPreviewPanel, TranslationStatusColumn } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

// Add state for preview panel
const [translationPreviewItem, setTranslationPreviewItem] = useState<ItemRecord | null>(null);

// Add translation status hook for bulk fetching
const itemIds = items.map(item => item.id);
const { data: translationStatuses, loading: translationStatusLoading } = useTranslationStatus({
  entityType: 'item',
  entityIds: itemIds,
  enabled: items.length > 0 && columnVisibility?.translationStatus,
});

// Add handler for translation column click
const handleTranslationClick = useCallback((item: ItemRecord) => {
  setTranslationPreviewItem(item);
}, []);

// Pass to ItemList/ItemGrid
<ItemList
  // ... existing props ...
  itemTranslationStatuses={translationStatuses}
  onTranslationClick={handleTranslationClick}
/>

// Render TranslationPreviewPanel
{translationPreviewItem && (
  <TranslationPreviewPanel
    entityType="item"
    entityId={translationPreviewItem.id}
    sourceLanguage={translationPreviewItem.sourceLanguage || 'en'}
    sourceContent={{
      title: translationPreviewItem.title,
      name: translationPreviewItem.title,
      description: translationPreviewItem.instructions,
    }}
    isOpen={!!translationPreviewItem}
    onClose={() => setTranslationPreviewItem(null)}
  />
)}
```

### Task 6: Optional Grid View Integration

**File:** `/src/components/ItemManager/components/ItemCard.tsx`

Optionally add a compact translation indicator to cards:

```tsx
// Add to imports (if implementing)
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// Add to card content section, after tags
{translationStatuses && (
  <div
    className="flex items-center gap-1 mt-2 cursor-pointer"
    onClick={(e) => {
      e.stopPropagation();
      onTranslationClick?.(item);
    }}
  >
    <TranslationStatusColumn
      entityType="item"
      entityId={item.id}
      translationStatuses={translationStatuses}
      size="small"
    />
  </div>
)}
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Function/Section | Change Description |
|-----------|------------------|-------------------|
| `/src/components/ItemManager/ItemManager.types.ts` | `ColumnVisibilityState` | Add `translationStatus` boolean field |
| `/src/components/ItemManager/ItemManager.types.ts` | `ItemRecordExtended` | Add `translationStatuses` field |
| `/src/components/ItemManager/ItemManager.types.ts` | `ItemRowProps` | Add `translationStatuses`, `showTranslationColumn`, `onTranslationClick` props |
| `/src/components/ItemManager/ItemManager.types.ts` | `ItemListProps` | Add `itemTranslationStatuses`, `onTranslationClick` props |
| `/src/components/ItemManager/components/ItemList.tsx` | Header row | Add translation column header |
| `/src/components/ItemManager/components/ItemList.tsx` | ItemRow mapping | Pass translation props to each row |
| `/src/components/ItemManager/components/ItemRow.tsx` | Component props | Accept new translation props |
| `/src/components/ItemManager/components/ItemRow.tsx` | Row layout | Add TranslationStatusColumn component |
| `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | Column toggles | Add translation column visibility toggle |
| `/src/components/ItemManager/ItemManager.tsx` | State declarations | Add `translationPreviewItem` state |
| `/src/components/ItemManager/ItemManager.tsx` | Hooks section | Add `useTranslationStatus` hook call |
| `/src/components/ItemManager/ItemManager.tsx` | Event handlers | Add `handleTranslationClick` handler |
| `/src/components/ItemManager/ItemManager.tsx` | Component render | Pass translation props and render TranslationPreviewPanel |

### Files for Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Column component implementation |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Preview panel implementation |
| `/src/hooks/useTranslationStatus.ts` | Translation status fetching hook |
| `/src/hooks/useTranslationRealtime.ts` | Realtime update subscription |
| `/src/lib/translation-service/translation-service.types.ts` | Translation type definitions |

### Prerequisite Components (Must Exist)

| Component | File Path | Status |
|-----------|-----------|--------|
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Required (REQ-E05-014) |
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Required (REQ-E05-007) |
| useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Required (REQ-E05-010) |
| useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Required (REQ-E05-011) |

---

## Acceptance Criteria Validation

| Criteria | Implementation | Status |
|----------|---------------|--------|
| Translation status column is added to ItemGrid component table structure | Task 2 - ItemList header and Task 3 - ItemRow column | Planned |
| Column displays TranslationStatusColumn component for each item row | Task 3 - TranslationStatusColumn integration in ItemRow | Planned |
| Column header is labeled "Translations" | Task 2 - Header column text | Planned |
| Status column displays six-dot indicator showing translation state | TranslationStatusColumn renders 6 dots per REQ-E05-014 | Planned |
| Each dot uses standard color coding | TranslationStatusColumn handles colors | Planned |
| Clicking the status indicator opens TranslationPreviewPanel | Task 5 - onClick handler and panel integration | Planned |
| Preview panel displays with entity reference | Task 5 - Pass entityType: 'item', entityId: item.id | Planned |
| Column can be toggled on/off through column visibility controls | Task 4 - ColumnSettingsPopup toggle | Planned |
| Column visibility preference persists across sessions | Existing ColumnVisibilityState persistence mechanism | Planned |
| Column width is fixed to prevent table layout fluctuations | `w-24` class (96px fixed width) | Planned |
| Column displays loading shimmer while status data is being fetched | TranslationStatusColumn `loading` prop with shimmer | Planned |
| Bulk status fetch retrieves translation status for all visible items | Task 5 - useTranslationStatus with multiple entityIds | Planned |
| Status indicators update in real-time when translation jobs complete | useTranslationRealtime hook integration | Planned |
| Column is responsive and adapts for tablet viewports | `hidden lg:flex` breakpoint | Planned |
| Column maintains consistent alignment with other table columns | Uses same flex/gap patterns as other columns | Planned |
| Keyboard navigation allows focusing and activating status indicators | TranslationStatusColumn handles keyboard events | Planned |
| Status column includes proper ARIA labels | TranslationStatusColumn provides aria-label | Planned |
| Component integration does not cause performance degradation | Batch fetching prevents N+1, memoization | Planned |
| Column works correctly with existing filters, search, and sorting | ItemList/ItemRow patterns preserved | Planned |
| Integration preserves existing ItemGrid functionality | No changes to existing patterns | Planned |

---

## Data Flow

### Translation Status Fetching

```
ItemManager (parent)
    │
    ├── useTranslationStatus(entityType: 'item', entityIds: [...])
    │   └── GET /api/translations/status?entityType=item&entityIds=...
    │
    ├── useTranslationRealtime(entityType: 'item', propertyId)
    │   └── Supabase channel subscription for translation updates
    │
    └── ItemList
        └── ItemRow (for each item)
            └── TranslationStatusColumn
                └── Renders 6 dots with status colors
                └── onClick → setTranslationPreviewItem(item)

TranslationPreviewPanel
    │
    ├── Shows source content
    ├── Lists all 6 languages with status
    ├── Action buttons: Edit, Re-translate, Retry
    └── onClose → setTranslationPreviewItem(null)
```

### Real-time Updates

```
Supabase Realtime Channel
    │
    └── translation table INSERT/UPDATE event
        │
        └── useTranslationRealtime callback
            │
            └── Updates translationStatuses state
                │
                └── ItemRow re-renders
                    │
                    └── TranslationStatusColumn shows updated dot colors
```

---

## Performance Considerations

### 1. Batch Data Fetching

**Problem:** N+1 queries if each row fetches its own translation status.

**Solution:** Fetch all visible items' translation statuses in a single API call:

```typescript
// In ItemManager
const itemIds = items.map(item => item.id);
const { data: translationStatuses } = useTranslationStatus({
  entityType: 'item',
  entityIds: itemIds, // Batch query
  enabled: items.length > 0 && columnVisibility?.translationStatus,
});
```

### 2. Conditional Fetching

Only fetch translation data when the column is visible:

```typescript
enabled: items.length > 0 && columnVisibility?.translationStatus,
```

### 3. Memoization

Memoize the translation statuses map to prevent unnecessary re-renders:

```typescript
const itemTranslationStatusesMap = useMemo(() => {
  if (!translationStatuses) return {};
  return translationStatuses.reduce((acc, status) => {
    acc[status.entityId] = status.translations;
    return acc;
  }, {});
}, [translationStatuses]);
```

### 4. Virtualization

For very large item lists (100+ items), consider:
- Lazy loading translation data as rows scroll into view
- Virtual list rendering to limit DOM nodes

---

## Edge Cases & Error Handling

### Edge Case 1: No Translation Data Yet

**Condition:** Item has no translations (new item, translations not yet triggered)

**Behavior:** TranslationStatusColumn shows 6 gray dots (not started state)

### Edge Case 2: Partial Translations

**Condition:** Some languages translated, others pending/failed

**Behavior:** Mixed dot colors reflecting actual status of each language

### Edge Case 3: Column Hidden by Default

**Condition:** User has never enabled translation column

**Behavior:** `translationStatus` not in `columnVisibility`, column not rendered, no status API call made

### Edge Case 4: Translation API Unavailable

**Condition:** Status API returns error

**Behavior:** Show loading shimmer initially, then column hides or shows error indicator

### Edge Case 5: Real-time Disconnection

**Condition:** Supabase realtime connection lost

**Behavior:** Column shows last known status, manual refresh available

### Edge Case 6: Large Item Count

**Condition:** 100+ items displayed

**Behavior:** Batch API call with pagination, progressive loading indicators

---

## Testing Considerations

### Unit Tests

1. **ItemList renders translation column header when visibility enabled**
2. **ItemRow renders TranslationStatusColumn when showTranslationColumn is true**
3. **ItemRow does not render column when showTranslationColumn is false**
4. **Click on TranslationStatusColumn triggers onTranslationClick callback**
5. **Translation status data passed correctly from ItemList to ItemRow**

### Integration Tests

1. **Column toggle in ColumnSettingsPopup enables/disables translation column**
2. **Clicking status indicator opens TranslationPreviewPanel**
3. **Panel closes when clicking close button**
4. **Real-time updates reflect in column indicators**

### Performance Tests

1. **Batch API call for 50 items completes in < 500ms**
2. **No layout shift when column toggles visibility**
3. **Re-render performance acceptable with 100 items**

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Extend TypeScript types | 0.5 hours |
| Task 2: Update ItemList component | 0.5 hours |
| Task 3: Update ItemRow component | 0.5 hours |
| Task 4: Update ColumnSettingsPopup | 0.25 hours |
| Task 5: Integrate in ItemManager | 1.0 hours |
| Task 6: Optional grid view integration | 0.5 hours |
| Testing and verification | 1.0 hours |
| **Total** | **4.25 hours** |

---

## Notes

1. **Component Prerequisites:** This integration task assumes REQ-E05-014 (TranslationStatusColumn), REQ-E05-007 (TranslationPreviewPanel), and REQ-E05-010 (useTranslationStatus) are already implemented. If not complete, stub implementations with mock data can be used.

2. **Grid View Optional:** The grid view (ItemCard) integration is optional and can be deferred to a follow-up task. The primary focus is list view integration as specified in the requirements.

3. **Default Visibility:** Consider whether the translation column should be visible by default or require user opt-in via column settings. Recommendation: Hidden by default, opt-in via ColumnSettingsPopup.

4. **Sorting:** The acceptance criteria mention optional sorting by translation completeness. This can be a future enhancement - sorting by "percentage complete" would require server-side support or client-side calculation.

5. **ItemManager Version:** This implementation targets the `/src/components/ItemManager/` component used in the dashboard. The ItemGrid component is relatively simple and primarily used for grid view rendering.

---

## References

- **Request:** REQ-E05-017 in `/docs/gen_requests_epic5.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 3.5)
- **TranslationStatusColumn:** `/docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md`
- **TranslationPreviewPanel:** `/docs/REQ-E05-006-create-translationpreviewpanel-component-overview.md`
- **ItemManager Types:** `/src/components/ItemManager/ItemManager.types.ts`
- **ItemList Component:** `/src/components/ItemManager/components/ItemList.tsx`
- **ItemRow Component:** `/src/components/ItemManager/components/ItemRow.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
