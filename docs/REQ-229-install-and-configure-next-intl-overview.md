# REQ-229: Install and Configure next-intl - Implementation Overview

**Generated:** 2026-01-17 10:00:00 UTC
**Last Modified:** 2026-01-17 10:00:00 UTC
**Request Reference:** REQ-229 - Install and Configure Internationalization Framework
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Install the `next-intl` internationalization framework and create the foundational message files directory structure with all six supported locale files. This task establishes the i18n infrastructure that enables static UI text translation across the FAQBNB application.

**Scope:**
- Install `next-intl` as a project dependency
- Create `/messages/` directory at project root
- Create translation JSON files for all 6 supported locales: `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- Initialize each file with a consistent namespace structure

**Out of Scope:**
- next.config.ts modification (Task 2.3)
- IntlProvider setup in layout.tsx (Task 2.4)
- Populating actual translations (Task 2.5)
- Component integration with t() function (Task 2.6)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Tailwind CSS | ^4 | `package.json` |
| Sentry | ^10.34.0 | `package.json`, `next.config.ts` |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Root-level directories | `/database/`, `/docs/`, `/public/` | Standard project organization |
| Configuration files | `next.config.ts`, `tsconfig.json` | TypeScript config patterns |
| Context providers | `/src/contexts/AuthContext.tsx` | Provider pattern for app-wide state |
| App layout structure | `/src/app/layout.tsx` | RootLayout with AuthProvider wrapper |

### Current Package Dependencies

From `package.json`:
- No i18n-related packages currently installed
- 33 runtime dependencies
- 24 dev dependencies
- Node >= 22.0.0 required

### Messages Directory

- **Status:** Does not exist
- **Target location:** `/messages/` (project root level)
- **Convention:** Follows next-intl recommended structure for App Router

---

## 3. Technical Approach

### Library Selection Rationale

| Criteria | next-intl | react-i18next | Alternative |
|----------|-----------|---------------|-------------|
| Next.js 15 App Router | Full support | Limited | - |
| React 19 compatibility | Yes | Partial | - |
| Bundle size | ~25KB gzipped | ~35KB | - |
| Documentation | Excellent | Good | - |
| Active maintenance | Yes (2024-2025 updates) | Yes | - |

**Decision:** Use `next-intl` per Plan-110 recommendation.

### Translation File Structure

Per PRD and Plan requirements, translations are organized by namespace:

```json
{
  "common": { /* shared UI elements */ },
  "auth": { /* authentication related */ },
  "dashboard": { /* dashboard page */ },
  "items": { /* items management */ },
  "errors": { /* error messages */ },
  "language": { /* language switcher */ }
}
```

### Supported Locales

| Code | Language | Native Name | Status |
|------|----------|-------------|--------|
| `en` | English | English | Default (source) |
| `fr` | French | Francais | Stub |
| `es` | Spanish | Espanol | Stub |
| `de` | German | Deutsch | Stub |
| `nl` | Dutch | Nederlands | Stub |
| `it` | Italian | Italiano | Stub |

---

## 4. Implementation Tasks

### Task 2.1.1: Install next-intl package

**Action:** Add npm dependency
**Command:**
```bash
npm install next-intl
```

**Verification:**
- Package appears in `package.json` dependencies
- No peer dependency warnings
- `node_modules/next-intl` exists

### Task 2.1.2: Create messages directory

**Action:** Create directory
**Path:** `/messages/`

**Verification:**
- Directory exists at project root (same level as `/src/`, `/docs/`, `/database/`)
- Directory is empty initially

### Task 2.1.3: Create English translation file (source locale)

**Action:** Create new file
**File:** `/messages/en.json`

**Content:**
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
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

### Task 2.1.4: Create French translation file (stub)

**Action:** Create new file
**File:** `/messages/fr.json`

**Content:**
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
    "no": "Non"
  },
  "auth": {
    "signIn": "Se connecter",
    "signOut": "Se deconnecter",
    "signUp": "S'inscrire",
    "email": "E-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublie?",
    "continueWithGoogle": "Continuer avec Google",
    "rememberMe": "Se souvenir de moi",
    "noAccount": "Pas de compte?",
    "hasAccount": "Deja un compte?"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bon retour",
    "properties": "Proprietes",
    "items": "Articles",
    "analytics": "Analytique",
    "settings": "Parametres",
    "recentActivity": "Activite recente",
    "quickActions": "Actions rapides"
  },
  "items": {
    "createNew": "Nouvel article QR Code",
    "noItems": "Aucun article",
    "name": "Nom de l'article",
    "description": "Description",
    "property": "Propriete",
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
    "networkError": "Erreur reseau. Veuillez reessayer.",
    "unauthorized": "Vous n'etes pas autorise a effectuer cette action",
    "notFound": "La ressource demandee n'a pas ete trouvee",
    "serverError": "Erreur serveur. Veuillez reessayer plus tard.",
    "validationFailed": "Validation echouee. Veuillez verifier votre saisie."
  },
  "language": {
    "select": "Choisir la langue",
    "current": "Langue actuelle",
    "en": "English",
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

### Task 2.1.5: Create Spanish translation file (stub)

**Action:** Create new file
**File:** `/messages/es.json`

**Content:**
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
    "no": "No"
  },
  "auth": {
    "signIn": "Iniciar sesion",
    "signOut": "Cerrar sesion",
    "signUp": "Registrarse",
    "email": "Correo electronico",
    "password": "Contrasena",
    "forgotPassword": "Olvidaste tu contrasena?",
    "continueWithGoogle": "Continuar con Google",
    "rememberMe": "Recordarme",
    "noAccount": "No tienes cuenta?",
    "hasAccount": "Ya tienes cuenta?"
  },
  "dashboard": {
    "title": "Panel de control",
    "welcome": "Bienvenido de nuevo",
    "properties": "Propiedades",
    "items": "Articulos",
    "analytics": "Analiticas",
    "settings": "Configuracion",
    "recentActivity": "Actividad reciente",
    "quickActions": "Acciones rapidas"
  },
  "items": {
    "createNew": "Nuevo articulo con codigo QR",
    "noItems": "No hay articulos aun",
    "name": "Nombre del articulo",
    "description": "Descripcion",
    "property": "Propiedad",
    "qrCode": "Codigo QR",
    "articles": "Articulos",
    "addArticle": "Agregar articulo",
    "editItem": "Editar articulo",
    "deleteItem": "Eliminar articulo",
    "viewItem": "Ver articulo"
  },
  "errors": {
    "required": "Este campo es obligatorio",
    "invalidEmail": "Correo electronico invalido",
    "networkError": "Error de red. Por favor, intenta de nuevo.",
    "unauthorized": "No estas autorizado para realizar esta accion",
    "notFound": "El recurso solicitado no fue encontrado",
    "serverError": "Error del servidor. Por favor, intenta mas tarde.",
    "validationFailed": "Validacion fallida. Por favor, verifica tu entrada."
  },
  "language": {
    "select": "Seleccionar idioma",
    "current": "Idioma actual",
    "en": "English",
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

### Task 2.1.6: Create German translation file (stub)

**Action:** Create new file
**File:** `/messages/de.json`

**Content:**
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
    "welcome": "Willkommen zuruck",
    "properties": "Eigenschaften",
    "items": "Artikel",
    "analytics": "Analysen",
    "settings": "Einstellungen",
    "recentActivity": "Letzte Aktivitat",
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
    "addArticle": "Artikel hinzufugen",
    "editItem": "Artikel bearbeiten",
    "deleteItem": "Artikel loschen",
    "viewItem": "Artikel anzeigen"
  },
  "errors": {
    "required": "Dieses Feld ist erforderlich",
    "invalidEmail": "Ungultige E-Mail-Adresse",
    "networkError": "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzufuhren",
    "notFound": "Die angeforderte Ressource wurde nicht gefunden",
    "serverError": "Serverfehler. Bitte versuchen Sie es spater erneut.",
    "validationFailed": "Validierung fehlgeschlagen. Bitte uberprufen Sie Ihre Eingabe."
  },
  "language": {
    "select": "Sprache auswahlen",
    "current": "Aktuelle Sprache",
    "en": "English",
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

### Task 2.1.7: Create Dutch translation file (stub)

**Action:** Create new file
**File:** `/messages/nl.json`

**Content:**
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
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

### Task 2.1.8: Create Italian translation file (stub)

**Action:** Create new file
**File:** `/messages/it.json`

**Content:**
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
    "hasAccount": "Hai gia un account?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bentornato",
    "properties": "Proprieta",
    "items": "Elementi",
    "analytics": "Analisi",
    "settings": "Impostazioni",
    "recentActivity": "Attivita recente",
    "quickActions": "Azioni rapide"
  },
  "items": {
    "createNew": "Nuovo elemento codice QR",
    "noItems": "Nessun elemento ancora",
    "name": "Nome elemento",
    "description": "Descrizione",
    "property": "Proprieta",
    "qrCode": "Codice QR",
    "articles": "Articoli",
    "addArticle": "Aggiungi articolo",
    "editItem": "Modifica elemento",
    "deleteItem": "Elimina elemento",
    "viewItem": "Visualizza elemento"
  },
  "errors": {
    "required": "Questo campo e obbligatorio",
    "invalidEmail": "Indirizzo e-mail non valido",
    "networkError": "Errore di rete. Riprova.",
    "unauthorized": "Non sei autorizzato a eseguire questa azione",
    "notFound": "La risorsa richiesta non e stata trovata",
    "serverError": "Errore del server. Riprova piu tardi.",
    "validationFailed": "Validazione fallita. Controlla i tuoi dati."
  },
  "language": {
    "select": "Seleziona lingua",
    "current": "Lingua corrente",
    "en": "English",
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano"
  }
}
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/messages/` | New messages directory at project root |
| `/messages/en.json` | English translation file (source) |
| `/messages/fr.json` | French translation file |
| `/messages/es.json` | Spanish translation file |
| `/messages/de.json` | German translation file |
| `/messages/nl.json` | Dutch translation file |
| `/messages/it.json` | Italian translation file |

