# REQ-E02-075: Generate Translations for 5 Non-English Languages (Article & Content Management)

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-075
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.6
**Priority:** High
**Size:** L (Large)

**Created:** 2026-01-22 18:31
**Last Modified:** 2026-01-22 18:31

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-075 (Task 2E.6) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 18:31 |
| T-shirt Size | L (Large) |
| Estimated Effort | 8-12 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for generating translations of Article & Content Management UI strings into 5 non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This is the final task in Sub-Epic 2E, taking all English source strings from the `articles` namespace and producing culturally appropriate, grammatically correct translations for each target language.

Based on investigation, the `articles` namespace already exists in all 6 language files. This task involves verifying the key structure consistency and generating/updating the actual translations for the 5 non-English languages.

---

## 3. Goals

### 3.1 Functional Requirements

1. Verify the `articles` namespace structure is identical across all 6 language files
2. Generate French translations for all `articles.*` keys
3. Generate Spanish translations for all `articles.*` keys
4. Generate German translations for all `articles.*` keys
5. Generate Dutch translations for all `articles.*` keys
6. Generate Italian translations for all `articles.*` keys
7. Preserve ICU message format syntax for plurals and interpolation
8. Ensure translations are grammatically correct and culturally appropriate
9. Maintain consistent terminology across all translations

### 3.2 Assumptions & Clarifications

- The `articles` namespace structure has been created in Task 2E.1
- All component updates (Tasks 2E.2-2E.5) are complete
- Translation files already have the `articles` namespace with placeholder or English text
- ICU plural rules differ by language and must be respected
- Variable placeholders (`{variableName}`) must be preserved exactly
- Professional translation tools or native speakers should be consulted for quality

---

## 4. Requirements Analysis

### 4.1 Current State Investigation

**Translation File Status:**
- **en.json**: 3,911 lines - Source of truth
- **fr.json**: 3,805 lines - `articles` namespace exists at line 3485
- **es.json**: 3,805 lines - Structure should match fr.json
- **de.json**: 3,805 lines - Structure should match fr.json
- **nl.json**: 3,805 lines - Structure should match fr.json
- **it.json**: 3,791 lines - Structure should match others

**Articles Namespace Location:** Line 3501 in en.json

### 4.2 Translation Scope

The `articles` namespace contains approximately 350-400 translation keys covering:

| Category | Estimated Keys | Description |
|----------|---------------|-------------|
| `articles.editor.*` | ~40 | Markdown editor UI, toolbar, formatting |
| `articles.media.*` | ~10 | Media upload controls |
| `articles.crop.*` | ~30 | Image cropping interface |
| `articles.video.*` | ~40 | Video trimming interface |
| `articles.rotate.*` | ~15 | Image rotation controls |
| `articles.purposes.*` | ~10 | Content purpose/category labels |
| `articles.list.*` | ~50 | Instructions list page |
| `articles.edit.*` | ~40 | Edit page labels |
| `articles.grid.*` | ~10 | Grid view components |
| `articles.table.*` | ~20 | Table view components |
| `articles.card.*` | ~10 | Card component labels |
| `articles.content.*` | ~30 | Content editing section |
| `articles.instructionEditor.*` | ~10 | Instruction editor specific |
| `articles.empty.*` | ~10 | Empty state messages |
| `articles.validation.*` | ~10 | Validation messages |
| **Total** | **~335+ keys** | Full article/content management |

### 4.3 Translation Requirements

1. **Grammatical correctness** - All translations must be grammatically correct
2. **Cultural appropriateness** - Use culturally appropriate terminology
3. **ICU message format** - Preserve ICU plural syntax exactly
4. **Interpolation variables** - Preserve all `{variable}` placeholders
5. **Consistent terminology** - Use consistent translations for repeated terms
6. **UI context awareness** - Translations should fit UI space constraints
7. **Key structure parity** - All 6 files must have identical key structure

---

## 5. Technical Approach

### 5.1 Translation Process

```
1. Audit Phase
   ├─ Compare en.json articles namespace with all 5 target files
   ├─ Identify any missing keys or structural differences
   └─ Document current translation status (English placeholder vs actual translation)

2. Translation Generation Phase (per language)
   ├─ Extract all articles.* keys from en.json
   ├─ Generate translations using professional tools or native speakers
   ├─ Preserve ICU format and variable placeholders
   ├─ Apply language-specific plural rules
   └─ Update target language file

3. Validation Phase
   ├─ Verify JSON syntax is valid
   ├─ Verify ICU message format is correct
   ├─ Verify variable placeholders match exactly
   ├─ Verify key structure matches across all files
   └─ Spot-check translations in application
```

