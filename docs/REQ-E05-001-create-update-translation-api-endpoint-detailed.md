# REQ-E05-001: Manual Translation Update API Endpoint - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-E05-002 (gen_requests_epic5.md)
**Overview Document:** REQ-E05-001-create-update-translation-api-endpoint-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.2

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating a PUT API endpoint that allows property owners to manually update and override machine-generated translations. The endpoint will accept `entityType`, `entityId`, and `language` as path parameters, validate ownership, update translation content, and mark the translation status as 'manual' with the reviewer's identity.

**Endpoint:** `PUT /api/translations/[entityType]/[entityId]/[language]`

---

## Prerequisites

Before starting implementation, verify these dependencies are complete:

| Dependency | Verification | Status |
|------------|--------------|--------|
| Translation tables exist | Check `article_translations`, `item_translations`, `link_translations` tables in Supabase | Required |
| Translation service types | Verify `/src/lib/translation-service/translation-service.types.ts` exists | Required |
| Auth helpers exist | Verify `/src/lib/auth-server.ts` has `validateAdminAuth` | Required |
| Supabase server client | Verify `/src/lib/supabase-server.ts` has `createSupabaseServer` | Required |

---

## Task Breakdown

### Task 1: Create Directory Structure for Dynamic Route
**Estimated Effort:** 0.5 SP (Small)
**Priority:** Critical - Blocks all other tasks

#### Description
Create the nested directory structure required for Next.js App Router dynamic routes with three path parameters.

#### Acceptance Criteria
- [ ] Directory `/src/app/api/translations/[entityType]/[entityId]/[language]/` exists
- [ ] Empty `route.ts` file created in the directory
- [ ] Directory structure matches Next.js 15 App Router conventions

#### Implementation Steps

1. **Create the directory structure:**
   ```bash
   mkdir -p src/app/api/translations/\[entityType\]/\[entityId\]/\[language\]
   ```

2. **Create the initial route.ts file:**
   ```typescript
   // /src/app/api/translations/[entityType]/[entityId]/[language]/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   /**
    * PUT /api/translations/[entityType]/[entityId]/[language]
    * Manual translation update endpoint
    *
    * REQ-E05-002: Manual Translation Update API Endpoint
    * Created: 2026-01-19
    */
   export async function PUT(
     request: NextRequest,
     { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
   ) {
     // TODO: Implement
     return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
   }
   ```

#### Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | API route handler |

#### Verification
- Run `ls -la src/app/api/translations/` to confirm directory exists
- Ensure file compiles without TypeScript errors

---

### Task 2: Implement Path Parameter Extraction and Validation
**Estimated Effort:** 1 SP (Small)
**Priority:** Critical - Blocks request processing

#### Description
Extract and validate the three path parameters (`entityType`, `entityId`, `language`) from the request. Each parameter has specific validation requirements.

#### Acceptance Criteria
- [ ] `entityType` validated as 'article', 'item', or 'link' (not 'tag')
- [ ] `entityId` validated as UUID format using regex
- [ ] `language` validated against supported language codes (en, fr, es, de, nl, it)
- [ ] Invalid parameters return 400 with descriptive error message
- [ ] All parameters are properly typed

#### Implementation Steps

1. **Add validation constants and helpers at the top of route.ts:**
   ```typescript
   import {
     SupportedLanguage,
     TranslatableEntityType,
     isSupportedLanguage
   } from '@/lib/translation-service/translation-service.types';

   // Valid entity types for this endpoint (excludes 'tag')
   const VALID_ENTITY_TYPES: TranslatableEntityType[] = ['article', 'item', 'link'];

   // UUID validation regex
   const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

   /**
    * Validate entity type is one of the allowed values
    */
   function isValidEntityType(type: string): type is Exclude<TranslatableEntityType, 'tag'> {
     return VALID_ENTITY_TYPES.includes(type as TranslatableEntityType);
   }

   /**
    * Validate UUID format
    */
   function isValidUUID(id: string): boolean {
     return UUID_REGEX.test(id);
   }
   ```

