# Implementation Breakdown: REQ-E04-017 - Update ItemDisplay Component (Client Component)

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-017 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #17 |
| **Original Request Date** | 2026-01-22 17:15 |
| **Breakdown Created** | 2026-01-22 19:32 |
| **T-shirt Size** | L |
| **Estimated Effort** | 8-10 hours |
| **Status** | PENDING |

---

## Goals

Update the ItemDisplay client component to integrate Epic 4 guest language features, including language switching, translation banners, and original content toggling. This is the final integration point that brings together all guest UI components and hooks.

**Key Objectives**:
1. Accept `translationMeta` prop from server component (REQ-E04-016)
2. Integrate `useGuestLanguage` hook for client-side language state management
3. Add `GuestLanguageSwitcher` to header for language selection
4. Add `TranslationBanner` when displaying translated content
5. Add `MissingTranslationBanner` when translation unavailable (fallback)
6. Add `ViewOriginalToggle` button for switching between translation and original
7. Handle client-side content display based on `showOriginal` state
8. Maintain backward compatibility with existing non-translated items

---

## Implementation Plan

### 1. Update ItemDisplayProps Interface

**File**: `/src/types/index.ts`

**Approach**: Add optional `translationMeta` prop to ItemDisplayProps interface (if not already added in REQ-E04-016).

**Implementation Details**:

```typescript
export interface TranslationMeta {
  /** Language requested by guest */
  requestedLanguage: SupportedLanguage;
  /** Language being displayed */
  displayLanguage: SupportedLanguage;
  /** Available translation languages */
  availableLanguages: SupportedLanguage[];
  /** Whether content is translated */
  isTranslated: boolean;
  /** Original language of content */
  originalLanguage: SupportedLanguage;
}

export interface ItemDisplayProps {
  item: ItemResponse['data'];
  translationMeta?: TranslationMeta; // NEW: Optional for backward compatibility
}
```

**Steps**:
1. Add `TranslationMeta` interface (if not already exists from REQ-E04-016)
2. Add optional `translationMeta` prop to `ItemDisplayProps`
3. Make it optional to maintain backward compatibility

### 2. Add Translation UI Component Imports

**File**: `/src/components/ItemDisplay.tsx`

**Approach**: Import all guest UI components and hooks created in Phase 3 and 4.

**Implementation Details**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ItemDisplayProps } from '@/types';
import { ReactionCounts } from '@/types/reactions';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import VisitCounter from './VisitCounter';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

// NEW: Epic 4 Guest Experience Components and Hooks
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator,
} from '@/components/guest';
import { useGuestLanguage } from '@/hooks';
```

**Steps**:
1. Import guest components from barrel export `@/components/guest`
2. Import `useGuestLanguage` hook from `@/hooks`
3. Keep existing imports intact

### 3. Integrate useGuestLanguage Hook

**Approach**: Use hook to manage language state if translationMeta is provided.

**Implementation Details**:

```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  const tNotifications = useTranslations('common.notifications');
  const tEmpty = useTranslations('common.emptyStates');

  // Existing state
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // NEW: Guest language state (only if translations available)
  const {
    currentLanguage,
    showOriginal,
    setLanguage,
    toggleOriginal,
    isLoading: languageLoading,
    setAvailableLanguages,
  } = useGuestLanguage();

  // NEW: Initialize available languages when translationMeta changes
  useEffect(() => {
    if (translationMeta?.availableLanguages) {
      setAvailableLanguages(translationMeta.availableLanguages);
    }
  }, [translationMeta?.availableLanguages, setAvailableLanguages]);

  // NEW: Determine display content based on showOriginal state
  const displayContent = showOriginal
    ? item // Original content (already in item from server)
    : item; // Translated content (API already returns translated content)

  // NEW: Check if showing fallback language
  const isShowingFallback =
    translationMeta?.isTranslated &&
    !showOriginal &&
    translationMeta.requestedLanguage !== translationMeta.displayLanguage;

  // Existing visit tracking logic...
  // Existing reaction handling logic...
  // ...
