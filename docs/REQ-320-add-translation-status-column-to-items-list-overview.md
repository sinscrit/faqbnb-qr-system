# REQ-320: Add Translation Status Column to Items Grid - Technical Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Status:** READY FOR IMPLEMENTATION
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.5

---

## 1. Summary

This request adds an optional translation status column to the ItemGrid and ItemList components, enabling property owners to see translation coverage directly in the item list view. Each row will display compact visual indicators for all six supported languages using the TranslationStatusColumn component. Clicking the translation status column opens the TranslationPreviewPanel for that item, providing quick access to translation details and actions without leaving the item list.

---

## 2. Dependencies

### 2.1 Epic Dependencies

| Dependency | Location | Status | Required For |
|------------|----------|--------|--------------|
| Epic 1 Foundation | Translation tables (`article_translations`, `item_translations`, etc.) | Required | Translation data availability |
| Epic 3 Dynamic Content | Translation trigger system, status tracking | Required | Status data to display |
| REQ-309 | TranslationManagement types file | Required | Shared type definitions |
| REQ-310 | TranslationPreviewPanel component | Required | Panel opened on click |
| REQ-314 | useTranslationStatus hook | Required | Fetching translation status |
| REQ-317 | TranslationStatusColumn component | Required | Compact status indicator |

### 2.2 Internal Dependencies

| Component/File | Purpose |
|----------------|---------|
| `/src/components/ItemManager/ItemManager.types.ts` | Type definitions for ItemGrid/ItemList props |
| `/src/components/ItemManager/components/ItemGrid.tsx` | Grid view component to modify |
| `/src/components/ItemManager/components/ItemList.tsx` | List view component to modify |
| `/src/components/ItemManager/components/ItemCard.tsx` | Card component for grid view |
| `/src/components/ItemManager/components/ItemRow.tsx` | Row component for list view |

---

## 3. Technical Context

### 3.1 Existing Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Column toggle pattern | `ColumnVisibilityState` in ItemManager.types.ts | Pattern for optional columns |
| Optional column rendering | ItemList.tsx (Property column) | How to conditionally show columns |
| Click handler pattern | ItemCard/ItemRow onPreviewClick | Pattern for click to open panel |
| Grid card structure | ItemCard.tsx | Where to add status indicator in grid view |
| Row cell structure | ItemRow.tsx | Where to add status column in list view |
| Slide-in panel | ItemPreviewModal.tsx | Pattern for TranslationPreviewPanel |

### 3.2 Supported Languages

The translation system supports 6 languages (per Epic 1):
- English (en) - Source language
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

### 3.3 Translation Status Values

From the implementation plan, translation statuses include:
- `pending` - Translation queued but not started (orange indicator)
- `processing` - Translation in progress (animated)
- `completed` - Translation successful (green indicator)
- `failed` - Translation encountered errors (red indicator)
- `manual` - Manually curated/reviewed (purple indicator)
- Not started (gray indicator)

---

## 4. Implementation Approach

### 4.1 Overview

1. **Extend Types**: Add translation status props to ItemGridProps, ItemListProps, ItemCardProps, and ItemRowProps
2. **Create ColumnVisibility Extension**: Add `translationStatus` to ColumnVisibilityState type
3. **Integrate TranslationStatusColumn**: Import and render the component in ItemCard and ItemRow
4. **Add Click Handler**: Wire up click on translation status to open TranslationPreviewPanel
5. **Update ItemList Header**: Add Translation Status column header with responsive hiding
6. **Conditional Rendering**: Show column only when enabled via prop or feature flag

### 4.2 Component Integration Flow

```
ItemManager (parent)
    │
    ├── ItemGrid (grid view)
    │   └── ItemCard
    │       └── TranslationStatusColumn (new)
    │           └── onClick → onTranslationStatusClick(item)
    │
    └── ItemList (list view)
        └── ItemRow
            └── TranslationStatusColumn (new)
                └── onClick → onTranslationStatusClick(item)

Parent Component
    └── Handles onTranslationStatusClick
        └── Opens TranslationPreviewPanel
```

### 4.3 Translation Status Data Flow

