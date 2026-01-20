# REQ-E02-068: Generate Translations for 5 Non-English Languages - Detailed Task Breakdown

**Generated:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-068
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.13
**Type:** ENHANCEMENT
**Size:** L (Large)
**Estimated Strings:** ~500 (workflow namespace)

---

## Document Overview

This document provides a granular, actionable task breakdown for generating complete translations of the Item Creation Workflow namespace into five non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it).

### Key Clarification: Supported Languages

**Note:** The gen_requests_epic2.md document mentions Japanese (ja) and Chinese (zh), but the actual i18n configuration (`/src/lib/i18n/config.ts`) specifies the following supported locales:

```typescript
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
```

This detailed breakdown follows the **actual system configuration** (Dutch and Italian instead of Japanese and Chinese).

---

## Prerequisites & Dependencies

### Required - BLOCKING

| Dependency | Description | Verification |
|------------|-------------|--------------|
| Epic 1 Foundation | next-intl installed and configured | `npm list next-intl` should show version |
| Task 2C.1 (REQ-E02-056) | `workflow` namespace structure created | Check `/messages/en.json` for `workflow` key |
| Tasks 2C.2-2C.12 | All English strings extracted | Count `workflow.*` keys in `/messages/en.json` |

### Verification Script

Before starting this task, run:

```bash
# Check if workflow namespace exists
grep -c '"workflow"' messages/en.json

# Count workflow keys (should be ~500)
grep -o '"workflow\.' messages/en.json | wc -l
```

If the workflow namespace doesn't exist or has significantly fewer than 500 keys, this task cannot proceed.

---

## Task Breakdown

### Task 1: Verify English Workflow Namespace Completeness

**Priority:** P0 - Must complete first
**Estimated Effort:** 30 minutes
**Assignee:** AI Agent or Developer

#### Description
Verify that the English `workflow` namespace is complete in `/messages/en.json` before generating translations.

#### Acceptance Criteria
- [ ] `/messages/en.json` contains `workflow` namespace at root level
- [ ] All expected sub-namespaces exist: `header`, `steps`, `dialogs`, `shared`, `content`, `validation`
- [ ] Minimum ~450 keys exist in the workflow namespace
- [ ] No placeholder text (e.g., "TODO", "FIXME") exists in values
- [ ] All variable placeholders follow `{variableName}` format
- [ ] All pluralization strings use ICU MessageFormat

#### Steps
1. **Read** `/messages/en.json` and locate `workflow` namespace
2. **Validate** namespace structure against expected hierarchy:
   ```
   workflow
   ├── header (~10 keys)
   ├── steps
   │   ├── roomSelection (~40 keys)
   │   ├── itemType (~40 keys)
   │   ├── specificItem (~30 keys)
   │   ├── purpose (~35 keys)
   │   ├── contentType (~40 keys)
   │   ├── mediaCapture (~45 keys)
   │   ├── preview (~50 keys)
   │   └── sessionSummary (~40 keys)
   ├── dialogs
   │   ├── confirmExit (~12 keys)
   │   ├── emptySession (~8 keys)
   │   ├── removeItem (~6 keys)
   │   └── pdfExport (~15 keys)
   ├── shared
   │   ├── cards (~30 keys)
   │   ├── editors (~25 keys)
   │   ├── progress (~15 keys)
   │   └── errors (~20 keys)
   ├── content (~20 keys)
   └── validation (~15 keys)
   ```
3. **Count** total keys and compare to expected ~500
4. **Identify** any missing sections or obviously incomplete areas
5. **Document** findings and proceed only if validation passes

#### Output
- Verification report indicating pass/fail
- If fail: list of missing sections or issues blocking translation

---

### Task 2: Generate French (fr) Translations

**Priority:** P1
**Estimated Effort:** 2-3 hours
**File:** `/messages/fr.json`

#### Description
Add the complete `workflow` namespace with accurate French translations to the French locale file.

#### Translation Guidelines - French Specific

| Guideline | Example |
|-----------|---------|
| Use formal "vous" form | "Sélectionnez" not "Sélectionne" |
| Space before `:`, `?`, `!`, `;` | "Question ?" not "Question?" |
| Preserve variable placeholders exactly | `{itemName}` stays `{itemName}` |
| Use proper accents | é, è, ê, ë, à, â, etc. |
| ICU plural rules: one, other | `{count, plural, one {# article} other {# articles}}` |

#### Steps
1. **Read** `/messages/en.json` workflow namespace completely
2. **Read** existing `/messages/fr.json` to understand current structure and style
3. **Translate** each section systematically:
   - `workflow.header` - Navigation and control labels
   - `workflow.steps.roomSelection` - Room selection step
   - `workflow.steps.itemType` - Item type selection
   - `workflow.steps.specificItem` - Specific item selection
   - `workflow.steps.purpose` - Purpose selection
   - `workflow.steps.contentType` - Content type selection
   - `workflow.steps.mediaCapture` - Media capture interface
   - `workflow.steps.preview` - Preview and save
   - `workflow.steps.sessionSummary` - Session completion
   - `workflow.dialogs` - All dialog content
   - `workflow.shared` - Shared component strings
   - `workflow.content` - Content-related strings
   - `workflow.validation` - Validation messages
4. **Verify** terminology consistency with existing `fr.json` translations
5. **Add** the complete `workflow` namespace to `/messages/fr.json`

#### Sample Translations

| English Key | French Translation |
|-------------|-------------------|
| `workflow.header.step` | `Étape {current} sur {total}` |
| `workflow.header.exit` | `Quitter` |
| `workflow.steps.roomSelection.title` | `Sélectionnez une pièce` |
| `workflow.steps.roomSelection.subtitle` | `Choisissez l'emplacement de cet article` |
| `workflow.steps.roomSelection.searchPlaceholder` | `Rechercher des pièces...` |
| `workflow.steps.roomSelection.noRooms` | `Aucune pièce trouvée` |
| `workflow.steps.itemType.title` | `Quel type d'article ?` |
| `workflow.steps.preview.title` | `Vérifier et enregistrer` |
| `workflow.dialogs.confirmExit.title` | `Quitter le processus ?` |
| `workflow.validation.nameRequired` | `Le nom de l'article est requis` |

#### Acceptance Criteria
- [ ] All `workflow.*` keys from English are present in French
- [ ] Formal "vous" form used consistently
- [ ] French typography rules followed (spaces before punctuation)
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct
- [ ] Consistent terminology with existing `fr.json` common/auth/dashboard namespaces
- [ ] JSON syntax valid (no trailing commas, proper escaping)
- [ ] UTF-8 encoding correct for all accented characters

---

### Task 3: Generate Spanish (es) Translations

**Priority:** P1
**Estimated Effort:** 2-3 hours
**File:** `/messages/es.json`

#### Description
Add the complete `workflow` namespace with accurate Spanish translations to the Spanish locale file.

#### Translation Guidelines - Spanish Specific

| Guideline | Example |
|-----------|---------|
| Use formal "usted" form | "Seleccione" not "Selecciona" |
| Opening inverted punctuation | `¿Qué tipo de artículo?` |
| Proper accents | á, é, í, ó, ú, ñ, ü |
| ICU plural rules: one, other | `{count, plural, one {# artículo} other {# artículos}}` |

#### Steps
1. **Read** `/messages/en.json` workflow namespace completely
2. **Read** existing `/messages/es.json` to understand current structure and style
3. **Translate** each section systematically (same order as Task 2)
4. **Verify** terminology consistency with existing `es.json` translations
5. **Add** the complete `workflow` namespace to `/messages/es.json`

#### Sample Translations

