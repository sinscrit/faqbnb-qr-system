# REQ-353: Add Translation Status Column to Items List

**Document Type:** Implementation Breakdown
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.5
**Epic:** L10N Epic 5 - Owner Translation Management
**Dependencies:** REQ-351 (TranslationStatusColumn component), Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## 1. Summary

Integrate the `TranslationStatusColumn` component into the `ItemGrid` component to display translation status for each item in the grid view. Property owners will see at-a-glance translation coverage across all six supported languages directly within the items list, with click functionality to open the translation preview panel.

---

## 2. Background

### Current Behavior
The `ItemGrid` component (`/src/components/ItemManager/components/ItemGrid.tsx`) renders items in a responsive multi-column grid layout using `ItemCard` components. Each card displays:
- Thumbnail with loading/error states
- Content type badge (VIDEO, PHOTO, PDF, LINK, TEXT, MIXED)
- Title (with optional inline editing)
- Location (with optional inline editing)
- Tags (with optional inline editing)
- Analytics (visit count, reactions) when enabled

Translation status is not visible. Property owners must navigate to separate translation management interfaces or open individual items to assess translation coverage across their content inventory.

### Expected Behavior
When translation status display is enabled via an optional prop:
- Each `ItemCard` displays a compact translation status indicator showing completion status for all six supported languages (en, fr, es, de, nl, it)
- The indicator uses color-coded dots/icons consistent with the `TranslationStatusColumn` component design
- Clicking the translation status indicator triggers a callback to open the `TranslationPreviewPanel` for that specific item
- The status indicator is positioned within the card layout without disrupting existing visual hierarchy
- Status updates dynamically when translation data changes (via prop updates from parent)

### User Impact
Property owners browsing their items list can immediately identify which items have complete translations, which are pending, and which have failed across all supported languages. This reduces friction in maintaining translation completeness and enables prioritization of translation work based on visible status indicators. Owners with large item inventories benefit from scanning translation status across dozens or hundreds of items simultaneously.

### Business Value
Improves translation workflow efficiency by surfacing translation status where owners already spend time managing content. Reduces time spent identifying translation gaps and supports the platform's goal of comprehensive multilingual content availability.

---

## 3. Technical Context

### Existing Stack
| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 with App Router |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| UI Components | Radix UI primitives, Heroicons, Lucide React |
| State Management | React Context + useReducer |
| Backend | Supabase (PostgreSQL with RLS) |

### Relevant Existing Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| ItemGrid component | `/src/components/ItemManager/components/ItemGrid.tsx` | **Primary modification target** - renders item cards in grid |
| ItemCard component | `/src/components/ItemManager/components/ItemCard.tsx` | Child component that will display the status indicator |
| ItemGridProps interface | `/src/components/ItemManager/ItemManager.types.ts` | Props interface to extend with translation status support |
| ItemCardProps interface | `/src/components/ItemManager/ItemManager.types.ts` | Props interface to extend with translation status props |
| EngagementIndicator | `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Pattern for compact visual indicators on cards |
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Component to integrate (from REQ-351) |
| i18n Config | `/src/lib/i18n/config.ts` | `SupportedLocale` type, `locales` array |

### Database Schema Reference

**Translation Tables (from Epic 1):**

```sql
-- item_translations
item_id UUID, language VARCHAR, translation_status VARCHAR
-- Status values: 'pending', 'processing', 'completed', 'failed', 'manual'

-- Supported Languages: en, fr, es, de, nl, it
```

### Component Hierarchy

```
ItemManager (parent container)
    │
    └── ItemGrid (grid layout)
            │
            └── ItemCard[] (individual item cards)
                    │
                    ├── Existing content (thumbnail, title, tags, etc.)
                    │
                    └── TranslationStatusColumn (NEW - when enabled)
