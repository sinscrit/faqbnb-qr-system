# REQ-E04-016: Update Guest Item Page with Translation Support - Detailed Task Breakdown

**Request ID:** REQ-E04-016
**Title:** Update Guest Item Page with Translation Support
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20 15:45:00 UTC

---

## Document Purpose

This document provides a granular, step-by-step task breakdown for implementing translation support in the guest item page server component. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify the following dependencies are available:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Check for `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `isSupportedLocale`, `LOCALE_COOKIE_NAME` exports |
| Localization Types | `/src/types/l10n.ts` | Check for `SupportedLocale` type definition |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Check for `detectUserLanguage` or similar function |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | Check for `fetchTranslatedItem` function |
| Public Item API | `/src/app/api/public/items/[publicId]/route.ts` | Check for GET endpoint with `?lang=` parameter support |
| Translation Utils | `/src/lib/translations/translation-utils.ts` | Check for `mergeTranslation`, `getDisplayLanguage` functions |

---

## Implementation Tasks

### Task 1: Update PageProps Interface to Include searchParams

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** None

**Description:**
Add the `searchParams` property to the PageProps interface to enable reading URL query parameters like `?lang=fr`.

**Current Code (lines 6-8):**
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
}
```

**Target Code:**
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

**Acceptance Criteria:**
- [ ] PageProps interface includes `searchParams` property
- [ ] searchParams is typed as `Promise<{ lang?: string }>`
- [ ] TypeScript compilation succeeds without errors
- [ ] No breaking changes to existing params usage

---

### Task 2: Add Required Import Statements

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1, Prerequisites (i18n config, types)

**Description:**
Add the necessary import statements for language detection, translation fetching, and type definitions.

**Current Imports (lines 1-4):**
```typescript
import { notFound } from 'next/navigation';
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';
import { getItemByPublicId } from '@/data/demo-data';
```

**New Imports to Add:**
```typescript
import { headers, cookies } from 'next/headers';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n/config';
```

**Conditional Imports (add if utilities exist):**
```typescript
// Add only if file exists
import { fetchTranslatedItem } from '@/lib/translations/fetch-translations';
import { mergeTranslation, getDisplayLanguage } from '@/lib/translations/translation-utils';
```

**Acceptance Criteria:**
- [ ] `headers` and `cookies` imported from `next/headers`
- [ ] i18n configuration types and constants imported
- [ ] TypeScript compilation succeeds
- [ ] No duplicate imports
- [ ] Imports follow project conventions (alphabetical, grouped)

---

### Task 3: Define TranslationMeta Interface

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 2

**Description:**
Add a local interface definition for TranslationMeta to pass translation context to the client component. This interface may also exist in `/src/types/l10n.ts` - check and import if available, otherwise define locally.

**Code to Add (after PageProps interface):**
```typescript
/**
 * Translation metadata passed to client component
 * Provides context about the current translation state
 */
interface TranslationMeta {
  /** Language that was requested (from URL/cookie/header) */
  requestedLanguage: SupportedLocale;
  /** Language actually being displayed */
  displayLanguage: SupportedLocale;
  /** Original content language */
  sourceLanguage: SupportedLocale;
  /** Languages with available translations */
  availableTranslations: SupportedLocale[];
  /** Whether translated content is being shown */
  isShowingTranslation: boolean;
  /** Translation completeness status */
  translationStatus?: 'complete' | 'partial' | 'missing';
}
```

**Acceptance Criteria:**
- [ ] TranslationMeta interface is defined with all required properties
- [ ] Interface uses SupportedLocale type from i18n config
- [ ] All properties have JSDoc comments explaining their purpose
- [ ] TypeScript compilation succeeds
- [ ] If TranslationMeta exists in `/src/types/l10n.ts`, import it instead of defining locally

---

### Task 4: Implement Server-Side Language Detection Helper

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 2 story points
**Dependencies:** Task 2, Task 3

**Description:**
Create a helper function that detects the guest's preferred language using the priority cascade: URL parameter > Cookie > Accept-Language header > Default.

