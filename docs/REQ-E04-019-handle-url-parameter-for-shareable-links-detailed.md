# Detailed Task Breakdown: Handle URL Parameter for Shareable Links

**Document Status:** PENDING
**Last Modified:** 2026-01-22 23:32:17 CET 2026

---

## Document Header

| Field | Value |
|-------|-------|
| Request ID | REQ-E04-019 |
| Request Title | Handle URL Parameter for Shareable Links |
| Epic | Epic 4 - Guest Experience |
| Feature Area | Guest Localization |
| Related Docs | `docs/gen_requests_epic4.md`, `docs/REQ-E04-019-handle-url-parameter-for-shareable-links-overview.md` |
| Depends On | REQ-E04-001, REQ-E04-002, REQ-E04-014, REQ-E04-015, REQ-E04-016 |
| Blocks | None (leaf task) |
| T-shirt Size | S |
| Story Points | 2-3 |

---

## Goals and Context

### Purpose
Implement URL parameter handling for language-specific shareable links in the guest item page. This enables guests to share links that open content in a specific language while maintaining proper SEO with canonical URLs that exclude language parameters.

### Success Criteria
- Guest item page reads and uses `?lang=` URL parameter for language selection
- Language parameter takes highest priority in detection cascade (URL > Cookie > Header > Default)
- Shareable links include the current language parameter when appropriate
- Canonical URL in metadata excludes the language parameter to prevent SEO duplication
- Invalid language codes are gracefully ignored and fall back to standard detection
- URL updates when language is changed via GuestLanguageSwitcher (using `router.replace`)
- Browser history is handled appropriately (replace vs push state)

### Acceptance Criteria from Requirements Document
- [ ] Page reads `?lang=` URL parameter on load
- [ ] Valid language codes update the display language
- [ ] Invalid language codes are ignored (fall back to default detection)
- [ ] Canonical URL in metadata excludes `?lang=` parameter
- [ ] Sharing functionality includes current `?lang=` parameter in generated links
- [ ] Language parameter persists through page navigation where appropriate
- [ ] URL updates when language is changed via GuestLanguageSwitcher
- [ ] Browser history handles language changes appropriately (replace vs push)

---

## Implementation Tasks

### Phase 1: Update Server Component URL Parameter Reading

#### Task 1.1: Update PageProps Interface
**Subtask ID:** **1.1**
- [ ] **1.1.1** Open file `/src/app/item/[publicId]/page.tsx`
- [ ] **1.1.2** Locate the `PageProps` interface definition (around line 7-9)
- [ ] **1.1.3** Add `searchParams` property to interface:
  ```typescript
  interface PageProps {
    params: Promise<{ publicId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
  ```
- [ ] **1.1.4** Verify TypeScript compiles without errors
- [ ] **1.1.5** Commit: "Update PageProps interface to include searchParams"

**Verification:**
- TypeScript compilation succeeds
- Interface matches Next.js 15 App Router conventions (Promise-wrapped)
- searchParams type allows for string, string array, or undefined values

**Notes:**
- Next.js 15 uses async params and searchParams (Promise-wrapped)
- searchParams allows query parameters to be accessed server-side

---

#### Task 1.2: Update ItemPage Function Signature
**Subtask ID:** **1.2**
- [ ] **1.2.1** Locate the `ItemPage` function signature (around line 67)
- [ ] **1.2.2** Update function signature to destructure searchParams:
  ```typescript
  export default async function ItemPage({ params, searchParams }: PageProps)
  ```
- [ ] **1.2.3** Verify function signature matches updated PageProps interface
- [ ] **1.2.4** TypeScript check: `npm run typecheck`
- [ ] **1.2.5** Commit: "Update ItemPage function signature with searchParams"

**Verification:**
- Function signature accepts both params and searchParams
- TypeScript types are correctly inferred
- No compilation errors

---

#### Task 1.3: Extract Language Parameter from URL
**Subtask ID:** **1.3**
- [ ] **1.3.1** At the beginning of ItemPage function body (around line 68-70), await both params and searchParams:
  ```typescript
  const { publicId } = await params;
  const searchParamsData = await searchParams;
  const { lang } = searchParamsData;
  ```
- [ ] **1.3.2** Verify extraction handles both string and string[] types
- [ ] **1.3.3** Add comment explaining URL parameter extraction:
  ```typescript
  // Extract language parameter from URL query (?lang=xx)
  const { lang } = searchParamsData;
  ```
- [ ] **1.3.4** TypeScript check to ensure types are correct
- [ ] **1.3.5** Commit: "Extract language parameter from URL searchParams"

**Verification:**
- `lang` variable correctly extracted from searchParams
- TypeScript infers correct type (string | string[] | undefined)
- Code compiles without errors

**Notes:**
- searchParams can contain arrays if same parameter appears multiple times
- Will validate in next task using validateLanguageCode utility

---

### Phase 2: Implement Language Parameter Validation

#### Task 2.1: Create validateLanguageCode Utility Function
**Subtask ID:** **2.1**
- [ ] **2.1.1** Open file `/src/lib/i18n/guest-language.ts`
- [ ] **2.1.2** Add necessary imports at top of file:
  ```typescript
  import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types/l10n';
  ```
