# Detailed Task Breakdown: REQ-E04-009 - Create TranslationBanner Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 23:20:00 UTC
**Request ID:** REQ-E04-009
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.2
**Overview Document:** `docs/REQ-E04-009-create-translationbanner-component-overview.md`
**Status:** Ready for Implementation

---

## Summary

This document provides granular, actionable implementation tasks for creating the TranslationBanner component. The component displays a persistent, non-dismissible banner that informs guests when they are viewing translated content, identifies the source language, and provides an option to view the original version.

---

## Prerequisites

Before starting implementation, ensure:

1. ✅ LanguageSwitcher component exists at `/src/components/LanguageSwitcher/`
2. ✅ `SupportedLanguage` type is exported from `@/components/LanguageSwitcher`
3. ✅ `getLocaleByCode` function is exported from `@/components/LanguageSwitcher`
4. ✅ `cn` utility is available at `@/lib/utils`
5. ✅ Lucide React is installed (`lucide-react ^0.525.0`)
6. ⚠️ `/src/components/guest/` directory may need to be created

---

## Task Breakdown

### Task 1: Create Guest Components Directory Structure

**File:** `/src/components/guest/TranslationBanner/` (directory)

**Description:** Create the directory structure for the TranslationBanner component within the guest components folder.

**Steps:**

1.1. Create the guest components directory if it doesn't exist:
```bash
mkdir -p src/components/guest/TranslationBanner
```

**Acceptance Criteria:**
- [ ] Directory `/src/components/guest/TranslationBanner/` exists

**Estimated Effort:** 1 minute

---

### Task 2: Create TranslationBanner Types File

**File:** `/src/components/guest/TranslationBanner/TranslationBanner.types.ts`

**Description:** Define TypeScript interfaces for the TranslationBanner component props.

**Implementation:**

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
  /**
   * Original language of the content being translated (ISO 639-1 code)
   * @example 'es' for Spanish, 'fr' for French
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Callback when "View original" or "View translation" link is clicked
   * This toggles between showing translated and original content
   */
  onViewOriginal: () => void;

  /**
   * Whether currently showing original content instead of translation
   * When true, displays "View translation" instead of "View original"
   * @default false
   */
  isShowingOriginal?: boolean;

  /**
   * Additional CSS classes for styling customization
   * Applied to the root element of the banner
   */
  className?: string;
}
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/TranslationBanner/TranslationBanner.types.ts`
- [ ] `TranslationBannerProps` interface is exported
- [ ] Interface includes `sourceLanguage: SupportedLanguage` prop
- [ ] Interface includes `onViewOriginal: () => void` prop
- [ ] Interface includes optional `isShowingOriginal?: boolean` prop
- [ ] Interface includes optional `className?: string` prop
- [ ] JSDoc comments document all props
- [ ] Import statement correctly references `@/components/LanguageSwitcher`

**Estimated Effort:** 10 minutes

---

### Task 3: Create TranslationBanner Component Implementation

**File:** `/src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Description:** Implement the main TranslationBanner React functional component with all required features.

**Design Specifications:**
| Property | Value |
|----------|-------|
| Background Color | `#E3F2FD` (light blue) |
| Icon | Globe from `lucide-react` |
| Icon Size | `w-4 h-4` (16px) |
| Icon Color | `text-gray-500` |
| Text Color | `text-gray-600` (main), `text-gray-700` (language name) |
| Text Size | `text-sm` (14px) |
| Action Link Color | `text-blue-600`, underlined |
| Height | Approximately 40px (achieved via `py-2.5`) |
| Dismissible | No (no close button) |
| Border | Bottom border `border-b border-blue-200` |

**Implementation:**

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
  // Handle edge case: no source language provided
  if (!sourceLanguage) {
    return null;
  }

  // Get human-readable language name from the locale constants
  const localeInfo = getLocaleByCode(sourceLanguage);
  const languageName = localeInfo?.name || sourceLanguage.toUpperCase();

  // Determine action text based on current state
  const actionText = isShowingOriginal ? 'View translation' : 'View original';

  // Determine aria-label for accessibility
  const ariaLabel = `Content translated from ${languageName}. ${actionText} available.`;

  return (
    <aside
      role="status"
      aria-label={ariaLabel}
      className={cn(
        // Background color - exact match to design spec #E3F2FD
        'bg-[#E3F2FD]',
        // Border for subtle definition
        'border-b border-blue-200',
        // Padding for approximately 40px height with text
        'px-4 py-2.5',
        // Flex layout with center alignment
        'flex items-center gap-3',
        // Responsive alignment
        'sm:justify-start',
        // Custom classes passed via props
        className
      )}
    >
      {/* Globe Icon - decorative, hidden from screen readers */}
      <Globe
        className="w-4 h-4 text-gray-500 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Translation Status Text */}
      <span className="text-sm text-gray-600">
        Translated from{' '}
        <span className="font-medium text-gray-700">{languageName}</span>
      </span>

      {/* Dot Separator - hidden on mobile for cleaner appearance */}
      <span className="text-gray-400 hidden sm:inline" aria-hidden="true">
        ·
      </span>

      {/* View Original / View Translation Action Button */}
      <button
        type="button"
        onClick={onViewOriginal}
        className={cn(
          // Text styling
          'text-sm text-blue-600',
          // Underline styling
          'underline underline-offset-2',
          // Hover state
          'hover:text-blue-800',
          // Focus state for keyboard accessibility
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:rounded',
          // Smooth transition
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

**Key Implementation Notes:**

1. **'use client' Directive:** Required because component uses `onClick` event handler
2. **Exact Color:** Use `bg-[#E3F2FD]` not `bg-blue-50` (which is `#EFF6FF`, slightly different)
3. **No Close Button:** Intentionally persistent - no dismiss functionality
4. **Graceful Degradation:** Returns `null` if `sourceLanguage` is falsy
5. **Text Toggle:** Button text changes between "View original" and "View translation"
6. **Mobile Responsive:** Separator dot hidden on small screens
7. **Accessibility:** Uses `role="status"` and proper `aria-label` attributes

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Component renders with light blue background (`#E3F2FD`)
- [ ] Globe icon is displayed before the text
- [ ] Source language name is displayed (e.g., "Translated from Spanish")
- [ ] "View original" link is clickable and triggers `onViewOriginal` callback
- [ ] No close/dismiss button exists
- [ ] `isShowingOriginal=true` displays "View translation" instead
- [ ] Component returns `null` when `sourceLanguage` is undefined/empty
- [ ] Custom `className` prop is applied correctly
- [ ] Component has proper ARIA attributes (`role="status"`, `aria-label`)
- [ ] Button is keyboard accessible (focusable, has focus ring)
- [ ] `'use client'` directive is present at top of file

**Estimated Effort:** 30 minutes

---

### Task 4: Create TranslationBanner Index Exports

**File:** `/src/components/guest/TranslationBanner/index.ts`

**Description:** Create barrel exports for the TranslationBanner component and its types.

**Implementation:**

```typescript
// /src/components/guest/TranslationBanner/index.ts
// REQ-E04-009: TranslationBanner barrel exports
// Last Modified: 2026-01-20

// Component exports
export { TranslationBanner, default } from './TranslationBanner';

// Type exports
export type { TranslationBannerProps } from './TranslationBanner.types';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/TranslationBanner/index.ts`
- [ ] Named export `TranslationBanner` is available
- [ ] Default export `TranslationBanner` is available
- [ ] Type export `TranslationBannerProps` is available
- [ ] Import `import { TranslationBanner } from '@/components/guest/TranslationBanner'` works

**Estimated Effort:** 5 minutes

---

### Task 5: Create Guest Components Barrel Export

**File:** `/src/components/guest/index.ts`

**Description:** Create or update the guest components barrel export file to include TranslationBanner.

**Implementation:**

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-20

// TranslationBanner - REQ-E04-009
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// Future guest components will be added here:
// GuestLanguageSwitcher - REQ-E04-008
// MissingTranslationBanner - Task 3.3 (Plan-111)
// ViewOriginalToggle - Task 3.4 (Plan-111)
// LanguageIndicator - Task 3.5 (Plan-111)
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] TranslationBanner is exported from this file
- [ ] TranslationBannerProps type is exported from this file
- [ ] Import `import { TranslationBanner } from '@/components/guest'` works

**Estimated Effort:** 5 minutes

---

### Task 6: Verify Component Integration

**Description:** Verify the component can be imported and rendered correctly.

**Verification Steps:**

6.1. Test import from TranslationBanner folder:
```typescript
import { TranslationBanner, TranslationBannerProps } from '@/components/guest/TranslationBanner';
```

6.2. Test import from guest barrel:
```typescript
import { TranslationBanner } from '@/components/guest';
```

6.3. Create a simple test render (can be temporary):
```tsx
// In any test file or page
<TranslationBanner
  sourceLanguage="es"
  onViewOriginal={() => console.log('Toggle clicked')}
/>
```

6.4. Verify all 6 supported languages render correctly:
- `en` → "English"
- `fr` → "French"
- `es` → "Spanish"
- `de` → "German"
- `nl` → "Dutch"
- `it` → "Italian"

**Acceptance Criteria:**
- [ ] Component imports work from both paths
- [ ] Component renders without errors
- [ ] All 6 language codes display correct English names
- [ ] Click handler is called when action link is clicked
- [ ] TypeScript compilation succeeds with no errors

**Estimated Effort:** 15 minutes

---

### Task 7: Build Verification

**Description:** Run the build to ensure no compilation errors.

**Command:**
```bash
npm run build
```

**Acceptance Criteria:**
- [ ] Build completes successfully with no errors
- [ ] No TypeScript errors related to TranslationBanner
- [ ] No unused variable warnings in TranslationBanner files

**Estimated Effort:** 5 minutes

---

## Task Summary Table

| Task # | Description | File(s) | Effort |
|--------|-------------|---------|--------|
| 1 | Create directory structure | `src/components/guest/TranslationBanner/` | 1 min |
| 2 | Create types file | `TranslationBanner.types.ts` | 10 min |
| 3 | Create component implementation | `TranslationBanner.tsx` | 30 min |
| 4 | Create component index exports | `TranslationBanner/index.ts` | 5 min |
| 5 | Create guest barrel export | `guest/index.ts` | 5 min |
| 6 | Verify component integration | N/A (testing) | 15 min |
| 7 | Build verification | N/A (build) | 5 min |
| **Total** | | | **~71 min** |

---

## Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | TypeScript interface definitions |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Main component implementation |
| `/src/components/guest/TranslationBanner/index.ts` | Barrel exports for component |
| `/src/components/guest/index.ts` | Guest components barrel exports (create if doesn't exist) |

---

## Files to Read (Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/index.ts` | Import types and utilities |
| `/src/components/LanguageSwitcher/constants.ts` | Reference `getLocaleByCode` implementation |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Reference `SupportedLanguage` type |
| `/src/lib/utils.ts` | Import `cn` utility function |

---

## Acceptance Criteria Checklist (From Request #9)

| # | Criterion | Task |
|---|-----------|------|
| 1 | Banner renders with light blue background (#E3F2FD) | Task 3 |
| 2 | Banner displays text indicating source language | Task 3 |
| 3 | Banner includes globe icon | Task 3 |
| 4 | Banner includes actionable "View original" text | Task 3 |
| 5 | Banner is not dismissible (no close button) | Task 3 |
| 6 | Clicking "View original" triggers callback | Task 3 |
| 7 | Banner has appropriate padding and spacing | Task 3 |
| 8 | Typography is consistent with design system | Task 3 |
| 9 | Component accepts sourceLanguage as prop | Task 2, 3 |
| 10 | Component accepts callback for "View original" action | Task 2, 3 |
| 11 | Banner is responsive on mobile | Task 3 |
| 12 | Component integrates with accessibility standards | Task 3 |
| 13 | Banner appears only when translated content displayed | Task 3 (via conditional render) |
| 14 | Component handles undefined/null source language | Task 3 |

---

## Testing Considerations

### Unit Test Cases (for future implementation)

1. **Render Tests:**
   - Renders with correct background color class
   - Displays Globe icon
   - Shows correct source language name for all 6 languages
   - "View original" link is present

2. **Interaction Tests:**
   - `onViewOriginal` callback is called when link clicked
   - Button text toggles between "View original" and "View translation"

3. **Edge Case Tests:**
   - Returns `null` when `sourceLanguage` is undefined
   - Returns `null` when `sourceLanguage` is empty string
   - Custom `className` is applied correctly

4. **Accessibility Tests:**
   - Has `role="status"` attribute
   - Has appropriate `aria-label`
   - Button is keyboard focusable
   - Focus ring is visible on focus

---

## Dependencies

### Required (Must Exist):
- `@/components/LanguageSwitcher` - Provides `SupportedLanguage` type and `getLocaleByCode` function
- `@/lib/utils` - Provides `cn` utility for className merging
- `lucide-react` - Provides `Globe` icon component

### No External Blockers:
This component is standalone and does not depend on:
- Database tables or API endpoints
- Other Epic 4 components (will be consumed by ItemDisplay later)
- Backend translation infrastructure

---

## Usage Example

After implementation, the component will be used like this:

```tsx
// In ItemDisplay.tsx or guest page component
import { TranslationBanner } from '@/components/guest/TranslationBanner';

function GuestItemPage({ item, translationMeta }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div>
      {/* Show banner only when viewing translated content */}
      {translationMeta.isShowingTranslation && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          onViewOriginal={() => setShowOriginal(!showOriginal)}
          isShowingOriginal={showOriginal}
        />
      )}

      {/* Content area */}
      <main>
        <h1>{showOriginal ? item.originalName : item.name}</h1>
        {/* ... */}
      </main>
    </div>
  );
}
```

---

## Notes for Implementer

1. **Start with Task 1:** Create directory structure first
2. **Follow Task Order:** Tasks are sequenced for logical progression
3. **Use Exact Hex Color:** `bg-[#E3F2FD]` not `bg-blue-50` for precise color match
4. **No Dismiss Logic:** Do NOT add any close button or dismiss functionality
5. **Keep It Simple:** This is a small component - avoid over-engineering
6. **Commit After Task 5:** All code files complete at that point

---

## References

- Overview Document: `docs/REQ-E04-009-create-translationbanner-component-overview.md`
- Request: `docs/gen_requests_epic4.md` - REQ-E04-009
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 3.2
- Existing Pattern: `src/components/LanguageSwitcher/` - Component structure reference
- Consumer: `src/components/ItemDisplay.tsx` - Will integrate banner (future task)

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task: Create TranslationBanner component - Detailed Breakdown*
