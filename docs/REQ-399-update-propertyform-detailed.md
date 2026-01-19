# REQ-399: Update PropertyForm Component - Detailed Task Breakdown

**Created:** 2026-01-19 13:00:00 UTC
**Last Modified:** 2026-01-19 13:00:00 UTC
**Overview Reference:** REQ-399-update-propertyform-overview.md
**Request Reference:** gen_requests_epic2.md - Request #399
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.2
**Priority:** High

---

## Document Purpose

This document breaks down the PropertyForm internationalization task into granular, 1-story-point implementation tasks that can be executed sequentially by an AI coding agent or junior developer. Each task is atomic, testable, and includes explicit acceptance criteria.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies are complete:

- [ ] **Epic 1 Foundation**: `next-intl` package installed in `package.json`
- [ ] **i18n Configuration**: IntlProvider configured in app layout
- [ ] **Translation Files**: `/messages/en.json` exists with valid structure
- [ ] **Common Namespace**: `common.cancel` and `common.optional` keys exist
- [ ] **Task 2F.1 (REQ-398)**: `properties` namespace exists in translation files (can run concurrently)

---

## Task Inventory

| Task ID | Description | Depends On | Story Points |
|---------|-------------|------------|--------------|
| T1 | Add useTranslations import statement | Prerequisites | 1 |
| T2 | Initialize translation hooks in component | T1 | 1 |
| T3 | Replace form title strings | T2 | 1 |
| T4 | Replace validation error - nickname required | T2 | 1 |
| T5 | Replace validation error - nickname too long | T2 | 1 |
| T6 | Replace validation error - type required | T2 | 1 |
| T7 | Replace validation error - address too long | T2 | 1 |
| T8 | Replace general error message | T2 | 1 |
| T9 | Replace property owner field strings | T2 | 1 |
| T10 | Replace property nickname field strings | T2 | 1 |
| T11 | Replace property type field strings | T2 | 1 |
| T12 | Replace address field strings | T2 | 1 |
| T13 | Replace Cancel button text | T2 | 1 |
| T14 | Replace Submit button text (all states) | T2 | 1 |
| T15 | Add translation keys to en.json | T3-T14 | 1 |
| T16 | Add translation keys to fr.json | T15 | 1 |
| T17 | Add translation keys to es.json | T15 | 1 |
| T18 | Add translation keys to de.json | T15 | 1 |
| T19 | Add translation keys to nl.json | T15 | 1 |
| T20 | Add translation keys to it.json | T15 | 1 |
| T21 | Verify build and type checking | T20 | 1 |
| T22 | Manual testing verification | T21 | 1 |

**Total Story Points:** 22

---

## Detailed Task Specifications

### Task T1: Add useTranslations Import Statement

**Objective:** Add the next-intl import statement to PropertyForm.tsx

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Line 3):**
```typescript
import React, { useState, useEffect } from 'react';
```

**Target State:**
```typescript
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
```

**Implementation Steps:**
1. Open `/src/components/PropertyForm.tsx`
2. Locate the import statements section (lines 1-4)
3. Add the useTranslations import after the React import on line 3
4. Save the file

**Acceptance Criteria:**
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Import statement is placed after React imports
- [ ] No TypeScript errors on the import line
- [ ] File saves without syntax errors

**Verification Command:**
```bash
npx tsc --noEmit src/components/PropertyForm.tsx
```

---

### Task T2: Initialize Translation Hooks in Component

**Objective:** Add translation hook initialization at the start of the component function

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 6-12):**
```typescript
const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  propertyTypes,
  users,
  onSave,
  onCancel
}) => {
```

**Target State:**
```typescript
const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  propertyTypes,
  users,
  onSave,
  onCancel
}) => {
  // Translation hooks
  const t = useTranslations('properties.form');
  const tCommon = useTranslations('common');
```

**Implementation Steps:**
1. Locate the component function body start (after destructuring, before `// Form state` comment)
2. Add the two translation hook initializations:
   - `const t = useTranslations('properties.form');`
   - `const tCommon = useTranslations('common');`