```
ItemManager fetches items with translation status
    │
    ├── Item includes translationStatus: TranslationStatusMap
    │   └── { en: { status, isStale }, fr: { status }, ... }
    │
    └── Pass to ItemCard/ItemRow
        └── Pass to TranslationStatusColumn
            └── Renders 6 status indicators
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File Path | Changes Required |
|-----------|------------------|
| `/src/components/ItemManager/ItemManager.types.ts` | Add `TranslationStatusMap`, `LanguageTranslationStatus` types; extend `ItemGridProps`, `ItemListProps`, `ItemCardProps`, `ItemRowProps` with translation props; extend `ColumnVisibilityState` |
| `/src/components/ItemManager/components/ItemGrid.tsx` | Import TranslationStatusColumn; pass translation props to ItemCard; add onTranslationStatusClick handler |
| `/src/components/ItemManager/components/ItemList.tsx` | Add Translation Status column header; pass translation props to ItemRow; handle column visibility |
| `/src/components/ItemManager/components/ItemCard.tsx` | Add optional TranslationStatusColumn in card footer; handle click to invoke callback |
| `/src/components/ItemManager/components/ItemRow.tsx` | Add TranslationStatusColumn cell; handle click to invoke callback |

### 5.2 New Files (Dependencies from other REQs)

These files should already exist or be created as part of REQ-317:

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Column exports |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Compact status indicator |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared translation types |

### 5.3 Functions to Add/Modify

| File | Function/Interface | Changes |
|------|---------------------|---------|
| `ItemManager.types.ts` | `ItemGridProps` | Add: `enableTranslationStatus?: boolean`, `onTranslationStatusClick?: (item: ItemRecord) => void` |
| `ItemManager.types.ts` | `ItemListProps` | Add: `enableTranslationStatus?: boolean`, `onTranslationStatusClick?: (item: ItemRecord) => void` |
| `ItemManager.types.ts` | `ItemCardProps` | Add: `translationStatus?: TranslationStatusMap`, `onTranslationStatusClick?: (item: ItemRecord) => void` |
| `ItemManager.types.ts` | `ItemRowProps` | Add: `translationStatus?: TranslationStatusMap`, `onTranslationStatusClick?: (item: ItemRecord) => void`, `showTranslationColumn?: boolean` |
| `ItemManager.types.ts` | `ColumnVisibilityState` | Add: `translationStatus: boolean` |
| `ItemManager.types.ts` | (new) `TranslationStatusMap` | Type alias: `Record<SupportedLanguage, LanguageTranslationStatus>` |
| `ItemManager.types.ts` | (new) `LanguageTranslationStatus` | Interface: `{ status, isStale?, translatedAt?, reviewedBy? }` |
| `ItemManager.types.ts` | (new) `SupportedLanguage` | Type: `'en' \| 'fr' \| 'es' \| 'de' \| 'nl' \| 'it'` |
| `ItemGrid.tsx` | Component props | Destructure new props; pass to ItemCard |
| `ItemList.tsx` | Component JSX | Add column header; pass props to ItemRow |
| `ItemCard.tsx` | Component JSX | Conditionally render TranslationStatusColumn with click handler |
| `ItemRow.tsx` | Component JSX | Add TranslationStatusColumn cell; handle visibility |

---

## 6. Type Definitions

### 6.1 New Types to Add (in ItemManager.types.ts or import from TranslationManagement.types.ts)

```typescript
/**
 * Supported language codes for translation.
 * @since REQ-320
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status for a single language.
 * @since REQ-320
 */
export interface LanguageTranslationStatus {
  /** Current translation status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual' | 'not_started';
  /** Whether the translation is stale (source updated after translation) */
  isStale?: boolean;
  /** When the translation was last updated */
  translatedAt?: string;
  /** User ID of manual reviewer (if manually edited) */
  reviewedBy?: string;
}

/**
 * Map of translation status per language.
 * @since REQ-320
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
```

### 6.2 Extended ItemRecordExtended

```typescript
export interface ItemRecordExtended extends ItemRecord {
  // ... existing properties ...

  /**
   * Translation status for each supported language.
   * Optional, loaded when translation features enabled.
   * @since REQ-320
   */
  translationStatus?: TranslationStatusMap;
}
```

### 6.3 Props Extensions

```typescript
// ItemGridProps additions
export interface ItemGridProps {
  // ... existing props ...

  /** Enable translation status display in grid view */
  enableTranslationStatus?: boolean;

  /** Callback when translation status indicator is clicked */
  onTranslationStatusClick?: (item: ItemRecord) => void;
}

// ItemListProps additions
export interface ItemListProps {
  // ... existing props ...

  /** Enable translation status column */
  enableTranslationStatus?: boolean;

  /** Callback when translation status is clicked */
  onTranslationStatusClick?: (item: ItemRecord) => void;
}

// ColumnVisibilityState addition
export interface ColumnVisibilityState {
  property: boolean;
  /** Whether the Translation Status column is visible */
  translationStatus: boolean;
}
```

---

## 7. Implementation Details

### 7.1 ItemGrid Changes

```tsx
// In ItemGrid.tsx
import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';

