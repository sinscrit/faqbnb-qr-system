# REQ-233: Create Initial Translation File Structure - Implementation Overview

**Generated:** 2026-01-18 00:15:00 UTC
**Last Modified:** 2026-01-18 00:15:00 UTC
**Request Reference:** REQ-233 - Initial Translation File Structure with Namespace Organization
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.5)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create the initial translation file structure with comprehensive namespace organization for the English source locale and stub files for all additional supported locales. This task builds upon the foundation established in Task 2.1 (REQ-229) by populating the translation files with a well-organized namespace structure.

**Scope:**
- Populate `/messages/en.json` with comprehensive translations organized by namespace: `common`, `auth`, `dashboard`, `items`, `errors`, `language`
- Create stub translation files for all other locales (fr, es, de, nl, it) with translated content
- Ensure consistent key structure across all locale files
- Document the namespace organization pattern for developers and translators

**Out of Scope:**
- Installing next-intl (Task 2.1 - REQ-229)
- Creating i18n configuration module (Task 2.2)
- Updating next.config.ts (Task 2.3)
- Creating IntlProvider wrapper (Task 2.4)
- Verifying component integration with t() function (Task 2.6)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Tailwind CSS | ^4 | `package.json` |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Root-level directories | `/database/`, `/docs/`, `/public/` | Standard project organization |
| Context providers | `/src/contexts/AuthContext.tsx` | Provider pattern for app-wide state |
| App layout structure | `/src/app/layout.tsx` | RootLayout with AuthProvider wrapper |
| Component organization | `/src/components/` | Feature-based component grouping |
| Dashboard structure | `/src/app/dashboard/` | Dashboard pages and layouts |

### Current Translation Infrastructure Status

Based on Task 2.1 (REQ-229), the following should already be in place:
- `next-intl` package installed
- `/messages/` directory created at project root
- Basic JSON files for all 6 locales (en, fr, es, de, nl, it)

This task extends the basic translation files with comprehensive, well-organized content.

### Current Application UI Areas

The translation namespaces align with the existing application structure:

| Namespace | Application Area | Example Components |
|-----------|------------------|-------------------|
| `common` | Shared UI elements | Buttons, modals, form controls |
| `auth` | Authentication flows | Login, signup, password reset |
| `dashboard` | Dashboard pages | Stats, navigation, quick actions |
| `items` | Item management | QR code items, articles, properties |
| `errors` | Error handling | Validation, network, authorization |
| `language` | Language switcher | Locale names, selection UI |

---

## 3. Technical Approach

### Namespace Organization Strategy

The translation file structure follows a hierarchical namespace pattern:

```
{
  "namespace": {
    "key": "value",
    "nestedNamespace": {
      "subKey": "subValue"
    }
  }
}
```

**Design Principles:**
1. **Functional Grouping**: Keys grouped by feature area (auth, dashboard, items)
2. **Reusability**: Common UI strings in `common` namespace to avoid duplication
3. **Discoverability**: Intuitive naming that mirrors component structure
4. **Scalability**: Flat-ish structure that allows easy addition of new keys
5. **Consistency**: Same key structure across all locale files

### Namespace Definitions

| Namespace | Purpose | Key Categories |
|-----------|---------|----------------|
| `common` | Shared UI elements used across the app | Actions (save, cancel), states (loading), navigation |
| `auth` | Authentication and authorization text | Sign in/out, form labels, validation messages |
| `dashboard` | Dashboard-specific content | Page titles, stats labels, quick actions |
| `items` | Item and QR code management | CRUD labels, property management, article handling |
| `errors` | Error messages and validation | Form validation, API errors, authorization failures |
| `language` | Language selection UI | Locale names, selection prompts |

### Supported Locales

| Code | Language | Native Name | Status |
|------|----------|-------------|--------|
| `en` | English | English | Source (comprehensive) |
| `fr` | French | Francais | Translated stub |
| `es` | Spanish | Espanol | Translated stub |
| `de` | German | Deutsch | Translated stub |
| `nl` | Dutch | Nederlands | Translated stub |
| `it` | Italian | Italiano | Translated stub |

---

## 4. Implementation Tasks

### Task 2.5.1: Create comprehensive English translation file

**Action:** Create or replace English source file
**File:** `/messages/en.json`

