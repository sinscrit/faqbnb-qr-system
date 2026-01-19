# REQ-355: Handle URL Parameter for Shareable Links - Detailed Task Breakdown

**Last Modified:** 2026-01-19 17:45 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.4
**Dependencies:** REQ-352 (Update Guest Item Page), REQ-350 (useGuestLanguage hook), Epic 1 L10N infrastructure

---

## Document Overview

This document provides a granular, step-by-step task breakdown for implementing shareable URL language parameters in guest-facing pages. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Pre-Implementation Checklist

Before starting implementation, verify these dependencies are in place:

- [ ] `/src/lib/i18n/config.ts` exists with `isSupportedLocale`, `SupportedLocale` type, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`
- [ ] `/src/lib/i18n/index.ts` exists and exports all config utilities
- [ ] `/src/app/item/[publicId]/page.tsx` exists and renders ItemDisplay component
- [ ] `/src/components/ItemDisplay.tsx` exists as a client component

---

## Task Breakdown

### Task 1: Create Guest Language Detection Utility Module

**File:** `/src/lib/i18n/guest-language.ts` (NEW FILE)
**Estimated Effort:** 1 story point
**Dependencies:** `/src/lib/i18n/config.ts`

#### 1.1 Create the file with module header

Create a new file at `/src/lib/i18n/guest-language.ts` with the following header and imports:

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
```

#### 1.2 Add guest cookie name constant

Add constant for guest-specific cookie:

```typescript
/**
 * Guest language cookie name (separate from authenticated users)
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
```

#### 1.3 Implement parseAcceptLanguageHeader function

Add helper function to parse Accept-Language header:

```typescript
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
```

#### 1.4 Implement detectGuestLanguage function

Add the main detection function:

```typescript
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
  // Priority 1: URL parameter (normalized to lowercase)
  if (urlLangParam) {
    const normalizedParam = urlLangParam.toLowerCase();
    if (isSupportedLocale(normalizedParam)) {
      console.log('[guest-i18n] Language from URL parameter:', normalizedParam);
      return normalizedParam;
    }
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
```

#### 1.5 Implement setGuestLanguageCookie function

Add client-side cookie setter:

```typescript
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
```

#### 1.6 Implement generateShareableUrl function

Add URL generation utility:

```typescript
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
  // Handle both relative and absolute URLs
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXTAUTH_URL || 'https://faqbnb.com';

  const url = new URL(baseUrl, origin);
  url.searchParams.set('lang', language);
  return url.toString();
}
```

#### 1.7 Implement getCanonicalUrl function

Add canonical URL generation:

```typescript
/**
 * Generates a canonical URL without language parameter
 * Used for SEO to avoid duplicate content issues
 * @param path - The page path (e.g., '/item/ABC123')
 * @returns Canonical URL without query parameters
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';
  return `${baseUrl}${path}`;
}
```

**Verification:**
- File compiles without TypeScript errors
- All functions are exported correctly
- Console logs help trace language detection flow

---

### Task 2: Update i18n Index Exports

**File:** `/src/lib/i18n/index.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1 complete

#### 2.1 Add exports for guest language utilities

Add the following exports to `/src/lib/i18n/index.ts`:

```typescript
// Guest Language Detection exports (REQ-355)
export {
  detectGuestLanguage,
  setGuestLanguageCookie,
  generateShareableUrl,
  getCanonicalUrl,
  GUEST_LOCALE_COOKIE_NAME,
} from './guest-language';
```

**Verification:**
- Import test: `import { detectGuestLanguage, generateShareableUrl } from '@/lib/i18n';` compiles
- No duplicate exports error

---

### Task 3: Update PageProps Interface in Guest Item Page

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### 3.1 Update PageProps interface to include searchParams

Locate the `PageProps` interface (approximately lines 6-8) and update it:

**Current code:**
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
}
```

**Updated code:**
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

**Verification:**
- TypeScript compiles without errors
- Both functions (`generateMetadata` and `ItemPage`) will be updated in subsequent tasks

---

### Task 4: Update generateMetadata to Add Canonical URL

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 3 complete

#### 4.1 Add import for canonical URL utility

Add import at the top of the file:

```typescript
import { getCanonicalUrl } from '@/lib/i18n';
```

#### 4.2 Update generateMetadata function signature

Update the function signature to accept searchParams:

**Current:**
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
```

**Updated:**
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
```

#### 4.3 Extract publicId and add canonical URL to metadata

Update the metadata return objects to include canonical URL. For the API success case (around line 22-32):

**Current:**
```typescript
return {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: `${item.name} - FAQBNB`,
  description: item.description || `View instructions and resources for ${item.name}`,
  openGraph: {
    title: item.name,
    description: item.description || `View instructions and resources for ${item.name}`,
    type: 'website',
  },
};
```

**Updated:**
```typescript
return {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: `${item.name} - FAQBNB`,
  description: item.description || `View instructions and resources for ${item.name}`,
  openGraph: {
    title: item.name,
    description: item.description || `View instructions and resources for ${item.name}`,
    type: 'website',
  },
  alternates: {
    canonical: `/item/${publicId}`,
  },
};
```

