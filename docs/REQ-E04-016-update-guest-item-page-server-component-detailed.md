# Update Guest Item Page Server Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:20
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #16 - REQ-E04-016)
- Overview: docs/REQ-E04-016-update-guest-item-page-server-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

**Last Modified:** 2026-01-22 23:20

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

Update the guest item page server component (`src/app/item/[publicId]/page.tsx`) to detect guest language preference, fetch translated content from the API, and pass translation metadata to the client component for rendering. This enables the Epic 4 guest experience with multi-language support and SEO optimization for translated content.

**Key Features:**
- Detect guest language from URL parameter (`?lang=`), cookie (FAQBNB_GUEST_LANG), or Accept-Language header
- Fetch item data with translations from `/api/public/items/[publicId]?lang=xx` endpoint
- Pass translation metadata (requestedLanguage, displayLanguage, availableLanguages, isTranslated, originalLanguage) to ItemDisplay client component
- Update metadata generation (SEO) to use translated title/description
- Generate alternate language links for SEO (hreflang support)
- Maintain backward compatibility with demo data and non-translated items
- Handle server-side language detection for initial page load

**Size:** L (6-8 hours estimated effort)

---

## 1. Review Existing Page Component Structure

**Context:** Before making changes, understand the current implementation of the guest item page.

**Files to reference:** `src/app/item/[publicId]/page.tsx` (current implementation)

**Estimated effort:** 1 story point

- [ ] **1.1** Read `src/app/item/[publicId]/page.tsx` to understand current structure
- [ ] **1.2** Identify the current PageProps interface
- [ ] **1.3** Review the current ItemPage component implementation
- [ ] **1.4** Review the current generateMetadata function implementation
- [ ] **1.5** Note how item data is currently fetched (API vs demo data)
- [ ] **1.6** Identify current imports and dependencies
- [ ] **1.7** Document current data flow from server component to ItemDisplay
- [ ] **1.8** Verify current ItemDisplay prop structure

---

## 2. Add Language Detection Imports

**Context:** Import necessary utilities and types for language detection and translation support.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add import for Next.js headers API: `import { headers, cookies } from 'next/headers';`
- [ ] **2.2** Verify existing imports remain intact (notFound, ItemDisplay, Metadata, etc.)
- [ ] **2.3** Add import for SupportedLanguage type: `import type { SupportedLanguage } from '@/types';`
- [ ] **2.4** Add import for detectGuestLanguage utility: `import { detectGuestLanguage } from '@/lib/i18n/guest-language';`
- [ ] **2.5** Verify all imports resolve correctly (no TypeScript errors)
- [ ] **2.6** Verify next-intl imports are present (getTranslations, getLocale from 'next-intl/server')
- [ ] **2.7** Organize imports by category (Next.js, local components, utilities, types)

---

## 3. Update PageProps Interface

**Context:** Add searchParams to PageProps to enable URL parameter access for language detection.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Locate existing PageProps interface definition
- [ ] **3.2** Add searchParams property: `searchParams: Promise<{ [key: string]: string | string[] | undefined }>;`
- [ ] **3.3** Verify params property is already a Promise (Next.js 15 pattern)
- [ ] **3.4** Add JSDoc comment explaining searchParams is for URL parameter access
- [ ] **3.5** Verify TypeScript accepts the updated interface
- [ ] **3.6** Document that searchParams is a Promise in Next.js 15

---

## 4. Create detectGuestLanguagePreference Helper Function

