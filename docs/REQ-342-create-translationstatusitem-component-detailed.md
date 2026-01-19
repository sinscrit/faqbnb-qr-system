# REQ-342: Create TranslationStatusItem Component - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks (Senior Dev Breakdown)
**Request ID:** REQ-342, Task 2.3
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Phase:** 2 - Core UI Components
**Parent Epic:** L10N Epic 5 - Owner Translation Management

---

## Document Purpose

This document provides granular, implementation-ready tasks for creating the `TranslationStatusItem` component. Each task is scoped to approximately 1 story point and includes specific file paths, code patterns, and acceptance criteria that an AI coding agent or junior developer can execute step-by-step.

---

## Component Summary

The `TranslationStatusItem` component is a single-row presentation component that displays the translation status for one language within the `TranslationPreviewPanel`. Each row shows:
- Language flag emoji and native name
- Colored status indicator (icon + label)
- Preview of translated text (truncated)
- Action buttons (Edit, Re-translate, Retry)

This component is stateless and controlled, receiving all data via props and delegating actions to the parent component.

---

## Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2.1: TranslationManagement.types.ts | Must complete first | Shared types for the component |
| Translation service types | Available | `/src/lib/translation-service/translation-service.types.ts` |
| i18n config | Available | `/src/lib/i18n/config.ts` |
| cn utility | Available | `/src/lib/utils.ts` |

---

## Task Breakdown

### Task 2.3.1: Create Component Directory and File Structure

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.1 must be complete

#### Description
Create the directory structure and initial component file with proper file header, imports, and JSDoc documentation.

#### Files to Create
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Create the directory if it doesn't exist:
   ```
   /src/components/TranslationManagement/TranslationPreviewPanel/
   ```

2. Create `TranslationStatusItem.tsx` with the following structure:

```typescript
'use client';

/**
 * TranslationStatusItem Component
 *
 * Displays a single language's translation status within the TranslationPreviewPanel.
 * Shows language flag, name, status indicator, preview text, and action buttons.
 *
 * Status colors follow design spec:
 * - Completed: green (#22C55E) - text-green-500
 * - Pending/Processing: orange (#F59E0B) - text-amber-500
 * - Failed: red (#EF4444) - text-red-500
 * - Manual: purple (#8B5CF6) - text-violet-500
 * - Stale: yellow warning overlay (#EAB308) - text-yellow-500
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import React from 'react';
import {
  Check,
  Clock,
  X,
  Pencil,
  AlertTriangle,
  RotateCcw,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  SupportedLanguage,
  TranslationStatus,
} from '@/lib/translation-service/translation-service.types';
import {
  getLanguageInfo,
  SUPPORTED_LANGUAGES,
} from '@/lib/translation-service/translation-service.types';

// Component implementation follows in subsequent tasks...
```

#### Acceptance Criteria
- [ ] Directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists
- [ ] File `TranslationStatusItem.tsx` is created
- [ ] File contains `'use client'` directive
- [ ] File contains JSDoc header with component description
- [ ] All required imports are present (React, Lucide icons, cn, types)
- [ ] File compiles without TypeScript errors

---

### Task 2.3.2: Define Props Interface and Type Mappings

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.3.1

#### Description
Define the `TranslationStatusItemProps` interface and create helper type mappings for status-to-color and status-to-icon relationships.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Add the props interface after the imports:

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TranslationStatusItem component
 */
export interface TranslationStatusItemProps {
  /** Language code for this translation (en, fr, es, de, nl, it) */
  language: SupportedLanguage;

  /** Current translation status */
  status: TranslationStatus;

  /** Preview of translated text (truncated if needed) */
  previewText?: string;

  /** Whether this is the source/original language */
  isSource?: boolean;

  /** Whether the translation is stale (source updated after translation) */
  isStale?: boolean;

  /** Callback when Edit button is clicked */
  onEdit?: () => void;

  /** Callback when Re-translate button is clicked */
  onRetranslate?: () => void;

  /** Callback when Retry button is clicked (for failed translations) */
  onRetry?: () => void;

