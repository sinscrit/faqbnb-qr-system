# REQ-E05-006: Create TranslationPreviewPanel Component - Detailed Task Breakdown

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 16:30 UTC
**Request ID:** REQ-E05-006
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.2
**Status:** Ready for Implementation

---

## 1. Document References

| Reference | Location |
|-----------|----------|
| Overview Document | `/docs/REQ-E05-006-create-translationpreviewpanel-component-overview.md` |
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-E05-007) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Panel Pattern Reference | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` |
| Dialog Pattern Reference | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` |
| Types File Reference | `/src/components/TranslationManagement/TranslationManagement.types.ts` |
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` |
| Utility Functions | `/src/lib/utils.ts` |

---

## 2. Implementation Summary

This document provides granular, 1-story-point tasks for implementing the TranslationPreviewPanel component. The panel is a slide-in drawer from the right side that displays translation status and content for a selected entity (item, article, or link), enabling property owners to view, edit, and manage translations.

### Component Hierarchy

```
TranslationPreviewPanel (main container)
├── Dialog.Portal
│   ├── Dialog.Overlay (backdrop)
│   └── Dialog.Content (slide-in panel)
│       ├── Header Section
│       │   ├── Dialog.Title (entity name)
│       │   └── Dialog.Close (X button)
│       ├── Source Content Section
│       │   └── Source language content display
│       ├── Progress Section
│       │   └── TranslationProgressBar
│       ├── Languages Section (scrollable)
│       │   └── TranslationStatusItem × 6
│       └── Footer Section
│           └── Action buttons (Re-translate All, Close)
```

---

## 3. Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] REQ-E05-005 (TranslationManagement.types.ts) is complete with required types
- [ ] `/src/components/TranslationManagement/` directory exists
- [ ] `@radix-ui/react-dialog` is installed (already in project)
- [ ] `lucide-react` icons are available (already in project)
- [ ] Base translation types exist in `/src/lib/translation-service/translation-service.types.ts`

---

## 4. Detailed Tasks

### Task 1: Create TranslationPreviewPanel Directory Structure

**File Operations:**
- CREATE directory: `/src/components/TranslationManagement/TranslationPreviewPanel/`
- CREATE file: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Implementation:**

```typescript
// /src/components/TranslationManagement/TranslationPreviewPanel/index.ts
/**
 * TranslationPreviewPanel barrel exports
 * @module TranslationManagement/TranslationPreviewPanel
 * @created 2026-01-20
 */

export { TranslationPreviewPanel, default } from './TranslationPreviewPanel';
export { TranslationStatusItem } from './TranslationStatusItem';
export { TranslationProgressBar } from './TranslationProgressBar';
```

**Acceptance Criteria:**
- [ ] Directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists
- [ ] `index.ts` exports all sub-components
- [ ] No import errors in barrel export

**Estimated Effort:** 1 story point

---

### Task 2: Implement TranslationProgressBar Component

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Purpose:** Visual progress indicator showing translation completion status.

**Props Interface:**

```typescript
interface TranslationProgressBarProps {
  /** Number of completed translations */
  completed: number;
  /** Total number of translations */
  total: number;
  /** Whether any translation is currently processing */
  isProcessing?: boolean;
  /** Optional CSS class */
  className?: string;
}
```

**Implementation Requirements:**

1. **Display Format:** "X/Y Complete" text with progress bar
2. **Visual Progress Bar:**
   - Container: `h-2 bg-gray-200 rounded-full overflow-hidden`
   - Fill: `h-full bg-green-500 transition-all duration-300`
   - Width calculation: `(completed / total) * 100`%
3. **Processing State:**
   - When `isProcessing=true`, show animated pulse on progress bar
   - Add `animate-pulse` class to fill when processing
4. **Edge Cases:**
   - If `total === 0`, show "No translations" message
   - If `completed === total`, show "All translations complete" variant with green checkmark

**Component Structure:**

```tsx
'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

export interface TranslationProgressBarProps {
  completed: number;
  total: number;
  isProcessing?: boolean;
  className?: string;
}