| English Key | Spanish Translation |
|-------------|---------------------|
| `workflow.header.step` | `Paso {current} de {total}` |
| `workflow.header.exit` | `Salir` |
| `workflow.steps.roomSelection.title` | `Seleccione una habitación` |
| `workflow.steps.roomSelection.subtitle` | `Elija dónde se encuentra este artículo` |
| `workflow.steps.roomSelection.searchPlaceholder` | `Buscar habitaciones...` |
| `workflow.steps.roomSelection.noRooms` | `No se encontraron habitaciones` |
| `workflow.steps.itemType.title` | `¿Qué tipo de artículo?` |
| `workflow.steps.preview.title` | `Revisar y guardar` |
| `workflow.dialogs.confirmExit.title` | `¿Salir del proceso?` |
| `workflow.validation.nameRequired` | `El nombre del artículo es obligatorio` |

#### Acceptance Criteria
- [ ] All `workflow.*` keys from English are present in Spanish
- [ ] Formal "usted" form used consistently
- [ ] Inverted punctuation used where appropriate (¿, ¡)
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct
- [ ] Consistent terminology with existing `es.json` namespaces
- [ ] JSON syntax valid
- [ ] UTF-8 encoding correct for all accented characters

---

### Task 4: Generate German (de) Translations

**Priority:** P1
**Estimated Effort:** 2-3 hours
**File:** `/messages/de.json`

#### Description
Add the complete `workflow` namespace with accurate German translations to the German locale file.

#### Translation Guidelines - German Specific

| Guideline | Example |
|-----------|---------|
| Use formal "Sie" form | "Wählen Sie" not "Wähle" |
| Capitalize all nouns | `Artikel`, `Raum`, `Schritt` |
| Umlauts and ß | ä, ö, ü, ß |
| Text expansion ~30-40% | Plan for longer German text |
| ICU plural rules: one, other | `{count, plural, one {# Artikel} other {# Artikel}}` |

#### Steps
1. **Read** `/messages/en.json` workflow namespace completely
2. **Read** existing `/messages/de.json` to understand current structure and style
3. **Translate** each section systematically (same order as Task 2)
4. **Verify** terminology consistency with existing `de.json` translations
5. **Add** the complete `workflow` namespace to `/messages/de.json`

#### Sample Translations

| English Key | German Translation |
|-------------|-------------------|
| `workflow.header.step` | `Schritt {current} von {total}` |
| `workflow.header.exit` | `Beenden` |
| `workflow.steps.roomSelection.title` | `Wählen Sie einen Raum` |
| `workflow.steps.roomSelection.subtitle` | `Wählen Sie den Standort dieses Artikels` |
| `workflow.steps.roomSelection.searchPlaceholder` | `Räume suchen...` |
| `workflow.steps.roomSelection.noRooms` | `Keine Räume gefunden` |
| `workflow.steps.itemType.title` | `Welcher Artikeltyp?` |
| `workflow.steps.preview.title` | `Überprüfen und speichern` |
| `workflow.dialogs.confirmExit.title` | `Prozess beenden?` |
| `workflow.validation.nameRequired` | `Artikelname ist erforderlich` |

#### Acceptance Criteria
- [ ] All `workflow.*` keys from English are present in German
- [ ] Formal "Sie" form used consistently
- [ ] All nouns capitalized
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct
- [ ] Consistent terminology with existing `de.json` namespaces
- [ ] JSON syntax valid
- [ ] UTF-8 encoding correct for umlauts

---

### Task 5: Generate Dutch (nl) Translations

**Priority:** P1
**Estimated Effort:** 2-3 hours
**File:** `/messages/nl.json`

#### Description
Add the complete `workflow` namespace with accurate Dutch translations to the Dutch locale file.

#### Translation Guidelines - Dutch Specific

| Guideline | Example |
|-----------|---------|
| Use formal "u" form for professional context | "Selecteer" or "Kies" |
| Handle compound words appropriately | `item` (common), `kamer` |
| Text length similar to English | No significant expansion |
| ICU plural rules: one, other | `{count, plural, one {# item} other {# items}}` |

