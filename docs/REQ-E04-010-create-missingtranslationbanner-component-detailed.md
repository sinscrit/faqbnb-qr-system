# Detailed Task Breakdown: REQ-E04-010 - Create MissingTranslationBanner Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 23:45:00 UTC
**Request ID:** REQ-E04-010
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.3
**Overview Document:** `docs/REQ-E04-010-create-missingtranslationbanner-component-overview.md`
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a granular, actionable task breakdown for implementing the MissingTranslationBanner component. This component displays a subtle, informational banner notifying guests when their requested translation is unavailable, showing content in the original/fallback language instead. The component uses muted gray styling to communicate this status without alarming users.

**Total Estimated Tasks:** 7 tasks
**Estimated Total Effort:** ~1.5 hours

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites:

- [ ] `/src/components/LanguageSwitcher/` directory exists with `constants.ts` exporting `getLocaleByCode`
- [ ] `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` exports `SupportedLanguage` type
- [ ] `/src/lib/utils.ts` exports `cn` utility function
- [ ] Node.js and npm/pnpm available for local development
- [ ] TypeScript strict mode enabled in project

**Verification Commands:**
```bash
# Verify LanguageSwitcher exists
ls -la src/components/LanguageSwitcher/

# Verify cn utility exists
grep -n "export function cn" src/lib/utils.ts

# Verify SupportedLanguage type exists
grep -n "SupportedLanguage" src/components/LanguageSwitcher/LanguageSwitcher.types.ts
```

---

## Task Breakdown

### Task 1: Create Guest Components Directory Structure

**Task ID:** REQ-E04-010-T1
**Priority:** P0 (Blocking)
**Effort:** 5 minutes
**Dependencies:** None

#### Description
Create the `/src/components/guest/MissingTranslationBanner/` directory structure if it doesn't exist. The guest components directory may need to be created as this is one of the first guest-facing components in Epic 4.

#### Acceptance Criteria
- [ ] Directory `/src/components/guest/` exists
- [ ] Directory `/src/components/guest/MissingTranslationBanner/` exists
- [ ] Directory structure is ready for component files

#### Implementation Steps

1. **Check if guest directory exists:**
   ```bash
   ls -la src/components/guest/ 2>/dev/null || echo "Directory does not exist"
   ```

2. **Create directories if needed:**
   ```bash
   mkdir -p src/components/guest/MissingTranslationBanner
   ```

3. **Verify directory structure:**
   ```bash
   ls -la src/components/guest/MissingTranslationBanner/
   ```

#### Files Created
| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/` | Guest-facing components root directory |
| `/src/components/guest/MissingTranslationBanner/` | MissingTranslationBanner component directory |

---

### Task 2: Create TypeScript Types File

**Task ID:** REQ-E04-010-T2
**Priority:** P0 (Blocking)
**Effort:** 10 minutes
**Dependencies:** Task 1

#### Description
Create the TypeScript interface definitions for the MissingTranslationBanner component props in a dedicated types file.

#### Acceptance Criteria
- [ ] File `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` exists
- [ ] `MissingTranslationBannerProps` interface is exported
- [ ] Props include `requestedLanguage: SupportedLanguage`
- [ ] Props include `displayLanguage: SupportedLanguage`
- [ ] Props include optional `className?: string`
- [ ] JSDoc comments document each prop
- [ ] File header includes request ID and last modified timestamp

#### Implementation Steps

1. **Create the types file:**

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
  /**
   * Language code that was requested by the user (ISO 639-1)
   * Example: 'fr' for French, 'de' for German
   */
  requestedLanguage: SupportedLanguage;

  /**
   * Language code of the content being displayed as fallback (ISO 639-1)
   * Typically the source/original language of the content
   * Example: 'en' for English
   */
  displayLanguage: SupportedLanguage;

  /**
   * Additional CSS classes for styling customization
   * Merged with default component classes via cn() utility
   */
  className?: string;
}
```

