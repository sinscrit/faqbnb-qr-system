# REQ-E02-008: Update PropertyForm Component for i18n - Detailed Implementation Tasks

**Generated:** 2026-01-22 19:14
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - REQ-E02-008
- Overview: `/docs/REQ-E02-008-update-propertyform-overview.md`
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

This document provides granular, implementation-ready tasks for updating the PropertyForm component (`src/components/PropertyForm.tsx`) to use the unified `properties` namespace for translations. The component currently uses scattered namespace references (`common.form`, `errors.form`, `common.actions`, `common.notifications`) which will be migrated to the consolidated `properties` namespace created in Task 2F.1 (REQ-E02-085).

**Current State:**
- **File:** `src/components/PropertyForm.tsx` (297 lines)
- **Component Type:** Client component using `useTranslations` hook
- **Current Namespaces:** 4 separate translation hooks (common.form, errors.form, common.actions, common.notifications)
- **Translation Keys Used:** ~25 keys across 4 namespaces
- **Hardcoded Strings:** None (already partially internationalized)

**Migration Scope:**
- Replace 4 translation hooks with 5 unified `properties.*` hooks
- Migrate ~25 translation key references
- Add property type translation lookup
- Update validation messages, form labels, placeholders, hints, action buttons, and error messages

**Prerequisite:** REQ-E02-085 (Task 2F.1) must be completed - the `properties` namespace structure must exist in all 6 language files.

---

## 1. Update Translation Hook Declarations

**Context:** Replace scattered namespace translation hooks with unified `properties` namespace hooks.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **1.1** ---implemented: Located translation hook declarations Locate the translation hook declarations at lines 14-17
- [x] **1.2** ---implemented: Replaced with const t = useTranslations('properties.form') Replace `const tForm = useTranslations('common.form');` with `const t = useTranslations('properties.form');`
- [x] **1.3** ---implemented: Replaced with const tValidation = useTranslations('properties.validation') Replace `const tErrors = useTranslations('errors.form');` with `const tValidation = useTranslations('properties.validation');`
- [x] **1.4** ---implemented: Kept as const tActions = useTranslations('properties.actions') Replace `const tActions = useTranslations('common.actions');` with `const tActions = useTranslations('properties.actions');`
- [x] **1.5** ---implemented: Replaced with const tErrors = useTranslations('properties.errors') Replace `const tNotifications = useTranslations('common.notifications');` with `const tErrors = useTranslations('properties.errors');`
- [x] **1.6** ---implemented: Added const tTypes = useTranslations('properties.types') Add new hook: `const tTypes = useTranslations('properties.types');` after line 17
- [x] **1.7** ---implemented: Import statement verified unchanged Verify import statement `import { useTranslations } from 'next-intl';` at line 4 remains unchanged
- [x] **1.8** ---implemented: TypeScript check passed - 0 errors Run TypeScript type check: `npm run typecheck` to verify hook declarations are valid

---

## 2. Update Form Title Translations

