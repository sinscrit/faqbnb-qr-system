# REQ-317: Create TranslationStatusColumn Component - Implementation Overview

**Document Version:** 1.0
**Created:** 2026-01-18 12:30 UTC
**Last Modified:** 2026-01-18 12:30 UTC
**Request Reference:** Epic 5, Phase 3, Task 3.2
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## 1. Summary

This document provides a technical implementation breakdown for creating the `TranslationStatusColumn` component. This component displays a compact, scannable indicator showing translation status across all six supported languages within table columns. Property owners can quickly assess translation coverage for content items and click to open the detailed `TranslationPreviewPanel`.

**Key Features:**
- Six small dot/icon indicators representing each supported language
- Color-coded status indicators (green/complete, orange/pending, red/failed, gray/not started, purple/manual)
- Hover tooltips showing language name and status
- Clickable to open TranslationPreviewPanel for detailed view
- Compact design suitable for table cells
- Full keyboard accessibility support

---

## 2. Requirements Analysis

### 2.1 Functional Requirements (from REQ-317)

| Requirement | Description |
|-------------|-------------|
| FR-1 | Display exactly six indicators representing each supported language |
| FR-2 | Use color coding: green (complete), orange (pending), red (failed), gray (not started), purple (manually edited) |
| FR-3 | Indicators must fit comfortably within table column without wrapping |
| FR-4 | Hover tooltip shows language name and status |
| FR-5 | Click opens TranslationPreviewPanel for the content item |
| FR-6 | Accept translation status data as prop (status for each language) |
| FR-7 | Handle missing or incomplete translation data gracefully |

### 2.2 Non-Functional Requirements

| Requirement | Description |
|-------------|-------------|
| NFR-1 | Maintain consistent alignment/spacing in table rows with varying heights |
| NFR-2 | Keyboard accessible (activate preview panel via keyboard) |
| NFR-3 | Appropriate ARIA labels for screen readers |
| NFR-4 | Visual indicators remain legible at typical table cell sizes |
| NFR-5 | Follow existing ItemManager component patterns |

### 2.3 Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Epic 1 Foundation | Required | Translation tables must exist |
| Epic 3 Translation Status API | Required | `GET /api/translations/status` endpoint |
| TranslationPreviewPanel (REQ-310) | Required | Component must be implemented |
| TranslationManagement.types.ts (REQ-309) | Required | Type definitions must exist |
| Radix UI Tooltip (optional) | Optional | For hover tooltips |

---

## 3. Technical Design

### 3.1 Component Architecture

```
/src/components/TranslationManagement/TranslationStatusColumn/
├── index.ts                           # Public exports
├── TranslationStatusColumn.tsx        # Main component
└── TranslationStatusColumn.types.ts   # Component-specific types (optional)
```

### 3.2 Type Definitions

```typescript
// In TranslationManagement.types.ts or component-local

/**
 * Supported languages for translation (from Epic 1)
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status enum values
 */
export type TranslationStatusValue =
  | 'completed'    // Translation finished successfully
  | 'pending'      // Translation queued but not started
  | 'processing'   // Translation in progress
  | 'failed'       // Translation encountered errors
  | 'manual'       // Manually edited by owner
  | 'not_started'; // No translation exists

/**
 * Per-language translation status
 */
export interface LanguageTranslationStatus {
  status: TranslationStatusValue;
  isStale?: boolean;
  translatedAt?: string;
}

/**
 * Translation status map for all languages
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;

/**
 * Props for TranslationStatusColumn component
 */
export interface TranslationStatusColumnProps {
  /** Entity type being displayed */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for opening preview panel */
  entityId: string;

  /** Entity name/title for display in preview panel */
  entityName: string;

  /** Source language of the content */
  sourceLanguage: SupportedLanguage;

  /** Translation status for each language */
  translations: TranslationStatusMap;

  /** Callback when component is clicked to open preview panel */
  onOpenPreview?: (entityType: string, entityId: string) => void;

  /** Whether the component is loading */
  loading?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### 3.3 Visual Design

```
┌──────────────────────────────────────┐
│ Translation Status Column (w-24)     │
├──────────────────────────────────────┤
│  ● ● ● ○ ● ●   (6 dots in a row)    │
│  EN FR ES DE NL IT                   │
│                                      │
│  Color Legend:                       │
│  ● green  = completed                │
│  ● orange = pending/processing       │
│  ● red    = failed                   │
│  ○ gray   = not started              │
│  ● purple = manual edit              │
│  ● blue   = source (original)        │
└──────────────────────────────────────┘

