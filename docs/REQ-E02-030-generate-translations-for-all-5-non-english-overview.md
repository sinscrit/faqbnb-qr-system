# Implementation Overview: REQ-E02-030 - Generate Translations for Common and Shared Components Namespace

**Document Created:** 2026-01-20 22:30:00 UTC
**Last Modified:** 2026-01-20 22:30:00 UTC

**Request ID:** REQ-E02-030
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.10
**Size:** L (Large)
**Priority:** P1 - High (Foundation for all other sub-epics)

---

## 1. Summary

Generate translation files for all common and shared components namespace strings in the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task follows the extraction and restructuring of common namespace strings from Tasks 2H.1-2H.9, which include buttons, modals, dialogs, forms, toast notifications, empty states, loading states, confirmation dialogs, and date/time formatting strings. The common namespace contains approximately 800+ unique strings that serve as the foundation for all other Epic 2 sub-epics.

This is a critical task because the `common` namespace provides reusable strings used across the entire application. High-quality translations here ensure consistency throughout all translated UI elements.

---

## 2. Current State Analysis

### 2.1 Source English Strings Location

The English source strings exist in `/messages/en.json` under the `common` namespace (and related shared categories), added by Tasks 2H.1-2H.9.

### 2.2 Existing Translation File Structure

| Language File | Path | Current State |
|---------------|------|---------------|
| English (source) | `/messages/en.json` | Contains expanded `common` namespace with categorized structure |
| French | `/messages/fr.json` | Has basic `common` namespace; needs expansion with categorized strings |
| Spanish | `/messages/es.json` | Has basic `common` namespace; needs expansion with categorized strings |
| German | `/messages/de.json` | Has basic `common` namespace; needs expansion with categorized strings |
| Dutch | `/messages/nl.json` | Has basic `common` namespace; needs expansion with categorized strings |
| Italian | `/messages/it.json` | Has basic `common` namespace; needs expansion with categorized strings |

### 2.3 Supported Languages Configuration

Per `/src/lib/i18n/config.ts`:

| Code | English Name | Native Name | Flag |
|------|--------------|-------------|------|
| en | English | English | GB |
| fr | French | Francais | FR |
| es | Spanish | Espanol | ES |
| de | German | Deutsch | DE |
| nl | Dutch | Nederlands | NL |
| it | Italian | Italiano | IT |

### 2.4 Strings to Translate by Category

Based on Tasks 2H.1-2H.9, the common namespace includes:

#### 2.4.1 Button Labels (Task 2H.2) - ~50 strings
- Primary actions: save, cancel, delete, edit, create, submit, close, back, next
- Secondary actions: confirm, done, continue, retry, refresh, search, filter, sort
- Tertiary actions: clear, reset, apply, view, viewAll, showMore, showLess
- Selection actions: selectAll, deselectAll, copy, share, download, upload
- Loading variants: saving, deleting, creating, updating, processing

#### 2.4.2 Modal/Dialog Strings (Task 2H.3) - ~100 strings
- Modal titles: Confirm Action, Delete Confirmation, Unsaved Changes
- Modal descriptions and body text
- Action buttons specific to modals
- Close/dismiss patterns
- Accessibility labels (aria-labels, roles)

#### 2.4.3 Form Element Strings (Task 2H.4) - ~150 strings
- Generic labels: Email, Password, Name, Description, etc.
- Placeholders: "Enter your...", "Select...", "Search..."
- Hint text and helper messages
- Required/optional indicators
- Character count messages

#### 2.4.4 Toast Notification Messages (Task 2H.5) - ~50 strings
- Success messages: "Saved successfully", "Created successfully"
- Error messages: "Failed to save", "An error occurred"
- Warning messages: "Unsaved changes", "Session expiring"
- Info messages: "Loading data", "Processing request"

#### 2.4.5 Empty State Messages (Task 2H.6) - ~80 strings
- No data messages: "No items yet", "No results found"
- Call to action text: "Create your first item", "Add something new"
- Suggestion text: "Try different filters", "Adjust your search"
- Illustration alt text

#### 2.4.6 Loading State Messages (Task 2H.7) - ~30 strings
- Loading indicators: "Loading...", "Please wait"
- Progress messages: "Processing", "Almost done"
- Skeleton text placeholders

