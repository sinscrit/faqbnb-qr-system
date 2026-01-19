# REQ-342: Create TranslationPreviewPanel Component - Detailed Task Breakdown

**Last Modified:** 2026-01-19
**Request ID:** REQ-342
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Core UI Components
**Task ID:** 2.2
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Overview Document:** REQ-342-create-translationpreviewpanel-component-overview.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-341 (TranslationManagement.types.ts)

---

## Summary

Create a slide-in panel component that displays comprehensive translation information for a selected content item. The panel slides in from the right side of the screen (400px width), shows source content at the top, lists all six supported languages with their translation status, and provides action buttons for editing translations, triggering re-translation, or retrying failed translations.

---

## Task Breakdown

### Task 1: Create TranslationManagement directory structure and parent index
**Effort:** XS (< 15 minutes)
**Priority:** P1 (Required first)
**Story Points:** 0.5

#### Description
Create the parent `/src/components/TranslationManagement/` directory structure with the main index.ts file for public exports. This establishes the foundation for all translation management UI components.

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/index.ts` | Public exports for all TranslationManagement components |

#### Implementation Details

**File: `/src/components/TranslationManagement/index.ts`**
```typescript
/**
 * TranslationManagement Components
 *
 * UI components for property owners to view, review, and manage
 * translations of their content.
 *
 * @module TranslationManagement
 * @see Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * Last Modified: 2026-01-19
 */

// Panel component exports
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';

// Re-export shared types (when available from REQ-341)
// export * from './TranslationManagement.types';
```

#### Acceptance Criteria
- [ ] Directory `/src/components/TranslationManagement/` exists
- [ ] File `/src/components/TranslationManagement/index.ts` exists
- [ ] Index file exports TranslationPreviewPanel and props type
- [ ] TypeScript compiles without errors

#### Verification Steps
1. Run `ls -la src/components/TranslationManagement/`
2. Run `npx tsc --noEmit` to verify TypeScript compilation

---

### Task 2: Create TranslationPreviewPanel subdirectory and index
**Effort:** XS (< 15 minutes)
**Priority:** P1 (Required first)
**Story Points:** 0.5

#### Description
Create the TranslationPreviewPanel subdirectory with its own index.ts for component-specific exports.

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Panel component exports |

#### Implementation Details

**File: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`**
```typescript
/**
 * TranslationPreviewPanel Component Exports
 *
 * Slide-in panel for viewing and managing content translations.
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * Last Modified: 2026-01-19
 */

export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type { TranslationPreviewPanelProps, TranslationStatusMap, TranslationData, TranslationStatusType } from './TranslationPreviewPanel';
```

#### Acceptance Criteria
- [ ] Directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists
- [ ] File `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` exists
- [ ] Exports are properly defined

#### Verification Steps
1. Verify file existence
2. TypeScript compilation succeeds

---

### Task 3: Add slide-in/slide-out animations to tailwind.config.js
**Effort:** S (15-30 minutes)
**Priority:** P1 (Required for panel animation)
**Story Points:** 1

#### Description
Add custom Tailwind keyframes and animations for the panel slide effect from the right side. The panel should slide in smoothly when opened and slide out when closed.

#### Files to Modify
| File | Changes | Section |
|------|---------|---------|
| `/tailwind.config.js` | Add keyframes and animations | `theme.extend.keyframes`, `theme.extend.animation` |

#### Implementation Details

**Modify `/tailwind.config.js`** - Add to `theme.extend.keyframes`:
```javascript
'slide-in-right': {
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' }
},
'slide-out-right': {
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' }
},
'fade-in': {
  from: { opacity: '0' },
  to: { opacity: '1' }
},
'fade-out': {
  from: { opacity: '1' },
  to: { opacity: '0' }
}
```

**Add to `theme.extend.animation`:**
```javascript
'slide-in-right': 'slide-in-right 0.3s ease-out',
'slide-out-right': 'slide-out-right 0.2s ease-in',
'fade-in': 'fade-in 0.2s ease-out',
'fade-out': 'fade-out 0.2s ease-in'
```