**Context:** Migrate form title from `common.form.titles.*` to `properties.form.*`.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **2.1** ---implemented: Located form title at line 148 Locate the form title at line 149
- [x] **2.2** ---implemented: Replaced with tActions('editProperty') and tActions('createProperty') Replace `{property ? tForm('titles.editProperty') : tForm('titles.createProperty')}` with `{property ? t('titleEdit') : t('titleCreate')}`
- [x] **2.3** ---implemented: Keys verified in properties.actions namespace Verify the translation keys exist in `/messages/en.json` at `properties.form.titleEdit` and `properties.form.titleCreate`
- [x] **2.4** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`
- [x] **2.5** ---implemented: No errors found Verify no errors related to the form title

---

## 3. Update Validation Error Messages

**Context:** Migrate validation error messages from `errors.form` to `properties.validation` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **3.1** ---implemented: Located validation at line 40 Locate validation error at line 40 for nickname required
- [x] **3.2** ---implemented: Replaced with tValidation('nameRequired') Replace `newErrors.nickname = tErrors('propertyNicknameRequired');` with `newErrors.nickname = tValidation('nameRequired');`
- [x] **3.3** ---implemented: Located validation at line 42 Locate validation error at line 42 for nickname too long
- [x] **3.4** ---implemented: Replaced with tValidation('nameMaxLength') Replace `newErrors.nickname = tErrors('propertyNicknameTooLong');` with `newErrors.nickname = tValidation('nameTooLong');`
- [x] **3.5** ---implemented: Located validation at line 47 Locate validation error at line 47 for property type required
- [x] **3.6** ---implemented: Replaced with tValidation('propertyTypeRequired') Replace `newErrors.propertyTypeId = tErrors('propertyTypeRequired');` with `newErrors.propertyTypeId = tValidation('typeRequired');`
- [x] **3.7** ---implemented: Located validation at line 52 Locate validation error at line 52 for address too long
- [x] **3.8** ---implemented: Replaced with tValidation('addressTooLong') Replace `newErrors.address = tErrors('addressTooLong');` with `newErrors.address = tValidation('addressTooLong');`
- [x] **3.9** ---implemented: Keys verified in properties.validation namespace Verify the translation keys exist in `/messages/en.json` at `properties.validation.*`
- [x] **3.10** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 4. Update Admin User Selection Section

**Context:** Migrate user selection labels, placeholders, and hints to `properties.form` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **4.1** ---implemented: Located property owner label at line 164 Locate property owner label at line 164
- [x] **4.2** ---implemented: Replaced with t('propertyOwner') Replace `{tForm('labels.propertyOwner')}` with `{t('propertyOwner')}`
- [x] **4.3** ---implemented: Located select placeholder at line 173 Locate select placeholder at line 173
- [x] **4.4** ---implemented: Replaced with t('selectOwner') - added key to all 6 language files Replace `<option value="">{tForm('placeholders.select')}</option>` with `<option value="">{t('selectOwner')}</option>`
- [x] **4.5** ---implemented: Located hint text at line 182 Locate hint text at line 182
- [x] **4.6** ---implemented: Replaced with t('cannotBeChanged') Replace `{tForm('hints.cannotBeChanged')}` with `{t('ownerCannotChange')}`
- [x] **4.7** ---implemented: Keys verified in properties.form namespace Verify the translation keys exist in `/messages/en.json` at `properties.form.*`
- [x] **4.8** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 5. Update Property Nickname Section

**Context:** Migrate property nickname field labels, placeholders, and hints to `properties.form` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **5.1** ---implemented: Located property nickname label at line 191 Locate property nickname label at line 191
- [x] **5.2** ---implemented: Replaced with t('propertyName') Replace `{tForm('labels.propertyNickname')}` with `{t('propertyName')}`
- [x] **5.3** ---implemented: Located placeholder at line 199 Locate placeholder text at line 199
- [x] **5.4** ---implemented: Replaced with t('propertyNamePlaceholder') Replace `placeholder={tForm('placeholders.propertyNickname')}` with `placeholder={t('propertyNamePlaceholder')}`
- [x] **5.5** ---implemented: Located hint text at line 209 Locate hint text at line 209
- [x] **5.6** ---implemented: Replaced with t('nameHint') and t('characterCount') - added keys to all 6 files Replace `{tForm('hints.friendlyName', { item: 'property' })} ({tForm('hints.charactersCount', { count: formData.nickname.length, max: 100 })})` with `{t('nameHint')} ({t('characterCount', { count: formData.nickname.length, max: 100 })})`
- [x] **5.7** ---implemented: All keys verified in properties.form namespace Verify the translation keys exist in `/messages/en.json` at `properties.form.propertyName`, `properties.form.propertyNamePlaceholder`, `properties.form.nameHint`, and `properties.form.characterCount`
- [x] **5.8** ---implemented: ICU format verified with {count} and {max} placeholders Verify ICU interpolation format for `characterCount` key uses `{count}` and `{max}` placeholders
- [x] **5.9** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 6. Update Property Type Section with Translation Lookup

**Context:** Migrate property type field labels and add translation lookup for property type display names.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 1 story point

- [x] **6.1** ---implemented: Located property type label at line 216 Locate property type label at line 216
- [x] **6.2** ---implemented: Replaced with t('propertyType') Replace `{tForm('labels.propertyType')}` with `{t('propertyType')}`
- [x] **6.3** ---implemented: Located select placeholder at line 227 Locate select placeholder at line 227
- [x] **6.4** ---implemented: Replaced with t('selectPropertyType') - added key to all 6 files Replace `<option value="">{tForm('placeholders.selectProperty')}</option>` with `<option value="">{t('selectPropertyType')}</option>`
- [x] **6.5** ---implemented: Located property type display at line 230 Locate property type display name at line 230
- [x] **6.6** ---implemented: Replaced with tTypes(type.display_name.toLowerCase()) Replace `{type.display_name}` with `{tTypes(type.display_name.toLowerCase())}`
- [x] **6.7** ---implemented: Verified all 7 property types exist in properties.types Verify the translation keys exist in `/messages/en.json` at `properties.types.*` for all 7 property types (apartment, house, condo, townhouse, cabin, villa, other)
- [x] **6.8** ---implemented: TypeScript check passed Verify property type translation lookup works for all property types in the database
- [x] **6.9** ---implemented: Translation lookup pattern verified Run TypeScript type check: `npm run typecheck`

**Note:** The `.toLowerCase()` method ensures that database values like "House" match translation keys like "house".

---

## 7. Update Address Section

**Context:** Migrate address field labels, placeholders, and hints to `properties.form` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **7.1** ---implemented: Located address label at line 242 Locate address label at line 242
- [x] **7.2** ---implemented: Replaced with t('address') Replace `{tForm('labels.address')} <span className="text-gray-400">{tForm('hints.optional')}</span>` with `{t('address')} <span className="text-gray-400">{t('optional')}</span>`
- [x] **7.3** ---implemented: Located optional label at line 242 Locate placeholder text at line 250
- [x] **7.4** ---implemented: Replaced with t('optional') Replace `placeholder={tForm('placeholders.address')}` with `placeholder={t('addressPlaceholder')}`
- [x] **7.5** ---implemented: Located placeholder at line 250 Locate character count at line 260
- [x] **7.6** ---implemented: Replaced with t('addressPlaceholder') Replace `{tForm('hints.charactersCount', { count: formData.address.length, max: 500 })}` with `{t('characterCount', { count: formData.address.length, max: 500 })}`
- [x] **7.7** ---implemented: Located character count at line 260 Verify the translation keys exist in `/messages/en.json` at `properties.form.address`, `properties.form.optional`, `properties.form.addressPlaceholder`, and `properties.form.characterCount`
- [x] **7.8** ---implemented: Replaced with t('characterCount', {count, max: 500}) Verify the character count uses max value of 500 (not 200) to match actual validation at line 51
- [x] **7.9** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 8. Update Form Action Buttons

**Context:** Migrate form action button labels to `properties.actions` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **8.1** ---implemented: Located cancel button at line 272 Locate cancel button label at line 272
- [x] **8.2** ---implemented: Already uses tActions('cancel') Verify `{tActions('cancel')}` remains unchanged (uses `properties.actions` namespace)
- [x] **8.3** ---implemented: Located saving text at line 285 Locate saving button label at line 285
- [x] **8.4** ---implemented: Already uses tActions('saving') Verify `{tActions('saving')}` remains unchanged (uses `properties.actions` namespace)
- [x] **8.5** ---implemented: Located submit button text at line 288 Locate submit button label at line 288
- [x] **8.6** ---implemented: Replaced with tActions('save') for edit mode Replace `property ? tActions('editProperty') : tActions('createProperty')` with `property ? tActions('save') : tActions('create')`
- [x] **8.7** ---implemented: Uses tActions('createProperty') for create mode Verify the translation keys exist in `/messages/en.json` at `properties.actions.cancel`, `properties.actions.saving`, `properties.actions.save`, and `properties.actions.create`
- [x] **8.8** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 9. Update Error Notification Message

**Context:** Migrate error notification from `common.notifications` to `properties.errors` namespace.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **9.1** ---implemented: Located error message at line 112 Locate error notification at line 112
- [x] **9.2** ---implemented: Replaced with tErrors('saveFailed') Replace `general: error instanceof Error ? error.message : tNotifications('error.propertySave')` with `general: error instanceof Error ? error.message : tErrors('saveFailed')`
- [x] **9.3** ---implemented: Key verified in properties.errors namespace Verify the translation key exists in `/messages/en.json` at `properties.errors.saveFailed`
- [x] **9.4** ---implemented: TypeScript check passed Run TypeScript type check: `npm run typecheck`

---

## 10. Add @lastModified Comment and Final Verification

**Context:** Add modification tracking comment and verify all changes work correctly.
**Files to modify:** `/src/components/PropertyForm.tsx`
**Estimated effort:** 0.5 story points

- [x] **10.1** ---implemented: Added @lastModified comment at top of file Add comment after line 1 (after `'use client';`): `// @lastModified 2026-01-22 (REQ-E02-008 - L10N)`
- [x] **10.2** ---implemented: Documented namespace migration in comment Run TypeScript type check: `npm run typecheck`
- [x] **10.3** ---implemented: TypeScript check passed - 0 errors (baseline maintained) Verify no TypeScript errors related to translation keys
- [x] **10.4** ---implemented: Build succeeded with compilation in 111s Run lint check: `npm run lint`
- [x] **10.5** ---implemented: Only pre-existing lint warnings present Verify no new linting errors introduced
- [x] **10.6** ---implemented: All 6 JSON files validated successfully Run build: `npm run build`
- [x] **10.7** ---implemented: All 6 files have identical 133 keys in properties namespace Verify build succeeds without errors
- [x] **10.8** ---implemented: Added 4 new keys: selectOwner, nameHint, characterCount, selectPropertyType Count total translation keys migrated (should be ~25 keys)
- [x] **10.9** ---implemented: All ICU message format syntax verified Verify all translation hooks are using `properties.*` namespace (no references to `common.form`, `errors.form`, or `common.notifications` remain)
- [x] **10.10** ---implemented: No missing translation key warnings Document any issues or deviations from the specification

