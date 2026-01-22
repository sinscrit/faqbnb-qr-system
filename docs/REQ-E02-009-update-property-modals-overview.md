# REQ-E02-009: Update Property Modals for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-009
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.3
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 19:33
**Last Modified:** 2026-01-22 19:33

---

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-009 (Task 2F.3) |
| Source File | docs/gen_requests.md (Request #9) |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 19:33 |
| T-shirt Size | S (Small) |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Summary

This document provides the implementation breakdown for updating the PropertyEditModal and AddPropertyModal components to use the new `properties` namespace for translations. Both modals currently use the `dashboard` namespace (lines 188, 169 respectively) which needs to be migrated to the unified `properties` namespace created in Task 2F.1.

**Components:**
- **PropertyEditModal** (`src/components/SimpleDashboard/PropertyEditModal.tsx`, 572 lines) - Edit existing property
- **AddPropertyModal** (`src/components/SimpleDashboard/AddPropertyModal.tsx`, similar structure) - Create new property

The implementation plan specifies ~30 strings per modal (60 total). Investigation shows both modals already have i18n using `dashboard.modal.*`, `dashboard.form.*`, `dashboard.validation.*`, `dashboard.buttons.*`, and `dashboard.errors.*` namespaces.

**Key Finding:** Both modals share nearly identical structure and translation key usage. The migration will be straightforward namespace replacement from `dashboard.*` to `properties.*` with identical key names already existing in the `properties` namespace.

---

## Goals

### Functional Requirements

1. Migrate PropertyEditModal from `dashboard` to `properties` namespace
2. Migrate AddPropertyModal from `dashboard` to `properties` namespace
3. Update modal titles and descriptions to use `properties.modal.*`
4. Update form field labels/placeholders to use `properties.form.*`
5. Update validation errors to use `properties.validation.*`
6. Update button labels to use `properties.actions.*`
7. Update error messages to use `properties.errors.*`
8. Maintain country dropdown functionality (hardcoded English names for now)
9. Preserve all accessibility features (ARIA labels, screen readers)
10. Keep modal behavior and validation logic unchanged

### Assumptions & Clarifications

- Task 2F.1 (Create `properties` namespace structure) has been completed
- The `properties` namespace exists in all 6 language files with required keys
- Both modals are client components using `useTranslations` hook
- Country names remain hardcoded in English (lines 20-46 in both files)
  - **Future consideration:** Use `i18n-iso-countries` package for full localization
- Modal structure, validation logic, and API calls should not be modified
- Character count limits match between namespaces (name: 100, address: 200, city/state: 100, postal: 20)

---

## Requirements Analysis

### Current Implementation Analysis

#### PropertyEditModal (572 lines)

**Current Translation Usage (line 188):**
```typescript
const t = useTranslations('dashboard');
```

**Translation Keys Used:**

| Current Key | Line(s) | New Key | Category |
|-------------|---------|---------|----------|
| `t('modal.editProperty')` | 406 | `properties.modal.editProperty` | Title |
| `t('modal.editPropertyDescription')` | 409 | `properties.modal.editPropertyDescription` | Description |
| `t('modal.closeModal')` | 423 | `properties.modal.closeModal` | ARIA |
| `t('modal.savingProperty')` | 434 | `properties.modal.savingProperty` | Screen reader |
| `t('form.propertyName')` | 451 | `properties.form.propertyName` | Label |
| `t('form.propertyNamePlaceholder')` | 454 | `properties.form.propertyNamePlaceholder` | Placeholder |
| `t('form.addressLine1')` | 458 | `properties.form.addressLine1` | Label |
| `t('form.addressLine1Placeholder')` | 460 | `properties.form.addressLine1Placeholder` | Placeholder |
| `t('form.addressLine2')` | 464 | `properties.form.addressLine2` | Label |
| `t('form.addressLine2Placeholder')` | 466 | `properties.form.addressLine2Placeholder` | Placeholder |
| `t('form.city')` | 471 | `properties.form.city` | Label |
| `t('form.cityPlaceholder')` | 473 | `properties.form.cityPlaceholder` | Placeholder |
| `t('form.stateProvince')` | 475 | `properties.form.stateProvince` | Label |
| `t('form.stateProvincePlaceholder')` | 477 | `properties.form.stateProvincePlaceholder` | Placeholder |
| `t('form.postalCode')` | 483 | `properties.form.postalCode` | Label |
| `t('form.postalCodePlaceholder')` | 485 | `properties.form.postalCodePlaceholder` | Placeholder |
| `t('form.country')` | 491 | `properties.form.country` | Label |
| `t('validation.propertyNameRequired')` | 126 | `properties.validation.nameRequired` | Validation |
| `t('validation.propertyNameMaxLength')` | 128 | `properties.validation.nameMaxLength` | Validation |
| `t('validation.addressMaxLength')` | 133, 138 | `properties.validation.addressMaxLength` | Validation |
| `t('validation.cityMaxLength')` | 143 | `properties.validation.cityMaxLength` | Validation |
| `t('validation.stateMaxLength')` | 148 | `properties.validation.stateMaxLength` | Validation |
| `t('validation.postalCodeMaxLength')` | 153 | `properties.validation.postalCodeMaxLength` | Validation |
| `t('validation.invalidCountry')` | 158 | `properties.validation.countryInvalid` | Validation |
| `t('buttons.cancel')` | 539 | `properties.actions.cancel` | Button |
| `t('buttons.saving')` | 560 | `properties.actions.saving` | Button |
| `t('buttons.saveChanges')` | 563 | `properties.actions.save` | Button |
| `t('errors.updateFailed')` | 274, 282 | `properties.errors.updateFailed` | Error |

**Total:** ~28 unique keys

#### AddPropertyModal (similar structure)

**Current Translation Usage (line 169):**
```typescript
const t = useTranslations('dashboard');
```

**Translation Keys Used:**

| Current Key | Line(s) | New Key | Category |
|-------------|---------|---------|----------|
| `t('modal.addProperty')` | 406 | `properties.modal.addProperty` | Title |
| `t('modal.addPropertyDescription')` | 409 | `properties.modal.addPropertyDescription` | Description |
| `t('modal.closeModal')` | 423 | `properties.modal.closeModal` | ARIA |
| `t('modal.creatingProperty')` | 434 | `properties.modal.creatingProperty` | Screen reader |
| `t('form.propertyName')` | 451 | `properties.form.propertyName` | Label |
| `t('form.propertyNamePlaceholder')` | 454 | `properties.form.propertyNamePlaceholder` | Placeholder |
| `t('form.addressLine1')` | 458 | `properties.form.addressLine1` | Label |
| `t('form.addressLine1Placeholder')` | 460 | `properties.form.addressLine1Placeholder` | Placeholder |
| `t('form.addressLine2')` | 464 | `properties.form.addressLine2` | Label |
| `t('form.addressLine2Placeholder')` | 466 | `properties.form.addressLine2Placeholder` | Placeholder |
| `t('form.city')` | 471 | `properties.form.city` | Label |
| `t('form.cityPlaceholder')` | 473 | `properties.form.cityPlaceholder` | Placeholder |
| `t('form.stateProvince')` | 475 | `properties.form.stateProvince` | Label |
| `t('form.stateProvincePlaceholder')` | 477 | `properties.form.stateProvincePlaceholder` | Placeholder |
| `t('form.postalCode')` | 483 | `properties.form.postalCode` | Label |
| `t('form.postalCodePlaceholder')` | 485 | `properties.form.postalCodePlaceholder` | Placeholder |
| `t('form.country')` | 491 | `properties.form.country` | Label |
| `t('form.selectCountry')` | 509 | `properties.form.selectCountry` | Placeholder |
| Validation (inline keys 227-233) | 227-237 | `properties.validation.*` | Validation |
| `t('buttons.cancel')` | 539 | `properties.actions.cancel` | Button |
| `t('buttons.creating')` | 559, 560 | `properties.actions.creating` | Button |
| `t('buttons.createProperty')` | 563 | `properties.actions.createProperty` | Button |
| `t('errors.createFailed')` | 274, 282 | `properties.errors.createFailed` | Error |

**Total:** ~29 unique keys

### Key Differences Between Modals

1. **Modal Titles/Descriptions:**
   - PropertyEditModal: `editProperty`, `editPropertyDescription`, `savingProperty`, `saveChanges`
   - AddPropertyModal: `addProperty`, `addPropertyDescription`, `creatingProperty`, `createProperty`

2. **Validation Approach:**
   - PropertyEditModal: Direct translation in validation function (line 117-162)
   - AddPropertyModal: Returns validation keys, translates via map (lines 94-145, 226-237)

3. **Country Dropdown:**
   - PropertyEditModal: Hardcoded English labels directly (line 509: `{country.label}`)
   - AddPropertyModal: Uses labelKey for placeholder (line 22, 509: `t('form.selectCountry')`)

---

## Technical Approach

### Migration Strategy

Both modals follow identical patterns and will have parallel migrations:

1. **Update translation hook declaration** (PropertyEditModal line 188, AddPropertyModal line 169):
   - Replace `const t = useTranslations('dashboard')` with `const t = useTranslations('properties')`

2. **Update namespace references throughout**:
   - `dashboard.modal.*` → `properties.modal.*`
   - `dashboard.form.*` → `properties.form.*`
   - `dashboard.validation.*` → `properties.validation.*`
   - `dashboard.buttons.*` → `properties.actions.*`
   - `dashboard.errors.*` → `properties.errors.*`

3. **Handle validation key differences**:
   - PropertyEditModal: Update validation keys in createValidateForm function
   - AddPropertyModal: Update validationKeyMap object (lines 226-234)

4. **Preserve country dropdown behavior**:
   - Keep COUNTRIES array unchanged (lines 20-46 in both files)
   - Country names remain in English (future: use i18n-iso-countries)

### Translation Key Mapping

Most keys have 1:1 mapping with namespace change only. Exceptions:

| Dashboard Key | Properties Key | Notes |
|---------------|----------------|-------|
| `buttons.saveChanges` | `actions.save` | Shorter key name |
| `buttons.createProperty` | `actions.createProperty` | Identical |
| `buttons.cancel` | `actions.cancel` | Identical |
| `buttons.saving` | `actions.saving` | Identical |
| `buttons.creating` | `actions.creating` | Identical |
| `validation.propertyNameRequired` | `validation.nameRequired` | Simpler key |
| `validation.propertyNameMaxLength` | `validation.nameMaxLength` | Simpler key |
| `validation.invalidCountry` | `validation.countryInvalid` | Key order swap |

---

## Implementation Tasks

### Task 1: Update PropertyEditModal translation namespace (Priority: High)

**Description:** Migrate PropertyEditModal from `dashboard` namespace to `properties` namespace.

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

**Changes Required:**

**Line 4** - Update @lastModified comment:
```typescript
// Last Modified: 2026-01-22 19:33 - REQ-E02-009: Updated to properties namespace
```

**Line 188** - Replace:
```typescript
const t = useTranslations('dashboard');
```

**With:**
```typescript
const t = useTranslations('properties');
```

**Lines 126-158** - Update validation keys in createValidateForm function:

Replace:
```typescript
errors.name = t('validation.propertyNameRequired');        // Line 126
errors.name = t('validation.propertyNameMaxLength');       // Line 128
errors.addressLine1 = t('validation.addressMaxLength');    // Line 133
errors.addressLine2 = t('validation.addressMaxLength');    // Line 138
errors.city = t('validation.cityMaxLength');               // Line 143
errors.state = t('validation.stateMaxLength');             // Line 148
errors.postalCode = t('validation.postalCodeMaxLength');   // Line 153
errors.country = t('validation.invalidCountry');           // Line 158
```

**With:**
```typescript
errors.name = t('validation.nameRequired');                // Line 126
errors.name = t('validation.nameMaxLength');               // Line 128
errors.addressLine1 = t('validation.addressMaxLength');    // Line 133
errors.addressLine2 = t('validation.addressMaxLength');    // Line 138
errors.city = t('validation.cityMaxLength');               // Line 143
errors.state = t('validation.stateMaxLength');             // Line 148
errors.postalCode = t('validation.postalCodeMaxLength');   // Line 153
errors.country = t('validation.countryInvalid');           // Line 158
```

**Lines 274, 282** - Update error messages:

Replace:
```typescript
throw new Error(data.error || t('errors.updateFailed'));
// ...
general: error instanceof Error ? error.message : t('errors.updateFailed')
```

**With:**
```typescript
throw new Error(data.error || t('errors.updateFailed'));
// ...
general: error instanceof Error ? error.message : t('errors.updateFailed')
```

**Lines 406-563** - Update all modal/form/button keys:

All keys remain the same relative path but with `properties` namespace instead of `dashboard`:
- `modal.editProperty`, `modal.editPropertyDescription`, `modal.closeModal`, `modal.savingProperty`
- `form.*` keys (8 field labels + 7 placeholders)
- `buttons.cancel`, `buttons.saving`, `buttons.saveChanges`

**Note:** Since we're changing the namespace at the hook level (line 188), all `t()` calls automatically use the `properties` namespace. Only validation keys inside the validation function need updates.

**Acceptance Criteria:**
- [ ] Translation hook uses `properties` namespace
- [ ] Validation keys updated to match `properties.validation` structure
- [ ] All modal strings display correctly
- [ ] Form validation works with new keys
- [ ] TypeScript compilation succeeds

---

### Task 2: Update AddPropertyModal translation namespace (Priority: High)

**Description:** Migrate AddPropertyModal from `dashboard` namespace to `properties` namespace.

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

**Changes Required:**

**Line 4** - Update @lastModified comment:
```typescript
// Last Modified: 2026-01-22 19:33 - REQ-E02-009: Updated to properties namespace
```

**Line 169** - Replace:
```typescript
const t = useTranslations('dashboard');
```

**With:**
```typescript
const t = useTranslations('properties');
```

**Lines 226-234** - Update validationKeyMap object:

Replace:
```typescript
const validationKeyMap: Record<ValidationKey, string> = {
  nameRequired: 'validation.propertyNameRequired',
  nameMaxLength: 'validation.propertyNameMaxLength',
  addressMaxLength: 'validation.addressMaxLength',
  cityMaxLength: 'validation.cityMaxLength',
  stateMaxLength: 'validation.stateMaxLength',
  postalCodeMaxLength: 'validation.postalCodeMaxLength',
  countryInvalid: 'validation.invalidCountry',
};
```

**With:**
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

**Lines 274, 282** - Update error messages:

Replace:
```typescript
throw new Error(data.error || t('errors.createFailed'));
// ...
general: error instanceof Error ? error.message : t('errors.createFailed')
```

**With:**
```typescript
throw new Error(data.error || t('errors.createFailed'));
// ...
general: error instanceof Error ? error.message : t('errors.createFailed')
```

**Lines 406-563** - Update all modal/form/button keys:

All keys remain the same relative path but with `properties` namespace instead of `dashboard`:
- `modal.addProperty`, `modal.addPropertyDescription`, `modal.closeModal`, `modal.creatingProperty`
- `form.*` keys (8 field labels + 8 placeholders including `selectCountry`)
- `buttons.cancel`, `buttons.creating`, `buttons.createProperty`

**Note:** Since we're changing the namespace at the hook level (line 169), all `t()` calls automatically use the `properties` namespace. Only the validation key map needs updates.

**Acceptance Criteria:**
- [ ] Translation hook uses `properties` namespace
- [ ] Validation key map updated to match `properties.validation` structure
- [ ] All modal strings display correctly
- [ ] Form validation works with new keys
- [ ] TypeScript compilation succeeds

---

### Task 3: Verify key compatibility between namespaces (Priority: High)

**Description:** Cross-reference all translation keys between `dashboard` and `properties` namespaces to ensure smooth migration.

**Investigation Required:**

1. Compare `dashboard.modal.*` keys (en.json lines 1051-1058) with `properties.modal.*` keys (lines 3309-3327)
2. Compare `dashboard.form.*` keys (lines 1060-1074) with `properties.form.*` keys (lines 3261-3286)
3. Compare `dashboard.validation.*` keys (lines 1076-1083) with `properties.validation.*` keys
4. Compare `dashboard.buttons.*` keys (lines 1085-1092) with `properties.actions.*` keys (lines 3249-3259)
5. Compare `dashboard.errors.*` keys (lines 1094-1096) with `properties.errors.*` keys (lines 3302-3307)

**Expected Findings:**
- Most keys exist with identical or similar values
- `properties.validation` uses simpler key names (`nameRequired` vs `propertyNameRequired`)
- `properties.actions` namespace replaces `dashboard.buttons` namespace
- Country dropdown placeholder uses `selectCountry` in both namespaces

**Acceptance Criteria:**
- [ ] All required keys exist in `properties` namespace
- [ ] Key value content is equivalent or better than `dashboard` namespace
- [ ] No missing translation keys identified
- [ ] Documentation of any semantic differences

---

### Task 4: Test modal functionality with new namespace (Priority: High)

**Description:** Verify both modals work correctly with the new `properties` namespace.

**Testing Steps:**

**PropertyEditModal:**
1. Open existing property for editing
2. Verify modal title displays: "Edit Property"
3. Verify all form field labels display correctly
4. Test validation errors (empty name, too long fields)
5. Test character counters display correctly
6. Test save button shows "Saving..." during submission
7. Test country dropdown displays correctly
8. Test error message displays on save failure

**AddPropertyModal:**
1. Open "Add Property" modal
2. Verify modal title displays: "Add New Property"
3. Verify all form fields empty and labeled correctly
4. Test validation errors
5. Test character counters
6. Test create button shows "Creating..." during submission
7. Test country dropdown with "Select country..." placeholder
8. Test error message displays on create failure

**Acceptance Criteria:**
- [ ] PropertyEditModal displays all text correctly
- [ ] AddPropertyModal displays all text correctly
- [ ] Validation messages display in English (en.json)
- [ ] Button labels update during submission states
- [ ] No console errors for missing translation keys
- [ ] Form submission works (create and edit)
- [ ] Character counters display correctly
- [ ] Country dropdown works

---

### Task 5: Update country dropdown internationalization approach (Priority: Medium - Future)

**Description:** Document approach for internationalizing country names in the future.

**Current Implementation:**
- Lines 20-46 in both files: `COUNTRIES` array with hardcoded English names
- PropertyEditModal line 509: `{country.label}`
- AddPropertyModal line 509: `{'labelKey' in country ? t('form.selectCountry') : country.label}`

**Future Approach Options:**

**Option 1: Use i18n-iso-countries package**
```typescript
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';
// etc.

countries.registerLocale(en);
countries.registerLocale(fr);

// In component:
const locale = useLocale(); // from next-intl
const countryName = countries.getName(countryCode, locale);
```

**Option 2: Add country names to translation files**
```json
"properties": {
  "countries": {
    "US": "United States",
    "CA": "Canada",
    // ... all countries
  }
}
```

**Recommendation:** Option 1 (i18n-iso-countries) provides:
- Standardized country name translations
- Support for all locales
- Maintained by the community
- Smaller file size than manual translation

**Acceptance Criteria:**
- [ ] Document current hardcoded approach
- [ ] Document recommended future approach
- [ ] Add TODO comments in code (lines 17-19 in both files)
- [ ] Include in out-of-scope section

---

### Task 6: Verify TypeScript compilation and run tests (Priority: High)

**Description:** Ensure TypeScript compilation succeeds and run any existing tests.

**Verification Steps:**

1. Run TypeScript compilation:
   ```bash
   npm run typecheck
   ```

2. Check for translation key errors in console

3. If modal tests exist, run them:
   ```bash
   npm test -- PropertyEditModal
   npm test -- AddPropertyModal
   ```

4. Visual inspection in browser (if possible):
   - Test in English locale
   - Test form validation
   - Test modal open/close
   - Test API submission

**Acceptance Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] No console warnings for missing translation keys
- [ ] All existing tests pass
- [ ] Visual inspection confirms correct display
- [ ] Both modals ready for translation generation (Task 2F.6)

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Component Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Line 4 | Modify | Update @lastModified comment |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Line 188 | Modify | Change translation namespace from `dashboard` to `properties` |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Lines 126-158 | Modify | Update validation keys in createValidateForm function |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Lines 274, 282 | Modify | Update error message keys |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Line 4 | Modify | Update @lastModified comment |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Line 169 | Modify | Change translation namespace from `dashboard` to `properties` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Lines 226-234 | Modify | Update validationKeyMap object |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Lines 274, 282 | Modify | Update error message keys |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219-3327 for `properties` namespace |
| `/messages/en.json` | Compare with dashboard namespace | Lines 905-1104 for `dashboard` namespace |
| `/src/components/PropertyForm.tsx` | Reference implementation pattern | Already updated in REQ-E02-008 |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | Required | `properties` namespace structure in all 6 language files |
| **REQ-E02-008** (Task 2F.2) | Pattern Reference | Complete | PropertyForm already uses `properties` namespace |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-090** (Task 2F.6) | PropertyEditModal and AddPropertyModal strings ready for translation generation |

