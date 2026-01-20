# Implementation Overview: REQ-E04-010 - Create MissingTranslationBanner Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 23:15:00 UTC
**Request ID:** REQ-E04-010
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.3
**Status:** Ready for Implementation

---

## Request Summary

Create a subtle, informational banner component that notifies guests when their requested translation is unavailable and shows the original language content as a fallback. The banner should use muted, non-alarming styling to communicate this status without causing concern.

### Original Request Details

- **Date:** 2026-01-20 22:30
- **Type:** NEW FEATURE
- **Size:** S (Small)
- **PRD Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Functional Requirements

### From Request #10 (gen_requests_epic4.md)

1. A banner component renders when a requested translation is unavailable
2. The banner displays text indicating the requested language (e.g., "French translation not available")
3. The banner displays text indicating which language is being shown instead (e.g., "Showing content in English")
4. The banner uses muted styling with a gray or neutral background color
5. Text colors are subdued compared to standard UI text but remain readable
6. The banner styling clearly differentiates from error messages or warning banners
7. The banner does not include any alarming icons or colors (no red, yellow, or exclamation marks)
8. The component accepts the requested language as a prop
9. The component accepts the fallback language being displayed as a prop
10. The banner has appropriate padding and spacing that does not overwhelm the content
11. Typography is consistent with the application's design system
12. The banner is responsive and displays appropriately on mobile devices
13. The component integrates with accessibility standards (ARIA role="status" or similar)
14. The banner appears only when a translation was requested but is not available
15. The component handles undefined or null language props gracefully

### From Implementation Plan (Task 3.3)

- File: `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
- Info banner when translation not available
- "French translation not available. Showing content in English."
- Muted styling to not alarm users

### Design Specifications

| Property | Value |
|----------|-------|
| Background Color | Neutral gray (`bg-gray-50` or `bg-slate-50`) |
| Border | Subtle (`border-gray-200`) |
| Icon | Info icon (optional, muted) or no icon |
| Text | 14px, muted gray (`text-gray-500` to `text-gray-600`) |
| Height | ~36-40px (py-2 to py-2.5) |
| Dismissible | No |
| Alarming Elements | None (no red, yellow, or exclamation marks) |

---

## Technical Context

### Existing Codebase Patterns

#### Component Structure Pattern (from LanguageSwitcher, TranslationBanner)

The codebase follows a consistent component organization pattern with folder-based modules:

```
/src/components/ComponentName/
├── index.ts                    # Barrel exports
├── ComponentName.tsx           # Main component
└── ComponentName.types.ts      # TypeScript types
```

#### Info Banner Pattern (from SessionRecoveryBanner, LoginForm)

The codebase uses inline banners with consistent styling patterns:

```tsx
// Info/status pattern (muted, non-alarming)
<div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
  <div className="flex items-center gap-3">
    <p className="text-sm text-gray-600">Message content</p>
  </div>
</div>

// Comparison: Error pattern (alarming - NOT to use)
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <Icon className="h-5 w-5 text-red-400" />
  <p className="text-sm text-red-700">Error message</p>
</div>
```

#### TranslationBanner Pattern (sibling component)

The TranslationBanner component (REQ-E04-009) provides a reference for similar banner implementation:

```tsx
// Light blue for active translations
<aside
  role="status"
  className="bg-[#E3F2FD] border-b border-blue-200 px-4 py-2.5 flex items-center gap-3"
>
  <Globe className="w-4 h-4 text-gray-500" />
  <span className="text-sm text-gray-600">Translated from Spanish</span>
</aside>
```

For MissingTranslationBanner, we use a more muted gray color scheme to indicate informational status without the "active" feel of the blue translation banner.

#### Icon Usage Pattern

- Primary library: Lucide React (`lucide-react`)
- Consistent sizing: `w-4 h-4` (16px), `w-5 h-5` (20px)
- For muted info: Consider `Info` icon with muted colors, or no icon at all
- **Avoid**: AlertTriangle, AlertCircle, XCircle (alarming icons)

#### Styling Conventions

- Tailwind CSS classes with consistent patterns
- Muted colors: `gray-50`, `gray-100`, `gray-200` for backgrounds/borders
- Text colors: `text-gray-500`, `text-gray-600` for subdued text
- Spacing with `px-`, `py-`, `p-` utilities
- Rounded corners with `rounded-lg`, `rounded-md`
- Font styling: `text-sm`, `text-xs`, `font-medium`

### Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Lucide React | Icon (optional) | Installed (^0.525.0) |
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
export interface MissingTranslationBannerProps {
  requestedLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  className?: string;
}
```

---

## Implementation Approach

### Component Architecture

```
/src/components/guest/MissingTranslationBanner/
├── index.ts                            # Barrel exports
├── MissingTranslationBanner.tsx        # Main component implementation
└── MissingTranslationBanner.types.ts   # TypeScript interfaces
```

### Props Interface Design

```typescript
// MissingTranslationBanner.types.ts
import type { SupportedLanguage } from '@/components/LanguageSwitcher';

export interface MissingTranslationBannerProps {
  /** Language code that was requested by the user */
  requestedLanguage: SupportedLanguage;
  /** Language code of the content being displayed as fallback */
  displayLanguage: SupportedLanguage;
  /** Additional CSS classes */
  className?: string;
}
```

### Component Implementation Strategy

1. **Conditional Rendering**: Banner should only render when `requestedLanguage !== displayLanguage`
2. **Language Name Formatting**: Use `getLocaleByCode` from LanguageSwitcher constants to get human-readable names
3. **Accessibility**: Include ARIA `role="status"` for non-intrusive announcement
4. **Muted Styling**: Use gray color scheme to differentiate from active translations (blue) and errors (red)
5. **No Dismissal**: No close button or dismiss functionality
6. **No Alarming Elements**: No exclamation marks, no warning icons, no red/yellow colors

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ French translation not available. Showing content in English.       │
│ ↑ Requested language                  ↑ Fallback language           │
│ (bold/emphasized)                     (normal text)                 │
└─────────────────────────────────────────────────────────────────────┘
Background: bg-gray-50 (light neutral gray)
Border: border-gray-200 (subtle)
Text: text-gray-600 (muted but readable)
Height: ~36-40px (py-2 to py-2.5)
```

### Color Comparison (Visual Hierarchy)

| Banner Type | Background | Purpose |
|-------------|------------|---------|
| TranslationBanner | `#E3F2FD` (light blue) | Active translation is showing |
| **MissingTranslationBanner** | `bg-gray-50` (neutral gray) | Informational - fallback to original |
| Error Banner | `bg-red-50` | Error state (NOT used here) |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/index.ts` | Barrel exports for MissingTranslationBanner component |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Main MissingTranslationBanner component implementation |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | TypeScript type definitions for MissingTranslationBanner |

### Files to Potentially Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/src/components/guest/index.ts` | Add MissingTranslationBanner export | Barrel export for guest components (create if doesn't exist) |

### Functions/Components to Create

| Function/Component | File | Purpose |
|-------------------|------|---------|
| `MissingTranslationBanner` | `MissingTranslationBanner.tsx` | Main React functional component |
| `MissingTranslationBannerProps` | `MissingTranslationBanner.types.ts` | Props interface definition |

### Constants/Utilities to Import

| Import | Source | Purpose |
|--------|--------|---------|
| `SupportedLanguage` | `@/components/LanguageSwitcher` | Type for language codes |
| `getLocaleByCode` | `@/components/LanguageSwitcher` | Get language display name from code |
| `cn` | `@/lib/utils` | Utility for merging Tailwind classes |

---

## Implementation Details

### MissingTranslationBanner.types.ts

```typescript
// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts
// REQ-E04-010: MissingTranslationBanner component types
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher';

/**
 * Props for the MissingTranslationBanner component
 *
 * This banner informs guests when their requested translation is unavailable
 * and shows which language content is being displayed as a fallback.
 * Uses muted styling to communicate status without alarming users.
 */
export interface MissingTranslationBannerProps {
  /** Language code that was requested by the user (ISO 639-1) */
  requestedLanguage: SupportedLanguage;
  /** Language code of the content being displayed as fallback (ISO 639-1) */
  displayLanguage: SupportedLanguage;
  /** Additional CSS classes for styling customization */
  className?: string;
}
```

### MissingTranslationBanner.tsx Structure

```typescript
// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx
// REQ-E04-010: Missing translation info banner for guest content
// Last Modified: 2026-01-20

'use client';

import { cn } from '@/lib/utils';
import type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
import { getLocaleByCode } from '@/components/LanguageSwitcher';

/**
 * MissingTranslationBanner - Displays fallback notice for guest content
 *
 * Features:
 * - Muted gray banner indicating translation is unavailable
 * - Shows requested language name
 * - Shows fallback language name
 * - Non-alarming styling (no red, yellow, or warning icons)
 * - Non-dismissible (always visible when translation unavailable)
 * - Accessible with proper ARIA attributes
 * - Responsive design for mobile and desktop
 */
export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className = ''
}: MissingTranslationBannerProps) {
  // Implementation details...
}

export default MissingTranslationBanner;
```

### index.ts Exports

```typescript
// /src/components/guest/MissingTranslationBanner/index.ts
// REQ-E04-010: MissingTranslationBanner barrel exports
// Last Modified: 2026-01-20

export { MissingTranslationBanner, default } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

---

## Acceptance Criteria Validation

| Criterion | Implementation |
|-----------|----------------|
| Renders when translation unavailable | Conditional render: `requestedLanguage !== displayLanguage` |
| Displays requested language name | Uses `getLocaleByCode(requestedLanguage)` for native name |
| Displays fallback language name | Uses `getLocaleByCode(displayLanguage)` for native name |
| Muted gray background | Tailwind class: `bg-gray-50` |
| Subdued text colors | Tailwind: `text-gray-600`, emphasized with `text-gray-700` |
| Differentiates from error banners | No red/yellow colors, no alarming icons |
| No alarming icons/colors | No AlertTriangle, no exclamation marks |
| Requested language prop | `requestedLanguage: SupportedLanguage` prop |
| Fallback language prop | `displayLanguage: SupportedLanguage` prop |
| Appropriate padding/spacing | Tailwind: `px-4 py-2` for comfortable reading |
| Consistent typography | `text-sm` matching codebase |
| Mobile responsive | Flex layout with responsive text |
| ARIA accessibility | `role="status"` for non-intrusive announcement |
| Only shows when needed | Conditional render based on language mismatch |
| Handles null/undefined props | Guard clause with early return |

---

## Usage Example

```tsx
// In ItemDisplay.tsx or guest page component
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { TranslationBanner } from '@/components/guest/TranslationBanner';

function GuestItemPage({ item, translationMeta }) {
  return (
    <div>
      {/* Show MissingTranslationBanner when requested language unavailable */}
      {!translationMeta.isShowingTranslation &&
       translationMeta.requestedLanguage !== translationMeta.sourceLanguage && (
        <MissingTranslationBanner
          requestedLanguage={translationMeta.requestedLanguage}
          displayLanguage={translationMeta.sourceLanguage}
        />
      )}

      {/* Show TranslationBanner when showing a translation */}
      {translationMeta.isShowingTranslation && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          onViewOriginal={() => setShowOriginal(!showOriginal)}
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

1. Renders with correct muted background color
2. Displays correct requested language name
3. Displays correct fallback language name
4. Does NOT render any alarming icons (AlertTriangle, etc.)
5. Does NOT use red or yellow colors
6. Handles all 6 supported language codes
7. Gracefully handles undefined/null language props
8. Applies custom className prop
9. Does not render when requestedLanguage equals displayLanguage
10. Text is readable (adequate contrast)

### Accessibility Tests

1. Has appropriate ARIA role (`status` for non-intrusive)
2. Screen reader announces status appropriately
3. Color contrast meets WCAG AA standards for gray text
4. No keyboard interaction needed (display-only)

### Visual/Responsive Tests

1. Banner spans full width
2. Content remains readable on mobile (320px width)
3. ~36-40px height maintained across breakpoints
4. Text wraps appropriately on narrow screens

### Differentiation Tests

1. Visually distinct from TranslationBanner (blue)
2. Visually distinct from error messages (red)
3. Does not look like a warning banner (yellow)

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

### Sibling Component

- TranslationBanner (REQ-E04-009) - Similar structure, different color scheme
- Both banners may be used in the same page but are mutually exclusive (only one shows at a time)

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Create types file | 10 min |
| Create component implementation | 30 min |
| Create index.ts exports | 5 min |
| Update guest barrel export | 10 min |
| Unit tests | 25 min |
| **Total** | ~1.5 hours |

---

## References

- Request: `/docs/gen_requests_epic4.md` - REQ-E04-010
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 3.3
- Sibling Component: `/docs/REQ-E04-009-create-translationbanner-component-overview.md`
- Existing Pattern: `/src/components/LanguageSwitcher/` - Component structure
- Consumer: `/src/components/ItemDisplay.tsx` - Will integrate banner
- Types: `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` - SupportedLanguage

---

## Complete Implementation Code

### MissingTranslationBanner.types.ts (Full Implementation)

```typescript
// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts
// REQ-E04-010: MissingTranslationBanner component types
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher';

/**
 * Props for the MissingTranslationBanner component
 *
 * This banner informs guests when their requested translation is unavailable
 * and shows which language content is being displayed as a fallback.
 * Uses muted styling to communicate status without alarming users.
 */
export interface MissingTranslationBannerProps {
  /** Language code that was requested by the user (ISO 639-1) */
  requestedLanguage: SupportedLanguage;
  /** Language code of the content being displayed as fallback (ISO 639-1) */
  displayLanguage: SupportedLanguage;
  /** Additional CSS classes for styling customization */
  className?: string;
}
```

### MissingTranslationBanner.tsx (Full Implementation)

```typescript
// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx
// REQ-E04-010: Missing translation info banner for guest content
// Last Modified: 2026-01-20

'use client';

import { cn } from '@/lib/utils';
import type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
import { getLocaleByCode } from '@/components/LanguageSwitcher';

/**
 * MissingTranslationBanner - Displays fallback notice for guest content
 *
 * Features:
 * - Muted gray banner indicating translation is unavailable
 * - Shows requested language name
 * - Shows fallback language name
 * - Non-alarming styling (no red, yellow, or warning icons)
 * - Non-dismissible (always visible when translation unavailable)
 * - Accessible with proper ARIA attributes
 * - Responsive design for mobile and desktop
 *
 * @example
 * ```tsx
 * <MissingTranslationBanner
 *   requestedLanguage="fr"
 *   displayLanguage="en"
 * />
 * // Renders: "French translation not available. Showing content in English."
 * ```
 */
export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className = ''
}: MissingTranslationBannerProps) {
  // Get human-readable language names
  const requestedLocaleInfo = getLocaleByCode(requestedLanguage);
  const displayLocaleInfo = getLocaleByCode(displayLanguage);

  const requestedLanguageName = requestedLocaleInfo?.name || requestedLanguage.toUpperCase();
  const displayLanguageName = displayLocaleInfo?.name || displayLanguage.toUpperCase();

  // Handle edge cases: missing props or same language (no banner needed)
  if (!requestedLanguage || !displayLanguage) {
    return null;
  }

  // Don't show banner if requested language matches display language
  if (requestedLanguage === displayLanguage) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-label={`${requestedLanguageName} translation not available. Showing content in ${displayLanguageName}.`}
      className={cn(
        // Muted background color - neutral gray for informational status
        'bg-gray-50',
        // Subtle border for definition
        'border-b border-gray-200',
        // Padding for ~36-40px height
        'px-4 py-2',
        // Flex layout for text alignment
        'flex items-center',
        // Text styling - muted but readable
        'text-sm text-gray-600',
        // Custom classes
        className
      )}
    >
      {/* Message text */}
      <p className="m-0">
        <span className="font-medium text-gray-700">
          {requestedLanguageName}
        </span>
        {' '}translation not available.{' '}
        Showing content in{' '}
        <span className="font-medium text-gray-700">
          {displayLanguageName}
        </span>.
      </p>
    </aside>
  );
}

export default MissingTranslationBanner;
```

### index.ts (Full Implementation)

```typescript
// /src/components/guest/MissingTranslationBanner/index.ts
// REQ-E04-010: MissingTranslationBanner barrel exports
// Last Modified: 2026-01-20

// Component exports
export { MissingTranslationBanner, default } from './MissingTranslationBanner';

// Type exports
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

### Guest Components Barrel Export (Create/Update)

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-20

// TranslationBanner - REQ-E04-009
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// MissingTranslationBanner - REQ-E04-010
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// Future guest components will be added here:
// export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
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
| Text contrast too low with gray | Low | Medium | Test with WCAG contrast checker; use `text-gray-600` minimum |
| Banner too visually similar to TranslationBanner | Low | Low | Use distinctly different background (gray vs blue) |

---

## Notes for Implementer

1. **'use client' Directive**: This component doesn't use event handlers but imports from client modules, so mark as client component for consistency
2. **Color Contrast**: Use `text-gray-600` or darker to ensure WCAG AA compliance for readability
3. **No Alarming Elements**: Do NOT use any warning icons (AlertTriangle, AlertCircle), exclamation marks, or red/yellow colors
4. **Muted Styling**: The gray color scheme intentionally makes this banner less prominent than the blue TranslationBanner
5. **Conditional Render**: Component returns `null` if languages match (no banner needed when showing requested language)
6. **Text Format**: Use "X translation not available. Showing content in Y." format for clarity
7. **Language Names**: Use English names from `getLocaleByCode().name` for consistency (e.g., "French" not "Français")
8. **No Actions**: Unlike TranslationBanner, this banner has no actionable elements - it's purely informational

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task: Create MissingTranslationBanner component*
