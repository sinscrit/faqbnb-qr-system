# Implementation Overview: REQ-E02-012 - Generate Translations for Property Management Namespace

**Document Created:** 2026-01-20 21:00:00 UTC
**Last Modified:** 2026-01-20 21:00:00 UTC

**Request ID:** REQ-E02-012
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.6
**Size:** M (Medium)
**Priority:** P2

---

## 1. Summary

Generate translation files for all property management namespace strings in the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task follows the extraction of property management strings from Tasks 2F.1-2F.5, which include PropertyForm, property modals (AddPropertyModal, PropertyEditModal, delete confirmation), property pages, and PropertySelector components. The property management namespace contains approximately 200+ unique strings that need accurate, contextually appropriate translations.

---

## 2. Current State Analysis

### 2.1 Source English Strings Location

The English source strings exist in `/messages/en.json` under the `properties` namespace, added by tasks 2F.1-2F.5. Additionally, a `countries` namespace was added for country name translations.

### 2.2 Existing Translation File Structure

| Language File | Path | Current State |
|---------------|------|---------------|
| English (source) | `/messages/en.json` | Contains `properties` namespace with all extracted strings |
| French | `/messages/fr.json` | Needs `properties` and `countries` namespace added |
| Spanish | `/messages/es.json` | Needs `properties` and `countries` namespace added |
| German | `/messages/de.json` | Needs `properties` and `countries` namespace added |
| Dutch | `/messages/nl.json` | Needs `properties` and `countries` namespace added |
| Italian | `/messages/it.json` | Needs `properties` and `countries` namespace added |

### 2.3 Strings to Translate

Based on the extracted strings from Tasks 2F.1-2F.5, the properties namespace includes:

#### 2.3.1 PropertyForm Strings (~28 strings)
- Form titles: "Edit Property", "Create New Property"
- Labels: "Property Owner", "Property Nickname", "Property Type", "Address"
- Placeholders: "Select property owner...", "e.g., Main Office, Home, Vacation House", etc.
- Hints: Character counts, descriptions
- Validation: "Property nickname is required", "Property nickname must be 100 characters or less", etc.
- Actions: "Update Property", "Create Property", "Updating...", "Creating..."
- Errors: "Failed to save property. Please try again."

#### 2.3.2 Property Modal Strings (~75 strings)
- Add Modal: title, description, status messages, actions
- Edit Modal: title, description, status messages, actions
- Delete Modal: title, confirmation with interpolation, warning, actions
- Form fields: labels, placeholders, validation messages
- Country names (24 countries)

#### 2.3.3 Property Pages Strings (~150+ strings)
- Page titles and descriptions for various property pages
- Section headings and labels
- Table headers (Property, Type, Address, Owner, Created, Actions)
- Search/filter labels and placeholders
- Empty states and error states
- Permission warnings
- Breadcrumb navigation
- Pagination controls
- Quick actions

#### 2.3.4 PropertySelector Strings (~8 strings)
- title, subtitle, loading, empty state
- "All Properties" placeholder
- Accessibility labels

### 2.4 String Categories Summary

| Category | Estimated Count | Notes |
|----------|-----------------|-------|
| Form labels | ~20 | Field labels, section headers |
| Placeholders | ~15 | Input placeholders, select prompts |
| Validation messages | ~15 | Form validation errors |
| Button labels | ~25 | Actions, loading states |
| Page titles/headings | ~30 | Page headers, section titles |
| Table/list content | ~15 | Headers, labels, status text |
| Empty/error states | ~20 | Various state messages |
| Notifications | ~10 | Success, error, warning toasts |
| Navigation | ~15 | Breadcrumbs, back buttons |
| Modal content | ~20 | Titles, descriptions, confirmations |
| Country names | ~24 | Full country name translations |
| Accessibility | ~10 | Aria-labels, screen reader text |
| **Total** | **~220** | |

---

## 3. Technical Approach

### 3.1 Translation Strategy

1. **Semantic Accuracy**: Translations must convey the exact meaning and intent of the source English text
2. **Contextual Appropriateness**: Property management terminology should be consistent and professional
3. **Formal vs. Informal**: Use formal address ("vous" in French, "Sie" in German, "u" in Dutch) for professional property management context
4. **Interpolation Preservation**: All `{variable}` placeholders must be preserved exactly in translations
5. **ICU Format Compliance**: Pluralization patterns must follow ICU MessageFormat specification
6. **Character Encoding**: Proper UTF-8 encoding for all non-ASCII characters

### 3.2 Translation Key Preservation

All translation keys must remain identical across language files. Only the values are translated:

```json
// English
"properties.form.labels.nickname": "Property Nickname"

// French
"properties.form.labels.nickname": "Nom de la propriete"

// German
"properties.form.labels.nickname": "Immobilienname"
```

### 3.3 ICU Pluralization Patterns

Pluralization must work correctly for each language:

```json
// English
"section.itemCount": "{count, plural, one {# item} other {# items}}"

// French
"section.itemCount": "{count, plural, one {# article} other {# articles}}"

// German
"section.itemCount": "{count, plural, one {# Artikel} other {# Artikel}}"
```

### 3.4 Variable Interpolation

Variables must be preserved exactly as they appear in source strings:

```json
// English
"modals.delete.confirmation": "Are you sure you want to delete the property \"{name}\"?"

// Spanish
"modals.delete.confirmation": "Esta seguro de que desea eliminar la propiedad \"{name}\"?"
```

### 3.5 Country Name Standards

Country names should use official endonyms or standard translated names per ISO 3166:

| Code | English | Spanish | French | German | Dutch | Italian |
|------|---------|---------|--------|--------|-------|---------|
| US | United States | Estados Unidos | Etats-Unis | Vereinigte Staaten | Verenigde Staten | Stati Uniti |
| GB | United Kingdom | Reino Unido | Royaume-Uni | Vereinigtes Konigreich | Verenigd Koninkrijk | Regno Unito |
| DE | Germany | Alemania | Allemagne | Deutschland | Duitsland | Germania |
| FR | France | Francia | France | Frankreich | Frankrijk | Francia |
| ES | Spain | Espana | Espagne | Spanien | Spanje | Spagna |

---

## 4. Implementation Tasks

### Task 1: Compile Complete English Source Strings
- Extract final `properties` namespace from `/messages/en.json`
- Extract final `countries` namespace from `/messages/en.json`
- Verify all strings from Tasks 2F.1-2F.5 are present
- Create translation source document for reference

### Task 2: Generate French Translations
- Translate all `properties` namespace strings to French
- Translate all `countries` namespace strings to French
- Use formal address ("vous")
- Verify pluralization patterns
- Verify variable interpolation

### Task 3: Generate Spanish Translations
- Translate all `properties` namespace strings to Spanish
- Translate all `countries` namespace strings to Spanish
- Use formal address ("usted")
- Verify pluralization patterns
- Verify variable interpolation

### Task 4: Generate German Translations
- Translate all `properties` namespace strings to German
- Translate all `countries` namespace strings to German
- Use formal address ("Sie")
- Verify pluralization patterns (German has specific rules)
- Verify variable interpolation
- Account for longer German text in UI

### Task 5: Generate Dutch Translations
- Translate all `properties` namespace strings to Dutch
- Translate all `countries` namespace strings to Dutch
- Use formal address ("u")
- Verify pluralization patterns
- Verify variable interpolation

### Task 6: Generate Italian Translations
- Translate all `properties` namespace strings to Italian
- Translate all `countries` namespace strings to Italian
- Use formal address ("Lei")
- Verify pluralization patterns
- Verify variable interpolation

### Task 7: Update Translation Files
- Add `properties` namespace to `/messages/fr.json`
- Add `properties` namespace to `/messages/es.json`
- Add `properties` namespace to `/messages/de.json`
- Add `properties` namespace to `/messages/nl.json`
- Add `properties` namespace to `/messages/it.json`
- Add `countries` namespace to all non-English files

### Task 8: Verification and Quality Check
- Verify all keys match between English and translated files
- Verify no missing translations in any language
- Verify all interpolation variables preserved
- Verify pluralization syntax correct
- Verify character encoding correct
- Run build to verify no translation errors

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/fr.json` | French translations | Add `properties` and `countries` namespaces |
| `/messages/es.json` | Spanish translations | Add `properties` and `countries` namespaces |
| `/messages/de.json` | German translations | Add `properties` and `countries` namespaces |
| `/messages/nl.json` | Dutch translations | Add `properties` and `countries` namespaces |
| `/messages/it.json` | Italian translations | Add `properties` and `countries` namespaces |

### 5.2 Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |

### 5.3 Files NOT to Modify

- `/messages/en.json` - English source should already be complete from Tasks 2F.1-2F.5
- `/src/components/*.tsx` - Component files should not be modified in this task
- `/src/app/**/*.tsx` - Page files should not be modified in this task
- Any TypeScript/JavaScript source files
- Database migrations
- API routes

---

## 6. Dependencies

### 6.1 Required Completions Before This Task

| Task | Status | Notes |
|------|--------|-------|
| 2F.1: Create properties namespace | Must be Complete | English namespace structure exists |
| 2F.2: Update PropertyForm | Must be Complete | Form strings extracted to en.json |
| 2F.3: Update property modals | Must be Complete | Modal strings extracted to en.json |
| 2F.4: Update property pages | Must be Complete | Page strings extracted to en.json |
| 2F.5: Update PropertySelector | Must be Complete | Selector strings extracted to en.json |
| Epic 1: i18n Foundation | Must be Complete | Translation infrastructure operational |

### 6.2 Post-Completion Usage

After this task completes, the following components will display property management UI in all 6 languages:
- PropertyForm
- AddPropertyModal, PropertyEditModal
- PropertiesManagement (including delete modal)
- Property detail pages (dashboard and admin)
- Property edit/new pages
- PropertySection component
- PropertySelector component
- All property-related error and empty states

---

## 7. Acceptance Criteria

### 7.1 Completeness
- [ ] French translation file includes complete translations for all `properties` namespace strings
- [ ] Spanish translation file includes complete translations for all `properties` namespace strings
- [ ] German translation file includes complete translations for all `properties` namespace strings
- [ ] Dutch translation file includes complete translations for all `properties` namespace strings
- [ ] Italian translation file includes complete translations for all `properties` namespace strings
- [ ] All language files include complete `countries` namespace translations

### 7.2 Quality
- [ ] All translations maintain semantic accuracy with the source English text
- [ ] Translations follow language-specific conventions for terminology and phrasing
- [ ] Property-specific terms are translated consistently across all strings within each language
- [ ] Status indicators and property states convey appropriate meaning in each language
- [ ] Formal vs. informal address is handled appropriately for languages with this distinction

### 7.3 Technical Correctness
- [ ] Character encoding is correct for all non-Latin scripts and accented characters
- [ ] All interpolation variables (`{name}`, `{count}`, etc.) are preserved exactly in translated strings
- [ ] Pluralization patterns use correct ICU MessageFormat syntax for each language
- [ ] No English strings remain as placeholders in any language file
- [ ] Translation files follow the established message bundle structure and namespace hierarchy

### 7.4 Build Verification
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No missing translation key warnings in console
- [ ] Application loads without errors in all supported languages

---

## 8. Testing Checklist

### 8.1 Translation Verification Per Language

#### French (fr)
- [ ] PropertyForm displays all labels in French
- [ ] Property modals display all content in French
- [ ] Property pages display all content in French
- [ ] PropertySelector displays all options in French
- [ ] Country dropdown shows French country names
- [ ] Pluralization works correctly ("1 article", "5 articles")

#### Spanish (es)
- [ ] PropertyForm displays all labels in Spanish
- [ ] Property modals display all content in Spanish
- [ ] Property pages display all content in Spanish
- [ ] PropertySelector displays all options in Spanish
- [ ] Country dropdown shows Spanish country names
- [ ] Pluralization works correctly ("1 articulo", "5 articulos")

#### German (de)
- [ ] PropertyForm displays all labels in German
- [ ] Property modals display all content in German
- [ ] Property pages display all content in German
- [ ] PropertySelector displays all options in German
- [ ] Country dropdown shows German country names
- [ ] Text does not overflow UI elements (German is typically longer)
- [ ] Pluralization works correctly ("1 Artikel", "5 Artikel")

#### Dutch (nl)
- [ ] PropertyForm displays all labels in Dutch
- [ ] Property modals display all content in Dutch
- [ ] Property pages display all content in Dutch
- [ ] PropertySelector displays all options in Dutch
- [ ] Country dropdown shows Dutch country names
- [ ] Pluralization works correctly

#### Italian (it)
- [ ] PropertyForm displays all labels in Italian
- [ ] Property modals display all content in Italian
- [ ] Property pages display all content in Italian
- [ ] PropertySelector displays all options in Italian
- [ ] Country dropdown shows Italian country names
- [ ] Pluralization works correctly ("1 articolo", "5 articoli")

### 8.2 Cross-Language Consistency
- [ ] Same property types display consistently across languages
- [ ] Action buttons maintain similar length for UI consistency
- [ ] Error messages convey equivalent severity and meaning
- [ ] Success messages convey equivalent positivity

### 8.3 Interpolation Testing
- [ ] Delete confirmation shows property name correctly in all languages
- [ ] Character count displays work in all languages
- [ ] Search results summary interpolates correctly in all languages
- [ ] Edit page subtitle shows property name correctly

### 8.4 Visual Regression
- [ ] No text truncation in buttons across languages
- [ ] No text overflow in form labels across languages
- [ ] No text overflow in table headers across languages
- [ ] Modal layouts accommodate longer translated text
- [ ] Dropdown menus accommodate longer translated text

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Use professional terminology, maintain glossary |
| Missing interpolation variables | Low | High | Automated check for `{variable}` patterns |
| Incorrect pluralization syntax | Medium | Medium | Verify ICU format for each language |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding, test special characters |
| Inconsistent terminology | Medium | Low | Create terminology glossary, review consistency |
| Build failures from malformed JSON | Low | High | Validate JSON syntax before committing |
| Text overflow in UI | Medium | Low | Test with German (longest text), adjust if needed |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Compile English source strings | 15 minutes |
| Generate French translations | 30 minutes |
| Generate Spanish translations | 30 minutes |
| Generate German translations | 35 minutes |
| Generate Dutch translations | 30 minutes |
| Generate Italian translations | 30 minutes |
| Update all translation files | 20 minutes |
| Verification and quality check | 30 minutes |
| **Total** | **~3.5 hours** |

---

## 11. Translation Reference

### 11.1 Key Property Management Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Property | Propiedad | Propriete | Immobilie | Eigendom | Proprieta |
| Address | Direccion | Adresse | Adresse | Adres | Indirizzo |
| Owner | Propietario | Proprietaire | Eigentumer | Eigenaar | Proprietario |
| Create | Crear | Creer | Erstellen | Maken | Crea |
| Delete | Eliminar | Supprimer | Loschen | Verwijderen | Elimina |
| Edit | Editar | Modifier | Bearbeiten | Bewerken | Modifica |
| Save | Guardar | Enregistrer | Speichern | Opslaan | Salva |
| Cancel | Cancelar | Annuler | Abbrechen | Annuleren | Annulla |
| Filter | Filtrar | Filtrer | Filtern | Filteren | Filtra |
| Search | Buscar | Rechercher | Suchen | Zoeken | Cerca |

### 11.2 Sample Full Translations

#### Delete Confirmation Modal

**English:**
```json
"modals": {
  "delete": {
    "title": "Delete Property",
    "confirmation": "Are you sure you want to delete the property \"{name}\"?",
    "warning": "This action cannot be undone.",
    "actions": {
      "delete": "Delete",
      "deleting": "Deleting..."
    }
  }
}
```

**French:**
```json
"modals": {
  "delete": {
    "title": "Supprimer la propriete",
    "confirmation": "Etes-vous sur de vouloir supprimer la propriete \"{name}\" ?",
    "warning": "Cette action est irreversible.",
    "actions": {
      "delete": "Supprimer",
      "deleting": "Suppression..."
    }
  }
}
```

**Spanish:**
```json
"modals": {
  "delete": {
    "title": "Eliminar propiedad",
    "confirmation": "Esta seguro de que desea eliminar la propiedad \"{name}\"?",
    "warning": "Esta accion no se puede deshacer.",
    "actions": {
      "delete": "Eliminar",
      "deleting": "Eliminando..."
    }
  }
}
```

**German:**
```json
"modals": {
  "delete": {
    "title": "Immobilie loschen",
    "confirmation": "Sind Sie sicher, dass Sie die Immobilie \"{name}\" loschen mochten?",
    "warning": "Diese Aktion kann nicht ruckgangig gemacht werden.",
    "actions": {
      "delete": "Loschen",
      "deleting": "Wird geloscht..."
    }
  }
}
```

**Dutch:**
```json
"modals": {
  "delete": {
    "title": "Eigendom verwijderen",
    "confirmation": "Weet u zeker dat u het eigendom \"{name}\" wilt verwijderen?",
    "warning": "Deze actie kan niet ongedaan worden gemaakt.",
    "actions": {
      "delete": "Verwijderen",
      "deleting": "Verwijderen..."
    }
  }
}
```

**Italian:**
```json
"modals": {
  "delete": {
    "title": "Elimina proprieta",
    "confirmation": "Sei sicuro di voler eliminare la proprieta \"{name}\"?",
    "warning": "Questa azione non puo essere annullata.",
    "actions": {
      "delete": "Elimina",
      "deleting": "Eliminazione..."
    }
  }
}
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2F section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-012
- [REQ-E02-008: PropertyForm Overview](/docs/REQ-E02-008-update-propertyform-overview.md)
- [REQ-E02-009: Property Modals Overview](/docs/REQ-E02-009-update-property-modals-overview.md)
- [REQ-E02-010: Property Pages Overview](/docs/REQ-E02-010-update-property-pages-overview.md)
- [REQ-E02-011: PropertySelector Overview](/docs/REQ-E02-011-update-propertyselector-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ISO 3166 Country Names](https://www.iso.org/iso-3166-country-codes.html)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
