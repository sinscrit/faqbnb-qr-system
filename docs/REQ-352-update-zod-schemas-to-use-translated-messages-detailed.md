# REQ-352: Update Zod Schemas to Use Translated Messages - Detailed Task Breakdown

## Document Information

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-352
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.5
**Size:** L (Large)
**Priority:** High (Cross-cutting concern)
**Depends On:** REQ-351 (Centralized Error Message Utility)
**Overview Document:** [REQ-352-update-zod-schemas-to-use-translated-messages-overview.md](./REQ-352-update-zod-schemas-to-use-translated-messages-overview.md)

---

## Executive Summary

This document provides actionable implementation tasks for introducing Zod validation schemas with translated error messages to the FAQBNB application. The current codebase uses manual validation functions with hardcoded English error messages in forms like `LoginForm.tsx`, `RegistrationForm.tsx`, `ItemForm.tsx`, and `PropertyForm.tsx`. This task introduces Zod as the standard validation library and integrates it with the next-intl translation system from Epic 1.

**Key Insight:** The codebase currently does **NOT** use Zod. This is a greenfield implementation that will:
1. Install Zod as a new dependency
2. Create a translation-integrated validation module
3. Create domain-specific schemas (auth, items, properties)
4. Migrate existing forms from manual validation to Zod

---

## Task Breakdown

### Phase 1: Foundation Setup

#### Task 1.1: Install Zod Package

**Objective:** Add Zod to project dependencies

**Actions:**
1. Run `npm install zod`
2. Verify installation in `package.json`
3. Verify TypeScript recognizes Zod types

**Files Modified:**
- `/package.json` - Add `zod` dependency
- `/package-lock.json` - Auto-updated

**Verification:**
```bash
npm ls zod
```

**Estimated Complexity:** XS
**Depends On:** None

---

#### Task 1.2: Create Validation Module Directory Structure

**Objective:** Set up the file structure for the validation module

**Actions:**
1. Create directory `/src/lib/validation/`
2. Create directory `/src/lib/validation/schemas/`
3. Create directory `/src/lib/validation/__tests__/`

**Files Created:**
- `/src/lib/validation/` (directory)
- `/src/lib/validation/schemas/` (directory)
- `/src/lib/validation/__tests__/` (directory)

**Verification:** Directories exist and are empty

**Estimated Complexity:** XS
**Depends On:** Task 1.1

---

#### Task 1.3: Create Zod Translation Integration Module

**Objective:** Create the core translation integration for Zod

**Actions:**
1. Create `/src/lib/validation/translations.ts`
2. Implement `createTranslatedErrorMap()` function
3. Implement `useZodTranslations()` client-side hook
4. Implement `getZodTranslations()` server-side function
5. Implement `zodErrorsToFieldMap()` utility

**File to Create:** `/src/lib/validation/translations.ts`

**Implementation Details:**

```typescript
// /src/lib/validation/translations.ts

import { z, ZodErrorMap, ZodIssueCode } from 'zod';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * Translation function type for Zod error messages
 */
export type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Create a Zod error map that uses translated messages
 * Maps Zod issue codes to translation keys in the errors.validation namespace
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
        } else if (issue.type === 'array') {
          message = t('validation.minItems', { min: issue.minimum });
        } else {
          message = ctx.defaultError;
        }
        break;

      case ZodIssueCode.too_big:
        if (issue.type === 'string') {
          message = t('validation.maxLength', { max: issue.maximum });
        } else if (issue.type === 'number') {
          message = t('validation.maxValue', { max: issue.maximum });
        } else if (issue.type === 'array') {
          message = t('validation.maxItems', { max: issue.maximum });
        } else {
          message = ctx.defaultError;
        }
        break;

      case ZodIssueCode.custom:
        // Custom errors should already have their message set via refine()
        message = issue.message || ctx.defaultError;
        break;

      case ZodIssueCode.invalid_enum_value:
        message = t('validation.invalidOption');
        break;

      default:
        message = ctx.defaultError;
    }

    return { message };
  };
}

/**
 * Client-side hook for Zod validation with translations
 *
 * @example
 * function MyForm() {
 *   const { t, validate, errorMap } = useZodTranslations();
 *   const schema = createLoginSchema(t);
 *
 *   const handleSubmit = () => {
 *     const result = validate(schema, formData);
 *     if (!result.success) {
 *       setErrors(zodErrorsToFieldMap(result.error));
 *     }
 *   };
 * }
 */
export function useZodTranslations() {
  const t = useTranslations('errors');
  const errorMap = createTranslatedErrorMap(t);

  return {
    /** Translation function for use in schema definitions */
    t,

    /** The Zod error map configured for current locale */
    errorMap,

    /** Create a schema with translated error messages */
    createSchema: <T extends z.ZodTypeAny>(
      schemaFn: (t: TranslationFn) => T
    ): T => schemaFn(t),

    /** Validate data with translated error messages */
    validate: <T extends z.ZodTypeAny>(
      schema: T,
      data: unknown
    ): z.SafeParseReturnType<z.input<T>, z.output<T>> => {
      return schema.safeParse(data, { errorMap });
    },

    /** Parse data with translated error messages (throws on error) */
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
 *
 * @example
 * // In API route
 * export async function POST(request: Request) {
 *   const { t, validate } = await getZodTranslations();
 *   const schema = createRegistrationSchema(t);
 *   const result = validate(schema, await request.json());
 * }
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
 * Convert Zod validation errors to a field-keyed error map for forms
 *
 * @example
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const fieldErrors = zodErrorsToFieldMap(result.error);
 *   // { email: "Invalid email", password: "Too short" }
 * }
 */
export function zodErrorsToFieldMap(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.errors) {
    const path = issue.path.join('.');
    // Only set first error for each field
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

/**
 * Convert Zod errors to array format for API responses
 */
export function zodErrorsToArray(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.errors.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
}
```

**Verification:**
- TypeScript compiles without errors
- Functions are properly typed

**Estimated Complexity:** M
**Depends On:** Task 1.1, Task 1.2

---

#### Task 1.4: Extend Translation Files with Validation Namespace

**Objective:** Add `errors.validation` namespace to all language files

**Actions:**
1. Update `/messages/en.json` with validation error messages
2. Generate translations for fr, es, de, nl, it

**File to Modify:** `/messages/en.json`

**Add the following to the `errors` object:**

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
      "minItems": "Must have at least {min} items",
      "maxItems": "Must have no more than {max} items",
      "positiveNumber": "Must be a positive number",
      "integer": "Must be a whole number",
      "invalidFormat": "Invalid format",
      "invalidType": "Invalid value type",
      "invalidOption": "Please select a valid option",
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
        "tooShort": "Name must be at least {min} characters",
        "tooLong": "Name must be no more than {max} characters"
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
        "nameTooLong": "Property name must be 100 characters or less",
        "typeRequired": "Property type is required",
        "addressTooLong": "Address must be 500 characters or less"
      },
      "terms": {
        "required": "You must agree to the terms and conditions"
      }
    }
  }
}
```

**Files to Modify:**
- `/messages/en.json` - Add validation namespace
- `/messages/fr.json` - Add French validation translations
- `/messages/es.json` - Add Spanish validation translations
- `/messages/de.json` - Add German validation translations
- `/messages/nl.json` - Add Dutch validation translations
- `/messages/it.json` - Add Italian validation translations

**Verification:**
- All 6 language files have identical key structures
- No missing keys in any language file

**Estimated Complexity:** M
**Depends On:** None (can be done in parallel)

---

### Phase 2: Schema Creation

#### Task 2.1: Create Common Validators Module

**Objective:** Create reusable field validator factories

**File to Create:** `/src/lib/validation/schemas/common.ts`

**Implementation:**

```typescript
// /src/lib/validation/schemas/common.ts

import { z } from 'zod';
import type { TranslationFn } from '../translations';

/**
 * Email validator factory
 * Validates required email format
 */
export const emailSchema = (t: TranslationFn) =>
  z.string()
    .min(1, { message: t('validation.requiredField') })
    .email({ message: t('validation.email') });

/**
 * Optional email validator factory
 */
export const optionalEmailSchema = (t: TranslationFn) =>
  z.string()
    .email({ message: t('validation.email') })
    .optional()
    .or(z.literal(''));

/**
 * Password validator factory with configurable strength requirements
 * @param t Translation function
 * @param options Configuration for password requirements
 */
export const passwordSchema = (
  t: TranslationFn,
  options: {
    minLength?: number;
    requireLowercase?: boolean;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  } = {}
) => {
  const {
    minLength = 8,
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = false
  } = options;

  let schema = z.string()
    .min(1, { message: t('validation.password.required') })
    .min(minLength, { message: t('validation.password.tooShort', { min: minLength }) });

  if (requireLowercase) {
    schema = schema.refine(
      (val) => /[a-z]/.test(val),
      { message: t('validation.password.noLowercase') }
    );
  }

  if (requireUppercase) {
    schema = schema.refine(
      (val) => /[A-Z]/.test(val),
      { message: t('validation.password.noUppercase') }
    );
  }

  if (requireNumber) {
    schema = schema.refine(
      (val) => /\d/.test(val),
      { message: t('validation.password.noNumber') }
    );
  }

  if (requireSpecial) {
    schema = schema.refine(
      (val) => /[^a-zA-Z0-9]/.test(val),
      { message: t('validation.password.noSpecial') }
    );
  }

  return schema;
};

/**
 * Simple password validator (just required, min length)
 * For login forms where we don't enforce strength
 */
export const simplePasswordSchema = (t: TranslationFn, minLength = 6) =>
  z.string()
    .min(1, { message: t('validation.password.required') })
    .min(minLength, { message: t('validation.password.tooShort', { min: minLength }) });

/**
 * URL validator factory
 * @param required Whether the URL is required
 */
export const urlSchema = (t: TranslationFn, required = true) => {
  if (required) {
    return z.string()
      .min(1, { message: t('validation.requiredField') })
      .url({ message: t('validation.url') });
  }
  return z.string()
    .url({ message: t('validation.url') })
    .optional()
    .or(z.literal(''));
};

/**
 * UUID validator factory
 */
export const uuidSchema = (t: TranslationFn) =>
  z.string()
    .min(1, { message: t('validation.requiredField') })
    .uuid({ message: t('validation.uuid') });

/**
 * Required string validator with optional length constraints
 */
export const requiredStringSchema = (
  t: TranslationFn,
  options: {
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
  } = {}
) => {
  const { minLength = 1, maxLength, fieldName } = options;

  let schema = z.string();

  if (minLength === 1) {
    schema = schema.min(1, {
      message: fieldName
        ? t('validation.required', { field: fieldName })
        : t('validation.requiredField')
    });
  } else {
    schema = schema.min(minLength, {
      message: t('validation.minLength', { min: minLength })
    });
  }

  if (maxLength) {
    schema = schema.max(maxLength, {
      message: t('validation.maxLength', { max: maxLength })
    });
  }

  return schema;
};

/**
 * Optional string validator with length constraints
 */
export const optionalStringSchema = (
  t: TranslationFn,
  options: { maxLength?: number } = {}
) => {
  const { maxLength } = options;

  let schema = z.string();

  if (maxLength) {
    schema = schema.max(maxLength, {
      message: t('validation.maxLength', { max: maxLength })
    });
  }

  return schema.optional().or(z.literal(''));
};

/**
 * Boolean checkbox validator (for terms acceptance)
 */
export const requiredCheckboxSchema = (t: TranslationFn, errorKey = 'validation.terms.required') =>
  z.boolean().refine(
    (val) => val === true,
    { message: t(errorKey) }
  );
```

**Verification:**
- All validators compile without TypeScript errors
- Validators produce correct error messages

**Estimated Complexity:** M
**Depends On:** Task 1.3

---

#### Task 2.2: Create Auth Schemas Module

**Objective:** Create validation schemas for authentication forms

**File to Create:** `/src/lib/validation/schemas/auth.ts`

**Implementation:**

```typescript
// /src/lib/validation/schemas/auth.ts

import { z } from 'zod';
import {
  emailSchema,
  simplePasswordSchema,
  passwordSchema,
  requiredStringSchema,
  requiredCheckboxSchema,
  optionalStringSchema
} from './common';
import type { TranslationFn } from '../translations';

/**
 * Login form schema factory
 * Matches current LoginForm.tsx validation requirements
 */