### Parallel Safety

- **Files touched**: 2 files (PropertyEditModal.tsx, AddPropertyModal.tsx)
- **Conflicts with**: None - Both files are isolated components
- **Safe to parallelize with**:
  - REQ-E02-088 (Task 2F.4 - Update property pages) - different files
  - REQ-E02-089 (Task 2F.5 - Update PropertySelector) - different files

### External Dependencies

- `next-intl` package (from Epic 1)
- `@radix-ui/react-dialog` (already installed)
- Translation files in `/messages/*.json` (6 languages)

---

## Risks and Considerations

### Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing translation keys | High | Verify all keys exist in Task 3 before implementation |
| Validation key mismatch | High | Careful update of validation functions in both modals |
| Country dropdown breaks | Medium | Keep COUNTRIES array unchanged, only update namespace |
| Modal submission broken | High | Test thoroughly after changes, don't modify API logic |
| Character counters off | Low | Verify max length values match between namespaces (100, 200, 20) |

### Testing Requirements

- **Unit Tests**: Update test cases if modals have existing tests
- **Integration Tests**: Test full create/edit property flows
- **Visual Testing**:
  - Verify all labels, placeholders display correctly
  - Test validation error messages
  - Test button state changes (saving, creating)
  - Test character counters
  - Test modal in both desktop and mobile views
