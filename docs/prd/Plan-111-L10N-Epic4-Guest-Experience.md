# Implementation Plan: Localization Epic 4 - Guest Experience

**Generated:** 2026-01-17 14:30:00 UTC
**Last Modified:** 2026-01-17 14:30:00 UTC
**PRD Reference:** PRD_L10N_Epic4_Guest_Experience.md
**Epic Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Overview

This implementation plan covers the guest-facing localization experience when guests scan QR codes and view content. The system will automatically detect the guest's preferred language from browser settings, display translated content when available, provide a "View Original" toggle, and allow manual language selection. The experience must be seamless, fast, and require no account or login.

**Key Deliverables:**
- Automatic browser language detection for guests
- Display of translated content with fallback to original
- "View Original" toggle component
- Guest-facing language switcher
- Translation availability indicators
- Language preference persistence via cookie

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context (AuthContext pattern), useState |
| **UI Components** | Radix UI primitives, Heroicons, Lucide React |
| **Backend** | Supabase (PostgreSQL with RLS) |
| **Build Tool** | Next.js with Turbopack |
| **Deployment** | Railway |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Server component fetching item data |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Client component rendering item content |
| Public API Route | `/src/app/api/items/[publicId]/route.ts` | Public endpoint for guest item access |
| Middleware | `/src/middleware.ts` | Request interception (currently auth-focused) |
| Database Types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Types | `/src/types/index.ts` | Centralized type exports |

### Dependencies from Epic 1 (Foundation)

| Dependency | Expected Location | Status |
|------------|-------------------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Required from Epic 1 |
| i18n Configuration | `/src/lib/i18n/config.ts` | Required from Epic 1 |
| Supported Languages Config | `/src/lib/i18n/config.ts` | Required from Epic 1 |
| Cookie Name Constant | `FAQBNB_GUEST_LANG` | Defined in Epic 1 |

### Dependencies from Epic 3 (Dynamic Content Translation)

| Dependency | Expected Location | Status |
|------------|-------------------|--------|
| Translation Tables | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | Required from Epic 1, populated by Epic 3 |
| Translation Status Tracking | Translation tables have `translation_status` column | Required from Epic 1 |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | This epic uses existing Next.js features | N/A | N/A |

**Note:** This epic leverages infrastructure from Epic 1 (next-intl, language detection) and does not require additional npm packages.

---

## Architecture

### Component Structure

```
/src/components/
├── guest/                                   # Guest-specific components
│   ├── index.ts                             # Barrel exports
│   ├── GuestLanguageSwitcher/
│   │   ├── index.ts                         # Component exports
│   │   ├── GuestLanguageSwitcher.tsx        # Compact language selector for guests
│   │   └── GuestLanguageSwitcher.types.ts   # Component types
│   ├── TranslationBanner/
│   │   ├── index.ts                         # Component exports
│   │   ├── TranslationBanner.tsx            # "Translated from X" banner
│   │   └── TranslationBanner.types.ts       # Component types
│   ├── MissingTranslationBanner/
│   │   ├── index.ts                         # Component exports
│   │   ├── MissingTranslationBanner.tsx     # "Translation not available" banner
│   │   └── MissingTranslationBanner.types.ts# Component types
│   ├── ViewOriginalToggle/
│   │   ├── index.ts                         # Component exports
│   │   ├── ViewOriginalToggle.tsx           # Toggle between translation/original
│   │   └── ViewOriginalToggle.types.ts      # Component types
│   └── LanguageIndicator/
│       ├── index.ts                         # Component exports
│       ├── LanguageIndicator.tsx            # Shows current display language
│       └── LanguageIndicator.types.ts       # Component types
├── ItemDisplay.tsx                          # Modified: Add translation support
└── LinkCard.tsx                             # May need translation support

/src/lib/
├── i18n/                                    # From Epic 1
│   ├── index.ts                             # Exports
│   ├── config.ts                            # Locale configuration
│   ├── language-detection.ts                # Language detection utility
│   └── guest-language.ts                    # NEW: Guest-specific language utilities
└── translations/
    ├── index.ts                             # Translation utilities exports
    ├── fetch-translations.ts                # Fetch translated content from DB
    └── translation-utils.ts                 # Helper functions

/src/hooks/
└── useGuestLanguage.ts                      # Guest language preference hook

/src/app/
├── item/[publicId]/
│   └── page.tsx                             # Modified: Pass language context
└── api/
    └── public/
        └── items/
            └── [publicId]/
                ├── route.ts                 # NEW: Public item API with translation
                └── languages/
                    └── route.ts             # NEW: Get available translations

/src/types/
├── index.ts                                 # Modified: Add translation types
└── l10n.ts                                  # NEW: Localization-specific types
```