export function TranslationProgressBar({
  completed,
  total,
  isProcessing = false,
  className,
}: TranslationProgressBarProps) {
  // Implementation here
}
```

**Acceptance Criteria:**
- [ ] Displays "X/Y Complete" format correctly
- [ ] Progress bar fills proportionally to completion percentage
- [ ] Shows animated indicator when `isProcessing` is true
- [ ] Handles edge case when `total` is 0
- [ ] Shows completion state with checkmark when fully translated
- [ ] Accessible with proper ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemax`)

**Estimated Effort:** 1 story point

---

### Task 3: Implement TranslationStatusItem Component - Part 1 (Layout & Display)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Purpose:** Single row displaying language status, preview text, and action buttons.

**Props Interface (from TranslationManagement.types.ts):**

```typescript
interface TranslationStatusItemProps {
  /** Language code (e.g., 'fr', 'es') */
  language: SupportedLanguage;
  /** Translation status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  /** Preview content (translated text) */
  content?: {
    title?: string;
    name?: string;
    description?: string;
  };
  /** Whether translation is stale (source updated after translation) */
  isStale?: boolean;
  /** Whether this is the source language (not editable) */
  isSource?: boolean;
  /** Callback when Edit button clicked */
  onEdit?: () => void;
  /** Callback when Re-translate button clicked */
  onRetranslate?: () => void;
  /** Callback when Retry button clicked (for failed) */
  onRetry?: () => void;
  /** Optional CSS class */
  className?: string;
}
```

**Implementation Requirements - Part 1 (Layout):**

1. **Row Layout:**
   ```
   [Flag] [Language Name] [Status Icon] [Status Label]    [Actions]
          [Preview Text - truncated to 1 line]
   ```

2. **Language Display:**
   - Use flag emoji from `SUPPORTED_LANGUAGES` constant
   - Display native language name (e.g., "Français", "Español")
   - Use `getLanguageInfo()` helper from translation-service.types.ts

3. **Status Indicator:**
   - Icon + color based on status:
     | Status | Icon | Tailwind Color |
     |--------|------|----------------|
     | completed | `Check` | `text-green-500` |
     | manual | `Pencil` | `text-violet-500` |
     | pending | `Clock` | `text-amber-500` |
     | processing | `Loader2` (spinning) | `text-amber-500` |
     | failed | `XCircle` | `text-red-500` |

4. **Stale Indicator:**
   - If `isStale=true` AND status is `manual` or `completed`
   - Show yellow warning icon (`AlertTriangle`)
   - Tooltip: "Source content has been updated since this translation"

5. **Preview Text:**
   - Show first available: `title` || `name` || `description`
   - Truncate with ellipsis (`truncate` class)
   - If processing: show "Translating..." in italic
   - If failed: show "Translation failed" in red

**Acceptance Criteria:**
- [ ] Displays language flag and native name correctly for all 6 languages
- [ ] Shows correct status icon and color for each status
- [ ] Preview text truncates properly with ellipsis
- [ ] Shows stale indicator when applicable
- [ ] Processing status shows spinning loader
- [ ] Minimum height of 44px for touch targets

**Estimated Effort:** 2 story points

---

### Task 4: Implement TranslationStatusItem Component - Part 2 (Action Buttons)