#### 2.4.7 Confirmation Dialog Messages (Task 2H.8) - ~60 strings
- Titles: "Confirm Delete", "Confirm Action", "Discard Changes?"
- Body text with variable interpolation
- Warning messages about irreversible actions
- Action buttons: Confirm, Cancel, Delete, Discard

#### 2.4.8 Date/Time Formatting (Task 2H.9) - ~30 strings
- Relative time: "just now", "minutes ago", "hours ago", "days ago"
- Absolute labels: "today", "yesterday", "tomorrow"
- Date format hints
- Timezone indicators

### 2.5 String Categories Summary

| Category | Estimated Count | Notes |
|----------|-----------------|-------|
| Button labels | ~50 | Action verbs, loading states |
| Modal/dialog strings | ~100 | Titles, descriptions, actions |
| Form element strings | ~150 | Labels, placeholders, hints |
| Toast notifications | ~50 | Success, error, warning, info |
| Empty state messages | ~80 | No data, CTAs, suggestions |
| Loading state messages | ~30 | Progress indicators |
| Confirmation dialogs | ~60 | Delete, discard, confirm patterns |
| Date/time formatting | ~30 | Relative time, absolute labels |
| Status indicators | ~40 | Active, inactive, pending, etc. |
| Pagination | ~20 | Previous, next, page counts |
| Tooltips | ~100 | Component-specific help text |
| Navigation labels | ~50 | Menu items, breadcrumbs |
| Accessibility | ~40 | Aria-labels, screen reader text |
| **Total** | **~800** | |

---

## 3. Technical Approach

### 3.1 Translation Strategy

1. **Semantic Accuracy**: Translations must convey the exact meaning and intent of the source English text
2. **Contextual Appropriateness**: UI terminology should be consistent and user-friendly
3. **Tone Consistency**: Button labels should be concise and action-oriented across all languages
4. **Formal vs. Informal**:
   - French: Use formal "vous" for general UI, consider informal where appropriate for friendly messages
   - German: Use formal "Sie" consistently
   - Spanish: Use formal "usted" for business context
   - Dutch: Use formal "u" for professional context
   - Italian: Use formal "Lei" for professional context
5. **Interpolation Preservation**: All `{variable}` placeholders must be preserved exactly in translations
6. **ICU Format Compliance**: Pluralization patterns must follow ICU MessageFormat specification for each language
7. **Character Encoding**: Proper UTF-8 encoding for all accented characters and special symbols

### 3.2 Translation Key Preservation

All translation keys must remain identical across language files. Only the values are translated:

```json
// English
"common.actions.save": "Save"

// French
"common.actions.save": "Enregistrer"

// German
"common.actions.save": "Speichern"
```

### 3.3 ICU Pluralization Patterns

Each language has specific pluralization rules that must be respected:

```json
// English
"common.time.minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}"

// French
"common.time.minutesAgo": "{count, plural, one {il y a # minute} other {il y a # minutes}}"

// German
"common.time.minutesAgo": "{count, plural, one {vor # Minute} other {vor # Minuten}}"

// Spanish
"common.time.minutesAgo": "{count, plural, one {hace # minuto} other {hace # minutos}}"
```

### 3.4 Variable Interpolation

Variables must be preserved exactly as they appear in source strings:

```json
// English
"common.pagination.showing": "Showing {start} to {end} of {total}"

// French
"common.pagination.showing": "Affichage de {start} a {end} sur {total}"

// German
"common.pagination.showing": "Zeigt {start} bis {end} von {total}"
```

### 3.5 Button Label Guidelines

Button labels should be:
- **Concise**: 1-3 words maximum
- **Action-oriented**: Use verbs in imperative form
- **Consistent**: Same action = same translation throughout

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Save | Guardar | Enregistrer | Speichern | Opslaan | Salva |
| Cancel | Cancelar | Annuler | Abbrechen | Annuleren | Annulla |
| Delete | Eliminar | Supprimer | Loschen | Verwijderen | Elimina |
| Edit | Editar | Modifier | Bearbeiten | Bewerken | Modifica |
| Create | Crear | Creer | Erstellen | Maken | Crea |
| Close | Cerrar | Fermer | Schliessen | Sluiten | Chiudi |

### 3.6 Toast Notification Tone Guidelines

