/**
 * Integration Tests for Validation Hooks
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Tests the React hooks for form validation with translations.
 * Uses mock next-intl provider for testing translated messages.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useValidationSchemas,
  useFormValidation,
  extractErrors,
} from '../useValidation';
import { createLoginSchema, createPropertySchema } from '../schema-factories';
import type { SafeParseResult } from '../zod-i18n';

// Create a stable mock translation function to prevent memoization issues
const mockTranslationFn = (key: string, params?: Record<string, string | number>) => {
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(`{${k}}`, String(v));
    }
    return `[${result}]`;
  }
  return `[${key}]`;
};

// Mock next-intl with a stable reference
vi.mock('next-intl', () => ({
  useTranslations: () => mockTranslationFn,
}));

describe('useValidation', () => {
  describe('useValidationSchemas', () => {
    it('should return all expected schemas', () => {
      const { result } = renderHook(() => useValidationSchemas());

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('registration');
      expect(result.current).toHaveProperty('property');
      expect(result.current).toHaveProperty('itemMetadata');
      expect(result.current).toHaveProperty('url');
      expect(result.current).toHaveProperty('profile');
      expect(result.current).toHaveProperty('passwordChange');
    });

    it('should return Zod schemas with safeParse method', () => {
      const { result } = renderHook(() => useValidationSchemas());

      expect(typeof result.current.login.safeParse).toBe('function');
      expect(typeof result.current.registration.safeParse).toBe('function');
      expect(typeof result.current.property.safeParse).toBe('function');
    });

    it('should memoize schemas between renders', () => {
      const { result, rerender } = renderHook(() => useValidationSchemas());

      const firstSchemas = result.current;
      rerender();
      const secondSchemas = result.current;

      // Schemas should be referentially equal due to useMemo
      expect(firstSchemas).toBe(secondSchemas);
    });

    it('should validate login data correctly', () => {
      const { result } = renderHook(() => useValidationSchemas());

      const validResult = result.current.login.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = result.current.login.safeParse({
        email: 'invalid',
        password: '123',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should validate registration data correctly', () => {
      const { result } = renderHook(() => useValidationSchemas());

      const validResult = result.current.registration.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: true,
      });
      expect(validResult.success).toBe(true);

      const invalidResult = result.current.registration.safeParse({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
        agreeToTerms: true,
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('useFormValidation', () => {
    it('should return validate and validateField functions', () => {
      const { result } = renderHook(() => useFormValidation(createLoginSchema));

      expect(typeof result.current.validate).toBe('function');
      expect(typeof result.current.validateField).toBe('function');
      expect(result.current.schema).toBeDefined();
    });

    it('should validate entire form data', () => {
      const { result } = renderHook(() => useFormValidation(createLoginSchema));

      const validResult = result.current.validate({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = result.current.validate({
        email: '',
        password: '',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should validate single field', () => {
      const { result } = renderHook(() => useFormValidation(createLoginSchema));

      // Valid email should return success
      const validEmail = result.current.validateField('email', 'test@example.com');
      expect(validEmail.success).toBe(true);

      // Invalid email should return failure
      const invalidEmail = result.current.validateField('email', 'invalid');
      expect(invalidEmail.success).toBe(false);
    });

    it('should work with different schema types', () => {
      const { result: loginResult } = renderHook(() => useFormValidation(createLoginSchema));
      const { result: propertyResult } = renderHook(() => useFormValidation(createPropertySchema));

      expect(loginResult.current.schema).not.toBe(propertyResult.current.schema);
    });
  });

  describe('extractErrors', () => {
    it('should return empty object for successful parse', () => {
      const successResult: SafeParseResult<{ name: string }> = {
        success: true,
        data: { name: 'John' },
      };

      const errors = extractErrors(successResult);
      expect(errors).toEqual({});
    });

    it('should extract errors from failed parse', () => {
      const failResult: SafeParseResult<{ email: string; password: string }> = {
        success: false,
        error: {
          issues: [
            { path: ['email'], message: 'Invalid email', code: 'invalid_format' },
            { path: ['password'], message: 'Too short', code: 'too_small' },
          ],
        },
      };

      const errors = extractErrors(failResult);
      expect(errors).toEqual({
        email: 'Invalid email',
        password: 'Too short',
      });
    });

    it('should handle nested paths', () => {
      const failResult: SafeParseResult<{ address: { street: string } }> = {
        success: false,
        error: {
          issues: [
            { path: ['address', 'street'], message: 'Required', code: 'invalid_type' },
          ],
        },
      };

      const errors = extractErrors(failResult);
      expect(errors).toEqual({
        'address.street': 'Required',
      });
    });

    it('should only keep first error for each path', () => {
      const failResult: SafeParseResult<{ email: string }> = {
        success: false,
        error: {
          issues: [
            { path: ['email'], message: 'First error', code: 'invalid_type' },
            { path: ['email'], message: 'Second error', code: 'invalid_format' },
          ],
        },
      };

      const errors = extractErrors(failResult);
      expect(errors).toEqual({
        email: 'First error',
      });
    });

    it('should handle empty path', () => {
      const failResult: SafeParseResult<unknown> = {
        success: false,
        error: {
          issues: [
            { path: [], message: 'Form error', code: 'custom' },
          ],
        },
      };

      const errors = extractErrors(failResult);
      expect(errors).toEqual({
        '': 'Form error',
      });
    });
  });
});
