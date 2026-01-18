# REQ-325: Implement Stale Translation Indicator - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-325
**Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.2
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** REQ-309 (TranslationManagement types), REQ-311 (TranslationStatusItem component)

---

## Summary

Enhance the TranslationStatusItem component to display a visual stale warning indicator when source content has been updated after a manual translation edit. The indicator uses a yellow color scheme with a dedicated "Update Translation" action button, helping property owners identify outdated translations that may need attention.

---

## User Story

As a **property owner who has manually edited translations**, I want to **see a clear visual indicator when my manual translations become stale due to source content updates** so that I can **quickly identify which translations need review and take action to update them**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | TranslationStatusItem displays a yellow stale warning icon when `isStale` is true | Visual inspection with test data |
| AC-2 | Stale translations have a yellow border/indicator distinguishing them from other statuses | Visual inspection |
| AC-3 | "Update Translation" action button appears for stale manual translations | Visual inspection |
| AC-4 | Stale indicator appears alongside the existing status badge (not replacing it) | Visual inspection |
| AC-5 | Stale warning icon uses `AlertTriangle` from lucide-react with `text-yellow-500` color | Code review |
| AC-6 | Stale status has appropriate ARIA labels for screen reader accessibility | WCAG 2.1 AA testing |
| AC-7 | Clicking "Update Translation" button triggers the `onRetranslate` callback | Click handler verification |
| AC-8 | Stale indicator only appears when both `isStale=true` AND `status='manual'` | Conditional rendering verification |

---

## Technical Approach

### Architecture Overview

This task enhances the existing TranslationStatusItem component (REQ-311) by adding stale translation detection and visual feedback. The changes are localized to the component and follow established patterns from DuplicateNameWarning and EngagementIndicator.

```
TranslationPreviewPanel/
├── index.ts
├── TranslationPreviewPanel.tsx
├── TranslationPreviewPanel.types.ts
├── TranslationStatusItem.tsx     # MODIFY: Add stale indicator
└── TranslationProgressBar.tsx
```

### Visual Design

The stale indicator follows the PRD specification and matches existing warning patterns:

**Color Scheme (from PRD):**
- Stale: `text-yellow-500` (#EAB308)
- Background: `bg-yellow-50`
- Border: `border-yellow-200`

**Layout with Stale Indicator:**
```
┌─────────────────────────────────────────────────────────────────┐
│ DE Deutsch ✎ Manual ⚠️ Stale                    [Update] [Edit] │
│    Wie man die Spulmaschine benutzt                            │
└─────────────────────────────────────────────────────────────────┘
```

**Stale Badge Styling:**
```tsx
// Stale warning badge - positioned after status badge
<span className={cn(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
  'bg-yellow-50 text-yellow-700 border border-yellow-200'
)}>
  <AlertTriangle className="w-3 h-3 text-yellow-500" />
  Stale
</span>
```

### Stale Detection Logic

A translation is considered "stale" when:
1. The translation has been manually edited (`status === 'manual'`)
2. The source content has been modified after the translation was created
3. The `isStale` prop is `true` (computed by parent based on `source_version_at` timestamp comparison)

```typescript
// Stale indicator should only show for manual edits
const showStaleIndicator = status === 'manual' && isStale;
```

### Action Button Logic

The "Update Translation" button replaces or supplements the standard action buttons for stale translations:

| Status | isStale | Visible Buttons |
|--------|---------|-----------------|
| manual | false | Edit, Re-translate |
| manual | true | **Update Translation**, Edit |
| completed | false | Edit, Re-translate |
| failed | - | Retry |
| pending/processing | - | None |

**"Update Translation" Button:**
- Triggers `onRetranslate` callback (same as re-translate)
- Uses amber/yellow styling to match stale indicator
- Positioned as primary action when stale

```tsx
{showStaleIndicator && (
  <button
    onClick={onRetranslate}
    className={cn(
      'inline-flex items-center gap-1 px-3 py-1.5',
      'min-h-[44px] md:min-h-[32px]',
      'rounded-md text-xs font-medium',
      'bg-amber-100 text-amber-700 border border-amber-300',
      'hover:bg-amber-200',
      'focus:outline-none focus:ring-2 focus:ring-amber-500',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
    aria-label={`Update stale ${languageName} translation`}
    disabled={isActionLoading}
  >
    <RotateCcw className="w-3 h-3" />
    Update
  </button>
)}
```

### Row Container Enhancement

When a translation is stale, the row container receives additional visual emphasis:

```tsx
const rowStyles = cn(
  // Base styles
  'flex flex-col gap-1 p-3 rounded-lg',
  'border transition-colors',
  'hover:bg-gray-50',
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
  // Stale-specific styles
  showStaleIndicator
    ? 'border-yellow-200 bg-yellow-50/30'
    : 'border-gray-100'
);
```

### Accessibility Implementation

```tsx
<div
  role="listitem"
  aria-label={cn(
    `${languageConfig.nativeName} translation: ${statusConfig.label}`,
    showStaleIndicator && ', content is outdated and may need updating'
  )}
  className={rowStyles}
>
  {/* Screen reader announcement for stale state */}
  {showStaleIndicator && (
    <span className="sr-only" aria-live="polite">
      Warning: {languageName} translation is stale. Source content has been updated since this translation was last edited.
    </span>
  )}
  {/* ... rest of component */}
</div>
```

---

## Component Props Updates

The TranslationStatusItem component already includes `isStale` in its props interface (from REQ-311). No changes to the interface are needed:

```typescript
export interface TranslationStatusItemProps {
  language: SupportedLanguage;
  languageName: string;
  status: TranslationStatusType;
  previewText?: string;
  translatedAt?: string;
  isStale?: boolean;  // Already defined - used for stale indicator
  reviewedBy?: string;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  isActionLoading?: boolean;
  className?: string;
}
```

---

## Implementation Tasks

### Task 1: Add stale warning badge to TranslationStatusItem
**Effort:** S (30 min - 1 hour)

Add a conditional stale warning badge that appears after the status badge when `isStale` is true and status is `manual`.

**Implementation:**
```tsx
// Add after StatusBadge component
{showStaleIndicator && (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
      'text-xs font-medium',
      'bg-yellow-50 text-yellow-700 border border-yellow-200'
    )}
  >
    <AlertTriangle className="w-3 h-3 text-yellow-500" aria-hidden="true" />
    Stale
  </span>
)}
```

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

### Task 2: Implement "Update Translation" action button
**Effort:** S (30 min - 1 hour)

Add conditional "Update Translation" button that appears for stale manual translations as the primary action.

**Implementation:**
```tsx
// In action buttons section, add before Edit button
{showStaleIndicator && onRetranslate && (
  <button
    onClick={onRetranslate}
    disabled={isActionLoading}
    className={cn(
      'inline-flex items-center gap-1 px-3 py-1.5',
      'min-h-[44px] md:min-h-[32px]',
      'rounded-md text-xs font-medium',
      'bg-amber-100 text-amber-700 border border-amber-300',
      'hover:bg-amber-200',
      'focus:outline-none focus:ring-2 focus:ring-amber-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors'
    )}
    aria-label={`Update stale ${languageName} translation`}
  >
    <RotateCcw className="w-3 h-3" />
    Update
  </button>
)}
```

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

### Task 3: Add yellow border/background for stale rows
**Effort:** XS (15-30 min)

Update the row container styles to include a subtle yellow border and background tint when the translation is stale.

**Implementation:**
```tsx
// Update rowStyles calculation
const showStaleIndicator = status === 'manual' && isStale;

const rowStyles = cn(
  // Base styles
  'flex flex-col gap-1 p-3 rounded-lg',
  'border transition-colors',
  'hover:bg-gray-50',
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
  // Conditional stale styling
  showStaleIndicator
    ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50'
    : 'border-gray-100'
);
```

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

### Task 4: Add accessibility attributes for stale state
**Effort:** XS (15-30 min)

Ensure screen readers properly announce the stale state with appropriate ARIA labels.

**Implementation:**
```tsx
// Update ARIA label
aria-label={cn(
  `${languageConfig.nativeName} translation: ${statusConfig.label}`,
  showStaleIndicator && ', content is outdated and may need updating'
)}

// Add screen reader announcement
{showStaleIndicator && (
  <span className="sr-only" aria-live="polite">
    Warning: {languageName} translation is stale. Source content has been updated.
  </span>
)}
```

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

### Task 5: Import AlertTriangle icon (if not already imported)
**Effort:** XS (< 15 min)

Ensure the AlertTriangle icon is imported from lucide-react.

**Implementation:**
```tsx
// Update imports at top of file
import {
  CheckCircle,
  PencilLine,
  Clock,
  Loader2,
  XCircle,
  AlertTriangle,  // Add this
  Edit,
  RotateCcw
} from 'lucide-react';
```

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add stale warning badge, Update action button, Yellow border styling, Accessibility attributes | Import section, Component body, `rowStyles` calculation, Action buttons section |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | Warning indicator pattern with `AlertTriangle`, Tooltip implementation |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Color-coded status badge patterns, LEVEL_STYLES approach |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Status chip styling patterns |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | SupportedLanguage, TranslationStatusType definitions |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| TranslationStatusItem component | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Base component to enhance (REQ-311) |
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | TranslationStatusType, SupportedLanguage (REQ-309) |
| cn utility | `/src/lib/utils.ts` | Class name composition |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `lucide-react` | (existing) | AlertTriangle, RotateCcw icons |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| REQ-311 | Required | TranslationStatusItem must exist before this enhancement |
| REQ-309 | Required | Shared types file must be in place |
| REQ-307 | Recommended | `source_version_at` column enables stale detection |

---

## Visual Reference

### Status Row Variants

**Normal Manual Translation (not stale):**
```
┌─────────────────────────────────────────────────────────────────┐
│ FR Francais ✎ Manual                             [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
└─────────────────────────────────────────────────────────────────┘
```

**Stale Manual Translation:**
```
┌─────────────────────────────────────────────────────────────────┐
│ DE Deutsch ✎ Manual ⚠️ Stale              [Update] [Edit]       │  ← Yellow border
│    Wie man die Spulmaschine benutzt                            │
└─────────────────────────────────────────────────────────────────┘
```

**Stale Badge Detail:**
```
[ ⚠️ Stale ]
   │    │
   │    └── Yellow text (text-yellow-700)
   └─────── Yellow warning icon (text-yellow-500)
```

### Color Mapping (Tailwind Classes)

| Element | Class | Hex |
|---------|-------|-----|
| Stale icon | `text-yellow-500` | #EAB308 |
| Stale badge text | `text-yellow-700` | #A16207 |
| Stale badge background | `bg-yellow-50` | #FEFCE8 |
| Stale badge border | `border-yellow-200` | #FEF08A |
| Stale row border | `border-yellow-200` | #FEF08A |
| Stale row background | `bg-yellow-50/30` | rgba(254,252,232,0.3) |
| Update button background | `bg-amber-100` | #FEF3C7 |
| Update button text | `text-amber-700` | #B45309 |

---

## Testing Considerations

### Unit Tests (deferred to Phase 7)

- Stale indicator renders when `isStale=true` and `status='manual'`
- Stale indicator does NOT render when `isStale=true` but `status='completed'`
- Stale indicator does NOT render when `isStale=false`
- "Update Translation" button appears for stale manual translations
- "Update Translation" button triggers `onRetranslate` callback
- Row has yellow border when stale
- ARIA label includes stale state information

### Manual Testing Checklist

- [ ] Stale warning badge appears for manual translations with `isStale=true`
- [ ] Stale warning badge does NOT appear for completed translations
- [ ] Stale warning badge does NOT appear when `isStale=false`
- [ ] "Update Translation" button is visible for stale translations
- [ ] "Update Translation" button is styled with amber/yellow colors
- [ ] Clicking "Update Translation" triggers the re-translate action
- [ ] Row has subtle yellow border and background tint when stale
- [ ] Edit button still appears alongside "Update Translation"
- [ ] Screen reader announces stale state correctly
- [ ] Stale indicator maintains consistent spacing and alignment
- [ ] Button touch targets meet 48px minimum on mobile

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-311 not complete | Medium | High | Coordinate implementation order, stub component if needed |
| Visual conflict with existing status badges | Low | Medium | Test all status combinations, ensure adequate spacing |
| Accessibility issues with multiple warning states | Low | Medium | Test with screen readers, ensure clear ARIA labels |
| Yellow color too subtle on some displays | Low | Low | Use higher contrast yellow-700 for text, test on multiple screens |

---

## Integration Notes

### Parent Component Usage

TranslationPreviewPanel will pass the `isStale` prop based on timestamp comparison:

```tsx
// In TranslationPreviewPanel.tsx
<TranslationStatusItem
  language={lang}
  languageName={LANGUAGE_CONFIG[lang].nativeName}
  status={translation?.status ?? 'pending'}
  previewText={translation?.content?.title}
  translatedAt={translation?.translatedAt}
  isStale={
    translation?.status === 'manual' &&
    sourceUpdatedAt &&
    translation?.translatedAt &&
    new Date(sourceUpdatedAt) > new Date(translation.translatedAt)
  }
  onEdit={() => handleEdit(lang)}
  onRetranslate={() => handleRetranslate(lang)}
  onRetry={() => handleRetry(lang)}
/>
```

### Related Task: ManualEditWarningDialog (Task 5.1)

The stale indicator complements the ManualEditWarningDialog (REQ-325 ManualEditWarningDialog) which warns users BEFORE source content updates. The stale indicator shows AFTER updates have occurred, providing two-layer protection for manual edits.

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full implementation plan
- [REQ-311-create-translationstatusitem-component-overview.md](/docs/REQ-311-create-translationstatusitem-component-overview.md) - Base component specification
- [DuplicateNameWarning.tsx](/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx) - Warning indicator pattern reference
- [EngagementIndicator.tsx](/src/components/ItemManager/components/shared/EngagementIndicator.tsx) - Color-coded status pattern reference
