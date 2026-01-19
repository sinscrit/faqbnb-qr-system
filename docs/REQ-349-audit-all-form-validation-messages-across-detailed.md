# REQ-349: Audit All Form Validation Messages Across Components - Detailed Implementation

**Document Created:** 2026-01-19 16:00:00 UTC
**Last Modified:** 2026-01-19 16:00:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - REQ-349
**Overview Document:** docs/REQ-349-audit-all-form-validation-messages-across-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Document Purpose

This document provides a detailed, step-by-step implementation guide for REQ-349, breaking down the comprehensive audit of all form validation messages into actionable tasks. Each task is designed to be approximately 1 story point and includes specific instructions, audit templates, and verification steps. The output of this task is a validation message catalog that serves as the foundation for internationalizing all validation feedback across the application.

---

## Context Summary

### Current State

The FAQBNB application has approximately **76 form validation messages** scattered across **8 key files**:

| Component/File | Location | Estimated Messages |
|----------------|----------|-------------------|
| LoginForm | `/src/components/LoginForm.tsx` | ~6 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~15 |
| PropertyForm | `/src/components/PropertyForm.tsx` | ~4 |
| ItemForm | `/src/components/ItemForm.tsx` | ~8 |
| AddPropertyModal | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | ~7 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ~5 |
| ItemCapture validation utils | `/src/components/ItemCapture/utils/validation.ts` | ~25 |
| Access validation | `/src/lib/access-validation.ts` | ~6 |

### Target State

A comprehensive **Validation Message Catalog** document at `/docs/i18n/validation-message-catalog.md` containing:
- All unique validation messages with ID references (VM-001 through VM-076+)
- Current location (file:line)
- Triggering conditions
- Proposed translation keys
- Parameters needed
- Pluralization requirements
- Translator context notes
- Category classification
- Consolidation recommendations

### Dependencies

- Epic 1 complete (next-intl installed and configured)
- REQ-348: Create errors namespace structure (prerequisite - defines target key structure)
- All source files readable

---

## Task Breakdown

### Task 1: Create Validation Message Catalog Document Structure

**Objective**: Create the initial catalog document with proper structure and headers

**File to Create**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Create the `/docs/i18n/` directory if it doesn't exist
2. Create the catalog document with the following structure:

```markdown
# FAQBNB Validation Message Catalog

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Related Request:** REQ-349
**Purpose:** Comprehensive catalog of all form validation messages for i18n

---

## Executive Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Required field | 0 | 0% |
| Format error | 0 | 0% |
| Length constraint | 0 | 0% |
| Range constraint | 0 | 0% |
| Pattern match | 0 | 0% |
| Password validation | 0 | 0% |
| File validation | 0 | 0% |
| Custom business rules | 0 | 0% |
| **Total** | **0** | **100%** |

---

## Category Definitions

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

---

## Parameter Naming Conventions

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

## Validation Messages

<!-- Messages will be added in subsequent tasks -->

---

## Consolidation Recommendations

<!-- To be completed after audit -->

---

## Translation Key Mapping Summary

<!-- To be completed after audit -->

---

## Translator Context Guide

<!-- To be completed after audit -->

---

## Implementation Priority

<!-- To be completed after audit -->
```

**Verification**:
- [ ] Directory `/docs/i18n/` exists
- [ ] File `/docs/i18n/validation-message-catalog.md` is created
- [ ] Document has proper markdown structure

**Estimated Effort**: 15 minutes

---

### Task 2: Audit LoginForm Validation Messages

**Objective**: Extract all validation messages from LoginForm and add to catalog

**File to Audit**: `/src/components/LoginForm.tsx`

**Steps**:

1. Read the entire LoginForm.tsx file
2. Search for all validation message patterns:
   - `return '...'` inside `validateField` function
   - Error state assignments
   - Error messages in try/catch blocks
3. Document each message using the catalog entry format below

**Expected Messages to Find** (based on overview):

| Message | Line (approx) | Trigger | Proposed Key |
|---------|---------------|---------|--------------|
| "Email is required" | ~50 | Empty email field | `errors.form.email.required` |
| "Please enter a valid email address" | ~52 | Invalid email format | `errors.form.email.invalid` |
| "Password is required" | ~55 | Empty password field | `errors.form.password.required` |
| "Password must be at least 6 characters" | ~57 | Password < 6 chars | `errors.form.password.tooShort` |
| "Invalid email or password" | ~varies | Auth failure response | `errors.auth.invalidCredentials` |
| "Error signing in" | ~varies | Generic auth error | `errors.auth.signInFailed` |

**Catalog Entry Format**:

Add each message to the catalog:

```markdown
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
```

**Verification**:
- [ ] All validation messages in LoginForm.tsx identified
- [ ] Each message has a catalog entry with ID (VM-00X)
- [ ] Triggering conditions accurately documented
- [ ] Translation keys follow naming convention

**Estimated Effort**: 30 minutes

---

### Task 3: Audit RegistrationForm Validation Messages

**Objective**: Extract all validation messages from RegistrationForm and add to catalog

**File to Audit**: `/src/components/RegistrationForm.tsx`

**Steps**:

1. Read the entire RegistrationForm.tsx file
2. This file likely has the most complex validation with password strength checking
3. Search for validation patterns in `validateField` function
4. Document password-specific messages (strength indicators, match validation)
5. Document terms and conditions validation

