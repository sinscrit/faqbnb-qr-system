# REQ-E04-017: Update ItemDisplay Component with Translation Controls - Detailed Task Breakdown

**Request ID:** REQ-E04-017
**Title:** Update ItemDisplay Component with Translation Controls
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.2

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for enhancing the `ItemDisplay` client component with full translation support. Each task is sized to approximately 1 story point and includes specific code locations, verification steps, and acceptance criteria.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies are complete:

| Dependency | File Path | Verification Command |
|------------|-----------|---------------------|
| Localization Types | `/src/types/l10n.ts` | `cat src/types/l10n.ts \| grep "SupportedLanguage"` |
| Types Index Export | `/src/types/index.ts` | `grep "l10n" src/types/index.ts` |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | `ls -la src/hooks/useGuestLanguage.ts` |
| GuestLanguageSwitcher | `/src/components/guest/GuestLanguageSwitcher/` | `ls -la src/components/guest/GuestLanguageSwitcher/` |
| TranslationBanner | `/src/components/guest/TranslationBanner/` | `ls -la src/components/guest/TranslationBanner/` |
| MissingTranslationBanner | `/src/components/guest/MissingTranslationBanner/` | `ls -la src/components/guest/MissingTranslationBanner/` |
| Barrel Exports | `/src/components/guest/index.ts` | `cat src/components/guest/index.ts` |
| Guest Item Page (REQ-E04-016) | `/src/app/item/[publicId]/page.tsx` | Check for `translationMeta` prop passing |

---

## Current Component Analysis

**File:** `/src/components/ItemDisplay.tsx`
**Lines:** 293
**Current Structure:**

```
ItemDisplay.tsx
├── Line 1-13: Imports (React, Lucide, Next/Image, types, components)
├── Line 14: Component function signature - ItemDisplayProps
├── Line 15-18: State declarations (selectedLink, visitRecorded, reactionCounts, reactionError)
├── Line 20-63: useEffect for visit tracking
├── Line 65-81: Reaction handlers (handleReactionChange, handleReactionError)
├── Line 83-92: Null item guard with "Item Not Found" UI
├── Line 94-109: Link click handlers and lightbox
├── Line 111-289: JSX Return
│   ├── Line 114-135: Header section (logo, title, publicId, VisitCounter)
│   ├── Line 138-147: Description section
│   ├── Line 149-185: Reaction section
│   ├── Line 187-256: Links section (articles or flat links)
│   ├── Line 258-263: Footer
│   └── Line 266-288: Image lightbox modal
└── Line 291: Component export
```

---

## Detailed Implementation Tasks

### Task 1: Add New Import Statements
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 1-13 (after existing imports)

#### Current Code (Line 1-13):
```typescript
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
```

#### New Code to Add (after line 12, before line 14):
```typescript
// Translation support imports - REQ-E04-017
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
} from '@/components/guest';
import type { SupportedLanguage } from '@/types';
```

#### Verification Steps:
1. Run `npx tsc --noEmit` to verify no import errors
2. Verify imports resolve: `grep -n "useGuestLanguage\|GuestLanguageSwitcher" src/components/ItemDisplay.tsx`

#### Acceptance Criteria:
- [ ] `useGuestLanguage` hook imported from `@/hooks/useGuestLanguage`
- [ ] `GuestLanguageSwitcher`, `TranslationBanner`, `MissingTranslationBanner` imported from `@/components/guest`
- [ ] `SupportedLanguage` type imported from `@/types`
- [ ] No TypeScript compilation errors

---

### Task 2: Define TranslationMeta Interface
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** After imports, before component function (insert after new imports from Task 1)

#### New Code to Add:
```typescript
// ============ Translation Types - REQ-E04-017 ============
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
```

#### Verification Steps:
1. Run `npx tsc --noEmit` to verify interface compiles
2. Check type is recognized: `grep -A5 "interface TranslationMeta" src/components/ItemDisplay.tsx`

#### Acceptance Criteria:
- [ ] TranslationMeta interface defined with all required properties
- [ ] All properties properly typed with SupportedLanguage or other types
- [ ] JSDoc comments provided for each property
- [ ] No TypeScript compilation errors

