# REQ-391: Generate Translations for Item Management Components (5 Non-English Languages) - Implementation Overview

*Generated: 2026-01-19 22:30:00 UTC*
*Last Modified: 2026-01-19 22:30:00 UTC*

## Reference

- **Request**: REQ-391 (Generate Translations for Item Management Components)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement (Translation Generation)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2D - Item Management
- **Task ID**: 2D.7
- **Size**: L (Large)
- **Priority**: Seventh in recommended order (final task of Sub-Epic 2D)

## Goals

1. Translate all Item Management namespace strings from English to 5 target languages:
   - German (de)
   - Spanish (es)
   - French (fr)
   - Italian (it)
   - Dutch (nl)
2. Ensure translations maintain semantic accuracy with property management domain terminology
3. Apply correct ICU pluralization rules for each target language
4. Maintain consistency with common namespace translations already established
5. Ensure contextually appropriate translations for filters, actions, confirmations, and metadata labels

## Context from Implementation Plan

### Sub-Epic 2D Overview (Per Plan-111)

Sub-Epic 2D focuses on Item Management components with:
- **Estimated Strings**: ~400
- **Components Affected**: ItemManager family (40+ files), ItemGrid, ItemCard, FilterPanel, SortMenu, BulkActions, Item pages
- **Namespace**: `items.*`

This task (2D.7) is the final task in Sub-Epic 2D, generating translations after all component string extraction is complete (Tasks 2D.1-2D.6).

### Prerequisites (Must Be Complete)

| Task | Description | Status |
|------|-------------|--------|
| REQ-385 (2D.1) | Create items namespace structure in translation files | Must be complete |
| REQ-386 (2D.2) | Update ItemManager component family | Must be complete |
| REQ-387 (2D.3) | Update ItemGrid and ItemCard | Must be complete |
| REQ-388 (2D.4) | Update filter and sort components | Must be complete |
| REQ-389 (2D.5) | Update bulk action dialogs | Must be complete |
| REQ-390 (2D.6) | Update item detail/edit pages | Must be complete |

### Source Translation File

