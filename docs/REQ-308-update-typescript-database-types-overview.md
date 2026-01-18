# REQ-308: Update TypeScript Database Types for Translation Infrastructure

**Document Type:** Implementation Breakdown
**Request ID:** REQ-308
**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

This document provides a detailed technical breakdown for updating TypeScript type definitions in `/src/lib/supabase.ts` to accurately reflect all translation tables and newly added localization columns. This ensures type safety and autocomplete support when working with localization data throughout the application.

### Context

- **Epic:** L10N Epic 5 - Owner Translation Management
- **Phase:** 1 - API Endpoints
- **Task ID:** 1.5
- **Depends On:**
  - Epic 1 (Foundation) - Translation tables created
  - REQ-307 - `source_version_at` columns added to translation tables
  - Epic 3 (Dynamic Content Translation) - Translation status tracking

### Problem Statement

The current `/src/lib/supabase.ts` Database type definitions do not include:
1. Translation tables (`article_translations`, `item_translations`, `link_translations`, `tag_translations`)
2. Translation jobs table (`translation_jobs`)
3. Source language columns on entity tables (`items.source_language`, `item_articles.source_language`, `item_links.source_language`)
4. Preferred language columns on user tables (`accounts.preferred_language`, `users.preferred_language`)
5. Source version tracking columns (`source_version_at`) on translation tables

This causes developers to lack type checking, autocomplete, and compile-time validation when working with localization features.

---

## Technical Analysis

### Current State

The existing `/src/lib/supabase.ts` file (lines 1-491) defines:
- `Database` type with `public.Tables` containing: `account_users`, `accounts`, `admin_users`, `properties`, `property_types`, `users`, `item_links`, `item_articles`, `items`, `item_visits`, `item_reactions`, `mailing_list_subscribers`

**Missing from current types:**
- All translation tables (to be created in Epic 1)
- Translation status enum types
- Source language columns
- Preferred language columns
- Source version tracking columns

### Required Additions

Based on the Implementation Plan and database schema from Epic 1/Epic 5:

#### 1. Supported Language Type
```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

#### 2. Translation Status Enum
```typescript
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
```

#### 3. Translation Tables (4 tables)
- `article_translations`
- `item_translations`
- `link_translations`
- `tag_translations`

#### 4. Translation Jobs Table
- `translation_jobs`

#### 5. Column Additions to Existing Tables
- `accounts.preferred_language`
- `users.preferred_language`
- `items.source_language`
- `item_articles.source_language`
- `item_links.source_language`

---

## Ordered Implementation Tasks

### Task 1: Add Translation Type Definitions (Top of File)

**Location:** After `export type Json = ...` declaration (~line 11)

Add the following type definitions:

```typescript
// L10N: Supported language codes for translation
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// L10N: Translation status values
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
```

---

### Task 2: Add Translation Tables to Database Type

**Location:** Inside `Database.public.Tables` object (after line 449, before `Views`)

Add the following table definitions:

#### 2.1 `article_translations` Table

```typescript
article_translations: {
  Row: {
    id: string
    article_id: string
    language: string
    title: string | null
    description: string | null
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null
    source_version_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    article_id: string
    language: string
    title?: string | null
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    article_id?: string
    language?: string
    title?: string | null
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    source_version_at?: string | null
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

#### 2.2 `item_translations` Table

```typescript
item_translations: {
  Row: {
    id: string
    item_id: string
    language: string
    name: string | null
    description: string | null
    translation_status: string
    translated_at: string | null
    source_version_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    item_id: string
    language: string
    name?: string | null
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    source_version_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    item_id?: string
    language?: string
    name?: string | null
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    source_version_at?: string | null
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

#### 2.3 `link_translations` Table

```typescript
link_translations: {
  Row: {
    id: string
    link_id: string
    language: string
    title: string | null
    translation_status: string
    translated_at: string | null
    source_version_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    link_id: string
    language: string
    title?: string | null
    translation_status?: string
    translated_at?: string | null
    source_version_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    link_id?: string
    language?: string
    title?: string | null
    translation_status?: string
    translated_at?: string | null
    source_version_at?: string | null
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

#### 2.4 `tag_translations` Table (System Tags)

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    tag_key: string
    language: string
    translated_value: string
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    tag_key?: string
    language?: string
    translated_value?: string
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: []
}
```

#### 2.5 `translation_jobs` Table

```typescript
translation_jobs: {
  Row: {
    id: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status: string
    priority: number
    attempts: number
    max_attempts: number
    error_message: string | null
    queued_at: string
    started_at: string | null
    completed_at: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status?: string
    priority?: number
    attempts?: number
    max_attempts?: number
    error_message?: string | null
    queued_at?: string
    started_at?: string | null
    completed_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    entity_type?: string
    entity_id?: string
    source_language?: string
    target_language?: string
    status?: string
    priority?: number
    attempts?: number
    max_attempts?: number
    error_message?: string | null
    queued_at?: string
    started_at?: string | null
    completed_at?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: []
}
```

---

### Task 3: Update Existing Table Types with L10N Columns

#### 3.1 Update `accounts` Table

**Location:** `accounts` table definition (~lines 50-78)

Add to `Row`:
```typescript
preferred_language: string | null
```

Add to `Insert`:
```typescript
preferred_language?: string | null
```

Add to `Update`:
```typescript
preferred_language?: string | null
```

#### 3.2 Update `users` Table

**Location:** `users` table definition (~lines 186-212)

Add to `Row`:
```typescript
preferred_language: string | null
```

Add to `Insert`:
```typescript
preferred_language?: string | null
```

Add to `Update`:
```typescript
preferred_language?: string | null
```

#### 3.3 Update `items` Table

**Location:** `items` table definition (~lines 306-349)

Add to `Row`:
```typescript
source_language: string | null
```

Add to `Insert`:
```typescript
source_language?: string | null
```

Add to `Update`:
```typescript
source_language?: string | null
```

#### 3.4 Update `item_articles` Table

**Location:** `item_articles` table definition (~lines 265-305)

Add to `Row`:
```typescript
source_language: string | null
```

Add to `Insert`:
```typescript
source_language?: string | null
```

Add to `Update`:
```typescript
source_language?: string | null
```

#### 3.5 Update `item_links` Table

**Location:** `item_links` table definition (~lines 213-263)

Add to `Row`:
```typescript
source_language: string | null
```

Add to `Insert`:
```typescript
source_language?: string | null
```

Add to `Update`:
```typescript
source_language?: string | null
```

---

### Task 4: Update `/src/types/index.ts` with L10N Type Exports

**Location:** `/src/types/index.ts`

Add the following exports and types:

```typescript
// L10N: Translation types
export type { SupportedLanguage, TranslationStatus } from '@/lib/supabase';

// L10N: Translation status item for API responses
export interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: TranslationStatus;
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}

// L10N: Translation status summary
export interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

// L10N: Translation status API response
export interface TranslationStatusResponse {
  summary: TranslationStatusSummary;
  items: TranslationStatusItem[];
}
```

---

## Authorized Files and Functions for Modification

| File Path | Modification Type | Specific Changes |
|-----------|-------------------|------------------|
| `/src/lib/supabase.ts` | Update | Add `SupportedLanguage` type, `TranslationStatus` type, translation table definitions, update existing table types with L10N columns |
| `/src/types/index.ts` | Update | Export translation types, add translation API response interfaces |

---

## Validation Criteria

1. **TypeScript Compiler Validation**
   - `npm run build` completes without type errors
   - No errors when importing translation types in other files

2. **Autocomplete Verification**
   - When typing `supabase.from('article_translations')`, IDE provides autocomplete
   - When accessing `.source_language` on items, IDE recognizes the field

3. **Type Safety**
   - Attempting to insert invalid `translation_status` value shows type error
   - Attempting to use unsupported language code shows type error

---

## Dependencies

### Prerequisite Migrations (from Epic 1 & REQ-307)

The following database changes must be applied before these types are useful:

1. **Epic 1 Migrations:**
   - Create `article_translations` table
   - Create `item_translations` table
   - Create `link_translations` table
   - Create `tag_translations` table
   - Create `translation_jobs` table
   - Add `source_language` columns to `items`, `item_articles`, `item_links`
   - Add `preferred_language` columns to `accounts`, `users`

2. **REQ-307 Migration:**
   - Add `source_version_at` columns to all translation tables

**Note:** Types can be added proactively before migrations are applied. TypeScript types serve as documentation and will be validated once the database schema matches.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Types don't match actual schema | Medium | Medium | Cross-reference with Epic 1 implementation plan |
| Missing column in type definition | Low | Low | Review against Supabase MCP `list_tables` output after migrations |
| Type naming conflicts | Low | Low | Use consistent `L10N:` comment prefix for new types |

---

## Estimation

- **Effort:** 1-2 hours
- **Complexity:** Low
- **Confidence:** High

This task primarily involves copying well-defined structures into the types file and follows established patterns already present in the codebase.

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-308)
- **Epic 1 Foundation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Current Supabase Types:** `/src/lib/supabase.ts`
- **Application Types:** `/src/types/index.ts`
