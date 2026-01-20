# Implementation Overview: REQ-E04-009 - Create TranslationBanner Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 22:45:00 UTC
**Request ID:** REQ-E04-009
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.2
**Status:** Ready for Implementation

---

## Request Summary

Create a persistent, non-dismissible banner component that informs guests when they are viewing translated content, identifies the source language, and provides an option to view the original version.

### Original Request Details

- **Date:** 2026-01-20 22:15
- **Type:** NEW FEATURE
- **Size:** S (Small)
- **PRD Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Functional Requirements

### From Request #9 (gen_requests_epic4.md)

1. A banner component renders with a light blue background color (#E3F2FD)
2. The banner displays text indicating the source language (e.g., "Translated from Spanish")
3. The banner includes a globe icon positioned before or after the text
4. The banner includes actionable text like "View original" that guests can click
5. The banner is not dismissible and has no close button
6. Clicking "View original" triggers a callback or event to switch language display
7. The banner has appropriate padding and spacing for comfortable reading
8. Typography is consistent with the application's design system
9. The component accepts the source language as a prop
10. The component accepts a callback function for the "View original" action
11. The banner is responsive and displays appropriately on mobile devices
12. The component integrates with accessibility standards (ARIA labels, keyboard navigation)
13. The banner appears only when translated content is being displayed
14. The component handles undefined or null source language gracefully

### From Implementation Plan (Task 3.2)

- File: `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
- Light blue banner (#E3F2FD)
- "Translated from [Language] - View original" text
- Globe icon (from Lucide)
- Dismissible: No (always show context)

### Design Specifications

| Property | Value |
|----------|-------|
| Background Color | Light blue (#E3F2FD) |
| Icon | Globe icon (from Lucide React) |
| Text | 14px, gray (#666) |
| Link | Blue, underlined |
| Height | 40px |
| Dismissible | No |

---

## Technical Context

### Existing Codebase Patterns

#### Component Structure Pattern (from LanguageSwitcher)

The codebase follows a consistent component organization pattern with folder-based modules:

```
/src/components/ComponentName/
├── index.ts                    # Barrel exports
├── ComponentName.tsx           # Main component
└── ComponentName.types.ts      # TypeScript types
```

#### Banner/Alert Pattern (from LoginForm, EmailPopup)

The codebase uses inline banners with consistent styling:

```tsx
// Error/Alert pattern
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <div className="flex">
    <Icon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">Title</h3>
      <p className="mt-1 text-sm text-red-700">Message</p>
    </div>
  </div>
</div>

// Info box pattern
<div className="bg-blue-50 border border-blue-200 rounded-md p-3">
  <div className="text-sm font-medium text-blue-800 mb-1">Title</div>
  <div className="text-xs text-blue-700">Content</div>
</div>
```

#### Icon Usage Pattern

- Primary library: Lucide React (`lucide-react`)
- Consistent sizing: `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px)
- Globe icon is available and used in LanguageSwitcher

#### Styling Conventions

- Tailwind CSS classes with consistent patterns
- Color-coded sections (blue-50/600 for info, red-50/600 for errors)
- Spacing with `px-`, `py-`, `p-` utilities
- Rounded corners with `rounded-lg`, `rounded-md`
- Font styling: `text-sm`, `text-xs`, `font-medium`, `font-semibold`

### Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Lucide React | Globe icon | Installed (^0.525.0) |
| Tailwind CSS | Styling | Installed (4.x) |
| React | Component framework | Installed |
| TypeScript | Type definitions | Installed (5.x strict) |

### Related Types

From `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`:

```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

From Implementation Plan:

```typescript
export interface TranslationBannerProps {
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  onViewOriginal: () => void;
  isShowingOriginal?: boolean;
  className?: string;
}
```

---

## Implementation Approach

### Component Architecture

```
/src/components/guest/TranslationBanner/
├── index.ts                        # Barrel exports
├── TranslationBanner.tsx           # Main component implementation
└── TranslationBanner.types.ts      # TypeScript interfaces
```

### Props Interface Design

```typescript
// TranslationBanner.types.ts
import type { SupportedLanguage } from '@/components/LanguageSwitcher';

