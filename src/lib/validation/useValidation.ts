/**
 * React Hook for Form Validation with Zod
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Provides hooks that create translated Zod schemas for form validation.
 * Integrates with next-intl for i18n support.
 *
 * @module validation/useValidation
 * @created 2026-01-22
 * @lastModified 2026-01-22
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const schemas = useValidationSchemas();
 *   const [errors, setErrors] = useState<Record<string, string>>({});
 *
 *   const handleSubmit = (e: React.FormEvent) => {
 *     e.preventDefault();
 *     const result = schemas.login.safeParse(formData);
 *     if (!result.success) {
 *       setErrors(extractErrors(result));
 *       return;
 *     }
 *     // Submit validated data
 *   };
 * }
 * ```
 */

'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import type { TranslationFunction, SafeParseResult } from './zod-i18n';
import * as schemas from './schema-factories';

/**
 * Hook for accessing all translated validation schemas.
 * Returns memoized schemas that update when locale changes.
 *
 * @returns Object containing all validation schemas
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const schemas = useValidationSchemas();
 *
 *   const handleValidate = () => {
 *     const result = schemas.login.safeParse(formData);
 *     // Handle result...
 *   };
 *
 *   return <form>...</form>;
 * }
 * ```
 */
export function useValidationSchemas() {
  const t = useTranslations('errors') as TranslationFunction;

  return useMemo(
    () => ({
      login: schemas.createLoginSchema(t),
      registration: schemas.createRegistrationSchema(t),
      property: schemas.createPropertySchema(t),
      itemMetadata: schemas.createItemMetadataSchema(t),
      url: schemas.createUrlSchema(t),
      profile: schemas.createProfileSchema(t),
      passwordChange: schemas.createPasswordChangeSchema(t),
    }),
    [t]
  );
}

/**
 * Hook for validating form data with a specific schema factory.
 * Provides validate and validateField callbacks for flexibility.
 *
 * @param schemaFactory - Factory function that creates the schema
 * @returns Object with schema, validate, and validateField functions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { validate, validateField } = useFormValidation(createLoginSchema);
 *
 *   const handleBlur = (field: string, value: string) => {
 *     const result = validateField(field, value);
 *     if (!result.success) {
 *       setFieldError(field, result.error.issues[0].message);
 *     }
 *   };
 *
 *   const handleSubmit = () => {
 *     const result = validate(formData);
 *     if (!result.success) {
 *       setErrors(extractErrors(result));
 *     }
 *   };
 * }
 * ```
 */
export function useFormValidation<T extends z.ZodType>(
  schemaFactory: (t: TranslationFunction) => T
) {
  const t = useTranslations('errors') as TranslationFunction;

  const schema = useMemo(() => schemaFactory(t), [t, schemaFactory]);

  const validate = useCallback(
    (data: unknown): SafeParseResult<z.output<T>> => {
      const result = schema.safeParse(data);
      return result as unknown as SafeParseResult<z.output<T>>;
    },
    [schema]
  );

  const validateField = useCallback(
    (fieldName: string, value: unknown): SafeParseResult<unknown> => {
      // Get the shape of the schema if it's an object schema
      const zodSchema = schema as z.ZodType & { shape?: Record<string, z.ZodType> };
      if (!zodSchema.shape) {
        return { success: true, data: value };
      }

      const fieldSchema = zodSchema.shape[fieldName];
      if (!fieldSchema) {
        return { success: true, data: value };
      }

      const result = fieldSchema.safeParse(value);
      return result as unknown as SafeParseResult<unknown>;
    },
    [schema]
  );

  return {
    schema,
    validate,
    validateField,
  };
}

/**
 * Extracts error messages from a Zod validation result into a flat object.
 * Useful for displaying errors next to form fields.
 *
 * @param result - The SafeParseResult from Zod validation
 * @returns Object mapping field paths to error messages
 *
 * @example
 * ```tsx
 * const result = schema.safeParse(formData);
 * const errors = extractErrors(result);
 * // errors = { email: "Please enter a valid email", password: "Required" }
 *
 * return (
 *   <form>
 *     <input name="email" />
 *     {errors.email && <span className="error">{errors.email}</span>}
 *   </form>
 * );
 * ```
 */
export function extractErrors<T>(
  result: SafeParseResult<T>
): Record<string, string> {
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    // Only set the first error for each field path
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
