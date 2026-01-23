# Integrate Manual Edit Warning into Content Save Flow - Detailed Implementation Tasks

**Generated:** 2026-01-23 11:15
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #24)
- Overview: docs/REQ-E05-024-integrate-warning-into-content-save-flow-overview.md
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

## 1. Create useManualEditCheck Hook

**Context:** This hook centralizes the logic for detecting manual translations before save operations. It queries the translation records directly to identify which languages have manual edits (`status === 'manual'`) and returns this information to editor components. The hook implements fail-safe behavior: if the API check fails, it returns `hasManualEdits: false` to allow the save to proceed rather than blocking the user.

**Files to modify:**
- `/src/hooks/useManualEditCheck.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create the hook file at `/src/hooks/useManualEditCheck.ts` with 'use client' directive
- [ ] **1.2** Import required types: `SupportedLanguage` from `@/lib/translation-service/translation-service.types`, and React hooks `useState`, `useCallback`
- [ ] **1.3** Define the `ManualEditCheckOptions` interface with `entityType: 'item' | 'article'` and `entityId: string` properties
- [ ] **1.4** Define the `ManualEditCheckResult` interface with `hasManualEdits: boolean` and `manuallyEditedLanguages: SupportedLanguage[]` properties
- [ ] **1.5** Define the `UseManualEditCheckReturn` interface with `checkForManualEdits`, `isChecking`, `error`, and `reset` properties
- [ ] **1.6** Implement the hook function with state for `isChecking` (boolean, initial: false) and `error` (string | null, initial: null)
- [ ] **1.7** Implement `checkForManualEdits` async function using `useCallback` that fetches `/api/translations/${entityType}/${entityId}`
- [ ] **1.8** In `checkForManualEdits`, set `isChecking` to true and `error` to null at start
- [ ] **1.9** Parse the response JSON and filter translations where `status === 'manual'`, extracting the `language` field to build `manuallyEditedLanguages` array
- [ ] **1.10** Return `{ hasManualEdits: manuallyEditedLanguages.length > 0, manuallyEditedLanguages }`
- [ ] **1.11** Add try-catch error handling that logs the error and returns fail-safe `{ hasManualEdits: false, manuallyEditedLanguages: [] }` to allow save to proceed
- [ ] **1.12** In finally block, set `isChecking` to false
- [ ] **1.13** Implement `reset` function using `useCallback` that sets `error` to null
- [ ] **1.14** Return object with `{ checkForManualEdits, isChecking, error, reset }` from the hook
- [ ] **1.15** Run type check: `npx tsc --noEmit` and verify no errors

---

## 2. Update InstructionEditor Component

**Context:** The InstructionEditor component handles article editing. We intercept the save flow to check for manual translations before proceeding. When manual translations are detected, the ManualEditWarningDialog is displayed, giving users three choices: keep manual edits (skip re-translation), re-translate all (overwrite manual edits), or cancel (abort save). The component manages dialog state and passes appropriate flags to the save handler.

**Files to modify:**
- `/src/components/InstructionEditor/InstructionEditor.tsx` (lines 79-149)

**Estimated effort:** 1 story point

- [ ] **2.1** Add imports: `ManualEditWarningDialog` from `@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog`, `useManualEditCheck` from `@/hooks/useManualEditCheck`, and `SupportedLanguage` type
- [ ] **2.2** Initialize `useManualEditCheck` hook and destructure `checkForManualEdits` and `isChecking`
- [ ] **2.3** Add state `showManualEditWarning` (boolean, initial: false)
- [ ] **2.4** Add state `manuallyEditedLanguages` (SupportedLanguage[], initial: [])
- [ ] **2.5** Add state `pendingPayload` (UpdateArticlePayload | null, initial: null)
- [ ] **2.6** Add state `saveMode` ('skip' | 'overwrite' | null, initial: null)
- [ ] **2.7** Modify `handleSave` to call `checkForManualEdits({ entityType: 'article', entityId: articleData.id })` before proceeding
- [ ] **2.8** If `result.hasManualEdits` is true, set `manuallyEditedLanguages`, `pendingPayload`, and `showManualEditWarning` states, then return early
- [ ] **2.9** If no manual edits, proceed with normal `onSave(payload)` call
- [ ] **2.10** Create `handleKeepManualEdits` function that calls `onSave({ ...pendingPayload, skipRetranslation: true })` and closes dialog
- [ ] **2.11** Create `handleOverwriteManualEdits` function that calls `onSave({ ...pendingPayload, forceRetranslation: true })` and closes dialog
- [ ] **2.12** Create `handleCancelWarning` function that closes dialog and clears all warning-related state
- [ ] **2.13** Add `ManualEditWarningDialog` component to JSX with props: `isOpen`, `manuallyEditedLanguages`, `onKeepManual`, `onOverwrite`, `onCancel`, `loading`, `entityType="article"`
- [ ] **2.14** Update save button's `disabled` prop to include `isChecking`: `disabled={isSaving || isChecking}`
- [ ] **2.15** Add conditional button text: show "Checking translations..." when `isChecking`, "Saving..." when `isSaving`, otherwise "Save"
- [ ] **2.16** Import `Loader2` icon from `lucide-react` and add spinner animation during `isChecking` or `isSaving`
- [ ] **2.17** Run type check: `npx tsc --noEmit`

---

## 3. Update InstructionEditor Types

**Context:** The UpdateArticlePayload interface needs optional flags to control translation behavior. The `skipRetranslation` flag tells the API to preserve manual translations (which become stale). The `forceRetranslation` flag triggers re-translation, overwriting manual edits.

**Files to modify:**
- `/src/components/InstructionEditor/InstructionEditor.types.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Open `/src/components/InstructionEditor/InstructionEditor.types.ts`
- [ ] **3.2** Locate the `UpdateArticlePayload` interface definition
- [ ] **3.3** Add optional property `skipRetranslation?: boolean` with JSDoc comment: "If true, skip re-translation. Existing manual translations are preserved but marked stale."
- [ ] **3.4** Add optional property `forceRetranslation?: boolean` with JSDoc comment: "If true, queue re-translation for all languages, overwriting manual edits."
- [ ] **3.5** Run type check: `npx tsc --noEmit` to verify the interface update

