# REQ-315: Create `errors` Namespace Structure - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-315
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.1
**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** Second (after Common namespace - cross-cutting concern)

---

## 1. Summary

Create a dedicated `errors` namespace within the `/messages/en.json` translation file to centralize and organize all error messages, validation feedback, and failure notifications. This establishes the foundation for consistent, translatable error communication across the FAQBNB application.

---

## 2. Background & Context

### Current State

The FAQBNB codebase currently has error handling infrastructure but lacks i18n support:

| Component | Status | Location |
|-----------|--------|----------|
| Error utilities | Implemented | `/src/lib/error-utils.ts` |
| Error types/codes | Defined | `/src/types/index.ts` |
| Form validation | Hardcoded English | Components (LoginForm, RegistrationForm) |
| API error responses | Hardcoded English | `/src/app/api/auth/` routes |
| Validation component | Implemented | `/src/components/ItemCapture/components/shared/ValidationMessage.tsx` |
| i18n framework | **NOT YET INSTALLED** | Planned in Epic 1 |

### Existing Error Infrastructure

**Error Codes Defined** (`/src/types/index.ts`):
- `VALIDATION_FAILED`
- `USER_ALREADY_REGISTERED`
- `INVALID_ACCESS_CODE`
- `EMAIL_MISMATCH`
- `NETWORK_ERROR`
- `OAUTH_SESSION_EXPIRED`
- `OAUTH_REGISTRATION_CONFLICT`
- `OAUTH_AUTHENTICATION_FAILED`

**HTTP Error Mapping** (from `error-utils.ts`):
```typescript
HTTP_ERROR_MAPPING = {
  400: "Please check that all required fields are filled correctly",
  401: "Session expired - please sign in with Google again",
  404: "Invalid access code or email - please check your invitation",
  409: "User already registered - please try logging in instead",
  500: "Something went wrong on our end - please try again later"
}
```

### Why This Task Matters

1. **Foundation for Epic 2**: The errors namespace is the second priority after the common namespace, as errors are cross-cutting concerns affecting all features
2. **Consistency**: Centralizing error messages ensures users receive consistent feedback regardless of which feature triggers an error
3. **Actionability**: Structured error messages can include resolution guidance, improving user experience
4. **Translation Efficiency**: Organized namespaces reduce duplication and translation costs

---

## 3. Requirements

### From PRD (REQ-315)

- [ ] An errors namespace section exists in `/messages/en.json` with clear, logical structure
- [ ] Categories for: validation, API, authentication, permission, and system errors
- [ ] Each category contains specific error messages organized by scenario
- [ ] Validation errors include: required field, invalid format, length constraints, value constraints
- [ ] API errors include: network, timeout, server, not found scenarios
- [ ] Authentication errors include: login failures, session expiration, invalid credentials
- [ ] Permission errors include: access denied for different resources/actions
- [ ] System errors include: unexpected errors and fallback text
- [ ] Error messages are clear, specific, and actionable (not technical/cryptic)
- [ ] Support for dynamic parameter substitution (fields, values, limits)
- [ ] Structure is extensible for new error categories
- [ ] Valid JSON after addition
- [ ] Documentation/comments clarify purpose and organization

---

## 4. Technical Approach

### 4.1 Dependencies

**From Epic 1 (Prerequisites):**
- `next-intl` package installed
- `/messages/` directory structure created
- Base `en.json` file exists with metadata section

### 4.2 Namespace Structure

```json
{
  "errors": {
    "validation": { },     // Form field validation
    "api": { },            // API/server errors
    "network": { },        // Connectivity issues
    "auth": { },           // Authentication errors
    "permission": { },     // Authorization errors
    "item": { },           // Item-specific errors
    "property": { },       // Property-specific errors
    "file": { },           // File upload errors
    "system": { }          // Generic/fallback errors
  }
}
```

### 4.3 Key Naming Convention

Follow the established pattern from Plan-111:
```
errors.{category}.{scenario}.{variant?}
```

Examples:
- `errors.validation.required`
- `errors.validation.email.invalid`
- `errors.api.serverError`
- `errors.auth.invalidCredentials`

### 4.4 Dynamic Parameter Support

Use ICU message format for interpolation:
```json
{
  "errors.validation.minLength": "Must be at least {min} characters",
  "errors.validation.maxLength": "Must be less than {max} characters",
  "errors.file.tooLarge": "File size exceeds {max}MB limit"
}
```

---

## 5. Implementation Tasks

### Task 2J.1.1: Create Base Errors Namespace Structure

**Description:** Add the `errors` namespace skeleton to `/messages/en.json`

**Actions:**
1. Read existing `/messages/en.json` (created in Epic 1)
2. Add `errors` object with all category subsections
3. Include placeholder comments documenting each category's purpose
4. Validate JSON structure

### Task 2J.1.2: Populate Validation Error Messages

**Description:** Add all form validation error messages

**Categories:**
- Required fields
- Email validation
- Password validation (strength, match, constraints)
- Length constraints (min/max)
- Format validation (URL, phone, etc.)
- Value constraints (range, pattern)

