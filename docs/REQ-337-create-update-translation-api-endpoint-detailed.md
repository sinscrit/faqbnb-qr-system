# REQ-337: Create Update Translation API Endpoint - Detailed Task Breakdown

**Generated:** 2026-01-19 14:30:00 UTC
**Last Modified:** 2026-01-19 14:30:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #337
**Overview Document:** docs/REQ-337-create-update-translation-api-endpoint-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.2
**Estimated Size:** M (Medium)
**Estimated Effort:** 4-6 hours (single 1-story-point tasks)
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Executive Summary

This document provides granular implementation tasks for creating an API endpoint that allows property owners to manually update translation content for entities they own (articles, items, links). The endpoint validates ownership, persists updated translation content, marks the translation status as 'manual', and records the reviewer's identity.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Translation tables exist in database (`article_translations`, `item_translations`, `link_translations`)
- [ ] Translation status column exists with valid values including 'manual'
- [ ] `reviewed_by` column exists on `article_translations` table
- [ ] `validateAdminAuth` function is available from `/src/lib/auth-server.ts`
- [ ] `supabaseAdmin` is available from `/src/lib/supabase.ts`
- [ ] `createSupabaseServer` is available from `/src/lib/supabase-server.ts`
- [ ] Entity tables (`item_articles`, `items`, `item_links`) have proper joins to `properties` for ownership validation

---

## Task Breakdown

### Task 1: Create Route File and Directory Structure

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 15 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Create the nested directory structure:
   ```
   /src/app/api/translations/
   └── [entityType]/
       └── [entityId]/
           └── [language]/
               └── route.ts
   ```

2. Create the route file with initial imports:

```typescript
// /src/app/api/translations/[entityType]/[entityId]/[language]/route.ts
// REQ-337: Update Translation API Endpoint
// Phase: 1 - API Endpoints
// Task ID: 1.2
// Last Modified: 2026-01-19

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
```

#### Acceptance Criteria

- [ ] Directory `/src/app/api/translations/[entityType]/[entityId]/[language]/` exists
- [ ] File `route.ts` created at correct path
- [ ] All required imports present and valid
- [ ] File compiles without TypeScript errors

#### Verification Command

```bash
# Verify file exists and compiles
npx tsc --noEmit src/app/api/translations/[entityType]/[entityId]/[language]/route.ts
```

---

### Task 2: Define TypeScript Interfaces and Constants

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Add supported languages and entity type constants:

```typescript
// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Valid entity types
const VALID_ENTITY_TYPES = ['article', 'item', 'link'] as const;
type TranslatableEntityType = typeof VALID_ENTITY_TYPES[number];

// Valid translation statuses
const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;
type TranslationStatus = typeof VALID_STATUSES[number];
```

2. Add request and response interfaces:

```typescript
// Route parameters interface
interface RouteParams {
  entityType: string;
  entityId: string;
  language: string;
}

// Request body interface
interface UpdateTranslationRequest {
  // For articles:
  title?: string;
  description?: string;

  // For items:
  name?: string;
  // description?: string; (same as articles)

  // For links:
  // title?: string; (same as articles)
}

// Validated request body after type checking
interface ValidatedTranslationContent {
  title?: string;
  description?: string;
  name?: string;
}

// Success response interface
interface UpdateTranslationResponse {
  success: true;
  data: {
    translation: {
      id: string;
      entityType: TranslatableEntityType;
      entityId: string;
      language: SupportedLanguage;
      content: {
        title?: string;
        name?: string;
        description?: string;
      };
      status: 'manual';
      reviewedBy: string | null;
      translatedAt: string;
      updatedAt: string;
    };
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: string;
  code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
}

// Union type for all responses
type ApiResponse = UpdateTranslationResponse | ErrorResponse;
```

3. Add type guard functions:

```typescript
// Type guards
function isValidEntityType(value: string): value is TranslatableEntityType {
  return VALID_ENTITY_TYPES.includes(value as TranslatableEntityType);
}

function isValidLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
```

#### Acceptance Criteria

- [ ] All interfaces defined with proper JSDoc comments
- [ ] Type guards implemented for entityType, language, and UUID validation
- [ ] Constants defined for supported languages and entity types
- [ ] Types match the API contract in overview document
- [ ] Request body interface supports all entity types' content fields

---

