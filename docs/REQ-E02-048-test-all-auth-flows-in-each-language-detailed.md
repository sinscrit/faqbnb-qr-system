# Detailed Task Breakdown: REQ-E02-048 - Test Authentication Flows in All Languages

**Document Created:** 2026-01-20 23:55:00 UTC
**Last Modified:** 2026-01-20 23:55:00 UTC

**Request ID:** REQ-E02-048
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.10
**Size:** M (Medium)
**Priority:** P1

---

## Overview

This document provides granular, actionable tasks for performing comprehensive end-to-end testing of all authentication flows in each of the six supported languages (English, Spanish, French, German, Dutch, Italian). This quality assurance task validates the cumulative work of Tasks 2A.1-2A.9.

**Referenced Documents:**
- Overview: `/docs/REQ-E02-048-test-all-auth-flows-in-each-language-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (REQ-E02-048)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Prerequisites

Before starting this task, ensure:

| Prerequisite | How to Verify |
|--------------|---------------|
| Tasks 2A.1-2A.9 completed | All auth components use `useTranslations`/`getTranslations` |
| Development server runs | `npm run dev` starts without errors |
| All 6 translation files exist | Check `/messages/{en,es,fr,de,nl,it}.json` |
| Auth namespace populated | Verify `auth` key exists in each JSON file |
| Valid test credentials available | Access to test account or ability to create one |
| Valid access code for registration | Have a test access code ready |

---

## Task Breakdown

### TASK 1: Test Environment Setup
**Story Points:** 0.5
**Type:** Setup/Preparation

#### 1.1 Verify Development Server
- [ ] Run `npm run dev` and confirm no build errors
- [ ] Navigate to `http://localhost:3000` and confirm app loads
- [ ] Check browser console for any i18n-related errors

#### 1.2 Verify Translation Files
- [ ] Confirm `/messages/en.json` exists with `auth` namespace
- [ ] Confirm `/messages/es.json` exists with `auth` namespace
- [ ] Confirm `/messages/fr.json` exists with `auth` namespace
- [ ] Confirm `/messages/de.json` exists with `auth` namespace
- [ ] Confirm `/messages/nl.json` exists with `auth` namespace
- [ ] Confirm `/messages/it.json` exists with `auth` namespace

#### 1.3 Document Language Switching Method
The application uses cookie-based language detection:

```javascript
// Method 1: Browser DevTools Console
document.cookie = 'FAQBNB_LANG=es; path=/; max-age=31536000';
location.reload();

// Method 2: Clear and set language
document.cookie = 'FAQBNB_LANG=; path=/; max-age=0'; // Clear
document.cookie = 'FAQBNB_LANG=fr; path=/; max-age=31536000'; // Set new
location.reload();
```

#### 1.4 Prepare Test Data
- [ ] Document test user email: `_________________`
- [ ] Document test user password: `_________________`
- [ ] Document valid access code: `_________________`
- [ ] Document test email for registration: `_________________`

**Completion Criteria:**
- Development server running
- All 6 translation files verified
- Language switching tested and working
- Test data prepared and documented

---

### TASK 2: English (en) Baseline Testing
**Story Points:** 1
**Type:** Testing

This establishes the baseline for all other language tests.

#### 2.1 Login Page Visual Verification
Navigate to `/login` with English locale and verify:

| Element | Expected Text | Status |
|---------|---------------|--------|
| Page title | "Sign in to your account" | [ ] |
| Page subtitle | "Access the FAQBNB administration panel" | [ ] |
| Google button | "Continue with Google" | [ ] |
| Divider text | "Or continue with email" | [ ] |
| Email label | "Email Address" | [ ] |
| Email placeholder | "Enter your email" | [ ] |
| Password label | "Password" | [ ] |
| Password placeholder | "Enter your password" | [ ] |
| Remember checkbox | "Remember me for 30 days" | [ ] |
| Submit button | "Sign In with Email" | [ ] |
| Security card title | "Secure Access" | [ ] |
| Security card text | Contains "restricted to authorized administrators" | [ ] |
| Back link | "Back to Home" | [ ] |

