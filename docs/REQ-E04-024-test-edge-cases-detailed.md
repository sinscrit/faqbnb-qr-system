# Detailed Task Breakdown: Test Edge Cases

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-024 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:50 |
| Overview Document | REQ-E04-024-test-edge-cases-overview.md |
| Breakdown Created | 2026-01-22 23:56 |
| Phase | 7 - Testing & Polish |
| Task ID | 7.3 |
| Title | Test edge cases |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command | Description |
|--------|---------|-------------|
| Type Check | `npm run typecheck` | Verify TypeScript types |
| Unit Tests | `npm test` | Run all tests with Vitest |
| Edge Case Tests | `npm test edgecases` | Run edge case tests only |
| Security Tests | `npm test -- --testNamePattern="security\|malicious\|injection"` | Run security-focused tests |
| Coverage | `npm run test:coverage` | Generate coverage report |
| Build | `npm run build` | Build production bundle |
| Lint | `npm run lint` | Run ESLint |

---

## Overview

This document provides a detailed task breakdown for **REQ-E04-024: Test Edge Cases**. This task creates comprehensive tests to verify robust handling of unusual or error scenarios in the translation system, including partial translations, cookie blocking, malformed input, security threats, and race conditions.

**Key objectives:**
1. Create edge case test fixtures for unusual scenarios
2. Test partial translation handling (mixed translated/original content)
3. Test cookie blocked scenarios (privacy mode, ad blockers)
4. Test malformed Accept-Language headers
5. Test unsupported language codes (Chinese, Japanese, etc.)
6. Test invalid/malicious language codes (XSS, injection attempts)
7. Test race conditions from concurrent operations
8. Test component rendering with edge case data
9. Test error recovery from transient failures
10. Document known limitations clearly

This is a **SPECIFICATION** document for work that WILL BE DONE by the implementation agent (Agent 04). All checkboxes are **unchecked** by default. Agent 04 will check them off as work progresses.

**Status:** PENDING

---

## Phase 1: Setup and Fixtures

### Task 1.1: Create Edge Case Test Fixtures File

**ID:** **1.1**

Create `src/lib/i18n/__tests__/fixtures/edgeCaseFixtures.ts` with mock data for edge case scenarios.

**Context:** Edge case tests require consistent, reusable test data for malformed input, security threats, and unusual scenarios. Centralized fixtures improve test maintainability.

**Files to modify:**
- Create: `src/lib/i18n/__tests__/fixtures/edgeCaseFixtures.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.1.1** Create fixtures directory at `src/lib/i18n/__tests__/fixtures/`
- [ ] **1.1.2** Create `edgeCaseFixtures.ts` file with module header and REQ reference
- [ ] **1.1.3** Export `malformedAcceptLanguageHeaders` array with 10+ malformed header strings
- [ ] **1.1.4** Include malformed headers: empty string, null, undefined, very long string (10000 chars)
- [ ] **1.1.5** Include security test headers: `<script>alert("xss")</script>`, `../../../etc/passwd`
- [ ] **1.1.6** Include invalid quality values: `fr-FR;q=invalid`, `en;q=2.0`, `en;q=-0.5`
- [ ] **1.1.7** Export `invalidLanguageCodes` array with 10+ invalid language codes
- [ ] **1.1.8** Include invalid codes: 'invalid', 'xx', 'zz', '123', empty string, spaces
- [ ] **1.1.9** Include security test codes: `<script>`, `javascript:alert(1)`, `'; DROP TABLE users; --`
- [ ] **1.1.10** Export `unsupportedLanguageCodes` array with valid but unsupported codes
- [ ] **1.1.11** Include unsupported codes: 'zh', 'ja', 'ar', 'ko', 'pt', 'ru'
- [ ] **1.1.12** Export `partiallyTranslatedContent` object with edge case item data
- [ ] **1.1.13** Include `onlyTitle` variant (title translated, description not)
- [ ] **1.1.14** Include `onlyDescription` variant (description translated, title not)
- [ ] **1.1.15** Include `mixedLinks` variant (some links translated, others not)
- [ ] **1.1.16** Include `mixedArticles` variant (some articles translated, others not)
- [ ] **1.1.17** Export `createRequestWithoutCookies` helper function
- [ ] **1.1.18** Function accepts options object with `url` and `headers` parameters
- [ ] **1.1.19** Function creates NextRequest instance
- [ ] **1.1.20** Function mocks `request.cookies.get` to return undefined (simulating blocked cookies)
- [ ] **1.1.21** Add JSDoc comments for all exports explaining their purpose
- [ ] **1.1.22** Import NextRequest from 'next/server'
- [ ] **1.1.23** Import vi from 'vitest' for mocking
- [ ] **1.1.24** Run `npm run typecheck` to verify no type errors
- [ ] **1.1.25** Verify file compiles without errors

**Implementation Notes:**
- Use realistic malformed data that could come from browsers or proxies
- Security test strings should be safe to run in tests (no actual execution)
- Partial translation variants should match real-world incomplete translation scenarios
- Helper function enables reusable cookie-blocking simulation

**Verification Steps:**
1. Verify fixtures file created at correct path
2. Verify all arrays and objects are properly exported
3. Import fixtures in a test file to verify they're usable
4. Run `npm run typecheck` to ensure no TypeScript errors
5. Verify helper function creates request with blocked cookies correctly

---

### Task 1.2: Create Edge Case Test File Structure

**ID:** **1.2**

Create `src/lib/i18n/__tests__/guest-language.edgecases.test.ts` with test structure and imports.

**Context:** Edge case tests for language detection functions need a dedicated test file separate from normal scenario tests.

**Files to modify:**
- Create: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.2.1** Create test file at `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`
- [ ] **1.2.2** Add file header with module documentation and REQ-E04-024 reference
- [ ] **1.2.3** Import Vitest utilities: `describe`, `it`, `expect`, `vi`, `beforeEach`
- [ ] **1.2.4** Import NextRequest from 'next/server'
- [ ] **1.2.5** Import `detectGuestLanguage` from '../guest-language'
- [ ] **1.2.6** Import `validateLanguageParam` from '../guest-language'
- [ ] **1.2.7** Import all fixtures from './fixtures/edgeCaseFixtures'
- [ ] **1.2.8** Create top-level describe block: 'Guest Language Detection - Edge Cases'
- [ ] **1.2.9** Add beforeEach block to clear all mocks
- [ ] **1.2.10** Run `npm run typecheck` to verify imports and structure
- [ ] **1.2.11** Run `npm test` to verify file loads without errors

**Implementation Notes:**
- Follow existing test file conventions in the project
- Use consistent describe block naming
- Clear mocks in beforeEach to prevent test interference

**Verification Steps:**
1. Verify file created at correct path
2. Verify all imports resolve correctly
3. Run `npm run typecheck` to verify no type errors
4. Run `npm test` to verify test file loads without syntax errors

---

### Task 1.3: Create Component Edge Case Test File Structure

**ID:** **1.3**

Create `src/components/__tests__/ItemDisplay.edgecases.test.tsx` for component-level edge cases.

