# Detailed Task Breakdown: Test Content Display Scenarios

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-023 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:45 |
| Overview Document | REQ-E04-023-test-content-display-scenarios-overview.md |
| Breakdown Created | 2026-01-22 23:52 |
| Phase | 7 - Testing & Polish |
| Task ID | 7.2 |
| Title | Test content display scenarios |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

---

## Build & Test Commands

| Purpose | Command | Description |
|---------|---------|-------------|
| Run all tests | `npm test` | Execute complete test suite |
| Run translation tests | `npm test ItemDisplay.translation` | Execute content display tests |
| Run integration tests | `npm test ItemDisplay.translation.integration` | Execute workflow integration tests |
| Run with coverage | `npm run test:coverage` | Generate coverage report |
| Watch mode | `npm test -- --watch ItemDisplay.translation` | Run tests in watch mode |
| Type check | `npm run typecheck` | Verify TypeScript types |
| Build | `npm run build` | Build production bundle |

---

## Overview

This document provides a detailed task breakdown for **REQ-E04-023: Test Content Display Scenarios**. This task creates comprehensive tests to verify that translated content displays correctly in all scenarios, including toggle behavior, language switching, banners, and loading states.

**Key objectives:**
1. Create reusable test data fixtures for items in various translation states
2. Test translated content display for all content types (titles, descriptions, articles, links)
3. Test original content display when translation is unavailable
4. Test "View Original" toggle functionality (instant swaps without page reload)
5. Test language switcher updates to displayed content
6. Test banner display logic (TranslationBanner vs MissingTranslationBanner)
7. Test loading states during language switches
8. Test partial translation handling (mixed translated/original content)
9. Create integration tests for complete user workflows
10. Add accessibility tests for inclusive UX

This is a **SPECIFICATION** document for work that WILL BE DONE by the implementation agent (Agent 04). All checkboxes are **unchecked** by default. Agent 04 will check them off as work progresses.

**Status:** PENDING

---

## Phase 1: Setup and Preparation

### Task 1.1: Create Test Fixtures File

**ID:** **1.1**

Create `src/components/__tests__/fixtures/translationFixtures.ts` with mock data for items in various translation states.

**Files:**
- Create: `src/components/__tests__/fixtures/translationFixtures.ts`

**Acceptance Criteria:**
- [ ] File header includes module documentation with REQ reference
- [ ] Export `fullyTranslatedItem` fixture (full French translation)
- [ ] Export `fullyTranslatedMeta` fixture (translation metadata for full translation)
- [ ] Export `untranslatedItem` fixture (no translation, showing original English)
- [ ] Export `missingTranslationMeta` fixture (metadata when translation unavailable)
- [ ] Export `partiallyTranslatedItem` fixture (some fields translated, others not)
- [ ] Export `partialTranslationMeta` fixture (metadata for partial translation)
- [ ] All fixtures properly typed with `Item` and `TranslationMeta` types
- [ ] Fixtures include realistic data (names, descriptions, articles, links)
- [ ] TypeScript compilation succeeds

**Implementation Notes:**
- Import types from `@/types`
- Use different languages for fixtures (fr, es, de) to cover variety
- Include `originalName`, `originalDescription`, etc. for translated content
- Include both translated and untranslated links/articles in fixtures
- Document each fixture's purpose with JSDoc comments

**Verification Steps:**
1. Verify file created at correct path
2. Verify all exports are present and typed correctly
3. Verify fixtures include all required fields per `Item` type
4. Run `npm run typecheck` to verify no type errors
5. Import fixtures in test file to verify they're usable

---

### Task 1.2: Set Up Test File Structure

**ID:** **1.2**

Create `src/components/__tests__/ItemDisplay.translation.test.tsx` with test structure and mocks.

**Files:**
- Create: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] File header includes module documentation with REQ reference
- [ ] Import Vitest utilities (describe, it, expect, vi, beforeEach)
- [ ] Import React Testing Library (render, screen, within)
- [ ] Import ItemDisplay component
- [ ] Import translation fixtures
- [ ] Mock `useGuestLanguage` hook with default return value
- [ ] Include beforeEach to clear mocks
- [ ] TypeScript compilation succeeds

**Implementation Notes:**
- Use `vi.mock('@/hooks/useGuestLanguage')` for hook mock
- Default mock returns `currentLanguage: 'fr'`, `showOriginal: false`
- Mock functions for `setLanguage` and `toggleOriginal`
- Clear mocks in beforeEach to prevent test interference

