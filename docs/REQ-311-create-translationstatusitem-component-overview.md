# REQ-311: Create TranslationStatusItem Component - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-311
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 2 - Core UI Components
**Task ID:** 2.3
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-309 (TranslationManagement types), REQ-310 (TranslationPreviewPanel)

---

## Summary

Create a reusable component that renders a single language row within the TranslationPreviewPanel. Each row displays the language flag icon, language name, a colored status indicator, a preview of the translated content (truncated), and contextual action buttons. The component follows established patterns from TagChip and ItemCard while implementing translation-specific requirements.

---

## User Story

As a **property owner reviewing translation coverage for my content**, I want to **see each language represented as a distinct, scannable row showing language identity, translation status, preview text, and available actions** so that I can **quickly identify which languages need attention and take immediate action without expanding or drilling into each item**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | Row displays language flag icon aligned to the left | Visual inspection |
| AC-2 | Row displays language name adjacent to the flag | Visual inspection |
| AC-3 | Row displays status indicator using specified color coding: green for complete, orange for pending, red for failed, purple for manually edited | Visual inspection with test data |
| AC-4 | Row displays preview text of the translation, truncated appropriately to fit within row width | Visual inspection, text overflow testing |
| AC-5 | Row includes action buttons for edit, re-translate, and retry operations | Visual inspection |
| AC-6 | Retry button appears only when status indicates translation failure | Conditional rendering verification |
| AC-7 | Row maintains consistent height across different languages and content lengths | Visual inspection with varied content |
| AC-8 | Row is keyboard accessible for navigation and action triggering | WCAG 2.1 AA testing |
| AC-9 | Row styling provides clear visual separation from adjacent rows | Visual inspection |
| AC-10 | Clicking action buttons triggers appropriate translation operations | Click handler verification |

---

## Technical Approach

### Architecture Overview

The TranslationStatusItem component is a presentational component designed for reuse within TranslationPreviewPanel. It follows the existing patterns established by TagChip (for status indicators) and ItemCard (for row-based information display with actions).

```
TranslationPreviewPanel/
├── index.ts                         # Public exports (update)
├── TranslationPreviewPanel.tsx      # Parent component
├── TranslationPreviewPanel.types.ts # Panel types
├── TranslationStatusItem.tsx        # NEW: Single language status row
└── TranslationProgressBar.tsx       # Overall progress (REQ-312)
```

### Component Structure

The TranslationStatusItem is a controlled component that receives all data and callbacks as props:

```tsx
<TranslationStatusItem
  language="fr"
  languageName="Francais"
  status="completed"
  previewText="Comment utiliser le lave-vaisselle..."
  translatedAt="2026-01-15T10:30:00Z"
  isStale={false}
  reviewedBy={undefined}
  onEdit={() => handleEdit('fr')}
  onRetranslate={() => handleRetranslate('fr')}
  onRetry={() => handleRetry('fr')}
/>
```

### Visual Layout

