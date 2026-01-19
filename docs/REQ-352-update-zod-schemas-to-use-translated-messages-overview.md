# REQ-352: Update Zod Schemas to Use Translated Messages

## Implementation Overview Document

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-352
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.5
**Size:** L (Large)
**Priority:** High (Cross-cutting concern)
**Depends On:** REQ-351 (Centralized Error Message Utility)

---

## 1. Summary

Update all Zod validation schemas throughout the FAQBNB application to use translated error messages via the centralized error translation utility (REQ-351). This ensures form validation feedback appears in the user's preferred language, creating a consistent localized experience across all forms including authentication, item management, property management, link handling, and administrative operations.

---

## 2. Background & Context

### Current State

The application currently does **not** use Zod for form validation. Instead, it uses manual validation functions with hardcoded English error messages:

**Current Validation Patterns Found:**

1. **`src/components/RegistrationForm.tsx`** - Manual `validateField()` function with hardcoded messages:
   ```typescript
   // Current pattern
   case 'email':
     if (!value) return 'Email is required';
     if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
   ```

2. **`src/components/LoginForm.tsx`** - Similar manual validation:
   ```typescript
   case 'password':
     if (!value) return 'Password is required';
     if ((value as string).length < 6) return 'Password must be at least 6 characters';
   ```

3. **`src/components/ItemForm.tsx`** - `validateForm()` function with inline validation:
   ```typescript
   if (!formData.name.trim()) {
     newErrors.name = 'Name is required';
   }
   ```

4. **`src/components/PropertyForm.tsx`** - Similar manual validation patterns

5. **API Routes** - Various routes in `/src/app/api/` use inline validation with hardcoded messages

### Why Introduce Zod?

Introducing Zod as the standard validation library provides:

1. **Type-safe schema definitions** - Zod infers TypeScript types from schemas
2. **Declarative validation** - Cleaner, more maintainable validation code
3. **Consistent error handling** - Standardized error format across all forms
4. **Reusable schemas** - Schemas can be shared between client and server
5. **Integration with React Hook Form** - If adopted in the future
6. **Better DX** - Schema composition, refinements, and transforms

### Dependencies from Epic 1 & Sub-Epic 2J

| Dependency | Status | Purpose |
|------------|--------|---------|
| `next-intl` package | Complete | Translation framework |
| Translation files in `/messages/*.json` | Complete | Error messages storage |
| `useTranslations('errors')` hook | Complete | Client-side translations |
| `getTranslations('errors')` | Complete | Server-side translations |
| REQ-351: Centralized Error Utility | **Required** | Error translation integration |

### Related Implementation Plan

From **Plan-111-L10N-Epic2-Static-UI-Translation.md**, Task 2J.5 specifies:
- Update Zod schemas to use translated messages
- Integrate with centralized error translation utility
- Support both client and server validation contexts

---

## 3. Requirements Analysis

### Functional Requirements

From REQ-352 acceptance criteria:

| # | Requirement | Implementation Approach |
|---|-------------|------------------------|
| 1 | Identify all files with Zod schema definitions | Codebase audit (currently none - will be new) |
| 2 | Review each Zod schema for custom error messages | N/A - creating new schemas |
| 3 | Catalog common validation error types | Map to errors.validation namespace |
| 4 | Standard approach for integrating translation keys | Schema factory pattern with translation function |
| 5 | Translation keys in errors.validation namespace | Extend messages/\*.json files |
| 6 | Required field errors with interpolation | `"errors.validation.required": "{field} is required"` |
| 7 | String length constraints with dynamic values | `"errors.validation.minLength": "Must be at least {min} characters"` |
| 8 | Format validation (email, URL) | Predefined format error keys |
| 9 | Custom business rule validations | Specific keys per domain |
| 10 | Update schemas to reference translation keys | Zod `.message()` and `errorMap` |
| 11 | Utility for accessing translations in Zod contexts | `createTranslatedSchema()` factory |
| 12 | Server-side validation with translations | Accept locale parameter |
| 13 | Client-side validation with React | `useZodTranslations()` hook |
| 14 | Refine() with translated messages | Custom refinement error map |
| 15 | Array/object nested validation | Recursive translation support |
| 16 | Conditional validation branches | Path-aware error messages |
| 17 | Dynamic value interpolation | ICU format support |
| 18 | Field-specific vs schema-level errors | Error path handling |
| 19 | Reusable schema components | Common validators module |
| 20 | Backward compatibility | Gradual migration strategy |
| 21 | TypeScript types for validation errors | Type exports |
| 22 | Documentation with examples | JSDoc and usage patterns |
| 23 | Test all forms in all languages | End-to-end validation |
| 24 | Translations for 5 non-English languages | fr, es, de, nl, it |
| 25 | Unit tests for localized error messages | Vitest tests |
| 26 | Performance measurement | Benchmark validation overhead |
| 27 | SSR context handling | Request-based locale detection |
| 28 | Edge cases (missing translations, language switching) | Fallback strategies |

