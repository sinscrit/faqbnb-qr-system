# REQ-347: Generate Translations for All Static UI Strings Across Five Non-English Languages - Implementation Overview

*Generated: 2026-01-19 23:45:00 UTC*
*Last Modified: 2026-01-19 23:45:00 UTC*

## Reference
- **Request**: REQ-347 (Generate Translations for All Static UI Strings Across Five Non-English Languages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Full Static UI Translation Generation)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components (Final Translation Task)
- **Task ID**: 2H.10 (Extended to cover all namespaces)
- **Size**: XL (Extra Large)
- **Priority**: Epic 2 Completion Milestone

## Goals

1. Generate complete, native-quality translations for ALL static UI strings (~3,200+ keys) across Spanish, French, German, Italian, and Dutch
2. Ensure 100% translation coverage with zero English fallback strings visible in non-English UI
3. Maintain terminology consistency across all namespaces (auth, dashboard, items, workflow, articles, properties, settings, errors, emails)
4. Preserve ICU message format syntax including pluralization rules and variable interpolation for all languages
5. Apply appropriate formality levels per language (vous/Sie/Lei/u formal registers)
6. Validate translation quality with proper grammar, gender agreement, and culturally appropriate expressions
7. Update all five non-English translation files to production-ready state

## Context from Implementation Plan

### Epic 2 Scope Overview

Per Plan-111, Epic 2 covers the extraction and translation of approximately 3,200+ hardcoded UI strings from 275+ React components. The strings are organized into the following namespaces:

| Namespace | Sub-Epic | Estimated Strings | Description |
|-----------|----------|-------------------|-------------|
| `common` | 2H | ~800 | Shared UI elements (buttons, modals, forms, status) |
| `auth` | 2A | ~150 | Authentication & registration flows |
| `dashboard` | 2B | ~200 | Dashboard & navigation |
| `items` | 2D | ~400 | Item management |
| `workflow` | 2C | ~500 | Item creation workflow (largest) |
| `articles` | 2E | ~300 | Article & content management |
| `properties` | 2F | ~200 | Property management |
| `settings` | 2G | ~150 | Settings & account |
| `errors` | 2J | ~300 | Error messages & validation |
| `emails` | 2I | ~200 | Email templates |

**Total**: ~3,200 unique strings x 5 languages = ~16,000 translation entries

### Difference from REQ-346

REQ-346 focuses specifically on the common namespace (~123 keys). REQ-347 is the comprehensive task to translate **ALL** static UI strings across **ALL** namespaces for a complete localized application experience.

### Current State Analysis

#### English Source (`/messages/en.json`) - Current Keys

Based on codebase analysis, the current English file structure contains:

```json
{
  "common": { /* ~33 keys */ },
  "auth": { /* ~18 keys */ },
  "dashboard": { /* ~17 keys */ },
  "items": { /* ~26 keys */ },
  "errors": { /* ~17 keys */ },
  "language": { /* ~10 keys */ }
}
```

**Current Total**: ~121 keys (base structure from Epic 1 foundation)

**Expected After Epic 2**: ~3,200 keys (full extraction from all 275+ components)

#### Non-English Files Status

| Language | File | Current State | Target State |
|----------|------|---------------|--------------|
| Spanish | `/messages/es.json` | ~121 keys translated | ~3,200 keys translated |
| French | `/messages/fr.json` | ~121 keys translated | ~3,200 keys translated |
| German | `/messages/de.json` | ~121 keys translated | ~3,200 keys translated |
| Italian | `/messages/it.json` | ~121 keys translated | ~3,200 keys translated |
| Dutch | `/messages/nl.json` | ~121 keys translated | ~3,200 keys translated |

#### Quality Assessment of Current Translations

From manual inspection of existing translation files:

**Spanish (es.json)**
- Generally good quality translations
- Informal "tú" register being used (appropriate for tech apps)
- Minor accent issues: some characters rendered without proper accents

**French (fr.json)**
- Good quality, uses formal "vous" register
- Some accents missing (e.g., "Créer" rendered as "Creer")
- Gender agreement appears correct

**German (de.json)**
- Uses formal "Sie" register correctly
- Noun capitalization follows German conventions
- Umlauts present but some may be missing (ä, ö, ü)