**Context:** UI components must handle edge case data gracefully without crashing or displaying errors to users.

**Files to modify:**
- Create: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.3.1** Create test file at `src/components/__tests__/ItemDisplay.edgecases.test.tsx`
- [ ] **1.3.2** Add file header with module documentation and REQ-E04-024 reference
- [ ] **1.3.3** Import Vitest utilities: `describe`, `it`, `expect`, `vi`
- [ ] **1.3.4** Import React Testing Library: `render`, `screen`
- [ ] **1.3.5** Import ItemDisplay component from '../ItemDisplay'
- [ ] **1.3.6** Import `partiallyTranslatedContent` from '../../lib/i18n/__tests__/fixtures/edgeCaseFixtures'
- [ ] **1.3.7** Mock `useGuestLanguage` hook with vi.mock
- [ ] **1.3.8** Set default mock return values: `currentLanguage: 'fr'`, `showOriginal: false`
- [ ] **1.3.9** Create top-level describe block: 'ItemDisplay - Edge Cases'
- [ ] **1.3.10** Run `npm run typecheck` to verify structure
- [ ] **1.3.11** Run `npm test` to verify file loads without errors

**Implementation Notes:**
- Component tests focus on rendering behavior with unusual data
- Mock hook to control language state
- Use React Testing Library for component testing

**Verification Steps:**
1. Verify file created at correct path
2. Verify all imports resolve correctly
3. Verify mock is correctly set up
4. Run tests to ensure file structure is valid

---

## Phase 2: Partial Translation Tests

### Task 2.1: Test Item with Only Title Translated

**ID:** **2.1**

Write test to verify component displays item with translated title but original description.

**Context:** Partial translations are common in real-world scenarios. System must handle gracefully.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.1.1** Create describe block: 'Partial Translations'
- [ ] **2.1.2** Write test: 'handles item with translated title but original description'
- [ ] **2.1.3** Create mock content object with translated title, original description
- [ ] **2.1.4** Verify translated title field exists: `expect(content.name).toBe('Guide Wifi')`
- [ ] **2.1.5** Verify original description field exists: `expect(content.description).toBe('Instructions for connecting to wifi')`
- [ ] **2.1.6** Run `npm test edgecases` to verify test passes
- [ ] **2.1.7** Verify test fails when expected values are changed (negative testing)

**Implementation Notes:**
- This test validates the data structure pattern for partial translations
- Component rendering of this pattern is tested in component test file

**Verification Steps:**
1. Run `npm test edgecases` and verify test passes
2. Change expected value and verify test fails
3. Check test output for clear failure messages

---

### Task 2.2: Test Mixed Content Handling

**ID:** **2.2**

Write test to verify system handles mixed translated/untranslated content without errors.

**Context:** Items may have any combination of translated/untranslated fields.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.2.1** Write test: 'handles mixed content gracefully'
- [ ] **2.2.2** Create object with mix of translated and untranslated fields
- [ ] **2.2.3** Set `translatedField: 'Valeur traduite'`
- [ ] **2.2.4** Set `untranslatedField: 'Original value'`
- [ ] **2.2.5** Verify both fields are defined: `expect(mixedContent.translatedField).toBeDefined()`
- [ ] **2.2.6** Verify both fields are defined: `expect(mixedContent.untranslatedField).toBeDefined()`
- [ ] **2.2.7** Run `npm test edgecases` to verify test passes
- [ ] **2.2.8** Verify no console errors or warnings

**Implementation Notes:**
- Simple test verifying mixed content doesn't cause crashes
- More detailed component rendering tested in component test file

**Verification Steps:**
1. Run test and verify it passes
2. Check console for warnings or errors
3. Verify both fields are accessible

---

## Phase 3: Cookie Blocked Scenarios

### Task 3.1: Test Fallback to Accept-Language When Cookies Blocked

**ID:** **3.1**

Write test to verify system falls back to Accept-Language header when cookies are blocked.

**Context:** Cookie blocking is common (privacy mode, ad blockers). System must function without cookies.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.1.1** Create describe block: 'Cookie Blocked Scenarios'
- [ ] **3.1.2** Write test: 'falls back to Accept-Language when cookies blocked'
- [ ] **3.1.3** Use `createRequestWithoutCookies` helper with Accept-Language: 'fr-FR,fr;q=0.9'
- [ ] **3.1.4** Call `await detectGuestLanguage(null, request)`
- [ ] **3.1.5** Verify result is 'fr' (detected from header since cookie unavailable)
- [ ] **3.1.6** Run `npm test edgecases` to verify test passes
- [ ] **3.1.7** Verify function does not throw error

**Implementation Notes:**
- Tests priority cascade: URL > Cookie > Accept-Language > Default
- When cookie is blocked, skip to Accept-Language

**Verification Steps:**
1. Run test and verify French is detected
2. Verify no errors thrown
3. Check that cookie layer is bypassed correctly

---

### Task 3.2: Test Fallback to English When Cookies Blocked and No Accept-Language

**ID:** **3.2**

Write test to verify system falls back to English when cookies blocked and no Accept-Language header.

**Context:** Worst-case scenario: cookies blocked AND no header. Must fall back to default.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.2.1** Write test: 'falls back to English when cookies blocked and no Accept-Language'
- [ ] **3.2.2** Use `createRequestWithoutCookies` with empty headers object
- [ ] **3.2.3** Call `await detectGuestLanguage(null, request)`
- [ ] **3.2.4** Verify result is 'en' (default language)
- [ ] **3.2.5** Run `npm test edgecases` to verify test passes
- [ ] **3.2.6** Verify graceful degradation (no errors)

**Implementation Notes:**
- Tests bottom of priority cascade: falls all the way to default
- Critical for privacy-focused users

**Verification Steps:**
1. Run test and verify 'en' is returned
2. Verify no errors or crashes
3. Confirm this is expected behavior

---

### Task 3.3: Test URL Parameter Works When Cookies Blocked

**ID:** **3.3**

Write test to verify URL parameter still works when cookies are blocked.

**Context:** URL parameter is highest priority and should work regardless of cookie availability.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.3.1** Write test: 'URL parameter still works when cookies blocked'
- [ ] **3.3.2** Use `createRequestWithoutCookies` with URL: 'http://localhost:3000/item/test?lang=es'
- [ ] **3.3.3** Extract `lang` parameter from URL: `new URL(request.url).searchParams.get('lang')`
- [ ] **3.3.4** Call `await detectGuestLanguage(urlParam, request)`
- [ ] **3.3.5** Verify result is 'es' (from URL parameter)
- [ ] **3.3.6** Run `npm test edgecases` to verify test passes
- [ ] **3.3.7** Verify URL parameter takes priority over all other sources

**Implementation Notes:**
- URL parameter is highest priority in cascade
- Should work even when cookies completely unavailable

**Verification Steps:**
1. Run test and verify Spanish is detected
2. Verify URL parameter is correctly extracted
3. Confirm priority order is maintained

---

### Task 3.4: Test Cookie Setting Failure Doesn't Crash Detection

**ID:** **3.4**

Write test to verify detection succeeds even when cookie setting fails.