**Code to Add:**
```typescript
/**
 * Detect guest language preference using priority cascade:
 * 1. URL parameter ?lang=xx (highest - enables shareable links)
 * 2. Cookie FAQBNB_LANG or FAQBNB_GUEST_LANG (persisted preference)
 * 3. Accept-Language header (browser preference)
 * 4. Default to 'en' (fallback)
 */
async function detectGuestLanguage(urlLang?: string): Promise<SupportedLocale> {
  // Priority 1: URL parameter
  if (urlLang && isSupportedLocale(urlLang)) {
    return urlLang;
  }

  // Priority 2: Cookie
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLang && isSupportedLocale(cookieLang)) {
      return cookieLang;
    }
  } catch (error) {
    // Cookie access may fail in some contexts, continue to next priority
    console.warn('Failed to read language cookie:', error);
  }

  // Priority 3: Accept-Language header
  try {
    const headersList = await headers();
    const acceptLang = headersList.get('Accept-Language');
    if (acceptLang) {
      // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en;q=0.8")
      const languages = acceptLang.split(',');
      for (const langEntry of languages) {
        // Extract language code (before any '-' or ';')
        const langCode = langEntry.split(';')[0]?.split('-')[0]?.trim().toLowerCase();
        if (langCode && isSupportedLocale(langCode)) {
          return langCode;
        }
      }
    }
  } catch (error) {
    // Header access may fail in some contexts, continue to default
    console.warn('Failed to read Accept-Language header:', error);
  }

  // Priority 4: Default
  return DEFAULT_LOCALE;
}
```

**Acceptance Criteria:**
- [ ] Function accepts optional `urlLang` parameter
- [ ] Function returns a valid `SupportedLocale` type
- [ ] URL parameter takes highest priority when valid
- [ ] Cookie is checked when no valid URL parameter
- [ ] Accept-Language header is parsed correctly
- [ ] Function defaults to `DEFAULT_LOCALE` when all sources fail
- [ ] Invalid language codes are rejected and fall through to next priority
- [ ] Error handling prevents crashes from cookie/header access failures
- [ ] Function is async to support Next.js server component patterns

---

### Task 5: Update ItemPage Function Signature

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1, Task 4

**Description:**
Update the ItemPage function to accept and destructure `searchParams` alongside `params`.

**Current Code (line 61):**
```typescript
export default async function ItemPage({ params }: PageProps) {
```

**Target Code:**
```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
```

**Additional Code to Add Inside Function (beginning):**
```typescript
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Detect guest language preference
  const detectedLanguage = await detectGuestLanguage(urlLang);
```

**Acceptance Criteria:**
- [ ] Function signature includes `searchParams` parameter
- [ ] `searchParams` is awaited before destructuring
- [ ] `urlLang` is extracted from searchParams
- [ ] `detectGuestLanguage` is called with `urlLang`
- [ ] `detectedLanguage` is available for use in fetch logic
- [ ] TypeScript compilation succeeds

---

### Task 6: Update API Fetch URL to Include Language Parameter

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 5

**Description:**
Modify the API fetch URL to include the detected language as a query parameter, enabling the API to return translated content.

**Current Code (lines 66-68):**
```typescript
const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
  next: { revalidate: 60 },
});
```

**Target Code:**
```typescript
// Fetch item with translation support
const apiUrl = new URL(`/api/public/items/${publicId}`, process.env.NEXTAUTH_URL || 'http://localhost:3000');
apiUrl.searchParams.set('lang', detectedLanguage);

const response = await fetch(apiUrl.toString(), {
  next: { revalidate: 60 }, // Cache for 60 seconds
});
```

**Notes:**
- Uses the public API endpoint created in REQ-E04-005
- If public endpoint doesn't exist yet, fall back to existing endpoint
- URL constructor ensures proper URL encoding

**Acceptance Criteria:**
- [ ] API URL includes `?lang=` query parameter
- [ ] Uses public API endpoint path (`/api/public/items/`)
- [ ] URL is properly constructed using URL constructor
- [ ] Detected language is passed as the lang parameter
- [ ] Cache settings (revalidate: 60) are preserved
- [ ] Falls back to existing API if public endpoint unavailable

---

### Task 7: Build TranslationMeta Object from API Response

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 3, Task 6

**Description:**
Extract translation metadata from the API response and construct a TranslationMeta object to pass to the client component.

**Code to Add (inside successful response handling):**
```typescript
if (response.ok) {
  const itemResponse = await response.json();
  if (itemResponse.success && itemResponse.data) {
    // Build translation metadata from API response
    const translationMeta: TranslationMeta = {
      requestedLanguage: detectedLanguage,
      displayLanguage: itemResponse.data.translationMeta?.displayLanguage || detectedLanguage,
      sourceLanguage: itemResponse.data.sourceLanguage || 'en',
      availableTranslations: itemResponse.data.availableTranslations || [],
      isShowingTranslation: detectedLanguage !== (itemResponse.data.sourceLanguage || 'en'),
      translationStatus: itemResponse.data.translationMeta?.status || 'complete',
    };

    return (
      <ItemDisplay
        item={itemResponse.data}
        translationMeta={translationMeta}
      />
    );
  }
}
```

