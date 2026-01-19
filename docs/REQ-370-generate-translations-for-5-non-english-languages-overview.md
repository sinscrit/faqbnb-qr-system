# REQ-370: Generate Translations for Dashboard Namespace in 5 Non-English Languages

**Document Created:** 2026-01-19 16:15:00 UTC
**Last Modified:** 2026-01-19 16:15:00 UTC
**Document Type:** Implementation Overview
**Request Type:** ENHANCEMENT
**Size Estimate:** M (Medium)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.7
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## 1. Summary

Generate high-quality translations for all dashboard namespace keys in the English translation file (`/messages/en.json`) into five non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). This task leverages the existing translation service infrastructure (Claude/OpenAI providers) established in Epic 1 to produce contextually appropriate translations for the FAQBNB dashboard interface.

This is the final task in Sub-Epic 2B (Dashboard & Navigation), completing the translation coverage for all dashboard UI strings.

---

## 2. Current State Analysis

### 2.1 Existing Dashboard Namespace

The English translation file (`/messages/en.json`) currently contains a `dashboard` namespace with 17 keys:

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

### 2.2 Existing Non-English Translations

All five non-English translation files already contain matching `dashboard` namespace keys with translations:

**German (`/messages/de.json`):**
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

**Note:** Similar translations exist for Spanish, French, Italian, and Dutch.

### 2.3 Translation Service Infrastructure

The translation service is fully operational:

| Component | Location | Status |
|-----------|----------|--------|
| TranslationService | `/src/lib/translation-service/translation-service.ts` | ✅ Complete |
| ClaudeProvider | `/src/lib/translation-service/providers/claude-provider.ts` | ✅ Complete |
| OpenAIProvider | `/src/lib/translation-service/providers/openai-provider.ts` | ✅ Complete |
| Rate Limiter | `/src/lib/translation-service/utils/rate-limiter.ts` | ✅ Complete |
| Retry Logic | `/src/lib/translation-service/utils/retry.ts` | ✅ Complete |
| Test API Endpoint | `/src/app/api/admin/translate/route.ts` | ✅ Complete |

### 2.4 Gap Analysis

Upon inspection, the dashboard namespace translations already exist in all six language files. However, Task 2B.1 (Create Dashboard Namespace Structure) likely expands the namespace with additional nested keys based on component analysis (~158 strings as documented).

**Potential scenarios:**
1. If Task 2B.1 has not yet been executed, this task depends on its completion first
2. If Task 2B.1 has been executed, this task translates the expanded namespace
3. Current translations may need quality review and potential regeneration

---

## 3. Expected Behavior

### 3.1 Translation Requirements

All dashboard namespace keys must have:
- Contextually appropriate translations in each target language
- Consistent terminology with existing translated namespaces (auth, common, items, errors, language)
- Natural, culturally appropriate phrasing for UI elements
- Proper handling of pluralization using ICU message format
- Proper handling of variable interpolation (e.g., `{name}`, `{count}`)

### 3.2 Target Languages

| Language Code | Language Name | Native Name |
|---------------|---------------|-------------|
| de | German | Deutsch |
| es | Spanish | Español |
| fr | French | Français |
| it | Italian | Italiano |
| nl | Dutch | Nederlands |

### 3.3 Translation Quality Standards

1. **Accuracy**: Translations convey the same meaning as English source
2. **Fluency**: Text reads naturally to native speakers
3. **Consistency**: Same terms used across the application (e.g., "Dashboard" → "Tableau de bord" consistently in French)
4. **Context Awareness**: UI-specific terminology (buttons, labels, titles) uses appropriate register
5. **Format Preservation**: ICU placeholders and variables preserved exactly

### 3.4 Translation Context

All translations should be generated with the following context hints:
- **Domain**: Vacation rental property management / QR code item tracking
- **Content Type**: UI strings (navigation, labels, buttons, status messages)
- **Audience**: Property managers, Airbnb hosts, rental owners

---

## 4. Implementation Tasks

### Task 1: Verify Dashboard Namespace Completion
**Prerequisite Check**
**Actions:**
1. Review `/messages/en.json` to confirm the expanded dashboard namespace from Task 2B.1 is complete
2. Document the final list of keys requiring translation
3. If Task 2B.1 is incomplete, wait for its completion before proceeding

### Task 2: Create Translation Script/Process
**File:** New script or manual process using translation service API
**Actions:**
1. Enumerate all dashboard namespace keys from English source
2. Group keys by content type for batch processing with appropriate context
3. Configure translation service with vacation rental domain context

### Task 3: Generate German Translations
**File:** `/messages/de.json`
**Actions:**
1. Extract all dashboard namespace keys requiring translation
2. Call translation service with source language 'en', target 'de'
3. Review generated translations for quality
4. Update de.json with final translations
5. Verify JSON syntax validity