3. Add a comment `// Translation hooks` above the hooks
4. Ensure hooks are placed before any useState calls (React hooks rules)

**Acceptance Criteria:**
- [ ] `t` hook initialized with `'properties.form'` namespace
- [ ] `tCommon` hook initialized with `'common'` namespace
- [ ] Hooks placed at the top of the component function body
- [ ] Hooks placed before useState hooks (React hooks order rule)
- [ ] No TypeScript errors

**Verification Command:**
```bash
npx tsc --noEmit src/components/PropertyForm.tsx
```

---

### Task T3: Replace Form Title Strings

**Objective:** Replace hardcoded form title strings with translation function calls

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 142-144):**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-6">
  {property ? 'Edit Property' : 'Create New Property'}
</h2>
```

**Target State:**
```tsx
<h2 className="text-xl font-semibold text-gray-900 mb-6">
  {property ? t('titleEdit') : t('titleCreate')}
</h2>
```

**Implementation Steps:**
1. Locate the h2 element around line 142-144
2. Replace `'Edit Property'` with `t('titleEdit')`
3. Replace `'Create New Property'` with `t('titleCreate')`
4. Ensure the ternary operator logic remains intact

**Acceptance Criteria:**
- [ ] `'Edit Property'` replaced with `t('titleEdit')`
- [ ] `'Create New Property'` replaced with `t('titleCreate')`
- [ ] Ternary condition `property ?` preserved
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.titleEdit` = "Edit Property"
- `properties.form.titleCreate` = "Create New Property"

---

### Task T4: Replace Validation Error - Nickname Required

**Objective:** Replace hardcoded nickname required validation message

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 33-34):**
```typescript
if (!formData.nickname.trim()) {
  newErrors.nickname = 'Property nickname is required';
}
```

**Target State:**
```typescript
if (!formData.nickname.trim()) {
  newErrors.nickname = t('validation.nicknameRequired');
}
```

**Implementation Steps:**
1. Locate the validateForm function (lines 29-51)
2. Find the nickname required validation (line 34)
3. Replace the hardcoded string with `t('validation.nicknameRequired')`

**Acceptance Criteria:**
- [ ] String replaced with `t('validation.nicknameRequired')`
- [ ] Validation logic unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `properties.form.validation.nicknameRequired` = "Property nickname is required"

---

### Task T5: Replace Validation Error - Nickname Too Long

**Objective:** Replace hardcoded nickname length validation message

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 35-36):**
```typescript
} else if (formData.nickname.trim().length > 100) {
  newErrors.nickname = 'Property nickname must be 100 characters or less';
}
```

**Target State:**
```typescript
} else if (formData.nickname.trim().length > 100) {
  newErrors.nickname = t('validation.nicknameTooLong');
}
```

**Implementation Steps:**
1. Locate the nickname length validation (line 36)
2. Replace the hardcoded string with `t('validation.nicknameTooLong')`

**Acceptance Criteria:**
- [ ] String replaced with `t('validation.nicknameTooLong')`
- [ ] Validation logic unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `properties.form.validation.nicknameTooLong` = "Property nickname must be 100 characters or less"

---

### Task T6: Replace Validation Error - Type Required

**Objective:** Replace hardcoded property type required validation message

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 40-41):**
```typescript
if (!formData.propertyTypeId) {
  newErrors.propertyTypeId = 'Property type is required';
}
```

**Target State:**
```typescript
if (!formData.propertyTypeId) {
  newErrors.propertyTypeId = t('validation.typeRequired');
}
```

**Implementation Steps:**
1. Locate the property type validation (line 41)
2. Replace the hardcoded string with `t('validation.typeRequired')`

**Acceptance Criteria:**
- [ ] String replaced with `t('validation.typeRequired')`
- [ ] Validation logic unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `properties.form.validation.typeRequired` = "Property type is required"

---

### Task T7: Replace Validation Error - Address Too Long

**Objective:** Replace hardcoded address length validation message

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 45-46):**
```typescript
if (formData.address && formData.address.length > 500) {
  newErrors.address = 'Address must be 500 characters or less';
}
```

