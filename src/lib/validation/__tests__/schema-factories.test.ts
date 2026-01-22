/**
 * Unit Tests for Validation Schema Factories
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Tests all schema factory functions for proper validation rules
 * and translated error messages.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect } from 'vitest';
import {
  createLoginSchema,
  createRegistrationSchema,
  createPropertySchema,
  createItemMetadataSchema,
  createUrlSchema,
  createProfileSchema,
  createPasswordChangeSchema,
} from '../schema-factories';
import type { TranslationFunction } from '../zod-i18n';

// Mock translation function
const mockT: TranslationFunction = (key: string, params?: Record<string, string | number>) => {
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(`{${k}}`, String(v));
    }
    return `[${result}]`;
  }
  return `[${key}]`;
};

describe('schema-factories', () => {
  describe('createLoginSchema', () => {
    const schema = createLoginSchema(mockT);

    it('should validate a valid login form', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should allow optional rememberMe', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty email', () => {
      const result = schema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = schema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 6 characters', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createRegistrationSchema', () => {
    const schema = createRegistrationSchema(mockT);

    it('should validate a valid registration form', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        agreeToTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
        agreeToTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without numbers', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
        agreeToTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
        agreeToTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject false agreeToTerms', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: false,
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional fullName', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: true,
        fullName: 'John Doe',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createPropertySchema', () => {
    const schema = createPropertySchema(mockT);

    it('should validate a valid property form', () => {
      const result = schema.safeParse({
        nickname: 'Beach House',
        propertyTypeId: 'type-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty nickname', () => {
      const result = schema.safeParse({
        nickname: '',
        propertyTypeId: 'type-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject nickname longer than 100 characters', () => {
      const result = schema.safeParse({
        nickname: 'x'.repeat(101),
        propertyTypeId: 'type-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty propertyTypeId', () => {
      const result = schema.safeParse({
        nickname: 'Beach House',
        propertyTypeId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional address up to 500 characters', () => {
      const result = schema.safeParse({
        nickname: 'Beach House',
        propertyTypeId: 'type-123',
        address: '123 Main St',
      });
      expect(result.success).toBe(true);
    });

    it('should reject address longer than 500 characters', () => {
      const result = schema.safeParse({
        nickname: 'Beach House',
        propertyTypeId: 'type-123',
        address: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createItemMetadataSchema', () => {
    const schema = createItemMetadataSchema(mockT);

    it('should validate valid item metadata', () => {
      const result = schema.safeParse({
        title: 'WiFi Router',
        propertyId: 'prop-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = schema.safeParse({
        title: '',
        propertyId: 'prop-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 200 characters', () => {
      const result = schema.safeParse({
        title: 'x'.repeat(201),
        propertyId: 'prop-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty propertyId', () => {
      const result = schema.safeParse({
        title: 'WiFi Router',
        propertyId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional description up to 5000 characters', () => {
      const result = schema.safeParse({
        title: 'WiFi Router',
        propertyId: 'prop-123',
        description: 'This is a detailed description.',
      });
      expect(result.success).toBe(true);
    });

    it('should allow optional tags', () => {
      const result = schema.safeParse({
        title: 'WiFi Router',
        propertyId: 'prop-123',
        tags: ['wifi', 'router', 'tech'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createUrlSchema', () => {
    const schema = createUrlSchema(mockT);

    it('should validate a valid URL', () => {
      const result = schema.safeParse({
        url: 'https://example.com/manual.pdf',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty URL', () => {
      const result = schema.safeParse({
        url: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL format', () => {
      const result = schema.safeParse({
        url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional title', () => {
      const result = schema.safeParse({
        url: 'https://example.com/manual.pdf',
        title: 'User Manual',
      });
      expect(result.success).toBe(true);
    });

    it('should reject title longer than 200 characters', () => {
      const result = schema.safeParse({
        url: 'https://example.com/manual.pdf',
        title: 'x'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProfileSchema', () => {
    const schema = createProfileSchema(mockT);

    it('should validate valid profile data', () => {
      const result = schema.safeParse({
        fullName: 'John Doe',
        displayName: 'johnd',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object (all optional)', () => {
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject fullName shorter than 2 characters', () => {
      const result = schema.safeParse({
        fullName: 'J',
      });
      expect(result.success).toBe(false);
    });

    it('should reject fullName longer than 100 characters', () => {
      const result = schema.safeParse({
        fullName: 'x'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject displayName longer than 50 characters', () => {
      const result = schema.safeParse({
        displayName: 'x'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createPasswordChangeSchema', () => {
    const schema = createPasswordChangeSchema(mockT);

    it('should validate valid password change data', () => {
      const result = schema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty currentPassword', () => {
      const result = schema.safeParse({
        currentPassword: '',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak newPassword', () => {
      const result = schema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched password confirmation', () => {
      const result = schema.safeParse({
        currentPassword: 'oldpass123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123',
      });
      expect(result.success).toBe(false);
    });
  });
});
