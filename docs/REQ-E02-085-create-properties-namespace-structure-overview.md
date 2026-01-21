# REQ-E02-085: Create Properties Namespace Structure - Implementation Overview

*Generated: 2026-01-20 09:15:00 UTC*
*Last Modified: 2026-01-20 09:15:00 UTC*

## Reference

- **Request**: REQ-E02-085 (Create Properties Namespace Structure)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2F (Property Management)
- **Task ID**: 2F.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create the `properties` namespace structure in the translation files (`/messages/*.json`) to support localization of all property management UI components. This task establishes the translation key hierarchy and categorization for property-related strings, enabling subsequent tasks to reference these keys when updating PropertyForm, PropertyEditModal, AddPropertyModal, PropertySelector, PropertySection, and property pages.

## Goals

1. Create a comprehensive `properties` namespace in `/messages/en.json` with logically organized subcategories
2. Extract and catalog all hardcoded UI strings from property-related components
3. Structure keys to support ICU message format for pluralization and variable interpolation
4. Replicate the namespace structure across all 6 language files (en, fr, es, de, nl, it)
5. Follow naming conventions established in Plan-111 and existing Epic 2 namespaces
6. Ensure structure supports future property management features without reorganization

## Context from Implementation Plan

### Epic 1 Foundation (Already Complete)

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |
| getTranslations | next-intl/server | Available |

### Current Translation File Structure

The existing `/messages/en.json` contains these namespaces:
- `common` - Shared UI strings (actions, status, validation)
- `auth` - Authentication strings
- `dashboard` - Dashboard strings (includes basic property references)
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selector strings

**No dedicated `properties` namespace exists yet.**

### Target Structure (from Plan-111)

Per the implementation plan, Sub-Epic 2F specifies a `properties` namespace with approximately 200 strings organized into logical subcategories.

## Property Components Inventory

Based on codebase investigation, the following components contain property-related hardcoded strings that will consume this namespace:

### 1. PropertyForm (`/src/components/PropertyForm.tsx`)

**String Categories:**
- Form titles: "Edit Property", "Create New Property"
- Field labels: "Property Owner", "Property Nickname", "Property Type", "Address"
- Placeholders: "Select property owner...", "e.g., Main Office, Home, Vacation House", etc.
- Helper text: "Property owner cannot be changed after creation", "A friendly name to identify this property"
- Validation messages: "Property nickname is required", "Property nickname must be 100 characters or less"
- Button states: "Cancel", "Updating...", "Creating...", "Update Property", "Create Property"
- Error messages: "Failed to save property. Please try again."

**Estimated Strings: ~25**

### 2. PropertyEditModal (`/src/components/SimpleDashboard/PropertyEditModal.tsx`)

**String Categories:**
- Modal title: "Edit Property"
- Description (sr-only): "Edit the details of your property..."
- Address field labels: "Address Line 1", "Address Line 2", "City", "State/Province", "Postal Code", "Country"
- Placeholders: "e.g., Beach House", "Street address", "Apt, suite, unit, etc. (optional)", etc.
- Validation messages: "Property name is required", "Property name must be 100 characters or less", etc.
- Button text: "Cancel", "Saving...", "Save Changes"
- Screen reader announcements: "Saving property changes...", "Close modal"
- Country dropdown: "Select country...", country names

**Estimated Strings: ~30**

### 3. AddPropertyModal (`/src/components/SimpleDashboard/AddPropertyModal.tsx`)

**String Categories:**
- Modal title: "Add New Property"
- Description (sr-only): "Create a new property by entering the name and address information."
- Same address field labels, placeholders, validation as PropertyEditModal
- Button text: "Cancel", "Creating...", "Create Property"
- Screen reader: "Creating property..."

**Estimated Strings: ~25**

### 4. PropertySelector (`/src/components/PropertySelector.tsx`)

**String Categories:**
- Section header: "Property Filter"
- Description: "Filter analytics data by property"
- Placeholder: "All Properties"
- Loading: "Loading properties..."
- Empty state: "No properties available"
- Aria labels for accessibility

**Estimated Strings: ~10**

### 5. PropertySection (`/src/components/SimpleDashboard/PropertySection.tsx`)

**String Categories:**
- Dynamic heading: "My Property" / "My Properties"
- Aria labels: "Edit property: {name}", "Loading properties", "Your properties", "Add a new property"
- Empty state: "Let's add your property", "A property is where your items live..."
- Button: "Add New Property"
- Counts with pluralization: "{count} item" / "{count} items", "{count} room" / "{count} rooms"

**Estimated Strings: ~15**

### 6. Properties Page (`/src/app/dashboard2/properties/page.tsx`)