**Context:** Some browsers/extensions prevent cookie writes. Detection must not crash.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.4.1** Write test: 'does not crash when trying to set cookie fails'
- [ ] **3.4.2** Use `createRequestWithoutCookies` helper
- [ ] **3.4.3** Call `await detectGuestLanguage(null, request)`
- [ ] **3.4.4** Use `expect(...).resolves.toBeDefined()` to verify promise resolves
- [ ] **3.4.5** Verify function does not throw error
- [ ] **3.4.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests error handling for cookie write failures
- Detection should complete successfully even if cookie can't be set

**Verification Steps:**
1. Run test and verify it resolves successfully
2. Verify no uncaught exceptions
3. Check that detection completes despite cookie failure

---

### Task 3.5: Test cookies.get Returning Null

**ID:** **3.5**

Write test to verify system handles `cookies.get()` returning null.

**Context:** Some cookie APIs return null instead of undefined. Must handle both.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.5.1** Write test: 'handles cookies.get returning null'
- [ ] **3.5.2** Create NextRequest instance
- [ ] **3.5.3** Mock `request.cookies.get` with `vi.fn(() => null as any)`
- [ ] **3.5.4** Call `await detectGuestLanguage(null, request)`
- [ ] **3.5.5** Verify result is 'en' (falls back to default)
- [ ] **3.5.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Different browsers may return null vs undefined for missing cookies
- System must handle both gracefully

**Verification Steps:**
1. Run test and verify fallback to 'en'
2. Verify no type errors with null handling
3. Confirm null is treated same as undefined

---

### Task 3.6: Test cookies.get Throwing Error

**ID:** **3.6**

Write test to verify system handles `cookies.get()` throwing an error.

**Context:** Rare but possible: cookie access might throw in restrictive environments.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.6.1** Write test: 'handles cookies.get throwing error'
- [ ] **3.6.2** Create NextRequest instance
- [ ] **3.6.3** Mock `request.cookies.get` to throw Error: 'Cookie access denied'
- [ ] **3.6.4** Use `expect(async () => { ... }).not.toThrow()` wrapper
- [ ] **3.6.5** Call `await detectGuestLanguage(null, request)` inside wrapper
- [ ] **3.6.6** Verify result is 'en' (falls back to default)
- [ ] **3.6.7** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests error handling for cookie access errors
- Must not propagate error to caller

**Verification Steps:**
1. Run test and verify no error is thrown
2. Verify fallback to default language works
3. Check error is caught internally

---

## Phase 4: Malformed Accept-Language Headers

### Task 4.1: Test All Malformed Headers Don't Crash

**ID:** **4.1**

Write parameterized tests for all malformed Accept-Language headers.

**Context:** Browsers and proxies may send malformed headers. Must not crash application.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.1.1** Create describe block: 'Malformed Accept-Language Headers'
- [ ] **4.1.2** Use `forEach` to iterate over `malformedAcceptLanguageHeaders` array
- [ ] **4.1.3** For each header, write test: 'handles malformed header: "..."'
- [ ] **4.1.4** Truncate header to 50 chars in test name for readability
- [ ] **4.1.5** Create NextRequest and set malformed Accept-Language header
- [ ] **4.1.6** Use `expect(async () => { ... }).not.toThrow()` wrapper
- [ ] **4.1.7** Call `await detectGuestLanguage(null, request)` inside wrapper
- [ ] **4.1.8** Verify result is defined
- [ ] **4.1.9** Run `npm test edgecases` to verify all tests pass
- [ ] **4.1.10** Verify tests cover all malformed header variants

**Implementation Notes:**
- Parameterized tests efficiently test many similar cases
- Each malformed header gets its own test for clear failure reporting

**Verification Steps:**
1. Run tests and verify all malformed headers are handled
2. Check that no test throws an error
3. Verify test names are readable (truncated)

---

### Task 4.2: Test Malformed Headers Fall Back to Default

**ID:** **4.2**

Write tests to verify malformed headers result in default language.

**Context:** When header is unparseable, safest option is to fall back to default.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.2.1** Use `forEach` to iterate over `malformedAcceptLanguageHeaders` array
- [ ] **4.2.2** For each header, write test: 'falls back to default for malformed header: "..."'
- [ ] **4.2.3** Create NextRequest and set malformed Accept-Language header
- [ ] **4.2.4** Call `await detectGuestLanguage(null, request)`
- [ ] **4.2.5** Verify result is 'en' (default language)
- [ ] **4.2.6** Run `npm test edgecases` to verify all tests pass
- [ ] **4.2.7** Verify consistent fallback behavior across all malformed inputs

**Implementation Notes:**
- Tests that parsing errors don't result in unexpected languages
- All malformed input should safely fall back to 'en'

**Verification Steps:**
1. Run tests and verify all return 'en'
2. Check consistency of fallback behavior
3. Verify no random or undefined results

---

### Task 4.3: Test Specific Malformed Header Scenarios

**ID:** **4.3**

Write individual tests for specific edge cases: empty, missing, invalid quality values.

**Context:** Some malformed scenarios deserve explicit testing beyond parameterized tests.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.3.1** Write test: 'handles empty Accept-Language header'
- [ ] **4.3.2** Set header to empty string `''`
- [ ] **4.3.3** Verify result is 'en'
- [ ] **4.3.4** Write test: 'handles missing Accept-Language header'
- [ ] **4.3.5** Create request without setting Accept-Language header at all
- [ ] **4.3.6** Verify result is 'en'
- [ ] **4.3.7** Write test: 'handles Accept-Language with invalid quality values'
- [ ] **4.3.8** Set header to 'fr;q=invalid,en;q=abc'
- [ ] **4.3.9** Verify result is defined (handles parsing error gracefully)
- [ ] **4.3.10** Write test: 'handles Accept-Language with quality > 1.0'
- [ ] **4.3.11** Set header to 'fr;q=2.0,en;q=1.5'
- [ ] **4.3.12** Verify result is either 'fr' or 'en' (normalizes or ignores invalid quality)
- [ ] **4.3.13** Write test: 'handles Accept-Language with negative quality'
- [ ] **4.3.14** Set header to 'fr;q=-0.5,en;q=0.8'
- [ ] **4.3.15** Verify result is defined
- [ ] **4.3.16** Write test: 'handles extremely long Accept-Language header'
- [ ] **4.3.17** Create header with 'en-US,' repeated 1000 times + 'en'
- [ ] **4.3.18** Verify result is 'en' (handles without performance issues)
- [ ] **4.3.19** Run `npm test edgecases` to verify all tests pass

**Implementation Notes:**
- Tests specific error conditions that are most likely in production
- Performance test ensures no DoS vulnerability with very long headers

**Verification Steps:**
1. Run all tests and verify they pass
2. Check that long header test completes quickly (< 100ms)
3. Verify edge cases are handled gracefully

---

## Phase 5: Unsupported Language Codes

### Task 5.1: Test Unsupported Codes Are Rejected

**ID:** **5.1**

Write parameterized tests to verify unsupported language codes are rejected by validator.

