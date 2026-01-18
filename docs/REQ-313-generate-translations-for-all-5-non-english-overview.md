# Implementation Overview: Generate Translations for All 5 Non-English Languages

## Header

| Field | Value |
|-------|-------|
| Request Reference | #313 |
| Source File | docs/gen_requests_epic2.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 18:45:00 UTC |
| T-shirt Size | XL |
| Estimated Effort | 3-5 days (24-40 hours) |
| Sub-Epic | 2H - Common & Shared Components |
| Task ID | 2H.10 |
| Epic Reference | Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Epic 1 Dependency | Plan-110-L10N-Epic1-Foundation.md |

## Goals

Generate complete, accurate, and culturally appropriate translations for all translation keys from the English source file (`/messages/en.json`) into the five supported non-English languages:

1. **French (fr)** - `/messages/fr.json`
2. **Spanish (es)** - `/messages/es.json`
3. **German (de)** - `/messages/de.json`
4. **Dutch (nl)** - `/messages/nl.json`
5. **Italian (it)** - `/messages/it.json`

### Core Objectives

1. **Complete Translation Coverage**: Every key in `en.json` must have a corresponding translation in all 5 language files
2. **Natural Phrasing**: Translations use idiomatic expressions native to each language, not literal word-for-word conversions
3. **Cultural Appropriateness**: Adapt messaging where direct translation would be unclear or inappropriate
4. **Consistency**: Maintain consistent terminology across all translations (e.g., "QR Code" vs "Code QR")
5. **Technical Correctness**: Preserve variable placeholders (`{count}`, `{name}`), ICU plural formats, and JSON structure

### Assumptions & Clarifications

- **Epic 1 Complete**: This task assumes Epic 1 foundation is complete with next-intl installed and configured
- **Common Namespace Complete**: Tasks 2H.1-2H.9 have been completed, establishing the English translation structure
- **AI Translation**: Translations will be generated using AI (Claude/OpenAI) with domain context for property rental/hospitality
- **Review Process**: Machine translations may be flagged for human review, particularly for critical auth and error messages
- **Character Encoding**: All files use UTF-8 encoding with proper Unicode support for accented characters

## Translation Scope

Based on the Common namespace established in Sub-Epic 2H, the following categories require translation:

### Common Namespace Categories (~800 strings)

| Category | Estimated Keys | Example Keys |
|----------|----------------|--------------|
| Actions | ~50 | `common.actions.save`, `common.actions.cancel` |
| Status Messages | ~30 | `common.status.loading`, `common.status.success` |
| Confirmation Dialogs | ~40 | `common.confirmation.title`, `common.confirmation.deleteMessage` |
| Empty States | ~30 | `common.empty.noData`, `common.empty.noResults` |
| Loading States | ~20 | `common.status.loading`, `common.status.saving` |
| Date/Time Formatting | ~60 | `common.time.justNow`, `common.time.minutesAgo` |
| Pagination | ~15 | `common.pagination.previous`, `common.pagination.page` |
| Validation Messages | ~40 | `common.validation.required`, `common.validation.invalidEmail` |
| Tooltips | ~50 | Various component tooltips |
| Form Labels | ~100 | Labels, placeholders, hints |
| Navigation | ~40 | `common.nav.*` keys |
| Buttons | ~50 | Various button labels |
| Modal/Dialog Text | ~80 | Modal titles, descriptions, actions |
| Toast Notifications | ~50 | Success, error, warning, info messages |

**Total Estimated Keys**: ~655-800 strings per language

## Implementation Plan

### Step 1: Audit English Source File

- **Description**: Review `/messages/en.json` to create a complete inventory of all translation keys, verify structure integrity, and identify any missing placeholders or ICU format issues
- **Rationale**: Must have a clean, validated source before generating translations
- **Estimated Effort**: S (1-2 hours)
- **Output**: Audit report with key count, structure validation, and any issues to fix

### Step 2: Create Translation Glossary

