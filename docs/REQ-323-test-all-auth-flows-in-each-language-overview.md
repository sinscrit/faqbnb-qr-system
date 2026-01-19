# REQ-323: Test All Auth Flows in Each Language - Implementation Overview

**Generated:** 2026-01-18 23:45 UTC
**Last Modified:** 2026-01-18 23:45 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #323 (Task 2A.10)
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (Sub-Epic 2A: Authentication & Registration)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 2A.10 (Test All Auth Flows in Each Language) from the Localization Epic 2 implementation plan. The task ensures comprehensive end-to-end testing of all authentication and registration flows across all 6 supported languages (English, French, Spanish, German, Dutch, Italian) to validate that translations are correctly displayed, forms function properly, and the user experience is consistent across locales.

**Note:** This is a testing and validation task that should be executed after Tasks 2A.1-2A.9 have been completed, which include:
- Creating the `auth` namespace structure in translation files
- Updating LoginPageContent, LoginForm, RegistrationForm, GoogleOAuthButton
- Updating register page, success page, and complete page
- Generating translations for 5 non-English languages

---

## Technical Context

### Epic 1 Foundation (Prerequisite)

| Technology | Details |
|------------|---------|
| **i18n Framework** | next-intl (installed in Epic 1) |
| **Locale Configuration** | `/src/lib/i18n/config.ts` |
| **Supported Locales** | `['en', 'fr', 'es', 'de', 'nl', 'it']` |
| **Default Locale** | `en` (English) |
| **Locale Cookie** | `FAQBNB_LANG` |
| **Translation Files** | `/messages/{locale}.json` |

### Authentication Component Inventory

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | ~40 |
| LoginForm | `/src/components/LoginForm.tsx` | ~30 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~50 |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | ~10 |
| Register page | `/src/app/register/page.tsx` | ~5 |
| Register success page | `/src/app/register/success/page.tsx` | ~25 |
| Register complete page | `/src/app/register/complete/page.tsx` | ~30 |
| RegistrationPageContent | `/src/app/register/RegistrationPageContent.tsx` | ~20 |

### Authentication Flows to Test

1. **Email/Password Login Flow**
   - Navigate to login page
   - View form labels and placeholders
   - Submit with validation errors (test error messages)
   - Submit with valid credentials
   - View success message and redirect

2. **Google OAuth Login Flow**
   - Navigate to login page
   - Click Google sign-in button
   - Complete OAuth flow
   - View completion messages

3. **Registration Flow (Email/Password)**
   - Navigate to registration with access code
   - View all form elements
   - Submit with validation errors
   - Complete registration
   - View success page

4. **Registration Flow (Google OAuth)**
   - Navigate to registration with access code
   - Select Google OAuth method
   - Complete OAuth flow
   - View success page

5. **Complete Registration Flow (Orphaned OAuth)**
   - Navigate to complete registration page
   - Enter access code
   - Complete registration
   - View confirmation

---

## Testing Strategy

### Test Types

| Type | Purpose | Tools |
|------|---------|-------|
| **Manual Visual Testing** | Verify translations display correctly | Browser DevTools, Locale Switcher |
| **Functional Testing** | Verify forms work in all languages | Manual testing, optional Playwright |
| **Visual Regression** | Check for layout issues due to text length | Screenshots comparison |
| **Translation Completeness** | Verify no missing translation keys | Build-time checks, Console warnings |

### Testing Matrix

For each of the 6 supported languages, test:

| Test Case | EN | FR | ES | DE | NL | IT |
|-----------|----|----|----|----|----|----|
| Login page loads correctly | | | | | | |
| Login form labels display | | | | | | |
| Login validation errors display | | | | | | |
| Login success message displays | | | | | | |
| Google OAuth button text | | | | | | |
| Registration page loads | | | | | | |
| Registration form labels | | | | | | |
| Registration validation errors | | | | | | |
| Password strength labels | | | | | | |
| Terms & Privacy links text | | | | | | |
| Success page content | | | | | | |
| Complete registration page | | | | | | |
| Loading states messages | | | | | | |
| Security notice text | | | | | | |

---

## Authorized Files and Functions for Modification

