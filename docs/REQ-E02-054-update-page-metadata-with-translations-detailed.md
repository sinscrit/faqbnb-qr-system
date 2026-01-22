# Detailed Task Breakdown: REQ-E02-054 - Update Page Metadata with Translations

**Generated:** 2026-01-20 23:45:00 UTC
**Last Modified:** 2026-01-22 03:45:00 UTC
**Request ID:** REQ-E02-054
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.6
**Overview Document:** REQ-E02-054-update-page-metadata-with-translations-overview.md
**Size:** M (Medium)
**Priority:** P1 - High

---

## Executive Summary

This task involves updating page metadata (titles, descriptions, Open Graph tags, Twitter cards) across all application pages to use the next-intl translation system. Currently, metadata is hardcoded in English in static `Metadata` exports. The implementation will convert these to dynamic `generateMetadata` functions that leverage `getTranslations` from `next-intl/server`, enabling localized SEO and social sharing experiences.

---

## Prerequisites

Before starting this task, ensure:

1. **Epic 1 Foundation Complete:**
   - `next-intl` package installed and configured
   - `NextIntlClientProvider` wrapping the application (verified in `/src/app/layout.tsx`)
   - `getTranslations` and `getLocale` available from `next-intl/server`
   - Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`

2. **Related Tasks Complete:**
   - Task 2B.1: Dashboard namespace structure created

---

## Current State Analysis

### Root Layout (`/src/app/layout.tsx`)
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides...",
};
```
**Issue:** Static English metadata export

### Home Page (`/src/app/page.tsx`)
```typescript
export const metadata: Metadata = {
  title: 'FAQBNB - Instant Access to Product Information via QR Codes | SaaS Platform',
  description: 'Transform customer support with FAQBNB...',
  openGraph: { ... },
  twitter: { ... },
};
```
**Issue:** Extensive static English metadata with OG/Twitter cards

### Dashboard Pages
Most dashboard pages (e.g., `/dashboard2/page.tsx`) are client components (`'use client'`) with no metadata exports, relying on root layout defaults.

**Challenge:** Client components cannot directly export `generateMetadata` - requires layout wrapper pattern.

---

## Task Breakdown

### Task 1: Create Metadata Translation Namespace
**Priority:** Critical (Blocks all other tasks)
**Estimate:** 1 story point

#### 1.1 Add metadata namespace to `/messages/en.json`

**File:** `/messages/en.json`

**Add the following structure:**

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
      },
      "print": {
        "title": "Print QR Codes | FAQBNB",
        "description": "Print QR codes for your items and properties"
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

**Verification:**
- [x] Namespace follows `metadata.{area}.{page}.{element}` convention ---implemented: Added metadata namespace with app, home, auth, dashboard, item, error areas---
- [x] All interpolation variables use `{variableName}` format ---implemented: itemName used for dynamic item pages---
- [x] JSON is valid and properly formatted ---implemented: Validated with node JSON.parse---

---

### Task 2: Update Root Layout Metadata
**Priority:** Critical
**Estimate:** 1 story point
**Dependencies:** Task 1

#### 2.1 Convert static metadata to generateMetadata

**File:** `/src/app/layout.tsx`

**Current Code (lines 35-39):**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes",
};
```

**Replace with:**
```typescript
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

**Verification:**
- [x] Import statements added for `getTranslations` and `getLocale` ---implemented: Added getTranslations to existing import from next-intl/server---
- [x] Static `metadata` export removed ---implemented: Replaced with generateMetadata function---
- [x] `generateMetadata` is async function returning `Promise<Metadata>` ---implemented: Async function with Promise<Metadata> return type---
- [x] `title.template` set to `'%s'` to allow child pages to override completely ---implemented: title object with default and template properties---
- [x] OpenGraph locale set dynamically ---implemented: Using await getLocale()---

---

### Task 3: Update Home Page Metadata
**Priority:** Critical
**Estimate:** 1 story point
**Dependencies:** Task 1

#### 3.1 Convert static metadata to generateMetadata

**File:** `/src/app/page.tsx`

