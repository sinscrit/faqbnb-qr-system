# REQ-E02-012: Generate Translations for 5 Non-English Languages (Property Management) - Detailed Specification

**Generated:** 2026-01-22 20:30:00
**Last Modified:** 2026-01-22 20:30:00
**Request ID:** REQ-E02-012
**Epic:** Epic 2 - Localization (L10N)
**Sub-Epic:** 2F - Property Management
**Task:** 2F.6
**Type:** TRANSLATION
**Size:** M
**Estimated Effort:** 10 story points

---

## Reference Documents

- **Source Request**: `/docs/gen_requests_epic2.md#REQ-E02-012`
- **Overview Document**: `/docs/REQ-E02-012-generate-translations-for-5-non-english-languages-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Properties Namespace Spec**: `/docs/REQ-E02-085-create-properties-namespace-structure-detailed.md`
- **English Reference**: `/messages/en.json` (properties namespace, lines 3219-3373)

---

## CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT

**Operate from the project root folder ONLY**
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

1. **DO NOT mark any task as completed in this document**
   - All checkboxes MUST remain `- [ ]` (unchecked)
   - The QA validation agent will verify completion
   - Marking tasks complete will cause pipeline tracking errors

2. **Subtask ID Format**
   - Use `**X.Y**` format (e.g., `**1.1**`, `**2.3**`)
   - This format enables automated progress tracking
   - Do not use alternative formats like `X.Y.` or `Task X.Y`

3. **Translation Quality Standards**
   - Preserve ICU MessageFormat syntax exactly (plural forms, variable placeholders)
   - Use formal address forms (vous, usted, Sie, u, Lei)
   - Apply CLDR plural rules correctly for each language
   - Validate JSON syntax after each file modification
   - Use UTF-8 encoding for all special characters

4. **Critical Translation Rules**
   - **NEVER modify variable placeholders**: `{name}`, `{count}`, `{max}` must remain unchanged
   - **NEVER change ICU syntax**: Keep `{count, plural, one {...} other {...}}` structure
   - **NEVER translate technical keys**: Only translate the values, not the JSON keys
   - **NEVER break JSON structure**: Maintain proper comma placement, quote escaping, nesting

5. **Validation Workflow**
   - Validate JSON syntax after EACH translation file: `node -e "JSON.parse(require('fs').readFileSync('messages/[lang].json', 'utf8'))"`
   - Run typecheck after all translations: `npm run typecheck`
   - Visually test in browser for each language before marking task done

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| JSON Validation | `node -e "JSON.parse(require('fs').readFileSync('messages/[lang].json', 'utf8'))"` |

**Note**: Replace `[lang]` with `fr`, `es`, `de`, `nl`, or `it` for validation.

---

## Overview

This task generates translations for the `properties` namespace across 5 non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This is the **final task** in Sub-Epic 2F (Property Management) and requires all previous component update tasks (2F.1-2F.5) to be completed.

### Scope

**Files to Translate**: 5 translation files
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Translation Target**: Lines 3193-3347 in each file (~154 lines)
**Total Keys**: ~134 translation keys in `properties` namespace
**Sub-namespaces**: 11 sub-namespaces within `properties`

### Current State

All non-English translation files contain the `properties` namespace structure with **English placeholder text**. The implementing agent's task is to replace these English placeholders with proper translations for each language.

**Example of current state** (fr.json, lines 3193-3195):
```json
"properties": {
  "title": "My Properties",  // <- Currently in English
  "subtitle": "Manage your properties and their settings",  // <- Needs French translation
```

**Target state** (fr.json after translation):
```json
"properties": {
  "title": "Mes Propriétés",  // <- Translated to French
  "subtitle": "Gérez vos propriétés et leurs paramètres",  // <- Translated
```

---

## Task Breakdown

### Task 1: Create Translation Glossary Document (1 story point)

**Context**: Before translating, create a glossary document with terminology guidelines and key translations for consistency across all languages. This will serve as a reference for the translation work in Tasks 2-6.

**Files to Create**:
- `/docs/property-management-translation-glossary.md`

**Estimated Effort**: 1 story point (comprehensive glossary creation)

**Subtasks**:
- [ ] **1.1** Create the glossary document at `/docs/property-management-translation-glossary.md`
- [ ] **1.2** Add document header with creation date: "2026-01-22 20:30:00"
- [ ] **1.3** Create "Core Terminology" section with key terms (Property, Item, Owner, Address) translated to all 5 languages
- [ ] **1.4** Create "Property Types" section with real estate terminology for each language (Apartment, House, Condo, Townhouse, Cabin, Villa, Other)
- [ ] **1.5** Create "Action Verbs" section with consistent translations (Add, Edit, Save, Delete, View, Create, Cancel)
- [ ] **1.6** Create "Technical Terms" section (Filter, Select, Loading, Optional, Required, Validation, etc.)
- [ ] **1.7** Create "Tone Guidelines" section specifying formal address forms for each language (vous, usted, Sie, u, Lei)
- [ ] **1.8** Create "ICU MessageFormat Examples" section showing pluralization rules and variable interpolation patterns
- [ ] **1.9** Add CLDR plural rules reference for each language (one/other for most, but document specific rules)
- [ ] **1.10** Document special character requirements per language (accents, umlauts, ñ, ß, etc.)

**Acceptance Criteria**:
- Glossary document exists with all sections
- All 5 target languages represented
- Terminology consistent with real estate industry standards
- ICU format examples clear and correct
- Document serves as complete translation reference

**Translation Guidelines for Glossary**:

**French (fr)**:
- Property → Propriété, House → Maison, Apartment → Appartement, Condo → Copropriété
- Townhouse → Maison de ville, Cabin → Chalet, Villa → Villa, Other → Autre
- Add → Ajouter, Edit → Modifier, Save → Enregistrer, Delete → Supprimer, Cancel → Annuler
- Required → Requis, Optional → Optionnel, Loading → Chargement

**Spanish (es)**:
- Property → Propiedad, House → Casa, Apartment → Apartamento, Condo → Condominio
- Townhouse → Casa adosada, Cabin → Cabaña, Villa → Villa, Other → Otro
- Add → Añadir, Edit → Editar, Save → Guardar, Delete → Eliminar, Cancel → Cancelar
- Required → Obligatorio, Optional → Opcional, Loading → Cargando

**German (de)**:
- Property → Immobilie, House → Haus, Apartment → Wohnung, Condo → Eigentumswohnung
- Townhouse → Reihenhaus, Cabin → Hütte, Villa → Villa, Other → Andere
- Add → Hinzufügen, Edit → Bearbeiten, Save → Speichern, Delete → Löschen, Cancel → Abbrechen
- Required → Erforderlich, Optional → Optional, Loading → Laden
- **Important**: Capitalize all nouns (German grammar rule)

**Dutch (nl)**:
- Property → Eigendom, House → Huis, Apartment → Appartement, Condo → Condominium
- Townhouse → Rijtjeshuis, Cabin → Huisje, Villa → Villa, Other → Andere
- Add → Toevoegen, Edit → Bewerken, Save → Opslaan, Delete → Verwijderen, Cancel → Annuleren
- Required → Verplicht, Optional → Optioneel, Loading → Laden

**Italian (it)**:
- Property → Proprietà, House → Casa, Apartment → Appartamento, Condo → Condominio
- Townhouse → Casa a schiera, Cabin → Cabina, Villa → Villa, Other → Altro
- Add → Aggiungi, Edit → Modifica, Save → Salva, Delete → Elimina, Cancel → Annulla
- Required → Obbligatorio, Optional → Facoltativo, Loading → Caricamento

---

### Task 2: Translate French (fr.json) Properties Namespace (2 story points)

**Context**: Translate all ~134 keys in the `properties` namespace from English to French. French uses formal "vous" form and has 2 plural forms (0-1 singular, 2+ plural).

**Files to Modify**:
- `/messages/fr.json` (lines 3193-3347)

**Estimated Effort**: 2 story points (comprehensive translation + validation)

**Subtasks**:
- [ ] **2.1** Read `/messages/en.json` lines 3219-3373 to get source English text
- [ ] **2.2** Read `/messages/fr.json` lines 3193-3347 to locate translation section
- [ ] **2.3** Translate page-level strings (title, subtitle) - 2 keys
- [ ] **2.4** Translate list & empty state strings (loginRequired, empty.title, empty.description, empty.action) - 4 keys
- [ ] **2.5** Translate property types (apartment, house, condo, townhouse, cabin, villa, other) - 7 keys
- [ ] **2.6** Translate selector/filter strings (selectProperty, allProperties, unassigned, filterLabel, filterDescription, filterAriaLabel, loading, noPropertiesAvailable) - 8 keys
- [ ] **2.7** Translate action buttons (add, edit, save, saving, cancel, delete, view, createProperty, creating, editProperty) - 10 keys
- [ ] **2.8** Translate form field labels and placeholders (~35 keys in form.*)
- [ ] **2.9** Translate validation messages (~15 keys in validation.*)
- [ ] **2.10** Translate notifications (propertyUpdated, propertyCreated, propertyDeleted, updateFailed, createFailed, deleteFailed) - 6 keys
- [ ] **2.11** Translate delete confirmation strings (title, message with `{name}` variable, confirm, cancel) - 4 keys
- [ ] **2.12** Translate modal strings (~30 keys in modal.*)
- [ ] **2.13** Translate error messages (saveFailed, createFailed, updateFailed, loadFailed, deleteFailed) - 5 keys
- [ ] **2.14** Verify all ICU MessageFormat syntax preserved (especially in form.characterCount: "{count}/{max} characters" → "{count}/{max} caractères")
- [ ] **2.15** Verify all variable placeholders unchanged ({name}, {count}, {max})
- [ ] **2.16** Use proper French accent marks (é, è, à, ê, ç) throughout
- [ ] **2.17** Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))"`
- [ ] **2.18** Verify file maintains UTF-8 encoding with proper special characters

**Acceptance Criteria**:
- All ~134 keys translated to French
- Formal "vous" form used consistently
- All accent marks correct (é, è, à, ê, ç)
- ICU MessageFormat syntax preserved
- Variable placeholders unchanged
- JSON validates successfully
- UTF-8 encoding maintained

**Key Example Translations**:
```json
"title": "Mes Propriétés",
"subtitle": "Gérez vos propriétés et leurs paramètres",
"list": {
  "loginRequired": "Veuillez vous connecter pour voir les propriétés.",
  "empty": {
    "title": "Aucune propriété pour l'instant",
    "description": "Ajoutez votre première propriété pour organiser vos articles",
    "action": "Ajouter une Propriété"
  }
},
"types": {
  "apartment": "Appartement",
  "house": "Maison",
  "condo": "Copropriété",
  "townhouse": "Maison de ville",
  "cabin": "Chalet",
  "villa": "Villa",
  "other": "Autre"
},
"form": {
  "characterCount": "{count}/{max} caractères"
}
```

---

### Task 3: Translate Spanish (es.json) Properties Namespace (2 story points)

**Context**: Translate all ~134 keys in the `properties` namespace from English to Spanish. Spanish uses formal "usted" form and has 2 plural forms (1 singular, 0 or 2+ plural).

**Files to Modify**:
- `/messages/es.json` (lines 3193-3347)

**Estimated Effort**: 2 story points (comprehensive translation + validation)

**Subtasks**:
- [ ] **3.1** Read `/messages/en.json` lines 3219-3373 to get source English text
- [ ] **3.2** Read `/messages/es.json` lines 3193-3347 to locate translation section
- [ ] **3.3** Translate page-level strings (title, subtitle) - 2 keys
- [ ] **3.4** Translate list & empty state strings (loginRequired, empty.title, empty.description, empty.action) - 4 keys
- [ ] **3.5** Translate property types (apartment, house, condo, townhouse, cabin, villa, other) - 7 keys
- [ ] **3.6** Translate selector/filter strings - 8 keys
- [ ] **3.7** Translate action buttons - 10 keys
- [ ] **3.8** Translate form field labels and placeholders (~35 keys)
- [ ] **3.9** Translate validation messages (~15 keys)
- [ ] **3.10** Translate notifications - 6 keys
- [ ] **3.11** Translate delete confirmation strings - 4 keys
- [ ] **3.12** Translate modal strings (~30 keys)
- [ ] **3.13** Translate error messages - 5 keys
- [ ] **3.14** Verify all ICU MessageFormat syntax preserved
- [ ] **3.15** Verify all variable placeholders unchanged
- [ ] **3.16** Use proper Spanish special characters (ñ, á, é, í, ó, ú, ü) throughout
- [ ] **3.17** Add opening question/exclamation marks (¡, ¿) where grammatically appropriate
- [ ] **3.18** Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('messages/es.json', 'utf8'))"`
- [ ] **3.19** Verify file maintains UTF-8 encoding

**Acceptance Criteria**:
- All ~134 keys translated to Spanish
- Formal "usted" form used consistently
- All special characters correct (ñ, á, é, í, ó, ú, ü, ¡, ¿)
- ICU MessageFormat syntax preserved
- Variable placeholders unchanged
- JSON validates successfully
- UTF-8 encoding maintained

**Key Example Translations**:
```json
"title": "Mis Propiedades",
"subtitle": "Gestione sus propiedades y su configuración",
"types": {
  "apartment": "Apartamento",
  "house": "Casa",
  "condo": "Condominio",
  "townhouse": "Casa adosada",
  "cabin": "Cabaña",
  "villa": "Villa",
  "other": "Otro"
},
"form": {
  "characterCount": "{count}/{max} caracteres"
},
"validation": {
  "nameRequired": "El nombre de la propiedad es obligatorio"
}
```

---

### Task 4: Translate German (de.json) Properties Namespace (2 story points)

**Context**: Translate all ~134 keys in the `properties` namespace from English to German. German uses formal "Sie" form (capitalized), has 2 plural forms, and **requires all nouns to be capitalized** (German grammar rule).

**Files to Modify**:
- `/messages/de.json` (lines 3193-3347)

**Estimated Effort**: 2 story points (comprehensive translation + validation + noun capitalization)

**Subtasks**:
- [ ] **4.1** Read `/messages/en.json` lines 3219-3373 to get source English text
- [ ] **4.2** Read `/messages/de.json` lines 3193-3347 to locate translation section
- [ ] **4.3** Translate page-level strings (title, subtitle) - 2 keys
- [ ] **4.4** Translate list & empty state strings - 4 keys
- [ ] **4.5** Translate property types (apartment, house, condo, townhouse, cabin, villa, other) - 7 keys
- [ ] **4.6** Translate selector/filter strings - 8 keys
- [ ] **4.7** Translate action buttons - 10 keys
- [ ] **4.8** Translate form field labels and placeholders (~35 keys)
- [ ] **4.9** Translate validation messages (~15 keys)
- [ ] **4.10** Translate notifications - 6 keys
- [ ] **4.11** Translate delete confirmation strings - 4 keys
- [ ] **4.12** Translate modal strings (~30 keys)
- [ ] **4.13** Translate error messages - 5 keys
- [ ] **4.14** **CRITICAL**: Verify all nouns are capitalized per German grammar (Immobilie, Haus, Wohnung, Name, Adresse, Stadt, Land, etc.)
- [ ] **4.15** Verify formal "Sie" is capitalized throughout (also "Ihre", "Ihnen")
- [ ] **4.16** Verify all ICU MessageFormat syntax preserved
- [ ] **4.17** Verify all variable placeholders unchanged
- [ ] **4.18** Use proper German special characters (ä, ö, ü, ß) throughout
- [ ] **4.19** Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('messages/de.json', 'utf8'))"`
- [ ] **4.20** Verify file maintains UTF-8 encoding

