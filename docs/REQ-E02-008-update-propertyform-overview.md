# Implementation Overview: REQ-E02-008 - Update PropertyForm Component with Localized Strings

**Document Created:** 2026-01-20 18:45:00 UTC
**Last Modified:** 2026-01-20 18:45:00 UTC

**Request ID:** REQ-E02-008
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.2
**Size:** M (Medium)
**Priority:** P2

---

## 1. Summary

Update the PropertyForm component to use localized translation references instead of hardcoded English strings. This component is responsible for creating and editing property information and contains approximately 30-40 hardcoded strings including field labels, placeholders, validation messages, button labels, and helper text.

---

## 2. Current State Analysis

### 2.1 Component Location
- **File:** `/src/components/PropertyForm.tsx`
- **Type:** Client Component (`'use client'`)
- **Lines:** ~291 lines

### 2.2 Hardcoded Strings Inventory

| Category | String | Location (Line) | Translation Key |
|----------|--------|-----------------|-----------------|
| **Form Title** | "Edit Property" | 143 | `properties.form.titleEdit` |
| **Form Title** | "Create New Property" | 143 | `properties.form.titleCreate` |
| **Labels** | "Property Owner" | 158 | `properties.form.labels.owner` |
| **Labels** | "Property Nickname" | 185 | `properties.form.labels.nickname` |
| **Labels** | "Property Type" | 209 | `properties.form.labels.type` |
| **Labels** | "Address" | 235 | `properties.form.labels.address` |
| **Placeholders** | "Select property owner..." | 167 | `properties.form.placeholders.selectOwner` |
| **Placeholders** | "e.g., Main Office, Home, Vacation House" | 193 | `properties.form.placeholders.nickname` |
| **Placeholders** | "Select property type..." | 221 | `properties.form.placeholders.selectType` |
| **Placeholders** | "e.g., 123 Main St, Anytown, State 12345" | 244 | `properties.form.placeholders.address` |
| **Helper Text** | "Property owner cannot be changed after creation" | 175-177 | `properties.form.hints.ownerLocked` |
| **Helper Text** | "A friendly name to identify this property" | 202-203 | `properties.form.hints.nicknameDescription` |
| **Helper Text** | "Physical address or location description" | 253-254 | `properties.form.hints.addressDescription` |
| **Helper Text** | "(Optional)" | 236 | `common.optional` |
| **Validation** | "Property nickname is required" | 34 | `properties.form.validation.nicknameRequired` |
| **Validation** | "Property nickname must be 100 characters or less" | 36 | `properties.form.validation.nicknameTooLong` |
| **Validation** | "Property type is required" | 41 | `properties.form.validation.typeRequired` |
| **Validation** | "Address must be 500 characters or less" | 46 | `properties.form.validation.addressTooLong` |
| **Error** | "Failed to save property. Please try again." | 106 | `properties.form.errors.saveFailed` |
| **Buttons** | "Cancel" | 266 | `common.cancel` |
| **Buttons** | "Update Property" | 282 | `properties.form.actions.update` |
| **Buttons** | "Create Property" | 282 | `properties.form.actions.create` |
| **Buttons** | "Updating..." | 279 | `properties.form.actions.updating` |
| **Buttons** | "Creating..." | 279 | `properties.form.actions.creating` |
| **Required Indicator** | "*" (required field) | 158, 185, 209 | (visual, no translation needed) |

**Total Estimated Strings:** ~28 unique strings

### 2.3 Dynamic Content

The following dynamic content patterns exist:
1. Character count display: `{formData.nickname.length}/100` - needs interpolation pattern
2. Character count display: `{formData.address.length}/500` - needs interpolation pattern
3. User display: `{user.full_name || user.email} ({user.email})` - no translation needed (user data)
4. Property type display names: `{type.display_name}` - no translation needed (database data)

---

## 3. Technical Approach

### 3.1 Translation Pattern

Following the established pattern from Epic 1 (see `LogoutButton.tsx`):

```typescript
// Import at top of file
import { useTranslations } from 'next-intl';

// Inside component function
const t = useTranslations('properties.form');
const tCommon = useTranslations('common');
```

### 3.2 Namespace Structure

Add to `/messages/en.json` under the `properties` namespace:

```json
{
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
}
```

### 3.3 String Interpolation

For dynamic character counts, use ICU format:

```typescript
// Usage
t('hints.nicknameCount', { count: formData.nickname.length })
t('hints.addressCount', { count: formData.address.length })
```

### 3.4 Reusing Common Translations

