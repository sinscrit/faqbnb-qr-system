# Implementation Breakdown: REQ-E04-012 - Create LanguageIndicator Component

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-012 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #12 |
| **Original Request Date** | 2026-01-22 16:50 |
| **Breakdown Created** | 2026-01-22 19:16 |
| **T-shirt Size** | S |
| **Estimated Effort** | 2-3 hours |
| **Status** | PENDING |

---

## Goals

Create a compact language indicator component that displays the current display language with a flag emoji. The component optionally shows a subtitle indicating source language when viewing translated content. Designed for use in headers or other space-constrained areas.

**Key Objectives**:
1. Display current display language with flag emoji
2. Show native language name (e.g., "Français" for French)
3. Optional subtitle: "Translated from [Language]" when viewing translation
4. Compact design suitable for headers
5. Non-interactive (read-only display component, not a switcher)
6. Consistent flag emoji mapping with LocaleContext

---

## Implementation Plan

### 1. Create LanguageIndicator Component File

**File**: `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Approach**: Create a new React client component that displays language information in a compact format with flag emoji. Component is read-only (not interactive) and suitable for header placement.

**Implementation Details**:

```typescript
'use client';

/**
 * LanguageIndicator Component
 *
 * Compact display of current language with flag emoji.
 * Optional subtitle shows source language when viewing translated content.
 * Read-only component (non-interactive) suitable for headers.
 *
 * @example
 * ```tsx
 * // Simple usage (display language only)
 * <LanguageIndicator displayLanguage="fr" />
 *
 * // With translation context
 * <LanguageIndicator
 *   displayLanguage="fr"
 *   originalLanguage="en"
 * />
 * ```
 *
 * @module components/guest/LanguageIndicator
 * @lastModified 2026-01-22
 */