### Task 3: Implement getAccountContext Helper Function

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Copy and adapt the `getAccountContext` pattern from `/src/app/api/admin/articles/[articleId]/route.ts`:

```typescript
/**
 * Extract account context from request
 * Validates user has access to the requested account or falls back to their primary account
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{
  accountId: string | null;
  accountRole: string;
  error?: NextResponse;
}> {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');

    // If specific account requested, validate access
    if (requestedAccountId) {
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();

      if (accessError || !accountAccess) {
        return {
          accountId: null,
          accountRole: '',
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }

    // Admin users can operate across all accounts
    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    }

    // Regular users: get their primary account
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (accountsError || !userAccounts) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'No account access found for user', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
  } catch (error) {
    console.error('[UpdateTranslation] Account context error:', error);
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'Failed to determine account context', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    };
  }
}
```

#### Acceptance Criteria

- [ ] Function extracts account_id from query params or headers
- [ ] Admin users can operate without account restriction
- [ ] Non-admin users are scoped to their own account
- [ ] Invalid account access returns 403 FORBIDDEN
- [ ] Missing account access returns 403 FORBIDDEN

---

### Task 4: Implement Route Parameter Validation

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Create a parameter validation function:

```typescript
/**
 * Validate route parameters from the request
 */
function validateRouteParams(params: RouteParams): {
  valid: boolean;
  entityType?: TranslatableEntityType;
  entityId?: string;
  language?: SupportedLanguage;
  error?: NextResponse;
} {
  const { entityType, entityId, language } = params;

  // Validate entityType
  if (!isValidEntityType(entityType)) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          success: false,
          error: `Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    };
  }

  // Validate entityId (UUID format)
  if (!isValidUUID(entityId)) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          success: false,
          error: 'Invalid entity ID format. Must be a valid UUID.',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    };
  }

  // Validate language
  if (!isValidLanguage(language)) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          success: false,
          error: `Unsupported language code. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    };
  }

  return {
    valid: true,
    entityType,
    entityId,
    language
  };
}
```

#### Acceptance Criteria

- [ ] `entityType` validated against allowed values (article, item, link)
- [ ] `entityId` validated as UUID format
- [ ] `language` validated against supported language codes
- [ ] Invalid parameters return 400 with descriptive error message and VALIDATION_ERROR code
- [ ] Valid parameters returned with proper types

---

### Task 5: Implement Request Body Validation

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 25 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Create a request body validation function:

```typescript
/**
 * Validate request body based on entity type
 * Each entity type has different required/optional fields
 */
function validateTranslationBody(
  body: unknown,
  entityType: TranslatableEntityType
): {
  valid: boolean;
  data?: ValidatedTranslationContent;
  error?: NextResponse;
} {
  // Check body is an object
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Request body is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  const data = body as Record<string, unknown>;

  switch (entityType) {
    case 'article': {
      // Article translations require at least title or description
      if (!data.title && !data.description) {
        return {
          valid: false,
          error: NextResponse.json(
            {
              success: false,
              error: 'At least title or description is required for article translation',
              code: 'VALIDATION_ERROR'
            },
            { status: 400 }
          )
        };
      }

      // Validate field types
      if (data.title !== undefined && typeof data.title !== 'string') {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'title must be a string', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }
      if (data.description !== undefined && typeof data.description !== 'string') {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'description must be a string', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }

      return {
        valid: true,
        data: {
          title: data.title as string | undefined,
          description: data.description as string | undefined
        }
      };
    }

    case 'item': {
      // Item translations require at least name or description
      if (!data.name && !data.description) {
        return {
          valid: false,
          error: NextResponse.json(
            {
              success: false,
              error: 'At least name or description is required for item translation',
              code: 'VALIDATION_ERROR'
            },
            { status: 400 }
          )
        };
      }

      // Validate field types
      if (data.name !== undefined && typeof data.name !== 'string') {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'name must be a string', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }
      if (data.description !== undefined && typeof data.description !== 'string') {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'description must be a string', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }

      return {
        valid: true,
        data: {
          name: data.name as string | undefined,
          description: data.description as string | undefined
        }
      };
    }

    case 'link': {
      // Link translations require title
      if (!data.title) {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'title is required for link translation', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }

      // Validate field type
      if (typeof data.title !== 'string') {
        return {
          valid: false,
          error: NextResponse.json(
            { success: false, error: 'title must be a string', code: 'VALIDATION_ERROR' },
            { status: 400 }
          )
        };
      }

      return {
        valid: true,
        data: {
          title: data.title as string
        }
      };
    }

    default:
      return {
        valid: false,
        error: NextResponse.json(
          { success: false, error: 'Invalid entity type', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      };
  }
}
```

