# REQ-369: Update Page Metadata with Translations - Detailed Task Breakdown

**Generated:** 2026-01-19 19:30:00 UTC
**Last Modified:** 2026-01-19 19:30:00 UTC
**Request ID:** REQ-369
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2B - Dashboard & Navigation
**Task:** 2B.6 - Update page metadata with translations
**Size:** S (Small)
**Priority:** P2 - Medium
**Overview Document:** [REQ-369-update-page-metadata-with-translations-overview.md](./REQ-369-update-page-metadata-with-translations-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Executive Summary

This task breakdown document provides granular, actionable implementation steps for adding translated page metadata across the FAQBNB application. The work involves:

1. Creating a new `metadata` namespace in all 6 translation files
2. Building a reusable metadata generation utility
3. Updating 13+ page files to use translated metadata
4. Handling the technical constraint that client components cannot export `generateMetadata()`

**Key Technical Insight:** Most dashboard2 pages and auth pages are client components (`'use client'`), which cannot use `generateMetadata()`. The solution is to define metadata at the layout level or convert select pages to server components where feasible.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed, configured)
- [ ] Translation files exist at `/messages/*.json` for all 6 locales
- [ ] `getTranslations` from `next-intl/server` is available
- [ ] `NextIntlClientProvider` is configured in `/src/app/layout.tsx`
- [ ] Locale detection and cookie handling work correctly

---

## Task Breakdown

### Task 1: Add Metadata Namespace to English Translation File

**File:** `/messages/en.json`
**Story Points:** 1
**Dependencies:** None

**Description:**
Add a comprehensive `metadata` namespace to the English translation file with all page titles, descriptions, and OpenGraph/Twitter variants.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the `metadata` namespace after existing namespaces
3. Include the following structure:
   - `site` - Global site metadata (name, tagline)
   - `home` - Homepage metadata
   - `dashboard` - Dashboard main page
   - `items` - Items list page and item detail template
   - `properties` - Properties page
   - `rooms` - Rooms page
   - `tags` - Tags page
   - `instructions` - Instructions page
   - `help` - Help page
   - `create` - Create item page
   - `print` - Print page
   - `login` - Login page
   - `register` - Registration pages
   - `notFound` - 404 page

**Translation Keys to Add:**

```json
{
  "metadata": {
    "site": {
      "name": "FAQBNB",
      "tagline": "Instant Access to Product Information"
    },
    "home": {
      "title": "FAQBNB - Instant Access to Product Information via QR Codes | SaaS Platform",
      "description": "Transform customer support with FAQBNB. Provide instant access to manuals, videos, and product information through QR codes. No apps required.",
      "keywords": "QR code platform, product support, customer service, digital manuals, SaaS, product information, mobile support",
      "og": {
        "title": "FAQBNB - Instant Access to Product Information",
        "description": "Professional QR code platform for businesses. Transform how customers access product information and support."
      }
    },
    "dashboard": {
      "title": "Dashboard | FAQBNB",
      "description": "Manage your properties, items, and QR codes from your FAQBNB dashboard.",
      "og": {
        "title": "Dashboard - FAQBNB",
        "description": "Your FAQBNB dashboard for managing properties and items."
      }
    },
    "items": {
      "title": "Items | FAQBNB",
      "description": "View and manage all your QR code items.",
      "detail": {
        "title": "{itemName} - FAQBNB",
        "description": "View instructions and resources for {itemName}.",
        "descriptionFallback": "View instructions and resources for this item."
      },
      "og": {
        "title": "Items - FAQBNB",
        "description": "Manage your QR code items and their content."
      }
    },
    "properties": {
      "title": "Properties | FAQBNB",
      "description": "Manage your properties and their associated items.",
      "og": {
        "title": "Properties - FAQBNB",
        "description": "Organize and manage your property portfolio."
      }
    },
    "rooms": {
      "title": "Rooms | FAQBNB",
      "description": "Manage rooms within your properties.",
      "og": {
        "title": "Rooms - FAQBNB",
        "description": "Organize items by room location."
      }
    },
    "tags": {
      "title": "Tags | FAQBNB",
      "description": "Manage tags for organizing your items.",
      "og": {
        "title": "Tags - FAQBNB",
        "description": "Categorize and organize your items with tags."
      }
    },
    "instructions": {
      "title": "Instructions | FAQBNB",
      "description": "Manage content and instructions for your items.",
      "og": {
        "title": "Instructions - FAQBNB",
        "description": "Create and manage instructional content."
      }
    },
    "help": {
      "title": "Help | FAQBNB",
      "description": "Get help and support for using FAQBNB.",
      "og": {
        "title": "Help - FAQBNB",
        "description": "Find answers and support resources."
      }
    },
    "create": {
      "title": "Create Item | FAQBNB",
      "description": "Create a new QR code item for your property.",
      "og": {
        "title": "Create Item - FAQBNB",
        "description": "Add a new item to your property."
      }
    },
    "print": {
      "title": "Print QR Codes | FAQBNB",
      "description": "Print QR codes for your items.",
      "og": {
        "title": "Print QR Codes - FAQBNB",
        "description": "Download and print QR codes."
      }
    },
    "login": {
      "title": "Sign In | FAQBNB",
      "description": "Sign in to access your FAQBNB dashboard.",
      "og": {
        "title": "Sign In - FAQBNB",
        "description": "Access your FAQBNB account."
      }
    },
    "register": {
      "title": "Create Account | FAQBNB",
      "description": "Create a FAQBNB account to start managing your properties.",
      "success": {
        "title": "Registration Complete | FAQBNB",
        "description": "Your account has been created successfully."
      },
      "complete": {
        "title": "Complete Registration | FAQBNB",
        "description": "Complete your FAQBNB account setup."
      },
      "og": {
        "title": "Create Account - FAQBNB",
        "description": "Join FAQBNB and start managing your properties."
      }
    },
    "notFound": {
      "title": "Page Not Found | FAQBNB",
      "description": "The requested page could not be found.",
      "item": {
        "title": "Item Not Found | FAQBNB",
        "description": "The requested item could not be found."
      }
    }
  }
}
```

