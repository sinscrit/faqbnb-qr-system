# REQ-391: Generate Translations for Item Management Components (5 Non-English Languages) - Detailed Task Breakdown

**Generated:** 2026-01-19 23:15:00 UTC
**Last Modified:** 2026-01-19 23:15:00 UTC

## Document References

- **Request ID:** REQ-391
- **Overview Document:** docs/REQ-391-generate-translations-for-5-non-english-languages-overview.md
- **Requirements:** docs/gen_requests_epic2.md (Request #391)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Epic:** 2 - Static UI Translation
- **Sub-Epic:** 2D - Item Management
- **Task ID:** 2D.7
- **Size:** L (Large)
- **Priority:** Final task of Sub-Epic 2D

---

## Executive Summary

This task completes Sub-Epic 2D by generating translations for all Item Management namespace strings from English to 5 target languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). The source English strings are defined in `/messages/en.json` under the `items` namespace (approximately 73+ keys). Each translation must maintain semantic accuracy within property management domain terminology, apply correct ICU pluralization rules, and preserve variable interpolation patterns.

**Total Translation Entries:** ~73 keys × 5 languages = **~365 translation entries**

---

## Prerequisites

| Prerequisite | Description | Status | Verification |
|--------------|-------------|--------|--------------|
| REQ-385 (2D.1) | Items namespace structure created in en.json | **REQUIRED** | Verify `items.*` nested structure exists in `/messages/en.json` |
| REQ-386 (2D.2) | ItemManager component family updated | **REQUIRED** | Components use `items.*` translation keys |
| REQ-387 (2D.3) | ItemGrid and ItemCard updated | **REQUIRED** | Card components use translation keys |
| REQ-388 (2D.4) | Filter and sort components updated | **REQUIRED** | Filter/sort use `items.filters.*` and `items.sort.*` |
| REQ-389 (2D.5) | Bulk action dialogs updated | **REQUIRED** | Bulk actions use `items.bulk.*` and `items.delete.*` |
| REQ-390 (2D.6) | Item detail/edit pages updated | **REQUIRED** | Detail pages use `items.detail.*` and `items.metadata.*` |
| Epic 1 Foundation | next-intl installed and configured | ✅ Complete | Package installed, i18n config exists |

---

## Source Translation File Analysis

### Current Items Namespace Structure (en.json)

The source of truth is `/messages/en.json` with the comprehensive nested `items` namespace structure. Based on REQ-385, the structure includes:

| Sub-namespace | Key Count | Translation Complexity |
|---------------|-----------|------------------------|
| `items.title` / `items.subtitle` | 2 | Simple strings |
| `items.list.*` | 5 | Empty states, no results |
| `items.card.*` | 6 | Contains ICU pluralization |
| `items.actions.*` | 15 | Action button labels |
| `items.filters.*` | 10 | Domain-specific terminology |
| `items.sort.*` | 7 | Standard sort conventions |
| `items.bulk.*` | 11 | Contains pluralization and interpolation |
| `items.detail.*` | 6 | Tab/section labels |
| `items.delete.*` | 6 | Confirmation dialogs with interpolation |
| `items.metadata.*` | 13 | Field labels |
| `items.validation.*` | 4 | Validation messages with interpolation |
| `items.view.*` | 3 | View mode toggles |
| `items.search.*` | 3 | Search-related with interpolation |
| `items.empty.*` | 2 | Legacy empty states |
| `items.toolbar.*` | 5 | Toolbar labels |
| `items.columns.*` | 12 | Column headers and settings |
| `items.aria.*` | 8 | Accessibility labels |
| **Total** | **~118** | Mixed complexity |

---

## Task Breakdown

### Task 1: Verify Prerequisites and Extract Source Keys
**Estimated Time:** 15 minutes
**Story Points:** 0.5

#### Description
Verify all prerequisite tasks are complete and extract the complete list of `items.*` keys from `/messages/en.json` as the definitive translation source.

#### Steps
1. Read `/messages/en.json` and verify complete `items` namespace structure exists
2. Extract all `items.*` keys into a checklist format
3. Identify keys with special patterns:
   - ICU pluralization (contains `{count, plural, ...}`)
   - Variable interpolation (contains `{name}`, `{count}`, `{max}`, etc.)
   - Simple strings (no special syntax)
4. Document the complete key inventory

#### Key Categories to Verify

**Simple Strings (no special syntax):**
- `items.title`, `items.subtitle`
- `items.actions.*` (most keys)
- `items.filters.title`, `items.sort.title`
- `items.metadata.*` (all keys)
- `items.detail.*` (all keys)
- `items.view.*`, `items.toolbar.*`, `items.columns.*`

**ICU Pluralization Patterns:**
```
items.card.views: "{count, plural, =0 {No views} one {# view} other {# views}}"
items.card.pieces: "{count, plural, =0 {No content} one {# piece} other {# pieces}} of content"
items.filters.activeFilters: "{count} active {count, plural, one {filter} other {filters}}"
items.bulk.selected: "{count} selected"
items.bulk.confirmDelete: "Delete {count} {count, plural, one {item} other {items}}?"
items.search.resultsCount: "{count} of {total} items"
```

**Variable Interpolation Patterns:**
```
items.delete.message: "Are you sure you want to delete \"{name}\"? This action cannot be undone."
items.delete.messagePlural: "Are you sure you want to delete {count} items? This action cannot be undone."
items.validation.nameTooLong: "Item name must be less than {max} characters"
items.search.noResults: "No items found for \"{query}\""
items.aria.itemCard: "Item card for {name}"
```

#### Verification Checklist
- [ ] `/messages/en.json` contains complete nested `items` namespace
- [ ] All ~118 keys are present and documented
- [ ] Pluralization patterns use correct ICU syntax
- [ ] Variable placeholders are consistent

---

### Task 2: Translate Items Namespace to German (de)
**Estimated Time:** 45 minutes
**Story Points:** 1.5

#### Description
Generate complete German translations for all `items.*` keys in `/messages/de.json`, applying correct German grammar, formal "Sie" form, and property management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "Sie" form consistently |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Compound Words | Follow German conventions (e.g., "QR-Code-Artikel") |
| Property Term | "Immobilie" (established in common namespace) |
| Item Term | "Artikel" (established in common namespace) |
| Gender Agreement | Maintain consistency with established terms |

#### Glossary Reference

| English | German | Notes |
|---------|--------|-------|
| Item | Artikel | Masculine, established |
| Property | Immobilie | Feminine, established |
| Room | Raum | Masculine |
| QR Code | QR-Code | Hyphenated compound |
| Tag | Tag | Neutral, keep as-is |
| Filter | Filter | Masculine |
| Sort | Sortieren | Verb form |
| Content | Inhalt | Masculine |
| View | Ansicht/Aufruf | Context-dependent |
| Scan | Scan | Masculine |

#### Steps
1. Read current `/messages/de.json`
2. Replace/update entire `items` namespace with German translations
3. Apply nested structure matching en.json exactly
4. Translate all simple strings
5. Adapt ICU pluralization patterns for German grammar
6. Preserve all variable placeholders exactly (`{name}`, `{count}`, etc.)
7. Validate JSON syntax

#### Sample Translations

```json
{
  "items": {
    "title": "Artikel",
    "subtitle": "Verwalten Sie Ihre QR-Code-Artikel",

    "list": {
      "empty": {
        "title": "Noch keine Artikel",
        "description": "Erstellen Sie Ihren ersten QR-Code-Artikel",
        "action": "Artikel erstellen",
        "noArticles": "Noch keine Anleitungen",
        "addFirstArticle": "Fügen Sie Ihre erste Anleitung hinzu"
      },
      "noResults": "Keine Artikel entsprechen Ihren Filtern"
    },

    "card": {
      "views": "{count, plural, =0 {Keine Aufrufe} one {# Aufruf} other {# Aufrufe}}",
      "pieces": "{count, plural, =0 {Kein Inhalt} one {# Inhalt} other {# Inhalte}}",
      "noContent": "Noch kein Inhalt",
      "lastScanned": "Zuletzt gescannt {date}",
      "neverScanned": "Noch nie gescannt",
      "contentCount": "{count} Inhalte"
    },

    "actions": {
      "create": "Neuer QR-Code-Artikel",
      "edit": "Bearbeiten",
      "delete": "Löschen",
      "view": "Ansehen",
      "duplicate": "Duplizieren",
      "viewQR": "QR-Code ansehen",
      "print": "Drucken",
      "share": "Teilen",
      "printQrCode": "QR-Code drucken",
      "downloadQrCode": "QR-Code herunterladen",
      "manageAssets": "Medien verwalten",
      "addArticle": "Anleitung hinzufügen",
      "addTag": "Tag hinzufügen",
      "removeTag": "Tag entfernen",
      "move": "Verschieben"
    },

    "filters": {
      "title": "Filter",
      "property": "Immobilie",
      "room": "Raum",
      "tag": "Tag",
      "tags": "Tags",
      "contentType": "Inhaltstyp",
      "status": "Status",
      "location": "Standort",
      "clearAll": "Alle löschen",
      "applyFilters": "Filter anwenden",
      "activeFilters": "{count} {count, plural, one {aktiver Filter} other {aktive Filter}}"
    },

    "sort": {
      "title": "Sortieren nach",
      "sortLabel": "Sortieren",
      "newest": "Neueste zuerst",
      "oldest": "Älteste zuerst",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Meistgesehen",
      "recentlyScanned": "Kürzlich gescannt"
    },

    "bulk": {
      "selected": "{count} ausgewählt",
      "selectAll": "Alle auswählen",
      "deselectAll": "Auswahl aufheben",
      "delete": "Ausgewählte löschen",
      "move": "Zur Immobilie verschieben",
      "addTags": "Tags hinzufügen",
      "removeTags": "Tags entfernen",
      "print": "Ausgewählte drucken",
      "cancel": "Abbrechen",
      "processing": "Wird verarbeitet...",
      "confirmDelete": "{count} {count, plural, one {Artikel} other {Artikel}} löschen?"
    },

    "detail": {
      "title": "Artikeldetails",
      "qrCode": "QR-Code",
      "analytics": "Analysen",
      "content": "Inhalt",
      "settings": "Einstellungen",
      "instructions": "Anleitungen",
      "media": "Medien"
    },

    "delete": {
      "title": "Artikel löschen",
      "titlePlural": "Artikel löschen",
      "message": "Sind Sie sicher, dass Sie \"{name}\" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      "messagePlural": "Sind Sie sicher, dass Sie {count} Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      "confirm": "Artikel löschen",
      "confirmPlural": "Artikel löschen"
    },

    "metadata": {
      "name": "Artikelname",
      "description": "Beschreibung",
      "property": "Immobilie",
      "room": "Raum",
      "tags": "Tags",
      "qrCode": "QR-Code",
      "articles": "Anleitungen",
      "scanCount": "Anzahl Scans",
      "lastScanned": "Zuletzt gescannt",
      "createdAt": "Erstellt am",
      "updatedAt": "Aktualisiert am",
      "contentPieces": "Inhalte"
    },

    "validation": {
      "nameRequired": "Artikelname ist erforderlich",
      "nameTooLong": "Artikelname darf maximal {max} Zeichen haben",
      "descriptionTooLong": "Beschreibung darf maximal {max} Zeichen haben",
      "propertyRequired": "Bitte wählen Sie eine Immobilie aus"
    },

    "view": {
      "grid": "Rasteransicht",
      "list": "Listenansicht",
      "toggle": "Ansichtsmodus wechseln"
    },

    "search": {
      "placeholder": "Artikel suchen...",
      "resultsCount": "{count} von {total} Artikeln",
      "noResults": "Keine Artikel gefunden für \"{query}\""
    },

    "empty": {
      "title": "Noch keine Artikel",
      "description": "Erstellen Sie Ihren ersten Artikel"
    },

    "toolbar": {
      "search": "Suchen",
      "filters": "Filter",
      "sort": "Sortieren",
      "viewMode": "Ansichtsmodus",
      "columns": "Spalten"
    },

    "columns": {
      "name": "Name",
      "property": "Immobilie",
      "room": "Raum",
      "tags": "Tags",
      "content": "Inhalt",
      "scans": "Scans",
      "lastScanned": "Zuletzt gescannt",
      "created": "Erstellt",
      "actions": "Aktionen",
      "settings": "Spalteneinstellungen",
      "show": "Spalten anzeigen",
      "hide": "Spalten ausblenden"
    },

    "aria": {
      "itemManager": "Artikelverwaltung",
      "itemCard": "Artikelkarte für {name}",
      "itemRow": "Artikelzeile für {name}",
      "selectItem": "{name} auswählen",
      "editItem": "{name} bearbeiten",
      "deleteItem": "{name} löschen",
      "viewQrCode": "QR-Code für {name} ansehen",
      "bulkActionsBar": "Massenaktionen für {count} ausgewählte Artikel"
    }
  }
}
```

#### File to Modify
`/messages/de.json`

#### Verification Checklist
- [ ] All ~118 keys present in `items` namespace
- [ ] Structure matches en.json exactly
- [ ] All ICU pluralization uses correct German grammar
- [ ] Variable placeholders preserved exactly
- [ ] Formal "Sie" form used consistently
- [ ] JSON syntax valid

---

### Task 3: Translate Items Namespace to Spanish (es)
**Estimated Time:** 45 minutes
**Story Points:** 1.5

#### Description
Generate complete Spanish translations for all `items.*` keys in `/messages/es.json`, using neutral/Latin American Spanish and property management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Variant | Neutral/Latin American Spanish |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Property Term | "Propiedad" |
| Item Term | "Artículo" |
| Gender Agreement | Maintain masculine/feminine consistency |
| Accents | Use proper accent marks (á, é, í, ó, ú, ñ) |

#### Glossary Reference

| English | Spanish | Notes |
|---------|---------|-------|
| Item | Artículo | Masculine |
| Property | Propiedad | Feminine |
| Room | Habitación | Feminine |
| QR Code | Código QR | Masculine |
| Tag | Etiqueta | Feminine |
| Filter | Filtro | Masculine |
| Sort | Ordenar | Verb form |
| Content | Contenido | Masculine |
| View | Vista | Feminine |
| Scan | Escaneo | Masculine |

#### Steps
1. Read current `/messages/es.json`
2. Replace/update entire `items` namespace with Spanish translations
3. Apply nested structure matching en.json exactly
4. Use neutral Spanish (avoid region-specific terms)
5. Adapt ICU pluralization patterns for Spanish grammar
6. Preserve all variable placeholders exactly
7. Validate JSON syntax

#### Sample Key Translations

```json
{
  "items": {
    "title": "Artículos",
    "subtitle": "Administra tus artículos con código QR",

    "list": {
      "empty": {
        "title": "Aún no hay artículos",
        "description": "Crea tu primer artículo con código QR para comenzar",
        "action": "Crear artículo"
      },
      "noResults": "Ningún artículo coincide con tus filtros"
    },

    "card": {
      "views": "{count, plural, =0 {Sin vistas} one {# vista} other {# vistas}}",
      "pieces": "{count, plural, =0 {Sin contenido} one {# contenido} other {# contenidos}}"
    },

    "delete": {
      "title": "Eliminar artículo",
      "message": "¿Estás seguro de que deseas eliminar \"{name}\"? Esta acción no se puede deshacer.",
      "messagePlural": "¿Estás seguro de que deseas eliminar {count} artículos? Esta acción no se puede deshacer."
    }
  }
}
```

#### File to Modify
`/messages/es.json`

#### Verification Checklist
- [ ] All ~118 keys present in `items` namespace
- [ ] Structure matches en.json exactly
- [ ] All ICU pluralization uses correct Spanish grammar
- [ ] Variable placeholders preserved exactly
- [ ] Neutral Spanish terminology used
- [ ] Proper accent marks applied
- [ ] JSON syntax valid

---

### Task 4: Translate Items Namespace to French (fr)
**Estimated Time:** 45 minutes
**Story Points:** 1.5

#### Description
Generate complete French translations for all `items.*` keys in `/messages/fr.json`, using formal "vous" form and property management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "vous" form consistently |
| Pluralization | Two forms: one (0, 1), other (2+) - Note: French treats 0 and 1 as singular |
| Property Term | "Propriété" |
| Item Term | "Article" |
| Gender Agreement | Maintain masculine/feminine consistency |
| Accents | Use proper French accents (é, è, ê, à, ç, etc.) |

#### French Pluralization Note
French has a special rule where 0 and 1 are both considered singular. This affects ICU patterns:

```json
// English: 0 items, 1 item, 2 items
// French: 0 article, 1 article, 2 articles
"views": "{count, plural, one {# vue} other {# vues}}"
```

#### Glossary Reference

| English | French | Notes |
|---------|--------|-------|
| Item | Article | Masculine |
| Property | Propriété | Feminine |
| Room | Pièce | Feminine |
| QR Code | Code QR | Masculine |
| Tag | Étiquette | Feminine |
| Filter | Filtre | Masculine |
| Sort | Trier | Verb form |
| Content | Contenu | Masculine |
| View | Vue | Feminine |
| Scan | Scan | Masculine |

#### Steps
1. Read current `/messages/fr.json`
2. Replace/update entire `items` namespace with French translations
3. Apply nested structure matching en.json exactly
4. Use formal "vous" form
5. Adapt ICU pluralization for French rules (0 and 1 singular)
6. Preserve all variable placeholders exactly
7. Validate JSON syntax

#### Sample Key Translations

```json
{
  "items": {
    "title": "Articles",
    "subtitle": "Gérez vos articles avec code QR",

    "list": {
      "empty": {
        "title": "Aucun article pour le moment",
        "description": "Créez votre premier article avec code QR pour commencer",
        "action": "Créer un article"
      },
      "noResults": "Aucun article ne correspond à vos filtres"
    },

    "card": {
      "views": "{count, plural, one {# vue} other {# vues}}",
      "pieces": "{count, plural, one {# contenu} other {# contenus}}"
    },

    "delete": {
      "title": "Supprimer l'article",
      "message": "Êtes-vous sûr de vouloir supprimer \"{name}\" ? Cette action est irréversible.",
      "messagePlural": "Êtes-vous sûr de vouloir supprimer {count} articles ? Cette action est irréversible."
    }
  }
}
```

#### File to Modify
`/messages/fr.json`

#### Verification Checklist
- [ ] All ~118 keys present in `items` namespace
- [ ] Structure matches en.json exactly
- [ ] French plural rules applied (0 and 1 singular)
- [ ] Variable placeholders preserved exactly
- [ ] Formal "vous" form used consistently
- [ ] Proper French accents applied
- [ ] JSON syntax valid

---

### Task 5: Translate Items Namespace to Italian (it)
**Estimated Time:** 45 minutes
**Story Points:** 1.5

#### Description
Generate complete Italian translations for all `items.*` keys in `/messages/it.json`, using formal "Lei" form and property management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "Lei" form consistently |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Property Term | "Proprietà" |
| Item Term | "Articolo" |
| Gender Agreement | Italian has complex gender agreement |
| Accents | Use proper Italian accents (à, è, é, ì, ò, ù) |

#### Glossary Reference

| English | Italian | Notes |
|---------|---------|-------|
| Item | Articolo | Masculine |
| Property | Proprietà | Feminine |
| Room | Stanza | Feminine |
| QR Code | Codice QR | Masculine |
| Tag | Tag | Masculine (loan word) |
| Filter | Filtro | Masculine |
| Sort | Ordinare | Verb form |
| Content | Contenuto | Masculine |
| View | Visualizzazione | Feminine |
| Scan | Scansione | Feminine |

#### Steps
1. Read current `/messages/it.json`
2. Replace/update entire `items` namespace with Italian translations
3. Apply nested structure matching en.json exactly
4. Use formal "Lei" form
5. Adapt ICU pluralization for Italian grammar
6. Preserve all variable placeholders exactly
7. Validate JSON syntax

#### Sample Key Translations

```json
{
  "items": {
    "title": "Articoli",
    "subtitle": "Gestisci i tuoi articoli con codice QR",

    "list": {
      "empty": {
        "title": "Nessun articolo",
        "description": "Crea il tuo primo articolo con codice QR per iniziare",
        "action": "Crea articolo"
      },
      "noResults": "Nessun articolo corrisponde ai tuoi filtri"
    },

    "card": {
      "views": "{count, plural, =0 {Nessuna visualizzazione} one {# visualizzazione} other {# visualizzazioni}}",
      "pieces": "{count, plural, =0 {Nessun contenuto} one {# contenuto} other {# contenuti}}"
    },

    "delete": {
      "title": "Elimina articolo",
      "message": "Sei sicuro di voler eliminare \"{name}\"? Questa azione non può essere annullata.",
      "messagePlural": "Sei sicuro di voler eliminare {count} articoli? Questa azione non può essere annullata."
    }
  }
}
```

#### File to Modify
`/messages/it.json`

#### Verification Checklist
- [ ] All ~118 keys present in `items` namespace
- [ ] Structure matches en.json exactly
- [ ] All ICU pluralization uses correct Italian grammar
- [ ] Variable placeholders preserved exactly
- [ ] Formal "Lei" form used where appropriate
- [ ] Proper Italian accents applied
- [ ] JSON syntax valid

---

### Task 6: Translate Items Namespace to Dutch (nl)
**Estimated Time:** 45 minutes
**Story Points:** 1.5

#### Description
Generate complete Dutch translations for all `items.*` keys in `/messages/nl.json`, using formal "u" form and property management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "u" form consistently |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Property Term | "Eigendom" |
| Item Term | "Artikel" |
| Word Order | Dutch has specific word order rules in certain constructs |
| Compound Words | Follow Dutch compounding conventions |

#### Glossary Reference

| English | Dutch | Notes |
|---------|-------|-------|
| Item | Artikel | Common gender |
| Property | Eigendom | Neuter |
| Room | Kamer | Common gender |
| QR Code | QR-code | With hyphen |
| Tag | Tag | Common gender (loan word) |
| Filter | Filter | Common gender |
| Sort | Sorteren | Verb form |
| Content | Inhoud | Common gender |
| View | Weergave | Common gender |
| Scan | Scan | Common gender |

#### Steps
1. Read current `/messages/nl.json`
2. Replace/update entire `items` namespace with Dutch translations
3. Apply nested structure matching en.json exactly
4. Use formal "u" form
5. Adapt ICU pluralization for Dutch grammar
6. Preserve all variable placeholders exactly
7. Validate JSON syntax

#### Sample Key Translations

```json
{
  "items": {
    "title": "Artikelen",
    "subtitle": "Beheer uw QR-code artikelen",

    "list": {
      "empty": {
        "title": "Nog geen artikelen",
        "description": "Maak uw eerste QR-code artikel om te beginnen",
        "action": "Artikel aanmaken"
      },
      "noResults": "Geen artikelen komen overeen met uw filters"
    },

    "card": {
      "views": "{count, plural, =0 {Geen weergaven} one {# weergave} other {# weergaven}}",
      "pieces": "{count, plural, =0 {Geen inhoud} one {# inhoud} other {# inhouden}}"
    },

    "delete": {
      "title": "Artikel verwijderen",
      "message": "Weet u zeker dat u \"{name}\" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      "messagePlural": "Weet u zeker dat u {count} artikelen wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
    }
  }
}
```

#### File to Modify
`/messages/nl.json`

#### Verification Checklist
- [ ] All ~118 keys present in `items` namespace
- [ ] Structure matches en.json exactly
- [ ] All ICU pluralization uses correct Dutch grammar
- [ ] Variable placeholders preserved exactly
- [ ] Formal "u" form used consistently
- [ ] Dutch compound word conventions followed
- [ ] JSON syntax valid

---

### Task 7: JSON Syntax Validation
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Validate JSON syntax in all 5 modified translation files to ensure no parsing errors.

#### Steps
1. Run JSON linter on each modified file
2. Fix any syntax errors found
3. Verify no trailing commas
4. Verify all strings are properly escaped

#### Commands
```bash
# Validate JSON syntax for all translation files
npx jsonlint messages/de.json
npx jsonlint messages/es.json
npx jsonlint messages/fr.json
npx jsonlint messages/it.json
npx jsonlint messages/nl.json

# Or use Node.js to validate
node -e "require('./messages/de.json')"
node -e "require('./messages/es.json')"
node -e "require('./messages/fr.json')"
node -e "require('./messages/it.json')"
node -e "require('./messages/nl.json')"
```

#### Common JSON Errors to Check
- Missing commas between properties
- Trailing commas after last property
- Unescaped quotes within strings
- Incorrect nesting/bracket matching

#### Verification Checklist
- [ ] `/messages/de.json` passes JSON validation
- [ ] `/messages/es.json` passes JSON validation
- [ ] `/messages/fr.json` passes JSON validation
- [ ] `/messages/it.json` passes JSON validation
- [ ] `/messages/nl.json` passes JSON validation

---

### Task 8: Application Runtime Testing
**Estimated Time:** 20 minutes
**Story Points:** 0.5

#### Description
Start the development server and verify translations load without runtime errors in all 5 languages.

#### Steps
1. Start development server (`npm run dev`)
2. Navigate to item management pages
3. Switch language to German and verify:
   - No console errors for missing translations
   - All `items.*` keys render properly
   - Pluralization displays correctly
4. Repeat for Spanish, French, Italian, Dutch
5. Test variable interpolation with sample data

#### Test Scenarios

**Pluralization Test Cases:**
| Test | Count Values | Expected Behavior |
|------|-------------|-------------------|
| Views count | 0, 1, 2, 5, 21 | Correct plural form in each language |
| Selected items | 0, 1, 2, 10 | Correct plural form |
| Content pieces | 0, 1, 5 | Correct plural form |

**Interpolation Test Cases:**
| Test | Variable | Expected |
|------|----------|----------|
| Delete confirmation | `{name}` = "Coffee Maker" | Name appears correctly |
| Search results | `{count}` = 5, `{total}` = 20 | Numbers display correctly |
| Validation | `{max}` = 100 | Number appears correctly |

#### Commands
```bash
# Start development server
npm run dev

# Navigate to item management
# URL: http://localhost:3000/dashboard2/items
```

#### Verification Checklist
- [ ] No console errors for missing translations
- [ ] German (de) - All items.* keys render
- [ ] Spanish (es) - All items.* keys render
- [ ] French (fr) - All items.* keys render
- [ ] Italian (it) - All items.* keys render
- [ ] Dutch (nl) - All items.* keys render
- [ ] Pluralization works for 0, 1, multiple
- [ ] Variable interpolation works correctly

---

### Task 9: Visual QA and Layout Verification
**Estimated Time:** 30 minutes
**Story Points:** 1

#### Description
Perform visual inspection of key Item Management screens in all 5 languages to identify layout issues caused by longer translated text.

#### Screens to Test

1. **Item List/Grid View**
   - ItemCard display (truncation, overflow)
   - Filter panel labels
   - Sort dropdown options
   - Empty state messages
   - Bulk action bar

2. **Item Detail View**
   - Tab labels
   - Metadata field labels
   - Action buttons

3. **Item Edit/Create**
   - Form labels
   - Validation messages
   - Button labels

4. **Delete Confirmation Dialog**
   - Dialog title
   - Confirmation message
   - Button labels

#### Expected Text Expansion

| Language | Expected Expansion | Risk Level |
|----------|-------------------|------------|
| German | +30-40% | High (compound words) |
| Spanish | +15-25% | Medium |
| French | +15-25% | Medium |
| Italian | +15-25% | Medium |
| Dutch | +20-30% | Medium |

#### Issues to Watch For
- Button text overflow or truncation
- Column header misalignment in list view
- Card content overflow
- Dialog text cramping
- Filter dropdown text cutoff

#### Verification Checklist
- [ ] German - No layout breaks on key screens
- [ ] Spanish - No layout breaks on key screens
- [ ] French - No layout breaks on key screens
- [ ] Italian - No layout breaks on key screens
- [ ] Dutch - No layout breaks on key screens
- [ ] Buttons accommodate longer text
- [ ] Cards handle text gracefully
- [ ] Dialogs display properly

---

### Task 10: Final Documentation and Cleanup
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Document any translation decisions, flag strings for native speaker review, and update task status.

#### Steps
1. Document any difficult translation decisions made
2. List strings flagged for native speaker review (if any)
3. Update task status in gen_requests_epic2.md
4. Add completion note to overview document