### 5.2 ICU Message Format Handling

**Critical Requirements:**

```json
// English
"count": "{count, plural, one {# item} other {# items}} total"

// French (different plural rules: 0/1 vs 2+)
"count": "{count, plural, one {# article} other {# articles}} au total"

// German (same plural rules as English, different word order)
"count": "{count, plural, one {# Artikel} other {# Artikel}} insgesamt"

// Spanish (0/1 vs 2+)
"count": "{count, plural, one {# artículo} other {# artículos}} en total"

// Dutch (one vs other)
"count": "{count, plural, one {# artikel} other {# artikelen}} totaal"

// Italian (one vs other)
"count": "{count, plural, one {# articolo} other {# articoli}} totale"
```

### 5.3 Key Terminology Consistency

Establish consistent translations for frequently used terms:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Instructions | Instructions | Instrucciones | Anleitungen | Instructies | Istruzioni |
| Guide(s) | Guide(s) | Guía(s) | Anleitung(en) | Handleiding(en) | Guida(e) |
| Article | Article | Artículo | Artikel | Artikel | Articolo |
| Edit | Modifier | Editar | Bearbeiten | Bewerken | Modifica |
| Preview | Aperçu | Vista previa | Vorschau | Voorbeeld | Anteprima |
| Crop | Recadrer | Recortar | Zuschneiden | Bijsnijden | Ritaglia |
| Trim | Couper | Recortar | Trimmen | Bijsnijden | Taglia |
| Upload | Télécharger | Subir | Hochladen | Uploaden | Carica |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |

---

## 6. Implementation Tasks

### Task 1: Audit articles namespace structure (Priority: High)

**Description:** Compare the `articles` namespace structure in en.json against all 5 target language files to identify any structural differences or missing keys.

**Files to Audit:**
- `/messages/en.json` (source of truth, line 3501)
- `/messages/fr.json` (line 3485)
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Verification Steps:**
1. Extract all key paths from en.json articles namespace
2. Compare key structure in each target language file
3. Identify any missing or extra keys
4. Identify keys with English placeholder text vs actual translations
5. Document findings

**Acceptance Criteria:**
- [ ] Complete inventory of all `articles.*` keys (~335+ keys)
- [ ] Structural differences documented (if any)
- [ ] Current translation status documented per language
- [ ] Missing keys identified

---

### Task 2: Generate French (fr) translations (Priority: High)

**Description:** Complete all French translations for the `articles` namespace.

**File to Modify:** `/messages/fr.json`

**Key Areas:**
- `articles.editor.*` - Editor UI and formatting
- `articles.media.*` - Media upload
- `articles.crop.*` - Image cropping
- `articles.video.*` - Video trimming
- `articles.rotate.*` - Image rotation
- `articles.purposes.*` - Content purposes
- `articles.list.*` - List page
- `articles.edit.*` - Edit page
- `articles.grid.*`, `articles.card.*`, `articles.table.*` - View components
- `articles.content.*` - Content editing
- `articles.instructionEditor.*` - Instruction editor
- `articles.validation.*` - Validation messages

**Special Considerations:**
- French uses gender for articles/nouns
- Formal "vous" throughout (not "tu")
- French quotation marks: « guillemets »
- Accents must be preserved: é, è, ê, à, ù, ç

**Acceptance Criteria:**
- [ ] All `articles.*` keys have French translations
- [ ] ICU plural forms use correct French plural rules
- [ ] All variable placeholders preserved exactly
- [ ] Translations fit UI context (button labels not too long)
- [ ] Consistent terminology throughout
- [ ] JSON validates without errors

---

### Task 3: Generate Spanish (es) translations (Priority: High)

**Description:** Complete all Spanish translations for the `articles` namespace.

**File to Modify:** `/messages/es.json`

**Special Considerations:**
- Spanish uses gender for articles/nouns
- Formal "usted" can be used, or informal "tú" for user-facing UI
- Spanish quotation marks: comillas españolas « » or standard " "
- Accents: á, é, í, ó, ú, ñ

**Acceptance Criteria:**
- [ ] All `articles.*` keys have Spanish translations
- [ ] ICU plural forms use correct Spanish plural rules
- [ ] All variable placeholders preserved exactly
- [ ] Translations fit UI context
- [ ] Consistent terminology throughout
- [ ] JSON validates without errors

---

### Task 4: Generate German (de) translations (Priority: High)

