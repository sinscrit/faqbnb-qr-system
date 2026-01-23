# Integrate Preview Panel into Article Editor - Detailed Implementation Tasks

**Generated:** 2026-01-23 12:15
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #28)
- Overview: docs/REQ-E05-028-integrate-preview-panel-into-article-editor-overview.md
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

**Context:** The article edit page needs state management to control the TranslationPreviewPanel visibility and track translation status. The page currently manages article data and saving state but has no translation-related state.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 15-38)

**Estimated effort:** 1 story point

- [ ] **1.1** Add import for TranslationPreviewPanel component at line 22: `import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';`
- [ ] **1.2** Add import for useTranslationStatus hook at line 22: `import { useTranslationStatus } from '@/hooks/useTranslationStatus';`
- [ ] **1.3** Add import for Globe icon at line 21: `import { Globe } from 'lucide-react';`
- [ ] **1.4** Add import for EntityStatusSummary type at line 23: `import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';`
- [ ] **1.5** Add import for cn utility after line 23: `import { cn } from '@/lib/utils';`
- [ ] **1.6** Add translation panel open state after line 37: `const [isPanelOpen, setIsPanelOpen] = useState(false);`
- [ ] **1.7** Add auto-open flag state after panel open state: `const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);`
- [ ] **1.8** Add useTranslationStatus hook call after state declarations: Initialize with `entityType: 'article'`, `entityId: articleId`, and `enabled: !!articleId && !loading`
- [ ] **1.9** Destructure hook return values as `status`, `isLoading: statusLoading`, and `refetch: refetchStatus`
- [ ] **1.10** Run `npx tsc --noEmit` to verify no TypeScript errors in state additions
- [ ] **1.11** Verify all imports resolve correctly and modules exist

---

## 2. Implement Auto-Open Logic with useEffect

**Context:** The panel should automatically open after save when translations need attention (pending, failed, or has_failures status). This requires a useEffect that responds to the shouldAutoOpenPanel flag and checks translation status.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (after line 37, before fetchArticleData)

**Estimated effort:** 1 story point

- [ ] **2.1** Add useEffect hook after state declarations (around line 38) to implement auto-open logic
- [ ] **2.2** Check if `shouldAutoOpenPanel` is true and `status` exists before proceeding
- [ ] **2.3** Create boolean `shouldOpen` that evaluates to true if: `status.pendingCount > 0`, OR `status.failedCount > 0`, OR `status.status === 'pending'`, OR `status.status === 'has_failures'`
- [ ] **2.4** If `shouldOpen` is true, call `setIsPanelOpen(true)` to open the panel
- [ ] **2.5** Add console.log for debugging with pendingCount, failedCount, and status values
- [ ] **2.6** Reset `shouldAutoOpenPanel` to false after checking to prevent repeated opens
- [ ] **2.7** Set useEffect dependencies to `[shouldAutoOpenPanel, status]`
- [ ] **2.8** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **2.9** Verify logic correctly handles all status states: 'pending', 'has_failures', 'fully_translated', 'not_started'

---

## 3. Update handleSave to Trigger Auto-Open

**Context:** After successful article save, we need to refresh translation status and trigger the auto-open check. This enables the panel to automatically display when translations are pending or failed.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 171-177, handleSave function)

**Estimated effort:** 1 story point

- [ ] **3.1** Locate the handleSave function around line 124 and find the success block after line 171
- [ ] **3.2** After `console.log('Article updated successfully:', response.data);` (line 171), add call to `refetchStatus()` to refresh translation status
- [ ] **3.3** After refetchStatus call, add `setShouldAutoOpenPanel(true)` to trigger auto-open check
- [ ] **3.4** Modify redirect logic: if `status?.pendingCount || status?.failedCount` is truthy, stay on page (no redirect)
- [ ] **3.5** Add console.log when staying on page: `'Staying on page to show translation panel'`
- [ ] **3.6** Otherwise, keep existing redirect to `'/dashboard2/instructions'`
- [ ] **3.7** Ensure sessionStorage.setItem('editSuccess', 'true') is called before conditional redirect
- [ ] **3.8** Run `npx tsc --noEmit` to verify no TypeScript errors in modified handleSave
- [ ] **3.9** Verify handleSave dependencies array includes all necessary values

---

## 4. Add Translations Button Above Editor

**Context:** Provide manual access to the translation panel via a prominent "Translations" button positioned above the InstructionEditor component. The button should show badges for pending and failed translation counts.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (lines 248-255, return statement)

**Estimated effort:** 1 story point

- [ ] **4.1** Wrap the return statement starting at line 248 with a React fragment `<>...</>`
- [ ] **4.2** Add translations button section wrapper div with classes: `max-w-5xl mx-auto px-4 py-4`
- [ ] **4.3** Add inner flex container div with classes: `flex items-center justify-between`
- [ ] **4.4** Create button with onClick handler `() => setIsPanelOpen(true)`
- [ ] **4.5** Add button classes using `cn()` utility: base classes `'flex items-center gap-2 px-4 py-2 rounded-lg'`, border `'border border-gray-300 bg-white'`, hover `'hover:bg-gray-50 transition-colors'`, text `'text-gray-700 font-medium text-sm'`
- [ ] **4.6** Add aria-label to button: `t('articles.editor.translationsTooltip')`
- [ ] **4.7** Inside button, add Globe icon: `<Globe className="w-4 h-4" />`
- [ ] **4.8** Add button text span: `<span>{t('articles.editor.translations')}</span>`
- [ ] **4.9** Add pending count badge: conditionally render if `status?.pendingCount > 0`, use classes `'inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700'`, display `status.pendingCount`
- [ ] **4.10** Add failed count badge: conditionally render if `status?.failedCount > 0`, use classes `'inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-red-100 text-red-700'`, display `status.failedCount`
- [ ] **4.11** Add loading indicator: conditionally render Loader2 if `statusLoading` is true, use classes `'w-4 h-4 animate-spin text-gray-400'`
- [ ] **4.12** After button section, keep existing InstructionEditor component rendering unchanged
- [ ] **4.13** Run `npx tsc --noEmit` to verify no TypeScript errors in JSX

---

## 5. Add TranslationPreviewPanel Component Integration

**Context:** Integrate the TranslationPreviewPanel component after the InstructionEditor with all necessary event handlers (onClose, onEdit, onRetranslate, onRetry).

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (after InstructionEditor in return statement)

**Estimated effort:** 1 story point

- [ ] **5.1** After the InstructionEditor component (around line 254), add TranslationPreviewPanel component
- [ ] **5.2** Set `entityId` prop to `articleId`
- [ ] **5.3** Set `entityType` prop to `"article"` (string literal)
- [ ] **5.4** Set `isOpen` prop to `isPanelOpen` state variable
- [ ] **5.5** Set `onClose` prop to arrow function: `() => setIsPanelOpen(false)`
- [ ] **5.6** Implement `onEdit` handler: accept `language` parameter and navigate to `/dashboard2/translations/article/${articleId}/${language}/edit` using router.push
- [ ] **5.7** Implement `onRetranslate` handler: create async function accepting `language` parameter
- [ ] **5.8** In onRetranslate: wrap in try-catch, fetch POST `/api/translations/retry` with body `{ entityType: 'article', entityId: articleId, languages: [language] }`
- [ ] **5.9** In onRetranslate: check if response.ok, throw error if not, call refetchStatus() on success, log errors to console
- [ ] **5.10** Implement `onRetry` handler: same logic as onRetranslate (retry failed translation)
- [ ] **5.11** Add TODO comment for future toast notification on retry errors
- [ ] **5.12** Close the React fragment tag after TranslationPreviewPanel
- [ ] **5.13** Run `npx tsc --noEmit` to verify no TypeScript errors in component integration
- [ ] **5.14** Verify all handler functions are properly typed

---

## 6. Add Translation Keys to English Locale

**Context:** Add i18n keys for the translations button and related UI text to support English locale.

**Files to modify:**
- `/messages/en.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **6.1** Open `/messages/en.json` and locate the `"articles"` object
- [ ] **6.2** Find the `"editor"` sub-object within articles
- [ ] **6.3** Add new key `"translations"` with value `"Translations"`
- [ ] **6.4** Add new key `"translationsTooltip"` with value `"View and manage translations for this article"`
- [ ] **6.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# translation pending} other {# translations pending}}"`
- [ ] **6.6** Add new key `"staleTranslations"` with value `"Some translations may be outdated"`
- [ ] **6.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **6.8** Run `npm run build` to verify i18n keys are loaded correctly
- [ ] **6.9** Test that t('articles.editor.translations') resolves to "Translations"

---

## 7. Add Translation Keys to Spanish Locale

**Context:** Add i18n keys for the translations button and related UI text to support Spanish locale.

**Files to modify:**
- `/messages/es.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **7.1** Open `/messages/es.json` and locate the `"articles"` object
- [ ] **7.2** Find the `"editor"` sub-object within articles
- [ ] **7.3** Add new key `"translations"` with value `"Traducciones"`
- [ ] **7.4** Add new key `"translationsTooltip"` with value `"Ver y gestionar las traducciones de este artículo"`
- [ ] **7.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traducción pendiente} other {# traducciones pendientes}}"`
- [ ] **7.6** Add new key `"staleTranslations"` with value `"Algunas traducciones pueden estar desactualizadas"`
- [ ] **7.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **7.8** Run `npm run build` to verify Spanish translations are loaded correctly

---

## 8. Add Translation Keys to French Locale

**Context:** Add i18n keys for the translations button and related UI text to support French locale.