Hover Tooltip Example:
┌─────────────────────┐
│ French              │
│ Status: Completed   │
│ Updated: Jan 15     │
└─────────────────────┘
```

### 3.4 Status Color Mapping

| Status | Tailwind Class | Hex Color | Icon |
|--------|---------------|-----------|------|
| Source (original) | `text-blue-500` | #3B82F6 | `●` |
| Completed | `text-green-500` | #22C55E | `●` |
| Manual | `text-violet-500` | #8B5CF6 | `●` |
| Pending/Processing | `text-amber-500` | #F59E0B | `●` |
| Failed | `text-red-500` | #EF4444 | `●` |
| Not Started | `text-gray-300` | #D1D5DB | `○` |

### 3.5 Language Configuration

```typescript
export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  name: string;
  flag: string;
}> = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];
```

---

## 4. Implementation Tasks

### Task 1: Create Type Definitions (S)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts`

**Subtasks:**
1. Define `TranslationStatusColumnProps` interface
2. Import shared types from `TranslationManagement.types.ts`
3. Add JSDoc comments for all exported types

**Acceptance Criteria:**
- [ ] All props defined with proper TypeScript types
- [ ] JSDoc comments explain each prop's purpose
- [ ] Types align with existing TranslationManagement type definitions

---

### Task 2: Create Constants and Utilities (S)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Subtasks:**
1. Define `SUPPORTED_LANGUAGES` constant with language codes, names, and flags
2. Create `getStatusColor` utility function mapping status to Tailwind classes
3. Create `getStatusLabel` utility function for tooltip/aria text
4. Create `getStatusIcon` utility to return filled or outline circle

**Acceptance Criteria:**
- [ ] All six languages defined with correct codes
- [ ] Color mapping matches PRD specification
- [ ] Utility functions handle all status values

---

### Task 3: Implement Main Component (M)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Subtasks:**
1. Create component structure following ItemManager patterns
2. Render six language indicators in a flex row
3. Apply status colors based on translation data
4. Handle source language indicator (blue color)
5. Add loading state (skeleton dots)
6. Handle missing translation data (default to not_started)

**Pattern Reference:**
- Follow `TagChip` component structure for small indicators
- Use `cn` utility from `@/lib/utils` for class merging
- Match ItemRow column sizing patterns

**Acceptance Criteria:**
- [ ] Six indicators render correctly
- [ ] Colors match status accurately
- [ ] Source language identified correctly
- [ ] Loading state displays skeleton
- [ ] Missing data handled gracefully

---

### Task 4: Add Hover Tooltips (M)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Subtasks:**
1. Implement tooltip using native CSS `:hover` + `title` attribute (simplest)
   - OR use Radix UI Tooltip if already imported elsewhere
2. Show language name and status on hover
3. Show "Updated: [date]" if available
4. Ensure tooltip doesn't overflow viewport

**Implementation Options:**
```tsx
// Option A: Native title attribute (simplest)
<span
  title={`${language.name}: ${getStatusLabel(status)}`}
  className={cn(...)}
/>

// Option B: Radix Tooltip (if available)
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <span className={cn(...)} />
  </Tooltip.Trigger>
  <Tooltip.Content>
    {language.name}: {getStatusLabel(status)}
  </Tooltip.Content>
</Tooltip.Root>
```

**Recommendation:** Start with native `title` attribute for simplicity. Upgrade to Radix Tooltip later if richer styling needed.

**Acceptance Criteria:**
- [ ] Tooltip appears on hover for each indicator
- [ ] Tooltip shows language name and status
- [ ] Tooltip shows update date if available
- [ ] No viewport overflow issues

---

### Task 5: Implement Click Handler (S)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Subtasks:**
1. Add onClick handler to container element
2. Call `onOpenPreview` callback with entity info
3. Prevent event propagation (avoid triggering row click)
4. Add visual click feedback (hover state change)

**Acceptance Criteria:**
- [ ] Click triggers onOpenPreview callback
- [ ] Event propagation stopped correctly
- [ ] Visual feedback on hover/click
- [ ] Works correctly in table row context

---

### Task 6: Add Accessibility Features (S)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Subtasks:**
1. Add `role="button"` to clickable container
2. Add `tabIndex={0}` for keyboard focus
3. Handle Enter/Space key for activation
4. Add comprehensive `aria-label` describing translation status
5. Add `aria-describedby` for detailed status breakdown

**Accessibility Patterns (from ItemRow):**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Translation status for ${entityName}. ${completedCount} of ${totalCount} languages complete. Click to view details.`}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  }}
/>
```

**Acceptance Criteria:**
- [ ] Component focusable via keyboard
- [ ] Enter/Space activates click handler
- [ ] ARIA label describes current status
- [ ] Screen reader announces status correctly

---

### Task 7: Create Index Export (XS)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`

**Subtasks:**
1. Export component and types
2. Ensure named exports for tree-shaking

```typescript
export { TranslationStatusColumn } from './TranslationStatusColumn';
export type { TranslationStatusColumnProps } from './TranslationStatusColumn.types';
```

**Acceptance Criteria:**
- [ ] Component exportable from index
- [ ] Types exportable from index

---

### Task 8: Update Parent Index (XS)

**File:** `/src/components/TranslationManagement/index.ts`

