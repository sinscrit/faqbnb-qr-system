# REQ-369: Update Page Metadata with Translations - Implementation Overview

**Generated:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Request ID:** REQ-369
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2B - Dashboard & Navigation
**Task:** 2B.6 - Update page metadata with translations
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Summary

This task involves updating all page metadata (document titles, meta descriptions, Open Graph tags, and Twitter Card metadata) to display in the user's selected language using the translation system. Currently, page metadata contains hardcoded English text regardless of the user's language preference.

---

## Current State Analysis

### Existing Metadata Implementation

The codebase uses two patterns for metadata:

1. **Static Metadata** (`/src/app/page.tsx` - Homepage):
   - Exports `const metadata: Metadata` with hardcoded English content
   - Includes OpenGraph, Twitter Card, and robots configuration
   - Contains JSON-LD structured data for SEO
   - No translation mechanism in place

2. **Dynamic Metadata** (`/src/app/item/[publicId]/page.tsx` - Item Display):
   - Uses `generateMetadata()` function
   - Fetches item data dynamically
   - Returns English-only metadata based on item properties

### Current Limitations

- All metadata hardcoded in English
- No `metadata` namespace exists in translation files
- Dashboard2 pages have no metadata exports (rely on root layout)
- No alternate link tags for multi-language SEO
- No locale-specific canonical URLs

### Existing i18n Infrastructure (Epic 1)

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | v4.7.0 installed |
| Locale config | `/src/lib/i18n/config.ts` | Complete (en, fr, es, de, nl, it) |
| Request config | `/src/i18n/request.ts` | Complete |
| Translation files | `/messages/*.json` | 6 languages, ~133 keys each |
| NextIntlClientProvider | `/src/app/layout.tsx` | Integrated |

---

## Technical Approach

### Pattern for Translated Metadata

next-intl supports server-side metadata translation using `getTranslations()` from `next-intl/server`:

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
    openGraph: {
      title: t('dashboard.og.title'),
      description: t('dashboard.og.description'),
    },
    twitter: {
      title: t('dashboard.twitter.title'),
      description: t('dashboard.twitter.description'),
    },
  };
}
```

### Metadata Namespace Structure

Add new `metadata` namespace to all 6 translation files:

```json
{
  "metadata": {
    "site": {
      "name": "FAQBNB",
      "tagline": "Instant Access to Product Information"
    },
    "home": {
      "title": "FAQBNB - Instant Access to Product Information",
      "description": "Create QR codes that link directly to product manuals, guides, and instructions.",
      "og": {
        "title": "FAQBNB - Smart QR Code System",
        "description": "Manage property items and provide instant access to information with QR codes."
      }
    },
    "dashboard": {
      "title": "Dashboard | FAQBNB",
      "description": "Manage your properties, items, and QR codes from your dashboard.",
      "og": {
        "title": "Dashboard - FAQBNB",
        "description": "Your FAQBNB dashboard for managing properties and items."
      }
    },
    "items": {
      "title": "Items | FAQBNB",
      "description": "View and manage all your QR code items.",
      "detail": {
        "title": "{itemName} | FAQBNB",
        "description": "View details and QR code for {itemName}."
      }
    },
    "properties": {
      "title": "Properties | FAQBNB",
      "description": "Manage your properties and their associated items."
    },
    "login": {
      "title": "Sign In | FAQBNB",
      "description": "Sign in to access your FAQBNB dashboard."
    },
    "register": {
      "title": "Create Account | FAQBNB",
      "description": "Create a FAQBNB account to start managing your properties."
    }
  }
}
```

---

## Implementation Tasks

### Task 1: Add Metadata Namespace to Translation Files

**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Actions:**
1. Add `metadata` namespace with keys for all pages
2. Include site-wide metadata (name, tagline)
3. Include page-specific titles and descriptions
4. Include OpenGraph and Twitter Card variants
5. Support dynamic templates with variables (e.g., `{itemName}`)

### Task 2: Create Metadata Generation Utility

**New File:** `/src/lib/i18n/metadata.ts`

Create a utility module for generating translated metadata:

```typescript
import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export interface MetadataOptions {
  namespace: string;
  variables?: Record<string, string>;
  noIndex?: boolean;
}

