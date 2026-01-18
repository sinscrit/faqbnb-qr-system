# REQ-256: Manual End-to-End Validation for Localization Features - Detailed Task Breakdown

**Generated:** 2026-01-18 17:15:00 UTC
**Last Modified:** 2026-01-18 17:15:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-256
**Overview Document:** docs/REQ-256-manual-e2e-validation-overview.md
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.4)
**Status:** Detailed Task Breakdown

---

## Document Purpose

This document breaks down the Manual E2E Validation task into granular, actionable steps that can be executed by a junior developer or AI coding agent. Each task is designed to be approximately 1 story point and includes explicit acceptance criteria, file paths, and validation steps.

---

## Prerequisites

Before executing these tasks, the following must be complete:

| Dependency | REQ ID | Description |
|------------|--------|-------------|
| Translation Tables Migration | REQ-223 | Database tables for translations exist |
| next-intl Configuration | REQ-229 | i18n framework is installed and configured |
| Translation Files | REQ-233 | Static UI translation files exist for all 6 languages |
| Translation Service | REQ-240 | AI translation service wrapper is functional |
| Job Queue Module | REQ-243 | Background job processing infrastructure exists |
| LanguageSwitcher | REQ-248 | Language switching UI component exists |
| Language Preference API | REQ-251 | API endpoint for persisting language preference exists |
| Unit Tests | REQ-253 | Translation service unit tests pass |
| Integration Tests | REQ-254 | Job processing integration tests pass |
| Component Tests | REQ-255 | LanguageSwitcher component tests pass |

**Staging URL:** https://faqbnb-staging.up.railway.app

---

## Task Breakdown

### Task 1: Create Testing Directory Structure

**Objective:** Set up the documentation directory for test protocols and results.

**File Operations:**
- CREATE: `docs/testing/` directory (if not exists)

**Steps:**

1.1. Check if `docs/testing/` directory exists:
```bash
ls -la docs/testing/
```

1.2. If directory does not exist, create it:
```bash
mkdir -p docs/testing
```

**Acceptance Criteria:**
- [ ] `docs/testing/` directory exists
- [ ] Directory is accessible and writable

**Estimated Effort:** 0.25 story points

---

### Task 2: Create E2E Test Protocol Document

**Objective:** Create a comprehensive manual test protocol document with all test cases.

**File to Create:** `docs/testing/L10N-E2E-Test-Protocol.md`

**Steps:**

2.1. Create the test protocol document with the following structure:

