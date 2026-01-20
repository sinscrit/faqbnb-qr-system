# Detailed Task Breakdown: REQ-E05-023 - Implement Stale Translation Indicator

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-023
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.2
**Size:** M (Medium)
**Priority:** P2 - Medium
**Overview Document:** `docs/REQ-E05-023-implement-stale-translation-indicator-overview.md`

---

## Executive Summary

This document provides granular, implementation-ready tasks for adding stale translation visual indicators to the translation management UI components. When source content is modified after translations are created, property owners need clear visual signals identifying which translations have become potentially outdated. The implementation adds yellow/amber warning indicators, tooltips with date information, and "Update Translation" action buttons across all translation status components.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] **REQ-E05-003**: `source_version_at` column migration applied to translation tables
- [ ] **REQ-E05-006**: `TranslationManagement.types.ts` exists with base type definitions
- [ ] **REQ-E05-007**: `TranslationStatusItem.tsx` component exists with base functionality
- [ ] **REQ-E05-013**: `TranslationStatusWidget.tsx` dashboard widget exists
- [ ] **REQ-E05-014**: `TranslationStatusColumn.tsx` and `TranslationStatusFilter.tsx` exist
- [ ] **REQ-E05-006**: `TranslationPreviewPanel.tsx` exists with language listing

---

## Task Breakdown

### Task 1: Update TranslationManagement.types.ts with Stale-Related Types

**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** REQ-E05-006 (file must exist)

#### 1.1 Add Stale-Related Type Definitions

Add the following type definitions to support staleness tracking:

```typescript
/**
 * Extended translation status data including staleness information.
 * Used for displaying translation status with stale indicators.
 */
export interface TranslationStatusData {
  /** ISO 639-1 language code */
  language: SupportedLanguage;
  /** Current translation status */
  status: TranslationStatus;
  /** Preview of translated content (truncated) */
  translatedText?: string;
  /** Timestamp when translation was created/last translated */
  translatedAt?: string | null;
  /** Timestamp of source content when translation was created */
  sourceVersionAt?: string | null;
  /** User ID of reviewer for manual translations */
  reviewedBy?: string | null;
  /** Computed: true if source was updated after translation */
  isStale?: boolean;
}

/**
 * Information about a stale translation for tooltip display.
 */
export interface StaleTranslationInfo {
  /** Language code of the stale translation */
  language: SupportedLanguage;
  /** Formatted date when translation was created */
  translationDate: string;
  /** Formatted date when source was last updated */
  sourceUpdateDate: string;
}

/**
 * Filter value for translation status filtering including stale option.
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manual'
  | 'stale';
```

#### 1.2 Update TranslationStatusItemProps Interface

Extend the existing props interface with stale-related props:

```typescript
export interface TranslationStatusItemProps {
  /** Existing props from REQ-E05-007 */
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedText?: string;
  isSourceLanguage?: boolean;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  onView?: () => void;
  actionsDisabled?: boolean;
  className?: string;

  /** NEW: Stale indicator props */
  /** Timestamp when this translation was created (from source_version_at) */
  sourceVersionAt?: string | null;
  /** Timestamp when the source entity was last updated (from items/articles/links updated_at) */
  sourceEntityUpdatedAt?: string | null;
  /** Callback for Update Translation action (triggered on stale translations) */
  onUpdateTranslation?: () => void;
}
```

#### Acceptance Criteria for Task 1
- [ ] `TranslationStatusData` interface added with all fields including `isStale`
- [ ] `StaleTranslationInfo` interface added for tooltip information
- [ ] `TranslationFilterValue` type includes `'stale'` option
- [ ] `TranslationStatusItemProps` interface updated with new stale props
- [ ] All types have JSDoc comments explaining purpose
- [ ] No TypeScript compilation errors after changes
- [ ] Types export properly from the module

---

### Task 2: Create Staleness Utility Function

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### 2.1 Implement isTranslationStale Utility

Add the staleness detection function that will be exported for reuse:

```typescript
import { useMemo } from 'react';

/**
 * Determines if a translation is stale based on timestamp comparison.
 * A translation is stale when the source entity was updated after
 * the translation was created.
 *
 * @param sourceVersionAt - Timestamp of source when translation was created
 * @param sourceEntityUpdatedAt - Current updated_at of the source entity
 * @returns true if translation is stale (source updated after translation)
 *
 * @example
 * ```typescript
 * const isStale = isTranslationStale('2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z');
 * // returns true because source was updated after translation
 * ```
 */
export function isTranslationStale(
  sourceVersionAt: string | null | undefined,
  sourceEntityUpdatedAt: string | null | undefined
): boolean {
  // Cannot determine staleness without both timestamps
  if (!sourceVersionAt || !sourceEntityUpdatedAt) {
    return false;
  }

  const translationTimestamp = new Date(sourceVersionAt).getTime();
  const sourceUpdateTimestamp = new Date(sourceEntityUpdatedAt).getTime();

  // Invalid dates
  if (isNaN(translationTimestamp) || isNaN(sourceUpdateTimestamp)) {
    return false;
  }

  // Stale if source entity was updated after the translation was created
  return translationTimestamp < sourceUpdateTimestamp;
}
```

#### 2.2 Create useStaleStatus Custom Hook

Add a hook for use within components:

```typescript
/**
 * Hook to compute stale status with memoization.
 * Only completed and manual translations can be marked as stale.
 *
 * @param status - Current translation status
 * @param sourceVersionAt - Timestamp when translation was created
 * @param sourceEntityUpdatedAt - Timestamp when source entity was updated
 * @returns boolean indicating if translation is stale
 */
export function useStaleStatus(
  status: TranslationStatus,
  sourceVersionAt: string | null | undefined,
  sourceEntityUpdatedAt: string | null | undefined
): boolean {
  return useMemo(() => {
    // Only completed and manual translations can be stale
    // Pending, processing, and failed statuses take precedence
    if (status !== 'completed' && status !== 'manual') {
      return false;
    }
    return isTranslationStale(sourceVersionAt, sourceEntityUpdatedAt);
  }, [status, sourceVersionAt, sourceEntityUpdatedAt]);
}
```

#### Acceptance Criteria for Task 2
- [ ] `isTranslationStale` function returns `true` when sourceVersionAt < sourceEntityUpdatedAt
- [ ] `isTranslationStale` function returns `false` when sourceVersionAt >= sourceEntityUpdatedAt
- [ ] `isTranslationStale` function returns `false` when either timestamp is null/undefined
- [ ] `isTranslationStale` function handles invalid date strings gracefully (returns false)
- [ ] `useStaleStatus` hook returns false for pending/processing/failed statuses
- [ ] `useStaleStatus` hook is properly memoized
- [ ] Functions are exported from the file

---

### Task 3: Implement Visual Stale Indicator in TranslationStatusItem

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Estimated Effort:** 1.5 story points
**Dependencies:** Task 1, Task 2

#### 3.1 Add Required Imports

```typescript
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStaleStatus } from './staleness-utils'; // Or inline if in same file
```

#### 3.2 Update Component Props

Update the component to accept the new stale-related props:

```typescript
interface TranslationStatusItemProps {
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedText?: string;
  isSourceLanguage?: boolean;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  onView?: () => void;
  onUpdateTranslation?: () => void; // NEW
  actionsDisabled?: boolean;
  className?: string;
  sourceVersionAt?: string | null; // NEW
  sourceEntityUpdatedAt?: string | null; // NEW
}
```

#### 3.3 Compute Stale State

Inside the component, compute the stale status:

```typescript
export function TranslationStatusItem({
  language,
  status,
  translatedText,
  isSourceLanguage = false,
  onEdit,
  onRetranslate,
  onRetry,
  onView,
  onUpdateTranslation,
  actionsDisabled = false,
  className,
  sourceVersionAt,
  sourceEntityUpdatedAt,
}: TranslationStatusItemProps) {
  const isStale = useStaleStatus(status, sourceVersionAt, sourceEntityUpdatedAt);

  // ... rest of component
}
```

