# REQ-227: Update TypeScript Database Types - Implementation Overview

**Generated:** 2026-01-17 14:45:00 UTC
**Last Modified:** 2026-01-17 14:45:00 UTC
**Request Reference:** REQ-227 - TypeScript Type Definitions for Translation Tables
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.5)
**Status:** Ready for Implementation

---

## 1. Request Summary

Update the TypeScript database type definitions in `/src/lib/supabase.ts` to include all newly created translation-related database tables. This enables full type safety, IntelliSense support, and compile-time error checking when developers work with translation data through the Supabase client.

The following tables need type definitions added:
1. **article_translations** - Translated article content (title, description)
2. **item_translations** - Translated item names and descriptions
3. **link_translations** - Translated link titles
4. **tag_translations** - Translated tag values (system and custom)
5. **translation_jobs** - Translation job queue metadata

---

## 2. Current State Analysis

### Existing Type Definition Pattern

Based on `/src/lib/supabase.ts`:

The file follows the standard Supabase TypeScript pattern with a `Database` type containing:
- `Tables` object with Row, Insert, Update, and Relationships for each table
- Consistent use of TypeScript union types for enums (e.g., `link_type: string`)
- Foreign key relationships defined in `Relationships` array
- Optional fields use `| null` pattern
- Timestamps use `string | null` for `created_at`, `updated_at`

### Existing Tables Structure Example

```typescript
table_name: {
  Row: {
    // All columns with their types (nullable where applicable)
  }
  Insert: {
    // Required fields + optional fields with ?
  }
  Update: {
    // All fields optional with ?
  }
  Relationships: [
    // Foreign key definitions
  ]
}
```

### Key Patterns Observed

| Pattern | Example | Notes |
|---------|---------|-------|
| UUID fields | `id: string` | Primary keys as strings |
| Timestamps | `created_at: string \| null` | Always nullable in existing schema |
| Foreign keys | `item_id: string \| null` | Nullable based on schema |
| Enum-like fields | `link_type: string` | Using string, not union types |
| JSON fields | `settings: Json \| null` | Using the `Json` type alias |
| Relationships | Array of FK definitions | Include foreignKeyName, columns, referencedRelation |

### Database Schema Reference

From the migration file (Task 1.1), the tables have these structures:

| Table | Key Columns | Foreign Keys |
|-------|-------------|--------------|
| `article_translations` | `article_id`, `language`, `title`, `description`, `translation_status`, `translated_at`, `reviewed_by` | `item_articles(id)`, `users(id)` |
| `item_translations` | `item_id`, `language`, `name`, `description`, `translation_status`, `translated_at` | `items(id)` |
| `link_translations` | `link_id`, `language`, `title`, `translation_status`, `translated_at` | `item_links(id)` |
| `tag_translations` | `tag_key`, `language`, `translated_value`, `is_system_tag` | None |
| `translation_jobs` | `entity_type`, `entity_id`, `source_language`, `target_language`, `status`, `attempts`, `error_message` | None |

---

## 3. Technical Approach

### Type Definition Structure

Each translation table will follow the established pattern:

```typescript
table_name: {
  Row: {
    id: string
    // ... all columns
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    // ... required columns without ?
    // ... optional columns with ?
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    // All columns optional with ?
  }
  Relationships: [
    // FK definitions where applicable
  ]
}
```

### Language and Status Types

The database uses CHECK constraints for valid values. In TypeScript, these will be represented as `string` (matching existing patterns) rather than union types to maintain consistency with the codebase:

```typescript
// Database uses CHECK constraints - TypeScript uses string
language: string  // Valid: 'en', 'fr', 'es', 'de', 'nl', 'it'
translation_status: string  // Valid: 'pending', 'processing', 'completed', 'failed', 'manual'
status: string  // For translation_jobs: 'queued', 'processing', 'completed', 'failed'
entity_type: string  // Valid: 'article', 'item', 'link', 'tag'
```

---

## 4. Implementation Tasks

### Task 1.5.1: Add article_translations type definition

