# REQ-351: Create TranslationStatusColumn Component for Table Integration

**Document Type:** Implementation Breakdown
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.2
**Epic:** L10N Epic 5 - Owner Translation Management
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## 1. Summary

Create a compact, visually informative translation status column component (`TranslationStatusColumn`) designed for integration into table listings. This component displays the translation state for all six supported languages (en, fr, es, de, nl, it) using color-coded visual indicators (dots/icons). Clicking the column opens a detailed translation preview panel for the associated content item.

---

## 2. Background

### Current Behavior
Content listings (articles, items, links) in the dashboard display only the original content without any indication of translation availability or status across supported languages. Property owners have no immediate visibility into which content needs translation attention.

### Expected Behavior
Each content item row displays a compact status indicator column showing the translation state for all six supported languages using visual markers. Each language indicator clearly shows whether a translation is:
- **Complete** (green checkmark)
- **Pending** (orange hourglass)
- **Missing** (gray dot)
- **Failed** (red X)
- **Manual** (purple pencil)

Clicking the status column opens a detailed translation preview panel for that specific content item.

### User Impact
Content owners managing multilingual properties can immediately identify which content items have complete translations, which need attention, and which languages are missing. This eliminates the need to open individual items to check translation status and enables quick identification of incomplete localization coverage.

### Business Value
Improves translation workflow efficiency by providing immediate visibility into localization completeness across the content inventory. Reduces time spent identifying translation gaps and enables proactive management of multilingual content quality.

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
| TagChip component | `/src/components/ItemManager/components/shared/TagChip.tsx` | Compact visual indicator pattern with color variants |
| EngagementIndicator | `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Dot/badge/icon variants with color-coded states |
| ItemRow component | `/src/components/ItemManager/components/ItemRow.tsx` | Table row integration pattern with column handling |
| ItemGrid component | `/src/components/ItemManager/components/ItemGrid.tsx` | Grid layout with click handlers |
| Locale config | `/src/lib/i18n/config.ts` | Supported locales, metadata, flags |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | SupportedLanguage type, locale options |

### Database Schema Reference

**Translation Tables (from Epic 1):**

```sql
-- item_translations
item_id UUID, language VARCHAR, translation_status VARCHAR
-- Status values: 'pending', 'processing', 'completed', 'failed', 'manual'

-- article_translations
article_id UUID, language VARCHAR, translation_status VARCHAR

-- link_translations
link_id UUID, language VARCHAR, translation_status VARCHAR
```

**Supported Languages:** `en`, `fr`, `es`, `de`, `nl`, `it`

---

## 4. Requirements Mapping

### Acceptance Criteria to Implementation

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Component displays exactly six language status indicators in a compact, horizontally-aligned layout | Task 2: Create base component with flex layout for 6 indicators |
| Each language indicator uses clear visual differentiation for states | Task 3: Implement status-to-visual mapping with colors/icons |
| Clicking anywhere on the status column opens the translation preview panel | Task 4: Add onClick handler with callback prop |
| Component accepts content item data (ID, type, current translations) as props | Task 1: Define TypeScript interface for props |
| Visual indicators update in real-time when translation status changes | Task 5: Integrate with parent re-render on data change |
| Component maintains consistent sizing and alignment within table layouts | Task 6: Apply fixed-width styling compatible with ItemRow |
| Hover states provide language identification (tooltip showing language + status) | Task 7: Add tooltip using title attribute or Radix Tooltip |
| Loading states are handled gracefully when translation data is being fetched | Task 8: Add skeleton/loading state variant |

---

## 5. Architecture

### Component Structure

```
/src/components/TranslationManagement/
├── index.ts                              # Public exports (add TranslationStatusColumn)
├── TranslationManagement.types.ts        # Shared types (add new types)
│
└── TranslationStatusColumn/
    ├── index.ts                          # Module exports
    ├── TranslationStatusColumn.tsx       # Main component
    └── TranslationStatusColumn.types.ts  # Component-specific types
```

### Props Interface

```typescript
// TranslationStatusColumn.types.ts
import { SupportedLocale } from '@/lib/i18n/config';

export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual' | 'missing';

export type EntityType = 'article' | 'item' | 'link';

