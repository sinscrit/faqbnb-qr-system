import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
} as const;

/**
 * Canonical cookie-backed session/account boundary.
 *
 * This handler intentionally accepts no request argument. Headers, query
 * parameters, request bodies, bearer tokens, and client account hints cannot
 * influence identity or account selection.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const result = await resolveCurrentUserContext(
      supabase as unknown as CurrentUserContextClient
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        },
        {
          status: result.error.status,
          headers: RESPONSE_HEADERS,
        }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: {
          code: 'ACCOUNT_CONTEXT_UNAVAILABLE',
          message: 'We could not prepare your account. Please try again.',
        },
      },
      {
        status: 503,
        headers: RESPONSE_HEADERS,
      }
    );
  }
}
