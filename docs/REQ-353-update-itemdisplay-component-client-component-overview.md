# REQ-353: Update ItemDisplay Component (Client Component) - Implementation Overview

**Document Created:** 2026-01-19
**Document Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.2
**Epic:** L10N Epic 4 - Guest Experience

---

## Summary

Update the `ItemDisplay` client component (`/src/components/ItemDisplay.tsx`) to render translated content when available, integrate guest language state management, display language switching controls, and show informational banners indicating translation status.

---

## Current Behavior

The ItemDisplay component currently:
1. Accepts a single `item` prop with original content only
2. Renders item name, description, articles, and links in the source language
3. Has no awareness of translation data or language preferences
4. Does not display any language switching UI
5. Does not indicate whether content is translated or original
6. Uses `(item as any).articles` type assertion for articles (indicating incomplete typing)

**Current Component Props:**
```typescript
export interface ItemDisplayProps {
  item: ItemResponse['data'];
}
```

**Current Header Structure (lines 114-135):**
- Logo image (FAQBNB)
- Item name (h1)
- Public ID display
- Visit counter

---

## Expected Behavior

The updated ItemDisplay component will:
1. Accept additional props for translation metadata and original content
2. Integrate the `useGuestLanguage` hook for language state management
3. Display `GuestLanguageSwitcher` in the header for language selection
4. Show `TranslationBanner` when viewing translated content
5. Show `MissingTranslationBanner` when requested language has no translation
6. Provide "View Original" toggle functionality via client-side state swap
7. Display translated or original content based on `showOriginal` state
8. Update article and link rendering to respect translation state

---

## Dependencies

### From Epic 1 (Foundation) - Already Implemented
| Dependency | Location | Status |
|------------|----------|--------|
| Language Configuration | `/src/lib/i18n/config.ts` | Available |
| Supported Locales | `/src/lib/i18n/config.ts` (`SUPPORTED_LOCALES`) | Available |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | Available |

### From Epic 4 (Guest Experience) - Required Components
| Dependency | Location | Status |
|------------|----------|--------|
| `useGuestLanguage` hook | `/src/hooks/useGuestLanguage.ts` | To be created (REQ-317) |
| `GuestLanguageSwitcher` component | `/src/components/guest/GuestLanguageSwitcher/` | To be created (REQ-345) |
| `TranslationBanner` component | `/src/components/guest/TranslationBanner/` | To be created (REQ-346) |
| `MissingTranslationBanner` component | `/src/components/guest/MissingTranslationBanner/` | To be created (REQ-347) |
| `ViewOriginalToggle` component | `/src/components/guest/ViewOriginalToggle/` | To be created (REQ-348) |

### From Task 5.1 (REQ-352) - Prerequisite
| Dependency | Location | Status |
|------------|----------|--------|
| Translation types | `/src/types/index.ts` or `/src/types/l10n.ts` | To be added |
| `TranslationMetadata` interface | `/src/types/` | To be added |
| Updated page passing `translationMeta` | `/src/app/item/[publicId]/page.tsx` | To be implemented |

---

## Technical Approach

### Updated Component Props Interface

```typescript
import { SupportedLocale } from '@/lib/i18n/config';

export interface TranslationMetadata {
  requestedLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  sourceLanguage: SupportedLocale;
  isShowingTranslation: boolean;
  availableTranslations: SupportedLocale[];
}

export interface TranslatedItemData {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  // Original content for "View Original" toggle
  originalName?: string;
  originalDescription?: string | null;
  links: TranslatedLink[];
  articles?: TranslatedArticle[];
}

export interface TranslatedArticle {
  id: string;
  title: string;
  description: string | null;
  originalTitle?: string;
  originalDescription?: string | null;
  links: TranslatedLink[];
}

export interface TranslatedLink {
  id: string;
  title: string;
  originalTitle?: string;
  linkType: string;
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
}

export interface ItemDisplayProps {
  item: TranslatedItemData;
  translationMeta?: TranslationMetadata;
}
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ItemDisplay Component                     │
├─────────────────────────────────────────────────────────────┤
│  Props:                                                      │
│    - item (with translated + original content)              │
│    - translationMeta (language info + available languages)  │
│                                                              │
│  Hook: useGuestLanguage({                                   │
│    initialLanguage: translationMeta.displayLanguage,        │
│    sourceLanguage: translationMeta.sourceLanguage,          │
│    availableTranslations: translationMeta.availableTranslations │
│  })                                                          │
│                                                              │
│  Returns:                                                    │
│    - currentLanguage: SupportedLocale                       │
│    - showOriginal: boolean                                  │
│    - displayLanguage: SupportedLocale                       │
│    - setLanguage: (lang) => void                            │
│    - toggleOriginal: () => void                             │
│    - hasTranslation: (lang) => boolean                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Rendering Logic                         │
├─────────────────────────────────────────────────────────────┤
│  Content to Display = showOriginal                          │
│    ? item.originalName / item.originalDescription           │
│    : item.name / item.description                           │
│                                                              │
│  Show TranslationBanner IF:                                 │
│    translationMeta.isShowingTranslation && !showOriginal    │
│                                                              │
│  Show MissingTranslationBanner IF:                          │
│    translationMeta.requestedLanguage !==                    │
│    translationMeta.displayLanguage &&                       │
│    !translationMeta.isShowingTranslation                    │
└─────────────────────────────────────────────────────────────┘
```

