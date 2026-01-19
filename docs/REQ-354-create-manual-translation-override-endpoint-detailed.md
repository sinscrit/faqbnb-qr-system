# Detailed Task Breakdown: REQ-354 - Create Manual Translation Override Endpoint

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-354 (Maps to REQ-330 in gen_requests_epic3.md)
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.3
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Overview Document:** REQ-354-create-manual-translation-override-endpoint-overview.md

---

## Summary

Create a RESTful API endpoint that allows authorized users (property owners and administrators) to manually submit or override translations for content entities, bypassing the automatic translation system when human-quality translations are preferred.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Translation tables exist: `item_translations`, `article_translations`, `link_translations`, `tag_translations`
- [ ] Translation service types are available in `/src/lib/translation-service/translation-service.types.ts`
- [ ] Authentication infrastructure exists: `validateAdminAuth()` in `/src/lib/auth-server.ts`
- [ ] Supabase server client available: `createSupabaseServer()` in `/src/lib/supabase-server.ts`

---

## Task Breakdown

### Task 1: Create Route Directory Structure

**Objective:** Create the Next.js App Router file structure for the manual translation override endpoint.

**File to Create:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

1.1. Create the nested directory structure:
```
src/app/api/translations/
└── [entityType]/
    └── [entityId]/
        └── [language]/
            └── route.ts
```

