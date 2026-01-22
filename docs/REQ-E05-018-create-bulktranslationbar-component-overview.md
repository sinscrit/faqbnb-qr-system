# REQ-E05-018: Create BulkTranslationBar Component - Implementation Overview

**Created**: 2026-01-22 19:48
**Last Modified**: 2026-01-22 19:48
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 4 - Bulk Operations & Management Page
**Task ID**: 4.1

---

## 1. Goal

Create a contextual floating action bar component that appears when items are selected in the Translation Management interface. The bar provides bulk translation operations including "Re-translate All" and "Re-translate Specific Language" actions with real-time progress indication during bulk operations. This enables efficient management of translations at scale.

**Component File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Key Features**:
- Slides in from bottom when items selected
- Selection count display with pluralization
- "Re-translate All" button for all languages
- Language dropdown for specific language re-translation
- Progress bar with status updates during operations
- Cancel operation capability
- Success/error result display
- Slide-out animation when cleared
- Keyboard accessible with screen reader support
- Respects prefers-reduced-motion
- i18n support via next-intl

---

## 2. Implementation Plan

### Step 1: Create Component Directory Structure
**File**: `/src/components/TranslationManagement/BulkTranslationBar/` (new directory)

Create the component directory following established TranslationManagement patterns.

**Actions**:
- Create directory: `/src/components/TranslationManagement/BulkTranslationBar/`
- Will contain: `BulkTranslationBar.tsx`, subcomponents, `index.ts`

### Step 2: Define TypeScript Interfaces and Types
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` (new)

Define props interfaces and supporting types.

**Pattern Reference**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` (lines 0-49) - bulk actions pattern

**Implementation Details**:
```typescript
/**
 * Result of a bulk translation operation
 */
export interface BulkOperationResult {
  /** Whether the operation completed successfully */
  success: boolean;
  /** Number of translation jobs created */
  jobCount: number;
  /** Number of items skipped (already translated, errors, etc.) */
  skippedCount: number;
  /** Optional error messages */
  errors?: string[];
}

/**
 * Supported target languages for translation
 */
export type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt';

/**
 * Props for BulkTranslationBar component
 */
export interface BulkTranslationBarProps {
  /** Array of selected item IDs */
  selectedIds: string[];
  /** Callback to clear selection */
  onClearSelection: () => void;
  /** Callback when re-translate all is triggered */
  onRetranslateAll: (entityIds: string[]) => Promise<BulkOperationResult>;
  /** Callback when re-translate specific language is triggered */
  onRetranslateLanguage: (entityIds: string[], language: SupportedLanguage) => Promise<BulkOperationResult>;
  /** Whether a bulk operation is currently in progress */
  isProcessing?: boolean;
  /** Progress of current operation (0-100) */
  progress?: number;
  /** Status message to display during processing */
  statusMessage?: string;
  /** Callback to cancel ongoing operation */
  onCancelOperation?: () => void;
  /** Whether the bar should be visible (controls animation) */
  isVisible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Internal state for bulk operation tracking
 */
interface BulkBarState {
  operationStatus: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentItem?: string;
  result?: BulkOperationResult;
  error?: string;
}
```

**Actions**:
- Define all interfaces with comprehensive JSDoc
- Export BulkOperationResult and SupportedLanguage for external use
- Keep BulkBarState internal (not exported)

### Step 3: Define Language Constants
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Define constants for supported languages with display data.

**Implementation Details**:
```typescript
/**
 * Supported languages with display names and flag emojis
 */
const LANGUAGE_OPTIONS = [
  { code: 'es' as const, labelKey: 'spanish', flag: '🇪🇸' },
  { code: 'fr' as const, labelKey: 'french', flag: '🇫🇷' },
  { code: 'de' as const, labelKey: 'german', flag: '🇩🇪' },
  { code: 'it' as const, labelKey: 'italian', flag: '🇮🇹' },
  { code: 'nl' as const, labelKey: 'dutch', flag: '🇳🇱' },
  { code: 'pt' as const, labelKey: 'portuguese', flag: '🇵🇹' },
] as const;
```

