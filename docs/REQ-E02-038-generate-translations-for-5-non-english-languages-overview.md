# Implementation Overview: REQ-E02-038 - Generate Translations for Error Messages Namespace

**Document Created:** 2026-01-20 17:15:00 UTC
**Last Modified:** 2026-01-20 17:15:00 UTC

**Request ID:** REQ-E02-038
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.7
**Size:** M (Medium)
**Priority:** P1 - High (Cross-cutting concern)

---

## 1. Summary

Generate complete translations for all error message strings in the `errors` namespace across all five supported non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This task follows the creation and expansion of the errors namespace structure in Task 2J.1 and the component updates in Tasks 2J.2-2J.6, completing the internationalization of validation and error handling content throughout the application.

The `errors` namespace contains approximately 50-60 unique strings covering form validation, API errors, network issues, authentication failures, item/property errors, file handling, and system messages. High-quality translations here ensure users receive clear, comprehensible error feedback in their native language at critical moments when clarity is most needed.

**Note:** The request document mentions Portuguese, but per `/src/lib/i18n/config.ts`, the supported languages are: en, fr, es, de, nl (Dutch), it. This document follows the actual codebase configuration.

---

## 2. Current State Analysis

### 2.1 Source English Strings Location

The English source strings exist in `/messages/en.json` under the `errors` namespace. The current flat structure contains ~17 basic error keys:

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

### 2.2 Target Namespace Structure (from Task 2J.1)

Per REQ-E02-032, the errors namespace should be expanded to a categorized structure:

```json
{
  "errors": {
    "form": { ... },       // ~15 form validation messages
    "api": { ... },        // ~8 API error messages
    "network": { ... },    // ~3 network error messages
    "auth": { ... },       // ~8 authentication error messages
    "item": { ... },       // ~5 item-related error messages
    "property": { ... },   // ~4 property-related error messages
    "file": { ... },       // ~4 file upload error messages
    "system": { ... }      // ~3 system error messages
  }
}
```

### 2.3 Existing Translation File Status

| Language File | Path | Current State |
|---------------|------|---------------|
| English (source) | `/messages/en.json` | Flat `errors` namespace with ~17 keys |
| French | `/messages/fr.json` | Has basic flat `errors` namespace; needs expansion |
| Spanish | `/messages/es.json` | Has basic flat `errors` namespace; needs expansion |
| German | `/messages/de.json` | Has basic flat `errors` namespace; needs expansion |
| Dutch | `/messages/nl.json` | Has basic flat `errors` namespace; needs expansion |
| Italian | `/messages/it.json` | Has basic flat `errors` namespace; needs expansion |

### 2.4 Supported Languages Configuration

Per `/src/lib/i18n/config.ts`:

| Code | English Name | Native Name | Flag |
|------|--------------|-------------|------|
| en | English | English | GB |
| fr | French | Francais | FR |
| es | Spanish | Espanol | ES |
| de | German | Deutsch | DE |
| nl | Dutch | Nederlands | NL |
| it | Italian | Italiano | IT |

### 2.5 Strings to Translate by Category

Based on the target structure from Task 2J.1 (REQ-E02-032):

#### 2.5.1 Form Validation Errors (~15 strings)
- Required field validation
- Email format validation
- Password validation (required, tooShort, tooWeak, mismatch)
- Length constraints (maxLength, minLength with interpolation)
- Format validation (invalidFormat, invalidUrl, invalidPhone)
- Pattern matching and uniqueness

#### 2.5.2 API Error Messages (~8 strings)
- Generic error fallback
- HTTP status translations (notFound, unauthorized, forbidden, conflict)
- Server errors
- Timeout errors
- Bad request errors

#### 2.5.3 Network Error Messages (~3 strings)
- Offline status detection
- Connection failure
- Slow connection warning

#### 2.5.4 Authentication Errors (~8 strings)
- Invalid credentials
- Email verification required
- Session expiration
- Account locked
- Access denied
- Email already taken
- OAuth failures

#### 2.5.5 Item-Related Errors (~5 strings)
- Item not found
- Create/update/delete failures
- Duplicate name detection

#### 2.5.6 Property-Related Errors (~4 strings)
- Property not found
- Create/update/delete failures