```markdown
# L10N Epic 1 - Manual E2E Test Protocol

**Document Version:** 1.0
**Created:** [CURRENT_DATE]
**Last Modified:** [CURRENT_DATE]
**Target Application Version:** [GET FROM /api/version]

---

## Test Environment Requirements

### Staging Environment
- **URL:** https://faqbnb-staging.up.railway.app
- **Version API:** https://faqbnb-staging.up.railway.app/api/version

### Browser Requirements
| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest | Primary |
| Firefox | Latest | Secondary |
| Safari | Latest | Secondary |
| Edge | Latest | Secondary |
| iOS Safari | Latest | Mobile |
| Android Chrome | Latest | Mobile |

### Test Accounts
| Account Type | Username | Purpose |
|--------------|----------|---------|
| Admin User | [CREATE_BEFORE_TEST] | Full feature access |
| Guest User | N/A (anonymous) | Language detection testing |

### Pre-Test Checklist
- [ ] Staging deployment is current (check /api/version)
- [ ] All L10N components deployed (REQ-223 through REQ-255)
- [ ] Test user accounts created
- [ ] Browser cookies/cache cleared
- [ ] Network connectivity stable

---

## Supported Languages Reference

| Code | English Name | Native Name |
|------|--------------|-------------|
| en | English | English |
| fr | French | Francais |
| es | Spanish | Espanol |
| de | German | Deutsch |
| nl | Dutch | Nederlands |
| it | Italian | Italiano |

---

## Test Suite 1: Language Switching Functionality

### TC-1.1: LanguageSwitcher Component Presence

**Priority:** Critical
**Prerequisites:** Logged in as any user

**Steps:**
1. Navigate to https://faqbnb-staging.up.railway.app/dashboard2
2. Locate the header/navigation area
3. Find the LanguageSwitcher dropdown component

**Expected Results:**
- [ ] LanguageSwitcher dropdown is visible in the header
- [ ] Current language is displayed (default: English or detected language)
- [ ] Dropdown is interactive (clickable)

**Pass/Fail:** ______

---

### TC-1.2: Language Dropdown Options

**Priority:** Critical
**Prerequisites:** TC-1.1 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Observe the dropdown options

**Expected Results:**
- [ ] Dropdown expands showing all 6 languages
- [ ] Languages displayed with native names:
  - [ ] English
  - [ ] Francais
  - [ ] Espanol
  - [ ] Deutsch
  - [ ] Nederlands
  - [ ] Italiano
- [ ] Current language is highlighted/indicated

**Pass/Fail:** ______

---

### TC-1.3: Language Selection - French

**Priority:** Critical
**Prerequisites:** TC-1.2 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Select "Francais" (French)
3. Observe the page

**Expected Results:**
- [ ] Dropdown closes after selection
- [ ] Interface updates WITHOUT full page reload
- [ ] Navigation labels change to French
- [ ] Common buttons show French text (Enregistrer, Annuler, etc.)
- [ ] LanguageSwitcher now shows "Francais" as selected

**Pass/Fail:** ______

---

### TC-1.4: Language Selection - Spanish

**Priority:** High
**Prerequisites:** TC-1.1 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Select "Espanol" (Spanish)
3. Observe the page

**Expected Results:**
- [ ] Interface updates to Spanish
- [ ] Common UI elements translated correctly
- [ ] No untranslated text visible (no "common.save" keys)

**Pass/Fail:** ______

---

### TC-1.5: Language Selection - German

**Priority:** High
**Prerequisites:** TC-1.1 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Select "Deutsch" (German)
3. Observe the page, especially button widths and text containers

**Expected Results:**
- [ ] Interface updates to German
- [ ] No text overflow or clipping (German has longer words)
- [ ] All buttons fully display their text

**Pass/Fail:** ______

---

### TC-1.6: Language Selection - Dutch

**Priority:** High
**Prerequisites:** TC-1.1 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Select "Nederlands" (Dutch)
3. Observe the page

**Expected Results:**
- [ ] Interface updates to Dutch
- [ ] All UI elements properly translated

**Pass/Fail:** ______

---

### TC-1.7: Language Selection - Italian

**Priority:** High
**Prerequisites:** TC-1.1 passed

**Steps:**
1. Click on the LanguageSwitcher dropdown
2. Select "Italiano" (Italian)
3. Observe the page

**Expected Results:**
- [ ] Interface updates to Italian
- [ ] All UI elements properly translated

**Pass/Fail:** ______

---

### TC-1.8: Language Persistence - Cookie (Guest User)

**Priority:** Critical
**Prerequisites:** Guest user (not logged in)

**Steps:**
1. Clear all browser cookies for the staging domain
2. Navigate to https://faqbnb-staging.up.railway.app
3. Change language to French
4. Close the browser tab completely
5. Open a new browser tab
6. Navigate to https://faqbnb-staging.up.railway.app

**Expected Results:**
- [ ] Page loads in French
- [ ] LanguageSwitcher shows "Francais" as selected
- [ ] FAQBNB_LANG cookie exists with value "fr"

**Verification:**
- Check cookie: Developer Tools > Application > Cookies > FAQBNB_LANG = "fr"

**Pass/Fail:** ______

---

### TC-1.9: Language Persistence - Database (Logged-in User)

**Priority:** Critical
**Prerequisites:** Test user account exists

**Steps:**
1. Log in to test account
2. Change language to German (Deutsch)
3. Log out
4. Clear browser cookies
5. Log back in with same account

**Expected Results:**
- [ ] After login, page loads in German
- [ ] User's preferred_language in database is "de"

**Verification (via Supabase):**
```sql
SELECT preferred_language FROM users WHERE email = '[test_email]';
-- Expected: 'de'
```

**Pass/Fail:** ______

---

### TC-1.10: Language Detection Fallback - Accept-Language

**Priority:** High
**Prerequisites:** Clear all cookies, not logged in

**Steps:**
1. Clear all cookies for staging domain
2. Set browser language preference to Spanish (es)
   - Chrome: Settings > Languages > Move Spanish to top
3. Navigate to https://faqbnb-staging.up.railway.app in incognito/private mode

**Expected Results:**
- [ ] Page loads in Spanish (detected from Accept-Language header)
- [ ] OR page loads in English if Spanish detection fails (fallback)

**Pass/Fail:** ______

---

## Test Suite 2: Translation Rendering Correctness

### TC-2.1: Dashboard Page - English Baseline

**Priority:** High
**Prerequisites:** Language set to English

**Steps:**
1. Navigate to /dashboard2
2. Document all visible text elements

**Expected Results:**
- [ ] Page title: "Dashboard" (or appropriate)
- [ ] Navigation items properly labeled
- [ ] Statistics cards have English labels
- [ ] Action buttons show English text

**Screenshot Required:** Yes - capture for comparison

**Pass/Fail:** ______

---

### TC-2.2: Dashboard Page - All Languages Comparison

**Priority:** High
**Prerequisites:** TC-2.1 completed with baseline screenshot

**Steps:**
For EACH language (fr, es, de, nl, it):
1. Switch to the language
2. Take a screenshot
3. Compare with English baseline
4. Document any missing translations

**Expected Results (per language):**

**French (fr):**
- [ ] Dashboard title translated
- [ ] Navigation translated
- [ ] Buttons translated
- [ ] No English text visible (except proper nouns)
- [ ] No translation keys visible

**Spanish (es):**
- [ ] Same checks as French

**German (de):**
- [ ] Same checks as French
- [ ] EXTRA: No text overflow/clipping

**Dutch (nl):**
- [ ] Same checks as French

**Italian (it):**
- [ ] Same checks as French

**Pass/Fail:** ______

---

### TC-2.3: Login Page Translations

**Priority:** High

**Steps:**
For EACH language:
1. Navigate to /login (while logged out)
2. Verify form labels are translated
3. Verify button text is translated
4. Verify any helper text is translated

**Expected Results:**
- [ ] "Email" label translated per language
- [ ] "Password" label translated per language
- [ ] "Sign In" button translated per language
- [ ] "Forgot Password" link translated per language
- [ ] "Sign up" link translated (if present)

**Pass/Fail:** ______

---

### TC-2.4: Error Message Translations

**Priority:** Medium

**Steps:**
1. Set language to French
2. Navigate to /login
3. Submit form with empty fields
4. Observe error messages

**Expected Results:**
- [ ] Validation error messages appear in French
- [ ] "This field is required" equivalent in French

**Repeat for 2 other languages:** Spanish, German

**Pass/Fail:** ______

---

### TC-2.5: Missing Translation Key Detection

**Priority:** Critical

**Steps:**
1. Rapidly switch between all 6 languages on /dashboard2
2. On each switch, scan the page for any text that looks like:
   - `common.save`
   - `auth.signIn`
   - `dashboard.title`
   - Any dot-notation strings

**Expected Results:**
- [ ] No translation keys visible anywhere
- [ ] All text is properly translated human-readable text

**If issues found, document:**
| Key Found | Page | Language | Location |
|-----------|------|----------|----------|

**Pass/Fail:** ______

---

### TC-2.6: Layout Overflow Testing - German

**Priority:** High
**Prerequisites:** Language set to German

**Steps:**
1. Navigate to /dashboard2
2. Navigate to /admin/items
3. Navigate to any modal dialog
4. Check all buttons, labels, table headers

**Expected Results:**
- [ ] No text is cut off mid-word
- [ ] No horizontal scrollbars appear unexpectedly
- [ ] Buttons expand to fit text or text wraps appropriately
- [ ] Table columns accommodate German headers

**Pass/Fail:** ______

---

### TC-2.7: Mobile Viewport Testing

**Priority:** High

**Steps:**
1. Set browser viewport to 375px width (iPhone size)
2. Set language to German
3. Navigate through /dashboard2, /login, /admin/items

**Expected Results:**
- [ ] LanguageSwitcher is accessible on mobile
- [ ] No horizontal overflow
- [ ] Text remains readable
- [ ] Touch targets are appropriately sized

**Pass/Fail:** ______

---

## Test Suite 3: Translation Job Processing

### TC-3.1: Job Status API Availability

**Priority:** Critical

**Steps:**
1. Make GET request to translation jobs API:
```bash
curl -X GET "https://faqbnb-staging.up.railway.app/api/admin/translation-jobs" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Expected Results:**
- [ ] API returns 200 OK
- [ ] Response is valid JSON
- [ ] Response includes `success: true`
- [ ] Response includes `data` array (may be empty)