**Actions**:
- Define LANGUAGE_OPTIONS constant array
- Include flag emojis for visual differentiation
- Use labelKey for i18n (resolves at render time)
- Use `as const` for type safety

### Step 4: Implement Main Component Structure with Animation
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Build the component skeleton with slide-in/out animation.

**Pattern Reference**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` (lines 136-172) - positioning and animation

**Implementation Details**:
```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BulkTranslationBar({
  selectedIds,
  onClearSelection,
  onRetranslateAll,
  onRetranslateLanguage,
  isProcessing = false,
  progress = 0,
  statusMessage,
  onCancelOperation,
  isVisible = true,
  className,
}: BulkTranslationBarProps) {
  const t = useTranslations('translationManagement.bulkBar');
  const tLang = useTranslations('languages');

  // Internal state for operation tracking
  const [barState, setBarState] = useState<BulkBarState>({
    operationStatus: 'idle',
    progress: 0,
  });

  // Don't render if no items selected
  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label={t('ariaLabel', { count: selectedIds.length })}
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow for elevation
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation - slide up from bottom with prefers-reduced-motion support
        'animate-in slide-in-from-bottom duration-300',
        'motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-200',
        className
      )}
    >
      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Render different layouts based on operation status */}
      </div>
    </div>
  );
}
```

**Actions**:
- Add 'use client' directive
- Import necessary dependencies
- Implement early return for empty selection
- Apply fixed positioning and animation classes
- Match BulkActionsBar styling pattern
- Include motion-reduce support

### Step 5: Create SelectionCount Display Component
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Implement selection count indicator with pluralization.

**Pattern Reference**: BulkActionsBar.tsx (lines 177-192) - selection count display

**Implementation Details**:
```typescript
// Inside main component render
<div className="flex items-center gap-2 min-w-0">
  <div
    className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-50 flex-shrink-0"
    aria-hidden="true"
  >
    <Check className="h-4 w-4 text-purple-600" />
  </div>
  <span className="text-sm font-medium text-gray-900 truncate">
    {t('selected', { count: selectedIds.length })}
  </span>
  <span className="sr-only">
    {t('selectedAria', { count: selectedIds.length })}
  </span>
</div>
```

**Translation Keys**:
- `selected`: Pluralized "{count, plural, one {# item selected} other {# items selected}}"
- `selectedAria`: Screen reader announcement

**Actions**:
- Create selection count indicator with check icon
- Use purple theme colors (consistent with translation management)
- Add screen reader announcement
- Implement pluralization via next-intl

### Step 6: Implement Action Buttons (Idle State)
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Create "Re-translate All" and language dropdown buttons.

**Pattern Reference**: BulkActionsBar.tsx (lines 195-229) - action buttons with loading state

**Implementation Details**:
```typescript
// Conditional render based on operation status
{barState.operationStatus === 'idle' && !isProcessing && (
  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
    {/* Re-translate All button */}
    <ActionButton
      icon={RotateCw}
      label={t('actions.retranslateAll')}
      onClick={handleRetranslateAll}
      variant="primary"
      disabled={isProcessing}
    />

    {/* Language dropdown button */}
    <LanguageDropdownButton
      languages={LANGUAGE_OPTIONS}
      onSelectLanguage={handleRetranslateLanguage}
      disabled={isProcessing}
    />

    {/* Clear selection button */}
    <ActionButton
      icon={X}
      label={t('actions.clear')}
      onClick={onClearSelection}
      variant="ghost"
      disabled={isProcessing}
    />
  </div>
)}
```

**Actions**:
- Create ActionButton subcomponent (reusable pattern)
- Implement "Re-translate All" button
- Create LanguageDropdownButton subcomponent (next step)
- Add clear selection button
- All buttons respect isProcessing state

### Step 7: Create ActionButton Subcomponent
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Create reusable button component for consistent styling.

**Pattern Reference**: BulkActionsBar.tsx (lines 23-103) - ActionButton implementation

**Implementation Details**:
```typescript
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center gap-1.5',
        'min-h-[44px] min-w-[44px]',
        'px-3 py-2',
        'rounded-md',
        'text-sm font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'focus:ring-purple-500 focus:ring-offset-white',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
