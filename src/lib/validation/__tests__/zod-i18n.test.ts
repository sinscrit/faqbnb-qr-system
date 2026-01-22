/**
 * Unit Tests for Zod-i18n Integration Utilities
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Tests the Zod-i18n bridge utilities for proper behavior
 * and translation key mapping.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
  createZodErrorMap,
  parseWithTranslations,
  safeParseWithTranslations,
  type TranslationFunction,
} from '../zod-i18n';

// Mock translation function that returns keys with params
const createMockT = (): TranslationFunction => {
  return (key: string, params?: Record<string, string | number>) => {
    if (params) {
      let result = `[${key}]`;
      for (const [k, v] of Object.entries(params)) {
        result += `{${k}:${v}}`;
      }
      return result;
    }
    return `[${key}]`;
  };
};

describe('zod-i18n', () => {
  describe('createZodErrorMap', () => {
    const mockT = createMockT();
    const errorMap = createZodErrorMap(mockT);

    it('should return form.required for invalid_type with undefined input', () => {
      const result = errorMap({
        code: 'invalid_type',
        input: undefined,
        path: ['email'],
        message: '',
      });
      expect(result).toBe('[form.required]');
    });

    it('should return form.required for invalid_type with null input', () => {
      const result = errorMap({
        code: 'invalid_type',
        input: null,
        path: ['email'],
        message: '',
      });
      expect(result).toBe('[form.required]');
    });

    it('should return form.invalidFormat for invalid_type with non-null input', () => {
      const result = errorMap({
        code: 'invalid_type',
        input: 123,
        path: ['email'],
        message: '',
      });
      expect(result).toBe('[form.invalidFormat]');
    });

    it('should return form.email for email format error', () => {
      const result = errorMap({
        code: 'invalid_format',
        format: 'email',
        input: 'invalid',
        path: ['email'],
        message: '',
      });
      expect(result).toBe('[form.email]');
    });

    it('should return form.invalidUrl for url format error', () => {
      const result = errorMap({
        code: 'invalid_format',
        format: 'url',
        input: 'invalid',
        path: ['url'],
        message: '',
      });
      expect(result).toBe('[form.invalidUrl]');
    });

    it('should return form.invalidFormat for regex format error', () => {
      const result = errorMap({
        code: 'invalid_format',
        format: 'regex',
        input: 'invalid',
        path: ['field'],
        message: '',
      });
      expect(result).toBe('[form.invalidFormat]');
    });

    it('should return form.required for too_small with minimum 1', () => {
      const result = errorMap({
        code: 'too_small',
        origin: 'string',
        minimum: 1,
        input: '',
        path: ['name'],
        message: '',
      });
      expect(result).toBe('[form.required]');
    });

    it('should return form.minLength with min param for too_small with minimum > 1', () => {
      const result = errorMap({
        code: 'too_small',
        origin: 'string',
        minimum: 8,
        input: 'short',
        path: ['password'],
        message: '',
      });
      expect(result).toBe('[form.minLength]{min:8}');
    });

    it('should return form.maxLength with max param for too_big', () => {
      const result = errorMap({
        code: 'too_big',
        origin: 'string',
        maximum: 100,
        input: 'x'.repeat(101),
        path: ['description'],
        message: '',
      });
      expect(result).toBe('[form.maxLength]{max:100}');
    });

    it('should return form.required for invalid_value', () => {
      const result = errorMap({
        code: 'invalid_value',
        values: [true],
        input: false,
        path: ['agreeToTerms'],
        message: '',
      });
      expect(result).toBe('[form.required]');
    });

    it('should return original message for custom errors', () => {
      const result = errorMap({
        code: 'custom',
        input: 'test',
        path: ['field'],
        message: 'Custom error message',
      });
      expect(result).toBe('Custom error message');
    });

    it('should return api.generic for unknown error codes', () => {
      const result = errorMap({
        code: 'unknown_code',
        input: 'test',
        path: ['field'],
        message: '',
      });
      expect(result).toBe('[api.generic]');
    });
  });

  describe('parseWithTranslations', () => {
    const mockT = createMockT();

    it('should return parsed data for valid input', () => {
      const schema = z.object({
        name: z.string().min(1),
      });

      const result = parseWithTranslations(schema, { name: 'John' }, mockT);
      expect(result).toEqual({ name: 'John' });
    });

    it('should throw error for invalid input', () => {
      const schema = z.object({
        name: z.string().min(1),
      });

      expect(() => parseWithTranslations(schema, { name: '' }, mockT)).toThrow();
    });
  });

  describe('safeParseWithTranslations', () => {
    const mockT = createMockT();

    it('should return success result for valid input', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = safeParseWithTranslations(
        schema,
        { email: 'test@example.com' },
        mockT
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ email: 'test@example.com' });
      }
    });

    it('should return error result for invalid input', () => {
      const schema = z.object({
        email: z.string().email({ error: mockT('form.email') }),
      });

      const result = safeParseWithTranslations(
        schema,
        { email: 'invalid' },
        mockT
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should preserve error messages from schema', () => {
      const schema = z.object({
        password: z.string().min(8, { error: mockT('form.password.tooShort', { min: 8 }) }),
      });

      const result = safeParseWithTranslations(
        schema,
        { password: 'short' },
        mockT
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('[form.password.tooShort]{min:8}');
      }
    });
  });
});
