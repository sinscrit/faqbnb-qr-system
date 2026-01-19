# REQ-370: Generate Translations for Dashboard Namespace in 5 Non-English Languages

**Document Created:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Document Type:** Detailed Implementation Specification
**Request Type:** ENHANCEMENT
**Size Estimate:** M (Medium)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.7
**Overview Document:** REQ-370-generate-translations-for-5-non-english-languages-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This task generates high-quality translations for all dashboard namespace keys from English (`/messages/en.json`) into five non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). The task leverages the existing translation service infrastructure established in Epic 1 to produce contextually appropriate translations for the FAQBNB dashboard interface.

**Current State:** The dashboard namespace in `/messages/en.json` contains 17 keys. Corresponding translations already exist in all 5 non-English language files but may need quality review and potential improvements.

**End State:** All dashboard namespace keys have verified, high-quality translations that:
- Use consistent terminology with other namespaces (auth, common, items, errors, language)
- Read naturally to native speakers
- Display correctly in the dashboard UI without layout issues

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Task 2B.1 (Create Dashboard Namespace Structure in `/messages/en.json`) is complete
- [ ] All 17 dashboard keys exist in `/messages/en.json`
- [ ] Translation service is operational (`/src/lib/translation-service/`)
- [ ] Environment variable `ANTHROPIC_API_KEY` is configured (or `OPENAI_API_KEY` for fallback)
- [ ] JSON syntax is valid in all existing translation files

---

## Task Breakdown

### Task 1: Audit Current Dashboard Translations

**Priority:** Required
**Estimated Effort:** 15-20 minutes
**Files to Read:**
- `/messages/en.json` (source)
- `/messages/de.json`
- `/messages/es.json`
- `/messages/fr.json`
- `/messages/it.json`
- `/messages/nl.json`

**Actions:**

1.1. Extract the complete `dashboard` namespace from `/messages/en.json`:
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

1.2. Document all 17 keys requiring translation verification

1.3. Compare existing translations in each non-English file against the English source

1.4. Identify any keys with missing or potentially poor translations:
   - Check for special character issues (umlauts in German, accents in French/Spanish/Italian)
   - Verify terminology consistency with other namespaces
   - Flag any placeholder or literal translations

**Acceptance Criteria:**
- [ ] Complete inventory of all 17 dashboard keys documented
- [ ] Gap analysis report for each language completed
- [ ] Quality issues identified and documented

---

### Task 2: Review German (de) Dashboard Translations

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**File to Modify:** `/messages/de.json`

**Current Translations to Review:**
```json
{
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
  }
}
```

**Actions:**

2.1. Review each translation for accuracy and naturalness

2.2. Fix missing special characters (umlauts):
   - "zuruck" → "zurück"
   - "Aktivitat" → "Aktivität"
   - "Ubersicht" → "Übersicht"

2.3. Verify terminology consistency with `common`, `auth`, and `items` namespaces

2.4. Consider alternative translations for better UX:
   - "Gesamte Immobilien" → "Immobilien gesamt" (more natural)
   - "Schnellaktionen" → "Schnellzugriff" (alternative)

2.5. Update `/messages/de.json` with corrected translations

2.6. Validate JSON syntax after modifications