### Test Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `tests/e2e/auth-l10n.spec.ts` | E2E tests for auth flows in all languages (optional) |
| `docs/testing/auth-l10n-test-results.md` | Test results documentation |

### Files to Verify (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/messages/en.json` | English translations source of truth |
| `/messages/fr.json` | French translations |
| `/messages/es.json` | Spanish translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/src/app/login/LoginPageContent.tsx` | Login page component |
| `/src/components/LoginForm.tsx` | Login form component |
| `/src/components/RegistrationForm.tsx` | Registration form component |
| `/src/components/GoogleOAuthButton.tsx` | Google OAuth button |
| `/src/app/register/page.tsx` | Registration page |
| `/src/app/register/success/page.tsx` | Registration success page |
| `/src/app/register/complete/page.tsx` | Complete registration page |
| `/src/lib/i18n/config.ts` | i18n configuration |

---

## Implementation Tasks

### Task 1: Set Up Language Switching for Testing

**Objective:** Enable easy language switching during testing

**Steps:**
1. Use the language preference cookie `FAQBNB_LANG` to switch locales
2. Alternative: Add `?locale=fr` query parameter support if implemented
3. Clear browser cache between language tests

**Testing Commands (Browser Console):**
```javascript
// Set language to French
document.cookie = "FAQBNB_LANG=fr; path=/; max-age=31536000";
location.reload();

// Set language to Spanish
document.cookie = "FAQBNB_LANG=es; path=/; max-age=31536000";
location.reload();

