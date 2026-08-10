import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseServer } from '@/lib/supabase-server';
import { publishCurrentItem } from '@/lib/item-boundary';
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServer: vi.fn() }));
vi.mock('@/lib/item-boundary', () => ({ publishCurrentItem: vi.fn() }));
import * as route from '@/app/api/user/items/route';

const PROPERTY = '3abcdef0-0000-4000-8000-000000000001';
const REQUEST = '4abcdef0-0000-4000-8000-000000000001';
const PUBLIC = '5abcdef0-0000-4000-8000-000000000001';
const client = { cookieBound: true };
function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/user/items?account=attacker', { method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
const valid = { propertyId: PROPERTY, requestId: REQUEST, itemName: 'Coffee machine', instruction: { title: 'Make coffee', body: 'Press Start.\nWait.' } };

describe('POST /api/user/items publication', () => {
  beforeEach(() => {
    vi.clearAllMocks(); process.env.APP_ORIGIN = 'http://localhost';
    vi.mocked(createSupabaseServer).mockResolvedValue(client as never);
    vi.mocked(publishCurrentItem).mockResolvedValue({ success: true, item: { publicId: PUBLIC, name: 'Coffee machine' }, instruction: valid.instruction });
  });
  it('exports only POST, normalizes content, and returns the strict guest-shaped result', async () => {
    expect('GET' in route).toBe(false);
    const response = await route.POST(post({ ...valid, propertyId: PROPERTY.toUpperCase(), requestId: REQUEST.toUpperCase(), itemName: '  Coffee   machine ', instruction: { title: ' Make   coffee ', body: '  Press Start.\nWait.  ' } }));
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(publishCurrentItem).toHaveBeenCalledWith(client, valid);
    expect(await response.json()).toEqual({ success: true, item: { publicId: PUBLIC, name: 'Coffee machine' }, instruction: valid.instruction });
  });
  it('preserves meaningful LF and TAB in the body', async () => {
    await route.POST(post({ ...valid, instruction: { ...valid.instruction, body: 'Step one\n\tStep two' } }));
    expect(publishCurrentItem).toHaveBeenCalledWith(client, { ...valid, instruction: { ...valid.instruction, body: 'Step one\n\tStep two' } });
  });
  it.each([
    ['wrong origin', valid, { origin: 'https://evil.test' }], ['wrong type', valid, { 'content-type': 'text/plain' }],
    ['extra field', { ...valid, accountId: 'attacker' }, {}], ['legacy name', { propertyId: PROPERTY, requestId: REQUEST, name: 'Coffee', instruction: valid.instruction }, {}],
    ['description', { ...valid, description: 'secret' }, {}], ['bad UUID', { ...valid, propertyId: 'bad' }, {}],
    ['blank body', { ...valid, instruction: { ...valid.instruction, body: '\u00a0\u3000' } }, {}], ['control name', { ...valid, itemName: 'Bad\nname' }, {}],
    ['format body', { ...valid, instruction: { ...valid.instruction, body: 'Bad\u200bbody' } }, {}],
    ['carriage body', { ...valid, instruction: { ...valid.instruction, body: 'Bad\rbody' } }, {}],
    ['CRLF body', { ...valid, instruction: { ...valid.instruction, body: 'Bad\r\nbody' } }, {}],
  ])('rejects %s before database work', async (_label, body, headers) => {
    const response = await route.POST(post(body, headers));
    expect(response.status).toBe(400); expect(createSupabaseServer).not.toHaveBeenCalled(); expect(publishCurrentItem).not.toHaveBeenCalled();
  });
  it('enforces the 32 KiB UTF-8 body limit', async () => {
    const response = await route.POST(post({ ...valid, instruction: { ...valid.instruction, body: 'a'.repeat(33_000) } }));
    expect(response.status).toBe(400); expect(createSupabaseServer).not.toHaveBeenCalled();
  });
  it.each([[401, 'AUTH_REQUIRED'], [403, 'PUBLISH_FORBIDDEN'], [404, 'PROPERTY_NOT_FOUND'], [409, 'PUBLISH_CONFLICT'], [503, 'PUBLISH_UNAVAILABLE']] as const)('returns safe %i errors', async (status, code) => {
    vi.mocked(publishCurrentItem).mockResolvedValueOnce({ success: false, error: { status, code, message: 'Safe message' } } as never);
    const response = await route.POST(post(valid));
    expect(response.status).toBe(status); expect(await response.json()).toEqual({ success: false, error: { code, message: 'Safe message' } });
  });
});
