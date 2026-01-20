# Implementation Overview: REQ-E02-009 - Update Property Modal Components with Localized Strings

**Document Created:** 2026-01-20 19:15:00 UTC
**Last Modified:** 2026-01-20 19:15:00 UTC

**Request ID:** REQ-E02-009
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.3
**Size:** M (Medium)
**Priority:** P2

---

## 1. Summary

Update all property modal components to use localized translation references instead of hardcoded English strings. This task covers three primary modal components: `AddPropertyModal`, `PropertyEditModal`, and the delete confirmation modal within `PropertiesManagement`. These components contain approximately 60-70 hardcoded strings including modal titles, field labels, placeholders, validation messages, button labels, accessibility labels, loading states, and confirmation messages.

---

## 2. Current State Analysis

### 2.1 Components to Update

| Component | File Path | Estimated Strings | Lines |
|-----------|-----------|-------------------|-------|
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~30 | 537 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~30 | 561 |
| PropertiesManagement (delete modal) | `/src/components/PropertiesManagement.tsx` | ~15 | 571 |

**Total Estimated Strings:** ~75 unique strings (some shared between modals)

### 2.2 Hardcoded Strings Inventory

#### 2.2.1 AddPropertyModal.tsx Strings

| Category | String | Location (Line) | Translation Key |
|----------|--------|-----------------|-----------------|
| **Modal Title** | "Add New Property" | 372 | `properties.modals.add.title` |
| **Description (SR)** | "Create a new property by entering the name and address information." | 374-375 | `properties.modals.add.description` |
| **Labels** | "Property Name" | 417 | `properties.form.labels.name` |
| **Labels** | "Address Line 1" | 424 | `properties.form.labels.addressLine1` |
| **Labels** | "Address Line 2" | 430 | `properties.form.labels.addressLine2` |
| **Labels** | "City" | 437 | `properties.form.labels.city` |
| **Labels** | "State/Province" | 441 | `properties.form.labels.stateProvince` |
| **Labels** | "Postal Code" | 449 | `properties.form.labels.postalCode` |
| **Labels** | "Country" | 456 | `properties.form.labels.country` |
| **Placeholders** | "e.g., Beach House" | 420 | `properties.form.placeholders.name` |
| **Placeholders** | "Street address" | 425 | `properties.form.placeholders.addressLine1` |
| **Placeholders** | "Apt, suite, unit, etc. (optional)" | 431 | `properties.form.placeholders.addressLine2` |
| **Placeholders** | "City" | 438 | `properties.form.placeholders.city` |
| **Placeholders** | "State or Province" | 442 | `properties.form.placeholders.stateProvince` |
| **Placeholders** | "ZIP / Postal code" | 450 | `properties.form.placeholders.postalCode` |
| **Placeholders** | "Select country..." | 20 (COUNTRIES array) | `properties.form.placeholders.selectCountry` |
| **Validation** | "Property name is required" | 97 | `properties.form.validation.nameRequired` |
| **Validation** | "Property name must be 100 characters or less" | 99 | `properties.form.validation.nameTooLong` |
| **Validation** | "Address must be 200 characters or less" | 104 | `properties.form.validation.addressTooLong` |
| **Validation** | "City must be 100 characters or less" | 114 | `properties.form.validation.cityTooLong` |
| **Validation** | "State/Province must be 100 characters or less" | 119 | `properties.form.validation.stateTooLong` |
| **Validation** | "Postal code must be 20 characters or less" | 124 | `properties.form.validation.postalCodeTooLong` |
| **Validation** | "Please select a valid country" | 129 | `properties.form.validation.invalidCountry` |
| **Error** | "Failed to create property" | 240, 248 | `properties.modals.add.errors.createFailed` |
| **Loading (SR)** | "Creating property..." | 400 | `properties.modals.add.status.creating` |
| **Loading (SR)** | "Creating property" | 525 | `properties.modals.add.status.creatingLabel` |
| **Buttons** | "Cancel" | 505 | `common.cancel` |
| **Buttons** | "Creating..." | 526 | `properties.modals.add.actions.creating` |
| **Buttons** | "Create Property" | 529 | `properties.modals.add.actions.create` |
| **Accessibility** | "Close modal" | 389 | `common.closeModal` |

#### 2.2.2 PropertyEditModal.tsx Strings

| Category | String | Location (Line) | Translation Key |
|----------|--------|-----------------|-----------------|
| **Modal Title** | "Edit Property" | 396 | `properties.modals.edit.title` |
| **Description (SR)** | "Edit the details of your property including name and address information." | 398-399 | `properties.modals.edit.description` |
| **Labels** | (Same as AddPropertyModal) | Various | (Shared keys) |
| **Placeholders** | (Same as AddPropertyModal) | Various | (Shared keys) |
| **Validation** | (Same as AddPropertyModal) | Various | (Shared keys) |
| **Error** | "Failed to update property" | 264, 272 | `properties.modals.edit.errors.updateFailed` |
| **Loading (SR)** | "Saving property changes..." | 424 | `properties.modals.edit.status.saving` |
| **Loading (SR)** | "Saving property" | 549 | `properties.modals.edit.status.savingLabel` |
| **Buttons** | "Cancel" | 529 | `common.cancel` |
| **Buttons** | "Saving..." | 550 | `properties.modals.edit.actions.saving` |
| **Buttons** | "Save Changes" | 553 | `properties.modals.edit.actions.save` |
| **Accessibility** | "Close modal" | 413 | `common.closeModal` |

#### 2.2.3 PropertiesManagement.tsx Delete Modal Strings

| Category | String | Location (Line) | Translation Key |
|----------|--------|-----------------|-----------------|
| **Modal Title** | "Delete Property" | 544 | `properties.modals.delete.title` |
| **Confirmation** | "Are you sure you want to delete the property \"{propertyToDelete.nickname}\"?" | 545-546 | `properties.modals.delete.confirmation` |
| **Warning** | "This action cannot be undone." | 547 | `properties.modals.delete.warning` |
| **Buttons** | "Cancel" | 554 | `common.cancel` |
| **Buttons** | "Deleting..." | 562 | `properties.modals.delete.actions.deleting` |
| **Buttons** | "Delete" | 562 | `properties.modals.delete.actions.delete` |

#### 2.2.4 Country Labels (Shared)

Both AddPropertyModal and PropertyEditModal contain a COUNTRIES array with 25 country labels that need localization:

| Country Code | Current Label | Translation Key |
|--------------|---------------|-----------------|
| '' | "Select country..." | `properties.form.placeholders.selectCountry` |
| US | "United States" | `countries.US` |
| CA | "Canada" | `countries.CA` |
| GB | "United Kingdom" | `countries.GB` |
| AU | "Australia" | `countries.AU` |
| DE | "Germany" | `countries.DE` |
| FR | "France" | `countries.FR` |
| ES | "Spain" | `countries.ES` |
| IT | "Italy" | `countries.IT` |
| JP | "Japan" | `countries.JP` |
| MX | "Mexico" | `countries.MX` |
| BR | "Brazil" | `countries.BR` |
| NL | "Netherlands" | `countries.NL` |
| BE | "Belgium" | `countries.BE` |
| CH | "Switzerland" | `countries.CH` |
| AT | "Austria" | `countries.AT` |
| SE | "Sweden" | `countries.SE` |
| NO | "Norway" | `countries.NO` |
| DK | "Denmark" | `countries.DK` |
| FI | "Finland" | `countries.FI` |
| IE | "Ireland" | `countries.IE` |
| PT | "Portugal" | `countries.PT` |
| NZ | "New Zealand" | `countries.NZ` |
| SG | "Singapore" | `countries.SG` |
| HK | "Hong Kong" | `countries.HK` |

---

## 3. Technical Approach

### 3.1 Translation Pattern

Following the established pattern from Epic 1:

```typescript
// Import at top of file
import { useTranslations } from 'next-intl';

// Inside component function
const t = useTranslations('properties');
const tCommon = useTranslations('common');
const tCountries = useTranslations('countries');
```

### 3.2 Namespace Structure

Add to `/messages/en.json` under the `properties` namespace:

```json
{
  "properties": {
    "form": {
      "labels": {
        "name": "Property Name",
        "addressLine1": "Address Line 1",
        "addressLine2": "Address Line 2",
        "city": "City",
        "stateProvince": "State/Province",
        "postalCode": "Postal Code",
        "country": "Country"
      },
      "placeholders": {
        "name": "e.g., Beach House",
        "addressLine1": "Street address",
        "addressLine2": "Apt, suite, unit, etc. (optional)",
        "city": "City",
        "stateProvince": "State or Province",
        "postalCode": "ZIP / Postal code",
        "selectCountry": "Select country..."
      },
      "validation": {
        "nameRequired": "Property name is required",
        "nameTooLong": "Property name must be 100 characters or less",
        "addressTooLong": "Address must be 200 characters or less",
        "cityTooLong": "City must be 100 characters or less",
        "stateTooLong": "State/Province must be 100 characters or less",
        "postalCodeTooLong": "Postal code must be 20 characters or less",
        "invalidCountry": "Please select a valid country"
      },
      "characterCount": "{count}/{max}"
    },
    "modals": {
      "add": {
        "title": "Add New Property",
        "description": "Create a new property by entering the name and address information.",
        "status": {
          "creating": "Creating property...",
          "creatingLabel": "Creating property"
        },
        "actions": {
          "create": "Create Property",
          "creating": "Creating..."
        },
        "errors": {
          "createFailed": "Failed to create property"
        }
      },
      "edit": {
        "title": "Edit Property",
        "description": "Edit the details of your property including name and address information.",
        "status": {
          "saving": "Saving property changes...",
          "savingLabel": "Saving property"
        },
        "actions": {
          "save": "Save Changes",
          "saving": "Saving..."
        },
        "errors": {
          "updateFailed": "Failed to update property"
        }
      },
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
  },
  "countries": {
    "US": "United States",
    "CA": "Canada",
    "GB": "United Kingdom",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "ES": "Spain",
    "IT": "Italy",
    "JP": "Japan",
    "MX": "Mexico",
    "BR": "Brazil",
    "NL": "Netherlands",
    "BE": "Belgium",
    "CH": "Switzerland",
    "AT": "Austria",
    "SE": "Sweden",
    "NO": "Norway",
    "DK": "Denmark",
    "FI": "Finland",
    "IE": "Ireland",
    "PT": "Portugal",
    "NZ": "New Zealand",
    "SG": "Singapore",
    "HK": "Hong Kong"
  },
  "common": {
    "closeModal": "Close modal"
  }
}
```

### 3.3 String Interpolation

For dynamic content like property names and character counts, use ICU format:

```typescript
// Delete confirmation with property name
t('modals.delete.confirmation', { name: propertyToDelete.nickname })

// Character count display
t('form.characterCount', { count: value.length, max: options.maxLength })
```

### 3.4 Country Dropdown Refactoring

The COUNTRIES array should be refactored to use translation keys:

```typescript
// Before
const COUNTRIES = [
  { code: '', label: 'Select country...' },
  { code: 'US', label: 'United States' },
  // ...
];

// After
const COUNTRY_CODES = ['', 'US', 'CA', 'GB', 'AU', ...] as const;

// In component
const tCountries = useTranslations('countries');
const t = useTranslations('properties');

const getCountryLabel = (code: string) => {
  if (!code) return t('form.placeholders.selectCountry');
  return tCountries(code);
};
```

### 3.5 Shared Form Field Helper

The `renderTextField` helper function should be updated to accept translation keys:

