import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  readPublicItem,
  type PublicItemClient,
} from '@/lib/item-boundary';
import { createPublicSupabaseServer } from '@/lib/supabase-public-server';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;
const publicIdSchema = z.string().uuid().transform((value) => value.toLowerCase());

function notFoundResponse() {
  return NextResponse.json(
    { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.' } },
    { status: 404, headers: RESPONSE_HEADERS }
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> }
) {
  let params: { publicId: string };
  try {
    params = await context.params;
  } catch {
    return notFoundResponse();
  }

  const parsed = publicIdSchema.safeParse(params?.publicId);
  if (!parsed.success) return notFoundResponse();

  try {
    const client = createPublicSupabaseServer() as unknown as PublicItemClient;
    const result = await readPublicItem(client, parsed.data);
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
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'PUBLIC_ITEM_UNAVAILABLE', message: 'This item is temporarily unavailable.' } },
      { status: 503, headers: RESPONSE_HEADERS }
    );
  }
}
