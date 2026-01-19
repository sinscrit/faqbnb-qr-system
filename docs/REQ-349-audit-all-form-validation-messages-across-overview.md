# Technical Implementation Overview: Audit All Form Validation Messages Across Components

**Document ID:** REQ-349-overview
**Request Reference:** REQ-349 (Task 2J.2 from Epic 2 Implementation Plan)
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.2
**Size:** M (Medium)
**Priority:** Second - Cross-cutting concern (per implementation plan ordering)

---

## 1. Summary

Conduct a comprehensive audit of all form validation messages across the FAQBNB application to identify, document, and catalog every validation error message for internationalization. This audit will produce a complete inventory of validation messages with their current locations, triggering conditions, proposed translation keys, and translator context notes. The resulting catalog serves as the foundation for consistent, translatable validation feedback across all forms.

---

## 2. Current State Analysis

### 2.1 Form Components Inventory

Based on codebase exploration, the following form components contain validation messages:

| Component | Location | Estimated Messages |
|-----------|----------|-------------------|
| LoginForm | `/src/components/LoginForm.tsx` | ~6 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~15 |
| PropertyForm | `/src/components/PropertyForm.tsx` | ~4 |
| ItemForm | `/src/components/ItemForm.tsx` | ~8 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~7 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~5 |
| ItemCapture validation utils | `/src/components/ItemCapture/utils/validation.ts` | ~25 |
| Access validation | `/src/lib/access-validation.ts` | ~6 |
| **Total** | | **~76 messages** |

### 2.2 Current Validation Patterns

The codebase uses multiple validation patterns with hardcoded English strings:

#### Pattern A: Inline Component Validation (`validateField` switch)

```typescript
// Example from LoginForm.tsx (lines 48-64)
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';  // HARDCODED
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';  // HARDCODED
      return undefined;
  }
};
```

**Files using this pattern:**
- `/src/components/LoginForm.tsx`
- `/src/components/RegistrationForm.tsx`

#### Pattern B: Dedicated Validation Utility Module

```typescript
// Example from ItemCapture/utils/validation.ts (line 157)
export function validateTitle(title: string): ValidationResult {
  const trimmedTitle = title?.trim() ?? '';
  if (trimmedTitle.length === 0) {
    return { isValid: false, error: 'Title is required' };  // HARDCODED
  }
  if (trimmedTitle.length > CAPTURE_CONSTRAINTS.title.maxLength) {
    return {
      isValid: false,
      error: `Title must be ${CAPTURE_CONSTRAINTS.title.maxLength} characters or less (current: ${trimmedTitle.length})`  // HARDCODED with interpolation
    };
  }
  return { isValid: true };
}
```

#### Pattern C: Access Code Validation Functions

```typescript
// Example from access-validation.ts (line 271)
export function validateAccessCodeFormat(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Access code is required' };  // HARDCODED
  }
  if (code.length !== 12) {
    return { isValid: false, error: 'Access code must be 12 characters long' };  // HARDCODED
  }
  // ...
}
```

### 2.3 Validation Message Categories

| Category | Description | Current Count |
|----------|-------------|---------------|
| Required field | Empty/null field validation | ~15 |
| Format error | Email, URL, phone format | ~8 |
| Length constraint | Min/max character limits | ~12 |
| Range constraint | Numeric min/max values | ~5 |
| Pattern match | Regex validation failures | ~4 |
| Password validation | Strength, match, complexity | ~10 |
| File validation | Size, type, count limits | ~12 |
| Custom business rules | Access codes, uniqueness | ~10 |

### 2.4 Current Translation State

The existing `/messages/en.json` contains only a basic flat `errors` namespace with ~16 generic messages. It lacks:
- Form-specific validation messages
- Nested structure for categorization
- Parameter interpolation for dynamic values
- Coverage for all validation scenarios

---

## 3. Implementation Tasks

### Task 3.1: Audit LoginForm Validation Messages

**File:** `/src/components/LoginForm.tsx`

**Validation Messages to Extract:**

| Current Message | Triggering Condition | Proposed Key | Parameters |
|-----------------|---------------------|--------------|------------|
| "Email is required" | Empty email field | `errors.form.email.required` | - |
| "Please enter a valid email address" | Invalid email format | `errors.form.email.invalid` | - |
| "Password is required" | Empty password field | `errors.form.password.required` | - |
| "Password must be at least 6 characters" | Password length < 6 | `errors.form.password.tooShort` | `{min: 6}` |
| "Invalid email or password" | Auth failure response | `errors.auth.invalidCredentials` | - |
| "Error signing in" | Generic auth error | `errors.auth.signInFailed` | - |