**Verification:**
- [ ] JSON syntax is valid
- [ ] All namespace keys follow `metadata.{page}.{element}` convention
- [ ] Variables use ICU format with curly braces `{variableName}`
- [ ] No trailing commas in JSON

---

### Task 2: Add Metadata Namespace to Non-English Translation Files

**Files:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Story Points:** 1
**Dependencies:** Task 1

**Description:**
Add translated `metadata` namespace to all 5 non-English translation files.

**Implementation Steps:**

1. For each language file:
   - Copy the structure from Task 1
   - Translate all values appropriately
   - Maintain variable placeholders exactly as `{variableName}`
   - Keep the brand name "FAQBNB" untranslated

**French (`fr.json`) Example:**

```json
{
  "metadata": {
    "site": {
      "name": "FAQBNB",
      "tagline": "Accès Instantané aux Informations Produit"
    },
    "home": {
      "title": "FAQBNB - Accès Instantané aux Informations Produit via QR Codes | Plateforme SaaS",
      "description": "Transformez le support client avec FAQBNB. Offrez un accès instantané aux manuels, vidéos et informations produit via des codes QR. Aucune application requise.",
      "keywords": "plateforme code QR, support produit, service client, manuels numériques, SaaS, information produit, support mobile",
      "og": {
        "title": "FAQBNB - Accès Instantané aux Informations Produit",
        "description": "Plateforme professionnelle de codes QR pour les entreprises. Transformez l'accès de vos clients aux informations produit et au support."
      }
    },
    "dashboard": {
      "title": "Tableau de Bord | FAQBNB",
      "description": "Gérez vos propriétés, articles et codes QR depuis votre tableau de bord FAQBNB."
    },
    "login": {
      "title": "Connexion | FAQBNB",
      "description": "Connectez-vous pour accéder à votre tableau de bord FAQBNB."
    }
  }
}
```

**Verification:**
- [ ] All 5 language files have identical key structures
- [ ] Variable placeholders preserved exactly
- [ ] Brand name "FAQBNB" not translated
- [ ] SEO keywords appropriately localized

---

### Task 3: Create Metadata Generation Utility Module

**New File:** `/src/lib/i18n/metadata.ts`
**Story Points:** 1
**Dependencies:** Task 1

**Description:**
Create a reusable utility module for generating translated metadata. This utility will be used by all pages that support `generateMetadata()`.