**Content Structure:**
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
    "fr": "Francais",
    "es": "Espanol",
    "de": "Deutsch",
    "nl": "Nederlands",
    "it": "Italiano",
    "changeLanguage": "Change Language",
    "languageChanged": "Language changed successfully"
  }
}
```

### Task 2.5.2: Create French translation file

**Action:** Create or replace French translation file
**File:** `/messages/fr.json`

**Note:** Translation follows the same key structure as English. All keys must be present.

### Task 2.5.3: Create Spanish translation file

**Action:** Create or replace Spanish translation file
**File:** `/messages/es.json`

### Task 2.5.4: Create German translation file

**Action:** Create or replace German translation file
**File:** `/messages/de.json`

### Task 2.5.5: Create Dutch translation file

**Action:** Create or replace Dutch translation file
**File:** `/messages/nl.json`

### Task 2.5.6: Create Italian translation file

**Action:** Create or replace Italian translation file
**File:** `/messages/it.json`

### Task 2.5.7: Verify key consistency across all files

**Action:** Validate all locale files have identical key structure
**Method:** Use automated script or manual comparison

```bash
# Validation command
for file in messages/*.json; do
  echo "=== $file ==="
  cat "$file" | python3 -c "
import json, sys
d = json.load(sys.stdin)
def count_keys(obj, prefix=''):
    count = 0
    for k, v in obj.items():
        if isinstance(v, dict):
            count += count_keys(v, prefix + k + '.')
        else:
            count += 1
    return count
print(f'Total keys: {count_keys(d)}')
print(f'Namespaces: {sorted(d.keys())}')
"
done
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE or REPLACE

| File Path | Description |
|-----------|-------------|
| `/messages/en.json` | English translation file (source) - comprehensive content |
| `/messages/fr.json` | French translation file with translated content |
| `/messages/es.json` | Spanish translation file with translated content |
| `/messages/de.json` | German translation file with translated content |
| `/messages/nl.json` | Dutch translation file with translated content |
| `/messages/it.json` | Italian translation file with translated content |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/app/layout.tsx` | Understand root layout for future i18n integration |
| `/src/app/dashboard/page.tsx` | Reference dashboard terminology |
| `/src/components/` | Review existing component text for translation keys |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/docs/prd/PRD_L10N_Epic1_Foundation.md` | PRD requirements reference |

### Files NOT to Modify

The following files should NOT be modified in this task:
- `/package.json` (already modified in Task 2.1)
- `/next.config.ts` (Task 2.3)
- `/src/app/layout.tsx` (Task 2.4)
- `/src/middleware.ts` (Task 5.2)
- `/src/lib/i18n/` (Task 2.2)
- Any TypeScript/React component files

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Description | Status |
|------|-------------|--------|
| Task 2.1 (REQ-229) | Install and configure next-intl | Must be completed first |

This task depends on Task 2.1 being complete, which:
- Installs `next-intl` package
- Creates `/messages/` directory
- Creates basic locale file structure

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 2.6 | Verify sample component with t() function - requires translations to test |
| Phase 5 tasks | Language switching components need translations |

---

## 7. Acceptance Criteria

From REQ-233 in gen_requests.md:

- [ ] An English translation file exists with all five namespaces defined (common, auth, dashboard, items, errors)
- [ ] Each namespace contains at least one sample translation key to demonstrate structure
- [ ] Stub translation files for at least two additional locales are present and follow the same namespace structure
- [ ] The translation file structure is documented so developers and translators understand the organization pattern
- [ ] Translation files are located in a standard directory that the i18n framework can discover automatically

Additional verification criteria:

- [ ] All 6 locale files exist in `/messages/` directory
- [ ] All JSON files are syntactically valid
- [ ] All locale files have identical key structure (same namespaces, same keys)
- [ ] English file contains comprehensive translations suitable as source of truth
- [ ] Non-English files contain properly translated content
- [ ] Total key count is consistent across all locale files
- [ ] `language` namespace included with locale name translations

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Task 2.1 Completion:**
   ```bash
   # Check next-intl is installed
   npm list next-intl

   # Check messages directory exists
   ls -la messages/
   ```

### Post-Implementation Verification

2. **JSON Validity Check:**
   ```bash
   # Validate all JSON files
   for file in messages/*.json; do
     echo "Validating $file..."
     cat "$file" | python3 -m json.tool > /dev/null && echo "  Valid" || echo "  INVALID"
   done
   ```

3. **Key Structure Consistency Check:**
   ```bash
   # Compare key structures across all files
   for file in messages/*.json; do
     echo "=== $file ==="
     cat "$file" | python3 -c "
import json, sys
d = json.load(sys.stdin)
def get_keys(obj, prefix=''):
    keys = []
    for k, v in sorted(obj.items()):
        full_key = prefix + k if prefix else k
        if isinstance(v, dict):
            keys.extend(get_keys(v, full_key + '.'))
        else:
            keys.append(full_key)
    return keys
keys = get_keys(d)
print(f'Key count: {len(keys)}')
print(f'First 5 keys: {keys[:5]}')
"
   done
   ```

4. **Namespace Verification:**
   ```bash
   # Verify all required namespaces present
   for file in messages/*.json; do
     echo "=== $file ==="
     cat "$file" | python3 -c "
import json, sys
d = json.load(sys.stdin)
required = {'common', 'auth', 'dashboard', 'items', 'errors', 'language'}
present = set(d.keys())
missing = required - present
extra = present - required
print(f'Present: {sorted(present)}')
if missing: print(f'MISSING: {missing}')
if extra: print(f'Extra: {extra}')
"
   done
   ```

5. **Build Verification:**
   ```bash
   # Ensure project still builds
   npm run build
   ```

### Manual Verification Checklist

- [ ] `/messages/en.json` contains all 6 namespaces
- [ ] Each namespace has multiple meaningful keys
- [ ] `/messages/fr.json` has properly translated French content
- [ ] `/messages/es.json` has properly translated Spanish content
- [ ] `/messages/de.json` has properly translated German content
- [ ] `/messages/nl.json` has properly translated Dutch content
- [ ] `/messages/it.json` has properly translated Italian content
- [ ] All files have identical key structure
- [ ] No duplicate keys within any file
- [ ] Values in non-English files are actual translations (not English placeholders)

---

## 9. Translation File Content Reference

### Full English File Structure (en.json)

The English file serves as the source of truth. It should contain:

| Namespace | Key Count | Description |
|-----------|-----------|-------------|
| `common` | ~30 keys | Shared UI actions and states |
| `auth` | ~15 keys | Authentication-related text |
| `dashboard` | ~20 keys | Dashboard-specific labels |
| `items` | ~25 keys | Item/QR code management text |
| `errors` | ~15 keys | Error and validation messages |
| `language` | ~10 keys | Language selection UI |

**Total Expected Keys:** ~115 keys per locale file

### Non-English File Guidelines

For non-English locales:
1. **Structure:** Must match English file exactly (same keys)
2. **Content:** Actual translated text, not placeholders
3. **Formatting:** Maintain any dynamic segments (e.g., `{count}` placeholders)
4. **Length:** Translations may be longer/shorter; design must accommodate
5. **Characters:** Use proper UTF-8 encoding for special characters (e, u, n, etc.)

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Medium | Low | Use JSON validator; copy from verified template |
| Key structure mismatch between files | Medium | Medium | Automated validation script; generate from single source |
| Translation quality issues | Low | Low | Focus on common terms; can refine later |
| Encoding issues with special characters | Low | Medium | Ensure UTF-8 encoding; test rendering |
| Missing keys discovered later | Medium | Low | Structure allows easy addition; not breaking change |
| Task 2.1 not complete | Low | High | Verify prerequisite before starting |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Create comprehensive en.json | 15 min |
| Create fr.json with translations | 10 min |
| Create es.json with translations | 10 min |
| Create de.json with translations | 10 min |
| Create nl.json with translations | 10 min |
| Create it.json with translations | 10 min |
| Verify key consistency | 10 min |
| Testing and validation | 15 min |
| **Total** | **~90 min** |

---

## 12. Implementation Commands Summary

```bash
# Step 1: Verify Task 2.1 is complete
npm list next-intl
ls messages/

# Step 2: Create/update translation files
# (Use file contents from implementation section)

# Step 3: Validate JSON syntax
for f in messages/*.json; do
  python3 -m json.tool "$f" > /dev/null && echo "$f: valid" || echo "$f: INVALID"
done

# Step 4: Verify key counts match
for f in messages/*.json; do
  echo -n "$f: "
  cat "$f" | python3 -c "
import json, sys
def count(d):
    c = 0
    for v in d.values():
        c += count(v) if isinstance(v, dict) else 1
    return c
print(count(json.load(sys.stdin)), 'keys')
"
done

# Step 5: Verify build
npm run build
```

---

## 13. Next Steps After Implementation

After completing Task 2.5 (this task):

1. **Task 2.6:** Verify sample component using `t()` function works correctly
   - Update one existing component to use translations
   - Verify hot reload works with translation changes
   - Confirm namespace access pattern (e.g., `t('common.save')`)

2. **Phase 3-5 tasks** can proceed once i18n framework is fully integrated

---

## 14. Appendix: Sample Translated Content

### French (fr.json) - Sample Namespace

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
    "success": "Succes"
  }
}
```

### Spanish (es.json) - Sample Namespace

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
    "success": "Exito"
  }
}
```

### German (de.json) - Sample Namespace

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
    "success": "Erfolg"
  }
}
```

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl Message Format](https://next-intl-docs.vercel.app/docs/usage/messages)
- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-229: Install and Configure next-intl](/docs/REQ-229-install-and-configure-next-intl-overview.md)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.5*