---

## 4. Update ItemForm Component

**Context:** ItemForm handles both creating new items and updating existing items. Manual translation checks should only run when editing existing items (when `item?.id` exists), not during new item creation. The integration follows the same pattern as InstructionEditor.

**Files to modify:**
- `/src/components/ItemForm.tsx` (lines 35-139)

**Estimated effort:** 1 story point

- [ ] **4.1** Add imports: `ManualEditWarningDialog`, `useManualEditCheck`, and `SupportedLanguage` type
- [ ] **4.2** Initialize `useManualEditCheck` hook and destructure `checkForManualEdits` and `isChecking`
- [ ] **4.3** Add state for `showManualEditWarning`, `manuallyEditedLanguages`, `pendingItemData`, and `saveMode` (same pattern as InstructionEditor)
- [ ] **4.4** Modify `handleSubmit` to check `if (item?.id)` to determine if editing existing item
- [ ] **4.5** If editing, call `checkForManualEdits({ entityType: 'item', entityId: item.id })` before proceeding with save
- [ ] **4.6** If manual edits detected, show dialog with `setPendingItemData({ ...itemData, id: item.id })` and return early
- [ ] **4.7** If no manual edits or new item, proceed with normal `onSave` call with appropriate type (CreateItemRequest or UpdateItemRequest)
- [ ] **4.8** Create `handleKeepManualEdits` function that saves with `skipRetranslation: true` flag
- [ ] **4.9** Create `handleOverwriteManualEdits` function that saves with `forceRetranslation: true` flag
- [ ] **4.10** Create `handleCancelWarning` function to close dialog and clear state
- [ ] **4.11** Add `ManualEditWarningDialog` component to form JSX with props for `entityType="item"`
- [ ] **4.12** Update submit button to be disabled when `isChecking` and show "Checking translations..." loading state
- [ ] **4.13** Run type check: `npx tsc --noEmit`

