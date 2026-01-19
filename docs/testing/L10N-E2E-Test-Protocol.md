# L10N Epic 1 - Manual E2E Test Protocol

**Document Version:** 1.0
**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Target Application Version:** v0.688

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

---

*Document created for REQ-256: Manual E2E Validation - L10N Epic 1 Foundation*
