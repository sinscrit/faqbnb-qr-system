# REQ-E02-075: Generate Translations for Articles Namespace (5 Non-English Languages) - Implementation Breakdown

**Generated:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-075
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.6
**Type:** NEW FEATURE
**Size:** L (Large)
**Estimated Strings:** ~300 (articles namespace)

---

## Overview

This task involves generating complete, accurate translations for all Article & Content Management namespace strings in five non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). The articles namespace contains approximately 300 strings covering editor components, media handling, crop/trim utilities, content viewers, and instructions pages.

**Note:** The request mentions Portuguese, but per the project's i18n configuration (`/src/lib/i18n/config.ts`), the supported non-English languages are French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This document follows the established project configuration.

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation (next-intl setup) | Required | Translation infrastructure must be operational |
| Task 2E.1 (Articles namespace structure) | Required | English `articles` namespace must exist in `/messages/en.json` |
| Tasks 2E.2-2E.5 | Required | All English strings must be extracted before translation |
| Task 2H.10 (Common translations) | Recommended | Common namespace translations provide reference for consistency |

### Business Impact

- **User Impact:** Non-English speaking property owners can create, edit, and manage articles and content in their native language, eliminating confusion when working with the markdown editor, image cropper, video trimmer, and content viewers
- **Market Expansion:** Enables FAQBNB to serve Spanish, French, German, Dutch, and Italian-speaking markets with a fully localized article management feature
- **UX Improvement:** Users complete content editing tasks more efficiently when all editor tools, prompts, and validation messages appear in their preferred language

---

## Current State Analysis

### Translation Files Status

| Language | File Path | Current State | Articles Namespace |
|----------|-----------|---------------|-------------------|
| English (en) | `/messages/en.json` | Exists (~133 keys) | To be added by 2E.1-2E.5 |
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

**Note:** The `articles` namespace does not yet exist in any translation file. This task depends on Tasks 2E.1-2E.5 completing the English articles namespace extraction first.

### Supported Languages Configuration

From `/src/lib/i18n/config.ts`:
```typescript
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
```

Languages to translate (5 non-English):
- **es** - Spanish (Español)
- **fr** - French (Français)
- **de** - German (Deutsch)
- **nl** - Dutch (Nederlands)
- **it** - Italian (Italiano)

---

## Articles Namespace Structure

The `articles` namespace (to be created by Tasks 2E.1-2E.5) will contain approximately 300 strings organized as follows:

### Expected Namespace Hierarchy

```json
{
  "articles": {
    "title": "",              // Page title
    "subtitle": "",           // Page subtitle
    "list": { },              // ~15 strings - List/table view
    "grid": { },              // ~5 strings - Grid view
    "card": { },              // ~12 strings - Article card
    "toolbar": { },           // ~10 strings - Toolbar UI
    "columns": { },           // ~8 strings - Table columns
    "sort": { },              // ~10 strings - Sort options
    "filters": { },           // ~12 strings - Filter options
    "editor": { },            // ~35 strings - Markdown editor
    "media": { },             // ~18 strings - Media upload
    "crop": { },              // ~22 strings - Image cropper
    "video": { },             // ~14 strings - Video trimmer
    "rotate": { },            // ~10 strings - Image rotator
    "assets": { },            // ~25 strings - Asset panel
    "viewer": { },            // ~35 strings - Content viewers
    "purposes": { },          // ~8 strings - Purpose types
    "status": { },            // ~5 strings - Status indicators
    "actions": { },           // ~18 strings - Action buttons
    "empty": { },             // ~8 strings - Empty states
    "loading": { },           // ~6 strings - Loading states
    "validation": { },        // ~6 strings - Validation messages
    "errors": { },            // ~8 strings - Error messages
    "success": { },           // ~6 strings - Success messages
    "auth": { }               // ~4 strings - Auth messages
  }
}
```

### Key String Categories

| Category | Estimated Count | Examples |
|----------|-----------------|----------|
| Page titles/subtitles | ~10 | "Guides", "Manage guide articles" |
| Editor controls | ~35 | "Bold", "Italic", "Heading", "Insert Link" |
| Media handling | ~20 | "Upload Media", "Drag and drop files here" |
| Crop/trim tools | ~36 | "Crop Image", "Trim Video", "Apply Crop" |
| Asset management | ~25 | "Assets", "Add Asset", "Remove Asset?" |
| Content viewers | ~35 | "Gallery", "Previous", "Next", "Page 1 of 10" |
| List/table UI | ~30 | Column headers, sort options, filters |
| Action buttons | ~18 | "Edit", "Delete", "Save Changes", "Preview" |
| Status/feedback | ~25 | "Saving...", "Success", "Error" messages |
| Validation/errors | ~20 | "Title required", "Failed to save guide" |

---

## Implementation Tasks

### Task 1: Verify English Articles Namespace Completeness

**Pre-requisite Check:** Before generating translations, verify that the English `articles` namespace is complete in `/messages/en.json`.

**Verification Steps:**
1. Read `/messages/en.json` and confirm `articles` namespace exists
2. Verify all expected sub-namespaces are present (list, editor, media, crop, video, assets, viewer, etc.)
3. Count total keys and compare against expected ~300 strings
4. Identify any missing strings from component analysis

**Expected Structure Validation:**
```bash
# Verify articles namespace exists and has expected structure
grep -c '"articles"' messages/en.json
```

---

### Task 2: Generate French (fr) Translations

**File:** `/messages/fr.json`

**Add the complete `articles` namespace with French translations.**

**Translation Guidelines for French:**
- Use formal "vous" form consistently
- Maintain consistent terminology with existing `fr.json` translations
- Handle pluralization using ICU format with French rules
- Preserve variable placeholders exactly as in English (`{variable}`)
- Use proper French typography (spaces before `:`, `?`, `!`, `;`)

**Sample Translations:**

| English Key | French Translation |
|-------------|-------------------|
| articles.title | Guides |
| articles.subtitle | Gérer les articles de guide pour vos articles |
| articles.list.title | Guides |
| articles.list.noGuides | Aucun guide disponible |
| articles.list.noResults | Aucun guide ne correspond à votre recherche |
| articles.editor.title | Modifier le contenu |
| articles.editor.tabs.editor | Éditeur |
| articles.editor.tabs.preview | Aperçu |
| articles.editor.toolbar.bold | Gras |
| articles.editor.toolbar.italic | Italique |
| articles.editor.placeholder | Rédigez votre contenu ici en utilisant le format markdown... |
| articles.media.upload | Téléverser des médias |
| articles.media.dragDrop | Glissez et déposez les fichiers ici |
| articles.media.browse | Parcourir les fichiers |
| articles.crop.title | Recadrer l'image |
| articles.crop.aspectRatio | Rapport d'aspect |
| articles.crop.applyCrop | Appliquer le recadrage |
| articles.video.title | Découper la vidéo |
| articles.video.startTime | Heure de début |
| articles.video.endTime | Heure de fin |
| articles.assets.title | Ressources |
| articles.assets.addAsset | Ajouter une ressource |
| articles.viewer.gallery.title | Galerie |
| articles.viewer.gallery.previous | Précédent |
| articles.viewer.gallery.next | Suivant |
| articles.purposes.howToUse | Comment utiliser |
| articles.purposes.troubleshooting | Dépannage |
| articles.empty.title | Pas encore de guides |
| articles.loading.guides | Chargement des guides... |
| articles.validation.titleRequired | Le titre du guide est requis |
| articles.success.saved | Guide enregistré avec succès |

---

### Task 3: Generate Spanish (es) Translations

**File:** `/messages/es.json`

**Add the complete `articles` namespace with Spanish translations.**

**Translation Guidelines for Spanish:**
- Use formal "usted" form for user-facing text
- Handle accents and special characters properly (á, é, í, ó, ú, ñ)
- Maintain consistency with existing `es.json` translations
- Use ICU format for pluralization with Spanish rules
- Preserve opening inverted punctuation (¿, ¡)

**Sample Translations:**

