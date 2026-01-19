# REQ-383: Generate Translations for Item Creation Workflow (5 Non-English Languages) - Detailed Task Breakdown

**Document Created:** 2026-01-19 19:15:00 UTC
**Last Modified:** 2026-01-19 19:15:00 UTC
**Document Type:** Detailed Implementation Tasks
**Request Type:** ENHANCEMENT
**Size Estimate:** M (Medium)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.13
**Overview Reference:** REQ-383-generate-translations-for-5-non-english-languages-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for generating complete translations of the Item Creation Workflow (`workflow`) namespace from English to five non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). Each task is designed to be approximately 1 story point and can be executed by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify the following:

| Prerequisite | Status | Verification Command |
|--------------|--------|---------------------|
| REQ-371: Workflow namespace structure created | ⚠️ REQUIRED | Check `messages/en.json` for `workflow` key |
| REQ-372-382: Workflow components updated | ⚠️ REQUIRED | Components use `t()` function |
| Translation service module exists | ✅ Assumed | Check `/src/lib/translation-service/` |
| All 6 translation files exist | ✅ Verify | `ls messages/*.json` |
| Valid JSON syntax in all files | ✅ Verify | `npm run lint` or JSON validation |

**CRITICAL:** If the `workflow` namespace does not exist in `messages/en.json`, this task CANNOT proceed. Tasks 2C.1-2C.12 must be completed first.

---

## Task List Overview

| Task # | Title | File(s) | Est. Points |
|--------|-------|---------|-------------|
| 1 | Verify workflow namespace completion in en.json | `messages/en.json` | 0.5 |
| 2 | Document workflow keys for translation | N/A (documentation) | 0.5 |
| 3 | Group keys by semantic category | N/A (planning) | 0.5 |
| 4 | Generate German (de) workflow translations | `messages/de.json` | 1 |
| 5 | Generate Spanish (es) workflow translations | `messages/es.json` | 1 |
| 6 | Generate French (fr) workflow translations | `messages/fr.json` | 1 |
| 7 | Generate Italian (it) workflow translations | `messages/it.json` | 1 |
| 8 | Generate Dutch (nl) workflow translations | `messages/nl.json` | 1 |
| 9 | Validate JSON syntax in all translation files | All `messages/*.json` | 0.5 |
| 10 | Cross-language terminology consistency check | All `messages/*.json` | 1 |
| 11 | TypeScript compilation verification | N/A | 0.5 |
| 12 | Build verification | N/A | 0.5 |
| 13 | Browser console verification | N/A | 0.5 |
| 14 | Visual testing in workflow UI | N/A | 1 |

**Total Estimated Points:** ~10

---

## Detailed Task Specifications

### Task 1: Verify Workflow Namespace Completion in en.json

**Priority:** CRITICAL - Must complete first
**Estimated Points:** 0.5
**File:** `/messages/en.json`

#### Objective
Confirm that the `workflow` namespace from Tasks 2C.1-2C.12 exists and is complete in the English translation file.

#### Actions

1. **Read `/messages/en.json`**
   ```bash
   # Verify the workflow namespace exists
   cat messages/en.json | jq '.workflow'
   ```

2. **Check for required sections**
   The `workflow` namespace should contain these sub-keys:
   - `workflow.header` - Header navigation strings
   - `workflow.rooms` - Room labels (9 rooms)
   - `workflow.itemTypes` - Item type labels and descriptions
   - `workflow.purposes` - Purpose labels and descriptions (7 purposes)
   - `workflow.contentTypes` - Content type options
   - `workflow.steps` - Step-specific strings for all 8 steps
   - `workflow.dialogs` - Dialog messages (confirmExit, removeItem, emptySession, sessionRecovery)
   - `workflow.warnings` - Warning messages (duplicateName, similarName, networkError, cameraFallback)
   - `workflow.content` - Content piece management strings
   - `workflow.print` - Print options strings
   - `workflow.tags` - Tag labels
   - `workflow.validation` - Validation error messages

3. **Count total keys**
   ```bash
   # Approximate expected: 150-180 keys
   cat messages/en.json | jq '[.. | strings] | length'
   ```

4. **Document any missing sections**
   If any sections are missing, this task CANNOT proceed. Return to Tasks 2C.1-2C.12.

#### Acceptance Criteria
- [ ] `workflow` key exists in `messages/en.json`
- [ ] All 12 sub-sections are present
- [ ] Minimum 150 workflow-related keys exist
- [ ] All keys have English string values (no empty strings)

#### If Prerequisites Not Met
If the `workflow` namespace is incomplete or missing:
1. Document which sections are missing
2. STOP execution of REQ-383
3. Report dependency failure to task orchestrator
4. Wait for Tasks 2C.1-2C.12 completion

---

### Task 2: Document Workflow Keys for Translation

**Priority:** High
**Estimated Points:** 0.5
**Files:** `messages/en.json` (read-only)

#### Objective
Extract and document all workflow namespace keys from the English translation file for batch translation processing.

#### Actions