**Expected Messages to Find** (based on overview):

| Message | Trigger | Category | Proposed Key |
|---------|---------|----------|--------------|
| "Email is required" | Empty email | required | `errors.form.email.required` |
| "Please enter a valid email address" | Invalid email | format | `errors.form.email.invalid` |
| "Password is required" | Empty password | required | `errors.form.password.required` |
| "Password must be at least 8 characters" | Password < 8 chars | length | `errors.form.password.tooShort` |
| "Password must contain at least one lowercase letter" | Missing lowercase | password | `errors.form.password.noLowercase` |
| "Password must contain at least one uppercase letter" | Missing uppercase | password | `errors.form.password.noUppercase` |
| "Password must contain at least one number" | Missing number | password | `errors.form.password.noNumber` |
| "Passwords do not match" | Confirm mismatch | password | `errors.form.password.mismatch` |
| "Please confirm your password" | Empty confirm | required | `errors.form.password.confirmRequired` |
| "You must agree to the terms and conditions" | Unchecked terms | required | `errors.form.terms.required` |
| "Full Name must be at least 2 characters" | Name too short | length | `errors.form.fullName.tooShort` |
| "Registration Failed" | Server error | custom | `errors.auth.registrationFailed` |

**Special Considerations**:
- Password validation messages form a cohesive set
- Consider whether these should be shown together or individually
- Note that min password length differs from LoginForm (8 vs 6)

**Catalog Entry Example for Password Complexity**:

```markdown
### VM-010: Password must contain at least one lowercase letter

**Location:** `/src/components/RegistrationForm.tsx` line XX
**Function:** `validateField()` case 'password'
**Triggering Condition:** User enters password without any lowercase letters (a-z)
**Category:** password
**Proposed Key:** `errors.form.password.noLowercase`
**Parameters:** None
**Pluralization:** Not Required
**Translator Context:** Password complexity requirement. This is one of several password requirements shown during registration. The message should be consistent in style with other password requirement messages (noUppercase, noNumber, noSpecial). Some languages may need to specify "Latin lowercase letter" if the primary alphabet differs.
**Related Messages:** VM-009 (tooShort), VM-011 (noUppercase), VM-012 (noNumber)
```

**Verification**:
- [ ] All 12+ validation messages in RegistrationForm identified
- [ ] Password complexity messages are grouped and cross-referenced
- [ ] Translator context notes password requirement consistency
- [ ] Differences from LoginForm noted (e.g., min password length)

**Estimated Effort**: 45 minutes

---

### Task 4: Audit PropertyForm Validation Messages

**Objective**: Extract all validation messages from PropertyForm and add to catalog

**File to Audit**: `/src/components/PropertyForm.tsx`

**Steps**:

1. Read the PropertyForm.tsx file
2. Search for inline validation logic
3. Document property-specific validation messages

**Expected Messages to Find** (based on overview):

| Message | Trigger | Category | Proposed Key |
|---------|---------|----------|--------------|
| "Property nickname is required" | Empty nickname | required | `errors.form.property.nicknameRequired` |
| "Property type is required" | No type selected | required | `errors.form.property.typeRequired` |
| "Nickname is too long" | Exceeds max length | length | `errors.form.property.nicknameTooLong` |
| "Address is too long" | Exceeds max length | length | `errors.form.property.addressTooLong` |

**Catalog Entry Example**:

```markdown
### VM-016: Property nickname is required

**Location:** `/src/components/PropertyForm.tsx` line XX
**Function:** inline validation
**Triggering Condition:** User attempts to save property without entering a nickname
**Category:** required
**Proposed Key:** `errors.form.property.nicknameRequired`
**Parameters:** None
**Pluralization:** Not Required
**Translator Context:** Properties in FAQBNB are vacation rentals. The "nickname" is a friendly name the owner gives to their property (e.g., "Beach House", "Mountain Retreat"). This differs from the formal address. The message should indicate the nickname specifically is required, not just "name".
**Related Messages:** VM-025 (AddPropertyModal.nameRequired)
```

**Verification**:
- [ ] All validation messages in PropertyForm identified
- [ ] Translator context explains domain concepts (property, nickname)
- [ ] Length constraint messages include max values if available

**Estimated Effort**: 20 minutes

---

### Task 5: Audit ItemForm Validation Messages

**Objective**: Extract all validation messages from ItemForm and add to catalog

**File to Audit**: `/src/components/ItemForm.tsx`

**Steps**:

1. Read the ItemForm.tsx file
2. Search for validation patterns and error messages
3. Document item creation/editing validation

**Expected Messages to Find** (based on overview):

| Message | Trigger | Category | Proposed Key |
|---------|---------|----------|--------------|
| "Name is required" | Empty name field | required | `errors.form.item.nameRequired` |
| "Property selection is required" | No property selected | required | `errors.form.item.propertyRequired` |
| "Invalid URL format" | Link URL invalid | format | `errors.form.url.invalid` |
| "URL is required" | Empty link URL | required | `errors.form.url.required` |
| "Failed to save item" | Save error | custom | `errors.item.saveFailed` |
| "Failed to delete item" | Delete error | custom | `errors.item.deleteFailed` |
| "Invalid UUID format" | publicId format error | format | `errors.form.uuid.invalid` |
| "Description is too long" | Exceeds max length | length | `errors.form.item.descriptionTooLong` |