2. **Implement parameter extraction in PUT handler:**
   ```typescript
   export async function PUT(
     request: NextRequest,
     { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
   ) {
     try {
       // Extract path parameters (Next.js 15 async params)
       const { entityType, entityId, language } = await params;

       // Validate entityType
       if (!isValidEntityType(entityType)) {
         return NextResponse.json(
           {
             success: false,
             error: 'Invalid entity type. Must be: article, item, link',
             code: 'VALIDATION_ERROR'
           },
           { status: 400 }
         );
       }

       // Validate entityId format
       if (!isValidUUID(entityId)) {
         return NextResponse.json(
           {
             success: false,
             error: 'Invalid entityId format. Must be a valid UUID',
             code: 'INVALID_FORMAT'
           },
           { status: 400 }
         );
       }

       // Validate language code
       if (!isSupportedLanguage(language)) {
         return NextResponse.json(
           {
             success: false,
             error: 'Invalid language code. Must be: en, fr, es, de, nl, it',
             code: 'VALIDATION_ERROR'
           },
           { status: 400 }
         );
       }

       // Continue with authentication...
     } catch (error) {
       console.error('Error in PUT /api/translations:', error);
       return NextResponse.json(
         { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
         { status: 500 }
       );
     }
   }
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add validation logic |

#### Verification
- Test with invalid entityType (should return 400)
- Test with invalid UUID format (should return 400)
- Test with invalid language code (should return 400)
- Test with valid parameters (should proceed to next step)

---

### Task 3: Implement Authentication Integration
**Estimated Effort:** 0.5 SP (Small)
**Priority:** Critical - Security requirement

#### Description
Integrate with the existing `validateAdminAuth` function from `/src/lib/auth-server.ts` to authenticate requests and extract the authenticated user's identity.

#### Acceptance Criteria
- [ ] Authentication uses existing `validateAdminAuth` pattern
- [ ] Missing or invalid session returns 401 UNAUTHORIZED
- [ ] User not in system returns 403 FORBIDDEN
- [ ] Authenticated user ID extracted for `reviewedBy` field
- [ ] Supabase client returned for subsequent database operations

#### Implementation Steps

1. **Add authentication imports:**
   ```typescript
   import { validateAdminAuth } from '@/lib/auth-server';
   ```

2. **Add authentication after parameter validation:**
   ```typescript
   // After parameter validation...

   // Validate authentication
   const authResult = await validateAdminAuth(request);
   if (authResult.error) {
     return authResult.error;
   }

   const { user, isAdmin, supabase } = authResult;

   console.log(`Translation update request by ${user.email} for ${entityType}/${entityId}/${language}`);
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add auth import and validation |

#### Verification
- Test without auth cookies (should return 401)
- Test with expired session (should return 401)
- Test with valid session for non-existent user (should return 403)
- Test with valid session (should proceed)

---

### Task 4: Implement Entity Access Validation Helper
**Estimated Effort:** 1.5 SP (Medium)
**Priority:** Critical - Security requirement

#### Description
Create a helper function to validate that the authenticated user has access to the specified entity through the ownership chain (user → account_users → accounts → properties → items → entity).

#### Acceptance Criteria
- [ ] Function validates access for all three entity types (article, item, link)
- [ ] Returns 404 if entity does not exist
- [ ] Returns 403 if user lacks access to entity
- [ ] Returns entity data if access is valid
- [ ] Uses proper Supabase joins for ownership chain

#### Implementation Steps

1. **Create the validateEntityAccess helper function:**
   ```typescript
   /**
    * Validate user has access to the specified entity
    * Follows ownership chain: entity → item → property → account → user
    */
   async function validateEntityAccess(
     entityType: Exclude<TranslatableEntityType, 'tag'>,
     entityId: string,
     userId: string,
     isAdmin: boolean,
     supabase: any
   ): Promise<{
     hasAccess: boolean;
     entity?: any;
     error?: NextResponse;
   }> {
     try {
       let query;
       let entityData;

       switch (entityType) {
         case 'article':
           // Query article with ownership chain
           const { data: article, error: articleError } = await supabase
             .from('item_articles')
             .select(`
               id,
               item_id,
               title,
               description,
               items!inner (
                 id,
                 property_id,
                 properties!inner (
                   id,
                   account_id,
                   user_id
                 )
               )
             `)
             .eq('id', entityId)
             .single();

           if (articleError || !article) {
             return {
               hasAccess: false,
               error: NextResponse.json(
                 { success: false, error: 'Article not found', code: 'NOT_FOUND' },
                 { status: 404 }
               )
             };
           }
           entityData = article;
           break;

         case 'item':
           // Query item with ownership chain
           const { data: item, error: itemError } = await supabase
             .from('items')
             .select(`
               id,
               property_id,
               name,
               description,
               properties!inner (
                 id,
                 account_id,
                 user_id
               )
             `)
             .eq('id', entityId)
             .single();

           if (itemError || !item) {
             return {
               hasAccess: false,
               error: NextResponse.json(
                 { success: false, error: 'Item not found', code: 'NOT_FOUND' },
                 { status: 404 }
               )
             };
           }
           entityData = item;
           break;

         case 'link':
           // Query link with ownership chain
           const { data: link, error: linkError } = await supabase
             .from('item_links')
             .select(`
               id,
               item_id,
               title,
               items!inner (
                 id,
                 property_id,
                 properties!inner (
                   id,
                   account_id,
                   user_id
                 )
               )
             `)
             .eq('id', entityId)
             .single();

           if (linkError || !link) {
             return {
               hasAccess: false,
               error: NextResponse.json(
                 { success: false, error: 'Link not found', code: 'NOT_FOUND' },
                 { status: 404 }
               )
             };
           }
           entityData = link;
           break;

         default:
           return {
             hasAccess: false,
             error: NextResponse.json(
               { success: false, error: 'Unsupported entity type', code: 'VALIDATION_ERROR' },
               { status: 400 }
             )
           };
       }

       // Extract property info based on entity type
       const properties = entityType === 'item'
         ? entityData.properties
         : entityData.items?.properties;

       if (!properties) {
         return {
           hasAccess: false,
           error: NextResponse.json(
             { success: false, error: 'Entity property chain not found', code: 'NOT_FOUND' },
             { status: 404 }
           )
         };
       }

       // Admin users have full access
       if (isAdmin) {
         return { hasAccess: true, entity: entityData };
       }

       // Check if user has access via account_users
       const { data: accountAccess, error: accessError } = await supabase
         .from('account_users')
         .select('account_id, role')
         .eq('account_id', properties.account_id)
         .eq('user_id', userId)
         .single();

       if (accessError || !accountAccess) {
         // Fallback: check if user directly owns the property
         if (properties.user_id === userId) {
           return { hasAccess: true, entity: entityData };
         }

         return {
           hasAccess: false,
           error: NextResponse.json(
             { success: false, error: 'Access denied to entity', code: 'FORBIDDEN' },
             { status: 403 }
           )
         };
       }

       return { hasAccess: true, entity: entityData };

     } catch (error) {
       console.error('Entity access validation error:', error);
       return {
         hasAccess: false,
         error: NextResponse.json(
           { success: false, error: 'Failed to validate entity access', code: 'INTERNAL_ERROR' },
           { status: 500 }
         )
       };
     }
   }
   ```

