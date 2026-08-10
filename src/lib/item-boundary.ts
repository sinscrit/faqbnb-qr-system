import { z } from 'zod';
import {
  resolvePropertySelection,
  type PropertyContextClient,
  type PropertyContextErrorCode,
} from '@/lib/property-context';

interface ClientError { code?: string; message?: string }
interface QueryResult { data: unknown; error: ClientError | null }

export type ItemPublicationClient = PropertyContextClient & {
  rpc(
    functionName: 'publish_current_item_with_instruction',
    args: {
      p_property_id: string;
      p_request_id: string;
      p_name: string;
      p_instruction_title: string;
      p_instruction_body: string;
    }
  ): Promise<QueryResult>;
};

export interface PublicItemClient {
  rpc(functionName: 'read_public_item', args: { p_public_id: string }): Promise<QueryResult>;
}

export interface PublishedInstruction { title: string; body: string }
export interface PublishedItem {
  publicId: string;
  name: string;
  instructions: PublishedInstruction[];
}

type ItemErrorStatus = 401 | 403 | 404 | 409 | 503;
type ItemErrorCode = PropertyContextErrorCode | 'PUBLISH_CONFLICT' |
  'PUBLISH_FORBIDDEN' | 'PUBLISH_UNAVAILABLE' | 'ITEM_NOT_FOUND' |
  'PUBLIC_ITEM_UNAVAILABLE';

export type PublicationResult =
  | { success: true; item: { publicId: string; name: string }; instruction: PublishedInstruction }
  | { success: false; error: { code: ItemErrorCode; message: string; status: ItemErrorStatus } };
export type PublicItemResult =
  | { success: true; item: PublishedItem }
  | { success: false; error: { code: ItemErrorCode; message: string; status: ItemErrorStatus } };

const singleLineSchema = z.string()
  .refine((value) => value === value.trim() && value.length > 0)
  .refine((value) => Array.from(value).length <= 120)
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));
const bodySchema = z.string()
  .refine((value) => value.length > 0 && Array.from(value).length <= 8000)
  .refine((value) => !/[\p{Cf}\p{Cs}\u0000-\u0008\u000B\u000C\u000D-\u001F\u007F-\u009F\u2028\u2029]/u.test(value));
const publicationInputSchema = z.object({
  propertyId: z.string().uuid().transform((value) => value.toLowerCase()),
  requestId: z.string().uuid().transform((value) => value.toLowerCase()),
  itemName: singleLineSchema,
  instruction: z.object({ title: singleLineSchema, body: bodySchema }).strict(),
}).strict();
const publicationRowsSchema = z.array(z.object({
  public_id: z.string().uuid(),
  item_name: singleLineSchema,
  instruction_title: singleLineSchema,
  instruction_body: bodySchema,
}).strict()).length(1);
const instructionSchema = z.object({ title: singleLineSchema, body: bodySchema }).strict();
const publicRowsSchema = z.array(z.object({
  public_id: z.string().uuid(),
  name: singleLineSchema,
  instructions: z.array(instructionSchema).min(1).max(100),
}).strict()).max(1);

function failure(code: ItemErrorCode, message: string, status: ItemErrorStatus) {
  return { success: false as const, error: { code, message, status } };
}

/** Publish one useful item after freshly revalidating cookie/account/property context. */
export async function publishCurrentItem(
  client: ItemPublicationClient,
  input: {
    propertyId: string;
    requestId: string;
    itemName: string;
    instruction: PublishedInstruction;
  }
): Promise<PublicationResult> {
  const parsedInput = publicationInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }
  const normalizedInput = parsedInput.data;
  const propertyId = normalizedInput.propertyId;
  const requestId = normalizedInput.requestId;
  let selected: Awaited<ReturnType<typeof resolvePropertySelection>>;
  try {
    selected = await resolvePropertySelection(client, propertyId);
  } catch {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }
  if (!selected.success) {
    return failure(selected.error.code, selected.error.message, selected.error.status);
  }
  if (selected.context.state !== 'ready') {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }

  let response: QueryResult;
  try {
    response = await client.rpc('publish_current_item_with_instruction', {
      p_property_id: selected.context.property.id,
      p_request_id: requestId,
      p_name: normalizedInput.itemName,
      p_instruction_title: normalizedInput.instruction.title,
      p_instruction_body: normalizedInput.instruction.body,
    });
  } catch {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }
  if (!response || typeof response !== 'object') {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }
  if (response.error) {
    if (response.error.code === '23505') {
      return failure('PUBLISH_CONFLICT', 'This saved request no longer matches these details. Start a new edit to publish.', 409);
    }
    if (response.error.code === '42501' || response.error.code === 'P0002') {
      return failure('PUBLISH_FORBIDDEN', 'This property cannot be changed.', 403);
    }
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }

  const parsed = publicationRowsSchema.safeParse(response.data);
  const row = parsed.success ? parsed.data[0] : null;
  if (!row || row.item_name !== normalizedInput.itemName ||
      row.instruction_title !== normalizedInput.instruction.title ||
      row.instruction_body !== normalizedInput.instruction.body) {
    return failure('PUBLISH_UNAVAILABLE', 'We could not publish this guest page. Please try again.', 503);
  }
  return {
    success: true,
    item: { publicId: row.public_id.toLowerCase(), name: row.item_name },
    instruction: { title: row.instruction_title, body: row.instruction_body },
  };
}

/** Read only the exact database guest projection using a cookie-free anonymous client. */
export async function readPublicItem(client: PublicItemClient, publicId: string): Promise<PublicItemResult> {
  const normalizedPublicId = publicId.toLowerCase();
  let response: QueryResult;
  try {
    response = await client.rpc('read_public_item', { p_public_id: normalizedPublicId });
  } catch {
    return failure('PUBLIC_ITEM_UNAVAILABLE', 'This guest page is temporarily unavailable.', 503);
  }
  if (!response || typeof response !== 'object' || response.error) {
    return failure('PUBLIC_ITEM_UNAVAILABLE', 'This guest page is temporarily unavailable.', 503);
  }
  const parsed = publicRowsSchema.safeParse(response.data);
  if (!parsed.success) {
    return failure('PUBLIC_ITEM_UNAVAILABLE', 'This guest page is temporarily unavailable.', 503);
  }
  if (parsed.data.length === 0) return failure('ITEM_NOT_FOUND', 'Guest page not found.', 404);
  const row = parsed.data[0];
  if (row.public_id.toLowerCase() !== normalizedPublicId) {
    return failure('PUBLIC_ITEM_UNAVAILABLE', 'This guest page is temporarily unavailable.', 503);
  }
  return {
    success: true,
    item: { publicId: normalizedPublicId, name: row.name, instructions: row.instructions },
  };
}
