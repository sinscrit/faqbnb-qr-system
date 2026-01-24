# Create LanguagePreferenceSection Component - Detailed Implementation Tasks

**Generated:** 2026-01-23 11:30
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #25)
- Overview: docs/REQ-E05-025-create-languagepreferencesection-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Component Types File

**Context:** TypeScript interfaces define the component's props, state, and data structures. Creating the types file first ensures type safety before implementation. The `LanguageOption` interface provides a structured format for language data with code (ISO 639-1), display name, and optional native name. The props interface defines how parent components will interact with LanguagePreferenceSection, including the onSave callback for persistence.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts` (NEW)

**Estimated effort:** 1 story point

- [x] **1.1** Create directory `/src/components/TranslationManagement/LanguagePreference/` if it doesn't exist
- [x] **1.2** Create file `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts`
- [x] **1.3** Add JSDoc file header with REQ-E05-025 reference, Epic 5 Phase 6 Task 6.1, and creation date
- [x] **1.4** Define `LanguageOption` interface with properties: `code: string`, `name: string`, `nativeName?: string`
- [x] **1.5** Add JSDoc comments to each LanguageOption property explaining their purpose (e.g., "ISO language code", "Display name in English", "Native language name")
- [x] **1.6** Define `LanguagePreferenceSectionProps` interface with properties: `currentLanguage: string | null`, `availableLanguages: LanguageOption[]`, `onSave: (languageCode: string) => Promise<void>`, `disabled?: boolean`, `className?: string`
- [x] **1.7** Add JSDoc comments to each prop explaining when/how it's used
- [x] **1.8** Define `LanguagePreferenceSectionState` interface (for documentation purposes) with properties: `selectedLanguage: string`, `isSaving: boolean`, `error: string | null`, `successMessage: string | null`
- [x] **1.9** Export all interfaces using named exports
- [x] **1.10** Run type check: `npx tsc --noEmit` to verify no syntax errors

---

## 2. Create Component Implementation File

**Context:** The main component implements language preference selection with dropdown UI, save button with loading states, and success/error feedback. It follows existing patterns from ReadOnlyContextSection, uses Tailwind CSS for styling, and Lucide React icons for consistency. The component is "controlled" - it manages its own internal state but syncs with the parent via the currentLanguage prop and onSave callback.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` (NEW)

**Estimated effort:** 1 story point

- [x] **2.1** Create file `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
- [x] **2.2** Add 'use client' directive at the top (Next.js client component)
- [x] **2.3** Add JSDoc file header with component description, REQ reference, and creation date
- [x] **2.4** Import React hooks: `useState`, `useCallback`, `useEffect` from 'react'
- [x] **2.5** Import Lucide icons: `Globe`, `Check`, `AlertCircle`, `Loader2` from 'lucide-react'
- [x] **2.6** Import `cn` utility from '@/lib/utils' for className merging
- [x] **2.7** Import `LanguagePreferenceSectionProps` type from './LanguagePreferenceSection.types'
- [x] **2.8** Define function component `LanguagePreferenceSection` with props destructuring: `{ currentLanguage, availableLanguages, onSave, disabled = false, className }`
- [x] **2.9** Add state: `selectedLanguage` initialized to `currentLanguage || availableLanguages[0]?.code || ''`
- [x] **2.10** Add state: `isSaving` initialized to `false`
- [x] **2.11** Add state: `error` initialized to `null`
- [x] **2.12** Add state: `successMessage` initialized to `null`
- [x] **2.13** Add `useEffect` to sync `selectedLanguage` when `currentLanguage` prop changes (dependency: [currentLanguage])
- [x] **2.14** Add `useEffect` to auto-clear `successMessage` after 3 seconds using `setTimeout` (dependency: [successMessage])
- [x] **2.15** Define `handleSave` function using `useCallback` that: checks if saving/disabled, sets isSaving to true, clears error/success, calls onSave, sets success message, catches errors, and sets isSaving to false in finally block
- [x] **2.16** Calculate `hasChanges` boolean: `selectedLanguage !== currentLanguage`
- [x] **2.17** Run type check: `npx tsc --noEmit`

---

## 3. Implement Component JSX Structure

**Context:** The component's JSX follows a vertical layout pattern with header, help text, form controls, and status messages. The save button is disabled when no changes have been made (UX best practice) and during save operations. Accessibility features include ARIA labels and proper semantic roles.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` (continuing from Task 2)

**Estimated effort:** 1 story point

- [x] **3.1** Return a `div` container with className: `cn('space-y-4', className)`
- [x] **3.2** Add section header div with `flex items-center gap-2` containing Globe icon and h3 "Language Preference"
- [x] **3.3** Add help text paragraph with `text-sm text-gray-600` explaining the setting's purpose (reference overview document for exact wording)
- [x] **3.4** Add form controls div with `flex items-center gap-3`
- [x] **3.5** Add `<select>` element with value bound to `selectedLanguage`, onChange handler updating state, disabled when `disabled || isSaving`, and Tailwind classes for styling
- [x] **3.6** Add `aria-label="Select language preference"` to select element
- [x] **3.7** Map over `availableLanguages` to create `<option>` elements, displaying name and conditionally showing nativeName in parentheses if different from name
- [x] **3.8** Add save button with onClick={handleSave}, disabled when `disabled || isSaving || !hasChanges`, conditional Tailwind classes (red background when enabled, gray when disabled)
- [x] **3.9** Add `aria-label` to button with conditional text based on `isSaving` state
- [x] **3.10** Inside button, conditionally render: Loader2 icon with "Saving..." text when `isSaving`, otherwise just "Save"
- [x] **3.11** Add error message div (conditionally rendered when `error` exists) with AlertCircle icon, `role="alert"`, and red text
- [x] **3.12** Add success message div (conditionally rendered when `successMessage` exists) with Check icon, `role="status"`, and green text
- [x] **3.13** Export component as default: `export default LanguagePreferenceSection;`
- [x] **3.14** Export component as named export: `export { LanguagePreferenceSection };`
- [x] **3.15** Run type check: `npx tsc --noEmit`

---

## 4. Create Component Index File

**Context:** The index file provides a clean import interface for other parts of the codebase to use the component and its types without needing to know the internal file structure.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/index.ts` (NEW)

**Estimated effort:** 1 story point

- [x] **4.1** Create file `/src/components/TranslationManagement/LanguagePreference/index.ts`
- [x] **4.2** Add JSDoc file header with module description and REQ reference
- [x] **4.3** Export the component: `export { LanguagePreferenceSection } from './LanguagePreferenceSection';`
- [x] **4.4** Export types: `export type { LanguagePreferenceSectionProps, LanguageOption, LanguagePreferenceSectionState } from './LanguagePreferenceSection.types';`
- [x] **4.5** Run type check: `npx tsc --noEmit`

---

## 5. Create Language Options Helper

**Context:** This utility converts the existing localeMetadata from `/src/lib/i18n/config.ts` into the LanguageOption format expected by the component. This ensures a single source of truth for supported languages and their display names.

**Files to modify:**
- `/src/lib/i18n/language-options.ts` (NEW)

**Estimated effort:** 1 story point

- [x] **5.1** Create file `/src/lib/i18n/language-options.ts`
- [x] **5.2** Add JSDoc file header with description and REQ reference
- [x] **5.3** Import `localeMetadata` and `SupportedLocale` type from './config'
- [x] **5.4** Import `LanguageOption` type from '@/components/TranslationManagement/LanguagePreference'
- [x] **5.5** Define function `getLanguageOptions(): LanguageOption[]` with JSDoc comment explaining it returns all supported languages
- [x] **5.6** Implement function body: map over `Object.values(localeMetadata)` and transform each entry to `{ code: meta.code, name: meta.name, nativeName: meta.nativeName }`
- [x] **5.7** Define function `getLanguageOption(code: string): LanguageOption | null` with JSDoc comment
- [x] **5.8** Implement function body: look up `localeMetadata[code as SupportedLocale]`, return null if not found, otherwise return transformed object
- [x] **5.9** Export both functions
- [x] **5.10** Run type check: `npx tsc --noEmit`

---

## 6. Update i18n Module Index

**Context:** The i18n module index file needs to export the new language-options helper so it can be imported alongside other i18n utilities.

**Files to modify:**
- `/src/lib/i18n/index.ts`

**Estimated effort:** 1 story point

- [x] **6.1** Open file `/src/lib/i18n/index.ts`
- [x] **6.2** Locate the existing export statements
- [x] **6.3** Add new export line: `export * from './language-options';` (place after existing exports)
- [x] **6.4** Verify the file doesn't have any conflicting exports
- [x] **6.5** Run type check: `npx tsc --noEmit`

---

## 7. Write Unit Tests - Component Rendering

**Context:** Test that the component renders correctly with different prop combinations, including initial state, edge cases like empty language arrays, and null currentLanguage values.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **7.1** Create test file at `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx`
- [ ] **7.2** Import necessary testing utilities: `describe`, `it`, `expect`, `vi` from 'vitest', and `render`, `screen`, `fireEvent`, `waitFor` from '@testing-library/react'
- [ ] **7.3** Import component: `LanguagePreferenceSection` from '../LanguagePreferenceSection'
- [ ] **7.4** Import types: `LanguageOption` from '../LanguagePreferenceSection.types'
- [ ] **7.5** Create mock language options constant with sample languages (en, fr, de)
- [ ] **7.6** Create mock onSave function using `vi.fn()` that returns a resolved Promise
- [ ] **7.7** Write test: "renders with initial language selected from currentLanguage prop" - render component with currentLanguage='fr', assert dropdown value is 'fr'
- [ ] **7.8** Write test: "renders with first language if currentLanguage is null" - render with currentLanguage=null, assert dropdown value is first language code
- [ ] **7.9** Write test: "displays all available languages in dropdown" - render, assert each language option exists in dropdown
- [ ] **7.10** Write test: "shows language name and native name correctly" - render, assert options display format "Name (NativeName)"
- [ ] **7.11** Write test: "handles empty availableLanguages array gracefully" - render with empty array, assert no crash, dropdown empty
- [ ] **7.12** Run tests: `npm test` and verify all rendering tests pass

---

## 8. Write Unit Tests - Save Functionality

**Context:** Test the save button behavior, including enable/disable logic, loading states, success/error handling, and the onSave callback invocation.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` (continuing from Task 7)