export const createLoginSchema = (t: TranslationFn) =>
  z.object({
    email: emailSchema(t),
    password: simplePasswordSchema(t, 6), // Current: min 6 chars
    rememberMe: z.boolean().optional(),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Registration form schema factory
 * Matches current RegistrationForm.tsx validation requirements
 */
export const createRegistrationSchema = (t: TranslationFn) =>
  z.object({
    email: emailSchema(t),
    password: passwordSchema(t, {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumber: true,
      requireSpecial: false
    }),
    confirmPassword: z.string().min(1, { message: t('validation.password.required') }),
    fullName: optionalStringSchema(t).refine(
      (val) => !val || val.length >= 2,
      { message: t('validation.name.tooShort', { min: 2 }) }
    ),
    agreeToTerms: requiredCheckboxSchema(t),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    }
  );

export type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;

/**
 * Password reset request schema
 */
export const createPasswordResetRequestSchema = (t: TranslationFn) =>
  z.object({
    email: emailSchema(t),
  });

export type PasswordResetRequestData = z.infer<ReturnType<typeof createPasswordResetRequestSchema>>;

/**
 * Password reset completion schema
 */
export const createPasswordResetSchema = (t: TranslationFn) =>
  z.object({
    password: passwordSchema(t),
    confirmPassword: z.string().min(1, { message: t('validation.password.required') }),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    }
  );

export type PasswordResetData = z.infer<ReturnType<typeof createPasswordResetSchema>>;
```

**Verification:**
- Schemas match current form validation requirements
- Type exports work correctly

**Estimated Complexity:** M
**Depends On:** Task 2.1

---

#### Task 2.3: Create Item Schemas Module

**Objective:** Create validation schemas for item and link forms

**File to Create:** `/src/lib/validation/schemas/item.ts`

**Implementation:**

```typescript
// /src/lib/validation/schemas/item.ts

import { z } from 'zod';
import { uuidSchema, requiredStringSchema, urlSchema, optionalStringSchema } from './common';
import type { TranslationFn } from '../translations';

/**
 * Link types enum matching the application's LinkType
 */
export const linkTypeEnum = z.enum(['youtube', 'pdf', 'image', 'text']);

/**
 * Link validation schema factory
 * Matches current ItemForm.tsx link validation
 */
export const createLinkSchema = (t: TranslationFn) =>
  z.object({
    id: z.string().optional(),
    title: z.string()
      .min(1, { message: t('validation.link.titleRequired') })
      .refine(
        (val) => val.trim().length > 0,
        { message: t('validation.link.titleRequired') }
      ),
    linkType: linkTypeEnum,
    url: z.string()
      .min(1, { message: t('validation.link.urlRequired') })
      .url({ message: t('validation.link.urlInvalid') }),
    thumbnailUrl: z.string()
      .url({ message: t('validation.link.thumbnailInvalid') })
      .optional()
      .or(z.literal('')),
    displayOrder: z.number().int().min(0),
  });

export type LinkFormData = z.infer<ReturnType<typeof createLinkSchema>>;

/**
 * Item form schema factory
 * Matches current ItemForm.tsx validation requirements
 */
export const createItemSchema = (t: TranslationFn) =>
  z.object({
    publicId: z.string()
      .min(1, { message: t('validation.item.publicIdRequired') })
      .regex(
        /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/,
        { message: t('validation.item.publicIdInvalid') }
      ),
    name: z.string()
      .min(1, { message: t('validation.item.nameRequired') })
      .refine(
        (val) => val.trim().length > 0,
        { message: t('validation.item.nameRequired') }
      ),
    description: z.string().optional(),
    qrCodeUrl: z.string()
      .url({ message: t('validation.url') })
      .optional()
      .or(z.literal('')),
    propertyId: z.string()
      .min(1, { message: t('validation.item.propertyRequired') }),
    links: z.array(createLinkSchema(t)).optional(),
  });

export type ItemFormData = z.infer<ReturnType<typeof createItemSchema>>;

/**
 * Partial item schema for updates (all fields optional except id)
 */
export const createUpdateItemSchema = (t: TranslationFn) =>
  createItemSchema(t).partial().extend({
    id: z.string().min(1),
  });

export type UpdateItemFormData = z.infer<ReturnType<typeof createUpdateItemSchema>>;
```

**Verification:**
- Schema validates UUID format correctly
- Link array validation works
- Types match existing ItemForm interface

**Estimated Complexity:** M
**Depends On:** Task 2.1

---

#### Task 2.4: Create Property Schemas Module

**Objective:** Create validation schemas for property forms

**File to Create:** `/src/lib/validation/schemas/property.ts`

**Implementation:**

```typescript
// /src/lib/validation/schemas/property.ts

import { z } from 'zod';
import { requiredStringSchema, optionalStringSchema } from './common';
import type { TranslationFn } from '../translations';

/**
 * Property form schema factory
 * Matches current PropertyForm.tsx validation requirements
 */
export const createPropertySchema = (t: TranslationFn) =>
  z.object({
    nickname: z.string()
      .min(1, { message: t('validation.property.nameRequired') })
      .max(100, { message: t('validation.property.nameTooLong') })
      .refine(
        (val) => val.trim().length > 0,
        { message: t('validation.property.nameRequired') }
      ),
    propertyTypeId: z.string()
      .min(1, { message: t('validation.property.typeRequired') }),
    address: z.string()
      .max(500, { message: t('validation.property.addressTooLong') })
      .optional()
      .or(z.literal('')),
  });

export type PropertyFormData = z.infer<ReturnType<typeof createPropertySchema>>;

/**
 * Property schema with user selection (for admin forms)
 */
export const createAdminPropertySchema = (t: TranslationFn) =>
  createPropertySchema(t).extend({
    userId: z.string().optional(),
  });

export type AdminPropertyFormData = z.infer<ReturnType<typeof createAdminPropertySchema>>;

/**
 * Property update schema
 */
export const createUpdatePropertySchema = (t: TranslationFn) =>
  createPropertySchema(t).partial().extend({
    id: z.string().min(1),
  });

export type UpdatePropertyFormData = z.infer<ReturnType<typeof createUpdatePropertySchema>>;
```

**Verification:**
- Matches current PropertyForm validation logic
- Length constraints are enforced correctly

**Estimated Complexity:** S
**Depends On:** Task 2.1

---

#### Task 2.5: Create Schema Exports Index

**Objective:** Create barrel exports for all schemas

**File to Create:** `/src/lib/validation/schemas/index.ts`

**Implementation:**

```typescript
// /src/lib/validation/schemas/index.ts

// Common validators
export * from './common';

// Domain-specific schemas
export * from './auth';
export * from './item';
export * from './property';
```

**Verification:**
- All schemas importable from single path

**Estimated Complexity:** XS
**Depends On:** Tasks 2.1-2.4

---

#### Task 2.6: Create Main Validation Module Export

**Objective:** Create the main entry point for the validation module

**File to Create:** `/src/lib/validation/index.ts`

**Implementation:**

```typescript
// /src/lib/validation/index.ts

// Core translation integration
export {
  useZodTranslations,
  getZodTranslations,
  createTranslatedErrorMap,
  zodErrorsToFieldMap,
  zodErrorsToArray,
  type TranslationFn
} from './translations';

// All schemas
export * from './schemas';

// Re-export zod for convenience
export { z } from 'zod';
export type { ZodError, ZodIssue } from 'zod';
```

**Verification:**
- All exports accessible from `/src/lib/validation`

**Estimated Complexity:** XS
**Depends On:** Task 2.5, Task 1.3

---

### Phase 3: Form Migration

#### Task 3.1: Migrate LoginForm to Zod Validation

**Objective:** Replace manual validation in LoginForm with Zod

**File to Modify:** `/src/components/LoginForm.tsx`

**Current State Analysis:**
- Lines 48-64: Manual `validateField()` function
- Lines 67-78: Manual `validateForm()` function
- Hardcoded English error messages

**Changes Required:**
1. Add imports for validation module
2. Replace `validateField()` with Zod schema
3. Replace `validateForm()` with Zod validation
4. Update error handling to use `zodErrorsToFieldMap()`

**Migration Pattern:**

```typescript
// Add imports
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createLoginSchema, type LoginFormData } from '@/lib/validation/schemas/auth';

// Inside component
const { t, validate } = useZodTranslations();
const loginSchema = createLoginSchema(t);

// Replace validateForm function
const validateForm = (): boolean => {
  const result = validate(loginSchema, formData);

  if (!result.success) {
    setErrors(zodErrorsToFieldMap(result.error));
    return false;
  }

  setErrors({});
  return true;
};

// Remove old validateField function
```

**Verification:**
- Form validates correctly in English
- Form validates correctly in other languages
- Error messages display on correct fields
- No regression in form functionality

**Estimated Complexity:** M
**Depends On:** Tasks 2.2, 2.6

---

#### Task 3.2: Migrate RegistrationForm to Zod Validation

**Objective:** Replace manual validation in RegistrationForm with Zod

**File to Modify:** `/src/components/RegistrationForm.tsx`

**Current State Analysis:**
- Lines 155-207: Password strength calculation (keep for UI indicator)
- Lines 212-245: Manual `validateField()` function
- Lines 248-271: Manual `validateForm()` function
- Complex conditional validation based on registration method

**Changes Required:**
1. Add imports for validation module
2. Keep password strength UI calculation (separate from validation)
3. Replace validation with Zod schema
4. Handle conditional validation for Gmail/email-password methods

**Migration Pattern:**

```typescript
// Add imports
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createRegistrationSchema, type RegistrationFormData } from '@/lib/validation/schemas/auth';