#### 2.2 Login Form Validation
Test form validation messages:

| Trigger | Expected Message | Status |
|---------|------------------|--------|
| Submit empty form | Required field messages | [ ] |
| Invalid email format | Email validation error | [ ] |
| Empty password | Password required message | [ ] |

#### 2.3 Login Error States
Test error messages:

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| Invalid credentials | "Invalid email or password" or equivalent | [ ] |
| Network error (disable network) | Network error message in English | [ ] |

#### 2.4 Login Success Flow
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify "Authenticating..." or loading message
- [ ] Verify redirect to dashboard

#### 2.5 Registration Page Visual Verification
Navigate to `/register?accessCode=TEST123&email=test@example.com`:

| Element | Expected Text | Status |
|---------|---------------|--------|
| Page title | Contains "Create" or "Register" | [ ] |
| Full Name label | "Full Name" | [ ] |
| Full Name optional note | "(optional)" | [ ] |
| Email label | "Email Address" | [ ] |
| Email locked notice | Email linked to access code text | [ ] |
| Password label | "Password" | [ ] |
| Confirm Password label | "Confirm Password" | [ ] |
| Submit button | "Create Account" | [ ] |
| Google option | "Continue with Google" text | [ ] |

#### 2.6 Password Strength Indicator
Test all password strength levels:

| Strength | Expected Label | Status |
|----------|----------------|--------|
| Very weak (1 char) | "Very Weak" | [ ] |
| Weak (lowercase only) | "Weak" | [ ] |
| Fair (lower + upper) | "Fair" | [ ] |
| Good (+ number) | "Good" | [ ] |
| Strong (+ special) | "Strong" | [ ] |

#### 2.7 Password Requirements List
Verify all requirement labels:

| Requirement | Expected Text | Status |
|-------------|---------------|--------|
| Minimum length | "At least 8 characters" | [ ] |
| Lowercase | "One lowercase letter" | [ ] |
| Uppercase | "One uppercase letter" | [ ] |
| Number | "One number" | [ ] |
| Special character | "One special character" | [ ] |

#### 2.8 Password Match Indicator
| State | Expected Text | Status |
|-------|---------------|--------|
| Passwords match | "Passwords match" | [ ] |
| Passwords don't match | "Passwords do not match" | [ ] |

#### 2.9 Registration Success Page
Navigate to `/register/success`:

| Element | Expected Text | Status |
|---------|---------------|--------|
| Success heading | Success message | [ ] |
| Next steps section | "What happens next" or similar | [ ] |
| Dashboard button | "Go to Dashboard" | [ ] |

#### 2.10 Registration Complete Page
Navigate to `/register/complete`:

| Element | Expected Text | Status |
|---------|---------------|--------|
| Page heading | Completion message | [ ] |
| Access code input label | "Access Code" | [ ] |
| Submit button | Submit/Complete button text | [ ] |

**Completion Criteria:**
- All English text verified correct
- All forms function properly
- All validation messages display
- All flows complete successfully

---

### TASK 3: Spanish (es) Testing
**Story Points:** 1
**Type:** Testing

Set language: `document.cookie = 'FAQBNB_LANG=es; path=/; max-age=31536000'; location.reload();`

#### 3.1 Login Page Verification

| Element | Verify Spanish | Status |
|---------|----------------|--------|
| Page title | Not English, Spanish text | [ ] |
| Google button | Spanish text | [ ] |
| Divider text | Spanish text | [ ] |
| Email label | Spanish text | [ ] |
| Password label | Spanish text | [ ] |
| Remember checkbox | Spanish text | [ ] |
| Submit button | Spanish text | [ ] |
| Security card | Spanish text | [ ] |

#### 3.2 Login Validation (Spanish)
- [ ] Submit empty form - Spanish validation messages
- [ ] Invalid email - Spanish error message
- [ ] Invalid credentials - Spanish error message