---

## 4. Technical Design

### 4.1 Package Installation

Zod needs to be added to the project:

```bash
npm install zod
```

### 4.2 File Structure

```
src/
├── lib/
│   ├── validation/
│   │   ├── index.ts                    # NEW: Main exports
│   │   ├── schemas/
│   │   │   ├── index.ts                # NEW: Schema exports
│   │   │   ├── auth.ts                 # NEW: Auth validation schemas
│   │   │   ├── item.ts                 # NEW: Item validation schemas
│   │   │   ├── property.ts             # NEW: Property validation schemas
│   │   │   ├── link.ts                 # NEW: Link validation schemas
│   │   │   └── common.ts               # NEW: Reusable field validators
│   │   ├── translations.ts             # NEW: Zod translation integration
│   │   └── __tests__/
│   │       ├── schemas.test.ts         # NEW: Schema unit tests
│   │       └── translations.test.ts    # NEW: Translation tests
│   └── i18n/
│       └── error-translations.ts       # MODIFY: Add Zod integration
├── types/
│   └── validation.ts                   # NEW: Validation type exports
messages/
├── en.json                             # MODIFY: Add validation namespace
├── fr.json                             # MODIFY: Add French validation
├── es.json                             # MODIFY: Add Spanish validation
├── de.json                             # MODIFY: Add German validation
├── nl.json                             # MODIFY: Add Dutch validation
└── it.json                             # MODIFY: Add Italian validation
```

### 4.3 Translation Namespace Extension

Add `errors.validation` namespace to all message files:

```json
{
  "errors": {
    "validation": {
      "required": "{field} is required",
      "requiredField": "This field is required",
      "email": "Please enter a valid email address",
      "url": "Please enter a valid URL",
      "uuid": "Please enter a valid identifier",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Must be no more than {max} characters",
      "exactLength": "Must be exactly {length} characters",
      "minValue": "Must be at least {min}",
      "maxValue": "Must be no more than {max}",
      "positiveNumber": "Must be a positive number",
      "integer": "Must be a whole number",
      "invalidFormat": "Invalid format",
      "invalidType": "Invalid value type",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match",
        "noLowercase": "Password must contain at least one lowercase letter",
        "noUppercase": "Password must contain at least one uppercase letter",
        "noNumber": "Password must contain at least one number",
        "noSpecial": "Password must contain at least one special character"
      },
      "name": {
        "required": "Name is required",
        "tooShort": "Name must be at least {min} characters"
      },
      "item": {
        "publicIdRequired": "Public ID is required",
        "publicIdInvalid": "Public ID must be a valid UUID format",
        "nameRequired": "Item name is required",
        "propertyRequired": "Property selection is required",
        "duplicateName": "An item with this name already exists"
      },
      "link": {
        "titleRequired": "Link title is required",
        "urlRequired": "Link URL is required",
        "urlInvalid": "Please enter a valid URL",
        "thumbnailInvalid": "Please enter a valid thumbnail URL"
      },
      "property": {
        "nameRequired": "Property name is required",
        "typeRequired": "Property type is required"
      },
      "terms": {
        "required": "You must agree to the terms and conditions"
      }
    }
  }
}
```