### Task 3.2: Audit RegistrationForm Validation Messages

**File:** `/src/components/RegistrationForm.tsx`

**Validation Messages to Extract:**

| Current Message | Triggering Condition | Proposed Key | Parameters |
|-----------------|---------------------|--------------|------------|
| "Email is required" | Empty email field | `errors.form.email.required` | - |
| "Please enter a valid email address" | Invalid email format | `errors.form.email.invalid` | - |
| "Password is required" | Empty password field | `errors.form.password.required` | - |
| "Password must be at least 8 characters" | Password length < 8 | `errors.form.password.tooShort` | `{min: 8}` |
| "Password must contain at least one lowercase letter" | Missing lowercase | `errors.form.password.noLowercase` | - |
| "Password must contain at least one uppercase letter" | Missing uppercase | `errors.form.password.noUppercase` | - |
| "Password must contain at least one number" | Missing number | `errors.form.password.noNumber` | - |
| "Passwords do not match" | confirmPassword mismatch | `errors.form.password.mismatch` | - |
| "Please confirm your password" | Empty confirm field | `errors.form.password.confirmRequired` | - |
| "You must agree to the terms and conditions" | Terms checkbox unchecked | `errors.form.terms.required` | - |
| "Full Name must be at least 2 characters" | Name too short | `errors.form.fullName.tooShort` | `{min: 2}` |
| "Registration Failed" | Server error | `errors.auth.registrationFailed` | - |

### Task 3.3: Audit PropertyForm Validation Messages

**File:** `/src/components/PropertyForm.tsx`

**Validation Messages to Extract:**

| Current Message | Triggering Condition | Proposed Key | Parameters |
|-----------------|---------------------|--------------|------------|
| "Property nickname is required" | Empty nickname | `errors.form.property.nicknameRequired` | - |
| "Property type is required" | No type selected | `errors.form.property.typeRequired` | - |
| "Nickname is too long" | Exceeds max length | `errors.form.property.nicknameTooLong` | `{max}` |
| "Address is too long" | Exceeds max length | `errors.form.property.addressTooLong` | `{max}` |

### Task 3.4: Audit ItemForm Validation Messages

**File:** `/src/components/ItemForm.tsx`

**Validation Messages to Extract:**

| Current Message | Triggering Condition | Proposed Key | Parameters |
|-----------------|---------------------|--------------|------------|
| "Name is required" | Empty name field | `errors.form.item.nameRequired` | - |
| "Property selection is required" | No property selected | `errors.form.item.propertyRequired` | - |
| "Invalid URL format" | Link URL invalid | `errors.form.url.invalid` | - |
| "URL is required" | Empty link URL | `errors.form.url.required` | - |
| "Failed to save item" | Save error | `errors.item.saveFailed` | - |
| "Failed to delete item" | Delete error | `errors.item.deleteFailed` | - |
| "Invalid UUID format" | publicId format error | `errors.form.uuid.invalid` | - |
| "Description is too long" | Exceeds max length | `errors.form.item.descriptionTooLong` | `{max}` |

### Task 3.5: Audit AddPropertyModal Validation Messages

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

**Validation Messages to Extract:**

| Current Message | Triggering Condition | Proposed Key | Parameters |
|-----------------|---------------------|--------------|------------|
| "Property name is required" | Empty name | `errors.form.property.nameRequired` | - |
| "Property name is too long" | Exceeds max length | `errors.form.property.nameTooLong` | `{max}` |
| "Invalid country code" | Country not in list | `errors.form.property.invalidCountry` | - |
| "Address line is too long" | Exceeds max length | `errors.form.property.addressLineTooLong` | `{max}` |
| "City is required" | Empty city | `errors.form.property.cityRequired` | - |
| "Failed to create property" | Save error | `errors.property.createFailed` | - |
| "Property type is required" | No type selected | `errors.form.property.typeRequired` | - |

### Task 3.6: Audit ItemCapture Validation Utilities

**File:** `/src/components/ItemCapture/utils/validation.ts`

**Validation Messages to Extract:**