**File:** Continue in `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Implementation Requirements - Part 2 (Actions):**

1. **Action Button Rules by Status:**
   | Status | Edit | Re-translate | Retry |
   |--------|------|--------------|-------|
   | completed | Enabled | Enabled | Hidden |
   | manual | Enabled | Enabled | Hidden |
   | pending | Disabled | Disabled | Hidden |
   | processing | Disabled | Disabled | Hidden |
   | failed | Hidden | Hidden | Enabled |

2. **Button Styling:**
   ```typescript
   // Edit button - secondary style
   'inline-flex items-center justify-center px-3 py-1.5 text-sm',
   'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
   'rounded-md transition-colors',
   'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
   'disabled:opacity-50 disabled:cursor-not-allowed'

   // Re-translate button - icon only with tooltip
   'p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50',
   'rounded-full transition-colors'

   // Retry button - warning style
   'inline-flex items-center gap-1 px-3 py-1.5 text-sm',
   'text-red-600 hover:text-red-700 hover:bg-red-50',
   'rounded-md transition-colors'
   ```

3. **Button Icons:**
   - Edit: `Pencil` (16x16)
   - Re-translate: `RefreshCw` (16x16)
   - Retry: `RotateCcw` (16x16)

4. **Source Language Handling:**
   - If `isSource=true`, show "Source" badge instead of status
   - No action buttons for source language
   - Blue background badge: `bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium`

5. **Accessibility:**
   - All buttons have `aria-label` with clear action description
   - Include language name in aria-label (e.g., "Edit French translation")
   - Disabled buttons have `aria-disabled="true"`

**Acceptance Criteria:**
- [ ] Edit button only enabled for completed/manual status
- [ ] Re-translate button only enabled for completed/manual status
- [ ] Retry button only visible for failed status
- [ ] Source language shows "Source" badge without action buttons
- [ ] All buttons have proper aria-labels
- [ ] Buttons call correct callbacks when clicked
- [ ] Disabled buttons are visually distinct and non-interactive

**Estimated Effort:** 2 story points

---

### Task 5: Implement TranslationPreviewPanel Component - Part 1 (Structure & Header)

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Purpose:** Main slide-in panel container using Radix Dialog.

**Props Interface:**

```typescript
interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';
  /** Entity unique identifier */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Source content for comparison */
  sourceContent: {
    title?: string;
    name?: string;
    description?: string;
  };
  /** Whether panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional: Callback when translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;
  /** Optional CSS class */
  className?: string;
}
```

**Implementation Requirements - Part 1 (Structure):**

1. **Radix Dialog Setup:**
   ```tsx
   <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
     <Dialog.Portal>
       <Dialog.Overlay />
       <Dialog.Content>
         {/* Panel content */}
       </Dialog.Content>
     </Dialog.Portal>
   </Dialog.Root>
   ```

2. **Overlay Styling:**
   ```typescript
   cn(
     'fixed inset-0 z-50 bg-black/50',
     'data-[state=open]:animate-fade-in',
     'data-[state=closed]:animate-fade-out'
   )
   ```

3. **Content (Panel) Positioning:**
   ```typescript
   cn(
     // Base positioning - slide from right
     'fixed z-50 right-0 top-0 h-full',
     'w-[400px] max-w-[100vw]',
     'bg-white shadow-xl',

     // Flex column for header/content/footer
     'flex flex-col',

     // Animation
     'data-[state=open]:animate-slide-in-right',
     'data-[state=closed]:animate-slide-out-right',

     // Mobile responsive
     'max-md:w-full max-md:rounded-t-xl max-md:top-auto max-md:bottom-0 max-md:max-h-[85vh]',
     'max-md:data-[state=open]:animate-slide-in-up',
     'max-md:data-[state=closed]:animate-slide-out-down'
   )
   ```

4. **Header Section:**
   ```tsx
   <div className="relative flex items-center justify-between p-4 border-b border-gray-200">
     {/* Mobile drag handle */}
     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

     <Dialog.Title className="text-lg font-semibold text-gray-900 pr-8">
       Translations
     </Dialog.Title>

     <Dialog.Close asChild>
       <button
         className={cn(
           'absolute right-3 top-3',
           'flex items-center justify-center',
           'w-10 h-10 rounded-full',
           'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
           'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
           'transition-colors'
         )}
         aria-label="Close translations panel"
       >
         <X className="w-5 h-5" />
       </button>
     </Dialog.Close>
   </div>
   ```

**Acceptance Criteria:**
- [ ] Panel slides in from right on desktop (400px width)
- [ ] Panel slides up from bottom on mobile (full width)
- [ ] Overlay backdrop fades in/out
- [ ] Header shows "Translations" title
- [ ] Close button (X) dismisses panel
- [ ] Clicking overlay dismisses panel
- [ ] Escape key closes panel
- [ ] Mobile drag handle indicator visible on mobile only

**Estimated Effort:** 2 story points

---

### Task 6: Implement TranslationPreviewPanel Component - Part 2 (Source Content Section)

**File:** Continue in `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Implementation Requirements - Part 2 (Source Content):**