**Expected Final German Translations:**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Willkommen zurück",
    "properties": "Immobilien",
    "items": "Artikel",
    "analytics": "Analysen",
    "settings": "Einstellungen",
    "recentActivity": "Letzte Aktivität",
    "quickActions": "Schnellaktionen",
    "totalProperties": "Immobilien gesamt",
    "totalItems": "Artikel gesamt",
    "totalScans": "Scans gesamt",
    "activeUsers": "Aktive Benutzer",
    "overview": "Übersicht",
    "createProperty": "Immobilie erstellen",
    "createItem": "Artikel erstellen",
    "viewAll": "Alle anzeigen",
    "noActivity": "Keine aktuellen Aktivitäten"
  }
}
```

**Acceptance Criteria:**
- [ ] All 17 dashboard keys present in de.json
- [ ] All umlauts properly encoded (ä, ö, ü, ß)
- [ ] Translations read naturally in German
- [ ] Terminology consistent with other German translations
- [ ] JSON syntax valid

---

### Task 3: Review Spanish (es) Dashboard Translations

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**File to Modify:** `/messages/es.json`

**Actions:**

3.1. Read current Spanish dashboard translations from `/messages/es.json`

3.2. Review each translation for accuracy and naturalness

3.3. Verify proper accent marks on Spanish characters (á, é, í, ó, ú, ñ)

3.4. Ensure translations match the vacation rental / property management context

3.5. Update `/messages/es.json` with corrected translations

3.6. Validate JSON syntax after modifications

**Expected Final Spanish Translations:**
```json
{
  "dashboard": {
    "title": "Panel de control",
    "welcome": "Bienvenido de nuevo",
    "properties": "Propiedades",
    "items": "Artículos",
    "analytics": "Analíticas",
    "settings": "Configuración",
    "recentActivity": "Actividad reciente",
    "quickActions": "Acciones rápidas",
    "totalProperties": "Total de propiedades",
    "totalItems": "Total de artículos",
    "totalScans": "Total de escaneos",
    "activeUsers": "Usuarios activos",
    "overview": "Resumen",
    "createProperty": "Crear propiedad",
    "createItem": "Crear artículo",
    "viewAll": "Ver todo",
    "noActivity": "Sin actividad reciente"
  }
}
```

**Acceptance Criteria:**
- [ ] All 17 dashboard keys present in es.json
- [ ] All Spanish accent marks properly encoded
- [ ] Translations read naturally in Spanish
- [ ] Terminology consistent with other Spanish translations
- [ ] JSON syntax valid

---

### Task 4: Review French (fr) Dashboard Translations

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**File to Modify:** `/messages/fr.json`

**Actions:**

4.1. Read current French dashboard translations from `/messages/fr.json`

4.2. Review each translation for accuracy and naturalness

4.3. Verify proper accent marks on French characters (é, è, ê, ë, à, â, ô, î, ï, ù, û, ç)

4.4. Ensure translations use appropriate formal/informal register for a professional dashboard

4.5. Update `/messages/fr.json` with corrected translations

4.6. Validate JSON syntax after modifications

**Expected Final French Translations:**
```json
{
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bon retour",
    "properties": "Propriétés",
    "items": "Articles",
    "analytics": "Analytique",
    "settings": "Paramètres",
    "recentActivity": "Activité récente",
    "quickActions": "Actions rapides",
    "totalProperties": "Total des propriétés",
    "totalItems": "Total des articles",
    "totalScans": "Total des scans",
    "activeUsers": "Utilisateurs actifs",
    "overview": "Aperçu",
    "createProperty": "Créer une propriété",
    "createItem": "Créer un article",
    "viewAll": "Voir tout",
    "noActivity": "Aucune activité récente"
  }
}
```

**Acceptance Criteria:**
- [ ] All 17 dashboard keys present in fr.json
- [ ] All French accent marks and cedilla properly encoded
- [ ] Translations read naturally in French
- [ ] Terminology consistent with other French translations
- [ ] JSON syntax valid

---

### Task 5: Review Italian (it) Dashboard Translations

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**File to Modify:** `/messages/it.json`

**Actions:**

5.1. Read current Italian dashboard translations from `/messages/it.json`

5.2. Review each translation for accuracy and naturalness

5.3. Verify proper accent marks on Italian characters (à, è, é, ì, ò, ù)

5.4. Ensure translations match the vacation rental / property management context

5.5. Update `/messages/it.json` with corrected translations

5.6. Validate JSON syntax after modifications

**Expected Final Italian Translations:**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bentornato",
    "properties": "Proprietà",
    "items": "Articoli",
    "analytics": "Analisi",
    "settings": "Impostazioni",
    "recentActivity": "Attività recente",
    "quickActions": "Azioni rapide",
    "totalProperties": "Proprietà totali",
    "totalItems": "Articoli totali",
    "totalScans": "Scansioni totali",
    "activeUsers": "Utenti attivi",
    "overview": "Panoramica",
    "createProperty": "Crea proprietà",
    "createItem": "Crea articolo",
    "viewAll": "Vedi tutto",
    "noActivity": "Nessuna attività recente"
  }
}
```

**Acceptance Criteria:**
- [ ] All 17 dashboard keys present in it.json
- [ ] All Italian accent marks properly encoded
- [ ] Translations read naturally in Italian
- [ ] Terminology consistent with other Italian translations
- [ ] JSON syntax valid

---

### Task 6: Review Dutch (nl) Dashboard Translations

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**File to Modify:** `/messages/nl.json`

**Actions:**

