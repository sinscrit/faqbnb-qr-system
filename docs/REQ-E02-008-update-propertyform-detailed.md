# Detailed Task Breakdown: REQ-E02-008 - Update PropertyForm Component with Localized Strings

**Document Created:** 2026-01-20 20:15:00 UTC
**Last Modified:** 2026-01-20 20:15:00 UTC

**Request ID:** REQ-E02-008
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.2
**Size:** M (Medium)
**Priority:** P2

---

## Overview

This document provides a granular, step-by-step task breakdown for updating the PropertyForm component to use localized translation references instead of hardcoded English strings. Each task is designed to be approximately 1 story point (completable in a focused work session).

---

## Prerequisites

Before starting these tasks, verify the following are complete:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `useTranslations` hook is functional in client components
- [ ] Messages files exist at `/messages/*.json` for all 6 languages
- [ ] `common` namespace exists with `cancel` and `optional` keys (verified: exists in en.json)

---

## File Inventory

| File | Type | Lines | Role |
|------|------|-------|------|
| `/src/components/PropertyForm.tsx` | Client Component | 291 | Primary component to update |
| `/messages/en.json` | Translation | ~134 | Add `properties.form` namespace |
| `/messages/fr.json` | Translation | - | Copy structure from en.json |
| `/messages/es.json` | Translation | - | Copy structure from en.json |
| `/messages/de.json` | Translation | - | Copy structure from en.json |
| `/messages/nl.json` | Translation | - | Copy structure from en.json |
| `/messages/it.json` | Translation | - | Copy structure from en.json |

---

## Hardcoded Strings Inventory (Verified from Source)

| # | String | Line | Category | Proposed Key |
|---|--------|------|----------|--------------|
| 1 | "Edit Property" | 143 | Title | `properties.form.titleEdit` |
| 2 | "Create New Property" | 143 | Title | `properties.form.titleCreate` |
| 3 | "Property Owner" | 158 | Label | `properties.form.labels.owner` |
| 4 | "Select property owner..." | 167 | Placeholder | `properties.form.placeholders.selectOwner` |
| 5 | "Property owner cannot be changed after creation" | 176 | Hint | `properties.form.hints.ownerLocked` |
| 6 | "Property Nickname" | 185 | Label | `properties.form.labels.nickname` |
| 7 | "e.g., Main Office, Home, Vacation House" | 193 | Placeholder | `properties.form.placeholders.nickname` |
| 8 | "A friendly name to identify this property" | 203 | Hint | `properties.form.hints.nicknameDescription` |
| 9 | "Property Type" | 209 | Label | `properties.form.labels.type` |
| 10 | "Select property type..." | 221 | Placeholder | `properties.form.placeholders.selectType` |
| 11 | "Address" | 235 | Label | `properties.form.labels.address` |
| 12 | "(Optional)" | 236 | Indicator | `common.optional` (exists) |
| 13 | "e.g., 123 Main St, Anytown, State 12345" | 244 | Placeholder | `properties.form.placeholders.address` |
| 14 | "Physical address or location description" | 254 | Hint | `properties.form.hints.addressDescription` |
| 15 | "Cancel" | 266 | Button | `common.cancel` (exists) |
| 16 | "Update Property" | 282 | Button | `properties.form.actions.update` |
| 17 | "Create Property" | 282 | Button | `properties.form.actions.create` |
| 18 | "Updating..." | 279 | Loading | `properties.form.actions.updating` |
| 19 | "Creating..." | 279 | Loading | `properties.form.actions.creating` |
| 20 | "Property nickname is required" | 34 | Validation | `properties.form.validation.nicknameRequired` |
| 21 | "Property nickname must be 100 characters or less" | 36 | Validation | `properties.form.validation.nicknameTooLong` |
| 22 | "Property type is required" | 41 | Validation | `properties.form.validation.typeRequired` |
| 23 | "Address must be 500 characters or less" | 46 | Validation | `properties.form.validation.addressTooLong` |
| 24 | "Failed to save property. Please try again." | 106 | Error | `properties.form.errors.saveFailed` |

**Total: 24 unique strings (22 new + 2 from common namespace)**

---

## Task Breakdown

### Task 1: Add Translation Keys to English Messages File