```typescript
// Before
renderTextField('name', 'Property Name', formData.name, {
  required: true,
  maxLength: 100,
  placeholder: 'e.g., Beach House',
})

// After
renderTextField('name', t('form.labels.name'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('form.placeholders.name'),
})
```

---

## 4. Implementation Tasks

### Task 1: Add Translation Keys to Messages File
- Add `properties.form` namespace with labels, placeholders, validation
- Add `properties.modals` namespace with add, edit, delete sections
- Add `countries` namespace with all 24 country names
- Add `common.closeModal` key if not existing
- Update all 6 language files with the same structure

### Task 2: Update AddPropertyModal Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hooks: `t` for properties, `tCommon` for common, `tCountries` for countries
- Replace modal title and description strings
- Update `renderTextField` calls with translated labels and placeholders
- Replace validation messages in `validateForm()` function
- Update country dropdown to use translation function
- Replace button labels including loading states
- Update accessibility labels
- Update error handling messages

### Task 3: Update PropertyEditModal Component
- Apply same changes as AddPropertyModal
- Ensure shared translation keys are used for form fields
- Update edit-specific strings (title, description, save button)
- Update loading state messages

### Task 4: Update PropertiesManagement Delete Modal
- Import `useTranslations` from 'next-intl'
- Replace delete modal title
- Replace confirmation message with interpolation for property name
- Replace warning text
- Replace button labels including loading states

### Task 5: Verify Build and Functionality
- Run TypeScript compilation to ensure no type errors
- Run build to verify no missing translation keys
- Test add property modal in all supported languages
- Test edit property modal in all supported languages
- Test delete confirmation in all supported languages
- Verify character count displays correctly
- Verify validation messages display correctly
- Verify country dropdown displays correctly in all languages

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add property modal | Add imports, replace hardcoded strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Edit property modal | Add imports, replace hardcoded strings |
| `/src/components/PropertiesManagement.tsx` | Property list with delete modal | Add imports, replace delete modal strings |
| `/messages/en.json` | English translations | Add properties.modals and countries namespaces |
| `/messages/fr.json` | French translations | Add properties.modals and countries namespaces |
| `/messages/es.json` | Spanish translations | Add properties.modals and countries namespaces |
| `/messages/de.json` | German translations | Add properties.modals and countries namespaces |
| `/messages/nl.json` | Dutch translations | Add properties.modals and countries namespaces |
| `/messages/it.json` | Italian translations | Add properties.modals and countries namespaces |

### 5.2 Authorized Functions/Sections in AddPropertyModal.tsx

| Function/Section | Lines | Modification |
|------------------|-------|--------------|
| Import statements | 1-13 | Add `useTranslations` import |
| COUNTRIES array | 19-45 | Replace with COUNTRY_CODES constant |
| Component function start | 151-168 | Add translation hook initialization |
| `validateForm()` | 91-133 | Replace validation error strings |
| `handleSave()` error handling | 246-252 | Replace error message string |
| Dialog title and description | 367-375 | Replace with translation calls |
| Screen reader announcements | 398-401 | Replace with translation calls |
| `renderTextField()` calls | 416-485 | Replace label and placeholder strings |
| Country dropdown | 453-485 | Update to use translation function |
| Footer buttons | 489-531 | Replace button labels |

### 5.3 Authorized Functions/Sections in PropertyEditModal.tsx

| Function/Section | Lines | Modification |
|------------------|-------|--------------|
| Import statements | 1-13 | Add `useTranslations` import |
| COUNTRIES array | 19-45 | Replace with COUNTRY_CODES constant |
| Component function start | 176-194 | Add translation hook initialization |
| `validateForm()` | 115-157 | Replace validation error strings |
| `handleSave()` error handling | 270-276 | Replace error message string |
| Dialog title and description | 391-399 | Replace with translation calls |
| Screen reader announcements | 422-425 | Replace with translation calls |
| `renderTextField()` calls | 441-509 | Replace label and placeholder strings |
| Country dropdown | 478-508 | Update to use translation function |
| Footer buttons | 513-556 | Replace button labels |

