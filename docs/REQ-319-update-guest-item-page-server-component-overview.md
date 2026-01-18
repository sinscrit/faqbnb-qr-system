# Implementation Overview: Update Guest Item Page Server Component with Language Detection and Translation Support

## Header
| Field | Value |
|-------|-------|
| Request Reference | #319 |
| Source File | docs/gen_requests_epic4.md |
| Implementation Plan Reference | docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 19:45:00 CET |
| T-shirt Size | M |
| Estimated Effort | 6-8 hours |
| Phase | 5 - Update Guest Pages |
| Task ID | 5.1 |

## Goals
Update the guest item page server component (`/src/app/item/[publicId]/page.tsx`) to automatically detect the visitor's preferred language and serve translated content when available, with proper SEO metadata in the detected language.

### Key Objectives
1. Detect language preference from URL param `?lang=xx`, then cookies (`FAQBNB_GUEST_LANG`), then Accept-Language headers
2. Fetch item data along with translations for the detected language
3. Pass translation metadata to the client component (ItemDisplay)
4. Update `generateMetadata` function to produce SEO-optimized title and description in the detected language

### Assumptions & Clarifications
- Epic 1 (Foundation) has established the i18n infrastructure including:
  - `/src/lib/i18n/guest-language.ts` with `detectGuestLanguage()` utility
  - `/src/types/l10n.ts` with `SupportedLanguage` and `TranslatedContent` types
  - `FAQBNB_GUEST_LANG` cookie constant
- Epic 3 (Dynamic Content Translation) has created translation tables:
  - `item_translations` table with `language`, `name`, `description`, `translation_status` columns
  - `article_translations`, `link_translations`, `tag_translations` tables
- Translation fetch utilities exist at `/src/lib/translations/fetch-translations.ts`
- The existing `ItemDisplay` component will be updated separately in Task 5.2 to accept translation props
- Canonical URLs should NOT include the language parameter (SEO best practice)

## Implementation Plan

### Step 1: Add searchParams to PageProps Interface
- **Description**: Update the `PageProps` interface to include `searchParams` with the optional `lang` query parameter
- **Rationale**: Next.js 15 requires searchParams to be declared in page props interface to access URL query parameters
- **Estimated Effort**: S (15 minutes)
- **Files**: `/src/app/item/[publicId]/page.tsx`

### Step 2: Create Language Detection Logic in Page
- **Description**: Add language detection logic that examines URL param, cookies, and Accept-Language headers in priority order
- **Rationale**: Follows the established priority from the implementation plan (URL > Cookie > Header > default). Uses the `detectGuestLanguage()` utility from Epic 1 foundation
- **Estimated Effort**: M (1-2 hours)
- **Dependencies**: Requires `/src/lib/i18n/guest-language.ts` utility from Epic 1

### Step 3: Extend API Call to Include Translation Data
- **Description**: Modify the item fetch to include language parameter and retrieve translation data alongside original content
- **Rationale**: Server-side translation fetching avoids client-side loading delays. Translation data must be merged with original content before passing to client component
- **Estimated Effort**: M (2-3 hours)
- **Options**:
  - Option A: Call existing `/api/items/[publicId]` then separately fetch translations
  - Option B: Use translation fetch utilities directly from server component (preferred - avoids extra HTTP call)
  - Option C: Extend existing API to accept `?lang=` parameter

### Step 4: Transform Data with Translation Metadata
- **Description**: Build the props object that includes original item data, translation data, and translation metadata
- **Rationale**: The client component needs metadata about translation status to render appropriate UI (TranslationBanner, MissingTranslationBanner)
- **Estimated Effort**: S (1 hour)
- **Data Structure**:
```typescript
interface ItemDisplayWithTranslationProps {
  item: ItemResponse['data'];
  translationMeta: {
    requestedLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    sourceLanguage: SupportedLanguage;
    availableTranslations: SupportedLanguage[];
    isShowingTranslation: boolean;
  };
}
```

### Step 5: Update generateMetadata Function
- **Description**: Modify `generateMetadata` to detect language and use translated title/description for SEO metadata when available
- **Rationale**: International SEO requires language-specific metadata for search engines to index content in different languages
- **Estimated Effort**: M (1-2 hours)
- **Changes Required**:
  - Detect language from searchParams (same logic as page)
  - Fetch translation for detected language
  - Use translated `name` for title, translated `description` for description
  - Add `og:locale` meta tag for social media
  - Keep canonical URL without language parameter

### Step 6: Handle Fallback and Error Scenarios
- **Description**: Implement graceful fallbacks when translations don't exist or fetch fails
- **Rationale**: The system must degrade gracefully - showing original content with appropriate messaging rather than failing
- **Estimated Effort**: S (30 minutes)
- **Scenarios**:
  - No translation exists for requested language -> Show original, pass `isShowingTranslation: false`
  - Translation fetch fails -> Log error, show original content
  - Invalid language code in URL -> Default to source language

