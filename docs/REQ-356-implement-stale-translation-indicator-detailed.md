# REQ-356: Implement Stale Translation Indicator - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-356
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.2
**Type:** ENHANCEMENT
**Size:** M (Medium)
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Overview Document:** REQ-356-implement-stale-translation-indicator-overview.md
**Dependencies:** Epic 1 (Foundation - source_version_at columns), Epic 3 (Dynamic Content Translation), REQ-311 (TranslationStatusItem component), REQ-338 (Re-translate API)

---

## Executive Summary

This document provides a granular task breakdown for implementing stale translation indicators within the TranslationStatusItem component. The enhancement adds visual warnings when manually edited translations become outdated due to source content updates, along with an "Update Translation" action button to trigger re-translation.

**Total Estimated Implementation:** ~3 hours (8 tasks)

---

## Prerequisites Checklist

Before starting implementation, verify the following dependencies are complete:

| Prerequisite | Source | Verification Command/Check |
|--------------|--------|----------------------------|
| `source_version_at` columns exist | REQ-339 | Check database schema for column in translation tables |
| TranslationStatusItem component exists | REQ-311 | File exists at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` |
| TranslationPreviewPanel component exists | REQ-310 | File exists at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` |
| Re-translate API endpoint exists | REQ-338 | Endpoint available at `/api/translations/retranslate` |
| TranslationManagement types defined | REQ-309 | Types exist in `/src/components/TranslationManagement/TranslationManagement.types.ts` |

**If prerequisites are not met:** Create stubs or coordinate with dependent task implementations. Gracefully handle missing `source_version_at` column with null checks.

---

## Task Breakdown

### Task 1: Add STALE_CONFIG Constant and Import Icons

