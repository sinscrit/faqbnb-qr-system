# REQ-346: Generate Translations for All 5 Non-English Languages - Implementation Overview

*Generated: 2026-01-19 21:30:00 UTC*
*Last Modified: 2026-01-19 21:30:00 UTC*

## Reference
- **Request**: REQ-346 (Generate Translations for All Non-English Common Namespace Keys)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Translation Generation)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.10
- **Size**: L (Large)
- **Priority**: Foundation Completion Task

## Goals

1. Generate complete, culturally appropriate translations for all common namespace keys across Spanish, French, German, Italian, and Dutch
2. Ensure translation quality with accurate terminology, proper grammatical forms, and consistent formality levels
3. Preserve ICU message format syntax including pluralization rules and variable interpolation placeholders
4. Validate translation completeness at 100% for the common namespace across all 5 target languages
5. Update all non-English translation files (`es.json`, `fr.json`, `de.json`, `it.json`, `nl.json`) with professional-quality translations

## Context from Implementation Plan

### Sub-Epic 2H Position in Workflow

Per Plan-111, Task 2H.10 is the translation generation task that finalizes the common namespace setup. It follows:
- Task 2H.1: Create common namespace structure
- Tasks 2H.2-2H.9: Extract strings from various component categories

This task generates the actual non-English translations after the English source strings have been finalized.

### Current State Analysis

#### English Source (`/messages/en.json`) - Source of Truth

The English file contains the complete common namespace structure with the following categories:
- `common` (flat): ~33 keys including save, cancel, delete, edit, etc.
- `auth`: ~19 authentication-related keys
- `dashboard`: ~18 dashboard navigation keys
- `items`: ~26 item management keys
- `errors`: ~17 error message keys
- `language`: ~10 language selection keys

#### Non-English Files Status

Current state of translation files (from codebase analysis):

| Language | File | Status | Keys Matched |
|----------|------|--------|--------------|
| Spanish | `/messages/es.json` | Partially translated | ~123 keys |
| French | `/messages/fr.json` | Partially translated | ~123 keys |
| German | `/messages/de.json` | Partially translated | ~123 keys |
| Italian | `/messages/it.json` | Partially translated | ~123 keys |
| Dutch | `/messages/nl.json` | Partially translated | ~123 keys |

#### Quality Issues Identified

From manual inspection:
- Some translations missing proper diacritical marks (e.g., French "é" rendered as "e")
- Minor inconsistencies in formality level across languages
- Need verification of gender agreement in gendered languages (French, German, Italian, Spanish)

### Dependencies

- **Prerequisite**: Tasks 2H.1-2H.9 complete (common namespace structure and string extraction)
- **Verified**: `/messages/en.json` has complete common namespace structure
- **Verified**: Translation service infrastructure exists (`/src/lib/translation-service/`)
- **Available**: Claude and OpenAI translation providers configured

## Implementation Order

### Step 1: Audit Current English Source Keys

Review `/messages/en.json` to catalog all keys requiring translation:

**Common Namespace Keys (~33):**
```
common.save, common.cancel, common.delete, common.edit, common.create,
common.loading, common.error, common.success, common.confirm, common.back,
common.next, common.close, common.search, common.filter, common.sort,
common.actions, common.yes, common.no, common.submit, common.reset,
common.clear, common.select, common.view, common.download, common.upload,
common.copy, common.share, common.more, common.less, common.all,
common.none, common.optional, common.required
```

**Auth Namespace Keys (~19):**
```
auth.signIn, auth.signOut, auth.confirmLogout, auth.confirmSignOutMessage,
auth.signUp, auth.email, auth.password, auth.forgotPassword, auth.resetPassword,
auth.continueWithGoogle, auth.rememberMe, auth.noAccount, auth.hasAccount,
auth.createAccount, auth.verifyEmail, auth.resendVerification, auth.welcomeBack,
auth.loggedInAs
```

**Dashboard Namespace Keys (~18):**
```
dashboard.title, dashboard.welcome, dashboard.properties, dashboard.items,
dashboard.analytics, dashboard.settings, dashboard.recentActivity,
dashboard.quickActions, dashboard.totalProperties, dashboard.totalItems,
dashboard.totalScans, dashboard.activeUsers, dashboard.overview,
dashboard.createProperty, dashboard.createItem, dashboard.viewAll, dashboard.noActivity
```