## Authorized Files and Functions for Modification

> Warning: **APPROVED SCOPE**: Changes outside this list require review

### Step 1: PageProps Interface Update
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `PageProps` interface | Modify |

### Step 2: Language Detection Logic
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `ItemPage` function | Modify |
| `src/lib/i18n/guest-language.ts` | Import | Reference (read-only) |

### Step 3: Translation Data Fetching
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `ItemPage` function | Modify |
| `src/lib/translations/fetch-translations.ts` | `fetchTranslatedItem()` | Reference (read-only) |
| `src/lib/translations/fetch-translations.ts` | `fetchItemTranslations()` | Reference (read-only) |

### Step 4: Translation Metadata Props
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `ItemPage` function | Modify |
| `src/types/l10n.ts` | Translation types | Reference (read-only) |
| `src/types/index.ts` | Type imports | Reference (read-only) |

### Step 5: generateMetadata Function
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `generateMetadata()` function | Modify |
| `src/app/item/[publicId]/page.tsx` | Metadata return object | Modify |

### Step 6: Error Handling
| File | Target | Type |
|------|--------|------|
| `src/app/item/[publicId]/page.tsx` | `ItemPage` function | Modify |
| `src/app/item/[publicId]/page.tsx` | `generateMetadata()` function | Modify |

## Dependencies

### Internal Dependencies (From Epic 1 & Epic 3)
- **REQ-304**: Localization Types File (`/src/types/l10n.ts`)
- **REQ-305**: Guest Language Detection Utility (`/src/lib/i18n/guest-language.ts`)
- **REQ-307**: Translation Fetch Utilities (`/src/lib/translations/fetch-translations.ts`)
- **REQ-310**: Translation Utility Helpers (`/src/lib/translations/translation-utils.ts`)

### Internal Dependencies (This Epic - Task Order)
- **Task 5.2** (REQ-320): Update ItemDisplay Component - depends on this task completing first to pass translation props

### External Dependencies
- Next.js 15.5.9 App Router (async params, searchParams patterns)
- `@supabase/ssr` for server-side Supabase client
- `next/headers` for reading cookies and headers in server components

### Database Tables Referenced
- `items` - Source item data with `source_language` column
- `item_translations` - Translation records with `language`, `name`, `description`, `translation_status`
- `article_translations` - Article translation records
- `link_translations` - Link title translations
- `tag_translations` - Tag translation records

## Technical Architecture

### Current State Analysis
The current `page.tsx` structure:
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Fetches item, returns title and description in source language only
}

export default async function ItemPage({ params }: PageProps) {
  // Fetches item via API, passes to ItemDisplay
}
```

### Target State Architecture
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  // 1. Detect language from searchParams
  // 2. Fetch item with translation for detected language
  // 3. Return metadata with translated content and og:locale
}

export default async function ItemPage({ params, searchParams }: PageProps) {
  // 1. Detect language from URL param, cookie, or headers
  // 2. Fetch item data with translations
  // 3. Build translationMeta object
  // 4. Pass item + translationMeta to ItemDisplay
}
```

### Language Detection Priority
```typescript
// Priority order (highest to lowest):
// 1. URL query parameter: ?lang=fr
// 2. Cookie: FAQBNB_GUEST_LANG
// 3. Accept-Language header: Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
// 4. Default: Item's source_language or 'en'
```

### Server Component Data Flow
```
Guest visits /item/ABC123?lang=fr
           │
           ▼
    ┌─────────────────────────────┐
    │  page.tsx (Server Component) │
    └─────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Detect Language  Fetch Item
(URL/Cookie/     (with translations
 Headers)         for detected lang)
    │             │
    └──────┬──────┘
           │
           ▼
    Build translationMeta {
      requestedLanguage: 'fr',
      displayLanguage: 'fr',
      sourceLanguage: 'en',
      isShowingTranslation: true,
      availableTranslations: ['fr', 'es', 'de']
    }
           │
           ▼
    Pass to ItemDisplay (Client Component)
```

### Metadata Generation Flow
```
generateMetadata({ params, searchParams })
           │
           ▼
    Detect language from searchParams.lang
           │
           ▼
    Fetch item + translation for language
           │
           ▼
    Return Metadata {
      title: translatedName || originalName,
      description: translatedDescription || originalDescription,
      openGraph: {
        locale: 'fr_FR',  // Based on detected language
        ...
      }
    }
```

## Implementation Code Snippets

### Updated PageProps Interface
```typescript
interface PageProps {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ lang?: string }>;
}
```

### Language Detection in Server Component
```typescript
import { cookies, headers } from 'next/headers';
import { detectGuestLanguage } from '@/lib/i18n/guest-language';
import { SupportedLanguage } from '@/types/l10n';

export default async function ItemPage({ params, searchParams }: PageProps) {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Get cookies and headers for language detection
  const cookieStore = await cookies();
  const headersList = await headers();

  // Detect language using Epic 1 utility
  const detectedLanguage = detectGuestLanguage({
    urlParam: urlLang,
    cookie: cookieStore.get('FAQBNB_GUEST_LANG')?.value,
    acceptLanguage: headersList.get('Accept-Language') || undefined
  });

  // ... fetch item with translation
}
```

### Translation Data Merging
```typescript
import { fetchTranslatedItem } from '@/lib/translations/fetch-translations';
import { mergeTranslation } from '@/lib/translations/translation-utils';

// Fetch item with translation
const { item, translation, availableTranslations } = await fetchTranslatedItem(
  publicId,
  detectedLanguage
);

// Build translation metadata
const translationMeta = {
  requestedLanguage: detectedLanguage,
  displayLanguage: translation ? detectedLanguage : item.sourceLanguage,
  sourceLanguage: item.sourceLanguage || 'en',
  availableTranslations,
  isShowingTranslation: !!translation && translation.translationStatus === 'completed'
};

// Merge content (translation overrides original where available)
const displayItem = translation
  ? mergeTranslation(item, translation)
  : item;
```

### Updated generateMetadata
```typescript
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const { lang: urlLang } = await searchParams;

  // Default detection (simplified for metadata - use URL param if present)
  const language = urlLang || 'en';

  try {
    const { item, translation } = await fetchTranslatedItem(publicId, language);

    const title = translation?.name || item.name;
    const description = translation?.description || item.description;

    return {
      metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
      title: `${title} - FAQBNB`,
      description: description || `View instructions and resources for ${title}`,
      openGraph: {
        title,
        description: description || `View instructions and resources for ${title}`,
        type: 'website',
        locale: getLocaleCode(language), // e.g., 'fr_FR' for French
      },
      // Canonical URL without language param (SEO best practice)
      alternates: {
        canonical: `/item/${publicId}`,
      },
    };
  } catch (error) {
    // Fallback metadata
    return {
      title: 'FAQBNB',
      description: 'View item instructions and resources',
    };
  }
}
```

## Risks and Considerations

### Potential Side Effects
- Changing props structure requires coordinated update to ItemDisplay (Task 5.2)
- Metadata generation now requires additional database call for translation
- Invalid language codes in URL could cause unexpected behavior if not validated

### Testing Requirements
- Test with `?lang=fr` URL parameter (should show French if translation exists)
- Test with `FAQBNB_GUEST_LANG` cookie set but no URL param
- Test with Accept-Language header (e.g., `fr-FR,fr;q=0.9,en;q=0.8`)
- Test fallback when no translation exists (should show original with metadata)
- Test fallback when translation fetch fails (should not break page)
- Test metadata generation includes correct `og:locale`
- Test with unsupported language code (should fall back to default)
- Test demo data fallback still works (backward compatibility)

### Performance Considerations
- Translation fetch adds one additional database query per page load
- Should use indexed columns (`item_id`, `language`) for fast lookups
- Consider caching translation data with `next: { revalidate: 60 }` (already used for item fetch)
- generateMetadata runs server-side only, so no client bundle impact

### Open Questions
- [ ] Should the `?lang=` parameter be validated against `SUPPORTED_LANGUAGES` array?
- [ ] How should partial translations be handled (e.g., name translated but not description)?
- [ ] Should translation fetch timeout if taking too long and fall back to original?
- [ ] Does the API endpoint need to be updated or will direct DB queries be used?

## Out of Scope
- Client-side language switching (handled by ItemDisplay in Task 5.2)
- Cookie persistence when language is changed (handled by useGuestLanguage hook in Task 4.1)
- Translation banners and UI components (handled in Phase 3 tasks)
- Translation of article and link content (covered in Task 5.2 ItemDisplay update)
- URL path-based language detection (not supported - QR codes already printed)
- Middleware-based language detection (not needed - detected in page component)

## Definition of Done
- [ ] `PageProps` interface includes `searchParams` with `lang` parameter
- [ ] Language detection examines URL param, cookie, and Accept-Language header in priority order
- [ ] Item fetch includes translation data for detected language
- [ ] `translationMeta` object is constructed and passed to ItemDisplay
- [ ] `generateMetadata` returns translated title/description when translation available
- [ ] `generateMetadata` includes `og:locale` meta tag
- [ ] Canonical URL does not include language parameter
- [ ] Graceful fallback to original content when translation unavailable
- [ ] No breaking changes to existing demo data fallback
- [ ] All TypeScript types properly imported and used

---
*Document generated: 2026-01-18 19:45:00 CET*
*Last modified: 2026-01-18 19:45:00 CET*
