# Integrate Preview Panel into Item Editor - Detailed Implementation Tasks

**Generated:** 2026-01-23 12:30
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #29)
- Overview: docs/REQ-E05-029-integrate-preview-panel-into-item-editor-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Add Translation State Management to Edit Page

**Context:** The item edit page needs state management to control the TranslationPreviewPanel visibility and track translation status. The page currently manages item data (lines 50-58) but has no translation-related state.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (lines 16-27 for imports, after line 58 for state)

**Estimated effort:** 1 story point

- [ ] **1.1** Add import for TranslationPreviewPanel component at line 23: `import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';`
- [ ] **1.2** Add import for useTranslationStatus hook at line 23: `import { useTranslationStatus } from '@/hooks/useTranslationStatus';`
- [ ] **1.3** Add import for Globe icon at line 21: `import { Globe } from 'lucide-react';`
- [ ] **1.4** Add import for EntityStatusSummary type at line 27: `import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';`
- [ ] **1.5** Add translation panel open state after line 58: `const [isPanelOpen, setIsPanelOpen] = useState(false);`
- [ ] **1.6** Add auto-open flag state after panel open state: `const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);`
- [ ] **1.7** Add useTranslationStatus hook call after state declarations: Initialize with `entityType: 'item'`, `entityId: publicId`, and `enabled: !!publicId && !loading`
- [ ] **1.8** Destructure hook return values as `status: translationStatus`, `isLoading: statusLoading`, and `refetch: refetchStatus`
- [ ] **1.9** Run `npx tsc --noEmit` to verify no TypeScript errors in state additions
- [ ] **1.10** Verify all imports resolve correctly and modules exist

---

## 2. Implement Auto-Open Logic with useEffect

**Context:** The panel should automatically open after save when translations need attention (pending, failed, or has_failures status). This requires a useEffect that responds to the shouldAutoOpenPanel flag and checks translation status.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (after line 132, before handleCancel)

**Estimated effort:** 1 story point

- [ ] **2.1** Add useEffect hook after existing useEffect for fetchItem (around line 132) to implement auto-open logic
- [ ] **2.2** Check if `shouldAutoOpenPanel` is true and `translationStatus` exists before proceeding
- [ ] **2.3** Create boolean `shouldOpen` that evaluates to true if: `translationStatus.pendingCount > 0`, OR `translationStatus.failedCount > 0`, OR `translationStatus.status === 'pending'`, OR `translationStatus.status === 'has_failures'`
- [ ] **2.4** If `shouldOpen` is true, call `setIsPanelOpen(true)` to open the panel
- [ ] **2.5** Add console.log for debugging: `console.log('Auto-opening translation panel:', { pendingCount, failedCount, status })`
- [ ] **2.6** Reset `shouldAutoOpenPanel` to false after checking to prevent repeated opens
- [ ] **2.7** Set useEffect dependencies to `[shouldAutoOpenPanel, translationStatus]`
- [ ] **2.8** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **2.9** Verify logic correctly handles all status states: 'pending', 'has_failures', 'fully_translated', 'not_started'

---

## 3. Update handleSubmit to Trigger Auto-Open

**Context:** After successful item save, we need to refresh translation status and trigger the auto-open check. This enables the panel to automatically display when translations are pending or failed.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (lines 195-196, handleSubmit function)

**Estimated effort:** 1 story point

