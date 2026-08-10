import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseServer } from '@/lib/supabase-server';
import { createCurrentItem } from '@/lib/item-boundary';

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServer: vi.fn() }));
vi.mock('@/lib/item-boundary', () => ({ createCurrentItem: vi.fn() }));

import * as route from '@/app/api/user/items/route';

const PROPERTY_ID = '3abcdef0-0000-4000-8000-000000000001';
const REQUEST_ID = '4abcdef0-0000-4000-8000-000000000001';
const PUBLIC_ID = '50000000-0000-4000-8000-000000000001';
const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';
const client = { cookieBound: true };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/user/items?account_id=attacker', {
    method: 'POST',
    headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/user/items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ORIGIN = 'http://localhost';
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);
    vi.mocked(createCurrentItem).mockResolvedValue({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine' },
    });
  });

  it('exports only POST and forwards one normalized content payload to the cookie-bound helper', async () => {
    expect('GET' in route).toBe(false);
    const response = await route.POST(post({
      propertyId: PROPERTY_ID.toUpperCase(),
      requestId: REQUEST_ID.toUpperCase(),
      name: '  Coffee   machine  ',
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createCurrentItem).toHaveBeenCalledWith(client, {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(await response.json()).toEqual({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine' },
    });
  });

  it.each([
    ['wrong origin', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle' }, { origin: 'https://evil.test' }],
    ['missing origin', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle' }, { origin: '' }],
    ['wrong content type', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle' }, { 'content-type': 'text/plain' }],
    ['invalid property UUID', { propertyId: 'not-a-uuid', requestId: REQUEST_ID, name: 'Kettle' }, {}],
    ['invalid request UUID', { propertyId: PROPERTY_ID, requestId: 'not-a-uuid', name: 'Kettle' }, {}],
    ['blank name', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: '  ' }, {}],
    ['forged account', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle', accountId: ACCOUNT_ID }, {}],
    ['forged user', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle', userId: 'attacker' }, {}],
    ['forged publish state', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle', publishedAt: 'now' }, {}],
    ['description', { propertyId: PROPERTY_ID, requestId: REQUEST_ID, name: 'Kettle', description: 'instructions' }, {}],
  ])('rejects %s before creating a server client', async (_name, body, headers) => {
    const response = await route.POST(post(body, headers));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createSupabaseServer).not.toHaveBeenCalled();
    expect(createCurrentItem).not.toHaveBeenCalled();
  });

  it('rejects zero-width, newline, and tab names separately before database work', async () => {
    for (const name of ['Bad\u200bname', 'Bad\nname', 'Bad\tname']) {
      const response = await route.POST(post({ propertyId: PROPERTY_ID, requestId: REQUEST_ID, name }));
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    expect(createSupabaseServer).not.toHaveBeenCalled();
    expect(createCurrentItem).not.toHaveBeenCalled();
  });

  it('rejects an over-16-KiB body before creating a server client', async () => {
    const response = await route.POST(post({
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'a'.repeat(17_000),
    }));
    expect(response.status).toBe(400);
    expect(createSupabaseServer).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'AUTH_REQUIRED', 'Sign in to continue.'],
    [403, 'ITEM_CREATION_FORBIDDEN', 'This property cannot be changed.'],
    [404, 'PROPERTY_NOT_FOUND', 'That property is no longer available.'],
    [409, 'ITEM_CREATION_CONFLICT', 'This request was already used for different item details. Try again.'],
  ] as const)('returns the exact safe %i failure without upstream detail', async (status, code, message) => {
    vi.mocked(createCurrentItem).mockResolvedValueOnce({
      success: false,
      error: { status, code, message },
    });
    const response = await route.POST(post({
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    }));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ success: false, error: { code, message } });
  });

  it('sanitizes unexpected server-client failures', async () => {
    vi.mocked(createSupabaseServer).mockRejectedValueOnce(new Error('raw cookie secret'));
    const response = await route.POST(post({
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    }));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: { code: 'ITEM_CREATION_UNAVAILABLE', message: 'We could not create this item. Please try again.' },
    });
    expect(JSON.stringify(body)).not.toContain('raw cookie');
  });
});