**Action:** Add new table type definition
**File:** `/src/lib/supabase.ts`
**Location:** Inside `Database.public.Tables` object, after `item_articles`

```typescript
article_translations: {
  Row: {
    id: string
    article_id: string
    language: string
    title: string
    description: string | null
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    article_id: string
    language: string
    title: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    article_id?: string
    language?: string
    title?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "article_translations_article_id_fkey"
      columns: ["article_id"]
      isOneToOne: false
      referencedRelation: "item_articles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "article_translations_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

### Task 1.5.2: Add item_translations type definition

**Action:** Add new table type definition
**File:** `/src/lib/supabase.ts`
**Location:** Inside `Database.public.Tables` object, after `items`

```typescript
item_translations: {
  Row: {
    id: string
    item_id: string
    language: string
    name: string
    description: string | null
    translation_status: string
    translated_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    item_id: string
    language: string
    name: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    item_id?: string
    language?: string
    name?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "item_translations_item_id_fkey"
      columns: ["item_id"]
      isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    }
  ]
}
```

### Task 1.5.3: Add link_translations type definition

**Action:** Add new table type definition
**File:** `/src/lib/supabase.ts`
**Location:** Inside `Database.public.Tables` object, after `item_links`

```typescript
link_translations: {
  Row: {
    id: string
    link_id: string
    language: string
    title: string
    translation_status: string
    translated_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    link_id: string
    language: string
    title: string
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    link_id?: string
    language?: string
    title?: string
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "link_translations_link_id_fkey"
      columns: ["link_id"]
      isOneToOne: false
      referencedRelation: "item_links"
      referencedColumns: ["id"]
    }
  ]
}
```

### Task 1.5.4: Add tag_translations type definition

**Action:** Add new table type definition
**File:** `/src/lib/supabase.ts`
**Location:** Inside `Database.public.Tables` object (new table, no direct reference)

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
  }
  Insert: {
    id?: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag?: boolean | null
    created_at?: string | null
  }
  Update: {
    id?: string
    tag_key?: string
    language?: string
    translated_value?: string
    is_system_tag?: boolean | null
    created_at?: string | null
  }
  Relationships: []
}
```

### Task 1.5.5: Add translation_jobs type definition

**Action:** Add new table type definition
**File:** `/src/lib/supabase.ts`
**Location:** Inside `Database.public.Tables` object (new table, no direct reference)

```typescript
translation_jobs: {
  Row: {
    id: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status: string
    attempts: number | null
    error_message: string | null
    created_at: string | null
    started_at: string | null
    completed_at: string | null
  }
  Insert: {
    id?: string
    entity_type: string
    entity_id: string
    source_language?: string
    target_language: string
    status?: string
    attempts?: number | null
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
  }
  Update: {
    id?: string
    entity_type?: string
    entity_id?: string
    source_language?: string
    target_language?: string
    status?: string
    attempts?: number | null
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
  }
  Relationships: []
}
```

### Task 1.5.6: Verify TypeScript compilation

**Action:** Run TypeScript compiler to verify types are valid
**Command:** `npm run build` or `npx tsc --noEmit`

Subtasks:
- [ ] Run TypeScript compiler
- [ ] Verify no type errors in supabase.ts
- [ ] Verify no type errors in dependent files

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add 5 new table type definitions inside `Database.public.Tables` |

### Functions/Sections to Modify

| Location | Section | Change |
|----------|---------|--------|
| `/src/lib/supabase.ts:14-450` | `Database.public.Tables` | Add `article_translations`, `item_translations`, `link_translations`, `tag_translations`, `translation_jobs` |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/database/migrations/20260117_l10n_foundation.sql` | Database schema reference |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/src/types/index.ts` | Application-level type patterns (optional future export) |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/types/index.ts` | Application types - may be updated in future task if needed |
| Database files | Already handled by Task 1.1 |
| Application code | Types only - no runtime changes |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| Task 1.1 (Create migration file) | Required | Tables must exist in DB first for types to be meaningful |
| Task 1.2 (Add source_language columns) | Optional | Can add types for new columns if applied |
| Task 1.3 (Add preferred_language columns) | Optional | Can add types for new columns if applied |

### Runtime Dependencies

None - this is a TypeScript-only change that affects compile-time type checking.

### Type Dependencies

| Existing Type | Location | Usage |
|---------------|----------|-------|
| `Database` | `/src/lib/supabase.ts` | Parent type to extend |
| `Json` | `/src/lib/supabase.ts` | Type alias (not needed for these tables) |

---

## 7. Acceptance Criteria

From REQ-227:

- [ ] TypeScript type definitions exist for all 5 translation-related database tables:
  - [ ] `article_translations`
  - [ ] `item_translations`
  - [ ] `link_translations`
  - [ ] `tag_translations`
  - [ ] `translation_jobs`
- [ ] Type definitions accurately reflect the database schema including:
  - [ ] Column names match database column names
  - [ ] Data types match database types (string for UUID, string | null for nullable, etc.)
  - [ ] Relationships array defines foreign key constraints where applicable
- [ ] Developers can query translation tables with full type inference and autocomplete support
- [ ] TypeScript compiler catches mismatched types when interacting with translation tables

### Verification Queries

After implementation, these queries should have full type inference:

```typescript
// Query article translations - should have full IntelliSense
const { data } = await supabase
  .from('article_translations')
  .select('*')
  .eq('language', 'fr');

// Insert item translation - TypeScript should catch missing required fields
await supabase.from('item_translations').insert({
  item_id: 'uuid',
  language: 'es',
  name: 'Translated Name'
  // description is optional - no error
  // missing item_id would cause TypeScript error
});

// Query translation jobs - should have proper type on status
const { data: jobs } = await supabase
  .from('translation_jobs')
  .select('*')
  .eq('status', 'queued');