### 4.4 Zod Translation Integration

```typescript
// /src/lib/validation/translations.ts

import { z, ZodErrorMap, ZodIssueCode } from 'zod';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * Translation function type for Zod error messages
 */
type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Create a Zod error map that uses translated messages
 */
export function createTranslatedErrorMap(t: TranslationFn): ZodErrorMap {
  return (issue, ctx) => {
    let message: string;

    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          message = t('validation.requiredField');
        } else {
          message = t('validation.invalidType');
        }
        break;

      case ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          message = t('validation.email');
        } else if (issue.validation === 'url') {
          message = t('validation.url');
        } else if (issue.validation === 'uuid') {
          message = t('validation.uuid');
        } else {
          message = t('validation.invalidFormat');
        }
        break;

      case ZodIssueCode.too_small:
        if (issue.type === 'string') {
          message = t('validation.minLength', { min: issue.minimum });
        } else if (issue.type === 'number') {
          message = t('validation.minValue', { min: issue.minimum });
        } else {
          message = ctx.defaultError;
        }
        break;

      case ZodIssueCode.too_big:
        if (issue.type === 'string') {
          message = t('validation.maxLength', { max: issue.maximum });
        } else if (issue.type === 'number') {
          message = t('validation.maxValue', { max: issue.maximum });
        } else {
          message = ctx.defaultError;
        }
        break;

      case ZodIssueCode.custom:
        // Custom errors should already have their message set
        message = issue.message || ctx.defaultError;
        break;

      default:
        message = ctx.defaultError;
    }

    return { message };
  };
}

/**
 * Client-side hook for Zod validation with translations
 * @example
 * const { createSchema, validate } = useZodTranslations();
 * const schema = createSchema((t) => z.object({
 *   email: z.string().email({ message: t('validation.email') }),
 * }));
 */
export function useZodTranslations() {
  const t = useTranslations('errors');

  const errorMap = createTranslatedErrorMap(t);

  return {
    /**
     * Get translation function for use in schema definitions
     */
    t,

    /**
     * The Zod error map for this locale
     */
    errorMap,

    /**
     * Create a schema with translated error messages
     */
    createSchema: <T extends z.ZodTypeAny>(
      schemaFn: (t: TranslationFn) => T
    ): T => schemaFn(t),

    /**
     * Validate data with translated error messages
     */
    validate: <T extends z.ZodTypeAny>(
      schema: T,
      data: unknown
    ): z.SafeParseReturnType<z.input<T>, z.output<T>> => {
      return schema.safeParse(data, { errorMap });
    },

    /**
     * Parse data with translated error messages (throws on error)
     */
    parse: <T extends z.ZodTypeAny>(
      schema: T,
      data: unknown
    ): z.output<T> => {
      return schema.parse(data, { errorMap });
    },
  };
}

/**
 * Server-side Zod validation with translations
 * @example
 * const { validate } = await getZodTranslations();
 * const result = validate(loginSchema, requestBody);
 */
export async function getZodTranslations() {
  const t = await getTranslations('errors');

  const errorMap = createTranslatedErrorMap(t);

  return {
    t,
    errorMap,
    createSchema: <T extends z.ZodTypeAny>(
      schemaFn: (t: TranslationFn) => T
    ): T => schemaFn(t),
    validate: <T extends z.ZodTypeAny>(
      schema: T,
      data: unknown
    ): z.SafeParseReturnType<z.input<T>, z.output<T>> => {
      return schema.safeParse(data, { errorMap });
    },
    parse: <T extends z.ZodTypeAny>(
      schema: T,
      data: unknown
    ): z.output<T> => {
      return schema.parse(data, { errorMap });
    },
  };
}

/**
 * Convert Zod errors to field error map for forms
 */
export function zodErrorsToFieldMap(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.errors) {
    const path = issue.path.join('.');
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}
```

### 4.5 Reusable Schema Components