#### Acceptance Criteria

- [ ] Article translations require at least title or description
- [ ] Item translations require at least name or description
- [ ] Link translations require title
- [ ] All fields validated as string types
- [ ] Undefined/null body returns VALIDATION_ERROR
- [ ] Missing required fields return descriptive error messages

---

### Task 6: Implement Entity Ownership Validation Functions

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 35 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Create article ownership validation function:

```typescript
/**
 * Validate user owns the specified article via property -> account chain
 */
async function validateArticleOwnership(
  articleId: string,
  accountId: string | null,
  userIsAdmin: boolean
): Promise<{
  found: boolean;
  authorized: boolean;
  entity?: any;
  error?: NextResponse;
}> {
  const { data: article, error } = await supabaseAdmin
    .from('item_articles')
    .select(`
      id,
      title,
      item_id,
      items!inner(
        id,
        property_id,
        properties!inner(account_id)
      )
    `)
    .eq('id', articleId)
    .single();

  if (error || !article) {
    return {
      found: false,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Article not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  // Admin users have access to all articles
  if (userIsAdmin) {
    return { found: true, authorized: true, entity: article };
  }

  // Check account ownership
  const propertyAccountId = (article as any).items?.properties?.account_id;
  if (accountId && propertyAccountId !== accountId) {
    return {
      found: true,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to article', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { found: true, authorized: true, entity: article };
}
```

2. Create item ownership validation function:

```typescript
/**
 * Validate user owns the specified item via property -> account chain
 */
async function validateItemOwnership(
  itemId: string,
  accountId: string | null,
  userIsAdmin: boolean
): Promise<{
  found: boolean;
  authorized: boolean;
  entity?: any;
  error?: NextResponse;
}> {
  const { data: item, error } = await supabaseAdmin
    .from('items')
    .select(`
      id,
      name,
      property_id,
      properties!inner(account_id)
    `)
    .eq('id', itemId)
    .single();

  if (error || !item) {
    return {
      found: false,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Item not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  // Admin users have access to all items
  if (userIsAdmin) {
    return { found: true, authorized: true, entity: item };
  }

  // Check account ownership
  const propertyAccountId = (item as any).properties?.account_id;
  if (accountId && propertyAccountId !== accountId) {
    return {
      found: true,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to item', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { found: true, authorized: true, entity: item };
}
```

3. Create link ownership validation function:

```typescript
/**
 * Validate user owns the specified link via item -> property -> account chain
 */
async function validateLinkOwnership(
  linkId: string,
  accountId: string | null,
  userIsAdmin: boolean
): Promise<{
  found: boolean;
  authorized: boolean;
  entity?: any;
  error?: NextResponse;
}> {
  const { data: link, error } = await supabaseAdmin
    .from('item_links')
    .select(`
      id,
      title,
      item_id,
      items!inner(
        id,
        property_id,
        properties!inner(account_id)
      )
    `)
    .eq('id', linkId)
    .single();

  if (error || !link) {
    return {
      found: false,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Link not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  // Admin users have access to all links
  if (userIsAdmin) {
    return { found: true, authorized: true, entity: link };
  }

  // Check account ownership
  const propertyAccountId = (link as any).items?.properties?.account_id;
  if (accountId && propertyAccountId !== accountId) {
    return {
      found: true,
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to link', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { found: true, authorized: true, entity: link };
}
```

4. Create unified ownership validation dispatcher:

```typescript
/**
 * Validate entity ownership based on entity type
 */
async function validateEntityOwnership(
  entityType: TranslatableEntityType,
  entityId: string,
  accountId: string | null,
  userIsAdmin: boolean
): Promise<{
  found: boolean;
  authorized: boolean;
  entity?: any;
  error?: NextResponse;
}> {
  switch (entityType) {
    case 'article':
      return validateArticleOwnership(entityId, accountId, userIsAdmin);
    case 'item':
      return validateItemOwnership(entityId, accountId, userIsAdmin);
    case 'link':
      return validateLinkOwnership(entityId, accountId, userIsAdmin);
    default:
      return {
        found: false,
        authorized: false,
        error: NextResponse.json(
          { success: false, error: 'Invalid entity type', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      };
  }
}
```