**Context:** Create a reusable helper function to detect guest language preference with priority cascade.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Add section comment above the function: `// =============================================================================`
- [ ] **4.2** Add function comment: `// Language Detection Helper`
- [ ] **4.3** Add closing divider: `// =============================================================================`
- [ ] **4.4** Add comprehensive JSDoc comment explaining priority cascade (URL > Cookie > Accept-Language > Default)
- [ ] **4.5** Define function signature: `async function detectGuestLanguagePreference(searchParams: { [key: string]: string | string[] | undefined }): Promise<SupportedLanguage> {`
- [ ] **4.6** Wrap entire function body in try-catch block for error handling
- [ ] **4.7** **Priority 1**: Check URL parameter `?lang=` using `searchParams.lang`
- [ ] **4.8** Verify lang parameter is a string (not array): `if (typeof langParam === 'string' && langParam) {`
- [ ] **4.9** Call `detectGuestLanguage(langParam)` to validate and return if valid
- [ ] **4.10** Add console log: `console.log('[item-page] Language from URL param:', detected);`
- [ ] **4.11** **Priority 2**: Get cookie store: `const cookieStore = await cookies();`
- [ ] **4.12** Read FAQBNB_GUEST_LANG cookie: `const langCookie = cookieStore.get('FAQBNB_GUEST_LANG')?.value;`
- [ ] **4.13** Call `detectGuestLanguage(langCookie)` to validate and return if valid
- [ ] **4.14** Add console log: `console.log('[item-page] Language from cookie:', detected);`
- [ ] **4.15** **Priority 3**: Get headers list: `const headersList = await headers();`
- [ ] **4.16** Read Accept-Language header: `const acceptLanguage = headersList.get('accept-language');`
- [ ] **4.17** Call `detectGuestLanguage(acceptLanguage)` to validate and return if valid
- [ ] **4.18** Add console log: `console.log('[item-page] Language from header:', detected);`
- [ ] **4.19** **Priority 4**: Return default language 'en'
- [ ] **4.20** Add console log: `console.log('[item-page] Using default language: en');`
- [ ] **4.21** In catch block, log error: `console.error('[item-page] Language detection error:', error);`
- [ ] **4.22** In catch block, return 'en' as fallback
- [ ] **4.23** Close function with `}`
- [ ] **4.24** Verify function compiles without TypeScript errors

---

## 5. Update ItemPage Component for Language Detection

**Context:** Modify the main page component to detect language and use it in API fetching.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Locate the ItemPage function definition: `export default async function ItemPage({ params, searchParams }: PageProps) {`
- [ ] **5.2** Inside try block, resolve searchParams: `const resolvedSearchParams = await searchParams;`
- [ ] **5.3** Call language detection helper: `const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);`
- [ ] **5.4** Add console log: `console.log('[item-page] Detected language:', requestedLanguage);`
- [ ] **5.5** Verify params resolution is already present: `const { publicId } = await params;`

---

## 6. Update API Fetch with Language Parameter

**Context:** Modify the API fetch to include the language parameter for translation support.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Locate the existing API fetch URL construction
- [ ] **6.2** Keep existing base URL: `const apiUrl = \`\${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/\${publicId}\`;`
- [ ] **6.3** Create URL object: `const url = new URL(apiUrl);`
- [ ] **6.4** Add language query parameter: `url.searchParams.set('lang', requestedLanguage);`
- [ ] **6.5** Update fetch call to use `url.toString()` instead of direct apiUrl
- [ ] **6.6** Verify cache configuration is present: `next: { revalidate: 60 }`
- [ ] **6.7** Add console log: `console.log('[item-page] Fetching with URL:', url.toString());`

---

## 7. Extract Translation Metadata from API Response

**Context:** Parse the API response to extract both item data and translation metadata.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Locate the API response handling: `if (response.ok) {`
- [ ] **7.2** Parse response: `const itemResponse = await response.json();`
- [ ] **7.3** Check success flag: `if (itemResponse.success && itemResponse.data) {`
- [ ] **7.4** Destructure response: `const { item, translationMeta } = itemResponse.data;`
- [ ] **7.5** Add console log: `console.log('[item-page] Translation metadata:', translationMeta);`
- [ ] **7.6** Verify item and translationMeta are both present before proceeding
- [ ] **7.7** Document expected translationMeta structure in a comment

---

## 8. Pass Translation Metadata to ItemDisplay Component

**Context:** Update the ItemDisplay component instantiation to pass translation metadata.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Locate the ItemDisplay component return statement
- [ ] **8.2** Add translationMeta prop to ItemDisplay: `<ItemDisplay item={item} translationMeta={{`
- [ ] **8.3** Pass requestedLanguage: `requestedLanguage: translationMeta.requestedLanguage,`
- [ ] **8.4** Pass displayLanguage: `displayLanguage: translationMeta.displayLanguage,`
- [ ] **8.5** Pass availableLanguages: `availableLanguages: translationMeta.availableLanguages,`
- [ ] **8.6** Pass isTranslated flag: `isTranslated: translationMeta.isTranslated,`
- [ ] **8.7** Pass originalLanguage with fallback: `originalLanguage: translationMeta.originalLanguage || 'en',`
- [ ] **8.8** Close translationMeta object: `}} />`
- [ ] **8.9** Verify no TypeScript errors with new prop