### Files to MODIFY

| File Path | Description |
|-----------|-------------|
| `/package.json` | Add next-intl dependency via npm install |
| `/package-lock.json` | Auto-updated by npm install |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/package.json` | Verify current dependencies |
| `/src/app/layout.tsx` | Understand root layout structure for future Task 2.4 |
| `/next.config.ts` | Reference for future Task 2.3 |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/docs/prd/PRD_L10N_Epic1_Foundation.md` | PRD requirements reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/next.config.ts` (Task 2.3 will handle plugin configuration)
- `/src/app/layout.tsx` (Task 2.4 will add IntlProvider)
- `/src/middleware.ts` (Task 5.2 will add language detection)
- `/src/lib/supabase.ts` (unrelated to this task)
- Any component files (Task 2.6 will verify component integration)

---

## 6. Dependencies

### NPM Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next-intl` | latest | i18n framework for Next.js 15 App Router |

### Peer Dependencies

next-intl requires:
- `next` >= 13 (project has 15.5.9 - compatible)
- `react` >= 17 (project has 19.1.0 - compatible)

### Internal Dependencies

This task has no dependencies on other L10N tasks (it is the first i18n framework task).

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 2.2: Create i18n configuration module | Requires `/messages/` directory |
| Task 2.3: Update next.config.ts for i18n | Requires next-intl installed |
| Task 2.4: Create IntlProvider wrapper | Requires next-intl installed |
| Task 2.5: Create initial translation file structure | Extends files created here |
| Task 2.6: Verify sample component with t() | Requires all above complete |