#### Acceptance Criteria

- [ ] Article ownership validated via items -> properties -> account_id
- [ ] Item ownership validated via properties -> account_id
- [ ] Link ownership validated via items -> properties -> account_id
- [ ] Returns 404 for non-existent entities
- [ ] Returns 403 for unauthorized access
- [ ] Admin users bypass ownership checks
- [ ] Entity data returned for use in response

---

### Task 7: Implement Translation Upsert Logic

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 35 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Create the translation upsert function:

```typescript
/**
 * Insert or update translation record
 * - Checks if translation exists for entity+language
 * - Updates if exists, inserts if new
 * - Sets translation_status to 'manual'
 * - Records reviewed_by (for articles only)
 */
async function upsertTranslation(
  entityType: TranslatableEntityType,
  entityId: string,
  language: SupportedLanguage,
  content: ValidatedTranslationContent,
  userId: string
): Promise<{
  translation?: any;
  error?: NextResponse;
}> {
  // Determine table name and foreign key column
  const tableName = `${entityType}_translations`;
  const foreignKeyColumn = `${entityType}_id`;
  const now = new Date().toISOString();

  try {
    // Check if translation already exists
    const { data: existing, error: selectError } = await supabaseAdmin
      .from(tableName)
      .select('id')
      .eq(foreignKeyColumn, entityId)
      .eq('language', language)
      .maybeSingle();

    if (selectError) {
      console.error('[UpdateTranslation] Error checking existing translation:', selectError);
      throw new Error(`Failed to check existing translation: ${selectError.message}`);
    }

    // Build the translation data
    const translationData: Record<string, any> = {
      ...content,
      translation_status: 'manual',
      translated_at: now,
      updated_at: now,
    };

    // Only articles have reviewed_by column
    if (entityType === 'article') {
      translationData.reviewed_by = userId;
    }

    let result;

    if (existing) {
      // Update existing translation
      console.log(`[UpdateTranslation] Updating existing ${entityType} translation:`, existing.id);

      const { data, error: updateError } = await supabaseAdmin
        .from(tableName)
        .update(translationData)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('[UpdateTranslation] Update error:', updateError);
        throw new Error(`Failed to update translation: ${updateError.message}`);
      }

      result = data;
    } else {
      // Insert new translation
      console.log(`[UpdateTranslation] Creating new ${entityType} translation for entity:`, entityId);

      const insertData = {
        [foreignKeyColumn]: entityId,
        language,
        ...translationData,
        created_at: now,
      };

      const { data, error: insertError } = await supabaseAdmin
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('[UpdateTranslation] Insert error:', insertError);
        throw new Error(`Failed to create translation: ${insertError.message}`);
      }

      result = data;
    }

    return { translation: result };

  } catch (error) {
    console.error('[UpdateTranslation] Upsert error:', error);
    return {
      error: NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update translation',
          code: 'SERVER_ERROR'
        },
        { status: 500 }
      )
    };
  }
}
```

#### Acceptance Criteria

- [ ] Checks for existing translation by entity ID + language
- [ ] Updates existing translation if found
- [ ] Creates new translation if not found
- [ ] Sets `translation_status` to 'manual'
- [ ] Sets `translated_at` to current timestamp
- [ ] Sets `updated_at` to current timestamp
- [ ] Sets `reviewed_by` to user ID (articles only)
- [ ] Handles database errors gracefully
- [ ] Returns complete translation record

---

### Task 8: Implement Response Formatting

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 15 minutes
**Priority:** P1 - High

#### Implementation Steps

Create the response formatting function:

```typescript
/**
 * Format translation record for API response
 */
function formatTranslationResponse(
  entityType: TranslatableEntityType,
  entityId: string,
  translation: any,
  accountContext: { accountId: string | null; accountRole: string }
): UpdateTranslationResponse {
  // Build content object based on entity type
  const content: Record<string, string> = {};

  if (translation.title !== undefined && translation.title !== null) {
    content.title = translation.title;
  }
  if (translation.name !== undefined && translation.name !== null) {
    content.name = translation.name;
  }
  if (translation.description !== undefined && translation.description !== null) {
    content.description = translation.description;
  }

  return {
    success: true,
    data: {
      translation: {
        id: translation.id,
        entityType,
        entityId,
        language: translation.language,
        content,
        status: translation.translation_status,
        reviewedBy: translation.reviewed_by || null,
        translatedAt: translation.translated_at,
        updatedAt: translation.updated_at,
      },
    },
    accountContext,
  };
}
```