// Reset to English
document.cookie = "FAQBNB_LANG=en; path=/; max-age=31536000";
location.reload();
```

---

### Task 2: Test Login Page Content (All Languages)

**File:** `/src/app/login/LoginPageContent.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.login.title` | "Sign in to your account" | Visible as H2 heading |
| `auth.login.subtitle` | "Access the FAQBNB administration panel" | Visible below title |
| `auth.login.brand` | "FAQBNB" | Header brand text |
| `auth.login.adminAccess` | "Admin Access" | Below brand |
| `auth.login.backToHome` | "Back to Home" | Footer link |
| `auth.login.clearSession` | "Clear Session" | Footer button |
| `auth.login.secureAccess` | "Secure Access" | Security notice heading |
| `auth.login.secureAccessDescription` | Security notice text | Security notice body |
| `auth.login.loading.authenticating` | "Completing authentication..." | During auth |
| `auth.login.loading.loading` | "Loading authentication..." | Initial load |
| `auth.login.messages.success` | "Login successful! Redirecting..." | After login |
| `auth.login.messages.completingGoogle` | "Completing Google sign-in..." | OAuth flow |

**Test Procedure per Language:**
1. Navigate to `/login`
2. Verify all static text elements are translated
3. Check for console warnings about missing translations
4. Verify layout is not broken by text length differences
5. Screenshot for documentation

---

### Task 3: Test Login Form Component (All Languages)

**File:** `/src/components/LoginForm.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.login.emailLabel` | "Email Address" | Form label |
| `auth.login.passwordLabel` | "Password" | Form label |
| `auth.login.submitButton` | "Sign In with Email" | Button text |
| `auth.login.rememberMe` | "Remember me for 30 days" | Checkbox label |
| `auth.login.signInWith` | "Sign in with your account" | OAuth section text |
| `auth.login.orContinue` | "Or continue with email" | Divider text |
| `auth.login.signingIn` | "Signing In..." | Loading state |
| `common.accessRestricted` | "Access restricted to authorized administrators only" | Helper text |

**Validation Error Messages:**

| Key | English Text |
|-----|--------------|
| `errors.form.email` | "Please enter a valid email address" |
| `errors.form.required` | "Email is required" / "Password is required" |
| `errors.form.password.tooShort` | "Password must be at least 6 characters" |
| `errors.auth.invalidCredentials` | "Invalid email or password. Please check your credentials and try again." |
| `errors.auth.accessDenied` | "Access denied. Admin privileges are required." |

**Test Procedure per Language:**
1. Navigate to `/login`
2. Attempt submit with empty form (verify error messages)
3. Enter invalid email format (verify validation error)
4. Enter short password (verify validation error)
5. Submit with invalid credentials (verify general error)
6. Verify all form labels and placeholders are translated

---

### Task 4: Test Registration Form Component (All Languages)

**File:** `/src/components/RegistrationForm.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.register.emailLabel` | "Email Address" | Form label |
| `auth.register.emailLinked` | "This email is linked to your access code and cannot be changed." | Email hint |
| `auth.register.fullNameLabel` | "Full Name" | Form label |
| `auth.register.fullNameOptional` | "(optional)" | Label suffix |
| `auth.register.passwordLabel` | "Password" | Form label |
| `auth.register.confirmPasswordLabel` | "Confirm Password" | Form label |
| `auth.register.termsLabel` | "I agree to the" | Terms checkbox |
| `auth.register.termsOfService` | "Terms of Service" | Link text |
| `auth.register.and` | "and" | Connector |
| `auth.register.privacyPolicy` | "Privacy Policy" | Link text |
| `auth.register.submitButton` | "Create Account" | Button text |
| `auth.register.creating` | "Creating Account..." | Loading state |
| `auth.register.accessCodeInfo` | "Access code:" | Info badge |
| `auth.register.accountLinked` | "Your account will be linked to your verified access code" | Footer text |

**Password Strength Labels:**

| Key | English Text |
|-----|--------------|
| `auth.register.passwordStrength.label` | "Password strength:" |
| `auth.register.passwordStrength.veryWeak` | "Very Weak" |
| `auth.register.passwordStrength.weak` | "Weak" |
| `auth.register.passwordStrength.fair` | "Fair" |
| `auth.register.passwordStrength.good` | "Good" |
| `auth.register.passwordStrength.strong` | "Strong" |
| `auth.register.passwordStrength.requirements` | "Requirements:" |
| `auth.register.passwordStrength.minChars` | "At least 8 characters" |
| `auth.register.passwordStrength.lowercase` | "One lowercase letter" |
| `auth.register.passwordStrength.uppercase` | "One uppercase letter" |
| `auth.register.passwordStrength.number` | "One number" |
| `auth.register.passwordStrength.special` | "One special character" |

**Gmail User Registration Method Selector:**

| Key | English Text |
|-----|--------------|
| `auth.register.chooseMethod` | "Choose how to create your account" |
| `auth.register.googleOption` | "Continue with Google" |
| `auth.register.googleDescription` | "Quick sign-up using your Google account" |
| `auth.register.emailOption` | "Sign up with email" |
| `auth.register.emailDescription` | "Create a password for your account" |

**Test Procedure per Language:**
1. Navigate to `/register?accessCode=TEST123&email=test@gmail.com`
2. Verify registration method selector for Gmail users
3. Select email/password method
4. Verify all form labels are translated
5. Enter weak password and verify strength indicator labels
6. Leave required fields empty and verify validation errors
7. Verify terms and privacy policy link text
8. Complete form and verify success messages

---

### Task 5: Test Google OAuth Button (All Languages)

**File:** `/src/components/GoogleOAuthButton.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.googleButton` | "Continue with Google" | Button text (idle) |
| `auth.connectingGoogle` | "Connecting to Google..." | Button text (loading) |

**Test Procedure per Language:**
1. Navigate to login and registration pages
2. Verify button text in idle state
3. Click button and verify loading text (before redirect)
4. Verify aria-label is translated for accessibility

---

### Task 6: Test Registration Success Page (All Languages)

**File:** `/src/app/register/success/page.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.register.success.title` | "Registration Successful!" | Page heading |
| `auth.register.success.subtitle` | Success message for OAuth | Conditional text |
| `auth.register.success.nonOAuthMessage` | Success message for email/password | Conditional text |
| `auth.register.success.autoLogin` | "Logging you in automatically..." | OAuth auto-login |
| `auth.register.success.autoRedirect` | "You will be automatically redirected to the dashboard in 2 seconds." | OAuth timer |
| `auth.register.success.loginRedirect` | "You will be automatically redirected to the login page in 5 seconds." | Email timer |
| `auth.register.success.goToDashboard` | "Go to Dashboard" | OAuth button |
| `auth.register.success.continueToLogin` | "Continue to Login" | Email button |
| `auth.register.success.backToHome` | "Back to Home" | Secondary button |
| `auth.register.success.setupComplete` | "Account Setup Complete:" | List heading |
| `auth.register.success.userCreated` | "User account created" | List item |
| `auth.register.success.accountEstablished` | "Default account established" | List item |
| `auth.register.success.adminPrivileges` | "Admin privileges configured" | List item |
| `auth.register.success.accessCodeValidated` | "Access code validated" | List item |

**Test Procedure per Language:**
1. Complete registration (email/password method)
2. Verify success page content
3. Verify auto-redirect message text
4. Complete registration (OAuth method)
5. Verify OAuth-specific success messages

---

### Task 7: Test Complete Registration Page (All Languages)

**File:** `/src/app/register/complete/page.tsx`

**Elements to Verify:**

| Translation Key | English Text | Test |
|----------------|--------------|------|
| `auth.register.complete.title` | "Almost there!" | Page heading |
| `auth.register.complete.subtitle` | "Your Google sign-in was successful, but we need an access code to complete your registration." | Page subtitle |
| `auth.register.complete.signedInAs` | "Signed in as:" | Info banner |
| `auth.register.complete.enterCode` | "Enter your access code to complete account setup." | Info banner text |
| `auth.register.complete.accessCodeLabel` | "Access Code" | Form label |
| `auth.register.complete.accessCodeHint` | "Check your email for the access code from your invitation." | Form hint |
| `auth.register.complete.submitButton` | "Complete Registration" | Button text |
| `auth.register.complete.completing` | "Completing Registration..." | Loading state |
| `auth.register.complete.wrongAccount` | "Wrong account? Sign out and try again." | Sign out text |
| `auth.register.complete.signOut` | "Sign Out" | Sign out button |
| `auth.register.complete.requestAccessCode` | "Request Access Code" | Footer link |
| `auth.register.complete.success.title` | "Registration Complete!" | Success heading |
| `auth.register.complete.success.message` | "Your account has been set up successfully." | Success message |
| `auth.register.complete.success.redirecting` | "Redirecting to dashboard..." | Success redirect |

**Test Procedure per Language:**
1. Navigate to `/register/complete?email=test@example.com`
2. Verify page heading and instructions
3. Verify "Signed in as" info banner
4. Verify form labels and placeholders
5. Submit invalid access code (verify error messages)
6. Verify sign out button text
7. Verify footer links text

---

### Task 8: Visual Regression Testing

**Objective:** Ensure layout is not broken by text length differences across languages

**Focus Areas:**
1. German text often 30-40% longer than English
2. French text approximately 20-30% longer
3. Button text should not overflow
4. Form labels should not wrap unexpectedly
5. Error messages should fit within containers

**Test Procedure:**
1. Take screenshots of each auth page in English (baseline)
2. Switch to German and take screenshots
3. Compare for layout issues:
   - Button text truncation
   - Label wrapping
   - Container overflow
   - Alignment issues
4. Document any issues requiring CSS adjustments

---

### Task 9: Console Warning Check

**Objective:** Verify no missing translation key warnings

**Test Procedure per Language:**
1. Open browser DevTools Console
2. Navigate through all auth flows
3. Monitor for warnings like:
   - `Missing translation: auth.login.xxx`
   - `MISSING TRANSLATION`
   - next-intl warning messages
4. Document any missing keys
5. Create fix tasks for missing translations

---

### Task 10: Create Test Results Documentation

**File:** `docs/testing/auth-l10n-test-results.md`

**Template:**

```markdown
# Auth Flow L10N Testing Results

