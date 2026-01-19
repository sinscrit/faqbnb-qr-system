# REQ-363: Test All Authentication Flows in Each Supported Language - Detailed Task Breakdown

**Created:** 2026-01-19 16:45 UTC
**Last Modified:** 2026-01-19 16:45 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.10
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides a granular, step-by-step testing guide for verifying all authentication and registration flows across all six supported languages (English, French, Spanish, German, Dutch, Italian). This is the final verification step for Sub-Epic 2A, ensuring all translated components work correctly end-to-end.

**Task Type:** Manual Testing & Validation
**Testing Approach:** End-to-End (E2E) Manual Testing
**Documentation:** Results will be captured in test result artifacts

---

## Pre-Test Checklist

Before starting test execution, verify:

- [ ] **REQ-356 through REQ-361 Complete** - All auth components have been internationalized
- [ ] **REQ-362 Complete** - Translation generation for all 5 non-English languages
- [ ] **Staging Deployment Current** - Check `/api/version` endpoint
- [ ] **LanguageSwitcher Functional** - Can switch between all 6 languages
- [ ] **All Translation Files Populated** - `/messages/*.json` contain `auth` namespace
- [ ] **Test Accounts Available** - Admin and test user accounts ready
- [ ] **Browser DevTools Ready** - Console monitoring for translation warnings

### Staging Environment

| Property | Value |
|----------|-------|
| URL | https://faqbnb-staging.up.railway.app |
| Version API | https://faqbnb-staging.up.railway.app/api/version |
| Version Verified | ______ |

### Prerequisite Tasks (Must Be Complete)

| Task ID | Task Name | Status |
|---------|-----------|--------|
| 2A.1 | Create auth namespace structure | [ ] |
| 2A.2 | Update LoginPageContent.tsx | [ ] |
| 2A.3 | Update LoginForm.tsx | [ ] |
| 2A.4 | Update RegistrationForm.tsx | [ ] |
| 2A.5 | Update GoogleOAuthButton.tsx | [ ] |
| 2A.6 | Update Register page | [ ] |
| 2A.7 | Update Register success page | [ ] |
| 2A.8 | Update Register complete page | [ ] |
| 2A.9 | Generate translations for 5 non-English languages | [ ] |

---

## Test Environment Setup

### Browser Requirements

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| Chrome | Latest | Primary | [ ] Ready |
| Firefox | Latest | Secondary | [ ] Ready |
| Safari | Latest | Secondary | [ ] Ready |
| Edge | Latest | Secondary | [ ] Ready |
| iOS Safari | Latest | Mobile | [ ] Ready |
| Android Chrome | Latest | Mobile | [ ] Ready |

### Test Accounts

| Account Type | Email | Purpose | Status |
|--------------|-------|---------|--------|
| Admin | [TO_BE_CREATED] | Full feature access testing | [ ] Ready |
| New Registration | [GENERATED_EMAIL] | Registration flow testing | [ ] Ready |
| OAuth Test | [GOOGLE_ACCOUNT] | Google OAuth flow testing | [ ] Ready |

### Supported Languages Reference

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| fr | French | Francais |
| es | Spanish | Espanol |
| de | German | Deutsch |
| nl | Dutch | Nederlands |
| it | Italian | Italiano |

---

## Detailed Test Tasks

### Task 1: Test Environment Preparation

**Estimate:** 1 story point
**Dependencies:** All prerequisite tasks complete
**Output:** Documented environment state

#### 1.1 Verify Staging Deployment

```bash
curl https://faqbnb-staging.up.railway.app/api/version
```

**Record:**
- Deployed Version: ______
- Deployment Date: ______
- All L10N components present: [ ] Yes [ ] No

#### 1.2 Verify Translation Files Deployed

Navigate to staging and verify LanguageSwitcher shows all 6 languages.

| Language | Visible in Dropdown | Can Select | Status |
|----------|---------------------|------------|--------|
| English | [ ] | [ ] | ______ |
| Francais | [ ] | [ ] | ______ |
| Espanol | [ ] | [ ] | ______ |
| Deutsch | [ ] | [ ] | ______ |
| Nederlands | [ ] | [ ] | ______ |
| Italiano | [ ] | [ ] | ______ |

#### 1.3 Clear Test Environment

