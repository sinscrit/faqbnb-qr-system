# Implementation Breakdown: REQ-E04-009 - Create TranslationBanner Component

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-009 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #9 |
| **Original Request Date** | 2026-01-22 16:35 |
| **Breakdown Created** | 2026-01-22 19:08 |
| **T-shirt Size** | S |
| **Estimated Effort** | 2-3 hours |
| **Status** | PENDING |

---

## Goals

Create a banner component that displays when content is being shown in a translated language. The banner provides context about the translation and offers a link to view the original content.

**Key Objectives**:
1. Display a light blue informational banner (#E3F2FD background)
2. Show text indicating source language: "Translated from [Language]"
3. Include a "View original" link/button to switch to source content
4. Display a globe icon for visual context
5. Remain visible (non-dismissible) to maintain translation context
6. Only render when viewing translated content (not when viewing original)

---

## Implementation Plan

### 1. Create TranslationBanner Component File

**File**: `/src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Approach**: Create a new React client component that follows existing banner patterns from the codebase (SessionRecoveryBanner) but with simpler non-dismissible semantics.

**Implementation Details**:

```typescript
'use client';

/**
 * TranslationBanner Component
 *
 * Displays when content is being shown in a translated language.
 * Provides context about the translation and offers ability to view original.
 *
 * @example
 * ```tsx
 * <TranslationBanner
 *   sourceLanguage="en"
 *   onViewOriginal={() => setShowOriginal(true)}
 * />
 * ```
 *
 * @module components/guest/TranslationBanner
 * @lastModified 2026-01-22
 */

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface TranslationBannerProps {
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Callback when "View original" link/button is clicked */
  onViewOriginal: () => void;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Translation banner indicating content is translated with link to view original.
 * Non-dismissible to maintain translation context awareness.
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  className,
}: TranslationBannerProps) {
  // Format source language name for display
  const formatLanguageName = (lang: SupportedLanguage): string => {
    const languageNames: Record<SupportedLanguage, string> = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      nl: 'Dutch',
      it: 'Italian'
    };
    return languageNames[lang];
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-between gap-4 p-4',
        'bg-[#E3F2FD] border border-blue-200 rounded-lg',
        'shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Globe Icon */}
        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
          <Globe className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </div>

        {/* Message */}
        <p className="text-sm text-blue-900">
          Translated from <strong>{formatLanguageName(sourceLanguage)}</strong>
        </p>
      </div>

      {/* View Original Link */}
      <button
        type="button"
        onClick={onViewOriginal}
        className={cn(
          'flex-shrink-0',
          'text-sm font-medium text-blue-700 hover:text-blue-900',
          'underline hover:no-underline',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1'
        )}
      >
        View original
      </button>
    </div>
  );
}

export default TranslationBanner;
```

**Steps**:
1. Create directory: `/src/components/guest/TranslationBanner/`
2. Create component file: `TranslationBanner.tsx`
3. Add type definitions for props interface
4. Implement banner structure with:
   - Light blue background (#E3F2FD)
   - Blue border (border-blue-200)
   - Globe icon from lucide-react
   - "Translated from [Language]" text
   - "View original" link/button
5. Use `cn()` utility for className merging (existing pattern)
6. Add ARIA attributes for accessibility (role="status", aria-live="polite")
7. Implement inline language name formatting function
8. Style "View original" as an accessible button with proper focus states

### 2. Create Barrel Export File

**File**: `/src/components/guest/TranslationBanner/index.ts`

**Implementation**:
```typescript
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';
```

**Steps**:
1. Create barrel export file in component directory
2. Export component and its prop types for external use

### 3. Add Component Integration Example

**Documentation**: Add usage example to component file

**Example**:
```typescript
// In a guest item page or client component:
import { TranslationBanner } from '@/components/guest/TranslationBanner';

function GuestItemPage({ item, translationMeta }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div>
      {translationMeta.isTranslated && !showOriginal && (
        <TranslationBanner
          sourceLanguage={translationMeta.originalLanguage}
          onViewOriginal={() => setShowOriginal(true)}
        />
      )}
      {/* Item content... */}
    </div>
  );
}
```

### 4. Responsive Design Considerations

**Mobile Optimization**:
- Use flexbox with gap spacing for icon and text
- Ensure touch-friendly button target (minimum 44x44px on mobile)
- Stack vertically on very small screens if needed (sm: breakpoint)
- Ensure text doesn't wrap awkwardly

**Implementation**:
```typescript
// Responsive layout adjustments:
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4">
  {/* Content... */}