#### Acceptance Criteria

- [ ] Response includes translation ID
- [ ] Response includes entityType and entityId
- [ ] Response includes language code
- [ ] Content object contains only non-null fields
- [ ] Status is 'manual'
- [ ] reviewedBy is user ID (for articles) or null
- [ ] Timestamps are ISO format strings
- [ ] accountContext included in response

---

### Task 9: Implement PUT Handler

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 30 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

```typescript
/**
 * PUT /api/translations/[entityType]/[entityId]/[language]
 * Update or create a translation for a specific entity and language
 *
 * Route Parameters:
 * - entityType: 'article' | 'item' | 'link'
 * - entityId: UUID of the entity
 * - language: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
 *
 * Request Body:
 * - For articles: { title?: string, description?: string }
 * - For items: { name?: string, description?: string }
 * - For links: { title: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('[UpdateTranslation] PUT request received');

    // Step 1: Authenticate user
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    console.log('[UpdateTranslation] User authenticated:', user.email, 'isAdmin:', userIsAdmin);

    // Step 2: Extract account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    console.log('[UpdateTranslation] Account context:', { accountId, accountRole });

    // Step 3: Extract and validate route parameters
    const resolvedParams = await params;
    const paramValidation = validateRouteParams(resolvedParams);
    if (!paramValidation.valid || paramValidation.error) {
      return paramValidation.error!;
    }

    const { entityType, entityId, language } = paramValidation;
    console.log('[UpdateTranslation] Route params validated:', { entityType, entityId, language });

    // Step 4: Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const bodyValidation = validateTranslationBody(body, entityType!);
    if (!bodyValidation.valid || bodyValidation.error) {
      return bodyValidation.error!;
    }

    const content = bodyValidation.data!;
    console.log('[UpdateTranslation] Body validated for', entityType);

    // Step 5: Validate entity ownership
    const ownershipResult = await validateEntityOwnership(
      entityType!,
      entityId!,
      accountId,
      userIsAdmin
    );

    if (ownershipResult.error) {
      return ownershipResult.error;
    }

    console.log('[UpdateTranslation] Ownership validated for', entityType, entityId);

    // Step 6: Upsert translation
    const upsertResult = await upsertTranslation(
      entityType!,
      entityId!,
      language!,
      content,
      user.id
    );

    if (upsertResult.error) {
      return upsertResult.error;
    }

    console.log('[UpdateTranslation] Translation upserted successfully:', upsertResult.translation?.id);

    // Step 7: Format and return response
    const response = formatTranslationResponse(
      entityType!,
      entityId!,
      upsertResult.translation,
      { accountId, accountRole }
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('[UpdateTranslation] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria

- [ ] Returns 200 with updated translation on success
- [ ] Returns 400 for invalid route parameters
- [ ] Returns 400 for invalid/missing request body
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for unauthorized entity access
- [ ] Returns 404 for non-existent entities
- [ ] Returns 500 for unexpected errors
- [ ] Includes accountContext in successful response
- [ ] Logs all major operations for debugging
- [ ] Handles JSON parsing errors gracefully

---

### Task 10: Add Logging Constants and Helpers

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
**Estimated Effort:** 10 minutes
**Priority:** P2 - Medium

#### Implementation Steps

Add logging helpers at the top of the file:

```typescript
// Logging prefix for consistent log messages
const LOG_PREFIX = '[UpdateTranslation]';

/**
 * Log info message with consistent prefix
 */