---

## 5. Update Item Types

**Context:** The UpdateItemRequest interface needs the same translation control flags as UpdateArticlePayload to maintain API consistency across entity types.

**Files to modify:**
- `/src/types/index.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Open `/src/types/index.ts` file
- [ ] **5.2** Locate the `UpdateItemRequest` interface definition
- [ ] **5.3** Add optional property `skipRetranslation?: boolean` with JSDoc comment explaining it preserves manual translations
- [ ] **5.4** Add optional property `forceRetranslation?: boolean` with JSDoc comment explaining it overwrites manual edits
- [ ] **5.5** Run type check: `npx tsc --noEmit` to verify the interface update

---

## 6. Update Article Update API Endpoint

**Context:** The article update API needs to accept and process the `skipRetranslation` and `forceRetranslation` flags. When `skipRetranslation` is true, no re-translation is triggered (manual translations become stale). When `forceRetranslation` is true, the translation API is called with `forceRetranslate: true` to queue jobs that will overwrite manual edits.

**Files to modify:**
- `/src/app/api/articles/[id]/route.ts` (PUT handler)

**Estimated effort:** 1 story point

- [ ] **6.1** Open `/src/app/api/articles/[id]/route.ts` and locate the PUT handler function
- [ ] **6.2** Extract `skipRetranslation` and `forceRetranslation` from request body with default values of `false`
- [ ] **6.3** After the article database update succeeds, add conditional translation logic
- [ ] **6.4** If `skipRetranslation === true`, log "Skipping re-translation for article: [articleId]" and do NOT queue re-translation
- [ ] **6.5** Else if `forceRetranslation === true`, make fetch call to `POST /api/translations/translate` with body `{ entityType: 'article', entityId: articleId, forceRetranslate: true }`
- [ ] **6.6** Add error handling for the translation API call using try-catch with console.error logging (errors should not fail the article update)
- [ ] **6.7** If neither flag is true, use existing default translation behavior
- [ ] **6.8** Add comments explaining each branch of the translation control logic
- [ ] **6.9** Run type check: `npx tsc --noEmit`

---

## 7. Update Item Update API Endpoint

**Context:** The item update API needs identical translation control logic to the article endpoint for consistency. The implementation pattern is the same: check flags, skip or force re-translation accordingly.

**Files to modify:**
- `/src/app/api/items/[id]/route.ts` (PUT handler)

**Estimated effort:** 1 story point

- [ ] **7.1** Open `/src/app/api/items/[id]/route.ts` and locate the PUT handler function
- [ ] **7.2** Extract `skipRetranslation` and `forceRetranslation` from request body with default values of `false`
- [ ] **7.3** After the item database update succeeds, add conditional translation logic
- [ ] **7.4** If `skipRetranslation === true`, log "Skipping re-translation for item: [itemId]" and skip translation
- [ ] **7.5** Else if `forceRetranslation === true`, make fetch call to `POST /api/translations/translate` with body `{ entityType: 'item', entityId: itemId, forceRetranslate: true }`
- [ ] **7.6** Add error handling with try-catch and console.error logging
- [ ] **7.7** If neither flag, use default behavior
- [ ] **7.8** Add explanatory comments
- [ ] **7.9** Run type check: `npx tsc --noEmit`

---

## 8. Add Translation Keys to messages/en.json

**Context:** The loading states need i18n support. English is the base language, so we add the keys here first, then propagate to other locales.

**Files to modify:**
- `/messages/en.json`

**Estimated effort:** 1 story point

- [ ] **8.1** Open `/messages/en.json` file
- [ ] **8.2** Locate or create the `articles.instructionEditor` namespace
- [ ] **8.3** Add key `"checkingTranslations": "Checking translations..."`
- [ ] **8.4** Add key `"translationCheckFailed": "Failed to check translations. Proceeding with save."`
- [ ] **8.5** Locate or create the `items.form` namespace
- [ ] **8.6** Add key `"checkingTranslations": "Checking translations..."`
- [ ] **8.7** Add key `"translationCheckFailed": "Failed to check translations. Proceeding with save."`
- [ ] **8.8** Verify JSON syntax is valid by running: `npm run build`

---

## 9. Add Translation Keys to messages/es.json

**Context:** Spanish translations for the loading state messages.

**Files to modify:**
- `/messages/es.json`

**Estimated effort:** 1 story point

- [ ] **9.1** Open `/messages/es.json` file
- [ ] **9.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Verificando traducciones..."`
- [ ] **9.3** Add to `articles.instructionEditor`: `"translationCheckFailed": "Error al verificar traducciones. Continuando con guardar."`
- [ ] **9.4** Add the same two keys to `items.form` namespace
- [ ] **9.5** Verify JSON syntax is valid

---

## 10. Add Translation Keys to messages/fr.json

**Context:** French translations for the loading state messages.

**Files to modify:**
- `/messages/fr.json`

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/messages/fr.json` file
- [ ] **10.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Vérification des traductions..."`
- [ ] **10.3** Add to `articles.instructionEditor`: `"translationCheckFailed": "Échec de la vérification des traductions. Enregistrement en cours."`
- [ ] **10.4** Add the same two keys to `items.form` namespace
- [ ] **10.5** Verify JSON syntax is valid

---

## 11. Add Translation Keys to messages/de.json

**Context:** German translations for the loading state messages.

**Files to modify:**
- `/messages/de.json`

**Estimated effort:** 1 story point

- [ ] **11.1** Open `/messages/de.json` file
- [ ] **11.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Übersetzungen werden überprüft..."`
- [ ] **11.3** Add to `articles.instructionEditor`: `"translationCheckFailed": "Übersetzungsprüfung fehlgeschlagen. Speichern wird fortgesetzt."`
- [ ] **11.4** Add the same two keys to `items.form` namespace
- [ ] **11.5** Verify JSON syntax is valid

---

## 12. Add Translation Keys to messages/it.json

**Context:** Italian translations for the loading state messages.

**Files to modify:**
- `/messages/it.json`

**Estimated effort:** 1 story point

- [ ] **12.1** Open `/messages/it.json` file
- [ ] **12.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Controllo traduzioni..."`
- [ ] **12.3** Add to `articles.instructionEditor`: `"translationCheckFailed": "Impossibile controllare le traduzioni. Salvataggio in corso."`
- [ ] **12.4** Add the same two keys to `items.form` namespace
- [ ] **12.5** Verify JSON syntax is valid

---

## 13. Add Translation Keys to messages/nl.json

**Context:** Dutch translations for the loading state messages.

**Files to modify:**
- `/messages/nl.json`

**Estimated effort:** 1 story point

- [ ] **13.1** Open `/messages/nl.json` file
- [ ] **13.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Vertalingen controleren..."`
- [ ] **13.3** Add to `articles.instructionEditor`: `"translationCheckFailed": "Controle van vertalingen mislukt. Doorgaan met opslaan."`
- [ ] **13.4** Add the same two keys to `items.form` namespace
- [ ] **13.5** Verify JSON syntax is valid

---

## 14. Add Error Handling UI

**Context:** When the translation check fails, the hook's fail-safe behavior allows the save to proceed. However, we should log errors and optionally notify the user via console warnings. This ensures developers can debug issues while users aren't blocked.

