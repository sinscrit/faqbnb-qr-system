import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  listPropertyChoices,
  resolvePropertyContext,
  resolvePropertySelection,
} from '@/lib/property-context';

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServer: vi.fn() }));
vi.mock('@/lib/property-context', async (original) => {
  const module = await original<typeof import('@/lib/property-context')>();
  return {
    ...module,
    listPropertyChoices: vi.fn(),
    resolvePropertyContext: vi.fn(),
    resolvePropertySelection: vi.fn(),
  };
});

import * as route from '@/app/api/user/property-context/route';

const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';
const PROPERTY_ID = '30000000-0000-4000-8000-000000000001';
const OTHER_PROPERTY_ID = '30000000-0000-4000-8000-000000000002';
const client = { cookieBound: true };
const ready = {
  success: true, authenticated: true, accountId: ACCOUNT_ID,
  context: { state: 'ready', propertyCount: 1, property: { id: PROPERTY_ID, name: 'Seaside home' } },
} as const;
const needs = {
  success: true, authenticated: true, accountId: ACCOUNT_ID,
  context: { state: 'needs_property', propertyCount: 0, property: null },
} as const;
const many = {
  success: true, authenticated: true, accountId: ACCOUNT_ID,
  context: { state: 'selection_required', propertyCount: 2, property: null },
} as const;

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/user/property-context?account_id=attacker', {
    method: 'POST',
    headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/user/property-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ORIGIN = 'http://localhost';
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);
    vi.mocked(resolvePropertyContext).mockResolvedValue(needs);
    vi.mocked(resolvePropertySelection).mockResolvedValue(ready);
    vi.mocked(listPropertyChoices).mockResolvedValue([
      { id: PROPERTY_ID, name: 'Alpha' },
      { id: OTHER_PROPERTY_ID, name: 'Beta' },
    ]);
  });

  it('GET supplies no client tenant hint and returns a minimal no-store zero state', async () => {
    const response = await (route.GET as unknown as (request: Request) => ReturnType<typeof route.GET>)(
      new Request('http://localhost/api/user/property-context?account_id=attacker', {
        headers: { authorization: 'Bearer attacker', 'x-account-id': 'attacker' },
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ success: true, context: needs.context });
    expect(resolvePropertyContext).toHaveBeenCalledWith(client);
    expect(JSON.stringify((resolvePropertyContext as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('attacker');
  });

  it('GET returns the one ready property without account, user, role, or metadata', async () => {
    vi.mocked(resolvePropertyContext).mockResolvedValue(ready);
    const response = await route.GET();
    const body = await response.json();
    expect(body).toEqual({ success: true, context: ready.context });
    expect(JSON.stringify(body)).not.toMatch(/account|user|role|email|address|token|type/i);
    expect(listPropertyChoices).not.toHaveBeenCalled();
  });

  it('GET adds only sorted minimal choices after the server-derived many state', async () => {
    vi.mocked(resolvePropertyContext).mockResolvedValue(many);
    const response = await route.GET();
    expect(await response.json()).toEqual({
      success: true,
      context: {
        ...many.context,
        choices: [
          { id: PROPERTY_ID, name: 'Alpha' },
          { id: OTHER_PROPERTY_ID, name: 'Beta' },
        ],
      },
    });
    expect(listPropertyChoices).toHaveBeenCalledWith(client, ACCOUNT_ID, 2);
  });

  it('GET fails safely when the validated choice list cannot be loaded', async () => {
    vi.mocked(resolvePropertyContext).mockResolvedValue(many);
    vi.mocked(listPropertyChoices).mockResolvedValue(null);
    const response = await route.GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      success: false,
      error: { code: 'PROPERTY_CONTEXT_UNAVAILABLE', message: 'We could not load your property. Please try again.' },
    });
  });

  it('POST create accepts only the property name and forwards normalized content', async () => {
    vi.mocked(resolvePropertyContext).mockResolvedValue(ready);
    const response = await route.POST(post({ action: 'create', propertyName: '  Seaside   home  ' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(resolvePropertyContext).toHaveBeenCalledWith(client, { propertyName: 'Seaside home' });
    expect(await response.json()).toEqual({ success: true, context: ready.context });
  });

  it('POST select treats the UUID only as a hint and delegates re-resolution', async () => {
    const response = await route.POST(post({ action: 'select', propertyId: PROPERTY_ID }));
    expect(response.status).toBe(200);
    expect(resolvePropertySelection).toHaveBeenCalledWith(client, PROPERTY_ID);
    expect(resolvePropertyContext).not.toHaveBeenCalled();
  });

  it.each([
    ['wrong origin', { action: 'create', propertyName: 'Home' }, { origin: 'https://evil.test' }],
    ['missing JSON type', { action: 'create', propertyName: 'Home' }, { 'content-type': 'text/plain' }],
    ['extra create field', { action: 'create', propertyName: 'Home', accountId: ACCOUNT_ID }, {}],
    ['extra select field', { action: 'select', propertyId: PROPERTY_ID, role: 'owner' }, {}],
    ['invalid UUID', { action: 'select', propertyId: 'not-a-uuid' }, {}],
    ['blank name', { action: 'create', propertyName: '  ' }, {}],
    ['unsafe name', { action: 'create', propertyName: 'Bad\u200bname' }, {}],
  ])('rejects %s before database work', async (_name, body, headers) => {
    const response = await route.POST(post(body, headers));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(resolvePropertyContext).not.toHaveBeenCalled();
    expect(resolvePropertySelection).not.toHaveBeenCalled();
  });

  it('rejects a body larger than 16 KiB before database work', async () => {
    const response = await route.POST(post({ action: 'create', propertyName: 'a'.repeat(17_000) }));
    expect(response.status).toBe(400);
    expect(resolvePropertyContext).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'AUTH_REQUIRED', 'Sign in to continue.'],
    [403, 'EMAIL_VERIFICATION_REQUIRED', 'Verify your email address to continue.'],
    [404, 'PROPERTY_NOT_FOUND', 'That property is no longer available.'],
    [503, 'PROPERTY_CONTEXT_UNAVAILABLE', 'We could not load your property. Please try again.'],
  ] as const)('preserves stable safe %i failures without upstream leakage', async (status, code, message) => {
    vi.mocked(resolvePropertySelection).mockResolvedValueOnce({
      success: false, authenticated: false, error: { code, status, message },
    });
    const response = await route.POST(post({ action: 'select', propertyId: PROPERTY_ID }));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ success: false, error: { code, message } });
  });

  it('keeps duplicate create and select requests inside the same idempotent resolver contracts', async () => {
    vi.mocked(resolvePropertyContext).mockResolvedValue(ready);
    const createRequest = () => post({ action: 'create', propertyName: 'Seaside home' });
    const selectRequest = () => post({ action: 'select', propertyId: PROPERTY_ID });
    const createBodies = await Promise.all([
      route.POST(createRequest()).then((response) => response.json()),
      route.POST(createRequest()).then((response) => response.json()),
    ]);
    const selectBodies = await Promise.all([
      route.POST(selectRequest()).then((response) => response.json()),
      route.POST(selectRequest()).then((response) => response.json()),
    ]);
    expect(createBodies[1]).toEqual(createBodies[0]);
    expect(selectBodies[1]).toEqual(selectBodies[0]);
  });
});
