# REQ-356: Implement Stale Translation Indicator - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-356
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.2
**Type:** ENHANCEMENT
**Size:** M (Medium)
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation - source_version_at columns), Epic 3 (Dynamic Content Translation), REQ-311 (TranslationStatusItem component)

---

## Summary

Enhance the `TranslationStatusItem` component to display visual stale translation warnings when manually edited translations have become outdated due to source content updates. The implementation adds a yellow warning indicator, distinct styling, and an "Update Translation" action button to help property owners identify and refresh outdated manual translations.

---

## User Story

As a **property owner maintaining manually edited translations**, I want to **see a clear visual indicator when my manual translations are outdated due to source content changes** so that I can **identify which translations need attention and quickly trigger re-translation to maintain consistency between source and translated content**.

---

## Background and Context

### Business Need

When property owners invest time in manually editing translations to improve quality, those translations can become outdated when the source content is subsequently modified. Without visual indicators, owners have no way to identify which manual translations are stale and may be presenting outdated information to international guests.

### Technical Context

- **Framework:** Next.js 15.5.9 with App Router
- **UI Library:** Tailwind CSS 4.x, Lucide React icons
- **Database:** Translation tables include:
  - `translation_status` column with `'manual'` value for manually edited translations
  - `source_version_at` column (to be added via migration REQ-339) tracking source content version
  - `updated_at` column tracking when translation was last modified
- **Stale Detection Logic:** A translation is stale when:
  - `translation_status = 'manual'` (manually edited)
  - `source_version_at > updated_at` (source was modified after the manual edit)