```typescript
// /src/lib/validation/schemas/common.ts

import { z } from 'zod';

/**
 * Factory functions for common validators with translation support
 */

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Email validator factory
 */
export const emailSchema = (t: TranslationFn) =>
  z.string()
    .min(1, { message: t('validation.requiredField') })
    .email({ message: t('validation.email') });

/**
 * Password validator factory with strength requirements
 */
export const passwordSchema = (t: TranslationFn, minLength = 8) =>
  z.string()
    .min(1, { message: t('validation.password.required') })
    .min(minLength, { message: t('validation.password.tooShort', { min: minLength }) })
    .refine(
      (val) => /[a-z]/.test(val),
      { message: t('validation.password.noLowercase') }
    )
    .refine(
      (val) => /[A-Z]/.test(val),
      { message: t('validation.password.noUppercase') }
    )
    .refine(
      (val) => /\d/.test(val),
      { message: t('validation.password.noNumber') }
    );

/**
 * URL validator factory
 */
export const urlSchema = (t: TranslationFn, required = true) => {
  const base = z.string().url({ message: t('validation.url') });
  return required
    ? base.min(1, { message: t('validation.requiredField') })
    : base.optional().or(z.literal(''));
};

/**
 * UUID validator factory
 */
export const uuidSchema = (t: TranslationFn) =>
  z.string()
    .min(1, { message: t('validation.requiredField') })
    .uuid({ message: t('validation.uuid') });

/**
 * Required string with min length
 */
export const requiredStringSchema = (
  t: TranslationFn,
  minLength = 1,
  maxLength?: number
) => {
  let schema = z.string()
    .min(minLength, {
      message: minLength === 1
        ? t('validation.requiredField')
        : t('validation.minLength', { min: minLength })
    });

  if (maxLength) {
    schema = schema.max(maxLength, {
      message: t('validation.maxLength', { max: maxLength })
    });
  }

  return schema;
};
```

### 4.6 Domain-Specific Schemas

```typescript
// /src/lib/validation/schemas/auth.ts

import { z } from 'zod';
import { emailSchema, passwordSchema, requiredStringSchema } from './common';

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Login form schema factory
 */
export const createLoginSchema = (t: TranslationFn) =>
  z.object({
    email: emailSchema(t),
    password: z.string().min(1, { message: t('validation.password.required') }),
    rememberMe: z.boolean().optional(),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Registration form schema factory
 */
export const createRegistrationSchema = (t: TranslationFn) =>
  z.object({
    email: emailSchema(t),
    password: passwordSchema(t),
    confirmPassword: z.string().min(1, { message: t('validation.password.required') }),
    fullName: requiredStringSchema(t, 2).optional().or(z.literal('')),
    agreeToTerms: z.boolean().refine(
      (val) => val === true,
      { message: t('validation.terms.required') }
    ),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    }
  );

export type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;
```

```typescript
// /src/lib/validation/schemas/item.ts

import { z } from 'zod';
import { uuidSchema, requiredStringSchema, urlSchema } from './common';

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Link validation schema factory
 */
export const createLinkSchema = (t: TranslationFn) =>
  z.object({
    id: z.string().optional(),
    title: requiredStringSchema(t).refine(
      (val) => val.trim().length > 0,
      { message: t('validation.link.titleRequired') }
    ),
    linkType: z.enum(['youtube', 'pdf', 'image', 'text']),
    url: z.string()
      .min(1, { message: t('validation.link.urlRequired') })
      .url({ message: t('validation.link.urlInvalid') }),
    thumbnailUrl: urlSchema(t, false),
    displayOrder: z.number().int().min(0),
  });

export type LinkFormData = z.infer<ReturnType<typeof createLinkSchema>>;

/**
 * Item form schema factory
 */
export const createItemSchema = (t: TranslationFn) =>
  z.object({
    publicId: z.string()
      .min(1, { message: t('validation.item.publicIdRequired') })
      .uuid({ message: t('validation.item.publicIdInvalid') }),
    name: requiredStringSchema(t).refine(
      (val) => val.trim().length > 0,
      { message: t('validation.item.nameRequired') }
    ),
    description: z.string().optional(),
    qrCodeUrl: urlSchema(t, false),
    propertyId: z.string()
      .min(1, { message: t('validation.item.propertyRequired') }),
    links: z.array(createLinkSchema(t)).optional(),
  });

export type ItemFormData = z.infer<ReturnType<typeof createItemSchema>>;
```