- [ ] **2.1.3** Create `validateLanguageCode` function:
  ```typescript
  /**
   * Validates a language code from URL parameters
   * @param code - The language code to validate (from query params)
   * @returns A validated SupportedLanguage or null if invalid
   */
  export function validateLanguageCode(
    code: string | string[] | undefined
  ): SupportedLanguage | null {
    // Handle undefined or array input
    if (!code || typeof code !== 'string') {
      return null;
    }

    // Normalize to lowercase and trim whitespace
    const normalized = code.toLowerCase().trim();

    // Check if it's a supported language
    if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
      return normalized as SupportedLanguage;
    }

    // Invalid or unsupported language code
    return null;
  }
  ```
- [ ] **2.1.4** Add JSDoc comments explaining function purpose and parameters
- [ ] **2.1.5** Export function for use in page component
- [ ] **2.1.6** TypeScript check: `npm run typecheck`
- [ ] **2.1.7** Commit: "Add validateLanguageCode utility function"

**Verification:**
- Function correctly validates language codes against SUPPORTED_LANGUAGES
- Function returns null for invalid inputs (undefined, arrays, unsupported codes)
- Function handles case-insensitive input (e.g., "FR" → "fr")
- Function trims whitespace from input
- TypeScript types are correctly inferred (return type is SupportedLanguage | null)

**Security Notes:**
- This function prevents injection attacks by strictly validating against whitelist
- Only values in SUPPORTED_LANGUAGES can be returned
- Type system ensures downstream code only receives valid SupportedLanguage values

---

#### Task 2.2: Use Validation in Server Component
**Subtask ID:** **2.2**
- [ ] **2.2.1** Return to `/src/app/item/[publicId]/page.tsx`
- [ ] **2.2.2** Import validateLanguageCode:
  ```typescript
  import { validateLanguageCode } from '@/lib/i18n/guest-language';
  ```
- [ ] **2.2.3** After extracting `lang` from searchParams, validate it:
  ```typescript
  const { lang } = searchParamsData;
  const urlLanguage = validateLanguageCode(lang);
  ```
- [ ] **2.2.4** Pass validated language to detection function:
  ```typescript
  // Priority: URL param (validated) > Cookie > Accept-Language > Default
  const detectedLanguage = await detectGuestLanguage(urlLanguage);
  ```
- [ ] **2.2.5** Verify detectGuestLanguage accepts SupportedLanguage | null as first parameter
- [ ] **2.2.6** TypeScript check: `npm run typecheck`
- [ ] **2.2.7** Commit: "Validate URL language parameter in server component"

**Verification:**
- URL language parameter is validated before use
- Invalid language codes result in null, triggering fallback detection
- Type safety is maintained throughout
- No TypeScript errors

**Notes:**
- detectGuestLanguage should accept null for first parameter (URL param)
- When null, function falls back to cookie/header detection
- This maintains the priority cascade: URL > Cookie > Header > Default

---

### Phase 3: Update Canonical URL in Metadata

#### Task 3.1: Update generateMetadata Function Signature
**Subtask ID:** **3.1**
- [ ] **3.1.1** Locate `generateMetadata` function (around line 12)
- [ ] **3.1.2** Update function signature to accept searchParams:
  ```typescript
  export async function generateMetadata(
    { params, searchParams }: PageProps
  ): Promise<Metadata>
  ```
- [ ] **3.1.3** Verify function signature matches PageProps interface
- [ ] **3.1.4** TypeScript check: `npm run typecheck`
- [ ] **3.1.5** Commit: "Update generateMetadata to accept searchParams"

**Verification:**
- Function signature matches PageProps interface
- TypeScript types are correctly inferred
- No compilation errors

---

#### Task 3.2: Set Canonical URL Without Language Parameter
**Subtask ID:** **3.2**
- [ ] **3.2.1** In generateMetadata function, await params to get publicId:
  ```typescript
  const { publicId } = await params;
  ```
- [ ] **3.2.2** Construct canonical URL without query parameters:
  ```typescript
  // Canonical URL should NOT include ?lang= parameter to prevent SEO duplicate content
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';
  const canonicalUrl = `${baseUrl}/item/${publicId}`;
  ```
- [ ] **3.2.3** Locate the metadata return object (around line 26-52)
- [ ] **3.2.4** Add `alternates` field with canonical URL:
  ```typescript
  return {
    metadataBase: new URL(baseUrl),
    title: t('view.title', { itemName: item.name }),
    description: item.description || t('view.description', { itemName: item.name }),
    alternates: {
      canonical: canonicalUrl,
    },
    // ... rest of metadata
  };
  ```
- [ ] **3.2.5** Update OpenGraph URL to use canonical URL:
  ```typescript
  openGraph: {
    title: t('view.ogTitle', { itemName: item.name }),
    description: item.description || t('view.ogDescription', { itemName: item.name }),
    type: 'website',
    locale: locale,
    url: canonicalUrl,  // Use canonical URL without language parameter
  },
  ```
- [ ] **3.2.6** TypeScript check: `npm run typecheck`
- [ ] **3.2.7** Build check: `npm run build`
- [ ] **3.2.8** Commit: "Add canonical URL to metadata without language parameter"

**Verification:**
- Canonical URL is set in alternates.canonical field
- Canonical URL does NOT include ?lang= parameter
- OpenGraph URL matches canonical URL
- Metadata structure is valid according to Next.js Metadata type
- Build succeeds without errors

**SEO Notes:**
- Canonical URL tells search engines which version is the "main" version
- This prevents duplicate content penalties when same content appears with different ?lang= parameters
- Search engines will index the canonical URL and treat language variants as duplicates

---

### Phase 4: Update useGuestLanguage Hook for URL Sync