  /** Whether actions are currently disabled (e.g., during processing) */
  disabled?: boolean;

  /** Loading state for this specific row */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

2. Add the status configuration mapping:

```typescript
// =============================================================================
// Status Configuration
// =============================================================================

/**
 * Configuration for each translation status
 * Maps status to icon component, color class, and display label
 */
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    label: 'Processing',
    animate: true,
  },
  completed: {
    icon: Check,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    label: 'Completed',
  },
  failed: {
    icon: X,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Failed',
  },
  manual: {
    icon: Pencil,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    label: 'Manual',
  },
} as const;

/**
 * Type for status configuration keys
 */
type StatusConfigKey = keyof typeof STATUS_CONFIG;
```

#### Acceptance Criteria
- [ ] `TranslationStatusItemProps` interface is defined with all required props
- [ ] All props have JSDoc comments
- [ ] `STATUS_CONFIG` object maps all 5 statuses (pending, processing, completed, failed, manual)
- [ ] Each status config includes icon, color, bgColor, and label
- [ ] Processing status includes `animate: true` flag
- [ ] TypeScript compiles without errors

---

### Task 2.3.3: Implement StatusIcon Sub-Component

**Effort:** 1 story point (~20 minutes)
**Dependencies:** Task 2.3.2

#### Description
Create an internal `StatusIcon` sub-component that renders the appropriate icon with correct styling based on translation status.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Add the StatusIcon component after the constants:

```typescript
// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Internal component for rendering status icon with appropriate styling
 */
interface StatusIconProps {
  status: TranslationStatus;
  isStale?: boolean;
  className?: string;
}

function StatusIcon({ status, isStale, className }: StatusIconProps) {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;
  const isAnimated = 'animate' in config && config.animate;

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* Main status icon */}
      <IconComponent
        className={cn(
          'w-4 h-4',
          config.color,
          isAnimated && 'animate-spin'
        )}
        aria-hidden="true"
      />

      {/* Stale indicator overlay */}
      {isStale && (
        <div
          className="absolute -top-1 -right-1"
          title="Translation may be outdated - source content has been updated"
        >
          <AlertTriangle
            className="w-3 h-3 text-yellow-500"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] `StatusIcon` component is defined with `StatusIconProps` interface
- [ ] Component renders correct icon for each status type
- [ ] Icons use correct color classes from `STATUS_CONFIG`
- [ ] Processing status icon has `animate-spin` class
- [ ] Stale indicator (yellow AlertTriangle) overlays when `isStale` is true
- [ ] Stale indicator has descriptive title attribute
- [ ] Icons have `aria-hidden="true"` for accessibility

---

### Task 2.3.4: Implement StatusBadge Sub-Component

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.3.3

#### Description
Create a `StatusBadge` sub-component that combines the status icon with a text label in a pill-shaped container.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Add the StatusBadge component after StatusIcon:

```typescript
/**
 * Internal component for rendering status badge with icon and label
 */
interface StatusBadgeProps {
  status: TranslationStatus;
  isStale?: boolean;
}

function StatusBadge({ status, isStale }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color
      )}
      role="status"
      aria-label={`Translation status: ${config.label}${isStale ? ', content may be outdated' : ''}`}
    >
      <StatusIcon status={status} isStale={isStale} />
      <span>{config.label}</span>
    </span>
  );
}
```

#### Acceptance Criteria
- [ ] `StatusBadge` component is defined
- [ ] Badge displays icon and label text
- [ ] Badge has pill shape with rounded-full styling
- [ ] Badge uses background color from config (e.g., `bg-green-50`)
- [ ] Badge has appropriate ARIA role and label for accessibility
- [ ] Stale state is included in aria-label

---

### Task 2.3.5: Implement Action Buttons Component

**Effort:** 1 story point (~25 minutes)
**Dependencies:** Task 2.3.2

#### Description
Create an `ActionButtons` sub-component that renders conditional action buttons (Edit, Re-translate, Retry) based on status.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Add the ActionButtons component:

```typescript
/**
 * Internal component for rendering action buttons based on status
 */