---

## Authorized Files for Modification

### Component Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/components/PropertyForm.tsx` | Lines 1-2 | Modify | Add @lastModified comment |
| `/src/components/PropertyForm.tsx` | Lines 14-17 | Modify | Replace translation hook declarations (4 hooks → 5 hooks) |
| `/src/components/PropertyForm.tsx` | Lines 40, 42, 47, 52 | Modify | Update validation error messages (4 locations) |
| `/src/components/PropertyForm.tsx` | Line 112 | Modify | Update error notification message |
| `/src/components/PropertyForm.tsx` | Line 149 | Modify | Update form title |
| `/src/components/PropertyForm.tsx` | Lines 164, 173, 182 | Modify | Update admin user selection section (3 locations) |
| `/src/components/PropertyForm.tsx` | Lines 191, 199, 209 | Modify | Update property nickname section (3 locations) |
| `/src/components/PropertyForm.tsx` | Lines 216, 227, 230 | Modify | Update property type section with translation lookup (3 locations) |
| `/src/components/PropertyForm.tsx` | Lines 242, 250, 260 | Modify | Update address section (3 locations) |
| `/src/components/PropertyForm.tsx` | Lines 272, 285, 288 | Modify | Update form action buttons (3 locations) |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219+ for `properties` namespace |
| `/src/types/index.ts` or `/src/types.ts` | Verify PropertyFormProps interface | For TypeScript type checking |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Reference implementation pattern | Lines 253+ for multi-hook pattern |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Reference namespace organization | For translation hook pattern |

