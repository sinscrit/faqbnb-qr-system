# REQ-E04-019: Handle URL Parameter for Shareable Links - Detailed Task Breakdown

**Request ID:** REQ-E04-019
**Title:** Handle URL Parameter for Shareable Links
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.4

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Overview

This document provides granular, implementation-ready tasks for supporting the `?lang=` URL query parameter in shareable links. This enables guests to receive links or QR codes that open directly in a specific language while maintaining proper SEO practices with canonical URLs.

### Document References
- **Overview Document:** `docs/REQ-E04-019-handle-url-parameter-for-shareable-links-overview.md`
- **Request:** `docs/gen_requests_epic4.md` (REQ-E04-019)
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Prerequisites

### Required Dependencies (Must Be Completed)
| Dependency | File | Status Check |
|------------|------|--------------|
| i18n Configuration | `/src/lib/i18n/config.ts` | EXISTS - `SupportedLocale`, `isSupportedLocale()`, `DEFAULT_LOCALE` available |
| Localization Types | `/src/types/l10n.ts` | Required from REQ-E04-001 |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required from REQ-E04-002 |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | Required from REQ-E04-014 |
| Cookie Persistence | `/src/lib/i18n/guest-language.ts` | Required from REQ-E04-015 |
| Updated Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Required from REQ-E04-016 |
| Updated ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Required from REQ-E04-017 |

### Existing Code Context
| File | Current State |
|------|---------------|
| `/src/app/item/[publicId]/page.tsx` | Server component, no searchParams handling, no canonical URL |
| `/src/components/ItemDisplay.tsx` | Client component, no language awareness |
| `/src/lib/i18n/config.ts` | Complete with locales, `isSupportedLocale()`, `normalizeLocale()` |

---

## Task Breakdown

### Task 1: Update PageProps Interface to Include searchParams
**File:** `/src/app/item/[publicId]/page.tsx`
**Story Points:** 1
**Type:** Code Modification

#### Current Code (line 6-8):
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
}
```

#### Target Code:
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

#### Implementation Steps:
1. Open `/src/app/item/[publicId]/page.tsx`
2. Locate the `PageProps` interface (line 6-8)
3. Add `searchParams` property with Promise type matching Next.js 15 conventions
4. Save file

#### Verification:
- TypeScript compilation succeeds
- No breaking changes to existing functionality

---

### Task 2: Add Case-Insensitive Language Parameter Normalization Utility
**File:** `/src/lib/i18n/guest-language.ts`
**Story Points:** 1
**Type:** New Function

#### Implementation:
Add the following function to `/src/lib/i18n/guest-language.ts`:

```typescript
import { SupportedLocale, isSupportedLocale } from './config';

/**
 * Normalize a language parameter from URL to a supported locale
 * Handles case-insensitivity (e.g., ?lang=ES becomes 'es')
 *
 * @param lang - The raw language parameter from URL
 * @returns Normalized SupportedLocale or undefined if invalid
 */
export function normalizeLanguageParam(
  lang: string | undefined
): SupportedLocale | undefined {
  if (!lang) return undefined;

  const normalized = lang.toLowerCase().trim();
  return isSupportedLocale(normalized) ? normalized : undefined;
}
```

#### Verification:
- `normalizeLanguageParam('ES')` returns `'es'`
- `normalizeLanguageParam('es')` returns `'es'`
- `normalizeLanguageParam('xyz')` returns `undefined`
- `normalizeLanguageParam(undefined)` returns `undefined`
- `normalizeLanguageParam('')` returns `undefined`
- `normalizeLanguageParam(' ES ')` returns `'es'` (handles whitespace)

---

### Task 3: Create Shareable Link Generation Utility
**File:** `/src/lib/i18n/guest-language.ts`
**Story Points:** 1
**Type:** New Function

#### Implementation:
Add the following function to `/src/lib/i18n/guest-language.ts`:

```typescript
import { SupportedLocale, DEFAULT_LOCALE } from './config';

/**
 * Generate a shareable link for an item with optional language parameter
 * English (default) links do not include the lang parameter
 *
 * @param publicId - The item's public identifier
 * @param language - The target language for the link
 * @param baseUrl - Optional base URL override (for SSR context)
 * @returns Complete shareable URL string
 *
 * @example
 * generateShareableLink('ABC123', 'es')
 * // Returns: 'https://faqbnb.com/item/ABC123?lang=es'
 *
 * generateShareableLink('ABC123', 'en')
 * // Returns: 'https://faqbnb.com/item/ABC123' (no lang param)
 */