#### 3.3 Registration Page (Spanish)

| Element | Verify Spanish | Status |
|---------|----------------|--------|
| Full Name label | Spanish | [ ] |
| Email label | Spanish | [ ] |
| Password label | Spanish | [ ] |
| Submit button | Spanish | [ ] |

#### 3.4 Password Strength Indicator (Spanish)
| Strength | Expected Spanish | Status |
|----------|------------------|--------|
| Very weak | "Muy débil" or equivalent | [ ] |
| Weak | "Débil" or equivalent | [ ] |
| Fair | Spanish equivalent | [ ] |
| Good | Spanish equivalent | [ ] |
| Strong | "Fuerte" or equivalent | [ ] |

#### 3.5 Password Requirements (Spanish)
- [ ] All 5 requirements display in Spanish
- [ ] No English text visible

#### 3.6 Success/Complete Pages (Spanish)
- [ ] Success page - all Spanish
- [ ] Complete page - all Spanish
- [ ] No English fallback text

#### 3.7 Functional Test (Spanish)
- [ ] Complete login flow successfully
- [ ] Complete registration flow successfully (if test access code available)

**Issues Found:**
```
| Issue | Component | Description |
|-------|-----------|-------------|
|       |           |             |
```

---

### TASK 4: French (fr) Testing
**Story Points:** 1
**Type:** Testing

Set language: `document.cookie = 'FAQBNB_LANG=fr; path=/; max-age=31536000'; location.reload();`

#### 4.1 Login Page Verification

| Element | Verify French | Status |
|---------|---------------|--------|
| Page title | "Connectez-vous" or similar | [ ] |
| Google button | French text | [ ] |
| Divider text | French text | [ ] |
| Email label | French text | [ ] |
| Password label | "Mot de passe" | [ ] |
| Remember checkbox | French text | [ ] |
| Submit button | French text | [ ] |
| Security card | French text | [ ] |

#### 4.2 Login Validation (French)
- [ ] Submit empty form - French validation messages
- [ ] Invalid email - French error message
- [ ] Invalid credentials - French error message

#### 4.3 Registration Page (French)

| Element | Verify French | Status |
|---------|---------------|--------|
| Full Name label | "Nom complet" or similar | [ ] |
| Email label | "Adresse e-mail" or similar | [ ] |
| Password label | "Mot de passe" | [ ] |
| Submit button | "Créer un compte" or similar | [ ] |

#### 4.4 Password Strength Indicator (French)
| Strength | Expected French | Status |
|----------|-----------------|--------|
| Very weak | "Très faible" | [ ] |
| Weak | "Faible" | [ ] |
| Fair | "Moyen" or similar | [ ] |
| Good | "Bon" | [ ] |
| Strong | "Fort" | [ ] |

#### 4.5 Password Requirements (French)
- [ ] All 5 requirements display in French
- [ ] No English text visible

#### 4.6 Success/Complete Pages (French)
- [ ] Success page - all French
- [ ] Complete page - all French

#### 4.7 Functional Test (French)
- [ ] Complete login flow successfully
- [ ] Complete registration flow successfully

**Issues Found:**
```
| Issue | Component | Description |
|-------|-----------|-------------|
|       |           |             |
```

---

### TASK 5: German (de) Testing
**Story Points:** 1
**Type:** Testing

Set language: `document.cookie = 'FAQBNB_LANG=de; path=/; max-age=31536000'; location.reload();`

**IMPORTANT:** German translations are typically 30-40% longer than English. Pay special attention to:
- Text overflow in buttons
- Text truncation in labels
- Layout breaks due to longer text

#### 5.1 Login Page Verification