- [ ] **3.1** Locate the handleSubmit function around line 163 and find the success block at line 195
- [ ] **3.2** After `if (response.success) {` at line 195, add call to `refetchStatus()` to refresh translation status
- [ ] **3.3** After refetchStatus call, add `setShouldAutoOpenPanel(true)` to trigger auto-open check
- [ ] **3.4** Replace immediate redirect with conditional logic: wrap `router.push('/dashboard2/items')` in a setTimeout with 1500ms delay
- [ ] **3.5** Inside setTimeout, check if `!isPanelOpen` before redirecting (only redirect if panel didn't auto-open)
- [ ] **3.6** Add comment explaining the delay allows time for status refresh and panel auto-open decision
- [ ] **3.7** Run `npx tsc --noEmit` to verify no TypeScript errors in modified handleSubmit
- [ ] **3.8** Verify handleSubmit's existing error handling at lines 197-202 remains unchanged

---

## 4. Add Translations Button to Header

**Context:** Add a "Translations" button to the page header (lines 246-255) with status badges. Position it on the right side opposite the back button for balance.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (lines 246-255, header section)

**Estimated effort:** 1 story point

- [ ] **4.1** Locate the header section starting at line 246 with className "mb-6"
- [ ] **4.2** Wrap existing content in a flex container div with classes: `flex items-center justify-between mb-4`
- [ ] **4.3** Move existing back button into a left-side wrapper div
- [ ] **4.4** Keep h1 title below the flex container (outside)
- [ ] **4.5** Create right-side button with onClick handler `() => setIsPanelOpen(true)`
- [ ] **4.6** Add button type attribute: `type="button"` to prevent form submission
- [ ] **4.7** Add disabled prop: `disabled={!publicId || loading}`
- [ ] **4.8** Add button classes: `flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50`
- [ ] **4.9** Inside button, add Globe icon: `<Globe className="w-4 h-4" />`
- [ ] **4.10** Add button text span: `<span>{t('translations')}</span>`
- [ ] **4.11** Add pending count badge: conditionally render if `translationStatus?.pendingCount > 0`, use classes `inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full`, display count
- [ ] **4.12** Add failed count badge: conditionally render if `translationStatus?.failedCount > 0`, use classes `inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full`, display count
- [ ] **4.13** Run `npx tsc --noEmit` to verify no TypeScript errors in JSX

---

## 5. Add TranslationPreviewPanel Component Integration

**Context:** Integrate the TranslationPreviewPanel component after the form closing tag with all necessary event handlers (onClose, onEdit, onRetranslate, onRetry).

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (after line 369, after form closing tag)

**Estimated effort:** 1 story point

- [ ] **5.1** Locate the form closing tag `</form>` around line 369
- [ ] **5.2** After the form closing tag but before the page container closing `</div>`, add TranslationPreviewPanel component
- [ ] **5.3** Set `entityId` prop to `publicId` variable
- [ ] **5.4** Set `entityType` prop to `"item"` (string literal)
- [ ] **5.5** Set `isOpen` prop to `isPanelOpen` state variable
- [ ] **5.6** Set `onClose` prop to arrow function: `() => setIsPanelOpen(false)`
- [ ] **5.7** Implement `onEdit` handler: accept `language` parameter and navigate to `/dashboard2/translations/item/${publicId}/${language}/edit` using router.push
- [ ] **5.8** Implement `onRetranslate` handler: create async function accepting `language` parameter
- [ ] **5.9** In onRetranslate: wrap in try-catch, fetch POST `/api/translations/retry` with body `{ entityType: 'item', entityId: publicId, languages: [language] }`
- [ ] **5.10** In onRetranslate: check if response.ok, if true call refetchStatus(), else log error with response.text()
- [ ] **5.11** In onRetranslate catch block: log error to console.error
- [ ] **5.12** Implement `onRetry` handler: duplicate onRetranslate logic (same implementation for retry failed translations)
- [ ] **5.13** Run `npx tsc --noEmit` to verify no TypeScript errors in component integration
- [ ] **5.14** Verify all handler functions are properly typed and async/await syntax is correct

---

## 6. Add Translation Keys to English Locale

**Context:** Add i18n keys for the translations button and related UI text to support English locale in the items.edit namespace.

**Files to modify:**
- `/messages/en.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **6.1** Open `/messages/en.json` and locate the `"items"` object
- [ ] **6.2** Find the `"edit"` sub-object within items
- [ ] **6.3** Add new key `"translations"` with value `"Translations"`
- [ ] **6.4** Add new key `"translationsTooltip"` with value `"View and manage translations for this item"`
- [ ] **6.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# translation pending} other {# translations pending}}"`
- [ ] **6.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# translation failed} other {# translations failed}}"`
- [ ] **6.7** Add new key `"translationStatus"` with value `"{completed} of {total} languages translated"`
- [ ] **6.8** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **6.9** Run `npm run build` to verify i18n keys are loaded correctly

---

## 7. Add Translation Keys to Spanish Locale

**Context:** Add i18n keys for the translations button and related UI text to support Spanish locale.

**Files to modify:**
- `/messages/es.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **7.1** Open `/messages/es.json` and locate the `"items"` object
- [ ] **7.2** Find the `"edit"` sub-object within items
- [ ] **7.3** Add new key `"translations"` with value `"Traducciones"`
- [ ] **7.4** Add new key `"translationsTooltip"` with value `"Ver y gestionar traducciones para este elemento"`
- [ ] **7.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traducción pendiente} other {# traducciones pendientes}}"`
- [ ] **7.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# traducción fallida} other {# traducciones fallidas}}"`
- [ ] **7.7** Add new key `"translationStatus"` with value `"{completed} de {total} idiomas traducidos"`
- [ ] **7.8** Verify JSON syntax is valid
- [ ] **7.9** Run `npm run build` to verify Spanish translations load correctly

---

## 8. Add Translation Keys to French Locale

**Context:** Add i18n keys for the translations button and related UI text to support French locale.

**Files to modify:**
- `/messages/fr.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **8.1** Open `/messages/fr.json` and locate the `"items"` object
- [ ] **8.2** Find the `"edit"` sub-object within items
- [ ] **8.3** Add new key `"translations"` with value `"Traductions"`
- [ ] **8.4** Add new key `"translationsTooltip"` with value `"Voir et gérer les traductions pour cet élément"`
- [ ] **8.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traduction en attente} other {# traductions en attente}}"`
- [ ] **8.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# traduction échouée} other {# traductions échouées}}"`
- [ ] **8.7** Add new key `"translationStatus"` with value `"{completed} sur {total} langues traduites"`
- [ ] **8.8** Verify JSON syntax is valid
- [ ] **8.9** Run `npm run build` to verify French translations load correctly

---

## 9. Add Translation Keys to German Locale

**Context:** Add i18n keys for the translations button and related UI text to support German locale.

**Files to modify:**
- `/messages/de.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **9.1** Open `/messages/de.json` and locate the `"items"` object
- [ ] **9.2** Find the `"edit"` sub-object within items
- [ ] **9.3** Add new key `"translations"` with value `"Übersetzungen"`
- [ ] **9.4** Add new key `"translationsTooltip"` with value `"Übersetzungen für dieses Element anzeigen und verwalten"`
- [ ] **9.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# Übersetzung ausstehend} other {# Übersetzungen ausstehend}}"`
- [ ] **9.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# Übersetzung fehlgeschlagen} other {# Übersetzungen fehlgeschlagen}}"`
- [ ] **9.7** Add new key `"translationStatus"` with value `"{completed} von {total} Sprachen übersetzt"`
- [ ] **9.8** Verify JSON syntax is valid
- [ ] **9.9** Run `npm run build` to verify German translations load correctly

---

## 10. Add Translation Keys to Italian Locale

**Context:** Add i18n keys for the translations button and related UI text to support Italian locale. NOTE: This codebase uses 'it' (Italian), NOT 'pt' (Portuguese).

**Files to modify:**
- `/messages/it.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/messages/it.json` and locate the `"items"` object
- [ ] **10.2** Find the `"edit"` sub-object within items
- [ ] **10.3** Add new key `"translations"` with value `"Traduzioni"`
- [ ] **10.4** Add new key `"translationsTooltip"` with value `"Visualizza e gestisci le traduzioni per questo elemento"`
- [ ] **10.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traduzione in sospeso} other {# traduzioni in sospeso}}"`
- [ ] **10.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# traduzione fallita} other {# traduzioni fallite}}"`
- [ ] **10.7** Add new key `"translationStatus"` with value `"{completed} di {total} lingue tradotte"`
- [ ] **10.8** Verify JSON syntax is valid
- [ ] **10.9** Run `npm run build` to verify Italian translations load correctly

---

## 11. Add Translation Keys to Dutch Locale

**Context:** Add i18n keys for the translations button and related UI text to support Dutch locale.

**Files to modify:**
- `/messages/nl.json` (items.edit namespace)

**Estimated effort:** 1 story point

- [ ] **11.1** Open `/messages/nl.json` and locate the `"items"` object
- [ ] **11.2** Find the `"edit"` sub-object within items
- [ ] **11.3** Add new key `"translations"` with value `"Vertalingen"`
- [ ] **11.4** Add new key `"translationsTooltip"` with value `"Vertalingen voor dit item bekijken en beheren"`
- [ ] **11.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# vertaling in behandeling} other {# vertalingen in behandeling}}"`
- [ ] **11.6** Add new key `"failedTranslations"` with value `"{count, plural, one {# vertaling mislukt} other {# vertalingen mislukt}}"`
- [ ] **11.7** Add new key `"translationStatus"` with value `"{completed} van {total} talen vertaald"`
- [ ] **11.8** Verify JSON syntax is valid
- [ ] **11.9** Run `npm run build` to verify Dutch translations load correctly

---

## 12. Create Integration Test File Structure

**Context:** Set up the test file structure for integration tests that verify translation panel integration behavior in the item editor.

**Files to create:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **12.1** Create `__tests__` directory at `/src/app/dashboard2/items/[publicId]/edit/` if it doesn't exist
- [ ] **12.2** Create new file `page.integration.test.tsx` in the __tests__ directory
- [ ] **12.3** Add import for React testing library: `import { render, screen, waitFor, fireEvent } from '@testing-library/react';`
- [ ] **12.4** Add import for user-event: `import userEvent from '@testing-library/user-event';`
- [ ] **12.5** Add import for vitest: `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';`
- [ ] **12.6** Add import for the edit page component: `import EditItemPage from '../page';`
- [ ] **12.7** Add imports for mocking next/navigation, AuthContext, next-intl, and useTranslationStatus
- [ ] **12.8** Set up describe block: `describe('EditItemPage - Translation Panel Integration', () => { ... })`
- [ ] **12.9** Add beforeEach hook to set up common mocks (router, auth, API responses, translation status)
- [ ] **12.10** Add afterEach hook to clean up mocks with `vi.clearAllMocks()`
- [ ] **12.11** Verify test file runs without errors: `npm test page.integration.test`

---

## 13. Add Rendering Tests for Translations Button

**Context:** Verify that the translations button renders correctly in the item editor header with proper icon, label, and click behavior.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Add test case: `it('renders translations button in header', async () => { ... })`
- [ ] **13.2** Mock adminApi.getItem to return valid item with publicId
- [ ] **13.3** Mock useTranslationStatus to return status with no pending/failed translations
- [ ] **13.4** Render EditItemPage component
- [ ] **13.5** Wait for loading to complete using waitFor
- [ ] **13.6** Assert translations button is visible: `expect(screen.getByRole('button', { name: /translations/i })).toBeInTheDocument()`
- [ ] **13.7** Assert Globe icon is rendered within button
- [ ] **13.8** Add test case: `it('opens TranslationPreviewPanel when translations button is clicked', async () => { ... })`
- [ ] **13.9** Render component and wait for loading
- [ ] **13.10** Click translations button using userEvent.click or fireEvent.click
- [ ] **13.11** Assert TranslationPreviewPanel becomes visible (check for panel via test ID or role)
- [ ] **13.12** Add test case: `it('disables translations button when publicId is missing', async () => { ... })`
- [ ] **13.13** Mock params to return empty publicId
- [ ] **13.14** Assert button has disabled attribute
- [ ] **13.15** Run `npm test page.integration.test` to verify rendering tests pass

---

## 14. Add Status Badge Display Tests

**Context:** Verify that pending and failed count badges display correctly on the translations button based on translation status.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Add test case: `it('displays pending count badge when pendingCount > 0', async () => { ... })`
- [ ] **14.2** Mock useTranslationStatus to return `{ status: { pendingCount: 3, failedCount: 0, completedCount: 3 }, isLoading: false, refetch: vi.fn() }`
- [ ] **14.3** Render component and wait for loading
- [ ] **14.4** Assert badge with text "3" is visible and has blue styling (check for bg-blue-100 class or blue color)
- [ ] **14.5** Add test case: `it('displays failed count badge when failedCount > 0', async () => { ... })`
- [ ] **14.6** Mock useTranslationStatus to return `{ status: { pendingCount: 0, failedCount: 2, completedCount: 4 }, isLoading: false, refetch: vi.fn() }`
- [ ] **14.7** Render component and wait for loading
- [ ] **14.8** Assert badge with text "2" is visible and has red styling (check for bg-red-100 class or red color)
- [ ] **14.9** Add test case: `it('displays both badges when both counts are > 0', async () => { ... })`
- [ ] **14.10** Mock useTranslationStatus with both pendingCount: 2 and failedCount: 1
- [ ] **14.11** Assert both badges are visible with correct counts
- [ ] **14.12** Add test case: `it('shows no badges when all translations complete', async () => { ... })`
- [ ] **14.13** Mock useTranslationStatus with `pendingCount: 0, failedCount: 0, status: 'fully_translated'`
- [ ] **14.14** Assert no badges are rendered
- [ ] **14.15** Run `npm test page.integration.test` to verify badge tests pass

---

## 15. Add Auto-Open Behavior Tests

**Context:** Verify that the panel automatically opens after save when translations need attention, and does not open when translations are complete.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Add test case: `it('auto-opens panel after save when pendingCount > 0', async () => { ... })`
- [ ] **15.2** Mock adminApi.updateItem to succeed and mock refetchStatus to update status with `pendingCount: 3`
- [ ] **15.3** Render component, fill in form fields (name, description), and trigger save by clicking Save button
- [ ] **15.4** Wait for save to complete and assert panel becomes visible (check isPanelOpen state or panel rendering)
- [ ] **15.5** Add test case: `it('auto-opens panel after save when failedCount > 0', async () => { ... })`
- [ ] **15.6** Mock refetchStatus to return status with `failedCount: 1`
- [ ] **15.7** Trigger save and assert panel auto-opens
- [ ] **15.8** Add test case: `it('auto-opens panel when status is pending', async () => { ... })`
- [ ] **15.9** Mock refetchStatus to return `status: 'pending'`
- [ ] **15.10** Trigger save and assert panel auto-opens
- [ ] **15.11** Add test case: `it('auto-opens panel when status is has_failures', async () => { ... })`
- [ ] **15.12** Mock refetchStatus to return `status: 'has_failures'`
- [ ] **15.13** Trigger save and assert panel auto-opens
- [ ] **15.14** Add test case: `it('does NOT auto-open when status is fully_translated', async () => { ... })`
- [ ] **15.15** Mock refetchStatus to return `status: 'fully_translated', pendingCount: 0, failedCount: 0`
- [ ] **15.16** Trigger save and assert panel remains closed (redirect should occur after delay)
- [ ] **15.17** Add test case: `it('auto-open only triggers once per save', async () => { ... })`
- [ ] **15.18** Mock multiple status updates (simulate polling) after save
- [ ] **15.19** Verify panel opens exactly once, not on subsequent status refreshes
- [ ] **15.20** Run `npm test page.integration.test` to verify auto-open tests pass

---

## 16. Add Panel Interaction Tests

**Context:** Verify that panel event handlers (onClose, onEdit, onRetranslate, onRetry) work correctly and trigger expected API calls and navigation.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Add test case: `it('closes panel when onClose is called', async () => { ... })`
- [ ] **16.2** Render component, open panel, and click close button (or trigger onClose)
- [ ] **16.3** Assert panel is no longer visible after close
- [ ] **16.4** Add test case: `it('navigates to translation edit page when onEdit is called', async () => { ... })`
- [ ] **16.5** Mock router.push and render component with open panel
- [ ] **16.6** Trigger onEdit handler with language "fr"
- [ ] **16.7** Assert router.push was called with `/dashboard2/translations/item/${publicId}/fr/edit`
- [ ] **16.8** Add test case: `it('calls retry API and refetches status when onRetranslate is called', async () => { ... })`
- [ ] **16.9** Mock global.fetch to return successful response for `/api/translations/retry`
- [ ] **16.10** Mock refetchStatus function to track calls
- [ ] **16.11** Trigger onRetranslate with language "es"
- [ ] **16.12** Assert fetch was called with correct POST payload: `{ entityType: 'item', entityId: publicId, languages: ['es'] }`
- [ ] **16.13** Assert refetchStatus was called after successful fetch
- [ ] **16.14** Add test case: `it('calls retry API when onRetry is called', async () => { ... })`
- [ ] **16.15** Mock fetch and refetchStatus similar to onRetranslate test
- [ ] **16.16** Trigger onRetry with language "de"
- [ ] **16.17** Assert fetch and refetchStatus are called correctly
- [ ] **16.18** Run `npm test page.integration.test` to verify interaction tests pass

---

## 17. Add Error Handling Tests

**Context:** Verify that the component handles errors gracefully, including API failures for translation status and retry operations.

**Files to modify:**
- `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Add test case: `it('handles translation status fetch errors gracefully', async () => { ... })`
- [ ] **17.2** Mock useTranslationStatus to return error state or null status
- [ ] **17.3** Render component and assert translations button still renders
- [ ] **17.4** Assert no badges are shown when status is unavailable
- [ ] **17.5** Assert page functions normally (can edit and save item)
- [ ] **17.6** Add test case: `it('handles retry API errors gracefully', async () => { ... })`
- [ ] **17.7** Mock global.fetch to reject or return error response for `/api/translations/retry`
- [ ] **17.8** Trigger onRetranslate and assert error is caught and logged (check console.error spy)
- [ ] **17.9** Assert panel remains open and functional after error
- [ ] **17.10** Add test case: `it('logs error when re-translate fails', async () => { ... })`
- [ ] **17.11** Spy on console.error
- [ ] **17.12** Mock fetch to return `{ ok: false }` response
- [ ] **17.13** Trigger onRetranslate
- [ ] **17.14** Assert console.error was called with appropriate error message
- [ ] **17.15** Run `npm test page.integration.test` to verify error handling tests pass

---

## 18. Manual Test: Button Visibility and Interaction

**Context:** Manually verify that the translations button is visible in the item editor header and opens the panel when clicked.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **18.1** Start development server: `npm run dev`
- [ ] **18.2** Navigate to an item edit page: `/dashboard2/items/{valid-publicId}/edit`
- [ ] **18.3** Verify "Translations" button is visible in the header on the right side
- [ ] **18.4** Verify button shows Globe icon on the left of the text
- [ ] **18.5** Click the translations button
- [ ] **18.6** Verify TranslationPreviewPanel opens (slide-out or overlay)
- [ ] **18.7** Verify panel displays item translations for all 6 languages
- [ ] **18.8** Close the panel by clicking the X button
- [ ] **18.9** Verify panel closes and editor remains functional
- [ ] **18.10** Reopen panel by clicking button again and verify consistent behavior

---

## 19. Manual Test: Status Badges

**Context:** Manually verify that pending and failed count badges display correctly on the translations button.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Edit an item's name or description to trigger new translations
- [ ] **19.2** Click Save button to save changes
- [ ] **19.3** Wait a moment for translation status to update (page should stay on editor due to setTimeout)
- [ ] **19.4** Verify pending count badge appears on translations button (e.g., blue badge with "6")
- [ ] **19.5** Verify badge color is blue with proper contrast (bg-blue-100, text-blue-800)
- [ ] **19.6** Wait for translations to complete or simulate a translation failure
- [ ] **19.7** If failure occurs, verify failed count badge appears in red (bg-red-100, text-red-800)
- [ ] **19.8** Open translations panel and verify counts match badge numbers
- [ ] **19.9** After all translations complete, verify badges disappear from button
- [ ] **19.10** Verify button remains clickable and functional throughout status changes

---

## 20. Manual Test: Auto-Open After Save

**Context:** Manually verify that the translation panel automatically opens after saving when translations are pending or failed.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **20.1** Navigate to item edit page
- [ ] **20.2** Edit the item name or description
- [ ] **20.3** Click Save button
- [ ] **20.4** Verify the panel automatically opens after save completes (translations are now pending)
- [ ] **20.5** Verify panel shows translation status for all 6 languages with "pending" indicators
- [ ] **20.6** Close the panel manually
- [ ] **20.7** Edit the item again and save
- [ ] **20.8** Verify panel auto-opens again (should open once per save)
- [ ] **20.9** Wait for all translations to complete (status becomes "fully_translated")
- [ ] **20.10** Edit item again, save, and verify page redirects to list after 1.5 second delay (no auto-open)
- [ ] **20.11** Verify page stays on editor when panel auto-opens (no immediate redirect)

---

## 21. Manual Test: Panel Actions

**Context:** Manually verify that the panel action handlers work correctly for editing, re-translating, and retrying translations.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Open translations panel from item editor
- [ ] **21.2** Click "Edit" button for French translation in the panel
- [ ] **21.3** Verify navigation to translation edit page: `/dashboard2/translations/item/{publicId}/fr/edit` (or shows TODO/404 if page doesn't exist)
- [ ] **21.4** Return to item editor and reopen panel
- [ ] **21.5** Click "Re-translate" button for Spanish translation
- [ ] **21.6** Verify re-translation is triggered (check network tab for POST to `/api/translations/retry`)
- [ ] **21.7** Verify API payload includes: `{ entityType: 'item', entityId: '{publicId}', languages: ['es'] }`
- [ ] **21.8** Verify translation status refreshes after re-translate (Spanish shows "pending")
- [ ] **21.9** Simulate or wait for a translation failure
- [ ] **21.10** Click "Retry" button for failed translation
- [ ] **21.11** Verify retry API is called with correct payload
- [ ] **21.12** Verify status refreshes and failed translation moves to "pending"
- [ ] **21.13** Verify panel remains open and functional throughout all actions

---

## 22. Manual Test: Panel Closing Methods

**Context:** Manually verify that the panel can be closed via multiple methods: close button, ESC key, and clicking outside (if supported).

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Open translations panel from item editor
- [ ] **22.2** Click the close button (X icon) in the panel header
- [ ] **22.3** Verify panel closes smoothly with animation
- [ ] **22.4** Reopen panel via translations button
- [ ] **22.5** Press ESC key on keyboard
- [ ] **22.6** Verify panel closes when ESC is pressed (if TranslationPreviewPanel supports this)
- [ ] **22.7** Reopen panel
- [ ] **22.8** Click outside the panel area (on the editor background or overlay if present)
- [ ] **22.9** Verify panel closes when clicking outside (if overlay mode is implemented)
- [ ] **22.10** Verify editor remains functional after closing panel via any method

---

## 23. Manual Test: Error Handling

**Context:** Manually verify that the component handles errors gracefully, including network failures and API errors.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Disconnect from network (go offline) while on item edit page
- [ ] **23.2** Verify translations button still renders (no crash)
- [ ] **23.3** Verify no JavaScript console errors or exceptions
- [ ] **23.4** Verify editor functionality continues to work (can edit fields)
- [ ] **23.5** Reconnect to network
- [ ] **23.6** Simulate retry API error by blocking `/api/translations/retry` in browser DevTools Network tab
- [ ] **23.7** Open panel and click "Re-translate" for any language
- [ ] **23.8** Verify error is caught and logged to console (check for console.error message)
- [ ] **23.9** Verify panel remains functional and doesn't crash
- [ ] **23.10** Remove network block and verify retry works normally again

---

## 24. Manual Test: Responsive Design

**Context:** Manually verify that the translations button and panel render correctly and are usable on mobile and tablet devices.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Open browser DevTools and set viewport to mobile (375x667 - iPhone SE)
- [ ] **24.2** Navigate to item edit page
- [ ] **24.3** Verify translations button and back button both fit in header without overlap
- [ ] **24.4** Verify button text and icon are legible on small screen
- [ ] **24.5** Tap translations button (use mobile touch simulation)
- [ ] **24.6** Verify panel opens and renders correctly on mobile viewport
- [ ] **24.7** Verify panel doesn't exceed screen width or cause horizontal scroll
- [ ] **24.8** Verify panel content is scrollable if needed
- [ ] **24.9** Test on tablet viewport (768x1024 - iPad)
- [ ] **24.10** Verify layout adapts correctly to tablet size
- [ ] **24.11** Verify touch interactions work smoothly (no double-tap issues)
- [ ] **24.12** Test panel close button is accessible and tappable on mobile

---

## 25. Manual Test: i18n Verification

**Context:** Manually verify that all UI text translates correctly when switching between supported locales.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Set UI language to English (en) and navigate to item editor
- [ ] **25.2** Verify translations button displays "Translations" in English
- [ ] **25.3** Switch UI language to Spanish (es)
- [ ] **25.4** Verify button label changes to "Traducciones"
- [ ] **25.5** Switch to French (fr) and verify "Traductions" label
- [ ] **25.6** Switch to German (de) and verify "Übersetzungen" label
- [ ] **25.7** Switch to Italian (it) and verify "Traduzioni" label
- [ ] **25.8** Switch to Dutch (nl) and verify "Vertalingen" label
- [ ] **25.9** For each language, verify pending/failed count text uses correct plural forms
- [ ] **25.10** Verify all locale files load without JSON parsing errors
- [ ] **25.11** Verify no missing translation key warnings in console
- [ ] **25.12** Verify button tooltip (if implemented) translates correctly

---

## 26. Run Full Type Check

**Context:** Verify that all TypeScript types are correct and no compilation errors exist after integration.

**Files to verify:** All modified TypeScript files

**Estimated effort:** 1 story point

- [ ] **26.1** Run `npx tsc --noEmit` from project root
- [ ] **26.2** Verify no TS errors in `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- [ ] **26.3** If errors exist, review and fix type mismatches (e.g., EntityStatusSummary interface usage)
- [ ] **26.4** Verify TranslationPreviewPanel component props match expected types from REQ-E05-007
- [ ] **26.5** Verify useTranslationStatus hook return types are correct (status, isLoading, refetch)
- [ ] **26.6** Verify all event handler function signatures match expected types (onEdit, onRetranslate, onRetry accept language: string)
- [ ] **26.7** Fix any remaining type errors until `npx tsc --noEmit` passes with 0 errors
- [ ] **26.8** Document any known type issues that are non-blocking (with justification)

---

## 27. Run ESLint and Fix Warnings

**Context:** Verify that code follows project linting standards and fix any ESLint warnings.

**Files to verify:** All modified files

**Estimated effort:** 1 story point

- [ ] **27.1** Run `npm run lint` from project root
- [ ] **27.2** Review any ESLint warnings in item edit page component
- [ ] **27.3** Fix unused variable warnings (remove or prefix with underscore if intentionally unused)
- [ ] **27.4** Fix missing dependency warnings in useEffect hooks (add translationStatus to deps if used)
- [ ] **27.5** Fix any accessibility warnings (e.g., missing ARIA labels on buttons)
- [ ] **27.6** Fix any React-specific warnings (e.g., key props in lists, proper event handlers)
- [ ] **27.7** Run `npm run lint` again and verify all warnings are resolved
- [ ] **27.8** Commit lint fixes separately if needed for cleaner history

---

## 28. Run All Tests and Verify Passing

**Context:** Run the full test suite to ensure no existing tests are broken and new integration tests pass.

**Files to verify:** All test files

**Estimated effort:** 1 story point

- [ ] **28.1** Run `npm test` to execute all tests
- [ ] **28.2** Verify all existing tests continue to pass (no regressions)
- [ ] **28.3** Verify new integration tests in `page.integration.test.tsx` pass
- [ ] **28.4** If any tests fail, debug and fix issues (check mocks, assertions, async timing)
- [ ] **28.5** Check test coverage report: `npm run test:coverage` (if available)
- [ ] **28.6** Verify item edit page and translation panel integration code is covered by tests
- [ ] **28.7** Add additional test cases if coverage is below 80% for new code
- [ ] **28.8** Ensure all tests pass before proceeding to build

---

## 29. Run Production Build

**Context:** Verify that the application builds successfully for production with no errors.

**Files to verify:** Build output

**Estimated effort:** 1 story point

- [ ] **29.1** Run `npm run build` from project root
- [ ] **29.2** Verify build completes without errors
- [ ] **29.3** Check for any build warnings and assess severity (translation keys, imports, etc.)
- [ ] **29.4** Fix any critical build warnings that could affect production
- [ ] **29.5** Verify translation keys are properly bundled (check build output for locale files)
- [ ] **29.6** Verify no missing imports or module resolution errors
- [ ] **29.7** Run `npm start` to test production build locally
- [ ] **29.8** Navigate to item edit page and verify translations button works in production build
- [ ] **29.9** Verify no console errors in production mode
- [ ] **29.10** Stop production server after verification

---

## 30. Verify Existing Functionality Preserved

**Context:** Ensure that all existing item editor functionality continues to work correctly after integration changes.

**Files to verify:** Item editor page behavior

**Estimated effort:** 1 story point

- [ ] **30.1** Navigate to item edit page
- [ ] **30.2** Verify item name field loads correctly with existing data
- [ ] **30.3** Verify item description field loads correctly
- [ ] **30.4** Verify RoomSelector component renders and allows room selection
- [ ] **30.5** Verify ItemTypeSelector component renders and allows type selection
- [ ] **30.6** Verify TagsInlineEdit component renders and allows tag editing
- [ ] **30.7** Verify ItemInstructionsList component renders article list
- [ ] **30.8** Edit multiple fields (name, room, type, tags) and click Save
- [ ] **30.9** Verify save completes successfully with all changes persisted
- [ ] **30.10** Verify Cancel button still works and returns to items list
- [ ] **30.11** Verify error handling still works (test with invalid data if possible)
- [ ] **30.12** Verify loading states display correctly during fetch and save operations

---

## Status: PENDING

**Last Modified:** 2026-01-23 12:30

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-007**: TranslationPreviewPanel Component (component must exist and be importable)
- **REQ-E05-011**: useTranslationStatus Hook (hook must exist and return correct types)
- **REQ-E05-001**: Translation Status API (API must return EntityStatusSummary)
- **REQ-E05-003**: Re-Translate API Endpoint (API must accept retry requests)

### Blocks (Requires This First)
- None (this is an integration task that completes Phase 7, Task 7.2)

### Parallel Safety
- **Safe to parallelize with**: REQ-E05-028 (Article editor integration) - different files, no conflicts
- **Files modified**: Item edit page, 6 locale files
- **Conflicts with**: None

---

## Authorized Files for Modification

### Existing Files to Modify
1. `/src/app/dashboard2/items/[publicId]/edit/page.tsx` (main implementation)
2. `/messages/en.json` (English translations)
3. `/messages/es.json` (Spanish translations)
4. `/messages/fr.json` (French translations)
5. `/messages/de.json` (German translations)
6. `/messages/it.json` (Italian translations - NOTE: using 'it', not 'pt')
7. `/messages/nl.json` (Dutch translations)

### New Files to Create
1. `/src/app/dashboard2/items/[publicId]/edit/__tests__/page.integration.test.tsx` (integration tests)

### Files to Reference (No Changes)
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` (component to integrate)
- `/src/hooks/useTranslationStatus.ts` (hook for fetching status)
- `/src/app/api/translations/status/batch/types.ts` (EntityStatusSummary type)
- `/src/app/api/translations/retry/route.ts` (retry API endpoint)

---

## Technical Notes

### Auto-Open Trigger Conditions
Panel auto-opens when ANY of these conditions are true after save:
1. `translationStatus.pendingCount > 0` - Translations in progress
2. `translationStatus.failedCount > 0` - Translations failed
3. `translationStatus.status === 'pending'` - Overall status pending
4. `translationStatus.status === 'has_failures'` - Overall status has failures

Panel does NOT auto-open when:
- `translationStatus.status === 'fully_translated'` - All translations complete
- `translationStatus.status === 'not_started'` - No translations yet
- No translation status available (API error)

### Save Behavior with Conditional Redirect
The implementation uses a setTimeout with 1500ms delay before redirect:
- **Stay on page** if panel auto-opens (checked via `isPanelOpen` state)
- **Redirect to list** after delay if panel didn't open (all translations complete)

This provides optimal UX for translation workflows while preserving list navigation when appropriate.

### Language Support
Supports 6 target languages: `es`, `fr`, `de`, `it`, `nl` (plus `en` as source).

**CRITICAL**: This codebase uses `it` (Italian) as defined in `/src/lib/i18n/config.ts`, NOT `pt` (Portuguese).

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Translations button visible in item editor header (right side)
2. ✅ Button displays Globe icon and "Translations" label (i18n)
3. ✅ Clicking button opens TranslationPreviewPanel
4. ✅ Panel displays correct entityId (publicId) and entityType ("item")
5. ✅ Panel shows translation status for all 6 supported languages
6. ✅ After successful save, translation status is refetched via refetchStatus()
7. ✅ Panel auto-opens after save if pendingCount > 0
8. ✅ Panel auto-opens after save if failedCount > 0
9. ✅ Panel auto-opens after save if status is 'pending' or 'has_failures'
10. ✅ Panel does NOT auto-open if status is 'fully_translated'
11. ✅ Auto-open only triggers once per save operation (not on every status update)
12. ✅ Pending count badge displays on button when pendingCount > 0 (blue badge)
13. ✅ Failed count badge displays on button when failedCount > 0 (red badge)
14. ✅ Both badges can display simultaneously when both counts > 0
15. ✅ Edit action in panel navigates to `/dashboard2/translations/item/{publicId}/{language}/edit`
16. ✅ Re-translate action calls `/api/translations/retry` and refreshes status
17. ✅ Retry action calls `/api/translations/retry` for failed translations and refreshes status
18. ✅ Panel closes via close button (X)
19. ✅ Panel closes via ESC key (if supported by TranslationPreviewPanel)
20. ✅ Panel closes when clicking outside (if overlay mode)
21. ✅ Error state handled gracefully if status fetch fails
22. ✅ Retry/retranslate errors are caught and logged (no UI crash)
23. ✅ Page functions normally if translation features unavailable
24. ✅ Translation keys added for all 6 locales (en, es, fr, de, it, nl)
25. ✅ All locale files load without JSON errors
26. ✅ Button label translates correctly in all 6 languages
27. ✅ Page stays on editor when panel auto-opens (conditional redirect with delay)
28. ✅ Page redirects to list after 1.5s if no auto-open occurs
29. ✅ Page layout is responsive with panel integration
30. ✅ Mobile viewport renders correctly (< 640px)
31. ✅ Button and panel work with touch interactions on mobile
32. ✅ No TypeScript compilation errors (`npx tsc --noEmit` passes)
33. ✅ No ESLint warnings (`npm run lint` passes)
34. ✅ All integration tests pass (`npm test` passes)
35. ✅ Existing item edit functionality preserved (room selector, type selector, tags, save, cancel)
36. ✅ Production build succeeds (`npm run build` passes)

---

**Document Status**: PENDING
**Last Modified**: 2026-01-23 12:30
