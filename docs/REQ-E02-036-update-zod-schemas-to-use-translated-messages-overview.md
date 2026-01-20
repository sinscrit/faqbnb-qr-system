# REQ-E02-036: Update Zod Schemas to Use Translated Messages - Implementation Overview

*Generated: 2026-01-20 12:30:00 UTC*
*Last Modified: 2026-01-20 12:30:00 UTC*

## Reference

- **Request**: REQ-E02-036 (Update Zod Schemas to Use Translated Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2J (Error Messages & Validation)
- **Task ID**: 2J.5
- **Size**: L (Large)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-032 (Create Errors Namespace Structure)
  - REQ-E02-035 (Create Centralized Error Message Utility)

## Summary

Update all Zod validation schemas throughout the FAQBNB application to use translated error messages from the internationalization system. This ensures validation feedback displays in the user's selected language instead of hardcoded English strings, creating a consistent, fully-localized user experience for form validation across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

## Goals

1. Design and document a standardized pattern for integrating translations into Zod schemas
2. Create utility functions that bridge Zod validation with the next-intl translation system
3. Update all existing Zod schemas in the codebase to use translated error messages
4. Ensure the pattern works seamlessly in both client-side (React components) and server-side (API routes) contexts
5. Support message interpolation for dynamic values (min/max lengths, field names, formats)
6. Maintain backward compatibility during the migration period
7. Create comprehensive documentation for future schema development

## Context from Implementation Plan

### Existing Infrastructure

The localization foundation from Epic 1 and related Epic 2 tasks provide:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages available |
| `errors` namespace | `/messages/en.json` | Structured (per REQ-E02-032) |
| Error translation utility | `/src/lib/i18n/error-translations.ts` | Created (per REQ-E02-035) |

### Current Validation Patterns in Codebase

The application currently uses two primary validation approaches:

#### 1. Manual Validation Functions (Most Common)

Most form validation is handled through custom `validateField()` functions with hardcoded English messages:

**LoginForm.tsx (lines 48-64):**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
      return undefined;
    case 'password':
      if (!value) return 'Password is required';
      if ((value as string).length < 6) return 'Password must be at least 6 characters';
      return undefined;
  }
};
```

**RegistrationForm.tsx (lines 212-246):**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
    case 'password':
      if (!value) return 'Password is required';
      const password = value as string;
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/\d/.test(password)) return 'Password must contain at least one number';
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
    case 'agreeToTerms':
      if (!value) return 'You must agree to the terms and conditions';
  }
};
```

**PropertyForm.tsx (lines 29-51):**
```typescript
const validateForm = (): boolean => {
  const newErrors: PropertyValidationErrors = {};
  if (!formData.nickname.trim()) {
    newErrors.nickname = 'Property nickname is required';
  } else if (formData.nickname.trim().length > 100) {
    newErrors.nickname = 'Property nickname must be 100 characters or less';
  }
  if (!formData.propertyTypeId) {
    newErrors.propertyTypeId = 'Property type is required';
  }
  if (formData.address && formData.address.length > 500) {
    newErrors.address = 'Address must be 500 characters or less';
  }
  // ...
};
```

#### 2. Validation Utility Functions

**ItemCapture validation.ts (lines 157-175, 332-355):**
```typescript
export function validateTitle(title: string): ValidationResult {
  const trimmedTitle = title?.trim() ?? '';
  if (trimmedTitle.length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  if (trimmedTitle.length > CAPTURE_CONSTRAINTS.title.maxLength) {
    return {
      isValid: false,
      error: `Title must be ${CAPTURE_CONSTRAINTS.title.maxLength} characters or less (current: ${trimmedTitle.length})`,
    };
  }
  return { isValid: true };
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }
  // ... more validation
  return { isValid: false, error: 'Invalid URL format' };
}
```

### Zod Usage Assessment

After thorough codebase analysis, **Zod is not currently installed or used** in the FAQBNB application. The package is not listed in `package.json` and no Zod imports were found in the codebase.

