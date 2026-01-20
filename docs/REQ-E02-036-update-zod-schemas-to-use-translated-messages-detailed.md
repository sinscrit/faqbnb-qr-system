# REQ-E02-036: Update Zod Schemas to Use Translated Messages - Detailed Task Breakdown

*Generated: 2026-01-20 12:45:00 UTC*
*Last Modified: 2026-01-20 12:45:00 UTC*

## Reference Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-036 |
| **Overview Doc** | docs/REQ-E02-036-update-zod-schemas-to-use-translated-messages-overview.md |
| **Requirements Doc** | docs/gen_requests_epic2.md |
| **Implementation Plan** | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| **Epic** | Localization Epic 2 - Static UI Translation |
| **Sub-Epic** | 2J - Error Messages & Validation |
| **Task ID** | 2J.5 |
| **Size** | L (Large) |
| **Type** | Enhancement |
| **Depends On** | Epic 1 (next-intl setup), REQ-E02-032 (errors namespace), REQ-E02-035 (error utility) |

---

## Executive Summary

This task introduces Zod as a validation framework to the FAQBNB codebase and creates a comprehensive i18n-integrated validation pattern. The current codebase uses manual `validateField()` functions with hardcoded English error messages. This task establishes a standardized, type-safe validation approach where all error messages are retrieved from the translation system, enabling fully localized validation feedback across all 6 supported languages.

**Key Insight**: Zod is NOT currently installed in the codebase. All existing validation uses custom switch-case validation functions. This task introduces Zod as a new dependency while creating patterns that can gradually replace manual validation.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (`next-intl` installed and configured)
- [ ] REQ-E02-032 (errors namespace structure) is complete
- [ ] REQ-E02-035 (centralized error message utility) is complete
- [ ] `/messages/en.json` contains the `errors` namespace with form validation keys
- [ ] All 6 language files exist in `/messages/` directory
- [ ] `useTranslations` and `getTranslations` hooks are working

---

## Current State Analysis

### Existing Validation Patterns Found

| File | Pattern | Lines | Hardcoded Strings |
|------|---------|-------|-------------------|
| `/src/components/LoginForm.tsx` | `validateField()` switch-case | 48-64 | 4 strings |
| `/src/components/RegistrationForm.tsx` | `validateField()` switch-case | 212-246 | 8+ strings |
| `/src/components/PropertyForm.tsx` | `validateForm()` with conditionals | 29-51 | 4 strings |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Inline validation | Various | 2 strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Inline validation | Various | 2 strings |
| `/src/components/ItemCapture/utils/validation.ts` | Dedicated validation module | Full file | 15+ strings |

### Required Translation Keys (from errors namespace)

Based on the overview document and existing messages/en.json, these keys are needed:

```
errors.form.required
errors.form.email
errors.form.password.required
errors.form.password.tooShort
errors.form.password.tooWeak
errors.form.password.mismatch
errors.form.minLength
errors.form.maxLength
errors.form.invalidFormat
errors.form.invalidUrl
errors.form.termsRequired
errors.api.generic
```

---

## Task Breakdown

### Phase 1: Foundation (Tasks 1-4)

#### Task 1: Install Zod Package
**Story Points:** 1
**Priority:** Critical
**Files to Modify:**
- `/package.json`

**Implementation Steps:**
1. Run `npm install zod` to add Zod to dependencies
2. Verify installation with `npm list zod`
3. Confirm TypeScript types are included (Zod ships with types)

**Verification:**
```bash
npm install zod && npm list zod
```

**Acceptance Criteria:**
- [ ] `zod` appears in `package.json` dependencies with version ^3.22.0 or higher
- [ ] No installation errors or peer dependency warnings
- [ ] TypeScript can import `z` from 'zod' without errors

---

#### Task 2: Create Zod-i18n Bridge Utility
**Story Points:** 2
**Priority:** Critical
**Files to Create:**
- `/src/lib/validation/zod-i18n.ts`

**Implementation Steps:**
1. Create `/src/lib/validation/` directory if it doesn't exist
2. Create `zod-i18n.ts` with:
   - `TranslationFunction` type definition
   - `createZodErrorMap()` function that maps Zod error codes to translation keys
   - `configureZodErrors()` function for global configuration
   - `parseWithTranslations()` utility function
   - `safeParseWithTranslations()` utility function

**Code Specification:**
```typescript
// /src/lib/validation/zod-i18n.ts
// See overview document for full implementation
// Key exports:
// - TranslationFunction type
// - createZodErrorMap(t: TranslationFunction): ZodErrorMap
// - configureZodErrors(t: TranslationFunction): void
// - parseWithTranslations<T>(schema, data, t): T
// - safeParseWithTranslations<T>(schema, data, t): SafeParseReturnType
```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/validation/zod-i18n.ts`
- [ ] All 5 exports are defined and properly typed
- [ ] `createZodErrorMap` handles: `invalid_type`, `invalid_string`, `too_small`, `too_big`, `custom` codes
- [ ] Error map returns translation keys with proper interpolation for min/max values
- [ ] No TypeScript errors

---

#### Task 3: Create Schema Factory Functions
**Story Points:** 3
**Priority:** Critical
**Files to Create:**
- `/src/lib/validation/schema-factories.ts`

**Implementation Steps:**
1. Create schema factory functions that receive translation function
2. Implement factories for all application domains:
   - `createLoginSchema(t)` - email, password, rememberMe
   - `createRegistrationSchema(t)` - email, password, confirmPassword, fullName, agreeToTerms with password confirmation refinement
   - `createPropertySchema(t)` - nickname (required, max 100), propertyTypeId (required), address (optional, max 500)
   - `createItemMetadataSchema(t)` - title (required, max 200), description (optional, max 5000), propertyId (required)
   - `createUrlSchema(t)` - url (required, valid URL, max 2048), title (optional, max 200)
   - `createProfileSchema(t)` - fullName (min 2, max 100), displayName (max 50)
   - `createPasswordChangeSchema(t)` - currentPassword, newPassword, confirmNewPassword with confirmation refinement

**Code Pattern:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] All 7 schema factories are implemented
- [ ] Each factory accepts `TranslationFunction` parameter
- [ ] All validation rules use translation keys, not hardcoded strings
- [ ] Type exports exist for each schema's inferred type
- [ ] Refinements work correctly for password confirmation
- [ ] No TypeScript errors

---

#### Task 4: Create Validation Hook for Client Components
**Story Points:** 2
**Priority:** Critical
**Files to Create:**
- `/src/lib/validation/useValidation.ts`

**Implementation Steps:**
1. Create `useValidationSchemas()` hook that:
   - Uses `useTranslations('errors')` from next-intl
   - Returns memoized object with all schemas
2. Create `useFormValidation(schemaFactory)` hook for specific schema use
3. Create `extractErrors(result)` utility function

**Code Specification:**
```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';
import * as schemas from './schema-factories';