**Pass/Fail:** ______

---

### TC-3.2: Translation Job Creation

**Priority:** High
**Prerequisites:** TC-3.1 passed, test content exists

**Steps:**
1. Trigger a translation job (via admin UI or API)
2. Note the timestamp
3. Query the translation jobs API

**Expected Results:**
- [ ] New job appears in the jobs list
- [ ] Job status is "queued"
- [ ] Job has valid entityType (article, item, link, or tag)
- [ ] Job has valid sourceLanguage and targetLanguage

**Pass/Fail:** ______

---

### TC-3.3: Job Processing Lifecycle

**Priority:** High
**Prerequisites:** TC-3.2 passed, job in queue

**Steps:**
1. Trigger job processing:
```bash
curl -X POST "https://faqbnb-staging.up.railway.app/api/admin/process-translations" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```
2. Query job status every 30 seconds
3. Monitor status transitions

**Expected Results:**
- [ ] Job transitions from "queued" to "processing"
- [ ] Job transitions from "processing" to "completed" (or "failed")
- [ ] If completed, `completedAt` timestamp is set
- [ ] Total processing time under 5 minutes

**Pass/Fail:** ______

---

### TC-3.4: Translation Results Verification

**Priority:** High
**Prerequisites:** TC-3.3 passed, job completed

**Steps:**
1. Query the relevant translation table for the processed entity
2. Verify translations exist for target language

**Verification (example for article):**
```sql
SELECT * FROM article_translations
WHERE article_id = '[ENTITY_ID]'
AND language = '[TARGET_LANG]';
```

**Expected Results:**
- [ ] Translation record exists
- [ ] `translation_status` = 'completed'
- [ ] `title` and/or `description` are populated
- [ ] `translated_at` timestamp is set

**Pass/Fail:** ______

---

### TC-3.5: Failed Job Handling

**Priority:** Medium

**Steps:**
1. Create a job that will fail (e.g., reference non-existent entity)
2. Trigger job processing
3. Check job status after processing

**Expected Results:**
- [ ] Job status changes to "failed"
- [ ] `error_message` field is populated
- [ ] `attempts` counter shows retry attempts
- [ ] Application does not crash

**Pass/Fail:** ______

---

### TC-3.6: Job Filtering and Pagination

**Priority:** Medium