**Files to modify:**
- `/messages/fr.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **8.1** Open `/messages/fr.json` and locate the `"articles"` object
- [ ] **8.2** Find the `"editor"` sub-object within articles
- [ ] **8.3** Add new key `"translations"` with value `"Traductions"`
- [ ] **8.4** Add new key `"translationsTooltip"` with value `"Afficher et gérer les traductions de cet article"`
- [ ] **8.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traduction en attente} other {# traductions en attente}}"`
- [ ] **8.6** Add new key `"staleTranslations"` with value `"Certaines traductions peuvent être obsolètes"`
- [ ] **8.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **8.8** Run `npm run build` to verify French translations are loaded correctly

---

## 9. Add Translation Keys to German Locale

**Context:** Add i18n keys for the translations button and related UI text to support German locale.

**Files to modify:**
- `/messages/de.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **9.1** Open `/messages/de.json` and locate the `"articles"` object
- [ ] **9.2** Find the `"editor"` sub-object within articles
- [ ] **9.3** Add new key `"translations"` with value `"Übersetzungen"`
- [ ] **9.4** Add new key `"translationsTooltip"` with value `"Übersetzungen für diesen Artikel anzeigen und verwalten"`
- [ ] **9.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# Übersetzung ausstehend} other {# Übersetzungen ausstehend}}"`
- [ ] **9.6** Add new key `"staleTranslations"` with value `"Einige Übersetzungen sind möglicherweise veraltet"`
- [ ] **9.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **9.8** Run `npm run build` to verify German translations are loaded correctly

---

## 10. Add Translation Keys to Italian Locale

**Context:** Add i18n keys for the translations button and related UI text to support Italian locale.

**Files to modify:**
- `/messages/it.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/messages/it.json` and locate the `"articles"` object
- [ ] **10.2** Find the `"editor"` sub-object within articles
- [ ] **10.3** Add new key `"translations"` with value `"Traduzioni"`
- [ ] **10.4** Add new key `"translationsTooltip"` with value `"Visualizza e gestisci le traduzioni per questo articolo"`
- [ ] **10.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# traduzione in sospeso} other {# traduzioni in sospeso}}"`
- [ ] **10.6** Add new key `"staleTranslations"` with value `"Alcune traduzioni potrebbero essere obsolete"`
- [ ] **10.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **10.8** Run `npm run build` to verify Italian translations are loaded correctly

---

## 11. Add Translation Keys to Dutch Locale

**Context:** Add i18n keys for the translations button and related UI text to support Dutch locale.

**Files to modify:**
- `/messages/nl.json` (articles.editor namespace)

**Estimated effort:** 1 story point

- [ ] **11.1** Open `/messages/nl.json` and locate the `"articles"` object
- [ ] **11.2** Find the `"editor"` sub-object within articles
- [ ] **11.3** Add new key `"translations"` with value `"Vertalingen"`
- [ ] **11.4** Add new key `"translationsTooltip"` with value `"Bekijk en beheer vertalingen voor dit artikel"`
- [ ] **11.5** Add new key `"pendingTranslations"` with value `"{count, plural, one {# vertaling in behandeling} other {# vertalingen in behandeling}}"`
- [ ] **11.6** Add new key `"staleTranslations"` with value `"Sommige vertalingen kunnen verouderd zijn"`
- [ ] **11.7** Verify JSON syntax is valid (proper commas, no trailing commas before closing braces)
- [ ] **11.8** Run `npm run build` to verify Dutch translations are loaded correctly

---

## 12. Create Integration Test File Structure

**Context:** Set up the test file structure for integration tests that verify translation panel integration behavior.

**Files to create:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **12.1** Create `__tests__` directory at `/src/app/dashboard2/instructions/[articleId]/edit/` if it doesn't exist
- [ ] **12.2** Create new file `page.integration.test.tsx` in the __tests__ directory
- [ ] **12.3** Add import for React testing library: `import { render, screen, waitFor, fireEvent } from '@testing-library/react';`
- [ ] **12.4** Add import for user-event: `import userEvent from '@testing-library/user-event';`
- [ ] **12.5** Add import for vitest: `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';`
- [ ] **12.6** Add import for the edit page component: `import EditArticlePage from '../page';`
- [ ] **12.7** Add imports for mocking router and auth context
- [ ] **12.8** Set up describe block: `describe('EditArticlePage - Translation Panel Integration', () => { ... })`
- [ ] **12.9** Add beforeEach hook to set up common mocks (router, auth, API responses)
- [ ] **12.10** Add afterEach hook to clean up mocks with `vi.clearAllMocks()`
- [ ] **12.11** Verify test file runs without errors: `npm test page.integration.test`

---

## 13. Add Rendering Tests for Translations Button

**Context:** Verify that the translations button renders correctly in the editor interface with proper icon, label, and click behavior.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Add test case: `it('renders translations button in editor interface', async () => { ... })`
- [ ] **13.2** Mock article data fetch to return valid article with ID
- [ ] **13.3** Mock useTranslationStatus to return status with no pending/failed translations
- [ ] **13.4** Render EditArticlePage component
- [ ] **13.5** Wait for loading to complete using waitFor
- [ ] **13.6** Assert translations button is visible: `expect(screen.getByRole('button', { name: /translations/i })).toBeInTheDocument()`
- [ ] **13.7** Assert Globe icon is rendered within button (check for svg or icon class)
- [ ] **13.8** Assert button text displays "Translations" (or translated equivalent)
- [ ] **13.9** Add test case: `it('opens TranslationPreviewPanel when translations button is clicked', async () => { ... })`
- [ ] **13.10** Render component and wait for loading
- [ ] **13.11** Click translations button using userEvent.click
- [ ] **13.12** Assert TranslationPreviewPanel becomes visible (check for panel presence via test ID or role)
- [ ] **13.13** Run `npm test page.integration.test` to verify tests pass

---

## 14. Add Status Badge Display Tests

**Context:** Verify that pending and failed count badges display correctly on the translations button based on translation status.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Add test case: `it('displays pending count badge when pendingCount > 0', async () => { ... })`
- [ ] **14.2** Mock useTranslationStatus to return status with `pendingCount: 3`
- [ ] **14.3** Render component and wait for loading
- [ ] **14.4** Assert badge with text "3" is visible and has blue styling (bg-blue-100 class)
- [ ] **14.5** Add test case: `it('displays failed count badge when failedCount > 0', async () => { ... })`
- [ ] **14.6** Mock useTranslationStatus to return status with `failedCount: 2`
- [ ] **14.7** Render component and wait for loading
- [ ] **14.8** Assert badge with text "2" is visible and has red styling (bg-red-100 class)
- [ ] **14.9** Add test case: `it('displays loading indicator while status is loading', async () => { ... })`
- [ ] **14.10** Mock useTranslationStatus to return `isLoading: true`
- [ ] **14.11** Render component
- [ ] **14.12** Assert Loader2 icon is visible with animate-spin class
- [ ] **14.13** Add test case: `it('shows no badges when all translations complete', async () => { ... })`
- [ ] **14.14** Mock useTranslationStatus with `pendingCount: 0, failedCount: 0, status: 'fully_translated'`
- [ ] **14.15** Render component and assert no badges are displayed
- [ ] **14.16** Run `npm test page.integration.test` to verify all badge tests pass

---

## 15. Add Auto-Open Behavior Tests

**Context:** Verify that the panel automatically opens after save when translations need attention, and does not open when translations are complete.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Add test case: `it('auto-opens panel after save when pendingCount > 0', async () => { ... })`
- [ ] **15.2** Mock article save API to succeed and mock refetchStatus to update status with `pendingCount: 3`
- [ ] **15.3** Render component, fill in form, and trigger save action
- [ ] **15.4** Wait for save to complete and assert panel becomes visible automatically
- [ ] **15.5** Add test case: `it('auto-opens panel after save when failedCount > 0', async () => { ... })`
- [ ] **15.6** Mock refetchStatus to return status with `failedCount: 1`
- [ ] **15.7** Trigger save and assert panel auto-opens
- [ ] **15.8** Add test case: `it('auto-opens panel after save when status is pending', async () => { ... })`
- [ ] **15.9** Mock refetchStatus to return `status: 'pending'`
- [ ] **15.10** Trigger save and assert panel auto-opens
- [ ] **15.11** Add test case: `it('auto-opens panel after save when status is has_failures', async () => { ... })`
- [ ] **15.12** Mock refetchStatus to return `status: 'has_failures'`
- [ ] **15.13** Trigger save and assert panel auto-opens
- [ ] **15.14** Add test case: `it('does NOT auto-open when all translations are complete', async () => { ... })`
- [ ] **15.15** Mock refetchStatus to return `status: 'fully_translated', pendingCount: 0, failedCount: 0`
- [ ] **15.16** Trigger save and assert panel remains closed
- [ ] **15.17** Add test case: `it('auto-open only triggers once per save', async () => { ... })`
- [ ] **15.18** Mock refetchStatus to be called multiple times (simulate polling)
- [ ] **15.19** Trigger save and verify panel opens exactly once, not on subsequent status updates
- [ ] **15.20** Run `npm test page.integration.test` to verify auto-open logic tests pass

---

## 16. Add Panel Interaction Tests

