# REQ-349: Create LanguageIndicator Component - Detailed Task Breakdown

**Generated:** 2026-01-19 21:00:00 UTC
**Last Modified:** 2026-01-19 21:20:00 UTC
**Request Type:** NEW FEATURE
**Size:** S (Small)
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.5
**Status:** READY FOR IMPLEMENTATION

---

## Summary

Create a compact `LanguageIndicator` component for the guest interface that displays the current display language with a flag icon and language name. When content is translated, an optional subtitle shows "Translated from [Source Language]" to provide transparency about the content's origin. This component is designed for placement in headers or navigation areas where space is limited.

---

## Prerequisites

### Required Dependencies (From Epic 1)

| Dependency | Location | Status |
|------------|----------|--------|
| `localeMetadata` | `/src/lib/i18n/config.ts` | Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `cn` utility | `/src/lib/utils.ts` | Available |

### Verification Steps

Before starting implementation, verify:
1. The i18n config file exists at `/src/lib/i18n/config.ts`
2. The `localeMetadata` export includes `flag` and `nativeName` properties for all 6 locales
3. The `cn` utility function exists in `/src/lib/utils.ts`

---

## Task Breakdown

### Task 1: Create Component Directory Structure

**Story Points:** 0.5
**Estimated Complexity:** Trivial

Create the directory and empty files for the LanguageIndicator component.

#### Subtasks

1.1. Create directory `/src/components/guest/LanguageIndicator/`

1.2. Create empty file `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts`

1.3. Create empty file `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

1.4. Create empty file `/src/components/guest/LanguageIndicator/index.ts`

#### Verification
- [ ] Directory exists at `/src/components/guest/LanguageIndicator/`
- [ ] All three files are created

---

### Task 2: Implement Type Definitions

**Story Points:** 1
**Estimated Complexity:** Low
**File:** `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts`

Define TypeScript interfaces for the LanguageIndicator component props.

#### Implementation Details

```typescript
// /src/components/guest/LanguageIndicator/LanguageIndicator.types.ts
// REQ-349: LanguageIndicator component types
// Last Modified: 2026-01-19

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Props for the LanguageIndicator component
 * Displays the current display language with optional translation source context
 */
export interface LanguageIndicatorProps {
  /**
   * Current display language code
   * Required - determines which flag and language name to display
   */
  currentLanguage: SupportedLocale;

  /**
   * Whether the content is currently showing a translation
   * When true and sourceLanguage is provided, shows "Translated from X" subtitle
   */
  isTranslated: boolean;

  /**
   * Source language code when content is translated (optional)
   * Used to display "Translated from [Language]" subtitle
   */
  sourceLanguage?: SupportedLocale;

  /**
   * Additional CSS classes for customization
   * Applied to the outermost container element
   */
  className?: string;
}
```

#### Acceptance Criteria
- [ ] Interface imports `SupportedLocale` from `/src/lib/i18n/config`
- [ ] All props are documented with JSDoc comments
- [ ] `currentLanguage` and `isTranslated` are required props
- [ ] `sourceLanguage` and `className` are optional props
- [ ] Types compile without errors

---

### Task 3: Implement Main Component

**Story Points:** 2
**Estimated Complexity:** Medium
**File:** `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

Create the main LanguageIndicator component with full functionality.

#### Implementation Details

```typescript
// /src/components/guest/LanguageIndicator/LanguageIndicator.tsx
// REQ-349: LanguageIndicator component
// Last Modified: 2026-01-19

'use client';

import { localeMetadata } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import type { LanguageIndicatorProps } from './LanguageIndicator.types';

/**
 * LanguageIndicator - Displays the current display language with optional translation context
 *
 * Features:
 * - Shows flag emoji and language name for current language
 * - Optional "Translated from X" subtitle when showing translated content
 * - Graceful fallback when flag unavailable
 * - Full accessibility support with aria-label
 * - Max-width constraint for header placement (200px)
 *
 * @example
 * // Basic usage - showing original content
 * <LanguageIndicator
 *   currentLanguage="en"
 *   isTranslated={false}
 * />
 *
 * @example
 * // Showing translated content with source
 * <LanguageIndicator
 *   currentLanguage="fr"
 *   isTranslated={true}
 *   sourceLanguage="en"
 * />
 */
export function LanguageIndicator({
  currentLanguage,
  isTranslated,
  sourceLanguage,
  className,
}: LanguageIndicatorProps) {
  // Get locale metadata for current and source languages
  const currentLocale = localeMetadata[currentLanguage];
  const sourceLocale = sourceLanguage ? localeMetadata[sourceLanguage] : null;

  // Build accessible label for screen readers
  const ariaLabel = isTranslated && sourceLocale
    ? `Currently viewing in ${currentLocale.name}, translated from ${sourceLocale.name}`
    : `Currently viewing in ${currentLocale.name}`;

  // Determine if subtitle should be shown
  const showSubtitle = isTranslated && sourceLocale;

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
      {/* Main language display row */}
      <div className="inline-flex items-center gap-1.5">
        {/* Flag emoji - decorative, hidden from screen readers */}
        {currentLocale.flag && (
          <span
            className="text-base leading-none"
            aria-hidden="true"
          >
            {currentLocale.flag}
          </span>
        )}
        {/* Language name in native form */}
        <span className="text-sm font-medium text-gray-700 truncate">
          {currentLocale.nativeName}
        </span>
      </div>

      {/* Optional "Translated from" subtitle */}
      {showSubtitle && (
        <span className="text-xs text-gray-500 truncate mt-0.5">
          Translated from {sourceLocale.name}
        </span>
      )}
    </div>
  );
}

export default LanguageIndicator;
```

#### Styling Guidelines

| Element | Tailwind Classes | Notes |
|---------|------------------|-------|
| Container | `inline-flex flex-col items-start max-w-[200px]` | Vertical stack, left-aligned, constrained width |
| Main row | `inline-flex items-center gap-1.5` | Horizontal row, 6px gap |
| Flag | `text-base leading-none` | 16px, no extra line height |
| Language name | `text-sm font-medium text-gray-700 truncate` | 14px, semi-bold, dark gray |
| Subtitle | `text-xs text-gray-500 truncate mt-0.5` | 12px, muted gray, 2px top margin |

#### Acceptance Criteria
- [ ] Component is a client component (`'use client'` directive)
- [ ] Component displays flag emoji from `localeMetadata`
- [ ] Component displays language native name (e.g., "Deutsch" for German)
- [ ] Component shows "Translated from [Source Language]" when `isTranslated=true` and `sourceLanguage` provided
- [ ] Subtitle uses `text-xs text-gray-500` styling (smaller, muted)
- [ ] Missing flag displays text-only (no error)
- [ ] Container has `max-w-[200px]` constraint
- [ ] `aria-label` includes full language context for screen readers
- [ ] `role="status"` indicates this is a status indicator
- [ ] `aria-live="polite"` for non-intrusive announcements
- [ ] Flag has `aria-hidden="true"` (decorative)
- [ ] Long text truncates with ellipsis
- [ ] Uses `cn()` utility for className merging

---

### Task 4: Create Barrel Export

**Story Points:** 0.5
**Estimated Complexity:** Trivial
**File:** `/src/components/guest/LanguageIndicator/index.ts`

Create the barrel export file for clean imports.

#### Implementation Details

```typescript
// /src/components/guest/LanguageIndicator/index.ts
// REQ-349: LanguageIndicator barrel exports
// Last Modified: 2026-01-19

// Main component
export { LanguageIndicator, default } from './LanguageIndicator';

// Types
export type { LanguageIndicatorProps } from './LanguageIndicator.types';
```

#### Acceptance Criteria
- [ ] File exports the component as named and default export
- [ ] File exports the props type
- [ ] Import works: `import { LanguageIndicator } from '@/components/guest/LanguageIndicator'`

---

### Task 5: Create/Update Guest Components Barrel

**Story Points:** 0.5
**Estimated Complexity:** Trivial
**File:** `/src/components/guest/index.ts`

Create or update the guest components barrel export to include LanguageIndicator.

#### Implementation Details

Since `/src/components/guest/` directory may not exist yet (from glob results), create it:

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-19

// LanguageIndicator - REQ-349
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';

// Future guest components will be added here:
// export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
// export { TranslationBanner } from './TranslationBanner';
// export { MissingTranslationBanner } from './MissingTranslationBanner';
// export { ViewOriginalToggle } from './ViewOriginalToggle';
```

#### Acceptance Criteria
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] File exports LanguageIndicator component and types
- [ ] Import works: `import { LanguageIndicator } from '@/components/guest'`

---

### Task 6: Manual Testing

**Story Points:** 1
**Estimated Complexity:** Low

Verify the component works correctly in all scenarios.

#### Test Scenarios

| Scenario | Props | Expected Result |
|----------|-------|-----------------|
| English, not translated | `currentLanguage="en"`, `isTranslated={false}` | Shows "English" |
| French, not translated | `currentLanguage="fr"`, `isTranslated={false}` | Shows "Francais" |
| French, translated from English | `currentLanguage="fr"`, `isTranslated={true}`, `sourceLanguage="en"` | Shows "Francais" + "Translated from English" |
| German | `currentLanguage="de"`, `isTranslated={false}` | Shows "Deutsch" |
| German, translated | `currentLanguage="de"`, `isTranslated={true}`, `sourceLanguage="en"` | Shows "Deutsch" + "Translated from English" |
| Custom className | `className="ml-4"` | Custom class applied |
| Missing sourceLanguage | `isTranslated={true}`, no `sourceLanguage` | No subtitle shown |
| All 6 languages | Test each locale | Correct flag and name for each |

#### All 6 Languages Verification

| Locale | Flag | Native Name | English Name |
|--------|------|-------------|--------------|
| en | British | English | English |
| fr | French | Francais | French |
| es | Spanish | Espanol | Spanish |
| de | German | Deutsch | German |
| nl | Dutch | Nederlands | Dutch |
| it | Italian | Italiano | Italian |

#### Accessibility Testing

- [ ] Screen reader announces full language context
- [ ] Component has `role="status"`
- [ ] Component has `aria-live="polite"`
- [ ] Flag has `aria-hidden="true"`
- [ ] Visual contrast meets WCAG AA (gray-700 on white, gray-500 for subtitle)

#### Responsive Testing

- [ ] Component fits in narrow header (< 200px width)
- [ ] Text truncates gracefully when container is constrained
- [ ] Works on mobile viewports

---

### Task 7: Verify Build

**Story Points:** 0.5
**Estimated Complexity:** Trivial

Ensure the project builds successfully with the new component.

#### Steps

7.1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

7.2. Run production build:
```bash
npm run build
```

7.3. Verify no build errors or warnings related to LanguageIndicator

#### Acceptance Criteria
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds
- [ ] No warnings related to new component files

---

## Authorized Files

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | TypeScript interfaces |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main component |
| `/src/components/guest/LanguageIndicator/index.ts` | Barrel exports |
| `/src/components/guest/index.ts` | Guest components barrel (if doesn't exist) |

### Files to Reference (Read Only)

| File Path | Usage |
|-----------|-------|
| `/src/lib/i18n/config.ts` | Import `localeMetadata`, `SupportedLocale` |
| `/src/lib/utils.ts` | Import `cn` utility |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Pattern reference |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Pattern reference |

---

## Dependencies Map

```
LanguageIndicator.tsx
|-- LanguageIndicator.types.ts
|   |-- @/lib/i18n/config (SupportedLocale type)
|-- @/lib/i18n/config (localeMetadata)
|-- @/lib/utils (cn utility)
```

---

## Acceptance Criteria Checklist

From gen_requests_epic4.md REQ-349:

- [ ] Component file exists at `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- [ ] Component displays a flag icon representing the current display language
- [ ] Component displays the language name in text form adjacent to or near the flag icon
- [ ] Flag icons are sourced from a consistent flag icon library or asset set (emoji flags from i18n config)
- [ ] Component accepts a property for the current language code to determine which flag and name to display
- [ ] Component accepts an optional property to specify the source language when content is translated
- [ ] When source language property is provided, component displays a subtitle in smaller, muted text
- [ ] Subtitle follows the format "Translated from [Source Language]" when present
- [ ] Subtitle uses reduced font size and lighter text color to visually de-emphasize it relative to the main language display
- [ ] Component maintains a compact layout suitable for header or navigation bar placement
- [ ] Component does not exceed reasonable width constraints that would disrupt header layouts (approximately 150-200 pixels)
- [ ] Component works correctly on mobile viewports with appropriate responsive sizing
- [ ] Component includes proper accessibility attributes for screen readers to announce current language
- [ ] Screen readers convey both the current display language and the translation source if present
- [ ] Component maintains readable contrast ratios for both the main language name and optional subtitle
- [ ] Component follows the project's design system typography and spacing guidelines
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component handles missing flag assets gracefully, falling back to text-only display if flag cannot be loaded
- [ ] Component remains visually consistent with surrounding header or navigation elements
- [ ] Flag icon sizing is proportional and does not appear overly large or small relative to text

---

## Integration Notes

### Usage in ItemDisplay Component (Future - Task 5.2)

```tsx
// Example integration in /src/components/ItemDisplay.tsx
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
        <GuestLanguageSwitcher {...props} />
      </div>
    </header>
  );
}
```

### Related Components (Same Epic)

| Component | Task | Relationship |
|-----------|------|--------------|
| GuestLanguageSwitcher | 3.1 | Sibling - language selection |
| TranslationBanner | 3.2 | Complement - larger banner with action |
| MissingTranslationBanner | 3.3 | Sibling - missing translation notification |
| ViewOriginalToggle | 3.4 | Sibling - toggle original/translated |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flag emoji not rendering on some systems | Low | Low | Text-only display still functional |
| Component too wide for narrow headers | Low | Medium | `max-w-[200px]` constraint; text truncation |
| i18n config not available | Low | High | Verified in prerequisites; config exists from Epic 1 |
| Styling conflicts with parent | Low | Low | Isolated Tailwind classes; className prop for overrides |

---

## Estimated Effort

| Task | Story Points |
|------|--------------|
| Task 1: Create Directory Structure | 0.5 |
| Task 2: Implement Type Definitions | 1 |
| Task 3: Implement Main Component | 2 |
| Task 4: Create Barrel Export | 0.5 |
| Task 5: Create/Update Guest Components Barrel | 0.5 |
| Task 6: Manual Testing | 1 |
| Task 7: Verify Build | 0.5 |
| **Total** | **6** |

---

## References

- **Overview Document:** `/docs/REQ-349-create-languageindicator-component-overview.md`
- **Requirements:** `/docs/gen_requests_epic4.md` (REQ-349)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 3.5)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Utils Module:** `/src/lib/utils.ts`
- **LanguageSwitcher Pattern:** `/src/components/LanguageSwitcher/`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 4 - Guest Experience*