**Context:** System only supports 6 languages. Valid but unsupported codes must be rejected.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.1.1** Create describe block: 'Unsupported Language Codes'
- [ ] **5.1.2** Use `forEach` to iterate over `unsupportedLanguageCodes` array
- [ ] **5.1.3** For each code, write test: 'rejects unsupported language code: [code]'
- [ ] **5.1.4** Call `validateLanguageParam(unsupportedCode)`
- [ ] **5.1.5** Verify result is null: `expect(result).toBeNull()`
- [ ] **5.1.6** Run `npm test edgecases` to verify all tests pass
- [ ] **5.1.7** Verify tests cover: zh, ja, ar, ko, pt, ru

**Implementation Notes:**
- Tests validator function specifically
- Validator should return null for unsupported but valid language codes

**Verification Steps:**
1. Run tests and verify all unsupported codes return null
2. Check that validator correctly distinguishes supported from unsupported
3. Verify no false positives (supported codes incorrectly rejected)

---

### Task 5.2: Test Unsupported URL Parameters Fall Back to Default

**ID:** **5.2**

Write tests to verify unsupported language in URL parameter falls back to default.

**Context:** URL param is highest priority, but must still be validated.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.2.1** Use `forEach` to iterate over `unsupportedLanguageCodes` array
- [ ] **5.2.2** For each code, write test: 'falls back to default for unsupported URL param: [code]'
- [ ] **5.2.3** Create NextRequest instance
- [ ] **5.2.4** Call `await detectGuestLanguage(unsupportedCode, request)`
- [ ] **5.2.5** Verify result is 'en' (default language)
- [ ] **5.2.6** Run `npm test edgecases` to verify all tests pass

**Implementation Notes:**
- Tests full detection flow with unsupported URL parameter
- Should skip invalid URL param and continue to next priority level

**Verification Steps:**
1. Run tests and verify all fall back to 'en'
2. Check that unsupported codes don't cause errors
3. Verify priority cascade continues correctly

---

### Task 5.3: Test Unsupported Accept-Language Falls Back to Default

**ID:** **5.3**

Write tests to verify unsupported language in Accept-Language header falls back to default.

**Context:** Header may contain languages we don't support. Must fall back gracefully.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.3.1** Use `forEach` to iterate over `unsupportedLanguageCodes` array
- [ ] **5.3.2** For each code, write test: 'falls back to default for unsupported Accept-Language: [code]'
- [ ] **5.3.3** Create NextRequest and set Accept-Language to unsupported code
- [ ] **5.3.4** Call `await detectGuestLanguage(null, request)`
- [ ] **5.3.5** Verify result is 'en' (default language)
- [ ] **5.3.6** Run `npm test edgecases` to verify all tests pass

**Implementation Notes:**
- Tests header parsing with unsupported languages
- Should parse header successfully but reject unsupported language

**Verification Steps:**
1. Run tests and verify all fall back to 'en'
2. Check that header parsing doesn't crash
3. Verify unsupported languages are filtered out

---

### Task 5.4: Test Unsupported Cookie Falls Back to Header

**ID:** **5.4**

Write test to verify unsupported language in cookie falls back to Accept-Language header.

**Context:** Cookie might contain previously valid but now unsupported language. Skip to next priority.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.4.1** Write test: 'unsupported language in cookie falls back to header'
- [ ] **5.4.2** Create NextRequest instance
- [ ] **5.4.3** Set cookie 'FAQBNB_GUEST_LANG' to 'zh' (Chinese, not supported)
- [ ] **5.4.4** Set Accept-Language header to 'fr-FR'
- [ ] **5.4.5** Call `await detectGuestLanguage(null, request)`
- [ ] **5.4.6** Verify result is 'fr' (skipped invalid cookie, used header)
- [ ] **5.4.7** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests priority cascade: invalid cookie should be skipped
- Next priority level (header) should be used

**Verification Steps:**
1. Run test and verify French is detected
2. Check that cookie is validated before use
3. Verify priority cascade continues correctly

---

### Task 5.5: Test Unsupported Locale Variants

**ID:** **5.5**

Write test to verify locale variants of unsupported languages fall back to default.

**Context:** Headers may contain multiple variants (zh-CN, zh-TW, zh). All should be rejected.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.5.1** Write test: 'handles locale variants of unsupported languages'
- [ ] **5.5.2** Create NextRequest instance
- [ ] **5.5.3** Set Accept-Language to 'zh-CN,zh-TW;q=0.9,zh;q=0.8'
- [ ] **5.5.4** Call `await detectGuestLanguage(null, request)`
- [ ] **5.5.5** Verify result is 'en' (all variants unsupported, fall back to default)
- [ ] **5.5.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests that all variants of unsupported language are rejected
- No variant should incorrectly match a supported language

**Verification Steps:**
1. Run test and verify fallback to 'en'
2. Check that all variants are rejected
3. Verify no partial matches occur

---

## Phase 6: Security Tests (Invalid/Malicious Codes)

### Task 6.1: Test Invalid Codes Are Rejected

**ID:** **6.1**

Write parameterized tests to verify all invalid language codes are rejected.

**Context:** Security is critical. Invalid codes must be rejected to prevent injection attacks.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.1.1** Create describe block: 'Invalid and Malicious Language Codes'
- [ ] **6.1.2** Use `forEach` to iterate over `invalidLanguageCodes` array
- [ ] **6.1.3** For each code, write test: 'rejects invalid code: "[code]"'
- [ ] **6.1.4** Call `validateLanguageParam(invalidCode)`
- [ ] **6.1.5** Verify result is null: `expect(result).toBeNull()`
- [ ] **6.1.6** Run `npm test edgecases` to verify all tests pass
- [ ] **6.1.7** Verify tests cover: empty, spaces, numbers, special chars, injection attempts

**Implementation Notes:**
- Tests validator's security: must reject all invalid/malicious input
- Critical for preventing XSS, injection, path traversal

**Verification Steps:**
1. Run tests and verify all invalid codes return null
2. Check that validator doesn't execute any malicious code
3. Verify security test coverage is comprehensive

---

### Task 6.2: Test Malicious Codes Don't Execute

**ID:** **6.2**

Write tests to verify malicious codes are safely rejected in full detection flow.

**Context:** End-to-end security test: malicious input through detection function.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.2.1** Use `forEach` to iterate over `invalidLanguageCodes` array
- [ ] **6.2.2** For each code, write test: 'does not execute malicious code: "[code]"'
- [ ] **6.2.3** Create NextRequest instance
- [ ] **6.2.4** Call `await detectGuestLanguage(invalidCode, request)`
- [ ] **6.2.5** Verify result is 'en' (safe default)
- [ ] **6.2.6** Verify result is one of supported languages: `expect(['en', 'fr', 'es', 'de', 'nl', 'it']).toContain(result)`
- [ ] **6.2.7** Run `npm test edgecases` to verify all tests pass
- [ ] **6.2.8** Verify no code execution occurs (no alerts, no errors)

**Implementation Notes:**
- Tests that malicious input doesn't bypass validation
- Result must always be safe, supported language

**Verification Steps:**
1. Run tests and verify all return safe defaults
2. Check that no script execution occurs
3. Monitor console for any suspicious activity

---

### Task 6.3: Test Specific Security Vectors

**ID:** **6.3**

Write individual tests for specific security attack vectors.

**Context:** Common attack patterns deserve explicit test coverage.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.3.1** Write test: 'prevents XSS via URL parameter'
- [ ] **6.3.2** Test with `<script>alert("xss")</script>`
- [ ] **6.3.3** Verify result is null from validator
- [ ] **6.3.4** Write test: 'prevents path traversal via URL parameter'
- [ ] **6.3.5** Test with `../../../etc/passwd`
- [ ] **6.3.6** Verify result is null from validator
- [ ] **6.3.7** Write test: 'prevents SQL injection attempts'
- [ ] **6.3.8** Test with `'; DROP TABLE users; --`
- [ ] **6.3.9** Verify result is null from validator
- [ ] **6.3.10** Write test: 'prevents JavaScript injection'
- [ ] **6.3.11** Test with `javascript:alert(1)`
- [ ] **6.3.12** Verify result is null from validator
- [ ] **6.3.13** Write test: 'handles null bytes'
- [ ] **6.3.14** Test with `en\0malicious`
- [ ] **6.3.15** Verify result is null from validator
- [ ] **6.3.16** Write test: 'handles Unicode exploits'
- [ ] **6.3.17** Test with `en\u0000\u0001\u0002`
- [ ] **6.3.18** Verify result is either null or safely normalized to supported language
- [ ] **6.3.19** If normalized, verify it's in supported language list
- [ ] **6.3.20** Run `npm test -- --testNamePattern="security|malicious|injection"` to verify security tests pass

**Implementation Notes:**
- Tests common web security attack patterns
- Validator must safely reject all malicious input
- Unicode test allows for safe normalization as fallback

**Verification Steps:**
1. Run security tests and verify all pass
2. Check that no attack vectors succeed
3. Verify validator is robust against common exploits

---

## Phase 7: Race Condition Tests

### Task 7.1: Test Multiple Rapid Language Changes

**ID:** **7.1**

Write test to verify system handles rapid consecutive language changes without crashing.

**Context:** Users might rapidly click language switcher. System must handle gracefully.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.1.1** Create describe block: 'Race Conditions and Concurrent Operations'
- [ ] **7.1.2** Write test: 'handles multiple rapid language changes'
- [ ] **7.1.3** Create mock `setLanguage` function with `vi.fn()`
- [ ] **7.1.4** Simulate 4 rapid calls: fr, es, de, it
- [ ] **7.1.5** Store all calls in promises array
- [ ] **7.1.6** Use `await Promise.all(promises)` to run concurrently
- [ ] **7.1.7** Verify mock was called 4 times: `expect(mockSetLanguage).toHaveBeenCalledTimes(4)`
- [ ] **7.1.8** Verify no crashes or errors
- [ ] **7.1.9** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests concurrent state updates don't cause crashes
- All calls should complete successfully

**Verification Steps:**
1. Run test and verify all 4 calls complete
2. Check that no errors are thrown
3. Verify concurrent execution works correctly

---

### Task 7.2: Test Simultaneous Detection Calls

**ID:** **7.2**

Write test to verify multiple simultaneous detection calls return consistent results.

**Context:** Concurrent requests might call detection simultaneously. Results should be consistent.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.2.1** Write test: 'handles simultaneous detection calls'
- [ ] **7.2.2** Create NextRequest with Accept-Language: 'fr-FR'
- [ ] **7.2.3** Call `detectGuestLanguage(null, request)` three times in parallel
- [ ] **7.2.4** Use `await Promise.all([...])` to run concurrently
- [ ] **7.2.5** Verify all results are 'fr': `expect(results[0]).toBe('fr')`
- [ ] **7.2.6** Verify all three results are identical
- [ ] **7.2.7** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests that detection is stateless and reentrant
- Same input should always produce same output

**Verification Steps:**
1. Run test and verify all results are 'fr'
2. Check that results are consistent
3. Verify no race conditions affect output

---

### Task 7.3: Test Language Change During Toggle

**ID:** **7.3**

Write test to verify toggle state is handled correctly during language change.

**Context:** User might toggle while language change is in progress. State must be correct.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.3.1** Write test: 'handles language change during toggle'
- [ ] **7.3.2** Create mock state object with `isChangingLanguage: true`
- [ ] **7.3.3** Set initial state: `currentLanguage: 'fr'`, `showOriginal: false`
- [ ] **7.3.4** Verify `isChangingLanguage` flag is true
- [ ] **7.3.5** Add comment explaining toggle should queue or be prevented during language change
- [ ] **7.3.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- This tests the hook behavior pattern (actual hook test is in hook test file)
- Simulates concurrent operations on language state

**Verification Steps:**
1. Run test and verify state is checked correctly
2. Document expected behavior in comments
3. Verify flag prevents state corruption

---

## Phase 8: Component Edge Case Tests

### Task 8.1: Test Component with Only Title Translated

**ID:** **8.1**

Write test to verify component displays item with translated title but original description.

**Context:** Component must render partial translations without errors or missing content.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.1.1** Create describe block: 'ItemDisplay - Edge Cases'
- [ ] **8.1.2** Write test: 'displays item with only title translated'
- [ ] **8.1.3** Create item object using `partiallyTranslatedContent.onlyTitle`
- [ ] **8.1.4** Add required Item fields: id, publicId, links, articles, tags
- [ ] **8.1.5** Render ItemDisplay with item and translationMeta props
- [ ] **8.1.6** Set translationMeta: `isTranslated: true`, `requestedLanguage: 'fr'`
- [ ] **8.1.7** Verify translated title appears: `expect(screen.getByText('Guide Wifi')).toBeInTheDocument()`
- [ ] **8.1.8** Verify original description appears: `expect(screen.getByText('Instructions for connecting to wifi')).toBeInTheDocument()`
- [ ] **8.1.9** Run `npm test edgecases` to verify test passes
- [ ] **8.1.10** Verify no console errors or warnings

**Implementation Notes:**
- Tests component rendering with partial translation data
- Both translated and untranslated fields should display correctly

**Verification Steps:**
1. Run test and verify both fields are displayed
2. Check that no errors appear in console
3. Verify component handles mixed content gracefully

---

### Task 8.2: Test Component with Mixed Translated/Untranslated Links

**ID:** **8.2**

Write test to verify component displays mix of translated and untranslated links.

**Context:** Links array may have some translated, others not. All should display.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.2.1** Write test: 'displays item with mixed translated/untranslated links'
- [ ] **8.2.2** Create item object with `links: partiallyTranslatedContent.mixedLinks`
- [ ] **8.2.3** Render ItemDisplay component
- [ ] **8.2.4** Verify translated link appears: `expect(screen.getByText('Page de connexion routeur')).toBeInTheDocument()`
- [ ] **8.2.5** Verify untranslated link appears: `expect(screen.getByText('Support documentation')).toBeInTheDocument()`
- [ ] **8.2.6** Run `npm test edgecases` to verify test passes
- [ ] **8.2.7** Verify both links are visible and clickable