Each row follows a horizontal layout with clear visual hierarchy:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Flag] [Language Name] [Status Icon] [Status Text]    [Actions] │
│        [Preview text truncated with ellipsis...]                │
└─────────────────────────────────────────────────────────────────┘
```

**Row Elements (left to right):**
1. **Flag Icon:** Language flag emoji (e.g., FR, ES, DE, NL, IT, EN)
2. **Language Name:** Full language name in that language's native form
3. **Status Section:** Icon + descriptive text (e.g., "Completed", "Pending", "Failed")
4. **Actions:** Button group aligned to the right
5. **Preview Line:** Truncated translation text on second line

### Status Indicator Mapping

Following the PRD specification and established patterns:

| Status | Icon | Color | Tailwind Class | Text |
|--------|------|-------|----------------|------|
| completed | `CheckCircle` | Green | `text-green-500 bg-green-50` | "Completed" |
| manual | `PencilLine` | Purple | `text-violet-500 bg-violet-50` | "Manual" |
| pending | `Clock` | Orange | `text-amber-500 bg-amber-50` | "Pending" |
| processing | `Loader2` (animated) | Orange | `text-amber-500 bg-amber-50` | "Processing" |
| failed | `XCircle` | Red | `text-red-500 bg-red-50` | "Failed" |

**Stale Indicator:** When `isStale` is true, add a warning icon (`AlertTriangle`) with `text-yellow-500` alongside the status.

### Language Flag Mapping

Using Unicode flag emojis for maximum compatibility:

| Language Code | Flag | Native Name |
|---------------|------|-------------|
| en | EN | English |
| fr | FR | Francais |
| es | ES | Espanol |
| de | DE | Deutsch |
| nl | NL | Nederlands |
| it | IT | Italiano |

### Action Button Logic

| Action | Visible When | Icon | Variant |
|--------|--------------|------|---------|
| Edit | `completed` or `manual` | `Edit` | ghost/outline |
| Re-translate | `completed` or `manual` | `RotateCcw` | ghost/outline |
| Retry | `failed` | `RotateCcw` | primary |

**Button States:**
- Default: Enabled
- During operation: Disabled + loading spinner
- Disabled: Reduced opacity, not clickable

### Styling Approach

Following existing patterns:
- Tailwind CSS for all styling
- `cn()` utility for conditional class composition
- Consistent with TagChip styling patterns
- Minimum touch targets (48px mobile, 44px desktop per REQ-089)

```tsx
// Row container styling
const rowStyles = cn(
  // Base styles
  'flex flex-col gap-1 p-3 rounded-lg',
  'border border-gray-100',
  'transition-colors',
  // Hover state
  'hover:bg-gray-50',
  // Focus state
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1'
);

// Status badge styling (similar to TagChip)
const statusBadgeStyles = cn(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
  statusColorClasses[status]
);
```

### Accessibility Requirements

- ARIA labels for all interactive elements
- `role="listitem"` for proper list semantics (parent uses `role="list"`)
- Screen reader announcements for status
- Keyboard navigation:
  - Tab to navigate between rows
  - Tab within row to navigate between action buttons
  - Enter/Space to activate buttons
- Minimum touch targets (48px x 48px on mobile)
- Clear focus indicators

---

## Component Props Interface

```typescript
/**
 * Props for TranslationStatusItem component
 * @see Plan-111-L10N-Epic5 Task 2.3
 */
export interface TranslationStatusItemProps {
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

  /** Whether the translation is stale (source content updated after translation) */
  isStale?: boolean;

  /** User ID who manually reviewed/edited the translation */
  reviewedBy?: string;

  /** Handler for edit action */
  onEdit?: () => void;

  /** Handler for re-translate action */
  onRetranslate?: () => void;

  /** Handler for retry action (failed translations only) */
  onRetry?: () => void;

  /** Whether actions are currently loading/disabled */
  isActionLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Internal type for status configuration
 */
interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  colorClasses: string;
  label: string;
}

/**
 * Language display configuration
 */
interface LanguageDisplayConfig {
  flag: string;
  nativeName: string;
}
```

---

## Implementation Tasks

### Task 1: Create TranslationStatusItem.tsx component
**Effort:** M (1-2 hours)

Create the main component file with:
- Props interface (or import from types file)
- Language flag mapping
- Status configuration mapping
- Row layout implementation
- Conditional action button rendering

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Key Implementation Points:**

```tsx
// Language display configuration
const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageDisplayConfig> = {
  en: { flag: 'EN', nativeName: 'English' },
  fr: { flag: 'FR', nativeName: 'Francais' },
  es: { flag: 'ES', nativeName: 'Espanol' },
  de: { flag: 'DE', nativeName: 'Deutsch' },
  nl: { flag: 'NL', nativeName: 'Nederlands' },
  it: { flag: 'IT', nativeName: 'Italiano' },
};