// Inside component
const { t, validate } = useZodTranslations();
const registrationSchema = createRegistrationSchema(t);

// Create partial schema for Google registration (no password required)
const googleRegistrationSchema = z.object({
  email: emailSchema(t),
  agreeToTerms: requiredCheckboxSchema(t),
});

// Replace validateForm function
const validateForm = (): boolean => {
  // Use different schema based on registration method
  const schema = showEmailPasswordFields ? registrationSchema : googleRegistrationSchema;
  const dataToValidate = showEmailPasswordFields
    ? formData
    : { email: formData.email, agreeToTerms: formData.agreeToTerms };

  const result = schema.safeParse(dataToValidate);

  if (!result.success) {
    const fieldErrors = zodErrorsToFieldMap(result.error);
    setErrors(fieldErrors);
    return false;
  }

  setErrors({});
  return true;
};
```

**Note:** Keep the `calculatePasswordStrength()` function for the UI password strength indicator - this is separate from validation.

**Verification:**
- Email-password registration validates correctly
- Google registration validates correctly (only email and terms)
- Password strength indicator still works
- Password mismatch error shows on confirmPassword field
- Terms checkbox validation works

**Estimated Complexity:** L
**Depends On:** Tasks 2.2, 2.6

---

#### Task 3.3: Migrate ItemForm to Zod Validation

**Objective:** Replace manual validation in ItemForm with Zod

**File to Modify:** `/src/components/ItemForm.tsx`

**Current State Analysis:**
- Lines 67-104: Manual `validateForm()` function
- Complex nested link validation with index-based error keys

**Changes Required:**
1. Add imports for validation module
2. Replace validation with Zod schema
3. Handle nested link validation errors
4. Map Zod paths to current error key format (`link-0-title`, etc.)

**Migration Pattern:**

```typescript
// Add imports
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createItemSchema, type ItemFormData } from '@/lib/validation/schemas/item';

// Inside component
const { t, validate } = useZodTranslations();
const itemSchema = createItemSchema(t);