**Acceptance Criteria:**
- [ ] TranslationMeta object is constructed with all required properties
- [ ] `requestedLanguage` uses the detected language
- [ ] `displayLanguage` falls back to detected language if not in response
- [ ] `sourceLanguage` falls back to 'en' if not in response
- [ ] `availableTranslations` falls back to empty array if not in response
- [ ] `isShowingTranslation` correctly compares detected vs source language
- [ ] `translationStatus` is extracted or defaults to 'complete'
- [ ] translationMeta is passed as prop to ItemDisplay

---

### Task 8: Update Demo Data Fallback with Translation Metadata

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 3, Task 7

**Description:**
When falling back to demo data, provide default TranslationMeta indicating no translations are available.

**Code to Update (demo data fallback section):**
```typescript
// Fallback to demo data if API fails
console.log(`API failed for ${publicId}, falling back to demo data`);
const demoItem = getItemByPublicId(publicId);

if (!demoItem) {
  notFound();
}

// Demo data doesn't have translations - create default metadata
const defaultTranslationMeta: TranslationMeta = {
  requestedLanguage: detectedLanguage,
  displayLanguage: 'en', // Demo data is in English
  sourceLanguage: 'en',
  availableTranslations: [],
  isShowingTranslation: false,
  translationStatus: 'missing',
};

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
    translationMeta={defaultTranslationMeta}
  />
);
```

**Acceptance Criteria:**
- [ ] Default TranslationMeta is created for demo data
- [ ] `requestedLanguage` uses the detected language
- [ ] `displayLanguage` is 'en' (demo data language)
- [ ] `sourceLanguage` is 'en'
- [ ] `availableTranslations` is empty array
- [ ] `isShowingTranslation` is false
- [ ] `translationStatus` is 'missing'
- [ ] translationMeta is passed to ItemDisplay

---

### Task 9: Update generateMetadata Function Signature

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1, Task 4

**Description:**
Update the generateMetadata function to accept searchParams and detect the guest's language for SEO metadata.

**Current Code (line 11):**
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
```

**Target Code:**
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Detect language for localized metadata
  const detectedLanguage = await detectGuestLanguage(urlLang);
```

**Acceptance Criteria:**
- [ ] Function signature includes `searchParams` parameter
- [ ] Both params and searchParams are awaited
- [ ] `urlLang` is extracted from searchParams
- [ ] `detectGuestLanguage` is called with `urlLang`
- [ ] `detectedLanguage` is available for API fetch

---

### Task 10: Update Metadata API Fetch with Language Parameter

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 9

**Description:**
Update the metadata generation to fetch translated content and use translated title/description for SEO.

**Code to Update:**
```typescript
// Inside generateMetadata function
try {
  // Fetch item with translation for metadata
  const apiUrl = new URL(`/api/public/items/${publicId}`, process.env.NEXTAUTH_URL || 'http://localhost:3000');
  apiUrl.searchParams.set('lang', detectedLanguage);

  const response = await fetch(apiUrl.toString(), {
    next: { revalidate: 60 },
  });

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
        locale: detectedLanguage, // Add locale for OpenGraph
      },
    };
  }
  // ... rest of fallback logic
}
```

**Acceptance Criteria:**
- [ ] Metadata fetch includes language parameter
- [ ] Uses public API endpoint path
- [ ] Translated title is used in metadata when available
- [ ] Translated description is used in metadata when available
- [ ] OpenGraph locale is set to detected language
- [ ] Fallback to demo data still works

---

### Task 11: Add Error Handling for Translation Fetch Failures

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 6-10

**Description:**
Ensure graceful fallback when translation fetching fails, showing original content without breaking the page.

**Code Pattern:**
```typescript
// In ItemPage function
try {
  // ... existing fetch logic ...

  // If API returns but translation is missing, handle gracefully
  if (response.ok) {
    const itemResponse = await response.json();
    if (itemResponse.success && itemResponse.data) {
      // Check if translation was actually applied
      const hasTranslation = itemResponse.data.translationMeta?.isTranslated ?? false;

      const translationMeta: TranslationMeta = {
        requestedLanguage: detectedLanguage,
        displayLanguage: hasTranslation ? detectedLanguage : (itemResponse.data.sourceLanguage || 'en'),
        sourceLanguage: itemResponse.data.sourceLanguage || 'en',
        availableTranslations: itemResponse.data.availableTranslations || [],
        isShowingTranslation: hasTranslation,
        translationStatus: hasTranslation ? 'complete' : 'missing',
      };

      return (
        <ItemDisplay
          item={itemResponse.data}
          translationMeta={translationMeta}
        />
      );
    }
  }
} catch (error) {
  console.error('Error fetching translated item:', error);
  // Fall through to demo data fallback
}
```