interface ActionButtonsProps {
  status: TranslationStatus;
  language: SupportedLanguage;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

function ActionButtons({
  status,
  language,
  onEdit,
  onRetranslate,
  onRetry,
  disabled,
  isLoading,
}: ActionButtonsProps) {
  const languageInfo = getLanguageInfo(language);
  const languageName = languageInfo?.name || language.toUpperCase();

  // Determine which actions are available based on status
  const showEdit = ['completed', 'manual'].includes(status);
  const showRetranslate = ['completed', 'manual', 'failed'].includes(status);
  const showRetry = status === 'failed';

  // Base button styles
  const buttonBaseStyles = cn(
    'inline-flex items-center justify-center',
    'px-2 py-1 text-xs font-medium rounded',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // 44px minimum touch target on mobile
    'min-h-[32px] md:min-h-[28px]',
    'touch-manipulation'
  );

  const primaryButtonStyles = cn(
    buttonBaseStyles,
    'text-gray-700 bg-white border border-gray-300',
    'hover:bg-gray-50 active:bg-gray-100',
    'focus:ring-blue-500',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const retryButtonStyles = cn(
    buttonBaseStyles,
    'text-red-700 bg-red-50 border border-red-200',
    'hover:bg-red-100 active:bg-red-200',
    'focus:ring-red-500',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  // Don't render anything for pending/processing states
  if (status === 'pending' || status === 'processing') {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Edit Button */}
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled || isLoading}
          className={primaryButtonStyles}
          aria-label={`Edit ${languageName} translation`}
        >
          <Pencil className="w-3 h-3 mr-1" aria-hidden="true" />
          Edit
        </button>
      )}

      {/* Re-translate Button */}
      {showRetranslate && onRetranslate && (
        <button
          type="button"
          onClick={onRetranslate}
          disabled={disabled || isLoading}
          className={primaryButtonStyles}
          aria-label={`Re-translate to ${languageName}`}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" aria-hidden="true" />
          )}
          Re-translate
        </button>
      )}

      {/* Retry Button (Failed only) */}
      {showRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={disabled || isLoading}
          className={retryButtonStyles}
          aria-label={`Retry failed ${languageName} translation`}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw className="w-3 h-3 mr-1" aria-hidden="true" />
          )}
          Retry
        </button>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] `ActionButtons` component is defined with proper props interface
- [ ] Edit button appears for `completed` and `manual` statuses
- [ ] Re-translate button appears for `completed`, `manual`, and `failed` statuses
- [ ] Retry button appears only for `failed` status
- [ ] No buttons appear for `pending` or `processing` statuses
- [ ] Buttons have descriptive aria-labels including language name
- [ ] Buttons show loading spinner when `isLoading` is true
- [ ] Buttons respect `disabled` prop
- [ ] Retry button has distinct styling (red theme)
- [ ] Buttons have minimum touch target size (32px mobile)

---

### Task 2.3.6: Implement Main Component Layout

**Effort:** 1 story point (~30 minutes)
**Dependencies:** Tasks 2.3.3, 2.3.4, 2.3.5

#### Description
Implement the main `TranslationStatusItem` component that combines all sub-components into a cohesive row layout.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Add the main component implementation:

```typescript
// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationStatusItem - Single row showing translation status for one language
 *
 * Layout structure:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [Flag] [Language Name] [Status Badge]              [Actions]    │
 * │        [Preview text (truncated)]                               │
 * └─────────────────────────────────────────────────────────────────┘
 */
export function TranslationStatusItem({
  language,
  status,
  previewText,
  isSource = false,
  isStale = false,
  onEdit,
  onRetranslate,
  onRetry,
  disabled = false,
  isLoading = false,
  className,
}: TranslationStatusItemProps) {
  // Get language metadata
  const languageInfo = getLanguageInfo(language);

  // Fallback if language info not found
  const flag = languageInfo?.flag || '🌐';
  const nativeName = languageInfo?.nativeName || language.toUpperCase();
  const englishName = languageInfo?.name || language.toUpperCase();

  // Container styles
  const containerStyles = cn(
    'group relative',
    'px-3 py-2.5',
    'border-b border-gray-100 last:border-b-0',
    'transition-colors duration-150',
    'hover:bg-gray-50',
    isSource && 'bg-blue-50/50',
    className
  );

  return (
    <div
      className={containerStyles}
      role="listitem"
      aria-label={`${englishName} translation: ${status}${isStale ? ', outdated' : ''}`}
    >
      {/* Main row layout */}
      <div className="flex items-center justify-between gap-3">
        {/* Left side: Flag + Language + Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Flag */}
          <span
            className="text-lg flex-shrink-0"
            role="img"
            aria-label={`${englishName} flag`}
          >
            {flag}
          </span>

          {/* Language name and status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
            <span className="font-medium text-sm text-gray-900 truncate">
              {nativeName}
            </span>

            {/* Source indicator */}
            {isSource && (
              <span className="text-xs text-blue-600 font-medium">
                (Source)
              </span>
            )}

            {/* Status badge - hidden on very small screens, shown in second row */}
            <div className="hidden sm:block">
              <StatusBadge status={status} isStale={isStale} />
            </div>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex-shrink-0">
          <ActionButtons
            status={status}
            language={language}
            onEdit={onEdit}
            onRetranslate={onRetranslate}
            onRetry={onRetry}
            disabled={disabled}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Second row: Status badge (mobile) + Preview text */}
      <div className="mt-1.5 pl-8">
        {/* Status badge on mobile */}
        <div className="sm:hidden mb-1">
          <StatusBadge status={status} isStale={isStale} />
        </div>

        {/* Preview text */}
        {previewText ? (
          <p className="text-sm text-gray-600 line-clamp-2">
            {previewText}
          </p>
        ) : status === 'pending' || status === 'processing' ? (
          <p className="text-sm text-gray-400 italic">
            Translating...
          </p>
        ) : status === 'failed' ? (
          <p className="text-sm text-red-600">
            Translation failed. Click Retry to try again.
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No preview available
          </p>
        )}
      </div>

      {/* Stale indicator tooltip area */}
      {isStale && (
        <div className="absolute top-1 right-1">
          <div
            className="p-1 rounded-full bg-yellow-100"
            title="Source content has been updated. Consider re-translating."
          >
            <AlertTriangle className="w-3 h-3 text-yellow-600" />
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Main component is exported as named export `TranslationStatusItem`
- [ ] Row displays flag emoji aligned to the left
- [ ] Row displays language native name adjacent to flag
- [ ] Row displays status badge on desktop, in second row on mobile
- [ ] Row displays preview text with 2-line truncation (`line-clamp-2`)
- [ ] Row shows "Translating..." for pending/processing states
- [ ] Row shows error message for failed state
- [ ] Row shows "No preview available" when no preview text provided
- [ ] Source language row has blue background tint
- [ ] Stale indicator shows when `isStale` is true
- [ ] Row has hover state (`hover:bg-gray-50`)
- [ ] Row uses `role="listitem"` for accessibility
- [ ] Row has appropriate aria-label describing status

---

### Task 2.3.7: Add Keyboard Navigation and Focus Management

**Effort:** 1 story point (~15 minutes)
**Dependencies:** Task 2.3.6

#### Description
Enhance the component with keyboard navigation support and proper focus management for accessibility.

#### File to Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

#### Implementation Steps

1. Update the main component to handle keyboard navigation:

```typescript
// Add to the main component, after the languageInfo lookups:

  // Ref for focus management
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle keyboard navigation within the row
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Enter/Space on the row itself focuses the first action button
      if (e.key === 'Enter' || e.key === ' ') {
        const firstButton = containerRef.current?.querySelector('button');
        if (firstButton && e.target === containerRef.current) {
          e.preventDefault();
          firstButton.focus();
        }
      }
    },
    []
  );
