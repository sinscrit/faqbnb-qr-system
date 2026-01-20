# Detailed Task Breakdown: REQ-E03-008 - Modify Items API to Trigger Translations

**Request ID:** REQ-E03-008
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.2
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 16:15:00 UTC

---

## Overview

This document provides a granular, step-by-step task breakdown for modifying the Items API endpoints to automatically trigger translation workflows when items are created or updated.

**Reference Documents:**
- Overview: `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`
- Requirements: `/docs/gen_requests_epic3.md` (Request #8)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## Prerequisites

Before starting this task, ensure the following are complete:

- [ ] REQ-E03-001: Content translation module structure exists at `/src/lib/content-translation/`
- [ ] REQ-E03-002: Content translation orchestrator (`queueContentTranslations`) is implemented
- [ ] REQ-E03-005: Translation storage utilities (`deleteEntityTranslations`) are implemented
- [ ] REQ-E03-007: Source language detection utility (`detectSourceLanguage`) is implemented
- [ ] Epic 1 foundation tables exist: `item_translations`, `translation_jobs`
- [ ] `items.source_language` column exists in database

---

## Task Breakdown

### Phase 1: Type Updates (Tasks 1-3)

---

#### Task 1: Extend CreateItemRequest with sourceLanguage

**File:** `/src/types/index.ts`
**Action:** UPDATE
**Lines:** ~310-342

**Current Code (lines 310-342):**
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  articles?: {
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
}
```

**Modified Code:**
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  /**
   * Optional source language for content translation.
   * If not provided, detected from user/account preferences.
   * @see detectSourceLanguage in content-translation module
   */
  sourceLanguage?: SupportedLanguage;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  articles?: {
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
}
```

**Verification:**
- TypeScript compiles without errors
- `sourceLanguage` accepts only valid `SupportedLanguage` values

---

#### Task 2: Add SupportedLanguage Import to Types

**File:** `/src/types/index.ts`
**Action:** UPDATE
**Lines:** ~1-5 (top of file, add to existing imports)

**Note:** Check if `SupportedLanguage` is already exported (lines 673-681 show it's re-exported from LocaleContext). If so, this task is complete. Otherwise, add:

**Modified Code (add near top or verify existing):**
```typescript
// Verify SupportedLanguage is available for use in CreateItemRequest
// It should be exported from LocaleContext at lines 673-681
```

**Verification:**
- `SupportedLanguage` type is accessible within `/src/types/index.ts`
- No circular dependency issues

---

#### Task 3: Extend ItemResponse with Translation Fields

**File:** `/src/types/index.ts`
**Action:** UPDATE
**Lines:** ~125-166

**Current Code (lines 125-166):**
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: {
      id: string;
      articleId?: string;
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
    articles?: {
      id: string;
      purpose: PurposeType;
      title: string;
      description?: string;
      displayOrder: number;
      links: {
        id: string;
        title: string;
        linkType: LinkType;
        url: string;
        thumbnailUrl?: string;
        displayOrder: number;
      }[];
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Modified Code:**
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: {
      id: string;
      articleId?: string;
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
    articles?: {
      id: string;
      purpose: PurposeType;
      title: string;
      description?: string;
      displayOrder: number;
      links: {
        id: string;
        title: string;
        linkType: LinkType;
        url: string;
        thumbnailUrl?: string;
        displayOrder: number;
      }[];
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Empty array if translation queuing was skipped or failed.
   * Present only on POST (create) and PUT (update) operations.
   */
  translationJobIds?: string[];
  /**
   * Languages queued for translation.
   * Excludes source language.
   */
  queuedLanguages?: SupportedLanguage[];
  /**
   * Translation error message if queuing failed.
   * Item creation/update still succeeds even if translation fails.
   */
  translationError?: string;
}
```

**Verification:**
- TypeScript compiles without errors
- New fields are optional (don't break existing code)

---

### Phase 2: POST Handler Modifications (Tasks 4-9)

---

#### Task 4: Add Translation Imports to POST Handler File

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Lines:** ~1-8 (imports section)

**Current Code (lines 1-8):**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
```

**Modified Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse, SupportedLanguage } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import {
  queueContentTranslations,
  detectSourceLanguage
} from '@/lib/content-translation';
```

**Verification:**
- No import errors
- `queueContentTranslations` and `detectSourceLanguage` resolve correctly

---

#### Task 5: Add getAccountPreferredLanguage Helper to POST Handler File

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Location:** After `getAccountContext` function (around line 84)

**New Code to Add:**
```typescript
/**
 * Fetches the account's preferred language setting.
 * Used for source language detection when creating items.
 */
async function getAccountPreferredLanguage(
  supabaseClient: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;

  const { data } = await supabaseClient
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();

  return data?.preferred_language || null;
}
```

**Verification:**
- Function compiles without errors
- Returns `null` when accountId is null
- Returns account's preferred_language when found

---

#### Task 6: Detect Source Language in POST Handler

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Location:** Inside POST handler, after item creation succeeds (around line 434, after `console.log('Item created successfully:', newItem.id);`)

**Code to Add (after line 434):**
```typescript
    // === TRANSLATION INTEGRATION START ===
    // Determine source language for translation
    const accountPreferredLanguage = await getAccountPreferredLanguage(supabase, accountId);
    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: (user as any).preferredLanguage || null },
      account: accountId ? { preferred_language: accountPreferredLanguage } : null,
      override: body.sourceLanguage
    });
    console.log('Source language detected:', sourceLanguage);
```

**Verification:**
- `detectSourceLanguage` is called with correct parameters
- Source language is logged for debugging

---

#### Task 7: Update Item with source_language Column

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Location:** Immediately after Task 6 code

**Code to Add:**
```typescript
    // Update item with source_language
    const { error: sourceLangError } = await supabase
      .from('items')
      .update({ source_language: sourceLanguage })
      .eq('id', newItem.id);

    if (sourceLangError) {
      console.error('Failed to update source_language:', sourceLangError);
      // Non-fatal: continue with translation queuing
    }
```

**Verification:**
- `source_language` column is updated on the item
- Error is logged but doesn't fail the request

---

#### Task 8: Queue Translations in POST Handler

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Location:** Immediately after Task 7 code

**Code to Add:**
```typescript
    // Queue translations for all target languages
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    try {
      const translationResult = await queueContentTranslations({
        content: {
          entityType: 'item',
          entityId: newItem.id,
          sourceLanguage,
          fields: [
            {
              fieldName: 'name',
              value: newItem.name,
              context: { contentType: 'item_name', domainContext: 'property_rental_appliances' },
              maxLength: 255
            },
            {
              fieldName: 'description',
              value: newItem.description || '',
              context: { contentType: 'item_description', domainContext: 'property_rental_appliances' }
            }
          ]
        },
        trigger: 'create'
      });

      if (translationResult.success) {
        translationJobIds = translationResult.jobIds;
        queuedLanguages = translationResult.queuedLanguages;
        console.log('Translation jobs queued:', translationJobIds.length, 'languages:', queuedLanguages);
      } else {
        translationError = translationResult.error;
        console.error('Translation queuing failed:', translationError);
      }
    } catch (error) {
      console.error('Translation queuing error:', error);
      translationError = error instanceof Error ? error.message : 'Unknown translation error';
    }
    // === TRANSLATION INTEGRATION END ===
```

**Verification:**
- Translations are queued with correct entity type and fields
- Errors are caught and stored but don't fail the request
- Job IDs and queued languages are captured

---

#### Task 9: Add Translation Fields to POST Response

**File:** `/src/app/api/admin/items/route.ts`
**Action:** UPDATE
**Location:** Modify the response object (around lines 507-547)

**Current Code (lines 507-547):**
```typescript
    const response = {
      success: true,
      data: {
        id: newItem.id,
        publicId: newItem.public_id,
        name: newItem.name,
        description: newItem.description || '',
        qrCodeUrl: newItem.qr_code_url || undefined,
        qrCodeUploadedAt: newItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
        articles: createdArticle ? [{
          id: createdArticle.id,
          purpose: createdArticle.purpose,
          title: createdArticle.title,
          description: createdArticle.description,
          displayOrder: createdArticle.display_order || 0,
          createdAt: createdArticle.created_at,
          updatedAt: createdArticle.updated_at,
          links: createdLinks.map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order || 0,
          }))
        }] : [],
      },
      accountContext: {
        accountId,
        accountRole
      }
    };
```

**Modified Code:**
```typescript
    const response = {
      success: true,
      data: {
        id: newItem.id,
        publicId: newItem.public_id,
        name: newItem.name,
        description: newItem.description || '',
        qrCodeUrl: newItem.qr_code_url || undefined,
        qrCodeUploadedAt: newItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
        articles: createdArticle ? [{
          id: createdArticle.id,
          purpose: createdArticle.purpose,
          title: createdArticle.title,
          description: createdArticle.description,
          displayOrder: createdArticle.display_order || 0,
          createdAt: createdArticle.created_at,
          updatedAt: createdArticle.updated_at,
          links: createdLinks.map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order || 0,
          }))
        }] : [],
      },
      accountContext: {
        accountId,
        accountRole
      },
      // Translation status fields
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError })
    };
```

**Verification:**
- Response includes `translationJobIds` array
- Response includes `queuedLanguages` array
- Response includes `translationError` only when there was an error

---

### Phase 3: PUT Handler Modifications (Tasks 10-16)

---

#### Task 10: Add Translation Imports to PUT Handler File

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Lines:** ~1-7 (imports section)

**Current Code (lines 1-7):**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
```

**Modified Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse, SupportedLanguage } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
```

**Verification:**
- No import errors
- `deleteEntityTranslations` resolves correctly

---

#### Task 11: Add getAccountPreferredLanguage Helper to PUT Handler File

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Location:** After `validateItemAccess` function (around line 294)

**New Code to Add:**
```typescript
/**
 * Fetches the account's preferred language setting.
 * Used for source language detection when updating items.
 */
