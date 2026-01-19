# REQ-353: Update ItemDisplay Component (Client Component) - Detailed Task Breakdown

**Generated:** 2026-01-19 18:00:00 UTC
**Last Modified:** 2026-01-19 18:00:00 UTC
**Request Source:** docs/gen_requests_epic4.md - Request #353
**Overview Document:** docs/REQ-353-update-itemdisplay-component-client-component-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.2
**Estimated Size:** M (Medium)
**Estimated Effort:** 6-8 hours (single 1-story-point tasks)
**Dependencies:** REQ-317 (useGuestLanguage hook), REQ-345 (GuestLanguageSwitcher), REQ-346 (TranslationBanner), REQ-347 (MissingTranslationBanner), REQ-348 (ViewOriginalToggle), REQ-352 (Guest Item Page Server Component)

---

## Executive Summary

This document provides granular implementation tasks for updating the `ItemDisplay` client component to support multilingual content display. The component will integrate guest language state management, display translated content when available, show informational banners about translation status, and provide controls for language switching and viewing original content.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `useGuestLanguage` hook exists at `/src/hooks/useGuestLanguage.ts` (REQ-317)
- [ ] `GuestLanguageSwitcher` component exists at `/src/components/guest/GuestLanguageSwitcher/` (REQ-345)
- [ ] `TranslationBanner` component exists at `/src/components/guest/TranslationBanner/` (REQ-346)
- [ ] `MissingTranslationBanner` component exists at `/src/components/guest/MissingTranslationBanner/` (REQ-347)
- [ ] Guest component barrel exports exist at `/src/components/guest/index.ts`
- [ ] Parent page (REQ-352) is updated to pass `translationMeta` prop
- [ ] TypeScript types exist in `/src/types/index.ts` or `/src/types/l10n.ts`

---

## Task Breakdown

### Task 1: Define or Import Translation Types

**File:** `/src/types/index.ts` (or verify existing types)
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Verify or add the `TranslationMetadata` interface:

```typescript
// /src/types/index.ts
// REQ-353: Translation types for ItemDisplay component
// Phase: 5 - Update Guest Pages
// Task ID: 5.2.1
// Last Modified: 2026-01-19

import { SupportedLocale } from '@/lib/i18n/config';

/**
 * Metadata about translation status for guest content display
 */
export interface TranslationMetadata {
  /** Language requested by guest (from URL, cookie, or browser) */
  requestedLanguage: SupportedLocale;
  /** Language actually being displayed (may differ if translation unavailable) */
  displayLanguage: SupportedLocale;
  /** Original language of the content */
  sourceLanguage: SupportedLocale;
  /** Whether the content being shown is a translation (not the original) */
  isShowingTranslation: boolean;
  /** List of languages that have completed translations */
  availableTranslations: SupportedLocale[];
}
```

2. Verify or add the `TranslatedItemData` interface:

```typescript
/**
 * Item data structure with translation support
 * Extends base item with original content fields for toggle functionality
 */
export interface TranslatedItemData {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  /** Original name for "View Original" toggle */
  originalName?: string;
  /** Original description for "View Original" toggle */
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
```

3. Update `ItemDisplayProps` to include translation support:

```typescript
/**
 * Props for ItemDisplay component
 * Updated to support translation features while maintaining backward compatibility
 */
export interface ItemDisplayProps {
  /** Item data (may include translated content and original content) */
  item: TranslatedItemData | ItemResponse['data'] | null;
  /** Translation metadata (optional for backward compatibility) */
  translationMeta?: TranslationMetadata;
}
```

#### Acceptance Criteria

- [ ] `TranslationMetadata` interface defined with all required fields
- [ ] `TranslatedItemData` interface defined with original content fields
- [ ] `TranslatedArticle` and `TranslatedLink` interfaces defined
- [ ] `ItemDisplayProps` updated with optional `translationMeta` prop
- [ ] Types exported from `/src/types/index.ts`
- [ ] TypeScript compiles without errors

#### Verification Command

```bash
npx tsc --noEmit
```

---

### Task 2: Add Guest Component Imports to ItemDisplay

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 15 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Add imports for guest localization components at the top of the file:

```typescript
// /src/components/ItemDisplay.tsx
// REQ-353: Update ItemDisplay Component with Translation Support
// Phase: 5 - Update Guest Pages
// Task ID: 5.2.2
// Last Modified: 2026-01-19

'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { TranslatedItemData, TranslationMetadata } from '@/types';
import { ReactionCounts } from '@/types/reactions';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import VisitCounter from './VisitCounter';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

// Guest localization components (REQ-353)
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import type { SupportedLocale } from '@/lib/i18n/config';
```

2. Update the component props interface inline (if not using external types):

```typescript
interface ItemDisplayProps {
  item: TranslatedItemData | null;
  translationMeta?: TranslationMetadata;
}
```

#### Acceptance Criteria

- [ ] All guest component imports added
- [ ] `useGuestLanguage` hook imported
- [ ] `SupportedLocale` type imported
- [ ] Type imports updated for translation support
- [ ] No TypeScript errors on import statements
- [ ] File compiles without errors

---

### Task 3: Integrate useGuestLanguage Hook

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 30 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Update the component signature to accept `translationMeta`:

```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
```

2. Add conditional hook integration after existing state declarations:

```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // REQ-353: Guest language state management
  // Conditionally use the hook only when translationMeta is provided
  const guestLanguageState = translationMeta
    ? useGuestLanguage({
        initialLanguage: translationMeta.displayLanguage,
        sourceLanguage: translationMeta.sourceLanguage,
        availableTranslations: translationMeta.availableTranslations,
      })
    : null;

  // Destructure with defaults for backward compatibility
  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
  } = guestLanguageState ?? {
    currentLanguage: (translationMeta?.displayLanguage || 'en') as SupportedLocale,
    showOriginal: false,
    displayLanguage: (translationMeta?.displayLanguage || 'en') as SupportedLocale,
    setLanguage: () => {},
    toggleOriginal: () => {},
  };

  // ... rest of existing code
```

3. Create helper functions for content selection:

```typescript
  // REQ-353: Helper to get displayed content based on showOriginal state
  const getDisplayName = (): string => {
    if (!item) return '';
    if (showOriginal && 'originalName' in item && item.originalName) {
      return item.originalName;
    }
    return item.name;
  };

  const getDisplayDescription = (): string | null => {
    if (!item) return null;
    if (showOriginal && 'originalDescription' in item) {
      return item.originalDescription ?? item.description;
    }
    return item.description;
  };

  const getArticleTitle = (article: any): string => {
    if (showOriginal && article.originalTitle) {
      return article.originalTitle;
    }
    return article.title;
  };

  const getArticleDescription = (article: any): string | null => {
    if (showOriginal && article.originalDescription !== undefined) {
      return article.originalDescription;
    }
    return article.description;
  };

  const getLinkTitle = (link: any): string => {
    if (showOriginal && link.originalTitle) {
      return link.originalTitle;
    }
    return link.title;
  };
```

#### Acceptance Criteria

- [ ] Component signature updated to accept `translationMeta` prop
- [ ] `useGuestLanguage` hook conditionally integrated
- [ ] State destructured with proper defaults for backward compatibility
- [ ] Helper functions created for content selection
- [ ] Component renders without errors when `translationMeta` is undefined
- [ ] Component renders without errors when `translationMeta` is provided

---

### Task 4: Add GuestLanguageSwitcher to Header

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 25 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Locate the header section (around lines 114-135) and modify it:

```typescript
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
                {/* REQ-353: Use translated or original name based on toggle state */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {getDisplayName()}
                </h1>
                <p className="text-sm text-gray-500">ID: {item.publicId}</p>
              </div>
            </div>
            {/* REQ-353: Header controls section with language switcher */}
            <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
              {/* Language Switcher - only show when translation context available */}
              {translationMeta && (
                <GuestLanguageSwitcher
                  currentLanguage={currentLanguage}
                  availableTranslations={translationMeta.availableTranslations}
                  sourceLanguage={translationMeta.sourceLanguage}
                  onLanguageChange={setLanguage}
                  compact={true}
                />
              )}
              <VisitCounter publicId={item.publicId} />
            </div>
          </div>
        </div>
      </div>
```

