# REQ-354: Generate Translations for Error Messages and Validation Strings in Five Non-English Languages

**Implementation Overview Document**

**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic2.md - REQ-354
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.7
**Type:** ENHANCEMENT
**Size:** M (Medium)

---

## 1. Executive Summary

This task generates accurate, professionally-worded translations for all error messages and form validation strings across the five non-English languages (French, Spanish, German, Dutch, Italian) to complete the localization of error handling and validation feedback in the FAQBNB application.

**Target Languages:**
| Code | Language | ISO Code |
|------|----------|----------|
| fr | French | fr-FR |
| es | Spanish | es-ES |
| de | German | de-DE |
| nl | Dutch | nl-NL |
| it | Italian | it-IT |

**Current State Analysis:**
The translation files contain a basic `errors` namespace with ~17 keys (required, invalidEmail, networkError, unauthorized, notFound, serverError, validationFailed, sessionExpired, tooManyRequests, invalidCredentials, emailTaken, passwordTooWeak, uploadFailed, fileTooLarge, invalidFileType, genericError). These have translations in all 5 languages.

**Task Scope:**
This task expands the `errors` namespace significantly with ~300 additional validation and error strings across multiple categories (form validation, API errors, network errors, permission errors, business logic errors), then generates translations for all non-English languages.

---

## 2. Current State Analysis

### 2.1 Existing Error Translations

The current `/messages/en.json` has a limited `errors` namespace:

```json
{
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address",
    "networkError": "Network error. Please try again.",
    "unauthorized": "You are not authorized to perform this action",
    "notFound": "The requested resource was not found",
    "serverError": "Server error. Please try again later.",
    "validationFailed": "Validation failed. Please check your input.",
    "sessionExpired": "Your session has expired. Please sign in again.",
    "tooManyRequests": "Too many requests. Please wait a moment.",
    "invalidCredentials": "Invalid email or password",
    "emailTaken": "This email is already registered",
    "passwordTooWeak": "Password must be at least 8 characters",
    "uploadFailed": "Upload failed. Please try again.",
    "fileTooLarge": "File is too large",
    "invalidFileType": "Invalid file type",
    "genericError": "Something went wrong. Please try again."
  }
}
```

### 2.2 Expanded Errors Namespace (Per Implementation Plan)

The implementation plan specifies a more comprehensive error namespace with ~300 strings:

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource"
    },
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
    },
    "boundary": {
      "title": "Something went wrong!",
      "description": "We apologize for the inconvenience. Our team has been notified of this error.",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again"
    },
    "reaction": {
      "updateFailed": "Failed to update reaction counts",
      "unavailable": "Reaction system temporarily unavailable",
      "dismiss": "Dismiss"
    }
  }
}
```

---

## 3. Technical Approach

### 3.1 Translation Generation Strategy

**Method:** AI-assisted translation using Claude or professional translation API
**Quality Control:** Native speaker review recommended for critical paths (auth, error boundaries)
**Consistency:** Use glossary terms established in `/docs/i18n/glossary.md`

### 3.2 Translation Quality Guidelines

| Aspect | Requirement |
|--------|-------------|
| Formality | Professional but approachable (use formal "vous" in French, "Sie" in German, etc.) |
| Technical Terms | Maintain consistency (e.g., "email" vs locale-specific term) |
| Error Tone | Helpful and non-accusatory |
| Action Buttons | Clear imperative form |
| Variable Interpolation | Preserve ICU format `{variableName}` |

### 3.3 Language-Specific Considerations

| Language | Considerations |
|----------|----------------|
| **French** | Use formal "vous", proper accents, gender agreement |
| **Spanish** | Use Latin American neutral Spanish (tuteo informal acceptable), proper accents |
| **German** | Formal "Sie", compound nouns, umlauts, longer text (plan for ~40% expansion) |
| **Dutch** | Use "u" for formal, "je" for informal context, double vowels |
| **Italian** | Formal "Lei", proper accents, concise phrasing |

### 3.4 Interpolation Handling

Error messages with variables must preserve the ICU format:

```json
// English
"password.tooShort": "Password must be at least {min} characters"

