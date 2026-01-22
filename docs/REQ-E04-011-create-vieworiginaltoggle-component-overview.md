# Implementation Breakdown: REQ-E04-011 - Create ViewOriginalToggle Component

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-011 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #11 |
| **Original Request Date** | 2026-01-22 16:45 |
| **Breakdown Created** | 2026-01-22 19:13 |
| **T-shirt Size** | S |
| **Estimated Effort** | 2-3 hours |
| **Status** | PENDING |

---

## Goals

Create a toggle button component that allows users to switch between viewing translated content and viewing original content. The button uses secondary button styling and displays different text/icons based on the current view state.

**Key Objectives**:
1. Toggle between translated content and original content
2. Use secondary button style (white background, dark border)
3. Display appropriate text based on state:
   - When viewing translated: "View in original ([Language])"
   - When viewing original: "View translation"
4. Include a swap/toggle icon to indicate switching functionality
5. Provide callback for parent component to handle state changes
6. Follow existing button patterns from ActionButtons component

---

## Implementation Plan

### 1. Create ViewOriginalToggle Component File

**File**: `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Approach**: Create a new React client component that follows existing secondary button patterns from ActionButtons component, with dynamic text and icon based on view state.

**Implementation Details**:

```typescript
'use client';

/**
 * ViewOriginalToggle Component
 *
 * Toggle button for switching between translated content and original content.
 * Uses secondary button styling consistent with dashboard action buttons.
 *
 * @example
 * ```tsx
 * <ViewOriginalToggle
 *   isViewingOriginal={false}
 *   originalLanguage="en"
 *   onToggle={() => setViewingOriginal(!viewingOriginal)}
 * />
 * ```
 *
 * @module components/guest/ViewOriginalToggle
 * @lastModified 2026-01-22
 */

import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ViewOriginalToggleProps {
  /** Whether currently viewing original content (true) or translated (false) */
  isViewingOriginal: boolean;
  /** Original language of the content */
  originalLanguage: SupportedLanguage;
  /** Callback when toggle button is clicked */
  onToggle: () => void;
  /** Optional CSS class */
  className?: string;
  /** Optional disabled state */
  disabled?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format language name for display
 */
function formatLanguageName(lang: SupportedLanguage): string {
  const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    nl: 'Dutch',
    it: 'Italian'
  };
  return languageNames[lang];
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Toggle button for switching between translated and original content.
 * Uses secondary button styling with outline.
 */
export function ViewOriginalToggle({
  isViewingOriginal,
  originalLanguage,
  onToggle,
  className,
  disabled = false,
}: ViewOriginalToggleProps) {
  // Determine button text based on current state
  const buttonText = isViewingOriginal
    ? 'View translation'
    : `View in original (${formatLanguageName(originalLanguage)})`;

  // ARIA label for screen readers
  const ariaLabel = isViewingOriginal
    ? 'Switch to translated version'
    : `Switch to original ${formatLanguageName(originalLanguage)} version`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isViewingOriginal}
      className={cn(
        // Base classes (from ActionButtons pattern)
        'flex items-center justify-center gap-2',
        'min-h-[48px] px-6 py-3.5',
        'rounded-lg font-medium text-base',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#222222] focus-visible:ring-offset-2',

        // Secondary variant classes (outline style)
        'bg-white border border-[#222222] text-[#222222]',
        'hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]',

        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',

        className
      )}
    >
      <Languages className="w-5 h-5" aria-hidden="true" />
      <span>{buttonText}</span>
    </button>
  );
}

export default ViewOriginalToggle;
```

**Steps**:
1. Create directory: `/src/components/guest/ViewOriginalToggle/`
2. Create component file: `ViewOriginalToggle.tsx`
3. Add type definitions for props interface
4. Implement button structure following ActionButtons secondary variant pattern:
   - White background with dark border
   - 48px minimum height for touch targets (WCAG 2.5.5)
   - Hover/active scale effects
   - Focus ring for keyboard navigation
5. Use `Languages` icon from lucide-react (represents translation/swap)
6. Implement dynamic text based on `isViewingOriginal` state
7. Add `aria-pressed` attribute to indicate toggle state
8. Use `cn()` utility for className merging (existing pattern)

### 2. Create Barrel Export File

**File**: `/src/components/guest/ViewOriginalToggle/index.ts`

**Implementation**:
```typescript
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';
```

**Steps**:
1. Create barrel export file in component directory
2. Export component and its prop types for external use

### 3. Add Component Integration Example

**Documentation**: Add usage example to component file

**Example**:
```typescript
// In a guest item page or client component:
import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle';
import { useState } from 'react';