**Implementation Notes:**
- Tests array handling with mixed translation states
- All links should render regardless of translation status

**Verification Steps:**
1. Run test and verify both links appear
2. Check that link rendering is not affected by translation status
3. Verify no missing or duplicate links

---

### Task 8.3: Test Component with Empty Translation Metadata

**ID:** **8.3**

Write test to verify component handles missing translationMeta prop gracefully.

**Context:** Component might be called without translationMeta in some edge cases.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.3.1** Write test: 'handles empty translation metadata gracefully'
- [ ] **8.3.2** Create basic item object with minimal required fields
- [ ] **8.3.3** Render ItemDisplay with ONLY item prop (no translationMeta)
- [ ] **8.3.4** Use `expect(() => { render(...) }).not.toThrow()` wrapper
- [ ] **8.3.5** Verify component renders without crashing
- [ ] **8.3.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests defensive programming: component should handle missing props
- Should render basic content even without translation metadata

**Verification Steps:**
1. Run test and verify no error is thrown
2. Check that component renders successfully
3. Verify graceful degradation occurs

---

### Task 8.4: Test Component with Null/Undefined Fields

**ID:** **8.4**

Write test to verify component handles null/undefined fields in item data.

**Context:** API might return null/undefined for optional fields. Component must handle safely.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.4.1** Write test: 'handles null/undefined fields in item'
- [ ] **8.4.2** Create item with null description: `description: null as any`
- [ ] **8.4.3** Set undefined links: `links: undefined as any`
- [ ] **8.4.4** Set null articles: `articles: null as any`
- [ ] **8.4.5** Render ItemDisplay component with this item
- [ ] **8.4.6** Use `expect(() => { render(...) }).not.toThrow()` wrapper
- [ ] **8.4.7** Verify component renders without crashing
- [ ] **8.4.8** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests null safety in component
- Component should handle missing/null fields without errors

**Verification Steps:**
1. Run test and verify no crash occurs
2. Check that component renders basic structure
3. Verify null fields don't cause rendering errors

---

### Task 8.5: Test Component with Very Long Content

**ID:** **8.5**

Write test to verify component handles very long translated content.

**Context:** Translations might be much longer than originals. Component must handle gracefully.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.5.1** Write test: 'handles very long translated content'
- [ ] **8.5.2** Create long text string: `'A'.repeat(10000)`
- [ ] **8.5.3** Create item with description set to long text
- [ ] **8.5.4** Render ItemDisplay component
- [ ] **8.5.5** Verify long text appears: `expect(screen.getByText(longText)).toBeInTheDocument()`
- [ ] **8.5.6** Verify component renders without crashing
- [ ] **8.5.7** Run `npm test edgecases` to verify test passes
- [ ] **8.5.8** Check that rendering performance is acceptable

**Implementation Notes:**
- Tests performance with extreme content length
- Component should render successfully even with 10,000 character strings

**Verification Steps:**
1. Run test and verify content is rendered
2. Check that rendering completes quickly
3. Verify no performance issues or hangs

---

### Task 8.6: Test Component with Special Characters

**ID:** **8.6**

Write test to verify component properly escapes special HTML characters.

**Context:** Security: special characters must be escaped to prevent XSS.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.6.1** Write test: 'handles special characters in translated content'
- [ ] **8.6.2** Create special character string: `<>&"'\``
- [ ] **8.6.3** Create item with name including special characters
- [ ] **8.6.4** Render ItemDisplay component
- [ ] **8.6.5** Verify special characters appear as text (not interpreted as HTML)
- [ ] **8.6.6** Use `expect(screen.getByText(\`Test ${specialChars}\`)).toBeInTheDocument()`
- [ ] **8.6.7** Run `npm test edgecases` to verify test passes
- [ ] **8.6.8** Verify React escapes characters properly (no XSS)

**Implementation Notes:**
- Critical security test: HTML special characters must be escaped
- React should automatically escape, but verify it happens

**Verification Steps:**
1. Run test and verify characters appear as text
2. Check that no HTML is interpreted
3. Verify XSS prevention is working

---

## Phase 9: Error Recovery Tests

### Task 9.1: Test Recovery from Network Error

**ID:** **9.1**

Write test to verify system recovers from network error during detection.

**Context:** Network issues might occur during header access. Must not crash.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **9.1.1** Create describe block: 'Error Recovery'
- [ ] **9.1.2** Write test: 'recovers from network error during language detection'
- [ ] **9.1.3** Create NextRequest instance
- [ ] **9.1.4** Spy on `request.headers.get` with `vi.spyOn()`
- [ ] **9.1.5** Mock implementation to throw Error: 'Network error'
- [ ] **9.1.6** Call `await detectGuestLanguage(null, request)`
- [ ] **9.1.7** Verify result is 'en' (falls back to default)
- [ ] **9.1.8** Verify function does not throw error
- [ ] **9.1.9** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests error handling for network failures
- System should gracefully degrade to default language

**Verification Steps:**
1. Run test and verify fallback to 'en'
2. Check that error is caught and handled
3. Verify no uncaught exceptions

---

### Task 9.2: Test Recovery from Parsing Error

**ID:** **9.2**

Write test to verify system recovers from Accept-Language parsing error.

**Context:** Malformed headers might cause parsing errors. Must handle gracefully.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **9.2.1** Write test: 'recovers from parsing error in Accept-Language'
- [ ] **9.2.2** Create NextRequest instance
- [ ] **9.2.3** Set Accept-Language to 'fr;q=NaN' (causes parsing error)
- [ ] **9.2.4** Call `await detectGuestLanguage(null, request)`
- [ ] **9.2.5** Verify result is defined (handles parsing error gracefully)
- [ ] **9.2.6** Run `npm test edgecases` to verify test passes

**Implementation Notes:**
- Tests error handling in header parsing logic
- Should catch parsing errors and fall back safely

**Verification Steps:**
1. Run test and verify result is defined
2. Check that parsing error doesn't crash system
3. Verify safe fallback behavior

---

### Task 9.3: Test Concurrent Errors Don't Corrupt State

**ID:** **9.3**

Write test to verify concurrent errors are handled independently without state corruption.

