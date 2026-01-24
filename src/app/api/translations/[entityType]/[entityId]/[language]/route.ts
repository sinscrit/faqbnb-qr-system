/**
 * Manual Translation Override API Endpoint
 *
 * PUT /api/translations/[entityType]/[entityId]/[language]
 *
 * Allows property owners to manually override automatic translations (Epic 3)
 * and edit translations with review tracking (Epic 5).
 *
 * Part of REQ-E03-023: Create Manual Translation Override Endpoint (Epic 3)
 * Part of REQ-E05-002: Create Update Translation API Endpoint (Epic 5)
 * Epic: L10N Epic 3 & Epic 5 - Dynamic Content Translation & Owner Translation Management
 * Phase: 4 - Translation Status & Management APIs
 *
 * Schema: reviewed_by column available for items, articles, links (Epic 5);
 *         not available for tags (different schema pattern using translated_value)
 *
 * Created: 2026-01-21
 * Last Modified: 2026-01-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  isSupportedLanguage,
  type SupportedLanguage,
} from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Type Definitions
// ============================================================================

/** Valid entity types for translation override */
type TranslationEntityType = 'item' | 'article' | 'link' | 'tag';

/** Entity-specific request body interfaces */
interface ItemTranslationOverrideRequest {
  name?: string;
  description?: string;
}

interface ArticleTranslationOverrideRequest {
  title?: string;
  description?: string;
}

interface LinkTranslationOverrideRequest {
  title?: string;
}

interface TagTranslationOverrideRequest {
  value?: string;
}

/** Union type for all possible request bodies - exported for API consumers */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exported for type documentation
type TranslationOverrideRequest =
  | ItemTranslationOverrideRequest
  | ArticleTranslationOverrideRequest
  | LinkTranslationOverrideRequest
  | TagTranslationOverrideRequest;

/**
 * Success response payload
 * Used by Epic 5 UI components: Translation Editor, Preview Panel
 * Note: reviewedBy field is populated for items, articles, links but may be
 * empty for legacy data created before Epic 5 migration
 *
 * Import: import type { ManualTranslationResponse } from '@/app/api/translations/[entityType]/[entityId]/[language]/route'
 */