#### Acceptance Criteria
- [ ] Keyframes added: `slide-in-right`, `slide-out-right`, `fade-in`, `fade-out`
- [ ] Animations added with proper timing: 300ms slide-in, 200ms slide-out, 200ms fades
- [ ] Tailwind config remains valid JavaScript
- [ ] Build succeeds with new animations

#### Verification Steps
1. Run `npm run build` to verify Tailwind processes the config
2. Inspect generated CSS for new animation classes

#### Notes
- Check if `fade-in` and `fade-out` already exist (may be duplicates from existing modal patterns)
- If duplicates exist, skip those specific keyframes

---

### Task 4: Create TranslationPreviewPanel.tsx - Base component structure
**Effort:** M (1-2 hours)
**Priority:** P1 (Core implementation)
**Story Points:** 3

#### Description
Create the main TranslationPreviewPanel component with Radix UI Dialog foundation, proper positioning for slide-in from right, overlay backdrop, header with title and close button.

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main slide-in panel component |

#### Implementation Details

**Imports Required:**
```typescript
'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  CheckCircle,
  Clock,
  XCircle,
  PencilLine,
  Loader2,
  RefreshCw,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getLanguageInfo } from '@/lib/translation-service/translation-service.types';
```

**Type Definitions (inline if REQ-341 not complete):**
```typescript
/**
 * Translation status values
 */
export type TranslationStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

/**
 * Translation data for a single language
 */
export interface TranslationData {
  status: TranslationStatusType;
  content?: {
    title?: string;
    description?: string;
    name?: string;
  };
  translatedAt?: string;
  isStale?: boolean;
  reviewedBy?: string;
}

/**
 * Translation status map for all languages
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationData>>;

/**
 * Props for TranslationPreviewPanel component
 * @see Plan-111-L10N-Epic5 Task 2.2
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for identifying the content */
  entityId: string;

  /** Source language of the content */
  sourceLanguage: SupportedLanguage;

  /** Source content for display at top of panel */
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };

  /** Whether panel is currently open */
  isOpen: boolean;

  /** Handler called when panel should close */
  onClose: () => void;

  /** Translation data for all languages (fetched externally or passed in) */
  translations?: TranslationStatusMap;

  /** Loading state while fetching translation data */
  isLoading?: boolean;

  /** Error message if translation data fetch failed */
  error?: string | null;

  /** Optional callback when Edit button is clicked for a language */
  onEdit?: (language: SupportedLanguage) => void;

  /** Optional callback when Re-translate button is clicked for a language */
  onRetranslate?: (language: SupportedLanguage) => void;

  /** Optional callback when Retry button is clicked for failed translation */
  onRetry?: (language: SupportedLanguage) => void;

  /** Optional callback for Re-translate All button */
  onRetranslateAll?: () => void;

  /** Optional additional CSS classes */
  className?: string;
}
```