---

## 9. Update Demo Data Fallback Path

**Context:** Ensure demo data path provides default translation metadata for backward compatibility.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Locate the demo data fallback section (when API fails)
- [ ] **9.2** Verify demo item fetching remains unchanged: `const demoItem = getItemByPublicId(publicId);`
- [ ] **9.3** Locate the ItemDisplay return statement for demo data
- [ ] **9.4** Add translationMeta prop to demo data ItemDisplay
- [ ] **9.5** Set requestedLanguage to 'en' (demo data has no translations)
- [ ] **9.6** Set displayLanguage to 'en'
- [ ] **9.7** Set availableLanguages to `['en']` (only English available)
- [ ] **9.8** Set isTranslated to `false` (demo data is original content)
- [ ] **9.9** Set originalLanguage to 'en'
- [ ] **9.10** Add comment: `// Demo data has no translations - provide default metadata`
- [ ] **9.11** Verify demo data path compiles without errors

---

## 10. Update generateMetadata Function Signature

**Context:** Add searchParams parameter to generateMetadata for language detection.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Locate generateMetadata function: `export async function generateMetadata({ params }: PageProps): Promise<Metadata> {`
- [ ] **10.2** Add searchParams to destructured parameters: `{ params, searchParams }`
- [ ] **10.3** Verify return type remains `Promise<Metadata>`
- [ ] **10.4** Verify existing getTranslations and getLocale calls remain
- [ ] **10.5** Document that searchParams is needed for language detection

---

## 11. Add Language Detection to generateMetadata

**Context:** Detect guest language in metadata generation for SEO optimization.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Inside generateMetadata try block, resolve searchParams: `const resolvedSearchParams = await searchParams;`
- [ ] **11.2** Call language detection helper: `const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);`
- [ ] **11.3** Add console log: `console.log('[item-page] Metadata language:', requestedLanguage);`
- [ ] **11.4** Verify params resolution: `const { publicId } = await params;`

---

## 12. Update Metadata API Fetch with Language

**Context:** Fetch translated content for metadata generation (same URL as page component).

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Locate metadata API fetch URL construction
- [ ] **12.2** Create URL object: `const url = new URL(apiUrl);`
- [ ] **12.3** Add language parameter: `url.searchParams.set('lang', requestedLanguage);`
- [ ] **12.4** Update fetch call to use `url.toString()`
- [ ] **12.5** Verify cache configuration: `next: { revalidate: 60 }`
- [ ] **12.6** Verify Next.js will deduplicate this fetch with the page component fetch

---

## 13. Use Translated Content in Metadata

**Context:** Extract translated title and description from API response for SEO.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Locate metadata response parsing: `if (response.ok) {`
- [ ] **13.2** Parse response: `const itemResponse = await response.json();`
- [ ] **13.3** Check success: `if (itemResponse.success && itemResponse.data) {`
- [ ] **13.4** Destructure: `const { item, translationMeta } = itemResponse.data;`
- [ ] **13.5** Use translated name directly: `const displayName = item.name; // Already translated by API`
- [ ] **13.6** Use translated description: `const displayDescription = item.description; // Already translated by API`
- [ ] **13.7** Add comment explaining that API returns translated content in item fields

---

## 14. Update Metadata Return Object with Translated Content

**Context:** Return metadata object with translated title, description, and OpenGraph data.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Locate metadata return object
- [ ] **14.2** Set title to translated name: `title: displayName,`
- [ ] **14.3** Set description to translated description with fallback: `description: displayDescription || t('view.description', { itemName: displayName }),`
- [ ] **14.4** Update OpenGraph title: `title: displayName,`
- [ ] **14.5** Update OpenGraph description: `description: displayDescription || t('view.ogDescription', { itemName: displayName }),`
- [ ] **14.6** Update OpenGraph locale: `locale: translationMeta.displayLanguage || locale,`
- [ ] **14.7** Keep existing metadataBase and type settings
- [ ] **14.8** Verify all metadata fields use translated content

---