1. **Source Content Display:**
   ```tsx
   <div className="p-4 border-b border-gray-200 bg-gray-50">
     <div className="flex items-center gap-2 mb-2">
       <span className="text-sm font-medium text-gray-500">
         Source ({getLanguageInfo(sourceLanguage)?.name}):
       </span>
       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
         {getLanguageInfo(sourceLanguage)?.flag} Original
       </span>
     </div>

     <div className="bg-white rounded-lg p-3 border border-gray-200">
       {sourceContent.title && (
         <h4 className="font-medium text-gray-900 mb-1">
           {sourceContent.title}
         </h4>
       )}
       {sourceContent.name && !sourceContent.title && (
         <h4 className="font-medium text-gray-900 mb-1">
           {sourceContent.name}
         </h4>
       )}
       {sourceContent.description && (
         <p className="text-sm text-gray-600 line-clamp-3">
           {sourceContent.description}
         </p>
       )}
     </div>
   </div>
   ```

2. **Content Priority:**
   - Show `title` if available (for articles)
   - Show `name` if no title (for items/links)
   - Show `description` below title/name (truncated to 3 lines)

3. **Empty State:**
   - If no source content properties are set, show "No content available" message

**Acceptance Criteria:**
- [ ] Displays source language name with flag
- [ ] Shows "Original" badge indicator
- [ ] Displays title/name prominently
- [ ] Description truncates after 3 lines
- [ ] Background differentiated from rest of panel (gray-50)
- [ ] Handles empty content gracefully

**Estimated Effort:** 1 story point

---

### Task 7: Implement TranslationPreviewPanel Component - Part 3 (Languages List)

**File:** Continue in `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Implementation Requirements - Part 3 (Languages List):**

1. **State Management:**
   ```typescript
   // Internal state for translations data
   const [translations, setTranslations] = useState<TranslationStatusMap | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   type TranslationStatusMap = Record<SupportedLanguage, {
     status: TranslationStatus;
     content?: { title?: string; name?: string; description?: string };
     isStale?: boolean;
     translatedAt?: string;
     reviewedBy?: string;
   }>;
   ```

2. **Progress Bar Section:**
   ```tsx
   <div className="p-4 border-b border-gray-200">
     <TranslationProgressBar
       completed={completedCount}
       total={totalLanguages}
       isProcessing={hasProcessing}
     />
   </div>
   ```

3. **Languages List Section:**
   ```tsx
   <div className="flex-1 overflow-y-auto">
     <div className="p-4">
       <h3 className="text-sm font-medium text-gray-500 mb-3">
         Translations:
       </h3>
       <div className="space-y-3">
         {SUPPORTED_LANGUAGES.map((lang) => (
           <TranslationStatusItem
             key={lang.code}
             language={lang.code}
             status={translations?.[lang.code]?.status ?? 'pending'}
             content={translations?.[lang.code]?.content}
             isStale={translations?.[lang.code]?.isStale}
             isSource={lang.code === sourceLanguage}
             onEdit={() => handleEdit(lang.code)}
             onRetranslate={() => handleRetranslate(lang.code)}
             onRetry={() => handleRetry(lang.code)}
           />
         ))}
       </div>
     </div>
   </div>
   ```

4. **Language Ordering:**
   - Source language first (if in list)
   - Then alphabetically by language code (DE, EN, ES, FR, IT, NL)

5. **Loading State:**
   ```tsx
   {isLoading && (
     <div className="flex items-center justify-center py-12">
       <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
       <span className="ml-2 text-gray-500">Loading translations...</span>
     </div>
   )}
   ```

6. **Error State:**
   ```tsx
   {error && (
     <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
       <div className="flex items-start gap-3">
         <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
         <div>
           <p className="text-sm font-medium text-red-800">
             Failed to load translations
           </p>
           <p className="text-sm text-red-600 mt-1">{error}</p>
           <button
             onClick={handleRetryFetch}
             className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
           >
             Try again
           </button>
         </div>
       </div>
     </div>
   )}
   ```

**Acceptance Criteria:**
- [ ] Progress bar shows accurate completion count
- [ ] All 6 languages displayed in correct order
- [ ] Source language marked as "Source"
- [ ] Scrollable list when content exceeds viewport
- [ ] Loading state shows while fetching
- [ ] Error state displays with retry option
- [ ] TranslationStatusItem renders correctly for each language

**Estimated Effort:** 2 story points

---

### Task 8: Implement TranslationPreviewPanel Component - Part 4 (Footer & Actions)

**File:** Continue in `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Implementation Requirements - Part 4 (Footer):**