**Steps:**
1. Query jobs with status filter:
```bash
curl "https://faqbnb-staging.up.railway.app/api/admin/translation-jobs?status=completed"
```
2. Query jobs with pagination:
```bash
curl "https://faqbnb-staging.up.railway.app/api/admin/translation-jobs?limit=5&offset=0"
```

**Expected Results:**
- [ ] Status filter returns only matching jobs
- [ ] Pagination returns correct number of results
- [ ] `total` count is accurate

**Pass/Fail:** ______

---

## Test Suite 4: Cross-Browser Compatibility

### TC-4.1: Chrome Desktop

**Priority:** Critical

**Steps:**
1. Open Chrome (latest version)
2. Execute TC-1.1 through TC-1.3
3. Document any browser-specific issues

**Expected Results:**
- [ ] Language switching works correctly
- [ ] No visual glitches
- [ ] Cookie persistence works

**Browser Version Tested:** ______

**Pass/Fail:** ______

---

### TC-4.2: Firefox Desktop

**Priority:** High

**Steps:**
1. Open Firefox (latest version)
2. Execute TC-1.1 through TC-1.3
3. Document any browser-specific issues

**Expected Results:**
- [ ] Language switching works correctly
- [ ] No visual glitches
- [ ] Cookie persistence works

**Browser Version Tested:** ______

**Pass/Fail:** ______

---

### TC-4.3: Safari Desktop

**Priority:** High

**Steps:**
1. Open Safari (latest version on macOS)
2. Execute TC-1.1 through TC-1.3
3. Document any browser-specific issues

**Expected Results:**
- [ ] Language switching works correctly
- [ ] No visual glitches
- [ ] Cookie persistence works (note: Safari has stricter cookie policies)

**Browser Version Tested:** ______

**Pass/Fail:** ______

---

### TC-4.4: Edge Desktop

**Priority:** Medium

**Steps:**
1. Open Microsoft Edge (latest version)
2. Execute TC-1.1 through TC-1.3
3. Document any browser-specific issues

**Expected Results:**
- [ ] Language switching works correctly
- [ ] No visual glitches
- [ ] Cookie persistence works

**Browser Version Tested:** ______

**Pass/Fail:** ______

---

### TC-4.5: iOS Safari Mobile

**Priority:** High

**Steps:**
1. Open Safari on iOS device (or simulator)
2. Navigate to staging URL
3. Test language switching via LanguageSwitcher
4. Test cookie persistence

**Expected Results:**
- [ ] LanguageSwitcher is accessible via touch
- [ ] Dropdown works correctly on touch devices
- [ ] Language change applies correctly
- [ ] Mobile layout is not broken

**Device/iOS Version Tested:** ______

**Pass/Fail:** ______

---

### TC-4.6: Android Chrome Mobile

**Priority:** High

**Steps:**
1. Open Chrome on Android device (or emulator)
2. Navigate to staging URL
3. Test language switching
4. Test cookie persistence

**Expected Results:**
- [ ] LanguageSwitcher is accessible via touch
- [ ] Language change applies correctly
- [ ] Mobile layout is not broken

**Device/Android Version Tested:** ______

**Pass/Fail:** ______

---

## Defect Reporting Guidelines

When a test fails, create a defect report with:

1. **Defect ID:** DEF-L10N-[NUMBER]
2. **Test Case ID:** The failing test case
3. **Severity:** Critical / High / Medium / Low
4. **Environment:** Browser, device, OS
5. **Steps to Reproduce:** Exact steps
6. **Expected vs Actual:** Clear comparison
7. **Screenshots/Video:** Visual evidence
8. **Console Errors:** Any JavaScript errors

---

## Test Execution Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Reviewer | | | |
| QA Lead | | | |
```

**Acceptance Criteria:**
- [ ] Document contains all 4 test suites
- [ ] Each test case has clear steps and expected results
- [ ] Document includes defect reporting guidelines
- [ ] Sign-off section present

**Estimated Effort:** 1 story point

---

### Task 3: Create Test Results Template

**Objective:** Create a template for recording test execution results.

**File to Create:** `docs/testing/L10N-E2E-Test-Results-Template.md`

**Steps:**

3.1. Create the test results template:

```markdown
# L10N E2E Test Results

**Document Version:** 1.0
**Created:** [DATE]
**Last Modified:** [DATE]

---

## Test Session Information

| Field | Value |
|-------|-------|
| **Test Date** | YYYY-MM-DD |
| **Tester Name** | [NAME] |
| **Environment** | Staging |
| **Application URL** | https://faqbnb-staging.up.railway.app |
| **Application Version** | [FROM /api/version] |
| **Primary Browser** | [BROWSER/VERSION] |
| **Operating System** | [OS/VERSION] |

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Test Cases** | |
| **Passed** | |
| **Failed** | |
| **Blocked** | |
| **Pass Rate** | % |
| **Overall Status** | PASS / FAIL / BLOCKED |

### Go/No-Go Recommendation

- [ ] **GO** - All critical tests passed, ready for production
- [ ] **CONDITIONAL GO** - Minor issues documented, can proceed with known limitations
- [ ] **NO-GO** - Critical issues found, requires fixes before production

---

## Test Suite Results Summary

