# REQ-346: Create TranslationBanner Component - Detailed Task Breakdown

**Last Modified:** 2026-01-19 14:22:00 UTC
**Request ID:** REQ-346
**Type:** NEW FEATURE
**Size:** S (Small)
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.2
**Status:** Ready for Implementation

---

## Overview

This document provides a granular, step-by-step implementation guide for the TranslationBanner component. The component displays a persistent informational banner when guests view translated content, indicating the source language and providing a "View original" action.

---

## Prerequisites

Before starting implementation, verify the following dependencies exist or will be created as part of this task:

| Dependency | Expected Location | Status | Action if Missing |
|------------|-------------------|--------|-------------------|
| `cn()` utility | `/src/lib/utils.ts` | EXISTS | N/A |
| `lucide-react` | `package.json` | EXISTS | N/A |
| `/src/components/guest/` directory | Directory | LIKELY MISSING | Create as part of Task 1 |
| `SupportedLanguage` type | `/src/types/l10n.ts` | NOT YET CREATED | Define locally or create dependency file |
| `SUPPORTED_LANGUAGES` constant | `/src/types/l10n.ts` | NOT YET CREATED | Define locally or create dependency file |

---

## Task Breakdown

### Task 1: Create Directory Structure
**Effort:** ~5 minutes
**Files:** Directory creation only

#### 1.1 Create guest components directory (if not exists)

Create the following directory structure:

```
/src/components/guest/
└── TranslationBanner/
    ├── index.ts
    ├── TranslationBanner.tsx
    └── TranslationBanner.types.ts
```

**Commands:**
```bash
mkdir -p src/components/guest/TranslationBanner
```

**Verification:**
- [ ] Directory `/src/components/guest/TranslationBanner/` exists

---

### Task 2: Create Type Definitions File
**Effort:** ~10 minutes
**File:** `/src/components/guest/TranslationBanner/TranslationBanner.types.ts`

#### 2.1 Create TranslationBanner.types.ts

Create the types file with the following content:

```typescript
/**
 * TranslationBanner Component Types
 *
 * Type definitions for the TranslationBanner component that displays
 * when guests view translated content.
 *
 * @module guest/TranslationBanner
 * @lastModified 2026-01-19
 */

// Import SupportedLanguage from l10n types if available, otherwise define locally
// TODO: Update import when /src/types/l10n.ts is created (REQ-338)
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'nl';

/**
 * Language display information for supported languages
 */
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

/**
 * Supported languages constant - used for language name lookup
 * TODO: Import from /src/types/l10n.ts when available (REQ-338)
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

/**
 * Props for the TranslationBanner component
 */
export interface TranslationBannerProps {
  /**
   * The original language code of the content being displayed
   * @example 'en'
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Callback function triggered when user clicks "View original"
   * This should switch the content display to the source language
   */
  onViewOriginal: () => void;

  /**
   * Optional additional CSS classes for customization
   */
  className?: string;
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] `SupportedLanguage` type includes all 6 languages: 'en', 'es', 'fr', 'de', 'it', 'nl'
- [ ] `TranslationBannerProps` interface defines `sourceLanguage`, `onViewOriginal`, and optional `className`
- [ ] `SUPPORTED_LANGUAGES` constant contains all 6 language objects with code, name, and nativeName

---

### Task 3: Create Main Component File
**Effort:** ~30 minutes
**File:** `/src/components/guest/TranslationBanner/TranslationBanner.tsx`

#### 3.1 Create TranslationBanner.tsx

Create the main component with the following implementation:

```typescript
'use client';

/**
 * TranslationBanner Component
 *
 * Displays a persistent informational banner when guests view translated content.
 * Shows the source language and provides a "View original" action.
 *
 * @example
 * ```tsx
 * <TranslationBanner
 *   sourceLanguage="en"
 *   onViewOriginal={() => setShowOriginal(true)}
 * />
 * ```
 *
 * @module guest/TranslationBanner
 * @see REQ-346 for implementation requirements
 * @lastModified 2026-01-19
 */

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TranslationBannerProps,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from './TranslationBanner.types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a language code to its English display name
 * @param code - The language code to format
 * @returns The English name of the language, or the code if not found
 */
