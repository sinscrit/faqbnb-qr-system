# REQ-E02-076: Create Properties Namespace Structure - Implementation Overview

*Generated: 2026-01-20 15:30:00 UTC*
*Last Modified: 2026-01-20 15:30:00 UTC*

## Reference

- **Request**: REQ-E02-076 (Create Properties Namespace Structure in Messages File)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2F (Property Management)
- **Task ID**: 2F.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create a comprehensive `properties` namespace within the `/messages/en.json` file containing all UI strings related to property management. This namespace will serve as the foundation for localizing property-related components including PropertyForm, PropertyEditModal, AddPropertyModal, PropertySelector, and PropertySection across all 6 supported languages.

## Goals

1. Create a well-organized `properties` namespace in `/messages/en.json` with categorized subcategories
2. Include all property-related UI strings from existing components
3. Cover form fields, modals, selectors, validation messages, and empty states
4. Follow the naming conventions established in Plan-111 and other Epic 2 namespaces
5. Structure keys to enable easy consumption via `useTranslations('properties')`
6. Replicate the structure across all 6 language files (en, fr, es, de, nl, it)

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Existing Translation File Structure

The current `/messages/en.json` contains these namespaces:
- `common` - Shared UI strings
- `auth` - Authentication strings
- `dashboard` - Dashboard strings (includes basic property references)
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selector strings

No dedicated `properties` namespace exists yet.

### Target Structure (from Plan-111)

