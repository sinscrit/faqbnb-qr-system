# REQ-398: Create Properties Namespace Structure - Implementation Overview

**Last Modified:** 2026-01-19 00:00 UTC
**Request ID:** REQ-398
**Type:** NEW FEATURE
**Size:** S (Small)
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.1
**Priority:** Sixth (per Epic 2 recommended order)

---

## 1. Summary

Create a dedicated `properties` namespace structure within all six supported language message files (`en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `nl.json`) to provide a foundation for localizing the property management UI. This namespace will contain translation keys for property listing, property forms, property modals, property selection, and property-related feedback messages.

---

## 2. Current State Analysis

### 2.1 Existing Message File Structure

The current `/messages/en.json` contains these namespaces:
- `common` - General UI actions and labels
- `auth` - Authentication-related strings
- `dashboard` - Dashboard UI strings
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selection strings

**Missing:** No dedicated `properties` namespace exists for property management UI strings. Some property-related strings exist in `dashboard` namespace but lack comprehensive coverage.

### 2.2 Related Components Requiring Translation

Based on codebase analysis, these components will consume the `properties` namespace:

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| PropertyForm | `/src/components/PropertyForm.tsx` | ~40 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~30 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~30 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | ~25 |
| PropertySelector | `/src/components/PropertySelector.tsx` | ~20 |
| PropertySearchBar | `/src/components/SimpleDashboard/PropertySearchBar.tsx` | ~15 |
| PropertyGroupingControl | `/src/components/SimpleDashboard/PropertyGroupingControl.tsx` | ~10 |
| PropertyFilter | `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | ~15 |
| PropertyDropdown | `/src/components/dashboard/PropertyDropdown.tsx` | ~15 |

**Estimated Total:** ~200 strings (per Implementation Plan)

### 2.3 Hardcoded Strings Identified

From component analysis, the following hardcoded strings need translation:

**PropertyForm.tsx:**
- "Edit Property" / "Create New Property"
- "Property Owner"
- "Select property owner..."
- "Property owner cannot be changed after creation"
- "Property Nickname"
- "e.g., Main Office, Home, Vacation House"
- "A friendly name to identify this property"
- "Property Type"
- "Select property type..."
- "Address"
- "(Optional)"
- "e.g., 123 Main St, Anytown, State 12345"
- "Physical address or location description"
- "Cancel"
- "Updating..." / "Creating..."
- "Update Property" / "Create Property"

**PropertyEditModal.tsx / AddPropertyModal.tsx:**
- "Edit Property" / "Add New Property"
- "Edit the details of your property including name and address information."
- "Create a new property by entering the name and address information."
- "Property Name"
- "e.g., Beach House"
- "Address Line 1" / "Address Line 2"
- "Street address"
- "Apt, suite, unit, etc. (optional)"
- "City"
- "State/Province"
- "Postal Code"
- "ZIP / Postal code"
- "Country"
- "Select country..."
- "Cancel"
- "Save Changes" / "Create Property"
- "Saving..." / "Creating..."
- Validation messages

**PropertySection.tsx:**
- "My Property" / "My Properties"
- "Let's add your property"
- "A property is where your items live - like a vacation rental or home."
- "Add Property"
- "Add New Property"
- "Edit property: {name}"
- Item/room count labels

**PropertySelector.tsx:**
- "Property Filter"
- "Filter analytics data by property"
- "All Properties"
- "Loading properties..."
- "No properties available"

### 2.4 Existing Translation Pattern

The project uses `next-intl` with this established pattern:

```typescript
// Client components
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  return <span>{t('key')}</span>;
}
```

Reference implementation: `/src/components/LogoutButton.tsx` (lines 7, 26-27, 69)

---

## 3. Implementation Requirements

### 3.1 Namespace Structure

The `properties` namespace must include the following sub-sections as specified in the Implementation Plan:

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
      "itemCount": "{count} {count, plural, one {item} other {items}}",
      "roomCount": "{count} {count, plural, one {room} other {rooms}}",
      "loading": "Loading properties"
    },
    "form": {
      "name": "Property Name",
      "namePlaceholder": "e.g., Beach House, Downtown Apartment",
      "nameHint": "A friendly name to identify this property",
      "nickname": "Property Nickname",
      "nicknamePlaceholder": "e.g., Main Office, Home, Vacation House",
      "address": "Address",
      "addressPlaceholder": "Enter property address",
      "addressHint": "Physical address or location description",
      "addressLine1": "Address Line 1",
      "addressLine1Placeholder": "Street address",
      "addressLine2": "Address Line 2",
      "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
      "city": "City",
      "cityPlaceholder": "City",
      "state": "State/Province",
      "statePlaceholder": "State or Province",
      "postalCode": "Postal Code",
      "postalCodePlaceholder": "ZIP / Postal code",
      "country": "Country",
      "countryPlaceholder": "Select country...",
      "type": "Property Type",
      "typePlaceholder": "Select property type...",
      "owner": "Property Owner",
      "ownerPlaceholder": "Select property owner...",
      "ownerCannotChange": "Property owner cannot be changed after creation",
      "optional": "(Optional)",
      "required": "(Required)",
      "characterCount": "{current}/{max}"
    },
    "types": {
      "apartment": "Apartment",
      "house": "House",
      "condo": "Condo",
      "townhouse": "Townhouse",
      "cabin": "Cabin",
      "villa": "Villa",
      "other": "Other"
    },
    "actions": {
      "add": "Add Property",
      "addNew": "Add New Property",
      "edit": "Edit Property",
      "delete": "Delete Property",
      "view": "View Property",
      "create": "Create Property",
      "update": "Update Property",
      "saveChanges": "Save Changes",
      "cancel": "Cancel"
    },
    "modal": {
      "addTitle": "Add New Property",
      "addDescription": "Create a new property by entering the name and address information.",
      "editTitle": "Edit Property",
      "editDescription": "Edit the details of your property including name and address information.",
      "closeLabel": "Close modal"
    },
    "status": {
      "saving": "Saving...",
      "creating": "Creating...",
      "updating": "Updating...",
      "deleting": "Deleting...",
      "savingProperty": "Saving property",
      "creatingProperty": "Creating property"
    },
    "delete": {
      "title": "Delete Property",
      "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
      "confirm": "Delete Property"
    },
    "selector": {
      "title": "Property Filter",
      "description": "Filter analytics data by property",
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "unassigned": "Unassigned",
      "noProperties": "No properties available",
      "loading": "Loading properties...",
      "ariaLabel": "Select property for analytics filtering"
    },
    "empty": {
      "title": "Let's add your property",
      "description": "A property is where your items live - like a vacation rental or home.",
      "noPropertiesYet": "No properties yet",
      "addFirst": "Add your first property to organize your items"
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
    "errors": {
      "loadFailed": "Failed to load properties",
      "saveFailed": "Failed to save property",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "notFound": "Property not found",
      "generic": "Failed to save property. Please try again."
    },
    "aria": {
      "editProperty": "Edit property: {name}",
      "addNewProperty": "Add a new property",
      "propertyOptions": "Property options"
    }
  }
}
```

### 3.2 Key Naming Convention

Following the established convention from the Implementation Plan:
```
{namespace}.{component/area}.{element}.{variant?}
```

Examples:
- `properties.form.name`
- `properties.list.empty.title`
- `properties.validation.nameRequired`
- `properties.selector.allProperties`

---

## 4. Implementation Tasks

### Task 1: Add Properties Namespace to English Message File
**File:** `/messages/en.json`
**Action:** Add the complete `properties` namespace structure with English translations

### Task 2: Add Properties Namespace to French Message File
**File:** `/messages/fr.json`
**Action:** Add the `properties` namespace with French translations

### Task 3: Add Properties Namespace to Spanish Message File
**File:** `/messages/es.json`
**Action:** Add the `properties` namespace with Spanish translations

### Task 4: Add Properties Namespace to German Message File
**File:** `/messages/de.json`
**Action:** Add the `properties` namespace with German translations

### Task 5: Add Properties Namespace to Dutch Message File
**File:** `/messages/nl.json`
**Action:** Add the `properties` namespace with Dutch translations

### Task 6: Add Properties Namespace to Italian Message File
**File:** `/messages/it.json`
**Action:** Add the `properties` namespace with Italian translations

---

## 5. Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | ADD | Add `properties` namespace with English translations |
| `/messages/fr.json` | ADD | Add `properties` namespace with French translations |
| `/messages/es.json` | ADD | Add `properties` namespace with Spanish translations |
| `/messages/de.json` | ADD | Add `properties` namespace with German translations |
| `/messages/nl.json` | ADD | Add `properties` namespace with Dutch translations |
| `/messages/it.json` | ADD | Add `properties` namespace with Italian translations |

### Files NOT to Modify

The following files should NOT be modified as part of this task (they will be updated in subsequent tasks):
- `/src/components/PropertyForm.tsx`
- `/src/components/PropertySelector.tsx`
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- `/src/components/SimpleDashboard/PropertySection.tsx`
- `/src/components/SimpleDashboard/PropertySearchBar.tsx`
- `/src/components/SimpleDashboard/PropertyGroupingControl.tsx`
- `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
- `/src/components/dashboard/PropertyDropdown.tsx`
- `/src/app/dashboard2/properties/**/*.tsx`

