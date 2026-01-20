# REQ-E03-003: Implement Entity-Specific Translation Triggers - Implementation Overview
*Generated: 2026-01-19 17:00:00 UTC*

## Reference
- **Request**: REQ-E03-003 (Implement Entity-Specific Translation Triggers)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Translation Triggers)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.3
- **Size**: M (Medium)

## Goals
1. Create three entity-specific trigger functions for items, articles, and links
2. Each trigger fetches entity data from the database, extracts translatable fields, and queues translation jobs
3. Item trigger extracts `name` and `description` fields
4. Article trigger extracts `title` and `description` fields
5. Link trigger extracts only `title` field (URLs are never translated)
6. All triggers use the `queueContentTranslations` orchestrator from Task 1.2
7. All triggers return consistent `QueueTranslationResult` objects with job counts and status
8. Handle missing entities and database errors gracefully

## Context from Implementation Plan

### Module Location
Per the implementation plan (Plan-111), this is Task 1.3:
- **File**: `/src/lib/content-translation/triggers/item-trigger.ts`
- **File**: `/src/lib/content-translation/triggers/article-trigger.ts`
- **File**: `/src/lib/content-translation/triggers/link-trigger.ts`

### Module Hierarchy
```
/src/lib/content-translation/
├── index.ts                        # Public exports (Task 1.1) ✓
├── content-translation.ts          # Main orchestrator (Task 1.2) ✓
├── content-translation.types.ts    # All TypeScript interfaces (Task 1.1) ✓
├── source-language.ts              # Language detection (Task 2.1)
├── triggers/
│   ├── index.ts                    # Barrel exports for triggers (THIS TASK)
│   ├── item-trigger.ts             # Item translation trigger (THIS TASK)
│   ├── article-trigger.ts          # Article translation trigger (THIS TASK)
│   ├── link-trigger.ts             # Link translation trigger (THIS TASK)
│   └── tag-trigger.ts              # Tag translation trigger (Task 1.4)
└── storage/
    ├── translation-storage.ts      # Store/retrieve translations (Task 1.5)
    └── translation-status.ts       # Status tracking utilities (Task 1.6)
```

### Dependencies from Epic 1 and Previous Tasks
This task depends on:
- **Job Queue**: `createBatchTranslationJobs()` from `/src/lib/job-queue/translation-jobs.ts` (Epic 1)
- **Types**: `SupportedLanguage`, `EntityType` from `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- **Orchestrator**: `queueContentTranslations()` from `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- **Content Types**: `QueueTranslationResult`, `TranslatableField` from `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- **Supabase Client**: `supabaseAdmin` from `/src/lib/supabase.ts` for database access

### Task Dependencies
- **Depends On**: Task 1.1 (Content Translation Module Structure), Task 1.2 (Content Translation Orchestrator)
- **Blocks**: Task 2.2-2.4 (API route modifications will call these triggers)
- **Used By**: Tasks 2.2 (Items API), 2.3 (Articles API), 2.4 (Links API)

## Database Schema Reference

### Items Table
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,           -- TRANSLATABLE
  description TEXT,                      -- TRANSLATABLE
  qr_code_url TEXT,
  property_id UUID,
  source_language VARCHAR(5) DEFAULT 'en', -- Added in Epic 1
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Articles Table (item_articles)
```sql
CREATE TABLE item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,           -- TRANSLATABLE
  description TEXT,                       -- TRANSLATABLE (future - may be added)
  display_order INTEGER DEFAULT 0,
  source_language VARCHAR(5) DEFAULT 'en', -- Added in Epic 1
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Note**: The current `item_articles` schema does not have a `description` column. Per the implementation plan, we extract `title` and `description` fields. If `description` doesn't exist, we should only translate `title`. This should be validated during implementation.

### Links Table (item_links)
```sql
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,           -- TRANSLATABLE
  link_type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,                     -- NOT TRANSLATED
  thumbnail_url TEXT,                    -- NOT TRANSLATED
  article_id UUID,
  display_order INTEGER DEFAULT 0,
  source_language VARCHAR(5) DEFAULT 'en', -- Added in Epic 1
  created_at TIMESTAMP WITH TIME ZONE
);
```

## Implementation Order

### Step 1: Create Triggers Directory Structure
Create the triggers subdirectory and barrel export file.

**Directory to create**: `/src/lib/content-translation/triggers/`

**Files to create**:
- `/src/lib/content-translation/triggers/index.ts` (barrel exports)
- `/src/lib/content-translation/triggers/item-trigger.ts`
- `/src/lib/content-translation/triggers/article-trigger.ts`
- `/src/lib/content-translation/triggers/link-trigger.ts`

### Step 2: Implement Item Translation Trigger
Create the item trigger that fetches an item and queues translations for `name` and `description`.

**File**: `/src/lib/content-translation/triggers/item-trigger.ts`

**Function signature**:
```typescript
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Implementation flow**:
1. Log the operation with `ITEM_TRIGGER:` prefix
2. Fetch the item by ID from the database
3. If item not found, return error result
4. Extract `name` and `description` fields
5. Build `TranslatableField[]` array with appropriate context
6. Call `queueContentTranslations()` with entity type 'item'
7. Return the result from the orchestrator
8. Handle errors gracefully, returning failure result

### Step 3: Implement Article Translation Trigger
Create the article trigger that fetches an article and queues translations for `title` and `description`.

**File**: `/src/lib/content-translation/triggers/article-trigger.ts`

**Function signature**:
```typescript
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Implementation flow**:
1. Log the operation with `ARTICLE_TRIGGER:` prefix
2. Fetch the article by ID from the database
3. If article not found, return error result
4. Extract `title` field (and `description` if column exists)
5. Build `TranslatableField[]` array with appropriate context
6. Call `queueContentTranslations()` with entity type 'article'
7. Return the result from the orchestrator
8. Handle errors gracefully

### Step 4: Implement Link Translation Trigger
Create the link trigger that fetches a link and queues translations for `title` only.

**File**: `/src/lib/content-translation/triggers/link-trigger.ts`

**Function signature**:
```typescript
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Implementation flow**:
1. Log the operation with `LINK_TRIGGER:` prefix
2. Fetch the link by ID from the database
3. If link not found, return error result
4. Extract only `title` field (URLs are never translated)
5. Build `TranslatableField[]` array with appropriate context
6. Call `queueContentTranslations()` with entity type 'link'
7. Return the result from the orchestrator
8. Handle errors gracefully

### Step 5: Create Barrel Exports
Export all triggers from the triggers directory.

**File**: `/src/lib/content-translation/triggers/index.ts`

```typescript
export { triggerItemTranslation } from './item-trigger';
export { triggerArticleTranslation } from './article-trigger';
export { triggerLinkTranslation } from './link-trigger';
```

### Step 6: Update Main Module Exports
Add trigger exports to the main content-translation module.

**File**: `/src/lib/content-translation/index.ts`

Add:
```typescript
export {
  triggerItemTranslation,
  triggerArticleTranslation,
  triggerLinkTranslation,
} from './triggers';
```

### Step 7: Verification
- Run TypeScript compilation to verify no errors
- Verify imports resolve correctly
- Test with mock data in development

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/triggers/index.ts`
- **Purpose**: Barrel exports for all trigger functions
- **Exports**:
  - `triggerItemTranslation`
  - `triggerArticleTranslation`
  - `triggerLinkTranslation`

#### `/src/lib/content-translation/triggers/item-trigger.ts`
- **Purpose**: Item translation trigger function
- **Functions to implement**:
  - `triggerItemTranslation(itemId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>` - Fetches item, extracts name/description, queues translations
- **Pattern Reference**: Follows error handling pattern from `/src/lib/job-queue/translation-jobs.ts`

#### `/src/lib/content-translation/triggers/article-trigger.ts`
- **Purpose**: Article translation trigger function
- **Functions to implement**:
  - `triggerArticleTranslation(articleId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>` - Fetches article, extracts title/description, queues translations
- **Pattern Reference**: Follows error handling pattern from `/src/lib/job-queue/translation-jobs.ts`

#### `/src/lib/content-translation/triggers/link-trigger.ts`
- **Purpose**: Link translation trigger function
- **Functions to implement**:
  - `triggerLinkTranslation(linkId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>` - Fetches link, extracts title only, queues translations
- **Pattern Reference**: Follows error handling pattern from `/src/lib/job-queue/translation-jobs.ts`

### Files to Modify

#### `/src/lib/content-translation/index.ts`
- **Current Exports**: Types and `queueContentTranslations` from Tasks 1.1-1.2
- **Changes**: Add exports for trigger functions
- **New Exports**:
  ```typescript
  export {
    triggerItemTranslation,
    triggerArticleTranslation,
    triggerLinkTranslation,
  } from './triggers';
  ```

### Existing Files (Import Only - No Modification)

| File | Import |
|------|--------|
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` |
| `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `TranslatableField`, `ContentToTranslate` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `SupportedLanguage` |
| `/src/lib/supabase.ts` | `supabaseAdmin` |

## Technical Specifications

### Item Trigger Implementation

```typescript
// /src/lib/content-translation/triggers/item-trigger.ts

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

/** Translation context for item fields */
const ITEM_TRANSLATION_CONTEXTS = {
  name: {
    contentType: 'item_name' as const,
    domainContext: 'property_rental_appliances',
    maxLength: 255,
  },
  description: {
    contentType: 'item_description' as const,
    domainContext: 'property_rental_appliances',
  },
};

/**
 * Triggers translation for an item's translatable fields
 *
 * Fetches the item from the database, extracts the name and description
 * fields, and queues translation jobs for all target languages.
 *
 * @param itemId - The UUID of the item to translate
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error
 *
 * @example
 * const result = await triggerItemTranslation('item-uuid-123', 'en');
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 * }
 */
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('ITEM_TRIGGER: Triggering item translation', {
      itemId,
      sourceLanguage,
    });

    // 1. Fetch the item from database
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, description')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      console.error('ITEM_TRIGGER: Failed to fetch item', fetchError);
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Item not found: ${fetchError?.message || 'No item with this ID'}`,
      };
    }

    // 2. Build translatable fields array
    const fields: TranslatableField[] = [];

    if (item.name) {
      fields.push({
        fieldName: 'name',
        value: item.name,
        context: ITEM_TRANSLATION_CONTEXTS.name,
      });
    }

    if (item.description) {
      fields.push({
        fieldName: 'description',
        value: item.description,
        context: ITEM_TRANSLATION_CONTEXTS.description,
      });
    }

    if (fields.length === 0) {
      console.log('ITEM_TRIGGER: No translatable content found', { itemId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 3. Queue translations via orchestrator
    console.log('ITEM_TRIGGER: Queuing translations', {
      itemId,
      fieldCount: fields.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'item',
        entityId: itemId,
        sourceLanguage,
        fields,
      },
      trigger: 'create', // Caller can override if needed via orchestrator directly
    });

    console.log('ITEM_TRIGGER: Translation queuing complete', {
      itemId,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ITEM_TRIGGER: Exception triggering item translation', error);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering item translation: ${errorMessage}`,
    };
  }
}
```

### Article Trigger Implementation

```typescript
// /src/lib/content-translation/triggers/article-trigger.ts

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

/** Translation context for article fields */
const ARTICLE_TRANSLATION_CONTEXTS = {
  title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    maxLength: 255,
  },
  description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
  },
};

/**
 * Triggers translation for an article's translatable fields
 *
 * Fetches the article from the database, extracts the title and description
 * fields, and queues translation jobs for all target languages.
 *
 * @param articleId - The UUID of the article to translate
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error
 *
 * @example
 * const result = await triggerArticleTranslation('article-uuid-123', 'fr');
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 * }
 */
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('ARTICLE_TRIGGER: Triggering article translation', {
      articleId,
      sourceLanguage,
    });

    // 1. Fetch the article from database
    // Note: Current schema has title but may not have description column
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      console.error('ARTICLE_TRIGGER: Failed to fetch article', fetchError);
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Article not found: ${fetchError?.message || 'No article with this ID'}`,
      };
    }

    // 2. Build translatable fields array
    const fields: TranslatableField[] = [];

    if (article.title) {
      fields.push({
        fieldName: 'title',
        value: article.title,
        context: ARTICLE_TRANSLATION_CONTEXTS.title,
      });
    }

    // Description may not exist in current schema - check if present
    if (article.description) {
      fields.push({
        fieldName: 'description',
        value: article.description,
        context: ARTICLE_TRANSLATION_CONTEXTS.description,
      });
    }

    if (fields.length === 0) {
      console.log('ARTICLE_TRIGGER: No translatable content found', { articleId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 3. Queue translations via orchestrator
    console.log('ARTICLE_TRIGGER: Queuing translations', {
      articleId,
      fieldCount: fields.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'article',
        entityId: articleId,
        sourceLanguage,
        fields,
      },
      trigger: 'create',
    });

    console.log('ARTICLE_TRIGGER: Translation queuing complete', {
      articleId,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ARTICLE_TRIGGER: Exception triggering article translation', error);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering article translation: ${errorMessage}`,
    };
  }
}
```

### Link Trigger Implementation

```typescript
// /src/lib/content-translation/triggers/link-trigger.ts

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

