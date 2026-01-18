# REQ-319: Update Zod Validation Schemas to Use Translated Messages

**Implementation Overview Document**

**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic2.md - REQ-319
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.5
**Type:** ENHANCEMENT
**Size:** L (Large)

---

## 1. Executive Summary

This task updates all Zod validation schemas throughout the application to use translated error messages instead of hardcoded English strings. This is a critical component of the L10N Epic 2 initiative, enabling validation feedback to appear in the user's preferred language. The implementation ensures that form validation errors integrate seamlessly with the `next-intl` translation system established in Epic 1.

**Key Observations from Codebase Analysis:**
- The codebase does NOT currently use Zod schemas for form validation
- Validation is implemented using custom functions with hardcoded strings
- Primary validation files: `src/components/ItemCapture/utils/validation.ts`, `src/lib/access-validation.ts`
- Form validation in components like `RegistrationForm.tsx` and `LoginForm.tsx` uses inline validation functions
- Error handling utilities exist in `src/lib/error-utils.ts` with `UserFriendlyError` types
- No `/messages/*.json` translation files exist yet (to be created as part of Epic 2)

**Implementation Strategy:** Since Zod is not currently used, this task involves either:
1. **Option A (Recommended):** Introduce Zod schemas for form validation and configure them to use translated messages from the start
2. **Option B:** Update existing custom validation functions to use translation keys from the errors namespace

---

## 2. Current State Analysis

### 2.1 Existing Validation Patterns

#### Custom Validation Functions (`src/components/ItemCapture/utils/validation.ts`)

```typescript
// Current pattern - hardcoded strings
export function validateTitle(title: string): ValidationResult {
  const trimmedTitle = title?.trim() ?? '';
  if (trimmedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Title is required',  // Hardcoded
    };
  }
  if (trimmedTitle.length > CAPTURE_CONSTRAINTS.title.maxLength) {
    return {
      isValid: false,
      error: `Title must be ${CAPTURE_CONSTRAINTS.title.maxLength} characters or less (current: ${trimmedTitle.length})`,  // Hardcoded with interpolation
    };
  }
  return { isValid: true };
}
```

#### Inline Form Validation (`src/components/RegistrationForm.tsx`)

```typescript
// Current pattern - inline validation with hardcoded strings
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';  // Hardcoded
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';  // Hardcoded
      return undefined;
    case 'password':
      if (!value) return 'Password is required';  // Hardcoded
      // ... more validations
  }
};
```

#### Access Validation (`src/lib/access-validation.ts`)

```typescript
// Current pattern - validation with hardcoded error messages
export function validateAccessCodeFormat(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Access code is required' };  // Hardcoded
  }
  if (code.length !== 12) {
    return { isValid: false, error: 'Access code must be 12 characters long' };  // Hardcoded
  }
  // ...
}
```

### 2.2 Error Handling Infrastructure

The codebase has an existing error handling system in `src/lib/error-utils.ts`:
- `UserFriendlyError` type with code, message, actionable flag, and nextSteps
- `translateErrorMessage()` function for mapping technical errors to user-friendly messages
- `HTTP_ERROR_MAPPING` for standardized HTTP error messages

### 2.3 Translation Infrastructure Status

Per Epic 1 and Epic 2 plans:
- `next-intl` framework should be installed (Epic 1)
- Translation files in `/messages/*.json` to be created (Epic 2)
- `errors` namespace defined in plan with validation, API, network, and auth error categories

---

## 3. Implementation Approach

### 3.1 Recommended Approach: Introduce Zod with Translations

Since Zod is not currently used, this task should:

1. **Install Zod** (if not already a dependency)
2. **Create Zod schema files** with translation-aware error messages
3. **Build a translation integration helper** for Zod schemas
4. **Migrate key validation logic** to Zod schemas
5. **Update form components** to use Zod for validation
6. **Maintain backward compatibility** during transition

### 3.2 Zod Translation Pattern

```typescript
// Pattern for Zod with next-intl translations
import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Helper function for creating translated Zod schemas
export function createValidationSchema(t: (key: string, params?: Record<string, unknown>) => string) {
  return {
    email: z.string()
      .min(1, { message: t('validation.email.required') })
      .email({ message: t('validation.email.invalid') }),

    password: z.string()
      .min(1, { message: t('validation.password.required') })
      .min(8, { message: t('validation.password.tooShort', { min: 8 }) }),

    title: z.string()
      .min(1, { message: t('validation.title.required') })
      .max(200, { message: t('validation.title.tooLong', { max: 200 }) }),
  };
}

// Hook for using translated validation
export function useTranslatedValidation() {
  const t = useTranslations('errors');
  return createValidationSchema(t);
}
```

---

## 4. Task Breakdown

### Task 4.1: Install Zod Dependency (if needed)
**Effort:** 0.5 hours
- Verify Zod is not already installed
- Add Zod to project dependencies
- Verify TypeScript types are available

### Task 4.2: Create Zod Translation Helper Utility
**Effort:** 2-3 hours
**File:** `src/lib/i18n/validation-schemas.ts`
- Create helper function for building translated Zod schemas
- Support dynamic parameter interpolation for limits
- Handle fallback to English when translations are missing
- Export reusable schema building functions

### Task 4.3: Create Registration Form Zod Schema
**Effort:** 2-3 hours
**File:** `src/lib/schemas/registration.schema.ts`
- Email validation with translation
- Password validation (min length, complexity) with translation
- Confirm password matching with translation
- Full name validation with translation
- Access code format validation with translation

### Task 4.4: Create Login Form Zod Schema
**Effort:** 1-2 hours
**File:** `src/lib/schemas/login.schema.ts`
- Email validation with translation
- Password validation with translation

### Task 4.5: Create Item Capture Zod Schemas
**Effort:** 3-4 hours
**File:** `src/lib/schemas/item-capture.schema.ts`
- Title validation with translation
- URL validation with translation
- File size validation with translation
- Content requirement validation with translation
- Image count validation with translation

### Task 4.6: Create Access Code Zod Schema
**Effort:** 1-2 hours
**File:** `src/lib/schemas/access-code.schema.ts`
- Access code format validation with translation
- Email format validation with translation

### Task 4.7: Create Property Form Zod Schema
**Effort:** 1-2 hours
**File:** `src/lib/schemas/property.schema.ts`
- Property name validation with translation
- Property type validation with translation
- Address validation with translation

### Task 4.8: Update RegistrationForm Component
**Effort:** 2-3 hours
**File:** `src/components/RegistrationForm.tsx`
- Import Zod schema
- Replace inline validation with Zod validation
- Use `useTranslatedValidation` hook
- Preserve existing UI behavior

### Task 4.9: Update LoginForm Component
**Effort:** 1-2 hours
**File:** `src/components/LoginForm.tsx`
- Import Zod schema
- Replace inline validation with Zod validation
- Preserve existing UI behavior

### Task 4.10: Update ItemCapture Validation
**Effort:** 3-4 hours
**File:** `src/components/ItemCapture/hooks/useItemValidation.ts`
- Replace custom validation functions with Zod schemas
- Update all validation result handling
- Maintain existing validation result types

### Task 4.11: Add Validation Error Translations to Errors Namespace
**Effort:** 2-3 hours
**File:** `/messages/en.json` (errors.validation section)
- Add all validation error messages to errors namespace
- Structure keys for reusability (e.g., `errors.validation.required`, `errors.validation.email.invalid`)
- Support interpolation placeholders

