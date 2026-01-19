# REQ-348: Create `errors` Namespace Structure - Detailed Task Breakdown

**Document Created:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request Reference:** REQ-315 (Create Errors Namespace Structure in Translation File)
**Overview Document:** REQ-348-create-errors-namespace-structure-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.1
**Size:** M (Medium)

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for creating a comprehensive `errors` namespace structure in the translation files. The implementation expands the existing minimal `errors` namespace in `/messages/en.json` to create a well-organized system for all error messages, validation feedback, API error responses, and failure notifications across the FAQBNB application.

---

## Prerequisites

Before starting this implementation, verify the following are complete:

| Prerequisite | Status Check | Notes |
|--------------|--------------|-------|
| Epic 1 Foundation complete | Check `/src/lib/i18n/config.ts` exists | i18n infrastructure must be in place |
| Translation files exist | Check `/messages/en.json` exists | Base translation file must exist |
| next-intl installed | Check `package.json` for `next-intl` | Required for translation system |
| Sub-Epic 2H complete | Check `common` namespace exists in `/messages/en.json` | Common translations should be in place first |

---

## Task Breakdown

### Task 2J.1.1: Audit Existing Errors Namespace

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** None

#### Description
Review the current state of the `errors` namespace in `/messages/en.json` to understand what exists and plan the restructuring.

#### Implementation Steps

1. **Step 1.1:** Open `/messages/en.json` and locate the current `errors` namespace

2. **Step 1.2:** Document all existing error keys and their messages
   - Current structure is flat with ~17 messages
   - Keys include: `required`, `invalidEmail`, `networkError`, `unauthorized`, `notFound`, `serverError`, `validationFailed`, `sessionExpired`, `tooManyRequests`, `invalidCredentials`, `emailTaken`, `passwordTooWeak`, `uploadFailed`, `fileTooLarge`, `invalidFileType`, `genericError`

3. **Step 1.3:** Review codebase for hardcoded error messages that need to be captured
   - Check `/src/components/LoginForm.tsx` for validation error patterns
   - Check `/src/components/RegistrationForm.tsx` for form error patterns
   - Check `/src/app/error.tsx` for error boundary messages
   - Check `/src/app/global-error.tsx` for global error messages

4. **Step 1.4:** Create a mapping of old keys to planned new nested structure
   - `errors.required` → `errors.form.required`
   - `errors.invalidEmail` → `errors.form.email`
   - `errors.networkError` → `errors.network.connectionFailed`
   - etc.

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| None | Read-only | Audit only, no changes in this task |

#### Acceptance Criteria
- [ ] Current error keys are documented
- [ ] Hardcoded error messages in components are identified
- [ ] Migration mapping from old to new keys is prepared

---

### Task 2J.1.2: Create Nested Namespace Structure with Form Validation Errors

**Story Points:** 1.5
**Complexity:** Medium
**Dependencies:** 2J.1.1

#### Description
Replace the flat `errors` object with a nested category structure and implement comprehensive form validation error messages.

#### Implementation Steps

1. **Step 2.1:** Open `/messages/en.json`

2. **Step 2.2:** Replace the existing flat `errors` object with the new nested structure. Start with the `form` category:

```json
"errors": {
  "form": {
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
  }
}
```

3. **Step 2.3:** Verify JSON syntax is valid after changes

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `form` category to `errors` namespace |

#### Acceptance Criteria
- [ ] `errors.form` category exists with nested structure
- [ ] `errors.form.password` subcategory contains all password validation messages
- [ ] All common field validation scenarios are covered
- [ ] ICU parameter placeholders (`{min}`, `{max}`, `{fieldName}`) are properly formatted
- [ ] JSON syntax is valid

---

### Task 2J.1.3: Add API Error Messages Category

**Story Points:** 1
**Complexity:** Medium
**Dependencies:** 2J.1.2

#### Description
Add the `api` category to the errors namespace with all HTTP/API response error messages.

#### Implementation Steps

1. **Step 3.1:** Add the `api` category after the `form` category in the `errors` namespace:

```json
"api": {
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
}
```

2. **Step 3.2:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `api` category to `errors` namespace |

#### Acceptance Criteria
- [ ] `errors.api` category exists with all HTTP error types
- [ ] Messages map to common HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 503)
- [ ] Messages are user-friendly, not technical
- [ ] JSON syntax is valid

---

### Task 2J.1.4: Add Network Error Messages Category

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** 2J.1.3