async function getAccountPreferredLanguage(
  supabaseClient: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;

  const { data } = await supabaseClient
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();

  return data?.preferred_language || null;
}
```

**Verification:**
- Function compiles without errors
- Same implementation as POST handler helper

---

#### Task 12: Add Translatable Field Change Detection in PUT Handler

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Location:** Inside PUT handler, after item access validation and body parsing (around line 503-504)

**Code to Add (after `const body: UpdateItemRequest = await request.json();`):**
```typescript
    // === TRANSLATION: Detect if translatable fields changed ===
    const translatableFieldsChanged = (
      body.name !== item.name ||
      (body.description || '') !== (item.description || '')
    );
    console.log('Translatable fields changed:', translatableFieldsChanged);
```

**Verification:**
- Correctly detects changes to `name` field
- Correctly detects changes to `description` field
- Handles null/undefined description gracefully

---

#### Task 13: Detect Source Language in PUT Handler

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Location:** Inside PUT handler, after successful item update (around line 639, after `console.log('Item updated successfully:', updatedItem.id);`)

**Code to Add:**
```typescript
    // === TRANSLATION INTEGRATION START ===
    // Determine source language for translation
    const accountPreferredLanguage = await getAccountPreferredLanguage(supabase, accountId);
    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: (user as any).preferredLanguage || null },
      account: accountId ? { preferred_language: accountPreferredLanguage } : null,
      override: (body as any).sourceLanguage
    });
    console.log('Source language detected:', sourceLanguage);

    // Update item with source_language
    const { error: sourceLangError } = await supabase
      .from('items')
      .update({ source_language: sourceLanguage })
      .eq('id', updatedItem.id);

    if (sourceLangError) {
      console.error('Failed to update source_language:', sourceLangError);
      // Non-fatal: continue with translation queuing
    }
```

**Verification:**
- Source language is detected with correct priority
- `source_language` column is updated on the item

---

#### Task 14: Delete Existing Translations and Queue New Ones in PUT Handler

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Location:** Immediately after Task 13 code

**Code to Add:**
```typescript
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    // Only process translations if translatable fields changed
    if (translatableFieldsChanged) {
      try {
        // Delete existing translations for this item
        console.log('Deleting existing translations for item:', updatedItem.id);
        await deleteEntityTranslations('item', updatedItem.id);

        // Queue new translations
        const translationResult = await queueContentTranslations({
          content: {
            entityType: 'item',
            entityId: updatedItem.id,
            sourceLanguage,
            fields: [
              {
                fieldName: 'name',
                value: updatedItem.name,
                context: { contentType: 'item_name', domainContext: 'property_rental_appliances' },
                maxLength: 255
              },
              {
                fieldName: 'description',
                value: updatedItem.description || '',
                context: { contentType: 'item_description', domainContext: 'property_rental_appliances' }
              }
            ]
          },
          trigger: 'update'
        });

        if (translationResult.success) {
          translationJobIds = translationResult.jobIds;
          queuedLanguages = translationResult.queuedLanguages;
          console.log('Translation jobs queued:', translationJobIds.length, 'languages:', queuedLanguages);
        } else {
          translationError = translationResult.error;
          console.error('Translation queuing failed:', translationError);
        }
      } catch (error) {
        console.error('Translation queuing error:', error);
        translationError = error instanceof Error ? error.message : 'Unknown translation error';
      }
    } else {
      console.log('Skipping translation: no translatable fields changed');
    }
    // === TRANSLATION INTEGRATION END ===