The following strings should use the existing `common` namespace:
- "Cancel" -> `tCommon('cancel')`
- "(Optional)" -> `tCommon('optional')`

---

## 4. Implementation Tasks

### Task 1: Add Translation Keys to Messages File
- Add `properties.form` namespace to `/messages/en.json`
- Ensure all 6 language files are updated with the same structure

### Task 2: Update PropertyForm Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hooks: `t` for properties.form, `tCommon` for common
- Replace all hardcoded strings with translation function calls
- Update validation messages in `validateForm()` function
- Update error handling messages
- Update dynamic content with interpolation

### Task 3: Verify Build and Functionality
- Run TypeScript compilation to ensure no type errors
- Run build to verify no missing translation keys
- Test form in create and edit modes
- Verify character count displays correctly
- Verify validation messages display correctly

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/PropertyForm.tsx` | Main component | Add imports, replace hardcoded strings |
| `/messages/en.json` | English translations | Add `properties.form` namespace |
| `/messages/fr.json` | French translations | Add `properties.form` namespace |
| `/messages/es.json` | Spanish translations | Add `properties.form` namespace |
| `/messages/de.json` | German translations | Add `properties.form` namespace |
| `/messages/nl.json` | Dutch translations | Add `properties.form` namespace |
| `/messages/it.json` | Italian translations | Add `properties.form` namespace |

### 5.2 Authorized Functions/Sections in PropertyForm.tsx

| Function/Section | Lines | Modification |
|------------------|-------|--------------|
| Import statements | 1-4 | Add `useTranslations` import |
| Component function start | 6-12 | Add translation hook initialization |
| `validateForm()` | 29-51 | Replace validation error strings |
| `handleSubmit()` error handling | 103-110 | Replace error message string |
| Loading state JSX | 122-138 | No changes needed (visual only) |
| Form title `<h2>` | 142-144 | Replace with conditional translation |
| Owner field section | 154-179 | Replace label, placeholder, hint text |
| Nickname field section | 182-205 | Replace label, placeholder, hint text |
| Property type field section | 207-231 | Replace label, placeholder |
| Address field section | 233-256 | Replace label, placeholder, hint text |
| Form action buttons | 258-285 | Replace button labels |

### 5.3 Files NOT to Modify

- `/src/types/index.ts` - No type changes needed
- Any other component files
- API routes
- Database migrations

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
| 2F.3: Update property modals | Follows | May share some translation keys |
| 2H.2: Extract button labels | Related | Uses `common.cancel` |

---

## 7. Acceptance Criteria

- [ ] All hardcoded strings in PropertyForm.tsx are replaced with translation function calls
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

## 8. Testing Checklist

### 8.1 Functional Testing
- [ ] Create property form displays all labels correctly
- [ ] Edit property form displays all labels correctly
- [ ] Validation triggers and displays correct messages
- [ ] Character count updates dynamically
- [ ] Submit button shows loading state with translated text
- [ ] Cancel button works correctly

### 8.2 Language Testing
- [ ] Test in English (en) - source language
- [ ] Test in French (fr)
- [ ] Test in Spanish (es)
- [ ] Test in German (de)
- [ ] Test in Dutch (nl)
- [ ] Test in Italian (it)

### 8.3 Visual Regression
- [ ] No text overflow in labels
- [ ] No text overflow in placeholders
- [ ] Buttons accommodate longer translated text
- [ ] Layout remains consistent across languages

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Medium | Build-time check, fallback to English |
| Text overflow in other languages | Medium | Low | Test with German (typically longest) |
| Translation hook not available | Low | High | Verify Epic 1 foundation complete |
| Breaking existing functionality | Low | Medium | Comprehensive testing after changes |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 15 minutes |
| Update PropertyForm component | 30 minutes |
| Copy translations to other 5 languages | 20 minutes |
| Testing and verification | 30 minutes |
| **Total** | **~1.5 hours** |

---

## 11. Code Examples

### 11.1 Before (Current State)

```tsx
<label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
  Property Nickname <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="nickname"
  placeholder="e.g., Main Office, Home, Vacation House"
  // ...
/>
<p className="mt-1 text-xs text-gray-500">
  A friendly name to identify this property ({formData.nickname.length}/100)
</p>
```

### 11.2 After (Translated)

```tsx
<label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
  {t('labels.nickname')} <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="nickname"
  placeholder={t('placeholders.nickname')}
  // ...
/>
<p className="mt-1 text-xs text-gray-500">
  {t('hints.nicknameDescription')} ({t('hints.nicknameCount', { count: formData.nickname.length })})
</p>
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-008
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern Example](/src/components/LogoutButton.tsx)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
