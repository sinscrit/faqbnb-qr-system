# Detailed Task Breakdown: REQ-E04-012 - Create LanguageIndicator Component

**Request ID:** REQ-E04-012
**Title:** Create Language Indicator Component
**Type:** NEW FEATURE
**Size:** S (Small)
**Priority:** P1 - High
**Epic:** Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.5

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Executive Summary

This document provides a detailed, step-by-step implementation guide for creating the LanguageIndicator component. The component displays the current content language with a flag icon in a compact header-friendly format, with an optional subtitle showing "translated from [source language]" when viewing translated content.

**Total Tasks:** 4
**Estimated Effort:** 1-2 hours
**Dependencies:** LocaleContext types from Epic 1

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `/src/contexts/LocaleContext.tsx` exists with `SUPPORTED_LOCALES` and `SupportedLanguage` exports
- [ ] `/src/types/index.ts` re-exports locale types from LocaleContext
- [ ] `/src/lib/utils.ts` exports the `cn` utility function
- [ ] `/src/components/guest/` directory may need to be created (first guest component creates it)

---

## Task 1: Create Types File

**Task ID:** REQ-E04-012-T1
**Complexity:** XS
**Risk:** Low
**Estimated Time:** 5 minutes

### Objective

Create the TypeScript type definitions for the LanguageIndicator component props.

### File to Create

`/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts`

### Implementation Steps

#### Step 1.1: Create Directory Structure

If `/src/components/guest/LanguageIndicator/` does not exist, create it:

```bash
mkdir -p src/components/guest/LanguageIndicator
```

#### Step 1.2: Create Types File

Create `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` with the following content:

```typescript
/**
 * LanguageIndicator Component Types
 *
 * Type definitions for the LanguageIndicator component that displays
 * the current content language with flag and optional translation source.
 *
 * @module guest/LanguageIndicator/types
 * @lastModified 2026-01-20 (REQ-E04-012)
 */

import type { SupportedLanguage } from '@/types';

/**
 * Props for the LanguageIndicator component
 */
export interface LanguageIndicatorProps {
  /**
   * Current display language code (e.g., 'en', 'fr', 'es')
   * Required - determines which flag and language name to show
   */
  currentLanguage: SupportedLanguage;

  /**
   * Whether the content is translated from another language
   * When true and sourceLanguage is provided, shows the translation subtitle
   */
  isTranslated: boolean;

  /**
   * Source language code if content is translated
   * Optional - only used when isTranslated is true
   */
  sourceLanguage?: SupportedLanguage;

  /**
   * Size variant for the indicator
   * - 'default': Standard size for desktop headers
   * - 'compact': Smaller size for mobile or tight spaces
   * @default 'default'
   */
  size?: 'compact' | 'default';

  /**
   * Whether to show the language name beside the flag
   * Set to false for minimal flag-only display
   * @default true
   */
  showName?: boolean;

  /**
   * Additional CSS classes for custom styling
   */
  className?: string;
}
```

### Verification

- [ ] File created at correct path
- [ ] Import from `@/types` works (TypeScript doesn't error)
- [ ] All props documented with JSDoc comments

---

## Task 2: Create LanguageIndicator Component

**Task ID:** REQ-E04-012-T2
**Complexity:** S
**Risk:** Low
**Estimated Time:** 30-45 minutes

### Objective

Implement the main LanguageIndicator component with flag icon, language name, and optional translation subtitle.

### File to Create

`/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

### Implementation Steps

#### Step 2.1: Create Component File

Create `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` with the following content:

```typescript
'use client';

/**
 * LanguageIndicator Component
 *
 * Displays the current content language with a flag icon in a compact
 * header-friendly format. Optionally shows translation source information
 * when viewing translated content.
 *
 * Features:
 * - Flag emoji display for current language
 * - Language name display (optional)
 * - "translated from X" subtitle when viewing translations
 * - Two size variants (default and compact)
 * - Graceful fallback for unknown language codes
 * - Accessible with proper ARIA attributes
 *
 * @module guest/LanguageIndicator
 * @lastModified 2026-01-20 (REQ-E04-012)
 */

import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES } from '@/types';
import type { LanguageIndicatorProps } from './LanguageIndicator.types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Size configuration for different indicator variants
 */
const SIZE_CLASSES = {
  compact: {
    container: 'gap-1',
    flag: 'text-base',
    name: 'text-xs',
    subtitle: 'text-[10px]',
  },
  default: {
    container: 'gap-1.5',
    flag: 'text-lg',
    name: 'text-sm',
    subtitle: 'text-xs',
  },
} as const;