import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface LanguageIndicatorProps {
  /** Current display language */
  displayLanguage: SupportedLanguage;
  /** Original language (if viewing translated content) */
  originalLanguage?: SupportedLanguage;
  /** Show "Translated from X" subtitle when originalLanguage provided */
  showTranslationContext?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Language Metadata
// =============================================================================

interface LanguageMetadata {
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * Language metadata with flag emojis.
 * Consistent with LocaleContext.tsx SUPPORTED_LOCALES.
 */
const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get language metadata by code
 */
function getLanguageMetadata(lang: SupportedLanguage): LanguageMetadata {
  return LANGUAGE_METADATA[lang];
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Compact language indicator with flag emoji.
 * Shows current display language and optional translation context.
 */
export function LanguageIndicator({
  displayLanguage,
  originalLanguage,
  showTranslationContext = true,
  size = 'md',
  className,
}: LanguageIndicatorProps) {
  const displayMeta = getLanguageMetadata(displayLanguage);
  const originalMeta = originalLanguage ? getLanguageMetadata(originalLanguage) : null;

  // Show subtitle if viewing translated content and context enabled
  const showSubtitle = showTranslationContext && originalLanguage && originalLanguage !== displayLanguage;

  // Size-dependent classes
  const sizeClasses = {
    sm: {
      flag: 'text-base',
      name: 'text-sm',
      subtitle: 'text-xs',
    },
    md: {
      flag: 'text-lg',
      name: 'text-base',
      subtitle: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        className
      )}
      role="status"
      aria-label={`Content displayed in ${displayMeta.nativeName}${
        showSubtitle ? `, translated from ${originalMeta?.name}` : ''
      }`}
    >
      {/* Flag Emoji */}
      <span
        className={cn(classes.flag, 'flex-shrink-0')}
        aria-hidden="true"
      >
        {displayMeta.flag}
      </span>

      {/* Language Info */}
      <div className="flex flex-col">
        {/* Native Language Name */}
        <span className={cn(classes.name, 'font-medium text-gray-900')}>
          {displayMeta.nativeName}
        </span>

        {/* Optional Translation Context Subtitle */}
        {showSubtitle && originalMeta && (
          <span className={cn(classes.subtitle, 'text-gray-500')}>
            Translated from {originalMeta.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default LanguageIndicator;
```

**Steps**:
1. Create directory: `/src/components/guest/LanguageIndicator/`
2. Create component file: `LanguageIndicator.tsx`
3. Add type definitions for props interface
4. Define LANGUAGE_METADATA constant with flag emojis (consistent with LocaleContext)
5. Implement compact layout:
   - Flag emoji on left
   - Native language name (e.g., "Français")
   - Optional subtitle: "Translated from [Language]"
6. Support two size variants: 'sm' and 'md'
7. Use flexbox for compact horizontal layout
8. Add ARIA attributes for accessibility (role="status", aria-label)
9. Use `cn()` utility for className merging (existing pattern)

### 2. Create Barrel Export File

**File**: `/src/components/guest/LanguageIndicator/index.ts`

**Implementation**:
```typescript
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
```

**Steps**:
1. Create barrel export file in component directory
2. Export component and its prop types for external use

### 3. Add Component Integration Examples

**Documentation**: Add usage examples to component file

**Example 1: Simple display language only**:
```typescript
// In a guest item page header:
import { LanguageIndicator } from '@/components/guest/LanguageIndicator';

function GuestItemHeader({ displayLanguage }) {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Item Title</h1>
      <LanguageIndicator displayLanguage={displayLanguage} />
    </header>
  );
}
```

**Example 2: With translation context**:
```typescript
// Show "Translated from English" subtitle:
<LanguageIndicator
  displayLanguage="fr"
  originalLanguage="en"
/>
```

**Example 3: Compact header usage**:
```typescript
// Small size for mobile headers:
<LanguageIndicator
  displayLanguage="es"
  originalLanguage="en"
  size="sm"
  className="ml-auto"
/>
```

### 4. Flag Emoji Consistency

**Ensure Consistency with LocaleContext**:

The flag emojis must exactly match LocaleContext.tsx SUPPORTED_LOCALES:
- 🇬🇧 English (en)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇩🇪 German (de)
- 🇳🇱 Dutch (nl)
- 🇮🇹 Italian (it)

**Rationale**: Consistent visual representation across authenticated (LanguageSwitcher) and guest (LanguageIndicator) experiences.

### 5. Size Variants

**Two Size Options**:

| Size | Use Case | Flag | Name | Subtitle |
|------|----------|------|------|----------|
| `sm` | Mobile headers, compact spaces | text-base | text-sm | text-xs |
| `md` | Desktop headers, normal spaces | text-lg | text-base | text-sm |

**Responsive Pattern**:
```typescript
<LanguageIndicator
  displayLanguage={lang}
  size="sm"
  className="lg:hidden" // Small on mobile
/>
<LanguageIndicator
  displayLanguage={lang}
  size="md"
  className="hidden lg:flex" // Medium on desktop
/>
```

### 6. Testing Considerations

**Component Testing**:
- Component renders flag emoji correctly
- Component renders native language name
- Subtitle appears when originalLanguage differs from displayLanguage
- Subtitle hidden when originalLanguage equals displayLanguage
- Subtitle hidden when showTranslationContext is false
- Size variants apply correct text sizes
- ARIA label includes translation context when applicable
- All 6 languages render correctly with proper flags
- Compact layout suitable for headers

---

## Authorized Files and Functions for Modification

### New Files to Create

1. **`/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`**
   - New client component file
   - Exports: `LanguageIndicator` component, `LanguageIndicatorProps` interface

2. **`/src/components/guest/LanguageIndicator/index.ts`**
   - New barrel export file
   - Re-exports component and types

### Files to Reference (Read-Only)

1. **`/src/types/l10n.ts`**
   - Reference: `SupportedLanguage` type
   - Usage: Type for `displayLanguage` and `originalLanguage` props

2. **`/src/lib/utils.ts`**
   - Reference: `cn()` function
   - Usage: className merging utility

3. **`/src/contexts/LocaleContext.tsx`**
   - Reference: SUPPORTED_LOCALES constant (lines 79-86)
   - Usage: Ensure consistent flag emoji mapping

### Dependencies

**NPM Packages**:
- `react` (already installed) - Component framework
- `@/lib/utils` (already exists) - cn() utility
- `@/types` (from REQ-E04-001) - SupportedLanguage type

**No external icon libraries needed**: Uses native Unicode flag emojis

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
  - ItemDisplay integration may use LanguageIndicator in header

### Parallel Safety
✅ **Can be implemented in parallel with**:
- REQ-E04-009 (TranslationBanner) - Different component, no conflicts
- REQ-E04-010 (MissingTranslationBanner) - Different component, no conflicts
- REQ-E04-011 (ViewOriginalToggle) - Different component, no conflicts
- REQ-E04-008 (GuestLanguageSwitcher) - Different component, no conflicts

---

## Risks and Considerations

### Technical Risks

1. **Flag Emoji Rendering**
   - **Risk**: Flag emojis may not render consistently across all devices/browsers
   - **Mitigation**: Use standard Unicode flag emojis (most widely supported)
   - **Fallback**: If flags don't render, native language name is still visible
   - **Testing**: Test on iOS, Android, Windows, macOS browsers

2. **Emoji Accessibility**
   - **Risk**: Screen readers may read flag emojis as "flag: [country]" or skip them
   - **Mitigation**: Mark flags with `aria-hidden="true"`, provide full context in `aria-label`
   - **Testing**: Verify screen reader announces language name, not flag emoji

3. **Subtitle Display Logic**
   - **Risk**: Subtitle appears incorrectly when not viewing translation
   - **Mitigation**: Only show when `originalLanguage !== displayLanguage`
   - **Edge Case**: When original=display, no subtitle should appear

### Integration Risks

1. **Header Layout Integration**
   - **Risk**: Component may not fit well in constrained header spaces
   - **Mitigation**: Compact design with two size variants
   - **Responsive**: Use `sm` size on mobile, `md` on desktop

2. **Coordination with Other Components**
   - **Risk**: Overlap with GuestLanguageSwitcher if both used in same area
   - **Mitigation**: Document that LanguageIndicator is read-only display, GuestLanguageSwitcher is interactive
   - **Use Case**: LanguageIndicator for headers, GuestLanguageSwitcher for changing language

### Accessibility Risks

1. **Screen Reader Announcements**
   - **Risk**: Component changes may not be announced to screen readers
   - **Mitigation**: Use `role="status"` for polite announcements
   - **Testing**: Verify with NVDA/VoiceOver

2. **Visual-Only Information**
   - **Risk**: Reliance on flag emoji for visual users only
   - **Mitigation**: Native language name provides text alternative
   - **ARIA**: Comprehensive aria-label includes all context

### UI/UX Risks

1. **Visual Clutter**
   - **Risk**: Subtitle may add unwanted visual noise in headers
   - **Mitigation**: Provide `showTranslationContext` prop to disable subtitle
   - **Default**: Enabled (transparent about translation)

2. **Language Name Length**
   - **Risk**: Some native names are longer ("Nederlands" vs "Français")
   - **Mitigation**: Use flexbox with natural wrapping if needed
   - **Testing**: Test longest name (Nederlands) in constrained spaces

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Interactive language switching** - This is read-only display, not a switcher (see REQ-E04-008)
2. ❌ **Dropdown functionality** - Component does not expand or show options
3. ❌ **Translation fetching logic** - Handled by REQ-E04-004 (Translation Fetch Utilities)
4. ❌ **Language detection** - Handled by REQ-E04-002 (Guest Language Utility Module)
5. ❌ **Integration with ItemDisplay** - Handled by REQ-E04-017 (Update ItemDisplay Component)
6. ❌ **Header/navigation bar implementation** - Component is standalone, parent handles placement
7. ❌ **Internationalization of subtitle text** - Text intentionally shows in English for all users
8. ❌ **Analytics tracking** - Can be added later if needed
9. ❌ **Loading states** - Component displays static information, no async operations
10. ❌ **Click handlers** - Non-interactive component
11. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Design Pattern Rationale

This component follows the **Presentational Component** pattern:
- Receives display data via props
- No internal state (purely presentational)
- No side effects or async operations
- Parent component controls what is displayed
- Read-only (not interactive)

### Flag Emoji Consistency

**Matching LocaleContext SUPPORTED_LOCALES**:

The flag emojis MUST match LocaleContext.tsx exactly:
```typescript
// From LocaleContext.tsx lines 79-86:
{ code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
{ code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
{ code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
{ code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
{ code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
{ code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
```

**Rationale**: Consistent flag representation across authenticated and guest experiences.

### Native Language Names

**Why Native Names**:
- Users recognize their language in its native form
- More inclusive than English-only names
- Consistent with international best practices
- Matches LanguageSwitcher component behavior

**Examples**:
- "Français" (not "French")
- "Español" (not "Spanish")
- "Deutsch" (not "German")
- "Nederlands" (not "Dutch")

### Subtitle Display Logic

**When to Show Subtitle**:
```typescript
// Show subtitle only when ALL conditions are true:
showTranslationContext === true AND
originalLanguage !== undefined AND
originalLanguage !== displayLanguage
```

**Examples**:
| Display | Original | Subtitle Shown? | Subtitle Text |
|---------|----------|-----------------|---------------|
| fr | en | ✅ Yes | "Translated from English" |
| en | en | ❌ No | (viewing original) |
| es | undefined | ❌ No | (no original specified) |
| de | en (context off) | ❌ No | (context disabled) |

### Compact Design for Headers

**Design Goals**:
- Minimal vertical space (single line or compact two-line)
- Horizontal layout (flag + text)
- Small font sizes for constrained spaces
- No interactive elements (reduce touch target requirements)

**Layout Structure**:
```
[🇫🇷] Français
      Translated from English
```

**Flexbox Pattern**:
```typescript
// Horizontal layout with gap
flex items-center gap-2

// Nested vertical layout for text
flex flex-col

// Flag doesn't shrink
flex-shrink-0
```

### Size Variants Rationale

**Two Sizes Support Different Contexts**:

**Small (sm)**:
- Mobile headers with limited space
- Inline display within compact UI
- Minimal visual footprint

**Medium (md)**:
- Desktop headers with more space
- Standalone display in prominent areas
- Better readability on large screens

### Accessibility Approach

**ARIA Attributes**:
- `role="status"`: Identifies as status indicator (not interactive)
- `aria-label`: Provides complete context including translation info
- `aria-hidden="true"` on flag: Prevents screen reader announcement of emoji

**Example ARIA Label**:
```
"Content displayed in Français, translated from English"
```

**Visual Accessibility**:
- High contrast text colors (text-gray-900 for name)
- Adequate font sizes (text-sm minimum)
- Flag emoji provides additional visual cue

### Integration Pattern

**Typical Header Usage**:
```typescript
// In a guest item page header:
import { LanguageIndicator } from '@/components/guest/LanguageIndicator';
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';

function GuestItemHeader({ item, translationMeta, availableLanguages }) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      {/* Left: Item info */}
      <div>
        <h1 className="text-xl font-bold">{item.name}</h1>
      </div>

      {/* Right: Language controls */}
      <div className="flex items-center gap-4">
        {/* Read-only indicator */}
        <LanguageIndicator
          displayLanguage={translationMeta.displayLanguage}
          originalLanguage={translationMeta.originalLanguage}
          size="sm"
        />

        {/* Interactive switcher */}
        <GuestLanguageSwitcher
          currentLanguage={translationMeta.displayLanguage}
          availableLanguages={availableLanguages}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    </header>
  );
}
```

### Comparison with GuestLanguageSwitcher

| Aspect | LanguageIndicator | GuestLanguageSwitcher |
|--------|-------------------|------------------------|
| **Purpose** | Display current language | Switch language |
| **Interaction** | Read-only | Interactive dropdown |
| **Content** | Flag + name + subtitle | Flag + name + checkmarks |
| **Size** | Compact (2 variants) | Standard (3 variants) |
| **ARIA** | role="status" | role="button" + menu |
| **Use Case** | Headers, status bars | Language selection UI |

### Responsive Considerations

**Mobile (320px - 767px)**:
- Use `size="sm"` for compact display
- Single line or compact two-line layout
- Adequate touch spacing if near interactive elements

**Tablet/Desktop (768px+)**:
- Can use `size="md"` for better readability
- More space available in headers
- May show multiple indicators if needed

**Responsive Pattern**:
```typescript
// Adaptive sizing
<LanguageIndicator
  displayLanguage={lang}
  originalLanguage={original}
  size="sm"
  className="text-sm md:text-base"
/>

// Or separate instances
<LanguageIndicator size="sm" className="md:hidden" />
<LanguageIndicator size="md" className="hidden md:flex" />
```

### Testing Strategy

**Unit Tests** (to be created):
```typescript
describe('LanguageIndicator', () => {
  it('renders flag emoji and native name', () => {
    render(<LanguageIndicator displayLanguage="fr" />);
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('shows subtitle when viewing translation', () => {
    render(
      <LanguageIndicator
        displayLanguage="fr"
        originalLanguage="en"
      />
    );
    expect(screen.getByText(/Translated from English/i)).toBeInTheDocument();
  });

  it('hides subtitle when original equals display', () => {
    render(
      <LanguageIndicator
        displayLanguage="en"
        originalLanguage="en"
      />
    );
    expect(screen.queryByText(/Translated from/i)).not.toBeInTheDocument();
  });

  it('hides subtitle when showTranslationContext is false', () => {
    render(
      <LanguageIndicator
        displayLanguage="es"
        originalLanguage="en"
        showTranslationContext={false}
      />
    );
    expect(screen.queryByText(/Translated from/i)).not.toBeInTheDocument();
  });

  it('applies small size classes', () => {
    const { container } = render(
      <LanguageIndicator displayLanguage="de" size="sm" />
    );
    const flag = container.querySelector('.text-base');
    expect(flag).toBeInTheDocument();
  });

  it('applies medium size classes', () => {
    const { container } = render(
      <LanguageIndicator displayLanguage="nl" size="md" />
    );
    const flag = container.querySelector('.text-lg');
    expect(flag).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(
      <LanguageIndicator
        displayLanguage="it"
        originalLanguage="en"
      />
    );
    const indicator = container.firstChild;
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label');

    // Flag should be hidden from screen readers
    const flag = container.querySelector('span[aria-hidden="true"]');
    expect(flag).toBeInTheDocument();
  });

  it('renders all 6 languages correctly', () => {
    const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
    const nativeNames = ['English', 'Français', 'Español', 'Deutsch', 'Nederlands', 'Italiano'];
    const flags = ['🇬🇧', '🇫🇷', '🇪🇸', '🇩🇪', '🇳🇱', '🇮🇹'];

    languages.forEach((lang, index) => {
      const { unmount } = render(<LanguageIndicator displayLanguage={lang} />);
      expect(screen.getByText(flags[index])).toBeInTheDocument();
      expect(screen.getByText(nativeNames[index])).toBeInTheDocument();
      unmount();
    });
  });

  it('includes translation context in ARIA label', () => {
    const { container } = render(
      <LanguageIndicator
        displayLanguage="fr"
        originalLanguage="en"
      />
    );
    const indicator = container.firstChild;
    const ariaLabel = indicator?.getAttribute('aria-label');
    expect(ariaLabel).toContain('Français');
    expect(ariaLabel).toContain('translated from English');
  });
});
```

**Manual Testing Checklist**:
- [ ] Flag emojis render correctly on all devices (iOS, Android, Windows, macOS)
- [ ] Native language names display correctly for all 6 languages
- [ ] Subtitle appears when displaying translation
- [ ] Subtitle hidden when viewing original content
- [ ] Subtitle hidden when showTranslationContext is false
- [ ] Small size variant uses correct text sizes
- [ ] Medium size variant uses correct text sizes
- [ ] Component fits well in header layouts
- [ ] Screen reader announces language correctly (not flag emoji)
- [ ] ARIA label includes full context
- [ ] Flag emoji marked as aria-hidden
- [ ] Responsive layout works on mobile (320px width)
- [ ] Responsive layout works on tablet (768px width)
- [ ] Responsive layout works on desktop (1024px+ width)
- [ ] Custom className prop works correctly
- [ ] Component is visually compact and suitable for headers

**Flag Emoji Cross-Platform Testing**:
```bash
# Test flag emoji rendering on:
- iOS Safari
- Android Chrome
- Windows Chrome/Edge
- macOS Safari/Chrome
- Linux Firefox/Chrome
```

---

**Last Modified**: 2026-01-22 19:16