```

**Steps**:
1. Call `useGuestLanguage()` hook unconditionally (hook handles no-translation case internally)
2. Initialize available languages from `translationMeta` in `useEffect`
3. Determine `displayContent` based on `showOriginal` state
4. Calculate `isShowingFallback` for MissingTranslationBanner display
5. Keep existing state and logic intact

### 4. Update Header Section with Language Controls

**Approach**: Add GuestLanguageSwitcher and LanguageIndicator to header if translations available.

**Implementation Details**:

```typescript
return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
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
                {displayContent.name}
              </h1>
              <p className="text-sm text-gray-500">ID: {item.publicId}</p>
            </div>
          </div>

          {/* Right: Language Controls and Visit Counter */}
          <div className="ml-4 flex items-center gap-3 flex-shrink-0">
            {/* NEW: Language Controls (only if translations available) */}
            {translationMeta && translationMeta.availableLanguages.length > 1 && (
              <>
                {/* Desktop: Language Switcher */}
                <div className="hidden sm:block">
                  <GuestLanguageSwitcher
                    currentLanguage={currentLanguage}
                    availableLanguages={translationMeta.availableLanguages}
                    onLanguageChange={setLanguage}
                  />
                </div>

                {/* Mobile: Language Indicator (compact) */}
                <div className="sm:hidden">
                  <LanguageIndicator
                    displayLanguage={currentLanguage}
                    originalLanguage={translationMeta.originalLanguage}
                    size="sm"
                  />
                </div>
              </>
            )}

            {/* Visit Counter */}
            <VisitCounter publicId={item.publicId} />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* NEW: Translation Banners */}
      {translationMeta && !showOriginal && (
        <>
          {/* Show TranslationBanner when successfully translated */}
          {translationMeta.isTranslated && !isShowingFallback && (
            <TranslationBanner
              sourceLanguage={translationMeta.originalLanguage}
              onViewOriginal={toggleOriginal}
              className="mb-6"
            />
          )}

          {/* Show MissingTranslationBanner when fallback language displayed */}
          {isShowingFallback && (
            <MissingTranslationBanner
              requestedLanguage={translationMeta.requestedLanguage}
              fallbackLanguage={translationMeta.displayLanguage}
              className="mb-6"
            />
          )}
        </>
      )}

      {/* NEW: View Original Toggle (when translation exists) */}
      {translationMeta && translationMeta.isTranslated && (
        <ViewOriginalToggle
          isViewingOriginal={showOriginal}
          originalLanguage={translationMeta.originalLanguage}
          onToggle={toggleOriginal}
          className="mb-6"
        />
      )}

      {/* Existing Description Section */}
      {displayContent.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            About This Item
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayContent.description}
          </p>
        </div>
      )}

      {/* Existing Reaction Section */}
      {/* ... */}

      {/* Existing Links Section */}
      {/* ... */}
    </div>
  </div>
);
```

**Steps**:
1. Add GuestLanguageSwitcher to header (desktop: full dropdown, mobile: compact indicator)
2. Add TranslationBanner below header when showing translation
3. Add MissingTranslationBanner when showing fallback language
4. Add ViewOriginalToggle before content sections
5. Use `displayContent` instead of `item` for rendered content
6. Conditional rendering: only show translation UI if `translationMeta` exists

### 5. Handle Content Display Logic

**Approach**: Use displayContent for all rendered text (name, description, links, articles).

**Pattern**:
```typescript
// Replace all instances of item.X with displayContent.X
<h1>{displayContent.name}</h1>
<p>{displayContent.description}</p>

// Links and articles also use displayContent
{displayContent.links?.map((link) => (
  <LinkCard key={link.id} link={link} onClick={...} />
))}
```

**Steps**:
1. Search for all references to `item.name`, `item.description`, `item.links`, etc.
2. Replace with `displayContent.name`, `displayContent.description`, etc.
3. Except for: `item.id` (never changes), `item.publicId` (never changes)

### 6. Responsive Language UI

**Desktop**:
- GuestLanguageSwitcher dropdown in header
- Full-width banners
- ViewOriginalToggle as full button

**Mobile**:
- LanguageIndicator (compact) in header
- Responsive banners
- ViewOriginalToggle as compact button

**Implementation**:
```typescript
{/* Desktop */}
<div className="hidden sm:block">
  <GuestLanguageSwitcher {...props} />
</div>

{/* Mobile */}
<div className="sm:hidden">
  <LanguageIndicator {...props} size="sm" />
