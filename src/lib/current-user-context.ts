import { z } from 'zod';

export const CANONICAL_AUTH_DESTINATION = '/dashboard2' as const;

const SAFE_MESSAGES = {
  AUTH_REQUIRED: 'Sign in to continue.',
  EMAIL_REQUIRED: 'A verified email address is required to continue.',
  EMAIL_VERIFICATION_REQUIRED: 'Verify your email address to continue.',
  ACCOUNT_CONTEXT_UNAVAILABLE: 'We could not prepare your account. Please try again.',
} as const;

export type SessionErrorCode = keyof typeof SAFE_MESSAGES;

interface ValidatedAuthUser {
  id: string;
  email?: string | null;
  confirmed_at?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: unknown;
}

interface ClientError {
  message?: string;
}

export interface CurrentUserContextClient {
  auth: {
    getUser(): Promise<{
      data: { user: ValidatedAuthUser | null };
      error: ClientError | null;
    }>;
  };
  rpc(
    functionName: 'bootstrap_current_user',
    args: {
      p_display_name: string | null;
      p_account_name: string | null;
    }
  ): Promise<{
    data: unknown;
    error: ClientError | null;
  }>;
}

export interface CurrentUserContext {
  user: {
    displayName: string | null;
  };
  currentAccount: {
    id: string;
    name: string;
  };
  next: typeof CANONICAL_AUTH_DESTINATION;
}

export type CurrentUserContextResult =
  | {
      success: true;
      authenticated: true;
      context: CurrentUserContext;
    }
  | {
      success: false;
      authenticated: false;
      error: {
        code: SessionErrorCode;
        message: string;
        status: 401 | 403 | 503;
      };
    };

const bootstrapResultSchema = z
  .array(
    z.object({
      user_id: z.string().uuid(),
      account_id: z.string().uuid(),
      account_name: z.string().trim().min(1).max(100),
      account_role: z.literal('owner'),
    }).strict()
  )
  .length(1);

function failure(
  code: SessionErrorCode,
  status: 401 | 403 | 503
): CurrentUserContextResult {
  return {
    success: false,
    authenticated: false,
    error: {
      code,
      message: SAFE_MESSAGES[code],
      status,
    },
  };
}

function optionalDisplayName(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const values = metadata as Record<string, unknown>;
  const candidate = values.full_name ?? values.name;

  if (typeof candidate !== 'string') {
    return null;
  }

  const normalized = candidate.normalize('NFKC').replace(/\s+/gu, ' ').trim();
  const containsUnsafeControl = /[\p{Cc}\p{Cf}]/u.test(normalized);
  const codePointLength = Array.from(normalized).length;

  return !containsUnsafeControl && codePointLength > 0 && codePointLength <= 120
    ? normalized
    : null;
}

/**
 * Resolve the only canonical host context from a request-bound Supabase client.
 *
 * The caller deliberately supplies no request data: identity comes from the
 * cookie session validated by getUser(), and account selection comes only from
 * the transactional database bootstrap function.
 */
export async function resolveCurrentUserContext(
  client: CurrentUserContextClient
): Promise<CurrentUserContextResult> {
  let authResult: Awaited<ReturnType<CurrentUserContextClient['auth']['getUser']>>;

  try {
    authResult = await client.auth.getUser();
  } catch {
    return failure('ACCOUNT_CONTEXT_UNAVAILABLE', 503);
  }

  if (
    !authResult ||
    typeof authResult !== 'object' ||
    !authResult.data ||
    typeof authResult.data !== 'object' ||
    !('user' in authResult.data)
  ) {
    return failure('ACCOUNT_CONTEXT_UNAVAILABLE', 503);
  }

  const user = authResult.data.user;
  if (authResult.error || !user) {
    return failure('AUTH_REQUIRED', 401);
  }

  const parsedUserId = z.string().uuid().safeParse(user.id);
  if (!parsedUserId.success) {
    return failure('AUTH_REQUIRED', 401);
  }

  if (typeof user.email !== 'string' || !user.email.trim()) {
    return failure('EMAIL_REQUIRED', 403);
  }

  // `confirmed_at` is deprecated and may represent phone confirmation. Email
  // ownership therefore requires the email-specific timestamp.
  if (
    typeof user.email_confirmed_at !== 'string' ||
    !user.email_confirmed_at.trim()
  ) {
    return failure('EMAIL_VERIFICATION_REQUIRED', 403);
  }

  const displayName = optionalDisplayName(user.user_metadata);
  let bootstrapResult: Awaited<ReturnType<CurrentUserContextClient['rpc']>>;

  try {
    bootstrapResult = await client.rpc('bootstrap_current_user', {
      p_display_name: displayName,
      p_account_name: null,
    });
  } catch {
    return failure('ACCOUNT_CONTEXT_UNAVAILABLE', 503);
  }

  if (!bootstrapResult || typeof bootstrapResult !== 'object' || bootstrapResult.error) {
    return failure('ACCOUNT_CONTEXT_UNAVAILABLE', 503);
  }

  const parsed = bootstrapResultSchema.safeParse(bootstrapResult.data);
  if (!parsed.success || parsed.data[0].user_id !== parsedUserId.data) {
    return failure('ACCOUNT_CONTEXT_UNAVAILABLE', 503);
  }

  const row = parsed.data[0];
  return {
    success: true,
    authenticated: true,
    context: {
      user: { displayName },
      currentAccount: {
        id: row.account_id,
        name: row.account_name,
      },
      next: CANONICAL_AUTH_DESTINATION,
    },
  };
}