**File:** `/messages/en.json`
**Estimated Effort:** 15 minutes
**Dependencies:** None

**Steps:**

1.1. Open `/messages/en.json`

1.2. Add the `properties.form` namespace after existing `properties` key (or create `properties` if it doesn't exist):

```json
"properties": {
  "form": {
    "titleCreate": "Create New Property",
    "titleEdit": "Edit Property",
    "labels": {
      "owner": "Property Owner",
      "nickname": "Property Nickname",
      "type": "Property Type",
      "address": "Address"
    },
    "placeholders": {
      "selectOwner": "Select property owner...",
      "nickname": "e.g., Main Office, Home, Vacation House",
      "selectType": "Select property type...",
      "address": "e.g., 123 Main St, Anytown, State 12345"
    },
    "hints": {
      "ownerLocked": "Property owner cannot be changed after creation",
      "nicknameDescription": "A friendly name to identify this property",
      "nicknameCount": "{count}/100",
      "addressDescription": "Physical address or location description",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "Property nickname is required",
      "nicknameTooLong": "Property nickname must be 100 characters or less",
      "typeRequired": "Property type is required",
      "addressTooLong": "Address must be 500 characters or less"
    },
    "errors": {
      "saveFailed": "Failed to save property. Please try again."
    },
    "actions": {
      "create": "Create Property",
      "update": "Update Property",
      "creating": "Creating...",
      "updating": "Updating..."
    }
  }
}
```

1.3. Verify JSON is valid (no syntax errors)

1.4. Save the file

**Verification:**
- [ ] JSON parses correctly
- [ ] All 22 new keys are present
- [ ] Keys follow `properties.form.{category}.{key}` pattern

---

### Task 2: Add Import Statement to PropertyForm Component

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** Task 1

**Steps:**

2.1. Open `/src/components/PropertyForm.tsx`

2.2. Add import for `useTranslations` at line 3 (after React import):

**Before (lines 1-4):**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { PropertyFormProps, PropertyType, User, PropertyFormData, PropertyValidationErrors } from '@/types';
```

**After:**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PropertyFormProps, PropertyType, User, PropertyFormData, PropertyValidationErrors } from '@/types';
```

2.3. Save the file

**Verification:**
- [ ] No TypeScript errors on the import
- [ ] Import is positioned correctly

---

### Task 3: Initialize Translation Hooks in Component Function

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** Task 2

**Steps:**

3.1. Locate the component function start (around line 6-7):

```typescript
const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  propertyTypes,
  users,
  onSave,
  onCancel
}) => {
```

3.2. Add translation hook initialization immediately after the props destructuring, before the form state (around line 12):

**Insert after `}) => {`:**
```typescript
  // Translations
  const t = useTranslations('properties.form');
  const tCommon = useTranslations('common');
```

3.3. Save the file

**Verification:**
- [ ] No TypeScript errors
- [ ] Hooks are inside the component function but before any state declarations

---

### Task 4: Update Validation Function with Translated Messages

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 3

**Steps:**

4.1. Locate the `validateForm` function (lines 29-51)

4.2. Update validation error messages:

**Before (lines 33-47):**
```typescript
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
```

**After:**
```typescript
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
```

4.3. Save the file

**Verification:**
- [ ] All 4 validation messages use `t()` function
- [ ] No TypeScript errors
- [ ] Keys match those defined in en.json

---

### Task 5: Update Error Handling with Translated Message

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** Task 3

**Steps:**

5.1. Locate the error handling in `handleSubmit` (lines 103-107):

**Before:**
```typescript
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save property. Please try again.'
      });
```

**After:**
```typescript
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({
        general: error instanceof Error ? error.message : t('errors.saveFailed')
      });
```

5.2. Save the file

**Verification:**
- [ ] Error message uses `t('errors.saveFailed')`
- [ ] No TypeScript errors

---

### Task 6: Update Form Title

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** Task 3

**Steps:**

6.1. Locate the form title (lines 142-144):

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

6.2. Save the file

**Verification:**
- [ ] Title uses conditional translation
- [ ] No TypeScript errors

---

### Task 7: Update Property Owner Field Section

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 3

**Steps:**

7.1. Locate the user selection section (lines 155-179)

7.2. Update the label (line 157-158):

**Before:**
```tsx
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              Property Owner <span className="text-red-500">*</span>
            </label>
```

**After:**
```tsx
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              {t('labels.owner')} <span className="text-red-500">*</span>
            </label>
```

7.3. Update the placeholder option (line 167):

**Before:**
```tsx
              <option value="">Select property owner...</option>
```

**After:**
```tsx
              <option value="">{t('placeholders.selectOwner')}</option>
```

7.4. Update the hint text (lines 174-177):

**Before:**
```tsx
            {property && (
              <p className="mt-1 text-xs text-gray-500">
                Property owner cannot be changed after creation
              </p>
            )}
```

**After:**
```tsx
            {property && (
              <p className="mt-1 text-xs text-gray-500">
                {t('hints.ownerLocked')}
              </p>
            )}
```

7.5. Save the file

**Verification:**
- [ ] Label, placeholder, and hint all use `t()` function
- [ ] No TypeScript errors

---

### Task 8: Update Property Nickname Field Section

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 3

**Steps:**

8.1. Locate the nickname section (lines 182-205)

8.2. Update the label (lines 184-185):

**Before:**
```tsx
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            Property Nickname <span className="text-red-500">*</span>
          </label>
```

**After:**
```tsx
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            {t('labels.nickname')} <span className="text-red-500">*</span>
          </label>
```

8.3. Update the placeholder (line 193):

**Before:**
```tsx
            placeholder="e.g., Main Office, Home, Vacation House"
```

**After:**
```tsx
            placeholder={t('placeholders.nickname')}
```

8.4. Update the hint text with character count (lines 202-204):

**Before:**
```tsx
          <p className="mt-1 text-xs text-gray-500">
            A friendly name to identify this property ({formData.nickname.length}/100)
          </p>
```

**After:**
```tsx
          <p className="mt-1 text-xs text-gray-500">
            {t('hints.nicknameDescription')} ({t('hints.nicknameCount', { count: formData.nickname.length })})
          </p>
```

8.5. Save the file

**Verification:**
- [ ] Label, placeholder, and hint all use `t()` function
- [ ] Character count uses interpolation with `{ count: ... }`
- [ ] No TypeScript errors

---

### Task 9: Update Property Type Field Section

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** Task 3

**Steps:**

9.1. Locate the property type section (lines 207-231)

9.2. Update the label (lines 209-210):

**Before:**
```tsx
          <label htmlFor="propertyTypeId" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type <span className="text-red-500">*</span>
          </label>
```

**After:**
```tsx
          <label htmlFor="propertyTypeId" className="block text-sm font-medium text-gray-700 mb-2">
            {t('labels.type')} <span className="text-red-500">*</span>
          </label>
```

9.3. Update the placeholder option (line 221):

**Before:**
```tsx
            <option value="">Select property type...</option>
```

**After:**
```tsx
            <option value="">{t('placeholders.selectType')}</option>
```

9.4. Save the file

**Verification:**
- [ ] Label and placeholder use `t()` function
- [ ] No TypeScript errors

---

### Task 10: Update Address Field Section

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 3

**Steps:**

10.1. Locate the address section (lines 233-256)

10.2. Update the label (lines 235-236):

**Before:**
```tsx
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-gray-400">(Optional)</span>
          </label>
```

**After:**
```tsx
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            {t('labels.address')} <span className="text-gray-400">({tCommon('optional')})</span>
          </label>
```

10.3. Update the placeholder (line 244):

**Before:**
```tsx
            placeholder="e.g., 123 Main St, Anytown, State 12345"
```

**After:**
```tsx
            placeholder={t('placeholders.address')}
```

10.4. Update the hint text (lines 253-255):

**Before:**
```tsx
          <p className="mt-1 text-xs text-gray-500">
            Physical address or location description ({formData.address.length}/500)
          </p>
```

**After:**
```tsx
          <p className="mt-1 text-xs text-gray-500">
            {t('hints.addressDescription')} ({t('hints.addressCount', { count: formData.address.length })})
          </p>
```

10.5. Save the file

**Verification:**
- [ ] Label uses `t()` and `tCommon()` functions
- [ ] Placeholder and hint use `t()` function
- [ ] Character count uses interpolation
- [ ] No TypeScript errors

---

### Task 11: Update Form Action Buttons

**File:** `/src/components/PropertyForm.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 3

**Steps:**

11.1. Locate the form actions section (lines 258-285)

11.2. Update the Cancel button (lines 260-267):

**Before:**
```tsx
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
```

**After:**
```tsx
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tCommon('cancel')}
          </button>