**Italian (it.json)**
- Uses informal register - should consider formal "Lei" for consistency
- Accent marks appear correct (à, è, ì, ò, ù)

**Dutch (nl.json)**
- Good quality, uses formal "u" register
- Proper Dutch spelling conventions

### Dependencies

- **Prerequisite**: English source strings extracted (Tasks 2A-2J extraction complete)
- **Verified**: Translation service infrastructure operational (`/src/lib/translation-service/`)
- **Available**: Claude provider (`/src/lib/translation-service/providers/claude-provider.ts`)
- **Available**: OpenAI fallback provider (`/src/lib/translation-service/providers/openai-provider.ts`)
- **Configuration**: i18n config supports all 6 locales (`/src/lib/i18n/config.ts`)

## Implementation Order

### Phase 1: Preparation and Audit

#### Step 1.1: Catalog All English Source Keys

Extract complete key inventory from `/messages/en.json`:

```bash
# Generate key report
node -e "const en = require('./messages/en.json'); console.log(JSON.stringify(Object.keys(en).map(ns => ({namespace: ns, keyCount: Object.keys(en[ns]).length})), null, 2))"
```

Expected output after full Epic 2 extraction:
```json
[
  { "namespace": "common", "keyCount": ~800 },
  { "namespace": "auth", "keyCount": ~150 },
  { "namespace": "dashboard", "keyCount": ~200 },
  { "namespace": "items", "keyCount": ~400 },
  { "namespace": "workflow", "keyCount": ~500 },
  { "namespace": "articles", "keyCount": ~300 },
  { "namespace": "properties", "keyCount": ~200 },
  { "namespace": "settings", "keyCount": ~150 },
  { "namespace": "errors", "keyCount": ~300 },
  { "namespace": "emails", "keyCount": ~200 }
]
```

#### Step 1.2: Identify Delta from Current State

Compare current non-English files against English source:

```typescript
function identifyMissingKeys(enFile: object, targetFile: object): string[] {
  const enKeys = flattenKeys(enFile);
  const targetKeys = flattenKeys(targetFile);
  return enKeys.filter(key => !targetKeys.includes(key));
}
```

#### Step 1.3: Create Translation Context Configuration

Configure translation parameters for consistent output:

```typescript
const translationConfig: TranslationContext = {
  contentType: 'ui_string',
  domainContext: 'FAQBNB - vacation rental property management application with QR code based guest instructions',
  formalityLevel: 'professional',
  preservePlaceholders: true,
  additionalInstructions: [
    'Maintain consistent terminology for: Property, Item, QR Code, Tag, Room, Article, Scan',
    'Use industry-standard UI localization patterns',
    'Preserve all ICU message format syntax exactly: {variable}, {count, plural, ...}',
    'Adapt word order naturally for target language while preserving meaning',
    'Use appropriate formal register: vous (FR), Sie (DE), Lei (IT), u (NL)',
    'Use informal tú for Spanish (standard for tech applications)'
  ]
};
```

### Phase 2: Namespace-by-Namespace Translation Generation

Execute translations in order of priority per Plan-111:

#### Step 2.1: Common Namespace (~800 keys)

**Priority**: FIRST - Foundation for all other namespaces

Sub-categories to translate:
- `common.actions` (~25 keys): save, cancel, delete, edit, create, submit, etc.
- `common.status` (~15 keys): loading, saving, success, error, pending, etc.
- `common.confirmation` (~10 keys): dialog titles, messages, yes/no
- `common.empty` (~10 keys): no data, no results messages
- `common.time` (~20 keys): relative time expressions
- `common.pagination` (~10 keys): previous, next, page indicators
- `common.validation` (~15 keys): required field, invalid format messages

#### Step 2.2: Error Messages Namespace (~300 keys)

**Priority**: SECOND - Cross-cutting concern

Sub-categories:
- `errors.form` (~100 keys): field validation messages
- `errors.api` (~80 keys): API error messages
- `errors.network` (~30 keys): connection error messages
- `errors.auth` (~40 keys): authentication error messages
- `errors.file` (~30 keys): file upload error messages
- `errors.item` / `errors.property` (~20 keys): domain-specific errors

#### Step 2.3: Authentication Namespace (~150 keys)

**Priority**: THIRD - Entry point to application