**Current Code (lines 8-38):**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(...),
  title: 'FAQBNB - Instant Access to Product Information via QR Codes | SaaS Platform',
  description: 'Transform customer support with FAQBNB...',
  keywords: 'QR code platform...',
  openGraph: { ... },
  twitter: { ... },
  robots: 'index, follow',
  alternates: { ... },
};
```

**Replace with:**
```typescript
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');
  const locale = await getLocale();

  return {
    metadataBase: new URL(
      process.env.NODE_ENV === 'production'
        ? 'https://faqbnb.com'
        : 'http://localhost:3000'
    ),
    title: t('title'),
    description: t('description'),
    keywords: 'QR code platform, product support, customer service, digital manuals, SaaS, product information, mobile support',
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://faqbnb.com',
      siteName: 'FAQBNB',
      type: 'website',
      locale: locale,
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
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/faqbnb_logolong_alt.png'],
    },
    robots: 'index, follow',
    alternates: {
      canonical: 'https://faqbnb.com',
    },
  };
}
```

**Note:** Keep `keywords` in English as it's a technical SEO field that doesn't benefit from translation. Keep JSON-LD structured data in English (schema.org standard).

**Verification:**
- [x] All user-visible metadata strings use `t()` function ---implemented: title, description, ogTitle, ogDescription now use t()---
- [x] OpenGraph includes `locale` property ---implemented: Added locale from getLocale()---
- [x] Twitter cards use translated strings ---implemented: Twitter title and description use t()---
- [x] JSON-LD remains in English (schema.org standard) ---implemented: JSON-LD unchanged---

---

### Task 4: Create Auth Page Layout Wrappers
**Priority:** High
**Estimate:** 2 story points
**Dependencies:** Task 1

Since auth pages are client components, we need layout wrappers for metadata.

#### 4.1 Create login layout

**File:** `/src/app/login/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.auth.login');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 4.2 Create register layout

**File:** `/src/app/register/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.auth.register');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 4.3 Create register/success layout

**File:** `/src/app/register/success/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.auth.registerSuccess');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function RegisterSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 4.4 Create register/complete layout

**File:** `/src/app/register/complete/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.auth.registerComplete');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function RegisterCompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

**Verification:**
- [x] All 4 layout files created ---implemented: login/layout.tsx, register/layout.tsx, register/success/layout.tsx, register/complete/layout.tsx---
- [x] Each layout exports `generateMetadata` async function ---implemented: All 4 layouts export generateMetadata---
- [x] Each layout returns `children` unmodified ---implemented: All return children directly---
- [ ] Login page shows "Sign In | FAQBNB" in browser tab
- [ ] Register page shows "Create Account | FAQBNB" in browser tab

---

### Task 5: Create Dashboard Page Layout Wrappers
**Priority:** High
**Estimate:** 3 story points
**Dependencies:** Task 1

#### 5.1 Update existing dashboard2 layout

**File:** `/src/app/dashboard2/layout.tsx`

Add `generateMetadata` to existing layout (do not remove existing layout content).

**Add to existing file:**
```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.home');

  return {
    title: t('title'),
    description: t('description'),
  };
}

// Keep existing layout component unchanged
```

#### 5.2 Create items layout

**File:** `/src/app/dashboard2/items/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.items');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.3 Create create layout

**File:** `/src/app/dashboard2/create/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.create');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.4 Create properties layout

**File:** `/src/app/dashboard2/properties/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.properties');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.5 Create instructions layout

**File:** `/src/app/dashboard2/instructions/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.instructions');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function InstructionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.6 Create help layout

**File:** `/src/app/dashboard2/help/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.help');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.7 Create rooms layout

**File:** `/src/app/dashboard2/rooms/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.rooms');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.8 Create tags layout

**File:** `/src/app/dashboard2/tags/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.tags');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

#### 5.9 Create print layout