```

---

## 8. Testing Strategy

### Type Verification Tests

1. **Compile-time verification:**
   ```bash
   npm run build
   # OR
   npx tsc --noEmit
   ```
   Expected: No type errors

2. **IntelliSense verification (manual):**
   - Open `/src/lib/supabase.ts` in VS Code
   - Type `supabase.from('article_translations').select('`
   - Verify column names appear in autocomplete

3. **Type inference test:**
   Create a test file (can be deleted after verification):
   ```typescript
   // test-translation-types.ts
   import { supabase } from '@/lib/supabase';

   async function testTypes() {
     // Should compile without errors
     const { data: articles } = await supabase
       .from('article_translations')
       .select('id, article_id, language, title, translation_status');

     // Should show type error if uncommented
     // const bad = await supabase.from('article_translations').insert({
     //   language: 'en'  // Missing required 'article_id', 'title'
     // });

     return articles;
   }
   ```

### Integration Test (Post-Migration)

After database migration is applied:

```typescript
// Verify round-trip works with correct types
const { data, error } = await supabase
  .from('item_translations')
  .insert({
    item_id: 'existing-item-uuid',
    language: 'fr',
    name: 'Test Translation',
    translation_status: 'pending'
  })
  .select()
  .single();

if (data) {
  // TypeScript should know data.name is string
  console.log(data.name.toUpperCase());
}
```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Types don't match schema | Low | Medium | Cross-reference with migration SQL during implementation |
| Breaking existing code | Very Low | Low | Adding new types doesn't affect existing code |
| TypeScript compilation errors | Low | Low | Run tsc before committing |
| Column name typos | Medium | Medium | Copy column names from migration file |
| Missing relationships | Low | Low | Reference existing relationship patterns |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add article_translations type | 5 min |
| Add item_translations type | 5 min |
| Add link_translations type | 5 min |
| Add tag_translations type | 3 min |
| Add translation_jobs type | 5 min |
| TypeScript compilation verification | 3 min |
| IntelliSense verification | 2 min |
| **Total** | **~30 min** |

---

## 11. Implementation Notes

### Insertion Point

The new types should be added inside the `Tables` object in `/src/lib/supabase.ts`. The recommended insertion points are:

1. `article_translations` - After `item_articles` definition
2. `item_translations` - After `items` definition
3. `link_translations` - After `item_links` definition
4. `tag_translations` - Before or after `item_visits` (no direct dependency)
5. `translation_jobs` - Before or after `item_visits` (no direct dependency)

### Formatting

Follow existing code style:
- 2-space indentation
- Consistent spacing around colons
- Comments only if matching existing pattern (minimal)

### Future Considerations

If Task 1.2 (source_language columns) and Task 1.3 (preferred_language columns) are completed, the following existing types may need updates in a separate task:

- `items.Row` - Add `source_language: string | null`
- `item_articles.Row` - Add `source_language: string | null`
- `item_links.Row` - Add `source_language: string | null`
- `accounts.Row` - Add `preferred_language: string | null`
- `users.Row` - Add `preferred_language: string | null`

These changes are NOT part of this task (Task 1.5) but should be tracked separately.

---

## 12. Complete Type Definitions Summary

### article_translations

| Column | Row Type | Insert | Update | Notes |
|--------|----------|--------|--------|-------|
| id | string | optional | optional | UUID PK |
| article_id | string | required | optional | FK to item_articles |
| language | string | required | optional | CHECK constraint in DB |
| title | string | required | optional | |
| description | string \| null | optional | optional | |
| translation_status | string | optional (default 'pending') | optional | CHECK constraint in DB |
| translated_at | string \| null | optional | optional | |
| reviewed_by | string \| null | optional | optional | FK to users |
| created_at | string \| null | optional | optional | |
| updated_at | string \| null | optional | optional | |

### item_translations

| Column | Row Type | Insert | Update | Notes |
|--------|----------|--------|--------|-------|
| id | string | optional | optional | UUID PK |
| item_id | string | required | optional | FK to items |
| language | string | required | optional | CHECK constraint in DB |
| name | string | required | optional | |
| description | string \| null | optional | optional | |
| translation_status | string | optional (default 'pending') | optional | CHECK constraint in DB |
| translated_at | string \| null | optional | optional | |
| created_at | string \| null | optional | optional | |
| updated_at | string \| null | optional | optional | |

### link_translations

| Column | Row Type | Insert | Update | Notes |
|--------|----------|--------|--------|-------|
| id | string | optional | optional | UUID PK |
| link_id | string | required | optional | FK to item_links |
| language | string | required | optional | CHECK constraint in DB |
| title | string | required | optional | |
| translation_status | string | optional (default 'pending') | optional | CHECK constraint in DB |
| translated_at | string \| null | optional | optional | |
| created_at | string \| null | optional | optional | |
| updated_at | string \| null | optional | optional | |

### tag_translations

| Column | Row Type | Insert | Update | Notes |
|--------|----------|--------|--------|-------|
| id | string | optional | optional | UUID PK |
| tag_key | string | required | optional | |
| language | string | required | optional | CHECK constraint in DB |
| translated_value | string | required | optional | |
| is_system_tag | boolean \| null | optional (default false) | optional | |
| created_at | string \| null | optional | optional | |

### translation_jobs

| Column | Row Type | Insert | Update | Notes |
|--------|----------|--------|--------|-------|
| id | string | optional | optional | UUID PK |
| entity_type | string | required | optional | CHECK constraint in DB |
| entity_id | string | required | optional | UUID (no FK - polymorphic) |
| source_language | string | optional (default 'en') | optional | CHECK constraint in DB |
| target_language | string | required | optional | CHECK constraint in DB |
| status | string | optional (default 'queued') | optional | CHECK constraint in DB |
| attempts | number \| null | optional (default 0) | optional | |
| error_message | string \| null | optional | optional | |
| created_at | string \| null | optional | optional | |
| started_at | string \| null | optional | optional | |
| completed_at | string \| null | optional | optional | |

---

## 13. Next Steps After Implementation

After completing Task 1.5 (this task):

1. **Task 1.6:** Seed system tag translations (pre-populate tag_translations with standard room/appliance tags)
2. **Phase 2:** Begin i18n framework integration (next-intl setup)

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-223: Migration File Overview](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
- [Supabase TypeScript Types](/src/lib/supabase.ts)
- [Supabase TypeScript Documentation](https://supabase.com/docs/guides/api/generating-types)
