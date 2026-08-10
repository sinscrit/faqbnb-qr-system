import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import { parseJsonRequest } from '@/lib/auth-flow';
import {
  createCurrentItem,
  type ItemBoundaryResult,
  type ItemCreationClient,
} from '@/lib/item-boundary';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;
const itemNameSchema = z.string()
  .transform((value) => value.normalize('NFKC'))
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value), 'Item name contains unsupported characters')
  .transform((value) => value.replace(/\s+/gu, ' ').trim())
  .refine((value) => Array.from(value).length > 0, 'Item name is required')
  .refine((value) => Array.from(value).length <= 120, 'Item name is too long');
const createItemSchema = z.object({
  propertyId: z.string().uuid().transform((value) => value.toLowerCase()),
  requestId: z.string().uuid().transform((value) => value.toLowerCase()),
  name: itemNameSchema,
}).strict();

function safeResponse(result: ItemBoundaryResult) {
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: result.error.code, message: result.error.message } },
      { status: result.error.status, headers: RESPONSE_HEADERS }
    );
  }
  return NextResponse.json(
    { success: true, item: result.item },
    { status: 200, headers: RESPONSE_HEADERS }
  );
}

export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const parsed = await parseJsonRequest(request, createItemSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Check the item details and try again.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  try {
    const client = await createSupabaseServer() as unknown as ItemCreationClient;
    return safeResponse(await createCurrentItem(client, parsed.data));
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'ITEM_CREATION_UNAVAILABLE', message: 'We could not create this item. Please try again.' } },
      { status: 503, headers: RESPONSE_HEADERS }
    );
  }
}
