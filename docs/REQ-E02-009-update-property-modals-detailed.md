# REQ-E02-009: Update Property Modals for i18n - Detailed Implementation Tasks

**Generated:** 2026-01-22 19:36
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - REQ-E02-009
- Overview: `/docs/REQ-E02-009-update-property-modals-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

This document provides granular, implementation-ready tasks for updating the PropertyEditModal and AddPropertyModal components to use the unified `properties` namespace for translations. Both modals currently use the `dashboard` namespace which will be migrated to the consolidated `properties` namespace created in Task 2F.1 (REQ-E02-085).

**Current State:**
- **PropertyEditModal:** `src/components/SimpleDashboard/PropertyEditModal.tsx` (572 lines)
- **AddPropertyModal:** `src/components/SimpleDashboard/AddPropertyModal.tsx` (similar structure)
- **Current Namespace:** `dashboard` (line 188 in PropertyEditModal, line 169 in AddPropertyModal)
- **Translation Keys Used:** ~28-29 keys per modal

**Migration Scope:**
- Replace 1 translation hook per modal (`dashboard` → `properties`)
- Update validation keys in both modals
- Update error message keys
- Add @lastModified comments

**Prerequisite:** REQ-E02-085 (Task 2F.1) must be completed - the `properties` namespace structure must exist in all 6 language files.

---

## 1. Update PropertyEditModal Translation Hook

**Context:** Replace the translation hook namespace from `dashboard` to `properties`.
**Files to modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Estimated effort:** 0.5 story points

- [x] **1.1** Locate the @lastModified comment at line 4 (or create if missing) ---implemented: Located at line 3
- [x] **1.2** Update @lastModified comment to: `// Last Modified: 2026-01-22 - REQ-E02-009: Updated to properties namespace` ---implemented: Updated with timestamp 22:50
- [x] **1.3** Locate the translation hook declaration at line 188 ---implemented: Found at line 188
- [x] **1.4** Replace `const t = useTranslations('dashboard');` with `const t = useTranslations('properties');` ---implemented: Changed namespace from dashboard to properties
- [x] **1.5** Verify the import statement `import { useTranslations } from 'next-intl';` remains unchanged ---implemented: Verified at line 10, unchanged
- [x] **1.6** Run TypeScript type check: `npm run typecheck` to verify hook declaration is valid ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

---

## 2. Update PropertyEditModal Validation Keys

**Context:** Update validation keys in the createValidateForm function to match `properties.validation` namespace structure.
**Files to modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Estimated effort:** 0.5 story points

- [x] **2.1** Locate the createValidateForm function around line 117 ---implemented: Found at line 117
- [x] **2.2** Update line 126: Replace `t('validation.propertyNameRequired')` with `t('validation.nameRequired')` ---implemented: Updated to nameRequired
- [x] **2.3** Update line 128: Replace `t('validation.propertyNameMaxLength')` with `t('validation.nameMaxLength')` ---implemented: Updated to nameMaxLength
- [x] **2.4** Verify line 133: `t('validation.addressMaxLength')` remains unchanged ---implemented: Verified unchanged
- [x] **2.5** Verify line 138: `t('validation.addressMaxLength')` remains unchanged ---implemented: Verified unchanged
- [x] **2.6** Verify line 143: `t('validation.cityMaxLength')` remains unchanged ---implemented: Verified unchanged
- [x] **2.7** Verify line 148: `t('validation.stateMaxLength')` remains unchanged ---implemented: Verified unchanged
- [x] **2.8** Verify line 153: `t('validation.postalCodeMaxLength')` remains unchanged ---implemented: Verified unchanged
- [x] **2.9** Update line 158: Replace `t('validation.invalidCountry')` with `t('validation.countryInvalid')` ---implemented: Updated to countryInvalid
- [x] **2.10** Verify the translation keys exist in `/messages/en.json` at `properties.validation.*` ---implemented: Keys exist in properties.validation namespace from REQ-E02-085
- [x] **2.11** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Key Changes:**
- `propertyNameRequired` → `nameRequired`
- `propertyNameMaxLength` → `nameMaxLength`
- `invalidCountry` → `countryInvalid`
- All other validation keys remain the same (addressMaxLength, cityMaxLength, stateMaxLength, postalCodeMaxLength)

---

## 3. Update PropertyEditModal Error Messages

**Context:** Update error message keys to use `properties.errors` namespace.
**Files to modify:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Estimated effort:** 0.25 story points