/** Translation context for link fields */
const LINK_TRANSLATION_CONTEXTS = {
  title: {
    contentType: 'link_title' as const,
    domainContext: 'property_rental_media',
    maxLength: 255,
  },
};

/**
 * Triggers translation for a link's translatable fields
 *
 * Fetches the link from the database, extracts only the title field
 * (URLs and thumbnails are NOT translated), and queues translation jobs
 * for all target languages.
 *
 * @param linkId - The UUID of the link to translate
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error
 *
 * @example
 * const result = await triggerLinkTranslation('link-uuid-123', 'de');
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 * }
 */
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('LINK_TRIGGER: Triggering link translation', {
      linkId,
      sourceLanguage,
    });

    // 1. Fetch the link from database
    // Note: Only title is translated - url and thumbnail_url are NOT translated
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title')
      .eq('id', linkId)
      .single();

    if (fetchError || !link) {
      console.error('LINK_TRIGGER: Failed to fetch link', fetchError);
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Link not found: ${fetchError?.message || 'No link with this ID'}`,
      };
    }

    // 2. Build translatable fields array (title only)
    const fields: TranslatableField[] = [];

    if (link.title) {
      fields.push({
        fieldName: 'title',
        value: link.title,
        context: LINK_TRANSLATION_CONTEXTS.title,
      });
    }

    if (fields.length === 0) {
      console.log('LINK_TRIGGER: No translatable content found', { linkId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 3. Queue translations via orchestrator
    console.log('LINK_TRIGGER: Queuing translations', {
      linkId,
      fieldCount: fields.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'link',
        entityId: linkId,
        sourceLanguage,
        fields,
      },
      trigger: 'create',
    });

    console.log('LINK_TRIGGER: Translation queuing complete', {
      linkId,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('LINK_TRIGGER: Exception triggering link translation', error);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering link translation: ${errorMessage}`,
    };
  }
}
```

### Barrel Exports

```typescript
// /src/lib/content-translation/triggers/index.ts

export { triggerItemTranslation } from './item-trigger';
export { triggerArticleTranslation } from './article-trigger';
export { triggerLinkTranslation } from './link-trigger';
```

### Usage Examples (How API Routes Will Call)

```typescript
// In /src/app/api/admin/items/route.ts POST handler

import { triggerItemTranslation } from '@/lib/content-translation';

// After item is created successfully...
const translationResult = await triggerItemTranslation(
  newItem.id,
  body.sourceLanguage || userLanguage || 'en'
);

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds: translationResult.jobIds,
});
```

```typescript
// In /src/app/api/admin/articles/route.ts POST handler

import { triggerArticleTranslation } from '@/lib/content-translation';

// After article is created successfully...
const translationResult = await triggerArticleTranslation(
  newArticle.id,
  body.sourceLanguage || 'en'
);

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: transformedArticle,
  translationJobIds: translationResult.jobIds,
});
```

```typescript
// In /src/app/api/admin/items/[id]/links/route.ts POST handler

import { triggerLinkTranslation } from '@/lib/content-translation';

// After link is created successfully...
const translationResult = await triggerLinkTranslation(
  newLink.id,
  body.sourceLanguage || 'en'
);

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: newLink,
  translationJobIds: translationResult.jobIds,
});
```

## Success Validation Checklist

### File Structure
- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/triggers/index.ts` exists with barrel exports
- [ ] `/src/lib/content-translation/triggers/item-trigger.ts` exists
- [ ] `/src/lib/content-translation/triggers/article-trigger.ts` exists
- [ ] `/src/lib/content-translation/triggers/link-trigger.ts` exists
- [ ] All files contain proper module documentation headers

### Function Implementation
- [ ] `triggerItemTranslation()` function is exported
- [ ] `triggerArticleTranslation()` function is exported
- [ ] `triggerLinkTranslation()` function is exported
- [ ] All functions accept `(entityId: string, sourceLanguage: SupportedLanguage)` parameters
- [ ] All functions return `Promise<QueueTranslationResult>`
- [ ] Console logging follows `<ENTITY>_TRIGGER:` prefix pattern