#### Task 4.1: Add Next.js Navigation Imports
**Subtask ID:** **4.1**
- [ ] **4.1.1** Open file `/src/hooks/useGuestLanguage.ts`
- [ ] **4.1.2** Add imports at top of file:
  ```typescript
  import { useRouter, useSearchParams } from 'next/navigation';
  ```
- [ ] **4.1.3** Verify imports resolve correctly
- [ ] **4.1.4** TypeScript check: `npm run typecheck`
- [ ] **4.1.5** Commit: "Add navigation imports to useGuestLanguage hook"

**Verification:**
- Imports resolve without errors
- useRouter and useSearchParams are from 'next/navigation' (App Router), not 'next/router' (Pages Router)
- No TypeScript errors

**Notes:**
- Next.js 15 App Router uses 'next/navigation' package
- useSearchParams requires Suspense boundary in parent component

---

#### Task 4.2: Initialize Router and SearchParams in Hook
**Subtask ID:** **4.2**
- [ ] **4.2.1** At the beginning of useGuestLanguage hook body, initialize router and searchParams:
  ```typescript
  export function useGuestLanguage(options: UseGuestLanguageOptions) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ... rest of hook implementation
  }
  ```
- [ ] **4.2.2** Verify hooks are called at top level (not conditionally)
- [ ] **4.2.3** TypeScript check to ensure types are inferred correctly
- [ ] **4.2.4** Commit: "Initialize router and searchParams in useGuestLanguage hook"

**Verification:**
- Hooks are called at top level of custom hook
- TypeScript infers correct types for router and searchParams
- No React hook rules violations
- No TypeScript errors

**React Rules Notes:**
- Hooks must be called at top level, not inside conditions or loops
- useSearchParams returns ReadonlyURLSearchParams
- useRouter returns AppRouterInstance

---

#### Task 4.3: Update setLanguage Function to Sync URL
**Subtask ID:** **4.3**
- [ ] **4.3.1** Locate the `setLanguage` function within useGuestLanguage hook
- [ ] **4.3.2** Update setLanguage to update URL parameter:
  ```typescript
  const setLanguage = useCallback((language: SupportedLanguage) => {
    // Update cookie for persistence across sessions
    setGuestLanguageCookie(language);

    // Update URL parameter for shareability
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', language);

    // Use replace to avoid polluting browser history
    // scroll: false prevents page from scrolling on URL update
    router.replace(`?${params.toString()}`, { scroll: false });

    // Update internal state (trigger re-render)
    setCurrentLanguage(language);
  }, [searchParams, router]);
  ```
- [ ] **4.3.3** Add useCallback dependency array including searchParams and router
- [ ] **4.3.4** Verify setLanguage updates cookie, URL, and state
- [ ] **4.3.5** Add comment explaining why router.replace is used instead of router.push
- [ ] **4.3.6** TypeScript check: `npm run typecheck`
- [ ] **4.3.7** Commit: "Update setLanguage to sync URL parameter with router.replace"

**Verification:**
- setLanguage updates cookie using setGuestLanguageCookie
- setLanguage constructs new URLSearchParams with updated lang parameter
- setLanguage uses router.replace (not push) to avoid history pollution
- scroll: false option prevents page scroll on URL update
- useCallback dependencies include searchParams and router
- TypeScript types are correct
- No compilation errors

**UX Notes:**
- router.replace updates URL without creating new history entry
- This means "back" button goes to previous page, not previous language
- scroll: false keeps user's scroll position when URL updates
- Provides seamless shareable link updates without disrupting reading

---

#### Task 4.4: Preserve Existing Query Parameters
**Subtask ID:** **4.4**
- [ ] **4.4.1** Verify setLanguage implementation preserves existing query parameters
- [ ] **4.4.2** Test scenario: URL has `?debug=true`, changing language should result in `?debug=true&lang=fr`
- [ ] **4.4.3** Add comment explaining parameter preservation:
  ```typescript
  // Preserve existing query parameters (e.g., ?debug=true becomes ?debug=true&lang=fr)
  const params = new URLSearchParams(searchParams.toString());
  params.set('lang', language);
  ```
- [ ] **4.4.4** Verify URLSearchParams.set() updates existing lang parameter or adds new one
- [ ] **4.4.5** Manual test with multiple query parameters
- [ ] **4.4.6** Commit: "Ensure setLanguage preserves existing query parameters"

**Verification:**
- Existing query parameters are preserved when language changes
- URLSearchParams.set() correctly updates or adds lang parameter
- Multiple query parameters work correctly together
- No duplicate parameters in resulting URL

---

### Phase 5: Handle Suspense Boundary Requirement

#### Task 5.1: Verify Suspense Boundary in ItemDisplay Parent
**Subtask ID:** **5.1**
- [ ] **5.1.1** Open `/src/app/item/[publicId]/page.tsx`
- [ ] **5.1.2** Locate where ItemDisplay component is rendered
- [ ] **5.1.3** Check if ItemDisplay is already wrapped in Suspense boundary
- [ ] **5.1.4** If not wrapped, add Suspense boundary:
  ```typescript
  import { Suspense } from 'react';

  // In JSX:
  <Suspense fallback={<div>Loading...</div>}>
    <ItemDisplay item={item} translationMeta={translationMeta} />
  </Suspense>
  ```