---

### Task 3: Extend ItemDisplayProps Interface
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** After TranslationMeta interface (or modify existing import behavior)

#### Current State:
The component imports `ItemDisplayProps` from `@/types`. We need to either:
- Option A: Extend the type locally with additional props
- Option B: Update the central types file

**Recommended: Option A (local extension for backward compatibility)**

#### New Code to Add (after TranslationMeta interface):
```typescript
// Extended props interface with translation support - REQ-E04-017
interface ExtendedItemDisplayProps {
  item: ItemDisplayProps['item'] & {
    /** Original item name before translation */
    originalName?: string;
    /** Original item description before translation */
    originalDescription?: string | null;
    /** Articles with original content for toggle */
    articles?: Array<{
      id: string;
      title: string;
      description?: string | null;
      originalTitle?: string;
      originalDescription?: string | null;
      links: Array<{
        id: string;
        title: string;
        linkType: string;
        url: string;
        thumbnailUrl?: string | null;
        displayOrder: number;
        originalTitle?: string;
      }>;
    }>;
  };
  /** Translation metadata - optional for backward compatibility */
  translationMeta?: TranslationMeta;
}
```

#### Verification Steps:
1. Run `npx tsc --noEmit` to verify type compiles
2. Verify interface extends properly: `grep -A10 "ExtendedItemDisplayProps" src/components/ItemDisplay.tsx`

#### Acceptance Criteria:
- [ ] ExtendedItemDisplayProps interface defined
- [ ] Original content fields added (originalName, originalDescription)
- [ ] Articles extended with originalTitle and originalDescription
- [ ] Links extended with originalTitle
- [ ] translationMeta is optional (for backward compatibility)
- [ ] No TypeScript compilation errors

---

### Task 4: Update Component Function Signature
**Estimated Effort:** 0.25 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Line 14 (component function declaration)

#### Current Code:
```typescript
export default function ItemDisplay({ item }: ItemDisplayProps) {
```

#### New Code:
```typescript
export default function ItemDisplay({ item, translationMeta }: ExtendedItemDisplayProps) {
```

#### Verification Steps:
1. Run `npx tsc --noEmit` to verify signature compiles
2. Verify destructuring: `grep "function ItemDisplay" src/components/ItemDisplay.tsx`

#### Acceptance Criteria:
- [ ] Component accepts both `item` and `translationMeta` props
- [ ] Uses ExtendedItemDisplayProps type
- [ ] No TypeScript compilation errors

---

### Task 5: Integrate useGuestLanguage Hook
**Estimated Effort:** 1 story point
**File:** `/src/components/ItemDisplay.tsx`
**Location:** After existing state declarations (after line 18), before useEffect

#### Current Code Location (lines 15-18):
```typescript
const [selectedLink, setSelectedLink] = useState<string | null>(null);
const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
const [reactionError, setReactionError] = useState<string | null>(null);
```

#### New Code to Add (after line 18):
```typescript
  // ============ Guest Language State - REQ-E04-017 ============
  // Only initialize translation features if translationMeta is provided
  const hasTranslationSupport = Boolean(translationMeta);

  // Initialize guest language hook with translation metadata
  // Conditionally use to maintain backward compatibility
  const guestLanguageState = hasTranslationSupport
    ? useGuestLanguage({
        initialLanguage: translationMeta!.displayLanguage,
        sourceLanguage: translationMeta!.sourceLanguage,
        availableTranslations: translationMeta!.availableTranslations,
      })
    : null;

  // Derive display values with fallbacks for when translationMeta is not provided
  const showOriginal = guestLanguageState?.showOriginal ?? false;
  const currentLanguage = guestLanguageState?.currentLanguage ?? ('en' as SupportedLanguage);
  const displayLanguage = guestLanguageState?.displayLanguage ?? ('en' as SupportedLanguage);
  const setLanguage = guestLanguageState?.setLanguage ?? (() => {});
  const toggleOriginal = guestLanguageState?.toggleOriginal ?? (() => {});
```

#### Verification Steps:
1. Run `npx tsc --noEmit` to verify hook integration compiles
2. Run `npm run dev` and verify no console errors
3. Test with and without translationMeta prop

#### Acceptance Criteria:
- [ ] useGuestLanguage hook conditionally initialized based on translationMeta presence
- [ ] All hook return values extracted with fallback defaults
- [ ] showOriginal, currentLanguage, displayLanguage, setLanguage, toggleOriginal derived
- [ ] Backward compatibility maintained (works without translationMeta)
- [ ] No TypeScript compilation errors

---

### Task 6: Add GuestLanguageSwitcher to Header
**Estimated Effort:** 1 story point
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 130-132 (header right side, where VisitCounter is)

#### Current Code (lines 129-133):
```typescript
          <div className="ml-4 flex-shrink-0">
            <VisitCounter publicId={item.publicId} />
          </div>
```

#### New Code:
```typescript
          {/* Right side: Language Switcher + VisitCounter - REQ-E04-017 */}
          <div className="ml-4 flex-shrink-0 flex items-center gap-3">
            {/* Language Switcher - only render if translation support available */}
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
```

#### Verification Steps:
1. Run `npm run dev` and navigate to guest item page
2. Verify language switcher appears in header when translationMeta provided
3. Verify VisitCounter still renders correctly
4. Test responsive behavior on mobile

#### Acceptance Criteria:
- [ ] GuestLanguageSwitcher renders in header when translationMeta present
- [ ] Language switcher positioned left of VisitCounter with gap
- [ ] currentLanguage passed correctly to switcher
- [ ] availableTranslations and sourceLanguage passed from translationMeta
- [ ] onLanguageChange callback connected to setLanguage
- [ ] VisitCounter remains functional
- [ ] Component does not render GuestLanguageSwitcher when no translationMeta

---

### Task 7: Add Translation Banners Section
**Estimated Effort:** 1 story point
**File:** `/src/components/ItemDisplay.tsx`
**Location:** After header closing tag (line 135), before Main Content section (line 138)

#### Current Code (lines 135-138):
```typescript
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
```

#### New Code to Insert Between:
```typescript
      </div>

      {/* Translation Banners - REQ-E04-017 */}
      {translationMeta && (
        <>
          {/* TranslationBanner: Show when viewing translated content */}
          {translationMeta.isShowingTranslation && !showOriginal && (
            <TranslationBanner
              sourceLanguage={translationMeta.sourceLanguage}
              displayLanguage={displayLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}

          {/* MissingTranslationBanner: Show when requested translation unavailable */}
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
```

#### Verification Steps:
1. Run `npm run dev` and test with translated content
2. Verify TranslationBanner appears when isShowingTranslation=true and showOriginal=false
3. Verify MissingTranslationBanner appears when translationStatus='missing'
4. Test banner dismissal via toggleOriginal callback

#### Acceptance Criteria:
- [ ] TranslationBanner renders between header and main content when showing translation
- [ ] TranslationBanner displays source and display languages
- [ ] TranslationBanner's "View original" triggers toggleOriginal
- [ ] MissingTranslationBanner renders when translation status is 'missing'
- [ ] MissingTranslationBanner shows requested vs actual language
- [ ] Banners do not render when translationMeta is not provided
- [ ] Banner visibility respects showOriginal toggle state

---

### Task 8: Update Item Name Display for Toggle
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Line 126 (item name h1 tag)

#### Current Code (line 126):
```typescript
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{item.name}</h1>
```

#### New Code:
```typescript
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {/* Toggle between original and translated name - REQ-E04-017 */}
                {showOriginal && item.originalName ? item.originalName : item.name}
              </h1>
```

#### Verification Steps:
1. Run `npm run dev` and test toggle functionality
2. Verify name changes when toggling "View Original"
3. Verify fallback to item.name when originalName is undefined

#### Acceptance Criteria:
- [ ] Item name shows originalName when showOriginal=true and originalName exists
- [ ] Item name shows translated name when showOriginal=false
- [ ] Graceful fallback to item.name when originalName is undefined
- [ ] No visual layout changes

---

### Task 9: Update Description Display for Toggle
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 140-147 (description section)

#### Current Code (lines 139-147):
```typescript
      {/* Description Section */}
      {item.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>
      )}
```

#### New Code:
```typescript
      {/* Description Section - REQ-E04-017: Toggle-aware */}
      {(showOriginal
        ? (item.originalDescription || item.description)
        : item.description
      ) && (
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

#### Verification Steps:
1. Run `npm run dev` and test toggle functionality
2. Verify description changes when toggling "View Original"
3. Verify section hides when neither description nor originalDescription exists
4. Verify fallback to translated description when original is undefined

#### Acceptance Criteria:
- [ ] Description shows originalDescription when showOriginal=true and originalDescription exists
- [ ] Description shows translated description when showOriginal=false
- [ ] Section visibility logic considers both original and translated content
- [ ] Graceful fallback when originalDescription is undefined

---

### Task 10: Update Article Titles and Descriptions for Toggle
**Estimated Effort:** 1 story point
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 203-231 (articles rendering section)

#### Current Code (lines 206-214):
```typescript
            {(item as any).articles.map((article: any) => (
              <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-sm text-gray-600 mb-4">{article.description}</p>
                )}
```

#### New Code:
```typescript
            {(item as any).articles.map((article: any) => (
              <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                {/* Article title - toggle-aware - REQ-E04-017 */}
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  {showOriginal && article.originalTitle
                    ? article.originalTitle
                    : article.title}
                </h3>
                {/* Article description - toggle-aware - REQ-E04-017 */}
                {(showOriginal
                  ? (article.originalDescription || article.description)
                  : article.description
                ) && (
                  <p className="text-sm text-gray-600 mb-4">
                    {showOriginal && article.originalDescription
                      ? article.originalDescription
                      : article.description}
                  </p>
                )}
```

#### Verification Steps:
1. Run `npm run dev` and test with item that has articles
2. Verify article titles change when toggling "View Original"
3. Verify article descriptions change when toggling
4. Verify fallback behavior for undefined original content

#### Acceptance Criteria:
- [ ] Article titles respect showOriginal toggle
- [ ] Article descriptions respect showOriginal toggle
- [ ] Fallback to translated content when original undefined
- [ ] Description visibility considers both original and translated

---

### Task 11: Update Link Titles for Toggle (Within Articles)
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 216-224 (links within articles section)

#### Current Code (lines 216-224):
```typescript
                {article.links && article.links.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {article.links.map((link: any) => (
                      <LinkCard
                        key={link.id}
                        title={link.title}
                        linkType={link.linkType}
                        url={link.url}
                        thumbnailUrl={link.thumbnailUrl}
                        onClick={() => handleLinkClick(link.url, link.linkType)}
                      />
                    ))}
                  </div>
```

#### New Code:
```typescript
                {article.links && article.links.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {article.links.map((link: any) => (
                      <LinkCard
                        key={link.id}
                        /* Link title - toggle-aware - REQ-E04-017 */
                        title={showOriginal && link.originalTitle
                          ? link.originalTitle
                          : link.title}
                        linkType={link.linkType}
                        url={link.url}
                        thumbnailUrl={link.thumbnailUrl}
                        onClick={() => handleLinkClick(link.url, link.linkType)}
                      />
                    ))}
                  </div>
```

#### Verification Steps:
1. Run `npm run dev` and test with item that has links in articles
2. Verify link titles change when toggling "View Original"
3. Verify fallback behavior for undefined original titles

#### Acceptance Criteria:
- [ ] Link titles within articles respect showOriginal toggle
- [ ] Fallback to translated title when originalTitle undefined
- [ ] LinkCard component receives correct title prop

---

### Task 12: Update Flat Links List for Toggle
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Lines 243-254 (flat links fallback section)

#### Current Code (lines 243-254):
```typescript
          ) : (
            // Fallback: flat links view (existing code - backward compatibility)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.links.map((link) => (
                <LinkCard
                  key={link.id}
                  title={link.title}
                  linkType={link.linkType}
                  url={link.url}
                  thumbnailUrl={link.thumbnailUrl}
                  onClick={() => handleLinkClick(link.url, link.linkType)}
                />
              ))}
            </div>
          )}
```

#### New Code:
```typescript
          ) : (
            // Fallback: flat links view (existing code - backward compatibility)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.links.map((link) => (
                <LinkCard
                  key={link.id}
                  /* Link title - toggle-aware - REQ-E04-017 */
                  title={showOriginal && (link as any).originalTitle
                    ? (link as any).originalTitle
                    : link.title}
                  linkType={link.linkType}
                  url={link.url}
                  thumbnailUrl={link.thumbnailUrl}
                  onClick={() => handleLinkClick(link.url, link.linkType)}
                />
              ))}
            </div>
          )}