**Implementation Steps:**

1. Create new file `/src/lib/i18n/metadata.ts`
2. Import necessary dependencies from `next-intl/server` and `next`
3. Define TypeScript interfaces for options and return types
4. Implement `generateLocalizedMetadata()` function
5. Implement `generateItemMetadata()` helper for dynamic item pages
6. Export all utilities

**Code Implementation:**

```typescript
/**
 * Localized Metadata Generation Utility
 *
 * Provides utilities for generating translated page metadata
 * using next-intl server-side translation functions.
 *
 * REQ-369: Update page metadata with translations
 * Epic: Epic 2 - Static UI Localization
 * Sub-Epic: 2B - Dashboard & Navigation
 *
 * @module lib/i18n/metadata
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

/**
 * Options for generating localized metadata
 */
export interface LocalizedMetadataOptions {
  /** Translation namespace key (e.g., 'dashboard', 'items', 'login') */
  namespace: string;
  /** Variables for interpolation in translation strings */
  variables?: Record<string, string>;
  /** Whether to add noindex,nofollow robots directive */
  noIndex?: boolean;
  /** Custom canonical URL path (appended to base URL) */
  canonicalPath?: string;
  /** Override the base URL */
  baseUrl?: string;
}

/**
 * Options for generating item-specific metadata
 */
export interface ItemMetadataOptions {
  /** Item name for title */
  itemName: string;
  /** Item description (optional) */
  itemDescription?: string;
  /** Item public ID for canonical URL */
  publicId: string;
}

/**
 * Default base URL for the application
 */
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000');

/**
 * Supported locales for alternate language links
 */
const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Generates localized metadata for a page
 *
 * @param options - Configuration options for metadata generation
 * @returns Promise<Metadata> - Next.js Metadata object with translated content
 *
 * @example
 * ```typescript
 * export async function generateMetadata(): Promise<Metadata> {
 *   return generateLocalizedMetadata({ namespace: 'dashboard' });
 * }
 * ```
 */
export async function generateLocalizedMetadata(
  options: LocalizedMetadataOptions
): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;

  const { namespace, variables = {}, noIndex = false, canonicalPath = '' } = options;

  // Build translation keys with namespace prefix
  const titleKey = `${namespace}.title`;
  const descriptionKey = `${namespace}.description`;
  const ogTitleKey = `${namespace}.og.title`;
  const ogDescriptionKey = `${namespace}.og.description`;

  // Attempt to get translations with fallback
  const title = safeTranslate(t, titleKey, variables) || t('site.name');
  const description = safeTranslate(t, descriptionKey, variables) || '';
  const ogTitle = safeTranslate(t, ogTitleKey, variables) || title;
  const ogDescription = safeTranslate(t, ogDescriptionKey, variables) || description;

  // Build alternate language links
  const alternateLanguages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    alternateLanguages[loc] = `${baseUrl}/${loc}${canonicalPath}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale,
      siteName: t('site.name'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: alternateLanguages,
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
  };
}

/**
 * Generates localized metadata for an item detail page
 *
 * @param options - Item-specific metadata options
 * @returns Promise<Metadata> - Next.js Metadata object with item-specific content
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const item = await fetchItem(params.publicId);
 *   return generateItemMetadata({
 *     itemName: item.name,
 *     itemDescription: item.description,
 *     publicId: params.publicId,
 *   });
 * }
 * ```
 */
export async function generateItemMetadata(
  options: ItemMetadataOptions
): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();
  const baseUrl = DEFAULT_BASE_URL;

  const { itemName, itemDescription, publicId } = options;

  // Use item-specific title template with variable interpolation
  const title = t('items.detail.title', { itemName });
  const description = itemDescription ||
    t('items.detail.description', { itemName }) ||
    t('items.detail.descriptionFallback');

  const canonicalPath = `/item/${publicId}`;

  // Build alternate language links
  const alternateLanguages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    alternateLanguages[loc] = `${baseUrl}/${loc}${canonicalPath}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title: itemName,
      description,
      locale,
      siteName: t('site.name'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: itemName,
      description,
    },
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: alternateLanguages,
    },
    robots: 'index, follow',
  };
}

/**
 * Generates fallback metadata when item is not found
 *
 * @returns Promise<Metadata> - Metadata for not found state
 */
export async function generateNotFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('notFound.item.title'),
    description: t('notFound.item.description'),
    robots: 'noindex, nofollow',
  };
}

/**
 * Safe translation helper that returns undefined if key doesn't exist
 *
 * @param t - Translation function
 * @param key - Translation key
 * @param variables - Variables for interpolation
 * @returns Translated string or undefined
 */
function safeTranslate(
  t: Awaited<ReturnType<typeof getTranslations>>,
  key: string,
  variables?: Record<string, string>
): string | undefined {
  try {
    const result = t(key, variables);
    // If the translation returns the key itself, it means it wasn't found
    return result !== key ? result : undefined;
  } catch {
    return undefined;
  }
}
```