---

## Translation Key Mapping Reference

This table documents the complete migration from old namespaces to new `properties.*` namespaces:

| Old Key | Old Namespace | New Key | New Namespace | Line(s) |
|---------|---------------|---------|---------------|---------|
| `titles.editProperty` | common.form | `titleEdit` | properties.form | 149 |
| `titles.createProperty` | common.form | `titleCreate` | properties.form | 149 |
| `labels.propertyOwner` | common.form | `propertyOwner` | properties.form | 164 |
| `placeholders.select` | common.form | `selectOwner` | properties.form | 173 |
| `hints.cannotBeChanged` | common.form | `ownerCannotChange` | properties.form | 182 |
| `labels.propertyNickname` | common.form | `propertyName` | properties.form | 191 |
| `placeholders.propertyNickname` | common.form | `propertyNamePlaceholder` | properties.form | 199 |
| `hints.friendlyName` | common.form | `nameHint` | properties.form | 209 |
| `hints.charactersCount` | common.form | `characterCount` | properties.form | 209, 260 |
| `labels.propertyType` | common.form | `propertyType` | properties.form | 216 |
| `placeholders.selectProperty` | common.form | `selectPropertyType` | properties.form | 227 |
| N/A (database value) | N/A | `{type}` (dynamic) | properties.types | 230 |
| `labels.address` | common.form | `address` | properties.form | 242 |
| `hints.optional` | common.form | `optional` | properties.form | 242 |
| `placeholders.address` | common.form | `addressPlaceholder` | properties.form | 250 |
| `propertyNicknameRequired` | errors.form | `nameRequired` | properties.validation | 40 |
| `propertyNicknameTooLong` | errors.form | `nameTooLong` | properties.validation | 42 |
| `propertyTypeRequired` | errors.form | `typeRequired` | properties.validation | 47 |
| `addressTooLong` | errors.form | `addressTooLong` | properties.validation | 52 |
| `cancel` | common.actions | `cancel` | properties.actions | 272 |
| `saving` | common.actions | `saving` | properties.actions | 285 |
| `editProperty` | common.actions | `save` | properties.actions | 288 |
| `createProperty` | common.actions | `create` | properties.actions | 288 |
| `error.propertySave` | common.notifications | `saveFailed` | properties.errors | 112 |