**Estimated effort:** 1 story point

- [ ] **8.1** Write test: "save button disabled when no changes made" - render, assert Save button is disabled
- [ ] **8.2** Write test: "save button enabled when language selection changes" - render, change dropdown value, assert Save button becomes enabled
- [ ] **8.3** Write test: "save button disabled during save operation" - render, change dropdown, click Save, assert button disabled during async operation
- [ ] **8.4** Write test: "shows loading spinner during save operation" - render, change dropdown, click Save, assert "Saving..." text and Loader2 icon appear
- [ ] **8.5** Write test: "calls onSave with selected language code when Save clicked" - render, change dropdown to 'de', click Save, assert onSave called with 'de'
- [ ] **8.6** Write test: "displays success message after successful save" - render, change dropdown, click Save, wait for completion, assert success message appears
- [ ] **8.7** Write test: "clears success message after 3 seconds" - use fake timers, render, save successfully, advance timers by 3000ms, assert message disappears
- [ ] **8.8** Write test: "displays error message when save fails" - mock onSave to reject, render, change dropdown, click Save, assert error message appears
- [ ] **8.9** Write test: "error message persists until user makes another change" - render, trigger error, assert error visible, change dropdown, assert error cleared
- [ ] **8.10** Write test: "save button disabled when disabled prop is true" - render with disabled=true, assert Save button disabled regardless of changes
- [ ] **8.11** Run tests: `npm test` and verify all save functionality tests pass

---

## 9. Write Unit Tests - Accessibility

**Context:** Verify the component meets accessibility standards with proper ARIA labels, keyboard navigation, and semantic HTML.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` (continuing from Task 8)

**Estimated effort:** 1 story point

- [ ] **9.1** Write test: "dropdown has accessible label" - render, query by aria-label="Select language preference", assert element exists
- [ ] **9.2** Write test: "save button has accessible label" - render, assert button has aria-label with appropriate text
- [ ] **9.3** Write test: "error message has role=alert" - render, trigger error, assert error div has role="alert"
- [ ] **9.4** Write test: "success message has role=status" - render, save successfully, assert success div has role="status"
- [ ] **9.5** Write test: "component is keyboard navigable" - render, simulate Tab key presses, assert focus moves through dropdown and button
- [ ] **9.6** Run tests: `npm test` and verify all accessibility tests pass

---

## 10. Write Integration Test with Helper Function

**Context:** Test the integration between the component and the language options helper function to ensure they work together correctly.

**Files to modify:**
- `/src/lib/i18n/__tests__/language-options.test.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **10.1** Create test file at `/src/lib/i18n/__tests__/language-options.test.ts`
- [ ] **10.2** Import testing utilities: `describe`, `it`, `expect` from 'vitest'
- [ ] **10.3** Import functions: `getLanguageOptions`, `getLanguageOption` from '../language-options'
- [ ] **10.4** Write test: "getLanguageOptions returns array of all supported languages" - call function, assert result is array, assert length matches localeMetadata entries
- [ ] **10.5** Write test: "each language option has required properties" - call function, assert each item has code, name, and nativeName properties
- [ ] **10.6** Write test: "getLanguageOption returns correct language for valid code" - call with 'en', assert returns English language option
- [ ] **10.7** Write test: "getLanguageOption returns null for invalid code" - call with 'invalid', assert returns null
- [ ] **10.8** Write test: "language options match localeMetadata structure" - compare returned options with original localeMetadata entries
- [ ] **10.9** Run tests: `npm test` and verify all helper tests pass

---

## 11. Create Component Documentation

**Context:** Documentation helps other developers understand how to use the component, including usage examples, prop descriptions, and feature highlights.

**Files to modify:**
- `/src/components/TranslationManagement/LanguagePreference/README.md` (NEW)

**Estimated effort:** 1 story point

- [ ] **11.1** Create file `/src/components/TranslationManagement/LanguagePreference/README.md`
- [ ] **11.2** Add title: "# LanguagePreferenceSection Component"
- [ ] **11.3** Add reference: "REQ-E05-025: Owner language preference selector for translation management."
- [ ] **11.4** Add "## Usage" section with TypeScript code example showing component import and basic usage
- [ ] **11.5** Include example of handleSave function making API call to preferences endpoint
- [ ] **11.6** Add "## Props" section with markdown table listing all props, their types, required status, and descriptions
- [ ] **11.7** Add "## Features" section as bullet list: Smart Save Button, Auto-clear Success, Loading State, Error Handling, Accessibility
- [ ] **11.8** Add "## Integration Example" section showing how to fetch current preference and integrate with parent component state
- [ ] **11.9** Verify markdown formatting is correct

---

## 12. Verify TypeScript Compilation

**Context:** Ensure all new code compiles without errors and types are correctly defined across the component, helpers, and tests.

**Estimated effort:** 1 story point

- [ ] **12.1** Run full type check: `npx tsc --noEmit` from project root
- [ ] **12.2** Fix any type errors in LanguagePreferenceSection.tsx
- [ ] **12.3** Fix any type errors in LanguagePreferenceSection.types.ts
- [ ] **12.4** Fix any type errors in language-options.ts
- [ ] **12.5** Fix any type errors in test files
- [ ] **12.6** Verify no implicit 'any' types exist
- [ ] **12.7** Re-run type check and confirm zero errors

---

## 13. Run Linter and Fix Issues

**Context:** Ensure code quality and consistency with the project's ESLint configuration.

**Estimated effort:** 1 story point

- [ ] **13.1** Run linter: `npm run lint` from project root
- [ ] **13.2** Fix any ESLint warnings in LanguagePreferenceSection.tsx
- [ ] **13.3** Fix any ESLint warnings in language-options.ts
- [ ] **13.4** Fix any ESLint warnings in test files
- [ ] **13.5** Verify no unused imports exist
- [ ] **13.6** Verify no unused variables exist
- [ ] **13.7** Re-run linter and confirm zero warnings

---

## 14. Manual Testing - Basic Functionality

**Context:** Verify the component works correctly in a live browser environment with real user interactions.

**Estimated effort:** 1 story point

- [ ] **14.1** Create a test page or story that renders LanguagePreferenceSection with mock props
- [ ] **14.2** Start dev server: `npm run dev`
- [ ] **14.3** Navigate to test page and verify component renders with dropdown and disabled Save button
- [ ] **14.4** Select a different language in dropdown and verify Save button becomes enabled
- [ ] **14.5** Click Save button and verify "Saving..." state appears with spinner
- [ ] **14.6** Verify success message appears after save completes
- [ ] **14.7** Wait 3 seconds and verify success message disappears automatically
- [ ] **14.8** Verify Save button becomes disabled again after successful save (no changes)
- [ ] **14.9** Select a different language again and verify the flow can be repeated

---

## 15. Manual Testing - Edge Cases

**Context:** Test error handling, disabled states, and edge cases to ensure robust behavior.

**Estimated effort:** 1 story point

- [ ] **15.1** Test with currentLanguage=null prop - verify first language is selected by default
- [ ] **15.2** Test with empty availableLanguages array - verify component doesn't crash and dropdown is empty
- [ ] **15.3** Modify mock onSave to reject with error - click Save and verify error message appears
- [ ] **15.4** Verify error message persists and contains helpful text
- [ ] **15.5** Change dropdown selection and verify error message clears
- [ ] **15.6** Test with disabled=true prop - verify dropdown and button are disabled with visual indication
- [ ] **15.7** Test language options with nativeName - verify dropdown shows "Name (NativeName)" format
- [ ] **15.8** Test language options without nativeName or where nativeName equals name - verify only name is shown

---

## 16. Manual Testing - Accessibility

**Context:** Verify keyboard navigation, screen reader compatibility, and WCAG compliance.

**Estimated effort:** 1 story point

