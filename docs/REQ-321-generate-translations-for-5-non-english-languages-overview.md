# REQ-321: Generate Translations for Error and Validation Messages in Non-English Languages - Implementation Overview

**Last Modified:** 2026-01-18 21:57:00 UTC
**Request ID:** REQ-321
**Type:** NEW FEATURE
**Size:** L
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.7
**Epic Reference:** L10N Epic 2 - Static UI Translation
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This task generates professional translations for all error messages and validation feedback strings in the `errors` namespace, translating from English into the five supported non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This completes the internationalization of the error handling system, ensuring users receive clear, culturally appropriate error feedback in their preferred language.

---

## Current State Analysis

### Dependencies (Must Be Complete)

This task depends on the following completed work:

| Task ID | Description | Status Required |
|---------|-------------|-----------------|
| 2J.1 | Create `errors` namespace structure | Completed |
| 2J.2 | Audit form validation messages | Completed |
| 2J.3 | Audit API error handling | Completed |
| 2J.4 | Create centralized error message utility | Completed |
| 2J.5 | Update Zod schemas for translated messages | Completed |
| 2J.6 | Update error boundaries with translations | Completed |

### Translation File Structure

The `/messages/en.json` file should contain the complete `errors` namespace with the following structure:

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "requiredField": "{field} is required",
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
      "badRequest": "Invalid request data",
      "notFound": "The requested resource was not found",
      "unauthorized": "Authentication required",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "rateLimited": "Too many requests. Please try again later.",
      "serverError": "Server error. Please try again later.",
      "serviceUnavailable": "Service temporarily unavailable",
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
      "accessDenied": "Access denied to this resource",
      "oauthExpired": "OAuth session expired. Please sign in with Google again.",
      "oauthConflict": "OAuth registration conflict. Account may already exist.",
      "oauthFailed": "OAuth authentication failed. Please try again."
    },
    "permission": {
      "denied": "You don't have permission to perform this action",
      "insufficientPrivileges": "Insufficient privileges for this operation"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
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
    "nextSteps": {
      "tryAgain": "Please try again",
      "checkConnection": "Check your internet connection and retry",
      "contactSupport": "If the problem persists, please contact support",
      "refreshPage": "Try refreshing the page",
      "loginAgain": "Please sign in again",
      "goToLogin": "Click 'Go to Login' to access your account",
      "checkInput": "Review your input and fix any errors",
      "verifyEmail": "Verify your access code and email, or request a new invitation",
      "restartOauth": "Click 'Continue with Google' to restart the OAuth process"
    },
    "boundary": {
      "title": "Something went wrong",
      "description": "An unexpected error occurred while loading this section.",
      "retry": "Try Again",
      "reload": "Reload Page",
      "goBack": "Go Back",
      "reportIssue": "Report Issue"
    }
  }
}
```

### Target Languages

| Code | Language | Native Name | Region Focus |
|------|----------|-------------|--------------|
| fr | French | Francais | France, Canada, Belgium |
| es | Spanish | Espanol | Spain, Latin America |
| de | German | Deutsch | Germany, Austria, Switzerland |
| nl | Dutch | Nederlands | Netherlands, Belgium |
| it | Italian | Italiano | Italy, Switzerland |

---

## Technical Solution

### Translation Strategy

#### 1. Domain Context for AI Translation

When generating translations, provide the following context to ensure accuracy:

```
Domain: Property rental management application (similar to Airbnb host tools)
Content Type: Error messages, validation feedback, and user guidance
Tone: Professional, helpful, and non-technical
Audience: Property owners and guests interacting with QR code item guides
Key Terms:
- "item" = QR code item that links to instructions for appliances/features
- "property" = rental property (apartment, house, vacation rental)
- "access code" = invitation code for new users