function logInfo(message: string, data?: Record<string, unknown>): void {
  console.log(`${LOG_PREFIX} ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * Log error message with consistent prefix
 */
function logError(message: string, error?: unknown): void {
  console.error(`${LOG_PREFIX} ${message}`, error);
}
```

Update the PUT handler to use these helpers:

```typescript
// Replace console.log/error calls with:
logInfo('PUT request received');
logInfo('User authenticated:', { email: user.email, isAdmin: userIsAdmin });
logInfo('Route params validated:', { entityType, entityId, language });
logError('Unexpected error:', error);
```

#### Acceptance Criteria

- [ ] All log messages have consistent `[UpdateTranslation]` prefix
- [ ] Info logs include relevant context data
- [ ] Error logs include error details
- [ ] Sensitive data not logged (no full content, only IDs)

---

### Task 11: Write Unit Tests

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts`
**Estimated Effort:** 45 minutes
**Priority:** P1 - High

#### Implementation Steps

Create comprehensive test file:

```typescript
// /src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from '../route';

// Mock dependencies
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Helper to create mock request
function createMockRequest(
  entityType: string,
  entityId: string,
  language: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest(
    `http://localhost/api/translations/${entityType}/${entityId}/${language}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Mock params helper
function createMockParams(entityType: string, entityId: string, language: string) {
  return Promise.resolve({ entityType, entityId, language });
}

describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when no valid session', async () => {
      const { validateAdminAuth } = await import('@/lib/auth-server');
      (validateAdminAuth as any).mockResolvedValue({
        error: new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
      });

      const request = createMockRequest('article', '00000000-0000-0000-0000-000000000001', 'fr', { title: 'Test' });
      const response = await PUT(request, { params: createMockParams('article', '00000000-0000-0000-0000-000000000001', 'fr') });

      expect(response.status).toBe(401);
    });
  });

  describe('Route Parameter Validation', () => {
    it('returns 400 for invalid entityType', async () => {
      // Setup auth mock to succeed
      const { validateAdminAuth } = await import('@/lib/auth-server');
      (validateAdminAuth as any).mockResolvedValue({
        user: { id: 'user-id', email: 'test@test.com' },
        isAdmin: false,
        supabase: mockSupabase,
      });

      const request = createMockRequest('invalid', '00000000-0000-0000-0000-000000000001', 'fr', { title: 'Test' });
      const response = await PUT(request, { params: createMockParams('invalid', '00000000-0000-0000-0000-000000000001', 'fr') });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.error).toContain('Invalid entity type');
    });

    it('returns 400 for invalid entityId (non-UUID)', async () => {
      // ... test implementation
    });

    it('returns 400 for unsupported language code', async () => {
      // ... test implementation
    });
  });

  describe('Request Body Validation', () => {
    it('returns 400 when body is missing for article', async () => {
      // ... test implementation
    });

    it('returns 400 when neither title nor description provided for article', async () => {
      // ... test implementation
    });

    it('returns 400 when title is not a string for link', async () => {
      // ... test implementation
    });
  });

  describe('Entity Ownership', () => {
    it('returns 404 when entity does not exist', async () => {
      // ... test implementation
    });

    it('returns 403 when user does not own the entity', async () => {
      // ... test implementation
    });

    it('allows admin users to update any entity', async () => {
      // ... test implementation
    });
  });

  describe('Translation Upsert', () => {
    it('creates new translation when none exists', async () => {
      // ... test implementation
    });

    it('updates existing translation when one exists', async () => {
      // ... test implementation
    });

    it('sets translation_status to manual', async () => {
      // ... test implementation
    });

    it('records reviewed_by for articles', async () => {
      // ... test implementation
    });
  });

  describe('Response Format', () => {
    it('includes complete translation record on success', async () => {
      // ... test implementation
    });

    it('includes accountContext in response', async () => {
      // ... test implementation
    });
  });
});
```

#### Acceptance Criteria

- [ ] Test file created at correct path
- [ ] Authentication tests: 401 for no session, 401 for invalid token
- [ ] Route parameter tests: entityType, entityId (UUID), language validation
- [ ] Request body tests: missing body, invalid types, missing required fields
- [ ] Ownership tests: 404 for missing entity, 403 for unauthorized access
- [ ] Upsert tests: creates new, updates existing, sets manual status
- [ ] Response tests: correct format, accountContext included
- [ ] All tests pass

---

## Integration Testing

### Manual Test Cases

After implementation, verify with manual testing:

1. **Test Successful Article Update**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/article/<article-uuid>/fr' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"title": "Comment utiliser", "description": "Instructions..."}'
   ```
   Expected: 200 with updated translation, status='manual', reviewedBy=user.id

2. **Test New Item Translation Creation**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/item/<item-uuid>/es' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"name": "Lavadora", "description": "Instrucciones de uso"}'
   ```
   Expected: 200 with new translation record

3. **Test Link Translation Update**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/link/<link-uuid>/de' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"title": "Video anleitung"}'
   ```
   Expected: 200 with updated translation

4. **Test Invalid Entity Type**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/invalid/<uuid>/fr' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"title": "Test"}'
   ```
   Expected: 400 with VALIDATION_ERROR

5. **Test Unauthorized Access**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/article/<other-users-article>/fr' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"title": "Test"}'
   ```
   Expected: 403 with FORBIDDEN

6. **Test Non-Existent Entity**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/article/00000000-0000-0000-0000-000000000000/fr' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{"title": "Test"}'
   ```
   Expected: 404 with NOT_FOUND

7. **Test Missing Required Fields**
   ```bash
   curl -X PUT 'http://localhost:3000/api/translations/link/<link-uuid>/fr' \
     -H 'Cookie: <auth-cookie>' \
     -H 'Content-Type: application/json' \
     -d '{}'
   ```
   Expected: 400 with 'title is required for link translation'

---

## Files Summary

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main PUT endpoint implementation |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts` | Unit tests |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Reference `getAccountContext` pattern, ownership validation |
| `/src/app/api/admin/items/[publicId]/route.ts` | Reference item ownership validation pattern |

### Database Tables Accessed

| Table | Operations |
|-------|------------|
| `article_translations` | SELECT (check existing), INSERT, UPDATE |
| `item_translations` | SELECT (check existing), INSERT, UPDATE |
| `link_translations` | SELECT (check existing), INSERT, UPDATE |
| `item_articles` | SELECT (for ownership validation) |
| `items` | SELECT (for ownership validation) |
| `item_links` | SELECT (for ownership validation) |
| `properties` | JOIN (for account_id check) |
| `account_users` | Used by `getAccountContext` for access validation |

---

## Acceptance Criteria Checklist

### From Requirements (REQ-337)

- [ ] Endpoint accepts PUT requests with entity type, entity ID, language code, and translation content
- [ ] Endpoint validates the authenticated user owns the specified entity before processing
- [ ] Endpoint rejects unauthorized requests with appropriate authorization error (403)
- [ ] Endpoint validates all required fields are present and properly formatted
- [ ] Endpoint returns validation error (400) when required fields are missing or malformed
- [ ] Endpoint updates the translation content in the database when validation passes
- [ ] Endpoint sets translation status to indicate manual curation ('manual')
- [ ] Endpoint records the authenticated user's identifier as the reviewer (articles only)
- [ ] Endpoint returns the complete updated translation record upon success
- [ ] Endpoint handles requests for non-existent entities with 404 error response
- [ ] Endpoint handles requests for non-existent translations by creating new translation records
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

### Technical Criteria

- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Unit tests written and passing
- [ ] Logging implemented with consistent prefix
- [ ] Error handling covers all edge cases

---

## Error Handling Summary

| Scenario | Status Code | Error Code | Message |
|----------|-------------|------------|---------|
| Not authenticated | 401 | UNAUTHORIZED | Invalid or expired token |
| User not found | 403 | FORBIDDEN | User not found in system |
| No account access | 403 | FORBIDDEN | No account access found for user |
| Invalid entity type | 400 | VALIDATION_ERROR | Invalid entity type. Must be: article, item, link |
| Invalid entity ID | 400 | VALIDATION_ERROR | Invalid entity ID format. Must be a valid UUID |
| Invalid language | 400 | VALIDATION_ERROR | Unsupported language code |
| Entity not found | 404 | NOT_FOUND | {entityType} not found |
| Access denied | 403 | FORBIDDEN | Access denied to {entityType} |
| Missing required fields | 400 | VALIDATION_ERROR | {field} is required for {entityType} translation |
| Invalid field type | 400 | VALIDATION_ERROR | {field} must be a string |
| Invalid JSON body | 400 | VALIDATION_ERROR | Invalid JSON in request body |
| Database error | 500 | SERVER_ERROR | Failed to update translation |
| Unexpected error | 500 | SERVER_ERROR | Internal server error |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Overview Document: `/docs/REQ-337-create-update-translation-api-endpoint-overview.md`
- Request Document: `/docs/gen_requests_epic5.md` - REQ-337
- Epic 1 Foundation: Translation table schemas
- Existing API Pattern: `/src/app/api/admin/articles/[articleId]/route.ts`
- Translation Status API: `/docs/REQ-336-create-translation-status-api-endpoint-detailed.md`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task ID: 1.2 - Create Update Translation API Endpoint*
