# REQ-E02-075: Generate Translations for 5 Non-English Languages - Detailed Implementation Tasks

**Generated:** 2026-01-22 18:36
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - REQ-E02-075
- Overview: `/docs/REQ-E02-075-generate-translations-for-5-non-english-languages-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

This document provides granular, implementation-ready tasks for generating translations for the `articles` namespace across 5 non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it).

**Scope Summary:**

- **Total keys to translate:** ~335+ keys in `articles.*` namespace
- **Target languages:** 5 (French, Spanish, German, Dutch, Italian)
- **Total translation operations:** ~1,675+ individual translations
- **Source of truth:** `/messages/en.json`
- **Target files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Translation Categories:**

| Category | Keys | Description |
|----------|------|-------------|
| `articles.editor.*` | ~40 | Markdown editor UI, toolbar, tabs |
| `articles.media.*` | ~10 | Media upload interface |
| `articles.crop.*` | ~30 | Image cropping controls |
| `articles.video.*` | ~40 | Video trimming interface |
| `articles.rotate.*` | ~25 | Image rotation controls |
| `articles.purposes.*` | ~10 | Content purpose categories |
| `articles.list.*` | ~50 | Instructions list page |
| `articles.edit.*` | ~40 | Edit page interface |
| `articles.grid/table/card.*` | ~40 | View components |
| `articles.content.*` | ~30 | Content editing |
| `articles.instructionEditor.*` | ~15 | Instruction editor |
| `articles.validation/delete/empty.*` | ~30 | Messages |
| `articles.readOnlyContext.*` | ~5 | Read-only context |

**Prerequisite:** Tasks 2E.1-2E.5 have created all `articles.*` keys in en.json with English placeholder values in non-English files.

---

## 1. Audit Articles Namespace Structure

**Context:** Verify the complete structure of the `articles` namespace in en.json before translation.
**Files to review:** `/messages/en.json` (READ ONLY)
**Estimated effort:** 0.5 story points
**Status:** ✅ COMPLETED - 2026-01-22

- [x] **1.1** Read `/messages/en.json` and locate the `articles` namespace (starts at line 3501, ends at line 3820)
- [x] **1.2** Count total number of top-level categories under `articles` → **16 main categories**
- [x] **1.3** Count total number of keys (including nested keys) in the `articles` namespace → **276 total keys**
- [x] **1.4** Identify all ICU message format patterns (pluralization, interpolation) → **2 plural patterns found**
- [x] **1.5** List all variable placeholders used → **17 unique placeholders** (see below)
- [x] **1.6** Verify structure consistency across all target language files → ✅ Verified
- [x] **1.7** Document key count and structure for translation reference → See audit results below

**Audit Results:**

**Type Check Baseline:** 0 errors

**Main Categories (16):**
1. title, subtitle, pageTitle (root-level metadata)
2. editor (Markdown editor UI - ~40 keys)
3. media (Media upload - ~10 keys)
4. crop (Image cropping - ~30 keys)
5. video (Video trimming - ~40 keys)
6. rotate (Image rotation - ~25 keys)
7. purposes (Content purposes - ~8 keys)
8. list (Instructions list - ~50 keys)
9. edit (Edit page - ~40 keys)
10. grid (Grid view - ~5 keys)
11. card (Card component - ~6 keys)
12. table (Table view - ~10 keys)
13. empty (Empty states - ~8 keys)
14. validation (Validation messages - ~6 keys)
15. delete (Delete confirmation - ~5 keys)
16. content (Content editing - ~12 keys)
17. instructionEditor (Instruction editor - ~4 keys)
18. readOnlyContext (Read-only context - ~4 keys)

**ICU Patterns:**
- `{count, plural, =0 {No guides} one {# guide} other {# guides}}` (list.count)
- `{count, plural, one {# piece} other {# pieces}}` (content.count)

**Variable Placeholders (17):**
- `{count}` - numeric counts
- `{current, number}` - current value with number formatting
- `{max, number}` - maximum value with number formatting
- `{max}` - maximum value
- `{date}` - date values
- `{degrees}` - rotation degrees
- `{duration}` - time duration
- `{formats}` - supported file formats
- `{percent}` - percentage values
- `{position}` - position in list
- `{ratio}` - aspect ratio
- `{size}` - file size
- `{time}` - time values
- `{title}` - article title
- `{total}` - total count
- `{type}` - content type

**Structure Verification:**
- ✅ All target language files (fr.json, es.json, de.json, nl.json, it.json) have matching structure
- ✅ All files currently contain English placeholder values (as expected from prerequisite tasks)
- ✅ All ICU syntax and variable placeholders are preserved across files

---

## 2. Create Translation Terminology Glossary

**Context:** Establish consistent translations for frequently used terms across all languages.
**Estimated effort:** 1 story point
**Status:** ✅ COMPLETED - 2026-01-22

- [x] **2.1** Identify frequently used terms (e.g., "Cancel", "Save", "Delete", "Edit", "Apply", "Loading")
- [x] **2.2** Define French translations for common terms
- [x] **2.3** Define Spanish translations for common terms
- [x] **2.4** Define German translations for common terms
- [x] **2.5** Define Dutch translations for common terms
- [x] **2.6** Define Italian translations for common terms
- [x] **2.7** Document terminology choices for formality level (formal/informal) → **All languages use FORMAL address**
- [x] **2.8** Verify gender agreement rules for each language → See notes below
- [x] **2.9** Create reference table of standard translations for button labels → See Table 1 below
- [x] **2.10** Create reference table for ARIA label patterns → See Table 2 below

**Formality Level:**
- **French:** Use "vous" (formal) throughout
- **Spanish:** Use "usted" (formal) throughout
- **German:** Use "Sie" (formal, always capitalized) throughout
- **Dutch:** Use "u" (formal) throughout
- **Italian:** Use "Lei" (formal, capitalized) throughout

**Gender Agreement Rules:**
- **French:** Adjectives agree with noun gender (e.g., "chargé" vs "chargée")
- **Spanish:** Adjectives agree with noun gender (e.g., "cargado" vs "cargada")
- **German:** All nouns capitalized, articles indicate gender (der/die/das)
- **Dutch:** Limited gender agreement (de/het articles)
- **Italian:** Adjectives agree with noun gender (e.g., "caricato" vs "caricata")

**Table 1: Standard Button/Action Labels**

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina |
| Edit | Modifier | Editar | Bearbeiten | Bewerken | Modifica |
| Apply | Appliquer | Aplicar | Anwenden | Toepassen | Applica |
| Loading | Chargement... | Cargando... | Wird geladen... | Laden... | Caricamento... |
| Reset | Réinitialiser | Restablecer | Zurücksetzen | Herstellen | Ripristina |
| Preview | Aperçu | Vista previa | Vorschau | Voorbeeld | Anteprima |
| Upload | Téléverser | Subir | Hochladen | Uploaden | Carica |
| Download | Télécharger | Descargar | Herunterladen | Downloaden | Scarica |
| Create | Créer | Crear | Erstellen | Maken | Crea |
| Add | Ajouter | Añadir | Hinzufügen | Toevoegen | Aggiungi |
| Remove | Retirer | Eliminar | Entfernen | Verwijderen | Rimuovi |
| Close | Fermer | Cerrar | Schließen | Sluiten | Chiudi |
| Confirm | Confirmer | Confirmar | Bestätigen | Bevestigen | Conferma |
| Browse | Parcourir | Examinar | Durchsuchen | Bladeren | Sfoglia |
| Search | Rechercher | Buscar | Suchen | Zoeken | Cerca |
| Filter | Filtrer | Filtrar | Filtern | Filteren | Filtra |
| Sort | Trier | Ordenar | Sortieren | Sorteren | Ordina |
| Select | Sélectionner | Seleccionar | Auswählen | Selecteren | Seleziona |
| Show | Afficher | Mostrar | Anzeigen | Tonen | Mostra |
| Hide | Masquer | Ocultar | Ausblenden | Verbergen | Nascondi |
| Rotate | Pivoter | Rotar | Drehen | Draaien | Ruota |
| Crop | Recadrer | Recortar | Zuschneiden | Bijsnijden | Ritaglia |
| Zoom | Zoom | Zoom | Zoom | Zoom | Zoom |
| Playing | Lecture en cours | Reproduciendo | Wird abgespielt | Afspelen | Riproduzione |
| Paused | En pause | Pausado | Pausiert | Gepauzeerd | In pausa |

**Table 2: ARIA Label Patterns**

| English Pattern | French | Spanish | German | Dutch | Italian |
|-----------------|--------|---------|--------|-------|---------|
| {action} (Ctrl+{key}) | {action} (Ctrl+{key}) | {action} (Ctrl+{key}) | {action} (Strg+{key}) | {action} (Ctrl+{key}) | {action} (Ctrl+{key}) |
| {item} view mode | Mode d'affichage {item} | Modo de vista {item} | Ansichtsmodus {item} | Weergavemodus {item} | Modalità vista {item} |
| {action} {item} | {action} {item} | {action} {item} | {item} {action} | {item} {action} | {action} {item} |
| Select this {item} | Sélectionner ce/cette {item} | Seleccionar este/esta {item} | Dieses/Diese {Item} auswählen | Deze {item} selecteren | Seleziona questo/questa {item} |

**Common Phrases:**

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| No {items} yet | Aucun(e) {items} pour le moment | Aún no hay {items} | Noch keine {Items} | Nog geen {items} | Nessun(a) {items} ancora |
| Try again | Réessayer | Intentar de nuevo | Erneut versuchen | Opnieuw proberen | Riprova |
| Failed to {action} | Échec de {action} | Error al {action} | {Action} fehlgeschlagen | {Action} mislukt | Impossibile {action} |
| {Action} complete | {Action} terminé(e) | {Action} completado/a | {Action} abgeschlossen | {Action} voltooid | {Action} completato/a |
| {Action} failed | Échec de {action} | {Action} ha fallado | {Action} fehlgeschlagen | {Action} mislukt | {Action} non riuscito/a |
| Are you sure? | Êtes-vous sûr(e) ? | ¿Está seguro/a? | Sind Sie sicher? | Weet u het zeker? | È sicuro/a? |

---

## 3. Generate French Translations (fr.json)

**Context:** Translate all `articles.*` keys to French with grammatical correctness and cultural appropriateness.
**Files to modify:** `/messages/fr.json`
**Estimated effort:** 3 story points

### 3.1 Editor Translations

- [ ] **3.1.1** Translate `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit` (formal "vous")
- [ ] **3.1.2** Translate `articles.editor.placeholder` and character count messages
- [ ] **3.1.3** Translate formatting toolbar labels (`bold`, `italic`, `heading1`, etc.)
- [ ] **3.1.4** Translate tabs and toolbar shortcuts (preserve keyboard shortcuts like Ctrl+B)
- [ ] **3.1.5** Translate ARIA labels for editor accessibility
- [ ] **3.1.6** Verify ICU interpolation in `characterCount` message

### 3.2 Media Translations

- [ ] **3.2.1** Translate media upload labels and instructions
- [ ] **3.2.2** Translate drag-and-drop messages
- [ ] **3.2.3** Translate file format and size messages (preserve `{formats}`, `{size}` placeholders)
- [ ] **3.2.4** Translate upload status messages

### 3.3 Crop Translations

- [ ] **3.3.1** Translate crop title and button labels
- [ ] **3.3.2** Translate aspect ratio options (maintain aspect ratio numbers like 16:9)
- [ ] **3.3.3** Translate preview labels and processing messages
- [ ] **3.3.4** Translate error messages for crop operations
- [ ] **3.3.5** Translate ARIA labels for crop controls
- [ ] **3.3.6** Verify ICU interpolation in `aria.aspectRatioSelected`

### 3.4 Video Translations

- [ ] **3.4.1** Translate video trimming title and controls
- [ ] **3.4.2** Translate time-related labels (preserve `{duration}`, `{time}` placeholders)
- [ ] **3.4.3** Translate markers (`start`, `end`) - use single letters (D, F for Début, Fin)
- [ ] **3.4.4** Translate selection display messages with ICU pluralization
- [ ] **3.4.5** Translate error messages for video operations
- [ ] **3.4.6** Translate ARIA labels for playback controls
- [ ] **3.4.7** Verify ICU interpolation in `selection.trimming` message

### 3.5 Rotate Translations

- [ ] **3.5.1** Translate rotation title and button labels
- [ ] **3.5.2** Translate rotation status messages (preserve `{degrees}` placeholder)
- [ ] **3.5.3** Translate keyboard shortcuts help (preserve ←, →, Esc, ⌘+Enter symbols)
- [ ] **3.5.4** Translate error messages for rotation operations
- [ ] **3.5.5** Translate ARIA labels for rotation controls
- [ ] **3.5.6** Verify ICU interpolation in `currentRotation` and `aria.announcement`

### 3.6 Purposes Translations

- [ ] **3.6.1** Translate all content purpose categories (`howToUse`, `troubleshooting`, etc.)
- [ ] **3.6.2** Ensure consistency with common terminology choices

### 3.7 List Page Translations

- [ ] **3.7.1** Translate list page title and subtitle
- [ ] **3.7.2** Translate ICU plural count message (verify French plural rules)
- [ ] **3.7.3** Translate search labels and placeholders
- [ ] **3.7.4** Translate column headers (`title`, `item`, `room`, `purpose`, etc.)
- [ ] **3.7.5** Translate sort options
- [ ] **3.7.6** Translate view mode labels (`grid`, `list`)
- [ ] **3.7.7** Translate filter labels and messages
- [ ] **3.7.8** Translate loading and login messages

### 3.8 Edit Page Translations

- [ ] **3.8.1** Translate edit page title and navigation labels
- [ ] **3.8.2** Translate form field labels and placeholders
- [ ] **3.8.3** Translate button states (`save`, `saving`, `cancel`, `delete`)
- [ ] **3.8.4** Translate status messages (success, failed, unsaved changes)
- [ ] **3.8.5** Translate loading and error messages

### 3.9 Grid/Table/Card Translations

- [ ] **3.9.1** Translate grid ARIA labels and action labels
- [ ] **3.9.2** Translate card date formats (preserve `{date}` placeholder)
- [ ] **3.9.3** Translate table ARIA labels and headers
- [ ] **3.9.4** Translate column settings dialog

### 3.10 Content Editing Translations

- [ ] **3.10.1** Translate content section title and count (verify ICU plural)
- [ ] **3.10.2** Translate remove dialog messages
- [ ] **3.10.3** Translate ARIA labels for drag-and-drop (verify ICU interpolation for position)

### 3.11 Instruction Editor Translations

- [ ] **3.11.1** Translate article title labels and placeholders
- [ ] **3.11.2** Translate page header with ICU interpolation

### 3.12 Validation/Delete/Empty Translations

- [ ] **3.12.1** Translate all validation error messages (preserve `{max}` placeholders)
- [ ] **3.12.2** Translate delete confirmation dialog
- [ ] **3.12.3** Translate empty state messages
- [ ] **3.12.4** Translate read-only context labels

### 3.13 Final French Validation

- [ ] **3.13.1** Verify all accents are correct (é, è, ê, à, ù, ç)
- [ ] **3.13.2** Verify formal "vous" is used consistently
- [ ] **3.13.3** Verify gender agreement for all adjectives
- [ ] **3.13.4** Verify guillemets (« ») if applicable instead of quotes
- [ ] **3.13.5** Run JSON validation on fr.json
- [ ] **3.13.6** Verify all ICU message formats are syntactically correct

---

## 4. Generate Spanish Translations (es.json)

**Context:** Translate all `articles.*` keys to Spanish with grammatical correctness and cultural appropriateness.
**Files to modify:** `/messages/es.json`
**Estimated effort:** 3 story points

### 4.1 Editor Translations

- [ ] **4.1.1** Translate `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit` (formal "usted")
- [ ] **4.1.2** Translate `articles.editor.placeholder` and character count messages
- [ ] **4.1.3** Translate formatting toolbar labels (`bold`, `italic`, `heading1`, etc.)
- [ ] **4.1.4** Translate tabs and toolbar shortcuts (preserve keyboard shortcuts)
- [ ] **4.1.5** Translate ARIA labels for editor accessibility
- [ ] **4.1.6** Verify ICU interpolation in `characterCount` message

### 4.2 Media Translations

- [ ] **4.2.1** Translate media upload labels and instructions
- [ ] **4.2.2** Translate drag-and-drop messages
- [ ] **4.2.3** Translate file format and size messages (preserve placeholders)
- [ ] **4.2.4** Translate upload status messages

### 4.3 Crop Translations

- [ ] **4.3.1** Translate crop title and button labels
- [ ] **4.3.2** Translate aspect ratio options
- [ ] **4.3.3** Translate preview labels and processing messages
- [ ] **4.3.4** Translate error messages for crop operations
- [ ] **4.3.5** Translate ARIA labels for crop controls
- [ ] **4.3.6** Verify ICU interpolation in ARIA labels

### 4.4 Video Translations

- [ ] **4.4.1** Translate video trimming title and controls
- [ ] **4.4.2** Translate time-related labels (preserve placeholders)
- [ ] **4.4.3** Translate markers (`start`, `end`) - use single letters (I, F for Inicio, Fin)
- [ ] **4.4.4** Translate selection display messages with ICU pluralization
- [ ] **4.4.5** Translate error messages for video operations
- [ ] **4.4.6** Translate ARIA labels for playback controls
- [ ] **4.4.7** Verify ICU interpolation in selection messages

### 4.5 Rotate Translations

- [ ] **4.5.1** Translate rotation title and button labels
- [ ] **4.5.2** Translate rotation status messages (preserve placeholders)
- [ ] **4.5.3** Translate keyboard shortcuts help (preserve symbols)
- [ ] **4.5.4** Translate error messages for rotation operations
- [ ] **4.5.5** Translate ARIA labels for rotation controls
- [ ] **4.5.6** Verify ICU interpolation in rotation messages

### 4.6 Purposes Translations

- [ ] **4.6.1** Translate all content purpose categories
- [ ] **4.6.2** Ensure consistency with common terminology choices

### 4.7 List Page Translations

- [ ] **4.7.1** Translate list page title and subtitle
- [ ] **4.7.2** Translate ICU plural count message (verify Spanish plural rules)
- [ ] **4.7.3** Translate search labels and placeholders
- [ ] **4.7.4** Translate column headers
- [ ] **4.7.5** Translate sort options
- [ ] **4.7.6** Translate view mode labels
- [ ] **4.7.7** Translate filter labels and messages
- [ ] **4.7.8** Translate loading and login messages

### 4.8 Edit Page Translations

- [ ] **4.8.1** Translate edit page title and navigation labels
- [ ] **4.8.2** Translate form field labels and placeholders
- [ ] **4.8.3** Translate button states
- [ ] **4.8.4** Translate status messages
- [ ] **4.8.5** Translate loading and error messages

### 4.9 Grid/Table/Card Translations

- [ ] **4.9.1** Translate grid ARIA labels and action labels
- [ ] **4.9.2** Translate card date formats (preserve placeholders)
- [ ] **4.9.3** Translate table ARIA labels and headers
- [ ] **4.9.4** Translate column settings dialog

### 4.10 Content Editing Translations

- [ ] **4.10.1** Translate content section title and count (verify ICU plural)
- [ ] **4.10.2** Translate remove dialog messages
- [ ] **4.10.3** Translate ARIA labels for drag-and-drop (verify ICU interpolation)

### 4.11 Instruction Editor Translations

- [ ] **4.11.1** Translate article title labels and placeholders
- [ ] **4.11.2** Translate page header with ICU interpolation

### 4.12 Validation/Delete/Empty Translations

- [ ] **4.12.1** Translate all validation error messages (preserve placeholders)
- [ ] **4.12.2** Translate delete confirmation dialog
- [ ] **4.12.3** Translate empty state messages
- [ ] **4.12.4** Translate read-only context labels

### 4.13 Final Spanish Validation

- [ ] **4.13.1** Verify all accents are correct (á, é, í, ó, ú, ñ)
- [ ] **4.13.2** Verify formal "usted" is used consistently
- [ ] **4.13.3** Verify gender agreement for all adjectives
- [ ] **4.13.4** Verify inverted question/exclamation marks where needed (¿?)
- [ ] **4.13.5** Run JSON validation on es.json
- [ ] **4.13.6** Verify all ICU message formats are syntactically correct

---

## 5. Generate German Translations (de.json)

**Context:** Translate all `articles.*` keys to German with grammatical correctness and cultural appropriateness.
**Files to modify:** `/messages/de.json`
**Estimated effort:** 3 story points

### 5.1 Editor Translations

- [ ] **5.1.1** Translate `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit` (formal "Sie")
- [ ] **5.1.2** Translate `articles.editor.placeholder` and character count messages
- [ ] **5.1.3** Translate formatting toolbar labels with proper capitalization
- [ ] **5.1.4** Translate tabs and toolbar shortcuts (preserve keyboard shortcuts)
- [ ] **5.1.5** Translate ARIA labels for editor accessibility
- [ ] **5.1.6** Verify ICU interpolation in `characterCount` message

### 5.2 Media Translations

- [ ] **5.2.1** Translate media upload labels and instructions
- [ ] **5.2.2** Translate drag-and-drop messages
- [ ] **5.2.3** Translate file format and size messages (preserve placeholders)
- [ ] **5.2.4** Translate upload status messages

### 5.3 Crop Translations

- [ ] **5.3.1** Translate crop title and button labels
- [ ] **5.3.2** Translate aspect ratio options (use German compound nouns)
- [ ] **5.3.3** Translate preview labels and processing messages
- [ ] **5.3.4** Translate error messages for crop operations
- [ ] **5.3.5** Translate ARIA labels for crop controls
- [ ] **5.3.6** Verify ICU interpolation in ARIA labels

### 5.4 Video Translations

- [ ] **5.4.1** Translate video trimming title and controls
- [ ] **5.4.2** Translate time-related labels (preserve placeholders)
- [ ] **5.4.3** Translate markers (`start`, `end`) - use single letters (A, E for Anfang, Ende)
- [ ] **5.4.4** Translate selection display messages with ICU pluralization
- [ ] **5.4.5** Translate error messages for video operations
- [ ] **5.4.6** Translate ARIA labels for playback controls
- [ ] **5.4.7** Verify ICU interpolation in selection messages

### 5.5 Rotate Translations

- [ ] **5.5.1** Translate rotation title and button labels
- [ ] **5.5.2** Translate rotation status messages (preserve placeholders)
- [ ] **5.5.3** Translate keyboard shortcuts help (preserve symbols)
- [ ] **5.5.4** Translate error messages for rotation operations
- [ ] **5.5.5** Translate ARIA labels for rotation controls
- [ ] **5.5.6** Verify ICU interpolation in rotation messages

### 5.6 Purposes Translations

- [ ] **5.6.1** Translate all content purpose categories
- [ ] **5.6.2** Use proper German compound nouns where applicable
- [ ] **5.6.3** Ensure consistency with common terminology choices

### 5.7 List Page Translations

- [ ] **5.7.1** Translate list page title and subtitle
- [ ] **5.7.2** Translate ICU plural count message (verify German plural rules)
- [ ] **5.7.3** Translate search labels and placeholders
- [ ] **5.7.4** Translate column headers
- [ ] **5.7.5** Translate sort options
- [ ] **5.7.6** Translate view mode labels
- [ ] **5.7.7** Translate filter labels and messages
- [ ] **5.7.8** Translate loading and login messages

### 5.8 Edit Page Translations

- [ ] **5.8.1** Translate edit page title and navigation labels
- [ ] **5.8.2** Translate form field labels and placeholders
- [ ] **5.8.3** Translate button states
- [ ] **5.8.4** Translate status messages
- [ ] **5.8.5** Translate loading and error messages

### 5.9 Grid/Table/Card Translations

- [ ] **5.9.1** Translate grid ARIA labels and action labels
- [ ] **5.9.2** Translate card date formats (preserve placeholders)
- [ ] **5.9.3** Translate table ARIA labels and headers
- [ ] **5.9.4** Translate column settings dialog

### 5.10 Content Editing Translations

- [ ] **5.10.1** Translate content section title and count (verify ICU plural)
- [ ] **5.10.2** Translate remove dialog messages
- [ ] **5.10.3** Translate ARIA labels for drag-and-drop (verify ICU interpolation)

### 5.11 Instruction Editor Translations

- [ ] **5.11.1** Translate article title labels and placeholders
- [ ] **5.11.2** Translate page header with ICU interpolation

### 5.12 Validation/Delete/Empty Translations

- [ ] **5.12.1** Translate all validation error messages (preserve placeholders)
- [ ] **5.12.2** Translate delete confirmation dialog
- [ ] **5.12.3** Translate empty state messages
- [ ] **5.12.4** Translate read-only context labels

### 5.13 Final German Validation

- [ ] **5.13.1** Verify all umlauts are correct (ä, ö, ü, ß)
- [ ] **5.13.2** Verify formal "Sie" is used consistently
- [ ] **5.13.3** Verify all nouns are capitalized
- [ ] **5.13.4** Verify compound nouns are formed correctly
- [ ] **5.13.5** Run JSON validation on de.json
- [ ] **5.13.6** Verify all ICU message formats are syntactically correct

---

## 6. Generate Dutch Translations (nl.json)

**Context:** Translate all `articles.*` keys to Dutch with grammatical correctness and cultural appropriateness.
**Files to modify:** `/messages/nl.json`
**Estimated effort:** 3 story points

### 6.1 Editor Translations

- [ ] **6.1.1** Translate `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit` (formal "u")
- [ ] **6.1.2** Translate `articles.editor.placeholder` and character count messages
- [ ] **6.1.3** Translate formatting toolbar labels
- [ ] **6.1.4** Translate tabs and toolbar shortcuts (preserve keyboard shortcuts)
- [ ] **6.1.5** Translate ARIA labels for editor accessibility
- [ ] **6.1.6** Verify ICU interpolation in `characterCount` message

### 6.2 Media Translations

- [ ] **6.2.1** Translate media upload labels and instructions
- [ ] **6.2.2** Translate drag-and-drop messages
- [ ] **6.2.3** Translate file format and size messages (preserve placeholders)
- [ ] **6.2.4** Translate upload status messages

### 6.3 Crop Translations

- [ ] **6.3.1** Translate crop title and button labels
- [ ] **6.3.2** Translate aspect ratio options
- [ ] **6.3.3** Translate preview labels and processing messages
- [ ] **6.3.4** Translate error messages for crop operations
- [ ] **6.3.5** Translate ARIA labels for crop controls
- [ ] **6.3.6** Verify ICU interpolation in ARIA labels

### 6.4 Video Translations

- [ ] **6.4.1** Translate video trimming title and controls
- [ ] **6.4.2** Translate time-related labels (preserve placeholders)
- [ ] **6.4.3** Translate markers (`start`, `end`) - use single letters (B, E for Begin, Einde)
- [ ] **6.4.4** Translate selection display messages with ICU pluralization
- [ ] **6.4.5** Translate error messages for video operations
- [ ] **6.4.6** Translate ARIA labels for playback controls
- [ ] **6.4.7** Verify ICU interpolation in selection messages

### 6.5 Rotate Translations

- [ ] **6.5.1** Translate rotation title and button labels
- [ ] **6.5.2** Translate rotation status messages (preserve placeholders)
- [ ] **6.5.3** Translate keyboard shortcuts help (preserve symbols)
- [ ] **6.5.4** Translate error messages for rotation operations
- [ ] **6.5.5** Translate ARIA labels for rotation controls
- [ ] **6.5.6** Verify ICU interpolation in rotation messages

### 6.6 Purposes Translations

- [ ] **6.6.1** Translate all content purpose categories
- [ ] **6.6.2** Use proper Dutch compound words where applicable
- [ ] **6.6.3** Ensure consistency with common terminology choices

### 6.7 List Page Translations

- [ ] **6.7.1** Translate list page title and subtitle
- [ ] **6.7.2** Translate ICU plural count message (verify Dutch plural rules)
- [ ] **6.7.3** Translate search labels and placeholders
- [ ] **6.7.4** Translate column headers
- [ ] **6.7.5** Translate sort options
- [ ] **6.7.6** Translate view mode labels
- [ ] **6.7.7** Translate filter labels and messages
- [ ] **6.7.8** Translate loading and login messages

### 6.8 Edit Page Translations

- [ ] **6.8.1** Translate edit page title and navigation labels
- [ ] **6.8.2** Translate form field labels and placeholders
- [ ] **6.8.3** Translate button states
- [ ] **6.8.4** Translate status messages
- [ ] **6.8.5** Translate loading and error messages

### 6.9 Grid/Table/Card Translations

- [ ] **6.9.1** Translate grid ARIA labels and action labels
- [ ] **6.9.2** Translate card date formats (preserve placeholders)
- [ ] **6.9.3** Translate table ARIA labels and headers
- [ ] **6.9.4** Translate column settings dialog

### 6.10 Content Editing Translations

- [ ] **6.10.1** Translate content section title and count (verify ICU plural)
- [ ] **6.10.2** Translate remove dialog messages
- [ ] **6.10.3** Translate ARIA labels for drag-and-drop (verify ICU interpolation)

### 6.11 Instruction Editor Translations

- [ ] **6.11.1** Translate article title labels and placeholders
- [ ] **6.11.2** Translate page header with ICU interpolation

### 6.12 Validation/Delete/Empty Translations

- [ ] **6.12.1** Translate all validation error messages (preserve placeholders)
- [ ] **6.12.2** Translate delete confirmation dialog
- [ ] **6.12.3** Translate empty state messages
- [ ] **6.12.4** Translate read-only context labels

### 6.13 Final Dutch Validation

- [ ] **6.13.1** Verify formal "u" is used consistently
- [ ] **6.13.2** Verify compound words are formed correctly
- [ ] **6.13.3** Verify spelling follows Dutch conventions
- [ ] **6.13.4** Run JSON validation on nl.json
- [ ] **6.13.5** Verify all ICU message formats are syntactically correct

---

## 7. Generate Italian Translations (it.json)

**Context:** Translate all `articles.*` keys to Italian with grammatical correctness and cultural appropriateness.
**Files to modify:** `/messages/it.json`
**Estimated effort:** 3 story points

### 7.1 Editor Translations

- [ ] **7.1.1** Translate `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit` (formal "Lei")
- [ ] **7.1.2** Translate `articles.editor.placeholder` and character count messages
- [ ] **7.1.3** Translate formatting toolbar labels
- [ ] **7.1.4** Translate tabs and toolbar shortcuts (preserve keyboard shortcuts)
- [ ] **7.1.5** Translate ARIA labels for editor accessibility
- [ ] **7.1.6** Verify ICU interpolation in `characterCount` message

### 7.2 Media Translations

- [ ] **7.2.1** Translate media upload labels and instructions
- [ ] **7.2.2** Translate drag-and-drop messages
- [ ] **7.2.3** Translate file format and size messages (preserve placeholders)
- [ ] **7.2.4** Translate upload status messages

### 7.3 Crop Translations

- [ ] **7.3.1** Translate crop title and button labels
- [ ] **7.3.2** Translate aspect ratio options
- [ ] **7.3.3** Translate preview labels and processing messages
- [ ] **7.3.4** Translate error messages for crop operations
- [ ] **7.3.5** Translate ARIA labels for crop controls
- [ ] **7.3.6** Verify ICU interpolation in ARIA labels

### 7.4 Video Translations

- [ ] **7.4.1** Translate video trimming title and controls
- [ ] **7.4.2** Translate time-related labels (preserve placeholders)
- [ ] **7.4.3** Translate markers (`start`, `end`) - use single letters (I, F for Inizio, Fine)
- [ ] **7.4.4** Translate selection display messages with ICU pluralization
- [ ] **7.4.5** Translate error messages for video operations
- [ ] **7.4.6** Translate ARIA labels for playback controls
- [ ] **7.4.7** Verify ICU interpolation in selection messages

### 7.5 Rotate Translations

- [ ] **7.5.1** Translate rotation title and button labels
- [ ] **7.5.2** Translate rotation status messages (preserve placeholders)
- [ ] **7.5.3** Translate keyboard shortcuts help (preserve symbols)
- [ ] **7.5.4** Translate error messages for rotation operations
- [ ] **7.5.5** Translate ARIA labels for rotation controls
- [ ] **7.5.6** Verify ICU interpolation in rotation messages

### 7.6 Purposes Translations

- [ ] **7.6.1** Translate all content purpose categories
- [ ] **7.6.2** Ensure consistency with common terminology choices

### 7.7 List Page Translations

- [ ] **7.7.1** Translate list page title and subtitle
- [ ] **7.7.2** Translate ICU plural count message (verify Italian plural rules)
- [ ] **7.7.3** Translate search labels and placeholders
- [ ] **7.7.4** Translate column headers
- [ ] **7.7.5** Translate sort options
- [ ] **7.7.6** Translate view mode labels
- [ ] **7.7.7** Translate filter labels and messages
- [ ] **7.7.8** Translate loading and login messages

### 7.8 Edit Page Translations

- [ ] **7.8.1** Translate edit page title and navigation labels
- [ ] **7.8.2** Translate form field labels and placeholders
- [ ] **7.8.3** Translate button states
- [ ] **7.8.4** Translate status messages
- [ ] **7.8.5** Translate loading and error messages

### 7.9 Grid/Table/Card Translations

- [ ] **7.9.1** Translate grid ARIA labels and action labels
- [ ] **7.9.2** Translate card date formats (preserve placeholders)
- [ ] **7.9.3** Translate table ARIA labels and headers
- [ ] **7.9.4** Translate column settings dialog

### 7.10 Content Editing Translations

- [ ] **7.10.1** Translate content section title and count (verify ICU plural)
- [ ] **7.10.2** Translate remove dialog messages
- [ ] **7.10.3** Translate ARIA labels for drag-and-drop (verify ICU interpolation)

### 7.11 Instruction Editor Translations

- [ ] **7.11.1** Translate article title labels and placeholders
- [ ] **7.11.2** Translate page header with ICU interpolation

### 7.12 Validation/Delete/Empty Translations

- [ ] **7.12.1** Translate all validation error messages (preserve placeholders)
- [ ] **7.12.2** Translate delete confirmation dialog
- [ ] **7.12.3** Translate empty state messages
- [ ] **7.12.4** Translate read-only context labels

### 7.13 Final Italian Validation

- [ ] **7.13.1** Verify all accents are correct (à, è, é, ì, ò, ù)
- [ ] **7.13.2** Verify formal "Lei" is used consistently
- [ ] **7.13.3** Verify gender agreement for all adjectives
- [ ] **7.13.4** Run JSON validation on it.json
- [ ] **7.13.5** Verify all ICU message formats are syntactically correct

---

## 8. Validate JSON Structure and ICU Syntax

**Context:** Ensure all translation files have valid JSON structure and correct ICU message format syntax.
**Files to validate:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated effort:** 1 story point

- [ ] **8.1** Run JSON syntax validation on fr.json
- [ ] **8.2** Run JSON syntax validation on es.json
- [ ] **8.3** Run JSON syntax validation on de.json
- [ ] **8.4** Run JSON syntax validation on nl.json
- [ ] **8.5** Run JSON syntax validation on it.json
- [ ] **8.6** Verify all ICU plural formats use correct CLDR plural categories for French
- [ ] **8.7** Verify all ICU plural formats use correct CLDR plural categories for Spanish
- [ ] **8.8** Verify all ICU plural formats use correct CLDR plural categories for German
- [ ] **8.9** Verify all ICU plural formats use correct CLDR plural categories for Dutch
- [ ] **8.10** Verify all ICU plural formats use correct CLDR plural categories for Italian
- [ ] **8.11** Verify all variable placeholders are preserved exactly (e.g., `{count}`, `{degrees}`, `{max}`)
- [ ] **8.12** Verify all nested keys exist in all 5 files with identical structure
- [ ] **8.13** Run `npx tsc --noEmit` to check for TypeScript type errors
- [ ] **8.14** Fix any JSON or ICU syntax errors found

**ICU Plural Rules Reference:**

| Language | CLDR Categories | Example |
|----------|-----------------|---------|
| French | `one`, `other` | `{count, plural, one {# guide} other {# guides}}` |
| Spanish | `one`, `other` | `{count, plural, one {# guía} other {# guías}}` |
| German | `one`, `other` | `{count, plural, one {# Anleitung} other {# Anleitungen}}` |
| Dutch | `one`, `other` | `{count, plural, one {# gids} other {# gidsen}}` |
| Italian | `one`, `other` | `{count, plural, one {# guida} other {# guide}}` |

---

## 9. Test Translations in Application

**Context:** Manually test translations by switching locale in browser to verify translations display correctly.
**Estimated effort:** 2 story points

### 9.1 Test French Locale

- [ ] **9.1.1** Set browser to French locale (`fr`)
- [ ] **9.1.2** Navigate to instructions list page and verify all UI elements display in French
- [ ] **9.1.3** Test editor component: verify toolbar, tabs, and character count display in French
- [ ] **9.1.4** Test image crop editor: verify aspect ratio labels and buttons display in French
- [ ] **9.1.5** Test video trim editor: verify markers and time labels display in French
- [ ] **9.1.6** Test image rotation editor: verify rotation controls display in French
- [ ] **9.1.7** Verify plural forms work correctly (e.g., "1 guide" vs "2 guides")
- [ ] **9.1.8** Verify ICU interpolation works (character count, rotation degrees)
- [ ] **9.1.9** Check for any missing translation warnings in browser console

### 9.2 Test Spanish Locale

- [ ] **9.2.1** Set browser to Spanish locale (`es`)
- [ ] **9.2.2** Navigate to instructions list page and verify all UI elements display in Spanish
- [ ] **9.2.3** Test editor component: verify toolbar, tabs, and character count display in Spanish
- [ ] **9.2.4** Test image crop editor: verify aspect ratio labels and buttons display in Spanish
- [ ] **9.2.5** Test video trim editor: verify markers and time labels display in Spanish
- [ ] **9.2.6** Test image rotation editor: verify rotation controls display in Spanish
- [ ] **9.2.7** Verify plural forms work correctly
- [ ] **9.2.8** Verify ICU interpolation works
- [ ] **9.2.9** Check for any missing translation warnings in browser console

### 9.3 Test German Locale

- [ ] **9.3.1** Set browser to German locale (`de`)
- [ ] **9.3.2** Navigate to instructions list page and verify all UI elements display in German
- [ ] **9.3.3** Test editor component: verify toolbar, tabs, and character count display in German
- [ ] **9.3.4** Test image crop editor: verify aspect ratio labels and buttons display in German
- [ ] **9.3.5** Test video trim editor: verify markers and time labels display in German
- [ ] **9.3.6** Test image rotation editor: verify rotation controls display in German
- [ ] **9.3.7** Verify plural forms work correctly
- [ ] **9.3.8** Verify ICU interpolation works
- [ ] **9.3.9** Check for any missing translation warnings in browser console
- [ ] **9.3.10** Verify German capitalization is correct (all nouns capitalized)

### 9.4 Test Dutch Locale

- [ ] **9.4.1** Set browser to Dutch locale (`nl`)
- [ ] **9.4.2** Navigate to instructions list page and verify all UI elements display in Dutch
- [ ] **9.4.3** Test editor component: verify toolbar, tabs, and character count display in Dutch
- [ ] **9.4.4** Test image crop editor: verify aspect ratio labels and buttons display in Dutch
- [ ] **9.4.5** Test video trim editor: verify markers and time labels display in Dutch
- [ ] **9.4.6** Test image rotation editor: verify rotation controls display in Dutch
- [ ] **9.4.7** Verify plural forms work correctly
- [ ] **9.4.8** Verify ICU interpolation works
- [ ] **9.4.9** Check for any missing translation warnings in browser console

### 9.5 Test Italian Locale

- [ ] **9.5.1** Set browser to Italian locale (`it`)
- [ ] **9.5.2** Navigate to instructions list page and verify all UI elements display in Italian
- [ ] **9.5.3** Test editor component: verify toolbar, tabs, and character count display in Italian
- [ ] **9.5.4** Test image crop editor: verify aspect ratio labels and buttons display in Italian
- [ ] **9.5.5** Test video trim editor: verify markers and time labels display in Italian
- [ ] **9.5.6** Test image rotation editor: verify rotation controls display in Italian
- [ ] **9.5.7** Verify plural forms work correctly
- [ ] **9.5.8** Verify ICU interpolation works
- [ ] **9.5.9** Check for any missing translation warnings in browser console

### 9.6 Cross-locale Consistency Check

- [ ] **9.6.1** Verify button labels are consistent across all 5 locales (same position, similar length)
- [ ] **9.6.2** Verify no layout breaking due to long translations (especially German)
- [ ] **9.6.3** Verify ARIA labels are properly translated in all locales
- [ ] **9.6.4** Document any UI/UX issues found during testing

---

## 10. Run Full Verification Suite

**Context:** Ensure all changes compile and work correctly together.
**Estimated effort:** 0.5 story points

- [ ] **10.1** Run TypeScript type check: `npx tsc --noEmit`
- [ ] **10.2** Run lint check: `npm run lint`
- [ ] **10.3** Run build: `npm run build`
- [ ] **10.4** Verify build succeeds without translation-related errors
- [ ] **10.5** Verify all 6 language files (en, fr, es, de, nl, it) have identical structure
- [ ] **10.6** Document any discrepancies or issues found

---

## Authorized Files for Modification

### Translation Files (Modify)

| File | Modification Type | Notes |
|------|-------------------|-------|
| `/messages/fr.json` | Modify | Replace English placeholders with French translations |
| `/messages/es.json` | Modify | Replace English placeholders with Spanish translations |
| `/messages/de.json` | Modify | Replace English placeholders with German translations |
| `/messages/nl.json` | Modify | Replace English placeholders with Dutch translations |
| `/messages/it.json` | Modify | Replace English placeholders with Italian translations |

### Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source of truth for all translation keys |
| `/docs/REQ-E02-070-create-articles-namespace-structure-detailed.md` | Reference for namespace structure |
| `/docs/REQ-E02-071-update-editor-components-detailed.md` | Reference for editor translations |
| `/docs/REQ-E02-072-update-media-handling-components-detailed.md` | Reference for media translations |
| `/docs/REQ-E02-073-update-croptrim-utilities-detailed.md` | Reference for crop/rotate translations |
| `/docs/REQ-E02-074-update-instructions-pages-detailed.md` | Reference for list/edit page translations |

---

## Translation Quality Guidelines

### General Principles

1. **Grammatical Correctness**: All translations must be grammatically correct in the target language
2. **Cultural Appropriateness**: Use culturally appropriate terms and phrasing
3. **Formality Level**: Use formal address (vous/usted/Sie/u/Lei) consistently
4. **Consistency**: Use the same translation for the same English term across all keys
5. **Preserve Formatting**: Maintain all ICU message format syntax and variable placeholders
6. **Natural Flow**: Translations should read naturally, not like literal word-for-word translations
7. **Terminology**: Follow established terminology glossary for common UI elements

### ICU Message Format Preservation

**CRITICAL:** All ICU syntax must be preserved exactly:

```json
// CORRECT - Placeholder preserved
"characterCount": "{current, number} / {max, number} caractères"

// WRONG - Placeholder modified
"characterCount": "{actuel, nombre} / {maximum, nombre} caractères"
```

**CORRECT:** Variable placeholders (`{count}`, `{degrees}`, `{max}`, `{date}`, etc.) must be preserved exactly as in English.

### Plural Form Guidelines

Each language has specific CLDR plural categories:

- **French**: `one` (n = 0 or 1), `other` (n > 1)
- **Spanish**: `one` (n = 1), `other` (n ≠ 1)
- **German**: `one` (n = 1), `other` (n ≠ 1)
- **Dutch**: `one` (n = 1), `other` (n ≠ 1)
- **Italian**: `one` (n = 1), `other` (n ≠ 1)

### Language-Specific Notes

#### French
- Use guillemets (« ») for quotations if needed
- Use formal "vous"
- Verify gender agreement for adjectives
- Accents: é, è, ê, à, ù, ç

#### Spanish
- Use inverted question/exclamation marks (¿?, ¡!)
- Use formal "usted"
- Verify gender agreement for adjectives
- Accents: á, é, í, ó, ú, ñ

#### German
- Capitalize ALL nouns
- Use formal "Sie" (capitalized)
- Use compound nouns where appropriate
- Umlauts: ä, ö, ü, ß

#### Dutch
- Use formal "u"
- Use compound words where appropriate
- Follow Dutch spelling conventions

#### Italian
- Use formal "Lei" (capitalized)
- Verify gender agreement for adjectives
- Accents: à, è, é, ì, ò, ù

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation accuracy issues | Medium | Medium | Use native speaker review if possible, verify with online resources |
| ICU syntax errors | Low | High | Validate all ICU messages programmatically |
| Plural form mistakes | Medium | Medium | Reference CLDR rules for each language |
| Variable placeholder corruption | Low | High | Use find/replace carefully, validate placeholders preserved |
| Cultural inappropriateness | Low | Medium | Research cultural norms for each language |
| Terminology inconsistency | Medium | Low | Create and follow terminology glossary |
| Layout breaking due to long translations | Medium | Medium | Test UI with longest translations (especially German) |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.*` namespace structure | Complete |
| **REQ-E02-071** (Task 2E.2) | Editor component translations | Complete |
| **REQ-E02-072** (Task 2E.3) | Media handling component translations | Complete |
| **REQ-E02-073** (Task 2E.4) | Crop/trim utility translations | Complete |
| **REQ-E02-074** (Task 2E.5) | Instructions pages translations | Complete |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| Sub-Epic 2E Completion | All `articles` namespace translations complete in 6 languages |
| Epic 2 Completion | Static UI translation complete |

---

## References

- **Overview Document:** `docs/REQ-E02-075-generate-translations-for-5-non-english-languages-overview.md`
- **Request Source:** `docs/gen_requests_epic2.md` - REQ-E02-075
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Related Tasks:**
  - REQ-E02-070: Create `articles` namespace structure
  - REQ-E02-071: Update editor components
  - REQ-E02-072: Update media handling components
  - REQ-E02-073: Update crop/trim utilities
  - REQ-E02-074: Update instructions pages
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **CLDR Plural Rules:** https://cldr.unicode.org/index/cldr-spec/plural-rules

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
*Task ID: 2E.6 - Generate translations for 5 non-English languages*
*Last Modified: 2026-01-22 18:36*