Key areas:
- `auth.login` (~40 keys): sign-in form, buttons, messages
- `auth.register` (~60 keys): registration form, password strength, terms
- `auth.logout` (~10 keys): sign-out confirmation
- `auth.accessCode` (~15 keys): access code validation
- `auth.oauth` (~25 keys): OAuth-related messages

#### Step 2.4: Dashboard & Navigation (~200 keys)

**Priority**: FOURTH - Core navigation

Key areas:
- `dashboard.title` / `dashboard.welcome`: Page headers
- `dashboard.nav` (~20 keys): Navigation menu items
- `dashboard.stats` (~20 keys): Statistics labels and counts
- `dashboard.actions` (~15 keys): Quick action buttons
- `dashboard.empty` (~10 keys): Empty state messages
- `dashboard.property` (~15 keys): Property selector strings

#### Step 2.5: Settings & Account (~150 keys)

**Priority**: FIFTH - Lower complexity

Key areas:
- `settings.sections` (~10 keys): Section headers
- `settings.account` (~30 keys): Account management
- `settings.profile` (~20 keys): Profile settings
- `settings.preferences` (~30 keys): User preferences
- `settings.help` (~20 keys): Help & support

#### Step 2.6: Property Management (~200 keys)

**Priority**: SIXTH - Moderate complexity

Key areas:
- `properties.form` (~40 keys): Property form fields
- `properties.actions` (~15 keys): CRUD actions
- `properties.modal` (~20 keys): Modal dialogs
- `properties.delete` (~15 keys): Delete confirmation
- `properties.selector` (~15 keys): Property selection

#### Step 2.7: Item Management (~400 keys)

**Priority**: SEVENTH - High usage area

Key areas:
- `items.list` (~30 keys): List view strings
- `items.card` (~20 keys): Item card display
- `items.actions` (~25 keys): Item actions
- `items.filters` (~30 keys): Filter panel
- `items.sort` (~15 keys): Sort options
- `items.bulk` (~25 keys): Bulk actions
- `items.detail` (~30 keys): Item detail view
- `items.delete` (~15 keys): Delete confirmation

#### Step 2.8: Article & Content (~300 keys)

**Priority**: EIGHTH - Content management

Key areas:
- `articles.editor` (~50 keys): Content editor UI
- `articles.media` (~30 keys): Media upload
- `articles.crop` (~20 keys): Image cropping
- `articles.video` (~20 keys): Video trimming
- `articles.purposes` (~15 keys): Content purpose labels

#### Step 2.9: Item Creation Workflow (~500 keys)

**Priority**: NINTH - Largest component set

Key areas:
- `workflow.header` (~10 keys): Step indicators
- `workflow.steps.roomSelection` (~20 keys)
- `workflow.steps.itemType` (~25 keys)
- `workflow.steps.specificItem` (~20 keys)
- `workflow.steps.purpose` (~20 keys)
- `workflow.steps.contentType` (~20 keys)
- `workflow.steps.mediaCapture` (~30 keys)
- `workflow.steps.preview` (~25 keys)
- `workflow.steps.sessionSummary` (~20 keys)
- `workflow.dialogs` (~25 keys): Confirmation dialogs
- `workflow.content` (~15 keys): Content piece management
- `workflow.validation` (~15 keys): Form validation

#### Step 2.10: Email Templates (~200 keys)

**Priority**: TENTH - Different translation mechanism

Key areas:
- `emails.accessApproval` (~25 keys)
- `emails.accessDenial` (~15 keys)
- `emails.betaAccess` (~20 keys)
- `emails.registrationReminder` (~15 keys)
- Common email elements (~20 keys): greetings, signatures, footers

### Phase 3: Translation Execution

#### Step 3.1: Configure Translation Service

```typescript
import {
  createTranslationService,
  TranslationServiceConfig
} from '@/lib/translation-service';

const config: TranslationServiceConfig = {
  primaryProvider: 'claude',
  enableFallback: true,
  enableRetry: true,
  maxRetries: 3,
  enableRateLimiting: true,
  enableLogging: true
};

const service = createTranslationService(config);
```

#### Step 3.2: Execute Batch Translations

For each namespace and each target language:

```typescript
async function translateNamespace(
  namespace: string,
  englishStrings: Record<string, string>,
  targetLanguage: SupportedLanguage
): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};

  for (const [key, value] of Object.entries(englishStrings)) {
    const result = await service.translateText(
      value,
      'en',
      targetLanguage,
      {
        context: {
          contentType: 'ui_string',
          domainContext: `FAQBNB ${namespace} strings`,
          additionalInstructions: getLanguageSpecificInstructions(targetLanguage)
        }
      }
    );
    translations[key] = result.translatedText;
  }

  return translations;
}
```

#### Step 3.3: Language-Specific Instructions

**Spanish (es)**
```typescript
const spanishInstructions = [
  'Use informal "tú" register (standard for tech applications)',
  'Use Latin American neutral Spanish',
  'Proper accent marks: á, é, í, ó, ú, ñ, ü',
  'Gender agreement for adjectives'
];
```

**French (fr)**
```typescript
const frenchInstructions = [
  'Use formal "vous" register',
  'Proper accent marks: é, è, ê, ë, à, â, ç, ô, î, û, ù',
  'Gender agreement for past participles and adjectives',
  'Use French quotation marks where appropriate «»'
];
```

**German (de)**
```typescript
const germanInstructions = [
  'Use formal "Sie" register',
  'Capitalize all nouns',
  'Use proper umlauts: ä, ö, ü and ß',
  'Form compound words where appropriate',
  'Maintain German word order'
];
```

**Italian (it)**
```typescript
const italianInstructions = [
  'Use formal "Lei" register',
  'Proper accent marks: à, è, é, ì, ò, ù',
  'Gender agreement for nouns and adjectives',
  'Use appropriate preposition contractions'
];
```

**Dutch (nl)**
```typescript
const dutchInstructions = [
  'Use formal "u" register',
  'Proper Dutch spelling with ij, Dutch-specific combinations',
  'Form compound words where appropriate',
  'Use de/het articles correctly'
];
```

### Phase 4: Validation and Quality Assurance

#### Step 4.1: Key Parity Validation

```typescript
function validateKeyParity(
  englishFile: object,
  targetFile: object,
  targetLang: string
): ValidationResult {
  const enKeys = flattenKeys(englishFile);
  const targetKeys = flattenKeys(targetFile);

  return {
    missingKeys: enKeys.filter(k => !targetKeys.includes(k)),
    extraKeys: targetKeys.filter(k => !enKeys.includes(k)),
    totalEnKeys: enKeys.length,
    totalTargetKeys: targetKeys.length,
    completeness: (targetKeys.length / enKeys.length) * 100
  };
}
```

#### Step 4.2: Placeholder Preservation Check

```typescript
function validatePlaceholders(
  englishValue: string,
  translatedValue: string
): PlaceholderValidation {
  const enPlaceholders = extractPlaceholders(englishValue);
  const targetPlaceholders = extractPlaceholders(translatedValue);

  return {
    preserved: deepEqual(enPlaceholders.sort(), targetPlaceholders.sort()),
    englishPlaceholders: enPlaceholders,
    targetPlaceholders: targetPlaceholders,
    missing: enPlaceholders.filter(p => !targetPlaceholders.includes(p)),
    extra: targetPlaceholders.filter(p => !enPlaceholders.includes(p))
  };
}

function extractPlaceholders(text: string): string[] {
  // Match {variableName} and {count, plural, ...} patterns
  const regex = /\{[^}]+\}/g;
  return text.match(regex) || [];
}
```

#### Step 4.3: ICU Message Format Validation

```typescript
function validateICUFormat(value: string, lang: string): ICUValidation {
  try {
    // Parse ICU message format
    const parsed = new IntlMessageFormat(value, lang);
    return { valid: true, parsed };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

#### Step 4.4: Character Encoding Verification

```typescript
function validateCharacterEncoding(
  translations: Record<string, string>,
  lang: string
): EncodingValidation {
  const expectedChars: Record<string, string[]> = {
    es: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
    fr: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'ô', 'î', 'û', 'ù', '«', '»'],
    de: ['ä', 'ö', 'ü', 'ß'],
    it: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
    nl: [] // Dutch uses standard Latin characters
  };

  const content = JSON.stringify(translations);
  const foundChars = expectedChars[lang].filter(char => content.includes(char));

  return {
    hasExpectedCharacters: foundChars.length > 0,
    foundCharacters: foundChars,
    isValidUTF8: Buffer.from(content).toString('utf8') === content
  };
}
```

### Phase 5: Apply Translations and Verify

#### Step 5.1: Write Translation Files

```typescript
function writeTranslationFile(
  translations: TranslationFile,
  language: SupportedLanguage
): void {
  const filePath = `messages/${language}.json`;
  const content = JSON.stringify(translations, null, 2);

  // Validate JSON before writing
  JSON.parse(content);

  writeFileSync(filePath, content, 'utf8');
}
```

#### Step 5.2: Run Application Verification

```bash
# Build application with translations
npm run build

