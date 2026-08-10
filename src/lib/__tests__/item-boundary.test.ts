import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolvePropertySelection } from '@/lib/property-context';
vi.mock('@/lib/property-context', async (original) => ({
  ...await original<typeof import('@/lib/property-context')>(), resolvePropertySelection: vi.fn(),
}));
import { publishCurrentItem, readPublicItem, type ItemPublicationClient, type PublicItemClient } from '@/lib/item-boundary';

const PROPERTY = '3abcdef0-0000-4000-8000-000000000001';
const REQUEST = '4abcdef0-0000-4000-8000-000000000001';
const PUBLIC = '5abcdef0-0000-4000-8000-000000000001';
const OTHER = '50000000-0000-4000-8000-000000000002';
const ready = { success: true, authenticated: true, accountId: '2abcdef0-0000-4000-8000-000000000001', context: { state: 'ready', propertyCount: 1, property: { id: PROPERTY, name: 'Home' } } } as const;
const input = { propertyId: PROPERTY.toUpperCase(), requestId: REQUEST.toUpperCase(), itemName: 'Coffee machine', instruction: { title: 'Make coffee', body: 'Press Start.\nWait.' } };
function publisher(result: unknown = { data: [{ public_id: PUBLIC, item_name: 'Coffee machine', instruction_title: 'Make coffee', instruction_body: 'Press Start.\nWait.' }], error: null }) {
  return { rpc: vi.fn().mockResolvedValue(result) } as unknown as ItemPublicationClient;
}
function reader(result: unknown) { return { rpc: vi.fn().mockResolvedValue(result) } as unknown as PublicItemClient; }

describe('atomic publication boundary', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(resolvePropertySelection).mockResolvedValue(ready); });
  it('revalidates property first and calls only the atomic publication RPC with normalized UUIDs', async () => {
    const client = publisher();
    await expect(publishCurrentItem(client, input)).resolves.toEqual({ success: true, item: { publicId: PUBLIC, name: 'Coffee machine' }, instruction: input.instruction });
    expect(resolvePropertySelection).toHaveBeenCalledWith(client, PROPERTY);
    expect(client.rpc).toHaveBeenCalledWith('publish_current_item_with_instruction', {
      p_property_id: PROPERTY, p_request_id: REQUEST, p_name: input.itemName,
      p_instruction_title: input.instruction.title, p_instruction_body: input.instruction.body,
    });
    expect(JSON.stringify((client.rpc as ReturnType<typeof vi.fn>).mock.calls)).not.toMatch(/account|user|role|published_at|description/);
  });
  it.each([
    [401, 'AUTH_REQUIRED'], [403, 'PROPERTY_CONTEXT_FORBIDDEN'], [404, 'PROPERTY_NOT_FOUND'], [503, 'PROPERTY_CONTEXT_UNAVAILABLE'],
  ])('preserves safe property failure %i', async (status, code) => {
    vi.mocked(resolvePropertySelection).mockResolvedValueOnce({ success: false, authenticated: false, error: { status, code, message: 'safe' } } as never);
    const client = publisher();
    expect(await publishCurrentItem(client, input)).toEqual({ success: false, error: { status, code, message: 'safe' } });
    expect(client.rpc).not.toHaveBeenCalled();
  });
  it('preserves LF and TAB in the database-facing publication DTO', async () => {
    const formatted = { ...input, instruction: { ...input.instruction, body: 'Step one\n\tStep two' } };
    const client = publisher({ data: [{ public_id: PUBLIC, item_name: 'Coffee machine', instruction_title: 'Make coffee', instruction_body: 'Step one\n\tStep two' }], error: null });
    await expect(publishCurrentItem(client, formatted)).resolves.toMatchObject({ success: true, instruction: { body: 'Step one\n\tStep two' } });
    expect(client.rpc).toHaveBeenCalledWith('publish_current_item_with_instruction', expect.objectContaining({ p_instruction_body: 'Step one\n\tStep two' }));
  });
  it.each([['CR', 'Bad\rbody'], ['CRLF', 'Bad\r\nbody']])('rejects %s before property or database work', async (_label, body) => {
    const client = publisher();
    await expect(publishCurrentItem(client, { ...input, instruction: { ...input.instruction, body } })).resolves.toEqual({
      success: false,
      error: { code: 'PUBLISH_UNAVAILABLE', message: 'We could not publish this guest page. Please try again.', status: 503 },
    });
    expect(resolvePropertySelection).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
  });
  it.each([
    ['conflict', '23505', 409, 'PUBLISH_CONFLICT'], ['auth', '42501', 403, 'PUBLISH_FORBIDDEN'], ['property', 'P0002', 403, 'PUBLISH_FORBIDDEN'], ['other', 'XX000', 503, 'PUBLISH_UNAVAILABLE'],
  ])('sanitizes %s RPC errors', async (_label, sqlCode, status, code) => {
    const result = await publishCurrentItem(publisher({ data: null, error: { code: sqlCode, message: 'raw secret' } }), input);
    expect(result).toMatchObject({ success: false, error: { status, code } });
    expect(JSON.stringify(result)).not.toContain('raw secret');
  });
  it.each([
    ['empty', []], ['multiple', [
      { public_id: PUBLIC, item_name: 'Coffee machine', instruction_title: 'Make coffee', instruction_body: 'Press Start.\nWait.' },
      { public_id: OTHER, item_name: 'Coffee machine', instruction_title: 'Make coffee', instruction_body: 'Press Start.\nWait.' },
    ]], ['extra', [{ public_id: PUBLIC, item_name: 'Coffee machine', instruction_title: 'Make coffee', instruction_body: 'Press Start.\nWait.', property_id: PROPERTY }]],
    ['changed', [{ public_id: PUBLIC, item_name: 'Changed', instruction_title: 'Make coffee', instruction_body: 'Press Start.\nWait.' }]],
  ])('fails closed for %s output', async (_label, data) => {
    const result = await publishCurrentItem(publisher({ data, error: null }), input);
    expect(result).toMatchObject({ success: false, error: { status: 503, code: 'PUBLISH_UNAVAILABLE' } });
  });
});