---

## 6. Acceptance Criteria

Based on REQ-398 specification:

- [ ] English (en) translation file contains new properties namespace with initial structure
- [ ] German (de) translation file contains properties namespace matching English structure
- [ ] Spanish (es) translation file contains properties namespace matching English structure
- [ ] French (fr) translation file contains properties namespace matching English structure
- [ ] Italian (it) translation file contains properties namespace matching English structure
- [ ] Dutch (nl) translation file contains properties namespace matching English structure
- [ ] Namespace structure includes logical sections for organizing property management strings
- [ ] Structure follows established patterns from existing namespaces for consistency
- [ ] All translation files maintain valid JSON structure without syntax errors
- [ ] Namespace includes placeholder keys that demonstrate the organizational structure
- [ ] Structure accommodates future property features without requiring reorganization

---

## 7. Technical Considerations

### 7.1 Variable Interpolation

Several keys require variable interpolation using ICU message format:
- `properties.list.itemCount` - `{count}` placeholder with pluralization
- `properties.list.roomCount` - `{count}` placeholder with pluralization
- `properties.form.characterCount` - `{current}` and `{max}` placeholders
- `properties.delete.message` - `{name}` placeholder
- `properties.validation.*MaxLength` - `{max}` placeholder
- `properties.aria.editProperty` - `{name}` placeholder

