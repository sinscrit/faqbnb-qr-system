# REQ-E04-017: Update ItemDisplay Component with Translation Controls - Implementation Overview

**Request ID:** REQ-E04-017
**Title:** Update ItemDisplay Component with Translation Controls
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.2

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Enhance the `ItemDisplay` client component (`/src/components/ItemDisplay.tsx`) to accept translation data props, integrate with the `useGuestLanguage` hook for language state management, and render guest-facing translation UI controls including the language switcher, translation banners, and view original toggle functionality. This enables guests to switch between languages and toggle between translated and original content seamlessly without page reloads.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 5: Update Guest Pages, Task 5.2

### Dependencies from Previous Tasks (Epic 4)

| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-002) |
| Types Index Export | `/src/types/index.ts` | Required (REQ-E04-003) |
| GuestLanguageSwitcher Component | `/src/components/guest/GuestLanguageSwitcher/` | Required (REQ-E04-008) |
| TranslationBanner Component | `/src/components/guest/TranslationBanner/` | Required (REQ-E04-009) |
| MissingTranslationBanner Component | `/src/components/guest/MissingTranslationBanner/` | Required (REQ-E04-010) |
| ViewOriginalToggle Component | `/src/components/guest/ViewOriginalToggle/` | Required (REQ-E04-011) |
| Barrel Exports for Guest Components | `/src/components/guest/index.ts` | Required (REQ-E04-013) |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | Required (REQ-E04-014) |
| Guest Item Page (Server Component) | `/src/app/item/[publicId]/page.tsx` | Required (REQ-E04-016) |

### Dependencies from Epic 1 (Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Available |
| i18n Configuration | `/src/lib/i18n/config.ts` | Available |
| Supported Languages Config | `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` | Available |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | Available |

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Current ItemDisplay Implementation | `/src/components/ItemDisplay.tsx` | Primary file to modify |
| Client Component Pattern | `'use client'` directive | Required for hooks and interactivity |
| LinkCard Component | `/src/components/LinkCard.tsx` | Child component displaying links |
| ReactionButtons Component | `/src/components/ReactionButtons.tsx` | Similar client component pattern |
| VisitCounter Component | `/src/components/VisitCounter.tsx` | Similar header integration pattern |

---

## Technical Specification

### Current Component Structure

The existing `ItemDisplay` component is a client component that:
- Displays item name, description, and public ID
- Renders visit tracking via useEffect
- Shows reaction buttons for guest feedback
- Displays articles/links grouped or flat
- Handles image lightbox functionality

### Updated Props Interface

```typescript
// Updated ItemDisplayProps to include translation data
import { SupportedLanguage } from '@/types';

interface TranslationMeta {
  /** Language that was requested (from URL/cookie/header) */
  requestedLanguage: SupportedLanguage;
  /** Language actually being displayed */
  displayLanguage: SupportedLanguage;
  /** Original content language */
  sourceLanguage: SupportedLanguage;
  /** Languages with available translations */
  availableTranslations: SupportedLanguage[];
  /** Whether translated content is being shown */
  isShowingTranslation: boolean;
  /** Translation completeness status */
  translationStatus?: 'complete' | 'partial' | 'missing';
}

interface TranslatedItemData {
  // Standard item fields
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  links: Array<{
    id: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }>;
  articles?: Array<{
    id: string;
    title: string;
    description?: string;
    links: Array<{...}>;
  }>;

  // Original content (for toggle functionality)
  originalName?: string;
  originalDescription?: string | null;
}

export interface ItemDisplayProps {
  item: TranslatedItemData;
  /** Translation metadata for language controls - optional for backward compatibility */
  translationMeta?: TranslationMeta;
}
```

### Component Architecture

```
ItemDisplay.tsx (client component)
├── Header Section
│   ├── Logo
│   ├── Item Name (translated/original based on toggle)
│   ├── Public ID
│   ├── VisitCounter
│   └── GuestLanguageSwitcher (NEW)
│
├── Translation Banner Section (NEW)
│   ├── TranslationBanner (when showing translation)
│   └── MissingTranslationBanner (when translation unavailable)
│
├── Description Section
│   └── Description (translated/original based on toggle)
│
├── Reaction Section
│   └── ReactionButtons
│
├── Content Section
│   ├── Articles (with translated titles)
│   └── Links via LinkCard (with translated titles)
│
└── Footer Section
```

### State Management Flow