- [ ] **5.1.5** If Suspense already exists from REQ-E04-017, verify it's correctly positioned
- [ ] **5.1.6** Add comment explaining Suspense requirement:
  ```typescript
  {/* Suspense required for useSearchParams in useGuestLanguage hook */}
  ```
- [ ] **5.1.7** TypeScript check: `npm run typecheck`
- [ ] **5.1.8** Build check: `npm run build`
- [ ] **5.1.9** Commit: "Add Suspense boundary for useSearchParams in ItemDisplay"

**Verification:**
- ItemDisplay component is wrapped in Suspense boundary
- Fallback UI is provided (loading state)
- No Next.js warnings about missing Suspense
- Build succeeds without errors

**Next.js 15 Notes:**
- useSearchParams requires Suspense boundary in App Router
- Without Suspense, Next.js throws error at runtime
- Fallback is shown during initial render or when searchParams change
- This may have been handled in REQ-E04-017, verify before adding duplicate

---

### Phase 6: Create Shareable Link Generation Utility (Optional)

#### Task 6.1: Create generateShareableItemLink Function
**Subtask ID:** **6.1**
- [ ] **6.1.1** Open `/src/lib/i18n/guest-language.ts` (or create `/src/lib/utils/url.ts`)
- [ ] **6.1.2** Create `generateShareableItemLink` function:
  ```typescript
  /**
   * Generates a shareable item link with optional language parameter
   * @param publicId - The public ID of the item
   * @param language - The language to include in URL (optional)
   * @param baseUrl - The base URL (defaults to current origin or empty)
   * @returns Full URL string with language parameter if provided
   */
  export function generateShareableItemLink(
    publicId: string,
    language?: SupportedLanguage,
    baseUrl?: string
  ): string {
    // Use provided baseUrl or detect from window (client-side only)
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    // Construct base URL
    const url = new URL(`/item/${publicId}`, base);

    // Only include language parameter if it's not the default (English)
    if (language && language !== 'en') {
      url.searchParams.set('lang', language);
    }

    return url.toString();
  }
  ```
- [ ] **6.1.3** Add JSDoc comments explaining function purpose and parameters
- [ ] **6.1.4** Export function for use in components
- [ ] **6.1.5** Verify function works in both server and client contexts
- [ ] **6.1.6** TypeScript check: `npm run typecheck`
- [ ] **6.1.7** Commit: "Add generateShareableItemLink utility function"

**Verification:**
- Function generates correct URL format: `/item/publicId` or `/item/publicId?lang=fr`
- Function omits lang parameter for English (default language)
- Function handles baseUrl parameter for server-side usage
- Function detects window.location.origin on client-side
- Function is type-safe (accepts only SupportedLanguage for language param)
- No TypeScript errors

**Usage Notes:**
- This utility can be used for future "Share" button implementations
- Omitting lang=en keeps URLs cleaner for most common case
- baseUrl parameter allows server-side link generation (e.g., in emails)

---

### Phase 7: Testing

#### Task 7.1: Write Unit Tests for validateLanguageCode
**Subtask ID:** **7.1**
- [ ] **7.1.1** Create test file `/src/lib/i18n/__tests__/guest-language.test.ts` (if not exists)
- [ ] **7.1.2** Write test suite for validateLanguageCode:
  ```typescript
  import { validateLanguageCode } from '../guest-language';

  describe('validateLanguageCode', () => {
    describe('valid language codes', () => {
      it('accepts lowercase supported languages', () => {
        expect(validateLanguageCode('en')).toBe('en');
        expect(validateLanguageCode('fr')).toBe('fr');
        expect(validateLanguageCode('es')).toBe('es');
        expect(validateLanguageCode('de')).toBe('de');
        expect(validateLanguageCode('it')).toBe('it');
        expect(validateLanguageCode('nl')).toBe('nl');
      });

      it('normalizes uppercase to lowercase', () => {
        expect(validateLanguageCode('EN')).toBe('en');
        expect(validateLanguageCode('FR')).toBe('fr');
        expect(validateLanguageCode('ES')).toBe('es');
      });

      it('handles mixed case', () => {
        expect(validateLanguageCode('En')).toBe('en');
        expect(validateLanguageCode('fR')).toBe('fr');
      });

      it('trims whitespace', () => {
        expect(validateLanguageCode('  en  ')).toBe('en');
        expect(validateLanguageCode('fr\t')).toBe('fr');
        expect(validateLanguageCode('\nes')).toBe('es');
      });
    });

    describe('invalid language codes', () => {
      it('rejects undefined', () => {
        expect(validateLanguageCode(undefined)).toBeNull();
      });

      it('rejects arrays', () => {
        expect(validateLanguageCode(['en', 'fr'] as any)).toBeNull();
      });

      it('rejects unsupported language codes', () => {
        expect(validateLanguageCode('zh')).toBeNull();
        expect(validateLanguageCode('ja')).toBeNull();
        expect(validateLanguageCode('invalid')).toBeNull();
      });

      it('rejects potential XSS attempts', () => {
        expect(validateLanguageCode('<script>alert("xss")</script>')).toBeNull();
        expect(validateLanguageCode('javascript:alert(1)')).toBeNull();
      });

      it('rejects empty strings', () => {
        expect(validateLanguageCode('')).toBeNull();
        expect(validateLanguageCode('   ')).toBeNull();
      });
    });
  });
  ```
- [ ] **7.1.3** Run tests: `npm test -- guest-language.test.ts`
- [ ] **7.1.4** Verify all tests pass
- [ ] **7.1.5** Commit: "Add unit tests for validateLanguageCode"