- [ ] **16.1** Use only keyboard (Tab, Enter, Arrow keys) to navigate through component
- [ ] **16.2** Verify dropdown can be opened and navigated with arrow keys
- [ ] **16.3** Verify Save button can be activated with Enter key
- [ ] **16.4** Use browser dev tools to inspect ARIA labels on dropdown and button
- [ ] **16.5** Use screen reader (VoiceOver on Mac or NVDA on Windows) to test component announcement
- [ ] **16.6** Verify error messages are announced by screen reader
- [ ] **16.7** Verify success messages are announced by screen reader
- [ ] **16.8** Check color contrast of text and buttons meets WCAG AA standards

---

## 17. Manual Testing - Responsive Design

**Context:** Ensure the component layout works correctly on different screen sizes.

**Estimated effort:** 1 story point

- [ ] **17.1** Open browser dev tools and toggle device toolbar for mobile view (375px width)
- [ ] **17.2** Verify dropdown doesn't overflow and remains readable
- [ ] **17.3** Verify Save button is visible and text is not truncated
- [ ] **17.4** Verify section header and help text wrap appropriately
- [ ] **17.5** Test at tablet width (768px) - verify layout remains functional
- [ ] **17.6** Test at desktop width (1920px) - verify max-width constraint on dropdown (`max-w-xs`)
- [ ] **17.7** Verify success/error messages display correctly on all screen sizes

---

## 18. Build Verification

**Context:** Ensure the component can be built for production without errors or warnings.

**Estimated effort:** 1 story point

- [ ] **18.1** Run production build: `npm run build` from project root
- [ ] **18.2** Verify build completes successfully without errors
- [ ] **18.3** Check build output for any warnings related to new files
- [ ] **18.4** Verify tree-shaking works correctly (no unused code in bundle)
- [ ] **18.5** If build fails, identify and fix the issue, then rebuild
- [ ] **18.6** Confirm final build succeeds with zero errors and zero warnings

---

## Authorized Files for Modification

### New Files to Create
1. `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` - Main component
2. `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts` - TypeScript types
3. `/src/components/TranslationManagement/LanguagePreference/index.ts` - Module exports
4. `/src/lib/i18n/language-options.ts` - Helper to convert locale metadata to LanguageOption
5. `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` - Unit tests
6. `/src/lib/i18n/__tests__/language-options.test.ts` - Helper function tests
7. `/src/components/TranslationManagement/LanguagePreference/README.md` - Usage documentation

### Existing Files to Modify
1. `/src/lib/i18n/index.ts` - Add export for `language-options` module

### Files to Reference (No Changes)
- `/src/lib/i18n/config.ts` - Source of truth for localeMetadata
- `/src/lib/utils.ts` - `cn()` utility for className merging
- `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` - Pattern reference for section components

---

## Dependencies

### Required (Must Exist First)
- **Epic 1 - L10N Foundation**: `/src/lib/i18n/config.ts` with localeMetadata ✅ (exists)
- **Lucide React**: Icons (Globe, Check, AlertCircle, Loader2) ✅ (installed)
- **Tailwind CSS**: Utility classes via `cn()` helper ✅ (configured)
- **React 18+**: Hooks (useState, useCallback, useEffect) ✅ (installed)

### Optional (Can Be Added Later)
- **REQ-E05-026**: Account Preference API Endpoint - Required for actual persistence (different task)
- **Translation Management Page**: Where this component will be integrated (different task)

### No External API Dependencies
This component is purely presentational and accepts `onSave` callback prop. The parent component is responsible for API communication.

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Component file created at `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
2. ✅ Types file created with all interfaces
3. ✅ Index file exports component and types
4. ✅ Dropdown displays all available languages from `availableLanguages` prop
5. ✅ Currently saved language is pre-selected in dropdown
6. ✅ Changing dropdown does NOT auto-save (requires Save button)
7. ✅ Save button disabled when no changes made
8. ✅ Save button disabled during save operation
9. ✅ Loading spinner appears during save operation
10. ✅ Success message displays for 3 seconds after successful save
11. ✅ Error message displays when save fails
12. ✅ Help text explains purpose of language preference
13. ✅ Component respects `disabled` prop
14. ✅ Component uses consistent Tailwind styling
15. ✅ Component is accessible (ARIA labels, keyboard navigation)
16. ✅ No TypeScript compilation errors
17. ✅ No ESLint warnings
18. ✅ Component handles edge cases (empty array, null currentLanguage)
19. ✅ All unit tests pass
20. ✅ Manual QA scenarios complete successfully
21. ✅ Production build succeeds without errors

---

**Document Status**: PENDING
**Last Updated**: 2026-01-23 11:30
**Author**: Senior Developer (Task Breakdown Agent)
**Review Status**: Awaiting Implementation