**Source of Truth:** Audit existing validation logic in:
- `/src/components/LoginForm.tsx`
- `/src/components/RegistrationForm.tsx`
- `/src/components/ItemCreationWorkflow/` components
- `/src/components/PropertyForm.tsx`

### Task 2J.1.3: Populate API Error Messages

**Description:** Add API/server error messages

**Source of Truth:**
- `/src/lib/error-utils.ts` - HTTP_ERROR_MAPPING
- `/src/types/index.ts` - ErrorCode enum
- API route handlers in `/src/app/api/`

**Categories:**
- Generic server errors (500)
- Not found (404)
- Conflict (409)
- Rate limiting (429)
- Timeout errors
- Request failures

### Task 2J.1.4: Populate Network Error Messages

**Description:** Add connectivity-related error messages

**Categories:**
- Offline detection
- Connection failed
- Slow connection warnings
- Request timeout

### Task 2J.1.5: Populate Authentication Error Messages

**Description:** Add auth-specific error messages

**Source of Truth:**
- `/src/lib/error-utils.ts` - ErrorCode mapping
- OAuth flow error handling
- Session management logic

**Categories:**
- Invalid credentials
- Session expired
- Account locked
- Email not verified
- OAuth failures

### Task 2J.1.6: Populate Permission Error Messages

**Description:** Add authorization error messages

**Categories:**
- Access denied (general)
- Resource-specific access denied
- Action-specific permission errors
- Role/privilege errors

### Task 2J.1.7: Populate Domain-Specific Error Messages

**Description:** Add item, property, and file-related errors

**Categories:**
- Item CRUD failures
- Property CRUD failures
- File upload errors (size, type, upload failure)
- Duplicate name conflicts

### Task 2J.1.8: Populate System Error Messages

**Description:** Add fallback and unexpected error messages

**Categories:**
- Generic unexpected error
- Fallback error text
- "Please try again" variants
- Contact support messages

### Task 2J.1.9: Validate and Document

**Description:** Final validation and documentation

**Actions:**
1. Validate JSON syntax
2. Verify all existing hardcoded errors are covered
3. Add inline comments for categories
4. Update any related documentation

---

## 6. Authorized Files and Functions for Modification

### Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/messages/en.json` | Modify | Add errors namespace structure |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/error-utils.ts` | Source of HTTP error mappings, error classification |
| `/src/types/index.ts` | Source of ErrorCode enum, UserFriendlyError interface |
| `/src/components/LoginForm.tsx` | Existing validation messages |
| `/src/components/RegistrationForm.tsx` | Existing validation messages |
| `/src/app/api/auth/register/route.ts` | API error responses |
| `/src/app/api/auth/validate-code/route.ts` | API error responses |
| `/src/components/ItemCapture/components/shared/ValidationMessage.tsx` | Validation UI patterns |
| `/src/app/error.tsx` | Error boundary messages |
| `/src/app/global-error.tsx` | Global error messages |

### Functions/Patterns to Reference

| Function/Pattern | Location | Purpose |
|------------------|----------|---------|
| `translateErrorMessage()` | `/src/lib/error-utils.ts` | Error translation logic |
| `classifyError()` | `/src/lib/error-utils.ts` | Error classification |
| `HTTP_ERROR_MAPPING` | `/src/types/index.ts` | HTTP status to message mapping |
| `ErrorCode` enum | `/src/types/index.ts` | Error code definitions |
| `UserFriendlyError` interface | `/src/types/index.ts` | Error structure |

---

## 7. Complete Errors Namespace Structure