**Acceptance Criteria**:
- All ~134 keys translated to German
- Formal "Sie" form used and capitalized (Sie, Ihre, Ihnen)
- **All nouns capitalized** per German grammar
- All special characters correct (ä, ö, ü, ß)
- ICU MessageFormat syntax preserved
- Variable placeholders unchanged
- JSON validates successfully
- UTF-8 encoding maintained

**Key Example Translations**:
```json
"title": "Meine Immobilien",
"subtitle": "Verwalten Sie Ihre Immobilien und deren Einstellungen",
"types": {
  "apartment": "Wohnung",
  "house": "Haus",
  "condo": "Eigentumswohnung",
  "townhouse": "Reihenhaus",
  "cabin": "Hütte",
  "villa": "Villa",
  "other": "Andere"
},
"form": {
  "propertyName": "Immobilienname",
  "characterCount": "{count}/{max} Zeichen"
},
"validation": {
  "nameRequired": "Der Immobilienname ist erforderlich"
}
```

---

### Task 5: Translate Dutch (nl.json) Properties Namespace (2 story points)

**Context**: Translate all ~134 keys in the `properties` namespace from English to Dutch. Dutch uses formal "u" form, has 2 plural forms, and often creates compound words.

**Files to Modify**:
- `/messages/nl.json` (lines 3193-3347)