2. **Verify TypeScript compilation:**
   ```bash
   npx tsc --noEmit src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts
   ```

#### Files Created
| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | TypeScript interface definitions |

#### Validation
- [ ] No TypeScript errors on compilation
- [ ] Import from `@/components/LanguageSwitcher` resolves correctly
- [ ] All props are properly documented

---

### Task 3: Create Main Component Implementation

**Task ID:** REQ-E04-010-T3
**Priority:** P0 (Critical Path)
**Effort:** 30 minutes
**Dependencies:** Task 2

#### Description
Implement the main MissingTranslationBanner React component with all required functionality including conditional rendering, language name formatting, accessibility attributes, and muted styling.

#### Acceptance Criteria
- [ ] File `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` exists
- [ ] Component is a React functional component with 'use client' directive
- [ ] Component accepts `MissingTranslationBannerProps`
- [ ] Component renders with muted gray background (`bg-gray-50`)
- [ ] Component has subtle border (`border-gray-200`)
- [ ] Text uses muted colors (`text-gray-600`, `text-gray-700` for emphasis)
- [ ] Component displays message format: "[Language] translation not available. Showing content in [Language]."
- [ ] Language names are human-readable (e.g., "French" not "fr")
- [ ] Component returns `null` when `requestedLanguage === displayLanguage`
- [ ] Component returns `null` when props are missing/undefined
- [ ] ARIA `role="status"` is applied for accessibility
- [ ] ARIA `aria-label` provides full message for screen readers
- [ ] No alarming icons, colors, or exclamation marks are used
- [ ] Component is responsive and mobile-friendly
- [ ] Named export and default export both provided

#### Implementation Steps

1. **Create the component file:**

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
 * This component shows a subtle, informational banner when a guest's requested
 * translation is unavailable and content is being shown in the original language.
 *
 * Features:
 * - Muted gray banner indicating translation is unavailable
 * - Shows requested language name (human-readable)
 * - Shows fallback language name (human-readable)
 * - Non-alarming styling (no red, yellow, or warning icons)
 * - Non-dismissible (always visible when translation unavailable)
 * - Accessible with proper ARIA attributes
 * - Responsive design for mobile and desktop
 *
 * @example
 * ```tsx
 * // When French translation is not available, showing English
 * <MissingTranslationBanner
 *   requestedLanguage="fr"
 *   displayLanguage="en"
 * />
 * // Renders: "French translation not available. Showing content in English."
 * ```
 *
 * @example
 * ```tsx
 * // With custom className
 * <MissingTranslationBanner
 *   requestedLanguage="de"
 *   displayLanguage="en"
 *   className="mt-4"
 * />
 * ```
 */
export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className = ''
}: MissingTranslationBannerProps) {
  // Guard clause: Handle missing or undefined props gracefully
  if (!requestedLanguage || !displayLanguage) {
    return null;
  }

  // Don't show banner if requested language matches display language
  // This means the user is viewing content in their requested language
  if (requestedLanguage === displayLanguage) {
    return null;
  }

  // Get human-readable language names using getLocaleByCode
  const requestedLocaleInfo = getLocaleByCode(requestedLanguage);
  const displayLocaleInfo = getLocaleByCode(displayLanguage);

  // Use English name from locale info, fallback to uppercase code if not found
  const requestedLanguageName = requestedLocaleInfo?.name || requestedLanguage.toUpperCase();
  const displayLanguageName = displayLocaleInfo?.name || displayLanguage.toUpperCase();

  // Construct the full message for ARIA label
  const ariaMessage = `${requestedLanguageName} translation not available. Showing content in ${displayLanguageName}.`;

  return (
    <aside
      role="status"
      aria-label={ariaMessage}
      className={cn(
        // Muted background color - neutral gray for informational status
        // Using gray-50 to differentiate from TranslationBanner (blue) and errors (red)
        'bg-gray-50',
        // Subtle border for visual definition without being prominent
        'border-b border-gray-200',
        // Padding for comfortable reading, ~36-40px height
        'px-4 py-2',
        // Flex layout for text alignment
        'flex items-center',
        // Text styling - muted but readable (WCAG AA compliant)
        'text-sm text-gray-600',
        // Custom classes from props (allows override/extension)
        className
      )}
    >
      {/* Message text with emphasized language names */}
      <p className="m-0">
        {/* Requested language name - slightly emphasized */}
        <span className="font-medium text-gray-700">
          {requestedLanguageName}
        </span>
        {' '}translation not available.{' '}
        Showing content in{' '}
        {/* Display language name - slightly emphasized */}
        <span className="font-medium text-gray-700">
          {displayLanguageName}
        </span>
        .
      </p>
    </aside>
  );
}