| Suite | Total | Passed | Failed | Blocked | Pass Rate |
|-------|-------|--------|--------|---------|-----------|
| Suite 1: Language Switching | | | | | % |
| Suite 2: Translation Rendering | | | | | % |
| Suite 3: Job Processing | | | | | % |
| Suite 4: Cross-Browser | | | | | % |
| **TOTALS** | | | | | **%** |

---

## Detailed Results - Suite 1: Language Switching

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-1.1 | LanguageSwitcher Component Presence | | |
| TC-1.2 | Language Dropdown Options | | |
| TC-1.3 | Language Selection - French | | |
| TC-1.4 | Language Selection - Spanish | | |
| TC-1.5 | Language Selection - German | | |
| TC-1.6 | Language Selection - Dutch | | |
| TC-1.7 | Language Selection - Italian | | |
| TC-1.8 | Language Persistence - Cookie | | |
| TC-1.9 | Language Persistence - Database | | |
| TC-1.10 | Language Detection Fallback | | |

---

## Detailed Results - Suite 2: Translation Rendering

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-2.1 | Dashboard Page - English Baseline | | |
| TC-2.2 | Dashboard Page - All Languages | | |
| TC-2.3 | Login Page Translations | | |
| TC-2.4 | Error Message Translations | | |
| TC-2.5 | Missing Translation Key Detection | | |
| TC-2.6 | Layout Overflow Testing - German | | |
| TC-2.7 | Mobile Viewport Testing | | |

---

## Detailed Results - Suite 3: Job Processing

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-3.1 | Job Status API Availability | | |
| TC-3.2 | Translation Job Creation | | |
| TC-3.3 | Job Processing Lifecycle | | |
| TC-3.4 | Translation Results Verification | | |
| TC-3.5 | Failed Job Handling | | |
| TC-3.6 | Job Filtering and Pagination | | |

---

## Detailed Results - Suite 4: Cross-Browser

| Test ID | Test Name | Browser/Device | Status | Notes |
|---------|-----------|----------------|--------|-------|
| TC-4.1 | Chrome Desktop | | | |
| TC-4.2 | Firefox Desktop | | | |
| TC-4.3 | Safari Desktop | | | |
| TC-4.4 | Edge Desktop | | | |
| TC-4.5 | iOS Safari Mobile | | | |
| TC-4.6 | Android Chrome Mobile | | | |

---

## Defects Found

| ID | Test ID | Severity | Summary | Status | Assigned To |
|----|---------|----------|---------|--------|-------------|
| DEF-001 | | | | Open | |
| DEF-002 | | | | Open | |

---

## Missing Translations Inventory

| Page | Language | Element | Translation Key Shown |
|------|----------|---------|----------------------|
| | | | |

---

## Layout Issues Inventory

| Page | Language | Element | Issue Description | Severity |
|------|----------|---------|-------------------|----------|
| | | | | |

---

## Screenshots/Evidence

| Screenshot ID | Test ID | Description | File Path |
|---------------|---------|-------------|-----------|
| | | | |

---

## Environment Notes

### Issues Encountered During Testing
-

### Workarounds Used
-

### Configuration Changes Made
-

---

## Recommendations

### For Production Deployment
1.

### For Future Improvements
1.

### Known Limitations
1.

---

## Sign-off

| Role | Name | Date | Status | Signature |
|------|------|------|--------|-----------|
| Tester | | | Complete / Partial | |
| QA Lead | | | Reviewed | |
| Product Owner | | | Approved | |

---

**Document End**
```

**Acceptance Criteria:**
- [ ] Template has all 4 test suite sections
- [ ] Executive summary section present
- [ ] Defect tracking section present
- [ ] Sign-off section present

**Estimated Effort:** 0.5 story points

---

### Task 4: Create Defect Report Template

**Objective:** Create a standardized template for documenting defects found during testing.

**File to Create:** `docs/testing/L10N-E2E-Defect-Report-Template.md`

**Steps:**

4.1. Create the defect report template:

```markdown
# L10N Defect Report Template

**Document Version:** 1.0
**Created:** [DATE]

---

## Defect Report: DEF-L10N-[XXX]

### Basic Information

| Field | Value |
|-------|-------|
| **Defect ID** | DEF-L10N-XXX |
| **Test Case ID** | TC-X.X |
| **Reported By** | [Name] |
| **Report Date** | YYYY-MM-DD |
| **Last Updated** | YYYY-MM-DD |

---

### Classification

**Severity:**
- [ ] **Critical** - Application crash, data loss, security issue, blocks testing
- [ ] **High** - Major feature broken, no workaround available
- [ ] **Medium** - Feature partially broken, workaround exists
- [ ] **Low** - Minor cosmetic issue, minimal user impact

**Priority:**
- [ ] **P0** - Fix immediately, blocks release
- [ ] **P1** - Must fix before release
- [ ] **P2** - Should fix in next sprint
- [ ] **P3** - Nice to have, fix when time permits

**Type:**
- [ ] Functional - Feature doesn't work as expected
- [ ] Visual/UI - Display or layout issue
- [ ] Localization - Translation missing or incorrect
- [ ] Performance - Slow response or timeout
- [ ] Accessibility - Accessibility violation

---

### Environment