### Visual Design Reference (from PRD)

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Stale | `AlertTriangle` / `⚠️` | Yellow | `text-yellow-500` (#EAB308) |

**Stale Row Visual:**
```
┌─────────────────────────────────────────────────────────────────┐
│ DE Deutsch ✎ Manual ⚠️ Stale              [Update] [Edit] [↻]   │
│    Wie man die Spulmaschine benutzt                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | TranslationStatusItem component detects stale status based on source_version_at timestamp being later than the manual edit timestamp | Unit test with mock data |
| AC-2 | Stale translations display a yellow warning icon (AlertTriangle) adjacent to the translation status indicator | Visual inspection |
| AC-3 | Stale translation items show a yellow border or subtle yellow background tint distinct from other status states | Visual inspection |
| AC-4 | "Update Translation" action button appears within stale translation items | Visual inspection |
| AC-5 | Clicking "Update Translation" triggers the re-translation API endpoint for that specific content and language | Click handler verification |
| AC-6 | Tooltip or hover state on the stale indicator explains why the translation is marked as stale | Hover interaction test |
| AC-7 | Stale indicator only appears when is_manually_edited flag is true AND source content has been updated | Conditional rendering test |
| AC-8 | Automatically translated content (not manually edited) does not show stale warnings even when source content changes | Negative test verification |
| AC-9 | Stale indicator styling is visually distinct from error, pending, and missing states | Visual inspection |
| AC-10 | After re-translation completes, the stale indicator disappears and status returns to completed | Integration test |
| AC-11 | Component handles loading state appropriately while re-translation is processing | Visual inspection |
| AC-12 | Stale state is accessible with appropriate ARIA attributes describing the warning condition | Accessibility audit |

---

## Technical Approach

### Architecture Overview

This enhancement modifies the existing `TranslationStatusItem` component (REQ-311) to add stale detection and visualization. The component receives staleness data as props from the parent `TranslationPreviewPanel`.

```
TranslationPreviewPanel/
├── index.ts                          # Public exports
├── TranslationPreviewPanel.tsx       # Parent - calculates isStale
├── TranslationPreviewPanel.types.ts  # Panel types
├── TranslationStatusItem.tsx         # MODIFY: Add stale indicator
└── TranslationProgressBar.tsx        # Progress indicator
```

### Stale Detection Logic

Staleness is determined by the parent component and passed as a prop:

```typescript
// In TranslationPreviewPanel - stale calculation
const isStale = (translation: TranslationRecord): boolean => {
  // Only manual translations can be stale
  if (translation.translation_status !== 'manual') {
    return false;
  }

  // Check if source was updated after the manual edit
  if (!translation.source_version_at || !translation.updated_at) {
    return false;
  }

  const sourceVersionDate = new Date(translation.source_version_at);
  const translationUpdatedDate = new Date(translation.updated_at);

  return sourceVersionDate > translationUpdatedDate;
};
```

### Component Props Extension

Extend `TranslationStatusItemProps` to include stale-related props:

```typescript
export interface TranslationStatusItemProps {
  // ... existing props from REQ-311 ...

  /** Language code */
  language: SupportedLanguage;

  /** Display name for the language (native form) */
  languageName: string;

  /** Current translation status */
  status: TranslationStatusType;

  /** Preview text of the translated content */
  previewText?: string;

  /** Timestamp when translation was completed */
  translatedAt?: string;

  /** Whether the translation is stale (source content updated after manual edit) */
  isStale?: boolean;

  /** Timestamp when source content was last modified (for tooltip) */
  sourceVersionAt?: string;

  /** User ID who manually reviewed/edited the translation */
  reviewedBy?: string;

  /** Handler for edit action */
  onEdit?: () => void;

  /** Handler for re-translate action */
  onRetranslate?: () => void;

  /** Handler for retry action (failed translations only) */
  onRetry?: () => void;

  /** NEW: Handler for update stale translation action */
  onUpdateTranslation?: () => void;

  /** Whether actions are currently loading/disabled */
  isActionLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### Visual Implementation

#### Stale Styling Configuration

Add stale configuration to the existing STATUS_CONFIG:

```typescript
// Stale indicator configuration (separate from status)
const STALE_CONFIG = {
  icon: AlertTriangle,
  colorClasses: 'text-yellow-500',
  bgClasses: 'bg-yellow-50 border-yellow-200',
  label: 'Stale',
  description: 'Source content has been updated since this translation was manually edited',
};
```

#### Row Styling with Stale State

```typescript
// Row container with stale border styling
const rowStyles = cn(
  // Base styles
  'flex flex-col gap-1 p-3 rounded-lg',
  'border',
  'transition-colors',
  // Hover state
  'hover:bg-gray-50',
  // Focus state
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
  // Stale-specific styling
  isStale && status === 'manual' && 'border-yellow-300 bg-yellow-50/50',
  // Default border when not stale
  !isStale && 'border-gray-100'
);
```

#### Stale Badge Implementation

```tsx
// Stale indicator badge (inline with status badge)
{isStale && status === 'manual' && (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
      'text-xs font-medium',
      'bg-yellow-100 text-yellow-700 border border-yellow-300',
      'ml-2'
    )}
    title={STALE_CONFIG.description}
    role="status"
    aria-label="Translation is stale - source content has been updated"
  >
    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
    {STALE_CONFIG.label}
  </span>
)}
```

#### Update Translation Button

```tsx
// Update Translation button for stale manual translations
{isStale && status === 'manual' && onUpdateTranslation && (
  <button
    onClick={onUpdateTranslation}
    disabled={isActionLoading}
    className={cn(
      'inline-flex items-center justify-center gap-1',
      'px-3 py-1',
      'min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-[32px]',
      'rounded-md text-white',
      'bg-yellow-500 hover:bg-yellow-600',
      'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'text-xs font-medium',
      'transition-colors'
    )}
    aria-label={`Update ${languageName} translation with current source content`}
  >
    {isActionLoading ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : (
      <RefreshCw className="w-3 h-3" />
    )}
    Update
  </button>
)}
```

### Tooltip Implementation

Add hover tooltip explaining staleness:

```tsx
// Tooltip wrapper for stale badge
<div className="relative group">
  <span className={staleIndicatorClasses}>
    <AlertTriangle className="w-3 h-3" />
    Stale
  </span>
  {/* Tooltip */}
  <div
    className={cn(
      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
      'px-3 py-2 rounded-lg',
      'bg-gray-900 text-white text-xs',
      'opacity-0 group-hover:opacity-100',
      'transition-opacity duration-200',
      'pointer-events-none',
      'whitespace-nowrap z-10',
      'shadow-lg'
    )}
    role="tooltip"
  >
    Source content updated since manual edit
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
      <div className="border-4 border-transparent border-t-gray-900" />
    </div>
  </div>
</div>
```

---

## Implementation Tasks

### Task 1: Add stale styling configuration (15 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add `STALE_CONFIG` constant with icon, colors, label, and description
2. Import `AlertTriangle`, `RefreshCw` icons from lucide-react
3. Add CSS variables or constants for stale-specific colors

### Task 2: Update row container styling (20 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Modify `rowStyles` to conditionally apply yellow border when stale
2. Add subtle yellow background tint (`bg-yellow-50/50`)
3. Ensure stale styling coexists with manual status styling
4. Verify visual distinction from error, pending, and other states

### Task 3: Implement stale indicator badge (30 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add conditional rendering for stale badge when `isStale && status === 'manual'`
2. Position badge adjacent to status indicator (after "Manual" badge)
3. Include AlertTriangle icon with yellow coloring
4. Add `role="status"` and `aria-label` for accessibility
5. Implement tooltip on hover explaining staleness reason

### Task 4: Implement "Update Translation" action button (30 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add `onUpdateTranslation` prop to interface
2. Conditionally render "Update" button when stale
3. Use yellow styling to match stale indicator theme
4. Handle loading state with spinner
5. Add proper ARIA label describing the action
6. Ensure 48px touch target on mobile

### Task 5: Update props interface and add types (15 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add `isStale?: boolean` prop (if not already present)
2. Add `sourceVersionAt?: string` prop for tooltip date display
3. Add `onUpdateTranslation?: () => void` prop
4. Update JSDoc comments for new props

### Task 6: Add accessibility attributes (15 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

1. Add `aria-label` to stale badge explaining condition
2. Add `role="status"` to stale indicator for screen reader announcements
3. Add screen reader-only text for stale state
4. Ensure tooltip content is accessible (title attribute + visible tooltip)

### Task 7: Update TranslationPreviewPanel integration (20 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

1. Calculate `isStale` for each translation based on timestamps
2. Pass `isStale` prop to TranslationStatusItem
3. Implement `handleUpdateTranslation` callback
4. Call re-translate API for single language when Update clicked

### Task 8: Write unit tests (30 min)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.stale.test.tsx`

1. Test stale badge renders when `isStale=true` and `status='manual'`
2. Test stale badge does NOT render when `isStale=false`
3. Test stale badge does NOT render for non-manual statuses
4. Test yellow border appears on stale rows
5. Test "Update Translation" button renders for stale translations
6. Test "Update Translation" button calls callback on click
7. Test tooltip displays on hover
8. Test loading state disables Update button
9. Test accessibility attributes present

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add stale indicator, yellow styling, Update button | `TranslationStatusItem` component, `rowStyles`, action buttons section |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Calculate isStale, pass to child, implement update handler | `TranslationPreviewPanel` component, translation mapping logic |

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.stale.test.tsx` | Unit tests for stale indicator functionality |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types (SupportedLanguage, TranslationStatusType) |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Badge styling patterns |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | UI Visual Specifications |
| `/docs/REQ-311-create-translationstatusitem-component-overview.md` | Base component specification |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| TranslationStatusItem component | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Base component to enhance (REQ-311) |
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | SupportedLanguage, TranslationStatusType |
| cn utility | `/src/lib/utils.ts` | Class name composition |
| Re-translate API | `/src/app/api/translations/retranslate/route.ts` | Trigger translation update (REQ-338) |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `lucide-react` | (existing) | Icons (AlertTriangle, RefreshCw, Loader2) |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation tables with `translation_status`, `updated_at` columns |
| REQ-339 | Required | `source_version_at` columns must exist for stale detection |
| REQ-311 | Required | Base TranslationStatusItem component must exist |
| REQ-338 | Required | Re-translate API endpoint for Update button action |

---

## Database Schema Reference

### Translation Tables (from Epic 1)

```sql
-- Columns used for stale detection:
-- article_translations, item_translations, link_translations

translation_status VARCHAR NOT NULL DEFAULT 'pending'
  CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual'))
  -- 'manual' indicates human-edited translation

updated_at TIMESTAMPTZ DEFAULT NOW()
  -- When translation was last modified

-- Added by REQ-339:
source_version_at TIMESTAMPTZ
  -- When source content was last modified (populated on source update)
```

### Stale Detection Query

```sql
-- Find stale manual translations
SELECT * FROM article_translations
WHERE translation_status = 'manual'
  AND source_version_at > updated_at;
```

---

## Visual Design Specifications

### Stale Row States

| State | Border | Background | Badge | Actions |
|-------|--------|------------|-------|---------|
| Manual (current) | `border-violet-200` | `bg-violet-50` | Purple "Manual" | Edit, Re-translate |
| Manual + Stale | `border-yellow-300` | `bg-yellow-50/50` | Purple "Manual" + Yellow "Stale" | Update, Edit, Re-translate |
| Completed | `border-green-200` | `bg-green-50` | Green "Completed" | Edit, Re-translate |
| Failed | `border-red-200` | `bg-red-50` | Red "Failed" | Retry |

### Stale Indicator Dimensions

| Element | Desktop | Mobile |
|---------|---------|--------|
| Stale badge height | 20px | 24px |
| Badge icon size | 12px (w-3) | 12px |
| Update button min-height | 32px | 48px |
| Tooltip width | auto (whitespace-nowrap) | max-w-[200px] |

### Color Values

| Element | Tailwind Class | Hex Value |
|---------|----------------|-----------|
| Stale icon | `text-yellow-500` | #EAB308 |
| Stale badge background | `bg-yellow-100` | #FEF9C3 |
| Stale badge border | `border-yellow-300` | #FDE047 |
| Stale badge text | `text-yellow-700` | #A16207 |
| Row border (stale) | `border-yellow-300` | #FDE047 |
| Row background (stale) | `bg-yellow-50/50` | #FEFCE8 (50% opacity) |
| Update button bg | `bg-yellow-500` | #EAB308 |
| Update button hover | `bg-yellow-600` | #CA8A04 |

---

## Testing Considerations

### Unit Tests

- Stale badge renders only for manual translations with `isStale=true`
- Stale badge does not render for non-manual statuses
- Stale badge does not render when `isStale=false`
- Yellow border applies when stale
- Update button renders for stale translations
- Update button fires `onUpdateTranslation` callback
- Loading state disables Update button
- Tooltip appears on hover (mouse events)
- ARIA attributes present for accessibility

### Integration Tests (Future)

- Stale detection calculates correctly from timestamp comparison
- Update button triggers re-translate API call
- After successful re-translation, stale indicator disappears
- Real-time subscription updates stale state when translation completes

### Manual Testing Checklist

- [ ] Stale badge displays with yellow AlertTriangle icon
- [ ] Badge positioned adjacent to "Manual" status badge
- [ ] Tooltip displays on hover: "Source content updated since manual edit"
- [ ] Yellow border visible around stale row
- [ ] Yellow background tint distinguishes from other states
- [ ] Update button uses yellow color scheme
- [ ] Update button shows loading spinner during action
- [ ] Update button disabled during loading
- [ ] Button touch targets meet 48px minimum on mobile
- [ ] Screen reader announces stale status
- [ ] Keyboard focus visible on Update button
- [ ] Non-manual translations never show stale indicator

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-339 (source_version_at) not complete | Medium | High | Add null checks, gracefully handle missing column |
| TranslationStatusItem (REQ-311) incomplete | Medium | High | Coordinate with dependent task, stub if needed |
| Yellow conflicts with amber/orange pending state | Low | Medium | Use distinct shades (yellow-500 vs amber-500) |
| Tooltip inaccessible on touch devices | Medium | Low | Use title attribute as fallback, consider tap interaction |
| Stale detection race conditions | Low | Medium | Use database timestamps, not client-side calculations |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 5, Task 5.2)
- **Base Component Spec:** `/docs/REQ-311-create-translationstatusitem-component-overview.md`
- **Related Dialog:** `/docs/REQ-355-create-manualeditwarningdialog-component-overview.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-356)
- **TagChip Reference:** `/src/components/ItemManager/components/shared/TagChip.tsx`

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Add stale styling configuration | 15 min |
| Task 2: Update row container styling | 20 min |
| Task 3: Implement stale indicator badge | 30 min |
| Task 4: Implement "Update Translation" button | 30 min |
| Task 5: Update props interface | 15 min |
| Task 6: Add accessibility attributes | 15 min |
| Task 7: Update TranslationPreviewPanel integration | 20 min |
| Task 8: Write unit tests | 30 min |
| **Total** | **~3 hours** |

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