/**
 * Fallback globe emoji for unknown language codes
 */
const FALLBACK_FLAG = '🌐';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get language metadata by code
 *
 * Looks up the language in SUPPORTED_LOCALES and returns its metadata.
 * Returns undefined if the language code is not found.
 *
 * @param code - Language code (e.g., 'en', 'fr')
 * @returns Language metadata object or undefined
 */
function getLanguageInfo(code: string) {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code);
}

// =============================================================================
// Component
// =============================================================================

/**
 * LanguageIndicator Component
 *
 * A compact indicator showing the current display language with an optional
 * subtitle for translated content.
 *
 * @example
 * // Basic usage - showing current language
 * <LanguageIndicator
 *   currentLanguage="fr"
 *   isTranslated={false}
 * />
 *
 * @example
 * // With translation subtitle
 * <LanguageIndicator
 *   currentLanguage="fr"
 *   isTranslated={true}
 *   sourceLanguage="en"
 * />
 *
 * @example
 * // Compact size for mobile
 * <LanguageIndicator
 *   currentLanguage="es"
 *   isTranslated={false}
 *   size="compact"
 * />
 *
 * @example
 * // Flag only (no name)
 * <LanguageIndicator
 *   currentLanguage="de"
 *   isTranslated={false}
 *   showName={false}
 * />
 */
export function LanguageIndicator({
  currentLanguage,
  isTranslated,
  sourceLanguage,
  size = 'default',
  showName = true,
  className,
}: LanguageIndicatorProps) {
  // Get language metadata
  const currentLangInfo = getLanguageInfo(currentLanguage);
  const sourceLangInfo = sourceLanguage ? getLanguageInfo(sourceLanguage) : null;

  // Fallback values for invalid or unknown language codes
  const flag = currentLangInfo?.flag || FALLBACK_FLAG;
  const languageName = currentLangInfo?.name || currentLanguage.toUpperCase();

  // Show subtitle only when translated AND source language is provided AND valid
  const showSubtitle = isTranslated && sourceLangInfo;
  const sourceLanguageName = sourceLangInfo?.name || sourceLanguage?.toUpperCase();

  // Get size-specific styling
  const styles = SIZE_CLASSES[size];

  // Build accessible label
  const ariaLabel = showSubtitle
    ? `Content language: ${languageName}, translated from ${sourceLanguageName}`
    : `Content language: ${languageName}`;

  return (
    <div
      className={cn(
        'inline-flex items-center',
        styles.container,
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      {/* Flag Icon */}
      <span
        className={cn(styles.flag, 'flex-shrink-0')}
        aria-hidden="true"
        role="img"
      >
        {flag}
      </span>

      {/* Language Name and Subtitle Container */}
      {(showName || showSubtitle) && (
        <div className="flex flex-col leading-tight">
          {/* Language Name */}
          {showName && (
            <span className={cn(styles.name, 'font-medium text-gray-800')}>
              {languageName}
            </span>
          )}

          {/* Translation Subtitle */}
          {showSubtitle && (
            <span className={cn(styles.subtitle, 'text-gray-500')}>
              translated from {sourceLanguageName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default LanguageIndicator;
```

### Key Implementation Details

| Aspect | Implementation |
|--------|----------------|
| **Flag Display** | Uses emoji flags from `SUPPORTED_LOCALES.flag` |
| **Fallback** | Globe emoji (🌐) for unknown language codes |
| **Subtitle Logic** | Only shown when `isTranslated=true` AND `sourceLanguage` is provided and valid |
| **Size Variants** | Two sizes with different text/gap classes |
| **Accessibility** | `role="status"` with comprehensive `aria-label` |
| **Styling** | Uses `cn()` for Tailwind class merging |

### Verification

- [ ] Component renders without errors
- [ ] Correct flag displays for each supported language
- [ ] Language name displays beside flag (when `showName=true`)
- [ ] Subtitle appears only when `isTranslated=true` AND `sourceLanguage` is provided
- [ ] `size="compact"` applies smaller styling
- [ ] `showName={false}` hides language name but still shows subtitle if applicable
- [ ] Unknown language codes fall back to globe icon + uppercase code
- [ ] Component has appropriate ARIA attributes

---

## Task 3: Create Component Barrel Export

**Task ID:** REQ-E04-012-T3
**Complexity:** XS
**Risk:** Low
**Estimated Time:** 2 minutes

### Objective

Create the index.ts barrel export for the LanguageIndicator component directory.

### File to Create

`/src/components/guest/LanguageIndicator/index.ts`

### Implementation Steps

#### Step 3.1: Create Barrel Export

Create `/src/components/guest/LanguageIndicator/index.ts` with the following content:

```typescript
/**
 * LanguageIndicator Component Exports
 *
 * Barrel export for the LanguageIndicator component and its types.
 *
 * @module guest/LanguageIndicator
 * @lastModified 2026-01-20 (REQ-E04-012)
 */

export { LanguageIndicator, default } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator.types';
```

### Verification

- [ ] File created at correct path
- [ ] Can import component: `import { LanguageIndicator } from '@/components/guest/LanguageIndicator'`
- [ ] Can import types: `import type { LanguageIndicatorProps } from '@/components/guest/LanguageIndicator'`
- [ ] Default export works: `import LanguageIndicator from '@/components/guest/LanguageIndicator'`

---

## Task 4: Update Guest Components Barrel Export

**Task ID:** REQ-E04-012-T4
**Complexity:** XS
**Risk:** Low
**Estimated Time:** 5 minutes

### Objective

Add LanguageIndicator to the root barrel export for all guest components. If the file doesn't exist (first guest component), create it.

### File to Modify/Create

`/src/components/guest/index.ts`

### Implementation Steps

#### Step 4.1: Check if Guest Index Exists

If `/src/components/guest/index.ts` exists, add the LanguageIndicator export. If it doesn't exist, create it.

#### Step 4.2A: If File Exists - Add Export

Add the following line to the existing exports:

```typescript
export * from './LanguageIndicator';
```

#### Step 4.2B: If File Doesn't Exist - Create It

Create `/src/components/guest/index.ts` with the following content:

```typescript
/**
 * Guest Components Barrel Exports
 *
 * Centralized exports for all guest-facing components used in
 * translated content display and language selection.
 *
 * @module guest
 * @lastModified 2026-01-20 (REQ-E04-012)
 */

// Guest UI Components for translated content display

// REQ-E04-008: Language switcher dropdown
// export * from './GuestLanguageSwitcher';

// REQ-E04-009: Translation source banner
// export * from './TranslationBanner';

// REQ-E04-010: Missing translation notice
// export * from './MissingTranslationBanner';

// REQ-E04-011: View original/translation toggle
// export * from './ViewOriginalToggle';

// REQ-E04-012: Language indicator with flag
export * from './LanguageIndicator';
```

**Note:** The commented exports are placeholders for other guest components from Epic 4 Phase 3. Uncomment them as they are implemented.

### Verification

- [ ] File exists at `/src/components/guest/index.ts`
- [ ] LanguageIndicator export is included
- [ ] Can import from guest: `import { LanguageIndicator } from '@/components/guest'`
- [ ] TypeScript compilation succeeds

---

## Acceptance Criteria Verification

After completing all tasks, verify the following acceptance criteria from the original request:

| # | Acceptance Criterion | Verification Method |
|---|---------------------|---------------------|
| 1 | Component renders in header with minimal width | Visual inspection in guest page |
| 2 | Displays flag icon for current language | Test with each of 6 languages |
| 3 | Displays language name or code beside flag | Verify `showName` prop behavior |
| 4 | Optional subtitle shows "translated from X" | Test with `isTranslated=true` + `sourceLanguage` |
| 5 | Subtitle uses smaller font and muted color | Visual inspection of Tailwind classes |
| 6 | Subtitle positioning adapts for mobile/desktop | Test with `size="compact"` |
| 7 | Accepts current display language as prop | Code review of props interface |
| 8 | Accepts optional source language prop | Code review of optional prop |
| 9 | No subtitle when no source language provided | Test `isTranslated=true` without `sourceLanguage` |
| 10 | Integrates with header design system | Visual inspection, no background/border |
| 11 | Typography matches header style | Uses gray-800, gray-500 colors |
| 12 | Readable on light/dark backgrounds | Uses high-contrast text colors |
| 13 | Responsive on mobile devices | Test `compact` size variant |
| 14 | Accessibility standards met | Verify ARIA role and label |
| 15 | Handles undefined/null language props gracefully | Test with invalid codes → globe fallback |

---

## Testing Scenarios

### Unit Tests to Implement

```typescript
// LanguageIndicator.test.tsx

describe('LanguageIndicator', () => {
  // Render Tests
  it('renders without crashing with minimal props', () => {});
  it('displays correct flag emoji for each supported language', () => {});
  it('displays correct language name for each supported language', () => {});

  // Subtitle Tests
  it('shows subtitle when isTranslated=true and sourceLanguage provided', () => {});
  it('hides subtitle when isTranslated=false', () => {});
  it('hides subtitle when sourceLanguage not provided', () => {});

  // Size Variant Tests
  it('applies default size classes by default', () => {});
  it('applies compact size classes when size="compact"', () => {});

  // showName Prop Tests
  it('shows language name when showName=true (default)', () => {});
  it('hides language name when showName=false', () => {});

  // Edge Cases
  it('shows globe icon for unknown language codes', () => {});
  it('shows uppercase code for unknown languages', () => {});
  it('handles undefined className without errors', () => {});

  // Accessibility Tests
  it('has role="status" attribute', () => {});
  it('has aria-label with language name', () => {});
  it('includes source language in aria-label when translated', () => {});
  it('flag has aria-hidden="true"', () => {});
});
```

### Manual Testing Checklist

- [ ] **Language Iteration:** Test component with all 6 supported languages
- [ ] **Translation State:** Toggle `isTranslated` and verify subtitle behavior
- [ ] **Size Variants:** Compare `default` and `compact` side by side
- [ ] **showName Prop:** Test with `showName={false}` for minimal display
- [ ] **Invalid Language:** Pass an unsupported code like 'xx' and verify fallback
- [ ] **Mobile View:** Test responsive behavior on small viewport
- [ ] **Screen Reader:** Verify ARIA label is announced correctly

---

## Usage Examples

### Basic Usage in Guest Header

```tsx
import { LanguageIndicator } from '@/components/guest';

function GuestItemHeader({ translationMeta }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Logo />

      <div className="flex items-center gap-4">
        {/* Language Indicator */}
        <LanguageIndicator
          currentLanguage={translationMeta.displayLanguage}
          isTranslated={translationMeta.isShowingTranslation}
          sourceLanguage={translationMeta.sourceLanguage}
        />

        {/* Language Switcher (REQ-E04-008) */}
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

### Compact Mobile Header

```tsx
function MobileHeader({ translationMeta }) {
  return (
    <header className="flex items-center justify-between p-2 bg-white">
      <LanguageIndicator
        currentLanguage={translationMeta.displayLanguage}
        isTranslated={translationMeta.isShowingTranslation}
        sourceLanguage={translationMeta.sourceLanguage}
        size="compact"
      />
    </header>
  );
}
```

### Flag Only Display

```tsx
function MinimalIndicator({ language }) {
  return (
    <LanguageIndicator
      currentLanguage={language}
      isTranslated={false}
      showName={false}
      size="compact"
    />
  );
}
```

---

## File Summary

### Files to Create

| File Path | Purpose | Size |
|-----------|---------|------|
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | TypeScript type definitions | ~35 lines |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main indicator component | ~140 lines |
| `/src/components/guest/LanguageIndicator/index.ts` | Component barrel export | ~10 lines |

### Files to Modify

| File Path | Change | Impact |
|-----------|--------|--------|
| `/src/components/guest/index.ts` | Add LanguageIndicator export (create if doesn't exist) | Low |

---

## Dependencies

### Internal Dependencies

| Module | Import | Usage |
|--------|--------|-------|
| `@/lib/utils` | `cn` | Class name merging utility |
| `@/types` | `SupportedLanguage`, `SUPPORTED_LOCALES` | Language type and metadata |

### External Dependencies

| Package | Via | Usage |
|---------|-----|-------|
| `clsx` | `cn()` | Class name composition |
| `tailwind-merge` | `cn()` | Tailwind class deduplication |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flag emojis render inconsistently across browsers/OS | Medium | Low | Use globe fallback (🌐); rely on text for primary info |
| `SUPPORTED_LOCALES` not available at import | Low | Medium | Add null check; fallback to language code display |
| Guest directory doesn't exist yet | Medium | Low | Create directory structure in Task 1 |
| Subtitle causes layout shift | Low | Low | Use consistent line-height; reserve space |

---

## Related Documents

- **Overview Document:** `/docs/REQ-E04-012-create-languageindicator-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Epic 4 Requests:** `/docs/gen_requests_epic4.md` (Request #12)
- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`

### Related Components (Same Phase)

- REQ-E04-008: GuestLanguageSwitcher
- REQ-E04-009: TranslationBanner
- REQ-E04-010: MissingTranslationBanner
- REQ-E04-011: ViewOriginalToggle

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task 3.5: Create LanguageIndicator component*