| Message Type | Tone Guideline | Example (English) |
|--------------|----------------|-------------------|
| Success | Positive, brief | "Saved successfully" |
| Error | Helpful, not blaming | "Could not save. Please try again." |
| Warning | Alert without alarm | "You have unsaved changes" |
| Info | Neutral, informative | "Loading your data..." |

---

## 4. Implementation Tasks

### Task 1: Compile Complete English Source Strings
- Extract final `common` namespace structure from `/messages/en.json`
- Verify all strings from Tasks 2H.1-2H.9 are present and categorized
- Create translation source document for reference
- Identify all ICU patterns and interpolation variables

### Task 2: Generate French Translations
- Translate all `common` namespace strings to French
- Use formal address ("vous") for user-facing messages
- Verify pluralization patterns follow French grammar rules
- Verify variable interpolation
- Ensure accented characters are properly encoded (e, a, c, etc.)

### Task 3: Generate Spanish Translations
- Translate all `common` namespace strings to Spanish
- Use formal address ("usted") for business context
- Verify pluralization patterns
- Verify variable interpolation
- Ensure accented characters and n are properly encoded

### Task 4: Generate German Translations
- Translate all `common` namespace strings to German
- Use formal address ("Sie") consistently
- Verify pluralization patterns (German has specific rules)
- Account for compound words and longer text
- Ensure umlauts (a, o, u) and eszett (ss) are properly encoded

### Task 5: Generate Dutch Translations
- Translate all `common` namespace strings to Dutch
- Use formal address ("u") for professional context
- Verify pluralization patterns
- Verify variable interpolation

### Task 6: Generate Italian Translations
- Translate all `common` namespace strings to Italian
- Use formal address ("Lei") for professional context
- Verify pluralization patterns (Italian has unique rules)
- Verify variable interpolation
- Ensure accented characters are properly encoded (a, e, i, o, u)

### Task 7: Update Translation Files
- Update `/messages/fr.json` with complete `common` namespace translations
- Update `/messages/es.json` with complete `common` namespace translations
- Update `/messages/de.json` with complete `common` namespace translations
- Update `/messages/nl.json` with complete `common` namespace translations
- Update `/messages/it.json` with complete `common` namespace translations