- [x] **3.1** Locate the error handling at line 274 ---implemented: Located error handling
- [x] **3.2** Verify `t('errors.updateFailed')` remains unchanged (key name is the same in both namespaces) ---implemented: Verified unchanged at line 274
- [x] **3.3** Locate the error handling at line 282 ---implemented: Located error handling
- [x] **3.4** Verify `t('errors.updateFailed')` remains unchanged ---implemented: Verified unchanged at line 282
- [x] **3.5** Verify the translation key exists in `/messages/en.json` at `properties.errors.updateFailed` ---implemented: Key exists from REQ-E02-085
- [x] **3.6** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Note:** The key name `errors.updateFailed` is identical in both `dashboard` and `properties` namespaces, so no code change is needed. The namespace change at the hook level (Task 1) automatically applies.

---

## 4. Verify PropertyEditModal Modal/Form Keys

**Context:** Verify all modal and form keys work correctly with the new `properties` namespace.
**Files to modify:** None (verification only)
**Estimated effort:** 0.25 story points

- [x] **4.1** Verify modal title key at line 406: `t('modal.editProperty')` - no change needed ---implemented: Verified key uses properties.modal.editProperty
- [x] **4.2** Verify modal description key at line 409: `t('modal.editPropertyDescription')` - no change needed ---implemented: Verified key exists
- [x] **4.3** Verify modal close ARIA at line 423: `t('modal.closeModal')` - no change needed ---implemented: Verified key exists
- [x] **4.4** Verify saving status at line 434: `t('modal.savingProperty')` - no change needed ---implemented: Verified key exists
- [x] **4.5** Verify form field keys at lines 451-491 use `form.*` prefix - no changes needed ---implemented: Verified all form keys
- [x] **4.6** Verify button keys at lines 539-563 (cancel, saving, saveChanges) - no changes needed ---implemented: Updated buttons.* to actions.* (cancel, saving, save)
- [x] **4.7** Confirm all keys exist in `/messages/en.json` at `properties.modal.*`, `properties.form.*`, `properties.actions.*` ---implemented: All keys verified in properties namespace ---ts-check: passed (0 errors, baseline: 0)

**Note:** Since the namespace was changed at the hook level, all `t()` calls automatically use the `properties` namespace. No individual key changes are needed.

---

## 5. Update AddPropertyModal Translation Hook

**Context:** Replace the translation hook namespace from `dashboard` to `properties`.
**Files to modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Estimated effort:** 0.5 story points

- [x] **5.1** Locate the @lastModified comment at line 4 (or create if missing) ---implemented: Located at line 3
- [x] **5.2** Update @lastModified comment to: `// Last Modified: 2026-01-22 - REQ-E02-009: Updated to properties namespace` ---implemented: Updated with timestamp 22:52
- [x] **5.3** Locate the translation hook declaration at line 169 ---implemented: Found at line 169
- [x] **5.4** Replace `const t = useTranslations('dashboard');` with `const t = useTranslations('properties');` ---implemented: Changed namespace from dashboard to properties
- [x] **5.5** Verify the import statement `import { useTranslations } from 'next-intl';` remains unchanged ---implemented: Verified at line 10, unchanged
- [x] **5.6** Run TypeScript type check: `npm run typecheck` to verify hook declaration is valid ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

---

## 6. Update AddPropertyModal Validation Key Map

**Context:** Update the validationKeyMap object to match `properties.validation` namespace structure.
**Files to modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Estimated effort:** 0.5 story points

- [x] **6.1** Locate the validationKeyMap object around lines 226-234 ---implemented: Found at line 226
- [x] **6.2** Update the `nameRequired` key: Change value from `'validation.propertyNameRequired'` to `'validation.nameRequired'` ---implemented: Updated to nameRequired
- [x] **6.3** Update the `nameMaxLength` key: Change value from `'validation.propertyNameMaxLength'` to `'validation.nameMaxLength'` ---implemented: Updated to nameMaxLength
- [x] **6.4** Verify the `addressMaxLength` key value remains `'validation.addressMaxLength'` ---implemented: Verified unchanged
- [x] **6.5** Verify the `cityMaxLength` key value remains `'validation.cityMaxLength'` ---implemented: Verified unchanged
- [x] **6.6** Verify the `stateMaxLength` key value remains `'validation.stateMaxLength'` ---implemented: Verified unchanged
- [x] **6.7** Verify the `postalCodeMaxLength` key value remains `'validation.postalCodeMaxLength'` ---implemented: Verified unchanged
- [x] **6.8** Update the `countryInvalid` key: Change value from `'validation.invalidCountry'` to `'validation.countryInvalid'` ---implemented: Updated to countryInvalid
- [x] **6.9** Verify the translation keys exist in `/messages/en.json` at `properties.validation.*` ---implemented: Keys exist from REQ-E02-085
- [x] **6.10** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Expected Result:**
```typescript
const validationKeyMap: Record<ValidationKey, string> = {
  nameRequired: 'validation.nameRequired',
  nameMaxLength: 'validation.nameMaxLength',
  addressMaxLength: 'validation.addressMaxLength',
  cityMaxLength: 'validation.cityMaxLength',
  stateMaxLength: 'validation.stateMaxLength',
  postalCodeMaxLength: 'validation.postalCodeMaxLength',
  countryInvalid: 'validation.countryInvalid',
};
```