**Files to modify:**
- `/src/components/InstructionEditor/InstructionEditor.tsx`
- `/src/components/ItemForm.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** In InstructionEditor, destructure `error` from the `useManualEditCheck` hook
- [ ] **14.2** Add a `useEffect` hook that watches `error` state
- [ ] **14.3** When `error` is not null, log it to console: `console.error('Translation check error:', error)`
- [ ] **14.4** Optionally display a toast notification if toast system exists (check for existing toast implementation)
- [ ] **14.5** Repeat steps 14.1-14.4 for ItemForm component
- [ ] **14.6** Run type check: `npx tsc --noEmit`

---

## 15. Write Unit Tests for useManualEditCheck Hook

**Context:** The hook needs comprehensive test coverage to verify it correctly identifies manual translations, handles API responses, manages loading state, and implements fail-safe error handling.

**Files to modify:**
- `/src/hooks/__tests__/useManualEditCheck.test.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **15.1** Create test file at `/src/hooks/__tests__/useManualEditCheck.test.ts`
- [ ] **15.2** Import testing utilities: `renderHook`, `waitFor` from `@testing-library/react`, and `describe`, `it`, `expect`, `vi` from `vitest`
- [ ] **15.3** Mock global `fetch` function using `vi.stubGlobal('fetch', vi.fn())`
- [ ] **15.4** Write test: "returns hasManualEdits: true when translations with status='manual' exist" - mock API returning translations with manual status
- [ ] **15.5** Write test: "returns hasManualEdits: false when no manual translations exist" - mock API returning only automated translations
- [ ] **15.6** Write test: "returns hasManualEdits: false on API error (fail-safe behavior)" - mock API throwing error
- [ ] **15.7** Write test: "correctly extracts manuallyEditedLanguages array from API response" - verify array contains correct language codes
- [ ] **15.8** Write test: "sets isChecking to true during fetch and false after" - verify loading state transitions
- [ ] **15.9** Write test: "sets error state on fetch failure" - verify error message is captured
- [ ] **15.10** Write test: "reset() clears error state" - call reset and verify error becomes null
- [ ] **15.11** Run tests: `npm test` and verify all tests pass

---

## 16. Write Integration Tests for InstructionEditor

**Context:** End-to-end testing ensures the complete save flow works correctly with manual edit detection, dialog display, and all three user choices (keep, overwrite, cancel).