# Start development server
npm run dev

# Switch language and verify UI
# 1. Navigate to each major page
# 2. Switch to each language
# 3. Verify no "missing translation" warnings
# 4. Verify UI renders correctly without text overflow
```

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/es.json`
- **Purpose**: Spanish (Español) translation file
- **Changes**: Complete translation of all ~3,200 keys across all namespaces
- **Validation**:
  - 100% key parity with en.json
  - Proper accent marks (á, é, í, ó, ú, ñ, ü, ¿, ¡)
  - Consistent informal "tú" register
  - Gender agreement verified
  - All ICU placeholders preserved

#### `/messages/fr.json`
- **Purpose**: French (Français) translation file
- **Changes**: Complete translation of all ~3,200 keys across all namespaces
- **Validation**:
  - 100% key parity with en.json
  - Proper accent marks (é, è, ê, ë, à, â, ç, ô, î, û, ù)
  - Consistent formal "vous" register
  - Gender agreement for adjectives and past participles
  - All ICU placeholders preserved

#### `/messages/de.json`
- **Purpose**: German (Deutsch) translation file
- **Changes**: Complete translation of all ~3,200 keys across all namespaces
- **Validation**:
  - 100% key parity with en.json
  - Proper noun capitalization (all German nouns capitalized)
  - Umlauts (ä, ö, ü) and Eszett (ß) used correctly
  - Consistent formal "Sie" register
  - Compound words formed appropriately
  - All ICU placeholders preserved

#### `/messages/it.json`
- **Purpose**: Italian (Italiano) translation file
- **Changes**: Complete translation of all ~3,200 keys across all namespaces
- **Validation**:
  - 100% key parity with en.json
  - Proper accent marks (à, è, é, ì, ò, ù)
  - Consistent formal "Lei" register
  - Gender agreement for nouns and adjectives
  - All ICU placeholders preserved

#### `/messages/nl.json`
- **Purpose**: Dutch (Nederlands) translation file
- **Changes**: Complete translation of all ~3,200 keys across all namespaces
- **Validation**:
  - 100% key parity with en.json
  - Dutch spelling conventions (ij digraph, compound words)
  - Consistent formal "u" register
  - de/het article usage correct
  - All ICU placeholders preserved

### Files Referenced (Read-Only)

#### `/messages/en.json`
- **Purpose**: English source file (source of truth)
- **Usage**: Reference for all keys requiring translation
- **Do Not Modify**: This task generates non-English translations only

#### `/src/lib/translation-service/translation-service.ts`
- **Purpose**: Main translation service implementation
- **Usage**: Use for batch translation generation

#### `/src/lib/translation-service/providers/claude-provider.ts`
- **Purpose**: Claude AI translation provider
- **Usage**: Primary translation provider

#### `/src/lib/translation-service/providers/openai-provider.ts`
- **Purpose**: OpenAI translation provider
- **Usage**: Fallback translation provider

#### `/src/lib/i18n/config.ts`
- **Purpose**: i18n configuration
- **Usage**: Verify supported locales configuration

#### `/src/lib/translation-service/utils/rate-limiter.ts`
- **Purpose**: Rate limiting for translation API calls
- **Usage**: Manage API call frequency

## Technical Specifications

### Translation Quality Requirements