#### Strings to Flag for Review (if applicable)
- Delete confirmation messages (critical user action)
- Validation error messages
- Accessibility labels (aria.*)

#### Files to Update
- `docs/REQ-391-generate-translations-for-5-non-english-languages-overview.md` - Add completion status
- `docs/gen_requests_epic2.md` - Mark acceptance criteria complete

#### Verification Checklist
- [ ] Translation decisions documented
- [ ] Critical strings flagged for review (if needed)
- [ ] Overview document updated with completion status
- [ ] All acceptance criteria verified

---

## Task Summary

| Task | Description | Time (min) | Story Points |
|------|-------------|------------|--------------|
| 1 | Verify prerequisites and extract source keys | 15 | 0.5 |
| 2 | Translate to German (de) | 45 | 1.5 |
| 3 | Translate to Spanish (es) | 45 | 1.5 |
| 4 | Translate to French (fr) | 45 | 1.5 |
| 5 | Translate to Italian (it) | 45 | 1.5 |
| 6 | Translate to Dutch (nl) | 45 | 1.5 |
| 7 | JSON syntax validation | 10 | 0.5 |
| 8 | Application runtime testing | 20 | 0.5 |
| 9 | Visual QA and layout verification | 30 | 1.0 |
| 10 | Final documentation and cleanup | 10 | 0.5 |
| **Total** | | **310 min (~5.2 hrs)** | **10.5** |

---

## Acceptance Criteria Verification

From REQ-391, verify each criterion upon completion:

| # | Criterion | Task(s) | Verified |
|---|-----------|---------|----------|
| 1 | All Item Management namespace keys present in de.json with accurate German translations | Task 2 | [ ] |
| 2 | All Item Management namespace keys present in es.json with accurate Spanish translations | Task 3 | [ ] |
| 3 | All Item Management namespace keys present in fr.json with accurate French translations | Task 4 | [ ] |
| 4 | All Item Management namespace keys present in it.json with accurate Italian translations | Task 5 | [ ] |
| 5 | All Item Management namespace keys present in nl.json with accurate Dutch translations | Task 6 | [ ] |
| 6 | Pluralization rules correctly implemented for each language using next-intl plural syntax | Tasks 2-6, 8 | [ ] |
| 7 | Filter category names use terminology appropriate to property management contexts | Tasks 2-6 | [ ] |
| 8 | Sort option labels use standard conventions for each language | Tasks 2-6 | [ ] |
| 9 | Bulk action dialog warnings maintain appropriate tone and clarity | Tasks 2-6 | [ ] |
| 10 | Field labels and validation messages use familiar terminology | Tasks 2-6 | [ ] |
| 11 | Button labels follow platform-wide translation conventions from common namespace | Tasks 2-6 | [ ] |
| 12 | Status indicators and badges use contextually appropriate language | Tasks 2-6 | [ ] |
| 13 | Empty state messages are culturally and linguistically appropriate | Tasks 2-6 | [ ] |
| 14 | Help text and tooltips provide clear guidance | Tasks 2-6 | [ ] |
| 15 | Translation keys maintain consistent structure across all six language files | Tasks 2-7 | [ ] |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ICU format syntax errors | Medium | High | Validate with JSON lint, test all plural cases |
| Variable placeholder mismatch | Low | High | Systematic verification, preserve exactly |
| Inconsistent terminology | Medium | Medium | Use glossary, reference common namespace |
| Layout breaks from text expansion | Medium | Low | Visual QA, design accommodates 40% expansion |
| Missing keys in target files | Low | High | Structure copy from en.json, key-by-key verification |

---

## Completion Checklist

Before marking REQ-391 complete:

- [ ] All 5 language files contain complete `items` namespace
- [ ] Structure identical across all 6 language files (en + 5 targets)
- [ ] All ICU pluralization patterns are grammatically correct
- [ ] All variable placeholders preserved exactly
- [ ] JSON syntax valid for all files
- [ ] No runtime translation errors
- [ ] Visual QA passed for all languages
- [ ] Acceptance criteria verified
- [ ] Documentation updated

---

*Document created for FAQBNB Localization Epic 2 - Static UI Translation*
*Sub-Epic 2D - Item Management - Task 2D.7 (Final)*
