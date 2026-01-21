# REQ-E02-032: Create Errors Namespace Structure - Detailed Task Breakdown

*Generated: 2026-01-20 11:30:00 UTC*
*Last Modified: 2026-01-20 11:30:00 UTC*

## Reference

- **Request ID**: REQ-E02-032
- **Overview Document**: docs/REQ-E02-032-create-errors-namespace-structure-overview.md
- **Source Requirements**: docs/gen_requests_epic2.md (Request #32)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Sub-Epic**: 2J - Error Messages & Validation
- **Task ID**: 2J.1
- **Size**: S (Small)
- **Estimated Effort**: 2-3 hours

---

## Executive Summary

This task creates a comprehensive, categorized `errors` namespace within `/messages/en.json` to centralize all user-facing error messages. The current flat structure (~17 keys) will be expanded and reorganized into ~50-60 categorized strings across 8 subcategories: form, api, network, auth, item, property, file, and system.

---

## Pre-Implementation Checklist

- [x] Epic 1 foundation is complete (next-intl installed and configured) ---implemented:verified next-intl configured---
- [x] `/messages/en.json` file exists with current flat `errors` namespace ---implemented:verified at lines 671-709---
- [x] Other language files exist (`fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`) ---implemented:all 6 files found---
- [x] Access to existing error handling patterns in `/src/lib/error-utils.ts` ---implemented:verified exists---
- [x] Access to existing validation patterns in `/src/components/ItemCapture/utils/validation.ts` ---implemented:verified exists---

---

## Task Breakdown

### Task 1: Backup and Analyze Current State
**Effort**: 10 minutes
**Type**: Research

#### Steps

1.1. **Document current errors namespace structure**
   - File: `/messages/en.json`
   - Location: Lines 103-120 (approximately)
   - Current keys: ~17 flat keys

1.2. **Current flat structure to preserve/migrate**:
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

1.3. **Verify no components are currently using these keys with nested paths**
   - If components use `t('errors.required')`, they will work after migration to `t('errors.form.required')`
   - Document any existing usage patterns

#### Acceptance Criteria
- [x] Current `errors` namespace content is documented ---implemented:verified current errors namespace at lines 671-709 with 17 flat keys plus nested errors.form---
- [x] Existing key-to-new-path mapping is prepared ---implemented:mapping prepared per spec document---

---

### Task 2: Create Form Validation Error Subcategory
**Effort**: 20 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.form`

#### Implementation

2.1. **Create `errors.form` subcategory with the following structure**:

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
      "unique": "This value is already in use",
      "number": {
        "invalid": "Please enter a valid number",
        "min": "Value must be at least {min}",
        "max": "Value must be no more than {max}"
      },
      "date": {
        "invalid": "Please enter a valid date",
        "past": "Date must be in the past",
        "future": "Date must be in the future"
      }
    }
  }
}
```

2.2. **ICU Message Format Variables**:
   - `{min}` - Minimum character/value count
   - `{max}` - Maximum character/value count

#### Acceptance Criteria
- [ ] `errors.form` subcategory exists with ~15 validation strings
- [ ] Password validation messages include nested structure
- [ ] Number and date validation messages are included
- [ ] ICU format `{min}` and `{max}` placeholders are correct

---

### Task 3: Create API Error Subcategory
**Effort**: 15 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.api`

#### Implementation

3.1. **Create `errors.api` subcategory**:

```json
{
  "errors": {
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "badRequest": "Invalid request. Please check your input.",
      "serviceUnavailable": "Service temporarily unavailable. Please try again later."
    }
  }
}
```

3.2. **HTTP Status Code Mapping Reference**:
   - 400 → `badRequest`
   - 401 → `unauthorized`
   - 403 → `forbidden`
   - 404 → `notFound`
   - 409 → `conflict`
   - 500 → `serverError`
   - 503 → `serviceUnavailable`

#### Acceptance Criteria
- [ ] `errors.api` subcategory exists with ~9 API error strings
- [ ] All common HTTP error codes are covered
- [ ] Messages are user-friendly (no HTTP codes shown)

---

### Task 4: Create Network Error Subcategory
**Effort**: 10 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.network`

#### Implementation

4.1. **Create `errors.network` subcategory**:

```json
{
  "errors": {
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment.",
      "retryFailed": "Connection retry failed. Please try again later."
    }
  }
}
```

#### Acceptance Criteria
- [ ] `errors.network` subcategory exists with ~4 network error strings
- [ ] Messages provide actionable guidance for users

---

### Task 5: Create Authentication Error Subcategory
**Effort**: 15 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.auth`

#### Implementation

5.1. **Create `errors.auth` subcategory**:

```json
{
  "errors": {
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource",
      "emailTaken": "This email is already registered",
      "oauthFailed": "Authentication failed. Please try again.",
      "oauthSessionExpired": "OAuth session expired. Please sign in with Google again.",
      "oauthConflict": "An account with this email already exists. Please try logging in instead.",
      "accessCodeInvalid": "Invalid access code. Please check your invitation.",
      "accessCodeExpired": "Access code has expired. Please request a new one.",
      "emailMismatch": "Email does not match the access request"
    }
  }
}
```

5.2. **Alignment with existing ErrorCode enum** (from `/src/types/index.ts`):
   - `USER_ALREADY_REGISTERED` → `errors.auth.emailTaken`
   - `INVALID_ACCESS_CODE` → `errors.auth.accessCodeInvalid`
   - `EMAIL_MISMATCH` → `errors.auth.emailMismatch`
   - `OAUTH_SESSION_EXPIRED` → `errors.auth.oauthSessionExpired`
   - `OAUTH_REGISTRATION_CONFLICT` → `errors.auth.oauthConflict`
   - `OAUTH_AUTHENTICATION_FAILED` → `errors.auth.oauthFailed`

#### Acceptance Criteria
- [ ] `errors.auth` subcategory exists with ~12 authentication error strings
- [ ] OAuth-specific errors are included
- [ ] Access code errors are included
- [ ] Messages align with existing ErrorCode enum values

---

### Task 6: Create Item Error Subcategory
**Effort**: 10 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.item`

#### Implementation

6.1. **Create `errors.item` subcategory**:

```json
{
  "errors": {
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists",
      "contentRequired": "At least one media item, link, or text instructions must be provided",
      "titleRequired": "Item title is required",
      "titleTooLong": "Title must be {max} characters or less"
    }
  }
}
```

6.2. **ICU Message Format Variables**:
   - `{max}` - Maximum allowed characters

#### Acceptance Criteria
- [ ] `errors.item` subcategory exists with ~8 item error strings
- [ ] CRUD operation errors are covered
- [ ] Validation errors specific to items are included

---

### Task 7: Create Property Error Subcategory
**Effort**: 10 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.property`

#### Implementation

7.1. **Create `errors.property` subcategory**:

```json
{
  "errors": {
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "duplicateName": "A property with this name already exists",
      "nameRequired": "Property name is required"
    }
  }
}
```

#### Acceptance Criteria
- [ ] `errors.property` subcategory exists with ~6 property error strings
- [ ] CRUD operation errors are covered

---

### Task 8: Create File Upload Error Subcategory
**Effort**: 15 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.file`

#### Implementation

8.1. **Create `errors.file` subcategory**:

```json
{
  "errors": {
    "file": {
      "tooLarge": "File size exceeds {max} limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "countExceeded": "Maximum {max} files allowed",
      "totalSizeExceeded": "Total upload size exceeds {max} limit",
      "processingFailed": "Failed to process file. Please try a different file.",
      "imageCountExceeded": "Maximum {max} photos allowed",
      "urlCountExceeded": "Maximum {max} links allowed",
      "urlInvalid": "Please enter a valid URL",
      "urlProtocol": "Only http and https URLs are allowed"
    }
  }
}
```

8.2. **ICU Message Format Variables**:
   - `{max}` - Maximum allowed (size or count)
   - `{types}` - Comma-separated list of allowed file types

8.3. **Alignment with existing validation utilities** (from `/src/components/ItemCapture/utils/validation.ts`):
   - File size validation → `errors.file.tooLarge`
   - MIME type validation → `errors.file.invalidType`
   - Image count validation → `errors.file.imageCountExceeded`
   - URL count validation → `errors.file.urlCountExceeded`
   - Total size validation → `errors.file.totalSizeExceeded`

#### Acceptance Criteria
- [ ] `errors.file` subcategory exists with ~10 file error strings
- [ ] ICU format placeholders for dynamic limits are correct
- [ ] All validation.ts error types are covered

---

### Task 9: Create System Error Subcategory
**Effort**: 10 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors.system`

#### Implementation

9.1. **Create `errors.system` subcategory**:

```json
{
  "errors": {
    "system": {
      "unexpected": "An unexpected error occurred. Please try again.",
      "maintenance": "System is under maintenance. Please try again later.",
      "rateLimit": "Too many requests. Please wait a moment.",
      "permissionDenied": "Permission denied for this operation.",
      "browserNotSupported": "Your browser is not supported. Please use a modern browser."
    }
  }
}
```

#### Acceptance Criteria
- [ ] `errors.system` subcategory exists with ~5 system error strings
- [ ] Messages are user-friendly and non-alarming

---

### Task 10: Keep Deprecated Flat Keys (Backward Compatibility)
**Effort**: 10 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors` (root level, alongside subcategories)

#### Implementation

10.1. **Retain deprecated flat keys temporarily to prevent breaking existing code**:

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
    "genericError": "Something went wrong. Please try again.",
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

10.2. **Deprecation Note**: Add comment in documentation indicating these flat keys will be removed in a future update after components are migrated.

#### Acceptance Criteria
- [ ] Original flat keys remain at root level of `errors` namespace
- [ ] New categorized subcategories are added alongside
- [ ] No breaking changes for existing component usage

---

### Task 11: Assemble Complete Errors Namespace
**Effort**: 15 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`
- **Path**: `errors` (complete section)

#### Implementation

11.1. **Replace the entire `errors` section in `/messages/en.json` with the complete structure**:

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
    "genericError": "Something went wrong. Please try again.",
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
      "unique": "This value is already in use",
      "number": {
        "invalid": "Please enter a valid number",
        "min": "Value must be at least {min}",
        "max": "Value must be no more than {max}"
      },
      "date": {
        "invalid": "Please enter a valid date",
        "past": "Date must be in the past",
        "future": "Date must be in the future"
      }
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "badRequest": "Invalid request. Please check your input.",
      "serviceUnavailable": "Service temporarily unavailable. Please try again later."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment.",
      "retryFailed": "Connection retry failed. Please try again later."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource",
      "emailTaken": "This email is already registered",
      "oauthFailed": "Authentication failed. Please try again.",
      "oauthSessionExpired": "OAuth session expired. Please sign in with Google again.",
      "oauthConflict": "An account with this email already exists. Please try logging in instead.",
      "accessCodeInvalid": "Invalid access code. Please check your invitation.",
      "accessCodeExpired": "Access code has expired. Please request a new one.",
      "emailMismatch": "Email does not match the access request"
    },
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists",
      "contentRequired": "At least one media item, link, or text instructions must be provided",
      "titleRequired": "Item title is required",
      "titleTooLong": "Title must be {max} characters or less"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "duplicateName": "A property with this name already exists",
      "nameRequired": "Property name is required"
    },
    "file": {
      "tooLarge": "File size exceeds {max} limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again.",
      "countExceeded": "Maximum {max} files allowed",
      "totalSizeExceeded": "Total upload size exceeds {max} limit",
      "processingFailed": "Failed to process file. Please try a different file.",
      "imageCountExceeded": "Maximum {max} photos allowed",
      "urlCountExceeded": "Maximum {max} links allowed",
      "urlInvalid": "Please enter a valid URL",
      "urlProtocol": "Only http and https URLs are allowed"
    },
    "system": {
      "unexpected": "An unexpected error occurred. Please try again.",
      "maintenance": "System is under maintenance. Please try again later.",
      "rateLimit": "Too many requests. Please wait a moment.",
      "permissionDenied": "Permission denied for this operation.",
      "browserNotSupported": "Your browser is not supported. Please use a modern browser."
    }
  }
}
```

#### Acceptance Criteria
- [ ] Complete `errors` namespace assembled with all 8 subcategories
- [ ] Deprecated flat keys retained at root level
- [ ] JSON structure is valid

---

### Task 12: Copy Structure to Other Language Files
**Effort**: 20 minutes
**Type**: Implementation

#### Location
- **Files**:
  - `/messages/fr.json`
  - `/messages/es.json`
  - `/messages/de.json`
  - `/messages/nl.json`
  - `/messages/it.json`

#### Implementation

12.1. **Copy the entire English `errors` namespace structure to each non-English file**
   - Keep English text as placeholder values
   - Actual translations will be generated in Task 2J.7

12.2. **For each file, replace the existing `errors` section with the new structure**

#### Acceptance Criteria
- [ ] All 5 non-English language files have identical structure to English
- [ ] Each file contains the same key hierarchy
- [ ] Files are valid JSON

---

### Task 13: Validate JSON Files
**Effort**: 10 minutes
**Type**: Verification

#### Steps

13.1. **Validate JSON syntax for all 6 language files**:
   ```bash
   # Run from project root
   node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/fr.json'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/es.json'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/de.json'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))"
   node -e "JSON.parse(require('fs').readFileSync('messages/it.json'))"
   ```

13.2. **Verify ICU message format patterns are correct**:
   - All `{variable}` patterns are properly closed
   - No unescaped special characters

#### Acceptance Criteria
- [ ] All 6 language files parse as valid JSON
- [ ] No syntax errors

---

### Task 14: Build Verification
**Effort**: 10 minutes
**Type**: Verification

#### Steps

14.1. **Run development build**:
   ```bash
   npm run dev
   ```

14.2. **Run production build**:
   ```bash
   npm run build
   ```

14.3. **Verify no build errors related to i18n or translations**

#### Acceptance Criteria
- [ ] Development server starts without errors
- [ ] Production build completes successfully
- [ ] No warnings related to translation files

---

### Task 15: Test Translation Access
**Effort**: 15 minutes
**Type**: Verification

