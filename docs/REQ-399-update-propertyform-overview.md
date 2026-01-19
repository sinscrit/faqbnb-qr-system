# REQ-399: Internationalize PropertyForm Component - Implementation Overview

**Created:** 2026-01-19 12:00:00 UTC
**Last Modified:** 2026-01-19 12:00:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #399
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.2
**Priority:** High (Second task in Sub-Epic 2F sequence)

---

## Executive Summary

This document provides the implementation breakdown for internationalizing the `PropertyForm` component located at `/src/components/PropertyForm.tsx`. The component contains approximately **40 hardcoded English strings** that need to be extracted and replaced with translation function calls using the `next-intl` framework. This includes form titles, field labels, placeholders, validation error messages, help text, button labels, and loading states.

The PropertyForm is used for both creating and editing properties, featuring:
- Dynamic form title based on create/edit mode
- Property owner dropdown (admin-only feature)
- Property nickname field with character counter
- Property type dropdown selector
- Optional address textarea with character counter
- Form validation with inline error messages
- Loading skeleton state
- Submit/Cancel action buttons with loading states

This task is part of Sub-Epic 2F (Property Management) and follows the foundation established by REQ-398 (Create properties namespace structure).

---

## Dependencies

### Prerequisites (Must Be Completed First)

| Dependency | Status | Description |
|------------|--------|-------------|
| **Epic 1: L10N Foundation** | Required | `next-intl` package installation, i18n configuration, IntlProvider setup |
| **Task 2H.1: Common Namespace** | Required | Base `common` namespace in `/messages/en.json` for shared strings like "Cancel" |
| **Task 2F.1: Properties Namespace (REQ-398)** | Required | `properties` namespace structure in `/messages/en.json` |

**Critical Blocker:** The `next-intl` package must be installed (Epic 1 foundation) and the `properties` namespace must exist in translation files before this task can be implemented.

### Package Dependencies

```json
{
  "next-intl": "^3.x" // Required from Epic 1
}
```

---

## Current State Analysis

### Component Location
`/src/components/PropertyForm.tsx` (291 lines)

### Component Type
- **React Type:** Client Component (`'use client'` directive)
- **Translation Method:** `useTranslations` hook from `next-intl`

### Component Structure
The PropertyForm is a form component with the following features:
- Form state management with `useState`
- Validation logic with inline error display
- Conditional admin-only user selection dropdown
- Dynamic form title (create vs edit mode)
- Character counters for text fields
- Loading skeleton during initial data fetch
- Form submission handling with loading states

### Identified Hardcoded Strings (~40 strings)

#### Form Title Section (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 143 | `"Edit Property"` | `properties.form.titleEdit` |
| 143 | `"Create New Property"` | `properties.form.titleCreate` |

#### General Error Section (1 string - dynamic)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 106 | `"Failed to save property. Please try again."` | `properties.form.errors.saveFailed` |

#### Property Owner Field - Admin Only (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 158 | `"Property Owner"` + `"*"` | `properties.form.ownerLabel` |
| 167 | `"Select property owner..."` | `properties.form.ownerPlaceholder` |
| 176 | `"Property owner cannot be changed after creation"` | `properties.form.ownerCannotChange` |

#### Property Nickname Field (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 185 | `"Property Nickname"` + `"*"` | `properties.form.nicknameLabel` |
| 193 | `"e.g., Main Office, Home, Vacation House"` | `properties.form.nicknamePlaceholder` |
| 34 | `"Property nickname is required"` | `properties.form.validation.nicknameRequired` |
| 36 | `"Property nickname must be 100 characters or less"` | `properties.form.validation.nicknameTooLong` |
| 203 | `"A friendly name to identify this property"` | `properties.form.nicknameHint` |

#### Property Type Field (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 209 | `"Property Type"` + `"*"` | `properties.form.typeLabel` |
| 221 | `"Select property type..."` | `properties.form.typePlaceholder` |
| 41 | `"Property type is required"` | `properties.form.validation.typeRequired` |

