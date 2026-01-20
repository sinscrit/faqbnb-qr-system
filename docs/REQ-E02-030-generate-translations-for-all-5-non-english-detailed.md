# Detailed Task Breakdown: REQ-E02-030 - Generate Translations for Common and Shared Components Namespace

**Document Created:** 2026-01-20 23:15:00 UTC
**Last Modified:** 2026-01-20 23:15:00 UTC

**Request ID:** REQ-E02-030
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.10
**Size:** L (Large)
**Priority:** P1 - High (Foundation for all other sub-epics)

---

## Executive Summary

This document provides granular, implementation-ready tasks for generating translation files for all common and shared components namespace strings in the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). The common namespace contains approximately 800+ unique strings that serve as the foundation for all other Epic 2 sub-epics.

**Prerequisites:** Tasks 2H.1-2H.9 must be complete (common namespace structure created in `/messages/en.json`)

---

## Task Breakdown

### Task 1: Audit and Compile English Source Strings

**Objective:** Extract and document all strings from `/messages/en.json` that need translation, creating a reference document.

#### Task 1.1: Read Current English Translation File
- **File:** `/messages/en.json`
- **Action:** Read the complete `common` namespace structure
- **Output:** List of all translation keys with their English values
- **Verification:** Count total number of strings in common namespace

#### Task 1.2: Document String Categories
- **Action:** Create categorized list of strings by type:
  - Buttons/Actions (save, cancel, delete, edit, etc.)
  - Status indicators (loading, success, error, etc.)
  - Confirmation messages (yes, no, confirm, etc.)
  - Form-related (required, optional, select, etc.)
  - Navigation (back, next, close, etc.)
  - Content actions (view, download, upload, copy, share, etc.)
- **Output:** Categorized string inventory with counts

#### Task 1.3: Identify ICU Patterns and Interpolation Variables
- **Action:** Scan all strings for:
  - `{variable}` interpolation patterns
  - `{count, plural, ...}` ICU pluralization patterns
  - Any other dynamic content markers
- **Output:** List of strings requiring special translation handling
- **Note:** Mark these for extra careful translation to preserve placeholders

---

### Task 2: Generate French (fr) Translations

**Objective:** Translate all `common` namespace strings to French, updating `/messages/fr.json`.

#### Task 2.1: Translate Button/Action Labels to French
- **File:** `/messages/fr.json`
- **Strings to translate:**
  | English | French |
  |---------|--------|
  | Save | Enregistrer |
  | Cancel | Annuler |
  | Delete | Supprimer |
  | Edit | Modifier |
  | Create | Créer |
  | Submit | Soumettre |
  | Close | Fermer |
  | Back | Retour |
  | Next | Suivant |
  | Confirm | Confirmer |
  | Reset | Réinitialiser |
  | Clear | Effacer |
  | Search | Rechercher |
  | Filter | Filtrer |
  | Sort | Trier |
  | View | Voir |
  | Download | Télécharger |
  | Upload | Envoyer |
  | Copy | Copier |
  | Share | Partager |
- **Tone:** Use formal "vous" for user-facing messages
- **Verification:** Button labels are concise (1-3 words)

#### Task 2.2: Translate Status Indicators to French
- **Strings to translate:**
  | English | French |
  |---------|--------|
  | Loading... | Chargement... |
  | Success | Succès |
  | Error | Erreur |
  | Yes | Oui |
  | No | Non |
  | All | Tout |
  | None | Aucun |
  | More | Plus |
  | Less | Moins |
  | Optional | Facultatif |
  | Required | Requis |
  | Actions | Actions |
  | Select | Sélectionner |

#### Task 2.3: Verify French Character Encoding
- **Action:** Ensure proper UTF-8 encoding for French accented characters:
  - é, è, ê, ë (e variants)
  - à, â (a variants)
  - ç (c cedilla)
  - ù, û (u variants)
  - î, ï (i variants)
  - ô (o circumflex)
- **Test:** Save file and verify characters display correctly

#### Task 2.4: Update French Translation File
- **File:** `/messages/fr.json`
- **Action:** Update `common` namespace with all French translations
- **Preserve:** Existing structure and key names
- **Verification:** JSON syntax is valid