function formatLanguageName(code: SupportedLanguage): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language?.name ?? code;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationBanner displays when guests view translated content.
 * Shows "Translated from [Language] - View original" with a globe icon.
 *
 * Design Specifications (from PRD):
 * - Background: Light blue (#E3F2FD)
 * - Icon: Globe (from Lucide React)
 * - Text: 14px, gray (#666)
 * - Link: Blue, underlined
 * - Height: ~40px with padding
 * - Non-dismissible
 * - Full width
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  className,
}: TranslationBannerProps) {
  const languageName = formatLanguageName(sourceLanguage);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Layout
        'w-full px-4 py-2.5',
        // Background color from design spec
        'bg-[#E3F2FD]',
        // Flexbox for content alignment
        'flex items-center justify-center gap-2',
        // Typography
        'text-sm',
        // Allow custom styling
        className
      )}
    >
      {/* Globe Icon */}
      <Globe
        className="w-4 h-4 text-gray-600 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Banner Text */}
      <span className="text-gray-600">
        Translated from {languageName}
      </span>

      {/* Separator */}
      <span className="text-gray-400" aria-hidden="true">
        -
      </span>

      {/* View Original Action */}
      <button
        type="button"
        onClick={onViewOriginal}
        className={cn(
          // Text styling
          'text-blue-600 underline',
          // Hover state
          'hover:text-blue-800',
          // Focus state for accessibility
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-[#E3F2FD]',
          // Ensure minimum touch target for accessibility
          'py-0.5 px-1 -my-0.5 -mx-1',
          // Transition
          'transition-colors duration-200'
        )}
        aria-label={`View original content in ${languageName}`}
      >
        View original
      </button>
    </div>
  );
}