**Items Namespace Keys (~26):**
```
items.createNew, items.noItems, items.name, items.description, items.property,
items.qrCode, items.articles, items.addArticle, items.editItem, items.deleteItem,
items.viewItem, items.printQrCode, items.downloadQrCode, items.scanCount,
items.lastScanned, items.createdAt, items.updatedAt, items.selectProperty,
items.itemDetails, items.noArticles, items.addFirstArticle, items.room,
items.tags, items.addTag, items.removeTag
```

**Errors Namespace Keys (~17):**
```
errors.required, errors.invalidEmail, errors.networkError, errors.unauthorized,
errors.notFound, errors.serverError, errors.validationFailed, errors.sessionExpired,
errors.tooManyRequests, errors.invalidCredentials, errors.emailTaken,
errors.passwordTooWeak, errors.uploadFailed, errors.fileTooLarge,
errors.invalidFileType, errors.genericError
```

**Language Namespace Keys (~10):**
```
language.select, language.current, language.en, language.fr, language.es,
language.de, language.nl, language.it, language.changeLanguage, language.languageChanged
```

### Step 2: Configure Translation Context

Set up translation context for the AI translation service to ensure domain-appropriate translations:

```typescript
const translationContext: TranslationContext = {
  contentType: 'ui_string',
  domainContext: 'vacation rental property management application',
  formalityLevel: 'professional', // Use formal "vous" in French, "Sie" in German
  preservePlaceholders: true,
  additionalInstructions: [
    'Maintain consistent terminology for property/items/QR codes across all strings',
    'Use industry-standard localization for UI elements (button labels, form fields)',
    'Preserve any ICU message format syntax like {count, plural, ...}'
  ]
};
```

### Step 3: Generate Translations for Each Language

Execute translation generation using the translation service for each target language.

**Language-Specific Considerations:**

#### Spanish (es.json)
- Use Latin American neutral Spanish (understood across regions)
- Informal "tú" register for user-facing text (common in tech applications)
- Proper accent marks: á, é, í, ó, ú, ñ

#### French (fr.json)
- Use formal "vous" register (professional application context)
- Proper accent marks: é, è, ê, ë, à, â, ç, ô, î, û, ù
- Gender agreement for adjectives and past participles

#### German (de.json)
- Use formal "Sie" register
- Proper capitalization of nouns (German capitalizes all nouns)
- Compound words where appropriate
- Special characters: ä, ö, ü, ß

#### Italian (it.json)
- Use formal "Lei" register
- Proper accent marks: à, è, é, ì, ò, ù
- Gender agreement for adjectives and nouns

#### Dutch (nl.json)
- Use formal "u" register
- Proper spelling with ij, Dutch-specific letter combinations
- Compound words where appropriate

### Step 4: Validate Translation Output

Perform automated validation checks:

1. **Key Parity Check**: All keys in en.json exist in each target language file
2. **ICU Syntax Check**: Verify placeholders like `{count}`, `{name}` are preserved
3. **Character Encoding Check**: Verify proper UTF-8 encoding of diacritical marks
4. **JSON Validity Check**: Ensure all files are valid JSON

### Step 5: Apply Translations to Files

Update each language file with generated translations, preserving the exact JSON structure from en.json.

### Step 6: Quality Review

- Review translations for consistency within each language
- Verify formality level is consistent
- Check for any machine translation artifacts

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**: Generate complete translations for all namespaces
- **Validation**:
  - All ~123 keys translated to Spanish
  - Proper accent marks (á, é, í, ó, ú, ñ, ü)
  - Consistent informal register ("tú")

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**: Generate complete translations for all namespaces
- **Validation**:
  - All ~123 keys translated to French
  - Proper accent marks (é, è, ê, à, â, ç, etc.)
  - Consistent formal register ("vous")
  - Gender agreement verified

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**: Generate complete translations for all namespaces
- **Validation**:
  - All ~123 keys translated to German
  - Proper noun capitalization
  - Umlauts (ä, ö, ü) and ß used correctly
  - Consistent formal register ("Sie")

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**: Generate complete translations for all namespaces
- **Validation**:
  - All ~123 keys translated to Italian
  - Proper accent marks (à, è, é, ì, ò, ù)
  - Consistent formal register ("Lei")
  - Gender agreement verified

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**: Generate complete translations for all namespaces
- **Validation**:
  - All ~123 keys translated to Dutch
  - Dutch spelling conventions followed
  - Consistent formal register ("u")