**Test Date:** 2026-01-XX
**Tester:** [Name]
**Epic:** L10N Epic 2 - Sub-Epic 2A

## Summary

| Language | Login | Registration | Success | Complete | Overall |
|----------|-------|--------------|---------|----------|---------|
| English  | PASS  | PASS         | PASS    | PASS     | PASS    |
| French   | PASS  | PASS         | PASS    | PASS     | PASS    |
| Spanish  | PASS  | PASS         | PASS    | PASS     | PASS    |
| German   | PASS  | PASS         | PASS    | PASS     | PASS    |
| Dutch    | PASS  | PASS         | PASS    | PASS     | PASS    |
| Italian  | PASS  | PASS         | PASS    | PASS     | PASS    |

## Issues Found

### Issue 1: [Description]
- **Severity:** Low/Medium/High
- **Language(s):** [Affected languages]
- **Component:** [Component name]
- **Screenshot:** [Link/reference]
- **Fix Required:** [Description of fix]

## Missing Translations

| Key | Expected Location | Status |
|-----|-------------------|--------|
| None found | - | - |

## Visual Regression Issues

| Page | Issue | Languages Affected | Fix |
|------|-------|-------------------|-----|
| None found | - | - | - |

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
```

---

## Acceptance Criteria Verification

| Criterion | Test Task | Status |
|-----------|-----------|--------|
| All 6 languages tested for login page | Task 2 | Pending |
| All 6 languages tested for login form | Task 3 | Pending |
| All 6 languages tested for registration form | Task 4 | Pending |
| All 6 languages tested for OAuth button | Task 5 | Pending |
| All 6 languages tested for success page | Task 6 | Pending |
| All 6 languages tested for complete page | Task 7 | Pending |
| No layout breaks from text length differences | Task 8 | Pending |
| No console warnings for missing translations | Task 9 | Pending |
| Test results documented | Task 10 | Pending |

---

## Test Execution Checklist

### Pre-Test Requirements

- [ ] Tasks 2A.1-2A.9 completed (auth namespace and component updates)
- [ ] All 6 translation files have auth namespace populated
- [ ] Application builds successfully
- [ ] Development server running

### Test Execution

For each language (en, fr, es, de, nl, it):

- [ ] Set language preference cookie
- [ ] Test login page visual elements
- [ ] Test login form validation
- [ ] Test Google OAuth button
- [ ] Test registration page (if access code available)
- [ ] Test registration validation
- [ ] Test success page
- [ ] Test complete registration page
- [ ] Check console for missing translation warnings
- [ ] Take screenshots for documentation

### Post-Test Actions

- [ ] Document test results
- [ ] Create fix tasks for any issues found
- [ ] Update translation files if keys are missing
- [ ] Verify fixes with re-test

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2A.1: Create auth namespace | Required | Must be complete |
| Task 2A.2: Update LoginPageContent | Required | Must be complete |
| Task 2A.3: Update LoginForm | Required | Must be complete |
| Task 2A.4: Update RegistrationForm | Required | Must be complete |
| Task 2A.5: Update GoogleOAuthButton | Required | Must be complete |
| Task 2A.6: Update register page | Required | Must be complete |
| Task 2A.7: Update success page | Required | Must be complete |
| Task 2A.8: Update complete page | Required | Must be complete |
| Task 2A.9: Generate translations | Required | Must be complete |

---

## Optional: Automated E2E Tests

If time permits, create automated Playwright tests:

**File:** `tests/e2e/auth-l10n.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'];