- **Description**: Establish a terminology glossary for consistent translation of domain-specific terms across all languages
- **Rationale**: Ensures consistency for terms like "QR Code", "property", "item", "instruction", "dashboard"
- **Estimated Effort**: M (3-4 hours)
- **Output**: `/docs/i18n/glossary.md` with key terms in all 6 languages

### Step 3: Generate French Translations

- **Description**: Generate complete French translation file with all keys, including proper noun/verb agreement, gendered articles, and French-specific formatting
- **Rationale**: French requires careful handling of gender, formal/informal address, and accented characters
- **Estimated Effort**: M (4-5 hours)
- **Key Considerations**:
  - Use formal "vous" form for UI text
  - Handle gendered nouns appropriately
  - Use proper French quotation marks (guillemets) where appropriate
  - Ensure accented characters (é, è, ê, ë, à, â, etc.) render correctly

### Step 4: Generate Spanish Translations

- **Description**: Generate complete Spanish translation file using neutral Latin American Spanish suitable for broad audience
- **Rationale**: Spanish is spoken across many regions; neutral Spanish ensures wider comprehension
- **Estimated Effort**: M (4-5 hours)
- **Key Considerations**:
  - Use neutral Latin American Spanish (avoid Spain-specific idioms)
  - Use formal "usted" form for UI text
  - Handle inverted punctuation (¿, ¡) where appropriate
  - Proper use of accents (á, é, í, ó, ú, ñ)

### Step 5: Generate German Translations

- **Description**: Generate complete German translation file with proper compound word formation and formal address
- **Rationale**: German has specific rules for compound words and formal/informal address
- **Estimated Effort**: M (4-5 hours)
- **Key Considerations**:
  - Use formal "Sie" form for UI text
  - Handle German compound nouns appropriately
  - Proper capitalization of all nouns
  - Handle umlauts (ä, ö, ü) and eszett (ß) correctly

### Step 6: Generate Dutch Translations

- **Description**: Generate complete Dutch translation file following Netherlands Dutch conventions
- **Rationale**: Dutch is required for Netherlands market; Belgium has separate conventions
- **Estimated Effort**: M (4-5 hours)
- **Key Considerations**:
  - Use formal "u" form for UI text
  - Follow Netherlands Dutch spelling conventions
  - Handle IJ digraph and other Dutch-specific characters
  - Proper handling of diminutives if used

### Step 7: Generate Italian Translations

- **Description**: Generate complete Italian translation file with proper article and adjective agreement
- **Rationale**: Italian has complex gender/number agreement rules
- **Estimated Effort**: M (4-5 hours)
- **Key Considerations**:
  - Use formal "Lei" form for UI text
  - Handle gender and number agreement
  - Proper use of articles (il, la, lo, gli, le, i)
  - Accented characters (à, è, é, ì, ò, ù)

### Step 8: Validate All Translation Files

- **Description**: Run automated validation to ensure all files have matching key structures, valid JSON, proper placeholder preservation, and no missing translations
- **Rationale**: Critical quality gate before deployment
- **Estimated Effort**: S (2-3 hours)
- **Validation Checks**:
  - Key count matches English source
  - JSON structure is valid
  - All placeholders (`{variable}`) preserved
  - ICU plural formats (`{count, plural, ...}`) preserved
  - No untranslated English text in translated files
  - UTF-8 encoding validated

### Step 9: Create Missing Translation Check Script

- **Description**: Implement automated script to compare translation files and identify missing or extra keys
- **Rationale**: Enables ongoing maintenance and prevents translation drift
- **Estimated Effort**: S (2-3 hours)
- **Output**: `/scripts/i18n-check.ts` or npm script `npm run i18n:check`

### Step 10: Review and Finalize

- **Description**: Final review of all translations for accuracy, tone consistency, and cultural appropriateness; fix any flagged issues
- **Rationale**: Human verification ensures quality before release
- **Estimated Effort**: M (3-4 hours)
- **Focus Areas**:
  - Auth flow strings (critical user-facing)
  - Error messages (must be clear)
  - Confirmation dialogs (user safety)
  - Date/time formatting (cultural norms)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Translation Files to Create/Modify