Usage patterns:
```typescript
t('list.itemCount', { count: 5 })  // "5 items"
t('delete.message', { name: 'Beach House' })  // "Are you sure you want to delete "Beach House"?"
t('validation.nameMaxLength', { max: 100 })  // "Property name must be 100 characters or less"
```

### 7.2 Pluralization

The following keys use ICU plural format:
```json
{
  "itemCount": "{count} {count, plural, one {item} other {items}}",
  "roomCount": "{count} {count, plural, one {room} other {rooms}}"
}
```

### 7.3 JSON Structure Validation

Ensure proper JSON syntax:
- No trailing commas
- Proper nesting
- Consistent quote usage (double quotes)
- Escaped special characters where needed

### 7.4 Translation Quality

For non-English translations:
- Use context-aware AI translation (Claude/OpenAI as specified in Implementation Plan)
- Maintain consistent terminology across languages
- Preserve variable placeholders exactly as in English source
- Account for text expansion in languages like German and French (~40% longer)

---

## 8. Dependencies

### 8.1 Prerequisites
- Epic 1 foundation complete (next-intl installed and configured) - **VERIFIED**
- Message files exist for all 6 languages - **VERIFIED**
- Existing namespace patterns established (common, auth, dashboard, items) - **VERIFIED**

### 8.2 Dependent Tasks
The following Sub-Epic 2F tasks depend on this namespace being in place:
- Task 2F.2: Update PropertyForm
- Task 2F.3: Update property modals (PropertyEditModal, AddPropertyModal)
- Task 2F.4: Update property pages
- Task 2F.5: Update PropertySelector
- Task 2F.6: Generate translations for 5 non-English languages

---

## 9. Testing Verification

After implementation, verify:

1. **Structure Validation:**
   ```bash
   # Validate JSON syntax for all message files
   node -e "require('./messages/en.json')"
   node -e "require('./messages/fr.json')"
   node -e "require('./messages/es.json')"
   node -e "require('./messages/de.json')"
   node -e "require('./messages/nl.json')"
   node -e "require('./messages/it.json')"
   ```

2. **Key Consistency Check:**
   - Compare key structures across all 6 language files
   - Ensure identical key paths exist in all files

3. **Build Verification:**
   ```bash
   npm run build
   ```

4. **Properties Namespace Access Test:**
   ```typescript
   // Verify namespace is accessible
   import messages from '@/messages/en.json';
   console.log(messages.properties.title); // Should output "Properties"
   ```

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| English namespace creation | 20 min |
| French translations | 15 min |
| Spanish translations | 15 min |
| German translations | 15 min |
| Dutch translations | 15 min |
| Italian translations | 15 min |
| Validation and testing | 15 min |
| **Total** | **~110 min** |

---

## 11. Country Labels Consideration

The PropertyEditModal and AddPropertyModal components include a country dropdown with hardcoded country labels:
- "Select country..."
- "United States", "Canada", "United Kingdom", etc.

**Recommendation:** Country names should ideally be translated. However, this may be handled separately or left as display names that don't require translation (as they are proper nouns). For this task, focus on the core property management strings. Country label translations can be added in a follow-up task if needed.

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Existing Translation Pattern](/src/components/LogoutButton.tsx)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
