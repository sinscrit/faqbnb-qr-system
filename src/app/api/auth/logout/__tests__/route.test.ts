import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseServer } from '@/lib/supabase-server';

const cookieStore = vi.hoisted(() => ({ getAll: vi.fn(), set: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServer: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: cookieStore.getAll, set: cookieStore.set }),
}));

import * as route from '@/app/api/auth/logout/route';

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/auth/logout', {
    method: 'POST',
    headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers },
    body: '{}',
  });
}

function client() {
  return { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } };
}

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ORIGIN = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    cookieStore.getAll.mockReturnValue([{ name: 'sb-test-project-auth-token', value: 'secret' }]);
  });

  it('exports POST only and clears the cookie-backed local session without logging details', async () => {
    const auth = client();
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const info = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await route.POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ success: true, next: '/login' });
    expect(auth.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(cookieStore.set).toHaveBeenCalledWith(
      'sb-test-project-auth-token', '', expect.objectContaining({ path: '/', maxAge: 0 })
    );
    expect(info).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect('GET' in route).toBe(false);
  });

  it('still succeeds through deterministic cookie removal when provider sign-out fails', async () => {
    const auth = client();
    auth.auth.signOut.mockRejectedValueOnce(new Error('raw provider token detail'));
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const response = await route.POST(request());
    expect(response.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toMatch(/provider|token|detail/);
  });

  it('fails closed with browser cleanup fallback when local cleanup cannot be confirmed', async () => {
    const auth = client();
    auth.auth.signOut.mockRejectedValueOnce(new Error('provider unavailable'));
    cookieStore.getAll.mockReturnValue([]);
    vi.mocked(createSupabaseServer).mockResolvedValue(auth as never);
    const response = await route.POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('clear-site-data')).toBe('"cookies"');
    expect(await response.json()).toEqual({
      success: false,
      error: { code: 'LOGOUT_UNAVAILABLE', message: 'We could not sign you out. Please try again.' },
    });
  });

  it.each([
    ['missing origin', {}],
    ['cross origin', { origin: 'https://evil.test' }],
  ])('rejects %s before creating a cookie client', async (_name, headers) => {
    const response = await route.POST(new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: '{}',
    }));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createSupabaseServer).not.toHaveBeenCalled();
  });

  it.each([
    ['missing JSON type', undefined, '{}'],
    ['missing body', 'application/json', undefined],
    ['extra field', 'application/json', '{"next":"https://evil.test"}'],
    ['malformed JSON', 'application/json', '{'],
  ])('rejects %s before creating a cookie client', async (_name, contentType, body) => {
    const response = await route.POST(new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        origin: 'http://localhost',
        ...(contentType ? { 'content-type': contentType } : {}),
      },
      body,
    }));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createSupabaseServer).not.toHaveBeenCalled();
  });
});