```

---

## 4. Requirements Mapping

### Acceptance Criteria to Implementation

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| ItemGrid component accepts an optional prop to enable translation status display | Task 1: Extend ItemGridProps with translation-related props |
| When enabled, each ItemCard displays a translation status indicator | Task 3: Integrate TranslationStatusColumn into ItemCard |
| Status indicator is visually compact and does not disrupt existing layout | Task 4: Position indicator within card layout |
| Clicking the translation status indicator triggers the preview panel | Task 5: Implement onClick callback wiring |
| Status indicator uses clear visual differentiation for states | Already handled by TranslationStatusColumn component |
| Status indicator updates dynamically when data changes | Task 6: Pass translation data through props chain |
| Component gracefully handles items with no translation data | Task 7: Handle missing/undefined translation data |
| Translation status fetch does not significantly degrade performance | Task 8: Optimize with memoization where needed |
| Status indicator is accessible with appropriate ARIA labels | Already handled by TranslationStatusColumn component |
| Mobile layouts display the status indicator appropriately | Task 9: Responsive positioning for mobile |

---

## 5. Architecture

### Props Extension Design

#### ItemGridProps Extension

```typescript
// In ItemManager.types.ts - extend ItemGridProps
export interface ItemGridProps {
  // ... existing props ...

  /**
   * Enable translation status display on item cards.
   * When true, each item card shows a compact translation status indicator.
   * @default false
   */
  showTranslationStatus?: boolean;

  /**
   * Translation status data for items, keyed by item ID.
   * Required when showTranslationStatus is true.
   */
  itemTranslationData?: Record<string, ItemTranslationStatus>;

  /**
   * Callback when translation status indicator is clicked.
   * Opens the TranslationPreviewPanel for the item.
   */
  onTranslationStatusClick?: (item: ItemRecord) => void;
}

/**
 * Translation status data for a single item.
 */
export interface ItemTranslationStatus {
  /** Source language of the item content */
  sourceLanguage: SupportedLocale;
  /** Translation status for each language */
  translations: TranslationStatusMap;
}
```

#### ItemCardProps Extension

```typescript
// In ItemManager.types.ts - extend ItemCardProps
export interface ItemCardProps {
  // ... existing props ...

  /**
   * Whether to show translation status indicator.
   * @default false
   */
  showTranslationStatus?: boolean;

  /**
   * Translation status data for this item.
   * Required when showTranslationStatus is true.
   */
  translationStatus?: ItemTranslationStatus;

  /**
   * Callback when translation status indicator is clicked.
   */
  onTranslationStatusClick?: (item: ItemRecord) => void;
}
```

### Visual Layout

```
┌─────────────────────────────────────────┐
│  [Thumbnail Area]                       │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │        Image/Fallback Icon          ││
│  │                                     ││
│  │ [Engagement]           [Type Badge] ││
│  └─────────────────────────────────────┘│
│                                         │
│  Title (editable)                       │
│  Location (editable)                    │
│  [Tag1] [Tag2] [+3 more]               │
│                                         │
│  ─────────────────────────────────────  │
│  👁️ 245   ❤️ 12                        │
│  ●●●●○○  (Translation Status - NEW)    │
└─────────────────────────────────────────┘
```

**Positioning:** The translation status indicator appears:
- Below the analytics section (if analytics enabled) OR
- At the bottom of the content section (if analytics disabled)
- Separated by a subtle border or spacing

### Data Flow

```
ItemManager (fetches items + translation status)
    │
    ├── Passes items[] to ItemGrid
    ├── Passes itemTranslationData to ItemGrid
    ├── Passes showTranslationStatus=true
    └── Passes onTranslationStatusClick callback
           │
           └── ItemGrid
                  │
                  ├── Iterates over items
                  └── For each item, renders ItemCard with:
                         ├── item data
                         ├── translationStatus={itemTranslationData[item.id]}
                         ├── showTranslationStatus={showTranslationStatus}
                         └── onTranslationStatusClick={onTranslationStatusClick}
                                │
                                └── ItemCard
                                       │
                                       └── TranslationStatusColumn
                                              (renders 6 status dots)
```

---

## 6. Implementation Tasks

### Task 1: Extend Type Definitions (0.5 story points)
**File:** `/src/components/ItemManager/ItemManager.types.ts`

**Changes:**
- Add `ItemTranslationStatus` interface
- Extend `ItemGridProps` with:
  - `showTranslationStatus?: boolean`
  - `itemTranslationData?: Record<string, ItemTranslationStatus>`
  - `onTranslationStatusClick?: (item: ItemRecord) => void`
- Extend `ItemCardProps` with:
  - `showTranslationStatus?: boolean`
  - `translationStatus?: ItemTranslationStatus`
  - `onTranslationStatusClick?: (item: ItemRecord) => void`
- Import `SupportedLocale` from `@/lib/i18n/config`
- Import `TranslationStatusMap` from `@/components/TranslationManagement`

### Task 2: Update ItemGrid Component Props (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemGrid.tsx`

