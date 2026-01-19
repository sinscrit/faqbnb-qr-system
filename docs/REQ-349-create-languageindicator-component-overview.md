# REQ-349: Create LanguageIndicator Component - Implementation Overview

**Document Created:** 2026-01-19 20:30 UTC
**Last Modified:** 2026-01-19 20:45 UTC
**Request ID:** REQ-349
**Type:** NEW FEATURE
**Size:** S
**Phase:** 3 - Guest UI Components (Task 3.5)
**Epic:** L10N Epic 4 - Guest Experience
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## 1. Summary

Create a compact visual indicator component that displays the current language being viewed by guests, designed for placement in header areas and other space-constrained contexts. The component shows a flag icon representing the current display language alongside the language name, with an optional subtitle showing "Translated from [Source Language]" when content has been translated. The implementation must be compact enough for header placement without disrupting layout, while maintaining clear visual communication of the current language state.

---

## 2. Current State Analysis

### Existing Infrastructure

| Resource | Location | Status |
|----------|----------|--------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Available - Exports `locales`, `localeMetadata`, `SupportedLocale` |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | Available - Provides `useLocale()`, `useSetLocale()` hooks |
| Existing LanguageSwitcher | `/src/components/LanguageSwitcher/` | Available - For authenticated users (reference for patterns) |
| GuestLanguageSwitcher | `/src/components/guest/GuestLanguageSwitcher/` | To be created (REQ-345) - Same epic, guest language selection |
| Lucide Icons | `lucide-react` v0.525.0 | Installed - Provides Globe icon |
| Utility Functions | `/src/lib/utils.ts` | Available - `cn()` for Tailwind class composition |

### Locale Configuration from Epic 1

```typescript
// From /src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};
```

### Database Schema

Translation tables are in place with RLS enabled:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `item_translations` | Item name/description translations | `item_id`, `language`, `translation_status` |
| `article_translations` | Article title/description translations | `article_id`, `language`, `translation_status` |
| `link_translations` | Link title translations | `link_id`, `language`, `translation_status` |
| `tag_translations` | Tag value translations | `tag_key`, `language`, `translated_value` |

---

## 3. Requirements Mapping

| PRD Acceptance Criteria | Implementation Task |
|------------------------|---------------------|
| Component displays a flag icon representing the current display language | Use `localeMetadata[currentLanguage].flag` |
| Component displays the language name in text form | Use `localeMetadata[currentLanguage].nativeName` |
| Flag icons sourced from consistent flag icon library | Use emoji flags from `localeMetadata` |
| Accept property for current language code | `currentLanguage: SupportedLocale` prop |
| Accept optional property for source language when translated | `sourceLanguage?: SupportedLocale` prop |
| Accept property for whether content is translated | `isTranslated: boolean` prop |
| Display subtitle "Translated from [Source Language]" when source provided | Conditional render with muted styling |
| Subtitle uses reduced font size and lighter text color | `text-xs text-gray-500` classes |
| Compact layout suitable for header placement | Max-width constraint, flex layout |
| Does not exceed ~150-200 pixels width | `max-w-[200px]` constraint |
| Works on mobile viewports with responsive sizing | Responsive text sizes, stack option |
| Proper accessibility attributes for screen readers | ARIA labels announcing language state |
| Screen readers convey both display language and translation source | `aria-label` with full context |
| Readable contrast ratios | Follow WCAG AA guidelines |
| Follows design system typography and spacing | Tailwind CSS, Airbnb DLS patterns |
| TypeScript prop types properly defined | `LanguageIndicatorProps` interface |
| Handles missing flag assets gracefully | Fallback to text-only if flag undefined |
| Visually consistent with surrounding header elements | Neutral styling, subtle presentation |

---

## 4. Technical Design

### Component Architecture

```
/src/components/guest/
├── index.ts                                  # Barrel exports for all guest components
└── LanguageIndicator/
    ├── index.ts                              # Component re-export
    ├── LanguageIndicator.tsx                 # Main component implementation
    └── LanguageIndicator.types.ts            # TypeScript interfaces
```

### Props Interface

```typescript
// /src/components/guest/LanguageIndicator/LanguageIndicator.types.ts

import type { SupportedLocale } from '@/lib/i18n/config';

export interface LanguageIndicatorProps {
  /** Current display language code */
  currentLanguage: SupportedLocale;

  /** Whether the content being displayed is translated (vs. original) */
  isTranslated: boolean;

  /** Source language code when content is translated (optional) */
  sourceLanguage?: SupportedLocale;

  /** Additional CSS classes for custom styling */
  className?: string;
}
```

### Component Implementation Outline