```

#### Verification Steps:
1. Run `npm run dev` and test with item that has flat links (no articles)
2. Verify link titles change when toggling "View Original"
3. Verify backward compatibility with existing link structure

#### Acceptance Criteria:
- [ ] Flat link titles respect showOriginal toggle
- [ ] Type casting handles potential missing originalTitle
- [ ] Fallback to translated title when originalTitle undefined
- [ ] Backward compatibility with existing link objects

---

### Task 13: Add Accessibility Attributes
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Multiple locations (header language section, translation banners)

#### Updates Required:

**Header Language Section (around line 130):**
```typescript
          {/* Right side: Language Switcher + VisitCounter - REQ-E04-017 */}
          <div
            className="ml-4 flex-shrink-0 flex items-center gap-3"
            role="region"
            aria-label="Language settings and visit counter"
          >
```

**Translation Banners Section (around line 137):**
```typescript
      {/* Translation Banners - REQ-E04-017 */}
      {translationMeta && (
        <div role="status" aria-live="polite">
          {/* TranslationBanner: Show when viewing translated content */}
          {translationMeta.isShowingTranslation && !showOriginal && (
            <TranslationBanner
              sourceLanguage={translationMeta.sourceLanguage}
              displayLanguage={displayLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}
          {/* ... rest of banners ... */}
        </div>
      )}
```

#### Verification Steps:
1. Test with screen reader (VoiceOver on Mac, NVDA on Windows)
2. Verify ARIA labels are announced correctly
3. Test keyboard navigation through translation controls
4. Verify live region announces banner changes

#### Acceptance Criteria:
- [ ] Language section has appropriate role and aria-label
- [ ] Translation banner section has aria-live="polite" for status updates
- [ ] Screen readers announce translation status changes
- [ ] All interactive elements keyboard accessible

---

### Task 14: Add Error Boundary for Translation Features
**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemDisplay.tsx`
**Location:** Within component, wrap translation-related rendering in try-catch

#### New Code Pattern (wrap translation logic):
```typescript
  // Safe getter for translation-related display values
  const getDisplayName = (): string => {
    try {
      if (showOriginal && item?.originalName) {
        return item.originalName;
      }
      return item?.name ?? '';
    } catch (error) {
      console.error('Error getting display name:', error);
      return item?.name ?? '';
    }
  };

  const getDisplayDescription = (): string | null => {
    try {
      if (showOriginal && item?.originalDescription) {
        return item.originalDescription;
      }
      return item?.description ?? null;
    } catch (error) {
      console.error('Error getting display description:', error);
      return item?.description ?? null;
    }
  };
```

**Note:** This task is optional but recommended for robustness. Simple ternary operators are generally safe, but this pattern helps with debugging.

#### Verification Steps:
1. Test with malformed translationMeta
2. Test with missing item properties
3. Verify graceful fallback to original content on errors

#### Acceptance Criteria:
- [ ] Translation display errors logged to console
- [ ] Graceful fallback to translated/original content on errors
- [ ] No component crashes from translation feature bugs

---

### Task 15: Final Integration Testing and Type Cleanup
**Estimated Effort:** 1 story point
**File:** `/src/components/ItemDisplay.tsx`
**Actions:** Verify complete integration, run type checks, test all scenarios

#### Verification Checklist:

**TypeScript Compilation:**
```bash
npx tsc --noEmit
```

**Linting:**
```bash
npm run lint
```

**Manual Testing Scenarios:**

| Scenario | Expected Behavior |
|----------|-------------------|
| Visit page without translationMeta | Component renders as before, no translation UI |
| Visit page with translationMeta, no translation available | MissingTranslationBanner shows, original content displayed |
| Visit page with translationMeta, translation available | TranslationBanner shows, translated content displayed |
| Click language switcher | Language options appear with availability indicators |
| Select different language | Page updates (may trigger server refetch via hook) |
| Click "View Original" | Content toggles to original, TranslationBanner updates |
| Toggle back to translation | Content reverts to translated version |
| Mobile viewport | All controls remain accessible and functional |

#### Acceptance Criteria:
- [ ] Zero TypeScript compilation errors
- [ ] Zero ESLint errors/warnings related to changes
- [ ] All 8 manual test scenarios pass
- [ ] Component works identically to before when no translationMeta provided
- [ ] No console errors during normal operation
- [ ] Mobile responsive design maintained

---

## Complete Modified File Structure

After all tasks are complete, the file structure will be:

```typescript
// /src/components/ItemDisplay.tsx
// REQ-E04-017: ItemDisplay with Translation Controls
// Last Modified: 2026-01-20

'use client';

// ============ Imports ============
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

// Translation support imports - REQ-E04-017
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
} from '@/components/guest';
import type { SupportedLanguage } from '@/types';

// ============ Types ============
interface TranslationMeta { ... }
interface ExtendedItemDisplayProps { ... }

// ============ Component ============
export default function ItemDisplay({ item, translationMeta }: ExtendedItemDisplayProps) {
  // Existing state
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  // ... other state

  // Guest language state - REQ-E04-017
  const hasTranslationSupport = Boolean(translationMeta);
  const guestLanguageState = hasTranslationSupport ? useGuestLanguage({...}) : null;
  // Derived values with fallbacks

  // Existing effects and handlers

  if (!item) { return <NotFound />; }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Language Switcher */}
      {/* Translation Banners */}
      {/* Main Content with toggle-aware displays */}
      {/* Footer */}
      {/* Lightbox */}
    </div>
  );
}
```

---

## Rollback Plan

If issues are discovered after deployment:

1. **Quick Revert:** Remove `translationMeta` prop from page.tsx call to ItemDisplay
2. **Full Revert:** Git revert to commit before these changes
3. **Feature Flag:** Can add environment variable check to conditionally disable translation UI

---

## Dependencies Graph

```
REQ-E04-001 (l10n types)
    ↓
REQ-E04-003 (types export)
    ↓
REQ-E04-014 (useGuestLanguage hook)
    ↓
REQ-E04-008 (GuestLanguageSwitcher) ───┐
REQ-E04-009 (TranslationBanner) ───────┤
REQ-E04-010 (MissingTranslationBanner)─┤
REQ-E04-013 (barrel exports) ──────────┤
                                       ↓
REQ-E04-016 (Guest Item Page) ─────────┐
                                       ↓
                               REQ-E04-017 (This Task)
                                       ↓
                               REQ-E04-018 (LinkCard update - optional)
```

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-017
- **Overview:** `/docs/REQ-E04-017-update-itemdisplay-component-client-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Component:** `/src/components/ItemDisplay.tsx`
- **Guest Item Page:** `/src/app/item/[publicId]/page.tsx`
- **useGuestLanguage Hook:** `/src/hooks/useGuestLanguage.ts`
- **Guest Components:** `/src/components/guest/`

---

## Summary

This detailed task breakdown provides 15 discrete implementation tasks that together achieve the goal of adding full translation support to the ItemDisplay component. Each task is designed to be independently verifiable and small enough for incremental commits. The implementation maintains complete backward compatibility by making the `translationMeta` prop optional.

**Total Estimated Effort:** ~8.5 story points
**Recommended Approach:** Implement tasks sequentially (1-15), committing after each verified task.