**Verification:**
- All test cases pass
- Tests cover valid inputs (all supported languages, case variations, whitespace)
- Tests cover invalid inputs (undefined, arrays, unsupported codes, XSS attempts)
- Test coverage is comprehensive
- No test failures

---

#### Task 7.2: Write Unit Tests for useGuestLanguage URL Sync
**Subtask ID:** **7.2**
- [ ] **7.2.1** Create or update test file `/src/hooks/__tests__/useGuestLanguage.test.tsx`
- [ ] **7.2.2** Mock Next.js navigation hooks:
  ```typescript
  import { renderHook, act } from '@testing-library/react';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { useGuestLanguage } from '../useGuestLanguage';

  jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
  }));
  ```
- [ ] **7.2.3** Write test for URL parameter update:
  ```typescript
  describe('useGuestLanguage - URL Parameter Sync', () => {
    const mockReplace = jest.fn();
    let mockSearchParams: URLSearchParams;

    beforeEach(() => {
      mockSearchParams = new URLSearchParams();
      (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      mockReplace.mockClear();
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

    it('uses router.replace not router.push', () => {
      const { result } = renderHook(() => useGuestLanguage({
        initialLanguage: 'en',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'fr'],
      }));

      act(() => {
        result.current.setLanguage('de');
      });

      // Verify replace was called (not push)
      expect(mockReplace).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('lang=de'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('passes scroll: false option to router.replace', () => {
      const { result } = renderHook(() => useGuestLanguage({
        initialLanguage: 'en',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'fr'],
      }));

      act(() => {
        result.current.setLanguage('it');
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.any(String),
        { scroll: false }
      );
    });
  });
  ```
- [ ] **7.2.4** Run tests: `npm test -- useGuestLanguage.test.tsx`
- [ ] **7.2.5** Verify all tests pass
- [ ] **7.2.6** Commit: "Add unit tests for useGuestLanguage URL synchronization"

**Verification:**
- All test cases pass
- Tests verify URL parameter is updated on language change
- Tests verify existing query parameters are preserved
- Tests verify router.replace is used (not push)
- Tests verify scroll: false option is passed
- No test failures

---

#### Task 7.3: Write Integration Tests for Server Component
**Subtask ID:** **7.3**
- [ ] **7.3.1** Create test file `/src/app/item/[publicId]/__tests__/page.integration.test.tsx`
- [ ] **7.3.2** Write integration test for URL parameter reading:
  ```typescript
  import { render } from '@testing-library/react';
  import ItemPage from '../page';

  // Mock dependencies
  jest.mock('next-intl/server');
  jest.mock('@/lib/i18n/guest-language');
  jest.mock('@/lib/i18n/translation-fetch');

  describe('ItemPage - URL Parameter Integration', () => {
    it('passes URL language parameter to detection function', async () => {
      const params = Promise.resolve({ publicId: 'test123' });
      const searchParams = Promise.resolve({ lang: 'fr' });

      const { detectGuestLanguage } = require('@/lib/i18n/guest-language');
      detectGuestLanguage.mockResolvedValue('fr');

      await ItemPage({ params, searchParams });

      // Verify detectGuestLanguage was called with validated URL param
      expect(detectGuestLanguage).toHaveBeenCalled();
    });

    it('handles invalid language parameter gracefully', async () => {
      const params = Promise.resolve({ publicId: 'test123' });
      const searchParams = Promise.resolve({ lang: 'invalid' });

      // Should not throw error
      await expect(ItemPage({ params, searchParams })).resolves.not.toThrow();
    });

    it('handles missing language parameter', async () => {
      const params = Promise.resolve({ publicId: 'test123' });
      const searchParams = Promise.resolve({});

      // Should not throw error
      await expect(ItemPage({ params, searchParams })).resolves.not.toThrow();
    });

    it('handles array language parameter', async () => {
      const params = Promise.resolve({ publicId: 'test123' });
      const searchParams = Promise.resolve({ lang: ['en', 'fr'] });

      // Should handle array gracefully (validation returns null)
      await expect(ItemPage({ params, searchParams })).resolves.not.toThrow();
    });
  });
  ```
- [ ] **7.3.3** Run integration tests: `npm test -- page.integration.test.tsx`
- [ ] **7.3.4** Verify all tests pass
- [ ] **7.3.5** Commit: "Add integration tests for URL parameter handling"

**Verification:**
- All integration tests pass
- Tests verify URL parameter is passed to detection function
- Tests verify invalid parameters are handled gracefully
- Tests verify missing parameters don't cause errors
- Tests verify array parameters are handled correctly
- No test failures

---

#### Task 7.4: Manual Testing - URL Parameter Reading
**Subtask ID:** **7.4**
- [ ] **7.4.1** Start development server: `npm run dev`
- [ ] **7.4.2** Test accessing `/item/[validPublicId]?lang=fr` - verify content displays in French
- [ ] **7.4.3** Test accessing `/item/[validPublicId]?lang=es` - verify content displays in Spanish
- [ ] **7.4.4** Test accessing `/item/[validPublicId]?lang=de` - verify content displays in German
- [ ] **7.4.5** Test accessing `/item/[validPublicId]?lang=it` - verify content displays in Italian
- [ ] **7.4.6** Test accessing `/item/[validPublicId]?lang=nl` - verify content displays in Dutch
- [ ] **7.4.7** Test accessing `/item/[validPublicId]?lang=invalid` - verify fallback to cookie/header detection
- [ ] **7.4.8** Test accessing `/item/[validPublicId]?lang=<script>` - verify no XSS, fallback to default
- [ ] **7.4.9** Test accessing `/item/[validPublicId]` without parameter - verify standard detection works
- [ ] **7.4.10** Test case insensitivity: `?lang=FR`, `?lang=fR` - verify works correctly