### Files Referenced (Read-Only)

#### `/messages/en.json`
- **Purpose**: English source file (source of truth)
- **Usage**: Reference for all keys to be translated
- **Do Not Modify**: This task only generates non-English translations

#### `/src/lib/translation-service/index.ts`
- **Purpose**: Translation service API
- **Usage**: May use `translateToAllLanguages()` function for batch translation

#### `/src/lib/translation-service/translation-service.ts`
- **Purpose**: Main translation service implementation
- **Usage**: Reference for translation service configuration and usage

#### `/src/lib/i18n/config.ts`
- **Purpose**: i18n configuration
- **Usage**: Verify supported locales match target languages

## Technical Specifications

### Translation Quality Requirements

| Requirement | Description |
|-------------|-------------|
| Accuracy | Translations must convey the exact meaning of source text |
| Consistency | Same English term should translate to same target language term throughout |
| Formality | Professional formal register (vous/Sie/Lei/u) for user-facing applications |
| Grammar | Correct gender agreement, pluralization, verb conjugations |
| Character Set | UTF-8 encoding with proper diacritical marks |
| Placeholders | All `{variable}` placeholders preserved exactly |
| ICU Format | Pluralization rules adapted for each language |

### Language-Specific ICU Pluralization

**English (source):**
```json
"minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago"
```

**Spanish:**
```json
"minutesAgo": "hace {count} {count, plural, one {minuto} other {minutos}}"
```

**French:**
```json
"minutesAgo": "il y a {count} {count, plural, one {minute} other {minutes}}"
```

**German:**
```json
"minutesAgo": "vor {count} {count, plural, one {Minute} other {Minuten}}"
```

**Italian:**
```json
"minutesAgo": "{count} {count, plural, one {minuto} other {minuti}} fa"
```

**Dutch:**
```json
"minutesAgo": "{count} {count, plural, one {minuut} other {minuten}} geleden"
```

### Validation Script

```typescript
// Pseudo-code for validation
function validateTranslationFiles() {
  const enKeys = getAllKeys(readJSON('messages/en.json'));
  const targetLanguages = ['es', 'fr', 'de', 'it', 'nl'];

  for (const lang of targetLanguages) {
    const targetKeys = getAllKeys(readJSON(`messages/${lang}.json`));

    // Check key parity
    const missingKeys = enKeys.filter(k => !targetKeys.includes(k));
    const extraKeys = targetKeys.filter(k => !enKeys.includes(k));

    // Check placeholder preservation
    for (const key of enKeys) {
      const enPlaceholders = extractPlaceholders(enValue);
      const targetPlaceholders = extractPlaceholders(targetValue);
      assert(deepEqual(enPlaceholders, targetPlaceholders));
    }

    // Validate JSON
    JSON.parse(readFile(`messages/${lang}.json`));
  }
}
```

## Translation Service Usage

### Option 1: Use Built-in Translation Service

```typescript
import { translateToAllLanguages, TranslateOptions } from '@/lib/translation-service';

const options: TranslateOptions = {
  context: {
    contentType: 'ui_string',
    domainContext: 'vacation rental property management',
  }
};

// Translate each key
for (const [key, value] of Object.entries(englishStrings)) {
  const result = await translateToAllLanguages(value, 'en', options);
  // result.translations contains { fr, es, de, it, nl }
}
```

### Option 2: Manual Translation with Review

For critical UI strings, manually translate with native speaker review:

1. Export English strings to spreadsheet
2. Send to professional translation service
3. Import reviewed translations
4. Validate with automated checks

### Recommended Approach

Use a hybrid approach:
1. Generate initial translations using AI translation service
2. Run automated validation checks
3. Flag any suspicious translations for manual review
4. Apply final translations to files

