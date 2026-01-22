# Implementation Breakdown: REQ-E04-016 - Update Guest Item Page (Server Component)

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-016 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #16 |
| **Original Request Date** | 2026-01-22 17:10 |
| **Breakdown Created** | 2026-01-22 19:28 |
| **T-shirt Size** | L |
| **Estimated Effort** | 6-8 hours |
| **Status** | PENDING |

---

## Goals

Update the guest item page server component (`/src/app/item/[publicId]/page.tsx`) to detect guest language preference, fetch translated content, and pass translation metadata to the client component. This enables the Epic 4 guest experience with multi-language support and SEO optimization for translated content.

**Key Objectives**:
1. Detect guest language from URL parameter (`?lang=`), cookie, or Accept-Language header
2. Fetch item data with available translations from API
3. Pass translation metadata (available languages, requested language, display language) to client component
4. Update metadata generation (SEO) to use translated title/description when available
5. Maintain backward compatibility with existing non-translated items
6. Support server-side language detection for initial page load

---

## Implementation Plan

### 1. Add Language Detection Imports and Setup

**File**: `/src/app/item/[publicId]/page.tsx`

**Approach**: Import guest language detection utilities and Next.js server APIs for reading URL parameters, cookies, and headers.

**Implementation Details**:

```typescript
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers'; // NEW: Server-side request APIs
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';
import { getItemByPublicId } from '@/data/demo-data';
import { getTranslations, getLocale } from 'next-intl/server';
import type { SupportedLanguage } from '@/types'; // NEW: L10N types
import { detectGuestLanguage } from '@/lib/i18n/guest-language'; // NEW: Language detection

interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // NEW: URL params
}
```

**Steps**:
1. Import `headers` and `cookies` from `'next/headers'` (Next.js 15 server APIs)
2. Import `SupportedLanguage` type from `@/types`
3. Import `detectGuestLanguage` from `@/lib/i18n/guest-language` (REQ-E04-002)
4. Update `PageProps` interface to include `searchParams` for URL parameter access
5. Keep existing imports intact

### 2. Create Language Detection Helper Function

**Function**: Extract language detection logic into reusable helper

**Implementation Details**:

```typescript
/**
 * Detect guest language preference with priority cascade:
 * 1. URL parameter (?lang=xx)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header
 * 4. Default (en)
 */
async function detectGuestLanguagePreference(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<SupportedLanguage> {
  try {
    // 1. Check URL parameter
    const langParam = searchParams.lang;
    if (typeof langParam === 'string' && langParam) {
      const detected = detectGuestLanguage(langParam);
      if (detected) {
        console.log('[item-page] Language from URL param:', detected);
        return detected;
      }
    }

    // 2. Check cookie
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('FAQBNB_GUEST_LANG')?.value;
    if (langCookie) {
      const detected = detectGuestLanguage(langCookie);
      if (detected) {
        console.log('[item-page] Language from cookie:', detected);
        return detected;
      }
    }

    // 3. Check Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const detected = detectGuestLanguage(acceptLanguage);
      if (detected) {
        console.log('[item-page] Language from header:', detected);
        return detected;
      }
    }

    // 4. Default
    console.log('[item-page] Using default language: en');
    return 'en';
  } catch (error) {
    console.error('[item-page] Language detection error:', error);
    return 'en';
  }
}
```

**Steps**:
1. Create async helper function accepting searchParams
2. Implement priority cascade: URL > Cookie > Accept-Language > Default
3. Use `detectGuestLanguage()` from REQ-E04-002 for validation
4. Add logging for debugging
5. Return 'en' as fallback on any errors

### 3. Update Main Page Component for Translation Fetching

**Function**: `ItemPage` component

**Approach**: Detect language, fetch item with translations, pass metadata to ItemDisplay client component.

**Implementation Details**:

```typescript
export default async function ItemPage({ params, searchParams }: PageProps) {
  try {
    const { publicId } = await params;
    const resolvedSearchParams = await searchParams;

    // NEW: Detect guest language preference
    const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);

    // Fetch item with translation support
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('lang', requestedLanguage);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const itemResponse = await response.json();

      if (itemResponse.success && itemResponse.data) {
        const { item, translationMeta } = itemResponse.data;

        // NEW: Pass translation metadata to client component
        return (
          <ItemDisplay
            item={item}
            translationMeta={{
              requestedLanguage: translationMeta.requestedLanguage,
              displayLanguage: translationMeta.displayLanguage,
              availableLanguages: translationMeta.availableLanguages,
              isTranslated: translationMeta.isTranslated,
              originalLanguage: translationMeta.originalLanguage || 'en',
            }}
          />
        );
      }
    }

    // Fallback to demo data (backward compatibility)
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

    // NEW: Demo data has no translations
    return (
      <ItemDisplay
        item={itemData}
        translationMeta={{
          requestedLanguage: 'en',
          displayLanguage: 'en',
          availableLanguages: ['en'],
          isTranslated: false,
          originalLanguage: 'en',
        }}
      />
    );
  } catch (error) {
    console.error('Error in ItemPage:', error);
    notFound();
  }
}
```

**Steps**:
1. Resolve searchParams from Promise
2. Call `detectGuestLanguagePreference()` to get requested language
3. Update API fetch URL to `/api/public/items/[publicId]?lang=xx` (REQ-E04-005)
4. Extract `translationMeta` from API response
5. Pass `translationMeta` prop to ItemDisplay component
6. For demo data fallback, create default translationMeta (no translations)
7. Maintain backward compatibility with existing functionality

### 4. Update Metadata Generation with Translated Content

**Function**: `generateMetadata`

**Approach**: Use translated title/description from API response for SEO optimization.

**Implementation Details**:

```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const t = await getTranslations('metadata.item');
  const locale = await getLocale();

  try {
    const { publicId } = await params;
    const resolvedSearchParams = await searchParams;

    // NEW: Detect guest language preference
    const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);

    // Fetch item with translation support
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('lang', requestedLanguage);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const itemResponse = await response.json();

      if (itemResponse.success && itemResponse.data) {
        const { item, translationMeta } = itemResponse.data;

        // NEW: Use translated title/description for SEO
        const displayName = item.name; // Already translated by API
        const displayDescription = item.description; // Already translated by API

        return {
          metadataBase: new URL(
            process.env.NODE_ENV === 'production'
              ? 'https://faqbnb.com'
              : 'http://localhost:3000'
          ),
          title: displayName,
          description: displayDescription || t('view.description', { itemName: displayName }),
          openGraph: {
            title: displayName,
            description: displayDescription || t('view.ogDescription', { itemName: displayName }),
            type: 'website',
            locale: translationMeta.displayLanguage || locale,
          },
          // NEW: Add alternate language links for SEO
          alternates: {
            languages: translationMeta.availableLanguages.reduce(
              (acc, lang) => {
                acc[lang] = `/item/${publicId}?lang=${lang}`;
                return acc;
              },
              {} as Record<string, string>
            ),
          },
        };
      }
    }

    // Fallback to demo data
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      return {
        metadataBase: new URL(
          process.env.NODE_ENV === 'production'
            ? 'https://faqbnb.com'
            : 'http://localhost:3000'
        ),
        title: t('view.title', { itemName: demoItem.name }),
        description: demoItem.description || t('view.description', { itemName: demoItem.name }),
        openGraph: {
          title: t('view.ogTitle', { itemName: demoItem.name }),
          description: demoItem.description || t('view.ogDescription', { itemName: demoItem.name }),
          type: 'website',
          locale: locale,
        },
      };
    }

    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  } catch (error) {
    console.error('[item-page] Metadata generation error:', error);
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }
}
```

**Steps**:
1. Add searchParams parameter to generateMetadata
2. Detect guest language using same helper function
3. Fetch item with translation support (same URL as page component)
4. Use translated name/description from API response
5. Set OpenGraph locale to display language
6. Add alternate language links for SEO (hreflang support)
7. Maintain fallback behavior for demo data

### 5. Update ItemDisplayProps Type Definition

**File**: `/src/types/index.ts` (or wherever ItemDisplayProps is defined)

**Approach**: Add optional `translationMeta` prop to ItemDisplayProps interface.

**Implementation Details**:

```typescript
export interface TranslationMeta {
  /** Language requested by guest (from URL/cookie/header) */
  requestedLanguage: SupportedLanguage;
  /** Language being displayed (may differ if translation unavailable) */
  displayLanguage: SupportedLanguage;
  /** List of available translation languages for this item */
  availableLanguages: SupportedLanguage[];
  /** Whether content is being shown in translated form */
  isTranslated: boolean;
  /** Original language of the content */
  originalLanguage: SupportedLanguage;
}

export interface ItemDisplayProps {
  item: ItemWithLinks;
  translationMeta?: TranslationMeta; // NEW: Optional for backward compatibility
}
```