**Context:** Verify that panel event handlers (onClose, onEdit, onRetranslate, onRetry) work correctly and trigger expected API calls and navigation.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Add test case: `it('closes panel when onClose is called', async () => { ... })`
- [ ] **16.2** Render component, open panel, and click close button
- [ ] **16.3** Assert panel is no longer visible after close
- [ ] **16.4** Add test case: `it('navigates to translation edit page when onEdit is called', async () => { ... })`
- [ ] **16.5** Mock router.push and render component with open panel
- [ ] **16.6** Trigger onEdit handler with language "fr"
- [ ] **16.7** Assert router.push was called with `/dashboard2/translations/article/${articleId}/fr/edit`
- [ ] **16.8** Add test case: `it('calls retry API and refetches status when onRetranslate is called', async () => { ... })`
- [ ] **16.9** Mock fetch to return successful response for `/api/translations/retry`
- [ ] **16.10** Mock refetchStatus function to track calls
- [ ] **16.11** Trigger onRetranslate with language "es"
- [ ] **16.12** Assert fetch was called with correct POST payload: `{ entityType: 'article', entityId, languages: ['es'] }`
- [ ] **16.13** Assert refetchStatus was called after fetch
- [ ] **16.14** Add test case: `it('calls retry API when onRetry is called for failed translation', async () => { ... })`
- [ ] **16.15** Mock fetch and refetchStatus similar to onRetranslate test
- [ ] **16.16** Trigger onRetry with language "de"
- [ ] **16.17** Assert fetch and refetchStatus are called correctly
- [ ] **16.18** Run `npm test page.integration.test` to verify interaction tests pass

---

## 17. Add Error Handling Tests

**Context:** Verify that the component handles errors gracefully, including missing articleId, translation status fetch errors, and retry API errors.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Add test case: `it('handles missing articleId gracefully', async () => { ... })`
- [ ] **17.2** Mock params to return undefined or empty articleId
- [ ] **17.3** Render component and assert it doesn't crash (shows error or loading state)
- [ ] **17.4** Add test case: `it('handles translation status fetch errors', async () => { ... })`
- [ ] **17.5** Mock useTranslationStatus to return error state
- [ ] **17.6** Render component and assert translations button still renders but without status badges
- [ ] **17.7** Assert page functions normally (can edit and save article)
- [ ] **17.8** Add test case: `it('handles retry API errors gracefully', async () => { ... })`
- [ ] **17.9** Mock fetch to reject or return error response for `/api/translations/retry`
- [ ] **17.10** Trigger onRetranslate and assert error is caught and logged (check console.error mock)
- [ ] **17.11** Assert panel remains open and functional after error
- [ ] **17.12** Add test case: `it('page continues functioning if translation features unavailable', async () => { ... })`
- [ ] **17.13** Mock TranslationPreviewPanel import to fail or be undefined
- [ ] **17.14** Render component and assert InstructionEditor still renders and works
- [ ] **17.15** Assert save functionality continues to work even without translation panel
- [ ] **17.16** Run `npm test page.integration.test` to verify error handling tests pass

---

## 18. Add Responsive Design Test

**Context:** Verify that the translations button and panel render correctly on mobile devices and touch interactions work properly.

**Files to modify:**
- `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx`

**Estimated effort:** 1 story point

- [ ] **18.1** Add test case: `it('renders correctly on mobile viewport', async () => { ... })`
- [ ] **18.2** Mock window.innerWidth to 375px (mobile size)
- [ ] **18.3** Render component and wait for loading
- [ ] **18.4** Assert translations button is visible and usable on mobile
- [ ] **18.5** Assert button layout doesn't overflow or break
- [ ] **18.6** Add test case: `it('panel renders correctly on mobile', async () => { ... })`
- [ ] **18.7** Set mobile viewport and open panel
- [ ] **18.8** Assert panel is visible and doesn't exceed viewport width
- [ ] **18.9** Assert panel content is scrollable if needed
- [ ] **18.10** Add test case: `it('touch interactions work correctly', async () => { ... })`
- [ ] **18.11** Use fireEvent.touchStart and fireEvent.touchEnd to simulate touch on button
- [ ] **18.12** Assert panel opens via touch interaction
- [ ] **18.13** Run `npm test page.integration.test` to verify responsive tests pass

---

## 19. Manual Test: Button Visibility and Interaction

**Context:** Manually verify that the translations button is visible in the article editor and opens the panel when clicked.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Start development server: `npm run dev`
- [ ] **19.2** Navigate to an article edit page: `/dashboard2/instructions/{valid-article-id}/edit`
- [ ] **19.3** Verify "Translations" button is visible above the InstructionEditor
- [ ] **19.4** Verify button shows Globe icon on the left
- [ ] **19.5** Click the translations button
- [ ] **19.6** Verify TranslationPreviewPanel opens in a slide-out panel or modal
- [ ] **19.7** Verify panel displays article translations for all 6 languages
- [ ] **19.8** Close the panel by clicking the X button
- [ ] **19.9** Verify panel closes and editor remains functional
- [ ] **19.10** Reopen panel by clicking button again and verify it opens consistently

---

## 20. Manual Test: Status Badges