**Story Points:** 0.5 (15 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Addition

#### Description
Add the stale indicator configuration constant and import required icons for the stale state display.

#### Acceptance Criteria
- [ ] `AlertTriangle` icon imported from `lucide-react`
- [ ] `RefreshCw` icon imported from `lucide-react`
- [ ] `Loader2` icon imported from `lucide-react` (if not already present)
- [ ] `STALE_CONFIG` constant defined with icon, colors, label, and description
- [ ] Build passes without errors

#### Implementation Details

**Step 1.1:** Add imports at the top of the file
```typescript
// Add to existing lucide-react imports
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
```

**Step 1.2:** Add STALE_CONFIG constant after STATUS_CONFIG
```typescript
/**
 * Configuration for stale translation indicator
 * Stale = manual translation where source content was updated after the edit
 */
const STALE_CONFIG = {
  icon: AlertTriangle,
  colorClasses: 'text-yellow-500',
  bgClasses: 'bg-yellow-50 border-yellow-200',
  badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  label: 'Stale',
  description: 'Source content has been updated since this translation was manually edited',
} as const;
```

#### Verification Steps
1. Run `npm run build` - should pass without errors
2. Run `npm run lint` - should pass without warnings related to these changes
3. Verify imports are not flagged as unused (they will be used in subsequent tasks)

---

### Task 2: Extend TranslationStatusItemProps Interface

**Story Points:** 0.5 (15 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Modification

#### Description
Extend the component's props interface to include stale-related props needed for detecting and handling stale translations.

#### Acceptance Criteria
- [ ] `isStale?: boolean` prop added to interface
- [ ] `sourceVersionAt?: string` prop added to interface
- [ ] `onUpdateTranslation?: () => void` callback prop added to interface
- [ ] JSDoc comments added for all new props
- [ ] TypeScript compilation passes

#### Implementation Details

**Step 2.1:** Add new props to `TranslationStatusItemProps` interface
```typescript
export interface TranslationStatusItemProps {
  // ... existing props ...

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

  /** Timestamp when source content was last modified (for tooltip display) */
  sourceVersionAt?: string;

  /** User ID who manually reviewed/edited the translation */
  reviewedBy?: string;

  /** Handler for edit action */
  onEdit?: () => void;

  /** Handler for re-translate action */
  onRetranslate?: () => void;

  /** Handler for retry action (failed translations only) */
  onRetry?: () => void;

  /**
   * Handler for updating a stale translation
   * Only called for manual translations where source content has changed
   */
  onUpdateTranslation?: () => void;

  /** Whether actions are currently loading/disabled */
  isActionLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

**Step 2.2:** Update component function signature to destructure new props
```typescript
export function TranslationStatusItem({
  language,
  languageName,
  status,
  previewText,
  translatedAt,
  isStale = false,
  sourceVersionAt,
  reviewedBy,
  onEdit,
  onRetranslate,
  onRetry,
  onUpdateTranslation,
  isActionLoading = false,
  className,
}: TranslationStatusItemProps) {
  // ... component implementation
}
```

#### Verification Steps
1. Run `npm run typecheck` - should pass without errors
2. Verify props appear in IDE autocomplete when using the component

---

### Task 3: Update Row Container Styling for Stale State

**Story Points:** 0.5 (20 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Modification

#### Description
Modify the row container styling to conditionally apply yellow border and subtle background tint when a translation is stale.

#### Acceptance Criteria
- [ ] Stale rows display `border-yellow-300` border color
- [ ] Stale rows display `bg-yellow-50/50` background tint
- [ ] Stale styling only applies when `isStale === true` AND `status === 'manual'`
- [ ] Non-stale rows retain original border styling (`border-gray-100`)
- [ ] Stale styling coexists with existing focus and hover states
- [ ] Visual distinction from error (red), pending (amber), and completed (green) states is clear

#### Implementation Details

**Step 3.1:** Update the `rowStyles` variable (or create it if using inline classes)
```typescript
// Row container with conditional stale styling
const rowStyles = cn(
  // Base styles
  'flex flex-col gap-1 p-3 rounded-lg',
  'border',
  'transition-colors',
  // Hover state
  'hover:bg-gray-50',
  // Focus state
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
  // Stale-specific styling (only for manual translations)
  isStale && status === 'manual' && [
    'border-yellow-300',
    'bg-yellow-50/50',
    'hover:bg-yellow-50',
  ],
  // Default border when not stale
  !(isStale && status === 'manual') && 'border-gray-100',
  // Pass through additional classes
  className
);
```

**Step 3.2:** Apply rowStyles to the container div
```tsx
<div
  role="listitem"
  aria-label={/* ... */}
  className={rowStyles}
>
  {/* ... component content */}
</div>
```

#### Verification Steps
1. Visually inspect component with `isStale={true}` and `status="manual"` - yellow border and tint should appear
2. Visually inspect component with `isStale={false}` - gray border should appear
3. Visually inspect component with `isStale={true}` but `status="completed"` - gray border should appear (non-manual)
4. Verify hover states work correctly on stale rows

---

### Task 4: Implement Stale Indicator Badge with Tooltip

**Story Points:** 1 (30 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Addition

#### Description
Add a conditional stale indicator badge that displays a yellow warning icon and "Stale" label with a hover tooltip explaining why the translation is marked as stale.

#### Acceptance Criteria
- [ ] Stale badge renders only when `isStale === true` AND `status === 'manual'`
- [ ] Badge displays `AlertTriangle` icon with `text-yellow-500` coloring
- [ ] Badge displays "Stale" text label
- [ ] Badge has yellow background, border, and text colors per spec
- [ ] Badge is positioned adjacent to the status badge (after "Manual" badge)
- [ ] Tooltip appears on hover showing "Source content updated since manual edit"
- [ ] Tooltip has proper z-index to appear above other elements
- [ ] `role="status"` applied to badge for screen reader announcement
- [ ] `aria-label` describes the stale condition

#### Implementation Details

**Step 4.1:** Create the stale badge JSX (position after status badge)
```tsx
{/* Stale indicator badge - only for manual translations with stale flag */}
{isStale && status === 'manual' && (
  <div className="relative group">
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'text-xs font-medium',
        'bg-yellow-100 text-yellow-700 border border-yellow-300',
        'ml-2'
      )}
      role="status"
      aria-label="Translation is stale - source content has been updated"
    >
      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
      {STALE_CONFIG.label}
    </span>

    {/* Tooltip on hover */}
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
      {STALE_CONFIG.description}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
        <div className="border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  </div>
)}
```

**Step 4.2:** Insert stale badge in the status section (first line)
```tsx
<div className="flex items-center gap-2 flex-1 min-w-0">
  <span className="font-medium text-sm">{languageConfig.flag}</span>
  <span className="text-sm text-gray-700">{languageConfig.nativeName}</span>
  {/* Existing status badge */}
  <StatusBadge status={status} />
  {/* NEW: Stale indicator (after status badge) */}
  {isStale && status === 'manual' && (
    <StaleBadge /> {/* Or inline JSX from above */}
  )}