**Subtasks:**
1. Add export for TranslationStatusColumn
2. Ensure consistent export pattern with other components

```typescript
export * from './TranslationStatusColumn';
```

**Acceptance Criteria:**
- [ ] Component accessible from parent index
- [ ] No circular dependency issues

---

## 5. Integration Points

### 5.1 Integration with ItemList Component

**File to Modify:** `/src/components/ItemManager/components/ItemList.tsx`

The TranslationStatusColumn will be integrated as an optional column in the ItemList component. This integration is covered in a separate task (Task 3.5 per the implementation plan).

**Integration Pattern:**
```tsx
// In ItemList.tsx header row
{columnVisibility?.translationStatus && (
  <div role="columnheader" className="hidden lg:block w-24 flex-shrink-0">
    Translations
  </div>
)}

// In ItemRow.tsx data row
{showTranslationColumn && (
  <TranslationStatusColumn
    entityType="item"
    entityId={item.id}
    entityName={item.title}
    sourceLanguage={item.sourceLanguage || 'en'}
    translations={item.translations || {}}
    onOpenPreview={onOpenTranslationPreview}
  />
)}
```

### 5.2 Integration with TranslationPreviewPanel

The `onOpenPreview` callback should trigger the TranslationPreviewPanel to open. This requires the parent component to manage panel state.

**State Management Pattern:**
```tsx
// In parent component (e.g., ItemManager or items page)
const [previewState, setPreviewState] = useState<{
  isOpen: boolean;
  entityType: string;
  entityId: string;
} | null>(null);

const handleOpenTranslationPreview = (entityType: string, entityId: string) => {
  setPreviewState({ isOpen: true, entityType, entityId });
};
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Public exports |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Main component |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | Type definitions (optional, can use parent types) |

### 6.2 Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Add export for TranslationStatusColumn |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add/verify translation status types if not already present |

### 6.3 Files NOT to Modify (Separate Tasks)

| File Path | Reason |
|-----------|--------|
| `/src/components/ItemManager/components/ItemList.tsx` | Integration is Task 3.5 |
| `/src/components/ItemManager/components/ItemRow.tsx` | Integration is Task 3.5 |
| `/src/app/dashboard2/items/page.tsx` | Integration is Task 3.5 |

---

## 7. Testing Considerations

### 7.1 Unit Test Cases

1. **Rendering Tests**
   - Renders six indicators for all languages
   - Applies correct color classes based on status
   - Identifies source language correctly
   - Handles loading state
   - Handles empty/missing translation data

2. **Interaction Tests**
   - Click triggers onOpenPreview callback
   - Keyboard navigation works (Tab, Enter, Space)
   - Event propagation is stopped

3. **Accessibility Tests**
   - Has correct ARIA attributes
   - Focusable via keyboard
   - Screen reader announces status

### 7.2 Test File Location

```
/src/components/TranslationManagement/TranslationStatusColumn/__tests__/
└── TranslationStatusColumn.test.tsx
```

---

## 8. Example Usage

```tsx
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// In a table row
<TranslationStatusColumn
  entityType="article"
  entityId="article-123"
  entityName="How to Use the Dishwasher"
  sourceLanguage="en"
  translations={{
    en: { status: 'completed' },
    fr: { status: 'completed', translatedAt: '2026-01-15T10:30:00Z' },
    es: { status: 'pending' },
    de: { status: 'failed' },
    nl: { status: 'manual', translatedAt: '2026-01-14T08:00:00Z' },
    // it: undefined (not_started)
  }}
  onOpenPreview={(type, id) => openTranslationPanel(type, id)}
/>
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel not ready | Medium | High | Implement component without panel integration; add callback that can be connected later |
| Type definitions not available | Low | Medium | Define local types if TranslationManagement.types.ts doesn't exist yet |
| Column width constraints | Low | Low | Use compact dot indicators; test in narrow viewport |
| Tooltip usability on touch devices | Medium | Low | Native title attribute works; tap-to-preview is primary action |

---

## 10. Open Questions

1. **Radix Tooltip:** Should we use Radix UI Tooltip for richer tooltip styling, or is native `title` attribute sufficient?
   - *Recommendation:* Start with native `title`; upgrade later if needed

2. **Stale Indicator:** Should stale translations have a distinct visual treatment (e.g., yellow border)?
   - *Recommendation:* Defer to Task 5.2 (stale translation indicator task)

3. **Click vs Double-Click:** Should single click open preview, or should we require a double-click to avoid accidental opens?
   - *Recommendation:* Single click aligns with existing patterns in ItemManager

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-317)
- **Component Pattern Reference:** `/src/components/ItemManager/components/shared/TagChip.tsx`
- **Row Pattern Reference:** `/src/components/ItemManager/components/ItemRow.tsx`
- **Types Reference:** `/src/components/ItemManager/ItemManager.types.ts`
- **Radix UI Dialog Patterns:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`

---

*Document prepared for FAQBNB Localization Epic 5 - Owner Translation Management*
