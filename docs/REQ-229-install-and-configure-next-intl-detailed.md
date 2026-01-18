# REQ-229: Install and Configure next-intl - Detailed Task Breakdown

**Generated:** 2026-01-18 09:00:00 UTC
**Last Modified:** 2026-01-18 09:00:00 UTC
**Request Reference:** REQ-229 - Install and Configure Internationalization Framework
**Overview Document:** REQ-229-install-and-configure-next-intl-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.1)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides step-by-step implementation instructions for installing the `next-intl` internationalization framework and creating the foundational message files directory structure. This is the first i18n framework task and blocks all subsequent localization tasks.

**Estimated Tasks:** 8 subtasks
**Complexity:** Low
**Dependencies:** None (first i18n task)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Current working directory is `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- [ ] Node.js >= 22.0.0 is installed (`node --version`)
- [ ] npm >= 10.0.0 is installed (`npm --version`)
- [ ] Project builds successfully (`npm run build`)
- [ ] No existing `/messages/` directory exists
- [ ] `next-intl` is not already installed (`npm list next-intl`)

---

## Task Breakdown

### Task 2.1.1: Install next-intl Package

**Status:** Pending
**Complexity:** Trivial
**Story Points:** 1

#### Description
Install the `next-intl` npm package as a project dependency. This library provides full i18n support for Next.js 15 with App Router.

#### Implementation Steps

1. **Run npm install command:**
   ```bash
   npm install next-intl
   ```

2. **Verify installation:**
   ```bash
   npm list next-intl
   ```
   Expected output: `next-intl@x.x.x` (version number)

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/package.json` | Modified | `next-intl` added to dependencies |
| `/package-lock.json` | Modified | Lock file updated automatically |

#### Verification Checklist
- [ ] `npm install next-intl` completes without errors
- [ ] No peer dependency warnings appear
- [ ] `package.json` contains `"next-intl"` in dependencies section
- [ ] `node_modules/next-intl` directory exists

#### Rollback Instructions
If issues occur:
```bash
npm uninstall next-intl
```

---

### Task 2.1.2: Create Messages Directory

**Status:** Pending
**Complexity:** Trivial
**Story Points:** 1

#### Description
Create the `/messages/` directory at the project root level. This directory will contain all translation JSON files following next-intl conventions.

#### Implementation Steps

1. **Create directory:**
   ```bash
   mkdir -p messages
   ```