function GuestItemPage({ item, translationMeta }) {
  const [isViewingOriginal, setIsViewingOriginal] = useState(false);

  return (
    <div>
      {/* Translation banner or missing translation banner */}

      {/* Toggle button */}
      <ViewOriginalToggle
        isViewingOriginal={isViewingOriginal}
        originalLanguage={translationMeta.originalLanguage}
        onToggle={() => setIsViewingOriginal(!isViewingOriginal)}
        className="mb-6"
      />

      {/* Content */}
      <div>
        {isViewingOriginal ? item.originalContent : item.translatedContent}
      </div>
    </div>
  );
}
```

### 4. Styling Alignment with ActionButtons

**Consistency Requirements**:
- Use exact same classes as ActionButtons secondary variant
- Match padding, min-height, border radius
- Match hover/active scale effects
- Match focus ring styling
- Ensure 48px touch target for WCAG compliance

**Reference Pattern** (from ActionButtons.tsx:68-83):
```typescript
// Base classes for all buttons
const baseClasses = `
  flex items-center justify-center gap-2
  min-h-[48px] px-6 py-3.5
  rounded-lg font-medium text-base
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#222222] focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// Secondary variant classes
const variantClasses = `
  bg-white border border-[#222222] text-[#222222]
  hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]
`;
```

### 5. Icon Selection Rationale

**Icon**: `Languages` from lucide-react

**Why Languages Icon**:
- Represents translation/language switching functionality
- More specific than generic swap/refresh icons
- Consistent with language-related operations
- Clear visual metaphor for bilingual content

**Alternative Icons Considered**:
- `ArrowLeftRight`: Too generic (could mean any swap)
- `RefreshCw`: Implies reload/refresh, not content switch
- `Globe`: Already used in TranslationBanner
- `Languages`: ✅ Best fit for translation toggle

### 6. Testing Considerations

**Component Testing**:
- Button renders with correct text when viewing translated
- Button renders with correct text when viewing original
- Correct secondary button styling applied
- Languages icon renders
- onClick callback triggered on click
- `aria-pressed` attribute toggles correctly
- Disabled state works correctly
- Focus ring visible on keyboard focus
- Touch target meets 48px minimum
- Hover and active states work

---

## Authorized Files and Functions for Modification

### New Files to Create

1. **`/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`**
   - New client component file
   - Exports: `ViewOriginalToggle` component, `ViewOriginalToggleProps` interface

2. **`/src/components/guest/ViewOriginalToggle/index.ts`**
   - New barrel export file
   - Re-exports component and types

### Files to Reference (Read-Only)

1. **`/src/types/l10n.ts`**
   - Reference: `SupportedLanguage` type
   - Usage: Type for `originalLanguage` prop

2. **`/src/lib/utils.ts`**
   - Reference: `cn()` function
   - Usage: className merging utility

3. **`/src/components/SimpleDashboard/ActionButtons.tsx`**
   - Reference: Secondary button styling pattern (lines 68-83)
   - Usage: Ensure consistent button appearance across app

### Dependencies

**NPM Packages**:
- `lucide-react` (already installed) - Languages icon
- `react` (already installed) - Component framework
- `@/lib/utils` (already exists) - cn() utility
- `@/types` (from REQ-E04-001) - SupportedLanguage type

---

## Dependencies

### Depends On
- **REQ-E04-001**: Create Localization Types File
  - Requires: `SupportedLanguage` type definition
  - Reason: Component prop type uses this type

### Blocks
- **REQ-E04-013**: Create Barrel Exports for Guest Components
  - This component must be completed before barrel exports can include it

- **REQ-E04-017**: Update ItemDisplay Component (Client Component)
  - ItemDisplay integration requires ViewOriginalToggle to exist

### Parallel Safety
✅ **Can be implemented in parallel with**:
- REQ-E04-009 (TranslationBanner) - Different component, no conflicts
- REQ-E04-010 (MissingTranslationBanner) - Different component, no conflicts
- REQ-E04-012 (LanguageIndicator) - Different component, no conflicts
- REQ-E04-008 (GuestLanguageSwitcher) - Different component, no conflicts

---

## Risks and Considerations

### Technical Risks

1. **Language Name Formatting**
   - **Risk**: Hardcoded language names don't support runtime localization
   - **Mitigation**: This is intentional - button shows language name in English for clarity
   - **Consistency**: Matches TranslationBanner and MissingTranslationBanner approach

2. **Button Text Length**
   - **Risk**: "View in original (Language)" text may be long in some languages
   - **Mitigation**: Use responsive width, allow natural wrapping if needed
   - **Mobile**: Test with longest language name (English/Spanish) on 320px width

3. **State Management**
   - **Risk**: Parent component responsible for managing isViewingOriginal state
   - **Mitigation**: Clear documentation with state management examples
   - **Contract**: Component is controlled, does not manage its own state

