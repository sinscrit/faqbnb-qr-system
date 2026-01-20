# Implementation Overview: REQ-E02-054 - Update Page Metadata with Translations

**Generated:** 2026-01-20 22:30:00 UTC
**Last Modified:** 2026-01-20 22:30:00 UTC
**Request ID:** REQ-E02-054
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.6
**Size:** M (Medium)
**Priority:** P1 - High

---

## Summary

Update page metadata (titles, descriptions, Open Graph tags, Twitter cards) across all dashboard, navigation, authentication, settings, and property management pages to use the i18n translation system via next-intl's `generateMetadata` function with `getTranslations`, replacing hardcoded English strings with dynamically localized metadata.

---

## Background & Context

### Current State

Page metadata throughout the application is hardcoded in English:

**Root Layout (`/src/app/layout.tsx`):**
```typescript
export const metadata: Metadata = {
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides...",
};
```

**Home Page (`/src/app/page.tsx`):**
```typescript
export const metadata: Metadata = {
  title: 'FAQBNB - Instant Access to Product Information via QR Codes | SaaS Platform',
  description: 'Transform customer support with FAQBNB...',
  openGraph: { ... },
  twitter: { ... },
};
```

**Dynamic Item Page (`/src/app/item/[publicId]/page.tsx`):**
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${item.name} - FAQBNB`,
    description: item.description || `View instructions and resources for ${item.name}`,
  };
}
```

Dashboard pages (e.g., `/dashboard2/page.tsx`, `/dashboard2/items/page.tsx`) currently have no explicit metadata exports, relying on the root layout defaults.

### Impact of Current State

- International users see English-only titles in browser tabs and bookmarks
- Social media shares display English metadata regardless of user language
- Search engines index pages with English-only metadata, limiting discoverability in non-English markets
- Inconsistent user experience for multilingual users

### Epic 1 Foundation (Prerequisites)

