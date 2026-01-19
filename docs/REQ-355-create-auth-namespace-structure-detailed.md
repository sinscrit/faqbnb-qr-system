# REQ-355: Create Auth Namespace Structure in Translation Files - Detailed Task Breakdown

**Document Created:** 2026-01-19 08:45 UTC
**Last Modified:** 2026-01-19 08:45 UTC
**Request ID:** REQ-355
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.1
**Priority:** High (Third in recommended order after 2H Common and 2J Errors)
**Size:** S (Small)
**Overview Document:** [REQ-355-create-auth-namespace-structure-overview.md](./REQ-355-create-auth-namespace-structure-overview.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating a comprehensive `auth` namespace structure within all translation files (`/messages/*.json`). The expanded namespace will centralize approximately 150 authentication and registration-related text strings, enabling subsequent Sub-Epic 2A tasks to internationalize the authentication components.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are met:

- [x] Epic 1 Foundation complete (next-intl installed)
- [x] Translation files exist at `/messages/*.json` (en, fr, es, de, nl, it)
- [x] i18n configuration at `/src/lib/i18n/config.ts`
- [x] Basic auth namespace already present in translation files
- [x] `LogoutButton` component already using `useTranslations('auth')`

---

## Task Breakdown

### Task 1: Inventory and Extract Strings from Auth Components
**Estimated Points:** 1 SP
**Type:** Research/Preparation

#### 1.1 Extract Strings from LoginPageContent.tsx
**File:** `/src/app/login/LoginPageContent.tsx`

**Strings to extract (~18 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Sign in to your account"` | `auth.login.title` | Page heading |
| `"Access the FAQBNB administration panel"` | `auth.login.subtitle` | Page subtext |
| `"Admin Access"` | `auth.login.adminAccess` | Logo subtext |
| `"FAQBNB"` | (keep hardcoded - brand name) | Brand |
| `"Completing authentication..."` | `auth.login.loading.authenticating` | Loading state |
| `"Loading authentication..."` | `auth.login.loading.loading` | Loading state |
| `"Login successful! Redirecting..."` | `auth.login.messages.success` | Success message |
| `"Completing Google sign-in..."` | `auth.login.messages.completingGoogle` | OAuth message |
| `"Back to Home"` | `auth.login.backToHome` | Navigation link |
| `"Clear Session"` | `auth.login.clearSession` | Action button |
| `"© 2024 FAQBNB. All rights reserved."` | `auth.footer.copyright` | Footer (use ICU: `{year}`) |
| `"Secure Access"` | `auth.login.security.title` | Security notice title |
| `"This area is restricted to authorized administrators only. All access attempts are logged and monitored."` | `auth.login.security.description` | Security notice text |

#### 1.2 Extract Strings from LoginForm.tsx
**File:** `/src/components/LoginForm.tsx`

**Strings to extract (~20 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Authentication Failed"` | `auth.errors.authFailed` | Error title |
| `"Sign in with your account"` | `auth.login.signInWithAccount` | Section header |
| `"Or continue with email"` | `auth.login.orContinueWithEmail` | Divider text |
| `"Email Address"` | `auth.login.emailLabel` | Form label |
| `"admin@faqbnb.com"` | `auth.login.emailPlaceholder` | Placeholder |
| `"Email is required"` | `auth.validation.emailRequired` | Validation |
| `"Please enter a valid email address"` | `auth.validation.emailInvalid` | Validation |
| `"Password"` | `auth.login.passwordLabel` | Form label |
| `"Enter your password"` | `auth.login.passwordPlaceholder` | Placeholder |
| `"Password is required"` | `auth.validation.passwordRequired` | Validation |
| `"Password must be at least 6 characters"` | `auth.validation.passwordTooShort` | Validation |
| `"Remember me for 30 days"` | `auth.login.rememberMe` | Checkbox label |
| `"Sign In with Email"` | `auth.login.submitButton` | Button text |
| `"Signing In..."` | `auth.login.signingIn` | Loading state |
| `"Invalid email or password. Please check your credentials and try again."` | `auth.errors.invalidCredentials` | Error message |
| `"Access denied. Admin privileges are required."` | `auth.errors.accessDenied` | Error message |
| `"Login failed: No user returned"` | `auth.errors.loginFailed` | Error message |
| `"Access restricted to authorized administrators only"` | `auth.login.accessRestricted` | Helper text |

#### 1.3 Extract Strings from RegistrationForm.tsx
**File:** `/src/components/RegistrationForm.tsx`

**Strings to extract (~55 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Registration Failed"` | `auth.register.registrationFailed` | Error title |
| `"Access code:"` | `auth.register.accessCodeInfo` | Info text |
| `"Email Address"` | `auth.register.emailLabel` | Form label |
| `"email@example.com"` | `auth.register.emailPlaceholder` | Placeholder |
| `"This email is linked to your access code and cannot be changed."` | `auth.register.emailLinked` | Helper text |
| `"Full Name"` | `auth.register.fullNameLabel` | Form label |
| `"(optional)"` | `auth.register.fullNameOptional` | Label suffix |
| `"John Doe"` | `auth.register.fullNamePlaceholder` | Placeholder |
| `"Password"` | `auth.register.passwordLabel` | Form label |
| `"Create a strong password"` | `auth.register.passwordPlaceholder` | Placeholder |
| `"Confirm Password"` | `auth.register.confirmPasswordLabel` | Form label |
| `"Confirm your password"` | `auth.register.confirmPasswordPlaceholder` | Placeholder |
| `"Choose how to create your account"` | `auth.register.methodSelection.title` | Section title |
| `"Continue with Google"` | `auth.register.methodSelection.googleOption` | Option label |
| `"Quick sign-up using your Google account"` | `auth.register.methodSelection.googleDescription` | Option description |
| `"Sign up with email"` | `auth.register.methodSelection.emailOption` | Option label |
| `"Create a password for your account"` | `auth.register.methodSelection.emailDescription` | Option description |
| `"Enter your details below"` | `auth.register.methodSelection.enterDetails` | Divider text |
| `"Password strength:"` | `auth.register.passwordStrength.label` | Label |
| `"Enter password"` | `auth.register.passwordStrength.enterPassword` | Initial state |
| `"Very Weak"` | `auth.register.passwordStrength.veryWeak` | Strength level |
| `"Weak"` | `auth.register.passwordStrength.weak` | Strength level |
| `"Fair"` | `auth.register.passwordStrength.fair` | Strength level |
| `"Good"` | `auth.register.passwordStrength.good` | Strength level |
| `"Strong"` | `auth.register.passwordStrength.strong` | Strength level |
| `"Requirements:"` | `auth.register.passwordStrength.requirements` | Label |
| `"At least 8 characters"` | `auth.register.passwordStrength.minChars` | Requirement |
| `"One lowercase letter"` | `auth.register.passwordStrength.lowercase` | Requirement |
| `"One uppercase letter"` | `auth.register.passwordStrength.uppercase` | Requirement |
| `"One number"` | `auth.register.passwordStrength.number` | Requirement |
| `"One special character"` | `auth.register.passwordStrength.special` | Requirement |
| `"Passwords match"` | `auth.register.passwordMatch.match` | Status |
| `"Passwords do not match"` | `auth.register.passwordMatch.noMatch` | Status |
| `"I agree to the"` | `auth.register.terms.agreeText` | Terms checkbox |
| `"Terms of Service"` | `auth.register.terms.termsOfService` | Link text |
| `"and"` | `auth.register.terms.and` | Connector |
| `"Privacy Policy"` | `auth.register.terms.privacyPolicy` | Link text |
| `"Create Account"` | `auth.register.submitButton` | Button text |
| `"Creating Account..."` | `auth.register.creatingAccount` | Loading state |
| `"Your account will be linked to your verified access code"` | `auth.register.accountLinked` | Helper text |
| `"Connecting to Google..."` | `auth.oauth.connectingToGoogle` | Loading state |
| `"Email is required"` | `auth.validation.emailRequired` | Validation |
| `"Password is required"` | `auth.validation.passwordRequired` | Validation |
| `"Password must be at least 8 characters"` | `auth.validation.passwordMinLength` | Validation |
| `"Password must contain at least one lowercase letter"` | `auth.validation.passwordNeedsLowercase` | Validation |
| `"Password must contain at least one uppercase letter"` | `auth.validation.passwordNeedsUppercase` | Validation |
| `"Password must contain at least one number"` | `auth.validation.passwordNeedsNumber` | Validation |
| `"Please confirm your password"` | `auth.validation.confirmPasswordRequired` | Validation |
| `"Passwords do not match"` | `auth.validation.passwordsMismatch` | Validation |
| `"Name must be at least 2 characters"` | `auth.validation.nameTooShort` | Validation |
| `"You must agree to the terms and conditions"` | `auth.validation.termsRequired` | Validation |

#### 1.4 Extract Strings from GoogleOAuthButton.tsx
**File:** `/src/components/GoogleOAuthButton.tsx`

**Strings to extract (~3 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Continue with Google"` | `auth.oauth.continueWithGoogle` | Button text |
| `"Connecting to Google..."` | `auth.oauth.connectingToGoogle` | Loading state |
| `"Too many authentication attempts. Please try again in {minutes} minutes."` | `auth.oauth.rateLimitError` | Error (ICU format) |

#### 1.5 Extract Strings from Registration Success Page
**File:** `/src/app/register/success/page.tsx`

**Strings to extract (~18 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Registration Complete"` | `auth.success.registrationComplete` | Logo subtitle |
| `"Registration Successful!"` | `auth.success.title` | Heading |
| `"Logging you in automatically..."` | `auth.success.autoLoginInProgress` | Loading message |
| `"Automatic login failed. Please use the manual login button."` | `auth.success.autoLoginFailed` | Error message |
| `"Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly."` | `auth.success.accountCreatedOAuth` | OAuth success |
| `"Your account has been created successfully. You can now log in to access all FAQBNB features."` | `auth.success.canNowLogin` | Standard success |
| `"Account Setup Complete:"` | `auth.success.setupComplete` | Section title |
| `"User account created"` | `auth.success.setupItems.userCreated` | Checklist item |
| `"Default account established"` | `auth.success.setupItems.accountEstablished` | Checklist item |
| `"Admin privileges configured"` | `auth.success.setupItems.adminConfigured` | Checklist item |
| `"Access code validated"` | `auth.success.setupItems.accessValidated` | Checklist item |
| `"Go to Dashboard"` | `auth.success.goToDashboard` | Button text |
| `"Continue to Login"` | `auth.success.continueToLogin` | Button text |
| `"Back to Home"` | `common.actions.backToHome` | Link text (use common) |
| `"You will be automatically redirected to the dashboard in 2 seconds."` | `auth.success.redirectToDashboard` | Info text |
| `"You will be automatically redirected to the login page in 5 seconds."` | `auth.success.redirectToLogin` | Info text |

#### 1.6 Extract Strings from Registration Complete Page
**File:** `/src/app/register/complete/page.tsx`

**Strings to extract (~18 unique strings):**
| String | Proposed Key | Context |
|--------|--------------|---------|
| `"Complete Registration"` | `auth.complete.title` | Logo subtitle |
| `"Almost there!"` | `auth.complete.almostThere` | Heading |
| `"Your Google sign-in was successful, but we need an access code to complete your registration."` | `auth.complete.needAccessCode` | Subtext |
| `"Signed in as:"` | `auth.complete.signedInAs` | Info label |
| `"Enter your access code to complete account setup."` | `auth.complete.enterAccessCode` | Helper text |
| `"Access Code"` | `auth.accessCode.label` | Form label |
| `"Enter your access code"` | `auth.accessCode.placeholder` | Placeholder |
| `"Check your email for the access code from your invitation."` | `auth.complete.checkEmail` | Helper text |
| `"Complete Registration"` | `auth.complete.completeButton` | Button text |
| `"Completing Registration..."` | `auth.complete.completingRegistration` | Loading state |
| `"Registration Complete!"` | `auth.complete.registrationComplete` | Success heading |
| `"Your account has been set up successfully."` | `auth.complete.accountSetup` | Success message |
| `"Redirecting to dashboard..."` | `auth.complete.redirectingToDashboard` | Info text |
| `"Wrong account? Sign out and try again."` | `auth.complete.wrongAccount` | Helper text |
| `"Sign Out"` | `auth.logout.button` | Button text |
| `"Request Access Code"` | `auth.complete.requestAccessCode` | Link text |
| `"Loading..."` | `auth.complete.loading` | Loading state |
| `"Checking authentication..."` | `auth.complete.checkingAuth` | Loading state |
| `"No valid session found. Please try logging in again."` | `auth.validation.noSessionFound` | Error message |

#### 1.7 Verify Existing Keys in LogoutButton
**File:** `/src/components/LogoutButton.tsx`

**Existing keys (MUST preserve at current paths):**
| Current Key | String | Status |
|-------------|--------|--------|
| `auth.confirmLogout` | "Confirm Logout" | ✅ Keep |
| `auth.confirmSignOutMessage` | "Are you sure you want to sign out?" | ✅ Keep |
| `auth.signOut` | "Sign Out" | ✅ Keep |

**Acceptance Criteria for Task 1:**
- [ ] All strings from 6 auth components inventoried
- [ ] Proposed translation keys documented with clear naming convention
- [ ] Existing keys identified for backward compatibility
- [ ] String count verified (~150 total)

---

### Task 2: Create Comprehensive Auth Namespace Structure in English
**Estimated Points:** 1 SP
**Type:** Implementation

#### 2.1 Update `/messages/en.json` with Complete Auth Namespace

**File:** `/messages/en.json`

**Action:** Replace the existing basic `auth` namespace with the comprehensive structure below.

**CRITICAL:** Preserve backward compatibility with existing keys:
- `auth.signIn`
- `auth.signOut`
- `auth.confirmLogout`
- `auth.confirmSignOutMessage`
- All other existing top-level keys

**Complete Auth Namespace Structure:**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "createAccount": "Create Account",
    "verifyEmail": "Verify Email",
    "resendVerification": "Resend Verification",
    "welcomeBack": "Welcome back",
    "loggedInAs": "Logged in as",
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "adminAccess": "Admin Access",
      "emailLabel": "Email Address",
      "emailPlaceholder": "admin@faqbnb.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "rememberMe": "Remember me for 30 days",
      "submitButton": "Sign In with Email",
      "signingIn": "Signing In...",
      "signInWithAccount": "Sign in with your account",
      "orContinueWithEmail": "Or continue with email",
      "accessRestricted": "Access restricted to authorized administrators only",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "loading": {
        "authenticating": "Completing authentication...",
        "loading": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      },
      "security": {
        "title": "Secure Access",
        "description": "This area is restricted to authorized administrators only. All access attempts are logged and monitored."
      }
    },
    "register": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "loadingPage": "Loading registration page...",
      "accessCodeInfo": "Access code:",
      "emailLabel": "Email Address",
      "emailPlaceholder": "email@example.com",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "John Doe",
      "fullNameOptional": "(optional)",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "terms": {
        "agreeText": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
      },
      "submitButton": "Create Account",
      "creatingAccount": "Creating Account...",
      "accountLinked": "Your account will be linked to your verified access code",
      "registrationFailed": "Registration Failed",
      "methodSelection": {
        "title": "Choose how to create your account",
        "googleOption": "Continue with Google",
        "googleDescription": "Quick sign-up using your Google account",
        "emailOption": "Sign up with email",
        "emailDescription": "Create a password for your account",
        "enterDetails": "Enter your details below"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "enterPassword": "Enter password",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least 8 characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      }
    },
    "oauth": {
      "continueWithGoogle": "Continue with Google",
      "connectingToGoogle": "Connecting to Google...",
      "rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
    },
    "logout": {
      "button": "Sign Out",
      "confirmTitle": "Confirm Logout",
      "confirmMessage": "Are you sure you want to sign out?",
      "signingOut": "Signing out..."
    },
    "success": {
      "title": "Registration Successful!",
      "registrationComplete": "Registration Complete",
      "accountCreated": "Your account has been created successfully.",
      "accountCreatedOAuth": "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly.",
      "canNowLogin": "You can now log in to access all FAQBNB features.",
      "autoLoginInProgress": "Logging you in automatically...",
      "autoLoginFailed": "Automatic login failed. Please use the manual login button.",
      "setupComplete": "Account Setup Complete:",
      "setupItems": {
        "userCreated": "User account created",
        "accountEstablished": "Default account established",
        "adminConfigured": "Admin privileges configured",
        "accessValidated": "Access code validated"
      },
      "goToDashboard": "Go to Dashboard",
      "continueToLogin": "Continue to Login",
      "redirectToDashboard": "You will be automatically redirected to the dashboard in 2 seconds.",
      "redirectToLogin": "You will be automatically redirected to the login page in 5 seconds."
    },
    "complete": {
      "title": "Complete Registration",
      "almostThere": "Almost there!",
      "needAccessCode": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "signedInAs": "Signed in as:",
      "enterAccessCode": "Enter your access code to complete account setup.",
      "accessCodeLabel": "Access Code",
      "accessCodePlaceholder": "Enter your access code",
      "checkEmail": "Check your email for the access code from your invitation.",
      "completeButton": "Complete Registration",
      "completingRegistration": "Completing Registration...",
      "registrationComplete": "Registration Complete!",
      "accountSetup": "Your account has been set up successfully.",
      "redirectingToDashboard": "Redirecting to dashboard...",
      "wrongAccount": "Wrong account? Sign out and try again.",
      "requestAccessCode": "Request Access Code",
      "loading": "Loading...",
      "checkingAuth": "Checking authentication..."
    },
    "validation": {
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 6 characters",
      "passwordMinLength": "Password must be at least 8 characters",
      "passwordNeedsLowercase": "Password must contain at least one lowercase letter",
      "passwordNeedsUppercase": "Password must contain at least one uppercase letter",
      "passwordNeedsNumber": "Password must contain at least one number",
      "confirmPasswordRequired": "Please confirm your password",
      "passwordsMismatch": "Passwords do not match",
      "nameTooShort": "Name must be at least 2 characters",
      "termsRequired": "You must agree to the terms and conditions",
      "noSessionFound": "No valid session found. Please try logging in again."
    },
    "errors": {
      "authFailed": "Authentication Failed",
      "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
      "accessDenied": "Access denied. Admin privileges are required.",
      "loginFailed": "Login failed: No user returned",
      "registrationFailed": "Registration failed. Please try again.",
      "unexpectedError": "An unexpected error occurred",
      "unexpectedRegistrationError": "An unexpected error occurred during registration"
    },
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "validating": "Validating access code...",
      "invalid": "Invalid access code",
      "expired": "Access code has expired",
      "validationFailed": "Access code validation failed:"
    },
    "footer": {
      "copyright": "© {year} FAQBNB. All rights reserved."
    }
  }
}
```

**Acceptance Criteria for Task 2:**
- [ ] English translation file updated with complete auth namespace
- [ ] All ~150 keys present in proper hierarchical structure
- [ ] Backward compatible keys preserved at original paths
- [ ] JSON validates without syntax errors
- [ ] ICU format used for dynamic values (`{year}`, `{minutes}`)

---

### Task 3: Create French Translations
**Estimated Points:** 0.5 SP
**Type:** Translation

#### 3.1 Update `/messages/fr.json` with French Auth Namespace

**File:** `/messages/fr.json`

**Action:** Add the complete `auth` namespace with French translations. Maintain identical key structure to English.

**Key Translation Guidelines:**
- Use formal "vous" form for all user-facing text
- Maintain technical accuracy for authentication terminology
- Preserve ICU format placeholders (`{year}`, `{minutes}`)

**Sample Translations (first-level categories):**

```json
{
  "auth": {
    "signIn": "Se connecter",
    "signOut": "Se déconnecter",
    "confirmLogout": "Confirmer la déconnexion",
    "confirmSignOutMessage": "Êtes-vous sûr de vouloir vous déconnecter ?",
    "signUp": "S'inscrire",
    "email": "E-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié ?",
    "resetPassword": "Réinitialiser le mot de passe",
    "continueWithGoogle": "Continuer avec Google",
    "rememberMe": "Se souvenir de moi",
    "noAccount": "Vous n'avez pas de compte ?",
    "hasAccount": "Vous avez déjà un compte ?",
    "createAccount": "Créer un compte",
    "verifyEmail": "Vérifier l'e-mail",
    "resendVerification": "Renvoyer la vérification",
    "welcomeBack": "Bon retour",
    "loggedInAs": "Connecté en tant que",
    "login": {
      "title": "Connectez-vous à votre compte",
      "subtitle": "Accédez au panneau d'administration FAQBNB",
      "adminAccess": "Accès administrateur",
      "emailLabel": "Adresse e-mail",
      "emailPlaceholder": "admin@faqbnb.com",
      "passwordLabel": "Mot de passe",
      "passwordPlaceholder": "Entrez votre mot de passe",
      "rememberMe": "Se souvenir de moi pendant 30 jours",
      "submitButton": "Se connecter avec l'e-mail",
      "signingIn": "Connexion en cours...",
      "signInWithAccount": "Connectez-vous avec votre compte",
      "orContinueWithEmail": "Ou continuez avec l'e-mail",
      "accessRestricted": "Accès réservé aux administrateurs autorisés uniquement",
      "backToHome": "Retour à l'accueil",
      "clearSession": "Effacer la session",
      "loading": {
        "authenticating": "Authentification en cours...",
        "loading": "Chargement de l'authentification..."
      },
      "messages": {
        "success": "Connexion réussie ! Redirection...",
        "completingGoogle": "Finalisation de la connexion Google..."
      },
      "security": {
        "title": "Accès sécurisé",
        "description": "Cette zone est réservée aux administrateurs autorisés uniquement. Toutes les tentatives d'accès sont enregistrées et surveillées."
      }
    }
  }
}
```

**Acceptance Criteria for Task 3:**
- [ ] French translation file updated with complete auth namespace
- [ ] Key structure identical to English file
- [ ] All text professionally translated
- [ ] JSON validates without syntax errors

---

### Task 4: Create Spanish Translations
**Estimated Points:** 0.5 SP
**Type:** Translation

#### 4.1 Update `/messages/es.json` with Spanish Auth Namespace

**File:** `/messages/es.json`

**Action:** Add the complete `auth` namespace with Spanish translations. Maintain identical key structure to English.

**Key Translation Guidelines:**
- Use formal "usted" form for all user-facing text
- Follow Latin American Spanish conventions
- Preserve ICU format placeholders

**Acceptance Criteria for Task 4:**
- [ ] Spanish translation file updated with complete auth namespace
- [ ] Key structure identical to English file
- [ ] All text professionally translated
- [ ] JSON validates without syntax errors

---

### Task 5: Create German Translations
**Estimated Points:** 0.5 SP
**Type:** Translation

#### 5.1 Update `/messages/de.json` with German Auth Namespace

**File:** `/messages/de.json`

**Action:** Add the complete `auth` namespace with German translations. Maintain identical key structure to English.

**Key Translation Guidelines:**
- Use formal "Sie" form for all user-facing text
- Follow standard German capitalization for nouns
- Preserve ICU format placeholders

**Acceptance Criteria for Task 5:**
- [ ] German translation file updated with complete auth namespace
- [ ] Key structure identical to English file
- [ ] All text professionally translated
- [ ] JSON validates without syntax errors

---

### Task 6: Create Dutch Translations
**Estimated Points:** 0.5 SP
**Type:** Translation

#### 6.1 Update `/messages/nl.json` with Dutch Auth Namespace

**File:** `/messages/nl.json`

**Action:** Add the complete `auth` namespace with Dutch translations. Maintain identical key structure to English.

**Key Translation Guidelines:**
- Use formal "u" form for all user-facing text
- Preserve ICU format placeholders

**Acceptance Criteria for Task 6:**
- [ ] Dutch translation file updated with complete auth namespace
- [ ] Key structure identical to English file
- [ ] All text professionally translated
- [ ] JSON validates without syntax errors

---

### Task 7: Create Italian Translations
**Estimated Points:** 0.5 SP
**Type:** Translation

#### 7.1 Update `/messages/it.json` with Italian Auth Namespace

**File:** `/messages/it.json`

**Action:** Add the complete `auth` namespace with Italian translations. Maintain identical key structure to English.

**Key Translation Guidelines:**
- Use formal "Lei" form for all user-facing text
- Preserve ICU format placeholders

**Acceptance Criteria for Task 7:**
- [ ] Italian translation file updated with complete auth namespace
- [ ] Key structure identical to English file
- [ ] All text professionally translated
- [ ] JSON validates without syntax errors

---

### Task 8: Validation and Testing
**Estimated Points:** 0.5 SP
**Type:** QA/Verification

#### 8.1 JSON Structure Validation
- [ ] Verify all 6 language files parse as valid JSON
- [ ] Confirm identical key structure across all files
- [ ] Check no keys are missing in any language file

**Validation Command:**
```bash
# Validate JSON syntax
npx json5 --validate messages/en.json
npx json5 --validate messages/fr.json
npx json5 --validate messages/es.json
npx json5 --validate messages/de.json
npx json5 --validate messages/nl.json
npx json5 --validate messages/it.json
```

#### 8.2 Build Verification
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors related to translations
- [ ] LogoutButton component continues to work (uses existing keys)

#### 8.3 Key Structure Comparison Script
Create a quick validation:
```bash
# Compare key counts between files
echo "English keys:" && grep -o '"[^"]*":' messages/en.json | wc -l
echo "French keys:" && grep -o '"[^"]*":' messages/fr.json | wc -l
# ... repeat for all languages
```

**Acceptance Criteria for Task 8:**
- [ ] All JSON files valid
- [ ] Build passes successfully
- [ ] Key count matches across all language files
- [ ] Existing LogoutButton functionality preserved

---

## Files to Modify Summary

| File Path | Action | Estimated Keys |
|-----------|--------|----------------|
| `/messages/en.json` | EXPAND auth namespace | ~150 |
| `/messages/fr.json` | ADD complete auth namespace | ~150 |
| `/messages/es.json` | ADD complete auth namespace | ~150 |
| `/messages/de.json` | ADD complete auth namespace | ~150 |
| `/messages/nl.json` | ADD complete auth namespace | ~150 |
| `/messages/it.json` | ADD complete auth namespace | ~150 |

**Total Translation Entries:** ~900 (150 keys × 6 languages)

---

## Implementation Order

Execute tasks in this sequence:

1. **Task 1:** Inventory strings (prerequisite research)
2. **Task 2:** Create English namespace (source of truth)
3. **Tasks 3-7:** Create translations (can be parallelized)
4. **Task 8:** Validation and testing

---

## Key Naming Convention

Following the established pattern from the implementation plan:

```
auth.{category}.{element}.{variant?}
```

**Categories:**
| Category | Purpose |
|----------|---------|
| `login` | Login page and form strings |
| `register` | Registration page and form strings |
| `oauth` | OAuth/Google authentication strings |
| `logout` | Logout confirmation strings |
| `success` | Registration success page strings |
| `complete` | Complete registration page strings |
| `validation` | Form validation messages |
| `errors` | Error messages specific to auth |
| `accessCode` | Access code input strings |
| `footer` | Footer/copyright strings |

---

## Downstream Dependencies

This task enables the following Sub-Epic 2A tasks:

| Task ID | Description | Depends On |
|---------|-------------|------------|
| 2A.2 | Update `LoginPageContent.tsx` | This task (auth keys) |
| 2A.3 | Update `LoginForm.tsx` | This task (auth keys) |
| 2A.4 | Update `RegistrationForm.tsx` | This task (auth keys) |
| 2A.5 | Update `GoogleOAuthButton.tsx` | This task (auth keys) |
| 2A.6 | Update register page | This task (auth keys) |
| 2A.7 | Update registration success page | This task (auth keys) |
| 2A.8 | Update registration complete page | This task (auth keys) |
| 2A.10 | Test all auth flows | All component updates |

---

## Acceptance Criteria Summary

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Auth namespace includes all form labels | Manual review |
| 2 | Auth namespace contains button labels | Manual review |
| 3 | Auth namespace includes help text/instructions | Manual review |
| 4 | Auth namespace contains OAuth provider labels | Manual review |
| 5 | Auth namespace includes error messages | Manual review |
| 6 | Auth namespace contains success messages | Manual review |
| 7 | Auth namespace includes page titles/headings | Manual review |
| 8 | Structure consistent across all 6 language files | Script validation |
| 9 | All keys use clear, descriptive names | Code review |
| 10 | English version serves as source of truth | Process |
| 11 | Backward compatible with existing LogoutButton | Build + manual test |
| 12 | No JSON syntax errors | JSON validation |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing strings discovered later | Can add to namespace incrementally in subsequent tasks |
| Key name conflicts | Preserve all existing keys at same paths |
| JSON syntax errors | Validate after each file modification |
| Translation quality issues | Review critical auth text for accuracy |
| Build failures | Run `npm run build` after changes |

---

## References

- **Overview Document:** `/docs/REQ-355-create-auth-namespace-structure-overview.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-355
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
