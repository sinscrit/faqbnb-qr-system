# REQ-E04-019: Support Language Parameter in Shareable Links - Implementation Overview

**Request ID:** REQ-E04-019
**Title:** Handle URL Parameter for Shareable Links
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.4

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Enable guest-facing item pages to read and respect a `?lang=` URL query parameter for shareable links that open directly in a specific language. This feature supports QR codes and links that can be distributed to different language audiences while maintaining proper SEO practices with canonical URLs that point to the base path without language parameters.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 5: Update Guest Pages, Task 5.4
- **Relevant Task Details:**
  - Update page to read `?lang=` parameter
  - Include language in shareable link
  - Canonical URL should NOT include language parameter

### Dependencies from Previous Epic 4 Tasks
| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-002) |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | Required (REQ-E04-004) |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | Required (REQ-E04-014) |
| Cookie Persistence | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-015) |
| Updated Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Required (REQ-E04-016) |
| Updated ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Required (REQ-E04-017) |

### Dependencies from Epic 1 (Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `isSupportedLocale()` | `/src/lib/i18n/config.ts` | Available |
| `DEFAULT_LOCALE` | `/src/lib/i18n/config.ts` | Available |
| `LOCALE_COOKIE_NAME` | `/src/lib/i18n/config.ts` | Available |

### Existing Patterns to Follow
| Pattern | Location | Relevance |
|---------|----------|-----------|
| Canonical URL in Metadata | `/src/app/page.tsx` (line 35-37) | `alternates.canonical` pattern |
| MetadataBase configuration | `/src/app/item/[publicId]/page.tsx` | Production vs development URL |
| searchParams handling | `/src/app/item/[publicId]/page.tsx` | Promise-based params access |
| Language detection | REQ-E04-016 implementation | Priority cascade (URL > Cookie > Header) |

---

## Technical Specification

### URL Parameter Handling

The `?lang=` parameter enables shareable links that open directly in a specific language:

```
# Standard item URL (default English)
https://faqbnb.com/item/ABC123

# Spanish shareable link
https://faqbnb.com/item/ABC123?lang=es

# French shareable link
https://faqbnb.com/item/ABC123?lang=fr
```

### Language Detection Priority

As established in REQ-E04-016, the priority is:
1. **URL parameter** `?lang=xx` (highest - enables shareable links)
2. **Cookie** `FAQBNB_LANG` (persisted preference)
3. **Accept-Language header** (browser preference)
4. **Default** `'en'` (fallback)

### Canonical URL Strategy

```typescript
// Canonical URL ALWAYS points to base path without language parameter
// This prevents SEO duplicate content issues

// For URL: /item/ABC123?lang=es
// Canonical should be: https://faqbnb.com/item/ABC123

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';

  return {
    // ... other metadata
    alternates: {
      canonical: `${baseUrl}/item/${publicId}`,  // NO lang parameter
    },
  };
}
```

### Shareable Link Generation

When showing content in a non-default language, shareable links should include the language parameter:

```typescript
// Helper to generate shareable link
function getShareableLink(publicId: string, language: SupportedLocale): string {
  const baseUrl = window.location.origin;
  const basePath = `/item/${publicId}`;

  // Only include lang param for non-English
  if (language === 'en') {
    return `${baseUrl}${basePath}`;
  }

  return `${baseUrl}${basePath}?lang=${language}`;
}
```

### URL Parameter Persistence

When a guest visits with a `?lang=` parameter, the language should be persisted to cookie for subsequent visits:

```typescript
// In useGuestLanguage hook or guest-language utility
async function handleLanguageFromUrl(urlLang: string | undefined): void {
  if (urlLang && isSupportedLocale(urlLang)) {
    // Persist to cookie so guest keeps this preference
    setGuestLanguageCookie(urlLang);
  }
}
```

### Case Insensitivity

URL parameters should be case-insensitive:

```typescript
// Both should work:
// /item/ABC123?lang=ES
// /item/ABC123?lang=es

function normalizeLanguageParam(lang: string | undefined): SupportedLocale | undefined {
  if (!lang) return undefined;
  const normalized = lang.toLowerCase();
  return isSupportedLocale(normalized) ? normalized : undefined;
}
```

---

## Implementation Tasks

### Task 1: Update PageProps Interface
**File:** `/src/app/item/[publicId]/page.tsx`

Ensure searchParams includes lang parameter (may already be done in REQ-E04-016):
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

### Task 2: Add Canonical URL to Metadata
**File:** `/src/app/item/[publicId]/page.tsx`