```tsx
// /src/components/guest/LanguageIndicator/LanguageIndicator.tsx
'use client';

import { localeMetadata } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import type { LanguageIndicatorProps } from './LanguageIndicator.types';

export function LanguageIndicator({
  currentLanguage,
  isTranslated,
  sourceLanguage,
  className,
}: LanguageIndicatorProps) {
  const currentLocale = localeMetadata[currentLanguage];
  const sourceLocale = sourceLanguage ? localeMetadata[sourceLanguage] : null;

  // Build screen reader accessible label
  const ariaLabel = isTranslated && sourceLocale
    ? `Currently viewing in ${currentLocale.name}, translated from ${sourceLocale.name}`
    : `Currently viewing in ${currentLocale.name}`;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-start max-w-[200px]',
        className
      )}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {/* Main language display */}
      <div className="inline-flex items-center gap-1.5">
        {currentLocale.flag && (
          <span className="text-base" aria-hidden="true">
            {currentLocale.flag}
          </span>
        )}
        <span className="text-sm font-medium text-gray-700 truncate">
          {currentLocale.nativeName}
        </span>
      </div>

      {/* Optional "Translated from" subtitle */}
      {isTranslated && sourceLocale && (
        <span className="text-xs text-gray-500 truncate">
          Translated from {sourceLocale.name}
        </span>
      )}
    </div>
  );
}
```

### Visual Design Specifications