export async function generateLocalizedMetadata(
  options: MetadataOptions
): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://faqbnb.com';

  return {
    title: t(`${options.namespace}.title`, options.variables),
    description: t(`${options.namespace}.description`, options.variables),
    openGraph: {
      title: t(`${options.namespace}.og.title`, options.variables),
      description: t(`${options.namespace}.og.description`, options.variables),
      locale: locale,
      siteName: t('site.name'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t(`${options.namespace}.og.title`, options.variables),
      description: t(`${options.namespace}.og.description`, options.variables),
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'fr': `${baseUrl}/fr`,
        'es': `${baseUrl}/es`,
        'de': `${baseUrl}/de`,
        'nl': `${baseUrl}/nl`,
        'it': `${baseUrl}/it`,
      },
    },
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
  };
}
```

### Task 3: Update Homepage Metadata

**File:** `/src/app/page.tsx`

**Actions:**
1. Convert static `metadata` export to `generateMetadata()` function
2. Use `getTranslations('metadata')` for translated content
3. Preserve existing JSON-LD structured data (may need separate translation)
4. Maintain SEO-critical configurations

### Task 4: Update Dashboard2 Pages with Metadata

Dashboard2 pages currently have no metadata exports. Add `generateMetadata()` to each page.

**Files to Update:**
- `/src/app/dashboard2/page.tsx`
- `/src/app/dashboard2/items/page.tsx`
- `/src/app/dashboard2/properties/page.tsx`
- `/src/app/dashboard2/instructions/page.tsx`
- `/src/app/dashboard2/help/page.tsx`
- `/src/app/dashboard2/rooms/page.tsx`
- `/src/app/dashboard2/tags/page.tsx`
- `/src/app/dashboard2/create/page.tsx`

**Note:** These pages are currently client components (`'use client'`). Need to determine if they can support `generateMetadata()` or if metadata should be handled at layout level.

### Task 5: Update Item Display Page Metadata

**File:** `/src/app/item/[publicId]/page.tsx`

**Actions:**
1. Update existing `generateMetadata()` to use translations
2. Support dynamic item name interpolation: `{itemName}` template
3. Maintain ISR caching strategy
4. Include locale in metadata response

### Task 6: Update Authentication Pages Metadata

**Files to Update:**
- `/src/app/login/page.tsx`
- `/src/app/register/page.tsx`
- `/src/app/register/success/page.tsx`
- `/src/app/register/complete/page.tsx`

### Task 7: Export Metadata Utility from i18n Module

**File:** `/src/lib/i18n/index.ts`

Add export for the new metadata utility.

---

## Authorized Files and Functions for Modification

### Translation Files (ADD metadata namespace)

| File | Modification |
|------|--------------|
| `/messages/en.json` | Add `metadata` namespace with all page keys |
| `/messages/fr.json` | Add `metadata` namespace (translated) |
| `/messages/es.json` | Add `metadata` namespace (translated) |
| `/messages/de.json` | Add `metadata` namespace (translated) |
| `/messages/nl.json` | Add `metadata` namespace (translated) |
| `/messages/it.json` | Add `metadata` namespace (translated) |

### New Files (CREATE)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/metadata.ts` | Metadata generation utility |

### i18n Module (UPDATE)

| File | Function/Export | Modification |
|------|-----------------|--------------|
| `/src/lib/i18n/index.ts` | Module exports | Add metadata utility export |

### Page Files (ADD generateMetadata)

| File | Current State | Modification |
|------|---------------|--------------|
| `/src/app/page.tsx` | Static `metadata` export | Convert to `generateMetadata()` with translations |
| `/src/app/login/page.tsx` | No metadata | Add `generateMetadata()` |
| `/src/app/register/page.tsx` | No metadata | Add `generateMetadata()` |
| `/src/app/register/success/page.tsx` | No metadata | Add `generateMetadata()` |
| `/src/app/register/complete/page.tsx` | No metadata | Add `generateMetadata()` |
| `/src/app/dashboard2/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/items/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/properties/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/instructions/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/help/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/rooms/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/tags/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/dashboard2/create/page.tsx` | No metadata | Add `generateMetadata()` (if compatible) |
| `/src/app/item/[publicId]/page.tsx` | Has `generateMetadata()` | Update to use translations |

### Layout Files (POTENTIAL modification)

| File | Modification |
|------|--------------|
| `/src/app/dashboard2/layout.tsx` | May need metadata if pages can't support it directly |

---

## Dependencies

### Required from Epic 1

| Dependency | Status |
|------------|--------|
| next-intl v4.7.0 | Installed |
| `getTranslations` from next-intl/server | Available |
| `getLocale` from next-intl/server | Available |
| Translation file structure | In place |
| NextIntlClientProvider | Configured |

### Technical Constraints

1. **Client Component Limitation**: Pages marked with `'use client'` cannot export `generateMetadata()`. These pages need metadata at the layout level or must be converted to server components.

2. **Dynamic Rendering**: next-intl requires `force-dynamic` rendering mode, which affects metadata caching.

3. **ISR Compatibility**: Dynamic item page uses ISR (revalidate: 60). Translated metadata must work within this constraint.

---

## Testing Requirements

### Functional Tests

- [ ] All page document titles display in active locale
- [ ] Meta descriptions display translated content
- [ ] OpenGraph titles and descriptions are localized
- [ ] Twitter Card metadata uses appropriate translations
- [ ] Metadata updates when language changes
- [ ] Dynamic page titles combine properly with translated templates
- [ ] Fallback to English works when translation missing

### SEO Tests

- [ ] Canonical URLs are properly set
- [ ] Alternate language links are present in HTML head
- [ ] Robots directives are correctly applied
- [ ] JSON-LD structured data includes localized content where applicable

### Browser Tests

- [ ] Tab titles display correctly in all 6 languages
- [ ] No title truncation issues
- [ ] Bookmarks show localized titles

### Social Sharing Tests

- [ ] Facebook share previews show localized content
- [ ] Twitter share previews show localized content
- [ ] LinkedIn share previews show localized content

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| All page document titles use translation keys | Tasks 3-6 |
| All meta description tags retrieve translated content | Tasks 1, 3-6 |
| Open Graph title and description display localized | Tasks 1, 2, 3-6 |
| Twitter Card metadata uses translation keys | Tasks 1, 2, 3-6 |
| Metadata updates when language changes | Task 2 (utility handles locale) |
| Each language has complete metadata translations | Task 1 |
| No hardcoded English strings in metadata code | Tasks 3-6 |
| Translation keys follow naming conventions | Task 1 |
| Dynamic titles combine with translated templates | Task 5 |
| Default fallback metadata exists | Task 2 |
| SEO-critical pages have optimized translations | Task 1 |
| Browser tab titles without truncation | Task 1 (keep titles concise) |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Client component pages can't have metadata | High | Medium | Use layout-level metadata or convert to server components |
| Translation quality for SEO keywords | Medium | High | Professional review of SEO-critical translations |
| ISR caching with dynamic locale | Medium | Low | Ensure locale is properly cached per request |
| Missing translations in production | Low | Medium | Runtime fallback to English, build-time validation |
| Longer text breaking layouts | Medium | Low | Test all locales for length issues |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Translation file updates | 1-2 hours |
| Task 2: Metadata utility | 1 hour |
| Task 3: Homepage metadata | 30 minutes |
| Task 4: Dashboard2 pages | 2-3 hours |
| Task 5: Item display page | 30 minutes |
| Task 6: Auth pages | 1 hour |
| Task 7: Export updates | 15 minutes |
| Testing | 1-2 hours |
| **Total** | **6-10 hours** |

---

## References

- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation - Server Components](https://next-intl-docs.vercel.app/docs/environments/server-client-components)
- [next-intl Documentation - Metadata](https://next-intl-docs.vercel.app/docs/environments/server-client-components#using-internationalization-in-generatemetadata)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

*Overview document generated for REQ-369: Update Page Metadata with Translations*