### Task 8: Verification and Quality Check
- Verify all keys match between English and translated files
- Verify no missing translations in any language
- Verify all interpolation variables preserved correctly
- Verify pluralization syntax correct for each language
- Verify character encoding correct (UTF-8)
- Run build to verify no translation errors: `npm run build`
- Test sample strings in development mode

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/fr.json` | French translations | Update/expand `common` namespace with categorized translations |
| `/messages/es.json` | Spanish translations | Update/expand `common` namespace with categorized translations |
| `/messages/de.json` | German translations | Update/expand `common` namespace with categorized translations |
| `/messages/nl.json` | Dutch translations | Update/expand `common` namespace with categorized translations |
| `/messages/it.json` | Italian translations | Update/expand `common` namespace with categorized translations |

### 5.2 Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify in this task) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |
| `/src/lib/i18n/index.ts` | i18n utilities reference |

### 5.3 Files NOT to Modify

- `/messages/en.json` - English source should already be complete from Tasks 2H.1-2H.9
- `/src/components/*.tsx` - Component files should not be modified in this task
- `/src/app/**/*.tsx` - Page files should not be modified in this task
- `/src/lib/i18n/*.ts` - Configuration files should not be modified
- Any TypeScript/JavaScript source files
- Database migrations
- API routes

---

## 6. Dependencies

### 6.1 Required Completions Before This Task

| Task | Status | Notes |
|------|--------|-------|
| 2H.1: Create common namespace structure | Must be Complete | Categorized namespace exists in en.json |
| 2H.2: Extract button labels | Must be Complete | Button strings in en.json |
| 2H.3: Extract modal/dialog strings | Must be Complete | Modal strings in en.json |
| 2H.4: Extract form element strings | Must be Complete | Form strings in en.json |
| 2H.5: Extract toast notifications | Must be Complete | Toast strings in en.json |
| 2H.6: Extract empty state messages | Must be Complete | Empty state strings in en.json |
| 2H.7: Extract loading state messages | Must be Complete | Loading strings in en.json |
| 2H.8: Extract confirmation dialogs | Must be Complete | Confirmation strings in en.json |
| 2H.9: Create date/time formatting | Must be Complete | Time strings in en.json |
| Epic 1: i18n Foundation | Must be Complete | Translation infrastructure operational |

### 6.2 Post-Completion Usage

After this task completes, the following capabilities will be available in all 6 languages:

- **All reusable UI elements**: Buttons, status indicators, pagination
- **All modal/dialog patterns**: Confirmations, alerts, prompts
- **All form patterns**: Labels, placeholders, validation hints
- **All feedback patterns**: Toast notifications, empty states, loading states
- **All time formatting**: Relative and absolute date/time displays

This enables all subsequent Epic 2 sub-epics (2A-2G, 2I, 2J) to reference common strings instead of creating duplicates.

---

## 7. Acceptance Criteria

### 7.1 Completeness

- [ ] French translation file includes complete translations for all common namespace strings (buttons, modals, dialogs, forms, notifications, empty states, loading states, confirmations, date/time)
- [ ] Spanish translation file includes complete translations for all common namespace strings
- [ ] German translation file includes complete translations for all common namespace strings
- [ ] Dutch translation file includes complete translations for all common namespace strings
- [ ] Italian translation file includes complete translations for all common namespace strings

### 7.2 Semantic Accuracy

- [ ] All translations maintain semantic accuracy with the source English text
- [ ] Button labels are translated concisely while preserving action clarity and urgency where applicable
- [ ] Modal and dialog messages maintain appropriate formality and tone for each language
- [ ] Form element labels and placeholders follow natural phrasing conventions for each language
- [ ] Toast notification messages convey success, error, warning, and info tones appropriately across cultures
- [ ] Empty state messages maintain helpful, encouraging tone without sounding patronizing in any language
- [ ] Loading state messages set appropriate expectations for wait times across all languages
- [ ] Confirmation dialog prompts convey appropriate urgency and consequence clarity for destructive vs. non-destructive actions

### 7.3 Technical Correctness

- [ ] Character encoding is correct for all accented characters (e, n, u, a, etc.)
- [ ] All interpolation variables (`{name}`, `{count}`, `{start}`, `{end}`, `{total}`, etc.) are preserved exactly in translated strings
- [ ] Pluralization patterns use correct ICU MessageFormat syntax for each language
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files maintain identical key structure across all languages

### 7.4 Build Verification

- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully: `npm run build`
- [ ] No missing translation key warnings in console
- [ ] Application loads without errors in all supported languages

---

## 8. Testing Checklist

### 8.1 Translation Verification Per Language

#### French (fr)
- [ ] All button labels display correctly in French
- [ ] Modal titles and content display in French
- [ ] Form labels and placeholders display in French
- [ ] Toast notifications display appropriate messages in French
- [ ] Empty states show encouraging messages in French
- [ ] Loading states display in French
- [ ] Pluralization works correctly ("1 minute", "5 minutes")
- [ ] Relative time displays correctly ("il y a 5 minutes")

#### Spanish (es)
- [ ] All button labels display correctly in Spanish
- [ ] Modal titles and content display in Spanish
- [ ] Form labels and placeholders display in Spanish
- [ ] Toast notifications display appropriate messages in Spanish
- [ ] Empty states show encouraging messages in Spanish
- [ ] Loading states display in Spanish
- [ ] Pluralization works correctly ("1 minuto", "5 minutos")
- [ ] Relative time displays correctly ("hace 5 minutos")

#### German (de)
- [ ] All button labels display correctly in German
- [ ] Modal titles and content display in German
- [ ] Form labels and placeholders display in German
- [ ] Toast notifications display appropriate messages in German
- [ ] Empty states show encouraging messages in German
- [ ] Loading states display in German
- [ ] Text does not overflow UI elements (German text is typically longer)
- [ ] Pluralization works correctly ("1 Minute", "5 Minuten")
- [ ] Umlauts display correctly (a, o, u)

#### Dutch (nl)
- [ ] All button labels display correctly in Dutch
- [ ] Modal titles and content display in Dutch
- [ ] Form labels and placeholders display in Dutch
- [ ] Toast notifications display appropriate messages in Dutch
- [ ] Empty states show encouraging messages in Dutch
- [ ] Loading states display in Dutch
- [ ] Pluralization works correctly

#### Italian (it)
- [ ] All button labels display correctly in Italian
- [ ] Modal titles and content display in Italian
- [ ] Form labels and placeholders display in Italian
- [ ] Toast notifications display appropriate messages in Italian
- [ ] Empty states show encouraging messages in Italian
- [ ] Loading states display in Italian
- [ ] Pluralization works correctly ("1 minuto", "5 minuti")
- [ ] Accented characters display correctly

### 8.2 Cross-Language Consistency
- [ ] Same actions have consistent translations across all components
- [ ] Action buttons maintain similar length for UI consistency
- [ ] Error messages convey equivalent severity and meaning
- [ ] Success messages convey equivalent positivity
- [ ] Confirmation dialogs convey equivalent urgency

### 8.3 Interpolation Testing
- [ ] Pagination shows correct values in all languages
- [ ] Relative time displays correct counts in all languages
- [ ] Character count displays work in all languages
- [ ] Any messages with names/values interpolate correctly

### 8.4 Visual Regression
- [ ] No text truncation in buttons across languages
- [ ] No text overflow in form labels across languages
- [ ] No text overflow in modal titles across languages
- [ ] Toast notifications accommodate longer translated text
- [ ] Empty state messages don't break layouts

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Use professional terminology, maintain glossary, review key strings |
| Missing interpolation variables | Low | High | Automated check for `{variable}` patterns, compare with English |
| Incorrect pluralization syntax | Medium | Medium | Verify ICU format for each language, test with various counts |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding, test special characters in browser |
| Inconsistent terminology | Medium | Medium | Create terminology glossary, grep for inconsistencies |
| Build failures from malformed JSON | Low | High | Validate JSON syntax before committing, use JSON linter |
| Text overflow in UI | Medium | Low | Test with German (longest text), adjust component styles if needed |
| Cultural inappropriateness | Low | Medium | Review tone of error messages and confirmations per culture |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Compile English source strings and create reference | 30 minutes |
| Generate French translations (~800 strings) | 2 hours |
| Generate Spanish translations (~800 strings) | 2 hours |
| Generate German translations (~800 strings) | 2.5 hours |
| Generate Dutch translations (~800 strings) | 2 hours |
| Generate Italian translations (~800 strings) | 2 hours |
| Update all translation files | 30 minutes |
| Verification and quality check | 1 hour |
| Build verification and testing | 30 minutes |
| **Total** | **~13 hours** |

**Note**: This is a large task due to the high string count (~800 per language, ~4000 total translations). Consider breaking into multiple sessions or parallelizing language generation.

---

## 11. Translation Reference

### 11.1 Core Action Terms Glossary

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Save | Guardar | Enregistrer | Speichern | Opslaan | Salva |
| Cancel | Cancelar | Annuler | Abbrechen | Annuleren | Annulla |
| Delete | Eliminar | Supprimer | Loschen | Verwijderen | Elimina |
| Edit | Editar | Modifier | Bearbeiten | Bewerken | Modifica |
| Create | Crear | Creer | Erstellen | Maken | Crea |
| Close | Cerrar | Fermer | Schliessen | Sluiten | Chiudi |
| Confirm | Confirmar | Confirmer | Bestatigen | Bevestigen | Conferma |
| Submit | Enviar | Soumettre | Absenden | Verzenden | Invia |
| Search | Buscar | Rechercher | Suchen | Zoeken | Cerca |
| Filter | Filtrar | Filtrer | Filtern | Filteren | Filtra |
| Loading | Cargando | Chargement | Wird geladen | Laden | Caricamento |
| Success | Exito | Succes | Erfolg | Succes | Successo |
| Error | Error | Erreur | Fehler | Fout | Errore |

### 11.2 Sample Full Translations

#### Confirmation Dialog Pattern

**English:**
```json
"confirmation": {
  "title": "Confirm Action",
  "deleteTitle": "Confirm Delete",
  "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
  "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
  "yes": "Yes",
  "no": "No"
}
```

**French:**
```json
"confirmation": {
  "title": "Confirmer l'action",
  "deleteTitle": "Confirmer la suppression",
  "deleteMessage": "Etes-vous sur de vouloir supprimer ceci ? Cette action est irreversible.",
  "unsavedChanges": "Vous avez des modifications non enregistrees. Etes-vous sur de vouloir quitter ?",
  "yes": "Oui",
  "no": "Non"
}
```

**Spanish:**
```json
"confirmation": {
  "title": "Confirmar accion",
  "deleteTitle": "Confirmar eliminacion",
  "deleteMessage": "Esta seguro de que desea eliminar esto? Esta accion no se puede deshacer.",
  "unsavedChanges": "Tiene cambios sin guardar. Esta seguro de que desea salir?",
  "yes": "Si",
  "no": "No"
}
```

**German:**
```json
"confirmation": {
  "title": "Aktion bestatigen",
  "deleteTitle": "Loschen bestatigen",
  "deleteMessage": "Sind Sie sicher, dass Sie dies loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
  "unsavedChanges": "Sie haben ungespeicherte Anderungen. Sind Sie sicher, dass Sie gehen mochten?",
  "yes": "Ja",
  "no": "Nein"
}
```

**Dutch:**
```json
"confirmation": {
  "title": "Actie bevestigen",
  "deleteTitle": "Verwijderen bevestigen",
  "deleteMessage": "Weet u zeker dat u dit wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
  "unsavedChanges": "U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u wilt vertrekken?",
  "yes": "Ja",
  "no": "Nee"
}
```

**Italian:**
```json
"confirmation": {
  "title": "Conferma azione",
  "deleteTitle": "Conferma eliminazione",
  "deleteMessage": "Sei sicuro di voler eliminare questo? Questa azione non puo essere annullata.",
  "unsavedChanges": "Hai modifiche non salvate. Sei sicuro di voler uscire?",
  "yes": "Si",
  "no": "No"
}
```

#### Relative Time Pattern (ICU Format)

**English:**
```json
"time": {
  "justNow": "Just now",
  "minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}",
  "hoursAgo": "{count, plural, one {# hour ago} other {# hours ago}}",
  "daysAgo": "{count, plural, one {# day ago} other {# days ago}}",
  "today": "Today",
  "yesterday": "Yesterday"
}
```

**French:**
```json
"time": {
  "justNow": "A l'instant",
  "minutesAgo": "{count, plural, one {il y a # minute} other {il y a # minutes}}",
  "hoursAgo": "{count, plural, one {il y a # heure} other {il y a # heures}}",
  "daysAgo": "{count, plural, one {il y a # jour} other {il y a # jours}}",
  "today": "Aujourd'hui",
  "yesterday": "Hier"
}
```

**German:**
```json
"time": {
  "justNow": "Gerade eben",
  "minutesAgo": "{count, plural, one {vor # Minute} other {vor # Minuten}}",
  "hoursAgo": "{count, plural, one {vor # Stunde} other {vor # Stunden}}",
  "daysAgo": "{count, plural, one {vor # Tag} other {vor # Tagen}}",
  "today": "Heute",
  "yesterday": "Gestern"
}
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2H section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-030
- [REQ-E02-001: Common Namespace Structure](/docs/REQ-E02-001-create-common-namespace-structure-in-overview.md)
- [REQ-E02-002: Button Labels](/docs/REQ-E02-002-extract-button-labels-across-all-components-overview.md)
- [REQ-E02-003: Modal/Dialog Strings](/docs/REQ-E02-003-extract-modaldialog-strings-overview.md)
- [REQ-E02-004: Form Element Strings](/docs/REQ-E02-004-extract-form-element-strings-labels-placeholders-overview.md)
- [REQ-E02-005: Toast Notifications](/docs/REQ-E02-005-extract-toast-notification-messages-overview.md)
- [REQ-E02-006: Empty State Messages](/docs/REQ-E02-006-extract-empty-state-messages-overview.md)
- [REQ-E02-007: Loading State Messages](/docs/REQ-E02-007-extract-loading-state-messages-overview.md)
- [REQ-E02-028: Confirmation Dialogs](/docs/REQ-E02-028-extract-confirmation-dialog-messages-overview.md)
- [REQ-E02-029: Date/Time Formatting](/docs/REQ-E02-029-create-datetime-formatting-translations-overview.md)
- [i18n Configuration](/src/lib/i18n/config.ts) - Supported locales and metadata
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2H - Common & Shared Components*
*Task 2H.10 - Generate Translations for All 5 Non-English Languages*
