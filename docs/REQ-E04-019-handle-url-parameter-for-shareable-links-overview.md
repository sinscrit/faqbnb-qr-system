# Implementation Overview: Handle URL Parameter for Shareable Links

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-019 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:25 |
| Breakdown Created | 2026-01-22 19:38 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |

---

## Goals

Implement URL parameter handling for language-specific shareable links in the guest item page. This enables guests to share links that open content in a specific language while maintaining proper SEO with canonical URLs that exclude language parameters.

**Success Criteria:**
- Guest item page reads and uses `?lang=` URL parameter for language selection
- Language parameter takes highest priority in detection cascade (URL > Cookie > Header > Default)
- Shareable links include the current language parameter when appropriate
- Canonical URL in metadata excludes the language parameter to prevent SEO duplication
- Invalid language codes are gracefully ignored and fall back to standard detection
- URL updates when language is changed via GuestLanguageSwitcher (using `router.replace`)
- Browser history is handled appropriately (replace vs push state)

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-016 (Update Guest Item Page Server Component) has been completed, so language detection infrastructure exists
- REQ-E04-014 (useGuestLanguage hook) has been completed, providing client-side language state management
- REQ-E04-002 (Guest Language Utility Module) provides `detectGuestLanguage` utility
- Next.js 15 App Router conventions are followed (async params and searchParams)
- Supported languages are defined in `/src/types/l10n.ts` or `/src/lib/i18n/config.ts`

**Clarifications Needed:**
- Should the shareable link copy button be added to ItemDisplay component, or is this task only about URL parameter handling?
- **Answer:** This task focuses on URL parameter handling. A dedicated "Share" button with copy functionality is out of scope but can be added later.

---

## Implementation Plan

### Step 1: Update Server Component to Read URL Language Parameter
- **Description**: Modify `/src/app/item/[publicId]/page.tsx` to read the `?lang=` query parameter from searchParams and pass it to the language detection function
- **Rationale**: Server component must prioritize URL parameter for shareable links to work correctly. This is the entry point for all language detection.
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
// Current signature (line ~67):
export default async function ItemPage({ params }: PageProps)

// Update to:
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ItemPage({ params, searchParams }: PageProps)
```

Read the `lang` parameter and use it in detection:
```typescript
const { publicId } = await params;
const { lang } = await searchParams;

// Pass to detection function (assumes detectGuestLanguage utility exists from REQ-E04-002)
const detectedLanguage = await detectGuestLanguage(lang);
```

### Step 2: Update Canonical URL in Metadata Generation
- **Description**: Modify `generateMetadata` function to explicitly set canonical URL without language parameters
- **Rationale**: Prevents SEO duplicate content issues. Search engines should index the canonical (language-neutral) URL.
- **Estimated Effort**: XS (15-30 minutes)

**Implementation Details:**
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;

  // Canonical URL should NOT include ?lang= parameter
  const canonicalUrl = `${process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'}/item/${publicId}`;

  return {
    metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
    title: t('view.title', { itemName: item.name }),
    description: item.description || t('view.description', { itemName: item.name }),
    alternates: {
      canonical: canonicalUrl,  // ADD THIS
    },
    openGraph: {
      title: t('view.ogTitle', { itemName: item.name }),
      description: item.description || t('view.ogDescription', { itemName: item.name }),
      type: 'website',
      locale: locale,
      url: canonicalUrl,  // ADD THIS
    },
  };
}
```

### Step 3: Update useGuestLanguage Hook to Sync URL Parameter
- **Description**: Modify the `useGuestLanguage` hook to update the URL when language changes, using `router.replace` to avoid polluting browser history
- **Rationale**: When guests change language via the switcher, the URL should update to create a shareable link. Using `replace` instead of `push` prevents creating multiple history entries.
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// In /src/hooks/useGuestLanguage.ts
import { useRouter, useSearchParams } from 'next/navigation';

export function useGuestLanguage(options: UseGuestLanguageOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setLanguage = (language: SupportedLanguage) => {
    // Update cookie for persistence
    setGuestLanguageCookie(language);

    // Update URL parameter for shareability
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', language);

    // Use replace to avoid polluting browser history
    router.replace(`?${params.toString()}`, { scroll: false });

    // Update internal state
    setCurrentLanguage(language);
  };

  return { currentLanguage, showOriginal, setLanguage, toggleOriginal };
}
```

**Note:** The hook must be wrapped in `Suspense` boundary in the parent component because it uses `useSearchParams`.

