# REQ-354: Generate Translations for Error Messages and Validation Strings in Five Non-English Languages

**Detailed Task Breakdown Document**

**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic2.md - REQ-354
**Overview Document:** docs/REQ-354-generate-translations-for-5-non-english-languages-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.7
**Type:** ENHANCEMENT
**Size:** M (Medium)

---

## Executive Summary

This document provides granular, implementation-ready tasks for generating comprehensive error message and validation string translations across five non-English languages (French, Spanish, German, Dutch, Italian). The task involves expanding the English `errors` namespace from ~17 keys to ~300+ keys organized into structured subcategories, then generating high-quality translations for all target languages.

**Target Languages:**

| Code | Language | Formality Level | Key Considerations |
|------|----------|-----------------|-------------------|
| fr | French | Formal (vouvoiement) | Spaces before colons, gender agreement |
| es | Spanish | Neutral (tuteo acceptable) | Latin American neutral, accent marks |
| de | German | Formal (Sie-Form) | 30-40% text expansion, compound nouns |
| nl | Dutch | Formal (u) | Double vowels, appropriate formality |
| it | Italian | Formal (Lei) | Accents, concise phrasing |

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation (next-intl) is complete and functional
- [ ] All 6 translation files exist in `/messages/` directory
- [ ] i18n configuration in `/src/lib/i18n/config.ts` is operational
- [ ] Tasks 2J.1-2J.6 (error namespace structure, audits, utilities) are complete or in parallel

---

## Task Breakdown

### TASK 1: Expand English `errors` Namespace with Form Validation Subcategory

**File:** `/messages/en.json`
**Estimated Effort:** 30 minutes
**Dependencies:** None

