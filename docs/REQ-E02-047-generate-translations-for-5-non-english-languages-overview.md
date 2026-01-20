# Implementation Overview: REQ-E02-047 - Generate Translations for Authentication Namespace

**Document Created:** 2026-01-20 22:30:00 UTC
**Last Modified:** 2026-01-20 22:30:00 UTC

**Request ID:** REQ-E02-047
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.9
**Size:** M (Medium)
**Priority:** P1

---

## 1. Summary

Generate complete translation files for all authentication namespace strings in the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task follows the extraction of authentication strings from Tasks 2A.1-2A.8, which include LoginPageContent, LoginForm, RegistrationForm, GoogleOAuthButton, and all registration flow pages. The authentication namespace contains approximately 150+ unique strings that need accurate, contextually appropriate translations for login forms, registration flows, OAuth buttons, validation messages, and success/error states.

---

## 2. Current State Analysis

### 2.1 Source English Strings Location

The English source strings exist in `/messages/en.json` under the `auth` namespace, established by Task 2A.1 and expanded by Tasks 2A.2-2A.8. The namespace includes comprehensive coverage for all authentication UI components.

### 2.2 Existing Translation File Structure

| Language File | Path | Current State |
|---------------|------|---------------|
| English (source) | `/messages/en.json` | Contains comprehensive `auth` namespace with all extracted strings |
| French | `/messages/fr.json` | Has basic `auth` namespace (~20 keys), needs expansion to match en.json |
| Spanish | `/messages/es.json` | Needs `auth` namespace expansion to match en.json |
| German | `/messages/de.json` | Needs `auth` namespace expansion to match en.json |
| Dutch | `/messages/nl.json` | Needs `auth` namespace expansion to match en.json |
| Italian | `/messages/it.json` | Needs `auth` namespace expansion to match en.json |

### 2.3 Strings to Translate

Based on the auth namespace structure defined in REQ-E02-039, the following sub-namespaces require translation:

#### 2.3.1 Login Page Strings (`auth.login.*`) - ~15 strings
- Page titles and subtitles
- Form field labels and placeholders
- Button labels (Sign In, Sign In with Email)
- Helper text (divider text, access restricted)
- Navigation links (Back to Home, Clear Session)

#### 2.3.2 Registration Strings (`auth.register.*`) - ~15 strings
- Page titles and subtitles
- Form field labels (Full Name, Email, Password, Confirm Password)
- Placeholders and hints
- Submit button states (Create Account, Creating Account...)
- Helper text (account linked hint)

#### 2.3.3 Password Strength Strings (`auth.passwordStrength.*`) - ~12 strings
- Strength indicators (Very Weak, Weak, Fair, Good, Strong)
- Requirements labels
- Individual requirements (8 characters, lowercase, uppercase, number, special)

#### 2.3.4 Password Match Strings (`auth.passwordMatch.*`) - ~2 strings
- Match confirmation
- Mismatch warning

#### 2.3.5 Terms Strings (`auth.terms.*`) - ~4 strings
- Agreement text
- Terms of Service link text
- Privacy Policy link text

#### 2.3.6 OAuth Strings (`auth.oauth.*`) - ~10 strings
- Google button text
- Connection status messages
- Method selection UI
- Rate limiting messages with interpolation

#### 2.3.7 Access Code Strings (`auth.accessCode.*`) - ~7 strings
- Label and placeholder
- Verification messages
- Email hints
- Request access links

#### 2.3.8 Complete Registration Strings (`auth.complete.*`) - ~12 strings
- Page title and subtitle
- Status messages (signed in as, enter code hint)
- Button states (Complete Registration, Completing...)
- Success messages
- Navigation hints

#### 2.3.9 Success Page Strings (`auth.success.*`) - ~15 strings
- Page titles
- Auto-login messages
- OAuth vs standard success messages
- Setup complete items (4 items)
- Navigation buttons
- Auto-redirect messages

#### 2.3.10 Session Strings (`auth.session.*`) - ~6 strings
- Security notices
- Restricted area messages
- Registration protection notices

