# Zod Validation with i18n Integration Guide

**REQ-E02-036: Update Zod Schemas to Use Translated Messages**

Last Modified: 2026-01-22

## Overview

This guide documents the Zod validation system with next-intl integration for internationalized form validation messages in the FAQBNB project.

## Architecture

```
src/lib/validation/
├── index.ts              # Module exports
├── zod-i18n.ts          # Zod-i18n bridge utilities
├── schema-factories.ts   # Schema factory functions
├── useValidation.ts     # Client-side React hooks
├── server-validation.ts # Server-side validation utilities
└── __tests__/           # Test files
```

## Quick Start

### Client-Side Usage (React Components)

```tsx
'use client';

import { useFormValidation, extractErrors } from '@/lib/validation';

function LoginForm() {
  const { validate, validateField } = useFormValidation('login');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (data: FormData) => {
    const formData = {
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    const result = validate(formData);
    if (!result.success) {
      setErrors(extractErrors(result));
      return;
    }

    // Proceed with valid data
    submitForm(result.data);
  };

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value, formData);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onBlur={(e) => handleBlur('email', e.target.value)} />
      {errors.email && <span className="error">{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

### Server-Side Usage (API Routes)

```typescript
import { validateApiRequest, ValidationError } from '@/lib/validation';
import { createLoginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validated = await validateApiRequest(createLoginSchema, data);

    // Use validated.email, validated.password
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

## Available Schema Factories

| Factory | Form Type | Required Fields |
|---------|-----------|-----------------|
| `createLoginSchema` | Login | email, password |
| `createRegistrationSchema` | Registration | email, password, confirmPassword, agreeToTerms |
| `createPropertySchema` | Property | nickname, propertyTypeId |
| `createItemMetadataSchema` | Item Metadata | title, propertyId |
| `createUrlSchema` | URL Input | url |
| `createProfileSchema` | Profile | (all optional) |
| `createPasswordChangeSchema` | Password Change | currentPassword, newPassword, confirmNewPassword |

## Translation Keys

All validation messages use keys from the `errors` namespace in message files.

### Required Keys in `/messages/{locale}.json`

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Must be no more than {max} characters",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "password": {
        "tooShort": "Password must be at least {min} characters",
        "needsUppercase": "Password must contain at least one uppercase letter",
        "needsLowercase": "Password must contain at least one lowercase letter",
        "needsNumber": "Password must contain at least one number"
      },
      "passwordMismatch": "Passwords do not match",
      "termsRequired": "You must agree to the terms and conditions"
    },
    "api": {
      "generic": "An unexpected error occurred"
    }
  }
}
```

## Hook API Reference

### `useValidationSchemas()`

Returns all validation schemas pre-configured with translations.

```typescript
const schemas = useValidationSchemas();
// schemas.login, schemas.registration, schemas.property, etc.
```

### `useFormValidation(schemaName)`

Returns validation utilities for a specific form type.

```typescript
const { schema, validate, validateField } = useFormValidation('login');

// Validate entire form
const result = validate({ email, password });

// Validate single field
const error = validateField('email', emailValue, formData);
```

### `extractErrors(result)`

Converts Zod SafeParseResult to a flat error object.

```typescript
const result = schema.safeParse(data);
const errors = extractErrors(result);
// { email: 'Invalid email', password: 'Too short' }
```

## Server Validation API Reference

### `getValidationSchemas()`

Async function to get all schemas with server-side translations.

```typescript
const schemas = await getValidationSchemas();
const result = schemas.login.safeParse(data);
```

### `validateServerSide(schemaFactory, data)`

Validates data using a schema factory.

```typescript
const result = await validateServerSide(createLoginSchema, data);
```

### `validateApiRequest(schemaFactory, data)`

Validates and throws `ValidationError` on failure.

```typescript
try {
  const validated = await validateApiRequest(createLoginSchema, data);
} catch (error) {
  if (error instanceof ValidationError) {
    // error.errors contains field-to-message mapping
  }
}
```

## Creating Custom Schemas

To add a new schema factory:

1. Add the factory function to `schema-factories.ts`:

```typescript
export function createMyCustomSchema(t: TranslationFunction) {
  return z.object({
    myField: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .max(100, { error: t('form.maxLength', { max: 100 }) }),
  });
}
```

2. Export from `index.ts`:

```typescript
export { createMyCustomSchema } from './schema-factories';
```

3. Add to hooks if needed in `useValidation.ts`:

```typescript
export function useValidationSchemas() {
  return useMemo(() => ({
    // ... existing schemas
    myCustom: schemas.createMyCustomSchema(t),
  }), [t]);
}
```

4. Add any new translation keys to all message files.

## Migration from Inline Validation

### Before (Inline Validation)

```tsx
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!email) {
    setError('Email is required');
    return;
  }
  if (!email.includes('@')) {
    setError('Invalid email format');
    return;
  }
  // ...
};
```

### After (Zod with i18n)

```tsx
import { useFormValidation, extractErrors } from '@/lib/validation';

const { validate } = useFormValidation('login');
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  const result = validate({ email, password });
  if (!result.success) {
    setErrors(extractErrors(result));
    return;
  }
  // Proceed with result.data
};
```

## Testing

### Unit Testing Schemas

```typescript
import { createLoginSchema } from '@/lib/validation';

const mockT = (key: string) => `[${key}]`;
const schema = createLoginSchema(mockT);

test('validates email', () => {
  const result = schema.safeParse({ email: 'invalid', password: '123456' });
  expect(result.success).toBe(false);
});
```

### Testing Components with Validation

```tsx
import { vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `[${key}]`,
}));

// Now test components that use useFormValidation
```

## Zod v4 Notes

This project uses Zod v4, which has different API from v3:

- Error customization uses `{ error: 'message' }` syntax at schema level
- No `errorMap` option in parse/safeParse
- Use `z.string({ error: t('key') })` for required field messages
- Use `.min(1, { error: t('key') })` for validation rule messages

## Related Documentation

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Zod v4 Documentation](https://zod.dev/)
- REQ-E02-036 detailed specification