| English Key | Spanish Translation |
|-------------|---------------------|
| articles.title | Guías |
| articles.subtitle | Administrar artículos de guía para sus artículos |
| articles.list.title | Guías |
| articles.list.noGuides | No hay guías disponibles |
| articles.list.noResults | Ninguna guía coincide con su búsqueda |
| articles.editor.title | Editar contenido |
| articles.editor.tabs.editor | Editor |
| articles.editor.tabs.preview | Vista previa |
| articles.editor.toolbar.bold | Negrita |
| articles.editor.toolbar.italic | Cursiva |
| articles.editor.placeholder | Escriba su contenido aquí usando formato markdown... |
| articles.media.upload | Subir medios |
| articles.media.dragDrop | Arrastre y suelte los archivos aquí |
| articles.media.browse | Explorar archivos |
| articles.crop.title | Recortar imagen |
| articles.crop.aspectRatio | Relación de aspecto |
| articles.crop.applyCrop | Aplicar recorte |
| articles.video.title | Recortar video |
| articles.video.startTime | Hora de inicio |
| articles.video.endTime | Hora de fin |
| articles.assets.title | Recursos |
| articles.assets.addAsset | Agregar recurso |
| articles.viewer.gallery.title | Galería |
| articles.viewer.gallery.previous | Anterior |
| articles.viewer.gallery.next | Siguiente |
| articles.purposes.howToUse | Cómo usar |
| articles.purposes.troubleshooting | Solución de problemas |
| articles.empty.title | Aún no hay guías |
| articles.loading.guides | Cargando guías... |
| articles.validation.titleRequired | El título de la guía es obligatorio |
| articles.success.saved | Guía guardada exitosamente |

---

### Task 4: Generate German (de) Translations

**File:** `/messages/de.json`

**Add the complete `articles` namespace with German translations.**

**Translation Guidelines for German:**
- Use formal "Sie" form consistently
- Capitalize all nouns
- Handle umlauts properly (ä, ö, ü, ß)
- Maintain consistency with existing `de.json` translations
- Use ICU format for pluralization with German rules
- Note: German text typically expands 30-40% compared to English

**Sample Translations:**

| English Key | German Translation |
|-------------|-------------------|
| articles.title | Anleitungen |
| articles.subtitle | Anleitungsartikel für Ihre Artikel verwalten |
| articles.list.title | Anleitungen |
| articles.list.noGuides | Keine Anleitungen verfügbar |
| articles.list.noResults | Keine Anleitungen entsprechen Ihrer Suche |
| articles.editor.title | Inhalt bearbeiten |
| articles.editor.tabs.editor | Editor |
| articles.editor.tabs.preview | Vorschau |
| articles.editor.toolbar.bold | Fett |
| articles.editor.toolbar.italic | Kursiv |
| articles.editor.placeholder | Schreiben Sie Ihren Inhalt hier im Markdown-Format... |
| articles.media.upload | Medien hochladen |
| articles.media.dragDrop | Dateien hierher ziehen und ablegen |
| articles.media.browse | Dateien durchsuchen |
| articles.crop.title | Bild zuschneiden |
| articles.crop.aspectRatio | Seitenverhältnis |
| articles.crop.applyCrop | Zuschnitt anwenden |
| articles.video.title | Video trimmen |
| articles.video.startTime | Startzeit |
| articles.video.endTime | Endzeit |
| articles.assets.title | Ressourcen |
| articles.assets.addAsset | Ressource hinzufügen |
| articles.viewer.gallery.title | Galerie |
| articles.viewer.gallery.previous | Vorherige |
| articles.viewer.gallery.next | Nächste |
| articles.purposes.howToUse | Bedienungsanleitung |
| articles.purposes.troubleshooting | Fehlerbehebung |
| articles.empty.title | Noch keine Anleitungen |
| articles.loading.guides | Anleitungen werden geladen... |
| articles.validation.titleRequired | Der Anleitungstitel ist erforderlich |
| articles.success.saved | Anleitung erfolgreich gespeichert |

---

### Task 5: Generate Dutch (nl) Translations

**File:** `/messages/nl.json`

**Add the complete `articles` namespace with Dutch translations.**

**Translation Guidelines for Dutch:**
- Use formal "u" form for professional context
- Maintain consistency with existing `nl.json` translations
- Use ICU format for pluralization with Dutch rules
- Handle compound words appropriately
- Note: Dutch text length is similar to English

**Sample Translations:**

| English Key | Dutch Translation |
|-------------|------------------|
| articles.title | Handleidingen |
| articles.subtitle | Beheer handleidingsartikelen voor uw items |
| articles.list.title | Handleidingen |
| articles.list.noGuides | Geen handleidingen beschikbaar |
| articles.list.noResults | Geen handleidingen komen overeen met uw zoekopdracht |
| articles.editor.title | Inhoud bewerken |
| articles.editor.tabs.editor | Editor |
| articles.editor.tabs.preview | Voorbeeld |
| articles.editor.toolbar.bold | Vet |
| articles.editor.toolbar.italic | Cursief |
| articles.editor.placeholder | Schrijf uw inhoud hier met markdown-opmaak... |
| articles.media.upload | Media uploaden |
| articles.media.dragDrop | Sleep bestanden hierheen |
| articles.media.browse | Bestanden bladeren |
| articles.crop.title | Afbeelding bijsnijden |
| articles.crop.aspectRatio | Beeldverhouding |
| articles.crop.applyCrop | Bijsnijden toepassen |
| articles.video.title | Video bijsnijden |
| articles.video.startTime | Starttijd |
| articles.video.endTime | Eindtijd |
| articles.assets.title | Bronnen |
| articles.assets.addAsset | Bron toevoegen |
| articles.viewer.gallery.title | Galerij |
| articles.viewer.gallery.previous | Vorige |
| articles.viewer.gallery.next | Volgende |
| articles.purposes.howToUse | Gebruiksaanwijzing |
| articles.purposes.troubleshooting | Probleemoplossing |
| articles.empty.title | Nog geen handleidingen |
| articles.loading.guides | Handleidingen laden... |
| articles.validation.titleRequired | Handleidingtitel is vereist |
| articles.success.saved | Handleiding succesvol opgeslagen |

---

### Task 6: Generate Italian (it) Translations

**File:** `/messages/it.json`

**Add the complete `articles` namespace with Italian translations.**

**Translation Guidelines for Italian:**
- Use formal "Lei" form for professional context
- Handle accents properly (à, è, é, ì, ò, ù)
- Maintain consistency with existing `it.json` translations
- Use ICU format for pluralization with Italian rules
- Note: Italian text typically expands 15-25% compared to English

**Sample Translations:**

| English Key | Italian Translation |
|-------------|---------------------|
| articles.title | Guide |
| articles.subtitle | Gestisci gli articoli guida per i tuoi articoli |
| articles.list.title | Guide |
| articles.list.noGuides | Nessuna guida disponibile |
| articles.list.noResults | Nessuna guida corrisponde alla tua ricerca |
| articles.editor.title | Modifica contenuto |
| articles.editor.tabs.editor | Editor |
| articles.editor.tabs.preview | Anteprima |
| articles.editor.toolbar.bold | Grassetto |
| articles.editor.toolbar.italic | Corsivo |
| articles.editor.placeholder | Scrivi il tuo contenuto qui usando la formattazione markdown... |
| articles.media.upload | Carica media |
| articles.media.dragDrop | Trascina e rilascia i file qui |
| articles.media.browse | Sfoglia file |
| articles.crop.title | Ritaglia immagine |
| articles.crop.aspectRatio | Rapporto d'aspetto |
| articles.crop.applyCrop | Applica ritaglio |
| articles.video.title | Taglia video |
| articles.video.startTime | Ora di inizio |
| articles.video.endTime | Ora di fine |
| articles.assets.title | Risorse |
| articles.assets.addAsset | Aggiungi risorsa |
| articles.viewer.gallery.title | Galleria |
| articles.viewer.gallery.previous | Precedente |
| articles.viewer.gallery.next | Successivo |
| articles.purposes.howToUse | Come usare |
| articles.purposes.troubleshooting | Risoluzione dei problemi |
| articles.empty.title | Ancora nessuna guida |
| articles.loading.guides | Caricamento guide... |
| articles.validation.titleRequired | Il titolo della guida è obbligatorio |
| articles.success.saved | Guida salvata con successo |

---

### Task 7: Verify Translation Completeness

**Verification Script:**

Create and run a verification script to ensure all keys are present:

```bash
# Count keys in each language file
for lang in en fr es de nl it; do
  echo "$lang: $(grep -c '"articles\.' messages/$lang.json) articles keys"
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
| `/messages/en.json` | READ (reference only) | Verify `articles` namespace exists |
| `/messages/fr.json` | ADD | Add complete `articles` namespace (~300 keys) |
| `/messages/es.json` | ADD | Add complete `articles` namespace (~300 keys) |
| `/messages/de.json` | ADD | Add complete `articles` namespace (~300 keys) |
| `/messages/nl.json` | ADD | Add complete `articles` namespace (~300 keys) |
| `/messages/it.json` | ADD | Add complete `articles` namespace (~300 keys) |

### DO NOT Modify

- `/src/lib/i18n/config.ts` - Language configuration already supports all 6 languages
- Any component files - This task is translation-only, no code changes
- `/messages/en.json` - Source of truth, do not modify (only read)

---

## Translation Quality Guidelines

### Consistency Requirements

1. **Terminology Consistency:** Use the same term for the same concept throughout:
   - "guide" -> consistent translation per language (guide/guía/Anleitung/handleiding/guida)
   - "asset" -> consistent translation (ressource/recurso/Ressource/bron/risorsa)
   - "crop" -> consistent translation (recadrer/recortar/zuschneiden/bijsnijden/ritagliare)

2. **Reference Existing Translations:** Use the same terms as already translated in:
   - `common` namespace for shared actions (save, cancel, delete, etc.)
   - `items` namespace for item-related terms
   - `errors` namespace for error messages

### Pluralization Format (ICU)

All plural strings MUST use ICU MessageFormat:

```json
{
  "guideCount": "{count, plural, =0 {Aucun guide} one {# guide} other {# guides}}"
}
```

**Language-specific plural rules:**
- **fr:** one, other (1 guide, 2 guides)
- **es:** one, other (1 guía, 2 guías)
- **de:** one, other (1 Anleitung, 2 Anleitungen)
- **nl:** one, other (1 handleiding, 2 handleidingen)
- **it:** one, other (1 guida, 2 guide)

### Variable Interpolation

Preserve all variables exactly:
```json
{
  "characterCount": "{current} / {max} characters",
  "characterCount_fr": "{current} / {max} caractères"
}
```

### Special Characters

Handle language-specific typography:
- **fr:** Space before `:`, `?`, `!`, `;` (Aperçu :)
- **es:** Opening punctuation (¿Pregunta?, ¡Éxito!)
- **de:** Capitalize nouns (die Anleitung, der Editor)

---

## Verification Checklist

### Per-Language Verification

For each language file (fr, es, de, nl, it), verify:

- [ ] `articles` namespace exists at root level
- [ ] All sub-namespaces present (list, editor, media, crop, video, assets, viewer, purposes, etc.)
- [ ] Key count matches English source (~300 keys)
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization format correct for language
- [ ] No untranslated English strings remain
- [ ] JSON syntax valid (no trailing commas, proper escaping)
- [ ] Consistent terminology with existing translations
- [ ] Special characters properly encoded (UTF-8)

### Integration Verification

- [ ] `npm run build` completes without errors
- [ ] No console warnings about missing translation keys
- [ ] Language switching displays articles translations correctly
- [ ] All article editing features render in each language without errors
- [ ] Pluralization works correctly (test with 0, 1, 2+ items)
- [ ] Variable interpolation displays correctly

### Visual Verification

For each language, verify in browser:

- [ ] Article list page displays correctly
- [ ] Markdown editor toolbar labels display correctly
- [ ] Image cropper dialog renders properly
- [ ] Video trimmer dialog renders properly
- [ ] Asset panel displays correctly
- [ ] Content viewers show correct translations
- [ ] Button text fits without truncation
- [ ] No text overflow in any UI elements

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Spanish translation file contains all articles namespace strings | Task 3 |
| French translation file contains all articles namespace strings | Task 2 |
| German translation file contains all articles namespace strings | Task 4 |
| Dutch translation file contains all articles namespace strings (Note: Request said Portuguese but project uses Dutch) | Task 5 |
| Italian translation file contains all articles namespace strings | Task 6 |
| All editor component strings translated correctly | Tasks 2-6 |
| All media handling component strings translated correctly | Tasks 2-6 |
| All crop/trim utility strings translated correctly | Tasks 2-6 |
| All instructions page strings translated correctly | Tasks 2-6 |
| Translation files follow same structure as English | Task 7 |
| No placeholder or untranslated English text remains | Task 7 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| English source incomplete | Medium | Critical | Block translation until 2E.1-2E.5 complete |
| Translation quality issues | Medium | Medium | Use AI translation with domain context, review critical strings |
| Missing keys in some languages | Low | Medium | Automated key comparison script |
| ICU format errors | Low | High | Test pluralization with 0, 1, 2+ values |
| Text expansion breaks layout | Medium | Low | Visual testing in all languages |
| Inconsistent terminology | Medium | Low | Reference existing translations, maintain glossary |
| Request says Portuguese but project uses Dutch | N/A | N/A | Follow project config (Dutch nl), document discrepancy |

---

## Estimated Effort

| Task | Estimated Strings | Effort |
|------|-------------------|--------|
| Task 1: Verify English completeness | N/A | 0.5 hour |
| Task 2: French translations | ~300 | 1.5-2 hours |
| Task 3: Spanish translations | ~300 | 1.5-2 hours |
| Task 4: German translations | ~300 | 1.5-2 hours |
| Task 5: Dutch translations | ~300 | 1.5-2 hours |
| Task 6: Italian translations | ~300 | 1.5-2 hours |
| Task 7: Verification | N/A | 1 hour |
| **Total** | **~1,500 entries** | **9-13 hours** |

**Notes:**
- AI-assisted translation can significantly reduce time
- Human review recommended for critical user-facing strings
- Visual verification adds time but ensures quality

---

## Test Cases

### Translation Key Completeness Tests

1. Count `articles.*` keys in each language file equals English count
2. No `articles.*` key in English missing from any other language
3. No extra keys in translated files not present in English

### Pluralization Tests

For each language, test:
1. `{count: 0}` renders "no guides" equivalent
2. `{count: 1}` renders singular form
3. `{count: 5}` renders plural form

### Variable Interpolation Tests

1. `{current}` and `{max}` display in character count
2. `{formats}` displays in supported formats message
3. `{size}` displays in file size limit message

### Language Switching Tests

1. Switch language on instructions page, verify all text updates
2. Open markdown editor in each language without errors
3. Use image cropper in each language
4. Use video trimmer in each language
5. Error messages display in correct language

---

## Notes

- This task should NOT start until Tasks 2E.1-2E.5 are complete (English extraction)
- The articles namespace covers ~300 strings across editor, media, and viewer components
- Consistency with existing translations (common, items, errors namespaces) is critical
- AI-assisted translation recommended due to volume
- Professional review may be needed for customer-facing critical strings
- Text expansion (especially German at 30-40%) should be considered for UI testing

---

## Related Tasks

- **Task 2E.1 (REQ-E02-070):** Create `articles` namespace structure - PREREQUISITE
- **Task 2E.2 (REQ-E02-071):** Update editor components - PREREQUISITE
- **Task 2E.3 (REQ-E02-072):** Update media handling components - PREREQUISITE
- **Task 2E.4 (REQ-E02-073):** Update crop/trim utilities - PREREQUISITE
- **Task 2E.5 (REQ-E02-074):** Update instructions pages - PREREQUISITE
- **Task 2H.10:** Generate translations for common namespace - Reference for consistency

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-075)
- [Articles Namespace Structure](/docs/REQ-E02-070-create-articles-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2E.6*