#### 3.4 Update Container Styles

Update the container div to include stale border styling:

```typescript
const containerStyles = cn(
  'flex items-center gap-3 p-3 rounded-lg transition-all',
  // Stale state styling
  isStale && 'border-2 border-amber-400 bg-amber-50/50',
  // Normal state styling
  !isStale && 'border border-gray-200 bg-white',
  // Hover state
  'hover:shadow-sm',
  className
);
```

#### 3.5 Add Stale Warning Icon

Add the warning icon next to the status icon when stale:

```typescript
// Status icon section (modify existing)
<div className="flex items-center gap-1.5">
  {/* Stale warning icon - appears first when stale */}
  {isStale && (
    <AlertTriangle
      className="w-4 h-4 text-amber-500"
      aria-hidden="true"
    />
  )}

  {/* Existing status icon */}
  <StatusIcon status={status} />
</div>
```

#### 3.6 Update Status Label

Modify the status label to show combined state:

```typescript
const getStatusLabel = (status: TranslationStatus, isStale: boolean): string => {
  const baseLabel = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Complete',
    failed: 'Failed',
    manual: 'Manual',
  }[status];

  if (isStale && (status === 'completed' || status === 'manual')) {
    return `${baseLabel} (Stale)`;
  }
  return baseLabel;
};

// In the component JSX:
<span className={cn(
  'text-sm font-medium',
  isStale && 'text-amber-700'
)}>
  {getStatusLabel(status, isStale)}
</span>
```

#### Acceptance Criteria for Task 3
- [ ] Component displays yellow border (border-amber-400) when isStale is true
- [ ] Component displays subtle yellow background (bg-amber-50/50) when stale
- [ ] AlertTriangle icon displays in amber color when stale
- [ ] Status label shows "(Stale)" suffix for completed and manual statuses
- [ ] Stale styling does not apply to pending/processing/failed statuses
- [ ] Normal border styling applies when not stale
- [ ] Component maintains responsive layout with stale styling
- [ ] Visual hierarchy is maintained - stale indicator is noticeable but not overwhelming

---

### Task 4: Add "Update Translation" Action Button

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 3

#### 4.1 Add Update Translation Button

Add the button to the actions section, appearing only when stale:

```typescript
{/* Actions section */}
<div className="flex items-center gap-2 ml-auto">
  {/* Update Translation button - only for stale translations */}
  {isStale && onUpdateTranslation && (
    <button
      onClick={onUpdateTranslation}
      disabled={actionsDisabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md',
        'bg-amber-500 hover:bg-amber-600 text-white',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors'
      )}
      aria-label={`Update ${getLanguageInfo(language)?.name || language} translation`}
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" />
      Update
    </button>
  )}

  {/* Existing action buttons */}
  {onEdit && (status === 'completed' || status === 'manual') && (
    <button
      onClick={onEdit}
      disabled={actionsDisabled}
      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
      aria-label={`Edit ${getLanguageInfo(language)?.name || language} translation`}
    >
      Edit
    </button>
  )}

  {/* ... other existing buttons */}
</div>
```

#### 4.2 Handle Update Translation Click

Add handler that may require confirmation for manual translations:

```typescript
const handleUpdateTranslation = useCallback(() => {
  // For manual stale translations, the parent component should handle
  // showing a confirmation dialog before proceeding
  // This callback simply notifies the parent
  onUpdateTranslation?.();
}, [onUpdateTranslation]);
```

#### Acceptance Criteria for Task 4
- [ ] "Update" button appears when `isStale` is true and `onUpdateTranslation` is provided
- [ ] Button has amber/warning color styling (bg-amber-500)
- [ ] Button includes RefreshCw icon
- [ ] Button is disabled when `actionsDisabled` is true
- [ ] Button has proper ARIA label with language name
- [ ] Button has focus ring styling for keyboard accessibility
- [ ] Clicking button calls `onUpdateTranslation` callback
- [ ] Button position is at the start of the actions group (most prominent)

