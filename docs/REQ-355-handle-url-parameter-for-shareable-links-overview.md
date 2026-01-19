# REQ-355: Handle URL Parameter for Shareable Links - Implementation Overview

**Last Modified:** 2026-01-19 16:30 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.4
**Dependencies:** REQ-352 (Update Guest Item Page), REQ-350 (useGuestLanguage hook), Epic 1 L10N infrastructure

---

## Summary

Guest-facing pages should accept a `?lang=` URL parameter to enable shareable links that open directly in a specific language. This enables guests to share content in their preferred language with others. The canonical URL in page metadata must exclude the language parameter to maintain proper SEO and avoid duplicate content issues.

---

## Current State Analysis

### Existing Page: `/src/app/item/[publicId]/page.tsx`

The current guest item page:
- **Page Props Interface:**
  ```typescript
  interface PageProps {
    params: Promise<{ publicId: string }>;
  }
  ```
- Does NOT accept `searchParams` (no query parameter handling)
- Does NOT read any `?lang=` parameter from the URL
- Language detection is handled only via middleware (cookie/Accept-Language header)
- No `alternates.canonical` specified in metadata (defaults to current URL)
- `generateMetadata` function does not include language-aware canonical URLs

### Current generateMetadata (lines 11-58)

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // ... fetches item data
  return {
    metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
    title: `${item.name} - FAQBNB`,
    description: item.description || `View instructions and resources for ${item.name}`,
    openGraph: { /* ... */ },
    // NO alternates.canonical specified
  };
}
```

### Current ItemPage Function (lines 61-106)

```typescript
export default async function ItemPage({ params }: PageProps) {
  const { publicId } = await params;
  // ... no searchParams handling
}
```

### Language Detection in Middleware (`/src/middleware.ts`)

Current language detection priority (from `/src/lib/i18n/language-detection.ts`):
1. User database preference (authenticated users)
2. Cookie (`FAQBNB_LANG`)
3. Accept-Language header
4. Default (`'en'`)

**Missing:** URL query parameter (`?lang=`) is NOT in the detection cascade.

---

## Target State

### URL Parameter Language Detection

The language detection priority should be updated to:
1. **URL query parameter (`?lang=`)** - NEW, highest priority for shareable links
2. User database preference (authenticated users)
3. Cookie (`FAQBNB_LANG`)
4. Accept-Language header
5. Default (`'en'`)

### Shareable Link Format

When guests share content, the generated URL should include their current language:
```
https://faqbnb.com/item/ABC123?lang=fr
```

### Canonical URL in Page Metadata

The canonical URL must exclude the language parameter:
```
https://faqbnb.com/item/ABC123
```

This ensures search engines treat all language versions as the same content.

---

## Implementation Tasks

### Task 1: Update PageProps Interface to Accept searchParams

**File:** `/src/app/item/[publicId]/page.tsx`
**Lines:** 6-8

Update the PageProps interface to include searchParams:

```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;  // NEW
}
```

### Task 2: Update generateMetadata to Add Canonical URL

**File:** `/src/app/item/[publicId]/page.tsx`
**Lines:** 11-58

**2a. Update function signature to accept searchParams:**
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
```

**2b. Add canonical URL to returned metadata:**
```typescript
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000';

return {
  metadataBase: new URL(baseUrl),
  title: `${item.name} - FAQBNB`,
  description: item.description || `View instructions and resources for ${item.name}`,
  openGraph: { /* ... */ },
  // NEW: Canonical URL without language parameter
  alternates: {
    canonical: `/item/${publicId}`,  // Relative URL, uses metadataBase
  },
};
```

Note: `searchParams` is received but not used in metadata generation - the canonical URL always excludes language parameters.

### Task 3: Update ItemPage to Read lang Parameter

**File:** `/src/app/item/[publicId]/page.tsx`
**Lines:** 61-106

**3a. Update function signature:**
```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
```

**3b. Extract and validate lang parameter:**
```typescript
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n';

export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang } = await searchParams;

  // Validate lang parameter (null if invalid or unsupported)
  const requestedLanguage: SupportedLocale | null =
    lang && isSupportedLocale(lang) ? lang : null;

  // ... rest of implementation
}
```

**3c. Pass language context to ItemDisplay:**

This will be used with the useGuestLanguage hook to initialize client-side language state:

```typescript
return (
  <ItemDisplay
    item={itemResponse.data}
    initialLanguage={requestedLanguage}  // NEW prop
  />
);
```

### Task 4: Create Guest Language Detection Utility

**File:** `/src/lib/i18n/guest-language.ts` (NEW FILE)

Create a utility for guest-facing language detection that includes URL parameter priority:

```typescript
/**
 * Guest Language Detection Utility
 * Provides language detection for guest-facing pages with URL parameter support.
 *
 * REQ-355: Handle URL parameter for shareable links
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 5, Task 5.4
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { cookies, headers } from 'next/headers';
import {
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

/**
 * Guest language cookie name (separate from authenticated users)
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Detects guest language with URL parameter taking highest priority.
 *
 * Priority Order:
 * 1. URL parameter (?lang=xx)
 * 2. Cookie (FAQBNB_GUEST_LANG or FAQBNB_LANG)
 * 3. Accept-Language header
 * 4. Default ('en')
 *
 * @param urlLangParam - The lang query parameter from URL
 * @returns Detected locale code
 */
export async function detectGuestLanguage(
  urlLangParam?: string | null
): Promise<SupportedLocale> {
  // Priority 1: URL parameter
  if (urlLangParam && isSupportedLocale(urlLangParam)) {
    console.log('[guest-i18n] Language from URL parameter:', urlLangParam);
    return urlLangParam;
  }

  // Priority 2: Cookie
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(GUEST_LOCALE_COOKIE_NAME)?.value;
  const mainCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  const cookieLocale = guestCookie || mainCookie;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    console.log('[guest-i18n] Language from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguageHeader(acceptLanguage);
    for (const locale of parsed) {
      if (isSupportedLocale(locale)) {
        console.log('[guest-i18n] Language from Accept-Language:', locale);
        return locale;
      }
    }
  }

  // Priority 4: Default
  console.log('[guest-i18n] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}

/**
 * Parses Accept-Language header and returns language codes sorted by preference.
 * @param acceptLanguage - The Accept-Language header value
 * @returns Array of language codes sorted by quality value
 */
function parseAcceptLanguageHeader(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');
      const primaryCode = code.split('-')[0].toLowerCase();
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { locale: primaryCode, quality: isNaN(quality) ? 0 : quality };
    })
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .map((l) => l.locale)
    .filter((v, i, a) => a.indexOf(v) === i); // Unique values
}

/**
 * Sets guest language preference cookie (client-side utility)
 * @param language - The language to set
 */
export function setGuestLanguageCookie(language: SupportedLocale): void {
  if (typeof document === 'undefined') return;

  const maxAge = 365 * 24 * 60 * 60; // 1 year
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=${language};path=/;expires=${expires};SameSite=Lax`;
}

/**
 * Generates a shareable URL with language parameter
 * @param baseUrl - The base URL (e.g., '/item/ABC123')
 * @param language - The language to include
 * @returns URL with lang parameter (e.g., '/item/ABC123?lang=fr')
 */