**Component Structure:**
```typescript
export function TranslationPreviewPanel({
  entityType,
  entityId,
  sourceLanguage,
  sourceContent,
  isOpen,
  onClose,
  translations = {},
  isLoading = false,
  error = null,
  onEdit,
  onRetranslate,
  onRetry,
  onRetranslateAll,
  className,
}: TranslationPreviewPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button on open
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle open/close change
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Overlay backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Panel content - fixed right side */}
        <Dialog.Content
          className={cn(
            // Base styles
            'fixed right-0 top-0 z-50',
            'h-screen w-[400px]',
            'bg-white shadow-lg outline-none',
            'flex flex-col',

            // Slide animation
            'data-[state=open]:animate-slide-in-right',
            'data-[state=closed]:animate-slide-out-right',

            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Translations
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                ref={closeButtonRef}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 rounded-full',
                  'text-gray-500 hover:text-gray-700',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'transition-colors'
                )}
                aria-label="Close translations panel"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content sections will be added in subsequent tasks */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Task 5: Source content section */}
            {/* Task 6: Progress indicator */}
            {/* Task 7: Language list */}
            {/* Task 8: Loading state */}
            {/* Task 9: Error state */}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            {onRetranslateAll && (
              <button
                type="button"
                onClick={onRetranslateAll}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2',
                  'bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'min-h-[44px]',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Re-translate All
              </button>
            )}
            <Dialog.Close asChild>
              <button
                type="button"
                className={cn(
                  'px-4 py-2 rounded-lg',
                  'bg-gray-100 text-gray-700',
                  'hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                  'min-h-[44px]'
                )}
              >
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Acceptance Criteria
- [ ] Component file created at specified path
- [ ] Component accepts all required props as per interface
- [ ] Radix Dialog used for accessibility foundation
- [ ] Panel fixed to right side of screen with 400px width
- [ ] Panel uses slide-in-right/slide-out-right animations
- [ ] Overlay with fade animation and click-to-close
- [ ] Header with "Translations" title and close button
- [ ] Footer with "Re-translate All" and "Close" buttons
- [ ] Close button has focus ring and 44px touch target
- [ ] TypeScript compiles without errors

#### Verification Steps
1. Import component in a test page
2. Verify panel appears/disappears with animation
3. Verify overlay click closes panel
4. Verify close button closes panel
5. Verify Escape key closes panel

---

### Task 5: Implement source content display section
**Effort:** S (30 minutes - 1 hour)
**Priority:** P1 (Required for core functionality)
**Story Points:** 1

#### Description
Add the source content display section at the top of the panel, showing the original content with clear labeling indicating it is the source language version.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add source content section |

#### Implementation Details

**Add after the header, inside the scrollable content area:**
```typescript
{/* Source Content Section */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-2">
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      Source ({getLanguageInfo(sourceLanguage)?.name || sourceLanguage.toUpperCase()})
    </span>
  </div>
  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
    {sourceContent.title && (
      <h3 className="font-medium text-gray-900 mb-1">
        {sourceContent.title}
      </h3>
    )}
    {sourceContent.name && !sourceContent.title && (
      <h3 className="font-medium text-gray-900 mb-1">
        {sourceContent.name}
      </h3>
    )}
    {sourceContent.description && (
      <p className="text-sm text-gray-600 line-clamp-3">
        {sourceContent.description}
      </p>
    )}
  </div>
</div>
```

#### Acceptance Criteria
- [ ] Source content section displays at top of panel content
- [ ] Label clearly indicates "Source (Language Name)" with language badge
- [ ] Blue left border visually distinguishes source content
- [ ] Title/name displays with proper font weight
- [ ] Description displays with truncation (line-clamp-3)
- [ ] Handles entities with title+description or name only

#### Verification Steps
1. Pass sourceContent with title and description
2. Pass sourceContent with name only (item entity)
3. Verify visual styling matches spec

---

### Task 6: Implement progress indicator
**Effort:** S (30 minutes - 1 hour)
**Priority:** P2 (Enhances UX)
**Story Points:** 1

#### Description
Add a progress indicator showing translation completion status (e.g., "3/5 Complete") with a visual progress bar.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add progress indicator below source content |

#### Implementation Details

**Add helper function:**
```typescript
// Calculate completion stats
const getCompletionStats = useCallback(() => {
  const targetLanguages = SUPPORTED_LANGUAGES
    .map(l => l.code)
    .filter(code => code !== sourceLanguage);

  const completed = targetLanguages.filter(
    lang => translations[lang]?.status === 'completed' ||
            translations[lang]?.status === 'manual'
  ).length;

  const total = targetLanguages.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}, [translations, sourceLanguage]);
```

**Add progress section:**
```typescript
{/* Progress Indicator */}
{!isLoading && !error && (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">
        Translations
      </span>
      <span className="text-sm text-gray-500">
        {getCompletionStats().completed}/{getCompletionStats().total} Complete
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${getCompletionStats().percentage}%` }}
        role="progressbar"
        aria-valuenow={getCompletionStats().percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${getCompletionStats().completed} of ${getCompletionStats().total} translations complete`}
      />
    </div>
  </div>
)}
```

#### Acceptance Criteria
- [ ] Progress indicator shows "X/5 Complete" format
- [ ] Visual progress bar reflects completion percentage
- [ ] Progress bar has green fill with smooth animation
- [ ] ARIA attributes for accessibility (role, aria-valuenow, aria-label)
- [ ] Progress indicator hidden during loading/error states
- [ ] Correctly excludes source language from count

#### Verification Steps
1. Pass translations with 2/5 completed, verify display
2. Pass translations with 5/5 completed, verify 100% bar
3. Verify ARIA attributes with accessibility tools

---

### Task 7: Implement language list with status rows
**Effort:** L (2-3 hours)
**Priority:** P1 (Core functionality)
**Story Points:** 5

#### Description
Create the language list section showing all supported languages (except source) with status icons, preview text, and action buttons for each language.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add language list section |

#### Implementation Details

**Add status icon helper function:**
```typescript
/**
 * Get status icon for a translation status
 */