## 15. Add Alternate Language Links for SEO

**Context:** Generate hreflang alternate links for all available languages to improve SEO.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Locate metadata return object
- [ ] **15.2** Add alternates section after OpenGraph
- [ ] **15.3** Add languages property: `alternates: { languages: {`
- [ ] **15.4** Use reduce to build language map: `translationMeta.availableLanguages.reduce((acc, lang) => {`
- [ ] **15.5** Set URL for each language: `acc[lang] = \`/item/\${publicId}?lang=\${lang}\`;`
- [ ] **15.6** Return accumulator: `return acc;`
- [ ] **15.7** Provide initial value: `}, {} as Record<string, string>)`
- [ ] **15.8** Close languages object and alternates
- [ ] **15.9** Verify TypeScript accepts the alternates structure
- [ ] **15.10** Add comment explaining hreflang benefits for SEO

---

## 16. Update Metadata Demo Data Fallback

**Context:** Ensure metadata generation works for demo data without translations.

**Files to modify:** `src/app/item/[publicId]/page.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Locate demo data fallback in generateMetadata
- [ ] **16.2** Verify existing metadata structure is preserved
- [ ] **16.3** Keep using next-intl translations for demo data: `t('view.title', { itemName: demoItem.name })`
- [ ] **16.4** Keep existing OpenGraph structure
- [ ] **16.5** Use authenticated locale for demo data (no guest language detection for fallback)
- [ ] **16.6** No alternate languages for demo data (only English)
- [ ] **16.7** Verify demo data metadata generation doesn't break

---

## 17. Create TranslationMeta Type Interface

**Context:** Define TypeScript interface for translation metadata to ensure type safety.

**Files to modify:** `src/types/index.ts` (or create if not exists)

**Estimated effort:** 1 story point

- [ ] **17.1** Check if `src/types/index.ts` file exists
- [ ] **17.2** If not exists, create new file with proper header
- [ ] **17.3** Import SupportedLanguage: `import type { SupportedLanguage } from './l10n';`
- [ ] **17.4** Add interface section comment: `// Translation Metadata`
- [ ] **17.5** Define TranslationMeta interface: `export interface TranslationMeta {`
- [ ] **17.6** Add JSDoc comment explaining the interface
- [ ] **17.7** Add property: `requestedLanguage: SupportedLanguage;` with comment "Language requested by guest"
- [ ] **17.8** Add property: `displayLanguage: SupportedLanguage;` with comment "Language being displayed (may differ if translation unavailable)"
- [ ] **17.9** Add property: `availableLanguages: SupportedLanguage[];` with comment "List of available translation languages for this item"
- [ ] **17.10** Add property: `isTranslated: boolean;` with comment "Whether content is being shown in translated form"
- [ ] **17.11** Add property: `originalLanguage: SupportedLanguage;` with comment "Original language of the content"
- [ ] **17.12** Close interface with `}`
- [ ] **17.13** Export interface with `export interface`

---

## 18. Update ItemDisplayProps Interface

**Context:** Add optional translationMeta prop to ItemDisplayProps for backward compatibility.

**Files to modify:** `src/types/index.ts` (or wherever ItemDisplayProps is defined)

**Estimated effort:** 1 story point

- [ ] **18.1** Locate ItemDisplayProps interface definition
- [ ] **18.2** Import TranslationMeta if defined in separate file
- [ ] **18.3** Add optional translationMeta property: `translationMeta?: TranslationMeta;`
- [ ] **18.4** Add JSDoc comment: "Optional translation metadata for guest experience"
- [ ] **18.5** Make it optional with `?` for backward compatibility
- [ ] **18.6** Verify existing item property remains unchanged
- [ ] **18.7** Export updated interface

---

## 19. Verify TypeScript Compilation

**Context:** Ensure all changes compile without TypeScript errors.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **19.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **19.2** Verify no errors in `src/app/item/[publicId]/page.tsx`
- [ ] **19.3** Verify no errors in `src/types/index.ts`
- [ ] **19.4** Verify TranslationMeta interface is correctly defined
- [ ] **19.5** Verify ItemDisplayProps accepts optional translationMeta
- [ ] **19.6** Verify detectGuestLanguagePreference function signature is correct
- [ ] **19.7** Verify headers() and cookies() are properly awaited
- [ ] **19.8** Verify searchParams Promise is properly resolved
- [ ] **19.9** Fix any TypeScript errors found
- [ ] **19.10** Re-run type check until all errors are resolved

