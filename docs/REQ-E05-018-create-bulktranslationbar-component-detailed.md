# REQ-E05-018: Create BulkTranslationBar Component - Detailed Task Breakdown

**Generated**: 2026-01-22 23:27
**Last Modified**: 2026-01-22 23:27
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 4 - Bulk Operations & Management Page
**Task ID**: 4.1

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-018-create-bulktranslationbar-component-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (Request #18, lines 2550-2809)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task Breakdown

### Task 1: Create BulkTranslationBar Component Directory Structure

**Context**: Create the component directory following the established TranslationManagement folder structure pattern.

**Files to modify**:
- Create directory: `/src/components/TranslationManagement/BulkTranslationBar/`

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **1.1** Create directory `/src/components/TranslationManagement/BulkTranslationBar/`
- [ ] **1.2** Verify the TranslationManagement parent directory exists
- [ ] **1.3** Verify directory creation was successful
- [ ] **1.4** Document directory structure in code comments

---

### Task 2: Define TypeScript Interfaces and Types in BulkTranslationBar Component

**Context**: Define all type interfaces, enums, and type aliases needed for the component props and internal state.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` (new file)

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **2.1** Create the file `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`
- [ ] **2.2** Add file header with JSDoc: "BulkTranslationBar Component - Contextual action bar for bulk translation operations"
- [ ] **2.3** Add @module tag: `@module TranslationManagement/BulkTranslationBar`
- [ ] **2.4** Add @lastModified tag with current date: `@lastModified 2026-01-22 (REQ-E05-018 - Created component)`
- [ ] **2.5** Define `BulkOperationResult` interface with fields: success, jobCount, skippedCount, errors
- [ ] **2.6** Add comprehensive JSDoc to BulkOperationResult interface
- [ ] **2.7** Define `SupportedLanguage` type alias: `'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt'`
- [ ] **2.8** Add JSDoc comment to SupportedLanguage: "Supported target languages for translation"
- [ ] **2.9** Define `BulkTranslationBarProps` interface with all 10 properties from spec
- [ ] **2.10** Add JSDoc to each prop in BulkTranslationBarProps
- [ ] **2.11** Define internal `BulkBarState` interface with operationStatus, progress, currentItem, result, error fields
- [ ] **2.12** Add JSDoc to BulkBarState: "Internal state for bulk operation tracking"
- [ ] **2.13** Export BulkOperationResult and SupportedLanguage types (use `export interface` and `export type`)
- [ ] **2.14** Keep BulkBarState internal (no export)
- [ ] **2.15** Run `npm run typecheck` to verify types are correct
- [ ] **2.16** Fix any TypeScript errors

---

### Task 3: Define Language Constants Array

**Context**: Create a constant array containing all supported languages with display data (code, labelKey, flag emoji).

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **3.1** After type definitions, add LANGUAGE_OPTIONS constant
- [ ] **3.2** Add JSDoc comment: "Supported languages with display names and flag emojis"
- [ ] **3.3** Create array with object for 'es': `{ code: 'es' as const, labelKey: 'spanish', flag: '🇪🇸' }`
- [ ] **3.4** Add object for 'fr': `{ code: 'fr' as const, labelKey: 'french', flag: '🇫🇷' }`
- [ ] **3.5** Add object for 'de': `{ code: 'de' as const, labelKey: 'german', flag: '🇩🇪' }`
- [ ] **3.6** Add object for 'it': `{ code: 'it' as const, labelKey: 'italian', flag: '🇮🇹' }`
- [ ] **3.7** Add object for 'nl': `{ code: 'nl' as const, labelKey: 'dutch', flag: '🇳🇱' }`
- [ ] **3.8** Add object for 'pt': `{ code: 'pt' as const, labelKey: 'portuguese', flag: '🇵🇹' }`
- [ ] **3.9** Add `as const` at the end of array definition for type safety
- [ ] **3.10** Verify TypeScript infers correct literal types

---

### Task 4: Create ActionButton Subcomponent

**Context**: Create a reusable button component for all action buttons in the bar, with variant styling support.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **4.1** Define `ActionButtonProps` interface with icon, label, onClick, variant, disabled, className props
- [ ] **4.2** Add JSDoc to ActionButtonProps interface
- [ ] **4.3** Define `variantStyles` object with primary, secondary, destructive, ghost style mappings
- [ ] **4.4** Use purple colors for primary variant: `bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800`
- [ ] **4.5** Use gray for secondary: `bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300`
- [ ] **4.6** Use red for destructive: `bg-red-600 text-white hover:bg-red-700 active:bg-red-800`
- [ ] **4.7** Use transparent for ghost: `bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100`
- [ ] **4.8** Create `ActionButton` function component
- [ ] **4.9** Destructure props with default variant='secondary' and disabled=false
- [ ] **4.10** Return button element with type="button"
- [ ] **4.11** Add onClick handler and disabled attribute
- [ ] **4.12** Add aria-label and title attributes with label prop
- [ ] **4.13** Apply className using cn() utility with base classes, variant styles, and disabled styles
- [ ] **4.14** Add base classes: `flex items-center justify-center gap-1.5`
- [ ] **4.15** Add touch target size: `min-h-[44px] min-w-[44px]`
- [ ] **4.16** Add padding: `px-3 py-2`
- [ ] **4.17** Add border radius: `rounded-md`
- [ ] **4.18** Add typography: `text-sm font-medium`
- [ ] **4.19** Add transitions: `transition-colors duration-150`
- [ ] **4.20** Add focus styles: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white`
- [ ] **4.21** Add disabled styles: `disabled && 'opacity-50 cursor-not-allowed'`
- [ ] **4.22** Render Icon component with `h-4 w-4 flex-shrink-0` and `aria-hidden="true"`
- [ ] **4.23** Render label text wrapped in span with `hidden sm:inline` (hide on mobile)
- [ ] **4.24** Verify button renders correctly with all variants

---

### Task 5: Create LanguageDropdownButton Subcomponent

**Context**: Implement a dropdown menu component for selecting a specific language for re-translation.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 45 minutes

**Subtasks**:
- [ ] **5.1** Define `LanguageDropdownButtonProps` interface with languages, onSelectLanguage, disabled props
- [ ] **5.2** Add JSDoc to LanguageDropdownButtonProps
- [ ] **5.3** Create `LanguageDropdownButton` function component
- [ ] **5.4** Destructure props with disabled default to false
- [ ] **5.5** Call `useTranslations('translationManagement.bulkBar')` for t
- [ ] **5.6** Call `useTranslations('languages')` for tLang
- [ ] **5.7** Add state: `const [isOpen, setIsOpen] = useState(false);`
- [ ] **5.8** Return wrapper div with `relative` className
- [ ] **5.9** Create trigger button with type="button"
- [ ] **5.10** Add onClick handler: `() => setIsOpen(!isOpen)`
- [ ] **5.11** Add disabled attribute from props
- [ ] **5.12** Style button with: `flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200`
- [ ] **5.13** Add focus styles: `focus:outline-none focus:ring-2 focus:ring-purple-500`
- [ ] **5.14** Add disabled styles: `disabled && 'opacity-50 cursor-not-allowed'`
- [ ] **5.15** Render Globe icon from lucide-react with `h-4 w-4` and `aria-hidden="true"`
- [ ] **5.16** Render button label text: `t('actions.retranslateLanguage')` with `hidden sm:inline`
- [ ] **5.17** Render ChevronDown icon with `h-3 w-3` and `aria-hidden="true"`
- [ ] **5.18** Add conditional rendering: `{isOpen && !disabled && (...)}`
- [ ] **5.19** Inside conditional, render backdrop div with `fixed inset-0 z-10` and onClick to close
- [ ] **5.20** Render dropdown menu div with `absolute bottom-full mb-2 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]`
- [ ] **5.21** Map over languages array
- [ ] **5.22** For each language, render button with key={code}
- [ ] **5.23** Add onClick handler: call onSelectLanguage(code) and setIsOpen(false)
- [ ] **5.24** Style language button: `w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md`
- [ ] **5.25** Render flag emoji in span with `aria-hidden="true"`
- [ ] **5.26** Render language name: `tLang(labelKey)`
- [ ] **5.27** Test dropdown opens and closes correctly
- [ ] **5.28** Test language selection triggers callback

---

### Task 6: Implement Main Component Structure with Imports

**Context**: Set up the main BulkTranslationBar component function with all necessary imports and initial structure.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **6.1** Add 'use client' directive at the top of file
- [ ] **6.2** Import useState, useCallback, useEffect from 'react'
- [ ] **6.3** Import useTranslations from 'next-intl'
- [ ] **6.4** Import icons from 'lucide-react': Check, Loader2, X, AlertCircle, RotateCw, Globe, ChevronDown
- [ ] **6.5** Import cn utility from '@/lib/utils'
- [ ] **6.6** Create main export function: `export function BulkTranslationBar({...props}: BulkTranslationBarProps)`
- [ ] **6.7** Destructure all props from BulkTranslationBarProps
- [ ] **6.8** Set default values: isProcessing=false, progress=0, isVisible=true
- [ ] **6.9** Call useTranslations hooks: `const t = useTranslations('translationManagement.bulkBar');`
- [ ] **6.10** Call useTranslations for languages: `const tLang = useTranslations('languages');`
- [ ] **6.11** Add internal state: `const [barState, setBarState] = useState<BulkBarState>({ operationStatus: 'idle', progress: 0 });`
- [ ] **6.12** Add early return: `if (selectedIds.length === 0) return null;`
- [ ] **6.13** Add component return statement with main container div
- [ ] **6.14** Verify imports resolve correctly
- [ ] **6.15** Run `npm run typecheck` to check for errors

---

### Task 7: Implement Main Container Styling and Animation

**Context**: Apply fixed positioning, animation, and styling to the main container div.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **7.1** Add role="toolbar" to main container div
- [ ] **7.2** Add aria-label attribute: `t('ariaLabel', { count: selectedIds.length })`
- [ ] **7.3** Apply className using cn() utility
- [ ] **7.4** Add fixed positioning: `fixed bottom-0 left-0 right-0 z-40`
- [ ] **7.5** Add background and border: `bg-white border-t border-gray-200`
- [ ] **7.6** Add shadow: `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]`
- [ ] **7.7** Add safe area padding for iOS: `pb-[env(safe-area-inset-bottom)]`
- [ ] **7.8** Add slide-in animation: `animate-in slide-in-from-bottom duration-300`
- [ ] **7.9** Add motion-reduce support: `motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-200`
- [ ] **7.10** Add className prop pass-through
- [ ] **7.11** Inside main div, create content container: `<div className="max-w-7xl mx-auto px-4 py-3">`
- [ ] **7.12** Add placeholder comment: `{/* Render different layouts based on operation status */}`
- [ ] **7.13** Verify animation classes work correctly

---

### Task 8: Implement Selection Count Display (Idle State Part 1)

**Context**: Create the selection count indicator that displays when bar is in idle state.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **8.1** Inside content container, add conditional: `{barState.operationStatus === 'idle' && !isProcessing && (...)}`
- [ ] **8.2** Inside conditional, create flex container: `<div className="flex items-center gap-4 justify-between">`
- [ ] **8.3** Create left section: `<div className="flex items-center gap-2 min-w-0">`
- [ ] **8.4** Add checkmark circle: `<div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-50 flex-shrink-0" aria-hidden="true">`
- [ ] **8.5** Inside circle, render Check icon: `<Check className="h-4 w-4 text-purple-600" />`
- [ ] **8.6** After circle div, add selection text: `<span className="text-sm font-medium text-gray-900 truncate">`
- [ ] **8.7** Inside span, render: `t('selected', { count: selectedIds.length })`
- [ ] **8.8** After visible text, add screen reader text: `<span className="sr-only">{t('selectedAria', { count: selectedIds.length })}</span>`
- [ ] **8.9** Close left section div
- [ ] **8.10** Create right section placeholder for action buttons (next task)
- [ ] **8.11** Close flex container
- [ ] **8.12** Verify selection count displays correctly

---

### Task 9: Implement Action Buttons (Idle State Part 2)

**Context**: Add "Re-translate All", language dropdown, and clear buttons to the idle state layout.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **9.1** After left section (selection count), create buttons container: `<div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">`
- [ ] **9.2** Add "Re-translate All" button using ActionButton component
- [ ] **9.3** Pass icon={RotateCw} to ActionButton
- [ ] **9.4** Pass label={t('actions.retranslateAll')}
- [ ] **9.5** Pass onClick={handleRetranslateAll} (function to be created later)
- [ ] **9.6** Pass variant="primary"
- [ ] **9.7** Pass disabled={isProcessing}
- [ ] **9.8** Add LanguageDropdownButton component
- [ ] **9.9** Pass languages={LANGUAGE_OPTIONS}
- [ ] **9.10** Pass onSelectLanguage={handleRetranslateLanguage} (function to be created later)
- [ ] **9.11** Pass disabled={isProcessing}
- [ ] **9.12** Add clear button using ActionButton component
- [ ] **9.13** Pass icon={X}
- [ ] **9.14** Pass label={t('actions.clear')}
- [ ] **9.15** Pass onClick={onClearSelection}
- [ ] **9.16** Pass variant="ghost"
- [ ] **9.17** Pass disabled={isProcessing}
- [ ] **9.18** Close buttons container div
- [ ] **9.19** Verify buttons render correctly in idle state

---

### Task 10: Implement Processing State Layout

**Context**: Create the progress bar and status message display for when bulk operations are in progress.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 40 minutes

**Subtasks**:
- [ ] **10.1** After idle state conditional, add new conditional: `{(barState.operationStatus === 'processing' || isProcessing) && (...)}`
- [ ] **10.2** Create flex container: `<div className="flex items-center gap-4 justify-between">`
- [ ] **10.3** Create progress section: `<div className="flex-1 max-w-3xl">`
- [ ] **10.4** Add status message container: `<div className="flex items-center gap-2 mb-2">`
- [ ] **10.5** Render Loader2 icon: `<Loader2 className="h-4 w-4 animate-spin text-purple-600" aria-hidden="true" />`
- [ ] **10.6** Render status text: `<span className="text-sm font-medium text-gray-900">{statusMessage || t('processing', { count: selectedIds.length })}</span>`
- [ ] **10.7** Close status message container
- [ ] **10.8** Create progress bar wrapper: `<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">`
- [ ] **10.9** Create progress bar fill: `<div className={cn('h-full bg-purple-600 transition-all duration-100', 'motion-reduce:transition-none')} style={{ width: \`\${progress}%\` }} />`
- [ ] **10.10** Add role="progressbar" to progress bar fill
- [ ] **10.11** Add aria-valuenow={progress}
- [ ] **10.12** Add aria-valuemin={0}
- [ ] **10.13** Add aria-valuemax={100}
- [ ] **10.14** Add aria-label={t('progressLabel', { percent: progress })}
- [ ] **10.15** Close progress bar wrapper
- [ ] **10.16** Add progress percentage display: `<div className="text-xs text-gray-600 mt-1 text-right">{progress.toFixed(0)}%</div>`
- [ ] **10.17** Add ARIA live region: `<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{t('progressAnnounce', { percent: progress, count: selectedIds.length })}</div>`
- [ ] **10.18** Close progress section
- [ ] **10.19** Add cancel button conditionally: `{onCancelOperation && (...)}`
- [ ] **10.20** Inside cancel conditional, render ActionButton with icon={X}, label={t('actions.cancel')}, onClick={onCancelOperation}, variant="destructive"
- [ ] **10.21** Close flex container
- [ ] **10.22** Verify progress bar displays and animates correctly

---

### Task 11: Implement Completed State Layout

**Context**: Create the success message display with result summary for completed operations.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **11.1** After processing state conditional, add new conditional: `{barState.operationStatus === 'completed' && barState.result && (...)}`
- [ ] **11.2** Create flex container: `<div className="flex items-center gap-4 justify-between">`
- [ ] **11.3** Create result message section: `<div className="flex-1">`
- [ ] **11.4** Add message container: `<div className="flex items-center gap-2">`
- [ ] **11.5** Render success icon: `<Check className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />`
- [ ] **11.6** Render result text: `<span className="text-sm font-medium text-gray-900">{t('completed', { queued: barState.result.jobCount, skipped: barState.result.skippedCount })}</span>`
- [ ] **11.7** Close message container
- [ ] **11.8** Add screen reader announcement: `<div className="sr-only" role="status">{t('completedAria', { queued: barState.result.jobCount, skipped: barState.result.skippedCount })}</div>`
- [ ] **11.9** Close result message section
- [ ] **11.10** Add dismiss button: ActionButton with icon={X}, label={t('actions.dismiss')}, onClick={handleDismiss}, variant="ghost"
- [ ] **11.11** Close flex container
- [ ] **11.12** Verify completed state displays correctly

---

### Task 12: Implement Error State Layout

**Context**: Create the error message display for failed operations.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **12.1** After completed state conditional, add new conditional: `{barState.operationStatus === 'error' && (...)}`
- [ ] **12.2** Create flex container: `<div className="flex items-center gap-4 justify-between">`
- [ ] **12.3** Create error message section: `<div className="flex-1">`
- [ ] **12.4** Add message container: `<div className="flex items-center gap-2">`
- [ ] **12.5** Render error icon: `<AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />`
- [ ] **12.6** Render error text: `<span className="text-sm font-medium text-gray-900">{barState.error || t('error')}</span>`
- [ ] **12.7** Close message container
- [ ] **12.8** Add screen reader alert: `<div className="sr-only" role="alert">{barState.error || t('errorAria')}</div>`
- [ ] **12.9** Close error message section
- [ ] **12.10** Add dismiss button: ActionButton with icon={X}, label={t('actions.dismiss')}, onClick={handleDismiss}, variant="ghost"
- [ ] **12.11** Close flex container
- [ ] **12.12** Verify error state displays correctly

---

### Task 13: Implement Handler Functions

**Context**: Create callback functions for handling user actions (re-translate all, re-translate language, dismiss).

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 35 minutes

**Subtasks**:
- [ ] **13.1** Before return statement, create handleRetranslateAll using useCallback
- [ ] **13.2** Set dependencies: [selectedIds, onRetranslateAll, t]
- [ ] **13.3** Inside callback, set barState to processing: `setBarState({ operationStatus: 'processing', progress: 0 });`
- [ ] **13.4** Add try-catch-finally block
- [ ] **13.5** In try, await onRetranslateAll(selectedIds) and store result
- [ ] **13.6** Set barState based on result.success: completed or error
- [ ] **13.7** Set progress to 100, store result in state
- [ ] **13.8** If success, call setTimeout(handleDismiss, 3000) for auto-dismiss
- [ ] **13.9** In catch, set barState to error with error message
- [ ] **13.10** Create handleRetranslateLanguage using useCallback
- [ ] **13.11** Accept language parameter of type SupportedLanguage
- [ ] **13.12** Set dependencies: [selectedIds, onRetranslateLanguage, t]
- [ ] **13.13** Inside callback, set barState to processing
- [ ] **13.14** Add try-catch block similar to handleRetranslateAll
- [ ] **13.15** Call onRetranslateLanguage(selectedIds, language)
- [ ] **13.16** Handle success/error states same as handleRetranslateAll
- [ ] **13.17** Create handleDismiss using useCallback
- [ ] **13.18** Set dependencies: [onClearSelection]
- [ ] **13.19** Inside callback, reset barState to idle: `setBarState({ operationStatus: 'idle', progress: 0 });`
- [ ] **13.20** Call onClearSelection()
- [ ] **13.21** Verify handlers are called correctly when buttons clicked

---

### Task 14: Implement External Progress Sync Effect

**Context**: Sync internal barState when parent component updates isProcessing or progress props.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **14.1** After handler functions, add useEffect hook
- [ ] **14.2** Set dependencies: [isProcessing, progress]
- [ ] **14.3** Inside effect, add conditional: `if (isProcessing) {...}`
- [ ] **14.4** Inside conditional, call setBarState with function updater
- [ ] **14.5** Update operationStatus to 'processing'
- [ ] **14.6** Update progress to external progress prop or keep previous value
- [ ] **14.7** Spread previous state: `...prev`
- [ ] **14.8** Verify external progress updates are reflected in UI

---

### Task 15: Implement Keyboard Accessibility

**Context**: Add keyboard event listener for Escape key to clear selection.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **15.1** After progress sync effect, add new useEffect hook
- [ ] **15.2** Set dependencies: [barState.operationStatus, onClearSelection]
- [ ] **15.3** Create handleKeyDown function inside effect: `const handleKeyDown = (e: KeyboardEvent) => {...}`
- [ ] **15.4** Inside handleKeyDown, check if e.key === 'Escape'
- [ ] **15.5** Check if operationStatus is not 'processing'
- [ ] **15.6** If both conditions true, call onClearSelection()
- [ ] **15.7** Add event listener: `window.addEventListener('keydown', handleKeyDown);`
- [ ] **15.8** Return cleanup function: `return () => window.removeEventListener('keydown', handleKeyDown);`
- [ ] **15.9** Test Escape key clears selection when not processing
- [ ] **15.10** Test Escape key does nothing when processing

---

### Task 16: Create Barrel Export File for BulkTranslationBar

**Context**: Create index.ts file to provide clean imports from the BulkTranslationBar directory.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/index.ts` (new file)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **16.1** Create file `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
- [ ] **16.2** Add file header comment: "Barrel export for BulkTranslationBar component"
- [ ] **16.3** Export BulkTranslationBar as default: `export { BulkTranslationBar as default } from './BulkTranslationBar';`
- [ ] **16.4** Export BulkTranslationBar as named export: `export { BulkTranslationBar } from './BulkTranslationBar';`
- [ ] **16.5** Export BulkTranslationBarProps type: `export type { BulkTranslationBarProps } from './BulkTranslationBar';`
- [ ] **16.6** Export BulkOperationResult type: `export type { BulkOperationResult } from './BulkTranslationBar';`
- [ ] **16.7** Export SupportedLanguage type: `export type { SupportedLanguage } from './BulkTranslationBar';`
- [ ] **16.8** Verify exports work with test import

---

### Task 17: Update Parent TranslationManagement Barrel Export

**Context**: Add BulkTranslationBar exports to the parent TranslationManagement index file.

**Files to modify**:
- `/src/components/TranslationManagement/index.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **17.1** Read `/src/components/TranslationManagement/index.ts` file
- [ ] **17.2** Locate the export section (likely at end of file)
- [ ] **17.3** Add export statement: `export { BulkTranslationBar } from './BulkTranslationBar';`
- [ ] **17.4** Add type exports: `export type { BulkTranslationBarProps, BulkOperationResult, SupportedLanguage } from './BulkTranslationBar';`
- [ ] **17.5** Maintain alphabetical ordering if applicable
- [ ] **17.6** Verify exports are accessible from `@/components/TranslationManagement`
- [ ] **17.7** Run `npm run typecheck` to verify no errors

---

### Task 18: Add English Translation Keys

**Context**: Add all required translation keys to the English message file.

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **18.1** Read `/messages/en.json` file
- [ ] **18.2** Locate or create `translationManagement` namespace object
- [ ] **18.3** Create `bulkBar` nested object inside translationManagement
- [ ] **18.4** Add key `ariaLabel`: "Bulk translation actions for {count} selected items"
- [ ] **18.5** Add key `selected`: "{count, plural, one {# item selected} other {# items selected}}"
- [ ] **18.6** Add key `selectedAria`: "{count, plural, one {# item selected} other {# items selected}}"
- [ ] **18.7** Add key `processing`: "Translating {count} items..."
- [ ] **18.8** Add key `completed`: "Completed: {queued} translations queued, {skipped} skipped"
- [ ] **18.9** Add key `completedAria`: "Translation completed. {queued} jobs queued, {skipped} skipped"
- [ ] **18.10** Add key `error`: "Translation operation failed"
- [ ] **18.11** Add key `errorAria`: "Error: Translation operation failed"
- [ ] **18.12** Add key `operationFailed`: "The translation operation encountered errors"
- [ ] **18.13** Add key `unknownError`: "An unknown error occurred"
- [ ] **18.14** Add key `progressLabel`: "Translation progress: {percent}%"
- [ ] **18.15** Add key `progressAnnounce`: "Translating {count} items. {percent}% complete"
- [ ] **18.16** Create `actions` nested object inside bulkBar
- [ ] **18.17** Add actions.retranslateAll: "Re-translate All"
- [ ] **18.18** Add actions.retranslateLanguage: "Re-translate"
- [ ] **18.19** Add actions.clear: "Clear"
- [ ] **18.20** Add actions.cancel: "Cancel"
- [ ] **18.21** Add actions.dismiss: "Dismiss"
- [ ] **18.22** Verify JSON syntax is valid (proper commas, no trailing commas)
- [ ] **18.23** Run `npm run lint` to check JSON formatting

---

### Task 19: Add French Translation Keys

**Context**: Add French translations for all BulkTranslationBar keys.

**Files to modify**:
- `/messages/fr.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **19.1** Read `/messages/fr.json` file
- [ ] **19.2** Locate or create `translationManagement` namespace
- [ ] **19.3** Create `bulkBar` nested object
- [ ] **19.4** Add ariaLabel: "Actions de traduction en masse pour {count} éléments sélectionnés"
- [ ] **19.5** Add selected: "{count, plural, one {# élément sélectionné} other {# éléments sélectionnés}}"
- [ ] **19.6** Add selectedAria: "{count, plural, one {# élément sélectionné} other {# éléments sélectionnés}}"
- [ ] **19.7** Add processing: "Traduction de {count} éléments..."
- [ ] **19.8** Add completed: "Terminé : {queued} traductions en file d'attente, {skipped} ignorées"
- [ ] **19.9** Add completedAria: "Traduction terminée. {queued} tâches en file d'attente, {skipped} ignorées"
- [ ] **19.10** Add error: "L'opération de traduction a échoué"
- [ ] **19.11** Add errorAria: "Erreur : L'opération de traduction a échoué"
- [ ] **19.12** Add operationFailed: "L'opération de traduction a rencontré des erreurs"
- [ ] **19.13** Add unknownError: "Une erreur inconnue s'est produite"
- [ ] **19.14** Add progressLabel: "Progression de la traduction : {percent}%"
- [ ] **19.15** Add progressAnnounce: "Traduction de {count} éléments. {percent}% terminé"
- [ ] **19.16** Add actions.retranslateAll: "Tout retraduire"
- [ ] **19.17** Add actions.retranslateLanguage: "Retraduire"
- [ ] **19.18** Add actions.clear: "Effacer"
- [ ] **19.19** Add actions.cancel: "Annuler"
- [ ] **19.20** Add actions.dismiss: "Fermer"
- [ ] **19.21** Verify JSON syntax and structure matches English file

---

### Task 20: Add Spanish Translation Keys

**Context**: Add Spanish translations for all BulkTranslationBar keys.

**Files to modify**:
- `/messages/es.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **20.1** Read `/messages/es.json` file
- [ ] **20.2** Locate or create `translationManagement` namespace
- [ ] **20.3** Create `bulkBar` nested object
- [ ] **20.4** Add ariaLabel: "Acciones de traducción masiva para {count} elementos seleccionados"
- [ ] **20.5** Add selected: "{count, plural, one {# elemento seleccionado} other {# elementos seleccionados}}"
- [ ] **20.6** Add selectedAria: "{count, plural, one {# elemento seleccionado} other {# elementos seleccionados}}"
- [ ] **20.7** Add processing: "Traduciendo {count} elementos..."
- [ ] **20.8** Add completed: "Completado: {queued} traducciones en cola, {skipped} omitidas"
- [ ] **20.9** Add completedAria: "Traducción completada. {queued} trabajos en cola, {skipped} omitidos"
- [ ] **20.10** Add error: "La operación de traducción falló"
- [ ] **20.11** Add errorAria: "Error: La operación de traducción falló"
- [ ] **20.12** Add operationFailed: "La operación de traducción encontró errores"
- [ ] **20.13** Add unknownError: "Ocurrió un error desconocido"
- [ ] **20.14** Add progressLabel: "Progreso de traducción: {percent}%"
- [ ] **20.15** Add progressAnnounce: "Traduciendo {count} elementos. {percent}% completado"
- [ ] **20.16** Add actions.retranslateAll: "Retraducir todo"
- [ ] **20.17** Add actions.retranslateLanguage: "Retraducir"
- [ ] **20.18** Add actions.clear: "Limpiar"
- [ ] **20.19** Add actions.cancel: "Cancelar"
- [ ] **20.20** Add actions.dismiss: "Cerrar"
- [ ] **20.21** Verify JSON syntax and structure matches English file

---

### Task 21: Add German Translation Keys

**Context**: Add German translations for all BulkTranslationBar keys.

**Files to modify**:
- `/messages/de.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **21.1** Read `/messages/de.json` file
- [ ] **21.2** Locate or create `translationManagement` namespace
- [ ] **21.3** Create `bulkBar` nested object
- [ ] **21.4** Add ariaLabel: "Massenübersetzungsaktionen für {count} ausgewählte Elemente"
- [ ] **21.5** Add selected: "{count, plural, one {# Element ausgewählt} other {# Elemente ausgewählt}}"
- [ ] **21.6** Add selectedAria: "{count, plural, one {# Element ausgewählt} other {# Elemente ausgewählt}}"
- [ ] **21.7** Add processing: "Übersetze {count} Elemente..."
- [ ] **21.8** Add completed: "Abgeschlossen: {queued} Übersetzungen in Warteschlange, {skipped} übersprungen"
- [ ] **21.9** Add completedAria: "Übersetzung abgeschlossen. {queued} Aufträge in Warteschlange, {skipped} übersprungen"
- [ ] **21.10** Add error: "Übersetzungsvorgang fehlgeschlagen"
- [ ] **21.11** Add errorAria: "Fehler: Übersetzungsvorgang fehlgeschlagen"
- [ ] **21.12** Add operationFailed: "Der Übersetzungsvorgang ist auf Fehler gestoßen"
- [ ] **21.13** Add unknownError: "Ein unbekannter Fehler ist aufgetreten"
- [ ] **21.14** Add progressLabel: "Übersetzungsfortschritt: {percent}%"
- [ ] **21.15** Add progressAnnounce: "Übersetze {count} Elemente. {percent}% abgeschlossen"
- [ ] **21.16** Add actions.retranslateAll: "Alle neu übersetzen"
- [ ] **21.17** Add actions.retranslateLanguage: "Neu übersetzen"
- [ ] **21.18** Add actions.clear: "Löschen"
- [ ] **21.19** Add actions.cancel: "Abbrechen"
- [ ] **21.20** Add actions.dismiss: "Schließen"
- [ ] **21.21** Verify JSON syntax and structure matches English file

---

### Task 22: Add Dutch Translation Keys

**Context**: Add Dutch translations for all BulkTranslationBar keys.

**Files to modify**:
- `/messages/nl.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **22.1** Read `/messages/nl.json` file
- [ ] **22.2** Locate or create `translationManagement` namespace
- [ ] **22.3** Create `bulkBar` nested object
- [ ] **22.4** Add ariaLabel: "Bulkvertaalacties voor {count} geselecteerde items"
- [ ] **22.5** Add selected: "{count, plural, one {# item geselecteerd} other {# items geselecteerd}}"
- [ ] **22.6** Add selectedAria: "{count, plural, one {# item geselecteerd} other {# items geselecteerd}}"
- [ ] **22.7** Add processing: "Vertalen van {count} items..."
- [ ] **22.8** Add completed: "Voltooid: {queued} vertalingen in wachtrij, {skipped} overgeslagen"
- [ ] **22.9** Add completedAria: "Vertaling voltooid. {queued} taken in wachtrij, {skipped} overgeslagen"
- [ ] **22.10** Add error: "Vertaaloperatie mislukt"
- [ ] **22.11** Add errorAria: "Fout: Vertaaloperatie mislukt"
- [ ] **22.12** Add operationFailed: "De vertaaloperatie heeft fouten ondervonden"
- [ ] **22.13** Add unknownError: "Er is een onbekende fout opgetreden"
- [ ] **22.14** Add progressLabel: "Vertaalvoortgang: {percent}%"
- [ ] **22.15** Add progressAnnounce: "Vertalen van {count} items. {percent}% voltooid"
- [ ] **22.16** Add actions.retranslateAll: "Alles opnieuw vertalen"
- [ ] **22.17** Add actions.retranslateLanguage: "Opnieuw vertalen"
- [ ] **22.18** Add actions.clear: "Wissen"
- [ ] **22.19** Add actions.cancel: "Annuleren"
- [ ] **22.20** Add actions.dismiss: "Sluiten"
- [ ] **22.21** Verify JSON syntax and structure matches English file

---

### Task 23: Add Italian Translation Keys

**Context**: Add Italian translations for all BulkTranslationBar keys.

**Files to modify**:
- `/messages/it.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **23.1** Read `/messages/it.json` file
- [ ] **23.2** Locate or create `translationManagement` namespace
- [ ] **23.3** Create `bulkBar` nested object
- [ ] **23.4** Add ariaLabel: "Azioni di traduzione in blocco per {count} elementi selezionati"
- [ ] **23.5** Add selected: "{count, plural, one {# elemento selezionato} other {# elementi selezionati}}"
- [ ] **23.6** Add selectedAria: "{count, plural, one {# elemento selezionato} other {# elementi selezionati}}"
- [ ] **23.7** Add processing: "Traduzione di {count} elementi..."
- [ ] **23.8** Add completed: "Completato: {queued} traduzioni in coda, {skipped} saltate"
- [ ] **23.9** Add completedAria: "Traduzione completata. {queued} lavori in coda, {skipped} saltati"
- [ ] **23.10** Add error: "Operazione di traduzione fallita"
- [ ] **23.11** Add errorAria: "Errore: Operazione di traduzione fallita"
- [ ] **23.12** Add operationFailed: "L'operazione di traduzione ha riscontrato errori"
- [ ] **23.13** Add unknownError: "Si è verificato un errore sconosciuto"
- [ ] **23.14** Add progressLabel: "Progresso traduzione: {percent}%"
- [ ] **23.15** Add progressAnnounce: "Traduzione di {count} elementi. {percent}% completato"
- [ ] **23.16** Add actions.retranslateAll: "Ritradurre tutto"
- [ ] **23.17** Add actions.retranslateLanguage: "Ritradurre"
- [ ] **23.18** Add actions.clear: "Cancella"
- [ ] **23.19** Add actions.cancel: "Annulla"
- [ ] **23.20** Add actions.dismiss: "Chiudi"
- [ ] **23.21** Verify JSON syntax and structure matches English file

---

### Task 24: Run Final Type Check and Build Verification

**Context**: Verify all TypeScript types are correct and production build succeeds.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **24.1** Run command: `npm run typecheck`
- [ ] **24.2** Review any TypeScript errors
- [ ] **24.3** Fix type issues in BulkTranslationBar.tsx if any
- [ ] **24.4** Fix import/export issues if any
- [ ] **24.5** Re-run typecheck until clean
- [ ] **24.6** Run command: `npm run build`
- [ ] **24.7** Verify build succeeds without errors
- [ ] **24.8** Check build output for warnings
- [ ] **24.9** Fix any build issues found
- [ ] **24.10** Document any unresolved issues

---

### Task 25: Test Bar Slides In When Items Selected

**Context**: Manual test to verify the bar appears with animation when items are selected.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **25.1** Start development server: `npm run dev`
- [ ] **25.2** Create a test page that renders BulkTranslationBar
- [ ] **25.3** Start with empty selectedIds array (bar should not render)
- [ ] **25.4** Add items to selectedIds
- [ ] **25.5** Verify bar slides in from bottom smoothly
- [ ] **25.6** Check animation duration is approximately 300ms
- [ ] **25.7** Verify bar is positioned at bottom of viewport
- [ ] **25.8** Check z-index (should be above content but below modals)
- [ ] **25.9** Document any animation issues

---

### Task 26: Test Selection Count Display with Pluralization

**Context**: Verify selection count displays correctly with proper pluralization for 1 vs multiple items.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **26.1** Select 1 item
- [ ] **26.2** Verify text shows "1 item selected" (singular)
- [ ] **26.3** Verify checkmark icon appears in purple circle
- [ ] **26.4** Select 2 items
- [ ] **26.5** Verify text shows "2 items selected" (plural)
- [ ] **26.6** Select 10 items
- [ ] **26.7** Verify text shows "10 items selected"
- [ ] **26.8** Test with different language locales (fr, es, de, nl, it)
- [ ] **26.9** Verify pluralization works correctly in each language

---

### Task 27: Test Re-translate All Button

**Context**: Verify "Re-translate All" button triggers the correct callback with selected item IDs.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **27.1** Create mock onRetranslateAll callback that logs parameters
- [ ] **27.2** Select 3 items
- [ ] **27.3** Click "Re-translate All" button
- [ ] **27.4** Verify callback is called with array of 3 item IDs
- [ ] **27.5** Verify bar switches to processing state
- [ ] **27.6** Mock callback returns success result
- [ ] **27.7** Verify bar switches to completed state
- [ ] **27.8** Verify result summary displays correctly
- [ ] **27.9** Verify bar auto-dismisses after 3 seconds
- [ ] **27.10** Document any issues found

---

### Task 28: Test Language Dropdown Display and Selection

**Context**: Verify dropdown displays all 6 languages with flags and handles selection correctly.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **28.1** Click language dropdown button (globe icon + "Re-translate" label)
- [ ] **28.2** Verify dropdown opens above the button
- [ ] **28.3** Verify 6 languages are displayed: Spanish, French, German, Italian, Dutch, Portuguese
- [ ] **28.4** Verify each language shows flag emoji
- [ ] **28.5** Verify each language shows translated name
- [ ] **28.6** Click Spanish (🇪🇸) option
- [ ] **28.7** Verify onRetranslateLanguage is called with language code 'es'
- [ ] **28.8** Verify dropdown closes after selection
- [ ] **28.9** Test selecting each language (fr, de, it, nl, pt)
- [ ] **28.10** Verify correct language code passed each time
- [ ] **28.11** Click outside dropdown (backdrop)
- [ ] **28.12** Verify dropdown closes
- [ ] **28.13** Document any issues

---

### Task 29: Test Clear Selection Button

**Context**: Verify clear button clears selection and hides the bar.

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **29.1** Select multiple items
- [ ] **29.2** Verify bar is visible
- [ ] **29.3** Click clear button (X icon)
- [ ] **29.4** Verify onClearSelection callback is called
- [ ] **29.5** Verify bar slides out/disappears
- [ ] **29.6** Verify bar does not render when selectedIds is empty
- [ ] **29.7** Document any issues

---

### Task 30: Test Progress Bar Display and Animation

**Context**: Verify progress bar displays correctly and animates smoothly during processing.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **30.1** Select items and trigger re-translate operation
- [ ] **30.2** Verify bar switches to processing state
- [ ] **30.3** Verify Loader2 icon displays and spins
- [ ] **30.4** Verify status message displays ("Translating X items...")
- [ ] **30.5** Verify progress bar is visible
- [ ] **30.6** Manually update progress prop from 0 to 100
- [ ] **30.7** Verify progress bar width animates smoothly
- [ ] **30.8** Verify progress percentage text updates
- [ ] **30.9** Verify ARIA progressbar attributes are correct (valuenow, valuemin, valuemax)
- [ ] **30.10** Check transition duration (should be ~100ms)
- [ ] **30.11** Document any animation issues

---

### Task 31: Test Cancel Button During Processing

**Context**: Verify cancel button appears during processing and triggers cancel callback.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **31.1** Provide onCancelOperation callback prop
- [ ] **31.2** Start a re-translate operation
- [ ] **31.3** Verify cancel button appears in processing state (red destructive button)
- [ ] **31.4** Click cancel button
- [ ] **31.5** Verify onCancelOperation callback is called
- [ ] **31.6** Test without onCancelOperation prop
- [ ] **31.7** Verify cancel button does NOT appear
- [ ] **31.8** Document any issues

---

### Task 32: Test Completed State Display

**Context**: Verify completed state displays result summary correctly.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **32.1** Mock onRetranslateAll to return success result with jobCount: 15, skippedCount: 2
- [ ] **32.2** Trigger re-translate operation
- [ ] **32.3** Wait for operation to complete
- [ ] **32.4** Verify bar switches to completed state
- [ ] **32.5** Verify green checkmark icon displays
- [ ] **32.6** Verify text shows "Completed: 15 translations queued, 2 skipped"
- [ ] **32.7** Verify dismiss button appears
- [ ] **32.8** Wait 3 seconds
- [ ] **32.9** Verify bar auto-dismisses (calls onClearSelection)
- [ ] **32.10** Test clicking dismiss button before 3 seconds
- [ ] **32.11** Verify bar dismisses immediately
- [ ] **32.12** Document any issues

---

### Task 33: Test Error State Display

**Context**: Verify error state displays error message correctly when operation fails.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **33.1** Mock onRetranslateAll to return error result (success: false)
- [ ] **33.2** Trigger re-translate operation
- [ ] **33.3** Verify bar switches to error state
- [ ] **33.4** Verify red AlertCircle icon displays
- [ ] **33.5** Verify error message displays
- [ ] **33.6** Verify dismiss button appears
- [ ] **33.7** Verify bar does NOT auto-dismiss (stays visible)
- [ ] **33.8** Click dismiss button
- [ ] **33.9** Verify bar dismisses and clears selection
- [ ] **33.10** Test with thrown exception instead of error result
- [ ] **33.11** Verify error is caught and error state displays
- [ ] **33.12** Document any issues

---

### Task 34: Test Escape Key Clears Selection

**Context**: Verify pressing Escape key clears selection when bar is idle.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **34.1** Select items (bar in idle state)
- [ ] **34.2** Press Escape key
- [ ] **34.3** Verify onClearSelection is called
- [ ] **34.4** Verify bar disappears
- [ ] **34.5** Start processing operation
- [ ] **34.6** Press Escape key during processing
- [ ] **34.7** Verify onClearSelection is NOT called (operation continues)
- [ ] **34.8** Wait for operation to complete or error
- [ ] **34.9** Press Escape key in completed/error state
- [ ] **34.10** Verify bar dismisses
- [ ] **34.11** Document any issues

---

### Task 35: Test Keyboard Navigation

**Context**: Verify all buttons are keyboard accessible with Tab navigation.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **35.1** Select items to show bar
- [ ] **35.2** Press Tab repeatedly
- [ ] **35.3** Verify focus moves to "Re-translate All" button
- [ ] **35.4** Verify focus ring is visible (purple)
- [ ] **35.5** Press Tab again
- [ ] **35.6** Verify focus moves to language dropdown button
- [ ] **35.7** Press Enter or Space to open dropdown
- [ ] **35.8** Verify dropdown opens
- [ ] **35.9** Press Tab to navigate through language options
- [ ] **35.10** Press Enter to select a language
- [ ] **35.11** Continue Tab navigation to Clear button
- [ ] **35.12** Press Enter to activate Clear button
- [ ] **35.13** Test Tab navigation in processing state (cancel button)
- [ ] **35.14** Test in completed/error state (dismiss button)
- [ ] **35.15** Document any keyboard issues

---

### Task 36: Test Screen Reader Accessibility

**Context**: Verify screen reader announcements and ARIA attributes are correct.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **36.1** Enable screen reader (VoiceOver on macOS or NVDA on Windows)
- [ ] **36.2** Select items to show bar
- [ ] **36.3** Navigate to bar with screen reader
- [ ] **36.4** Verify toolbar role is announced
- [ ] **36.5** Verify aria-label announces "Bulk translation actions for X selected items"
- [ ] **36.6** Navigate to selection count
- [ ] **36.7** Verify screen reader reads selection count
- [ ] **36.8** Navigate to action buttons
- [ ] **36.9** Verify button labels are announced
- [ ] **36.10** Start processing operation
- [ ] **36.11** Verify ARIA live region announces progress updates
- [ ] **36.12** Verify live region is polite (not assertive)
- [ ] **36.13** Wait for completion
- [ ] **36.14** Verify completion status is announced
- [ ] **36.15** Test error state announcement (role="alert")
- [ ] **36.16** Document any accessibility issues

---

### Task 37: Test Reduced Motion Preference

**Context**: Verify animations respect user's prefers-reduced-motion setting.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **37.1** Enable reduced motion in OS settings (macOS: System Preferences > Accessibility > Display > Reduce Motion)
- [ ] **37.2** Refresh browser
- [ ] **37.3** Select items to show bar
- [ ] **37.4** Verify bar appears with fade-in only (no slide animation)
- [ ] **37.5** Start processing operation
- [ ] **37.6** Update progress bar
- [ ] **37.7** Verify progress bar updates without smooth transitions (motion-reduce class applied)
- [ ] **37.8** Clear selection
- [ ] **37.9** Verify bar disappears with fade-out only
- [ ] **37.10** Disable reduced motion and retest
- [ ] **37.11** Verify animations work normally
- [ ] **37.12** Document any issues

---

### Task 38: Test Responsive Layout on Mobile

**Context**: Verify bar layout works correctly on mobile screen sizes.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **38.1** Resize browser to mobile width (375px)
- [ ] **38.2** Select items to show bar
- [ ] **38.3** Verify bar is visible and positioned at bottom
- [ ] **38.4** Verify safe area padding is applied (iOS notch)
- [ ] **38.5** Verify button labels are hidden (only icons visible)
- [ ] **38.6** Verify buttons are still at least 44px min touch target
- [ ] **38.7** Verify buttons may wrap to multiple rows if needed
- [ ] **38.8** Test language dropdown opens correctly
- [ ] **38.9** Verify dropdown is readable on mobile
- [ ] **38.10** Test in processing state
- [ ] **38.11** Verify progress bar fits within mobile width
- [ ] **38.12** Document any mobile layout issues

---

### Task 39: Test Responsive Layout on Desktop

**Context**: Verify bar layout works correctly on desktop screen sizes.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **39.1** Resize browser to desktop width (1280px+)
- [ ] **39.2** Select items to show bar
- [ ] **39.3** Verify bar is visible and centered with max-width
- [ ] **39.4** Verify button labels are visible (not hidden)
- [ ] **39.5** Verify horizontal layout (all buttons in one row)
- [ ] **39.6** Verify appropriate gap between buttons (gap-3)
- [ ] **39.7** Test language dropdown opens correctly
- [ ] **39.8** Test in processing state
- [ ] **39.9** Verify progress bar has max-width constraint
- [ ] **39.10** Document any desktop layout issues

---

### Task 40: Test Internationalization for All Languages

**Context**: Verify all UI text displays correctly in all 6 supported languages.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **40.1** Switch application language to English (en)
- [ ] **40.2** Verify all button labels and messages in English
- [ ] **40.3** Verify pluralization works in English
- [ ] **40.4** Switch to French (fr)
- [ ] **40.5** Verify all text is in French
- [ ] **40.6** Verify language names in dropdown are in French
- [ ] **40.7** Switch to Spanish (es)
- [ ] **40.8** Verify all text is in Spanish
- [ ] **40.9** Switch to German (de)
- [ ] **40.10** Verify all text is in German
- [ ] **40.11** Switch to Dutch (nl)
- [ ] **40.12** Verify all text is in Dutch
- [ ] **40.13** Switch to Italian (it)
- [ ] **40.14** Verify all text is in Italian
- [ ] **40.15** Document any missing or incorrect translations

---

### Task 41: Test With Mock API Integration

**Context**: Create a mock implementation to test full operation flow with async operations.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **41.1** Create test page with BulkTranslationBar
- [ ] **41.2** Implement mock onRetranslateAll that simulates API call
- [ ] **41.3** Mock should update progress state every 500ms
- [ ] **41.4** Mock should complete after 3 seconds with success result
- [ ] **41.5** Trigger "Re-translate All" operation
- [ ] **41.6** Verify progress updates from 0 to 100
- [ ] **41.7** Verify status messages update
- [ ] **41.8** Verify completion state displays
- [ ] **41.9** Verify auto-dismiss after 3 seconds
- [ ] **41.10** Implement mock that simulates error
- [ ] **41.11** Trigger operation
- [ ] **41.12** Verify error state displays correctly
- [ ] **41.13** Document any integration issues

---

### Task 42: Verify No Console Errors or Warnings

**Context**: Ensure component runs without generating console errors or warnings.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **42.1** Open browser DevTools console
- [ ] **42.2** Clear console
- [ ] **42.3** Select items to show bar
- [ ] **42.4** Check for errors or warnings
- [ ] **42.5** Click each button (Re-translate All, language dropdown, clear)
- [ ] **42.6** Check console after each interaction
- [ ] **42.7** Trigger processing state
- [ ] **42.8** Check for errors during processing
- [ ] **42.9** Wait for completion
- [ ] **42.10** Check console after completion
- [ ] **42.11** Trigger error state
- [ ] **42.12** Check console for unhandled errors
- [ ] **42.13** Filter console for React warnings (keys, hooks, etc.)
- [ ] **42.14** Fix any issues found
- [ ] **42.15** Document any unresolved issues

---

### Task 43: Create Component Usage Example Documentation

**Context**: Document how to use the BulkTranslationBar component with example code.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **43.1** Create or update component documentation file
- [ ] **43.2** Document required props
- [ ] **43.3** Document optional props
- [ ] **43.4** Provide example implementation in parent component
- [ ] **43.5** Show example of handling onRetranslateAll callback
- [ ] **43.6** Show example of handling onRetranslateLanguage callback
- [ ] **43.7** Show example of progress tracking
- [ ] **43.8** Document expected BulkOperationResult structure
- [ ] **43.9** Provide example of error handling
- [ ] **43.10** Document keyboard shortcuts (Escape)
- [ ] **43.11** Document accessibility features
- [ ] **43.12** Include example with all states (idle, processing, completed, error)

---

### Task 44: Final Code Review and Cleanup

**Context**: Review all code for quality, consistency, and adherence to project standards.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **44.1** Review BulkTranslationBar.tsx for code quality
- [ ] **44.2** Verify all JSDoc comments are present and accurate
- [ ] **44.3** Check for any TODO or FIXME comments that need addressing
- [ ] **44.4** Verify consistent naming conventions
- [ ] **44.5** Check for unused imports or variables
- [ ] **44.6** Verify all props have proper TypeScript types
- [ ] **44.7** Review error handling in all handlers
- [ ] **44.8** Check for proper use of useCallback dependencies
- [ ] **44.9** Verify useEffect dependencies are complete
- [ ] **44.10** Review accessibility attributes (ARIA)
- [ ] **44.11** Check animation classes and motion-reduce support
- [ ] **44.12** Verify all translation keys are used correctly
- [ ] **44.13** Run `npm run lint` and fix any issues
- [ ] **44.14** Run `npm run typecheck` and verify no errors
- [ ] **44.15** Run `npm run build` and verify success

---

### Task 45: Create Summary Test Report

**Context**: Document all testing performed and results for project records.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **45.1** Create test summary document
- [ ] **45.2** List all test scenarios performed (Tasks 25-42)
- [ ] **45.3** Document pass/fail status for each test
- [ ] **45.4** List any issues found during testing
- [ ] **45.5** Document resolutions for each issue
- [ ] **45.6** Include screenshots of key states (idle, processing, completed, error)
- [ ] **45.7** Document browser compatibility tested
- [ ] **45.8** Note screen sizes tested (mobile, tablet, desktop)
- [ ] **45.9** Document accessibility testing performed
- [ ] **45.10** Note any known limitations or edge cases
- [ ] **45.11** Verify all acceptance criteria are met
- [ ] **45.12** Sign off on component completion

---

## Dependencies

### Must Complete First:
- **REQ-E05-003**: Re-Translate API Endpoint (provides backend functionality for operations)
- This component can be built and tested with mock callbacks before API is available

### Optional (Recommended):
- **REQ-E05-006**: TranslationManagement types file (can define SupportedLanguage type locally if not available)

---

## Estimated Total Effort

**Total Time**: 13-15 hours

**Breakdown by Category**:
- Setup and types: 1.5 hours (Tasks 1-3)
- Subcomponents (ActionButton, LanguageDropdown): 2 hours (Tasks 4-5)
- Main component structure: 2 hours (Tasks 6-7)
- State layouts (idle, processing, completed, error): 2.5 hours (Tasks 8-12)
- Handlers and effects: 1.5 hours (Tasks 13-15)
- Exports and integration: 0.5 hours (Tasks 16-17)
- Internationalization: 2 hours (Tasks 18-23)
- Build verification: 0.25 hours (Task 24)
- Manual testing: 4.5 hours (Tasks 25-42)
- Documentation and review: 1.25 hours (Tasks 43-45)

---

## Notes

- All tasks are designed to be ≤1 story point
- Component follows BulkActionsBar pattern from ItemManager for consistency
- Purple color theme for translation-related actions
- Animation respects prefers-reduced-motion
- Fully keyboard accessible and screen reader friendly
- Native dropdown pattern (not Radix) for simplicity
- Auto-dismiss on success (3 seconds) for better UX
- Errors require manual dismiss to ensure user sees message
- Component can be tested with mock callbacks before API integration
- All subtask checkboxes are UNCHECKED (- [ ]) for implementation agent

---

**Document Status**: Ready for Implementation
**Next Steps**: Begin with Task 1 (Create directory structure)