| Requirement | Description | Validation Method |
|-------------|-------------|-------------------|
| Accuracy | Translations convey exact meaning of source | Native speaker review sampling |
| Consistency | Same term translates identically throughout | Terminology glossary check |
| Formality | Appropriate register per language | Manual spot check |
| Grammar | Correct gender, plurals, conjugations | Native speaker review |
| Completeness | 100% of keys translated | Automated key parity check |
| Encoding | UTF-8 with proper diacriticals | Character validation script |
| Placeholders | All `{var}` preserved exactly | Automated regex check |
| ICU Format | Pluralization adapted per language | ICU parser validation |

### Terminology Glossary (Consistency Reference)

| English | Spanish | French | German | Italian | Dutch |
|---------|---------|--------|--------|---------|-------|
| Property | Propiedad | Propriété | Immobilie | Proprietà | Eigendom |
| Item | Artículo | Article | Artikel | Articolo | Item |
| QR Code | Código QR | Code QR | QR-Code | Codice QR | QR-code |
| Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard | Dashboard |
| Tag | Etiqueta | Étiquette | Tag | Tag | Tag |
| Room | Habitación | Pièce | Raum | Stanza | Kamer |
| Article | Artículo | Article | Artikel | Articolo | Artikel |
| Scan | Escaneo | Scan | Scan | Scansione | Scan |
| Upload | Subir | Télécharger | Hochladen | Caricare | Uploaden |
| Download | Descargar | Télécharger | Herunterladen | Scaricare | Downloaden |
| Settings | Configuración | Paramètres | Einstellungen | Impostazioni | Instellingen |
| Help | Ayuda | Aide | Hilfe | Aiuto | Help |

### ICU Pluralization Examples by Language