**Verification:**
- Valid language codes display content in correct language
- Invalid language codes fall back gracefully without errors
- XSS attempts are blocked and don't execute
- Missing parameter uses standard detection cascade
- Case variations work correctly (normalized to lowercase)
- No console errors or warnings

---

#### Task 7.5: Manual Testing - URL Parameter Updates
**Subtask ID:** **7.5**
- [ ] **7.5.1** Navigate to item page without language parameter: `/item/[validPublicId]`
- [ ] **7.5.2** Open GuestLanguageSwitcher and select French
- [ ] **7.5.3** Verify URL updates to `/item/[validPublicId]?lang=fr`
- [ ] **7.5.4** Verify page did not scroll during URL update
- [ ] **7.5.5** Select Spanish in switcher
- [ ] **7.5.6** Verify URL updates to `/item/[validPublicId]?lang=es`
- [ ] **7.5.7** Click browser back button
- [ ] **7.5.8** Verify back button goes to previous page, not previous language
- [ ] **7.5.9** Navigate with existing query param: `/item/[validPublicId]?debug=true`
- [ ] **7.5.10** Select French in switcher
- [ ] **7.5.11** Verify URL becomes `/item/[validPublicId]?debug=true&lang=fr`
- [ ] **7.5.12** Verify debug parameter is preserved

**Verification:**
- Language switcher updates URL with correct language parameter
- URL update does not cause page scroll
- Browser back button behavior is correct (goes to previous page)
- Existing query parameters are preserved when language changes
- Multiple query parameters work correctly together
- No visual glitches or errors during language change

---

#### Task 7.6: Manual Testing - SEO Metadata
**Subtask ID:** **7.6**
- [ ] **7.6.1** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **7.6.2** Open browser DevTools and view page source (or right-click → View Page Source)
- [ ] **7.6.3** Search for `<link rel="canonical"` in source
- [ ] **7.6.4** Verify canonical URL does NOT include `?lang=` parameter
- [ ] **7.6.5** Verify canonical URL format: `https://faqbnb.com/item/[publicId]` or `http://localhost:3000/item/[publicId]`
- [ ] **7.6.6** Search for `<meta property="og:url"` in source
- [ ] **7.6.7** Verify OpenGraph URL does NOT include `?lang=` parameter
- [ ] **7.6.8** Search for `<title>` tag
- [ ] **7.6.9** Verify title uses translated content (e.g., French title when ?lang=fr)
- [ ] **7.6.10** Test with different languages (es, de, it, nl)
- [ ] **7.6.11** Verify canonical URL remains language-neutral in all cases

**Verification:**
- Canonical URL is present in page source
- Canonical URL excludes language query parameter
- OpenGraph URL matches canonical URL (no language parameter)
- Page title and description use translated content
- SEO metadata is correct across all languages
- No duplicate canonical tags

**SEO Notes:**
- Canonical URL tells search engines this is the authoritative version
- Language-specific URLs with ?lang= parameter won't be indexed as duplicates
- Search engines will consolidate ranking signals to canonical URL

---

#### Task 7.7: Manual Testing - Shareable Links
**Subtask ID:** **7.7**
- [ ] **7.7.1** Navigate to `/item/[validPublicId]`
- [ ] **7.7.2** Select French in language switcher
- [ ] **7.7.3** Copy URL from browser address bar
- [ ] **7.7.4** Verify URL contains `?lang=fr`
- [ ] **7.7.5** Open URL in new incognito window
- [ ] **7.7.6** Verify content displays in French immediately
- [ ] **7.7.7** Select Spanish in language switcher
- [ ] **7.7.8** Copy new URL (should contain `?lang=es`)
- [ ] **7.7.9** Share URL with another tester or device
- [ ] **7.7.10** Verify recipient sees content in Spanish
- [ ] **7.7.11** Recipient changes language to German
- [ ] **7.7.12** Verify recipient can change language after opening shared link

**Verification:**
- Current URL always includes language parameter after selection
- Copied URLs are shareable and work in other browsers/devices
- Recipients see content in the shared language immediately
- Recipients can change language after opening shared link
- Shareable links provide consistent language experience

---

#### Task 7.8: Manual Testing - Edge Cases
**Subtask ID:** **7.8**
- [ ] **7.8.1** Test multiple query parameters: `/item/[validPublicId]?lang=fr&debug=true&test=123`
- [ ] **7.8.2** Verify all parameters are preserved and content displays correctly
- [ ] **7.8.3** Test duplicate lang parameters: `/item/[validPublicId]?lang=fr&lang=es`
- [ ] **7.8.4** Verify first parameter is used or validation handles array
- [ ] **7.8.5** Test special characters in URL (URL encoding): `/item/[validPublicId]?lang=fr&note=test%20value`
- [ ] **7.8.6** Verify URL decoding works correctly
- [ ] **7.8.7** Test rapid language switching (click 5 languages quickly)
- [ ] **7.8.8** Verify no race conditions or errors occur
- [ ] **7.8.9** Test with very long URLs (many query parameters)
- [ ] **7.8.10** Verify URL parsing handles edge cases without crashing