---

### Task 5: Add Stale Tooltip

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 3

#### 5.1 Create Tooltip Content Generator

```typescript
/**
 * Generates tooltip content explaining why a translation is stale.
 */
const getStaleTooltipContent = useMemo(() => {
  if (!isStale || !sourceVersionAt || !sourceEntityUpdatedAt) {
    return '';
  }

  const translationDate = new Date(sourceVersionAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const sourceDate = new Date(sourceEntityUpdatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `Translation created ${translationDate}. Source content updated ${sourceDate}.`;
}, [isStale, sourceVersionAt, sourceEntityUpdatedAt]);
```

#### 5.2 Add Tooltip to Warning Icon

Wrap the warning icon with a tooltip:

```typescript
{isStale && (
  <div
    className="relative group"
    role="tooltip"
    aria-label={getStaleTooltipContent}
  >
    <AlertTriangle
      className="w-4 h-4 text-amber-500 cursor-help"
      aria-hidden="true"
    />

    {/* Tooltip popup */}
    <div className={cn(
      'absolute z-10 invisible group-hover:visible',
      'bottom-full left-1/2 -translate-x-1/2 mb-2',
      'px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg',
      'whitespace-nowrap',
      'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
    )}>
      {getStaleTooltipContent}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div className="border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  </div>
)}
```

#### Alternative: Use Native Title Attribute (Simpler)

If custom tooltip styling is not required, use the native approach:

```typescript
{isStale && (
  <AlertTriangle
    className="w-4 h-4 text-amber-500 cursor-help"
    aria-hidden="true"
    title={getStaleTooltipContent}
  />
)}
```

#### Acceptance Criteria for Task 5
- [ ] Tooltip appears on hover over the stale warning icon
- [ ] Tooltip displays translation creation date
- [ ] Tooltip displays source content update date
- [ ] Tooltip uses clear, human-readable date format
- [ ] Tooltip is accessible (has ARIA attributes or uses native title)
- [ ] Tooltip disappears when mouse leaves the icon
- [ ] Tooltip does not appear when not stale

---

### Task 6: Update TranslationStatusColumn for Stale Indicator

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 2

#### 6.1 Update Dot Color Logic

Modify the dot rendering to show yellow for stale translations:

```typescript
interface TranslationStatusColumnProps {
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  translations: Record<SupportedLanguage, {
    status: TranslationStatus;
    sourceVersionAt?: string | null;
  }>;
  sourceEntityUpdatedAt?: string | null; // NEW
  onClick?: () => void;
  className?: string;
}

// In the component:
const getDotColor = (
  status: TranslationStatus,
  sourceVersionAt: string | null | undefined,
  sourceEntityUpdatedAt: string | null | undefined
): string => {
  // Check staleness for completed/manual
  if (
    (status === 'completed' || status === 'manual') &&
    isTranslationStale(sourceVersionAt, sourceEntityUpdatedAt)
  ) {
    return 'bg-amber-400'; // Stale - yellow
  }

  // Standard status colors
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'manual':
      return 'bg-violet-500';
    case 'pending':
    case 'processing':
      return 'bg-orange-400';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};
```

#### 6.2 Update Dot Tooltip

Add stale information to the dot tooltip:

```typescript
const getDotTooltip = (
  language: SupportedLanguage,
  status: TranslationStatus,
  isStale: boolean
): string => {
  const langInfo = getLanguageInfo(language);
  const langName = langInfo?.name || language;

  const statusLabel = {
    completed: 'Complete',
    manual: 'Manual',
    pending: 'Pending',
    processing: 'Processing',
    failed: 'Failed',
  }[status] || 'Not started';

  if (isStale) {
    return `${langName}: ${statusLabel} (Stale)`;
  }
  return `${langName}: ${statusLabel}`;
};
```

#### 6.3 Render Updated Dots

```typescript
<div
  className={cn(
    'flex items-center gap-1 cursor-pointer',
    className
  )}
  onClick={onClick}
  role="button"
  aria-label="View translation status"
>
  {SUPPORTED_LANGUAGES.map((lang) => {
    const translation = translations[lang.code];
    const status = translation?.status || 'pending';
    const isStale = isTranslationStale(
      translation?.sourceVersionAt,
      sourceEntityUpdatedAt
    );

    return (
      <div
        key={lang.code}
        className={cn(
          'w-2.5 h-2.5 rounded-full transition-colors',
          getDotColor(status, translation?.sourceVersionAt, sourceEntityUpdatedAt)
        )}
        title={getDotTooltip(lang.code, status, isStale)}
        aria-label={getDotTooltip(lang.code, status, isStale)}
      />
    );
  })}
</div>
```

#### Acceptance Criteria for Task 6
- [ ] Stale translations display yellow dot (bg-amber-400) instead of green/purple
- [ ] Stale detection uses same `isTranslationStale` utility
- [ ] Tooltip shows "(Stale)" suffix for stale translations
- [ ] Non-stale translations maintain original color coding
- [ ] Dot colors transition smoothly when status changes
- [ ] Component accepts `sourceEntityUpdatedAt` prop
- [ ] Click handler still works to open preview panel

---

### Task 7: Add Stale Warning Banner to TranslationPreviewPanel

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 2

#### 7.1 Compute Stale Count

```typescript
const staleTranslations = useMemo(() => {
  if (!translations || !sourceEntity?.updatedAt) return [];

  return Object.entries(translations)
    .filter(([lang, trans]) => {
      if (!trans) return false;
      if (trans.status !== 'completed' && trans.status !== 'manual') return false;
      return isTranslationStale(trans.sourceVersionAt, sourceEntity.updatedAt);
    })
    .map(([lang]) => lang as SupportedLanguage);
}, [translations, sourceEntity?.updatedAt]);

const hasStaleTranslations = staleTranslations.length > 0;
```

#### 7.2 Add Banner Component

```typescript
{hasStaleTranslations && (
  <div
    className={cn(
      'mx-4 mb-4 p-3 rounded-lg',
      'bg-amber-50 border border-amber-200',
      'flex items-start gap-3'
    )}
    role="alert"
    aria-live="polite"
  >
    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-amber-800">
        {staleTranslations.length === 1
          ? '1 translation may be outdated'
          : `${staleTranslations.length} translations may be outdated`}
      </p>
      <p className="text-xs text-amber-600 mt-0.5">
        The source content has been updated since these translations were created.
      </p>
    </div>
  </div>
)}
```

#### 7.3 Position Banner

Place the banner after the header, before the source content section:

```typescript
return (
  <div className="h-full flex flex-col">
    {/* Panel header */}
    <PanelHeader onClose={onClose} />

    {/* Stale warning banner - NEW */}
    {hasStaleTranslations && (
      <StaleWarningBanner count={staleTranslations.length} />
    )}

    {/* Source content section */}
    <SourceContentSection content={sourceContent} language={sourceLanguage} />

    {/* Translations list */}
    <TranslationsList ... />
  </div>
);
```

#### Acceptance Criteria for Task 7
- [ ] Banner appears when at least one translation is stale
- [ ] Banner displays count of stale translations
- [ ] Banner uses amber/warning color scheme
- [ ] Banner includes AlertTriangle icon
- [ ] Banner has helpful text explaining why translations are outdated
- [ ] Banner does not appear when no translations are stale
- [ ] Banner has role="alert" for accessibility
- [ ] Banner position is below header, above source content

---

### Task 8: Update TranslationStatusWidget for Stale Count

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 2

#### 8.1 Add Stale Count to Widget Data

Update the widget to display stale translation count:

```typescript
interface TranslationSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
  stale: number; // NEW
}
```

#### 8.2 Compute Stale Count from Data

```typescript
const summary = useMemo(() => {
  if (!translationData) return null;

  const staleCount = translationData.items.reduce((count, item) => {
    const staleInItem = Object.values(item.translations || {}).filter(
      trans =>
        trans &&
        (trans.status === 'completed' || trans.status === 'manual') &&
        isTranslationStale(trans.sourceVersionAt, item.entityUpdatedAt)
    ).length;
    return count + staleInItem;
  }, 0);

  return {
    ...translationData.summary,
    stale: staleCount,
  };
}, [translationData]);
```

#### 8.3 Display Stale Count in Widget

Add stale count to the statistics display:

```typescript
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
  {/* Existing stats */}
  <StatItem
    label="Complete"
    count={summary.complete}
    icon={<CheckCircle />}
    color="green"
  />
  <StatItem
    label="Pending"
    count={summary.pending}
    icon={<Clock />}
    color="orange"
  />
  <StatItem
    label="Failed"
    count={summary.failed}
    icon={<AlertCircle />}
    color="red"
  />

  {/* NEW: Stale count */}
  {summary.stale > 0 && (
    <StatItem
      label="Stale"
      count={summary.stale}
      icon={<AlertTriangle />}
      color="amber"
    />
  )}
</div>
```

#### Acceptance Criteria for Task 8
- [ ] Widget displays stale translation count when > 0
- [ ] Stale count uses amber/yellow color scheme
- [ ] Stale count uses AlertTriangle icon
- [ ] Stale count only appears when there are stale translations
- [ ] Stale count is separate from other status counts
- [ ] Widget layout adjusts gracefully with additional stat item
- [ ] Stale computation uses `isTranslationStale` utility

---

### Task 9: Add "Stale Translations" Filter Option

**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### 9.1 Add Stale Filter Option

Update the filter options array:

```typescript
const filterOptions: { value: TranslationFilterValue; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'fully_translated', label: 'Fully Translated' },
  { value: 'partially_translated', label: 'Partially Translated' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'manual', label: 'Manually Edited' },
  { value: 'stale', label: 'Stale Translations' }, // NEW
];
```

#### 9.2 Handle Stale Filter Logic

The parent component (TranslationManagementPage) should handle the stale filter:

```typescript
// In the parent component's filter logic:
const filteredItems = useMemo(() => {
  if (!items) return [];

  return items.filter(item => {
    switch (filterValue) {
      case 'stale':
        // Show items with at least one stale translation
        return Object.values(item.translations || {}).some(trans =>
          trans &&
          (trans.status === 'completed' || trans.status === 'manual') &&
          isTranslationStale(trans.sourceVersionAt, item.entityUpdatedAt)
        );
      // ... other filter cases
      default:
        return true;
    }
  });
}, [items, filterValue]);
```

#### Acceptance Criteria for Task 9
- [ ] "Stale Translations" option appears in filter dropdown
- [ ] Filter value is 'stale'
- [ ] Selecting "Stale Translations" shows only items with stale translations
- [ ] Filter works in conjunction with content type filter
- [ ] Filter position is at the end of the options list
- [ ] Filter label clearly communicates purpose

---

### Task 10: Update Index Exports

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
**Estimated Effort:** 0.25 story points
**Dependencies:** Task 2

#### 10.1 Export Utility Functions

```typescript
// Existing exports
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export { TranslationStatusItem } from './TranslationStatusItem';
export { TranslationProgressBar } from './TranslationProgressBar';

// NEW: Export staleness utilities
export { isTranslationStale, useStaleStatus } from './TranslationStatusItem';

// Export types
export type { TranslationStatusItemProps } from './TranslationStatusItem';
```

#### 10.2 Update Main TranslationManagement Index

**File:** `/src/components/TranslationManagement/index.ts`

```typescript
// Re-export staleness utilities from preview panel
export { isTranslationStale, useStaleStatus } from './TranslationPreviewPanel';
```

#### Acceptance Criteria for Task 10
- [ ] `isTranslationStale` function is exported from TranslationPreviewPanel index
- [ ] `useStaleStatus` hook is exported from TranslationPreviewPanel index
- [ ] Both are re-exported from main TranslationManagement index
- [ ] Types are properly exported
- [ ] Imports work correctly from both paths

---

### Task 11: Write Unit Tests for Staleness Utilities

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/staleness.test.ts`
**Estimated Effort:** 1 story point
**Dependencies:** Task 2

#### 11.1 Test isTranslationStale Function

```typescript
import { isTranslationStale } from '../TranslationStatusItem';

describe('isTranslationStale', () => {
  it('returns true when source was updated after translation', () => {
    const sourceVersionAt = '2026-01-15T10:00:00Z';
    const sourceEntityUpdatedAt = '2026-01-18T14:30:00Z';
    expect(isTranslationStale(sourceVersionAt, sourceEntityUpdatedAt)).toBe(true);
  });

  it('returns false when translation is newer than source update', () => {
    const sourceVersionAt = '2026-01-18T14:30:00Z';
    const sourceEntityUpdatedAt = '2026-01-15T10:00:00Z';
    expect(isTranslationStale(sourceVersionAt, sourceEntityUpdatedAt)).toBe(false);
  });

  it('returns false when timestamps are equal', () => {
    const timestamp = '2026-01-18T14:30:00Z';
    expect(isTranslationStale(timestamp, timestamp)).toBe(false);
  });

  it('returns false when sourceVersionAt is null', () => {
    expect(isTranslationStale(null, '2026-01-18T14:30:00Z')).toBe(false);
  });

  it('returns false when sourceEntityUpdatedAt is null', () => {
    expect(isTranslationStale('2026-01-15T10:00:00Z', null)).toBe(false);
  });

  it('returns false when both timestamps are null', () => {
    expect(isTranslationStale(null, null)).toBe(false);
  });

  it('returns false when sourceVersionAt is undefined', () => {
    expect(isTranslationStale(undefined, '2026-01-18T14:30:00Z')).toBe(false);
  });

  it('returns false when sourceEntityUpdatedAt is undefined', () => {
    expect(isTranslationStale('2026-01-15T10:00:00Z', undefined)).toBe(false);
  });

  it('returns false for invalid date strings', () => {
    expect(isTranslationStale('invalid', '2026-01-18T14:30:00Z')).toBe(false);
    expect(isTranslationStale('2026-01-15T10:00:00Z', 'invalid')).toBe(false);
  });
});
```

#### 11.2 Test useStaleStatus Hook

```typescript
import { renderHook } from '@testing-library/react';
import { useStaleStatus } from '../TranslationStatusItem';

describe('useStaleStatus', () => {
  it('returns true for stale completed translation', () => {
    const { result } = renderHook(() =>
      useStaleStatus('completed', '2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z')
    );
    expect(result.current).toBe(true);
  });

  it('returns true for stale manual translation', () => {
    const { result } = renderHook(() =>
      useStaleStatus('manual', '2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z')
    );
    expect(result.current).toBe(true);
  });

  it('returns false for pending translation even if timestamps suggest staleness', () => {
    const { result } = renderHook(() =>
      useStaleStatus('pending', '2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z')
    );
    expect(result.current).toBe(false);
  });

  it('returns false for processing translation', () => {
    const { result } = renderHook(() =>
      useStaleStatus('processing', '2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z')
    );
    expect(result.current).toBe(false);
  });

  it('returns false for failed translation', () => {
    const { result } = renderHook(() =>
      useStaleStatus('failed', '2026-01-15T10:00:00Z', '2026-01-18T14:30:00Z')
    );
    expect(result.current).toBe(false);
  });

  it('returns false when not stale', () => {
    const { result } = renderHook(() =>
      useStaleStatus('completed', '2026-01-18T14:30:00Z', '2026-01-15T10:00:00Z')
    );
    expect(result.current).toBe(false);
  });
});
```

#### Acceptance Criteria for Task 11
- [ ] All unit tests pass
- [ ] Tests cover true/false cases for `isTranslationStale`
- [ ] Tests cover null/undefined handling
- [ ] Tests cover invalid date string handling
- [ ] Tests cover all translation statuses for `useStaleStatus`
- [ ] Tests verify pending/processing/failed never return stale
- [ ] Tests use appropriate testing library (@testing-library/react)

---

## Implementation Order Summary

| Order | Task | File | Dependencies | Estimated Points |
|-------|------|------|--------------|------------------|
| 1 | Types Update | TranslationManagement.types.ts | None | 0.5 |
| 2 | Staleness Utility | TranslationStatusItem.tsx | Task 1 | 0.5 |
| 3 | Visual Indicator | TranslationStatusItem.tsx | Tasks 1, 2 | 1.5 |
| 4 | Update Button | TranslationStatusItem.tsx | Task 3 | 1 |
| 5 | Tooltip | TranslationStatusItem.tsx | Task 3 | 1 |
| 6 | Status Column | TranslationStatusColumn.tsx | Task 2 | 1 |
| 7 | Preview Banner | TranslationPreviewPanel.tsx | Task 2 | 1 |
| 8 | Dashboard Widget | TranslationStatusWidget.tsx | Task 2 | 1 |
| 9 | Filter Option | TranslationStatusFilter.tsx | Task 1 | 0.5 |
| 10 | Index Exports | index.ts files | Task 2 | 0.25 |
| 11 | Unit Tests | __tests__/staleness.test.ts | Task 2 | 1 |

**Total Estimated Story Points:** 9.25

---

## Verification Checklist

### Visual Verification
- [ ] Stale translation shows yellow border in TranslationStatusItem
- [ ] Stale translation shows yellow background tint
- [ ] Warning icon (AlertTriangle) is visible and amber-colored
- [ ] Status label shows "(Stale)" suffix
- [ ] "Update" button is visible with amber styling
- [ ] Tooltip appears on hover with correct date information
- [ ] Six-dot status column shows yellow dots for stale translations
- [ ] Preview panel banner appears when any translation is stale
- [ ] Dashboard widget shows stale count

### Functional Verification
- [ ] Stale indicator only appears for completed/manual translations
- [ ] Stale indicator does not appear for pending/processing/failed
- [ ] Clicking "Update" button triggers callback
- [ ] "Stale Translations" filter shows only stale items
- [ ] Stale count in widget is accurate
- [ ] Stale indicator disappears when translation is updated

### Accessibility Verification
- [ ] Warning icon has appropriate ARIA attributes
- [ ] Button has proper ARIA label
- [ ] Banner has role="alert"
- [ ] Tooltip content is accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works for all interactive elements

### Cross-Browser/Theme Verification
- [ ] Displays correctly in Chrome, Firefox, Safari
- [ ] Displays correctly in light theme
- [ ] Displays correctly in dark theme (if supported)
- [ ] Responsive layout works on mobile viewports

---

## Files Modified Summary

| File Path | Type | Changes |
|-----------|------|---------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Modify | Add stale-related types |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Modify | Add stale indicator, button, tooltip, utility |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Modify | Add stale warning banner |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Modify | Export utilities |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Modify | Add yellow dot for stale |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Modify | Add stale count |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Modify | Add stale filter option |
| `/src/components/TranslationManagement/index.ts` | Modify | Re-export utilities |
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/staleness.test.ts` | Create | Unit tests |

---

## References

- **Overview Document:** `docs/REQ-E05-023-implement-stale-translation-indicator-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 5.2)
- **Request File:** `docs/gen_requests_epic5.md` (REQ-E05-024)
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **PRD:** `docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.2: Implement Stale Translation Indicator*
*Last Modified: 2026-01-20*