| Field | Value |
|-------|-------|
| **URL** | |
| **Browser** | |
| **Browser Version** | |
| **Operating System** | |
| **Device Type** | Desktop / Mobile / Tablet |
| **Screen Resolution** | |
| **User Type** | Guest / Logged-in / Admin |
| **Selected Language** | |

---

### Defect Summary

**One-line description:**
[Provide a concise summary of the defect]

---

### Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Continue as needed]

---

### Expected Behavior

[Describe what should happen when following the steps above]

---

### Actual Behavior

[Describe what actually happens]

---

### Visual Evidence

**Screenshots:**
![Screenshot description](path/to/screenshot.png)

**Console Errors (if applicable):**
```
[Paste any console errors here]
```

**Network Errors (if applicable):**
```
[Paste any network request/response details]
```

---

### Workaround

- [ ] Workaround available
- [ ] No workaround

**Workaround description (if available):**
[Describe how users can work around this issue temporarily]

---

### Additional Context

[Any additional information that might help diagnose or fix the issue]

---

### Related Items

| Type | ID/Link |
|------|---------|
| Related Test Case | |
| Related User Story | |
| Related PR | |
| Similar Defects | |

---

## Resolution Section (For Developer)

### Root Cause Analysis

[Developer fills this in after investigation]

---

### Fix Description

[Developer describes the fix applied]

---

### Files Changed

| File Path | Change Type |
|-----------|-------------|
| | Added / Modified / Deleted |

---

### Fix Verification

| Field | Value |
|-------|-------|
| **Fixed In Branch** | |
| **Fixed In PR** | |
| **Fixed In Version** | |
| **Deployed To Staging** | YYYY-MM-DD |

---

## Verification Section (For Tester)

| Field | Value |
|-------|-------|
| **Verified By** | |
| **Verification Date** | YYYY-MM-DD |
| **Verification Status** | Verified Fixed / Still Failing / Partially Fixed |
| **Verification Notes** | |

---

### Status History

| Date | Status | Updated By | Notes |
|------|--------|------------|-------|
| | Open | | Initial report |
| | | | |

---

**Current Status:** Open / In Progress / Fixed / Verified / Closed / Won't Fix

---

**Document End**
```

**Acceptance Criteria:**
- [ ] Template includes all severity/priority classifications
- [ ] Steps to reproduce section present
- [ ] Screenshot/evidence section present
- [ ] Resolution and verification sections present

**Estimated Effort:** 0.5 story points

---

### Task 5: Create Pre-Test Environment Verification Checklist

**Objective:** Create a checklist for verifying the staging environment before starting E2E testing.

**File to Create:** `docs/testing/L10N-Pre-Test-Checklist.md`

**Steps:**

5.1. Create the pre-test checklist:

```markdown
# L10N E2E Pre-Test Environment Checklist

**Document Version:** 1.0
**Created:** [DATE]
**Last Modified:** [DATE]

---

## Purpose

This checklist must be completed before executing the L10N E2E Test Protocol. It ensures all prerequisites are met and the testing environment is properly configured.

---

## Checklist Date: ________

## Verified By: ________

---

## Section 1: Staging Deployment Verification

### 1.1 Application Accessibility

- [ ] **Staging URL accessible:** https://faqbnb-staging.up.railway.app
  - Response: ______

- [ ] **Version API returns valid response:**
  ```bash
  curl https://faqbnb-staging.up.railway.app/api/version
  ```
  - Version: ______

### 1.2 L10N Component Deployment

Verify these components are deployed by checking for their presence:

- [ ] **LanguageSwitcher component exists:**
  - Check: Navigate to /dashboard2 and look for language dropdown

- [ ] **Translation files deployed:**
  - Check: Change language and verify text changes

- [ ] **Translation API accessible:**
  ```bash
  curl -X GET "https://faqbnb-staging.up.railway.app/api/admin/translation-jobs" \
    -H "Authorization: Bearer [TOKEN]"
  ```
  - Response status: ______

---

## Section 2: Database Verification

### 2.1 Translation Tables Exist

Verify via Supabase Studio or SQL:

- [ ] `article_translations` table exists
- [ ] `item_translations` table exists
- [ ] `link_translations` table exists
- [ ] `tag_translations` table exists
- [ ] `translation_jobs` table exists

### 2.2 User Preference Columns

- [ ] `users.preferred_language` column exists
- [ ] `accounts.preferred_language` column exists

### 2.3 Source Language Columns

- [ ] `items.source_language` column exists
- [ ] `item_articles.source_language` column exists
- [ ] `item_links.source_language` column exists

---

## Section 3: Test Account Setup

### 3.1 Admin Test Account

- [ ] Admin account created/available
  - Email: ______
  - Has admin privileges: [ ] Yes

### 3.2 Regular Test Account

- [ ] Regular user account created/available
  - Email: ______
  - Can access dashboard: [ ] Yes

---

## Section 4: Browser/Device Preparation

### 4.1 Desktop Browsers Installed

- [ ] Chrome (Latest): Version ______
- [ ] Firefox (Latest): Version ______
- [ ] Safari (Latest): Version ______
- [ ] Edge (Latest): Version ______

