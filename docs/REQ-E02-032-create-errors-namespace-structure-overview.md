# REQ-E02-032: Create Errors Namespace Structure - Implementation Overview

*Generated: 2026-01-20 23:55:00 UTC*
*Last Modified: 2026-01-20 23:55:00 UTC*

## Reference

- **Request**: REQ-E02-032 (Create Errors Namespace Structure in Messages File)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2J (Error Messages & Validation)
- **Task ID**: 2J.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create a comprehensive `errors` namespace within the `/messages/en.json` file containing all error messages, validation feedback, and failure notifications used throughout the application. This namespace will serve as a centralized, categorized collection of user-facing error strings that can be translated and consistently applied across all components.

## Goals

1. Expand the existing `errors` namespace in `/messages/en.json` with comprehensive, categorized error messages
2. Organize error strings into logical subcategories (form, api, network, auth, item, property, file, system)
3. Implement ICU format for variable interpolation where dynamic values are needed (field names, limits, file types)
4. Follow the naming conventions established in Epic 1 and Plan-111
5. Ensure all error strings maintain user-friendly, actionable language
6. Provide guidance where appropriate to help users resolve errors
7. Enable consistent error messaging across the application to improve user experience

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Existing Errors Namespace

The current `/messages/en.json` already contains a basic `errors` namespace with ~17 keys in a flat structure:

```json
{
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
}
```

### Existing Error Handling Patterns

The codebase has established error handling patterns:

1. **Error Types** (`/src/types/index.ts:621-650`):
   - `ErrorCode` enum with codes like `VALIDATION_FAILED`, `USER_ALREADY_REGISTERED`, `INVALID_ACCESS_CODE`, etc.
   - `UserFriendlyError` interface with `code`, `message`, `actionable`, and `nextSteps` fields
   - `HTTP_ERROR_MAPPING` for status code to message mapping

2. **Error Utilities** (`/src/lib/error-utils.ts`):
   - `translateErrorMessage()` - Converts technical errors to user-friendly messages
   - `classifyError()` - Categorizes errors by type and severity
   - Error patterns for OAuth, network, business logic errors

3. **Validation Utilities** (`/src/components/ItemCapture/utils/validation.ts`):
   - Form validation with structured `ValidationResult` types
   - File size, MIME type, URL, and text validation
   - Error messages for various validation failures

### Target Structure (from Plan-111)

The implementation plan specifies expanding `errors` to include:

```json
{
  "errors": {
    "form": { ... },       // ~15 form validation messages
    "api": { ... },        // ~7 API error messages
    "network": { ... },    // ~3 network error messages
    "auth": { ... },       // ~5 authentication error messages
    "item": { ... },       // ~5 item-related error messages
    "property": { ... },   // ~4 property-related error messages
    "file": { ... }        // ~3 file upload error messages
  }
}
```

### Estimated String Count

- **Current**: ~17 strings (flat structure)
- **Target**: ~50-60 strings (categorized structure)
- **New strings to add**: ~40
- **Restructure existing**: ~17

## Implementation Order

### Step 1: Analyze Existing Error Messages

Review the current codebase to identify:
- Error messages in `/messages/en.json`
- Error codes and messages in `/src/types/index.ts`
- Error translation patterns in `/src/lib/error-utils.ts`
- Validation messages in `/src/components/ItemCapture/utils/validation.ts`
- Toast notifications and error handlers across components

### Step 2: Create Categorized Structure

Transform the flat `errors` namespace into a hierarchical structure with categories:

```json
{
  "errors": {
    "form": { ... },
    "api": { ... },
    "network": { ... },
    "auth": { ... },
    "item": { ... },
    "property": { ... },
    "file": { ... },
    "system": { ... }
  }
}
```

### Step 3: Add New Error Strings

Add missing error strings covering:
- Detailed form validation (password requirements, format validation)
- Comprehensive API errors (CRUD failures, conflicts)
- Network connectivity issues
- Authentication failures
- Domain-specific errors (items, properties)
- File handling errors with dynamic limits

### Step 4: Implement ICU Message Format

Add variable interpolation for dynamic error messages:
- Field names: `{fieldName}`
- Numeric limits: `{min}`, `{max}`, `{limit}`
- File constraints: `{types}`, `{size}`
- Resource names: `{name}`, `{itemName}`

### Step 5: Validate JSON Structure

- Ensure valid JSON syntax
- Verify all ICU message format patterns are correct
- Check for duplicate keys
- Validate consistent tone and terminology

### Step 6: Update Other Language Files