1. **Extract workflow keys**
   ```bash
   cat messages/en.json | jq '.workflow | .. | keys_unsorted' 2>/dev/null | sort -u
   ```

2. **Create key inventory**
   Document the complete list of keys in this format:
   ```
   workflow.header.step
   workflow.header.exit
   workflow.header.back
   workflow.rooms.kitchen
   workflow.rooms.laundry
   ...
   ```

3. **Count keys per section**
   | Section | Expected Count |
   |---------|---------------|
   | header | ~3 |
   | rooms | ~9 |
   | itemTypes | ~9 (3 types × label + description + sublabel) |
   | purposes | ~14 (7 purposes × label + description) |
   | contentTypes | ~6 |
   | steps.roomSelection | ~4 |
   | steps.itemType | ~2 |
   | steps.specificItem | ~4 |
   | steps.purpose | ~2 |
   | steps.contentType | ~2 |
   | steps.mediaCapture | ~6 |
   | steps.preview | ~11 |
   | steps.sessionSummary | ~9 |
   | dialogs | ~18 |
   | warnings | ~15 |
   | content | ~8 |
   | print | ~10 |
   | tags | ~18 |
   | validation | ~3 |

4. **Identify ICU format strings**
   Flag any strings that use:
   - Pluralization: `{count, plural, one {...} other {...}}`
   - Variable interpolation: `{variableName}`

   These require special handling during translation.

#### Acceptance Criteria
- [ ] Complete key inventory documented
- [ ] ICU format strings identified and flagged
- [ ] Key count matches expected (~150-180 keys)

---

### Task 3: Group Keys by Semantic Category

**Priority:** High
**Estimated Points:** 0.5
**Files:** None (planning task)

#### Objective
Organize workflow keys into semantic batches for efficient translation with appropriate context hints.

#### Actions

1. **Create translation batches**

   **Batch 1: Navigation & Actions (~20 keys)**
   - `workflow.header.*`
   - `workflow.steps.*.title`
   - `workflow.steps.*.subtitle`

   Context hint: "UI navigation elements for a multi-step wizard"

   **Batch 2: Room Labels (~9 keys)**
   - `workflow.rooms.*`

   Context hint: "Room names in a vacation rental property (Kitchen, Bedroom, etc.)"

   **Batch 3: Item Types (~9 keys)**
   - `workflow.itemTypes.*`

   Context hint: "Categories of household items for QR code tracking"

   **Batch 4: Purpose Labels (~14 keys)**
   - `workflow.purposes.*`

   Context hint: "Purpose categories for item instructions (How to Use, Troubleshooting, etc.)"

   **Batch 5: Content Types (~6 keys)**
   - `workflow.contentTypes.*`

   Context hint: "Media content options (Video, Photo, PDF, etc.)"

   **Batch 6: Media Capture (~10 keys)**
   - `workflow.steps.mediaCapture.*`
   - `workflow.warnings.cameraFallback.*`

   Context hint: "Camera and media recording interface"

   **Batch 7: Preview & Save (~20 keys)**
   - `workflow.steps.preview.*`
   - `workflow.steps.sessionSummary.*`
   - `workflow.content.*`

   Context hint: "Review and save UI for created items"

   **Batch 8: Dialogs (~25 keys)**
   - `workflow.dialogs.*`
   - `workflow.warnings.networkError.*`
   - `workflow.warnings.duplicateName`
   - `workflow.warnings.similarName`

   Context hint: "Confirmation and warning dialogs"

   **Batch 9: Print Options (~10 keys)**
   - `workflow.print.*`

   Context hint: "QR code printing options and status"

   **Batch 10: Tags & Validation (~21 keys)**
   - `workflow.tags.*`
   - `workflow.validation.*`

   Context hint: "Item labels and form validation messages"

2. **Document batch structure for translation service calls**

#### Acceptance Criteria
- [ ] All ~150-180 keys assigned to batches
- [ ] Each batch has appropriate context hint
- [ ] Batch sizes are manageable (10-25 keys each)

---

### Task 4: Generate German (de) Workflow Translations

**Priority:** High
**Estimated Points:** 1
**File:** `/messages/de.json`

#### Objective
Generate complete German translations for all workflow namespace keys.

#### Actions

1. **Read current de.json structure**
   ```javascript
   const deJson = require('./messages/de.json');
   console.log(Object.keys(deJson)); // Verify existing namespaces
   ```

2. **Generate German translations using translation service**

   For each batch from Task 3:
   ```typescript
   import { translateToLanguages } from '@/lib/translation-service';

   // Example for room labels batch
   const roomTranslations = await translateToLanguages(
     Object.values(workflow.rooms),
     'en',
     ['de'],
     {
       context: {
         contentType: 'ui_label',
         domainContext: 'Room names in a vacation rental property'
       }
     }
   );
   ```

