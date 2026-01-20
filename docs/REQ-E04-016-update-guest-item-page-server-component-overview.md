# REQ-E04-016: Update Guest Item Page with Translation Support - Implementation Overview

**Request ID:** REQ-E04-016
**Title:** Update Guest Item Page with Translation Support
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Enhance the guest-facing item detail page (`/src/app/item/[publicId]/page.tsx`) to automatically detect the guest's preferred language and display all item content with appropriate translations applied. This is a server component modification that handles language detection, translation fetching, metadata generation, and passes translation context to the client component.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 5: Update Guest Pages, Task 5.1

### Dependencies from Previous Tasks (Epic 4)
| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-002) |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | Required (REQ-E04-004) |
| Public Item API with Translations | `/src/app/api/public/items/[publicId]/route.ts` | Required (REQ-E04-005) |
| Translation Utility Helpers | `/src/lib/translations/translation-utils.ts` | Required (REQ-E04-007) |

### Dependencies from Epic 1 (Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Available |
| i18n Configuration | `/src/lib/i18n/config.ts` | Available |
| Supported Languages Config | `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` | Available |
| Cookie Constants | `LOCALE_COOKIE_NAME` | Available |

### Existing Patterns to Follow
| Pattern | Location | Relevance |
|---------|----------|-----------|
| Current Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Primary file to modify |
| Server Component Metadata | `/src/app/item/[publicId]/page.tsx` | `generateMetadata` async function pattern |
| Language Detection | `/src/lib/i18n/language-detection.ts` | `detectUserLanguage` function |
| ItemDisplay Client Component | `/src/components/ItemDisplay.tsx` | Consumer of translation data |

---

## Technical Specification

### Language Detection Priority (Server-Side)
1. **URL parameter** `?lang=xx` (highest priority - enables shareable links)
2. **Cookie** `FAQBNB_LANG` or `FAQBNB_GUEST_LANG` (persisted preference)
3. **Accept-Language header** (browser preference)
4. **Default** to `'en'` (fallback)

### Data Flow

```
Guest visits /item/[publicId]?lang=fr
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Server Component (page.tsx)          │
    │                                          │
    │  1. Extract publicId and lang param      │
    │  2. Detect language (URL/Cookie/Header)  │
    │  3. Fetch item data                      │
    │  4. Fetch translations for language      │
    │  5. Merge original + translations        │
    │  6. Build translationMeta object         │
    │  7. Pass to ItemDisplay client           │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     generateMetadata (SEO)               │
    │                                          │
    │  - Use translated title if available     │
    │  - Use translated description            │
    │  - Set proper OpenGraph tags             │
    └─────────────────────────────────────────┘
```

### PageProps Interface Update