#### Acceptance Criteria

- [ ] `GuestLanguageSwitcher` added to header section
- [ ] Switcher only renders when `translationMeta` is provided
- [ ] Current language passed to switcher
- [ ] Available translations passed for availability indicators
- [ ] Source language passed for original language marking
- [ ] `onLanguageChange` callback connected to `setLanguage`
- [ ] Compact mode enabled for header placement
- [ ] Layout remains responsive on mobile

---

### Task 5: Add Translation Banners Section

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 30 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Add banner section immediately after the header and before main content:

```typescript
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* ... existing header content ... */}
      </div>

      {/* REQ-353: Translation Status Banners */}
      {translationMeta && (
        <>
          {/* TranslationBanner: Show when displaying translated content (not original) */}
          {translationMeta.isShowingTranslation && !showOriginal && (
            <TranslationBanner
              sourceLanguage={translationMeta.sourceLanguage}
              displayLanguage={displayLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}

          {/* MissingTranslationBanner: Show when requested language differs from displayed */}
          {translationMeta.requestedLanguage !== translationMeta.displayLanguage &&
           !translationMeta.isShowingTranslation && (
            <MissingTranslationBanner
              requestedLanguage={translationMeta.requestedLanguage}
              displayLanguage={translationMeta.displayLanguage}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
```