### Task 4: Generate Spanish Translations
**File:** `/messages/es.json`
**Actions:**
1. Call translation service with source language 'en', target 'es'
2. Review generated translations for quality
3. Update es.json with final translations
4. Verify JSON syntax validity

### Task 5: Generate French Translations
**File:** `/messages/fr.json`
**Actions:**
1. Call translation service with source language 'en', target 'fr'
2. Review generated translations for quality
3. Update fr.json with final translations
4. Verify JSON syntax validity

### Task 6: Generate Italian Translations
**File:** `/messages/it.json`
**Actions:**
1. Call translation service with source language 'en', target 'it'
2. Review generated translations for quality
3. Update it.json with final translations
4. Verify JSON syntax validity

### Task 7: Generate Dutch Translations
**File:** `/messages/nl.json`
**Actions:**
1. Call translation service with source language 'en', target 'nl'
2. Review generated translations for quality
3. Update nl.json with final translations
4. Verify JSON syntax validity

### Task 8: Validate Translations
**Actions:**
1. Run TypeScript compilation to verify no type errors
2. Run `npm run build` to verify build succeeds
3. Manually inspect dashboard UI in each language for correct display
4. Verify no missing translation warnings in browser console
5. Check for layout breaks due to text length differences

### Task 9: Cross-Language Consistency Check
**Actions:**
1. Compare terminology across all translated namespaces
2. Ensure "Dashboard" → "Tableau de bord" (fr), "Panel de control" (es), etc. is consistent
3. Verify navigation labels match across auth, dashboard, and common namespaces

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files (MODIFY)

| File Path | Modification Type | Keys Affected |
|-----------|-------------------|---------------|
| `/messages/de.json` | Update `dashboard` namespace with translations | All dashboard.* keys |
| `/messages/es.json` | Update `dashboard` namespace with translations | All dashboard.* keys |
| `/messages/fr.json` | Update `dashboard` namespace with translations | All dashboard.* keys |
| `/messages/it.json` | Update `dashboard` namespace with translations | All dashboard.* keys |
| `/messages/nl.json` | Update `dashboard` namespace with translations | All dashboard.* keys |

### 5.2 Optional Script Files (CREATE if needed)

| File Path | Purpose |
|-----------|---------|
| `/scripts/translate-namespace.ts` | Batch translation script using translation service |
| `/scripts/validate-translations.ts` | Validation script for translation completeness |

### 5.3 Files NOT to Modify

The following files should **NOT** be modified in this task:

| File Path | Reason |
|-----------|--------|
| `/messages/en.json` | Source of truth - already complete from Task 2B.1 |
| `/src/lib/translation-service/*` | Translation service is already complete |
| `/src/app/api/admin/translate/route.ts` | Testing endpoint - already functional |
| `/src/app/dashboard2/*.tsx` | Component files - translation integration in separate tasks |
| `/src/components/SimpleDashboard/*.tsx` | Component files - translation integration in separate tasks |
| `/src/lib/i18n/config.ts` | i18n configuration - already complete from Epic 1 |

---

## 6. Technical Considerations

### 6.1 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2B.1 (Dashboard Namespace Structure) | ⚠️ Check | Must be complete before this task |
| Translation Service (REQ-240) | ✅ Complete | Available at `/src/lib/translation-service/` |
| Claude API Key | ✅ Required | Environment variable `ANTHROPIC_API_KEY` |
| OpenAI API Key | ⚠️ Optional | Fallback provider if Claude unavailable |

### 6.2 Translation Service Usage

Using the translation service programmatically:

```typescript
import {
  translateToLanguages,
  ALL_SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from '@/lib/translation-service';

// Single text to multiple languages
const result = await translateToLanguages(
  'Welcome back',          // English source text
  'en',                    // Source language
  ['de', 'es', 'fr', 'it', 'nl'], // Target languages
  {
    context: {
      contentType: 'item_name',  // UI string type hint
      domainContext: 'vacation rental property management dashboard'
    }
  }
);

// Access translations
console.log(result.translations.de); // "Willkommen zurück"
console.log(result.translations.fr); // "Bon retour"
```

### 6.3 Batch Translation Strategy

For efficiency, translations should be batched by semantic group:

1. **Navigation labels**: Dashboard, Items, Properties, Settings, etc.
2. **Statistics labels**: Total Items, Total Scans, Active Users, etc.
3. **Action buttons**: Create Property, Create Item, View All, etc.
4. **Empty states**: No items yet, No recent activity, etc.
5. **Status messages**: Loading, Saving, Success, etc.
6. **Settings labels**: Show Advanced Tools, Dashboard Settings, etc.

### 6.4 ICU Message Format Handling

For strings with pluralization or variables, preserve the exact ICU syntax:

**English source:**
```json
{
  "dashboard.bulk.selected": "{count} selected"
}
```