#### Description
Add the `network` category to the errors namespace for connectivity-related error messages.

#### Implementation Steps

1. **Step 4.1:** Add the `network` category after the `api` category:

```json
"network": {
  "offline": "You appear to be offline. Please check your connection.",
  "connectionFailed": "Unable to connect to the server",
  "slowConnection": "Connection is slow. This may take a moment.",
  "connectionLost": "Connection lost. Attempting to reconnect...",
  "reconnecting": "Reconnecting...",
  "reconnected": "Connection restored",
  "syncFailed": "Failed to sync data. Will retry when connection improves."
}
```

2. **Step 4.2:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `network` category to `errors` namespace |

#### Acceptance Criteria
- [ ] `errors.network` category exists with connectivity error messages
- [ ] Offline and reconnection scenarios are covered
- [ ] Messages provide helpful context about connection status
- [ ] JSON syntax is valid

---

### Task 2J.1.5: Add Authentication Error Messages Category

**Story Points:** 1
**Complexity:** Medium
**Dependencies:** 2J.1.4

#### Description
Add the `auth` category to the errors namespace for authentication, authorization, and session-related error messages.

#### Implementation Steps

1. **Step 5.1:** Add the `auth` category after the `network` category:

```json
"auth": {
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
}
```

2. **Step 5.2:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `auth` category to `errors` namespace |

#### Acceptance Criteria
- [ ] `errors.auth` category exists with all auth-related error messages
- [ ] Login, registration, session, and access code scenarios are covered
- [ ] OAuth error messages include `{provider}` parameter
- [ ] Messages are clear and actionable
- [ ] JSON syntax is valid

---

### Task 2J.1.6: Add Entity-Specific Error Messages Categories

**Story Points:** 1.5
**Complexity:** Medium
**Dependencies:** 2J.1.5

#### Description
Add entity-specific error categories for items, properties, and rooms.

#### Implementation Steps

1. **Step 6.1:** Add the `item` category:

```json
"item": {
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
}
```

2. **Step 6.2:** Add the `property` category:

```json
"property": {
  "notFound": "Property not found",
  "createFailed": "Failed to create property",
  "updateFailed": "Failed to update property",
  "deleteFailed": "Failed to delete property",
  "duplicateName": "A property with this name already exists",
  "hasItems": "Cannot delete property with existing items",
  "maxPropertiesReached": "Maximum number of properties reached",
  "invalidAddress": "Invalid property address"
}
```

3. **Step 6.3:** Add the `room` category:

```json
"room": {
  "notFound": "Room not found",
  "createFailed": "Failed to create room",
  "updateFailed": "Failed to update room",
  "deleteFailed": "Failed to delete room",
  "duplicateName": "A room with this name already exists in this property",
  "hasItems": "Cannot delete room with existing items"
}
```

4. **Step 6.4:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `item`, `property`, and `room` categories |

#### Acceptance Criteria
- [ ] `errors.item` category exists with item CRUD error messages
- [ ] `errors.property` category exists with property CRUD error messages
- [ ] `errors.room` category exists with room CRUD error messages
- [ ] All entity-specific scenarios are covered
- [ ] JSON syntax is valid

---

### Task 2J.1.7: Add File and Workflow Error Messages Categories

**Story Points:** 1
**Complexity:** Medium
**Dependencies:** 2J.1.6

#### Description
Add error categories for file upload/media operations and item creation workflow.

#### Implementation Steps

1. **Step 7.1:** Add the `file` category:

```json
"file": {
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
}
```

2. **Step 7.2:** Add the `workflow` category:

```json
"workflow": {
  "stepFailed": "Failed to complete step",
  "navigationBlocked": "Cannot navigate away with unsaved changes",
  "sessionLost": "Workflow session was lost. Please start over.",
  "saveFailed": "Failed to save workflow progress",
  "invalidStep": "Invalid workflow step",
  "contentCaptureFailed": "Failed to capture content",
  "cameraAccessDenied": "Camera access is required for this feature",
  "microphoneAccessDenied": "Microphone access is required for this feature"
}
```

3. **Step 7.3:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `file` and `workflow` categories |

#### Acceptance Criteria
- [ ] `errors.file` category exists with file/media error messages
- [ ] `errors.workflow` category exists with workflow error messages
- [ ] ICU parameters are properly formatted for dynamic values
- [ ] Camera and microphone permission errors are included
- [ ] JSON syntax is valid

---