**Description:** Complete all German translations for the `articles` namespace.

**File to Modify:** `/messages/de.json`

**Special Considerations:**
- German compound nouns (e.g., "Bildbearbeitung" for "Image Editing")
- Formal "Sie" throughout (not "du")
- German capitalization rules (all nouns capitalized)
- Umlauts: ä, ö, ü, ß
- German word order can differ significantly

**Acceptance Criteria:**
- [ ] All `articles.*` keys have German translations
- [ ] ICU plural forms use correct German plural rules
- [ ] All variable placeholders preserved exactly
- [ ] Consistent use of formal address
- [ ] Compound nouns formed correctly
- [ ] JSON validates without errors

---

### Task 5: Generate Dutch (nl) translations (Priority: High)

**Description:** Complete all Dutch translations for the `articles` namespace.

**File to Modify:** `/messages/nl.json`

**Special Considerations:**
- Dutch formal "u" vs informal "je" (use formal for general UI)
- Dutch compound words similar to German
- Dutch uses similar alphabet to English with occasional diacritics

**Acceptance Criteria:**
- [ ] All `articles.*` keys have Dutch translations
- [ ] ICU plural forms use correct Dutch plural rules
- [ ] All variable placeholders preserved exactly
- [ ] Translations fit UI context
- [ ] Consistent terminology throughout
- [ ] JSON validates without errors

---

### Task 6: Generate Italian (it) translations (Priority: High)

**Description:** Complete all Italian translations for the `articles` namespace.

**File to Modify:** `/messages/it.json`

**Special Considerations:**
- Italian uses gender for articles/nouns
- Formal "Lei" vs informal "tu" (use formal for general UI)
- Accents: à, è, é, ì, ò, ù
- Italian word order generally similar to English

**Acceptance Criteria:**
- [ ] All `articles.*` keys have Italian translations
- [ ] ICU plural forms use correct Italian plural rules
- [ ] All variable placeholders preserved exactly
- [ ] Translations fit UI context
- [ ] Consistent terminology throughout
- [ ] JSON validates without errors

---

### Task 7: Validate JSON structure and ICU syntax (Priority: High)

**Description:** Validate that all translation files have valid JSON and correct ICU message syntax.

**Validation Checks:**
1. JSON syntax validation (no trailing commas, proper escaping)
2. ICU message format validation for all plural/interpolation strings
3. Variable placeholder consistency (all placeholders in en.json present in translations)
4. Key structure parity across all 6 files
5. No duplicate keys within each file

**Tools/Methods:**
- JSON linter (e.g., `jq`, VSCode JSON validator)
- ICU message format validator
- Custom script to compare key structures

**Acceptance Criteria:**
- [ ] All 6 files pass JSON validation
- [ ] All ICU messages are syntactically correct
- [ ] All variable placeholders match between English and translations
- [ ] Key counts match across all files for `articles` namespace
- [ ] No duplicate keys detected

---

### Task 8: Test translations in application (Priority: High)

**Description:** Verify translations display correctly in the application UI.

**Test Scenarios:**

1. **Switch language to French:**
   - Navigate to /dashboard2/instructions
   - Verify list page title, buttons, filters translated
   - Navigate to /dashboard2/instructions/[id]/edit
   - Verify edit page labels, buttons translated
   - Test MarkdownEditor toolbar labels
   - Test ImageCropper aspect ratio labels
   - Test VideoTrimmer marker labels

2. **Repeat for Spanish, German, Dutch, Italian**

3. **Specific Checks:**
   - ICU plurals display correctly (test with 0, 1, 2+ counts)
   - Variable interpolation works (durations, counts, names)
   - No missing translation warnings in console
   - Buttons fit within UI bounds
   - No text overflow issues