#### 4.4 Update demo data fallback metadata

Also update the demo data fallback case (around lines 36-47) to include canonical URL:

```typescript
return {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: `${demoItem.name} - FAQBNB`,
  description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
  openGraph: {
    title: demoItem.name,
    description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
    type: 'website',
  },
  alternates: {
    canonical: `/item/${publicId}`,
  },
};
```

**Verification:**
- Canonical URL in page source excludes `?lang=` parameter
- Metadata generates correctly for both API and demo data paths
- No TypeScript errors

---

### Task 5: Update ItemPage Function to Read lang Parameter

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1, 2, 3 complete

#### 5.1 Add imports for language detection

Add imports at the top of the file:

```typescript
import { detectGuestLanguage, isSupportedLocale, type SupportedLocale } from '@/lib/i18n';
```

#### 5.2 Update ItemPage function signature

**Current:**
```typescript
export default async function ItemPage({ params }: PageProps) {
```

**Updated:**
```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
```

#### 5.3 Extract and validate lang parameter

Add language detection after extracting publicId (around line 63-64):

**Current:**
```typescript
const { publicId } = await params;
```

**Updated:**
```typescript
const { publicId } = await params;
const { lang } = await searchParams;

// Detect language with URL parameter priority
const detectedLanguage = await detectGuestLanguage(lang);

// Validate and normalize the requested language
const requestedLanguage: SupportedLocale | null =
  lang && isSupportedLocale(lang.toLowerCase()) ? lang.toLowerCase() as SupportedLocale : null;
```

#### 5.4 Pass initialLanguage to ItemDisplay component

Update all ItemDisplay render calls to include the language prop.

**For API success case (around line 73):**

**Current:**
```typescript
return <ItemDisplay item={itemResponse.data} />;
```

**Updated:**
```typescript
return <ItemDisplay item={itemResponse.data} initialLanguage={requestedLanguage} />;
```

**For demo data fallback case (around line 101):**

**Current:**
```typescript
return <ItemDisplay item={itemData} />;
```

**Updated:**
```typescript
return <ItemDisplay item={itemData} initialLanguage={requestedLanguage} />;
```

**Verification:**
- Page loads successfully with `?lang=fr` parameter
- Page loads successfully without lang parameter
- Invalid lang parameter (e.g., `?lang=xyz`) is handled gracefully
- Console shows language detection flow logs

---

### Task 6: Update ItemDisplayProps Interface