The source of truth for translations is `/messages/en.json` containing the `items` namespace with the following structure (per REQ-385):

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "list": { /* empty states, no results */ },
    "card": { /* views count, content pieces */ },
    "actions": { /* create, edit, delete, duplicate, print, share */ },
    "filters": { /* filter panel labels */ },
    "sort": { /* sort menu options */ },
    "bulk": { /* bulk actions bar strings */ },
    "detail": { /* item detail/preview tabs */ },
    "delete": { /* delete confirmation dialog */ },
    "metadata": { /* field labels */ },
    "validation": { /* validation messages */ },
    "view": { /* grid/list view modes */ },
    "search": { /* search placeholder, results count */ },
    "empty": { /* empty state messages */ }
  }
}
```

## Current State Analysis

### Translation Files Status

| File | Current State |
|------|---------------|
| `/messages/en.json` | Contains complete `items` namespace structure (source of truth) |
| `/messages/de.json` | Contains basic flat `items` keys (not yet restructured/translated) |
| `/messages/fr.json` | Contains basic flat `items` keys (not yet restructured/translated) |
| `/messages/es.json` | Contains basic flat `items` keys (not yet restructured/translated) |
| `/messages/it.json` | Contains basic flat `items` keys (not yet restructured/translated) |
| `/messages/nl.json` | Contains basic flat `items` keys (not yet restructured/translated) |

### Estimated Translation Count

Based on the items namespace structure defined in REQ-385:

| Category | Estimated Keys | Translation Complexity |
|----------|----------------|----------------------|
| `items.title/subtitle` | 2 | Simple |
| `items.list` | 4 | Simple |
| `items.card` | 3 | Contains pluralization |
| `items.actions` | 10 | Simple |
| `items.filters` | 9 | Domain-specific terminology |
| `items.sort` | 6 | Standard conventions |
| `items.bulk` | 8 | Contains pluralization |
| `items.detail` | 5 | Simple |
| `items.delete` | 6 | Contains interpolation & plurals |
| `items.metadata` | 12 | Domain-specific labels |
| `items.validation` | 2 | Contains interpolation |
| `items.view` | 2 | Simple |
| `items.search` | 2 | Contains interpolation |
| `items.empty` | 2 | Simple |
| **Total** | **~73** | Mixed complexity |

**Total Translations Required**: ~73 keys × 5 languages = **~365 translation entries**

## Implementation Approach

### Translation Strategy

1. **AI-Assisted Translation**: Use Claude/OpenAI for contextual translations with property management domain awareness
2. **Glossary Consistency**: Reference common namespace translations for shared terms (Save, Cancel, Delete, etc.)
3. **ICU Format Compliance**: Ensure all pluralization follows ICU message format for each language
4. **Native Review**: Flag critical strings (delete confirmations, validation messages) for native speaker review

### Language-Specific Considerations

#### German (de)
- **Pluralization**: Two forms (one, other)
- **Terminology**: Use formal "Sie" form consistently
- **Compound words**: Follow German conventions (e.g., "QR-Code-Artikel" vs "QR Code Artikel")
- **Property term**: "Immobilie" (already established in common namespace)

#### Spanish (es)
- **Pluralization**: Two forms (one, other)
- **Terminology**: Use neutral/Latin American Spanish
- **Gender**: Maintain consistency with established terms

#### French (fr)
- **Pluralization**: Two forms (one, other) - note: French treats 0 and 1 as singular
- **Terminology**: Use formal "vous" form
- **Gender**: Maintain masculine/feminine consistency

#### Italian (it)
- **Pluralization**: Two forms (one, other)
- **Terminology**: Use formal "Lei" form
- **Gender**: Italian has complex gender agreement

#### Dutch (nl)
- **Pluralization**: Two forms (one, other)
- **Terminology**: Use formal "u" form
- **Word order**: Dutch has specific word order rules in certain constructs

### ICU Pluralization Patterns

The `items` namespace contains several plural-aware strings that must be adapted:

```json
// English pattern
"views": "{count, plural, one {# view} other {# views}}"
"pieces": "{count, plural, one {# piece} other {# pieces}} of content"
"selected": "{count} selected"
"messagePlural": "Are you sure you want to delete {count} items?"
```

Language-specific plural rules:

| Language | Plural Forms | Notes |
|----------|--------------|-------|
| German | one, other | Singular for 1, plural for all else |
| Spanish | one, other | Singular for 1, plural for all else |
| French | one, other | 0 and 1 are singular |
| Italian | one, other | Singular for 1, plural for all else |
| Dutch | one, other | Singular for 1, plural for all else |

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**:
  - Replace/update entire `items` namespace with German translations
  - Apply nested structure matching en.json
  - Use proper German pluralization in ICU format
- **Key Sections**:
  | Section | Translation Focus |
  |---------|------------------|
  | `items.title/subtitle` | Page headers |
  | `items.list.*` | Empty states with contextual German phrasing |
  | `items.card.*` | Pluralized view/content counts |
  | `items.actions.*` | Action button labels |
  | `items.filters.*` | Filter category names (property management context) |
  | `items.sort.*` | Sort option labels |
  | `items.bulk.*` | Bulk action labels with selection count |
  | `items.detail.*` | Tab/section labels |
  | `items.delete.*` | Confirmation dialogs with formal tone |
  | `items.metadata.*` | Field labels |
  | `items.validation.*` | Validation error messages |

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**:
  - Replace/update entire `items` namespace with Spanish translations
  - Apply nested structure matching en.json
  - Use neutral Spanish terminology
- **Key Focus**: Property management context translations

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**:
  - Replace/update entire `items` namespace with French translations
  - Apply nested structure matching en.json
  - Note French plural rule (0 is singular)
- **Key Focus**: Formal "vous" form, gender agreement

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**:
  - Replace/update entire `items` namespace with Italian translations
  - Apply nested structure matching en.json
  - Handle gender agreement carefully
- **Key Focus**: Formal "Lei" form, property terminology

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**:
  - Replace/update entire `items` namespace with Dutch translations
  - Apply nested structure matching en.json
  - Use proper Dutch word order
- **Key Focus**: Formal "u" form, compound word handling

### Files Referenced (Read-Only)

#### `/messages/en.json`
- **Purpose**: Source of truth for all translation keys
- **Reference**: Complete items namespace structure and English text

#### `/src/lib/i18n/config.ts`
- **Purpose**: Verify locale configuration
- **Reference**: Confirm all 6 locales configured

#### `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Purpose**: Reference for translation conventions and patterns
- **Reference**: ICU format examples, key naming conventions