**Acceptance Criteria:**
- [ ] Translation fetch errors are caught and logged
- [ ] Page does not crash when translation unavailable
- [ ] Original content is displayed as fallback
- [ ] TranslationMeta correctly indicates translation status
- [ ] Error details are not exposed to guests

---

### Task 12: Add File Header Comments and Documentation

**File:** `/src/app/item/[publicId]/page.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** All previous tasks

**Description:**
Add appropriate file-level documentation and function comments explaining the translation support implementation.

**File Header to Add:**
```typescript
/**
 * Guest Item Detail Page
 *
 * Server component that displays item details for guests (no authentication required).
 * Supports automatic language detection and translation display.
 *
 * Language Detection Priority:
 * 1. URL parameter ?lang=xx (enables shareable links)
 * 2. Cookie FAQBNB_LANG (persisted preference)
 * 3. Accept-Language header (browser preference)
 * 4. Default to English
 *
 * @file /src/app/item/[publicId]/page.tsx
 * @see REQ-E04-016 - Update Guest Item Page with Translation Support
 * @lastModified 2026-01-20
 */
```

**Acceptance Criteria:**
- [ ] File has descriptive header comment
- [ ] Language detection priority is documented
- [ ] REQ reference is included
- [ ] Last modified date is accurate
- [ ] Key functions have JSDoc comments

---

## Complete Target Code Structure

After all tasks are complete, the file should have this structure:

```typescript
/**
 * Guest Item Detail Page
 * ... (file header)
 */

import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { Metadata } from 'next';
import ItemDisplay from '@/components/ItemDisplay';
import { getItemByPublicId } from '@/data/demo-data';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
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

// ============ Helper Functions ============
async function detectGuestLanguage(urlLang?: string): Promise<SupportedLocale> {
  // ... implementation from Task 4
}

// ============ Metadata Generation ============
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  // ... implementation from Tasks 9-10
}

// ============ Page Component ============
export default async function ItemPage({ params, searchParams }: PageProps) {
  // ... implementation from Tasks 5-8, 11
}

// ============ Static Params ============
export async function generateStaticParams() {
  return [];
}
```

---

## Testing Checklist

### Unit Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| URL param `?lang=fr` | Page uses French language |
| URL param `?lang=invalid` | Falls through to cookie/header/default |
| Cookie set to `es` | Page uses Spanish when no URL param |
| Accept-Language: `de-DE,de` | Page uses German when no URL param or cookie |
| No language indicators | Page defaults to English |
| Invalid language in all sources | Page defaults to English |

### Integration Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Visit `/item/ABC123?lang=fr` | API called with `?lang=fr`, French content displayed |
| Visit `/item/ABC123` with French cookie | API called with `?lang=fr` |
| Visit with Accept-Language: es | API called with `?lang=es` |
| Translation API fails | Demo data displayed with English metadata |
| Item not found | 404 page shown |

### Manual Verification

1. Visit `/item/[validPublicId]?lang=fr` - verify page loads
2. Check browser Network tab - verify API called with `?lang=fr`
3. View page source - verify metadata includes translated title
4. Clear cookies, set browser language to German - verify German detection
5. Visit with `?lang=invalid` - verify fallback to default

---

## Rollback Plan

If issues are discovered after deployment:

1. **Revert PageProps Change:** Remove `searchParams` from interface
2. **Revert Import Changes:** Remove `headers`, `cookies` imports
3. **Revert API URL:** Change back to `/api/items/` without lang param
4. **Remove TranslationMeta:** Remove interface and all usages
5. **Remove Language Detection:** Remove `detectGuestLanguage` function

The ItemDisplay component should handle missing `translationMeta` prop gracefully for backward compatibility.

---

## References

- **Overview Document:** `/docs/REQ-E04-016-update-guest-item-page-server-component-overview.md`
- **Requirements:** `/docs/gen_requests_epic4.md` - REQ-E04-016
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Page:** `/src/app/item/[publicId]/page.tsx`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Next.js Server Components:** https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **Related Tasks:** REQ-E04-017 (ItemDisplay client component update)

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task 5.1 of Phase 5: Update Guest Pages*