**Catalog Entry Example with Parameters**:

```markdown
### VM-024: Description is too long

**Location:** `/src/components/ItemForm.tsx` line XX
**Function:** inline validation
**Triggering Condition:** User enters item description exceeding maximum character limit
**Category:** length
**Proposed Key:** `errors.form.item.descriptionTooLong`
**Parameters:** `{max}` - maximum character limit (e.g., 500)
**Pluralization:** Not Required
**Translator Context:** Items are QR code linked objects (appliances, furniture) in rental properties. The description is free-form text explaining the item. The message should communicate that the description needs to be shortened. Consider including the current length in the message: "Description is too long ({current}/{max} characters)".
**Related Messages:** VM-055 (validation.ts title too long)
```

**Verification**:
- [ ] All validation messages in ItemForm identified
- [ ] URL validation messages noted for consolidation with ItemCapture
- [ ] Save/delete error messages categorized as custom business rules

**Estimated Effort**: 30 minutes

---

### Task 6: Audit AddPropertyModal Validation Messages

**Objective**: Extract all validation messages from AddPropertyModal and add to catalog

**File to Audit**: `/src/components/SimpleDashboard/AddPropertyModal.tsx`

**Steps**:

1. Read the AddPropertyModal.tsx file
2. Find the `validateForm()` function
3. Document all validation messages

**Expected Messages to Find** (based on overview):

| Message | Trigger | Category | Proposed Key |
|---------|---------|----------|--------------|
| "Property name is required" | Empty name | required | `errors.form.property.nameRequired` |
| "Property name is too long" | Exceeds max length | length | `errors.form.property.nameTooLong` |
| "Invalid country code" | Country not in list | format | `errors.form.property.invalidCountry` |
| "Address line is too long" | Exceeds max length | length | `errors.form.property.addressLineTooLong` |
| "City is required" | Empty city | required | `errors.form.property.cityRequired` |
| "Failed to create property" | Save error | custom | `errors.property.createFailed` |
| "Property type is required" | No type selected | required | `errors.form.property.typeRequired` |

**Note**: "Property type is required" appears in both PropertyForm and AddPropertyModal - flag for consolidation.

**Verification**:
- [ ] All validation messages in AddPropertyModal identified
- [ ] Duplicates with PropertyForm noted
- [ ] Address-related validations documented

**Estimated Effort**: 25 minutes

---

### Task 7: Audit PropertyEditModal Validation Messages

**Objective**: Extract all validation messages from PropertyEditModal and add to catalog

**File to Audit**: `/src/components/SimpleDashboard/PropertyEditModal.tsx`

**Steps**:

1. Read the PropertyEditModal.tsx file
2. Find validation logic (may mirror AddPropertyModal)
3. Document any unique validation messages

**Expected Messages**: Similar to AddPropertyModal but may have edit-specific messages

| Message | Trigger | Category | Proposed Key |
|---------|---------|----------|--------------|
| "Property name is required" | Empty name | required | `errors.form.property.nameRequired` |
| "Property name is too long" | Exceeds max length | length | `errors.form.property.nameTooLong` |
| "Failed to update property" | Update error | custom | `errors.property.updateFailed` |

**Verification**:
- [ ] All unique validation messages identified
- [ ] Shared messages with AddPropertyModal noted for single key usage
- [ ] Edit-specific messages documented

**Estimated Effort**: 20 minutes

---

### Task 8: Audit ItemCapture Validation Utilities

**Objective**: Extract all validation messages from the comprehensive ItemCapture validation module

**File to Audit**: `/src/components/ItemCapture/utils/validation.ts`

**Steps**:

1. Read the entire validation.ts file
2. This is the largest validation file with ~25 messages
3. Document each exported validation function
4. Note parameter interpolation requirements
5. Pay attention to file-related validations

**Expected Messages to Find** (based on overview):

| Function | Message | Category | Proposed Key | Parameters |
|----------|---------|----------|--------------|------------|
| `validateTitle` | "Title is required" | required | `errors.form.title.required` | - |
| `validateTitle` | "Title must be {max} characters or less (current: {current})" | length | `errors.form.title.tooLong` | `{max, current}` |
| `validateContentRequirement` | "At least one media item, link, or text instructions must be provided" | required | `errors.form.content.required` | - |
| `validateFileSize` | "File exceeds {max}MB limit (current: {current}MB)" | file | `errors.file.tooLarge` | `{max, current}` |
| `validateTotalSize` | "Total upload size ({current}) exceeds {max} limit" | file | `errors.file.totalSizeExceeded` | `{max, current}` |
| `validateTextLength` | "Instructions exceed {max} character limit (current: {current})" | length | `errors.form.text.tooLong` | `{max, current}` |
| `validateUrl` | "URL is required" | required | `errors.form.url.required` | - |
| `validateUrl` | "Invalid URL format" | format | `errors.form.url.invalid` | - |
| `validateUrl` | "Only http and https URLs are allowed" | format | `errors.form.url.invalidProtocol` | - |
| `validateUrl` | "URL exceeds {max} character limit" | length | `errors.form.url.tooLong` | `{max}` |
| `validateImageCount` | "Maximum {max} photos allowed (current: {current})" | file | `errors.file.maxImagesExceeded` | `{max, current}` |
| `validateUrlCount` | "Maximum {max} links allowed (current: {current})" | range | `errors.form.url.maxCountExceeded` | `{max, current}` |
| `validateMimeType` | "File type '{type}' is not supported for {mediaType}" | file | `errors.file.unsupportedType` | `{type, mediaType}` |
| `validateMimeType` | "No media types are allowed" | file | `errors.file.noTypesAllowed` | - |

**Catalog Entry Example with Multiple Parameters**:

```markdown
### VM-048: File exceeds {max}MB limit (current: {current}MB)

**Location:** `/src/components/ItemCapture/utils/validation.ts` line 157
**Function:** `validateFileSize()`
**Triggering Condition:** User uploads a file that exceeds the maximum allowed file size
**Category:** file
**Proposed Key:** `errors.file.tooLarge`
**Parameters:**
  - `{max}` - Maximum allowed file size in MB
  - `{current}` - Actual file size in MB
**Pluralization:** Not Required
**Translator Context:** File upload error shown when a user's file is too large. The message displays both the limit and current file size to help users understand how much they need to reduce the file. Keep the format consistent (both values in MB). Some languages may format numbers differently (commas vs periods for decimals).
**Related Messages:** VM-049 (totalSizeExceeded)
```

**Special Considerations**:
- Many messages include current values for user feedback
- ICU format will need `{max}` and `{current}` parameters
- File type validation may need plural handling for lists

**Verification**:
- [ ] All ~25 validation messages identified
- [ ] All parameters documented with descriptions
- [ ] File validation messages grouped together
- [ ] URL validation messages noted for consolidation with ItemForm

**Estimated Effort**: 1 hour

---

### Task 9: Audit Access Validation Messages

**Objective**: Extract all validation messages from access-validation.ts

**File to Audit**: `/src/lib/access-validation.ts`

**Steps**:

1. Read the access-validation.ts file
2. Find `validateAccessCodeFormat` function
3. Document security-sensitive messages
4. Note any messages that shouldn't reveal system internals

**Expected Messages to Find** (based on overview):

| Function | Message | Category | Proposed Key |
|----------|---------|----------|--------------|
| `validateAccessCodeFormat` | "Access code is required" | required | `errors.form.accessCode.required` |
| `validateAccessCodeFormat` | "Access code must be 12 characters long" | length | `errors.form.accessCode.invalidLength` |
| `validateAccessCodeFormat` | "Access code must contain only uppercase letters and numbers" | pattern | `errors.form.accessCode.invalidFormat` |
| validation logic | "Email does not match the access request" | custom | `errors.auth.accessCode.emailMismatch` |
| validation logic | "This access code has already been used for registration" | custom | `errors.auth.accessCode.alreadyUsed` |
| validation logic | "Access code is not approved for registration" | custom | `errors.auth.accessCode.notApproved` |

**Security Considerations**:

```markdown
### VM-070: Access code is not approved for registration

**Location:** `/src/lib/access-validation.ts` line XX
**Function:** validation logic
**Triggering Condition:** User tries to register with an access code that hasn't been approved
**Category:** custom
**Proposed Key:** `errors.auth.accessCode.notApproved`
**Parameters:** None
**Pluralization:** Not Required
**Translator Context:** Security-sensitive message. Access codes are issued by property owners to guests. "Not approved" means the property owner hasn't approved this specific request yet. Do NOT translate to imply the code is invalid or reveal details about the approval workflow. Keep the message vague enough to not help malicious users understand the system state.
**Security Notes:**
  - Don't reveal whether the code exists or not
  - Don't distinguish between pending and rejected codes
  - Consider using a generic "cannot be used" message instead
**Related Messages:** VM-068 (alreadyUsed), VM-069 (emailMismatch)
```

**Verification**:
- [ ] All access code validation messages identified
- [ ] Security notes added for sensitive messages
- [ ] Translator context avoids revealing system internals

**Estimated Effort**: 30 minutes

---

### Task 10: Complete Grep-Based Validation Sweep

**Objective**: Use grep to find any validation messages missed in manual audit

**Steps**:

1. Run grep patterns across the entire `/src` directory
2. Compare results with already-documented messages
3. Add any missed messages to the catalog

**Grep Patterns to Run**:

```bash
# Pattern 1: Return statements with error strings
grep -rn "return.*required" --include="*.tsx" --include="*.ts" src/

# Pattern 2: Return statements with "invalid"
grep -rn "return.*invalid" --include="*.tsx" --include="*.ts" src/

# Pattern 3: Return statements with "must be"
grep -rn "return.*must be" --include="*.tsx" --include="*.ts" src/

# Pattern 4: Return statements with too short/long/large
grep -rn "return.*too \(short\|long\|large\)" --include="*.tsx" --include="*.ts" src/

# Pattern 5: Error object assignments
grep -rn "error:.*'" --include="*.tsx" --include="*.ts" src/

# Pattern 6: ValidationResult with isValid: false
grep -rn "isValid: false" --include="*.tsx" --include="*.ts" src/

# Pattern 7: setError calls
grep -rn "setError\|setErrors" --include="*.tsx" --include="*.ts" src/

# Pattern 8: Toast error messages
grep -rn "toast\.error\|showError" --include="*.tsx" --include="*.ts" src/
```

**Expected Additional Locations**:
- `/src/lib/error-utils.ts` - Error mapping patterns
- Any other form components not in the main list

**Verification**:
- [ ] All grep patterns executed
- [ ] Results compared against existing catalog entries
- [ ] Any new messages added with VM-IDs
- [ ] False positives (non-user-facing strings) excluded

**Estimated Effort**: 30 minutes

---

### Task 11: Update Executive Summary with Final Counts

**Objective**: Update the catalog's executive summary with accurate message counts

**File to Modify**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Count all cataloged messages by category
2. Update the Executive Summary table
3. Calculate percentages

**Expected Format**:

```markdown
## Executive Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Required field | 15 | 20% |
| Format error | 8 | 11% |
| Length constraint | 12 | 16% |
| Range constraint | 5 | 7% |
| Pattern match | 4 | 5% |
| Password validation | 10 | 13% |
| File validation | 12 | 16% |
| Custom business rules | 10 | 13% |
| **Total** | **76** | **100%** |

### Messages by Source File

| File | Messages |
|------|----------|
| LoginForm.tsx | 6 |
| RegistrationForm.tsx | 15 |
| PropertyForm.tsx | 4 |
| ItemForm.tsx | 8 |
| AddPropertyModal.tsx | 7 |
| PropertyEditModal.tsx | 5 |
| validation.ts | 25 |
| access-validation.ts | 6 |
| **Total** | **76** |
```

**Verification**:
- [ ] All message counts accurate
- [ ] Percentages sum to 100%
- [ ] Source file breakdown matches tasks 2-9

**Estimated Effort**: 15 minutes

---

### Task 12: Create Consolidation Recommendations Section

**Objective**: Identify and document duplicate or similar messages that should share translation keys

**File to Modify**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Review all cataloged messages for duplicates
2. Identify messages with identical or near-identical wording
3. Recommend consolidated translation keys
4. Note any messages that differ slightly but should be unified

**Expected Consolidation Recommendations**:

```markdown
## Consolidation Recommendations

### High Priority Consolidations

The following messages appear in multiple locations and should use the same translation key:

| Message | Locations | Recommended Key |
|---------|-----------|-----------------|
| "Email is required" | LoginForm, RegistrationForm | `errors.form.email.required` |
| "Password is required" | LoginForm, RegistrationForm | `errors.form.password.required` |
| "URL is required" | ItemForm, ItemCapture/validation | `errors.form.url.required` |
| "Invalid URL format" | ItemForm, ItemCapture/validation | `errors.form.url.invalid` |
| "Property type is required" | PropertyForm, AddPropertyModal | `errors.form.property.typeRequired` |
| "Property name is required" | AddPropertyModal, PropertyEditModal | `errors.form.property.nameRequired` |

### Near-Duplicate Messages

The following messages have similar intent but different wording. Consider unifying:

| Message 1 | Message 2 | Recommendation |
|-----------|-----------|----------------|
| "Password must be at least 6 characters" (LoginForm) | "Password must be at least 8 characters" (RegistrationForm) | Use parameterized key: `errors.form.password.tooShort` with `{min}` parameter |
| "Nickname is too long" | "Property name is too long" | Consider unified: `errors.form.property.nameTooLong` since nickname = property name |

### Messages to Keep Separate

The following similar messages should remain separate due to context differences:

| Message 1 | Message 2 | Reason |
|-----------|-----------|--------|
| "Failed to save item" | "Failed to create property" | Different domains, different user actions |
| "Email is required" | "City is required" | Same pattern but field context matters for translations |
```

**Verification**:
- [ ] All duplicate messages identified
- [ ] Near-duplicates analyzed and recommendations made
- [ ] Rationale provided for keeping separate when appropriate
- [ ] VM-ID cross-references included

**Estimated Effort**: 30 minutes

---

### Task 13: Create Translation Key Mapping Summary

**Objective**: Provide a comprehensive mapping of all validation messages to their proposed translation keys

**File to Modify**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Extract all proposed keys from individual entries
2. Organize by namespace hierarchy
3. Identify any naming inconsistencies

**Expected Format**:

```markdown
## Translation Key Mapping Summary

### errors.form.email
| Key | Message |
|-----|---------|
| `errors.form.email.required` | "Email is required" |
| `errors.form.email.invalid` | "Please enter a valid email address" |

### errors.form.password
| Key | Message |
|-----|---------|
| `errors.form.password.required` | "Password is required" |
| `errors.form.password.tooShort` | "Password must be at least {min} characters" |
| `errors.form.password.noLowercase` | "Password must contain at least one lowercase letter" |
| `errors.form.password.noUppercase` | "Password must contain at least one uppercase letter" |
| `errors.form.password.noNumber` | "Password must contain at least one number" |
| `errors.form.password.mismatch` | "Passwords do not match" |
| `errors.form.password.confirmRequired` | "Please confirm your password" |

### errors.form.property
| Key | Message |
|-----|---------|
| `errors.form.property.nameRequired` | "Property name is required" |
| `errors.form.property.nameTooLong` | "Property name is too long" |
| `errors.form.property.nicknameRequired` | "Property nickname is required" |
| `errors.form.property.nicknameTooLong` | "Nickname is too long" |
| `errors.form.property.typeRequired` | "Property type is required" |
| `errors.form.property.cityRequired` | "City is required" |
| `errors.form.property.invalidCountry` | "Invalid country code" |
| `errors.form.property.addressLineTooLong` | "Address line is too long" |
| `errors.form.property.addressTooLong` | "Address is too long" |

### errors.form.item
| Key | Message |
|-----|---------|
| `errors.form.item.nameRequired` | "Name is required" |
| `errors.form.item.propertyRequired` | "Property selection is required" |
| `errors.form.item.descriptionTooLong` | "Description is too long" |

### errors.form.url
| Key | Message |
|-----|---------|
| `errors.form.url.required` | "URL is required" |
| `errors.form.url.invalid` | "Invalid URL format" |
| `errors.form.url.invalidProtocol` | "Only http and https URLs are allowed" |
| `errors.form.url.tooLong` | "URL exceeds {max} character limit" |
| `errors.form.url.maxCountExceeded` | "Maximum {max} links allowed" |

### errors.form.title
| Key | Message |
|-----|---------|
| `errors.form.title.required` | "Title is required" |
| `errors.form.title.tooLong` | "Title must be {max} characters or less" |

### errors.form.text
| Key | Message |
|-----|---------|
| `errors.form.text.tooLong` | "Instructions exceed {max} character limit" |

### errors.form.content
| Key | Message |
|-----|---------|
| `errors.form.content.required` | "At least one media item, link, or text instructions must be provided" |

### errors.form.terms
| Key | Message |
|-----|---------|
| `errors.form.terms.required` | "You must agree to the terms and conditions" |

### errors.form.fullName
| Key | Message |
|-----|---------|
| `errors.form.fullName.tooShort` | "Full Name must be at least {min} characters" |

### errors.form.accessCode
| Key | Message |
|-----|---------|
| `errors.form.accessCode.required` | "Access code is required" |
| `errors.form.accessCode.invalidLength` | "Access code must be 12 characters long" |
| `errors.form.accessCode.invalidFormat` | "Access code must contain only uppercase letters and numbers" |

### errors.form.uuid
| Key | Message |
|-----|---------|
| `errors.form.uuid.invalid` | "Invalid UUID format" |

### errors.file
| Key | Message |
|-----|---------|
| `errors.file.tooLarge` | "File exceeds {max}MB limit" |
| `errors.file.totalSizeExceeded` | "Total upload size exceeds {max} limit" |
| `errors.file.maxImagesExceeded` | "Maximum {max} photos allowed" |
| `errors.file.unsupportedType` | "File type '{type}' is not supported" |
| `errors.file.noTypesAllowed` | "No media types are allowed" |

### errors.auth
| Key | Message |
|-----|---------|
| `errors.auth.invalidCredentials` | "Invalid email or password" |
| `errors.auth.signInFailed` | "Error signing in" |
| `errors.auth.registrationFailed` | "Registration Failed" |
| `errors.auth.accessCode.emailMismatch` | "Email does not match the access request" |
| `errors.auth.accessCode.alreadyUsed` | "This access code has already been used" |
| `errors.auth.accessCode.notApproved` | "Access code is not approved for registration" |

### errors.item
| Key | Message |
|-----|---------|
| `errors.item.saveFailed` | "Failed to save item" |
| `errors.item.deleteFailed` | "Failed to delete item" |

### errors.property
| Key | Message |
|-----|---------|
| `errors.property.createFailed` | "Failed to create property" |
| `errors.property.updateFailed` | "Failed to update property" |
```

**Verification**:
- [ ] All messages have corresponding keys
- [ ] Key hierarchy is consistent
- [ ] No duplicate keys with different messages (except intentional consolidations)
- [ ] Parameter placeholders noted where applicable

**Estimated Effort**: 30 minutes

---

### Task 14: Create Translator Context Guide

**Objective**: Provide comprehensive guidance for translators working on validation messages

**File to Modify**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Compile general guidance for translators
2. Document domain-specific terminology
3. Note grammatical considerations for different languages
4. Provide examples of good and poor translations

**Expected Format**:

```markdown
## Translator Context Guide

### General Guidelines

1. **Tone**: Validation messages should be:
   - Helpful, not accusatory ("Please enter" not "You failed to enter")
   - Concise but clear
   - Actionable (tell users what to do, not just what's wrong)

2. **Consistency**: Related messages should use consistent terminology:
   - Always use "required" for empty field errors, not "needed" or "mandatory"
   - Use "invalid" for format errors, not "incorrect" or "wrong"
   - Use "characters" for length limits, not "letters" or "symbols"

3. **Parameters**: Messages with `{placeholders}` require special attention:
   - Keep the placeholder exactly as written
   - Adjust surrounding text for grammatical correctness in the target language
   - Example: "Must be at least {min} characters" → French: "Doit contenir au moins {min} caractères"

### Domain Terminology

| English Term | Context | Translation Notes |
|--------------|---------|-------------------|
| Property | A vacation rental (house, apartment, etc.) | May be "logement", "propriété", "immobile" depending on language and context |
| Item | A QR-code linked object (appliance, furniture) | Should suggest a physical object, not a list item |
| Access code | A 12-character alphanumeric code | Keep technical, don't translate to "password" or "PIN" |
| Nickname | User-friendly property name | Distinct from formal address, should convey "friendly name" |
| Room | A location within a property | Physical room, not "space" or abstract location |

### Grammatical Considerations

#### Gender Agreement
Some languages require gender agreement. Consider:
- "Required field" may need masculine/feminine forms
- "{fieldName} is required" may need agreement with field gender

#### Formal vs Informal Address
- The application uses polite/formal address (vous/usted/Sie)
- Validation messages should maintain this formality

#### Number Agreement
- "characters" pluralizes differently: 1 character / 2 characters
- Use ICU plural format where needed

### Examples

#### Good Translations
| English | French | Notes |
|---------|--------|-------|
| "Email is required" | "L'adresse e-mail est requise" | Clear, polite |
| "Password must be at least 8 characters" | "Le mot de passe doit contenir au moins 8 caractères" | Parameter preserved |

#### Poor Translations
| English | Poor Translation | Issue |
|---------|------------------|-------|
| "Email is required" | "Entrez email!" | Too abrupt, informal |
| "Invalid URL format" | "Format URL invalide" | Awkward word order |

### Messages Requiring Special Attention

1. **Security Messages** (VM-068 through VM-072):
   - Don't reveal system internals
   - Keep intentionally vague about approval states

2. **Password Strength Messages** (VM-009 through VM-013):
   - Keep consistent style across all password requirements
   - May need locale-specific character examples

3. **File Error Messages** (VM-045 through VM-055):
   - Numbers should use locale-appropriate formatting
   - "MB" abbreviation may need localization
```

**Verification**:
- [ ] General guidelines comprehensive
- [ ] Domain terminology documented
- [ ] Grammatical considerations for major language families covered
- [ ] Good/poor translation examples provided

**Estimated Effort**: 30 minutes

---

### Task 15: Create Implementation Priority Section

**Objective**: Provide prioritized implementation recommendations

**File to Modify**: `/docs/i18n/validation-message-catalog.md`

**Steps**:

1. Prioritize based on user impact and frequency
2. Group by implementation phase
3. Note dependencies between messages

**Expected Format**:

```markdown
## Implementation Priority

### Priority 1: Critical Path Messages (Implement First)

Messages on the authentication flow - users see these before anything else:

| VM-ID | Message | Location | Key |
|-------|---------|----------|-----|
| VM-001 | Email is required | LoginForm | `errors.form.email.required` |
| VM-002 | Please enter a valid email address | LoginForm | `errors.form.email.invalid` |
| VM-003 | Password is required | LoginForm | `errors.form.password.required` |
| VM-004 | Password must be at least 6 characters | LoginForm | `errors.form.password.tooShort` |
| VM-005 | Invalid email or password | LoginForm | `errors.auth.invalidCredentials` |
| VM-006 | Error signing in | LoginForm | `errors.auth.signInFailed` |

### Priority 2: Registration Flow Messages

Complete the authentication experience:

| VM-ID | Message | Location | Key |
|-------|---------|----------|-----|
| VM-007 | Email is required | RegistrationForm | (consolidated with VM-001) |
| ... | (all registration messages) | ... | ... |

### Priority 3: Core Feature Messages

Property and Item creation/editing:

| VM-ID | Message | Location | Key |
|-------|---------|----------|-----|
| VM-016 | Property nickname is required | PropertyForm | `errors.form.property.nicknameRequired` |
| ... | (all property/item messages) | ... | ... |

### Priority 4: Advanced Feature Messages

ItemCapture workflow validation:

| VM-ID | Message | Location | Key |
|-------|---------|----------|-----|
| VM-040 | Title is required | validation.ts | `errors.form.title.required` |
| ... | (all ItemCapture messages) | ... | ... |

### Implementation Notes

1. **Consolidations should be done first**: Before implementing individual messages, consolidate the duplicates identified in the Consolidation Recommendations section.

2. **Test high-frequency paths**: After Priority 1 and 2, test the complete login and registration flows in all languages.

3. **File validations need ICU formatting**: Priority 4 messages with parameters require ICU message format setup.

### Suggested Implementation Order by File

1. `LoginForm.tsx` (6 messages)
2. `RegistrationForm.tsx` (15 messages)
3. `PropertyForm.tsx` + `AddPropertyModal.tsx` + `PropertyEditModal.tsx` (16 messages, many shared)
4. `ItemForm.tsx` (8 messages)
5. `validation.ts` (25 messages)
6. `access-validation.ts` (6 messages)
```

**Verification**:
- [ ] All 76+ messages assigned to priority tier
- [ ] Dependencies noted
- [ ] Implementation order logical
- [ ] Cross-references to consolidation section

**Estimated Effort**: 20 minutes

---

### Task 16: Final Review and Quality Check

**Objective**: Ensure the catalog is complete, accurate, and ready for use

**Steps**:

1. **Completeness Check**:
   - All sections populated
   - VM-IDs sequential (VM-001 through VM-076+)
   - No placeholder text remaining