### Header Modification

The header section (lines 114-135 in current file) will be modified to include the language switcher:

```tsx
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
            {showOriginal ? item.originalName : item.name}
          </h1>
          <p className="text-sm text-gray-500">ID: {item.publicId}</p>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
        {/* Language Switcher - NEW */}
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

### Banner Placement

Banners will be placed immediately after the header and before main content:

```tsx
{/* Translation Banners - NEW */}
{translationMeta && translationMeta.isShowingTranslation && !showOriginal && (
  <TranslationBanner
    sourceLanguage={translationMeta.sourceLanguage}
    displayLanguage={displayLanguage}
    onViewOriginal={toggleOriginal}
  />
)}

{translationMeta &&
 translationMeta.requestedLanguage !== translationMeta.displayLanguage &&
 !translationMeta.isShowingTranslation && (
  <MissingTranslationBanner
    requestedLanguage={translationMeta.requestedLanguage}
    displayLanguage={translationMeta.displayLanguage}
  />
)}

{/* Main Content */}
<div className="max-w-4xl mx-auto px-4 py-8">
  {/* ... */}
</div>
```

### Content Rendering Updates

All text content will use conditional rendering based on `showOriginal` state:

```tsx
{/* Description Section */}
{(showOriginal ? item.originalDescription : item.description) && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
      {showOriginal ? item.originalDescription : item.description}
    </p>
  </div>
)}
```

### Article Rendering Updates

Articles will pass translation state to child components:

```tsx
{item.articles && item.articles.length > 0 && (
  <div className="space-y-8">
    {item.articles.map((article) => (
      <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          {showOriginal ? article.originalTitle : article.title}
        </h3>
        {(showOriginal ? article.originalDescription : article.description) && (
          <p className="text-sm text-gray-600 mb-4">
            {showOriginal ? article.originalDescription : article.description}
          </p>
        )}
        {article.links && article.links.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {article.links.map((link) => (
              <LinkCard
                key={link.id}
                title={showOriginal ? (link.originalTitle || link.title) : link.title}
                linkType={link.linkType}
                url={link.url}
                thumbnailUrl={link.thumbnailUrl}
                onClick={() => handleLinkClick(link.url, link.linkType)}
              />
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

---

## Implementation Tasks

### Task 5.2.1: Update ItemDisplayProps Interface
**File:** `/src/types/index.ts`

Add or update types for the enhanced ItemDisplay component:
- `TranslationMetadata` interface
- `TranslatedItemData` interface
- `TranslatedArticle` interface
- `TranslatedLink` interface
- Update `ItemDisplayProps` to include `translationMeta` prop

### Task 5.2.2: Integrate useGuestLanguage Hook
**File:** `/src/components/ItemDisplay.tsx`

1. Import `useGuestLanguage` hook
2. Call hook with translation metadata options
3. Destructure returned state and callbacks
4. Guard against missing `translationMeta` for backward compatibility

```typescript
// Conditional hook usage for backward compatibility
const guestLanguage = translationMeta
  ? useGuestLanguage({
      initialLanguage: translationMeta.displayLanguage,
      sourceLanguage: translationMeta.sourceLanguage,
      availableTranslations: translationMeta.availableTranslations,
    })
  : null;

const {
  currentLanguage = translationMeta?.displayLanguage || 'en',
  showOriginal = false,
  displayLanguage = translationMeta?.displayLanguage || 'en',
  setLanguage = () => {},
  toggleOriginal = () => {},
} = guestLanguage || {};
```

### Task 5.2.3: Add GuestLanguageSwitcher to Header
**File:** `/src/components/ItemDisplay.tsx`

1. Import `GuestLanguageSwitcher` from guest components
2. Add to header area between title and visit counter
3. Pass required props: `currentLanguage`, `availableTranslations`, `sourceLanguage`, `onLanguageChange`
4. Only render when `translationMeta` is provided

### Task 5.2.4: Add Translation Banners
**File:** `/src/components/ItemDisplay.tsx`

1. Import `TranslationBanner` and `MissingTranslationBanner`
2. Add banner section after header, before main content
3. Conditionally render based on translation state:
   - `TranslationBanner`: when showing translation and not in "view original" mode
   - `MissingTranslationBanner`: when requested language differs from display language

### Task 5.2.5: Update Content Rendering for Toggle
**File:** `/src/components/ItemDisplay.tsx`

1. Update item name display to use `showOriginal` conditional
2. Update item description display to use `showOriginal` conditional
3. Update article titles and descriptions to use `showOriginal` conditional
4. Update link titles to use `showOriginal` conditional
5. Ensure graceful fallback when original content not provided

### Task 5.2.6: Maintain Backward Compatibility
**File:** `/src/components/ItemDisplay.tsx`

1. Make `translationMeta` prop optional
2. Guard all translation-related rendering with `translationMeta` checks
3. Default to existing behavior when `translationMeta` is not provided
4. Ensure existing pages continue to work without modification

---

## Authorized Files and Functions for Modification

### Files to Modify
| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `/src/components/ItemDisplay.tsx` | `ItemDisplay` component, imports, rendering logic |
| `/src/types/index.ts` | Add `TranslationMetadata`, `TranslatedItemData`, update `ItemDisplayProps` |

### New Imports Required
```typescript
// From guest components (to be created)
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';

// From hooks (to be created)
import { useGuestLanguage } from '@/hooks/useGuestLanguage';

// From types
import { TranslationMetadata, TranslatedItemData } from '@/types';
```

### Existing Functions to Update
| Function | Current Location | Changes |
|----------|-----------------|---------|
| `ItemDisplay` | `/src/components/ItemDisplay.tsx:14` | Add props, integrate hook, update rendering |
| Header JSX | `/src/components/ItemDisplay.tsx:114-135` | Add language switcher |
| Description section | `/src/components/ItemDisplay.tsx:139-147` | Conditional rendering |
| Articles section | `/src/components/ItemDisplay.tsx:203-232` | Conditional rendering |
| Links section | `/src/components/ItemDisplay.tsx:243-255` | Pass translated titles |

---

## Code Examples

### Updated Component Signature

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ReactionCounts } from '@/types/reactions';
import { TranslationMetadata } from '@/types';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import VisitCounter from './VisitCounter';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

// Guest localization components
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';

interface TranslatedItemData {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  originalName?: string;
  originalDescription?: string | null;
  links: Array<{
    id: string;
    title: string;
    originalTitle?: string;
    linkType: string;
    url: string;
    thumbnailUrl: string | null;
    displayOrder: number;
  }>;
  articles?: Array<{
    id: string;
    title: string;
    description: string | null;
    originalTitle?: string;
    originalDescription?: string | null;
    links: Array<{
      id: string;
      title: string;
      originalTitle?: string;
      linkType: string;
      url: string;
      thumbnailUrl: string | null;
      displayOrder: number;
    }>;
  }>;
}

interface ItemDisplayProps {
  item: TranslatedItemData | null;
  translationMeta?: TranslationMetadata;
}

export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Existing state...
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // Guest language state management
  const guestLanguage = translationMeta
    ? useGuestLanguage({
        initialLanguage: translationMeta.displayLanguage,
        sourceLanguage: translationMeta.sourceLanguage,
        availableTranslations: translationMeta.availableTranslations,
      })
    : null;

  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
  } = guestLanguage || {
    currentLanguage: 'en',
    showOriginal: false,
    displayLanguage: 'en',
    setLanguage: () => {},
    toggleOriginal: () => {},
  };

  // ... rest of component
}
```

### Banner Section Example

```tsx
{/* Translation Status Banners */}
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

    {/* Show when requested language has no translation */}
    {translationMeta.requestedLanguage !== translationMeta.displayLanguage &&
     !translationMeta.isShowingTranslation && (
      <MissingTranslationBanner
        requestedLanguage={translationMeta.requestedLanguage}
        displayLanguage={translationMeta.displayLanguage}
      />
    )}
  </>
)}
```

---

## Testing Scenarios

### Translation Display Tests
1. **With Translation**: Pass `translationMeta.isShowingTranslation = true` → should show translated content
2. **View Original Toggle**: Click "View Original" → should switch to `originalName`/`originalDescription`
3. **Toggle Back**: Toggle again → should return to translated content
4. **Missing Translation**: `isShowingTranslation = false` with different languages → should show MissingTranslationBanner

### Language Switcher Tests
1. **Presence**: When `translationMeta` provided → GuestLanguageSwitcher should render
2. **Absence**: When `translationMeta` not provided → no switcher should render
3. **Selection**: Select different language → `setLanguage` callback should fire

### Backward Compatibility Tests
1. **Legacy Props**: Pass only `item` without `translationMeta` → should render without errors
2. **No Banners**: Without `translationMeta` → no banners should appear
3. **No Switcher**: Without `translationMeta` → no language switcher should appear
4. **Existing Functionality**: Visit tracking, reactions, lightbox should continue working

### Edge Cases
1. **Null Item**: Pass `item: null` → should show "Item Not Found" state
2. **Partial Translation**: Some fields translated, some not → should fallback gracefully
3. **Empty Original**: `originalName` undefined → use translated name even in "view original" mode
4. **No Articles**: Item without articles → should render flat links list

---

## Performance Considerations

1. **No Additional API Calls**: Translation switching is client-side state only
2. **Memoization**: Consider `useMemo` for derived display content if rendering becomes slow
3. **Conditional Imports**: Guest components only imported when translation features enabled
4. **Minimal Re-renders**: Use React.memo on child components if needed

---

## Accessibility Considerations

1. **Language Indicator**: Announce language changes to screen readers
2. **Banner Semantics**: Use appropriate ARIA roles for banners (`role="status"` or `role="alert"`)
3. **Toggle Accessibility**: ViewOriginalToggle should have proper ARIA attributes
4. **Focus Management**: Language switch should not disrupt focus unexpectedly

---

## Rollback Plan

If issues arise:
1. Make `translationMeta` prop optional (already planned)
2. Guard all new code with `translationMeta` checks
3. Component works identically to current version when prop not provided
4. No database changes required - purely UI modifications

---

## Related Documents

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Prerequisite Task:** REQ-352 (Update Guest Item Page)
- **Dependent Components:**
  - REQ-317 (useGuestLanguage hook)
  - REQ-345 (GuestLanguageSwitcher)
  - REQ-346 (TranslationBanner)
  - REQ-347 (MissingTranslationBanner)
  - REQ-348 (ViewOriginalToggle)
- **Request Source:** `/docs/gen_requests_epic4.md` (REQ-353)

---

## Acceptance Criteria

- [ ] Component accepts `translationMeta` prop with language metadata
- [ ] Component accepts original content fields alongside translated content
- [ ] `useGuestLanguage` hook is integrated and called at component initialization
- [ ] `GuestLanguageSwitcher` component renders in the item header area
- [ ] Language switcher receives `availableTranslations` to show availability indicators
- [ ] `TranslationBanner` displays when showing translated content (not in "view original" mode)
- [ ] `TranslationBanner` receives source language and shows correct language name
- [ ] `TranslationBanner` "View original" action triggers toggle callback
- [ ] `MissingTranslationBanner` displays when requested language differs from displayed (no translation)
- [ ] `MissingTranslationBanner` receives both requested and source language for correct message
- [ ] Client-side state swap occurs when toggling (no API calls, instant switch)
- [ ] Toggle state switches displayed content between original and translated versions
- [ ] Language preference changes update cookie via hook
- [ ] Component handles partial translations without layout breaks
- [ ] Banners and switcher follow design system styling
- [ ] Component remains responsive and functional on mobile viewports
- [ ] Screen readers announce language changes appropriately
- [ ] Component maintains backward compatibility when `translationMeta` not provided
