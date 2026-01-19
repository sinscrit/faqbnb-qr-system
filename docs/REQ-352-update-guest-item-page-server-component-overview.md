# REQ-352: Update Guest Item Page with Localization Support - Implementation Overview

**Document Created:** 2026-01-19
**Document Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** L
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.1
**Epic:** L10N Epic 4 - Guest Experience

---

## Summary

Update the guest-facing item detail page (`/src/app/item/[publicId]/page.tsx`) to detect the guest's preferred language and display item content with appropriate translations, including metadata for search engine optimization.

---

## Current Behavior

The guest item page currently:
1. Fetches item data from `/api/items/[publicId]` without translation support
2. Passes raw item data to `ItemDisplay` client component
3. Generates SEO metadata using original item name and description only
4. Does not detect or respect guest language preferences
5. Does not read `?lang=` URL parameter for shareable translated links

---

## Expected Behavior

The updated guest item page will:
1. Detect guest language from priority cascade: URL param (`?lang=`) > Cookie (`FAQBNB_LANG`) > Accept-Language header > default (`en`)
2. Fetch item data with translations for the detected language
3. Pass translation metadata to client component for language switching UI
4. Generate SEO metadata using translated title/description when available
5. Support shareable links with `?lang=` parameter for direct language access

---

## Dependencies

### From Epic 1 (Foundation) - Already Implemented
| Dependency | Location | Status |
|------------|----------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Available |
| i18n Configuration | `/src/lib/i18n/config.ts` | Available |
| Supported Languages Config | `/src/lib/i18n/config.ts` (`SUPPORTED_LOCALES`) | Available |
| Cookie Name Constant | `FAQBNB_LANG` | Available |

### From Epic 3 (Dynamic Content Translation) - Expected
| Dependency | Location | Status |
|------------|----------|--------|
| `item_translations` table | Database | Available (schema exists) |
| `article_translations` table | Database | Available (schema exists) |
| `link_translations` table | Database | Available (schema exists) |
| `tag_translations` table | Database | Available (schema exists) |

### New Files Created by This Task
| File | Purpose |
|------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest-specific language detection and utilities |
| `/src/lib/translations/fetch-translations.ts` | Fetch translated content from database |

---

## Technical Approach

### Language Detection Flow

```
Guest Request → /item/[publicId]?lang=fr
                        │
                        ▼
         ┌──────────────────────────────┐
         │  1. Check ?lang= URL param   │ ← Highest priority (shareable links)
         │  2. Check FAQBNB_LANG cookie │ ← User preference
         │  3. Parse Accept-Language    │ ← Browser default
         │  4. Default to 'en'          │ ← Fallback
         └──────────────────────────────┘
                        │
                        ▼
         Detect valid SupportedLocale
                        │
                        ▼
         Fetch item + translations for locale
```

### Data Fetching Strategy

The page will fetch:
1. **Item data** - Original content from `items` table
2. **Item translation** - From `item_translations` for detected language
3. **Article translations** - From `article_translations` for all articles
4. **Link translations** - From `link_translations` for all links
5. **Available translations** - Query to determine which languages have completed translations

### Translation Merge Logic

```typescript
// Merge original content with translation
const displayContent = {
  name: translation?.name || original.name,
  description: translation?.description || original.description,
  // Keep original for "View Original" toggle
  originalName: original.name,
  originalDescription: original.description,
  // Translation metadata
  isTranslated: !!translation && translation.translation_status === 'completed',
  sourceLanguage: original.source_language || 'en',
  displayLanguage: detectedLanguage,
};
```

### SEO Metadata Generation

Metadata will use translated content when available:
- `title`: Translated item name (or original if no translation)
- `description`: Translated item description (or original)
- `og:title`, `og:description`: Same translated content
- Canonical URL: Without `?lang=` parameter (language is user preference)

---

## Implementation Tasks

### Task 5.1.1: Create Guest Language Detection Utility
**File:** `/src/lib/i18n/guest-language.ts`

Create a utility module for guest-specific language detection that works with both URL parameters and server-side requests.

```typescript
// Exports to implement:
export function detectGuestLanguage(
  searchParams: { lang?: string },
  request?: NextRequest
): Promise<SupportedLocale>;

export function getGuestLanguageFromCookie(
  cookieStore: ReadonlyRequestCookies
): SupportedLocale | null;

export function parseUrlLangParam(
  lang: string | undefined
): SupportedLocale | null;
```

### Task 5.1.2: Create Translation Fetch Utilities
**File:** `/src/lib/translations/fetch-translations.ts`

Create utilities to fetch and merge translations from the database.

```typescript
// Exports to implement:
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLocale
): Promise<TranslatedItemResponse>;

export async function getAvailableTranslations(
  itemId: string
): Promise<SupportedLocale[]>;
```

### Task 5.1.3: Update Page Component for Language Detection
**File:** `/src/app/item/[publicId]/page.tsx`

Update the server component to:
1. Accept `searchParams` for `?lang=` parameter
2. Call `detectGuestLanguage()` to determine display language
3. Fetch item data with translations
4. Pass translation metadata to `ItemDisplay`

### Task 5.1.4: Update Metadata Generation for SEO
**File:** `/src/app/item/[publicId]/page.tsx`

Update `generateMetadata()` to:
1. Detect language from searchParams
2. Fetch translated metadata
3. Use translated title/description in metadata
4. Set canonical URL without language parameter

### Task 5.1.5: Define Translation Response Types
**File:** `/src/types/index.ts` or `/src/types/l10n.ts`

Add types for translation responses:

```typescript
export interface TranslatedItemResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  translationMeta: TranslationMetadata;
}

export interface TranslationMetadata {
  requestedLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  sourceLanguage: SupportedLocale;
  isShowingTranslation: boolean;
  availableTranslations: SupportedLocale[];
}
```

---

## Authorized Files and Functions for Modification

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest-specific language detection utilities |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch and merge utilities |
| `/src/lib/translations/index.ts` | Barrel exports for translation module |

### Files to Modify
| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `/src/app/item/[publicId]/page.tsx` | `ItemPage`, `generateMetadata`, `PageProps` interface |
| `/src/types/index.ts` | Add exports for translation types |

### Database Tables (Read-Only)
| Table | Access Pattern |
|-------|----------------|
| `items` | SELECT by `public_id`, read `source_language` |
| `item_translations` | SELECT by `item_id` + `language`, filter by `translation_status = 'completed'` |
| `item_articles` | SELECT by `item_id` |
| `article_translations` | SELECT by `article_id` + `language` |
| `item_links` | SELECT by `item_id` or `article_id` |
| `link_translations` | SELECT by `link_id` + `language` |

---

## Code Examples

### Updated Page Props Interface

```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

### Updated Page Component

```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang } = await searchParams;

  // Detect guest language from URL param, cookie, or headers
  const detectedLanguage = await detectGuestLanguage({ lang });

  // Fetch item with translations
  const itemData = await fetchTranslatedItem(publicId, detectedLanguage);

  if (!itemData) {
    notFound();
  }

  return (
    <ItemDisplay
      item={itemData.item}
      articles={itemData.articles}
      translationMeta={itemData.translationMeta}
    />
  );
}
```

### Updated Metadata Generation

```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang } = await searchParams;

  const detectedLanguage = await detectGuestLanguage({ lang });
  const itemData = await fetchTranslatedItem(publicId, detectedLanguage);

  if (!itemData) {
    return { title: 'Item Not Found' };
  }

  const { item, translationMeta } = itemData;

  return {
    metadataBase: new URL(process.env.NODE_ENV === 'production'
      ? 'https://faqbnb.com'
      : 'http://localhost:3000'),
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
}
```

---

## Testing Scenarios

### Language Detection Tests
1. **URL Parameter**: Access `/item/abc123?lang=fr` → should display French content
2. **Cookie Preference**: Set `FAQBNB_LANG=de`, access without param → should display German
3. **Accept-Language**: Browser set to Spanish, no cookie/param → should display Spanish
4. **Invalid Language**: Access with `?lang=xyz` → should fallback to English
5. **Missing Translation**: Request German when only French exists → should show original with banner

### SEO Metadata Tests
1. Verify translated title appears in `<title>` tag
2. Verify translated description in meta description
3. Verify OpenGraph tags use translated content
4. Verify canonical URL excludes `?lang=` parameter
5. Verify `og:locale` matches display language

### Edge Cases
1. Item has no translations at all → show original content
2. Translation exists but status is 'pending' → show original
3. Translation exists but status is 'failed' → show original
4. Partial translation (name only, no description) → show translated name, original description

---

## Performance Considerations

1. **Single Query Approach**: Use JOINs to fetch item + translation in one query when possible
2. **Caching**: Leverage Next.js `revalidate` for ISR on translated content
3. **Early Exit**: If requested language equals source language, skip translation fetch
4. **Index Usage**: Ensure queries use indexes on `(item_id, language)` composite key

---

## Rollback Plan

If issues arise:
1. Revert changes to `/src/app/item/[publicId]/page.tsx`
2. New utility files in `/src/lib/` can be deleted without impact
3. Database translation tables are read-only, no schema changes needed

---

## Related Documents

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Request Source:** `/docs/gen_requests_epic4.md` (REQ-352)

---

## Acceptance Criteria

- [ ] Guest item page detects language from `?lang=` URL parameter
- [ ] Guest item page respects `FAQBNB_LANG` cookie when no URL param
- [ ] Guest item page falls back to Accept-Language header
- [ ] Guest item page defaults to English when no preference detected
- [ ] Translated content displays when available and status is 'completed'
- [ ] Original content displays when translation unavailable
- [ ] SEO metadata uses translated title and description
- [ ] Canonical URL does not include language parameter
- [ ] Translation metadata passed to client component for UI
- [ ] No regression in page load performance (< 200ms additional latency)