**Verification:**
- Multiple query parameters work correctly together
- Duplicate parameters are handled gracefully
- Special characters are properly encoded/decoded
- Rapid language switching doesn't cause errors
- Edge cases don't break functionality or cause crashes
- No console errors in any edge case scenario

---

### Phase 8: TypeScript and Build Verification

#### Task 8.1: TypeScript Compilation Check
**Subtask ID:** **8.1**
- [ ] **8.1.1** Run TypeScript compiler: `npm run typecheck`
- [ ] **8.1.2** Review any type errors
- [ ] **8.1.3** Fix type errors if any:
  - Verify PageProps interface matches function signatures
  - Verify searchParams types are correctly handled
  - Verify validateLanguageCode return type usage
  - Verify router.replace call signature
- [ ] **8.1.4** Re-run typecheck until no errors
- [ ] **8.1.5** Commit any type fixes: "Fix TypeScript errors in URL parameter handling"

**Verification:**
- `npm run typecheck` completes with no errors
- All async/await patterns are correctly typed
- All function signatures match their implementations
- No `any` types introduced
- Type safety is maintained throughout

---

#### Task 8.2: ESLint Check
**Subtask ID:** **8.2**
- [ ] **8.2.1** Run ESLint: `npm run lint`
- [ ] **8.2.2** Review any linting warnings or errors
- [ ] **8.2.3** Fix linting issues:
  - React hooks dependency arrays are complete
  - No unused variables
  - Consistent code style
  - Proper async/await usage
- [ ] **8.2.4** Re-run lint until clean
- [ ] **8.2.5** Commit any lint fixes: "Fix ESLint issues in URL parameter handling"

**Verification:**
- `npm run lint` completes with no errors
- All React hooks have correct dependency arrays
- No unused imports or variables
- Code follows project style guidelines

---

#### Task 8.3: Build Verification
**Subtask ID:** **8.3**
- [ ] **8.3.1** Run production build: `npm run build`
- [ ] **8.3.2** Verify build completes successfully
- [ ] **8.3.3** Check for build warnings related to:
  - Suspense boundaries
  - Dynamic imports
  - Client component usage
  - Metadata generation
- [ ] **8.3.4** If build fails, review error messages and fix issues
- [ ] **8.3.5** Re-run build until successful
- [ ] **8.3.6** Start production server: `npm start`
- [ ] **8.3.7** Smoke test: Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **8.3.8** Verify production build works correctly
- [ ] **8.3.9** Stop production server

**Verification:**
- Production build completes without errors
- No blocking warnings in build output
- Production server starts successfully
- Smoke test passes in production mode
- URL parameter handling works in production build

---

### Phase 9: Documentation and Cleanup

#### Task 9.1: Add Code Comments
**Subtask ID:** **9.1**
- [ ] **9.1.1** Review all modified files for code clarity
- [ ] **9.1.2** Add comments to `/src/app/item/[publicId]/page.tsx`:
  ```typescript
  // Extract language parameter from URL query (?lang=xx)
  // Priority: URL param > Cookie > Accept-Language > Default
  ```
- [ ] **9.1.3** Add comments to `/src/hooks/useGuestLanguage.ts`:
  ```typescript
  // Use router.replace (not push) to avoid polluting browser history
  // scroll: false prevents page from scrolling on URL update
  ```
- [ ] **9.1.4** Add comments to `/src/lib/i18n/guest-language.ts`:
  ```typescript
  // Validates language code from URL parameters against whitelist
  // Returns null for invalid/unsupported codes to trigger fallback detection
  ```
- [ ] **9.1.5** Verify JSDoc comments are present on all new functions
- [ ] **9.1.6** Commit: "Add code comments for URL parameter handling"

**Verification:**
- All new functions have JSDoc comments
- Complex logic has explanatory comments
- Comments explain "why" not just "what"
- No outdated or misleading comments

---

#### Task 9.2: Update Implementation Status
**Subtask ID:** **9.2**
- [ ] **9.2.1** Open this file (`docs/REQ-E04-019-handle-url-parameter-for-shareable-links-detailed.md`)
- [ ] **9.2.2** Update document header:
  - Change **Document Status** from PENDING to COMPLETED
  - Add completion timestamp
- [ ] **9.2.3** Mark all subtask checkboxes as completed `[x]`
- [ ] **9.2.4** Add implementation notes section with any deviations or learnings
- [ ] **9.2.5** Save document
- [ ] **9.2.6** Commit: "Mark REQ-E04-019 as completed"

**Verification:**
- Document status reflects completion
- All checkboxes are marked
- Implementation notes are accurate
- Document is saved and committed

---

#### Task 9.3: Final Commit and Push
**Subtask ID:** **9.3**
- [ ] **9.3.1** Review all changes: `git status`
- [ ] **9.3.2** Verify all modified files are related to this task
- [ ] **9.3.3** Stage all changes: `git add .`
- [ ] **9.3.4** Create final commit with comprehensive message:
  ```bash
  git commit -m "$(cat <<'EOF'
  [REQ-E04-019] Handle URL parameter for shareable links

  Implemented URL parameter handling for language-specific shareable links:
  - Updated PageProps to include searchParams
  - Added validateLanguageCode utility for secure parameter validation
  - Modified generateMetadata to set canonical URL without lang parameter
  - Updated useGuestLanguage hook to sync URL parameter with router.replace
  - Added Suspense boundary for useSearchParams requirement
  - Created generateShareableItemLink utility function
  - Comprehensive test coverage (unit, integration, manual)
  - Verified SEO metadata excludes language parameter from canonical URL

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  EOF
  )"
  ```
