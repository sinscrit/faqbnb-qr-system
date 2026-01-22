# Error Translation Utility

*REQ-E02-035: Create Centralized Error Message Utility*
*Created: 2026-01-22*
*Last Modified: 2026-01-22*

## Overview

The error translation utility provides a clean, consistent interface for retrieving translated error messages throughout the FAQBNB application. It abstracts away direct interaction with next-intl for error messages specifically, offering typed access to all error categories.

## Quick Start

### Client-Side (React Components)

```tsx
import { useErrorTranslations } from '@/lib/i18n';

function MyComponent() {
  const errors = useErrorTranslations();

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
    } catch (error) {
      // Get translated error message
      const message = errors.getFormError('required');
      showToast(message);
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Server-Side (API Routes / Server Components)

```ts
import { getErrorTranslations } from '@/lib/i18n';

export async function POST(request: Request) {
  const errors = await getErrorTranslations();

  if (!data.email) {
    return Response.json({
      error: errors.getFormError('required'),
    }, { status: 400 });
  }
}
```

## API Reference

### `useErrorTranslations()`

Client-side hook for React components.

**Returns:** `ErrorTranslationUtils` object with error retrieval methods.

### `getErrorTranslations()`

Server-side async function.

**Returns:** `Promise<ErrorTranslationUtils>`

### `ErrorTranslationUtils` Interface

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getFormError` | `(key: FormErrorKey, params?: ErrorParams)` | `string` | Form validation errors |
| `getAuthError` | `(key: AuthErrorKey, params?: ErrorParams)` | `string` | Authentication errors |
| `getApiError` | `(key: ApiErrorKey, params?: ErrorParams)` | `string` | API/server errors |
| `getNetworkError` | `(key: NetworkErrorKey, params?: ErrorParams)` | `string` | Network/connection errors |
| `getItemError` | `(key: ItemErrorKey, params?: ErrorParams)` | `string` | Item-specific errors |
| `getPropertyError` | `(key: PropertyErrorKey, params?: ErrorParams)` | `string` | Property-specific errors |
| `getFileError` | `(key: FileErrorKey, params?: ErrorParams)` | `string` | File upload errors |
| `getError` | `(key: string, params?: ErrorParams)` | `string` | Generic error by full key path |
| `getGenericError` | `()` | `string` | Generic fallback error |
| `getHttpError` | `(statusCode: number, params?: ErrorParams)` | `string` | Error by HTTP status code |
| `getErrorByCode` | `(code: ErrorCode, params?: ErrorParams)` | `string` | Error by ErrorCode enum |

## Error Categories

### Form Errors (`FormErrorKey`)

```tsx
errors.getFormError('required')            // "This field is required"
errors.getFormError('email')               // "Please enter a valid email address"
errors.getFormError('passwordTooShort', { min: 8 })  // "Password must be at least 8 characters"
errors.getFormError('maxLength', { max: 100 })       // "Maximum 100 characters allowed"
```

Available keys: `required`, `email`, `passwordRequired`, `passwordTooShort`, `passwordTooWeak`, `passwordMismatch`, `maxLength`, `minLength`, `invalidFormat`, `invalidUrl`, `invalidPhone`

### Auth Errors (`AuthErrorKey`)

```tsx
errors.getAuthError('invalidCredentials')  // "Invalid email or password"
errors.getAuthError('sessionExpired')      // "Your session has expired. Please sign in again."
errors.getAuthError('emailTaken')          // "This email is already registered"
```

Available keys: `invalidCredentials`, `emailNotVerified`, `sessionExpired`, `accountLocked`, `accessDenied`, `emailTaken`, `emailMismatch`, `invalidAccessCode`, `accessCodeExpired`

### API Errors (`ApiErrorKey`)

```tsx
errors.getApiError('notFound')             // "The requested resource was not found"
errors.getApiError('serverError')          // "Server error. Please try again later."
errors.getApiError('timeout')              // "Request timed out. Please try again."
```

Available keys: `generic`, `notFound`, `unauthorized`, `forbidden`, `conflict`, `serverError`, `timeout`, `tooManyRequests`

### Network Errors (`NetworkErrorKey`)

```tsx
errors.getNetworkError('offline')          // "You appear to be offline. Please check your connection."
errors.getNetworkError('connectionFailed') // "Unable to connect to the server"
```

Available keys: `offline`, `connectionFailed`, `slowConnection`

### Item Errors (`ItemErrorKey`)

```tsx
errors.getItemError('notFound')            // "Item not found"
errors.getItemError('duplicateName')       // "An item with this name already exists"
```