This task depends on the completed Epic 1 foundation:
- `next-intl` package installed and configured
- `IntlProvider` wrapping the application in `/src/app/layout.tsx`
- Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`
- `getTranslations` from `next-intl/server` available for server-side metadata generation
- `getLocale` from `next-intl/server` for detecting current locale

### Next.js Metadata API with next-intl

Next.js 14+ supports async `generateMetadata` functions that can integrate with next-intl:

```typescript
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();

  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
    openGraph: {
      locale: locale,
      // ...
    },
  };
}
```

---

## Implementation Scope

### Pages Requiring Metadata Updates

| Page | File Path | Current State | Priority |
|------|-----------|---------------|----------|
| Root Layout | `/src/app/layout.tsx` | Static English metadata | Critical |
| Home Page | `/src/app/page.tsx` | Static English metadata with OG/Twitter | Critical |
| Login Page | `/src/app/login/page.tsx` | No metadata (uses root) | High |
| Register Page | `/src/app/register/page.tsx` | No metadata (uses root) | High |
| Register Success | `/src/app/register/success/page.tsx` | No metadata (uses root) | Medium |
| Register Complete | `/src/app/register/complete/page.tsx` | No metadata (uses root) | Medium |
| Dashboard2 Home | `/src/app/dashboard2/page.tsx` | No metadata (uses root) | High |
| Dashboard2 Items | `/src/app/dashboard2/items/page.tsx` | No metadata (uses root) | High |
| Dashboard2 Create | `/src/app/dashboard2/create/page.tsx` | No metadata (uses root) | Medium |
| Dashboard2 Properties | `/src/app/dashboard2/properties/page.tsx` | No metadata (uses root) | Medium |
| Dashboard2 Instructions | `/src/app/dashboard2/instructions/page.tsx` | No metadata (uses root) | Medium |
| Dashboard2 Help | `/src/app/dashboard2/help/page.tsx` | No metadata (uses root) | Medium |
| Dashboard2 Rooms | `/src/app/dashboard2/rooms/page.tsx` | No metadata (uses root) | Low |
| Dashboard2 Tags | `/src/app/dashboard2/tags/page.tsx` | No metadata (uses root) | Low |
| Public Item Page | `/src/app/item/[publicId]/page.tsx` | Dynamic metadata (English) | High |

**Total Pages:** ~15 primary pages + dynamic routes

### String Categories

1. **Page Titles** (~15 strings)
   - "Dashboard | FAQBNB"
   - "Items | FAQBNB"
   - "Create Item | FAQBNB"
   - etc.

2. **Meta Descriptions** (~15 strings)
   - "Manage your QR code items and properties"
   - "Create a new QR code item for your property"
   - etc.

3. **Open Graph Titles** (~5 strings)
   - Public-facing pages (home, item view)

4. **Open Graph Descriptions** (~5 strings)
   - Public-facing pages

5. **Application Name** (~1 string)
   - "FAQBNB" (may remain untranslated as brand name)

6. **Dynamic Interpolation Patterns** (~5 patterns)
   - "{itemName} - FAQBNB"
   - "View instructions for {itemName}"
   - "Manage {count} items"

---

## Technical Approach

### 1. Translation Namespace Structure

Create a `metadata` namespace in `/messages/en.json`:

```json
{
  "metadata": {
    "app": {
      "name": "FAQBNB",
      "tagline": "QR Item Display System",
      "defaultDescription": "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes"
    },
    "home": {
      "title": "FAQBNB - Instant Access to Product Information via QR Codes",
      "description": "Transform customer support with FAQBNB. Provide instant access to manuals, videos, and product information through QR codes. No apps required.",
      "ogTitle": "FAQBNB - Instant Access to Product Information",
      "ogDescription": "Professional QR code platform for businesses. Transform how customers access product information and support."
    },
    "auth": {
      "login": {
        "title": "Sign In | FAQBNB",
        "description": "Sign in to your FAQBNB account to manage your QR code items and properties"
      },
      "register": {
        "title": "Create Account | FAQBNB",
        "description": "Create a FAQBNB account to start managing your QR code items"
      },
      "registerSuccess": {
        "title": "Registration Successful | FAQBNB",
        "description": "Your FAQBNB account has been created successfully"
      },
      "registerComplete": {
        "title": "Complete Registration | FAQBNB",
        "description": "Complete your FAQBNB account setup"
      }
    },
    "dashboard": {
      "home": {
        "title": "Dashboard | FAQBNB",
        "description": "Manage your QR code items and properties from your FAQBNB dashboard"
      },
      "items": {
        "title": "Items | FAQBNB",
        "description": "View and manage all your QR code items"
      },
      "create": {
        "title": "Create Item | FAQBNB",
        "description": "Create a new QR code item for your property"
      },
      "properties": {
        "title": "Properties | FAQBNB",
        "description": "Manage your properties and their QR code items"
      },
      "instructions": {
        "title": "Guides | FAQBNB",
        "description": "View and manage instruction guides for your items"
      },
      "help": {
        "title": "Help & Support | FAQBNB",
        "description": "Get help with using FAQBNB to manage your QR code items"
      },
      "rooms": {
        "title": "Rooms | FAQBNB",
        "description": "Manage room categories for organizing your items"
      },
      "tags": {
        "title": "Tags | FAQBNB",
        "description": "Manage tags for categorizing your items"
      }
    },
    "item": {
      "view": {
        "title": "{itemName} | FAQBNB",
        "description": "View instructions and resources for {itemName}",
        "ogTitle": "{itemName}",
        "ogDescription": "View instructions and resources for {itemName}"
      },
      "edit": {
        "title": "Edit {itemName} | FAQBNB",
        "description": "Edit the details and instructions for {itemName}"
      },
      "notFound": {
        "title": "Item Not Found | FAQBNB",
        "description": "The requested item could not be found"
      }
    },
    "error": {
      "title": "Error | FAQBNB",
      "description": "An error occurred"
    }
  }
}
```

### 2. Server Component Metadata Pattern

For pages that are server components:

```typescript
// /src/app/dashboard2/page.tsx (convert to server component for metadata)
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.home');

  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 3. Client Component Pages with Metadata