**Target State:**
```typescript
if (formData.address && formData.address.length > 500) {
  newErrors.address = t('validation.addressTooLong');
}
```

**Implementation Steps:**
1. Locate the address length validation (line 46)
2. Replace the hardcoded string with `t('validation.addressTooLong')`

**Acceptance Criteria:**
- [ ] String replaced with `t('validation.addressTooLong')`
- [ ] Validation logic unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `properties.form.validation.addressTooLong` = "Address must be 500 characters or less"

---

### Task T8: Replace General Error Message

**Objective:** Replace hardcoded general save error message

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 105-107):**
```typescript
setErrors({
  general: error instanceof Error ? error.message : 'Failed to save property. Please try again.'
});
```

**Target State:**
```typescript
setErrors({
  general: error instanceof Error ? error.message : t('errors.saveFailed')
});
```

**Implementation Steps:**
1. Locate the error handling in handleSubmit (lines 103-110)
2. Find the general error fallback string (line 106)
3. Replace `'Failed to save property. Please try again.'` with `t('errors.saveFailed')`

**Acceptance Criteria:**
- [ ] Fallback string replaced with `t('errors.saveFailed')`
- [ ] Error instanceof check preserved
- [ ] API error messages still pass through unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `properties.form.errors.saveFailed` = "Failed to save property. Please try again."

---

### Task T9: Replace Property Owner Field Strings

**Objective:** Replace all hardcoded strings in the property owner field (admin section)

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 157-178):**
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
    ...
  ))}
</select>
{property && (
  <p className="mt-1 text-xs text-gray-500">
    Property owner cannot be changed after creation
  </p>
)}
```

**Target State:**
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
    ...
  ))}
</select>
{property && (
  <p className="mt-1 text-xs text-gray-500">
    {t('ownerCannotChange')}
  </p>
)}
```

**Implementation Steps:**
1. Locate the property owner section (lines 154-180)
2. Replace `Property Owner` in label (line 158) with `{t('ownerLabel')}`
3. Replace `Select property owner...` in option (line 167) with `{t('ownerPlaceholder')}`
4. Replace `Property owner cannot be changed after creation` (line 176) with `{t('ownerCannotChange')}`

**Acceptance Criteria:**
- [ ] Label text replaced with `{t('ownerLabel')}`
- [ ] Placeholder option replaced with `{t('ownerPlaceholder')}`
- [ ] Helper text replaced with `{t('ownerCannotChange')}`
- [ ] Required asterisk span preserved
- [ ] Conditional rendering logic preserved
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.ownerLabel` = "Property Owner"
- `properties.form.ownerPlaceholder` = "Select property owner..."
- `properties.form.ownerCannotChange` = "Property owner cannot be changed after creation"

---

### Task T10: Replace Property Nickname Field Strings

**Objective:** Replace all hardcoded strings in the property nickname field

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 184-205):**
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

**Target State:**
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

**Implementation Steps:**
1. Locate the nickname field section (lines 182-205)
2. Replace `Property Nickname` in label (line 185) with `{t('nicknameLabel')}`
3. Replace placeholder string (line 193) with `{t('nicknamePlaceholder')}`
4. Replace hint text and character counter (line 203):
   - Change `A friendly name to identify this property` to `{t('nicknameHint')}`
   - Change `({formData.nickname.length}/100)` to `{t('charCount', { current: formData.nickname.length, max: 100 })}`

**Acceptance Criteria:**
- [ ] Label text replaced with `{t('nicknameLabel')}`
- [ ] Placeholder replaced with `{t('nicknamePlaceholder')}`
- [ ] Hint text replaced with `{t('nicknameHint')}`
- [ ] Character counter uses interpolation with `current` and `max` params
- [ ] Required asterisk span preserved
- [ ] Error display logic unchanged
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.nicknameLabel` = "Property Nickname"
- `properties.form.nicknamePlaceholder` = "e.g., Main Office, Home, Vacation House"
- `properties.form.nicknameHint` = "A friendly name to identify this property"
- `properties.form.charCount` = "({current}/{max})"

---