**Files to modify:**
- `/src/components/InstructionEditor/__tests__/InstructionEditor.integration.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **16.1** Create test file at `/src/components/InstructionEditor/__tests__/InstructionEditor.integration.test.tsx`
- [ ] **16.2** Import testing utilities, React Testing Library, and vitest
- [ ] **16.3** Mock the `useManualEditCheck` hook to return controlled results
- [ ] **16.4** Mock the `ManualEditWarningDialog` component to test integration without dialog implementation details
- [ ] **16.5** Write test: "save proceeds without dialog when no manual translations exist" - verify onSave called directly
- [ ] **16.6** Write test: "dialog appears when manual translations are detected" - verify dialog state becomes true
- [ ] **16.7** Write test: "Keep manual edits saves with skipRetranslation: true" - verify correct payload passed to onSave
- [ ] **16.8** Write test: "Re-translate all saves with forceRetranslation: true" - verify correct payload
- [ ] **16.9** Write test: "Cancel aborts save and closes dialog" - verify onSave not called, dialog closed
- [ ] **16.10** Write test: "loading states display correctly during check and save" - verify button text and disabled state
- [ ] **16.11** Write test: "error handling works when translation check fails" - verify save still proceeds
- [ ] **16.12** Run tests: `npm test` and verify all tests pass

---

## 17. Final Verification and Manual Testing

**Context:** Before marking complete, we must verify all components work together in a live environment, type checking passes, and the build succeeds.

**Estimated effort:** 1 story point

- [ ] **17.1** Run full type check: `npx tsc --noEmit` and verify zero errors
- [ ] **17.2** Run linter: `npm run lint` and fix any issues that arise
- [ ] **17.3** Run full test suite: `npm test` and verify all tests pass
- [ ] **17.4** Build the project: `npm run build` and verify successful build with no errors
- [ ] **17.5** Start dev server: `npm run dev` and navigate to article editor
- [ ] **17.6** Create a test article, manually add a translation with status='manual' (via database or existing UI)
- [ ] **17.7** Edit the article title and click Save
- [ ] **17.8** Verify "Checking translations..." appears briefly
- [ ] **17.9** Verify ManualEditWarningDialog appears with correct languages listed
- [ ] **17.10** Click "Keep manual edits" and verify article saves, dialog closes, and skipRetranslation flag is sent
- [ ] **17.11** Edit article again, click Save, then click "Re-translate all" and verify forceRetranslation flag is sent
- [ ] **17.12** Edit article again, click Save, then click "Cancel" and verify save is aborted, editor remains open
- [ ] **17.13** Test the same scenarios with ItemForm by editing an existing item with manual translations
- [ ] **17.14** Verify loading states appear correctly during translation check for both editors
- [ ] **17.15** Test with an article/item that has no manual translations and verify dialog does NOT appear
- [ ] **17.16** Simulate error by temporarily breaking the translation API endpoint and verify save proceeds with console warning

---

## Authorized Files for Modification

### New Files to Create
1. `/src/hooks/useManualEditCheck.ts` - Custom hook for manual translation detection
2. `/src/hooks/__tests__/useManualEditCheck.test.ts` - Unit tests for hook
3. `/src/components/InstructionEditor/__tests__/InstructionEditor.integration.test.tsx` - Integration tests

### Existing Files to Modify
1. `/src/components/InstructionEditor/InstructionEditor.tsx` (lines 79-149) - Add manual edit check integration
2. `/src/components/InstructionEditor/InstructionEditor.types.ts` - Add `skipRetranslation` and `forceRetranslation` flags
3. `/src/components/ItemForm.tsx` (lines 35-139) - Add manual edit check integration
4. `/src/types/index.ts` - Update `UpdateItemRequest` interface
5. `/src/app/api/articles/[id]/route.ts` - Accept and process translation control flags (PUT handler)
6. `/src/app/api/items/[id]/route.ts` - Accept and process translation control flags (PUT handler)
7. `/messages/en.json` - Add translation keys for loading states
8. `/messages/es.json` - Add Spanish translations
9. `/messages/fr.json` - Add French translations
10. `/messages/de.json` - Add German translations
11. `/messages/it.json` - Add Italian translations
12. `/messages/nl.json` - Add Dutch translations

### Files to Reference (No Changes)
- `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` - Warning dialog component (from REQ-E05-022)
- `/src/lib/translation-service/translation-service.types.ts` - SupportedLanguage type

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-001**: Translation Status API - Provides endpoint for checking translation status
- **REQ-E05-022**: ManualEditWarningDialog Component - UI component for warning dialog

### Related (Should Exist)
- **REQ-E05-003**: Re-Translate API Endpoint - For queuing re-translation when `forceRetranslation: true`
- Translation records must use `status` field with value 'manual' for manually edited translations

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ `useManualEditCheck` hook correctly identifies manual translations
2. ✅ InstructionEditor shows ManualEditWarningDialog when manual translations exist
3. ✅ ItemForm shows ManualEditWarningDialog when editing items with manual translations
4. ✅ "Keep manual edits" option saves with `skipRetranslation: true`, preserving translations (which become stale)
5. ✅ "Re-translate all" option saves with `forceRetranslation: true`, queuing re-translation jobs
6. ✅ "Cancel" option aborts save and closes dialog
7. ✅ Save proceeds without dialog when no manual translations exist
8. ✅ Loading states display correctly ("Checking translations..." → "Saving...")
9. ✅ Error handling fails safely (save proceeds with console warning)
10. ✅ All TypeScript compilation passes with no errors
11. ✅ All unit and integration tests pass
12. ✅ Manual QA scenarios complete successfully
13. ✅ Translation keys exist for all 6 supported languages
14. ✅ API endpoints accept and process `skipRetranslation` and `forceRetranslation` flags

---

**Document Status**: PENDING
**Last Updated**: 2026-01-23 11:15
**Author**: Senior Developer (Task Breakdown Agent)
**Review Status**: Awaiting Implementation