Available keys: `notFound`, `createFailed`, `updateFailed`, `deleteFailed`, `duplicateName`

### Property Errors (`PropertyErrorKey`)

```tsx
errors.getPropertyError('notFound')        // "Property not found"
errors.getPropertyError('createFailed')    // "Failed to create property"
```

Available keys: `notFound`, `createFailed`, `updateFailed`, `deleteFailed`

### File Errors (`FileErrorKey`)

```tsx
errors.getFileError('tooLarge', { max: '10MB' })  // "File size exceeds 10MB limit"
errors.getFileError('invalidType', { types: 'jpg, png' })  // "Invalid file type. Allowed: jpg, png"
```

Available keys: `tooLarge`, `invalidType`, `uploadFailed`

## Helper Functions

### `getHttpErrorKey(statusCode: number)`

Maps HTTP status codes to API error keys.

```tsx
import { getHttpErrorKey } from '@/lib/i18n';

const key = getHttpErrorKey(404);  // Returns 'notFound'
const key = getHttpErrorKey(500);  // Returns 'serverError'
const key = getHttpErrorKey(429);  // Returns 'tooManyRequests'
```

### `getErrorCodeKey(code: ErrorCode)`

Maps ErrorCode enum values to translation key paths.

```tsx
import { getErrorCodeKey, ErrorCode } from '@/lib/i18n/error-translations';

const key = getErrorCodeKey(ErrorCode.INVALID_ACCESS_CODE);  // Returns 'auth.invalidAccessCode'
const key = getErrorCodeKey(ErrorCode.NETWORK_ERROR);        // Returns 'network.connectionFailed'
```

### `getErrorCategory(code: ErrorCode)`

Determines the error category from an ErrorCode.

```tsx
import { getErrorCategory, ErrorCode } from '@/lib/i18n/error-translations';

const category = getErrorCategory(ErrorCode.VALIDATION_FAILED);  // Returns 'form'
const category = getErrorCategory(ErrorCode.NETWORK_ERROR);      // Returns 'network'
```

## Integration with Existing Error Handling

### Using with `translateErrorMessage()`

The `error-utils.ts` module provides integration helpers:

```tsx
import { translateWithI18n } from '@/lib/error-utils';
import { useErrorTranslations } from '@/lib/i18n';

function ErrorHandler({ error }) {
  const errors = useErrorTranslations();

  // Translates error using existing error classification + i18n
  const message = translateWithI18n(error, errors);

  return <p>{message}</p>;
}
```

### Using with `UserFriendlyError`

```tsx
import { getTranslatedUserFriendlyError } from '@/lib/error-utils';
import { useErrorTranslations } from '@/lib/i18n';

function ErrorDisplay({ error, statusCode }) {
  const errors = useErrorTranslations();

  const friendlyError = getTranslatedUserFriendlyError(error, statusCode, errors);

  return (
    <div>
      <p>{friendlyError.message}</p>
      {friendlyError.nextSteps && <p>{friendlyError.nextSteps}</p>}
    </div>
  );
}
```

## Migration Guide

### From Direct `t()` Calls

**Before:**
```tsx
const t = useTranslations('errors');
const message = t('form.required');
```

**After:**
```tsx
const errors = useErrorTranslations();
const message = errors.getFormError('required');
```

### From `translateErrorMessage()`

**Before:**
```tsx
const result = translateErrorMessage(errorStr);
showError(result.message);
```

**After:**
```tsx
const errors = useErrorTranslations();
const message = translateWithI18n(errorStr, errors);
showError(message);
```

## Fallback Behavior

The utility includes robust fallback handling:

1. If a specific error key is missing, falls back to `errors.generic`
2. If `generic` is missing, returns hardcoded fallback: "Something went wrong. Please try again."
3. Missing interpolation parameters default to empty strings

## Supported Languages

- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

## File Locations

| File | Description |
|------|-------------|
| `/src/lib/i18n/error-translations.ts` | Core module implementation |
| `/src/types/errors.ts` | TypeScript type definitions |
| `/src/lib/error-utils.ts` | Integration helpers |
| `/messages/en.json` | English translations (errors namespace) |
| `/messages/{locale}.json` | Other language translations |
| `/src/lib/i18n/__tests__/error-translations.test.ts` | Unit tests |

## Adding New Error Types

1. Add the error key type to `/src/types/errors.ts`
2. Add the translation key to `/messages/en.json` under the appropriate category
3. Add translations to all other language files
4. If using ErrorCode, add the mapping to `getErrorCodeKey()` in `error-translations.ts`