```

11.3. Update the Submit button loading and label text (lines 273-283):

**Before:**
```tsx
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {property ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              property ? 'Update Property' : 'Create Property'
            )}
```

**After:**
```tsx
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {property ? t('actions.updating') : t('actions.creating')}
              </>
            ) : (
              property ? t('actions.update') : t('actions.create')
            )}
```

11.4. Save the file

**Verification:**
- [ ] Cancel button uses `tCommon('cancel')`
- [ ] Submit button uses `t('actions.*')` for all 4 states
- [ ] No TypeScript errors

---

### Task 12: Add Translations to French Messages File

**File:** `/messages/fr.json`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 1

**Steps:**

12.1. Open `/messages/fr.json`

12.2. Add the `properties.form` namespace with French translations:

```json
"properties": {
  "form": {
    "titleCreate": "Créer une nouvelle propriété",
    "titleEdit": "Modifier la propriété",
    "labels": {
      "owner": "Propriétaire",
      "nickname": "Nom de la propriété",
      "type": "Type de propriété",
      "address": "Adresse"
    },
    "placeholders": {
      "selectOwner": "Sélectionner le propriétaire...",
      "nickname": "ex: Bureau principal, Maison, Résidence secondaire",
      "selectType": "Sélectionner le type de propriété...",
      "address": "ex: 123 Rue Principale, Ville, Code postal"
    },
    "hints": {
      "ownerLocked": "Le propriétaire ne peut pas être modifié après la création",
      "nicknameDescription": "Un nom convivial pour identifier cette propriété",
      "nicknameCount": "{count}/100",
      "addressDescription": "Adresse physique ou description de l'emplacement",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "Le nom de la propriété est requis",
      "nicknameTooLong": "Le nom de la propriété doit contenir 100 caractères ou moins",
      "typeRequired": "Le type de propriété est requis",
      "addressTooLong": "L'adresse doit contenir 500 caractères ou moins"
    },
    "errors": {
      "saveFailed": "Échec de l'enregistrement de la propriété. Veuillez réessayer."
    },
    "actions": {
      "create": "Créer la propriété",
      "update": "Mettre à jour la propriété",
      "creating": "Création en cours...",
      "updating": "Mise à jour en cours..."
    }
  }
}
```

12.3. Save the file

**Verification:**
- [ ] JSON is valid
- [ ] Structure matches en.json exactly

---

### Task 13: Add Translations to Spanish Messages File

**File:** `/messages/es.json`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 1

**Steps:**

13.1. Open `/messages/es.json`

13.2. Add the `properties.form` namespace with Spanish translations:

```json
"properties": {
  "form": {
    "titleCreate": "Crear nueva propiedad",
    "titleEdit": "Editar propiedad",
    "labels": {
      "owner": "Propietario",
      "nickname": "Nombre de la propiedad",
      "type": "Tipo de propiedad",
      "address": "Dirección"
    },
    "placeholders": {
      "selectOwner": "Seleccionar propietario...",
      "nickname": "ej: Oficina principal, Casa, Casa de vacaciones",
      "selectType": "Seleccionar tipo de propiedad...",
      "address": "ej: Calle Principal 123, Ciudad, Código postal"
    },
    "hints": {
      "ownerLocked": "El propietario no se puede cambiar después de la creación",
      "nicknameDescription": "Un nombre fácil de recordar para identificar esta propiedad",
      "nicknameCount": "{count}/100",
      "addressDescription": "Dirección física o descripción de la ubicación",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "El nombre de la propiedad es obligatorio",
      "nicknameTooLong": "El nombre de la propiedad debe tener 100 caracteres o menos",
      "typeRequired": "El tipo de propiedad es obligatorio",
      "addressTooLong": "La dirección debe tener 500 caracteres o menos"
    },
    "errors": {
      "saveFailed": "Error al guardar la propiedad. Por favor, inténtelo de nuevo."
    },
    "actions": {
      "create": "Crear propiedad",
      "update": "Actualizar propiedad",
      "creating": "Creando...",
      "updating": "Actualizando..."
    }
  }
}
```

13.3. Save the file

**Verification:**
- [ ] JSON is valid
- [ ] Structure matches en.json exactly

---

### Task 14: Add Translations to German Messages File

**File:** `/messages/de.json`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 1

**Steps:**

14.1. Open `/messages/de.json`

14.2. Add the `properties.form` namespace with German translations:

```json
"properties": {
  "form": {
    "titleCreate": "Neue Immobilie erstellen",
    "titleEdit": "Immobilie bearbeiten",
    "labels": {
      "owner": "Eigentümer",
      "nickname": "Immobilienname",
      "type": "Immobilientyp",
      "address": "Adresse"
    },
    "placeholders": {
      "selectOwner": "Eigentümer auswählen...",
      "nickname": "z.B. Hauptbüro, Zuhause, Ferienhaus",
      "selectType": "Immobilientyp auswählen...",
      "address": "z.B. Hauptstraße 123, Stadt, PLZ"
    },
    "hints": {
      "ownerLocked": "Der Eigentümer kann nach der Erstellung nicht mehr geändert werden",
      "nicknameDescription": "Ein aussagekräftiger Name zur Identifizierung dieser Immobilie",
      "nicknameCount": "{count}/100",
      "addressDescription": "Physische Adresse oder Standortbeschreibung",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "Immobilienname ist erforderlich",
      "nicknameTooLong": "Der Immobilienname darf maximal 100 Zeichen lang sein",
      "typeRequired": "Immobilientyp ist erforderlich",
      "addressTooLong": "Die Adresse darf maximal 500 Zeichen lang sein"
    },
    "errors": {
      "saveFailed": "Speichern der Immobilie fehlgeschlagen. Bitte versuchen Sie es erneut."
    },
    "actions": {
      "create": "Immobilie erstellen",
      "update": "Immobilie aktualisieren",
      "creating": "Wird erstellt...",
      "updating": "Wird aktualisiert..."
    }
  }
}
```

14.3. Save the file

**Verification:**
- [ ] JSON is valid
- [ ] Structure matches en.json exactly

---

### Task 15: Add Translations to Dutch Messages File

**File:** `/messages/nl.json`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 1

**Steps:**

15.1. Open `/messages/nl.json`

15.2. Add the `properties.form` namespace with Dutch translations:

```json
"properties": {
  "form": {
    "titleCreate": "Nieuw vastgoed aanmaken",
    "titleEdit": "Vastgoed bewerken",
    "labels": {
      "owner": "Eigenaar",
      "nickname": "Vastgoednaam",
      "type": "Vastgoedtype",
      "address": "Adres"
    },
    "placeholders": {
      "selectOwner": "Selecteer eigenaar...",
      "nickname": "bijv. Hoofdkantoor, Thuis, Vakantiehuis",
      "selectType": "Selecteer vastgoedtype...",
      "address": "bijv. Hoofdstraat 123, Stad, Postcode"
    },
    "hints": {
      "ownerLocked": "De eigenaar kan na aanmaak niet worden gewijzigd",
      "nicknameDescription": "Een herkenbare naam om dit vastgoed te identificeren",
      "nicknameCount": "{count}/100",
      "addressDescription": "Fysiek adres of locatiebeschrijving",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "Vastgoednaam is verplicht",
      "nicknameTooLong": "De vastgoednaam mag maximaal 100 tekens bevatten",
      "typeRequired": "Vastgoedtype is verplicht",
      "addressTooLong": "Het adres mag maximaal 500 tekens bevatten"
    },
    "errors": {
      "saveFailed": "Opslaan van vastgoed mislukt. Probeer het opnieuw."
    },
    "actions": {
      "create": "Vastgoed aanmaken",
      "update": "Vastgoed bijwerken",
      "creating": "Aanmaken...",
      "updating": "Bijwerken..."
    }
  }
}
```

15.3. Save the file

**Verification:**
- [ ] JSON is valid
- [ ] Structure matches en.json exactly

---

### Task 16: Add Translations to Italian Messages File

**File:** `/messages/it.json`
**Estimated Effort:** 10 minutes
**Dependencies:** Task 1

**Steps:**

16.1. Open `/messages/it.json`

16.2. Add the `properties.form` namespace with Italian translations:

```json
"properties": {
  "form": {
    "titleCreate": "Crea nuova proprietà",
    "titleEdit": "Modifica proprietà",
    "labels": {
      "owner": "Proprietario",
      "nickname": "Nome della proprietà",
      "type": "Tipo di proprietà",
      "address": "Indirizzo"
    },
    "placeholders": {
      "selectOwner": "Seleziona proprietario...",
      "nickname": "es: Ufficio principale, Casa, Casa vacanze",
      "selectType": "Seleziona tipo di proprietà...",
      "address": "es: Via Principale 123, Città, CAP"
    },
    "hints": {
      "ownerLocked": "Il proprietario non può essere modificato dopo la creazione",
      "nicknameDescription": "Un nome semplice per identificare questa proprietà",
      "nicknameCount": "{count}/100",
      "addressDescription": "Indirizzo fisico o descrizione della posizione",
      "addressCount": "{count}/500"
    },
    "validation": {
      "nicknameRequired": "Il nome della proprietà è obbligatorio",
      "nicknameTooLong": "Il nome della proprietà deve essere di 100 caratteri o meno",
      "typeRequired": "Il tipo di proprietà è obbligatorio",
      "addressTooLong": "L'indirizzo deve essere di 500 caratteri o meno"
    },
    "errors": {
      "saveFailed": "Salvataggio della proprietà non riuscito. Riprova."
    },
    "actions": {
      "create": "Crea proprietà",
      "update": "Aggiorna proprietà",
      "creating": "Creazione in corso...",
      "updating": "Aggiornamento in corso..."
    }
  }
}
```

16.3. Save the file

**Verification:**
- [ ] JSON is valid
- [ ] Structure matches en.json exactly

---

### Task 17: Verify TypeScript Compilation

**Estimated Effort:** 5 minutes
**Dependencies:** Tasks 2-11

**Steps:**

17.1. Run TypeScript compiler:
```bash
npx tsc --noEmit
```

17.2. Check for any type errors related to PropertyForm.tsx

17.3. Fix any errors found

**Verification:**
- [ ] TypeScript compilation passes
- [ ] No errors in PropertyForm.tsx

---

### Task 18: Verify Build Passes

**Estimated Effort:** 10 minutes
**Dependencies:** Task 17

**Steps:**

18.1. Run Next.js build:
```bash
npm run build
```

18.2. Check for any build errors related to:
   - Missing translation keys
   - Invalid translation function calls
   - JSON parsing errors

18.3. Fix any errors found

**Verification:**
- [ ] Build completes successfully
- [ ] No translation-related warnings

---

### Task 19: Functional Testing - Create Mode

**Estimated Effort:** 15 minutes
**Dependencies:** Tasks 1-16, 18

**Steps:**

19.1. Start the development server:
```bash
npm run dev
```

19.2. Navigate to the property creation form

19.3. Test the following in English:
- [ ] Form title displays "Create New Property"
- [ ] All field labels display correctly
- [ ] All placeholder text displays correctly
- [ ] All hint text displays correctly
- [ ] Character counts update and display correctly
- [ ] Submit button displays "Create Property"
- [ ] Loading state displays "Creating..."
- [ ] Cancel button displays "Cancel"

19.4. Test validation messages:
- [ ] Leave nickname empty, verify error message
- [ ] Enter nickname > 100 chars, verify error message
- [ ] Leave property type empty, verify error message
- [ ] Enter address > 500 chars, verify error message

19.5. Test error handling:
- [ ] Trigger a save error, verify error message displays

---

### Task 20: Functional Testing - Edit Mode

**Estimated Effort:** 10 minutes
**Dependencies:** Task 19

**Steps:**

20.1. Navigate to edit an existing property

20.2. Test the following:
- [ ] Form title displays "Edit Property"
- [ ] Owner field shows locked hint (if applicable)
- [ ] Submit button displays "Update Property"
- [ ] Loading state displays "Updating..."

---

### Task 21: Language Testing

**Estimated Effort:** 20 minutes
**Dependencies:** Tasks 12-16, 19

**Steps:**

21.1. Switch language to French and verify:
- [ ] All labels display in French
- [ ] All placeholders display in French
- [ ] All buttons display in French
- [ ] Character count format works ({count}/100)

21.2. Switch language to Spanish and verify:
- [ ] Form displays correctly in Spanish

21.3. Switch language to German and verify:
- [ ] Form displays correctly in German
- [ ] Longer German text doesn't overflow

21.4. Switch language to Dutch and verify:
- [ ] Form displays correctly in Dutch

21.5. Switch language to Italian and verify:
- [ ] Form displays correctly in Italian

---

### Task 22: Visual Regression Check

**Estimated Effort:** 10 minutes
**Dependencies:** Task 21

**Steps:**

22.1. In German (typically longest text), verify:
- [ ] Labels don't overflow their containers
- [ ] Buttons accommodate the longer text
- [ ] Placeholders fit in input fields
- [ ] Hint text wraps correctly

22.2. Check responsive behavior:
- [ ] Form displays correctly on mobile viewport
- [ ] Form displays correctly on tablet viewport
- [ ] Form displays correctly on desktop viewport

---

### Task 23: Final Code Review

**Estimated Effort:** 10 minutes
**Dependencies:** All previous tasks

**Steps:**

23.1. Review PropertyForm.tsx for:
- [ ] No hardcoded English text remains
- [ ] All `t()` calls use correct key paths
- [ ] All `tCommon()` calls use correct key paths
- [ ] Code formatting is consistent

23.2. Review all 6 message files for:
- [ ] Identical key structures
- [ ] Valid JSON syntax
- [ ] No missing translations

23.3. Run grep to find any remaining hardcoded strings:
```bash
grep -n "'" src/components/PropertyForm.tsx | grep -v "use client" | grep -v "import" | grep -v "//" | grep -v "className"
```

---

## Task Summary

| Task # | Description | Effort | Dependencies |
|--------|-------------|--------|--------------|
| 1 | Add translation keys to en.json | 15 min | None |
| 2 | Add import statement | 5 min | Task 1 |
| 3 | Initialize translation hooks | 5 min | Task 2 |
| 4 | Update validation function | 10 min | Task 3 |
| 5 | Update error handling | 5 min | Task 3 |
| 6 | Update form title | 5 min | Task 3 |
| 7 | Update owner field section | 10 min | Task 3 |
| 8 | Update nickname field section | 10 min | Task 3 |
| 9 | Update property type section | 5 min | Task 3 |
| 10 | Update address section | 10 min | Task 3 |
| 11 | Update action buttons | 10 min | Task 3 |
| 12 | Add French translations | 10 min | Task 1 |
| 13 | Add Spanish translations | 10 min | Task 1 |
| 14 | Add German translations | 10 min | Task 1 |
| 15 | Add Dutch translations | 10 min | Task 1 |
| 16 | Add Italian translations | 10 min | Task 1 |
| 17 | Verify TypeScript compilation | 5 min | Tasks 2-11 |
| 18 | Verify build passes | 10 min | Task 17 |
| 19 | Functional testing - create mode | 15 min | Task 18 |
| 20 | Functional testing - edit mode | 10 min | Task 19 |
| 21 | Language testing | 20 min | Tasks 12-16 |
| 22 | Visual regression check | 10 min | Task 21 |
| 23 | Final code review | 10 min | All |

**Total Estimated Time:** ~3.5 hours

---

## Acceptance Criteria Checklist

- [ ] All 24 hardcoded strings in PropertyForm.tsx are replaced with translation function calls
- [ ] Translation keys are added to all 6 language files under `properties.form` namespace
- [ ] Form title displays correctly in create vs edit mode using translations
- [ ] All field labels display translated text
- [ ] All placeholder text displays translated text
- [ ] All helper text and hints display translated text
- [ ] Character count displays work correctly with interpolation
- [ ] Validation messages display translated text
- [ ] Error messages display translated text
- [ ] Button labels display translated text (including loading states)
- [ ] Form renders correctly in all 6 supported languages without layout issues
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No hardcoded English text remains in PropertyForm component

---

## References

- [Overview Document](/docs/REQ-E02-008-update-propertyform-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-008
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Source Component](/src/components/PropertyForm.tsx)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