### Step 4: Validate and Sanitize Language Parameter
- **Description**: Add validation to ensure only supported language codes are accepted from URL parameters
- **Rationale**: Prevents injection attacks and ensures only valid languages are processed
- **Estimated Effort**: XS (15-30 minutes)

**Implementation Details:**
```typescript
// In /src/lib/i18n/guest-language.ts or similar utility

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types/l10n';

export function validateLanguageCode(code: string | string[] | undefined): SupportedLanguage | null {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Normalize to lowercase
  const normalized = code.toLowerCase().trim();

  // Check if it's a supported language
  if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  return null;
}

// Usage in page.tsx:
const { lang } = await searchParams;
const urlLanguage = validateLanguageCode(lang);
const detectedLanguage = await detectGuestLanguage(urlLanguage);
```

### Step 5: Add Shareable Link Generation Utility (Optional)
- **Description**: Create a utility function that generates shareable links with the current language parameter
- **Rationale**: Provides a consistent way to generate shareable URLs throughout the application
- **Estimated Effort**: XS (15-20 minutes)

**Implementation Details:**
```typescript
// In /src/lib/i18n/guest-language.ts or /src/lib/utils/url.ts

export function generateShareableItemLink(
  publicId: string,
  language?: SupportedLanguage,
  baseUrl?: string
): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(`/item/${publicId}`, base);

  if (language && language !== 'en') {
    // Only include language param if it's not the default
    url.searchParams.set('lang', language);
  }

  return url.toString();
}
```

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Server Component Updates
| File | Target | Type |
|------|--------|------|
| `/src/app/item/[publicId]/page.tsx` | `PageProps` interface (~line 7-9) | Modify |
| `/src/app/item/[publicId]/page.tsx` | `ItemPage` function signature (~line 67) | Modify |
| `/src/app/item/[publicId]/page.tsx` | `ItemPage` function body (~line 68-70) | Modify |
| `/src/app/item/[publicId]/page.tsx` | `generateMetadata` function (~line 12) | Modify |
| `/src/app/item/[publicId]/page.tsx` | metadata return object (~line 26-52) | Modify |

### Hook Updates
| File | Target | Type |
|------|--------|------|
| `/src/hooks/useGuestLanguage.ts` | `setLanguage` function | Modify |
| `/src/hooks/useGuestLanguage.ts` | Imports (add `useRouter`, `useSearchParams`) | Modify |

### Utility Functions
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | `validateLanguageCode()` function | Create |
| `/src/lib/i18n/guest-language.ts` or `/src/lib/utils/url.ts` | `generateShareableItemLink()` function | Create |

### Type Definitions (Verification Only)
| File | Target | Type |
|------|--------|------|
| `/src/types/l10n.ts` | Verify `SupportedLanguage` type exists | Verify |
| `/src/types/l10n.ts` | Verify `SUPPORTED_LANGUAGES` constant exists | Verify |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-001** (Task 1.1): Create Localization Types File - Provides `SupportedLanguage` type
- **REQ-E04-002** (Task 1.2): Create Guest Language Utility Module - Provides `detectGuestLanguage` function
- **REQ-E04-014** (Task 4.1): Create useGuestLanguage Hook - Provides hook to be extended with URL sync
- **REQ-E04-015** (Task 4.2): Create Cookie Utility - Provides `setGuestLanguageCookie` function
- **REQ-E04-016** (Task 5.1): Update Guest Item Page Server Component - Establishes language detection in page

### Blocks (Requires This First):
- None - This is a leaf task that enhances existing functionality

### Parallel Safety:
- **Files touched**:
  - `/src/app/item/[publicId]/page.tsx`
  - `/src/hooks/useGuestLanguage.ts`
  - `/src/lib/i18n/guest-language.ts`
- **Conflicts with**:
  - Any other tasks modifying the guest item page
  - Tasks modifying the useGuestLanguage hook
- **Safe to parallelize with**:
  - REQ-E04-018 (Update LinkCard Component) - Different files
  - REQ-E04-020 (Add Guest Language Detection to Middleware) - Different layer
  - REQ-E04-022 through REQ-E04-026 (Testing tasks) - No code conflicts

### External Dependencies:
- Next.js 15 App Router APIs: `useRouter`, `useSearchParams`, `router.replace`
- next-intl for metadata translations (already in use)

---

## Risks and Considerations

### Risk: Suspense Boundary Required for useSearchParams

**Issue:** The `useSearchParams` hook requires a Suspense boundary in Next.js 15. If ItemDisplay uses the updated useGuestLanguage hook without proper Suspense wrapping, it will throw an error.