**Verification Steps:**
1. Verify file created at correct path
2. Verify all imports resolve correctly
3. Verify mock structure is correct
4. Run `npm run typecheck` to verify no type errors
5. Run `npm test` to verify test file loads without errors

---

### Task 1.3: Create Integration Test File Structure

**ID:** **1.3**

Create `src/components/__tests__/ItemDisplay.translation.integration.test.tsx` for workflow tests.

**Files:**
- Create: `src/components/__tests__/ItemDisplay.translation.integration.test.tsx`

**Acceptance Criteria:**
- [ ] File header includes module documentation with REQ reference
- [ ] Import Vitest and React Testing Library utilities
- [ ] Import ItemDisplay component
- [ ] Import translation fixtures
- [ ] Mock `useGuestLanguage` hook
- [ ] Include beforeEach to clear mocks
- [ ] TypeScript compilation succeeds

**Implementation Notes:**
- Similar structure to unit test file
- Focus on complete user workflows, not isolated behaviors
- Use minimal mocking for integration tests

**Verification Steps:**
1. Verify file created at correct path
2. Verify all imports resolve correctly
3. Run `npm run typecheck` to verify no type errors
4. Run `npm test` to verify test file loads without errors

---

## Phase 2: Test Translated Content Display

### Task 2.1: Test Translated Item Title Display

**ID:** **2.1**

Write test to verify translated item title displays correctly when available.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with `fullyTranslatedItem` and `fullyTranslatedMeta`
- [ ] Test verifies translated name ("Guide Wifi") is in document
- [ ] Test verifies original name ("Wifi Guide") is NOT in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use `screen.getByText()` for positive assertions
- Use `screen.queryByText()` with `.not.toBeInTheDocument()` for negative assertions
- Mock `useGuestLanguage` to return `currentLanguage: 'fr'`, `showOriginal: false`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify test fails if translated name is removed (negative testing)
4. Check test output for clear failure messages

---

### Task 2.2: Test Translated Item Description Display

**ID:** **2.2**

Write test to verify translated item description displays correctly when available.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies translated description is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use French description from `fullyTranslatedItem` fixture
- Match exact text: "Instructions pour se connecter au wifi"

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify test detects if description is missing

---

### Task 2.3: Test Translated Link Titles Display

**ID:** **2.3**

Write test to verify translated link titles display correctly when available.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies translated link title is in document
- [ ] Test verifies original link title is NOT in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use link data from `fullyTranslatedItem` fixture
- Translated: "Page de connexion routeur"
- Original: "Router login page"

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify both positive and negative assertions work

---

### Task 2.4: Test Translated Article Titles Display

**ID:** **2.4**

Write test to verify translated article titles display correctly when available.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies translated article title is in document
- [ ] Test verifies original article title is NOT in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use article data from `fullyTranslatedItem` fixture
- Translated: "Comment se connecter"
- Original: "How to connect"

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify assertions work correctly

---

### Task 2.5: Test Translated Article Content Display

**ID:** **2.5**

Write test to verify translated article content displays correctly when available.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies translated article content is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use regex pattern for partial match: `/Étape 1: Ouvrez les paramètres wifi/`
- Article content might be long, so partial match is acceptable

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify content is actually visible in rendered output

---

### Task 2.6: Test TranslationBanner Display

**ID:** **2.6**

Write test to verify TranslationBanner appears when viewing translated content.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies "Translated from English" banner text is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use case-insensitive regex: `/Translated from English/i`
- Banner should only appear when `isTranslated: true` and `showOriginal: false`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner is not shown when `showOriginal: true`

---

## Phase 3: Test Original Content Display

### Task 3.1: Test Original Title Display When Translation Unavailable

**ID:** **3.1**

Write test to verify original title displays when translation is unavailable.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with `untranslatedItem` and `missingTranslationMeta`
- [ ] Test verifies original name ("Wifi Guide") is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Mock `useGuestLanguage` to return `currentLanguage: 'de'` (requested German)
- Use `missingTranslationMeta` with `displayLanguage: 'en'` (showing English)

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify correct fallback behavior

---

### Task 3.2: Test Original Description Display When Translation Unavailable

**ID:** **3.2**

Write test to verify original description displays when translation is unavailable.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with untranslated item
- [ ] Test verifies original description is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Original description: "Instructions for connecting to wifi"

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify description fallback works correctly

---

### Task 3.3: Test MissingTranslationBanner Display

**ID:** **3.3**

Write test to verify MissingTranslationBanner appears when requested translation is unavailable.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with untranslated item
- [ ] Test verifies "German translation not available" message is in document
- [ ] Test verifies "Showing content in English" message is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use case-insensitive regex for messages
- Banner should show requested language name (German) and fallback language (English)

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner shows correct language names

---

### Task 3.4: Test TranslationBanner NOT Shown for Original Content

**ID:** **3.4**

Write test to verify TranslationBanner does NOT appear when showing original content.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with untranslated item
- [ ] Test verifies "Translated from" message is NOT in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use negative assertion: `screen.queryByText(/Translated from/i).not.toBeInTheDocument()`
- When `isTranslated: false`, TranslationBanner should never show

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banners are mutually exclusive

---

## Phase 4: Test "View Original" Toggle

### Task 4.1: Test Toggle from Translation to Original

**ID:** **4.1**

Write test to verify toggle switches from translated to original content on click.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test verifies translated content is initially visible
- [ ] Test simulates click on "View in Original" button
- [ ] Test verifies `toggleOriginal` function is called
- [ ] Test re-mocks hook with `showOriginal: true`
- [ ] Test rerenders component
- [ ] Test verifies original content is now visible
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Import `userEvent` from `@testing-library/user-event`
- Use `user.click()` instead of `fireEvent.click()` for realistic interaction
- Use `rerender` from render result to simulate state change
- Mock sequence: `showOriginal: false` → click → `showOriginal: true`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify toggle function is called exactly once
4. Verify content swap is complete

---

### Task 4.2: Test Toggle Happens Instantly

**ID:** **4.2**

Write test to verify toggle updates content instantly without page reload (< 100ms).

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test measures time before and after toggle click
- [ ] Test verifies time difference is less than 100ms
- [ ] Test verifies `toggleOriginal` function is called
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use `performance.now()` to measure timing
- Assert: `expect(endTime - startTime).toBeLessThan(100)`
- This tests performance requirement for instant toggle

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify timing assertion is correct
4. Test multiple times to ensure consistency

---

### Task 4.3: Test Toggle Swaps Back to Translation on Second Click

**ID:** **4.3**

Write test to verify toggle switches back from original to translation on second click.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with `showOriginal: true` initially
- [ ] Test verifies original content is initially visible
- [ ] Test simulates click on "View Translation" button
- [ ] Test verifies `toggleOriginal` function is called
- [ ] Test re-mocks hook with `showOriginal: false`
- [ ] Test rerenders component
- [ ] Test verifies translated content is now visible
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Reverse direction: start with original, toggle to translation
- Button text changes: "View Translation" when showing original

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify bidirectional toggle works
4. Verify button label changes correctly

---

### Task 4.4: Test Toggle Affects All Content Types Simultaneously

**ID:** **4.4**

Write test to verify toggle switches all content types at once (title, links, articles).

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with fully translated item
- [ ] Test verifies all translated content is initially visible (title, link, article)
- [ ] Test simulates click on toggle button
- [ ] Test re-mocks hook with `showOriginal: true`
- [ ] Test rerenders component
- [ ] Test verifies all original content is now visible (title, link, article)
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Check multiple elements: title, link title, article title
- Verify all swap simultaneously, not one at a time

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify all content types swap together
4. Verify no partial swaps occur

---

## Phase 5: Test Language Switcher Updates

### Task 5.1: Test Content Updates When Language Changed via Switcher

**ID:** **5.1**

Write test to verify content updates when user selects a different language from switcher.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with French translation
- [ ] Test verifies French content is initially visible
- [ ] Test simulates opening language switcher dropdown
- [ ] Test simulates clicking Spanish option
- [ ] Test verifies `setLanguage('es')` function is called
- [ ] Test re-mocks hook with `currentLanguage: 'es'`
- [ ] Test updates item prop with Spanish translation
- [ ] Test rerenders component
- [ ] Test verifies Spanish content is now visible
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use `userEvent` for realistic interactions
- Find switcher button by role: `button` with name matching `/language/i`
- Find Spanish option by role: `menuitem` with name matching `/español/i`
- Create Spanish version of item for rerender

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify `setLanguage` is called with correct locale
4. Verify content updates to new language

---

### Task 5.2: Test Language Change Resets showOriginal to False

**ID:** **5.2**

Write test to verify showOriginal is reset when language is changed via switcher.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with `showOriginal: true` initially
- [ ] Test verifies original content is initially visible
- [ ] Test simulates language change via switcher
- [ ] Test re-mocks hook with `currentLanguage: 'es'` and `showOriginal: false`
- [ ] Test updates item prop with Spanish translation
- [ ] Test rerenders component
- [ ] Test verifies Spanish translated content is now visible (not original)
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Important UX behavior: changing language should show translation, not original
- Hook should reset `showOriginal` when `setLanguage` is called

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify showOriginal resets correctly
4. Verify new translation is shown, not original

---

## Phase 6: Test Banner Display Logic

### Task 6.1: Test TranslationBanner Shows When Viewing Translated Content

**ID:** **6.1**

Write test to verify TranslationBanner appears when viewing translated content.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item and `showOriginal: false`
- [ ] Test verifies "Translated from English" message is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Condition: `isTranslated: true` AND `showOriginal: false`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner displays correct source language

---

### Task 6.2: Test TranslationBanner Hidden When Viewing Original

**ID:** **6.2**

Write test to verify TranslationBanner is hidden when `showOriginal: true`.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item and `showOriginal: true`
- [ ] Test verifies "Translated from English" message is NOT in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use negative assertion: `screen.queryByText(...).not.toBeInTheDocument()`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner is properly hidden

---

### Task 6.3: Test MissingTranslationBanner Shows When Translation Unavailable

**ID:** **6.3**

Write test to verify MissingTranslationBanner appears when requested translation is unavailable.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with untranslated item and `missingTranslationMeta`
- [ ] Test verifies "German translation not available" message is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Condition: `isTranslated: false` (requested language unavailable)

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner shows correct requested language

---

### Task 6.4: Test Banners Are Mutually Exclusive

**ID:** **6.4**

Write test to verify only one banner appears at a time (no double banners).

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test queries for all banners using `[role="alert"]` or `[role="status"]`
- [ ] Test verifies at most 1 banner is present
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use `container.querySelectorAll()` to find all banners
- Assert: `expect(banners.length).toBeLessThanOrEqual(1)`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Test both scenarios: translated and untranslated
4. Verify only one banner shows in each case

---

## Phase 7: Test Loading States

### Task 7.1: Test Loading State During Language Switch

**ID:** **7.1**

Write test to verify loading indicator appears during language switch (if applicable).

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated item
- [ ] Test mocks `setLanguage` as async function with delay
- [ ] Test simulates language change via switcher
- [ ] Test re-mocks hook with `isLoading: true`
- [ ] Test rerenders component
- [ ] Test verifies loading indicator appears
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Mock async delay: `await new Promise(resolve => setTimeout(resolve, 100))`
- Hook should return `isLoading` state
- Find loading indicator: `screen.getByRole('status', { name: /loading/i })`

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify loading indicator is visible during transition
4. Check if loading state is actually implemented in component

---

## Phase 8: Test Partial Translation Handling

### Task 8.1: Test Mix of Translated and Original Content

**ID:** **8.1**

Write test to verify component displays mix of translated and original content for partial translations.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with `partiallyTranslatedItem` and `partialTranslationMeta`
- [ ] Test verifies translated title ("Guía Wifi") is in document
- [ ] Test verifies original description is in document (not translated)
- [ ] Test verifies translated link title is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- `partiallyTranslatedItem` has some fields translated (name, link title) and others not (description)
- Component should gracefully handle mixed content

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify both translated and original content appear correctly
4. Verify no errors or warnings in console

---

### Task 8.2: Test TranslationBanner Shows Even with Partial Translation

**ID:** **8.2**

Write test to verify TranslationBanner appears even when translation is partial.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with partially translated item
- [ ] Test verifies "Translated from English" banner is in document
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- As long as `isTranslated: true`, banner should show
- Partial translation still counts as "translated"

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify banner appears correctly for partial translations

---

## Phase 9: Integration Tests

### Task 9.1: Test Complete Guest Translation Experience

**ID:** **9.1**

Write integration test for complete workflow: view translation → toggle to original → toggle back.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.integration.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with French translation initially
- [ ] Test verifies French content and TranslationBanner are visible
- [ ] Test simulates click on "View in Original" button
- [ ] Test re-mocks hook with `showOriginal: true` and rerenders
- [ ] Test verifies original content is visible and banner is hidden
- [ ] Test simulates click on "View Translation" button
- [ ] Test re-mocks hook with `showOriginal: false` and rerenders
- [ ] Test verifies French content is visible again
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Use `userEvent` for realistic interactions
- Test complete user journey, not isolated actions
- Verify state changes at each step

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation.integration`
2. Verify test passes
3. Verify complete workflow executes correctly
4. Verify no unexpected behaviors or errors

---

## Phase 10: Accessibility Tests

### Task 10.1: Test Content Language Announcements

**ID:** **10.1**

Write test to verify content has correct `lang` attribute for screen readers.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with French translation
- [ ] Test finds main content element
- [ ] Test verifies element has `lang="fr"` attribute
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Find main content: `screen.getByRole('main')`
- Assert: `expect(mainContent).toHaveAttribute('lang', 'fr')`
- Screen readers use lang attribute to pronounce content correctly

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify lang attribute changes with language
4. Test with different languages

---

### Task 10.2: Test Toggle Button Has Descriptive Label

**ID:** **10.2**

Write test to verify toggle button has accessible label for screen readers.

**Files:**
- Edit: `src/components/__tests__/ItemDisplay.translation.test.tsx`

**Acceptance Criteria:**
- [ ] Test renders ItemDisplay with translated content
- [ ] Test finds toggle button by accessible name
- [ ] Test verifies button label is descriptive (e.g., "View in Original (English)")
- [ ] Test passes when run with `npm test`

**Implementation Notes:**
- Find button: `screen.getByRole('button', { name: /view in original \(english\)/i })`
- Label should include both action and target language
- Helps screen reader users understand what will happen

**Verification Steps:**
1. Run test with `npm test ItemDisplay.translation`
2. Verify test passes
3. Verify button is findable by accessible name
4. Verify label is clear and descriptive

---

## Phase 11: Test Execution and Verification

### Task 11.1: Run All Translation Tests Locally

**ID:** **11.1**

Execute all translation tests and verify they pass.

**Acceptance Criteria:**
- [ ] Run `npm test ItemDisplay.translation`
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Test output is clear and readable

**Verification Steps:**
1. Run `npm test ItemDisplay.translation`
2. Check exit code is 0 (success)
3. Review test output for failures
4. Fix any failing tests

---

### Task 11.2: Run Integration Tests Locally

**ID:** **11.2**

Execute integration tests and verify they pass.

**Acceptance Criteria:**
- [ ] Run `npm test ItemDisplay.translation.integration`
- [ ] All integration tests pass
- [ ] No console errors or warnings

**Verification Steps:**
1. Run `npm test ItemDisplay.translation.integration`
2. Check exit code is 0 (success)
3. Review test output for failures
4. Fix any failing tests

---

### Task 11.3: Generate and Review Coverage Report

**ID:** **11.3**

Generate coverage report and verify adequate coverage of translation logic.

**Acceptance Criteria:**
- [ ] Run `npm run test:coverage`
- [ ] Review coverage report for ItemDisplay component
- [ ] Verify statement coverage >80%
- [ ] Verify branch coverage >80%
- [ ] Identify any uncovered edge cases

**Verification Steps:**
1. Run `npm run test:coverage`
2. Open coverage report (typically in `coverage/index.html`)
3. Navigate to ItemDisplay component coverage
4. Check coverage percentages
5. Review uncovered lines and add tests if needed

---

### Task 11.4: Run Full Test Suite

**ID:** **11.4**

Execute complete test suite to ensure no regressions.

**Acceptance Criteria:**
- [ ] Run `npm test`
- [ ] All tests pass (not just translation tests)
- [ ] No new test failures introduced
- [ ] TypeScript compilation succeeds

**Verification Steps:**
1. Run `npm test`
2. Check exit code is 0 (success)
3. Review test output for any failures
4. Run `npm run typecheck` to verify types

---

### Task 11.5: Perform Manual Testing

**ID:** **11.5**

Manually test content display scenarios in development environment.

**Acceptance Criteria:**
- [ ] Start dev server with `npm run dev`
- [ ] Navigate to item page with translation
- [ ] Verify translated content displays correctly
- [ ] Click "View Original" toggle and verify instant swap
- [ ] Change language via switcher and verify content updates
- [ ] Test with item that has no translation
- [ ] Verify banners display correctly
- [ ] Test on mobile viewport
- [ ] Test with screen reader (if available)

**Verification Steps:**
1. Start dev server
2. Test each scenario from acceptance criteria
3. Note any issues or unexpected behaviors
4. Create follow-up tasks for any bugs found

---

## Phase 12: Finalization

### Task 12.1: Update Test Documentation

**ID:** **12.1**

Add comments and documentation to test files.

**Acceptance Criteria:**
- [ ] Each test has clear description
- [ ] Test file has module-level documentation
- [ ] Complex test logic has inline comments
- [ ] README or docs mention how to run translation tests

**Verification Steps:**
1. Review test files for clarity
2. Add missing comments or documentation
3. Verify docs are helpful for future maintainers

---

### Task 12.2: Commit Changes

**ID:** **12.2**

Commit test files following project git conventions.

**Acceptance Criteria:**
- [ ] Stage all new test files
- [ ] Create commit with message: `[REQ-E04-023] Test content display scenarios`
- [ ] Include Co-Authored-By line
- [ ] Commit succeeds
- [ ] Push to remote if appropriate

**Verification Steps:**
1. Run `git status` to see changes
2. Run `git add .`
3. Create commit with proper message
4. Verify commit appears in `git log`
5. Push if required

---

## Dependencies

**Depends On (Must Complete First):**
- REQ-E04-008 through REQ-E04-012: Guest UI components (banners, switcher, toggle)
- REQ-E04-014 (Task 4.1): Create useGuestLanguage Hook
- REQ-E04-017 (Task 5.2): Update ItemDisplay Component
- REQ-E04-018 (Task 5.3): Update LinkCard Component

**Blocks (Cannot Start Until This Completes):**
- None (testing task doesn't block other work)

**Parallel Safety:**
- Safe to run in parallel with other testing tasks (REQ-E04-022, REQ-E04-024, etc.)
- Safe to run in parallel with all other Epic 4 tasks
- Only creates test files, doesn't modify source code

---

## Technical Context

**Project Stack:**
- Next.js 15 (App Router)
- TypeScript 5.x
- Vitest (testing framework)
- React Testing Library (@testing-library/react)
- @testing-library/user-event

**Key Files:**
- `src/components/ItemDisplay.tsx` - Component under test
- `src/components/guest/*.tsx` - Guest components being tested
- `src/hooks/useGuestLanguage.ts` - Hook being mocked
- `src/types/index.ts` - Type definitions

**Testing Patterns:**
- Mock `useGuestLanguage` hook for controlled state
- Use `rerender` to simulate state changes
- Use `userEvent` for realistic user interactions
- Use `waitFor` and `findBy*` for async content
- Use fixtures for consistent test data

---

## Acceptance Criteria Summary

This task is complete when:

1. **Test Fixtures Created:**
   - [ ] `translationFixtures.ts` created with all fixtures
   - [ ] Fixtures are properly typed and realistic

2. **Unit Tests Written:**
   - [ ] Tests for translated content display (title, description, links, articles)
   - [ ] Tests for original content fallback
   - [ ] Tests for "View Original" toggle (instant swap)
   - [ ] Tests for language switcher updates
   - [ ] Tests for banner display logic
   - [ ] Tests for loading states
   - [ ] Tests for partial translations

3. **Integration Tests Written:**
   - [ ] Complete user workflow tested (translation → original → back)

4. **Accessibility Tests Written:**
   - [ ] Lang attribute tested
   - [ ] Toggle button label tested

5. **All Tests Pass:**
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Coverage >80%
   - [ ] No regressions in full test suite

6. **Manual Testing Complete:**
   - [ ] Visual inspection confirms correct behavior
   - [ ] Toggle is instant and smooth
   - [ ] Banners display correctly
   - [ ] Mobile viewport tested

7. **Documentation Complete:**
   - [ ] Tests are well-commented
   - [ ] Module documentation added
   - [ ] README updated if needed

8. **Changes Committed:**
   - [ ] All test files committed with proper message
   - [ ] Co-Authored-By line included

---

## Notes

- **Testing Philosophy:** Tests verify DISPLAY of translated content, not translation logic itself
- **Mock Strategy:** `useGuestLanguage` hook is mocked; actual state management tested separately
- **Performance Target:** Toggle updates must be instant (< 100ms)
- **Accessibility:** Tests include basic a11y checks for inclusive UX
- **Coverage Goal:** >80% statement and branch coverage
- **Maintainability:** Clear test names and organization for easy updates

---

*Document created: 2026-01-22 23:52*
*Status: PENDING - Ready for implementation by Agent 04*