### 5.4 Authorized Functions/Sections in PropertiesManagement.tsx

| Function/Section | Lines | Modification |
|------------------|-------|--------------|
| Import statements | 1-5 | Add `useTranslations` import |
| Component function start | 36-63 | Add translation hook initialization |
| Delete modal section | 539-568 | Replace all hardcoded strings |

### 5.5 Files NOT to Modify

- `/src/types/index.ts` - No type changes needed
- Any API routes
- Database migrations
- Other component files not listed above
- LoadingIndicator component (already using props for labels)

---

## 6. Dependencies

### 6.1 Epic 1 Dependencies (Must be Complete)

| Dependency | Status | Notes |
|------------|--------|-------|
| next-intl package installed | Required | Package must be in `package.json` |
| IntlProvider in layout.tsx | Required | Provider must wrap application |
| Messages files exist | Required | All 6 language files must exist |
| `useTranslations` hook working | Required | Must be functional in client components |

### 6.2 Related Epic 2 Tasks

| Task | Relationship | Notes |
|------|--------------|-------|
| 2F.1: Create properties namespace | Prerequisite | Namespace structure should exist |
| 2F.2: Update PropertyForm | Related | May share translation keys (form labels) |
| 2H.2: Extract button labels | Related | Uses `common.cancel`, `common.delete` |
| 2H.3: Extract modal/dialog strings | Related | Common modal patterns |

---

## 7. Acceptance Criteria

- [ ] All hardcoded strings in AddPropertyModal.tsx are replaced with translation function calls
- [ ] All hardcoded strings in PropertyEditModal.tsx are replaced with translation function calls
- [ ] Delete modal in PropertiesManagement.tsx uses translation function calls
- [ ] Translation keys are added to all 6 language files
- [ ] Modal titles display correctly in all languages
- [ ] All field labels display translated text
- [ ] All placeholder text displays translated text
- [ ] All validation messages display translated text
- [ ] Country dropdown displays translated country names
- [ ] Character count displays work correctly with interpolation
- [ ] Delete confirmation interpolates property name correctly
- [ ] Error messages display translated text
- [ ] Button labels display translated text (including loading states)
- [ ] Screen reader announcements are translated
- [ ] Close modal accessibility label is translated
- [ ] Modals render correctly in all 6 supported languages without layout issues
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No hardcoded English text remains in any property modal component

---

## 8. Testing Checklist

### 8.1 AddPropertyModal Testing
- [ ] Modal title displays correctly in all languages
- [ ] All field labels display correctly
- [ ] All placeholder text displays correctly
- [ ] Country dropdown shows translated country names
- [ ] Validation triggers and displays correct messages for each field
- [ ] Character count updates dynamically
- [ ] Create button shows loading state with translated text
- [ ] Cancel button works correctly
- [ ] Error messages display in correct language
- [ ] Screen reader announcements work correctly

### 8.2 PropertyEditModal Testing
- [ ] Modal title displays "Edit Property" correctly in all languages
- [ ] Pre-populated data displays correctly
- [ ] All field labels display correctly
- [ ] Country dropdown shows translated country names
- [ ] Validation triggers and displays correct messages
- [ ] Save button shows loading state with translated text
- [ ] Error messages display in correct language

### 8.3 Delete Modal Testing
- [ ] Modal title displays correctly in all languages
- [ ] Confirmation message includes property name
- [ ] Warning text displays correctly
- [ ] Delete button shows loading state with translated text
- [ ] Cancel button works correctly

### 8.4 Language Testing
- [ ] Test in English (en) - source language
- [ ] Test in French (fr)
- [ ] Test in Spanish (es)
- [ ] Test in German (de)
- [ ] Test in Dutch (nl)
- [ ] Test in Italian (it)