// Default export for flexible importing
export default MissingTranslationBanner;
```

2. **Verify no TypeScript errors:**
   ```bash
   npx tsc --noEmit src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx
   ```

#### Files Created
| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Main component implementation |

#### Design Notes

| Property | Value | Rationale |
|----------|-------|-----------|
| Background | `bg-gray-50` | Neutral, muted - not alarming like red/yellow |
| Border | `border-b border-gray-200` | Subtle definition, matches sibling TranslationBanner pattern |
| Text | `text-gray-600` | Muted but readable, WCAG AA compliant |
| Emphasis | `font-medium text-gray-700` | Language names stand out slightly |
| Padding | `px-4 py-2` | ~36-40px height, comfortable reading |
| Role | `role="status"` | Non-intrusive ARIA announcement |
| Icons | None | Avoids alarming appearance |

---

### Task 4: Create Barrel Export File

**Task ID:** REQ-E04-010-T4
**Priority:** P1 (High)
**Effort:** 5 minutes
**Dependencies:** Task 2, Task 3

#### Description
Create the barrel export file (index.ts) for the MissingTranslationBanner component to enable clean imports.

#### Acceptance Criteria
- [ ] File `/src/components/guest/MissingTranslationBanner/index.ts` exists
- [ ] Named export `MissingTranslationBanner` is available
- [ ] Default export is available
- [ ] Type export `MissingTranslationBannerProps` is available
- [ ] File header includes request ID and last modified timestamp

#### Implementation Steps

1. **Create the index file:**

```typescript
// /src/components/guest/MissingTranslationBanner/index.ts
// REQ-E04-010: MissingTranslationBanner barrel exports
// Last Modified: 2026-01-20

// Component exports
export { MissingTranslationBanner, default } from './MissingTranslationBanner';

// Type exports
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

2. **Verify exports work:**
   ```bash
   # Test that TypeScript can resolve the exports
   echo "import { MissingTranslationBanner, MissingTranslationBannerProps } from './src/components/guest/MissingTranslationBanner';" > /tmp/test-import.ts
   npx tsc --noEmit /tmp/test-import.ts
   ```

#### Files Created
| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/index.ts` | Barrel exports for clean imports |

---

### Task 5: Create/Update Guest Components Barrel Export

**Task ID:** REQ-E04-010-T5
**Priority:** P1 (High)
**Effort:** 10 minutes
**Dependencies:** Task 4

#### Description
Create or update the `/src/components/guest/index.ts` barrel export file to include the MissingTranslationBanner component. This file may need to be created if this is the first guest component, or updated if TranslationBanner (REQ-E04-009) was implemented first.

#### Acceptance Criteria
- [ ] File `/src/components/guest/index.ts` exists
- [ ] `MissingTranslationBanner` is exported from the guest components barrel
- [ ] `MissingTranslationBannerProps` type is exported
- [ ] If TranslationBanner exists, it remains exported
- [ ] Import path `@/components/guest` resolves correctly

#### Implementation Steps

1. **Check if guest/index.ts exists:**
   ```bash
   ls -la src/components/guest/index.ts 2>/dev/null || echo "File does not exist"
   ```

2. **Create or update the file:**

**If file does NOT exist (create new):**

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-20

// MissingTranslationBanner - REQ-E04-010
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// Future guest components will be added here:
// export { TranslationBanner } from './TranslationBanner';         // REQ-E04-009
// export { GuestLanguageSwitcher } from './GuestLanguageSwitcher'; // REQ-E04-008
// export { ViewOriginalToggle } from './ViewOriginalToggle';       // Task 3.4
// export { LanguageIndicator } from './LanguageIndicator';         // Task 3.5
```

