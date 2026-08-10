import { describe, expect, it, vi } from 'vitest';
import {
  CANONICAL_AUTH_DESTINATION,
  resolveCurrentUserContext,
  type CurrentUserContextClient,
} from '@/lib/current-user-context';

const USER_ID = '10000000-0000-4000-8000-000000000001';
const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';

function createClient(options?: {
  user?: Record<string, unknown> | null;
  authError?: { message: string } | null;
  rpcData?: unknown;
  rpcError?: { message: string } | null;
}) {
  const getUser = vi.fn().mockResolvedValue({
    data: {
      user:
        options && 'user' in options
          ? options.user
          : {
              id: USER_ID,
              email: 'host@example.test',
              email_confirmed_at: '2026-08-10T10:00:00.000Z',
              user_metadata: { full_name: 'Example Host' },
            },
    },
    error: options?.authError ?? null,
  });
  const rpc = vi.fn().mockResolvedValue({
    data:
      options && 'rpcData' in options
        ? options.rpcData
        : [
            {
              user_id: USER_ID,
              account_id: ACCOUNT_ID,
              account_name: 'My account',
              account_role: 'owner',
            },
          ],
    error: options?.rpcError ?? null,
  });

  return {
    client: { auth: { getUser }, rpc } as CurrentUserContextClient,
    getUser,
    rpc,
  };
}

describe('resolveCurrentUserContext', () => {
  it('fails closed when no authenticated user exists', async () => {
    const { client, rpc } = createClient({ user: null });

    await expect(resolveCurrentUserContext(client)).resolves.toEqual({
      success: false,
      authenticated: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Sign in to continue.',
        status: 401,
      },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('sanitizes auth errors and does not bootstrap', async () => {
    const { client, rpc } = createClient({
      authError: { message: 'provider detail that must not escape' },
    });

    const result = await resolveCurrentUserContext(client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'AUTH_REQUIRED', status: 401 },
    });
    expect(JSON.stringify(result)).not.toContain('provider detail');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects an identity without email', async () => {
    const { client, rpc } = createClient({
      user: {
        id: USER_ID,
        email: null,
        email_confirmed_at: '2026-08-10T10:00:00.000Z',
      },
    });

    const result = await resolveCurrentUserContext(client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'EMAIL_REQUIRED', status: 403 },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects an unverified email identity', async () => {
    const { client, rpc } = createClient({
      user: { id: USER_ID, email: 'host@example.test', email_confirmed_at: null },
    });

    const result = await resolveCurrentUserContext(client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'EMAIL_VERIFICATION_REQUIRED', status: 403 },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not treat deprecated confirmed_at as proof of email confirmation', async () => {
    const { client, rpc } = createClient({
      user: {
        id: USER_ID,
        email: 'host@example.test',
        confirmed_at: '2026-08-10T10:00:00.000Z',
      },
    });

    const result = await resolveCurrentUserContext(client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'EMAIL_VERIFICATION_REQUIRED', status: 403 },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('fails closed before bootstrap for thrown auth checks and malformed user IDs', async () => {
    const thrown = createClient();
    thrown.getUser.mockRejectedValueOnce(new Error('raw network detail'));
    const malformedEnvelope = createClient();
    malformedEnvelope.getUser.mockResolvedValueOnce(undefined as never);
    const malformedId = createClient({
      user: {
        id: 'not-a-uuid',
        email: 'host@example.test',
        email_confirmed_at: '2026-08-10T10:00:00.000Z',
      },
    });

    const thrownResult = await resolveCurrentUserContext(thrown.client);
    expect(thrownResult).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'ACCOUNT_CONTEXT_UNAVAILABLE', status: 503 },
    });
    expect(JSON.stringify(thrownResult)).not.toContain('raw network detail');
    expect(thrown.rpc).not.toHaveBeenCalled();

    const malformedEnvelopeResult = await resolveCurrentUserContext(
      malformedEnvelope.client
    );
    expect(malformedEnvelopeResult).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'ACCOUNT_CONTEXT_UNAVAILABLE', status: 503 },
    });
    expect(malformedEnvelope.rpc).not.toHaveBeenCalled();

    const malformedIdResult = await resolveCurrentUserContext(malformedId.client);
    expect(malformedIdResult).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'AUTH_REQUIRED', status: 401 },
    });
    expect(malformedId.rpc).not.toHaveBeenCalled();
  });

  it('returns only a normalized single-account context after bootstrap', async () => {
    const { client, rpc } = createClient({
      user: {
        id: USER_ID,
        email: 'host@example.test',
        email_confirmed_at: '2026-08-10T10:00:00.000Z',
        user_metadata: { full_name: '  Example   Host  ' },
      },
    });

    const result = await resolveCurrentUserContext(client);

    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith('bootstrap_current_user', {
      p_display_name: 'Example Host',
      p_account_name: null,
    });
    expect(result).toEqual({
      success: true,
      authenticated: true,
      context: {
        user: { displayName: 'Example Host' },
        currentAccount: { id: ACCOUNT_ID, name: 'My account' },
        next: CANONICAL_AUTH_DESTINATION,
      },
    });
  });

  it('ignores spoofable authority metadata and never leaks tokens', async () => {
    const { client, rpc } = createClient({
      user: {
        id: USER_ID,
        email: 'host@example.test',
        email_confirmed_at: '2026-08-10T10:00:00.000Z',
        access_token: 'access-secret',
        refresh_token: 'refresh-secret',
        user_metadata: {
          full_name: 'Example Host',
          account_id: 'attacker-account',
          role: 'system_admin',
          email_confirmed: true,
          access_token: 'nested-secret',
        },
      },
    });

    const result = await resolveCurrentUserContext(client);

    expect(rpc).toHaveBeenCalledWith('bootstrap_current_user', {
      p_display_name: 'Example Host',
      p_account_name: null,
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('attacker-account');
    expect(serialized).not.toContain('system_admin');
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('host@example.test');
  });

  it.each([
    ['fallback name', { name: '  Fallback   Host  ' }, 'Fallback Host'],
    ['blank name', { full_name: ' \n\t ' }, null],
    ['overlong name', { full_name: 'a'.repeat(121) }, null],
    ['unsafe control', { full_name: 'Host\u0000Name' }, null],
    ['120 Unicode code points', { full_name: '😀'.repeat(120) }, '😀'.repeat(120)],
    ['non-object metadata', 'Example Host', null],
  ])('normalizes optional metadata safely: %s', async (_label, metadata, expected) => {
    const { client, rpc } = createClient({
      user: {
        id: USER_ID,
        email: 'host@example.test',
        email_confirmed_at: '2026-08-10T10:00:00.000Z',
        user_metadata: metadata,
      },
    });

    const result = await resolveCurrentUserContext(client);

    expect(rpc).toHaveBeenCalledWith('bootstrap_current_user', {
      p_display_name: expected,
      p_account_name: null,
    });
    expect(result).toMatchObject({
      success: true,
      context: { user: { displayName: expected } },
    });
  });

  it('fails closed when bootstrap reports or throws an error', async () => {
    const reported = createClient({ rpcError: { message: 'database detail' } });
    const thrown = createClient();
    thrown.rpc.mockRejectedValueOnce(new Error('network detail'));

    for (const client of [reported.client, thrown.client]) {
      const result = await resolveCurrentUserContext(client);
      expect(result).toMatchObject({
        success: false,
        authenticated: false,
        error: { code: 'ACCOUNT_CONTEXT_UNAVAILABLE', status: 503 },
      });
      expect(JSON.stringify(result)).not.toMatch(/database detail|network detail/);
    }
  });

  it('fails closed when bootstrap returns no result envelope', async () => {
    const malformed = createClient();
    malformed.rpc.mockResolvedValueOnce(undefined as never);

    const result = await resolveCurrentUserContext(malformed.client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'ACCOUNT_CONTEXT_UNAVAILABLE', status: 503 },
    });
  });

  it.each([
    ['no rows', []],
    [
      'wrong user',
      [
        {
          user_id: '10000000-0000-4000-8000-000000000099',
          account_id: ACCOUNT_ID,
          account_name: 'My account',
          account_role: 'owner',
        },
      ],
    ],
    [
      'multiple rows',
      [
        {
          user_id: USER_ID,
          account_id: ACCOUNT_ID,
          account_name: 'My account',
          account_role: 'owner',
        },
        {
          user_id: USER_ID,
          account_id: '20000000-0000-4000-8000-000000000002',
          account_name: 'Other account',
          account_role: 'owner',
        },
      ],
    ],
    [
      'unexpected role',
      [
        {
          user_id: USER_ID,
          account_id: ACCOUNT_ID,
          account_name: 'My account',
          account_role: 'admin',
        },
      ],
    ],
    [
      'unexpected field',
      [
        {
          user_id: USER_ID,
          account_id: ACCOUNT_ID,
          account_name: 'My account',
          account_role: 'owner',
          debug_secret: 'must-fail-closed',
        },
      ],
    ],
  ])('fails closed for malformed bootstrap output: %s', async (_label, rpcData) => {
    const { client } = createClient({ rpcData });

    const result = await resolveCurrentUserContext(client);

    expect(result).toMatchObject({
      success: false,
      authenticated: false,
      error: { code: 'ACCOUNT_CONTEXT_UNAVAILABLE', status: 503 },
    });
  });

  it('has a stable repeated-request contract for idempotent database bootstrap', async () => {
    const { client, getUser, rpc } = createClient();

    const first = await resolveCurrentUserContext(client);
    const second = await resolveCurrentUserContext(client);

    expect(second).toEqual(first);
    expect(getUser).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[1]).toEqual(rpc.mock.calls[0]);
  });
});