export interface TranslationStatusMap {
  [K in SupportedLocale]?: TranslationStatus;
}

export interface TranslationStatusColumnProps {
  /** Entity type for the content item */
  entityType: EntityType;

  /** Unique identifier for the entity */
  entityId: string;

  /** Source language of the original content */
  sourceLanguage: SupportedLocale;

  /** Translation status for each language */
  translations: TranslationStatusMap;

  /** Callback when column is clicked - opens preview panel */
  onClick?: (entityType: EntityType, entityId: string) => void;

  /** Whether component is in loading state */
  isLoading?: boolean;

  /** Size variant */
  size?: 'small' | 'medium';

  /** Additional CSS classes */
  className?: string;

  /** Disable click interaction */
  disabled?: boolean;
}
```

### Visual Design Specification

Based on PRD and existing patterns:

| Status | Icon/Symbol | Color | Tailwind Class | Tooltip Text |
|--------|-------------|-------|----------------|--------------|
| Original (source) | `●` filled dot | Blue | `bg-blue-500` | "{Language}: Original" |
| Completed | `✓` checkmark | Green | `bg-green-500` | "{Language}: Translated" |
| Manual | `✎` pencil | Purple | `bg-violet-500` | "{Language}: Manually edited" |
| Pending | `○` hollow dot | Orange | `bg-amber-400` | "{Language}: Pending" |
| Processing | `◐` half | Orange animated | `bg-amber-400 animate-pulse` | "{Language}: Translating..." |
| Failed | `✕` X | Red | `bg-red-500` | "{Language}: Failed" |
| Missing | `○` hollow dot | Gray | `bg-gray-300` | "{Language}: Not translated" |

### Data Flow

```
ItemRow/ItemGrid (parent)
    │
    ├── Fetches item data including translations
    │
    └── Renders TranslationStatusColumn
            │
            ├── Receives: entityType, entityId, sourceLanguage, translations
            │
            ├── Renders: 6 status dots (one per supported locale)
            │
            └── onClick → Calls parent callback → Opens TranslationPreviewPanel
```

---

## 6. Implementation Tasks

### Task 1: Create Types File (0.5 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts`

- Define `TranslationStatus` union type
- Define `EntityType` union type
- Define `TranslationStatusMap` interface
- Define `TranslationStatusColumnProps` interface
- Export all types

### Task 2: Create Index Export File (0.25 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`

- Export component and types
- Follow existing barrel export pattern

### Task 3: Create Base Component Structure (1 story point)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Create functional component with proper JSDoc documentation
- Implement horizontal flex layout for 6 indicators
- Add fixed width constraint (~80-96px) for table column consistency
- Import locales array from `/src/lib/i18n/config.ts`
- Map over all 6 supported locales to render indicators

### Task 4: Implement Status Visual Mapping (1 story point)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Create `getStatusStyles()` helper function
- Map each status to appropriate Tailwind classes (bg color, border)
- Handle source language indicator (blue dot)
- Apply consistent sizing (w-3 h-3 for small, w-4 h-4 for medium)

### Task 5: Add Click Handler (0.5 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Add onClick wrapper for entire column
- Call `props.onClick(entityType, entityId)` when clicked
- Add `cursor-pointer` styling when onClick is provided
- Prevent click when disabled prop is true
- Add `role="button"` and keyboard accessibility

### Task 6: Implement Tooltips (0.5 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Add title attribute to each status dot
- Format: "{Language Name}: {Status}"
- Use localeMetadata from i18n config for language names
- Consider Radix Tooltip for enhanced UX (optional enhancement)

### Task 7: Add Loading State (0.5 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Render skeleton dots when `isLoading` is true
- Use `animate-pulse` with gray background
- Maintain same layout dimensions as loaded state

### Task 8: Add Accessibility Features (0.5 story points)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

- Add comprehensive `aria-label` describing overall status
- Add `role="group"` with `aria-label="Translation status"`
- Ensure color is not the only indicator (use shape + tooltip)
- Support keyboard navigation (tabIndex, onKeyDown for Enter/Space)

### Task 9: Update Parent Barrel Export (0.25 story points)
**File:** `/src/components/TranslationManagement/index.ts`