**Context:** Manually verify that pending and failed count badges display correctly on the translations button.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **20.1** Edit an article's title to trigger new translations
- [ ] **20.2** Click Save button to save changes
- [ ] **20.3** Wait a moment for translation status to update
- [ ] **20.4** Verify pending count badge appears on translations button (e.g., blue badge with "6")
- [ ] **20.5** Verify badge color is blue (bg-blue-100, text-blue-700)
- [ ] **20.6** Wait for translations to complete or simulate a translation failure
- [ ] **20.7** If failure occurs, verify failed count badge appears in red (bg-red-100, text-red-700)
- [ ] **20.8** Open translations panel and verify counts match badge numbers
- [ ] **20.9** Verify loading indicator (spinning icon) appears briefly while status is being fetched
- [ ] **20.10** After all translations complete, verify badges disappear from button

---

## 21. Manual Test: Auto-Open After Save

**Context:** Manually verify that the translation panel automatically opens after saving when translations are pending or failed.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Navigate to article edit page
- [ ] **21.2** Edit the article title or description
- [ ] **21.3** Click Save button
- [ ] **21.4** Verify the panel automatically opens after save completes (translations are now pending)
- [ ] **21.5** Verify panel shows translation status for all 6 languages with "pending" indicators
- [ ] **21.6** Close the panel
- [ ] **21.7** Edit the article again and save
- [ ] **21.8** Verify panel auto-opens again (should open once per save)
- [ ] **21.9** Wait for all translations to complete (status becomes "fully_translated")
- [ ] **21.10** Edit article again, save, and verify panel does NOT auto-open (no pending translations)
- [ ] **21.11** Verify page stays on editor (no redirect to list) when panel auto-opens
- [ ] **21.12** Verify page redirects to list when no panel auto-open occurs

---

## 22. Manual Test: Panel Actions (Edit, Re-translate, Retry)

