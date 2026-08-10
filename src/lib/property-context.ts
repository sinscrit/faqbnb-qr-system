import { z } from 'zod';
import {
  resolveCurrentUserContext,
  type CurrentUserContextClient,
  type CurrentUserContextResult,
  type SessionErrorCode,
} from '@/lib/current-user-context';

const SAFE_MESSAGES = {
  PROPERTY_CONTEXT_FORBIDDEN: 'This account cannot manage properties.',
  PROPERTY_CONTEXT_UNAVAILABLE: 'We could not load your property. Please try again.',
  PROPERTY_NOT_FOUND: 'That property is no longer available.',
} as const;

const propertyRowSchema = z.object({
  account_id: z.string().uuid(),
  state: z.enum(['needs_property', 'ready', 'selection_required']),
  property_count: z.number().int().nonnegative(),
  property_id: z.string().uuid().nullable(),
  property_nickname: z.string().trim().min(1).max(100).nullable(),
  property_address: z.string().max(500).nullable(),
  property_type_name: z.string().trim().min(1).max(100).nullable(),
  property_type_display_name: z.string().trim().min(1).max(100).nullable(),
}).strict().superRefine((row, context) => {
  const hasProperty = row.property_id !== null;
  const hasPropertyDetails =
    row.property_nickname !== null ||
    row.property_address !== null ||
    row.property_type_name !== null ||
    row.property_type_display_name !== null;

  if (row.state === 'needs_property' && (row.property_count !== 0 || hasProperty || hasPropertyDetails)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid empty property state' });
  }
  if (
    row.state === 'ready' &&
    (row.property_count !== 1 || !hasProperty || row.property_nickname === null ||
      row.property_type_name === null || row.property_type_display_name === null)
  ) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid ready property state' });
  }
  if (row.state === 'selection_required' && (row.property_count < 2 || hasProperty || hasPropertyDetails)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid selection property state' });
  }
});

const propertyRowsSchema = z.array(propertyRowSchema).length(1);
const propertyChoiceSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().trim().min(1).max(100),
}).strict();
const propertyChoicesSchema = z.array(propertyChoiceSchema).superRefine((rows, context) => {
  if (new Set(rows.map((row) => row.id)).size !== rows.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate property choice' });
  }
});
const selectedPropertySchema = propertyChoiceSchema.extend({
  account_id: z.string().uuid(),
}).strict();

interface ClientError {
  code?: string;
  message?: string;
}

interface QueryResult {
  data: unknown;
  error: ClientError | null;
}