For pages that must remain client components (e.g., using hooks), create a separate metadata generation:

**Option A: Separate metadata file**
```typescript
// /src/app/dashboard2/items/metadata.ts
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.items');
  return {
    title: t('title'),
    description: t('description'),
  };
}

// /src/app/dashboard2/items/page.tsx
'use client';
// ... client component code
export { generateMetadata } from './metadata';
```

**Option B: Wrapper layout (recommended)**
```typescript
// /src/app/dashboard2/items/layout.tsx (server component)
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.items');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### 4. Dynamic Metadata with Parameters

For pages with dynamic content (e.g., item view):

```typescript
// /src/app/item/[publicId]/page.tsx
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const t = await getTranslations('metadata.item');
  const locale = await getLocale();

  // Fetch item data
  const item = await fetchItem(publicId);

  if (!item) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }

  return {
    title: t('view.title', { itemName: item.name }),
    description: t('view.description', { itemName: item.name }),
    openGraph: {
      title: t('view.ogTitle', { itemName: item.name }),
      description: t('view.ogDescription', { itemName: item.name }),
      locale: locale,
      type: 'website',
    },
  };
}
```

### 5. Root Layout Default Metadata

The root layout provides fallback metadata that other pages inherit:

```typescript
// /src/app/layout.tsx
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.app');
  const locale = await getLocale();

  return {
    metadataBase: new URL(
      process.env.NODE_ENV === 'production'
        ? 'https://faqbnb.com'
        : 'http://localhost:3000'
    ),
    title: {
      default: `${t('name')} - ${t('tagline')}`,
      template: '%s',
    },
    description: t('defaultDescription'),
    openGraph: {
      locale: locale,
      siteName: t('name'),
    },
  };
}
```

### 6. Handling Locale in Open Graph

Open Graph tags should include the locale:

```typescript
openGraph: {
  locale: locale, // e.g., 'en', 'fr', 'es'
  alternateLocales: ['en', 'fr', 'es', 'de', 'nl', 'it'].filter(l => l !== locale),
}
```

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Type | Functions/Sections to Modify |
|------|------|------------------------------|
| `/src/app/layout.tsx` | Server | Add `generateMetadata` function, update static `metadata` export |
| `/src/app/page.tsx` | Server | Convert static `metadata` to `generateMetadata` function |
| `/src/app/login/page.tsx` | Client | Add `generateMetadata` export (may need layout wrapper) |
| `/src/app/register/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/register/success/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/register/complete/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/page.tsx` | Client | Add layout with `generateMetadata` |
| `/src/app/dashboard2/items/page.tsx` | Client | Add layout with `generateMetadata` |
| `/src/app/dashboard2/create/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/properties/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/instructions/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/help/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/rooms/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/dashboard2/tags/page.tsx` | Client | Add `generateMetadata` export |
| `/src/app/item/[publicId]/page.tsx` | Server | Update `generateMetadata` to use translations |

### New Layout Files (for client component pages)

| File | Purpose |
|------|---------|
| `/src/app/login/layout.tsx` | Metadata wrapper for login page |
| `/src/app/register/layout.tsx` | Metadata wrapper for register pages |
| `/src/app/dashboard2/items/layout.tsx` | Metadata wrapper for items page |
| `/src/app/dashboard2/create/layout.tsx` | Metadata wrapper for create page |
| `/src/app/dashboard2/properties/layout.tsx` | Metadata wrapper for properties page |
| `/src/app/dashboard2/instructions/layout.tsx` | Metadata wrapper for instructions page |
| `/src/app/dashboard2/help/layout.tsx` | Metadata wrapper for help page |
| `/src/app/dashboard2/rooms/layout.tsx` | Metadata wrapper for rooms page |
| `/src/app/dashboard2/tags/layout.tsx` | Metadata wrapper for tags page |

### Translation Files

| File | Sections to Modify |
|------|-------------------|
| `/messages/en.json` | Add `metadata` namespace with all page metadata |
| `/messages/fr.json` | Mirror structure with French translations |
| `/messages/es.json` | Mirror structure with Spanish translations |
| `/messages/de.json` | Mirror structure with German translations |
| `/messages/nl.json` | Mirror structure with Dutch translations |
| `/messages/it.json` | Mirror structure with Italian translations |

---

## Implementation Tasks

### Task 1: Add Metadata Translations to en.json
- [ ] Create `metadata` namespace in `/messages/en.json`
- [ ] Add `metadata.app` section with app name, tagline, default description
- [ ] Add `metadata.home` section with home page metadata
- [ ] Add `metadata.auth` section with login/register metadata
- [ ] Add `metadata.dashboard` section with all dashboard page metadata
- [ ] Add `metadata.item` section with item view/edit metadata
- [ ] Add `metadata.error` section with error page metadata

### Task 2: Update Root Layout Metadata
- [ ] Import `getTranslations` and `getLocale` from `next-intl/server`
- [ ] Convert static `metadata` export to `generateMetadata` async function
- [ ] Set up `title.template` for consistent page title pattern
- [ ] Add `openGraph.locale` and `openGraph.alternateLocales`

### Task 3: Update Home Page Metadata
- [ ] Convert static `metadata` to `generateMetadata` function
- [ ] Update title, description to use translations
- [ ] Update Open Graph metadata to use translations
- [ ] Update Twitter Card metadata to use translations
- [ ] Update JSON-LD structured data if needed (may keep English for schema.org)

### Task 4: Add Auth Page Metadata
- [ ] Create `/src/app/login/layout.tsx` with `generateMetadata`
- [ ] Create `/src/app/register/layout.tsx` with `generateMetadata`
- [ ] Ensure success and complete pages inherit from register layout or add own

### Task 5: Add Dashboard Page Metadata
- [ ] Create layout files for each dashboard page that needs metadata
- [ ] Add `generateMetadata` to each layout
- [ ] Verify child client components still work correctly

### Task 6: Update Dynamic Item Page Metadata
- [ ] Update `generateMetadata` in `/src/app/item/[publicId]/page.tsx`
- [ ] Use `getTranslations` for static text
- [ ] Use variable interpolation for item name: `t('title', { itemName })`
- [ ] Handle not-found case with translated error metadata
- [ ] Add locale to Open Graph tags

### Task 7: Generate Non-English Translations
- [ ] Generate French translations for `metadata` namespace
- [ ] Generate Spanish translations for `metadata` namespace
- [ ] Generate German translations for `metadata` namespace
- [ ] Generate Dutch translations for `metadata` namespace
- [ ] Generate Italian translations for `metadata` namespace

### Task 8: Verification & Testing
- [ ] Verify all pages have translated metadata
- [ ] Test title display in browser tab for each page
- [ ] Test Open Graph preview using social media debugging tools
- [ ] Test locale switching updates metadata correctly
- [ ] Verify no hydration mismatches occur
- [ ] Test dynamic metadata with variable interpolation
- [ ] Verify fallback to English when translation missing

---

## Testing Considerations

### Functional Testing
1. Visit each page and verify browser tab shows correct translated title
2. Switch locale and verify metadata updates (may require page refresh)
3. Test social sharing preview on home page and item pages
4. Test dynamic item pages with different item names

### SEO Testing
1. Use Google's Rich Results Test for structured data
2. Verify Open Graph tags using Facebook Sharing Debugger
3. Verify Twitter Card tags using Twitter Card Validator
4. Check `<html lang>` attribute matches current locale

### Layout & Performance Testing
1. Long German translations in titles should not break display
2. Metadata generation should not significantly impact page load
3. Verify no hydration mismatches in browser console

### Accessibility Testing
1. Screen readers announce correct page titles
2. Bookmarked pages show translated titles
3. Browser history shows translated titles

---

## Dependencies

### Prerequisites
- Epic 1 foundation complete (next-intl configured)
- `getTranslations` and `getLocale` available from `next-intl/server`
- Translation files exist at `/messages/*.json`

### Related Tasks
- Task 2B.1: Create `dashboard` namespace structure (should be complete)
- Task 2B.2-2B.5: Other dashboard components (can run in parallel)
- Task 2B.7: Generate translations for 5 non-English languages (after this task)

### Blocking Issues
- Client components cannot export `generateMetadata` directly - must use layout wrappers
- `force-dynamic` in root layout may affect metadata caching

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Client component pages can't export metadata | High | High | Use layout wrapper pattern for all client pages |
| German translations too long for SEO | Medium | Low | Keep titles under 60 chars, descriptions under 160 chars |
| Hydration mismatches with locale | Low | Medium | Ensure metadata generation is server-side only |
| JSON-LD schema.org needs English | Low | Low | Keep structured data in English (schema.org standard) |
| Social media caches old metadata | Low | Low | Document cache clearing process; OG tags eventually refresh |
| Dynamic routes have missing translations | Medium | Medium | Always provide fallback English strings |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Add metadata translations to en.json | 30 min |
| Update root layout metadata | 20 min |
| Update home page metadata | 30 min |
| Add auth page metadata (4 pages) | 40 min |
| Add dashboard page metadata (8 pages) | 1 hour |
| Update dynamic item page metadata | 30 min |
| Generate non-English translations | 30 min |
| Testing & verification | 45 min |
| **Total** | **~5 hours** |

---

## References

- [PRD: Localization Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-054](/docs/gen_requests_epic2.md)
- [next-intl Server Components](https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## Acceptance Criteria Checklist

From the request specification:

- [ ] All dashboard page components update metadata using next-intl translation functions
- [ ] All authentication page components update metadata using translation keys
- [ ] All settings and profile page components update metadata using translation keys
- [ ] All property management page components update metadata using translation keys
- [ ] All navigation and layout page components update metadata using translation keys
- [ ] Page titles dynamically render in user's selected language
- [ ] Meta descriptions dynamically render in user's selected language
- [ ] Open Graph title tags use localized strings where present
- [ ] Open Graph description tags use localized strings where present
- [ ] Twitter Card metadata uses localized strings where applicable
- [ ] Metadata translations added to existing namespace files (dashboard, auth, common, settings, etc.)
- [ ] Metadata follows consistent structure across all pages (title patterns, description formats)
- [ ] Dynamic metadata (e.g., including property names, item counts) uses variable interpolation correctly
- [ ] Metadata translations support variables where dynamic content is included
- [ ] Page titles follow a consistent pattern (e.g., "Page Name | Application Name")
- [ ] Browser tab titles update correctly when user changes language
- [ ] Metadata properly handles special characters and non-Latin scripts
- [ ] Long metadata strings in verbose languages do not exceed recommended character limits for SEO
- [ ] All metadata keys use descriptive, namespace-appropriate naming conventions
- [ ] Metadata translations are generated for all five non-English languages
- [ ] Missing or fallback metadata gracefully defaults to English when translations unavailable
- [ ] Server-side generated metadata uses proper locale detection for initial page loads
- [ ] Client-side metadata updates correctly when user switches language without page reload
- [ ] No hardcoded English metadata strings remain in any page component
- [ ] TypeScript types for metadata structures remain consistent with Next.js Metadata API
- [ ] Metadata updates do not impact page performance or cause hydration mismatches