Per the implementation plan, the `properties` namespace should include:

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties",
    "list": { ... },
    "form": { ... },
    "actions": { ... },
    "modal": { ... },
    "delete": { ... },
    "selector": { ... }
  }
}
```

### Estimated String Count

- **Form fields & labels**: ~25 strings
- **Modal titles & descriptions**: ~15 strings
- **Validation messages**: ~15 strings
- **Selectors & filters**: ~10 strings
- **Empty states & messages**: ~10 strings
- **Status & loading**: ~10 strings
- **Actions**: ~10 strings
- **Total**: ~95 strings

## Property Components Analysis

Based on codebase investigation, the following components contain property-related hardcoded strings:

### 1. PropertyForm (`/src/components/PropertyForm.tsx`)

**Hardcoded strings found:**
- Form titles: "Edit Property", "Create New Property"
- Field labels: "Property Owner", "Property Nickname", "Property Type", "Address"
- Placeholders: "Select property owner...", "e.g., Main Office, Home, Vacation House", "Select property type...", "e.g., 123 Main St, Anytown, State 12345"
- Helper text: "Property owner cannot be changed after creation", "A friendly name to identify this property", "Physical address or location description"
- Validation: "Property nickname is required", "Property nickname must be 100 characters or less", "Property type is required", "Address must be 500 characters or less"
- Button states: "Cancel", "Updating...", "Creating...", "Update Property", "Create Property"
- Error: "Failed to save property. Please try again."

### 2. PropertyEditModal (`/src/components/SimpleDashboard/PropertyEditModal.tsx`)

**Hardcoded strings found:**
- Modal title: "Edit Property"
- Description (sr-only): "Edit the details of your property including name and address information."
- Field labels: "Property Name", "Address Line 1", "Address Line 2", "City", "State/Province", "Postal Code", "Country"
- Placeholders: "e.g., Beach House", "Street address", "Apt, suite, unit, etc. (optional)", "City", "State or Province", "ZIP / Postal code", "Select country..."
- Validation messages: "Property name is required", "Property name must be 100 characters or less", "Address must be 200 characters or less", "City must be 100 characters or less", "State/Province must be 100 characters or less", "Postal code must be 20 characters or less", "Please select a valid country"
- Button text: "Cancel", "Saving...", "Save Changes"
- Screen reader: "Saving property changes...", "Close modal"
- Error: "Failed to update property"

### 3. AddPropertyModal (`/src/components/SimpleDashboard/AddPropertyModal.tsx`)

**Hardcoded strings found:**
- Modal title: "Add New Property"
- Description (sr-only): "Create a new property by entering the name and address information."
- Same field labels, placeholders, validation messages as PropertyEditModal
- Button text: "Cancel", "Creating...", "Create Property"
- Screen reader: "Creating property..."
- Error: "Failed to create property"

### 4. PropertySelector (`/src/components/PropertySelector.tsx`)

**Hardcoded strings found:**
- Section header: "Property Filter"
- Description: "Filter analytics data by property"
- Placeholder: "All Properties"
- Loading: "Loading properties..."
- Empty: "No properties available"

### 5. PropertySection (`/src/components/SimpleDashboard/PropertySection.tsx`)

**Hardcoded strings found:**
- Dynamic heading: "My Property" / "My Properties"
- Aria labels: "Edit property: {name}", "Loading properties", "Your properties", "Add a new property"
- Empty state: "Let's add your property", "A property is where your items live - like a vacation rental or home.", "Add Property"
- Button: "Add New Property"
- Counts: "{count} item" / "{count} items", "{count} room" / "{count} rooms"

### 6. Country List (Shared in modals)

**Country labels** need translation:
- "United States", "Canada", "United Kingdom", "Australia", etc.
- "Select country..." placeholder

## Implementation Order

### Step 1: Analyze Existing Strings

Review all property-related components to ensure complete string extraction.

### Step 2: Create Categorized Namespace Structure

Organize strings into logical subcategories:
- `properties.title` / `properties.subtitle` - Page-level
- `properties.list` - List-related strings
- `properties.form` - Form field labels, placeholders, hints
- `properties.validation` - Validation error messages
- `properties.modal` - Modal-specific strings
- `properties.actions` - Action buttons
- `properties.delete` - Delete confirmation
- `properties.selector` - Property selector strings
- `properties.empty` - Empty state messages
- `properties.status` - Loading and status messages
- `properties.section` - PropertySection component strings
- `properties.address` - Address-related fields
- `properties.countries` - Country dropdown options (optional, may use ISO codes)

### Step 3: Add New Namespace to en.json

Insert the `properties` namespace with all extracted strings.

### Step 4: Validate JSON Structure

- Ensure valid JSON syntax
- Verify all ICU message format patterns are correct
- Check for duplicate keys

### Step 5: Apply Structure to Other Language Files

Apply the same structure (with English placeholders initially) to:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Note: Actual translations will be generated in Task 2F.6.

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file (source of truth)
- **Current State**: Contains `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces
- **Modification Required**: Add new `properties` namespace with categorized subcategories
- **Changes**:
  - Add `properties` namespace with all property-related UI strings
  - Organize into subcategories: list, form, validation, modal, actions, delete, selector, empty, status
  - Implement ICU message format for pluralization patterns