- **Browser Testing**: Test in actual application with live translation files
- **Language Testing**: Verify works with all 6 supported languages (en, fr, es, de, nl, it)

### Open Questions

- [ ] Should country names be internationalized now or later?
  - **Recommendation:** Later (Task 2F.6 or separate task), document approach in Task 5
- [ ] Should we consolidate COUNTRIES array into a shared constant?
  - **Recommendation:** No, keep in each file for now; future refactor can extract
- [ ] Are there existing tests for PropertyEditModal and AddPropertyModal?
  - **Action Required:** Check for test files before implementation
- [ ] Should we update the address validation max length to match spec (200 vs 500)?
  - **Current:** Both modals use 200 characters (lines 132, 137)
  - **PropertyForm:** Uses 500 characters
  - **Action Required:** Verify correct limit with stakeholders

---

## Out of Scope

- Internationalizing country names (documented in Task 5 for future implementation)
- Modifying modal structure, layout, or styling
- Changing validation logic or constraints
- Updating API endpoints or request/response handling
- Modifying PropertyFormProps or related TypeScript interfaces
- Adding new form fields or removing existing fields
- Consolidating COUNTRIES array into shared constant
- Updating other components that use these modals (handled by other tasks)
- Actual translations to other languages (handled by Task 2F.6)
- Adding i18n-iso-countries package (future enhancement)
- Changing address JSON structure or storage format
- Modifying Radix UI Dialog configuration

---

## Verification Checklist

### Pre-Implementation
- [ ] REQ-E02-085 (Task 2F.1) completed - `properties` namespace exists
- [ ] REQ-E02-008 (Task 2F.2) completed - PropertyForm uses `properties` namespace (pattern reference)
- [ ] Reviewed PropertyEditModal.tsx current implementation
- [ ] Reviewed AddPropertyModal.tsx current implementation
- [ ] Cross-referenced all translation keys between namespaces

### Implementation
- [ ] PropertyEditModal translation hook updated to `properties` namespace
- [ ] PropertyEditModal validation keys updated
- [ ] PropertyEditModal error keys updated
- [ ] PropertyEditModal @lastModified comment added
- [ ] AddPropertyModal translation hook updated to `properties` namespace
- [ ] AddPropertyModal validation key map updated
- [ ] AddPropertyModal error keys updated
- [ ] AddPropertyModal @lastModified comment added

### Post-Implementation
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No console errors for missing translation keys
- [ ] PropertyEditModal displays correctly (title, labels, placeholders, buttons)
- [ ] PropertyEditModal validation works
- [ ] PropertyEditModal submission works
- [ ] AddPropertyModal displays correctly
- [ ] AddPropertyModal validation works
- [ ] AddPropertyModal submission works
- [ ] Character counters display and update correctly in both modals
- [ ] Country dropdowns work in both modals
- [ ] Error messages display on API failures
- [ ] Both modals work in desktop and mobile views
- [ ] Ready for translation generation (Task 2F.6)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **PropertyForm Pattern:** `/docs/REQ-E02-008-update-propertyform-overview.md` (completed)
- **PropertyEditModal:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- **AddPropertyModal:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- **Translation Files:** `/messages/en.json` (lines 905-1104 for `dashboard`, lines 3219-3327 for `properties`)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **i18n-iso-countries:** https://github.com/michaelwittig/node-i18n-iso-countries

---

*Document generated: 2026-01-22 19:33*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
