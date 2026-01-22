# REQ-E02-012: Generate Translations for 5 Non-English Languages (Property Management)

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-012
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.6
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 20:26
**Last Modified:** 2026-01-22 20:26

---

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-012 (Task 2F.6) |
| Source File | docs/gen_requests.md (Request #12) |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 20:26 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 4-6 hours |
| Status | PENDING |

---

## Summary

This document provides the implementation breakdown for generating translations for the `properties` namespace in 5 non-English languages (French, Spanish, German, Dutch, Italian). This is the final task of Sub-Epic 2F (Property Management) and involves translating all property management strings from English to the target languages.

**Current State:**
- **en.json** (4,009 lines): Contains complete `properties` namespace with ~134 keys
- **fr.json, es.json, de.json, nl.json, it.json** (~3,903 lines each): Contain `properties` namespace with English placeholder text

**Translation Scope:**
The `properties` namespace (lines 3193-3347 in non-English files) contains ~134 translation keys across 9 sub-namespaces:
- `properties.title`, `properties.subtitle` (2 keys)
- `properties.list.*` (4 keys including empty states)
- `properties.types.*` (7 property types)
- `properties.selector.*` (8 selector/filter keys)
- `properties.actions.*` (10 action buttons)
- `properties.form.*` (35+ form fields, labels, placeholders)
- `properties.validation.*` (15+ validation messages)
- `properties.notifications.*` (6 success/error messages)
- `properties.delete.*` (4 delete confirmation keys)
- `properties.modal.*` (30+ modal-specific keys)
- `properties.errors.*` (5 error messages)

**Dependencies:** This task requires completion of Tasks 2F.1-2F.5 where all property management components have been updated to use the `properties` namespace.

---

## Goals

### Functional Requirements

1. Translate all ~134 keys in the `properties` namespace from English to 5 languages
2. Maintain ICU message format for pluralization and variable interpolation
3. Ensure cultural appropriateness for each target language
4. Preserve JSON structure and formatting
5. Validate all translation files after updates
6. Test translations in the application to verify correct display
7. Document translation guidelines and terminology for consistency

### Assumptions & Clarifications

- Tasks 2F.1-2F.5 have been completed (all components use `properties` namespace)
- The `properties` namespace structure is identical across all language files
- Translation will be done by native speakers or professional translation services
- ICU message format syntax must be preserved exactly
- Variable placeholders (e.g., `{name}`, `{count}`, `{max}`) must remain unchanged
- Property types (apartment, house, condo, etc.) should use local real estate terminology
- Validation messages should maintain professional, helpful tone
- **CLDR plural rules** differ by language - translations must follow correct plural forms

---

## Requirements Analysis

### Translation Scope Breakdown

#### 1. Page-Level Strings (2 keys)
- `title`: "My Properties"
- `subtitle`: "Manage your properties and their settings"

#### 2. List & Empty States (4 keys)
- `list.loginRequired`: "Please log in to view properties."
- `list.empty.title`: "No properties yet"
- `list.empty.description`: "Add your first property to organize your items"
- `list.empty.action`: "Add Property"

#### 3. Property Types (7 keys)
- `types.apartment`: "Apartment"
- `types.house`: "House"
- `types.condo`: "Condo"
- `types.townhouse`: "Townhouse"
- `types.cabin`: "Cabin"
- `types.villa`: "Villa"
- `types.other`: "Other"

**Translation Note:** Use local real estate terminology. For example:
- French: "Appartement", "Maison", "Copropriété", "Maison de ville", "Chalet", "Villa", "Autre"
- Spanish: "Apartamento", "Casa", "Condominio", "Casa adosada", "Cabaña", "Villa", "Otro"

#### 4. Selector/Filter Strings (8 keys)
- `selector.selectProperty`: "Select Property"
- `selector.allProperties`: "All Properties"
- `selector.unassigned`: "Unassigned"
- `selector.filterLabel`: "Property Filter"
- `selector.filterDescription`: "Filter analytics data by property"
- `selector.filterAriaLabel`: "Select property for analytics filtering"
- `selector.loading`: "Loading properties..."
- `selector.noPropertiesAvailable`: "No properties available"

#### 5. Action Buttons (10 keys)
- `actions.add`: "Add Property"
- `actions.edit`: "Edit Property"
- `actions.save`: "Save Changes"
- `actions.saving`: "Saving..."
- `actions.cancel`: "Cancel"
- `actions.delete`: "Delete Property"
- `actions.view`: "View Property"
- `actions.createProperty`: "Create Property"
- `actions.creating`: "Creating..."
- `actions.editProperty`: "Edit Property"

#### 6. Form Fields (35+ keys)
Including labels, placeholders, hints for:
- `form.propertyName`, `form.propertyNamePlaceholder`
- `form.propertyType`, `form.selectPropertyType`
- `form.propertyOwner`, `form.selectOwner`
- `form.address`, `form.addressPlaceholder`
- `form.addressLine1`, `form.addressLine1Placeholder`
- `form.addressLine2`, `form.addressLine2Placeholder`
- `form.city`, `form.cityPlaceholder`
- `form.stateProvince`, `form.stateProvincePlaceholder`
- `form.postalCode`, `form.postalCodePlaceholder`
- `form.country`, `form.selectCountry`
- `form.optional`, `form.required`, `form.cannotBeChanged`
- `form.nameHint`, `form.characterCount`, `form.ownerCannotChange`
- `form.titleEdit`, `form.titleCreate`

**ICU Format Example:** `form.characterCount`: "{count}/{max} characters"

#### 7. Validation Messages (15+ keys)
- `validation.nameRequired`: "Property name is required"
- `validation.nameTooLong`: "Property name must be 100 characters or less"
- `validation.typeRequired`: "Property type is required"
- `validation.addressTooLong`: "Address must be 500 characters or less"
- `validation.addressMaxLength`: "Address must be 200 characters or less"
- `validation.cityMaxLength`: "City must be 100 characters or less"
- `validation.stateMaxLength`: "State/Province must be 100 characters or less"
- `validation.postalCodeMaxLength`: "Postal code must be 20 characters or less"
- `validation.countryInvalid`: "Please select a valid country"
- And more...

#### 8. Notifications (6 keys)
- `notifications.propertyUpdated`: "Property updated successfully"
- `notifications.propertyCreated`: "Property created successfully"
- `notifications.propertyDeleted`: "Property deleted successfully"
- `notifications.updateFailed`: "Failed to update property"
- `notifications.createFailed`: "Failed to create property"
- `notifications.deleteFailed`: "Failed to delete property"

#### 9. Delete Confirmation (4 keys)
- `delete.title`: "Delete Property"
- `delete.message`: "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\"."
- `delete.confirm`: "Delete Property"
- `delete.cancel`: "Cancel"

**ICU Format Example:** `delete.message` uses `{name}` variable placeholder

#### 10. Modal Strings (30+ keys)
Including titles, descriptions, loading states:
- `modal.addTitle`, `modal.addDescription`, `modal.addProperty`, `modal.addPropertyDescription`
- `modal.editTitle`, `modal.editDescription`, `modal.editProperty`, `modal.editPropertyDescription`
- `modal.saving`, `modal.saveChanges`, `modal.savingProperty`
- `modal.creating`, `modal.creatingProperty`, `modal.closeModal`
- And nested `modal.form.*` and `modal.validation.*` keys

#### 11. Error Messages (5 keys)
- `errors.saveFailed`: "Failed to save property"
- `errors.createFailed`: "Failed to create property"
- `errors.updateFailed`: "Failed to update property"
- `errors.loadFailed`: "Failed to load properties"
- `errors.deleteFailed`: "Failed to delete property"

---

## Technical Approach

### Translation Workflow

1. **Preparation Phase:**
   - Extract all English keys from `messages/en.json` (lines 3219-3373)
   - Create translation glossary with terminology guidelines
   - Identify ICU format strings requiring special attention

2. **Translation Phase:**
   - Translate all keys for each language individually
   - Apply language-specific plural rules (CLDR)
   - Use native speaker review or professional translation service
   - Validate ICU message format syntax

3. **Integration Phase:**
   - Update each non-English JSON file with translations
   - Preserve JSON formatting and structure
   - Validate JSON syntax with linter
   - Run application tests to verify correct display

4. **Quality Assurance Phase:**
   - Visual testing in application for each language
   - Test ICU pluralization with different counts
   - Verify variable interpolation works correctly
   - Check for text overflow or truncation issues

### ICU Message Format Guidelines

**Pluralization Examples:**

English uses 2 forms (one/other):
```json
"itemCount": "{count, plural, one {# item} other {# items}}"
```

French uses 2 forms but different rules (0-1 vs 2+):
```json
"itemCount": "{count, plural, one {# élément} other {# éléments}}"
```

Polish uses 3 forms (one/few/other):
```json
"itemCount": "{count, plural, one {# przedmiot} few {# przedmioty} other {# przedmiotów}}"
```

**Variable Interpolation:**
- Always preserve variable names exactly: `{name}`, `{count}`, `{max}`
- Adjust surrounding text but keep variables untouched
- Example: `"{count}/{max} characters"` → `"{count}/{max} caractères"` (French)

### Language-Specific Considerations

#### French (fr.json)
- Use formal "vous" form for professional tone
- Plural rule: 0-1 singular, 2+ plural
- Property types: Appartement, Maison, Copropriété, Maison de ville, Chalet, Villa, Autre
- Accent marks: É, è, à, ê, ç

#### Spanish (es.json)
- Use formal "usted" form
- Plural rule: 1 singular, 0 or 2+ plural
- Property types: Apartamento, Casa, Condominio, Casa adosada, Cabaña, Villa, Otro
- Special characters: ñ, á, é, í, ó, ú, ü, ¡, ¿

#### German (de.json)
- Formal "Sie" form
- Plural rule: 1 singular, 0 or 2+ plural
- Property types: Wohnung, Haus, Eigentumswohnung, Reihenhaus, Hütte, Villa, Andere
- Capitalize all nouns
- Special characters: ä, ö, ü, ß

#### Dutch (nl.json)
- Formal "u" or informal "je" (recommend formal)
- Plural rule: 1 singular, 0 or 2+ plural
- Property types: Appartement, Huis, Condominium, Rijtjeshuis, Huisje, Villa, Andere
- Special characters: é, ë, ï, ö, ü

#### Italian (it.json)
- Formal "Lei" form
- Plural rule: 1 singular, 0 or 2+ plural
- Property types: Appartamento, Casa, Condominio, Casa a schiera, Cabina, Villa, Altro
- Special characters: à, è, é, ì, ò, ù

---

## Implementation Tasks

### Task 1: Create translation glossary and guidelines (Priority: High)

**Description:** Create a comprehensive glossary document with key terminology and translation guidelines for consistency across all languages.

**Deliverable:** `/docs/property-management-translation-glossary.md`

**Content:**
1. **Core Terminology:**
   - Property, Properties → [translations for each language]
   - Item, Items → [translations]
   - Owner → [translations]
   - Address → [translations]

2. **Property Types:**
   - Apartment, House, Condo, Townhouse, Cabin, Villa, Other
   - Local real estate terminology for each language

3. **Action Verbs:**
   - Add, Edit, Save, Delete, View, Create, Cancel
   - Consistent verb forms across all contexts

4. **Technical Terms:**
   - Filter, Select, Loading, Optional, Required
   - UI-specific terminology

5. **Tone Guidelines:**
   - Professional and helpful
   - Formal address forms (vous, usted, Sie, u, Lei)
   - Clear and concise messaging

6. **ICU Format Examples:**
   - Plural rules for each language
   - Variable interpolation patterns
   - Common patterns used in properties namespace

**Acceptance Criteria:**
- [ ] Glossary document created
- [ ] All key terms defined for each language
- [ ] ICU format examples provided
- [ ] CLDR plural rules documented

---

### Task 2: Translate French (fr.json) properties namespace (Priority: High)

**Description:** Translate all ~134 keys in the `properties` namespace from English to French.

**File:** `/messages/fr.json` (lines 3193-3347)

**Key Translations:**

**Property Types:**
- apartment → Appartement
- house → Maison
- condo → Copropriété
- townhouse → Maison de ville
- cabin → Chalet
- villa → Villa
- other → Autre

**Sample Translations:**
- "My Properties" → "Mes Propriétés"
- "Manage your properties and their settings" → "Gérez vos propriétés et leurs paramètres"
- "Property name is required" → "Le nom de la propriété est requis"
- "Loading properties..." → "Chargement des propriétés..."
- "{count}/{max} characters" → "{count}/{max} caractères"

**Special Attention:**
- Maintain formal "vous" form
- Use correct accent marks (é, è, à, ê, ç)
- Preserve ICU message format syntax
- Validate JSON after changes

**Acceptance Criteria:**
- [ ] All ~134 keys translated to French
- [ ] ICU format preserved
- [ ] JSON validates
- [ ] French native speaker review completed

---

### Task 3: Translate Spanish (es.json) properties namespace (Priority: High)

**Description:** Translate all ~134 keys in the `properties` namespace from English to Spanish.

**File:** `/messages/es.json` (lines 3193-3347)

**Key Translations:**

**Property Types:**
- apartment → Apartamento
- house → Casa
- condo → Condominio
- townhouse → Casa adosada
- cabin → Cabaña
- villa → Villa
- other → Otro

**Sample Translations:**
- "My Properties" → "Mis Propiedades"
- "Manage your properties and their settings" → "Gestione sus propiedades y su configuración"
- "Property name is required" → "El nombre de la propiedad es obligatorio"
- "Loading properties..." → "Cargando propiedades..."
- "{count}/{max} characters" → "{count}/{max} caracteres"

**Special Attention:**
- Use formal "usted" form
- Include special characters (ñ, á, é, í, ó, ú, ü)
- Add opening question/exclamation marks (¡, ¿) where appropriate
- Preserve ICU message format syntax

**Acceptance Criteria:**
- [ ] All ~134 keys translated to Spanish
- [ ] ICU format preserved
- [ ] JSON validates
- [ ] Spanish native speaker review completed

---

### Task 4: Translate German (de.json) properties namespace (Priority: High)

**Description:** Translate all ~134 keys in the `properties` namespace from English to German.

**File:** `/messages/de.json` (lines 3193-3347)

**Key Translations:**

**Property Types:**
- apartment → Wohnung
- house → Haus
- condo → Eigentumswohnung
- townhouse → Reihenhaus
- cabin → Hütte
- villa → Villa
- other → Andere

**Sample Translations:**
- "My Properties" → "Meine Immobilien"
- "Manage your properties and their settings" → "Verwalten Sie Ihre Immobilien und deren Einstellungen"
- "Property name is required" → "Der Immobilienname ist erforderlich"
- "Loading properties..." → "Lade Immobilien..."
- "{count}/{max} characters" → "{count}/{max} Zeichen"

**Special Attention:**
- Use formal "Sie" form (capitalize Sie, Ihre, Ihnen)
- Capitalize all nouns (German grammar rule)
- Include special characters (ä, ö, ü, ß)
- Preserve ICU message format syntax

**Acceptance Criteria:**
- [ ] All ~134 keys translated to German
- [ ] All nouns capitalized correctly
- [ ] ICU format preserved
- [ ] JSON validates
- [ ] German native speaker review completed

---

### Task 5: Translate Dutch (nl.json) properties namespace (Priority: High)

**Description:** Translate all ~134 keys in the `properties` namespace from English to Dutch.

**File:** `/messages/nl.json` (lines 3193-3347)

**Key Translations:**

**Property Types:**
- apartment → Appartement
- house → Huis
- condo → Condominium
- townhouse → Rijtjeshuis
- cabin → Huisje
- villa → Villa
- other → Andere

**Sample Translations:**
- "My Properties" → "Mijn Eigendommen"
- "Manage your properties and their settings" → "Beheer uw eigendommen en hun instellingen"
- "Property name is required" → "Naam van eigendom is verplicht"
- "Loading properties..." → "Eigendommen laden..."
- "{count}/{max} characters" → "{count}/{max} tekens"

**Special Attention:**
- Use formal "u" form (or informal "je" if appropriate for brand)
- Include special characters (é, ë, ï, ö, ü)
- Preserve ICU message format syntax
- Consider compound words (Dutch often combines words)

**Acceptance Criteria:**
- [ ] All ~134 keys translated to Dutch
- [ ] ICU format preserved
- [ ] JSON validates
- [ ] Dutch native speaker review completed

---

### Task 6: Translate Italian (it.json) properties namespace (Priority: High)

**Description:** Translate all ~134 keys in the `properties` namespace from English to Italian.

**File:** `/messages/it.json` (lines 3193-3347)

**Key Translations:**

**Property Types:**
- apartment → Appartamento
- house → Casa
- condo → Condominio
- townhouse → Casa a schiera
- cabin → Cabina
- villa → Villa
- other → Altro

**Sample Translations:**
- "My Properties" → "Le Mie Proprietà"
- "Manage your properties and their settings" → "Gestisci le tue proprietà e le loro impostazioni"
- "Property name is required" → "Il nome della proprietà è obbligatorio"
- "Loading properties..." → "Caricamento proprietà..."
- "{count}/{max} characters" → "{count}/{max} caratteri"

**Special Attention:**
- Use formal "Lei" form
- Include special characters (à, è, é, ì, ò, ù)
- Preserve ICU message format syntax
- Consider grammatical gender (la proprietà, il nome)

**Acceptance Criteria:**
- [ ] All ~134 keys translated to Italian
- [ ] ICU format preserved
- [ ] JSON validates
- [ ] Italian native speaker review completed

---

### Task 7: Validate all translation files (Priority: High)

**Description:** Run validation checks on all 6 translation files to ensure correctness.

**Validation Steps:**

1. **JSON Syntax Validation:**
   ```bash
   npm run validate:translations
   # Or manually:
   node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/es.json', 'utf8'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/de.json', 'utf8'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/nl.json', 'utf8'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/it.json', 'utf8'))"
   ```

2. **Key Consistency Check:**
   - Verify all language files have identical key structure
   - Check that no keys are missing in any language
   - Verify all ICU format variables preserved

3. **ICU Format Validation:**
   - Check plural forms match CLDR rules for each language
   - Verify variable placeholders unchanged
   - Test pluralization with different counts

4. **Character Encoding:**
   - Verify UTF-8 encoding for all files
   - Check special characters render correctly

**Acceptance Criteria:**
- [ ] All JSON files pass syntax validation
- [ ] All files have identical key structure
- [ ] ICU format strings validated
- [ ] UTF-8 encoding verified
- [ ] No linting errors

---

### Task 8: Test translations in application (Priority: High)

**Description:** Test all translated strings in the application across all 5 languages.

**Testing Steps:**

**For Each Language (fr, es, de, nl, it):**

1. **Switch Language:**
   - Set application locale to target language
   - Verify language switcher works

2. **Property Management Pages:**
   - Navigate to `/dashboard2/properties`
   - Verify page title and subtitle display in target language
   - Check empty state message if no properties exist

3. **Add Property Modal:**
   - Click "Add Property" button
   - Verify modal title and description translated
   - Check all form labels and placeholders translated
   - Test validation messages by submitting empty form
   - Verify property type dropdown shows translated types
   - Check character counters display correctly

4. **Edit Property Modal:**
   - Edit existing property
   - Verify modal title and button labels translated
   - Check all form fields translated
   - Test validation messages
   - Verify success notification displays in target language

5. **Property Selector:**
   - Check filter label and description (if using default variant)
   - Verify "All Properties" option translated
   - Check loading state message
   - Test empty state message if no properties

6. **Delete Property:**
   - Trigger delete confirmation
   - Verify delete dialog title and message translated
   - Check variable interpolation (property name in message)

7. **Character Count Testing:**
   - Type in property name field
   - Verify character counter updates: "{count}/{max} caractères" (French example)
   - Test with various lengths to ensure no truncation

8. **Pluralization Testing:**
   - Test with 0, 1, 2+ properties
   - Verify plural forms display correctly per language rules

**Acceptance Criteria:**
- [ ] All property management strings display in correct language
- [ ] No English fallback text visible
- [ ] ICU pluralization works correctly
- [ ] Variable interpolation works correctly
- [ ] No text overflow or truncation issues
- [ ] All 5 languages tested thoroughly

---

### Task 9: Document translation completion and coverage (Priority: Medium)

**Description:** Create documentation summarizing translation completion status and coverage.

**Deliverable:** `/docs/property-management-translation-completion.md`

**Content:**
1. **Translation Summary:**
   - Total keys translated: ~134
   - Languages completed: French, Spanish, German, Dutch, Italian
   - Translation method: [Professional service / Native speakers / Tool-assisted]

2. **Coverage Report:**
   - List of all translated namespaces
   - Percentage completion per language
   - Any untranslated or partially translated keys

3. **Quality Assurance:**
   - Native speaker review status
   - Testing completion status
   - Known issues or areas for improvement

4. **Maintenance Guidelines:**
   - How to add new property management strings
   - Translation request process
   - Quality standards for future translations

**Acceptance Criteria:**
- [ ] Completion document created
- [ ] Coverage report complete
- [ ] QA status documented
- [ ] Maintenance guidelines provided

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Translation Files

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/messages/fr.json` | Lines 3193-3347 (`properties` namespace) | Modify | Translate ~134 keys to French |
| `/messages/es.json` | Lines 3193-3347 (`properties` namespace) | Modify | Translate ~134 keys to Spanish |
| `/messages/de.json` | Lines 3193-3347 (`properties` namespace) | Modify | Translate ~134 keys to German |
| `/messages/nl.json` | Lines 3193-3347 (`properties` namespace) | Modify | Translate ~134 keys to Dutch |
| `/messages/it.json` | Lines 3193-3347 (`properties` namespace) | Modify | Translate ~134 keys to Italian |

### Documentation Files

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/docs/property-management-translation-glossary.md` | — | Create | Translation guidelines and terminology |
| `/docs/property-management-translation-completion.md` | — | Create | Translation completion report |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Reference for English source | Lines 3219-3373 contain source translations |
| All property management components | Verify translation usage | PropertyForm, Modals, Pages, Selector |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **REQ-E02-085** (Task 2F.1) | Namespace Structure | Required | `properties` namespace defined in all files |
| **REQ-E02-008** (Task 2F.2) | Component i18n | Required | PropertyForm uses `properties` namespace |
| **REQ-E02-009** (Task 2F.3) | Component i18n | Required | Property modals use `properties` namespace |
| **REQ-E02-010** (Task 2F.4) | Component i18n | Required | Property pages use `properties` namespace |
| **REQ-E02-011** (Task 2F.5) | Component i18n | Required | PropertySelector uses `properties` namespace |

**Critical:** All components MUST be updated to use the `properties` namespace before translations are generated. Otherwise, translations will not be used and effort will be wasted.

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **Sub-Epic 2F Completion** | All property management strings available in 6 languages |
| **Epic 2 Overall Completion** | Property management portion of full app localization complete |

### Parallel Safety

- **Files touched**: 5 translation files (fr.json, es.json, de.json, nl.json, it.json)
- **Conflicts with**: None - Each language file is independent
- **Safe to parallelize with**:
  - Other sub-epic translation tasks (can translate multiple sub-epics simultaneously)
  - Each language can be translated independently (Task 2, 3, 4, 5, 6 can run in parallel)

### External Dependencies

- **Translation Service** (optional): Professional translation service or tool
- **Native Speakers**: For review and quality assurance
- **ICU MessageFormat**: Library for testing pluralization (already included in next-intl)

---

## Risks and Considerations

### Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect ICU format breaks pluralization | High | Validate ICU syntax before committing |
| Missing variables causes display errors | High | Automated check for variable consistency |
| Cultural inappropriateness | Medium | Native speaker review required |
| Text overflow in UI | Medium | Visual testing in all languages |
| Inconsistent terminology | Low | Use translation glossary |
| JSON syntax errors | High | Validate all files before deployment |

### Testing Requirements

- **Linguistic Testing:**
  - Native speaker review for cultural appropriateness
  - Grammar and spelling checks
  - Terminology consistency across all strings

- **Functional Testing:**
  - All property management workflows in each language
  - ICU pluralization with different counts (0, 1, 2, 5, 10, 100)
  - Variable interpolation in messages
  - Character counters with various lengths

- **Visual Testing:**
  - Check for text overflow in labels and buttons
  - Verify proper text wrapping in descriptions
  - Test on different screen sizes (mobile, tablet, desktop)
  - Check that longer translations don't break layouts

- **Automated Testing:**
  - JSON syntax validation
  - Key structure consistency check
  - ICU format validation
  - UTF-8 encoding verification

### Open Questions

- [ ] Should we use professional translation service or community translators?
  - **Recommendation:** Professional service for consistency and quality
  - **Alternative:** Native speaker team members + professional review

- [ ] How do we handle property type translations if database contains English values?
  - **Answer:** Already solved in Task 2F.2 - components use `properties.types.*` keys with `.toLowerCase()` lookup

- [ ] Should we include context comments for translators in JSON?
  - **Recommendation:** Yes, but in separate documentation file (glossary)
  - **Reason:** JSON comments not standard, use external reference

- [ ] Do we need to translate country names in modals?
  - **Current State:** Country names hardcoded in English (lines 20-46 in modals)
  - **Recommendation:** Out of scope for this task - consider i18n-iso-countries package in future

- [ ] How do we handle future updates to property management strings?
  - **Answer:** Document maintenance guidelines in completion report (Task 9)

---

## Out of Scope

- Translating other namespaces beyond `properties` (handled by other sub-epic tasks)
- Translating country names in property modals (requires i18n-iso-countries package)
- Creating translation management system or workflow tool
- Setting up continuous translation integration (future enhancement)
- Translating database content (property names, addresses are user-generated)
- Translating property type values in database (kept in English, translated via keys)
- Adding new languages beyond the 5 specified (fr, es, de, nl, it)
- Translating images, icons, or other non-text assets
- Right-to-left (RTL) language support (Arabic, Hebrew, etc.)
- Dialect variations (European Spanish vs Latin American Spanish, etc.)

---

## Verification Checklist

### Pre-Implementation
- [ ] Tasks 2F.1-2F.5 completed - all components use `properties` namespace
- [ ] Reviewed en.json properties namespace (lines 3219-3373)
- [ ] Identified all ~134 keys requiring translation
- [ ] Translation glossary prepared

### Translation Phase (Per Language)
- [ ] French translations completed and reviewed
- [ ] Spanish translations completed and reviewed
- [ ] German translations completed and reviewed
- [ ] Dutch translations completed and reviewed
- [ ] Italian translations completed and reviewed
- [ ] All ICU format syntax preserved
- [ ] All variable placeholders unchanged
- [ ] Native speaker review completed for each language

### Validation Phase
- [ ] JSON syntax valid for all files
- [ ] Key structure identical across all languages
- [ ] ICU format validation passed
- [ ] UTF-8 encoding verified
- [ ] No linting errors

### Testing Phase
- [ ] Property pages tested in all 5 languages
- [ ] Add property modal tested in all 5 languages
- [ ] Edit property modal tested in all 5 languages
- [ ] Property selector tested in all 5 languages
- [ ] Delete confirmation tested in all 5 languages
- [ ] ICU pluralization tested (0, 1, 2+ counts)
- [ ] Variable interpolation tested (property names, counts, max values)
- [ ] Character counters display correctly in all languages
- [ ] No text overflow or truncation issues
- [ ] No English fallback text visible

### Documentation
- [ ] Translation glossary completed
- [ ] Translation completion report created
- [ ] Coverage report shows 100% for property management
- [ ] Maintenance guidelines documented
- [ ] Known issues documented (if any)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **Component Updates:**
  - `/docs/REQ-E02-008-update-propertyform-overview.md` (Task 2F.2)
  - `/docs/REQ-E02-009-update-property-modals-overview.md` (Task 2F.3)
  - `/docs/REQ-E02-010-update-property-pages-overview.md` (Task 2F.4)
  - `/docs/REQ-E02-011-update-propertyselector-overview.md` (Task 2F.5)
- **Translation Files:** `/messages/*.json`
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **ICU MessageFormat:** https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **CLDR Plural Rules:** https://cldr.unicode.org/index/cldr-spec/plural-rules

---

*Document generated: 2026-01-22 20:26*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