**File:** `/src/app/dashboard2/print/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.print');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

**Verification:**
- [x] All 9 dashboard layout files created/updated ---implemented: dashboard2/layout.tsx refactored to server component with generateMetadata; created items/layout.tsx, create/layout.tsx, properties/layout.tsx, instructions/layout.tsx, help/layout.tsx, rooms/layout.tsx, tags/layout.tsx, print/layout.tsx---
- [ ] Each shows correct translated title in browser tab
- [x] No interference with existing layouts (dashboard2/layout.tsx) ---implemented: Client component extracted to Dashboard2LayoutClient.tsx, server layout wraps it---

---

### Task 6: Update Dynamic Item Page Metadata
**Priority:** High
**Estimate:** 1 story point
**Dependencies:** Task 1

#### 6.1 Update item page generateMetadata

**File:** `/src/app/item/[publicId]/page.tsx`

**Find the existing `generateMetadata` function and update to:**

```typescript
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const t = await getTranslations('metadata.item');
  const locale = await getLocale();

  // Fetch item data (keep existing fetch logic)
  const item = await fetchItem(publicId);

  if (!item) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }

  return {
    title: t('view.title', { itemName: item.name }),
    description: item.description || t('view.description', { itemName: item.name }),
    openGraph: {
      title: t('view.ogTitle', { itemName: item.name }),
      description: item.description || t('view.ogDescription', { itemName: item.name }),
      locale: locale,
      type: 'website',
    },
  };
}
```

**Note:** Keep the existing item fetching logic; only modify the metadata string sources.

**Verification:**
- [ ] Dynamic item names interpolated correctly
- [ ] Not-found case returns translated metadata
- [ ] OpenGraph includes locale
- [ ] Item's custom description takes precedence over generic translation

---

### Task 7: Create Item Edit Page Layout

**Priority:** Medium
**Estimate:** 0.5 story points
**Dependencies:** Task 1

#### 7.1 Create item edit layout

**File:** `/src/app/dashboard2/items/[publicId]/edit/layout.tsx` (NEW FILE)

```typescript
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { publicId } = await params;
  const t = await getTranslations('metadata.item');

  // For edit page, we could fetch item name, but for simplicity use generic
  // If needed, implement item fetch here
  return {
    title: t('edit.title', { itemName: 'Item' }),
    description: t('edit.description', { itemName: 'Item' }),
  };
}