#### 2.5.7 File Upload Errors (~4 strings)
- File too large (with size interpolation)
- Invalid file type (with types interpolation)
- Upload failure
- File count exceeded

#### 2.5.8 System Errors (~3 strings)
- Unexpected error
- Maintenance mode
- Rate limiting

### 2.6 Strings Summary

| Category | Estimated Count | ICU Variables |
|----------|-----------------|---------------|
| Form validation | ~15 | {min}, {max} |
| API errors | ~8 | None |
| Network errors | ~3 | None |
| Authentication | ~8 | None |
| Item errors | ~5 | None |
| Property errors | ~4 | None |
| File errors | ~4 | {max}, {types} |
| System errors | ~3 | None |
| **Total** | **~50** | |

**Total translations to generate:** ~50 strings x 5 languages = **~250 translation entries**

---

## 3. Technical Approach

### 3.1 Translation Strategy

1. **Semantic Accuracy**: Translations must convey the exact meaning and intent of the source English text
2. **Contextual Appropriateness**: Error messages should maintain appropriate urgency and clarity
3. **Tone Consistency**: Error messages should be helpful without being alarmist or condescending
4. **Formal vs. Informal Address**:
   - French: Use formal "vous" for user-facing messages
   - German: Use formal "Sie" consistently
   - Spanish: Use formal "usted" for professional context
   - Dutch: Use formal "u" for professional context
   - Italian: Use formal "Lei" for professional context
5. **Interpolation Preservation**: All `{variable}` placeholders must be preserved exactly
6. **Character Encoding**: Proper UTF-8 encoding for accented characters

### 3.2 Translation Key Preservation

All translation keys must remain identical across language files. Only the values are translated:

```json
// English
"errors.form.required": "This field is required"

// French
"errors.form.required": "Ce champ est requis"

// German
"errors.form.required": "Dieses Feld ist erforderlich"
```

### 3.3 ICU Message Format Patterns

Error messages with variable interpolation must preserve ICU format:

```json
// English
"errors.form.password.tooShort": "Password must be at least {min} characters"

// French
"errors.form.password.tooShort": "Le mot de passe doit contenir au moins {min} caracteres"

// German
"errors.form.password.tooShort": "Das Passwort muss mindestens {min} Zeichen enthalten"

// Spanish
"errors.form.password.tooShort": "La contrasena debe tener al menos {min} caracteres"
```

### 3.4 Error Message Tone Guidelines

| Message Type | Tone Guideline | Example Approach |
|--------------|----------------|------------------|
| Form validation | Direct, instructive | "Please enter a valid email address" |
| API errors | Reassuring, suggests retry | "Something went wrong. Please try again." |
| Network errors | Informative, action-oriented | "You appear to be offline. Please check your connection." |
| Auth errors | Clear, security-conscious | "Your session has expired. Please sign in again." |
| File errors | Specific, includes constraints | "File size exceeds {max} limit" |
| System errors | Calm, suggests patience | "System is under maintenance. Please try again later." |

### 3.5 Language-Specific Considerations

#### French (fr)
- Use proper accents: e (acute), e (grave), a, c, etc.
- Professional tone with "vous" form
- Error messages often longer than English

#### Spanish (es)
- Use proper accents: a, e, i, o, u, n
- Use opening inverted punctuation: ?question?, !exclamation!
- Formal "usted" register

#### German (de)
- Use proper umlauts: a, o, u, and eszett (ss)
- Capitalize nouns
- Often significantly longer than English (plan for text expansion)
- Formal "Sie" register

#### Dutch (nl)
- Similar to English in length
- Formal "u" register
- Some unique characters (e.g., ij)

#### Italian (it)
- Use proper accents: a, e, i, o, u
- Professional tone with "Lei" form
- Similar length to English

---

## 4. Implementation Tasks

### Task 1: Verify English Source Structure
- Confirm Task 2J.1 completion (errors namespace expanded with categories)
- Extract complete `errors` namespace structure from `/messages/en.json`
- Document all ICU interpolation variables
- Create translation source reference document

### Task 2: Generate French Translations
- Translate all `errors` namespace strings to French
- Use formal address ("vous")
- Verify variable interpolation preserved
- Ensure proper accent encoding (e, a, c, etc.)

