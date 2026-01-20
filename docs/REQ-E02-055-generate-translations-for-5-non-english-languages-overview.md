# REQ-E02-055: Generate Translations for Dashboard and Navigation Namespace

**Document Created:** 2026-01-20 17:30:00 UTC
**Last Modified:** 2026-01-20 17:30:00 UTC
**Request Type:** ENHANCEMENT
**Size:** L (Large)
**Phase:** 2B (Dashboard & Navigation)
**Task ID:** 2B.7
**Epic:** L10N Epic 2 - Static UI Translation

---

## 1. Summary

Generate complete translation JSON files for the `dashboard` namespace (and related navigation strings) in all five non-English target languages: Spanish (es), French (fr), German (de), Italian (it), and Dutch (nl). This task completes the internationalization of the dashboard and navigation components by delivering actual translations that make the dashboard genuinely multilingual.

---

## 2. Dependencies

### 2.1 Epic 1 Foundation (Required - Complete)
- `next-intl` package installed and configured
- `/messages/*.json` translation file structure established
- `IntlProvider` wrapper in `/src/app/layout.tsx`
- i18n configuration in `/src/lib/i18n/config.ts`

### 2.2 Prior Sub-Epic 2B Tasks (Required)
- **Task 2B.1:** `dashboard` namespace structure created in `/messages/en.json`
- **Task 2B.2-2B.6:** Dashboard components updated to use `useTranslations` hook

### 2.3 Related Namespaces
- `common` namespace (for shared action verbs like "View All", "Create")
- `navigation` namespace (if separated from dashboard)

---

## 3. Current State Analysis

### 3.1 Existing Translation Files

| File | Status | Dashboard Keys |
|------|--------|----------------|
| `/messages/en.json` | Complete | ~20 keys |
| `/messages/fr.json` | Partial | ~20 keys (needs review) |
| `/messages/es.json` | Partial | ~20 keys (needs review) |
| `/messages/de.json` | Needs creation | 0 keys |
| `/messages/nl.json` | Needs creation | 0 keys |
| `/messages/it.json` | Needs creation | 0 keys |

### 3.2 Current English Dashboard Namespace Structure

```json
{
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
  }
}
```

### 3.3 Hardcoded Strings Requiring Translation (From Component Analysis)

From `/src/components/SimpleDashboard/StatisticsCards.tsx`:
- "Items", "Rooms", "Tags" (stat card labels)
- "Start adding new QR Code items and create guides/instructions" (empty state)
- "New QR Code Item" (CTA button)
- "(all properties)" (property context label)
- "Loading statistics" (skeleton aria-label)

From `/src/app/dashboard2/layout.tsx`:
- "Dashboard", "Items", "Guides", "Properties" (navigation items)
- "D/B", "Items", "Guide", "Prop." (mobile navigation labels)
- "Loading dashboard...", "Redirecting to login...", "Loading..." (loading states)
- "Logout" (button text)

---

## 4. Implementation Requirements

### 4.1 Translation Keys to Add/Expand

