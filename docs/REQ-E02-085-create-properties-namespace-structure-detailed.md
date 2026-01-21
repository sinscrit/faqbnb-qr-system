# REQ-E02-085: Create Properties Namespace Structure - Detailed Task Breakdown

*Generated: 2026-01-20 18:30:00 UTC*
*Last Modified: 2026-01-20 18:30:00 UTC*

## Reference

- **Request**: REQ-E02-085 (Create Properties Namespace Structure)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-085-create-properties-namespace-structure-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2F (Property Management)
- **Task ID**: 2F.1
- **Size**: S (Small)
- **Priority**: P1
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

---

## Summary

Create a comprehensive `properties` namespace in the translation files (`/messages/*.json`) to support localization of all property management UI components. This namespace will contain approximately 95-100 translation keys organized into logical subcategories, enabling subsequent tasks (2F.2-2F.6) when updating PropertyForm, PropertyEditModal, AddPropertyModal, PropertySelector, PropertySection, and property pages to use the `useTranslations` hook.

---

## Current State Analysis

### Existing Translation File Structure

The current `/messages/en.json` contains these namespaces:
- `common` - Shared UI strings (actions, status, validation)
- `auth` - Authentication strings
- `dashboard` - Dashboard strings (includes basic property references)
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selector strings

**No dedicated `properties` namespace exists yet.**

### Dashboard Namespace Property References

The existing `dashboard` namespace contains these property-related keys:
```json
"dashboard": {
  "properties": "Properties",
  "totalProperties": "Total Properties",
  "createProperty": "Create Property"
}
```

These will remain in `dashboard` as navigation/stats context. The new `properties` namespace will contain property management-specific strings.

### Target State (~95-100 keys, categorized structure)

Transform into 13 subcategories:
- `properties.title/subtitle` (root level context)
- `properties.list` (~8 keys) - List view strings, empty states, headings
- `properties.form` (~14 keys) - Form field labels, placeholders, hints
- `properties.address` (~12 keys) - Address-specific field labels
- `properties.validation` (~10 keys) - Validation error messages
- `properties.actions` (~9 keys) - Action button labels
- `properties.modal` (~6 keys) - Modal-specific strings
- `properties.delete` (~3 keys) - Delete confirmation strings
- `properties.selector` (~7 keys) - Property selector/filter strings
- `properties.status` (~9 keys) - Loading, saving, status indicators
- `properties.errors` (~5 keys) - Error messages
- `properties.section` (~5 keys) - PropertySection component strings
- `properties.counts` (~2 keys) - Pluralized count strings
- `properties.types` (~7 keys) - Property type labels

### Property Component Inventory

Based on the Overview Document analysis, the property management family contains 6 main components with ~95-100 hardcoded strings requiring translation:

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| PropertyForm | `/src/components/PropertyForm.tsx` | ~25 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~30 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~25 |
| PropertySelector | `/src/components/PropertySelector.tsx` | ~10 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | ~15 |
| Properties Page | `/src/app/dashboard2/properties/page.tsx` | ~5 |

---

## Detailed Tasks

### Task 1: Create Root-Level Context Keys
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Add page-level context strings for the properties section including title and subtitle at the root level of the `properties` namespace.

#### Target Content

```json
{
  "properties": {
    "title": "Properties",
    "subtitle": "Manage your properties"
  }
}
```

#### Acceptance Criteria
- [ ] Title and subtitle added for page header
- [ ] Root-level keys established for page context
- [ ] JSON is valid after edit

#### Verification Steps
1. Verify JSON is valid after edit
2. Confirm keys follow naming convention

---

### Task 2: Create `properties.list` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `list` subcategory containing list view strings including empty states, headings, and loading indicators for PropertySection component.

#### Target Content (~8 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 8 list view keys are present
- [ ] Empty state includes title, description, and action
- [ ] Singular and plural heading variants included
- [ ] Loading state message included

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.list` (should be ~8)

---

### Task 3: Create `properties.form` Subcategory
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `form` subcategory containing form field labels, placeholders, and hints for PropertyForm component.

#### Target Content (~14 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 14 form field keys are present
- [ ] Create and Edit title variants included
- [ ] Screen reader descriptions included
- [ ] Placeholders provide helpful examples
- [ ] Hint text explains field purpose

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.form` (should be ~14)

---

### Task 4: Create `properties.address` Subcategory
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `address` subcategory containing address-specific field labels and placeholders for PropertyEditModal and AddPropertyModal.

#### Target Content (~12 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 12 address field keys are present
- [ ] Multi-line address fields labeled (line1, line2)
- [ ] City, state, postal code, country fields included
- [ ] Placeholders provide helpful guidance