Guidelines:
1. Use formal register (vous in French, usted forms in Spanish where appropriate)
2. Keep messages concise but clear
3. Maintain professional tone even for error scenarios
4. Preserve {placeholder} variables exactly as shown
5. Use culturally appropriate idioms rather than literal translations
6. For technical terms, use commonly understood local equivalents
```

#### 2. Translation Quality Requirements

| Requirement | Description |
|-------------|-------------|
| **Accuracy** | Meaning must be preserved exactly; no added or omitted information |
| **Clarity** | Messages must be understandable by non-technical users |
| **Consistency** | Same terms used throughout (e.g., "property" always translated the same way) |
| **Tone** | Professional, helpful, not condescending or overly technical |
| **Parameters** | All `{placeholder}` variables preserved exactly with same names |
| **Length** | Translations should be similar length; accommodate UI text expansion |
| **Grammar** | Correct grammar, including gendered languages (French, Spanish, German, Italian) |

#### 3. Terminology Glossary

Maintain consistent translations for key terms:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| item | article | articulo | Artikel | item | articolo |
| property | propriete | propiedad | Immobilie | eigendom | proprieta |
| field | champ | campo | Feld | veld | campo |
| password | mot de passe | contrasena | Passwort | wachtwoord | password |
| email | e-mail | correo electronico | E-Mail | e-mail | e-mail |
| access code | code d'acces | codigo de acceso | Zugangscode | toegangscode | codice di accesso |
| sign in | se connecter | iniciar sesion | anmelden | inloggen | accedi |

---

## Implementation Tasks

### Task 1: Generate French (fr) Translations

**File:** `/messages/fr.json`

Create the complete `errors` namespace in French:

```json
{
  "errors": {
    "form": {
      "required": "Ce champ est obligatoire",
      "requiredField": "Le champ {field} est obligatoire",
      "email": "Veuillez saisir une adresse e-mail valide",
      "password": {
        "required": "Le mot de passe est obligatoire",
        "tooShort": "Le mot de passe doit contenir au moins {min} caracteres",
        "tooWeak": "Le mot de passe doit contenir des majuscules, des minuscules et des chiffres",
        "mismatch": "Les mots de passe ne correspondent pas"
      },
      "maxLength": "{max} caracteres maximum autorises",
      "minLength": "{min} caracteres minimum requis",
      "invalidFormat": "Format invalide",
      "invalidUrl": "Veuillez saisir une URL valide",
      "invalidPhone": "Veuillez saisir un numero de telephone valide"
    },
    "api": {
      "generic": "Une erreur s'est produite. Veuillez reessayer.",
      "badRequest": "Donnees de requete invalides",
      "notFound": "La ressource demandee est introuvable",
      "unauthorized": "Authentification requise",
      "forbidden": "Acces refuse",
      "conflict": "Cette ressource existe deja",
      "rateLimited": "Trop de requetes. Veuillez reessayer plus tard.",
      "serverError": "Erreur serveur. Veuillez reessayer plus tard.",
      "serviceUnavailable": "Service temporairement indisponible",
      "timeout": "Delai d'attente depasse. Veuillez reessayer."
    },
    "network": {
      "offline": "Vous semblez etre hors ligne. Veuillez verifier votre connexion.",
      "connectionFailed": "Impossible de se connecter au serveur",
      "slowConnection": "La connexion est lente. Cela peut prendre un moment."
    },
    "auth": {
      "invalidCredentials": "Adresse e-mail ou mot de passe invalide",
      "emailNotVerified": "Veuillez verifier votre adresse e-mail",
      "sessionExpired": "Votre session a expire. Veuillez vous reconnecter.",
      "accountLocked": "Le compte a ete verrouille. Contactez le support.",
      "accessDenied": "Acces refuse a cette ressource",
      "oauthExpired": "Session OAuth expiree. Veuillez vous reconnecter avec Google.",
      "oauthConflict": "Conflit d'inscription OAuth. Le compte existe peut-etre deja.",
      "oauthFailed": "Echec de l'authentification OAuth. Veuillez reessayer."
    },
    "permission": {
      "denied": "Vous n'avez pas la permission d'effectuer cette action",
      "insufficientPrivileges": "Privileges insuffisants pour cette operation"
    },
    "file": {
      "tooLarge": "La taille du fichier depasse la limite de {max} Mo",
      "invalidType": "Type de fichier invalide. Autorises : {types}",
      "uploadFailed": "Echec du telechargement. Veuillez reessayer."
    },
    "item": {
      "notFound": "Article introuvable",
      "createFailed": "Echec de la creation de l'article",
      "updateFailed": "Echec de la mise a jour de l'article",
      "deleteFailed": "Echec de la suppression de l'article",
      "duplicateName": "Un article portant ce nom existe deja"
    },
    "property": {
      "notFound": "Propriete introuvable",
      "createFailed": "Echec de la creation de la propriete",
      "updateFailed": "Echec de la mise a jour de la propriete",
      "deleteFailed": "Echec de la suppression de la propriete"
    },
    "nextSteps": {
      "tryAgain": "Veuillez reessayer",
      "checkConnection": "Verifiez votre connexion Internet et reessayez",
      "contactSupport": "Si le probleme persiste, veuillez contacter le support",
      "refreshPage": "Essayez d'actualiser la page",
      "loginAgain": "Veuillez vous reconnecter",
      "goToLogin": "Cliquez sur 'Aller a la connexion' pour acceder a votre compte",
      "checkInput": "Verifiez vos donnees et corrigez les erreurs",
      "verifyEmail": "Verifiez votre code d'acces et votre e-mail, ou demandez une nouvelle invitation",
      "restartOauth": "Cliquez sur 'Continuer avec Google' pour relancer le processus OAuth"
    },
    "boundary": {
      "title": "Une erreur s'est produite",
      "description": "Une erreur inattendue s'est produite lors du chargement de cette section.",
      "retry": "Reessayer",
      "reload": "Actualiser la page",
      "goBack": "Retour",
      "reportIssue": "Signaler un probleme"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All English keys have corresponding French translations
- [ ] Formal register (vous) used consistently
- [ ] All {placeholder} variables preserved exactly
- [ ] Professional tone maintained throughout
- [ ] JSON structure valid

---

### Task 2: Generate Spanish (es) Translations

**File:** `/messages/es.json`

Create the complete `errors` namespace in Spanish:

```json
{
  "errors": {
    "form": {
      "required": "Este campo es obligatorio",
      "requiredField": "El campo {field} es obligatorio",
      "email": "Por favor, introduzca una direccion de correo electronico valida",
      "password": {
        "required": "La contrasena es obligatoria",
        "tooShort": "La contrasena debe tener al menos {min} caracteres",
        "tooWeak": "La contrasena debe incluir mayusculas, minusculas y numeros",
        "mismatch": "Las contrasenas no coinciden"
      },
      "maxLength": "Maximo {max} caracteres permitidos",
      "minLength": "Minimo {min} caracteres requeridos",
      "invalidFormat": "Formato invalido",
      "invalidUrl": "Por favor, introduzca una URL valida",
      "invalidPhone": "Por favor, introduzca un numero de telefono valido"
    },
    "api": {
      "generic": "Algo salio mal. Por favor, intentelo de nuevo.",
      "badRequest": "Datos de solicitud invalidos",
      "notFound": "El recurso solicitado no se encontro",
      "unauthorized": "Se requiere autenticacion",
      "forbidden": "Acceso denegado",
      "conflict": "Este recurso ya existe",
      "rateLimited": "Demasiadas solicitudes. Por favor, intentelo mas tarde.",
      "serverError": "Error del servidor. Por favor, intentelo mas tarde.",
      "serviceUnavailable": "Servicio temporalmente no disponible",
      "timeout": "Tiempo de espera agotado. Por favor, intentelo de nuevo."
    },
    "network": {
      "offline": "Parece que esta sin conexion. Por favor, verifique su conexion.",
      "connectionFailed": "No se pudo conectar al servidor",
      "slowConnection": "La conexion es lenta. Esto puede tardar un momento."
    },
    "auth": {
      "invalidCredentials": "Correo electronico o contrasena invalidos",
      "emailNotVerified": "Por favor, verifique su direccion de correo electronico",
      "sessionExpired": "Su sesion ha expirado. Por favor, inicie sesion de nuevo.",
      "accountLocked": "La cuenta ha sido bloqueada. Contacte con soporte.",
      "accessDenied": "Acceso denegado a este recurso",
      "oauthExpired": "Sesion OAuth expirada. Por favor, inicie sesion con Google de nuevo.",
      "oauthConflict": "Conflicto de registro OAuth. La cuenta puede que ya exista.",
      "oauthFailed": "Error en la autenticacion OAuth. Por favor, intentelo de nuevo."
    },
    "permission": {
      "denied": "No tiene permiso para realizar esta accion",
      "insufficientPrivileges": "Privilegios insuficientes para esta operacion"
    },
    "file": {
      "tooLarge": "El tamano del archivo supera el limite de {max}MB",
      "invalidType": "Tipo de archivo invalido. Permitidos: {types}",
      "uploadFailed": "Error al subir el archivo. Por favor, intentelo de nuevo."
    },
    "item": {
      "notFound": "Articulo no encontrado",
      "createFailed": "Error al crear el articulo",
      "updateFailed": "Error al actualizar el articulo",
      "deleteFailed": "Error al eliminar el articulo",
      "duplicateName": "Ya existe un articulo con este nombre"
    },
    "property": {
      "notFound": "Propiedad no encontrada",
      "createFailed": "Error al crear la propiedad",
      "updateFailed": "Error al actualizar la propiedad",
      "deleteFailed": "Error al eliminar la propiedad"
    },
    "nextSteps": {
      "tryAgain": "Por favor, intentelo de nuevo",
      "checkConnection": "Verifique su conexion a Internet e intentelo de nuevo",
      "contactSupport": "Si el problema persiste, contacte con soporte",
      "refreshPage": "Intente actualizar la pagina",
      "loginAgain": "Por favor, inicie sesion de nuevo",
      "goToLogin": "Haga clic en 'Ir a Iniciar sesion' para acceder a su cuenta",
      "checkInput": "Revise sus datos y corrija los errores",
      "verifyEmail": "Verifique su codigo de acceso y correo electronico, o solicite una nueva invitacion",
      "restartOauth": "Haga clic en 'Continuar con Google' para reiniciar el proceso OAuth"
    },
    "boundary": {
      "title": "Algo salio mal",
      "description": "Se produjo un error inesperado al cargar esta seccion.",
      "retry": "Reintentar",
      "reload": "Recargar pagina",
      "goBack": "Volver",
      "reportIssue": "Reportar problema"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All English keys have corresponding Spanish translations
- [ ] Formal register used appropriately
- [ ] All {placeholder} variables preserved exactly
- [ ] Professional tone maintained throughout
- [ ] JSON structure valid

---

### Task 3: Generate German (de) Translations

**File:** `/messages/de.json`

Create the complete `errors` namespace in German:

```json
{
  "errors": {
    "form": {
      "required": "Dieses Feld ist erforderlich",
      "requiredField": "Das Feld {field} ist erforderlich",
      "email": "Bitte geben Sie eine gultige E-Mail-Adresse ein",
      "password": {
        "required": "Passwort ist erforderlich",
        "tooShort": "Das Passwort muss mindestens {min} Zeichen lang sein",
        "tooWeak": "Das Passwort muss Grossbuchstaben, Kleinbuchstaben und Zahlen enthalten",
        "mismatch": "Die Passworter stimmen nicht uberein"
      },
      "maxLength": "Maximal {max} Zeichen erlaubt",
      "minLength": "Mindestens {min} Zeichen erforderlich",
      "invalidFormat": "Ungultiges Format",
      "invalidUrl": "Bitte geben Sie eine gultige URL ein",
      "invalidPhone": "Bitte geben Sie eine gultige Telefonnummer ein"
    },
    "api": {
      "generic": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      "badRequest": "Ungultige Anfragedaten",
      "notFound": "Die angeforderte Ressource wurde nicht gefunden",
      "unauthorized": "Authentifizierung erforderlich",
      "forbidden": "Zugriff verweigert",
      "conflict": "Diese Ressource existiert bereits",
      "rateLimited": "Zu viele Anfragen. Bitte versuchen Sie es spater erneut.",
      "serverError": "Serverfehler. Bitte versuchen Sie es spater erneut.",
      "serviceUnavailable": "Dienst vorubergehend nicht verfugbar",
      "timeout": "Zeituberschreitung bei der Anfrage. Bitte versuchen Sie es erneut."
    },
    "network": {
      "offline": "Sie scheinen offline zu sein. Bitte uberprufen Sie Ihre Verbindung.",
      "connectionFailed": "Verbindung zum Server konnte nicht hergestellt werden",
      "slowConnection": "Die Verbindung ist langsam. Dies kann einen Moment dauern."
    },
    "auth": {
      "invalidCredentials": "Ungultige E-Mail-Adresse oder Passwort",
      "emailNotVerified": "Bitte bestatigen Sie Ihre E-Mail-Adresse",
      "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      "accountLocked": "Das Konto wurde gesperrt. Kontaktieren Sie den Support.",
      "accessDenied": "Zugriff auf diese Ressource verweigert",
      "oauthExpired": "OAuth-Sitzung abgelaufen. Bitte melden Sie sich erneut mit Google an.",
      "oauthConflict": "OAuth-Registrierungskonflikt. Das Konto existiert moglicherweise bereits.",
      "oauthFailed": "OAuth-Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut."
    },
    "permission": {
      "denied": "Sie haben keine Berechtigung, diese Aktion auszufuhren",
      "insufficientPrivileges": "Unzureichende Berechtigungen fur diesen Vorgang"
    },
    "file": {
      "tooLarge": "Die Dateigrosse uberschreitet das Limit von {max}MB",
      "invalidType": "Ungultiger Dateityp. Erlaubt: {types}",
      "uploadFailed": "Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut."
    },
    "item": {
      "notFound": "Artikel nicht gefunden",
      "createFailed": "Artikel konnte nicht erstellt werden",
      "updateFailed": "Artikel konnte nicht aktualisiert werden",
      "deleteFailed": "Artikel konnte nicht geloscht werden",
      "duplicateName": "Ein Artikel mit diesem Namen existiert bereits"
    },
    "property": {
      "notFound": "Immobilie nicht gefunden",
      "createFailed": "Immobilie konnte nicht erstellt werden",
      "updateFailed": "Immobilie konnte nicht aktualisiert werden",
      "deleteFailed": "Immobilie konnte nicht geloscht werden"
    },
    "nextSteps": {
      "tryAgain": "Bitte versuchen Sie es erneut",
      "checkConnection": "Uberprufen Sie Ihre Internetverbindung und versuchen Sie es erneut",
      "contactSupport": "Wenn das Problem weiterhin besteht, kontaktieren Sie bitte den Support",
      "refreshPage": "Versuchen Sie, die Seite zu aktualisieren",
      "loginAgain": "Bitte melden Sie sich erneut an",
      "goToLogin": "Klicken Sie auf 'Zur Anmeldung', um auf Ihr Konto zuzugreifen",
      "checkInput": "Uberprufen Sie Ihre Eingaben und korrigieren Sie etwaige Fehler",
      "verifyEmail": "Uberprufen Sie Ihren Zugangscode und Ihre E-Mail oder fordern Sie eine neue Einladung an",
      "restartOauth": "Klicken Sie auf 'Mit Google fortfahren', um den OAuth-Prozess neu zu starten"
    },
    "boundary": {
      "title": "Etwas ist schiefgelaufen",
      "description": "Beim Laden dieses Bereichs ist ein unerwarteter Fehler aufgetreten.",
      "retry": "Erneut versuchen",
      "reload": "Seite neu laden",
      "goBack": "Zuruck",
      "reportIssue": "Problem melden"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All English keys have corresponding German translations
- [ ] Formal register (Sie) used consistently
- [ ] All {placeholder} variables preserved exactly
- [ ] Professional tone maintained throughout
- [ ] JSON structure valid

---

### Task 4: Generate Dutch (nl) Translations

**File:** `/messages/nl.json`

Create the complete `errors` namespace in Dutch:

```json
{
  "errors": {
    "form": {
      "required": "Dit veld is verplicht",
      "requiredField": "Het veld {field} is verplicht",
      "email": "Voer een geldig e-mailadres in",
      "password": {
        "required": "Wachtwoord is verplicht",
        "tooShort": "Het wachtwoord moet minimaal {min} tekens bevatten",
        "tooWeak": "Het wachtwoord moet hoofdletters, kleine letters en cijfers bevatten",
        "mismatch": "De wachtwoorden komen niet overeen"
      },
      "maxLength": "Maximaal {max} tekens toegestaan",
      "minLength": "Minimaal {min} tekens vereist",
      "invalidFormat": "Ongeldig formaat",
      "invalidUrl": "Voer een geldige URL in",
      "invalidPhone": "Voer een geldig telefoonnummer in"
    },
    "api": {
      "generic": "Er is iets misgegaan. Probeer het opnieuw.",
      "badRequest": "Ongeldige aanvraaggegevens",
      "notFound": "De gevraagde bron is niet gevonden",
      "unauthorized": "Authenticatie vereist",
      "forbidden": "Toegang geweigerd",
      "conflict": "Deze bron bestaat al",
      "rateLimited": "Te veel aanvragen. Probeer het later opnieuw.",
      "serverError": "Serverfout. Probeer het later opnieuw.",
      "serviceUnavailable": "Service tijdelijk niet beschikbaar",
      "timeout": "Aanvraag verlopen. Probeer het opnieuw."
    },
    "network": {
      "offline": "U lijkt offline te zijn. Controleer uw verbinding.",
      "connectionFailed": "Kan geen verbinding maken met de server",
      "slowConnection": "De verbinding is traag. Dit kan even duren."
    },
    "auth": {
      "invalidCredentials": "Ongeldig e-mailadres of wachtwoord",
      "emailNotVerified": "Verifieer uw e-mailadres",
      "sessionExpired": "Uw sessie is verlopen. Meld u opnieuw aan.",
      "accountLocked": "Account is vergrendeld. Neem contact op met ondersteuning.",
      "accessDenied": "Toegang tot deze bron geweigerd",
      "oauthExpired": "OAuth-sessie verlopen. Meld u opnieuw aan met Google.",
      "oauthConflict": "OAuth-registratieconflict. Account bestaat mogelijk al.",
      "oauthFailed": "OAuth-authenticatie mislukt. Probeer het opnieuw."
    },
    "permission": {
      "denied": "U heeft geen toestemming om deze actie uit te voeren",
      "insufficientPrivileges": "Onvoldoende rechten voor deze bewerking"
    },
    "file": {
      "tooLarge": "Bestandsgrootte overschrijdt de limiet van {max}MB",
      "invalidType": "Ongeldig bestandstype. Toegestaan: {types}",
      "uploadFailed": "Uploaden mislukt. Probeer het opnieuw."
    },
    "item": {
      "notFound": "Item niet gevonden",
      "createFailed": "Item aanmaken mislukt",
      "updateFailed": "Item bijwerken mislukt",
      "deleteFailed": "Item verwijderen mislukt",
      "duplicateName": "Een item met deze naam bestaat al"
    },
    "property": {
      "notFound": "Eigendom niet gevonden",
      "createFailed": "Eigendom aanmaken mislukt",
      "updateFailed": "Eigendom bijwerken mislukt",
      "deleteFailed": "Eigendom verwijderen mislukt"
    },
    "nextSteps": {
      "tryAgain": "Probeer het opnieuw",
      "checkConnection": "Controleer uw internetverbinding en probeer het opnieuw",
      "contactSupport": "Als het probleem aanhoudt, neem dan contact op met ondersteuning",
      "refreshPage": "Probeer de pagina te vernieuwen",
      "loginAgain": "Meld u opnieuw aan",
      "goToLogin": "Klik op 'Ga naar Inloggen' om toegang te krijgen tot uw account",
      "checkInput": "Controleer uw invoer en corrigeer eventuele fouten",
      "verifyEmail": "Verifieer uw toegangscode en e-mailadres, of vraag een nieuwe uitnodiging aan",
      "restartOauth": "Klik op 'Doorgaan met Google' om het OAuth-proces opnieuw te starten"
    },
    "boundary": {
      "title": "Er is iets misgegaan",
      "description": "Er is een onverwachte fout opgetreden bij het laden van deze sectie.",
      "retry": "Opnieuw proberen",
      "reload": "Pagina herladen",
      "goBack": "Terug",
      "reportIssue": "Probleem melden"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All English keys have corresponding Dutch translations
- [ ] Formal register (u) used consistently
- [ ] All {placeholder} variables preserved exactly
- [ ] Professional tone maintained throughout
- [ ] JSON structure valid

---

### Task 5: Generate Italian (it) Translations

**File:** `/messages/it.json`

Create the complete `errors` namespace in Italian:

```json
{
  "errors": {
    "form": {
      "required": "Questo campo e obbligatorio",
      "requiredField": "Il campo {field} e obbligatorio",
      "email": "Inserisci un indirizzo e-mail valido",
      "password": {
        "required": "La password e obbligatoria",
        "tooShort": "La password deve contenere almeno {min} caratteri",
        "tooWeak": "La password deve includere maiuscole, minuscole e numeri",
        "mismatch": "Le password non corrispondono"
      },
      "maxLength": "Massimo {max} caratteri consentiti",
      "minLength": "Minimo {min} caratteri richiesti",
      "invalidFormat": "Formato non valido",
      "invalidUrl": "Inserisci un URL valido",
      "invalidPhone": "Inserisci un numero di telefono valido"
    },
    "api": {
      "generic": "Si e verificato un errore. Riprova.",
      "badRequest": "Dati della richiesta non validi",
      "notFound": "La risorsa richiesta non e stata trovata",
      "unauthorized": "Autenticazione richiesta",
      "forbidden": "Accesso negato",
      "conflict": "Questa risorsa esiste gia",
      "rateLimited": "Troppe richieste. Riprova piu tardi.",
      "serverError": "Errore del server. Riprova piu tardi.",
      "serviceUnavailable": "Servizio temporaneamente non disponibile",
      "timeout": "Richiesta scaduta. Riprova."
    },
    "network": {
      "offline": "Sembra che tu sia offline. Verifica la tua connessione.",
      "connectionFailed": "Impossibile connettersi al server",
      "slowConnection": "La connessione e lenta. Potrebbe richiedere qualche istante."
    },
    "auth": {
      "invalidCredentials": "E-mail o password non validi",
      "emailNotVerified": "Verifica il tuo indirizzo e-mail",
      "sessionExpired": "La sessione e scaduta. Accedi nuovamente.",
      "accountLocked": "L'account e stato bloccato. Contatta l'assistenza.",
      "accessDenied": "Accesso negato a questa risorsa",
      "oauthExpired": "Sessione OAuth scaduta. Accedi nuovamente con Google.",
      "oauthConflict": "Conflitto di registrazione OAuth. L'account potrebbe gia esistere.",
      "oauthFailed": "Autenticazione OAuth non riuscita. Riprova."
    },
    "permission": {
      "denied": "Non hai il permesso di eseguire questa azione",
      "insufficientPrivileges": "Privilegi insufficienti per questa operazione"
    },
    "file": {
      "tooLarge": "La dimensione del file supera il limite di {max}MB",
      "invalidType": "Tipo di file non valido. Consentiti: {types}",
      "uploadFailed": "Caricamento non riuscito. Riprova."
    },
    "item": {
      "notFound": "Articolo non trovato",
      "createFailed": "Creazione dell'articolo non riuscita",
      "updateFailed": "Aggiornamento dell'articolo non riuscito",
      "deleteFailed": "Eliminazione dell'articolo non riuscita",
      "duplicateName": "Esiste gia un articolo con questo nome"
    },
    "property": {
      "notFound": "Proprieta non trovata",
      "createFailed": "Creazione della proprieta non riuscita",
      "updateFailed": "Aggiornamento della proprieta non riuscito",
      "deleteFailed": "Eliminazione della proprieta non riuscita"
    },
    "nextSteps": {
      "tryAgain": "Riprova",
      "checkConnection": "Verifica la tua connessione Internet e riprova",
      "contactSupport": "Se il problema persiste, contatta l'assistenza",
      "refreshPage": "Prova ad aggiornare la pagina",
      "loginAgain": "Accedi nuovamente",
      "goToLogin": "Clicca su 'Vai al Login' per accedere al tuo account",
      "checkInput": "Controlla i tuoi dati e correggi eventuali errori",
      "verifyEmail": "Verifica il tuo codice di accesso e l'e-mail, oppure richiedi un nuovo invito",
      "restartOauth": "Clicca su 'Continua con Google' per riavviare il processo OAuth"
    },
    "boundary": {
      "title": "Si e verificato un errore",
      "description": "Si e verificato un errore imprevisto durante il caricamento di questa sezione.",
      "retry": "Riprova",
      "reload": "Ricarica pagina",
      "goBack": "Indietro",
      "reportIssue": "Segnala problema"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All English keys have corresponding Italian translations
- [ ] Formal register (Lei) used appropriately
- [ ] All {placeholder} variables preserved exactly
- [ ] Professional tone maintained throughout
- [ ] JSON structure valid

---

### Task 6: Validate Translation Completeness

Run validation to ensure all translations are complete and consistent.

**Validation Script:** `/scripts/i18n-check.ts`

```typescript
/**
 * Translation completeness validation
 * Run: npx tsx scripts/i18n-check.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = './messages';
const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

function getAllKeys(obj: object, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function validateTranslations() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Load English as reference
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const enKeys = getAllKeys(enContent.errors).map(k => `errors.${k}`);

  console.log(`\nValidating ${enKeys.length} error translation keys...\n`);

  for (const locale of SUPPORTED_LOCALES.filter(l => l !== 'en')) {
    const localePath = path.join(MESSAGES_DIR, `${locale}.json`);

    if (!fs.existsSync(localePath)) {
      errors.push(`Missing translation file: ${locale}.json`);
      continue;
    }

    const localeContent = JSON.parse(fs.readFileSync(localePath, 'utf-8'));

    if (!localeContent.errors) {
      errors.push(`${locale}: Missing 'errors' namespace`);
      continue;
    }

    const localeKeys = getAllKeys(localeContent.errors).map(k => `errors.${k}`);

    // Check for missing keys
    for (const key of enKeys) {
      if (!localeKeys.includes(key)) {
        errors.push(`${locale}: Missing key '${key}'`);
      }
    }

    // Check for extra keys
    for (const key of localeKeys) {
      if (!enKeys.includes(key)) {
        warnings.push(`${locale}: Extra key '${key}' not in English`);
      }
    }

    // Check placeholder preservation
    for (const key of enKeys) {
      const enValue = getNestedValue(enContent, key);
      const localeValue = getNestedValue(localeContent, key);

      if (typeof enValue === 'string' && typeof localeValue === 'string') {
        const enPlaceholders = enValue.match(/\{[^}]+\}/g) || [];
        const localePlaceholders = localeValue.match(/\{[^}]+\}/g) || [];

        const enSet = new Set(enPlaceholders);
        const localeSet = new Set(localePlaceholders);

        for (const ph of enPlaceholders) {
          if (!localeSet.has(ph)) {
            errors.push(`${locale}: Missing placeholder ${ph} in '${key}'`);
          }
        }
      }
    }
  }

  // Report results
  if (errors.length > 0) {
    console.log('ERRORS:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\nWARNINGS:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('All translations validated successfully!');
  }

  return errors.length === 0;
}

function getNestedValue(obj: object, path: string): unknown {
  return path.split('.').reduce((current, key) =>
    current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined,
    obj as unknown
  );
}

const success = validateTranslations();
process.exit(success ? 0 : 1);
```

**Acceptance Criteria:**
- [ ] Validation script created
- [ ] All 5 language files pass validation
- [ ] No missing keys detected
- [ ] All placeholders preserved correctly
- [ ] No JSON syntax errors

---

### Task 7: Visual Validation in Each Language

Manually test error messages in the application for each language.

**Test Scenarios:**

| Scenario | Expected Behavior |
|----------|-------------------|
| Switch language to French | All error messages display in French |
| Trigger form validation error | Error displays in selected language |
| Trigger API 404 error | "Resource not found" message in selected language |
| Trigger network offline error | Offline message displays correctly |
| View error boundary fallback | Error boundary text in selected language |
| Test password validation | Password requirements in selected language |

**Acceptance Criteria:**
- [ ] All error messages display correctly in French
- [ ] All error messages display correctly in Spanish
- [ ] All error messages display correctly in German
- [ ] All error messages display correctly in Dutch
- [ ] All error messages display correctly in Italian
- [ ] No text overflow or truncation issues
- [ ] Placeholder substitution works correctly in all languages

---

## Authorized Files and Functions for Modification

### Files to Create/Modify

| File Path | Change Type | Purpose |
|-----------|-------------|---------|
| `/messages/fr.json` | Create or Extend | Add French `errors` namespace |
| `/messages/es.json` | Create or Extend | Add Spanish `errors` namespace |
| `/messages/de.json` | Create or Extend | Add German `errors` namespace |
| `/messages/nl.json` | Create or Extend | Add Dutch `errors` namespace |
| `/messages/it.json` | Create or Extend | Add Italian `errors` namespace |
| `/scripts/i18n-check.ts` | Create | Translation validation script |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/messages/en.json` | English source already complete from previous tasks |
| `/src/lib/i18n/error-messages.ts` | Utility already complete from Task 2J.4 |
| `/src/types/index.ts` | Types already complete from Task 2J.4 |
| Component files | Not modifying code, only adding translations |

---

## Dependencies

### Must Complete Before This Task

| Task ID | Description | Status |
|---------|-------------|--------|
| 2J.1 | Create `errors` namespace structure | Must be complete |
| 2J.4 | Create centralized error message utility | Must be complete |
| 2H.10 | Generate common namespace translations | Recommended |

### Depends on This Task

| Task ID | Description |
|---------|-------------|
| None | This is the final task in Sub-Epic 2J |

---

## Testing Strategy

### Automated Tests

1. **Translation Completeness Check**
   - Run `/scripts/i18n-check.ts` to verify all keys exist
   - Verify placeholder preservation

2. **JSON Validation**
   - All files must be valid JSON
   - No syntax errors

### Manual Tests

1. **Language Switching**
   - Switch to each language and trigger various error scenarios
   - Verify messages display correctly

2. **Placeholder Substitution**
   - Test errors with dynamic values (e.g., "{field} is required")
   - Verify correct substitution in all languages

3. **Visual Inspection**
   - Check for text overflow
   - Verify appropriate line breaks
   - Ensure no truncation

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation inaccuracy | Medium | Medium | Use AI with domain context; flag for human review |
| Missing placeholders | Low | High | Automated validation in Task 6 |
| Cultural inappropriateness | Low | Medium | Use formal register; avoid colloquialisms |
| JSON syntax errors | Low | High | Validate JSON before committing |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding; test accented characters |

---

## Rollback Plan

If translation quality issues are discovered post-deployment:

1. **Quick Fix:** Correct individual keys in affected language files
2. **Partial Rollback:** Revert specific language file to previous version
3. **Full Rollback:** Restore all translation files from backup

---

## Acceptance Criteria Summary

- [ ] French (`fr.json`) contains complete `errors` namespace with all translations
- [ ] Spanish (`es.json`) contains complete `errors` namespace with all translations
- [ ] German (`de.json`) contains complete `errors` namespace with all translations
- [ ] Dutch (`nl.json`) contains complete `errors` namespace with all translations
- [ ] Italian (`it.json`) contains complete `errors` namespace with all translations
- [ ] All {placeholder} variables preserved correctly in all languages
- [ ] Validation script passes for all languages
- [ ] No JSON syntax errors in any file
- [ ] Translations use natural, idiomatic phrasing (not literal translation)
- [ ] Professional tone maintained across all languages
- [ ] Error messages display correctly in UI for all languages
- [ ] No text overflow or layout issues in any language

---

## References

- [Plan-111: L10N Epic 2 Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan-110: L10N Epic 1 Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-315: Create Errors Namespace Structure](/docs/REQ-315-create-errors-namespace-structure-in-translation-file-overview.md)
- [REQ-318: Create Centralized Error Message Utility](/docs/REQ-318-create-centralized-error-message-utility-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