**String Categories:**
- Page header: "My Properties"
- Subtitle: "Manage your properties and their settings"
- Success messages: "Property updated successfully", "Property created successfully"
- Login prompt: "Please log in to view properties."

**Estimated Strings: ~5**

### Total Estimated Strings: ~95-100

## Namespace Structure Design

### Root Level Keys

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties"
  }
}
```

### Subcategory Organization

| Subcategory | Purpose | Estimated Keys |
|-------------|---------|----------------|
| `list` | Property list strings, empty states, headings | 8 |
| `form` | Form field labels, placeholders, hints | 18 |
| `address` | Address-specific field labels and placeholders | 12 |
| `validation` | Validation error messages | 10 |
| `actions` | Action button labels | 10 |
| `modal` | Modal-specific strings (titles, descriptions) | 6 |
| `delete` | Delete confirmation strings | 3 |
| `selector` | Property selector/filter strings | 6 |
| `status` | Loading, saving, status indicators | 8 |
| `errors` | Error messages | 5 |
| `section` | PropertySection component strings | 5 |
| `counts` | Pluralized count strings (items, rooms) | 2 |
| `types` | Property type labels | 7 |

## Authorized Files and Functions for Modification

### Primary File: `/messages/en.json`

**Purpose**: English translation source file (source of truth)

**Current State**: Contains `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces

**Modification Required**: Add new `properties` namespace with categorized subcategories

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
      "yourProperties": "Your properties",
      "loadingProperties": "Loading properties"
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
      "optional": "(Optional)"
    },

    "address": {
      "label": "Address",
      "placeholder": "e.g., 123 Main St, Anytown, State 12345",
      "hint": "Physical address or location description",
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
      "closeLabel": "Close modal",
      "addDescription": "Create a new property by entering the name and address information.",
      "editDescription": "Edit the details of your property including name and address information."
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
      "unassigned": "Unassigned",
      "ariaLabel": "Select property for analytics filtering"
    },

    "status": {
      "loading": "Loading properties...",
      "saving": "Saving...",
      "creating": "Creating...",
      "updating": "Updating...",
      "deleting": "Deleting...",
      "savingProperty": "Saving property changes...",
      "creatingProperty": "Creating property...",
      "updated": "Property updated successfully",
      "created": "Property created successfully"
    },

    "errors": {
      "saveFailed": "Failed to save property. Please try again.",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "loginRequired": "Please log in to view properties."
    },

    "section": {
      "emptyTitle": "Let's add your property",
      "emptyDescription": "A property is where your items live - like a vacation rental or home.",
      "editAriaLabel": "Edit property: {name}",
      "addAriaLabel": "Add a new property",
      "settingsDescription": "Manage your properties and their settings"
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

### Secondary Files: Other Language Files

| File | Purpose | Modification |
|------|---------|--------------|
| `/messages/fr.json` | French translations | Add `properties` namespace (English placeholders initially) |
| `/messages/es.json` | Spanish translations | Add `properties` namespace (English placeholders initially) |
| `/messages/de.json` | German translations | Add `properties` namespace (English placeholders initially) |
| `/messages/nl.json` | Dutch translations | Add `properties` namespace (English placeholders initially) |
| `/messages/it.json` | Italian translations | Add `properties` namespace (English placeholders initially) |

**Note**: Actual translations will be generated in Task 2F.6.

### Files NOT to Modify

| File | Reason |
|------|--------|
| `/src/lib/i18n/config.ts` | No changes needed - already configured |
| `/src/lib/i18n/index.ts` | No changes needed |
| `/src/app/layout.tsx` | IntlProvider already configured |
| Component files | Will be updated in subsequent tasks (2F.2-2F.5) |

## Technical Specifications

### ICU Message Format Patterns

#### Pluralization

```json
{
  "counts": {
    "items": "{count, plural, one {# item} other {# items}}",
    "rooms": "{count, plural, one {# room} other {# rooms}}"
  }
}
```

**Usage:**
```typescript
const t = useTranslations('properties.counts');
t('items', { count: 5 }); // "5 items"
t('items', { count: 1 }); // "1 item"
```

#### Variable Interpolation

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

**Usage:**
```typescript
const t = useTranslations('properties');
t('delete.message', { name: 'Beach House' });
t('validation.nameMaxLength', { max: 100 });
```

### Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{category}.{element}.{variant?}
```

Examples:
- `properties.form.nameLabel` - Property name form label
- `properties.validation.nameRequired` - Name required validation message
- `properties.actions.create` - Create action button
- `properties.counts.items` - Item count pluralization

## Implementation Steps

### Step 1: Validate Current Translation File Structure

1. Read `/messages/en.json` to understand current structure
2. Identify insertion point for new `properties` namespace
3. Ensure no conflicts with existing keys

### Step 2: Add Properties Namespace to en.json

1. Add the complete `properties` namespace structure as defined above
2. Validate JSON syntax
3. Verify ICU message format patterns are correct

### Step 3: Replicate Structure to Other Language Files

1. Add `properties` namespace to `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
2. Use English text as placeholder values
3. Maintain identical key structure across all files

### Step 4: Validate Implementation

1. Run `npm run build` to ensure no build errors
2. Verify JSON files are valid
3. Test sample key access with `useTranslations('properties')`

## Usage Examples

### Client Component

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
      <p className="hint">{t('form.nameHint')}</p>
      <button>{t('actions.create')}</button>
    </div>
  );
}
```

### Server Component

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

### Pluralization

```typescript
const t = useTranslations('properties.counts');