---

### Task 3: Generate Spanish (es) Translations

**Objective:** Translate all `common` namespace strings to Spanish, updating `/messages/es.json`.

#### Task 3.1: Translate Button/Action Labels to Spanish
- **File:** `/messages/es.json`
- **Strings to translate:**
  | English | Spanish |
  |---------|---------|
  | Save | Guardar |
  | Cancel | Cancelar |
  | Delete | Eliminar |
  | Edit | Editar |
  | Create | Crear |
  | Submit | Enviar |
  | Close | Cerrar |
  | Back | Atrás |
  | Next | Siguiente |
  | Confirm | Confirmar |
  | Reset | Restablecer |
  | Clear | Borrar |
  | Search | Buscar |
  | Filter | Filtrar |
  | Sort | Ordenar |
  | View | Ver |
  | Download | Descargar |
  | Upload | Subir |
  | Copy | Copiar |
  | Share | Compartir |
- **Tone:** Use formal "usted" for business context
- **Verification:** Button labels maintain action clarity

#### Task 3.2: Translate Status Indicators to Spanish
- **Strings to translate:**
  | English | Spanish |
  |---------|---------|
  | Loading... | Cargando... |
  | Success | Éxito |
  | Error | Error |
  | Yes | Sí |
  | No | No |
  | All | Todo |
  | None | Ninguno |
  | More | Más |
  | Less | Menos |
  | Optional | Opcional |
  | Required | Requerido |
  | Actions | Acciones |
  | Select | Seleccionar |

#### Task 3.3: Verify Spanish Character Encoding
- **Action:** Ensure proper UTF-8 encoding for Spanish special characters:
  - á, é, í, ó, ú (vowels with accent)
  - ñ (n with tilde)
  - ü (u with diaeresis)
  - ¿, ¡ (inverted punctuation)
- **Test:** Save file and verify characters display correctly

#### Task 3.4: Update Spanish Translation File
- **File:** `/messages/es.json`
- **Action:** Update `common` namespace with all Spanish translations
- **Preserve:** Existing structure and key names
- **Verification:** JSON syntax is valid

---

### Task 4: Generate German (de) Translations

**Objective:** Translate all `common` namespace strings to German, updating `/messages/de.json`.

#### Task 4.1: Translate Button/Action Labels to German
- **File:** `/messages/de.json`
- **Strings to translate:**
  | English | German |
  |---------|--------|
  | Save | Speichern |
  | Cancel | Abbrechen |
  | Delete | Löschen |
  | Edit | Bearbeiten |
  | Create | Erstellen |
  | Submit | Absenden |
  | Close | Schließen |
  | Back | Zurück |
  | Next | Weiter |
  | Confirm | Bestätigen |
  | Reset | Zurücksetzen |
  | Clear | Leeren |
  | Search | Suchen |
  | Filter | Filtern |
  | Sort | Sortieren |
  | View | Anzeigen |
  | Download | Herunterladen |
  | Upload | Hochladen |
  | Copy | Kopieren |
  | Share | Teilen |
- **Tone:** Use formal "Sie" consistently
- **Note:** German text is typically 30-40% longer than English

#### Task 4.2: Translate Status Indicators to German
- **Strings to translate:**
  | English | German |
  |---------|--------|
  | Loading... | Wird geladen... |
  | Success | Erfolg |
  | Error | Fehler |
  | Yes | Ja |
  | No | Nein |
  | All | Alle |
  | None | Keine |
  | More | Mehr |
  | Less | Weniger |
  | Optional | Optional |
  | Required | Erforderlich |
  | Actions | Aktionen |
  | Select | Auswählen |

#### Task 4.3: Verify German Character Encoding
- **Action:** Ensure proper UTF-8 encoding for German special characters:
  - ä, ö, ü (umlauts)
  - ß (eszett/sharp s)
  - Ä, Ö, Ü (capital umlauts)
- **Test:** Save file and verify characters display correctly

