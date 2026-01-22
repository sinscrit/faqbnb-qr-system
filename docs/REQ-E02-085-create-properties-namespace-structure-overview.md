# REQ-E02-085: Create `properties` Namespace Structure

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-085
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.1
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 18:51
**Last Modified:** 2026-01-22 18:51

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-085 (Task 2F.1) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 18:51 |
| T-shirt Size | S (Small) |
| Estimated Effort | 1-2 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for creating the `properties` namespace structure in translation files. The `properties` namespace already exists in `messages/en.json` (line 3219) with a basic structure for modals. This task involves auditing the existing structure, identifying gaps, and adding missing translation keys for the complete property management feature set.

The implementation plan specifies ~200 strings for property management across 5 components: PropertyForm, PropertyEditModal, AddPropertyModal, Properties pages, and PropertySelector.

**Key Finding:** The `properties` namespace exists with 55+ keys in the `modal` sub-namespace, but several areas need expansion:
- Property list/table display strings
- Property type labels (apartment, house, condo, etc.)
- Property selector component strings
- Property page headers and descriptions
- Empty states and actions

---

## 3. Goals

### 3.1 Functional Requirements

1. Audit existing `properties` namespace structure in en.json
2. Identify missing translation keys for all 5 property management components
3. Expand the `properties` namespace with comprehensive key structure
4. Add property type labels (apartment, house, condo, townhouse, cabin, villa, other)
5. Add property list/table display strings
6. Add property selector strings (selectProperty, allProperties, unassigned)
7. Add property page-specific strings (title, subtitle, empty states)
8. Ensure consistency with existing namespace patterns from other epics

### 3.2 Assumptions & Clarifications

- The `properties.modal` sub-namespace already exists with 55+ keys
- PropertyEditModal and AddPropertyModal already use `dashboard` namespace (lines 188, 169)
- PropertySelector uses `common.emptyStates` namespace (line 47)
- Properties page uses `common.notifications` namespace (line 26)
- PropertyForm uses `common.form`, `errors.form`, `common.actions`, `common.notifications` (lines 14-17)
- Need to consolidate these scattered namespace references into a unified `properties` namespace
- Country names in property modals are currently hardcoded (English only)

---

## 4. Requirements Analysis

### 4.1 Current Namespace Structure

**Existing in en.json (line 3219):**

```json
"properties": {
  "modal": {
    "addTitle": "Add New Property",
    "addDescription": "...",
    "editTitle": "Edit Property",
    "editDescription": "...",
    "saving": "Saving...",
    "saveChanges": "Save Changes",
    "creating": "Creating...",
    "closeModal": "Close modal",
    "form": {
      "name": { "label", "placeholder", "required" },
      "address1": { "label", "placeholder" },
      "address2": { "label", "placeholder" },
      "city": { "label", "placeholder" },
      "state": { "label", "placeholder" },
      "postalCode": { "label", "placeholder" },
      "country": { "label", "placeholder" }
    },
    "validation": {
      "nameRequired", "nameMaxLength", "addressMaxLength",
      "cityMaxLength", "stateMaxLength", "postalCodeMaxLength",
      "countryInvalid"
    },
    "toast": {
      "saving", "saveFailed", "createFailed"
    }
  }
}
```

### 4.2 Missing Translation Keys by Component

#### PropertyForm (40 strings, currently uses `common.form`, `errors.form`, `common.actions`, `common.notifications`)
- **Already covered by existing modal structure:** 30+ keys
- **Additional needs:**
  - Property owner label (for admin)
  - Hints and help text
  - Character count displays
  - Loading skeleton state

#### PropertyEditModal & AddPropertyModal (30 strings each, currently use `dashboard` namespace)
- **Already covered by existing modal structure:** Most keys exist
- **Additional needs:**
  - Modal-specific ARIA labels
  - Loading indicators
  - Success/error messages
  - Country dropdown placeholder

#### Properties Page (50 strings, currently uses `common.notifications`, hardcoded strings)
**Hardcoded strings found:**
- Line 93: "My Properties"
- Line 94-96: "Manage your properties and their settings"
- Line 84: "Please log in to view properties."

