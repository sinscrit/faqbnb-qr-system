# Detailed Task Breakdown: REQ-E02-012 - Generate Translations for Property Management Namespace

**Document Created:** 2026-01-20 22:30:00 UTC
**Last Modified:** 2026-01-20 22:30:00 UTC

**Request ID:** REQ-E02-012
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.6
**Size:** M (Medium)
**Priority:** P2

---

## 1. Task Summary

Generate complete translations for the `properties` and `countries` namespaces in all five non-English language files (French, Spanish, German, Dutch, Italian). This task takes the English source strings extracted from Tasks 2F.1-2F.5 and produces linguistically accurate, contextually appropriate translations for property management UI across all supported languages.

---

## 2. Prerequisites

### 2.1 Required Completions

| Task | Description | Status Check |
|------|-------------|--------------|
| 2F.1 | Create `properties` namespace structure in `/messages/en.json` | Verify `properties` key exists |
| 2F.2 | Update PropertyForm with localized strings | Verify `properties.form.*` keys exist |
| 2F.3 | Update property modals with localized strings | Verify `properties.modals.*` keys exist |
| 2F.4 | Update property pages with localized strings | Verify `properties.pages.*` keys exist |
| 2F.5 | Update PropertySelector with localized strings | Verify `properties.selector.*` keys exist |
| Epic 1 | i18n Foundation complete | Verify all 6 language files exist |

### 2.2 Pre-Task Verification Commands

```bash
# Verify properties namespace exists in en.json
cat messages/en.json | grep -c '"properties"'

# Verify all language files exist
ls -la messages/*.json

# Count keys in English properties namespace
cat messages/en.json | jq '.properties | keys | length'
```

---

## 3. Detailed Task Breakdown

### Task 1: Extract and Validate English Source Strings
**Estimated Effort:** 15 minutes
**Story Points:** 0.5

#### 1.1 Objective
Extract the complete `properties` namespace from `/messages/en.json` and validate all strings from Tasks 2F.1-2F.5 are present.

#### 1.2 Steps

1. **Read the English translation file**
   - File: `/messages/en.json`
   - Extract the `properties` namespace
   - Extract the `countries` namespace (if present)

2. **Validate namespace structure**
   - Verify `properties.form` exists (from 2F.2)
   - Verify `properties.modals` exists (from 2F.3)
   - Verify `properties.pages` exists (from 2F.4)
   - Verify `properties.selector` exists (from 2F.5)

3. **Create source document**
   - Document all keys requiring translation
   - Note any interpolation variables (`{name}`, `{count}`, etc.)
   - Note any pluralization patterns (ICU format)

#### 1.3 Expected String Categories

| Category | Expected Keys | Source Task |
|----------|---------------|-------------|
| `properties.form.labels.*` | ~8 keys | 2F.2 |
| `properties.form.placeholders.*` | ~6 keys | 2F.2 |
| `properties.form.validation.*` | ~8 keys | 2F.2 |
| `properties.form.hints.*` | ~4 keys | 2F.2 |
| `properties.form.actions.*` | ~4 keys | 2F.2 |
| `properties.modals.add.*` | ~15 keys | 2F.3 |
| `properties.modals.edit.*` | ~15 keys | 2F.3 |
| `properties.modals.delete.*` | ~8 keys | 2F.3 |
| `properties.pages.*` | ~40 keys | 2F.4 |
| `properties.selector.*` | ~8 keys | 2F.5 |
| `countries.*` | ~24 keys | 2F.3 |

#### 1.4 Acceptance Criteria
- [ ] All `properties` namespace keys documented
- [ ] All `countries` namespace keys documented
- [ ] Interpolation variables identified and listed
- [ ] Pluralization patterns identified and listed
- [ ] No duplicate or orphaned keys

---

### Task 2: Generate French Translations
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 2.1 Objective
Translate all property management strings to French, using formal address ("vous") and professional property management terminology.

#### 2.2 Translation Guidelines