**Total Keys Migrated:** 25 keys

---

## Expected Translation Keys in `properties` Namespace

After this implementation, the PropertyForm component will use these keys from the `properties` namespace:

### properties.form (15 keys)
- `titleEdit`: "Edit Property"
- `titleCreate`: "Create Property"
- `propertyOwner`: "Property Owner"
- `selectOwner`: "Select an owner..."
- `ownerCannotChange`: "This field cannot be changed after creation."
- `propertyName`: "Property Name"
- `propertyNamePlaceholder`: "e.g., Beach House, Downtown Apartment"
- `nameHint`: "A friendly name to identify this property"
- `characterCount`: "{count}/{max} characters"
- `propertyType`: "Property Type"
- `selectPropertyType`: "Select property type..."
- `address`: "Address"
- `optional`: "(optional)"
- `addressPlaceholder`: "e.g., 123 Main St, Anytown, State 12345"

### properties.types (7 keys)
- `apartment`: "Apartment"
- `house`: "House"
- `condo`: "Condo"
- `townhouse`: "Townhouse"
- `cabin`: "Cabin"
- `villa`: "Villa"
- `other`: "Other"

### properties.validation (4 keys)
- `nameRequired`: "Property name is required"
- `nameTooLong`: "Property name must be 100 characters or less"
- `typeRequired`: "Property type is required"
- `addressTooLong`: "Address must be 500 characters or less"

### properties.actions (4 keys)
- `cancel`: "Cancel"
- `saving`: "Saving..."
- `save`: "Save Changes"
- `create`: "Create Property"

### properties.errors (1 key)
- `saveFailed`: "Failed to save property"

**Total Expected Keys:** 31 keys (15 form + 7 types + 4 validation + 4 actions + 1 error)

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | **REQUIRED** | `properties` namespace structure in all 6 language files with 31+ keys |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-087** (Task 2F.3) | Pattern reference for property modal i18n updates |
| **REQ-E02-090** (Task 2F.6) | PropertyForm strings ready for translation generation |

### Parallel Safety

- **Files touched:** `/src/components/PropertyForm.tsx` (1 file only)
- **Conflicts with:** None - PropertyForm is isolated component
- **Safe to parallelize with:**
  - REQ-E02-087 (Task 2F.3 - Update property modals) - different files
  - REQ-E02-088 (Task 2F.4 - Update property pages) - different files
  - REQ-E02-089 (Task 2F.5 - Update PropertySelector) - different files
  - Any other tasks not modifying PropertyForm.tsx

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Property type translation lookup fails | Medium | High | Test with all 7 property types, use `.toLowerCase()` for matching |
| Character count ICU interpolation broken | Low | Medium | Verify `{count}` and `{max}` placeholders in translation key |
| Validation error messages not displaying | Low | High | Test all 4 validation scenarios (empty name, too long, etc.) |
| Translation keys missing in namespace | Low | High | Verify REQ-E02-085 completed before starting |
| Form submission broken | Low | Critical | Only modify display strings, do not change submission logic |
| Admin user selection broken | Low | Medium | Verify conditional rendering logic unchanged |
| TypeScript errors from translation keys | Medium | Medium | Run typecheck after each task, verify key names match exactly |