The `dashboard` namespace needs expansion to cover all identified strings:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "overview": "Overview",

    "nav": {
      "dashboard": "Dashboard",
      "dashboardMobile": "D/B",
      "items": "Items",
      "itemsMobile": "Items",
      "guides": "Guides",
      "guidesMobile": "Guide",
      "properties": "Properties",
      "propertiesMobile": "Prop."
    },

    "stats": {
      "items": "Items",
      "rooms": "Rooms",
      "tags": "Tags",
      "allProperties": "(all properties)",
      "loadingStats": "Loading statistics"
    },

    "quickActions": "Quick Actions",
    "createProperty": "Create Property",
    "createItem": "Create Item",
    "viewAll": "View All",

    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "action": "New QR Code Item"
    },

    "loading": {
      "dashboard": "Loading dashboard...",
      "redirecting": "Redirecting to login...",
      "generic": "Loading..."
    },

    "recentActivity": "Recent Activity",
    "noActivity": "No recent activity",

    "totalProperties": "Total Properties",
    "totalItems": "Total Items",
    "totalScans": "Total Scans",
    "activeUsers": "Active Users",

    "logout": "Logout"
  }
}
```

### 4.2 Translation Quality Requirements

1. **Consistency**: Use terminology consistent with previously translated `common` namespace
2. **Conciseness**: Navigation labels must fit UI constraints (especially mobile variants)
3. **Context-Appropriate**: "Dashboard" should use standard local terminology (e.g., "Tableau de bord" in French)
4. **ICU Format**: Use proper plural forms where applicable
5. **Variable Preservation**: Maintain all `{variable}` placeholders exactly as in English

### 4.3 Language-Specific Considerations

| Language | Notes |
|----------|-------|
| **Spanish (es)** | Use formal "usted" form, Latin American neutral Spanish |
| **French (fr)** | Use formal "vous" form, standard French (not Canadian) |
| **German (de)** | Use formal "Sie" form, standard High German |
| **Italian (it)** | Use formal "Lei" form, standard Italian |
| **Dutch (nl)** | Use formal "u" form, standard Dutch (Netherlands) |

---

## 5. Ordered Implementation Tasks

### Task 1: Verify and Expand English Source Keys
**Priority:** High | **Estimate:** 30 minutes

1. Review `/messages/en.json` for completeness of `dashboard` namespace
2. Add any missing keys identified in component analysis
3. Ensure proper nesting structure matches component usage
4. Validate JSON structure

### Task 2: Generate Spanish (es) Translations
**Priority:** High | **Estimate:** 45 minutes

1. Open `/messages/es.json`
2. Translate all `dashboard` namespace keys to Spanish
3. Ensure consistency with existing `common.es` translations
4. Verify mobile labels are concise
5. Validate JSON structure and encoding (UTF-8)

### Task 3: Generate French (fr) Translations
**Priority:** High | **Estimate:** 45 minutes

1. Open `/messages/fr.json`
2. Translate all `dashboard` namespace keys to French
3. Ensure consistency with existing `common.fr` translations
4. Verify mobile labels are concise
5. Validate JSON structure and encoding (UTF-8)

### Task 4: Generate German (de) Translations
**Priority:** High | **Estimate:** 45 minutes

1. Open `/messages/de.json`
2. Translate all `dashboard` namespace keys to German
3. Ensure consistency with existing `common.de` translations
4. Note: German text is typically 20-30% longer than English
5. Verify mobile labels are concise
6. Validate JSON structure and encoding (UTF-8)

### Task 5: Generate Italian (it) Translations
**Priority:** High | **Estimate:** 45 minutes

1. Open `/messages/it.json`
2. Translate all `dashboard` namespace keys to Italian
3. Ensure consistency with existing `common.it` translations
4. Verify mobile labels are concise
5. Validate JSON structure and encoding (UTF-8)

### Task 6: Generate Dutch (nl) Translations
**Priority:** High | **Estimate:** 45 minutes

1. Open `/messages/nl.json`
2. Translate all `dashboard` namespace keys to Dutch
3. Ensure consistency with existing `common.nl` translations
4. Verify mobile labels are concise
5. Validate JSON structure and encoding (UTF-8)

### Task 7: Validation and Testing
**Priority:** High | **Estimate:** 1 hour

1. Run JSON linting on all 6 translation files
2. Verify all language files have identical key structures
3. Test in development environment with each locale
4. Verify no truncation issues in UI
5. Check console for missing translation warnings

---

## 6. Authorized Files and Functions for Modification

### 6.1 Translation Files (Primary Targets)

| File | Modification Type | Notes |
|------|-------------------|-------|
| `/messages/en.json` | EXPAND | Add missing `dashboard` namespace keys |
| `/messages/es.json` | EXPAND | Add/update Spanish translations |
| `/messages/fr.json` | EXPAND | Add/update French translations |
| `/messages/de.json` | EXPAND | Add/update German translations |
| `/messages/it.json` | EXPAND | Add/update Italian translations |
| `/messages/nl.json` | EXPAND | Add/update Dutch translations |

### 6.2 Scope Constraints

- **DO NOT** modify any TypeScript/TSX component files
- **DO NOT** modify i18n configuration files
- **DO NOT** add new namespaces beyond `dashboard`
- **ONLY** modify the `dashboard` namespace within each JSON file

---

## 7. Expected Translations Reference

### 7.1 Spanish (es) Sample

```json
{
  "dashboard": {
    "title": "Panel de control",
    "welcome": "Bienvenido de nuevo",
    "nav": {
      "dashboard": "Panel",
      "dashboardMobile": "Panel",
      "items": "Artículos",
      "itemsMobile": "Art.",
      "guides": "Guías",
      "guidesMobile": "Guías",
      "properties": "Propiedades",
      "propertiesMobile": "Prop."
    },
    "stats": {
      "items": "Artículos",
      "rooms": "Habitaciones",
      "tags": "Etiquetas",
      "allProperties": "(todas las propiedades)",
      "loadingStats": "Cargando estadísticas"
    },
    "empty": {
      "title": "Comienza a agregar artículos con código QR y crea guías/instrucciones",
      "action": "Nuevo Artículo QR"
    },
    "loading": {
      "dashboard": "Cargando panel...",
      "redirecting": "Redirigiendo al inicio de sesión...",
      "generic": "Cargando..."
    },
    "logout": "Cerrar sesión"
  }
}
```

### 7.2 French (fr) Sample

```json
{
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bon retour",
    "nav": {
      "dashboard": "Tableau de bord",
      "dashboardMobile": "T/B",
      "items": "Articles",
      "itemsMobile": "Art.",
      "guides": "Guides",
      "guidesMobile": "Guide",
      "properties": "Propriétés",
      "propertiesMobile": "Prop."
    },
    "stats": {
      "items": "Articles",
      "rooms": "Pièces",
      "tags": "Étiquettes",
      "allProperties": "(toutes les propriétés)",
      "loadingStats": "Chargement des statistiques"
    },
    "empty": {
      "title": "Commencez à ajouter des articles QR Code et créez des guides/instructions",
      "action": "Nouvel Article QR"
    },
    "loading": {
      "dashboard": "Chargement du tableau de bord...",
      "redirecting": "Redirection vers la connexion...",
      "generic": "Chargement..."
    },
    "logout": "Déconnexion"
  }
}
```

### 7.3 German (de) Sample

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Willkommen zurück",
    "nav": {
      "dashboard": "Dashboard",
      "dashboardMobile": "D/B",
      "items": "Artikel",
      "itemsMobile": "Art.",
      "guides": "Anleitungen",
      "guidesMobile": "Anl.",
      "properties": "Immobilien",
      "propertiesMobile": "Imm."
    },
    "stats": {
      "items": "Artikel",
      "rooms": "Räume",
      "tags": "Tags",
      "allProperties": "(alle Immobilien)",
      "loadingStats": "Statistiken werden geladen"
    },
    "empty": {
      "title": "Beginnen Sie mit dem Hinzufügen von QR-Code-Artikeln und erstellen Sie Anleitungen",
      "action": "Neuer QR-Artikel"
    },
    "loading": {
      "dashboard": "Dashboard wird geladen...",
      "redirecting": "Weiterleitung zur Anmeldung...",
      "generic": "Wird geladen..."
    },
    "logout": "Abmelden"
  }
}
```

