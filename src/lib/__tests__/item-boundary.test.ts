import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolvePropertySelection } from '@/lib/property-context';

vi.mock('@/lib/property-context', async (original) => {
  const module = await original<typeof import('@/lib/property-context')>();
  return { ...module, resolvePropertySelection: vi.fn() };
});

import {
  createCurrentItem,
  readPublicItem,
  type ItemCreationClient,
  type PublicItemClient,
} from '@/lib/item-boundary';

const PROPERTY_ID = '3abcdef0-0000-4000-8000-000000000001';
const UPPER_PROPERTY_ID = PROPERTY_ID.toUpperCase();
const OTHER_PROPERTY_ID = '30000000-0000-4000-8000-000000000002';
const REQUEST_ID = '4abcdef0-0000-4000-8000-000000000001';
const UPPER_REQUEST_ID = REQUEST_ID.toUpperCase();
const PUBLIC_ID = '5abcdef0-0000-4000-8000-000000000001';
const UPPER_PUBLIC_ID = PUBLIC_ID.toUpperCase();
const OTHER_PUBLIC_ID = '50000000-0000-4000-8000-000000000002';
const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';

const readySelection = {
  success: true,
  authenticated: true,
  accountId: ACCOUNT_ID,
  context: {
    state: 'ready',
    propertyCount: 1,
    property: { id: PROPERTY_ID, name: 'Seaside home' },
  },
} as const;

function creationClient(result: unknown = {
  data: [{ public_id: PUBLIC_ID, property_id: PROPERTY_ID, name: 'Coffee machine' }],
  error: null,
}) {
  return {
    rpc: vi.fn().mockResolvedValue(result),
  } as unknown as ItemCreationClient;
}

function publicClient(result: unknown) {
  return {
    rpc: vi.fn().mockResolvedValue(result),
  } as unknown as PublicItemClient;
}

describe('authenticated item creation boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePropertySelection).mockResolvedValue(readySelection);
  });

  it('freshly revalidates the property hint before sending only content to the RPC', async () => {
    const client = creationClient();
    const input = { propertyId: UPPER_PROPERTY_ID, requestId: UPPER_REQUEST_ID, name: 'Coffee machine' };
    await expect(createCurrentItem(client, input)).resolves.toEqual({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine' },
    });
    expect(resolvePropertySelection).toHaveBeenCalledWith(client, PROPERTY_ID);
    expect(client.rpc).toHaveBeenCalledWith('create_current_item', {
      p_property_id: PROPERTY_ID,
      p_request_id: REQUEST_ID,
      p_name: 'Coffee machine',
    });
    expect(JSON.stringify((client.rpc as ReturnType<typeof vi.fn>).mock.calls)).not.toMatch(
      /account|user|role|email|description|published/i
    );
  });

  it.each([
    [401, 'AUTH_REQUIRED', 'Sign in to continue.'],
    [403, 'PROPERTY_CONTEXT_FORBIDDEN', 'This account cannot manage properties.'],
    [404, 'PROPERTY_NOT_FOUND', 'That property is no longer available.'],
    [503, 'PROPERTY_CONTEXT_UNAVAILABLE', 'We could not load your property. Please try again.'],
  ] as const)('preserves the safe %i property-selection failure and performs no creation', async (status, code, message) => {
    vi.mocked(resolvePropertySelection).mockResolvedValueOnce({
      success: false,
      authenticated: false,
      error: { status, code, message },
    });
    const client = creationClient();
    const result = await createCurrentItem(client, {
      propertyId: OTHER_PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(result).toEqual({ success: false, error: { status, code, message } });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it('fails closed if a property resolver violates its ready-only selection contract', async () => {
    vi.mocked(resolvePropertySelection).mockResolvedValueOnce({
      success: true,
      authenticated: true,
      accountId: ACCOUNT_ID,
      context: { state: 'needs_property', propertyCount: 0, property: null },
    });
    const client = creationClient();
    await expect(createCurrentItem(client, {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    })).resolves.toMatchObject({
      success: false,
      error: { code: 'ITEM_CREATION_UNAVAILABLE', status: 503 },
    });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it('sanitizes an unexpected property-resolution exception', async () => {
    vi.mocked(resolvePropertySelection).mockRejectedValueOnce(new Error('raw tenant detail'));
    const client = creationClient();
    const result = await createCurrentItem(client, {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(result).toMatchObject({
      success: false,
      error: { code: 'ITEM_CREATION_UNAVAILABLE', status: 503 },
    });
    expect(JSON.stringify(result)).not.toContain('raw tenant');
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['empty', []],
    ['multiple', [
      { public_id: PUBLIC_ID, property_id: PROPERTY_ID, name: 'Coffee machine' },
      { public_id: OTHER_PUBLIC_ID, property_id: PROPERTY_ID, name: 'Coffee machine' },
    ]],
    ['extra field', [{ public_id: PUBLIC_ID, property_id: PROPERTY_ID, name: 'Coffee machine', id: 'internal' }]],
    ['wrong property', [{ public_id: PUBLIC_ID, property_id: OTHER_PROPERTY_ID, name: 'Coffee machine' }]],
    ['wrong name', [{ public_id: PUBLIC_ID, property_id: PROPERTY_ID, name: 'Leaked rename' }]],
    ['invalid public UUID', [{ public_id: 'public-slug', property_id: PROPERTY_ID, name: 'Coffee machine' }]],
    ['unsafe returned name', [{ public_id: PUBLIC_ID, property_id: PROPERTY_ID, name: 'Bad\u200bname' }]],
  ])('fails closed for %s creation output', async (_name, data) => {
    const client = creationClient({ data, error: null });
    const result = await createCurrentItem(client, {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(result).toMatchObject({
      success: false,
      error: { code: 'ITEM_CREATION_UNAVAILABLE', status: 503 },
    });
    expect(JSON.stringify(result)).not.toMatch(/internal|Leaked rename/);
  });

  it.each([
    ['authorization', { code: '42501', message: 'raw role detail' }, 403, 'ITEM_CREATION_FORBIDDEN'],
    ['request conflict', { code: '22023', message: 'raw conflicting payload detail' }, 409, 'ITEM_CREATION_CONFLICT'],
  ])('sanitizes an %s RPC error', async (_name, error, status, code) => {
    const result = await createCurrentItem(creationClient({ data: null, error }), {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(result).toMatchObject({ success: false, error: { status, code } });
    expect(JSON.stringify(result)).not.toContain('raw');
  });

  it('fails safely if creation throws', async () => {
    const client = creationClient();
    (client.rpc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('secret upstream'));
    const result = await createCurrentItem(client, {
      propertyId: PROPERTY_ID,
      requestId: REQUEST_ID,
      name: 'Coffee machine',
    });
    expect(result).toMatchObject({ success: false, error: { status: 503 } });
    expect(JSON.stringify(result)).not.toContain('secret upstream');
  });
});

describe('anonymous public item boundary', () => {
  it('returns exactly the two-field public projection', async () => {
    const client = publicClient({
      data: [{ public_id: PUBLIC_ID, name: 'Coffee machine' }],
      error: null,
    });
    await expect(readPublicItem(client, UPPER_PUBLIC_ID)).resolves.toEqual({
      success: true,
      item: { publicId: PUBLIC_ID, name: 'Coffee machine' },
    });
    expect(client.rpc).toHaveBeenCalledWith('read_public_item', { p_public_id: PUBLIC_ID });
  });

  it('maps the database zero-row contract for drafts and unknown IDs to one 404', async () => {
    await expect(readPublicItem(publicClient({ data: [], error: null }), PUBLIC_ID)).resolves.toEqual({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Item not found.', status: 404 },
    });
  });

  it.each([
    ['null', null],
    ['object', { public_id: PUBLIC_ID, name: 'Coffee machine' }],
    ['multiple', [
      { public_id: PUBLIC_ID, name: 'Coffee machine' },
      { public_id: OTHER_PUBLIC_ID, name: 'Kettle' },
    ]],
    ['extra field', [{ public_id: PUBLIC_ID, name: 'Coffee machine', property_id: PROPERTY_ID }]],
    ['mismatched public ID', [{ public_id: OTHER_PUBLIC_ID, name: 'Coffee machine' }]],
    ['unsafe public name', [{ public_id: PUBLIC_ID, name: 'Bad\u200bname' }]],
  ])('fails closed for %s public output', async (_name, data) => {
    const result = await readPublicItem(publicClient({ data, error: null }), PUBLIC_ID);
    expect(result).toMatchObject({
      success: false,
      error: { code: 'PUBLIC_ITEM_UNAVAILABLE', status: 503 },
    });
    expect(JSON.stringify(result)).not.toContain(PROPERTY_ID);
  });

  it('sanitizes upstream public-read errors and exceptions', async () => {
    const errorResult = await readPublicItem(publicClient({
      data: null,
      error: { code: 'XX000', message: 'raw published detail' },
    }), PUBLIC_ID);
    expect(errorResult).toMatchObject({ success: false, error: { status: 503 } });
    expect(JSON.stringify(errorResult)).not.toContain('raw published');

    const client = publicClient({ data: [], error: null });
    (client.rpc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('raw thrown detail'));
    const thrownResult = await readPublicItem(client, PUBLIC_ID);
    expect(thrownResult).toMatchObject({ success: false, error: { status: 503 } });
    expect(JSON.stringify(thrownResult)).not.toContain('raw thrown');
  });
});