**Estimated Effort**: 2 story points (comprehensive translation + validation)

**Subtasks**:
- [ ] **5.1** Read `/messages/en.json` lines 3219-3373 to get source English text
- [ ] **5.2** Read `/messages/nl.json` lines 3193-3347 to locate translation section
- [ ] **5.3** Translate page-level strings (title, subtitle) - 2 keys
- [ ] **5.4** Translate list & empty state strings - 4 keys
- [ ] **5.5** Translate property types (apartment, house, condo, townhouse, cabin, villa, other) - 7 keys
- [ ] **5.6** Translate selector/filter strings - 8 keys
- [ ] **5.7** Translate action buttons - 10 keys
- [ ] **5.8** Translate form field labels and placeholders (~35 keys)
- [ ] **5.9** Translate validation messages (~15 keys)
- [ ] **5.10** Translate notifications - 6 keys
- [ ] **5.11** Translate delete confirmation strings - 4 keys
- [ ] **5.12** Translate modal strings (~30 keys)
- [ ] **5.13** Translate error messages - 5 keys
- [ ] **5.14** Verify all ICU MessageFormat syntax preserved
- [ ] **5.15** Verify all variable placeholders unchanged
- [ ] **5.16** Use proper Dutch special characters (é, ë, ï, ö, ü) throughout
- [ ] **5.17** Consider Dutch compound word conventions where appropriate
- [ ] **5.18** Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('messages/nl.json', 'utf8'))"`
- [ ] **5.19** Verify file maintains UTF-8 encoding