### Integration Risks

1. **Coordination with Banners**
   - **Risk**: Toggle state must coordinate with banner display logic
   - **Mitigation**: Document integration pattern showing both components
   - **Example**: When viewing original, show TranslationBanner; when viewing fallback, show MissingTranslationBanner

2. **Content Switching Logic**
   - **Risk**: Parent must handle actual content switching
   - **Mitigation**: Clear callback documentation and examples
   - **Note**: This component only triggers the toggle, doesn't switch content itself

### Accessibility Risks

1. **Toggle State Communication**
   - **Risk**: Screen readers may not announce toggle state clearly
   - **Mitigation**: Use `aria-pressed` attribute to indicate toggle state
   - **Testing**: Verify with NVDA/VoiceOver that state is announced

2. **Dynamic Text Changes**
   - **Risk**: Button text changes may not be announced to screen readers
   - **Mitigation**: `aria-label` provides clear context about action regardless of visual text
   - **Testing**: Verify screen reader announces action, not just visual text

### UI/UX Risks

1. **Button Placement**
   - **Risk**: Unclear where button should appear in page layout
   - **Mitigation**: Document recommended placement (after banners, before content)
   - **Note**: Parent component decides placement via className

2. **User Confusion**
   - **Risk**: Users may not understand what "View in original" means
   - **Mitigation**: Include language name in button text: "View in original (English)"
   - **Clarity**: Button text explicitly states what will happen on click

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Content switching logic** - Parent component handles content display
2. ❌ **State management** - Parent component manages isViewingOriginal state
3. ❌ **Translation fetching** - Handled by REQ-E04-004 (Translation Fetch Utilities)
4. ❌ **Language detection** - Handled by REQ-E04-002 (Guest Language Utility Module)
5. ❌ **Integration with ItemDisplay** - Handled by REQ-E04-017 (Update ItemDisplay Component)
6. ❌ **Banner components** - Separate components in REQ-E04-009, REQ-E04-010
7. ❌ **Language switcher dropdown** - Different component in REQ-E04-008
8. ❌ **Internationalization of button text** - Button intentionally shows in English for all users
9. ❌ **Analytics tracking** - Can be added later if needed
10. ❌ **Loading states** - Parent handles async operations
11. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Design Pattern Rationale

This component follows the **Controlled Component** pattern:
- Parent component controls state (isViewingOriginal)
- Parent component handles state changes via callback (onToggle)
- Component itself is stateless and purely presentational
- Component only triggers action, does not perform action

### Secondary Button Style Rationale

The secondary button style is appropriate because:
- Not the primary action on the page (primary = navigation, core functionality)
- Auxiliary action that enhances experience but isn't required
- Consistent with other secondary actions (ActionButtons.tsx)
- Visual hierarchy: Important but not primary

### Languages Icon Choice

The `Languages` icon (lucide-react) is appropriate because:
- Represents translation/language switching functionality
- More semantically correct than generic swap icons
- Distinct from Globe icon (used in TranslationBanner)
- Clear visual metaphor for bilingual content toggle

### Dynamic Button Text

**Button Text States**:

| State | Button Text | User Action |
|-------|-------------|-------------|
| Viewing Translated | "View in original (English)" | Switch to original language |
| Viewing Original | "View translation" | Switch to translated language |

**Rationale**:
- Button text describes the **action** that will occur on click
- Include language name for clarity: "View in original (English)"
- Omit language name when switching to translation (user already knows target language)

### Accessibility Approach

**ARIA Attributes**:
- `aria-label`: Provides clear context for screen readers
- `aria-pressed`: Indicates toggle state (true when viewing original)
- `type="button"`: Explicit button type for semantic HTML

**Keyboard Navigation**:
- Native `<button>` element ensures keyboard accessibility
- Focus ring visible for keyboard users (focus-visible:ring-2)
- Enter/Space activate button (native behavior)

**Touch Targets**:
- Minimum 48px height (WCAG 2.5.5 compliance)
- Adequate padding for touch interaction
- Hover/active feedback for touch devices

### Button Styling Consistency

**Matches ActionButtons Secondary Variant**:
```typescript
// Base structure (48px touch target)
min-h-[48px] px-6 py-3.5

// Secondary appearance (outline style)
bg-white border border-[#222222] text-[#222222]

// Interactive states
hover:scale-[1.02] hover:bg-[#F7F7F7]
active:scale-[0.98]

// Focus ring (keyboard users)
focus-visible:ring-2 focus-visible:ring-[#222222]

// Disabled state
disabled:opacity-50 disabled:cursor-not-allowed
```

### Integration Pattern