| Element | Verify German | Overflow Check | Status |
|---------|---------------|----------------|--------|
| Page title | German text | No overflow | [ ] |
| Google button | German text | No overflow | [ ] |
| Divider text | German text | No overflow | [ ] |
| Email label | German text | No overflow | [ ] |
| Password label | "Passwort" | No overflow | [ ] |
| Remember checkbox | German text | No overflow | [ ] |
| Submit button | German text | No overflow | [ ] |
| Security card | German text | No overflow | [ ] |

#### 5.2 Login Validation (German)
- [ ] Submit empty form - German validation messages
- [ ] Invalid email - German error message
- [ ] Invalid credentials - German error message

#### 5.3 Registration Page (German)

| Element | Verify German | Overflow Check | Status |
|---------|---------------|----------------|--------|
| Full Name label | German | No overflow | [ ] |
| Email label | German | No overflow | [ ] |
| Password label | German | No overflow | [ ] |
| Submit button | German | No overflow | [ ] |

#### 5.4 Password Strength Indicator (German)
| Strength | Expected German | Status |
|----------|-----------------|--------|
| Very weak | "Sehr schwach" | [ ] |
| Weak | "Schwach" | [ ] |
| Fair | German equivalent | [ ] |
| Good | "Gut" | [ ] |
| Strong | "Stark" | [ ] |

#### 5.5 Password Requirements (German)
- [ ] All 5 requirements display in German
- [ ] No text truncation
- [ ] No layout breaks

#### 5.6 Success/Complete Pages (German)
- [ ] Success page - all German
- [ ] Complete page - all German
- [ ] No text overflow issues

#### 5.7 Functional Test (German)
- [ ] Complete login flow successfully
- [ ] Complete registration flow successfully

**Layout/Overflow Issues Found:**
```
| Issue | Component | Description |
|-------|-----------|-------------|
|       |           |             |
```

---

### TASK 6: Dutch (nl) Testing
**Story Points:** 1
**Type:** Testing

Set language: `document.cookie = 'FAQBNB_LANG=nl; path=/; max-age=31536000'; location.reload();`

#### 6.1 Login Page Verification

| Element | Verify Dutch | Status |
|---------|--------------|--------|
| Page title | "Inloggen" or similar | [ ] |
| Google button | Dutch text | [ ] |
| Divider text | Dutch text | [ ] |
| Email label | "E-mailadres" | [ ] |
| Password label | "Wachtwoord" | [ ] |
| Remember checkbox | Dutch text | [ ] |
| Submit button | Dutch text | [ ] |
| Security card | Dutch text | [ ] |

#### 6.2 Login Validation (Dutch)
- [ ] Submit empty form - Dutch validation messages
- [ ] Invalid email - Dutch error message
- [ ] Invalid credentials - Dutch error message

#### 6.3 Registration Page (Dutch)

| Element | Verify Dutch | Status |
|---------|--------------|--------|
| Full Name label | Dutch | [ ] |
| Email label | Dutch | [ ] |
| Password label | Dutch | [ ] |
| Submit button | Dutch | [ ] |

#### 6.4 Password Strength Indicator (Dutch)
| Strength | Expected Dutch | Status |
|----------|----------------|--------|
| Very weak | "Zeer zwak" | [ ] |
| Weak | "Zwak" | [ ] |
| Fair | Dutch equivalent | [ ] |
| Good | "Goed" | [ ] |
| Strong | "Sterk" | [ ] |

#### 6.5 Password Requirements (Dutch)
- [ ] All 5 requirements display in Dutch
- [ ] No English text visible

#### 6.6 Success/Complete Pages (Dutch)
- [ ] Success page - all Dutch
- [ ] Complete page - all Dutch

#### 6.7 Functional Test (Dutch)
- [ ] Complete login flow successfully
- [ ] Complete registration flow successfully

**Issues Found:**
```
| Issue | Component | Description |
|-------|-----------|-------------|
|       |           |             |
```

---

### TASK 7: Italian (it) Testing
**Story Points:** 1
**Type:** Testing

Set language: `document.cookie = 'FAQBNB_LANG=it; path=/; max-age=31536000'; location.reload();`

#### 7.1 Login Page Verification