```typescript
// Updated page props to include searchParams
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

### Translation Metadata Structure

```typescript
// Translation metadata passed to client component
interface TranslationMeta {
  /** Language that was requested (from URL/cookie/header) */
  requestedLanguage: SupportedLanguage;
  /** Language actually being displayed */
  displayLanguage: SupportedLanguage;
  /** Original content language */
  sourceLanguage: SupportedLanguage;
  /** Languages with available translations */
  availableTranslations: SupportedLanguage[];
  /** Whether translated content is being shown */
  isShowingTranslation: boolean;
  /** Translation completeness status */
  translationStatus?: 'complete' | 'partial' | 'missing';
}
```

### Server-Side Language Detection Function

```typescript
// Helper to detect guest language on server
async function detectGuestLanguage(
  searchParams: { lang?: string },
  request: NextRequest
): Promise<SupportedLanguage> {
  // Priority 1: URL parameter
  const urlLang = searchParams.lang;
  if (urlLang && isSupportedLocale(urlLang)) {
    return urlLang as SupportedLanguage;
  }

  // Priority 2: Cookie (read from request)
  const cookieLang = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLang && isSupportedLocale(cookieLang)) {
    return cookieLang as SupportedLanguage;
  }

  // Priority 3: Accept-Language header
  const acceptLang = request.headers.get('Accept-Language');
  if (acceptLang) {
    const parsed = parseAcceptLanguageHeader(acceptLang);
    for (const lang of parsed) {
      if (isSupportedLocale(lang)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // Priority 4: Default
  return DEFAULT_LOCALE;
}
```

---

## Implementation Tasks

### Task 1: Update PageProps Interface
**File:** `/src/app/item/[publicId]/page.tsx`

Add `searchParams` to the PageProps interface to access URL query parameters:
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

### Task 2: Add Import Statements
**File:** `/src/app/item/[publicId]/page.tsx`

Add necessary imports for language detection and translation utilities:
```typescript
import { headers, cookies } from 'next/headers';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n/config';
import { fetchTranslatedItem } from '@/lib/translations/fetch-translations';
import { mergeTranslation, getDisplayLanguage } from '@/lib/translations/translation-utils';
```

### Task 3: Create Server-Side Language Detection Helper
**File:** `/src/app/item/[publicId]/page.tsx`

Implement a helper function within the page file (or import from guest-language.ts):
- Check URL `?lang=` parameter first
- Fall back to cookie value
- Fall back to Accept-Language header parsing
- Default to English

### Task 4: Update `ItemPage` Function to Detect Language
**File:** `/src/app/item/[publicId]/page.tsx`

Modify the main page component to:
1. Extract `lang` from searchParams
2. Call language detection with proper priority
3. Validate detected language against supported locales

```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Detect language using priority cascade
  const detectedLanguage = await detectGuestLanguage(urlLang);
  // ...
}
```

### Task 5: Fetch Item Data with Translations
**File:** `/src/app/item/[publicId]/page.tsx`

Update the data fetching logic to:
1. Fetch base item data (existing pattern)
2. Fetch translation data for detected language
3. Merge original content with translations
4. Handle missing translations gracefully (fallback to original)

```typescript
// Fetch item with translations
const translatedItem = await fetchTranslatedItem(publicId, detectedLanguage);
// or use public API
const response = await fetch(
  `${baseUrl}/api/public/items/${publicId}?lang=${detectedLanguage}`,
  { next: { revalidate: 60 } }
);
```

### Task 6: Build Translation Metadata Object
**File:** `/src/app/item/[publicId]/page.tsx`

Create the translationMeta object to pass to client component:
```typescript
const translationMeta: TranslationMeta = {
  requestedLanguage: detectedLanguage,
  displayLanguage: itemData.translationMeta?.displayLanguage || detectedLanguage,
  sourceLanguage: itemData.sourceLanguage || 'en',
  availableTranslations: itemData.availableTranslations || [],
  isShowingTranslation: detectedLanguage !== itemData.sourceLanguage,
  translationStatus: determineTranslationStatus(itemData),
};
```

### Task 7: Pass Translation Props to ItemDisplay
**File:** `/src/app/item/[publicId]/page.tsx`

Update the ItemDisplay component invocation to include translation data:
```typescript
return (
  <ItemDisplay
    item={translatedItemData}
    translationMeta={translationMeta}
  />
);
```

### Task 8: Update generateMetadata for SEO
**File:** `/src/app/item/[publicId]/page.tsx`

Modify the metadata generation to:
1. Accept searchParams in addition to params
2. Detect language using same priority
3. Use translated title and description when available
4. Add language-specific OpenGraph tags

```typescript
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  const detectedLanguage = await detectGuestLanguage(urlLang);

  // Fetch translated item for metadata
  const response = await fetch(
    `${baseUrl}/api/public/items/${publicId}?lang=${detectedLanguage}`,
    { next: { revalidate: 60 } }
  );

  if (response.ok) {
    const { data: item } = await response.json();
    return {
      title: `${item.name} - FAQBNB`,  // Uses translated name
      description: item.description || `View instructions for ${item.name}`,
      openGraph: {
        title: item.name,
        description: item.description,
        locale: detectedLanguage,
      },
    };
  }
  // ... fallback handling
}
```

### Task 9: Handle Cookie Reading on Server
**File:** `/src/app/item/[publicId]/page.tsx`

Use Next.js `cookies()` function to read the language cookie:
```typescript
import { cookies } from 'next/headers';

async function getLanguageCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE_NAME)?.value;
}
```

### Task 10: Handle Accept-Language Header on Server
**File:** `/src/app/item/[publicId]/page.tsx`

Use Next.js `headers()` function to read Accept-Language:
```typescript
import { headers } from 'next/headers';

async function getAcceptLanguage(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('Accept-Language');
}
```

### Task 11: Error Handling for Missing Translations
**File:** `/src/app/item/[publicId]/page.tsx`

Implement graceful fallback when translations are unavailable:
- If translation fetch fails, use original content
- Set `isShowingTranslation` to false
- Include original sourceLanguage in metadata
- Log translation fetch errors for monitoring

### Task 12: Maintain Backward Compatibility
**File:** `/src/app/item/[publicId]/page.tsx`

Ensure the page works correctly when:
- No `lang` parameter is provided
- Translation utilities are not yet available (Epic 4 phased rollout)
- Demo data fallback still works

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/app/item/[publicId]/page.tsx` | Add language detection, translation fetching, SEO updates |

### Functions to Modify

| File | Function | Modification |
|------|----------|--------------|
| `/src/app/item/[publicId]/page.tsx` | `ItemPage` | Add searchParams, language detection, translation fetching |
| `/src/app/item/[publicId]/page.tsx` | `generateMetadata` | Add searchParams, use translated content for SEO |
| `/src/app/item/[publicId]/page.tsx` | `PageProps` interface | Add searchParams type |

### New Functions to Add

| File | Function | Purpose |
|------|----------|---------|
| `/src/app/item/[publicId]/page.tsx` | `detectGuestLanguage()` | Helper for server-side language detection (or import from lib) |
| `/src/app/item/[publicId]/page.tsx` | `getLanguageCookie()` | Helper to read cookie on server |
| `/src/app/item/[publicId]/page.tsx` | `getAcceptLanguage()` | Helper to read Accept-Language header |

### External Dependencies to Import

| Import | From | Purpose |
|--------|------|---------|
| `headers`, `cookies` | `next/headers` | Server-side cookie/header access |
| `SupportedLocale`, `DEFAULT_LOCALE` | `@/lib/i18n/config` | Type and constants |
| `isSupportedLocale`, `normalizeLocale` | `@/lib/i18n/config` | Validation functions |
| `LOCALE_COOKIE_NAME` | `@/lib/i18n/config` | Cookie name constant |
| `fetchTranslatedItem` | `@/lib/translations/fetch-translations` | Translation fetch utility |
| `TranslationMeta` | `@/types/l10n` | Type definition (if defined) |

---

## Code Structure Reference

Based on existing page structure in `/src/app/item/[publicId]/page.tsx`:

```typescript
// /src/app/item/[publicId]/page.tsx
// REQ-E04-016: Guest Item Page with Translation Support
// Last Modified: 2026-01-20

import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import ItemDisplay from '@/components/ItemDisplay';
import { getItemByPublicId } from '@/data/demo-data';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n/config';

// ============ Types ============
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}

interface TranslationMeta {
  requestedLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  sourceLanguage: SupportedLocale;
  availableTranslations: SupportedLocale[];
  isShowingTranslation: boolean;
  translationStatus?: 'complete' | 'partial' | 'missing';
}

// ============ Server-Side Language Detection ============
async function detectGuestLanguage(urlLang?: string): Promise<SupportedLocale> {
  // Priority 1: URL parameter
  if (urlLang && isSupportedLocale(urlLang)) {
    return urlLang;
  }

  // Priority 2: Cookie
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLang && isSupportedLocale(cookieLang)) {
    return cookieLang;
  }

  // Priority 3: Accept-Language header
  const headersList = await headers();
  const acceptLang = headersList.get('Accept-Language');
  if (acceptLang) {
    // Parse Accept-Language (simplified)
    const primaryLang = acceptLang.split(',')[0]?.split('-')[0]?.trim();
    if (primaryLang && isSupportedLocale(primaryLang)) {
      return primaryLang;
    }
  }

  // Priority 4: Default
  return DEFAULT_LOCALE;
}

// ============ Metadata Generation ============
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  const detectedLanguage = await detectGuestLanguage(urlLang);

  try {
    // Fetch with translation support
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}?lang=${detectedLanguage}`,
      { next: { revalidate: 60 } }
    );

    if (response.ok) {
      const { data: item } = await response.json();
      return {
        metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
        title: `${item.name} - FAQBNB`,
        description: item.description || `View instructions and resources for ${item.name}`,
        openGraph: {
          title: item.name,
          description: item.description || `View instructions and resources for ${item.name}`,
          type: 'website',
          locale: detectedLanguage,
        },
      };
    }

    // Fallback to demo data or existing fetch
    // ...existing fallback code...
  } catch (error) {
    return {
      title: 'FAQBNB',
      description: 'View item instructions and resources',
    };
  }
}

// ============ Main Page Component ============
export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Detect guest language
  const detectedLanguage = await detectGuestLanguage(urlLang);

  try {
    // Fetch from API with translation support
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}?lang=${detectedLanguage}`,
      { next: { revalidate: 60 } }
    );

    if (response.ok) {
      const itemResponse = await response.json();
      if (itemResponse.success && itemResponse.data) {
        // Build translation metadata
        const translationMeta: TranslationMeta = {
          requestedLanguage: detectedLanguage,
          displayLanguage: itemResponse.data.translationMeta?.displayLanguage || detectedLanguage,
          sourceLanguage: itemResponse.data.sourceLanguage || 'en',
          availableTranslations: itemResponse.data.availableTranslations || [],
          isShowingTranslation: detectedLanguage !== (itemResponse.data.sourceLanguage || 'en'),
          translationStatus: itemResponse.data.translationMeta?.status,
        };

        return (
          <ItemDisplay
            item={itemResponse.data}
            translationMeta={translationMeta}
          />
        );
      }
    }

    // Fallback to demo data
    console.log(`API failed for ${publicId}, falling back to demo data`);
    const demoItem = getItemByPublicId(publicId);

    if (!demoItem) {
      notFound();
    }

    // Demo data doesn't have translations, use defaults
    const defaultTranslationMeta: TranslationMeta = {
      requestedLanguage: detectedLanguage,
      displayLanguage: 'en',
      sourceLanguage: 'en',
      availableTranslations: [],
      isShowingTranslation: false,
      translationStatus: 'missing',
    };

    const itemData = {
      id: demoItem.id,
      publicId: demoItem.publicId,
      name: demoItem.name,
      description: demoItem.description,
      links: demoItem.links.map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.linkType,
        url: link.url,
        thumbnailUrl: link.thumbnailUrl,
        displayOrder: link.displayOrder,
      })),
    };

    return (
      <ItemDisplay
        item={itemData}
        translationMeta={defaultTranslationMeta}
      />
    );
  } catch (error) {
    console.error('Error in ItemPage:', error);
    notFound();
  }
}

// ============ Static Params ============
export async function generateStaticParams() {
  return [];
}
```

---

## Integration Points

### ItemDisplay Component Updates (REQ-E04-017)
The ItemDisplay component will need to be updated (separate task) to:
- Accept `translationMeta` prop
- Integrate `useGuestLanguage` hook
- Add GuestLanguageSwitcher component
- Add TranslationBanner component
- Handle view original toggle

### API Integration
Uses the public item API endpoint created in REQ-E04-005:
```
GET /api/public/items/[publicId]?lang=fr
```

Response includes:
- Translated item content
- Translation metadata
- Available translations list

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Page checks URL param for language | `detectGuestLanguage()` checks `searchParams.lang` first |
| Page checks cookie when no URL param | Cookie read via `cookies()` in detection function |
| Page parses Accept-Language header | Header read via `headers()` in detection function |
| Page defaults to English | `DEFAULT_LOCALE = 'en'` as final fallback |
| Detected language validated | `isSupportedLocale()` type guard on all sources |
| Page fetches complete item with translations | API call with `?lang=` parameter |
| Original content merged with translations | Handled by API/fetch utility |
| Missing translations fall back to original | Handled by API response |
| Translation metadata extracted | `TranslationMeta` object built from response |
| Metadata passed to client component | `translationMeta` prop on ItemDisplay |
| SEO uses translated title | `generateMetadata` uses translated `item.name` |
| SEO uses translated description | `generateMetadata` uses translated `item.description` |
| OpenGraph includes locale | `locale: detectedLanguage` in openGraph config |
| 404 for non-existent items | `notFound()` call on missing items |
| Database errors handled gracefully | try/catch with console.error, notFound() |
| Language detection consistent | Same `detectGuestLanguage()` in page and metadata |
| Next.js 13+ server component patterns | async/await, headers(), cookies() |
| TypeScript type safety | Interfaces for PageProps, TranslationMeta |

---

## Testing Considerations

### Unit Test Scenarios
1. **URL param detection:** Page uses `?lang=fr` to set French
2. **Cookie fallback:** Page uses cookie when no URL param
3. **Accept-Language fallback:** Page parses header when no cookie
4. **Default fallback:** Page defaults to English when all fail
5. **Invalid language rejection:** Invalid codes fall through to next priority
6. **Metadata with translation:** generateMetadata returns translated title
7. **Metadata fallback:** generateMetadata works with demo data

### Integration Test Scenarios
1. Full page load with `?lang=es` shows Spanish content (if available)
2. Page respects cookie preference across navigation
3. Shareable link with language parameter works correctly
4. SEO metadata reflects correct language

### Manual Test Scenarios
1. Visit `/item/ABC123?lang=fr` - should show French if translation exists
2. Set `FAQBNB_LANG=es` cookie, visit `/item/ABC123` - should show Spanish
3. Clear cookies, set browser to German, visit page - should show German
4. Visit with no translations available - should show original with banner

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation utilities not ready | Medium | High | Check for existence, fall back to original content |
| Public API endpoint not ready | Medium | High | Use existing API path, add lang param handling |
| Cookie/header access async issues | Low | Medium | Use Next.js recommended patterns (async cookies/headers) |
| Hydration mismatch if language changes | Low | Medium | Server detects language, client syncs with cookie |
| Performance impact from translation fetch | Low | Medium | Use Next.js caching (`revalidate: 60`) |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-016
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Page:** `/src/app/item/[publicId]/page.tsx`
- **ItemDisplay Component:** `/src/components/ItemDisplay.tsx`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Related Tasks:** REQ-E04-004 (Translation Fetch), REQ-E04-005 (Public API), REQ-E04-007 (Translation Utils)
- **Next Task:** REQ-E04-017 (Update ItemDisplay client component)