#### Technical Notes
- Country names will use `Intl.DisplayNames` API for browser-native localization
- Only the placeholder "Select country..." needs translation

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.address` (should be ~12)

---

### Task 5: Create `properties.validation` Subcategory with Variables
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `validation` subcategory containing validation error messages with variable interpolation for character limits.

#### Target Content (~10 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 10 validation message keys are present
- [ ] Variable interpolation for {max} in length validations
- [ ] Messages are user-friendly and specific

#### Technical Notes
- Variable interpolation: `{variableName}`
- Usage: `t('nameMaxLength', { max: 100 })` returns "Property name must be 100 characters or less"

#### Verification Steps
1. Verify JSON is valid after edit
2. Confirm {max} placeholder syntax is correct

---

### Task 6: Create `properties.actions` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `actions` subcategory containing all action button labels for property management.

#### Target Content (~9 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 9 action keys are present
- [ ] Key names follow camelCase convention
- [ ] Action verbs are clear and consistent

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.actions` (should be ~9)

---

### Task 7: Create `properties.modal` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `modal` subcategory containing modal-specific strings for PropertyEditModal and AddPropertyModal.

#### Target Content (~6 keys)

```json
{
  "properties": {
    "modal": {
      "addTitle": "Add New Property",
      "editTitle": "Edit Property",
      "closeLabel": "Close modal",
      "addDescription": "Create a new property by entering the name and address information.",
      "editDescription": "Edit the details of your property including name and address information."
    }
  }
}
```