### Task 3: Generate Spanish Translations
- Translate all `errors` namespace strings to Spanish
- Use formal address ("usted")
- Verify variable interpolation preserved
- Ensure proper accent and punctuation encoding

### Task 4: Generate German Translations
- Translate all `errors` namespace strings to German
- Use formal address ("Sie")
- Verify variable interpolation preserved
- Ensure proper umlaut encoding
- Account for longer text in German

### Task 5: Generate Dutch Translations
- Translate all `errors` namespace strings to Dutch
- Use formal address ("u")
- Verify variable interpolation preserved

### Task 6: Generate Italian Translations
- Translate all `errors` namespace strings to Italian
- Use formal address ("Lei")
- Verify variable interpolation preserved
- Ensure proper accent encoding

### Task 7: Update Translation Files
- Update `/messages/fr.json` with complete `errors` namespace
- Update `/messages/es.json` with complete `errors` namespace
- Update `/messages/de.json` with complete `errors` namespace
- Update `/messages/nl.json` with complete `errors` namespace
- Update `/messages/it.json` with complete `errors` namespace

### Task 8: Verification and Quality Check
- Verify all keys match between English and translated files
- Verify no missing translations in any language
- Verify all interpolation variables preserved correctly
- Verify character encoding correct (UTF-8)
- Run JSON validation on all files
- Run build to verify no errors: `npm run build`

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/fr.json` | French translations | Update `errors` namespace with categorized translations |
| `/messages/es.json` | Spanish translations | Update `errors` namespace with categorized translations |
| `/messages/de.json` | German translations | Update `errors` namespace with categorized translations |
| `/messages/nl.json` | Dutch translations | Update `errors` namespace with categorized translations |
| `/messages/it.json` | Italian translations | Update `errors` namespace with categorized translations |

### 5.2 Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify in this task) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |
| `/src/lib/i18n/index.ts` | i18n utilities reference |
| `/src/types/index.ts` | Error code types reference |
| `/src/lib/error-utils.ts` | Error handling patterns reference |

### 5.3 Files NOT to Modify

- `/messages/en.json` - English source should already be complete from Tasks 2J.1-2J.6
- `/src/components/**/*.tsx` - Component files should not be modified in this task
- `/src/app/**/*.tsx` - Page files should not be modified in this task
- `/src/lib/i18n/*.ts` - Configuration files should not be modified
- Any TypeScript/JavaScript source files
- Database migrations
- API routes

---

## 6. Dependencies

### 6.1 Required Completions Before This Task

| Task | Description | Status Required |
|------|-------------|-----------------|
| Epic 1 | L10N Foundation (next-intl) | Complete |
| 2J.1 | Create errors namespace structure | Complete |
| 2J.2 | Audit form validation messages | Complete or In Progress |
| 2J.3 | Audit API error handling | Complete or In Progress |
| 2J.4 | Create centralized error utility | Complete or In Progress |
| 2J.5 | Update Zod schemas | Complete or In Progress |
| 2J.6 | Update error boundaries | Complete or In Progress |

**Critical Dependency:** Task 2J.1 (REQ-E02-032) must be complete. The English errors namespace must have the expanded categorized structure before translations can be generated.

### 6.2 Post-Completion Usage

After this task completes, the following capabilities will be available in all 6 languages:

- **Form validation errors**: Required fields, email format, password constraints
- **API error messages**: Server errors, not found, unauthorized
- **Network error messages**: Offline detection, connection failures
- **Authentication errors**: Invalid credentials, session expiration
- **Item/property errors**: CRUD operation failures
- **File upload errors**: Size limits, type restrictions
- **System errors**: Rate limiting, maintenance mode

---

## 7. Acceptance Criteria

### 7.1 Completeness

- [ ] French translation file includes complete translations for all errors namespace strings
- [ ] Spanish translation file includes complete translations for all errors namespace strings
- [ ] German translation file includes complete translations for all errors namespace strings
- [ ] Dutch translation file includes complete translations for all errors namespace strings
- [ ] Italian translation file includes complete translations for all errors namespace strings

### 7.2 Form Validation Errors

- [ ] Required field error messages translated accurately in all 5 languages
- [ ] Email format validation errors translated in all languages
- [ ] Password validation errors (length, complexity, mismatch) translated with {min} interpolation
- [ ] String length constraints translated with {min}/{max} interpolation
- [ ] URL and phone format errors translated appropriately

### 7.3 API Error Messages

- [ ] Generic error messages translated with appropriate tone in all languages
- [ ] Not found errors translated clearly in all languages
- [ ] Unauthorized and forbidden errors translated in all languages
- [ ] Server error and timeout messages translated in all languages

### 7.4 Network Error Messages

- [ ] Offline status messages translated in all languages
- [ ] Connection failure messages translated clearly
- [ ] Slow connection warnings translated appropriately

### 7.5 Authentication Errors

- [ ] Invalid credentials messages translated in all languages
- [ ] Email verification required messages translated
- [ ] Session expiration messages translated clearly
- [ ] Account locked and rate limiting messages translated

### 7.6 Domain-Specific Errors

- [ ] Item-related errors (notFound, CRUD failures) translated
- [ ] Property-related errors translated
- [ ] File upload errors translated with {max} and {types} interpolation

### 7.7 Technical Correctness

- [ ] Character encoding correct for all accented characters
- [ ] All interpolation variables (`{min}`, `{max}`, `{types}`) preserved exactly
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files maintain identical key structure across all languages
- [ ] JSON files pass validation without syntax errors

### 7.8 Build Verification

- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully: `npm run build`
- [ ] No missing translation key warnings in console
- [ ] Application loads without errors in all supported languages

---

## 8. Testing Checklist

### 8.1 Translation Verification Per Language

#### French (fr)
- [ ] Form validation errors display in natural French
- [ ] API errors convey appropriate urgency in French
- [ ] Authentication errors use formal "vous" address
- [ ] Accented characters display correctly (e, a, c)
- [ ] Interpolated values render correctly ({min}, {max})

#### Spanish (es)
- [ ] Form validation errors display in natural Spanish
- [ ] API errors convey appropriate urgency in Spanish
- [ ] Authentication errors use formal "usted" address
- [ ] Accented characters display correctly (a, e, n)
- [ ] Interpolated values render correctly

#### German (de)
- [ ] Form validation errors display in natural German
- [ ] API errors convey appropriate urgency in German
- [ ] Authentication errors use formal "Sie" address
- [ ] Umlauts display correctly (a, o, u, ss)
- [ ] Longer German text does not break UI layouts
- [ ] Interpolated values render correctly

#### Dutch (nl)
- [ ] Form validation errors display in natural Dutch
- [ ] API errors convey appropriate urgency in Dutch
- [ ] Authentication errors use formal "u" address
- [ ] Interpolated values render correctly

#### Italian (it)
- [ ] Form validation errors display in natural Italian
- [ ] API errors convey appropriate urgency in Italian
- [ ] Authentication errors use formal "Lei" address
- [ ] Accented characters display correctly (a, e, i, o, u)
- [ ] Interpolated values render correctly

### 8.2 Interpolation Testing

- [ ] Password minimum length shows correct value: `t('errors.form.password.tooShort', { min: 8 })`
- [ ] Character limits show correct values: `t('errors.form.maxLength', { max: 255 })`
- [ ] File size limits display correctly: `t('errors.file.tooLarge', { max: '10MB' })`
- [ ] Allowed file types display correctly: `t('errors.file.invalidType', { types: 'JPG, PNG' })`

### 8.3 Consistency Testing

- [ ] Same error codes result in same-severity messages across languages
- [ ] Tone is consistent across all error categories within each language
- [ ] No grammatical errors or awkward phrasing
- [ ] Error messages are actionable and helpful

### 8.4 Visual Regression

- [ ] Error messages display without truncation in form fields
- [ ] Toast notifications accommodate longer translated text
- [ ] Error banners and boundaries render correctly
- [ ] Modal error displays are properly formatted

---

## 9. Translation Reference

### 9.1 Core Error Terms Glossary

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Required | Requerido | Requis | Erforderlich | Vereist | Obbligatorio |
| Invalid | Invalido | Invalide | Ungultig | Ongeldig | Non valido |
| Error | Error | Erreur | Fehler | Fout | Errore |
| Failed | Fallido | Echoue | Fehlgeschlagen | Mislukt | Fallito |
| Try again | Intentar de nuevo | Reessayer | Erneut versuchen | Opnieuw proberen | Riprova |
| Please | Por favor | Veuillez | Bitte | Alstublieft | Per favore |
| Password | Contrasena | Mot de passe | Passwort | Wachtwoord | Password |
| Session | Sesion | Session | Sitzung | Sessie | Sessione |
| Connection | Conexion | Connexion | Verbindung | Verbinding | Connessione |
| Upload | Subir | Telecharger | Hochladen | Uploaden | Caricare |

### 9.2 Sample Translations

#### Form Validation - Required Field

**English:** `"This field is required"`

| Language | Translation |
|----------|-------------|
| French | Ce champ est requis |
| Spanish | Este campo es requerido |
| German | Dieses Feld ist erforderlich |
| Dutch | Dit veld is verplicht |
| Italian | Questo campo e obbligatorio |

#### API Error - Generic

**English:** `"Something went wrong. Please try again."`

| Language | Translation |
|----------|-------------|
| French | Une erreur s'est produite. Veuillez reessayer. |
| Spanish | Algo salio mal. Por favor intenta de nuevo. |
| German | Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut. |
| Dutch | Er is iets misgegaan. Probeer het opnieuw. |
| Italian | Qualcosa e andato storto. Per favore riprova. |

#### Authentication - Session Expired

**English:** `"Your session has expired. Please sign in again."`

| Language | Translation |
|----------|-------------|
| French | Votre session a expire. Veuillez vous reconnecter. |
| Spanish | Tu sesion ha expirado. Por favor inicia sesion de nuevo. |
| German | Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an. |
| Dutch | Uw sessie is verlopen. Log opnieuw in. |
| Italian | La tua sessione e scaduta. Per favore accedi nuovamente. |

#### File Error - Too Large (with interpolation)

**English:** `"File size exceeds {max} limit"`

| Language | Translation |
|----------|-------------|
| French | La taille du fichier depasse la limite de {max} |
| Spanish | El tamano del archivo supera el limite de {max} |
| German | Die Dateigrose uberschreitet das Limit von {max} |
| Dutch | Bestandsgrootte overschrijdt de limiet van {max} |
| Italian | La dimensione del file supera il limite di {max} |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Task 2J.1 not complete | Medium | Critical | Verify English errors namespace is expanded before starting |
| Translation quality issues | Medium | Medium | Use professional terminology, review key strings |
| Missing interpolation variables | Low | High | Automated check for `{variable}` patterns |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding, test accented characters |
| Build failures from malformed JSON | Low | High | Validate JSON syntax before committing |
| Inconsistent terminology | Medium | Medium | Reference glossary, grep for inconsistencies |
| Cultural inappropriateness | Low | Medium | Review error message tone per culture |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Verify English source structure and compile reference | 20 minutes |
| Generate French translations (~50 strings) | 45 minutes |
| Generate Spanish translations (~50 strings) | 45 minutes |
| Generate German translations (~50 strings) | 50 minutes |
| Generate Dutch translations (~50 strings) | 45 minutes |
| Generate Italian translations (~50 strings) | 45 minutes |
| Update translation files | 20 minutes |
| Verification and quality check | 30 minutes |
| Build verification and testing | 20 minutes |
| **Total** | **~5-6 hours** |

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2J section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-038
- [REQ-E02-032: Create Errors Namespace Structure](/docs/REQ-E02-032-create-errors-namespace-structure-overview.md)
- [REQ-E02-033: Audit Form Validation Messages](/docs/REQ-E02-033-audit-all-form-validation-messages-across-overview.md)
- [REQ-E02-034: Audit API Error Messages](/docs/REQ-E02-034-audit-all-api-error-handling-and-messages-overview.md)
- [REQ-E02-035: Centralized Error Utility](/docs/REQ-E02-035-create-centralized-error-message-utility-overview.md)
- [i18n Configuration](/src/lib/i18n/config.ts) - Supported locales and metadata
- [Error Types](/src/types/index.ts) - ErrorCode enum reference
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2J - Error Messages & Validation*
*Task 2J.7 - Generate Translations for 5 Non-English Languages*