### Task T11: Replace Property Type Field Strings

**Objective:** Replace all hardcoded strings in the property type field

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 209-231):**
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

**Target State:**
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

**Implementation Steps:**
1. Locate the property type field section (lines 207-231)
2. Replace `Property Type` in label (line 210) with `{t('typeLabel')}`
3. Replace `Select property type...` in option (line 221) with `{t('typePlaceholder')}`
4. **DO NOT** translate `type.display_name` - this is database-driven content

**Acceptance Criteria:**
- [ ] Label text replaced with `{t('typeLabel')}`
- [ ] Placeholder option replaced with `{t('typePlaceholder')}`
- [ ] Required asterisk span preserved
- [ ] `type.display_name` remains untranslated (database value)
- [ ] Error display logic unchanged
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.typeLabel` = "Property Type"
- `properties.form.typePlaceholder` = "Select property type..."

---

### Task T12: Replace Address Field Strings

**Objective:** Replace all hardcoded strings in the address field

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 235-256):**
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

**Target State:**
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

**Implementation Steps:**
1. Locate the address field section (lines 233-256)
2. Replace `Address` in label (line 235) with `{t('addressLabel')}`
3. Replace `(Optional)` in label (line 236) with `({tCommon('optional')})`
4. Replace placeholder string (line 244) with `{t('addressPlaceholder')}`
5. Replace hint text and character counter (line 254):
   - Change `Physical address or location description` to `{t('addressHint')}`
   - Change `({formData.address.length}/500)` to `{t('charCount', { current: formData.address.length, max: 500 })}`

**Acceptance Criteria:**
- [ ] Label text replaced with `{t('addressLabel')}`
- [ ] Optional indicator uses `{tCommon('optional')}`
- [ ] Placeholder replaced with `{t('addressPlaceholder')}`
- [ ] Hint text replaced with `{t('addressHint')}`
- [ ] Character counter uses interpolation with `current` and `max` params
- [ ] Error display logic unchanged
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.addressLabel` = "Address"
- `properties.form.addressPlaceholder` = "e.g., 123 Main St, Anytown, State 12345"
- `properties.form.addressHint` = "Physical address or location description"
- `common.optional` = "Optional" (already exists)

---

### Task T13: Replace Cancel Button Text

**Objective:** Replace hardcoded Cancel button text

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 260-267):**
```tsx
<button
  type="button"
  onClick={handleCancel}
  disabled={isSubmitting}
  className="..."
>
  Cancel
</button>
```

**Target State:**
```tsx
<button
  type="button"
  onClick={handleCancel}
  disabled={isSubmitting}
  className="..."
>
  {tCommon('cancel')}
</button>
```

**Implementation Steps:**
1. Locate the Cancel button (lines 260-267)
2. Replace `Cancel` text (line 266) with `{tCommon('cancel')}`

**Acceptance Criteria:**
- [ ] Button text replaced with `{tCommon('cancel')}`
- [ ] Uses common namespace (tCommon) not properties namespace
- [ ] Button attributes unchanged
- [ ] No syntax errors

**Translation Key Required:**
- `common.cancel` = "Cancel" (already exists)

---

### Task T14: Replace Submit Button Text (All States)

**Objective:** Replace all hardcoded submit button text including loading states

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State (Lines 268-284):**
```tsx
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

**Target State:**
```tsx
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

**Implementation Steps:**
1. Locate the submit button (lines 268-284)
2. Replace `'Updating...'` (line 279) with `t('buttons.updating')`
3. Replace `'Creating...'` (line 279) with `t('buttons.creating')`
4. Replace `'Update Property'` (line 282) with `t('buttons.update')`
5. Replace `'Create Property'` (line 282) with `t('buttons.create')`

**Acceptance Criteria:**
- [ ] `'Updating...'` replaced with `t('buttons.updating')`
- [ ] `'Creating...'` replaced with `t('buttons.creating')`
- [ ] `'Update Property'` replaced with `t('buttons.update')`
- [ ] `'Create Property'` replaced with `t('buttons.create')`
- [ ] Ternary conditions preserved
- [ ] Loading spinner SVG unchanged
- [ ] No syntax errors