| File | Target | Type |
|------|--------|------|
| `/messages/fr.json` | Complete French translations | Create |
| `/messages/es.json` | Complete Spanish translations | Create |
| `/messages/de.json` | Complete German translations | Create |
| `/messages/nl.json` | Complete Dutch translations | Create |
| `/messages/it.json` | Complete Italian translations | Create |

### Reference File (Read-Only for This Task)

| File | Target | Type |
|------|--------|------|
| `/messages/en.json` | English source translations | Reference |

### Documentation Files

| File | Target | Type |
|------|--------|------|
| `/docs/i18n/glossary.md` | Translation glossary | Create |
| `/docs/i18n/translation-guide.md` | Contributor guide | Create (optional) |

### Utility Scripts

| File | Target | Type |
|------|--------|------|
| `/scripts/i18n-check.ts` | Missing translation checker | Create |
| `/scripts/i18n-validate.ts` | JSON structure validator | Create |
| `/package.json` | Add `i18n:check` npm script | Modify |

### Types (Reference Only)

| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/config.ts` | `SupportedLanguage` type | Reference |
| `/src/types/index.ts` | L10N type definitions | Reference |

## Translation Key Categories Reference

Based on Plan-111 namespace structure:

### `common` Namespace

```json
{
  "common": {
    "actions": { /* ~25 keys: save, cancel, delete, edit, create, submit, close, back, next, confirm, done, continue, retry, refresh, search, filter, sort, clear, reset, apply, view, viewAll, showMore, showLess, selectAll, deselectAll */ },
    "status": { /* ~14 keys: loading, saving, deleting, success, error, pending, completed, failed, active, inactive, enabled, disabled */ },
    "confirmation": { /* ~6 keys: title, deleteTitle, deleteMessage, unsavedChanges, yes, no */ },
    "empty": { /* ~3 keys: noData, noResults, tryAgain */ },
    "time": { /* ~7 keys: justNow, minutesAgo, hoursAgo, daysAgo, today, yesterday */ },
    "pagination": { /* ~4 keys: previous, next, page, showing */ },
    "validation": { /* ~4 keys: required, invalidEmail, tooShort, tooLong */ }
  }
}
```

## Dependencies

### Internal Dependencies

| Dependency | Description | Status Required |
|------------|-------------|-----------------|
| Epic 1 Foundation | next-intl installed and configured | Complete |
| Task 2H.1 | Common namespace structure created | Complete |
| Tasks 2H.2-2H.9 | All English strings extracted to en.json | Complete |

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| Claude AI / OpenAI API | Translation generation |
| next-intl | i18n framework for consuming translations |
| Node.js | Running validation scripts |

## Translation Quality Guidelines

### General Rules

1. **Formal Register**: Use formal address (vous/usted/Sie/u/Lei) consistently
2. **Context Awareness**: Translations should make sense in a property rental/hospitality context
3. **Action Verbs**: Button labels should use imperative or infinitive form as culturally appropriate
4. **Brevity**: Keep translations concise, especially for buttons and labels
5. **Consistency**: Same English term = same translation throughout

### Placeholder Handling

```json
// English (with placeholder)
"items.count": "{count, plural, =0 {No items} one {# item} other {# items}}"

// French (with placeholder preserved)
"items.count": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}"