| Element | Specification |
|---------|---------------|
| Container | Inline-flex, flex-col, max-width 200px |
| Flag Icon | 16px (text-base), positioned left of language name |
| Language Name | 14px (text-sm), font-medium, gray-700 (#374151) |
| Subtitle | 12px (text-xs), gray-500 (#6B7280), muted appearance |
| Spacing | 6px gap between flag and name (gap-1.5) |
| Layout | Vertical stack: main line + optional subtitle |
| Truncation | Both name and subtitle truncate with ellipsis |
| Mobile | Same styling, potentially abbreviated on very small screens |

### Styling Classes (Tailwind)

```tsx
// Container
const containerClasses = cn(
  'inline-flex flex-col items-start',
  'max-w-[200px]',
  className
);

// Main language row
const mainRowClasses = 'inline-flex items-center gap-1.5';

// Flag icon
const flagClasses = 'text-base'; // ~16px

// Language name
const nameClasses = 'text-sm font-medium text-gray-700 truncate';

// Subtitle
const subtitleClasses = 'text-xs text-gray-500 truncate';
```

### Mobile Responsiveness

On very small screens (< 320px), the component naturally handles:
- Text truncation with ellipsis prevents overflow
- Vertical stacking keeps layout compact
- No minimum width constraint allows flexible sizing

Optional mobile abbreviation (if needed):
```tsx
// Could abbreviate to code on very small screens
<span className="text-sm font-medium text-gray-700 truncate">
  <span className="hidden sm:inline">{currentLocale.nativeName}</span>
  <span className="sm:hidden">{currentLocale.code.toUpperCase()}</span>
</span>
```

---

## 5. Dependencies

### Required from Epic 1/3

| Dependency | Source | Status |
|------------|--------|--------|
| `localeMetadata` constant | `/src/lib/i18n/config.ts` | Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `cn` utility | `/src/lib/utils.ts` | Available |

### NPM Dependencies (Already Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| `clsx` | ^2.1.1 | Class name utility |
| `tailwind-merge` | ^2.6.0 | Tailwind class merging |

### No Additional Dependencies Required

This component is pure presentational and does not require:
- No external icon libraries (uses emoji flags from config)
- No Radix UI components (simple display, no interaction)
- No state management hooks (props-driven)

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/LanguageIndicator/index.ts` | Component re-export |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main component |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | TypeScript interfaces |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/guest/index.ts` | Add export for LanguageIndicator (if exists, or create) |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Import `localeMetadata`, `SupportedLocale` |
| `/src/lib/utils.ts` | Import `cn` utility function |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Reference existing language display patterns |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Reference sibling component patterns |

### Functions to Implement

| Function | Location | Description |
|----------|----------|-------------|
| `LanguageIndicator` | `LanguageIndicator.tsx` | Main React component (functional, no hooks) |

---

## 7. Implementation Tasks

### Task 1: Create Directory and Type Definitions
- Create `/src/components/guest/LanguageIndicator/` directory (if not exists)
- Create `LanguageIndicator.types.ts` with `LanguageIndicatorProps` interface
- Import and use `SupportedLocale` from config

### Task 2: Implement Main Component
- Create `LanguageIndicator.tsx` as a pure presentational component
- Import `localeMetadata` from i18n config
- Import `cn` from utils
- Implement flag + language name display
- Implement conditional "Translated from" subtitle
- Add text truncation for overflow handling
- Apply max-width constraint for compact layout

### Task 3: Implement Accessibility Features
- Add `role="status"` for live region announcement
- Add `aria-live="polite"` for non-intrusive updates
- Build comprehensive `aria-label` including:
  - Current display language
  - Translation source (if applicable)
- Add `aria-hidden="true"` to flag emoji (decorative)

### Task 4: Create Barrel Exports
- Create `index.ts` in LanguageIndicator directory
- Update `/src/components/guest/index.ts` to include LanguageIndicator export

### Task 5: Handle Edge Cases
- Handle missing flag gracefully (show name only)
- Handle missing sourceLanguage when isTranslated is true
- Ensure className prop merges correctly

---

## 8. Testing Requirements

### Unit Tests

| Test Case | Description |
|-----------|-------------|
| Renders current language name | Shows nativeName from localeMetadata |
| Renders flag icon | Shows flag emoji from localeMetadata |
| Shows subtitle when translated | Displays "Translated from X" when isTranslated and sourceLanguage provided |
| Hides subtitle when not translated | No subtitle when isTranslated is false |
| Hides subtitle when no source | No subtitle when sourceLanguage is undefined |
| Handles all 6 languages | Correctly renders each supported locale |
| Applies custom className | className prop merges with base styles |
| Handles missing flag | Renders without flag if localeMetadata.flag is undefined |

### Accessibility Tests

| Test Case | Description |
|-----------|-------------|
| Has accessible name | aria-label provides full context |
| Screen reader announces state | role="status" enables announcement |
| Decorative flag hidden | Flag has aria-hidden="true" |
| Polite announcement | aria-live="polite" for non-intrusive updates |

### Visual Tests

| Test Case | Description |
|-----------|-------------|
| Respects max-width | Component does not exceed 200px |
| Text truncates | Long names show ellipsis |
| Subtitle styling | Smaller, muted text for subtitle |
| Mobile viewport | Works on 320px width |

---

## 9. Integration Points

### With ItemDisplay Component (Task 5.2)

```tsx
// Example integration in ItemDisplay.tsx header
import { LanguageIndicator } from '@/components/guest';

function ItemDisplay({ translationMeta }) {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <div className="flex items-center gap-4">
        <LanguageIndicator
          currentLanguage={translationMeta.displayLanguage}
          isTranslated={translationMeta.isShowingTranslation}
          sourceLanguage={translationMeta.sourceLanguage}
        />
        <GuestLanguageSwitcher
          currentLanguage={translationMeta.displayLanguage}
          availableTranslations={translationMeta.availableTranslations}
          sourceLanguage={translationMeta.sourceLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    </header>
  );
}
```

### With TranslationBanner Component (Task 3.2)

The LanguageIndicator serves as a complementary component to TranslationBanner:
- **LanguageIndicator**: Compact, always-visible in header, shows current language state
- **TranslationBanner**: More prominent, dismissible banner below header with "View Original" action

### With useGuestLanguage Hook (Task 4.1)

The component receives its props from the hook's state:
- `currentLanguage` = hook's `displayLanguage`
- `isTranslated` = derived from hook's state (displayLanguage !== sourceLanguage && !showOriginal)
- `sourceLanguage` = from translation metadata

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flag emoji rendering varies by OS | Low | Low | Emoji flags are well-supported; could add SVG fallback later |
| German text ("Deutsch") fits but "Nederlands" may truncate | Low | Low | Truncation with ellipsis handles gracefully |
| Subtitle increases component height | Low | Low | Subtitle is optional, single line, small font |
| Performance with frequent re-renders | Very Low | Very Low | Pure presentational component, minimal computation |
| Max-width too restrictive for some layouts | Low | Low | className prop allows override if needed |

---

## 11. Acceptance Criteria Checklist

- [ ] Component file exists at `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- [ ] Component displays a flag icon representing the current display language
- [ ] Component displays the language name in text form adjacent to the flag
- [ ] Flag icons sourced from `localeMetadata` in i18n config
- [ ] Component accepts `currentLanguage` property to determine flag and name
- [ ] Component accepts optional `sourceLanguage` property for translation source
- [ ] Component accepts `isTranslated` boolean property
- [ ] When `isTranslated` is true and `sourceLanguage` provided, displays "Translated from [Language]" subtitle
- [ ] Subtitle uses reduced font size (text-xs) and lighter text color (text-gray-500)
- [ ] Component maintains compact layout suitable for header placement
- [ ] Component does not exceed 200 pixels width
- [ ] Component works correctly on mobile viewports
- [ ] Component includes proper accessibility attributes for screen readers
- [ ] Screen readers convey both current language and translation source if applicable
- [ ] Component maintains readable contrast ratios
- [ ] Component follows project design system typography and spacing guidelines
- [ ] TypeScript prop types are properly defined with clear interfaces
- [ ] Component handles missing flag assets gracefully (text-only fallback)
- [ ] Component remains visually consistent with surrounding header elements
- [ ] Barrel exports enable clean imports from `@/components/guest`

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-315, REQ-349)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Related Component (GuestLanguageSwitcher):** `/src/components/guest/GuestLanguageSwitcher/`
- **Existing LanguageSwitcher Reference:** `/src/components/LanguageSwitcher/`
- **WCAG Contrast Guidelines:** https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