#### Steps
1. **Read** `/messages/en.json` workflow namespace completely
2. **Read** existing `/messages/nl.json` to understand current structure and style
3. **Translate** each section systematically (same order as Task 2)
4. **Verify** terminology consistency with existing `nl.json` translations
5. **Add** the complete `workflow` namespace to `/messages/nl.json`

#### Sample Translations

| English Key | Dutch Translation |
|-------------|------------------|
| `workflow.header.step` | `Stap {current} van {total}` |
| `workflow.header.exit` | `Verlaten` |
| `workflow.steps.roomSelection.title` | `Selecteer een kamer` |
| `workflow.steps.roomSelection.subtitle` | `Kies waar dit item zich bevindt` |
| `workflow.steps.roomSelection.searchPlaceholder` | `Kamers zoeken...` |
| `workflow.steps.roomSelection.noRooms` | `Geen kamers gevonden` |
| `workflow.steps.itemType.title` | `Welk type item?` |
| `workflow.steps.preview.title` | `Controleren en opslaan` |
| `workflow.dialogs.confirmExit.title` | `Proces verlaten?` |
| `workflow.validation.nameRequired` | `Itemnaam is vereist` |

#### Acceptance Criteria
- [ ] All `workflow.*` keys from English are present in Dutch
- [ ] Appropriate formality level maintained
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct
- [ ] Consistent terminology with existing `nl.json` namespaces
- [ ] JSON syntax valid
- [ ] UTF-8 encoding correct

---

### Task 6: Generate Italian (it) Translations

**Priority:** P1
**Estimated Effort:** 2-3 hours
**File:** `/messages/it.json`

#### Description
Add the complete `workflow` namespace with accurate Italian translations to the Italian locale file.

#### Translation Guidelines - Italian Specific

| Guideline | Example |
|-----------|---------|
| Use formal "Lei" form for professional context | "Selezioni" not "Seleziona" |
| Proper accents | à, è, é, ì, ò, ù |
| Text expansion ~15-25% | Slightly longer than English |
| ICU plural rules: one, other | `{count, plural, one {# articolo} other {# articoli}}` |

#### Steps
1. **Read** `/messages/en.json` workflow namespace completely
2. **Read** existing `/messages/it.json` to understand current structure and style
3. **Translate** each section systematically (same order as Task 2)
4. **Verify** terminology consistency with existing `it.json` translations
5. **Add** the complete `workflow` namespace to `/messages/it.json`

#### Sample Translations

| English Key | Italian Translation |
|-------------|---------------------|
| `workflow.header.step` | `Passo {current} di {total}` |
| `workflow.header.exit` | `Esci` |
| `workflow.steps.roomSelection.title` | `Seleziona una stanza` |
| `workflow.steps.roomSelection.subtitle` | `Scegli dove si trova questo articolo` |
| `workflow.steps.roomSelection.searchPlaceholder` | `Cerca stanze...` |
| `workflow.steps.roomSelection.noRooms` | `Nessuna stanza trovata` |
| `workflow.steps.itemType.title` | `Che tipo di articolo?` |
| `workflow.steps.preview.title` | `Rivedi e salva` |
| `workflow.dialogs.confirmExit.title` | `Uscire dal processo?` |
| `workflow.validation.nameRequired` | `Il nome dell'articolo è obbligatorio` |

#### Acceptance Criteria
- [ ] All `workflow.*` keys from English are present in Italian
- [ ] Formal tone maintained where appropriate
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct
- [ ] Consistent terminology with existing `it.json` namespaces
- [ ] JSON syntax valid
- [ ] UTF-8 encoding correct for accented characters

---

### Task 7: Verify Translation Completeness and Quality

**Priority:** P0 - Must complete after translations
**Estimated Effort:** 1-2 hours

#### Description
Comprehensive verification that all translations are complete, syntactically correct, and functionally equivalent.

#### Steps