| Element | Verify Italian | Status |
|---------|----------------|--------|
| Page title | "Accedi" or similar | [ ] |
| Google button | Italian text | [ ] |
| Divider text | Italian text | [ ] |
| Email label | "Indirizzo email" | [ ] |
| Password label | "Password" | [ ] |
| Remember checkbox | Italian text | [ ] |
| Submit button | Italian text | [ ] |
| Security card | Italian text | [ ] |

#### 7.2 Login Validation (Italian)
- [ ] Submit empty form - Italian validation messages
- [ ] Invalid email - Italian error message
- [ ] Invalid credentials - Italian error message

#### 7.3 Registration Page (Italian)

| Element | Verify Italian | Status |
|---------|----------------|--------|
| Full Name label | Italian | [ ] |
| Email label | Italian | [ ] |
| Password label | Italian | [ ] |
| Submit button | "Crea account" or similar | [ ] |

#### 7.4 Password Strength Indicator (Italian)
| Strength | Expected Italian | Status |
|----------|------------------|--------|
| Very weak | "Molto debole" | [ ] |
| Weak | "Debole" | [ ] |
| Fair | Italian equivalent | [ ] |
| Good | "Buono" | [ ] |
| Strong | "Forte" | [ ] |

#### 7.5 Password Requirements (Italian)
- [ ] All 5 requirements display in Italian
- [ ] No English text visible

#### 7.6 Success/Complete Pages (Italian)
- [ ] Success page - all Italian
- [ ] Complete page - all Italian

#### 7.7 Functional Test (Italian)
- [ ] Complete login flow successfully
- [ ] Complete registration flow successfully

**Issues Found:**
```
| Issue | Component | Description |
|-------|-----------|-------------|
|       |           |             |
```

---

### TASK 8: Google OAuth Testing
**Story Points:** 1
**Type:** Testing

Test Google OAuth flow in each language.

#### 8.1 OAuth Button Text

| Language | Button Text Displays Correctly | Status |
|----------|--------------------------------|--------|
| English | "Continue with Google" | [ ] |
| Spanish | Spanish equivalent | [ ] |
| French | French equivalent | [ ] |
| German | German equivalent | [ ] |
| Dutch | Dutch equivalent | [ ] |
| Italian | Italian equivalent | [ ] |

#### 8.2 OAuth Loading State

| Language | "Connecting to Google..." equivalent | Status |
|----------|--------------------------------------|--------|
| English | Displays correctly | [ ] |
| Spanish | Spanish text | [ ] |
| French | French text | [ ] |
| German | German text | [ ] |
| Dutch | Dutch text | [ ] |
| Italian | Italian text | [ ] |

#### 8.3 OAuth Flow Completion
For each language (if possible to test):
- [ ] Click Google OAuth button
- [ ] Complete Google authentication
- [ ] Verify redirect back to app
- [ ] Verify success message in correct language
- [ ] Verify language persists after OAuth redirect

**Note:** OAuth flow testing may require actual Google accounts or mock OAuth responses.

---

### TASK 9: Mobile Responsiveness Testing
**Story Points:** 1
**Type:** Testing

Test at 375px viewport width (iPhone SE size).

#### 9.1 Login Page Mobile (All Languages)

| Language | Layout OK | No Truncation | Buttons Usable | Status |
|----------|-----------|---------------|----------------|--------|
| English | [ ] | [ ] | [ ] | |
| Spanish | [ ] | [ ] | [ ] | |
| French | [ ] | [ ] | [ ] | |
| German | [ ] | [ ] | [ ] | |
| Dutch | [ ] | [ ] | [ ] | |
| Italian | [ ] | [ ] | [ ] | |

#### 9.2 Registration Page Mobile (All Languages)