### 4.2 Mobile Devices Available

- [ ] iOS device or simulator available
  - Device/Version: ______

- [ ] Android device or emulator available
  - Device/Version: ______

### 4.3 Browser Configuration

- [ ] All cookies cleared for staging domain
- [ ] Browser cache cleared
- [ ] No browser extensions that might interfere (ad blockers, etc.)

---

## Section 5: Network and Connectivity

- [ ] Stable internet connection
- [ ] No VPN that might affect locale detection
- [ ] Can access Supabase Studio for verification queries

---

## Section 6: Documentation Ready

- [ ] Test Protocol document available: `docs/testing/L10N-E2E-Test-Protocol.md`
- [ ] Test Results template ready: `docs/testing/L10N-E2E-Test-Results-Template.md`
- [ ] Defect Report template ready: `docs/testing/L10N-E2E-Defect-Report-Template.md`
- [ ] Screenshot folder created for evidence

---

## Section 7: Prerequisites Pass/Fail

### Critical Prerequisites (Must Pass)

| Prerequisite | Status |
|--------------|--------|
| Staging accessible | |
| LanguageSwitcher visible | |
| Admin account available | |
| Translation tables exist | |
| At least one browser ready | |

### Overall Status

- [ ] **READY** - All critical prerequisites pass, testing can begin
- [ ] **NOT READY** - One or more critical items failed, cannot proceed

### Blocker Notes (if not ready)

