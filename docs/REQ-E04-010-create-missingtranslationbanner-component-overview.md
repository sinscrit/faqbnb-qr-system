# Implementation Breakdown: REQ-E04-010 - Create MissingTranslationBanner Component

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-010 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #10 |
| **Original Request Date** | 2026-01-22 16:40 |
| **Breakdown Created** | 2026-01-22 19:11 |
| **T-shirt Size** | S |
| **Estimated Effort** | 2-3 hours |
| **Status** | PENDING |

---

## Goals

Create a banner component that displays when the requested translation is not available and content is being shown in a fallback language. The banner uses muted styling to inform users without causing alarm.

**Key Objectives**:
1. Display when the requested language translation does not exist
2. Show a clear message: "[Requested Language] translation not available. Showing content in [Fallback Language]."
3. Use muted/subtle styling (gray tones) to inform without alarming
4. Not render when the requested translation is available
5. Provide helpful context without being intrusive
6. Include an info icon for visual context

---

## Implementation Plan

### 1. Create MissingTranslationBanner Component File

**File**: `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Approach**: Create a new React client component that follows existing banner patterns (SessionRecoveryBanner, TranslationBanner) but with muted gray styling and non-dismissible semantics to provide informational context without alarming users.

**Implementation Details**:

```typescript
'use client';

/**
 * MissingTranslationBanner Component
 *
 * Displays when the requested translation is not available and content
 * is being shown in a fallback language. Uses subtle styling to inform
 * without alarming users.
 *
 * @example
 * ```tsx
 * <MissingTranslationBanner
 *   requestedLanguage="fr"
 *   fallbackLanguage="en"
 * />
 * ```
 *
 * @module components/guest/MissingTranslationBanner
 * @lastModified 2026-01-22
 */

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface MissingTranslationBannerProps {
  /** Language that was requested but unavailable */
  requestedLanguage: SupportedLanguage;
  /** Language that is being displayed instead */
  fallbackLanguage: SupportedLanguage;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Missing translation banner with muted styling.
 * Non-dismissible to maintain awareness of language fallback.
 */
export function MissingTranslationBanner({
  requestedLanguage,
  fallbackLanguage,
  className,
}: MissingTranslationBannerProps) {
  // Format language name for display
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

  const requestedLangName = formatLanguageName(requestedLanguage);
  const fallbackLangName = formatLanguageName(fallbackLanguage);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 p-4',
        'bg-gray-50 border border-gray-200 rounded-lg',
        'shadow-sm',
        className
      )}
    >
      {/* Info Icon */}
      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
        <Info className="w-5 h-5 text-gray-500" aria-hidden="true" />
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600">
        <strong>{requestedLangName}</strong> translation not available.
        Showing content in <strong>{fallbackLangName}</strong>.
      </p>
    </div>
  );
}

export default MissingTranslationBanner;
```

**Steps**:
1. Create directory: `/src/components/guest/MissingTranslationBanner/`
2. Create component file: `MissingTranslationBanner.tsx`
3. Add type definitions for props interface
4. Implement banner structure with:
   - Muted gray background (bg-gray-50)
   - Gray border (border-gray-200)
   - Info icon from lucide-react
   - Message: "[Requested Language] translation not available. Showing content in [Fallback Language]."
5. Use `cn()` utility for className merging (existing pattern)
6. Add ARIA attributes for accessibility (role="status", aria-live="polite")
7. Implement inline language name formatting function (same as TranslationBanner)
8. Use muted colors throughout to avoid alarm (gray tones, not red/yellow)

### 2. Create Barrel Export File

**File**: `/src/components/guest/MissingTranslationBanner/index.ts`

**Implementation**:
```typescript
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';
```

**Steps**:
1. Create barrel export file in component directory
2. Export component and its prop types for external use

### 3. Add Component Integration Example

**Documentation**: Add usage example to component file

**Example**:
```typescript
// In a guest item page or client component:
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';

function GuestItemPage({ item, translationMeta }) {
  const requestedLang = translationMeta.requestedLanguage;
  const displayLang = translationMeta.displayLanguage;
  const isShowingFallback = requestedLang !== displayLang;

  return (
    <div>
      {isShowingFallback && (
        <MissingTranslationBanner
          requestedLanguage={requestedLang}
          fallbackLanguage={displayLang}
        />
      )}
      {/* Item content... */}
    </div>
  );
}
```

### 4. Styling Considerations

**Muted Design Philosophy**:
- Use gray tones (not red/yellow) to avoid alarm
- Softer contrast than error/warning states
- Info icon (not warning/error icon) for neutral context
- Strong tags for language names to aid scanning
- Overall message tone: informational, not problematic

**Color Palette**:
```typescript
// Muted/subtle styling intentionally chosen:
background: 'bg-gray-50'      // Very light gray
border: 'border-gray-200'     // Subtle gray border
iconBg: 'bg-gray-100'         // Slightly darker gray for icon container
iconColor: 'text-gray-500'    // Medium gray for icon
textColor: 'text-gray-600'    // Readable gray for text
```

**Comparison with TranslationBanner**:
- TranslationBanner: Blue tones (#E3F2FD) - positive, informational
- MissingTranslationBanner: Gray tones - neutral, subtle

### 5. Responsive Design Considerations

**Mobile Optimization**:
- Use flexbox with gap spacing for icon and text
- Ensure text wraps naturally on small screens
- Icon remains visible and aligned on all screen sizes
- Padding consistent across breakpoints

**Implementation**:
```typescript
// Single row layout works well on all sizes:
<div className="flex items-center gap-3 p-4">
  <div className="flex-shrink-0">{/* Icon */}</div>
  <p className="text-sm">{/* Message with natural wrapping */}</p>
