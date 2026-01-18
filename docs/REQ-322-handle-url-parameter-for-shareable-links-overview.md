# REQ-322: Handle URL Language Parameter for Shareable Links - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.4
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Guest-facing pages should read language preferences from URL query parameters and include language codes in shareable links while excluding them from canonical URLs for proper SEO handling. This feature enables guests to share localized item links that preserve language context for recipients.

---

## Current Behavior

The guest item page at `/src/app/item/[publicId]/page.tsx`:

1. **No URL parameter processing:** Does not accept or process `?lang=` query parameters
2. **No searchParams in page props:** Currently only uses `params` for the `publicId` route parameter
3. **No canonical URL declaration:** The `generateMetadata` function does not set `alternates.canonical`
4. **Static metadata:** OpenGraph URL is not explicitly set, defaulting to the current URL including any query parameters
5. **No language state in URL:** When users change language via the language switcher, the URL does not update to reflect the selection

---

## Expected Behavior

### URL Parameter Reading
- When a guest visits a page with `?lang=fr`, the application reads this parameter
- Valid language codes (`en`, `fr`, `es`, `de`, `nl`, `it`) are used to set the initial display language
- Invalid or unsupported language codes are handled gracefully with fallback to default detection (cookie > Accept-Language header > original)
- Language parameter takes precedence over cookie and browser header detection

### URL State Synchronization
- When language is changed via the GuestLanguageSwitcher, the URL updates to include the new `lang` parameter
- URL updates use the browser History API (`replaceState`) to avoid full page reloads
- Browser back/forward navigation properly handles URL parameter changes
- Language parameter persists in the URL during other interactions (scrolling, viewing media)

### Shareable Links
- Share functionality includes the current `lang` parameter value in generated shareable links
- Recipients opening shared links see content in the shared language (if translation is available)

### Canonical URL Handling
- Canonical URL meta tag is generated WITHOUT any `lang` query parameters
- Canonical URL points to the clean base path: `https://faqbnb.com/item/{publicId}`
- OpenGraph `og:url` also excludes language parameters to prevent social platform caching issues
- This ensures search engines index the base URL and treat language variants as the same content

---

## Technical Approach

### 1. Server Component Updates (page.tsx)

Update the page props interface to include searchParams:

```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

Read and validate the language parameter:

```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang } = await searchParams;

  // Validate language parameter
  const requestedLanguage = isValidLanguageCode(lang) ? lang : null;

  // Detect language with priority: URL param > Cookie > Accept-Language > default
  const detectedLanguage = await detectGuestLanguage(requestedLanguage);

  // Pass to client component
  return (
    <ItemDisplay
      item={itemData}
      initialLanguage={detectedLanguage}
      requestedLanguage={requestedLanguage}
    />
  );
}
```

### 2. Metadata Generation Updates

Update `generateMetadata` to set canonical URLs:

```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://faqbnb.com'
    : 'http://localhost:3000';

  // Canonical URL without language parameter
  const canonicalUrl = `${baseUrl}/item/${publicId}`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${item.name} - FAQBNB`,
    description: item.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: item.name,
      description: item.description,
      type: 'website',
      url: canonicalUrl, // Clean URL without params
    },
  };
}
```

### 3. Client-Side URL Synchronization (useGuestLanguage hook)

Add URL state management to the hook:

```typescript
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  const [currentLanguage, setCurrentLanguage] = useState(options.initialLanguage);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Update URL when language changes
  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);

    // Update URL with new language parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', language);

    // Use replaceState to avoid adding to history for every language change
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);

    // Persist to cookie
    setGuestLanguageCookie(language);
  }, [pathname, searchParams]);

  return { currentLanguage, setLanguage, ... };
}
```

### 4. Share Functionality Updates

When generating shareable links, include the current language:

```typescript
function getShareableUrl(publicId: string, currentLanguage: SupportedLanguage): string {
  const baseUrl = window.location.origin;
  const url = new URL(`/item/${publicId}`, baseUrl);

  // Include language in shareable link
  url.searchParams.set('lang', currentLanguage);

  return url.toString();
}
```

---

## Integration with Other Components

### Dependencies (from earlier Epic 4 tasks)

| Dependency | Source Request | Status |
|------------|---------------|--------|
| `SupportedLanguage` type | REQ-304 | Required |
| `isValidLanguageCode()` utility | REQ-305 | Required |
| `detectGuestLanguage()` utility | REQ-305 | Required |
| `setGuestLanguageCookie()` utility | REQ-318 | Required |
| `useGuestLanguage` hook | REQ-317 | Required |

### Consumers (later Epic 4 tasks)

| Consumer | Description |
|----------|-------------|
| `ItemDisplay` component | Will receive initial language and handle URL sync |
| Share buttons/copy link | Will include language parameter in URLs |

---

## Acceptance Criteria Mapping