**Complete Usage Example**:
```typescript
// In guest item page component:
import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { useState } from 'react';

function GuestItemPage({ item, translationMeta }) {
  const [isViewingOriginal, setIsViewingOriginal] = useState(false);

  const requestedLang = translationMeta.requestedLanguage;
  const originalLang = translationMeta.originalLanguage;
  const isTranslated = translationMeta.isTranslated;
  const isShowingFallback = requestedLang !== translationMeta.displayLanguage;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Show appropriate banner */}
      {!isViewingOriginal && isTranslated && !isShowingFallback && (
        <TranslationBanner
          sourceLanguage={originalLang}
          onViewOriginal={() => setIsViewingOriginal(true)}
          className="mb-4"
        />
      )}

      {!isViewingOriginal && isShowingFallback && (
        <MissingTranslationBanner
          requestedLanguage={requestedLang}
          fallbackLanguage={originalLang}
          className="mb-4"
        />
      )}

      {/* Toggle button (always visible when translation exists) */}
      {isTranslated && (
        <ViewOriginalToggle
          isViewingOriginal={isViewingOriginal}
          originalLanguage={originalLang}
          onToggle={() => setIsViewingOriginal(!isViewingOriginal)}
          className="mb-6"
        />
      )}

      {/* Content */}
      <div>
        <h1>{isViewingOriginal ? item.originalName : item.name}</h1>
        <p>{isViewingOriginal ? item.originalDescription : item.description}</p>
        {/* ... */}
      </div>
    </div>
  );
}
```

### Responsive Considerations

**Mobile (320px - 767px)**:
- Button takes full width if needed (parent applies width)
- Text wraps naturally if too long
- Touch target remains 48px minimum
- Icon and text maintain gap (gap-2)

**Tablet/Desktop (768px+)**:
- Button can be inline with other elements
- Fixed/auto width based on content
- Maintains all interactive states

**Recommended CSS** (applied by parent):
```typescript
// Mobile: Full width
<ViewOriginalToggle className="w-full sm:w-auto" />

// Or fixed width
<ViewOriginalToggle className="min-w-[280px]" />
```

### Testing Strategy

**Unit Tests** (to be created):
```typescript
describe('ViewOriginalToggle', () => {
  it('renders "View in original" text when viewing translated', () => {
    render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="en"
        onToggle={jest.fn()}
      />
    );
    expect(screen.getByText(/View in original \(English\)/i)).toBeInTheDocument();
  });

  it('renders "View translation" text when viewing original', () => {
    render(
      <ViewOriginalToggle
        isViewingOriginal={true}
        originalLanguage="fr"
        onToggle={jest.fn()}
      />
    );
    expect(screen.getByText(/View translation/i)).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const mockToggle = jest.fn();
    render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="es"
        onToggle={mockToggle}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct secondary button styling', () => {
    const { container } = render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="de"
        onToggle={jest.fn()}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('border-[#222222]');
  });

  it('includes Languages icon', () => {
    const { container } = render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="nl"
        onToggle={jest.fn()}
      />
    );
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="it"
        onToggle={jest.fn()}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates aria-pressed when viewing original', () => {
    render(
      <ViewOriginalToggle
        isViewingOriginal={true}
        originalLanguage="en"
        onToggle={jest.fn()}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <ViewOriginalToggle
        isViewingOriginal={false}
        originalLanguage="fr"
        onToggle={jest.fn()}
        disabled={true}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('formats all language names correctly', () => {
    const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
    const expectedNames = ['English', 'French', 'Spanish', 'German', 'Dutch', 'Italian'];

    languages.forEach((lang, index) => {
      const { unmount } = render(
        <ViewOriginalToggle
          isViewingOriginal={false}
          originalLanguage={lang}
          onToggle={jest.fn()}
        />
      );
      expect(screen.getByText(new RegExp(expectedNames[index], 'i'))).toBeInTheDocument();
      unmount();
    });
  });
});
```

**Manual Testing Checklist**:
- [ ] Button displays correct text when viewing translated content
- [ ] Button displays correct text when viewing original content
- [ ] Languages icon renders correctly
- [ ] Button uses secondary button styling (white bg, dark border)
- [ ] Hover effect works (scale up, light gray background)
- [ ] Active effect works (scale down)
- [ ] Focus ring visible on keyboard focus
- [ ] Enter key activates button
- [ ] Space key activates button
- [ ] Screen reader announces button text correctly
- [ ] Screen reader announces toggle state (aria-pressed)
- [ ] Touch target is at least 48px height
- [ ] Button responds correctly to clicks/taps
- [ ] Disabled state works correctly
- [ ] Button text wraps naturally on narrow screens
- [ ] Custom className prop works correctly
- [ ] All 6 languages display correctly in button text

---

**Last Modified**: 2026-01-22 19:13