---

## 20. Test URL Parameter Language Detection

**Context:** Manually test that URL parameter language detection works correctly.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **20.1** Start development server: `npm run dev`
- [ ] **20.2** Visit item page without language parameter: `/item/abc123`
- [ ] **20.3** Check console logs for language detection (should detect default or cookie/header)
- [ ] **20.4** Visit item page with French parameter: `/item/abc123?lang=fr`
- [ ] **20.5** Verify console log shows: "Language from URL param: fr"
- [ ] **20.6** Test all supported languages: en, fr, es, de, nl, it
- [ ] **20.7** Test invalid language parameter: `/item/abc123?lang=invalid`
- [ ] **20.8** Verify fallback to default language 'en'
- [ ] **20.9** Test with multiple parameters: `/item/abc123?lang=es&other=value`
- [ ] **20.10** Verify language detection works with other URL parameters

---

## 21. Test Cookie Language Detection

**Context:** Manually test that cookie language detection works as fallback.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Clear all cookies in browser DevTools
- [ ] **21.2** Manually set cookie: `FAQBNB_GUEST_LANG=fr` via DevTools
- [ ] **21.3** Visit item page without URL parameter: `/item/abc123`
- [ ] **21.4** Verify console log shows: "Language from cookie: fr"
- [ ] **21.5** Test that URL parameter overrides cookie
- [ ] **21.6** Set cookie to 'es', visit with `?lang=fr` parameter
- [ ] **21.7** Verify URL parameter wins (should use 'fr', not 'es')
- [ ] **21.8** Clear cookies and verify fallback to Accept-Language or default
- [ ] **21.9** Document cookie detection priority behavior

---

## 22. Test Accept-Language Header Detection

**Context:** Manually test that Accept-Language header detection works as fallback.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Clear all cookies and URL parameters
- [ ] **22.2** Use browser DevTools or curl to set Accept-Language header to 'fr'
- [ ] **22.3** Visit item page: `/item/abc123`
- [ ] **22.4** Verify console log shows: "Language from header: fr"
- [ ] **22.5** Test with Accept-Language: `fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7`
- [ ] **22.6** Verify detectGuestLanguage parses quality values correctly
- [ ] **22.7** Test that cookie overrides Accept-Language header
- [ ] **22.8** Test that URL parameter overrides both cookie and header
- [ ] **22.9** Document Accept-Language header parsing behavior

---

## 23. Test API Response Handling

**Context:** Verify the page correctly handles API responses with translation metadata.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Visit item page with language parameter: `/item/abc123?lang=fr`
- [ ] **23.2** Open browser DevTools Network tab
- [ ] **23.3** Verify API request is made to `/api/public/items/abc123?lang=fr`
- [ ] **23.4** Check API response includes translationMeta object
- [ ] **23.5** Verify translationMeta has all required properties
- [ ] **23.6** Check that item.name and item.description are translated
- [ ] **23.7** Verify ItemDisplay component receives translationMeta prop
- [ ] **23.8** Test with language that has no translation available
- [ ] **23.9** Verify API returns original content with isTranslated=false
- [ ] **23.10** Document API response format and handling

---

## 24. Test Metadata Generation

**Context:** Verify SEO metadata uses translated content correctly.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Visit item page with French parameter: `/item/abc123?lang=fr`
- [ ] **24.2** View page source (right-click > View Page Source)
- [ ] **24.3** Verify `<title>` tag contains translated item name
- [ ] **24.4** Verify meta description contains translated description
- [ ] **24.5** Verify OpenGraph title uses translated name: `<meta property="og:title" content="..."/>`
- [ ] **24.6** Verify OpenGraph description uses translated description
- [ ] **24.7** Verify OpenGraph locale is set to display language: `<meta property="og:locale" content="fr"/>`
- [ ] **24.8** Check for hreflang alternate links: `<link rel="alternate" hreflang="fr" href="/item/abc123?lang=fr"/>`
- [ ] **24.9** Verify all available languages have hreflang links
- [ ] **24.10** Test metadata for all supported languages
- [ ] **24.11** Document metadata generation behavior