- [ ] Clear browser cookies for staging domain
- [ ] Clear browser cache
- [ ] Disable browser extensions that might interfere
- [ ] Create test results directory: `/docs/testing/results/L10N-E2E-Auth-{DATE}/`
- [ ] Prepare screenshot capture tool

---

### Task 2: Login Page - Full Language Cycle Test

**Estimate:** 2 story points
**Dependencies:** Task 1
**Priority:** Critical
**Test ID:** TC-AUTH-001

#### 2.1 Login Page Display Verification Per Language

For **EACH** language (en, fr, es, de, nl, it), execute the following:

**Steps:**
1. Clear browser cookies/cache
2. Navigate to `/login`
3. Use LanguageSwitcher to select target language
4. Wait for UI to update (should NOT require page reload)
5. Verify all text elements
6. Take screenshot for documentation
7. Save screenshot as: `Screenshots/login-{lang}.png`

**Verification Matrix:**

| Element | Translation Key | EN | FR | ES | DE | NL | IT |
|---------|-----------------|----|----|----|----|----|----|
| Page Title | `auth.login.title` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Subtitle | `auth.login.subtitle` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Admin Access Text | `auth.login.adminAccess` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Email Label | `auth.login.emailLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Email Placeholder | `auth.login.emailPlaceholder` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Password Label | `auth.login.passwordLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Password Placeholder | `auth.login.passwordPlaceholder` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Sign In Button | `auth.signIn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Google OAuth Button | `auth.continueWithGoogle` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Forgot Password Link | `auth.forgotPassword` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Back to Home Link | `auth.login.backToHome` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Clear Session Button | `auth.login.clearSession` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Copyright Notice | `auth.login.copyright` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Secure Access Title | `auth.login.secureAccess` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Secure Access Desc | `auth.login.secureAccessDescription` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

**Acceptance Criteria:**
- [ ] All 6 languages display complete translations
- [ ] No translation keys visible (e.g., `auth.login.title`)
- [ ] No English fallback text in non-English languages
- [ ] Layout maintains integrity (no overflow/clipping)
- [ ] Screenshots captured for all 6 languages

---

### Task 3: Login Form Validation Messages Test

**Estimate:** 2 story points
**Dependencies:** Task 2
**Priority:** Critical
**Test ID:** TC-AUTH-002

#### 3.1 Empty Field Validation

For **EACH** language (en, fr, es, de, nl, it):

**Steps:**
1. Navigate to `/login`
2. Switch to target language
3. Leave email field empty, click Sign In
4. Verify error message displays in target language
5. Clear, leave password field empty, click Sign In
6. Verify password error message displays in target language
7. Record results

**Validation Messages Matrix:**

| Validation | Translation Key | EN | FR | ES | DE | NL | IT |
|------------|-----------------|----|----|----|----|----|----|
| Email Required | `errors.form.required` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Password Required | `errors.form.required` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Invalid Email Format | `errors.form.email` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

#### 3.2 Invalid Email Format Validation

**Steps:**
1. Enter invalid email format (e.g., "notanemail")
2. Submit form
3. Verify email format error displays in target language

**Results:**

| Language | Error Message Displayed | Correct Translation | Status |
|----------|------------------------|---------------------|--------|
| EN | ______ | [ ] Yes | ______ |
| FR | ______ | [ ] Yes | ______ |
| ES | ______ | [ ] Yes | ______ |
| DE | ______ | [ ] Yes | ______ |
| NL | ______ | [ ] Yes | ______ |
| IT | ______ | [ ] Yes | ______ |

---

### Task 4: Login Authentication Error Messages Test

**Estimate:** 1 story point
**Dependencies:** Task 3
**Priority:** Critical
**Test ID:** TC-AUTH-003

#### 4.1 Invalid Credentials Error

For at least 3 languages (fr, de, it):

**Steps:**
1. Navigate to `/login`
2. Switch to target language
3. Enter valid email format but wrong credentials
4. Submit form
5. Verify "Invalid email or password" equivalent displays in target language

**Results:**

| Language | Error Message Displayed | Correct Translation | Status |
|----------|------------------------|---------------------|--------|
| FR | ______ | [ ] Yes | ______ |
| DE | ______ | [ ] Yes | ______ |
| IT | ______ | [ ] Yes | ______ |

**Expected Translations:**
- FR: "Email ou mot de passe invalide"
- DE: "Ungultige E-Mail oder Passwort"
- IT: "Email o password non validi"

---

### Task 5: Login Success Flow Test

**Estimate:** 1 story point
**Dependencies:** Task 4
**Priority:** Critical
**Test ID:** TC-AUTH-004

#### 5.1 Successful Login Messages

For at least 3 languages (es, nl, it):

**Steps:**
1. Navigate to `/login`
2. Switch to target language
3. Enter valid credentials
4. Submit form
5. Verify success message displays in target language
6. Verify redirect occurs correctly
7. Verify dashboard loads in same language

**Results:**

| Language | Success Message | Redirect Works | Dashboard Language | Status |
|----------|-----------------|----------------|-------------------|--------|
| ES | ______ | [ ] | [ ] ES | ______ |
| NL | ______ | [ ] | [ ] NL | ______ |
| IT | ______ | [ ] | [ ] IT | ______ |

---

### Task 6: Registration Page - Full Language Cycle Test

**Estimate:** 2 story points
**Dependencies:** Task 1
**Priority:** Critical
**Test ID:** TC-AUTH-005

#### 6.1 Registration Page Display Verification Per Language

For **EACH** language (en, fr, es, de, nl, it):

**Steps:**
1. Navigate to `/register` (with valid access code if required)
2. Switch to target language
3. Verify all form labels translate
4. Verify password requirements text translates
5. Verify terms acceptance text translates
6. Take screenshot: `Screenshots/register-{lang}.png`

**Verification Matrix:**

| Element | Translation Key | EN | FR | ES | DE | NL | IT |
|---------|-----------------|----|----|----|----|----|----|
| Page Title | `auth.register.title` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Subtitle | `auth.register.subtitle` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Full Name Label | `auth.register.fullNameLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Full Name Optional | `auth.register.fullNameOptional` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Email Label | `auth.register.emailLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Password Label | `auth.register.passwordLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Confirm Password Label | `auth.register.confirmPasswordLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Terms Label | `auth.register.termsLabel` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Terms of Service | `auth.register.termsOfService` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Privacy Policy | `auth.register.privacyPolicy` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Submit Button | `auth.register.submitButton` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Google Option | `auth.register.googleOption` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Task 7: Registration Password Strength Indicator Test

**Estimate:** 1 story point
**Dependencies:** Task 6
**Priority:** High
**Test ID:** TC-AUTH-006

#### 7.1 Password Strength Labels

For at least 3 languages (fr, de, es):

**Steps:**
1. Navigate to `/register`
2. Switch to target language
3. Start typing in password field
4. Observe password strength indicator labels
5. Verify all strength levels translate correctly

**Password Strength Matrix:**

| Strength Level | Key | FR | DE | ES |
|---------------|-----|----|----|-----|
| Very Weak | `auth.register.passwordStrength.veryWeak` | [ ] | [ ] | [ ] |
| Weak | `auth.register.passwordStrength.weak` | [ ] | [ ] | [ ] |
| Fair | `auth.register.passwordStrength.fair` | [ ] | [ ] | [ ] |
| Good | `auth.register.passwordStrength.good` | [ ] | [ ] | [ ] |
| Strong | `auth.register.passwordStrength.strong` | [ ] | [ ] | [ ] |

#### 7.2 Password Requirements List

| Requirement | Key | FR | DE | ES |
|-------------|-----|----|----|-----|
| Min 8 chars | `auth.register.passwordStrength.minChars` | [ ] | [ ] | [ ] |
| Lowercase | `auth.register.passwordStrength.lowercase` | [ ] | [ ] | [ ] |
| Uppercase | `auth.register.passwordStrength.uppercase` | [ ] | [ ] | [ ] |
| Number | `auth.register.passwordStrength.number` | [ ] | [ ] | [ ] |
| Special char | `auth.register.passwordStrength.special` | [ ] | [ ] | [ ] |

---

### Task 8: Registration Validation Messages Test

**Estimate:** 2 story points
**Dependencies:** Task 7
**Priority:** High
**Test ID:** TC-AUTH-007

#### 8.1 Registration Field Validations

For languages (es, fr, de):

**Steps:**
1. Navigate to `/register`
2. Switch to target language
3. Test each validation scenario
4. Record displayed messages

**Validation Matrix:**

| Validation | Scenario | ES | FR | DE |
|------------|----------|----|----|-----|
| Empty Name | Submit with empty name field | [ ] | [ ] | [ ] |
| Invalid Email | Submit with invalid email format | [ ] | [ ] | [ ] |
| Password Too Short | Enter password < 8 chars | [ ] | [ ] | [ ] |
| Password Mismatch | Confirm password doesn't match | [ ] | [ ] | [ ] |
| Terms Not Accepted | Submit without accepting terms | [ ] | [ ] | [ ] |
| Email Already Exists | Try to register existing email | [ ] | [ ] | [ ] |

**Password Mismatch Specific Test:**

| Language | Expected Message | Actual Message | Match |
|----------|-----------------|----------------|-------|
| ES | "Las contrasenas no coinciden" | ______ | [ ] |
| FR | "Les mots de passe ne correspondent pas" | ______ | [ ] |
| DE | "Passworter stimmen nicht uberein" | ______ | [ ] |

---

### Task 9: Registration Success Page Test

**Estimate:** 1 story point
**Dependencies:** Task 8
**Priority:** High
**Test ID:** TC-AUTH-008

#### 9.1 Registration Success Page Verification

For at least 3 languages (nl, it, fr):

**Steps:**
1. Complete successful registration in target language
2. Verify redirect to `/register/success`
3. Verify success page content displays in target language
4. Take screenshot: `Screenshots/register-success-{lang}.png`

**Results:**

| Language | Page Title | Success Message | Next Steps Text | Screenshot |
|----------|------------|-----------------|-----------------|------------|
| NL | [ ] | [ ] | [ ] | [ ] |
| IT | [ ] | [ ] | [ ] | [ ] |
| FR | [ ] | [ ] | [ ] | [ ] |

---

### Task 10: Registration Complete Page Test

**Estimate:** 1 story point
**Dependencies:** Task 9
**Priority:** High
**Test ID:** TC-AUTH-009

#### 10.1 Registration Complete Page Verification

For at least 3 languages (de, es, nl):

**Steps:**
1. Navigate to `/register/complete` (or complete OAuth flow)
2. Verify completion message displays in target language
3. Verify any instructions display in target language
4. Take screenshot: `Screenshots/register-complete-{lang}.png`

**Results:**

| Language | Page Title | Completion Message | Instructions | Screenshot |
|----------|------------|-------------------|--------------|------------|
| DE | [ ] | [ ] | [ ] | [ ] |
| ES | [ ] | [ ] | [ ] | [ ] |
| NL | [ ] | [ ] | [ ] | [ ] |

---

### Task 11: Google OAuth Button Text Test

**Estimate:** 1 story point
**Dependencies:** Task 1
**Priority:** High
**Test ID:** TC-AUTH-010

#### 11.1 OAuth Button Text Verification

For **EACH** language (en, fr, es, de, nl, it):

**Steps:**
1. Navigate to `/login`
2. Switch to target language
3. Verify Google button shows "Continue with Google" equivalent
4. Navigate to `/register`
5. Verify Google registration button text translates
6. Record button text

**Results:**

| Language | Login Google Button | Register Google Button | Match Expected |
|----------|--------------------|-----------------------|----------------|
| EN | [ ] "Continue with Google" | [ ] | [ ] |
| FR | [ ] "Continuer avec Google" | [ ] | [ ] |
| ES | [ ] "Continuar con Google" | [ ] | [ ] |
| DE | [ ] "Mit Google fortfahren" | [ ] | [ ] |
| NL | [ ] "Doorgaan met Google" | [ ] | [ ] |
| IT | [ ] "Continua con Google" | [ ] | [ ] |

---

### Task 12: OAuth Loading State Test

**Estimate:** 1 story point
**Dependencies:** Task 11
**Priority:** High
**Test ID:** TC-AUTH-011

#### 12.1 OAuth Initiation Loading Text

For at least 3 languages (fr, de, it):

**Steps:**
1. Navigate to `/login`
2. Switch to target language
3. Click Google OAuth button
4. Quickly observe loading text before redirect
5. Record loading message displayed

**Results:**

| Language | Expected Loading Text | Actual Text | Match |
|----------|-----------------------|-------------|-------|
| FR | "Connexion Google en cours..." | ______ | [ ] |
| DE | "Google-Anmeldung wird abgeschlossen..." | ______ | [ ] |
| IT | "Completamento accesso Google..." | ______ | [ ] |

---

### Task 13: OAuth Return Flow Language Persistence Test

**Estimate:** 2 story points
**Dependencies:** Task 12
**Priority:** High
**Test ID:** TC-AUTH-012

#### 13.1 Language Persistence Through OAuth Redirect

**Steps:**
1. Clear all cookies
2. Navigate to `/login`
3. Set language to French (fr)
4. Verify `FAQBNB_LANG=fr` cookie exists
5. Click Google OAuth button
6. Complete Google authentication
7. Upon return, verify:
   - Language is still French
   - Success/completion messages in French
   - Dashboard (if redirected) displays French UI

**Results:**

| Checkpoint | Expected | Actual | Status |
|------------|----------|--------|--------|
| Pre-OAuth language cookie | `FAQBNB_LANG=fr` | ______ | [ ] |
| Post-OAuth language cookie | `FAQBNB_LANG=fr` | ______ | [ ] |
| Post-OAuth UI language | French | ______ | [ ] |
| Success message language | French | ______ | [ ] |
| Redirect destination language | French | ______ | [ ] |

**Repeat for German (de):**

| Checkpoint | Expected | Actual | Status |
|------------|----------|--------|--------|
| Pre-OAuth language cookie | `FAQBNB_LANG=de` | ______ | [ ] |
| Post-OAuth language cookie | `FAQBNB_LANG=de` | ______ | [ ] |
| Post-OAuth UI language | German | ______ | [ ] |

---

### Task 14: Layout Overflow Testing - German Focus

**Estimate:** 1 story point
**Dependencies:** Tasks 2, 6
**Priority:** High
**Test ID:** TC-AUTH-013

**Rationale:** German typically has 30-40% longer words that may cause UI overflow.

#### 14.1 Login Page Layout - German

**Steps:**
1. Set language to German (de)
2. Navigate to `/login`
3. Inspect all UI elements for overflow/truncation

**Checklist:**

| Element | Fits Container | No Truncation | Readable | Status |
|---------|---------------|---------------|----------|--------|
| Page Title | [ ] | [ ] | [ ] | ______ |
| Subtitle | [ ] | [ ] | [ ] | ______ |
| Email Label | [ ] | [ ] | [ ] | ______ |
| Password Label | [ ] | [ ] | [ ] | ______ |
| Sign In Button | [ ] | [ ] | [ ] | ______ |
| Google Button | [ ] | [ ] | [ ] | ______ |
| Back to Home Link | [ ] | [ ] | [ ] | ______ |
| Clear Session Button | [ ] | [ ] | [ ] | ______ |
| Security Notice | [ ] | [ ] | [ ] | ______ |
| Copyright | [ ] | [ ] | [ ] | ______ |

#### 14.2 Registration Page Layout - German

**Steps:**
1. Set language to German (de)
2. Navigate to `/register`
3. Inspect all UI elements for overflow/truncation

**Checklist:**

| Element | Fits Container | No Truncation | Readable | Status |
|---------|---------------|---------------|----------|--------|
| Page Title | [ ] | [ ] | [ ] | ______ |
| Form Labels | [ ] | [ ] | [ ] | ______ |
| Password Requirements | [ ] | [ ] | [ ] | ______ |
| Terms Acceptance | [ ] | [ ] | [ ] | ______ |
| Submit Button | [ ] | [ ] | [ ] | ______ |
| Error Messages | [ ] | [ ] | [ ] | ______ |

#### 14.3 Mobile Viewport (375px Width) - German

**Steps:**
1. Set viewport to 375px width (iPhone)
2. Set language to German
3. Navigate through all auth pages
4. Check for horizontal scrollbars

**Results:**

| Page | Horizontal Scrollbar | Text Readable | Touch Targets OK | Status |
|------|---------------------|---------------|------------------|--------|
| /login | [ ] None | [ ] | [ ] | ______ |
| /register | [ ] None | [ ] | [ ] | ______ |
| /register/success | [ ] None | [ ] | [ ] | ______ |

---

### Task 15: Language Switching Mid-Flow Test

**Estimate:** 1 story point
**Dependencies:** Task 2
**Priority:** Medium
**Test ID:** TC-AUTH-014

#### 15.1 Mid-Form Language Switch

**Steps:**
1. Navigate to `/login` in English
2. Enter email address (don't submit)
3. Enter password (don't submit)
4. Switch language to French
5. Verify:
   - Labels update to French immediately
   - Entered email preserved
   - Entered password preserved
   - No validation state changes
6. Submit form
7. Verify all subsequent messages in French

**Results:**

| Checkpoint | Expected | Actual | Status |
|------------|----------|--------|--------|
| Language switch instant | No page reload | ______ | [ ] |
| Email field preserved | Value retained | ______ | [ ] |
| Password field preserved | Value retained | ______ | [ ] |
| Labels updated | French labels | ______ | [ ] |
| Validation messages | In French | ______ | [ ] |

---

### Task 16: Session & Cookie Persistence Test

**Estimate:** 1 story point
**Dependencies:** Task 1
**Priority:** High
**Test ID:** TC-AUTH-015

#### 16.1 Cookie-Based Language Persistence

**Steps:**
1. Clear all cookies
2. Navigate to `/login`
3. Set language to Italian (it)
4. Open DevTools > Application > Cookies
5. Verify `FAQBNB_LANG=it` cookie exists
6. Close browser tab completely
7. Open new tab, navigate to `/login`
8. Verify page loads in Italian

**Results:**

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Cookie created | `FAQBNB_LANG=it` | ______ | [ ] |
| Cookie attributes | HttpOnly, SameSite | ______ | [ ] |
| Persistence after tab close | Italian UI | ______ | [ ] |

#### 16.2 Authenticated Session Language Persistence

**Steps:**
1. Log in successfully
2. Set language to Dutch (nl)
3. Close browser completely
4. Re-open browser, navigate to `/dashboard2`
5. Verify authenticated AND in Dutch

**Results:**

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Post-login language | Dutch UI | ______ | [ ] |
| After browser restart | Dutch UI | ______ | [ ] |
| User preference saved | In database | ______ | [ ] |

---

### Task 17: Browser Console - Missing Translation Keys Test

**Estimate:** 1 story point
**Dependencies:** All previous tasks
**Priority:** Critical
**Test ID:** TC-AUTH-016

#### 17.1 Console Monitoring During Full Auth Flow

**Steps:**
1. Open browser DevTools, Console tab
2. Filter for "intl" or "translation" or "missing" warnings
3. Navigate through ALL auth pages in EACH language:
   - `/login` (en, fr, es, de, nl, it)
   - `/register` (en, fr, es, de, nl, it)
   - `/register/success` (en, fr, es, de, nl, it)
   - `/register/complete` (en, fr, es, de, nl, it)
4. On each page, trigger validation states
5. Document any console warnings

**Console Warnings Log:**

| Page | Language | Warning Message | Key/Context | Severity |
|------|----------|-----------------|-------------|----------|
| | | | | |
| | | | | |
| | | | | |

**Acceptance Criteria:**
- [ ] Zero "Missing translation" warnings
- [ ] Zero "Fallback to default locale" messages
- [ ] Console clean of i18n-related errors

---

### Task 18: Dynamic Content Integration Test

**Estimate:** 1 story point
**Dependencies:** Tasks 5, 9
**Priority:** High
**Test ID:** TC-AUTH-017

#### 18.1 Dynamic Value Interpolation

Verify dynamic values display correctly in translated strings:

| Scenario | Variable | EN Format | FR Format | DE Format | Status |
|----------|----------|-----------|-----------|-----------|--------|
| Copyright Year | `{year}` | "© 2026 FAQBNB..." | "© 2026 FAQBNB..." | "© 2026 FAQBNB..." | [ ] |
| Welcome Message | `{name}` | "Welcome, [name]" | "Bienvenue, [name]" | "Willkommen, [name]" | [ ] |
| Error with Email | `{email}` | "Email [email] already exists" | French equivalent | German equivalent | [ ] |

---

### Task 19: Cross-Browser Compatibility Test

**Estimate:** 2 story points
**Dependencies:** Task 17
**Priority:** High
**Test ID:** TC-AUTH-018

#### 19.1 Chrome (Primary Browser)

| Test Area | Status | Notes |
|-----------|--------|-------|
| Language switching | [ ] | |
| Cookie persistence | [ ] | |
| Form validation | [ ] | |
| OAuth flow | [ ] | |
| No visual glitches | [ ] | |

**Chrome Version Tested:** ______

#### 19.2 Firefox

| Test Area | Status | Notes |
|-----------|--------|-------|
| Language switching | [ ] | |
| Cookie persistence | [ ] | |
| Form validation | [ ] | |
| No visual glitches | [ ] | |

**Firefox Version Tested:** ______

#### 19.3 Safari

| Test Area | Status | Notes |
|-----------|--------|-------|
| Language switching | [ ] | |
| Cookie persistence | [ ] | |
| Form validation | [ ] | |
| No visual glitches | [ ] | |

**Safari Version Tested:** ______

#### 19.4 Edge

| Test Area | Status | Notes |
|-----------|--------|-------|
| Language switching | [ ] | |
| Cookie persistence | [ ] | |
| Form validation | [ ] | |

**Edge Version Tested:** ______

---

### Task 20: Mobile Testing

**Estimate:** 1 story point
**Dependencies:** Task 19
**Priority:** High
**Test ID:** TC-AUTH-019

#### 20.1 iOS Safari

| Test Area | Status | Notes |
|-----------|--------|-------|
| LanguageSwitcher accessible | [ ] | |
| Touch targets sized correctly | [ ] | |
| Language change works | [ ] | |
| Form inputs work correctly | [ ] | |
| No horizontal scroll | [ ] | |

**iOS Version Tested:** ______

#### 20.2 Android Chrome

| Test Area | Status | Notes |
|-----------|--------|-------|
| LanguageSwitcher accessible | [ ] | |
| Touch targets sized correctly | [ ] | |
| Language change works | [ ] | |
| Form inputs work correctly | [ ] | |
| No horizontal scroll | [ ] | |

**Android Version Tested:** ______

---

### Task 21: Compile Test Results and Create Report

**Estimate:** 1 story point
**Dependencies:** All previous tasks
**Priority:** Critical

#### 21.1 Create Test Results Document

**Output File:** `/docs/testing/results/L10N-E2E-Auth-{DATE}/Test-Results.md`

**Contents:**
1. Executive Summary
2. Test Environment Details
3. Test Case Results Summary
4. Screenshots Index
5. Defects Discovered
6. Go/No-Go Recommendation

#### 21.2 Compile Screenshots

**Output Directory:** `/docs/testing/results/L10N-E2E-Auth-{DATE}/Screenshots/`

Required Screenshots:
- [ ] `login-en.png`
- [ ] `login-fr.png`
- [ ] `login-es.png`
- [ ] `login-de.png`
- [ ] `login-nl.png`
- [ ] `login-it.png`
- [ ] `register-en.png`
- [ ] `register-fr.png`
- [ ] `register-es.png`
- [ ] `register-de.png`
- [ ] `register-nl.png`
- [ ] `register-it.png`
- [ ] `register-success-{lang}.png` (min 3)
- [ ] `validation-errors-{lang}.png` (min 3)
- [ ] `german-overflow-check.png`
- [ ] `mobile-login.png`
- [ ] `mobile-register.png`

#### 21.3 Create Defect Log (If Issues Found)

**Output File:** `/docs/testing/results/L10N-E2E-Auth-{DATE}/Defects.md`

**Defect Template:**
```markdown
## DEF-L10N-AUTH-{NUMBER}