**Translation Keys Required:**
- `properties.form.buttons.updating` = "Updating..."
- `properties.form.buttons.creating` = "Creating..."
- `properties.form.buttons.update` = "Update Property"
- `properties.form.buttons.create` = "Create Property"

---

### Task T15: Add Translation Keys to en.json

**Objective:** Add all required translation keys to the English translation file

**File to Modify:** `/messages/en.json`

**Target Addition:**
Add the following `properties` namespace to the JSON structure. This should be added as a new top-level key in the JSON object:

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

**Implementation Steps:**
1. Open `/messages/en.json`
2. Add the `properties` namespace as a new top-level key
3. Ensure valid JSON syntax (proper commas, brackets)
4. Verify the file parses correctly

**Acceptance Criteria:**
- [ ] `properties.form` namespace added with all required keys
- [ ] JSON file remains valid (no syntax errors)
- [ ] All 21 translation keys present
- [ ] Key structure matches component usage

**Verification Command:**
```bash
cat messages/en.json | jq .
```

---

### Task T16: Add Translation Keys to fr.json (French)

**Objective:** Add French translations for all PropertyForm keys

**File to Modify:** `/messages/fr.json`

**Target Addition:**
```json
{
  "properties": {
    "form": {
      "titleCreate": "Creer une nouvelle propriete",
      "titleEdit": "Modifier la propriete",
      "ownerLabel": "Proprietaire",
      "ownerPlaceholder": "Selectionner le proprietaire...",
      "ownerCannotChange": "Le proprietaire ne peut pas etre modifie apres la creation",
      "nicknameLabel": "Surnom de la propriete",
      "nicknamePlaceholder": "ex: Bureau principal, Maison, Residence secondaire",
      "nicknameHint": "Un nom convivial pour identifier cette propriete",
      "typeLabel": "Type de propriete",
      "typePlaceholder": "Selectionner le type de propriete...",
      "addressLabel": "Adresse",
      "addressPlaceholder": "ex: 123 Rue Principale, Ville, Code postal 12345",
      "addressHint": "Adresse physique ou description de l'emplacement",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "Le surnom de la propriete est requis",
        "nicknameTooLong": "Le surnom de la propriete doit contenir 100 caracteres ou moins",
        "typeRequired": "Le type de propriete est requis",
        "addressTooLong": "L'adresse doit contenir 500 caracteres ou moins"
      },
      "errors": {
        "saveFailed": "Echec de l'enregistrement de la propriete. Veuillez reessayer."
      },
      "buttons": {
        "create": "Creer la propriete",
        "update": "Mettre a jour la propriete",
        "creating": "Creation en cours...",
        "updating": "Mise a jour en cours..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/fr.json`
2. Add the `properties` namespace with French translations
3. Ensure valid JSON syntax
4. Verify key structure matches en.json exactly

**Acceptance Criteria:**
- [ ] All 21 keys translated to French
- [ ] Key structure matches en.json exactly
- [ ] JSON file remains valid
- [ ] `charCount` pattern preserved (numbers work in all locales)

---

### Task T17: Add Translation Keys to es.json (Spanish)

**Objective:** Add Spanish translations for all PropertyForm keys

**File to Modify:** `/messages/es.json`

**Target Addition:**
```json
{
  "properties": {
    "form": {
      "titleCreate": "Crear nueva propiedad",
      "titleEdit": "Editar propiedad",
      "ownerLabel": "Propietario",
      "ownerPlaceholder": "Seleccionar propietario...",
      "ownerCannotChange": "El propietario no puede cambiarse despues de la creacion",
      "nicknameLabel": "Apodo de la propiedad",
      "nicknamePlaceholder": "ej: Oficina principal, Casa, Casa de vacaciones",
      "nicknameHint": "Un nombre amigable para identificar esta propiedad",
      "typeLabel": "Tipo de propiedad",
      "typePlaceholder": "Seleccionar tipo de propiedad...",
      "addressLabel": "Direccion",
      "addressPlaceholder": "ej: Calle Principal 123, Ciudad, Estado 12345",
      "addressHint": "Direccion fisica o descripcion de la ubicacion",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "El apodo de la propiedad es obligatorio",
        "nicknameTooLong": "El apodo de la propiedad debe tener 100 caracteres o menos",
        "typeRequired": "El tipo de propiedad es obligatorio",
        "addressTooLong": "La direccion debe tener 500 caracteres o menos"
      },
      "errors": {
        "saveFailed": "Error al guardar la propiedad. Por favor, intentelo de nuevo."
      },
      "buttons": {
        "create": "Crear propiedad",
        "update": "Actualizar propiedad",
        "creating": "Creando...",
        "updating": "Actualizando..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/es.json`