2. **Verify creation:**
   ```bash
   ls -la messages/
   ```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/` | Created | New directory for translation files |

#### Verification Checklist
- [ ] `/messages/` directory exists at project root
- [ ] Directory is at same level as `/src/`, `/docs/`, `/database/`
- [ ] Directory is empty initially

#### Notes
- Directory location follows next-intl documentation recommendation for App Router projects
- Do NOT create inside `/src/` - messages belong at project root

---

### Task 2.1.3: Create English Translation File (Source Locale)

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the English translation file (`en.json`) which serves as the source/default locale. This file contains all translation keys with English values.

#### Implementation Steps

1. **Create file:** `/messages/en.json`

2. **Add content:**

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
    "no": "No"
  },
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "properties": "Properties",
    "items": "Items",
    "analytics": "Analytics",
    "settings": "Settings",
    "recentActivity": "Recent Activity",
    "quickActions": "Quick Actions"
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
    "viewItem": "View Item"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address",
    "networkError": "Network error. Please try again.",
    "unauthorized": "You are not authorized to perform this action",
    "notFound": "The requested resource was not found",
    "serverError": "Server error. Please try again later.",
    "validationFailed": "Validation failed. Please check your input."
  },
  "language": {
    "select": "Select Language",
    "current": "Current Language",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Created | English translation file (source locale) |

#### Verification Checklist
- [ ] File exists at `/messages/en.json`
- [ ] JSON is valid (no syntax errors)
- [ ] Contains 6 namespaces: `common`, `auth`, `dashboard`, `items`, `errors`, `language`
- [ ] All keys use camelCase naming convention

#### Validation Command
```bash
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON" || echo "INVALID JSON"
```

---

### Task 2.1.4: Create French Translation File

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the French translation file (`fr.json`) with translated stub values matching the English structure.

#### Implementation Steps

1. **Create file:** `/messages/fr.json`

2. **Add content:**

```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "confirm": "Confirmer",
    "back": "Retour",
    "next": "Suivant",
    "close": "Fermer",
    "search": "Rechercher",
    "filter": "Filtrer",
    "sort": "Trier",
    "actions": "Actions",
    "yes": "Oui",
    "no": "Non"
  },
  "auth": {
    "signIn": "Se connecter",
    "signOut": "Se déconnecter",
    "signUp": "S'inscrire",
    "email": "E-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié?",
    "continueWithGoogle": "Continuer avec Google",
    "rememberMe": "Se souvenir de moi",
    "noAccount": "Pas de compte?",
    "hasAccount": "Déjà un compte?"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bon retour",
    "properties": "Propriétés",
    "items": "Articles",
    "analytics": "Analytique",
    "settings": "Paramètres",
    "recentActivity": "Activité récente",
    "quickActions": "Actions rapides"
  },
  "items": {
    "createNew": "Nouvel article QR Code",
    "noItems": "Aucun article",
    "name": "Nom de l'article",
    "description": "Description",
    "property": "Propriété",
    "qrCode": "Code QR",
    "articles": "Articles",
    "addArticle": "Ajouter un article",
    "editItem": "Modifier l'article",
    "deleteItem": "Supprimer l'article",
    "viewItem": "Voir l'article"
  },
  "errors": {
    "required": "Ce champ est obligatoire",
    "invalidEmail": "Adresse e-mail invalide",
    "networkError": "Erreur réseau. Veuillez réessayer.",
    "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action",
    "notFound": "La ressource demandée n'a pas été trouvée",
    "serverError": "Erreur serveur. Veuillez réessayer plus tard.",
    "validationFailed": "Validation échouée. Veuillez vérifier votre saisie."
  },
  "language": {
    "select": "Choisir la langue",
    "current": "Langue actuelle",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/fr.json` | Created | French translation file |

#### Verification Checklist
- [ ] File exists at `/messages/fr.json`
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly
- [ ] All values are in French

---

### Task 2.1.5: Create Spanish Translation File

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the Spanish translation file (`es.json`) with translated stub values matching the English structure.

#### Implementation Steps

1. **Create file:** `/messages/es.json`

2. **Add content:**

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
    "success": "Éxito",
    "confirm": "Confirmar",
    "back": "Atrás",
    "next": "Siguiente",
    "close": "Cerrar",
    "search": "Buscar",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "actions": "Acciones",
    "yes": "Sí",
    "no": "No"
  },
  "auth": {
    "signIn": "Iniciar sesión",
    "signOut": "Cerrar sesión",
    "signUp": "Registrarse",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "continueWithGoogle": "Continuar con Google",
    "rememberMe": "Recordarme",
    "noAccount": "¿No tienes cuenta?",
    "hasAccount": "¿Ya tienes cuenta?"
  },
  "dashboard": {
    "title": "Panel de control",
    "welcome": "Bienvenido de nuevo",
    "properties": "Propiedades",
    "items": "Artículos",
    "analytics": "Analíticas",
    "settings": "Configuración",
    "recentActivity": "Actividad reciente",
    "quickActions": "Acciones rápidas"
  },
  "items": {
    "createNew": "Nuevo artículo con código QR",
    "noItems": "No hay artículos aún",
    "name": "Nombre del artículo",
    "description": "Descripción",
    "property": "Propiedad",
    "qrCode": "Código QR",
    "articles": "Artículos",
    "addArticle": "Agregar artículo",
    "editItem": "Editar artículo",
    "deleteItem": "Eliminar artículo",
    "viewItem": "Ver artículo"
  },
  "errors": {
    "required": "Este campo es obligatorio",
    "invalidEmail": "Correo electrónico inválido",
    "networkError": "Error de red. Por favor, intenta de nuevo.",
    "unauthorized": "No estás autorizado para realizar esta acción",
    "notFound": "El recurso solicitado no fue encontrado",
    "serverError": "Error del servidor. Por favor, intenta más tarde.",
    "validationFailed": "Validación fallida. Por favor, verifica tu entrada."
  },
  "language": {
    "select": "Seleccionar idioma",
    "current": "Idioma actual",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/es.json` | Created | Spanish translation file |

#### Verification Checklist
- [ ] File exists at `/messages/es.json`
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly
- [ ] All values are in Spanish

---

### Task 2.1.6: Create German Translation File

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the German translation file (`de.json`) with translated stub values matching the English structure.

#### Implementation Steps

1. **Create file:** `/messages/de.json`

2. **Add content:**

```json
{
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "create": "Erstellen",
    "loading": "Laden...",
    "error": "Fehler",
    "success": "Erfolg",
    "confirm": "Bestätigen",
    "back": "Zurück",
    "next": "Weiter",
    "close": "Schließen",
    "search": "Suchen",
    "filter": "Filtern",
    "sort": "Sortieren",
    "actions": "Aktionen",
    "yes": "Ja",
    "no": "Nein"
  },
  "auth": {
    "signIn": "Anmelden",
    "signOut": "Abmelden",
    "signUp": "Registrieren",
    "email": "E-Mail",
    "password": "Passwort",
    "forgotPassword": "Passwort vergessen?",
    "continueWithGoogle": "Mit Google fortfahren",
    "rememberMe": "Angemeldet bleiben",
    "noAccount": "Kein Konto?",
    "hasAccount": "Bereits ein Konto?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Willkommen zurück",
    "properties": "Eigenschaften",
    "items": "Artikel",
    "analytics": "Analysen",
    "settings": "Einstellungen",
    "recentActivity": "Letzte Aktivität",
    "quickActions": "Schnellaktionen"
  },
  "items": {
    "createNew": "Neuer QR-Code-Artikel",
    "noItems": "Noch keine Artikel",
    "name": "Artikelname",
    "description": "Beschreibung",
    "property": "Eigenschaft",
    "qrCode": "QR-Code",
    "articles": "Artikel",
    "addArticle": "Artikel hinzufügen",
    "editItem": "Artikel bearbeiten",
    "deleteItem": "Artikel löschen",
    "viewItem": "Artikel anzeigen"
  },
  "errors": {
    "required": "Dieses Feld ist erforderlich",
    "invalidEmail": "Ungültige E-Mail-Adresse",
    "networkError": "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzuführen",
    "notFound": "Die angeforderte Ressource wurde nicht gefunden",
    "serverError": "Serverfehler. Bitte versuchen Sie es später erneut.",
    "validationFailed": "Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingabe."
  },
  "language": {
    "select": "Sprache auswählen",
    "current": "Aktuelle Sprache",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/de.json` | Created | German translation file |

#### Verification Checklist
- [ ] File exists at `/messages/de.json`
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly
- [ ] All values are in German

---

### Task 2.1.7: Create Dutch Translation File

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the Dutch translation file (`nl.json`) with translated stub values matching the English structure.

#### Implementation Steps

1. **Create file:** `/messages/nl.json`

2. **Add content:**

```json
{
  "common": {
    "save": "Opslaan",
    "cancel": "Annuleren",
    "delete": "Verwijderen",
    "edit": "Bewerken",
    "create": "Aanmaken",
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
    "no": "Nee"
  },
  "auth": {
    "signIn": "Inloggen",
    "signOut": "Uitloggen",
    "signUp": "Registreren",
    "email": "E-mail",
    "password": "Wachtwoord",
    "forgotPassword": "Wachtwoord vergeten?",
    "continueWithGoogle": "Doorgaan met Google",
    "rememberMe": "Onthoud mij",
    "noAccount": "Geen account?",
    "hasAccount": "Al een account?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welkom terug",
    "properties": "Eigenschappen",
    "items": "Items",
    "analytics": "Analyses",
    "settings": "Instellingen",
    "recentActivity": "Recente activiteit",
    "quickActions": "Snelle acties"
  },
  "items": {
    "createNew": "Nieuw QR-code item",
    "noItems": "Nog geen items",
    "name": "Itemnaam",
    "description": "Beschrijving",
    "property": "Eigenschap",
    "qrCode": "QR-code",
    "articles": "Artikelen",
    "addArticle": "Artikel toevoegen",
    "editItem": "Item bewerken",
    "deleteItem": "Item verwijderen",
    "viewItem": "Item bekijken"
  },
  "errors": {
    "required": "Dit veld is verplicht",
    "invalidEmail": "Ongeldig e-mailadres",
    "networkError": "Netwerkfout. Probeer het opnieuw.",
    "unauthorized": "U bent niet gemachtigd om deze actie uit te voeren",
    "notFound": "De gevraagde bron is niet gevonden",
    "serverError": "Serverfout. Probeer het later opnieuw.",
    "validationFailed": "Validatie mislukt. Controleer uw invoer."
  },
  "language": {
    "select": "Taal selecteren",
    "current": "Huidige taal",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/nl.json` | Created | Dutch translation file |

#### Verification Checklist
- [ ] File exists at `/messages/nl.json`
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly
- [ ] All values are in Dutch

---

### Task 2.1.8: Create Italian Translation File

**Status:** Pending
**Complexity:** Low
**Story Points:** 1

#### Description
Create the Italian translation file (`it.json`) with translated stub values matching the English structure.

#### Implementation Steps

1. **Create file:** `/messages/it.json`

2. **Add content:**

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
    "yes": "Sì",
    "no": "No"
  },
  "auth": {
    "signIn": "Accedi",
    "signOut": "Esci",
    "signUp": "Registrati",
    "email": "E-mail",
    "password": "Password",
    "forgotPassword": "Password dimenticata?",
    "continueWithGoogle": "Continua con Google",
    "rememberMe": "Ricordami",
    "noAccount": "Non hai un account?",
    "hasAccount": "Hai già un account?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bentornato",
    "properties": "Proprietà",
    "items": "Elementi",
    "analytics": "Analisi",
    "settings": "Impostazioni",
    "recentActivity": "Attività recente",
    "quickActions": "Azioni rapide"
  },
  "items": {
    "createNew": "Nuovo elemento codice QR",
    "noItems": "Nessun elemento ancora",
    "name": "Nome elemento",
    "description": "Descrizione",
    "property": "Proprietà",
    "qrCode": "Codice QR",
    "articles": "Articoli",
    "addArticle": "Aggiungi articolo",
    "editItem": "Modifica elemento",
    "deleteItem": "Elimina elemento",
    "viewItem": "Visualizza elemento"
  },
  "errors": {
    "required": "Questo campo è obbligatorio",
    "invalidEmail": "Indirizzo e-mail non valido",
    "networkError": "Errore di rete. Riprova.",
    "unauthorized": "Non sei autorizzato a eseguire questa azione",
    "notFound": "La risorsa richiesta non è stata trovata",
    "serverError": "Errore del server. Riprova più tardi.",
    "validationFailed": "Validazione fallita. Controlla i tuoi dati."
  },
  "language": {
    "select": "Seleziona lingua",
    "current": "Lingua corrente",
    "en": "English",
    "fr": "Français",
    "es": "Español",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

#### Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/it.json` | Created | Italian translation file |

#### Verification Checklist
- [ ] File exists at `/messages/it.json`
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly
- [ ] All values are in Italian

---

## Post-Implementation Verification

### Automated Verification Script

Run the following commands to verify complete implementation:

```bash
# 1. Verify next-intl is installed
echo "=== Checking next-intl installation ==="
npm list next-intl

# 2. Verify messages directory exists
echo "=== Checking messages directory ==="
ls -la messages/

# 3. Verify all 6 locale files exist
echo "=== Checking locale files ==="
for locale in en fr es de nl it; do
  if [ -f "messages/${locale}.json" ]; then
    echo "✓ messages/${locale}.json exists"
  else
    echo "✗ messages/${locale}.json MISSING"
  fi
done

# 4. Validate JSON syntax for all files
echo "=== Validating JSON syntax ==="
for file in messages/*.json; do
  if python3 -m json.tool "$file" > /dev/null 2>&1; then
    echo "✓ $file is valid JSON"
  else
    echo "✗ $file has INVALID JSON"
  fi
done

# 5. Verify key count consistency
echo "=== Checking key consistency ==="
for file in messages/*.json; do
  count=$(python3 -c "import json; d=json.load(open('$file')); print(sum(len(v) for v in d.values()))")
  echo "$file: $count keys"
done

# 6. Verify build still works
echo "=== Running build verification ==="
npm run build
```

### Expected Verification Results

| Check | Expected Result |
|-------|-----------------|
| `npm list next-intl` | Shows `next-intl@x.x.x` |
| `ls messages/` | Shows 6 files: en.json, fr.json, es.json, de.json, nl.json, it.json |
| JSON validation | All 6 files report "valid JSON" |
| Key count | All files have same number of keys (53 keys per file) |
| `npm run build` | Build completes successfully |

---

## Acceptance Criteria Verification

From REQ-229:

| Criteria | Verification Method | Expected Result |
|----------|---------------------|-----------------|
| Internationalization library is installed | `npm list next-intl` | Package listed in dependencies |
| Translation message files exist for all six locales | `ls messages/` | en.json, fr.json, es.json, de.json, nl.json, it.json |
| Messages directory exists at root level | `ls -d messages` | Directory exists |
| Framework configured to recognize translations | Files follow next-intl naming convention | `{locale}.json` pattern |
| Application can initialize with any language | Valid JSON structure | All files pass JSON validation |
| Translation file structure is consistent | Compare key structures | All files have identical keys |

---

## Files Summary

### Files to Create

| File Path | Description | Task |
|-----------|-------------|------|
| `/messages/` | Messages directory | 2.1.2 |
| `/messages/en.json` | English translations (source) | 2.1.3 |
| `/messages/fr.json` | French translations | 2.1.4 |
| `/messages/es.json` | Spanish translations | 2.1.5 |
| `/messages/de.json` | German translations | 2.1.6 |
| `/messages/nl.json` | Dutch translations | 2.1.7 |
| `/messages/it.json` | Italian translations | 2.1.8 |

### Files Modified Automatically

| File Path | Description | Task |
|-----------|-------------|------|
| `/package.json` | next-intl dependency added | 2.1.1 |
| `/package-lock.json` | Lock file updated | 2.1.1 |

### Files NOT to Modify

These files will be modified in subsequent tasks:
- `/next.config.ts` (Task 2.3)
- `/src/app/layout.tsx` (Task 2.4)
- `/src/middleware.ts` (Task 5.2)
- Any component files

---

## Translation Namespace Reference

| Namespace | Purpose | Key Count |
|-----------|---------|-----------|
| `common` | Shared UI elements (buttons, labels) | 18 |
| `auth` | Authentication-related text | 10 |
| `dashboard` | Dashboard page strings | 8 |
| `items` | Items management strings | 11 |
| `errors` | Error messages | 7 |
| `language` | Language switcher labels | 8 |
| **Total** | | **62** |

---

## Downstream Dependencies

Tasks blocked by this task (2.1):

| Task ID | Task Name | Dependency Reason |
|---------|-----------|-------------------|
| 2.2 | Create i18n configuration module | Requires `/messages/` directory |
| 2.3 | Update next.config.ts for i18n | Requires next-intl installed |
| 2.4 | Create IntlProvider wrapper | Requires next-intl installed |
| 2.5 | Create initial translation file structure | Extends files created here |
| 2.6 | Verify sample component with t() | Requires all above complete |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| next-intl incompatible with React 19 | Low | High | Check release notes; tested compatible |
| JSON syntax errors | Medium | Low | Use JSON validator; copy exact content |
| Missing keys in locale files | Medium | Medium | Use en.json as template for all |
| npm install fails | Low | Low | Clear cache; check network |

---

## Implementation Order

Execute tasks in this order:

1. **Task 2.1.1** - Install next-intl package
2. **Task 2.1.2** - Create messages directory
3. **Task 2.1.3** - Create en.json (source locale)
4. **Tasks 2.1.4-2.1.8** - Create remaining locale files (can be done in parallel)
5. **Verification** - Run post-implementation verification script

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl App Router Setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- Overview Document: `/docs/REQ-229-install-and-configure-next-intl-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Request: REQ-229 in `/docs/gen_requests.md`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.1*
