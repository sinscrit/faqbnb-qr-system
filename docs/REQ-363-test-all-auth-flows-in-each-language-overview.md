# REQ-363: Test All Authentication Flows in Each Supported Language

**Document Version:** 1.0
**Created:** 2026-01-19 12:30:00 UTC
**Last Modified:** 2026-01-19 12:30:00 UTC
**Type:** ENHANCEMENT
**Size:** M
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.10
**Status:** Pending

---

## Summary

Comprehensive end-to-end testing of all authentication and registration flows across all six supported languages (English, French, Spanish, German, Dutch, Italian) to verify translations display correctly, form validations work properly, and user experience remains consistent.

---

## Background

### Prerequisites (From Epic 1 & 2A)

This task is the final verification step for Sub-Epic 2A (Authentication & Registration). It requires:

1. **Epic 1 Foundation:** next-intl installed and configured
2. **Task 2A.1-2A.9:** All auth components internationalized with translations generated
3. **Translation Files:** All six `/messages/*.json` files populated with `auth` namespace

### Current State

| Component | Location | i18n Status |
|-----------|----------|-------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | Pending i18n |
| LoginForm | `/src/components/LoginForm.tsx` | Pending i18n |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | Pending i18n |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | Pending i18n |
| Register page | `/src/app/register/page.tsx` | Pending i18n |
| Success page | `/src/app/register/success/page.tsx` | Pending i18n |
| Complete page | `/src/app/register/complete/page.tsx` | Pending i18n |
| LanguageSwitcher | `/src/components/LanguageSwitcher/` | Implemented |

### Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| fr | French | Français |
| es | Spanish | Español |
| de | German | Deutsch |
| nl | Dutch | Nederlands |
| it | Italian | Italiano |

---

## Implementation Overview

### Test Environment

- **Staging URL:** https://faqbnb-staging.up.railway.app
- **Version API:** https://faqbnb-staging.up.railway.app/api/version
- **Primary Browser:** Chrome (Latest)
- **Secondary Browsers:** Firefox, Safari, Edge
- **Mobile Testing:** iOS Safari, Android Chrome

### Test Protocol Reference

Leverage existing L10N testing framework:
- `/docs/testing/L10N-E2E-Test-Protocol.md` - Test methodology
- `/docs/testing/L10N-E2E-Test-Results-Template.md` - Results documentation
- `/docs/testing/L10N-E2E-Defect-Report-Template.md` - Issue tracking
- `/docs/testing/L10N-Pre-Test-Checklist.md` - Pre-test verification

---

## Test Scope

### Authentication Flows to Test

#### 1. Login Flow (Per Language)

| Test Area | Verification Points |
|-----------|---------------------|
| **Page Load** | Title, subtitle, form labels render in selected language |
| **Form Display** | Email label, password label, placeholder text |
| **Google OAuth** | "Continue with Google" button text |
| **Validation** | Empty field errors, invalid email format, short password |
| **Auth Errors** | Invalid credentials, account locked, session expired |
| **Success State** | "Login successful! Redirecting..." message |
| **Loading State** | "Completing authentication..." spinner text |

#### 2. Registration Flow (Per Language)

| Test Area | Verification Points |
|-----------|---------------------|
| **Page Load** | Title, subtitle, instructions render correctly |
| **Form Fields** | Full name, email, password, confirm password labels |
| **Password Strength** | Strength indicator text, requirement checklist |
| **Validation** | All field validations show translated messages |
| **Terms** | Terms of Service and Privacy Policy text |
| **OAuth Option** | Google registration button text |
| **Success Page** | Account created confirmation |
| **Complete Page** | Setup completion instructions |

#### 3. OAuth Flow (Per Language)

| Test Area | Verification Points |
|-----------|---------------------|
| **Initiation** | "Connecting to Google..." loading text |
| **Return Flow** | Language context maintained after OAuth redirect |
| **Error Handling** | OAuth errors display in selected language |
| **Account Link** | Access code instructions (registration flow) |

