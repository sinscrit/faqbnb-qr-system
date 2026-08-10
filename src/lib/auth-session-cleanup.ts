import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type SignOutClient = {
  auth: {
    signOut(options?: { scope?: 'local' }): Promise<{ error?: unknown } | unknown>;
  };
};

function authStorageKey(): string {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configured) throw new Error('Supabase URL is not configured');
  const url = new URL(configured);
  if (!url.hostname) throw new Error('Supabase URL is invalid');
  return `sb-${url.hostname.split('.')[0]}-auth-token`;
}

function isAuthCookie(name: string, storageKey: string): boolean {
  return (
    name === storageKey ||
    name.startsWith(`${storageKey}.`) ||
    name === `${storageKey}-code-verifier` ||
    name.startsWith(`${storageKey}-code-verifier.`) ||
    name === `${storageKey}-user` ||
    name.startsWith(`${storageKey}-user.`)
  );
}

/**
 * Clear the local cookie session even when provider-side sign-out fails.
 * This is required after a newly-created session fails an application gate.
 */
export async function clearAuthSession(client: SignOutClient): Promise<boolean> {
  let cleared = false;
  try {
    const result = await client.auth.signOut({ scope: 'local' });
    cleared = !(result && typeof result === 'object' && 'error' in result && result.error);
  } catch {
    // Continue to deterministic local cookie removal.
  }

  try {
    const storageKey = authStorageKey();
    const cookieStore = await cookies();
    let removed = 0;
    for (const cookie of cookieStore.getAll()) {
      if (!isAuthCookie(cookie.name, storageKey)) continue;
      cookieStore.set(cookie.name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      removed += 1;
    }
    cleared = cleared || removed > 0;
  } catch {
    // The caller must continue to fail closed; never report auth success.
  }
  return cleared;
}

export async function failWithClearedAuthSession(
  client: SignOutClient,
  response: NextResponse
): Promise<NextResponse> {
  if (!(await clearAuthSession(client))) {
    // Last-resort browser defense when neither provider sign-out nor targeted
    // cookie deletion can be confirmed. This is intentionally only attached
    // to an already failing auth response.
    response.headers.set('Clear-Site-Data', '"cookies"');
  }
  return response;
}