export function generateShareableUrl(
  baseUrl: string,
  language: SupportedLocale
): string {
  const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'https://faqbnb.com');
  url.searchParams.set('lang', language);
  return url.toString();
}
```

### Task 5: Update lib/i18n/index.ts Exports

**File:** `/src/lib/i18n/index.ts`
**Add exports for new guest language utilities:**

```typescript
// Guest Language Detection exports (REQ-355)
export {
  detectGuestLanguage,
  setGuestLanguageCookie,
  generateShareableUrl,
  GUEST_LOCALE_COOKIE_NAME,
} from './guest-language';
```

### Task 6: Update ItemDisplay Props Interface

**File:** `/src/types/index.ts`
**Lines:** 411-413

Update ItemDisplayProps to accept initial language:

```typescript
export interface ItemDisplayProps {
  item: ItemResponse['data'];
  /** Initial language from URL parameter (for shareable links) */
  initialLanguage?: SupportedLocale | null;
}
```

### Task 7: Update ItemDisplay to Use initialLanguage

**File:** `/src/components/ItemDisplay.tsx`

Update the component to pass `initialLanguage` to the `useGuestLanguage` hook (once that hook is available from REQ-350):

```typescript
export default function ItemDisplay({ item, initialLanguage }: ItemDisplayProps) {
  // ... existing state ...

  // When useGuestLanguage hook is integrated (REQ-350+):
  // const { currentLanguage, showOriginal, setLanguage, toggleOriginal } = useGuestLanguage({
  //   initialLanguage: initialLanguage || undefined,
  //   sourceLanguage: item.sourceLanguage || 'en',
  //   availableTranslations: item.availableTranslations || [],
  // });

  // ... rest of component
}
```

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File | Authorized Changes |
|------|-------------------|
| `/src/app/item/[publicId]/page.tsx` | Add searchParams to props, update generateMetadata with canonical URL, read lang parameter |
| `/src/lib/i18n/guest-language.ts` | NEW FILE - Guest language detection utility |
| `/src/lib/i18n/index.ts` | Add exports for guest language utilities |
| `/src/types/index.ts` | Update ItemDisplayProps interface |
| `/src/components/ItemDisplay.tsx` | Accept and handle initialLanguage prop |

### Functions/Sections Authorized for Modification

| File | Function/Section | Change Description |
|------|------------------|-------------------|
| `/src/app/item/[publicId]/page.tsx` | `PageProps` interface (lines 6-8) | Add `searchParams` prop |
| `/src/app/item/[publicId]/page.tsx` | `generateMetadata` function (lines 11-58) | Add searchParams, return canonical URL |
| `/src/app/item/[publicId]/page.tsx` | `ItemPage` function (lines 61-106) | Read lang param, pass to ItemDisplay |
| `/src/lib/i18n/index.ts` | exports section | Add guest-language exports |
| `/src/types/index.ts` | `ItemDisplayProps` interface (lines 411-413) | Add `initialLanguage` prop |
| `/src/components/ItemDisplay.tsx` | Component signature | Accept `initialLanguage` prop |

### Files NOT to Modify

- `/src/middleware.ts` - Guest pages are not in the middleware matcher (by design)
- `/src/lib/i18n/language-detection.ts` - This is for authenticated routes; guest detection is separate
- Any database files - No schema changes required
- Any API routes - URL parameter is handled at page level

---

## Technical Considerations

### SEO and Canonical URLs

The canonical URL MUST exclude the language parameter:
- `?lang=fr` should have canonical: `/item/ABC123`
- `?lang=es` should have canonical: `/item/ABC123`
- No parameter should have canonical: `/item/ABC123`

This tells search engines that all language variations are the same content, avoiding duplicate content penalties.

### URL Parameter Validation

Invalid or unsupported language codes should be ignored silently:
- `?lang=xyz` (invalid) → Falls back to cookie/header/default
- `?lang=zh` (unsupported) → Falls back to cookie/header/default
- `?lang=FR` (uppercase) → Should be normalized to lowercase

### Cookie Synchronization

When a user visits with `?lang=fr`:
1. The page should render in French (if translation available)
2. The cookie should NOT be automatically updated (user might be viewing a shared link)
3. Only explicit language selection via the GuestLanguageSwitcher should update the cookie

### Shareable Link Generation

The client-side hook or component should provide a function to generate shareable URLs:
```typescript
const shareUrl = generateShareableUrl('/item/ABC123', 'fr');
// Returns: 'https://faqbnb.com/item/ABC123?lang=fr'
```

---

## Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| `isSupportedLocale` function | `/src/lib/i18n/config.ts` | Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `DEFAULT_LOCALE` constant | `/src/lib/i18n/config.ts` | Available |
| `LOCALE_COOKIE_NAME` constant | `/src/lib/i18n/config.ts` | Available |

### Required After Implementation

| Consumer | Task |
|----------|------|
| useGuestLanguage hook | REQ-350 (should accept initialLanguage) |
| GuestLanguageSwitcher component | REQ-345 (should use generateShareableUrl) |
| ItemDisplay full integration | REQ-352 (Phase 5.2) |

---

## Testing Checklist

### URL Parameter Handling
- [ ] Page accepts `?lang=fr` parameter and renders in French (when translation available)
- [ ] Page ignores invalid language codes (`?lang=xyz`) and falls back gracefully
- [ ] Page ignores unsupported language codes (`?lang=zh`) and falls back gracefully
- [ ] Page handles uppercase codes (`?lang=FR`) by normalizing to lowercase
- [ ] Page works correctly with no lang parameter

### Canonical URL
- [ ] Page with `?lang=fr` has canonical URL without lang parameter
- [ ] Page with `?lang=es` has canonical URL without lang parameter
- [ ] Page without lang parameter has correct canonical URL
- [ ] Canonical URL is absolute (includes domain)

### Cookie Behavior
- [ ] Visiting with `?lang=fr` does NOT automatically update user's cookie preference
- [ ] Only explicit language selection via switcher updates cookie
- [ ] Cookie fallback works when no URL parameter provided

### Share Functionality
- [ ] `generateShareableUrl` produces correct URL format
- [ ] Generated URLs include current display language
- [ ] URLs work when recipients click them

---

## Acceptance Criteria

1. **AC-1:** Page router reads `lang` query parameter from URL search params
2. **AC-2:** Valid language parameter takes highest priority in language detection hierarchy
3. **AC-3:** Language parameter validates against supported language codes list
4. **AC-4:** Invalid or unsupported language codes are ignored and fallback detection proceeds
5. **AC-5:** Share functionality generates URLs including current language as query parameter
6. **AC-6:** Generated shareable URLs use format: `{base_url}?lang={code}`
7. **AC-7:** Canonical URL meta tag in page head excludes language query parameter
8. **AC-8:** Canonical URL points to base page path without query parameters
9. **AC-9:** Language parameter works correctly on all guest-facing pages (items, articles, etc.)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 5.4)
- **Epic 4 PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-355)
- **Existing Page:** `/src/app/item/[publicId]/page.tsx`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Language Detection Utility:** `/src/lib/i18n/language-detection.ts`
- **Type Definitions:** `/src/types/index.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 5, Task 5.4*