### Task 2J.1.8: Add System and Error Boundary Categories

**Story Points:** 1
**Complexity:** Medium
**Dependencies:** 2J.1.7

#### Description
Add system-level error messages and error boundary UI messages.

#### Implementation Steps

1. **Step 8.1:** Add the `system` category:

```json
"system": {
  "unexpected": "An unexpected error occurred. Please try again.",
  "maintenance": "System is under maintenance. Please check back later.",
  "featureDisabled": "This feature is currently disabled",
  "browserUnsupported": "Your browser is not supported. Please use a modern browser.",
  "javascriptRequired": "JavaScript is required to use this application",
  "cookiesRequired": "Cookies must be enabled to use this application",
  "loadingFailed": "Failed to load application. Please refresh the page.",
  "updateRequired": "Application update required. Please refresh the page.",
  "dataCorrupted": "Data appears to be corrupted. Please contact support."
}
```

2. **Step 8.2:** Add the `boundary` category for error boundary UI:

```json
"boundary": {
  "title": "Something went wrong!",
  "description": "We apologize for the inconvenience. Our team has been notified of this error.",
  "tryAgain": "Try again",
  "goHome": "Go to home page",
  "contactSupport": "Contact support",
  "errorId": "Error ID: {errorId}"
}
```

3. **Step 8.3:** Verify JSON syntax remains valid

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add `system` and `boundary` categories |

#### Acceptance Criteria
- [ ] `errors.system` category exists with system-level error messages
- [ ] `errors.boundary` category exists with error boundary UI messages
- [ ] Error boundary messages match current UI patterns
- [ ] `{errorId}` parameter is included for debugging
- [ ] JSON syntax is valid

---

### Task 2J.1.9: Validate Complete Namespace Structure

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** 2J.1.8

#### Description
Validate the complete errors namespace structure for JSON syntax, key uniqueness, and parameter consistency.

#### Implementation Steps

1. **Step 9.1:** Run JSON validation on `/messages/en.json`
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('./messages/en.json', 'utf8')); console.log('JSON is valid')"
   ```

2. **Step 9.2:** Verify no duplicate keys exist within the errors namespace
   - Review each category for key uniqueness
   - Ensure nested keys don't conflict

3. **Step 9.3:** Verify all parameter placeholders use consistent naming
   - `{min}` and `{max}` for numeric constraints
   - `{fieldName}` for field references
   - `{provider}` for OAuth provider names
   - `{types}` for file type lists
   - `{width}` and `{height}` for dimensions
   - `{errorId}` for error tracking

4. **Step 9.4:** Verify the total structure matches the specification in the overview document

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Verified | No changes, validation only |

#### Acceptance Criteria
- [ ] JSON parses without syntax errors
- [ ] No duplicate keys exist within any category
- [ ] Parameter naming is consistent across all messages
- [ ] Structure matches the specification in REQ-348-overview.md
- [ ] All ~300 error message keys are present

---

### Task 2J.1.10: Create Key Migration Documentation

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** 2J.1.9

#### Description
Document the mapping from old flat error keys to the new nested structure to assist with component migration in subsequent tasks.

#### Implementation Steps

1. **Step 10.1:** Create or update migration notes at the end of the detailed document:

**Key Migration Table:**

| Old Key (Flat) | New Key (Nested) |
|----------------|------------------|
| `errors.required` | `errors.form.required` |
| `errors.invalidEmail` | `errors.form.email` |
| `errors.networkError` | `errors.network.connectionFailed` |
| `errors.unauthorized` | `errors.api.unauthorized` |
| `errors.notFound` | `errors.api.notFound` |
| `errors.serverError` | `errors.api.serverError` |
| `errors.validationFailed` | `errors.form.invalidFormat` (or specific validation) |
| `errors.sessionExpired` | `errors.auth.sessionExpired` |
| `errors.tooManyRequests` | `errors.api.rateLimited` |
| `errors.invalidCredentials` | `errors.auth.invalidCredentials` |
| `errors.emailTaken` | `errors.auth.emailTaken` |
| `errors.passwordTooWeak` | `errors.form.password.tooWeak` |
| `errors.uploadFailed` | `errors.file.uploadFailed` |
| `errors.fileTooLarge` | `errors.file.tooLarge` |
| `errors.invalidFileType` | `errors.file.invalidType` |
| `errors.genericError` | `errors.system.unexpected` |

2. **Step 10.2:** Note that old keys should be removed after all components are migrated (in tasks 2J.2-2J.6)

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| This document | Updated | Migration documentation added |

#### Acceptance Criteria
- [ ] Migration mapping is complete and accurate
- [ ] Old and new keys are clearly documented
- [ ] Notes for downstream tasks are included

---

## Implementation Order Summary

| Order | Task | Description | Est. Time | Dependencies |
|-------|------|-------------|-----------|--------------|
| 1 | 2J.1.1 | Audit existing errors namespace | 30 min | None |
| 2 | 2J.1.2 | Create form validation errors | 45 min | 2J.1.1 |
| 3 | 2J.1.3 | Add API error messages | 30 min | 2J.1.2 |
| 4 | 2J.1.4 | Add network error messages | 15 min | 2J.1.3 |
| 5 | 2J.1.5 | Add authentication error messages | 30 min | 2J.1.4 |
| 6 | 2J.1.6 | Add entity-specific errors | 45 min | 2J.1.5 |
| 7 | 2J.1.7 | Add file and workflow errors | 30 min | 2J.1.6 |
| 8 | 2J.1.8 | Add system and boundary errors | 30 min | 2J.1.7 |
| 9 | 2J.1.9 | Validate complete structure | 15 min | 2J.1.8 |
| 10 | 2J.1.10 | Create migration documentation | 15 min | 2J.1.9 |

**Total Estimated Time:** 3.5-4.5 hours

---

## Complete Final Structure

After completing all tasks, the `errors` namespace in `/messages/en.json` should have this structure:

```json
{
  "errors": {
    "form": {
      "required": "...",
      "requiredField": "...",
      "email": "...",
      "emailFormat": "...",
      "password": {
        "required": "...",
        "tooShort": "...",
        "tooLong": "...",
        "tooWeak": "...",
        "noSpecial": "...",
        "mismatch": "...",
        "sameAsOld": "..."
      },
      "maxLength": "...",
      "minLength": "...",
      "exactLength": "...",
      "invalidFormat": "...",
      "invalidUrl": "...",
      "invalidUrlProtocol": "...",
      "invalidPhone": "...",
      "invalidDate": "...",
      "dateFuture": "...",
      "datePast": "...",
      "numberMin": "...",
      "numberMax": "...",
      "numberRange": "...",
      "numberInteger": "...",
      "numberPositive": "...",
      "selectionRequired": "...",
      "checkboxRequired": "...",
      "pattern": "...",
      "unique": "...",
      "noWhitespace": "...",
      "noSpecialChars": "...",
      "invalidJson": "..."
    },
    "api": {
      "generic": "...",
      "notFound": "...",
      "unauthorized": "...",
      "forbidden": "...",
      "conflict": "...",
      "badRequest": "...",
      "serverError": "...",
      "serviceUnavailable": "...",
      "timeout": "...",
      "rateLimited": "...",
      "payloadTooLarge": "...",
      "unprocessable": "...",
      "methodNotAllowed": "..."
    },
    "network": {
      "offline": "...",
      "connectionFailed": "...",
      "slowConnection": "...",
      "connectionLost": "...",
      "reconnecting": "...",
      "reconnected": "...",
      "syncFailed": "..."
    },
    "auth": {
      "invalidCredentials": "...",
      "emailNotVerified": "...",
      "verificationExpired": "...",
      "verificationInvalid": "...",
      "sessionExpired": "...",
      "sessionInvalid": "...",
      "accountLocked": "...",
      "accountDisabled": "...",
      "accountNotFound": "...",
      "accessDenied": "...",
      "accessCodeInvalid": "...",
      "accessCodeExpired": "...",
      "accessCodeUsed": "...",
      "emailTaken": "...",
      "registrationFailed": "...",
      "oauthFailed": "...",
      "oauthCancelled": "...",
      "passwordResetFailed": "...",
      "passwordResetExpired": "...",
      "twoFactorRequired": "...",
      "twoFactorInvalid": "..."
    },
    "item": {
      "notFound": "...",
      "createFailed": "...",
      "updateFailed": "...",
      "deleteFailed": "...",
      "duplicateName": "...",
      "invalidRoom": "...",
      "invalidProperty": "...",
      "contentRequired": "...",
      "nameRequired": "...",
      "maxItemsReached": "...",
      "qrGenerationFailed": "...",
      "archiveFailed": "...",
      "restoreFailed": "..."
    },
    "property": {
      "notFound": "...",
      "createFailed": "...",
      "updateFailed": "...",
      "deleteFailed": "...",
      "duplicateName": "...",
      "hasItems": "...",
      "maxPropertiesReached": "...",
      "invalidAddress": "..."
    },
    "room": {
      "notFound": "...",
      "createFailed": "...",
      "updateFailed": "...",
      "deleteFailed": "...",
      "duplicateName": "...",
      "hasItems": "..."
    },
    "file": {
      "tooLarge": "...",
      "invalidType": "...",
      "uploadFailed": "...",
      "uploadCancelled": "...",
      "processingFailed": "...",
      "dimensionsTooSmall": "...",
      "dimensionsTooLarge": "...",
      "durationTooLong": "...",
      "corruptedFile": "...",
      "storageQuotaExceeded": "...",
      "downloadFailed": "..."
    },
    "workflow": {
      "stepFailed": "...",
      "navigationBlocked": "...",
      "sessionLost": "...",
      "saveFailed": "...",
      "invalidStep": "...",
      "contentCaptureFailed": "...",
      "cameraAccessDenied": "...",
      "microphoneAccessDenied": "..."
    },
    "system": {
      "unexpected": "...",
      "maintenance": "...",
      "featureDisabled": "...",
      "browserUnsupported": "...",
      "javascriptRequired": "...",
      "cookiesRequired": "...",
      "loadingFailed": "...",
      "updateRequired": "...",
      "dataCorrupted": "..."
    },
    "boundary": {
      "title": "...",
      "description": "...",
      "tryAgain": "...",
      "goHome": "...",
      "contactSupport": "...",
      "errorId": "..."
    }
  }
}
```

**Total Keys:** ~130 unique error message keys across 11 categories

---

## Verification Checklist

After completing all tasks, verify the following:

### Structure Validation
- [ ] JSON file parses without errors
- [ ] All 11 error categories exist (`form`, `api`, `network`, `auth`, `item`, `property`, `room`, `file`, `workflow`, `system`, `boundary`)
- [ ] No duplicate keys within any category
- [ ] Nested `password` subcategory exists under `form`

### Message Quality
- [ ] All messages are user-friendly, not technical
- [ ] All messages are actionable where appropriate
- [ ] Tone is helpful and professional
- [ ] No cryptic error codes visible to users

### Parameter Support
- [ ] ICU format placeholders are correctly formatted (`{param}`)
- [ ] Parameter names are consistent across messages
- [ ] Parameters make sense in context

### Completeness
- [ ] Form validation covers all common scenarios
- [ ] API errors cover all HTTP status codes
- [ ] Auth errors cover login, registration, and session scenarios
- [ ] Entity errors cover CRUD operations for items, properties, rooms
- [ ] File errors cover upload, type, and size constraints
- [ ] System errors provide appropriate fallbacks

---

## Integration Pattern Reference

For component integration (to be done in Tasks 2J.2-2J.6):

### Client Component Usage
```typescript
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