**Verification:**
- [ ] TypeScript compiles without errors
- [ ] All exports are properly typed
- [ ] Function handles missing translations gracefully
- [ ] Alternate language links include all 6 locales

---

### Task 4: Export Metadata Utility from i18n Module

**File:** `/src/lib/i18n/index.ts`
**Story Points:** 0.5
**Dependencies:** Task 3

**Description:**
Add exports for the new metadata utility to the centralized i18n module.

**Implementation Steps:**

1. Open `/src/lib/i18n/index.ts`
2. Add imports from `./metadata`
3. Add exports for all metadata utilities and types

**Code to Add:**

```typescript
// Metadata generation utilities (REQ-369)
export {
  generateLocalizedMetadata,
  generateItemMetadata,
  generateNotFoundMetadata,
  type LocalizedMetadataOptions,
  type ItemMetadataOptions,
} from './metadata';
```

**Verification:**
- [ ] Module compiles without errors
- [ ] Exports are accessible via `import { generateLocalizedMetadata } from '@/lib/i18n'`

---

### Task 5: Update Homepage Metadata

**File:** `/src/app/page.tsx`
**Story Points:** 1
**Dependencies:** Tasks 1, 3

**Description:**
Convert the homepage from static `metadata` export to dynamic `generateMetadata()` function with translations.

**Current State:**
- Exports `const metadata: Metadata` with hardcoded English
- Contains JSON-LD structured data
- Includes OpenGraph and Twitter Card configuration

**Implementation Steps:**

1. Remove the static `export const metadata: Metadata` block
2. Add `generateMetadata()` async function import and implementation
3. Update to use `getTranslations('metadata')`
4. Preserve keywords metadata (if supported by namespace)
5. Keep JSON-LD structured data unchanged (will be addressed separately if needed)

**Code Changes:**

```typescript
// Remove this:
export const metadata: Metadata = {
  // ... existing content
};

// Add this import at top:
import { getTranslations, getLocale } from 'next-intl/server';

// Add this function (after imports, before HomePage component):
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000';

  return {
    metadataBase: new URL(baseUrl),
    title: t('home.title'),
    description: t('home.description'),
    keywords: t('home.keywords'),
    openGraph: {
      title: t('home.og.title'),
      description: t('home.og.description'),
      url: baseUrl,
      siteName: t('site.name'),
      type: 'website',
      locale,
      images: [
        {
          url: '/faqbnb_logolong_alt.png',
          width: 500,
          height: 167,
          alt: 'FAQBNB Platform Preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.og.title'),
      description: t('home.og.description'),
      images: ['/faqbnb_logolong_alt.png'],
    },
    robots: 'index, follow',
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
  };
}
```

**Verification:**
- [ ] Page renders without errors
- [ ] Browser tab shows translated title
- [ ] View page source shows translated meta tags
- [ ] OpenGraph tags are present and translated
- [ ] Language switching updates metadata

---

### Task 6: Update Item Display Page Metadata

**File:** `/src/app/item/[publicId]/page.tsx`
**Story Points:** 1
**Dependencies:** Tasks 1, 3

**Description:**
Update the existing `generateMetadata()` function to use translations for static text while preserving dynamic item name interpolation.

**Current State:**
- Already uses `generateMetadata()` function
- Fetches item data dynamically
- Returns hardcoded English fallback text

**Implementation Steps:**

1. Import `generateItemMetadata` and `generateNotFoundMetadata` from `@/lib/i18n`
2. Update the `generateMetadata` function to use the utility
3. Preserve ISR caching strategy (revalidate: 60)

