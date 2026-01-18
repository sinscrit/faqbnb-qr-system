# REQ-233: Create Initial Translation File Structure - Detailed Task Breakdown

**Generated:** 2026-01-18 01:30:00 UTC
**Last Modified:** 2026-01-18 01:30:00 UTC
**Request Reference:** REQ-233 - Initial Translation File Structure with Namespace Organization
**Overview Document:** REQ-233-create-initial-translation-file-structure-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.5)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating the initial translation file structure for the FAQBNB application. The work involves populating the `/messages/` directory with comprehensive JSON translation files for 6 locales (en, fr, es, de, nl, it), organized by functional namespaces (common, auth, dashboard, items, errors, language).

**Total Estimated Tasks:** 12 tasks
**Estimated Story Points:** 8 SP total (each task ~1 SP or less)

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites are complete:

| Prerequisite | Verification Command | Expected Result |
|--------------|---------------------|-----------------|
| next-intl installed | `npm list next-intl` | Shows next-intl@3.x.x |
| /messages/ directory exists | `ls -la messages/` | Directory exists |
| Task 2.1 (REQ-229) complete | Check docs for completion | Marked complete |

```bash
# Quick verification script
npm list next-intl && ls -la messages/ && echo "Prerequisites verified"
```

---

## Task Breakdown

### Task 2.5.1: Create comprehensive English translation file (en.json)

**Story Points:** 1 SP
**Priority:** P0 - Critical (Source of truth for all other locales)
**Dependencies:** None (first task)

#### Description
Create the complete English translation file with all 6 namespaces containing comprehensive keys for the FAQBNB application.

#### Implementation Steps

1. **Navigate to messages directory:**
   ```bash
   ls messages/
   ```

2. **Create or replace `/messages/en.json`** with the following content:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "close": "Close",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "actions": "Actions",
    "yes": "Yes",
    "no": "No",
    "submit": "Submit",
    "reset": "Reset",
    "clear": "Clear",
    "select": "Select",
    "view": "View",
    "download": "Download",
    "upload": "Upload",
    "copy": "Copy",
    "share": "Share",
    "more": "More",
    "less": "Less",
    "all": "All",
    "none": "None",
    "optional": "Optional",
    "required": "Required"
  },
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
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
    "loggedInAs": "Logged in as"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "properties": "Properties",
    "items": "Items",
    "analytics": "Analytics",
    "settings": "Settings",
    "recentActivity": "Recent Activity",
    "quickActions": "Quick Actions",
    "totalProperties": "Total Properties",
    "totalItems": "Total Items",
    "totalScans": "Total Scans",
    "activeUsers": "Active Users",
    "overview": "Overview",
    "createProperty": "Create Property",
    "createItem": "Create Item",
    "viewAll": "View All",
    "noActivity": "No recent activity"
  },
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "addArticle": "Add Article",
    "editItem": "Edit Item",
    "deleteItem": "Delete Item",
    "viewItem": "View Item",
    "printQrCode": "Print QR Code",
    "downloadQrCode": "Download QR Code",
    "scanCount": "Scan Count",
    "lastScanned": "Last Scanned",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "selectProperty": "Select Property",
    "itemDetails": "Item Details",
    "noArticles": "No articles yet",
    "addFirstArticle": "Add your first article",
    "room": "Room",
    "tags": "Tags",
    "addTag": "Add Tag",
    "removeTag": "Remove Tag"
  },
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
  },
  "language": {
    "select": "Select Language",
    "current": "Current Language",
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "nl": "Dutch",
    "it": "Italian",
    "changeLanguage": "Change Language",
    "languageChanged": "Language changed successfully"
  }
}
```

3. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/en.json > /dev/null && echo "en.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/en.json` file exists
- [ ] File contains all 6 namespaces: common, auth, dashboard, items, errors, language
- [ ] JSON is syntactically valid
- [ ] Total key count: ~115 keys

#### Verification
```bash
cat messages/en.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
namespaces = sorted(d.keys())
total = sum(len(d[ns]) for ns in d)
print(f'Namespaces: {namespaces}')
print(f'Total keys: {total}')
required = {'common', 'auth', 'dashboard', 'items', 'errors', 'language'}
if set(namespaces) == required:
    print('All required namespaces present')
else:
    print(f'Missing: {required - set(namespaces)}')
"
```

---

### Task 2.5.2: Create French translation file (fr.json)

**Story Points:** 1 SP
**Priority:** P1 - High
**Dependencies:** Task 2.5.1 (en.json must exist as reference)

#### Description
Create the complete French translation file with all keys translated from English.

#### Implementation Steps

1. **Create `/messages/fr.json`** with the following content:

```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Creer",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succes",
    "confirm": "Confirmer",
    "back": "Retour",
    "next": "Suivant",
    "close": "Fermer",
    "search": "Rechercher",
    "filter": "Filtrer",
    "sort": "Trier",
    "actions": "Actions",
    "yes": "Oui",
    "no": "Non",
    "submit": "Soumettre",
    "reset": "Reinitialiser",
    "clear": "Effacer",
    "select": "Selectionner",
    "view": "Voir",
    "download": "Telecharger",
    "upload": "Envoyer",
    "copy": "Copier",
    "share": "Partager",
    "more": "Plus",
    "less": "Moins",
    "all": "Tout",
    "none": "Aucun",
    "optional": "Facultatif",
    "required": "Requis"
  },
  "auth": {
    "signIn": "Se connecter",
    "signOut": "Se deconnecter",
    "signUp": "S'inscrire",
    "email": "E-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublie ?",
    "resetPassword": "Reinitialiser le mot de passe",
    "continueWithGoogle": "Continuer avec Google",
    "rememberMe": "Se souvenir de moi",
    "noAccount": "Vous n'avez pas de compte ?",
    "hasAccount": "Vous avez deja un compte ?",
    "createAccount": "Creer un compte",
    "verifyEmail": "Verifier l'e-mail",
    "resendVerification": "Renvoyer la verification",
    "welcomeBack": "Bon retour",
    "loggedInAs": "Connecte en tant que"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bon retour",
    "properties": "Proprietes",
    "items": "Articles",
    "analytics": "Analytique",
    "settings": "Parametres",
    "recentActivity": "Activite recente",
    "quickActions": "Actions rapides",
    "totalProperties": "Total des proprietes",
    "totalItems": "Total des articles",
    "totalScans": "Total des scans",
    "activeUsers": "Utilisateurs actifs",
    "overview": "Apercu",
    "createProperty": "Creer une propriete",
    "createItem": "Creer un article",
    "viewAll": "Voir tout",
    "noActivity": "Aucune activite recente"
  },
  "items": {
    "createNew": "Nouveau code QR",
    "noItems": "Aucun article",
    "name": "Nom de l'article",
    "description": "Description",
    "property": "Propriete",
    "qrCode": "Code QR",
    "articles": "Articles",
    "addArticle": "Ajouter un article",
    "editItem": "Modifier l'article",
    "deleteItem": "Supprimer l'article",
    "viewItem": "Voir l'article",
    "printQrCode": "Imprimer le code QR",
    "downloadQrCode": "Telecharger le code QR",
    "scanCount": "Nombre de scans",
    "lastScanned": "Dernier scan",
    "createdAt": "Cree le",
    "updatedAt": "Mis a jour le",
    "selectProperty": "Selectionner une propriete",
    "itemDetails": "Details de l'article",
    "noArticles": "Aucun article",
    "addFirstArticle": "Ajoutez votre premier article",
    "room": "Piece",
    "tags": "Etiquettes",
    "addTag": "Ajouter une etiquette",
    "removeTag": "Supprimer l'etiquette"
  },
  "errors": {
    "required": "Ce champ est requis",
    "invalidEmail": "Adresse e-mail invalide",
    "networkError": "Erreur reseau. Veuillez reessayer.",
    "unauthorized": "Vous n'etes pas autorise a effectuer cette action",
    "notFound": "La ressource demandee n'a pas ete trouvee",
    "serverError": "Erreur serveur. Veuillez reessayer plus tard.",
    "validationFailed": "Validation echouee. Veuillez verifier vos donnees.",
    "sessionExpired": "Votre session a expire. Veuillez vous reconnecter.",
    "tooManyRequests": "Trop de requetes. Veuillez patienter.",
    "invalidCredentials": "E-mail ou mot de passe invalide",
    "emailTaken": "Cet e-mail est deja enregistre",
    "passwordTooWeak": "Le mot de passe doit contenir au moins 8 caracteres",
    "uploadFailed": "Echec du telechargement. Veuillez reessayer.",
    "fileTooLarge": "Fichier trop volumineux",
    "invalidFileType": "Type de fichier invalide",
    "genericError": "Une erreur s'est produite. Veuillez reessayer."
  },
  "language": {
    "select": "Choisir la langue",
    "current": "Langue actuelle",
    "en": "Anglais",
    "fr": "Francais",
    "es": "Espagnol",
    "de": "Allemand",
    "nl": "Neerlandais",
    "it": "Italien",
    "changeLanguage": "Changer de langue",
    "languageChanged": "Langue changee avec succes"
  }
}
```

2. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/fr.json > /dev/null && echo "fr.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/fr.json` file exists
- [ ] File contains all 6 namespaces matching en.json structure
- [ ] JSON is syntactically valid
- [ ] All values are translated to French (not English placeholders)

#### Verification
```bash
cat messages/fr.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'Namespaces: {sorted(d.keys())}')
print(f'Sample - common.save: {d[\"common\"][\"save\"]}')
print(f'Sample - auth.signIn: {d[\"auth\"][\"signIn\"]}')
"
```

---

### Task 2.5.3: Create Spanish translation file (es.json)

**Story Points:** 1 SP
**Priority:** P1 - High
**Dependencies:** Task 2.5.1 (en.json must exist as reference)

#### Description
Create the complete Spanish translation file with all keys translated from English.

#### Implementation Steps