export interface TranslationBannerProps {
  /** Original language of the content being translated */
  sourceLanguage: SupportedLanguage;
  /** Callback when "View original" is clicked */
  onViewOriginal: () => void;
  /** Whether currently showing original content (hides banner or shows "View translation") */
  isShowingOriginal?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

### Component Implementation Strategy

1. **Conditional Rendering**: Banner should not render when `isShowingOriginal` is true (or could show alternate text)
2. **Language Name Formatting**: Use `getLocaleByCode` from LanguageSwitcher constants to get native/English names
3. **Accessibility**: Include ARIA labels and keyboard-accessible click handler
4. **Responsive Design**: Use flex layout with appropriate mobile breakpoints
5. **No Dismissal**: No close button or dismiss functionality

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🌐  Translated from Spanish · View original                        │
│     ↑ Globe    ↑ Language name    ↑ Action link (blue, underlined) │
│     icon       (gray text)                                         │
└─────────────────────────────────────────────────────────────────────┘
Background: #E3F2FD (light blue)
Height: 40px (py-2.5 approximately)
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/TranslationBanner/index.ts` | Barrel exports for TranslationBanner component |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Main TranslationBanner component implementation |
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | TypeScript type definitions for TranslationBanner |

### Files to Potentially Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/src/components/guest/index.ts` | Add TranslationBanner export | Barrel export for guest components (create if doesn't exist) |

### Functions/Components to Create

| Function/Component | File | Purpose |
|-------------------|------|---------|
| `TranslationBanner` | `TranslationBanner.tsx` | Main React functional component |
| `TranslationBannerProps` | `TranslationBanner.types.ts` | Props interface definition |
| `formatSourceLanguage()` | `TranslationBanner.tsx` | Helper to format language code to display name |

### Constants/Utilities to Import

| Import | Source | Purpose |
|--------|--------|---------|
| `Globe` | `lucide-react` | Icon component |
| `SupportedLanguage` | `@/components/LanguageSwitcher` | Type for language codes |
| `getLocaleByCode` | `@/components/LanguageSwitcher` | Get language display name from code |
| `SUPPORTED_LOCALES` | `@/components/LanguageSwitcher` | Language metadata array |

---

## Implementation Details

### TranslationBanner.types.ts

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.types.ts
// REQ-E04-009: TranslationBanner component types
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher';

/**
 * Props for the TranslationBanner component
 *
 * This banner informs guests when they are viewing translated content
 * and provides an option to view the original version.
 */
export interface TranslationBannerProps {
  /** Original language of the content being translated (ISO 639-1 code) */
  sourceLanguage: SupportedLanguage;
  /** Callback when "View original" link is clicked */
  onViewOriginal: () => void;
  /** Whether currently showing original content (controls banner visibility/text) */
  isShowingOriginal?: boolean;
  /** Additional CSS classes for styling customization */
  className?: string;
}
```

### TranslationBanner.tsx Structure

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.tsx
// REQ-E04-009: Translation indicator banner for guest content
// Last Modified: 2026-01-20

'use client';

import { Globe } from 'lucide-react';
import type { TranslationBannerProps } from './TranslationBanner.types';
import { getLocaleByCode } from '@/components/LanguageSwitcher';

/**
 * TranslationBanner - Displays translation status for guest content
 *
 * Features:
 * - Light blue banner (#E3F2FD) indicating translated content
 * - Shows source language name
 * - Provides "View original" action link
 * - Non-dismissible (always visible when showing translated content)
 * - Accessible with proper ARIA attributes
 * - Responsive design for mobile and desktop
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  isShowingOriginal = false,
  className = ''
}: TranslationBannerProps) {
  // Implementation details...
}

export default TranslationBanner;
```

### index.ts Exports

```typescript
// /src/components/guest/TranslationBanner/index.ts
// REQ-E04-009: TranslationBanner barrel exports
// Last Modified: 2026-01-20

export { TranslationBanner, default } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner.types';
```

---

## Acceptance Criteria Validation

| Criterion | Implementation |
|-----------|----------------|
| Light blue background (#E3F2FD) | Tailwind class: `bg-[#E3F2FD]` |
| Displays source language name | Uses `getLocaleByCode(sourceLanguage)` for native name |
| Globe icon included | Import `Globe` from `lucide-react` |
| "View original" actionable text | Button/link with `onClick={onViewOriginal}` |
| Not dismissible | No close button or dismiss handler |
| Callback on click | `onViewOriginal` prop passed to click handler |
| Appropriate padding/spacing | Tailwind: `px-4 py-2.5` for 40px height |
| Consistent typography | `text-sm`, `font-medium` matching codebase |
| Source language prop | `sourceLanguage: SupportedLanguage` prop |
| Callback prop | `onViewOriginal: () => void` prop |
| Mobile responsive | Flex layout with responsive spacing |
| ARIA accessibility | `role="alert"`, `aria-label` attributes |
| Only shows for translated content | Conditional render based on `isShowingOriginal` |
| Handles null/undefined source | Guard clause with early return |

---

## Usage Example

```tsx
// In ItemDisplay.tsx or guest page component
import { TranslationBanner } from '@/components/guest/TranslationBanner';

function GuestItemPage({ item, translationMeta }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div>
      {/* Translation Banner - only shown when viewing translation */}
      {translationMeta.isShowingTranslation && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          onViewOriginal={() => setShowOriginal(!showOriginal)}
          isShowingOriginal={showOriginal}
        />
      )}

      {/* Rest of content */}
      <main>
        {/* ... */}
      </main>
    </div>
  );
}
```

---

## Testing Considerations

### Unit Tests

1. Renders with correct background color
2. Displays correct source language name (native form)
3. Globe icon is visible
4. "View original" link triggers callback
5. Does not render close/dismiss button
6. Handles all 6 supported language codes
7. Gracefully handles undefined/null sourceLanguage
8. Applies custom className prop
9. isShowingOriginal controls visibility/text appropriately

### Accessibility Tests

1. Has appropriate ARIA role (alert or status)
2. Keyboard accessible (link can be focused and activated)
3. Screen reader announces translation status
4. Color contrast meets WCAG AA standards

### Visual/Responsive Tests

1. Banner spans full width
2. Content remains readable on mobile (320px width)
3. 40px height maintained across breakpoints
4. Icon and text properly aligned

---

## Dependencies and Blockers

### Prerequisites

- `/src/components/guest/` directory must exist (create if needed)
- LanguageSwitcher component and types must be available (verified exists)

### No External Blockers

This component is standalone and does not depend on:
- Database tables or API endpoints
- Other Epic 4 components (though will be consumed by ItemDisplay later)
- Backend translation infrastructure

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Create types file | 15 min |
| Create component implementation | 45 min |
| Create index.ts exports | 5 min |
| Create/update guest barrel export | 10 min |
| Unit tests | 30 min |
| **Total** | ~2 hours |

---

## References

- Request: `/docs/gen_requests_epic4.md` - REQ-E04-009
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 3.2
- Existing Pattern: `/src/components/LanguageSwitcher/` - Component structure
- Consumer: `/src/components/ItemDisplay.tsx` - Will integrate banner
- Types: `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` - SupportedLanguage

---

## Complete Implementation Code

### TranslationBanner.types.ts (Full Implementation)

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.types.ts
// REQ-E04-009: TranslationBanner component types
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher';

/**
 * Props for the TranslationBanner component
 *
 * This banner informs guests when they are viewing translated content
 * and provides an option to view the original version.
 */
export interface TranslationBannerProps {
  /** Original language of the content being translated (ISO 639-1 code) */
  sourceLanguage: SupportedLanguage;
  /** Callback when "View original" link is clicked */
  onViewOriginal: () => void;
  /** Whether currently showing original content (controls banner text) */
  isShowingOriginal?: boolean;
  /** Additional CSS classes for styling customization */
  className?: string;
}
```

### TranslationBanner.tsx (Full Implementation)

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.tsx
// REQ-E04-009: Translation indicator banner for guest content
// Last Modified: 2026-01-20

'use client';

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationBannerProps } from './TranslationBanner.types';
import { getLocaleByCode } from '@/components/LanguageSwitcher';

/**
 * TranslationBanner - Displays translation status for guest content
 *
 * Features:
 * - Light blue banner (#E3F2FD) indicating translated content
 * - Shows source language name in English
 * - Provides "View original" action link
 * - Non-dismissible (always visible when showing translated content)
 * - Accessible with proper ARIA attributes
 * - Responsive design for mobile and desktop
 *
 * @example
 * ```tsx
 * <TranslationBanner
 *   sourceLanguage="es"
 *   onViewOriginal={() => setShowOriginal(!showOriginal)}
 *   isShowingOriginal={showOriginal}
 * />
 * ```
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  isShowingOriginal = false,
  className = ''
}: TranslationBannerProps) {
  // Get human-readable language name
  const localeInfo = getLocaleByCode(sourceLanguage);
  const languageName = localeInfo?.name || sourceLanguage.toUpperCase();

  // Handle edge case: no source language provided
  if (!sourceLanguage) {
    return null;
  }

  // Determine action text based on current state
  const actionText = isShowingOriginal ? 'View translation' : 'View original';

  return (
    <aside
      role="status"
      aria-label={`Content translated from ${languageName}. ${actionText} available.`}
      className={cn(
        // Background color - exact match to design spec
        'bg-[#E3F2FD]',
        // Border for subtle definition
        'border-b border-blue-200',
        // Padding for ~40px height with text
        'px-4 py-2.5',
        // Flex layout with responsive alignment
        'flex items-center gap-3',
        'sm:justify-start',
        // Custom classes
        className
      )}
    >
      {/* Globe Icon */}
      <Globe
        className="w-4 h-4 text-gray-500 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Translation Status Text */}
      <span className="text-sm text-gray-600">
        Translated from{' '}
        <span className="font-medium text-gray-700">{languageName}</span>
      </span>

      {/* Separator */}
      <span className="text-gray-400 hidden sm:inline" aria-hidden="true">·</span>

      {/* View Original / View Translation Action */}
      <button
        type="button"
        onClick={onViewOriginal}
        className={cn(
          // Text styling
          'text-sm text-blue-600',
          // Underline
          'underline underline-offset-2',
          // Hover state
          'hover:text-blue-800',
          // Focus state for accessibility
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:rounded',
          // Transition
          'transition-colors duration-150',
          // Prevent text wrapping
          'whitespace-nowrap'
        )}
        aria-label={`${actionText} content in ${isShowingOriginal ? 'translated' : languageName}`}
      >
        {actionText}
      </button>
    </aside>
  );
}

export default TranslationBanner;
```

### index.ts (Full Implementation)

```typescript
// /src/components/guest/TranslationBanner/index.ts
// REQ-E04-009: TranslationBanner barrel exports
// Last Modified: 2026-01-20

// Component exports
export { TranslationBanner, default } from './TranslationBanner';

// Type exports
export type { TranslationBannerProps } from './TranslationBanner.types';
```

### Guest Components Barrel Export (Create/Update)

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-20

// TranslationBanner - REQ-E04-009
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// Future guest components will be added here:
// export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
// export { MissingTranslationBanner } from './MissingTranslationBanner';
// export { ViewOriginalToggle } from './ViewOriginalToggle';
// export { LanguageIndicator } from './LanguageIndicator';
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guest components folder doesn't exist | Medium | Low | Create `/src/components/guest/` directory during implementation |
| getLocaleByCode returns undefined | Low | Low | Fallback to uppercase language code in component |
| LanguageSwitcher not imported correctly | Low | Medium | Verify import path; use barrel export |
| Color mismatch on different screens | Low | Low | Use exact hex value `#E3F2FD` rather than Tailwind blue classes |

---

## Notes for Implementer

1. **'use client' Directive**: This component uses onClick handlers, so it must be a client component
2. **Color Precision**: Use `bg-[#E3F2FD]` for exact color match rather than `bg-blue-50` (which is #EFF6FF)
3. **No Dismiss**: Do NOT add any close button or dismiss handler - banner is intentionally persistent
4. **Graceful Degradation**: Component returns `null` if sourceLanguage is undefined/empty
5. **Text Content**: Use "Translated from" not "Translated in" for clarity about the source
6. **Action Toggle**: The button text changes between "View original" and "View translation" based on `isShowingOriginal`
7. **Separator**: The `·` dot separator is hidden on mobile for cleaner appearance

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task: Create TranslationBanner component*