```typescript
// /src/lib/validation/schemas/property.ts

import { z } from 'zod';
import { requiredStringSchema } from './common';

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Property form schema factory
 */
export const createPropertySchema = (t: TranslationFn) =>
  z.object({
    nickname: requiredStringSchema(t).refine(
      (val) => val.trim().length > 0,
      { message: t('validation.property.nameRequired') }
    ),
    propertyTypeId: z.string()
      .min(1, { message: t('validation.property.typeRequired') }),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
  });

export type PropertyFormData = z.infer<ReturnType<typeof createPropertySchema>>;
```

### 4.7 Component Migration Pattern

**Before (manual validation):**
```typescript
// Current pattern in LoginForm.tsx
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
    default:
      return undefined;
  }
};
```

**After (Zod with translations):**
```typescript
// New pattern with Zod
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createLoginSchema } from '@/lib/validation/schemas/auth';

function LoginForm() {
  const { t, validate } = useZodTranslations();
  const loginSchema = createLoginSchema(t);

  const validateForm = (): boolean => {
    const result = validate(loginSchema, formData);

    if (!result.success) {
      setErrors(zodErrorsToFieldMap(result.error));
      return false;
    }

    setErrors({});
    return true;
  };

  // ... rest of component
}
```

---

## 5. Implementation Tasks

### Phase 1: Foundation (Required First)

#### Task 1.1: Install Zod Package
- Add `zod` to package.json dependencies
- Run `npm install`
- Verify installation

#### Task 1.2: Create Validation Module Structure
- Create `/src/lib/validation/` directory
- Create `index.ts` with main exports
- Create `translations.ts` with Zod translation integration

#### Task 1.3: Extend Translation Files
- Add `errors.validation` namespace to `/messages/en.json`
- Generate translations for all 5 non-English languages

### Phase 2: Schema Creation

#### Task 2.1: Create Common Validators
- Create `/src/lib/validation/schemas/common.ts`
- Implement reusable field validators:
  - `emailSchema()`
  - `passwordSchema()`
  - `urlSchema()`
  - `uuidSchema()`
  - `requiredStringSchema()`

#### Task 2.2: Create Auth Schemas
- Create `/src/lib/validation/schemas/auth.ts`
- Implement `createLoginSchema()`
- Implement `createRegistrationSchema()`

#### Task 2.3: Create Item Schemas
- Create `/src/lib/validation/schemas/item.ts`
- Implement `createItemSchema()`
- Implement `createLinkSchema()`

#### Task 2.4: Create Property Schemas
- Create `/src/lib/validation/schemas/property.ts`
- Implement `createPropertySchema()`

### Phase 3: Component Migration

#### Task 3.1: Migrate LoginForm
- Update `/src/components/LoginForm.tsx`
- Replace manual validation with Zod schema
- Verify error messages display in all languages

#### Task 3.2: Migrate RegistrationForm
- Update `/src/components/RegistrationForm.tsx`
- Replace manual validation with Zod schema
- Handle password strength and confirmation

#### Task 3.3: Migrate ItemForm
- Update `/src/components/ItemForm.tsx`
- Replace manual validation with Zod schema
- Handle nested link validation

#### Task 3.4: Migrate PropertyForm
- Update `/src/components/PropertyForm.tsx`
- Replace manual validation with Zod schema

### Phase 4: API Route Integration

#### Task 4.1: Create Server-Side Validation Utilities
- Implement server-side schema validation helpers
- Handle locale detection from request headers

#### Task 4.2: Update API Routes (Representative Sample)
- Update `/src/app/api/auth/register/route.ts`
- Update `/src/app/api/admin/items/route.ts`
- Update `/src/app/api/admin/properties/route.ts`

### Phase 5: Testing & Documentation

#### Task 5.1: Write Unit Tests
- Create `/src/lib/validation/__tests__/schemas.test.ts`
- Create `/src/lib/validation/__tests__/translations.test.ts`
- Test all schemas produce expected errors
- Test translations for all locales