**English (source):**
```json
{
  "items.count": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

**Spanish:**
```json
{
  "items.count": "{count, plural, =0 {Sin artículos} one {# artículo} other {# artículos}}"
}
```

**French:**
```json
{
  "items.count": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}"
}
```

**German:**
```json
{
  "items.count": "{count, plural, =0 {Keine Artikel} one {# Artikel} other {# Artikel}}"
}
```

**Italian:**
```json
{
  "items.count": "{count, plural, =0 {Nessun articolo} one {# articolo} other {# articoli}}"
}
```

**Dutch:**
```json
{
  "items.count": "{count, plural, =0 {Geen items} one {# item} other {# items}}"
}
```

## Success Validation Checklist

### Translation Completeness (Per Language)

- [ ] Spanish (es.json): All ~3,200 keys translated
- [ ] French (fr.json): All ~3,200 keys translated
- [ ] German (de.json): All ~3,200 keys translated
- [ ] Italian (it.json): All ~3,200 keys translated
- [ ] Dutch (nl.json): All ~3,200 keys translated

### Namespace Coverage

- [ ] `common` namespace: 100% translated in all 5 languages
- [ ] `auth` namespace: 100% translated in all 5 languages
- [ ] `dashboard` namespace: 100% translated in all 5 languages
- [ ] `items` namespace: 100% translated in all 5 languages
- [ ] `workflow` namespace: 100% translated in all 5 languages
- [ ] `articles` namespace: 100% translated in all 5 languages
- [ ] `properties` namespace: 100% translated in all 5 languages
- [ ] `settings` namespace: 100% translated in all 5 languages
- [ ] `errors` namespace: 100% translated in all 5 languages
- [ ] `emails` namespace: 100% translated in all 5 languages
- [ ] `language` namespace: 100% translated in all 5 languages

### Technical Validation

- [ ] All 5 target language files are valid JSON
- [ ] All ICU placeholders preserved in all translations
- [ ] All pluralization rules adapted correctly per language
- [ ] UTF-8 encoding verified with proper diacritical marks
- [ ] No machine translation artifacts (obvious errors, untranslated text)
- [ ] JSON structure matches en.json exactly

### Quality Validation

- [ ] Spanish: Consistent informal "tú" register
- [ ] French: Consistent formal "vous" register, gender agreement
- [ ] German: Consistent formal "Sie" register, noun capitalization
- [ ] Italian: Consistent formal "Lei" register, gender agreement
- [ ] Dutch: Consistent formal "u" register
- [ ] Terminology consistency verified across all namespaces

### Functional Verification

- [ ] Application builds without translation-related errors
- [ ] Language switching works correctly on all pages
- [ ] No missing translation warnings in browser console
- [ ] No English fallback strings visible in non-English UI
- [ ] UI renders correctly without text overflow in all languages
- [ ] Date/time formatting respects locale settings

### Documentation

- [ ] Translation metadata documented (source, date, provider used)
- [ ] Terminology decisions documented in glossary
- [ ] Quality review status documented
- [ ] Any known issues or limitations documented

## Acceptance Criteria Mapping

| PRD Acceptance Criteria | Implementation Task |
|------------------------|---------------------|
| Translation service configured and operational | Verify translation service availability |
| All authentication namespace keys translated to all 5 languages | Phase 2, Step 2.3 |
| All navigation/menu namespace keys translated | Phase 2, Step 2.4 |
| All form/input namespace keys translated | Phase 2, Steps 2.1, 2.3-2.9 |
| All action button namespace keys translated | Phase 2, Step 2.1 |
| All notification/toast keys translated | Phase 2, Step 2.1 |
| All error message keys translated | Phase 2, Step 2.2 |
| All success/confirmation keys translated | Phase 2, Step 2.1 |
| All content management keys translated | Phase 2, Steps 2.7, 2.8 |
| All search/filter keys translated | Phase 2, Step 2.7 |
| All settings/preferences keys translated | Phase 2, Step 2.5 |
| All help/tooltip keys translated | Phase 2, Step 2.5 |
| All validation message keys translated | Phase 2, Step 2.2 |
| All empty state keys translated | Phase 2, Step 2.1 |
| All loading state keys translated | Phase 2, Step 2.1 |
| All date/time formatting keys translated | Phase 2, Step 2.1 |
| Translation quality validated | Phase 4 validation |
| Terminology consistency maintained | Glossary verification |
| Formality level appropriate per language | Manual spot check |
| Gendered language handled correctly | Native speaker review |
| Variable interpolation preserved | Phase 4, Step 4.2 |
| Pluralization rules implemented | Phase 4, Step 4.3 |
| Special characters encoded correctly | Phase 4, Step 4.4 |
| 100% completeness verified | Phase 4, Step 4.1 |
| No English fallback strings | Functional verification |
| Language switching updates all UI elements | Functional verification |

## Risk Assessment

- **Risk Level**: High
- **Rationale**:
  - Large scope (~3,200 keys x 5 languages = ~16,000 translation entries)
  - AI translation quality varies; may require significant review
  - Language-specific rules (gender, pluralization) are complex
  - Tight integration with existing codebase
- **Mitigations**:
  - Process in batches by namespace to isolate issues
  - Use professional-grade AI providers (Claude/OpenAI)
  - Run comprehensive automated validation
  - Implement phased rollout: common namespace first
  - Schedule native speaker review for critical strings
  - Build automated regression tests for translations

## Effort Estimate

- **Total Estimated Time**: 2-3 days
- **Breakdown**:
  - Phase 1 (Preparation): 2 hours
  - Phase 2 (Translation Generation): 8-12 hours
  - Phase 3 (Translation Execution): 4-6 hours
  - Phase 4 (Validation): 4-6 hours
  - Phase 5 (Application & Verify): 2-4 hours
  - Issue Resolution: 4-8 hours (buffer)
  - Documentation: 2 hours

## Notes

### Translation Provider Usage Strategy

1. **Primary**: Use Claude provider for best context understanding
2. **Fallback**: OpenAI provider if Claude rate-limited or unavailable
3. **Batch Processing**: Process by namespace to manage API usage
4. **Rate Limiting**: Respect provider rate limits (configured in rate-limiter.ts)

### Quality Assurance Process

1. **Automated Checks**: Run validation scripts before committing
2. **Spot Checks**: Randomly sample 5% of translations per language
3. **Critical Path Review**: Focus human review on auth, errors, and checkout flows
4. **UI Testing**: Visual inspection of all major pages in each language

### Related Tasks

- **Predecessors**: All string extraction tasks (2A-2J extraction phases)
- **Parallel**: REQ-346 (common namespace specific - may be subset of this task)
- **Successors**: Visual QA, native speaker review, production deployment

### Future Maintenance

- Translation files will continue to grow as features are added
- Consider implementing translation memory for consistency
- Document new terminology decisions in glossary
- Establish process for ongoing translation updates

---

*Document generated for FAQBNB REQ-347 - Epic 2 Translation Completion Milestone*