</div>
```

#### Verification Steps
1. Render component with `isStale={true}` and `status="manual"` - stale badge should appear
2. Hover over stale badge - tooltip should appear with explanation text
3. Verify tooltip arrow points down toward badge
4. Render with `isStale={false}` - no stale badge should appear
5. Render with `isStale={true}` and `status="completed"` - no stale badge should appear
6. Use screen reader - should announce "Translation is stale - source content has been updated"

---

### Task 5: Implement "Update Translation" Action Button

**Story Points:** 1 (30 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Addition

#### Description
Add an "Update Translation" action button that appears for stale manual translations. The button triggers re-translation of the content using the `onUpdateTranslation` callback and displays appropriate loading states.

#### Acceptance Criteria
- [ ] "Update" button renders only when `isStale === true` AND `status === 'manual'` AND `onUpdateTranslation` is provided
- [ ] Button uses yellow color scheme (`bg-yellow-500`, `hover:bg-yellow-600`)
- [ ] Button displays `RefreshCw` icon alongside "Update" text
- [ ] Button shows `Loader2` spinner (animated) during loading state
- [ ] Button is disabled when `isActionLoading === true`
- [ ] Button has minimum 48px touch target on mobile, 32px on desktop
- [ ] Button has appropriate `aria-label` describing the action
- [ ] Button has proper focus ring styling
- [ ] Button clicks call `onUpdateTranslation` callback

#### Implementation Details

**Step 5.1:** Add Update button to action buttons section
```tsx
{/* Update Translation button for stale manual translations */}
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
      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
    ) : (
      <RefreshCw className="w-3 h-3" aria-hidden="true" />
    )}
    <span>Update</span>
  </button>
)}
```

**Step 5.2:** Position Update button in action buttons group (before Edit/Re-translate)
```tsx
<div className="flex items-center gap-1">
  {/* NEW: Update button for stale translations */}
  {isStale && status === 'manual' && onUpdateTranslation && (
    <UpdateButton />
  )}

  {/* Existing Edit button */}
  {(status === 'completed' || status === 'manual') && onEdit && (
    <EditButton />
  )}

  {/* Existing Re-translate button */}
  {(status === 'completed' || status === 'manual') && onRetranslate && (
    <RetranslateButton />
  )}

  {/* Existing Retry button */}
  {status === 'failed' && onRetry && (
    <RetryButton />
  )}
</div>
```

#### Verification Steps
1. Render with `isStale={true}`, `status="manual"`, and valid `onUpdateTranslation` - button should appear
2. Render without `onUpdateTranslation` - button should not appear
3. Click button - `onUpdateTranslation` callback should be called
4. Set `isActionLoading={true}` - button should show spinner and be disabled
5. Verify 48px touch target on mobile viewport
6. Tab to button and press Enter - callback should be called
7. Verify focus ring appears on keyboard focus

---

### Task 6: Add Accessibility Attributes

**Story Points:** 0.5 (15 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
**Type:** Code Modification

#### Description
Ensure all stale-related UI elements have proper ARIA attributes for screen reader users and keyboard navigation.

#### Acceptance Criteria
- [ ] Row `aria-label` includes stale status when applicable
- [ ] Stale badge has `role="status"` for live announcements
- [ ] Stale badge has `aria-label` describing the condition
- [ ] Tooltip content is accessible via `title` attribute as fallback
- [ ] Update button has descriptive `aria-label`
- [ ] Screen reader-only text announces stale state changes
- [ ] Icons have `aria-hidden="true"` to prevent duplicate announcements

#### Implementation Details

**Step 6.1:** Update row container aria-label to include stale state
```tsx
<div
  role="listitem"
  aria-label={cn(
    `${languageConfig.nativeName} translation: ${statusConfig.label}`,
    isStale && status === 'manual' && ', content is outdated and needs update'
  )}
  className={rowStyles}
>
```

**Step 6.2:** Add screen reader-only announcement for stale state
```tsx
{/* Screen reader announcement for stale state */}
{isStale && status === 'manual' && (
  <span className="sr-only" aria-live="polite">
    Warning: {languageName} manual translation is stale. Source content has been updated.
  </span>
)}
```

**Step 6.3:** Ensure stale badge has title attribute as tooltip fallback
```tsx
<span
  className={/* stale badge classes */}
  role="status"
  aria-label="Translation is stale - source content has been updated"
  title={STALE_CONFIG.description}
>
  {/* badge content */}