#### Task 5.2: Integration Testing
- Test forms in all 6 languages
- Verify error messages render correctly
- Test language switching behavior

#### Task 5.3: Documentation
- Add JSDoc comments to all exports
- Create usage examples in code comments

---

## 6. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/validation/index.ts` | Main validation module exports |
| `/src/lib/validation/translations.ts` | Zod translation integration |
| `/src/lib/validation/schemas/index.ts` | Schema exports |
| `/src/lib/validation/schemas/common.ts` | Reusable field validators |
| `/src/lib/validation/schemas/auth.ts` | Authentication schemas |
| `/src/lib/validation/schemas/item.ts` | Item/Link schemas |
| `/src/lib/validation/schemas/property.ts` | Property schemas |
| `/src/lib/validation/__tests__/schemas.test.ts` | Schema unit tests |
| `/src/lib/validation/__tests__/translations.test.ts` | Translation tests |
| `/src/types/validation.ts` | Validation type exports |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/package.json` | Add zod dependency |
| `/messages/en.json` | Add errors.validation namespace (~40 keys) |
| `/messages/fr.json` | Add French validation translations |
| `/messages/es.json` | Add Spanish validation translations |
| `/messages/de.json` | Add German validation translations |
| `/messages/nl.json` | Add Dutch validation translations |
| `/messages/it.json` | Add Italian validation translations |
| `/src/components/LoginForm.tsx` | Migrate to Zod validation |
| `/src/components/RegistrationForm.tsx` | Migrate to Zod validation |
| `/src/components/ItemForm.tsx` | Migrate to Zod validation |
| `/src/components/PropertyForm.tsx` | Migrate to Zod validation |
| `/src/types/index.ts` | Re-export validation types |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `createTranslatedErrorMap()` | `/src/lib/validation/translations.ts` | Zod error map factory |
| `useZodTranslations()` | `/src/lib/validation/translations.ts` | Client-side hook |
| `getZodTranslations()` | `/src/lib/validation/translations.ts` | Server-side function |
| `zodErrorsToFieldMap()` | `/src/lib/validation/translations.ts` | Error format conversion |
| `emailSchema()` | `/src/lib/validation/schemas/common.ts` | Email validator factory |
| `passwordSchema()` | `/src/lib/validation/schemas/common.ts` | Password validator factory |
| `urlSchema()` | `/src/lib/validation/schemas/common.ts` | URL validator factory |
| `uuidSchema()` | `/src/lib/validation/schemas/common.ts` | UUID validator factory |
| `requiredStringSchema()` | `/src/lib/validation/schemas/common.ts` | String validator factory |
| `createLoginSchema()` | `/src/lib/validation/schemas/auth.ts` | Login form schema |
| `createRegistrationSchema()` | `/src/lib/validation/schemas/auth.ts` | Registration form schema |
| `createItemSchema()` | `/src/lib/validation/schemas/item.ts` | Item form schema |
| `createLinkSchema()` | `/src/lib/validation/schemas/item.ts` | Link form schema |
| `createPropertySchema()` | `/src/lib/validation/schemas/property.ts` | Property form schema |

---

## 7. Integration Points

### With REQ-351 (Centralized Error Utility)

The Zod translation integration should leverage the error codes and patterns from REQ-351:

```typescript
import { ERROR_CODES } from '@/lib/i18n/error-codes';

// Use same error keys for consistency
const errorMap: ZodErrorMap = (issue, ctx) => {
  if (issue.code === ZodIssueCode.invalid_string && issue.validation === 'email') {
    return { message: t(ERROR_CODES.FORM.EMAIL_INVALID) };
  }
  // ...
};
```

### With Form Components

Forms should migrate from manual validation to Zod:

```typescript
// Pattern for migration
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createLoginSchema } from '@/lib/validation/schemas/auth';

