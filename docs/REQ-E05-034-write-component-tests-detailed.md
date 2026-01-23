# REQ-E05-034: Write Component Tests for Translation UI - Detailed Implementation Tasks

**Generated:** 2026-01-23 00:41
**Reference Documents:**
- Requirements: [docs/gen_requests_epic5.md](./gen_requests_epic5.md) (Request #34)
- Overview: [docs/REQ-E05-034-write-component-tests-overview.md](./REQ-E05-034-write-component-tests-overview.md)
- Implementation Plan: [docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)

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
| Test Coverage | `npm run test:coverage` |
| Test Specific File | `npm test -- TranslationPreviewPanel.test.tsx` |

---

## Status: PENDING

---

## 1. Create Mock Utilities for Component Tests

**Context:** Component tests need reusable mock utilities for translation hooks (useTranslationStatus, useTranslationRealtime), next-intl translation function, Supabase API client, and Next.js router. Centralizing these mocks ensures consistency across all test files and makes updates easier when APIs change.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create the directory `src/components/TranslationManagement/__tests__/mocks/` if it doesn't exist
- [ ] **1.2** Create file `src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` with header comment and imports from vitest and types
- [ ] **1.3** Define TypeScript interfaces for mock return types: `MockTranslationStatusReturn`, `MockTranslationRealtimeReturn`, `MockTranslationEditorProps`
- [ ] **1.4** Implement `createMockTranslationStatus()` factory function that returns mock data with two translation items (one completed Spanish, one pending French), isLoading false, error null, and refetch mock function with customizable overrides parameter
- [ ] **1.5** Implement `createMockTranslationRealtime()` factory function that returns isSubscribed true, error null, with customizable overrides
- [ ] **1.6** Implement `createMockTranslationFn()` that returns a translation function accepting key and params, returning key with param interpolation for testing
- [ ] **1.7** Implement `setupNextIntlMock()` function that returns useTranslations mock configuration for vi.mock
- [ ] **1.8** Implement `createMockSupabaseClient()` that returns mock from, update, eq, select, single methods with proper chaining via mockReturnThis
- [ ] **1.9** Implement `createMockRouter()` that returns mock push, replace, refresh, back, forward, prefetch functions and pathname, query, asPath properties
- [ ] **1.10** Implement `createMockTranslationItem()` factory function with sensible defaults (Spanish translation, completed status) and overrides parameter
- [ ] **1.11** Implement `createMockStatusSummary()` factory function with total, completed, pending, failed, manual, stale counts defaulting to total: 10, completed: 6, pending: 4
- [ ] **1.12** Add JSDoc comments to all exported functions explaining their purpose and usage
- [ ] **1.13** Export all mock utilities from the file
- [ ] **1.14** Run `npx tsc --noEmit` to verify no TypeScript errors in mock utilities file

---

## 2. Create TranslationPreviewPanel Component Tests - Rendering and Display

**Context:** TranslationPreviewPanel displays translation data with different statuses (completed, pending, failed). Tests must verify the component renders without crashing, displays translation content correctly, shows locale indicators, and applies appropriate styling for different translation statuses.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **2.1** Create file `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx` with vitest-environment jsdom directive and imports
- [ ] **2.2** Set up vi.mock for 'next-intl' using setupNextIntlMock()
- [ ] **2.3** Set up vi.mock for '@/hooks/useTranslationStatus' and '@/hooks/useTranslationRealtime' with mock functions
- [ ] **2.4** Create describe block 'TranslationPreviewPanel' with beforeEach to clear mocks and set default successful mock return values
- [ ] **2.5** Create nested describe block 'Rendering and Display' for rendering tests
- [ ] **2.6** Write test: 'renders without crashing with valid translation data' - render component with entityId and propertyId, assert region role exists
- [ ] **2.7** Write test: 'displays translation key (locale) prominently' - assert 'es' and 'fr' text are in document
- [ ] **2.8** Write test: 'displays translated content text correctly' - assert 'Bienvenido a nuestra propiedad' is in document
- [ ] **2.9** Write test: 'displays original (source) content for reference' - assert 'Welcome to our property' is in document
- [ ] **2.10** Write test: 'renders multiple translation entries when given array of translations' - assert getAllByTestId returns 2 translation items
- [ ] **2.11** Write test: 'applies correct styling for completed translations' - assert translation-item-es has class 'status-completed'
- [ ] **2.12** Write test: 'applies correct styling for pending translations' - assert translation-item-fr has class 'status-pending'
- [ ] **2.13** Run `npm test -- TranslationPreviewPanel.test.tsx` to verify rendering tests pass

---

## 3. Create TranslationPreviewPanel Component Tests - Loading and Error States

**Context:** TranslationPreviewPanel must handle loading states (showing skeleton), empty states (no translations available), and error states (failed to load with retry button). These tests verify the component displays appropriate UI for each state.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Create nested describe block 'Loading and Empty States' inside TranslationPreviewPanel describe
- [ ] **3.2** Write test: 'displays loading skeleton when isLoading is true' - mock isLoading true with data null, assert loading label is in document
- [ ] **3.3** Write test: 'displays "No translations available" when data array is empty' - mock data as empty array, assert no translations text is shown
- [ ] **3.4** Write test: 'displays placeholder when translation data is null' - mock data as null, assert no translations message
- [ ] **3.5** Write test: 'does not show translation content during loading' - mock isLoading true, assert translated text is NOT in document
- [ ] **3.6** Create nested describe block 'Error Handling' for error state tests
- [ ] **3.7** Write test: 'displays error message when error prop is provided' - mock error with 'Failed to load translations', assert error text in document
- [ ] **3.8** Write test: 'shows retry button when error occurs' - mock error, assert button with name /retry/i exists
- [ ] **3.9** Write test: 'clicking retry button invokes refetch callback' - mock error with refetch function, click retry button, assert refetch called once
- [ ] **3.10** Write test: 'handles malformed translation data gracefully' - mock data with incomplete object, assert component renders without crashing and shows what it can
- [ ] **3.11** Run `npm test -- TranslationPreviewPanel.test.tsx` to verify loading and error tests pass

---

## 4. Create TranslationPreviewPanel Component Tests - Read-Only and Edit Modes

**Context:** TranslationPreviewPanel supports read-only mode (default) and editable mode (when editable prop is true). In edit mode, users can click edit button to toggle to editing state with textbox, save, and cancel buttons. Tests verify mode switching and conditional UI display.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create nested describe block 'Read-Only vs Edit Modes' inside TranslationPreviewPanel describe
- [ ] **4.2** Write test: 'displays in read-only mode by default' - render without editable prop, assert no save button and no textbox
- [ ] **4.3** Write test: 'shows edit button when editable prop is true' - render with editable true, assert edit button exists
- [ ] **4.4** Write test: 'clicking edit button toggles to edit mode' - render with editable true, click edit button, waitFor textbox to appear
- [ ] **4.5** Write test: 'edit mode displays editable text area' - click edit button, assert textbox role exists
- [ ] **4.6** Write test: 'edit mode shows save and cancel buttons' - click edit button, assert both save and cancel buttons exist
- [ ] **4.7** Write test: 'does not show edit controls when user lacks permissions' - render with editable false, assert no edit button
- [ ] **4.8** Run `npm test -- TranslationPreviewPanel.test.tsx` to verify mode tests pass

---

## 5. Create TranslationPreviewPanel Component Tests - User Interactions and Accessibility

**Context:** TranslationPreviewPanel must support keyboard navigation (Tab, Enter, Escape), proper ARIA attributes, screen reader announcements, and focus management. Tests verify accessibility compliance and keyboard interaction support.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Create nested describe block 'User Interactions' inside TranslationPreviewPanel describe
- [ ] **5.2** Write test: 'supports keyboard navigation with Tab' - render with editable true, tab to edit button, assert button has focus
- [ ] **5.3** Write test: 'supports keyboard activation with Enter' - focus edit button, press Enter key, waitFor textbox to appear
- [ ] **5.4** Write test: 'supports Escape key to exit edit mode' - click edit button to enter edit mode, press Escape, waitFor textbox to disappear
- [ ] **5.5** Create nested describe block 'Accessibility' for ARIA tests
- [ ] **5.6** Write test: 'has appropriate ARIA role for panel' - assert region role is in document
- [ ] **5.7** Write test: 'has accessible label for the panel' - assert getByLabelText /translation preview/i exists
- [ ] **5.8** Write test: 'loading state announces to screen readers' - mock isLoading true, assert status role with aria-busy true
- [ ] **5.9** Write test: 'error messages are announced to screen readers' - mock error, assert alert role with error text
- [ ] **5.10** Write test: 'interactive buttons have accessible names' - render with editable true, assert edit button has accessible name
- [ ] **5.11** Write test: 'maintains focus when toggling between modes' - click edit button, waitFor textarea to have focus
- [ ] **5.12** Run `npm test -- TranslationPreviewPanel.test.tsx` to verify interaction and accessibility tests pass

---

## 6. Create TranslationPreviewPanel Component Tests - Hook Integration

**Context:** TranslationPreviewPanel integrates with useTranslationStatus hook to fetch data and useTranslationRealtime hook for live updates. Tests verify the component calls hooks with correct parameters, handles hook return values, and triggers refetch when refresh action is invoked.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Create nested describe block 'Integration with Hooks' inside TranslationPreviewPanel describe
- [ ] **6.2** Write test: 'uses useTranslationStatus hook to fetch data' - render component, assert mockUseTranslationStatus was called
- [ ] **6.3** Write test: 'passes correct entityId to hook' - render with entityId 'item-456', assert hook called with object containing entityId 'item-456'
- [ ] **6.4** Write test: 'passes correct propertyId to hook' - render with propertyId 'prop-999', assert hook called with object containing propertyId 'prop-999'
- [ ] **6.5** Write test: 'integrates with useTranslationRealtime for live updates' - render component, assert mockUseTranslationRealtime was called
- [ ] **6.6** Write test: 'refetches data when refresh action is triggered' - mock refetch function, render component, click refresh button, assert refetch was called
- [ ] **6.7** Run `npm test -- TranslationPreviewPanel.test.tsx` to verify all 37 TranslationPreviewPanel tests pass with no errors

---

## 7. Create TranslationEditor Component Tests - Rendering and Form Validation

**Context:** TranslationEditor provides a form for editing translation content with validation (minimum length, maximum 5000 characters), character count display, and save/cancel actions. Tests verify initial rendering, form validation rules, and disabled state for invalid input.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **7.1** Create file `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx` with vitest-environment jsdom directive and imports
- [ ] **7.2** Set up vi.mock for 'next-intl' using setupNextIntlMock()
- [ ] **7.3** Set up vi.mock for '@/lib/supabase/client' with createMockSupabaseClient()
- [ ] **7.4** Create describe block 'TranslationEditor' with mock onSave, onCancel, translationItem, and beforeEach to clear mocks
- [ ] **7.5** Create nested describe block 'Rendering and Initial State'
- [ ] **7.6** Write test: 'renders without crashing with translation item' - render component with props, assert form role exists
- [ ] **7.7** Write test: 'displays original content as read-only reference' - assert 'Welcome to our property' and /original/i text exist
- [ ] **7.8** Write test: 'displays editable textarea for translation content' - assert textbox role with /translation/i label, not readonly
- [ ] **7.9** Write test: 'textarea is pre-filled with existing translation' - assert textarea value is 'Bienvenido a nuestra propiedad'
- [ ] **7.10** Write test: 'textarea is empty when creating new translation' - mock item with translated_content null, assert textarea value is empty string
- [ ] **7.11** Write test: 'shows target locale indicator' - assert text /translating to spanish/i exists
- [ ] **7.12** Write test: 'displays character count' - assert text /31 \/ 5000/i exists
- [ ] **7.13** Create nested describe block 'Form Validation'
- [ ] **7.14** Write test: 'save button is disabled when content is empty' - mock empty item, assert save button is disabled
- [ ] **7.15** Write test: 'save button is disabled when content exceeds maximum length' - type 5001 'a' characters, assert save button disabled
- [ ] **7.16** Write test: 'shows validation error when content is too short' - type 'ab', waitFor /too short/i error text
- [ ] **7.17** Write test: 'validation error disappears when user corrects input' - type short content to trigger error, type more to fix, waitFor error to disappear
- [ ] **7.18** Write test: 'prevents submission of invalid data' - mock empty item, click save button, assert onSave not called
- [ ] **7.19** Run `npm test -- TranslationEditor.test.tsx` to verify rendering and validation tests pass

---

## 8. Create TranslationEditor Component Tests - Save Flow Success

**Context:** TranslationEditor handles successful save operations by disabling inputs during save, showing loading spinner, displaying success message, and calling onSave callback with translation data. Tests verify the save flow UI states and callback behavior.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Create nested describe block 'Save Flow - Success' inside TranslationEditor describe
- [ ] **8.2** Write test: 'clicking save button triggers onSave callback' - click save button, waitFor onSave to be called
- [ ] **8.3** Write test: 'onSave callback receives translation data' - clear textarea, type 'New translation text', click save, waitFor onSave called with object containing id and translated_content
- [ ] **8.4** Write test: 'shows saving state with disabled inputs' - mock onSave to return promise with 100ms delay, click save, assert textarea and save button are disabled during save
- [ ] **8.5** Write test: 'shows loading spinner during save' - mock slow onSave, click save, assert loading-spinner testid exists
- [ ] **8.6** Write test: 'shows success message after successful save' - mock onSave to resolve with success true, click save, waitFor /saved successfully/i text
- [ ] **8.7** Write test: 'success message auto-dismisses after timeout' - use fake timers, mock successful save, click save, waitFor success message, advance timers 3000ms, waitFor success message to disappear, restore real timers
- [ ] **8.8** Run `npm test -- TranslationEditor.test.tsx` to verify save success tests pass

---

## 9. Create TranslationEditor Component Tests - Save Flow Failure and User Interactions

**Context:** TranslationEditor handles save failures by displaying error messages, keeping form editable for retry, and re-enabling save button. Tests also verify user interactions like typing, cancel button, unsaved changes warning, and keyboard shortcuts (Cmd+S, Escape).

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Create nested describe block 'Save Flow - Failure' inside TranslationEditor describe
- [ ] **9.2** Write test: 'displays error message when save fails' - mock onSave to reject with 'Network error', click save, waitFor /network error/i text
- [ ] **9.3** Write test: 'error message includes server-provided details' - mock rejection with 'Translation exceeds character limit', click save, waitFor error text
- [ ] **9.4** Write test: 'form remains editable after save failure' - mock failed save, click save, waitFor error, assert textarea is not disabled
- [ ] **9.5** Write test: 'save button re-enables after failed save' - mock failed save, click save, waitFor error, assert save button not disabled
- [ ] **9.6** Write test: 'handles authentication errors with appropriate message' - mock rejection with 'Unauthorized: 401', click save, waitFor /unauthorized/i text
- [ ] **9.7** Create nested describe block 'User Interactions'
- [ ] **9.8** Write test: 'typing in textarea updates local state' - type ' and more text' in textarea, assert value includes new text
- [ ] **9.9** Write test: 'clicking cancel button invokes onCancel callback' - click cancel button, assert onCancel was called
- [ ] **9.10** Write test: 'warns user about unsaved changes when attempting to cancel' - type ' modified', click cancel, assert /unsaved changes/i text exists
- [ ] **9.11** Write test: 'pressing Cmd+S triggers save action' - focus textarea, press Meta+s keyboard combination, waitFor onSave called
- [ ] **9.12** Write test: 'pressing Escape key invokes cancel' - press Escape keyboard, assert onCancel called
- [ ] **9.13** Run `npm test -- TranslationEditor.test.tsx` to verify failure and interaction tests pass

---

## 10. Create TranslationEditor Component Tests - Accessibility and Edge Cases

**Context:** TranslationEditor must be fully accessible with proper labels, aria-describedby for validation, screen reader announcements for errors and status, and focus management. Edge case tests verify handling of rapid clicks (debouncing) and incomplete data.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Create nested describe block 'Accessibility' inside TranslationEditor describe
- [ ] **10.2** Write test: 'textarea has appropriate label' - assert getByLabelText /translation content/i exists
- [ ] **10.3** Write test: 'textarea has aria-describedby for validation messages' - assert textarea has attribute 'aria-describedby'
- [ ] **10.4** Write test: 'validation errors are announced to screen readers' - clear textarea, waitFor alert role with /required/i text
- [ ] **10.5** Write test: 'saving state is announced to screen readers' - mock slow save, click save, assert status role with /saving/i text
- [ ] **10.6** Write test: 'success messages are announced to screen readers' - mock successful save, click save, waitFor status role with /saved/i text
- [ ] **10.7** Write test: 'focus returns to trigger element after cancel' - click cancel, assert onCancel called (focus management handled by parent)
- [ ] **10.8** Create nested describe block 'Edge Cases'
- [ ] **10.9** Write test: 'handles rapid save button clicks with debouncing' - click save button 3 times rapidly, waitFor onSave called only once
- [ ] **10.10** Write test: 'handles missing translation item data gracefully' - render with incomplete item (only id and locale), assert form role exists without crashing
- [ ] **10.11** Run `npm test -- TranslationEditor.test.tsx` to verify all 36 TranslationEditor tests pass with no errors

---

## 11. Create TranslationStatusWidget Component Tests - Rendering and Data Updates

**Context:** TranslationStatusWidget displays translation status summary with total count, completed count, pending count, progress bar, and color-coded status indicator. Tests verify rendering of counts, progress calculation, and updates when summary prop changes.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **11.1** Create file `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx` with vitest-environment jsdom directive and imports
- [ ] **11.2** Set up vi.mock for 'next-intl' using setupNextIntlMock()
- [ ] **11.3** Set up vi.mock for 'next/navigation' with mockPush function for useRouter
- [ ] **11.4** Create describe block 'TranslationStatusWidget' with beforeEach to clear mocks
- [ ] **11.5** Create nested describe block 'Rendering and Display'
- [ ] **11.6** Write test: 'renders without crashing with status summary' - render with mock summary, assert region role exists
- [ ] **11.7** Write test: 'displays total translation count' - mock summary with total 15, assert '15' and /total/i text exist
- [ ] **11.8** Write test: 'displays completed translation count' - mock summary with completed 8, assert '8' and /completed/i text exist
- [ ] **11.9** Write test: 'displays pending translation count' - mock summary with pending 7, assert '7' and /pending/i text exist
- [ ] **11.10** Write test: 'displays counts as numbers not raw API data' - mock summary, assert formatted numbers '10' and '6' exist
- [ ] **11.11** Write test: 'shows visual progress indicator' - mock total 10 completed 6, assert progressbar role with aria-valuenow '60'
- [ ] **11.12** Write test: 'uses color coding for complete status' - mock total 10 completed 10, assert status-indicator has class 'status-complete'
- [ ] **11.13** Write test: 'uses color coding for pending status' - mock total 10 completed 4, assert status-indicator has class 'status-pending'
- [ ] **11.14** Create nested describe block 'Data Updates'
- [ ] **11.15** Write test: 'updates counts when summary prop changes' - render with initial summary, assert '6', rerender with updated summary, assert '8'
- [ ] **11.16** Write test: 'recalculates percentage when counts change' - render with 50% complete, assert aria-valuenow '50', rerender with 70%, assert '70'
- [ ] **11.17** Run `npm test -- TranslationStatusWidget.test.tsx` to verify rendering and data tests pass

---

## 12. Create TranslationStatusWidget Component Tests - Loading, Empty, and Error States

**Context:** TranslationStatusWidget must handle loading states (skeleton), empty states (null summary showing zeros), and error states (error icon with tooltip and retry button). Tests verify appropriate UI for each state.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Create nested describe block 'Loading and Empty States' inside TranslationStatusWidget describe
- [ ] **12.2** Write test: 'displays loading skeleton when isLoading is true' - render with statusSummary null and isLoading true, assert /loading/i label exists
- [ ] **12.3** Write test: 'displays zero counts when status is null' - render with null summary, assert '0' and /no data/i text exist
- [ ] **12.4** Write test: 'handles undefined status properties gracefully' - render with incomplete summary (only total), assert '10' and '0' exist without crashing
- [ ] **12.5** Create nested describe block 'Error Handling'
- [ ] **12.6** Write test: 'displays error icon when error prop is provided' - render with error 'Failed to load', assert error-icon testid exists
- [ ] **12.7** Write test: 'shows tooltip explaining error on hover' - render with error 'Network error', hover error icon, waitFor /network error/i text
- [ ] **12.8** Write test: 'provides retry action when error occurs' - render with error and onRetry callback, assert retry button exists
- [ ] **12.9** Run `npm test -- TranslationStatusWidget.test.tsx` to verify loading, empty, and error tests pass

---

## 13. Create TranslationStatusWidget Component Tests - User Interactions and Accessibility

**Context:** TranslationStatusWidget supports clicking to navigate to detailed view, hovering for tooltip breakdown, keyboard interaction (Tab, Enter), and proper ARIA attributes for accessibility. Tests verify interactive behavior and accessibility compliance.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Create nested describe block 'User Interactions' inside TranslationStatusWidget describe
- [ ] **13.2** Write test: 'clicking widget navigates to detailed view' - render with clickable true, click widget button, assert mockPush called with path containing '/translations'
- [ ] **13.3** Write test: 'hovering shows tooltip with breakdown' - mock summary with counts, hover widget, waitFor /6 completed/i and /4 pending/i text
- [ ] **13.4** Write test: 'supports keyboard interaction with Tab' - render with clickable true, tab to widget button, assert button has focus
- [ ] **13.5** Write test: 'supports Enter key to activate' - render with clickable, focus button, press Enter, assert mockPush called
- [ ] **13.6** Create nested describe block 'Accessibility'
- [ ] **13.7** Write test: 'has appropriate ARIA role' - render with summary, assert region role exists
- [ ] **13.8** Write test: 'has accessible label for the region' - render with summary, assert getByLabelText /translation status/i exists
- [ ] **13.9** Write test: 'counts have accessible labels' - mock total 10 completed 6, assert getByLabelText /6 of 10 translations complete/i exists
- [ ] **13.10** Write test: 'visual indicators have text alternatives' - mock total 10 completed 10, assert /100% complete/i text exists
- [ ] **13.11** Write test: 'status changes are announced to screen readers' - render with 5 completed, rerender with 6 completed, assert status role with /6 of 10/i text
- [ ] **13.12** Run `npm test -- TranslationStatusWidget.test.tsx` to verify interaction and accessibility tests pass

---

## 14. Create TranslationStatusWidget Component Tests - Edge Cases

**Context:** TranslationStatusWidget must handle edge cases like zero total count (avoid division by zero), negative counts (show as zero), very large numbers (abbreviate as 1.2k), and incomplete data. Tests verify robust handling of invalid or unusual input.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Create nested describe block 'Edge Cases' inside TranslationStatusWidget describe
- [ ] **14.2** Write test: 'handles zero total count without division by zero' - mock total 0 completed 0, assert progressbar aria-valuenow '0' and /0%/ text exists
- [ ] **14.3** Write test: 'handles negative counts gracefully' - mock with completed -1, assert '10' and '0' displayed (negative shown as zero)
- [ ] **14.4** Write test: 'handles very large numbers with abbreviations' - mock total 1250 completed 750, assert '1.2k' text exists
- [ ] **14.5** Write test: 'handles incomplete status data with missing fields' - mock summary with only total property, assert '0' for missing fields
- [ ] **14.6** Run `npm test -- TranslationStatusWidget.test.tsx` to verify all 29 TranslationStatusWidget tests pass with no errors

---

## 15. Update Vitest Configuration for Coverage

**Context:** Vitest coverage configuration must include TranslationManagement components and translation hooks to track test coverage. This ensures coverage reports include all translation UI code and hooks.

**Files to modify:**
- `vitest.config.ts` (lines 26-38, coverage section)

**Estimated effort:** 1 story point

- [ ] **15.1** Open `vitest.config.ts` in editor
- [ ] **15.2** Locate the `coverage` configuration object (should be around lines 26-38)
- [ ] **15.3** Add to `coverage.include` array: 'src/components/TranslationManagement/**/*.ts'
- [ ] **15.4** Add to `coverage.include` array: 'src/components/TranslationManagement/**/*.tsx'
- [ ] **15.5** Add to `coverage.include` array: 'src/hooks/useTranslationStatus.ts'
- [ ] **15.6** Add to `coverage.include` array: 'src/hooks/useTranslationRealtime.ts'
- [ ] **15.7** Verify `coverage.exclude` array includes '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**' to exclude test files from coverage
- [ ] **15.8** Run `npx tsc --noEmit` to verify no TypeScript errors in vitest.config.ts
- [ ] **15.9** Run `npm test -- --coverage TranslationManagement` to generate coverage report for translation components
- [ ] **15.10** Verify coverage output shows TranslationManagement components in the report

---

## 16. Create Test Documentation

**Context:** Test documentation helps developers understand test structure, how to run tests, mock patterns, and how to maintain tests when APIs change. Documentation should cover all three component test files, mock utilities, and best practices.

**Files to modify:**
- `src/components/TranslationManagement/__tests__/README.md` (NEW)

**Estimated effort:** 1 story point

- [ ] **16.1** Create file `src/components/TranslationManagement/__tests__/README.md`
- [ ] **16.2** Write "Overview" section listing the three test files and mocks directory with brief description of each
- [ ] **16.3** Write "Running Tests" section with commands: run all tests, run specific file, run with coverage, run in watch mode
- [ ] **16.4** Write "Test Structure" section explaining the 6-part organization: Mock Setup, Rendering Tests, State Tests, Interaction Tests, Accessibility Tests, Edge Cases
- [ ] **16.5** Write "Mock Patterns" section with subsections for Translation Hooks (createMockTranslationStatus), Translation Function (setupNextIntlMock), and Supabase API (createMockSupabaseClient) with code examples
- [ ] **16.6** Write "Updating Mocks" section with 4-step process: update types in component-mocks.ts, update factory functions, run tests to identify failures, update test cases
- [ ] **16.7** Write "Coverage Goals" section listing minimum percentages: Line Coverage 85%, Branch Coverage 80%, Function Coverage 85%
- [ ] **16.8** Write "Best Practices" section with 6 best practices: use userEvent, wait for async updates, test accessibility, descriptive test names, arrange-act-assert structure, no console warnings
- [ ] **16.9** Write "Common Issues" section with subsections for Act Warnings, Mock Not Working, and Test Flakiness with troubleshooting guidance
- [ ] **16.10** Write "Related Documentation" section with links to overview document, hook tests README, and Testing Library docs
- [ ] **16.11** Verify markdown formatting is correct (headings, code blocks, lists)
- [ ] **16.12** Run `npm test -- TranslationManagement` to confirm tests still pass after documentation is added

---

## 17. Run All Translation Component Tests and Verify Coverage

**Context:** All 102 translation component tests (37 TranslationPreviewPanel + 36 TranslationEditor + 29 TranslationStatusWidget) must pass consistently with minimum 85% coverage, complete in under 5 seconds, and have no TypeScript or ESLint errors.

**Files to modify:**
- None (verification step)

**Estimated effort:** 1 story point

- [ ] **17.1** Run `npm test -- TranslationManagement` to execute all translation component tests
- [ ] **17.2** Verify output shows all 102 tests passing (37 + 36 + 29)
- [ ] **17.3** Verify no test failures or errors in console output
- [ ] **17.4** Run `npm test -- --coverage TranslationManagement` to generate detailed coverage report
- [ ] **17.5** Verify TranslationPreviewPanel.tsx has at least 85% line coverage, 80% branch coverage
- [ ] **17.6** Verify TranslationEditor.tsx has at least 85% line coverage, 80% branch coverage
- [ ] **17.7** Verify TranslationStatusWidget.tsx has at least 85% line coverage, 80% branch coverage
- [ ] **17.8** Verify test execution completes in under 5 seconds (check time output)
- [ ] **17.9** Run `npx tsc --noEmit` to verify no TypeScript compilation errors in test files or components
- [ ] **17.10** Run `npm run lint -- src/components/TranslationManagement/__tests__/` to verify no ESLint warnings or errors
- [ ] **17.11** Check console output for any act warnings, memory leak warnings, or unhandled promise rejections
- [ ] **17.12** If any tests fail or coverage is below target, identify uncovered lines in coverage report and add targeted tests to reach 85%+ coverage

---

## 18. Verify Test Quality and Integration

**Context:** Test quality verification ensures tests are isolated, use realistic data, have meaningful assertions, clean up properly, and follow TypeScript best practices. This final verification confirms all acceptance criteria are met.

**Files to modify:**
- None (verification step)

**Estimated effort:** 1 story point

- [ ] **18.1** Run `npm test -- TranslationManagement --reporter=verbose` to see detailed test execution output
- [ ] **18.2** Verify each test file has clear describe blocks grouping related tests (check test output structure)
- [ ] **18.3** Verify each test case has descriptive name explaining behavior (read test names in output)
- [ ] **18.4** Open `src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` and verify all mock factories have TypeScript types (no `any` types)
- [ ] **18.5** Open each test file and verify mocks are configured per-test in beforeEach or individual tests (not shared mutable state)
- [ ] **18.6** Run tests 3 times in a row with `npm test -- TranslationManagement` to verify no flakiness (all 102 tests pass each time)
- [ ] **18.7** Verify test data uses realistic values matching component prop types (check mock factories return proper TranslationStatus, StatusSummary types)
- [ ] **18.8** Verify all test files include introductory JSDoc comments at the top explaining what is being tested
- [ ] **18.9** Verify complex test cases (like fake timers, async saves) include inline comments explaining setup
- [ ] **18.10** Open `src/components/TranslationManagement/__tests__/README.md` and verify it explains how to run tests and update mocks
- [ ] **18.11** Run `npm run build` to verify component tests do not break production build
- [ ] **18.12** Review test coverage HTML report at `coverage/index.html` to visually confirm all component lines are covered

---

## Success Criteria

All tasks must be completed successfully to consider this implementation done:

1. **Test Files Created**: 3 test files created (TranslationPreviewPanel.test.tsx, TranslationEditor.test.tsx, TranslationStatusWidget.test.tsx) with 102 total test cases
2. **Mock Utilities**: Centralized mock utilities created in component-mocks.ts with factory functions for hooks, APIs, and dependencies
3. **Test Coverage**: All 102 tests pass consistently with at least 85% line coverage for all three components
4. **Test Performance**: All tests complete in under 5 seconds
5. **Test Quality**: Tests are isolated, use realistic data, have meaningful assertions, and clean up properly
6. **TypeScript**: No TypeScript compilation errors in test files or components (npx tsc --noEmit passes)
7. **ESLint**: No ESLint warnings or errors in test files (npm run lint passes)
8. **Console Warnings**: No act warnings, memory leak warnings, or unhandled promise rejections
9. **Accessibility Tests**: All components have accessibility tests for ARIA labels, keyboard navigation, and screen reader support
10. **Documentation**: README created explaining how to run tests, update mocks, and troubleshooting common issues
11. **Coverage Configuration**: Vitest config updated to include TranslationManagement components and hooks in coverage reports
12. **Integration Tests**: Tests verify integration with useTranslationStatus and useTranslationRealtime hooks

---

## Authorized Files for Modification

| File Path | Lines | Purpose |
|-----------|-------|---------|
| `src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` | NEW 1-300 | Mock utilities for component tests |
| `src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx` | NEW 1-800 | TranslationPreviewPanel component tests (37 tests) |
| `src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx` | NEW 1-1500 | TranslationEditor component tests (36 tests) |
| `src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx` | NEW 1-1900 | TranslationStatusWidget component tests (29 tests) |
| `vitest.config.ts` | 26-38 | Add translation components to coverage include array |
| `src/components/TranslationManagement/__tests__/README.md` | NEW 1-160 | Test documentation with patterns and best practices |

**Total Test Cases**: 102 (37 + 36 + 29)
**Estimated Total Effort**: 18 story points

---

**Last Modified:** 2026-01-23 00:41