## Technical Specifications

### Translation Key Structure

All translations must maintain identical key structure across all 6 language files:

```
items.title
items.subtitle
items.list.empty.title
items.list.empty.description
items.list.empty.action
items.list.noResults
items.card.views
items.card.pieces
items.card.noContent
items.actions.create
items.actions.edit
items.actions.delete
items.actions.duplicate
items.actions.viewQR
items.actions.print
items.actions.share
items.actions.printQrCode
items.actions.downloadQrCode
items.actions.manageAssets
items.filters.title
items.filters.property
items.filters.room
items.filters.tag
items.filters.contentType
items.filters.status
items.filters.location
items.filters.clearAll
items.filters.applyFilters
items.sort.title
items.sort.sortLabel
items.sort.newest
items.sort.oldest
items.sort.nameAZ
items.sort.nameZA
items.sort.mostViewed
items.bulk.selected
items.bulk.delete
items.bulk.move
items.bulk.addTags
items.bulk.removeTags
items.bulk.print
items.bulk.cancel
items.bulk.processing
items.detail.title
items.detail.qrCode
items.detail.analytics
items.detail.content
items.detail.settings
items.delete.title
items.delete.titlePlural
items.delete.message
items.delete.messagePlural
items.delete.confirm
items.delete.confirmPlural
items.metadata.name
items.metadata.description
items.metadata.property
items.metadata.room
items.metadata.tags
items.metadata.qrCode
items.metadata.articles
items.metadata.scanCount
items.metadata.lastScanned
items.metadata.createdAt
items.metadata.updatedAt
items.validation.nameRequired
items.validation.descriptionTooLong
items.view.grid
items.view.list
items.search.placeholder
items.search.resultsCount
items.empty.title
items.empty.description
```

### ICU Pluralization Examples

#### English (source)
```json
"items.card.views": "{count, plural, one {# view} other {# views}}"
```

#### German
```json
"items.card.views": "{count, plural, one {# Aufruf} other {# Aufrufe}}"
```

#### French
```json
"items.card.views": "{count, plural, one {# vue} other {# vues}}"
```

#### Spanish
```json
"items.card.views": "{count, plural, one {# vista} other {# vistas}}"
```

#### Italian
```json
"items.card.views": "{count, plural, one {# visualizzazione} other {# visualizzazioni}}"
```

#### Dutch
```json
"items.card.views": "{count, plural, one {# weergave} other {# weergaven}}"
```

### Variable Interpolation Examples

#### English (source)
```json
"items.delete.message": "Are you sure you want to delete \"{name}\"? This action cannot be undone."
```

Translations must preserve the `{name}` variable exactly:

#### German
```json
"items.delete.message": "Sind Sie sicher, dass Sie \"{name}\" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
```

## Domain-Specific Terminology Glossary

The following terms should be translated consistently across all Item Management strings:

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Item | Artikel | Artículo | Article | Articolo | Artikel |
| Property | Immobilie | Propiedad | Propriété | Proprietà | Eigendom |
| Room | Raum | Habitación | Pièce | Stanza | Kamer |
| QR Code | QR-Code | Código QR | Code QR | Codice QR | QR-code |
| Tag | Tag | Etiqueta | Étiquette | Tag | Tag |
| Filter | Filter | Filtro | Filtre | Filtro | Filter |
| Sort | Sortieren | Ordenar | Trier | Ordina | Sorteren |
| Content | Inhalt | Contenido | Contenu | Contenuto | Inhoud |
| View | Ansicht | Vista | Vue | Visualizzazione | Weergave |
| Scan | Scan | Escaneo | Scan | Scansione | Scan |

## Verification Checklist

### Pre-Implementation
- [ ] Confirm REQ-385 through REQ-390 are complete
- [ ] Verify en.json contains complete items namespace structure
- [ ] Review common namespace translations for consistency reference