**Missing keys:**
- Page title and subtitle
- Empty state (no properties)
- Success messages (propertyUpdated, propertyCreated)
- Loading states

#### PropertySelector (20 strings, currently uses `common.emptyStates`)
**Hardcoded strings found:**
- Line 45: "All Properties" (placeholder)
- Line 165: "Property Filter"
- Line 168: "Filter analytics data by property"
- Line 194: "Select property for analytics filtering"
- Line 199: "Loading properties..."
- Line 297: Uses `tEmpty('properties.noPropertiesAvailable')`

**Missing keys:**
- Selector labels and placeholders
- Filter descriptions
- Loading states
- Keyboard navigation instructions

### 4.3 Property Types Structure

From implementation plan (lines 1050-1058), property types need translation:

```json
"types": {
  "apartment": "Apartment",
  "house": "House",
  "condo": "Condo",
  "townhouse": "Townhouse",
  "cabin": "Cabin",
  "villa": "Villa",
  "other": "Other"
}
```

**Note:** Currently, property types are stored in the database (`property_types` table) with a `display_name` column. Translation approach options:
1. Keep database values in English, translate via i18n keys
2. Store translation keys in database, resolve at display time

**Recommendation:** Option 1 - Keep database values in English, use `properties.types.*` keys for translations

---

## 5. Technical Approach

### 5.1 Expanded Namespace Structure

The complete `properties` namespace structure should include:

```json
{
  "properties": {
    // Page-level strings
    "title": "My Properties",
    "subtitle": "Manage your properties and their settings",

    // List/Table display
    "list": {
      "empty": {
        "title": "No properties yet",
        "description": "Add your first property to organize your items",
        "action": "Add Property"
      },
      "loginRequired": "Please log in to view properties."
    },

    // Property types
    "types": {
      "apartment": "Apartment",
      "house": "House",
      "condo": "Condo",
      "townhouse": "Townhouse",
      "cabin": "Cabin",
      "villa": "Villa",
      "other": "Other"
    },

    // Form fields (to replace common.form references)
    "form": {
      "propertyName": "Property Name",
      "propertyNamePlaceholder": "e.g., Beach House, Downtown Apartment",
      "propertyType": "Property Type",
      "propertyOwner": "Property Owner",
      "address": "Address",
      "addressPlaceholder": "Enter property address",
      "addressLine1": "Address Line 1",
      "addressLine1Placeholder": "Street address",
      "addressLine2": "Address Line 2",
      "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
      "city": "City",
      "cityPlaceholder": "City",
      "stateProvince": "State/Province",
      "stateProvincePlaceholder": "State or Province",
      "postalCode": "Postal Code",
      "postalCodePlaceholder": "ZIP / Postal code",
      "country": "Country",
      "selectCountry": "Select country...",
      "optional": "(optional)",
      "required": "Required",
      "cannotBeChanged": "This field cannot be changed"
    },

    // Actions
    "actions": {
      "add": "Add Property",
      "edit": "Edit Property",
      "save": "Save Changes",
      "saving": "Saving...",
      "cancel": "Cancel",
      "delete": "Delete Property",
      "view": "View Property",
      "createProperty": "Create Property",
      "creating": "Creating...",
      "editProperty": "Edit Property"
    },

    // Modal (existing structure - already in en.json)
    "modal": {
      "addTitle": "Add New Property",
      "addDescription": "Create a new property by entering the name and address information.",
      "addProperty": "Add Property",
      "addPropertyDescription": "...",
      "editTitle": "Edit Property",
      "editDescription": "Edit the details of your property...",
      "editProperty": "Edit Property",
      "editPropertyDescription": "...",
      "saving": "Saving...",
      "savingProperty": "Saving property changes...",
      "saveChanges": "Save Changes",
      "creating": "Creating...",
      "creatingProperty": "Creating property...",
      "closeModal": "Close modal"
    },

    // Validation (existing - already in en.json)
    "validation": {
      "propertyNameRequired": "Property name is required",
      "propertyNameMaxLength": "Property name must be 100 characters or less",
      "propertyTypeRequired": "Property type is required",
      "addressMaxLength": "Address must be 200 characters or less",
      "addressTooLong": "Address is too long",
      "cityMaxLength": "City must be 100 characters or less",
      "stateMaxLength": "State/Province must be 100 characters or less",
      "postalCodeMaxLength": "Postal code must be 20 characters or less",
      "countryInvalid": "Please select a valid country",
      "invalidCountry": "Invalid country selection"
    },

    // Delete confirmation
    "delete": {
      "title": "Delete Property",
      "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
      "confirm": "Delete Property",
      "cancel": "Cancel"
    },

    // Property selector
    "selector": {
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "unassigned": "Unassigned",
      "filterLabel": "Property Filter",
      "filterDescription": "Filter analytics data by property",
      "filterAriaLabel": "Select property for analytics filtering",
      "loading": "Loading properties...",
      "noPropertiesAvailable": "No properties available"
    },

    // Notifications/Success messages
    "notifications": {
      "propertyUpdated": "Property updated successfully",
      "propertyCreated": "Property created successfully",
      "propertyDeleted": "Property deleted successfully",
      "updateFailed": "Failed to update property",
      "createFailed": "Failed to create property",
      "deleteFailed": "Failed to delete property"
    },

    // Errors (existing toast - already in en.json)
    "errors": {
      "saveFailed": "Failed to save property",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "loadFailed": "Failed to load properties",
      "deleteFailed": "Failed to delete property"
    }
  }
}
```

### 5.2 Migration Strategy

Since the `properties` namespace already exists with the `modal` sub-namespace, this task will:

1. **Audit existing structure** (modal.form, modal.validation, modal.toast)
2. **Add missing top-level keys** (title, subtitle, list, types, form, actions, selector, notifications)
3. **Consolidate modal keys** - Keep existing `modal.*` keys, add missing modal-specific keys
4. **Add property type keys** - Create `types` sub-namespace
5. **Add selector keys** - Create `selector` sub-namespace for PropertySelector component
6. **Add notification keys** - Create `notifications` sub-namespace for success/error messages

---

## 6. Implementation Tasks

### Task 1: Audit existing `properties` namespace in en.json (Priority: High)

**Description:** Review the current `properties` namespace structure in `/messages/en.json` to document all existing keys and identify what's missing.

**File:** `/messages/en.json`

**Investigation Steps:**
1. Read lines 3219-3275 to document existing structure
2. Compare against component needs (PropertyForm, PropertyEditModal, AddPropertyModal, page, selector)
3. Identify keys that can be reused vs. new keys needed
4. Document mapping between current component namespace references and proposed `properties` keys

**Acceptance Criteria:**
- [ ] Complete inventory of existing `properties.modal.*` keys (55+ keys)
- [ ] List of missing keys by component
- [ ] Migration plan for components currently using other namespaces

---

### Task 2: Add property type translations to en.json (Priority: High)

**Description:** Add the `properties.types` sub-namespace with translations for all property types.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `types` object under `properties` namespace
2. Include 7 property type translations: apartment, house, condo, townhouse, cabin, villa, other

**Example:**
```json
"properties": {
  "types": {
    "apartment": "Apartment",
    "house": "House",
    "condo": "Condo",
    "townhouse": "Townhouse",
    "cabin": "Cabin",
    "villa": "Villa",
    "other": "Other"
  },
  "modal": { ... }
}
```

**Acceptance Criteria:**
- [ ] `properties.types.*` keys added to en.json
- [ ] All 7 property types translated
- [ ] JSON validates

---

### Task 3: Add property list/page translations to en.json (Priority: High)

**Description:** Add page-level translations including title, subtitle, empty states, and login prompt.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `title`, `subtitle` keys at top level
2. Add `list` sub-namespace with empty state and login prompt
3. Replace hardcoded strings in PropertiesPage component

**Keys to add:**
- `properties.title`: "My Properties"
- `properties.subtitle`: "Manage your properties and their settings"
- `properties.list.empty.title`: "No properties yet"
- `properties.list.empty.description`: "Add your first property to organize your items"
- `properties.list.empty.action`: "Add Property"
- `properties.list.loginRequired`: "Please log in to view properties."

**Acceptance Criteria:**
- [ ] Page-level keys added to en.json
- [ ] Empty state structure complete
- [ ] JSON validates

---

### Task 4: Add property selector translations to en.json (Priority: High)

**Description:** Add the `properties.selector` sub-namespace for PropertySelector component strings.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `selector` sub-namespace under `properties`
2. Include all selector-related labels, descriptions, and ARIA labels
3. Add loading and empty state strings

**Keys to add:**
- `properties.selector.selectProperty`: "Select Property"
- `properties.selector.allProperties`: "All Properties"
- `properties.selector.unassigned`: "Unassigned"
- `properties.selector.filterLabel`: "Property Filter"
- `properties.selector.filterDescription`: "Filter analytics data by property"
- `properties.selector.filterAriaLabel`: "Select property for analytics filtering"
- `properties.selector.loading`: "Loading properties..."
- `properties.selector.noPropertiesAvailable`: "No properties available"

**Acceptance Criteria:**
- [ ] `properties.selector.*` keys added to en.json
- [ ] All 8 selector keys defined
- [ ] ARIA labels included
- [ ] JSON validates

---

### Task 5: Add property form translations to en.json (Priority: High)

**Description:** Add the `properties.form` sub-namespace to consolidate form field labels and placeholders.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `form` sub-namespace at top level (separate from `modal.form`)
2. Include all form field labels and placeholders
3. Add helper text and hint strings

**Note:** The existing `properties.modal.form` structure has similar keys. This task creates a more comprehensive `properties.form` namespace that can be used across all property forms, not just modals.

**Acceptance Criteria:**
- [ ] `properties.form.*` keys added to en.json
- [ ] All form fields covered (name, type, address, city, state, postal, country, owner)
- [ ] Placeholders and hints included
- [ ] JSON validates

---

### Task 6: Add property actions and notifications to en.json (Priority: High)

**Description:** Add `properties.actions` and `properties.notifications` sub-namespaces for button labels and success/error messages.

**File:** `/messages/en.json`

**Changes Required:**
1. Add `actions` sub-namespace with button labels
2. Add `notifications` sub-namespace with success/error messages
3. Consolidate delete confirmation strings in `delete` sub-namespace

**Keys to add:**

**Actions:**
- add, edit, save, saving, cancel, delete, view, createProperty, creating, editProperty

**Notifications:**
- propertyUpdated, propertyCreated, propertyDeleted, updateFailed, createFailed, deleteFailed

**Delete confirmation:**
- title, message, confirm, cancel

**Acceptance Criteria:**
- [ ] `properties.actions.*` keys added (10 keys)
- [ ] `properties.notifications.*` keys added (6 keys)
- [ ] `properties.delete.*` keys added (4 keys)
- [ ] JSON validates

---

### Task 7: Enhance existing modal keys in en.json (Priority: Medium)

**Description:** Review and enhance the existing `properties.modal` sub-namespace to ensure all modal-specific strings are covered.

**File:** `/messages/en.json`

**Changes Required:**
1. Add missing modal ARIA labels (addPropertyDescription, editPropertyDescription)
2. Add modal-specific loading states (savingProperty, creatingProperty)
3. Ensure consistency with AddPropertyModal and PropertyEditModal usage

**Investigation:** Check PropertyEditModal.tsx lines 406-409 and AddPropertyModal.tsx lines 406-409 for modal title/description usage.

**Acceptance Criteria:**
- [ ] All modal-specific keys present
- [ ] ARIA descriptions added
- [ ] Loading state labels complete
- [ ] JSON validates

---

### Task 8: Add placeholder keys to other language files (Priority: Medium)

**Description:** Copy the complete `properties` namespace structure to all 5 non-English translation files as placeholders.

**Files to Update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Changes Required:**
1. Copy the entire `properties` namespace structure from en.json
2. Use English strings as placeholders (will be translated in Task 2F.6)
3. Maintain exact key structure across all files

**Acceptance Criteria:**
- [ ] `properties` namespace added to all 6 language files
- [ ] Key structure identical across all files
- [ ] All files pass JSON validation

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Translation Files

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/en.json` | `properties` namespace (line 3219+) | Modify | Add missing keys, expand structure |
| `/messages/fr.json` | `properties` namespace | Modify | Add placeholder keys |
| `/messages/es.json` | `properties` namespace | Modify | Add placeholder keys |
| `/messages/de.json` | `properties` namespace | Modify | Add placeholder keys |
| `/messages/nl.json` | `properties` namespace | Modify | Add placeholder keys |
| `/messages/it.json` | `properties` namespace | Modify | Add placeholder keys |

### 7.2 Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/src/components/PropertyForm.tsx` | Identify string needs | Uses common.form, errors.form, common.actions |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Identify string needs | Uses dashboard namespace |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Identify string needs | Uses dashboard namespace |
| `/src/components/PropertySelector.tsx` | Identify string needs | Uses common.emptyStates |
| `/src/app/dashboard2/properties/page.tsx` | Identify string needs | Hardcoded strings, uses common.notifications |
| `/src/app/dashboard2/properties/layout.tsx` | Check metadata usage | Uses metadata.dashboard.properties |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| Previous Sub-Epics (2A-2E) | Established namespace patterns | Complete |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-086** (Task 2F.2) | PropertyForm ready for i18n update |
| **REQ-E02-087** (Task 2F.3) | Property modals ready for i18n update |
| **REQ-E02-088** (Task 2F.4) | Property pages ready for i18n update |
| **REQ-E02-089** (Task 2F.5) | PropertySelector ready for i18n update |
| **REQ-E02-090** (Task 2F.6) | Property management strings ready for translation generation |

### 8.3 Parallel Safety

- **Files touched**: 6 translation files only
- **Conflicts with**: None - translation files are isolated
- **Safe to parallelize with**: Any other tasks that don't modify translation files

### 8.4 External Dependencies

- `next-intl` package (from Epic 1)

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing `properties.modal` structure | Low | Extend existing structure, don't replace |
| Components use different namespaces | Medium | Document migration plan for Tasks 2F.2-2F.5 |
| Property type translations | Low | Keep database values in English, translate via i18n |
| Country name translations | High | Country names currently hardcoded; consider i18n-iso-countries package |

### 9.2 Testing Requirements

- Validate all JSON files after changes
- Verify key structure consistency across all 6 language files
- Test that existing `properties.modal` keys still work
- Run TypeScript compilation to catch any type errors

### 9.3 Open Questions

- [ ] Should property type labels be translated, or kept as database values?
  - **Recommendation:** Translate via i18n keys, keep database in English
- [ ] Should country names be translated?
  - **Note:** Current implementation hardcodes English country names (AddPropertyModal line 23-46, PropertyEditModal line 20-46)
  - **Recommendation:** Consider using `i18n-iso-countries` package for full localization
- [ ] Should we migrate existing modal keys to new structure, or keep both?
  - **Recommendation:** Keep existing `modal.*` keys for backward compatibility, add new top-level keys

---

## 10. Out of Scope

- Updating component imports to use `properties` namespace (handled by Tasks 2F.2-2F.5)
- Actual translations to other languages (handled by Task 2F.6)
- Country name localization beyond placeholder keys (requires i18n-iso-countries package)
- Property type management UI (database-driven)
- Metadata translations for properties page (separate namespace: `metadata.dashboard.properties`)

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Audit existing `properties` namespace in en.json (line 3219)
- [ ] Document current component namespace usage
- [ ] Review implementation plan section for Sub-Epic 2F

### Implementation
- [ ] Property types added to en.json
- [ ] Page-level translations added
- [ ] Selector translations added
- [ ] Form translations added
- [ ] Actions and notifications added
- [ ] Existing modal keys enhanced
- [ ] Delete confirmation keys added
- [ ] Placeholder keys added to all language files

### Post-Implementation
- [ ] All JSON files validate
- [ ] Key structure identical across all 6 language files
- [ ] TypeScript compilation succeeds
- [ ] No conflicts with existing `properties.modal` keys
- [ ] Total estimated keys: ~100-120 in `properties` namespace

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Existing Properties Namespace:** `/messages/en.json` (line 3219)
- **PropertyForm:** `/src/components/PropertyForm.tsx`
- **PropertyEditModal:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- **AddPropertyModal:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- **PropertySelector:** `/src/components/PropertySelector.tsx`
- **Properties Page:** `/src/app/dashboard2/properties/page.tsx`
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 18:51*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
