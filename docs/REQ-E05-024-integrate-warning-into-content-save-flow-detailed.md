# REQ-E05-024: Integrate Manual Edit Warning into Content Save Flow - Detailed Task Breakdown

**Created**: 2026-01-22 23:54
**Status**: PENDING
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 5 - Manual Edit Preservation
**Task**: 5.3 - Integrate warning into content save flow
**Size**: M (6-8 hours)

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-024-integrate-warning-into-content-save-flow-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (lines 3971-4280)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Build & Test Commands

```bash
# Type check (MUST pass before commit)
npm run typecheck

# Run development server
npm run dev

# Build for production (MUST succeed)
npm run build

# Run tests
npm test

# Lint
npm run lint
```

---

## Overview

Integrate ManualEditWarningDialog into article and item save flows to protect manual translations from accidental overwriting. When users edit source content (article title, item name/description), the system checks for existing manual translations and shows a warning dialog with three options: (1) Keep manual edits (translations become stale), (2) Re-translate all (overwrite manual edits), or (3) Cancel (abort save). Create a reusable `useManualEditCheck` hook to detect manual translations, update save handlers to call the check before proceeding, and pass `skipRetranslation` or `forceRetranslation` flags to API endpoints.

**Key Requirements:**
- Create `/src/hooks/useManualEditCheck.ts` for manual translation detection
- Integrate into InstructionEditor for article saves
- Integrate into ItemForm for item saves
- Add `skipRetranslation` and `forceRetranslation` flags to payload types
- Update article and item API endpoints to process translation flags
- Add translation keys for loading states
- Fail-safe behavior: if check fails, allow save to proceed with warning

---

## Task Breakdown

### Task 1: Create useManualEditCheck hook file and structure
**Estimated effort**: 0.5 hours

- [ ] **1.1** Create directory `/src/hooks/` if it doesn't already exist
- [ ] **1.2** Create file `/src/hooks/useManualEditCheck.ts`
- [ ] **1.3** Add 'use client' directive at the top
- [ ] **1.4** Add JSDoc file header describing the hook purpose
- [ ] **1.5** Add creation date: 2026-01-22
- [ ] **1.6** Reference REQ-E05-024 in file header
- [ ] **1.7** Import React hooks: `useState`, `useCallback`
- [ ] **1.8** Import type: `SupportedLanguage` from '@/lib/translation-service/translation-service.types'

---

### Task 2: Define TypeScript interfaces for hook
**Estimated effort**: 0.3 hours

- [ ] **2.1** Create `ManualEditCheckOptions` interface
- [ ] **2.2** Add property: `entityType: 'item' | 'article'`
- [ ] **2.3** Add property: `entityId: string`
- [ ] **2.4** Add JSDoc comments explaining each property
- [ ] **2.5** Create `ManualEditCheckResult` interface
- [ ] **2.6** Add property: `hasManualEdits: boolean`
- [ ] **2.7** Add property: `manuallyEditedLanguages: SupportedLanguage[]`
- [ ] **2.8** Add JSDoc comments explaining result properties
- [ ] **2.9** Create `UseManualEditCheckReturn` interface
- [ ] **2.10** Add property: `checkForManualEdits: (options: ManualEditCheckOptions) => Promise<ManualEditCheckResult>`
- [ ] **2.11** Add property: `isChecking: boolean`
- [ ] **2.12** Add property: `error: string | null`
- [ ] **2.13** Add property: `reset: () => void`
- [ ] **2.14** Export all interfaces

---

### Task 3: Implement useManualEditCheck hook state
**Estimated effort**: 0.2 hours

- [ ] **3.1** Create function `useManualEditCheck` with return type `UseManualEditCheckReturn`
- [ ] **3.2** Add state: `const [isChecking, setIsChecking] = useState(false)`
- [ ] **3.3** Add state: `const [error, setError] = useState<string | null>(null)`
- [ ] **3.4** Verify state types are correct

---

### Task 4: Implement checkForManualEdits function
**Estimated effort**: 1.5 hours