2. **Call the helper after authentication:**
   ```typescript
   // After authentication validation...

   // Validate entity access
   const accessResult = await validateEntityAccess(
     entityType as Exclude<TranslatableEntityType, 'tag'>,
     entityId,
     user.id,
     isAdmin,
     supabase
   );

   if (!accessResult.hasAccess || accessResult.error) {
     return accessResult.error!;
   }

   const entity = accessResult.entity;
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add validateEntityAccess function |

#### Verification
- Test with non-existent entity ID (should return 404)
- Test with entity owned by different user (should return 403)
- Test with admin user for any entity (should succeed)
- Test with owner user for owned entity (should succeed)

---

### Task 5: Implement Request Body Validation
**Estimated Effort:** 1 SP (Small)
**Priority:** Critical - Data integrity

#### Description
Parse and validate the request body, ensuring required fields are present based on entity type and field lengths are within limits.

#### Acceptance Criteria
- [ ] Request body parsed as JSON
- [ ] For articles: `title` is required, max 255 chars
- [ ] For items: `name` is required, max 255 chars
- [ ] For links: `title` is required, max 255 chars
- [ ] `description` is optional for articles and items
- [ ] Invalid JSON returns 400
- [ ] Missing required field returns 400 with field name
- [ ] Field exceeding max length returns 400

#### Implementation Steps

1. **Add request body interface:**
   ```typescript
   /**
    * Request body for updating translations
    */
   interface UpdateTranslationRequestBody {
     // For article translations
     title?: string;
     description?: string;
     // For item translations
     name?: string;
   }

   /**
    * Validate request body based on entity type
    */
   function validateRequestBody(
     entityType: Exclude<TranslatableEntityType, 'tag'>,
     body: UpdateTranslationRequestBody
   ): { valid: boolean; error?: string } {
     const MAX_TITLE_LENGTH = 255;
     const MAX_NAME_LENGTH = 255;

     switch (entityType) {
       case 'article':
         if (!body.title || body.title.trim().length === 0) {
           return { valid: false, error: 'Missing required field: title' };
         }
         if (body.title.length > MAX_TITLE_LENGTH) {
           return { valid: false, error: `title exceeds maximum length of ${MAX_TITLE_LENGTH} characters` };
         }
         break;

       case 'item':
         if (!body.name || body.name.trim().length === 0) {
           return { valid: false, error: 'Missing required field: name' };
         }
         if (body.name.length > MAX_NAME_LENGTH) {
           return { valid: false, error: `name exceeds maximum length of ${MAX_NAME_LENGTH} characters` };
         }
         break;

       case 'link':
         if (!body.title || body.title.trim().length === 0) {
           return { valid: false, error: 'Missing required field: title' };
         }
         if (body.title.length > MAX_TITLE_LENGTH) {
           return { valid: false, error: `title exceeds maximum length of ${MAX_TITLE_LENGTH} characters` };
         }
         break;
     }

     return { valid: true };
   }
   ```

2. **Parse and validate body after entity access validation:**
   ```typescript
   // After entity access validation...

   // Parse request body
   let body: UpdateTranslationRequestBody;
   try {
     body = await request.json();
   } catch (error) {
     return NextResponse.json(
       { success: false, error: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' },
       { status: 400 }
     );
   }

   // Validate request body
   const bodyValidation = validateRequestBody(
     entityType as Exclude<TranslatableEntityType, 'tag'>,
     body
   );
   if (!bodyValidation.valid) {
     return NextResponse.json(
       { success: false, error: bodyValidation.error, code: 'VALIDATION_ERROR' },
       { status: 400 }
     );
   }
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add body validation |

#### Verification
- Test with invalid JSON (should return 400)
- Test article update without title (should return 400)
- Test item update without name (should return 400)
- Test link update without title (should return 400)
- Test with title > 255 chars (should return 400)
- Test with valid body (should proceed)

---

### Task 6: Implement Translation Upsert Logic
**Estimated Effort:** 1.5 SP (Medium)
**Priority:** Critical - Core functionality

#### Description
Implement the database upsert operation to either create a new translation record or update an existing one. Always set status to 'manual', record the reviewer, and update timestamps.

#### Acceptance Criteria
- [ ] Creates new translation if none exists for (entityId, language)
- [ ] Updates existing translation if one exists
- [ ] Sets `translation_status` to 'manual'
- [ ] Sets `reviewed_by` to authenticated user ID
- [ ] Sets `translated_at` to current timestamp
- [ ] Sets `updated_at` to current timestamp
- [ ] Returns complete updated/created record
- [ ] Handles database errors gracefully

#### Implementation Steps

1. **Add the translation upsert function:**
   ```typescript
   /**
    * Get the translation table name and foreign key column for an entity type
    */
   function getTranslationTableInfo(entityType: Exclude<TranslatableEntityType, 'tag'>): {
     tableName: string;
     foreignKeyColumn: string;
     contentFields: string[];
   } {
     switch (entityType) {
       case 'article':
         return {
           tableName: 'article_translations',
           foreignKeyColumn: 'article_id',
           contentFields: ['title', 'description']
         };
       case 'item':
         return {
           tableName: 'item_translations',
           foreignKeyColumn: 'item_id',
           contentFields: ['name', 'description']
         };
       case 'link':
         return {
           tableName: 'link_translations',
           foreignKeyColumn: 'link_id',
           contentFields: ['title']
         };
     }
   }

   /**
    * Upsert translation record
    */
   async function upsertTranslation(
     entityType: Exclude<TranslatableEntityType, 'tag'>,
     entityId: string,
     language: SupportedLanguage,
     content: UpdateTranslationRequestBody,
     reviewedBy: string,
     supabase: any
   ): Promise<{ success: boolean; data?: any; error?: string }> {
     const { tableName, foreignKeyColumn, contentFields } = getTranslationTableInfo(entityType);
     const now = new Date().toISOString();

     // Build upsert data
     const upsertData: Record<string, any> = {
       [foreignKeyColumn]: entityId,
       language: language,
       translation_status: 'manual',
       translated_at: now,
       updated_at: now
     };

     // Add reviewed_by if the table supports it
     // Note: item_translations and link_translations may not have reviewed_by column yet
     if (entityType === 'article') {
       upsertData.reviewed_by = reviewedBy;
     }

     // Add content fields
     if (entityType === 'article' || entityType === 'link') {
       upsertData.title = content.title;
       if (entityType === 'article' && content.description !== undefined) {
         upsertData.description = content.description;
       }
     } else if (entityType === 'item') {
       upsertData.name = content.name;
       if (content.description !== undefined) {
         upsertData.description = content.description;
       }
     }

     try {
       // Perform upsert with ON CONFLICT
       const { data, error } = await supabase
         .from(tableName)
         .upsert(upsertData, {
           onConflict: `${foreignKeyColumn},language`
         })
         .select()
         .single();

       if (error) {
         console.error(`Translation upsert error for ${tableName}:`, error);
         return {
           success: false,
           error: `Failed to update translation: ${error.message}`
         };
       }

       return { success: true, data };

     } catch (error) {
       console.error('Translation upsert exception:', error);
       return {
         success: false,
         error: 'Database error during translation update'
       };
     }
   }
   ```

2. **Call upsert after body validation:**
   ```typescript
   // After body validation...

   // Perform translation upsert
   const upsertResult = await upsertTranslation(
     entityType as Exclude<TranslatableEntityType, 'tag'>,
     entityId,
     language as SupportedLanguage,
     body,
     user.id,
     supabase
   );

   if (!upsertResult.success) {
     return NextResponse.json(
       { success: false, error: upsertResult.error, code: 'INTERNAL_ERROR' },
       { status: 500 }
     );
   }

   const translationRecord = upsertResult.data;
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add upsert logic |

#### Verification
- Test creating new translation (should create record)
- Test updating existing translation (should update record)
- Verify `translation_status` is 'manual'
- Verify `reviewed_by` is set (for articles)
- Verify `translated_at` is updated
- Test database error handling

---

### Task 7: Implement Response Formatting
**Estimated Effort:** 0.5 SP (Small)
**Priority:** Critical - API contract

#### Description
Format and return the successful response with the updated translation record, including all relevant fields for UI consumption.

#### Acceptance Criteria
- [ ] Response matches API contract from overview document
- [ ] Returns 200 OK on success
- [ ] Includes translation ID, entity info, language, status
- [ ] Includes content fields based on entity type
- [ ] Includes `reviewedBy` and `updatedAt` timestamps
- [ ] Response is properly typed

#### Implementation Steps

1. **Add response interface and formatter:**
   ```typescript
   /**
    * Format successful response
    */
   function formatSuccessResponse(
     entityType: Exclude<TranslatableEntityType, 'tag'>,
     entityId: string,
     language: SupportedLanguage,
     record: any,
     reviewedBy: string
   ) {
     const content: Record<string, any> = {};

     // Extract content based on entity type
     if (entityType === 'article' || entityType === 'link') {
       content.title = record.title;
       if (entityType === 'article' && record.description) {
         content.description = record.description;
       }
     } else if (entityType === 'item') {
       content.name = record.name;
       if (record.description) {
         content.description = record.description;
       }
     }

     return {
       success: true,
       data: {
         id: record.id,
         entityType: entityType,
         entityId: entityId,
         language: language,
         status: 'manual' as const,
         reviewedBy: reviewedBy,
         updatedAt: record.updated_at,
         content: content
       }
     };
   }
   ```

2. **Return formatted response:**
   ```typescript
   // After successful upsert...

   // Format and return success response
   const response = formatSuccessResponse(
     entityType as Exclude<TranslatableEntityType, 'tag'>,
     entityId,
     language as SupportedLanguage,
     translationRecord,
     user.id
   );

   console.log(`Translation updated: ${entityType}/${entityId}/${language} by ${user.email}`);

   return NextResponse.json(response, { status: 200 });
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add response formatting |

#### Verification
- Verify response status is 200
- Verify response has `success: true`
- Verify response data matches API contract
- Verify content fields are correct for entity type

---

### Task 8: Add Comprehensive Error Handling
**Estimated Effort:** 0.5 SP (Small)
**Priority:** High - Robustness

#### Description
Add comprehensive try-catch error handling and ensure all error paths return consistent, informative error responses.

#### Acceptance Criteria
- [ ] All error responses follow consistent format: `{ success: false, error: string, code: string }`
- [ ] HTTP status codes match error types (400, 401, 403, 404, 500)
- [ ] Errors are logged with sufficient context for debugging
- [ ] Unexpected exceptions are caught and return 500

#### Implementation Steps

1. **Ensure the complete PUT handler has proper error handling:**
   ```typescript
   export async function PUT(
     request: NextRequest,
     { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
   ) {
     try {
       // ... all validation and processing logic ...

     } catch (error) {
       // Log unexpected errors
       console.error('Unexpected error in PUT /api/translations:', {
         error: error instanceof Error ? error.message : error,
         stack: error instanceof Error ? error.stack : undefined
       });

       return NextResponse.json(
         {
           success: false,
           error: 'Internal server error',
           code: 'INTERNAL_ERROR'
         },
         { status: 500 }
       );
     }
   }
   ```

2. **Add logging at key points throughout the handler:**
   ```typescript
   // After each major step, add logging
   console.log(`[Translation API] Parameters validated: ${entityType}/${entityId}/${language}`);
   console.log(`[Translation API] Authentication validated for user: ${user.email}`);
   console.log(`[Translation API] Entity access validated for: ${entityType}/${entityId}`);
   console.log(`[Translation API] Request body validated`);
   console.log(`[Translation API] Translation upserted successfully`);
   ```

#### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Add error handling and logging |

#### Verification
- Test that all error paths return proper JSON
- Test that errors are logged
- Test unexpected exception handling

---

### Task 9: Add reviewed_by Column Migration (Conditional)
**Estimated Effort:** 0.5 SP (Small)
**Priority:** Medium - Feature completeness

#### Description
Add `reviewed_by` column to `item_translations` and `link_translations` tables if they don't already have it. This enables tracking who made manual edits for all entity types.

#### Acceptance Criteria
- [ ] Migration checks if column exists before adding
- [ ] `reviewed_by` column is UUID type with FK to users(id)
- [ ] Column is nullable (manual edits are optional)
- [ ] Migration applied via Supabase

#### Implementation Steps

1. **Check current table structure using Supabase MCP:**
   - List columns in `item_translations` table
   - List columns in `link_translations` table

2. **If columns don't exist, create migration:**
   ```sql
   -- Add reviewed_by to item_translations
   ALTER TABLE item_translations
   ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

   -- Add reviewed_by to link_translations
   ALTER TABLE link_translations
   ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

   -- Add comment for documentation
   COMMENT ON COLUMN item_translations.reviewed_by IS 'User ID who manually edited this translation';
   COMMENT ON COLUMN link_translations.reviewed_by IS 'User ID who manually edited this translation';
   ```

3. **Update upsertTranslation function to include reviewed_by for all types:**
   ```typescript
   // After migration, update the upsert function:
   // Add reviewed_by for all entity types
   upsertData.reviewed_by = reviewedBy;
   ```

#### Database Operations
| Operation | Table | Change |
|-----------|-------|--------|
| ALTER TABLE | item_translations | Add reviewed_by column |
| ALTER TABLE | link_translations | Add reviewed_by column |

#### Verification
- Verify columns exist after migration
- Test that reviewed_by is populated for item and link translations

---

### Task 10: Create Unit Tests
**Estimated Effort:** 1 SP (Small)
**Priority:** High - Quality assurance

#### Description
Create unit tests covering the validation functions and helper utilities in the route handler.

#### Acceptance Criteria
- [ ] Tests for `isValidEntityType` function
- [ ] Tests for `isValidUUID` function
- [ ] Tests for `validateRequestBody` function
- [ ] Tests for `formatSuccessResponse` function
- [ ] Tests cover edge cases and error conditions

#### Implementation Steps

1. **Create test file:**
   ```typescript
   // /src/app/api/translations/[entityType]/[entityId]/[language]/route.test.ts

   import { describe, it, expect } from 'vitest'; // or jest

   // Note: Export helper functions from route.ts for testing
   // or create a separate utils file

   describe('Translation Update API Helpers', () => {
     describe('isValidEntityType', () => {
       it('should accept article, item, link', () => {
         expect(isValidEntityType('article')).toBe(true);
         expect(isValidEntityType('item')).toBe(true);
         expect(isValidEntityType('link')).toBe(true);
       });

       it('should reject tag', () => {
         expect(isValidEntityType('tag')).toBe(false);
       });

       it('should reject invalid types', () => {
         expect(isValidEntityType('invalid')).toBe(false);
         expect(isValidEntityType('')).toBe(false);
       });
     });

     describe('isValidUUID', () => {
       it('should accept valid UUIDs', () => {
         expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
       });

       it('should reject invalid UUIDs', () => {
         expect(isValidUUID('not-a-uuid')).toBe(false);
         expect(isValidUUID('')).toBe(false);
         expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
       });
     });

     describe('validateRequestBody', () => {
       it('should require title for articles', () => {
         const result = validateRequestBody('article', {});
         expect(result.valid).toBe(false);
         expect(result.error).toContain('title');
       });

       it('should require name for items', () => {
         const result = validateRequestBody('item', {});
         expect(result.valid).toBe(false);
         expect(result.error).toContain('name');
       });

       it('should reject title over 255 chars', () => {
         const result = validateRequestBody('article', { title: 'a'.repeat(256) });
         expect(result.valid).toBe(false);
         expect(result.error).toContain('255');
       });

       it('should accept valid bodies', () => {
         expect(validateRequestBody('article', { title: 'Test' }).valid).toBe(true);
         expect(validateRequestBody('item', { name: 'Test' }).valid).toBe(true);
         expect(validateRequestBody('link', { title: 'Test' }).valid).toBe(true);
       });
     });
   });
   ```

#### Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.test.ts` | Unit tests |

#### Verification
- All tests pass
- Coverage includes edge cases

---

## Complete File: route.ts

Below is the complete implementation combining all tasks:

```typescript
// /src/app/api/translations/[entityType]/[entityId]/[language]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  SupportedLanguage,
  TranslatableEntityType,
  isSupportedLanguage
} from '@/lib/translation-service/translation-service.types';

/**
 * PUT /api/translations/[entityType]/[entityId]/[language]
 * Manual translation update endpoint
 *
 * REQ-E05-002: Manual Translation Update API Endpoint
 * Created: 2026-01-19
 */

// =============================================================================
// Constants and Types
// =============================================================================

const VALID_ENTITY_TYPES: TranslatableEntityType[] = ['article', 'item', 'link'];
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

interface UpdateTranslationRequestBody {
  title?: string;
  description?: string;
  name?: string;
}

// =============================================================================
// Validation Helpers
// =============================================================================

function isValidEntityType(type: string): type is Exclude<TranslatableEntityType, 'tag'> {
  return VALID_ENTITY_TYPES.includes(type as TranslatableEntityType);
}

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function validateRequestBody(
  entityType: Exclude<TranslatableEntityType, 'tag'>,
  body: UpdateTranslationRequestBody
): { valid: boolean; error?: string } {
  const MAX_LENGTH = 255;

  switch (entityType) {
    case 'article':
    case 'link':
      if (!body.title || body.title.trim().length === 0) {
        return { valid: false, error: 'Missing required field: title' };
      }
      if (body.title.length > MAX_LENGTH) {
        return { valid: false, error: `title exceeds maximum length of ${MAX_LENGTH} characters` };
      }
      break;
    case 'item':
      if (!body.name || body.name.trim().length === 0) {
        return { valid: false, error: 'Missing required field: name' };
      }
      if (body.name.length > MAX_LENGTH) {
        return { valid: false, error: `name exceeds maximum length of ${MAX_LENGTH} characters` };
      }
      break;
  }

  return { valid: true };
}

// =============================================================================
// Entity Access Validation
// =============================================================================

async function validateEntityAccess(
  entityType: Exclude<TranslatableEntityType, 'tag'>,
  entityId: string,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ hasAccess: boolean; entity?: any; error?: NextResponse }> {
  try {
    let entityData;

    switch (entityType) {
      case 'article': {
        const { data, error } = await supabase
          .from('item_articles')
          .select(`
            id, item_id, title, description,
            items!inner (id, property_id, properties!inner (id, account_id, user_id))
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return {
            hasAccess: false,
            error: NextResponse.json(
              { success: false, error: 'Article not found', code: 'NOT_FOUND' },
              { status: 404 }
            )
          };
        }
        entityData = data;
        break;
      }

      case 'item': {
        const { data, error } = await supabase
          .from('items')
          .select(`
            id, property_id, name, description,
            properties!inner (id, account_id, user_id)
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return {
            hasAccess: false,
            error: NextResponse.json(
              { success: false, error: 'Item not found', code: 'NOT_FOUND' },
              { status: 404 }
            )
          };
        }
        entityData = data;
        break;
      }

      case 'link': {
        const { data, error } = await supabase
          .from('item_links')
          .select(`
            id, item_id, title,
            items!inner (id, property_id, properties!inner (id, account_id, user_id))
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return {
            hasAccess: false,
            error: NextResponse.json(
              { success: false, error: 'Link not found', code: 'NOT_FOUND' },
              { status: 404 }
            )
          };
        }
        entityData = data;
        break;
      }
    }

    const properties = entityType === 'item' ? entityData.properties : entityData.items?.properties;

    if (!properties) {
      return {
        hasAccess: false,
        error: NextResponse.json(
          { success: false, error: 'Entity property chain not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      };
    }

    if (isAdmin) {
      return { hasAccess: true, entity: entityData };
    }

    const { data: accountAccess, error: accessError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('account_id', properties.account_id)
      .eq('user_id', userId)
      .single();

    if (accessError || !accountAccess) {
      if (properties.user_id === userId) {
        return { hasAccess: true, entity: entityData };
      }
      return {
        hasAccess: false,
        error: NextResponse.json(
          { success: false, error: 'Access denied to entity', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { hasAccess: true, entity: entityData };

  } catch (error) {
    console.error('Entity access validation error:', error);
    return {
      hasAccess: false,
      error: NextResponse.json(
        { success: false, error: 'Failed to validate entity access', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    };
  }
}

// =============================================================================
// Translation Upsert
// =============================================================================

function getTranslationTableInfo(entityType: Exclude<TranslatableEntityType, 'tag'>) {
  switch (entityType) {
    case 'article':
      return { tableName: 'article_translations', foreignKeyColumn: 'article_id' };
    case 'item':
      return { tableName: 'item_translations', foreignKeyColumn: 'item_id' };
    case 'link':
      return { tableName: 'link_translations', foreignKeyColumn: 'link_id' };
  }
}

async function upsertTranslation(
  entityType: Exclude<TranslatableEntityType, 'tag'>,
  entityId: string,
  language: SupportedLanguage,
  content: UpdateTranslationRequestBody,
  reviewedBy: string,
  supabase: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { tableName, foreignKeyColumn } = getTranslationTableInfo(entityType);
  const now = new Date().toISOString();

  const upsertData: Record<string, any> = {
    [foreignKeyColumn]: entityId,
    language: language,
    translation_status: 'manual',
    translated_at: now,
    updated_at: now,
    reviewed_by: reviewedBy
  };

  if (entityType === 'article' || entityType === 'link') {
    upsertData.title = content.title;
    if (entityType === 'article' && content.description !== undefined) {
      upsertData.description = content.description;
    }
  } else if (entityType === 'item') {
    upsertData.name = content.name;
    if (content.description !== undefined) {
      upsertData.description = content.description;
    }
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .upsert(upsertData, { onConflict: `${foreignKeyColumn},language` })
      .select()
      .single();

    if (error) {
      console.error(`Translation upsert error for ${tableName}:`, error);
      return { success: false, error: `Failed to update translation: ${error.message}` };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Translation upsert exception:', error);
    return { success: false, error: 'Database error during translation update' };
  }
}

// =============================================================================
// Response Formatting
// =============================================================================

function formatSuccessResponse(
  entityType: Exclude<TranslatableEntityType, 'tag'>,
  entityId: string,
  language: SupportedLanguage,
  record: any,
  reviewedBy: string
) {
  const content: Record<string, any> = {};

  if (entityType === 'article' || entityType === 'link') {
    content.title = record.title;
    if (entityType === 'article' && record.description) {
      content.description = record.description;
    }
  } else if (entityType === 'item') {
    content.name = record.name;
    if (record.description) {
      content.description = record.description;
    }
  }

  return {
    success: true,
    data: {
      id: record.id,
      entityType,
      entityId,
      language,
      status: 'manual' as const,
      reviewedBy,
      updatedAt: record.updated_at,
      content
    }
  };
}

// =============================================================================
// PUT Handler
// =============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string; language: string }> }
) {
  try {
    // Extract path parameters
    const { entityType, entityId, language } = await params;

    console.log(`[Translation API] Received request: ${entityType}/${entityId}/${language}`);

    // Validate entityType
    if (!isValidEntityType(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type. Must be: article, item, link', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate entityId format
    if (!isValidUUID(entityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityId format. Must be a valid UUID', code: 'INVALID_FORMAT' },
        { status: 400 }
      );
    }

    // Validate language code
    if (!isSupportedLanguage(language)) {
      return NextResponse.json(
        { success: false, error: 'Invalid language code. Must be: en, fr, es, de, nl, it', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user, isAdmin, supabase } = authResult;
    console.log(`[Translation API] Authenticated user: ${user.email}`);

    // Validate entity access
    const accessResult = await validateEntityAccess(
      entityType as Exclude<TranslatableEntityType, 'tag'>,
      entityId,
      user.id,
      isAdmin,
      supabase
    );

    if (!accessResult.hasAccess || accessResult.error) {
      return accessResult.error!;
    }

    console.log(`[Translation API] Entity access validated`);

    // Parse request body
    let body: UpdateTranslationRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate request body
    const bodyValidation = validateRequestBody(entityType as Exclude<TranslatableEntityType, 'tag'>, body);
    if (!bodyValidation.valid) {
      return NextResponse.json(
        { success: false, error: bodyValidation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    console.log(`[Translation API] Request body validated`);

    // Perform translation upsert
    const upsertResult = await upsertTranslation(
      entityType as Exclude<TranslatableEntityType, 'tag'>,
      entityId,
      language as SupportedLanguage,
      body,
      user.id,
      supabase
    );

    if (!upsertResult.success) {
      return NextResponse.json(
        { success: false, error: upsertResult.error, code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    console.log(`[Translation API] Translation upserted successfully`);

    // Return success response
    const response = formatSuccessResponse(
      entityType as Exclude<TranslatableEntityType, 'tag'>,
      entityId,
      language as SupportedLanguage,
      upsertResult.data,
      user.id
    );

    console.log(`[Translation API] Translation updated: ${entityType}/${entityId}/${language} by ${user.email}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in PUT /api/translations:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## Verification Checklist

After implementation, verify all acceptance criteria from REQ-E05-002:

| Criteria | Verification Method | Status |
|----------|---------------------|--------|
| PUT request accepts entityType, entityId, and language as path parameters | Test endpoint with valid parameters | [ ] |
| Request body contains the updated translation content fields | Test with valid request body | [ ] |
| System automatically sets translation status to 'manual' upon update | Query database after update | [ ] |
| System records the reviewedBy field with the authenticated user's identifier | Query database after update | [ ] |
| System validates that the requesting user has access to the specified entity | Test with unauthorized user | [ ] |
| Unauthorized access attempts return 403 Forbidden responses | Test access validation | [ ] |
| Invalid entity references return 404 Not Found responses | Test with non-existent entity | [ ] |
| Successful updates return the complete updated translation record | Verify response structure | [ ] |
| Translation version history is preserved when content is updated | Verify existing record updated, not replaced | [ ] |
| Content validation ensures required fields are present and properly formatted | Test with missing/invalid fields | [ ] |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `reviewed_by` column doesn't exist in item_translations/link_translations | Task 9 handles migration; code handles gracefully if column missing |
| Entity access validation queries are slow | Queries use indexed columns; consider caching for production |
| Concurrent updates could cause race conditions | Supabase upsert handles atomicity; no optimistic locking required per spec |
| Large request bodies could cause issues | Field length validation prevents oversized content |

---

## References

- Overview Document: `docs/REQ-E05-001-create-update-translation-api-endpoint-overview.md`
- Request Document: `docs/gen_requests_epic5.md` (REQ-E05-002)
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- Auth Pattern: `/src/lib/auth-server.ts`
- API Pattern: `/src/app/api/admin/items/[publicId]/route.ts`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task ID: 1.2 - Create update translation API endpoint*