**Changes:**
- Add new props to function signature:
  - `showTranslationStatus`
  - `itemTranslationData`
  - `onTranslationStatusClick`
- Update JSDoc documentation
- Update `@lastModified` comment

### Task 3: Pass Props to ItemCard (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemGrid.tsx`

**Changes:**
- Pass translation-related props to each `ItemCard`:
  ```tsx
  <ItemCard
    // ... existing props
    showTranslationStatus={showTranslationStatus}
    translationStatus={itemTranslationData?.[item.id]}
    onTranslationStatusClick={onTranslationStatusClick}
  />
  ```

### Task 4: Update ItemCard to Accept Translation Props (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Add new props to function signature:
  - `showTranslationStatus`
  - `translationStatus`
  - `onTranslationStatusClick`
- Import `TranslationStatusColumn` from `@/components/TranslationManagement`
- Update JSDoc documentation

### Task 5: Integrate TranslationStatusColumn into ItemCard (1 story point)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Render `TranslationStatusColumn` when `showTranslationStatus` is true AND `translationStatus` is provided
- Position below analytics section or at bottom of content section
- Add visual separator (border-t or margin)
- Example integration:

```tsx
{/* Translation Status Section */}
{showTranslationStatus && translationStatus && (
  <div
    data-translation-status
    onClick={(e) => {
      e.stopPropagation();
      onTranslationStatusClick?.(item);
    }}
    className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100"
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

### Task 6: Handle Click Event Propagation (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Ensure clicking translation status does NOT trigger card preview
- Add `e.stopPropagation()` in the click handler wrapper
- Add `data-translation-status` attribute for click detection in parent
- Update `handleCardClick` to check for translation status area:
  ```tsx
  if (target.closest('[data-translation-status]')) {
    return;
  }
  ```

### Task 7: Handle Missing Translation Data (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Gracefully handle when `translationStatus` is undefined
- Do not render TranslationStatusColumn if data is missing
- Consider showing loading skeleton if `showTranslationStatus` is true but data is not yet available (optional)

### Task 8: Optimize with Memoization (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Ensure translation status rendering doesn't cause unnecessary re-renders
- Consider wrapping translation status section in useMemo if needed
- Verify ItemCard is properly memoized or uses React.memo

### Task 9: Responsive Layout Adjustments (0.5 story points)
**File:** `/src/components/ItemManager/components/ItemCard.tsx`

**Changes:**
- Ensure translation status indicator scales appropriately on mobile
- Use `size="small"` for TranslationStatusColumn in card context
- Test layout on narrow screens (320px+)

### Task 10: Update Module Documentation (0.25 story points)
**File:** `/src/components/ItemManager/components/ItemGrid.tsx`

**Changes:**
- Update `@lastModified` date and REQ reference
- Add JSDoc for new props
- Document usage pattern for translation status integration

---

## 7. Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Reason |
|-----------|---------|--------|
| `/src/components/ItemManager/ItemManager.types.ts` | Add `ItemTranslationStatus` interface, extend `ItemGridProps`, extend `ItemCardProps` | Type definitions for new functionality |
| `/src/components/ItemManager/components/ItemGrid.tsx` | Add new props, pass to ItemCard children | Grid-level translation status support |
| `/src/components/ItemManager/components/ItemCard.tsx` | Add new props, integrate TranslationStatusColumn, handle click events | Card-level translation status display |

### Files to Reference (Read-Only)

| File Path | Information Needed |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Component API, props interface |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | `TranslationStatusMap`, `TranslationStatus` types |
| `/src/lib/i18n/config.ts` | `SupportedLocale` type, `locales` array |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Pattern for compact indicators |

### Functions to Modify

| File | Function | Changes |
|------|----------|---------|
| `ItemGrid.tsx` | `ItemGrid` | Add props, pass to children |
| `ItemCard.tsx` | `ItemCard` | Add props, add TranslationStatusColumn render |
| `ItemCard.tsx` | `handleCardClick` | Add check for translation status click area |

---

## 8. Integration Points

### Usage Example

```tsx
// In ItemManager.tsx or parent component
import { ItemGrid } from './components/ItemGrid';
import { TranslationPreviewPanel } from '@/components/TranslationManagement';