1. **Footer Section:**
   ```tsx
   <div className="flex items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
     <button
       type="button"
       onClick={handleRetranslateAll}
       disabled={isRetranslating || isLoading}
       className={cn(
         'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5',
         'text-sm font-medium rounded-lg',
         'text-white bg-blue-600',
         'hover:bg-blue-700 transition-colors',
         'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
         'disabled:opacity-50 disabled:cursor-not-allowed',
         'min-h-[44px]'
       )}
     >
       {isRetranslating ? (
         <>
           <Loader2 className="w-4 h-4 animate-spin" />
           <span>Re-translating...</span>
         </>
       ) : (
         <>
           <RefreshCw className="w-4 h-4" />
           <span>Re-translate All</span>
         </>
       )}
     </button>

     <button
       type="button"
       onClick={onClose}
       className={cn(
         'px-4 py-2.5 text-sm font-medium rounded-lg',
         'text-gray-700 bg-white border border-gray-300',
         'hover:bg-gray-50 transition-colors',
         'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
         'min-h-[44px]'
       )}
     >
       Close
     </button>
   </div>
   ```

2. **Action Handlers (Stubs):**
   ```typescript
   const handleEdit = useCallback((language: SupportedLanguage) => {
     // Will open TranslationEditor modal (Task 2.5 in Plan)
     console.log('Edit translation:', language);
     // For now, log the action - will be connected to editor later
   }, []);

   const handleRetranslate = useCallback(async (language: SupportedLanguage) => {
     // Will call POST /api/translations/retranslate
     console.log('Re-translate:', language);
     // Stub: update local state to show pending
   }, []);

   const handleRetry = useCallback(async (language: SupportedLanguage) => {
     // Will retry failed translation job
     console.log('Retry translation:', language);
     // Stub: update local state to show pending
   }, []);

   const handleRetranslateAll = useCallback(async () => {
     // Will call POST /api/translations/retranslate with all languages
     console.log('Re-translate all');
     // Show confirmation dialog if manual translations exist
   }, []);
   ```

3. **Manual Edit Warning:**
   - Before `handleRetranslateAll`, check if any translations have `status === 'manual'`
   - If yes, show confirmation: "X translations have manual edits. Re-translating will overwrite them. Continue?"
   - Options: "Keep Manual Edits", "Overwrite All", "Cancel"

**Acceptance Criteria:**
- [ ] Re-translate All button in footer
- [ ] Close button dismisses panel
- [ ] Loading state on Re-translate All button during operation
- [ ] Action handlers are wired up (stubs for now)
- [ ] Buttons meet 44px touch target minimum
- [ ] Footer has distinct background (gray-50)

**Estimated Effort:** 1 story point

---

### Task 9: Add CSS Animations for Slide-in Panel

**File:** Either add to global CSS or create inline keyframes in component

**Implementation Requirements:**

1. **Animation Keyframes:**
   Add to `tailwind.config.js` or use CSS-in-JS:

   ```css
   /* Desktop: Slide from right */
   @keyframes slide-in-right {
     from {
       transform: translateX(100%);
     }
     to {
       transform: translateX(0);
     }
   }

   @keyframes slide-out-right {
     from {
       transform: translateX(0);
     }
     to {
       transform: translateX(100%);
     }
   }

   /* Mobile: Slide from bottom */
   @keyframes slide-in-up {
     from {
       transform: translateY(100%);
     }
     to {
       transform: translateY(0);
     }
   }

   @keyframes slide-out-down {
     from {
       transform: translateY(0);
     }
     to {
       transform: translateY(100%);
     }
   }

   /* Fade for overlay */
   @keyframes fade-in {
     from { opacity: 0; }
     to { opacity: 1; }
   }

   @keyframes fade-out {
     from { opacity: 1; }
     to { opacity: 0; }
   }
   ```