**Mitigation:**
- Document that ItemDisplay (or parent) must wrap components using useGuestLanguage in Suspense
- Example:
```typescript
<Suspense fallback={<LoadingFallback />}>
  <ItemDisplay item={item} translationMeta={translationMeta} />
</Suspense>
```
- This may have been handled in REQ-E04-017 already, but verify during implementation

### Risk: URL Parameter Injection/XSS

**Issue:** Malicious URL parameters could be passed (e.g., `?lang=<script>alert('xss')</script>`)

**Mitigation:**
- Strict validation using `validateLanguageCode` function
- Only allow values from `SUPPORTED_LANGUAGES` constant
- Type system ensures only `SupportedLanguage` values are used downstream
- Next.js automatically escapes parameters in URLs

### Risk: SEO Crawlers Following Language Links

**Issue:** If search engines crawl language-specific URLs, they may index duplicate content despite canonical tags.

**Mitigation:**
- Canonical URL explicitly set in metadata
- Consider adding `rel="alternate" hreflang="x"` tags for supported languages (future enhancement)
- Language parameter is query-based, not path-based, which search engines handle better
- Example for future:
```typescript
alternates: {
  canonical: canonicalUrl,
  languages: {
    'en': `${canonicalUrl}?lang=en`,
    'fr': `${canonicalUrl}?lang=fr`,
    'es': `${canonicalUrl}?lang=es`,
    // ... other languages
  }
}
```

### Risk: Browser History Pollution

**Issue:** Using `router.push` would create a history entry for every language change, making the back button confusing.

**Mitigation:**
- Use `router.replace` instead of `router.push`
- Add `{ scroll: false }` option to prevent scrolling on URL update
- This provides a cleaner UX where back button goes to previous page, not previous language

### Risk: Race Conditions on Language Change

**Issue:** If a guest rapidly switches languages, multiple URL updates and API calls could occur simultaneously.

**Mitigation:**
- Cookie update is synchronous and immediate
- URL update with `router.replace` is debounced by React
- Server component refetch is handled by Next.js router (automatic deduplication)
- Consider adding loading state in hook if needed

---

## Testing Strategy

### Unit Tests

**Test file:** `/src/hooks/__tests__/useGuestLanguage.test.tsx`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGuestLanguage } from '../useGuestLanguage';

jest.mock('next/navigation');

describe('useGuestLanguage - URL Parameter Handling', () => {
  const mockReplace = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('updates URL parameter when language changes', () => {
    const { result } = renderHook(() => useGuestLanguage({
      initialLanguage: 'en',
      sourceLanguage: 'en',
      availableTranslations: ['en', 'fr', 'es'],
    }));

    act(() => {
      result.current.setLanguage('fr');
    });

    expect(mockReplace).toHaveBeenCalledWith('?lang=fr', { scroll: false });
  });

  it('preserves existing query parameters when adding language', () => {
    mockSearchParams.set('debug', 'true');

    const { result } = renderHook(() => useGuestLanguage({
      initialLanguage: 'en',
      sourceLanguage: 'en',
      availableTranslations: ['en', 'fr'],
    }));

    act(() => {
      result.current.setLanguage('es');
    });

    expect(mockReplace).toHaveBeenCalledWith('?debug=true&lang=es', { scroll: false });
  });
});
```

**Test file:** `/src/lib/i18n/__tests__/guest-language.test.ts`

```typescript
import { validateLanguageCode } from '../guest-language';

describe('validateLanguageCode', () => {
  it('accepts valid language codes', () => {
    expect(validateLanguageCode('en')).toBe('en');
    expect(validateLanguageCode('fr')).toBe('fr');
    expect(validateLanguageCode('ES')).toBe('es'); // Case insensitive
  });

  it('rejects invalid language codes', () => {
    expect(validateLanguageCode('invalid')).toBeNull();
    expect(validateLanguageCode('<script>')).toBeNull();
    expect(validateLanguageCode(['en', 'fr'])).toBeNull();
    expect(validateLanguageCode(undefined)).toBeNull();
  });

  it('handles whitespace', () => {
    expect(validateLanguageCode('  fr  ')).toBe('fr');
  });
});
```

### Integration Tests

**Test file:** `/src/app/item/[publicId]/__tests__/page.integration.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import ItemPage from '../page';

// Mock dependencies
jest.mock('next-intl/server');
jest.mock('@/data/demo-data');