1. **Create `/messages/es.json`** with the following content:

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Exito",
    "confirm": "Confirmar",
    "back": "Atras",
    "next": "Siguiente",
    "close": "Cerrar",
    "search": "Buscar",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "actions": "Acciones",
    "yes": "Si",
    "no": "No",
    "submit": "Enviar",
    "reset": "Restablecer",
    "clear": "Borrar",
    "select": "Seleccionar",
    "view": "Ver",
    "download": "Descargar",
    "upload": "Subir",
    "copy": "Copiar",
    "share": "Compartir",
    "more": "Mas",
    "less": "Menos",
    "all": "Todo",
    "none": "Ninguno",
    "optional": "Opcional",
    "required": "Requerido"
  },
  "auth": {
    "signIn": "Iniciar sesion",
    "signOut": "Cerrar sesion",
    "signUp": "Registrarse",
    "email": "Correo electronico",
    "password": "Contrasena",
    "forgotPassword": "Olvidaste tu contrasena?",
    "resetPassword": "Restablecer contrasena",
    "continueWithGoogle": "Continuar con Google",
    "rememberMe": "Recordarme",
    "noAccount": "No tienes una cuenta?",
    "hasAccount": "Ya tienes una cuenta?",
    "createAccount": "Crear cuenta",
    "verifyEmail": "Verificar correo",
    "resendVerification": "Reenviar verificacion",
    "welcomeBack": "Bienvenido de nuevo",
    "loggedInAs": "Conectado como"
  },
  "dashboard": {
    "title": "Panel de control",
    "welcome": "Bienvenido de nuevo",
    "properties": "Propiedades",
    "items": "Articulos",
    "analytics": "Analiticas",
    "settings": "Configuracion",
    "recentActivity": "Actividad reciente",
    "quickActions": "Acciones rapidas",
    "totalProperties": "Total de propiedades",
    "totalItems": "Total de articulos",
    "totalScans": "Total de escaneos",
    "activeUsers": "Usuarios activos",
    "overview": "Vista general",
    "createProperty": "Crear propiedad",
    "createItem": "Crear articulo",
    "viewAll": "Ver todo",
    "noActivity": "Sin actividad reciente"
  },
  "items": {
    "createNew": "Nuevo codigo QR",
    "noItems": "Sin articulos",
    "name": "Nombre del articulo",
    "description": "Descripcion",
    "property": "Propiedad",
    "qrCode": "Codigo QR",
    "articles": "Articulos",
    "addArticle": "Agregar articulo",
    "editItem": "Editar articulo",
    "deleteItem": "Eliminar articulo",
    "viewItem": "Ver articulo",
    "printQrCode": "Imprimir codigo QR",
    "downloadQrCode": "Descargar codigo QR",
    "scanCount": "Cantidad de escaneos",
    "lastScanned": "Ultimo escaneo",
    "createdAt": "Creado el",
    "updatedAt": "Actualizado el",
    "selectProperty": "Seleccionar propiedad",
    "itemDetails": "Detalles del articulo",
    "noArticles": "Sin articulos",
    "addFirstArticle": "Agrega tu primer articulo",
    "room": "Habitacion",
    "tags": "Etiquetas",
    "addTag": "Agregar etiqueta",
    "removeTag": "Eliminar etiqueta"
  },
  "errors": {
    "required": "Este campo es requerido",
    "invalidEmail": "Direccion de correo invalida",
    "networkError": "Error de red. Por favor intenta de nuevo.",
    "unauthorized": "No estas autorizado para realizar esta accion",
    "notFound": "El recurso solicitado no fue encontrado",
    "serverError": "Error del servidor. Por favor intenta mas tarde.",
    "validationFailed": "Validacion fallida. Por favor verifica tus datos.",
    "sessionExpired": "Tu sesion ha expirado. Por favor inicia sesion de nuevo.",
    "tooManyRequests": "Demasiadas solicitudes. Por favor espera un momento.",
    "invalidCredentials": "Correo o contrasena invalidos",
    "emailTaken": "Este correo ya esta registrado",
    "passwordTooWeak": "La contrasena debe tener al menos 8 caracteres",
    "uploadFailed": "Error al subir. Por favor intenta de nuevo.",
    "fileTooLarge": "El archivo es demasiado grande",
    "invalidFileType": "Tipo de archivo invalido",
    "genericError": "Algo salio mal. Por favor intenta de nuevo."
  },
  "language": {
    "select": "Seleccionar idioma",
    "current": "Idioma actual",
    "en": "Ingles",
    "fr": "Frances",
    "es": "Espanol",
    "de": "Aleman",
    "nl": "Holandes",
    "it": "Italiano",
    "changeLanguage": "Cambiar idioma",
    "languageChanged": "Idioma cambiado exitosamente"
  }
}
```

2. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/es.json > /dev/null && echo "es.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/es.json` file exists
- [ ] File contains all 6 namespaces matching en.json structure
- [ ] JSON is syntactically valid
- [ ] All values are translated to Spanish

---

### Task 2.5.4: Create German translation file (de.json)

**Story Points:** 1 SP
**Priority:** P1 - High
**Dependencies:** Task 2.5.1 (en.json must exist as reference)

#### Description
Create the complete German translation file with all keys translated from English.

#### Implementation Steps

1. **Create `/messages/de.json`** with the following content:

```json
{
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Loschen",
    "edit": "Bearbeiten",
    "create": "Erstellen",
    "loading": "Laden...",
    "error": "Fehler",
    "success": "Erfolg",
    "confirm": "Bestatigen",
    "back": "Zuruck",
    "next": "Weiter",
    "close": "Schliessen",
    "search": "Suchen",
    "filter": "Filtern",
    "sort": "Sortieren",
    "actions": "Aktionen",
    "yes": "Ja",
    "no": "Nein",
    "submit": "Absenden",
    "reset": "Zurucksetzen",
    "clear": "Loschen",
    "select": "Auswahlen",
    "view": "Ansehen",
    "download": "Herunterladen",
    "upload": "Hochladen",
    "copy": "Kopieren",
    "share": "Teilen",
    "more": "Mehr",
    "less": "Weniger",
    "all": "Alle",
    "none": "Keine",
    "optional": "Optional",
    "required": "Erforderlich"
  },
  "auth": {
    "signIn": "Anmelden",
    "signOut": "Abmelden",
    "signUp": "Registrieren",
    "email": "E-Mail",
    "password": "Passwort",
    "forgotPassword": "Passwort vergessen?",
    "resetPassword": "Passwort zurucksetzen",
    "continueWithGoogle": "Mit Google fortfahren",
    "rememberMe": "Angemeldet bleiben",
    "noAccount": "Noch kein Konto?",
    "hasAccount": "Bereits ein Konto?",
    "createAccount": "Konto erstellen",
    "verifyEmail": "E-Mail bestatigen",
    "resendVerification": "Bestatigung erneut senden",
    "welcomeBack": "Willkommen zuruck",
    "loggedInAs": "Angemeldet als"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Willkommen zuruck",
    "properties": "Immobilien",
    "items": "Artikel",
    "analytics": "Analysen",
    "settings": "Einstellungen",
    "recentActivity": "Letzte Aktivitat",
    "quickActions": "Schnellaktionen",
    "totalProperties": "Gesamte Immobilien",
    "totalItems": "Gesamte Artikel",
    "totalScans": "Gesamte Scans",
    "activeUsers": "Aktive Benutzer",
    "overview": "Ubersicht",
    "createProperty": "Immobilie erstellen",
    "createItem": "Artikel erstellen",
    "viewAll": "Alle anzeigen",
    "noActivity": "Keine aktuelle Aktivitat"
  },
  "items": {
    "createNew": "Neuer QR-Code",
    "noItems": "Keine Artikel",
    "name": "Artikelname",
    "description": "Beschreibung",
    "property": "Immobilie",
    "qrCode": "QR-Code",
    "articles": "Artikel",
    "addArticle": "Artikel hinzufugen",
    "editItem": "Artikel bearbeiten",
    "deleteItem": "Artikel loschen",
    "viewItem": "Artikel ansehen",
    "printQrCode": "QR-Code drucken",
    "downloadQrCode": "QR-Code herunterladen",
    "scanCount": "Anzahl Scans",
    "lastScanned": "Zuletzt gescannt",
    "createdAt": "Erstellt am",
    "updatedAt": "Aktualisiert am",
    "selectProperty": "Immobilie auswahlen",
    "itemDetails": "Artikeldetails",
    "noArticles": "Keine Artikel",
    "addFirstArticle": "Fugen Sie Ihren ersten Artikel hinzu",
    "room": "Raum",
    "tags": "Tags",
    "addTag": "Tag hinzufugen",
    "removeTag": "Tag entfernen"
  },
  "errors": {
    "required": "Dieses Feld ist erforderlich",
    "invalidEmail": "Ungultige E-Mail-Adresse",
    "networkError": "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzufuhren",
    "notFound": "Die angeforderte Ressource wurde nicht gefunden",
    "serverError": "Serverfehler. Bitte versuchen Sie es spater erneut.",
    "validationFailed": "Validierung fehlgeschlagen. Bitte uberprufen Sie Ihre Eingabe.",
    "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
    "tooManyRequests": "Zu viele Anfragen. Bitte warten Sie einen Moment.",
    "invalidCredentials": "Ungultige E-Mail oder Passwort",
    "emailTaken": "Diese E-Mail ist bereits registriert",
    "passwordTooWeak": "Das Passwort muss mindestens 8 Zeichen haben",
    "uploadFailed": "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "fileTooLarge": "Datei ist zu gross",
    "invalidFileType": "Ungultiger Dateityp",
    "genericError": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."
  },
  "language": {
    "select": "Sprache auswahlen",
    "current": "Aktuelle Sprache",
    "en": "Englisch",
    "fr": "Franzosisch",
    "es": "Spanisch",
    "de": "Deutsch",
    "nl": "Niederlandisch",
    "it": "Italienisch",
    "changeLanguage": "Sprache andern",
    "languageChanged": "Sprache erfolgreich geandert"
  }
}
```

2. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/de.json > /dev/null && echo "de.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/de.json` file exists
- [ ] File contains all 6 namespaces matching en.json structure
- [ ] JSON is syntactically valid
- [ ] All values are translated to German

---

### Task 2.5.5: Create Dutch translation file (nl.json)

**Story Points:** 1 SP
**Priority:** P1 - High
**Dependencies:** Task 2.5.1 (en.json must exist as reference)

#### Description
Create the complete Dutch translation file with all keys translated from English.

#### Implementation Steps

1. **Create `/messages/nl.json`** with the following content:

```json
{
  "common": {
    "save": "Opslaan",
    "cancel": "Annuleren",
    "delete": "Verwijderen",
    "edit": "Bewerken",
    "create": "Maken",
    "loading": "Laden...",
    "error": "Fout",
    "success": "Succes",
    "confirm": "Bevestigen",
    "back": "Terug",
    "next": "Volgende",
    "close": "Sluiten",
    "search": "Zoeken",
    "filter": "Filteren",
    "sort": "Sorteren",
    "actions": "Acties",
    "yes": "Ja",
    "no": "Nee",
    "submit": "Verzenden",
    "reset": "Resetten",
    "clear": "Wissen",
    "select": "Selecteren",
    "view": "Bekijken",
    "download": "Downloaden",
    "upload": "Uploaden",
    "copy": "Kopieren",
    "share": "Delen",
    "more": "Meer",
    "less": "Minder",
    "all": "Alles",
    "none": "Geen",
    "optional": "Optioneel",
    "required": "Verplicht"
  },
  "auth": {
    "signIn": "Inloggen",
    "signOut": "Uitloggen",
    "signUp": "Registreren",
    "email": "E-mail",
    "password": "Wachtwoord",
    "forgotPassword": "Wachtwoord vergeten?",
    "resetPassword": "Wachtwoord resetten",
    "continueWithGoogle": "Doorgaan met Google",
    "rememberMe": "Onthoud mij",
    "noAccount": "Nog geen account?",
    "hasAccount": "Heb je al een account?",
    "createAccount": "Account maken",
    "verifyEmail": "E-mail verifieren",
    "resendVerification": "Verificatie opnieuw versturen",
    "welcomeBack": "Welkom terug",
    "loggedInAs": "Ingelogd als"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welkom terug",
    "properties": "Eigendommen",
    "items": "Items",
    "analytics": "Analyses",
    "settings": "Instellingen",
    "recentActivity": "Recente activiteit",
    "quickActions": "Snelle acties",
    "totalProperties": "Totaal eigendommen",
    "totalItems": "Totaal items",
    "totalScans": "Totaal scans",
    "activeUsers": "Actieve gebruikers",
    "overview": "Overzicht",
    "createProperty": "Eigendom maken",
    "createItem": "Item maken",
    "viewAll": "Alles bekijken",
    "noActivity": "Geen recente activiteit"
  },
  "items": {
    "createNew": "Nieuwe QR-code",
    "noItems": "Geen items",
    "name": "Itemnaam",
    "description": "Beschrijving",
    "property": "Eigendom",
    "qrCode": "QR-code",
    "articles": "Artikelen",
    "addArticle": "Artikel toevoegen",
    "editItem": "Item bewerken",
    "deleteItem": "Item verwijderen",
    "viewItem": "Item bekijken",
    "printQrCode": "QR-code afdrukken",
    "downloadQrCode": "QR-code downloaden",
    "scanCount": "Aantal scans",
    "lastScanned": "Laatst gescand",
    "createdAt": "Gemaakt op",
    "updatedAt": "Bijgewerkt op",
    "selectProperty": "Eigendom selecteren",
    "itemDetails": "Itemdetails",
    "noArticles": "Geen artikelen",
    "addFirstArticle": "Voeg je eerste artikel toe",
    "room": "Kamer",
    "tags": "Tags",
    "addTag": "Tag toevoegen",
    "removeTag": "Tag verwijderen"
  },
  "errors": {
    "required": "Dit veld is verplicht",
    "invalidEmail": "Ongeldig e-mailadres",
    "networkError": "Netwerkfout. Probeer het opnieuw.",
    "unauthorized": "Je bent niet gemachtigd om deze actie uit te voeren",
    "notFound": "De gevraagde bron is niet gevonden",
    "serverError": "Serverfout. Probeer het later opnieuw.",
    "validationFailed": "Validatie mislukt. Controleer je invoer.",
    "sessionExpired": "Je sessie is verlopen. Log opnieuw in.",
    "tooManyRequests": "Te veel verzoeken. Wacht even.",
    "invalidCredentials": "Ongeldige e-mail of wachtwoord",
    "emailTaken": "Dit e-mailadres is al geregistreerd",
    "passwordTooWeak": "Wachtwoord moet minimaal 8 tekens bevatten",
    "uploadFailed": "Upload mislukt. Probeer het opnieuw.",
    "fileTooLarge": "Bestand is te groot",
    "invalidFileType": "Ongeldig bestandstype",
    "genericError": "Er is iets misgegaan. Probeer het opnieuw."
  },
  "language": {
    "select": "Taal selecteren",
    "current": "Huidige taal",
    "en": "Engels",
    "fr": "Frans",
    "es": "Spaans",
    "de": "Duits",
    "nl": "Nederlands",
    "it": "Italiaans",
    "changeLanguage": "Taal wijzigen",
    "languageChanged": "Taal succesvol gewijzigd"
  }
}
```

2. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/nl.json > /dev/null && echo "nl.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/nl.json` file exists
- [ ] File contains all 6 namespaces matching en.json structure
- [ ] JSON is syntactically valid
- [ ] All values are translated to Dutch

---

### Task 2.5.6: Create Italian translation file (it.json)

**Story Points:** 1 SP
**Priority:** P1 - High
**Dependencies:** Task 2.5.1 (en.json must exist as reference)

#### Description
Create the complete Italian translation file with all keys translated from English.

#### Implementation Steps

1. **Create `/messages/it.json`** with the following content:

```json
{
  "common": {
    "save": "Salva",
    "cancel": "Annulla",
    "delete": "Elimina",
    "edit": "Modifica",
    "create": "Crea",
    "loading": "Caricamento...",
    "error": "Errore",
    "success": "Successo",
    "confirm": "Conferma",
    "back": "Indietro",
    "next": "Avanti",
    "close": "Chiudi",
    "search": "Cerca",
    "filter": "Filtra",
    "sort": "Ordina",
    "actions": "Azioni",
    "yes": "Si",
    "no": "No",
    "submit": "Invia",
    "reset": "Reimposta",
    "clear": "Cancella",
    "select": "Seleziona",
    "view": "Visualizza",
    "download": "Scarica",
    "upload": "Carica",
    "copy": "Copia",
    "share": "Condividi",
    "more": "Di piu",
    "less": "Meno",
    "all": "Tutto",
    "none": "Nessuno",
    "optional": "Facoltativo",
    "required": "Obbligatorio"
  },
  "auth": {
    "signIn": "Accedi",
    "signOut": "Esci",
    "signUp": "Registrati",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Password dimenticata?",
    "resetPassword": "Reimposta password",
    "continueWithGoogle": "Continua con Google",
    "rememberMe": "Ricordami",
    "noAccount": "Non hai un account?",
    "hasAccount": "Hai gia un account?",
    "createAccount": "Crea account",
    "verifyEmail": "Verifica email",
    "resendVerification": "Reinvia verifica",
    "welcomeBack": "Bentornato",
    "loggedInAs": "Connesso come"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bentornato",
    "properties": "Proprieta",
    "items": "Articoli",
    "analytics": "Analisi",
    "settings": "Impostazioni",
    "recentActivity": "Attivita recente",
    "quickActions": "Azioni rapide",
    "totalProperties": "Totale proprieta",
    "totalItems": "Totale articoli",
    "totalScans": "Totale scansioni",
    "activeUsers": "Utenti attivi",
    "overview": "Panoramica",
    "createProperty": "Crea proprieta",
    "createItem": "Crea articolo",
    "viewAll": "Vedi tutto",
    "noActivity": "Nessuna attivita recente"
  },
  "items": {
    "createNew": "Nuovo codice QR",
    "noItems": "Nessun articolo",
    "name": "Nome articolo",
    "description": "Descrizione",
    "property": "Proprieta",
    "qrCode": "Codice QR",
    "articles": "Articoli",
    "addArticle": "Aggiungi articolo",
    "editItem": "Modifica articolo",
    "deleteItem": "Elimina articolo",
    "viewItem": "Visualizza articolo",
    "printQrCode": "Stampa codice QR",
    "downloadQrCode": "Scarica codice QR",
    "scanCount": "Conteggio scansioni",
    "lastScanned": "Ultima scansione",
    "createdAt": "Creato il",
    "updatedAt": "Aggiornato il",
    "selectProperty": "Seleziona proprieta",
    "itemDetails": "Dettagli articolo",
    "noArticles": "Nessun articolo",
    "addFirstArticle": "Aggiungi il tuo primo articolo",
    "room": "Stanza",
    "tags": "Tag",
    "addTag": "Aggiungi tag",
    "removeTag": "Rimuovi tag"
  },
  "errors": {
    "required": "Questo campo e obbligatorio",
    "invalidEmail": "Indirizzo email non valido",
    "networkError": "Errore di rete. Riprova.",
    "unauthorized": "Non sei autorizzato a eseguire questa azione",
    "notFound": "La risorsa richiesta non e stata trovata",
    "serverError": "Errore del server. Riprova piu tardi.",
    "validationFailed": "Validazione fallita. Controlla i tuoi dati.",
    "sessionExpired": "La tua sessione e scaduta. Accedi di nuovo.",
    "tooManyRequests": "Troppe richieste. Attendi un momento.",
    "invalidCredentials": "Email o password non validi",
    "emailTaken": "Questa email e gia registrata",
    "passwordTooWeak": "La password deve avere almeno 8 caratteri",
    "uploadFailed": "Caricamento fallito. Riprova.",
    "fileTooLarge": "Il file e troppo grande",
    "invalidFileType": "Tipo di file non valido",
    "genericError": "Qualcosa e andato storto. Riprova."
  },
  "language": {
    "select": "Seleziona lingua",
    "current": "Lingua attuale",
    "en": "Inglese",
    "fr": "Francese",
    "es": "Spagnolo",
    "de": "Tedesco",
    "nl": "Olandese",
    "it": "Italiano",
    "changeLanguage": "Cambia lingua",
    "languageChanged": "Lingua cambiata con successo"
  }
}
```

2. **Validate JSON syntax:**
   ```bash
   python3 -m json.tool messages/it.json > /dev/null && echo "it.json: valid"
   ```

#### Acceptance Criteria
- [ ] `/messages/it.json` file exists
- [ ] File contains all 6 namespaces matching en.json structure
- [ ] JSON is syntactically valid
- [ ] All values are translated to Italian

---

### Task 2.5.7: Validate all JSON files syntax

**Story Points:** 0.5 SP
**Priority:** P0 - Critical
**Dependencies:** Tasks 2.5.1-2.5.6 (all locale files created)

#### Description
Run JSON validation on all translation files to ensure they are syntactically correct.

#### Implementation Steps

1. **Run validation script:**
   ```bash
   for file in messages/*.json; do
     echo "Validating $file..."
     python3 -m json.tool "$file" > /dev/null 2>&1
     if [ $? -eq 0 ]; then
       echo "  Valid JSON"
     else
       echo "  INVALID JSON - errors detected"
       python3 -m json.tool "$file"
     fi
   done
   ```

2. **Fix any JSON syntax errors identified**

#### Acceptance Criteria
- [ ] All 6 JSON files pass validation
- [ ] No syntax errors reported

---

### Task 2.5.8: Verify key structure consistency across all files

**Story Points:** 0.5 SP
**Priority:** P0 - Critical
**Dependencies:** Tasks 2.5.1-2.5.7 (all files created and validated)

#### Description
Ensure all locale files have identical key structures (same namespaces, same keys in each namespace).

#### Implementation Steps

1. **Run key comparison script:**
   ```bash
   # Extract keys from each file and compare
   for file in messages/*.json; do
     echo "=== $file ==="
     cat "$file" | python3 -c "
   import json, sys

   d = json.load(sys.stdin)

   def get_all_keys(obj, prefix=''):
       keys = []
       for k, v in sorted(obj.items()):
           full_key = f'{prefix}.{k}' if prefix else k
           if isinstance(v, dict):
               keys.extend(get_all_keys(v, full_key))
           else:
               keys.append(full_key)
       return keys

   keys = get_all_keys(d)
   print(f'Total keys: {len(keys)}')
   print(f'Namespaces: {sorted(d.keys())}')
   "
   done
   ```

2. **Compare key counts and ensure all files have same count:**
   ```bash
   # This should output the same number for all files
   for file in messages/*.json; do
     count=$(cat "$file" | python3 -c "
   import json, sys
   def count_keys(d):
       c = 0
       for v in d.values():
           c += count_keys(v) if isinstance(v, dict) else 1
       return c
   print(count_keys(json.load(sys.stdin)))
   ")
     echo "$file: $count keys"
   done
   ```

3. **Generate diff if counts don't match:**
   ```bash
   # Extract keys from en.json as reference
   cat messages/en.json | python3 -c "
   import json, sys
   def get_all_keys(obj, prefix=''):
       keys = []
       for k, v in sorted(obj.items()):
           full_key = f'{prefix}.{k}' if prefix else k
           if isinstance(v, dict):
               keys.extend(get_all_keys(v, full_key))
           else:
               keys.append(full_key)
       return keys
   for k in get_all_keys(json.load(sys.stdin)):
       print(k)
   " > /tmp/en_keys.txt

   # Compare with other files
   for file in messages/fr.json messages/es.json messages/de.json messages/nl.json messages/it.json; do
     echo "=== Comparing $file with en.json ==="
     cat "$file" | python3 -c "
   import json, sys
   def get_all_keys(obj, prefix=''):
       keys = []
       for k, v in sorted(obj.items()):
           full_key = f'{prefix}.{k}' if prefix else k
           if isinstance(v, dict):
               keys.extend(get_all_keys(v, full_key))
           else:
               keys.append(full_key)
       return keys
   for k in get_all_keys(json.load(sys.stdin)):
       print(k)
   " > /tmp/other_keys.txt
     diff /tmp/en_keys.txt /tmp/other_keys.txt
   done
   ```

#### Acceptance Criteria
- [ ] All files have identical key count
- [ ] All files have identical namespace structure
- [ ] No missing or extra keys in any file

---

### Task 2.5.9: Verify namespace requirements are met

**Story Points:** 0.5 SP
**Priority:** P0 - Critical
**Dependencies:** Task 2.5.8 (key structure verified)

#### Description
Verify that all required namespaces are present in each locale file.

#### Implementation Steps

1. **Run namespace verification script:**
   ```bash
   for file in messages/*.json; do
     echo "=== $file ==="
     cat "$file" | python3 -c "
   import json, sys

   d = json.load(sys.stdin)
   required_namespaces = {'common', 'auth', 'dashboard', 'items', 'errors', 'language'}
   present_namespaces = set(d.keys())

   missing = required_namespaces - present_namespaces
   extra = present_namespaces - required_namespaces

   print(f'Present namespaces: {sorted(present_namespaces)}')

   if missing:
       print(f'MISSING namespaces: {missing}')
   else:
       print('All required namespaces present')

   if extra:
       print(f'Extra namespaces: {extra}')
   "
   done
   ```

#### Acceptance Criteria
- [ ] Each file contains all 6 required namespaces: common, auth, dashboard, items, errors, language
- [ ] No missing namespaces in any file

---

### Task 2.5.10: Run project build verification

**Story Points:** 0.5 SP
**Priority:** P0 - Critical
**Dependencies:** Tasks 2.5.1-2.5.9 (all files created and validated)

#### Description
Ensure the translation files do not break the project build.

#### Implementation Steps

1. **Run TypeScript type check:**
   ```bash
   npm run typecheck || npx tsc --noEmit
   ```

2. **Run build:**
   ```bash
   npm run build
   ```

3. **Verify build completes without errors related to translation files**

#### Acceptance Criteria
- [ ] TypeScript check passes
- [ ] Build completes successfully
- [ ] No errors related to translation files

---

### Task 2.5.11: Document namespace organization pattern

**Story Points:** 0.5 SP
**Priority:** P2 - Medium
**Dependencies:** Tasks 2.5.1-2.5.10 (implementation complete)

#### Description
Add inline documentation to the translation file structure explaining the namespace organization pattern for developers and translators.

#### Implementation Steps

1. **Create a README in the messages directory (if not exists):**
   - File: `/messages/README.md`

**Note:** Per project guidelines, only create this file if explicitly requested. The overview document already contains comprehensive documentation.

The namespace organization is already documented in:
- REQ-233-create-initial-translation-file-structure-overview.md (Section 3)
- Plan-110-L10N-Epic1-Foundation.md (Translation File Structure Template section)

#### Acceptance Criteria
- [ ] Namespace organization is documented (already in overview doc)
- [ ] Developers can reference the documentation to understand the pattern

---

### Task 2.5.12: Final verification and sign-off

**Story Points:** 0.5 SP
**Priority:** P0 - Critical
**Dependencies:** All previous tasks

#### Description
Perform final verification against acceptance criteria from REQ-233.

#### Implementation Steps

1. **Run comprehensive verification script:**
   ```bash
   echo "=== REQ-233 Final Verification ==="
   echo ""

   # Check 1: English file exists with 5+ namespaces
   echo "1. Checking English translation file..."
   if [ -f messages/en.json ]; then
     ns_count=$(cat messages/en.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
     echo "   en.json exists with $ns_count namespaces"
   else
     echo "   FAIL: en.json not found"
   fi

   # Check 2: Each namespace has sample keys
   echo ""
   echo "2. Checking namespace content..."
   cat messages/en.json | python3 -c "
   import json, sys
   d = json.load(sys.stdin)
   for ns in d:
       key_count = len(d[ns])
       print(f'   {ns}: {key_count} keys')
   "

   # Check 3: Stub files for additional locales
   echo ""
   echo "3. Checking additional locale files..."
   for locale in fr es de nl it; do
     if [ -f "messages/${locale}.json" ]; then
       echo "   ${locale}.json: exists"
     else
       echo "   ${locale}.json: MISSING"
     fi
   done

   # Check 4: Documentation exists
   echo ""
   echo "4. Documentation check..."
   if [ -f docs/REQ-233-create-initial-translation-file-structure-overview.md ]; then
     echo "   Overview documentation exists"
   fi

   # Check 5: Files in standard directory
   echo ""
   echo "5. Files in standard directory..."
   echo "   Location: $(pwd)/messages/"
   ls -la messages/*.json

   echo ""
   echo "=== Verification Complete ==="
   ```

2. **Manual checklist review:**

| Acceptance Criteria | Status |
|---------------------|--------|
| English translation file exists with all five namespaces defined | [ ] |
| Each namespace contains at least one sample translation key | [ ] |
| Stub translation files for at least two additional locales present | [ ] |
| Translation file structure is documented | [ ] |
| Translation files in standard directory discoverable by i18n framework | [ ] |

#### Acceptance Criteria
- [ ] All 5 acceptance criteria from REQ-233 are met
- [ ] All verification scripts pass
- [ ] Ready for Task 2.6 (component integration)

---

## Summary

| Task | Description | Story Points | Priority |
|------|-------------|--------------|----------|
| 2.5.1 | Create English translation file (en.json) | 1 SP | P0 |
| 2.5.2 | Create French translation file (fr.json) | 1 SP | P1 |
| 2.5.3 | Create Spanish translation file (es.json) | 1 SP | P1 |
| 2.5.4 | Create German translation file (de.json) | 1 SP | P1 |
| 2.5.5 | Create Dutch translation file (nl.json) | 1 SP | P1 |
| 2.5.6 | Create Italian translation file (it.json) | 1 SP | P1 |
| 2.5.7 | Validate all JSON files syntax | 0.5 SP | P0 |
| 2.5.8 | Verify key structure consistency | 0.5 SP | P0 |
| 2.5.9 | Verify namespace requirements | 0.5 SP | P0 |
| 2.5.10 | Run project build verification | 0.5 SP | P0 |
| 2.5.11 | Document namespace organization | 0.5 SP | P2 |
| 2.5.12 | Final verification and sign-off | 0.5 SP | P0 |
| **Total** | | **8 SP** | |

---

## Execution Order

```
2.5.1 (en.json) ─┬─> 2.5.2 (fr.json) ─┐
                 ├─> 2.5.3 (es.json) ─┤
                 ├─> 2.5.4 (de.json) ─┼─> 2.5.7 ─> 2.5.8 ─> 2.5.9 ─> 2.5.10 ─> 2.5.11 ─> 2.5.12
                 ├─> 2.5.5 (nl.json) ─┤
                 └─> 2.5.6 (it.json) ─┘
```

**Notes:**
- Tasks 2.5.2-2.5.6 can be executed in parallel after 2.5.1
- Tasks 2.5.7-2.5.12 must be executed sequentially after all locale files are created

---

## Files Created/Modified

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/messages/en.json` | CREATE/REPLACE | English source translations |
| `/messages/fr.json` | CREATE/REPLACE | French translations |
| `/messages/es.json` | CREATE/REPLACE | Spanish translations |
| `/messages/de.json` | CREATE/REPLACE | German translations |
| `/messages/nl.json` | CREATE/REPLACE | Dutch translations |
| `/messages/it.json` | CREATE/REPLACE | Italian translations |

---

## Next Steps After Completion

After completing all tasks in this document:

1. **Task 2.6 (REQ-234):** Verify sample component with t() function
   - Select an existing component to update with translations
   - Verify hot reload works with translation changes
   - Confirm namespace access pattern works correctly

2. **Phase 3-5 tasks** can proceed once i18n framework integration is complete

---

## References

- [Overview Document](/docs/REQ-233-create-initial-translation-file-structure-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Requirements](/docs/gen_requests.md) - Request #233
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.5*