**Target Namespace Structure:**

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties",

    "list": {
      "empty": {
        "title": "No properties yet",
        "description": "Add your first property to organize your items",
        "action": "Add Property"
      },
      "myProperty": "My Property",
      "myProperties": "My Properties",
      "yourProperties": "Your properties"
    },

    "form": {
      "titleCreate": "Create New Property",
      "titleEdit": "Edit Property",
      "descriptionCreate": "Create a new property by entering the name and address information.",
      "descriptionEdit": "Edit the details of your property including name and address information.",

      "ownerLabel": "Property Owner",
      "ownerPlaceholder": "Select property owner...",
      "ownerCannotChange": "Property owner cannot be changed after creation",

      "nameLabel": "Property Name",
      "namePlaceholder": "e.g., Beach House",
      "nameHint": "A friendly name to identify this property",

      "nicknameLabel": "Property Nickname",
      "nicknamePlaceholder": "e.g., Main Office, Home, Vacation House",
      "nicknameHint": "A friendly name to identify this property",

      "typeLabel": "Property Type",
      "typePlaceholder": "Select property type...",

      "addressLabel": "Address",
      "addressPlaceholder": "e.g., 123 Main St, Anytown, State 12345",
      "addressHint": "Physical address or location description",

      "optional": "(Optional)"
    },

    "address": {
      "line1Label": "Address Line 1",
      "line1Placeholder": "Street address",
      "line2Label": "Address Line 2",
      "line2Placeholder": "Apt, suite, unit, etc. (optional)",
      "cityLabel": "City",
      "cityPlaceholder": "City",
      "stateLabel": "State/Province",
      "statePlaceholder": "State or Province",
      "postalCodeLabel": "Postal Code",
      "postalCodePlaceholder": "ZIP / Postal code",
      "countryLabel": "Country",
      "countryPlaceholder": "Select country..."
    },

    "validation": {
      "nameRequired": "Property name is required",
      "nameMaxLength": "Property name must be {max} characters or less",
      "nicknameRequired": "Property nickname is required",
      "nicknameMaxLength": "Property nickname must be {max} characters or less",
      "typeRequired": "Property type is required",
      "addressMaxLength": "Address must be {max} characters or less",
      "cityMaxLength": "City must be {max} characters or less",
      "stateMaxLength": "State/Province must be {max} characters or less",
      "postalCodeMaxLength": "Postal code must be {max} characters or less",
      "countryInvalid": "Please select a valid country"
    },

    "actions": {
      "add": "Add Property",
      "addNew": "Add New Property",
      "edit": "Edit Property",
      "delete": "Delete Property",
      "view": "View Property",
      "save": "Save Changes",
      "create": "Create Property",
      "update": "Update Property",
      "cancel": "Cancel"
    },

    "modal": {
      "addTitle": "Add New Property",
      "editTitle": "Edit Property",
      "closeLabel": "Close modal"
    },

    "delete": {
      "title": "Delete Property",
      "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
      "confirm": "Delete Property"
    },

    "selector": {
      "filterTitle": "Property Filter",
      "filterDescription": "Filter analytics data by property",
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "noProperties": "No properties available",
      "unassigned": "Unassigned"
    },

    "status": {
      "loading": "Loading properties...",
      "saving": "Saving...",
      "creating": "Creating...",
      "updating": "Updating...",
      "deleting": "Deleting...",
      "savingProperty": "Saving property changes...",
      "creatingProperty": "Creating property..."
    },

    "errors": {
      "saveFailed": "Failed to save property. Please try again.",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property"
    },

    "section": {
      "emptyTitle": "Let's add your property",
      "emptyDescription": "A property is where your items live - like a vacation rental or home.",
      "editAriaLabel": "Edit property: {name}",
      "addAriaLabel": "Add a new property"
    },

    "counts": {
      "items": "{count, plural, one {# item} other {# items}}",
      "rooms": "{count, plural, one {# room} other {# rooms}}"
    },

    "types": {
      "apartment": "Apartment",
      "house": "House",
      "condo": "Condo",
      "townhouse": "Townhouse",
      "cabin": "Cabin",
      "villa": "Villa",
      "other": "Other"
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Apply same structure (English placeholders initially)
- **Note**: Actual translations will be generated in Task 2F.6

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Any component files - Components will be updated in subsequent tasks (2F.2-2F.5)

## Technical Specifications

### ICU Message Format Patterns

The following patterns use ICU message format for pluralization:

```json
{
  "counts": {
    "items": "{count, plural, one {# item} other {# items}}",
    "rooms": "{count, plural, one {# room} other {# rooms}}"
  }
}
```

**Usage in Components:**
```typescript
const t = useTranslations('properties.counts');
t('items', { count: 5 }); // "5 items"
t('items', { count: 1 }); // "1 item"
t('rooms', { count: 3 }); // "3 rooms"
```

### Variable Interpolation Patterns

```json
{
  "delete": {
    "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\"."
  },
  "validation": {
    "nameMaxLength": "Property name must be {max} characters or less"
  },
  "section": {
    "editAriaLabel": "Edit property: {name}"
  }
}
```

**Usage in Components:**
```typescript
const t = useTranslations('properties');
t('delete.message', { name: 'Beach House' }); // "Are you sure you want to delete "Beach House"?..."
t('validation.nameMaxLength', { max: 100 }); // "Property name must be 100 characters or less"
```

### Translation Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{category}.{element}.{variant?}
```

Examples:
- `properties.form.nameLabel` - Property name form label
- `properties.validation.nameRequired` - Name required validation message
- `properties.actions.create` - Create action button
- `properties.counts.items` - Item count pluralization

## Usage Patterns

### Client Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function PropertyForm() {
  const t = useTranslations('properties');

  return (
    <div>
      <h2>{t('form.titleCreate')}</h2>
      <label>{t('form.nameLabel')}</label>
      <input placeholder={t('form.namePlaceholder')} />
      <button>{t('actions.create')}</button>
    </div>
  );
}
```

### Server Component Usage

```typescript
import { getTranslations } from 'next-intl/server';

async function PropertiesPage() {
  const t = await getTranslations('properties');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

## Success Validation Checklist

### Structure Validation
- [ ] `properties.title` and `properties.subtitle` exist at root level
- [ ] `properties.list` subcategory exists with empty state strings
- [ ] `properties.form` subcategory exists with all form field labels and placeholders
- [ ] `properties.address` subcategory exists with address-specific fields
- [ ] `properties.validation` subcategory exists with ~10 validation messages
- [ ] `properties.actions` subcategory exists with ~9 action strings
- [ ] `properties.modal` subcategory exists with modal-specific strings
- [ ] `properties.delete` subcategory exists with delete confirmation strings
- [ ] `properties.selector` subcategory exists with ~6 selector strings
- [ ] `properties.status` subcategory exists with ~7 loading/status strings
- [ ] `properties.errors` subcategory exists with ~4 error messages
- [ ] `properties.section` subcategory exists with ~4 section component strings
- [ ] `properties.counts` subcategory exists with pluralization patterns
- [ ] `properties.types` subcategory exists with property type labels

### ICU Format Validation
- [ ] Pluralization patterns are syntactically correct
- [ ] Variable interpolation patterns use correct `{variable}` syntax
- [ ] No unterminated brackets or braces

### JSON Validation
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files maintain consistent structure
- [ ] No duplicate keys within namespaces

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Sample usage works: `useTranslations('properties')` returns correct strings
- [ ] ICU patterns work: `t('counts.items', { count: 5 })` returns "5 items"
- [ ] Variable interpolation works: `t('delete.message', { name: 'Test' })` returns expected string

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Changes are additive (new namespace)
  - JSON files have no runtime execution risk
  - Easy to validate with JSON linting
  - Rollback is straightforward (restore previous JSON)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Malformed ICU syntax | Medium | Low | Validate with next-intl's built-in checking |
| Missing keys in non-English files | Medium | Low | Use English as fallback, structure will be synced |
| Key naming inconsistencies | Low | Low | Follow established patterns from common namespace |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2F.2**: PropertyForm component update
2. **Task 2F.3**: Property modal components update (PropertyEditModal, AddPropertyModal)
3. **Task 2F.4**: Property pages update
4. **Task 2F.5**: PropertySelector component update
5. **Task 2F.6**: Translation generation for non-English languages

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2F: Property Management", including:
- Same key naming conventions
- Same categorization approach
- Same ICU message format patterns

### String Reusability

Some strings may overlap with the `common` namespace:
- "Cancel", "Save", "Delete" actions - Use from `common.actions`
- "Loading..." status - Use from `common.status`
- Validation messages like "This field is required" - Use from `common.validation` or `errors`

Components should use `properties` namespace for property-specific strings and fall back to `common` for generic UI elements to maintain consistency and reduce translation costs.

### Country Labels

Country labels in the dropdown may optionally be handled separately:
- Option A: Include in `properties.countries` subcategory
- Option B: Use Intl.DisplayNames API for browser-native country name localization
- Recommendation: Keep country codes in component, use Intl.DisplayNames for display (reduces translation burden)

---

*End of Implementation Overview*