**Context:** Multiple concurrent requests with errors must not affect each other.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **9.3.1** Write test: 'handles concurrent errors without state corruption'
- [ ] **9.3.2** Create two NextRequest instances
- [ ] **9.3.3** Set request1 Accept-Language to 'invalid' (causes error)
- [ ] **9.3.4** Set request2 Accept-Language to 'fr-FR' (valid)
- [ ] **9.3.5** Call both detections concurrently with `Promise.all`
- [ ] **9.3.6** Verify result1 is 'en' (error fallback)
- [ ] **9.3.7** Verify result2 is 'fr' (successful detection)
- [ ] **9.3.8** Run `npm test edgecases` to verify test passes
- [ ] **9.3.9** Verify errors are isolated (don't affect each other)

**Implementation Notes:**
- Tests that error in one request doesn't affect concurrent requests
- Each request should be handled independently

**Verification Steps:**
1. Run test and verify results are correct
2. Check that error in request1 doesn't affect request2
3. Verify state isolation between concurrent operations

---

## Phase 10: Documentation

### Task 10.1: Document Known Limitations

**ID:** **10.1**

Add documentation of known limitations and edge cases to test file.

**Context:** Clear documentation prevents confusion about expected behavior.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **10.1.1** Add JSDoc block comment at top of test file (after imports)
- [ ] **10.1.2** Title: 'KNOWN LIMITATIONS AND EDGE CASES'
- [ ] **10.1.3** Document limitation 1: Cookie Blocking
- [ ] **10.1.4** Explain: When cookies blocked, preference won't persist across visits
- [ ] **10.1.5** Note: This is expected privacy-first behavior
- [ ] **10.1.6** Document limitation 2: Partial Translations
- [ ] **10.1.7** Explain: Content may show mix of translated and original text
- [ ] **10.1.8** Note: TranslationBanner still shows to indicate partial translation
- [ ] **10.1.9** Document limitation 3: Unsupported Languages
- [ ] **10.1.10** Explain: Requests for unsupported languages fall back to English silently
- [ ] **10.1.11** Note: Future enhancement could add explicit notification
- [ ] **10.1.12** Document limitation 4: Accept-Language Parsing
- [ ] **10.1.13** Explain: Very complex/malformed headers may not parse perfectly
- [ ] **10.1.14** Note: System prioritizes stability over perfect parsing
- [ ] **10.1.15** Document limitation 5: Race Conditions
- [ ] **10.1.16** Explain: Rapid language changes result in "last write wins" behavior
- [ ] **10.1.17** Note: Acceptable for user-initiated actions, no data corruption
- [ ] **10.1.18** Format as numbered list with clear sections
- [ ] **10.1.19** Run `npm run typecheck` to verify documentation doesn't break compilation

**Implementation Notes:**
- Documentation should be in code comments, not separate file
- Helps future developers understand design decisions
- Distinguishes limitations from bugs

**Verification Steps:**
1. Review documentation for clarity and completeness
2. Verify all major limitations are documented
3. Check that format is readable and well-organized

---

## Phase 11: Test Execution and Verification

### Task 11.1: Run All Edge Case Tests

**ID:** **11.1**

Execute all edge case tests and verify they pass.

**Context:** Comprehensive test run ensures all edge cases are properly handled.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **11.1.1** Run `npm test edgecases` command
- [ ] **11.1.2** Verify all partial translation tests pass
- [ ] **11.1.3** Verify all cookie blocked scenario tests pass
- [ ] **11.1.4** Verify all malformed header tests pass
- [ ] **11.1.5** Verify all unsupported language tests pass
- [ ] **11.1.6** Verify all security/injection tests pass
- [ ] **11.1.7** Verify all race condition tests pass
- [ ] **11.1.8** Verify all component edge case tests pass
- [ ] **11.1.9** Verify all error recovery tests pass
- [ ] **11.1.10** Check that exit code is 0 (all tests passed)
- [ ] **11.1.11** Review test output for any warnings or errors
- [ ] **11.1.12** Fix any failing tests before proceeding

**Implementation Notes:**
- All edge case tests must pass before task is complete
- Review failures carefully to understand root cause

**Verification Steps:**
1. Run full edge case test suite
2. Check that all tests pass
3. Review any warnings in console
4. Verify no unexpected behaviors

---

### Task 11.2: Run Security Tests Specifically

**ID:** **11.2**

Execute security-focused tests to verify injection prevention.

**Context:** Security is critical. Dedicated test run ensures all attack vectors are blocked.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **11.2.1** Run `npm test -- --testNamePattern="security|malicious|injection"` command
- [ ] **11.2.2** Verify all XSS prevention tests pass
- [ ] **11.2.3** Verify all SQL injection prevention tests pass
- [ ] **11.2.4** Verify all path traversal prevention tests pass
- [ ] **11.2.5** Verify all JavaScript injection prevention tests pass
- [ ] **11.2.6** Verify all Unicode exploit tests pass
- [ ] **11.2.7** Check that no malicious code is executed during tests
- [ ] **11.2.8** Verify all security tests return safe defaults
- [ ] **11.2.9** Review test output for security-specific issues
- [ ] **11.2.10** Document any security concerns found

**Implementation Notes:**
- Security tests are subset of edge case tests
- All must pass for production readiness

**Verification Steps:**
1. Run security-focused test suite
2. Verify all injection attempts are blocked
3. Check that no malicious execution occurs
4. Confirm validator is robust

---

### Task 11.3: Run Coverage Report

**ID:** **11.3**

Generate and review coverage report for edge case tests.

**Context:** Coverage metrics help identify untested edge cases.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **11.3.1** Run `npm run test:coverage -- edgecases` command
- [ ] **11.3.2** Open coverage report (typically `coverage/index.html`)
- [ ] **11.3.3** Review coverage for `src/lib/i18n/guest-language.ts`
- [ ] **11.3.4** Verify edge case coverage for error paths >90%
- [ ] **11.3.5** Review coverage for `src/components/ItemDisplay.tsx`
- [ ] **11.3.6** Identify any uncovered edge case branches
- [ ] **11.3.7** Add tests for any critical uncovered edge cases
- [ ] **11.3.8** Document coverage metrics in test file comments

**Implementation Notes:**
- Focus on error path coverage (edge cases)
- 100% coverage not required, but major edge cases should be covered

**Verification Steps:**
1. Generate coverage report
2. Review metrics for edge case coverage
3. Identify gaps in coverage
4. Add tests for critical gaps

---

### Task 11.4: Run Full Test Suite

**ID:** **11.4**

Execute complete test suite to ensure no regressions.

**Context:** Edge case tests must not break existing functionality.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **11.4.1** Run `npm test` command (all tests)
- [ ] **11.4.2** Verify all existing tests still pass
- [ ] **11.4.3** Verify all new edge case tests pass
- [ ] **11.4.4** Check that no new test failures introduced
- [ ] **11.4.5** Verify TypeScript compilation succeeds: `npm run typecheck`
- [ ] **11.4.6** Check exit code is 0 (success)
- [ ] **11.4.7** Review test output for warnings

**Implementation Notes:**
- Full suite includes normal scenario tests + edge case tests
- All must pass before committing changes

**Verification Steps:**
1. Run complete test suite
2. Verify no regressions
3. Check that all tests pass
4. Verify type safety is maintained

---

### Task 11.5: Perform Manual Testing

**ID:** **11.5**

Manually test edge cases in development environment.

**Context:** Automated tests don't catch everything. Manual verification is important.

**Files to modify:**
- None (manual testing only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **11.5.1** Start dev server: `npm run dev`
- [ ] **11.5.2** Test with cookies disabled in browser settings
- [ ] **11.5.3** Navigate to item page and verify language detection still works
- [ ] **11.5.4** Test with aggressive ad blocker enabled
- [ ] **11.5.5** Verify translation features still function
- [ ] **11.5.6** Test with privacy extensions (Privacy Badger, uBlock Origin)
- [ ] **11.5.7** Test rapid clicking on language switcher
- [ ] **11.5.8** Verify no UI errors or crashes
- [ ] **11.5.9** Test in browser private/incognito mode
- [ ] **11.5.10** Verify cookie-less operation works
- [ ] **11.5.11** Test with VPN or proxy (if available)
- [ ] **11.5.12** Check that Accept-Language detection works
- [ ] **11.5.13** Test with slow network (throttling in dev tools)
- [ ] **11.5.14** Verify graceful handling of delays
- [ ] **11.5.15** Document any issues found during manual testing

**Implementation Notes:**
- Manual testing catches real-world edge cases automated tests might miss
- Test in multiple browsers if possible (Chrome, Firefox, Safari)

**Verification Steps:**
1. Complete all manual test scenarios
2. Document results
3. Create bug tickets for any issues found
4. Verify all critical paths work

---

## Phase 12: Finalization

### Task 12.1: Update Test Documentation

**ID:** **12.1**

Ensure all test files have clear documentation.

**Context:** Well-documented tests are maintainable tests.

**Files to modify:**
- Edit: `src/lib/i18n/__tests__/guest-language.edgecases.test.ts`
- Edit: `src/components/__tests__/ItemDisplay.edgecases.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **12.1.1** Review all test files for documentation completeness
- [ ] **12.1.2** Verify each describe block has clear description
- [ ] **12.1.3** Verify each test has clear, descriptive name
- [ ] **12.1.4** Add comments for complex test logic where needed
- [ ] **12.1.5** Ensure module-level JSDoc is present
- [ ] **12.1.6** Verify known limitations are documented
- [ ] **12.1.7** Add examples to fixtures explaining their purpose
- [ ] **12.1.8** Update README if needed to mention edge case tests

**Implementation Notes:**
- Documentation helps future maintainers understand why tests exist
- Clear test names reduce need for extensive comments

**Verification Steps:**
1. Review all test files for clarity
2. Check that test names are descriptive
3. Verify documentation is helpful
4. Get peer review if available

---

### Task 12.2: Commit Changes

**ID:** **12.2**

Commit all edge case test files with proper message.

**Context:** Follow project git conventions for commits.

**Files to modify:**
- None (git operations only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **12.2.1** Run `git status` to review all changed files
- [ ] **12.2.2** Verify only test files are included (no source code changes)
- [ ] **12.2.3** Run `git add .` to stage all changes
- [ ] **12.2.4** Create commit with message: `[REQ-E04-024] Test edge cases`
- [ ] **12.2.5** Add second line: blank
- [ ] **12.2.6** Add third line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- [ ] **12.2.7** Verify commit succeeds
- [ ] **12.2.8** Run `git log` to verify commit appears correctly
- [ ] **12.2.9** Push to remote if appropriate

**Implementation Notes:**
- Follow project commit message format exactly
- Include Co-Authored-By line as per project standards

**Verification Steps:**
1. Review git status
2. Verify commit message format
3. Check commit appears in log
4. Push if required by workflow

---

## Dependencies

**Depends On (Must Complete First):**
- REQ-E04-002 (Task 1.2): Create Guest Language Utility Module - Provides functions to test
- REQ-E04-014 (Task 4.1): Create useGuestLanguage Hook - Provides hook to test
- REQ-E04-017 (Task 5.2): Update ItemDisplay Component - Provides component to test
- REQ-E04-021 (Task 6.2): Create Server-Side Language Detection Utility - Provides detection functions

**Blocks (Cannot Start Until This Completes):**
- None - Testing task doesn't block other work

**Parallel Safety:**
- Safe to run in parallel with other testing tasks (REQ-E04-022, REQ-E04-023, REQ-E04-025, REQ-E04-026)
- Safe to run in parallel with all other Epic 4 tasks
- Only creates test files, doesn't modify source code

---

## Technical Context

**Project Stack:**
- Next.js 15 (App Router)
- TypeScript 5.x
- Vitest (testing framework)
- React Testing Library (@testing-library/react)
- next/server (NextRequest, NextResponse APIs)

**Key Files:**
- `src/lib/i18n/guest-language.ts` - Functions under test
- `src/components/ItemDisplay.tsx` - Component under test
- `src/hooks/useGuestLanguage.ts` - Hook under test

**Testing Patterns:**
- Use fixtures for reusable edge case data
- Parameterized tests for multiple similar scenarios
- Mock NextRequest for controlled testing
- Security focus: test injection prevention thoroughly
- Error recovery: verify graceful degradation

---

## Acceptance Criteria Summary

This task is complete when:

1. **Fixtures Created:**
   - [ ] Edge case fixtures file created with comprehensive test data
   - [ ] Malformed headers, invalid codes, unsupported codes all defined
   - [ ] Partial translation data structures created
   - [ ] Helper functions for cookie blocking created

2. **Edge Case Tests Written:**
   - [ ] Partial translation tests (mixed content handling)
   - [ ] Cookie blocked scenario tests (privacy mode, ad blockers)
   - [ ] Malformed Accept-Language header tests
   - [ ] Unsupported language code tests
   - [ ] Security tests (XSS, injection, path traversal prevention)
   - [ ] Race condition tests (concurrent operations)
   - [ ] Component edge case tests (null handling, long content)
   - [ ] Error recovery tests (network errors, parsing errors)

3. **Security Verified:**
   - [ ] All XSS attempts blocked
   - [ ] All SQL injection attempts blocked
   - [ ] All path traversal attempts blocked
   - [ ] All malicious codes safely rejected

4. **All Tests Pass:**
   - [ ] Edge case test suite passes: `npm test edgecases`
   - [ ] Security test suite passes: `npm test -- --testNamePattern="security|malicious|injection"`
   - [ ] Full test suite passes: `npm test`
   - [ ] No regressions in existing tests

5. **Coverage Adequate:**
   - [ ] Edge case coverage >90% for error paths
   - [ ] All identified edge cases have test coverage

6. **Manual Testing Complete:**
   - [ ] Tested with cookies disabled
   - [ ] Tested with ad blockers
   - [ ] Tested rapid language switching
   - [ ] Tested in private/incognito mode

7. **Documentation Complete:**
   - [ ] Known limitations documented in test file
   - [ ] All tests have clear descriptions
   - [ ] Module documentation added

8. **Changes Committed:**
   - [ ] All test files committed with proper message
   - [ ] Co-Authored-By line included

---

## Notes

- **Edge Case Focus:** Tests cover UNUSUAL scenarios, not normal operation
- **Security Priority:** Injection prevention is critical - test thoroughly
- **Graceful Degradation:** System should never crash, always fall back safely
- **Cookie Blocking:** Common privacy scenario that must work (with reduced functionality)
- **Malformed Input:** Real-world data can be messy - handle all variants
- **Race Conditions:** Concurrent operations must not corrupt state
- **Performance:** Even error handling must be fast (< 5ms overhead)
- **Documentation:** Known limitations are not bugs - document clearly
- **Maintainability:** Use fixtures and parameterized tests for efficiency

---

*Document created: 2026-01-22 23:56*
*Status: PENDING - Ready for implementation by Agent 04*
