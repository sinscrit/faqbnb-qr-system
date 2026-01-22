/**
 * Validation Schema Factory Functions
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Factory functions that create Zod schemas with translated error messages.
 * Each factory receives a translation function and returns a configured schema.
 *
 * Uses Zod v4's `error` parameter for custom error messages.
 *
 * @module validation/schema-factories
 * @created 2026-01-22
 * @lastModified 2026-01-22
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const loginSchema = createLoginSchema(t);
 * const result = loginSchema.safeParse(formData);
 * ```
 */

import { z } from 'zod';
import type { TranslationFunction } from './zod-i18n';

// =============================================================================
// Authentication Schemas
// =============================================================================

/**
 * Creates a login form validation schema with translated error messages.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for login form validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createLoginSchema(t);
 * const result = schema.safeParse({ email: 'user@example.com', password: 'secret' });
 * ```
 */
export function createLoginSchema(t: TranslationFunction) {
  return z.object({
    email: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .email({ error: t('form.email') }),
    password: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .min(6, { error: t('form.password.tooShort', { min: 6 }) }),
    rememberMe: z.boolean().optional(),
  });
}

/**
 * Inferred type for login form data
 */
export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Creates a registration form validation schema with translated error messages.
 * Includes password confirmation refinement.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for registration form validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createRegistrationSchema(t);
 * const result = schema.safeParse({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   confirmPassword: 'SecurePass123',
 *   agreeToTerms: true
 * });
 * ```
 */
export function createRegistrationSchema(t: TranslationFunction) {
  return z
    .object({
      email: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') })
        .email({ error: t('form.email') }),
      password: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') })
        .min(8, { error: t('form.password.tooShort', { min: 8 }) })
        .regex(/[a-z]/, { error: t('form.password.tooWeak') })
        .regex(/[A-Z]/, { error: t('form.password.tooWeak') })
        .regex(/\d/, { error: t('form.password.tooWeak') }),
      confirmPassword: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') }),
      fullName: z
        .string()
        .min(2, { error: t('form.minLength', { min: 2 }) })
        .optional()
        .or(z.literal('')),
      agreeToTerms: z.literal(true, { error: t('form.termsRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: t('form.password.mismatch'),
      path: ['confirmPassword'],
    });
}

/**
 * Inferred type for registration form data
 */
export type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;

// =============================================================================
// Property Management Schemas
// =============================================================================

/**
 * Creates a property form validation schema with translated error messages.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for property form validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createPropertySchema(t);
 * const result = schema.safeParse({
 *   nickname: 'Beach House',
 *   propertyTypeId: 'apt-123'
 * });
 * ```
 */
export function createPropertySchema(t: TranslationFunction) {
  return z.object({
    nickname: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .max(100, { error: t('form.maxLength', { max: 100 }) }),
    propertyTypeId: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') }),
    address: z
      .string()
      .max(500, { error: t('form.maxLength', { max: 500 }) })
      .optional()
      .or(z.literal('')),
    userId: z.string().optional(),
  });
}

/**
 * Inferred type for property form data
 */
export type PropertyFormData = z.infer<ReturnType<typeof createPropertySchema>>;

// =============================================================================
// Item Capture Schemas
// =============================================================================

/**
 * Creates an item metadata validation schema with translated error messages.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for item metadata validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createItemMetadataSchema(t);
 * const result = schema.safeParse({
 *   title: 'WiFi Router',
 *   propertyId: 'prop-123'
 * });
 * ```
 */
export function createItemMetadataSchema(t: TranslationFunction) {
  return z.object({
    title: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .max(200, { error: t('form.maxLength', { max: 200 }) }),
    description: z
      .string()
      .max(5000, { error: t('form.maxLength', { max: 5000 }) })
      .optional(),
    roomId: z.string().optional(),
    propertyId: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') }),
    tags: z.array(z.string()).optional(),
  });
}

/**
 * Inferred type for item metadata form data
 */
export type ItemMetadataFormData = z.infer<ReturnType<typeof createItemMetadataSchema>>;

/**
 * Creates a URL validation schema with translated error messages.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for URL validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createUrlSchema(t);
 * const result = schema.safeParse({
 *   url: 'https://example.com/manual.pdf',
 *   title: 'User Manual'
 * });
 * ```
 */
export function createUrlSchema(t: TranslationFunction) {
  return z.object({
    url: z
      .string({ error: t('form.required') })
      .min(1, { error: t('form.required') })
      .url({ error: t('form.invalidUrl') })
      .max(2048, { error: t('form.maxLength', { max: 2048 }) }),
    title: z
      .string()
      .max(200, { error: t('form.maxLength', { max: 200 }) })
      .optional(),
  });
}

/**
 * Inferred type for URL form data
 */
export type UrlFormData = z.infer<ReturnType<typeof createUrlSchema>>;

// =============================================================================
// Settings & Profile Schemas
// =============================================================================

/**
 * Creates a profile update validation schema with translated error messages.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for profile update validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createProfileSchema(t);
 * const result = schema.safeParse({
 *   fullName: 'John Doe',
 *   displayName: 'johnd'
 * });
 * ```
 */
export function createProfileSchema(t: TranslationFunction) {
  return z.object({
    fullName: z
      .string()
      .min(2, { error: t('form.minLength', { min: 2 }) })
      .max(100, { error: t('form.maxLength', { max: 100 }) })
      .optional()
      .or(z.literal('')),
    displayName: z
      .string()
      .max(50, { error: t('form.maxLength', { max: 50 }) })
      .optional(),
  });
}

/**
 * Inferred type for profile form data
 */
export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

/**
 * Creates a password change validation schema with translated error messages.
 * Includes password confirmation refinement.
 *
 * @param t - Translation function from next-intl (errors namespace)
 * @returns Zod schema for password change validation
 *
 * @example
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createPasswordChangeSchema(t);
 * const result = schema.safeParse({
 *   currentPassword: 'oldpass',
 *   newPassword: 'NewSecure123',
 *   confirmNewPassword: 'NewSecure123'
 * });
 * ```
 */
export function createPasswordChangeSchema(t: TranslationFunction) {
  return z
    .object({
      currentPassword: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') }),
      newPassword: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') })
        .min(8, { error: t('form.password.tooShort', { min: 8 }) })
        .regex(/[a-z]/, { error: t('form.password.tooWeak') })
        .regex(/[A-Z]/, { error: t('form.password.tooWeak') })
        .regex(/\d/, { error: t('form.password.tooWeak') }),
      confirmNewPassword: z
        .string({ error: t('form.required') })
        .min(1, { error: t('form.required') }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      error: t('form.password.mismatch'),
      path: ['confirmNewPassword'],
    });
}

/**
 * Inferred type for password change form data
 */
export type PasswordChangeFormData = z.infer<ReturnType<typeof createPasswordChangeSchema>>;