- [ ] **4.1** Create `checkForManualEdits` using `useCallback` with deps array `[]`
- [ ] **4.2** Accept parameter: `options: ManualEditCheckOptions`
- [ ] **4.3** Return type: `Promise<ManualEditCheckResult>`
- [ ] **4.4** Set `isChecking` to true at start
- [ ] **4.5** Set `error` to null at start
- [ ] **4.6** Wrap logic in try-catch block
- [ ] **4.7** Construct API URL: `/api/translations/${options.entityType}/${options.entityId}`
- [ ] **4.8** Call `fetch()` with GET request
- [ ] **4.9** Check if `response.ok` - throw error if not
- [ ] **4.10** Parse JSON response: `const translations = await response.json()`
- [ ] **4.11** Check if response is array: `Array.isArray(translations)`
- [ ] **4.12** Initialize empty array: `const manuallyEditedLanguages: SupportedLanguage[] = []`
- [ ] **4.13** Iterate over translations array
- [ ] **4.14** For each translation, check if `t.status === 'manual'`
- [ ] **4.15** If manual, push `t.language` to `manuallyEditedLanguages` array
- [ ] **4.16** Cast language to `SupportedLanguage` type
- [ ] **4.17** Calculate `hasManualEdits`: `manuallyEditedLanguages.length > 0`
- [ ] **4.18** Return object with `hasManualEdits` and `manuallyEditedLanguages`
- [ ] **4.19** In catch block, extract error message
- [ ] **4.20** Set error state: `setError(errorMessage)`
- [ ] **4.21** Log error to console: `console.error('Error checking manual edits:', err)`
- [ ] **4.22** Return fail-safe result: `{ hasManualEdits: false, manuallyEditedLanguages: [] }`
- [ ] **4.23** In finally block, set `isChecking` to false
- [ ] **4.24** Add comment explaining fail-safe behavior

---

### Task 5: Implement reset function and hook return
**Estimated effort**: 0.1 hours

- [ ] **5.1** Create `reset` function using `useCallback` with empty deps
- [ ] **5.2** In reset, set `error` to null
- [ ] **5.3** Return object with all hook properties: `checkForManualEdits`, `isChecking`, `error`, `reset`
- [ ] **5.4** Export hook: `export function useManualEditCheck()`
- [ ] **5.5** Run `npm run typecheck` to verify types

---

### Task 6: Update InstructionEditor types to support translation flags
**Estimated effort**: 0.2 hours

- [ ] **6.1** Open file `/src/components/InstructionEditor/InstructionEditor.types.ts`
- [ ] **6.2** Locate `UpdateArticlePayload` interface
- [ ] **6.3** Add optional property: `skipRetranslation?: boolean`
- [ ] **6.4** Add JSDoc: "If true, skip re-translation. Existing translations become stale."
- [ ] **6.5** Add optional property: `forceRetranslation?: boolean`
- [ ] **6.6** Add JSDoc: "If true, queue re-translation for all languages, overwriting manual edits."
- [ ] **6.7** Verify interface exports correctly
- [ ] **6.8** Run `npm run typecheck`

---

### Task 7: Add state and imports to InstructionEditor component
**Estimated effort**: 0.3 hours

- [ ] **7.1** Open file `/src/components/InstructionEditor/InstructionEditor.tsx`
- [ ] **7.2** Import ManualEditWarningDialog: `from '@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog'`
- [ ] **7.3** Import useManualEditCheck: `from '@/hooks/useManualEditCheck'`
- [ ] **7.4** Import SupportedLanguage type: `from '@/lib/translation-service/translation-service.types'`
- [ ] **7.5** Add hook call: `const { checkForManualEdits, isChecking } = useManualEditCheck()`
- [ ] **7.6** Add state: `const [showManualEditWarning, setShowManualEditWarning] = useState(false)`
- [ ] **7.7** Add state: `const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<SupportedLanguage[]>([])`
- [ ] **7.8** Add state: `const [pendingPayload, setPendingPayload] = useState<UpdateArticlePayload | null>(null)`
- [ ] **7.9** Add state: `const [saveMode, setSaveMode] = useState<'skip' | 'overwrite' | null>(null)`

---

### Task 8: Update handleSave function in InstructionEditor
**Estimated effort**: 1 hour