// Status icon and color configuration
const STATUS_CONFIG: Record<TranslationStatusType, StatusConfig> = {
  completed: {
    icon: CheckCircle,
    colorClasses: 'text-green-500 bg-green-50 border-green-200',
    label: 'Completed',
  },
  manual: {
    icon: PencilLine,
    colorClasses: 'text-violet-500 bg-violet-50 border-violet-200',
    label: 'Manual',
  },
  pending: {
    icon: Clock,
    colorClasses: 'text-amber-500 bg-amber-50 border-amber-200',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
    colorClasses: 'text-amber-500 bg-amber-50 border-amber-200',
    label: 'Processing',
  },
  failed: {
    icon: XCircle,
    colorClasses: 'text-red-500 bg-red-50 border-red-200',
    label: 'Failed',
  },
};
```

### Task 2: Implement row layout structure
**Effort:** S (30 min - 1 hour)

Build the two-line row layout:
- First line: Flag, language name, status badge, action buttons
- Second line: Truncated preview text

**Layout CSS:**
```tsx
// Two-line structure
<div className={rowStyles}>
  {/* Line 1: Main info and actions */}
  <div className="flex items-center gap-2">
    {/* Left section: Flag + Name + Status */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="font-medium text-sm">{languageConfig.flag}</span>
      <span className="text-sm text-gray-700">{languageConfig.nativeName}</span>
      <StatusBadge status={status} isStale={isStale} />
    </div>
    {/* Right section: Action buttons */}
    <ActionButtons ... />
  </div>

  {/* Line 2: Preview text */}
  {previewText && (
    <p className="text-xs text-gray-500 truncate pl-8">
      {previewText}
    </p>
  )}
</div>
```

### Task 3: Implement status badge subcomponent
**Effort:** S (15-30 min)

Create an inline or extracted StatusBadge that displays:
- Status icon (animated spinner for processing)
- Status text label
- Optional stale warning indicator

**StatusBadge Structure:**
```tsx
// Inline status badge
<span className={cn(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
  statusConfig.colorClasses
)}>
  <StatusIcon
    className={cn(
      'w-3 h-3',
      status === 'processing' && 'animate-spin'
    )}
  />
  {statusConfig.label}
  {isStale && (
    <AlertTriangle className="w-3 h-3 text-yellow-500 ml-1" />
  )}
</span>
```

### Task 4: Implement action buttons
**Effort:** M (30 min - 1 hour)

Create the conditional action button group:
- Edit button (for completed/manual)
- Re-translate button (for completed/manual)
- Retry button (for failed only)

**Button Implementation:**
```tsx
// Action buttons with proper touch targets
<div className="flex items-center gap-1">
  {(status === 'completed' || status === 'manual') && (
    <>
      <button
        onClick={onEdit}
        disabled={isActionLoading || !onEdit}
        className={cn(
          'inline-flex items-center justify-center',
          'min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px]',
          'rounded-md text-gray-500',
          'hover:bg-gray-100 hover:text-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        aria-label={`Edit ${languageName} translation`}
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={onRetranslate}
        disabled={isActionLoading || !onRetranslate}
        className={/* similar styling */}
        aria-label={`Re-translate ${languageName}`}
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </>
  )}
  {status === 'failed' && (
    <button
      onClick={onRetry}
      disabled={isActionLoading || !onRetry}
      className={cn(
        'inline-flex items-center justify-center gap-1',
        'px-3 py-1 min-h-[44px] md:min-h-[32px]',
        'rounded-md text-white bg-red-500',
        'hover:bg-red-600',
        'focus:outline-none focus:ring-2 focus:ring-red-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'text-xs font-medium'
      )}
      aria-label={`Retry ${languageName} translation`}
    >
      <RotateCcw className="w-3 h-3" />
      Retry
    </button>
  )}
</div>
```

### Task 5: Add accessibility attributes
**Effort:** S (15-30 min)

Implement comprehensive accessibility:
- `role="listitem"` on the row
- `aria-label` describing the full row state
- `aria-describedby` linking to status explanation
- Screen reader-only status text

**Accessibility Implementation:**
```tsx
<div
  role="listitem"
  aria-label={`${languageConfig.nativeName} translation: ${statusConfig.label}${isStale ? ', content is outdated' : ''}`}
  className={rowStyles}
>
  {/* Status announcement for screen readers */}
  <span className="sr-only" aria-live="polite">
    {status === 'processing' && `${languageName} translation in progress`}
    {status === 'failed' && `${languageName} translation failed, retry available`}
  </span>
  {/* ... rest of component */}
</div>
```

### Task 6: Update TranslationPreviewPanel index.ts exports
**Effort:** XS (< 15 min)

Add TranslationStatusItem to the panel's public exports.

**Files:**
- Modify: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Export Update:**
```typescript
export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Single language status row component |

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Add TranslationStatusItem export | Export statements |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types (SupportedLanguage, TranslationStatusType) |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Parent component integration patterns |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Status badge styling patterns |
| `/src/components/ItemManager/components/ItemCard.tsx` | Row-based component patterns, touch targets |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | SupportedLanguage, TranslationStatusType (REQ-309) |
| cn utility | `/src/lib/utils.ts` | Class name composition |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `lucide-react` | (existing) | Icons (CheckCircle, PencilLine, Clock, Loader2, XCircle, AlertTriangle, Edit, RotateCcw) |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation status types/enums |
| REQ-309 | Required | TranslationManagement.types.ts must define SupportedLanguage, TranslationStatusType |
| REQ-310 | Required | TranslationPreviewPanel must exist for integration |

---

## Integration with TranslationPreviewPanel

The TranslationStatusItem will be consumed by TranslationPreviewPanel like this:

```tsx
// In TranslationPreviewPanel.tsx
<div role="list" className="flex flex-col gap-2">
  {SUPPORTED_LANGUAGES.map((lang) => {
    const translation = translations[lang];
    return (
      <TranslationStatusItem
        key={lang}
        language={lang}
        languageName={LANGUAGE_CONFIG[lang].nativeName}
        status={translation?.status ?? 'pending'}
        previewText={translation?.content?.title || translation?.content?.description}
        translatedAt={translation?.translatedAt}
        isStale={translation?.isStale}
        reviewedBy={translation?.reviewedBy}
        onEdit={() => handleEdit(lang)}
        onRetranslate={() => handleRetranslate(lang)}
        onRetry={() => handleRetry(lang)}
        isActionLoading={loadingLanguages.includes(lang)}
      />
    );
  })}
</div>
```

---

## Visual Design Reference

Per PRD specification, each row follows this layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ FR Francais ✓ Completed                          [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ES Espanol ⏳ Pending                                           │
│    Translating...                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ IT Italiano ❌ Failed                            [Retry]        │
│    Translation failed. Click to retry.                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DE Deutsch ✎ Manual ⚠️ (stale)                    [Edit] [↻]    │
│    Wie man die Spulmaschine benutzt                            │
└─────────────────────────────────────────────────────────────────┘
```

**Row Dimensions:**
- Minimum height: 60px (to accommodate two lines + padding)
- Padding: 12px
- Gap between rows: 8px
- Button touch targets: 48px mobile, 32px desktop

---

## Testing Considerations

### Unit Tests (deferred to Phase 7)

- Component renders with required props
- Correct icon and color for each status
- Edit/Re-translate buttons visible for completed/manual status
- Retry button visible only for failed status
- Preview text truncates correctly
- Stale indicator appears when isStale=true
- Action buttons call callbacks correctly
- Loading state disables buttons
- Accessibility attributes present

### Manual Testing Checklist

- [ ] Flag displays correctly for each language
- [ ] Language name displays in native form
- [ ] Status badge shows correct icon and color for each status
- [ ] Preview text truncates with ellipsis when too long
- [ ] Edit button visible and clickable for completed/manual
- [ ] Re-translate button visible and clickable for completed/manual
- [ ] Retry button visible only for failed status
- [ ] Buttons are disabled during loading
- [ ] Stale warning icon appears when translation is stale
- [ ] Row has consistent height regardless of content
- [ ] Visual separation between adjacent rows is clear
- [ ] Keyboard navigation works (Tab between buttons)
- [ ] Touch targets meet 48px minimum on mobile
- [ ] Screen reader announces status correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-309/310 not complete | Medium | High | Stub types locally, coordinate with dependent tasks |
| Inconsistent row heights with varied content | Low | Medium | Use min-height, consistent padding |
| Button touch targets overlapping | Low | Medium | Use flex gap, ensure sufficient spacing |
| Color contrast issues | Low | Medium | Verify against WCAG AA, use darker status colors if needed |

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full implementation plan
- [REQ-310-create-translationpreviewpanel-component-overview.md](/docs/REQ-310-create-translationpreviewpanel-component-overview.md) - Parent component spec
- [TagChip.tsx](/src/components/ItemManager/components/shared/TagChip.tsx) - Status badge styling reference
- [ItemCard.tsx](/src/components/ItemManager/components/ItemCard.tsx) - Row component patterns
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