6.1. Read current Dutch dashboard translations from `/messages/nl.json`

6.2. Review each translation for accuracy and naturalness

6.3. Verify proper handling of Dutch special characters and compound words

6.4. Ensure translations match the vacation rental / property management context

6.5. Update `/messages/nl.json` with corrected translations

6.6. Validate JSON syntax after modifications

**Expected Final Dutch Translations:**
```json
{
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
  }
}
```

**Acceptance Criteria:**
- [ ] All 17 dashboard keys present in nl.json
- [ ] Translations read naturally in Dutch
- [ ] Terminology consistent with other Dutch translations
- [ ] JSON syntax valid

---

### Task 7: Cross-Language Terminology Validation

**Priority:** Required
**Estimated Effort:** 15-20 minutes
**Files to Read:** All 6 message files

**Actions:**

7.1. Create a terminology mapping table for key terms across all languages:

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Dashboard | Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard |
| Properties | Immobilien | Propiedades | Propriétés | Proprietà | Eigendommen |
| Items | Artikel | Artículos | Articles | Articoli | Items |
| Settings | Einstellungen | Configuración | Paramètres | Impostazioni | Instellingen |

7.2. Verify terminology consistency between `dashboard` namespace and:
   - `common` namespace (common.* keys)
   - `auth` namespace (auth.* keys)
   - `items` namespace (items.* keys)

7.3. Document any inconsistencies and resolve them

7.4. Ensure "Properties" is translated consistently across all occurrences in all files

**Acceptance Criteria:**
- [ ] Terminology mapping table created and documented
- [ ] No inconsistencies between dashboard namespace and other namespaces
- [ ] Same term translated consistently across all occurrences

---

### Task 8: Technical Validation

**Priority:** Required
**Estimated Effort:** 20-30 minutes
**Files to Validate:** All 6 message files

**Actions:**

8.1. Validate JSON syntax in all translation files:
```bash
# Run from project root
node -e "JSON.parse(require('fs').readFileSync('./messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/de.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/es.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/fr.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/it.json'))"
node -e "JSON.parse(require('fs').readFileSync('./messages/nl.json'))"
```

8.2. Run TypeScript compilation:
```bash
npm run typecheck
# or
npx tsc --noEmit
```

8.3. Run build process:
```bash
npm run build
```

8.4. Check for any translation-related build warnings or errors

**Acceptance Criteria:**
- [ ] All JSON files parse without errors
- [ ] TypeScript compilation succeeds
- [ ] Build completes successfully
- [ ] No translation-related warnings in build output

---

### Task 9: Visual UI Validation

**Priority:** Required
**Estimated Effort:** 30-45 minutes
**Testing Location:** `/dashboard2` route

**Actions:**

9.1. Start the development server:
```bash
npm run dev
```

9.2. Navigate to `/dashboard2` in each language by appending locale:
   - `/en/dashboard2` (English - baseline)
   - `/de/dashboard2` (German)
   - `/es/dashboard2` (Spanish)
   - `/fr/dashboard2` (French)
   - `/it/dashboard2` (Italian)
   - `/nl/dashboard2` (Dutch)

9.3. For each language, verify:
   - [ ] Dashboard title displays correctly
   - [ ] Welcome message displays correctly
   - [ ] Navigation labels (Properties, Items, Analytics, Settings) display correctly
   - [ ] Statistics card labels display correctly
   - [ ] Quick Actions button labels display correctly
   - [ ] Empty state messages display correctly (if applicable)
   - [ ] No text truncation or overflow
   - [ ] No layout breaks due to longer text

9.4. Open browser DevTools and check console for:
   - [ ] No missing translation warnings (`t() returned key:`)
   - [ ] No next-intl errors or warnings

9.5. Test language switching:
   - Use LanguageSwitcher component to cycle through all 6 languages
   - Verify dashboard content updates correctly
   - Verify no flash of untranslated content

**Acceptance Criteria:**
- [ ] All dashboard elements display correctly in all 6 languages
- [ ] No console warnings for missing translations
- [ ] Language switching works seamlessly
- [ ] No layout issues in any language

---

### Task 10: Documentation Update

**Priority:** Required
**Estimated Effort:** 10-15 minutes

**Actions:**

10.1. Update this detailed document with:
   - Actual completion timestamps
   - Any deviations from planned translations
   - Issues encountered and resolutions

10.2. Document any translations that may need future review by native speakers

10.3. Update the overview document (REQ-370-...-overview.md) completion status if needed

**Acceptance Criteria:**
- [ ] Document timestamps updated
- [ ] Any deviations documented
- [ ] Future review items flagged

---

## Translation Reference Quick Guide

### Key Term Glossary

| English | DE | ES | FR | IT | NL | Notes |
|---------|----|----|----|----|----| ------ |
| Dashboard | Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard | Keep English in DE/IT/NL |
| Properties | Immobilien | Propiedades | Propriétés | Proprietà | Eigendommen | Vacation rental context |
| Items | Artikel | Artículos | Articles | Articoli | Items | QR code items |
| Analytics | Analysen | Analíticas | Analytique | Analisi | Analyses | Data/metrics context |
| Settings | Einstellungen | Configuración | Paramètres | Impostazioni | Instellingen | App configuration |
| Overview | Übersicht | Resumen | Aperçu | Panoramica | Overzicht | Summary view |

### Special Character Encoding

Ensure all special characters are properly UTF-8 encoded:

- **German:** ä ö ü ß Ä Ö Ü
- **Spanish:** á é í ó ú ñ Ñ ¿ ¡
- **French:** é è ê ë à â ô î ï ù û ç Ç
- **Italian:** à è é ì ò ù
- **Dutch:** ë ï (rare, usually standard ASCII)

---

## Files Modified Summary

| File | Modification Type | Keys Affected |
|------|-------------------|---------------|
| `/messages/de.json` | Update dashboard namespace | 17 keys |
| `/messages/es.json` | Update dashboard namespace | 17 keys |
| `/messages/fr.json` | Update dashboard namespace | 17 keys |
| `/messages/it.json` | Update dashboard namespace | 17 keys |
| `/messages/nl.json` | Update dashboard namespace | 17 keys |

**Files NOT Modified:**
- `/messages/en.json` - Source of truth, already complete
- `/src/lib/translation-service/*` - Service infrastructure unchanged
- `/src/app/dashboard2/*.tsx` - Component files unchanged (translation integration in earlier tasks)

---

## Rollback Plan

If translations cause issues:

1. **Immediate:** Revert language files to previous commit:
   ```bash
   git checkout HEAD~1 -- messages/de.json messages/es.json messages/fr.json messages/it.json messages/nl.json
   ```

2. **Rebuild:** Run `npm run build` to verify app works with reverted translations

3. **Investigate:** Review specific translation that caused issue

4. **Fix forward:** Correct the problematic translation and re-apply

---

## Acceptance Criteria Checklist

### Translation Completeness
- [ ] German (`de.json`) contains all 17 dashboard namespace keys
- [ ] Spanish (`es.json`) contains all 17 dashboard namespace keys
- [ ] French (`fr.json`) contains all 17 dashboard namespace keys
- [ ] Italian (`it.json`) contains all 17 dashboard namespace keys
- [ ] Dutch (`nl.json`) contains all 17 dashboard namespace keys
- [ ] All keys match exactly between English source and target files

### Translation Quality
- [ ] Translations maintain consistent terminology with other namespaces
- [ ] Navigation labels use culturally appropriate phrasing
- [ ] Dashboard labels and headings read naturally in each language
- [ ] Special characters properly encoded in all files
- [ ] No placeholder or literal translations remain

### Technical Validation
- [ ] JSON syntax valid in all modified files
- [ ] TypeScript compilation succeeds
- [ ] Build completes successfully (`npm run build`)
- [ ] No missing translation warnings in browser console

### User Experience
- [ ] Language switching works seamlessly between all 6 languages
- [ ] No layout breaks due to text length differences
- [ ] Dashboard displays correctly in all languages
- [ ] No text truncation or overflow issues

---

## Notes

- **Translation Service Usage:** If using the translation service API for regeneration, use the test endpoint at `/api/admin/translate` or programmatically via:
  ```typescript
  import { translateToLanguages } from '@/lib/translation-service';

  const result = await translateToLanguages(
    'Welcome back',
    'en',
    ['de', 'es', 'fr', 'it', 'nl'],
    { context: { domainContext: 'vacation rental property management dashboard' } }
  );
  ```

- **Quality Review:** Consider flagging complex translations for native speaker review in future iterations

- **Consistency:** When in doubt about terminology, check existing translations in other namespaces first

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2B Task 2B.7*