#### 2.3.11 Message Strings (`auth.messages.*`) - ~10 strings
- Login success message
- Status messages (completing, checking, validating)
- Account creation success
- Loading states

#### 2.3.12 Error Strings (`auth.errors.*`) - ~18 strings
- Authentication failures
- Invalid credentials
- Access denied
- OAuth errors with interpolation
- Registration link issues
- Already registered notices

#### 2.3.13 Validation Strings (`auth.validation.*`) - ~11 strings
- Required field errors
- Invalid format errors
- Password requirements
- Terms agreement requirement

#### 2.3.14 Logout Strings (`auth.logout.*`) - ~2 strings
- Button label
- Loading state

### 2.4 String Categories Summary

| Category | Estimated Count | Notes |
|----------|-----------------|-------|
| Page titles/subtitles | ~15 | Headers, subheaders |
| Form labels | ~12 | Field labels |
| Placeholders | ~8 | Input placeholders |
| Button labels | ~15 | Actions, loading states |
| Helper text/hints | ~15 | Descriptions, hints |
| Status messages | ~12 | Progress, success indicators |
| Error messages | ~18 | Various error states |
| Validation messages | ~11 | Form validation |
| Security notices | ~8 | Session, security text |
| Password indicators | ~12 | Strength, requirements |
| OAuth-specific | ~10 | Google sign-in flow |
| Navigation | ~6 | Links, redirects |
| **Total** | **~142** | Unique translation keys |

---

## 3. Technical Approach

### 3.1 Translation Strategy

1. **Semantic Accuracy**: Translations must convey the exact meaning and intent of the source English text
2. **Contextual Appropriateness**: Authentication terminology should be consistent and professional
3. **Formal vs. Informal**: Use formal address for authentication context:
   - French: "vous" (formal you)
   - German: "Sie" (formal you)
   - Spanish: "usted" (formal you)
   - Dutch: "u" (formal you)
   - Italian: "Lei" (formal you)
4. **Interpolation Preservation**: All `{variable}` placeholders must be preserved exactly in translations
5. **ICU Format Compliance**: Pluralization patterns must follow ICU MessageFormat specification
6. **Character Encoding**: Proper UTF-8 encoding for all non-ASCII characters

### 3.2 Translation Key Preservation

All translation keys must remain identical across language files. Only the values are translated:

```json
// English
"auth.login.title": "Sign in to your account"

// French
"auth.login.title": "Connectez-vous a votre compte"

// German
"auth.login.title": "Melden Sie sich bei Ihrem Konto an"
```

### 3.3 Variable Interpolation

Variables must be preserved exactly as they appear in source strings:

```json
// English
"auth.oauth.tooManyAttempts": "Too many authentication attempts. Please try again in {minutes} minutes."

// Spanish
"auth.oauth.tooManyAttempts": "Demasiados intentos de autenticacion. Por favor, intentelo de nuevo en {minutes} minutos."
```

### 3.4 Technical Terms Handling

Certain technical terms should be handled consistently per language:

| English Term | French | Spanish | German | Dutch | Italian |
|--------------|--------|---------|--------|-------|---------|
| Sign In | Se connecter | Iniciar sesion | Anmelden | Inloggen | Accedi |
| Sign Out | Se deconnecter | Cerrar sesion | Abmelden | Uitloggen | Esci |
| Password | Mot de passe | Contrasena | Passwort | Wachtwoord | Password |
| Email | E-mail | Correo electronico | E-Mail | E-mail | E-mail |
| Access Code | Code d'acces | Codigo de acceso | Zugangscode | Toegangscode | Codice di accesso |
| OAuth/Google | Google | Google | Google | Google | Google |

---

## 4. Implementation Tasks

### Task 1: Compile Complete English Source Strings
- Extract final `auth` namespace structure from `/messages/en.json`
- Verify all strings from Tasks 2A.1-2A.8 are present
- Create translation source document for reference
- Identify all interpolation variables

### Task 2: Generate French Translations
- Translate all `auth` namespace strings to French
- Use formal address ("vous")
- Verify all interpolation variables preserved
- Review for natural phrasing in authentication context