export default function ItemEditLayout({
  children,
}: LayoutProps) {
  return children;
}
```

**Note:** For a more complete implementation, fetch the item name. For MVP, use generic "Item" placeholder.

---

### Task 8: Generate Non-English Translations
**Priority:** High
**Estimate:** 1 story point
**Dependencies:** Task 1

#### 8.1 Add French translations

**File:** `/messages/fr.json`

Add `metadata` namespace with French translations:

```json
{
  "metadata": {
    "app": {
      "name": "FAQBNB",
      "tagline": "Système d'affichage d'articles QR",
      "defaultDescription": "FAQBNB offre un accès instantané aux guides détaillés, manuels et ressources pour tout appareil ou article via des codes QR"
    },
    "home": {
      "title": "FAQBNB - Accès instantané aux informations produit via codes QR",
      "description": "Transformez le support client avec FAQBNB. Offrez un accès instantané aux manuels, vidéos et informations produit via des codes QR. Aucune application requise.",
      "ogTitle": "FAQBNB - Accès instantané aux informations produit",
      "ogDescription": "Plateforme professionnelle de codes QR pour les entreprises. Transformez l'accès aux informations produit et au support client."
    },
    "auth": {
      "login": {
        "title": "Connexion | FAQBNB",
        "description": "Connectez-vous à votre compte FAQBNB pour gérer vos articles et propriétés QR"
      },
      "register": {
        "title": "Créer un compte | FAQBNB",
        "description": "Créez un compte FAQBNB pour commencer à gérer vos articles QR"
      },
      "registerSuccess": {
        "title": "Inscription réussie | FAQBNB",
        "description": "Votre compte FAQBNB a été créé avec succès"
      },
      "registerComplete": {
        "title": "Finaliser l'inscription | FAQBNB",
        "description": "Finalisez la configuration de votre compte FAQBNB"
      }
    },
    "dashboard": {
      "home": {
        "title": "Tableau de bord | FAQBNB",
        "description": "Gérez vos articles et propriétés QR depuis votre tableau de bord FAQBNB"
      },
      "items": {
        "title": "Articles | FAQBNB",
        "description": "Affichez et gérez tous vos articles QR"
      },
      "create": {
        "title": "Créer un article | FAQBNB",
        "description": "Créez un nouvel article QR pour votre propriété"
      },
      "properties": {
        "title": "Propriétés | FAQBNB",
        "description": "Gérez vos propriétés et leurs articles QR"
      },
      "instructions": {
        "title": "Guides | FAQBNB",
        "description": "Affichez et gérez les guides d'instructions pour vos articles"
      },
      "help": {
        "title": "Aide et support | FAQBNB",
        "description": "Obtenez de l'aide pour utiliser FAQBNB et gérer vos articles QR"
      },
      "rooms": {
        "title": "Pièces | FAQBNB",
        "description": "Gérez les catégories de pièces pour organiser vos articles"
      },
      "tags": {
        "title": "Étiquettes | FAQBNB",
        "description": "Gérez les étiquettes pour catégoriser vos articles"
      },
      "print": {
        "title": "Imprimer les codes QR | FAQBNB",
        "description": "Imprimez les codes QR pour vos articles et propriétés"
      }
    },
    "item": {
      "view": {
        "title": "{itemName} | FAQBNB",
        "description": "Consultez les instructions et ressources pour {itemName}",
        "ogTitle": "{itemName}",
        "ogDescription": "Consultez les instructions et ressources pour {itemName}"
      },
      "edit": {
        "title": "Modifier {itemName} | FAQBNB",
        "description": "Modifiez les détails et instructions pour {itemName}"
      },
      "notFound": {
        "title": "Article introuvable | FAQBNB",
        "description": "L'article demandé n'a pas été trouvé"
      }
    },
    "error": {
      "title": "Erreur | FAQBNB",
      "description": "Une erreur s'est produite"
    }
  }
}
```

#### 8.2 Add Spanish translations

**File:** `/messages/es.json`

Add `metadata` namespace with Spanish translations.

#### 8.3 Add German translations

**File:** `/messages/de.json`

Add `metadata` namespace with German translations.

#### 8.4 Add Dutch translations

**File:** `/messages/nl.json`

Add `metadata` namespace with Dutch translations.

#### 8.5 Add Italian translations

**File:** `/messages/it.json`

Add `metadata` namespace with Italian translations.

**Verification for all languages:**
- [ ] All 5 non-English language files have complete `metadata` namespace
- [ ] All keys match English structure exactly
- [ ] All interpolation variables preserved (`{itemName}`)
- [ ] Titles remain under 60 characters for SEO
- [ ] Descriptions remain under 160 characters for SEO

---

### Task 9: Verification & Testing
**Priority:** High
**Estimate:** 1 story point
**Dependencies:** All previous tasks

#### 9.1 Browser tab title verification

For each page, verify browser tab shows correct translated title:

| Page | Expected Title (English) |
|------|--------------------------|
| Home | FAQBNB - Instant Access to Product Information via QR Codes |
| Login | Sign In \| FAQBNB |
| Register | Create Account \| FAQBNB |
| Dashboard | Dashboard \| FAQBNB |
| Items | Items \| FAQBNB |
| Create | Create Item \| FAQBNB |
| Properties | Properties \| FAQBNB |
| Instructions | Guides \| FAQBNB |
| Help | Help & Support \| FAQBNB |
| Rooms | Rooms \| FAQBNB |
| Tags | Tags \| FAQBNB |
| Print | Print QR Codes \| FAQBNB |
| Item View | {Item Name} \| FAQBNB |

#### 9.2 Locale switching verification

- [ ] Change language via LanguageSwitcher
- [ ] Refresh page
- [ ] Verify metadata updates to selected language
- [ ] Check `<html lang>` attribute matches selected locale

#### 9.3 Social media preview verification

- [ ] Use Facebook Sharing Debugger for home page
- [ ] Verify OG title/description in selected language
- [ ] Use Twitter Card Validator for home page
- [ ] Verify Twitter card metadata displays correctly

#### 9.4 Hydration check

- [ ] Open browser console
- [ ] Navigate through all pages
- [ ] Verify no hydration mismatch warnings

#### 9.5 Dynamic metadata verification

- [ ] Navigate to dynamic item page
- [ ] Verify item name appears in title
- [ ] Navigate to non-existent item
- [ ] Verify "Item Not Found" metadata displays

---

## Files Summary

### New Files (13)

| File | Purpose |
|------|---------|
| `/src/app/login/layout.tsx` | Metadata wrapper for login page |
| `/src/app/register/layout.tsx` | Metadata wrapper for register page |
| `/src/app/register/success/layout.tsx` | Metadata wrapper for register success |
| `/src/app/register/complete/layout.tsx` | Metadata wrapper for register complete |
| `/src/app/dashboard2/items/layout.tsx` | Metadata wrapper for items page |
| `/src/app/dashboard2/create/layout.tsx` | Metadata wrapper for create page |
| `/src/app/dashboard2/properties/layout.tsx` | Metadata wrapper for properties page |
| `/src/app/dashboard2/instructions/layout.tsx` | Metadata wrapper for instructions page |
| `/src/app/dashboard2/help/layout.tsx` | Metadata wrapper for help page |
| `/src/app/dashboard2/rooms/layout.tsx` | Metadata wrapper for rooms page |
| `/src/app/dashboard2/tags/layout.tsx` | Metadata wrapper for tags page |
| `/src/app/dashboard2/print/layout.tsx` | Metadata wrapper for print page |
| `/src/app/dashboard2/items/[publicId]/edit/layout.tsx` | Metadata wrapper for item edit |

### Modified Files (8)

| File | Modification |
|------|--------------|
| `/messages/en.json` | Add `metadata` namespace |
| `/messages/fr.json` | Add `metadata` namespace |
| `/messages/es.json` | Add `metadata` namespace |
| `/messages/de.json` | Add `metadata` namespace |
| `/messages/nl.json` | Add `metadata` namespace |
| `/messages/it.json` | Add `metadata` namespace |
| `/src/app/layout.tsx` | Convert static metadata to generateMetadata |
| `/src/app/page.tsx` | Convert static metadata to generateMetadata |
| `/src/app/dashboard2/layout.tsx` | Add generateMetadata |
| `/src/app/item/[publicId]/page.tsx` | Update generateMetadata to use translations |

---

## Acceptance Criteria Checklist

From REQ-E02-054:

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
- [ ] Metadata translations added to existing namespace files (in `metadata` namespace)
- [ ] Metadata follows consistent structure across all pages (title patterns)
- [ ] Dynamic metadata uses variable interpolation correctly (`{itemName}`)
- [ ] Metadata translations support variables where dynamic content is included
- [ ] Page titles follow consistent pattern ("Page Name | FAQBNB")
- [ ] Browser tab titles update correctly when user changes language
- [ ] Metadata properly handles special characters and non-Latin scripts
- [ ] Long metadata strings do not exceed SEO character limits
- [ ] All metadata keys use descriptive, namespace-appropriate naming
- [ ] Metadata translations generated for all five non-English languages
- [ ] Missing metadata gracefully defaults to English
- [ ] Server-side generated metadata uses proper locale detection
- [ ] No hardcoded English metadata strings remain
- [ ] TypeScript types remain consistent with Next.js Metadata API
- [ ] Metadata updates do not cause hydration mismatches

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Client components can't export metadata | Use layout wrapper pattern (implemented in Tasks 4-5) |
| German translations exceed SEO limits | Keep titles under 60 chars, descriptions under 160 chars |
| Hydration mismatches | All metadata generation is server-side via `generateMetadata` |
| Dynamic routes missing translations | Always provide fallback in `notFound` section |
| Social media caches old metadata | Document cache clearing; OG tags refresh over time |

---

## References

- [Overview Document](/docs/REQ-E02-054-update-page-metadata-with-translations-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Specification](/docs/gen_requests_epic2.md#req-e02-054)
- [next-intl Server Components](https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2B.6*
