import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTrustedAuthMutation } from '@/lib/auth-origin';
import { parseJsonRequest } from '@/lib/auth-flow';
import {
  listPropertyChoices,
  resolvePropertyContext,
  resolvePropertySelection,
  type PropertyContextClient,
  type PropertyContextResult,
} from '@/lib/property-context';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;
const propertyNameSchema = z.string()
  .transform((value) => value.normalize('NFKC').replace(/\s+/gu, ' ').trim())
  .refine((value) => Array.from(value).length > 0, 'Property name is required')
  .refine((value) => Array.from(value).length <= 100, 'Property name is too long')
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value), 'Property name contains unsupported characters');

const propertyContextMutationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), propertyName: propertyNameSchema }).strict(),
  z.object({ action: z.literal('select'), propertyId: z.string().uuid() }).strict(),
]);

function safeResponse(result: PropertyContextResult) {
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: result.error.code, message: result.error.message } },
      { status: result.error.status, headers: RESPONSE_HEADERS }
    );
  }
  return NextResponse.json(
    { success: true, context: result.context },
    { status: 200, headers: RESPONSE_HEADERS }
  );
}

export async function GET() {
  try {
    const client = await createSupabaseServer() as unknown as PropertyContextClient;
    const result = await resolvePropertyContext(client);
    if (!result.success || result.context.state !== 'selection_required') {
      return safeResponse(result);
    }

    const choices = await listPropertyChoices(
      client,
      result.accountId,
      result.context.propertyCount
    );
    if (!choices) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROPERTY_CONTEXT_UNAVAILABLE',
            message: 'We could not load your property. Please try again.',
          },
        },
        { status: 503, headers: RESPONSE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, context: { ...result.context, choices } },
      { status: 200, headers: RESPONSE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROPERTY_CONTEXT_UNAVAILABLE',
          message: 'We could not load your property. Please try again.',
        },
      },
      { status: 503, headers: RESPONSE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  if (!isTrustedAuthMutation(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'This request could not be accepted.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const parsed = await parseJsonRequest(request, propertyContextMutationSchema);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Check the property details and try again.' } },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  try {
    const client = await createSupabaseServer() as unknown as PropertyContextClient;
    const result = parsed.data.action === 'create'
      ? await resolvePropertyContext(client, { propertyName: parsed.data.propertyName })
      : await resolvePropertySelection(client, parsed.data.propertyId);
    return safeResponse(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROPERTY_CONTEXT_UNAVAILABLE',
          message: 'We could not update your property. Please try again.',
        },
      },
      { status: 503, headers: RESPONSE_HEADERS }
    );
  }
}