2. Add the `properties` namespace with Spanish translations
3. Ensure valid JSON syntax
4. Verify key structure matches en.json exactly

**Acceptance Criteria:**
- [ ] All 21 keys translated to Spanish
- [ ] Key structure matches en.json exactly
- [ ] JSON file remains valid

---

### Task T18: Add Translation Keys to de.json (German)

**Objective:** Add German translations for all PropertyForm keys

**File to Modify:** `/messages/de.json`

**Target Addition:**
```json
{
  "properties": {
    "form": {
      "titleCreate": "Neue Immobilie erstellen",
      "titleEdit": "Immobilie bearbeiten",
      "ownerLabel": "Eigentumer",
      "ownerPlaceholder": "Eigentumer auswahlen...",
      "ownerCannotChange": "Der Eigentumer kann nach der Erstellung nicht geandert werden",
      "nicknameLabel": "Immobilienname",
      "nicknamePlaceholder": "z.B. Hauptburo, Zuhause, Ferienhaus",
      "nicknameHint": "Ein freundlicher Name zur Identifizierung dieser Immobilie",
      "typeLabel": "Immobilientyp",
      "typePlaceholder": "Immobilientyp auswahlen...",
      "addressLabel": "Adresse",
      "addressPlaceholder": "z.B. Hauptstrasse 123, Stadt, Bundesland 12345",
      "addressHint": "Physische Adresse oder Standortbeschreibung",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "Der Immobilienname ist erforderlich",
        "nicknameTooLong": "Der Immobilienname darf maximal 100 Zeichen lang sein",
        "typeRequired": "Der Immobilientyp ist erforderlich",
        "addressTooLong": "Die Adresse darf maximal 500 Zeichen lang sein"
      },
      "errors": {
        "saveFailed": "Speichern der Immobilie fehlgeschlagen. Bitte versuchen Sie es erneut."
      },
      "buttons": {
        "create": "Immobilie erstellen",
        "update": "Immobilie aktualisieren",
        "creating": "Wird erstellt...",
        "updating": "Wird aktualisiert..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/de.json`
2. Add the `properties` namespace with German translations
3. Ensure valid JSON syntax
4. Verify key structure matches en.json exactly

**Acceptance Criteria:**
- [ ] All 21 keys translated to German
- [ ] Key structure matches en.json exactly
- [ ] JSON file remains valid

---

### Task T19: Add Translation Keys to nl.json (Dutch)

**Objective:** Add Dutch translations for all PropertyForm keys

**File to Modify:** `/messages/nl.json`

**Target Addition:**
```json
{
  "properties": {
    "form": {
      "titleCreate": "Nieuw vastgoed aanmaken",
      "titleEdit": "Vastgoed bewerken",
      "ownerLabel": "Eigenaar",
      "ownerPlaceholder": "Selecteer eigenaar...",
      "ownerCannotChange": "De eigenaar kan niet worden gewijzigd na aanmaak",
      "nicknameLabel": "Vastgoed bijnaam",
      "nicknamePlaceholder": "bijv. Hoofdkantoor, Thuis, Vakantiehuis",
      "nicknameHint": "Een vriendelijke naam om dit vastgoed te identificeren",
      "typeLabel": "Type vastgoed",
      "typePlaceholder": "Selecteer type vastgoed...",
      "addressLabel": "Adres",
      "addressPlaceholder": "bijv. Hoofdstraat 123, Stad, Provincie 12345",
      "addressHint": "Fysiek adres of locatiebeschrijving",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "De vastgoed bijnaam is verplicht",
        "nicknameTooLong": "De vastgoed bijnaam mag maximaal 100 tekens bevatten",
        "typeRequired": "Het type vastgoed is verplicht",
        "addressTooLong": "Het adres mag maximaal 500 tekens bevatten"
      },
      "errors": {
        "saveFailed": "Opslaan van vastgoed mislukt. Probeer het opnieuw."
      },
      "buttons": {
        "create": "Vastgoed aanmaken",
        "update": "Vastgoed bijwerken",
        "creating": "Aanmaken...",
        "updating": "Bijwerken..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/nl.json`