// French
"password.tooShort": "Le mot de passe doit contenir au moins {min} caracteres"

// German
"password.tooShort": "Das Passwort muss mindestens {min} Zeichen enthalten"
```

---

## 4. Task Breakdown

### Task 4.1: Expand English Source Translations
**File:** `/messages/en.json`
**Actions:**
- Reorganize `errors` namespace into subcategories (form, api, network, auth, item, property, file, boundary, reaction)
- Add all ~300 error and validation strings
- Ensure consistent key naming convention

### Task 4.2: Generate French Translations
**File:** `/messages/fr.json`
**Actions:**
- Translate all `errors` namespace strings to French
- Use formal register (vouvoiement)
- Verify ICU interpolation syntax preserved
- Review for proper French punctuation (spaces before colons, etc.)

### Task 4.3: Generate Spanish Translations
**File:** `/messages/es.json`
**Actions:**
- Translate all `errors` namespace strings to Spanish
- Use neutral Latin American Spanish
- Verify ICU interpolation syntax preserved
- Review accent marks and punctuation

### Task 4.4: Generate German Translations
**File:** `/messages/de.json`
**Actions:**
- Translate all `errors` namespace strings to German
- Use formal register (Sie-Form)
- Account for longer text (German typically 30-40% longer)
- Proper compound noun capitalization
- Verify umlauts and eszett rendering

### Task 4.5: Generate Dutch Translations
**File:** `/messages/nl.json`
**Actions:**
- Translate all `errors` namespace strings to Dutch
- Use appropriate formality level
- Verify ICU interpolation syntax preserved
- Review for Dutch-specific phrasing

### Task 4.6: Generate Italian Translations
**File:** `/messages/it.json`
**Actions:**
- Translate all `errors` namespace strings to Italian
- Use formal register (Lei)
- Verify ICU interpolation syntax preserved
- Review accent marks

### Task 4.7: Validate Translation Completeness
**Actions:**
- Run JSON schema validation on all files
- Verify identical key structure across all 6 language files
- Check for missing translations
- Validate ICU syntax in all interpolated strings

### Task 4.8: Visual QA Testing
**Actions:**
- Test error scenarios in each language
- Verify no text truncation or overflow
- Check layout in error boundaries
- Validate form validation messages display correctly

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File Path | Namespace/Areas | Changes |
|-----------|-----------------|---------|
| `/messages/en.json` | `errors.*` | Expand with full error namespace structure (~300 keys) |
| `/messages/fr.json` | `errors.*` | Add French translations for all error keys |
| `/messages/es.json` | `errors.*` | Add Spanish translations for all error keys |
| `/messages/de.json` | `errors.*` | Add German translations for all error keys |
| `/messages/nl.json` | `errors.*` | Add Dutch translations for all error keys |
| `/messages/it.json` | `errors.*` | Add Italian translations for all error keys |

### 5.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Full error namespace specification |
| `/src/lib/i18n/config.ts` | Supported locales configuration |
| `/src/components/LoginForm.tsx` | Example form validation patterns |
| `/src/app/error.tsx` | Error boundary message usage |
| `/src/app/global-error.tsx` | Global error boundary patterns |

### 5.3 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/docs/i18n/glossary.md` | (If not exists) Translation glossary for consistency |
| `/scripts/i18n-validate.ts` | (Optional) JSON validation script |

---

## 6. Translation Content Specification

### 6.1 Form Validation Errors (~100 strings)

**Key Categories:**
- Required field errors
- Email/URL format errors
- Password requirements
- Length constraints (min/max)
- Numeric range validation
- Custom format validation
- Business rule violations

**Sample Translations:**