Apply the same structure to all 5 non-English language files (actual translations generated in separate task).

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file (source of truth)
- **Current State**: Contains basic `errors` namespace with ~17 flat keys
- **Modification Required**: Expand `errors` namespace with categorized subcategories
- **Changes**:
  - Restructure existing flat `errors` keys into `errors.form`, `errors.api`, etc.
  - Add new keys for comprehensive validation, API, network, auth, item, property, file, and system errors
  - Implement ICU message format for dynamic value interpolation

**Target Structure:**

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number",
      "pattern": "Please match the required format",
      "unique": "This value is already in use"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "badRequest": "Invalid request. Please check your input."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource",
      "emailTaken": "This email is already registered",
      "oauthFailed": "Authentication failed. Please try again.",
      "oauthSessionExpired": "OAuth session expired. Please sign in with Google again."
    },
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property"
    },
    "file": {
      "tooLarge": "File size exceeds {max} limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "countExceeded": "Maximum {max} files allowed"
    },
    "system": {
      "unexpected": "An unexpected error occurred. Please try again.",
      "maintenance": "System is under maintenance. Please try again later.",
      "rateLimit": "Too many requests. Please wait a moment."
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Apply same structure (English placeholders initially)
- **Note**: Actual translations will be generated in Task 2J.7

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- `/src/lib/error-utils.ts` - Will be updated in a separate task to use translations
- `/src/types/index.ts` - Error codes remain unchanged
- Any component files - Components will be updated in subsequent tasks

## Technical Specifications

### ICU Message Format Patterns

The following patterns use ICU message format for variable interpolation:

```json
{
  "form": {
    "password": {
      "tooShort": "Password must be at least {min} characters"
    },
    "maxLength": "Maximum {max} characters allowed",
    "minLength": "Minimum {min} characters required"
  },
  "file": {
    "tooLarge": "File size exceeds {max} limit",
    "invalidType": "Invalid file type. Allowed: {types}",
    "countExceeded": "Maximum {max} files allowed"
  }
}
```

**Usage in Components:**

```typescript
const t = useTranslations('errors');

// Form validation with dynamic min value
t('form.password.tooShort', { min: 8 }); // "Password must be at least 8 characters"

// File error with dynamic size
t('file.tooLarge', { max: '100MB' }); // "File size exceeds 100MB limit"

// File type error with allowed formats
t('file.invalidType', { types: 'JPG, PNG, GIF' }); // "Invalid file type. Allowed: JPG, PNG, GIF"
```

### Translation Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{category}.{element}.{variant?}
```

Examples:
- `errors.form.required` - Generic required field error
- `errors.form.password.tooShort` - Password too short error
- `errors.api.notFound` - Resource not found API error
- `errors.auth.sessionExpired` - Session expired auth error
- `errors.file.tooLarge` - File size exceeded error

### Error Message Guidelines

All error messages should:

1. **Be User-Friendly**: Avoid technical jargon
   - Bad: "HTTP 409 Conflict"
   - Good: "This resource already exists"

2. **Be Actionable**: Suggest what the user can do
   - Bad: "Upload failed"
   - Good: "File upload failed. Please try again."

3. **Be Informative**: Explain what went wrong
   - Bad: "Error"
   - Good: "Your session has expired. Please sign in again."

4. **Support Interpolation**: Use variables for dynamic content
   - Bad: "Password must be at least 8 characters"
   - Good: "Password must be at least {min} characters"

5. **Maintain Consistent Tone**: Professional but friendly
   - Bad: "You made an error!"
   - Good: "Please check your input and try again."

## Usage Patterns

### Client Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function FormComponent() {
  const t = useTranslations('errors');

  const validateEmail = (email: string) => {
    if (!email) return t('form.required');
    if (!isValidEmail(email)) return t('form.email');
    return null;
  };

  const handleApiError = (status: number) => {
    switch (status) {
      case 401: return t('auth.sessionExpired');
      case 403: return t('api.forbidden');
      case 404: return t('api.notFound');
      case 409: return t('api.conflict');
      default: return t('api.generic');
    }
  };

  return (/* ... */);
}
```

### Integration with Error Utilities

The existing `translateErrorMessage` function in `/src/lib/error-utils.ts` can be updated to use the new translations:

```typescript
// Future update in error-utils.ts
import { useTranslations } from 'next-intl';

export function useErrorTranslations() {
  const t = useTranslations('errors');

  return {
    getFormError: (key: string, params?: Record<string, unknown>) =>
      t(`form.${key}`, params),
    getApiError: (key: string) => t(`api.${key}`),
    getNetworkError: (key: string) => t(`network.${key}`),
    getAuthError: (key: string) => t(`auth.${key}`),
  };
}
```

### Integration with Zod Validation

Future pattern for Zod schema error messages:

```typescript
import { useTranslations } from 'next-intl';
import { z } from 'zod';

function useValidationSchema() {
  const t = useTranslations('errors.form');

  return z.object({
    email: z.string()
      .min(1, t('required'))
      .email(t('email')),
    password: z.string()
      .min(8, t('password.tooShort', { min: 8 }))
      .regex(/[A-Z]/, t('password.tooWeak')),
  });
}
```

## Migration Considerations

### Backward Compatibility

The existing components use flat error keys:
```typescript
const t = useTranslations('errors');
t('required'); // Currently works with flat structure
```

After this change, the access pattern changes:
```typescript
t('form.required'); // New nested path
```

**Important**: Components using the old flat `errors` keys will need to be updated to use the new nested paths. This is expected as part of Epic 2's component updates (Tasks 2J.2-2J.6).

### Temporary Approach

To maintain backward compatibility during the transition, consider keeping both old and new keys temporarily:

```json
{
  "errors": {
    "required": "This field is required",        // DEPRECATED: Use errors.form.required
    "invalidEmail": "Invalid email address",     // DEPRECATED: Use errors.form.email
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address"
    }
  }
}
```

## Success Validation Checklist

### Structure Validation
- [ ] `errors.form` subcategory exists with ~15 form validation strings
- [ ] `errors.api` subcategory exists with ~8 API error strings
- [ ] `errors.network` subcategory exists with ~3 network error strings
- [ ] `errors.auth` subcategory exists with ~8 authentication error strings
- [ ] `errors.item` subcategory exists with ~5 item-related error strings
- [ ] `errors.property` subcategory exists with ~4 property-related error strings
- [ ] `errors.file` subcategory exists with ~4 file upload error strings
- [ ] `errors.system` subcategory exists with ~3 system error strings

### ICU Format Validation
- [ ] Variable interpolation patterns use correct `{variable}` syntax
- [ ] All placeholders have corresponding documentation
- [ ] No unterminated brackets or braces

### Content Validation
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] Error messages provide actionable guidance where appropriate
- [ ] Consistent tone across all error categories
- [ ] No alarming or overly dramatic language