### Item Trigger Behavior
- [ ] Fetches item by ID from `items` table
- [ ] Returns error result if item not found
- [ ] Extracts `name` field for translation
- [ ] Extracts `description` field for translation (if present)
- [ ] Uses `contentType: 'item_name'` for name field context
- [ ] Uses `contentType: 'item_description'` for description field context
- [ ] Calls `queueContentTranslations()` with `entityType: 'item'`

### Article Trigger Behavior
- [ ] Fetches article by ID from `item_articles` table
- [ ] Returns error result if article not found
- [ ] Extracts `title` field for translation
- [ ] Extracts `description` field for translation (if present)
- [ ] Uses `contentType: 'article_title'` for title field context
- [ ] Uses `contentType: 'article_description'` for description field context
- [ ] Calls `queueContentTranslations()` with `entityType: 'article'`

### Link Trigger Behavior
- [ ] Fetches link by ID from `item_links` table
- [ ] Returns error result if link not found
- [ ] Extracts ONLY `title` field for translation
- [ ] Does NOT extract `url` or `thumbnail_url` (these are never translated)
- [ ] Uses `contentType: 'link_title'` for title field context
- [ ] Calls `queueContentTranslations()` with `entityType: 'link'`

### Error Handling
- [ ] All triggers handle missing entities gracefully
- [ ] All triggers handle database errors gracefully
- [ ] All triggers catch and wrap exceptions
- [ ] Error results include descriptive messages
- [ ] No exceptions thrown - all errors returned in result object

### Integration
- [ ] All triggers use `queueContentTranslations` from orchestrator module
- [ ] Compatible with types from Task 1.1
- [ ] Exported from `/src/lib/content-translation/triggers/index.ts`
- [ ] Exported from `/src/lib/content-translation/index.ts`
- [ ] Import works: `import { triggerItemTranslation } from '@/lib/content-translation'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No type conflicts with existing modules
- [ ] All generics resolve correctly

## Notes

### Pattern Alignment
- Follow error handling pattern from `/src/lib/job-queue/translation-jobs.ts`
- Use console logging with entity-specific prefix for debugging (`ITEM_TRIGGER:`, `ARTICLE_TRIGGER:`, `LINK_TRIGGER:`)
- Never throw errors - always return error in result object
- Use JSDoc comments for all public functions

### Field Extraction Strategy
Each trigger is responsible for knowing which fields to extract for its entity type:

| Entity | Translatable Fields | Non-Translatable Fields |
|--------|---------------------|-------------------------|
| Item | `name`, `description` | `public_id`, `qr_code_url`, `property_id` |
| Article | `title`, `description` | `purpose`, `display_order`, `item_id` |
| Link | `title` | `url`, `thumbnail_url`, `link_type`, `display_order` |

### Schema Considerations
- The `item_articles.description` column may not exist in the current schema. The trigger should handle this gracefully by only translating fields that are present and non-null.
- All entity tables should have a `source_language` column added by Epic 1 migration (`20260118_add_source_language_columns.sql`)

### Translation Context Constants
Each trigger defines its own context constants for the fields it handles. This ensures appropriate translation context is provided to the translation service.

### Future Extensions
- **Task 1.4**: Tag trigger will follow the same pattern
- **Task 2.2-2.4**: API routes will call these triggers after content save
- **Phase 3**: Job processor will use field context to determine how to translate

## Dependencies
- TypeScript 5.x (existing in project)
- `/src/lib/supabase.ts` - Supabase client for database access
- `/src/lib/content-translation/content-translation.ts` - Orchestrator function (Task 1.2)
- `/src/lib/content-translation/content-translation.types.ts` - Type definitions (Task 1.1)
- `/src/lib/job-queue/translation-jobs.types.ts` - `SupportedLanguage` type (Epic 1)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Thin wrappers around existing orchestrator functionality
  - Simple database fetches using established Supabase patterns
  - Clear input/output contracts from types
  - Follows established patterns from existing modules
  - Can be tested independently before API integration
  - Each trigger is isolated and can be implemented/tested separately

## References
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Content Translation Orchestrator: `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- Content Translation Types: `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- Database Schema: `/database/schema.sql`
- Module Pattern Example: `/src/lib/job-queue/translation-jobs.ts`