2. Add the `properties` namespace with Dutch translations
3. Ensure valid JSON syntax
4. Verify key structure matches en.json exactly

**Acceptance Criteria:**
- [ ] All 21 keys translated to Dutch
- [ ] Key structure matches en.json exactly
- [ ] JSON file remains valid

---

### Task T20: Add Translation Keys to it.json (Italian)

**Objective:** Add Italian translations for all PropertyForm keys

**File to Modify:** `/messages/it.json`

**Target Addition:**
```json
{
  "properties": {
    "form": {
      "titleCreate": "Crea nuova proprieta",
      "titleEdit": "Modifica proprieta",
      "ownerLabel": "Proprietario",
      "ownerPlaceholder": "Seleziona proprietario...",
      "ownerCannotChange": "Il proprietario non puo essere modificato dopo la creazione",
      "nicknameLabel": "Nome della proprieta",
      "nicknamePlaceholder": "es: Ufficio principale, Casa, Casa vacanze",
      "nicknameHint": "Un nome descrittivo per identificare questa proprieta",
      "typeLabel": "Tipo di proprieta",
      "typePlaceholder": "Seleziona tipo di proprieta...",
      "addressLabel": "Indirizzo",
      "addressPlaceholder": "es: Via Principale 123, Citta, Provincia 12345",
      "addressHint": "Indirizzo fisico o descrizione della posizione",
      "charCount": "({current}/{max})",
      "validation": {
        "nicknameRequired": "Il nome della proprieta e obbligatorio",
        "nicknameTooLong": "Il nome della proprieta deve contenere massimo 100 caratteri",
        "typeRequired": "Il tipo di proprieta e obbligatorio",
        "addressTooLong": "L'indirizzo deve contenere massimo 500 caratteri"
      },
      "errors": {
        "saveFailed": "Salvataggio della proprieta non riuscito. Riprova."
      },
      "buttons": {
        "create": "Crea proprieta",
        "update": "Aggiorna proprieta",
        "creating": "Creazione in corso...",
        "updating": "Aggiornamento in corso..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/it.json`
2. Add the `properties` namespace with Italian translations
3. Ensure valid JSON syntax
4. Verify key structure matches en.json exactly

**Acceptance Criteria:**
- [ ] All 21 keys translated to Italian
- [ ] Key structure matches en.json exactly
- [ ] JSON file remains valid

---

### Task T21: Verify Build and Type Checking

**Objective:** Ensure the modified code compiles without errors

**Commands to Run:**
```bash
# TypeScript type check
npx tsc --noEmit

# Build the application
npm run build
```