**Acceptance Criteria**:
- All ~134 keys translated to Dutch
- Formal "u" form used consistently
- All special characters correct (é, ë, ï, ö, ü)
- ICU MessageFormat syntax preserved
- Variable placeholders unchanged
- JSON validates successfully
- UTF-8 encoding maintained

**Key Example Translations**:
```json
"title": "Mijn Eigendommen",
"subtitle": "Beheer uw eigendommen en hun instellingen",
"types": {
  "apartment": "Appartement",
  "house": "Huis",
  "condo": "Condominium",
  "townhouse": "Rijtjeshuis",
  "cabin": "Huisje",
  "villa": "Villa",
  "other": "Andere"
},
"form": {
  "characterCount": "{count}/{max} tekens"
},
"validation": {
  "nameRequired": "Naam van eigendom is verplicht"
}
```

---

### Task 6: Translate Italian (it.json) Properties Namespace (2 story points)

**Context**: Translate all ~134 keys in the `properties` namespace from English to Italian. Italian uses formal "Lei" form, has 2 plural forms, and requires attention to grammatical gender.

**Files to Modify**:
- `/messages/it.json` (lines 3193-3347)

**Estimated Effort**: 2 story points (comprehensive translation + validation)

**Subtasks**:
- [ ] **6.1** Read `/messages/en.json` lines 3219-3373 to get source English text
- [ ] **6.2** Read `/messages/it.json` lines 3193-3347 to locate translation section
- [ ] **6.3** Translate page-level strings (title, subtitle) - 2 keys
- [ ] **6.4** Translate list & empty state strings - 4 keys
- [ ] **6.5** Translate property types (apartment, house, condo, townhouse, cabin, villa, other) - 7 keys
- [ ] **6.6** Translate selector/filter strings - 8 keys
- [ ] **6.7** Translate action buttons - 10 keys
- [ ] **6.8** Translate form field labels and placeholders (~35 keys)
- [ ] **6.9** Translate validation messages (~15 keys)
- [ ] **6.10** Translate notifications - 6 keys
- [ ] **6.11** Translate delete confirmation strings - 4 keys
- [ ] **6.12** Translate modal strings (~30 keys)
- [ ] **6.13** Translate error messages - 5 keys
- [ ] **6.14** Verify all ICU MessageFormat syntax preserved
- [ ] **6.15** Verify all variable placeholders unchanged
- [ ] **6.16** Use proper Italian special characters (à, è, é, ì, ò, ù) throughout
- [ ] **6.17** Verify grammatical gender agreement (la proprietà, il nome, le proprietà)
- [ ] **6.18** Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('messages/it.json', 'utf8'))"`
- [ ] **6.19** Verify file maintains UTF-8 encoding