</span>
```

**Step 6.4:** Verify all icons have aria-hidden
```tsx
<AlertTriangle className="w-3 h-3" aria-hidden="true" />
<RefreshCw className="w-3 h-3" aria-hidden="true" />
<Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
```

#### Verification Steps
1. Use screen reader (VoiceOver/NVDA) to navigate to stale row - should announce stale status
2. Use screen reader on stale badge - should announce warning message
3. Use screen reader on Update button - should announce full action description
4. Verify icons are not announced separately by screen reader
5. Tab through component - focus should be clear and keyboard-navigable

---

### Task 7: Update TranslationPreviewPanel Integration

**Story Points:** 0.5 (20 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
**Type:** Code Modification

#### Description
Update the parent TranslationPreviewPanel to calculate stale status for each translation and pass the `isStale` prop and `onUpdateTranslation` callback to TranslationStatusItem.

#### Acceptance Criteria
- [ ] `isStale` calculated by comparing `source_version_at > updated_at` timestamps
- [ ] Stale calculation only returns true for manual translations
- [ ] Stale calculation handles null/undefined timestamps gracefully
- [ ] `isStale` prop passed to each TranslationStatusItem
- [ ] `onUpdateTranslation` callback implemented to call re-translate API
- [ ] Callback passes single language and single entity to API
- [ ] Loading state managed during update operation

#### Implementation Details

**Step 7.1:** Create isStale helper function
```typescript
/**
 * Determines if a manual translation is stale
 * A translation is stale when source content was modified after the manual edit
 */
const isTranslationStale = (translation: TranslationRecord): boolean => {
  // Only manual translations can be stale
  if (translation.translation_status !== 'manual') {
    return false;
  }

  // Require both timestamps for comparison
  if (!translation.source_version_at || !translation.updated_at) {
    return false;
  }

  const sourceVersionDate = new Date(translation.source_version_at);
  const translationUpdatedDate = new Date(translation.updated_at);

  return sourceVersionDate > translationUpdatedDate;
};
```

**Step 7.2:** Implement handleUpdateTranslation callback
```typescript
const handleUpdateTranslation = async (language: SupportedLanguage) => {
  if (!entityId || !entityType) return;

  setLoadingLanguages((prev) => [...prev, language]);

  try {
    const response = await fetch('/api/translations/retranslate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entities: [{ type: entityType, id: entityId }],
        languages: [language],
        overwriteManual: true, // Explicitly overwrite the stale manual translation
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update translation');
    }

    // Success - realtime subscription will update the UI
  } catch (error) {
    console.error('Error updating translation:', error);
    // Show error toast if available
  } finally {
    setLoadingLanguages((prev) => prev.filter((l) => l !== language));
  }
};
```

**Step 7.3:** Update TranslationStatusItem usage
```tsx
<TranslationStatusItem
  key={lang}
  language={lang}
  languageName={LANGUAGE_CONFIG[lang].nativeName}
  status={translation?.status ?? 'pending'}
  previewText={translation?.content?.title || translation?.content?.description}
  translatedAt={translation?.translatedAt}
  isStale={isTranslationStale(translation)}
  sourceVersionAt={translation?.source_version_at}
  reviewedBy={translation?.reviewedBy}
  onEdit={() => handleEdit(lang)}
  onRetranslate={() => handleRetranslate(lang)}
  onRetry={() => handleRetry(lang)}
  onUpdateTranslation={() => handleUpdateTranslation(lang)}
  isActionLoading={loadingLanguages.includes(lang)}
/>
```

#### Verification Steps
1. Mock translation data with `source_version_at` > `updated_at` and status `manual` - `isStale` should be true
2. Mock translation with status `completed` even with old timestamp - `isStale` should be false
3. Mock translation with missing `source_version_at` - `isStale` should be false
4. Click Update button - API call should be made with correct parameters
5. Verify loading state shows during API call
6. Verify UI updates after successful API response (via realtime or refetch)

---

### Task 8: Write Unit Tests for Stale Indicator

**Story Points:** 1 (30 minutes)
**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.stale.test.tsx`
**Type:** New File (Test)

#### Description
Create comprehensive unit tests for the stale indicator functionality to ensure correct rendering, interaction, and accessibility.