</div>
```

### 7. Backward Compatibility

**Approach**: Make all translation features optional based on `translationMeta` prop.

**Pattern**:
```typescript
// Only render translation UI if translationMeta exists
{translationMeta && (
  <GuestLanguageSwitcher />
)}

// Fall back to item directly if no translationMeta
const displayContent = translationMeta ? (showOriginal ? item : item) : item;
```

**Steps**:
1. All translation UI wrapped in `{translationMeta && ...}` conditionals
2. Component works without `translationMeta` prop (existing behavior)
3. Hook called unconditionally but handles no-translation case internally

### 8. Error Handling

**Approach**: Handle edge cases gracefully without breaking component.

**Cases**:
```typescript
// No translationMeta provided
if (!translationMeta) {
  // Render original behavior (no translation UI)
}

// Hook loading state
if (languageLoading) {
  // Show skeleton or existing content (no flash)
}

// Invalid language in translationMeta
if (!translationMeta.availableLanguages.includes(currentLanguage)) {
  // Hook handles fallback internally
}
```

**Steps**:
1. Conditional rendering prevents crashes
2. Hook handles invalid states internally
3. Existing content always visible (no loading blockers)

### 9. Testing Considerations

**Component Testing**:
- Renders without translationMeta (backward compatibility)
- Renders with translationMeta (translation UI appears)
- GuestLanguageSwitcher changes language
- TranslationBanner appears when translated
- MissingTranslationBanner appears when fallback
- ViewOriginalToggle switches between translation and original
- Responsive layout works on mobile and desktop
- All existing functionality still works (reactions, visit tracking, links)

---

## Authorized Files and Functions for Modification

### Files to Modify

1. **`/src/components/ItemDisplay.tsx`**
   - Target: `ItemDisplay` component (main function)
   - Type: Modify extensively
   - Changes:
     - Add guest component imports
     - Integrate `useGuestLanguage` hook
     - Add language controls to header
     - Add translation banners before content
     - Add ViewOriginalToggle
     - Use `displayContent` instead of `item` for rendering
     - Add responsive language UI

2. **`/src/types/index.ts`**
   - Target: `ItemDisplayProps` interface
   - Type: Extend
   - Changes:
     - Add `TranslationMeta` interface (if not exists from REQ-E04-016)
     - Add optional `translationMeta` prop to `ItemDisplayProps`

### Files to Reference (Read-Only)

1. **`/src/components/guest/index.ts`** (from REQ-E04-013)
   - Reference: Barrel export of all guest components
   - Usage: Import guest components

2. **`/src/hooks/useGuestLanguage.ts`** (from REQ-E04-014)
   - Reference: Guest language state management hook
   - Usage: Manage language state and toggle original

3. **`/src/app/item/[publicId]/page.tsx`** (from REQ-E04-016)
   - Reference: Server component passing translationMeta
   - Usage: Understand prop contract

4. **`/src/components/guest/*`** (from REQ-E04-008 through REQ-E04-012)
   - Reference: All guest UI components
   - Usage: Integrate into ItemDisplay

### Dependencies

**NPM Packages**:
- `react` (already installed) - useState, useEffect
- `next-intl` (already installed) - useTranslations
- `@/components/guest` (from REQ-E04-013) - Guest UI components
- `@/hooks` (from REQ-E04-014) - useGuestLanguage hook

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-E04-008**: Create GuestLanguageSwitcher Component
  - Provides: Language dropdown component
  - Required: Header language controls

- **REQ-E04-009**: Create TranslationBanner Component
  - Provides: Translation context banner
  - Required: Show when viewing translation

- **REQ-E04-010**: Create MissingTranslationBanner Component
  - Provides: Fallback language banner
  - Required: Show when translation unavailable

- **REQ-E04-011**: Create ViewOriginalToggle Component
  - Provides: Toggle button component
  - Required: Switch between translation and original

- **REQ-E04-012**: Create LanguageIndicator Component
  - Provides: Compact language indicator
  - Required: Mobile header display

- **REQ-E04-013**: Create Barrel Exports for Guest Components
  - Provides: Centralized import path
  - Required: Clean component imports

- **REQ-E04-014**: Create useGuestLanguage Hook
  - Provides: Language state management
  - Required: Hook for client-side language state

- **REQ-E04-016**: Update Guest Item Page (Server Component)
  - Provides: `translationMeta` prop
  - Required: Server component passes translation data

### Blocks (Cannot Start Until This Completes)

- **None** - This is the final integration task for Epic 4 guest experience

### Parallel Safety

❌ **Cannot be parallelized** - This task depends on ALL previous Phase 3, 4, and 5 tasks

**Execution Order**:
1. Complete REQ-E04-008 through REQ-E04-012 (Guest UI components)
2. Complete REQ-E04-013 (Barrel exports)
3. Complete REQ-E04-014 (useGuestLanguage hook)
4. Complete REQ-E04-016 (Server component updates)
5. Then complete REQ-E04-017 (This task - Client component integration)

**Files Touched**:
- `/src/components/ItemDisplay.tsx` (modify - extensive changes)
- `/src/types/index.ts` (modify - add interface if needed)

### External Dependencies

- All Epic 4 guest components and hooks

---

## Risks and Considerations

### Technical Risks

1. **Component Re-renders**
   - **Risk**: useGuestLanguage state changes cause unnecessary re-renders
   - **Mitigation**: Hook uses useCallback for functions, React optimizes
   - **Testing**: Monitor performance with React DevTools

2. **State Synchronization**
   - **Risk**: showOriginal state out of sync with URL parameter
   - **Mitigation**: Hook manages URL sync internally
   - **Testing**: Verify state persists across page reloads

3. **Content Display Logic**
   - **Risk**: Confusion between original and translated content
   - **Mitigation**: Clear `displayContent` variable with documentation
   - **Pattern**: `displayContent = showOriginal ? item : item` (API handles translation)

4. **Backward Compatibility**
   - **Risk**: Breaking existing ItemDisplay usage without translationMeta
   - **Mitigation**: All translation UI conditionally rendered
   - **Testing**: Test both with and without translationMeta prop

### Integration Risks

1. **Server-Client Props Mismatch**
   - **Risk**: Server component doesn't pass translationMeta correctly
   - **Mitigation**: TypeScript enforces interface contract
   - **Validation**: Check translationMeta structure in useEffect

2. **Missing Guest Components**
   - **Risk**: Guest components not yet implemented when integrating
   - **Mitigation**: REQ-E04-008 through REQ-E04-013 must complete first
   - **Dependency**: Strictly enforce execution order

3. **Hook Not Available**
   - **Risk**: useGuestLanguage hook not implemented
   - **Mitigation**: REQ-E04-014 must complete first
   - **Fallback**: Component would crash without hook

### UI/UX Risks

1. **Header Crowding**
   - **Risk**: Too many elements in header (logo, title, language, counter)
   - **Mitigation**: Responsive design with mobile/desktop variants
   - **Testing**: Test on 320px mobile screens

2. **Banner Overload**
   - **Risk**: Multiple banners (translation + missing + toggle) feel cluttered
   - **Mitigation**: Only show relevant banners based on state
   - **Logic**: Only one banner at a time (translation XOR missing)

3. **Content Flash**
   - **Risk**: Content flashes when switching languages
   - **Mitigation**: Hook manages state smoothly, no full page reload
   - **Pattern**: Client-side state toggle (instant)

### Performance Risks

1. **Large Component File**
   - **Risk**: ItemDisplay.tsx becomes very large with all features
   - **Mitigation**: Consider extracting header to separate component
   - **Future**: Refactor if file exceeds 500 lines

2. **Conditional Rendering Overhead**
   - **Risk**: Many conditional checks on every render
   - **Mitigation**: React optimizes conditional rendering efficiently
   - **Impact**: Negligible for this complexity level

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Guest component implementation** - Handled by REQ-E04-008 through REQ-E04-012
2. ❌ **Hook implementation** - Handled by REQ-E04-014
3. ❌ **Server component updates** - Handled by REQ-E04-016
4. ❌ **Translation fetching** - Handled by server component and API
5. ❌ **Cookie management** - Handled by useGuestLanguage hook
6. ❌ **Language detection** - Handled by server component
7. ❌ **New translations** - Content comes from server component
8. ❌ **Analytics tracking** - Existing analytics continue to work
9. ❌ **Component refactoring** - Only add translation features, no restructuring
10. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Component Architecture

**Before Epic 4**:
```
Server Component (page.tsx)
  ↓ Fetch item data
  ↓ Pass item prop
Client Component (ItemDisplay.tsx)
  ↓ Render item content
```

**After Epic 4**:
```
Server Component (page.tsx)
  ↓ Detect language (URL, cookie, header)
  ↓ Fetch item + translations
  ↓ Pass item + translationMeta props
Client Component (ItemDisplay.tsx)
  ↓ useGuestLanguage hook (manage state)
  ↓ Render translation UI (switcher, banners, toggle)
  ↓ Display content (original or translated)
```

### Content Display Logic

**Key Concept**: Server component already returns translated content based on requested language.

```typescript
// API returns translated content in item object:
// If lang=fr: item.name is French, item.description is French

// Client component decision:
const displayContent = showOriginal
  ? item.originalContent // NOT AVAILABLE - need to refetch
  : item; // Already translated by server

// PROBLEM: We don't have originalContent in props
// SOLUTION: showOriginal triggers language change to original language
```

**Refined Approach**:
```typescript
// showOriginal doesn't switch content client-side
// Instead, it changes language preference to original language
// This triggers re-fetch with original language

const handleToggleOriginal = () => {
  if (showOriginal) {
    // User wants to see translation again
    setLanguage(translationMeta.requestedLanguage);
  } else {
    // User wants to see original
    setLanguage(translationMeta.originalLanguage);
  }
  toggleOriginal(); // Update showOriginal state for UI
};
```

**Updated Pattern**:
- `showOriginal` is UI state (which button shows)
- Actual content switch happens via `setLanguage()` which updates URL and triggers server re-fetch
- This aligns with useGuestLanguage hook design

### Banner Display Logic

**Mutually Exclusive Banners**:

| Scenario | TranslationBanner | MissingTranslationBanner |
|----------|-------------------|--------------------------|
| Viewing translated content | ✅ Show | ❌ Hide |
| Viewing fallback (unavailable) | ❌ Hide | ✅ Show |
| Viewing original | ❌ Hide | ❌ Hide |

**Logic**:
```typescript
const showTranslationBanner =
  translationMeta?.isTranslated &&
  !showOriginal &&
  !isShowingFallback;

const showMissingBanner =
  translationMeta?.isTranslated &&
  !showOriginal &&
  isShowingFallback;
```

### Responsive Design Strategy

**Desktop (≥640px)**:
- GuestLanguageSwitcher: Full dropdown
- Banners: Full width with padding
- ViewOriginalToggle: Full button text

**Mobile (<640px)**:
- LanguageIndicator: Compact display with flag
- Banners: Mobile-optimized padding
- ViewOriginalToggle: Compact button text or icon

**Breakpoint Classes**:
```typescript
// Desktop only
className="hidden sm:block"

// Mobile only
className="sm:hidden"

// Responsive spacing
className="px-4 sm:px-6"
```

### Header Layout

**Structure**:
```
┌────────────────────────────────────────────────────┐
│ [Logo] [Title + ID]    [Lang Switcher] [Visits]   │
└────────────────────────────────────────────────────┘
```

**Responsive**:
```
Mobile:
┌─────────────────────────────────────┐
│ [Logo] [Title]     [🇫🇷] [100]      │
└─────────────────────────────────────┘

Desktop:
┌──────────────────────────────────────────────────┐
│ [Logo] [Title + ID]    [▼ Français] [100 visits] │
└──────────────────────────────────────────────────┘
```

### Integration Pattern

**Complete Component Structure**:
```typescript
export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  // Existing state
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // NEW: Guest language state
  const {
    currentLanguage,
    showOriginal,
    setLanguage,
    toggleOriginal,
    isLoading: languageLoading,
    setAvailableLanguages,
  } = useGuestLanguage();

  // Initialize available languages
  useEffect(() => {
    if (translationMeta?.availableLanguages) {
      setAvailableLanguages(translationMeta.availableLanguages);
    }
  }, [translationMeta?.availableLanguages, setAvailableLanguages]);

  // Determine display state
  const isShowingFallback =
    translationMeta?.isTranslated &&
    !showOriginal &&
    translationMeta.requestedLanguage !== translationMeta.displayLanguage;

  // Existing effects (visit tracking, reactions)
  useEffect(() => { /* ... */ }, []);

  return (
    <div>
      {/* Header with language controls */}
      <header>
        {translationMeta && (
          <GuestLanguageSwitcher
            currentLanguage={currentLanguage}
            availableLanguages={translationMeta.availableLanguages}
            onLanguageChange={setLanguage}
          />
        )}
      </header>

      {/* Translation banners */}
      {translationMeta && !showOriginal && (
        <>
          {translationMeta.isTranslated && !isShowingFallback && (
            <TranslationBanner
              sourceLanguage={translationMeta.originalLanguage}
              onViewOriginal={toggleOriginal}
            />
          )}
          {isShowingFallback && (
            <MissingTranslationBanner
              requestedLanguage={translationMeta.requestedLanguage}
              fallbackLanguage={translationMeta.displayLanguage}
            />
          )}
        </>
      )}

      {/* View original toggle */}
      {translationMeta && translationMeta.isTranslated && (
        <ViewOriginalToggle
          isViewingOriginal={showOriginal}
          originalLanguage={translationMeta.originalLanguage}
          onToggle={toggleOriginal}
        />
      )}

      {/* Content sections (use item directly - already translated by server) */}
      <main>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        {/* Links, reactions, etc. */}
      </main>
    </div>
  );
}
```

### Testing Strategy

**Unit Tests** (to be created):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ItemDisplay from './ItemDisplay';

describe('ItemDisplay with translations', () => {
  const mockItem = {
    id: '123',
    publicId: 'abc123',
    name: 'Test Item',
    description: 'Test Description',
    links: [],
  };

  const mockTranslationMeta = {
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    availableLanguages: ['en', 'fr', 'es'],
    isTranslated: true,
    originalLanguage: 'en',
  };

  it('renders without translationMeta (backward compatibility)', () => {
    render(<ItemDisplay item={mockItem} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument(); // No language switcher
  });

  it('renders with translationMeta (shows language controls)', () => {
    render(<ItemDisplay item={mockItem} translationMeta={mockTranslationMeta} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    // Language controls should appear (exact query depends on component implementation)
  });

  it('shows TranslationBanner when viewing translation', () => {
    render(<ItemDisplay item={mockItem} translationMeta={mockTranslationMeta} />);
    expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
  });

  it('shows MissingTranslationBanner when fallback', () => {
    const fallbackMeta = {
      ...mockTranslationMeta,
      requestedLanguage: 'es',
      displayLanguage: 'en', // Fallback to English
    };
    render(<ItemDisplay item={mockItem} translationMeta={fallbackMeta} />);
    expect(screen.getByText(/translation not available/i)).toBeInTheDocument();
  });

  it('toggles between translation and original', () => {
    render(<ItemDisplay item={mockItem} translationMeta={mockTranslationMeta} />);

    const toggleButton = screen.getByRole('button', { name: /View.*original/i });
    fireEvent.click(toggleButton);

    // After toggle, button text should change
    expect(screen.getByRole('button', { name: /View translation/i })).toBeInTheDocument();
  });

  it('changes language when switcher used', () => {
    render(<ItemDisplay item={mockItem} translationMeta={mockTranslationMeta} />);

    // Simulate language change (exact interaction depends on GuestLanguageSwitcher)
    // This would trigger setLanguage() from useGuestLanguage hook
  });
});
```

**Integration Tests**:
- Full page flow: select language, view translation, toggle original
- Mobile responsive: verify compact UI on small screens
- Desktop responsive: verify full UI on large screens
- Existing features: verify reactions, visit tracking, links still work

**Manual Testing Checklist**:
- [ ] Component renders without translationMeta
- [ ] Component renders with translationMeta
- [ ] GuestLanguageSwitcher appears in header (desktop)
- [ ] LanguageIndicator appears in header (mobile)
- [ ] TranslationBanner appears when viewing translation
- [ ] MissingTranslationBanner appears when fallback
- [ ] ViewOriginalToggle appears when translation exists
- [ ] Clicking toggle switches between translation and original
- [ ] Clicking language switcher changes language
- [ ] Visit counter still works
- [ ] Reactions still work
- [ ] Links still work
- [ ] Mobile layout responsive (320px width)
- [ ] Desktop layout responsive (1024px+ width)

---

**Last Modified**: 2026-01-22 19:32