**Acceptance Criteria**:
- All ~134 keys translated to Italian
- Formal "Lei" form used consistently
- All special characters correct (à, è, é, ì, ò, ù)
- Grammatical gender correct
- ICU MessageFormat syntax preserved
- Variable placeholders unchanged
- JSON validates successfully
- UTF-8 encoding maintained

**Key Example Translations**:
```json
"title": "Le Mie Proprietà",
"subtitle": "Gestisci le tue proprietà e le loro impostazioni",
"types": {
  "apartment": "Appartamento",
  "house": "Casa",
  "condo": "Condominio",
  "townhouse": "Casa a schiera",
  "cabin": "Cabina",
  "villa": "Villa",
  "other": "Altro"
},
"form": {
  "characterCount": "{count}/{max} caratteri"
},
"validation": {
  "nameRequired": "Il nome della proprietà è obbligatorio"
}
```

---

### Task 7: Validate All Translation Files (1 story point)

**Context**: After all translations are complete, run comprehensive validation checks to ensure JSON syntax, key structure consistency, ICU format correctness, and UTF-8 encoding.

**Files to Validate**:
- `/messages/en.json` (reference)
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated Effort**: 1 story point (systematic validation + fixes)

**Subtasks**:
- [ ] **7.1** Validate JSON syntax for all 6 files using Node.js: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"` and repeat for fr, es, de, nl, it
- [ ] **7.2** Create a validation script (optional but recommended) to check all files: `for lang in en fr es de nl it; do node -e "JSON.parse(require('fs').readFileSync('messages/$lang.json', 'utf8'))" && echo "$lang.json: OK"; done`
- [ ] **7.3** Verify all 6 files have identical key structure in `properties` namespace (same keys present in all files)
- [ ] **7.4** Verify all ICU MessageFormat variables preserved ({name}, {count}, {max}) in all translations
- [ ] **7.5** Verify all plural forms follow CLDR rules for each language
- [ ] **7.6** Verify UTF-8 encoding for all files (special characters render correctly)
- [ ] **7.7** Run TypeScript type check: `npm run typecheck`
- [ ] **7.8** Run linter: `npm run lint`
- [ ] **7.9** If any validation errors found, document them clearly and fix before proceeding

**Acceptance Criteria**:
- All 6 JSON files pass syntax validation
- All files have identical key structure
- All ICU variables preserved correctly
- All plural forms match CLDR rules
- UTF-8 encoding verified
- TypeScript typecheck passes
- Linter passes
- No validation errors remaining

---

### Task 8: Browser Testing in All Languages (1 story point)

**Context**: Test all translated strings in the application browser to verify correct display, ICU pluralization, variable interpolation, and layout integrity across all 5 languages.

**Pages/Components to Test**:
- Properties page (`/dashboard2/properties`)
- Add Property modal
- Edit Property modal
- Property Selector component
- Delete confirmation dialog

**Estimated Effort**: 1 story point (systematic browser testing across 5 languages)

**Subtasks**:
- [ ] **8.1** Start development server: `npm run dev`
- [ ] **8.2** Test French (fr): Navigate to language switcher and select French
- [ ] **8.3** Test French: Navigate to `/dashboard2/properties` and verify page title "Mes Propriétés" and subtitle display
- [ ] **8.4** Test French: Click "Ajouter une Propriété" button and verify modal opens with French labels
- [ ] **8.5** Test French: Submit empty form and verify validation messages display in French
- [ ] **8.6** Test French: Type in property name field and verify character counter displays "{count}/{max} caractères"
- [ ] **8.7** Test French: Select property type dropdown and verify types display in French (Appartement, Maison, etc.)
- [ ] **8.8** Test French: Verify PropertySelector displays "Toutes les Propriétés" or equivalent
- [ ] **8.9** Test Spanish (es): Switch language to Spanish and repeat steps 8.3-8.8 with Spanish translations
- [ ] **8.10** Test German (de): Switch language to German and repeat steps 8.3-8.8 with German translations, verify all nouns capitalized
- [ ] **8.11** Test Dutch (nl): Switch language to Dutch and repeat steps 8.3-8.8 with Dutch translations
- [ ] **8.12** Test Italian (it): Switch language to Italian and repeat steps 8.3-8.8 with Italian translations
- [ ] **8.13** For each language, test delete confirmation dialog and verify `{name}` variable interpolates correctly
- [ ] **8.14** For each language, verify no text overflow or truncation issues in buttons, labels, or descriptions
- [ ] **8.15** For each language, verify loading states display translated "Loading..." text
- [ ] **8.16** For each language, verify empty states display translated messages
- [ ] **8.17** Document any layout issues, text overflow, or translation errors found
- [ ] **8.18** Fix any issues found and re-test

**Acceptance Criteria**:
- All property management strings display in correct language
- No English fallback text visible in any language
- ICU pluralization works correctly (test with 0, 1, 2+ properties)
- Variable interpolation works correctly (property names, counts)
- Character counters update correctly with proper format
- No text overflow or truncation issues
- All 5 languages tested thoroughly
- All issues documented and fixed

---

### Task 9: Create Translation Completion Report (1 story point)

**Context**: Document the translation completion status, coverage, quality assurance results, and maintenance guidelines for future reference.

**Files to Create**:
- `/docs/property-management-translation-completion.md`

