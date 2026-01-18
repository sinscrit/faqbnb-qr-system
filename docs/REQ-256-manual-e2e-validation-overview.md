# REQ-256: Manual End-to-End Validation for Localization Features - Implementation Overview

**Generated:** 2026-01-18 16:45:00 UTC
**Last Modified:** 2026-01-18 16:45:00 UTC
**Request Reference:** docs/gen_requests.md - Request #256
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.4)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 6.4 (Manual E2E Validation) from the L10N Epic 1 Foundation implementation plan. This task involves creating a comprehensive manual testing protocol to validate all localization features before production deployment. Unlike automated tests, manual validation catches integration issues, UX problems, layout breaks, and edge cases that automated tests may miss.

**Validation Scope:**
1. Language switching functionality across all supported languages
2. Translation rendering correctness in UI components
3. Background job processing completion and status tracking

**Supported Languages:** English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)

---

## Technical Context

### Current Application Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context + useReducer (AuthContext, PropertyContext) |
| **UI Components** | Radix UI primitives, Heroicons, Lucide React |
| **Authentication** | Supabase Auth with AuthContext |
| **Backend** | Supabase (PostgreSQL with RLS) |
| **Deployment** | Railway (staging: https://faqbnb-staging.up.railway.app) |

### Localization Components Under Test

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **LanguageSwitcher** | `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | UI component for language selection |
| **useLanguagePreference** | `/src/hooks/useLanguagePreference.ts` | Hook for getting/setting language preference |
| **i18n Config** | `/src/lib/i18n/config.ts` | Locale configuration and supported languages |
| **Middleware** | `/src/middleware.ts` | Language detection and cookie handling |
| **Translation Files** | `/messages/*.json` | Static UI translation strings |
| **IntlProvider** | `/src/app/layout.tsx` | Next-intl provider wrapper |
| **Translation Service** | `/src/lib/translation-service/translation-service.ts` | AI-powered translation API |
| **Job Queue** | `/src/lib/job-queue/translation-jobs.ts` | Background job processing |
| **Job Status API** | `/src/app/api/admin/translation-jobs/route.ts` | Job status monitoring endpoint |

### Database Tables Under Test

| Table | Purpose |
|-------|---------|
| `users` | `preferred_language` column for authenticated users |
| `accounts` | `preferred_language` column for account-level preference |
| `translation_jobs` | Job status tracking (queued → processing → completed/failed) |
| `article_translations` | Translated article content storage |
| `item_translations` | Translated item content storage |
| `tag_translations` | Translated tag content storage |

---

## Authorized Files and Functions for Modification

### Test Documentation (CREATE/WRITE)

| File Path | Purpose |
|-----------|---------|
| `docs/testing/L10N-E2E-Test-Protocol.md` | Comprehensive test protocol document |
| `docs/testing/L10N-E2E-Test-Results-Template.md` | Template for recording test results |
| `docs/testing/L10N-E2E-Defect-Report-Template.md` | Template for defect reporting |

### Configuration Files (READ ONLY - for verification during testing)

| File Path | Purpose |
|-----------|---------|
| `/messages/en.json` | English translations (source of truth) |
| `/messages/fr.json` | French translations |
| `/messages/es.json` | Spanish translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/src/lib/i18n/config.ts` | Locale configuration |
| `/src/middleware.ts` | Language detection logic |

### Application Routes (READ ONLY - UI testing targets)

| Route | Purpose |
|-------|---------|
| `/dashboard2` | Main dashboard with LanguageSwitcher |
| `/admin/items` | Items management page |
| `/admin/instructions` | Instructions/guides page |
| `/admin/properties` | Properties management |
| `/login` | Login page with translations |
| `/register` | Registration page with translations |

---

## Implementation Tasks

### Task 1: Create E2E Test Protocol Document

**Action:** Create comprehensive manual test protocol document

**File:** `docs/testing/L10N-E2E-Test-Protocol.md`

**Content Structure:**

```markdown
# L10N Epic 1 - Manual E2E Test Protocol

## Test Environment
- Staging URL: https://faqbnb-staging.up.railway.app
- Test Date: [DATE]
- Tester: [NAME]
- Browser(s): Chrome, Firefox, Safari, Edge
- Device(s): Desktop, Mobile (iOS Safari, Android Chrome)

## Pre-Test Setup
1. Ensure staging deployment is current
2. Verify all L10N components are deployed
3. Create test user account(s)
4. Clear browser cookies/cache before testing

## Test Suites

### Suite 1: Language Switching Functionality

#### TC-1.1: LanguageSwitcher Component Presence
- [ ] Navigate to /dashboard2
- [ ] Verify LanguageSwitcher dropdown is visible in header
- [ ] Verify all 6 languages are listed with native names

#### TC-1.2: Language Selection Changes Interface
For EACH supported language (en, fr, es, de, nl, it):
- [ ] Select language from dropdown
- [ ] Verify interface updates immediately (no page reload required)
- [ ] Verify common UI elements are translated:
  - [ ] Navigation labels
  - [ ] Button text (Save, Cancel, Delete, etc.)
  - [ ] Page titles
  - [ ] Form labels
  - [ ] Error messages

#### TC-1.3: Language Persistence (Cookie)
- [ ] Select French (fr) as language
- [ ] Close browser tab
- [ ] Open new tab and navigate to staging URL
- [ ] Verify French is still selected (cookie persistence)

#### TC-1.4: Language Persistence (Database - Logged In)
- [ ] Log in to test account
- [ ] Select German (de) as language
- [ ] Log out
- [ ] Log back in
- [ ] Verify German is still selected (database persistence)

#### TC-1.5: Language Detection Fallback
- [ ] Clear all cookies
- [ ] Set browser language to Spanish
- [ ] Navigate to staging URL (not logged in)
- [ ] Verify Spanish is auto-detected from Accept-Language header
- [ ] If Spanish not detected, verify fallback to English (default)

### Suite 2: Translation Rendering Correctness

#### TC-2.1: Static UI Translations - Dashboard
For EACH supported language:
- [ ] Navigate to /dashboard2
- [ ] Screenshot the page
- [ ] Verify page title is translated
- [ ] Verify navigation menu items are translated
- [ ] Verify statistics card labels are translated
- [ ] Verify action button labels are translated
- [ ] Check for layout breaks or text overflow

#### TC-2.2: Static UI Translations - Login/Register
For EACH supported language:
- [ ] Navigate to /login
- [ ] Verify form labels are translated
- [ ] Verify button text is translated
- [ ] Verify error messages display in selected language
- [ ] Navigate to /register
- [ ] Repeat verification

#### TC-2.3: Static UI Translations - Items Management
For EACH supported language:
- [ ] Navigate to /admin/items
- [ ] Verify page title is translated
- [ ] Verify toolbar labels are translated
- [ ] Verify empty state message is translated
- [ ] Verify item card labels are translated
- [ ] Verify modal dialogs are translated

#### TC-2.4: Missing Translation Detection
- [ ] Switch through all languages rapidly
- [ ] Look for any untranslated strings showing translation keys (e.g., "common.save" instead of "Save")
- [ ] Document any missing translations

#### TC-2.5: Layout and Overflow Testing
For EACH supported language:
- [ ] Check German (typically longest translations) for text overflow
- [ ] Verify buttons don't clip text
- [ ] Verify table columns accommodate translated headers
- [ ] Test on mobile viewport (375px width)

### Suite 3: Translation Job Processing

#### TC-3.1: Create Translation Job
- [ ] Navigate to admin translation test endpoint
- [ ] Submit a translation request for a test article
- [ ] Verify job is created with 'queued' status
- [ ] Note the job ID

#### TC-3.2: Job Processing Verification
- [ ] Trigger job processing (via API or cron)
- [ ] Monitor job status via /api/admin/translation-jobs
- [ ] Verify job transitions: queued → processing → completed
- [ ] Verify processing does not exceed 5 minute timeout

#### TC-3.3: Translation Results Storage
- [ ] After job completes, verify translations are stored:
  - [ ] Check article_translations table has new record
  - [ ] Verify all target languages have translations
  - [ ] Verify translation_status is 'completed'

#### TC-3.4: Failed Job Handling
- [ ] Create a job that will fail (e.g., invalid entity ID)
- [ ] Verify job transitions to 'failed' status
- [ ] Verify error_message is populated
- [ ] Verify attempts counter is incremented

#### TC-3.5: Job Status API
- [ ] Call GET /api/admin/translation-jobs
- [ ] Verify response includes job list
- [ ] Verify job status filters work (queued, processing, completed, failed)
- [ ] Verify pagination works for large job lists

### Suite 4: Cross-Browser Compatibility

#### TC-4.1: Chrome (Desktop)
- [ ] Complete Suite 1 tests
- [ ] Document any browser-specific issues

#### TC-4.2: Firefox (Desktop)
- [ ] Complete Suite 1 tests
- [ ] Document any browser-specific issues

#### TC-4.3: Safari (Desktop/iOS)
- [ ] Complete Suite 1 tests
- [ ] Document any browser-specific issues

#### TC-4.4: Edge (Desktop)
- [ ] Complete Suite 1 tests
- [ ] Document any browser-specific issues

#### TC-4.5: Mobile Browsers
- [ ] Test language switcher on iOS Safari
- [ ] Test language switcher on Android Chrome
- [ ] Verify touch interactions work correctly

## Defect Reporting
For each defect found, create entry in defect report with:
- Test case ID
- Steps to reproduce
- Expected vs actual behavior
- Browser/device info
- Screenshots/recordings
- Severity (Critical/High/Medium/Low)
```

---

### Task 2: Create Test Results Template

**Action:** Create standardized template for recording test results

**File:** `docs/testing/L10N-E2E-Test-Results-Template.md`

**Content Structure:**

```markdown
# L10N E2E Test Results - [DATE]

## Test Session Information
| Field | Value |
|-------|-------|
| Test Date | [YYYY-MM-DD] |
| Tester Name | [NAME] |
| Environment | Staging / Production |
| Version | [VERSION from /api/version] |
| Browser | [BROWSER/VERSION] |
| Device | [DEVICE/OS] |

## Test Summary

| Suite | Total Tests | Passed | Failed | Blocked | Notes |
|-------|-------------|--------|--------|---------|-------|
| Suite 1: Language Switching | X | X | X | X | |
| Suite 2: Translation Rendering | X | X | X | X | |
| Suite 3: Job Processing | X | X | X | X | |
| Suite 4: Cross-Browser | X | X | X | X | |
| **TOTAL** | **X** | **X** | **X** | **X** | |

## Overall Status
- [ ] PASSED - All tests passed
- [ ] PASSED WITH ISSUES - Minor issues documented
- [ ] FAILED - Critical/blocking issues found
- [ ] BLOCKED - Cannot complete testing

## Detailed Results

### Suite 1: Language Switching Functionality

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-1.1 | LanguageSwitcher Component Presence | PASS/FAIL | |
| TC-1.2 | Language Selection Changes Interface | PASS/FAIL | |
| TC-1.3 | Language Persistence (Cookie) | PASS/FAIL | |
| TC-1.4 | Language Persistence (Database) | PASS/FAIL | |
| TC-1.5 | Language Detection Fallback | PASS/FAIL | |

### Suite 2: Translation Rendering Correctness

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-2.1 | Static UI Translations - Dashboard | PASS/FAIL | |
| TC-2.2 | Static UI Translations - Login/Register | PASS/FAIL | |
| TC-2.3 | Static UI Translations - Items Management | PASS/FAIL | |
| TC-2.4 | Missing Translation Detection | PASS/FAIL | |
| TC-2.5 | Layout and Overflow Testing | PASS/FAIL | |

### Suite 3: Translation Job Processing

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-3.1 | Create Translation Job | PASS/FAIL | |
| TC-3.2 | Job Processing Verification | PASS/FAIL | |
| TC-3.3 | Translation Results Storage | PASS/FAIL | |
| TC-3.4 | Failed Job Handling | PASS/FAIL | |
| TC-3.5 | Job Status API | PASS/FAIL | |

### Suite 4: Cross-Browser Compatibility

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-4.1 | Chrome (Desktop) | PASS/FAIL | |
| TC-4.2 | Firefox (Desktop) | PASS/FAIL | |
| TC-4.3 | Safari (Desktop/iOS) | PASS/FAIL | |
| TC-4.4 | Edge (Desktop) | PASS/FAIL | |
| TC-4.5 | Mobile Browsers | PASS/FAIL | |

## Defects Found
| Defect ID | Test ID | Severity | Summary | Status |
|-----------|---------|----------|---------|--------|
| DEF-001 | TC-X.X | High/Medium/Low | [Brief description] | Open/Fixed |

## Screenshots/Evidence
[Attach or link to supporting evidence]

## Recommendations
[Any recommendations for improvement or follow-up]

## Sign-off
- [ ] Testing Complete
- [ ] Results Reviewed
- [ ] Defects Logged

Tester Signature: ___________________ Date: ___________
Reviewer Signature: ___________________ Date: ___________
```

---

### Task 3: Create Defect Report Template

**Action:** Create standardized template for defect reporting

**File:** `docs/testing/L10N-E2E-Defect-Report-Template.md`

**Content Structure:**

```markdown
# L10N Defect Report

## Defect ID: DEF-[XXX]

### Summary
[One-line description of the defect]

### Severity
- [ ] **Critical** - Application crash, data loss, security vulnerability
- [ ] **High** - Major feature broken, no workaround
- [ ] **Medium** - Feature partially broken, workaround exists
- [ ] **Low** - Minor cosmetic issue, minimal impact

### Priority
- [ ] P0 - Fix immediately (blocks release)
- [ ] P1 - Fix before release
- [ ] P2 - Fix in next sprint
- [ ] P3 - Fix when time permits

### Environment
| Field | Value |
|-------|-------|
| URL | [URL where defect occurred] |
| Browser | [Browser name and version] |
| Device | [Device type and OS version] |
| User Type | [Guest / Logged-in User / Admin] |
| Language | [Selected language when defect occurred] |

### Related Test Case
- Test Suite: [Suite name]
- Test Case ID: [TC-X.X]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. ...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots/Video
[Attach evidence]

### Additional Context
[Any additional information, error messages, console logs]

### Workaround
[If any workaround exists, describe it]

---

### Resolution (To be filled by developer)

#### Root Cause
[Description of the root cause]

#### Fix Description
[Description of the fix applied]

#### Fixed In Version
[Version number where fix was deployed]

#### Verified By
[Name of tester who verified the fix]

#### Verification Date
[Date when fix was verified]
```

---

### Task 4: Execute Manual Testing Protocol

**Action:** Perform the actual manual E2E testing

**Prerequisites:**
1. All L10N components from Phases 1-5 must be deployed to staging
2. Test user accounts created
3. Sample content available for translation testing

**Execution Checklist:**

| Step | Description | Status |
|------|-------------|--------|
| 1 | Deploy all L10N components to staging | [ ] Pending |
| 2 | Verify staging environment is accessible | [ ] Pending |
| 3 | Create/verify test user accounts | [ ] Pending |
| 4 | Execute Suite 1: Language Switching tests | [ ] Pending |
| 5 | Execute Suite 2: Translation Rendering tests | [ ] Pending |
| 6 | Execute Suite 3: Job Processing tests | [ ] Pending |
| 7 | Execute Suite 4: Cross-Browser tests | [ ] Pending |
| 8 | Document all results in Results Template | [ ] Pending |
| 9 | Create defect reports for any failures | [ ] Pending |
| 10 | Review and sign-off | [ ] Pending |

---

### Task 5: Document and Report Findings

**Action:** Compile test results and communicate findings

**Deliverables:**
1. Completed test results document
2. Defect reports for any failures
3. Summary report for stakeholders
4. Recommendations for production readiness

---

## API Endpoints for Testing

### Language Preference API

**Endpoint:** `PUT /api/user/language`

**Request:**
```json
{
  "language": "fr"
}
```

**Response:**
```json
{
  "success": true,
  "language": "fr"
}
```

### Translation Jobs API

**Endpoint:** `GET /api/admin/translation-jobs`

**Query Parameters:**
- `status`: Filter by job status (queued, processing, completed, failed)
- `entityType`: Filter by entity type (article, item, link, tag)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "article",
      "entityId": "uuid",
      "sourceLanguage": "en",
      "targetLanguage": "fr",
      "status": "completed",
      "attempts": 1,
      "createdAt": "2026-01-18T10:00:00Z",
      "completedAt": "2026-01-18T10:00:30Z"
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 50
}
```

### Process Translations API (Trigger)

**Endpoint:** `POST /api/admin/process-translations`

**Response:**
```json
{
  "success": true,
  "jobsProcessed": 5,
  "jobsSucceeded": 4,
  "jobsFailed": 1,
  "processingTimeMs": 15000
}
```

---

## Validation Checkpoints

### Language Switching Validation Points

| Checkpoint | Expected Behavior |
|------------|-------------------|
| Initial load | Detect language from: 1) User DB preference, 2) Cookie, 3) Accept-Language, 4) Default 'en' |
| Language change | UI updates immediately without page reload |
| Cookie persistence | FAQBNB_LANG cookie set with selected language |
| DB persistence | users.preferred_language updated for logged-in users |
| Consistency | Same language across all pages and components |

### Translation Rendering Validation Points

| Checkpoint | Expected Behavior |
|------------|-------------------|
| Static strings | All UI text from /messages/*.json files |
| No missing keys | No translation keys visible (e.g., "common.save") |
| Correct language | Translations match selected language |
| No overflow | Text fits in UI elements without clipping |
| RTL support | N/A for current supported languages |

### Job Processing Validation Points

| Checkpoint | Expected Behavior |
|------------|-------------------|
| Job creation | New job in 'queued' status within 1 second |
| Status progression | queued → processing → completed/failed |
| Completion time | Jobs complete within 5 minutes (timeout) |
| Error capture | Failed jobs have error_message populated |
| Retry behavior | Failed jobs retry up to max attempts (3) |
| Data integrity | Translations stored in correct table |

---

## Dependencies

### Internal Dependencies

| Component | Status | Required For |
|-----------|--------|--------------|
| REQ-223: Translation Tables Migration | Must be complete | Database storage |
| REQ-229: next-intl Configuration | Must be complete | Translation rendering |
| REQ-233: Translation Files | Must be complete | Static UI translations |
| REQ-240: Translation Service | Must be complete | Job processing |
| REQ-243: Job Queue Module | Must be complete | Job creation/tracking |
| REQ-248: LanguageSwitcher | Must be complete | Language switching UI |
| REQ-251: Language Preference API | Must be complete | Preference persistence |

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| Staging environment | Test execution environment |
| Supabase database | Data storage and verification |
| Translation API (Claude/OpenAI) | Job processing |

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translations in files | Medium | Medium | Check for missing keys systematically |
| Layout breaks in some languages | Medium | Low | Test German (longest) thoroughly |
| Cookie not persisting | Low | Medium | Test in private/incognito mode |
| Job processing timeout | Low | High | Monitor processing times |
| Cross-browser inconsistencies | Medium | Medium | Test all major browsers |
| Mobile layout issues | Medium | Medium | Test on actual devices |

---

## Estimated Effort

| Task | Estimated Hours |
|------|-----------------|
| Task 1: Create Test Protocol | 2 |
| Task 2: Create Results Template | 1 |
| Task 3: Create Defect Template | 0.5 |
| Task 4: Execute Manual Testing | 6-8 |
| Task 5: Document and Report | 2 |
| **Total** | **11.5-13.5 hours** |

**Notes:**
- Testing time depends on number of defects found
- Cross-browser testing may require additional time
- Mobile testing requires access to physical devices or emulators

---

## Acceptance Criteria Verification

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Tester can switch between all supported languages | TC-1.1, TC-1.2 |
| Interface updates immediately on language change | TC-1.2 |
| Language preference persists after closing browser | TC-1.3 |
| Language preference persists after login/logout | TC-1.4 |
| All static UI elements display translated text | TC-2.1, TC-2.2, TC-2.3 |
| No layout overflow or truncation | TC-2.5 |
| Dynamic content displays in correct language | TC-2.1 (if applicable) |
| Translation jobs complete successfully | TC-3.2, TC-3.3 |
| Job processing handles errors gracefully | TC-3.4 |
| Test results are documented | Task 5 deliverables |

---

## Success Criteria

1. All test suites complete execution
2. No Critical or High severity defects remain open
3. All supported languages validated
4. Language persistence verified (cookie + database)
5. Job processing lifecycle validated
6. Cross-browser compatibility confirmed
7. Test results documented and signed off
8. Any defects reported to development team

---

## References

- **Implementation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Request Definition:** `/docs/gen_requests.md` - REQ-256
- **LanguageSwitcher Overview:** `/docs/REQ-248-create-languageswitcher-component-overview.md`
- **Job Queue Overview:** `/docs/REQ-243-create-translation-job-queue-module-overview.md`
- **Unit Tests Overview:** `/docs/REQ-253-write-unit-tests-for-translation-service-overview.md`
- **Integration Tests Overview:** `/docs/REQ-254-write-integration-tests-for-job-processing-overview.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **Staging URL:** https://faqbnb-staging.up.railway.app

---

*Document generated on 2026-01-18 for REQ-256: Manual E2E Validation for Localization Features*