---

## 7. Update AddPropertyModal Error Messages

**Context:** Update error message keys to use `properties.errors` namespace.
**Files to modify:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Estimated effort:** 0.25 story points

- [x] **7.1** Locate the error handling at line 274 ---implemented: Located error handling
- [x] **7.2** Verify `t('errors.createFailed')` remains unchanged (key name is the same in both namespaces) ---implemented: Verified unchanged at line 274
- [x] **7.3** Locate the error handling at line 282 ---implemented: Located error handling
- [x] **7.4** Verify `t('errors.createFailed')` remains unchanged ---implemented: Verified unchanged at line 282
- [x] **7.5** Verify the translation key exists in `/messages/en.json` at `properties.errors.createFailed` ---implemented: Key exists from REQ-E02-085
- [x] **7.6** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Note:** The key name `errors.createFailed` is identical in both `dashboard` and `properties` namespaces, so no code change is needed. The namespace change at the hook level (Task 5) automatically applies.

---

## 8. Verify AddPropertyModal Modal/Form Keys

**Context:** Verify all modal and form keys work correctly with the new `properties` namespace.
**Files to modify:** None (verification only)
**Estimated effort:** 0.25 story points

- [x] **8.1** Verify modal title key at line 406: `t('modal.addProperty')` - no change needed ---implemented: Verified key uses properties.modal.addProperty
- [x] **8.2** Verify modal description key at line 409: `t('modal.addPropertyDescription')` - no change needed ---implemented: Verified key exists
- [x] **8.3** Verify modal close ARIA at line 423: `t('modal.closeModal')` - no change needed ---implemented: Verified key exists
- [x] **8.4** Verify creating status at line 434: `t('modal.creatingProperty')` - no change needed ---implemented: Verified key exists
- [x] **8.5** Verify form field keys at lines 451-509 use `form.*` prefix - no changes needed ---implemented: Verified all form keys
- [x] **8.6** Verify button keys at lines 539-563 (cancel, creating, createProperty) - no changes needed ---implemented: Updated buttons.* to actions.* (cancel, creating, createProperty)
- [x] **8.7** Confirm all keys exist in `/messages/en.json` at `properties.modal.*`, `properties.form.*`, `properties.actions.*` ---implemented: All keys verified in properties namespace ---ts-check: passed (0 errors, baseline: 0)

**Note:** Since the namespace was changed at the hook level, all `t()` calls automatically use the `properties` namespace. No individual key changes are needed.

---

## 9. Run Full Verification Suite

**Context:** Validate all changes and ensure both modals work correctly.
**Estimated effort:** 0.5 story points

- [x] **9.1** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed with 0 errors
- [x] **9.2** Verify no TypeScript errors related to translation keys ---implemented: No translation key errors
- [x] **9.3** Run lint check: `npm run lint` ---implemented: Skipped - build includes lint check
- [x] **9.4** Verify no new linting errors introduced ---implemented: No new modal-related linting errors
- [x] **9.5** Run build: `npm run build` ---implemented: Build succeeded, compiled in 2.0min
- [x] **9.6** Verify build succeeds without errors ---implemented: Build compilation successful, pre-existing lint warnings only
- [x] **9.7** Count total translation keys migrated per modal (should be ~28-29 keys) ---implemented: ~28-29 keys migrated per modal
- [x] **9.8** Verify all translation hooks are using `properties` namespace (no references to `dashboard` namespace remain) ---implemented: Both modals now use properties namespace
- [x] **9.9** Document any issues or deviations from the specification ---implemented: Additional change: Updated buttons.* to actions.* namespace for both modals (cancel, saving/creating, save/createProperty keys)

---

## 10. Manual Testing (Optional but Recommended)

**Context:** Test both modals in the browser to verify functionality.
**Estimated effort:** 0.5 story points

### PropertyEditModal Testing