| Criterion | Implementation |
|-----------|---------------|
| Guest item page reads `lang` query parameter | Server component reads from `searchParams` |
| Valid language codes set initial display language | Validation with `isValidLanguageCode()` |
| Invalid codes handled gracefully | Fallback to detection hierarchy |
| Language parameter takes precedence | Detection priority in `detectGuestLanguage()` |
| URL updates when language changes | `window.history.replaceState()` in hook |
| URL updates avoid full page reloads | Uses History API, not `router.push()` |
| Share functionality includes lang parameter | `getShareableUrl()` utility |
| Canonical URL excludes lang parameter | `alternates.canonical` in metadata |
| OpenGraph URL excludes lang parameter | `openGraph.url` in metadata |
| Browser back/forward works correctly | URL state preserved in history |
| Direct navigation from external referrers works | Server reads param on initial load |
| Language persists during other interactions | `replaceState` maintains param |
| No inflated pageview counts | Using `replaceState` not `pushState` |
| Performance maintained | Minimal re-renders, no unnecessary fetches |

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes Required |
|-----------|------------------|
| `/src/app/item/[publicId]/page.tsx` | Add `searchParams` to props, read `lang` param, update `generateMetadata` for canonical URLs |
| `/src/components/ItemDisplay.tsx` | Accept `initialLanguage` prop, integrate URL state sync |
| `/src/hooks/useGuestLanguage.ts` | Add URL synchronization with `replaceState` |

### Files to Create

| File Path | Purpose |
|-----------|---------|
| (None - functionality added to existing files) | |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `generateMetadata` | `/src/app/item/[publicId]/page.tsx` | Add `alternates.canonical` and `openGraph.url` |
| `ItemPage` (default export) | `/src/app/item/[publicId]/page.tsx` | Add `searchParams` processing, pass language to client |
| `useGuestLanguage` | `/src/hooks/useGuestLanguage.ts` | Add `useSearchParams`, `usePathname`, URL sync logic |
| `ItemDisplay` | `/src/components/ItemDisplay.tsx` | Accept and use `initialLanguage` prop |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `getShareableUrl` | `/src/lib/i18n/guest-language.ts` or `/src/lib/url-utils.ts` | Generate shareable URLs with language param |
| `isValidLanguageCode` | `/src/lib/i18n/guest-language.ts` | Validate language code against supported list |

---

## Technical Constraints

1. **Next.js 15 searchParams:** In App Router, `searchParams` is a Promise that must be awaited
2. **No router.push for language change:** Would cause full page re-render and add unnecessary history entries
3. **Server/Client boundary:** Initial language detection happens server-side, subsequent changes are client-side only
4. **Canonical URL standards:** Must not include any query parameters per SEO best practices
5. **Cookie persistence:** Language preference should also be saved to cookie when URL changes
6. **No analytics inflation:** Use `replaceState` instead of `pushState` to avoid false pageview counts

---

## Edge Cases to Handle

| Edge Case | Handling |
|-----------|----------|
| Invalid language code in URL (`?lang=xyz`) | Ignore and fall back to cookie/browser detection |
| Empty language parameter (`?lang=`) | Treat as no parameter, use default detection |
| Multiple language parameters (`?lang=fr&lang=es`) | Use first value only |
| Language code case sensitivity (`?lang=FR`) | Normalize to lowercase before validation |
| URL with other params (`?lang=fr&ref=share`) | Preserve other params when updating URL |
| Direct access without cookie | Use URL param as only preference source |
| User clears browser history | Language preference still in cookie |

---

## Testing Scenarios

### Manual Testing

1. **URL Parameter Reading:**
   - Navigate to `/item/abc123?lang=fr` - content should display in French (if available)
   - Navigate to `/item/abc123?lang=invalid` - should fall back to default language

2. **URL Updates:**
   - Load page, change language via switcher - URL should update without reload
   - Browser back button - should return to previous language state

3. **Shareable Links:**
   - Change language to French, copy shareable link
   - Link should contain `?lang=fr`
   - Opening link in incognito should show French content

4. **SEO Verification:**
   - View page source, find canonical URL - should NOT contain `?lang=`
   - Check OpenGraph meta tags - URL should be clean

5. **Cross-session Persistence:**
   - Set language via URL parameter
   - Close tab, open same URL without parameter
   - Cookie should restore preference

---

## Performance Considerations

- **No additional API calls:** Language changes that already have data loaded are client-side only
- **Minimal re-renders:** URL sync uses native History API, not React state for URL
- **ISR compatibility:** Canonical URLs support Incremental Static Regeneration caching

---

## Dependencies on External Systems

| System | Dependency |
|--------|------------|
| Browser History API | `window.history.replaceState()` |
| Next.js App Router | `searchParams` Promise pattern |
| Search Engines | Canonical URL interpretation |
| Social Platforms | OpenGraph URL for sharing previews |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-322
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 5.4
- **Related Requests:**
  - REQ-305: Guest language detection utilities
  - REQ-317: useGuestLanguage hook
  - REQ-318: Cookie utility for language persistence
  - REQ-319: Update guest item page with translation support
- **Next.js Documentation:** [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- **SEO Best Practices:** Canonical URLs should be clean, parameter-free base URLs