**Code Changes:**

```typescript
// Add import:
import { generateItemMetadata, generateNotFoundMetadata } from '@/lib/i18n';

// Update generateMetadata function:
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { publicId } = await params;

    // Try API first
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const { data: item } = await response.json();
      return generateItemMetadata({
        itemName: item.name,
        itemDescription: item.description,
        publicId,
      });
    }

    // Fallback to demo data
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      return generateItemMetadata({
        itemName: demoItem.name,
        itemDescription: demoItem.description,
        publicId,
      });
    }

    return generateNotFoundMetadata();
  } catch (error) {
    return generateNotFoundMetadata();
  }
}
```

**Verification:**
- [ ] Item pages show translated metadata templates
- [ ] Item name is properly interpolated into title
- [ ] Not found pages show translated error metadata
- [ ] ISR caching still works correctly

---

### Task 7: Add Metadata to Dashboard2 Layout

**File:** `/src/app/dashboard2/layout.tsx`
**Story Points:** 1
**Dependencies:** Tasks 1, 3

**Description:**
Since dashboard2 pages are client components (`'use client'`), add metadata at the layout level. Create a separate server component wrapper or use a metadata segment config.

**Technical Approach:**
Next.js App Router allows metadata in layout files even when child pages are client components. We need to separate the metadata generation from the client-side layout component.

**Implementation Steps:**

1. Create a new server-side layout metadata file or add metadata export
2. Since the layout.tsx has `'use client'`, create a separate metadata config or use Next.js built-in template

**Option A: Create separate metadata file (recommended):**

Create `/src/app/dashboard2/metadata.ts`:

```typescript
/**
 * Dashboard2 Metadata Configuration
 *
 * Server-side metadata for dashboard pages.
 * REQ-369: Update page metadata with translations
 *
 * @created 2026-01-19
 */

import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';

// Default dashboard metadata
export async function generateDashboardMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'dashboard',
    noIndex: true, // Dashboard pages shouldn't be indexed
  });
}
```

**Option B: Create Server Component Wrapper:**

Create `/src/app/dashboard2/layout.server.tsx`:

```typescript
import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'dashboard',
    noIndex: true,
  });
}
```

Then import and use in the main layout.

**Option C: Use Next.js Template Pattern:**

Since the layout is `'use client'`, we need to create a server component parent. Restructure to:

1. Rename `/src/app/dashboard2/layout.tsx` to `/src/app/dashboard2/ClientLayout.tsx`
2. Create new `/src/app/dashboard2/layout.tsx` as server component with metadata
3. Import and render `ClientLayout` as a child

**Recommended Implementation (Option C):**

**Step 1: Rename existing layout**

```bash
mv /src/app/dashboard2/layout.tsx /src/app/dashboard2/ClientLayout.tsx
```

**Step 2: Update ClientLayout.tsx**
- Remove default export
- Export named component `Dashboard2ClientLayout`

**Step 3: Create new server layout with metadata**

New `/src/app/dashboard2/layout.tsx`:

```typescript
/**
 * Dashboard2 Layout (Server Component)
 *
 * Server-side wrapper that provides metadata for dashboard pages.
 * Renders the client-side Dashboard2ClientLayout component.
 *
 * REQ-369: Update page metadata with translations
 *
 * @route /dashboard2
 * @created 2026-01-19
 */

import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';
import Dashboard2ClientLayout from './ClientLayout';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'dashboard',
    noIndex: true, // Protected pages should not be indexed
  });
}

export default function Dashboard2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard2ClientLayout>{children}</Dashboard2ClientLayout>;
}
```

**Verification:**
- [ ] Dashboard pages render without errors
- [ ] Browser tab shows translated dashboard title
- [ ] Meta tags include noindex for protected pages
- [ ] Client-side functionality preserved

---

### Task 8: Add Metadata to Individual Dashboard2 Pages

**Files:**
- `/src/app/dashboard2/items/page.tsx`
- `/src/app/dashboard2/properties/page.tsx`
- `/src/app/dashboard2/rooms/page.tsx`
- `/src/app/dashboard2/tags/page.tsx`
- `/src/app/dashboard2/instructions/page.tsx`
- `/src/app/dashboard2/help/page.tsx`
- `/src/app/dashboard2/create/page.tsx`
- `/src/app/dashboard2/print/page.tsx`