**Steps**:
1. Create `TranslationMeta` interface with all metadata fields
2. Add optional `translationMeta` prop to `ItemDisplayProps`
3. Make it optional to maintain backward compatibility
4. Export both interfaces for use in server and client components

### 6. Error Handling and Fallbacks

**Considerations**:

```typescript
// Graceful fallback if translation API fails
try {
  const response = await fetch(translationUrl);
  if (response.ok) {
    // Use translated content
  } else {
    // Fall back to original content
    console.warn('[item-page] Translation API returned error, using original');
  }
} catch (error) {
  console.error('[item-page] Translation fetch failed:', error);
  // Fall back to original content
}
```

**Steps**:
1. Wrap translation fetching in try-catch
2. Fall back to original content if translation API fails
3. Log errors for debugging without disrupting user experience
4. Ensure demo data path always works (no translations)

### 7. Testing Considerations

**Server Component Testing**:
- Language detection from URL parameter works
- Language detection from cookie works
- Language detection from Accept-Language header works
- Default language (en) used when no preference detected
- Metadata uses translated title/description
- Alternate language links generated correctly
- Demo data fallback works without translations
- Error handling works gracefully

---

## Authorized Files and Functions for Modification

### Files to Modify

1. **`/src/app/item/[publicId]/page.tsx`**
   - Target: `ItemPage` component, `generateMetadata` function
   - Type: Modify
   - Changes:
     - Add imports for language detection
     - Create `detectGuestLanguagePreference()` helper
     - Update `ItemPage` to detect language and fetch translations
     - Update `generateMetadata` to use translated content for SEO
     - Add `searchParams` to PageProps interface

2. **`/src/types/index.ts`** (or appropriate types file)
   - Target: `ItemDisplayProps` interface
   - Type: Extend
   - Changes:
     - Add `TranslationMeta` interface
     - Add optional `translationMeta` prop to `ItemDisplayProps`

### Files to Reference (Read-Only)

1. **`/src/lib/i18n/guest-language.ts`** (from REQ-E04-002)
   - Reference: `detectGuestLanguage()` function
   - Usage: Language detection with validation

2. **`/src/app/api/public/items/[publicId]/route.ts`** (from REQ-E04-005)
   - Reference: API response format with translationMeta
   - Usage: Fetch translated item data

3. **`/src/components/ItemDisplay.tsx`**
   - Reference: Current component structure
   - Usage: Will be updated in REQ-E04-017 to use translationMeta