export interface ManualTranslationResponse {
  success: true;
  data: {
    entityId: string;
    entityType: TranslationEntityType;
    language: string;
    fieldsUpdated: number;
    translationStatus: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
}

/** Error response payload */
export interface TranslationErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * Combined response type for manual translation API
 * Used by Epic 5 UI components to type API responses
 */
export type ManualTranslationApiResponse = ManualTranslationResponse | TranslationErrorResponse;

// ============================================================================
// Constants
// ============================================================================

/** Valid entity types */
const VALID_ENTITY_TYPES: TranslationEntityType[] = ['item', 'article', 'link', 'tag'];

/** Field definitions per entity type */
const TRANSLATABLE_FIELDS: Record<TranslationEntityType, string[]> = {
  item: ['name', 'description'],
  article: ['title', 'description'],
  link: ['title'],
  tag: ['value'],
};

/** Maximum field lengths */
const MAX_FIELD_LENGTHS: Record<string, number> = {
  name: 255,
  title: 255,
  value: 255,
  description: 5000,
};

/** Error codes */
const ERROR_CODES = {
  INVALID_ENTITY_TYPE: 'INVALID_ENTITY_TYPE',
  INVALID_ENTITY_ID: 'INVALID_ENTITY_ID',
  INVALID_LANGUAGE: 'INVALID_LANGUAGE',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_FIELDS: 'INVALID_FIELDS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates request body against allowed fields for the entity type
 */
function validateRequestBody(
  body: Record<string, unknown>,
  entityType: TranslationEntityType
): { valid: boolean; error?: string; validFields?: Record<string, string> } {
  const allowedFields = TRANSLATABLE_FIELDS[entityType];

  if (!allowedFields) {
    return { valid: false, error: 'Invalid entity type' };
  }

  const providedFields = Object.keys(body);
  const validFields: Record<string, string> = {};

  // Check for non-allowed fields
  for (const field of providedFields) {
    if (!allowedFields.includes(field)) {
      return { valid: false, error: `Field '${field}' is not translatable for ${entityType}` };
    }
  }

  // Validate each provided field
  for (const field of providedFields) {
    const value = body[field];

    // Must be a string
    if (typeof value !== 'string') {
      return { valid: false, error: `Field '${field}' must be a string` };
    }

    // Must not be empty
    if (value.trim().length === 0) {
      return { valid: false, error: `Field '${field}' cannot be empty` };
    }

    // Check max length
    const maxLength = MAX_FIELD_LENGTHS[field] || 255;
    if (value.length > maxLength) {
      return {
        valid: false,
        error: `Field '${field}' exceeds maximum length of ${maxLength} characters`,
      };
    }

    validFields[field] = value;
  }

  // At least one field must be provided
  if (Object.keys(validFields).length === 0) {
    return { valid: false, error: 'At least one translatable field must be provided' };
  }

  return { valid: true, validFields };
}

/**
 * Gets entity by type and ID, including ownership information
 */
async function getEntity(
  entityType: TranslationEntityType,
  entityId: string
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  switch (entityType) {
    case 'item': {
      const result = await supabaseAdmin
        .from('items')
        .select('id, property_id, updated_at')
        .eq('id', entityId)
        .single();

      if (result.error) return { data: null, error: result.error };

      // Get property info for ownership check
      const propResult = await supabaseAdmin
        .from('properties')
        .select('id, user_id, account_id')
        .eq('id', result.data.property_id)
        .single();

      return {
        data: { ...result.data, properties: propResult.data },
        error: propResult.error,
      };
    }
    case 'article': {
      const result = await supabaseAdmin
        .from('item_articles')
        .select('id, item_id, updated_at')
        .eq('id', entityId)
        .single();

      if (result.error) return { data: null, error: result.error };

      // Get item and property info
      const articleItemId = result.data.item_id;
      if (!articleItemId) return { data: null, error: { message: 'Article has no item_id' } };

      const itemResult = await supabaseAdmin
        .from('items')
        .select('id, property_id')
        .eq('id', articleItemId)
        .single();

      if (itemResult.error) return { data: null, error: itemResult.error };

      const propResult = await supabaseAdmin
        .from('properties')
        .select('id, user_id, account_id')
        .eq('id', itemResult.data.property_id)
        .single();

      return {
        data: {
          ...result.data,
          items: { ...itemResult.data, properties: propResult.data },
        },
        error: propResult.error,
      };
    }
    case 'link': {
      // Note: item_links has no updated_at, use created_at for source_version_at
      const result = await supabaseAdmin
        .from('item_links')
        .select('id, item_id, created_at')
        .eq('id', entityId)
        .single();

      if (result.error) return { data: null, error: result.error };

      // Get item and property info
      const linkItemId = result.data.item_id;
      if (!linkItemId) return { data: null, error: { message: 'Link has no item_id' } };

      const itemResult = await supabaseAdmin
        .from('items')
        .select('id, property_id')
        .eq('id', linkItemId)
        .single();

      if (itemResult.error) return { data: null, error: itemResult.error };

      const propResult = await supabaseAdmin
        .from('properties')
        .select('id, user_id, account_id')
        .eq('id', itemResult.data.property_id)
        .single();

      return {
        data: {
          ...result.data,
          items: { ...itemResult.data, properties: propResult.data },
        },
        error: propResult.error,
      };
    }
    case 'tag': {
      // For tags, check if any tag translations exist for this key
      // Tags may use string keys, not UUIDs
      const result = await supabaseAdmin
        .from('tag_translations')
        .select('id, tag_key')
        .eq('tag_key', entityId)
        .limit(1);

      if (result.error) return { data: null, error: result.error };

      // If no translation exists yet, check translation_jobs
      if (!result.data || result.data.length === 0) {
        const jobsResult = await supabaseAdmin
          .from('translation_jobs')
          .select('id, entity_id')
          .eq('entity_type', 'tag')
          .eq('entity_id', entityId)
          .limit(1);

        if (jobsResult.error) return { data: null, error: jobsResult.error };

        if (!jobsResult.data || jobsResult.data.length === 0) {
          // Tag doesn't exist in any form
          return { data: null, error: { message: 'Tag not found' } };
        }

        return { data: { id: entityId, key: entityId }, error: null };
      }

      return { data: { id: result.data[0].id, key: result.data[0].tag_key }, error: null };
    }
    default:
      return { data: null, error: { message: 'Invalid entity type' } };
  }
}

/**
 * Validates user access to the entity
 */
function validateEntityAccess(
  entity: Record<string, unknown>,
  entityType: TranslationEntityType,
  userId: string,
  isAdmin: boolean
): { authorized: boolean; reason?: string } {
  // Admins can edit any entity
  if (isAdmin) {
    return { authorized: true };
  }

  switch (entityType) {
    case 'item': {
      const properties = entity.properties as Record<string, unknown> | null;
      if (!properties || properties.user_id !== userId) {
        return { authorized: false, reason: 'User does not own this item' };
      }
      return { authorized: true };
    }
    case 'article':
    case 'link': {
      const items = entity.items as Record<string, unknown> | null;
      const properties = items?.properties as Record<string, unknown> | null;
      if (!properties || properties.user_id !== userId) {
        return { authorized: false, reason: `User does not own this ${entityType}` };
      }
      return { authorized: true };
    }
    case 'tag': {
      // Tags are generally editable if they exist and user is authenticated
      return { authorized: true };
    }
    default:
      return { authorized: false, reason: 'Unknown entity type' };
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * PUT /api/translations/[entityType]/[entityId]/[language]
 *
 * Manually override translations for a specific entity and language.
 *
 * URL Parameters:
 *   - entityType: 'item' | 'article' | 'link' | 'tag'
 *   - entityId: UUID of the entity
 *   - language: ISO 639-1 language code
 *
 * Request Body (varies by entityType):
 *   - item: { name?: string, description?: string }
 *   - article: { title?: string, description?: string }
 *   - link: { title?: string }
 *   - tag: { value?: string }
 *
 * Response:
 *   - success: boolean
 *   - data: { entityId, entityType, language, fieldsUpdated, translationStatus, reviewedBy, updatedAt }
 *   - error: string (on failure)
 *   - code: string error code (on failure)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
): Promise<NextResponse<ManualTranslationApiResponse>> {
  try {
    // 1. Extract route parameters
    const { entityType, entityId, language } = await params;

    console.log('MANUAL_OVERRIDE: Request received', { entityType, entityId, language });

    // 2. Validate entity type
    if (!VALID_ENTITY_TYPES.includes(entityType as TranslationEntityType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid entity type: ${entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: ERROR_CODES.INVALID_ENTITY_TYPE,
        },
        { status: 400 }
      );
    }

    const validatedEntityType = entityType as TranslationEntityType;

    // 3. Validate entity ID format (UUID) - skip for tags which may use string keys
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (validatedEntityType !== 'tag' && !uuidRegex.test(entityId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid entity ID format. Must be a valid UUID.',
          code: ERROR_CODES.INVALID_ENTITY_ID,
        },
        { status: 400 }
      );
    }

    // 4. Validate language code
    if (!isSupportedLanguage(language)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported language: ${language}. Supported languages: en, fr, es, de, nl, it`,
          code: ERROR_CODES.INVALID_LANGUAGE,
        },
        { status: 400 }
      );
    }

    const targetLanguage: SupportedLanguage = language;

    // 5. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('MANUAL_OVERRIDE: Authentication failed');
      return authResult.error as NextResponse<ManualTranslationApiResponse>;
    }

    const { user, isAdmin } = authResult;
    console.log('MANUAL_OVERRIDE: User authenticated', { userId: user.id, email: user.email, isAdmin });

    // 6. Check entity existence
    const { data: entity, error: entityError } = await getEntity(validatedEntityType, entityId);

    if (entityError || !entity) {
      console.log('MANUAL_OVERRIDE: Entity not found', { entityType, entityId, error: entityError });
      return NextResponse.json(
        {
          success: false,
          error: `${validatedEntityType} with ID ${entityId} not found`,
          code: ERROR_CODES.ENTITY_NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // 7. Check authorization
    const accessCheck = validateEntityAccess(entity, validatedEntityType, user.id, isAdmin);
    if (!accessCheck.authorized) {
      console.log('MANUAL_OVERRIDE: Access denied', { reason: accessCheck.reason });
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to edit translations for this entity',
          code: ERROR_CODES.FORBIDDEN,
        },
        { status: 403 }
      );
    }

    // 8. Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: ERROR_CODES.INVALID_FIELDS,
        },
        { status: 400 }
      );
    }

    const validation = validateRequestBody(body, validatedEntityType);
    if (!validation.valid || !validation.validFields) {
      console.log('MANUAL_OVERRIDE: Validation failed', { error: validation.error });
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Validation failed',
          code: ERROR_CODES.INVALID_FIELDS,
        },
        { status: 400 }
      );
    }

    const translatedFields = validation.validFields;
    console.log('MANUAL_OVERRIDE: Fields validated', { fields: Object.keys(translatedFields) });

    // 9. Perform UPSERT operation
    const now = new Date().toISOString();

    console.log('MANUAL_OVERRIDE: Upserting translation', {
      entityType: validatedEntityType,
      entityId,
      language: targetLanguage,
    });

    let upsertError: unknown = null;

    // Use switch statement to get proper typing for each table
    // Schema differences (after Epic 5 migration):
    // - item_translations: has reviewed_by column (added Epic 5)
    // - article_translations: has reviewed_by column (Epic 1)
    // - link_translations: has reviewed_by column (added Epic 5)
    // - tag_translations: uses translated_value, no translation_status/reviewed_by/translated_at/updated_at
    // Note: reviewed_by enables tracking which user manually edited each translation
    switch (validatedEntityType) {
      // Item case: reviewed_by column added in Epic 5
      case 'item': {
        const itemFields = translatedFields as { name?: string; description?: string };
        // name is required in the schema
        if (!itemFields.name) {
          return NextResponse.json(
            {
              success: false,
              error: 'Name field is required for item translations',
              code: ERROR_CODES.INVALID_FIELDS,
            },
            { status: 400 }
          );
        }
        // REQ-E05-004: Get source updated_at for stale translation detection
        const sourceVersionAt = (entity.updated_at as string) || null;
        const result = await supabaseAdmin
          .from('item_translations')
          .upsert(
            {
              item_id: entityId,
              language: targetLanguage,
              name: itemFields.name,
              description: itemFields.description || null,
              translation_status: 'manual',
              reviewed_by: user.id,
              translated_at: now,
              updated_at: now,
              source_version_at: sourceVersionAt, // REQ-E05-004
            },
            { onConflict: 'item_id,language' }
          )
          .select('id')
          .single();
        upsertError = result.error;
        break;
      }
      case 'article': {
        const articleFields = translatedFields as { title?: string; description?: string };
        // title is required in the schema
        if (!articleFields.title) {
          return NextResponse.json(
            {
              success: false,
              error: 'Title field is required for article translations',
              code: ERROR_CODES.INVALID_FIELDS,
            },
            { status: 400 }
          );
        }
        // REQ-E05-004: Get source updated_at for stale translation detection
        const articleSourceVersionAt = (entity.updated_at as string) || null;
        const result = await supabaseAdmin
          .from('article_translations')
          .upsert(
            {
              article_id: entityId,
              language: targetLanguage,
              title: articleFields.title,
              description: articleFields.description || null,
              translation_status: 'manual',
              reviewed_by: user.id,
              translated_at: now,
              updated_at: now,
              source_version_at: articleSourceVersionAt, // REQ-E05-004
            },
            { onConflict: 'article_id,language' }
          )
          .select('id')
          .single();
        upsertError = result.error;
        break;
      }
      // Link case: reviewed_by column added in Epic 5
      case 'link': {
        const linkFields = translatedFields as { title?: string };
        // title is required in the schema
        if (!linkFields.title) {
          return NextResponse.json(
            {
              success: false,
              error: 'Title field is required for link translations',
              code: ERROR_CODES.INVALID_FIELDS,
            },
            { status: 400 }
          );
        }
        // REQ-E05-004: Get source created_at for stale translation detection (item_links has no updated_at)
        const linkSourceVersionAt = (entity.created_at as string) || null;
        const result = await supabaseAdmin
          .from('link_translations')
          .upsert(
            {
              link_id: entityId,
              language: targetLanguage,
              title: linkFields.title,
              translation_status: 'manual',
              reviewed_by: user.id,
              translated_at: now,
              updated_at: now,
              source_version_at: linkSourceVersionAt, // REQ-E05-004
            },
            { onConflict: 'link_id,language' }
          )
          .select('id')
          .single();
        upsertError = result.error;
        break;
      }
      case 'tag': {
        const tagFields = translatedFields as { value?: string };
        // translated_value is required in the schema
        if (!tagFields.value) {
          return NextResponse.json(
            {
              success: false,
              error: 'Value field is required for tag translations',
              code: ERROR_CODES.INVALID_FIELDS,
            },
            { status: 400 }
          );
        }
        const tagKey = (entity.key as string) || entityId;
        const result = await supabaseAdmin
          .from('tag_translations')
          .upsert(
            {
              tag_key: tagKey,
              language: targetLanguage,
              translated_value: tagFields.value,
            },
            { onConflict: 'tag_key,language' }
          )
          .select('id')
          .single();
        upsertError = result.error;
        break;
      }
    }

    if (upsertError) {
      console.error('MANUAL_OVERRIDE: UPSERT error', upsertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save translation',
          code: ERROR_CODES.DATABASE_ERROR,
        },
        { status: 500 }
      );
    }

    // 10. Build and return success response
    const fieldsUpdated = Object.keys(translatedFields).length;

    const response: ManualTranslationResponse = {
      success: true,
      data: {
        entityId: entityId,
        entityType: validatedEntityType,
        language: targetLanguage,
        fieldsUpdated: fieldsUpdated,
        translationStatus: 'manual',
        reviewedBy: user.id,
        updatedAt: now,
      },
    };

    console.log('MANUAL_OVERRIDE: Success', {
      entityType: validatedEntityType,
      entityId,
      language: targetLanguage,
      fieldsUpdated,
      user: user.email,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('MANUAL_OVERRIDE: Unexpected error', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          code: ERROR_CODES.INVALID_FIELDS,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