2. **Tailwind Config Extension:**
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         animation: {
           'slide-in-right': 'slide-in-right 300ms ease-out',
           'slide-out-right': 'slide-out-right 300ms ease-in',
           'slide-in-up': 'slide-in-up 300ms ease-out',
           'slide-out-down': 'slide-out-down 300ms ease-in',
           'fade-in': 'fade-in 200ms ease-out',
           'fade-out': 'fade-out 200ms ease-in',
         },
         keyframes: {
           'slide-in-right': {
             from: { transform: 'translateX(100%)' },
             to: { transform: 'translateX(0)' },
           },
           // ... other keyframes
         },
       },
     },
   };
   ```

3. **Alternative: Inline Styles with Radix:**
   If modifying tailwind.config is not desired, use Radix data attributes with inline styles.

**Acceptance Criteria:**
- [ ] Panel slides in from right on open (desktop)
- [ ] Panel slides out to right on close (desktop)
- [ ] Panel slides up from bottom on open (mobile)
- [ ] Panel slides down on close (mobile)
- [ ] Overlay fades in/out
- [ ] Animation duration is 300ms
- [ ] Animations are smooth (ease-out on open, ease-in on close)

**Estimated Effort:** 1 story point

---

### Task 10: Add Accessibility Features

**File:** Updates across all TranslationPreviewPanel files

**Implementation Requirements:**

1. **ARIA Attributes:**
   ```tsx
   // On Dialog.Content
   aria-describedby="panel-description"

   // Add visually hidden description
   <Dialog.Description id="panel-description" className="sr-only">
     View and manage translations for this {entityType}.
     Shows translation status for {SUPPORTED_LANGUAGES.length} languages.
   </Dialog.Description>
   ```

2. **Status Announcements:**
   ```tsx
   // Add aria-live region for status updates
   <div
     aria-live="polite"
     aria-atomic="true"
     className="sr-only"
   >
     {statusAnnouncement}
   </div>

   // Update statusAnnouncement when:
   // - Panel opens: "Translations panel opened for [entity name]"
   // - Translation completes: "[Language] translation completed"
   // - Translation fails: "[Language] translation failed"
   ```

3. **Keyboard Navigation:**
   - Tab through language items and action buttons
   - Enter/Space activates buttons
   - Escape closes panel
   - Focus trapped within panel when open

4. **Focus Management:**
   ```tsx
   // Ref for initial focus
   const initialFocusRef = useRef<HTMLButtonElement>(null);

   // On Dialog.Content
   onOpenAutoFocus={(e) => {
     e.preventDefault();
     initialFocusRef.current?.focus();
   }}
   onCloseAutoFocus={(e) => {
     // Focus returns to trigger element automatically
   }}
   ```

5. **Status Icon Labels:**
   ```tsx
   // Each status icon should have aria-label
   <Check className="w-4 h-4 text-green-500" aria-label="Translation completed" />
   <Clock className="w-4 h-4 text-amber-500" aria-label="Translation pending" />
   <XCircle className="w-4 h-4 text-red-500" aria-label="Translation failed" />
   ```

**Acceptance Criteria:**
- [ ] Screen readers announce panel open/close
- [ ] Status changes are announced via aria-live
- [ ] All interactive elements are keyboard accessible
- [ ] Focus is trapped within panel
- [ ] Escape key closes panel
- [ ] All status icons have descriptive aria-labels
- [ ] Color is not the only indicator of status (icons included)

**Estimated Effort:** 1 story point

---

### Task 11: Add Responsive Design for Mobile

**File:** Updates in `TranslationPreviewPanel.tsx`

**Implementation Requirements:**

1. **Mobile Breakpoint:** `<768px` (md breakpoint)

2. **Mobile Layout Changes:**
   - Full width instead of 400px
   - Slides up from bottom instead of from right
   - Max height 85vh
   - Rounded corners on top only
   - Visible drag handle indicator

3. **Mobile-Specific Styles:**
   ```tsx
   // Content panel
   cn(
     // Desktop
     'fixed z-50 right-0 top-0 h-full w-[400px]',

     // Mobile overrides
     'max-md:inset-x-0 max-md:bottom-0 max-md:top-auto',
     'max-md:w-full max-md:max-h-[85vh] max-md:h-auto',
     'max-md:rounded-t-xl max-md:rounded-b-none'
   )
   ```

4. **Touch Target Sizes:**
   - All buttons minimum 44x44px
   - Adequate spacing between interactive elements
   - Language items have sufficient padding

5. **Footer on Mobile:**
   - Stack buttons vertically on very small screens (<400px)
   ```tsx
   'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'
   ```

**Acceptance Criteria:**
- [ ] Panel is full width on mobile
- [ ] Panel slides up from bottom on mobile
- [ ] Drag handle visible on mobile
- [ ] Max height prevents full-screen coverage
- [ ] Touch targets are at least 44px
- [ ] Footer buttons stack on very small screens
- [ ] Content remains scrollable on mobile

**Estimated Effort:** 1 story point

---

### Task 12: Update Parent Barrel Export

**File:** `/src/components/TranslationManagement/index.ts`

**Implementation Requirements:**

1. **Add TranslationPreviewPanel Export:**
   ```typescript
   // /src/components/TranslationManagement/index.ts
   /**
    * TranslationManagement component exports
    * @module TranslationManagement
    * @lastModified 2026-01-20
    */

   // Types
   export * from './TranslationManagement.types';

   // TranslationPreviewPanel
   export {
     TranslationPreviewPanel,
     TranslationStatusItem,
     TranslationProgressBar,
   } from './TranslationPreviewPanel';
   ```

2. **Verify No Circular Dependencies:**
   - Ensure types are imported from the types file, not from components
   - Check that all exports resolve correctly

**Acceptance Criteria:**
- [ ] TranslationPreviewPanel exported from parent barrel
- [ ] TranslationStatusItem exported from parent barrel
- [ ] TranslationProgressBar exported from parent barrel
- [ ] No circular dependency errors
- [ ] All exports available from `@/components/TranslationManagement`

**Estimated Effort:** 1 story point

---

### Task 13: Integration with Stub Data (Testing)

**File:** Updates in `TranslationPreviewPanel.tsx`

**Implementation Requirements:**

1. **Mock Data for Development:**
   ```typescript
   const MOCK_TRANSLATIONS: TranslationStatusMap = {
     en: { status: 'completed', content: { title: 'Source Title' } },
     fr: { status: 'completed', content: { title: 'Titre Français' } },
     es: { status: 'completed', content: { title: 'Título Español' } },
     de: { status: 'processing' },
     nl: { status: 'pending' },
     it: { status: 'failed' },
   };
   ```

2. **useEffect for Mock Data Loading:**
   ```typescript
   useEffect(() => {
     if (!isOpen) return;

     // Simulate API fetch
     setIsLoading(true);
     setError(null);

     const timer = setTimeout(() => {
       // TODO: Replace with actual API call
       // const response = await fetch(`/api/translations/status?entityType=${entityType}&entityId=${entityId}`);
       setTranslations(MOCK_TRANSLATIONS);
       setIsLoading(false);
     }, 500);

     return () => clearTimeout(timer);
   }, [isOpen, entityType, entityId]);
   ```

3. **Feature Flag/Comment for Hook Integration:**
   ```typescript
   // TODO: Replace mock data with useTranslationStatus hook (Task 2.6)
   // const { translations, isLoading, error } = useTranslationStatus({
   //   entityType,
   //   entityId,
   // });
   ```

**Acceptance Criteria:**
- [ ] Panel renders with mock translation data
- [ ] All 6 languages display different statuses
- [ ] Loading state simulated (500ms delay)
- [ ] Component is fully testable with mocks
- [ ] Clear TODO comments for hook integration

**Estimated Effort:** 1 story point

---

## 5. Implementation Order

Execute tasks in the following order to ensure dependencies are satisfied:

1. **Task 1:** Create directory structure (prerequisite for all)
2. **Task 9:** Add CSS animations (can be done in parallel)
3. **Task 2:** TranslationProgressBar (independent)
4. **Tasks 3-4:** TranslationStatusItem (depends on Task 1)
5. **Tasks 5-8:** TranslationPreviewPanel (depends on Tasks 2-4)
6. **Task 10:** Accessibility (after main components)
7. **Task 11:** Responsive design (after main components)
8. **Task 12:** Update parent barrel export (after all components)
9. **Task 13:** Integration with stub data (final testing)

---

## 6. Testing Checklist

### Unit Tests

- [ ] TranslationProgressBar renders correct count
- [ ] TranslationProgressBar shows processing animation
- [ ] TranslationStatusItem displays correct status icon/color
- [ ] TranslationStatusItem shows/hides action buttons correctly
- [ ] TranslationStatusItem handles stale indicator
- [ ] TranslationPreviewPanel opens/closes correctly
- [ ] TranslationPreviewPanel displays source content

### Integration Tests

- [ ] Panel opens when `isOpen` prop changes
- [ ] Close button dismisses panel
- [ ] Escape key closes panel
- [ ] Overlay click closes panel
- [ ] Action callbacks are triggered correctly

### Accessibility Tests

- [ ] Focus trap works correctly
- [ ] Screen reader announces panel state
- [ ] Keyboard navigation through all elements
- [ ] Color contrast meets WCAG AA

### Visual Tests

- [ ] Animations are smooth
- [ ] Mobile layout is correct
- [ ] All statuses display correctly
- [ ] Loading and error states render properly

---

## 7. Files Summary

### Files to CREATE

| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main panel component |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Single language row |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Progress indicator |

### Files to MODIFY

| File | Changes |
|------|---------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationPreviewPanel export |
| `tailwind.config.js` (optional) | Add slide animation keyframes |

### Files to READ (Reference)

| File | Purpose |
|------|---------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Dialog pattern |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Action button patterns |
| `/src/lib/translation-service/translation-service.types.ts` | Language types, constants |
| `/src/lib/utils.ts` | `cn()` utility |

---

## 8. Acceptance Criteria from Requirements (REQ-E05-007)

| Criteria | Task Coverage |
|----------|---------------|
| Panel slides in from right side with smooth animation (300ms) | Tasks 5, 9 |
| Panel width is fixed at 400 pixels on desktop | Task 5 |
| Panel header displays the entity type and identifier | Task 5 |
| Source content section displays original language content | Task 6 |
| Language list displays all six supported languages | Task 7 |
| Each language entry shows translation status with visual indicator | Tasks 3-4 |
| Edit button opens translation editor | Task 4 (stub) |
| Re-translate button queues new translation job | Task 4 (stub) |
| Retry button re-attempts failed translation jobs | Task 4 (stub) |
| Action buttons are contextually enabled/disabled | Task 4 |
| Close button or overlay click dismisses panel | Tasks 5, 8 |
| Panel content scrolls independently | Task 7 |
| Panel is responsive for tablet viewports (768px and below) | Task 11 |
| Panel overlays content without affecting page layout | Task 5 |
| Loading states display while fetching translation data | Task 7 |
| Error states display when translation data cannot be loaded | Task 7 |
| Component accepts entity reference as props | Task 5 |
| Component integrates with translation status API | Task 13 (stub) |

---

## 9. Dependencies on Other Tasks

### Blocked By

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E05-005: TranslationManagement.types.ts | Required | Must define props interfaces |
| TranslationManagement directory | Required | Parent directory must exist |

### Unblocks

| Task | Description |
|------|-------------|
| Plan Task 2.5 | TranslationEditor modal (Edit button handler) |
| Plan Task 2.6 | useTranslationStatus hook integration |
| Plan Task 2.7 | useTranslationRealtime hook integration |
| Plan Task 7.1 | Integration into article editor |
| Plan Task 7.2 | Integration into item editor |

---

## 10. Notes for Implementing Developer

1. **Start with mocks:** Use MOCK_TRANSLATIONS data until hooks are available
2. **Animation approach:** If tailwind.config modification is restricted, use CSS-in-JS or Radix data-state attributes with inline styles
3. **TypeScript strict mode:** Ensure all props are properly typed, no `any` types
4. **Follow existing patterns:** Match the style of ItemPreviewModal.tsx closely
5. **Test on mobile:** Use browser dev tools to verify mobile layout
6. **Accessibility first:** Add ARIA attributes as you build, not as an afterthought

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: Create TranslationPreviewPanel Component - Detailed Breakdown*
*Last Modified: 2026-01-20 16:30 UTC*