```

2. Update the container div to be focusable:

```typescript
// Update the container styles to include focus states:
const containerStyles = cn(
  'group relative',
  'px-3 py-2.5',
  'border-b border-gray-100 last:border-b-0',
  'transition-colors duration-150',
  'hover:bg-gray-50',
  'focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500',
  isSource && 'bg-blue-50/50',
  className
);

// Update the container div:
<div
  ref={containerRef}
  className={containerStyles}
  role="listitem"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  aria-label={`${englishName} translation: ${status}${isStale ? ', outdated' : ''}`}
>
```

#### Acceptance Criteria
- [ ] Container div has `tabIndex={0}` for keyboard focus
- [ ] Container has `focus-within` ring styling when any child is focused
- [ ] Enter/Space on container focuses first action button
- [ ] All interactive elements (buttons) are keyboard accessible
- [ ] Focus order is logical (left to right, top to bottom)

---

### Task 2.3.8: Add Default Export and Component Index

**Effort:** 1 story point (~10 minutes)
**Dependencies:** Task 2.3.7

#### Description
Add default export to the component file and create/update the barrel export files for the component.

#### Files to Create/Modify
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` (add default export)
- `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` (create/update)
- `/src/components/TranslationManagement/index.ts` (create/update if needed)

#### Implementation Steps

1. Add default export at the end of `TranslationStatusItem.tsx`:

```typescript
// At the end of the file
export default TranslationStatusItem;
```

2. Create or update `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`:

```typescript
/**
 * TranslationPreviewPanel barrel exports
 * @module TranslationManagement/TranslationPreviewPanel
 * @lastModified 2026-01-19
 */

export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';

// Future exports:
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';
// export { TranslationProgressBar } from './TranslationProgressBar';
```

3. Create or update `/src/components/TranslationManagement/index.ts`:

```typescript
/**
 * TranslationManagement component barrel exports
 * @module TranslationManagement
 * @lastModified 2026-01-19
 */

// TranslationPreviewPanel components
export * from './TranslationPreviewPanel';

// Future exports:
// export * from './TranslationEditor';
// export * from './TranslationStatusWidget';
// export * from './TranslationStatusColumn';
// export * from './TranslationStatusFilter';
// export * from './BulkTranslationBar';
// export * from './ManualEditWarning';
// export * from './LanguagePreference';
```

#### Acceptance Criteria
- [ ] `TranslationStatusItem` has both named and default exports
- [ ] `TranslationStatusItemProps` type is exported
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` exports the component
- [ ] `/src/components/TranslationManagement/index.ts` re-exports from TranslationPreviewPanel
- [ ] Import `{ TranslationStatusItem } from '@/components/TranslationManagement'` works
- [ ] TypeScript compiles without errors

---

### Task 2.3.9: Write Unit Tests (Optional - Phase 7)

**Effort:** 2 story points (~45 minutes)
**Dependencies:** Task 2.3.8
**Note:** This task is for Phase 7 testing but documented here for completeness

#### Description
Create unit tests for the TranslationStatusItem component covering all states and interactions.

#### File to Create
- `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.test.tsx`

#### Test Cases to Implement

```typescript
describe('TranslationStatusItem', () => {
  // Rendering tests
  it('renders language flag and name correctly');
  it('renders all status types with correct colors');
  it('renders preview text when provided');
  it('renders "Translating..." for pending status');
  it('renders error message for failed status');
  it('renders stale indicator when isStale is true');
  it('renders source indicator when isSource is true');

  // Action button tests
  it('shows Edit button for completed status');
  it('shows Edit button for manual status');
  it('shows Re-translate button for completed, manual, failed');
  it('shows Retry button only for failed status');
  it('hides all buttons for pending status');
  it('hides all buttons for processing status');

  // Interaction tests
  it('calls onEdit when Edit button clicked');
  it('calls onRetranslate when Re-translate button clicked');
  it('calls onRetry when Retry button clicked');
  it('disables buttons when disabled prop is true');
  it('shows loading state when isLoading is true');

  // Accessibility tests
  it('has correct ARIA attributes');
  it('is keyboard navigable');
  it('has descriptive button labels');
});
```

#### Acceptance Criteria
- [ ] Test file created in `__tests__` directory
- [ ] All rendering tests pass
- [ ] All interaction tests pass
- [ ] All accessibility tests pass
- [ ] Tests use React Testing Library best practices
- [ ] Test coverage > 80%

---

## Complete File Structure

After completing all tasks, the file structure should be:

```
/src/components/TranslationManagement/
├── index.ts                              # Re-exports all components
├── TranslationManagement.types.ts        # Shared types (from Task 2.1)
│
└── TranslationPreviewPanel/
    ├── index.ts                          # Barrel exports
    ├── TranslationStatusItem.tsx         # This component
    └── __tests__/
        └── TranslationStatusItem.test.tsx  # Unit tests (Phase 7)