4. **`/src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: `SupportedLanguage` type
   - Usage: Type for language codes

### Dependencies

**NPM Packages**:
- `next/headers` (already installed) - cookies(), headers()
- `next/navigation` (already installed) - notFound()
- `next-intl/server` (already installed) - getTranslations(), getLocale()
- `@/types` (from REQ-E04-001) - SupportedLanguage
- `@/lib/i18n/guest-language` (from REQ-E04-002) - detectGuestLanguage()

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-E04-001**: Create Localization Types File
  - Provides: `SupportedLanguage` type
  - Required: Type for language detection

- **REQ-E04-002**: Create Guest Language Utility Module
  - Provides: `detectGuestLanguage()` function
  - Required: Server-side language detection logic

- **REQ-E04-005**: Create Public Item API Endpoint with Translation Support
  - Provides: `/api/public/items/[publicId]?lang=xx` endpoint
  - Required: Fetching translated item data
  - Response: `{ data: { item, translationMeta } }`

### Blocks (Cannot Start Until This Completes)

- **REQ-E04-017**: Update ItemDisplay Component (Client Component)
  - Requires: `translationMeta` prop from server component
  - Impact: Client component needs metadata to render translation UI

### Parallel Safety

❌ **Cannot be parallelized with**:
- REQ-E04-017 (Update ItemDisplay Component) - This task provides data that REQ-E04-017 consumes

✅ **Can be implemented in parallel with**:
- REQ-E04-008 through REQ-E04-013 (Guest UI components) - No direct file conflicts
- REQ-E04-014 (useGuestLanguage hook) - Used by client component, not server

**Files Touched**:
- `/src/app/item/[publicId]/page.tsx` (modify)
- `/src/types/index.ts` or similar (modify - add interface)

### External Dependencies

- Next.js 15.x Server Components API
- Next.js Server APIs: `headers()`, `cookies()`
- Public Items API (REQ-E04-005)

---

## Risks and Considerations

### Technical Risks

1. **Next.js 15 Server APIs**
   - **Risk**: `headers()` and `cookies()` are async in Next.js 15
   - **Mitigation**: Await all calls to these functions
   - **Pattern**: `const headersList = await headers();`
   - **Testing**: Verify no Promise-related errors in production

2. **searchParams Promise**
   - **Risk**: searchParams is Promise in Next.js 15 server components
   - **Mitigation**: Await searchParams before accessing properties
   - **Pattern**: `const resolved = await searchParams; const lang = resolved.lang;`

3. **Language Detection Performance**
   - **Risk**: Multiple detection attempts (URL, cookie, header) add latency
   - **Mitigation**: Short-circuit on first match, cache detection result
   - **Impact**: Minimal (<1ms per check)

4. **Translation API Failure**
   - **Risk**: Translation API unavailable breaks page
   - **Mitigation**: Fall back to original content if API fails
   - **Testing**: Test with API down, verify graceful degradation

### SEO Risks

1. **Duplicate Content**
   - **Risk**: Same item in multiple languages might be seen as duplicate
   - **Mitigation**: Use `alternates.languages` in metadata for hreflang
   - **Benefit**: Search engines understand language variants
   - **Example**: `<link rel="alternate" hreflang="fr" href="/item/abc?lang=fr">`

2. **URL Parameter Indexing**
   - **Risk**: Search engines might not index URL parameters
   - **Mitigation**: Generate static params for all language variants
   - **Future**: Consider path-based routing `/item/[publicId]/[lang]`

3. **Canonical URLs**
   - **Risk**: Multiple URLs for same content (different lang params)
   - **Mitigation**: Consider adding canonical URL to original language
   - **Decision**: Each language variant is canonical for its language

### Integration Risks

1. **Metadata Duplication**
   - **Risk**: generateMetadata and ItemPage fetch same data
   - **Mitigation**: Both fetches use cache (revalidate: 60), Next.js deduplicates
   - **Performance**: Negligible impact due to request deduplication

2. **Demo Data Fallback**
   - **Risk**: Demo data path doesn't support translations
   - **Mitigation**: Provide default translationMeta for demo items
   - **Testing**: Verify demo data items still work

3. **Prop Type Changes**
   - **Risk**: Adding translationMeta might break existing ItemDisplay uses
   - **Mitigation**: Make prop optional for backward compatibility
   - **Migration**: Update ItemDisplay in REQ-E04-017 to handle new prop

### Server Component Risks

1. **Dynamic Rendering**
   - **Risk**: Using headers/cookies forces dynamic rendering
   - **Mitigation**: This is intended behavior for personalized content
   - **Impact**: Page cannot be statically generated (acceptable for guest pages)

2. **Request Overhead**
   - **Risk**: Additional request for translation metadata
   - **Mitigation**: Translation metadata included in same API response
   - **Optimization**: Single fetch for item + translations

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Client-side ItemDisplay updates** - Handled by REQ-E04-017
2. ❌ **Translation UI components** - Handled by REQ-E04-008 through REQ-E04-012
3. ❌ **useGuestLanguage hook** - Handled by REQ-E04-014 (used by client component)
4. ❌ **Translation fetching utilities** - Handled by REQ-E04-004
5. ❌ **Public Items API** - Handled by REQ-E04-005
6. ❌ **Cookie utilities** - Handled by REQ-E04-002, REQ-E04-015
7. ❌ **Client-side language switching** - Handled by REQ-E04-017 (ItemDisplay)
8. ❌ **Analytics tracking** - Existing analytics continue to work
9. ❌ **Path-based routing** - Using URL parameters (?lang=xx), not path segments
10. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Server Component Pattern

**Why Server Component**:
- Language detection requires server-side access (cookies, headers)
- SEO optimization requires server-rendered metadata
- Initial page load can be pre-rendered with detected language
- No JavaScript required for language detection

**Server → Client Data Flow**:
```
Server Component (page.tsx)
  ↓ Detect language (URL, cookie, header)
  ↓ Fetch translated data from API
  ↓ Generate metadata for SEO
  ↓ Pass translationMeta to client
Client Component (ItemDisplay.tsx)
  ↓ Render translation UI
  ↓ Handle language switching
```

### Priority Cascade Rationale

**Detection Order**:
1. **URL parameter** (`?lang=fr`) - Highest priority
   - Shareable links with explicit language
   - User clicked language switcher
   - Override cookie/header
2. **Cookie** (`FAQBNB_GUEST_LANG`)
   - Persistent preference across sessions
   - Set by previous language selection
3. **Accept-Language header**
   - Browser/OS preference
   - Automatic detection
4. **Default** (`en`)
   - Fallback when no preference detected

**Why This Order**:
- URL = explicit intent (shareable links)
- Cookie = stored preference
- Header = implicit preference
- Default = universal fallback

### Metadata SEO Strategy

**Translated Metadata Benefits**:
- Search engines index translated title/description
- Better ranking for language-specific searches
- Improved click-through rates from search results
- Social media shares show correct language

**Alternate Languages**:
```typescript
alternates: {
  languages: {
    'en': '/item/abc123?lang=en',
    'fr': '/item/abc123?lang=fr',
    'es': '/item/abc123?lang=es',
  }
}
```

Generates:
```html
<link rel="alternate" hreflang="en" href="https://faqbnb.com/item/abc123?lang=en" />
<link rel="alternate" hreflang="fr" href="https://faqbnb.com/item/abc123?lang=fr" />
<link rel="alternate" hreflang="es" href="https://faqbnb.com/item/abc123?lang=es" />
```

**Benefits**:
- Search engines understand language variants
- No duplicate content penalty
- Users get correct language in search results

### API Response Format

**Expected Response** (from REQ-E04-005):
```typescript
{
  success: true,
  data: {
    item: {
      id: '123',
      publicId: 'abc123',
      name: 'Translated Name', // Already translated
      description: 'Translated Description', // Already translated
      links: [...], // Translated
      articles: [...], // Translated
    },
    translationMeta: {
      requestedLanguage: 'fr',
      displayLanguage: 'fr',
      availableLanguages: ['en', 'fr', 'es'],
      isTranslated: true,
      originalLanguage: 'en',
    }
  }
}
```

**Server Component Usage**:
```typescript
const { item, translationMeta } = response.data;

// Pass to client component
<ItemDisplay item={item} translationMeta={translationMeta} />
```

### Backward Compatibility

**Demo Data Path** (no translations):
```typescript
// Demo items have no translations
return (
  <ItemDisplay
    item={demoItem}
    translationMeta={{
      requestedLanguage: 'en',
      displayLanguage: 'en',
      availableLanguages: ['en'],
      isTranslated: false,
      originalLanguage: 'en',
    }}
  />
);
```

**Optional Prop**:
```typescript
// ItemDisplay can work without translationMeta
interface ItemDisplayProps {
  item: ItemWithLinks;
  translationMeta?: TranslationMeta; // Optional
}

// Client component checks
if (translationMeta) {
  // Show translation UI
} else {
  // Original behavior (no translation UI)
}
```

### Performance Considerations

**Request Deduplication**:
Next.js automatically deduplicates identical fetch requests:
```typescript
// generateMetadata makes fetch
const response1 = await fetch(url);

// ItemPage makes same fetch
const response2 = await fetch(url); // Deduped, uses cache

// Result: Only 1 actual network request
```

**Cache Configuration**:
```typescript
fetch(url, {
  next: { revalidate: 60 } // 60 seconds
});
```

**Benefits**:
- Fresh content every 60 seconds
- Reduced API load
- Fast page loads

### Testing Strategy

**Manual Testing Checklist**:
- [ ] Visit `/item/abc123` - detects default language (en)
- [ ] Visit `/item/abc123?lang=fr` - shows French translation
- [ ] Set FAQBNB_GUEST_LANG cookie, visit without ?lang - uses cookie
- [ ] Set Accept-Language: fr, visit without ?lang or cookie - uses header
- [ ] Check page source: verify translated title/description in meta tags
- [ ] Check page source: verify alternate language links (hreflang)
- [ ] Translation API down: page still works with original content
- [ ] Demo data item: page works without translations
- [ ] Invalid language parameter: falls back to default

**Server Component Testing**:
```typescript
// Test language detection
const lang = await detectGuestLanguagePreference({ lang: 'fr' });
expect(lang).toBe('fr');

// Test with invalid language
const lang2 = await detectGuestLanguagePreference({ lang: 'invalid' });
expect(lang2).toBe('en');

// Test metadata generation
const metadata = await generateMetadata({ params, searchParams });
expect(metadata.title).toContain('Translated Title');
```

---

**Last Modified**: 2026-01-22 19:28