export default TranslationBanner;
```

**Implementation Details:**

| Aspect | Implementation | Notes |
|--------|----------------|-------|
| Background Color | `bg-[#E3F2FD]` | Light blue per design spec |
| Globe Icon | `lucide-react` Globe | 16x16px (w-4 h-4) |
| Text Color | `text-gray-600` | ~#666 gray |
| Link Color | `text-blue-600` | Blue with underline |
| Height | `py-2.5` + content | ~40px total |
| Width | `w-full` | Full container width |
| Role | `role="status"` | Semantic meaning for screen readers |
| Live Region | `aria-live="polite"` | Non-intrusive announcement |

**Verification:**
- [ ] Component renders without errors
- [ ] Background is light blue (#E3F2FD)
- [ ] Globe icon displays on the left
- [ ] Text shows "Translated from [Language]" with correct language name
- [ ] "View original" is clickable and styled as a link
- [ ] Clicking "View original" triggers the `onViewOriginal` callback
- [ ] Component has proper ARIA attributes for accessibility
- [ ] Focus states are visible for keyboard navigation

---

### Task 4: Create Barrel Export File
**Effort:** ~5 minutes
**File:** `/src/components/guest/TranslationBanner/index.ts`

#### 4.1 Create index.ts

Create the barrel export file:

```typescript
/**
 * TranslationBanner Component Exports
 *
 * @module guest/TranslationBanner
 */

export { TranslationBanner, default } from './TranslationBanner';
export type {
  TranslationBannerProps,
  SupportedLanguage,
  LanguageInfo,
} from './TranslationBanner.types';
export { SUPPORTED_LANGUAGES } from './TranslationBanner.types';
```

**Verification:**
- [ ] File exports `TranslationBanner` component
- [ ] File exports `TranslationBannerProps` type
- [ ] File exports `SupportedLanguage` type
- [ ] File exports `SUPPORTED_LANGUAGES` constant

---

### Task 5: Create/Update Guest Components Barrel Export (Optional)
**Effort:** ~5 minutes
**File:** `/src/components/guest/index.ts`

#### 5.1 Create or update guest components index

If the file doesn't exist, create it. If it exists, add the TranslationBanner export.

```typescript
/**
 * Guest Components Barrel Exports
 *
 * Components specifically for guest-facing (unauthenticated) experiences.
 *
 * @module components/guest
 */

// TranslationBanner - Shows when viewing translated content
export {
  TranslationBanner,
  type TranslationBannerProps,
  type SupportedLanguage,
  type LanguageInfo,
  SUPPORTED_LANGUAGES,
} from './TranslationBanner';
```

**Verification:**
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] TranslationBanner is exported from the barrel file
- [ ] Import `import { TranslationBanner } from '@/components/guest'` works

---

### Task 6: Verify TypeScript Compilation
**Effort:** ~5 minutes
**Files:** All created files

#### 6.1 Run TypeScript check

```bash
npx tsc --noEmit
```

**Verification:**
- [ ] No TypeScript errors in new files
- [ ] Component imports resolve correctly
- [ ] Type definitions are complete

---

### Task 7: Manual Testing Verification
**Effort:** ~15 minutes
**Files:** Test in a page or Storybook

#### 7.1 Create test usage (temporary or in Storybook)

Test the component with various props:

```tsx
// Test cases to verify:

// Basic usage
<TranslationBanner
  sourceLanguage="en"
  onViewOriginal={() => console.log('View original clicked')}
/>

// With custom class
<TranslationBanner
  sourceLanguage="fr"
  onViewOriginal={() => {}}
  className="shadow-sm"
/>

// All supported languages
{(['en', 'es', 'fr', 'de', 'it', 'nl'] as const).map((lang) => (
  <TranslationBanner
    key={lang}
    sourceLanguage={lang}
    onViewOriginal={() => console.log(`View original for ${lang}`)}
  />
))}
```

**Test Checklist:**

| Test Case | Expected Result |
|-----------|-----------------|
| Renders with `sourceLanguage="en"` | Shows "Translated from English" |
| Renders with `sourceLanguage="fr"` | Shows "Translated from French" |
| Renders with `sourceLanguage="es"` | Shows "Translated from Spanish" |
| Renders with `sourceLanguage="de"` | Shows "Translated from German" |
| Renders with `sourceLanguage="it"` | Shows "Translated from Italian" |
| Renders with `sourceLanguage="nl"` | Shows "Translated from Dutch" |
| Click "View original" | `onViewOriginal` callback fires |
| Mobile viewport (320px) | No horizontal scroll, text wraps |
| Keyboard focus on "View original" | Visible focus ring |
| Screen reader test | Announces banner content appropriately |

**Verification:**
- [ ] All 6 languages display correct English names
- [ ] Click handler fires correctly
- [ ] Mobile responsive (no horizontal scrolling)
- [ ] Accessible via keyboard
- [ ] ARIA attributes work with screen reader

---

## Acceptance Criteria Checklist

Based on REQ-346 requirements:

### Component Structure
- [ ] Component file exists at `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Types file exists at `/src/components/guest/TranslationBanner/TranslationBanner.types.ts`
- [ ] Barrel export file exists at `/src/components/guest/TranslationBanner/index.ts`

### Visual Design
- [ ] Banner has light blue background (#E3F2FD)
- [ ] Globe icon displays on the left side
- [ ] Text shows "Translated from [Language] - View original"
- [ ] Language name is dynamically inserted based on `sourceLanguage` prop
- [ ] "View original" is styled as a clickable link (blue, underlined)
- [ ] Banner spans full width of container
- [ ] Appropriate internal padding (~40px height)
- [ ] Visually distinct but calm, informational appearance

### Functionality
- [ ] Component accepts `sourceLanguage` prop (SupportedLanguage type)
- [ ] Component accepts `onViewOriginal` callback prop
- [ ] Component accepts optional `className` prop
- [ ] Clicking "View original" triggers the callback
- [ ] Component is non-dismissible (no close button)

### Responsive Design
- [ ] Works on mobile viewports without horizontal scrolling
- [ ] Text wraps appropriately on narrow screens
- [ ] Layout doesn't break on any viewport size

### Accessibility
- [ ] Appropriate ARIA attributes (`role`, `aria-live`)
- [ ] "View original" button has proper focus states
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announces content appropriately
- [ ] Minimum touch target size for "View original" (44x44px accessibility)

### Code Quality
- [ ] TypeScript prop types properly defined
- [ ] JSDoc comments on interfaces and component
- [ ] Follows existing banner patterns in codebase
- [ ] Uses `cn()` utility for class merging
- [ ] Uses Lucide React for Globe icon
- [ ] Handles invalid/missing props gracefully

---

## Code Reference Patterns

### Existing Banner Pattern (SessionRecoveryBanner)

Reference: `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`

Key patterns to follow:
- `'use client'` directive at top
- `role="alert"` or `role="status"` for semantic meaning
- `aria-live="polite"` for screen reader announcement
- `cn()` utility for class merging
- Lucide icons with `aria-hidden="true"`
- Clear JSDoc documentation
- Separate type interface definition

### Icon Usage Pattern

```typescript
import { Globe } from 'lucide-react';
// Usage:
<Globe className="w-4 h-4 text-gray-600" aria-hidden="true" />
```

### Class Merging Pattern

```typescript
import { cn } from '@/lib/utils';
// Usage:
className={cn(
  'base-classes',
  'conditional-classes',
  className // Allow override from props
)}
```

---

## File Summary

### Files to Create

| File Path | Purpose | LOC Estimate |
|-----------|---------|--------------|
| `/src/components/guest/TranslationBanner/index.ts` | Barrel export | ~15 |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Main component | ~90 |
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | Type definitions | ~50 |
| `/src/components/guest/index.ts` | Guest components barrel (if not exists) | ~15 |

### Total Estimated Effort

| Task | Effort |
|------|--------|
| Directory setup | 5 min |
| Types file | 10 min |
| Main component | 30 min |
| Barrel exports | 10 min |
| TS verification | 5 min |
| Manual testing | 15 min |
| **Total** | **~75 min** |

---

## Dependencies Graph

```
TranslationBanner
├── lucide-react (Globe icon) - EXISTS
├── @/lib/utils (cn function) - EXISTS
└── Types
    ├── SupportedLanguage - DEFINED LOCALLY (until REQ-338)
    ├── LanguageInfo - DEFINED LOCALLY (until REQ-338)
    └── SUPPORTED_LANGUAGES - DEFINED LOCALLY (until REQ-338)
```

---

## Notes for Implementer

1. **Type Dependency**: The `SupportedLanguage` type and `SUPPORTED_LANGUAGES` constant are defined locally in this component until REQ-338 creates `/src/types/l10n.ts`. Once that file exists, update imports to use the centralized types.

2. **Color Accuracy**: Use `bg-[#E3F2FD]` (Tailwind arbitrary value) to match the exact design spec color. Do not substitute with a Tailwind color class like `bg-blue-50`.

3. **Non-Dismissible**: This banner intentionally has no close button. The banner should always remain visible when translated content is displayed.

4. **Touch Target Size**: The "View original" button has additional padding (`py-0.5 px-1 -my-0.5 -mx-1`) to ensure adequate touch target size while maintaining visual compactness.

5. **Future Integration**: This component will be integrated into `ItemDisplay.tsx` as part of Task 5.2 in the implementation plan. The integration will conditionally render this banner when `translationMeta.isShowingTranslation && !showOriginal`.

---

## References

- **Overview Document**: `/docs/REQ-346-create-translationbanner-component-overview.md`
- **Request Definition**: `/docs/gen_requests_epic4.md` (REQ-346)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **PRD**: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Existing Banner Pattern**: `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- **Utility Functions**: `/src/lib/utils.ts`

---

*Detailed Task Breakdown generated for REQ-346 - TranslationBanner Component*