```

---

## Integration Example

After implementation, the component can be used like this:

```tsx
import { TranslationStatusItem } from '@/components/TranslationManagement';

// In TranslationPreviewPanel
<div role="list">
  {SUPPORTED_LANGUAGES.map((lang) => (
    <TranslationStatusItem
      key={lang.code}
      language={lang.code}
      status={translations[lang.code]?.status || 'pending'}
      previewText={translations[lang.code]?.content?.title}
      isSource={lang.code === sourceLanguage}
      isStale={translations[lang.code]?.isStale}
      onEdit={() => handleEdit(lang.code)}
      onRetranslate={() => handleRetranslate(lang.code)}
      onRetry={() => handleRetry(lang.code)}
      disabled={isProcessing}
      isLoading={loadingLanguages.includes(lang.code)}
    />
  ))}
</div>
```

---

## Visual Reference

### Status Display Examples

```
┌─────────────────────────────────────────────────────────────────┐
│ 🇫🇷 Français    ✓ Completed                    [Edit] [↻]      │
│    Comment utiliser le lave-vaisselle                           │
├─────────────────────────────────────────────────────────────────┤
│ 🇪🇸 Español     ✎ Manual                       [Edit] [↻]      │
│    Cómo usar el lavavajillas                                    │
├─────────────────────────────────────────────────────────────────┤
│ 🇩🇪 Deutsch     ⏳ Processing                                   │
│    Translating...                                               │
├─────────────────────────────────────────────────────────────────┤
│ 🇳🇱 Nederlands  ✗ Failed                       [Retry] [↻]     │
│    Translation failed. Click Retry to try again.                │
├─────────────────────────────────────────────────────────────────┤
│ 🇮🇹 Italiano    ✓ Completed ⚠️                  [Edit] [↻]      │
│    Come usare la lavastoviglie (may be outdated)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Summary

### Component Requirements
- [ ] Component file created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- [ ] Row displays language flag icon aligned to the left
- [ ] Row displays language name (native name) adjacent to the flag
- [ ] Row displays status indicator using specified color coding
- [ ] Row displays preview text of translation, truncated appropriately
- [ ] Row includes action buttons for edit, re-translate, and retry operations
- [ ] Retry button appears only when status indicates translation failure
- [ ] Row maintains consistent height across different languages and content lengths
- [ ] Row is keyboard accessible for navigation and action triggering
- [ ] Row styling provides clear visual separation from adjacent rows
- [ ] Clicking action buttons triggers appropriate callbacks
- [ ] Stale indicator shows when isStale prop is true
- [ ] Loading state displays appropriately
- [ ] Component exported from index files

### Technical Requirements
- [ ] TypeScript strict mode compliant
- [ ] All props have JSDoc documentation
- [ ] ARIA attributes for accessibility
- [ ] Mobile-responsive design
- [ ] Follows existing codebase patterns (TagChip, InlineEdit, LanguageSwitcher)

---

## References

- **Overview Document:** `/docs/REQ-342-create-translationstatusitem-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference (TagChip):** `/src/components/ItemManager/components/shared/TagChip.tsx`
- **Pattern Reference (InlineEdit):** `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- **Pattern Reference (LanguageSwitcher):** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
