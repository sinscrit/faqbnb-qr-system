# REQ-E02-068: Generate Translations for 5 Non-English Languages - Implementation Breakdown

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

## Overview

This task involves generating complete, accurate translations for all Item Creation Workflow namespace strings in five non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). The workflow namespace is the largest in Epic 2, containing approximately 500 strings across 8 step components, 5 adapter components, 25+ shared components, and multiple dialog components.

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation (next-intl setup) | Required | Must be complete - translation infrastructure operational |
| Task 2C.1 (Workflow namespace structure) | Required | English `workflow` namespace must exist in `/messages/en.json` |
| Tasks 2C.2-2C.12 | Required | All English strings must be extracted before translation |
| Task 2H.10 (Common translations) | Recommended | Common namespace translations provide reference for consistency |

### Business Impact

- **User Impact:** Non-English speaking property owners can navigate the complete item creation workflow in their native language, reducing confusion and errors during the item creation process
- **Market Expansion:** Enables FAQBNB to serve Spanish, French, German, Dutch, and Italian-speaking markets with a fully localized core feature
- **UX Improvement:** Users make faster, more confident decisions when all workflow steps, prompts, and confirmations appear in their preferred language

---

## Current State Analysis

### Translation Files Status

| Language | File Path | Current State | Workflow Namespace |
|----------|-----------|---------------|-------------------|
| English (en) | `/messages/en.json` | Exists (~133 keys) | To be added by 2C.1-2C.12 |
| French (fr) | `/messages/fr.json` | Exists (~133 keys) | **Missing** |
| Spanish (es) | `/messages/es.json` | Exists (~133 keys) | **Missing** |
| German (de) | `/messages/de.json` | Exists (~133 keys) | **Missing** |
| Dutch (nl) | `/messages/nl.json` | Exists (~133 keys) | **Missing** |
| Italian (it) | `/messages/it.json` | Exists (~133 keys) | **Missing** |

### Current Namespace Structure

Existing namespaces (from Epic 1 foundation):
- `common` - Common UI actions and labels
- `auth` - Authentication strings
- `dashboard` - Dashboard-related strings
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selection UI

**Note:** The `workflow` namespace does not yet exist in any translation file. This task depends on Tasks 2C.1-2C.12 completing the English workflow namespace extraction first.

### Supported Languages Configuration

From `/src/lib/i18n/config.ts`:
```typescript
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
```

Languages to translate (5 non-English):
- **es** - Spanish (Espanol)
- **fr** - French (Francais)
- **de** - German (Deutsch)
- **nl** - Dutch (Nederlands)
- **it** - Italian (Italiano)

---

## Workflow Namespace Structure

The `workflow` namespace (to be created by Tasks 2C.1-2C.12) will contain approximately 500 strings organized as follows:

### Expected Namespace Hierarchy

```json
{
  "workflow": {
    "header": { },           // ~10 strings - workflow header/navigation
    "steps": {
      "roomSelection": { },  // ~40 strings
      "itemType": { },       // ~40 strings
      "specificItem": { },   // ~30 strings
      "purpose": { },        // ~35 strings
      "contentType": { },    // ~40 strings
      "mediaCapture": { },   // ~45 strings
      "contentCreation": { },// ~35 strings
      "preview": { },        // ~50 strings
      "sessionSummary": { }  // ~40 strings
    },
    "dialogs": {
      "confirmExit": { },    // ~12 strings
      "emptySession": { },   // ~8 strings
      "removeItem": { },     // ~6 strings
      "pdfExport": { }       // ~15 strings
    },
    "shared": {
      "cards": { },          // ~30 strings
      "editors": { },        // ~25 strings
      "progress": { },       // ~15 strings
      "errors": { }          // ~20 strings
    },
    "content": { },          // ~20 strings
    "validation": { }        // ~15 strings
  }
}
```

### Key String Categories

| Category | Estimated Count | Examples |
|----------|-----------------|----------|
| Step titles/subtitles | ~20 | "Select a Room", "What type of item?" |
| Button labels | ~60 | "Next", "Back", "Save Item", "Continue" |
| Form labels/placeholders | ~80 | "Search rooms...", "Enter item name" |
| Instructional text | ~100 | "Choose where this item is located" |
| Confirmation messages | ~40 | "Are you sure you want to exit?" |
| Error messages | ~30 | "Please select a room", "Name required" |
| Status indicators | ~25 | "Saving...", "Processing...", "Complete" |
| Accessibility labels | ~50 | ARIA labels for buttons, dialogs |
| Pluralized strings | ~30 | "{count} items", "{count} piece(s)" |
| Dynamic content | ~40 | Variable interpolation strings |

---

## Implementation Tasks

### Task 1: Verify English Workflow Namespace Completeness

**Pre-requisite Check:** Before generating translations, verify that the English `workflow` namespace is complete in `/messages/en.json`.

**Verification Steps:**
1. Read `/messages/en.json` and confirm `workflow` namespace exists
2. Verify all expected sub-namespaces are present (header, steps, dialogs, shared, content, validation)
3. Count total keys and compare against expected ~500 strings
4. Identify any missing strings from component analysis

**Expected Structure Validation:**
```bash
# Verify workflow namespace exists and has expected structure
grep -c '"workflow"' /messages/en.json
```

---

### Task 2: Generate French (fr) Translations

**File:** `/messages/fr.json`

**Add the complete `workflow` namespace with French translations.**

**Translation Guidelines for French:**
- Use formal "vous" form consistently
- Maintain consistent terminology with existing `fr.json` translations
- Handle pluralization using ICU format with French rules
- Preserve variable placeholders exactly as in English (`{variable}`)
- Use proper French typography (spaces before `:`, `?`, `!`, `;`)

**Sample Translations:**

| English Key | French Translation |
|-------------|-------------------|
| workflow.header.step | Etape {current} sur {total} |
| workflow.header.exit | Quitter |
| workflow.header.back | Retour |
| workflow.steps.roomSelection.title | Selectionnez une piece |
| workflow.steps.roomSelection.subtitle | Choisissez l'emplacement de cet article |
| workflow.steps.roomSelection.searchPlaceholder | Rechercher des pieces... |
| workflow.steps.roomSelection.noRooms | Aucune piece trouvee |
| workflow.steps.roomSelection.addRoom | Ajouter une piece |
| workflow.steps.itemType.title | Quel type d'article ? |
| workflow.steps.itemType.subtitle | Selectionnez la categorie qui decrit le mieux votre article |
| workflow.steps.specificItem.title | Quel article specifique ? |
| workflow.steps.purpose.title | Quel est l'objectif ? |
| workflow.steps.contentType.title | Comment voulez-vous ajouter du contenu ? |
| workflow.steps.mediaCapture.title | Capturer le contenu |
| workflow.steps.preview.title | Verifier et enregistrer |
| workflow.steps.sessionSummary.title | Session terminee ! |
| workflow.dialogs.confirmExit.title | Quitter le processus ? |
| workflow.dialogs.removeItem.title | Supprimer l'article ? |
| workflow.validation.nameRequired | Le nom de l'article est requis |

---

### Task 3: Generate Spanish (es) Translations

**File:** `/messages/es.json`

**Add the complete `workflow` namespace with Spanish translations.**

**Translation Guidelines for Spanish:**
- Use formal "usted" form for user-facing text
- Handle accents and special characters properly (a, e, i, o, u, n)
- Maintain consistency with existing `es.json` translations
- Use ICU format for pluralization with Spanish rules
- Preserve opening inverted punctuation (¿, ¡)

**Sample Translations:**

| English Key | Spanish Translation |
|-------------|---------------------|
| workflow.header.step | Paso {current} de {total} |
| workflow.header.exit | Salir |
| workflow.header.back | Atras |
| workflow.steps.roomSelection.title | Seleccione una habitacion |
| workflow.steps.roomSelection.subtitle | Elija donde se encuentra este articulo |
| workflow.steps.roomSelection.searchPlaceholder | Buscar habitaciones... |
| workflow.steps.roomSelection.noRooms | No se encontraron habitaciones |
| workflow.steps.roomSelection.addRoom | Agregar habitacion |
| workflow.steps.itemType.title | ¿Que tipo de articulo? |
| workflow.steps.itemType.subtitle | Seleccione la categoria que mejor describe su articulo |
| workflow.steps.specificItem.title | ¿Que articulo especifico? |
| workflow.steps.purpose.title | ¿Cual es el proposito? |
| workflow.steps.contentType.title | ¿Como desea agregar contenido? |
| workflow.steps.mediaCapture.title | Capturar contenido |
| workflow.steps.preview.title | Revisar y guardar |
| workflow.steps.sessionSummary.title | ¡Sesion completada! |
| workflow.dialogs.confirmExit.title | ¿Salir del proceso? |
| workflow.dialogs.removeItem.title | ¿Eliminar articulo? |
| workflow.validation.nameRequired | El nombre del articulo es obligatorio |

---

### Task 4: Generate German (de) Translations

**File:** `/messages/de.json`

**Add the complete `workflow` namespace with German translations.**

**Translation Guidelines for German:**
- Use formal "Sie" form consistently
- Capitalize all nouns
- Handle umlauts properly (a, o, u, ss)
- Maintain consistency with existing `de.json` translations
- Use ICU format for pluralization with German rules
- Note: German text typically expands 30-40% compared to English

**Sample Translations:**

| English Key | German Translation |
|-------------|-------------------|
| workflow.header.step | Schritt {current} von {total} |
| workflow.header.exit | Beenden |
| workflow.header.back | Zuruck |
| workflow.steps.roomSelection.title | Wahlen Sie einen Raum |
| workflow.steps.roomSelection.subtitle | Wahlen Sie den Standort dieses Artikels |
| workflow.steps.roomSelection.searchPlaceholder | Raume suchen... |
| workflow.steps.roomSelection.noRooms | Keine Raume gefunden |
| workflow.steps.roomSelection.addRoom | Raum hinzufugen |
| workflow.steps.itemType.title | Welcher Artikeltyp? |
| workflow.steps.itemType.subtitle | Wahlen Sie die Kategorie, die Ihren Artikel am besten beschreibt |
| workflow.steps.specificItem.title | Welcher spezifische Artikel? |
| workflow.steps.purpose.title | Was ist der Zweck? |
| workflow.steps.contentType.title | Wie mochten Sie Inhalte hinzufugen? |
| workflow.steps.mediaCapture.title | Inhalte erfassen |
| workflow.steps.preview.title | Uberprufen und speichern |
| workflow.steps.sessionSummary.title | Sitzung abgeschlossen! |
| workflow.dialogs.confirmExit.title | Workflow beenden? |
| workflow.dialogs.removeItem.title | Artikel entfernen? |
| workflow.validation.nameRequired | Artikelname ist erforderlich |

---

### Task 5: Generate Dutch (nl) Translations

**File:** `/messages/nl.json`

**Add the complete `workflow` namespace with Dutch translations.**

**Translation Guidelines for Dutch:**
- Use formal "u" form for professional context
- Maintain consistency with existing `nl.json` translations
- Use ICU format for pluralization with Dutch rules
- Handle compound words appropriately
- Note: Dutch text length is similar to English

**Sample Translations:**

| English Key | Dutch Translation |
|-------------|------------------|
| workflow.header.step | Stap {current} van {total} |
| workflow.header.exit | Verlaten |
| workflow.header.back | Terug |
| workflow.steps.roomSelection.title | Selecteer een kamer |
| workflow.steps.roomSelection.subtitle | Kies waar dit item zich bevindt |
| workflow.steps.roomSelection.searchPlaceholder | Kamers zoeken... |
| workflow.steps.roomSelection.noRooms | Geen kamers gevonden |
| workflow.steps.roomSelection.addRoom | Kamer toevoegen |
| workflow.steps.itemType.title | Welk type item? |
| workflow.steps.itemType.subtitle | Selecteer de categorie die uw item het beste beschrijft |
| workflow.steps.specificItem.title | Welk specifiek item? |
| workflow.steps.purpose.title | Wat is het doel? |
| workflow.steps.contentType.title | Hoe wilt u inhoud toevoegen? |
| workflow.steps.mediaCapture.title | Inhoud vastleggen |
| workflow.steps.preview.title | Controleren en opslaan |
| workflow.steps.sessionSummary.title | Sessie voltooid! |
| workflow.dialogs.confirmExit.title | Werkstroom verlaten? |
| workflow.dialogs.removeItem.title | Item verwijderen? |
| workflow.validation.nameRequired | Itemnaam is vereist |

---

### Task 6: Generate Italian (it) Translations

**File:** `/messages/it.json`

**Add the complete `workflow` namespace with Italian translations.**

**Translation Guidelines for Italian:**
- Use formal "Lei" form for professional context
- Handle accents properly (a, e, i, o, u)
- Maintain consistency with existing `it.json` translations
- Use ICU format for pluralization with Italian rules
- Note: Italian text typically expands 15-25% compared to English

**Sample Translations:**