**Severity:** Critical / High / Medium / Low
**Test Case:** TC-AUTH-{NUMBER}
**Language(s) Affected:** {lang codes}
**Page:** {path}

### Description
{description}

### Steps to Reproduce
1. {step}
2. {step}

### Expected Result
{expected}

### Actual Result
{actual}

### Screenshot
{path-to-screenshot}

### Recommended Fix
{recommendation}
```

---

## Test Results Summary Template

### Overall Test Status

| Category | Total Tests | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| Login Page Display | 84 (14x6) | | | |
| Login Validation | 18 (6x3) | | | |
| Login Auth Errors | 6 | | | |
| Login Success | 6 | | | |
| Registration Display | 72 (12x6) | | | |
| Registration Validation | 36 | | | |
| OAuth Flow | 18 | | | |
| Layout/Overflow | 30 | | | |
| Cross-Browser | 20 | | | |
| Mobile | 12 | | | |
| **TOTAL** | **302** | | | |

### Quality Gates Status

| Gate | Criteria | Status |
|------|----------|--------|
| Translation Coverage | 100% of auth UI strings translated in all 6 languages | [ ] Pass [ ] Fail |
| No Visual Defects | No overflow, clipping, or layout breaks | [ ] Pass [ ] Fail |
| No Console Errors | Zero i18n-related console warnings | [ ] Pass [ ] Fail |
| Functional Parity | Auth works identically in all languages | [ ] Pass [ ] Fail |
| Documentation | Complete test results with evidence | [ ] Pass [ ] Fail |

### Go/No-Go Decision

- [ ] **GO** - All quality gates passed, no critical defects
- [ ] **NO-GO** - One or more quality gates failed, critical defects exist

**Decision Made By:** ______
**Date:** ______

---

## Authorized Files for Modification

### Test Artifacts (Create)

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/` | Create Directory | Store test results |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Test-Results.md` | Create | Document test execution |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Screenshots/` | Create Directory | Visual evidence |
| `/docs/testing/results/L10N-E2E-Auth-{DATE}/Defects.md` | Create | Issue tracking |

### Bug Fix Files (If Issues Discovered)

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

### Reference Files (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Locale configuration reference |
| `/src/components/LanguageSwitcher/` | Language switching implementation |
| `/src/contexts/AuthContext.tsx` | Authentication flow reference |
| `/src/middleware.ts` | Language detection middleware |
| `/docs/testing/L10N-E2E-Test-Protocol.md` | Test methodology reference |
| `/docs/testing/L10N-Pre-Test-Checklist.md` | Pre-test verification |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys discovered | Medium | Low | Fix keys in translation files, re-run affected tests |
| German text overflow issues | High | Medium | CSS adjustments for flexible containers, consider shorter translations |
| OAuth flow loses language context | Medium | High | Verify cookie handling in middleware, check OAuth callback logic |
| Time constraints limit full testing | Low | Medium | Prioritize critical flows (login, registration) first |
| Cross-browser inconsistencies | Low | Medium | Focus on primary browser (Chrome) first, document others |
| Test account not working | Low | High | Have backup accounts ready, verify accounts before test |

---

## Dependencies

| Dependency | Type | Status | Impact |
|------------|------|--------|--------|
| REQ-356 through REQ-361 (2A.1-2A.8) | Auth component i18n | Prerequisite | Cannot test without translations |
| REQ-362 (2A.9) | Translation generation | Prerequisite | Needs all 6 language files complete |
| Epic 1 Foundation | i18n infrastructure | Complete | Required for all translations |
| LanguageSwitcher | UI component | Complete | Required for language switching |
| Staging deployment | Environment | Required | Test environment must be current |
| Test accounts | Resources | Required | Needed for auth flow testing |

