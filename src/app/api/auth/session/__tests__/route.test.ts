import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseServer } from '@/lib/supabase-server';

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn(),
}));

import * as sessionRoute from '@/app/api/auth/session/route';

const { GET } = sessionRoute;

const USER_ID = '10000000-0000-4000-8000-000000000001';
const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';

function serverClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: USER_ID,
            email: 'host@example.test',
            email_confirmed_at: '2026-08-10T10:00:00.000Z',
            access_token: 'must-not-leak',
            user_metadata: { full_name: 'Example Host' },
          },
        },
        error: null,
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: [
        {
          user_id: USER_ID,
          account_id: ACCOUNT_ID,
          account_name: 'My account',
          account_role: 'owner',
        },
      ],
      error: null,
    }),
  };
}

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the cookie-backed server client and returns a minimal no-store context', async () => {
    const client = serverClient();
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);

    // Runtime arguments are deliberately ignored: the exported handler has no
    // request parameter, so none of these spoofable values can become context.
    const response = await (GET as unknown as (input: Request) => ReturnType<typeof GET>)(
      new Request(
        `http://localhost/api/auth/session?account_id=attacker&role=system_admin`,
        {
          headers: {
            authorization: 'Bearer attacker-token',
            'x-current-account': 'attacker-account',
          },
        }
      )
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toEqual({
      success: true,
      authenticated: true,
      context: {
        user: { displayName: 'Example Host' },
        currentAccount: { id: ACCOUNT_ID, name: 'My account' },
        next: '/dashboard2',
      },
    });
    expect(client.auth.getUser).toHaveBeenCalledWith();
    expect(client.rpc).toHaveBeenCalledWith('bootstrap_current_user', {
      p_display_name: 'Example Host',
      p_account_name: null,
    });
    expect(JSON.stringify(body)).not.toMatch(/attacker|token|host@example/);
  });

  it('returns a sanitized unauthenticated response', async () => {
    const client = serverClient();
    client.auth.getUser.mockResolvedValueOnce({
      data: { user: null as never },
      error: { message: 'raw auth provider detail' } as never,
    });
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toEqual({
      success: false,
      authenticated: false,
      error: { code: 'AUTH_REQUIRED', message: 'Sign in to continue.' },
    });
    expect(client.rpc).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain('raw auth provider detail');
  });

  it('returns a stable no-store response when email ownership is unverified', async () => {
    const client = serverClient();
    client.auth.getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: USER_ID,
          email: 'host@example.test',
          email_confirmed_at: null,
          user_metadata: { full_name: 'must-not-leak' },
        },
      },
      error: null,
    } as never);
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toEqual({
      success: false,
      authenticated: false,
      error: {
        code: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Verify your email address to continue.',
      },
    });
    expect(client.rpc).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toMatch(/host@example|must-not-leak/);
  });

  it('fails closed when the request-bound client cannot be created', async () => {
    vi.mocked(createSupabaseServer).mockRejectedValueOnce(new Error('configuration detail'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toEqual({
      success: false,
      authenticated: false,
      error: {
        code: 'ACCOUNT_CONTEXT_UNAVAILABLE',
        message: 'We could not prepare your account. Please try again.',
      },
    });
    expect(JSON.stringify(body)).not.toContain('configuration detail');
  });

  it('exports GET only so refresh-token POST payloads receive framework method denial', () => {
    expect('POST' in sessionRoute).toBe(false);
  });
});