```

**Verification:**
- Existing translations are deleted before queuing new ones
- Translations are only queued if translatable fields changed
- Errors are caught and stored but don't fail the request

---

#### Task 15: Add Translation Fields to PUT Response

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Action:** UPDATE
**Location:** Modify the response object (around lines 756-796)

**Current Code (lines 756-796):**
```typescript
    const response = {
      success: true,
      data: {
        id: updatedItem.id,
        publicId: updatedItem.public_id,
        name: updatedItem.name,
        description: updatedItem.description || '',
        qrCodeUrl: updatedItem.qr_code_url || undefined,
        qrCodeUploadedAt: updatedItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
        articles: updatedArticle ? [{
          id: updatedArticle.id,
          purpose: updatedArticle.purpose,
          title: updatedArticle.title,
          description: updatedArticle.description,
          displayOrder: updatedArticle.display_order || 0,
          createdAt: updatedArticle.created_at,
          updatedAt: updatedArticle.updated_at,
          links: createdLinks.map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order || 0,
          }))
        }] : [],
      },
      accountContext: {
        accountId,
        accountRole
      }
    };
```

**Modified Code:**
```typescript
    const response = {
      success: true,
      data: {
        id: updatedItem.id,
        publicId: updatedItem.public_id,
        name: updatedItem.name,
        description: updatedItem.description || '',
        qrCodeUrl: updatedItem.qr_code_url || undefined,
        qrCodeUploadedAt: updatedItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
        articles: updatedArticle ? [{
          id: updatedArticle.id,
          purpose: updatedArticle.purpose,
          title: updatedArticle.title,
          description: updatedArticle.description,
          displayOrder: updatedArticle.display_order || 0,
          createdAt: updatedArticle.created_at,
          updatedAt: updatedArticle.updated_at,
          links: createdLinks.map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order || 0,
          }))
        }] : [],
      },
      accountContext: {
        accountId,
        accountRole
      },
      // Translation status fields
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError })
    };
```

**Verification:**
- Response includes `translationJobIds` array
- Response includes `queuedLanguages` array
- Response includes `translationError` only when there was an error

---

### Phase 4: Verification (Tasks 16-17)

---

#### Task 16: Verify TypeScript Compilation

**Action:** Run build to verify no TypeScript errors

**Command:**
```bash
npm run build
```

**Expected Output:**
- No TypeScript errors related to translation integration
- All imports resolve correctly
- Type definitions are consistent

**Verification Checklist:**
- [ ] No errors in `/src/types/index.ts`
- [ ] No errors in `/src/app/api/admin/items/route.ts`
- [ ] No errors in `/src/app/api/admin/items/[publicId]/route.ts`
- [ ] `SupportedLanguage` type is correctly imported
- [ ] `queueContentTranslations` function signature matches usage
- [ ] `detectSourceLanguage` function signature matches usage
- [ ] `deleteEntityTranslations` function signature matches usage

---

#### Task 17: Manual Testing Verification

**Action:** Test the API endpoints manually

**Test Cases:**

1. **POST - Create Item with Translation:**
   ```bash
   curl -X POST /api/admin/items \
     -H "Content-Type: application/json" \
     -d '{
       "publicId": "<uuid>",
       "name": "Coffee Machine",
       "description": "A simple coffee machine",
       "propertyId": "<property-uuid>",
       "links": []
     }'
   ```
   **Expected Response:**
   - `success: true`
   - `translationJobIds` array with 5 job IDs
   - `queuedLanguages` array with 5 languages (excluding source)

2. **POST - Create Item with sourceLanguage Override:**
   ```bash
   curl -X POST /api/admin/items \
     -H "Content-Type: application/json" \
     -d '{
       "publicId": "<uuid>",
       "name": "Machine a cafe",
       "description": "Une machine a cafe simple",
       "propertyId": "<property-uuid>",
       "sourceLanguage": "fr",
       "links": []
     }'
   ```
   **Expected Response:**
   - Source language should be 'fr'
   - Translation jobs should translate from French

3. **PUT - Update Item with Name Change:**
   ```bash
   curl -X PUT /api/admin/items/<publicId> \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Coffee Machine",
       "description": "A simple coffee machine",
       "propertyId": "<property-uuid>",
       "links": []
     }'
   ```
   **Expected Response:**
   - `translationJobIds` array with 5 job IDs
   - Existing translations should be deleted

4. **PUT - Update Item without Translatable Field Changes:**
   ```bash
   curl -X PUT /api/admin/items/<publicId> \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Coffee Machine",
       "description": "A simple coffee machine",
       "propertyId": "<property-uuid>",
       "qrCodeUrl": "https://example.com/qr.png",
       "links": []
     }'
   ```
   **Expected Response:**
   - `translationJobIds` should be empty array
   - No translation jobs created

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/src/types/index.ts` | Added `sourceLanguage` to `CreateItemRequest`, added translation fields to `ItemResponse` |
| `/src/app/api/admin/items/route.ts` | Added imports, helper function, translation integration in POST handler |
| `/src/app/api/admin/items/[publicId]/route.ts` | Added imports, helper function, translation integration in PUT handler |

---

## Acceptance Criteria Checklist

| Criteria | Task(s) | Status |
|----------|---------|--------|
| POST handler accepts optional sourceLanguage parameter | Task 1 | [ ] |
| POST handler uses language detection utility when not provided | Task 6 | [ ] |
| POST handler calls content translation orchestrator | Task 8 | [ ] |
| POST handler includes translationJobIds in response | Task 9 | [ ] |
| POST handler includes translation error messages if fails | Task 8, 9 | [ ] |
| POST handler completes item creation even if translation fails | Task 8 | [ ] |
| PUT handler identifies when name or description changed | Task 12 | [ ] |
| PUT handler deletes existing translations before update | Task 14 | [ ] |
| PUT handler calls orchestrator after successful update | Task 14 | [ ] |
| PUT handler includes translationJobIds in response | Task 15 | [ ] |
| PUT handler skips translation if translatable fields unchanged | Task 14 | [ ] |
| Both handlers maintain existing response structure | Task 9, 15 | [ ] |
| Both handlers handle orchestrator errors gracefully | Task 8, 14 | [ ] |
| Response type definitions updated | Tasks 1-3 | [ ] |

---

## Error Handling Notes

1. **Translation failures are non-fatal:** Item creation/update always succeeds even if translation queuing fails. Errors are logged and returned in `translationError` field.

2. **Source language update failures are non-fatal:** If updating the `source_language` column fails, the process continues.

3. **Delete translation failures:** If `deleteEntityTranslations` fails in PUT handler, it should be logged but not prevent the new translation queue from being attempted.

---

## Dependencies

This task depends on:
- REQ-E03-001: Module structure (`/src/lib/content-translation/index.ts` exports)
- REQ-E03-002: `queueContentTranslations` function
- REQ-E03-005: `deleteEntityTranslations` function
- REQ-E03-007: `detectSourceLanguage` function

---

## Notes

1. **Backward Compatibility:** All new response fields are optional, so existing API consumers will not break.

2. **Non-Blocking Translation:** Translation queuing is designed to be non-blocking. If translation fails, the item creation/update still succeeds.

3. **Change Detection:** Only `name` and `description` are considered translatable fields. Changes to `tags`, `qrCodeUrl`, `propertyId`, or other fields do not trigger translation re-queuing.

4. **Delete Before Re-translate:** On update, existing translations are deleted before queuing new ones. This ensures guests see source language content while new translations are processing, rather than stale translations.

5. **Account Language Fetching:** The account's `preferred_language` needs to be fetched separately since `getAccountContext` doesn't return it. A helper function handles this.

---

*Document generated for FAQBNB Localization Epic 3 - Request REQ-E03-008*