| Language | Layout OK | No Truncation | Forms Usable | Status |
|----------|-----------|---------------|--------------|--------|
| English | [ ] | [ ] | [ ] | |
| Spanish | [ ] | [ ] | [ ] | |
| French | [ ] | [ ] | [ ] | |
| German | [ ] | [ ] | [ ] | |
| Dutch | [ ] | [ ] | [ ] | |
| Italian | [ ] | [ ] | [ ] | |

#### 9.3 Mobile-Specific Issues
```
| Issue | Language | Component | Description |
|-------|----------|-----------|-------------|
|       |          |           |             |
```

---

### TASK 10: Edge Case Testing
**Story Points:** 0.5
**Type:** Testing

#### 10.1 Special Characters
Test rendering of special characters in each language:

| Language | Characters to Verify | Renders Correctly |
|----------|---------------------|-------------------|
| French | é, è, ê, ë, à, ù, ç, ô | [ ] |
| Spanish | ñ, á, é, í, ó, ú, ü | [ ] |
| German | ä, ö, ü, ß | [ ] |
| Dutch | ë, ï, é | [ ] |
| Italian | à, è, é, ì, ò, ù | [ ] |

#### 10.2 Variable Interpolation
Test that variables render correctly in error messages:

| Scenario | Variable | All Languages Work | Status |
|----------|----------|-------------------|--------|
| Rate limiting | `{minutes}` | [ ] | |
| Error display | `{error}` | [ ] | |
| Min characters | `{min}` | [ ] | |

#### 10.3 Console Error Check
For each language, check browser console:
- [ ] English - No missing translation warnings
- [ ] Spanish - No missing translation warnings
- [ ] French - No missing translation warnings
- [ ] German - No missing translation warnings
- [ ] Dutch - No missing translation warnings
- [ ] Italian - No missing translation warnings

#### 10.4 Language Switching Mid-Flow
- [ ] Start login form in English
- [ ] Switch to Spanish mid-form
- [ ] Verify form data preserved
- [ ] Verify all labels update to Spanish
- [ ] Complete form submission

#### 10.5 Page Metadata Verification
Check browser tab titles:

| Page | Language | Title in Correct Language | Status |
|------|----------|---------------------------|--------|
| Login | All 6 | [ ] | |
| Register | All 6 | [ ] | |
| Success | All 6 | [ ] | |
| Complete | All 6 | [ ] | |

---

### TASK 11: Bug Documentation and Fixes
**Story Points:** 1
**Type:** Bug Fix (if issues found)

#### 11.1 Issue Tracking Template

For each issue found, document:

```markdown
### Issue #: [Brief Title]

**Language:** [en/es/fr/de/nl/it]
**Component:** [LoginForm/RegistrationForm/etc.]
**Page:** [/login, /register, etc.]
**Severity:** [Critical/High/Medium/Low]

#### Description
[What is wrong]

#### Expected
[What should display]

#### Actual
[What displays instead]

#### Screenshot
[If applicable]

#### Translation Key
[If missing translation, specify the key path]

#### Fix Required
- [ ] Translation file update
- [ ] Component code fix
- [ ] CSS/layout fix
```

#### 11.2 Fix Priority

| Severity | Fix Immediately | Can Defer |
|----------|-----------------|-----------|
| Critical | Yes - Blocks usage | No |
| High | Yes - Bad UX | No |
| Medium | If time permits | Yes |
| Low | Document only | Yes |

#### 11.3 Translation File Fixes
If translation issues found, update the appropriate files:

| File | Keys to Update |
|------|----------------|
| `/messages/es.json` | |
| `/messages/fr.json` | |
| `/messages/de.json` | |
| `/messages/nl.json` | |
| `/messages/it.json` | |

---

### TASK 12: Test Results Summary
**Story Points:** 0.5
**Type:** Documentation

#### 12.1 Overall Test Results

| Language | Login Flow | Registration Flow | OAuth Flow | Mobile | Pass/Fail |
|----------|------------|-------------------|------------|--------|-----------|
| English | | | | | |
| Spanish | | | | | |
| French | | | | | |
| German | | | | | |
| Dutch | | | | | |
| Italian | | | | | |