| Guideline | Implementation |
|-----------|----------------|
| **Formality** | Use formal "vous" form (not "tu") |
| **Property term** | "Propriété" (with accent) |
| **Action buttons** | Infinitive form ("Enregistrer", "Supprimer") |
| **Questions** | Include space before "?" per French typography |
| **Character encoding** | UTF-8 for all accented characters (é, è, ê, ë, à, ù, ç, etc.) |

#### 2.3 Key Term Glossary (French)

| English | French |
|---------|--------|
| Property | Propriété |
| Address | Adresse |
| Owner | Propriétaire |
| Create | Créer |
| Delete | Supprimer |
| Edit | Modifier |
| Save | Enregistrer |
| Cancel | Annuler |
| Property Type | Type de propriété |
| Nickname | Surnom |
| Required | Requis |
| Optional | Facultatif |

#### 2.4 Steps

1. **Translate form strings** (`properties.form.*`)
   ```json
   "form": {
     "labels": {
       "nickname": "Surnom de la propriété",
       "owner": "Propriétaire",
       "type": "Type de propriété",
       "address": "Adresse"
     }
   }
   ```

2. **Translate modal strings** (`properties.modals.*`)
   ```json
   "modals": {
     "delete": {
       "title": "Supprimer la propriété",
       "confirmation": "Êtes-vous sûr de vouloir supprimer la propriété \"{name}\" ?",
       "warning": "Cette action est irréversible."
     }
   }
   ```

3. **Translate page strings** (`properties.pages.*`)

4. **Translate selector strings** (`properties.selector.*`)

5. **Translate country names** (`countries.*`)
   - Use official French country names per ISO 3166

#### 2.5 Interpolation Preservation

| English | French | Variables |
|---------|--------|-----------|
| `Delete "{name}"?` | `Supprimer « {name} » ?` | `{name}` preserved |
| `{count} properties` | `{count} propriétés` | `{count}` preserved |

#### 2.6 Acceptance Criteria
- [ ] All `properties` namespace keys translated
- [ ] All `countries` namespace keys translated
- [ ] Formal "vous" used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] French typography rules followed (space before ?, use of «»)
- [ ] Character encoding correct (UTF-8)

---

### Task 3: Generate Spanish Translations
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 3.1 Objective
Translate all property management strings to Spanish, using formal address ("usted") and professional property management terminology.

#### 3.2 Translation Guidelines

| Guideline | Implementation |
|-----------|----------------|
| **Formality** | Use formal "usted" form (not "tú") |
| **Property term** | "Propiedad" |
| **Action buttons** | Infinitive or imperative ("Guardar", "Eliminar") |
| **Questions** | Include opening "¿" and closing "?" |
| **Character encoding** | UTF-8 for ñ, á, é, í, ó, ú, ü |

#### 3.3 Key Term Glossary (Spanish)

| English | Spanish |
|---------|---------|
| Property | Propiedad |
| Address | Dirección |
| Owner | Propietario |
| Create | Crear |
| Delete | Eliminar |
| Edit | Editar |
| Save | Guardar |
| Cancel | Cancelar |
| Property Type | Tipo de propiedad |
| Nickname | Apodo |
| Required | Requerido |
| Optional | Opcional |

#### 3.4 Steps

1. **Translate form strings** (`properties.form.*`)
2. **Translate modal strings** (`properties.modals.*`)
   ```json
   "modals": {
     "delete": {
       "title": "Eliminar propiedad",
       "confirmation": "¿Está seguro de que desea eliminar la propiedad \"{name}\"?",
       "warning": "Esta acción no se puede deshacer."
     }
   }
   ```
3. **Translate page strings** (`properties.pages.*`)
4. **Translate selector strings** (`properties.selector.*`)
5. **Translate country names** (`countries.*`)

#### 3.5 Acceptance Criteria
- [ ] All `properties` namespace keys translated
- [ ] All `countries` namespace keys translated
- [ ] Formal "usted" used consistently
- [ ] Opening "¿" included for questions
- [ ] All `{variable}` placeholders preserved exactly
- [ ] Character encoding correct (UTF-8)

---

### Task 4: Generate German Translations
**Estimated Effort:** 35 minutes
**Story Points:** 1.5

#### 4.1 Objective
Translate all property management strings to German, using formal address ("Sie") and professional property management terminology.

#### 4.2 Translation Guidelines

| Guideline | Implementation |
|-----------|----------------|
| **Formality** | Use formal "Sie" form (capitalized) |
| **Property term** | "Immobilie" or "Objekt" (real estate context) |
| **Compound nouns** | Follow German compound noun rules |
| **Action buttons** | Infinitive form ("Speichern", "Löschen") |
| **Character encoding** | UTF-8 for ä, ö, ü, ß |
| **Text expansion** | German text ~30% longer; verify UI fit |

#### 4.3 Key Term Glossary (German)

| English | German |
|---------|--------|
| Property | Immobilie |
| Address | Adresse |
| Owner | Eigentümer |
| Create | Erstellen |
| Delete | Löschen |
| Edit | Bearbeiten |
| Save | Speichern |
| Cancel | Abbrechen |
| Property Type | Immobilientyp |
| Nickname | Kurzname |
| Required | Erforderlich |
| Optional | Optional |

#### 4.4 Steps

1. **Translate form strings** (`properties.form.*`)
2. **Translate modal strings** (`properties.modals.*`)
   ```json
   "modals": {
     "delete": {
       "title": "Immobilie löschen",
       "confirmation": "Sind Sie sicher, dass Sie die Immobilie \"{name}\" löschen möchten?",
       "warning": "Diese Aktion kann nicht rückgängig gemacht werden."
     }
   }
   ```
3. **Translate page strings** (`properties.pages.*`)
4. **Translate selector strings** (`properties.selector.*`)
5. **Translate country names** (`countries.*`)
   - Use official German country names per ISO 3166

#### 4.5 German-Specific Considerations

| Consideration | Example |
|---------------|---------|
| Compound nouns | "Eigenschaftsname" (property name) |
| Longer text | Plan for 30% text expansion in UI |
| Capitalization | All nouns capitalized |
| ß vs ss | Use ß appropriately ("größer", not "groesser") |

#### 4.6 Acceptance Criteria
- [ ] All `properties` namespace keys translated
- [ ] All `countries` namespace keys translated
- [ ] Formal "Sie" used consistently (capitalized)
- [ ] All nouns properly capitalized
- [ ] German compound noun rules followed
- [ ] All `{variable}` placeholders preserved exactly
- [ ] Character encoding correct (UTF-8 including ß)

---

### Task 5: Generate Dutch Translations
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 5.1 Objective
Translate all property management strings to Dutch, using formal address ("u") and professional property management terminology.

#### 5.2 Translation Guidelines

| Guideline | Implementation |
|-----------|----------------|
| **Formality** | Use formal "u" form (not "je/jij") |
| **Property term** | "Eigendom" or "Pand" (real estate) |
| **Action buttons** | Infinitive form ("Opslaan", "Verwijderen") |
| **Character encoding** | Standard Latin characters |

#### 5.3 Key Term Glossary (Dutch)

| English | Dutch |
|---------|-------|
| Property | Eigendom |
| Address | Adres |
| Owner | Eigenaar |
| Create | Maken |
| Delete | Verwijderen |
| Edit | Bewerken |
| Save | Opslaan |
| Cancel | Annuleren |
| Property Type | Type eigendom |
| Nickname | Bijnaam |
| Required | Vereist |
| Optional | Optioneel |

#### 5.4 Steps

1. **Translate form strings** (`properties.form.*`)
2. **Translate modal strings** (`properties.modals.*`)
   ```json
   "modals": {
     "delete": {
       "title": "Eigendom verwijderen",
       "confirmation": "Weet u zeker dat u het eigendom \"{name}\" wilt verwijderen?",
       "warning": "Deze actie kan niet ongedaan worden gemaakt."
     }
   }
   ```
3. **Translate page strings** (`properties.pages.*`)
4. **Translate selector strings** (`properties.selector.*`)
5. **Translate country names** (`countries.*`)

#### 5.5 Acceptance Criteria
- [ ] All `properties` namespace keys translated
- [ ] All `countries` namespace keys translated
- [ ] Formal "u" used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] Character encoding correct

---

### Task 6: Generate Italian Translations
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 6.1 Objective
Translate all property management strings to Italian, using formal address ("Lei") and professional property management terminology.

#### 6.2 Translation Guidelines

| Guideline | Implementation |
|-----------|----------------|
| **Formality** | Use formal "Lei" form (capitalized in formal writing) |
| **Property term** | "Proprietà" |
| **Action buttons** | Infinitive form ("Salva", "Elimina") |
| **Character encoding** | UTF-8 for à, è, é, ì, ò, ù |

#### 6.3 Key Term Glossary (Italian)

| English | Italian |
|---------|---------|
| Property | Proprietà |
| Address | Indirizzo |
| Owner | Proprietario |
| Create | Crea |
| Delete | Elimina |
| Edit | Modifica |
| Save | Salva |
| Cancel | Annulla |
| Property Type | Tipo di proprietà |
| Nickname | Soprannome |
| Required | Obbligatorio |
| Optional | Facoltativo |

#### 6.4 Steps

1. **Translate form strings** (`properties.form.*`)
2. **Translate modal strings** (`properties.modals.*`)
   ```json
   "modals": {
     "delete": {
       "title": "Elimina proprietà",
       "confirmation": "Sei sicuro di voler eliminare la proprietà \"{name}\"?",
       "warning": "Questa azione non può essere annullata."
     }
   }
   ```
3. **Translate page strings** (`properties.pages.*`)
4. **Translate selector strings** (`properties.selector.*`)
5. **Translate country names** (`countries.*`)

#### 6.5 Acceptance Criteria
- [ ] All `properties` namespace keys translated
- [ ] All `countries` namespace keys translated
- [ ] Formal address used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] Character encoding correct (UTF-8)

---

### Task 7: Update Translation Files
**Estimated Effort:** 20 minutes
**Story Points:** 0.5

#### 7.1 Objective
Add the translated `properties` and `countries` namespaces to each non-English language file.

#### 7.2 Files to Modify

| File | Action |
|------|--------|
| `/messages/fr.json` | Add `properties` and `countries` namespaces |
| `/messages/es.json` | Add `properties` and `countries` namespaces |
| `/messages/de.json` | Add `properties` and `countries` namespaces |
| `/messages/nl.json` | Add `properties` and `countries` namespaces |
| `/messages/it.json` | Add `properties` and `countries` namespaces |

#### 7.3 Steps

1. **For each language file:**
   - Read existing content
   - Add `properties` namespace at appropriate position
   - Add `countries` namespace at appropriate position
   - Ensure valid JSON structure
   - Save file with UTF-8 encoding

2. **Maintain namespace order consistency:**
   ```json
   {
     "common": { ... },
     "auth": { ... },
     "dashboard": { ... },
     "items": { ... },
     "properties": { ... },  // NEW
     "countries": { ... },   // NEW (if applicable)
     "errors": { ... },
     "language": { ... }
   }
   ```

#### 7.4 Acceptance Criteria
- [ ] French file updated with valid JSON
- [ ] Spanish file updated with valid JSON
- [ ] German file updated with valid JSON
- [ ] Dutch file updated with valid JSON
- [ ] Italian file updated with valid JSON
- [ ] All files have consistent namespace ordering
- [ ] All files saved with UTF-8 encoding

---

### Task 8: Verification and Quality Check
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 8.1 Objective
Verify translation completeness, accuracy, and technical correctness across all language files.

#### 8.2 Verification Steps

1. **Key Matching Verification**
   - Compare key count between English and each language
   - Identify any missing keys
   - Script:
   ```bash
   # Compare key counts
   for lang in fr es de nl it; do
     echo "$lang: $(jq '.properties | .. | strings | length' messages/$lang.json)"
   done
   ```

2. **Interpolation Variable Verification**
   - Check all `{variable}` placeholders preserved
   - Regex check: `\{[a-zA-Z_]+\}`

3. **Pluralization Syntax Verification**
   - Verify ICU MessageFormat syntax
   - Pattern: `{count, plural, one {#...} other {#...}}`

4. **JSON Syntax Validation**
   ```bash
   for lang in en fr es de nl it; do
     jq empty messages/$lang.json && echo "$lang: Valid" || echo "$lang: INVALID"
   done
   ```

5. **Character Encoding Verification**
   - Check file encoding is UTF-8
   - Verify accented characters render correctly

6. **Build Verification**
   ```bash
   npm run build
   # Check for translation-related errors
   ```

#### 8.3 Quality Checklist

| Check | Command/Method | Expected Result |
|-------|----------------|-----------------|
| JSON valid | `jq empty messages/*.json` | No errors |
| Key count match | Custom script | All languages match en.json |
| Variables preserved | Grep for `{` pattern | Same variables in all files |
| Build passes | `npm run build` | No errors |
| No console warnings | Run app, check console | No missing key warnings |

#### 8.4 Acceptance Criteria
- [ ] All keys match between English and translated files
- [ ] No missing translations in any language
- [ ] All interpolation variables preserved
- [ ] Pluralization syntax correct for all languages
- [ ] Character encoding verified as UTF-8
- [ ] JSON syntax valid in all files
- [ ] Build completes without errors
- [ ] No translation warnings in browser console

---

## 4. Files to Modify

### 4.1 Primary Files (Modifications)

| File | Modification Type | Description |
|------|-------------------|-------------|
| `/messages/fr.json` | Add namespaces | Add `properties`, `countries` |
| `/messages/es.json` | Add namespaces | Add `properties`, `countries` |
| `/messages/de.json` | Add namespaces | Add `properties`, `countries` |
| `/messages/nl.json` | Add namespaces | Add `properties`, `countries` |
| `/messages/it.json` | Add namespaces | Add `properties`, `countries` |

### 4.2 Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations |
| `/src/lib/i18n/config.ts` | Locale configuration reference |

### 4.3 Files NOT to Modify

- `/messages/en.json` - English source (already complete from 2F.1-2F.5)
- Any TypeScript/JavaScript source files
- Any component files
- Database migrations
- API routes

---

## 5. Country Name Reference

### 5.1 Standard Country Translations

| Code | English | French | Spanish | German | Dutch | Italian |
|------|---------|--------|---------|--------|-------|---------|
| US | United States | États-Unis | Estados Unidos | Vereinigte Staaten | Verenigde Staten | Stati Uniti |
| GB | United Kingdom | Royaume-Uni | Reino Unido | Vereinigtes Königreich | Verenigd Koninkrijk | Regno Unito |
| CA | Canada | Canada | Canadá | Kanada | Canada | Canada |
| AU | Australia | Australie | Australia | Australien | Australië | Australia |
| DE | Germany | Allemagne | Alemania | Deutschland | Duitsland | Germania |
| FR | France | France | Francia | Frankreich | Frankrijk | Francia |
| ES | Spain | Espagne | España | Spanien | Spanje | Spagna |
| IT | Italy | Italie | Italia | Italien | Italië | Italia |
| NL | Netherlands | Pays-Bas | Países Bajos | Niederlande | Nederland | Paesi Bassi |
| BE | Belgium | Belgique | Bélgica | Belgien | België | Belgio |
| CH | Switzerland | Suisse | Suiza | Schweiz | Zwitserland | Svizzera |
| AT | Austria | Autriche | Austria | Österreich | Oostenrijk | Austria |
| PT | Portugal | Portugal | Portugal | Portugal | Portugal | Portogallo |
| IE | Ireland | Irlande | Irlanda | Irland | Ierland | Irlanda |
| NZ | New Zealand | Nouvelle-Zélande | Nueva Zelanda | Neuseeland | Nieuw-Zeeland | Nuova Zelanda |
| MX | Mexico | Mexique | México | Mexiko | Mexico | Messico |
| BR | Brazil | Brésil | Brasil | Brasilien | Brazilië | Brasile |
| AR | Argentina | Argentine | Argentina | Argentinien | Argentinië | Argentina |
| JP | Japan | Japon | Japón | Japan | Japan | Giappone |
| CN | China | Chine | China | China | China | Cina |
| IN | India | Inde | India | Indien | India | India |
| ZA | South Africa | Afrique du Sud | Sudáfrica | Südafrika | Zuid-Afrika | Sudafrica |
| AE | United Arab Emirates | Émirats arabes unis | Emiratos Árabes Unidos | Vereinigte Arabische Emirate | Verenigde Arabische Emiraten | Emirati Arabi Uniti |
| SG | Singapore | Singapour | Singapur | Singapur | Singapore | Singapore |

