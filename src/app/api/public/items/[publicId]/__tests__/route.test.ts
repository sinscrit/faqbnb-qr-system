import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicSupabaseServer } from '@/lib/supabase-public-server';
import { readPublicItem } from '@/lib/item-boundary';

vi.mock('@/lib/supabase-public-server', () => ({ createPublicSupabaseServer: vi.fn() }));
vi.mock('@/lib/item-boundary', () => ({ readPublicItem: vi.fn() }));

import * as route from '@/app/api/public/items/[publicId]/route';

const PUBLIC_ID = '5abcdef0-0000-4000-8000-000000000001';
const UPPER_PUBLIC_ID = PUBLIC_ID.toUpperCase();
const client = { anonymous: true };

function context(publicId: string) {
  return { params: Promise.resolve({ publicId }) };
}

describe('GET /api/public/items/[publicId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createPublicSupabaseServer).mockReturnValue(client as never);
    vi.mocked(readPublicItem).mockResolvedValue({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine', instructions: [{ title: 'Use it', body: 'Press Start.' }] },
    });
  });

  it('returns only the anonymous instruction projection with no-store', async () => {
    const response = await route.GET(
      new Request(`http://localhost/api/public/items/${UPPER_PUBLIC_ID}?lang=fr&account_id=attacker`),
      context(UPPER_PUBLIC_ID)
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(readPublicItem).toHaveBeenCalledWith(client, PUBLIC_ID);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine', instructions: [{ title: 'Use it', body: 'Press Start.' }] },
    });
    expect(JSON.stringify(body)).not.toMatch(/property|account|user|description|article|link|translation|analytics|internal/i);
  });

  it.each(['not-a-uuid', '', '50000000-0000-1000-0000-000000000001'])('makes invalid ID %j indistinguishable from an unknown item', async (publicId) => {
    const response = await route.GET(
      new Request('http://localhost/api/public/items/invalid'),
      context(publicId)
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.' },
    });
    expect(createPublicSupabaseServer).not.toHaveBeenCalled();
    expect(readPublicItem).not.toHaveBeenCalled();
  });

  it('uses the same 404 response for draft and unknown zero-row results', async () => {
    vi.mocked(readPublicItem).mockResolvedValueOnce({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.', status: 404 },
    });
    const response = await route.GET(
      new Request(`http://localhost/api/public/items/${PUBLIC_ID}`),
      context(PUBLIC_ID)
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.' },
    });
  });

  it('returns a safe no-store 503 for malformed or upstream public data', async () => {
    vi.mocked(readPublicItem).mockResolvedValueOnce({
      success: false,
      error: { code: 'PUBLIC_ITEM_UNAVAILABLE', message: 'This item is temporarily unavailable.', status: 503 },
    });
    const response = await route.GET(
      new Request(`http://localhost/api/public/items/${PUBLIC_ID}`),
      context(PUBLIC_ID)
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      success: false,
      error: { code: 'PUBLIC_ITEM_UNAVAILABLE', message: 'This item is temporarily unavailable.' },
    });
  });

  it('sanitizes public-client and route-param failures', async () => {
    vi.mocked(createPublicSupabaseServer).mockImplementationOnce(() => {
      throw new Error('raw anon configuration');
    });
    const clientFailure = await route.GET(
      new Request(`http://localhost/api/public/items/${PUBLIC_ID}`),
      context(PUBLIC_ID)
    );
    expect(clientFailure.status).toBe(503);
    expect(JSON.stringify(await clientFailure.json())).not.toContain('raw anon');

    const paramsFailure = await route.GET(
      new Request(`http://localhost/api/public/items/${PUBLIC_ID}`),
      { params: Promise.reject(new Error('raw params')) }
    );
    expect(paramsFailure.status).toBe(404);
    expect(await paramsFailure.json()).toEqual({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.' },
    });
  });
});