1.2. Create the initial route.ts file with boilerplate:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
) {
  // Implementation will be added in subsequent tasks
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
```

**Acceptance Criteria:**
- [ ] Directory structure exists at `/src/app/api/translations/[entityType]/[entityId]/[language]/`
- [ ] `route.ts` file exports a PUT handler function
- [ ] Route is accessible via `PUT /api/translations/{entityType}/{entityId}/{language}`

**Estimated Effort:** 0.5 story points

---

### Task 2: Implement Route Parameter Extraction and Validation

**Objective:** Extract and validate the three dynamic route parameters: entityType, entityId, and language.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

2.1. Import required types from translation service:
```typescript
import {
  isSupportedLanguage,
  SupportedLanguage,
  TranslatableEntityType
} from '@/lib/translation-service/translation-service.types';
```

2.2. Define valid entity types constant and type guard:
```typescript
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
type ValidEntityType = typeof VALID_ENTITY_TYPES[number];

function isValidEntityType(type: string): type is ValidEntityType {
  return VALID_ENTITY_TYPES.includes(type as ValidEntityType);
}
```

2.3. Define UUID validation regex:
```typescript
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
```

2.4. Implement parameter extraction and validation in PUT handler:
```typescript
const { entityType, entityId, language } = await params;

// Validate entityType
if (!isValidEntityType(entityType)) {
  return NextResponse.json(
    {
      success: false,
      error: `Invalid entity type: ${entityType}. Must be one of: item, article, link, tag`,
      code: 'INVALID_ENTITY_TYPE'
    },
    { status: 400 }
  );
}

// Validate entityId format (UUID for item, article, link; string for tag)
if (entityType !== 'tag' && !isValidUUID(entityId)) {
  return NextResponse.json(
    {
      success: false,
      error: 'Invalid entityId format. Must be a valid UUID.',
      code: 'VALIDATION_ERROR'
    },
    { status: 400 }
  );
}

// Validate language
if (!isSupportedLanguage(language)) {
  return NextResponse.json(
    {
      success: false,
      error: `Invalid language code: ${language}. Supported: en, fr, es, de, nl, it`,
      code: 'INVALID_LANGUAGE'
    },
    { status: 400 }
  );
}
```

**Acceptance Criteria:**
- [ ] Invalid entityType returns 400 with code `INVALID_ENTITY_TYPE`
- [ ] Invalid language returns 400 with code `INVALID_LANGUAGE`
- [ ] Invalid entityId format (non-UUID for item/article/link) returns 400 with code `VALIDATION_ERROR`
- [ ] Tag entityId accepts string format (tag_key)
- [ ] Valid parameters proceed to next step

**Estimated Effort:** 1 story point

---

### Task 3: Implement Authentication

**Objective:** Validate that the request comes from an authenticated user.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

3.1. Import authentication utilities:
```typescript
import { validateAdminAuth } from '@/lib/auth-server';
```

3.2. Add authentication check at the beginning of the PUT handler (after parameter validation):
```typescript
// Authenticate user
const authResult = await validateAdminAuth(request);
if (authResult.error) {
  return authResult.error;
}

const { user, isAdmin, supabase } = authResult;
console.log(`Manual translation override request from: ${user.email}`);
```

**Acceptance Criteria:**
- [ ] Unauthenticated requests return 401 with code `UNAUTHORIZED`
- [ ] Requests with invalid/expired tokens return 401
- [ ] Authenticated user object is available for subsequent checks
- [ ] Supabase client is available for database operations

**Estimated Effort:** 0.5 story points

---

### Task 4: Implement Entity Existence and Authorization Check

**Objective:** Verify the target entity exists and the user has edit access to it.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

4.1. Create helper function to get entity and check access:
```typescript
interface EntityAccessResult {
  canAccess: boolean;
  entity?: any;
  error?: NextResponse;
}

async function validateEntityAccess(
  entityType: ValidEntityType,
  entityId: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<EntityAccessResult> {
  switch (entityType) {
    case 'item':
      return validateItemAccess(entityId, userId, isAdmin, supabase);
    case 'article':
      return validateArticleAccess(entityId, userId, isAdmin, supabase);
    case 'link':
      return validateLinkAccess(entityId, userId, isAdmin, supabase);
    case 'tag':
      return validateTagAccess(entityId, userId, isAdmin, supabase);
    default:
      return {
        canAccess: false,
        error: NextResponse.json(
          { success: false, error: 'Invalid entity type', code: 'INVALID_ENTITY_TYPE' },
          { status: 400 }
        )
      };
  }
}
```

4.2. Implement item access validation:
```typescript
async function validateItemAccess(
  itemId: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<EntityAccessResult> {
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      property_id,
      properties!left(id, user_id, account_id)
    `)
    .eq('id', itemId)
    .single();

  if (error || !item) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Item not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  // Admin can access any item
  if (isAdmin) {
    return { canAccess: true, entity: item };
  }

  // Regular user must own the property
  const property = (item as any).properties;
  if (property?.user_id !== userId) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to this item', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { canAccess: true, entity: item };
}
```

4.3. Implement article access validation:
```typescript
async function validateArticleAccess(
  articleId: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<EntityAccessResult> {
  const { data: article, error } = await supabase
    .from('item_articles')
    .select(`
      id,
      title,
      item_id,
      items!left(
        id,
        property_id,
        properties!left(id, user_id)
      )
    `)
    .eq('id', articleId)
    .single();

  if (error || !article) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Article not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  if (isAdmin) {
    return { canAccess: true, entity: article };
  }

  const property = (article as any).items?.properties;
  if (property?.user_id !== userId) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to this article', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { canAccess: true, entity: article };
}
```

4.4. Implement link access validation:
```typescript
async function validateLinkAccess(
  linkId: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<EntityAccessResult> {
  const { data: link, error } = await supabase
    .from('item_links')
    .select(`
      id,
      title,
      item_id,
      items!left(
        id,
        property_id,
        properties!left(id, user_id)
      )
    `)
    .eq('id', linkId)
    .single();

  if (error || !link) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Link not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    };
  }

  if (isAdmin) {
    return { canAccess: true, entity: link };
  }

  const property = (link as any).items?.properties;
  if (property?.user_id !== userId) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Access denied to this link', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { canAccess: true, entity: link };
}
```

4.5. Implement tag access validation:
```typescript
async function validateTagAccess(
  tagKey: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<EntityAccessResult> {
  // Tags are global - admin or any authenticated user can provide translations
  // For system tags (starting with #), only admin can override
  if (tagKey.startsWith('#') && !isAdmin) {
    return {
      canAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Only administrators can override system tag translations', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  // Tag exists implicitly if used in items - return success
  return { canAccess: true, entity: { tag_key: tagKey } };
}
```

4.6. Call validation in PUT handler:
```typescript
const accessResult = await validateEntityAccess(
  entityType as ValidEntityType,
  entityId,
  user.id,
  isAdmin,
  supabase
);

if (!accessResult.canAccess || accessResult.error) {
  return accessResult.error!;
}

const entity = accessResult.entity;
```

**Acceptance Criteria:**
- [ ] Non-existent items return 404 with code `NOT_FOUND`
- [ ] Non-existent articles return 404 with code `NOT_FOUND`
- [ ] Non-existent links return 404 with code `NOT_FOUND`
- [ ] Users without edit access to item receive 403 with code `FORBIDDEN`
- [ ] Users without edit access to article receive 403 with code `FORBIDDEN`
- [ ] Users without edit access to link receive 403 with code `FORBIDDEN`
- [ ] Non-admin users cannot override system tags (starting with #)
- [ ] Admins can override any entity's translation
- [ ] Property owners can override translations for their own content

**Estimated Effort:** 2 story points

---

### Task 5: Implement Request Body Validation

**Objective:** Parse and validate the request body based on entity type.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

5.1. Define request body interfaces:
```typescript
interface ItemTranslationBody {
  name: string;
  description?: string;
}

interface ArticleTranslationBody {
  title: string;
  description?: string;
}

interface LinkTranslationBody {
  title: string;
}

interface TagTranslationBody {
  value: string;
}

type TranslationRequestBody =
  | ItemTranslationBody
  | ArticleTranslationBody
  | LinkTranslationBody
  | TagTranslationBody;
```

5.2. Create validation function:
```typescript
interface ValidationResult {
  valid: boolean;
  data?: TranslationRequestBody;
  error?: NextResponse;
}

function validateRequestBody(
  entityType: ValidEntityType,
  body: any
): ValidationResult {
  // Check for valid JSON object
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Request body must be a valid JSON object', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  switch (entityType) {
    case 'item':
      return validateItemBody(body);
    case 'article':
      return validateArticleBody(body);
    case 'link':
      return validateLinkBody(body);
    case 'tag':
      return validateTagBody(body);
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

5.3. Implement entity-specific validators:
```typescript
function validateItemBody(body: any): ValidationResult {
  const { name, description } = body;

  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Missing required field: name', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Field "name" cannot be empty', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  return {
    valid: true,
    data: {
      name: trimmedName,
      description: description ? String(description).trim() : undefined
    } as ItemTranslationBody
  };
}

function validateArticleBody(body: any): ValidationResult {
  const { title, description } = body;

  if (!title || typeof title !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Missing required field: title', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Field "title" cannot be empty', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  return {
    valid: true,
    data: {
      title: trimmedTitle,
      description: description ? String(description).trim() : undefined
    } as ArticleTranslationBody
  };
}

function validateLinkBody(body: any): ValidationResult {
  const { title } = body;

  if (!title || typeof title !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Missing required field: title', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Field "title" cannot be empty', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  return {
    valid: true,
    data: { title: trimmedTitle } as LinkTranslationBody
  };
}

function validateTagBody(body: any): ValidationResult {
  const { value } = body;

  if (!value || typeof value !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Missing required field: value', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { success: false, error: 'Field "value" cannot be empty', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    };
  }

  return {
    valid: true,
    data: { value: trimmedValue } as TagTranslationBody
  };
}
```

5.4. Parse and validate body in PUT handler:
```typescript
let body: any;
try {
  body = await request.json();
} catch (e) {
  return NextResponse.json(
    { success: false, error: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' },
    { status: 400 }
  );
}

const validationResult = validateRequestBody(entityType as ValidEntityType, body);
if (!validationResult.valid || validationResult.error) {
  return validationResult.error!;
}

const validatedData = validationResult.data!;
```

**Acceptance Criteria:**
- [ ] Invalid JSON returns 400 with code `VALIDATION_ERROR`
- [ ] For items: missing `name` returns 400 with field-specific error
- [ ] For articles: missing `title` returns 400 with field-specific error
- [ ] For links: missing `title` returns 400 with field-specific error
- [ ] For tags: missing `value` returns 400 with field-specific error
- [ ] Empty string values for required fields return 400
- [ ] Fields are trimmed of leading/trailing whitespace
- [ ] Optional fields (description) accept undefined/null

**Estimated Effort:** 1 story point

---

### Task 6: Implement Translation UPSERT Logic

**Objective:** Insert or update the translation record in the appropriate table.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

6.1. Create helper function to get table name:
```typescript
function getTranslationTable(entityType: ValidEntityType): string {
  const tableMap: Record<ValidEntityType, string> = {
    item: 'item_translations',
    article: 'article_translations',
    link: 'link_translations',
    tag: 'tag_translations'
  };
  return tableMap[entityType];
}
```

6.2. Create helper function to get foreign key column name:
```typescript
function getEntityForeignKey(entityType: ValidEntityType): string {
  const keyMap: Record<ValidEntityType, string> = {
    item: 'item_id',
    article: 'article_id',
    link: 'link_id',
    tag: 'tag_key'
  };
  return keyMap[entityType];
}
```

6.3. Check if translation already exists (to determine 200 vs 201):
```typescript
async function checkExistingTranslation(
  entityType: ValidEntityType,
  entityId: string,
  language: string,
  supabase: any
): Promise<boolean> {
  const table = getTranslationTable(entityType);
  const foreignKey = getEntityForeignKey(entityType);

  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(foreignKey, entityId)
    .eq('language', language)
    .single();

  return !error && !!data;
}
```

6.4. Implement UPSERT function for each entity type:
```typescript
interface UpsertResult {
  success: boolean;
  data?: any;
  error?: NextResponse;
  isUpdate: boolean;
}

async function upsertTranslation(
  entityType: ValidEntityType,
  entityId: string,
  language: string,
  translationData: TranslationRequestBody,
  userId: string,
  supabase: any
): Promise<UpsertResult> {
  const table = getTranslationTable(entityType);
  const foreignKey = getEntityForeignKey(entityType);
  const now = new Date().toISOString();

  // Check if record exists
  const exists = await checkExistingTranslation(entityType, entityId, language, supabase);

  // Build the record based on entity type
  let record: any = {
    [foreignKey]: entityId,
    language,
    translation_status: 'manual',
    updated_at: now
  };

  // Add translated_at and reviewed_by for non-tag entities
  if (entityType !== 'tag') {
    record.translated_at = now;
    record.reviewed_by = userId;
  }

  // Add entity-specific fields
  switch (entityType) {
    case 'item':
      const itemData = translationData as ItemTranslationBody;
      record.name = itemData.name;
      record.description = itemData.description || null;
      break;
    case 'article':
      const articleData = translationData as ArticleTranslationBody;
      record.title = articleData.title;
      record.description = articleData.description || null;
      break;
    case 'link':
      const linkData = translationData as LinkTranslationBody;
      record.title = linkData.title;
      break;
    case 'tag':
      const tagData = translationData as TagTranslationBody;
      record.translated_value = tagData.value;
      record.is_system_tag = entityId.startsWith('#');
      // Remove updated_at for tags (not in schema)
      delete record.updated_at;
      delete record.translation_status;
      break;
  }

  // Perform UPSERT
  const conflictColumns = entityType === 'tag'
    ? 'tag_key,language'
    : `${foreignKey},language`;

  const { data, error } = await supabase
    .from(table)
    .upsert(record, { onConflict: conflictColumns })
    .select()
    .single();

  if (error) {
    console.error(`Translation UPSERT error for ${entityType}:`, error);
    return {
      success: false,
      isUpdate: exists,
      error: NextResponse.json(
        { success: false, error: 'Failed to save translation', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    };
  }

  return {
    success: true,
    data,
    isUpdate: exists
  };
}
```

6.5. Call UPSERT in PUT handler:
```typescript
const upsertResult = await upsertTranslation(
  entityType as ValidEntityType,
  entityId,
  language,
  validatedData,
  user.id,
  supabase
);

if (!upsertResult.success || upsertResult.error) {
  return upsertResult.error!;
}
```

**Acceptance Criteria:**
- [ ] New translations create new records (for 201 response)
- [ ] Existing translations are updated (for 200 response)
- [ ] `translation_status` is set to `'manual'` for item/article/link
- [ ] `reviewed_by` contains the user's ID for item/article/link
- [ ] `translated_at` is set to current timestamp for item/article/link
- [ ] `updated_at` is set for item/article/link tables
- [ ] Tag translations use `translated_value` field
- [ ] Tag translations set `is_system_tag` based on tag_key prefix
- [ ] Database errors return 500 with code `INTERNAL_ERROR`

**Estimated Effort:** 2 story points

---

### Task 7: Implement Response Formatting

**Objective:** Build and return the appropriate success response.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

7.1. Create response builder function:
```typescript
interface TranslationResponse {
  success: true;
  data: {
    entityId: string;
    entityType: string;
    language: string;
    translationStatus: string;
    reviewedBy?: string;
    updatedAt: string;
    // Entity-specific fields
    name?: string;
    title?: string;
    description?: string;
    value?: string;
  };
}

function buildSuccessResponse(
  entityType: ValidEntityType,
  entityId: string,
  language: string,
  dbRecord: any,
  userId: string
): TranslationResponse {
  const baseResponse: TranslationResponse = {
    success: true,
    data: {
      entityId,
      entityType,
      language,
      translationStatus: entityType === 'tag' ? 'manual' : dbRecord.translation_status,
      updatedAt: dbRecord.updated_at || dbRecord.created_at || new Date().toISOString()
    }
  };

  // Add reviewed_by for non-tag entities
  if (entityType !== 'tag') {
    baseResponse.data.reviewedBy = userId;
  }

  // Add entity-specific fields
  switch (entityType) {
    case 'item':
      baseResponse.data.name = dbRecord.name;
      if (dbRecord.description) {
        baseResponse.data.description = dbRecord.description;
      }
      break;
    case 'article':
      baseResponse.data.title = dbRecord.title;
      if (dbRecord.description) {
        baseResponse.data.description = dbRecord.description;
      }
      break;
    case 'link':
      baseResponse.data.title = dbRecord.title;
      break;
    case 'tag':
      baseResponse.data.value = dbRecord.translated_value;
      break;
  }

  return baseResponse;
}
```

7.2. Return response in PUT handler:
```typescript
const response = buildSuccessResponse(
  entityType as ValidEntityType,
  entityId,
  language,
  upsertResult.data,
  user.id
);

// Return 201 for new translation, 200 for update
const statusCode = upsertResult.isUpdate ? 200 : 201;

return NextResponse.json(response, { status: statusCode });
```

**Acceptance Criteria:**
- [ ] Insert operations return 201 Created
- [ ] Update operations return 200 OK
- [ ] Response includes `entityId`, `entityType`, `language`
- [ ] Response includes `translationStatus` as `'manual'`
- [ ] Response includes `reviewedBy` (user ID) for non-tag entities
- [ ] Response includes `updatedAt` in ISO 8601 format
- [ ] Response includes entity-specific translated fields

**Estimated Effort:** 0.5 story points

---

### Task 8: Implement Audit Logging

**Objective:** Log manual translation operations for debugging and audit trail.

**File to Modify:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Steps:**

8.1. Add success logging before return:
```typescript
// Log successful operation
console.log(
  `Manual translation override: user=${user.email}, ` +
  `entityType=${entityType}, entityId=${entityId}, language=${language}, ` +
  `operation=${upsertResult.isUpdate ? 'update' : 'create'}`
);
```

8.2. Add error logging in catch blocks:
```typescript
// In the main try-catch wrapper
} catch (error) {
  console.error(
    `Manual translation override failed: user=${user?.email || 'unknown'}, ` +
    `entityType=${entityType}, entityId=${entityId}, language=${language}, ` +
    `error=${error instanceof Error ? error.message : 'Unknown error'}`
  );
  return NextResponse.json(
    { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

**Acceptance Criteria:**
- [ ] Successful operations log user email, entity details, language, and operation type
- [ ] Failed operations log error details with user and entity context
- [ ] Logs can be used for debugging and audit purposes

**Estimated Effort:** 0.5 story points

---

### Task 9: Write Unit Tests

**Objective:** Create comprehensive unit tests for the manual translation override endpoint.

**File to Create:** `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts`

**Steps:**

9.1. Set up test file with mocks:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from '../route';

// Mock dependencies
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn()
}));

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn()
}));

// Helper to create mock request
function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost/api/translations/item/123/fr', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper to create mock params
function createMockParams(entityType: string, entityId: string, language: string) {
  return Promise.resolve({ entityType, entityId, language });
}
```

9.2. Write parameter validation tests:
```typescript
describe('Parameter Validation', () => {
  it('should return 400 for invalid entityType', async () => {
    // Test implementation
  });

  it('should return 400 for invalid language code', async () => {
    // Test implementation
  });

  it('should return 400 for invalid entityId format', async () => {
    // Test implementation
  });

  it('should accept valid tag_key for tag entityType', async () => {
    // Test implementation
  });
});
```

9.3. Write authentication tests:
```typescript
describe('Authentication', () => {
  it('should return 401 for unauthenticated requests', async () => {
    // Test implementation
  });

  it('should return 401 for expired tokens', async () => {
    // Test implementation
  });
});
```

9.4. Write authorization tests:
```typescript
describe('Authorization', () => {
  it('should return 403 when user has no access to item', async () => {
    // Test implementation
  });

  it('should return 403 when non-admin tries to override system tag', async () => {
    // Test implementation
  });

  it('should allow admin to override any translation', async () => {
    // Test implementation
  });

  it('should allow property owner to override their content', async () => {
    // Test implementation
  });
});
```

9.5. Write request body validation tests:
```typescript
describe('Request Body Validation', () => {
  describe('Item translations', () => {
    it('should return 400 for missing name field', async () => {
      // Test implementation
    });

    it('should return 400 for empty name field', async () => {
      // Test implementation
    });

    it('should accept valid item translation body', async () => {
      // Test implementation
    });
  });

  describe('Article translations', () => {
    it('should return 400 for missing title field', async () => {
      // Test implementation
    });
  });

  describe('Link translations', () => {
    it('should return 400 for missing title field', async () => {
      // Test implementation
    });
  });

  describe('Tag translations', () => {
    it('should return 400 for missing value field', async () => {
      // Test implementation
    });
  });
});
```

9.6. Write UPSERT operation tests:
```typescript
describe('UPSERT Operations', () => {
  it('should return 201 for new translation', async () => {
    // Test implementation
  });

  it('should return 200 for updated translation', async () => {
    // Test implementation
  });

  it('should set translation_status to manual', async () => {
    // Test implementation
  });

  it('should set reviewed_by to current user', async () => {
    // Test implementation
  });

  it('should return 500 for database errors', async () => {
    // Test implementation
  });
});
```

9.7. Write response format tests:
```typescript
describe('Response Format', () => {
  it('should return correct structure for item translation', async () => {
    // Test implementation
  });

  it('should return correct structure for article translation', async () => {
    // Test implementation
  });

  it('should return correct structure for link translation', async () => {
    // Test implementation
  });

  it('should return correct structure for tag translation', async () => {
    // Test implementation
  });
});
```

**Acceptance Criteria:**
- [ ] All parameter validation scenarios have test coverage
- [ ] Authentication failure scenarios have test coverage
- [ ] Authorization scenarios have test coverage for all entity types
- [ ] Request body validation tests cover all entity types
- [ ] UPSERT logic tests verify insert vs update behavior
- [ ] Response format tests verify correct structure
- [ ] Tests pass with mocked Supabase client
- [ ] Test coverage is at least 80%

**Estimated Effort:** 2 story points

---

## Files Summary

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler for manual translation override |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts` | Unit tests for the endpoint |

### Existing Files to Reference (Read-Only)

| File Path | Usage |
|-----------|-------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function for authentication |
| `/src/lib/supabase-server.ts` | `createSupabaseServer()` for database client |
| `/src/lib/translation-service/translation-service.types.ts` | `isSupportedLanguage()`, `SupportedLanguage`, `TranslatableEntityType` types |
| `/src/app/api/admin/items/[publicId]/route.ts` | Reference for auth pattern and item access validation |

---

## Database Tables Involved

### Translation Tables (Read/Write)

| Table | Operations | Key Columns |
|-------|------------|-------------|
| `item_translations` | UPSERT | `item_id`, `language`, `name`, `description`, `translation_status`, `reviewed_by`, `translated_at`, `updated_at` |
| `article_translations` | UPSERT | `article_id`, `language`, `title`, `description`, `translation_status`, `reviewed_by`, `translated_at`, `updated_at` |
| `link_translations` | UPSERT | `link_id`, `language`, `title`, `translation_status`, `translated_at`, `updated_at` |
| `tag_translations` | UPSERT | `tag_key`, `language`, `translated_value`, `is_system_tag` |

### Entity Tables (Read Only - for access validation)

| Table | Purpose |
|-------|---------|
| `items` | Validate item exists, get property_id for access check |
| `item_articles` | Validate article exists, get item_id for access check |
| `item_links` | Validate link exists, get item_id for access check |
| `properties` | Validate user owns property (via user_id) |

---

## Security Considerations

1. **Input Validation:** All route parameters and request body fields are validated before use
2. **SQL Injection Prevention:** Using Supabase parameterized queries (automatic)
3. **Authorization:** Verify user has edit access before allowing override
4. **Audit Trail:** Log all manual translation operations with user identity
5. **System Tag Protection:** Only admins can modify system tags (prefixed with #)

---

## Manual Testing Checklist

After implementation, verify:

- [ ] Create manual translation for an item (expect 201)
- [ ] Update existing manual translation for an item (expect 200)
- [ ] Create manual translation for an article (expect 201)
- [ ] Create manual translation for a link (expect 201)
- [ ] Create manual translation for a user tag (expect 201)
- [ ] Verify unauthorized access is blocked (expect 403)
- [ ] Verify 404 for non-existent entities
- [ ] Verify 400 for invalid parameters
- [ ] Verify 400 for missing required fields
- [ ] Verify admin can override system tag translation
- [ ] Verify non-admin cannot override system tag translation

---

## Total Effort Estimate

| Task | Story Points |
|------|--------------|
| Task 1: Route Directory Structure | 0.5 |
| Task 2: Parameter Validation | 1 |
| Task 3: Authentication | 0.5 |
| Task 4: Authorization | 2 |
| Task 5: Body Validation | 1 |
| Task 6: UPSERT Logic | 2 |
| Task 7: Response Formatting | 0.5 |
| Task 8: Audit Logging | 0.5 |
| Task 9: Unit Tests | 2 |
| **Total** | **10 story points** |

---

## References

- [Overview Document: REQ-354-create-manual-translation-override-endpoint-overview.md](/docs/REQ-354-create-manual-translation-override-endpoint-overview.md)
- [Implementation Plan: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Requirements: REQ-330 in gen_requests_epic3.md](/docs/gen_requests_epic3.md)
- [Translation Service Types](/src/lib/translation-service/translation-service.types.ts)
- [Auth Server Helper](/src/lib/auth-server.ts)