---

## Acceptance Criteria Verification

| Criterion | Task(s) | Status |
|-----------|---------|--------|
| Test plan documented with all auth flows for each language | This Document | [ ] |
| Login flow tested in all 6 languages with documented results | Tasks 2-5 | [ ] |
| Registration flow tested in all 6 languages with documented results | Tasks 6-10 | [ ] |
| OAuth flow tested end-to-end maintaining language context | Tasks 11-13 | [ ] |
| All error scenarios triggered and verified in each language | Tasks 3, 4, 8 | [ ] |
| Dynamic content integration verified | Task 18 | [ ] |
| Layout and formatting inspected - no overflow/truncation | Task 14 | [ ] |
| Language switching tested mid-flow | Task 15 | [ ] |
| Session management verified through page refreshes and OAuth | Task 16 | [ ] |
| Browser console shows no missing translation warnings | Task 17 | [ ] |
| All visible text displays translated content | Tasks 2, 6 | [ ] |
| Form functionality operates identically across all languages | Tasks 3, 8 | [ ] |
| Test results documented with screenshots | Task 21 | [ ] |
| Cross-browser compatibility verified | Task 19 | [ ] |
| Mobile responsiveness verified | Task 20 | [ ] |

---

## References

- **Overview Document:** `/docs/REQ-363-test-all-auth-flows-in-each-language-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` (REQ-363)
- **Test Protocol:** `/docs/testing/L10N-E2E-Test-Protocol.md`
- **Pre-Test Checklist:** `/docs/testing/L10N-Pre-Test-Checklist.md`
- **Defect Report Template:** `/docs/testing/L10N-E2E-Defect-Report-Template.md`
- **Results Template:** `/docs/testing/L10N-E2E-Test-Results-Template.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Translation Files:** `/messages/*.json`

---

*Document generated for REQ-363: Test All Authentication Flows in Each Supported Language*
*L10N Epic 2 - Sub-Epic 2A - Task 2A.10*
*Detailed breakdown created: 2026-01-19 16:45 UTC*
