import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import {
  publishCurrentItem,
  type ItemPublicationClient,
  type PublicationResult,
} from '@/lib/item-boundary';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;
const BODY_LIMIT = 32_768;

const singleLine = z.string()
  .transform((value) => value.normalize('NFKC'))
  .refine((value) => !/[\p{Cc}\p{Cf}\p{Cs}]/u.test(value))
  .transform((value) => value.replace(/\s+/gu, ' ').trim())
  .refine((value) => Array.from(value).length > 0)
  .refine((value) => Array.from(value).length <= 120);
const body = z.string()
  .transform((value) => value.normalize('NFKC'))
  .refine((value) => !/[\p{Cf}\p{Cs}\u0000-\u0008\u000B\u000C\u000D-\u001F\u007F-\u009F\u2028\u2029]/u.test(value))
  .transform((value) => value.trim())
  .refine((value) => Array.from(value).length > 0)
  .refine((value) => Array.from(value).length <= 8000);
const publicationSchema = z.object({
  propertyId: z.string().uuid().transform((value) => value.toLowerCase()),
  requestId: z.string().uuid().transform((value) => value.toLowerCase()),
  itemName: singleLine,
  instruction: z.object({ title: singleLine, body }).strict(),
}).strict();

async function parsePublication(request: Request) {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  const declared = request.headers.get('content-length');
  if (contentType !== 'application/json' ||
      (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > BODY_LIMIT))) {
    return { success: false as const };
  }
  try {
    const text = await request.text();
    if (!text || new TextEncoder().encode(text).length > BODY_LIMIT) return { success: false as const };
    const parsed = publicationSchema.safeParse(JSON.parse(text));
    return parsed.success ? { success: true as const, data: parsed.data } : { success: false as const };
  } catch {
    return { success: false as const };
  }
}

function safeResponse(result: PublicationResult) {
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: result.error.code, message: result.error.message } },
      { status: result.error.status, headers: RESPONSE_HEADERS }
    );
  }
  return NextResponse.json(
    { success: true, item: result.item, instruction: result.instruction },
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
  const parsed = await parsePublication(request);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Check the page details and try again.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }
  try {
    const client = await createSupabaseServer() as unknown as ItemPublicationClient;
    return safeResponse(await publishCurrentItem(client, parsed.data));
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'PUBLISH_UNAVAILABLE', message: 'We could not publish this guest page. Please try again.' } },
      { status: 503, headers: RESPONSE_HEADERS }
    );
  }
}