### During Implementation
- [ ] Apply identical key structure to all 5 language files
- [ ] Verify all ICU pluralization patterns are correct
- [ ] Verify all variable interpolations are preserved
- [ ] Check gender agreement (French, Italian, German)
- [ ] Use formal forms (Sie/vous/Lei/u) consistently

### Post-Implementation
- [ ] Run JSON syntax validation on all modified files
- [ ] Run application and verify no missing translation warnings
- [ ] Test pluralization with counts 0, 1, 2, 5, 10, 21
- [ ] Test variable interpolation with sample item names
- [ ] Visual check of key UI screens in each language
- [ ] Verify no layout breaks due to longer translations

## Dependencies

### Upstream Dependencies
| Dependency | Purpose | Status |
|------------|---------|--------|
| REQ-229 (Epic 1) | next-intl package installed | ✅ Complete |
| REQ-230 (Epic 1) | i18n config module | ✅ Complete |
| REQ-385 (2D.1) | Items namespace structure created | Required |
| REQ-386-390 (2D.2-2D.6) | Components updated to use translations | Required |

### Downstream Dependencies
| Dependency | Purpose |
|------------|---------|
| None | This is the final task of Sub-Epic 2D |

## Risk Assessment

### Risk Level: Medium

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent terminology | Medium | Medium | Use glossary, reference common namespace |
| ICU format errors | Medium | High | Validate with next-intl, test all plural cases |
| Missing translations at runtime | Low | High | Build-time JSON validation, comprehensive key list |
| Layout breaks from longer text | Medium | Low | Design accommodates 40% text expansion |
| Cultural appropriateness issues | Low | Medium | Use neutral, formal language; flag for review |

## Acceptance Criteria

From REQ-391:

- [ ] All Item Management namespace keys from the English translation file are present in de.json with accurate German translations
- [ ] All Item Management namespace keys from the English translation file are present in es.json with accurate Spanish translations
- [ ] All Item Management namespace keys from the English translation file are present in fr.json with accurate French translations
- [ ] All Item Management namespace keys from the English translation file are present in it.json with accurate Italian translations
- [ ] All Item Management namespace keys from the English translation file are present in nl.json with accurate Dutch translations
- [ ] Pluralization rules are correctly implemented for each language using next-intl plural syntax
- [ ] Filter category names use terminology appropriate to property management contexts in each language
- [ ] Sort option labels use standard conventions for each language
- [ ] Bulk action dialog warnings maintain appropriate tone and clarity in each language
- [ ] Field labels and validation messages use familiar terminology for each target audience
- [ ] Button labels follow platform-wide translation conventions established in common namespace
- [ ] Status indicators and badges use contextually appropriate language
- [ ] Empty state messages are culturally and linguistically appropriate
- [ ] Help text and tooltips provide clear guidance in each language
- [ ] Translation keys maintain consistent structure across all six language files

## Implementation Steps Summary

1. **Read English Source**: Extract all `items.*` keys from `/messages/en.json`
2. **Translate German**: Apply complete German translations to `/messages/de.json`
3. **Translate Spanish**: Apply complete Spanish translations to `/messages/es.json`
4. **Translate French**: Apply complete French translations to `/messages/fr.json`
5. **Translate Italian**: Apply complete Italian translations to `/messages/it.json`
6. **Translate Dutch**: Apply complete Dutch translations to `/messages/nl.json`
7. **Validate JSON**: Run syntax validation on all 5 modified files
8. **Test Application**: Verify translations load without errors
9. **Visual QA**: Check key screens in each language for layout issues

## Notes

- This task completes Sub-Epic 2D (Item Management)
- Translations should be contextually appropriate for property management software
- Formal language forms should be used consistently (Sie, vous, Lei, u)
- Variable placeholders (e.g., `{name}`, `{count}`) must be preserved exactly
- ICU plural syntax must match target language grammar rules
- Common action words should reference translations already established in common namespace

---

*Document created for FAQBNB Localization Epic 2 - Static UI Translation*
*Sub-Epic 2D - Item Management - Task 2D.7*