2. **Consistency Check**:
   - All entries follow the same format
   - Category assignments consistent
   - Key naming convention followed throughout

3. **Cross-Reference Check**:
   - Related Messages links are valid
   - Consolidation recommendations match actual duplicates
   - Translation keys in mapping match individual entries

4. **Accuracy Check**:
   - Line numbers approximate but reasonable
   - Triggering conditions accurate
   - Parameters correctly identified

**Verification Checklist**:

```markdown
### Final Verification Checklist

#### Completeness
- [ ] Executive Summary has accurate counts
- [ ] All 8 source files audited
- [ ] 76+ messages documented
- [ ] Consolidation Recommendations complete
- [ ] Translation Key Mapping complete
- [ ] Translator Context Guide complete
- [ ] Implementation Priority complete

#### Consistency
- [ ] All entries use VM-XXX format
- [ ] All entries have all required fields
- [ ] Categories consistently assigned
- [ ] Key naming follows convention

#### Accuracy
- [ ] Sample entries verified against source code
- [ ] Parameters match actual message format
- [ ] Related Messages cross-references valid

#### Quality
- [ ] Translator context is helpful, not generic
- [ ] Security considerations documented for sensitive messages
- [ ] Implementation priorities are logical
```

**Estimated Effort**: 30 minutes

---

## Implementation Summary

### Total Tasks: 16

### Effort Breakdown by Phase

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Setup | Task 1 | 15 min |
| Source File Audits | Tasks 2-9 | 4.5 hours |
| Sweep & Validation | Task 10 | 30 min |
| Summary & Analysis | Tasks 11-15 | 2 hours |
| Final Review | Task 16 | 30 min |
| **Total** | **16 tasks** | **~7.5 hours** |

### Key Deliverables

1. **Validation Message Catalog** (`/docs/i18n/validation-message-catalog.md`)
   - Executive summary with category counts
   - 76+ individual message entries (VM-001 through VM-076+)
   - Each entry with location, trigger, key, parameters, context
   - Consolidation recommendations
   - Translation key mapping
   - Translator context guide
   - Implementation priority

---

## Acceptance Criteria Checklist

From REQ-349 requirements:

- [ ] All form components are identified including registration, login, password reset, item creation, item editing, article creation, article editing, link creation, settings updates, and administrative forms
- [ ] All Zod validation schemas are reviewed (N/A - no Zod schemas currently)
- [ ] All React Hook Form validation rules are reviewed (N/A - not used)
- [ ] All custom validation functions and inline validation logic are reviewed and error messages are extracted
- [ ] A comprehensive catalog is created listing every unique validation message with its current location, triggering condition, and proposed translation key
- [ ] Validation messages are categorized by type: required field, format error, length constraint, range constraint, uniqueness violation, dependency error, and custom business rule
- [ ] Each validation message includes context for translators explaining the validation rule, expected input format, and any locale-specific considerations
- [ ] Validation messages follow a consistent structure with specific guidance rather than generic errors
- [ ] Messages avoid technical jargon and use plain language understandable by non-technical users
- [ ] Messages are actionable, telling users how to fix the error rather than only stating what is wrong
- [ ] Variable placeholders are identified for dynamic values like minimum length, maximum characters, or allowed formats
- [ ] Pluralization requirements are identified for messages that change based on count
- [ ] Field-specific vs. form-level validation messages are distinguished and categorized appropriately
- [ ] Real-time vs. submit-time validation messages are identified
- [ ] Validation messages for complex fields like file uploads, date pickers, and rich text editors are documented with special considerations
- [ ] Security-related validation messages are reviewed to ensure they do not expose sensitive system information while remaining helpful
- [ ] The audit document includes recommendations for consolidating duplicate or similar validation messages
- [ ] Translation keys are proposed for each validation message following the errors namespace structure
- [ ] The audit identifies validation messages that may need gender agreement or grammatical variations in different languages
- [ ] Findings are documented in a format that can be directly used for implementation in subsequent tasks

---

## Dependencies

### Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | Complete | next-intl installed |
| REQ-348: Create errors namespace structure | Prerequisite | Defines target key structure |
| Codebase access | Available | All files readable |

### Downstream Dependencies

This audit enables:
- **Task 2J.3:** Audit API error handling and messages
- **Task 2J.4:** Create centralized error message utility
- **Task 2J.5:** Update Zod schemas to use translated messages (if schemas are added)
- **Task 2J.6:** Update error boundaries with translations
- **Task 2J.7:** Generate translations for 5 non-English languages

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing validation messages | Use grep patterns to sweep entire codebase |
| Inconsistent categorization | Follow category definitions strictly |
| Incomplete parameter documentation | Test each message with sample data |
| Inadequate translator context | Review with UX stakeholder if available |
| Hidden inline validation | Search for all error string patterns |

---

## References

- **Overview Document**: `docs/REQ-349-audit-all-form-validation-messages-across-overview.md`
- **Request**: `docs/gen_requests_epic2.md` (REQ-349)
- **Implementation Plan**: `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Errors Namespace Structure**: `docs/REQ-348-create-errors-namespace-structure-overview.md`
- **next-intl Documentation**: https://next-intl-docs.vercel.app/
- **ICU Message Format**: https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2J.2: Audit All Form Validation Messages Across Components*