**File:** `/src/types/index.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### 6.1 Add SupportedLocale import (if not present)

Check if `SupportedLocale` is already exported in types/index.ts. If not, it will be imported where needed.

#### 6.2 Update ItemDisplayProps interface

Locate `ItemDisplayProps` interface (around lines 411-413) and update:

**Current:**
```typescript
export interface ItemDisplayProps {
  item: ItemResponse['data'];
}
```

**Updated:**
```typescript
export interface ItemDisplayProps {
  item: ItemResponse['data'];
  /** Initial language from URL parameter (for shareable links) - REQ-355 */
  initialLanguage?: string | null;
}
```

**Note:** Using `string | null` instead of `SupportedLocale` to avoid circular dependency issues. The component can validate internally.

**Verification:**
- TypeScript compiles without errors
- JSDoc comment provides context for the prop

---

### Task 7: Update ItemDisplay Component to Accept initialLanguage

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 6 complete

#### 7.1 Update component signature to accept initialLanguage

Locate the component function signature and update:

**Current (example):**
```typescript
export default function ItemDisplay({ item }: ItemDisplayProps) {
```

**Updated:**
```typescript
export default function ItemDisplay({ item, initialLanguage }: ItemDisplayProps) {
```

#### 7.2 Add language state initialization (placeholder for useGuestLanguage hook)

Add state or comment for future hook integration. This provides the foundation for when the useGuestLanguage hook (REQ-350) is integrated:

```typescript
export default function ItemDisplay({ item, initialLanguage }: ItemDisplayProps) {
  // REQ-355: Language from URL parameter
  // When useGuestLanguage hook is available (REQ-350), integrate as follows:
  // const { currentLanguage, showOriginal, setLanguage, toggleOriginal } = useGuestLanguage({
  //   initialLanguage: initialLanguage || undefined,
  //   sourceLanguage: item.sourceLanguage || 'en',
  //   availableTranslations: item.availableTranslations || [],
  // });

  // For now, store initialLanguage for future use
  const urlLanguage = initialLanguage;

  // ... rest of component
```

#### 7.3 Add console log for debugging (optional, can be removed later)

Add temporary debugging to verify language is passed correctly:

```typescript
if (process.env.NODE_ENV === 'development' && urlLanguage) {
  console.log('[ItemDisplay] Received initialLanguage from URL:', urlLanguage);
}
```

**Verification:**
- Component compiles without TypeScript errors
- Console shows language when visiting with `?lang=fr`
- Component renders correctly with and without initialLanguage prop

---

### Task 8: Add Integration Tests for URL Parameter Handling

**File:** `/src/app/item/[publicId]/__tests__/page.test.tsx` (NEW FILE or add to existing)
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-7 complete

#### 8.1 Create test file structure

Create test file with necessary imports:

```typescript
/**
 * Tests for guest item page URL parameter handling
 * REQ-355: Handle URL parameter for shareable links
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, vi } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(() => undefined),
  })),
  headers: vi.fn(() => Promise.resolve({
    get: vi.fn(() => 'en-US,en;q=0.9'),
  })),
}));
```

#### 8.2 Add tests for detectGuestLanguage function

```typescript
import { detectGuestLanguage } from '@/lib/i18n';

describe('detectGuestLanguage', () => {
  it('should prioritize URL parameter over cookie and header', async () => {
    const result = await detectGuestLanguage('fr');
    expect(result).toBe('fr');
  });

  it('should normalize uppercase language codes', async () => {
    const result = await detectGuestLanguage('FR');
    expect(result).toBe('fr');
  });

  it('should ignore invalid language codes', async () => {
    const result = await detectGuestLanguage('xyz');
    expect(result).toBe('en'); // Default
  });

  it('should fall back to default when no parameter provided', async () => {
    const result = await detectGuestLanguage(null);
    expect(result).toBe('en');
  });
});
```

#### 8.3 Add tests for generateShareableUrl function

```typescript
import { generateShareableUrl } from '@/lib/i18n';

describe('generateShareableUrl', () => {
  it('should add lang parameter to URL', () => {
    // Mock window for client-side context
    const originalWindow = global.window;
    global.window = { location: { origin: 'https://faqbnb.com' } } as any;

    const result = generateShareableUrl('/item/ABC123', 'fr');
    expect(result).toBe('https://faqbnb.com/item/ABC123?lang=fr');

    global.window = originalWindow;
  });

  it('should work with server-side rendering', () => {
    const result = generateShareableUrl('/item/ABC123', 'es');
    expect(result).toContain('?lang=es');
  });
});
```

#### 8.4 Add tests for getCanonicalUrl function

```typescript
import { getCanonicalUrl } from '@/lib/i18n';

describe('getCanonicalUrl', () => {
  it('should return URL without query parameters', () => {
    const result = getCanonicalUrl('/item/ABC123');
    expect(result).not.toContain('?');
    expect(result).toContain('/item/ABC123');
  });
});
```

**Verification:**
- All tests pass with `npm run test` or `vitest`
- Tests cover URL parameter, canonical URL, and edge cases

---

## Verification Checklist

After completing all tasks, verify the following:

### Functional Tests

- [ ] Visit `/item/[publicId]?lang=fr` - page renders (check console for language detection)
- [ ] Visit `/item/[publicId]?lang=FR` (uppercase) - normalized to lowercase
- [ ] Visit `/item/[publicId]?lang=xyz` (invalid) - falls back gracefully
- [ ] Visit `/item/[publicId]?lang=zh` (unsupported) - falls back gracefully
- [ ] Visit `/item/[publicId]` (no param) - uses cookie/header/default

### SEO Tests

- [ ] View page source for `/item/[publicId]?lang=fr`
- [ ] Verify `<link rel="canonical" href="...">` does NOT include `?lang=fr`
- [ ] Canonical URL is absolute (includes domain)

### TypeScript Verification

- [ ] Run `npx tsc --noEmit` - no TypeScript errors
- [ ] All new exports are properly typed

### Build Verification

- [ ] Run `npm run build` - build succeeds
- [ ] No unused import warnings for new utilities

---

## Files Modified Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/i18n/guest-language.ts` | CREATE | Guest language detection utilities |
| `/src/lib/i18n/index.ts` | MODIFY | Add guest language exports |
| `/src/app/item/[publicId]/page.tsx` | MODIFY | Add searchParams, canonical URL, pass initialLanguage |
| `/src/types/index.ts` | MODIFY | Add initialLanguage to ItemDisplayProps |
| `/src/components/ItemDisplay.tsx` | MODIFY | Accept and store initialLanguage prop |
| `/src/app/item/[publicId]/__tests__/page.test.tsx` | CREATE | Unit tests for URL parameter handling |

---

## Rollback Plan

If issues are discovered after deployment:

1. **Revert Task 5 changes** to `/src/app/item/[publicId]/page.tsx` - removes URL parameter reading
2. **Revert Task 7 changes** to `/src/components/ItemDisplay.tsx` - removes initialLanguage handling
3. **Revert Task 6 changes** to `/src/types/index.ts` - removes prop definition
4. Keep Tasks 1-2 and 4 - these are additive and don't affect current behavior

The guest language utilities (Tasks 1-2) can remain in codebase as they don't affect existing functionality until integrated.

---

## References

- **Overview Document:** `/docs/REQ-355-handle-url-parameter-for-shareable-links-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-355)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 5.4)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Existing Page:** `/src/app/item/[publicId]/page.tsx`
- **Types Definition:** `/src/types/index.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 5, Task 5.4*
*Last Modified: 2026-01-19 17:45 UTC*
