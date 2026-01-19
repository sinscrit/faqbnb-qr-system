# REQ-353: Add Translation Status Column to Items List - Detailed Task Breakdown

**Document Type:** Detailed Implementation Specification
**Created:** 2026-01-19 08:45:00 UTC
**Last Modified:** 2026-01-19 08:45:00 UTC
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.5
**Epic:** L10N Epic 5 - Owner Translation Management
**Dependencies:** REQ-351 (TranslationStatusColumn component), Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)
**Overview Document:** `docs/REQ-353-add-translation-status-column-to-items-list-overview.md`
**Requirements Source:** `docs/gen_requests_epic5.md` (Request #353)
**Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides granular, actionable tasks for integrating the `TranslationStatusColumn` component into the `ItemGrid` component. Property owners will see at-a-glance translation coverage across all six supported languages (en, fr, es, de, nl, it) directly within the items list grid view. Clicking the translation status indicator opens the translation preview panel for that specific item.

**Total Estimated Effort:** 5.25 story points

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies are complete:

- [ ] **REQ-351 Complete:** `TranslationStatusColumn` component exists at `/src/components/TranslationManagement/TranslationStatusColumn/`
- [ ] **Types Available:** `TranslationStatusMap`, `TranslationStatus`, `EntityType` types exported from `/src/components/TranslationManagement/`
- [ ] **Epic 1 Foundation:** Translation tables exist (`item_translations`, etc.)
- [ ] **i18n Config:** `SupportedLocale` type available from `/src/lib/i18n/config.ts`

---

## Task 1: Extend ItemManager Type Definitions

**File:** `/src/components/ItemManager/ItemManager.types.ts`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 1.1 Add Import Statements

Add the following imports at the top of the file:

```typescript
import { SupportedLocale } from '@/lib/i18n/config';
import type { TranslationStatusMap } from '@/components/TranslationManagement';
```

**Location:** Near line 13, after existing imports

### 1.2 Create ItemTranslationStatus Interface

Add a new interface to represent translation status data for a single item:

```typescript
/**
 * Translation status data for a single item.
 * Used by ItemGrid and ItemCard when showTranslationStatus is enabled.
 *
 * @lastModified 2026-01-19 (REQ-353)
 */
export interface ItemTranslationStatus {
  /** Source language of the item content */
  sourceLanguage: SupportedLocale;
  /** Translation status for each language */
  translations: TranslationStatusMap;
}
```

**Location:** After the `ItemReactionSummary` interface (approximately line 248)

### 1.3 Extend ItemGridProps Interface

Modify the existing `ItemGridProps` interface (lines 624-645) to add translation-related props:

**Add these properties inside the interface:**

```typescript
  /**
   * Enable translation status display on item cards.
   * When true, each item card shows a compact translation status indicator.
   * @default false
   * @lastModified 2026-01-19 (REQ-353)
   */
  showTranslationStatus?: boolean;

  /**
   * Translation status data for items, keyed by item ID.
   * Required when showTranslationStatus is true.
   * @lastModified 2026-01-19 (REQ-353)
   */
  itemTranslationData?: Record<string, ItemTranslationStatus>;

  /**
   * Callback when translation status indicator is clicked.
   * Opens the TranslationPreviewPanel for the item.
   * @lastModified 2026-01-19 (REQ-353)
   */
  onTranslationStatusClick?: (item: ItemRecord) => void;
```

### 1.4 Extend ItemCardProps Interface

Modify the existing `ItemCardProps` interface (lines 514-546) to add translation-related props:

**Add these properties inside the interface:**

```typescript
  /**
   * Whether to show translation status indicator.
   * @default false
   * @lastModified 2026-01-19 (REQ-353)
   */
  showTranslationStatus?: boolean;

  /**
   * Translation status data for this item.
   * Required when showTranslationStatus is true.
   * @lastModified 2026-01-19 (REQ-353)
   */
  translationStatus?: ItemTranslationStatus;

  /**
   * Callback when translation status indicator is clicked.
   * @lastModified 2026-01-19 (REQ-353)
   */
  onTranslationStatusClick?: (item: ItemRecord) => void;
```

### 1.5 Update File Header

Update the `@lastModified` comment at the top of the file:

```typescript
* @lastModified 2026-01-19 (REQ-353 - Added translation status types: ItemTranslationStatus, extended ItemGridProps and ItemCardProps)
```

### Verification Criteria for Task 1

- [ ] TypeScript compilation passes with no errors
- [ ] `ItemTranslationStatus` interface is exported
- [ ] `ItemGridProps` has 3 new optional properties
- [ ] `ItemCardProps` has 3 new optional properties

---

## Task 2: Update ItemGrid Component Props

**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 2.1 Update Function Signature

Modify the function signature (line 17-29) to include the new props:

**Current:**
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

**Updated:**
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
  showTranslationStatus,
  itemTranslationData,
  onTranslationStatusClick,
}: ItemGridProps & { loading?: boolean }) {
```

### 2.2 Update Component JSDoc

Update the JSDoc comment (lines 1-11):

```typescript
/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 * Supports optional translation status display when showTranslationStatus is enabled.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-19 (REQ-353 - Added translation status column support)
 */
```

### Verification Criteria for Task 2

- [ ] Function signature includes new props
- [ ] TypeScript shows no errors for new props
- [ ] JSDoc updated with new date and REQ reference

---

## Task 3: Pass Translation Props to ItemCard

**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 3.1 Update ItemCard Rendering

Modify the ItemCard rendering inside the map (lines 42-54) to pass translation props:

**Current:**
```tsx
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
```

**Updated:**
```tsx
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
  showTranslationStatus={showTranslationStatus}
  translationStatus={itemTranslationData?.[item.id]}
  onTranslationStatusClick={onTranslationStatusClick}
/>
```

### Verification Criteria for Task 3

- [ ] ItemCard receives `showTranslationStatus` prop
- [ ] ItemCard receives `translationStatus` prop (looked up by item.id)
- [ ] ItemCard receives `onTranslationStatusClick` callback
- [ ] No TypeScript errors

---

## Task 4: Update ItemCard to Accept Translation Props

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 4.1 Add Import Statement

Add import for TranslationStatusColumn at the top of the file (after line 21):

```typescript
import { TranslationStatusColumn } from '@/components/TranslationManagement';
```

### 4.2 Update Function Signature

Modify the function signature (lines 66-79) to include new props:

**Current:**
```typescript
export function ItemCard({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
}: ItemCardProps) {
```

**Updated:**
```typescript
export function ItemCard({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
  showTranslationStatus,
  translationStatus,
  onTranslationStatusClick,
}: ItemCardProps) {
```

### 4.3 Update Component JSDoc

Update the file header JSDoc (lines 1-18):

```typescript
/**
 * ItemCard Component
 *
 * A card component for displaying items in the grid view of ItemManager.
 * Features include:
 * - Thumbnail display with Object URL management
 * - Content type badge with appropriate colors
 * - Selection checkbox for bulk operations
 * - Hover and focus states for accessibility
 * - Keyboard navigation support
 * - Inline editing of title, location, and tags (REQ-087, REQ-088)
 * - Long-press gesture for mobile selection mode entry (REQ-069)
 * - Translation status indicator display (REQ-353)
 *
 * @module ItemManager/components/ItemCard
 * @lastModified 2026-01-19 (REQ-353 - Added translation status display support)
 */
```

### Verification Criteria for Task 4

- [ ] TranslationStatusColumn import added
- [ ] Function signature includes 3 new props
- [ ] JSDoc updated with REQ-353 reference
- [ ] No TypeScript errors

---

## Task 5: Integrate TranslationStatusColumn into ItemCard

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 1 story point
**Status:** [ ] Not Started

### 5.1 Add Translation Status Section

Add the translation status section inside the card, after the Analytics Section (around line 406). Insert this before the closing `</div>` of the Content Section:

```tsx
{/* Translation Status Section */}
{showTranslationStatus && translationStatus && (
  <div
    data-translation-status
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      onTranslationStatusClick?.(item);
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onTranslationStatusClick?.(item);
      }
    }}
    className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 cursor-pointer hover:bg-gray-50 rounded -mx-1 px-1 transition-colors"
    aria-label={`View translation status for ${item.title}`}
  >
    <TranslationStatusColumn
      entityType="item"
      entityId={item.id}
      sourceLanguage={translationStatus.sourceLanguage}
      translations={translationStatus.translations}
      size="small"
    />
  </div>
)}
```

**Insertion Location:** After the Analytics Section block (after line 406, before the closing `</div>` at approximately line 407)

### 5.2 Visual Layout Reference

The translation status indicator should appear:
- Below the analytics section (if analytics enabled) OR
- At the bottom of the content section (if analytics disabled)
- Separated by a subtle top border (`border-t border-gray-100`)
- With proper hover state for click affordance

### Verification Criteria for Task 5

- [ ] TranslationStatusColumn renders when both `showTranslationStatus` and `translationStatus` are truthy
- [ ] Click handler calls `onTranslationStatusClick` with the item
- [ ] Keyboard handler (Enter/Space) triggers the click action
- [ ] Has proper data attribute for event handling
- [ ] Visual styling matches existing card sections

---

## Task 6: Handle Click Event Propagation

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 6.1 Update handleCardClick Function

Modify the `handleCardClick` function (lines 180-200) to check for translation status area:

**Current:**
```typescript
const handleCardClick = (e: React.MouseEvent) => {
  // Don't trigger if clicking checkbox or inline edit areas
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[data-inline-edit]')) {
    return;
  }

  // Ignore if this was a long-press (prevents click after long-press)
  if (isLongPress()) {
    return;
  }

  // In selection mode, toggle selection instead of preview
  if (isSelectionMode) {
    onSelectionChange(item.id, !isSelected);
    return;
  }

  // Normal mode: open preview
  onPreviewClick(item);
};
```

**Updated:**
```typescript
const handleCardClick = (e: React.MouseEvent) => {
  // Don't trigger if clicking checkbox or inline edit areas
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[data-inline-edit]')) {
    return;
  }

  // Don't trigger if clicking translation status area (has its own handler)
  if (target.closest('[data-translation-status]')) {
    return;
  }

  // Ignore if this was a long-press (prevents click after long-press)
  if (isLongPress()) {
    return;
  }

  // In selection mode, toggle selection instead of preview
  if (isSelectionMode) {
    onSelectionChange(item.id, !isSelected);
    return;
  }

  // Normal mode: open preview
  onPreviewClick(item);
};
```

### Verification Criteria for Task 6

- [ ] Clicking translation status does NOT trigger card preview
- [ ] Clicking translation status does NOT toggle selection in selection mode
- [ ] Card click still works normally when not clicking translation area
- [ ] `e.stopPropagation()` is called in the translation status click handler

---

## Task 7: Handle Missing Translation Data

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 7.1 Graceful Degradation

The implementation in Task 5 already handles missing data by using conditional rendering:

```tsx
{showTranslationStatus && translationStatus && (
  // ... component only renders if BOTH conditions are true
)}
```

This ensures:
- Component does NOT render if `showTranslationStatus` is false
- Component does NOT render if `translationStatus` is undefined
- No errors are thrown for missing data

### 7.2 Optional: Add Loading Skeleton (Enhancement)

If desired, add a loading skeleton when `showTranslationStatus` is true but data is not yet available:

```tsx
{/* Translation Status Section - Loading State (Optional Enhancement) */}
{showTranslationStatus && !translationStatus && (
  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
    <div className="flex gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  </div>
)}
```

**Note:** This is an optional enhancement and can be skipped for MVP.

### Verification Criteria for Task 7

- [ ] No errors when `translationStatus` is undefined
- [ ] Component does not render when data is missing
- [ ] (Optional) Loading skeleton shows when enabled but data not available

---

## Task 8: Optimize with Memoization

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 8.1 Verify Existing Memoization

The ItemCard component already uses `useMemo` for expensive operations (e.g., `objectUrl`). Verify that the translation status rendering doesn't cause unnecessary re-renders.

### 8.2 Consider Memoization for Translation Status (If Needed)

If performance issues are observed, wrap the translation status JSX in useMemo:

```typescript
const translationStatusSection = useMemo(() => {
  if (!showTranslationStatus || !translationStatus) {
    return null;
  }

  return (
    <div
      data-translation-status
      // ... rest of the JSX from Task 5
    >
      <TranslationStatusColumn
        entityType="item"
        entityId={item.id}
        sourceLanguage={translationStatus.sourceLanguage}
        translations={translationStatus.translations}
        size="small"
      />
    </div>
  );
}, [showTranslationStatus, translationStatus, item.id, item.title, onTranslationStatusClick]);
```

Then use `{translationStatusSection}` in the render output.

**Note:** Only implement memoization if performance profiling indicates it's necessary. Premature optimization may add unnecessary complexity.

### Verification Criteria for Task 8

- [ ] Component re-renders efficiently
- [ ] No unnecessary re-renders when translation data hasn't changed
- [ ] Performance is acceptable with 50+ items in the grid

---

## Task 9: Responsive Layout Adjustments

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Effort:** 0.5 story points
**Status:** [ ] Not Started

### 9.1 Verify Mobile Layout

Ensure the translation status indicator scales appropriately on mobile viewports (320px+):

- The `size="small"` prop on TranslationStatusColumn uses smaller dots (w-3 h-3)
- The flex layout with `gap-1` provides tight spacing
- The container has padding that works on mobile

### 9.2 Test Breakpoints

Test the following scenarios:

| Viewport Width | Expected Behavior |
|----------------|-------------------|
| 320px (iPhone SE) | Translation dots visible, tightly spaced |
| 375px (iPhone) | Translation dots visible, readable |
| 768px (iPad) | Translation dots visible, comfortable spacing |
| 1024px+ (Desktop) | Translation dots visible, optimal spacing |

### 9.3 Adjust if Needed

If the translation status looks cramped on very small screens, consider:

1. **Hiding on extra-small screens:**
```tsx
<div className="hidden sm:flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 ...">
```

2. **Using even smaller dots on mobile (if TranslationStatusColumn supports it):**
```tsx
<TranslationStatusColumn
  // ...
  size="small" // Consider adding xs size if needed