#### 12.2 Issues Summary

| # | Issue | Language | Severity | Status |
|---|-------|----------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

#### 12.3 Sign-Off

- [ ] All critical issues resolved
- [ ] All high severity issues resolved
- [ ] Medium/low issues documented for future
- [ ] Test results documented
- [ ] Ready for production

**Tested by:** ________________
**Date:** ________________
**Environment:** ________________

---

## Files Referenced (Read Only for Testing)

| File | Purpose |
|------|---------|
| `/src/app/login/page.tsx` | Login page entry |
| `/src/app/login/LoginPageContent.tsx` | Login page content |
| `/src/components/LoginForm.tsx` | Login form |
| `/src/components/RegistrationForm.tsx` | Registration form |
| `/src/components/GoogleOAuthButton.tsx` | OAuth button |
| `/src/app/register/page.tsx` | Registration page |
| `/src/app/register/RegistrationPageContent.tsx` | Registration content |
| `/src/app/register/success/page.tsx` | Success page |
| `/src/app/register/complete/page.tsx` | Complete page |

## Files Authorized for Modification (Bug Fixes Only)

| File | Modification Type |
|------|-------------------|
| `/messages/en.json` | Fix missing keys only |
| `/messages/es.json` | Fix translation issues |
| `/messages/fr.json` | Fix translation issues |
| `/messages/de.json` | Fix translation issues |
| `/messages/nl.json` | Fix translation issues |
| `/messages/it.json` | Fix translation issues |

---

## Acceptance Criteria Checklist

### From REQ-E02-048:
- [ ] Login flow tested in all six languages with username/password authentication
- [ ] Google OAuth login tested in all six languages with proper language handoff
- [ ] Registration flow tested in all six languages including form validation messages
- [ ] Registration success and completion pages display correctly in all six languages
- [ ] Error messages display in the correct language for network failures, invalid credentials, and server errors
- [ ] Form field validation messages appear in the correct language for all field types
- [ ] Success messages and redirects function correctly in all language contexts
- [ ] No untranslated strings or translation key placeholders visible in any flow
- [ ] Language selection persists correctly throughout multi-step authentication processes
- [ ] Page metadata (titles, descriptions) displays in the correct language
- [ ] Loading states and progress indicators show translated text
- [ ] All interactive elements remain functional across all language variants
- [ ] Test coverage includes both desktop and mobile viewports
- [ ] Edge cases tested: very long translated strings, special characters

### Quality Gates:
- [ ] Zero visible translation keys (e.g., `auth.login.title`)
- [ ] Zero English text in non-English locales (except brand names)
- [ ] Zero layout breaks due to text length
- [ ] Zero console errors about missing translations
- [ ] All forms submit successfully in all languages

---

## Estimated Effort Summary

| Task | Story Points | Time Estimate |
|------|--------------|---------------|
| Task 1: Environment Setup | 0.5 | 15-20 min |
| Task 2: English Baseline | 1 | 45-60 min |
| Task 3: Spanish Testing | 1 | 30-45 min |
| Task 4: French Testing | 1 | 30-45 min |
| Task 5: German Testing | 1 | 30-45 min |
| Task 6: Dutch Testing | 1 | 30-45 min |
| Task 7: Italian Testing | 1 | 30-45 min |
| Task 8: OAuth Testing | 1 | 30-45 min |
| Task 9: Mobile Testing | 1 | 30-45 min |
| Task 10: Edge Cases | 0.5 | 20-30 min |
| Task 11: Bug Fixes | 1 | Variable |
| Task 12: Summary | 0.5 | 15-20 min |
| **Total** | **10.5** | **~4-5 hours** |

---

## References

- [Overview Document](/docs/REQ-E02-048-test-all-auth-flows-in-each-language-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2A
- [Requirements](/docs/gen_requests_epic2.md) - REQ-E02-048
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2A - Authentication & Registration*
*Task 2A.10: Test all auth flows in each language*