| Current Message | Function | Proposed Key | Parameters |
|-----------------|----------|--------------|------------|
| "Title is required" | `validateTitle` | `errors.form.title.required` | - |
| "Title must be {max} characters or less (current: {current})" | `validateTitle` | `errors.form.title.tooLong` | `{max, current}` |
| "At least one media item, link, or text instructions must be provided" | `validateContentRequirement` | `errors.form.content.required` | - |
| "File exceeds {max}MB limit (current: {current}MB)" | `validateFileSize` | `errors.file.tooLarge` | `{max, current}` |
| "Total upload size ({current}) exceeds {max} limit" | `validateTotalSize` | `errors.file.totalSizeExceeded` | `{max, current}` |
| "Instructions exceed {max} character limit (current: {current})" | `validateTextLength` | `errors.form.text.tooLong` | `{max, current}` |
| "URL is required" | `validateUrl` | `errors.form.url.required` | - |
| "Invalid URL format" | `validateUrl` | `errors.form.url.invalid` | - |
| "Only http and https URLs are allowed" | `validateUrl` | `errors.form.url.invalidProtocol` | - |
| "URL exceeds {max} character limit" | `validateUrl` | `errors.form.url.tooLong` | `{max}` |
| "Maximum {max} photos allowed (current: {current})" | `validateImageCount` | `errors.file.maxImagesExceeded` | `{max, current}` |
| "Maximum {max} links allowed (current: {current})" | `validateUrlCount` | `errors.form.url.maxCountExceeded` | `{max, current}` |
| "File type '{type}' is not supported for {mediaType}" | `validateMimeType` | `errors.file.unsupportedType` | `{type, mediaType}` |
| "No media types are allowed" | `validateMimeType` | `errors.file.noTypesAllowed` | - |

### Task 3.7: Audit Access Validation Messages

**File:** `/src/lib/access-validation.ts`

**Validation Messages to Extract:**

| Current Message | Function | Proposed Key | Parameters |
|-----------------|----------|--------------|------------|
| "Access code is required" | `validateAccessCodeFormat` | `errors.form.accessCode.required` | - |
| "Access code must be 12 characters long" | `validateAccessCodeFormat` | `errors.form.accessCode.invalidLength` | `{length: 12}` |
| "Access code must contain only uppercase letters and numbers" | `validateAccessCodeFormat` | `errors.form.accessCode.invalidFormat` | - |
| "Email does not match the access request" | validation logic | `errors.auth.accessCode.emailMismatch` | - |
| "This access code has already been used for registration" | validation logic | `errors.auth.accessCode.alreadyUsed` | - |
| "Access code is not approved for registration" | validation logic | `errors.auth.accessCode.notApproved` | - |

### Task 3.8: Create Comprehensive Audit Catalog

Produce a complete catalog document with:
1. All unique validation messages (~76 total)
2. Current location (file:line)
3. Triggering condition
4. Proposed translation key
5. Parameters needed
6. Pluralization requirements
7. Translator context notes
8. Category classification

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/docs/i18n/validation-message-catalog.md` | Complete audit catalog document |

### 4.2 Files to Audit (Read-Only)

| File Path | Validation Functions/Patterns |
|-----------|------------------------------|
| `/src/components/LoginForm.tsx` | `validateField()` switch statement |
| `/src/components/RegistrationForm.tsx` | `validateField()` switch statement |
| `/src/components/PropertyForm.tsx` | Inline validation logic |
| `/src/components/ItemForm.tsx` | Inline validation logic |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | `validateForm()` function |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | `validateForm()` function |
| `/src/components/ItemCapture/utils/validation.ts` | All exported validation functions |
| `/src/lib/access-validation.ts` | `validateAccessCodeFormat()`, `validateEmailFormat()` |
| `/src/lib/error-utils.ts` | Error mapping patterns |
| `/messages/en.json` | Current errors namespace structure |

### 4.3 Files to Reference

| File Path | Purpose |
|-----------|---------|
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Error namespace specification |
| `/docs/REQ-348-create-errors-namespace-structure-overview.md` | Target errors namespace structure |
| `/src/lib/i18n/config.ts` | i18n configuration reference |

### 4.4 Scope Boundaries

**In Scope:**
- Identifying all form validation messages
- Documenting validation message locations
- Proposing translation keys
- Categorizing validation types
- Identifying parameter requirements
- Creating translator context notes
- Documenting pluralization needs

**Out of Scope:**
- Modifying components to use translation keys (covered by subsequent tasks)
- Creating the actual translation entries (REQ-348 creates the namespace structure)
- Updating Zod schemas (covered by Task 2J.5)
- Translating to non-English languages (covered by Task 2J.7)

---

## 5. Validation Message Catalog Structure

### 5.1 Catalog Entry Format

Each validation message entry should follow this format:

```markdown
### VM-XXX: [Message Text]

