# REQ-E02-008: Update PropertyForm Component for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-008
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.2
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 19:11
**Last Modified:** 2026-01-22 19:11

---

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-008 (Task 2F.2) |
| Source File | docs/gen_requests.md (Request #8) |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 19:11 |
| T-shirt Size | S (Small) |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Summary

This document provides the implementation breakdown for updating the PropertyForm component (`src/components/PropertyForm.tsx`) to use the new `properties` namespace for translations. The component currently uses scattered namespace references (`common.form`, `errors.form`, `common.actions`, `common.notifications`) which need to be consolidated into the unified `properties` namespace created in Task 2F.1.

The PropertyForm component (297 lines) is a client component that handles both creating new properties and editing existing ones. It includes form validation, user selection for admins, and handles property type display. The implementation plan specifies ~40 strings for this component, which aligns with the current usage of ~35-40 translation keys.

**Key Finding:** PropertyForm already has partial i18n implementation using `common.form`, `errors.form`, `common.actions`, and `common.notifications` namespaces. This task will migrate these references to the new `properties` namespace structure while maintaining functionality.

---

## Goals

### Functional Requirements

1. Migrate PropertyForm from `common.form` to `properties.form` namespace
2. Migrate error messages from `errors.form` to `properties.validation` namespace
3. Migrate action labels from `common.actions` to `properties.actions` namespace
4. Migrate notifications from `common.notifications` to `properties.notifications` namespace
5. Add property type display name translations using `properties.types` namespace
6. Ensure all hardcoded strings are replaced with translation keys
7. Maintain existing form behavior and validation logic
8. Preserve accessibility features (ARIA labels, error associations)

### Assumptions & Clarifications

- Task 2F.1 (Create `properties` namespace structure) has been completed
- The `properties` namespace exists in all 6 language files (en, fr, es, de, nl, it)
- PropertyForm is a client component using `useTranslations` hook
- Property type `display_name` values in the database are currently in English
- **Translation approach for property types**: Keep database values in English, translate via `properties.types.*` keys at display time
- Form submission and validation logic should not be modified
- Existing translation keys in `common.form` that are generic (like `labels.email`, `placeholders.password`) should remain in `common.form` for reuse by other components

---

## Requirements Analysis

### Current Implementation Analysis

**File:** `src/components/PropertyForm.tsx` (297 lines)

**Current Translation Usage (lines 14-17):**
```typescript
const tForm = useTranslations('common.form');        // 16 references
const tErrors = useTranslations('errors.form');      // 4 references
const tActions = useTranslations('common.actions');  // 4 references
const tNotifications = useTranslations('common.notifications'); // 1 reference
```

**Translation Keys Currently Used:**

| Current Key | Line(s) | New Key | Category |
|-------------|---------|---------|----------|
| `tForm('titles.editProperty')` | 149 | `properties.form.titleEdit` | Form Title |
| `tForm('titles.createProperty')` | 149 | `properties.form.titleCreate` | Form Title |
| `tForm('labels.propertyOwner')` | 164 | `properties.form.propertyOwner` | Label |
| `tForm('placeholders.select')` | 173 | `properties.form.selectPlaceholder` | Placeholder |
| `tForm('hints.cannotBeChanged')` | 182 | `properties.form.ownerCannotChange` | Hint |
| `tForm('labels.propertyNickname')` | 191 | `properties.form.propertyName` | Label |
| `tForm('placeholders.propertyNickname')` | 199 | `properties.form.propertyNamePlaceholder` | Placeholder |
| `tForm('hints.friendlyName', {item: 'property'})` | 209 | `properties.form.nameHint` | Hint |
| `tForm('hints.charactersCount', {count, max})` | 209, 260 | `properties.form.characterCount` | Hint |
| `tForm('labels.propertyType')` | 216 | `properties.form.propertyType` | Label |
| `tForm('placeholders.selectProperty')` | 227 | `properties.form.selectPropertyType` | Placeholder |
| `tForm('labels.address')` | 242 | `properties.form.address` | Label |
| `tForm('hints.optional')` | 242 | `properties.form.optional` | Hint |
| `tForm('placeholders.address')` | 250 | `properties.form.addressPlaceholder` | Placeholder |
| `tErrors('propertyNicknameRequired')` | 40 | `properties.validation.nameRequired` | Validation |
| `tErrors('propertyNicknameTooLong')` | 42 | `properties.validation.nameTooLong` | Validation |
| `tErrors('propertyTypeRequired')` | 47 | `properties.validation.typeRequired` | Validation |
| `tErrors('addressTooLong')` | 52 | `properties.validation.addressTooLong` | Validation |
| `tActions('cancel')` | 272 | `properties.actions.cancel` | Action |
| `tActions('saving')` | 285 | `properties.actions.saving` | Action |
| `tActions('editProperty')` | 288 | `properties.actions.save` | Action |
| `tActions('createProperty')` | 288 | `properties.actions.create` | Action |
| `tNotifications('error.propertySave')` | 112 | `properties.errors.saveFailed` | Error |

**Property Type Display (line 230):**
- Currently uses `type.display_name` directly (English values from database)
- **Need to add**: Translation lookup for property types using `properties.types.*` keys

**Hardcoded Strings Found:**
- None - All user-facing strings already use translation keys

---

## Technical Approach

### Migration Strategy

The migration will follow this approach:

1. **Replace translation hook declarations** (lines 14-17):
   - Replace 4 separate `useTranslations` calls with unified `properties` namespace hooks
   - Add `tCommon` for generic reusable keys (if needed)

2. **Update form title** (line 149):
   - Migrate to `properties.form.titleEdit` / `properties.form.titleCreate`

3. **Update admin user selection section** (lines 163-184):
   - Migrate owner label, placeholder, hint to `properties.form.*`

4. **Update property nickname section** (lines 190-211):
   - Migrate label, placeholder, hint, character count to `properties.form.*`

5. **Update property type section** (lines 215-236):
   - Migrate label and placeholder to `properties.form.*`
   - **Add property type translation lookup** (line 230):
     ```typescript
     // Before:
     {type.display_name}

     // After:
     {tTypes(type.display_name.toLowerCase())}
     ```

6. **Update address section** (lines 241-262):
   - Migrate label, placeholder, hint, character count to `properties.form.*`

7. **Update validation messages** (lines 40-52):
   - Migrate to `properties.validation.*` namespace

8. **Update form actions** (lines 272-289):
   - Migrate button labels to `properties.actions.*`

9. **Update error handling** (line 112):
   - Migrate to `properties.errors.*` namespace

### Translation Hook Pattern

Following the pattern established in Epic 2 components (e.g., MarkdownEditor, InstructionEditor), use multiple focused translation hooks:

```typescript
// BEFORE (lines 14-17):
const tForm = useTranslations('common.form');
const tErrors = useTranslations('errors.form');
const tActions = useTranslations('common.actions');
const tNotifications = useTranslations('common.notifications');

// AFTER:
const t = useTranslations('properties.form');
const tValidation = useTranslations('properties.validation');
const tActions = useTranslations('properties.actions');
const tErrors = useTranslations('properties.errors');
const tTypes = useTranslations('properties.types');
```

---

## Implementation Tasks

### Task 1: Update translation hook declarations (Priority: High)

**Description:** Replace the 4 separate translation hooks with unified `properties` namespace hooks.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 14-17** - Replace:
```typescript
const tForm = useTranslations('common.form');
const tErrors = useTranslations('errors.form');
const tActions = useTranslations('common.actions');
const tNotifications = useTranslations('common.notifications');
```

**With:**
```typescript
const t = useTranslations('properties.form');
const tValidation = useTranslations('properties.validation');
const tActions = useTranslations('properties.actions');
const tErrors = useTranslations('properties.errors');
const tTypes = useTranslations('properties.types');
```

**Rationale:** Consolidates scattered namespace references into the unified `properties` namespace, following the pattern from Epic 2 implementations.

**Acceptance Criteria:**
- [ ] Translation hooks updated to use `properties` namespace
- [ ] Import statement for `useTranslations` remains unchanged
- [ ] TypeScript compilation succeeds

---

### Task 2: Update form title translations (Priority: High)

**Description:** Migrate form title from `common.form.titles.*` to `properties.form.*`.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Line 149** - Replace:
```typescript
{property ? tForm('titles.editProperty') : tForm('titles.createProperty')}
```

**With:**
```typescript
{property ? t('titleEdit') : t('titleCreate')}
```

**Expected Keys in `properties.form`:**
- `titleEdit`: "Edit Property"
- `titleCreate`: "Create Property"

**Acceptance Criteria:**
- [ ] Form title displays correctly for both edit and create modes
- [ ] Translation keys match namespace structure

---

### Task 3: Update validation error messages (Priority: High)

**Description:** Migrate validation error messages from `errors.form` to `properties.validation` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 40, 42, 47, 52** - Replace:
```typescript
// Line 40:
newErrors.nickname = tErrors('propertyNicknameRequired');
// Line 42:
newErrors.nickname = tErrors('propertyNicknameTooLong');
// Line 47:
newErrors.propertyTypeId = tErrors('propertyTypeRequired');
// Line 52:
newErrors.address = tErrors('addressTooLong');
```

**With:**
```typescript
// Line 40:
newErrors.nickname = tValidation('nameRequired');
// Line 42:
newErrors.nickname = tValidation('nameTooLong');
// Line 47:
newErrors.propertyTypeId = tValidation('typeRequired');
// Line 52:
newErrors.address = tValidation('addressTooLong');
```

**Expected Keys in `properties.validation`:**
- `nameRequired`: "Property name is required"
- `nameTooLong`: "Property name must be 100 characters or less"
- `typeRequired`: "Property type is required"
- `addressTooLong`: "Address must be 500 characters or less"

**Note:** Maximum length for address is 500 characters (not 200 as in REQ-E02-085 spec - verify with actual validation logic at line 51).

**Acceptance Criteria:**
- [ ] Validation error messages display correctly
- [ ] Error messages trigger at correct validation points
- [ ] Character limits match actual form constraints

---

### Task 4: Update admin user selection section (Priority: High)

**Description:** Migrate user selection labels, placeholders, and hints to `properties.form` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 164, 173, 182** - Replace:
```typescript
// Line 164:
{tForm('labels.propertyOwner')}
// Line 173:
<option value="">{tForm('placeholders.select')}</option>
// Line 182:
{tForm('hints.cannotBeChanged')}
```

**With:**
```typescript
// Line 164:
{t('propertyOwner')}
// Line 173:
<option value="">{t('selectOwner')}</option>
// Line 182:
{t('ownerCannotChange')}
```

**Expected Keys in `properties.form`:**
- `propertyOwner`: "Property Owner"
- `selectOwner`: "Select an owner..."
- `ownerCannotChange`: "This field cannot be changed after creation."

**Acceptance Criteria:**
- [ ] Property owner label displays correctly
- [ ] Placeholder text shows in dropdown
- [ ] Hint text displays when editing existing property
- [ ] Admin-only section remains hidden for non-admin users

---

### Task 5: Update property nickname section (Priority: High)

**Description:** Migrate property nickname field labels, placeholders, and hints to `properties.form` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 191, 199, 209** - Replace:
```typescript
// Line 191:
{tForm('labels.propertyNickname')}
// Line 199:
placeholder={tForm('placeholders.propertyNickname')}
// Line 209:
{tForm('hints.friendlyName', { item: 'property' })} ({tForm('hints.charactersCount', { count: formData.nickname.length, max: 100 })})
```

**With:**
```typescript
// Line 191:
{t('propertyName')}
// Line 199:
placeholder={t('propertyNamePlaceholder')}
// Line 209:
{t('nameHint')} ({t('characterCount', { count: formData.nickname.length, max: 100 })})
```

**Expected Keys in `properties.form`:**
- `propertyName`: "Property Name"
- `propertyNamePlaceholder`: "e.g., Beach House, Downtown Apartment"
- `nameHint`: "A friendly name to identify this property"
- `characterCount`: "{count}/{max} characters"

**Acceptance Criteria:**
- [ ] Property name label displays correctly
- [ ] Placeholder text appears in empty field
- [ ] Hint text shows with character count
- [ ] Character count updates dynamically as user types
- [ ] ICU format correctly interpolates {count} and {max} variables

---

### Task 6: Update property type section with translation lookup (Priority: High)

**Description:** Migrate property type field labels and add translation lookup for property type display names.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 216, 227, 230** - Replace:
```typescript
// Line 216:
{tForm('labels.propertyType')}
// Line 227:
<option value="">{tForm('placeholders.selectProperty')}</option>
// Line 230:
{type.display_name}
```

**With:**
```typescript
// Line 216:
{t('propertyType')}
// Line 227:
<option value="">{t('selectPropertyType')}</option>
// Line 230:
{tTypes(type.display_name.toLowerCase())}
```

**Expected Keys in `properties.form`:**
- `propertyType`: "Property Type"
- `selectPropertyType`: "Select property type..."

**Expected Keys in `properties.types`:**
- `apartment`: "Apartment"
- `house`: "House"
- `condo`: "Condo"
- `townhouse`: "Townhouse"
- `cabin`: "Cabin"
- `villa`: "Villa"
- `other`: "Other"

**Important:** The `type.display_name` values from the database are in English with proper casing (e.g., "House", "Apartment"). Use `.toLowerCase()` to match the translation keys.

**Acceptance Criteria:**
- [ ] Property type label displays correctly
- [ ] Placeholder text appears in empty dropdown
- [ ] Property types display translated names (not English database values)
- [ ] Property type dropdown shows all 7 types correctly
- [ ] Selected type persists correctly in edit mode

---

### Task 7: Update address section (Priority: High)

**Description:** Migrate address field labels, placeholders, and hints to `properties.form` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 242, 250, 260** - Replace:
```typescript
// Line 242:
{tForm('labels.address')} <span className="text-gray-400">{tForm('hints.optional')}</span>
// Line 250:
placeholder={tForm('placeholders.address')}
// Line 260:
{tForm('hints.charactersCount', { count: formData.address.length, max: 500 })}
```

**With:**
```typescript
// Line 242:
{t('address')} <span className="text-gray-400">{t('optional')}</span>
// Line 250:
placeholder={t('addressPlaceholder')}
// Line 260:
{t('characterCount', { count: formData.address.length, max: 500 })}
```

**Expected Keys in `properties.form`:**
- `address`: "Address"
- `optional`: "(optional)"
- `addressPlaceholder`: "e.g., 123 Main St, Anytown, State 12345"
- `characterCount`: "{count}/{max} characters" (reused from Task 5)

**Acceptance Criteria:**
- [ ] Address label displays correctly with optional indicator
- [ ] Placeholder text appears in empty textarea
- [ ] Character count displays and updates dynamically
- [ ] Character count shows correct maximum (500 characters)

---

### Task 8: Update form action buttons (Priority: High)

**Description:** Migrate form action button labels to `properties.actions` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Lines 272, 285, 288** - Replace:
```typescript
// Line 272:
{tActions('cancel')}
// Line 285:
{tActions('saving')}
// Line 288:
property ? tActions('editProperty') : tActions('createProperty')
```

**With:**
```typescript
// Line 272:
{tActions('cancel')}
// Line 285:
{tActions('saving')}
// Line 288:
property ? tActions('save') : tActions('create')
```

**Expected Keys in `properties.actions`:**
- `cancel`: "Cancel"
- `saving`: "Saving..."
- `save`: "Save Changes"
- `create`: "Create Property"

**Acceptance Criteria:**
- [ ] Cancel button label displays correctly
- [ ] Save button shows "Saving..." during submission
- [ ] Save button shows "Save Changes" in edit mode
- [ ] Save button shows "Create Property" in create mode
- [ ] Button states (loading, disabled) work correctly

---

### Task 9: Update error notification message (Priority: Medium)

**Description:** Migrate error notification from `common.notifications` to `properties.errors` namespace.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Line 112** - Replace:
```typescript
general: error instanceof Error ? error.message : tNotifications('error.propertySave')
```

**With:**
```typescript
general: error instanceof Error ? error.message : tErrors('saveFailed')
```

**Expected Keys in `properties.errors`:**
- `saveFailed`: "Failed to save property"

**Acceptance Criteria:**
- [ ] Error message displays when save operation fails
- [ ] Custom error messages (from Error object) still display correctly
- [ ] Fallback error message uses translation key

---

### Task 10: Add @lastModified comment and verify (Priority: Medium)

**Description:** Add modification tracking comment and verify all changes work correctly.

**File:** `/src/components/PropertyForm.tsx`

**Changes Required:**

**Add after line 1 (after `'use client';`):**
```typescript
// @lastModified 2026-01-22 (REQ-E02-008 - L10N)
```

**Verification Steps:**
1. Run TypeScript compilation: `npm run typecheck`
2. Verify no TypeScript errors related to translation keys
3. Test form in browser (if possible):
   - Create new property
   - Edit existing property
   - Test validation errors
   - Test property type translations
   - Test admin user selection (if admin)
4. Verify all text displays in English (en.json)
5. Verify form submission still works

**Acceptance Criteria:**
- [ ] @lastModified comment added with correct date and request ID
- [ ] TypeScript compilation succeeds
- [ ] No console errors related to missing translation keys
- [ ] Form functionality unchanged (create, edit, validate)
- [ ] All translated text displays correctly

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Component Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/components/PropertyForm.tsx` | Lines 1-2 | Modify | Add @lastModified comment |
| `/src/components/PropertyForm.tsx` | Lines 14-17 | Modify | Replace translation hook declarations |
| `/src/components/PropertyForm.tsx` | Lines 40, 42, 47, 52 | Modify | Update validation error messages |
| `/src/components/PropertyForm.tsx` | Line 112 | Modify | Update error notification message |
| `/src/components/PropertyForm.tsx` | Line 149 | Modify | Update form title |
| `/src/components/PropertyForm.tsx` | Lines 164, 173, 182 | Modify | Update admin user selection section |
| `/src/components/PropertyForm.tsx` | Lines 191, 199, 209 | Modify | Update property nickname section |
| `/src/components/PropertyForm.tsx` | Lines 216, 227, 230 | Modify | Update property type section with translation |
| `/src/components/PropertyForm.tsx` | Lines 242, 250, 260 | Modify | Update address section |
| `/src/components/PropertyForm.tsx` | Lines 272, 285, 288 | Modify | Update form action buttons |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219+ for `properties` namespace |
| `/src/types/index.ts` or `/src/types.ts` | Verify PropertyFormProps interface | For TypeScript type checking |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Reference implementation pattern | Lines 253+ for multi-hook pattern |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | Required | `properties` namespace structure in all 6 language files |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-087** (Task 2F.3) | Pattern for property modal i18n updates |
| **REQ-E02-090** (Task 2F.6) | PropertyForm strings ready for translation generation |

### Parallel Safety

- **Files touched**: `/src/components/PropertyForm.tsx` (1 file)
- **Conflicts with**: None - PropertyForm is isolated component
- **Safe to parallelize with**:
  - REQ-E02-087 (Task 2F.3 - Update property modals) - different files
  - REQ-E02-088 (Task 2F.4 - Update property pages) - different files
  - REQ-E02-089 (Task 2F.5 - Update PropertySelector) - different files

### External Dependencies

- `next-intl` package (from Epic 1)
- Translation files in `/messages/*.json` (6 languages)

---

## Risks and Considerations

### Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Property type display broken | High | Carefully test property type translation lookup with `.toLowerCase()` |
| Character count formatting | Medium | Verify ICU format interpolation for {count} and {max} |
| Validation error messages | Medium | Test all validation scenarios (empty name, too long, etc.) |
| Admin user selection hidden | Low | Verify conditional rendering still works |
| Form submission broken | High | Keep submission logic unchanged, only update display strings |

### Testing Requirements

- **Unit Tests**: If PropertyForm has tests, update test cases to expect new translation keys
- **Integration Tests**: Test form submission flow (create and edit modes)
- **Visual Testing**:
  - Verify all labels, placeholders, hints display correctly
  - Test property type dropdown shows translated names
  - Test character counters update dynamically
  - Test validation errors display correctly
  - Test form in both create and edit modes
- **Browser Testing**: Test in actual application with live translation files
- **Language Testing**: Verify form works with all 6 supported languages (en, fr, es, de, nl, it)

### Open Questions

- [ ] Should property type translation keys use exact casing match (e.g., `House`) or lowercase (e.g., `house`)?
  - **Recommendation:** Use lowercase for consistency (`.toLowerCase()` on line 230)
- [ ] Should the generic `optional` and `characterCount` keys be in `properties.form` or `common.form`?
  - **Recommendation:** Include in `properties.form` for namespace isolation, even if values are identical to `common.form`
- [ ] What should happen if a property type from the database doesn't have a translation key?
  - **Recommendation:** Fallback to `type.display_name` (English value) if translation key missing
- [ ] Should the maximum address length be 500 (actual validation) or 200 (spec in REQ-E02-085)?
  - **Current Implementation:** 500 characters (line 51, 254)
  - **Action Required:** Verify with REQ-E02-085 if spec needs correction

---

## Out of Scope

- Modifying form validation logic or constraints
- Changing property type data structure in database
- Adding new form fields or removing existing fields
- Modifying PropertyFormProps interface
- Updating other components that use PropertyForm (handled by other tasks)
- Actual translations to other languages (handled by Task 2F.6)
- Country name translations (handled separately if needed)
- Property modal translations (handled by Task 2F.3)
- Property page translations (handled by Task 2F.4)
- PropertySelector translations (handled by Task 2F.5)

---

## Verification Checklist

### Pre-Implementation
- [ ] REQ-E02-085 (Task 2F.1) completed - `properties` namespace exists
- [ ] Reviewed PropertyForm.tsx current implementation
- [ ] Identified all translation keys needing migration
- [ ] Confirmed property type translation approach

### Implementation
- [ ] Translation hooks updated to use `properties` namespace
- [ ] Form title migrated to `properties.form`
- [ ] Validation errors migrated to `properties.validation`
- [ ] Admin user selection migrated to `properties.form`
- [ ] Property nickname section migrated to `properties.form`
- [ ] Property type section migrated with translation lookup
- [ ] Address section migrated to `properties.form`
- [ ] Form action buttons migrated to `properties.actions`
- [ ] Error notification migrated to `properties.errors`
- [ ] @lastModified comment added

### Post-Implementation
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No console errors for missing translation keys
- [ ] Form displays correctly in create mode
- [ ] Form displays correctly in edit mode
- [ ] Property types show translated names (not English database values)
- [ ] Character counters update dynamically
- [ ] Validation errors display correctly
- [ ] Form submission works (create and edit)
- [ ] Admin user selection works (when applicable)
- [ ] All text in English (en.json) displays correctly
- [ ] Ready for translation generation (Task 2F.6)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **PropertyForm Component:** `/src/components/PropertyForm.tsx`
- **Translation Files:** `/messages/en.json` (lines 3219+ for `properties` namespace)
- **MarkdownEditor Pattern:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (reference for multi-hook pattern)
- **InstructionEditor Pattern:** `/src/components/InstructionEditor/InstructionEditor.tsx` (reference for namespace organization)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 19:11*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
