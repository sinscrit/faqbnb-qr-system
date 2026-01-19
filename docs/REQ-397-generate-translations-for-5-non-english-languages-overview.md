# REQ-397: Generate Translations for Article and Content Management (5 Non-English Languages) - Implementation Overview

*Generated: 2026-01-19 23:55:00 UTC*
*Last Modified: 2026-01-19 23:55:00 UTC*

## Reference

- **Request**: REQ-397 (Generate Translations for Article and Content Management)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement (Translation Generation)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2E - Article & Content Management
- **Task ID**: 2E.6
- **Size**: L (Large)
- **Priority**: Eighth in recommended order (final task of Sub-Epic 2E)

## Goals

1. Translate all Article & Content Management namespace strings from English to 5 target languages:
   - German (de)
   - Spanish (es)
   - French (fr)
   - Italian (it)
   - Dutch (nl)
2. Ensure translations maintain semantic accuracy with content management and media editing domain terminology
3. Apply correct ICU pluralization rules for each target language
4. Maintain consistency with common namespace translations already established
5. Ensure contextually appropriate translations for editor controls, media operations, crop/trim utilities, and instructions page elements

## Context from Implementation Plan

### Sub-Epic 2E Overview (Per Plan-111)

Sub-Epic 2E focuses on Article & Content Management components with:
- **Estimated Strings**: ~300
- **Components Affected**: MarkdownEditor, ImageCropper, VideoTrimmer, MediaGallery, AssetPanel, Instructions pages (20+ files)
- **Namespace**: `articles.*`

This task (2E.6) is the final task in Sub-Epic 2E, generating translations after all component string extraction is complete (Tasks 2E.1-2E.5).

### Prerequisites (Must Be Complete)

| Task | Description | Status |
|------|-------------|--------|
| REQ-392 (2E.1) | Create articles namespace structure in translation files | Must be complete |
| REQ-393 (2E.2) | Update editor components | Must be complete |
| REQ-394 (2E.3) | Update media handling components | Must be complete |
| REQ-395 (2E.4) | Update crop/trim utilities | Must be complete |
| REQ-396 (2E.5) | Update instructions pages | Must be complete |

### Source Translation File

The source of truth for translations is `/messages/en.json` containing the `articles` namespace with the following structure (per REQ-392):

```json
{
  "articles": {
    "title": "Instructions",
    "subtitle": "Manage content and instructions",
    "editor": { /* text formatting, styling, markdown, preview */ },
    "media": { /* upload, progress, validation, display */ },
    "crop": { /* aspect ratios, controls, grid overlay, zoom */ },
    "video": { /* timeline, playback controls, duration displays, trim ranges */ },
    "purposes": { /* howToUse, troubleshooting, maintenance, safety, warranty */ },
    "list": { /* column headers, table structure */ },
    "toolbar": { /* search, filter, view toggles */ },
    "card": { /* guide card actions */ },
    "page": { /* page-level strings */ },
    "empty": { /* empty state messages */ },
    "states": { /* draft, published, archived, scheduled */ },
    "actions": { /* create, edit, delete, publish, archive, duplicate, preview */ },
    "errors": { /* operation-specific error messages */ },
    "loading": { /* loading state messages */ },
    "validation": { /* validation error messages */ }
  }
}
```

## Current State Analysis

### Translation Files Status

| File | Current State |
|------|---------------|
| `/messages/en.json` | Contains complete `articles` namespace structure (source of truth) |
| `/messages/de.json` | Lacks `articles` namespace or contains incomplete translations |
| `/messages/fr.json` | Lacks `articles` namespace or contains incomplete translations |
| `/messages/es.json` | Lacks `articles` namespace or contains incomplete translations |
| `/messages/it.json` | Lacks `articles` namespace or contains incomplete translations |
| `/messages/nl.json` | Lacks `articles` namespace or contains incomplete translations |

### Estimated Translation Count

Based on the articles namespace structure defined in REQ-392:

| Category | Estimated Keys | Translation Complexity |
|----------|----------------|----------------------|
| `articles.title/subtitle` | 2 | Simple |
| `articles.editor` | 10 | Technical terminology (formatting) |
| `articles.media` | 6 | Contains interpolation |
| `articles.crop` | 8 | Domain-specific terminology |
| `articles.video` | 5 | Contains interpolation |
| `articles.purposes` | 6 | Domain-specific categories |
| `articles.list` | 9 | Table column headers |
| `articles.toolbar` | 6 | Contains interpolation |
| `articles.card` | 3 | Simple |
| `articles.page` | 12 | Mixed complexity |
| `articles.empty` | 2 | Contextual messaging |
| `articles.states` | 4 | Status labels |
| `articles.actions` | 7 | Action buttons |
| `articles.errors` | 4 | Error messaging |
| `articles.loading` | 4 | Status messages |
| `articles.validation` | 3 | Contains interpolation |
| **Total** | **~91** | Mixed complexity |