// Custom error mapping for nested links
const mapItemErrors = (zodError: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of zodError.errors) {
    const path = issue.path;

    // Handle nested link errors: ["links", 0, "title"] -> "link-0-title"
    if (path[0] === 'links' && typeof path[1] === 'number') {
      const index = path[1];
      const field = path[2];
      errors[`link-${index}-${field}`] = issue.message;
    } else {
      // Regular field error
      errors[path.join('.')] = issue.message;
    }
  }

  return errors;
};

// Replace validateForm function
const validateForm = () => {
  const dataToValidate = {
    ...formData,
    links: links.length > 0 ? links : undefined
  };

  const result = itemSchema.safeParse(dataToValidate);

  if (!result.success) {
    setErrors(mapItemErrors(result.error));
    return false;
  }

  setErrors({});
  return true;
};
```

**Verification:**
- Item basic fields validate correctly
- Nested link validation works
- Error keys match existing error display logic
- Link add/remove doesn't break validation

**Estimated Complexity:** L
**Depends On:** Tasks 2.3, 2.6

---

#### Task 3.4: Migrate PropertyForm to Zod Validation

**Objective:** Replace manual validation in PropertyForm with Zod

**File to Modify:** `/src/components/PropertyForm.tsx`

**Current State Analysis:**
- Lines 29-51: Manual `validateForm()` function
- Character length validation for nickname and address

**Changes Required:**
1. Add imports for validation module
2. Replace validation with Zod schema

**Migration Pattern:**

```typescript
// Add imports
import { useZodTranslations, zodErrorsToFieldMap } from '@/lib/validation';
import { createPropertySchema, type PropertyFormData } from '@/lib/validation/schemas/property';

// Inside component
const { t, validate } = useZodTranslations();
const propertySchema = createPropertySchema(t);

// Replace validateForm function
const validateForm = (): boolean => {
  const result = validate(propertySchema, formData);

  if (!result.success) {
    const fieldErrors = zodErrorsToFieldMap(result.error);
    setErrors(fieldErrors);
    return false;
  }

  setErrors({});
  return true;
};
```

**Verification:**
- Property name validation works
- Property type validation works
- Address length validation works
- Character counters still display correctly

**Estimated Complexity:** S
**Depends On:** Tasks 2.4, 2.6

---

### Phase 4: Testing

#### Task 4.1: Create Schema Unit Tests

**Objective:** Write unit tests for all validation schemas

**File to Create:** `/src/lib/validation/__tests__/schemas.test.ts`

**Test Cases:**

```typescript
// /src/lib/validation/__tests__/schemas.test.ts

import { describe, it, expect, vi } from 'vitest';
import {
  createLoginSchema,
  createRegistrationSchema,
  createItemSchema,
  createLinkSchema,
  createPropertySchema
} from '../schemas';

// Mock translation function
const mockT = vi.fn((key: string, params?: Record<string, unknown>) => {
  if (params) {
    return `${key}:${JSON.stringify(params)}`;
  }
  return key;
});

describe('createLoginSchema', () => {
  const schema = createLoginSchema(mockT);

  it('validates valid login data', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = schema.safeParse({
      email: '',
      password: 'password123'
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain('email');
  });

  it('rejects invalid email format', () => {
    const result = schema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: '12345'
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain('password');
  });
});

describe('createRegistrationSchema', () => {
  const schema = createRegistrationSchema(mockT);

  it('validates complete registration data', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'John Doe',
      agreeToTerms: true
    });
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeToTerms: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects password mismatch', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'DifferentPassword',
      agreeToTerms: true
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors.some(e => e.path.includes('confirmPassword'))).toBe(true);
  });

  it('rejects unchecked terms', () => {
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      agreeToTerms: false
    });
    expect(result.success).toBe(false);
  });
});

describe('createItemSchema', () => {
  const schema = createItemSchema(mockT);

  it('validates valid item data', () => {
    const result = schema.safeParse({
      publicId: '8d678bd0-e4f7-495f-b4cd-43756813e23a',
      name: 'Test Item',
      propertyId: 'property-123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID format', () => {
    const result = schema.safeParse({
      publicId: 'invalid-uuid',
      name: 'Test Item',
      propertyId: 'property-123'
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain('publicId');
  });

  it('validates item with links', () => {
    const result = schema.safeParse({
      publicId: '8d678bd0-e4f7-495f-b4cd-43756813e23a',
      name: 'Test Item',
      propertyId: 'property-123',
      links: [{
        title: 'User Manual',
        linkType: 'pdf',
        url: 'https://example.com/manual.pdf',
        displayOrder: 0
      }]
    });
    expect(result.success).toBe(true);
  });
});

describe('createPropertySchema', () => {
  const schema = createPropertySchema(mockT);

  it('validates valid property data', () => {
    const result = schema.safeParse({
      nickname: 'Beach House',
      propertyTypeId: 'type-123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects nickname over 100 characters', () => {
    const result = schema.safeParse({
      nickname: 'a'.repeat(101),
      propertyTypeId: 'type-123'
    });
    expect(result.success).toBe(false);
  });

  it('rejects address over 500 characters', () => {
    const result = schema.safeParse({
      nickname: 'Beach House',
      propertyTypeId: 'type-123',
      address: 'a'.repeat(501)
    });
    expect(result.success).toBe(false);
  });
});
```

**Verification:**
- All tests pass
- Coverage includes edge cases

**Estimated Complexity:** M
**Depends On:** Phase 2 complete

---

#### Task 4.2: Create Translation Integration Tests

**Objective:** Write tests for the translation integration

**File to Create:** `/src/lib/validation/__tests__/translations.test.ts`

**Test Cases:**

```typescript
// /src/lib/validation/__tests__/translations.test.ts

import { describe, it, expect, vi } from 'vitest';
import { z, ZodIssueCode } from 'zod';
import {
  createTranslatedErrorMap,
  zodErrorsToFieldMap,
  zodErrorsToArray
} from '../translations';

describe('createTranslatedErrorMap', () => {
  const mockT = vi.fn((key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'validation.requiredField': 'This field is required',
      'validation.email': 'Invalid email',
      'validation.minLength': `Min ${params?.min} chars`,
      'validation.maxLength': `Max ${params?.max} chars`,
    };
    return translations[key] || key;
  });

  const errorMap = createTranslatedErrorMap(mockT);

  it('returns translated message for required field', () => {
    const issue = {
      code: ZodIssueCode.invalid_type,
      expected: 'string',
      received: 'undefined',
      path: ['email'],
      message: ''
    };

    const result = errorMap(issue, { defaultError: 'default' });
    expect(result.message).toBe('This field is required');
    expect(mockT).toHaveBeenCalledWith('validation.requiredField');
  });

  it('returns translated message for invalid email', () => {
    const issue = {
      code: ZodIssueCode.invalid_string,
      validation: 'email' as const,
      path: ['email'],
      message: ''
    };

    const result = errorMap(issue, { defaultError: 'default' });
    expect(result.message).toBe('Invalid email');
  });

  it('interpolates min length parameter', () => {
    const issue = {
      code: ZodIssueCode.too_small,
      type: 'string' as const,
      minimum: 8,
      inclusive: true,
      exact: false,
      path: ['password'],
      message: ''
    };

    const result = errorMap(issue, { defaultError: 'default' });
    expect(mockT).toHaveBeenCalledWith('validation.minLength', { min: 8 });
  });
});

describe('zodErrorsToFieldMap', () => {
  it('converts Zod errors to field map', () => {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['email'],
        message: 'Email required'
      },
      {
        code: 'custom',
        path: ['password'],
        message: 'Password required'
      }
    ]);

    const result = zodErrorsToFieldMap(error);
    expect(result).toEqual({
      email: 'Email required',
      password: 'Password required'
    });
  });

  it('handles nested paths', () => {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['user', 'profile', 'name'],
        message: 'Name required'
      }
    ]);

    const result = zodErrorsToFieldMap(error);
    expect(result).toEqual({
      'user.profile.name': 'Name required'
    });
  });

  it('only keeps first error per field', () => {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['email'],
        message: 'First error'
      },
      {
        code: 'custom',
        path: ['email'],
        message: 'Second error'
      }
    ]);

    const result = zodErrorsToFieldMap(error);
    expect(result.email).toBe('First error');
  });
});

describe('zodErrorsToArray', () => {
  it('converts errors to array format', () => {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['email'],
        message: 'Email required'
      }
    ]);

    const result = zodErrorsToArray(error);
    expect(result).toEqual([
      { field: 'email', message: 'Email required' }
    ]);
  });
});
```

**Verification:**
- Translation integration tests pass
- Error mapping works correctly

**Estimated Complexity:** M
**Depends On:** Task 1.3

---

#### Task 4.3: Manual Integration Testing

**Objective:** Manually test all forms in all languages

**Test Checklist:**

| Form | Language | Test Cases |
|------|----------|------------|
| LoginForm | en | Empty email, invalid email, empty password, short password |
| LoginForm | fr | Same as above - verify French messages |
| LoginForm | es | Same as above - verify Spanish messages |
| LoginForm | de | Same as above - verify German messages |
| LoginForm | nl | Same as above - verify Dutch messages |
| LoginForm | it | Same as above - verify Italian messages |
| RegistrationForm | en | All validation cases including password strength |
| RegistrationForm | fr-it | Spot check translations |
| ItemForm | en | UUID, name, property, nested links |
| ItemForm | fr-it | Spot check translations |
| PropertyForm | en | Name, type, length constraints |
| PropertyForm | fr-it | Spot check translations |

**Verification:**
- All forms display translated error messages
- Language switching updates messages
- No layout breaks from longer translations

**Estimated Complexity:** M
**Depends On:** Phase 3 complete

---

### Phase 5: Types Export and Documentation

#### Task 5.1: Create Validation Types File

**Objective:** Export validation types for use throughout the application

**File to Create:** `/src/types/validation.ts`

**Implementation:**

```typescript
// /src/types/validation.ts

// Re-export types from validation module
export type {
  TranslationFn,
} from '@/lib/validation/translations';

export type {
  LoginFormData,
  RegistrationFormData,
  PasswordResetRequestData,
  PasswordResetData,
} from '@/lib/validation/schemas/auth';

export type {
  LinkFormData,
  ItemFormData,
  UpdateItemFormData,
} from '@/lib/validation/schemas/item';

export type {
  PropertyFormData,
  AdminPropertyFormData,
  UpdatePropertyFormData,
} from '@/lib/validation/schemas/property';
```

**Verification:**
- Types importable from `/src/types/validation`

**Estimated Complexity:** XS
**Depends On:** Phase 2 complete

---

#### Task 5.2: Update Types Index Export

**Objective:** Re-export validation types from main types index

**File to Modify:** `/src/types/index.ts`

**Add:**

```typescript
// Validation types
export * from './validation';
```

**Verification:**
- Types importable from `@/types`

**Estimated Complexity:** XS
**Depends On:** Task 5.1

---

#### Task 5.3: Add JSDoc Documentation

**Objective:** Add comprehensive JSDoc comments to all exports

**Files to Modify:**
- `/src/lib/validation/translations.ts`
- `/src/lib/validation/schemas/common.ts`
- `/src/lib/validation/schemas/auth.ts`
- `/src/lib/validation/schemas/item.ts`
- `/src/lib/validation/schemas/property.ts`

**Documentation Requirements:**
- All exported functions have `@example` JSDoc tags
- Parameter types documented with `@param`
- Return types documented with `@returns`
- Usage patterns shown in examples

**Verification:**
- IDE IntelliSense shows documentation
- Examples are accurate and runnable

**Estimated Complexity:** S
**Depends On:** Phases 1-2 complete

---

## Summary

### Task List Overview

| Phase | Task ID | Task Name | Complexity | Dependencies |
|-------|---------|-----------|------------|--------------|
| 1 | 1.1 | Install Zod Package | XS | None |
| 1 | 1.2 | Create Directory Structure | XS | 1.1 |
| 1 | 1.3 | Create Translation Integration | M | 1.1, 1.2 |
| 1 | 1.4 | Extend Translation Files | M | None |
| 2 | 2.1 | Create Common Validators | M | 1.3 |
| 2 | 2.2 | Create Auth Schemas | M | 2.1 |
| 2 | 2.3 | Create Item Schemas | M | 2.1 |
| 2 | 2.4 | Create Property Schemas | S | 2.1 |
| 2 | 2.5 | Create Schema Exports | XS | 2.1-2.4 |
| 2 | 2.6 | Create Main Export | XS | 2.5, 1.3 |
| 3 | 3.1 | Migrate LoginForm | M | 2.2, 2.6 |
| 3 | 3.2 | Migrate RegistrationForm | L | 2.2, 2.6 |
| 3 | 3.3 | Migrate ItemForm | L | 2.3, 2.6 |
| 3 | 3.4 | Migrate PropertyForm | S | 2.4, 2.6 |
| 4 | 4.1 | Schema Unit Tests | M | Phase 2 |
| 4 | 4.2 | Translation Tests | M | 1.3 |
| 4 | 4.3 | Manual Integration Testing | M | Phase 3 |
| 5 | 5.1 | Create Types File | XS | Phase 2 |
| 5 | 5.2 | Update Types Index | XS | 5.1 |
| 5 | 5.3 | Add Documentation | S | Phases 1-2 |

### Files Created (New)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/validation/index.ts` | Main validation module exports |
| `/src/lib/validation/translations.ts` | Zod translation integration |
| `/src/lib/validation/schemas/index.ts` | Schema barrel exports |
| `/src/lib/validation/schemas/common.ts` | Reusable field validators |
| `/src/lib/validation/schemas/auth.ts` | Authentication form schemas |
| `/src/lib/validation/schemas/item.ts` | Item/Link form schemas |
| `/src/lib/validation/schemas/property.ts` | Property form schemas |
| `/src/lib/validation/__tests__/schemas.test.ts` | Schema unit tests |
| `/src/lib/validation/__tests__/translations.test.ts` | Translation tests |
| `/src/types/validation.ts` | Validation type exports |

### Files Modified

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

### Acceptance Criteria

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

## References

- [REQ-352 Overview Document](./REQ-352-update-zod-schemas-to-use-translated-messages-overview.md)
- [REQ-351 Centralized Error Utility](./REQ-351-create-centralized-error-message-utility-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [gen_requests_epic2.md - Request #352](./gen_requests_epic2.md)
- [Zod Documentation](https://zod.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2J.5: Update Zod Schemas to Use Translated Messages*
