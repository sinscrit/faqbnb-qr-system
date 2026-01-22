/**
 * Server-Side Validation Utilities
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Provides validation functions for use in API routes and server components.
 * Uses next-intl/server for translations.
 *
 * @module validation/server-validation
 * @created 2026-01-22
 * @lastModified 2026-01-22
 *
 * @example
 * ```ts
 * // In an API route
 * export async function POST(request: Request) {
 *   try {
 *     const body = await request.json();
 *     const validatedData = await validateApiRequest(createLoginSchema, body);
 *     // Use validatedData...
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       return Response.json({ errors: error.errors }, { status: 400 });
 *     }
 *   }
 * }
 * ```
 */

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import type { TranslationFunction, SafeParseResult } from './zod-i18n';
import * as schemas from './schema-factories';

/**
 * Custom validation error class for API routes.
 * Contains structured error information for easy response formatting.
 */
export class ValidationError extends Error {
  /**
   * Creates a new ValidationError.
   *
   * @param message - General error message
   * @param errors - Object mapping field paths to error messages
   */
  constructor(
    message: string,
    public readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Get translated validation schemas for server-side use.
 * Async function that retrieves translations before creating schemas.
 *
 * @returns Promise resolving to object containing all validation schemas
 *
 * @example
 * ```ts
 * // In a server component or API route
 * const schemas = await getValidationSchemas();
 * const result = schemas.login.safeParse(formData);
 * ```
 */
export async function getValidationSchemas() {
  const t = (await getTranslations('errors')) as TranslationFunction;

  return {
    login: schemas.createLoginSchema(t),
    registration: schemas.createRegistrationSchema(t),
    property: schemas.createPropertySchema(t),
    itemMetadata: schemas.createItemMetadataSchema(t),
    url: schemas.createUrlSchema(t),
    profile: schemas.createProfileSchema(t),
    passwordChange: schemas.createPasswordChangeSchema(t),
  };
}

/**
 * Validate data server-side with translations.
 * Generic function that works with any schema factory.
 *
 * @param schemaFactory - Factory function that creates the schema
 * @param data - The data to validate
 * @returns Promise resolving to SafeParseResult
 *
 * @example
 * ```ts
 * const result = await validateServerSide(createLoginSchema, {
 *   email: 'user@example.com',
 *   password: 'secret123'
 * });
 *
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle result.error
 * }
 * ```
 */
export async function validateServerSide<T extends z.ZodType>(
  schemaFactory: (t: TranslationFunction) => T,
  data: unknown
): Promise<SafeParseResult<z.output<T>>> {
  const t = (await getTranslations('errors')) as TranslationFunction;
  const schema = schemaFactory(t);
  const result = schema.safeParse(data);
  return result as unknown as SafeParseResult<z.output<T>>;
}

/**
 * API route validation helper.
 * Returns validated data or throws ValidationError with structured error response.
 *
 * @param schemaFactory - Factory function that creates the schema
 * @param data - The data to validate
 * @returns Promise resolving to validated data
 * @throws {ValidationError} If validation fails
 *
 * @example
 * ```ts
 * // In an API route
 * export async function POST(request: Request) {
 *   try {
 *     const body = await request.json();
 *     const validatedData = await validateApiRequest(createRegistrationSchema, body);
 *
 *     // validatedData is typed and validated
 *     await createUser(validatedData);
 *
 *     return Response.json({ success: true });
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       return Response.json(
 *         { success: false, errors: error.errors },
 *         { status: 400 }
 *       );
 *     }
 *
 *     return Response.json(
 *       { success: false, error: 'Server error' },
 *       { status: 500 }
 *     );
 *   }
 * }
 * ```
 */
export async function validateApiRequest<T extends z.ZodType>(
  schemaFactory: (t: TranslationFunction) => T,
  data: unknown
): Promise<z.infer<T>> {
  const result = await validateServerSide(schemaFactory, data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'general';
      // Only set the first error for each field path
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    }

    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}