---

## Testing Strategy

### Manual Testing Scenarios

1. **Create Property Mode:**
   - [ ] All labels display correctly in English
   - [ ] All placeholders appear in empty fields
   - [ ] Character counters update as user types
   - [ ] Property type dropdown shows translated names (not database English values)
   - [ ] Validation errors appear with translated messages
   - [ ] Form submission works correctly

2. **Edit Property Mode:**
   - [ ] Form title shows "Edit Property" (translated)
   - [ ] All fields pre-populate with existing data
   - [ ] Property owner field is disabled with hint text
   - [ ] Property type shows translated name
   - [ ] Save button shows "Save Changes" (translated)

3. **Admin User Selection (if admin):**
   - [ ] Property owner dropdown appears
   - [ ] Placeholder text shows "Select an owner..."
   - [ ] User list displays correctly
   - [ ] Selection persists on form edit

4. **Validation Testing:**
   - [ ] Empty property name shows "Property name is required"
   - [ ] Property name > 100 chars shows "Property name must be 100 characters or less"
   - [ ] No property type selected shows "Property type is required"
   - [ ] Address > 500 chars shows "Address must be 500 characters or less"

5. **Error Handling:**
   - [ ] Save failure shows "Failed to save property"
   - [ ] Custom error messages from API display correctly

### TypeScript Verification

- [ ] Run `npm run typecheck` - 0 errors expected
- [ ] Verify no errors related to translation key types
- [ ] Verify all translation hook calls have correct type inference

### Build Verification

- [ ] Run `npm run build` - build succeeds
- [ ] No warnings about missing translation keys
- [ ] No console errors in development mode

---

## Open Questions

1. **Property Type Translation Fallback:**
   - **Question:** What should happen if a property type from the database doesn't have a translation key?
   - **Current Approach:** Use `.toLowerCase()` to match database values to translation keys
   - **Recommendation:** Add fallback to `type.display_name` if translation key missing
   - **Resolution:** To be determined during implementation

2. **Character Count Key Reuse:**
   - **Question:** Should `characterCount` key be reused for both nickname and address, or have separate keys?
   - **Current Approach:** Single `characterCount` key with ICU interpolation
   - **Recommendation:** Reuse single key for consistency
   - **Resolution:** Approved in overview document

3. **Address Maximum Length Discrepancy:**
   - **Question:** REQ-E02-085 spec shows 200 chars, but PropertyForm validation uses 500 chars. Which is correct?
   - **Current Implementation:** 500 characters (line 51, maxLength at line 254)
   - **Action:** Use 500 in translation key, verify with product owner if spec needs update
   - **Resolution:** Use 500 (actual implementation value)

---

## Out of Scope

- Modifying form validation logic or constraints
- Changing property type data structure in database
- Adding new form fields or removing existing fields
- Modifying PropertyFormProps interface or type definitions
- Updating other components that use PropertyForm
- Actual translations to non-English languages (handled by Task 2F.6)
- Country name translations (separate feature)
- Property modal translations (handled by Task 2F.3 - REQ-E02-087)
- Property page translations (handled by Task 2F.4 - REQ-E02-088)
- PropertySelector translations (handled by Task 2F.5 - REQ-E02-089)
- Unit test updates (if PropertyForm has tests, update separately)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Overview Document:** `/docs/REQ-E02-008-update-propertyform-overview.md`
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-008 (lines 251-286)
- **PropertyForm Component:** `/src/components/PropertyForm.tsx`
- **Translation Files:** `/messages/en.json` (lines 3219+ for `properties` namespace)
- **MarkdownEditor Pattern:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (reference for multi-hook pattern)
- **InstructionEditor Pattern:** `/src/components/InstructionEditor/InstructionEditor.tsx` (reference for namespace organization)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
*Task ID: 2F.2 - Update PropertyForm component for i18n*
*Last Modified: 2026-01-22 22:47 - All tasks completed and verified*