**Acceptance Criteria:**
- [ ] All 5 languages display correctly
- [ ] No console warnings for missing keys
- [ ] ICU plurals display correctly with different counts
- [ ] Variable interpolation works correctly
- [ ] No UI layout issues (text overflow, button too wide)
- [ ] All interactive elements accessible and functional

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Translation Files (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/fr.json` | `articles` namespace | Modify | French translations |
| `/messages/es.json` | `articles` namespace | Modify | Spanish translations |
| `/messages/de.json` | `articles` namespace | Modify | German translations |
| `/messages/nl.json` | `articles` namespace | Modify | Dutch translations |
| `/messages/it.json` | `articles` namespace | Modify | Italian translations |

### 7.2 Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source strings - DO NOT MODIFY |
| `src/lib/i18n/config.ts` | Locale configuration reference |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl framework, locale config | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles` namespace structure created | Complete |
| **REQ-E02-071** (Task 2E.2) | Editor components use translations | Complete |
| **REQ-E02-072** (Task 2E.3) | Media handling components use translations | Complete |
| **REQ-E02-073** (Task 2E.4) | Crop/trim utilities use translations | Complete |
| **REQ-E02-074** (Task 2E.5) | Instructions pages use translations | Complete |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| Sub-Epic 2E completion | Article & Content Management fully localized |
| Sub-Epic 2F, 2G, etc. | Pattern/methodology for other sub-epic translations |

### 8.3 Parallel Safety

- **Files touched**: All 5 non-English translation files
- **Conflicts with**: Any other translation generation tasks for the same files
- **Safe to parallelize with**: None - this is the final task for Sub-Epic 2E

### 8.4 External Dependencies

- Professional translation tools (Google Translate, DeepL, or native speakers)
- ICU message format documentation
- CLDR plural rules reference

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Incorrect plural forms in target language | Medium | High | Use CLDR plural rules, validate with native speakers |
| Variable placeholders modified or removed | Low | High | Automated validation of placeholder consistency |
| Translations too long for UI | Medium | Medium | Test in application, use shorter alternatives |
| Cultural inappropriateness | Low | Medium | Review by native speakers if possible |
| ICU syntax errors | Low | High | Use ICU validator, test thoroughly |
| Inconsistent terminology | Medium | Low | Use terminology glossary, search-replace for consistency |

### 9.2 Testing Requirements

- JSON validation for all files
- ICU format validation for all plural/interpolation strings
- Manual testing in browser for all 5 languages
- Test with different counts to verify plural forms
- Test with long text strings to check UI layout
- Verify no console errors for missing translations

### 9.3 Open Questions

- [ ] Do we have access to professional translators or should we use translation tools?
- [ ] Should we prioritize certain languages (e.g., French, Spanish) for quality review?
- [ ] Are there specific terminology preferences for any language?
- [ ] Should we create a translation style guide for future Sub-Epics?

---

## 10. Out of Scope

- Creating new translation keys (handled by Task 2E.1)
- Modifying English source strings
- Translating other namespaces (auth, dashboard, items, etc. - covered by other sub-epics)
- Backend/API message translations
- Email template translations (covered by Sub-Epic 2I)
- Dynamic content translations (covered by Epic 3)
- Component code modifications

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Verify all Tasks 2E.1-2E.5 are complete
- [ ] Verify `articles` namespace exists in all 6 files
- [ ] Audit current translation status

### Implementation (Per Language)
- [ ] French translations complete and validated
- [ ] Spanish translations complete and validated
- [ ] German translations complete and validated
- [ ] Dutch translations complete and validated
- [ ] Italian translations complete and validated

### Validation
- [ ] All 6 files have identical key structure
- [ ] All 6 files pass JSON validation
- [ ] All ICU messages syntactically correct
- [ ] All variable placeholders consistent
- [ ] Key counts match for `articles` namespace

### Testing
- [ ] All 5 languages tested in application
- [ ] No console warnings
- [ ] Plurals work correctly
- [ ] Variable interpolation works
- [ ] No UI layout issues
- [ ] All functionality works in all languages

---

## 12. Translation Quality Guidelines

### 12.1 General Principles

1. **Accuracy over literalness** - Convey meaning, not word-for-word translation
2. **Natural language** - Translations should sound natural to native speakers
3. **Consistent terminology** - Use the same translation for the same concept
4. **UI context** - Consider where text appears (button, label, error message)
5. **Cultural appropriateness** - Avoid culturally insensitive terms

### 12.2 Technical Constraints

1. **ICU syntax preservation** - Never modify `{variable}` or plural syntax
2. **Character limits** - Keep translations similar length to English where possible
3. **Capitalization** - Follow target language capitalization rules
4. **Punctuation** - Use appropriate punctuation for target language

### 12.3 Recommended Tools

- **Professional:** DeepL, SDL Trados, Phrase
- **Open-source:** LibreTranslate, Apertium
- **Validation:** ICU message format validator
- **Reference:** CLDR plural rules documentation

---

## 13. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Namespace Task:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **next-intl ICU Format:** https://next-intl-docs.vercel.app/docs/usage/messages#icu-syntax
- **CLDR Plural Rules:** https://cldr.unicode.org/index/cldr-spec/plural-rules
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated: 2026-01-22 18:31*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