/>
```

### Verification Criteria for Task 9

- [ ] Layout works on 320px viewport
- [ ] Layout works on 375px viewport
- [ ] Layout works on tablet viewports
- [ ] Layout works on desktop viewports
- [ ] No horizontal overflow issues

---

## Task 10: Update Module Documentation

**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Estimated Effort:** 0.25 story points
**Status:** [ ] Not Started

### 10.1 Add Usage Example in JSDoc

Enhance the component JSDoc with a usage example:

```typescript
/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 * Supports optional translation status display when showTranslationStatus is enabled.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-19 (REQ-353 - Added translation status column support)
 *
 * @example
 * // With translation status enabled
 * <ItemGrid
 *   items={items}
 *   showTranslationStatus={true}
 *   itemTranslationData={{
 *     'item-1': { sourceLanguage: 'en', translations: { en: 'completed', fr: 'pending' } },
 *     'item-2': { sourceLanguage: 'en', translations: { en: 'completed', fr: 'completed' } },
 *   }}
 *   onTranslationStatusClick={(item) => openTranslationPreview(item)}
 *   // ... other props
 * />
 */
```

### Verification Criteria for Task 10

- [ ] JSDoc includes usage example
- [ ] `@lastModified` date and REQ reference updated
- [ ] Documentation accurately describes new props

---

## Integration Testing Checklist

After all tasks are complete, perform the following integration tests:

### Functional Tests

- [ ] **Props Passing:** `showTranslationStatus` prop flows from ItemGrid to ItemCard
- [ ] **Data Lookup:** `translationStatus` is correctly looked up by item.id from `itemTranslationData`
- [ ] **Callback Flow:** `onTranslationStatusClick` is called with correct item when clicked
- [ ] **Conditional Rendering:** Status indicator only renders when both props are provided

### Visual Tests

- [ ] Translation status dots appear below analytics (if present)
- [ ] Translation status dots appear at bottom of card (if no analytics)
- [ ] Hover state shows on translation status area
- [ ] Click area is clearly distinguishable

### Interaction Tests

- [ ] Clicking translation status triggers callback
- [ ] Clicking translation status does NOT trigger card preview
- [ ] Clicking elsewhere on card still opens preview
- [ ] In selection mode, clicking translation status does NOT toggle selection
- [ ] Keyboard Enter/Space on translation status triggers callback

### Edge Cases

- [ ] Card renders correctly when `showTranslationStatus` is false
- [ ] Card renders correctly when `translationStatus` is undefined
- [ ] No console errors when translation data is missing
- [ ] Performance is acceptable with 100+ items

---

## Files Modified Summary

| File | Changes | Status |
|------|---------|--------|
| `/src/components/ItemManager/ItemManager.types.ts` | Add `ItemTranslationStatus`, extend `ItemGridProps`, extend `ItemCardProps` | [ ] |
| `/src/components/ItemManager/components/ItemGrid.tsx` | Add new props, pass to ItemCard | [ ] |
| `/src/components/ItemManager/components/ItemCard.tsx` | Add new props, render TranslationStatusColumn, handle click events | [ ] |

---

## Files Referenced (Read-Only)

| File | Information Used |
|------|------------------|
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Component API, props interface |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | `TranslationStatusMap`, `TranslationStatus` types |
| `/src/lib/i18n/config.ts` | `SupportedLocale` type |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Pattern reference for compact indicators |

---

## Definition of Done

- [ ] `ItemGridProps` extended with translation status props
- [ ] `ItemCardProps` extended with translation status props
- [ ] `ItemGrid` passes translation props to `ItemCard` children
- [ ] `ItemCard` conditionally renders `TranslationStatusColumn`
- [ ] Click on translation status triggers `onTranslationStatusClick` callback
- [ ] Click on translation status does NOT trigger card preview
- [ ] Missing translation data is handled gracefully (no errors)
- [ ] Layout works on mobile viewports (320px+)
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully (`npm run build`)
- [ ] All integration tests pass
- [ ] Code follows existing codebase patterns and conventions

---

## Effort Summary

| Task | Description | Estimate |
|------|-------------|----------|
| Task 1 | Extend type definitions | 0.5 SP |
| Task 2 | Update ItemGrid props | 0.5 SP |
| Task 3 | Pass props to ItemCard | 0.5 SP |
| Task 4 | Update ItemCard props | 0.5 SP |
| Task 5 | Integrate TranslationStatusColumn | 1.0 SP |
| Task 6 | Handle click propagation | 0.5 SP |
| Task 7 | Handle missing data | 0.5 SP |
| Task 8 | Optimize memoization | 0.5 SP |
| Task 9 | Responsive layout | 0.5 SP |
| Task 10 | Update documentation | 0.25 SP |
| **Total** | | **5.25 SP** |

---

## References

- **Overview Document:** `/docs/REQ-353-add-translation-status-column-to-items-list-overview.md`
- **Requirements:** `/docs/gen_requests_epic5.md` (Request #353)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Dependency (REQ-351):** `/docs/REQ-351-create-translationstatuscolumn-component-overview.md`
- **ItemGrid Source:** `/src/components/ItemManager/components/ItemGrid.tsx`
- **ItemCard Source:** `/src/components/ItemManager/components/ItemCard.tsx`
- **Types:** `/src/components/ItemManager/ItemManager.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