##### 7.1 Key Count Verification
```bash
# Count workflow keys in each language file
for lang in en fr es de nl it; do
  echo "$lang: $(grep -c '"workflow\.' messages/$lang.json 2>/dev/null || echo 'namespace not found') workflow keys"
done
```

Expected: All languages should have the same key count.

##### 7.2 Structural Verification
For each language file, verify:
- [ ] `workflow` namespace exists at root level
- [ ] All sub-namespaces present: `header`, `steps`, `dialogs`, `shared`, `content`, `validation`
- [ ] All step sub-namespaces present: `roomSelection`, `itemType`, `specificItem`, `purpose`, `contentType`, `mediaCapture`, `preview`, `sessionSummary`

##### 7.3 Placeholder Verification
```bash
# Extract all placeholders from English and verify they exist in other languages
grep -o '{[^}]*}' messages/en.json | sort -u > /tmp/en_placeholders.txt

for lang in fr es de nl it; do
  grep -o '{[^}]*}' messages/$lang.json | sort -u > /tmp/${lang}_placeholders.txt
  diff /tmp/en_placeholders.txt /tmp/${lang}_placeholders.txt
done
```

##### 7.4 JSON Syntax Verification
```bash
# Validate JSON syntax for all files
for lang in en fr es de nl it; do
  python3 -m json.tool messages/$lang.json > /dev/null && echo "$lang.json: valid" || echo "$lang.json: INVALID"
done
```

##### 7.5 ICU Format Verification
Check that all pluralized strings use correct ICU format:
```
{count, plural, =0 {...} one {...} other {...}}
```

#### Acceptance Criteria
- [ ] All 6 language files have identical `workflow` namespace structure
- [ ] Key count matches across all files
- [ ] All variable placeholders preserved in all languages
- [ ] All JSON files are syntactically valid
- [ ] ICU pluralization format correct in all languages
- [ ] No untranslated English strings in non-English files

---

### Task 8: Build and Runtime Verification

**Priority:** P1
**Estimated Effort:** 1 hour

#### Description
Verify that the application builds successfully and translations render correctly at runtime.

#### Steps

##### 8.1 Build Verification
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No warnings about missing translation keys

##### 8.2 Runtime Verification
1. Start development server: `npm run dev`
2. Navigate to item creation workflow
3. For each language (fr, es, de, nl, it):
   - Switch language using language selector
   - Verify workflow step titles display correctly
   - Verify button labels display correctly
   - Verify form labels and placeholders display correctly
   - Verify dialog content displays correctly
   - Verify validation messages display in correct language

##### 8.3 Pluralization Testing
For each language, test with:
- `count = 0` - Zero items message
- `count = 1` - Singular form
- `count = 5` - Plural form

##### 8.4 Variable Interpolation Testing
Verify dynamic content like:
- Step indicators: "Step 1 of 5"
- Item names in messages: "Delete {itemName}?"
- Count displays: "{count} items selected"

#### Acceptance Criteria
- [ ] Build passes without translation-related errors
- [ ] All workflow steps display translated text in each language
- [ ] Language switching updates all visible text
- [ ] Pluralization renders correctly in all languages
- [ ] Variable interpolation works correctly
- [ ] No console warnings about missing translations

---

## Files to Modify

| File | Action | Estimated Keys Added |
|------|--------|---------------------|
| `/messages/en.json` | READ ONLY (reference) | 0 |
| `/messages/fr.json` | ADD `workflow` namespace | ~500 |
| `/messages/es.json` | ADD `workflow` namespace | ~500 |
| `/messages/de.json` | ADD `workflow` namespace | ~500 |
| `/messages/nl.json` | ADD `workflow` namespace | ~500 |
| `/messages/it.json` | ADD `workflow` namespace | ~500 |

**Total New Translation Entries:** ~2,500

---

## Terminology Consistency Reference

Maintain consistent translations with existing namespaces:

### Common Namespace Terms
| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina |
| Back | Retour | Atrás | Zurück | Terug | Indietro |
| Next | Suivant | Siguiente | Weiter | Volgende | Avanti |
| Loading... | Chargement... | Cargando... | Wird geladen... | Laden... | Caricamento... |

### Workflow-Specific Terms (establish consistency)
| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Item | Article | Artículo | Artikel | Item | Articolo |
| Room | Pièce | Habitación | Raum | Kamer | Stanza |
| Property | Propriété | Propiedad | Immobilie | Eigendom | Proprietà |
| Step | Étape | Paso | Schritt | Stap | Passo |
| Workflow | Processus | Proceso | Prozess | Werkstroom | Processo |

---

## Quality Checklist

### Per-Language Verification
For each of fr, es, de, nl, it:

- [ ] All workflow namespace keys present
- [ ] Variable placeholders preserved exactly (`{name}` not translated)
- [ ] ICU pluralization format correct
- [ ] Formal register used (vous/usted/Sie/u/Lei)
- [ ] Proper diacritics and special characters
- [ ] JSON syntax valid
- [ ] No English strings remaining
- [ ] Consistent with existing namespace translations

### Integration Verification
- [ ] `npm run build` passes
- [ ] No missing translation warnings
- [ ] Language switching works correctly
- [ ] All workflow steps render in all languages
- [ ] No layout issues from text expansion

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| English source incomplete | Medium | Critical | Task 1 verification must pass before proceeding |
| Inconsistent terminology | Medium | Medium | Reference existing translations, use terminology table |
| ICU format errors | Low | High | Verify with test cases for 0, 1, 2+ counts |
| German text overflow | Medium | Low | UI testing in German; design accounts for 40% expansion |
| JSON syntax errors | Low | High | Validate each file after editing |
| Missing placeholders | Low | High | Automated placeholder verification |

---

## Effort Summary

| Task | Estimated Effort |
|------|------------------|
| Task 1: Verify English completeness | 30 minutes |
| Task 2: French translations | 2-3 hours |
| Task 3: Spanish translations | 2-3 hours |
| Task 4: German translations | 2-3 hours |
| Task 5: Dutch translations | 2-3 hours |
| Task 6: Italian translations | 2-3 hours |
| Task 7: Verification | 1-2 hours |
| Task 8: Build/Runtime testing | 1 hour |
| **Total** | **12-18 hours** |

---

## Acceptance Criteria Mapping

| Request Criteria | Task(s) |
|------------------|---------|
| All RoomSelectionStep strings translated | Tasks 2-6 |
| All ItemTypeStep strings translated | Tasks 2-6 |
| All SpecificItemStep strings translated | Tasks 2-6 |
| All PurposeStep strings translated | Tasks 2-6 |
| All ContentTypeStep strings translated | Tasks 2-6 |
| All MediaCaptureStep strings translated | Tasks 2-6 |
| All PreviewSaveStep strings translated | Tasks 2-6 |
| All SessionSummaryStep strings translated | Tasks 2-6 |
| All shared component strings translated | Tasks 2-6 |
| All dialog strings translated | Tasks 2-6 |
| Main workflow strings translated | Tasks 2-6 |
| Consistency with common namespace | Task 7 |
| Culturally appropriate translations | Tasks 2-6 |
| Correct namespace structure | Tasks 2-7 |

---

## Related Documents

- **Overview:** `/docs/REQ-E02-068-generate-translations-for-5-non-english-languages-overview.md`
- **Requirements:** `/docs/gen_requests_epic2.md` (Request #68)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Translation Files:** `/messages/*.json`

---

## Notes

- This task is **blocked** until Tasks 2C.1-2C.12 complete English string extraction
- The workflow namespace is the **largest** in Epic 2 (~500 strings)
- AI-assisted translation is recommended due to volume
- Professional review recommended for critical user-facing strings
- German text expansion (~30-40%) should be tested for UI fit

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.13*
*Last Modified: 2026-01-20*
