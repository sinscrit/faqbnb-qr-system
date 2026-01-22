/**
 * Validation Module
 * REQ-E02-036: Update Zod Schemas to Use Translated Messages
 *
 * Centralized exports for Zod-based validation with i18n support.
 * Provides both client-side hooks and server-side utilities.
 *
 * @module validation
 * @created 2026-01-22
 * @lastModified 2026-01-22
 *
 * @example Client-side usage:
 * ```tsx
 * import { useValidationSchemas, extractErrors } from '@/lib/validation';
 *
 * function MyForm() {
 *   const schemas = useValidationSchemas();
 *   const result = schemas.login.safeParse(formData);
 *   const errors = extractErrors(result);
 * }
 * ```
 *
 * @example Server-side usage:
 * ```ts
 * import { validateApiRequest, createLoginSchema, ValidationError } from '@/lib/validation';
 *
 * export async function POST(request: Request) {
 *   try {
 *     const data = await validateApiRequest(createLoginSchema, await request.json());
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       return Response.json({ errors: error.errors }, { status: 400 });
 *     }
 *   }
 * }
 * ```
 */

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
  createPropertySchema,
  createItemMetadataSchema,
  createUrlSchema,
  createProfileSchema,
  createPasswordChangeSchema,
  type LoginFormData,
  type RegistrationFormData,
  type PropertyFormData,
  type ItemMetadataFormData,
  type UrlFormData,
  type ProfileFormData,
  type PasswordChangeFormData,
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