- [ ] **8.1** Locate `handleSave` function in InstructionEditor component
- [ ] **8.2** Keep existing payload construction logic
- [ ] **8.3** After payload is constructed, add manual translation check
- [ ] **8.4** Call: `const result = await checkForManualEdits({ entityType: 'article', entityId: articleData.id })`
- [ ] **8.5** Check if `result.hasManualEdits` is true
- [ ] **8.6** If true, set `manuallyEditedLanguages` state: `setManuallyEditedLanguages(result.manuallyEditedLanguages)`
- [ ] **8.7** Set `pendingPayload` state: `setPendingPayload(payload)`
- [ ] **8.8** Set `showManualEditWarning` to true
- [ ] **8.9** Return early (don't call onSave yet)
- [ ] **8.10** If `result.hasManualEdits` is false, proceed with normal save
- [ ] **8.11** Call: `await onSave(payload)`
- [ ] **8.12** Update useCallback dependencies to include `checkForManualEdits` and `articleData.id`

---

### Task 9: Implement dialog handlers in InstructionEditor
**Estimated effort**: 0.5 hours

- [ ] **9.1** Create `handleKeepManualEdits` function using `useCallback`
- [ ] **9.2** Check if `pendingPayload` is null - return early if so
- [ ] **9.3** Set `saveMode` to 'skip'
- [ ] **9.4** Wrap in try-finally block
- [ ] **9.5** In try, call `onSave` with payload: `{ ...pendingPayload, skipRetranslation: true }`
- [ ] **9.6** Close dialog: `setShowManualEditWarning(false)`
- [ ] **9.7** Clear pending: `setPendingPayload(null)`
- [ ] **9.8** In finally, reset saveMode: `setSaveMode(null)`
- [ ] **9.9** Create `handleOverwriteManualEdits` function using `useCallback`
- [ ] **9.10** Same structure as handleKeepManualEdits but pass `{ ...pendingPayload, forceRetranslation: true }`
- [ ] **9.11** Create `handleCancelWarning` function using `useCallback`
- [ ] **9.12** Close dialog: `setShowManualEditWarning(false)`
- [ ] **9.13** Clear states: `setPendingPayload(null)` and `setManuallyEditedLanguages([])`
- [ ] **9.14** Add dependencies to all useCallback calls

---

### Task 10: Render ManualEditWarningDialog in InstructionEditor
**Estimated effort**: 0.2 hours

- [ ] **10.1** Locate the component return statement in InstructionEditor
- [ ] **10.2** Before closing div, add ManualEditWarningDialog component
- [ ] **10.3** Pass prop: `isOpen={showManualEditWarning}`
- [ ] **10.4** Pass prop: `manuallyEditedLanguages={manuallyEditedLanguages}`
- [ ] **10.5** Pass prop: `onKeepManual={handleKeepManualEdits}`
- [ ] **10.6** Pass prop: `onOverwrite={handleOverwriteManualEdits}`
- [ ] **10.7** Pass prop: `onCancel={handleCancelWarning}`
- [ ] **10.8** Pass prop: `loading={saveMode}`
- [ ] **10.9** Pass prop: `entityType="article"`

---

### Task 11: Update save button loading state in InstructionEditor
**Estimated effort**: 0.3 hours

- [ ] **11.1** Locate save button in InstructionEditor component
- [ ] **11.2** Update disabled condition to include: `disabled={isSaving || isChecking}`
- [ ] **11.3** Add conditional button content based on `isChecking`
- [ ] **11.4** If `isChecking`, show Loader2 icon with text: `t('checkingTranslations')`
- [ ] **11.5** If `isSaving`, show Loader2 icon with text: `t('saving')`
- [ ] **11.6** Otherwise, show normal save text: `t('save')`
- [ ] **11.7** Import Loader2 icon from lucide-react if not already imported

---

### Task 12: Update ItemForm types to support translation flags
**Estimated effort**: 0.2 hours

- [ ] **12.1** Open file `/src/types/index.ts`
- [ ] **12.2** Locate `UpdateItemRequest` interface
- [ ] **12.3** Add optional property: `skipRetranslation?: boolean`
- [ ] **12.4** Add JSDoc: "If true, skip re-translation. Existing translations become stale."
- [ ] **12.5** Add optional property: `forceRetranslation?: boolean`
- [ ] **12.6** Add JSDoc: "If true, queue re-translation for all languages, overwriting manual edits."
- [ ] **12.7** Run `npm run typecheck`

---

### Task 13: Add state and imports to ItemForm component
**Estimated effort**: 0.3 hours

- [ ] **13.1** Open file `/src/components/ItemForm.tsx`
- [ ] **13.2** Import ManualEditWarningDialog
- [ ] **13.3** Import useManualEditCheck hook
- [ ] **13.4** Import SupportedLanguage type
- [ ] **13.5** Add hook call: `const { checkForManualEdits, isChecking } = useManualEditCheck()`
- [ ] **13.6** Add state: `const [showManualEditWarning, setShowManualEditWarning] = useState(false)`
- [ ] **13.7** Add state: `const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<SupportedLanguage[]>([])`
- [ ] **13.8** Add state: `const [pendingItemData, setPendingItemData] = useState<any>(null)`
- [ ] **13.9** Add state: `const [saveMode, setSaveMode] = useState<'skip' | 'overwrite' | null>(null)`

---

### Task 14: Update handleSubmit function in ItemForm
**Estimated effort**: 1 hour

- [ ] **14.1** Locate `handleSubmit` function in ItemForm component
- [ ] **14.2** Keep existing validation and itemData construction
- [ ] **14.3** After itemData is constructed, check if editing existing item: `if (item?.id)`
- [ ] **14.4** If editing, call: `const result = await checkForManualEdits({ entityType: 'item', entityId: item.id })`
- [ ] **14.5** Check if `result.hasManualEdits` is true
- [ ] **14.6** If true, set `manuallyEditedLanguages` state
- [ ] **14.7** Set `pendingItemData` state: `setPendingItemData({ ...itemData, id: item.id })`
- [ ] **14.8** Set `showManualEditWarning` to true
- [ ] **14.9** Return early
- [ ] **14.10** If no manual edits or new item, proceed with normal save
- [ ] **14.11** Call `onSave` with appropriate type (CreateItemRequest or UpdateItemRequest)

---

### Task 15: Implement dialog handlers in ItemForm
**Estimated effort**: 0.5 hours

- [ ] **15.1** Create `handleKeepManualEdits` function
- [ ] **15.2** Check if `pendingItemData` is null - return early if so
- [ ] **15.3** Set `saveMode` to 'skip'
- [ ] **15.4** Wrap in try-finally block
- [ ] **15.5** Call `onSave` with `{ ...pendingItemData, skipRetranslation: true }` cast to UpdateItemRequest
- [ ] **15.6** Close dialog and clear states
- [ ] **15.7** In finally, reset saveMode
- [ ] **15.8** Create `handleOverwriteManualEdits` function with same pattern
- [ ] **15.9** Pass `{ ...pendingItemData, forceRetranslation: true }`
- [ ] **15.10** Create `handleCancelWarning` function
- [ ] **15.11** Close dialog and clear all states

---

### Task 16: Render ManualEditWarningDialog in ItemForm
**Estimated effort**: 0.2 hours

- [ ] **16.1** Locate the form return statement in ItemForm
- [ ] **16.2** Before closing form tag, add ManualEditWarningDialog component
- [ ] **16.3** Pass all required props (isOpen, manuallyEditedLanguages, callbacks, loading, entityType='item')
- [ ] **16.4** Verify component placement doesn't break form layout

---

### Task 17: Update submit button loading state in ItemForm
**Estimated effort**: 0.3 hours

- [ ] **17.1** Locate submit button in ItemForm
- [ ] **17.2** Update disabled condition: `disabled={loading || isChecking}`
- [ ] **17.3** Add conditional button content based on `isChecking`
- [ ] **17.4** Show "Checking translations..." when `isChecking`
- [ ] **17.5** Show "Saving..." when `loading`
- [ ] **17.6** Show normal text otherwise
- [ ] **17.7** Import Loader2 icon if needed

---

### Task 18: Update article API endpoint to process translation flags
**Estimated effort**: 0.5 hours

- [ ] **18.1** Open file `/src/app/api/articles/[id]/route.ts`
- [ ] **18.2** Locate the PUT handler function
- [ ] **18.3** In request body parsing, destructure new flags: `const { title, links, itemTags, skipRetranslation = false, forceRetranslation = false } = body`
- [ ] **18.4** After article update succeeds, add conditional translation logic
- [ ] **18.5** If `skipRetranslation === true`, log message and skip translation
- [ ] **18.6** If `forceRetranslation === true`, queue re-translation for all languages
- [ ] **18.7** Call translation API: `POST /api/translations/translate` with `{ entityType: 'article', entityId, forceRetranslate: true }`
- [ ] **18.8** Handle translation errors gracefully (log but don't fail the update)
- [ ] **18.9** If neither flag, use existing translation behavior (default)
- [ ] **18.10** Add comments explaining each branch

---

### Task 19: Update item API endpoint to process translation flags
**Estimated effort**: 0.5 hours

- [ ] **19.1** Open file `/src/app/api/items/[id]/route.ts`
- [ ] **19.2** Locate the PUT handler function
- [ ] **19.3** In request body parsing, add: `skipRetranslation = false, forceRetranslation = false`
- [ ] **19.4** After item update succeeds, add conditional translation logic
- [ ] **19.5** If `skipRetranslation === true`, log and skip
- [ ] **19.6** If `forceRetranslation === true`, call translation API
- [ ] **19.7** POST to `/api/translations/translate` with `{ entityType: 'item', entityId, forceRetranslate: true }`
- [ ] **19.8** Handle errors gracefully
- [ ] **19.9** Add comments explaining behavior

---

### Task 20: Add English translation keys to messages/en.json
**Estimated effort**: 0.2 hours

- [ ] **20.1** Open file `/messages/en.json`
- [ ] **20.2** Locate or create `articles.instructionEditor` namespace
- [ ] **20.3** Add key: `"checkingTranslations": "Checking translations..."`
- [ ] **20.4** Add key: `"translationCheckFailed": "Failed to check translations. Proceeding with save."`
- [ ] **20.5** Locate or create `items.form` namespace
- [ ] **20.6** Add key: `"checkingTranslations": "Checking translations..."`
- [ ] **20.7** Add key: `"translationCheckFailed": "Failed to check translations. Proceeding with save."`
- [ ] **20.8** Verify JSON syntax is valid

---

### Task 21: Add Spanish translation keys to messages/es.json
**Estimated effort**: 0.1 hours

- [ ] **21.1** Open file `/messages/es.json`
- [ ] **21.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Verificando traducciones..."`
- [ ] **21.3** Add: `"translationCheckFailed": "Error al verificar traducciones. Continuando con guardar."`
- [ ] **21.4** Add same keys to `items.form` namespace
- [ ] **21.5** Verify JSON syntax

---

### Task 22: Add French translation keys to messages/fr.json
**Estimated effort**: 0.1 hours

- [ ] **22.1** Open file `/messages/fr.json`
- [ ] **22.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Vérification des traductions..."`
- [ ] **22.3** Add: `"translationCheckFailed": "Échec de la vérification des traductions. Enregistrement en cours."`
- [ ] **22.4** Add same keys to `items.form`
- [ ] **22.5** Verify JSON syntax

---

### Task 23: Add German translation keys to messages/de.json
**Estimated effort**: 0.1 hours

- [ ] **23.1** Open file `/messages/de.json`
- [ ] **23.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Übersetzungen prüfen..."`
- [ ] **23.3** Add: `"translationCheckFailed": "Fehler beim Überprüfen der Übersetzungen. Speichern wird fortgesetzt."`
- [ ] **23.4** Add same keys to `items.form`
- [ ] **23.5** Verify JSON syntax

---

### Task 24: Add Italian translation keys to messages/it.json
**Estimated effort**: 0.1 hours

- [ ] **24.1** Open file `/messages/it.json`
- [ ] **24.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Verifica traduzioni..."`
- [ ] **24.3** Add: `"translationCheckFailed": "Impossibile verificare le traduzioni. Salvataggio in corso."`
- [ ] **24.4** Add same keys to `items.form`
- [ ] **24.5** Verify JSON syntax

---

### Task 25: Add Dutch translation keys to messages/nl.json
**Estimated effort**: 0.1 hours

- [ ] **25.1** Open file `/messages/nl.json`
- [ ] **25.2** Add to `articles.instructionEditor`: `"checkingTranslations": "Vertalingen controleren..."`
- [ ] **25.3** Add: `"translationCheckFailed": "Kon vertalingen niet controleren. Doorgaan met opslaan."`
- [ ] **25.4** Add same keys to `items.form`
- [ ] **25.5** Verify JSON syntax

---

### Task 26: Verify TypeScript compilation
**Estimated effort**: 0.2 hours

- [ ] **26.1** Run `npm run typecheck` from project root
- [ ] **26.2** Fix any type errors in useManualEditCheck.ts
- [ ] **26.3** Fix any type errors in InstructionEditor.tsx
- [ ] **26.4** Fix any type errors in ItemForm.tsx
- [ ] **26.5** Fix any type errors related to payload interfaces
- [ ] **26.6** Verify API route type compatibility
- [ ] **26.7** Run `npm run typecheck` again and confirm zero errors

---

### Task 27: Test useManualEditCheck hook with articles
**Estimated effort**: 0.5 hours

- [ ] **27.1** Create test article with manual translations
- [ ] **27.2** Edit article title in InstructionEditor
- [ ] **27.3** Click Save button
- [ ] **27.4** Verify "Checking translations..." appears briefly
- [ ] **27.5** Verify ManualEditWarningDialog appears
- [ ] **27.6** Verify affected languages are listed correctly
- [ ] **27.7** Test with article that has NO manual translations
- [ ] **27.8** Verify dialog does NOT appear
- [ ] **27.9** Verify save proceeds normally

---

### Task 28: Test "Keep manual edits" option in article editor
**Estimated effort**: 0.3 hours

- [ ] **28.1** Edit article with manual translations
- [ ] **28.2** Click Save
- [ ] **28.3** When dialog appears, click "Keep manual edits" button
- [ ] **28.4** Verify article saves successfully
- [ ] **28.5** Verify dialog closes
- [ ] **28.6** Check API request includes `skipRetranslation: true`
- [ ] **28.7** Verify manual translations still exist (not overwritten)
- [ ] **28.8** Verify translations are marked as stale (if stale detection implemented)

---

### Task 29: Test "Re-translate all" option in article editor
**Estimated effort**: 0.3 hours

- [ ] **29.1** Edit article with manual translations
- [ ] **29.2** Click Save
- [ ] **29.3** When dialog appears, click "Re-translate all" button
- [ ] **29.4** Verify article saves successfully
- [ ] **29.5** Verify dialog closes
- [ ] **29.6** Check API request includes `forceRetranslation: true`
- [ ] **29.7** Verify re-translation job is queued
- [ ] **29.8** Verify manual translations will be overwritten

---

### Task 30: Test "Cancel" option in article editor
**Estimated effort**: 0.2 hours

- [ ] **30.1** Edit article with manual translations
- [ ] **30.2** Click Save
- [ ] **30.3** When dialog appears, click "Cancel" button
- [ ] **30.4** Verify dialog closes
- [ ] **30.5** Verify article is NOT saved (changes still in editor)
- [ ] **30.6** Verify editor remains open
- [ ] **30.7** Verify no API calls were made

---

### Task 31: Test useManualEditCheck hook with items
**Estimated effort**: 0.5 hours

- [ ] **31.1** Create test item with manual translations
- [ ] **31.2** Edit item name or description in ItemForm
- [ ] **31.3** Click Save button
- [ ] **31.4** Verify "Checking translations..." appears
- [ ] **31.5** Verify ManualEditWarningDialog appears
- [ ] **31.6** Verify affected languages listed correctly
- [ ] **31.7** Test with NEW item (no translations yet)
- [ ] **31.8** Verify dialog does NOT appear for new items
- [ ] **31.9** Verify save proceeds normally

---

### Task 32: Test all dialog options in item editor
**Estimated effort**: 0.5 hours

- [ ] **32.1** Test "Keep manual edits" - verify item saves with skipRetranslation flag
- [ ] **32.2** Test "Re-translate all" - verify item saves with forceRetranslation flag
- [ ] **32.3** Test "Cancel" - verify save aborted, form remains open
- [ ] **32.4** Verify loading states work correctly
- [ ] **32.5** Verify dialog closes after each action

---

### Task 33: Test error handling and fail-safe behavior
**Estimated effort**: 0.3 hours

- [ ] **33.1** Simulate API error by disconnecting network
- [ ] **33.2** Edit article and click Save
- [ ] **33.3** Verify save proceeds despite translation check failure
- [ ] **33.4** Check console for error log
- [ ] **33.5** Verify no user-facing error blocks the save
- [ ] **33.6** Restore network and verify normal operation

---

### Task 34: Test internationalization for all languages
**Estimated effort**: 0.3 hours

- [ ] **34.1** Set locale to English - verify "Checking translations..." text
- [ ] **34.2** Set locale to Spanish - verify "Verificando traducciones..."
- [ ] **34.3** Set locale to French - verify "Vérification des traductions..."
- [ ] **34.4** Set locale to German - verify "Übersetzungen prüfen..."
- [ ] **34.5** Set locale to Italian - verify "Verifica traduzioni..."
- [ ] **34.6** Set locale to Dutch - verify "Vertalingen controleren..."

---

### Task 35: Test loading states and button disabling
**Estimated effort**: 0.3 hours

- [ ] **35.1** Verify save button disabled during translation check
- [ ] **35.2** Verify save button shows spinner during check
- [ ] **35.3** Verify save button disabled while dialog is open
- [ ] **35.4** Verify appropriate button in dialog shows loading state
- [ ] **35.5** Verify button re-enabled after operation completes

---

### Task 36: Perform production build test
**Estimated effort**: 0.2 hours

- [ ] **36.1** Run `npm run build` from project root
- [ ] **36.2** Verify build succeeds without errors
- [ ] **36.3** Verify no warnings related to new code
- [ ] **36.4** Start production server: `npm start`
- [ ] **36.5** Test article save flow in production mode
- [ ] **36.6** Test item save flow in production mode
- [ ] **36.7** Verify no console errors

---

### Task 37: Code quality and linting
**Estimated effort**: 0.2 hours

- [ ] **37.1** Run `npm run lint` from project root
- [ ] **37.2** Fix any ESLint warnings in useManualEditCheck.ts
- [ ] **37.3** Fix any ESLint warnings in InstructionEditor.tsx
- [ ] **37.4** Fix any ESLint warnings in ItemForm.tsx
- [ ] **37.5** Fix any warnings in API route files
- [ ] **37.6** Verify no unused imports or variables
- [ ] **37.7** Run `npm run lint` again and confirm zero warnings

---

### Task 38: Final documentation and cleanup
**Estimated effort**: 0.2 hours

- [ ] **38.1** Review JSDoc comments for completeness
- [ ] **38.2** Verify hook has clear usage documentation
- [ ] **38.3** Remove any debugging code or console.log statements
- [ ] **38.4** Remove any commented-out code
- [ ] **38.5** Verify all file headers include correct dates
- [ ] **38.6** Create brief summary of integration
- [ ] **38.7** Document fail-safe behavior in comments
- [ ] **38.8** Mark task as complete when all verification passes

---

## Completion Checklist

- [ ] Hook created: `/src/hooks/useManualEditCheck.ts` with full implementation
- [ ] Hook returns `checkForManualEdits`, `isChecking`, `error`, `reset`
- [ ] Hook queries translations API and detects `status === 'manual'`
- [ ] Hook implements fail-safe behavior (returns false on error, allows save)
- [ ] InstructionEditor types updated with `skipRetranslation` and `forceRetranslation` flags
- [ ] InstructionEditor integrated with useManualEditCheck hook
- [ ] InstructionEditor shows ManualEditWarningDialog when manual translations detected
- [ ] InstructionEditor implements all three dialog options (Keep, Re-translate, Cancel)
- [ ] InstructionEditor save button shows "Checking translations..." during check
- [ ] ItemForm types updated with translation flags (UpdateItemRequest interface)
- [ ] ItemForm integrated with useManualEditCheck hook
- [ ] ItemForm shows ManualEditWarningDialog when manual translations detected
- [ ] ItemForm implements all three dialog options
- [ ] ItemForm only checks translations for existing items (not new items)
- [ ] Article API endpoint processes `skipRetranslation` flag correctly
- [ ] Article API endpoint processes `forceRetranslation` flag correctly
- [ ] Item API endpoint processes both translation flags
- [ ] Translation keys added to all 6 locale files (en, es, fr, de, it, nl)
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] All test scenarios pass (articles, items, all dialog options)
- [ ] Error handling works correctly (fail-safe behavior)
- [ ] Loading states display correctly
- [ ] All 6 languages tested and display correctly
- [ ] No console errors or warnings
- [ ] Documentation complete with JSDoc comments

---

**Document Last Modified**: 2026-01-22 23:54

---

**END OF DOCUMENT**