---

## 6. Sample Translation Structure

### 6.1 Expected `properties` Namespace (English Reference)

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties",
    "form": {
      "titles": {
        "create": "Create New Property",
        "edit": "Edit Property"
      },
      "labels": {
        "owner": "Property Owner",
        "nickname": "Property Nickname",
        "type": "Property Type",
        "address": "Address",
        "street": "Street Address",
        "city": "City",
        "state": "State/Province",
        "postalCode": "Postal Code",
        "country": "Country"
      },
      "placeholders": {
        "owner": "Select property owner...",
        "nickname": "e.g., Main Office, Home, Vacation House",
        "type": "Select property type...",
        "street": "Enter street address",
        "city": "Enter city",
        "state": "Enter state or province",
        "postalCode": "Enter postal code"
      },
      "hints": {
        "nickname": "A friendly name to identify this property (max 100 characters)",
        "address": "Full address helps guests locate the property"
      },
      "validation": {
        "nicknameRequired": "Property nickname is required",
        "nicknameTooLong": "Property nickname must be 100 characters or less",
        "ownerRequired": "Property owner is required",
        "typeRequired": "Property type is required",
        "addressRequired": "Address is required"
      },
      "actions": {
        "create": "Create Property",
        "creating": "Creating...",
        "update": "Update Property",
        "updating": "Updating..."
      },
      "errors": {
        "saveFailed": "Failed to save property. Please try again."
      }
    },
    "modals": {
      "add": {
        "title": "Add New Property",
        "description": "Create a new property to organize your items",
        "success": "Property created successfully"
      },
      "edit": {
        "title": "Edit Property",
        "description": "Update property information",
        "success": "Property updated successfully"
      },
      "delete": {
        "title": "Delete Property",
        "confirmation": "Are you sure you want to delete the property \"{name}\"?",
        "warning": "This action cannot be undone. All items in this property will be moved to Unassigned.",
        "actions": {
          "delete": "Delete",
          "deleting": "Deleting...",
          "cancel": "Cancel"
        },
        "success": "Property deleted successfully",
        "error": "Failed to delete property"
      }
    },
    "pages": {
      "list": {
        "title": "Properties",
        "empty": {
          "title": "No properties yet",
          "description": "Add your first property to organize your items",
          "action": "Add Property"
        },
        "search": {
          "placeholder": "Search properties...",
          "noResults": "No properties match your search"
        }
      },
      "detail": {
        "title": "Property Details",
        "sections": {
          "info": "Property Information",
          "items": "Items in this Property",
          "analytics": "Analytics"
        }
      },
      "table": {
        "headers": {
          "property": "Property",
          "type": "Type",
          "address": "Address",
          "owner": "Owner",
          "items": "Items",
          "created": "Created",
          "actions": "Actions"
        }
      }
    },
    "selector": {
      "title": "Select Property",
      "subtitle": "Choose a property to filter items",
      "allProperties": "All Properties",
      "unassigned": "Unassigned",
      "loading": "Loading properties...",
      "empty": "No properties available",
      "searchPlaceholder": "Search properties..."
    },
    "types": {
      "apartment": "Apartment",
      "house": "House",
      "condo": "Condo",
      "townhouse": "Townhouse",
      "cabin": "Cabin",
      "villa": "Villa",
      "studio": "Studio",
      "loft": "Loft",
      "cottage": "Cottage",
      "other": "Other"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "archived": "Archived"
    }
  }
}
```

---

## 7. Testing Checklist

### 7.1 Per-Language Functional Tests

#### French (fr)
- [ ] PropertyForm displays labels in French
- [ ] PropertyForm displays placeholders in French
- [ ] Property modals display titles/content in French
- [ ] Delete confirmation shows interpolated property name correctly
- [ ] Property pages display all content in French
- [ ] PropertySelector options display in French
- [ ] Country dropdown shows French country names

#### Spanish (es)
- [ ] PropertyForm displays labels in Spanish
- [ ] PropertyForm displays placeholders in Spanish
- [ ] Property modals display titles/content in Spanish
- [ ] Delete confirmation shows interpolated property name correctly
- [ ] Property pages display all content in Spanish
- [ ] PropertySelector options display in Spanish
- [ ] Country dropdown shows Spanish country names
- [ ] Opening "¿" appears for questions

#### German (de)
- [ ] PropertyForm displays labels in German
- [ ] PropertyForm displays placeholders in German
- [ ] Property modals display titles/content in German
- [ ] Delete confirmation shows interpolated property name correctly
- [ ] Property pages display all content in German
- [ ] PropertySelector options display in German
- [ ] Country dropdown shows German country names
- [ ] Text does not overflow UI elements (longer German text)

#### Dutch (nl)
- [ ] PropertyForm displays labels in Dutch
- [ ] PropertyForm displays placeholders in Dutch
- [ ] Property modals display titles/content in Dutch
- [ ] Delete confirmation shows interpolated property name correctly
- [ ] Property pages display all content in Dutch
- [ ] PropertySelector options display in Dutch
- [ ] Country dropdown shows Dutch country names

#### Italian (it)
- [ ] PropertyForm displays labels in Italian
- [ ] PropertyForm displays placeholders in Italian
- [ ] Property modals display titles/content in Italian
- [ ] Delete confirmation shows interpolated property name correctly
- [ ] Property pages display all content in Italian
- [ ] PropertySelector options display in Italian
- [ ] Country dropdown shows Italian country names

### 7.2 Visual Regression Tests

- [ ] Button text fits without truncation (all languages)
- [ ] Form labels display fully (all languages)
- [ ] Modal layouts accommodate all translated text
- [ ] Table headers display fully (all languages)
- [ ] Dropdown menus accommodate longest translated options

### 7.3 Interpolation Tests

- [ ] Property name in delete confirmation: `"{name}"` displays correctly
- [ ] Character counts display correctly with translated text
- [ ] Search results summary interpolates correctly

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prerequisites incomplete (2F.1-2F.5 not done) | Medium | Critical | Verify en.json has properties namespace before starting |
| Translation quality issues | Medium | Medium | Use professional terminology glossary, review key strings |
| Missing interpolation variables | Low | High | Automated regex check for `{variable}` patterns |
| Incorrect pluralization syntax | Medium | Medium | Validate ICU format per language rules |
| JSON syntax errors | Low | High | Validate JSON with `jq` after each update |
| Character encoding issues | Low | Medium | Verify UTF-8 encoding, test special characters |
| German text overflow | Medium | Low | Test all German UI, adjust if needed |
| Build failures | Low | High | Run build after all translations complete |

---

## 9. Definition of Done

- [ ] Task 1: English source strings extracted and documented
- [ ] Task 2: French translations complete and verified
- [ ] Task 3: Spanish translations complete and verified
- [ ] Task 4: German translations complete and verified
- [ ] Task 5: Dutch translations complete and verified
- [ ] Task 6: Italian translations complete and verified
- [ ] Task 7: All translation files updated with new namespaces
- [ ] Task 8: All verification checks pass
- [ ] Build passes with no errors
- [ ] No translation warnings in browser console
- [ ] All acceptance criteria met

---

## 10. Effort Summary

| Task | Description | Story Points | Estimated Time |
|------|-------------|--------------|----------------|
| 1 | Extract English source strings | 0.5 | 15 min |
| 2 | Generate French translations | 1 | 30 min |
| 3 | Generate Spanish translations | 1 | 30 min |
| 4 | Generate German translations | 1.5 | 35 min |
| 5 | Generate Dutch translations | 1 | 30 min |
| 6 | Generate Italian translations | 1 | 30 min |
| 7 | Update translation files | 0.5 | 20 min |
| 8 | Verification and quality check | 1 | 30 min |
| **Total** | | **7.5 SP** | **~3.5 hours** |

---

## 11. References

- [Overview Document](/docs/REQ-E02-012-generate-translations-for-5-non-english-languages-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-012
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2F
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ISO 3166 Country Names](https://www.iso.org/iso-3166-country-codes.html)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management Translation Generation*