**Story Points:** 2
**Dependencies:** Tasks 1, 3, 7

**Description:**
Add page-specific metadata to each dashboard2 subpage. Since these are client components, use Next.js's metadata segment pattern by creating sibling metadata export files.

**Implementation Approach:**

For each page that is a client component, create a sibling `page.metadata.ts` or use the route segment config pattern.

**Alternative: Use Layout-based metadata with template**

Create page-specific layouts with metadata:

**Example for Items page:**

Create `/src/app/dashboard2/items/layout.tsx`:

```typescript
import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'items',
    noIndex: true,
  });
}

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Repeat this pattern for each dashboard subpage:

| Page | Namespace | Notes |
|------|-----------|-------|
| `/dashboard2/items/` | `items` | Item list |
| `/dashboard2/properties/` | `properties` | Property list |
| `/dashboard2/rooms/` | `rooms` | Room management |
| `/dashboard2/tags/` | `tags` | Tag management |
| `/dashboard2/instructions/` | `instructions` | Instructions list |
| `/dashboard2/help/` | `help` | Help page |
| `/dashboard2/create/` | `create` | Create item wizard |
| `/dashboard2/print/` | `print` | Print QR codes |

**Verification:**
- [ ] Each page shows appropriate translated title in browser tab
- [ ] Meta tags are present for each page
- [ ] All pages use noindex directive
- [ ] Navigation between pages updates metadata

---

### Task 9: Add Metadata to Authentication Pages

**Files:**
- `/src/app/login/page.tsx`
- `/src/app/register/page.tsx`
- `/src/app/register/success/page.tsx`
- `/src/app/register/complete/page.tsx`

**Story Points:** 1
**Dependencies:** Tasks 1, 3

**Description:**
Add translated metadata to authentication pages. Since these are client components, use the layout pattern.

**Implementation Steps:**

**Login Page:**

Create `/src/app/login/layout.tsx`:

```typescript
import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'login',
    canonicalPath: '/login',
  });
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**Register Pages:**

Create `/src/app/register/layout.tsx`:

```typescript
import { generateLocalizedMetadata } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateLocalizedMetadata({
    namespace: 'register',
    canonicalPath: '/register',
  });
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

For success and complete pages, create nested layouts:

Create `/src/app/register/success/layout.tsx`:

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('register.success.title'),
    description: t('register.success.description'),
    robots: 'noindex, nofollow',
  };
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Repeat for `/src/app/register/complete/layout.tsx`.

**Verification:**
- [ ] Login page shows translated "Sign In" title
- [ ] Register pages show translated "Create Account" title
- [ ] Success/complete pages show appropriate translated titles
- [ ] Auth pages are indexable (or not, based on SEO strategy)

---

### Task 10: Manual Testing and Validation

**Story Points:** 1
**Dependencies:** Tasks 1-9

**Description:**
Comprehensive manual testing of all translated metadata across all pages and languages.

**Test Checklist:**

#### Functional Tests
- [ ] Homepage displays correct translated title in each language
- [ ] Homepage meta description is translated
- [ ] Homepage OpenGraph tags are translated
- [ ] Dashboard pages show translated titles
- [ ] Item detail pages show item name in title template
- [ ] Auth pages show translated titles
- [ ] Language switching updates all metadata

#### SEO Tests
- [ ] View page source shows translated meta tags
- [ ] Canonical URLs are correct
- [ ] Alternate language links point to correct locales
- [ ] Protected pages have noindex directive
- [ ] Public pages have index,follow directive

#### Browser Tests
- [ ] Tab titles display correctly without truncation
- [ ] Bookmark saves with translated title
- [ ] Browser history shows translated titles

#### Social Sharing Tests (Optional)
- [ ] Facebook debugger shows localized OG tags
- [ ] Twitter Card validator shows localized content
- [ ] LinkedIn preview shows translated content

**Test Matrix:**

| Page | EN | FR | ES | DE | NL | IT |
|------|----|----|----|----|----|----|
| Homepage | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Dashboard | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Items List | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Item Detail | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Properties | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Login | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Register | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Summary Table

| Task | Description | Story Points | Dependencies |
|------|-------------|--------------|--------------|
| 1 | Add metadata namespace to en.json | 1 | None |
| 2 | Add metadata namespace to non-English files | 1 | Task 1 |
| 3 | Create metadata generation utility | 1 | Task 1 |
| 4 | Export metadata utility from i18n module | 0.5 | Task 3 |
| 5 | Update homepage metadata | 1 | Tasks 1, 3 |
| 6 | Update item display page metadata | 1 | Tasks 1, 3 |
| 7 | Add metadata to dashboard2 layout | 1 | Tasks 1, 3 |
| 8 | Add metadata to dashboard2 subpages | 2 | Tasks 1, 3, 7 |
| 9 | Add metadata to auth pages | 1 | Tasks 1, 3 |
| 10 | Manual testing and validation | 1 | Tasks 1-9 |
| **Total** | | **10.5** | |

---

## Files Modified/Created Summary

### New Files (CREATE)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/metadata.ts` | Metadata generation utilities |
| `/src/app/dashboard2/ClientLayout.tsx` | Renamed from layout.tsx |
| `/src/app/dashboard2/layout.tsx` | Server component with metadata |
| `/src/app/dashboard2/items/layout.tsx` | Items page metadata |
| `/src/app/dashboard2/properties/layout.tsx` | Properties page metadata |
| `/src/app/dashboard2/rooms/layout.tsx` | Rooms page metadata |
| `/src/app/dashboard2/tags/layout.tsx` | Tags page metadata |
| `/src/app/dashboard2/instructions/layout.tsx` | Instructions page metadata |
| `/src/app/dashboard2/help/layout.tsx` | Help page metadata |
| `/src/app/dashboard2/create/layout.tsx` | Create page metadata |
| `/src/app/dashboard2/print/layout.tsx` | Print page metadata |
| `/src/app/login/layout.tsx` | Login page metadata |
| `/src/app/register/layout.tsx` | Register page metadata |
| `/src/app/register/success/layout.tsx` | Success page metadata |
| `/src/app/register/complete/layout.tsx` | Complete page metadata |