### 7.4 Italian (it) Sample

```json
{
  "dashboard": {
    "title": "Pannello di controllo",
    "welcome": "Bentornato",
    "nav": {
      "dashboard": "Pannello",
      "dashboardMobile": "P/C",
      "items": "Articoli",
      "itemsMobile": "Art.",
      "guides": "Guide",
      "guidesMobile": "Guide",
      "properties": "Proprietà",
      "propertiesMobile": "Prop."
    },
    "stats": {
      "items": "Articoli",
      "rooms": "Stanze",
      "tags": "Tag",
      "allProperties": "(tutte le proprietà)",
      "loadingStats": "Caricamento statistiche"
    },
    "empty": {
      "title": "Inizia ad aggiungere articoli con codice QR e crea guide/istruzioni",
      "action": "Nuovo Articolo QR"
    },
    "loading": {
      "dashboard": "Caricamento pannello...",
      "redirecting": "Reindirizzamento al login...",
      "generic": "Caricamento..."
    },
    "logout": "Esci"
  }
}
```

### 7.5 Dutch (nl) Sample

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welkom terug",
    "nav": {
      "dashboard": "Dashboard",
      "dashboardMobile": "D/B",
      "items": "Items",
      "itemsMobile": "Items",
      "guides": "Handleidingen",
      "guidesMobile": "Hand.",
      "properties": "Eigendommen",
      "propertiesMobile": "Eig."
    },
    "stats": {
      "items": "Items",
      "rooms": "Kamers",
      "tags": "Tags",
      "allProperties": "(alle eigendommen)",
      "loadingStats": "Statistieken laden"
    },
    "empty": {
      "title": "Begin met het toevoegen van QR-code items en maak handleidingen/instructies",
      "action": "Nieuw QR Item"
    },
    "loading": {
      "dashboard": "Dashboard laden...",
      "redirecting": "Doorverwijzen naar inloggen...",
      "generic": "Laden..."
    },
    "logout": "Uitloggen"
  }
}
```

---

## 8. Acceptance Criteria

### 8.1 File Completeness
- [ ] Spanish (es) translation file has all dashboard namespace keys
- [ ] French (fr) translation file has all dashboard namespace keys
- [ ] German (de) translation file has all dashboard namespace keys
- [ ] Italian (it) translation file has all dashboard namespace keys
- [ ] Dutch (nl) translation file has all dashboard namespace keys

### 8.2 Translation Quality
- [ ] Dashboard stats labels maintain consistent terminology across all languages
- [ ] Navigation menu items use standard localization conventions
- [ ] Quick action labels are concise and actionable
- [ ] Welcome messages sound natural and culturally appropriate
- [ ] No machine-translation artifacts remain

### 8.3 Technical Quality
- [ ] All variable placeholders preserved exactly as in English
- [ ] JSON files properly formatted with UTF-8 encoding
- [ ] Translation file structure matches English source exactly
- [ ] Length of translated strings appropriate for UI constraints
- [ ] All six languages load successfully in development

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| German text exceeds UI width | High | Medium | Use abbreviated mobile labels, test with longest strings |
| Inconsistent terminology with common namespace | Medium | Medium | Review common translations before starting |
| Missing keys in source English file | Medium | High | Complete component analysis first |
| Encoding issues with special characters | Low | High | Ensure UTF-8 encoding, test accented characters |

---

## 10. Testing Strategy

1. **Syntax Validation**: Run JSON linting on all files
2. **Key Parity Check**: Compare key counts across all 6 files
3. **Visual Inspection**: Load dashboard in each language
4. **Mobile Layout**: Test navigation labels on mobile viewport
5. **Console Check**: Verify no missing translation warnings

---

## 11. References

- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan-110: L10N Epic 1 - Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Generated by Technical Lead Agent for FAQBNB L10N Epic 2 Implementation*