#### Acceptance Criteria
- [ ] Test file created in `__tests__` directory
- [ ] Test: Stale badge renders when `isStale=true` and `status='manual'`
- [ ] Test: Stale badge does NOT render when `isStale=false`
- [ ] Test: Stale badge does NOT render for non-manual statuses even with `isStale=true`
- [ ] Test: Yellow border appears on stale rows
- [ ] Test: Update button renders for stale translations
- [ ] Test: Update button calls `onUpdateTranslation` callback on click
- [ ] Test: Tooltip displays on hover (if testable)
- [ ] Test: Loading state disables Update button
- [ ] Test: Accessibility attributes present (role, aria-label)
- [ ] All tests pass

#### Implementation Details

**Step 8.1:** Create test file
```typescript
// /src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.stale.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TranslationStatusItem } from '../TranslationStatusItem';

describe('TranslationStatusItem - Stale Indicator', () => {
  const defaultProps = {
    language: 'de' as const,
    languageName: 'Deutsch',
    status: 'manual' as const,
    previewText: 'Wie man die Spulmaschine benutzt',
  };

  describe('Stale Badge Rendering', () => {
    it('renders stale badge when isStale is true and status is manual', () => {
      render(<TranslationStatusItem {...defaultProps} isStale={true} />);
      expect(screen.getByText('Stale')).toBeInTheDocument();
    });

    it('does not render stale badge when isStale is false', () => {
      render(<TranslationStatusItem {...defaultProps} isStale={false} />);
      expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    });

    it('does not render stale badge for completed status even with isStale true', () => {
      render(
        <TranslationStatusItem
          {...defaultProps}
          status="completed"
          isStale={true}
        />
      );
      expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    });

    it('does not render stale badge for pending status', () => {
      render(
        <TranslationStatusItem
          {...defaultProps}
          status="pending"
          isStale={true}
        />
      );
      expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    });

    it('does not render stale badge for failed status', () => {
      render(
        <TranslationStatusItem
          {...defaultProps}
          status="failed"
          isStale={true}
        />
      );
      expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    });
  });

  describe('Stale Row Styling', () => {
    it('applies yellow border class to stale manual translations', () => {
      const { container } = render(
        <TranslationStatusItem {...defaultProps} isStale={true} />
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass('border-yellow-300');
    });

    it('applies gray border to non-stale translations', () => {
      const { container } = render(
        <TranslationStatusItem {...defaultProps} isStale={false} />
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass('border-gray-100');
    });
  });

  describe('Update Translation Button', () => {
    it('renders Update button for stale manual translations', () => {
      const onUpdate = vi.fn();
      render(
        <TranslationStatusItem
          {...defaultProps}
          isStale={true}
          onUpdateTranslation={onUpdate}
        />
      );
      expect(screen.getByRole('button', { name: /update.*translation/i })).toBeInTheDocument();
    });

    it('does not render Update button when onUpdateTranslation is not provided', () => {
      render(<TranslationStatusItem {...defaultProps} isStale={true} />);
      expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    });

    it('calls onUpdateTranslation when Update button is clicked', () => {
      const onUpdate = vi.fn();
      render(
        <TranslationStatusItem
          {...defaultProps}
          isStale={true}
          onUpdateTranslation={onUpdate}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /update.*translation/i }));
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('disables Update button when isActionLoading is true', () => {
      const onUpdate = vi.fn();
      render(
        <TranslationStatusItem
          {...defaultProps}
          isStale={true}
          onUpdateTranslation={onUpdate}
          isActionLoading={true}
        />
      );
      const button = screen.getByRole('button', { name: /update.*translation/i });
      expect(button).toBeDisabled();
    });

    it('shows loading spinner when isActionLoading is true', () => {
      const onUpdate = vi.fn();
      render(
        <TranslationStatusItem
          {...defaultProps}
          isStale={true}
          onUpdateTranslation={onUpdate}
          isActionLoading={true}
        />
      );
      // Check for spinning loader (Loader2 icon with animate-spin class)
      const button = screen.getByRole('button', { name: /update.*translation/i });
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('stale badge has role="status"', () => {
      render(<TranslationStatusItem {...defaultProps} isStale={true} />);
      const staleBadge = screen.getByRole('status');
      expect(staleBadge).toHaveTextContent('Stale');
    });

    it('stale badge has appropriate aria-label', () => {
      render(<TranslationStatusItem {...defaultProps} isStale={true} />);
      const staleBadge = screen.getByRole('status');
      expect(staleBadge).toHaveAttribute('aria-label', expect.stringContaining('stale'));
    });

    it('Update button has descriptive aria-label', () => {
      const onUpdate = vi.fn();
      render(
        <TranslationStatusItem
          {...defaultProps}
          isStale={true}
          onUpdateTranslation={onUpdate}
        />
      );
      const button = screen.getByRole('button', { name: /update.*deutsch.*translation/i });
      expect(button).toBeInTheDocument();
    });

    it('row aria-label includes stale state', () => {
      const { container } = render(
        <TranslationStatusItem {...defaultProps} isStale={true} />
      );
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveAttribute('aria-label', expect.stringContaining('outdated'));
    });
  });
});
```