### Modified Files (UPDATE)

| File | Modification |
|------|--------------|
| `/messages/en.json` | Add `metadata` namespace |
| `/messages/fr.json` | Add `metadata` namespace (translated) |
| `/messages/es.json` | Add `metadata` namespace (translated) |
| `/messages/de.json` | Add `metadata` namespace (translated) |
| `/messages/nl.json` | Add `metadata` namespace (translated) |
| `/messages/it.json` | Add `metadata` namespace (translated) |
| `/src/lib/i18n/index.ts` | Add metadata utility exports |
| `/src/app/page.tsx` | Convert to generateMetadata() |
| `/src/app/item/[publicId]/page.tsx` | Use metadata utilities |

---

## Acceptance Criteria Checklist

| Acceptance Criteria | Task(s) | Status |
|---------------------|---------|--------|
| All page document titles use translation keys | 5-9 | ⬜ |
| All meta description tags retrieve translated content | 5-9 | ⬜ |
| Open Graph title and description display localized | 5-9 | ⬜ |
| Twitter Card metadata uses translation keys | 5-9 | ⬜ |
| Page metadata updates when language is changed | 5-9 | ⬜ |
| Each language has complete metadata translations | 1-2 | ⬜ |
| No hardcoded English strings in metadata code | 5-9 | ⬜ |
| Translation keys follow naming conventions | 1-2 | ⬜ |
| Dynamic titles combine with translated templates | 6 | ⬜ |
| Default fallback metadata exists | 3, 6 | ⬜ |

---

## Notes for Implementation

1. **Build Verification:** Run `npm run build` after each major task to catch compilation errors early.

2. **Translation Quality:** Consider using AI translation (Claude/GPT) for initial translations, then review SEO-critical content.

3. **Testing Strategy:** Test metadata changes in development using browser dev tools > Elements > head section.

4. **Caching Considerations:** Metadata changes may require clearing Next.js cache (`rm -rf .next`) during development.

5. **Incremental Deployment:** Tasks can be deployed incrementally; each task results in a functional state.

---

*Detailed task breakdown document generated for REQ-369: Update Page Metadata with Translations*
*Epic 2: Static UI Localization | Sub-Epic 2B: Dashboard & Navigation | Task 2B.6*