**Estimated Effort**: 1 story point (comprehensive completion report)

**Subtasks**:
- [ ] **9.1** Create the completion report at `/docs/property-management-translation-completion.md`
- [ ] **9.2** Add document header with creation date: "2026-01-22 [actual completion time]"
- [ ] **9.3** Create "Translation Summary" section documenting total keys translated (~134), languages completed (5), and translation method used
- [ ] **9.4** Create "Coverage Report" section listing all translated namespaces (properties.title, properties.types, properties.form, etc.) with percentage completion (should be 100%)
- [ ] **9.5** Document any untranslated or partially translated keys (should be none, but list if any edge cases)
- [ ] **9.6** Create "Quality Assurance" section documenting native speaker review status (if applicable), testing completion status, and any known issues
- [ ] **9.7** List any outstanding issues or areas for improvement (e.g., country name translations deferred, dialect variations not covered)
- [ ] **9.8** Create "Maintenance Guidelines" section with instructions for adding new property management strings in the future
- [ ] **9.9** Document translation request process for future updates (who to contact, how to submit requests, expected turnaround time)
- [ ] **9.10** Define quality standards for future translations (formal tone, ICU format compliance, native speaker review required, etc.)
- [ ] **9.11** Add reference links to glossary document and overview document
- [ ] **9.12** Document Sub-Epic 2F completion status (Task 2F.6 complete, all 6 tasks in 2F done)

**Acceptance Criteria**:
- Completion report exists and is comprehensive
- Coverage report shows 100% completion for properties namespace
- QA status documented clearly
- Maintenance guidelines clear and actionable
- All reference documents linked
- Sub-Epic 2F marked as complete

**Completion Report Template Structure**:
```markdown
# Property Management Translation Completion Report

**Created:** 2026-01-22 [actual time]
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Status:** COMPLETED

## Translation Summary

- **Total Keys Translated:** ~134
- **Languages Completed:** French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)
- **Translation Method:** [Specify: Professional service / Native speakers / AI-assisted + review]
- **Lines Modified per File:** ~154 lines (lines 3193-3347)

## Coverage Report

### Translated Namespaces (100% Complete)

1. Page-level strings (2 keys)
2. List & empty states (4 keys)
3. Property types (7 keys)
4. Selector/filter strings (8 keys)
5. Action buttons (10 keys)
6. Form fields (~35 keys)
7. Validation messages (~15 keys)
8. Notifications (6 keys)
9. Delete confirmation (4 keys)
10. Modal strings (~30 keys)
11. Error messages (5 keys)

**Total Coverage:** 100% (134/134 keys)

## Quality Assurance

### Validation Checks
- [x] JSON syntax validated for all files
- [x] Key structure consistency verified
- [x] ICU MessageFormat syntax preserved
- [x] Variable placeholders unchanged
- [x] UTF-8 encoding verified
- [x] TypeScript typecheck passed
- [x] Linter passed

### Browser Testing
- [x] French (fr) tested thoroughly
- [x] Spanish (es) tested thoroughly
- [x] German (de) tested thoroughly
- [x] Dutch (nl) tested thoroughly
- [x] Italian (it) tested thoroughly
- [x] ICU pluralization tested (0, 1, 2+ items)
- [x] Variable interpolation tested
- [x] Character counters tested
- [x] No text overflow issues

### Known Issues
[List any remaining issues, or state "None"]

## Maintenance Guidelines

[Document how to add new strings, request translations, quality standards]

## Sub-Epic 2F Status

✅ **Sub-Epic 2F (Property Management) - COMPLETED**

All 6 tasks complete:
- Task 2F.1: Create properties namespace ✅
- Task 2F.2: Update PropertyForm ✅
- Task 2F.3: Update property modals ✅
- Task 2F.4: Update property pages ✅
- Task 2F.5: Update PropertySelector ✅
- Task 2F.6: Generate translations ✅
```

---

## Authorized Files for Modification

This task authorizes modification of the following files:

### Translation Files (Modify)

1. `/messages/fr.json`
   - **Lines to modify**: 3193-3347 (properties namespace)
   - **Purpose**: Translate ~134 keys from English to French
   - **Restrictions**: Preserve ICU format, maintain JSON structure, use UTF-8 encoding

2. `/messages/es.json`
   - **Lines to modify**: 3193-3347 (properties namespace)
   - **Purpose**: Translate ~134 keys from English to Spanish
   - **Restrictions**: Preserve ICU format, maintain JSON structure, use UTF-8 encoding

3. `/messages/de.json`
   - **Lines to modify**: 3193-3347 (properties namespace)
   - **Purpose**: Translate ~134 keys from English to German
   - **Restrictions**: Preserve ICU format, capitalize all nouns, maintain JSON structure, use UTF-8 encoding

4. `/messages/nl.json`
   - **Lines to modify**: 3193-3347 (properties namespace)
   - **Purpose**: Translate ~134 keys from English to Dutch
   - **Restrictions**: Preserve ICU format, maintain JSON structure, use UTF-8 encoding

5. `/messages/it.json`
   - **Lines to modify**: 3193-3347 (properties namespace)
   - **Purpose**: Translate ~134 keys from English to Italian
   - **Restrictions**: Preserve ICU format, maintain JSON structure, use UTF-8 encoding

### Documentation Files (Create)

6. `/docs/property-management-translation-glossary.md`
   - **Purpose**: Create terminology and translation guidelines
   - **Content**: Core terms, property types, action verbs, ICU format examples, CLDR plural rules

7. `/docs/property-management-translation-completion.md`
   - **Purpose**: Document translation completion and coverage
   - **Content**: Translation summary, coverage report, QA status, maintenance guidelines

### Read-Only Files (Reference Only)

8. `/messages/en.json`
   - **Lines to reference**: 3219-3373 (properties namespace in English)
   - **Purpose**: Source text for all translations
   - **Do not modify**: This is the English reference file

---

## Dependencies

### Prerequisites (Must Complete First)
- ✅ **REQ-E02-085 (Task 2F.1)**: Properties namespace structure created in all files - REQUIRED
- ✅ **REQ-E02-008 (Task 2F.2)**: PropertyForm component updated to use properties namespace - REQUIRED
- ✅ **REQ-E02-009 (Task 2F.3)**: Property modals updated to use properties namespace - REQUIRED
- ✅ **REQ-E02-010 (Task 2F.4)**: Property pages updated to use properties namespace - REQUIRED
- ✅ **REQ-E02-011 (Task 2F.5)**: PropertySelector updated to use properties namespace - REQUIRED

**Critical**: All components MUST use the `properties` namespace before translations are generated. Otherwise, translations will not be displayed and effort will be wasted.

### Blocks (Requires This Task First)
- **Sub-Epic 2F Completion**: This is the final task of Sub-Epic 2F (Property Management)
- **Epic 2 Progress**: Property management portion of full app localization

### Parallel Safety
- ✅ **Can run in parallel** with other sub-epic translation tasks (e.g., 2E.6 for articles namespace)
- ✅ **Each language translation task (2-6) can run in parallel** - they modify different language files independently
- ❌ **Cannot parallelize** Task 1 (glossary) must complete before translation tasks for consistency
- ❌ **Cannot parallelize** Tasks 7-9 (validation, testing, reporting) must wait for translations to complete

---

## Risk Assessment

### Risk 1: ICU MessageFormat Syntax Errors
**Likelihood**: Medium
**Impact**: High (component would crash or display incorrectly)
**Mitigation**:
- Validate all ICU syntax before committing
- Test pluralization with different counts (0, 1, 2, 5, 10)
- Use automated ICU format validation where possible

### Risk 2: Missing or Changed Variable Placeholders
**Likelihood**: Medium
**Impact**: High (variable interpolation fails, display errors)
**Mitigation**:
- Automated check for variable consistency before validation
- Visual inspection of all ICU format strings
- Test all variable interpolation in browser

### Risk 3: Cultural Inappropriateness
**Likelihood**: Low-Medium
**Impact**: Medium (users may find translations awkward or inappropriate)
**Mitigation**:
- Use glossary for terminology consistency
- Apply formal address forms consistently
- Native speaker review highly recommended

### Risk 4: Text Overflow in UI
**Likelihood**: Medium
**Impact**: Medium (layout breaks, truncation, usability issues)
**Mitigation**:
- German translations often longer than English - test carefully
- Visual testing on various screen sizes
- Test with longest property names and addresses

### Risk 5: JSON Syntax Errors
**Likelihood**: Low
**Impact**: High (entire translation file fails to load)
**Mitigation**:
- Validate JSON after each file modification
- Use proper JSON editing tools
- Test application after each translation file update

### Risk 6: UTF-8 Encoding Issues
**Likelihood**: Low
**Impact**: High (special characters display as � or corrupted)
**Mitigation**:
- Ensure all files maintain UTF-8 encoding
- Test special characters in browser
- Use proper text editor that preserves encoding

---

## Testing Strategy

### Linguistic Testing
1. **Native Speaker Review** (Highly Recommended):
   - Review all translations for cultural appropriateness
   - Verify grammar and spelling
   - Check terminology consistency
   - Confirm formal tone appropriate for professional app

2. **Terminology Consistency**:
   - Verify all instances of "property" use same term in each language
   - Check action verbs consistent across all contexts
   - Verify property types use correct real estate terminology

### Functional Testing

**ICU Pluralization Testing**:
```
Test with different counts:
- 0 properties: Should use correct plural form per language
- 1 property: Should use singular form
- 2 properties: Should use plural form
- 5 properties: Should use plural form
- 10 properties: Should use plural form
- 100 properties: Should use plural form
```

**Variable Interpolation Testing**:
```
Test cases:
- Property name in delete message: "Are you sure you want to delete '{name}'?"
- Character counter: "{count}/{max} characters" with varying counts
- Dynamic counts in lists/notifications
```

**Character Counter Testing**:
```
For each language:
- Type 0 characters → "0/100 [characters]"
- Type 50 characters → "50/100 [characters]"
- Type 100 characters → "100/100 [characters]"
Verify format correct and counter updates in real-time
```

### Visual Testing

**Layout Testing**:
1. Test on various screen sizes (mobile: 375px, tablet: 768px, desktop: 1920px)
2. Verify no horizontal scrolling on mobile
3. Check button text doesn't overflow
4. Verify modal fits on screen
5. Test with longest translations (German often longest)

**Text Overflow Testing**:
- Long property names (50+ characters)
- Long addresses (200+ characters)
- Long validation messages
- Long button labels

### Automated Testing

**JSON Validation Script**:
```bash
#!/bin/bash
# Validate all translation files
for lang in en fr es de nl it; do
  echo "Validating $lang.json..."
  node -e "JSON.parse(require('fs').readFileSync('messages/$lang.json', 'utf8'))" && echo "$lang.json: ✅ OK" || echo "$lang.json: ❌ FAILED"
done
```

**Key Structure Consistency Check** (Pseudo-code):
```
For each language file:
  Extract all keys in properties namespace
  Compare with en.json keys
  Report any missing or extra keys
```

---

## ICU MessageFormat Reference

### Plural Forms by Language

**English (en)**: 2 forms
```json
"{count, plural, one {# property} other {# properties}}"
```

**French (fr)**: 2 forms (0-1 vs 2+)
```json
"{count, plural, one {# propriété} other {# propriétés}}"
```

**Spanish (es)**: 2 forms (1 vs 0 or 2+)
```json
"{count, plural, one {# propiedad} other {# propiedades}}"
```

**German (de)**: 2 forms (1 vs 0 or 2+)
```json
"{count, plural, one {# Immobilie} other {# Immobilien}}"
```

**Dutch (nl)**: 2 forms (1 vs 0 or 2+)
```json
"{count, plural, one {# eigendom} other {# eigendommen}}"
```

**Italian (it)**: 2 forms (1 vs 0 or 2+)
```json
"{count, plural, one {# proprietà} other {# proprietà}}"
```
Note: Italian "proprietà" same in singular and plural, but use correct plural form structure

### Variable Interpolation Examples

**English**: `"{count}/{max} characters"`
**French**: `"{count}/{max} caractères"`
**Spanish**: `"{count}/{max} caracteres"`
**German**: `"{count}/{max} Zeichen"`
**Dutch**: `"{count}/{max} tekens"`
**Italian**: `"{count}/{max} caratteri"`

**Delete Message with Variable**:
```
English: "Are you sure you want to delete \"{name}\"?"
French: "Êtes-vous sûr de vouloir supprimer \"{name}\" ?"
Spanish: "¿Está seguro de que desea eliminar \"{name}\"?"
German: "Sind Sie sicher, dass Sie \"{name}\" löschen möchten?"
Dutch: "Weet u zeker dat u \"{name}\" wilt verwijderen?"
Italian: "Sei sicuro di voler eliminare \"{name}\"?"
```

**CRITICAL**: The `{name}` variable placeholder must remain exactly as-is in all translations.

---

## Out of Scope

- Translating other namespaces beyond `properties` (handled by other sub-epic tasks)
- Translating country names in property modals (deferred to future task with i18n-iso-countries)
- Creating translation management system or workflow automation
- Setting up continuous translation integration (future enhancement)
- Translating database content (property names, addresses are user-generated)
- Translating property type database values (kept in English, translated via keys)
- Adding new languages beyond the 5 specified (fr, es, de, nl, it)
- Translating images, icons, or other non-text assets
- Right-to-left (RTL) language support (Arabic, Hebrew, etc.)
- Dialect variations (European Spanish vs Latin American Spanish, etc.)
- Translation memory or CAT tool integration
- Professional translation service contracts or procurement

---

## Success Criteria

This task is considered complete when:

1. ✅ All 9 numbered tasks completed
2. ✅ Translation glossary document created with comprehensive terminology
3. ✅ All ~134 keys in `properties` namespace translated to French
4. ✅ All ~134 keys in `properties` namespace translated to Spanish
5. ✅ All ~134 keys in `properties` namespace translated to German (with nouns capitalized)
6. ✅ All ~134 keys in `properties` namespace translated to Dutch
7. ✅ All ~134 keys in `properties` namespace translated to Italian
8. ✅ All 6 translation files pass JSON validation
9. ✅ All files have identical key structure
10. ✅ ICU MessageFormat syntax preserved in all translations
11. ✅ All variable placeholders unchanged ({name}, {count}, {max})
12. ✅ UTF-8 encoding verified for all files
13. ✅ TypeScript compilation succeeds (`npm run typecheck`)
14. ✅ Linter passes (`npm run lint`)
15. ✅ All property management features tested in all 5 languages
16. ✅ ICU pluralization works correctly (tested with 0, 1, 2+ counts)
17. ✅ Variable interpolation works correctly
18. ✅ Character counters display properly in all languages
19. ✅ No text overflow or truncation issues
20. ✅ No English fallback text visible
21. ✅ Translation completion report created and comprehensive
22. ✅ Sub-Epic 2F marked as complete

---

## Notes

- **This is the final task of Sub-Epic 2F (Property Management)**
- **Dependencies**: All previous tasks (2F.1-2F.5) MUST be complete before starting translations
- **Translation Quality**: Professional translation service or native speaker review highly recommended
- **ICU Format**: Critical to preserve exact syntax - component crashes if ICU format broken
- **German Nouns**: Must capitalize all nouns per German grammar rules
- **Character Encoding**: UTF-8 required for special characters - verify editor settings
- **Testing Priority**: Browser testing in all languages is critical - automated tests can't catch visual issues
- **Maintenance**: Document translation process for future additions to properties namespace
- **Country Names**: Deferred to future task - requires i18n-iso-countries package integration

---

## Document Status

- [x] Specification complete
- [ ] Implementation complete (to be updated by implementing agent)
- [ ] QA validation complete (to be updated by QA agent)
- [ ] Deployed to production (to be updated after deployment)