[Document what's blocking test execution]

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tester | | | Ready / Blocked |

---

**Document End**
```

**Acceptance Criteria:**
- [ ] Checklist covers deployment verification
- [ ] Database verification steps included
- [ ] Test account setup documented
- [ ] Browser/device preparation included
- [ ] Clear pass/fail criteria

**Estimated Effort:** 0.5 story points

---

### Task 6: Execute Suite 1 - Language Switching Tests

**Objective:** Execute all language switching test cases and record results.

**Prerequisites:**
- Tasks 1-5 completed
- Pre-test checklist passed

**Steps:**

6.1. Open the test results document and fill in session information

6.2. Execute TC-1.1 through TC-1.10 following the test protocol

6.3. For each test case:
- Follow exact steps documented
- Record PASS/FAIL status
- Document any observations
- Take screenshots for failures
- If FAIL, create defect report using template

6.4. Calculate Suite 1 pass rate

**Expected Deliverables:**
- Completed Suite 1 section in Test Results document
- Defect reports for any failures
- Screenshots for evidence

**Acceptance Criteria:**
- [ ] All 10 test cases executed
- [ ] Results documented in template
- [ ] Any failures have corresponding defect reports

**Estimated Effort:** 2 story points

---

### Task 7: Execute Suite 2 - Translation Rendering Tests

**Objective:** Execute all translation rendering test cases and record results.

**Prerequisites:**
- Task 6 completed (or can run in parallel)

**Steps:**

7.1. Execute TC-2.1 through TC-2.7 following the test protocol

7.2. Create English baseline screenshot for TC-2.1

7.3. For TC-2.2, capture screenshots for all 5 non-English languages

7.4. Document any missing translations found in TC-2.5

7.5. Document any layout issues found in TC-2.6 and TC-2.7

**Expected Deliverables:**
- Completed Suite 2 section in Test Results document
- Language comparison screenshots (6 total)
- Missing translations inventory (if any)
- Layout issues inventory (if any)

**Acceptance Criteria:**
- [ ] All 7 test cases executed
- [ ] Screenshots captured for all languages
- [ ] Missing translations documented
- [ ] Layout issues documented

**Estimated Effort:** 2 story points

---

### Task 8: Execute Suite 3 - Job Processing Tests

**Objective:** Execute all translation job processing test cases and record results.

**Prerequisites:**
- Admin API access available
- Sample content for translation testing

**Steps:**

8.1. Obtain admin authentication token

8.2. Execute TC-3.1 - Verify job API is accessible

8.3. Execute TC-3.2 - Create a test translation job

8.4. Execute TC-3.3 - Monitor job processing lifecycle

8.5. Execute TC-3.4 - Verify translation results in database

8.6. Execute TC-3.5 - Test failed job handling

8.7. Execute TC-3.6 - Test API filtering/pagination

**Expected Deliverables:**
- Completed Suite 3 section in Test Results document
- API response logs for evidence
- Database verification queries and results

**Acceptance Criteria:**
- [ ] All 6 test cases executed
- [ ] Job lifecycle verified (queued → processing → completed)
- [ ] Error handling verified
- [ ] API responses documented

**Estimated Effort:** 1.5 story points

---

### Task 9: Execute Suite 4 - Cross-Browser Tests

**Objective:** Execute cross-browser compatibility tests and record results.

**Prerequisites:**
- All required browsers installed/accessible
- Mobile devices available (physical or emulator)

**Steps:**

9.1. Execute TC-4.1 - Chrome Desktop testing

9.2. Execute TC-4.2 - Firefox Desktop testing

9.3. Execute TC-4.3 - Safari Desktop testing

9.4. Execute TC-4.4 - Edge Desktop testing

9.5. Execute TC-4.5 - iOS Safari Mobile testing

9.6. Execute TC-4.6 - Android Chrome Mobile testing

**Expected Deliverables:**
- Completed Suite 4 section in Test Results document
- Browser version documentation
- Browser-specific issue documentation (if any)

**Acceptance Criteria:**
- [ ] All 6 browser tests executed
- [ ] Browser versions documented
- [ ] Any browser-specific issues documented with defect reports

**Estimated Effort:** 1.5 story points

---

### Task 10: Compile Final Test Report

**Objective:** Aggregate all test results into final report with executive summary.

**Prerequisites:**
- Tasks 6-9 completed

**Steps:**

10.1. Calculate overall pass rate:
- Total tests executed
- Total passed
- Total failed
- Total blocked

10.2. Compile defect summary:
- Total defects found
- Defects by severity
- Defects by test suite

10.3. Write executive summary:
- Overall test status
- Key findings
- Go/No-Go recommendation

10.4. Document recommendations:
- Issues to fix before production
- Known limitations
- Future improvements

10.5. Obtain sign-offs:
- Tester sign-off
- QA Lead review
- Product Owner approval (if applicable)

**Expected Deliverables:**
- Completed Test Results document with all sections
- Final defect list
- Go/No-Go recommendation

**Acceptance Criteria:**
- [ ] All test suites have results
- [ ] Executive summary written
- [ ] Pass rate calculated
- [ ] Recommendations documented
- [ ] Sign-off section completed

**Estimated Effort:** 1 story point

---

### Task 11: Archive Test Artifacts

**Objective:** Organize and archive all test evidence for future reference.

**Prerequisites:**
- Task 10 completed

**Steps:**

11.1. Create archive folder structure:
```
docs/testing/results/
  L10N-E2E-2026-01-XX/
    Test-Results.md
    screenshots/
      TC-2.1-dashboard-en.png
      TC-2.2-dashboard-fr.png
      ...
    defects/
      DEF-L10N-001.md
      ...
    api-logs/
      TC-3.1-response.json
      ...
```

11.2. Move completed test results to archive folder

11.3. Rename with execution date

11.4. Update main Test Results Template for next execution

**Expected Deliverables:**
- Archived test results with date stamp
- Organized screenshot folder
- Clean templates ready for next test cycle

**Acceptance Criteria:**
- [ ] Test artifacts archived
- [ ] Clear folder structure
- [ ] Templates reset for next execution

**Estimated Effort:** 0.5 story points

---

## Task Summary

| Task # | Task Name | Est. Points | Priority |
|--------|-----------|-------------|----------|
| 1 | Create Testing Directory Structure | 0.25 | P0 |
| 2 | Create E2E Test Protocol Document | 1.0 | P0 |
| 3 | Create Test Results Template | 0.5 | P0 |
| 4 | Create Defect Report Template | 0.5 | P0 |
| 5 | Create Pre-Test Environment Checklist | 0.5 | P0 |
| 6 | Execute Suite 1 - Language Switching | 2.0 | P0 |
| 7 | Execute Suite 2 - Translation Rendering | 2.0 | P0 |
| 8 | Execute Suite 3 - Job Processing | 1.5 | P0 |
| 9 | Execute Suite 4 - Cross-Browser | 1.5 | P1 |
| 10 | Compile Final Test Report | 1.0 | P0 |
| 11 | Archive Test Artifacts | 0.5 | P2 |
| **TOTAL** | | **11.25** | |

---

## Dependencies Graph

```
Task 1 (Directory)
    │
    ├── Task 2 (Protocol)
    │       │
    ├── Task 3 (Results Template)
    │       │
    ├── Task 4 (Defect Template)
    │       │
    └── Task 5 (Pre-Test Checklist)
            │
            ├── Task 6 (Suite 1) ──┐
            │                      │
            ├── Task 7 (Suite 2) ──┤
            │                      │
            ├── Task 8 (Suite 3) ──┼── Task 10 (Final Report)
            │                      │          │
            └── Task 9 (Suite 4) ──┘          │
                                              │
                                       Task 11 (Archive)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Test environment not ready | Complete Task 5 checklist before starting execution |
| Missing translations block testing | Document as defects, continue with other tests |
| Mobile devices unavailable | Use browser device emulation as fallback |
| API authentication fails | Have admin credentials ready, test auth separately |
| Defects overwhelm capacity | Prioritize by severity, focus on Critical/High first |

---

## Success Criteria

The Manual E2E Validation task (REQ-256) is considered complete when:

1. All test documentation created (Tasks 1-5)
2. All test suites executed (Tasks 6-9)
3. Test results compiled and reviewed (Task 10)
4. No open Critical severity defects
5. No more than 3 open High severity defects
6. Go/No-Go recommendation documented
7. Sign-off obtained from QA Lead

---

## References

- **Overview Document:** `/docs/REQ-256-manual-e2e-validation-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Request Definition:** `/docs/gen_requests.md` - REQ-256
- **Staging URL:** https://faqbnb-staging.up.railway.app
- **Version API:** https://faqbnb-staging.up.railway.app/api/version

---

*Document generated on 2026-01-18 for REQ-256: Manual E2E Validation - Detailed Task Breakdown*