export function useValidationSchemas() {
  const t = useTranslations('errors');
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
```

**Acceptance Criteria:**
- [ ] File has 'use client' directive
- [ ] `useValidationSchemas()` returns all 7 schemas
- [ ] Schemas are memoized with `useMemo`
- [ ] `useFormValidation()` provides validate and validateField callbacks
- [ ] `extractErrors()` converts Zod errors to `Record<string, string>` format

---

### Phase 2: Server-Side Support & Module Setup (Tasks 5-6)

#### Task 5: Create Server-Side Validation Utilities
**Story Points:** 2
**Priority:** High
**Files to Create:**
- `/src/lib/validation/server-validation.ts`

**Implementation Steps:**
1. Create async `getValidationSchemas()` function using `getTranslations('errors')` from `next-intl/server`
2. Create `validateServerSide()` async function for general server validation
3. Create `validateApiRequest()` async function that throws `ValidationError` on failure
4. Create `ValidationError` class extending Error with errors property

**Code Specification:**
```typescript
// No 'use client' directive - this is server-only
import { getTranslations } from 'next-intl/server';

export async function getValidationSchemas() {
  const t = await getTranslations('errors');
  return { /* all schemas */ };
}

export class ValidationError extends Error {
  constructor(message: string, public readonly errors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

**Acceptance Criteria:**
- [ ] File does NOT have 'use client' directive
- [ ] Uses `getTranslations` from `next-intl/server`
- [ ] All async functions properly await translations
- [ ] `ValidationError` class includes errors property
- [ ] `validateApiRequest()` throws on validation failure

---

#### Task 6: Create Module Index and Exports
**Story Points:** 1
**Priority:** High
**Files to Create:**
- `/src/lib/validation/index.ts`

**Implementation Steps:**
1. Create barrel exports for all validation utilities
2. Organize exports by category (utilities, factories, hooks, server)
3. Export types alongside functions

**Code Specification:**
```typescript
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
  // ... etc
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

**Acceptance Criteria:**
- [ ] All exports from all files are re-exported
- [ ] Type exports are included
- [ ] No circular dependencies
- [ ] Can import from `@/lib/validation` without specifying subpath

---

### Phase 3: Translation Keys Enhancement (Tasks 7-8)

#### Task 7: Add Missing Translation Keys to English
**Story Points:** 2
**Priority:** High
**Files to Modify:**
- `/messages/en.json`

**Implementation Steps:**
1. Extend the existing `errors` namespace with missing keys
2. Add form validation keys with interpolation placeholders
3. Add password-specific validation keys
4. Ensure all keys used in schema factories exist

**Keys to Add/Verify:**
```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Must be {max} characters or less",
      "termsRequired": "You must agree to the terms and conditions",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      }
    },
    "api": {
      "generic": "Something went wrong. Please try again."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All form.* keys exist under errors namespace
- [ ] All password.* keys exist under errors.form namespace
- [ ] Interpolation placeholders use {min}, {max} format
- [ ] JSON remains valid after changes
- [ ] Keys are organized hierarchically

---

#### Task 8: Generate Translations for 5 Non-English Languages
**Story Points:** 2
**Priority:** High
**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Implementation Steps:**
1. For each language file, add the same key structure as English
2. Translate error messages appropriately for each language
3. Preserve interpolation placeholders ({min}, {max})
4. Ensure JSON structure matches English exactly

**Sample Translations (French):**
```json
{
  "errors": {
    "form": {
      "required": "Ce champ est obligatoire",
      "email": "Veuillez entrer une adresse email valide",
      "password": {
        "tooShort": "Le mot de passe doit contenir au moins {min} caractères",
        "mismatch": "Les mots de passe ne correspondent pas"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 language files have identical key structure to English
- [ ] Translations are contextually appropriate
- [ ] Interpolation placeholders ({min}, {max}) preserved exactly
- [ ] All JSON files remain valid
- [ ] No missing keys in any language file

---

### Phase 4: Unit Testing (Tasks 9-11)

#### Task 9: Create Unit Tests for Zod-i18n Utilities
**Story Points:** 2
**Priority:** High
**Files to Create:**
- `/src/lib/validation/__tests__/zod-i18n.test.ts`

**Test Cases:**
1. `createZodErrorMap` returns correct translation keys for each error code
2. Required field errors map to `form.required`
3. Email validation errors map to `form.email`
4. Min length errors include {min} value
5. Max length errors include {max} value
6. Custom errors preserve original message
7. `safeParseWithTranslations` returns translated errors

**Acceptance Criteria:**
- [ ] Test file exists with comprehensive coverage
- [ ] All Zod error code mappings are tested
- [ ] Interpolation is verified for min/max values
- [ ] Tests pass with `npm test`

---

#### Task 10: Create Unit Tests for Schema Factories
**Story Points:** 2
**Priority:** High
**Files to Create:**
- `/src/lib/validation/__tests__/schema-factories.test.ts`

**Test Cases:**
1. Login schema validates email format
2. Login schema enforces minimum password length
3. Registration schema validates password confirmation
4. Registration schema requires terms agreement
5. Property schema requires nickname and propertyTypeId
6. Property schema enforces max length constraints
7. URL schema validates URL format
8. All schemas use translation function for errors

**Acceptance Criteria:**
- [ ] Each schema factory has at least 3 test cases
- [ ] Success and failure cases both tested
- [ ] Refinement validations (password match) tested
- [ ] Tests pass with `npm test`

---

#### Task 11: Create Integration Tests for Validation Hooks
**Story Points:** 2
**Priority:** Medium
**Files to Create:**
- `/src/lib/validation/__tests__/useValidation.test.tsx`

**Test Cases:**
1. `useValidationSchemas` returns all expected schemas
2. Schemas are memoized correctly
3. `extractErrors` converts Zod errors to flat object
4. Error messages are translated (mock translations)

**Note:** These tests require React Testing Library and mock next-intl provider

**Acceptance Criteria:**
- [ ] Hook tests use proper React testing patterns
- [ ] Memoization is verified
- [ ] Error extraction is tested
- [ ] Tests pass with `npm test`

---

### Phase 5: Documentation (Tasks 12-13)

#### Task 12: Create Developer Documentation
**Story Points:** 2
**Priority:** Medium
**Files to Create:**
- `/docs/validation/zod-i18n-guide.md`

**Documentation Sections:**
1. Overview - Why Zod with i18n
2. Quick Start - Basic usage examples
3. Schema Factory Pattern - How to create new schemas
4. Client-Side Usage - Using hooks in React components
5. Server-Side Usage - API route validation
6. Adding New Validation Rules - Step-by-step guide
7. Translation Keys - Key naming conventions
8. Migration Guide - Updating existing validateField functions

**Acceptance Criteria:**
- [ ] Documentation covers all exported functions
- [ ] Code examples are complete and runnable
- [ ] Migration path from manual validation is clear
- [ ] Server vs client usage is clearly distinguished

---

#### Task 13: Add Inline Code Documentation
**Story Points:** 1
**Priority:** Medium
**Files to Modify:**
- All files in `/src/lib/validation/`

**Implementation Steps:**
1. Add JSDoc comments to all exported functions
2. Include @param, @returns, @example tags
3. Add @see references to related functions
4. Include @lastModified timestamps

**Acceptance Criteria:**
- [ ] All exported functions have JSDoc
- [ ] Examples are practical and accurate
- [ ] TypeScript types are documented

---

### Phase 6: Component Migration Examples (Tasks 14-15)

#### Task 14: Create Migration Example - LoginForm
**Story Points:** 2
**Priority:** Medium
**Files to Document:**
- Example migration pattern (not modifying actual component)

**Purpose:** Demonstrate how to migrate existing `validateField()` patterns to use Zod schemas. This task creates documentation showing the before/after pattern, preparing for actual component updates in future tasks.

**Before Pattern (current LoginForm.tsx:48-64):**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
    case 'password':
      if (!value) return 'Password is required';
      if ((value as string).length < 6) return 'Password must be at least 6 characters';
  }
};
```

**After Pattern (using new validation module):**
```typescript
import { useValidationSchemas, extractErrors } from '@/lib/validation';

function LoginForm() {
  const schemas = useValidationSchemas();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schemas.login.safeParse(formData);
    if (!result.success) {
      setErrors(extractErrors(result));
      return;
    }
    // Submit validated data
  };
}
```

**Acceptance Criteria:**
- [ ] Documentation shows clear before/after comparison
- [ ] Migration path is step-by-step
- [ ] Both full-form and field-level validation patterns shown

---

#### Task 15: Document ItemCapture Validation Migration
**Story Points:** 2
**Priority:** Medium
**Files to Document:**
- Example for `/src/components/ItemCapture/utils/validation.ts`

**Purpose:** Document how the existing comprehensive validation module can be enhanced with Zod while preserving the detailed validation result structure.

**Special Considerations:**
- ItemCapture validation returns structured results (not just error strings)
- File size, MIME type, and count validations are complex
- Gradual migration recommended - can coexist with existing functions

**Acceptance Criteria:**
- [ ] Document hybrid approach for complex validation
- [ ] Show how Zod schemas can complement existing utilities
- [ ] Preserve existing ValidationResult interface patterns

---

## File Changes Summary

### New Files to Create

| File | Purpose | Task |
|------|---------|------|
| `/src/lib/validation/zod-i18n.ts` | Zod-i18n integration utilities | Task 2 |
| `/src/lib/validation/schema-factories.ts` | Schema factory functions | Task 3 |
| `/src/lib/validation/useValidation.ts` | React validation hooks | Task 4 |
| `/src/lib/validation/server-validation.ts` | Server-side validation | Task 5 |
| `/src/lib/validation/index.ts` | Module exports | Task 6 |
| `/src/lib/validation/__tests__/zod-i18n.test.ts` | Unit tests | Task 9 |
| `/src/lib/validation/__tests__/schema-factories.test.ts` | Schema tests | Task 10 |
| `/src/lib/validation/__tests__/useValidation.test.tsx` | Hook tests | Task 11 |
| `/docs/validation/zod-i18n-guide.md` | Developer documentation | Task 12 |

### Existing Files to Modify

| File | Modifications | Task |
|------|---------------|------|
| `/package.json` | Add `zod` dependency | Task 1 |
| `/messages/en.json` | Add/verify form validation keys | Task 7 |
| `/messages/fr.json` | Add French validation translations | Task 8 |
| `/messages/es.json` | Add Spanish validation translations | Task 8 |
| `/messages/de.json` | Add German validation translations | Task 8 |
| `/messages/nl.json` | Add Dutch validation translations | Task 8 |
| `/messages/it.json` | Add Italian validation translations | Task 8 |

---

## Dependencies Between Tasks

```
Task 1 (Install Zod)
    ↓
Task 2 (Zod-i18n bridge) ←─ requires Task 1
    ↓
Task 3 (Schema factories) ←─ requires Task 2
    ↓
Task 4 (Client hooks) ←─ requires Task 3
Task 5 (Server utils) ←─ requires Task 3
    ↓
Task 6 (Module index) ←─ requires Tasks 4, 5
    ↓
Tasks 7-8 (Translations) ←─ can run parallel with Tasks 4-6
    ↓
Tasks 9-11 (Unit tests) ←─ requires Tasks 2-6, 7-8
    ↓
Tasks 12-13 (Documentation) ←─ requires Tasks 2-6
    ↓
Tasks 14-15 (Migration examples) ←─ requires Tasks 12-13
```

---

## Success Validation

### Build Verification
```bash
# After all tasks complete:
npm run build  # Should complete without errors
npm run lint   # Should pass
npm test       # All tests should pass
```

### Functional Verification
1. Import `useValidationSchemas` in a test component
2. Validate form data with a schema
3. Verify error messages appear in English
4. Change language preference
5. Verify error messages appear in new language

### Checklist
- [ ] `zod` in package.json dependencies
- [ ] All 5 validation module files exist
- [ ] All 6 language files have matching error key structure
- [ ] Unit tests pass
- [ ] TypeScript compilation succeeds
- [ ] Documentation is complete

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation keys mismatch | Medium | High | Verify keys exist before using in schemas |
| Server vs client context confusion | Medium | Medium | Clear documentation, separate files |
| Type inference complexity | Low | Medium | Export explicit types for all schemas |
| Breaking existing validation | Low | High | New module is additive, doesn't modify existing code |

---

## Post-Implementation Notes

### Future Work
After this task is complete, subsequent tasks can:
1. Migrate `LoginForm.tsx` to use `useValidationSchemas().login`
2. Migrate `RegistrationForm.tsx` to use `useValidationSchemas().registration`
3. Migrate `PropertyForm.tsx` to use `useValidationSchemas().property`
4. Gradually replace `ItemCapture/utils/validation.ts` functions

### Performance Considerations
- Schemas are memoized in hooks to prevent recreation on every render
- Translation function is stable reference from next-intl
- Factory pattern ensures schemas are only created when translations are available

---

## References

- [Overview Document](/docs/REQ-E02-036-update-zod-schemas-to-use-translated-messages-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2J, Task 2J.5
- [Zod Documentation](https://zod.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Validation Module](/src/components/ItemCapture/utils/validation.ts)
- [Existing LoginForm](/src/components/LoginForm.tsx)

---

*End of Detailed Task Breakdown*