**If file DOES exist (update existing):**

Add the following exports to the existing file:

```typescript
// MissingTranslationBanner - REQ-E04-010
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';
```

3. **Verify exports work:**
   ```bash
   npx tsc --noEmit
   ```

#### Files Created/Modified
| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/components/guest/index.ts` | Create or Update | Guest components barrel exports |

---

### Task 6: Verify Build and TypeScript Compilation

**Task ID:** REQ-E04-010-T6
**Priority:** P1 (High)
**Effort:** 10 minutes
**Dependencies:** Tasks 1-5

#### Description
Verify that the entire project builds successfully with the new component and there are no TypeScript errors.

#### Acceptance Criteria
- [ ] `npm run build` or `pnpm build` completes without errors
- [ ] `npx tsc --noEmit` completes without errors
- [ ] No ESLint errors in the new files
- [ ] Import paths resolve correctly

#### Implementation Steps

1. **Run TypeScript check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Run ESLint:**
   ```bash
   npx eslint src/components/guest/MissingTranslationBanner/
   ```

3. **Run full build:**
   ```bash
   npm run build
   # or
   pnpm build
   ```

4. **Test import from different locations:**
   ```typescript
   // Test these imports work in a temporary file:
   import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
   import { MissingTranslationBanner } from '@/components/guest';
   import type { MissingTranslationBannerProps } from '@/components/guest';
   ```

#### Validation Checklist
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Build completes successfully
- [ ] No runtime errors when importing component

---

### Task 7: Manual Testing and Verification

**Task ID:** REQ-E04-010-T7
**Priority:** P2 (Medium)
**Effort:** 20 minutes
**Dependencies:** Task 6

#### Description
Manually test the component to verify it renders correctly, handles edge cases properly, and meets all acceptance criteria from the original request.

#### Acceptance Criteria
- [ ] Component renders with correct muted gray background
- [ ] Component displays correct requested language name
- [ ] Component displays correct fallback language name
- [ ] Component does NOT render when languages match
- [ ] Component handles all 6 supported language codes correctly
- [ ] Component handles undefined/null props gracefully
- [ ] Banner has appropriate contrast for readability
- [ ] Banner is responsive on mobile viewport
- [ ] No alarming icons or colors are present
- [ ] Screen reader announces status appropriately

#### Test Cases

**Test Case 1: Basic Rendering**
```tsx
// Should render: "French translation not available. Showing content in English."
<MissingTranslationBanner
  requestedLanguage="fr"
  displayLanguage="en"
/>
```

**Test Case 2: Same Language (No Render)**
```tsx
// Should render nothing (null)
<MissingTranslationBanner
  requestedLanguage="en"
  displayLanguage="en"
/>
```

**Test Case 3: All Language Combinations**
```tsx
// Test each supported language as requested
const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
languages.forEach(lang => (
  <MissingTranslationBanner
    requestedLanguage={lang}
    displayLanguage="en"
  />
));
```

**Test Case 4: Undefined Props**
```tsx
// Should render nothing (null) - graceful handling
<MissingTranslationBanner
  requestedLanguage={undefined as any}
  displayLanguage="en"
/>
```

**Test Case 5: Custom ClassName**
```tsx
// Should include custom class
<MissingTranslationBanner
  requestedLanguage="de"
  displayLanguage="en"
  className="mt-4 rounded-lg"
/>
```

**Test Case 6: Mobile Responsiveness**
- Resize browser to 320px width
- Verify text wraps appropriately
- Verify banner remains readable

**Test Case 7: Accessibility**
- Use screen reader to verify `role="status"` announcement
- Verify `aria-label` contains full message
- Check color contrast with browser dev tools

#### Implementation Steps

1. **Create a test page or Storybook story:**

```tsx
// /src/app/test/missing-translation-banner/page.tsx (temporary test page)
'use client';

import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import type { SupportedLanguage } from '@/components/LanguageSwitcher';

export default function TestPage() {
  const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">MissingTranslationBanner Test Page</h1>

      {/* Test Case 1: Basic */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Test 1: French to English</h2>
        <MissingTranslationBanner requestedLanguage="fr" displayLanguage="en" />
      </section>

      {/* Test Case 2: Same Language */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Test 2: Same Language (should be empty)</h2>
        <div className="border border-dashed p-2 min-h-[40px]">
          <MissingTranslationBanner requestedLanguage="en" displayLanguage="en" />
        </div>
      </section>

      {/* Test Case 3: All Languages */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Test 3: All Languages to English</h2>
        <div className="space-y-2">
          {languages.filter(l => l !== 'en').map(lang => (
            <MissingTranslationBanner
              key={lang}
              requestedLanguage={lang}
              displayLanguage="en"
            />
          ))}
        </div>
      </section>

      {/* Test Case 5: Custom ClassName */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Test 5: Custom ClassName</h2>
        <MissingTranslationBanner
          requestedLanguage="it"
          displayLanguage="en"
          className="rounded-lg shadow-sm"
        />
      </section>

      {/* Comparison: TranslationBanner vs MissingTranslationBanner */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Visual Comparison</h2>
        <p className="text-sm text-gray-500 mb-2">
          MissingTranslationBanner should be muted gray, NOT blue
        </p>
        <div className="space-y-2">
          <div className="bg-[#E3F2FD] border-b border-blue-200 px-4 py-2 text-sm text-gray-600">
            TranslationBanner style (Blue - for active translations)
          </div>
          <MissingTranslationBanner requestedLanguage="fr" displayLanguage="en" />
        </div>
      </section>
    </div>
  );
}
```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Navigate to test page and verify:**
   - Visit `http://localhost:3000/test/missing-translation-banner`
   - Check all test cases render correctly
   - Test responsive design by resizing browser
   - Use browser dev tools to inspect accessibility attributes

4. **Clean up test page after verification:**
   ```bash
   rm -rf src/app/test/missing-translation-banner
   ```

---

## Complete File Structure

After all tasks are completed, the following files should exist:

```
/src/components/guest/
├── index.ts                                    # Guest components barrel exports
└── MissingTranslationBanner/
    ├── index.ts                                # Component barrel exports
    ├── MissingTranslationBanner.tsx            # Main component implementation
    └── MissingTranslationBanner.types.ts       # TypeScript type definitions
```

---

## Verification Checklist

### Functional Requirements (from REQ-E04-010)

| # | Requirement | Task | Verified |
|---|-------------|------|----------|
| 1 | Banner renders when translation unavailable | T3, T7 | [ ] |
| 2 | Displays requested language name | T3, T7 | [ ] |
| 3 | Displays fallback language name | T3, T7 | [ ] |
| 4 | Muted gray background color | T3, T7 | [ ] |
| 5 | Subdued text colors | T3, T7 | [ ] |
| 6 | Differentiates from error banners | T3, T7 | [ ] |
| 7 | No alarming icons or colors | T3, T7 | [ ] |
| 8 | Accepts requestedLanguage prop | T2, T3 | [ ] |
| 9 | Accepts displayLanguage prop | T2, T3 | [ ] |
| 10 | Appropriate padding and spacing | T3, T7 | [ ] |
| 11 | Consistent typography | T3, T7 | [ ] |
| 12 | Mobile responsive | T3, T7 | [ ] |
| 13 | ARIA accessibility | T3, T7 | [ ] |
| 14 | Only shows when translation unavailable | T3, T7 | [ ] |
| 15 | Handles null/undefined gracefully | T3, T7 | [ ] |

### Technical Requirements

| Requirement | Task | Verified |
|-------------|------|----------|
| TypeScript strict mode compatible | T2, T3, T6 | [ ] |
| 'use client' directive for client component | T3 | [ ] |
| Named and default exports | T3, T4 | [ ] |
| Barrel exports for clean imports | T4, T5 | [ ] |
| No ESLint errors | T6 | [ ] |
| Project builds successfully | T6 | [ ] |

---

## Usage Examples

### Basic Usage

```tsx
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';

// When French translation is not available
<MissingTranslationBanner
  requestedLanguage="fr"
  displayLanguage="en"
/>
// Renders: "French translation not available. Showing content in English."
```

### In Guest Item Page

```tsx
import { MissingTranslationBanner } from '@/components/guest';
import { TranslationBanner } from '@/components/guest';

function GuestItemPage({ item, translationMeta }) {
  return (
    <div>
      {/* Show MissingTranslationBanner when requested translation unavailable */}
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

      {/* Content */}
      <main>{/* ... */}</main>
    </div>
  );
}
```

### With Custom Styling

```tsx
<MissingTranslationBanner
  requestedLanguage="de"
  displayLanguage="en"
  className="rounded-lg shadow-sm mt-4"
/>
```

---

## Troubleshooting

### Common Issues

**Issue 1: Import path not resolving**
```
Error: Cannot find module '@/components/LanguageSwitcher'
```
**Solution:** Verify `tsconfig.json` has `@/*` path alias configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Issue 2: getLocaleByCode returns undefined**
```
Error: Cannot read property 'name' of undefined
```
**Solution:** The component handles this with a fallback to uppercase language code. If this occurs, verify the `SupportedLanguage` type matches the codes in `SUPPORTED_LOCALES`.

**Issue 3: 'use client' directive error**
```
Error: 'use client' must be at the top of the file
```
**Solution:** Ensure `'use client';` is the very first line in the file, before any imports.

**Issue 4: Type export not working**
```
Error: Type 'MissingTranslationBannerProps' is not exported
```
**Solution:** Use `export type` syntax in the barrel export:
```typescript
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

---

## Dependencies and Related Documents

### Dependencies
| Dependency | Type | Location |
|------------|------|----------|
| `SupportedLanguage` type | Type | `@/components/LanguageSwitcher` |
| `getLocaleByCode` function | Utility | `@/components/LanguageSwitcher` |
| `cn` utility | Utility | `@/lib/utils` |

### Related Epic 4 Components
| Component | Task ID | Status | Relationship |
|-----------|---------|--------|--------------|
| GuestLanguageSwitcher | 3.1 | Pending | Sibling - Language selection |
| TranslationBanner | 3.2 (REQ-E04-009) | Pending | Sibling - Shows when translation IS available |
| ViewOriginalToggle | 3.4 | Pending | Sibling - Toggle translation/original |
| LanguageIndicator | 3.5 | Pending | Sibling - Shows current language |

### References
- Overview Document: `docs/REQ-E04-010-create-missingtranslationbanner-component-overview.md`
- Request: `docs/gen_requests_epic4.md` - REQ-E04-010
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 3.3
- Consumer: `/src/components/ItemDisplay.tsx` - Will integrate banner

---

## Rollback Plan

If implementation needs to be reverted:

1. **Delete created files:**
   ```bash
   rm -rf src/components/guest/MissingTranslationBanner/
   ```

2. **Revert guest/index.ts changes:**
   - Remove MissingTranslationBanner exports
   - If file was newly created and no other components exist, delete it

3. **Verify build:**
   ```bash
   npm run build
   ```

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Task: Create MissingTranslationBanner component*
*Detailed breakdown for AI coding agent or junior developer execution*