function ItemManager({ items, itemTranslationData }) {
  const [previewItem, setPreviewItem] = useState(null);

  const handleTranslationStatusClick = (item) => {
    setPreviewItem(item);
  };

  return (
    <>
      <ItemGrid
        items={items}
        showTranslationStatus={true}
        itemTranslationData={itemTranslationData}
        onTranslationStatusClick={handleTranslationStatusClick}
        // ... other props
      />

      {previewItem && (
        <TranslationPreviewPanel
          entityType="item"
          entityId={previewItem.id}
          sourceLanguage={itemTranslationData[previewItem.id]?.sourceLanguage || 'en'}
          sourceContent={{ name: previewItem.title, description: previewItem.description }}
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </>
  );
}
```

### Translation Data Source
The `itemTranslationData` prop would typically be:
1. Fetched from the translation status API (GET /api/translations/status?entityType=item&propertyId=X)
2. Transformed into a Record<itemId, ItemTranslationStatus> map
3. Passed down from ItemManager or dashboard page

---

## 9. Testing Requirements

### Unit Test Cases

**File:** `/src/components/ItemManager/components/__tests__/ItemGrid.test.tsx` (extend)

1. **Props Passing Tests**
   - Passes `showTranslationStatus` to ItemCard children
   - Passes `translationStatus` for each item when data is available
   - Passes `onTranslationStatusClick` callback to children

**File:** `/src/components/ItemManager/components/__tests__/ItemCard.test.tsx` (extend)

2. **Rendering Tests**
   - Does NOT render TranslationStatusColumn when `showTranslationStatus` is false
   - Does NOT render TranslationStatusColumn when `translationStatus` is undefined
   - Renders TranslationStatusColumn when both props are provided
   - Positions translation status below analytics section

3. **Click Interaction Tests**
   - Clicking translation status area calls `onTranslationStatusClick` with item
   - Clicking translation status does NOT trigger card preview
   - Card click still works when not clicking translation area

4. **Accessibility Tests**
   - Translation status section has appropriate role
   - Keyboard activation works for translation status

---

## 10. Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| `TranslationStatusColumn` component | REQ-351 | Must be completed |
| `TranslationStatusMap` type | REQ-351 types | Must be available |
| Translation tables | Epic 1 | Required |

### Internal Dependencies

- `/src/lib/i18n/config.ts` - `SupportedLocale` type
- `/src/lib/utils.ts` - `cn()` utility for class merging
- `/src/components/TranslationManagement/` - `TranslationStatusColumn` component

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationStatusColumn not yet implemented (REQ-351) | High | High | Verify REQ-351 is complete before starting |
| Translation data not available at ItemGrid level | Medium | Medium | Design for optional data; graceful degradation |
| Performance impact with many items | Medium | Medium | Use memoization; pass data efficiently |
| Visual clutter in compact card layout | Medium | Low | Use small size variant; position thoughtfully |
| Click area conflicts with existing interactions | Medium | Medium | Proper event propagation handling |

---

## 12. Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Extend types | 0.5 SP |
| Task 2: Update ItemGrid props | 0.5 SP |
| Task 3: Pass props to ItemCard | 0.5 SP |
| Task 4: Update ItemCard props | 0.5 SP |
| Task 5: Integrate TranslationStatusColumn | 1 SP |
| Task 6: Handle click propagation | 0.5 SP |
| Task 7: Handle missing data | 0.5 SP |
| Task 8: Optimize memoization | 0.5 SP |
| Task 9: Responsive layout | 0.5 SP |
| Task 10: Update documentation | 0.25 SP |
| **Total** | **5.25 SP** |

---

## 13. Definition of Done

- [ ] `ItemGridProps` extended with translation status props
- [ ] `ItemCardProps` extended with translation status props
- [ ] `ItemGrid` passes translation props to `ItemCard` children
- [ ] `ItemCard` conditionally renders `TranslationStatusColumn`
- [ ] Click on translation status triggers `onTranslationStatusClick` callback
- [ ] Click on translation status does NOT trigger card preview
- [ ] Missing translation data is handled gracefully
- [ ] Layout works on mobile viewports (320px+)
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] Unit tests pass (if extending existing tests)

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **TranslationStatusColumn:** REQ-351 `/docs/REQ-351-create-translationstatuscolumn-component-overview.md`
- **ItemGrid Source:** `/src/components/ItemManager/components/ItemGrid.tsx`
- **ItemCard Source:** `/src/components/ItemManager/components/ItemCard.tsx`
- **Types:** `/src/components/ItemManager/ItemManager.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