function MyForm() {
  const { t, validate } = useZodTranslations();
  const schema = createLoginSchema(t);

  const handleSubmit = () => {
    const result = validate(schema, formData);
    if (!result.success) {
      setErrors(zodErrorsToFieldMap(result.error));
      return;
    }
    // Proceed with validated data
  };
}
```

### With API Routes

Server-side validation in API routes:

```typescript
// /src/app/api/auth/register/route.ts
import { getZodTranslations } from '@/lib/validation';
import { createRegistrationSchema } from '@/lib/validation/schemas/auth';

export async function POST(request: Request) {
  const { t, validate } = await getZodTranslations();
  const schema = createRegistrationSchema(t);

  const body = await request.json();
  const result = validate(schema, body);

  if (!result.success) {
    return NextResponse.json({
      success: false,
      errors: result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    }, { status: 400 });
  }

  // Proceed with validated data: result.data
}
```

---

## 8. Testing Strategy

### Unit Tests

**Schema Tests:**
```typescript
// /src/lib/validation/__tests__/schemas.test.ts
describe('createLoginSchema', () => {
  it('validates valid login data', () => {
    const t = (key: string) => key; // Mock translation
    const schema = createLoginSchema(t);
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const t = (key: string) => key;
    const schema = createLoginSchema(t);
    const result = schema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain('email');
  });
});
```

**Translation Tests:**
```typescript
// /src/lib/validation/__tests__/translations.test.ts
describe('createTranslatedErrorMap', () => {
  it('returns translated message for invalid email', () => {
    const mockT = vi.fn((key) => `Translated: ${key}`);
    const errorMap = createTranslatedErrorMap(mockT);

    const issue = {
      code: ZodIssueCode.invalid_string,
      validation: 'email',
      path: ['email'],
      message: ''
    };

    const result = errorMap(issue, { defaultError: 'default' });
    expect(result.message).toBe('Translated: validation.email');
    expect(mockT).toHaveBeenCalledWith('validation.email');
  });
});
```

### Integration Tests

- Test LoginForm validation in all 6 languages
- Test RegistrationForm password validation with translations
- Test ItemForm link validation
- Test language switching updates error messages

---

## 9. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `zod` | ^3.x | Schema validation library (NEW) |
| `next-intl` | ^4.x | Translation framework (existing) |
| `vitest` | ^4.x | Unit testing (existing) |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing form validation | Medium | High | Gradual migration, maintain backward compatibility |
| Missing translations | Low | Medium | Fallback to English, build-time checks |
| Performance overhead from schema creation | Low | Low | Memoize schemas per locale |
| Type inference complexity | Medium | Low | Explicit type exports, documentation |
| SSR hydration mismatches | Low | Medium | Consistent locale handling |
| Bundle size increase | Low | Low | Zod tree-shakes well (~8KB) |

---

## 11. Acceptance Criteria Checklist

- [ ] Zod package installed and configured
- [ ] Validation translation module created (`/src/lib/validation/`)
- [ ] `useZodTranslations()` hook works in client components
- [ ] `getZodTranslations()` works in server components
- [ ] Common validators created (email, password, url, uuid)
- [ ] Auth schemas created (login, registration)
- [ ] Item schemas created (item, link)
- [ ] Property schema created
- [ ] `errors.validation` namespace added to all 6 language files
- [ ] LoginForm migrated to Zod validation
- [ ] RegistrationForm migrated to Zod validation
- [ ] ItemForm migrated to Zod validation
- [ ] PropertyForm migrated to Zod validation
- [ ] Validation errors display in correct language
- [ ] Dynamic interpolation works (e.g., min length values)
- [ ] Password strength validation with translations
- [ ] Nested validation (links in items) works
- [ ] Unit tests pass for all schemas
- [ ] Translation tests pass for all locales
- [ ] Documentation with JSDoc comments
- [ ] TypeScript types exported correctly
- [ ] No regression in existing form functionality
- [ ] Performance acceptable (no noticeable delay)

---

## 12. References

- [REQ-352 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [REQ-351: Centralized Error Message Utility](/docs/REQ-351-create-centralized-error-message-utility-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Zod Documentation](https://zod.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing form components](/src/components/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2J.5: Update Zod Schemas to Use Translated Messages*