3. **Apply German-specific translation rules**

   | English | German | Note |
   |---------|--------|------|
   | Kitchen | Küche | |
   | Laundry Room | Waschküche | |
   | Bedroom | Schlafzimmer | |
   | Bathroom | Badezimmer | |
   | Living Room | Wohnzimmer | |
   | Garage | Garage | Same in German |
   | Outdoor/Patio | Außenbereich/Terrasse | |
   | General/Whole Property | Allgemein/Gesamtes Objekt | |
   | Other | Andere | |
   | How to Use | Bedienungsanleitung | Or "Wie verwenden" |
   | Troubleshooting | Fehlerbehebung | |
   | Save | Speichern | |
   | Cancel | Abbrechen | |
   | Continue | Weiter | |
   | Exit | Beenden | |
   | Back | Zurück | |

4. **Handle ICU format strings**

   Example:
   ```json
   // English
   "subtitle": "You created {count} {count, plural, one {item} other {items}}"

   // German
   "subtitle": "Sie haben {count} {count, plural, one {Artikel} other {Artikel}} erstellt"
   ```

   Note: German doesn't differentiate plural for "Artikel", but the ICU structure must be preserved.

5. **Update de.json with workflow namespace**
   ```javascript
   // Merge workflow translations into existing de.json
   deJson.workflow = generatedWorkflowTranslations;
   fs.writeFileSync('./messages/de.json', JSON.stringify(deJson, null, 2));
   ```

6. **Validate JSON syntax**
   ```bash
   cat messages/de.json | jq . > /dev/null && echo "Valid JSON"
   ```

#### German Translation Reference Table

| Key | English | German |
|-----|---------|--------|
| workflow.header.step | Step {current} of {total} | Schritt {current} von {total} |
| workflow.header.exit | Exit | Beenden |
| workflow.header.back | Back | Zurück |
| workflow.steps.roomSelection.title | Select a Room | Raum auswählen |
| workflow.steps.preview.save | Save Item | Artikel speichern |
| workflow.dialogs.confirmExit.title | Exit Workflow? | Workflow beenden? |
| workflow.dialogs.confirmExit.stay | Stay | Bleiben |
| workflow.dialogs.confirmExit.exit | Exit Workflow | Workflow beenden |

#### Acceptance Criteria
- [ ] `de.json` contains complete `workflow` namespace
- [ ] All keys from `en.json` workflow have corresponding German translations
- [ ] ICU format placeholders preserved exactly (`{count}`, `{name}`, etc.)
- [ ] JSON syntax is valid
- [ ] Umlauts and special characters (ä, ö, ü, ß) render correctly

---

### Task 5: Generate Spanish (es) Workflow Translations

**Priority:** High
**Estimated Points:** 1
**File:** `/messages/es.json`

#### Objective
Generate complete Spanish translations for all workflow namespace keys using neutral Spanish (not region-specific).

#### Actions

1. **Read current es.json structure**
   ```javascript
   const esJson = require('./messages/es.json');
   ```

2. **Generate Spanish translations**
   Use translation service with context:
   ```typescript
   const result = await translateToLanguages(
     sourceText,
     'en',
     ['es'],
     {
       context: {
         contentType: 'ui_label',
         domainContext: 'Vacation rental property management app, item creation wizard',
         languageVariant: 'neutral Spanish (suitable for all Spanish-speaking regions)'
       }
     }
   );
   ```

3. **Apply Spanish-specific translation rules**

   | English | Spanish | Note |
   |---------|---------|------|
   | Kitchen | Cocina | |
   | Laundry Room | Lavandería | |
   | Bedroom | Dormitorio | |
   | Bathroom | Baño | |
   | Living Room | Sala de estar | Or "Salón" |
   | Garage | Garaje | |
   | Outdoor/Patio | Exterior/Patio | |
   | General/Whole Property | General/Toda la propiedad | |
   | How to Use | Cómo usar | |
   | Troubleshooting | Solución de problemas | |
   | Save | Guardar | |
   | Cancel | Cancelar | |
   | Continue | Continuar | |

4. **Handle Spanish pluralization**
   ```json
   // English
   "subtitle": "You created {count} {count, plural, one {item} other {items}}"

   // Spanish
   "subtitle": "Has creado {count} {count, plural, one {artículo} other {artículos}}"
   ```

5. **Update es.json with workflow namespace**

6. **Validate JSON syntax**

#### Spanish Translation Reference Table