The validation patterns found use:
- Custom `validateField()` switch-case functions
- Custom validation utility modules
- Direct conditional checks with hardcoded error strings

### Task Scope Clarification

Given the absence of Zod, this task has two possible interpretations:

**Option A (Recommended):** Introduce Zod as a validation framework and create a standardized, i18n-integrated validation approach

**Option B:** Update the existing custom validation patterns to use translations without introducing Zod

This implementation overview covers **Option A** - introducing Zod with i18n integration, as it:
- Establishes a maintainable, type-safe validation pattern
- Aligns with industry best practices
- Creates reusable schema definitions
- Integrates cleanly with React Hook Form if later adopted
- Provides better TypeScript inference

## Implementation Approach

### Pattern Overview

Create a pattern where Zod schemas can receive translations dynamically. Since Zod schemas are typically defined at module scope (statically), we need a factory function pattern:

```typescript
// Schema factory that receives translation function
function createLoginSchema(t: (key: string, params?: Record<string, unknown>) => string) {
  return z.object({
    email: z.string()
      .min(1, t('form.required'))
      .email(t('form.email')),
    password: z.string()
      .min(1, t('form.required'))
      .min(8, t('form.password.tooShort', { min: 8 })),
  });
}

// Usage in component
function LoginForm() {
  const t = useTranslations('errors');
  const schema = createLoginSchema(t);
  // Use schema for validation
}
```

### Implementation Order

#### Phase 1: Foundation (Tasks 1-3)
1. Install Zod package
2. Create Zod-i18n integration utilities
3. Create base validation schema patterns

#### Phase 2: Schema Implementation (Tasks 4-9)
4. Create authentication schemas (login, registration, password reset)
5. Create property management schemas
6. Create item creation/editing schemas
7. Create article editing schemas
8. Create settings/preferences schemas
9. Create profile editing schemas

#### Phase 3: Component Integration (Tasks 10-12)
10. Update authentication forms to use schemas
11. Update property forms to use schemas
12. Update item and article forms to use schemas

#### Phase 4: Testing & Documentation (Tasks 13-15)
13. Write unit tests for schemas
14. Create integration tests
15. Create developer documentation

## Technical Specifications

### Zod-i18n Bridge Utility

**File: `/src/lib/validation/zod-i18n.ts`**

```typescript
/**
 * Zod-i18n Integration Utilities
 *
 * Provides utilities for creating Zod schemas with translated error messages.
 * Works with both client-side (useTranslations) and server-side (getTranslations) contexts.
 *
 * @module validation/zod-i18n
 * @see REQ-E02-036
 * @lastModified 2026-01-20
 */

import { z, ZodErrorMap, ZodIssueCode } from 'zod';

/**
 * Translation function type that matches next-intl signature
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Create a Zod error map that uses translations
 * This maps Zod's built-in error codes to translation keys
 */
export function createZodErrorMap(t: TranslationFunction): ZodErrorMap {
  return (issue, ctx) => {
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          return { message: t('form.required') };
        }
        return { message: t('form.invalidFormat') };

      case ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return { message: t('form.email') };
        }
        if (issue.validation === 'url') {
          return { message: t('form.invalidUrl') };
        }
        return { message: t('form.invalidFormat') };

      case ZodIssueCode.too_small:
        if (issue.type === 'string') {
          if (issue.minimum === 1) {
            return { message: t('form.required') };
          }
          return { message: t('form.minLength', { min: issue.minimum }) };
        }
        return { message: ctx.defaultError };

      case ZodIssueCode.too_big:
        if (issue.type === 'string') {
          return { message: t('form.maxLength', { max: issue.maximum }) };
        }
        return { message: ctx.defaultError };

      case ZodIssueCode.custom:
        // Custom errors should already have the message set
        return { message: issue.message || t('form.invalidFormat') };

      default:
        return { message: t('api.generic') };
    }
  };
}

/**
 * Configure Zod to use translations globally
 * Call this at app initialization with the translation function
 */
export function configureZodErrors(t: TranslationFunction): void {
  z.setErrorMap(createZodErrorMap(t));
}

/**
 * Parse with translated errors
 * Use this when you need to validate with a specific translation context
 */
export function parseWithTranslations<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  t: TranslationFunction
): z.infer<T> {
  return schema.parse(data, { errorMap: createZodErrorMap(t) });
}

/**
 * Safe parse with translated errors
 * Returns result object instead of throwing
 */
export function safeParseWithTranslations<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  t: TranslationFunction
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  return schema.safeParse(data, { errorMap: createZodErrorMap(t) });
}
```

### Schema Factory Utilities

**File: `/src/lib/validation/schema-factories.ts`**

```typescript
/**
 * Validation Schema Factory Functions
 *
 * Factory functions that create Zod schemas with translated error messages.
 * Each factory receives a translation function and returns a configured schema.
 *
 * @module validation/schema-factories
 * @see REQ-E02-036
 * @lastModified 2026-01-20
 */

import { z } from 'zod';
import type { TranslationFunction } from './zod-i18n';

// =============================================================================
// Authentication Schemas
// =============================================================================

/**
 * Create login form validation schema
 */
export function createLoginSchema(t: TranslationFunction) {
  return z.object({
    email: z.string()
      .min(1, t('form.required'))
      .email(t('form.email')),
    password: z.string()
      .min(1, t('form.required'))
      .min(6, t('form.password.tooShort', { min: 6 })),
    rememberMe: z.boolean().optional(),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Create registration form validation schema
 */
export function createRegistrationSchema(t: TranslationFunction) {
  return z.object({
    email: z.string()
      .min(1, t('form.required'))
      .email(t('form.email')),
    password: z.string()
      .min(1, t('form.required'))
      .min(8, t('form.password.tooShort', { min: 8 }))
      .regex(/[a-z]/, t('form.password.tooWeak'))
      .regex(/[A-Z]/, t('form.password.tooWeak'))
      .regex(/\d/, t('form.password.tooWeak')),
    confirmPassword: z.string()
      .min(1, t('form.required')),
    fullName: z.string()
      .min(2, t('form.minLength', { min: 2 }))
      .optional()
      .or(z.literal('')),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: t('form.termsRequired') })
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('form.password.mismatch'),
    path: ['confirmPassword'],
  });
}

export type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;

// =============================================================================
// Property Management Schemas
// =============================================================================

/**
 * Create property form validation schema
 */
export function createPropertySchema(t: TranslationFunction) {
  return z.object({
    nickname: z.string()
      .min(1, t('form.required'))
      .max(100, t('form.maxLength', { max: 100 })),
    propertyTypeId: z.string()
      .min(1, t('form.required')),
    address: z.string()
      .max(500, t('form.maxLength', { max: 500 }))
      .optional()
      .or(z.literal('')),
    userId: z.string().optional(),
  });
}

export type PropertyFormData = z.infer<ReturnType<typeof createPropertySchema>>;

// =============================================================================
// Item Capture Schemas
// =============================================================================

/**
 * Create item metadata validation schema
 */
export function createItemMetadataSchema(t: TranslationFunction) {
  return z.object({
    title: z.string()
      .min(1, t('form.required'))
      .max(200, t('form.maxLength', { max: 200 })),
    description: z.string()
      .max(5000, t('form.maxLength', { max: 5000 }))
      .optional(),
    roomId: z.string().optional(),
    propertyId: z.string()
      .min(1, t('form.required')),
    tags: z.array(z.string()).optional(),
  });
}

export type ItemMetadataFormData = z.infer<ReturnType<typeof createItemMetadataSchema>>;

/**
 * Create URL validation schema
 */
export function createUrlSchema(t: TranslationFunction) {
  return z.object({
    url: z.string()
      .min(1, t('form.required'))
      .url(t('form.invalidUrl'))
      .max(2048, t('form.maxLength', { max: 2048 })),
    title: z.string()
      .max(200, t('form.maxLength', { max: 200 }))
      .optional(),
  });
}

export type UrlFormData = z.infer<ReturnType<typeof createUrlSchema>>;

// =============================================================================
// Settings & Profile Schemas
// =============================================================================

/**
 * Create profile update validation schema
 */
export function createProfileSchema(t: TranslationFunction) {
  return z.object({
    fullName: z.string()
      .min(2, t('form.minLength', { min: 2 }))
      .max(100, t('form.maxLength', { max: 100 }))
      .optional()
      .or(z.literal('')),
    displayName: z.string()
      .max(50, t('form.maxLength', { max: 50 }))
      .optional(),
  });
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

/**
 * Create password change validation schema
 */
export function createPasswordChangeSchema(t: TranslationFunction) {
  return z.object({
    currentPassword: z.string()
      .min(1, t('form.required')),
    newPassword: z.string()
      .min(1, t('form.required'))
      .min(8, t('form.password.tooShort', { min: 8 }))
      .regex(/[a-z]/, t('form.password.tooWeak'))
      .regex(/[A-Z]/, t('form.password.tooWeak'))
      .regex(/\d/, t('form.password.tooWeak')),
    confirmNewPassword: z.string()
      .min(1, t('form.required')),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: t('form.password.mismatch'),
    path: ['confirmNewPassword'],
  });
}

export type PasswordChangeFormData = z.infer<ReturnType<typeof createPasswordChangeSchema>>;
```

### Validation Hook

**File: `/src/lib/validation/useValidation.ts`**

```typescript
/**
 * React Hook for Form Validation with Zod
 *
 * Provides a hook that creates translated Zod schemas for form validation.
 * Integrates with next-intl for i18n support.
 *
 * @module validation/useValidation
 * @see REQ-E02-036
 * @lastModified 2026-01-20
 */

'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import { safeParseWithTranslations, TranslationFunction } from './zod-i18n';
import * as schemas from './schema-factories';

/**
 * Hook for accessing translated validation schemas
 */
export function useValidationSchemas() {
  const t = useTranslations('errors') as TranslationFunction;

  return useMemo(() => ({
    login: schemas.createLoginSchema(t),
    registration: schemas.createRegistrationSchema(t),
    property: schemas.createPropertySchema(t),
    itemMetadata: schemas.createItemMetadataSchema(t),
    url: schemas.createUrlSchema(t),
    profile: schemas.createProfileSchema(t),
    passwordChange: schemas.createPasswordChangeSchema(t),
  }), [t]);
}

/**
 * Hook for validating form data with translations
 */
export function useFormValidation<T extends z.ZodSchema>(
  schemaFactory: (t: TranslationFunction) => T
) {
  const t = useTranslations('errors') as TranslationFunction;

  const schema = useMemo(() => schemaFactory(t), [t, schemaFactory]);

  const validate = useCallback((data: unknown) => {
    return safeParseWithTranslations(schema, data, t);
  }, [schema, t]);

  const validateField = useCallback((fieldName: keyof z.infer<T>, value: unknown) => {
    const fieldSchema = (schema.shape as Record<string, z.ZodSchema>)[fieldName as string];
    if (!fieldSchema) return { success: true, data: value };
    return safeParseWithTranslations(fieldSchema, value, t);
  }, [schema, t]);

  return {
    schema,
    validate,
    validateField,
  };
}

/**
 * Extract error messages from Zod validation result
 */
export function extractErrors<T>(
  result: z.SafeParseReturnType<unknown, T>
): Record<string, string> {
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
```

### Server-Side Validation Utility

**File: `/src/lib/validation/server-validation.ts`**

```typescript
/**
 * Server-Side Validation Utilities
 *
 * Provides validation functions for use in API routes and server components.
 * Uses next-intl/server for translations.
 *
 * @module validation/server-validation
 * @see REQ-E02-036
 * @lastModified 2026-01-20
 */

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { safeParseWithTranslations, TranslationFunction } from './zod-i18n';
import * as schemas from './schema-factories';

/**
 * Get translated validation schemas for server-side use
 */
export async function getValidationSchemas() {
  const t = await getTranslations('errors') as TranslationFunction;

  return {
    login: schemas.createLoginSchema(t),
    registration: schemas.createRegistrationSchema(t),
    property: schemas.createPropertySchema(t),
    itemMetadata: schemas.createItemMetadataSchema(t),
    url: schemas.createUrlSchema(t),
    profile: schemas.createProfileSchema(t),
    passwordChange: schemas.createPasswordChangeSchema(t),
  };
}

/**
 * Validate data server-side with translations
 */
export async function validateServerSide<T extends z.ZodSchema>(
  schemaFactory: (t: TranslationFunction) => T,
  data: unknown
): Promise<z.SafeParseReturnType<z.input<T>, z.output<T>>> {
  const t = await getTranslations('errors') as TranslationFunction;
  const schema = schemaFactory(t);
  return safeParseWithTranslations(schema, data, t);
}

/**
 * API route validation helper
 * Returns validated data or throws with structured error response
 */
export async function validateApiRequest<T extends z.ZodSchema>(
  schemaFactory: (t: TranslationFunction) => T,
  data: unknown
): Promise<z.infer<T>> {
  const result = await validateServerSide(schemaFactory, data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'general';
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    }

    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}

/**
 * Custom validation error class for API routes
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Module Index

**File: `/src/lib/validation/index.ts`**

```typescript
/**
 * Validation Module
 *
 * Centralized exports for Zod-based validation with i18n support.
 *
 * @module validation
 * @see REQ-E02-036
 * @lastModified 2026-01-20
 */

// Zod-i18n utilities
export {
  createZodErrorMap,
  configureZodErrors,
  parseWithTranslations,
  safeParseWithTranslations,
  type TranslationFunction,
} from './zod-i18n';

// Schema factories
export {
  createLoginSchema,
  createRegistrationSchema,
  createPropertySchema,
  createItemMetadataSchema,
  createUrlSchema,
  createProfileSchema,
  createPasswordChangeSchema,
  type LoginFormData,
  type RegistrationFormData,
  type PropertyFormData,
  type ItemMetadataFormData,
  type UrlFormData,
  type ProfileFormData,
  type PasswordChangeFormData,
} from './schema-factories';

// Client-side hooks
export {
  useValidationSchemas,
  useFormValidation,
  extractErrors,
} from './useValidation';

// Server-side utilities
export {
  getValidationSchemas,
  validateServerSide,
  validateApiRequest,
  ValidationError,
} from './server-validation';
```

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/validation/zod-i18n.ts` | Zod-i18n integration utilities |
| `/src/lib/validation/schema-factories.ts` | Schema factory functions with translations |
| `/src/lib/validation/useValidation.ts` | React hook for client-side validation |
| `/src/lib/validation/server-validation.ts` | Server-side validation utilities |
| `/src/lib/validation/index.ts` | Module exports |
| `/src/lib/validation/__tests__/zod-i18n.test.ts` | Unit tests for Zod-i18n utilities |
| `/src/lib/validation/__tests__/schema-factories.test.ts` | Unit tests for schema factories |
| `/docs/validation/zod-i18n-guide.md` | Developer documentation |

### Existing Files to Modify

#### Translation Files (Add Missing Keys)

| File | Modifications |
|------|---------------|
| `/messages/en.json` | Add `errors.form.termsRequired`, `errors.form.password.tooWeak` if missing |
| `/messages/fr.json` | Add corresponding French translations |
| `/messages/es.json` | Add corresponding Spanish translations |
| `/messages/de.json` | Add corresponding German translations |
| `/messages/nl.json` | Add corresponding Dutch translations |
| `/messages/it.json` | Add corresponding Italian translations |

#### Package Configuration

| File | Modifications |
|------|---------------|
| `/package.json` | Add `zod` dependency |

#### Component Files to Update (Phase 2)

| File | Current Pattern | Update Required |
|------|-----------------|-----------------|
| `/src/components/LoginForm.tsx` | Manual `validateField()` switch | Replace with `useValidationSchemas().login` |
| `/src/components/RegistrationForm.tsx` | Manual `validateField()` switch | Replace with `useValidationSchemas().registration` |
| `/src/components/PropertyForm.tsx` | Manual `validateForm()` | Replace with `useValidationSchemas().property` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Inline validation | Use property schema |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Inline validation | Use property schema |
| `/src/components/ItemCapture/utils/validation.ts` | Custom validation functions | Integrate with schema pattern |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | Manual URL validation | Use URL schema |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `createZodErrorMap()` | `zod-i18n.ts` | Create translated error map for Zod |
| `configureZodErrors()` | `zod-i18n.ts` | Configure Zod globally with translations |
| `parseWithTranslations()` | `zod-i18n.ts` | Parse data with translated errors |
| `safeParseWithTranslations()` | `zod-i18n.ts` | Safe parse with translated errors |
| `createLoginSchema()` | `schema-factories.ts` | Factory for login validation schema |
| `createRegistrationSchema()` | `schema-factories.ts` | Factory for registration validation schema |
| `createPropertySchema()` | `schema-factories.ts` | Factory for property validation schema |
| `createItemMetadataSchema()` | `schema-factories.ts` | Factory for item metadata validation |
| `createUrlSchema()` | `schema-factories.ts` | Factory for URL validation schema |
| `createProfileSchema()` | `schema-factories.ts` | Factory for profile update validation |
| `createPasswordChangeSchema()` | `schema-factories.ts` | Factory for password change validation |
| `useValidationSchemas()` | `useValidation.ts` | Hook returning all translated schemas |
| `useFormValidation()` | `useValidation.ts` | Hook for form validation with specific schema |
| `extractErrors()` | `useValidation.ts` | Extract error messages from Zod result |
| `getValidationSchemas()` | `server-validation.ts` | Get schemas server-side |
| `validateServerSide()` | `server-validation.ts` | Validate data on server |
| `validateApiRequest()` | `server-validation.ts` | API route validation helper |

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - Separate module for validation
- `/src/app/layout.tsx` - IntlProvider already configured
- `/src/types/index.ts` - Validation types separate from error types
- `/src/lib/error-utils.ts` - Separate concern (error handling vs validation)

## Usage Patterns

### Client Component Usage

```typescript
'use client';

import { useState } from 'react';
import { useValidationSchemas, extractErrors } from '@/lib/validation';

function LoginForm() {
  const schemas = useValidationSchemas();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = schemas.login.safeParse(formData);

    if (!result.success) {
      setErrors(extractErrors(result));
      return;
    }

    // Proceed with validated data
    submitLogin(result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

### Real-time Field Validation

```typescript
'use client';

import { useFormValidation } from '@/lib/validation';
import { createLoginSchema } from '@/lib/validation';