- [ ] **9.3.5** Push to remote: `git push origin [branch-name]`
- [ ] **9.3.6** Verify push succeeded

**Verification:**
- All changes are committed
- Commit message follows project conventions
- Changes are pushed to remote repository
- No uncommitted changes remain

---

## Build & Test Commands

| Command | Purpose | Expected Outcome |
|---------|---------|------------------|
| `npm run typecheck` | Run TypeScript type checking | No type errors |
| `npm run lint` | Run ESLint code linting | No linting errors |
| `npm run build` | Build production bundle | Build succeeds without errors |
| `npm test` | Run all unit tests | All tests pass |
| `npm run dev` | Start development server | Server starts, manual testing possible |

**Critical Verification Points:**
1. TypeScript compilation must succeed with no errors
2. All unit tests must pass
3. Production build must complete successfully
4. Manual testing must verify URL parameter functionality
5. SEO metadata must exclude language parameter from canonical URL
6. Browser history must use replace (not push) for language changes
7. Suspense boundary must be present for useSearchParams

---

## Dependencies and Integration Points

### Must Complete Before Starting
- **REQ-E04-001**: Localization types file must exist with `SupportedLanguage` type and `SUPPORTED_LANGUAGES` constant
- **REQ-E04-002**: Guest language utility module must provide `detectGuestLanguage` function
- **REQ-E04-014**: `useGuestLanguage` hook must exist and be functional
- **REQ-E04-015**: Cookie utility must provide `setGuestLanguageCookie` function
- **REQ-E04-016**: Guest item page server component must have language detection infrastructure

### Integration Points
- **Server Component** (`/src/app/item/[publicId]/page.tsx`): Reads URL parameter, validates it, passes to detection
- **Client Hook** (`/src/hooks/useGuestLanguage.ts`): Syncs URL parameter when language changes
- **Utility Functions** (`/src/lib/i18n/guest-language.ts`): Validates language codes from URL
- **SEO Metadata** (`generateMetadata` function): Sets canonical URL without language parameter
- **Suspense Boundary**: Required for useSearchParams in ItemDisplay component

### Files Modified
1. `/src/app/item/[publicId]/page.tsx` - Server component URL handling and metadata
2. `/src/hooks/useGuestLanguage.ts` - Client-side URL sync with router.replace
3. `/src/lib/i18n/guest-language.ts` - Validation and shareable link utilities

### No Conflicts With
- REQ-E04-018 (Update LinkCard Component) - Different files
- REQ-E04-020 (Middleware Language Detection) - Different layer
- REQ-E04-022 through REQ-E04-026 (Testing tasks) - No code conflicts

---

## Risk Mitigation

### Risk: Suspense Boundary Missing
**Impact:** Runtime error "useSearchParams must be wrapped in Suspense"
**Mitigation:** Task 5.1 explicitly verifies or adds Suspense boundary. May already exist from REQ-E04-017.

### Risk: URL Parameter Injection/XSS
**Impact:** Security vulnerability if malicious parameters executed
**Mitigation:** Task 2.1 implements strict whitelist validation. Only `SUPPORTED_LANGUAGES` values accepted.

### Risk: SEO Duplicate Content
**Impact:** Search ranking penalties if language variants indexed separately
**Mitigation:** Task 3.2 sets explicit canonical URL without language parameter. All language variants point to same canonical.

### Risk: Browser History Pollution
**Impact:** Confusing back button behavior (goes to previous language instead of previous page)
**Mitigation:** Task 4.3 uses `router.replace` instead of `router.push`. Back button goes to previous page.

### Risk: Race Conditions on Rapid Language Change
**Impact:** Multiple simultaneous URL updates could cause conflicts
**Mitigation:** Cookie update is synchronous. router.replace is debounced by React. Next.js deduplicates refetches.

---

## Out of Scope

The following are explicitly **NOT** part of this task:
1. Share button UI component (dedicated "Copy Link" button)
2. Social media sharing integrations (Twitter, Facebook, WhatsApp)
3. QR code updates to include language parameters
4. Analytics tracking for shared links
5. URL shortening services
6. Email sharing functionality
7. Hreflang tags for SEO (future enhancement)
8. Custom OpenGraph images per language
9. Mobile app deep linking
10. Link preview customization

---

## Success Criteria Summary

This task is considered complete when:
- ✅ Guest item page reads and validates `?lang=` URL parameter
- ✅ Valid language codes display content in correct language
- ✅ Invalid language codes fall back gracefully without errors
- ✅ URL parameter takes highest priority in detection cascade
- ✅ Canonical URL in metadata excludes language parameter
- ✅ GuestLanguageSwitcher updates URL when language changes
- ✅ Browser history uses replace (back button goes to previous page)
- ✅ URL update doesn't scroll page (scroll: false option)
- ✅ Existing query parameters are preserved during language changes
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Manual testing verifies all functionality
- ✅ SEO metadata is correct (canonical URL verified in page source)
- ✅ TypeScript compilation succeeds
- ✅ Production build succeeds
- ✅ Code is committed with proper git conventions

---

**Document Status:** PENDING
**Last Modified:** 2026-01-22 23:32:17 CET 2026
**Total Tasks:** 9 phases, 29 main tasks
**Estimated Effort:** 2-3 hours (S-sized task)