### Database Schema (From Epic 1)

This epic reads from translation tables created in Epic 1 and populated by Epic 3:

**item_translations** (read-only in this epic)
```sql
SELECT
  i.id,
  i.public_id,
  i.source_language,
  COALESCE(it.name, i.name) as name,
  COALESCE(it.description, i.description) as description,
  CASE WHEN it.id IS NOT NULL THEN true ELSE false END as is_translated,
  it.translation_status
FROM items i
LEFT JOIN item_translations it
  ON it.item_id = i.id
  AND it.language = :guestLanguage
  AND it.translation_status = 'completed'
WHERE i.public_id = :publicId;
```

### State Management

```typescript
// Guest language state flows through:
// 1. URL parameter ?lang=fr (highest priority for sharing)
// 2. Cookie FAQBNB_GUEST_LANG (persistence)
// 3. Browser Accept-Language header (auto-detection)
// 4. Default: Original content language (fallback)

interface GuestLanguageState {
  displayLanguage: SupportedLanguage;      // Currently showing
  sourceLanguage: SupportedLanguage;       // Original content language
  isTranslated: boolean;                   // Is content translated?
  showOriginal: boolean;                   // User toggled to original?
  availableTranslations: SupportedLanguage[];  // Which translations exist
}
```

### Data Flow

```
Guest scans QR Code → /item/[publicId]?lang=fr (optional)
                            │
                            ▼
              Server Component (page.tsx)
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    Detect Language    Fetch Item Data    Fetch Translations
    (cookie/header)    (original)         (for detected lang)
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
              Merge: Original + Translation
                            │
                            ▼
              Client Component (ItemDisplay)
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
  TranslationBanner   Content Display   GuestLanguageSwitcher
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
              User toggles "View Original" / changes language
                            │
                            ▼
              Client-side state update (no page reload)
```

---

## Integration Contract

### Types Interface

```typescript
// /src/types/l10n.ts

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;           // English name
  nativeName: string;     // Native name (e.g., "Deutsch")
  flag?: string;          // Flag emoji (optional)
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export interface TranslatedContent {
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  isTranslated: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
}

export interface TranslatedItem extends TranslatedContent {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  originalName?: string;           // Original if showing translation
  originalDescription?: string;    // Original if showing translation
}

export interface TranslatedArticle extends TranslatedContent {
  id: string;
  title: string;
  description: string | null;
  originalTitle?: string;
  originalDescription?: string;
  links: TranslatedLink[];
}

export interface TranslatedLink extends TranslatedContent {
  id: string;
  title: string;
  url: string;                     // URLs are never translated
  thumbnailUrl: string | null;
  originalTitle?: string;
}

export interface TranslatedTag {
  key: string;
  displayValue: string;
  isTranslated: boolean;
}

export interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: {
    requestedLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    sourceLanguage: SupportedLanguage;
    availableTranslations: SupportedLanguage[];
    isShowingTranslation: boolean;
  };
}

export interface LanguageAvailabilityResponse {
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];
  pendingTranslations: SupportedLanguage[];
  unavailableTranslations: SupportedLanguage[];
}
```

### Component Props Interfaces

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts

export interface GuestLanguageSwitcherProps {
  /** Current display language */
  currentLanguage: SupportedLanguage;
  /** Languages that have translations available */
  availableTranslations: SupportedLanguage[];
  /** Source/original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Callback when language is changed */
  onLanguageChange: (language: SupportedLanguage) => void;
  /** Compact mode for mobile */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// /src/components/guest/TranslationBanner/TranslationBanner.types.ts

export interface TranslationBannerProps {
  /** Original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Currently displayed language */
  displayLanguage: SupportedLanguage;
  /** Callback to view original content */
  onViewOriginal: () => void;
  /** Whether currently showing original */
  isShowingOriginal?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// /src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts

export interface ViewOriginalToggleProps {
  /** Whether currently showing original content */
  isShowingOriginal: boolean;
  /** Original language code */
  sourceLanguage: SupportedLanguage;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Additional CSS classes */
  className?: string;
}

// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts

export interface MissingTranslationBannerProps {
  /** Language that was requested */
  requestedLanguage: SupportedLanguage;
  /** Language that is being shown instead */
  displayLanguage: SupportedLanguage;
  /** Additional CSS classes */
  className?: string;
}

// /src/components/guest/LanguageIndicator/LanguageIndicator.types.ts

export interface LanguageIndicatorProps {
  /** Current display language */
  currentLanguage: SupportedLanguage;
  /** Whether content is translated */
  isTranslated: boolean;
  /** Source language if translated */
  sourceLanguage?: SupportedLanguage;
  /** Additional CSS classes */
  className?: string;
}
```

### Hook Interface

```typescript
// /src/hooks/useGuestLanguage.ts

export interface UseGuestLanguageOptions {
  /** Initial language from server */
  initialLanguage?: SupportedLanguage;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Available translations for this content */
  availableTranslations: SupportedLanguage[];
}

export interface UseGuestLanguageReturn {
  /** Currently selected language */
  currentLanguage: SupportedLanguage;
  /** Whether showing original content */
  showOriginal: boolean;
  /** Effective display language (considering showOriginal) */
  displayLanguage: SupportedLanguage;
  /** Change the selected language */
  setLanguage: (language: SupportedLanguage) => void;
  /** Toggle between translation and original */
  toggleOriginal: () => void;
  /** Check if a language has a translation */
  hasTranslation: (language: SupportedLanguage) => boolean;
}
```

### Usage Examples

```tsx
// In page.tsx (server component)
import { detectGuestLanguage } from '@/lib/i18n/guest-language';
import { fetchTranslatedItem } from '@/lib/translations/fetch-translations';

export default async function ItemPage({ params, searchParams }) {
  const { publicId } = await params;
  const { lang } = await searchParams;

  // Detect language from URL param, cookie, or headers
  const detectedLanguage = await detectGuestLanguage(lang);

  // Fetch item with translation
  const itemData = await fetchTranslatedItem(publicId, detectedLanguage);

  return (
    <ItemDisplay
      item={itemData.item}
      articles={itemData.articles}
      tags={itemData.tags}
      translationMeta={itemData.translationMeta}
    />
  );
}

// In ItemDisplay.tsx (client component)
'use client';

import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';

export default function ItemDisplay({
  item,
  articles,
  tags,
  translationMeta
}: ItemDisplayProps) {
  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
  } = useGuestLanguage({
    initialLanguage: translationMeta.displayLanguage,
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Language Switcher */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center p-4">
          <Logo />
          <GuestLanguageSwitcher
            currentLanguage={currentLanguage}
            availableTranslations={translationMeta.availableTranslations}
            sourceLanguage={translationMeta.sourceLanguage}
            onLanguageChange={setLanguage}
          />
        </div>
      </header>

      {/* Translation Banner */}
      {translationMeta.isShowingTranslation && !showOriginal && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          displayLanguage={displayLanguage}
          onViewOriginal={toggleOriginal}
        />
      )}

      {/* Content */}
      <main>
        <h1>{showOriginal ? item.originalName : item.name}</h1>
        <p>{showOriginal ? item.originalDescription : item.description}</p>
        {/* ... */}
      </main>
    </div>
  );
}
```

---

## Implementation Approach

### Phase 1: Types and Utilities (1 day)

- [ ] **Task 1.1:** Create localization types file
  - File: `/src/types/l10n.ts`
  - Define `SupportedLanguage`, `LanguageInfo`, `TranslatedContent`, etc.
  - Export `SUPPORTED_LANGUAGES` constant
  - Export language utility functions

- [ ] **Task 1.2:** Create guest language utility module
  - File: `/src/lib/i18n/guest-language.ts`
  - `detectGuestLanguage(request, urlParam?)` - Detect language from cookie/header/URL
  - `setGuestLanguageCookie(language)` - Persist language preference
  - `parseAcceptLanguage(header)` - Parse Accept-Language header
  - `mapToSupportedLanguage(code)` - Map browser codes to supported languages

- [ ] **Task 1.3:** Update types/index.ts with L10N exports
  - File: `/src/types/index.ts`
  - Export all types from `l10n.ts`

### Phase 2: Translation Data Layer (2 days)

- [ ] **Task 2.1:** Create translation fetch utilities
  - File: `/src/lib/translations/fetch-translations.ts`
  - `fetchTranslatedItem(publicId, language)` - Fetch item with translation
  - `fetchItemTranslations(itemId, language)` - Fetch item translations only
  - `fetchArticleTranslations(articleIds, language)` - Fetch article translations
  - `fetchLinkTranslations(linkIds, language)` - Fetch link translations
  - `fetchTagTranslations(tagKeys, language)` - Fetch tag translations

- [ ] **Task 2.2:** Create public item API endpoint with translation support
  - File: `/src/app/api/public/items/[publicId]/route.ts`
  - GET endpoint accepting `?lang=` query parameter
  - Merge original content with translations
  - Return `GuestContentResponse` format
  - Include translation metadata

- [ ] **Task 2.3:** Create language availability API endpoint
  - File: `/src/app/api/public/items/[publicId]/languages/route.ts`
  - GET endpoint returning available translations
  - Return `LanguageAvailabilityResponse` format

- [ ] **Task 2.4:** Create translation utility helpers
  - File: `/src/lib/translations/translation-utils.ts`
  - `mergeTranslation(original, translation)` - Merge content with translation
  - `getDisplayLanguage(requested, available, source)` - Determine best language
  - `formatLanguageName(code, native?)` - Format language for display

### Phase 3: Guest UI Components (2-3 days)

- [ ] **Task 3.1:** Create GuestLanguageSwitcher component
  - File: `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`
  - Dropdown with all 6 languages
  - Show flags and native names
  - Indicate which languages have translations (checkmark)
  - Gray out unavailable translations (but still selectable)
  - Use Radix UI dropdown for accessibility

- [ ] **Task 3.2:** Create TranslationBanner component
  - File: `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
  - Light blue banner (#E3F2FD)
  - "Translated from [Language] - View original" text
  - Globe icon
  - Dismissible: No (always show context)

- [ ] **Task 3.3:** Create MissingTranslationBanner component
  - File: `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
  - Info banner when translation not available
  - "French translation not available. Showing content in English."
  - Muted styling to not alarm users

- [ ] **Task 3.4:** Create ViewOriginalToggle component
  - File: `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
  - Secondary button style
  - "View in original (English)" / "View translation"
  - Swap icon

- [ ] **Task 3.5:** Create LanguageIndicator component
  - File: `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
  - Shows current display language with flag
  - Optional: "translated from X" subtitle
  - Compact for header use

- [ ] **Task 3.6:** Create barrel exports for guest components
  - File: `/src/components/guest/index.ts`
  - Export all guest components

### Phase 4: Guest Language Hook (1 day)

- [ ] **Task 4.1:** Create useGuestLanguage hook
  - File: `/src/hooks/useGuestLanguage.ts`
  - Manage language state (currentLanguage, showOriginal)
  - Persist language preference to cookie
  - Handle language change (update cookie, potentially refetch)
  - Toggle between translation and original (client-side only)
  - Sync with URL parameter for shareable links

- [ ] **Task 4.2:** Create cookie utility for language persistence
  - Utility in `/src/lib/i18n/guest-language.ts`
  - Set `FAQBNB_GUEST_LANG` cookie
  - 1-year expiry
  - Secure, SameSite=Lax

### Phase 5: Update Guest Pages (2 days)

- [ ] **Task 5.1:** Update guest item page (server component)
  - File: `/src/app/item/[publicId]/page.tsx`
  - Detect language from URL param, cookie, headers
  - Fetch item data with translations
  - Pass translation metadata to client component
  - Update metadata generation for SEO (use translated title/description)

- [ ] **Task 5.2:** Update ItemDisplay component (client component)
  - File: `/src/components/ItemDisplay.tsx`
  - Accept translation props (translationMeta, original content)
  - Integrate useGuestLanguage hook
  - Add GuestLanguageSwitcher to header
  - Add TranslationBanner when showing translation
  - Add MissingTranslationBanner when no translation
  - Handle "View Original" toggle (client-side state swap)

- [ ] **Task 5.3:** Update LinkCard component
  - File: `/src/components/LinkCard.tsx`
  - Accept translated title prop
  - Display original title if toggle is on

- [ ] **Task 5.4:** Handle URL parameter for shareable links
  - Update page to read `?lang=` parameter
  - Include language in shareable link
  - Canonical URL should NOT include language parameter

### Phase 6: Middleware & Language Detection (1 day)

- [ ] **Task 6.1:** Add guest language detection to middleware
  - File: `/src/middleware.ts`
  - Add `/item/*` routes to middleware matcher
  - Detect language and set header/cookie for downstream use
  - Do NOT redirect (language in query param, not path)

- [ ] **Task 6.2:** Create server-side language detection utility
  - File: `/src/lib/i18n/guest-language.ts` (server-side version)
  - Read from NextRequest cookies and headers
  - Priority: URL param > Cookie > Accept-Language > default

### Phase 7: Testing & Polish (1-2 days)

- [ ] **Task 7.1:** Test language detection scenarios
  - Test: Browser language detection works
  - Test: Cookie preference overrides browser
  - Test: URL parameter overrides cookie
  - Test: Fallback to original works

- [ ] **Task 7.2:** Test content display scenarios
  - Test: Translated content shows correctly
  - Test: Original content shows when no translation
  - Test: "View Original" toggle works instantly
  - Test: Language switcher updates content

- [ ] **Task 7.3:** Test edge cases
  - Test: Missing translation for some fields
  - Test: Cookie blocked scenario
  - Test: Malformed Accept-Language header
  - Test: Unsupported language code

- [ ] **Task 7.4:** Mobile responsiveness testing
  - Test: Language switcher on small screens
  - Test: Banner doesn't obscure content
  - Test: Touch-friendly buttons

- [ ] **Task 7.5:** Performance validation
  - Verify: Language detection < 10ms
  - Verify: Content with translation < 200ms
  - Verify: Language switch < 100ms (client-side)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language in URL | Query param `?lang=fr` | QR codes already printed; path changes would break them |
| Canonical URLs | No language param | SEO best practice; language is user preference |
| View Original | Client-side toggle | Instant UX; content already fetched |
| Language Persistence | Cookie (1 year) | No account required; works across sessions |
| Missing Translation | Show original with banner | Better than broken page; clear communication |
| Translation Priority | URL > Cookie > Header > Original | Enables shareable links while respecting preference |
| Component Location | `/src/components/guest/` | Clear separation from admin components |

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/types/l10n.ts` | Localization TypeScript types |
| `/src/lib/i18n/guest-language.ts` | Guest language detection and utilities |
| `/src/lib/translations/index.ts` | Translation module exports |
| `/src/lib/translations/fetch-translations.ts` | Fetch translated content from DB |
| `/src/lib/translations/translation-utils.ts` | Translation helper functions |
| `/src/hooks/useGuestLanguage.ts` | Guest language preference hook |
| `/src/components/guest/index.ts` | Guest components barrel exports |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Component export |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language selector component |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | Component types |
| `/src/components/guest/TranslationBanner/index.ts` | Component export |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Translation indicator banner |
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | Component types |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Component export |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Missing translation banner |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | Component types |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Component export |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Toggle component |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | Component types |
| `/src/components/guest/LanguageIndicator/index.ts` | Component export |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Language indicator |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | Component types |
| `/src/app/api/public/items/[publicId]/route.ts` | Public item API with translations |
| `/src/app/api/public/items/[publicId]/languages/route.ts` | Language availability API |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/types/index.ts` | Export L10N types |
| `/src/app/item/[publicId]/page.tsx` | Add language detection, fetch translations |
| `/src/components/ItemDisplay.tsx` | Integrate translation UI components |
| `/src/components/LinkCard.tsx` | Support translated titles |
| `/src/middleware.ts` | Add guest language detection for `/item/*` routes |
| `/src/lib/supabase.ts` | Add translation table types (if not done in Epic 1) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | Medium | High | Verify Epic 1 completion before starting; create stubs if needed |
| Epic 3 not complete (no translations) | Medium | Medium | Show original content gracefully; feature still works |
| Translation quality issues | Medium | Low | "View Original" always available for verification |
| Browser detection fails | Low | Low | Fallback to original; manual selection available |
| Cookie blocked by browser | Low | Low | Re-detect language on each visit; functional but less persistent |
| Performance impact | Low | Medium | Translation lookup uses indexed columns; client-side toggle |
| Layout breaks with long translations | Medium | Medium | Test with German (typically longest); truncate with ellipsis |

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: Types and Utilities | 1 day | High |
| Phase 2: Translation Data Layer | 2 days | Medium |
| Phase 3: Guest UI Components | 2-3 days | High |
| Phase 4: Guest Language Hook | 1 day | High |
| Phase 5: Update Guest Pages | 2 days | Medium |
| Phase 6: Middleware & Language Detection | 1 day | High |
| Phase 7: Testing & Polish | 1-2 days | Medium |
| **Total** | **10-12 days** | Medium-High |

**Notes:**
- Estimates assume Epic 1 and Epic 3 are complete
- Parallel work possible between Phases 2-3 and Phase 4
- Buffer included for integration issues with Epic 1/3 dependencies

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation Task |
|--------------|---------------------|
| AC-1: Browser language detected correctly | Tasks 1.2, 6.1, 6.2 |
| AC-1: Cookie preference overrides browser | Tasks 4.1, 4.2 |
| AC-1: URL parameter overrides cookie | Tasks 5.1, 5.4 |
| AC-1: Fallback to original works | Task 2.1, 2.4 |
| AC-2: Translated content shows in detected language | Tasks 2.1, 2.2, 5.1, 5.2 |
| AC-2: Original content shows when no translation | Tasks 2.4, 3.3, 5.2 |
| AC-2: All content types translated | Tasks 2.1, 5.2, 5.3 |
| AC-3: Toggle visible on translated content | Tasks 3.2, 3.4, 5.2 |
| AC-3: Toggle switches content instantly | Tasks 4.1, 5.2 |
| AC-3: Original language is labeled | Tasks 3.2, 3.4 |
| AC-3: Can toggle back to translation | Tasks 3.4, 4.1 |
| AC-4: Shows all 6 languages | Task 3.1 |
| AC-4: Indicates available translations | Task 3.1 |
| AC-4: Selection updates content | Tasks 3.1, 4.1, 5.2 |
| AC-4: Selection persists in cookie | Task 4.2 |
| AC-5: Banner shows when translation unavailable | Task 3.3 |
| AC-5: Clear messaging about content language | Tasks 3.2, 3.3 |
| AC-5: Graceful degradation | Tasks 2.4, 3.3 |
| AC-6: No additional latency | Tasks 2.1, 2.2 |
| AC-6: Language switch is instant | Task 4.1 |
| AC-6: Works well on mobile | Tasks 3.1, 7.4 |

---

## Open Questions

1. **Epic 1 Status:** Is Epic 1 (Foundation) complete? Need to verify i18n infrastructure exists.
   - *Impact:* High - Blocks Phase 1, 6

2. **Epic 3 Status:** Is Epic 3 (Dynamic Content Translation) complete? Are translations being populated?
   - *Impact:* Medium - Feature works without translations but won't show translated content

3. **Cookie Domain:** Should cookie be set on `.faqbnb.com` or `faqbnb.com`?
   - *Recommendation:* Use `.faqbnb.com` for subdomain support

4. **Article Page Route:** Does `/items/[publicId]/articles/[articleId]` exist or is it planned?
   - *Impact:* Low - Can add translation support when route is created

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- Epic 1 PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- Epic 1 Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Epic 3 PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- Existing Item Page: `/src/app/item/[publicId]/page.tsx`
- Existing ItemDisplay: `/src/components/ItemDisplay.tsx`
- Existing Item API: `/src/app/api/items/[publicId]/route.ts`

---

## Design Specifications (From PRD)

### Translation Banner
- Background: Light blue (#E3F2FD)
- Icon: Globe icon (from Lucide)
- Text: 14px, gray (#666)
- Link: Blue, underlined
- Height: 40px
- Dismissible: No

### Language Selector
- Dropdown style (Radix UI)
- Flag emoji + native language name
- Current language has checkmark
- Unavailable languages grayed but selectable

### View Original Toggle
- Secondary button style (outline)
- Icon: ArrowRightLeft (from Lucide)
- Clear label indicating action

---

*Plan generated for FAQBNB Localization Epic 4 - Guest Experience*
