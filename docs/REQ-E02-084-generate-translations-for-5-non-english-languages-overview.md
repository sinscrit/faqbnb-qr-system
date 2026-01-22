# REQ-E02-084: Generate Translations for 5 Non-English Languages (Item Management)

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-084
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.7
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 15:30
**Last Modified:** 2026-01-22 15:30

---

## 1. Summary

This document provides the implementation breakdown for generating translations of Item Management UI strings into 5 non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This is the final task in Sub-Epic 2D, taking all English source strings from the `items` namespace and producing culturally appropriate, grammatically correct translations for each target language.

The Item Management namespace includes approximately 400 translation keys covering:
- Items list page (title, count, buttons, loading states, empty states)
- Item edit page (form labels, buttons, messages)
- ItemManager components (grid, card, row, filters, sort, bulk actions)
- Room types (11 options)
- Item types (3 options)
- Purpose badges (7 options)

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` - Task 2D.7

Generate translations for the following namespaces in the `items` section:
- `items.list.*` - List page strings
- `items.edit.*` - Edit page strings including form, buttons, rooms, itemTypes, purposes
- `items.grid.*` - Grid view strings
- `items.card.*` - Card component strings
- `items.row.*` - Row component strings
- `items.actions.*` - Action button strings
- `items.filters.*` - Filter panel strings
- `items.sort.*` - Sort menu strings
- `items.bulk.*` - Bulk action strings
- `items.bulkTag.*` - Bulk tag dialog strings
- `items.search.*` - Search strings
- `items.validation.*` - Validation message strings

### 2.2 Target Languages

| Language | Locale Code | File |
|----------|-------------|------|
| French | fr | `/messages/fr.json` |
| Spanish | es | `/messages/es.json` |
| German | de | `/messages/de.json` |
| Dutch | nl | `/messages/nl.json` |
| Italian | it | `/messages/it.json` |

### 2.3 Translation Requirements

1. **Grammatical correctness** - All translations must be grammatically correct in the target language
2. **Cultural appropriateness** - Translations should use culturally appropriate terminology
3. **ICU message format** - Preserve ICU plural syntax (`{count, plural, one {...} other {...}}`)
4. **Interpolation variables** - Preserve all `{variable}` placeholders exactly
5. **Consistent terminology** - Use consistent translations for repeated terms across all keys
6. **UI context awareness** - Translations should fit UI space constraints (button labels, placeholders)
7. **Key structure parity** - All 5 language files must have identical key structure to English

---

## 3. Technical Approach

### 3.1 Translation Process

1. **Extract English source strings** from `/messages/en.json` for the `items` namespace
2. **Identify existing translations** in target language files
3. **Generate missing translations** for any keys not yet translated
4. **Validate translations** for ICU format preservation and variable consistency
5. **Update language files** with complete translations

### 3.2 ICU Message Format Handling

Special attention required for:
- Plural forms: `{count, plural, one {# item} other {# items}}`
- Select forms: `{type, select, video {Video} photo {Photo} other {Other}}`
- Variable interpolation: `{title}`, `{count}`, `{location}`, etc.

**Example:**
```json
// English
"count": "{count, plural, one {# item} other {# items}} total"

// French (different plural rules)
"count": "{count, plural, one {# article} other {# articles}} au total"

// German (different word order)
"count": "{count, plural, one {# Artikel} other {# Artikel}} insgesamt"
```

### 3.3 Key Terminology Consistency

Establish consistent translations for frequently used terms:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Item | Article | Artículo | Artikel | Artikel | Articolo |
| Items | Articles | Artículos | Artikel | Artikelen | Articoli |
| Property | Propriété | Propiedad | Immobilie | Eigendom | Proprietà |
| Guide | Guide | Guía | Anleitung | Handleiding | Guida |
| QR Code | QR Code | Código QR | QR-Code | QR-code | Codice QR |
| Filter | Filtre | Filtro | Filter | Filter | Filtro |
| Sort | Trier | Ordenar | Sortieren | Sorteren | Ordina |
| Search | Rechercher | Buscar | Suchen | Zoeken | Cerca |
| Tag | Tag/Étiquette | Etiqueta | Tag | Tag | Tag |
| Room | Pièce | Habitación | Raum | Kamer | Stanza |
| Location | Emplacement | Ubicación | Standort | Locatie | Posizione |

---

## 4. Implementation Tasks

### Task 1: Audit existing translations in target files (Priority: High)

**Description:** Compare the `items` namespace in each target language file against the English source to identify missing or incomplete translations.

**Files to Review:**
- `/messages/en.json` (source)
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Acceptance Criteria:**
- [ ] List all missing keys in each language file
- [ ] Identify any keys with placeholder English text
- [ ] Document any ICU format inconsistencies

---

### Task 2: Generate French (fr) translations (Priority: High)

**Description:** Complete all missing French translations for the `items` namespace.

**File to Modify:** `/messages/fr.json`

**Key Areas:**
- `items.list.*` - List page strings
- `items.edit.*` - Edit page and form strings
- `items.grid.*`, `items.card.*`, `items.row.*` - View component strings
- `items.actions.*` - Action labels
- `items.filters.*`, `items.sort.*` - Filter and sort strings
- `items.bulk.*`, `items.bulkTag.*` - Bulk action strings
- `items.validation.*` - Validation messages

**Acceptance Criteria:**
- [ ] All `items.*` keys have French translations
- [ ] ICU plural forms use correct French plural rules
- [ ] All variable placeholders preserved
- [ ] Translations fit UI context (button labels not too long)

---

### Task 3: Generate Spanish (es) translations (Priority: High)

**Description:** Complete all missing Spanish translations for the `items` namespace.

**File to Modify:** `/messages/es.json`

**Acceptance Criteria:**
- [ ] All `items.*` keys have Spanish translations
- [ ] ICU plural forms use correct Spanish plural rules
- [ ] All variable placeholders preserved
- [ ] Translations fit UI context

---

### Task 4: Generate German (de) translations (Priority: High)

**Description:** Complete all missing German translations for the `items` namespace.

**File to Modify:** `/messages/de.json`

**Special Considerations:**
- German compound nouns (e.g., "Artikelverwaltung" for "Item Management")
- Formal "Sie" vs informal "du" - use formal throughout
- German word order in sentences

**Acceptance Criteria:**
- [ ] All `items.*` keys have German translations
- [ ] ICU plural forms use correct German plural rules
- [ ] All variable placeholders preserved
- [ ] Consistent use of formal address

---

### Task 5: Generate Dutch (nl) translations (Priority: High)

**Description:** Complete all missing Dutch translations for the `items` namespace.

**File to Modify:** `/messages/nl.json`

**Acceptance Criteria:**
- [ ] All `items.*` keys have Dutch translations
- [ ] ICU plural forms use correct Dutch plural rules
- [ ] All variable placeholders preserved
- [ ] Translations fit UI context

---

### Task 6: Generate Italian (it) translations (Priority: High)

**Description:** Complete all missing Italian translations for the `items` namespace.

**File to Modify:** `/messages/it.json`

**Acceptance Criteria:**
- [ ] All `items.*` keys have Italian translations
- [ ] ICU plural forms use correct Italian plural rules
- [ ] All variable placeholders preserved
- [ ] Translations fit UI context

---

### Task 7: Validate JSON structure and ICU syntax (Priority: High)

**Description:** Validate that all translation files have valid JSON and correct ICU message syntax.

**Validation Checks:**
1. JSON syntax validation (no trailing commas, proper escaping)
2. ICU message format validation
3. Variable placeholder consistency
4. Key structure parity across all 6 files

**Acceptance Criteria:**
- [ ] All 6 files pass JSON validation
- [ ] All ICU messages are syntactically correct
- [ ] All variable placeholders match between English and translations
- [ ] Key counts match across all files for `items` namespace

---

### Task 8: Test translations in application (Priority: High)

**Description:** Verify translations display correctly in the application.

**Test Scenarios:**
1. Switch language to each of the 5 non-English locales
2. Navigate to `/dashboard2/items` and verify:
   - Page title, count, buttons translated
   - Empty state messages translated
   - Loading states translated
3. Navigate to `/dashboard2/items/[id]/edit` and verify:
   - Form labels and placeholders translated
   - Room selector options translated
   - Item type options translated
   - Buttons and states translated
4. Test ItemManager features:
   - Filter panel labels translated
   - Sort menu options translated
   - Bulk action dialogs translated
   - Card/row content translated
5. Verify no missing translation warnings in console

**Acceptance Criteria:**
- [ ] All 5 languages display correctly
- [ ] No console warnings for missing keys
- [ ] ICU plurals display correctly
- [ ] Variable interpolation works

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files

| File | Modification Type | Notes |
|------|-------------------|-------|
| `/messages/fr.json` | Modify | Add/update `items.*` translations |
| `/messages/es.json` | Modify | Add/update `items.*` translations |
| `/messages/de.json` | Modify | Add/update `items.*` translations |
| `/messages/nl.json` | Modify | Add/update `items.*` translations |
| `/messages/it.json` | Modify | Add/update `items.*` translations |

### 5.2 Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source strings - DO NOT MODIFY |
| `src/lib/i18n/config.ts` | Locale configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## 6. Translation Keys Reference

### 6.1 Items Namespace Structure

```
items
├── title, subtitle, name, description, property, qrCode, articles, room, tags
├── list
│   ├── title, count, createNew, loginRequired, dismiss, error, loading
│   ├── noArticles, addFirstArticle, caption, selectionActive, sortBy
│   ├── empty (title, description, action)
│   ├── noResults (title, description)
│   └── columns (selection, preview, title, location, guides, tags, property, created, views, reactions, actions)
├── grid (ariaLabel, loading)
├── card
│   ├── contentType (link, text, pdf, mixed, video, photo, media)
│   ├── views, pieces, noContent, more, select, thumbnail
│   ├── scanCount, lastScanned, createdAt, updatedAt
│   ├── placeholder (title, location, tags)
│   ├── aria (location, selected, notSelected, pressEnterToSelect, etc.)
│   └── tags (more)
├── row (ariaLocation, ariaGuides, ariaNoGuides, ariaCreated, ariaViews, ariaReactions, ariaSelected, ariaNotSelected, actionsMenu, actionsFor)
├── actions (create, createQR, edit, delete, duplicate, viewQR, print, printQR, downloadQR, share, manageAssets, addArticle)
├── filters
│   ├── title, clearAll, applyFilters, close
│   ├── sections (contentType, tags, location, property)
│   ├── contentType (label, video, photo, pdf, textOnly, mixed)
│   ├── contentTypes (all, video, photo, pdf, text, link, mixed)
│   ├── tags (label, placeholder, searchPlaceholder, noTags, noMatching, allSelected, removeTag, selected)
│   ├── location (label, placeholder, searchPlaceholder, noLocations, noMatching, noFound, clearSelection, all)
│   └── property (label, placeholder, all)
├── sort
│   ├── label, sortBy
│   └── options (titleAsc, titleDesc, newestFirst, oldestFirst, recentlyModified, leastRecentlyModified, locationAsc, mostGuides, fewestGuides, newest, oldest, nameAZ, nameZA, mostViewed, recentlyViewed)
├── search (placeholder, clear, results, showing)
├── bulk (ariaLabel, selected, selectedAria, processing, actions, cancel, cancelSelection, selectAll, deselectAll)
├── bulkTag (addTitle, removeTitle, addDescription, removeDescription, etc.)
├── validation (nameRequired, nameTooLong, duplicateName)
├── edit
│   ├── pageTitle, backToItems, loading, loginRequired, returnToItems, notFound, loadError
│   ├── form (nameLabel, namePlaceholder, descriptionLabel, descriptionPlaceholder, roomLabel, roomPlaceholder, roomAriaLabel, itemTypeLabel, itemTypePlaceholder, itemTypeAriaLabel, tagsLabel, tagsHelper, tagsPlaceholder)
│   ├── buttons (cancel, save, saving)
│   ├── guides (title, description, empty, emptyDescription, edit)
│   ├── rooms (kitchen, bathroom, bedroom, livingRoom, laundry, garage, outdoor, office, gym, pool, other)
│   ├── itemTypes (appliance, roomItem, generalInfo)
│   ├── purposes (howToUse, troubleshooting, howToClean, safetyInfo, maintenance, features, other)
│   └── tags (addTags, typeToAdd, maxReached, saving, editTags, tagsSelected, savingTags, moreCount, suggestions, addNewTag, removeTag, validation.*)
├── create (title, description)
├── links (sectionTitle, addLink, noResources, addFirstResource)
├── analyticsSection (title, noData, views.*, reactions.*)
└── instructionsViewer (ariaLabel, headerText, empty)
```

### 6.2 Estimated Key Count

| Namespace | Estimated Keys |
|-----------|----------------|
| items.list | ~25 |
| items.grid | ~5 |
| items.card | ~40 |
| items.row | ~15 |
| items.actions | ~15 |
| items.filters | ~45 |
| items.sort | ~20 |
| items.search | ~5 |
| items.bulk | ~15 |
| items.bulkTag | ~20 |
| items.validation | ~5 |
| items.edit | ~80 |
| items.create | ~5 |
| items.links | ~5 |
| items.analyticsSection | ~15 |
| items.instructionsViewer | ~5 |
| **Total** | **~315 keys** |

---

## 7. Dependencies and Blockers

### 7.1 Prerequisites
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Translation files exist for all 6 languages
- [x] `items` namespace structure defined in English

### 7.2 Dependencies on Other Requests

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-078 (Create items namespace structure) | Source strings | Complete |
| REQ-E02-079 (Update ItemManager component family) | Uses translations | Complete |
| REQ-E02-080 (Update ItemGrid and ItemCard) | Uses translations | Complete |
| REQ-E02-081 (Update filter and sort components) | Uses translations | Complete |
| REQ-E02-082 (Update bulk action dialogs) | Uses translations | Complete |
| REQ-E02-083 (Update item detail/edit pages) | Uses translations | Complete |

### 7.3 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| Sub-Epic 2D completion | Completes Item Management i18n |

### 7.4 Parallel Safety

- **Files touched**: `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
- **Conflicts with**: Any other translation generation tasks for the same files
- **Safe to parallelize with**: Component update tasks (read translation files, don't write)

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Incorrect plural forms in target language | Medium | Medium | Use native speaker review or validated translation tools |
| Variable placeholders modified or removed | Low | High | Automated validation of placeholder consistency |
| Translations too long for UI | Medium | Low | Test in application; use shorter alternatives |
| JSON syntax errors | Low | High | JSON validation before commit |
| Cultural inappropriateness | Low | Medium | Review by native speakers if possible |
| Inconsistent terminology | Medium | Low | Use terminology glossary; search-replace for consistency |

---

## 9. Verification Checklist

### 9.1 Per-Language Verification
For each of the 5 target languages:
- [ ] All `items.*` keys have translations
- [ ] No English text remains (except proper nouns like "FAQBNB")
- [ ] ICU plural syntax is correct for the language
- [ ] All `{variable}` placeholders match English source
- [ ] JSON is valid (no syntax errors)
- [ ] Translations display correctly in UI

### 9.2 Cross-Language Verification
- [ ] All 6 files have identical key structure
- [ ] Key counts match for `items` namespace
- [ ] Terminology is consistent across languages where appropriate

### 9.3 Application Verification
- [ ] Items list page renders correctly in all languages
- [ ] Edit item page renders correctly in all languages
- [ ] Filter/sort/bulk dialogs work in all languages
- [ ] No console warnings for missing translations
- [ ] Language switching updates all visible text

---

## 10. Out of Scope

- Creating new translation keys (source strings come from English file)
- Modifying English source strings
- Translating other namespaces (auth, dashboard, etc. - covered by other tasks)
- Backend/API message translations
- Email template translations (covered by Sub-Epic 2I)
- Dynamic content translations (covered by Epic 3)

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl ICU Format:** https://next-intl-docs.vercel.app/docs/usage/messages#icu-syntax
- **CLDR Plural Rules:** https://cldr.unicode.org/index/cldr-spec/plural-rules

---

*Document generated: 2026-01-22 15:30*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