### 8.5 Visual Regression
- [ ] No text overflow in modal titles
- [ ] No text overflow in field labels
- [ ] No text overflow in placeholders
- [ ] No text overflow in buttons
- [ ] No text overflow in validation messages
- [ ] Country dropdown width accommodates longest translated name
- [ ] Modal layout remains consistent across languages
- [ ] Mobile drawer layout works correctly

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Medium | Build-time check, fallback to English |
| Text overflow in other languages | Medium | Low | Test with German (typically longest text) |
| Country name translations quality | Medium | Low | Use official country names from ISO standards |
| Translation hook not available | Low | High | Verify Epic 1 foundation complete |
| Breaking existing functionality | Low | Medium | Comprehensive testing after changes |
| Duplicate COUNTRIES array | Low | Low | Refactor to shared constant file |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 30 minutes |
| Update AddPropertyModal component | 45 minutes |
| Update PropertyEditModal component | 30 minutes (shares code with Add) |
| Update PropertiesManagement delete modal | 15 minutes |
| Copy translations to other 5 languages | 30 minutes |
| Testing and verification | 45 minutes |
| **Total** | **~3 hours** |

---

## 11. Code Examples

### 11.1 AddPropertyModal Before (Current State)

```tsx
<Dialog.Title
  id="add-property-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  Add New Property
</Dialog.Title>
<Dialog.Description id="add-property-modal-description" className="sr-only">
  Create a new property by entering the name and address information.
</Dialog.Description>
```

### 11.2 AddPropertyModal After (Translated)

```tsx
const t = useTranslations('properties');

// ...

<Dialog.Title
  id="add-property-modal-title"
  className="text-xl font-semibold text-[#222222]"
>
  {t('modals.add.title')}
</Dialog.Title>
<Dialog.Description id="add-property-modal-description" className="sr-only">
  {t('modals.add.description')}
</Dialog.Description>
```

### 11.3 Validation Before

```tsx
if (!trimmedName) {
  errors.name = 'Property name is required';
} else if (trimmedName.length > 100) {
  errors.name = 'Property name must be 100 characters or less';
}
```

### 11.4 Validation After

```tsx
// Note: For validation functions called outside the component render,
// consider passing translations as parameters or using a validation wrapper

// Option 1: Inline validation with translations
const trimmedName = data.name.trim();
if (!trimmedName) {
  errors.name = t('form.validation.nameRequired');
} else if (trimmedName.length > 100) {
  errors.name = t('form.validation.nameTooLong');
}
```

### 11.5 Country Dropdown Before

```tsx
const COUNTRIES = [
  { code: '', label: 'Select country...' },
  { code: 'US', label: 'United States' },
  // ...
];

// In render
{COUNTRIES.map((country) => (
  <option key={country.code} value={country.code}>
    {country.label}
  </option>
))}
```

### 11.6 Country Dropdown After

```tsx
const COUNTRY_CODES = ['', 'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'MX', 'BR', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'NZ', 'SG', 'HK'] as const;

// In component
const t = useTranslations('properties');
const tCountries = useTranslations('countries');

const getCountryLabel = (code: string) => {
  if (!code) return t('form.placeholders.selectCountry');
  return tCountries(code);
};

// In render
{COUNTRY_CODES.map((code) => (
  <option key={code} value={code}>
    {getCountryLabel(code)}
  </option>
))}
```

### 11.7 Delete Confirmation Before

```tsx
<p className="text-sm text-gray-600 mb-4">
  Are you sure you want to delete the property "{propertyToDelete.nickname}"?
  This action cannot be undone.
</p>
```

### 11.8 Delete Confirmation After

```tsx
<p className="text-sm text-gray-600 mb-4">
  {t('modals.delete.confirmation', { name: propertyToDelete.nickname })}
  {' '}{t('modals.delete.warning')}
</p>
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2F section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-009
- [Related Task: PropertyForm Overview](/docs/REQ-E02-008-update-propertyform-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern Example](/src/components/LogoutButton.tsx)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