### Server Component Usage
```typescript
import { getTranslations } from 'next-intl/server';

async function ServerComponent() {
  const t = await getTranslations('errors');
  const error = t('api.serverError');
}
```

### Error Utility Pattern (for Task 2J.4)
```typescript
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

## Downstream Dependencies

This task enables the following subsequent tasks:

| Task | Description | Depends On |
|------|-------------|------------|
| 2J.2 | Audit form validation messages | Errors namespace structure |
| 2J.3 | Audit API error handling | Errors namespace structure |
| 2J.4 | Create centralized error message utility | Errors namespace structure |
| 2J.5 | Update Zod schemas with translated messages | Errors namespace structure |
| 2J.6 | Update error boundaries with translations | Errors namespace structure |
| 2J.7 | Generate translations for non-English languages | Errors namespace structure |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing error scenarios | Medium | Low | Iterate based on component audit findings in 2J.2-2J.3 |
| Inconsistent key naming | Low | Medium | Follow documented conventions strictly |
| JSON syntax errors | Low | High | Validate JSON after each task |
| Breaking existing code | Low | Medium | Maintain backward-compatible key aliases temporarily |

---

## Related Documents

- [REQ-348 Overview](./REQ-348-create-errors-namespace-structure-overview.md)
- [REQ-315 Original Request](./gen_requests_epic2.md#req-315)
- [Plan-111 Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Static UI Translation, Sub-Epic 2J, Task 2J.1*
*Detailed breakdown ready for implementation by AI coding agent or junior developer*
