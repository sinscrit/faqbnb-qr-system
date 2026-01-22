# REQ-E05-019: Create LanguageSelectorDialog Component - Detailed Task Breakdown

**Generated**: 2026-01-22 23:33
**Last Modified**: 2026-01-22 23:33
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 4 - Bulk Operations & Management Page
**Task ID**: 4.2

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-019-create-languageselectordialog-component-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (Request #19, lines 2812-3060)
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

### Task 1: Create Component File with Basic Structure

**Context**: Create the LanguageSelectorDialog component file following the custom dialog pattern used in BulkMoveDialog and BulkTagDialog (NOT using Radix Dialog for consistency).

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` (new file)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **1.1** Create file `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
- [ ] **1.2** Add 'use client' directive at the top of file
- [ ] **1.3** Add file header JSDoc comment: "LanguageSelectorDialog Component - Modal dialog for selecting multiple languages for bulk translation"
- [ ] **1.4** Add @module tag: `@module TranslationManagement/BulkTranslationBar`
- [ ] **1.5** Add @lastModified tag: `@lastModified 2026-01-22 (REQ-E05-019 - Created component)`
- [ ] **1.6** Import React hooks: `import React, { useState, useRef, useEffect, useId } from 'react';`
- [ ] **1.7** Import icons from lucide-react: `import { X, Check, Globe } from 'lucide-react';`
- [ ] **1.8** Import useTranslations: `import { useTranslations } from 'next-intl';`
- [ ] **1.9** Import cn utility: `import { cn } from '@/lib/utils';`
- [ ] **1.10** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/lib/translation-service';`
- [ ] **1.11** Import useFocusTrap hook: `import { useFocusTrap } from '../../ItemManager/utils/a11yUtils';`

---

### Task 2: Define TypeScript Interfaces and Constants

**Context**: Define the component props interface and language constants array following the source of truth from translation-service.types.ts.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **2.1** Define LanguageSelectorDialogProps interface with comprehensive JSDoc
- [ ] **2.2** Add isOpen: boolean property with JSDoc: "Whether the dialog is open"
- [ ] **2.3** Add onClose: () => void property with JSDoc: "Callback when dialog is closed (cancel or outside click)"
- [ ] **2.4** Add onConfirm: (selectedLanguages: SupportedLanguage[]) => void with JSDoc: "Callback when languages are confirmed"
- [ ] **2.5** Add optional initialSelection?: SupportedLanguage[] with JSDoc: "Initially selected languages"
- [ ] **2.6** Add optional title?: string with JSDoc: "Dialog title (optional, defaults to i18n key)"
- [ ] **2.7** Add optional description?: string with JSDoc: "Dialog description (optional, defaults to i18n key)"
- [ ] **2.8** Add optional confirmText?: string with JSDoc: "Confirm button text (optional, defaults to i18n key)"
- [ ] **2.9** Add optional cancelText?: string with JSDoc: "Cancel button text (optional, defaults to i18n key)"
- [ ] **2.10** Add optional className?: string with JSDoc: "Additional CSS classes for the dialog"
- [ ] **2.11** Export LanguageSelectorDialogProps interface
- [ ] **2.12** Define TARGET_LANGUAGES constant: `const TARGET_LANGUAGES: SupportedLanguage[] = ['es', 'fr', 'de', 'nl', 'it'];`
- [ ] **2.13** Add JSDoc comment to TARGET_LANGUAGES: "Target languages for translation (excluding 'en' source language)"
- [ ] **2.14** Define LANGUAGE_FLAGS constant as Record<SupportedLanguage, string>
- [ ] **2.15** Add flag for es: '🇪🇸'
- [ ] **2.16** Add flag for fr: '🇫🇷'
- [ ] **2.17** Add flag for de: '🇩🇪'
- [ ] **2.18** Add flag for nl: '🇳🇱'
- [ ] **2.19** Add flag for it: '🇮🇹'
- [ ] **2.20** Add flag for en: '🇬🇧' (for completeness)
- [ ] **2.21** Add JSDoc comment to LANGUAGE_FLAGS: "Unicode emoji flags for each supported language"

---

### Task 3: Initialize Component State and Refs

**Context**: Set up the component function with state management, refs, and translations hooks.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **3.1** Create component function: `export function LanguageSelectorDialog({...props}: LanguageSelectorDialogProps)`
- [ ] **3.2** Destructure all props with defaults for optional props
- [ ] **3.3** Call useTranslations hook: `const t = useTranslations('translation.languageSelector');`
- [ ] **3.4** Call useTranslations for language names: `const tLang = useTranslations('translation.languages');`
- [ ] **3.5** Create dialogRef: `const dialogRef = useRef<HTMLDivElement>(null);`
- [ ] **3.6** Generate titleId: `const titleId = useId();`
- [ ] **3.7** Generate descriptionId: `const descriptionId = useId();`
- [ ] **3.8** Initialize selectedLanguages state: `const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>(initialSelection || []);`
- [ ] **3.9** Add useEffect to sync initialSelection when dialog opens: `useEffect(() => { if (isOpen && initialSelection) { setSelectedLanguages(initialSelection); } }, [isOpen, initialSelection]);`
- [ ] **3.10** Apply useFocusTrap hook: `useFocusTrap(dialogRef, isOpen);`

---

### Task 4: Implement Toggle and Selection Handlers

**Context**: Create handler functions for language selection, select all, and deselect all actions.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **4.1** Create handleToggleLanguage function with language parameter
- [ ] **4.2** Inside handleToggleLanguage, check if language is in selectedLanguages array
- [ ] **4.3** If included, filter it out: `prev.filter(lang => lang !== language)`
- [ ] **4.4** If not included, add it: `[...prev, language]`
- [ ] **4.5** Update selectedLanguages state with new array
- [ ] **4.6** Create handleSelectAll function
- [ ] **4.7** Inside handleSelectAll, set selectedLanguages to TARGET_LANGUAGES array
- [ ] **4.8** Create handleDeselectAll function
- [ ] **4.9** Inside handleDeselectAll, set selectedLanguages to empty array
- [ ] **4.10** Create handleConfirm function
- [ ] **4.11** Inside handleConfirm, check if selectedLanguages.length === 0
- [ ] **4.12** If empty, return early (do nothing)
- [ ] **4.13** If not empty, call onConfirm(selectedLanguages)
- [ ] **4.14** Create handleCancel function that calls onClose()

---

### Task 5: Implement Keyboard Event Handlers

**Context**: Add keyboard navigation support for Escape (cancel) and Enter (confirm) keys.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **5.1** Create handleKeyDown function with KeyboardEvent parameter
- [ ] **5.2** Check if event.key === 'Escape'
- [ ] **5.3** If Escape, call event.preventDefault() and handleCancel()
- [ ] **5.4** Check if event.key === 'Enter'
- [ ] **5.5** If Enter and selectedLanguages.length > 0, call event.preventDefault() and handleConfirm()
- [ ] **5.6** If Enter and selectedLanguages.length === 0, do nothing (confirm disabled)

---

### Task 6: Implement Dialog Backdrop and Container

**Context**: Create the fixed positioning backdrop and dialog container with proper ARIA attributes, following the custom dialog pattern from BulkMoveDialog.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **6.1** Add early return: `if (!isOpen) return null;`
- [ ] **6.2** Create backdrop div with className: `fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center`
- [ ] **6.3** Add onClick handler to backdrop that calls handleCancel
- [ ] **6.4** Add onKeyDown handler to backdrop: `onKeyDown={handleKeyDown}`
- [ ] **6.5** Add role="dialog" to backdrop
- [ ] **6.6** Add aria-modal="true"
- [ ] **6.7** Add aria-labelledby={titleId}
- [ ] **6.8** Add aria-describedby={descriptionId}
- [ ] **6.9** Create dialog container div inside backdrop
- [ ] **6.10** Add ref={dialogRef} to dialog container
- [ ] **6.11** Add onClick handler to dialog container: `(e) => e.stopPropagation()` (prevent backdrop click)
- [ ] **6.12** Add className to dialog: `bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6`
- [ ] **6.13** Add animation classes: `animate-in fade-in zoom-in-95 duration-200`
- [ ] **6.14** Add motion-reduce classes: `motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-100`
- [ ] **6.15** Add custom className prop if provided

---

### Task 7: Create Dialog Header with Title and Close Button

**Context**: Implement the dialog header section with icon, title, and close button.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **7.1** Create header container div with className: `flex items-center justify-between mb-4`
- [ ] **7.2** Create title section with div className: `flex items-center gap-2`
- [ ] **7.3** Render Globe icon with className: `h-5 w-5 text-blue-600`
- [ ] **7.4** Add aria-hidden="true" to Globe icon
- [ ] **7.5** Create h2 element with id={titleId}
- [ ] **7.6** Add className to h2: `text-lg font-semibold text-gray-900`
- [ ] **7.7** Render title text: `{title || t('title')}`
- [ ] **7.8** Create close button with type="button"
- [ ] **7.9** Add onClick handler: handleCancel
- [ ] **7.10** Add aria-label: t('common.actions.close')
- [ ] **7.11** Add className: `text-gray-400 hover:text-gray-600 transition-colors`
- [ ] **7.12** Render X icon inside close button with className: `h-5 w-5`

---

### Task 8: Add Dialog Description

**Context**: Add descriptive text explaining the purpose of the dialog.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **8.1** Create description paragraph with id={descriptionId}
- [ ] **8.2** Add className: `text-sm text-gray-600 mb-4`
- [ ] **8.3** Render description text: `{description || t('description')}`

---

### Task 9: Implement Select All / Deselect All Buttons

**Context**: Add the quick action buttons for selecting/deselecting all languages.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **9.1** Create container div with className: `flex gap-2 mb-4`
- [ ] **9.2** Create Select All button with type="button"
- [ ] **9.3** Add onClick handler: handleSelectAll
- [ ] **9.4** Add className: `text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded`
- [ ] **9.5** Render button text: `t('selectAll')`
- [ ] **9.6** Add separator span with className: `text-gray-400` and text: `|`
- [ ] **9.7** Create Deselect All button with type="button"
- [ ] **9.8** Add onClick handler: handleDeselectAll
- [ ] **9.9** Add same className as Select All button
- [ ] **9.10** Render button text: `t('deselectAll')`

---

### Task 10: Create Language Checkbox List

**Context**: Render the list of language checkboxes with flags and labels.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 35 minutes

**Subtasks**:
- [ ] **10.1** Create container div with className: `space-y-2 mb-6 max-h-96 overflow-y-auto`
- [ ] **10.2** Map over TARGET_LANGUAGES array
- [ ] **10.3** For each language, create row div with key={language}
- [ ] **10.4** Add className to row: `flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer`
- [ ] **10.5** Create native checkbox input with type="checkbox"
- [ ] **10.6** Add id attribute: `lang-${language}`
- [ ] **10.7** Add checked attribute: `selectedLanguages.includes(language)`
- [ ] **10.8** Add onChange handler: `() => handleToggleLanguage(language)`
- [ ] **10.9** Add className to checkbox: `w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-2 cursor-pointer`
- [ ] **10.10** Add aria-label: `tLang(language)`
- [ ] **10.11** Create label element with htmlFor={`lang-${language}`}
- [ ] **10.12** Add className to label: `flex items-center gap-2 flex-1 cursor-pointer select-none`
- [ ] **10.13** Create span for flag emoji with className: `text-2xl`
- [ ] **10.14** Add aria-hidden="true" to flag span
- [ ] **10.15** Render flag: `LANGUAGE_FLAGS[language]`
- [ ] **10.16** Create span for language name with className: `text-sm font-medium text-gray-700`
- [ ] **10.17** Render language name: `tLang(language)`

---

### Task 11: Add ARIA Live Region for Selection Count

**Context**: Create a screen reader announcement region that updates when selection changes.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **11.1** Create div for live region with role="status"
- [ ] **11.2** Add aria-live="polite"
- [ ] **11.3** Add aria-atomic="true"
- [ ] **11.4** Add className: `sr-only` (screen reader only)
- [ ] **11.5** Render selection count text: `t('selectedCount', { count: selectedLanguages.length })`
- [ ] **11.6** Position live region after the checkbox list

---

### Task 12: Create Footer with Action Buttons

**Context**: Implement the dialog footer with Cancel and Confirm buttons.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **12.1** Create footer div with className: `flex gap-3 justify-end pt-4 border-t border-gray-200`
- [ ] **12.2** Create Cancel button with type="button"
- [ ] **12.3** Add onClick handler: handleCancel
- [ ] **12.4** Add className to Cancel: `px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors`
- [ ] **12.5** Render Cancel text: `{cancelText || t('common.actions.cancel')}`
- [ ] **12.6** Create Confirm button with type="button"
- [ ] **12.7** Add onClick handler: handleConfirm
- [ ] **12.8** Add disabled attribute: `selectedLanguages.length === 0`
- [ ] **12.9** Add className to Confirm: `px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`
- [ ] **12.10** Calculate confirm button text: If selectedLanguages.length > 0, show count
- [ ] **12.11** Create button text variable: `const confirmButtonText = selectedLanguages.length > 0 ? t('confirmWithCount', { count: selectedLanguages.length }) : (confirmText || t('common.actions.confirm'));`
- [ ] **12.12** Render Confirm button text: `{confirmButtonText}`

---

### Task 13: Add English Translation Keys

**Context**: Add all required translation keys to the English message file.

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **13.1** Read `/messages/en.json` file
- [ ] **13.2** Locate or create `translation` namespace object
- [ ] **13.3** Create `languageSelector` nested object inside translation
- [ ] **13.4** Add key `title`: "Select Languages"
- [ ] **13.5** Add key `description`: "Choose target languages for translation"
- [ ] **13.6** Add key `selectAll`: "Select All"
- [ ] **13.7** Add key `deselectAll`: "Deselect All"
- [ ] **13.8** Add key `confirmWithCount`: "Confirm ({count} selected)"
- [ ] **13.9** Add key `selectedCount`: "{count, plural, one {# language selected} other {# languages selected}}"
- [ ] **13.10** Add key `noLanguagesSelected`: "No languages selected"
- [ ] **13.11** Locate or create `languages` nested object inside translation
- [ ] **13.12** Add key `en`: "English"
- [ ] **13.13** Add key `es`: "Spanish"
- [ ] **13.14** Add key `fr`: "French"
- [ ] **13.15** Add key `de`: "German"
- [ ] **13.16** Add key `nl`: "Dutch"
- [ ] **13.17** Add key `it`: "Italian"
- [ ] **13.18** Verify JSON syntax is valid (proper commas, no trailing commas)
- [ ] **13.19** Run `npm run lint` to check JSON formatting

---

### Task 14: Update Barrel Export File

**Context**: Add LanguageSelectorDialog to the BulkTranslationBar index exports.

**Files to modify**:
- `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **14.1** Read `/src/components/TranslationManagement/BulkTranslationBar/index.ts` file
- [ ] **14.2** Add named export: `export { LanguageSelectorDialog } from './LanguageSelectorDialog';`
- [ ] **14.3** Add type export: `export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog';`
- [ ] **14.4** Maintain alphabetical ordering if applicable
- [ ] **14.5** Verify exports work with test import

---

### Task 15: Run Type Check and Build Verification

**Context**: Verify all TypeScript types are correct and production build succeeds.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **15.1** Run command: `npm run typecheck`
- [ ] **15.2** Review any TypeScript errors
- [ ] **15.3** Fix import paths if any errors
- [ ] **15.4** Fix type mismatches if any
- [ ] **15.5** Re-run typecheck until clean
- [ ] **15.6** Run command: `npm run build`
- [ ] **15.7** Verify build succeeds without errors
- [ ] **15.8** Check build output for warnings
- [ ] **15.9** Fix any build issues found

---

### Task 16: Test Dialog Opens and Closes Correctly

**Context**: Manual test to verify basic dialog visibility and state management.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **16.1** Start development server: `npm run dev`
- [ ] **16.2** Create test page that renders LanguageSelectorDialog
- [ ] **16.3** Set isOpen to false
- [ ] **16.4** Verify dialog does not render (returns null)
- [ ] **16.5** Set isOpen to true
- [ ] **16.6** Verify dialog appears with fade-in animation
- [ ] **16.7** Click backdrop
- [ ] **16.8** Verify onClose callback is called
- [ ] **16.9** Click close button (X)
- [ ] **16.10** Verify onClose callback is called

---

### Task 17: Test Language Checkbox Interactions

**Context**: Verify individual language selection and toggling works correctly.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **17.1** Open dialog
- [ ] **17.2** Click first language checkbox (Spanish)
- [ ] **17.3** Verify checkbox becomes checked
- [ ] **17.4** Verify selectedLanguages state includes 'es'
- [ ] **17.5** Click same checkbox again
- [ ] **17.6** Verify checkbox becomes unchecked
- [ ] **17.7** Verify 'es' is removed from selectedLanguages
- [ ] **17.8** Click multiple checkboxes (French and German)
- [ ] **17.9** Verify both become checked
- [ ] **17.10** Verify selectedLanguages includes both 'fr' and 'de'
- [ ] **17.11** Verify label click also toggles checkbox (entire row is clickable)

---

### Task 18: Test Select All and Deselect All Functionality

**Context**: Verify quick selection buttons work correctly.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **18.1** Open dialog with no initial selection
- [ ] **18.2** Click "Select All" button
- [ ] **18.3** Verify all 5 language checkboxes become checked
- [ ] **18.4** Verify selectedLanguages contains all TARGET_LANGUAGES
- [ ] **18.5** Click "Deselect All" button
- [ ] **18.6** Verify all checkboxes become unchecked
- [ ] **18.7** Verify selectedLanguages is empty array
- [ ] **18.8** Select 2 languages manually
- [ ] **18.9** Click "Select All"
- [ ] **18.10** Verify all 5 are now selected (including the 2 already selected)

---

### Task 19: Test Confirm Button State and Behavior

**Context**: Verify confirm button is disabled when no languages selected and displays count correctly.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **19.1** Open dialog with no selection
- [ ] **19.2** Verify Confirm button is disabled
- [ ] **19.3** Verify button text is "Confirm" (no count)
- [ ] **19.4** Select 1 language
- [ ] **19.5** Verify Confirm button becomes enabled
- [ ] **19.6** Verify button text changes to "Confirm (1 selected)"
- [ ] **19.7** Select 2 more languages (total 3)
- [ ] **19.8** Verify button text shows "Confirm (3 selected)"
- [ ] **19.9** Click Confirm button
- [ ] **19.10** Verify onConfirm is called with array of 3 language codes
- [ ] **19.11** Verify array contains correct language codes

---

### Task 20: Test Initial Selection Prop

**Context**: Verify dialog initializes with pre-selected languages when initialSelection prop is provided.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **20.1** Close dialog if open
- [ ] **20.2** Set initialSelection prop to ['es', 'fr']
- [ ] **20.3** Open dialog
- [ ] **20.4** Verify Spanish and French checkboxes are checked
- [ ] **20.5** Verify other languages are unchecked
- [ ] **20.6** Verify Confirm button shows "Confirm (2 selected)"
- [ ] **20.7** Close dialog
- [ ] **20.8** Change initialSelection to ['de', 'nl', 'it']
- [ ] **20.9** Open dialog again
- [ ] **20.10** Verify only German, Dutch, and Italian are checked
- [ ] **20.11** Verify state updates when dialog reopens with different initialSelection

---

### Task 21: Test Keyboard Navigation with Tab Key

**Context**: Verify keyboard navigation works correctly through all interactive elements.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **21.1** Open dialog
- [ ] **21.2** Focus should be trapped within dialog (verify useFocusTrap is working)
- [ ] **21.3** Press Tab key
- [ ] **21.4** Verify focus moves to close button (X)
- [ ] **21.5** Press Tab again
- [ ] **21.6** Verify focus moves to "Select All" button
- [ ] **21.7** Continue pressing Tab
- [ ] **21.8** Verify focus moves to "Deselect All" button
- [ ] **21.9** Continue Tab through all checkboxes
- [ ] **21.10** Verify focus moves through each language checkbox in order
- [ ] **21.11** After last checkbox, verify focus moves to Cancel button
- [ ] **21.12** Press Tab again
- [ ] **21.13** Verify focus moves to Confirm button
- [ ] **21.14** Press Tab again
- [ ] **21.15** Verify focus cycles back to first element (close button)

---

### Task 22: Test Escape Key Closes Dialog

**Context**: Verify Escape key triggers cancel action.

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **22.1** Open dialog
- [ ] **22.2** Select some languages
- [ ] **22.3** Press Escape key
- [ ] **22.4** Verify onClose callback is called
- [ ] **22.5** Verify dialog closes
- [ ] **22.6** Verify selection is not saved (onConfirm not called)

---

### Task 23: Test Enter Key Confirms Selection

**Context**: Verify Enter key triggers confirm action when enabled.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **23.1** Open dialog with no selection
- [ ] **23.2** Press Enter key
- [ ] **23.3** Verify nothing happens (confirm disabled when no selection)
- [ ] **23.4** Select 2 languages
- [ ] **23.5** Press Enter key
- [ ] **23.6** Verify onConfirm is called with selected languages
- [ ] **23.7** Verify dialog closes
- [ ] **23.8** Test from different focused elements (checkbox, button)
- [ ] **23.9** Verify Enter works from any focused element when selection exists

---

### Task 24: Test Screen Reader Announcements

**Context**: Verify ARIA live region announces selection count changes to screen readers.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **24.1** Enable screen reader (VoiceOver on macOS or NVDA on Windows)
- [ ] **24.2** Open dialog
- [ ] **24.3** Navigate to dialog with screen reader
- [ ] **24.4** Verify dialog role is announced
- [ ] **24.5** Verify title is announced (aria-labelledby)
- [ ] **24.6** Verify description is announced (aria-describedby)
- [ ] **24.7** Select a language checkbox
- [ ] **24.8** Verify live region announces "1 language selected"
- [ ] **24.9** Select another language
- [ ] **24.10** Verify live region announces "2 languages selected"
- [ ] **24.11** Deselect one language
- [ ] **24.12** Verify live region announces "1 language selected"
- [ ] **24.13** Navigate to checkboxes
- [ ] **24.14** Verify each checkbox aria-label announces language name
- [ ] **24.15** Verify flag emojis are hidden from screen reader (aria-hidden="true")

---

### Task 25: Test Responsive Layout on Mobile

**Context**: Verify dialog displays correctly on small screens.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **25.1** Resize browser to mobile width (375px)
- [ ] **25.2** Open dialog
- [ ] **25.3** Verify dialog has proper margins (mx-4)
- [ ] **25.4** Verify dialog doesn't overflow screen width
- [ ] **25.5** Verify all content is readable
- [ ] **25.6** Verify checkboxes are at least 44x44px touch targets
- [ ] **25.7** Verify entire row is tappable (not just checkbox)
- [ ] **25.8** Test scrolling if content exceeds viewport
- [ ] **25.9** Verify buttons don't wrap awkwardly
- [ ] **25.10** Test on actual mobile device if available

---

### Task 26: Test Motion-Reduced Animation

**Context**: Verify animations respect prefers-reduced-motion user preference.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **26.1** Enable reduced motion in OS settings (macOS: System Preferences > Accessibility > Display > Reduce Motion)
- [ ] **26.2** Refresh browser
- [ ] **26.3** Open dialog
- [ ] **26.4** Verify dialog appears with fade-in only (no zoom animation)
- [ ] **26.5** Verify animation duration is shorter (~100ms)
- [ ] **26.6** Close and reopen dialog multiple times
- [ ] **26.7** Verify consistent reduced-motion behavior
- [ ] **26.8** Disable reduced motion
- [ ] **26.9** Verify animations return to normal (fade + zoom)

---

### Task 27: Test Flag Emoji Display

**Context**: Verify flag emojis display correctly across browsers.

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **27.1** Open dialog in Chrome
- [ ] **27.2** Verify all 5 flag emojis render correctly
- [ ] **27.3** Verify flags are aligned with language names
- [ ] **27.4** Test in Firefox
- [ ] **27.5** Verify flag rendering
- [ ] **27.6** Test in Safari
- [ ] **27.7** Verify flag rendering
- [ ] **27.8** Verify flag size is appropriate (text-2xl)
- [ ] **27.9** Verify flags are visually distinct

---

### Task 28: Test with Custom Props (title, description, etc.)

**Context**: Verify optional props override default i18n values.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **28.1** Pass custom title prop: "Choose Your Languages"
- [ ] **28.2** Open dialog
- [ ] **28.3** Verify custom title is displayed
- [ ] **28.4** Pass custom description prop: "Select languages for batch translation"
- [ ] **28.5** Verify custom description is displayed
- [ ] **28.6** Pass custom confirmText prop: "Apply"
- [ ] **28.7** Select languages
- [ ] **28.8** Verify button shows "Apply" instead of "Confirm (X selected)"
- [ ] **28.9** Pass custom cancelText prop: "Dismiss"
- [ ] **28.10** Verify Cancel button shows "Dismiss"

---

### Task 29: Test Integration with BulkTranslationBar

**Context**: Verify dialog integrates correctly when called from parent component.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **29.1** Import LanguageSelectorDialog in BulkTranslationBar component (if not already done)
- [ ] **29.2** Add state to track dialog open/close
- [ ] **29.3** Add button or trigger to open dialog
- [ ] **29.4** Click trigger
- [ ] **29.5** Verify dialog opens
- [ ] **29.6** Select languages and confirm
- [ ] **29.7** Verify onConfirm callback receives selected languages
- [ ] **29.8** Verify parent component can use returned language codes
- [ ] **29.9** Test cancel action
- [ ] **29.10** Verify dialog closes without calling onConfirm

---

### Task 30: Verify No Console Errors or Warnings

**Context**: Ensure component runs without generating console errors or warnings.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **30.1** Open browser DevTools console
- [ ] **30.2** Clear console
- [ ] **30.3** Open dialog
- [ ] **30.4** Check for errors or warnings
- [ ] **30.5** Interact with all elements (checkboxes, buttons)
- [ ] **30.6** Check console after each interaction
- [ ] **30.7** Close dialog
- [ ] **30.8** Check for cleanup errors
- [ ] **30.9** Reopen dialog
- [ ] **30.10** Verify no memory leak warnings
- [ ] **30.11** Filter console for React warnings (keys, hooks, etc.)
- [ ] **30.12** Fix any issues found

---

### Task 31: Test Focus Trap Behavior

**Context**: Verify focus trap prevents Tab from escaping dialog.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **31.1** Open dialog
- [ ] **31.2** Tab through all interactive elements
- [ ] **31.3** After last element (Confirm button), press Tab again
- [ ] **31.4** Verify focus cycles back to first element (close button)
- [ ] **31.5** Try Shift+Tab from first element
- [ ] **31.6** Verify focus moves to last element (Confirm button)
- [ ] **31.7** Verify focus cannot escape to elements behind dialog
- [ ] **31.8** Close dialog
- [ ] **31.9** Verify focus returns to trigger element (button that opened dialog)

---

### Task 32: Test Checkbox State Persistence

**Context**: Verify selection state persists when dialog is closed and reopened without confirm.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **32.1** Open dialog
- [ ] **32.2** Select 3 languages
- [ ] **32.3** Click Cancel (or Escape)
- [ ] **32.4** Verify onConfirm is NOT called
- [ ] **32.5** Reopen dialog with same initialSelection
- [ ] **32.6** Verify previous selection is restored
- [ ] **32.7** Modify selection (add 1, remove 1)
- [ ] **32.8** Click Confirm
- [ ] **32.9** Verify onConfirm is called with new selection
- [ ] **32.10** Reopen dialog
- [ ] **32.11** Verify initialSelection reflects confirmed selection

---

### Task 33: Create Component Usage Documentation

**Context**: Document how to use the LanguageSelectorDialog component with example code.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **33.1** Create or update component documentation
- [ ] **33.2** Document all required props
- [ ] **33.3** Document all optional props
- [ ] **33.4** Provide basic usage example
- [ ] **33.5** Show example with initialSelection
- [ ] **33.6** Show example with custom text props
- [ ] **33.7** Document integration with BulkTranslationBar
- [ ] **33.8** List supported languages (es, fr, de, nl, it)
- [ ] **33.9** Note that 'en' is excluded (source language)
- [ ] **33.10** Document keyboard shortcuts (Enter, Escape, Tab)
- [ ] **33.11** Document accessibility features
- [ ] **33.12** Include example of handling onConfirm callback

---

### Task 34: Final Code Review and Cleanup

**Context**: Review all code for quality, consistency, and adherence to project patterns.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **34.1** Review LanguageSelectorDialog.tsx for code quality
- [ ] **34.2** Verify all JSDoc comments are present and accurate
- [ ] **34.3** Check for unused imports or variables
- [ ] **34.4** Verify consistent naming conventions (camelCase for functions/variables)
- [ ] **34.5** Verify all props have proper TypeScript types
- [ ] **34.6** Review handler functions for proper error handling
- [ ] **34.7** Check ARIA attributes are correct and complete
- [ ] **34.8** Verify animation classes include motion-reduce support
- [ ] **34.9** Verify all translation keys are used correctly
- [ ] **34.10** Check that component follows BulkMoveDialog/BulkTagDialog patterns
- [ ] **34.11** Verify useFocusTrap is applied correctly
- [ ] **34.12** Run `npm run lint` and fix any issues
- [ ] **34.13** Run `npm run typecheck` and verify no errors
- [ ] **34.14** Run `npm run build` and verify success

---

### Task 35: Create Test Summary Report

**Context**: Document all testing performed and results for project records.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **35.1** Create test summary document
- [ ] **35.2** List all manual test scenarios performed (Tasks 16-32)
- [ ] **35.3** Document pass/fail status for each test
- [ ] **35.4** Include screenshots of dialog in different states
- [ ] **35.5** Document any issues found during testing
- [ ] **35.6** Document resolutions for each issue
- [ ] **35.7** List browsers tested (Chrome, Firefox, Safari)
- [ ] **35.8** Note screen sizes tested (mobile, tablet, desktop)
- [ ] **35.9** Document accessibility testing performed
- [ ] **35.10** Note keyboard navigation tests
- [ ] **35.11** Verify all acceptance criteria are met
- [ ] **35.12** Sign off on component completion

---

## Dependencies

### Must Complete First:
- **REQ-E05-018**: BulkTranslationBar component (this dialog integrates with it)
- Component can be built independently and integrated later

### Pattern References:
- **BulkMoveDialog**: `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- **BulkTagDialog**: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- **useFocusTrap**: `/src/components/ItemManager/utils/a11yUtils.tsx`

---

## Estimated Total Effort

**Total Time**: 8-10 hours

**Breakdown by Category**:
- Setup and structure: 1.25 hours (Tasks 1-3)
- Handlers and logic: 1.25 hours (Tasks 4-5)
- Dialog UI structure: 1.5 hours (Tasks 6-10)
- ARIA and footer: 1 hour (Tasks 11-12)
- Translations and exports: 0.5 hours (Tasks 13-14)
- Build verification: 0.25 hours (Task 15)
- Manual testing: 4 hours (Tasks 16-32)
- Documentation and review: 1.25 hours (Tasks 33-35)

---

## Notes

- All tasks are designed to be ≤1 story point
- Component uses custom dialog pattern (NOT Radix Dialog) for consistency with existing code
- Native HTML checkboxes (NOT Radix Checkbox) to avoid new dependencies
- Language source of truth: translation-service.types.ts defines 5 target languages (es, fr, de, nl, it)
- Flag emojis are Unicode characters (no image assets needed)
- Focus trap using existing useFocusTrap hook
- Animation respects prefers-reduced-motion
- Fully keyboard accessible and screen reader friendly
- All subtask checkboxes are UNCHECKED (- [ ]) for implementation agent

---

**Document Status**: Ready for Implementation
**Next Steps**: Begin with Task 1 (Create component file)