function PropertyStats({ itemCount, roomCount }) {
  return (
    <div>
      <span>{t('items', { count: itemCount })}</span>
      <span>{t('rooms', { count: roomCount })}</span>
    </div>
  );
}
```

## Success Validation Checklist

### Structure Validation
- [ ] `properties.title` and `properties.subtitle` exist at root level
- [ ] `properties.list` subcategory contains empty state and heading strings
- [ ] `properties.form` subcategory contains all form field labels (~18 keys)
- [ ] `properties.address` subcategory contains address field labels (~12 keys)
- [ ] `properties.validation` subcategory contains validation messages (~10 keys)
- [ ] `properties.actions` subcategory contains action button labels (~10 keys)
- [ ] `properties.modal` subcategory contains modal-specific strings (~6 keys)
- [ ] `properties.delete` subcategory contains delete confirmation strings (~3 keys)
- [ ] `properties.selector` subcategory contains selector strings (~7 keys)
- [ ] `properties.status` subcategory contains status/loading strings (~9 keys)
- [ ] `properties.errors` subcategory contains error messages (~5 keys)
- [ ] `properties.section` subcategory contains section component strings (~5 keys)
- [ ] `properties.counts` subcategory contains pluralization patterns (~2 keys)
- [ ] `properties.types` subcategory contains property type labels (~7 keys)

### ICU Format Validation
- [ ] Pluralization patterns use correct ICU syntax: `{count, plural, one {#...} other {#...}}`
- [ ] Variable interpolation uses correct syntax: `{variableName}`
- [ ] No unterminated brackets or braces

### JSON Validation
- [ ] `/messages/en.json` is valid JSON (parseable without errors)
- [ ] All 6 language files have identical key structure
- [ ] No duplicate keys within the namespace

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] TypeScript compilation succeeds: `npm run typecheck`
- [ ] Sample hook works: `useTranslations('properties')` returns translation function
- [ ] Pluralization works: `t('counts.items', { count: 5 })` returns "5 items"
- [ ] Variable interpolation works: `t('delete.message', { name: 'Test' })` returns expected string

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

**Risk Level**: Low

**Rationale**:
- Changes are purely additive (new namespace, no modifications to existing keys)
- JSON files have no runtime execution risk
- Easy to validate with JSON linting tools
- Rollback is straightforward (restore previous JSON)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Malformed ICU syntax | Medium | Low | Test patterns with next-intl's built-in validation |
| Missing keys in non-English files | Medium | Low | English fallback configured, structure sync in step 3 |
| Key naming inconsistencies | Low | Low | Follow established patterns from `common` namespace |
| JSON syntax errors | Low | Medium | Validate with JSON linter before commit |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2F.2**: `PropertyForm` component update
2. **Task 2F.3**: Property modal components update (`PropertyEditModal`, `AddPropertyModal`)
3. **Task 2F.4**: Property pages update (`/dashboard2/properties`)
4. **Task 2F.5**: `PropertySelector` component update
5. **Task 2F.6**: Translation generation for non-English languages

## Notes

### String Reusability

Some strings overlap with the `common` namespace and should be reused:
- Generic actions like "Cancel", "Save" → Use `common.cancel`, `common.save`
- Generic status like "Loading..." → Use `common.loading`

Components should use `properties` namespace for property-specific strings and fall back to `common` for generic UI elements.

### Country Names

Country labels in dropdowns can be handled via:
- **Option A**: Include in `properties.countries` subcategory (increases translation burden)
- **Option B**: Use `Intl.DisplayNames` API for browser-native localization (recommended)

Current recommendation: Keep country codes in component, use `Intl.DisplayNames` for display names.

### Character Counters

The `{length}/{maxLength}` pattern used in forms (e.g., "23/100") is typically not translated as numbers are universal. The component can handle this directly.

---

*End of Implementation Overview*