### Task 3: Generate Spanish Translations
- Translate all `auth` namespace strings to Spanish
- Use formal address ("usted")
- Verify all interpolation variables preserved
- Review for natural phrasing in authentication context

### Task 4: Generate German Translations
- Translate all `auth` namespace strings to German
- Use formal address ("Sie")
- Account for longer German text in UI
- Verify all interpolation variables preserved

### Task 5: Generate Dutch Translations
- Translate all `auth` namespace strings to Dutch
- Use formal address ("u")
- Verify all interpolation variables preserved
- Review for natural phrasing in authentication context

### Task 6: Generate Italian Translations
- Translate all `auth` namespace strings to Italian
- Use formal address ("Lei")
- Verify all interpolation variables preserved
- Review for natural phrasing in authentication context

### Task 7: Update Translation Files
- Replace/expand `auth` namespace in `/messages/fr.json`
- Replace/expand `auth` namespace in `/messages/es.json`
- Replace/expand `auth` namespace in `/messages/de.json`
- Replace/expand `auth` namespace in `/messages/nl.json`
- Replace/expand `auth` namespace in `/messages/it.json`

### Task 8: Verification and Quality Check
- Verify all keys match between English and translated files
- Verify no missing translations in any language
- Verify all interpolation variables preserved
- Verify character encoding correct (UTF-8)
- Run build to verify no translation errors

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/fr.json` | French translations | Replace/expand `auth` namespace |
| `/messages/es.json` | Spanish translations | Replace/expand `auth` namespace |
| `/messages/de.json` | German translations | Replace/expand `auth` namespace |
| `/messages/nl.json` | Dutch translations | Replace/expand `auth` namespace |
| `/messages/it.json` | Italian translations | Replace/expand `auth` namespace |

### 5.2 Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |

### 5.3 Files NOT to Modify

- `/messages/en.json` - English source should already be complete from Tasks 2A.1-2A.8
- `/src/app/login/**/*.tsx` - Login page components (already updated in prior tasks)
- `/src/app/register/**/*.tsx` - Registration components (already updated in prior tasks)
- `/src/components/LoginForm.tsx` - Already updated in prior tasks
- `/src/components/RegistrationForm.tsx` - Already updated in prior tasks
- `/src/components/GoogleOAuthButton.tsx` - Already updated in prior tasks
- Any TypeScript/JavaScript source files
- Database migrations
- API routes

---

## 6. Dependencies

### 6.1 Required Completions Before This Task

| Task | Status | Notes |
|------|--------|-------|
| 2A.1: Create auth namespace structure | Must be Complete | English namespace structure exists |
| 2A.2: Update LoginPageContent.tsx | Must be Complete | Login page strings extracted |
| 2A.3: Update LoginForm.tsx | Must be Complete | Form strings extracted |
| 2A.4: Update RegistrationForm.tsx | Must be Complete | Registration strings extracted |
| 2A.5: Update GoogleOAuthButton.tsx | Must be Complete | OAuth strings extracted |
| 2A.6: Update register/page.tsx | Must be Complete | Register page strings extracted |
| 2A.7: Update register/success/page.tsx | Must be Complete | Success page strings extracted |
| 2A.8: Update register/complete/page.tsx | Must be Complete | Complete page strings extracted |
| Epic 1: i18n Foundation | Must be Complete | Translation infrastructure operational |

### 6.2 Post-Completion Usage

After this task completes, the following components will display authentication UI in all 6 languages:
- LoginPageContent
- LoginForm
- RegistrationForm (including password strength indicator)
- GoogleOAuthButton
- Registration page
- Registration success page
- Registration complete page
- All authentication error messages
- All validation messages

---

## 7. Acceptance Criteria

### 7.1 Completeness
- [ ] Spanish (es) translation file contains all auth namespace strings with natural, contextually appropriate translations
- [ ] French (fr) translation file contains all auth namespace strings with natural, contextually appropriate translations
- [ ] German (de) translation file contains all auth namespace strings with natural, contextually appropriate translations
- [ ] Dutch (nl) translation file contains all auth namespace strings with natural, contextually appropriate translations
- [ ] Italian (it) translation file contains all auth namespace strings with natural, contextually appropriate translations

### 7.2 Quality
- [ ] All translations maintain semantic accuracy with the source English text
- [ ] Translations use formal/informal register appropriately for authentication context
- [ ] Technical terms (OAuth, email, password) are handled consistently with local conventions
- [ ] Password strength indicators convey appropriate meaning in each language
- [ ] Error messages convey equivalent severity and meaning across languages

### 7.3 Technical Correctness
- [ ] All translation files maintain the same JSON structure as the English source
- [ ] All interpolation variables (`{minutes}`, `{error}`, `{min}`, etc.) are preserved exactly
- [ ] Character encoding is correct for all accented characters and special symbols
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files follow the established message bundle structure and namespace hierarchy

### 7.4 Build Verification
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No missing translation key warnings in console
- [ ] Application loads without errors in all supported languages

---

## 8. Testing Checklist

### 8.1 Translation Verification Per Language

#### French (fr)
- [ ] Login page displays all content in French
- [ ] Registration form displays all labels and hints in French
- [ ] Password strength indicator shows French labels
- [ ] Error messages display in French
- [ ] Success messages display in French
- [ ] Google OAuth button shows French text

#### Spanish (es)
- [ ] Login page displays all content in Spanish
- [ ] Registration form displays all labels and hints in Spanish
- [ ] Password strength indicator shows Spanish labels
- [ ] Error messages display in Spanish
- [ ] Success messages display in Spanish
- [ ] Google OAuth button shows Spanish text

#### German (de)
- [ ] Login page displays all content in German
- [ ] Registration form displays all labels and hints in German
- [ ] Password strength indicator shows German labels
- [ ] Error messages display in German
- [ ] Success messages display in German
- [ ] Text does not overflow UI elements (German is typically longer)

#### Dutch (nl)
- [ ] Login page displays all content in Dutch
- [ ] Registration form displays all labels and hints in Dutch
- [ ] Password strength indicator shows Dutch labels
- [ ] Error messages display in Dutch
- [ ] Success messages display in Dutch

#### Italian (it)
- [ ] Login page displays all content in Italian
- [ ] Registration form displays all labels and hints in Italian
- [ ] Password strength indicator shows Italian labels
- [ ] Error messages display in Italian
- [ ] Success messages display in Italian

### 8.2 Interpolation Testing
- [ ] Rate limiting message shows correct minutes in all languages
- [ ] Error messages with `{error}` variable display correctly
- [ ] Password minimum characters `{min}` interpolates correctly

### 8.3 Visual Regression
- [ ] No text truncation in login buttons across languages
- [ ] No text overflow in form labels across languages
- [ ] Password strength indicator fits in all languages
- [ ] Security notice cards accommodate translated text

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Use formal authentication terminology, maintain glossary |
| Missing interpolation variables | Low | High | Automated check for `{variable}` patterns |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding, test special characters |
| Inconsistent terminology | Medium | Low | Create terminology glossary, review consistency |
| Build failures from malformed JSON | Low | High | Validate JSON syntax before committing |
| Text overflow in UI | Medium | Low | Test with German (longest text), adjust if needed |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Compile English source strings | 10 minutes |
| Generate French translations | 25 minutes |
| Generate Spanish translations | 25 minutes |
| Generate German translations | 30 minutes |
| Generate Dutch translations | 25 minutes |
| Generate Italian translations | 25 minutes |
| Update all translation files | 15 minutes |
| Verification and quality check | 25 minutes |
| **Total** | **~3 hours** |

---

## 11. Translation Reference

### 11.1 Key Authentication Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Sign In | Iniciar sesion | Se connecter | Anmelden | Inloggen | Accedi |
| Sign Out | Cerrar sesion | Se deconnecter | Abmelden | Uitloggen | Esci |
| Sign Up | Registrarse | S'inscrire | Registrieren | Registreren | Registrati |
| Email | Correo electronico | E-mail | E-Mail | E-mail | E-mail |
| Password | Contrasena | Mot de passe | Passwort | Wachtwoord | Password |
| Access Code | Codigo de acceso | Code d'acces | Zugangscode | Toegangscode | Codice di accesso |
| Create Account | Crear cuenta | Creer un compte | Konto erstellen | Account aanmaken | Crea account |
| Forgot Password | Olvide contrasena | Mot de passe oublie | Passwort vergessen | Wachtwoord vergeten | Password dimenticata |

### 11.2 Sample Full Translations

#### Login Page Title

**English:**
```json
"login": {
  "title": "Sign in to your account",
  "subtitle": "Access the FAQBNB administration panel"
}
```

**French:**
```json
"login": {
  "title": "Connectez-vous a votre compte",
  "subtitle": "Accedez au panneau d'administration FAQBNB"
}
```

**Spanish:**
```json
"login": {
  "title": "Inicie sesion en su cuenta",
  "subtitle": "Acceda al panel de administracion de FAQBNB"
}
```

**German:**
```json
"login": {
  "title": "Melden Sie sich bei Ihrem Konto an",
  "subtitle": "Zugriff auf das FAQBNB-Administrationspanel"
}
```

**Dutch:**
```json
"login": {
  "title": "Log in op uw account",
  "subtitle": "Toegang tot het FAQBNB-beheerpaneel"
}
```

**Italian:**
```json
"login": {
  "title": "Accedi al tuo account",
  "subtitle": "Accedi al pannello di amministrazione FAQBNB"
}
```

#### Password Strength Indicators

**English:**
```json
"passwordStrength": {
  "label": "Password strength:",
  "veryWeak": "Very Weak",
  "weak": "Weak",
  "fair": "Fair",
  "good": "Good",
  "strong": "Strong"
}
```

**French:**
```json
"passwordStrength": {
  "label": "Force du mot de passe :",
  "veryWeak": "Tres faible",
  "weak": "Faible",
  "fair": "Moyen",
  "good": "Bon",
  "strong": "Fort"
}
```

**Spanish:**
```json
"passwordStrength": {
  "label": "Fortaleza de la contrasena:",
  "veryWeak": "Muy debil",
  "weak": "Debil",
  "fair": "Regular",
  "good": "Buena",
  "strong": "Fuerte"
}
```

**German:**
```json
"passwordStrength": {
  "label": "Passwortsicherheit:",
  "veryWeak": "Sehr schwach",
  "weak": "Schwach",
  "fair": "Mittel",
  "good": "Gut",
  "strong": "Stark"
}
```

**Dutch:**
```json
"passwordStrength": {
  "label": "Wachtwoordsterkte:",
  "veryWeak": "Zeer zwak",
  "weak": "Zwak",
  "fair": "Matig",
  "good": "Goed",
  "strong": "Sterk"
}
```

**Italian:**
```json
"passwordStrength": {
  "label": "Sicurezza della password:",
  "veryWeak": "Molto debole",
  "weak": "Debole",
  "fair": "Discreta",
  "good": "Buona",
  "strong": "Forte"
}
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2A section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-047
- [REQ-E02-039: Create Auth Namespace Structure](/docs/REQ-E02-039-create-auth-namespace-structure-overview.md)
- [REQ-E02-040: Update LoginPageContent](/docs/REQ-E02-040-update-srcapploginloginpagecontenttsx-overview.md)
- [REQ-E02-041: Update LoginForm](/docs/REQ-E02-041-update-srccomponentsloginformtsx-overview.md)
- [REQ-E02-042: Update RegistrationForm](/docs/REQ-E02-042-update-srccomponentsregistrationformtsx-largest-overview.md)
- [REQ-E02-043: Update GoogleOAuthButton](/docs/REQ-E02-043-update-srccomponentsgoogleoauthbuttontsx-overview.md)
- [REQ-E02-044: Update register/page.tsx](/docs/REQ-E02-044-update-srcappregisterpagetsx-overview.md)
- [REQ-E02-045: Update register/success/page.tsx](/docs/REQ-E02-045-update-srcappregistersuccesspagetsx-overview.md)
- [REQ-E02-046: Update register/complete/page.tsx](/docs/REQ-E02-046-update-srcappregistercompletepagetsx-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2A - Authentication & Registration*
