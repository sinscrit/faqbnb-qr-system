# API Error Handling Guide

*Created: 2026-01-21*
*Last Modified: 2026-01-21*

## Overview

This guide explains how to implement consistent, internationalized error handling in FAQBNB API routes. All API error responses should use the centralized error utilities to ensure consistent formatting, proper HTTP status codes, and translated error messages.

## Quick Start

```typescript
import { ApiErrors, withErrorHandling, ApiError, ApiErrorCode } from '@/lib/api-error';
import { NextRequest } from 'next/server';

// Option 1: Use pre-built error helpers
export async function GET(request: NextRequest) {
  const item = await getItem(id);
  if (!item) {
    return ApiErrors.notFound(request, 'item');
  }
  return NextResponse.json({ success: true, data: item });
}

// Option 2: Use error handling wrapper
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Your logic here - throw ApiError for expected errors
  throw new ApiError(ApiErrorCode.VALIDATION_FAILED);
});
```

## Available Error Utilities

### Location
- **Types**: `/src/types/api-errors.ts`
- **Utilities**: `/src/lib/api-error.ts`

### Error Code Enum

```typescript
import { ApiErrorCode } from '@/types/api-errors';

// Available error codes:
ApiErrorCode.UNAUTHORIZED          // 401 - No valid auth
ApiErrorCode.SESSION_EXPIRED       // 401 - Session expired
ApiErrorCode.INVALID_CREDENTIALS   // 401 - Wrong email/password
ApiErrorCode.FORBIDDEN             // 403 - Not allowed
ApiErrorCode.ACCESS_DENIED         // 403 - Permission denied
ApiErrorCode.VALIDATION_FAILED     // 400 - Validation error
ApiErrorCode.INVALID_INPUT         // 400 - Bad request data
ApiErrorCode.MISSING_REQUIRED_FIELD // 400 - Required field missing
ApiErrorCode.NOT_FOUND             // 404 - Resource not found
ApiErrorCode.CONFLICT              // 409 - Resource conflict
ApiErrorCode.ALREADY_EXISTS        // 409 - Duplicate resource
ApiErrorCode.INTERNAL_ERROR        // 500 - Server error
ApiErrorCode.SERVICE_UNAVAILABLE   // 503 - Service down
ApiErrorCode.TIMEOUT               // 408 - Request timeout
ApiErrorCode.FILE_TOO_LARGE        // 413 - File size exceeded
ApiErrorCode.INVALID_FILE_TYPE     // 415 - Wrong file type
ApiErrorCode.UPLOAD_FAILED         // 500 - Upload error
ApiErrorCode.RATE_LIMITED          // 429 - Too many requests
ApiErrorCode.METHOD_NOT_ALLOWED    // 405 - Wrong HTTP method
```

### Pre-built Error Helpers

The `ApiErrors` object provides convenient methods for common errors:

```typescript
import { ApiErrors } from '@/lib/api-error';

// Authentication errors
await ApiErrors.unauthorized(request);           // 401
await ApiErrors.sessionExpired(request);         // 401
await ApiErrors.invalidCredentials(request);     // 401

// Authorization errors
await ApiErrors.forbidden(request);              // 403
await ApiErrors.accessDenied(request);           // 403

// Client errors
await ApiErrors.notFound(request, 'item');       // 404 with resource name
await ApiErrors.badRequest(request, details);    // 400 with optional details
await ApiErrors.validationFailed(request, details); // 400 with validation details
await ApiErrors.missingRequiredField(request, 'email'); // 400 with field name
await ApiErrors.conflict(request, 'details');    // 409
await ApiErrors.alreadyExists(request, 'user');  // 409 with resource name

// Server errors
await ApiErrors.serverError(request, 'details'); // 500
await ApiErrors.serviceUnavailable(request);     // 503
await ApiErrors.timeout(request);                // 408

// Rate limiting
await ApiErrors.rateLimited(request);            // 429

// Method errors
await ApiErrors.methodNotAllowed(request);       // 405

// File upload errors
await ApiErrors.fileTooLarge(request, '10MB');   // 413 with max size
await ApiErrors.invalidFileType(request, 'png,jpg'); // 415 with allowed types
await ApiErrors.uploadFailed(request, 'details'); // 500
```

### Custom Error Creation

For cases not covered by the pre-built helpers:

```typescript
import { createErrorResponse, ApiErrorCode } from '@/lib/api-error';

// Basic usage
const response = await createErrorResponse(request, ApiErrorCode.FORBIDDEN);

// With options
const response = await createErrorResponse(request, ApiErrorCode.VALIDATION_FAILED, {
  status: 400,                    // Override default status
  details: ['email', 'password'], // Validation field list
  field: 'email',                 // Specific field reference
  params: { min: 8 }              // ICU message format params
});
```

