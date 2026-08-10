import { describe, expect, it, vi } from 'vitest';
import {
  listPropertyChoices,
  resolvePropertyContext,
  resolvePropertySelection,
  type PropertyContextClient,
} from '@/lib/property-context';

const USER_ID = '10000000-0000-4000-8000-000000000001';
const ACCOUNT_ID = '20000000-0000-4000-8000-000000000001';
const OTHER_ACCOUNT_ID = '20000000-0000-4000-8000-000000000002';
const PROPERTY_ID = '30000000-0000-4000-8000-000000000001';
const OTHER_PROPERTY_ID = '30000000-0000-4000-8000-000000000002';

const states = {
  needs: [{
    account_id: ACCOUNT_ID, state: 'needs_property', property_count: 0,
    property_id: null, property_nickname: null, property_address: null,
    property_type_name: null, property_type_display_name: null,
  }],
  ready: [{
    account_id: ACCOUNT_ID, state: 'ready', property_count: 1,
    property_id: PROPERTY_ID, property_nickname: 'Seaside home', property_address: null,
    property_type_name: 'other', property_type_display_name: 'Other',
  }],
  many: [{
    account_id: ACCOUNT_ID, state: 'selection_required', property_count: 2,
    property_id: null, property_nickname: null, property_address: null,
    property_type_name: null, property_type_display_name: null,
  }],
} as const;

function thenableQuery(result: { data: unknown; error: null | { code?: string; message?: string } }) {
  const query = {
    eq: vi.fn(), order: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  return query;
}

function makeClient(propertyData: unknown = states.needs, queryResult = { data: [], error: null }) {
  const query = thenableQuery(queryResult);
  const rpc = vi.fn(async (name: string) => name === 'bootstrap_current_user'
    ? { data: [{ user_id: USER_ID, account_id: ACCOUNT_ID, account_name: 'My account', account_role: 'owner' }], error: null }
    : { data: propertyData, error: null });
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: {
      id: USER_ID, email: 'host@example.test', email_confirmed_at: '2026-08-10T10:00:00Z',
    } }, error: null }) },
    rpc,
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(query) }),
  } as unknown as PropertyContextClient;
  return { client, rpc, query };
}

