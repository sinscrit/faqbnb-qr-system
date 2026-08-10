import { z } from 'zod';

export const AUTH_BODY_LIMIT_BYTES = 16_384;
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_RULE_MESSAGE =
  'Use 10 to 128 characters, including at least one letter and one number.';

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .refine((value) => /\p{L}/u.test(value) && /\p{N}/u.test(value), PASSWORD_RULE_MESSAGE);

export const displayNameSchema = z
  .string()
  .transform((value) => value.normalize('NFKC').replace(/\s+/gu, ' ').trim())
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value), 'Display name contains unsupported characters.')
  .refine((value) => Array.from(value).length <= 120, 'Display name must be 120 characters or fewer.')
  .optional()
  .transform((value) => value || undefined);

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
}).strict();

export const registerRequestSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
}).strict().refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const recoveryRequestSchema = z.object({ email: emailSchema }).strict();

export const updatePasswordRequestSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
}).strict().refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export async function parseJsonRequest<T>(request: Request, schema: z.ZodType<T>) {
  const contentType = request.headers.get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    return { success: false as const };
  }

  const declaredLengthHeader = request.headers.get('content-length');
  if (
    declaredLengthHeader !== null &&
    (!/^\d+$/.test(declaredLengthHeader) || Number(declaredLengthHeader) > AUTH_BODY_LIMIT_BYTES)
  ) {
    return { success: false as const };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { success: false as const };
  }
  if (!text || new TextEncoder().encode(text).length > AUTH_BODY_LIMIT_BYTES) {
    return { success: false as const };
  }

  try {
    const result = schema.safeParse(JSON.parse(text));
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const };
  } catch {
    return { success: false as const };
  }
}
