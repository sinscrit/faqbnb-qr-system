# REQ-352: Update Guest Item Page with Localization Support - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Document Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** L (Large)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.1
**Epic:** L10N Epic 4 - Guest Experience
**Status:** Ready for Implementation

---

## Overview

This document provides a detailed, actionable task breakdown for updating the guest-facing item detail page (`/src/app/item/[publicId]/page.tsx`) to support localization. The implementation enables automatic language detection, displays translated content when available, and generates SEO-optimized metadata in the guest's preferred language.

**Reference Documents:**
- Overview: `/docs/REQ-352-update-guest-item-page-server-component-overview.md`
- Requirements: `/docs/gen_requests_epic4.md` (REQ-352)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Prerequisites

Before starting implementation, verify the following dependencies are available:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| i18n Config Module | `/src/lib/i18n/config.ts` | File exists with `SUPPORTED_LOCALES`, `SupportedLocale` exports |
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | File exists with `detectUserLanguage` export |
| `item_translations` table | Database | `SELECT * FROM item_translations LIMIT 1;` |
| `article_translations` table | Database | `SELECT * FROM article_translations LIMIT 1;` |
| `link_translations` table | Database | `SELECT * FROM link_translations LIMIT 1;` |

---

## Task Breakdown

### Task 5.1.1: Create Guest Language Detection Utility

**Story Points:** 1
**File:** `/src/lib/i18n/guest-language.ts` (NEW)

Create a specialized utility module for detecting guest language preferences in server components. This module provides functions to detect language from URL parameters, cookies, and Accept-Language headers.

#### Subtasks

1. **Create the file** `/src/lib/i18n/guest-language.ts`

2. **Add type imports and constants:**
   ```typescript
   import { cookies, headers } from 'next/headers';
   import {
     SupportedLocale,
     DEFAULT_LOCALE,
     LOCALE_COOKIE_NAME,
     isSupportedLocale,
   } from './config';
   ```

3. **Implement `parseUrlLangParam` function:**
   - Input: `lang: string | undefined`
   - Output: `SupportedLocale | null`
   - Validates URL `?lang=` parameter against supported locales
   - Returns null for invalid/unsupported languages

4. **Implement `getGuestLanguageFromCookie` function:**
   - Input: None (reads from `cookies()` API)
   - Output: `SupportedLocale | null`
   - Reads `FAQBNB_LANG` cookie value
   - Validates against supported locales

5. **Implement `getLanguageFromAcceptHeader` function:**
   - Input: None (reads from `headers()` API)
   - Output: `SupportedLocale | null`
   - Parses Accept-Language header
   - Returns first matching supported locale

6. **Implement main `detectGuestLanguage` function:**
   ```typescript
   export async function detectGuestLanguage(
     searchParams: { lang?: string }
   ): Promise<SupportedLocale>
   ```
   - Priority cascade: URL param > Cookie > Accept-Language > DEFAULT_LOCALE
   - Returns valid `SupportedLocale` (never null)

7. **Add JSDoc documentation for all exported functions**

#### Acceptance Criteria
- [ ] Function `parseUrlLangParam` returns valid locale or null
- [ ] Function `getGuestLanguageFromCookie` reads cookie and validates
- [ ] Function `getLanguageFromAcceptHeader` parses header correctly
- [ ] Function `detectGuestLanguage` follows priority cascade
- [ ] All functions are type-safe with proper TypeScript types
- [ ] Invalid language codes return null (not throw)
- [ ] Module includes inline documentation

---

### Task 5.1.2: Create Translation Fetch Utilities

**Story Points:** 2
**File:** `/src/lib/translations/fetch-translations.ts` (NEW)
**File:** `/src/lib/translations/index.ts` (NEW)

Create utility functions to fetch translated content from the database and merge it with original content.

#### Subtasks

1. **Create directory** `/src/lib/translations/` if it doesn't exist

2. **Create the file** `/src/lib/translations/fetch-translations.ts`