</div>
```

### 5. Testing Considerations

**Component Testing**:
- Component renders with correct source language
- "View original" button triggers callback
- Correct background color (#E3F2FD)
- Globe icon renders
- ARIA attributes present for accessibility
- Keyboard navigation works (focus states, Enter/Space activation)
- Responsive layout works on mobile

---

## Authorized Files and Functions for Modification

### New Files to Create

1. **`/src/components/guest/TranslationBanner/TranslationBanner.tsx`**
   - New client component file
   - Exports: `TranslationBanner` component, `TranslationBannerProps` interface

2. **`/src/components/guest/TranslationBanner/index.ts`**
   - New barrel export file
   - Re-exports component and types

### Files to Reference (Read-Only)

1. **`/src/types/l10n.ts`**
   - Reference: `SupportedLanguage` type
   - Usage: Type for `sourceLanguage` prop

2. **`/src/lib/utils.ts`**
   - Reference: `cn()` function
   - Usage: className merging utility

3. **`/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`**
   - Reference: Banner pattern, structure, ARIA attributes
   - Usage: Establish consistent banner design patterns

### Dependencies

**NPM Packages**:
- `lucide-react` (already installed) - Globe icon
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
  - ItemDisplay integration requires TranslationBanner to exist

### Parallel Safety
✅ **Can be implemented in parallel with**:
- REQ-E04-010 (MissingTranslationBanner) - Different component, no conflicts
- REQ-E04-011 (ViewOriginalToggle) - Different component, no conflicts
- REQ-E04-012 (LanguageIndicator) - Different component, no conflicts
- REQ-E04-008 (GuestLanguageSwitcher) - Different component, no conflicts

---

## Risks and Considerations

### Technical Risks

1. **Color Consistency**
   - **Risk**: #E3F2FD color may not match existing design system
   - **Mitigation**: Use exact hex value specified in requirements; document rationale if changed

2. **Language Name Formatting**
   - **Risk**: Hardcoded language names don't support runtime localization
   - **Mitigation**: This is intentional - banner shows source language name in English for clarity
   - **Future**: Could use translation utilities from REQ-E04-007 if needed

3. **Non-Dismissible Banner**
   - **Risk**: Banner may feel intrusive to some users
   - **Mitigation**: Design specifies non-dismissible to maintain translation context awareness
   - **Note**: This is an intentional product decision per requirements

### Integration Risks

1. **Parent Component Responsibility**
   - **Risk**: Parent must correctly control when banner appears
   - **Mitigation**: Clear documentation with integration examples
   - **Contract**: Parent must only render when `isTranslated === true`

2. **Callback Handling**
   - **Risk**: `onViewOriginal` callback may not be properly implemented
   - **Mitigation**: Type safety enforces callback presence; document expected behavior

### Accessibility Risks

1. **Screen Reader Announcements**
   - **Risk**: Banner change may not be announced to screen readers
   - **Mitigation**: Use `role="status"` and `aria-live="polite"` for announcements
   - **Testing**: Verify with NVDA/VoiceOver

2. **Keyboard Navigation**
   - **Risk**: "View original" button may not be keyboard accessible
   - **Mitigation**: Use native `<button>` element with proper focus styles
   - **Testing**: Verify Tab navigation and Enter/Space activation

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Translation fetching logic** - Handled by REQ-E04-004 (Translation Fetch Utilities)
2. ❌ **Language detection** - Handled by REQ-E04-002 (Guest Language Utility Module)
3. ❌ **Integration with ItemDisplay** - Handled by REQ-E04-017 (Update ItemDisplay Component)
4. ❌ **Missing translation banner** - Different component in REQ-E04-010
5. ❌ **Language switcher dropdown** - Different component in REQ-E04-008
6. ❌ **Internationalization of banner text** - Banner intentionally shows in English for all users
7. ❌ **Analytics tracking** - Can be added later if needed
8. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Design Pattern Rationale

This component follows the **Controlled Component** pattern:
- Parent component controls visibility (only render when `isTranslated === true`)
- Parent component handles state changes via callback (`onViewOriginal`)
- Component itself is stateless and purely presentational

### Color Choice

The light blue background (#E3F2FD) is Material Design's blue-50 color. This choice:
- Provides clear visual distinction from content
- Uses a familiar color (blue) associated with information/context
- Maintains sufficient contrast for text readability
- Differentiates from warning/error colors (yellow/red)

### Non-Dismissible Rationale

The banner is intentionally **non-dismissible** because:
- Translation context is always relevant when viewing translated content
- Users should remain aware they're viewing translated content
- Prevents confusion about why original language differs from displayed language
- Design priority: transparency over minimalism

### Globe Icon Choice

The Globe icon (lucide-react) is appropriate because:
- Universally recognized symbol for language/internationalization
- Complements the translation context message
- Consistent with existing icon library usage in codebase
- Accessible when combined with text label

### Accessibility Approach

**ARIA Attributes**:
- `role="status"`: Identifies banner as status message (not alert)
- `aria-live="polite"`: Announces changes without interrupting user
- Button has implicit `role="button"` and keyboard accessibility

**Focus Management**:
- Focus ring on "View original" button for keyboard users
- Sufficient color contrast for all text elements
- Touch target sizing meets WCAG AAA guidelines (44x44px minimum)

### Mobile Responsiveness

**Breakpoint Strategy**:
- Default (mobile): Flex column layout with smaller gaps
- sm+ (tablet/desktop): Flex row layout with space-between
- Button remains easily tappable on all screen sizes

**Example**:
```typescript
// Mobile: Stack vertically
<div className="flex flex-col gap-3">
  <div>{/* Icon + Text */}</div>
  <button>{/* View original */}</button>