**Total Translations Required**: ~91 keys x 5 languages = **~455 translation entries**

## Implementation Approach

### Translation Strategy

1. **AI-Assisted Translation**: Use Claude/OpenAI for contextual translations with content management domain awareness
2. **Glossary Consistency**: Reference common namespace translations for shared terms (Save, Cancel, Delete, etc.)
3. **ICU Format Compliance**: Ensure all interpolation patterns follow ICU message format for each language
4. **Technical Term Handling**: Decide which technical terms to preserve (markdown, aspect ratio) vs. translate
5. **Native Review**: Flag critical strings (validation messages, error messages) for native speaker review

### Language-Specific Considerations

#### German (de)
- **Technical Terms**: Keep "Markdown" as-is (industry standard), translate "Aspect Ratio" to "Seitenverhaltnis"
- **Terminology**: Use formal "Sie" form consistently
- **Compound words**: Follow German conventions (e.g., "Videotrimmer", "Bildzuschnitt")
- **Media terms**: Use established German terms (Hochladen, Herunterladen)

#### Spanish (es)
- **Technical Terms**: "Markdown" preserved, "Aspect Ratio" as "Proporcion"
- **Terminology**: Use neutral/Latin American Spanish
- **Gender**: Maintain consistency - "el archivo" (m), "la imagen" (f)

#### French (fr)
- **Technical Terms**: "Markdown" preserved, "Aspect Ratio" as "Format d'image" or "Ratio"
- **Terminology**: Use formal "vous" form
- **Gender**: Maintain masculine/feminine consistency - "le fichier" (m), "l'image" (f)

#### Italian (it)
- **Technical Terms**: "Markdown" preserved, "Aspect Ratio" as "Proporzioni"
- **Terminology**: Use formal "Lei" form
- **Gender**: Italian has complex gender agreement with media terms

#### Dutch (nl)
- **Technical Terms**: "Markdown" preserved, "Aspect Ratio" as "Beeldverhouding"
- **Terminology**: Use formal "u" form
- **Compound words**: Dutch uses many compound words similar to German

### Technical Term Decisions

| English Term | Preserve/Translate | Notes |
|--------------|-------------------|-------|
| Markdown | Preserve | Industry standard, recognized globally |
| Aspect Ratio | Translate | Common term with good equivalents |
| Freeform | Translate | Contextual term |
| Embed | Context-dependent | May preserve in technical contexts |
| Timeline | Translate | Common media term |
| Crop | Translate | Standard image editing term |
| Trim | Translate | Standard video editing term |

### ICU Interpolation Patterns

The `articles` namespace contains several strings with variable interpolation:

```json
// English patterns
"supportedFormats": "Supported formats: {formats}"
"maxSize": "Maximum file size: {size}MB"
"duration": "Duration: {duration}"
"showing": "Showing {count} of {total} guides"
```

These patterns must be preserved exactly with variables in appropriate positions for each language:

| Language | Example (showing) |
|----------|-------------------|
| German | "Zeigt {count} von {total} Anleitungen" |
| Spanish | "Mostrando {count} de {total} guias" |
| French | "Affichage de {count} sur {total} guides" |
| Italian | "Visualizzazione di {count} su {total} guide" |
| Dutch | "Toont {count} van {total} handleidingen" |

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**:
  - Add/update complete `articles` namespace with German translations
  - Apply nested structure matching en.json exactly
  - Translate all text while preserving technical terms where appropriate
- **Key Sections**:
  | Section | Translation Focus |
  |---------|------------------|
  | `articles.title/subtitle` | Page headers |
  | `articles.editor.*` | Formatting toolbar labels, technical terms |
  | `articles.media.*` | File upload/handling terminology |
  | `articles.crop.*` | Image cropping terminology, aspect ratios |
  | `articles.video.*` | Video trimming terminology, time displays |
  | `articles.purposes.*` | Content purpose categories |
  | `articles.list.*` | Table column headers |
  | `articles.toolbar.*` | Search/filter/view controls |
  | `articles.card.*` | Guide card actions |
  | `articles.page.*` | Page-level messages |
  | `articles.empty.*` | Empty state messages |
  | `articles.states.*` | Content status labels |
  | `articles.actions.*` | Action button labels |
  | `articles.errors.*` | Error messages |
  | `articles.loading.*` | Loading state messages |
  | `articles.validation.*` | Validation error messages |

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**:
  - Add/update complete `articles` namespace with Spanish translations
  - Apply nested structure matching en.json exactly
  - Use neutral Spanish terminology
- **Key Focus**: Content management context translations, gender consistency

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**:
  - Add/update complete `articles` namespace with French translations
  - Apply nested structure matching en.json exactly
  - Use formal "vous" form