describe('server property context resolver', () => {
  it.each([
    ['zero', states.needs, { state: 'needs_property', propertyCount: 0, property: null }],
    ['one', states.ready, { state: 'ready', propertyCount: 1, property: { id: PROPERTY_ID, name: 'Seaside home' } }],
    ['many', states.many, { state: 'selection_required', propertyCount: 2, property: null }],
  ])('strictly maps the %s property state without exposing account data', async (_name, rows, expected) => {
    const { client } = makeClient(rows);
    const result = await resolvePropertyContext(client);
    expect(result).toMatchObject({ success: true, context: expected });
    expect(JSON.stringify(result)).not.toMatch(/host@example|My account|property_type|address/);
  });

  it('derives context first and sends only content inputs to the property RPC', async () => {
    const { client, rpc } = makeClient(states.ready);
    await resolvePropertyContext(client, { propertyName: 'Seaside home' });
    expect(rpc.mock.calls.map((call) => call[0])).toEqual([
      'bootstrap_current_user', 'resolve_current_property',
    ]);
    expect(rpc).toHaveBeenLastCalledWith('resolve_current_property', {
      p_nickname: 'Seaside home', p_address: null, p_property_type_name: 'other',
    });
    expect(JSON.stringify(rpc.mock.calls[1])).not.toMatch(/account_id|user_id|property_id/);
  });

  it('propagates safe auth failures and never calls the property RPC', async () => {
    const { client, rpc } = makeClient();
    (client.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: null }, error: { message: 'raw provider token detail' },
    });
    const result = await resolvePropertyContext(client);
    expect(result).toMatchObject({ success: false, error: { code: 'AUTH_REQUIRED', status: 401 } });
    expect(rpc).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain('raw provider');
  });

  it.each([
    ['empty', []],
    ['multiple', [...states.ready, ...states.ready]],
    ['account mismatch', [{ ...states.ready[0], account_id: OTHER_ACCOUNT_ID }]],
    ['extra field', [{ ...states.ready[0], secret: 'must not escape' }]],
    ['invalid zero invariant', [{ ...states.needs[0], property_count: 1 }]],
    ['invalid one invariant', [{ ...states.ready[0], property_id: null }]],
    ['invalid many invariant', [{ ...states.many[0], property_nickname: 'leak' }]],
  ])('fails closed for %s RPC output', async (_name, rows) => {
    const { client } = makeClient(rows);
    const result = await resolvePropertyContext(client);
    expect(result).toMatchObject({ success: false, error: { code: 'PROPERTY_CONTEXT_UNAVAILABLE', status: 503 } });
    expect(JSON.stringify(result)).not.toMatch(/secret|leak/);
  });

  it('maps authorization errors safely and sanitizes all other upstream failures', async () => {
    for (const [code, expected] of [['42501', 403], ['P0002', 403], ['XX000', 503]] as const) {
      const { client, rpc } = makeClient();
      rpc.mockImplementation(async (name: string) => name === 'bootstrap_current_user'
        ? { data: [{ user_id: USER_ID, account_id: ACCOUNT_ID, account_name: 'My account', account_role: 'owner' }], error: null }
        : { data: null, error: { code, message: 'raw database detail' } });
      const result = await resolvePropertyContext(client);
      expect(result).toMatchObject({ success: false, error: { status: expected } });
      expect(JSON.stringify(result)).not.toContain('raw database detail');
    }
  });

  it('lists only minimal account-scoped choices in deterministic order', async () => {
    const rows = [
      { id: PROPERTY_ID, nickname: 'Alpha' },
      { id: OTHER_PROPERTY_ID, nickname: 'Beta' },
    ];
    const { client, query } = makeClient(states.many, { data: rows, error: null });
    await expect(listPropertyChoices(client, ACCOUNT_ID, 2)).resolves.toEqual([
      { id: PROPERTY_ID, name: 'Alpha' },
      { id: OTHER_PROPERTY_ID, name: 'Beta' },
    ]);
    expect(query.eq).toHaveBeenCalledWith('account_id', ACCOUNT_ID);
    expect(query.order.mock.calls).toEqual([
      ['nickname', { ascending: true }], ['id', { ascending: true }],
    ]);
  });

  it.each([
    ['count mismatch', [{ id: PROPERTY_ID, nickname: 'Alpha' }]],
    ['malformed choice', [{ id: 'bad', nickname: 'Alpha' }, { id: OTHER_PROPERTY_ID, nickname: 'Beta' }]],
    ['extra field', [{ id: PROPERTY_ID, nickname: 'Alpha', account_id: ACCOUNT_ID }, { id: OTHER_PROPERTY_ID, nickname: 'Beta' }]],
    ['duplicate ID', [{ id: PROPERTY_ID, nickname: 'Alpha' }, { id: PROPERTY_ID, nickname: 'Duplicate' }]],
  ])('fails closed on %s choice rows', async (_name, rows) => {
    const { client } = makeClient(states.many, { data: rows, error: null });
    await expect(listPropertyChoices(client, ACCOUNT_ID, 2)).resolves.toBeNull();
  });

  it('accepts the RPC-selected property only when the hint matches', async () => {
    const matching = makeClient(states.ready);
    await expect(resolvePropertySelection(matching.client, PROPERTY_ID)).resolves.toMatchObject({
      success: true, context: { state: 'ready', property: { id: PROPERTY_ID } },
    });
    expect(matching.client.from).not.toHaveBeenCalled();

    const mismatch = makeClient(states.ready);
    await expect(resolvePropertySelection(mismatch.client, OTHER_PROPERTY_ID)).resolves.toMatchObject({
      success: false, error: { code: 'PROPERTY_NOT_FOUND', status: 404 },
    });
  });

  it('re-resolves context and validates a many-state choice through account-scoped RLS data', async () => {
    const selected = { data: { id: OTHER_PROPERTY_ID, nickname: 'Beta', account_id: ACCOUNT_ID }, error: null };
    const { client, query } = makeClient(states.many, selected);
    await expect(resolvePropertySelection(client, OTHER_PROPERTY_ID)).resolves.toMatchObject({
      success: true, context: { state: 'ready', property: { id: OTHER_PROPERTY_ID, name: 'Beta' } },
    });
    expect(query.eq.mock.calls).toEqual([
      ['id', OTHER_PROPERTY_ID], ['account_id', ACCOUNT_ID],
    ]);
  });

  it.each([
    ['missing', { data: null, error: null }, 'PROPERTY_NOT_FOUND', 404],
    ['multiple-row protocol error', { data: null, error: { code: 'PGRST116', message: 'raw' } }, 'PROPERTY_CONTEXT_UNAVAILABLE', 503],
    ['cross-account row', { data: { id: OTHER_PROPERTY_ID, nickname: 'Beta', account_id: OTHER_ACCOUNT_ID }, error: null }, 'PROPERTY_CONTEXT_UNAVAILABLE', 503],
    ['query error', { data: null, error: { code: 'XX000', message: 'raw database' } }, 'PROPERTY_CONTEXT_UNAVAILABLE', 503],
  ])('fails closed for a %s selection', async (_name, queryResult, code, status) => {
    const { client } = makeClient(states.many, queryResult);
    const result = await resolvePropertySelection(client, OTHER_PROPERTY_ID);
    expect(result).toMatchObject({ success: false, error: { code, status } });
    expect(JSON.stringify(result)).not.toMatch(/raw database|PGRST/);
  });

  it('does not allow a property hint to create or select when no property exists', async () => {
    const { client } = makeClient(states.needs);
    await expect(resolvePropertySelection(client, PROPERTY_ID)).resolves.toMatchObject({
      success: false, error: { code: 'PROPERTY_NOT_FOUND', status: 404 },
    });
    expect(client.from).not.toHaveBeenCalled();
  });
});