**Verification Steps:**
1. Run TypeScript type check - should complete with no errors
2. Run the build command - should complete successfully
3. Check for any warnings related to missing translation keys

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` completes with exit code 0
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors in PropertyForm.tsx
- [ ] No errors related to translation key types

---

### Task T22: Manual Testing Verification

**Objective:** Verify the internationalized component works correctly

**Testing Steps:**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Create Mode (Default locale):**
   - Navigate to property creation page
   - Verify form title shows "Create New Property"
   - Verify all field labels display correctly
   - Verify all placeholders display correctly
   - Verify character counters show "(0/100)" and "(0/500)"
   - Leave nickname empty, submit - verify error "Property nickname is required"
   - Enter 101 characters in nickname - verify error shows
   - Leave property type empty, submit - verify error shows
   - Verify Cancel button shows "Cancel"
   - Verify Submit button shows "Create Property"
   - Click submit - verify button shows "Creating..." with spinner

3. **Test Edit Mode:**
   - Navigate to edit an existing property
   - Verify form title shows "Edit Property"
   - Verify Submit button shows "Update Property"
   - Click submit - verify button shows "Updating..." with spinner

4. **Test Admin View (if applicable):**
   - Log in as admin
   - Create new property
   - Verify "Property Owner" label shows
   - Verify "Select property owner..." placeholder shows
   - Edit existing property
   - Verify "Property owner cannot be changed after creation" message shows

5. **Test Error State:**
   - Trigger a save error (e.g., disconnect network)
   - Verify fallback error message shows

**Acceptance Criteria:**
- [ ] Form title changes correctly between create/edit modes
- [ ] All field labels display translated text
- [ ] All placeholders display translated text
- [ ] Character counters work with interpolated values
- [ ] Validation errors display translated text
- [ ] Button states show correct translated text
- [ ] Admin-only fields show translated text
- [ ] No console errors about missing translation keys

---

## Complete Translation Key Reference

| Key Path | English Value |
|----------|---------------|
| `properties.form.titleCreate` | Create New Property |
| `properties.form.titleEdit` | Edit Property |
| `properties.form.ownerLabel` | Property Owner |
| `properties.form.ownerPlaceholder` | Select property owner... |
| `properties.form.ownerCannotChange` | Property owner cannot be changed after creation |
| `properties.form.nicknameLabel` | Property Nickname |
| `properties.form.nicknamePlaceholder` | e.g., Main Office, Home, Vacation House |
| `properties.form.nicknameHint` | A friendly name to identify this property |
| `properties.form.typeLabel` | Property Type |
| `properties.form.typePlaceholder` | Select property type... |
| `properties.form.addressLabel` | Address |
| `properties.form.addressPlaceholder` | e.g., 123 Main St, Anytown, State 12345 |
| `properties.form.addressHint` | Physical address or location description |
| `properties.form.charCount` | ({current}/{max}) |
| `properties.form.validation.nicknameRequired` | Property nickname is required |
| `properties.form.validation.nicknameTooLong` | Property nickname must be 100 characters or less |
| `properties.form.validation.typeRequired` | Property type is required |
| `properties.form.validation.addressTooLong` | Address must be 500 characters or less |
| `properties.form.errors.saveFailed` | Failed to save property. Please try again. |
| `properties.form.buttons.create` | Create Property |
| `properties.form.buttons.update` | Update Property |
| `properties.form.buttons.creating` | Creating... |
| `properties.form.buttons.updating` | Updating... |

**Keys from Common Namespace (already exist):**
| Key Path | English Value |
|----------|---------------|
| `common.cancel` | Cancel |
| `common.optional` | Optional |

---

## Files Modified Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/PropertyForm.tsx` | Modified | Added import, hooks, replaced 26 hardcoded strings |
| `/messages/en.json` | Modified | Added properties.form namespace with 21 keys |
| `/messages/fr.json` | Modified | Added properties.form namespace with French translations |
| `/messages/es.json` | Modified | Added properties.form namespace with Spanish translations |
| `/messages/de.json` | Modified | Added properties.form namespace with German translations |
| `/messages/nl.json` | Modified | Added properties.form namespace with Dutch translations |
| `/messages/it.json` | Modified | Added properties.form namespace with Italian translations |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert PropertyForm.tsx:**
   ```bash
   git checkout HEAD~1 -- src/components/PropertyForm.tsx
   ```

2. **Remove properties namespace from translation files:**
   - Edit each `/messages/*.json` file
   - Remove the `properties` key and its contents
   - Ensure valid JSON after removal

3. **Verify build:**
   ```bash
   npm run build
   ```

---

## References

- [Overview Document](./REQ-399-update-propertyform-overview.md)
- [Request Details](./gen_requests_epic2.md#req-399)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2F Task 2F.2*
*Created: 2026-01-19 13:00:00 UTC*