#### Address Field (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 235-236 | `"Address"` + `"(Optional)"` | `properties.form.addressLabel`, `common.optional` |
| 244 | `"e.g., 123 Main St, Anytown, State 12345"` | `properties.form.addressPlaceholder` |
| 46 | `"Address must be 500 characters or less"` | `properties.form.validation.addressTooLong` |
| 254 | `"Physical address or location description"` | `properties.form.addressHint` |

#### Submit Buttons (6 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 266 | `"Cancel"` | `common.cancel` |
| 279 | `"Updating..."` | `properties.form.buttons.updating` |
| 279 | `"Creating..."` | `properties.form.buttons.creating` |
| 282 | `"Update Property"` | `properties.form.buttons.update` |
| 282 | `"Create Property"` | `properties.form.buttons.create` |

#### Character Counters (2 dynamic strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 203 | `"({count}/100)"` | `properties.form.charCount` (with interpolation) |
| 254 | `"({count}/500)"` | `properties.form.charCount` (with interpolation) |

---

## Implementation Tasks

### Task 2F.2.1: Add next-intl Import and Hook Setup
**Effort:** 5 minutes

Add the `useTranslations` hook import and initialize translation instances:

```typescript
// Add import at top of file (after existing imports)
import { useTranslations } from 'next-intl';

// Inside PropertyForm component, at the start of the function body
const t = useTranslations('properties.form');
const tCommon = useTranslations('common');
```

### Task 2F.2.2: Update Form Title
**Effort:** 5 minutes

**Before:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-6">
  {property ? 'Edit Property' : 'Create New Property'}
</h2>
```

**After:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-6">
  {property ? t('titleEdit') : t('titleCreate')}
</h2>
```

### Task 2F.2.3: Update Validation Error Messages
**Effort:** 15 minutes

Update the `validateForm` function to use translated messages:

**Before:**
```typescript
const validateForm = (): boolean => {
  const newErrors: PropertyValidationErrors = {};

  // Nickname validation
  if (!formData.nickname.trim()) {
    newErrors.nickname = 'Property nickname is required';
  } else if (formData.nickname.trim().length > 100) {
    newErrors.nickname = 'Property nickname must be 100 characters or less';
  }

  // Property type validation
  if (!formData.propertyTypeId) {
    newErrors.propertyTypeId = 'Property type is required';
  }

  // Address validation (optional but if provided, must be reasonable length)
  if (formData.address && formData.address.length > 500) {
    newErrors.address = 'Address must be 500 characters or less';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**After:**
```typescript
const validateForm = (): boolean => {
  const newErrors: PropertyValidationErrors = {};

  // Nickname validation
  if (!formData.nickname.trim()) {
    newErrors.nickname = t('validation.nicknameRequired');
  } else if (formData.nickname.trim().length > 100) {
    newErrors.nickname = t('validation.nicknameTooLong');
  }

  // Property type validation
  if (!formData.propertyTypeId) {
    newErrors.propertyTypeId = t('validation.typeRequired');
  }

  // Address validation (optional but if provided, must be reasonable length)
  if (formData.address && formData.address.length > 500) {
    newErrors.address = t('validation.addressTooLong');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Task 2F.2.4: Update General Error Message
**Effort:** 5 minutes

**Before:**
```typescript
setErrors({
  general: error instanceof Error ? error.message : 'Failed to save property. Please try again.'
});
```

**After:**
```typescript
setErrors({
  general: error instanceof Error ? error.message : t('errors.saveFailed')
});
```

### Task 2F.2.5: Update Property Owner Field (Admin Section)
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
  Property Owner <span className="text-red-500">*</span>
</label>
<select
  id="userId"
  ...
>
  <option value="">Select property owner...</option>
  {users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.full_name || user.email} ({user.email})
    </option>
  ))}
</select>
{property && (
  <p className="mt-1 text-xs text-gray-500">
    Property owner cannot be changed after creation
  </p>
)}
```

**After:**
```tsx
<label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
  {t('ownerLabel')} <span className="text-red-500">*</span>
</label>
<select
  id="userId"
  ...
>
  <option value="">{t('ownerPlaceholder')}</option>
  {users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.full_name || user.email} ({user.email})
    </option>
  ))}
</select>
{property && (
  <p className="mt-1 text-xs text-gray-500">
    {t('ownerCannotChange')}
  </p>
)}
```

### Task 2F.2.6: Update Property Nickname Field
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
  Property Nickname <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="nickname"
  ...
  placeholder="e.g., Main Office, Home, Vacation House"
  ...
/>
{errors.nickname && (
  <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
)}
<p className="mt-1 text-xs text-gray-500">
  A friendly name to identify this property ({formData.nickname.length}/100)
</p>
```

**After:**
```tsx
<label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
  {t('nicknameLabel')} <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="nickname"
  ...
  placeholder={t('nicknamePlaceholder')}
  ...
/>
{errors.nickname && (
  <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
)}
<p className="mt-1 text-xs text-gray-500">
  {t('nicknameHint')} {t('charCount', { current: formData.nickname.length, max: 100 })}
</p>
```

### Task 2F.2.7: Update Property Type Field
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="propertyTypeId" className="block text-sm font-medium text-gray-700 mb-2">
  Property Type <span className="text-red-500">*</span>
</label>
<select
  id="propertyTypeId"
  ...
>
  <option value="">Select property type...</option>
  {propertyTypes.map((type) => (
    <option key={type.id} value={type.id}>
      {type.display_name}
    </option>
  ))}
</select>
```

**After:**
```tsx
<label htmlFor="propertyTypeId" className="block text-sm font-medium text-gray-700 mb-2">
  {t('typeLabel')} <span className="text-red-500">*</span>
</label>
<select
  id="propertyTypeId"
  ...
>
  <option value="">{t('typePlaceholder')}</option>
  {propertyTypes.map((type) => (
    <option key={type.id} value={type.id}>
      {type.display_name}
    </option>
  ))}
</select>
```

### Task 2F.2.8: Update Address Field
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
  Address <span className="text-gray-400">(Optional)</span>
</label>
<textarea
  id="address"
  rows={3}
  ...
  placeholder="e.g., 123 Main St, Anytown, State 12345"
  ...
/>
{errors.address && (
  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
)}
<p className="mt-1 text-xs text-gray-500">
  Physical address or location description ({formData.address.length}/500)
</p>
```

**After:**
```tsx
<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
  {t('addressLabel')} <span className="text-gray-400">({tCommon('optional')})</span>
</label>
<textarea
  id="address"
  rows={3}
  ...
  placeholder={t('addressPlaceholder')}
  ...
/>
{errors.address && (
  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
)}
<p className="mt-1 text-xs text-gray-500">
  {t('addressHint')} {t('charCount', { current: formData.address.length, max: 500 })}
</p>
```

### Task 2F.2.9: Update Form Action Buttons
**Effort:** 10 minutes

**Before:**
```tsx
<button
  type="button"
  onClick={handleCancel}
  disabled={isSubmitting}
  className="..."
>
  Cancel
</button>
<button
  type="submit"
  disabled={isSubmitting}
  className="..."
>
  {isSubmitting ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" ...>...</svg>
      {property ? 'Updating...' : 'Creating...'}
    </>
  ) : (
    property ? 'Update Property' : 'Create Property'
  )}
</button>
```

**After:**
```tsx
<button
  type="button"
  onClick={handleCancel}
  disabled={isSubmitting}
  className="..."
>
  {tCommon('cancel')}
</button>
<button
  type="submit"
  disabled={isSubmitting}
  className="..."
>
  {isSubmitting ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" ...>...</svg>
      {property ? t('buttons.updating') : t('buttons.creating')}
    </>
  ) : (
    property ? t('buttons.update') : t('buttons.create')
  )}
</button>
```

### Task 2F.2.10: Add Translation Keys to en.json
**Effort:** 15 minutes

Add the required keys to `/messages/en.json`. This task requires adding a new `properties` namespace (if not already created by REQ-398) with a `form` sub-namespace:

```json
{
  "properties": {
    "form": {
      "titleCreate": "Create New Property",
      "titleEdit": "Edit Property",
      "ownerLabel": "Property Owner",
      "ownerPlaceholder": "Select property owner...",
      "ownerCannotChange": "Property owner cannot be changed after creation",
      "nicknameLabel": "Property Nickname",
      "nicknamePlaceholder": "e.g., Main Office, Home, Vacation House",
      "nicknameHint": "A friendly name to identify this property",
      "typeLabel": "Property Type",
      "typePlaceholder": "Select property type...",
      "addressLabel": "Address",
      "addressPlaceholder": "e.g., 123 Main St, Anytown, State 12345",
      "addressHint": "Physical address or location description",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "Property nickname is required",
        "nicknameTooLong": "Property nickname must be 100 characters or less",
        "typeRequired": "Property type is required",
        "addressTooLong": "Address must be 500 characters or less"
      },
      "errors": {
        "saveFailed": "Failed to save property. Please try again."
      },
      "buttons": {
        "create": "Create Property",
        "update": "Update Property",
        "creating": "Creating...",
        "updating": "Updating..."
      }
    }
  }
}
```

### Task 2F.2.11: Add Translations to All Language Files
**Effort:** 30 minutes

Add the equivalent translation keys to all 5 non-English language files:
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

### Task 2F.2.12: Verify Component Rendering
**Effort:** 15 minutes

- Verify the component renders correctly after changes
- Confirm no TypeScript errors related to translation keys
- Test in development environment with default locale
- Test form validation triggers translated error messages
- Test character counters display correctly with interpolation
- Test both create mode and edit mode
- Test admin user selection dropdown (if admin access available)
- Verify loading skeleton still displays correctly

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/src/components/PropertyForm.tsx` | Edit | Add imports, replace hardcoded strings with t() calls |
| `/messages/en.json` | Edit | Add `properties.form` namespace keys |
| `/messages/fr.json` | Edit | Add `properties.form` namespace keys (French) |
| `/messages/es.json` | Edit | Add `properties.form` namespace keys (Spanish) |
| `/messages/de.json` | Edit | Add `properties.form` namespace keys (German) |
| `/messages/nl.json` | Edit | Add `properties.form` namespace keys (Dutch) |
| `/messages/it.json` | Edit | Add `properties.form` namespace keys (Italian) |

### Functions/Sections Authorized for Modification

| Function/Section | Location | Changes |
|------------------|----------|---------|
| `PropertyForm` component | Line 6-289 | Add `useTranslations` hook |
| `validateForm` function | Lines 29-51 | Replace validation error strings with t() calls |
| Error handling in `handleSubmit` | Lines 103-110 | Replace fallback error message with t() call |
| Form title h2 element | Line 142-144 | Replace title strings with t() calls |
| Property owner label and select | Lines 157-179 | Replace label, placeholder, and helper text |
| Property nickname label, input, hint | Lines 182-205 | Replace label, placeholder, hint text |
| Property type label and select | Lines 207-231 | Replace label and placeholder |
| Address label, textarea, hint | Lines 233-256 | Replace label, placeholder, hint text |
| Cancel button | Lines 260-267 | Replace text with tCommon() call |
| Submit button | Lines 268-284 | Replace button text and loading states |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Separate task (2F.3) |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Separate task (2F.3) |
| `/src/components/PropertySelector.tsx` | Separate task (2F.5) |
| `/src/app/dashboard2/properties/page.tsx` | Separate task (2F.4) |
| `/src/types/index.ts` | Types file - no UI strings |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation hook pattern | `useTranslations('properties.form')` + `useTranslations('common')` | Separate namespaces for domain-specific vs shared strings |
| Namespace structure | `properties.form.*` hierarchical | Clear separation between form fields, validation, errors, buttons |
| Character counter interpolation | `t('charCount', { current, max })` | ICU format for variable interpolation |
| "Optional" label | Use `tCommon('optional')` | Reuse common namespace string |
| "Cancel" button | Use `tCommon('cancel')` | Reuse common namespace string |
| Property type display_name | Keep untranslated | Database-driven values, not part of static UI translation |
| Console.error message | Keep as hardcoded English | Debug-only, not user-facing |

---

## Quality Checklist

### Pre-Implementation
- [ ] Verify Epic 1 foundation is complete (`next-intl` installed)
- [ ] Verify `/messages/en.json` exists with proper structure
- [ ] Verify `common` namespace exists with `cancel` and `optional` keys
- [ ] Verify REQ-398 (properties namespace structure) is complete or being implemented concurrently

### Implementation
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize `t` translation hook with `'properties.form'` namespace
- [ ] Initialize `tCommon` translation hook with `'common'` namespace
- [ ] Replace all hardcoded strings identified in this document
- [ ] Add all translation keys to `/messages/en.json`
- [ ] Add all translation keys to all 5 non-English language files
- [ ] Maintain existing component functionality
- [ ] Preserve all error handling behavior
- [ ] Preserve form validation logic

### Post-Implementation
- [ ] TypeScript compilation succeeds with no errors
- [ ] Component renders correctly in development
- [ ] Form title displays correctly for create mode
- [ ] Form title displays correctly for edit mode
- [ ] Property owner field displays translated label and placeholder (admin view)
- [ ] Property owner helper text displays correctly
- [ ] Property nickname field displays translated label, placeholder, hint
- [ ] Character counter displays correctly with current/max values
- [ ] Property type field displays translated label and placeholder
- [ ] Address field displays translated label, placeholder, hint
- [ ] Validation error messages display in correct language
- [ ] Cancel button shows translated text
- [ ] Submit button shows correct text for create vs edit mode
- [ ] Loading states show correct translated text
- [ ] No console errors related to missing translation keys
- [ ] Form submission works correctly (success and error cases)

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Import and hook setup | 5 min |
| Update form title | 5 min |
| Update validation messages | 15 min |
| Update general error message | 5 min |
| Update property owner field | 10 min |
| Update property nickname field | 10 min |
| Update property type field | 10 min |
| Update address field | 10 min |
| Update form action buttons | 10 min |
| Add translation keys to en.json | 15 min |
| Add translations to all language files | 30 min |
| Verification and testing | 15 min |
| **Total** | **~140 min (~2.5 hours)** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | Medium | Critical | Block task until Epic 1 foundation verified |
| REQ-398 properties namespace not ready | Medium | Medium | Can implement concurrently; namespace structure is simple |
| Missing translation keys at runtime | Low | Medium | Build-time key validation, fallback to key name |
| Character counter interpolation issues | Low | Low | Test ICU format syntax; next-intl handles interpolation well |
| Admin-only UI not tested | Medium | Low | Document admin feature; test with admin credentials if available |
| Form state not reset on language change | Low | Low | Standard behavior - form retains values on re-render |

---

## String Inventory Summary

| Category | Count | Notes |
|----------|-------|-------|
| Form titles | 2 | Create/Edit mode |
| Field labels | 4 | Owner, Nickname, Type, Address |
| Placeholders | 4 | All select/input fields |
| Helper/hint text | 4 | Owner restriction, field hints |
| Validation errors | 4 | Required fields + length limits |
| General errors | 1 | Save failed fallback |
| Buttons | 4 | Cancel, Create/Update, Creating/Updating |
| Character counter | 1 | With interpolation |
| Common reuse | 2 | cancel, optional |
| **Total unique strings** | **~26** | Plus 2 reused from common |

---

## Translation Key Relationship with Other Property Tasks

This task builds upon the `properties` namespace structure and complements other Property Management tasks:

| Document | Namespace Keys Added |
|----------|---------------------|
| REQ-398 (2F.1) | Base `properties` structure with list/actions/selector keys |
| **REQ-399 (this)** | `properties.form.*` - all PropertyForm-specific keys |
| REQ-400 (2F.3) | `properties.modal.*` - modal-specific keys (if separate from form) |
| REQ-401 (2F.4) | `properties.page.*` - properties list page keys |
| REQ-402 (2F.5) | `properties.selector.*` - property selector dropdown keys |

---

## References

- [REQ-399 Request Details](../gen_requests_epic2.md#req-399-update-propertyform-component-for-internationalization)
- [REQ-398: Properties Namespace Structure](./REQ-398-create-properties-namespace-structure-overview.md)
- [Implementation Plan: L10N Epic 2](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Implementation Plan: L10N Epic 1](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2F: Property Management](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2f-property-management)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2F Task 2F.2*