| Key | English | French | Spanish | German | Dutch | Italian |
|-----|---------|--------|---------|--------|-------|---------|
| `form.required` | This field is required | Ce champ est requis | Este campo es obligatorio | Dieses Feld ist erforderlich | Dit veld is verplicht | Questo campo e obbligatorio |
| `form.email` | Please enter a valid email address | Veuillez entrer une adresse e-mail valide | Por favor, introduce una direccion de correo valida | Bitte geben Sie eine gultige E-Mail-Adresse ein | Voer een geldig e-mailadres in | Inserisci un indirizzo email valido |
| `form.password.tooShort` | Password must be at least {min} characters | Le mot de passe doit contenir au moins {min} caracteres | La contrasena debe tener al menos {min} caracteres | Das Passwort muss mindestens {min} Zeichen enthalten | Wachtwoord moet minimaal {min} tekens bevatten | La password deve contenere almeno {min} caratteri |

### 6.2 API Error Messages (~80 strings)

**Key Categories:**
- Authentication errors
- Authorization failures
- Resource not found
- Server errors
- Timeout errors
- Rate limiting

### 6.3 Network Error Messages (~30 strings)

**Key Categories:**
- Offline detection
- Connection failures
- Slow connection warnings
- Retry prompts

### 6.4 Business Logic Errors (~90 strings)

**Key Categories:**
- Item-related errors
- Property-related errors
- File upload errors
- Permission errors
- Duplicate resource errors

---

## 7. Dependencies

### 7.1 Upstream Dependencies

| Dependency | Status | Required |
|------------|--------|----------|
| Epic 1 Foundation (next-intl) | Complete | Yes |
| `errors` namespace structure defined | Complete (in plan) | Yes |
| Tasks 2J.1-2J.6 complete | In Progress | Partial |

### 7.2 Downstream Dependencies

| Component | Depends On This Task |
|-----------|---------------------|
| Error boundary translations (REQ-353) | Uses error keys |
| Form validation UI | Uses form.* keys |
| API error handling | Uses api.* keys |
| Zod schema messages | Uses form.* keys |

### 7.3 Related Tasks in Sub-Epic 2J

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2J.1 | Create errors namespace structure | Provides English source |
| 2J.2 | Audit form validation messages | Defines which strings needed |
| 2J.3 | Audit API error messages | Defines which strings needed |
| 2J.4 | Create centralized error utility | Consumer of translations |
| 2J.5 | Update Zod schemas | Consumer of translations |
| 2J.6 | Update error boundaries | Consumer of translations |

---

## 8. Acceptance Criteria

From REQ-354:

- [ ] The errors.validation namespace is fully translated into Spanish including required field messages, length constraints, format validations, and custom business rule violations
- [ ] The errors.validation namespace is fully translated into French with grammatically correct error descriptions and appropriate formality level
- [ ] The errors.validation namespace is fully translated into German with proper compound noun usage and error message structure conventions
- [ ] The errors.validation namespace is fully translated into Italian with culturally appropriate error message tone and technical terminology
- [ ] The errors.validation namespace is fully translated into Dutch with clear validation requirement descriptions and constraint explanations
- [ ] The errors.api namespace is translated into all five languages covering authentication errors, authorization failures, resource not found messages, server errors, and network issues
- [ ] The errors.form namespace is translated for all five languages including submission failures, timeout errors, and data persistence issues
- [ ] Generic error messages covering unexpected errors, boundary errors, and fallback scenarios are translated across all five target languages
- [ ] Required field error messages maintain consistency with field label translations defined elsewhere in the translation files
- [ ] String length constraint messages properly interpolate minimum and maximum values using each language's numeric formatting conventions
- [ ] All five language files have identical key structures in the errors namespace with no missing translations
- [ ] Translation content passes automated checks for proper JSON structure, escaped characters, and interpolation syntax
- [ ] Sample forms and error scenarios are tested in each language to verify error messages display correctly and make sense in context

---

## 9. Translation Glossary