**Location:** `/src/components/[File].tsx` line [N]
**Function:** `validateField()` or inline
**Triggering Condition:** [When this error appears]
**Category:** [required|format|length|range|pattern|password|file|custom]
**Proposed Key:** `errors.form.[namespace].[key]`
**Parameters:** `{param1, param2}` or None
**Pluralization:** Required/Not Required
**Translator Context:** [Notes for translators about this message]
**Related Messages:** VM-XXX, VM-YYY (if applicable)
```

### 5.2 Category Definitions

| Category | Description | Key Pattern |
|----------|-------------|-------------|
| `required` | Empty/null field validation | `errors.form.{field}.required` |
| `format` | Invalid format (email, URL, phone) | `errors.form.{field}.invalid` |
| `length` | Min/max character constraints | `errors.form.{field}.tooShort/tooLong` |
| `range` | Numeric min/max values | `errors.form.{field}.min/max` |
| `pattern` | Regex pattern failures | `errors.form.{field}.pattern` |
| `password` | Password complexity rules | `errors.form.password.{rule}` |
| `file` | File size, type, count | `errors.file.{rule}` |
| `custom` | Business-specific rules | `errors.{domain}.{rule}` |

### 5.3 Parameter Naming Conventions

| Parameter | Usage | Example Message |
|-----------|-------|-----------------|
| `{min}` | Minimum value/length | "Must be at least {min} characters" |
| `{max}` | Maximum value/length | "Cannot exceed {max} characters" |
| `{current}` | Current value/length | "Currently {current} characters" |
| `{fieldName}` | Field display name | "{fieldName} is required" |
| `{types}` | Allowed file types | "Allowed: {types}" |
| `{size}` | File size | "Maximum size: {size}MB" |
| `{count}` | Count (for plurals) | "{count} items remaining" |

---

## 6. Deliverables

### 6.1 Primary Deliverable

**Validation Message Catalog** (`/docs/i18n/validation-message-catalog.md`)

Contents:
1. Executive summary with total counts by category
2. Complete list of all validation messages (VM-001 through VM-076)
3. Translation key mapping table
4. Parameter reference guide
5. Pluralization requirements list
6. Translator context guide
7. Consolidation recommendations for duplicate messages
8. Implementation priority recommendations

### 6.2 Catalog Format Example

```markdown
# FAQBNB Validation Message Catalog

## Executive Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Required field | 15 | 20% |
| Format error | 8 | 11% |
| Length constraint | 12 | 16% |
| Password validation | 10 | 13% |
| File validation | 12 | 16% |
| Custom business | 10 | 13% |
| Other | 9 | 12% |
| **Total** | **76** | **100%** |

## Validation Messages

### VM-001: Email is required

**Location:** `/src/components/LoginForm.tsx` line 50
**Function:** `validateField()` case 'email'
**Triggering Condition:** User submits form with empty email field
**Category:** required
**Proposed Key:** `errors.form.email.required`
**Parameters:** None
**Pluralization:** Not Required
**Translator Context:** This message appears when users try to submit the login form without entering an email address. Keep the message brief but clear that the email field cannot be empty.
**Related Messages:** VM-007 (RegistrationForm same validation)

---