**Description:**
Add comprehensive form validation error messages to the English source file under `errors.form` subcategory.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Replace the existing flat `errors` object with a nested structure
3. Add the `errors.form` subcategory with the following keys:

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "url": "Please enter a valid URL",
      "phone": "Please enter a valid phone number",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooLong": "Password must be no more than {max} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match",
        "noSpaces": "Password cannot contain spaces",
        "requireUppercase": "Password must contain at least one uppercase letter",
        "requireLowercase": "Password must contain at least one lowercase letter",
        "requireNumber": "Password must contain at least one number",
        "requireSpecial": "Password must contain at least one special character"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "exactLength": "Must be exactly {length} characters",
      "maxValue": "Value must be at most {max}",
      "minValue": "Value must be at least {min}",
      "range": "Value must be between {min} and {max}",
      "pattern": "Invalid format",
      "alphanumeric": "Only letters and numbers are allowed",
      "numeric": "Only numbers are allowed",
      "alpha": "Only letters are allowed",
      "noWhitespace": "Spaces are not allowed",
      "date": {
        "invalid": "Please enter a valid date",
        "future": "Date must be in the future",
        "past": "Date must be in the past",
        "minDate": "Date must be after {date}",
        "maxDate": "Date must be before {date}"
      },
      "select": {
        "required": "Please select an option",
        "invalid": "Invalid selection"
      },
      "file": {
        "required": "Please select a file",
        "maxSize": "File size must be less than {size}",
        "minSize": "File size must be at least {size}",
        "invalidType": "Invalid file type. Allowed: {types}"
      },
      "array": {
        "minItems": "At least {min} items required",
        "maxItems": "Maximum {max} items allowed",
        "unique": "Duplicate items are not allowed"
      },
      "custom": {
        "duplicateName": "This name is already taken",
        "invalidCharacters": "Contains invalid characters",
        "reservedWord": "This value is reserved and cannot be used"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `errors.form` subcategory exists with all specified keys
- [ ] All ICU interpolation placeholders (`{min}`, `{max}`, etc.) are correctly formatted
- [ ] JSON is valid and parseable
- [ ] No trailing commas or syntax errors

---

### TASK 2: Add API Error Messages Subcategory to English

**File:** `/messages/en.json`
**Estimated Effort:** 20 minutes
**Dependencies:** TASK 1

**Description:**
Add API-related error messages under `errors.api` subcategory.

**Implementation Steps:**

1. Add the `errors.api` subcategory to `/messages/en.json`:

```json
{
  "errors": {
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied. You don't have permission.",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "serviceUnavailable": "Service temporarily unavailable. Please try again.",
      "timeout": "Request timed out. Please try again.",
      "badRequest": "Invalid request. Please check your input.",
      "payloadTooLarge": "The data you're trying to send is too large",
      "rateLimited": "Too many requests. Please wait a moment.",
      "maintenance": "System is under maintenance. Please try again later.",
      "deprecated": "This feature is no longer available",
      "invalidResponse": "Received an invalid response from the server",
      "create": {
        "failed": "Failed to create {resource}",
        "duplicate": "{resource} already exists"
      },
      "update": {
        "failed": "Failed to update {resource}",
        "conflict": "{resource} was modified by another user"
      },
      "delete": {
        "failed": "Failed to delete {resource}",
        "inUse": "Cannot delete {resource} because it is in use"
      },
      "fetch": {
        "failed": "Failed to load {resource}",
        "empty": "No {resource} found"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `errors.api` subcategory exists with all CRUD operation messages
- [ ] Resource interpolation placeholders are correct
- [ ] Messages are user-friendly and non-technical

---

### TASK 3: Add Network Error Messages Subcategory to English

**File:** `/messages/en.json`
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 2

**Description:**
Add network-related error messages under `errors.network` subcategory.

**Implementation Steps:**

1. Add the `errors.network` subcategory to `/messages/en.json`:

```json
{
  "errors": {
    "network": {
      "offline": "You appear to be offline. Please check your internet connection.",
      "connectionFailed": "Unable to connect to the server. Please try again.",
      "connectionLost": "Connection lost. Attempting to reconnect...",
      "reconnecting": "Reconnecting...",
      "reconnected": "Connection restored",
      "slowConnection": "Connection is slow. This may take a moment.",
      "unstableConnection": "Your connection appears unstable",
      "noInternet": "No internet connection detected",
      "dnsError": "Unable to reach the server. Please check your connection.",
      "sslError": "Secure connection failed. Please try again.",
      "corsError": "Request blocked. Please contact support if this persists.",
      "retry": "Retry",
      "retrying": "Retrying...",
      "retryIn": "Retrying in {seconds} seconds..."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `errors.network` subcategory exists
- [ ] Messages clearly indicate connection status
- [ ] Retry-related messages included

---

### TASK 4: Add Authentication Error Messages Subcategory to English

**File:** `/messages/en.json`
**Estimated Effort:** 20 minutes
**Dependencies:** TASK 3

**Description:**
Add authentication and authorization error messages under `errors.auth` subcategory.

**Implementation Steps:**

1. Add the `errors.auth` subcategory to `/messages/en.json`:

```json
{
  "errors": {
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotFound": "No account found with this email",
      "emailNotVerified": "Please verify your email address before signing in",
      "passwordIncorrect": "Incorrect password",
      "accountLocked": "Account has been locked due to too many failed attempts",
      "accountDisabled": "This account has been disabled. Please contact support.",
      "accountDeleted": "This account no longer exists",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "sessionInvalid": "Invalid session. Please sign in again.",
      "tokenExpired": "Your verification link has expired",
      "tokenInvalid": "Invalid verification link",
      "refreshFailed": "Unable to refresh your session. Please sign in again.",
      "accessDenied": "You don't have permission to access this resource",
      "insufficientPermissions": "You don't have sufficient permissions for this action",
      "requiresAuth": "Please sign in to continue",
      "requiresAdmin": "Administrator access required",
      "requiresOwner": "Only the owner can perform this action",
      "oauthFailed": "Authentication with {provider} failed",
      "oauthCancelled": "Authentication was cancelled",
      "oauthAccountExists": "An account already exists with this email. Please sign in with your password.",
      "mfaRequired": "Multi-factor authentication required",
      "mfaFailed": "Invalid verification code",
      "tooManyAttempts": "Too many failed attempts. Please try again in {minutes} minutes."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `errors.auth` subcategory exists with comprehensive auth messages
- [ ] OAuth and MFA scenarios covered
- [ ] Rate limiting messages included

---

### TASK 5: Add Entity-Specific Error Messages Subcategories to English

**File:** `/messages/en.json`
**Estimated Effort:** 25 minutes
**Dependencies:** TASK 4

**Description:**
Add domain-specific error messages for items, properties, and files.

**Implementation Steps:**

1. Add entity-specific subcategories to `/messages/en.json`:

```json
{
  "errors": {
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item. Please try again.",
      "updateFailed": "Failed to update item. Please try again.",
      "deleteFailed": "Failed to delete item. Please try again.",
      "duplicateName": "An item with this name already exists",
      "invalidRoom": "Please select a valid room",
      "invalidProperty": "Please select a valid property",
      "maxItemsReached": "Maximum number of items reached for this property",
      "noContent": "At least one piece of content is required",
      "qrGenerationFailed": "Failed to generate QR code"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property. Please try again.",
      "updateFailed": "Failed to update property. Please try again.",
      "deleteFailed": "Failed to delete property. Please try again.",
      "duplicateName": "A property with this name already exists",
      "hasItems": "Cannot delete property with existing items",
      "invalidAddress": "Please enter a valid address",
      "maxPropertiesReached": "Maximum number of properties reached"
    },
    "room": {
      "notFound": "Room not found",
      "createFailed": "Failed to create room. Please try again.",
      "updateFailed": "Failed to update room. Please try again.",
      "deleteFailed": "Failed to delete room. Please try again.",
      "duplicateName": "A room with this name already exists in this property",
      "hasItems": "Cannot delete room with existing items"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "downloadFailed": "File download failed. Please try again.",
      "processingFailed": "Failed to process file. Please try a different file.",
      "corrupt": "File appears to be corrupt or damaged",
      "empty": "File is empty",
      "maxFilesReached": "Maximum number of files reached"
    },
    "tag": {
      "notFound": "Tag not found",
      "duplicateName": "A tag with this name already exists",
      "invalidFormat": "Tag name contains invalid characters",
      "maxTagsReached": "Maximum number of tags reached"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All entity subcategories exist (item, property, room, file, tag)
- [ ] CRUD operation errors covered for each entity
- [ ] Domain-specific validation errors included

---

### TASK 6: Add Error Boundary and Reaction Messages to English

**File:** `/messages/en.json`
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 5

**Description:**
Add error boundary fallback UI messages and reaction system errors.

**Implementation Steps:**

1. Add error boundary and reaction subcategories to `/messages/en.json`:

```json
{
  "errors": {
    "boundary": {
      "title": "Something went wrong",
      "description": "We apologize for the inconvenience. An unexpected error has occurred.",
      "technicalDetails": "Technical Details",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again",
      "goBack": "Go back",
      "goHome": "Return to home",
      "refresh": "Refresh page",
      "contact": "If this problem persists, please contact support.",
      "reportIssue": "Report this issue",
      "whatHappened": "What happened?",
      "whatHappenedDescription": "A technical error prevented this page from loading properly.",
      "whatToDo": "What can you do?",
      "whatToDoItems": {
        "refresh": "Try refreshing the page",
        "goBack": "Go back to the previous page",
        "clear": "Clear your browser cache and try again",
        "contact": "Contact support if the issue persists"
      }
    },
    "reaction": {
      "updateFailed": "Failed to update reaction. Please try again.",
      "loadFailed": "Failed to load reactions",
      "unavailable": "Reaction system is temporarily unavailable",
      "alreadyReacted": "You've already reacted to this",
      "notAllowed": "You cannot react to this content",
      "dismiss": "Dismiss"
    },
    "generic": {
      "title": "Error",
      "unknown": "An unknown error occurred",
      "unexpected": "An unexpected error occurred. Please try again.",
      "operationFailed": "Operation failed. Please try again.",
      "saveFailed": "Failed to save changes. Please try again.",
      "loadFailed": "Failed to load data. Please try again.",
      "actionFailed": "Action failed. Please try again.",
      "tryAgainLater": "Please try again later",
      "contactSupport": "Please contact support if this problem persists"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Error boundary messages are user-friendly and non-technical
- [ ] Recovery actions are clearly presented
- [ ] Generic fallback errors included

---

### TASK 7: Generate French Translations for Expanded Errors Namespace

**File:** `/messages/fr.json`
**Estimated Effort:** 45 minutes
**Dependencies:** TASKS 1-6

**Description:**
Generate French translations for all error messages in the expanded `errors` namespace.

**Translation Guidelines for French:**
- Use formal register (vouvoiement) - "vous" not "tu"
- Add space before colons, semicolons, and question marks
- Proper French punctuation (« » for quotes if needed)
- Gender agreement where applicable
- Technical terms: "e-mail" (with hyphen), "mot de passe", "serveur"

**Implementation Steps:**

1. Open `/messages/fr.json`
2. Replace the existing `errors` object with the complete expanded structure
3. Apply translations following the French language guidelines

**Sample Translations (partial - implement full set):**

```json
{
  "errors": {
    "form": {
      "required": "Ce champ est requis",
      "email": "Veuillez entrer une adresse e-mail valide",
      "url": "Veuillez entrer une URL valide",
      "phone": "Veuillez entrer un numero de telephone valide",
      "password": {
        "required": "Le mot de passe est requis",
        "tooShort": "Le mot de passe doit contenir au moins {min} caracteres",
        "tooLong": "Le mot de passe ne doit pas depasser {max} caracteres",
        "tooWeak": "Le mot de passe doit contenir des majuscules, des minuscules et des chiffres",
        "mismatch": "Les mots de passe ne correspondent pas"
      },
      "maxLength": "Maximum {max} caracteres autorises",
      "minLength": "Minimum {min} caracteres requis"
    },
    "api": {
      "generic": "Une erreur s'est produite. Veuillez reessayer.",
      "notFound": "La ressource demandee n'a pas ete trouvee",
      "unauthorized": "Vous n'etes pas autorise a effectuer cette action",
      "forbidden": "Acces refuse. Vous n'avez pas les permissions necessaires.",
      "serverError": "Erreur serveur. Veuillez reessayer plus tard.",
      "timeout": "Delai d'attente depasse. Veuillez reessayer."
    },
    "network": {
      "offline": "Vous semblez etre hors ligne. Veuillez verifier votre connexion Internet.",
      "connectionFailed": "Impossible de se connecter au serveur. Veuillez reessayer.",
      "slowConnection": "La connexion est lente. Cela peut prendre un moment."
    },
    "auth": {
      "invalidCredentials": "E-mail ou mot de passe invalide",
      "sessionExpired": "Votre session a expire. Veuillez vous reconnecter.",
      "accessDenied": "Vous n'avez pas la permission d'acceder a cette ressource"
    },
    "boundary": {
      "title": "Une erreur s'est produite",
      "description": "Nous nous excusons pour la gene occasionnee. Une erreur inattendue s'est produite.",
      "tryAgain": "Reessayer",
      "goBack": "Retour",
      "goHome": "Retour a l'accueil"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `errors` subcategories translated to French
- [ ] Formal register (vouvoiement) consistently used
- [ ] ICU placeholders preserved exactly
- [ ] JSON structure matches English source
- [ ] French-specific punctuation rules applied

---

### TASK 8: Generate Spanish Translations for Expanded Errors Namespace

**File:** `/messages/es.json`
**Estimated Effort:** 45 minutes
**Dependencies:** TASKS 1-6

**Description:**
Generate Spanish translations for all error messages in the expanded `errors` namespace.

**Translation Guidelines for Spanish:**
- Use neutral Latin American Spanish
- Tuteo (informal "tu") is acceptable for error messages
- Proper accent marks (a, e, i, o, u)
- Inverted question marks and exclamation marks where appropriate
- Technical terms: "correo electronico", "contrasena", "servidor"

**Sample Translations (partial - implement full set):**

```json
{
  "errors": {
    "form": {
      "required": "Este campo es obligatorio",
      "email": "Por favor, ingresa una direccion de correo valida",
      "url": "Por favor, ingresa una URL valida",
      "phone": "Por favor, ingresa un numero de telefono valido",
      "password": {
        "required": "La contrasena es obligatoria",
        "tooShort": "La contrasena debe tener al menos {min} caracteres",
        "tooLong": "La contrasena no debe exceder {max} caracteres",
        "tooWeak": "La contrasena debe incluir mayusculas, minusculas y numeros",
        "mismatch": "Las contrasenas no coinciden"
      },
      "maxLength": "Maximo {max} caracteres permitidos",
      "minLength": "Minimo {min} caracteres requeridos"
    },
    "api": {
      "generic": "Algo salio mal. Por favor, intentalo de nuevo.",
      "notFound": "El recurso solicitado no fue encontrado",
      "unauthorized": "No tienes autorizacion para realizar esta accion",
      "forbidden": "Acceso denegado. No tienes permiso.",
      "serverError": "Error del servidor. Por favor, intentalo mas tarde.",
      "timeout": "La solicitud expiro. Por favor, intentalo de nuevo."
    },
    "network": {
      "offline": "Parece que estas sin conexion. Por favor, verifica tu conexion a Internet.",
      "connectionFailed": "No se pudo conectar al servidor. Por favor, intentalo de nuevo.",
      "slowConnection": "La conexion es lenta. Esto puede tardar un momento."
    },
    "auth": {
      "invalidCredentials": "Correo electronico o contrasena invalidos",
      "sessionExpired": "Tu sesion ha expirado. Por favor, inicia sesion de nuevo.",
      "accessDenied": "No tienes permiso para acceder a este recurso"
    },
    "boundary": {
      "title": "Algo salio mal",
      "description": "Nos disculpamos por las molestias. Ha ocurrido un error inesperado.",
      "tryAgain": "Intentar de nuevo",
      "goBack": "Volver",
      "goHome": "Volver al inicio"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `errors` subcategories translated to Spanish
- [ ] Neutral Latin American Spanish used
- [ ] ICU placeholders preserved exactly
- [ ] JSON structure matches English source
- [ ] Proper accent marks applied

---

### TASK 9: Generate German Translations for Expanded Errors Namespace

**File:** `/messages/de.json`
**Estimated Effort:** 50 minutes
**Dependencies:** TASKS 1-6

**Description:**
Generate German translations for all error messages in the expanded `errors` namespace.

**Translation Guidelines for German:**
- Use formal register (Sie-Form) - capitalize "Sie", "Ihr", "Ihnen"
- Expect 30-40% text expansion compared to English
- Proper compound noun capitalization (all nouns capitalized)
- Umlauts (a, o, u) and eszett (ss) as appropriate
- Technical terms: "E-Mail", "Passwort", "Server"

**Sample Translations (partial - implement full set):**

```json
{
  "errors": {
    "form": {
      "required": "Dieses Feld ist erforderlich",
      "email": "Bitte geben Sie eine gultige E-Mail-Adresse ein",
      "url": "Bitte geben Sie eine gultige URL ein",
      "phone": "Bitte geben Sie eine gultige Telefonnummer ein",
      "password": {
        "required": "Passwort ist erforderlich",
        "tooShort": "Das Passwort muss mindestens {min} Zeichen enthalten",
        "tooLong": "Das Passwort darf nicht mehr als {max} Zeichen enthalten",
        "tooWeak": "Das Passwort muss Grossbuchstaben, Kleinbuchstaben und Zahlen enthalten",
        "mismatch": "Die Passworter stimmen nicht uberein"
      },
      "maxLength": "Maximal {max} Zeichen erlaubt",
      "minLength": "Mindestens {min} Zeichen erforderlich"
    },
    "api": {
      "generic": "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
      "notFound": "Die angeforderte Ressource wurde nicht gefunden",
      "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzufuhren",
      "forbidden": "Zugriff verweigert. Sie haben keine Berechtigung.",
      "serverError": "Serverfehler. Bitte versuchen Sie es spater erneut.",
      "timeout": "Zeituberschreitung. Bitte versuchen Sie es erneut."
    },
    "network": {
      "offline": "Sie scheinen offline zu sein. Bitte uberprufen Sie Ihre Internetverbindung.",
      "connectionFailed": "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
      "slowConnection": "Die Verbindung ist langsam. Dies kann einen Moment dauern."
    },
    "auth": {
      "invalidCredentials": "Ungultige E-Mail-Adresse oder Passwort",
      "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      "accessDenied": "Sie haben keine Berechtigung, auf diese Ressource zuzugreifen"
    },
    "boundary": {
      "title": "Etwas ist schief gelaufen",
      "description": "Wir entschuldigen uns fur die Unannehmlichkeiten. Ein unerwarteter Fehler ist aufgetreten.",
      "tryAgain": "Erneut versuchen",
      "goBack": "Zuruck",
      "goHome": "Zur Startseite"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `errors` subcategories translated to German
- [ ] Formal register (Sie-Form) consistently used
- [ ] ICU placeholders preserved exactly
- [ ] JSON structure matches English source
- [ ] Proper noun capitalization and umlauts applied

---

### TASK 10: Generate Dutch Translations for Expanded Errors Namespace

**File:** `/messages/nl.json`
**Estimated Effort:** 45 minutes
**Dependencies:** TASKS 1-6

**Description:**
Generate Dutch translations for all error messages in the expanded `errors` namespace.

**Translation Guidelines for Dutch:**
- Use formal register ("u") for professional context
- Double vowels where appropriate (aa, ee, oo, etc.)
- Technical terms: "e-mail", "wachtwoord", "server"
- Direct, clear phrasing preferred

**Sample Translations (partial - implement full set):**

```json
{
  "errors": {
    "form": {
      "required": "Dit veld is verplicht",
      "email": "Voer een geldig e-mailadres in",
      "url": "Voer een geldige URL in",
      "phone": "Voer een geldig telefoonnummer in",
      "password": {
        "required": "Wachtwoord is verplicht",
        "tooShort": "Wachtwoord moet minimaal {min} tekens bevatten",
        "tooLong": "Wachtwoord mag niet meer dan {max} tekens bevatten",
        "tooWeak": "Wachtwoord moet hoofdletters, kleine letters en cijfers bevatten",
        "mismatch": "Wachtwoorden komen niet overeen"
      },
      "maxLength": "Maximaal {max} tekens toegestaan",
      "minLength": "Minimaal {min} tekens vereist"
    },
    "api": {
      "generic": "Er is iets misgegaan. Probeer het opnieuw.",
      "notFound": "De gevraagde bron is niet gevonden",
      "unauthorized": "U bent niet gemachtigd om deze actie uit te voeren",
      "forbidden": "Toegang geweigerd. U heeft geen toestemming.",
      "serverError": "Serverfout. Probeer het later opnieuw.",
      "timeout": "Time-out. Probeer het opnieuw."
    },
    "network": {
      "offline": "U lijkt offline te zijn. Controleer uw internetverbinding.",
      "connectionFailed": "Kan geen verbinding maken met de server. Probeer het opnieuw.",
      "slowConnection": "De verbinding is traag. Dit kan even duren."
    },
    "auth": {
      "invalidCredentials": "Ongeldig e-mailadres of wachtwoord",
      "sessionExpired": "Uw sessie is verlopen. Meld u opnieuw aan.",
      "accessDenied": "U heeft geen toegang tot deze bron"
    },
    "boundary": {
      "title": "Er is iets misgegaan",
      "description": "Onze excuses voor het ongemak. Er is een onverwachte fout opgetreden.",
      "tryAgain": "Opnieuw proberen",
      "goBack": "Terug",
      "goHome": "Naar startpagina"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `errors` subcategories translated to Dutch
- [ ] Formal register ("u") consistently used
- [ ] ICU placeholders preserved exactly
- [ ] JSON structure matches English source
- [ ] Clear, direct Dutch phrasing used

---

### TASK 11: Generate Italian Translations for Expanded Errors Namespace

**File:** `/messages/it.json`
**Estimated Effort:** 45 minutes
**Dependencies:** TASKS 1-6

**Description:**
Generate Italian translations for all error messages in the expanded `errors` namespace.

**Translation Guidelines for Italian:**
- Use formal register (Lei) for professional context
- Proper accent marks (a, e, i, o, u, e grave, e acute)
- Concise phrasing preferred
- Technical terms: "email" (no hyphen), "password", "server"

**Sample Translations (partial - implement full set):**

```json
{
  "errors": {
    "form": {
      "required": "Questo campo e obbligatorio",
      "email": "Inserisci un indirizzo email valido",
      "url": "Inserisci un URL valido",
      "phone": "Inserisci un numero di telefono valido",
      "password": {
        "required": "La password e obbligatoria",
        "tooShort": "La password deve contenere almeno {min} caratteri",
        "tooLong": "La password non deve superare {max} caratteri",
        "tooWeak": "La password deve includere maiuscole, minuscole e numeri",
        "mismatch": "Le password non corrispondono"
      },
      "maxLength": "Massimo {max} caratteri consentiti",
      "minLength": "Minimo {min} caratteri richiesti"
    },
    "api": {
      "generic": "Si e verificato un errore. Riprova.",
      "notFound": "La risorsa richiesta non e stata trovata",
      "unauthorized": "Non sei autorizzato a eseguire questa azione",
      "forbidden": "Accesso negato. Non hai i permessi necessari.",
      "serverError": "Errore del server. Riprova piu tardi.",
      "timeout": "Richiesta scaduta. Riprova."
    },
    "network": {
      "offline": "Sembra che tu sia offline. Verifica la tua connessione Internet.",
      "connectionFailed": "Impossibile connettersi al server. Riprova.",
      "slowConnection": "La connessione e lenta. Potrebbe volerci un momento."
    },
    "auth": {
      "invalidCredentials": "Email o password non validi",
      "sessionExpired": "La tua sessione e scaduta. Accedi di nuovo.",
      "accessDenied": "Non hai il permesso di accedere a questa risorsa"
    },
    "boundary": {
      "title": "Si e verificato un errore",
      "description": "Ci scusiamo per l'inconveniente. Si e verificato un errore imprevisto.",
      "tryAgain": "Riprova",
      "goBack": "Indietro",
      "goHome": "Torna alla home"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `errors` subcategories translated to Italian
- [ ] Formal register used appropriately
- [ ] ICU placeholders preserved exactly
- [ ] JSON structure matches English source
- [ ] Proper Italian accents applied

---

### TASK 12: Validate JSON Structure Across All Language Files

**Files:** All `/messages/*.json` files
**Estimated Effort:** 20 minutes
**Dependencies:** TASKS 7-11

**Description:**
Validate that all translation files have identical key structures and valid JSON.

**Implementation Steps:**

1. Verify JSON syntax is valid in all 6 files:
   ```bash
   for file in messages/*.json; do
     echo "Validating $file..."
     node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" && echo "Valid" || echo "Invalid"
   done
   ```

2. Compare key structures:
   ```bash
   # Extract and compare keys from all files
   node -e "
   const fs = require('fs');
   const files = ['en', 'fr', 'es', 'de', 'nl', 'it'];
   const getKeys = (obj, prefix = '') => {
     return Object.entries(obj).flatMap(([k, v]) =>
       typeof v === 'object' && v !== null ? getKeys(v, prefix + k + '.') : [prefix + k]
     );
   };
   const enKeys = new Set(getKeys(JSON.parse(fs.readFileSync('messages/en.json'))));
   files.slice(1).forEach(lang => {
     const langKeys = new Set(getKeys(JSON.parse(fs.readFileSync('messages/' + lang + '.json'))));
     const missing = [...enKeys].filter(k => !langKeys.has(k));
     const extra = [...langKeys].filter(k => !enKeys.has(k));
     if (missing.length) console.log(lang + ' missing:', missing);
     if (extra.length) console.log(lang + ' extra:', extra);
   });
   console.log('Validation complete');
   "
   ```

3. Verify ICU interpolation placeholders match across all files

**Acceptance Criteria:**
- [ ] All 6 JSON files are syntactically valid
- [ ] All files have identical key structures within `errors` namespace
- [ ] No missing keys in any language file
- [ ] No extra keys in any language file
- [ ] All ICU placeholders preserved correctly

---

### TASK 13: Test Error Messages in Application

**Files:** Various component files
**Estimated Effort:** 30 minutes
**Dependencies:** TASK 12

**Description:**
Manually test error messages display correctly in the application for each language.

**Test Scenarios:**

1. **Form Validation Errors:**
   - Submit login form with empty fields
   - Submit form with invalid email format
   - Submit password with < 8 characters
   - Submit form with mismatched passwords

2. **API Errors:**
   - Trigger 404 by navigating to non-existent resource
   - Trigger 401 by accessing protected route while logged out
   - Trigger 500 (mock or staging environment)

3. **Network Errors:**
   - Disable network and attempt action
   - Test slow connection warning (if implemented)

4. **Error Boundaries:**
   - Trigger React error boundary (development only)
   - Verify fallback UI displays correctly

**Test Matrix:**

| Scenario | EN | FR | ES | DE | NL | IT |
|----------|----|----|----|----|----|----|
| Required field validation | | | | | | |
| Invalid email format | | | | | | |
| Password too short (with {min}) | | | | | | |
| Session expired | | | | | | |
| Network offline | | | | | | |
| Error boundary fallback | | | | | | |

**Acceptance Criteria:**
- [ ] All test scenarios pass in English
- [ ] All test scenarios pass in French
- [ ] All test scenarios pass in Spanish
- [ ] All test scenarios pass in German
- [ ] All test scenarios pass in Dutch
- [ ] All test scenarios pass in Italian
- [ ] No text truncation or overflow issues
- [ ] ICU interpolation displays correctly with actual values

---

### TASK 14: Create Translation Glossary Entry for Error Terms

**File:** `/docs/i18n/glossary.md` (create if not exists)
**Estimated Effort:** 15 minutes
**Dependencies:** TASKS 7-11

**Description:**
Document standard translations for error-related terminology to ensure consistency.

**Implementation Steps:**

1. Create or update `/docs/i18n/glossary.md` with error terminology:

```markdown
# Translation Glossary - Error Messages

Last Modified: 2026-01-19

## Error Terminology

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| error | erreur | error | Fehler | fout | errore |
| required | requis | obligatorio | erforderlich | verplicht | obbligatorio |
| invalid | invalide | invalido | ungultig | ongeldig | non valido |
| try again | reessayer | intentar de nuevo | erneut versuchen | opnieuw proberen | riprova |
| please | veuillez | por favor | bitte | alstublieft | per favore |
| failed | echoue | fallido | fehlgeschlagen | mislukt | fallito |
| expired | expire | expirado | abgelaufen | verlopen | scaduto |
| denied | refuse | denegado | verweigert | geweigerd | negato |
| connection | connexion | conexion | Verbindung | verbinding | connessione |
| server | serveur | servidor | Server | server | server |
| session | session | sesion | Sitzung | sessie | sessione |
| permission | permission | permiso | Berechtigung | toestemming | permesso |
| unauthorized | non autorise | no autorizado | nicht berechtigt | niet gemachtigd | non autorizzato |

## Tone Guidelines

- **French:** Formal (vouvoiement), polite, apologetic
- **Spanish:** Neutral, helpful, action-oriented
- **German:** Formal (Sie-Form), precise, structured
- **Dutch:** Formal (u), direct, clear
- **Italian:** Formal (Lei), concise, professional
```

**Acceptance Criteria:**
- [ ] Glossary file exists with error terminology
- [ ] All key terms documented in all 6 languages
- [ ] Tone guidelines documented for each language

---

### TASK 15: Update Documentation and Mark Task Complete

**Files:** Various documentation files
**Estimated Effort:** 10 minutes
**Dependencies:** TASKS 1-14

**Description:**
Update implementation tracking and mark the task as complete.

**Implementation Steps:**

1. Update `/docs/gen_requests_epic2.md` - Mark REQ-354 acceptance criteria as complete

2. Update task tracking in pipeline state file (if applicable)

3. Create completion summary:
   - Total keys added: ~300
   - Languages translated: 5 (fr, es, de, nl, it)
   - Key categories: form, api, network, auth, item, property, room, file, tag, boundary, reaction, generic

**Acceptance Criteria:**
- [ ] All acceptance criteria in REQ-354 marked complete
- [ ] Documentation updated with completion date
- [ ] Implementation notes recorded for future reference

---

## Summary

| Task | Description | Est. Effort | Dependencies |
|------|-------------|-------------|--------------|
| 1 | Expand English `errors.form` subcategory | 30 min | None |
| 2 | Add English `errors.api` subcategory | 20 min | Task 1 |
| 3 | Add English `errors.network` subcategory | 15 min | Task 2 |
| 4 | Add English `errors.auth` subcategory | 20 min | Task 3 |
| 5 | Add English entity-specific subcategories | 25 min | Task 4 |
| 6 | Add English boundary and generic messages | 15 min | Task 5 |
| 7 | Generate French translations | 45 min | Tasks 1-6 |
| 8 | Generate Spanish translations | 45 min | Tasks 1-6 |
| 9 | Generate German translations | 50 min | Tasks 1-6 |
| 10 | Generate Dutch translations | 45 min | Tasks 1-6 |
| 11 | Generate Italian translations | 45 min | Tasks 1-6 |
| 12 | Validate JSON structure | 20 min | Tasks 7-11 |
| 13 | Test error messages in application | 30 min | Task 12 |
| 14 | Create translation glossary entry | 15 min | Tasks 7-11 |
| 15 | Update documentation and mark complete | 10 min | Tasks 1-14 |

**Total Estimated Effort:** ~7 hours

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ICU syntax broken in translation | Validate all files after translation; regex check for `{placeholder}` pattern |
| Missing translations | Automated key comparison (Task 12) |
| Cultural inappropriateness | Review by native speaker recommended for production |
| Text overflow in UI | Test German translations (longest); adjust UI if needed |
| JSON syntax errors | Parse validation before commit |

---

## References

- [Overview Document](/docs/REQ-354-generate-translations-for-5-non-english-languages-overview.md)
- [Request: docs/gen_requests_epic2.md - REQ-354](/docs/gen_requests_epic2.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
*Task 2J.7: Generate translations for 5 non-English languages*
