# Technical Implementation Overview: Create `errors` Namespace Structure

**Document ID:** REQ-348-overview
**Request Reference:** REQ-315 (Task 2J.1 from Epic 2 Implementation Plan)
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.1
**Size:** M (Medium)
**Priority:** Second - Cross-cutting concern (per implementation plan ordering)

---

## 1. Summary

Expand the existing minimal `errors` namespace in `/messages/en.json` to create a comprehensive, well-structured error message organization system. The enhanced namespace will centralize all error messages, validation feedback, API error responses, and failure notifications across the application. This provides the foundation for consistent, translatable, and actionable error communication throughout the FAQBNB application.

---

## 2. Current State Analysis

### 2.1 Existing Errors Namespace

The current `/messages/en.json` file contains a basic `errors` namespace with approximately 17 flat-level error messages:

```json
"errors": {
  "required": "This field is required",
  "invalidEmail": "Invalid email address",
  "networkError": "Network error. Please try again.",
  "unauthorized": "You are not authorized to perform this action",
  "notFound": "The requested resource was not found",
  "serverError": "Server error. Please try again later.",
  "validationFailed": "Validation failed. Please check your input.",
  "sessionExpired": "Your session has expired. Please sign in again.",
  "tooManyRequests": "Too many requests. Please wait a moment.",
  "invalidCredentials": "Invalid email or password",
  "emailTaken": "This email is already registered",
  "passwordTooWeak": "Password must be at least 8 characters",
  "uploadFailed": "Upload failed. Please try again.",
  "fileTooLarge": "File is too large",
  "invalidFileType": "Invalid file type",
  "genericError": "Something went wrong. Please try again."
}
```

### 2.2 Current Error Handling Patterns

Based on codebase analysis:

1. **Hardcoded error strings** - Components like `LoginForm.tsx` contain inline error messages:
   - `'Email is required'`
   - `'Please enter a valid email address'`
   - `'Password is required'`
   - `'Invalid email or password. Please check your credentials and try again.'`

2. **Error boundaries** - `src/app/error.tsx` and `src/app/global-error.tsx` display hardcoded:
   - `'Something went wrong!'`
   - `'We apologize for the inconvenience. Our team has been notified of this error.'`
   - `'Try again'`

3. **No translation hook usage** - Current error handling does not use `useTranslations('errors')` pattern.

### 2.3 Gaps Identified

| Gap | Current State | Required State |
|-----|--------------|----------------|
| Structure | Flat namespace | Nested categories |
| Coverage | ~17 messages | ~300 messages |
| Categories | None | 6+ categories |
| Parameter support | Limited | Full ICU format |
| Type safety | None | TypeScript types |
| Organization | Ad-hoc | Logical groupings |

---

## 3. Target State Design

### 3.1 Namespace Structure

The enhanced `errors` namespace will follow the structure defined in Plan-111:

```json
{
  "errors": {
    "form": {
      "required": "...",
      "email": "...",
      "password": { ... },
      "maxLength": "...",
      "minLength": "...",
      "invalidFormat": "...",
      "invalidUrl": "...",
      "invalidPhone": "..."
    },
    "api": {
      "generic": "...",
      "notFound": "...",
      "unauthorized": "...",
      "forbidden": "...",
      "conflict": "...",
      "serverError": "...",
      "timeout": "..."
    },
    "network": {
      "offline": "...",
      "connectionFailed": "...",
      "slowConnection": "..."
    },
    "auth": {
      "invalidCredentials": "...",
      "emailNotVerified": "...",
      "sessionExpired": "...",
      "accountLocked": "...",
      "accessDenied": "..."
    },
    "item": {
      "notFound": "...",
      "createFailed": "...",
      "updateFailed": "...",
      "deleteFailed": "...",
      "duplicateName": "..."
    },
    "property": {
      "notFound": "...",
      "createFailed": "...",
      "updateFailed": "...",
      "deleteFailed": "..."
    },
    "file": {
      "tooLarge": "...",
      "invalidType": "...",
      "uploadFailed": "..."
    },
    "system": {
      "unexpected": "...",
      "maintenance": "...",
      "featureDisabled": "..."
    }
  }
}
```

### 3.2 Error Categories

| Category | Description | Estimated Keys |
|----------|-------------|----------------|
| `form` | Field validation errors | ~100 |
| `api` | HTTP/API response errors | ~30 |
| `network` | Connectivity issues | ~15 |
| `auth` | Authentication/session errors | ~40 |
| `item` | Item CRUD operation errors | ~25 |
| `property` | Property operation errors | ~20 |
| `file` | Upload/media errors | ~25 |
| `system` | Application-level errors | ~20 |
| `workflow` | Item creation workflow errors | ~25 |
| **Total** | | **~300** |