3. **Add imports:**
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { SupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
   ```

4. **Define return types:**
   ```typescript
   export interface TranslatedItemData {
     id: string;
     publicId: string;
     name: string;
     description: string | null;
     sourceLanguage: SupportedLocale;
     originalName: string;
     originalDescription: string | null;
     isTranslated: boolean;
     translationStatus: 'completed' | 'pending' | 'failed' | null;
   }

   export interface TranslatedArticleData {
     id: string;
     title: string;
     description: string | null;
     purpose: string;
     displayOrder: number;
     originalTitle: string;
     originalDescription: string | null;
     isTranslated: boolean;
     links: TranslatedLinkData[];
   }

   export interface TranslatedLinkData {
     id: string;
     title: string;
     linkType: string;
     url: string;
     thumbnailUrl: string | null;
     displayOrder: number;
     originalTitle: string;
     isTranslated: boolean;
   }

   export interface TranslationMetadata {
     requestedLanguage: SupportedLocale;
     displayLanguage: SupportedLocale;
     sourceLanguage: SupportedLocale;
     isShowingTranslation: boolean;
     availableTranslations: SupportedLocale[];
   }

   export interface TranslatedItemResponse {
     item: TranslatedItemData;
     articles: TranslatedArticleData[];
     translationMeta: TranslationMetadata;
   }
   ```

5. **Implement `fetchItemWithTranslation` function:**
   ```typescript
   async function fetchItemWithTranslation(
     publicId: string,
     language: SupportedLocale
   ): Promise<{ item: any; translation: any | null } | null>
   ```
   - Query `items` by `public_id`
   - LEFT JOIN `item_translations` WHERE language matches AND status = 'completed'
   - Return both original and translation data

6. **Implement `fetchArticlesWithTranslations` function:**
   ```typescript
   async function fetchArticlesWithTranslations(
     itemId: string,
     language: SupportedLocale
   ): Promise<{ articles: any[]; translations: any[] }>
   ```
   - Query `item_articles` by `item_id`
   - Query `article_translations` for all article IDs where language matches
   - Return both original and translation data

7. **Implement `fetchLinksWithTranslations` function:**
   ```typescript
   async function fetchLinksWithTranslations(
     itemId: string,
     language: SupportedLocale
   ): Promise<{ links: any[]; translations: any[] }>
   ```
   - Query `item_links` by `item_id`
   - Query `link_translations` for all link IDs where language matches
   - Return both original and translation data

8. **Implement `getAvailableTranslations` function:**
   ```typescript
   export async function getAvailableTranslations(
     itemId: string
   ): Promise<SupportedLocale[]>
   ```
   - Query distinct languages from `item_translations` WHERE status = 'completed'
   - Return array of available locale codes

9. **Implement main `fetchTranslatedItem` function:**
   ```typescript
   export async function fetchTranslatedItem(
     publicId: string,
     language: SupportedLocale
   ): Promise<TranslatedItemResponse | null>
   ```
   - Orchestrate all fetch functions
   - Merge translations with original content
   - Build `TranslationMetadata` object
   - Handle case where item doesn't exist (return null)

10. **Create barrel export** `/src/lib/translations/index.ts`:
    ```typescript
    export * from './fetch-translations';
    ```

#### Acceptance Criteria
- [ ] Function fetches item by public_id correctly
- [ ] Function merges translation with original when available
- [ ] Function falls back to original content when no translation
- [ ] Function only uses translations with status 'completed'
- [ ] Available translations query returns correct locales
- [ ] Returns null for non-existent items
- [ ] All types are properly defined and exported
- [ ] Database queries use proper JOINs for efficiency

---

### Task 5.1.3: Define Translation Response Types

**Story Points:** 1
**File:** `/src/types/index.ts` (MODIFY)

Add type exports for translation-related interfaces to the central types file.

#### Subtasks

1. **Read existing** `/src/types/index.ts` to understand structure

2. **Add import/export for translation types:**
   ```typescript
   // Translation types (REQ-352)
   export type {
     TranslatedItemData,
     TranslatedArticleData,
     TranslatedLinkData,
     TranslationMetadata,
     TranslatedItemResponse,
   } from '@/lib/translations/fetch-translations';
   ```

3. **Add `ItemDisplayWithTranslationProps` interface:**
   ```typescript
   export interface ItemDisplayWithTranslationProps extends ItemDisplayProps {
     translationMeta?: TranslationMetadata;
   }
   ```

#### Acceptance Criteria
- [ ] Translation types are exported from `/src/types/index.ts`
- [ ] No duplicate type definitions
- [ ] Types can be imported using `@/types`
- [ ] No breaking changes to existing type exports

---

### Task 5.1.4: Update Page Props Interface

**Story Points:** 0.5
**File:** `/src/app/item/[publicId]/page.tsx` (MODIFY)

Update the page component's props interface to accept `searchParams` for the language parameter.

#### Subtasks

1. **Update `PageProps` interface:**
   ```typescript
   interface PageProps {
     params: Promise<{ publicId: string }>;
     searchParams: Promise<{ lang?: string }>;
   }
   ```

2. **Update function signatures** to accept new props:
   - `generateMetadata({ params, searchParams }: PageProps)`
   - `ItemPage({ params, searchParams }: PageProps)`

#### Acceptance Criteria
- [ ] PageProps interface includes searchParams
- [ ] searchParams is typed as `Promise<{ lang?: string }>`
- [ ] Both generateMetadata and ItemPage accept searchParams
- [ ] Existing functionality not broken

---

### Task 5.1.5: Implement Language Detection in Page Component

**Story Points:** 1
**File:** `/src/app/item/[publicId]/page.tsx` (MODIFY)

Add language detection logic to the server component.

#### Subtasks

1. **Add imports:**
   ```typescript
   import { detectGuestLanguage } from '@/lib/i18n/guest-language';
   import { fetchTranslatedItem } from '@/lib/translations';
   ```

2. **Update `ItemPage` function to detect language:**
   ```typescript
   export default async function ItemPage({ params, searchParams }: PageProps) {
     const { publicId } = await params;
     const { lang } = await searchParams;

     // Detect guest language from URL param, cookie, or headers
     const detectedLanguage = await detectGuestLanguage({ lang });

     // ... existing code
   }
   ```

3. **Replace API fetch with translation-aware fetch:**
   - Replace `fetch(\`${process.env.NEXTAUTH_URL}/api/items/${publicId}\`)`
   - With `fetchTranslatedItem(publicId, detectedLanguage)`

4. **Update component rendering:**
   ```typescript
   if (!itemData) {
     notFound();
   }

   return (
     <ItemDisplay
       item={transformToItemDisplayFormat(itemData.item, itemData.articles)}
       // translationMeta will be used in future task for UI components
     />
   );
   ```

5. **Create helper function to transform data:**
   ```typescript
   function transformToItemDisplayFormat(
     item: TranslatedItemData,
     articles: TranslatedArticleData[]
   ): ItemResponse['data']
   ```
   - Maps translation-aware data to existing ItemDisplay format
   - Preserves backward compatibility

#### Acceptance Criteria
- [ ] Language is detected before fetching item
- [ ] `?lang=` URL parameter is read correctly
- [ ] Translation-aware fetch is used instead of API call
- [ ] 404 returned when item doesn't exist
- [ ] Data is transformed to match ItemDisplay expectations
- [ ] No errors when translation doesn't exist

---

### Task 5.1.6: Update Metadata Generation for SEO

**Story Points:** 1
**File:** `/src/app/item/[publicId]/page.tsx` (MODIFY)

Update the `generateMetadata` function to use translated content for SEO.

#### Subtasks

1. **Update `generateMetadata` to detect language:**
   ```typescript
   export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
     const { publicId } = await params;
     const { lang } = await searchParams;

     const detectedLanguage = await detectGuestLanguage({ lang });
     const itemData = await fetchTranslatedItem(publicId, detectedLanguage);

     if (!itemData) {
       return { title: 'Item Not Found' };
     }

     // ... generate metadata
   }
   ```

2. **Generate translated metadata:**
   ```typescript
   const { item, translationMeta } = itemData;

   return {
     metadataBase: new URL(
       process.env.NODE_ENV === 'production'
         ? 'https://faqbnb.com'
         : 'http://localhost:3000'
     ),
     title: `${item.name} - FAQBNB`,
     description: item.description || `View instructions and resources for ${item.name}`,
     openGraph: {
       title: item.name,
       description: item.description || `View instructions and resources for ${item.name}`,
       type: 'website',
       locale: translationMeta.displayLanguage,
     },
     alternates: {
       canonical: `/item/${publicId}`, // No ?lang= in canonical
     },
   };
   ```

3. **Remove demo data fallback for metadata** (translation fetch handles this)

#### Acceptance Criteria
- [ ] Metadata uses translated item name when available
- [ ] Metadata uses translated description when available
- [ ] OpenGraph locale matches display language
- [ ] Canonical URL does NOT include `?lang=` parameter
- [ ] Fallback to original content when no translation
- [ ] Error handling for non-existent items

---

### Task 5.1.7: Add Error Handling and Edge Cases

**Story Points:** 0.5
**File:** `/src/app/item/[publicId]/page.tsx` (MODIFY)

Ensure robust error handling for translation-related edge cases.

#### Subtasks

1. **Handle database connection errors:**
   ```typescript
   try {
     const itemData = await fetchTranslatedItem(publicId, detectedLanguage);
     // ...
   } catch (error) {
     console.error('Error fetching translated item:', error);
     // Fallback to demo data or show error page
   }
   ```

2. **Handle partial translations:**
   - Name translated but description not → show translated name, original description
   - Translation pending → show original with appropriate status

3. **Handle invalid language codes:**
   - `?lang=invalid` → falls back to default detection
   - `?lang=` (empty) → treated as no parameter

4. **Log translation detection for debugging:**
   ```typescript
   console.log('[ItemPage] Language detection:', {
     urlParam: lang,
     detected: detectedLanguage,
     isTranslated: itemData?.translationMeta.isShowingTranslation,
   });
   ```

#### Acceptance Criteria
- [ ] Database errors don't crash the page
- [ ] Partial translations render correctly
- [ ] Invalid language codes handled gracefully
- [ ] Debugging logs available in development
- [ ] No internal error details exposed to guests

---

### Task 5.1.8: Update Module Exports

**Story Points:** 0.5
**File:** `/src/lib/i18n/index.ts` (MODIFY)

Ensure the new guest language utility is exported from the i18n module.

#### Subtasks

1. **Read existing** `/src/lib/i18n/index.ts`

2. **Add export for guest-language module:**
   ```typescript
   export * from './guest-language';
   ```

3. **Verify no naming conflicts** with existing exports

#### Acceptance Criteria
- [ ] `detectGuestLanguage` accessible via `@/lib/i18n`
- [ ] No naming conflicts with existing exports
- [ ] All guest-language functions exported

---

## Implementation Order

Execute tasks in this order to minimize integration issues:

1. **Task 5.1.1** - Guest Language Detection Utility (foundation)
2. **Task 5.1.2** - Translation Fetch Utilities (data layer)
3. **Task 5.1.3** - Define Translation Response Types (types)
4. **Task 5.1.8** - Update Module Exports (cleanup)
5. **Task 5.1.4** - Update Page Props Interface (minimal change)
6. **Task 5.1.5** - Implement Language Detection in Page (core logic)
7. **Task 5.1.6** - Update Metadata Generation for SEO (enhancement)
8. **Task 5.1.7** - Add Error Handling and Edge Cases (robustness)

---

## Testing Checklist

### Unit Tests

- [ ] `parseUrlLangParam` returns correct locale for valid input
- [ ] `parseUrlLangParam` returns null for invalid input
- [ ] `getGuestLanguageFromCookie` reads cookie value correctly
- [ ] `detectGuestLanguage` follows priority cascade
- [ ] `fetchTranslatedItem` returns null for non-existent items
- [ ] `fetchTranslatedItem` merges translations correctly
- [ ] `getAvailableTranslations` returns correct languages

### Integration Tests

- [ ] Page renders with `?lang=fr` URL parameter
- [ ] Page renders with `FAQBNB_LANG` cookie set
- [ ] Page renders with Accept-Language header
- [ ] Page renders with no language preference (defaults to English)
- [ ] Page returns 404 for non-existent item
- [ ] Metadata uses translated content

### Manual Testing Scenarios

1. **URL Parameter Priority:**
   - Set cookie to `de`, access `/item/abc?lang=fr`
   - Expected: French content displayed

2. **Cookie Priority:**
   - No URL param, cookie set to `es`, browser set to German
   - Expected: Spanish content displayed

3. **Accept-Language Priority:**
   - No URL param, no cookie, browser set to Italian
   - Expected: Italian content displayed

4. **Fallback to Default:**
   - No preferences detected
   - Expected: English content displayed

5. **Missing Translation:**
   - Request German for item with only French translation
   - Expected: Original (English) content displayed

6. **SEO Metadata:**
   - View page source for `/item/abc?lang=fr`
   - Expected: `<title>` and `<meta>` tags use French content

---

## Database Queries Reference

### Fetch Item with Translation
```sql
SELECT
  i.id,
  i.public_id,
  i.name,
  i.description,
  i.source_language,
  it.name AS translated_name,
  it.description AS translated_description,
  it.translation_status
FROM items i
LEFT JOIN item_translations it
  ON it.item_id = i.id
  AND it.language = $2
  AND it.translation_status = 'completed'
WHERE i.public_id = $1;
```

### Fetch Available Translations
```sql
SELECT DISTINCT language
FROM item_translations
WHERE item_id = $1
  AND translation_status = 'completed';
```

---

## Rollback Plan

If issues arise after deployment:

1. **Revert page.tsx changes:**
   - Restore original `PageProps` interface
   - Restore original fetch logic (API call)
   - Restore original metadata generation

2. **Keep new utility files:**
   - `/src/lib/i18n/guest-language.ts` can remain (not used)
   - `/src/lib/translations/` can remain (not used)

3. **No database changes needed:**
   - All operations are read-only
   - No schema modifications

---

## Performance Considerations

1. **Query Optimization:**
   - Use composite indexes on `(item_id, language)` in translation tables
   - Avoid N+1 queries by fetching all translations in batch

2. **Caching:**
   - Leverage Next.js ISR with `revalidate: 60` for translated pages
   - Cache available translations list per item

3. **Early Exit:**
   - Skip translation fetch if `detectedLanguage === item.source_language`

---

## Related Files

| File | Purpose | Action |
|------|---------|--------|
| `/src/lib/i18n/guest-language.ts` | Guest language detection | CREATE |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch utilities | CREATE |
| `/src/lib/translations/index.ts` | Barrel exports | CREATE |
| `/src/app/item/[publicId]/page.tsx` | Guest item page | MODIFY |
| `/src/types/index.ts` | Type exports | MODIFY |
| `/src/lib/i18n/index.ts` | i18n module exports | MODIFY |

---

## Acceptance Criteria Summary

From REQ-352 requirements document:

- [x] Server component detects language from URL parameter (highest priority)
- [x] Server component checks cookie for language preference when URL parameter is absent
- [x] Server component examines Accept-Language headers when URL and cookie are absent
- [x] Server component defaults to English when no language preference is detected
- [x] Server component fetches item record from database by public ID
- [x] Server component fetches translation records for detected language and item ID
- [x] Server component passes translation status metadata to client components
- [x] Server component passes both source content and translated content to client components
- [x] Page metadata function generates title tag using translated item title when available
- [x] Page metadata function generates description meta tag using translated description when available
- [x] Page metadata function generates Open Graph title using translated content when available
- [x] Page metadata function generates Open Graph description using translated content when available
- [x] Metadata falls back to source language content when translations are missing
- [ ] Metadata includes language code in HTML lang attribute matching detected language (Future: requires layout.tsx change)
- [x] Server component handles cases where item does not exist with appropriate 404 response
- [x] Server component handles database errors gracefully without exposing internal details
- [x] Translation fetch queries use proper joins to retrieve related translation records
- [x] Server component validates language codes against supported language list
- [x] Page renders successfully when translations are partial or missing
- [x] TypeScript types properly define the shape of data passed from server to client components

---

## Notes for Implementation

1. **Cookie Name:** Use `FAQBNB_LANG` (matches Epic 1 convention, not `FAQBNB_GUEST_LANG` as mentioned in some docs)

2. **Supabase Client:** Use server-side Supabase client for database queries

3. **Demo Data Fallback:** Consider removing demo data fallback as translations should come from database

4. **Future Integration:** The `translationMeta` prop prepared in this task will be used by Task 5.2 (ItemDisplay component update) to show translation UI

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience, Phase 5.1*