### Task 4.12: Create Documentation
**Effort:** 1-2 hours
**File:** `docs/i18n/validation-patterns.md`
- Document Zod translation pattern
- Provide examples for future development
- Explain fallback behavior

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/i18n/validation-schemas.ts` | Zod translation helper utility |
| `src/lib/schemas/registration.schema.ts` | Registration form Zod schema |
| `src/lib/schemas/login.schema.ts` | Login form Zod schema |
| `src/lib/schemas/item-capture.schema.ts` | Item capture validation schemas |
| `src/lib/schemas/access-code.schema.ts` | Access code validation schema |
| `src/lib/schemas/property.schema.ts` | Property form validation schema |
| `src/lib/schemas/index.ts` | Schema exports barrel file |
| `docs/i18n/validation-patterns.md` | Documentation for validation patterns |

### 5.2 Existing Files to Modify

| File Path | Functions to Modify | Changes |
|-----------|---------------------|---------|
| `src/components/RegistrationForm.tsx` | `validateField()`, `validateForm()` | Replace inline validation with Zod schema |
| `src/components/LoginForm.tsx` | `validateField()`, `validateForm()` | Replace inline validation with Zod schema |
| `src/components/ItemCapture/utils/validation.ts` | `validateTitle()`, `validateUrl()`, `validateFileSize()`, `validateContentRequirement()`, `validateTextLength()`, `validateImageCount()`, `validateMimeType()`, `validateTotalSize()`, `validateUrlCount()` | Update to use translation keys |
| `src/components/ItemCapture/hooks/useItemValidation.ts` | Custom hook implementation | Integrate Zod validation |
| `src/lib/access-validation.ts` | `validateAccessCodeFormat()`, `validateEmailFormat()` | Update to use translation keys |
| `src/components/SimpleDashboard/AddPropertyModal.tsx` | Form validation logic | Use property Zod schema |
| `src/components/SimpleDashboard/PropertyEditModal.tsx` | Form validation logic | Use property Zod schema |
| `/messages/en.json` | `errors.validation` section | Add all validation error strings |
| `package.json` | `dependencies` | Add Zod if not present |

### 5.3 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/error-utils.ts` | Existing error handling patterns |
| `src/types/index.ts` | Type definitions for `UserFriendlyError`, `ErrorCode` |
| `src/components/ItemCapture/utils/constants.ts` | Validation constraints (max lengths, file sizes) |
| `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Error namespace structure reference |

---

## 6. Translation Keys Structure

The following translation keys will be added to the `errors.validation` namespace:

```json
{
  "errors": {
    "validation": {
      "required": "This field is required",
      "email": {
        "required": "Email is required",
        "invalid": "Please enter a valid email address"
      },
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      },
      "title": {
        "required": "Title is required",
        "tooLong": "Title must be {max} characters or less (current: {current})"
      },
      "url": {
        "required": "URL is required",
        "invalid": "Invalid URL format",
        "tooLong": "URL exceeds {max} character limit",
        "invalidProtocol": "Only http and https URLs are allowed"
      },
      "file": {
        "tooLarge": "File exceeds {max} limit (current: {current})",
        "invalidType": "File type '{type}' is not supported for {mediaType}",
        "totalSizeExceeded": "Total upload size ({current}) exceeds {max} limit"
      },
      "content": {
        "required": "At least one media item, link, or text instructions must be provided"
      },
      "accessCode": {
        "required": "Access code is required",
        "invalidLength": "Access code must be 12 characters long",
        "invalidFormat": "Access code must contain only uppercase letters and numbers"
      },
      "count": {
        "maxPhotos": "Maximum {max} photos allowed (current: {current})",
        "maxLinks": "Maximum {max} links allowed (current: {current})"
      },
      "text": {
        "tooLong": "Instructions exceed {max} character limit (current: {current})"
      },
      "fullName": {
        "tooShort": "Name must be at least {min} characters"
      },
      "terms": {
        "required": "You must agree to the terms and conditions"
      }
    }
  }
}
```

---

## 7. Integration Patterns

### 7.1 Zod Schema with Translation Function

```typescript
// src/lib/i18n/validation-schemas.ts
import { z } from 'zod';

export type TranslationFunction = (key: string, params?: Record<string, unknown>) => string;

export function createEmailSchema(t: TranslationFunction) {
  return z.string()
    .min(1, { message: t('validation.email.required') })
    .email({ message: t('validation.email.invalid') });
}