To ensure consistency, establish standard translations for key terms:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| email | e-mail | correo electronico | E-Mail | e-mail | email |
| password | mot de passe | contrasena | Passwort | wachtwoord | password |
| required | requis | obligatorio | erforderlich | verplicht | obbligatorio |
| invalid | invalide | invalido | ungultig | ongeldig | non valido |
| error | erreur | error | Fehler | fout | errore |
| please | veuillez | por favor | bitte | alstublieft | per favore |
| try again | reessayer | intentar de nuevo | erneut versuchen | probeer opnieuw | riprova |
| server | serveur | servidor | Server | server | server |
| network | reseau | red | Netzwerk | netwerk | rete |
| session | session | sesion | Sitzung | sessie | sessione |
| upload | envoi | subir | hochladen | uploaden | caricamento |
| file | fichier | archivo | Datei | bestand | file |
| item | article | articulo | Artikel | item | articolo |
| property | propriete | propiedad | Immobilie | eigendom | proprieta |

---

## 10. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Native speaker review for critical paths |
| Inconsistent terminology | Medium | Low | Maintain glossary, use search/replace |
| ICU syntax broken in translation | Low | High | Validate with regex, test interpolation |
| Missing translations | Low | High | Automated key comparison script |
| Text overflow in UI | Medium | Low | Test in German (longest), adjust UI if needed |
| Cultural inappropriateness | Low | Medium | Research locale-specific phrasing norms |

---

## 11. Effort Estimate

| Task | Estimate |
|------|----------|
| Expand English source (~300 strings) | 2 hours |
| Generate French translations | 3 hours |
| Generate Spanish translations | 3 hours |
| Generate German translations | 3 hours |
| Generate Dutch translations | 3 hours |
| Generate Italian translations | 3 hours |
| Validate JSON structure | 1 hour |
| Test in application | 2 hours |
| **Total** | **~20 hours** |

**Note:** Estimates assume AI-assisted translation with manual review. Professional translation services would require different timeline.

---

## 12. Testing Strategy

### 12.1 Automated Validation

```bash
# Validate JSON structure
npm run i18n:validate

# Check for missing keys
npm run i18n:check-missing

# Validate ICU syntax
npm run i18n:validate-icu
```

### 12.2 Manual Testing Scenarios

| Scenario | Languages | Expected Result |
|----------|-----------|-----------------|
| Required field validation | All 6 | Localized "required" message |
| Invalid email format | All 6 | Localized email format error |
| Password too short | All 6 | Localized message with {min} interpolated |
| Server error | All 6 | Localized server error message |
| Session expired | All 6 | Localized session expiry message |
| File too large | All 6 | Localized message with {max} interpolated |
| Error boundary trigger | All 6 | Localized fallback UI |

### 12.3 Visual Regression

- Test longest strings (typically German)
- Verify button text fits
- Check modal/dialog sizing
- Validate toast notification rendering

---

## 13. Implementation Checklist

**Phase 1: English Source Expansion**
- [ ] Restructure errors namespace with subcategories
- [ ] Add all form validation strings
- [ ] Add all API error strings
- [ ] Add all network error strings
- [ ] Add all business logic error strings
- [ ] Verify ICU syntax for interpolated strings

**Phase 2: Translation Generation**
- [ ] Generate French translations
- [ ] Generate Spanish translations
- [ ] Generate German translations
- [ ] Generate Dutch translations
- [ ] Generate Italian translations

**Phase 3: Validation**
- [ ] Run JSON validation on all files
- [ ] Verify key parity across all languages
- [ ] Test ICU interpolation in each language
- [ ] Visual QA in application

**Phase 4: Documentation**
- [ ] Update glossary with new terms
- [ ] Document any cultural considerations noted
- [ ] Create translation review checklist

---

## 14. References

- [Request: docs/gen_requests_epic2.md - REQ-354](/docs/gen_requests_epic2.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Related: REQ-353 Error Boundaries Overview](/docs/REQ-353-update-error-boundaries-with-translations-overview.md)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
*Task 2J.7: Generate translations for 5 non-English languages*