describe('ItemPage - URL Parameter Integration', () => {
  it('uses language from URL parameter', async () => {
    const params = Promise.resolve({ publicId: 'test123' });
    const searchParams = Promise.resolve({ lang: 'fr' });

    // Mock fetch to verify correct language passed
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1', name: 'Test Item', description: 'Test' }
      })
    });

    await ItemPage({ params, searchParams });

    // Verify fetch called with language detection
    expect(global.fetch).toHaveBeenCalled();
  });

  it('ignores invalid language parameter', async () => {
    const params = Promise.resolve({ publicId: 'test123' });
    const searchParams = Promise.resolve({ lang: 'invalid' });

    // Should fall back to default detection (no error thrown)
    await expect(ItemPage({ params, searchParams })).resolves.not.toThrow();
  });
});
```

### Manual Testing Checklist

#### URL Parameter Reading
- [ ] Accessing `/item/abc123?lang=fr` displays content in French
- [ ] Accessing `/item/abc123?lang=es` displays content in Spanish
- [ ] Accessing `/item/abc123?lang=invalid` falls back to cookie/header detection
- [ ] Accessing `/item/abc123` without parameter uses standard detection cascade

#### URL Parameter Updates
- [ ] Selecting French in language switcher updates URL to `?lang=fr`
- [ ] Selecting Spanish updates URL to `?lang=es`
- [ ] Browser back button goes to previous page, not previous language
- [ ] URL update does not scroll the page

#### SEO Metadata
- [ ] View page source: `<link rel="canonical" href="...">` does NOT include `?lang=` parameter
- [ ] OpenGraph URL does NOT include language parameter
- [ ] Page title and description use translated content

#### Shareable Links
- [ ] Copying URL from browser includes current `?lang=` parameter
- [ ] Sharing URL with `?lang=fr` opens in French for recipient
- [ ] Recipient can change language after opening shared link

#### Edge Cases
- [ ] Multiple query parameters work: `?lang=fr&debug=true`
- [ ] Special characters in URL don't cause errors
- [ ] Case insensitive: `?lang=FR` and `?lang=fr` both work
- [ ] Rapid language switching doesn't cause errors

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Share Button UI** - Adding a dedicated "Copy Link" or "Share" button to the ItemDisplay component
2. **Social Media Sharing** - Integration with Twitter, Facebook, WhatsApp share APIs
3. **QR Code Updates** - Modifying QR codes to include language parameters
4. **Analytics Tracking** - Tracking which languages are shared most frequently
5. **Short URLs** - Creating shortened URLs for easier sharing
6. **Email Sharing** - "Email this link" functionality
7. **Middleware Changes** - Already handled in REQ-E04-020
8. **Hreflang Tags** - Alternative language links for SEO (can be future enhancement)
9. **Link Preview Metadata** - Custom OpenGraph images per language
10. **Deep Linking** - Mobile app deep linking with language parameters

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL Parameter Format | Query param `?lang=fr` | QR codes already printed; maintains existing URL structure |
| History Management | `router.replace` | Prevents polluting browser history with language changes |
| Canonical URL | Exclude language parameter | SEO best practice; prevents duplicate content indexing |
| Parameter Validation | Strict whitelist validation | Security: prevents injection, ensures only valid languages |
| Default Language Inclusion | Omit `?lang=en` for default | Cleaner URLs for English content (most common case) |
| URL Update Timing | Immediate on language change | Better UX for shareable links; no additional user action needed |
| Scroll Behavior | `{ scroll: false }` | URL update shouldn't interrupt reading experience |
| Suspense Handling | Required for useSearchParams | Next.js 15 requirement; document in implementation notes |

---

## Notes

- **Minimal Scope:** This is a focused S-sized task (2-3 hours) that enhances existing functionality
- **SEO Critical:** Canonical URL implementation is essential to prevent duplicate content penalties
- **User Experience:** The combination of immediate URL updates and `router.replace` provides seamless shareability without disrupting navigation
- **Security:** Strict validation prevents parameter injection attacks
- **Backward Compatibility:** Works with existing detection cascade; URL parameter simply becomes highest priority
- **Testing Priority:** Focus testing on URL parameter validation and SEO metadata correctness
- **Future Enhancement:** Consider adding explicit hreflang tags in metadata for advanced SEO
- **Documentation:** Update user-facing docs to explain shareable link feature once implemented

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies (REQ-E04-001, REQ-E04-002, REQ-E04-014, REQ-E04-015, REQ-E04-016) are completed
2. Add searchParams parameter to PageProps interface
3. Implement validateLanguageCode utility function
4. Update page.tsx to read and validate URL parameter
5. Update generateMetadata to set canonical URL
6. Update useGuestLanguage hook to sync URL parameter
7. Add Suspense boundary if not already present
8. Write unit tests for validation and hook behavior
9. Perform manual testing with various URL parameters
10. Verify SEO metadata in page source
11. Run typecheck and fix any type errors
12. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:38*
