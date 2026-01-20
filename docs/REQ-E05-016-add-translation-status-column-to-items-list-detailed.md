# Detailed Task Breakdown: REQ-E05-016 - Add Translation Status Column to Items List

**Document Created:** 2026-01-20 21:30 UTC
**Last Modified:** 2026-01-20 21:30 UTC
**Request ID:** REQ-E05-016 (corresponds to gen_requests_epic5.md #17: REQ-E05-017)
**Overview Document:** REQ-E05-016-add-translation-status-column-to-items-list-overview.md
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.5

---

## Task Summary

| Attribute | Value |
|-----------|-------|
| **Title** | Add Translation Status Column to Items List |
| **Type** | ENHANCEMENT |
| **Size** | M (Medium) |
| **Story Points** | 5 |
| **Estimated Effort** | 4-5 hours |
| **Risk Level** | Low |

**Objective:** Integrate a translation status indicator column into the ItemManager's list view, allowing property owners to see translation coverage for each item at a glance and quickly access the TranslationPreviewPanel for detailed review.

---

## Prerequisites

### Required Components (Must Be Completed First)

| Dependency | Task ID | Component | Status | Notes |
|------------|---------|-----------|--------|-------|
| REQ-E05-006 | 2.1 | TranslationManagement.types.ts | Required | Shared type definitions |
| REQ-E05-007 | 2.2 | TranslationPreviewPanel | Required | Opens on column click |
| REQ-E05-014 | 3.2 | TranslationStatusColumn | Required | Column indicator component |
| REQ-E05-010 | 2.6 | useTranslationStatus hook | Required | Batch status fetching |
| REQ-E05-011 | 2.7 | useTranslationRealtime hook | Required | Real-time status updates |

### Required Database/API

- Translation tables from Epic 1 (items_translation, etc.)
- Translation status API endpoint (`GET /api/translations/status`) from REQ-E05-001

---

## Implementation Tasks

### Task 1: Extend TypeScript Type Definitions
**File:** `/src/components/ItemManager/ItemManager.types.ts`
**Effort:** 0.5 SP (30 minutes)

#### 1.1 Add translationStatus to ColumnVisibilityState

**Current code (lines 350-355):**
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
}
```

**Modified code:**
```typescript
export interface ColumnVisibilityState {
  /** Whether the Property column is visible */
  property: boolean;
  /** Whether the Translation Status column is visible (REQ-E05-016) */
  translationStatus?: boolean;
}
```

#### 1.2 Add translationStatuses to ItemRecordExtended

**Location:** After `articlesCount` field (around line 291)

**Add:**
```typescript
/**
 * Translation status for each language.
 * Populated from batch status API query.
 * @lastModified 2026-01-20 (REQ-E05-016)
 */
translationStatuses?: Partial<Record<SupportedLanguage, TranslationStatus>>;
```

**Required import at top of file:**
```typescript
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
```

#### 1.3 Add translation props to ItemRowProps

**Location:** After `showPropertyColumn` field (around line 611)

**Add:**
```typescript
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
```

#### 1.4 Add translation props to ItemListProps

**Location:** After `onToggleColumn` field (around line 691)

**Add:**
```typescript
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
```

#### 1.5 Update file lastModified comment

**Change file header comment:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translation status types)
```

---

### Task 2: Update ColumnSettingsPopup
**File:** `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
**Effort:** 0.25 SP (15 minutes)

#### 2.1 Add Translation Status to COLUMN_OPTIONS

**Current code (lines 41-43):**
```typescript
const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'property', label: 'Property' },
];
```

**Modified code:**
```typescript
const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'property', label: 'Property' },
  { key: 'translationStatus', label: 'Translations' },
];
```

#### 2.2 Update file lastModified comment

**Change:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translation status column option)
```

---

### Task 3: Update ItemList Component
**File:** `/src/components/ItemManager/components/ItemList.tsx`
**Effort:** 0.75 SP (45 minutes)

#### 3.1 Add translation props to component signature

**Current signature (lines 76-96):**
```typescript
export function ItemList({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  currentSort,
  onSortChange,
  properties,
  columnVisibility,
  onToggleColumn,
}: ItemListProps) {
```

**Modified signature:**
```typescript
export function ItemList({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  currentSort,
  onSortChange,
  properties,
  columnVisibility,
  onToggleColumn,
  // REQ-E05-016: Translation status column
  itemTranslationStatuses,
  onTranslationClick,
}: ItemListProps) {
```

#### 3.2 Add translation column header

**Location:** After Property column header (after line 169), before Created column header

**Add:**
```tsx
{/* Translation Status Column Header (REQ-E05-016) */}
{columnVisibility?.translationStatus && (
  <div
    role="columnheader"
    className="hidden lg:flex w-24 flex-shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500"
  >
    <span>Translations</span>
  </div>
)}
```

#### 3.3 Pass translation props to ItemRow

**Current ItemRow mapping (lines 200-219):**
```tsx
<ItemRow
  key={item.id}
  item={item}
  onPreviewClick={onItemPreview}
  onSelectionChange={onSelectionChange}
  isSelected={selectedIds.has(item.id)}
  isSelectionMode={isSelectionMode}
  onLongPressSelect={onLongPressSelect}
  onEdit={onEdit}
  onDelete={onDelete}
  onManageAssets={onManageAssets}
  onDuplicate={onDuplicate}
  enableInlineEdit={enableInlineEdit}
  onUpdateItem={onUpdateItem}
  existingTags={existingTags}
  articlesCount={(item as ItemRecordExtended).articlesCount}
  propertyName={getPropertyName((item as ItemRecordExtended).propertyId)}
  showPropertyColumn={columnVisibility?.property}
/>
```

**Modified ItemRow mapping:**
```tsx
<ItemRow
  key={item.id}
  item={item}
  onPreviewClick={onItemPreview}
  onSelectionChange={onSelectionChange}
  isSelected={selectedIds.has(item.id)}
  isSelectionMode={isSelectionMode}
  onLongPressSelect={onLongPressSelect}
  onEdit={onEdit}
  onDelete={onDelete}
  onManageAssets={onManageAssets}
  onDuplicate={onDuplicate}
  enableInlineEdit={enableInlineEdit}
  onUpdateItem={onUpdateItem}
  existingTags={existingTags}
  articlesCount={(item as ItemRecordExtended).articlesCount}
  propertyName={getPropertyName((item as ItemRecordExtended).propertyId)}
  showPropertyColumn={columnVisibility?.property}
  // REQ-E05-016: Translation status
  translationStatuses={itemTranslationStatuses?.[item.id]}
  showTranslationColumn={columnVisibility?.translationStatus}
  onTranslationClick={onTranslationClick}
/>
```

#### 3.4 Update file lastModified comment

**Change:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translation status column support)
```

---

### Task 4: Update ItemRow Component
**File:** `/src/components/ItemManager/components/ItemRow.tsx`
**Effort:** 0.75 SP (45 minutes)

#### 4.1 Add import for TranslationStatusColumn

**Add to imports section (after line 27):**
```typescript
import { TranslationStatusColumn } from '@/components/TranslationManagement';
```

#### 4.2 Add new props to component signature

**Current signature (lines 84-104):**
```typescript
export function ItemRow({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
  articlesCount,
  propertyName,
  showPropertyColumn,
}: ItemRowProps) {
```

**Modified signature:**
```typescript
export function ItemRow({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
  articlesCount,
  propertyName,
  showPropertyColumn,
  // REQ-E05-016: Translation status
  translationStatuses,
  showTranslationColumn,
  onTranslationClick,
}: ItemRowProps) {
```

#### 4.3 Add translation status column to row layout

**Location:** After Property column (after line 510), before Date column

**Add:**
```tsx
{/* Translation Status Column (REQ-E05-016) */}
{showTranslationColumn && (
  <div
    className="hidden lg:flex w-24 items-center justify-center flex-shrink-0"
    onClick={(e) => e.stopPropagation()}
  >
    <TranslationStatusColumn
      entityType="item"
      entityId={item.id}
      translationStatuses={translationStatuses || {}}
      onClick={() => onTranslationClick?.(item)}
      loading={!translationStatuses}
      size="small"
    />
  </div>
)}
```

#### 4.4 Update aria-label to include translation info

**Current aria-label (line 347):**
```typescript
const ariaLabel = `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${articlesCount !== undefined && articlesCount > 0 ? `${articlesCount} guides.` : 'No guides.'} Created ${formatDate(item.createdAt)}.${visitStats ? ` ${visitStats.allTime} views.` : ''}${reactions?.total ? ` ${reactions.total} reactions.` : ''}${isSelectionMode ? ` ${isSelected ? 'Selected.' : 'Not selected.'}` : ''}`;
```

**Modified aria-label:**
```typescript
const ariaLabel = `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${articlesCount !== undefined && articlesCount > 0 ? `${articlesCount} guides.` : 'No guides.'} Created ${formatDate(item.createdAt)}.${visitStats ? ` ${visitStats.allTime} views.` : ''}${reactions?.total ? ` ${reactions.total} reactions.` : ''}${translationStatuses ? ' Has translation status.' : ''}${isSelectionMode ? ` ${isSelected ? 'Selected.' : 'Not selected.'}` : ''}`;
```

#### 4.5 Update file lastModified comment

**Change:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translation status column)
```

---

### Task 5: Update useColumnVisibility Hook
**File:** `/src/components/ItemManager/hooks/useColumnVisibility.ts`
**Effort:** 0.25 SP (15 minutes)

#### 5.1 Verify hook handles new column

Check that the hook properly handles the new `translationStatus` column. If the hook uses a static default state, update it:

**If default state exists, modify to include:**
```typescript
const DEFAULT_COLUMN_VISIBILITY: ColumnVisibilityState = {
  property: false,
  translationStatus: false, // REQ-E05-016: Hidden by default, opt-in via settings
};
```

#### 5.2 Update file lastModified comment

**Change:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translationStatus column support)
```

---

### Task 6: Integrate in ItemManager Component
**File:** `/src/components/ItemManager/ItemManager.tsx`
**Effort:** 1.5 SP (90 minutes)

#### 6.1 Add imports

**Add to imports section (after existing imports, around line 30):**
```typescript
// REQ-E05-016: Translation status integration
import { TranslationPreviewPanel } from '@/components/TranslationManagement';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
```

#### 6.2 Add state for translation preview panel

**Add after bulk delete state (around line 198):**
```typescript
// -------------------------------------------------------------------------
// Translation Preview Panel State (REQ-E05-016)
// -------------------------------------------------------------------------

const [translationPreviewItem, setTranslationPreviewItem] = useState<ItemRecord | null>(null);
```

#### 6.3 Add useTranslationStatus hook call

**Add after useColumnVisibility hook (around line 155):**
```typescript
// -------------------------------------------------------------------------
// Translation Status Fetching (REQ-E05-016)
// -------------------------------------------------------------------------

const itemIds = useMemo(() => items.map(item => item.id), [items]);

const {
  data: translationStatusData,
  loading: translationStatusLoading,
} = useTranslationStatus({
  entityType: 'item',
  entityIds: itemIds,
  enabled: items.length > 0 && columnVisibility?.translationStatus === true,
});

// Transform translation status data into a map for efficient lookup
const itemTranslationStatuses = useMemo(() => {
  if (!translationStatusData) return {};
  return translationStatusData.reduce<Record<string, Partial<Record<SupportedLanguage, TranslationStatus>>>>((acc, status) => {
    acc[status.entityId] = status.translations;
    return acc;
  }, {});
}, [translationStatusData]);
```

#### 6.4 Add handler for translation column click

**Add after existing handlers (around line 250):**
```typescript
// -------------------------------------------------------------------------
// Translation Click Handler (REQ-E05-016)
// -------------------------------------------------------------------------

const handleTranslationClick = useCallback((item: ItemRecord) => {
  setTranslationPreviewItem(item);
}, []);

const handleTranslationPreviewClose = useCallback(() => {
  setTranslationPreviewItem(null);
}, []);
```

#### 6.5 Pass translation props to ItemList

**Find the ItemList component render (around line 400+) and add props:**
```tsx
<ItemList
  // ... existing props ...
  // REQ-E05-016: Translation status
  itemTranslationStatuses={itemTranslationStatuses}
  onTranslationClick={handleTranslationClick}
/>
```

#### 6.6 Render TranslationPreviewPanel

**Add before closing fragment/div of main render (near end of component):**
```tsx
{/* Translation Preview Panel (REQ-E05-016) */}
{translationPreviewItem && (
  <TranslationPreviewPanel
    entityType="item"
    entityId={translationPreviewItem.id}
    sourceLanguage={(translationPreviewItem as any).sourceLanguage || 'en'}
    sourceContent={{
      title: translationPreviewItem.title,
      name: translationPreviewItem.title,
      description: translationPreviewItem.instructions,
    }}
    isOpen={!!translationPreviewItem}
    onClose={handleTranslationPreviewClose}
  />
)}
```

#### 6.7 Update file lastModified comment

**Change:**
```typescript
* @lastModified 2026-01-20 (REQ-E05-016 - Added translation status column integration)
```

---

### Task 7: Create Barrel Export (If Not Exists)
**File:** `/src/components/TranslationManagement/index.ts`
**Effort:** 0.25 SP (15 minutes)

#### 7.1 Ensure TranslationStatusColumn is exported

**Verify the barrel export includes:**
```typescript
// TranslationStatusColumn (REQ-E05-014)
export { TranslationStatusColumn } from './TranslationStatusColumn';
export type { TranslationStatusColumnProps } from './TranslationStatusColumn';

// TranslationPreviewPanel (REQ-E05-007)
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';
```

---

## Verification Checklist

### Functional Testing

- [ ] **Column Header Visibility**
  - [ ] Translation column header appears when `translationStatus` is enabled in column settings
  - [ ] Column header shows "Translations" label
  - [ ] Column header is hidden on md and below breakpoints (`hidden lg:flex`)

- [ ] **Column Toggle**
  - [ ] ColumnSettingsPopup shows "Translations" option
  - [ ] Clicking toggle enables/disables column visibility
  - [ ] Column visibility persists in component state

- [ ] **Status Indicator Display**
  - [ ] TranslationStatusColumn renders for each item row
  - [ ] Six dots appear for six supported languages
  - [ ] Dots show correct colors based on status (green, orange, red, purple, gray)
  - [ ] Loading shimmer shows while translation data is being fetched

- [ ] **Translation Preview Panel**
  - [ ] Clicking status indicator opens TranslationPreviewPanel
  - [ ] Panel shows correct item data (title, description)
  - [ ] Panel close button works correctly
  - [ ] Clicking outside panel (overlay) closes panel

- [ ] **Data Fetching**
  - [ ] useTranslationStatus hook is only called when column is visible
  - [ ] Batch API call fetches status for all visible items
  - [ ] No N+1 query issues (single batch request)

### Responsive Testing

- [ ] Column hidden on medium (md) and smaller screens
- [ ] Column visible on large (lg) and larger screens
- [ ] Column maintains 96px (w-24) fixed width
- [ ] No horizontal overflow issues when column is visible

### Accessibility Testing

- [ ] Status indicators have proper ARIA labels
- [ ] Keyboard navigation allows focusing status indicators
- [ ] Enter/Space key opens preview panel when indicator is focused
- [ ] Screen reader announces translation status information

### Integration Testing

- [ ] Column works with existing filters (search, tags, location)
- [ ] Column works with sorting options
- [ ] Column works with selection mode (bulk actions)
- [ ] Column works in multi-property mode
- [ ] Existing ItemManager functionality not affected

### Performance Testing

- [ ] Page load time not significantly impacted
- [ ] Scrolling performance acceptable with 50+ items
- [ ] No layout shift when toggling column visibility
- [ ] Translation status API responds within 2 seconds

---

## Edge Cases

### Edge Case 1: No Translation Data Yet
**Condition:** Item has no translations (new item, translations not yet triggered)
**Expected Behavior:** TranslationStatusColumn shows 6 gray dots (not started state)
**Test:** Create new item, view in list with translation column enabled

### Edge Case 2: Partial Translations
**Condition:** Some languages translated, others pending/failed
**Expected Behavior:** Mixed dot colors reflecting actual status of each language
**Test:** Trigger translation for item, then view status during and after processing

### Edge Case 3: Column Hidden by Default
**Condition:** User has never enabled translation column
**Expected Behavior:** Column not rendered, no translation status API call made
**Test:** Fresh user session, verify no translation API calls until column enabled

### Edge Case 4: Translation API Unavailable
**Condition:** Status API returns error
**Expected Behavior:** Show loading state initially, then error indicator or hide column
**Test:** Mock API error, verify graceful degradation

### Edge Case 5: Large Item Count
**Condition:** 100+ items displayed
**Expected Behavior:** Batch API call completes within acceptable time, progressive loading
**Test:** Load page with 100+ items, measure API response time

### Edge Case 6: Real-time Update During View
**Condition:** Translation job completes while user viewing list
**Expected Behavior:** Status indicator updates automatically (via useTranslationRealtime)
**Test:** Trigger translation, observe real-time update without page refresh

---

## Rollback Plan

If issues are discovered after deployment:

1. **Quick Disable:** Set `translationStatus: false` as hardcoded default in `useColumnVisibility` hook
2. **Feature Flag:** Add environment variable `NEXT_PUBLIC_ENABLE_TRANSLATION_COLUMN=false`
3. **Full Rollback:** Revert commits for this task (all 6 tasks are self-contained)

---

## Dependencies Graph

```
Task 1 (Types) ─────┬───▶ Task 2 (ColumnSettingsPopup)
                    │
                    ├───▶ Task 3 (ItemList)
                    │         │
                    │         ▼
                    └───▶ Task 4 (ItemRow)
                              │
                              ▼
Task 5 (useColumnVisibility) ─┴───▶ Task 6 (ItemManager)
                                          │
                                          ▼
                              Task 7 (Barrel Export)
```

**Recommended Order:** 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## Files Summary

### Files to Create
None (all modifications to existing files)

### Files to Modify

| File | Change Summary |
|------|----------------|
| `/src/components/ItemManager/ItemManager.types.ts` | Add `translationStatus` to `ColumnVisibilityState`, translation props to `ItemRowProps` and `ItemListProps` |
| `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | Add "Translations" option to `COLUMN_OPTIONS` |
| `/src/components/ItemManager/components/ItemList.tsx` | Add translation column header and pass props to ItemRow |
| `/src/components/ItemManager/components/ItemRow.tsx` | Add TranslationStatusColumn component in row layout |
| `/src/components/ItemManager/hooks/useColumnVisibility.ts` | Update default state to include `translationStatus` |
| `/src/components/ItemManager/ItemManager.tsx` | Add state, hook, handler, and render TranslationPreviewPanel |
| `/src/components/TranslationManagement/index.ts` | Verify exports (if needed) |

### Files for Reference (Read-Only)

| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Column component implementation |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Preview panel implementation |
| `/src/hooks/useTranslationStatus.ts` | Translation status fetching hook |
| `/src/lib/translation-service/translation-service.types.ts` | Translation type definitions |

---

## Notes

1. **Component Prerequisites:** This task depends on REQ-E05-014 (TranslationStatusColumn) and REQ-E05-007 (TranslationPreviewPanel). If not complete, implementation can proceed with stub/mock components.

2. **Default Visibility:** Translation column is hidden by default (opt-in via ColumnSettingsPopup). This prevents UI disruption for users not yet using translation features.

3. **Grid View:** This task focuses on list view integration as specified. Grid view (ItemCard) integration is optional and can be addressed in a future task.

4. **Sorting:** Column sorting by translation completeness mentioned in acceptance criteria is deferred to future enhancement - requires server-side calculation support.

5. **Testing:** Unit tests should mock the `useTranslationStatus` hook and `TranslationStatusColumn` component to isolate ItemList/ItemRow testing.

---

## References

- **Request:** REQ-E05-017 in `/docs/gen_requests_epic5.md`
- **Overview:** `/docs/REQ-E05-016-add-translation-status-column-to-items-list-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 3.5)
- **TranslationStatusColumn:** REQ-E05-014
- **TranslationPreviewPanel:** REQ-E05-007
- **useTranslationStatus Hook:** REQ-E05-010