| English Key | Italian Translation |
|-------------|---------------------|
| workflow.header.step | Passo {current} di {total} |
| workflow.header.exit | Esci |
| workflow.header.back | Indietro |
| workflow.steps.roomSelection.title | Seleziona una stanza |
| workflow.steps.roomSelection.subtitle | Scegli dove si trova questo articolo |
| workflow.steps.roomSelection.searchPlaceholder | Cerca stanze... |
| workflow.steps.roomSelection.noRooms | Nessuna stanza trovata |
| workflow.steps.roomSelection.addRoom | Aggiungi stanza |
| workflow.steps.itemType.title | Che tipo di articolo? |
| workflow.steps.itemType.subtitle | Seleziona la categoria che meglio descrive il tuo articolo |
| workflow.steps.specificItem.title | Quale articolo specifico? |
| workflow.steps.purpose.title | Qual e lo scopo? |
| workflow.steps.contentType.title | Come vuoi aggiungere contenuti? |
| workflow.steps.mediaCapture.title | Cattura contenuti |
| workflow.steps.preview.title | Rivedi e salva |
| workflow.steps.sessionSummary.title | Sessione completata! |
| workflow.dialogs.confirmExit.title | Uscire dal processo? |
| workflow.dialogs.removeItem.title | Rimuovere articolo? |
| workflow.validation.nameRequired | Il nome dell'articolo e obbligatorio |

---

### Task 7: Verify Translation Completeness

**Verification Script:**

Create and run a verification script to ensure all keys are present:

```bash
# Count keys in each language file
for lang in en fr es de nl it; do
  echo "$lang: $(grep -c '"workflow\.' messages/$lang.json) workflow keys"
done

# Check for missing keys
npm run i18n:check
```

**Manual Verification:**
1. Compare key structure between `en.json` and each translated file
2. Verify all `{variable}` placeholders are preserved exactly
3. Check ICU pluralization format is correct in all languages
4. Validate no keys are missing or extra

---

## Authorized Files and Functions for Modification

### Translation Files

| File Path | Action | Scope |
|-----------|--------|-------|
| `/messages/en.json` | READ (reference only) | Verify `workflow` namespace exists |
| `/messages/fr.json` | ADD | Add complete `workflow` namespace (~500 keys) |
| `/messages/es.json` | ADD | Add complete `workflow` namespace (~500 keys) |
| `/messages/de.json` | ADD | Add complete `workflow` namespace (~500 keys) |
| `/messages/nl.json` | ADD | Add complete `workflow` namespace (~500 keys) |
| `/messages/it.json` | ADD | Add complete `workflow` namespace (~500 keys) |

### DO NOT Modify

- `/src/lib/i18n/config.ts` - Language configuration already supports all 6 languages
- Any component files - This task is translation-only, no code changes
- `/messages/en.json` - Source of truth, do not modify (only read)

---

## Translation Quality Guidelines

### Consistency Requirements

1. **Terminology Consistency:** Use the same term for the same concept throughout:
   - "item" -> consistent translation per language (article/articulo/Artikel/item/articolo)
   - "room" -> consistent translation (piece/habitacion/Raum/kamer/stanza)
   - "workflow" -> consistent translation or keep English if common usage

2. **Reference Existing Translations:** Use the same terms as already translated in:
   - `common` namespace for shared actions (save, cancel, delete, etc.)
   - `items` namespace for item-related terms
   - `errors` namespace for error messages

### Pluralization Format (ICU)

All plural strings MUST use ICU MessageFormat:

```json
{
  "itemCount": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}"
}
```

**Language-specific plural rules:**
- **fr:** one, other (1 article, 2 articles)
- **es:** one, other (1 articulo, 2 articulos)
- **de:** one, other (1 Artikel, 2 Artikel)
- **nl:** one, other (1 item, 2 items)
- **it:** one, other (1 articolo, 2 articoli)

### Variable Interpolation

Preserve all variables exactly:
```json
{
  "welcomeMessage": "Welcome, {userName}!",
  "welcomeMessage_fr": "Bienvenue, {userName} !"
}
```

### Special Characters

Handle language-specific typography:
- **fr:** Space before `:`, `?`, `!`, `;` (Question ?)
- **es:** Opening punctuation (¿Pregunta?, ¡Exito!)
- **de:** Capitalize nouns (der Artikel, der Raum)

---

## Verification Checklist

### Per-Language Verification

For each language file (fr, es, de, nl, it), verify:

- [ ] `workflow` namespace exists at root level
- [ ] All sub-namespaces present (header, steps, dialogs, shared, content, validation)
- [ ] Key count matches English source (~500 keys)
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct for language
- [ ] No untranslated English strings remain
- [ ] JSON syntax valid (no trailing commas, proper escaping)
- [ ] Consistent terminology with existing translations
- [ ] Special characters properly encoded (UTF-8)

### Integration Verification

- [ ] `npm run build` completes without errors
- [ ] No console warnings about missing translation keys
- [ ] Language switching displays workflow translations correctly
- [ ] All workflow steps render in each language without errors
- [ ] Pluralization works correctly (test with 0, 1, 2+ items)
- [ ] Variable interpolation displays correctly

### Visual Verification

For each language, verify in browser:

- [ ] Workflow step titles display correctly
- [ ] Button text fits without truncation
- [ ] Form labels and placeholders display correctly
- [ ] Dialog content renders properly
- [ ] Error messages display in correct language
- [ ] No text overflow in any UI elements

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| All workflow namespace strings translated to Spanish | Task 3 |
| All workflow namespace strings translated to French | Task 2 |
| All workflow namespace strings translated to German | Task 4 |
| All workflow namespace strings translated to Dutch | Task 5 |
| All workflow namespace strings translated to Italian | Task 6 |
| Complete, accurate translations for all strings | Tasks 2-6, verification |
| Users experience entire item creation in preferred language | All tasks |
| No missing translation keys in any language | Task 7 |
| Pluralization works correctly in all languages | Tasks 2-6 (ICU format) |
| Variable interpolation works in all languages | Tasks 2-6 (preserve placeholders) |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| English source incomplete | Medium | Critical | Block translation until 2C.1-2C.12 complete |
| Translation quality issues | Medium | Medium | Use AI translation with domain context, review critical strings |
| Missing keys in some languages | Low | Medium | Automated key comparison script |
| ICU format errors | Low | High | Test pluralization with 0, 1, 2+ values |
| Text expansion breaks layout | Medium | Low | Visual testing in all languages |
| Inconsistent terminology | Medium | Low | Reference existing translations, maintain glossary |

---

## Estimated Effort

| Task | Estimated Strings | Effort |
|------|-------------------|--------|
| Task 1: Verify English completeness | N/A | 0.5 hour |
| Task 2: French translations | ~500 | 2-3 hours |
| Task 3: Spanish translations | ~500 | 2-3 hours |
| Task 4: German translations | ~500 | 2-3 hours |
| Task 5: Dutch translations | ~500 | 2-3 hours |
| Task 6: Italian translations | ~500 | 2-3 hours |
| Task 7: Verification | N/A | 1-2 hours |
| **Total** | **~2,500 entries** | **12-18 hours** |

**Notes:**
- AI-assisted translation can significantly reduce time
- Human review recommended for critical user-facing strings
- Visual verification adds time but ensures quality

---

## Test Cases

### Translation Key Completeness Tests

1. Count `workflow.*` keys in each language file equals English count
2. No `workflow.*` key in English missing from any other language
3. No extra keys in translated files not present in English

### Pluralization Tests

For each language, test:
1. `{count: 0}` renders "no items" equivalent
2. `{count: 1}` renders singular form
3. `{count: 5}` renders plural form

### Variable Interpolation Tests

1. `{itemName}` displays correctly in all messages
2. `{count}` displays correct number
3. `{current}` and `{total}` display in step indicator

### Language Switching Tests

1. Switch language mid-workflow, verify all text updates
2. Complete workflow in each language without errors
3. Error messages display in correct language

---

## Notes

- This task should NOT start until Tasks 2C.1-2C.12 are complete (English extraction)
- The workflow namespace is the largest in Epic 2 (~500 strings)
- Consistency with existing translations (common, items, errors namespaces) is critical
- AI-assisted translation recommended due to volume
- Professional review may be needed for customer-facing critical strings
- Text expansion (especially German at 30-40%) should be considered for UI testing

---

## Related Tasks

- **Task 2C.1 (REQ-E02-056):** Create `workflow` namespace structure - PREREQUISITE
- **Tasks 2C.2-2C.12:** Extract English strings from all workflow components - PREREQUISITE
- **Task 2H.10:** Generate translations for common namespace - Reference for consistency
- **Task 2C.14 (if exists):** Test complete workflow in each language - FOLLOW-UP

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.13*