for (const locale of locales) {
  test.describe(`Auth flows - ${locale}`, () => {
    test.beforeEach(async ({ context }) => {
      await context.addCookies([{
        name: 'FAQBNB_LANG',
        value: locale,
        domain: 'localhost',
        path: '/'
      }]);
    });

    test('login page displays correctly', async ({ page }) => {
      await page.goto('/login');

      // Verify no missing translation warnings
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await page.waitForLoadState('networkidle');

      // Check for visible content (should not show translation keys)
      const title = await page.locator('h2').first().textContent();
      expect(title).not.toContain('auth.login');
      expect(title).toBeTruthy();

      // No missing translation warnings
      const missingTranslations = consoleMessages.filter(
        msg => msg.includes('Missing translation')
      );
      expect(missingTranslations).toHaveLength(0);
    });

    test('login form validation errors display', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Should show validation errors in current locale
      const errorMessage = await page.locator('.text-red-600').first().textContent();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).not.toContain('errors.');
    });
  });
}
```

---

## References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2A
- [Request #323](/docs/gen_requests_epic2.md) - Internationalize LoginPageContent Component
- [i18n Configuration](/src/lib/i18n/config.ts) - Locale settings
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - i18n framework

---

*Document generated on 2026-01-18 for REQ-323: Test All Auth Flows in Each Language (Task 2A.10)*