const getStatusIcon = (status: TranslationStatusType, isStale?: boolean) => {
  if (isStale) {
    return <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
  }
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />;
    case 'manual':
      return <PencilLine className="w-4 h-4 text-violet-500" aria-hidden="true" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" aria-hidden="true" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />;
  }
};

/**
 * Get status label text
 */
const getStatusLabel = (status: TranslationStatusType, isStale?: boolean): string => {
  if (isStale) return 'Outdated';
  switch (status) {
    case 'completed': return 'Completed';
    case 'manual': return 'Manually Edited';
    case 'pending': return 'Pending';
    case 'processing': return 'Translating...';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
};

/**
 * Get preview text for a translation
 */
const getPreviewText = (translation: TranslationData | undefined): string => {
  if (!translation) return 'Translation pending...';

  switch (translation.status) {
    case 'processing':
      return 'Translating...';
    case 'failed':
      return 'Translation failed. Click to retry.';
    case 'pending':
      return 'Translation pending...';
    case 'completed':
    case 'manual':
      const content = translation.content;
      const text = content?.title || content?.name || content?.description || '';
      return text.length > 60 ? text.slice(0, 60) + '...' : text || 'No content';
    default:
      return 'No translation';
  }
};
```

**Add language list section:**
```typescript
{/* Language List */}
{!isLoading && !error && (
  <div className="space-y-3" role="list" aria-label="Translation status by language">
    {SUPPORTED_LANGUAGES
      .filter(lang => lang.code !== sourceLanguage)
      .map((lang) => {
        const translation = translations[lang.code];
        const status = translation?.status || 'pending';
        const isStale = translation?.isStale || false;

        return (
          <div
            key={lang.code}
            className={cn(
              'p-3 rounded-lg border',
              status === 'failed' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white',
              isStale && 'border-yellow-200 bg-yellow-50'
            )}
            role="listitem"
          >
            {/* Language header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{lang.flag}</span>
                <span className="font-medium text-gray-900">{lang.nativeName}</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(status, isStale)}
                  <span className={cn(
                    'text-xs',
                    status === 'completed' && 'text-green-600',
                    status === 'manual' && 'text-violet-600',
                    status === 'pending' && 'text-amber-600',
                    status === 'processing' && 'text-amber-600',
                    status === 'failed' && 'text-red-600',
                    isStale && 'text-yellow-600'
                  )}>
                    {getStatusLabel(status, isStale)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {/* Edit button - visible for completed/manual */}
                {(status === 'completed' || status === 'manual') && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(lang.code)}
                    className={cn(
                      'p-2 rounded-lg',
                      'text-gray-600 hover:text-gray-900',
                      'hover:bg-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'min-w-[44px] min-h-[44px]',
                      'flex items-center justify-center'
                    )}
                    aria-label={`Edit ${lang.name} translation`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {/* Re-translate button - visible for completed/manual */}
                {(status === 'completed' || status === 'manual') && onRetranslate && (
                  <button
                    type="button"
                    onClick={() => onRetranslate(lang.code)}
                    className={cn(
                      'p-2 rounded-lg',
                      'text-gray-600 hover:text-gray-900',
                      'hover:bg-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'min-w-[44px] min-h-[44px]',
                      'flex items-center justify-center'
                    )}
                    aria-label={`Re-translate ${lang.name}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                {/* Retry button - visible only for failed */}
                {status === 'failed' && onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(lang.code)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm',
                      'bg-red-100 text-red-700',
                      'hover:bg-red-200',
                      'focus:outline-none focus:ring-2 focus:ring-red-500',
                      'min-h-[44px]',
                      'flex items-center gap-1'
                    )}
                    aria-label={`Retry ${lang.name} translation`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                )}
              </div>
            </div>

            {/* Preview text */}
            <p className={cn(
              'text-sm',
              status === 'failed' ? 'text-red-600' : 'text-gray-600',
              status === 'pending' && 'text-gray-400 italic',
              status === 'processing' && 'text-amber-600 italic'
            )}>
              {getPreviewText(translation)}
            </p>
          </div>
        );
      })}
  </div>
)}
```

#### Acceptance Criteria
- [ ] All 5 target languages displayed (excludes source language)
- [ ] Each row shows flag emoji and native language name
- [ ] Status icon with correct color per status (green=completed, violet=manual, amber=pending/processing, red=failed, yellow=stale)
- [ ] Status label text displayed next to icon
- [ ] Preview text shows truncated translation content (max 60 chars)
- [ ] Edit button visible for completed/manual status only
- [ ] Re-translate button visible for completed/manual status only
- [ ] Retry button visible for failed status only
- [ ] Action buttons have 44px minimum touch target
- [ ] Failed translations have red background styling
- [ ] Stale translations have yellow background styling
- [ ] ARIA labels on all action buttons
- [ ] `role="list"` and `role="listitem"` for accessibility

#### Verification Steps
1. Pass translations with mixed statuses
2. Verify each status displays correct icon and color
3. Click Edit, Re-translate, Retry buttons and verify callbacks fire
4. Verify button visibility based on status
5. Test with screen reader for ARIA compliance

---

### Task 8: Implement loading state
**Effort:** S (30 minutes)
**Priority:** P1 (Required for UX)
**Story Points:** 1

#### Description
Add loading skeleton UI displayed while translation data is being fetched.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add loading state |

#### Implementation Details

**Add loading skeleton:**
```typescript
{/* Loading State */}
{isLoading && (
  <div className="space-y-4" aria-busy="true" aria-label="Loading translations">
    {/* Source skeleton */}
    <div className="mb-6">
      <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r-lg">
        <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    {/* Progress skeleton */}
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse" />
    </div>

    {/* Language row skeletons */}
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}
  </div>
)}
```

#### Acceptance Criteria
- [ ] Loading skeleton displays when `isLoading=true`
- [ ] Skeleton mimics layout of actual content (source section, progress, language rows)
- [ ] 5 language row skeletons displayed
- [ ] Pulse animation on skeleton elements
- [ ] `aria-busy="true"` for accessibility
- [ ] Regular content hidden during loading

#### Verification Steps
1. Pass `isLoading={true}` to component
2. Verify skeleton layout matches expected content layout
3. Verify pulse animation is visible

---

### Task 9: Implement error state
**Effort:** S (30 minutes)
**Priority:** P1 (Required for UX)
**Story Points:** 1

#### Description
Add error display when translation data fails to load, with retry capability.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add error state |

#### Implementation Details

**Add props for retry handler:**
```typescript
/** Optional callback to retry loading translations */
onRetryLoad?: () => void;
```

**Add error display:**
```typescript
{/* Error State */}
{error && !isLoading && (
  <div
    className="flex flex-col items-center justify-center py-8 text-center"
    role="alert"
    aria-live="polite"
  >
    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
      <XCircle className="w-6 h-6 text-red-500" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Failed to Load Translations
    </h3>
    <p className="text-sm text-gray-600 mb-4 max-w-xs">
      {error}
    </p>
    {onRetryLoad && (
      <button
        type="button"
        onClick={onRetryLoad}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2',
          'bg-blue-600 text-white rounded-lg',
          'hover:bg-blue-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'min-h-[44px]'
        )}
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    )}
  </div>
)}
```

#### Acceptance Criteria
- [ ] Error state displays when `error` prop is truthy
- [ ] Error icon (XCircle) with red background
- [ ] Error title "Failed to Load Translations"
- [ ] Error message displayed from `error` prop
- [ ] "Try Again" button visible when `onRetryLoad` provided
- [ ] Try Again button triggers `onRetryLoad` callback
- [ ] `role="alert"` and `aria-live="polite"` for accessibility
- [ ] Source content and language list hidden during error

#### Verification Steps
1. Pass `error="Network error occurred"`
2. Verify error UI displays
3. Click "Try Again" and verify callback fires
4. Verify ARIA attributes with accessibility tools

---

### Task 10: Implement accessibility features
**Effort:** S (30 minutes - 1 hour)
**Priority:** P1 (Required for WCAG 2.1 AA)
**Story Points:** 1

#### Description
Ensure comprehensive accessibility support including ARIA labels, keyboard navigation, focus management, and screen reader announcements.

#### Files to Modify
| File | Section |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add accessibility enhancements |

#### Implementation Details

**Add screen reader status announcement region:**
```typescript
{/* Screen reader announcements */}
<div aria-live="polite" className="sr-only">
  {isOpen && `Translations panel opened. ${getCompletionStats().completed} of ${getCompletionStats().total} translations complete.`}
</div>
```

**Ensure all interactive elements have:**
- Minimum 44px touch targets (already implemented via min-h-[44px] and min-w-[44px])
- Visible focus indicators (already implemented via focus:ring-2)
- Descriptive ARIA labels (already implemented)

**Add Dialog description for screen readers:**
```typescript
<Dialog.Description className="sr-only">
  Preview and manage translations for your content. View translation status for all languages and take actions like editing or re-translating.
</Dialog.Description>
```

#### Acceptance Criteria
- [ ] All buttons have minimum 44px touch targets
- [ ] All buttons have visible focus indicators (ring-2)
- [ ] All icon buttons have descriptive aria-label
- [ ] Dialog has aria-describedby linking to description
- [ ] Language list has role="list" with role="listitem" children
- [ ] Progress bar has proper ARIA attributes (role, aria-valuenow, aria-label)
- [ ] Error state has role="alert" and aria-live="polite"
- [ ] Screen reader announcement on panel open
- [ ] Focus moves to close button on panel open
- [ ] Escape key closes panel (provided by Radix)
- [ ] Tab navigation works within panel (focus trap by Radix)
- [ ] Focus returns to trigger element on close (handled by Radix)

#### Verification Steps
1. Test with VoiceOver/NVDA screen reader
2. Navigate with keyboard only (Tab, Shift+Tab, Escape)
3. Run axe-core accessibility audit
4. Verify 44px touch targets with browser dev tools

---

### Task 11: Update parent TranslationManagement index.ts exports
**Effort:** XS (< 15 minutes)
**Priority:** P1 (Required for imports)
**Story Points:** 0.5

#### Description
Ensure the parent TranslationManagement index.ts properly exports the TranslationPreviewPanel component and types.

#### Files to Modify
| File | Changes |
|------|---------|
| `/src/components/TranslationManagement/index.ts` | Add/verify exports |

#### Implementation Details

**Final `/src/components/TranslationManagement/index.ts`:**
```typescript
/**
 * TranslationManagement Components
 *
 * UI components for property owners to view, review, and manage
 * translations of their content.
 *
 * @module TranslationManagement
 * @see Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * Last Modified: 2026-01-19
 */

// Panel component exports
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type {
  TranslationPreviewPanelProps,
  TranslationStatusMap,
  TranslationData,
  TranslationStatusType
} from './TranslationPreviewPanel';
```

#### Acceptance Criteria
- [ ] TranslationPreviewPanel exported from index
- [ ] All public types exported from index
- [ ] Can import from `@/components/TranslationManagement`
- [ ] TypeScript compiles without errors

#### Verification Steps
1. Try importing: `import { TranslationPreviewPanel } from '@/components/TranslationManagement'`
2. Run `npx tsc --noEmit`

---

## Verification Checklist

### Build Verification
- [ ] `npm run build` succeeds without errors
- [ ] `npx tsc --noEmit` succeeds without TypeScript errors
- [ ] No ESLint errors in new files

### Functional Verification
- [ ] Panel opens with slide-in animation
- [ ] Panel closes with slide-out animation
- [ ] Overlay click closes panel
- [ ] Close button closes panel
- [ ] Escape key closes panel
- [ ] Source content displays correctly
- [ ] Progress indicator shows correct X/5 count
- [ ] All 5 target languages listed
- [ ] Status icons display with correct colors
- [ ] Edit button visible for completed/manual only
- [ ] Re-translate button visible for completed/manual only
- [ ] Retry button visible for failed only
- [ ] Loading skeleton displays during loading
- [ ] Error state displays on error
- [ ] Action button callbacks fire correctly

### Accessibility Verification
- [ ] axe-core audit passes
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces panel open
- [ ] All buttons have aria-labels
- [ ] Focus management correct (focus on open, return on close)

---

## Dependencies Summary

### Required Before Starting
| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | Required | Translation tables must exist |
| Radix UI Dialog | Available | Already in project |
| lucide-react | Available | Already in project |
| Tailwind CSS | Available | Already in project |

### Optional/Soft Dependencies
| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-341 (TranslationManagement.types.ts) | Optional | Types inlined if not available |
| Epic 3 APIs | Optional | Component receives data via props |

---

## Files Summary

### Files to Create
| File | Task |
|------|------|
| `/src/components/TranslationManagement/index.ts` | Task 1 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Task 2 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Tasks 4-10 |

### Files to Modify
| File | Task |
|------|------|
| `/tailwind.config.js` | Task 3 |

### Files for Reference (Do Not Modify)
| File | Purpose |
|------|---------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Radix Dialog patterns |
| `/src/lib/utils.ts` | cn() utility |
| `/src/contexts/LocaleContext.tsx` | SupportedLanguage type reference |
| `/src/lib/translation-service/translation-service.types.ts` | Translation types, SUPPORTED_LANGUAGES |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-341 types not available | Medium | Low | Types inlined in component |
| Animation keyframes conflict | Low | Low | Check for existing keyframes before adding |
| Epic 3 APIs not ready | Medium | Low | Component receives data via props |
| Focus management issues | Low | Medium | Follow Radix Dialog defaults, test manually |

---

## Total Effort Estimate

| Task | Points |
|------|--------|
| Task 1: Create directory structure | 0.5 |
| Task 2: Create subdirectory and index | 0.5 |
| Task 3: Add Tailwind animations | 1 |
| Task 4: Base component structure | 3 |
| Task 5: Source content section | 1 |
| Task 6: Progress indicator | 1 |
| Task 7: Language list with status rows | 5 |
| Task 8: Loading state | 1 |
| Task 9: Error state | 1 |
| Task 10: Accessibility features | 1 |
| Task 11: Update exports | 0.5 |
| **Total** | **15.5** |

**Estimated Time:** 6-8 hours for experienced developer

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Phase 2, Task 2.2: Create TranslationPreviewPanel component*
*Last Modified: 2026-01-19*