## Success Validation Checklist

### Translation Completeness
- [ ] All 123 keys in en.json have corresponding translations in es.json
- [ ] All 123 keys in en.json have corresponding translations in fr.json
- [ ] All 123 keys in en.json have corresponding translations in de.json
- [ ] All 123 keys in en.json have corresponding translations in it.json
- [ ] All 123 keys in en.json have corresponding translations in nl.json

### Translation Quality
- [ ] Spanish translations verified for accuracy and proper accents
- [ ] French translations verified for accuracy, accents, and gender agreement
- [ ] German translations verified for accuracy, capitalization, and umlauts
- [ ] Italian translations verified for accuracy, accents, and gender agreement
- [ ] Dutch translations verified for accuracy and spelling conventions

### Technical Validation
- [ ] All 5 target language files are valid JSON (no syntax errors)
- [ ] All ICU placeholders (`{count}`, `{name}`, etc.) preserved in translations
- [ ] All pluralization rules properly adapted for each language
- [ ] No machine translation artifacts (untranslated English, obvious errors)
- [ ] UTF-8 encoding verified for all diacritical marks

### Functional Verification
- [ ] Application loads all translation files without errors
- [ ] Language switching displays correct translations for each language
- [ ] No missing translation warnings in browser console
- [ ] UI renders correctly with translated text (no overflow/truncation)

### Documentation
- [ ] Translation metadata documented (source, date, review status)
- [ ] Any translation decisions or terminology choices documented

## Acceptance Criteria Mapping

| PRD Acceptance Criteria | Implementation Task |
|------------------------|---------------------|
| Translation service configured and operational | Verify translation service availability |
| All common.actions keys translated to Spanish | Generate es.json translations |
| All common.actions keys translated to French | Generate fr.json translations |
| All common.actions keys translated to German | Generate de.json translations |
| All common.actions keys translated to Italian | Generate it.json translations |
| All common.actions keys translated to Dutch | Generate nl.json translations |
| Translation quality validated | Run validation checks |
| Technical terminology consistent | Review terminology across files |
| Formality level appropriate | Verify formal register usage |
| Variable placeholders preserved | Automated placeholder check |
| Pluralization rules implemented | Verify ICU format per language |
| Translation files updated | Write to es/fr/de/it/nl.json |
| 100% completeness verified | Key parity validation |

## Risk Assessment

- **Risk Level**: Medium
- **Rationale**:
  - AI translations may have quality issues requiring review
  - Language-specific rules (gender, pluralization) are complex
  - Diacritical marks may be lost in processing
- **Mitigations**:
  - Use professional-grade translation service (Claude/OpenAI)
  - Validate character encoding explicitly
  - Run automated quality checks before committing
  - Consider native speaker review for critical strings

## Effort Estimate

- **Estimated Time**: 4-6 hours
- **Breakdown**:
  - Setup and configuration: 30 minutes
  - Generate translations for 5 languages: 1-2 hours
  - Validation and quality checks: 1 hour
  - Fix identified issues: 1-2 hours
  - Final review and documentation: 30 minutes

## Notes

### Terminology Glossary

Maintain consistent translations for domain-specific terms:

| English | Spanish | French | German | Italian | Dutch |
|---------|---------|--------|--------|---------|-------|
| Property | Propiedad | Propriété | Immobilie | Proprietà | Eigendom |
| Item | Artículo | Article | Artikel | Articolo | Item |
| QR Code | Código QR | Code QR | QR-Code | Codice QR | QR-code |
| Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard | Dashboard |
| Tag | Etiqueta | Étiquette | Tag | Tag | Tag |
| Scan | Escaneo | Scan | Scan | Scansione | Scan |

### Future Considerations

- Consider adding translation memory to maintain consistency across future translations
- May need professional review for marketing/public-facing text
- Translation files will grow as more namespaces are added in Tasks 2A-2J

### Related Tasks

- **Predecessor**: Tasks 2H.1-2H.9 (namespace structure and string extraction)
- **Successor**: Task 2H.11 (optional useCommonTranslations convenience hook)
- **Parallel**: Similar translation generation tasks in other sub-epics (2A.9, 2B.7, etc.)