describe('anonymous instruction projection', () => {
  it('returns only the strict ordered guest DTO', async () => {
    const client = reader({ data: [{ public_id: PUBLIC, name: 'Coffee machine', instructions: [
      { title: 'First', body: 'One' }, { title: 'Second', body: 'Two\nlines' },
    ] }], error: null });
    await expect(readPublicItem(client, PUBLIC.toUpperCase())).resolves.toEqual({ success: true, item: { publicId: PUBLIC, name: 'Coffee machine', instructions: [{ title: 'First', body: 'One' }, { title: 'Second', body: 'Two\nlines' }] } });
    expect(client.rpc).toHaveBeenCalledWith('read_public_item', { p_public_id: PUBLIC });
  });
  it('maps zero rows uniformly to 404', async () => {
    await expect(readPublicItem(reader({ data: [], error: null }), PUBLIC)).resolves.toMatchObject({ success: false, error: { status: 404, code: 'ITEM_NOT_FOUND' } });
  });
  it.each([
    ['empty instructions', [{ public_id: PUBLIC, name: 'Coffee', instructions: [] }]],
    ['extra field', [{ public_id: PUBLIC, name: 'Coffee', instructions: [{ title: 'Use', body: 'Start', id: 'internal' }] }]],
    ['mismatch', [{ public_id: OTHER, name: 'Coffee', instructions: [{ title: 'Use', body: 'Start' }] }]],
    ['multiple', [{ public_id: PUBLIC, name: 'Coffee', instructions: [{ title: 'Use', body: 'Start' }] }, { public_id: OTHER, name: 'Other', instructions: [{ title: 'Use', body: 'Start' }] }]],
  ])('fails closed for %s', async (_label, data) => {
    await expect(readPublicItem(reader({ data, error: null }), PUBLIC)).resolves.toMatchObject({ success: false, error: { status: 503 } });
  });
});