interface QueryBuilder extends PromiseLike<QueryResult> {
  eq(column: string, value: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  maybeSingle(): Promise<QueryResult>;
}

export interface PropertyContextClient {
  auth: CurrentUserContextClient['auth'];
  rpc: CurrentUserContextClient['rpc'] & ((
      functionName: 'resolve_current_property',
      args: {
        p_nickname: string | null;
        p_address: string | null;
        p_property_type_name: string;
      }
    ) => Promise<QueryResult>);
  from(table: 'properties'): {
    select(columns: 'id,nickname' | 'id,nickname,account_id'): QueryBuilder;
  };
}

export interface PropertySummary {
  id: string;
  name: string;
}

export type PropertyContextState =
  | {
      state: 'needs_property';
      propertyCount: 0;
      property: null;
    }
  | {
      state: 'ready';
      propertyCount: 1;
      property: PropertySummary;
    }
  | {
      state: 'selection_required';
      propertyCount: number;
      property: null;
    };

export type PropertyContextErrorCode =
  | SessionErrorCode
  | keyof typeof SAFE_MESSAGES;

export type PropertyContextResult =
  | {
      success: true;
      authenticated: true;
      accountId: string;
      context: PropertyContextState;
    }
  | {
      success: false;
      authenticated: false;
      error: {
        code: PropertyContextErrorCode;
        message: string;
        status: 401 | 403 | 404 | 503;
      };
    };

function sessionFailure(result: Extract<CurrentUserContextResult, { success: false }>): PropertyContextResult {
  return result;
}

function failure(
  code: keyof typeof SAFE_MESSAGES,
  status: 403 | 404 | 503
): PropertyContextResult {
  return {
    success: false,
    authenticated: false,
    error: { code, message: SAFE_MESSAGES[code], status },
  };
}

function propertyRpcFailure(error?: ClientError | null): PropertyContextResult {
  if (error?.code === '42501' || error?.code === 'P0002') {
    return failure('PROPERTY_CONTEXT_FORBIDDEN', 403);
  }
  return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
}

/**
 * Resolve property state from a request-bound client. Identity/account are
 * always established first by the canonical cookie resolver. The only direct
 * RPC call made here is resolve_current_property, and its arguments are content
 * fields rather than tenant or identity authority.
 */
export async function resolvePropertyContext(
  client: PropertyContextClient,
  content: { propertyName?: string } = {}
): Promise<PropertyContextResult> {
  const currentUser = await resolveCurrentUserContext(client);
  if (!currentUser.success) return sessionFailure(currentUser);

  let response: QueryResult;
  try {
    response = await client.rpc('resolve_current_property', {
      p_nickname: content.propertyName ?? null,
      p_address: null,
      p_property_type_name: 'other',
    });
  } catch {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }

  if (!response || typeof response !== 'object' || response.error) {
    return propertyRpcFailure(response?.error);
  }

  const parsed = propertyRowsSchema.safeParse(response.data);
  if (!parsed.success || parsed.data[0].account_id !== currentUser.context.currentAccount.id) {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }

  const row = parsed.data[0];
  if (row.state === 'ready') {
    return {
      success: true,
      authenticated: true,
      accountId: row.account_id,
      context: {
        state: 'ready',
        propertyCount: 1,
        property: { id: row.property_id!, name: row.property_nickname! },
      },
    };
  }
  if (row.state === 'needs_property') {
    return {
      success: true,
      authenticated: true,
      accountId: row.account_id,
      context: { state: 'needs_property', propertyCount: 0, property: null },
    };
  }
  return {
    success: true,
    authenticated: true,
    accountId: row.account_id,
    context: {
      state: 'selection_required',
      propertyCount: row.property_count,
      property: null,
    },
  };
}

export async function listPropertyChoices(
  client: PropertyContextClient,
  accountId: string,
  expectedCount: number
): Promise<PropertySummary[] | null> {
  let response: QueryResult;
  try {
    response = await client
      .from('properties')
      .select('id,nickname')
      .eq('account_id', accountId)
      .order('nickname', { ascending: true })
      .order('id', { ascending: true });
  } catch {
    return null;
  }

  if (!response || typeof response !== 'object' || response.error) return null;
  const parsed = propertyChoicesSchema.safeParse(response.data);
  if (!parsed.success || parsed.data.length !== expectedCount) return null;
  return parsed.data.map((property) => ({ id: property.id, name: property.nickname }));
}

/** Re-resolve cookie/account state before treating a property ID as selected. */
export async function resolvePropertySelection(
  client: PropertyContextClient,
  propertyId: string
): Promise<PropertyContextResult> {
  const resolved = await resolvePropertyContext(client);
  if (!resolved.success) return resolved;

  if (resolved.context.state === 'ready') {
    return resolved.context.property.id === propertyId
      ? resolved
      : failure('PROPERTY_NOT_FOUND', 404);
  }
  if (resolved.context.state !== 'selection_required') {
    return failure('PROPERTY_NOT_FOUND', 404);
  }

  let response: QueryResult;
  try {
    response = await client
      .from('properties')
      .select('id,nickname,account_id')
      .eq('id', propertyId)
      .eq('account_id', resolved.accountId)
      .maybeSingle();
  } catch {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }

  if (!response || typeof response !== 'object') {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }
  if (response.error) {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }
  if (response.data === null) return failure('PROPERTY_NOT_FOUND', 404);

  const parsed = selectedPropertySchema.safeParse(response.data);
  if (!parsed.success || parsed.data.account_id !== resolved.accountId) {
    return failure('PROPERTY_CONTEXT_UNAVAILABLE', 503);
  }

  return {
    success: true,
    authenticated: true,
    accountId: resolved.accountId,
    context: {
      state: 'ready',
      propertyCount: 1,
      property: { id: parsed.data.id, name: parsed.data.nickname },
    },
  };
}