### JSON Validation
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files maintain consistent structure
- [ ] No duplicate keys within namespaces

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Sample usage works: `useTranslations('errors.form')` returns correct strings
- [ ] Variable interpolation works: `t('form.password.tooShort', { min: 8 })` returns "Password must be at least 8 characters"

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Changes are additive (expanding existing namespace)
  - JSON files have no runtime execution risk
  - Easy to validate with JSON linting
  - Rollback is straightforward (restore previous JSON)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Component breakage from path changes | Medium | Medium | Keep deprecated flat keys temporarily |
| Missing keys in non-English files | Medium | Low | Use English as fallback, structure will be synced |
| Inconsistent terminology | Low | Low | Review all messages for consistency |
| ICU syntax errors | Low | Low | Validate with next-intl's built-in checking |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2J.2**: Audit and update form validation messages across components
2. **Task 2J.3**: Audit and update API error handling and messages
3. **Task 2J.4**: Create centralized error message utility
4. **Task 2J.5**: Update Zod schemas to use translated messages
5. **Task 2J.6**: Update error boundaries with translations
6. **Task 2J.7**: Generate translations for 5 non-English languages
7. **All other Epic 2 sub-epics**: Reference error strings consistently

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2J: Error Messages & Validation", including:
- Same key names and hierarchy
- Same ICU message format patterns
- Same categorization approach (form, api, network, auth, item, property, file)

### Alignment with Existing Error Handling

The new error namespace complements existing error handling infrastructure:
- `ErrorCode` enum in `/src/types/index.ts` provides programmatic error codes
- `errors` namespace provides user-facing translated messages
- Components can map `ErrorCode` to translation keys for localized error display

### Error Reusability

The `errors` namespace is designed for maximum reusability:
- Form validation errors used in all forms (~30+ components)
- API errors used in all data-fetching components (~50+ components)
- Auth errors used in login, registration, and protected routes
- File errors used in all upload components

Centralizing error messages:
- Ensures consistent user experience
- Reduces translation costs (fewer unique strings)
- Simplifies error message updates

---

*End of Implementation Overview*