#### Verification Steps
1. Run `npm run test -- TranslationStatusItem.stale` - all tests should pass
2. Check test coverage includes stale-related code paths
3. Verify tests run in CI pipeline

---

## Files Summary

### Files to Modify

| File Path | Tasks | Changes |
|-----------|-------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | 1-6 | Add STALE_CONFIG, extend props, update styling, add badge, add button, add accessibility |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | 7 | Add isStale calculation, handleUpdateTranslation callback, pass props |

### Files to Create

| File Path | Task | Purpose |
|-----------|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.stale.test.tsx` | 8 | Unit tests for stale indicator functionality |

### Files for Reference Only

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types (SupportedLanguage, TranslationStatusType) |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Badge styling patterns |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | UI Visual Specifications |
| `/docs/REQ-311-create-translationstatusitem-component-overview.md` | Base component specification |

---

## Visual Design Reference

### Stale Row Mockup
```
┌─────────────────────────────────────────────────────────────────────────┐
│ DE Deutsch ✎ Manual  ⚠️ Stale              [Update] [Edit] [↻]         │
│    Wie man die Spulmaschine benutzt                                    │
└─────────────────────────────────────────────────────────────────────────┘
 ↑ yellow border                             ↑ yellow button
   bg-yellow-50/50 tint                        bg-yellow-500
```

### Color Specifications

| Element | Tailwind Class | Hex Value |
|---------|----------------|-----------|
| Stale icon | `text-yellow-500` | #EAB308 |
| Stale badge bg | `bg-yellow-100` | #FEF9C3 |
| Stale badge border | `border-yellow-300` | #FDE047 |
| Stale badge text | `text-yellow-700` | #A16207 |
| Row border (stale) | `border-yellow-300` | #FDE047 |
| Row bg (stale) | `bg-yellow-50/50` | #FEFCE8 @ 50% |
| Update button bg | `bg-yellow-500` | #EAB308 |
| Update button hover | `bg-yellow-600` | #CA8A04 |

---

## Testing Checklist

### Automated Tests
- [ ] Unit tests pass for stale badge rendering conditions
- [ ] Unit tests pass for stale row styling
- [ ] Unit tests pass for Update button functionality
- [ ] Unit tests pass for accessibility attributes
- [ ] Build passes without TypeScript errors
- [ ] Lint passes without warnings

### Manual Testing
- [ ] Stale badge displays with yellow AlertTriangle icon
- [ ] Badge positioned adjacent to "Manual" status badge
- [ ] Tooltip displays on hover: "Source content has been updated since this translation was manually edited"
- [ ] Yellow border visible around stale row
- [ ] Yellow background tint distinguishes from other states
- [ ] Update button uses yellow color scheme
- [ ] Update button shows loading spinner during action
- [ ] Update button disabled during loading
- [ ] Button touch targets meet 48px minimum on mobile
- [ ] Screen reader announces stale status
- [ ] Keyboard focus visible on Update button
- [ ] Non-manual translations never show stale indicator
- [ ] Stale indicator disappears after successful re-translation

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| REQ-339 (source_version_at columns) not complete | Add null checks in isStale calculation; gracefully return false when column missing |
| REQ-311 (TranslationStatusItem) incomplete | Coordinate with dependent task; stub component structure if needed |
| Re-translate API (REQ-338) not ready | Mock API response for testing; add error handling for 404 |
| Tooltip inaccessible on touch devices | Use `title` attribute as fallback; consider long-press interaction |
| Yellow conflicts with amber pending state | Use distinct shades (yellow-500 vs amber-500); verify visual contrast |

---

## Definition of Done

- [ ] All 8 tasks completed and verified
- [ ] All unit tests pass
- [ ] Manual testing checklist complete
- [ ] Code reviewed (if applicable)
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Documentation updated (this file marked complete)

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*REQ-356: Implement Stale Translation Indicator*