export function generateShareableLink(
  publicId: string,
  language: SupportedLocale,
  baseUrl?: string
): string {
  // Determine base URL with fallbacks
  const base = baseUrl
    || (typeof window !== 'undefined' ? window.location.origin : '')
    || process.env.NEXTAUTH_URL
    || 'https://faqbnb.com';

  const path = `/item/${publicId}`;

  // Only add lang param for non-default languages
  if (language === DEFAULT_LOCALE) {
    return `${base}${path}`;
  }

  return `${base}${path}?lang=${language}`;
}
```

#### Verification:
- `generateShareableLink('ABC', 'es')` includes `?lang=es`
- `generateShareableLink('ABC', 'en')` does NOT include any lang param
- Function works in both browser and SSR contexts
- Base URL correctly derived from window.location.origin when available

---

### Task 4: Update generateMetadata Function with Canonical URL
**File:** `/src/app/item/[publicId]/page.tsx`
**Story Points:** 2
**Type:** Code Modification

#### Current Code (line 11-58):
The current `generateMetadata` function does not:
- Accept searchParams
- Include canonical URL
- Include language-aware metadata

#### Target Implementation:
Replace the `generateMetadata` function:

```typescript
// Generate metadata for SEO with canonical URL support
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  try {
    const { publicId } = await params;
    const { lang: urlLang } = await searchParams;

    // Normalize language parameter (case-insensitive)
    const normalizedLang = urlLang?.toLowerCase();
    const requestedLanguage = normalizedLang && isSupportedLocale(normalizedLang)
      ? normalizedLang
      : DEFAULT_LOCALE;

    // Base URL for canonical and OG URLs
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://faqbnb.com'
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Canonical URL ALWAYS excludes language parameter (SEO best practice)
    const canonicalUrl = `${baseUrl}/item/${publicId}`;

    // Try API first
    const response = await fetch(`${baseUrl}/api/items/${publicId}`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const { data: item } = await response.json();
      return {
        metadataBase: new URL(baseUrl),
        title: `${item.name} - FAQBNB`,
        description: item.description || `View instructions and resources for ${item.name}`,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: item.name,
          description: item.description || `View instructions and resources for ${item.name}`,
          type: 'website',
          url: canonicalUrl,
          locale: requestedLanguage,
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    // Fallback to demo data
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      return {
        metadataBase: new URL(baseUrl),
        title: `${demoItem.name} - FAQBNB`,
        description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: demoItem.name,
          description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
          type: 'website',
          url: canonicalUrl,
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    return {
      metadataBase: new URL(baseUrl),
      title: 'Item Not Found',
      description: 'The requested item could not be found.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://faqbnb.com'
      : 'http://localhost:3000';

    return {
      metadataBase: new URL(baseUrl),
      title: 'FAQBNB',
      description: 'View item instructions and resources',
    };
  }
}
```

#### Required Imports:
Add to the top of the file:
```typescript
import { isSupportedLocale, DEFAULT_LOCALE, SupportedLocale } from '@/lib/i18n/config';
```

#### Verification:
- Visit `/item/ABC123?lang=es` - page source shows `<link rel="canonical" href="https://faqbnb.com/item/ABC123">`
- Canonical URL does NOT include `?lang=es`
- OpenGraph locale reflects the requested language
- Works in both development and production environments

---

### Task 5: Update ItemPage Function to Accept and Process searchParams
**File:** `/src/app/item/[publicId]/page.tsx`
**Story Points:** 2
**Type:** Code Modification

#### Current Code (line 61-106):
The `ItemPage` function currently:
- Only accepts `params`
- Does not read `searchParams`
- Does not pass language information to ItemDisplay

#### Target Implementation:
```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
  try {
    const { publicId } = await params;
    const { lang: urlLang } = await searchParams;

    // Normalize and validate language parameter (case-insensitive)
    const normalizedLang = urlLang?.toLowerCase();
    const validatedLang = normalizedLang && isSupportedLocale(normalizedLang)
      ? normalizedLang
      : undefined;

    // Log invalid language parameters for monitoring (optional)
    if (urlLang && !validatedLang) {
      console.warn(`Invalid language parameter received: ${urlLang}`);
    }

    // Try to fetch from API first
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/items/${publicId}`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const itemResponse = await response.json();
      if (itemResponse.success && itemResponse.data) {
        return (
          <ItemDisplay
            item={itemResponse.data}
            urlLanguage={validatedLang}
          />
        );
      }
    }

    // Fallback to demo data if API fails
    console.log(`API failed for ${publicId}, falling back to demo data`);
    const demoItem = getItemByPublicId(publicId);

    if (!demoItem) {
      notFound();
    }

    // Transform demo data to match expected format
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
        urlLanguage={validatedLang}
      />
    );
  } catch (error) {
    console.error('Error in ItemPage:', error);
    notFound();
  }
}
```

#### Verification:
- Page renders correctly with `?lang=es`, `?lang=ES`, `?lang=fr`
- Invalid language codes (e.g., `?lang=xyz`) are silently ignored
- `urlLanguage` prop is passed to ItemDisplay

---

### Task 6: Update ItemDisplayProps to Accept URL Language
**File:** `/src/types/index.ts` (or wherever ItemDisplayProps is defined)
**Story Points:** 1
**Type:** Code Modification

#### Implementation:
Find the `ItemDisplayProps` interface and add the `urlLanguage` prop:

```typescript
export interface ItemDisplayProps {
  item: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    links: Array<{
      id: string;
      title: string;
      linkType: string;
      url: string;
      thumbnailUrl: string | null;
      displayOrder: number;
    }>;
    articles?: Array<{
      id: string;
      title: string;
      description: string | null;
      links: Array<{
        id: string;
        title: string;
        linkType: string;
        url: string;
        thumbnailUrl: string | null;
      }>;
    }>;
  };
  /** Language from URL parameter (?lang=xx) - takes highest priority */
  urlLanguage?: SupportedLocale;
}
```

#### Required Import:
```typescript
import { SupportedLocale } from '@/lib/i18n/config';
```

#### Verification:
- TypeScript compilation succeeds
- ItemDisplay component can accept the new prop

---

### Task 7: Update ItemDisplay to Handle URL Language and Sync URL State
**File:** `/src/components/ItemDisplay.tsx`
**Story Points:** 3
**Type:** Code Modification

#### Implementation Approach:
Update the ItemDisplay component to:
1. Accept `urlLanguage` prop
2. Use URL language as initial language if provided
3. Persist URL language to cookie
4. Sync URL when language changes via switcher

#### Target Code Changes:

Add after existing imports:
```typescript
import { SupportedLocale, DEFAULT_LOCALE, isSupportedLocale } from '@/lib/i18n/config';
import { setGuestLanguageCookie, generateShareableLink } from '@/lib/i18n/guest-language';
```

Update component signature:
```typescript
export default function ItemDisplay({ item, urlLanguage }: ItemDisplayProps) {
```

Add state and effects for language handling:
```typescript
// Language state - URL param takes priority
const [currentLanguage, setCurrentLanguage] = useState<SupportedLocale>(
  urlLanguage || DEFAULT_LOCALE
);

// Persist URL language to cookie on initial load
useEffect(() => {
  if (urlLanguage && isSupportedLocale(urlLanguage)) {
    setGuestLanguageCookie(urlLanguage);
  }
}, [urlLanguage]);

// Handle language change from switcher
const handleLanguageChange = (newLanguage: SupportedLocale) => {
  setCurrentLanguage(newLanguage);
  setGuestLanguageCookie(newLanguage);

  // Sync URL parameter for shareable links
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);

    if (newLanguage === DEFAULT_LOCALE) {
      // Remove lang param for default language
      url.searchParams.delete('lang');
    } else {
      // Add/update lang param for non-default
      url.searchParams.set('lang', newLanguage);
    }

    // Update URL without page reload
    window.history.replaceState({}, '', url.toString());
  }
};

// Generate shareable link with current language
const shareableLink = generateShareableLink(item.publicId, currentLanguage);

// Copy shareable link handler
const handleCopyShareableLink = async () => {
  try {
    await navigator.clipboard.writeText(shareableLink);
    // Show success toast/notification (implement based on existing toast system)
    console.info('Shareable link copied:', shareableLink);
  } catch (error) {
    console.error('Failed to copy link:', error);
  }
};
```

#### Verification:
- Visit `/item/ABC123?lang=es` - Spanish language should be set
- URL changes to `?lang=fr` when French is selected via switcher
- URL removes `?lang=` parameter when English is selected
- Browser back/forward preserves language state in URL
- Cookie is set when visiting with URL language param

---

### Task 8: Add URL Language Persistence to Cookie on Page Load
**File:** `/src/app/item/[publicId]/page.tsx` (or via client component)
**Story Points:** 1
**Type:** Code Enhancement

#### Implementation Notes:
This is handled in Task 7 within the ItemDisplay client component. However, for server-side cookie setting, you could optionally add:

```typescript
// In page.tsx, using Next.js cookies()
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from '@/lib/i18n/config';

// Inside ItemPage function, after validating urlLang:
if (validatedLang) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, validatedLang, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
```

**Note:** This is optional as the client-side persistence in Task 7 handles this. Choose one approach.

#### Verification:
- Visit `/item/ABC123?lang=es`
- Check browser cookies - `FAQBNB_LANG` should be set to `es`
- Navigate to different item without `?lang=` - should remember Spanish preference

---

### Task 9: Export New Functions from Guest Language Module
**File:** `/src/lib/i18n/guest-language.ts`
**Story Points:** 1
**Type:** Code Enhancement

#### Implementation:
Ensure the module exports all new functions. Add/update the export section:

```typescript
// At the bottom of guest-language.ts or in index.ts
export {
  normalizeLanguageParam,
  generateShareableLink,
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  detectGuestLanguage,
  // ... other existing exports
};
```

If using a barrel export file `/src/lib/i18n/index.ts`, update it:
```typescript
export * from './config';
export * from './guest-language';
```

#### Verification:
- All functions can be imported from `@/lib/i18n/guest-language`
- No import errors in consuming files

---

### Task 10: Add Integration Tests for URL Parameter Handling
**File:** `/src/__tests__/url-language-parameter.test.ts` (new file)
**Story Points:** 2
**Type:** Test

#### Test Cases to Implement:

```typescript
import { normalizeLanguageParam, generateShareableLink } from '@/lib/i18n/guest-language';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

describe('URL Language Parameter Handling', () => {
  describe('normalizeLanguageParam', () => {
    it('normalizes uppercase language codes', () => {
      expect(normalizeLanguageParam('ES')).toBe('es');
      expect(normalizeLanguageParam('FR')).toBe('fr');
    });

    it('passes through valid lowercase codes', () => {
      expect(normalizeLanguageParam('es')).toBe('es');
      expect(normalizeLanguageParam('fr')).toBe('fr');
    });

    it('returns undefined for invalid codes', () => {
      expect(normalizeLanguageParam('xyz')).toBeUndefined();
      expect(normalizeLanguageParam('english')).toBeUndefined();
    });

    it('handles undefined and empty values', () => {
      expect(normalizeLanguageParam(undefined)).toBeUndefined();
      expect(normalizeLanguageParam('')).toBeUndefined();
    });

    it('trims whitespace', () => {
      expect(normalizeLanguageParam(' es ')).toBe('es');
    });
  });

  describe('generateShareableLink', () => {
    const baseUrl = 'https://faqbnb.com';

    it('includes lang param for non-English languages', () => {
      expect(generateShareableLink('ABC123', 'es', baseUrl))
        .toBe('https://faqbnb.com/item/ABC123?lang=es');
      expect(generateShareableLink('ABC123', 'fr', baseUrl))
        .toBe('https://faqbnb.com/item/ABC123?lang=fr');
    });

    it('excludes lang param for English (default)', () => {
      expect(generateShareableLink('ABC123', 'en', baseUrl))
        .toBe('https://faqbnb.com/item/ABC123');
    });

    it('handles various publicId formats', () => {
      expect(generateShareableLink('abc-123', 'es', baseUrl))
        .toBe('https://faqbnb.com/item/abc-123?lang=es');
    });
  });

  describe('Canonical URL', () => {
    it('canonical URL should not include language parameter', () => {
      // This would be tested via page render tests
      // Canonical: /item/ABC123 regardless of ?lang=es
    });
  });
});
```

#### Verification:
- All tests pass
- Edge cases covered

---

## File Change Summary

### New Files
| File Path | Purpose |
|-----------|---------|
| `/src/__tests__/url-language-parameter.test.ts` | Unit tests for URL language parameter handling |

### Modified Files
| File Path | Changes |
|-----------|---------|
| `/src/app/item/[publicId]/page.tsx` | Add searchParams to PageProps, canonical URL in metadata, language processing |
| `/src/lib/i18n/guest-language.ts` | Add `normalizeLanguageParam()`, `generateShareableLink()` functions |
| `/src/components/ItemDisplay.tsx` | Add `urlLanguage` prop, URL sync on language change |
| `/src/types/index.ts` | Update `ItemDisplayProps` with `urlLanguage` prop |

---

## Acceptance Criteria Checklist

| # | Criteria | Task |
|---|----------|------|
| 1 | Page accepts `lang` query parameter | Tasks 1, 5 |
| 2 | Valid language codes trigger immediate display | Tasks 2, 5, 7 |
| 3 | URL param takes priority over cookie | Task 5, 7 |
| 4 | URL param takes priority over Accept-Language | Task 5, 7 |
| 5 | Invalid/unsupported codes ignored gracefully | Tasks 2, 5 |
| 6 | Language from URL persisted to cookie | Tasks 7, 8 |
| 7 | Canonical URL in HTML meta tags | Task 4 |
| 8 | Canonical URL excludes language parameter | Task 4 |
| 9 | Canonical uses full absolute URL | Task 4 |
| 10 | Shareable link includes current language | Tasks 3, 7 |
| 11 | Share/copy preserves language for non-English | Tasks 3, 7 |
| 12 | Default language (English) omits parameter | Task 3 |
| 13 | URL parameter persists through navigation | Task 7 |
| 14 | Search engines see canonical regardless of param | Task 4 |
| 15 | Next.js best practices for searchParams | Tasks 1, 4, 5 |
| 16 | TypeScript types include lang parameter | Tasks 1, 6 |
| 17 | Works in development and production | Tasks 4, 5 |
| 18 | Case-insensitive language codes | Task 2 |

---

## Testing Scenarios

### Manual Testing Checklist

#### URL Parameter Detection
- [ ] Visit `/item/ABC123?lang=es` - content displays in Spanish
- [ ] Visit `/item/ABC123?lang=ES` - content displays in Spanish (case insensitive)
- [ ] Visit `/item/ABC123?lang=xyz` - falls back gracefully, no error shown
- [ ] Visit `/item/ABC123` (no param) - uses cookie or default

#### Canonical URL Verification
- [ ] View page source for `/item/ABC123?lang=es`
- [ ] Verify `<link rel="canonical" href="https://faqbnb.com/item/ABC123">`
- [ ] Verify `og:url` also excludes language parameter

#### Cookie Persistence
- [ ] Visit `/item/ABC123?lang=fr`
- [ ] Check cookies - `FAQBNB_LANG` should be `fr`
- [ ] Visit `/item/DEF456` (different item, no param)
- [ ] Should remember French preference

#### Shareable Links
- [ ] Set language to Spanish via switcher
- [ ] URL should update to include `?lang=es`
- [ ] Set language to English
- [ ] URL should NOT include `?lang=en`

#### Browser Navigation
- [ ] Change language - URL updates via replaceState
- [ ] Click browser back - previous URL state preserved
- [ ] Click browser forward - returns to updated URL

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| URL manipulation by users | Validate all lang values against `isSupportedLocale()` |
| SEO duplicate content | Canonical URL always excludes lang param |
| Browser history pollution | Use `replaceState` instead of `pushState` |
| Cookie and URL out of sync | Persist URL lang to cookie immediately on load |
| SSR/CSR mismatch | Server and client use same detection logic |

---

## Dependencies on Other Tasks

| This Task | Depends On | Reason |
|-----------|------------|--------|
| Task 7 (ItemDisplay update) | REQ-E04-014 (useGuestLanguage hook) | Hook provides language state management |
| Task 7 (ItemDisplay update) | REQ-E04-015 (Cookie utility) | `setGuestLanguageCookie()` function |
| Task 4 (generateMetadata) | REQ-E04-002 (Guest language utilities) | Language detection utilities |
| All tasks | REQ-E04-016 (Guest item page base) | Foundation for language-aware page |

---

## Implementation Order

Execute tasks in this order for optimal workflow:

1. **Task 2** - `normalizeLanguageParam` utility (foundational)
2. **Task 3** - `generateShareableLink` utility (foundational)
3. **Task 9** - Export functions (makes them available)
4. **Task 1** - Update PageProps interface
5. **Task 6** - Update ItemDisplayProps
6. **Task 4** - Update generateMetadata with canonical URL
7. **Task 5** - Update ItemPage to process searchParams
8. **Task 7** - Update ItemDisplay with URL sync
9. **Task 8** - Verify cookie persistence (may be covered by Task 7)
10. **Task 10** - Write and run tests

---

## References

- **Overview:** `/docs/REQ-E04-019-handle-url-parameter-for-shareable-links-overview.md`
- **Request:** `/docs/gen_requests_epic4.md` (REQ-E04-019)
- **Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Current Page:** `/src/app/item/[publicId]/page.tsx`
- **Current ItemDisplay:** `/src/components/ItemDisplay.tsx`
- **Next.js Metadata Docs:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata
