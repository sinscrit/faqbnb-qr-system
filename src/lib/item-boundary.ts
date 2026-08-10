import { z } from 'zod';
import {
  resolvePropertySelection,
  type PropertyContextClient,
  type PropertyContextErrorCode,
} from '@/lib/property-context';

interface ClientError {
  code?: string;
  message?: string;
}

interface QueryResult {
  data: unknown;
  error: ClientError | null;
}

export type ItemCreationClient = PropertyContextClient & {
  rpc(
    functionName: 'create_current_item',
    args: {
      p_property_id: string;
      p_request_id: string;
      p_name: string;
    }
  ): Promise<QueryResult>;
};

export interface PublicItemClient {
  rpc(
    functionName: 'read_public_item',
    args: { p_public_id: string }
  ): Promise<QueryResult>;
}

export interface ItemSummary {
  publicId: string;
  name: string;
}

type ItemErrorStatus = 401 | 403 | 404 | 409 | 503;
type ItemErrorCode =
  | PropertyContextErrorCode
  | 'ITEM_CREATION_CONFLICT'
  | 'ITEM_CREATION_FORBIDDEN'
  | 'ITEM_CREATION_UNAVAILABLE'
  | 'ITEM_NOT_FOUND'
  | 'PUBLIC_ITEM_UNAVAILABLE';

export type ItemBoundaryResult =
  | { success: true; item: ItemSummary }
  | {
      success: false;
      error: {
        code: ItemErrorCode;
        message: string;
        status: ItemErrorStatus;
      };
    };

const rpcItemNameSchema = z.string()
  .refine((value) => value.trim() === value && Array.from(value).length > 0)
  .refine((value) => Array.from(value).length <= 120)
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));

const createdItemRowsSchema = z.array(z.object({
  public_id: z.string().uuid(),
  property_id: z.string().uuid(),
  name: rpcItemNameSchema,
}).strict()).length(1);

const publicItemRowsSchema = z.array(z.object({
  public_id: z.string().uuid(),
  name: rpcItemNameSchema,
}).strict());

function failure(
  code: ItemErrorCode,
  message: string,
  status: ItemErrorStatus
): ItemBoundaryResult {
  return { success: false, error: { code, message, status } };
}

/**
 * Create one draft item after freshly resolving the cookie-bound account and
 * treating the submitted property UUID only as an RLS-revalidated hint.
 */
export async function createCurrentItem(
  client: ItemCreationClient,
  input: { propertyId: string; requestId: string; name: string }
): Promise<ItemBoundaryResult> {
  const normalizedPropertyId = input.propertyId.toLowerCase();
  const normalizedRequestId = input.requestId.toLowerCase();
  let selected: Awaited<ReturnType<typeof resolvePropertySelection>>;
  try {
    selected = await resolvePropertySelection(client, normalizedPropertyId);
  } catch {
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }
  if (!selected.success) {
    return { success: false, error: selected.error };
  }
  if (selected.context.state !== 'ready') {
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }
  const selectedProperty = selected.context.property;

  let response: QueryResult;
  try {
    response = await client.rpc('create_current_item', {
      p_property_id: selectedProperty.id,
      p_request_id: normalizedRequestId,
      p_name: input.name,
    });
  } catch {
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }

  if (!response || typeof response !== 'object') {
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }
  if (response.error) {
    if (response.error.code === '42501' || response.error.code === 'P0002') {
      return failure(
        'ITEM_CREATION_FORBIDDEN',
        'This property cannot be changed.',
        403
      );
    }
    if (response.error.code === '22023') {
      return failure(
        'ITEM_CREATION_CONFLICT',
        'This request was already used for different item details. Try again.',
        409
      );
    }
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }

  const parsed = createdItemRowsSchema.safeParse(response.data);
  if (
    !parsed.success ||
    parsed.data[0].property_id !== selectedProperty.id ||
    parsed.data[0].name !== input.name
  ) {
    return failure(
      'ITEM_CREATION_UNAVAILABLE',
      'We could not create this item. Please try again.',
      503
    );
  }

  return {
    success: true,
    item: {
      publicId: parsed.data[0].public_id,
      name: parsed.data[0].name,
    },
  };
}

/** Read only the database's guest-safe projection using an anonymous client. */
export async function readPublicItem(
  client: PublicItemClient,
  publicId: string
): Promise<ItemBoundaryResult> {
  const normalizedPublicId = publicId.toLowerCase();
  let response: QueryResult;
  try {
    response = await client.rpc('read_public_item', { p_public_id: normalizedPublicId });
  } catch {
    return failure(
      'PUBLIC_ITEM_UNAVAILABLE',
      'This item is temporarily unavailable.',
      503
    );
  }

  if (!response || typeof response !== 'object' || response.error) {
    return failure(
      'PUBLIC_ITEM_UNAVAILABLE',
      'This item is temporarily unavailable.',
      503
    );
  }

  const parsed = publicItemRowsSchema.safeParse(response.data);
  if (!parsed.success || parsed.data.length > 1) {
    return failure(
      'PUBLIC_ITEM_UNAVAILABLE',
      'This item is temporarily unavailable.',
      503
    );
  }
  if (parsed.data.length === 0) {
    return failure('ITEM_NOT_FOUND', 'Item not found.', 404);
  }
  if (parsed.data[0].public_id !== normalizedPublicId) {
    return failure(
      'PUBLIC_ITEM_UNAVAILABLE',
      'This item is temporarily unavailable.',
      503
    );
  }

  return {
    success: true,
    item: {
      publicId: parsed.data[0].public_id,
      name: parsed.data[0].name,
    },
  };
}