export function ItemGrid({
  // ... existing props
  enableTranslationStatus,
  onTranslationStatusClick,
}: ItemGridProps & { loading?: boolean }) {
  return (
    <div className={cn(/* grid classes */)}>
      {items.map((item) => (
        <div key={item.id} role="gridcell">
          <ItemCard
            item={item}
            // ... existing props
            translationStatus={(item as ItemRecordExtended).translationStatus}
            onTranslationStatusClick={enableTranslationStatus ? onTranslationStatusClick : undefined}
          />
        </div>
      ))}
    </div>
  );
}
```

### 7.2 ItemCard Changes

Add TranslationStatusColumn in the card footer area (after tags section, before analytics):

```tsx
// In ItemCard.tsx - after tags section
{onTranslationStatusClick && translationStatus && (
  <div
    className="mt-2 pt-2 border-t border-gray-100"
    onClick={(e) => {
      e.stopPropagation();
      onTranslationStatusClick(item);
    }}
    data-translation-status
  >
    <TranslationStatusColumn
      translationStatus={translationStatus}
      size="small"
    />
  </div>
)}
```

### 7.3 ItemList Header Changes

Add Translation Status column header (hide on narrow viewports):

```tsx
// In ItemList.tsx header row
{columnVisibility?.translationStatus && (
  <div
    role="columnheader"
    className="hidden lg:block w-32 flex-shrink-0 text-xs font-medium text-gray-500 uppercase"
  >
    Translations
  </div>
)}
```

### 7.4 ItemRow Changes

Add TranslationStatusColumn cell:

```tsx
// In ItemRow.tsx
{showTranslationColumn && (
  <div
    role="cell"
    className="hidden lg:flex w-32 flex-shrink-0 items-center cursor-pointer hover:bg-gray-50"
    onClick={(e) => {
      e.stopPropagation();
      onTranslationStatusClick?.(item);
    }}
  >
    <TranslationStatusColumn
      translationStatus={translationStatus}
      size="small"
    />
  </div>
)}
```

### 7.5 Responsive Behavior

| Viewport | Grid View | List View |
|----------|-----------|-----------|
| Mobile (<768px) | Hide translation status | Hide translation column |
| Tablet (768-1024px) | Show in card footer | Hide column (optional) |
| Desktop (>1024px) | Show in card footer | Show translation column |

---

## 8. Acceptance Criteria

From REQ-320 requirements:

- [ ] ItemGrid component accepts an optional prop to enable translation status column
- [ ] Translation status column displays when enabled via prop or feature flag
- [ ] Each row/card includes TranslationStatusColumn component showing status for all six languages
- [ ] Translation status uses compact visual indicators that fit within standard cell dimensions
- [ ] Clicking translation status column opens TranslationPreviewPanel for that specific item
- [ ] Column layout adapts responsively, hiding on narrow viewports where space is constrained
- [ ] Column remains aligned and properly spaced when items have varying content lengths
- [ ] Component handles missing translation data gracefully without breaking grid/list layout
- [ ] Translation status updates automatically when status changes occur (via parent re-render)
- [ ] Feature integrates with existing ItemGrid/ItemList filtering and sorting functionality
- [ ] Column is keyboard accessible allowing users to open preview panel via keyboard navigation

---

## 9. Testing Considerations

### 9.1 Unit Tests

- TranslationStatusColumn renders all 6 language indicators
- Status colors match specification (green=complete, orange=pending, etc.)
- Click handler fires with correct item
- Component handles missing/partial translation data
- Tooltip shows language name and status on hover

### 9.2 Integration Tests

- ItemGrid renders translation status when enabled
- ItemList shows translation column when column visibility enabled
- Clicking status opens TranslationPreviewPanel
- Column hides on mobile viewports
- Keyboard navigation works (Tab, Enter to activate)

### 9.3 Accessibility Tests

- ARIA labels present for screen readers
- Focusable via keyboard
- Color contrast meets WCAG standards
- Status communicated beyond just color (icons/text)

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationStatusColumn not ready | Medium | High | Stub component with placeholder indicators |
| Performance with many items | Low | Medium | Render only visible items; virtualization if needed |
| Missing translation data | Medium | Low | Graceful fallback to empty/gray indicators |
| Layout shift on status load | Low | Medium | Reserve space for status column; skeleton loading |

---

## 11. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` (REQ-320)
- REQ-317 TranslationStatusColumn: Related component requirement
- REQ-310 TranslationPreviewPanel: Panel opened on click
- REQ-314 useTranslationStatus: Hook for fetching status data
- Existing ItemGrid: `/src/components/ItemManager/components/ItemGrid.tsx`
- Existing ItemList: `/src/components/ItemManager/components/ItemList.tsx`
- Existing Types: `/src/components/ItemManager/ItemManager.types.ts`

---

## 12. Visual Specification

### 12.1 Translation Status Column Appearance

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Title         │ Location │ Tags    │ Translations      │ Created │ ... │
├─────────────────────────────────────────────────────────────────────────┤
│ Dishwasher... │ Kitchen  │ #app... │ ● ● ● ○ ○ ●      │ Jan 15  │ ... │
│ Coffee Maker  │ Kitchen  │ #bev... │ ● ● ● ● ● ●      │ Jan 14  │ ... │
│ WiFi Setup    │ Living   │ #net... │ ● ○ ○ ○ ○ ○      │ Jan 13  │ ... │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
● Green = Complete    ● Orange = Pending    ● Red = Failed
○ Gray = Not started  ● Purple = Manual     ● Yellow border = Stale
```

### 12.2 Grid View Integration

```
┌─────────────────────────┐
│       [Thumbnail]       │
│                    [PHOTO]
├─────────────────────────┤
│ Dishwasher Instructions │
│ Kitchen                 │
│ #appliance #how-to      │
├─────────────────────────┤
│ ● ● ● ○ ○ ●  3/6       │ ← Translation status row
└─────────────────────────┘
```

---

*Document generated for FAQBNB L10N Epic 5 - Task 3.5*