export function createPasswordSchema(t: TranslationFunction, minLength: number = 8) {
  return z.string()
    .min(1, { message: t('validation.password.required') })
    .min(minLength, { message: t('validation.password.tooShort', { min: minLength }) });
}
```

### 7.2 Component Integration

```typescript
// In a React component
import { useTranslations } from 'next-intl';
import { createRegistrationSchema } from '@/lib/schemas/registration.schema';

function RegistrationForm() {
  const t = useTranslations('errors');
  const schema = createRegistrationSchema(t);

  const handleValidation = (formData: FormData) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      // result.error.errors contains translated messages
      return result.error.errors;
    }
    return null;
  };
}
```

### 7.3 Server-Side Validation (API Routes)

```typescript
// In API routes, use getTranslations for server-side
import { getTranslations } from 'next-intl/server';
import { createRegistrationSchema } from '@/lib/schemas/registration.schema';

export async function POST(request: Request) {
  const t = await getTranslations('errors');
  const schema = createRegistrationSchema(t);

  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.errors },
      { status: 400 }
    );
  }
}
```

---

## 8. Dependencies

### 8.1 Upstream Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 1 Foundation (next-intl) | Must be complete | Translation function availability |
| REQ-315 (Errors Namespace) | Should be complete | Error message translation keys |
| REQ-316 (Form Validation Audit) | Can be parallel | Identifies all validation messages |

### 8.2 Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | `^3.22.0` | Schema validation library |
| `next-intl` | Installed in Epic 1 | Translation framework |

---

## 9. Acceptance Criteria

- [ ] Zod dependency is installed and configured
- [ ] Translation helper utility is created for building Zod schemas
- [ ] Registration form validation uses Zod with translated messages
- [ ] Login form validation uses Zod with translated messages
- [ ] Item capture validation is updated to use translated messages
- [ ] Access code validation uses translated messages
- [ ] Property form validation uses Zod with translated messages
- [ ] All validation error messages reference the `errors.validation` namespace
- [ ] Translation keys support dynamic parameter interpolation
- [ ] Fallback to English works when translations are missing
- [ ] Validation behavior remains unchanged (only messages are translated)
- [ ] No performance degradation during form validation
- [ ] TypeScript types provide full type safety
- [ ] Documentation explains the pattern for future development

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Test each Zod schema validates correctly with English messages
- Test parameter interpolation works (e.g., `{min}`, `{max}`)
- Test fallback behavior when translation key is missing

### 10.2 Integration Tests

- Test forms display translated error messages
- Test validation messages update when language changes
- Test server-side validation returns translated messages

### 10.3 Manual Testing

- Switch language and verify all validation messages change
- Test all form validation scenarios in each supported language
- Verify no hardcoded English strings remain in validation flows

---

## 11. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | Medium | Critical | Verify next-intl is installed before starting |
| Missing translation keys | Medium | Medium | Implement fallback to English for missing keys |
| Performance impact | Low | Medium | Use memoization for schema creation |
| Breaking existing validation | Medium | High | Maintain same validation result interface |
| Type safety loss | Low | Medium | Use Zod's TypeScript inference |

---

## 12. Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Install & Configure Zod | 0.5 hours | High |
| Translation Helper Utility | 2-3 hours | High |
| Registration Form Schema | 2-3 hours | High |
| Login Form Schema | 1-2 hours | High |
| Item Capture Schemas | 3-4 hours | Medium |
| Access Code Schema | 1-2 hours | High |
| Property Form Schema | 1-2 hours | High |
| Update RegistrationForm | 2-3 hours | Medium |
| Update LoginForm | 1-2 hours | High |
| Update ItemCapture Validation | 3-4 hours | Medium |
| Add Translation Keys | 2-3 hours | High |
| Documentation | 1-2 hours | High |
| **Total** | **20-31 hours** | Medium |

---

## 13. References

- [Request Document: docs/gen_requests_epic2.md - REQ-319](/docs/gen_requests_epic2.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Zod Documentation](https://zod.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Error Utilities: src/lib/error-utils.ts](/src/lib/error-utils.ts)
- [Existing Validation: src/components/ItemCapture/utils/validation.ts](/src/components/ItemCapture/utils/validation.ts)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