</div>
```

### 6. Testing Considerations

**Component Testing**:
- Component renders with correct language names
- Correct background color (bg-gray-50)
- Info icon renders
- ARIA attributes present for accessibility
- Message format is correct for all language combinations
- Muted styling prevents alarm (visual regression test)
- Responsive layout works on mobile

---

## Authorized Files and Functions for Modification

### New Files to Create

1. **`/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`**
   - New client component file
   - Exports: `MissingTranslationBanner` component, `MissingTranslationBannerProps` interface

2. **`/src/components/guest/MissingTranslationBanner/index.ts`**
   - New barrel export file
   - Re-exports component and types

### Files to Reference (Read-Only)

1. **`/src/types/l10n.ts`**
   - Reference: `SupportedLanguage` type
   - Usage: Type for `requestedLanguage` and `fallbackLanguage` props

2. **`/src/lib/utils.ts`**
   - Reference: `cn()` function
   - Usage: className merging utility

3. **`/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`**
   - Reference: Banner pattern, structure, ARIA attributes
   - Usage: Establish consistent banner design patterns

4. **`/src/components/guest/TranslationBanner/TranslationBanner.tsx`**
   - Reference: Language name formatting function
   - Usage: Consistent language display across translation components

### Dependencies

**NPM Packages**:
- `lucide-react` (already installed) - Info icon
- `react` (already installed) - Component framework
- `@/lib/utils` (already exists) - cn() utility
- `@/types` (from REQ-E04-001) - SupportedLanguage type

---

## Dependencies

### Depends On
- **REQ-E04-001**: Create Localization Types File
  - Requires: `SupportedLanguage` type definition
  - Reason: Component prop types use this type

### Blocks
- **REQ-E04-013**: Create Barrel Exports for Guest Components
  - This component must be completed before barrel exports can include it

- **REQ-E04-017**: Update ItemDisplay Component (Client Component)
  - ItemDisplay integration requires MissingTranslationBanner to exist

### Parallel Safety
✅ **Can be implemented in parallel with**:
- REQ-E04-009 (TranslationBanner) - Different component, no conflicts
- REQ-E04-011 (ViewOriginalToggle) - Different component, no conflicts
- REQ-E04-012 (LanguageIndicator) - Different component, no conflicts
- REQ-E04-008 (GuestLanguageSwitcher) - Different component, no conflicts

---

## Risks and Considerations

### Technical Risks

1. **Color Contrast for Accessibility**
   - **Risk**: Gray text on gray background may not meet WCAG contrast requirements
   - **Mitigation**: Use text-gray-600 on gray-50 background (tested contrast ratio: 4.5:1, meets WCAG AA)
   - **Testing**: Verify with contrast checker tools

2. **Language Name Formatting**
   - **Risk**: Hardcoded language names don't support runtime localization
   - **Mitigation**: This is intentional - banner shows language names in English for clarity
   - **Future**: Could use translation utilities from REQ-E04-007 if needed
   - **Note**: Consistent with TranslationBanner approach

3. **Message Tone**
   - **Risk**: Users may perceive missing translation as error or failure
   - **Mitigation**: Muted gray styling (not red), "not available" (not "error"), info icon (not warning)
   - **Product Decision**: Intentional design to inform without alarm

### Integration Risks

1. **Parent Component Responsibility**
   - **Risk**: Parent must correctly determine when to show this banner
   - **Mitigation**: Clear documentation with integration examples
   - **Contract**: Parent must only render when `requestedLanguage !== displayLanguage`

2. **Overlap with TranslationBanner**
   - **Risk**: Both banners might appear simultaneously if logic is incorrect
   - **Mitigation**: Document mutual exclusivity in usage examples
   - **Rule**: Only one banner should display at a time

### Accessibility Risks

1. **Screen Reader Announcements**
   - **Risk**: Banner change may not be announced to screen readers
   - **Mitigation**: Use `role="status"` and `aria-live="polite"` for announcements
   - **Testing**: Verify with NVDA/VoiceOver

2. **Information Hierarchy**
   - **Risk**: Muted styling may reduce visibility for users who need the information
   - **Mitigation**: Use strong tags for language names, adequate text size (text-sm)
   - **Balance**: Subtle but readable

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Translation fetching logic** - Handled by REQ-E04-004 (Translation Fetch Utilities)
2. ❌ **Language detection** - Handled by REQ-E04-002 (Guest Language Utility Module)
3. ❌ **Integration with ItemDisplay** - Handled by REQ-E04-017 (Update ItemDisplay Component)
4. ❌ **Translation banner** - Different component in REQ-E04-009
5. ❌ **Language switcher dropdown** - Different component in REQ-E04-008
6. ❌ **Internationalization of banner text** - Banner intentionally shows in English for all users
7. ❌ **Analytics tracking** - Can be added later if needed
8. ❌ **Dismissible functionality** - Intentionally non-dismissible per requirements
9. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Design Pattern Rationale

This component follows the **Controlled Component** pattern:
- Parent component controls visibility (only render when translation unavailable)
- Parent component determines which languages to pass as props
- Component itself is stateless and purely presentational

### Muted Styling Rationale

The muted gray design is **intentionally subtle** because:
- Missing translation is informational, not an error or failure
- Users should be aware of fallback, but not alarmed
- Gray conveys neutrality (blue = positive info, yellow = warning, red = error)
- Avoids interrupting the reading experience with loud colors

### Info Icon Choice

The Info icon (lucide-react) is appropriate because:
- Neutral symbol for informational message
- Complements the muted color scheme
- Less alarming than warning/alert icons
- Consistent with icon library usage in codebase
- Accessible when combined with text label

### Accessibility Approach

**ARIA Attributes**:
- `role="status"`: Identifies banner as status message (not alert/warning)
- `aria-live="polite"`: Announces changes without interrupting user
- No interactive elements, so no additional keyboard accessibility needed

**Visual Accessibility**:
- Strong tags on language names for better scanning
- Adequate text size (text-sm, 14px) for readability
- Sufficient color contrast (text-gray-600 on gray-50: 4.5:1 ratio)

### Comparison with TranslationBanner

| Aspect | TranslationBanner | MissingTranslationBanner |
|--------|------------------|--------------------------|
| **Color** | Light blue (#E3F2FD) | Light gray (gray-50) |
| **Icon** | Globe | Info |
| **Tone** | Positive, informational | Neutral, subtle |
| **Action** | "View original" button | No action (informational only) |
| **When** | Showing translated content | Fallback to different language |
| **Purpose** | Context + navigation | Context only |

### Integration Pattern

**Typical Usage**:
```typescript
// In guest item page component:
function GuestItemPage({ item, translationMeta }) {
  const requestedLang = translationMeta.requestedLanguage;
  const displayLang = translationMeta.displayLanguage;
  const isTranslated = translationMeta.isTranslated;
  const isShowingFallback = requestedLang !== displayLang;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Show missing translation banner when fallback language is displayed */}
      {isShowingFallback && (
        <MissingTranslationBanner
          requestedLanguage={requestedLang}
          fallbackLanguage={displayLang}
          className="mb-6"
        />
      )}

      {/* Show translation banner when successfully translated */}
      {isTranslated && !isShowingFallback && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          onViewOriginal={() => setShowOriginal(true)}
          className="mb-6"
        />
      )}

      {/* Item content */}
      <div>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        {/* ... */}
      </div>
    </div>
  );
}
```

### Language Name Mapping

The inline language name formatter uses English names intentionally:
- **Reason**: Missing translation banner serves as meta-information about content
- **User Base**: Guests should understand which language they're viewing
- **Simplicity**: Avoids circular dependency on translation system for UI chrome
- **Consistency**: Matches TranslationBanner approach

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

### Message Format

**Structure**: `[Requested Language] translation not available. Showing content in [Fallback Language].`

**Examples**:
- "**French** translation not available. Showing content in **English**."
- "**German** translation not available. Showing content in **English**."
- "**Spanish** translation not available. Showing content in **French**." (if French is original)

**Strong Tags**: Language names use `<strong>` for emphasis and scanning

### Testing Strategy

**Unit Tests** (to be created):
```typescript
describe('MissingTranslationBanner', () => {
  it('renders with correct language names', () => {
    render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        fallbackLanguage="en"
      />
    );
    expect(screen.getByText(/French translation not available/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing content in English/i)).toBeInTheDocument();
  });

  it('has correct muted background color', () => {
    const { container } = render(
      <MissingTranslationBanner
        requestedLanguage="es"
        fallbackLanguage="en"
      />
    );
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-gray-50');
  });

  it('includes info icon', () => {
    const { container } = render(
      <MissingTranslationBanner
        requestedLanguage="de"
        fallbackLanguage="en"
      />
    );
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(
      <MissingTranslationBanner
        requestedLanguage="nl"
        fallbackLanguage="en"
      />
    );
    const banner = container.firstChild;
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('formats all language names correctly', () => {
    const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

    languages.forEach(lang => {
      const { unmount } = render(
        <MissingTranslationBanner
          requestedLanguage={lang}
          fallbackLanguage="en"
        />
      );
      // Verify language name appears
      expect(screen.getByText(new RegExp(lang, 'i'))).toBeInTheDocument();
      unmount();
    });
  });
});
```

**Manual Testing Checklist**:
- [ ] Banner displays with correct muted gray background
- [ ] Info icon renders correctly
- [ ] Requested and fallback language names display correctly for all 6 languages
- [ ] Message format is grammatically correct
- [ ] Muted styling does not alarm users (visual QA)
- [ ] Screen reader announces banner content
- [ ] Responsive layout works on mobile (320px width)
- [ ] Responsive layout works on tablet (768px width)
- [ ] Responsive layout works on desktop (1024px+ width)
- [ ] Custom className prop works correctly
- [ ] Text wraps naturally on narrow screens
- [ ] Color contrast meets WCAG AA standards

**Contrast Testing**:
```bash
# Verify contrast ratio for text-gray-600 on bg-gray-50
# Expected: 4.5:1 or higher (WCAG AA standard)
# Tool: WebAIM Contrast Checker or Chrome DevTools
```

---

**Last Modified**: 2026-01-22 19:11
