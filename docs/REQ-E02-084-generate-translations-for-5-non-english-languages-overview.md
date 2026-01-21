# REQ-E02-084: Generate Translations for Item Management Namespace (5 Non-English Languages)

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-084
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.7
**Priority:** High
**Size:** L (Large)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

This document provides the implementation breakdown for generating complete translations of the Item Management namespace (`items`) for the 5 non-English languages supported by FAQBNB: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This task follows the completion of the English source translations in the items namespace and represents the final localization step for Sub-Epic 2D.

**Note:** The original request mentions Portuguese, but the project's supported languages are: English, French, Spanish, German, Dutch, and Italian (per the Implementation Plan and existing `/messages/*.json` files).

---

## 2. Requirements Analysis

### 2.1 Source Request Overview

**From:** `/docs/gen_requests_epic2.md` - Request #84

The request specifies generating accurate, contextually appropriate translations for the Item Management namespace covering:
- Field labels (title, description, location, content type, status, tags)
- Button labels (Save, Cancel, Edit, Delete, Duplicate, Export, Print)
- Filter labels (Content Type, Room, Status, Tags, Date Range)
- Sort option labels (Title, Created Date, Updated Date, Room, Type)
- Bulk action dialog messages and confirmations
- Status indicators (Active, Archived, Draft, Pending)
- Empty state messages
- Error messages and validation feedback
- Success notification messages
- Confirmation dialog prompts
- Placeholder text for search and input fields
- Helper text and tooltips

### 2.2 Current State

**English Translation File (`/messages/en.json`):**
The `items` namespace currently contains basic translations:

```json
{
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "addArticle": "Add Article",
    "editItem": "Edit Item",
    "deleteItem": "Delete Item",
    "viewItem": "View Item",
    "printQrCode": "Print QR Code",
    "downloadQrCode": "Download QR Code",
    "scanCount": "Scan Count",
    "lastScanned": "Last Scanned",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "selectProperty": "Select Property",
    "itemDetails": "Item Details",
    "noArticles": "No articles yet",
    "addFirstArticle": "Add your first article",
    "room": "Room",
    "tags": "Tags",
    "addTag": "Add Tag",
    "removeTag": "Remove Tag"
  }
}
```

**Non-English Translation Files:**
Currently contain translations for the basic `items` namespace keys but need expansion to match the full Item Management feature set as defined in REQ-E02-079 through REQ-E02-083.

### 2.3 Expected Behavior

After implementation:
1. All 5 non-English language files contain complete translations for the expanded `items` namespace
2. Translations are linguistically accurate and contextually appropriate
3. Pluralization follows ICU format with correct plural rules per language
4. Gender agreement is correct where applicable (French, Spanish, Italian, German)
5. Translations fit within existing UI component sizes without overflow
6. No missing translation keys exist across any language file

---

## 3. Technical Approach

### 3.1 Translation Scope

Based on the Implementation Plan Sub-Epic 2D specification and related requests (REQ-E02-079 through REQ-E02-083), the `items` namespace will be expanded to include:

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "createNew": "New QR Code Item",

    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": "No items match your filters"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "loading": "Loading items"
    },

    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "MIXED",
        "video": "VIDEO",
        "photo": "PHOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Enter title...",
        "location": "Add location...",
        "tags": "Add tags..."
      },
      "aria": {
        "location": "Location: {location}.",
        "selected": "Selected",
        "notSelected": "Not selected",
        "pressEnterToSelect": "Press Enter to select",
        "pressEnterToDeselect": "Press Enter to deselect",
        "pressEnterToPreview": "Press Enter to preview",
        "selectItem": "Select {title}",
        "thumbnail": "{title} thumbnail",
        "editTitle": "Edit title for {title}",
        "editLocation": "Edit location for {title}",
        "editTags": "Edit tags for {title}"
      },
      "tags": {
        "more": "+{count} more"
      },
      "views": "{count, plural, one {# view} other {# views}}",
      "pieces": "{count, plural, one {# piece} other {# pieces}} of content",
      "noContent": "No content yet"
    },

    "actions": {
      "create": "New Item",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "share": "Share",
      "export": "Export"
    },

    "filters": {
      "title": "Filters",
      "property": "Property",
      "room": "Room",
      "tag": "Tag",
      "contentType": "Content Type",
      "status": "Status",
      "dateRange": "Date Range",
      "clearAll": "Clear All",
      "apply": "Apply Filters"
    },

    "sort": {
      "title": "Sort By",
      "newest": "Newest First",
      "oldest": "Oldest First",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Most Viewed",
      "recentlyUpdated": "Recently Updated"
    },

    "bulk": {
      "selected": "{count} selected",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "delete": "Delete Selected",
      "move": "Move to Property",
      "addTags": "Add Tags",
      "removeTags": "Remove Tags",
      "print": "Print Selected",
      "export": "Export Selected"
    },

    "detail": {
      "title": "Item Details",
      "qrCode": "QR Code",
      "analytics": "Analytics",
      "content": "Content",
      "settings": "Settings",
      "history": "History"
    },

    "status": {
      "active": "Active",
      "archived": "Archived",
      "draft": "Draft",
      "pending": "Pending"
    },

    "delete": {
      "title": "Delete Item",
      "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "confirm": "Delete Item",
      "success": "Item deleted successfully",
      "bulkTitle": "Delete {count} Items",
      "bulkMessage": "Are you sure you want to delete {count} items? This action cannot be undone."
    },

    "move": {
      "title": "Move Items",
      "selectProperty": "Select destination property",
      "success": "Items moved successfully"
    },

    "messages": {
      "created": "Item created successfully",
      "updated": "Item updated successfully",
      "duplicated": "Item duplicated successfully",
      "exported": "Items exported successfully"
    },

    "validation": {
      "nameRequired": "Item name is required",
      "nameTooLong": "Item name must be less than {max} characters",
      "descriptionTooLong": "Description must be less than {max} characters"
    }
  }
}
```

### 3.2 Language-Specific Considerations

| Language | Considerations |
|----------|----------------|
| **French (fr)** | Gender agreement (masculine/feminine), formal "vous" vs informal "tu", accented characters |
| **Spanish (es)** | Gender agreement, formal "usted" vs informal "tu", inverted punctuation (?) |
| **German (de)** | Compound nouns, formal "Sie" vs informal "du", case system (nominative/accusative/dative) |
| **Dutch (nl)** | Compound nouns, formal "u" vs informal "jij/je", articles (de/het) |
| **Italian (it)** | Gender agreement, formal "Lei" vs informal "tu", accented characters |

### 3.3 Pluralization Rules per Language

| Language | Plural Categories | Example |
|----------|------------------|---------|
| French | one, other | 0 articles, 1 article, 2 articles |
| Spanish | one, other | 0 artculos, 1 artculo, 2 artculos |
| German | one, other | 0 Artikel, 1 Artikel, 2 Artikel |
| Dutch | one, other | 0 items, 1 item, 2 items |
| Italian | one, other | 0 elementi, 1 elemento, 2 elementi |

---

## 4. Implementation Tasks

### Task 1: Audit and expand English items namespace (Priority: High)

**Description:** Ensure the English translation file contains all keys required for the complete Item Management feature set before generating non-English translations.

**File to Modify:** `/messages/en.json`

**Acceptance Criteria:**
- [ ] Verify all keys from the expanded namespace structure exist in en.json
- [ ] Add any missing keys identified in REQ-E02-079 through REQ-E02-083
- [ ] Validate ICU format for all pluralized strings
- [ ] Ensure consistent key naming conventions

---

### Task 2: Generate French (fr) translations (Priority: High)

**Description:** Create complete French translations for the items namespace.

**File to Modify:** `/messages/fr.json`

**Key Translation Examples:**

| English | French |
|---------|--------|
| Items | Articles |
| No items yet | Aucun article pour l'instant |
| Create your first QR code item | Crez votre premier article QR code |
| Delete Item | Supprimer l'article |
| Selected | Slectionn |
| Press Enter to select | Appuyez sur Entre pour slectionner |
| {count} selected | {count, plural, one {# slectionn} other {# slectionns}} |

**Acceptance Criteria:**
- [ ] All items namespace keys translated
- [ ] Gender agreement verified (le/la, un/une)
- [ ] Pluralization follows French rules
- [ ] Accented characters properly encoded (UTF-8)
- [ ] Formal "vous" form used consistently

---

### Task 3: Generate Spanish (es) translations (Priority: High)

**Description:** Create complete Spanish translations for the items namespace.

**File to Modify:** `/messages/es.json`

**Key Translation Examples:**

| English | Spanish |
|---------|---------|
| Items | Artculos |
| No items yet | No hay artculos todava |
| Create your first QR code item | Crea tu primer artculo con cdigo QR |
| Delete Item | Eliminar artculo |
| Selected | Seleccionado |
| Press Enter to select | Presiona Enter para seleccionar |
| {count} selected | {count, plural, one {# seleccionado} other {# seleccionados}} |

**Acceptance Criteria:**
- [ ] All items namespace keys translated
- [ ] Gender agreement verified (el/la, un/una)
- [ ] Pluralization follows Spanish rules
- [ ] Accented characters properly encoded ()
- [ ] Consistent use of informal "t" for user-friendly tone

---

### Task 4: Generate German (de) translations (Priority: High)

**Description:** Create complete German translations for the items namespace.

**File to Modify:** `/messages/de.json`

**Key Translation Examples:**

| English | German |
|---------|--------|
| Items | Artikel |
| No items yet | Noch keine Artikel |
| Create your first QR code item | Erstellen Sie Ihren ersten QR-Code-Artikel |
| Delete Item | Artikel lschen |
| Selected | Ausgewhlt |
| Press Enter to select | Drcken Sie die Eingabetaste zum Auswhlen |
| {count} selected | {count, plural, one {# ausgewhlt} other {# ausgewhlt}} |

**Acceptance Criteria:**
- [ ] All items namespace keys translated
- [ ] Compound nouns correctly formed (QR-Code-Artikel)
- [ ] Pluralization follows German rules
- [ ] Umlauts properly encoded (, , )
- [ ] Formal "Sie" form used consistently

---

### Task 5: Generate Dutch (nl) translations (Priority: High)

**Description:** Create complete Dutch translations for the items namespace.

**File to Modify:** `/messages/nl.json`

**Key Translation Examples:**

| English | Dutch |
|---------|-------|
| Items | Items |
| No items yet | Nog geen items |
| Create your first QR code item | Maak je eerste QR-code item |
| Delete Item | Item verwijderen |
| Selected | Geselecteerd |
| Press Enter to select | Druk op Enter om te selecteren |
| {count} selected | {count, plural, one {# geselecteerd} other {# geselecteerd}} |

**Acceptance Criteria:**
- [ ] All items namespace keys translated
- [ ] Correct article usage (de/het)
- [ ] Pluralization follows Dutch rules
- [ ] IJ digraph handled correctly where applicable
- [ ] Informal "je/jij" form used for user-friendly tone

---

### Task 6: Generate Italian (it) translations (Priority: High)

**Description:** Create complete Italian translations for the items namespace.

**File to Modify:** `/messages/it.json`

**Key Translation Examples:**

| English | Italian |
|---------|---------|
| Items | Elementi |
| No items yet | Nessun elemento ancora |
| Create your first QR code item | Crea il tuo primo elemento con codice QR |
| Delete Item | Elimina elemento |
| Selected | Selezionato |
| Press Enter to select | Premi Invio per selezionare |
| {count} selected | {count, plural, one {# selezionato} other {# selezionati}} |

**Acceptance Criteria:**
- [ ] All items namespace keys translated
- [ ] Gender agreement verified (il/la, un/una)
- [ ] Pluralization follows Italian rules
- [ ] Accented characters properly encoded (, , )
- [ ] Informal "tu" form used for user-friendly tone

---

### Task 7: Validate translation completeness (Priority: High)

**Description:** Run validation to ensure all language files have identical key structures with no missing translations.

**Validation Script:**
```bash
npm run i18n:check
```

**Manual Validation:**
- Compare key counts across all 6 language files
- Verify no placeholder text (e.g., "TODO", "TRANSLATE") remains
- Check for malformed ICU format strings

**Acceptance Criteria:**
- [ ] All 6 language files have identical key count
- [ ] No missing translation warnings in console
- [ ] ICU format valid in all pluralized strings
- [ ] JSON files are valid and well-formed

---

### Task 8: UI layout validation (Priority: Medium)

**Description:** Verify translations fit within UI components without causing layout breaks.

**Test Scenarios:**
1. ItemGrid with various item counts (0, 1, 100+)
2. ItemCard with long translated labels
3. Filter panel with translated options
4. Bulk action toolbar with count indicators
5. Confirmation dialogs with full message text

**Acceptance Criteria:**
- [ ] No text overflow in any component
- [ ] Button text fits without truncation
- [ ] Dialog messages display completely
- [ ] Filter dropdowns accommodate translated labels
- [ ] Status badges remain readable

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Modification Type |
|------|-------------------|
| `/messages/en.json` | Extend `items` namespace with missing keys |
| `/messages/fr.json` | Add/update `items` namespace translations |
| `/messages/es.json` | Add/update `items` namespace translations |
| `/messages/de.json` | Add/update `items` namespace translations |
| `/messages/nl.json` | Add/update `items` namespace translations |
| `/messages/it.json` | Add/update `items` namespace translations |

### 5.2 Read-Only Reference Files

| File | Purpose |
|------|---------|
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Translation namespace structure reference |
| `docs/REQ-E02-079-*` through `docs/REQ-E02-083-*` | Prior Item Management i18n requirements |
| `src/components/ItemManager/**/*.tsx` | Component string usage reference |
| `src/lib/i18n/config.ts` | i18n configuration reference |

### 5.3 Validation Scripts

| Script | Purpose |
|--------|---------|
| `npm run i18n:check` | Verify all keys exist in all languages |
| `npm run i18n:unused` | Detect unused translation keys |
| `npm run typecheck` | Verify TypeScript compatibility |

---

## 6. Translation Quality Guidelines

### 6.1 Terminology Consistency

Maintain consistent translations for key terms across all strings:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Item | Article | Artculo | Artikel | Item | Elemento |
| Property | Proprit | Propiedad | Eigenschaft | Eigenschap | Propriet |
| QR Code | Code QR | Cdigo QR | QR-Code | QR-code | Codice QR |
| Tag | Tag | Etiqueta | Tag | Tag | Tag |
| Filter | Filtre | Filtro | Filter | Filter | Filtro |

### 6.2 Tone and Voice

- Use **friendly but professional** tone
- Prefer **informal address** (tu/jij/du) for user-facing text
- Use **formal address** (vous/Sie/u) for legal/security contexts
- Keep messages **concise** to fit UI constraints

### 6.3 Placeholder Variables

Preserve all placeholder variables exactly as in English:
- `{count}` - numeric counts
- `{name}` - item names
- `{title}` - titles
- `{location}` - location values
- `{max}` - maximum values

---

## 7. Dependencies and Blockers

### 7.1 Prerequisites

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| English translations complete | Required | Must have full items namespace in en.json |
| Component i18n integration | Required | REQ-E02-079 through REQ-E02-083 should be complete |
| Translation infrastructure | Complete | Epic 1 foundation in place |

### 7.2 Dependencies on Other Requests

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| REQ-E02-079 | English keys defined | In Progress |
| REQ-E02-080 | ItemGrid/ItemCard keys | In Progress |
| REQ-E02-081 | Filter/Sort keys | In Progress |
| REQ-E02-082 | Bulk Action keys | In Progress |
| REQ-E02-083 | Detail/Edit page keys | In Progress |

### 7.3 Potential Blockers

| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Missing English keys | Medium | Audit en.json before starting translations |
| Changed key structure | Low | Coordinate with component i18n tasks |
| Translation quality issues | Medium | Use professional translation service or AI validation |

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent terminology across languages | Medium | Medium | Maintain glossary document, cross-reference translations |
| Pluralization errors | Medium | Low | Test with counts 0, 1, 2, many in all languages |
| Text overflow in UI | Medium | Medium | Design review with 40% expansion buffer |
| Missing translations in production | Low | High | Build-time validation, runtime fallbacks |
| Gender agreement errors | Medium | Low | Native speaker review for gendered languages |
| Encoding issues | Low | Medium | Verify UTF-8 encoding, test special characters |

---

## 9. Verification Checklist

### 9.1 Translation Completeness
- [ ] en.json items namespace has all required keys
- [ ] fr.json items namespace has all required keys
- [ ] es.json items namespace has all required keys
- [ ] de.json items namespace has all required keys
- [ ] nl.json items namespace has all required keys
- [ ] it.json items namespace has all required keys
- [ ] Key counts match across all 6 files

### 9.2 Translation Quality
- [ ] No placeholder text remaining (TODO, TRANSLATE, etc.)
- [ ] Pluralization works correctly in all languages
- [ ] Variable interpolation works correctly
- [ ] Gender agreement correct in French, Spanish, Italian, German
- [ ] Formal/informal tone consistent within each language

### 9.3 Technical Validation
- [ ] All JSON files are valid (no syntax errors)
- [ ] ICU format strings are valid
- [ ] Special characters properly encoded (UTF-8)
- [ ] No console warnings for missing translations
- [ ] TypeScript compiles without errors

### 9.4 UI Verification
- [ ] Text fits within all UI components
- [ ] No truncation of button labels
- [ ] Dialog messages display completely
- [ ] Screen reader announces correctly

---

## 10. Acceptance Criteria Mapping

| Requirement | Implementation Task |
|-------------|---------------------|
| French translation complete | Task 2 |
| Spanish translation complete | Task 3 |
| German translation complete | Task 4 |
| Dutch translation complete (Note: replaces Portuguese) | Task 5 |
| Italian translation complete | Task 6 |
| All field labels translated | Tasks 2-6 |
| Button labels use correct terminology | Tasks 2-6 |
| Filter labels translated | Tasks 2-6 |
| Sort option labels translated | Tasks 2-6 |
| Bulk action dialogs natural | Tasks 2-6 |
| Status indicators locale-appropriate | Tasks 2-6 |
| Empty state messages convey meaning | Tasks 2-6 |
| Error messages culturally appropriate | Tasks 2-6 |
| Plural forms handled correctly | Tasks 2-6, Task 7 |
| Gender agreement correct | Tasks 2-6 |
| No missing translation keys | Task 7 |
| Translation files valid JSON | Task 7 |

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-084
- **Related Requests:** REQ-E02-079 through REQ-E02-083 (Item Management i18n)
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