```
Server Component (page.tsx)
    │
    ├── Detects language
    ├── Fetches translated content
    ├── Builds translationMeta
    │
    ▼
ItemDisplay (client component)
    │
    ├── Receives: item, translationMeta
    │
    ▼
useGuestLanguage hook
    │
    ├── currentLanguage (from translationMeta.displayLanguage)
    ├── showOriginal (boolean toggle state)
    ├── setLanguage() → updates cookie, triggers refetch
    ├── toggleOriginal() → swaps content client-side
    │
    ▼
Content Display
    │
    ├── showOriginal=false → item.name, item.description
    └── showOriginal=true  → item.originalName, item.originalDescription
```

---

## Implementation Tasks

### Task 1: Update Import Statements
**File:** `/src/components/ItemDisplay.tsx`

Add imports for new components and hook:
```typescript
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
} from '@/components/guest';
import { SupportedLanguage } from '@/types';
```

### Task 2: Update ItemDisplayProps Interface
**File:** `/src/components/ItemDisplay.tsx`

Update the props interface to accept translation metadata:
```typescript
interface TranslationMeta {
  requestedLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];
  isShowingTranslation: boolean;
  translationStatus?: 'complete' | 'partial' | 'missing';
}

// Keep backward compatible - translationMeta is optional
export interface ItemDisplayProps {
  item: ItemResponse['data'] & {
    originalName?: string;
    originalDescription?: string | null;
  };
  translationMeta?: TranslationMeta;
}
```

### Task 3: Integrate useGuestLanguage Hook
**File:** `/src/components/ItemDisplay.tsx`

Initialize the hook with translation metadata:
```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Existing state declarations...

  // Guest language management (only if translationMeta is provided)
  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
  } = useGuestLanguage({
    initialLanguage: translationMeta?.displayLanguage,
    sourceLanguage: translationMeta?.sourceLanguage || 'en',
    availableTranslations: translationMeta?.availableTranslations || [],
  });

  // Rest of component...
}
```

### Task 4: Add GuestLanguageSwitcher to Header
**File:** `/src/components/ItemDisplay.tsx`

Integrate the language switcher in the header area:
```typescript
{/* Header */}
<div className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-4xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Logo and title... */}
      </div>

      {/* Right side: VisitCounter and Language Switcher */}
      <div className="ml-4 flex-shrink-0 flex items-center gap-3">
        {translationMeta && (
          <GuestLanguageSwitcher
            currentLanguage={currentLanguage}
            availableTranslations={translationMeta.availableTranslations}
            sourceLanguage={translationMeta.sourceLanguage}
            onLanguageChange={setLanguage}
          />
        )}
        <VisitCounter publicId={item.publicId} />
      </div>
    </div>
  </div>
</div>
```

### Task 5: Add Translation Banners
**File:** `/src/components/ItemDisplay.tsx`

Add banner components below the header:
```typescript
{/* Translation Banners */}
{translationMeta && (
  <>
    {/* Show TranslationBanner when viewing translated content */}
    {translationMeta.isShowingTranslation && !showOriginal && (
      <TranslationBanner
        sourceLanguage={translationMeta.sourceLanguage}
        displayLanguage={displayLanguage}
        onViewOriginal={toggleOriginal}
      />
    )}

    {/* Show MissingTranslationBanner when requested translation unavailable */}
    {translationMeta.translationStatus === 'missing' &&
     translationMeta.requestedLanguage !== translationMeta.sourceLanguage && (
      <MissingTranslationBanner
        requestedLanguage={translationMeta.requestedLanguage}
        displayLanguage={translationMeta.sourceLanguage}
      />
    )}
  </>
)}
```

### Task 6: Update Item Name Display for Toggle
**File:** `/src/components/ItemDisplay.tsx`

Modify the title to respect the showOriginal toggle:
```typescript
<h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
  {showOriginal && item.originalName ? item.originalName : item.name}
</h1>
```

### Task 7: Update Description Display for Toggle
**File:** `/src/components/ItemDisplay.tsx`

Modify the description section to respect the toggle:
```typescript
{/* Description Section */}
{(showOriginal ? (item.originalDescription || item.description) : item.description) && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
      {showOriginal && item.originalDescription
        ? item.originalDescription
        : item.description}
    </p>
  </div>
)}
```

### Task 8: Update Article Titles for Toggle
**File:** `/src/components/ItemDisplay.tsx`

Update article rendering to handle original content toggle:
```typescript
{(item as any).articles && (item as any).articles.length > 0 ? (
  <div className="space-y-8">
    {(item as any).articles.map((article: any) => (
      <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          {showOriginal && article.originalTitle
            ? article.originalTitle
            : article.title}
        </h3>
        {(showOriginal ? (article.originalDescription || article.description) : article.description) && (
          <p className="text-sm text-gray-600 mb-4">
            {showOriginal && article.originalDescription
              ? article.originalDescription
              : article.description}
          </p>
        )}
        {/* Links... */}
      </div>
    ))}
  </div>
) : /* ... */ }
```

### Task 9: Update Link Titles for Toggle
**File:** `/src/components/ItemDisplay.tsx`

Update LinkCard rendering to pass original or translated title:
```typescript
<LinkCard
  key={link.id}
  title={showOriginal && link.originalTitle ? link.originalTitle : link.title}
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>
```

### Task 10: Handle Missing translationMeta (Backward Compatibility)
**File:** `/src/components/ItemDisplay.tsx`

Ensure the component works when translationMeta is not provided:
```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Only use hook if translationMeta is provided
  const guestLanguage = translationMeta
    ? useGuestLanguage({
        initialLanguage: translationMeta.displayLanguage,
        sourceLanguage: translationMeta.sourceLanguage,
        availableTranslations: translationMeta.availableTranslations,
      })
    : null;

  // Derive values with fallbacks
  const showOriginal = guestLanguage?.showOriginal ?? false;
  const currentLanguage = guestLanguage?.currentLanguage ?? 'en';
  const toggleOriginal = guestLanguage?.toggleOriginal ?? (() => {});
  const setLanguage = guestLanguage?.setLanguage ?? (() => {});

  // Rest of component...
}
```

### Task 11: Add Accessibility Attributes
**File:** `/src/components/ItemDisplay.tsx`

Ensure translation controls are accessible:
```typescript
{/* Language section with ARIA */}
<div
  role="region"
  aria-label="Language settings"
  className="translation-controls"
>
  {translationMeta && (
    <GuestLanguageSwitcher
      currentLanguage={currentLanguage}
      availableTranslations={translationMeta.availableTranslations}
      sourceLanguage={translationMeta.sourceLanguage}
      onLanguageChange={setLanguage}
      aria-label="Select display language"
    />
  )}
</div>
```

### Task 12: Update Types Export (if needed)
**File:** `/src/types/index.ts`

If TranslationMeta type is not already exported, add it:
```typescript
// Add to types/index.ts if not using from l10n.ts
export interface TranslationMeta {
  requestedLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];
  isShowingTranslation: boolean;
  translationStatus?: 'complete' | 'partial' | 'missing';
}
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/ItemDisplay.tsx` | Add translation props, integrate hook, add UI components |
| `/src/types/index.ts` | Export TranslationMeta type (if not already exported) |

### Functions to Modify

| File | Function/Section | Modification |
|------|------------------|--------------|
| `/src/components/ItemDisplay.tsx` | `ItemDisplay` component | Accept translationMeta prop, integrate useGuestLanguage hook |
| `/src/components/ItemDisplay.tsx` | Header JSX | Add GuestLanguageSwitcher component |
| `/src/components/ItemDisplay.tsx` | Content rendering | Add toggle logic for name, description, articles, links |
| `/src/components/ItemDisplay.tsx` | `ItemDisplayProps` interface | Add translationMeta optional prop |

### New Imports to Add

| Import | From | Purpose |
|--------|------|---------|
| `useGuestLanguage` | `@/hooks/useGuestLanguage` | Guest language state management |
| `GuestLanguageSwitcher` | `@/components/guest` | Language selection dropdown |
| `TranslationBanner` | `@/components/guest` | Show when viewing translation |
| `MissingTranslationBanner` | `@/components/guest` | Show when translation missing |
| `SupportedLanguage` | `@/types` or `@/types/l10n` | Type for language codes |

### JSX Sections to Add

| Location | Component | Purpose |
|----------|-----------|---------|
| Header (next to VisitCounter) | `GuestLanguageSwitcher` | Allow language selection |
| Below Header | `TranslationBanner` | Indicate translated content with View Original |
| Below Header | `MissingTranslationBanner` | Indicate missing translation fallback |

---

## Code Structure Reference

Based on existing component structure in `/src/components/ItemDisplay.tsx`:

```typescript
// /src/components/ItemDisplay.tsx
// REQ-E04-017: ItemDisplay with Translation Controls
// Last Modified: 2026-01-20

'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ItemDisplayProps } from '@/types';
import { ReactionCounts } from '@/types/reactions';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import VisitCounter from './VisitCounter';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

// NEW: Translation-related imports
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
} from '@/components/guest';
import type { SupportedLanguage } from '@/types';

// ============ Types ============
interface TranslationMeta {
  requestedLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];
  isShowingTranslation: boolean;
  translationStatus?: 'complete' | 'partial' | 'missing';
}

// Extended props interface with translation support
export interface ItemDisplayProps {
  item: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    links: Array<{
      id: string;
      title: string;
      linkType: string;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
      originalTitle?: string;
    }>;
    articles?: Array<{
      id: string;
      title: string;
      description?: string;
      links: Array<any>;
      originalTitle?: string;
      originalDescription?: string;
    }>;
    // Original content for toggle functionality
    originalName?: string;
    originalDescription?: string | null;
  } | null | undefined;
  /** Translation metadata - optional for backward compatibility */
  translationMeta?: TranslationMeta;
}

// ============ Component ============
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Existing state
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // NEW: Guest language state management
  // Only initialize hook if translationMeta is provided
  const hasTranslationSupport = !!translationMeta;

  // Conditionally use guest language hook
  const guestLanguageState = hasTranslationSupport
    ? useGuestLanguage({
        initialLanguage: translationMeta!.displayLanguage,
        sourceLanguage: translationMeta!.sourceLanguage,
        availableTranslations: translationMeta!.availableTranslations,
      })
    : null;

  // Derive display values with fallbacks for backward compatibility
  const showOriginal = guestLanguageState?.showOriginal ?? false;
  const currentLanguage = guestLanguageState?.currentLanguage ?? 'en';
  const displayLanguage = guestLanguageState?.displayLanguage ?? 'en';
  const setLanguage = guestLanguageState?.setLanguage ?? (() => {});
  const toggleOriginal = guestLanguageState?.toggleOriginal ?? (() => {});

  // Existing visit tracking effect...
  useEffect(() => {
    // ... existing visit tracking code ...
  }, [item?.id, visitRecorded]);

  // ... existing handlers ...

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Not found UI */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={40}
                height={40}
                className="rounded-lg flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {/* Toggle between original and translated name */}
                  {showOriginal && item.originalName ? item.originalName : item.name}
                </h1>
                <p className="text-sm text-gray-500">ID: {item.publicId}</p>
              </div>
            </div>

            {/* Right side: Language Switcher + VisitCounter */}
            <div className="ml-4 flex-shrink-0 flex items-center gap-3">
              {/* NEW: Language Switcher */}
              {translationMeta && (
                <GuestLanguageSwitcher
                  currentLanguage={currentLanguage}
                  availableTranslations={translationMeta.availableTranslations}
                  sourceLanguage={translationMeta.sourceLanguage}
                  onLanguageChange={setLanguage}
                />
              )}
              <VisitCounter publicId={item.publicId} />
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Translation Banners */}
      {translationMeta && (
        <>
          {/* Show when viewing translated content */}
          {translationMeta.isShowingTranslation && !showOriginal && (
            <TranslationBanner
              sourceLanguage={translationMeta.sourceLanguage}
              displayLanguage={displayLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}

          {/* Show when requested translation is unavailable */}
          {translationMeta.translationStatus === 'missing' &&
           translationMeta.requestedLanguage !== translationMeta.sourceLanguage && (
            <MissingTranslationBanner
              requestedLanguage={translationMeta.requestedLanguage}
              displayLanguage={translationMeta.sourceLanguage}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Description Section - Toggle aware */}
        {(showOriginal ? (item.originalDescription || item.description) : item.description) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {showOriginal && item.originalDescription
                ? item.originalDescription
                : item.description}
            </p>
          </div>
        )}

        {/* Reaction Section - unchanged */}
        {/* ... existing reaction section ... */}

        {/* Links Section - Toggle aware for titles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* ... existing structure with toggle-aware titles ... */}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">Powered by FAQBNB.com</p>
        </div>
      </div>

      {/* Image Lightbox - unchanged */}
      {/* ... existing lightbox code ... */}
    </div>
  );
}
```

---

## Integration Points

### Server Component Integration (REQ-E04-016)
The page server component passes translation data:
```tsx
// /src/app/item/[publicId]/page.tsx
<ItemDisplay
  item={translatedItemData}
  translationMeta={translationMeta}
/>
```

### useGuestLanguage Hook Integration (REQ-E04-014)
```typescript
const {
  currentLanguage,    // Current language selection
  showOriginal,       // Toggle state for viewing original
  displayLanguage,    // Effective display language
  setLanguage,        // Change language (persists to cookie)
  toggleOriginal,     // Toggle between translation and original
  hasTranslation,     // Check if language has translation
} = useGuestLanguage({
  initialLanguage: translationMeta.displayLanguage,
  sourceLanguage: translationMeta.sourceLanguage,
  availableTranslations: translationMeta.availableTranslations,
});
```

### Guest Component Integration
| Component | Trigger | Action |
|-----------|---------|--------|
| GuestLanguageSwitcher | Language selection | Calls `setLanguage()` → updates cookie |
| TranslationBanner | "View original" click | Calls `toggleOriginal()` → swaps content |
| MissingTranslationBanner | (Informational) | Displays fallback explanation |

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Component accepts translation metadata prop | `translationMeta` optional prop in interface |
| Component accepts original content separately | `originalName`, `originalDescription` in item props |
| Integrates useGuestLanguage hook | Hook initialized with translationMeta values |
| GuestLanguageSwitcher in header | Added next to VisitCounter |
| Language switcher shows available languages | Passes `availableTranslations` prop |
| TranslationBanner when showing translation | Conditional render based on `isShowingTranslation && !showOriginal` |
| TranslationBanner includes "View original" | `onViewOriginal={toggleOriginal}` callback |
| MissingTranslationBanner when no translation | Conditional based on `translationStatus === 'missing'` |
| Missing banner shows requested vs displayed | Passes both language props |
| Client-side toggle state | `showOriginal` from hook, no server refetch |
| Toggle swaps content without refetch | Content derived from props based on toggle |
| All translatable fields respect toggle | Name, description, article titles, link titles |
| Handles missing translationMeta | Conditional hook usage, fallback values |
| Handles missing original content | Fallback to translated content if original null |
| Integrates with existing styling | Uses existing Tailwind classes |
| Header accommodates language switcher | Flex layout with gap |
| Banners positioned appropriately | After header, before content |
| Maintains accessibility | ARIA roles, keyboard navigation inherited |
| TypeScript types updated | TranslationMeta interface, extended props |
| Works in both navigation scenarios | Server passes data, client toggles |

---

## Testing Considerations

### Unit Test Scenarios
1. **Renders without translationMeta:** Component works with just item prop (backward compatibility)
2. **Renders with translationMeta:** All translation UI elements appear
3. **Language switcher callback:** `setLanguage` called when language selected
4. **Toggle callback:** `toggleOriginal` called when banner clicked
5. **Content toggle - name:** Shows `item.name` when `showOriginal=false`, `item.originalName` when true
6. **Content toggle - description:** Same logic for description
7. **TranslationBanner visibility:** Only when `isShowingTranslation && !showOriginal`
8. **MissingTranslationBanner visibility:** Only when `translationStatus === 'missing'`
9. **Missing original content fallback:** Graceful handling when `originalName` is undefined

### Integration Test Scenarios
1. Full page with translation switches language on dropdown change
2. "View original" toggle swaps content instantly
3. Language preference persisted after toggle
4. Shareable link opens with correct language

### Manual Test Scenarios
1. Visit `/item/ABC123?lang=fr` - see French content, switcher shows French selected
2. Click "View original" - see English content, banner changes
3. Select German from dropdown - page updates, cookie set
4. Refresh page - German persists from cookie
5. No translations exist - see MissingTranslationBanner with correct message

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guest components not ready | Medium | High | Check for component existence, use optional chaining |
| useGuestLanguage hook not ready | Medium | High | Conditional hook usage, provide fallback values |
| Hydration mismatch | Medium | Medium | Server sends initial state, client syncs |
| Original content fields missing | Medium | Low | Fallback to translated content |
| Layout breaks on mobile | Low | Medium | Use responsive flex, test on mobile |
| Toggle causes unnecessary renders | Low | Low | Memoize content selection |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-017
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Component:** `/src/components/ItemDisplay.tsx`
- **Guest Item Page:** `/src/app/item/[publicId]/page.tsx` (REQ-E04-016)
- **useGuestLanguage Hook:** `/src/hooks/useGuestLanguage.ts` (REQ-E04-014)
- **GuestLanguageSwitcher:** `/src/components/guest/GuestLanguageSwitcher/` (REQ-E04-008)
- **TranslationBanner:** `/src/components/guest/TranslationBanner/` (REQ-E04-009)
- **MissingTranslationBanner:** `/src/components/guest/MissingTranslationBanner/` (REQ-E04-010)
- **LinkCard Component:** `/src/components/LinkCard.tsx`
- **Next Task:** REQ-E04-018 (Update LinkCard component for translations)