### Error Handling Wrapper

Use `withErrorHandling` to automatically catch and translate errors:

```typescript
import { withErrorHandling, ApiError, ApiErrorCode } from '@/lib/api-error';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  if (!body.email) {
    // Throw typed errors - they'll be caught and translated
    throw new ApiError(ApiErrorCode.MISSING_REQUIRED_FIELD, 400, undefined, 'email');
  }

  const result = await createSomething(body);
  return NextResponse.json({ success: true, data: result });
});
// Unexpected errors are automatically caught and return a translated server error
```

## Response Format

All error responses follow this standard format:

```typescript
interface StandardErrorResponse {
  success: false;
  error: string;           // Translated user-friendly message
  code?: ApiErrorCode;     // Machine-readable error code
  details?: ErrorDetails;  // Additional context (string, array, or object)
  field?: string;          // For field-specific validation errors
}

// Example responses:

// Simple error
{ "success": false, "error": "Item not found", "code": "NOT_FOUND" }

// Validation error with field
{ "success": false, "error": "This field is required", "code": "MISSING_REQUIRED_FIELD", "field": "email" }

// Validation error with multiple fields
{ "success": false, "error": "Validation failed", "code": "VALIDATION_FAILED", "details": ["email", "password"] }
```

## Translation Keys

Error messages are automatically translated based on the request's locale. The utility checks:
1. `x-locale` header
2. `Accept-Language` header
3. `locale` cookie
4. Falls back to `en`

### Translation Key Mapping

Each `ApiErrorCode` maps to a translation key in the `errors` namespace:

| Code | Translation Key | Example Message (en) |
|------|-----------------|---------------------|
| UNAUTHORIZED | errors.auth.sessionExpired | "Your session has expired. Please sign in again." |
| FORBIDDEN | errors.api.forbidden | "Access denied" |
| NOT_FOUND | errors.api.notFound | "The requested resource was not found" |
| VALIDATION_FAILED | errors.api.badRequest | "Invalid request. Please check your input." |
| INTERNAL_ERROR | errors.api.serverError | "Server error. Please try again later." |

## Migration Examples

### Before (Inconsistent)

```typescript
// Inconsistent status codes
return NextResponse.json({ error: "Not found" }, { status: 500 });

// Hardcoded messages
return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });

// Inconsistent structure
return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
```

### After (Consistent & Translated)

```typescript
// Correct status code with translation
return ApiErrors.notFound(request, 'item');

// Translated validation error
return ApiErrors.badRequest(request, { email: 'Invalid format' });

// Consistent structure with translation
return ApiErrors.unauthorized(request);
```

## Type Guards

Use type guards to check response types:

```typescript
import { isErrorResponse, isSuccessResponse, StandardApiResponse } from '@/types/api-errors';

const response: StandardApiResponse = await fetchData();

if (isErrorResponse(response)) {
  console.error(response.error);
  console.log(response.code); // ApiErrorCode
} else if (isSuccessResponse(response)) {
  console.log(response.data);
}
```

## Testing Error Responses

When testing API routes, verify:

1. **Correct HTTP status code**
2. **Correct error code** in response body
3. **Message is translated** (check different Accept-Language headers)
4. **Response structure** matches `StandardErrorResponse`

```typescript
// Example test
it('returns 404 for missing item', async () => {
  const response = await GET(
    new NextRequest('http://localhost/api/items/missing', {
      headers: { 'Accept-Language': 'fr' }
    }),
    { params: { publicId: 'missing' } }
  );

  expect(response.status).toBe(404);

  const body = await response.json();
  expect(body.success).toBe(false);
  expect(body.code).toBe('NOT_FOUND');
  // French translation
  expect(body.error).toBe('La ressource demandée n\'a pas été trouvée');
});
```

## Best Practices

1. **Always use the centralized utilities** - Never create manual error responses
2. **Include error codes** - Helps frontend handle errors programmatically
3. **Use appropriate HTTP status codes** - The utilities set correct defaults
4. **Add details when helpful** - Validation errors should include affected fields
5. **Test with different locales** - Verify translations work correctly
6. **Use the wrapper for route handlers** - Catches unexpected errors automatically

## Supported Languages

- English (en) - Default
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

---

## Related Files

- `/src/types/api-errors.ts` - TypeScript types and enums
- `/src/lib/api-error.ts` - Error utility implementation
- `/messages/en.json` - English translations (errors namespace)
- `/docs/audit/api-error-audit-report.md` - Full audit report