[Continue for all 76 messages...]
```

---

## 7. Acceptance Criteria Verification

| Criterion | Verification Method |
|-----------|---------------------|
| All form components identified | Checklist of files audited |
| All Zod validation schemas reviewed | N/A - no Zod schemas currently exist |
| All React Hook Form validation rules reviewed | N/A - not used in codebase |
| All custom validation functions reviewed | Checklist of functions audited |
| Comprehensive catalog created | Catalog document with all entries |
| Messages categorized by type | Category field in each entry |
| Translator context included | Context notes in each entry |
| Consistent message structure | All entries follow template |
| Plain language used | Review of all message text |
| Actionable guidance provided | Messages include "how to fix" |
| Variable placeholders identified | Parameters field in each entry |
| Pluralization requirements identified | Pluralization field in each entry |
| Field-specific vs form-level distinguished | Category and location fields |
| Real-time vs submit-time identified | Triggering condition field |
| Complex field validation documented | Special sections for file/date/rich text |
| Security-related messages reviewed | Security notes where applicable |
| Consolidation recommendations included | Duplicate analysis section |
| Translation keys proposed | Proposed Key field in each entry |
| Gender/grammatical variations identified | Translator context notes |
| Format ready for implementation | Structured catalog format |

---

## 8. Dependencies

### 8.1 Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | Complete | next-intl installed |
| REQ-348: Create errors namespace structure | Prerequisite | Defines target key structure |
| Codebase access | Available | All files readable |

### 8.2 Downstream Dependencies

This audit enables:
- **Task 2J.3:** Audit API error handling and messages
- **Task 2J.4:** Create centralized error message utility
- **Task 2J.5:** Update Zod schemas to use translated messages
- **Task 2J.6:** Update error boundaries with translations

---

## 9. Testing Considerations

### 9.1 Audit Completeness Verification

1. **Grep verification** - Search for common validation patterns:
   - `return.*required`
   - `return.*invalid`
   - `return.*must be`
   - `return.*too (short|long|large)`
   - `error:.*'`
   - `isValid: false`

2. **Manual code review** - Check each form component for:
   - Switch/case validation blocks
   - Inline ternary error returns
   - Error state objects

3. **Cross-reference check** - Ensure all entries in error state objects are documented

### 9.2 Catalog Quality Verification

1. All entries follow consistent format
2. No duplicate entries
3. All parameters are documented
4. Translation keys follow naming convention
5. Translator context is meaningful

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing validation messages | Medium | Medium | Use grep patterns and manual review |
| Inconsistent categorization | Low | Low | Follow category definitions strictly |
| Missing parameter documentation | Medium | Medium | Test each message with sample data |
| Incomplete translator context | Low | Medium | Review with UX stakeholder |
| Hidden inline validation | Medium | Medium | Search for all error string patterns |

---

## 11. Estimated Effort

| Activity | Estimate |
|----------|----------|
| Audit LoginForm.tsx | 30 minutes |
| Audit RegistrationForm.tsx | 45 minutes |
| Audit PropertyForm.tsx | 20 minutes |
| Audit ItemForm.tsx | 30 minutes |
| Audit AddPropertyModal.tsx | 25 minutes |
| Audit PropertyEditModal.tsx | 20 minutes |
| Audit ItemCapture/utils/validation.ts | 1 hour |
| Audit access-validation.ts | 30 minutes |
| Create catalog document | 1.5 hours |
| Review and quality check | 30 minutes |
| **Total** | **~6-7 hours** |

---

## 12. Implementation Notes

### 12.1 Special Considerations

1. **Password validation messages** - RegistrationForm has complex password strength requirements with multiple messages. Consider whether these should be separate messages or a single dynamic message.

2. **File validation messages** - ItemCapture validation has dynamic file size/count messages with current values. Ensure ICU format supports current value display.

3. **Access code validation** - Unique to registration flow, contains security-sensitive messages. Ensure messages don't reveal system internals.

4. **Real-time vs submit validation** - LoginForm and RegistrationForm validate on change (real-time). Consider if message tone should differ.

5. **Duplicate messages** - "Email is required" appears in both LoginForm and RegistrationForm. Recommend consolidation to single key.

### 12.2 Consolidation Opportunities

| Duplicate Message | Locations | Recommendation |
|-------------------|-----------|----------------|
| "Email is required" | LoginForm, RegistrationForm | Use `errors.form.email.required` |
| "Password is required" | LoginForm, RegistrationForm | Use `errors.form.password.required` |
| "URL is required" | ItemForm, ItemCapture/validation | Use `errors.form.url.required` |
| "Invalid URL format" | ItemForm, ItemCapture/validation | Use `errors.form.url.invalid` |
| "Property type is required" | PropertyForm, AddPropertyModal | Use `errors.form.property.typeRequired` |

---

## 13. References

- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-349: Audit Form Validation Messages](/docs/gen_requests_epic2.md#req-349)
- [REQ-348: Create Errors Namespace Structure](/docs/REQ-348-create-errors-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