**Context:** Manually verify that the panel action handlers work correctly for editing, re-translating, and retrying translations.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Open translations panel from article editor
- [ ] **22.2** Click "Edit" button for French translation
- [ ] **22.3** Verify navigation to translation edit page: `/dashboard2/translations/article/{articleId}/fr/edit` (or shows TODO message if page doesn't exist)
- [ ] **22.4** Return to article editor and reopen panel
- [ ] **22.5** Click "Re-translate" button for Spanish translation
- [ ] **22.6** Verify re-translation is triggered (check network tab for POST to `/api/translations/retry`)
- [ ] **22.7** Verify API payload includes: `{ entityType: 'article', entityId: '{id}', languages: ['es'] }`
- [ ] **22.8** Verify translation status refreshes after re-translate (Spanish shows "pending")
- [ ] **22.9** Simulate a translation failure (or wait for real failure if possible)
- [ ] **22.10** Click "Retry" button for failed translation
- [ ] **22.11** Verify retry API is called with correct payload
- [ ] **22.12** Verify status refreshes and failed translation moves to "pending"
- [ ] **22.13** Verify panel remains open and functional throughout all actions

---

## 23. Manual Test: Panel Closing Methods

**Context:** Manually verify that the panel can be closed via multiple methods: close button, ESC key, and clicking outside.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Open translations panel from article editor
- [ ] **23.2** Click the close button (X icon) in the panel header
- [ ] **23.3** Verify panel closes smoothly
- [ ] **23.4** Reopen panel via translations button
- [ ] **23.5** Press ESC key on keyboard
- [ ] **23.6** Verify panel closes when ESC is pressed
- [ ] **23.7** Reopen panel
- [ ] **23.8** Click outside the panel area (on the editor background or overlay)
- [ ] **23.9** Verify panel closes when clicking outside (if overlay mode is implemented)
- [ ] **23.10** Verify editor remains functional after closing panel via any method

---

## 24. Manual Test: Error Handling

**Context:** Manually verify that the component handles errors gracefully, including API failures and missing data.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Disconnect from network (go offline) while on article edit page
- [ ] **24.2** Verify translations button still renders
- [ ] **24.3** Verify no crash or console errors (graceful degradation)
- [ ] **24.4** Verify editor functionality continues to work (can edit and attempt save)
- [ ] **24.5** Reconnect to network
- [ ] **24.6** Simulate retry API error by blocking `/api/translations/retry` in browser dev tools
- [ ] **24.7** Open panel and click "Re-translate"
- [ ] **24.8** Verify error is caught and logged to console (check for console.error message)
- [ ] **24.9** Verify panel remains functional after error
- [ ] **24.10** Remove API block and verify retry works normally

---

## 25. Manual Test: Responsive Design on Mobile

**Context:** Manually verify that the translations button and panel render correctly and are usable on mobile devices.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Open browser dev tools and set viewport to mobile (375x667 - iPhone SE)
- [ ] **25.2** Navigate to article edit page
- [ ] **25.3** Verify translations button layout is usable on mobile (no overflow, proper sizing)
- [ ] **25.4** Verify button text and icon are legible
- [ ] **25.5** Tap translations button (use mobile touch simulation)
- [ ] **25.6** Verify panel opens and renders correctly on mobile viewport
- [ ] **25.7** Verify panel doesn't exceed screen width
- [ ] **25.8** Verify panel content is scrollable if needed
- [ ] **25.9** Verify panel close button is accessible and tappable
- [ ] **25.10** Test on tablet viewport (768x1024 - iPad)
- [ ] **25.11** Verify layout adapts correctly to tablet size
- [ ] **25.12** Test touch interactions work smoothly (no double-tap issues)

---

## 26. Manual Test: i18n Verification

**Context:** Manually verify that all UI text translates correctly when switching between supported locales.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Set UI language to English (en) and navigate to article editor
- [ ] **26.2** Verify translations button displays "Translations" in English
- [ ] **26.3** Hover over button and verify tooltip displays "View and manage translations for this article"
- [ ] **26.4** Switch UI language to Spanish (es)
- [ ] **26.5** Verify button label changes to "Traducciones"
- [ ] **26.6** Verify tooltip translates to Spanish
- [ ] **26.7** Switch to French (fr) and verify "Traductions" label
- [ ] **26.8** Switch to German (de) and verify "Übersetzungen" label
- [ ] **26.9** Switch to Italian (it) and verify "Traduzioni" label
- [ ] **26.10** Switch to Dutch (nl) and verify "Vertalingen" label
- [ ] **26.11** For each language, verify pending/failed count text uses correct plural forms
- [ ] **26.12** Verify all locale files load without JSON errors

---

## 27. Run Full Type Check

**Context:** Verify that all TypeScript types are correct and no compilation errors exist after integration.

**Files to verify:** All modified TypeScript files

**Estimated effort:** 1 story point

- [ ] **27.1** Run `npx tsc --noEmit` from project root
- [ ] **27.2** Verify no TS errors in `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- [ ] **27.3** If errors exist, review and fix type mismatches (e.g., EntityStatusSummary interface usage)
- [ ] **27.4** Verify TranslationPreviewPanel component props match expected types
- [ ] **27.5** Verify useTranslationStatus hook return types are correct
- [ ] **27.6** Verify all event handler function signatures match expected types
- [ ] **27.7** Fix any remaining type errors until `npx tsc --noEmit` passes with 0 errors
- [ ] **27.8** Document any known type issues that are non-blocking

---

## 28. Run ESLint and Fix Warnings

**Context:** Verify that code follows project linting standards and fix any ESLint warnings.

**Files to verify:** All modified files

**Estimated effort:** 1 story point

- [ ] **28.1** Run `npm run lint` from project root
- [ ] **28.2** Review any ESLint warnings in edit page component
- [ ] **28.3** Fix unused variable warnings (remove or prefix with underscore)
- [ ] **28.4** Fix missing dependency warnings in useEffect hooks
- [ ] **28.5** Fix any accessibility warnings (e.g., missing ARIA labels)
- [ ] **28.6** Fix any React-specific warnings (e.g., key props in lists)
- [ ] **28.7** Run `npm run lint` again and verify all warnings are resolved
- [ ] **28.8** Commit lint fixes separately if needed

---

## 29. Run All Tests and Verify Passing

**Context:** Run the full test suite to ensure no existing tests are broken and new integration tests pass.

**Files to verify:** All test files

**Estimated effort:** 1 story point

- [ ] **29.1** Run `npm test` to execute all tests
- [ ] **29.2** Verify all existing tests continue to pass (no regressions)
- [ ] **29.3** Verify new integration tests in `page.integration.test.tsx` pass
- [ ] **29.4** If any tests fail, debug and fix issues
- [ ] **29.5** Check test coverage report: `npm run test:coverage`
- [ ] **29.6** Verify edit page and translation panel integration code is covered by tests
- [ ] **29.7** Add additional test cases if coverage is below 80% for new code
- [ ] **29.8** Ensure all tests pass before proceeding to build

---

## 30. Run Production Build

**Context:** Verify that the application builds successfully for production with no errors.

**Files to verify:** Build output

**Estimated effort:** 1 story point

- [ ] **30.1** Run `npm run build` from project root
- [ ] **30.2** Verify build completes without errors
- [ ] **30.3** Check for any build warnings and assess severity
- [ ] **30.4** Fix any critical build warnings that could affect production
- [ ] **30.5** Verify translation keys are properly bundled (check build output for locale files)
- [ ] **30.6** Verify no missing imports or module resolution errors
- [ ] **30.7** Run `npm start` to test production build locally
- [ ] **30.8** Navigate to article edit page and verify translations button works in production build
- [ ] **30.9** Verify no console errors in production mode
- [ ] **30.10** Stop production server after verification

---

## Status: PENDING

**Last Modified:** 2026-01-23 12:15

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-007**: TranslationPreviewPanel Component (component must exist and be importable)
- **REQ-E05-011**: useTranslationStatus Hook (hook must exist and return correct types)
- **REQ-E05-001**: Translation Status API (API must return EntityStatusSummary)
- **REQ-E05-003**: Re-Translate API Endpoint (API must accept retry requests)

### Blocks (Requires This First)
- None (this is an integration task that completes Phase 7, Task 7.1)

### Parallel Safety
- **Safe to parallelize with**: REQ-E05-029 (Item editor integration) - different files, no conflicts
- **Files modified**: Article edit page, 6 locale files
- **Conflicts with**: None

---

## Authorized Files for Modification

### Existing Files to Modify
1. `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (main implementation)
2. `/messages/en.json` (English translations)
3. `/messages/es.json` (Spanish translations)
4. `/messages/fr.json` (French translations)
5. `/messages/de.json` (German translations)
6. `/messages/it.json` (Italian translations)
7. `/messages/nl.json` (Dutch translations)

### New Files to Create
1. `/src/app/dashboard2/instructions/[articleId]/edit/__tests__/page.integration.test.tsx` (integration tests)

### Files to Reference (No Changes)
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` (component to integrate)
- `/src/hooks/useTranslationStatus.ts` (hook for fetching status)
- `/src/app/api/translations/status/batch/types.ts` (EntityStatusSummary type)
- `/src/app/api/translations/retry/route.ts` (retry API endpoint)
- `/src/components/InstructionEditor/InstructionEditor.tsx` (existing editor component)

---

## Technical Notes

### Auto-Open Trigger Conditions
Panel auto-opens when ANY of these conditions are true after save:
1. `status.pendingCount > 0` - Translations in progress
2. `status.failedCount > 0` - Translations failed
3. `status.status === 'pending'` - Overall status pending
4. `status.status === 'has_failures'` - Overall status has failures

Panel does NOT auto-open when:
- `status.status === 'fully_translated'` - All translations complete
- `status.status === 'not_started'` - No translations yet
- No translation status available (API error)

### Save Behavior Decision
The implementation uses conditional redirect logic:
- **Stay on page** if `status?.pendingCount || status?.failedCount` (translations need attention)
- **Redirect to list** otherwise (all translations complete or no translations)

This provides optimal UX for translation workflows while preserving existing behavior when appropriate.

### Language Support
Supports 6 target languages: `es`, `fr`, `de`, `it`, `nl` (plus `en` as source).

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Translations button visible above InstructionEditor in article edit page
2. ✅ Button displays Globe icon and "Translations" label (i18n)
3. ✅ Clicking button opens TranslationPreviewPanel
4. ✅ Panel displays correct entityId (articleId) and entityType ("article")
5. ✅ Panel shows translation status for all 6 supported languages
6. ✅ After successful save, translation status is refetched via refetchStatus()
7. ✅ Panel auto-opens after save if pendingCount > 0
8. ✅ Panel auto-opens after save if failedCount > 0
9. ✅ Panel auto-opens after save if status is 'pending' or 'has_failures'
10. ✅ Panel does NOT auto-open if status is 'fully_translated'
11. ✅ Auto-open only triggers once per save operation (not on every status update)
12. ✅ Pending count badge displays on button when pendingCount > 0 (blue badge)
13. ✅ Failed count badge displays on button when failedCount > 0 (red badge)
14. ✅ Loading indicator shows while translation status is being fetched
15. ✅ Edit action in panel navigates to `/dashboard2/translations/article/{articleId}/{language}/edit`
16. ✅ Re-translate action calls `/api/translations/retry` and refreshes status
17. ✅ Retry action calls `/api/translations/retry` for failed translations and refreshes status
18. ✅ Panel closes via close button (X)
19. ✅ Panel closes via ESC key
20. ✅ Panel closes when clicking outside (if overlay mode)
21. ✅ Error state handled gracefully if status fetch fails
22. ✅ Page functions normally if translation features unavailable
23. ✅ Translation keys added for all 6 locales (en, es, fr, de, it, nl)
24. ✅ All locale files load without JSON errors
25. ✅ Button label translates correctly in all 6 languages
26. ✅ Page stays on editor when panel auto-opens (no redirect)
27. ✅ Page redirects to list when no auto-open occurs
28. ✅ Page layout is responsive with panel integration
29. ✅ Mobile viewport renders correctly (< 640px)
30. ✅ Touch interactions work on mobile devices
31. ✅ No TypeScript compilation errors (`npx tsc --noEmit` passes)
32. ✅ No ESLint warnings (`npm run lint` passes)
33. ✅ All integration tests pass (`npm test` passes)
34. ✅ Existing edit functionality preserved (no regressions)
35. ✅ Production build succeeds (`npm run build` passes)
36. ✅ Manual QA scenarios complete successfully

---

**Document Status**: PENDING
**Last Modified**: 2026-01-23 12:15