#### Task 4.4: Update German Translation File
- **File:** `/messages/de.json`
- **Action:** Update `common` namespace with all German translations
- **Preserve:** Existing structure and key names
- **Verification:** JSON syntax is valid

---

### Task 5: Generate Dutch (nl) Translations

**Objective:** Translate all `common` namespace strings to Dutch, updating `/messages/nl.json`.

#### Task 5.1: Translate Button/Action Labels to Dutch
- **File:** `/messages/nl.json`
- **Strings to translate:**
  | English | Dutch |
  |---------|-------|
  | Save | Opslaan |
  | Cancel | Annuleren |
  | Delete | Verwijderen |
  | Edit | Bewerken |
  | Create | Maken |
  | Submit | Verzenden |
  | Close | Sluiten |
  | Back | Terug |
  | Next | Volgende |
  | Confirm | Bevestigen |
  | Reset | Opnieuw instellen |
  | Clear | Wissen |
  | Search | Zoeken |
  | Filter | Filteren |
  | Sort | Sorteren |
  | View | Bekijken |
  | Download | Downloaden |
  | Upload | Uploaden |
  | Copy | Kopiëren |
  | Share | Delen |
- **Tone:** Use formal "u" for professional context

#### Task 5.2: Translate Status Indicators to Dutch
- **Strings to translate:**
  | English | Dutch |
  |---------|-------|
  | Loading... | Laden... |
  | Success | Succes |
  | Error | Fout |
  | Yes | Ja |
  | No | Nee |
  | All | Alles |
  | None | Geen |
  | More | Meer |
  | Less | Minder |
  | Optional | Optioneel |
  | Required | Vereist |
  | Actions | Acties |
  | Select | Selecteren |

#### Task 5.3: Verify Dutch Character Encoding
- **Action:** Ensure proper UTF-8 encoding for Dutch characters:
  - ë, ï (trema/diaeresis)
  - é, è (accents in loan words)
- **Test:** Save file and verify characters display correctly

#### Task 5.4: Update Dutch Translation File
- **File:** `/messages/nl.json`
- **Action:** Update `common` namespace with all Dutch translations
- **Preserve:** Existing structure and key names
- **Verification:** JSON syntax is valid

---

### Task 6: Generate Italian (it) Translations

**Objective:** Translate all `common` namespace strings to Italian, updating `/messages/it.json`.

#### Task 6.1: Translate Button/Action Labels to Italian
- **File:** `/messages/it.json`
- **Strings to translate:**
  | English | Italian |
  |---------|---------|
  | Save | Salva |
  | Cancel | Annulla |
  | Delete | Elimina |
  | Edit | Modifica |
  | Create | Crea |
  | Submit | Invia |
  | Close | Chiudi |
  | Back | Indietro |
  | Next | Avanti |
  | Confirm | Conferma |
  | Reset | Reimposta |
  | Clear | Cancella |
  | Search | Cerca |
  | Filter | Filtra |
  | Sort | Ordina |
  | View | Visualizza |
  | Download | Scarica |
  | Upload | Carica |
  | Copy | Copia |
  | Share | Condividi |
- **Tone:** Use formal "Lei" for professional context

#### Task 6.2: Translate Status Indicators to Italian
- **Strings to translate:**
  | English | Italian |
  |---------|---------|
  | Loading... | Caricamento... |
  | Success | Successo |
  | Error | Errore |
  | Yes | Sì |
  | No | No |
  | All | Tutto |
  | None | Nessuno |
  | More | Altro |
  | Less | Meno |
  | Optional | Facoltativo |
  | Required | Obbligatorio |
  | Actions | Azioni |
  | Select | Seleziona |

#### Task 6.3: Verify Italian Character Encoding
- **Action:** Ensure proper UTF-8 encoding for Italian accented characters:
  - à, è, é, ì, ò, ù (vowels with grave/acute accent)
- **Test:** Save file and verify characters display correctly

#### Task 6.4: Update Italian Translation File
- **File:** `/messages/it.json`
- **Action:** Update `common` namespace with all Italian translations
- **Preserve:** Existing structure and key names
- **Verification:** JSON syntax is valid

---

### Task 7: Extended Common Namespace Translations

**Objective:** Translate any additional strings in the expanded common namespace from Tasks 2H.1-2H.9.

#### Task 7.1: Translate Confirmation Dialog Strings (All Languages)

If the English file contains confirmation strings (from Task 2H.8), translate:

| Key | English | French | Spanish | German | Dutch | Italian |
|-----|---------|--------|---------|--------|-------|---------|
| confirmation.title | Confirm Action | Confirmer l'action | Confirmar acción | Aktion bestätigen | Actie bevestigen | Conferma azione |
| confirmation.deleteTitle | Confirm Delete | Confirmer la suppression | Confirmar eliminación | Löschen bestätigen | Verwijderen bevestigen | Conferma eliminazione |
| confirmation.deleteMessage | Are you sure you want to delete this? This action cannot be undone. | Êtes-vous sûr de vouloir supprimer ceci ? Cette action est irréversible. | ¿Está seguro de que desea eliminar esto? Esta acción no se puede deshacer. | Sind Sie sicher, dass Sie dies löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. | Weet u zeker dat u dit wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt. | Sei sicuro di voler eliminare questo? Questa azione non può essere annullata. |
| confirmation.unsavedChanges | You have unsaved changes. Are you sure you want to leave? | Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ? | Tiene cambios sin guardar. ¿Está seguro de que desea salir? | Sie haben ungespeicherte Änderungen. Sind Sie sicher, dass Sie gehen möchten? | U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u wilt vertrekken? | Hai modifiche non salvate. Sei sicuro di voler uscire? |

#### Task 7.2: Translate Empty State Messages (All Languages)

If the English file contains empty state strings (from Task 2H.6), translate:

| Key | English | French | Spanish | German | Dutch | Italian |
|-----|---------|--------|---------|--------|-------|---------|
| empty.noData | No data available | Aucune donnée disponible | No hay datos disponibles | Keine Daten verfügbar | Geen gegevens beschikbaar | Nessun dato disponibile |
| empty.noResults | No results found | Aucun résultat trouvé | No se encontraron resultados | Keine Ergebnisse gefunden | Geen resultaten gevonden | Nessun risultato trovato |
| empty.tryAgain | Try again with different filters | Réessayez avec des filtres différents | Intente de nuevo con filtros diferentes | Versuchen Sie es mit anderen Filtern | Probeer het opnieuw met andere filters | Riprova con filtri diversi |

#### Task 7.3: Translate Time/Date Strings (All Languages)

If the English file contains time formatting strings (from Task 2H.9), translate with ICU pluralization:

**English (Reference):**
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
  "justNow": "À l'instant",
  "minutesAgo": "{count, plural, one {il y a # minute} other {il y a # minutes}}",
  "hoursAgo": "{count, plural, one {il y a # heure} other {il y a # heures}}",
  "daysAgo": "{count, plural, one {il y a # jour} other {il y a # jours}}",
  "today": "Aujourd'hui",
  "yesterday": "Hier"
}
```

**Spanish:**
```json
"time": {
  "justNow": "Ahora mismo",
  "minutesAgo": "{count, plural, one {hace # minuto} other {hace # minutos}}",
  "hoursAgo": "{count, plural, one {hace # hora} other {hace # horas}}",
  "daysAgo": "{count, plural, one {hace # día} other {hace # días}}",
  "today": "Hoy",
  "yesterday": "Ayer"
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

**Dutch:**
```json
"time": {
  "justNow": "Zojuist",
  "minutesAgo": "{count, plural, one {# minuut geleden} other {# minuten geleden}}",
  "hoursAgo": "{count, plural, one {# uur geleden} other {# uur geleden}}",
  "daysAgo": "{count, plural, one {# dag geleden} other {# dagen geleden}}",
  "today": "Vandaag",
  "yesterday": "Gisteren"
}
```

**Italian:**
```json
"time": {
  "justNow": "Proprio adesso",
  "minutesAgo": "{count, plural, one {# minuto fa} other {# minuti fa}}",
  "hoursAgo": "{count, plural, one {# ora fa} other {# ore fa}}",
  "daysAgo": "{count, plural, one {# giorno fa} other {# giorni fa}}",
  "today": "Oggi",
  "yesterday": "Ieri"
}
```

#### Task 7.4: Translate Pagination Strings (All Languages)

If pagination strings exist:

| Key | English | French | Spanish | German | Dutch | Italian |
|-----|---------|--------|---------|--------|-------|---------|
| pagination.previous | Previous | Précédent | Anterior | Zurück | Vorige | Precedente |
| pagination.next | Next | Suivant | Siguiente | Weiter | Volgende | Successivo |
| pagination.page | Page {current} of {total} | Page {current} sur {total} | Página {current} de {total} | Seite {current} von {total} | Pagina {current} van {total} | Pagina {current} di {total} |
| pagination.showing | Showing {start} to {end} of {total} | Affichage de {start} à {end} sur {total} | Mostrando {start} a {end} de {total} | Zeigt {start} bis {end} von {total} | Toont {start} tot {end} van {total} | Visualizzazione da {start} a {end} di {total} |

---

### Task 8: Verification and Quality Assurance

**Objective:** Verify all translations are complete, accurate, and technically correct.

#### Task 8.1: Key Parity Check
- **Action:** Compare keys across all 6 language files
- **Command:** Use diff or JSON comparison tool
- **Expected Result:** All files have identical key structure
- **Output:** Report of any missing keys

#### Task 8.2: Interpolation Variable Preservation Check
- **Action:** Verify all `{variable}` patterns are preserved in translations
- **Method:** Search each translation file for patterns like `{name}`, `{count}`, `{start}`, `{end}`, `{total}`
- **Expected Result:** Variables appear exactly as in English source
- **Output:** Report of any missing or modified variables

#### Task 8.3: ICU Pluralization Syntax Verification
- **Action:** Verify all pluralization patterns use correct ICU syntax
- **Check for:**
  - Correct `{count, plural, ...}` format
  - Appropriate plural forms for each language
  - Proper `one` and `other` variants
- **Expected Result:** All pluralization patterns parse without error

#### Task 8.4: Character Encoding Verification
- **Action:** Open each translation file and verify special characters display correctly
- **Languages to check:**
  - French: é, è, ê, à, â, ç, ù, û, ô, î, ï
  - Spanish: á, é, í, ó, ú, ñ, ü, ¿, ¡
  - German: ä, ö, ü, ß, Ä, Ö, Ü
  - Dutch: ë, ï
  - Italian: à, è, é, ì, ò, ù
- **Expected Result:** All characters render correctly in UTF-8

#### Task 8.5: JSON Syntax Validation
- **Action:** Run JSON linter on all translation files
- **Command:** `npx jsonlint messages/fr.json` (repeat for each file)
- **Expected Result:** All files pass JSON validation

#### Task 8.6: Build Verification
- **Action:** Run Next.js build to verify translations work
- **Command:** `npm run build`
- **Expected Result:** Build completes without translation-related errors
- **Check console for:** Missing translation key warnings

#### Task 8.7: Visual Spot Check
- **Action:** Start development server and manually verify translations
- **Command:** `npm run dev`
- **Steps:**
  1. Switch language to each non-English locale
  2. Navigate to pages using common components
  3. Verify buttons, labels, and messages display in selected language
- **Expected Result:** All common UI elements display correctly in each language

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/fr.json` | Update | Add/update all `common` namespace translations in French |
| `/messages/es.json` | Update | Add/update all `common` namespace translations in Spanish |
| `/messages/de.json` | Update | Add/update all `common` namespace translations in German |
| `/messages/nl.json` | Update | Add/update all `common` namespace translations in Dutch |
| `/messages/it.json` | Update | Add/update all `common` namespace translations in Italian |

## Files to Read Only (Reference)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |

## Files NOT to Modify

- Source code files (`*.tsx`, `*.ts`)
- Database migrations
- API routes
- Configuration files other than translation JSON

---

## Acceptance Criteria Checklist

### Completeness
- [ ] French translation file includes complete translations for all common namespace strings
- [ ] Spanish translation file includes complete translations for all common namespace strings
- [ ] German translation file includes complete translations for all common namespace strings
- [ ] Dutch translation file includes complete translations for all common namespace strings
- [ ] Italian translation file includes complete translations for all common namespace strings

### Semantic Accuracy
- [ ] All translations maintain semantic accuracy with the source English text
- [ ] Button labels are translated concisely while preserving action clarity
- [ ] Confirmation dialog prompts convey appropriate urgency and consequence clarity
- [ ] Empty state messages maintain helpful, encouraging tone
- [ ] Loading state messages set appropriate expectations

### Technical Correctness
- [ ] Character encoding is correct for all accented characters
- [ ] All interpolation variables (`{variable}`) are preserved exactly in translations
- [ ] Pluralization patterns use correct ICU MessageFormat syntax for each language
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files maintain identical key structure across all languages

### Build Verification
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully: `npm run build`
- [ ] No missing translation key warnings in console
- [ ] Application loads without errors in all supported languages

---

## Dependencies

### Required Before This Task
| Task | Description | Status |
|------|-------------|--------|
| 2H.1 | Create common namespace structure | Must be Complete |
| 2H.2 | Extract button labels | Must be Complete |
| 2H.3 | Extract modal/dialog strings | Must be Complete |
| 2H.4 | Extract form element strings | Must be Complete |
| 2H.5 | Extract toast notifications | Must be Complete |
| 2H.6 | Extract empty state messages | Must be Complete |
| 2H.7 | Extract loading state messages | Must be Complete |
| 2H.8 | Extract confirmation dialogs | Must be Complete |
| 2H.9 | Create date/time formatting | Must be Complete |
| Epic 1 | i18n Foundation | Must be Complete |

### Blocks These Tasks
- All subsequent Epic 2 sub-epics (2A-2G, 2I, 2J) that reference common namespace strings

---

## Estimated Effort

| Task | Estimate | Notes |
|------|----------|-------|
| Task 1: Audit English source | 15 min | Read and document existing strings |
| Task 2: French translations | 45 min | ~35 base strings + extended |
| Task 3: Spanish translations | 45 min | ~35 base strings + extended |
| Task 4: German translations | 45 min | ~35 base strings + extended |
| Task 5: Dutch translations | 45 min | ~35 base strings + extended |
| Task 6: Italian translations | 45 min | ~35 base strings + extended |
| Task 7: Extended namespace | 60 min | Confirmation, empty, time, pagination |
| Task 8: Verification & QA | 30 min | Key parity, encoding, build |
| **Total** | **~5-6 hours** | |

**Note:** Effort scales with actual string count in `en.json`. If Tasks 2H.1-2H.9 have added ~800 strings as projected, multiply translation time accordingly.

---

## Translation Reference Glossary

### Core Action Terms

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina |
| Edit | Modifier | Editar | Bearbeiten | Bewerken | Modifica |
| Create | Créer | Crear | Erstellen | Maken | Crea |
| Close | Fermer | Cerrar | Schließen | Sluiten | Chiudi |
| Confirm | Confirmer | Confirmar | Bestätigen | Bevestigen | Conferma |
| Submit | Soumettre | Enviar | Absenden | Verzenden | Invia |
| Search | Rechercher | Buscar | Suchen | Zoeken | Cerca |
| Filter | Filtrer | Filtrar | Filtern | Filteren | Filtra |
| Loading | Chargement | Cargando | Wird geladen | Laden | Caricamento |
| Success | Succès | Éxito | Erfolg | Succes | Successo |
| Error | Erreur | Error | Fehler | Fout | Errore |

### Formality Guidelines

| Language | Formal Address | Usage |
|----------|---------------|-------|
| French | vous | Use for all user-facing messages |
| Spanish | usted | Use for business/professional context |
| German | Sie | Use consistently throughout |
| Dutch | u | Use for professional context |
| Italian | Lei | Use for professional context |

---

## References

- [Overview Document](/docs/REQ-E02-030-generate-translations-for-all-5-non-english-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-030
- [i18n Configuration](/src/lib/i18n/config.ts)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2H - Common & Shared Components*
*Task 2H.10 - Generate Translations for All 5 Non-English Languages*