#### 4. Error Scenarios (Per Language)

| Scenario | Expected Translated Message |
|----------|----------------------------|
| Invalid credentials | "Invalid email or password" equivalent |
| Missing required field | "This field is required" equivalent |
| Password mismatch | "Passwords do not match" equivalent |
| Email already registered | "Email already in use" equivalent |
| Session expired | "Session expired, please sign in" equivalent |
| Network error | "Network error, please try again" equivalent |

---

## Detailed Test Cases

### TC-AUTH-1: Login Page - Full Language Cycle

**Priority:** Critical

**Steps:**
1. Clear browser cookies/cache
2. Navigate to `/login`
3. For EACH language (en, fr, es, de, nl, it):
   a. Use LanguageSwitcher to select language
   b. Verify page title translates
   c. Verify form labels translate
   d. Verify placeholder text translates
   e. Verify button text translates
   f. Verify footer/helper text translates
   g. Take screenshot for documentation

**Expected Results:**
- [ ] All 6 languages display complete translations
- [ ] No translation keys visible (e.g., `auth.login.title`)
- [ ] No English fallback text in non-English languages
- [ ] Layout maintains integrity (no overflow/clipping)

---

### TC-AUTH-2: Login Validation Messages

**Priority:** Critical

**Steps:**
1. Set language to French (fr)
2. Navigate to `/login`
3. Submit form with empty email
4. Verify error message is in French
5. Enter invalid email format, submit
6. Verify format error is in French
7. Enter valid email, leave password empty, submit
8. Verify password required error is in French
9. Repeat for German (de) and Spanish (es)

**Expected Results:**
- [ ] "Email is required" displays in target language
- [ ] "Invalid email address" displays in target language
- [ ] "Password is required" displays in target language
- [ ] Error styling consistent across languages

---

### TC-AUTH-3: Login Authentication Errors

**Priority:** Critical

**Steps:**
1. Set language to German (de)
2. Navigate to `/login`
3. Enter invalid credentials (wrong password)
4. Submit form
5. Verify authentication error displays in German
6. Repeat for Italian (it) and Dutch (nl)

**Expected Results:**
- [ ] "Invalid email or password" equivalent in target language
- [ ] Error alert styling consistent
- [ ] No mixed-language content

---

### TC-AUTH-4: Registration Page - Full Language Cycle

**Priority:** Critical

**Steps:**
1. Navigate to `/register` (with valid access code if required)
2. For EACH language (en, fr, es, de, nl, it):
   a. Switch to target language
   b. Verify all form labels translate
   c. Verify password requirements text translates
   d. Verify terms acceptance text translates
   e. Verify button labels translate
   f. Take screenshot

**Expected Results:**
- [ ] All registration fields labeled in target language
- [ ] Password strength indicator text translates
- [ ] "Terms of Service" and "Privacy Policy" text translates
- [ ] Submit button text translates

---

### TC-AUTH-5: Registration Validation Messages

**Priority:** High

**Steps:**
1. Set language to Spanish (es)
2. Navigate to `/register`
3. Test each validation:
   - Empty name field
   - Invalid email format
   - Password too short
   - Password mismatch
   - Terms not accepted
4. Verify each error in Spanish
5. Repeat key validations for French (fr)

**Expected Results:**
- [ ] All validation messages display in target language
- [ ] Password requirement checkmarks have translated labels
- [ ] Form behavior consistent across languages

---

### TC-AUTH-6: Google OAuth Button Text

**Priority:** High

**Steps:**
1. For EACH language:
   a. Navigate to `/login`
   b. Verify Google button shows "Continue with Google" in target language
   c. Click button
   d. Verify "Connecting to Google..." loading text in target language
   e. Navigate to `/register`
   f. Verify OAuth option text translates

**Expected Results:**
- [ ] Login OAuth button text translates
- [ ] Registration OAuth button text translates
- [ ] Loading states translate
- [ ] OAuth initiation preserves language context

---

### TC-AUTH-7: OAuth Return Flow Language Persistence

