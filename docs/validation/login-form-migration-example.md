# LoginForm Migration Example: Inline Validation to Zod i18n

**REQ-E02-036: Update Zod Schemas to Use Translated Messages**

Last Modified: 2026-01-22

This document demonstrates how to migrate the LoginForm from inline validation to the new Zod-based validation system with i18n support.

## Current Implementation (Before)

The current `LoginForm.tsx` uses inline validation with manually constructed error messages:

```tsx
// Current: src/components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const tErrors = useTranslations('errors.form');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // BEFORE: Manual validation logic
  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return tErrors('emailRequired');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) return tErrors('invalidEmail');
        return undefined;

      case 'password':
        if (!value) return tErrors('passwordRequired');
        if ((value as string).length < 6) return tErrors('passwordTooShort', { min: 6 });
        return undefined;

      default:
        return undefined;
    }
  };

  // BEFORE: Manual form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    // ... rest of submit logic
  };

  // ... rest of component
}
```

### Issues with Current Implementation

1. **Duplicated validation logic** - Regex and rules scattered in component
2. **Manual error message construction** - Each field needs manual handling
3. **No type inference** - FormData interface must be manually maintained
4. **Hard to test** - Validation logic is coupled to component
5. **Inconsistent** - Different forms may have different validation patterns

## Migrated Implementation (After)

```tsx
// AFTER: src/components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GoogleOAuthButton from './GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
// NEW: Import validation utilities
import {
  useFormValidation,
  extractErrors,
  createLoginSchema,
  type LoginFormData
} from '@/lib/validation';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

// REMOVED: Manual FormData interface - now imported from validation module
// REMOVED: Manual FormErrors interface - now derived from validation

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const t = useTranslations('common.actions');
  const tForm = useTranslations('common.form');
  const tAuth = useTranslations('auth.login');
  const tAuthErrors = useTranslations('errors.auth');

  // NEW: Use validation hook instead of manual translation calls
  const { validate, validateField: validateSingleField, schema } = useFormValidation(createLoginSchema);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/admin';

  // NEW: Simplified field validation using Zod schema
  const handleFieldValidation = (name: keyof LoginFormData, value: unknown): string | undefined => {
    const result = validateSingleField(name, value);
    if (!result.success && result.error.issues.length > 0) {
      return result.error.issues[0].message;
    }
    return undefined;
  };

  // NEW: Simplified form validation using Zod
  const handleValidateForm = (): boolean => {
    const result = validate(formData);

    if (!result.success) {
      const validationErrors = extractErrors(result);
      setErrors({
        email: validationErrors.email,
        password: validationErrors.password,
      });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error on any input change
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  // NEW: Optional blur validation for better UX
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = handleFieldValidation(name as keyof LoginFormData, value);

    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // NEW: Use Zod validation
    if (!handleValidateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.email, formData.password);
      // ... rest of submit logic unchanged
    } catch (error) {
      // ... error handling unchanged
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component unchanged
}
```

## Key Changes Summary

### 1. Imports

```diff
+ import {
+   useFormValidation,
+   extractErrors,
+   createLoginSchema,
+   type LoginFormData
+ } from '@/lib/validation';
- // No validation imports
```

### 2. Hook Usage

```diff
+ const { validate, validateField: validateSingleField, schema } = useFormValidation(createLoginSchema);
- // Manual translation calls for each field
```

### 3. State Type

```diff
- const [formData, setFormData] = useState<FormData>({
+ const [formData, setFormData] = useState<LoginFormData>({
```

### 4. Validation Logic

```diff
- // 20+ lines of manual validation logic
- const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
-   switch (name) {
-     case 'email':
-       if (!value) return tErrors('emailRequired');
-       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
-       if (!emailRegex.test(value as string)) return tErrors('invalidEmail');
-       return undefined;
-     case 'password':
-       if (!value) return tErrors('passwordRequired');
-       if ((value as string).length < 6) return tErrors('passwordTooShort', { min: 6 });
-       return undefined;
-     default:
-       return undefined;
-   }
- };

+ // 5 lines using Zod
+ const handleFieldValidation = (name: keyof LoginFormData, value: unknown): string | undefined => {
+   const result = validateSingleField(name, value);
+   if (!result.success && result.error.issues.length > 0) {
+     return result.error.issues[0].message;
+   }
+   return undefined;
+ };
```

### 5. Form Validation

```diff
- const validateForm = (): boolean => {
-   const newErrors: FormErrors = {};
-
-   const emailError = validateField('email', formData.email);
-   const passwordError = validateField('password', formData.password);
-
-   if (emailError) newErrors.email = emailError;
-   if (passwordError) newErrors.password = passwordError;
-
-   setErrors(newErrors);
-   return Object.keys(newErrors).length === 0;
- };

+ const handleValidateForm = (): boolean => {
+   const result = validate(formData);
+
+   if (!result.success) {
+     const validationErrors = extractErrors(result);
+     setErrors({
+       email: validationErrors.email,
+       password: validationErrors.password,
+     });
+     return false;
+   }
+
+   setErrors({});
+   return true;
+ };
```

## Benefits After Migration

1. **Type Safety** - `LoginFormData` is inferred from schema
2. **Centralized Validation** - Rules defined once in `createLoginSchema`
3. **Automatic Translation** - Error messages automatically translated
4. **Testable** - Schema can be tested independently
5. **Consistent** - Same patterns across all forms
6. **Maintainable** - Change validation rules in one place

## Translation Key Mapping

| Old Key | New Key (errors namespace) |
|---------|---------------------------|
| `errors.form.emailRequired` | `form.required` |
| `errors.form.invalidEmail` | `form.email` |
| `errors.form.passwordRequired` | `form.required` |
| `errors.form.passwordTooShort` | `form.password.tooShort` |

## Testing the Migration

```typescript
// Test file: src/components/__tests__/LoginForm.test.tsx

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

// Mock the validation hook
vi.mock('@/lib/validation', () => ({
  useFormValidation: () => ({
    validate: vi.fn().mockReturnValue({ success: true, data: {} }),
    validateField: vi.fn().mockReturnValue({ success: true, data: '' }),
    schema: {},
  }),
  extractErrors: vi.fn().mockReturnValue({}),
  createLoginSchema: vi.fn(),
}));

describe('LoginForm with Zod validation', () => {
  it('shows validation errors from Zod', async () => {
    // Test implementation
  });
});
```

## Rollback Plan

If issues arise, the migration can be rolled back by:

1. Removing the validation import
2. Restoring the inline `validateField` and `validateForm` functions
3. Changing `LoginFormData` back to manual `FormData` interface

The old translation keys remain functional, so no message changes are needed for rollback.