### 3.3 Design Principles

1. **Nested organization** - Group related errors under descriptive parent keys
2. **Actionable messaging** - Error text should guide users toward resolution
3. **Parameter interpolation** - Use ICU format for dynamic values: `{fieldName}`, `{min}`, `{max}`
4. **Consistent tone** - Helpful, professional, non-technical language
5. **Extensible structure** - Allow easy addition of new error types
6. **Backward compatibility** - Maintain existing keys as aliases where possible

---

## 4. Implementation Tasks

### Task 4.1: Restructure Errors Namespace

Create the comprehensive nested structure in `/messages/en.json`:

1. Replace flat `errors` object with nested category structure
2. Add all form validation error messages
3. Add all API error messages
4. Add network connectivity error messages
5. Add authentication error messages
6. Add entity-specific error messages (item, property, file)
7. Add system-level error messages

### Task 4.2: Add Parameter Support

Ensure all applicable error messages support ICU format interpolation:

```json
{
  "errors.form.maxLength": "Maximum {max} characters allowed",
  "errors.form.minLength": "Minimum {min} characters required",
  "errors.form.password.tooShort": "Password must be at least {min} characters",
  "errors.file.tooLarge": "File size exceeds {max}MB limit",
  "errors.file.invalidType": "Invalid file type. Allowed: {types}"
}
```

### Task 4.3: Create Migration Notes

Document how existing flat keys map to new nested structure for gradual component migration:

| Old Key | New Key |
|---------|---------|
| `errors.required` | `errors.form.required` |
| `errors.invalidEmail` | `errors.form.email` |
| `errors.networkError` | `errors.network.connectionFailed` |
| `errors.unauthorized` | `errors.api.unauthorized` |
| `errors.notFound` | `errors.api.notFound` |
| `errors.serverError` | `errors.api.serverError` |
| `errors.sessionExpired` | `errors.auth.sessionExpired` |
| `errors.invalidCredentials` | `errors.auth.invalidCredentials` |
| `errors.uploadFailed` | `errors.file.uploadFailed` |
| `errors.fileTooLarge` | `errors.file.tooLarge` |
| `errors.invalidFileType` | `errors.file.invalidType` |
| `errors.genericError` | `errors.system.unexpected` |

### Task 4.4: Validate JSON Structure

After implementation:
1. Validate JSON syntax is correct
2. Ensure no duplicate keys exist
3. Verify all parameter placeholders use consistent naming

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | MODIFY | Restructure and expand `errors` namespace |

### 5.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Error namespace specification |
| `/src/components/LoginForm.tsx` | Current error message patterns |
| `/src/components/RegistrationForm.tsx` | Current validation patterns |
| `/src/app/error.tsx` | Error boundary messages |
| `/src/app/global-error.tsx` | Global error messages |
| `/src/lib/i18n/config.ts` | i18n configuration reference |

### 5.3 Scope Boundaries

**In Scope:**
- Creating/expanding the `errors` namespace structure in `/messages/en.json`
- Adding comprehensive error message categories
- Ensuring ICU format parameter support
- Documenting the namespace structure

**Out of Scope:**
- Modifying components to use the new error keys (covered by Task 2J.2-2J.6)
- Translating to non-English languages (covered by Task 2J.7)
- Creating error translation utility functions (covered by Task 2J.4)
- Updating Zod schemas (covered by Task 2J.5)

---

## 6. Error Namespace Specification

### 6.1 Complete Namespace Structure

```json
{
  "errors": {
    "_description": "Centralized error messages for the FAQBNB application",

    "form": {
      "_description": "Form validation error messages",
      "required": "This field is required",
      "requiredField": "{fieldName} is required",
      "email": "Please enter a valid email address",
      "emailFormat": "Email format should be example@domain.com",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooLong": "Password must be less than {max} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "noSpecial": "Password must include at least one special character",
        "mismatch": "Passwords do not match",
        "sameAsOld": "New password must be different from current password"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "exactLength": "Must be exactly {length} characters",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidUrlProtocol": "URL must start with http:// or https://",
      "invalidPhone": "Please enter a valid phone number",
      "invalidDate": "Please enter a valid date",
      "dateFuture": "Date must be in the future",
      "datePast": "Date must be in the past",
      "numberMin": "Value must be at least {min}",
      "numberMax": "Value must be at most {max}",
      "numberRange": "Value must be between {min} and {max}",
      "numberInteger": "Please enter a whole number",
      "numberPositive": "Please enter a positive number",
      "selectionRequired": "Please select an option",
      "checkboxRequired": "You must accept the terms to continue",
      "pattern": "Value does not match required pattern",
      "unique": "This value is already in use",
      "noWhitespace": "Value cannot contain spaces",
      "noSpecialChars": "Only letters and numbers are allowed",
      "invalidJson": "Invalid JSON format"
    },

    "api": {
      "_description": "API and HTTP error messages",
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "badRequest": "Invalid request. Please check your input.",
      "serverError": "Server error. Please try again later.",
      "serviceUnavailable": "Service temporarily unavailable. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "rateLimited": "Too many requests. Please wait a moment.",
      "payloadTooLarge": "Request data is too large",
      "unprocessable": "Unable to process request",
      "methodNotAllowed": "This action is not allowed"
    },

    "network": {
      "_description": "Network connectivity error messages",
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment.",
      "connectionLost": "Connection lost. Attempting to reconnect...",
      "reconnecting": "Reconnecting...",
      "reconnected": "Connection restored",
      "syncFailed": "Failed to sync data. Will retry when connection improves."
    },

    "auth": {
      "_description": "Authentication and authorization error messages",
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "verificationExpired": "Verification link has expired. Please request a new one.",
      "verificationInvalid": "Invalid verification link",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "sessionInvalid": "Invalid session. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accountDisabled": "This account has been disabled",
      "accountNotFound": "No account found with this email",
      "accessDenied": "Access denied to this resource",
      "accessCodeInvalid": "Invalid access code",
      "accessCodeExpired": "Access code has expired",
      "accessCodeUsed": "Access code has already been used",
      "emailTaken": "This email is already registered",
      "registrationFailed": "Registration failed. Please try again.",
      "oauthFailed": "Authentication with {provider} failed",
      "oauthCancelled": "Authentication was cancelled",
      "passwordResetFailed": "Failed to reset password. Please try again.",
      "passwordResetExpired": "Password reset link has expired",
      "twoFactorRequired": "Two-factor authentication is required",
      "twoFactorInvalid": "Invalid verification code"
    },

    "item": {
      "_description": "Item-related error messages",
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists",
      "invalidRoom": "Invalid room selection",
      "invalidProperty": "Invalid property selection",
      "contentRequired": "At least one content piece is required",
      "nameRequired": "Item name is required",
      "maxItemsReached": "Maximum number of items reached",
      "qrGenerationFailed": "Failed to generate QR code",
      "archiveFailed": "Failed to archive item",
      "restoreFailed": "Failed to restore item"
    },

    "property": {
      "_description": "Property-related error messages",
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "duplicateName": "A property with this name already exists",
      "hasItems": "Cannot delete property with existing items",
      "maxPropertiesReached": "Maximum number of properties reached",
      "invalidAddress": "Invalid property address"
    },

    "room": {
      "_description": "Room-related error messages",
      "notFound": "Room not found",
      "createFailed": "Failed to create room",
      "updateFailed": "Failed to update room",
      "deleteFailed": "Failed to delete room",
      "duplicateName": "A room with this name already exists in this property",
      "hasItems": "Cannot delete room with existing items"
    },

    "file": {
      "_description": "File upload and media error messages",
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "uploadCancelled": "Upload was cancelled",
      "processingFailed": "Failed to process file",
      "dimensionsTooSmall": "Image dimensions are too small. Minimum: {width}x{height}",
      "dimensionsTooLarge": "Image dimensions are too large. Maximum: {width}x{height}",
      "durationTooLong": "Video duration exceeds {max} seconds",
      "corruptedFile": "File appears to be corrupted",
      "storageQuotaExceeded": "Storage quota exceeded",
      "downloadFailed": "Failed to download file"
    },

    "workflow": {
      "_description": "Item creation workflow error messages",
      "stepFailed": "Failed to complete step",
      "navigationBlocked": "Cannot navigate away with unsaved changes",
      "sessionLost": "Workflow session was lost. Please start over.",
      "saveFailed": "Failed to save workflow progress",
      "invalidStep": "Invalid workflow step",
      "contentCaptureFailed": "Failed to capture content",
      "cameraAccessDenied": "Camera access is required for this feature",
      "microphoneAccessDenied": "Microphone access is required for this feature"
    },

    "system": {
      "_description": "System-level error messages",
      "unexpected": "An unexpected error occurred. Please try again.",
      "maintenance": "System is under maintenance. Please check back later.",
      "featureDisabled": "This feature is currently disabled",
      "browserUnsupported": "Your browser is not supported. Please use a modern browser.",
      "javascriptRequired": "JavaScript is required to use this application",
      "cookiesRequired": "Cookies must be enabled to use this application",
      "loadingFailed": "Failed to load application. Please refresh the page.",
      "updateRequired": "Application update required. Please refresh the page.",
      "dataCorrupted": "Data appears to be corrupted. Please contact support."
    },

    "boundary": {
      "_description": "Error boundary UI messages",
      "title": "Something went wrong!",
      "description": "We apologize for the inconvenience. Our team has been notified of this error.",
      "tryAgain": "Try again",
      "goHome": "Go to home page",
      "contactSupport": "Contact support",
      "errorId": "Error ID: {errorId}"
    }
  }
}
```

### 6.2 Key Naming Conventions

1. **Category keys** - Lowercase, descriptive noun (e.g., `form`, `api`, `auth`)
2. **Error keys** - camelCase, action or state descriptor (e.g., `invalidEmail`, `uploadFailed`)
3. **Nested keys** - Follow parent.child pattern (e.g., `form.password.tooShort`)
4. **Parameter names** - camelCase in curly braces (e.g., `{fieldName}`, `{max}`)

---

## 7. Integration Pattern

### 7.1 Usage Example (for reference by subsequent tasks)

```typescript
// Client component usage
import { useTranslations } from 'next-intl';

function FormComponent() {
  const t = useTranslations('errors');

  // Basic error
  const requiredError = t('form.required');

  // With parameters
  const maxLengthError = t('form.maxLength', { max: 100 });

  // Nested access
  const passwordError = t('form.password.tooShort', { min: 8 });
}
```

### 7.2 API Error Mapping Pattern

```typescript
// Pattern for subsequent tasks (2J.3, 2J.4)
function mapHttpStatusToErrorKey(status: number): string {
  const statusMap: Record<number, string> = {
    400: 'api.badRequest',
    401: 'api.unauthorized',
    403: 'api.forbidden',
    404: 'api.notFound',
    409: 'api.conflict',
    422: 'api.unprocessable',
    429: 'api.rateLimited',
    500: 'api.serverError',
    503: 'api.serviceUnavailable',
  };
  return statusMap[status] || 'api.generic';
}
```

---

## 8. Acceptance Criteria Verification

| Criterion | Implementation |
|-----------|----------------|
| Errors namespace exists with clear structure | Nested JSON structure with descriptive categories |
| Categories for validation, API, auth, permission, system | `form`, `api`, `auth`, `network`, `item`, `property`, `file`, `system`, `workflow`, `boundary` |
| Specific messages by error type | Each category has contextual error messages |
| Validation errors for common scenarios | `form.required`, `form.email`, `form.password.*`, `form.maxLength`, etc. |
| API errors for common failures | `api.notFound`, `api.timeout`, `api.serverError`, etc. |
| Auth errors for sessions and credentials | `auth.invalidCredentials`, `auth.sessionExpired`, `auth.accessDenied`, etc. |
| Permission errors for access denied | `auth.accessDenied`, `api.forbidden`, `api.unauthorized` |
| System errors for unexpected scenarios | `system.unexpected`, `system.maintenance`, `boundary.*` |
| Clear, specific, actionable messages | All messages provide user-friendly guidance |
| Parameter substitution support | ICU format `{param}` used throughout |
| Extensible structure | Nested categories allow easy addition |
| Valid JSON format | Structure validated before commit |

---

## 9. Dependencies

### 9.1 Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | Complete | next-intl installed, `/messages/*.json` exists |
| Translation file structure | Complete | `/messages/en.json` exists with basic structure |

### 9.2 Downstream Dependencies

This task enables:
- **Task 2J.2:** Audit form validation messages
- **Task 2J.3:** Audit API error handling
- **Task 2J.4:** Create centralized error message utility
- **Task 2J.5:** Update Zod schemas with translated messages
- **Task 2J.6:** Update error boundaries with translations
- **Task 2J.7:** Generate translations for non-English languages

---

## 10. Testing Considerations

### 10.1 Validation Steps

1. **JSON syntax validation** - Ensure file parses without errors
2. **Key uniqueness** - No duplicate keys within namespaces
3. **Parameter consistency** - All `{param}` placeholders match expected values
4. **Completeness check** - Compare against error types used in codebase

### 10.2 Manual Verification

1. Review message clarity and tone
2. Verify actionable guidance in each message
3. Check parameter placeholders make sense in context
4. Ensure no technical jargon in user-facing messages

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing error scenarios | Medium | Low | Iterate based on component audit findings |
| Inconsistent key naming | Low | Medium | Follow documented conventions strictly |
| JSON syntax errors | Low | High | Validate JSON before commit |
| Breaking existing code | Low | Medium | Maintain backward-compatible key aliases |

---

## 12. Estimated Effort

| Activity | Estimate |
|----------|----------|
| Namespace structure design | 1 hour |
| JSON content creation | 2-3 hours |
| Validation and review | 30 minutes |
| **Total** | **3.5-4.5 hours** |

---

## 13. References

- [Plan-111: L10N Epic 2 - Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-315: Create Errors Namespace Structure](/docs/gen_requests_epic2.md#req-315)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