- **Key Focus**: Formal language, gender agreement, media terminology

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**:
  - Add/update complete `articles` namespace with Italian translations
  - Apply nested structure matching en.json exactly
  - Handle gender agreement carefully
- **Key Focus**: Formal "Lei" form, media editing terminology

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**:
  - Add/update complete `articles` namespace with Dutch translations
  - Apply nested structure matching en.json exactly
  - Use proper Dutch compound words
- **Key Focus**: Formal "u" form, compound word handling, media terms

### Files Referenced (Read-Only)

#### `/messages/en.json`
- **Purpose**: Source of truth for all translation keys
- **Reference**: Complete articles namespace structure and English text

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
articles.title
articles.subtitle
articles.editor.title
articles.editor.preview
articles.editor.edit
articles.editor.formatting.bold
articles.editor.formatting.italic
articles.editor.formatting.heading
articles.editor.formatting.list
articles.editor.formatting.link
articles.editor.formatting.image
articles.editor.placeholder
articles.media.upload
articles.media.dragDrop
articles.media.or
articles.media.browse
articles.media.supportedFormats
articles.media.maxSize
articles.crop.title
articles.crop.aspectRatio
articles.crop.freeform
articles.crop.square
articles.crop.landscape
articles.crop.portrait
articles.crop.apply
articles.crop.reset
articles.video.title
articles.video.startTime
articles.video.endTime
articles.video.duration
articles.video.apply
articles.purposes.howToUse
articles.purposes.troubleshooting
articles.purposes.maintenance
articles.purposes.safety
articles.purposes.warranty
articles.purposes.other
articles.list.title
articles.list.item
articles.list.room
articles.list.property
articles.list.purpose
articles.list.created
articles.list.actions
articles.list.empty
articles.list.noResults
articles.toolbar.search
articles.toolbar.filter
articles.toolbar.clearFilters
articles.toolbar.viewGrid
articles.toolbar.viewList
articles.toolbar.showing
articles.card.edit
articles.card.viewDetails
articles.card.noContent
articles.page.title
articles.page.subtitle
articles.page.createFirst
articles.page.learnMore
articles.page.loading
articles.page.authRequired
articles.page.authMessage
articles.page.goToLogin
articles.page.retry
articles.page.errorTitle
articles.page.successMessage
articles.empty.title
articles.empty.description
articles.states.draft
articles.states.published
articles.states.archived
articles.states.scheduled
articles.actions.create
articles.actions.edit
articles.actions.delete
articles.actions.publish
articles.actions.archive
articles.actions.duplicate
articles.actions.preview
articles.errors.loadFailed
articles.errors.saveFailed
articles.errors.deleteFailed
articles.errors.notFound
articles.loading.fetching
articles.loading.saving
articles.loading.deleting
articles.loading.uploading
articles.validation.titleRequired
articles.validation.contentRequired
articles.validation.maxLength
```

### Variable Interpolation Examples

#### English (source)
```json
"articles.media.maxSize": "Maximum file size: {size}MB"
```

Translations must preserve the `{size}` variable exactly:

#### German
```json
"articles.media.maxSize": "Maximale Dateigrösse: {size}MB"
```

#### French
```json
"articles.media.maxSize": "Taille maximale du fichier: {size} Mo"
```

#### Spanish
```json
"articles.media.maxSize": "Tamano maximo de archivo: {size}MB"
```

#### Italian
```json
"articles.media.maxSize": "Dimensione massima del file: {size}MB"
```

#### Dutch
```json
"articles.media.maxSize": "Maximale bestandsgrootte: {size}MB"
```

## Domain-Specific Terminology Glossary

The following terms should be translated consistently across all Article & Content Management strings:

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Guide | Anleitung | Guia | Guide | Guida | Handleiding |
| Article | Artikel | Articulo | Article | Articolo | Artikel |
| Instructions | Anleitungen | Instrucciones | Instructions | Istruzioni | Instructies |
| Content | Inhalt | Contenido | Contenu | Contenuto | Inhoud |
| Editor | Editor | Editor | Editeur | Editor | Editor |
| Media | Medien | Medios | Medias | Media | Media |
| Upload | Hochladen | Subir | Telecharger | Caricare | Uploaden |
| Crop | Zuschneiden | Recortar | Rogner | Ritaglia | Bijsnijden |
| Trim | Schneiden | Recortar | Couper | Tagliare | Trimmen |
| Aspect Ratio | Seitenverhaltnis | Proporcion | Format d'image | Proporzioni | Beeldverhouding |
| Duration | Dauer | Duracion | Duree | Durata | Duur |
| Draft | Entwurf | Borrador | Brouillon | Bozza | Concept |
| Published | Veroffentlicht | Publicado | Publie | Pubblicato | Gepubliceerd |
| Archived | Archiviert | Archivado | Archive | Archiviato | Gearchiveerd |

## Verification Checklist

### Pre-Implementation
- [ ] Confirm REQ-392 through REQ-396 are complete
- [ ] Verify en.json contains complete articles namespace structure
- [ ] Review common namespace translations for consistency reference
- [ ] Document any technical terms to be preserved vs. translated

### During Implementation
- [ ] Apply identical key structure to all 5 language files
- [ ] Verify all variable interpolations are preserved exactly
- [ ] Check gender agreement (French, Italian, German)
- [ ] Use formal forms (Sie/vous/Lei/u) consistently
- [ ] Preserve technical terms as decided (Markdown, etc.)

### Post-Implementation
- [ ] Run JSON syntax validation on all modified files
- [ ] Run application and verify no missing translation warnings
- [ ] Test variable interpolation with sample values
- [ ] Visual check of editor, crop, trim, and instructions pages in each language
- [ ] Verify no layout breaks due to longer translations

## Dependencies

### Upstream Dependencies
| Dependency | Purpose | Status |
|------------|---------|--------|
| REQ-229 (Epic 1) | next-intl package installed | Complete |
| REQ-230 (Epic 1) | i18n config module | Complete |
| REQ-392 (2E.1) | Articles namespace structure created | Required |
| REQ-393-396 (2E.2-2E.5) | Components updated to use translations | Required |

### Downstream Dependencies
| Dependency | Purpose |
|------------|---------|
| None | This is the final task of Sub-Epic 2E |

## Risk Assessment

### Risk Level: Medium

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent technical terminology | Medium | Medium | Document term decisions, use glossary |
| Variable interpolation errors | Medium | High | Validate all interpolation patterns match |
| Missing translations at runtime | Low | High | Build-time JSON validation, comprehensive key list |
| Layout breaks from longer text | Medium | Low | Design accommodates 40% text expansion |
| Cultural appropriateness issues | Low | Medium | Use neutral, formal language; flag for review |
| Technical term confusion | Medium | Medium | Balance between preserving industry terms and localization |

## Acceptance Criteria

From REQ-397:

- [ ] German (de) translation file contains complete articles namespace with all keys from English version
- [ ] Spanish (es) translation file contains complete articles namespace with all keys from English version
- [ ] French (fr) translation file contains complete articles namespace with all keys from English version
- [ ] Italian (it) translation file contains complete articles namespace with all keys from English version
- [ ] Dutch (nl) translation file contains complete articles namespace with all keys from English version
- [ ] Editor component translations accurately convey text formatting, styling, and content editing concepts
- [ ] Media handling translations properly localize file type terminology, size limits, and upload status messages
- [ ] Crop utility translations include culturally appropriate aspect ratio and dimension terminology
- [ ] Trim utility translations correctly format time durations according to locale conventions
- [ ] Instructions page translations provide clear table headers, column labels, and purpose category names
- [ ] Technical terms including markdown, embed, aspect ratio, and timeline are appropriately localized or preserved
- [ ] All translation files maintain valid JSON structure without syntax errors
- [ ] Character encoding properly handles special characters, accents, and diacritics for each language
- [ ] Translated strings maintain reasonable length to avoid breaking component layouts in UI
- [ ] Terminology consistency is maintained with existing common, dashboard, and workflow namespaces
- [ ] Validation and error messages use clear, actionable language appropriate to each culture
- [ ] Date and time formatting in instructions tables adapts to locale-specific conventions

## Implementation Steps Summary

1. **Read English Source**: Extract all `articles.*` keys from `/messages/en.json`
2. **Review Technical Terms**: Confirm which terms to preserve vs. translate
3. **Translate German**: Apply complete German translations to `/messages/de.json`
4. **Translate Spanish**: Apply complete Spanish translations to `/messages/es.json`
5. **Translate French**: Apply complete French translations to `/messages/fr.json`
6. **Translate Italian**: Apply complete Italian translations to `/messages/it.json`
7. **Translate Dutch**: Apply complete Dutch translations to `/messages/nl.json`
8. **Validate JSON**: Run syntax validation on all 5 modified files
9. **Test Application**: Verify translations load without errors
10. **Visual QA**: Check editor, crop, trim, and instructions pages in each language for layout issues

## Notes

- This task completes Sub-Epic 2E (Article & Content Management)
- Translations should be contextually appropriate for content management and media editing software
- Formal language forms should be used consistently (Sie, vous, Lei, u)
- Variable placeholders (e.g., `{formats}`, `{size}`, `{duration}`, `{count}`, `{total}`) must be preserved exactly
- Technical terms like "Markdown" should be preserved as they are industry standards
- Common action words should reference translations already established in common namespace
- Consider text length expansion for German and French when designing UI

---

*Document created for FAQBNB Localization Epic 2 - Static UI Translation*
*Sub-Epic 2E - Article & Content Management - Task 2E.6*