</div>

// Desktop: Horizontal layout
<div className="sm:flex-row sm:justify-between">
  <div>{/* Icon + Text */}</div>
  <button>{/* View original */}</button>
</div>
```

### Integration Pattern

**Typical Usage**:
```typescript
// In guest item page component:
function GuestItemPage({ item, translationMeta }) {
  const [viewMode, setViewMode] = useState<'translated' | 'original'>('translated');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Show banner only when viewing translation */}
      {translationMeta.isTranslated && viewMode === 'translated' && (
        <TranslationBanner
          sourceLanguage={translationMeta.originalLanguage}
          onViewOriginal={() => setViewMode('original')}
          className="mb-6"
        />
      )}

      {/* Item content */}
      <div>
        {viewMode === 'translated' ? item.translatedContent : item.originalContent}
      </div>
    </div>
  );
}
```

### Language Name Mapping

The inline language name formatter uses English names intentionally:
- **Reason**: Translation banner serves as meta-information about content
- **User Base**: Guests viewing translated content likely understand some English
- **Simplicity**: Avoids circular dependency on translation system for UI chrome
- **Consistency**: Source language name should be understood by all users

**Mapping**:
```typescript
const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  nl: 'Dutch',
  it: 'Italian'
};
```

**Alternative Approach** (for future consideration):
If product decides to show native language names:
```typescript
const nativeLanguageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  it: 'Italiano'
};
```

### Testing Strategy

**Unit Tests** (to be created):
```typescript
describe('TranslationBanner', () => {
  it('renders with correct source language', () => {
    render(<TranslationBanner sourceLanguage="fr" onViewOriginal={jest.fn()} />);
    expect(screen.getByText(/Translated from French/i)).toBeInTheDocument();
  });

  it('calls onViewOriginal when button clicked', () => {
    const mockCallback = jest.fn();
    render(<TranslationBanner sourceLanguage="es" onViewOriginal={mockCallback} />);

    fireEvent.click(screen.getByRole('button', { name: /View original/i }));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('has correct background color', () => {
    const { container } = render(<TranslationBanner sourceLanguage="de" onViewOriginal={jest.fn()} />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-[#E3F2FD]');
  });

  it('includes globe icon', () => {
    const { container } = render(<TranslationBanner sourceLanguage="it" onViewOriginal={jest.fn()} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(<TranslationBanner sourceLanguage="nl" onViewOriginal={jest.fn()} />);
    const banner = container.firstChild;
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
```

**Manual Testing Checklist**:
- [ ] Banner displays with correct light blue background
- [ ] Globe icon renders correctly
- [ ] Source language name displays correctly for all 6 languages
- [ ] "View original" button is clickable
- [ ] Keyboard navigation works (Tab to button, Enter/Space to activate)
- [ ] Focus ring visible on button focus
- [ ] Screen reader announces banner content
- [ ] Responsive layout works on mobile (320px width)
- [ ] Responsive layout works on tablet (768px width)
- [ ] Responsive layout works on desktop (1024px+ width)
- [ ] Custom className prop works correctly

---

**Last Modified**: 2026-01-22 19:08