```json
{
  "errors": {
    "_description": "Centralized error messages for internationalization. All user-facing error text should reference keys from this namespace.",

    "validation": {
      "required": "This field is required",
      "email": {
        "required": "Email address is required",
        "invalid": "Please enter a valid email address",
        "format": "Email format is invalid"
      },
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match",
        "noUppercase": "Password must include at least one uppercase letter",
        "noLowercase": "Password must include at least one lowercase letter",
        "noNumber": "Password must include at least one number",
        "noSpecial": "Password must include at least one special character"
      },
      "name": {
        "required": "Name is required",
        "tooShort": "Name must be at least {min} characters"
      },
      "maxLength": "Must be less than {max} characters",
      "minLength": "Must be at least {min} characters",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number",
      "outOfRange": "Value must be between {min} and {max}",
      "patternMismatch": "Value does not match the required pattern",
      "termsRequired": "You must agree to the terms and conditions"
    },

    "api": {
      "generic": "Something went wrong. Please try again.",
      "badRequest": "Please check that all required fields are filled correctly",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Something went wrong on our end. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "rateLimited": "Too many attempts. Please try again in {seconds} seconds.",
      "serviceUnavailable": "Service is temporarily unavailable. Please try again later."
    },

    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment.",
      "requestFailed": "Request failed. Please check your connection and try again."
    },

    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Please contact support.",
      "accountDisabled": "This account has been disabled",
      "accessDenied": "Access denied to this resource",
      "userAlreadyRegistered": "An account with this email already exists. Please try logging in instead.",
      "invalidAccessCode": "Invalid access code or email. Please check your invitation.",
      "accessCodeExpired": "This access code has expired",
      "emailMismatch": "Email does not match the access code invitation",
      "oauthFailed": "Authentication with Google failed. Please try again.",
      "oauthSessionExpired": "Session expired. Please sign in with Google again.",
      "oauthConflict": "This Google account is already linked to another user"
    },

    "permission": {
      "accessDenied": "You do not have permission to access this resource",
      "actionNotAllowed": "You do not have permission to perform this action",
      "readOnly": "You have read-only access to this resource",
      "adminRequired": "Administrator privileges required",
      "ownerRequired": "Only the owner can perform this action"
    },

    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item. Please try again.",
      "updateFailed": "Failed to update item. Please try again.",
      "deleteFailed": "Failed to delete item. Please try again.",
      "duplicateName": "An item with this name already exists",
      "loadFailed": "Failed to load items. Please refresh the page."
    },

    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property. Please try again.",
      "updateFailed": "Failed to update property. Please try again.",
      "deleteFailed": "Failed to delete property. Please try again.",
      "duplicateName": "A property with this name already exists",
      "loadFailed": "Failed to load properties. Please refresh the page."
    },

    "file": {
      "tooLarge": "File size exceeds the {max}MB limit",
      "invalidType": "Invalid file type. Allowed types: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "downloadFailed": "File download failed. Please try again.",
      "processingFailed": "Failed to process file. Please try a different file."
    },

    "system": {
      "unexpected": "An unexpected error occurred. Please try again.",
      "fallback": "Something went wrong. Please try again later.",
      "tryAgain": "Please try again",
      "refreshPage": "Please refresh the page and try again",
      "contactSupport": "If this problem persists, please contact support",
      "maintenanceMode": "The system is under maintenance. Please try again later."
    }
  }
}
```

---

## 8. Integration Pattern

### Usage in Components (After Epic 1 Setup)

```typescript
// Client Component
import { useTranslations } from 'next-intl';

function FormComponent() {
  const t = useTranslations('errors');

  // Validation error
  const emailError = t('validation.email.invalid');

  // With parameters
  const minLengthError = t('validation.minLength', { min: 8 });

  // API error
  const serverError = t('api.serverError');
}
```

### Usage with Error Utilities (Future Task 2J.4)

```typescript
// After creating centralized error utility
import { useErrorTranslations } from '@/lib/i18n/error-translations';

function FormComponent() {
  const { getValidationError, getApiError } = useErrorTranslations();

  const error = getValidationError('email.invalid');
  const apiError = getApiError('serverError');
}
```

---

## 9. Acceptance Criteria Checklist

- [ ] `errors` namespace exists in `/messages/en.json`
- [ ] Validation category with all common validation scenarios
- [ ] API category with HTTP error mappings
- [ ] Network category with connectivity errors
- [ ] Auth category with authentication errors
- [ ] Permission category with authorization errors
- [ ] Item/Property/File categories with domain-specific errors
- [ ] System category with fallback errors
- [ ] All messages are clear, specific, and actionable
- [ ] Dynamic parameters use ICU format `{paramName}`
- [ ] Structure is extensible for new error types
- [ ] JSON is valid and properly formatted
- [ ] Documentation comments explain category purposes

---

## 10. Dependencies

### Upstream Dependencies (Must Complete First)

| Dependency | Source | Status |
|------------|--------|--------|
| next-intl installed | Epic 1 | Pending |
| `/messages/` directory created | Epic 1 | Pending |
| Base `en.json` with metadata | Epic 1 | Pending |

### Downstream Dependencies (Blocked by This Task)

| Task | Description |
|------|-------------|
| 2J.2 | Audit all form validation messages across components |
| 2J.3 | Audit all API error handling and messages |
| 2J.4 | Create centralized error message utility |
| 2J.5 | Update Zod schemas to use translated messages |
| 2J.6 | Update error boundaries with translations |
| 2J.7 | Generate translations for 5 non-English languages |

---

## 11. Testing Considerations

### Validation Tests

1. JSON syntax validation
2. Key uniqueness verification
3. Parameter placeholder format validation
4. Coverage check against existing hardcoded errors

### Manual Verification

1. Review all error messages for clarity
2. Verify actionable guidance where appropriate
3. Confirm tone consistency across categories
4. Check message length for UI display considerations

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing error scenarios | Medium | Low | Audit existing codebase thoroughly; structure is extensible |
| Inconsistent message tone | Low | Low | Establish tone guidelines; review all messages together |
| Epic 1 not complete | Medium | High | This task can be prepared but not deployed until Epic 1 is done |
| Over-engineering structure | Low | Low | Start with essential categories; add as needed |

---

## 13. References

- [REQ-315 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [Plan-111: L10N Epic 2 Implementation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Existing error utilities](/src/lib/error-utils.ts)
- [Error types](/src/types/index.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