**Correct German translation:**
```json
{
  "dashboard.bulk.selected": "{count} ausgewählt"
}
```

**DO NOT translate the variable name `{count}`**

### 6.5 API Rate Limiting

The translation service includes rate limiting:
- Claude: 50 requests/minute, 100,000 tokens/minute (configurable)
- OpenAI: 60 requests/minute, 150,000 tokens/minute (configurable)

For ~158 dashboard keys across 5 languages (~790 translation calls), batch requests are recommended to stay within limits.

---

## 7. Acceptance Criteria Checklist

### 7.1 Translation Completeness
- [ ] German (`de.json`) contains all dashboard namespace keys with German translations
- [ ] Spanish (`es.json`) contains all dashboard namespace keys with Spanish translations
- [ ] French (`fr.json`) contains all dashboard namespace keys with French translations
- [ ] Italian (`it.json`) contains all dashboard namespace keys with Italian translations
- [ ] Dutch (`nl.json`) contains all dashboard namespace keys with Dutch translations
- [ ] All translation keys match exactly between English source and target language files

### 7.2 Translation Quality
- [ ] Translations maintain consistent terminology with previously translated namespaces
- [ ] Navigation menu items use culturally appropriate phrasing for each language
- [ ] Dashboard section labels and headings read naturally in each target language
- [ ] Action button labels are concise and action-oriented in each language
- [ ] No placeholder or machine-translated text remains in final translation files

### 7.3 Technical Validation
- [ ] JSON syntax is valid in all modified translation files
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build completes successfully (`npm run build`)
- [ ] Browser console shows no missing translation warnings in dashboard views
- [ ] Dashboard components display correctly in all five non-English languages

### 7.4 User Experience
- [ ] Language switching between all six supported languages works seamlessly
- [ ] No layout breaks due to longer text in non-English languages
- [ ] Page titles and metadata display correctly in each language
- [ ] Empty states display appropriate messages in each language

---

## 8. Translation Reference Table

Expected translations for key dashboard terms (for quality verification):

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Dashboard | Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard |
| Properties | Immobilien | Propiedades | Propriétés | Proprietà | Eigendommen |
| Items | Artikel | Artículos | Articles | Articoli | Items |
| Analytics | Analysen | Analíticas | Analytique | Analisi | Analyses |
| Settings | Einstellungen | Configuración | Paramètres | Impostazioni | Instellingen |
| Create Property | Immobilie erstellen | Crear propiedad | Créer une propriété | Crea proprietà | Eigendom maken |
| Create Item | Artikel erstellen | Crear artículo | Créer un article | Crea articolo | Item maken |
| View All | Alle anzeigen | Ver todo | Voir tout | Vedi tutto | Alles bekijken |
| Loading... | Laden... | Cargando... | Chargement... | Caricamento... | Laden... |
| No recent activity | Keine aktuelle Aktivität | Sin actividad reciente | Aucune activité récente | Nessuna attività recente | Geen recente activiteit |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Verify namespace completion | 15 minutes |
| Set up translation process | 30 minutes |
| Generate German translations | 30 minutes |
| Generate Spanish translations | 30 minutes |
| Generate French translations | 30 minutes |
| Generate Italian translations | 30 minutes |
| Generate Dutch translations | 30 minutes |
| Validate all translations | 45 minutes |
| Cross-language consistency check | 30 minutes |
| **Total** | **~4-5 hours** |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation service unavailable | Low | High | Use fallback provider (OpenAI if Claude fails) |
| Poor translation quality | Medium | Medium | Manual review of generated translations |
| Inconsistent terminology | Medium | Medium | Create glossary, cross-reference existing translations |
| Rate limiting issues | Low | Low | Batch translations, add delays between calls |
| Missing keys from Task 2B.1 | Medium | High | Verify Task 2B.1 completion before starting |
| JSON syntax errors | Low | High | Validate JSON after each modification |
| Layout breaks in UI | Medium | Medium | Test each language in browser, adjust if needed |

---

## 11. Post-Implementation Verification

After completing translations, verify with these manual tests:

1. **Visual Inspection**
   - Navigate to `/dashboard2` in each of the 6 languages
   - Verify all text displays without fallback to English
   - Check for text truncation or overflow

2. **Console Verification**
   - Open browser DevTools
   - Check for missing translation warnings
   - Verify no t() function errors

3. **Language Switching**
   - Use language switcher to cycle through all 6 languages
   - Verify dashboard content updates correctly
   - Check URL and cookie reflect language change

4. **Component Coverage**
   - StatisticsCards labels
   - ActionButtons text
   - Empty states
   - Settings popover
   - Bulk operations toolbar

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-364: Create Dashboard Namespace Structure](/docs/REQ-364-create-dashboard-namespace-structure-overview.md)
- [Translation Service Documentation](/src/lib/translation-service/README.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
