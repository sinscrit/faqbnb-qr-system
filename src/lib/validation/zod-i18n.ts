/**
 * Zod-i18n Integration Utilities
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Provides utilities for creating Zod schemas with translated error messages.
 * Works with both client-side (useTranslations) and server-side (getTranslations) contexts.
 *
 * In Zod v4, error customization is done at the schema level using the `error` parameter,
 * rather than global error maps. This module provides helper functions for creating
 * translated schemas.
 *
 * @module validation/zod-i18n
 * @created 2026-01-22
 * @lastModified 2026-01-22
 *
 * @example Client-side usage:
 * ```tsx
 * const t = useTranslations('errors');
 * const schema = createLoginSchema(t);
 * const result = schema.safeParse(data);
 * ```
 *
 * @example Server-side usage:
 * ```ts
 * const t = await getTranslations('errors');
 * const schema = createLoginSchema(t);
 * const result = schema.safeParse(data);
 * ```
 */

import { z } from 'zod';

/**
 * Translation function type that matches next-intl signature.
 * Accepts a translation key and optional interpolation parameters.
 *
 * @param key - The translation key (e.g., 'form.required')
 * @param params - Optional parameters for interpolation (e.g., { min: 8 })
 * @returns The translated string
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Zod validation issue type (simplified)
 */
export interface ZodIssue {
  code: string;
  message: string;
  path: PropertyKey[];
  input?: unknown;
  [key: string]: unknown;
}

/**
 * Safe parse error type
 */
export interface SafeParseError {
  issues: ZodIssue[];
}

/**
 * Safe parse result type compatible with Zod v4
 */
export type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: SafeParseError };

/**
 * Creates a Zod v4 error map function that uses translation keys.
 * Maps Zod's issue codes to appropriate translation keys from the errors namespace.
 *
 * @param t - Translation function from next-intl
 * @returns An error map function for use with z.config
 *
 * @example
 * ```ts
 * const errorMap = createZodErrorMap(t);
 * z.config({ customError: errorMap });
 * ```
 */
export function createZodErrorMap(
  t: TranslationFunction
): (issue: { code: string; input?: unknown; [key: string]: unknown }) => string | undefined {
  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        // Check if value is missing (undefined/null)
        if (issue.input === undefined || issue.input === null) {
          return t('form.required');
        }
        return t('form.invalidFormat');

      case 'invalid_format':
        // Handle string format validations (email, url, etc.)
        if ('format' in issue) {
          if (issue.format === 'email') {
            return t('form.email');
          }
          if (issue.format === 'url') {
            return t('form.invalidUrl');
          }
          if (issue.format === 'regex') {
            return t('form.invalidFormat');
          }
        }
        return t('form.invalidFormat');

      case 'too_small':
        if (issue.origin === 'string') {
          if (issue.minimum === 1) {
            return t('form.required');
          }
          return t('form.minLength', { min: Number(issue.minimum) });
        }
        return undefined; // Use default

      case 'too_big':
        if (issue.origin === 'string') {
          return t('form.maxLength', { max: Number(issue.maximum) });
        }
        return undefined; // Use default

      case 'invalid_value':
        // For literal validation (e.g., agreeToTerms must be true)
        return t('form.required');

      case 'custom':
        // Custom errors should already have the message set
        return (issue.message as string) || t('form.invalidFormat');

      default:
        return t('api.generic');
    }
  };
}

/**
 * Configure Zod to use translations globally.
 * Call this at app initialization with the translation function.
 *
 * Note: In Zod v4, it's recommended to configure translations at the schema level
 * for better control. This function sets a global fallback.
 *
 * @param t - Translation function from next-intl
 *
 * @example
 * ```ts
 * // In app initialization
 * const t = useTranslations('errors');
 * configureZodErrors(t);
 * ```
 */
export function configureZodErrors(t: TranslationFunction): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  z.config({ customError: createZodErrorMap(t) as any });
}

/**
 * Parse data with a Zod schema.
 * Throws an error if validation fails.
 *
 * Note: In Zod v4, error messages are configured at the schema level,
 * not at parse time. This function is a simple wrapper for consistency.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated and typed data
 * @throws {Error} If validation fails
 *
 * @example
 * ```ts
 * try {
 *   const validData = parseWithTranslations(loginSchema, formData, t);
 *   // Use validData...
 * } catch (error) {
 *   // Handle validation errors
 * }
 * ```
 */
export function parseWithTranslations<T extends z.ZodType>(
  schema: T,
  data: unknown,
  _t: TranslationFunction
): z.infer<T> {
  // In Zod v4, error messages are set at schema definition time
  // The translation function is used when creating schemas
  return schema.parse(data);
}

/**
 * Safely parse data with a Zod schema.
 * Returns a result object instead of throwing.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns A SafeParseResult with success/error information
 *
 * @example
 * ```ts
 * const result = safeParseWithTranslations(loginSchema, formData, t);
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle result.error
 * }
 * ```
 */
export function safeParseWithTranslations<T extends z.ZodType>(
  schema: T,
  data: unknown,
  _t: TranslationFunction
): SafeParseResult<z.output<T>> {
  // In Zod v4, error messages are set at schema definition time
  const result = schema.safeParse(data);
  // Cast to our simplified SafeParseResult type
  return result as unknown as SafeParseResult<z.output<T>>;
}