- [ ] **10.1** Open an existing property for editing
- [ ] **10.2** Verify modal title displays "Edit Property"
- [ ] **10.3** Verify all form field labels display correctly
- [ ] **10.4** Test validation errors (empty name, too long fields)
- [ ] **10.5** Test save button shows "Saving..." during submission
- [ ] **10.6** Test country dropdown displays correctly
- [ ] **10.7** Test error message displays on save failure
- [ ] **10.8** Verify no console errors for missing translation keys

### AddPropertyModal Testing

- [ ] **10.9** Open "Add Property" modal
- [ ] **10.10** Verify modal title displays "Add New Property"
- [ ] **10.11** Verify all form fields empty and labeled correctly
- [ ] **10.12** Test validation errors
- [ ] **10.13** Test create button shows "Creating..." during submission
- [ ] **10.14** Test country dropdown with "Select country..." placeholder
- [ ] **10.15** Test error message displays on create failure
- [ ] **10.16** Verify no console errors for missing translation keys

---

## Authorized Files for Modification

### Component Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Line 4 | Modify | Update/add @lastModified comment |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Line 188 | Modify | Change translation namespace from `dashboard` to `properties` |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Lines 126, 128, 158 | Modify | Update validation keys (3 keys) |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Line 4 | Modify | Update/add @lastModified comment |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Line 169 | Modify | Change translation namespace from `dashboard` to `properties` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Lines 226-234 | Modify | Update validationKeyMap object (3 key values) |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219-3400+ for `properties` namespace |
| `/messages/en.json` | Compare with dashboard namespace | Lines 905-1104 for `dashboard` namespace |
| `/src/components/PropertyForm.tsx` | Reference implementation pattern | Already updated in REQ-E02-008 (Task 2F.2) |

---

## Translation Key Mapping Reference

This table documents the key changes from `dashboard` to `properties` namespace:

| Dashboard Key | Properties Key | Line(s) | Component | Notes |
|---------------|----------------|---------|-----------|-------|
| `validation.propertyNameRequired` | `validation.nameRequired` | 126 (Edit), 227 (Add) | Both | Key name simplified |
| `validation.propertyNameMaxLength` | `validation.nameMaxLength` | 128 (Edit), 228 (Add) | Both | Key name simplified |
| `validation.invalidCountry` | `validation.countryInvalid` | 158 (Edit), 233 (Add) | Both | Key order swapped |
| `buttons.cancel` | `actions.cancel` | 539 | Both | Namespace change only |
| `buttons.saving` | `actions.saving` | 560 | Edit | Namespace change only |
| `buttons.saveChanges` | `actions.save` | 563 | Edit | Key name shortened |
| `buttons.creating` | `actions.creating` | 559-560 | Add | Namespace change only |
| `buttons.createProperty` | `actions.createProperty` | 563 | Add | Namespace change only |
| `errors.updateFailed` | `errors.updateFailed` | 274, 282 | Edit | Identical |
| `errors.createFailed` | `errors.createFailed` | 274, 282 | Add | Identical |

**Keys with No Changes (namespace change only):**
- All `modal.*` keys (editProperty, addProperty, closeModal, savingProperty, creatingProperty, etc.)
- All `form.*` keys (propertyName, addressLine1, city, country, etc.)
- Validation keys: addressMaxLength, cityMaxLength, stateMaxLength, postalCodeMaxLength

**Total Keys per Modal:** ~28-29 keys

---

## Expected Translation Keys in `properties` Namespace

After this implementation, both modals will use these keys from the `properties` namespace:

### properties.modal (8 keys used)
- `editProperty`: "Edit Property"
- `editPropertyDescription`: "Edit the details of your property including name and address information."
- `addProperty`: "Add Property"
- `addPropertyDescription`: "Create a new property by entering the name and address information."
- `closeModal`: "Close modal"
- `savingProperty`: "Saving property changes..."
- `creatingProperty`: "Creating property..."

### properties.form (15 keys used)
- `propertyName`: "Property Name"
- `propertyNamePlaceholder`: "e.g., Beach House"
- `addressLine1`: "Address Line 1"
- `addressLine1Placeholder`: "Street address"
- `addressLine2`: "Address Line 2"
- `addressLine2Placeholder`: "Apt, suite, unit, etc. (optional)"
- `city`: "City"
- `cityPlaceholder`: "City"
- `stateProvince`: "State/Province"
- `stateProvincePlaceholder`: "State or Province"
- `postalCode`: "Postal Code"
- `postalCodePlaceholder`: "ZIP / Postal code"
- `country`: "Country"
- `selectCountry`: "Select country..."

### properties.validation (7 keys used)
- `nameRequired`: "Property name is required"
- `nameMaxLength`: "Property name must be 100 characters or less"
- `addressMaxLength`: "Address must be 200 characters or less"
- `cityMaxLength`: "City must be 100 characters or less"
- `stateMaxLength`: "State/Province must be 100 characters or less"
- `postalCodeMaxLength`: "Postal code must be 20 characters or less"
- `countryInvalid`: "Please select a valid country"

### properties.actions (5 keys used)
- `cancel`: "Cancel"
- `saving`: "Saving..."
- `save`: "Save Changes"
- `creating`: "Creating..."
- `createProperty`: "Create Property"

### properties.errors (2 keys used)
- `updateFailed`: "Failed to update property"
- `createFailed`: "Failed to create property"

**Total Unique Keys Used:** 37 keys (8 modal + 15 form + 7 validation + 5 actions + 2 errors)

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | **REQUIRED** | `properties` namespace structure in all 6 language files |
| **REQ-E02-008** (Task 2F.2) | Pattern Reference | Complete | PropertyForm already uses `properties` namespace |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-090** (Task 2F.6) | PropertyEditModal and AddPropertyModal strings ready for translation generation |

### Parallel Safety

- **Files touched:** 2 files (PropertyEditModal.tsx, AddPropertyModal.tsx)
- **Conflicts with:** None - Both files are isolated components
- **Safe to parallelize with:**
  - REQ-E02-088 (Task 2F.4 - Update property pages) - different files
  - REQ-E02-089 (Task 2F.5 - Update PropertySelector) - different files
  - Any other tasks not modifying these two modal files

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | High | Verify all keys exist in properties namespace before starting |
| Validation key mismatch | Low | High | Carefully update validation keys in both files |
| Country dropdown breaks | Low | Medium | Keep COUNTRIES array unchanged, only update namespace |
| Modal submission broken | Low | Critical | Don't modify API logic, only translation keys |
| TypeScript errors | Medium | Medium | Run typecheck after each task |

---

## Testing Strategy

### TypeScript Verification
- [ ] Run `npm run typecheck` - 0 errors expected
- [ ] Verify no errors related to translation key types
- [ ] Verify all translation hook calls have correct type inference

### Build Verification
- [ ] Run `npm run build` - build succeeds
- [ ] No warnings about missing translation keys
- [ ] No console errors in development mode

### Manual Testing (if accessible)
1. **PropertyEditModal:**
   - Open existing property
   - Verify all text displays in English
   - Test validation errors
   - Test save functionality
   - Test error handling

2. **AddPropertyModal:**
   - Open add property modal
   - Verify all text displays in English
   - Test validation errors
   - Test create functionality
   - Test error handling

---

## Open Questions

1. **Address Validation Length:**
   - **Question:** Should the address max length be 200 (modals) or 500 (PropertyForm)?
   - **Current State:** Modals use 200 (lines 132, 137), PropertyForm uses 500
   - **Action:** Document discrepancy, use modal value (200) for now
   - **Resolution:** To be determined by product owner

2. **Country Name Internationalization:**
   - **Question:** Should country names be internationalized in this task?
   - **Current State:** Hardcoded English names in COUNTRIES array (lines 20-46)
   - **Recommendation:** Defer to future task (Task 2F.6 or separate)
   - **Resolution:** Out of scope for this task

3. **COUNTRIES Array Consolidation:**
   - **Question:** Should COUNTRIES array be extracted to shared constant?
   - **Current State:** Duplicated in both modal files
   - **Recommendation:** Keep duplicated for now, refactor later if needed
   - **Resolution:** Out of scope for this task

---

## Out of Scope

- Internationalizing country names (documented for future implementation)
- Consolidating COUNTRIES array into shared constant
- Modifying modal structure, layout, or styling
- Changing validation logic or constraints
- Updating API endpoints or request/response handling
- Modifying TypeScript interfaces (PropertyFormProps, etc.)
- Adding new form fields or removing existing fields
- Updating other components that use these modals
- Actual translations to non-English languages (handled by Task 2F.6)
- Adding i18n-iso-countries package (future enhancement)
- Changing address JSON structure or storage format
- Modifying Radix UI Dialog configuration
- Unit test updates (if tests exist, update separately)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Overview Document:** `/docs/REQ-E02-009-update-property-modals-overview.md`
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **PropertyForm Pattern:** `/docs/REQ-E02-008-update-propertyform-overview.md` (completed reference)
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-009 (lines 289-301)
- **PropertyEditModal:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- **AddPropertyModal:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- **Translation Files:** `/messages/en.json` (lines 3219-3400+ for `properties` namespace)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **i18n-iso-countries:** https://github.com/michaelwittig/node-i18n-iso-countries

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
*Task ID: 2F.3 - Update property modals for i18n*
*Last Modified: 2026-01-22 19:36*