Update `generateMetadata` to include canonical URL without language parameter:
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';

  // Canonical URL always points to base path (no lang parameter)
  const canonicalUrl = `${baseUrl}/item/${publicId}`;

  const detectedLanguage = await detectGuestLanguage(urlLang);

  // ... fetch translated content for metadata ...

  return {
    metadataBase: new URL(baseUrl),
    title: `${item.name} - FAQBNB`,
    description: item.description || `View instructions for ${item.name}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: item.name,
      description: item.description,
      type: 'website',
      url: canonicalUrl,  // OG URL also uses canonical
      locale: detectedLanguage,
    },
  };
}
```

### Task 3: Ensure URL Parameter Takes Priority
**File:** `/src/app/item/[publicId]/page.tsx`

Verify that language detection prioritizes URL parameter (from REQ-E04-016):
```typescript
async function detectGuestLanguage(urlLang?: string): Promise<SupportedLocale> {
  // Priority 1: URL parameter (HIGHEST - enables shareable links)
  if (urlLang) {
    const normalized = urlLang.toLowerCase();
    if (isSupportedLocale(normalized)) {
      return normalized;
    }
  }

  // Priority 2-4: Cookie, Accept-Language, Default
  // ... (existing implementation)
}
```

### Task 4: Add Case-Insensitive Language Parameter Handling
**File:** `/src/app/item/[publicId]/page.tsx`

Ensure language parameter is case-insensitive:
```typescript
// Normalize to lowercase before validation
const normalizedLang = urlLang?.toLowerCase();
if (normalizedLang && isSupportedLocale(normalizedLang)) {
  return normalizedLang;
}
```

### Task 5: Handle Invalid Language Parameters
**File:** `/src/app/item/[publicId]/page.tsx`

When an invalid language code is provided, fall through to next priority:
```typescript
// Invalid codes are silently ignored, falling back to cookie/header/default
// Do NOT return 400 error - graceful degradation
if (urlLang && !isSupportedLocale(urlLang.toLowerCase())) {
  // Log for monitoring but don't fail
  console.warn(`Invalid language parameter received: ${urlLang}`);
  // Continue to cookie/header fallback
}
```

### Task 6: Persist URL Language to Cookie
**File:** `/src/app/item/[publicId]/page.tsx` or client component

When a valid URL language parameter is used, persist it:
```typescript
// Server-side: Use response cookies or pass to client
// Client-side: In useGuestLanguage hook or effect

useEffect(() => {
  // If we got language from URL param, persist to cookie
  if (urlLangParam && isSupportedLocale(urlLangParam)) {
    setGuestLanguageCookie(urlLangParam);
  }
}, [urlLangParam]);
```

### Task 7: Create Shareable Link Utility
**File:** `/src/lib/i18n/guest-language.ts` or `/src/lib/translations/translation-utils.ts`

Add utility function for generating shareable links:
```typescript
/**
 * Generate a shareable link for an item with optional language parameter
 *
 * @param publicId - The public ID of the item
 * @param language - The language to include (omitted for English)
 * @param baseUrl - Optional base URL override
 * @returns Full shareable URL
 */
export function generateShareableLink(
  publicId: string,
  language: SupportedLocale,
  baseUrl?: string
): string {
  const base = baseUrl || (typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXTAUTH_URL || 'https://faqbnb.com');

  const path = `/item/${publicId}`;

  // Only include lang param for non-default languages
  if (language === DEFAULT_LOCALE) {
    return `${base}${path}`;
  }

  return `${base}${path}?lang=${language}`;
}
```

### Task 8: Update ItemDisplay for Shareable Links
**File:** `/src/components/ItemDisplay.tsx`

If there's a share/copy link feature, update it to include current language:
```typescript
// In ItemDisplay component
const handleCopyLink = () => {
  const shareableLink = generateShareableLink(
    item.publicId,
    currentLanguage
  );
  navigator.clipboard.writeText(shareableLink);
  // Show success toast
};
```

### Task 9: Preserve Language Parameter Through Navigation
**File:** `/src/hooks/useGuestLanguage.ts` or component handling language changes

Ensure browser back/forward respects the URL parameter:
```typescript
// When language changes via switcher (not URL), update URL without reload
const handleLanguageChange = (newLanguage: SupportedLocale) => {
  setLanguage(newLanguage);

  // Update URL to enable sharing current language state
  const url = new URL(window.location.href);
  if (newLanguage === DEFAULT_LOCALE) {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', newLanguage);
  }

  // Update URL without page reload
  window.history.replaceState({}, '', url.toString());
};
```

### Task 10: Add Robots Meta for Language Variants
**File:** `/src/app/item/[publicId]/page.tsx`

Ensure search engines understand language handling:
```typescript
return {
  // ... other metadata
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: canonicalUrl,
    // Optionally, add language alternates for discovery
    // languages: {
    //   'en': `${baseUrl}/item/${publicId}`,
    //   'es': `${baseUrl}/item/${publicId}?lang=es`,
    //   // etc.
    // },
  },
};
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/app/item/[publicId]/page.tsx` | Add canonical URL, enhance language parameter handling |
| `/src/components/ItemDisplay.tsx` | Update shareable link generation if share feature exists |
| `/src/hooks/useGuestLanguage.ts` | Add URL synchronization for language changes |
| `/src/lib/i18n/guest-language.ts` | Add shareable link utility function |

### Functions to Modify

| File | Function | Modification |
|------|----------|--------------|
| `/src/app/item/[publicId]/page.tsx` | `generateMetadata` | Add `alternates.canonical`, ensure no lang param in canonical |
| `/src/app/item/[publicId]/page.tsx` | `detectGuestLanguage` | Add case-insensitive handling for URL param |
| `/src/app/item/[publicId]/page.tsx` | `ItemPage` | Ensure URL lang parameter is processed and persisted |
| `/src/hooks/useGuestLanguage.ts` | `setLanguage` | Sync URL parameter when language changes |

### New Functions to Add

| File | Function | Purpose |
|------|----------|---------|
| `/src/lib/i18n/guest-language.ts` | `generateShareableLink()` | Create shareable URLs with language parameter |
| `/src/lib/i18n/guest-language.ts` | `normalizeLanguageParam()` | Case-insensitive language parameter normalization |
| `/src/hooks/useGuestLanguage.ts` | URL sync effect | Keep URL in sync with language state |

### External Dependencies to Import

| Import | From | Purpose |
|--------|------|---------|
| `SupportedLocale` | `@/lib/i18n/config` | Type for language codes |
| `isSupportedLocale` | `@/lib/i18n/config` | Validation function |
| `DEFAULT_LOCALE` | `@/lib/i18n/config` | Default language constant |
| `LOCALE_COOKIE_NAME` | `@/lib/i18n/config` | Cookie name constant |
| `setGuestLanguageCookie` | `@/lib/i18n/guest-language` | Cookie persistence function |

---

## Data Flow

```
Guest receives shareable link: /item/ABC123?lang=es
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Server Component (page.tsx)          │
    │                                          │
    │  1. Extract lang param from searchParams │
    │  2. Normalize to lowercase               │
    │  3. Validate against supported locales   │
    │  4. URL param takes highest priority     │
    │  5. Fetch translations for 'es'          │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     generateMetadata (SEO)               │
    │                                          │
    │  - Canonical: /item/ABC123 (NO lang)     │
    │  - OG locale: es                         │
    │  - Title/description: Spanish            │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Client Component (ItemDisplay)       │
    │                                          │
    │  - Display content in Spanish            │
    │  - Persist 'es' to cookie               │
    │  - Share button includes ?lang=es       │
    └─────────────────────────────────────────┘
                    │
                    ▼
    Guest changes language to French via switcher
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     useGuestLanguage hook                │
    │                                          │
    │  1. Update state to 'fr'                 │
    │  2. Update cookie to 'fr'               │
    │  3. Update URL to ?lang=fr (no reload)  │
    │  4. Re-fetch French translations         │
    └─────────────────────────────────────────┘
```

---

## Code Structure Reference

### Updated generateMetadata with Canonical URL

```typescript
// /src/app/item/[publicId]/page.tsx
// REQ-E04-019: Add canonical URL support for shareable links
// Last Modified: 2026-01-20

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';

  // Canonical URL ALWAYS excludes language parameter (SEO best practice)
  const canonicalUrl = `${baseUrl}/item/${publicId}`;

  // Detect language with case-insensitive handling
  const detectedLanguage = await detectGuestLanguage(urlLang?.toLowerCase());

  try {
    const response = await fetch(
      `${baseUrl}/api/public/items/${publicId}?lang=${detectedLanguage}`,
      { next: { revalidate: 60 } }
    );

    if (response.ok) {
      const { data: item } = await response.json();
      return {
        metadataBase: new URL(baseUrl),
        title: `${item.name} - FAQBNB`,
        description: item.description || `View instructions for ${item.name}`,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: item.name,
          description: item.description || `View instructions for ${item.name}`,
          type: 'website',
          url: canonicalUrl,
          locale: detectedLanguage,
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    // Fallback for demo data
    // ...
  } catch (error) {
    return {
      metadataBase: new URL(baseUrl),
      title: 'FAQBNB',
      description: 'View item instructions and resources',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
}
```

### Shareable Link Utility

```typescript
// /src/lib/i18n/guest-language.ts
// REQ-E04-019: Shareable link generation with language parameter
// Last Modified: 2026-01-20

import { SupportedLocale, DEFAULT_LOCALE } from './config';

/**
 * Generate a shareable link for an item
 * Includes language parameter for non-English languages
 *
 * @param publicId - Item's public identifier
 * @param language - Target language for the link
 * @param baseUrl - Optional base URL override (for SSR)
 * @returns Complete shareable URL
 */
export function generateShareableLink(
  publicId: string,
  language: SupportedLocale,
  baseUrl?: string
): string {
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

/**
 * Normalize a language parameter to lowercase
 * Returns undefined if not a valid supported locale
 */
export function normalizeLanguageParam(
  lang: string | undefined
): SupportedLocale | undefined {
  if (!lang) return undefined;
  const normalized = lang.toLowerCase();
  return isSupportedLocale(normalized) ? normalized : undefined;
}
```

### URL Synchronization in useGuestLanguage

```typescript
// /src/hooks/useGuestLanguage.ts
// REQ-E04-019: URL parameter synchronization
// Last Modified: 2026-01-20

// Inside the hook, add URL synchronization:
const setLanguage = useCallback((newLanguage: SupportedLocale) => {
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

    // Update URL without page reload (history.replaceState)
    window.history.replaceState({}, '', url.toString());
  }

  // Trigger content refetch if callback provided
  onLanguageChange?.(newLanguage);
}, [onLanguageChange]);
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Page accepts `lang` query parameter | searchParams.lang extracted and processed |
| Valid language codes trigger immediate display | `detectGuestLanguage` uses URL param as highest priority |
| URL param takes priority over cookie | Priority cascade: URL > Cookie > Header > Default |
| URL param takes priority over Accept-Language | Same priority cascade ensures URL wins |
| Invalid/unsupported codes ignored gracefully | Validation silently falls through to next priority |
| Language from URL persisted to cookie | `setGuestLanguageCookie` called after detecting URL param |
| Canonical URL in HTML meta tags | `alternates.canonical` in generateMetadata |
| Canonical URL excludes language parameter | Only base path: `/item/{publicId}` |
| Canonical uses full absolute URL | Includes protocol and domain |
| Shareable link includes current language | `generateShareableLink` utility |
| Share/copy preserves language for non-English | Link includes `?lang=xx` for non-default |
| Default language (English) omits parameter | Shareable links for 'en' have no lang param |
| URL parameter persists through navigation | `history.replaceState` keeps URL in sync |
| Search engines see canonical regardless of param | Canonical always points to base path |
| Next.js best practices for searchParams | Promise-based async params access |
| TypeScript types include lang parameter | PageProps searchParams typed |
| Works in development and production | baseUrl logic handles both environments |
| Case-insensitive language codes | `?lang=ES` and `?lang=es` both work |

---

## Testing Considerations

### Unit Test Scenarios

1. **URL parameter detection:** `?lang=es` sets Spanish language
2. **Case insensitivity:** `?lang=ES` normalizes to Spanish
3. **Invalid parameter fallback:** `?lang=xyz` falls through to cookie/header
4. **Canonical URL generation:** Always excludes lang parameter
5. **Shareable link for English:** No lang parameter appended
6. **Shareable link for non-English:** Includes `?lang=xx`
7. **URL sync on language change:** Updates URL without reload

### Integration Test Scenarios

1. Visit `/item/ABC123?lang=fr` - content displays in French
2. Change language via switcher - URL updates to `?lang=de`
3. Browser back/forward - respects URL language state
4. Copy shareable link - includes current language
5. Search engine crawler - sees canonical without lang param

### Manual Test Scenarios

1. **Shareable link test:**
   - Visit `/item/ABC123`
   - Change to Spanish via switcher
   - URL should show `?lang=es`
   - Copy link and open in incognito - should show Spanish

2. **Cookie persistence test:**
   - Visit `/item/ABC123?lang=fr`
   - Navigate to another item
   - Return to original item (no lang param)
   - Should still show French (persisted to cookie)

3. **SEO verification:**
   - View page source for `/item/ABC123?lang=es`
   - `<link rel="canonical">` should point to `/item/ABC123`
   - `og:url` should also exclude lang parameter

4. **Case insensitivity test:**
   - Visit `/item/ABC123?lang=ES`
   - Should display Spanish content (uppercase handled)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| URL manipulation by users | High | Low | Validate all lang values against supported locales |
| SEO duplicate content issues | Medium | High | Canonical URL always excludes lang param |
| Browser history pollution | Low | Low | Use `replaceState` instead of `pushState` |
| Cookie and URL out of sync | Medium | Medium | Persist URL lang to cookie on page load |
| Performance from URL updates | Low | Low | Client-side history API is fast |
| SSR/CSR mismatch | Medium | Medium | Server and client use same detection logic |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-019
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Page:** `/src/app/item/[publicId]/page.tsx`
- **Canonical URL Pattern:** `/src/app/page.tsx` (lines 35-37)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Related Tasks:**
  - REQ-E04-014 (useGuestLanguage Hook) - URL sync integration
  - REQ-E04-015 (Cookie Utility) - Persistence of URL language
  - REQ-E04-016 (Guest Item Page) - Base language detection
  - REQ-E04-017 (ItemDisplay) - Share functionality
- **Next.js Metadata Docs:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata
