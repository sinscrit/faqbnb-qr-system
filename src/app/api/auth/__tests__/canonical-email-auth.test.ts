import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { resolveCurrentUserContext } from '@/lib/current-user-context';
import { createRecoveryIntent } from '@/lib/recovery-intent';
import { createOAuthState } from '@/lib/oauth-state';

const cookieMocks = vi.hoisted(() => ({
  get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServer: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: cookieMocks.get, getAll: cookieMocks.getAll, set: cookieMocks.set, delete: cookieMocks.delete,
  }),
}));
vi.mock('@/lib/current-user-context', async (original) => {
  const module = await original<typeof import('@/lib/current-user-context')>();
  return { ...module, resolveCurrentUserContext: vi.fn() };
});

import { POST as login } from '@/app/api/auth/login/route';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as requestRecovery } from '@/app/api/auth/recovery/request/route';
import { POST as updatePassword } from '@/app/api/auth/recovery/update/route';
import { GET as confirm } from '@/app/auth/confirm/route';
import { GET as startGoogle } from '@/app/api/auth/google/route';
import { GET as finishGoogle } from '@/app/api/auth/google/callback/route';

const jsonRequest = (path: string, body: object) => new Request(`http://localhost${path}`, {
  method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost' }, body: JSON.stringify(body),
});
const USER_ID = '10000000-0000-4000-8000-000000000001';
const successContext = {
  success: true, authenticated: true,
  context: { user: { displayName: null }, currentAccount: { id: '20000000-0000-4000-8000-000000000001', name: 'My account' }, next: '/dashboard2' },
} as const;
let recoveryIntent: string;
let oauthState: string;

function client() {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }),
      exchangeCodeForSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithIdToken: vi.fn().mockResolvedValue({ data: { user: { id: '10000000-0000-4000-8000-000000000001' } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: '10000000-0000-4000-8000-000000000001' }, error: null }),
        }),
      }),
    }),
  };
}

describe('canonical email auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    process.env.APP_ORIGIN = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    process.env.AUTH_RECOVERY_PROOF_SECRET = 'test-only-recovery-proof-secret-with-at-least-32-bytes';
    process.env.AUTH_OAUTH_STATE_SECRET = 'test-only-oauth-state-secret-with-at-least-32-bytes';
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.GOOGLE_CLIENT_SECRET = '';
    process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED = 'false';
    recoveryIntent = createRecoveryIntent(USER_ID, Date.now(), '30000000-0000-4000-8000-000000000001');
    oauthState = createOAuthState(Date.now(), '40000000-0000-4000-8000-000000000001');
    cookieMocks.getAll.mockReturnValue([{ name: 'sb-test-project-auth-token', value: 'session' }]);
    cookieMocks.get.mockImplementation((name: string) => {
      if (name === 'faqbnb_oauth_state') return { value: oauthState };
      if (name === 'faqbnb_recovery_intent') return { value: recoveryIntent };
      return undefined;
    });
    vi.mocked(resolveCurrentUserContext).mockResolvedValue(successContext);
  });

  it('logs in with the cookie server client, converges context, and returns only dashboard2', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const response = await login(jsonRequest('/api/auth/login', { email: 'host@example.test', password: 'host-guide-2026', next: 'https://evil.test' }));
    expect(response.status).toBe(400);

    const ok = await login(jsonRequest('/api/auth/login', { email: 'host@example.test', password: 'host-guide-2026' }));
    expect(await ok.json()).toEqual({ success: true, next: '/dashboard2' });
    expect(ok.headers.get('cache-control')).toBe('no-store');
    expect(resolveCurrentUserContext).toHaveBeenCalled();
  });

  it('sanitizes invalid credentials and clears a session when context fails closed', async () => {
    const auth = client();
    auth.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { message: 'provider detail and token' } });
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const bad = await login(jsonRequest('/api/auth/login', { email: 'host@example.test', password: 'wrong-password-1' }));
    expect(JSON.stringify(await bad.json())).toBe('{"success":false,"error":{"code":"INVALID_CREDENTIALS","message":"Email or password is incorrect."}}');

    vi.mocked(resolveCurrentUserContext).mockResolvedValueOnce({
      success: false, authenticated: false,
      error: { code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Verify your email address to continue.', status: 403 },
    });
    const unverified = await login(jsonRequest('/api/auth/login', { email: 'host@example.test', password: 'host-guide-2026' }));
    expect(unverified.status).toBe(403);
    expect(auth.auth.signOut).toHaveBeenCalled();
    expect(cookieMocks.set).toHaveBeenCalledWith(
      'sb-test-project-auth-token',
      '',
      expect.objectContaining({ path: '/', maxAge: 0 })
    );
  });

  it('registers without direct table writes or identity response and fails closed on auto-confirm', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const response = await register(jsonRequest('/api/auth/register', {
      displayName: 'Example Host', email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'host-guide-2026',
    }));
    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body).toEqual({ success: true, message: 'Check your email to confirm your account.' });
    expect(JSON.stringify(body)).not.toMatch(/user|session|token|provider|email.*test/);
    expect(auth.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ emailRedirectTo: 'http://localhost/auth/confirm' }),
    }));

    auth.auth.signUp.mockResolvedValueOnce({ data: { user: { identities: [{}] }, session: { access_token: 'secret' } }, error: null });
    const unsafe = await register(jsonRequest('/api/auth/register', {
      email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'host-guide-2026',
    }));
    expect(unsafe.status).toBe(503);
    expect(JSON.stringify(await unsafe.json())).not.toContain('secret');
    expect(auth.auth.signOut).toHaveBeenCalled();
  });

  it('clears an auto-confirm session locally even when provider sign-out fails', async () => {
    const auth = client();
    auth.auth.signUp.mockResolvedValueOnce({ data: { user: { identities: [{}] }, session: { access_token: 'secret' } }, error: null });
    auth.auth.signOut.mockRejectedValueOnce(new Error('provider unavailable with detail'));
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);

    const response = await register(jsonRequest('/api/auth/register', {
      email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'host-guide-2026',
    }));
    expect(response.status).toBe(503);
    expect(cookieMocks.set).toHaveBeenCalledWith(
      'sb-test-project-auth-token',
      '',
      expect.objectContaining({ path: '/', maxAge: 0 })
    );
    expect(JSON.stringify(await response.json())).not.toMatch(/provider|secret|detail/);
  });

  it('adds a browser cookie-clear fallback if neither sign-out nor targeted cleanup can be confirmed', async () => {
    const auth = client();
    auth.auth.signOut.mockRejectedValueOnce(new Error('provider unavailable'));
    cookieMocks.getAll.mockImplementationOnce(() => { throw new Error('cookie store unavailable'); });
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    vi.mocked(resolveCurrentUserContext).mockResolvedValueOnce({
      success: false, authenticated: false,
      error: { code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Verify your email address to continue.', status: 403 },
    });
    const response = await login(jsonRequest('/api/auth/login', {
      email: 'host@example.test', password: 'host-guide-2026',
    }));
    expect(response.status).toBe(403);
    expect(response.headers.get('clear-site-data')).toBe('"cookies"');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps existing-identity registration and recovery requests enumeration-resistant', async () => {
    const auth = client();
    auth.auth.signUp.mockResolvedValueOnce({ data: { user: { identities: [] }, session: null }, error: null });
    auth.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const duplicate = await register(jsonRequest('/api/auth/register', {
      email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'host-guide-2026',
    }));
    const recovery = await requestRecovery(jsonRequest('/api/auth/recovery/request', { email: 'host@example.test' }));
    expect(duplicate.status).toBe(202);
    expect(recovery.status).toBe(202);
    expect(await recovery.json()).toEqual({ success: true, message: 'If an account exists, a recovery link is on its way.' });
    expect(auth.auth.resetPasswordForEmail).toHaveBeenCalledWith('host@example.test', { redirectTo: 'http://localhost/auth/confirm?flow=recovery' });
  });

  it('requires a recovery cookie session and converges through current context after update', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const response = await updatePassword(jsonRequest('/api/auth/recovery/update', { password: 'new-password-2026', confirmPassword: 'new-password-2026' }));
    expect(await response.json()).toEqual({ success: true, next: '/dashboard2' });
    expect(resolveCurrentUserContext).toHaveBeenCalled();
    expect(auth.auth.getUser).toHaveBeenCalled();

    auth.auth.updateUser.mockResolvedValueOnce({ data: null, error: { message: 'expired token detail' } });
    const expired = await updatePassword(jsonRequest('/api/auth/recovery/update', { password: 'new-password-2026', confirmPassword: 'new-password-2026' }));
    expect(expired.status).toBe(401);
    expect(JSON.stringify(await expired.json())).not.toContain('token detail');
  });

  it('rejects an ordinary authenticated session without callback-minted recovery intent', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    cookieMocks.get.mockImplementation((name: string) =>
      name === 'faqbnb_oauth_state' ? { value: oauthState } : undefined
    );
    const response = await updatePassword(jsonRequest('/api/auth/recovery/update', {
      password: 'new-password-2026', confirmPassword: 'new-password-2026',
    }));
    expect(response.status).toBe(401);
    expect(auth.auth.updateUser).not.toHaveBeenCalled();
    expect(cookieMocks.set).toHaveBeenCalledWith(
      'faqbnb_recovery_intent',
      '',
      expect.objectContaining({ path: '/api/auth/recovery/update', maxAge: 0 })
    );
  });

  it('rejects forged or wrong-user recovery proofs and consumes them before validation', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    cookieMocks.get.mockImplementation((name: string) =>
      name === 'faqbnb_recovery_intent'
        ? { value: 'v1.1780000000.30000000-0000-4000-8000-000000000001.' + 'a'.repeat(64) }
        : undefined
    );
    const forged = await updatePassword(jsonRequest('/api/auth/recovery/update', {
      password: 'new-password-2026', confirmPassword: 'new-password-2026',
    }));
    expect(forged.status).toBe(401);
    expect(auth.auth.updateUser).not.toHaveBeenCalled();
    expect(cookieMocks.set).toHaveBeenCalledWith(
      'faqbnb_recovery_intent', '', expect.objectContaining({ maxAge: 0 })
    );
  });

  it('supports code and token-hash callbacks with only allowlisted destinations', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const confirmation = await confirm(new NextRequest('http://localhost/auth/confirm?code=secret&next=https://evil.test'));
    expect(confirmation.headers.get('location')).toBe('http://localhost/dashboard2');
    expect(auth.auth.exchangeCodeForSession).toHaveBeenCalledWith('secret');

    const recovery = await confirm(new NextRequest('http://localhost/auth/confirm?token_hash=hash&type=recovery&next=https://evil.test'));
    expect(recovery.headers.get('location')).toBe('http://localhost/reset-password');
    expect(auth.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'hash', type: 'recovery' });
    const recoveryCookie = recovery.headers.get('set-cookie');
    expect(recoveryCookie).toContain('faqbnb_recovery_intent=');
    expect(recoveryCookie).toContain('Path=/api/auth/recovery/update');
    expect(recoveryCookie).toContain('HttpOnly');
    expect(recoveryCookie).toContain('SameSite=strict');
    expect(recoveryCookie).not.toContain(USER_ID);

    auth.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: { message: 'raw code' } });
    const failed = await confirm(new NextRequest('http://localhost/auth/confirm?code=bad'));
    expect(failed.headers.get('location')).toBe('http://localhost/login?notice=confirmation_failed');
  });

  it('rejects ambiguous or confused confirmation callback shapes', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const ambiguous = await confirm(new NextRequest('http://localhost/auth/confirm?code=code&token_hash=hash&type=recovery'));
    expect(ambiguous.headers.get('location')).toBe('http://localhost/forgot-password?notice=recovery_failed');
    expect(auth.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(auth.auth.verifyOtp).not.toHaveBeenCalled();

    const confused = await confirm(new NextRequest('http://localhost/auth/confirm?token_hash=hash&type=signup&flow=recovery'));
    expect(confused.headers.get('location')).toBe('http://localhost/login?notice=confirmation_failed');
    expect(auth.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it('requires same-origin JSON mutations, returns no-store, and does not call providers on rejection', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const wrongOrigin = new Request('http://localhost/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.test' },
      body: JSON.stringify({ email: 'host@example.test', password: 'host-guide-2026' }),
    });
    const rejectedOrigin = await login(wrongOrigin);
    expect(rejectedOrigin.status).toBe(400);
    expect(rejectedOrigin.headers.get('cache-control')).toBe('no-store');

    const wrongType = new Request('http://localhost/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'text/plain', origin: 'http://localhost' },
      body: JSON.stringify({ email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'host-guide-2026' }),
    });
    const rejectedType = await register(wrongType);
    expect(rejectedType.status).toBe(400);
    expect(rejectedType.headers.get('cache-control')).toBe('no-store');
    expect(createSupabaseServer).not.toHaveBeenCalled();
  });

  it('keeps Google disabled unless the complete existing-user compatibility gate is explicit', async () => {
    const disabled = await startGoogle();
    expect(disabled.headers.get('location')).toBe('http://localhost/login?notice=google_unavailable');
    expect(disabled.headers.get('cache-control')).toBe('no-store');

    process.env.GOOGLE_CLIENT_ID = 'configured-client';
    process.env.GOOGLE_CLIENT_SECRET = 'configured-secret';
    process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED = 'true';
    process.env.AUTH_OAUTH_STATE_SECRET = '';
    const unsigned = await startGoogle();
    expect(unsigned.headers.get('location')).toBe('http://localhost/login?notice=google_unavailable');

    process.env.AUTH_OAUTH_STATE_SECRET = 'test-only-oauth-state-secret-with-at-least-32-bytes';
    const enabled = await startGoogle();
    expect(enabled.headers.get('location')).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(enabled.headers.get('cache-control')).toBe('no-store');
    expect(cookieMocks.set).toHaveBeenCalledWith('faqbnb_oauth_state', expect.stringMatching(/^v1\./), expect.objectContaining({
      httpOnly: true, sameSite: 'lax', path: '/api/auth/google/callback',
    }));
  });

  it('rejects a shadowed UUID-shaped Google state before token exchange', async () => {
    process.env.GOOGLE_CLIENT_ID = 'configured-client';
    process.env.GOOGLE_CLIENT_SECRET = 'configured-secret';
    process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED = 'true';
    cookieMocks.get.mockImplementation((name: string) =>
      name === 'faqbnb_oauth_state' ? { value: '40000000-0000-4000-8000-000000000001' } : undefined
    );
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await finishGoogle(new NextRequest(
      'http://localhost/api/auth/google/callback?code=code&state=40000000-0000-4000-8000-000000000001'
    ));
    expect(response.headers.get('location')).toBe('http://localhost/login?notice=google_failed');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookieMocks.set).toHaveBeenCalledWith(
      'faqbnb_oauth_state', '', expect.objectContaining({ path: '/api/auth/google/callback', maxAge: 0 })
    );
  });

  it('denies an unknown Google profile without application enrollment', async () => {
    process.env.GOOGLE_CLIENT_ID = 'configured-client';
    process.env.GOOGLE_CLIENT_SECRET = 'configured-secret';
    process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED = 'true';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id_token: 'provider-token' }), { status: 200 })));
    const auth = client();
    auth.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
    });
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);

    const response = await finishGoogle(new NextRequest(`http://localhost/api/auth/google/callback?code=code&state=${encodeURIComponent(oauthState)}`));
    expect(response.headers.get('location')).toBe('http://localhost/login?notice=google_failed');
    expect(auth.auth.signOut).toHaveBeenCalled();
    expect(resolveCurrentUserContext).not.toHaveBeenCalled();
  });

  it('allows an existing Google profile to converge only to dashboard2', async () => {
    process.env.GOOGLE_CLIENT_ID = 'configured-client';
    process.env.GOOGLE_CLIENT_SECRET = 'configured-secret';
    process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED = 'true';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id_token: 'provider-token' }), { status: 200 })));
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);

    const response = await finishGoogle(new NextRequest(`http://localhost/api/auth/google/callback?code=code&state=${encodeURIComponent(oauthState)}&next=https://evil.test`));
    expect(response.headers.get('location')).toBe('http://localhost/dashboard2');
    expect(resolveCurrentUserContext).toHaveBeenCalled();
  });
});