---

## 25. Test Demo Data Fallback Path

**Context:** Verify demo data path works correctly without translations.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Identify a demo data item (one that doesn't exist in database)
- [ ] **25.2** Visit demo item page: `/item/demo-item-id`
- [ ] **25.3** Verify page loads without errors
- [ ] **25.4** Verify ItemDisplay receives translationMeta with default values
- [ ] **25.5** Check translationMeta.requestedLanguage is 'en'
- [ ] **25.6** Check translationMeta.displayLanguage is 'en'
- [ ] **25.7** Check translationMeta.availableLanguages is `['en']`
- [ ] **25.8** Check translationMeta.isTranslated is `false`
- [ ] **25.9** Verify metadata generation uses existing next-intl translations
- [ ] **25.10** Verify no hreflang alternate links for demo data
- [ ] **25.11** Document demo data fallback behavior

---

## 26. Test Error Handling

**Context:** Verify graceful error handling when translation API fails.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Temporarily disable translation API or use invalid publicId
- [ ] **26.2** Visit item page with language parameter
- [ ] **26.3** Verify page falls back to demo data or notFound correctly
- [ ] **26.4** Check console logs for error messages
- [ ] **26.5** Verify no unhandled exceptions crash the page
- [ ] **26.6** Test with network disconnected (simulate offline)
- [ ] **26.7** Verify error handling in language detection function
- [ ] **26.8** Test with malformed API response (missing translationMeta)
- [ ] **26.9** Verify fallback behavior provides default metadata
- [ ] **26.10** Document error handling and fallback strategies

---

## 27. Test Performance and Caching

**Context:** Verify request deduplication and caching work correctly.

**Files to modify:** None (verification and testing)

**Estimated effort:** 1 story point

- [ ] **27.1** Open browser DevTools Network tab
- [ ] **27.2** Visit item page: `/item/abc123?lang=fr`
- [ ] **27.3** Check Network tab for API requests
- [ ] **27.4** Verify only ONE request to `/api/public/items/abc123?lang=fr` is made
- [ ] **27.5** Note that generateMetadata and ItemPage make same fetch
- [ ] **27.6** Verify Next.js deduplicates the requests (should see single request)
- [ ] **27.7** Refresh page after 30 seconds (within revalidate window)
- [ ] **27.8** Verify cached response is used (no new API request)
- [ ] **27.9** Wait 60+ seconds and refresh (past revalidate window)
- [ ] **27.10** Verify new API request is made for fresh data
- [ ] **27.11** Document caching behavior and performance implications

---

## 28. Test Backward Compatibility

**Context:** Ensure existing functionality still works for items without translations.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **28.1** Visit item page for item with no translations
- [ ] **28.2** Verify page loads correctly
- [ ] **28.3** Verify ItemDisplay receives translationMeta with original language only
- [ ] **28.4** Check availableLanguages contains only original language
- [ ] **28.5** Check isTranslated is `false`
- [ ] **28.6** Verify metadata uses original content
- [ ] **28.7** Verify no alternate language links for single-language items
- [ ] **28.8** Test with authenticated user language preference (should not interfere)
- [ ] **28.9** Verify demo data items still work as before
- [ ] **28.10** Document backward compatibility verification

---

## 29. Verify Server Component Constraints

**Context:** Ensure the page remains a valid React Server Component.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **29.1** Verify no 'use client' directive is added to page.tsx
- [ ] **29.2** Verify no client-only hooks are used (useState, useEffect, etc.)
- [ ] **29.3** Verify all async/await usage is correct for server components
- [ ] **29.4** Verify headers() and cookies() are properly awaited
- [ ] **29.5** Verify searchParams and params Promises are resolved
- [ ] **29.6** Check that page uses Next.js 15 server component patterns
- [ ] **29.7** Verify no browser-only APIs are used (window, document, etc.)
- [ ] **29.8** Verify component can be server-rendered successfully
- [ ] **29.9** Test that dynamic rendering is triggered (due to headers/cookies)
- [ ] **29.10** Document server component compliance

---

## 30. ESLint and Code Quality Verification

**Context:** Ensure code passes linting and follows project conventions.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **30.1** Run ESLint: `npm run lint`
- [ ] **30.2** Verify no errors in `src/app/item/[publicId]/page.tsx`
- [ ] **30.3** Verify no errors in `src/types/index.ts`
- [ ] **30.4** Fix any linting errors found
- [ ] **30.5** Verify consistent code formatting (spacing, indentation)
- [ ] **30.6** Verify consistent naming conventions
- [ ] **30.7** Verify console.log statements use consistent prefix: `[item-page]`
- [ ] **30.8** Verify no unused imports
- [ ] **30.9** Verify proper TypeScript types for all variables
- [ ] **30.10** Re-run lint after fixes
- [ ] **30.11** Document code quality verification

---

## 31. Build Verification

**Context:** Ensure the updated page builds successfully for production.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **31.1** Run build command: `npm run build`
- [ ] **31.2** Verify build completes successfully
- [ ] **31.3** Verify no build errors related to page.tsx
- [ ] **31.4** Verify no build warnings about server components
- [ ] **31.5** Check build output for page route: `app/item/[publicId]`
- [ ] **31.6** Verify page is marked as dynamic (not static) due to headers/cookies
- [ ] **31.7** Test production build locally: `npm run start`
- [ ] **31.8** Visit item page in production mode
- [ ] **31.9** Verify language detection works in production
- [ ] **31.10** Verify metadata generation works in production
- [ ] **31.11** Document build verification results

---

## 32. Integration Testing with Client Component

**Context:** Verify server component correctly passes data to ItemDisplay client component.

**Files to modify:** None (integration testing)

**Estimated effort:** 1 story point

- [ ] **32.1** Visit item page with French parameter: `/item/abc123?lang=fr`
- [ ] **32.2** Open React DevTools Components tab
- [ ] **32.3** Locate ItemDisplay component in component tree
- [ ] **32.4** Verify translationMeta prop is present
- [ ] **32.5** Check translationMeta.requestedLanguage is 'fr'
- [ ] **32.6** Check translationMeta.displayLanguage matches API response
- [ ] **32.7** Check translationMeta.availableLanguages array is populated
- [ ] **32.8** Check translationMeta.isTranslated flag is correct
- [ ] **32.9** Verify item prop contains translated content
- [ ] **32.10** Verify ItemDisplay renders correctly with provided data
- [ ] **32.11** Note any issues for REQ-E04-017 implementation
- [ ] **32.12** Document integration verification results

---

## Success Criteria

The task is complete when all of the following are verified:

1. ✅ File `src/app/item/[publicId]/page.tsx` updated with language detection
2. ✅ PageProps interface includes searchParams parameter
3. ✅ detectGuestLanguagePreference helper function created with priority cascade
4. ✅ Priority cascade implemented: URL param > Cookie > Accept-Language > Default
5. ✅ API fetch includes language parameter: `/api/public/items/[publicId]?lang=xx`
6. ✅ Translation metadata extracted from API response
7. ✅ translationMeta prop passed to ItemDisplay component
8. ✅ Demo data fallback provides default translationMeta
9. ✅ generateMetadata function uses translated title and description
10. ✅ OpenGraph metadata uses translated content
11. ✅ OpenGraph locale set to display language
12. ✅ Alternate language links generated for SEO (hreflang)
13. ✅ TranslationMeta interface defined in types file
14. ✅ ItemDisplayProps interface updated with optional translationMeta
15. ✅ All imports correctly added (headers, cookies, SupportedLanguage, detectGuestLanguage)
16. ✅ TypeScript compilation passes with no errors
17. ✅ ESLint passes with no errors
18. ✅ Build completes successfully
19. ✅ URL parameter language detection works correctly
20. ✅ Cookie language detection works correctly
21. ✅ Accept-Language header detection works correctly
22. ✅ Default language fallback works correctly
23. ✅ Metadata uses translated content for SEO
24. ✅ Alternate language links present in page source
25. ✅ Demo data path works without translations
26. ✅ Error handling graceful when API fails
27. ✅ Request deduplication verified (single API call)
28. ✅ Backward compatibility maintained
29. ✅ Page remains valid React Server Component
30. ✅ Ready for REQ-E04-017 (ItemDisplay client component updates)

---

## Dependencies

**Depends On (Must Be Completed First):**
- REQ-E04-001: Create Localization Types File (provides SupportedLanguage type)
- REQ-E04-002: Create Guest Language Utility Module (provides detectGuestLanguage function)
- REQ-E04-005: Create Public Item API Endpoint with Translation Support (provides `/api/public/items/[publicId]?lang=xx`)

**Blocks (Cannot Start Until This Completes):**
- REQ-E04-017: Update ItemDisplay Component (requires translationMeta prop from server component)

**Parallel Safety:**
- ❌ Cannot be parallelized with REQ-E04-017 (this task provides data that REQ-E04-017 consumes)
- ✅ Can be implemented in parallel with REQ-E04-008 through REQ-E04-013 (Guest UI components)
- ✅ Can be implemented in parallel with REQ-E04-014 (useGuestLanguage hook - used by client, not server)

---

## Authorized Files and Functions for Modification

### Files to Modify

1. **`src/app/item/[publicId]/page.tsx`**
   - Type: Server Component (Next.js 15 App Router)
   - Changes:
     - Add language detection imports (headers, cookies, SupportedLanguage, detectGuestLanguage)
     - Update PageProps interface to include searchParams
     - Create detectGuestLanguagePreference helper function
     - Update ItemPage component to detect language and fetch translations
     - Pass translationMeta prop to ItemDisplay component
     - Update demo data fallback to provide default translationMeta
     - Update generateMetadata to use translated content
     - Add alternate language links for SEO

2. **`src/types/index.ts`** (or appropriate types file)
   - Type: TypeScript type definitions
   - Changes:
     - Create TranslationMeta interface
     - Update ItemDisplayProps to include optional translationMeta prop

### Files to Reference (Read-Only)

1. **`src/lib/i18n/guest-language.ts`** (from REQ-E04-002)
   - Reference: `detectGuestLanguage()` function
   - Usage: Language detection with validation

2. **`src/app/api/public/items/[publicId]/route.ts`** (from REQ-E04-005)
   - Reference: API response format with translationMeta
   - Usage: Expected response structure: `{ success, data: { item, translationMeta } }`

3. **`src/components/ItemDisplay.tsx`**
   - Reference: Current component structure
   - Usage: Will be updated in REQ-E04-017 to use translationMeta prop

4. **`src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: `SupportedLanguage` type
   - Usage: Type for language codes

### Dependencies

**NPM Packages:**
- `next/headers` (already installed) - cookies(), headers() APIs
- `next/navigation` (already installed) - notFound()
- `next-intl/server` (already installed) - getTranslations(), getLocale()
- `@/types` (from REQ-E04-001) - SupportedLanguage type
- `@/lib/i18n/guest-language` (from REQ-E04-002) - detectGuestLanguage()

---

## Notes

**Server Component Pattern:**
This is a Next.js 15 Server Component that:
- Detects language preference on the server (no client JavaScript required)
- Fetches translated content on the server for initial render
- Generates SEO metadata with translated content
- Passes translation metadata to client component for interactive features

**Priority Cascade Rationale:**
1. **URL parameter** - Highest priority for shareable links and explicit language selection
2. **Cookie** - Persistent preference across sessions
3. **Accept-Language header** - Browser/OS preference
4. **Default (en)** - Universal fallback

**Next.js 15 Async APIs:**
Next.js 15 makes `headers()`, `cookies()`, `params`, and `searchParams` async. All must be awaited:
```typescript
const headersList = await headers();
const cookieStore = await cookies();
const { publicId } = await params;
const resolved = await searchParams;
```

**Request Deduplication:**
Next.js automatically deduplicates identical fetch requests within a single render. The page component and generateMetadata both fetch the same URL, but only one actual network request is made.

**Dynamic Rendering:**
Using `headers()` and `cookies()` forces dynamic rendering (page cannot be statically generated). This is intended behavior for personalized guest content.

**SEO Benefits:**
- Translated title/description improve search rankings for language-specific queries
- OpenGraph metadata ensures correct language display in social media shares
- hreflang alternate links tell search engines about language variants (no duplicate content penalty)

**Backward Compatibility:**
- translationMeta prop is optional on ItemDisplayProps
- Demo data provides default metadata (no translations)
- Existing items without translations work correctly (availableLanguages: ['en'])

---

**Last Modified:** 2026-01-22 23:20