2. Ensure proper conditional rendering logic:
   - `TranslationBanner` shows when:
     - `translationMeta.isShowingTranslation` is true (content is translated)
     - AND `showOriginal` is false (user hasn't toggled to original)
   - `MissingTranslationBanner` shows when:
     - `requestedLanguage !== displayLanguage` (requested language unavailable)
     - AND `isShowingTranslation` is false (showing original, not translation)

#### Acceptance Criteria

- [ ] `TranslationBanner` renders when showing translated content
- [ ] `TranslationBanner` hides when "View Original" is active
- [ ] `MissingTranslationBanner` renders when translation unavailable
- [ ] Banners positioned between header and main content
- [ ] `onViewOriginal` callback connected to `toggleOriginal`
- [ ] Source and display language passed to banners
- [ ] No banners render when `translationMeta` is undefined

---

### Task 6: Update Description Section for Translation Toggle

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 15 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Update the description section to use the helper function:

```typescript
        {/* Description Section */}
        {getDisplayDescription() && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {getDisplayDescription()}
            </p>
          </div>
        )}
```

#### Acceptance Criteria

- [ ] Description uses `getDisplayDescription()` helper
- [ ] Shows translated description by default when available
- [ ] Shows original description when `showOriginal` is true
- [ ] Handles null/undefined descriptions gracefully
- [ ] Existing styling preserved

---

### Task 7: Update Articles Section for Translation Toggle

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 30 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Update the articles rendering section (around lines 203-232):

```typescript
          {/* REQ-151/REQ-353: Check if articles exist and render grouped view with translation support */}
          {(item as any).articles && (item as any).articles.length > 0 ? (
            // Grouped by article view
            <div className="space-y-8">
              {(item as any).articles.map((article: any) => (
                <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  {/* REQ-353: Use translated or original article title */}
                  <h3 className="text-md font-medium text-gray-800 mb-2">
                    {getArticleTitle(article)}
                  </h3>
                  {/* REQ-353: Use translated or original article description */}
                  {getArticleDescription(article) && (
                    <p className="text-sm text-gray-600 mb-4">
                      {getArticleDescription(article)}
                    </p>
                  )}
                  {article.links && article.links.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {article.links.map((link: any) => (
                        <LinkCard
                          key={link.id}
                          {/* REQ-353: Use translated or original link title */}
                          title={getLinkTitle(link)}
                          linkType={link.linkType}
                          url={link.url}
                          thumbnailUrl={link.thumbnailUrl}
                          onClick={() => handleLinkClick(link.url, link.linkType)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No resources in this section.</p>
                  )}
                </div>
              ))}
            </div>
          ) : /* ... rest of existing code */
```

#### Acceptance Criteria

- [ ] Article titles use `getArticleTitle()` helper
- [ ] Article descriptions use `getArticleDescription()` helper
- [ ] Link titles use `getLinkTitle()` helper
- [ ] Toggle switches all article content simultaneously
- [ ] Null/undefined content handled gracefully
- [ ] Existing article structure preserved

---

### Task 8: Update Flat Links Section for Translation Toggle

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 15 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Update the flat links fallback section (around lines 243-255):

```typescript
          ) : (
            // Fallback: flat links view (existing code - backward compatibility)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.links.map((link) => (
                <LinkCard
                  key={link.id}
                  {/* REQ-353: Use translated or original link title */}
                  title={getLinkTitle(link)}
                  linkType={link.linkType}
                  url={link.url}
                  thumbnailUrl={link.thumbnailUrl}
                  onClick={() => handleLinkClick(link.url, link.linkType)}
                />
              ))}
            </div>
          )}
```

#### Acceptance Criteria

- [ ] Flat links use `getLinkTitle()` helper
- [ ] Toggle affects flat links the same as article links
- [ ] Existing fallback behavior preserved
- [ ] No errors when links don't have `originalTitle`

---

### Task 9: Ensure Backward Compatibility

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Verify all translation-related code is guarded:

```typescript
// All translation UI only renders when translationMeta exists
{translationMeta && (
  // Translation-specific UI here
)}

// Hook only invoked when translationMeta exists
const guestLanguageState = translationMeta ? useGuestLanguage(...) : null;

// Destructure with safe defaults
const { currentLanguage, showOriginal, ... } = guestLanguageState ?? {
  currentLanguage: 'en' as SupportedLocale,
  showOriginal: false,
  // ...
};
```

2. Verify helper functions handle missing original content:

```typescript
const getDisplayName = (): string => {
  if (!item) return '';
  // If showOriginal but no originalName, fall back to translated name
  if (showOriginal && 'originalName' in item && item.originalName) {
    return item.originalName;
  }
  return item.name;
};
```

3. Test scenarios:
   - Existing pages without `translationMeta` render correctly
   - No errors when `originalName`, `originalDescription`, etc. are undefined
   - Visit tracking and reactions continue working

#### Acceptance Criteria

- [ ] Component renders correctly without `translationMeta` prop
- [ ] No language switcher appears without `translationMeta`
- [ ] No banners appear without `translationMeta`
- [ ] Content shows normally (no toggle behavior) without `translationMeta`
- [ ] All existing functionality preserved (visit tracking, reactions, lightbox)
- [ ] No TypeScript errors when `translationMeta` is undefined

---

### Task 10: Add Accessibility Features

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 20 minutes
**Priority:** P2 - Medium

#### Implementation Steps

1. Add ARIA attributes to language-aware content:

```typescript
      {/* Header with language context */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Add lang attribute when showing translated content */}
          <div
            className="flex items-center justify-between"
            lang={translationMeta && !showOriginal ? displayLanguage : translationMeta?.sourceLanguage}
          >
            {/* ... content ... */}
          </div>
        </div>
      </div>
```

2. Add aria-live region for language changes (optional enhancement):

```typescript
      {/* Screen reader announcement for language changes */}
      {translationMeta && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {showOriginal
            ? `Showing original content in ${translationMeta.sourceLanguage}`
            : `Showing content in ${displayLanguage}`
          }
        </div>
      )}
```

#### Acceptance Criteria

- [ ] Content regions have appropriate `lang` attribute
- [ ] Language changes announced to screen readers
- [ ] Banners have appropriate ARIA roles
- [ ] Toggle controls have accessible names
- [ ] Focus management doesn't disrupt user on language switch

---

### Task 11: Final Integration Testing

**File:** `/src/components/ItemDisplay.tsx`
**Estimated Effort:** 30 minutes
**Priority:** P1 - High

#### Test Scenarios

1. **Backward Compatibility Test:**
   ```typescript
   // Existing usage without translation props
   <ItemDisplay item={itemData} />
   // Should render exactly as before
   ```

2. **Translation Display Test:**
   ```typescript
   <ItemDisplay
     item={translatedItemData}
     translationMeta={{
       requestedLanguage: 'fr',
       displayLanguage: 'fr',
       sourceLanguage: 'en',
       isShowingTranslation: true,
       availableTranslations: ['en', 'fr', 'es'],
     }}
   />
   // Should show French content with TranslationBanner
   ```

3. **View Original Toggle Test:**
   - Click "View Original" in TranslationBanner
   - Verify all content switches to original language
   - Click toggle again to return to translation

4. **Missing Translation Test:**
   ```typescript
   <ItemDisplay
     item={originalItemData}
     translationMeta={{
       requestedLanguage: 'de',
       displayLanguage: 'en',
       sourceLanguage: 'en',
       isShowingTranslation: false,
       availableTranslations: ['en', 'fr'],
     }}
   />
   // Should show MissingTranslationBanner for German
   ```

5. **Language Switcher Test:**
   - Change language in GuestLanguageSwitcher
   - Verify `setLanguage` callback fires
   - (Note: actual content change requires page reload via parent)

6. **Mobile Responsiveness Test:**
   - Test on 375px viewport
   - Verify header layout with language switcher
   - Verify banner visibility and text wrapping

#### Acceptance Criteria

- [ ] All 6 test scenarios pass
- [ ] No console errors in browser dev tools
- [ ] No TypeScript compilation errors
- [ ] Build succeeds (`npm run build`)
- [ ] Component renders correctly on mobile viewports

---

## Files Summary

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/ItemDisplay.tsx` | Add translation support, guest components integration |
| `/src/types/index.ts` | Add/verify translation type interfaces |

### New Imports Required

```typescript
// In /src/components/ItemDisplay.tsx
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import type { SupportedLocale } from '@/lib/i18n/config';
import { TranslatedItemData, TranslationMetadata } from '@/types';
```

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useGuestLanguage.ts` | Hook interface and return types |
| `/src/components/guest/GuestLanguageSwitcher/` | Component props interface |
| `/src/components/guest/TranslationBanner/` | Component props interface |
| `/src/components/guest/MissingTranslationBanner/` | Component props interface |
| `/src/lib/i18n/config.ts` | `SupportedLocale` type definition |
| `/src/app/item/[publicId]/page.tsx` | Parent page (REQ-352) for integration context |

### Dependencies (Must Exist)

| Dependency | Location | From |
|------------|----------|------|
| `useGuestLanguage` hook | `/src/hooks/useGuestLanguage.ts` | REQ-317 |
| `GuestLanguageSwitcher` | `/src/components/guest/GuestLanguageSwitcher/` | REQ-345 |
| `TranslationBanner` | `/src/components/guest/TranslationBanner/` | REQ-346 |
| `MissingTranslationBanner` | `/src/components/guest/MissingTranslationBanner/` | REQ-347 |
| Guest barrel exports | `/src/components/guest/index.ts` | REQ-350 |

---

## Acceptance Criteria Checklist

From REQ-353 Requirements:

- [ ] Component accepts translation metadata and original content as props
- [ ] Guest language preference is obtained via the useGuestLanguage hook
- [ ] GuestLanguageSwitcher component appears in the item header
- [ ] TranslationBanner displays when showing translated content
- [ ] MissingTranslationBanner displays when selected language has no translation
- [ ] Toggle control allows switching between original and translated versions
- [ ] View preference (original/translation) is maintained via client-side state
- [ ] All language switches and toggles update the display without page reload

Additional Technical Criteria:

- [ ] Component maintains backward compatibility when `translationMeta` not provided
- [ ] TypeScript compiles without errors
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors during rendering
- [ ] Responsive layout maintained on mobile viewports
- [ ] Accessibility: screen readers announce language changes
- [ ] Performance: no additional API calls on toggle (client-side only)

---

## Performance Considerations

- **No Additional API Calls**: Toggle between original and translated content is purely client-side state
- **Conditional Hook Invocation**: `useGuestLanguage` only called when `translationMeta` provided
- **Lazy Import Consideration**: Guest components could be code-split if bundle size becomes concern
- **Memoization**: Consider `useMemo` for `getDisplayName`, `getDisplayDescription` if profiling shows issues

---

## Rollback Plan

If issues arise after deployment:

1. **Quick Fix**: Set `translationMeta` to `undefined` in parent page to disable all translation features
2. **Component Rollback**: Revert to previous `ItemDisplay.tsx` version
3. **No Database Impact**: All changes are UI-only, no schema changes involved
4. **Feature Flag Option**: Could wrap translation features in environment variable check if needed

---

## Code Examples

### Complete Updated Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { TranslatedItemData, TranslationMetadata } from '@/types';
import { ReactionCounts } from '@/types/reactions';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import VisitCounter from './VisitCounter';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

// Guest localization components (REQ-353)
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import type { SupportedLocale } from '@/lib/i18n/config';

interface ItemDisplayProps {
  item: TranslatedItemData | null;
  translationMeta?: TranslationMetadata;
}

export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Existing state
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // REQ-353: Guest language state management
  const guestLanguageState = translationMeta
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
  } = guestLanguageState ?? {
    currentLanguage: (translationMeta?.displayLanguage || 'en') as SupportedLocale,
    showOriginal: false,
    displayLanguage: (translationMeta?.displayLanguage || 'en') as SupportedLocale,
    setLanguage: () => {},
    toggleOriginal: () => {},
  };

  // REQ-353: Content display helpers
  const getDisplayName = (): string => {
    if (!item) return '';
    if (showOriginal && 'originalName' in item && item.originalName) {
      return item.originalName;
    }
    return item.name;
  };

  const getDisplayDescription = (): string | null => {
    if (!item) return null;
    if (showOriginal && 'originalDescription' in item) {
      return item.originalDescription ?? item.description;
    }
    return item.description;
  };

  const getArticleTitle = (article: any): string => {
    if (showOriginal && article.originalTitle) {
      return article.originalTitle;
    }
    return article.title;
  };

  const getArticleDescription = (article: any): string | null => {
    if (showOriginal && article.originalDescription !== undefined) {
      return article.originalDescription;
    }
    return article.description;
  };

  const getLinkTitle = (link: any): string => {
    if (showOriginal && link.originalTitle) {
      return link.originalTitle;
    }
    return link.title;
  };

  // ... existing useEffect for visit tracking ...
  // ... existing handlers ...

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600">The requested item could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Language Switcher */}
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
                  {getDisplayName()}
                </h1>
                <p className="text-sm text-gray-500">ID: {item.publicId}</p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
              {translationMeta && (
                <GuestLanguageSwitcher
                  currentLanguage={currentLanguage}
                  availableTranslations={translationMeta.availableTranslations}
                  sourceLanguage={translationMeta.sourceLanguage}
                  onLanguageChange={setLanguage}
                  compact={true}
                />
              )}
              <VisitCounter publicId={item.publicId} />
            </div>
          </div>
        </div>
      </div>

      {/* Translation Status Banners */}
      {translationMeta && (
        <>
          {translationMeta.isShowingTranslation && !showOriginal && (
            <TranslationBanner
              sourceLanguage={translationMeta.sourceLanguage}
              displayLanguage={displayLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}
          {translationMeta.requestedLanguage !== translationMeta.displayLanguage &&
           !translationMeta.isShowingTranslation && (
            <MissingTranslationBanner
              requestedLanguage={translationMeta.requestedLanguage}
              displayLanguage={translationMeta.displayLanguage}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ... rest of component using helper functions ... */}
      </div>

      {/* ... existing lightbox ... */}
    </div>
  );
}
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Overview Document: `/docs/REQ-353-update-itemdisplay-component-client-component-overview.md`
- Request Document: `/docs/gen_requests_epic4.md` - REQ-353
- Prerequisite Task: REQ-352 (Update Guest Item Page Server Component)
- Dependent Components:
  - REQ-317 (useGuestLanguage hook)
  - REQ-345 (GuestLanguageSwitcher)
  - REQ-346 (TranslationBanner)
  - REQ-347 (MissingTranslationBanner)
  - REQ-350 (Guest component barrel exports)
- Existing Component: `/src/components/ItemDisplay.tsx`
- Type Definitions: `/src/types/index.ts`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience*
*Task ID: 5.2 - Update ItemDisplay Component (Client Component)*