- Add export for `TranslationStatusColumn`
- Add export for types from TranslationStatusColumn.types

### Task 10: Update Shared Types (if needed) (0.25 story points)
**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`

- Ensure `TranslationStatus` type is consistent across components
- Add any shared utility types

---

## 7. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Module barrel export |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Main component implementation |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | TypeScript type definitions |

### Files to Modify

| File Path | Changes | Reason |
|-----------|---------|--------|
| `/src/components/TranslationManagement/index.ts` | Add export for TranslationStatusColumn | Public API exposure |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add shared types if needed | Type consistency |

### Files to Reference (Read-Only)

| File Path | Information Needed |
|-----------|-------------------|
| `/src/lib/i18n/config.ts` | `locales`, `localeMetadata`, `SupportedLocale` type |
| `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type reference |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Pattern for dot/icon variants |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Pattern for compact visual indicators |
| `/src/components/ItemManager/components/ItemRow.tsx` | Integration pattern for table columns |

---

## 8. Integration Points

### How This Component Will Be Used

```tsx
// In ItemRow.tsx or similar table component
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// Usage in table column
<TranslationStatusColumn
  entityType="item"
  entityId={item.id}
  sourceLanguage={item.sourceLanguage || 'en'}
  translations={{
    en: 'completed',
    fr: 'completed',
    es: 'pending',
    de: 'processing',
    nl: 'failed',
    it: 'missing'
  }}
  onClick={(type, id) => openTranslationPreview(type, id)}
  size="small"
/>
```

### Future Integration (Task 3.5 - Separate REQ)
This component will be integrated into:
- `/src/components/ItemManager/components/ItemGrid.tsx`
- `/src/components/ItemManager/components/ItemRow.tsx`
- `/src/app/dashboard2/translations/page.tsx`

---

## 9. Testing Requirements

### Unit Test Cases

1. **Rendering Tests**
   - Renders 6 status indicators
   - Applies correct color for each status type
   - Shows source language as blue
   - Renders loading skeleton when isLoading=true

2. **Interaction Tests**
   - Calls onClick with correct entityType and entityId
   - Does not call onClick when disabled
   - Keyboard Enter/Space triggers onClick

3. **Accessibility Tests**
   - Has appropriate aria-label
   - Tooltips contain language name and status
   - Focus states are visible

---

## 10. Dependencies

### Epic 1 Dependencies (Required)
- Translation tables exist: `item_translations`, `article_translations`, `link_translations`
- Translation status enum values defined

### Epic 3 Dependencies (Required for Real-Time)
- Translation trigger system for status updates
- Translation status tracking API

### Internal Dependencies
- `/src/lib/i18n/config.ts` - Locale configuration
- `/src/lib/utils.ts` - cn() utility for class merging

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation data for entity | Medium | Low | Default to 'missing' status for undefined languages |
| Performance with many rows | Low | Medium | Use memoization, minimize re-renders |
| Color accessibility | Medium | Medium | Use shapes + tooltips, not just color |
| Inconsistent sizing across browsers | Low | Low | Use explicit width/height classes |

---

## 12. Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Types file | 0.5 SP |
| Task 2: Index export | 0.25 SP |
| Task 3: Base component | 1 SP |
| Task 4: Status visuals | 1 SP |
| Task 5: Click handler | 0.5 SP |
| Task 6: Tooltips | 0.5 SP |
| Task 7: Loading state | 0.5 SP |
| Task 8: Accessibility | 0.5 SP |
| Task 9-10: Exports | 0.5 SP |
| **Total** | **5.25 SP** |

---

## 13. Definition of Done

- [ ] All new files created with proper TypeScript typing
- [ ] Component renders 6 language status indicators correctly
- [ ] Visual states match specification (colors, icons)
- [ ] Click handler opens preview panel callback works
- [ ] Loading state displays skeleton indicators
- [ ] Tooltips show language name and status
- [ ] Accessibility requirements met (aria-labels, keyboard nav)
- [ ] Exported from TranslationManagement module
- [ ] Code follows existing codebase patterns and conventions
- [ ] No TypeScript errors or warnings
- [ ] Build passes successfully

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Epic 1 PRD:** `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Pattern Reference:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