```

**Actions**:
- Create ActionButton as internal component
- Use purple theme for primary actions
- Maintain 44px min touch target
- Hide label on mobile (icon only)
- Include disabled state styling

### Step 8: Create LanguageDropdownButton Subcomponent
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Implement dropdown menu for language selection.

**Implementation Details**:
```typescript
interface LanguageDropdownButtonProps {
  languages: typeof LANGUAGE_OPTIONS;
  onSelectLanguage: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

function LanguageDropdownButton({
  languages,
  onSelectLanguage,
  disabled = false,
}: LanguageDropdownButtonProps) {
  const t = useTranslations('translationManagement.bulkBar');
  const tLang = useTranslations('languages');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center gap-1.5',
          'min-h-[44px] px-3 py-2',
          'rounded-md',
          'text-sm font-medium',
          'bg-gray-100 text-gray-700 hover:bg-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('actions.retranslateLanguage')}</span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute bottom-full mb-2 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]">
            {languages.map(({ code, labelKey, flag }) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onSelectLanguage(code);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              >
                <span aria-hidden="true">{flag}</span>
                <span>{tLang(labelKey)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

**Actions**:
- Create LanguageDropdownButton component
- Use native dropdown pattern (not Radix, keep simple)
- Position menu above button (bottom-full)
- Include flag emojis for visual clarity
- Handle open/close state
- Close on backdrop click or selection

### Step 9: Implement Processing State with Progress Bar
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Create progress display during bulk operations.

**Implementation Details**:
```typescript
{(barState.operationStatus === 'processing' || isProcessing) && (
  <div className="flex-1 max-w-3xl">
    {/* Status message */}
    <div className="flex items-center gap-2 mb-2">
      <Loader2 className="h-4 w-4 animate-spin text-purple-600" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-900">
        {statusMessage || t('processing', { count: selectedIds.length })}
      </span>
    </div>

    {/* Progress bar */}
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={cn(
          'h-full bg-purple-600 transition-all duration-100',
          'motion-reduce:transition-none'
        )}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('progressLabel', { percent: progress })}
      />
    </div>

    {/* Progress percentage */}
    <div className="text-xs text-gray-600 mt-1 text-right">
      {progress.toFixed(0)}%
    </div>

    {/* ARIA live region for screen readers */}
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {t('progressAnnounce', { percent: progress, count: selectedIds.length })}
    </div>
  </div>
)}

{/* Cancel button during processing */}
{(barState.operationStatus === 'processing' || isProcessing) && onCancelOperation && (
  <ActionButton
    icon={X}
    label={t('actions.cancel')}
    onClick={onCancelOperation}
    variant="destructive"
  />
)}
```

**Actions**:
- Create progress bar with smooth transitions
- Display status message above bar
- Show progress percentage
- Add ARIA live region for screen reader announcements
- Include cancel button when operation can be cancelled
- Respect motion-reduce preferences

### Step 10: Implement Completed State Display
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Show operation result summary when complete.

**Implementation Details**:
```typescript
{barState.operationStatus === 'completed' && barState.result && (
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-900">
        {t('completed', {
          queued: barState.result.jobCount,
          skipped: barState.result.skippedCount,
        })}
      </span>
    </div>
    <div className="sr-only" role="status">
      {t('completedAria', {
        queued: barState.result.jobCount,
        skipped: barState.result.skippedCount,
      })}
    </div>
  </div>
)}

{/* Dismiss button */}
{barState.operationStatus === 'completed' && (
  <ActionButton
    icon={X}
    label={t('actions.dismiss')}
    onClick={handleDismiss}
    variant="ghost"
  />
)}
```

**Translation Keys**:
- `completed`: "Completed: {queued} translations queued, {skipped} skipped"
- `completedAria`: Screen reader announcement

**Actions**:
- Display success icon and summary
- Show count of queued and skipped items
- Add dismiss button to clear and hide bar
- Include screen reader announcement

### Step 11: Implement Error State Display
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Handle and display operation errors.

**Implementation Details**:
```typescript
{barState.operationStatus === 'error' && (
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-900">
        {barState.error || t('error')}
      </span>
    </div>
    <div className="sr-only" role="alert">
      {barState.error || t('errorAria')}
    </div>
  </div>
)}

{/* Dismiss button */}
{barState.operationStatus === 'error' && (
  <ActionButton
    icon={X}
    label={t('actions.dismiss')}
    onClick={handleDismiss}
    variant="ghost"
  />
)}
```

**Actions**:
- Display error icon and message
- Use role="alert" for screen readers
- Show dismiss button to clear error
- Keep selection active (don't auto-clear on error)

### Step 12: Implement Handler Functions
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Create callback handlers for user actions.

**Implementation Details**:
```typescript
const handleRetranslateAll = useCallback(async () => {
  setBarState({ operationStatus: 'processing', progress: 0 });
  try {
    const result = await onRetranslateAll(selectedIds);
    setBarState({
      operationStatus: result.success ? 'completed' : 'error',
      progress: 100,
      result,
      error: result.success ? undefined : t('operationFailed'),
    });
    // Auto-dismiss after 3 seconds on success
    if (result.success) {
      setTimeout(handleDismiss, 3000);
    }
  } catch (error) {
    setBarState({
      operationStatus: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : t('unknownError'),
    });
  }
}, [selectedIds, onRetranslateAll, t]);

const handleRetranslateLanguage = useCallback(async (language: SupportedLanguage) => {
  setBarState({ operationStatus: 'processing', progress: 0 });
  try {
    const result = await onRetranslateLanguage(selectedIds, language);
    setBarState({
      operationStatus: result.success ? 'completed' : 'error',
      progress: 100,
      result,
      error: result.success ? undefined : t('operationFailed'),
    });
    if (result.success) {
      setTimeout(handleDismiss, 3000);
    }
  } catch (error) {
    setBarState({
      operationStatus: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : t('unknownError'),
    });
  }
}, [selectedIds, onRetranslateLanguage, t]);

const handleDismiss = useCallback(() => {
  setBarState({ operationStatus: 'idle', progress: 0 });
  onClearSelection();
}, [onClearSelection]);
```

**Actions**:
- Implement handleRetranslateAll
- Implement handleRetranslateLanguage
- Implement handleDismiss
- Update barState throughout operation lifecycle
- Handle errors gracefully
- Auto-dismiss after 3 seconds on success

### Step 13: Sync External Progress Updates
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Update internal state when parent provides progress updates.

**Implementation Details**:
```typescript
// Sync external isProcessing and progress props
useEffect(() => {
  if (isProcessing) {
    setBarState(prev => ({
      ...prev,
      operationStatus: 'processing',
      progress: progress || prev.progress,
    }));
  }
}, [isProcessing, progress]);
```

**Actions**:
- Add useEffect to watch isProcessing and progress props
- Update barState when external props change
- Allow parent to control operation state

### Step 14: Add Keyboard Accessibility
**File**: `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Implement keyboard shortcuts and escape handling.

**Implementation Details**:
```typescript
// Keyboard event handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape key to clear selection (when not processing)
    if (e.key === 'Escape' && barState.operationStatus !== 'processing') {
      onClearSelection();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [barState.operationStatus, onClearSelection]);
```

**Actions**:
- Add keydown event listener
- Escape key clears selection (except during processing)
- Clean up listener on unmount

### Step 15: Create Barrel Export
**File**: `/src/components/TranslationManagement/BulkTranslationBar/index.ts` (new)

Create index file for clean imports.

**Actions**:
- Export BulkTranslationBar as default and named export
- Export BulkTranslationBarProps type
- Export BulkOperationResult type
- Export SupportedLanguage type

### Step 16: Update Parent Barrel Export
**File**: `/src/components/TranslationManagement/index.ts`

Add BulkTranslationBar to parent namespace exports.

**Actions**:
- Add export statement for BulkTranslationBar
- Add export statement for related types
- Maintain alphabetical or logical ordering

### Step 17: Add Translation Keys to Message Files
**Files**:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Add required translation keys for the component.

**English Template** (`/messages/en.json`):
```json
{
  "translationManagement": {
    "bulkBar": {
      "ariaLabel": "Bulk translation actions for {count} selected items",
      "selected": "{count, plural, one {# item selected} other {# items selected}}",
      "selectedAria": "{count, plural, one {# item selected} other {# items selected}}",
      "processing": "Translating {count} items...",
      "completed": "Completed: {queued} translations queued, {skipped} skipped",
      "completedAria": "Translation completed. {queued} jobs queued, {skipped} skipped",
      "error": "Translation operation failed",
      "errorAria": "Error: Translation operation failed",
      "operationFailed": "The translation operation encountered errors",
      "unknownError": "An unknown error occurred",
      "progressLabel": "Translation progress: {percent}%",
      "progressAnnounce": "Translating {count} items. {percent}% complete",
      "actions": {
        "retranslateAll": "Re-translate All",
        "retranslateLanguage": "Re-translate",
        "clear": "Clear",
        "cancel": "Cancel",
        "dismiss": "Dismiss"
      }
    }
  }
}
```

**Actions**:
- Add keys to English file first
- Copy structure to all target language files
- Translate text appropriately
- Validate JSON syntax
- Use pluralization for count-based strings

### Step 18: Integration Testing
**Context**: Full component testing in translation management interface

Test complete feature from selection to operation completion.

**Test Scenarios**:
1. Bar slides in when items selected
2. Selection count displays correctly with pluralization
3. "Re-translate All" button triggers callback with correct IDs
4. Language dropdown displays all 6 languages with flags
5. Selecting language triggers callback with language code
6. Clear button clears selection and hides bar
7. Processing state displays progress bar correctly
8. Progress updates animate smoothly
9. Cancel button appears during processing
10. Completed state displays result summary
11. Dismiss button clears selection after completion
12. Error state displays error message
13. Escape key clears selection (when not processing)
14. Keyboard navigation works (Tab, Enter)
15. Screen reader announces states correctly
16. Animation respects prefers-reduced-motion
17. Responsive layout works on mobile and desktop
18. i18n works for all languages

**Actions**:
- Test all interaction flows
- Verify accessibility with keyboard and screen reader
- Test responsive breakpoints
- Validate animation timing
- Check ARIA attributes and live regions

---

## 3. Authorized Files for Modification

### New Files to Create:
1. `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
   - Main component implementation
   - Lines: ~500-600 (estimated)

2. `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
   - Barrel export file
   - Lines: ~10-15

### Existing Files to Modify:
3. `/src/components/TranslationManagement/index.ts`
   - Add BulkTranslationBar exports
   - Modification: Add 3-5 export lines

4. `/messages/en.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

5. `/messages/fr.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

6. `/messages/es.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

7. `/messages/de.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

8. `/messages/nl.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

9. `/messages/it.json`
   - Add bulkBar translation keys
   - Modification: Add `translationManagement.bulkBar` namespace

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-003**: Re-Translate API Endpoint
  - Required for: Backend retranslation operations
  - Endpoint: `/api/translations/retranslate`
  - Status: Must be completed for functional operations

- **REQ-E05-006**: TranslationManagement types file
  - Required for: Shared type definitions (if SupportedLanguage is exported)
  - Import: `@/components/TranslationManagement/TranslationManagement.types`
  - Note: Can define types locally if not available

### External Dependencies (Existing):
- **next-intl**: Internationalization
  - Usage: `useTranslations` hook for all UI text

- **React**: Core framework (v18+)
  - Usage: useState, useEffect, useCallback hooks

- **lucide-react**: Icon library
  - Usage: Check, Loader2, X, AlertCircle, RotateCw, Globe, ChevronDown icons

- **Tailwind CSS**: Styling utility classes

- **@/lib/utils**: Utility functions
  - Usage: `cn()` for className merging

### Pattern References (Existing):
- **BulkActionsBar**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
  - Pattern for: Fixed positioning, animation, action buttons, selection count

### Blocks (This Must Complete First):
- **REQ-E05-019**: LanguageSelectorDialog component
  - Benefit: Could enhance language selection (multi-select)
  - Not a hard blocker: Single-select dropdown works for initial implementation

---

## 5. Key Technical Decisions

### 5.1 Animation Implementation
**Decision**: Use Tailwind CSS animations instead of Framer Motion.

**Rationale**:
- Existing BulkActionsBar uses Tailwind animations successfully
- Simpler implementation, no additional dependencies
- Built-in motion-reduce support
- Consistent with codebase patterns

**Implementation**: `animate-in slide-in-from-bottom duration-300`

### 5.2 Language Dropdown Pattern
**Decision**: Use native dropdown (not Radix DropdownMenu).

**Rationale**:
- Only 6 options - simple use case
- Reduce complexity and dependencies
- Faster implementation
- Adequate accessibility with proper ARIA

**Alternative Considered**: Radix DropdownMenu
- Rejected: Over-engineered for simple dropdown
- More complex API
- Additional dependency

**Implementation**: Custom dropdown with state management.

### 5.3 Progress Tracking Strategy
**Decision**: Accept progress via props, allow parent to control.

**Rationale**:
- Parent component manages bulk operation lifecycle
- Parent has access to job queue progress
- Component remains presentational (separation of concerns)
- Flexible for different progress tracking implementations

**Implementation**: Props: `isProcessing`, `progress`, `statusMessage`.

### 5.4 Operation State Management
**Decision**: Internal state for UI, props for operation state.

**Rationale**:
- Internal state tracks UI status (idle/processing/completed/error)
- Props control external operation state
- Component can track operation lifecycle independently
- Allows graceful handling of edge cases

**Implementation**: BulkBarState interface for internal tracking.

### 5.5 Auto-Dismiss Behavior
**Decision**: Auto-dismiss after 3 seconds on successful completion.

**Rationale**:
- Reduces manual interaction required
- User sees success confirmation
- Selection automatically cleared
- Common pattern in bulk operations

**Alternative**: Manual dismiss only
- Considered but rejected: Requires extra click
- Success state doesn't need prolonged display

**Implementation**: `setTimeout(handleDismiss, 3000)` after success.

### 5.6 Error Handling Strategy
**Decision**: Keep bar visible on error, require manual dismiss.

**Rationale**:
- Users need time to read error message
- May want to retry operation
- Selection preserved for retry
- Explicit dismiss confirms user saw error

**Implementation**: Error state requires dismiss button click.

---

## 6. Risks and Mitigations

### Risk 1: Re-Translate API Not Available
**Risk**: REQ-E05-003 is not completed, API endpoint doesn't exist.

**Impact**: High - Component cannot perform operations

**Mitigation**:
- Verify REQ-E05-003 completion before integration
- Component can be built and tested with mock callbacks
- Document API contract clearly
- Add error handling for API failures

**Likelihood**: Low (dependencies are explicit)

### Risk 2: Long-Running Operations
**Risk**: Re-translating many items takes long time, poor UX.

**Impact**: Medium - User frustration, uncertain progress

**Mitigation**:
- Display progress bar with percentage
- Show status message during processing
- Allow cancellation via cancel button
- Consider moving to background job queue (parent concern)
- Provide meaningful status updates

**Likelihood**: Medium (depends on item count and API performance)

### Risk 3: Progress Tracking Inaccuracy
**Risk**: Progress bar doesn't reflect actual operation progress.

**Impact**: Low - User sees inaccurate progress

**Mitigation**:
- Document that parent must provide accurate progress
- Consider indeterminate progress bar if accuracy uncertain
- Add status message to provide context
- Test with realistic data volumes

**Likelihood**: Medium (depends on parent implementation)

### Risk 4: Z-Index Conflicts
**Risk**: Bar overlaps with modals or other fixed elements.

**Impact**: Low - Visual layering issue

**Mitigation**:
- Use z-40 (matches BulkActionsBar)
- Document z-index layering in code comments
- Test with TranslationPreviewPanel and modals
- Adjust if conflicts discovered

**Likelihood**: Low (following established pattern)

### Risk 5: Mobile Layout Breakage
**Risk**: Buttons don't fit on small screens.

**Impact**: Medium - Mobile UX issue

**Mitigation**:
- Use responsive button layout (flex-wrap)
- Hide button labels on mobile (icon only)
- Test on various mobile screen sizes
- Stack buttons vertically if needed
- Use 44px min touch targets

**Likelihood**: Low (following responsive patterns)

### Risk 6: Screen Reader Announcements
**Risk**: Progress updates announced too frequently, annoying.

**Impact**: Low - Accessibility issue

**Mitigation**:
- Use aria-live="polite" (not assertive)
- Update live region selectively (not every percentage)
- Test with actual screen reader
- Consider throttling announcements

**Likelihood**: Low (proper ARIA usage)

---

## 7. Out of Scope

### 7.1 Multi-Language Selection in Single Operation
- Dropdown allows single language selection only
- Rationale: "Re-translate All" handles all languages
- Future Enhancement: LanguageSelectorDialog (REQ-E05-019) for multi-select

### 7.2 Operation Confirmation Dialogs
- No confirmation dialog before starting re-translation
- Rationale: Operations are recoverable, not destructive
- Future Enhancement: Could add confirmation for large batches

### 7.3 Detailed Progress Breakdown
- Progress bar shows overall percentage only (not per-item or per-language)
- Rationale: Simplicity, parent controls granularity
- Use Case: Status message can show current item

### 7.4 Undo/Redo Translation Operations
- No undo capability for completed operations
- Rationale: Translation jobs use queue system
- Out of Scope: Would require job cancellation API

### 7.5 Operation History/Log
- No history of past bulk operations
- Rationale: Not required for current workflow
- Future Enhancement: Could add activity log view

### 7.6 Scheduling Bulk Operations
- No ability to schedule operations for later
- Rationale: Immediate execution only
- Out of Scope: Would require scheduling system

### 7.7 Filtering Selected Items
- No filtering UI within bulk bar
- Rationale: Selection happens in parent list
- Use Case: Filter first, then select

### 7.8 Exporting Operation Results
- No CSV/PDF export of operation results
- Rationale: Results are transient
- Out of Scope: Would require report generation

---

## 8. Testing Considerations

### Manual Testing (Required):
- Bar slides in smoothly when items selected
- Selection count displays with correct pluralization
- "Re-translate All" button triggers operation
- Language dropdown displays all languages
- Language selection triggers operation with correct language
- Clear button clears selection and hides bar
- Progress bar animates during operation
- Progress percentage updates correctly
- Status message displays during processing
- Cancel button appears and works during processing
- Completed state displays result summary
- Error state displays error message
- Dismiss button works after completion/error
- Escape key clears selection
- Keyboard navigation works (Tab, Enter, Space)
- Screen reader announces selection and progress
- Animation respects prefers-reduced-motion
- Responsive layout works on mobile and desktop
- i18n works for all supported languages
- No console errors or warnings

### Integration Testing (Future):
- Component integrates with translation management page
- Parent callbacks handle operations correctly
- Progress updates from parent reflect in bar
- Multiple selections work correctly
- Component doesn't interfere with other UI elements

### Unit Tests (Future):
- Component renders with selected IDs
- Action buttons trigger correct callbacks
- Language dropdown renders all languages
- Progress bar displays correct percentage
- State transitions work correctly (idle→processing→completed)
- Error state displays when operation fails

---

## 9. Estimated Effort

**Total Effort**: 10-12 hours

**Breakdown**:
- Component structure and interfaces: 1 hour
- ActionButton and base layout: 2 hours
- Language dropdown implementation: 2 hours
- Progress bar and state transitions: 2 hours
- Error and completed states: 1.5 hours
- Keyboard accessibility and ARIA: 1 hour
- Translation keys: 0.5 hours
- Testing and refinement: 2-3 hours

**Complexity**: Medium
- Multiple UI states (idle, processing, completed, error)
- Custom language dropdown implementation
- Progress tracking and animations
- Keyboard accessibility requirements
- Screen reader support with live regions
- Responsive layout considerations

---

## 10. Success Criteria

This task is complete when:

1. ✅ BulkTranslationBar component file created
2. ✅ Component accepts all specified props
3. ✅ Bar slides in when items selected (animation 200-300ms)
4. ✅ Bar slides out when selection cleared
5. ✅ Animation respects prefers-reduced-motion
6. ✅ Selection count displays with pluralization
7. ✅ "Re-translate All" button triggers onRetranslateAll callback
8. ✅ Language dropdown displays 6 languages with flags
9. ✅ Language selection triggers onRetranslateLanguage callback
10. ✅ Clear button clears selection via onClearSelection
11. ✅ Processing state shows progress bar
12. ✅ Progress bar animates smoothly (100ms transitions)
13. ✅ Status message displays during processing
14. ✅ Cancel button appears and calls onCancelOperation
15. ✅ Completed state displays result summary
16. ✅ Dismiss button clears selection after completion
17. ✅ Error state displays error message
18. ✅ Dismiss button visible in error state
19. ✅ Fixed positioning at bottom of viewport (z-40)
20. ✅ Responsive layout (horizontal desktop, stacked mobile)
21. ✅ Keyboard navigation works (Tab, Enter, Escape)
22. ✅ Screen reader support with ARIA live regions
23. ✅ All text internationalized via next-intl
24. ✅ TypeScript types properly defined and exported
25. ✅ Component exported from barrel file
26. ✅ No TypeScript or console errors

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Source Request**: `/docs/gen_requests_epic5.md` (Request #18, lines 2550-2809)
- **REQ-E05-003**: Re-Translate API Endpoint (dependency)
- **REQ-E05-006**: TranslationManagement types file (dependency)
- **Pattern Reference - BulkActionsBar**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- **REQ-070**: BulkActionsBar component (pattern reference)
- **Translation Service**: `/src/lib/translation-service/` (language constants)

---

## 12. Notes

- This component follows the established BulkActionsBar pattern from ItemManager for consistency
- The purple color theme is used for translation-related actions (vs pink for general item actions)
- Language dropdown is kept simple (single-select) for initial implementation; REQ-E05-019 adds multi-select dialog
- Progress tracking relies on parent providing accurate updates via props
- Auto-dismiss after success (3 seconds) reduces friction but can be adjusted based on user feedback
- Component is fully keyboard accessible and screen reader friendly
- Animation and motion respect user's prefers-reduced-motion preferences
- The component is designed to be reusable across different translation management contexts (items, articles, links)

---

**Document Status**: Ready for Implementation
**Next Step**: Verify REQ-E05-003 API is available, then begin with Step 1 (directory structure)