**Priority:** High

**Steps:**
1. Set language to French (fr)
2. Initiate Google OAuth from `/login`
3. Complete Google authentication
4. Upon return to application, verify:
   a. Language is still French
   b. Success/completion messages in French
   c. Redirect to dashboard with French UI

**Expected Results:**
- [ ] OAuth redirect maintains language cookie
- [ ] Post-OAuth UI displays in selected language
- [ ] No language reset to English

---

### TC-AUTH-8: Layout Overflow Testing - German

**Priority:** High

**Rationale:** German typically has longer words/phrases that may cause overflow

**Steps:**
1. Set language to German (de)
2. On Login page, verify:
   - Button text fits without truncation
   - Form labels don't overflow
   - Error messages display fully
3. On Registration page, verify:
   - Password requirement list displays fully
   - Submit button text fits
   - All field labels visible
4. Resize to mobile viewport (375px)
5. Repeat all checks

**Expected Results:**
- [ ] No horizontal scrollbars
- [ ] No truncated button text
- [ ] Form elements properly aligned
- [ ] Mobile layout maintains integrity

---

### TC-AUTH-9: Language Switching Mid-Flow

**Priority:** Medium

**Steps:**
1. Navigate to `/login` in English
2. Enter email and password (don't submit)
3. Switch language to French
4. Verify:
   - Labels update to French
   - Entered data preserved
   - Validation states preserved
5. Submit form
6. Verify messages in French

**Expected Results:**
- [ ] Language switch is instant (no page reload)
- [ ] User input preserved across language change
- [ ] All subsequent messages in new language

---

### TC-AUTH-10: Session & Cookie Persistence

**Priority:** High

**Steps:**
1. Clear all cookies
2. Navigate to `/login`
3. Set language to Italian (it)
4. Verify `FAQBNB_LANG=it` cookie set
5. Close browser tab
6. Open new tab, navigate to `/login`
7. Verify page loads in Italian
8. Log in successfully
9. Close browser tab
10. Open new tab, navigate to `/dashboard2`
11. Verify authenticated and in Italian

**Expected Results:**
- [ ] Language cookie persists across tabs
- [ ] Language preference survives authentication
- [ ] Logged-in users maintain language preference

---

### TC-AUTH-11: Browser Console - No Missing Keys

**Priority:** Critical

**Steps:**
1. Open browser DevTools, Console tab
2. Filter for "intl" or "translation" warnings
3. Navigate through all auth pages in each language:
   - `/login` (en, fr, es, de, nl, it)
   - `/register` (en, fr, es, de, nl, it)
   - `/register/success` (en, fr, es, de, nl, it)
   - `/register/complete` (en, fr, es, de, nl, it)
4. Trigger all validation states
5. Complete login flow

**Expected Results:**
- [ ] No "Missing translation" warnings
- [ ] No "Fallback to default locale" messages
- [ ] Console clean of i18n-related errors

---

### TC-AUTH-12: Success State Translations

**Priority:** High

**Steps:**
1. Set language to Dutch (nl)
2. Complete successful login
3. Verify success toast/message in Dutch
4. Set language to Italian (it)
5. Complete successful registration
6. Verify success page in Italian
7. Complete registration flow
8. Verify completion message in Italian

**Expected Results:**
- [ ] Login success message in target language
- [ ] Registration success page in target language
- [ ] Post-registration redirect maintains language

---

## Authorized Files and Functions for Modification

### Test Artifacts (Create/Modify)

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/` | Create Directory | Store test results |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Test-Results.md` | Create | Document test execution |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Screenshots/` | Create Directory | Visual evidence |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Defects.md` | Create | Issue tracking |

### Bug Fix Files (If Issues Found)

| File Path | Potential Modifications |
|-----------|------------------------|
| `/messages/en.json` | Add missing auth keys |
| `/messages/fr.json` | Fix French auth translations |
| `/messages/es.json` | Fix Spanish auth translations |
| `/messages/de.json` | Fix German auth translations |
| `/messages/nl.json` | Fix Dutch auth translations |
| `/messages/it.json` | Fix Italian auth translations |
| `/src/app/login/LoginPageContent.tsx` | Add missing useTranslations calls |
| `/src/components/LoginForm.tsx` | Add missing translations |
| `/src/components/RegistrationForm.tsx` | Add missing translations |
| `/src/components/GoogleOAuthButton.tsx` | Add button text translations |
| `/src/app/register/page.tsx` | Add missing translations |
| `/src/app/register/success/page.tsx` | Add missing translations |
| `/src/app/register/complete/page.tsx` | Add missing translations |

### Component Reference Files (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Locale configuration reference |
| `/src/components/LanguageSwitcher/` | Language switching implementation |
| `/src/contexts/AuthContext.tsx` | Authentication flow reference |
| `/src/middleware.ts` | Language detection middleware |

---

## Acceptance Criteria

### Required Criteria

- [ ] Test plan documented with all auth flows and verification points for each language
- [ ] Login flow tested in all 6 languages with documented results
- [ ] Registration flow tested in all 6 languages with documented results
- [ ] OAuth flow tested end-to-end maintaining language context
- [ ] All error scenarios triggered and verified in each language
- [ ] Dynamic content integration verified (email addresses, usernames)
- [ ] Layout and formatting inspected - no overflow/truncation
- [ ] Language switching tested mid-flow
- [ ] Session management verified through page refreshes and OAuth
- [ ] Browser console shows no missing translation warnings
- [ ] All visible text displays translated content (no English fallbacks)
- [ ] Form functionality operates identically across all languages
- [ ] Test results documented with screenshots

### Quality Gates

| Gate | Criteria | Status |
|------|----------|--------|
| Translation Coverage | 100% of auth UI strings translated in all 6 languages | Pending |
| No Visual Defects | No overflow, clipping, or layout breaks | Pending |
| No Console Errors | Zero i18n-related console warnings | Pending |
| Functional Parity | Auth works identically in all languages | Pending |
| Documentation | Complete test results with evidence | Pending |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys discovered | Medium | Low | Fix and re-run affected tests |
| German text overflow issues | High | Medium | CSS adjustments for flexible containers |
| OAuth flow loses language context | Medium | High | Verify cookie handling in middleware |
| Time constraints limit full testing | Low | Medium | Prioritize critical flows (login, registration) |

---

## Test Execution Checklist

### Pre-Test Setup

- [ ] Verify staging deployment current (check `/api/version`)
- [ ] Confirm all 2A.1-2A.9 tasks completed
- [ ] Clear browser cache and cookies
- [ ] Prepare screenshot tool
- [ ] Create test results directory
- [ ] Have test accounts ready (admin, new registration)

### During Testing

- [ ] Follow test cases systematically
- [ ] Document any deviations
- [ ] Capture screenshots for each language
- [ ] Note console warnings/errors
- [ ] Record defects immediately

### Post-Test

- [ ] Compile test results
- [ ] Categorize any defects by severity
- [ ] Determine Go/No-Go recommendation
- [ ] Update detailed spec with results
- [ ] Create follow-up tickets for any bugs

---

## Dependencies

| Dependency | Type | Status | Impact |
|------------|------|--------|--------|
| REQ-356 through REQ-361 (2A.1-2A.8) | Auth component i18n | Prerequisite | Cannot test without translations |
| REQ-362 (2A.9) | Translation generation | Prerequisite | Needs all 6 language files complete |
| Epic 1 Foundation | i18n infrastructure | Complete | Required for all translations |
| LanguageSwitcher | UI component | Complete | Required for language switching |
| Staging deployment | Environment | Required | Test environment must be current |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` (REQ-363)
- **Test Protocol:** `/docs/testing/L10N-E2E-Test-Protocol.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Translation Files:** `/messages/*.json`

---

*Document generated for REQ-363: Test All Authentication Flows in Each Supported Language*
*L10N Epic 2 - Sub-Epic 2A - Task 2A.10*