---

## 7. Acceptance Criteria

From REQ-229:

- [ ] Internationalization library (`next-intl`) is installed as a project dependency in `package.json`
- [ ] Translation message files exist for all six supported locales: `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- [ ] Messages directory exists at `/messages/` (project root level)
- [ ] Framework is configured to recognize and load translations for each locale (files follow next-intl naming convention)
- [ ] Application can be initialized with any of the six supported languages (valid JSON structure in all files)
- [ ] Translation file structure is consistent and follows framework conventions (same namespace structure across all files)

Additional verification:
- [ ] `npm install` completes without errors
- [ ] All JSON files are valid (no syntax errors)
- [ ] All JSON files have identical key structure
- [ ] Total key count is consistent across all locale files

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Clean Install State:**
   ```bash
   # Check next-intl is not already installed
   npm list next-intl
   # Expected: empty or not found
   ```

### Post-Implementation Verification

2. **Package Installation Check:**
   ```bash
   # Verify package installed
   npm list next-intl
   # Expected: next-intl@x.x.x

   # Verify no peer dependency warnings
   npm ls --depth=0
   ```

3. **Directory Structure Check:**
   ```bash
   ls -la messages/
   # Expected: en.json, fr.json, es.json, de.json, nl.json, it.json
   ```

4. **JSON Validity Check:**
   ```bash
   # Validate all JSON files
   for file in messages/*.json; do
     echo "Validating $file..."
     cat "$file" | python3 -m json.tool > /dev/null && echo "  Valid" || echo "  INVALID"
   done
   ```

5. **Key Structure Consistency Check:**
   ```bash
   # Compare key structures (all files should have same keys)
   # Using jq to extract keys
   for file in messages/*.json; do
     echo "=== $file ==="
     cat "$file" | python3 -c "import json,sys; d=json.load(sys.stdin); print(sorted(d.keys()))"
   done
   ```

6. **Build Verification:**
   ```bash
   # Ensure project still builds after package addition
   npm run build
   # Expected: Build completes successfully
   ```

7. **Type-Check Verification:**
   ```bash
   # Ensure TypeScript still passes
   npx tsc --noEmit
   # Expected: No type errors
   ```

### Manual Verification Checklist

- [ ] `/messages/` directory exists at project root
- [ ] 6 JSON files exist in `/messages/`
- [ ] Each file contains `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces
- [ ] English file has complete translations as source
- [ ] Other locale files have translated stub values
- [ ] `package.json` shows `next-intl` in dependencies
- [ ] `npm run dev` starts without i18n-related errors

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| next-intl incompatible with React 19 | Low | High | Check release notes; fallback to compatible version |
| JSON syntax errors in translation files | Medium | Low | Use JSON validator; copy-paste from template |
| Namespace structure inconsistency | Medium | Medium | Use single source file as template; automated check |
| npm install fails | Low | Low | Clear npm cache; check network connectivity |
| Build breaks after package install | Low | Medium | Run build immediately after install; rollback if needed |
| Git conflicts on package.json | Low | Low | Coordinate with team; resolve before merge |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Install next-intl package | 2 min |
| Create messages directory | 1 min |
| Create en.json (source file) | 10 min |
| Create fr.json | 5 min |
| Create es.json | 5 min |
| Create de.json | 5 min |
| Create nl.json | 5 min |
| Create it.json | 5 min |
| Verification and testing | 10 min |
| **Total** | **~50 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Install next-intl
npm install next-intl

# Step 2: Create messages directory
mkdir -p messages

# Step 3: Create translation files
# (Use file contents from Task sections 2.1.3 - 2.1.8)

# Step 4: Verify installation
npm list next-intl
ls messages/

# Step 5: Validate JSON files
for f in messages/*.json; do python3 -m json.tool "$f" > /dev/null && echo "$f: valid"; done

# Step 6: Verify build still works
npm run build
```

---

## 12. Next Steps After Implementation

After completing Task 2.1 (this task):

1. **Task 2.2:** Create i18n configuration module (`/src/lib/i18n/config.ts`, `/src/lib/i18n/request.ts`)
2. **Task 2.3:** Update next.config.ts for i18n (add next-intl plugin configuration)
3. **Task 2.4:** Create IntlProvider wrapper in `/src/app/layout.tsx`
4. **Task 2.5:** Expand translation file structure with more detailed content
5. **Task 2.6:** Verify sample component using `t()` function works correctly

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl App Router Guide](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Package.json](/package.json)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.1*