// German (with placeholder preserved)
"items.count": "{count, plural, =0 {Keine Elemente} one {# Element} other {# Elemente}}"
```

### Domain-Specific Terms

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| QR Code | Code QR | Codigo QR | QR-Code | QR-code | Codice QR |
| Property | Propriete | Propiedad | Immobilie | Eigendom | Proprieta |
| Item | Article | Articulo | Element | Item | Articolo |
| Dashboard | Tableau de bord | Panel | Dashboard | Dashboard | Dashboard |
| Instructions | Instructions | Instrucciones | Anleitungen | Instructies | Istruzioni |

## Risks and Considerations

### Potential Side Effects

1. **Text Length Variation**: German and French translations often 20-40% longer than English; may cause UI overflow issues
2. **Right-to-Left (RTL)**: Not applicable for these 5 languages, but future Arabic/Hebrew would require additional handling
3. **Cultural Sensitivity**: Some idioms or metaphors may not translate directly
4. **Regional Variations**: Spanish (Latin America vs Spain) and French (France vs Canada) have regional differences

### Testing Requirements

1. **Visual Regression**: All pages must be tested in each language for layout issues
2. **Placeholder Validation**: Automated test to verify all placeholders work correctly
3. **Character Encoding**: Verify accented characters display correctly across all browsers
4. **ICU Format Testing**: Test plural forms with 0, 1, and multiple values
5. **Language Switching**: Test runtime language switching maintains proper display

### Mitigation Strategies

| Risk | Mitigation |
|------|------------|
| Longer text causing UI overflow | Design with 40% text expansion margin; truncate with ellipsis if needed |
| Translation inconsistency | Maintain glossary; use translation memory patterns |
| Missing placeholders | Automated validation in CI/CD pipeline |
| Cultural appropriateness issues | Flag critical strings for human review |

## Acceptance Criteria

Per REQ-313:

- [ ] Translation files created for all 5 non-English languages (fr, es, de, nl, it)
- [ ] Every translation key in en.json has corresponding translation in each language file
- [ ] Common namespace translations complete: buttons, labels, navigation
- [ ] Form element translations complete: labels, placeholders, hints, validation
- [ ] Modal and dialog translations complete: titles, body content, actions
- [ ] Toast notification messages translated: success, error, warning, info
- [ ] Empty state messages translated with culturally appropriate tone
- [ ] Loading state messages translated maintaining brevity
- [ ] Confirmation dialog messages translated with appropriate gravity
- [ ] Date/time formatting strings complete: month names, day names, relative expressions
- [ ] Translations use natural, idiomatic phrasing (not literal conversions)
- [ ] Cultural adaptations made where direct translation would be inappropriate
- [ ] Translation files maintain valid JSON structure with proper UTF-8 encoding
- [ ] Variable placeholders and ICU markers preserved correctly in all translations
- [ ] Application displays correctly in each language without text overflow or layout issues
- [ ] Users can switch between all 6 languages and see complete translations

## Out of Scope

Per Epic 2 Sub-Epic 2H Task 2H.10:

1. **Other Namespaces**: Auth, dashboard, items, workflow, articles, properties, settings, errors, emails - these are covered by other Sub-Epics
2. **Email Template Translations**: Covered by Sub-Epic 2I
3. **Dynamic Content Translation**: Runtime translation of user-generated content is Epic 3
4. **RTL Language Support**: Arabic, Hebrew, etc. not in current supported languages list
5. **Professional Translation Review**: Initial translations are AI-generated; professional review is separate process
6. **Translation Management System (TMS)**: Integration with Crowdin, Lokalise, etc. not in scope

## File Structure After Completion

```
/messages
├── en.json              # English (source of truth) - ~800 keys
├── fr.json              # French - ~800 keys (NEW)
├── es.json              # Spanish - ~800 keys (NEW)
├── de.json              # German - ~800 keys (NEW)
├── nl.json              # Dutch - ~800 keys (NEW)
└── it.json              # Italian - ~800 keys (NEW)

/docs/i18n
├── glossary.md          # Translation glossary (NEW)
└── translation-guide.md # Contributor guide (NEW, optional)

/scripts
├── i18n-check.ts        # Missing translation checker (NEW)
└── i18n-validate.ts     # JSON structure validator (NEW)
```

## References

- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan-110: L10N Epic 1 - Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-313: Generate Translations for All Non-English Languages](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---
*Document generated: 2026-01-18 18:45:00 UTC*