function LoginForm() {
  const { validateField } = useFormValidation(createLoginSchema);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBlur = (fieldName: 'email' | 'password', value: string) => {
    const result = validateField(fieldName, value);

    if (!result.success) {
      setErrors(prev => ({ ...prev, [fieldName]: result.error.issues[0].message }));
    } else {
      setErrors(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // ...
}
```

### Server-Side API Route Usage

```typescript
// /src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { validateApiRequest, createRegistrationSchema, ValidationError } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with translated errors
    const validatedData = await validateApiRequest(createRegistrationSchema, body);

    // Use validatedData...

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
```

## Migration Path

### Step 1: Install Zod and Create Utilities

```bash
npm install zod
```

Create the validation module files without modifying existing components.

### Step 2: Gradual Component Migration

Migrate components one at a time:

1. **Before:**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
  }
};
```

2. **After:**
```typescript
const schemas = useValidationSchemas();
const result = schemas.login.safeParse(formData);
const errors = extractErrors(result);
```

### Step 3: Remove Manual Validation Code

Once all forms are migrated, remove the old `validateField()` functions.

## Success Validation Checklist

### Module Creation
- [ ] `/src/lib/validation/zod-i18n.ts` created with Zod-i18n utilities
- [ ] `/src/lib/validation/schema-factories.ts` created with all schema factories
- [ ] `/src/lib/validation/useValidation.ts` created with React hooks
- [ ] `/src/lib/validation/server-validation.ts` created with server utilities
- [ ] `/src/lib/validation/index.ts` created with exports
- [ ] `zod` added to `package.json` dependencies

### Schema Implementation
- [ ] `createLoginSchema` validates email format and password length
- [ ] `createRegistrationSchema` validates all registration fields including password confirmation
- [ ] `createPropertySchema` validates nickname (required, max 100) and propertyTypeId (required)
- [ ] `createItemMetadataSchema` validates title and propertyId
- [ ] `createUrlSchema` validates URL format
- [ ] `createProfileSchema` validates name fields with length constraints
- [ ] `createPasswordChangeSchema` validates password change with confirmation

### Translation Integration
- [ ] All error messages use translation keys from `errors.form.*` namespace
- [ ] Dynamic values interpolate correctly (min, max lengths)
- [ ] Password validation uses `errors.form.password.*` keys
- [ ] Missing keys have been added to all 6 language files

### Testing
- [ ] Unit tests cover all schema factories
- [ ] Unit tests verify translation key usage
- [ ] Unit tests verify interpolation works correctly
- [ ] Integration tests verify client-side validation
- [ ] Integration tests verify server-side validation

### Documentation
- [ ] Developer guide created explaining the pattern
- [ ] Migration guide explains how to update existing forms
- [ ] API documentation for all exported functions
- [ ] Usage examples for common scenarios

## Dependencies

### Required (To Be Installed)
- `zod` - Schema validation library (^3.22.0)

### Existing (Already Available)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking
- React 18.x - React hooks support

## Risk Assessment

- **Risk Level**: Medium
- **Rationale**:
  - Introducing a new library (Zod) requires developer learning
  - Existing validation patterns need migration
  - Factory pattern may be unfamiliar to some developers

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Learning curve for Zod | Medium | Low | Comprehensive documentation and examples |
| Migration complexity | Medium | Medium | Gradual migration, side-by-side operation |
| Performance overhead | Low | Low | Zod is lightweight, memoization in hooks |
| Type inference issues | Low | Medium | Explicit type exports for all schemas |
| Missing translation keys | Medium | Low | Fallback to generic error messages |

## Estimated Effort

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Foundation | Tasks 1-3 | 4-6 hours |
| Phase 2: Schema Implementation | Tasks 4-9 | 4-6 hours |
| Phase 3: Component Integration | Tasks 10-12 | 6-8 hours |
| Phase 4: Testing & Documentation | Tasks 13-15 | 4-6 hours |
| **Total** | | **18-26 hours** |

## Future Considerations

### React Hook Form Integration

The schema pattern is compatible with React Hook Form's resolver:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useValidationSchemas } from '@/lib/validation';

function LoginForm() {
  const schemas = useValidationSchemas();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemas.login),
  });
  // ...
}
```

### Async Validation

For server-side async validation (e.g., checking email uniqueness):

```typescript
export function createRegistrationSchemaWithAsync(
  t: TranslationFunction,
  checkEmailExists: (email: string) => Promise<boolean>
) {
  return z.object({
    email: z.string()
      .email(t('form.email'))
      .refine(async (email) => {
        const exists = await checkEmailExists(email);
        return !exists;
      }, t('auth.emailTaken')),
    // ...
  });
}
```

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2J, Task 2J.5
- [REQ-E02-032: Create Errors Namespace Structure](/docs/REQ-E02-032-create-errors-namespace-structure-overview.md) - Prerequisite
- [REQ-E02-035: Create Centralized Error Message Utility](/docs/REQ-E02-035-create-centralized-error-message-utility-overview.md) - Related utility
- [Zod Documentation](https://zod.dev/) - Schema validation library
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - Translation framework
- [Existing Validation Utils](/src/components/ItemCapture/utils/validation.ts) - Current patterns

---

*End of Implementation Overview*
