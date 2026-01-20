# REQ-E03-003: Implement Entity-Specific Translation Triggers - Detailed Task Breakdown
*Generated: 2026-01-19 18:30:00 UTC*
*Last Modified: 2026-01-19 18:30:00 UTC*

## Reference
- **Request**: REQ-E03-003 (Implement Entity-Specific Translation Triggers)
- **Overview Document**: docs/REQ-E03-003-implement-entity-specific-translation-triggers-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Source Requirements**: docs/gen_requests_epic3.md (Request #3)
- **Type**: NEW FEATURE
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.3

---

## Task Dependencies

### Prerequisite Tasks (Must Be Complete)
- **Task 1.1**: Create content-translation module structure
  - Must provide: `/src/lib/content-translation/index.ts`
  - Must provide: `/src/lib/content-translation/content-translation.types.ts`
  - Types needed: `QueueTranslationResult`, `TranslatableField`, `ContentToTranslate`

- **Task 1.2**: Implement content translation orchestrator
  - Must provide: `/src/lib/content-translation/content-translation.ts`
  - Function needed: `queueContentTranslations(options: QueueTranslationOptions)`

### Epic 1 Dependencies (Already Implemented)
- Job Queue Module: `/src/lib/job-queue/translation-jobs.ts` - `createBatchTranslationJobs()`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts` - `SupportedLanguage`, `EntityType`
- Supabase Client: `/src/lib/supabase.ts` - `supabaseAdmin`

### Downstream Tasks (Blocked By This)
- **Task 2.2**: Modify Items API to trigger translations
- **Task 2.3**: Modify Articles API to trigger translations
- **Task 2.4**: Create/Modify Links API to trigger translations

---

## Detailed Tasks

### Task 1: Create Triggers Directory Structure
**Estimated Effort**: 1 story point (trivial)
**Risk Level**: Low

#### Description
Create the triggers subdirectory within the content-translation module to organize all entity-specific trigger functions.

#### Implementation Steps

1. **Create the triggers directory**
   - Path: `/src/lib/content-translation/triggers/`
   - This is a new directory that will contain all trigger modules

2. **Verify directory creation**
   - Ensure the path exists and is accessible
   - Directory should be empty after creation, ready for trigger files

#### Acceptance Criteria
- [x] Directory `/src/lib/content-translation/triggers/` exists
- [x] Directory is empty and ready for trigger files

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/lib/content-translation/triggers/` | Directory for trigger modules |

---

### Task 2: Implement Item Translation Trigger
**Estimated Effort**: 3 story points (small)
**Risk Level**: Low

#### Description
Create the item trigger function that fetches an item from the database, extracts the `name` and `description` fields, and queues translation jobs for all target languages.

#### Implementation Steps

1. **Create the item trigger file**
   - Path: `/src/lib/content-translation/triggers/item-trigger.ts`
   - Add module documentation header with purpose and creation date

2. **Add required imports**
   ```typescript
   import { supabaseAdmin } from '@/lib/supabase';
   import { queueContentTranslations } from '../content-translation';
   import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
   import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
   ```

3. **Define translation context constants**
   - Create `ITEM_TRANSLATION_CONTEXTS` object with contexts for `name` and `description` fields
   - `name` context: `contentType: 'item_name'`, `domainContext: 'property_rental_appliances'`, `maxLength: 255`
   - `description` context: `contentType: 'item_description'`, `domainContext: 'property_rental_appliances'`

4. **Implement triggerItemTranslation function**
   - Signature: `async function triggerItemTranslation(itemId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>`
   - Add JSDoc documentation with @param and @returns descriptions
   - Include usage example in JSDoc

5. **Implement function body**
   - Log operation start with `ITEM_TRIGGER:` prefix
   - Fetch item from `items` table by ID using `supabaseAdmin`
   - Select only `id`, `name`, `description` columns
   - Handle fetch error: return error result with descriptive message
   - Handle item not found: return error result
   - Build `TranslatableField[]` array from item data
   - Only add `name` field if it has a value
   - Only add `description` field if it has a value
   - If no fields to translate, return success with empty arrays
   - Call `queueContentTranslations()` with entity type 'item'
   - Log completion with job count
   - Return orchestrator result

6. **Implement error handling**
   - Wrap entire function body in try-catch
   - On exception: log error, return failure result with error message
   - Never throw exceptions - always return error in result object

7. **Export the function**
   - Use named export: `export async function triggerItemTranslation`

#### Database Query
```sql
SELECT id, name, description
FROM items
WHERE id = $1
```

#### Acceptance Criteria
- [x] Function `triggerItemTranslation` is exported from the module
- [x] Function accepts `(itemId: string, sourceLanguage: SupportedLanguage)` parameters
- [x] Function returns `Promise<QueueTranslationResult>`
- [x] Function fetches item by ID from `items` table
- [x] Function returns error result if item not found
- [x] Function extracts `name` field for translation when present
- [x] Function extracts `description` field for translation when present
- [x] Function calls `queueContentTranslations()` with `entityType: 'item'`
- [x] Function logs operations with `ITEM_TRIGGER:` prefix
- [x] Function handles database errors gracefully
- [x] Function handles exceptions without throwing
- [x] JSDoc documentation is complete

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/lib/content-translation/triggers/item-trigger.ts` | Item translation trigger function |

---

### Task 3: Implement Article Translation Trigger
**Estimated Effort**: 3 story points (small)
**Risk Level**: Low

#### Description
Create the article trigger function that fetches an article from the database, extracts the `title` and `description` fields, and queues translation jobs for all target languages.

#### Implementation Steps

1. **Create the article trigger file**
   - Path: `/src/lib/content-translation/triggers/article-trigger.ts`
   - Add module documentation header with purpose and creation date

2. **Add required imports**
   ```typescript
   import { supabaseAdmin } from '@/lib/supabase';
   import { queueContentTranslations } from '../content-translation';
   import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
   import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
   ```

3. **Define translation context constants**
   - Create `ARTICLE_TRANSLATION_CONTEXTS` object with contexts for `title` and `description` fields
   - `title` context: `contentType: 'article_title'`, `domainContext: 'property_rental_instructions'`, `maxLength: 255`
   - `description` context: `contentType: 'article_description'`, `domainContext: 'property_rental_instructions'`

4. **Implement triggerArticleTranslation function**
   - Signature: `async function triggerArticleTranslation(articleId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>`
   - Add JSDoc documentation with @param and @returns descriptions
   - Include usage example in JSDoc

5. **Implement function body**
   - Log operation start with `ARTICLE_TRIGGER:` prefix
   - Fetch article from `item_articles` table by ID using `supabaseAdmin`
   - Select `id`, `title`, `description` columns
   - Note: `item_articles` table DOES have a `description` column (verified in supabase.ts:322)
   - Handle fetch error: return error result with descriptive message
   - Handle article not found: return error result
   - Build `TranslatableField[]` array from article data
   - Only add `title` field if it has a value
   - Only add `description` field if it has a value
   - If no fields to translate, return success with empty arrays
   - Call `queueContentTranslations()` with entity type 'article'
   - Log completion with job count
   - Return orchestrator result

6. **Implement error handling**
   - Wrap entire function body in try-catch
   - On exception: log error, return failure result with error message
   - Never throw exceptions - always return error in result object

7. **Export the function**
   - Use named export: `export async function triggerArticleTranslation`

#### Database Query
```sql
SELECT id, title, description
FROM item_articles
WHERE id = $1
```

#### Acceptance Criteria
- [x] Function `triggerArticleTranslation` is exported from the module
- [x] Function accepts `(articleId: string, sourceLanguage: SupportedLanguage)` parameters
- [x] Function returns `Promise<QueueTranslationResult>`
- [x] Function fetches article by ID from `item_articles` table
- [x] Function returns error result if article not found
- [x] Function extracts `title` field for translation when present
- [x] Function extracts `description` field for translation when present
- [x] Function calls `queueContentTranslations()` with `entityType: 'article'`
- [x] Function logs operations with `ARTICLE_TRIGGER:` prefix
- [x] Function handles database errors gracefully
- [x] Function handles exceptions without throwing
- [x] JSDoc documentation is complete

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/lib/content-translation/triggers/article-trigger.ts` | Article translation trigger function |

---

### Task 4: Implement Link Translation Trigger
**Estimated Effort**: 2 story points (small)
**Risk Level**: Low

#### Description
Create the link trigger function that fetches a link from the database, extracts ONLY the `title` field (URLs are never translated), and queues translation jobs for all target languages.

#### Implementation Steps

1. **Create the link trigger file**
   - Path: `/src/lib/content-translation/triggers/link-trigger.ts`
   - Add module documentation header with purpose and creation date

2. **Add required imports**
   ```typescript
   import { supabaseAdmin } from '@/lib/supabase';
   import { queueContentTranslations } from '../content-translation';
   import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
   import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
   ```

3. **Define translation context constants**
   - Create `LINK_TRANSLATION_CONTEXTS` object with context for `title` field only
   - `title` context: `contentType: 'link_title'`, `domainContext: 'property_rental_media'`, `maxLength: 255`
   - Note: NO contexts for `url` or `thumbnail_url` - these are NEVER translated

4. **Implement triggerLinkTranslation function**
   - Signature: `async function triggerLinkTranslation(linkId: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>`
   - Add JSDoc documentation with @param and @returns descriptions
   - Include usage example in JSDoc
   - Document that URLs are intentionally not translated

5. **Implement function body**
   - Log operation start with `LINK_TRIGGER:` prefix
   - Fetch link from `item_links` table by ID using `supabaseAdmin`
   - Select ONLY `id` and `title` columns (do NOT select `url` or `thumbnail_url`)
   - Handle fetch error: return error result with descriptive message
   - Handle link not found: return error result
   - Build `TranslatableField[]` array from link data
   - Only add `title` field if it has a value
   - If no fields to translate, return success with empty arrays
   - Call `queueContentTranslations()` with entity type 'link'
   - Log completion with job count
   - Return orchestrator result

6. **Implement error handling**
   - Wrap entire function body in try-catch
   - On exception: log error, return failure result with error message
   - Never throw exceptions - always return error in result object

7. **Export the function**
   - Use named export: `export async function triggerLinkTranslation`

#### Database Query
```sql
SELECT id, title
FROM item_links
WHERE id = $1
```

#### Critical Note
The link trigger MUST NOT extract the `url` or `thumbnail_url` fields. URLs should never be translated as they are resource locators, not human-readable content.

#### Acceptance Criteria
- [x] Function `triggerLinkTranslation` is exported from the module
- [x] Function accepts `(linkId: string, sourceLanguage: SupportedLanguage)` parameters
- [x] Function returns `Promise<QueueTranslationResult>`
- [x] Function fetches link by ID from `item_links` table
- [x] Function returns error result if link not found
- [x] Function extracts ONLY `title` field for translation
- [x] Function does NOT extract `url` field
- [x] Function does NOT extract `thumbnail_url` field
- [x] Function calls `queueContentTranslations()` with `entityType: 'link'`
- [x] Function logs operations with `LINK_TRIGGER:` prefix
- [x] Function handles database errors gracefully
- [x] Function handles exceptions without throwing
- [x] JSDoc documentation is complete

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/lib/content-translation/triggers/link-trigger.ts` | Link translation trigger function |

---

### Task 5: Create Barrel Exports for Triggers
**Estimated Effort**: 1 story point (trivial)
**Risk Level**: Low

#### Description
Create the barrel export file for the triggers directory to enable clean imports of all trigger functions.

#### Implementation Steps

1. **Create the triggers index file**
   - Path: `/src/lib/content-translation/triggers/index.ts`
   - Add module documentation header

2. **Add exports for all trigger functions**
   ```typescript
   export { triggerItemTranslation } from './item-trigger';
   export { triggerArticleTranslation } from './article-trigger';
   export { triggerLinkTranslation } from './link-trigger';
   ```

3. **Verify exports work correctly**
   - All three triggers should be importable from `./triggers`

#### Acceptance Criteria
- [x] File `/src/lib/content-translation/triggers/index.ts` exists
- [x] File exports `triggerItemTranslation`
- [x] File exports `triggerArticleTranslation`
- [x] File exports `triggerLinkTranslation`
- [x] All exports can be imported via `import { ... } from './triggers'`

#### Files to Create
| File | Purpose |
|------|---------|
| `/src/lib/content-translation/triggers/index.ts` | Barrel exports for trigger functions |

---

### Task 6: Update Main Module Exports
**Estimated Effort**: 1 story point (trivial)
**Risk Level**: Low

#### Description
Update the main content-translation module index file to re-export all trigger functions, enabling imports directly from `@/lib/content-translation`.

#### Implementation Steps

1. **Open the main module index file**
   - Path: `/src/lib/content-translation/index.ts`
   - File should already exist from Task 1.1

2. **Add trigger exports**
   - Add the following export statement:
   ```typescript
   export {
     triggerItemTranslation,
     triggerArticleTranslation,
     triggerLinkTranslation,
   } from './triggers';
   ```

3. **Verify import paths work**
   - Should be able to import triggers via `import { triggerItemTranslation } from '@/lib/content-translation'`

#### Acceptance Criteria
- [x] File `/src/lib/content-translation/index.ts` exports `triggerItemTranslation`
- [x] File `/src/lib/content-translation/index.ts` exports `triggerArticleTranslation`
- [x] File `/src/lib/content-translation/index.ts` exports `triggerLinkTranslation`
- [x] Import works: `import { triggerItemTranslation } from '@/lib/content-translation'`

#### Files to Modify
| File | Changes |
|------|---------|
| `/src/lib/content-translation/index.ts` | Add exports for trigger functions |

---

### Task 7: Verify TypeScript Compilation
**Estimated Effort**: 1 story point (trivial)
**Risk Level**: Low

#### Description
Run TypeScript compilation to verify all new files compile without errors and imports resolve correctly.

#### Implementation Steps

1. **Run TypeScript compilation**
   ```bash
   npm run build
   ```

2. **Check for type errors**
   - Verify no TypeScript errors related to trigger files
   - Verify all imports resolve correctly
   - Verify generics and type parameters work correctly

3. **Fix any compilation errors**
   - Address any type mismatches
   - Address any import resolution issues
   - Address any missing type definitions

#### Acceptance Criteria
- [ ] `npm run build` completes without TypeScript errors
- [ ] No type conflicts with existing modules
- [ ] All generics resolve correctly
- [ ] All imports resolve correctly

---

## Summary of Files

### New Files to Create
| File | Task | Purpose |
|------|------|---------|
| `/src/lib/content-translation/triggers/` | Task 1 | Directory for trigger modules |
| `/src/lib/content-translation/triggers/item-trigger.ts` | Task 2 | Item translation trigger function |
| `/src/lib/content-translation/triggers/article-trigger.ts` | Task 3 | Article translation trigger function |
| `/src/lib/content-translation/triggers/link-trigger.ts` | Task 4 | Link translation trigger function |
| `/src/lib/content-translation/triggers/index.ts` | Task 5 | Barrel exports for triggers |

### Files to Modify
| File | Task | Changes |
|------|------|---------|
| `/src/lib/content-translation/index.ts` | Task 6 | Add trigger exports |

### Files to Import From (No Modification)
| File | Import |
|------|--------|
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` |
| `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `TranslatableField` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `SupportedLanguage` |
| `/src/lib/supabase.ts` | `supabaseAdmin` |

---

## Field Extraction Reference

### Entity Field Mapping
| Entity | Database Table | Translatable Fields | Non-Translatable Fields |
|--------|---------------|---------------------|-------------------------|
| Item | `items` | `name`, `description` | `public_id`, `qr_code_url`, `property_id`, timestamps |
| Article | `item_articles` | `title`, `description` | `purpose`, `display_order`, `item_id`, timestamps |
| Link | `item_links` | `title` | `url`, `thumbnail_url`, `link_type`, `display_order`, timestamps |

### Translation Context Mapping
| Field | contentType | domainContext |
|-------|-------------|---------------|
| Item name | `item_name` | `property_rental_appliances` |
| Item description | `item_description` | `property_rental_appliances` |
| Article title | `article_title` | `property_rental_instructions` |
| Article description | `article_description` | `property_rental_instructions` |
| Link title | `link_title` | `property_rental_media` |

---

## Total Effort Estimate
| Task | Story Points |
|------|--------------|
| Task 1: Create Triggers Directory | 1 |
| Task 2: Item Translation Trigger | 3 |
| Task 3: Article Translation Trigger | 3 |
| Task 4: Link Translation Trigger | 2 |
| Task 5: Barrel Exports | 1 |
| Task 6: Update Main Module | 1 |
| Task 7: Verify Compilation | 1 |
| **Total** | **12** |

**Size Classification**: M (Medium)

---

## Verification Checklist

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

---

## References
- Overview Document: `/docs/REQ-E03-003-implement-entity-specific-translation-triggers-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Content Translation Orchestrator: `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- Content Translation Types: `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- Database Types: `/src/lib/supabase.ts`