#### Steps

15.1. **Create a simple test to verify translations load correctly**:

Test the following in a component or browser console:

```typescript
// Sample usage patterns to verify
const t = useTranslations('errors');

// Test flat (deprecated) access
console.log(t('required')); // Should output: "This field is required"

// Test nested access
console.log(t('form.required')); // Should output: "This field is required"
console.log(t('form.password.tooShort', { min: 8 })); // Should output: "Password must be at least 8 characters"
console.log(t('api.notFound')); // Should output: "The requested resource was not found"
console.log(t('file.tooLarge', { max: '100MB' })); // Should output: "File size exceeds 100MB limit"
```

15.2. **Verify ICU variable interpolation works**:
   - Test `{min}` substitution
   - Test `{max}` substitution
   - Test `{types}` substitution

#### Acceptance Criteria
- [ ] All category access patterns work correctly
- [ ] ICU variable interpolation functions properly
- [ ] No runtime errors when accessing error translations

---

## Complete Implementation Summary

### Files Modified

| File | Changes |
|------|---------|
| `/messages/en.json` | Expand `errors` namespace from ~17 flat keys to ~70 categorized keys |
| `/messages/fr.json` | Copy new `errors` structure (English placeholders) |
| `/messages/es.json` | Copy new `errors` structure (English placeholders) |
| `/messages/de.json` | Copy new `errors` structure (English placeholders) |
| `/messages/nl.json` | Copy new `errors` structure (English placeholders) |
| `/messages/it.json` | Copy new `errors` structure (English placeholders) |

### Final String Count

| Category | String Count |
|----------|--------------|
| `errors` (deprecated flat) | 16 |
| `errors.form` | 18 |
| `errors.api` | 9 |
| `errors.network` | 4 |
| `errors.auth` | 12 |
| `errors.item` | 8 |
| `errors.property` | 6 |
| `errors.file` | 10 |
| `errors.system` | 5 |
| **Total** | **~88** |

### Key Migration Mapping

| Old Key (Deprecated) | New Key |
|---------------------|---------|
| `errors.required` | `errors.form.required` |
| `errors.invalidEmail` | `errors.form.email` |
| `errors.networkError` | `errors.network.connectionFailed` |
| `errors.unauthorized` | `errors.api.unauthorized` |
| `errors.notFound` | `errors.api.notFound` |
| `errors.serverError` | `errors.api.serverError` |
| `errors.validationFailed` | `errors.form.invalidFormat` |
| `errors.sessionExpired` | `errors.auth.sessionExpired` |
| `errors.tooManyRequests` | `errors.system.rateLimit` |
| `errors.invalidCredentials` | `errors.auth.invalidCredentials` |
| `errors.emailTaken` | `errors.auth.emailTaken` |
| `errors.passwordTooWeak` | `errors.form.password.tooWeak` |
| `errors.uploadFailed` | `errors.file.uploadFailed` |
| `errors.fileTooLarge` | `errors.file.tooLarge` |
| `errors.invalidFileType` | `errors.file.invalidType` |
| `errors.genericError` | `errors.api.generic` |

---

## Success Validation Checklist

### Structure Validation
- [ ] `errors.form` subcategory exists with ~18 form validation strings
- [ ] `errors.api` subcategory exists with ~9 API error strings
- [ ] `errors.network` subcategory exists with ~4 network error strings
- [ ] `errors.auth` subcategory exists with ~12 authentication error strings
- [ ] `errors.item` subcategory exists with ~8 item-related error strings
- [ ] `errors.property` subcategory exists with ~6 property-related error strings
- [ ] `errors.file` subcategory exists with ~10 file upload error strings
- [ ] `errors.system` subcategory exists with ~5 system error strings

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

---

## Dependencies

### Required (Already Installed from Epic 1)
- `next-intl` - i18n framework
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

---

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
| Component breakage from path changes | Low | Medium | Keep deprecated flat keys temporarily |
| Missing keys in non-English files | Low | Low | Structure will be synced across all files |
| Inconsistent terminology | Low | Low | Review all messages for consistency |
| ICU syntax errors | Low | Low | Validate with next-intl's built-in checking |

---

## Post-Implementation Notes

### For Subsequent Tasks
- Task 2J.2 will audit and update form validation messages across components to use new paths
- Task 2J.3 will audit and update API error handling to use new paths
- Task 2J.7 will generate actual translations for the 5 non-English languages
- Components should migrate from deprecated flat keys to new categorized paths

### Recommended Migration Pattern for Components

```typescript
// Before (using deprecated flat key)
const t = useTranslations('errors');
const error = t('required');

// After (using categorized path)
const t = useTranslations('errors');
const error = t('form.required');

// Or with direct namespace access
const t = useTranslations('errors.form');
const error = t('required');
```

---

*End of Detailed Task Breakdown*
