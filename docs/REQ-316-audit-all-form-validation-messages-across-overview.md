# REQ-316: Audit Form Validation Messages Across Components - Technical Overview

**Document Created:** 2026-01-18 16:45 UTC
**Last Modified:** 2026-01-18 16:45 UTC
**Request Reference:** [REQ-316 in gen_requests_epic2.md](/docs/gen_requests_epic2.md#req-316-audit-form-validation-messages-across-components)
**Implementation Plan Reference:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
**Epic Context:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.2
**Priority:** Second (cross-cutting concern, foundation for other sub-epics)
**Size Estimate:** M (Medium)
**Estimated Effort:** 2-3 days

---

## 1. Overview

### 1.1 Purpose

This document provides a technical breakdown for auditing and standardizing all form validation messages across the FAQBNB application. The audit is a critical prerequisite for the L10N Epic 2 localization effort, ensuring all validation messages are identified, catalogued, standardized, and prepared for extraction to translation keys in the `errors` namespace.

### 1.2 Scope

The audit covers:
- **6 primary form components** with validation logic
- **2 utility files** with centralized validation functions
- **~100+ unique validation message strings** across the codebase
- Standardization of message wording, tone, and structure
- Migration path to translation keys for internationalization

### 1.3 Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| Epic 1 i18n Foundation | next-intl setup | Required (prerequisite) |
| Task 2J.1 | Create `errors` namespace structure | Must complete first |
| Translation files | `/messages/en.json` | Must have `errors` namespace |

---

## 2. Current State Analysis

### 2.1 Validation Patterns Identified

The codebase uses several validation patterns without a unified approach:

| Pattern | Description | Files Using |
|---------|-------------|-------------|
| **Custom Validation Functions** | Pure functions returning `ValidationResult` interface | `validation.ts`, `access-validation.ts` |
| **Inline State Validation** | React useState with manual error objects | `PropertyForm.tsx`, `LoginForm.tsx` |
| **Real-time Validation** | Debounced validation on input change | `AccessCodeInput.tsx` |
| **Form-level Validation** | Single validation pass on form submission | `RegistrationForm.tsx` |
| **Field-level Validation** | Validation per field with immediate feedback | All form components |

### 2.2 Validation Message Categories

Based on the codebase audit, validation messages fall into these categories:

| Category | Count (Est.) | Description |
|----------|--------------|-------------|
| Required Field Errors | ~15 | "X is required" messages |
| Format Validation | ~12 | Email, URL, UUID format errors |
| Length Constraints | ~18 | Min/max character length messages |
| Value Constraints | ~8 | File size, count limits |
| Password Validation | ~10 | Strength, match, requirements |
| Access Code Validation | ~8 | Format, status, usage errors |
| Content Validation | ~10 | Media, file, MIME type errors |
| Authentication Errors | ~6 | Login, permission errors |
| Generic/Fallback | ~5 | Catch-all error messages |

**Total: ~92 unique validation messages**

---

## 3. File Inventory

### 3.1 Primary Files for Audit

| File | Location | Message Count | Priority |
|------|----------|---------------|----------|
| `validation.ts` | `/src/components/ItemCapture/utils/` | ~25 | High |
| `access-validation.ts` | `/src/lib/` | ~15 | High |
| `RegistrationForm.tsx` | `/src/components/` | ~20 | High |
| `LoginForm.tsx` | `/src/components/` | ~8 | High |
| `PropertyForm.tsx` | `/src/components/` | ~6 | Medium |
| `ItemForm.tsx` | `/src/components/` | ~10 | Medium |
| `AccessCodeInput.tsx` | `/src/components/` | ~6 | Medium |
| `AddMediaLinkForm.tsx` | `/src/components/MediaManagement/` | ~4 | Low |
| `MailingListSignup.tsx` | `/src/components/` | ~4 | Low |

### 3.2 Discovered Message Locations

#### ItemCapture Validation (`/src/components/ItemCapture/utils/validation.ts`)

```
Title Validation:
- "Title is required"
- "Title must be {maxLength} characters or less (current: {length})"

Content Requirement:
- "At least one media item, link, or text instructions must be provided"

File Size:
- "File exceeds {maxAllowed} limit (current: {fileSize})"
- "Total upload size ({currentSize}) exceeds {maxAllowed} limit"

Text Length:
- "Instructions exceed {maxLength} character limit (current: {length})"

URL Validation:
- "URL is required"
- "URL exceeds {maxUrlLength} character limit"
- "Only http and https URLs are allowed"
- "Invalid URL format"
- "Maximum {maxUrls} links allowed (current: {urlCount})"

Image Count:
- "Maximum {maxCount} photos allowed (current: {imageCount})"

MIME Type:
- "File type '{mimeType}' is not supported for {mediaType}"
```

#### Access Validation (`/src/lib/access-validation.ts`)

```
Access Code Format:
- "Access code is required"
- "Access code must be a string"
- "Access code must be 12 characters long"
- "Access code must contain only uppercase letters and numbers"

Email Format:
- "Email is required"
- "Email must be a string"
- "Invalid email format"

Registration:
- "Access code validation failed"
- "Email does not match the access request"
- "This access code has already been used for registration"
- "Access code is not approved for registration"
- "Internal error during validation"

Access Code Consumption:
- "Access code not found or already used"
- "Failed to mark access code as used"
- "Internal error while consuming access code"
```

#### Registration Form (`/src/components/RegistrationForm.tsx`)

```
Email:
- "Email is required"
- "Please enter a valid email address"

Password:
- "Password is required"
- "Password must be at least 8 characters"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one number"

Password Confirmation:
- "Please confirm your password"
- "Passwords do not match"

Name:
- "Name must be at least 2 characters"

Terms:
- "You must agree to the terms and conditions"

Strength Feedback:
- "At least 8 characters"
- "One lowercase letter"
- "One uppercase letter"
- "One number"
- "One special character"
- "Very Weak" / "Weak" / "Fair" / "Good" / "Strong"

Match Indicator:
- "Passwords match"
- "Passwords do not match"
```

#### Login Form (`/src/components/LoginForm.tsx`)

```
Email:
- "Email is required"
- "Please enter a valid email address"

Password:
- "Password is required"
- "Password must be at least 6 characters"

Auth Errors:
- "Invalid email or password. Please check your credentials and try again."
- "Access denied. Admin privileges are required."
- "Authentication failed"
- "Login failed: No user returned"
```

#### Property Form (`/src/components/PropertyForm.tsx`)

```
Property Nickname:
- "Property nickname is required"
- "Property nickname must be 100 characters or less"

Property Type:
- "Property type is required"

Address:
- "Address must be 500 characters or less"

Generic:
- "Failed to save property. Please try again."
```

---

## 4. Standardization Requirements

### 4.1 Message Wording Standards

All validation messages must follow these standards:

| Standard | Example Good | Example Bad |
|----------|--------------|-------------|
| Be specific | "Email address is required" | "Field is required" |
| Provide guidance | "Enter at least 8 characters" | "Too short" |
| Use consistent terminology | "must be" or "is required" | Mix of "should be", "needs to be" |
| Avoid technical jargon | "Enter a valid email address" | "Invalid regex match" |
| Include limits when applicable | "Maximum 100 characters (you entered 150)" | "Too long" |
| Use positive framing where possible | "Enter at least 8 characters" | "Password too short" |

### 4.2 Recommended Standardized Keys

The following standardized keys should be created in the `errors` namespace:

```json
{
  "errors": {
    "validation": {
      "required": "This field is required",
      "requiredField": "{field} is required",
      "email": "Please enter a valid email address",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Must be {max} characters or less",
      "currentLength": " (current: {current})",
      "passwordMismatch": "Passwords do not match",
      "passwordMatch": "Passwords match",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "urlProtocol": "Only http and https URLs are allowed",
      "maxItems": "Maximum {max} {itemType} allowed",
      "fileSize": "File exceeds {limit} limit",
      "totalSize": "Total upload size exceeds {limit} limit",
      "unsupportedFileType": "File type '{type}' is not supported"
    },
    "password": {
      "required": "Password is required",
      "minLength": "Password must be at least {min} characters",
      "lowercase": "Password must contain at least one lowercase letter",
      "uppercase": "Password must contain at least one uppercase letter",
      "number": "Password must contain at least one number",
      "special": "Password must contain at least one special character",
      "strength": {
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong"
      }
    },
    "accessCode": {
      "required": "Access code is required",
      "length": "Access code must be {length} characters long",
      "format": "Access code must contain only uppercase letters and numbers",
      "notFound": "Access code not found or already used",
      "emailMismatch": "Email does not match the access request",
      "alreadyUsed": "This access code has already been used",
      "notApproved": "Access code is not approved for registration"
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "accessDenied": "Access denied. Admin privileges are required.",
      "sessionExpired": "Your session has expired. Please sign in again."
    },
    "property": {
      "nameRequired": "Property name is required",
      "nameMaxLength": "Property name must be {max} characters or less",
      "typeRequired": "Property type is required",
      "saveFailed": "Failed to save property. Please try again."
    },
    "content": {
      "required": "At least one content item is required",
      "titleRequired": "Title is required",
      "urlRequired": "URL is required"
    }
  }
}
```

---

## 5. Implementation Tasks

### 5.1 Task Breakdown

| Task | Description | Files Affected | Effort |
|------|-------------|----------------|--------|
| **5.1.1** | Catalogue all validation messages with exact locations | All form files | 2h |
| **5.1.2** | Define standardized message wording | `/messages/en.json` | 2h |
| **5.1.3** | Create translation keys in `errors.validation` namespace | `/messages/en.json` | 2h |
| **5.1.4** | Update `validation.ts` to use translation keys | `validation.ts` | 3h |
| **5.1.5** | Update `access-validation.ts` to use translation keys | `access-validation.ts` | 2h |
| **5.1.6** | Update `RegistrationForm.tsx` validation | `RegistrationForm.tsx` | 3h |
| **5.1.7** | Update `LoginForm.tsx` validation | `LoginForm.tsx` | 2h |
| **5.1.8** | Update `PropertyForm.tsx` validation | `PropertyForm.tsx` | 1h |
| **5.1.9** | Update `ItemForm.tsx` validation | `ItemForm.tsx` | 2h |
| **5.1.10** | Update remaining form components | Various | 2h |
| **5.1.11** | Verify consistent error display patterns | All components | 2h |
| **5.1.12** | Test all validation scenarios | E2E testing | 3h |

**Total Estimated Effort:** 24 hours (~3 days)

### 5.2 Implementation Order

1. **Phase 1: Catalogue & Plan** (Tasks 5.1.1-5.1.3)
   - Complete message inventory
   - Define standardized wording
   - Create translation key structure

2. **Phase 2: Utility Updates** (Tasks 5.1.4-5.1.5)
   - Update centralized validation utilities
   - These feed multiple components

3. **Phase 3: Component Updates** (Tasks 5.1.6-5.1.10)
   - Update forms from highest to lowest usage
   - RegistrationForm → LoginForm → Others

4. **Phase 4: Verification** (Tasks 5.1.11-5.1.12)
   - Consistency check
   - Full testing

---

## 6. Authorized Files and Functions for Modification

### 6.1 Validation Utility Files

| File Path | Functions to Modify |
|-----------|---------------------|
| `/src/components/ItemCapture/utils/validation.ts` | `validateTitle`, `validateContentRequirement`, `validateFileSize`, `validateTotalSize`, `validateTextLength`, `validateUrl`, `validateUrlCount`, `validateImageCount`, `validateMimeType` |
| `/src/lib/access-validation.ts` | `validateAccessCodeForRegistration`, `consumeAccessCode`, `validateAccessCodeFormat`, `validateEmailFormat` |

### 6.2 Form Component Files

| File Path | Elements to Update |
|-----------|-------------------|
| `/src/components/RegistrationForm.tsx` | All inline validation messages, password strength labels, form error displays |
| `/src/components/LoginForm.tsx` | Email/password validation, auth error messages |
| `/src/components/PropertyForm.tsx` | Property field validation messages |
| `/src/components/ItemForm.tsx` | Item and link validation messages |
| `/src/components/AccessCodeInput.tsx` | Access code format validation messages |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | URL validation messages |
| `/src/components/MailingListSignup.tsx` | Email validation messages |

### 6.3 Translation Files

| File Path | Sections to Create/Update |
|-----------|---------------------------|
| `/messages/en.json` | `errors.validation.*`, `errors.password.*`, `errors.accessCode.*`, `errors.auth.*`, `errors.property.*`, `errors.content.*` |

### 6.4 Potential Hook Creation

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/useValidationErrors.ts` | (Optional) Convenience hook for validation error translations |

---

## 7. Technical Considerations

### 7.1 Translation Function Integration

#### Client Components Pattern

```typescript
// Current (hardcoded)
if (!email) {
  setErrors({ email: 'Email is required' });
}

// Updated (with translation)
import { useTranslations } from 'next-intl';

function MyForm() {
  const t = useTranslations('errors');

  if (!email) {
    setErrors({ email: t('validation.requiredField', { field: 'Email' }) });
  }
}
```

#### Utility Functions Pattern

For pure validation functions that can't use hooks, pass the translation function:

```typescript
// validation.ts
export function validateTitle(
  title: string,
  t: (key: string, params?: Record<string, unknown>) => string
): ValidationResult {
  if (!title.trim()) {
    return { isValid: false, error: t('validation.titleRequired') };
  }
  // ...
}

// Usage in component
const t = useTranslations('errors');
const result = validateTitle(title, t);
```

Alternative approach using translation keys that are resolved at display time:

```typescript
// validation.ts - return keys instead of messages
export function validateTitle(title: string): ValidationResult {
  if (!title.trim()) {
    return { isValid: false, errorKey: 'validation.titleRequired' };
  }
  return { isValid: true };
}

// Component resolves key to message
const t = useTranslations('errors');
const result = validateTitle(title);
if (!result.isValid) {
  setError(t(result.errorKey));
}
```

### 7.2 Dynamic Parameters

Many validation messages include dynamic values. Use ICU message format:

```json
{
  "errors": {
    "validation": {
      "maxLength": "Must be {max} characters or less (current: {current})",
      "maxItems": "Maximum {max} {itemType, select, photo {photos} link {links} file {files} other {items}} allowed"
    }
  }
}
```

### 7.3 Error Display Consistency

Ensure all forms follow the same error display pattern:

```tsx
{errors.email && (
  <p className="mt-1 text-sm text-red-600" role="alert">
    {errors.email}
  </p>
)}
```

Add consistent ARIA attributes for accessibility:
- `role="alert"` for error messages
- `aria-invalid="true"` on invalid fields
- `aria-describedby` linking field to error message

---

## 8. Testing Strategy

### 8.1 Test Cases

| Test Category | Description |
|---------------|-------------|
| Required field validation | Test all required fields show correct message |
| Format validation | Test email, URL, UUID format validation |
| Length validation | Test min/max length constraints |
| Password validation | Test all password requirements |
| Access code validation | Test format and status checks |
| File validation | Test size and type constraints |
| Error display | Verify consistent styling and positioning |
| Accessibility | Verify ARIA attributes and screen reader compatibility |

### 8.2 Verification Checklist

- [ ] All validation messages extracted to translation keys
- [ ] No hardcoded validation strings remain in components
- [ ] Messages use consistent wording and tone
- [ ] Dynamic parameters work correctly
- [ ] Error displays follow consistent pattern
- [ ] Accessibility attributes properly implemented
- [ ] All validation scenarios tested in UI

---

## 9. Acceptance Criteria

From REQ-316:

- [x] All form components across the application have been identified and their validation messages catalogued
- [ ] Validation messages for similar scenarios use consistent wording across different forms
- [ ] All validation messages are written in clear, plain language without technical jargon
- [ ] Required field errors specify what is required rather than just stating field is required
- [ ] Format validation errors provide examples of valid formats when applicable
- [ ] Length constraint errors specify exact character or word limits
- [ ] Value constraint errors clearly communicate acceptable ranges or options
- [ ] All validation messages reference the errors namespace in translation files
- [ ] Validation error display locations are consistent across all forms
- [ ] Messages are actionable, explaining how to correct the error rather than just describing the problem
- [ ] Validation messages are concise while providing necessary detail for correction
- [ ] Error message tone is helpful and professional rather than punitive or condescending
- [ ] Accessibility attributes for validation errors are properly implemented across all forms
- [ ] Inline validation provides immediate feedback where appropriate to prevent submission errors

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing validation behavior | Medium | High | Comprehensive testing, gradual rollout |
| Inconsistent translation key usage | Medium | Medium | Code review, linting rules |
| Missing edge case messages | Low | Medium | Thorough cataloguing, QA testing |
| Performance impact from translation lookups | Low | Low | next-intl is optimized, minimal overhead |
| Regression in form UX | Medium | Medium | Side-by-side comparison testing |

---

## 11. References

- [REQ-316 in gen_requests_epic2.md](/docs/gen_requests_epic2.md#req-316-audit-form-validation-messages-across-components)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [WCAG 2.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)

---

## 12. Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-18 | Technical Lead (AI) | Initial document creation |