#### Acceptance Criteria
- [ ] Add and Edit modal titles included
- [ ] Close button aria-label included
- [ ] Screen reader descriptions for add/edit modes

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.modal` (should be ~6)

---

### Task 8: Create `properties.delete` Subcategory with Variable
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `delete` subcategory containing delete confirmation dialog strings with variable interpolation.

#### Target Content (~3 keys)

```json
{
  "properties": {
    "delete": {
      "title": "Delete Property",
      "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
      "confirm": "Delete Property"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Delete dialog title included
- [ ] Confirmation message with {name} variable
- [ ] Confirm button text included
- [ ] Message explains consequence (items moved to Unassigned)

#### Technical Notes
- Variable interpolation: `{name}`
- Usage: `t('message', { name: 'Beach House' })`

#### Verification Steps
1. Verify JSON is valid after edit
2. Confirm escaped quotes around {name} are correct

---

### Task 9: Create `properties.selector` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `selector` subcategory containing property selector/filter strings for PropertySelector component.

#### Target Content (~7 keys)

```json
{
  "properties": {
    "selector": {
      "filterTitle": "Property Filter",
      "filterDescription": "Filter analytics data by property",
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "noProperties": "No properties available",
      "unassigned": "Unassigned",
      "ariaLabel": "Select property for analytics filtering"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Filter title and description included
- [ ] Select placeholder text included
- [ ] "All Properties" option labeled
- [ ] Empty state message included
- [ ] Unassigned option labeled
- [ ] Aria label for accessibility

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.selector` (should be ~7)

---

### Task 10: Create `properties.status` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `status` subcategory containing loading, saving, and status indicator strings.

#### Target Content (~9 keys)

```json
{
  "properties": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All loading state messages included
- [ ] Button state messages (Saving..., Creating..., etc.)
- [ ] Screen reader announcements included
- [ ] Success messages for update and create

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.status` (should be ~9)

---

### Task 11: Create `properties.errors` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `errors` subcategory containing error messages specific to property operations.

#### Target Content (~5 keys)

```json
{
  "properties": {
    "errors": {
      "saveFailed": "Failed to save property. Please try again.",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "loginRequired": "Please log in to view properties."
    }
  }
}
```

#### Acceptance Criteria
- [ ] All operation failure messages included
- [ ] Messages are user-friendly
- [ ] Login required message for auth state

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.errors` (should be ~5)

---

### Task 12: Create `properties.section` Subcategory with Variable
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `section` subcategory containing PropertySection component strings with variable interpolation.

#### Target Content (~5 keys)

```json
{
  "properties": {
    "section": {
      "emptyTitle": "Let's add your property",
      "emptyDescription": "A property is where your items live - like a vacation rental or home.",
      "editAriaLabel": "Edit property: {name}",
      "addAriaLabel": "Add a new property",
      "settingsDescription": "Manage your properties and their settings"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Empty state title and description included
- [ ] Aria labels for edit and add buttons
- [ ] Edit aria label has {name} variable interpolation
- [ ] Settings page description included

#### Verification Steps
1. Verify JSON is valid after edit
2. Confirm {name} placeholder syntax is correct

---

### Task 13: Create `properties.counts` Subcategory with ICU Format
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `counts` subcategory containing pluralized count strings using ICU message format for item and room counts.

#### Target Content (~2 keys)

```json
{
  "properties": {
    "counts": {
      "items": "{count, plural, one {# item} other {# items}}",
      "rooms": "{count, plural, one {# room} other {# rooms}}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] ICU plural syntax correct for items
- [ ] ICU plural syntax correct for rooms
- [ ] Pluralization handles 0, 1, and multiple

#### Technical Notes
- ICU format: `{variable, plural, one {singular} other {plural}}`
- Usage: `t('items', { count: 5 })` returns "5 items"
- Usage: `t('items', { count: 1 })` returns "1 item"

#### Verification Steps
1. Verify JSON is valid after edit
2. Test ICU patterns don't cause parse errors
3. Verify `#` placeholder is used for count display

---

### Task 14: Create `properties.types` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `types` subcategory containing property type labels for the property type dropdown.

#### Target Content (~7 keys)

```json
{
  "properties": {
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

#### Acceptance Criteria
- [ ] All 7 property type labels included
- [ ] Key names match database enum values (lowercase)
- [ ] Labels are user-friendly display text

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `properties.types` (should be ~7)

---

### Task 15: Copy Structure to Other Language Files
**Estimate**: 1 story point
**Priority**: P2 - Required but separate

#### Description
Apply the same hierarchical structure to all 5 non-English language files using English placeholders. Actual translations will be generated in Task 2F.6.

#### Files to Update
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### Acceptance Criteria
- [ ] All 5 files have identical structure to `en.json` properties namespace
- [ ] All keys present in `en.json` exist in other files
- [ ] Values are English placeholders (will be translated later)
- [ ] All files are valid JSON

#### Verification Steps
1. Validate each file with JSON linter
2. Compare key structure between files

---

### Task 16: Validate Complete Implementation
**Estimate**: 1 story point
**Priority**: P0 - Must do last

#### Description
Final validation to ensure all acceptance criteria are met and the implementation is complete.

#### Checklist

**Structure Validation**
- [ ] `properties.title` and `properties.subtitle` exist at root level
- [ ] `properties.list` exists with ~8 keys
- [ ] `properties.form` exists with ~14 keys
- [ ] `properties.address` exists with ~12 keys
- [ ] `properties.validation` exists with ~10 keys
- [ ] `properties.actions` exists with ~9 keys
- [ ] `properties.modal` exists with ~6 keys
- [ ] `properties.delete` exists with ~3 keys
- [ ] `properties.selector` exists with ~7 keys
- [ ] `properties.status` exists with ~9 keys
- [ ] `properties.errors` exists with ~5 keys
- [ ] `properties.section` exists with ~5 keys
- [ ] `properties.counts` exists with ~2 keys (ICU format)
- [ ] `properties.types` exists with ~7 keys

**ICU Format Validation**
- [ ] `properties.counts.items` pluralization works
- [ ] `properties.counts.rooms` pluralization works

**Variable Interpolation Validation**
- [ ] `properties.validation.nameMaxLength` with {max} works
- [ ] `properties.delete.message` with {name} works
- [ ] `properties.section.editAriaLabel` with {name} works

**JSON Validation**
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files have consistent properties structure
- [ ] No duplicate keys within properties namespace

**Build Validation**
- [ ] `npm run build` succeeds without errors
- [ ] `npm run typecheck` succeeds without errors
- [ ] Application starts without i18n errors

#### Verification Commands
```bash
# Validate JSON files
npx jsonlint messages/en.json
npx jsonlint messages/fr.json
npx jsonlint messages/es.json
npx jsonlint messages/de.json
npx jsonlint messages/nl.json
npx jsonlint messages/it.json

# Type check
npm run typecheck

# Build project
npm run build

# Start dev server and check console
npm run dev
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | Modify | Add complete `properties` namespace (~95-100 keys) |
| `/messages/fr.json` | Modify | Add `properties` namespace with English placeholders |
| `/messages/es.json` | Modify | Add `properties` namespace with English placeholders |
| `/messages/de.json` | Modify | Add `properties` namespace with English placeholders |
| `/messages/nl.json` | Modify | Add `properties` namespace with English placeholders |
| `/messages/it.json` | Modify | Add `properties` namespace with English placeholders |

---

## Files NOT to Modify

| File | Reason |
|------|--------|
| `/src/components/PropertyForm.tsx` | Will be updated in Task 2F.2 |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Will be updated in Task 2F.3 |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Will be updated in Task 2F.3 |
| `/src/app/dashboard2/properties/page.tsx` | Will be updated in Task 2F.4 |
| `/src/components/PropertySelector.tsx` | Will be updated in Task 2F.5 |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Will be updated in Task 2F.3 |
| `/src/lib/i18n/config.ts` | No changes needed - already configured |
| Database migrations | No schema changes |
| API routes | No translation changes |

---

## Final Target Structure

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

---

## Usage Examples After Implementation

### Client Component - Basic
```typescript
'use client';
import { useTranslations } from 'next-intl';

function PropertiesHeader() {
  const t = useTranslations('properties');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### Client Component - With Subcategory Scope
```typescript
'use client';
import { useTranslations } from 'next-intl';

function PropertyEmptyState() {
  const t = useTranslations('properties.list.empty');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <button>{t('action')}</button>
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
      <p>{t('section.settingsDescription')}</p>
    </div>
  );
}
```

### With ICU Pluralization
```typescript
'use client';
import { useTranslations } from 'next-intl';

function PropertyStats({ itemCount, roomCount }: { itemCount: number; roomCount: number }) {
  const t = useTranslations('properties.counts');

  return (
    <div>
      <span>{t('items', { count: itemCount })}</span>
      <span>{t('rooms', { count: roomCount })}</span>
    </div>
  );
}
```

### With Variable Interpolation
```typescript
'use client';
import { useTranslations } from 'next-intl';

function DeleteConfirmation({ propertyName }: { propertyName: string }) {
  const t = useTranslations('properties.delete');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('message', { name: propertyName })}</p>
      <button>{t('confirm')}</button>
    </div>
  );
}
```

### Form with Validation Messages
```typescript
'use client';
import { useTranslations } from 'next-intl';

function PropertyForm() {
  const t = useTranslations('properties');
  const MAX_NAME_LENGTH = 100;

  return (
    <form>
      <label>{t('form.nameLabel')}</label>
      <input
        placeholder={t('form.namePlaceholder')}
        maxLength={MAX_NAME_LENGTH}
      />
      <p className="hint">{t('form.nameHint')}</p>
      {/* On validation error: */}
      <p className="error">{t('validation.nameMaxLength', { max: MAX_NAME_LENGTH })}</p>
    </form>
  );
}
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered in component update tasks | Medium | Low | Design with extensibility, add keys as needed |
| ICU syntax errors | Medium | Low | Validate with next-intl before committing |
| JSON parse errors | Low | High | Use jsonlint validation before committing |
| Key naming inconsistencies | Medium | Medium | Follow established conventions strictly |
| Overlap with common namespace | Low | Low | Use properties-specific keys, reference common for generic actions |

---

## Dependencies

### Required (Already Available)
- `next-intl` package installed (Epic 1)
- Translation files exist at `/messages/*.json` (Epic 1)
- IntlProvider configured in layout (Epic 1)
- Existing namespace structure (common, auth, dashboard, items, errors, language)

### This Task Enables
- Task 2F.2: Update PropertyForm component
- Task 2F.3: Update property modal components (PropertyEditModal, AddPropertyModal, PropertySection)
- Task 2F.4: Update property pages (/dashboard2/properties)
- Task 2F.5: Update PropertySelector component
- Task 2F.6: Generate translations for 5 non-English languages

---

## Story Points Summary

| Task | Story Points |
|------|--------------|
| Task 1: Create Root-Level Context Keys | 1 |
| Task 2: Create `properties.list` | 1 |
| Task 3: Create `properties.form` | 2 |
| Task 4: Create `properties.address` | 2 |
| Task 5: Create `properties.validation` (Variables) | 1 |
| Task 6: Create `properties.actions` | 1 |
| Task 7: Create `properties.modal` | 1 |
| Task 8: Create `properties.delete` (Variable) | 1 |
| Task 9: Create `properties.selector` | 1 |
| Task 10: Create `properties.status` | 1 |
| Task 11: Create `properties.errors` | 1 |
| Task 12: Create `properties.section` (Variable) | 1 |
| Task 13: Create `properties.counts` (ICU) | 1 |
| Task 14: Create `properties.types` | 1 |
| Task 15: Copy Structure to Other Language Files | 1 |
| Task 16: Validate Complete Implementation | 1 |
| **Total** | **18 SP** |

**Estimated Completion**: 1 day (tasks can be completed in a single editing session)

---

## Notes

### String Reusability

Some strings overlap with the `common` namespace and could be reused:
- Generic actions like "Cancel", "Save" -> Could use `common.cancel`, `common.save`
- Generic status like "Loading..." -> Could use `common.loading`

**Recommendation**: Include property-specific strings in the `properties` namespace for consistency. Components can use `properties` namespace for property-specific strings and fall back to `common` for truly generic UI elements when appropriate.

### Country Names

Country labels in dropdowns are handled via:
- Use `Intl.DisplayNames` API for browser-native localization (recommended)
- Only the placeholder "Select country..." needs translation

### Character Counters

The `{length}/{maxLength}` pattern used in forms (e.g., "23/100") is typically not translated as numbers are universal. The component can handle this directly.

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2F: Property Management
- [Overview Document](/docs/REQ-E02-085-create-properties-namespace-structure-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-085
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*End of Detailed Task Breakdown*