| Key | English | Spanish |
|-----|---------|---------|
| workflow.header.step | Step {current} of {total} | Paso {current} de {total} |
| workflow.steps.roomSelection.title | Select a Room | Seleccionar una habitación |
| workflow.steps.preview.save | Save Item | Guardar artículo |
| workflow.dialogs.confirmExit.title | Exit Workflow? | ¿Salir del asistente? |
| workflow.content.pieceCount | {count, plural, one {# piece} other {# pieces}} of content | {count, plural, one {# pieza} other {# piezas}} de contenido |

#### Acceptance Criteria
- [ ] `es.json` contains complete `workflow` namespace
- [ ] All keys from `en.json` workflow have corresponding Spanish translations
- [ ] ICU format placeholders preserved exactly
- [ ] JSON syntax is valid
- [ ] Accented characters (á, é, í, ó, ú, ñ, ü) render correctly

---

### Task 6: Generate French (fr) Workflow Translations

**Priority:** High
**Estimated Points:** 1
**File:** `/messages/fr.json`

#### Objective
Generate complete French translations for all workflow namespace keys using formal register (vous form).

#### Actions

1. **Read current fr.json structure**

2. **Generate French translations**
   Use translation service with context:
   ```typescript
   const result = await translateToLanguages(
     sourceText,
     'en',
     ['fr'],
     {
       context: {
         contentType: 'ui_label',
         domainContext: 'Vacation rental property management app',
         formality: 'formal (use vous form, professional tone)'
       }
     }
   );
   ```

3. **Apply French-specific translation rules**

   | English | French | Note |
   |---------|--------|------|
   | Kitchen | Cuisine | |
   | Laundry Room | Buanderie | |
   | Bedroom | Chambre | |
   | Bathroom | Salle de bain | |
   | Living Room | Salon | |
   | Garage | Garage | Same |
   | Outdoor/Patio | Extérieur/Terrasse | |
   | General/Whole Property | Général/Toute la propriété | |
   | How to Use | Comment utiliser | |
   | Troubleshooting | Dépannage | |
   | Save | Enregistrer | |
   | Cancel | Annuler | |
   | Continue | Continuer | |

4. **Handle French gender agreement**
   French requires gender agreement for nouns and adjectives.

   Example:
   ```json
   // English: "item" (neutral)
   // French: "article" (masculine) or use generic terms
   "saveItem": "Enregistrer l'article"
   ```

5. **Update fr.json with workflow namespace**

6. **Validate JSON syntax**

#### French Translation Reference Table

| Key | English | French |
|-----|---------|--------|
| workflow.header.step | Step {current} of {total} | Étape {current} sur {total} |
| workflow.steps.roomSelection.title | Select a Room | Sélectionner une pièce |
| workflow.steps.preview.save | Save Item | Enregistrer l'article |
| workflow.dialogs.confirmExit.title | Exit Workflow? | Quitter l'assistant ? |
| workflow.dialogs.confirmExit.messageUnsaved | You have unsaved changes. Are you sure you want to exit? | Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ? |

#### Acceptance Criteria
- [ ] `fr.json` contains complete `workflow` namespace
- [ ] All keys from `en.json` workflow have corresponding French translations
- [ ] Uses formal "vous" form consistently
- [ ] ICU format placeholders preserved exactly
- [ ] JSON syntax is valid
- [ ] Accented characters (é, è, ê, à, ç, etc.) render correctly

---

### Task 7: Generate Italian (it) Workflow Translations

**Priority:** High
**Estimated Points:** 1
**File:** `/messages/it.json`

#### Objective
Generate complete Italian translations for all workflow namespace keys.

#### Actions

1. **Read current it.json structure**

2. **Generate Italian translations**

3. **Apply Italian-specific translation rules**

   | English | Italian | Note |
   |---------|---------|------|
   | Kitchen | Cucina | |
   | Laundry Room | Lavanderia | |
   | Bedroom | Camera da letto | |
   | Bathroom | Bagno | |
   | Living Room | Soggiorno | |
   | Garage | Garage | Same |
   | Outdoor/Patio | Esterno/Patio | |
   | General/Whole Property | Generale/Intera proprietà | |
   | How to Use | Come usare | |
   | Troubleshooting | Risoluzione dei problemi | |
   | Save | Salva | |
   | Cancel | Annulla | |
   | Continue | Continua | |

4. **Handle Italian verb conjugation**
   Italian uses informal "tu" in most software interfaces:
   ```json
   "confirmMessage": "Sei sicuro di voler uscire?"  // informal
   // vs formal: "È sicuro di voler uscire?"
   ```

   Use informal for this application (consistent with modern app conventions).

5. **Update it.json with workflow namespace**

6. **Validate JSON syntax**

#### Italian Translation Reference Table

| Key | English | Italian |
|-----|---------|---------|
| workflow.header.step | Step {current} of {total} | Passaggio {current} di {total} |
| workflow.steps.roomSelection.title | Select a Room | Seleziona una stanza |
| workflow.steps.preview.save | Save Item | Salva articolo |
| workflow.dialogs.confirmExit.title | Exit Workflow? | Uscire dal workflow? |

#### Acceptance Criteria
- [ ] `it.json` contains complete `workflow` namespace
- [ ] All keys from `en.json` workflow have corresponding Italian translations
- [ ] Uses informal register consistently
- [ ] ICU format placeholders preserved exactly
- [ ] JSON syntax is valid
- [ ] Accented characters (à, è, é, ì, ò, ù) render correctly

---

### Task 8: Generate Dutch (nl) Workflow Translations

**Priority:** High
**Estimated Points:** 1
**File:** `/messages/nl.json`

#### Objective
Generate complete Dutch translations for all workflow namespace keys.

#### Actions

1. **Read current nl.json structure**

2. **Generate Dutch translations**

3. **Apply Dutch-specific translation rules**

   | English | Dutch | Note |
   |---------|-------|------|
   | Kitchen | Keuken | |
   | Laundry Room | Wasruimte | |
   | Bedroom | Slaapkamer | |
   | Bathroom | Badkamer | |
   | Living Room | Woonkamer | |
   | Garage | Garage | Same |
   | Outdoor/Patio | Buiten/Terras | |
   | General/Whole Property | Algemeen/Hele eigendom | |
   | How to Use | Gebruiksaanwijzing | Or "Hoe te gebruiken" |
   | Troubleshooting | Probleemoplossing | |
   | Save | Opslaan | |
   | Cancel | Annuleren | |
   | Continue | Doorgaan | |

4. **Handle Dutch compound words**
   Dutch frequently uses compound words:
   ```json
   "cameraPermission": "Cameratoegang is vereist"  // Camera + toegang
   ```

5. **Update nl.json with workflow namespace**

6. **Validate JSON syntax**

#### Dutch Translation Reference Table

| Key | English | Dutch |
|-----|---------|-------|
| workflow.header.step | Step {current} of {total} | Stap {current} van {total} |
| workflow.steps.roomSelection.title | Select a Room | Selecteer een kamer |
| workflow.steps.preview.save | Save Item | Item opslaan |
| workflow.dialogs.confirmExit.title | Exit Workflow? | Wizard afsluiten? |

#### Acceptance Criteria
- [ ] `nl.json` contains complete `workflow` namespace
- [ ] All keys from `en.json` workflow have corresponding Dutch translations
- [ ] ICU format placeholders preserved exactly
- [ ] JSON syntax is valid
- [ ] Special characters render correctly

---

### Task 9: Validate JSON Syntax in All Translation Files

**Priority:** High
**Estimated Points:** 0.5
**Files:** All `/messages/*.json`

#### Objective
Ensure all translation files have valid JSON syntax after updates.

#### Actions

1. **Validate each file with jq**
   ```bash
   for file in messages/*.json; do
     echo "Validating $file..."
     jq . "$file" > /dev/null 2>&1 && echo "  ✓ Valid" || echo "  ✗ Invalid"
   done
   ```

2. **Check for common JSON errors**
   - Trailing commas
   - Unescaped quotes in strings
   - Missing closing braces/brackets
   - Invalid Unicode escapes

3. **Validate with npm lint (if configured)**
   ```bash
   npm run lint
   ```

4. **Fix any syntax errors discovered**
   If errors are found, fix them in the respective file.

5. **Verify key structure matches across all files**
   ```bash
   # Compare key counts between files
   for file in messages/*.json; do
     echo "$file: $(jq '[.. | strings] | length' "$file") keys"
   done
   ```

#### Acceptance Criteria
- [ ] All 6 translation files pass JSON validation
- [ ] No trailing commas
- [ ] No unescaped special characters
- [ ] Key count is consistent across all files (within 5% variance)

---

### Task 10: Cross-Language Terminology Consistency Check

**Priority:** High
**Estimated Points:** 1
**Files:** All `/messages/*.json`

#### Objective
Verify that translated terminology is consistent across all workflow components and aligned with existing namespace translations.

#### Actions

1. **Compare common terms across namespaces**

   Terms like "Save", "Cancel", "Delete" should be consistent between `common`, `auth`, `dashboard`, and `workflow` namespaces.

   ```bash
   # Check "Save" translation consistency
   for file in messages/*.json; do
     echo "$file:"
     jq '.common.save, .workflow.steps.preview.save' "$file"
   done
   ```

2. **Verify room name consistency**
   Room names in `workflow.rooms.*` should match any room references in `items` namespace.

3. **Check action button terminology**

   | Action | Expected Consistency |
   |--------|---------------------|
   | Save | Same across all namespaces |
   | Cancel | Same across all namespaces |
   | Delete | Same across all namespaces |
   | Continue | Same across all namespaces |
   | Back | Same across all namespaces |

4. **Document inconsistencies**
   If inconsistencies are found, decide whether to:
   - Update existing namespaces for consistency
   - Adjust workflow translations to match existing

   Prefer matching existing translations to minimize rework.

5. **Verify technical terms are consistent**
   - "QR code" / "QR-Code" / "code QR"
   - "PDF" (should remain "PDF" in all languages)
   - "Video" / "Photo" (may vary by language)

#### Consistency Matrix

| Term | EN | DE | ES | FR | IT | NL |
|------|----|----|----|----|----|----|
| Save | Save | Speichern | Guardar | Enregistrer | Salva | Opslaan |
| Cancel | Cancel | Abbrechen | Cancelar | Annuler | Annulla | Annuleren |
| Continue | Continue | Weiter | Continuar | Continuer | Continua | Doorgaan |
| Back | Back | Zurück | Atrás | Retour | Indietro | Terug |
| Exit | Exit | Beenden | Salir | Quitter | Esci | Afsluiten |
| QR Code | QR Code | QR-Code | Código QR | Code QR | Codice QR | QR-code |

#### Acceptance Criteria
- [ ] Common action terms are consistent across all namespaces
- [ ] Room names match between `workflow.rooms` and any `items` references
- [ ] Technical terms (QR code, PDF, etc.) follow consistent conventions per language
- [ ] No conflicting translations for the same concept

---

### Task 11: TypeScript Compilation Verification

**Priority:** High
**Estimated Points:** 0.5
**Files:** None directly

#### Objective
Verify that translation file changes do not cause TypeScript compilation errors.

#### Actions

1. **Run TypeScript compiler**
   ```bash
   npx tsc --noEmit
   ```

2. **Check for type errors related to translations**
   Common issues:
   - Missing type definitions for new keys
   - Type mismatches in translation function calls
   - Invalid key paths in `useTranslations()` calls

3. **Verify next-intl configuration**
   If the project uses typed translations, ensure types are updated:
   ```typescript
   // Check if messages type is auto-generated
   // src/types/messages.d.ts or similar
   ```

4. **Fix any compilation errors**
   - Update type definitions if needed
   - Ensure all workflow keys are accessible via `useTranslations('workflow')`

#### Acceptance Criteria
- [ ] `npx tsc --noEmit` completes with no errors
- [ ] No TypeScript errors related to translation keys
- [ ] All workflow namespace keys are type-safe

---

### Task 12: Build Verification

**Priority:** High
**Estimated Points:** 0.5
**Files:** None directly

#### Objective
Verify that the Next.js build completes successfully with the updated translation files.

#### Actions

1. **Run production build**
   ```bash
   npm run build
   ```

2. **Check for build errors**
   Look for:
   - JSON parsing errors
   - Missing translation file errors
   - next-intl configuration errors
   - Locale routing errors

3. **Verify build output includes translations**
   Check that the build includes all locale variants:
   ```bash
   ls -la .next/server/app/
   # Should show routes for each locale
   ```

4. **Fix any build errors**

#### Acceptance Criteria
- [ ] `npm run build` completes successfully
- [ ] No errors related to translation files
- [ ] Build time is reasonable (not significantly increased)
- [ ] All 6 locales are included in build output

---

### Task 13: Browser Console Verification

**Priority:** Medium
**Estimated Points:** 0.5
**Files:** None directly

#### Objective
Verify no missing translation warnings appear in the browser console during workflow navigation.

#### Actions

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools (Console tab)**

3. **Navigate through Item Creation Workflow in each language**

   For each language (en, de, es, fr, it, nl):
   1. Set browser language preference
   2. Navigate to workflow entry point
   3. Progress through all 8 steps
   4. Check console for warnings

4. **Document any missing translation warnings**
   Look for messages like:
   - `Missing translation: workflow.xxx.yyy`
   - `Fallback to default language for: workflow.xxx`
   - next-intl warning messages

5. **Fix any missing translations discovered**

#### Test Checklist per Language

| Step | Check | EN | DE | ES | FR | IT | NL |
|------|-------|----|----|----|----|----|----|
| RoomSelection | Title displays | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| RoomSelection | All room labels | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ItemType | All type labels | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| SpecificItem | Search placeholder | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Purpose | All purpose labels | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ContentType | All content options | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| MediaCapture | Camera prompts | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Preview | Save button | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| SessionSummary | Subtitle with count | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

#### Acceptance Criteria
- [ ] No missing translation warnings in console for any language
- [ ] No fallback warnings
- [ ] All workflow steps display translated content
- [ ] Pluralization displays correctly (test with count=0, 1, 5)

---

### Task 14: Visual Testing in Workflow UI

**Priority:** Medium
**Estimated Points:** 1
**Files:** None directly

#### Objective
Visually verify that all workflow UI elements display correctly with translated content in each language.

#### Actions

1. **Test in each supported language**

   For each language:
   1. Switch language using LanguageSwitcher
   2. Navigate through complete workflow
   3. Screenshot key screens for documentation

2. **Check for layout issues**

   | Issue | Check |
   |-------|-------|
   | Text overflow | Buttons, headers, labels fit containers |
   | Text truncation | Long translations don't cut off mid-word |
   | Line breaks | Multi-line text breaks at appropriate points |
   | Alignment | Text remains properly aligned |
   | Spacing | No unusual gaps or overlaps |

3. **Test dialog components**
   - Trigger exit confirmation dialog
   - Trigger remove item dialog (if applicable)
   - Verify camera permission fallback display

4. **Test responsive behavior**
   - Desktop viewport (1920×1080)
   - Tablet viewport (768×1024)
   - Mobile viewport (375×667)

5. **Document any visual issues**
   If issues found, note:
   - Language affected
   - Component affected
   - Screenshot of issue
   - Suggested fix (shorter translation, CSS adjustment, etc.)

#### Visual Testing Matrix

| Component | EN | DE | ES | FR | IT | NL |
|-----------|----|----|----|----|----|----|
| Step header navigation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Room selection buttons | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Item type cards | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Purpose selection | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Content type options | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Media capture buttons | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Preview form fields | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Save button | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Session summary | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Exit dialog | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Print options panel | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

#### Acceptance Criteria
- [ ] All workflow steps display correctly in all 6 languages
- [ ] No text overflow or truncation issues
- [ ] Dialog components display correctly
- [ ] Language switching works mid-workflow
- [ ] Responsive layouts work across viewport sizes

---

## Files Modified Summary

| File | Modification Type | Task(s) |
|------|------------------|---------|
| `/messages/de.json` | Add `workflow` namespace | Task 4 |
| `/messages/es.json` | Add `workflow` namespace | Task 5 |
| `/messages/fr.json` | Add `workflow` namespace | Task 6 |
| `/messages/it.json` | Add `workflow` namespace | Task 7 |
| `/messages/nl.json` | Add `workflow` namespace | Task 8 |

## Files NOT to Modify

| File | Reason |
|------|--------|
| `/messages/en.json` | Source of truth - should not be modified in this task |
| `/src/lib/translation-service/*` | Translation infrastructure - already complete |
| `/src/components/ItemCreationWorkflow/**/*.tsx` | Component files - modified in Tasks 2C.2-2C.12 |
| `/src/lib/i18n/config.ts` | i18n configuration - already complete from Epic 1 |

---

## Translation Quality Guidelines

### ICU Format Preservation

**CRITICAL:** All ICU message format syntax MUST be preserved exactly.

| Pattern | Example | Note |
|---------|---------|------|
| Variable | `{name}` | Variable name must NOT be translated |
| Plural | `{count, plural, one {...} other {...}}` | Structure preserved, content translated |
| Select | `{gender, select, male {...} female {...}}` | Structure preserved, content translated |

### Common Pitfalls to Avoid

1. **DO NOT translate variable names**
   - ❌ `{nombre}` (translated variable)
   - ✅ `{name}` (original variable)

2. **DO NOT change ICU structure**
   - ❌ `{count} items` (lost plural handling)
   - ✅ `{count, plural, one {item} other {items}}`

3. **DO NOT add extra spaces in ICU syntax**
   - ❌ `{ count, plural, one { item } other { items } }`
   - ✅ `{count, plural, one {item} other {items}}`

4. **DO preserve HTML if present**
   - ✅ `<strong>Important:</strong> Save your work`

---

## Error Handling

### If Translation Service Fails

1. Use fallback provider (OpenAI if Claude fails)
2. If both fail, manually translate using reference tables
3. Document which keys required manual translation

### If Build Fails

1. Check JSON syntax first (`jq .` validation)
2. Check for TypeScript type errors
3. Verify all required keys exist in all files
4. Check for character encoding issues

### If Visual Issues Found

1. Document the issue with screenshot
2. Determine if it's a translation length issue or CSS issue
3. For translation length: create shorter alternative
4. For CSS issue: note for separate fix (not in scope of REQ-383)

---

## Rollback Plan

If critical issues are discovered after implementation:

1. **Revert translation files**
   ```bash
   git checkout HEAD~1 -- messages/de.json messages/es.json messages/fr.json messages/it.json messages/nl.json
   ```

2. **Keep English unchanged**
   The `en.json` file is the source of truth and should not be modified.

3. **Re-run validation tasks**
   Execute Tasks 9-14 again after fixes.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Translation completeness | 100% | All workflow keys exist in all 5 language files |
| JSON validity | 100% | All files pass `jq .` validation |
| Build success | Pass | `npm run build` completes without errors |
| Console warnings | 0 | No missing translation warnings in any language |
| Visual issues | 0 | No text overflow or layout breaks |
| Consistency | 100% | Common terms match across namespaces |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Overview Document: REQ-383](/docs/REQ-383-generate-translations-for-5-non-english-languages-overview.md)
- [Requirements: gen_requests_epic2.md](/docs/gen_requests_epic2.md) - Request #383
- [Translation Service](/src/lib/translation-service/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

## Appendix A: Expected Workflow Namespace Structure

The complete `workflow` namespace structure that should exist in `en.json` before this task begins (from Tasks 2C.1-2C.12):

```json
{
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "exit": "Exit",
      "back": "Back"
    },
    "rooms": {
      "kitchen": "Kitchen",
      "laundry": "Laundry Room",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor/Patio",
      "general": "General/Whole Property",
      "other": "Other"
    },
    "itemTypes": {
      "appliance": {
        "label": "Appliance",
        "description": "Washer, dryer, stove, refrigerator, etc."
      },
      "roomItem": {
        "label": "Room Item",
        "description": "Pantry, cabinets, closet, sink, etc."
      },
      "generalInfo": {
        "label": "General Info",
        "description": "Trash schedule, WiFi info, house rules, etc."
      }
    },
    "purposes": {
      "howToUse": { "label": "How to Use", "description": "Operating instructions and controls" },
      "howToClean": { "label": "How to Clean", "description": "Cleaning and care instructions" },
      "troubleshooting": { "label": "Troubleshooting", "description": "Common issues and fixes" },
      "safetyInfo": { "label": "Safety Information", "description": "Safety warnings and precautions" },
      "maintenance": { "label": "Maintenance", "description": "Regular maintenance tasks" },
      "features": { "label": "Features & Tips", "description": "Special features and tips" },
      "other": { "label": "Other", "description": "General information" }
    },
    "contentTypes": {
      "recordVideo": "Record Video",
      "takePhoto": "Take Photo",
      "writeText": "Write Text",
      "uploadFile": "Upload File",
      "uploadFileSubtitle": "Video, Image, PDF, Text",
      "addLink": "Add Link"
    },
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located",
        "searchPlaceholder": "Search rooms...",
        "noRooms": "No rooms found"
      },
      "itemType": {
        "title": "What type of item?",
        "subtitle": "Select the category that best describes your item"
      },
      "specificItem": {
        "title": "Which specific item?",
        "subtitle": "Choose or enter the exact item name",
        "searchPlaceholder": "Search or type item name...",
        "suggestions": "Suggestions"
      },
      "purpose": {
        "title": "What's the purpose?",
        "subtitle": "Select the main purpose for this content"
      },
      "contentType": {
        "title": "How do you want to add content?",
        "subtitle": "Choose how to provide instructions"
      },
      "mediaCapture": {
        "title": "Capture Content",
        "takePhoto": "Take Photo",
        "recordVideo": "Record Video",
        "retake": "Retake",
        "useThis": "Use This",
        "cameraPermission": "Camera access is required",
        "cameraPermissionDescription": "Please allow camera access to capture photos or videos."
      },
      "preview": {
        "title": "Review & Save",
        "subtitle": "Review your item before saving",
        "itemName": "Item Name",
        "itemNamePlaceholder": "Enter item name",
        "itemNameHint": "This name will appear on the QR code label",
        "description": "Description",
        "tags": "Tags",
        "content": "Content",
        "addMore": "Add More Content",
        "save": "Save Item",
        "saving": "Saving..."
      },
      "sessionSummary": {
        "title": "Session Complete!",
        "subtitle": "You created {count} {count, plural, one {item} other {items}}",
        "noItems": "No items yet",
        "noItemsDescription": "You haven't created any items in this session yet.",
        "addFirstItem": "Add First Item",
        "printOptions": "Print QR Codes",
        "createAnother": "Create Another Item",
        "viewItems": "View Items",
        "done": "Done"
      }
    },
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageWithItems": "You have unsaved changes and {count} item(s) in this session. Are you sure you want to exit?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageItems": "You have created {count} item(s) in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "stay": "Stay",
        "exit": "Exit Workflow"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addItems": "Add Items",
        "exitSession": "Exit Session"
      },
      "sessionRecovery": {
        "title": "Your previous session has been restored",
        "itemCount": "{count} item(s)",
        "needsReupload": "{count} piece(s) need(s) re-upload",
        "dismiss": "Dismiss notification",
        "continue": "Continue Session",
        "startFresh": "Start Fresh"
      }
    },
    "warnings": {
      "duplicateName": "Exact name already exists",
      "similarName": "Similar name already used",
      "networkError": {
        "title": "Preview unavailable",
        "message": "Unable to load preview due to network connectivity issues.",
        "retrying": "Retrying...",
        "retry": "Try Again",
        "proceed": "Proceed Without Preview"
      },
      "cameraFallback": {
        "title": "Camera access not available",
        "message": "To record a {type}, please allow camera access in your browser settings, or upload an existing {type} from your device.",
        "uploadVideo": "Upload Video",
        "uploadPhoto": "Upload Photo",
        "tryAgain": "Try Camera Again",
        "howToEnable": "How to enable camera access"
      }
    },
    "content": {
      "pieces": "Content Pieces",
      "pieceCount": "{count, plural, one {# piece} other {# pieces}} of content",
      "dragToReorder": "Drag to reorder",
      "remove": "Remove",
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "text": "Text",
        "link": "Link"
      }
    },
    "print": {
      "scope": {
        "all": "All Items",
        "new": "New Items Only",
        "select": "Select Items"
      },
      "status": {
        "ready": "Ready to generate",
        "generating": "Generating...",
        "complete": "Generation complete",
        "failed": "Generation failed"
      },
      "stats": {
        "total": "{total} items",
        "completed": "{completed} generated",
        "failed": "{failed} failed"
      },
      "retry": "Retry"
    },
    "tags": {
      "kitchen": "Kitchen",
      "laundry": "Laundry",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor",
      "general": "General",
      "appliance": "Appliance",
      "roomItem": "Room Item",
      "instructions": "Instructions",
      "cleaning": "Cleaning",
      "troubleshooting": "Troubleshooting",
      "safety": "Safety",
      "maintenance": "Maintenance",
      "features": "Features",
      "info": "Info",
      "removeTag": "Remove {label} tag"
    },
    "validation": {
      "nameRequired": "Item name is required",
      "contentRequired": "At least one content piece is required",
      "roomRequired": "Please select a room"
    }
  }
}
```

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C Task 2C.13*
