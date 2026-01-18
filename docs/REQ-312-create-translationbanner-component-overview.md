# REQ-312: Create TranslationBanner Component - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Guest UI Components
**Task ID:** 3.2
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a persistent informational banner component that displays at the top of translated content, indicating that the content has been translated from another language and providing access to the original version. The banner uses a light blue (#E3F2FD) background, displays a globe icon, shows "Translated from [Language]" text, and includes a "View original" action link.

---

## Current Behavior

When guests view translated content, there is no visual indication that they are viewing a translation rather than the original content. Guests cannot easily identify the source language or access the original untranslated version, potentially causing confusion about content authenticity and accuracy.

---

## Expected Behavior

A light blue banner appears prominently at the top of any content displayed in a translated language. The banner shows a globe icon followed by text stating "Translated from [Language]" with a clickable "View original" action. The banner uses a professional information design pattern that clearly communicates the translation status without being intrusive or dismissible. Clicking "View original" switches the display to the source language content.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Banner Component Pattern | `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Structural pattern for banner components with role, aria-live, cn() utility |
| Validation Message Component | `/src/components/ItemCapture/components/shared/ValidationMessage.tsx` | Simple info banner pattern with icon, styling records, accessibility |
| cn() Utility | `/src/lib/utils.ts` | Tailwind CSS class merging utility |
| Lucide React Icons | Various components | Icon import and usage pattern |
| Component Types Pattern | `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Props interface with JSDoc comments |

### Technology Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **Icons** | Lucide React |
| **Class Utility** | `cn()` from `/src/lib/utils` |

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| `SupportedLanguage` type | `/src/types/l10n.ts` | Required from Epic 4 Task 1.1 (REQ-304) |
| `SUPPORTED_LANGUAGES` constant | `/src/types/l10n.ts` | Required from Epic 4 Task 1.1 (REQ-304) |
| `formatLanguageName` utility | `/src/lib/translations/translation-utils.ts` | Required from Epic 4 Task 2.4 (REQ-310) |
| Lucide React (Globe icon) | `lucide-react` | Already installed |

---

## Implementation Approach

### Component Architecture

```
/src/components/guest/
├── TranslationBanner/
│   ├── index.ts                      # Barrel exports
│   ├── TranslationBanner.tsx         # Main component
│   └── TranslationBanner.types.ts    # TypeScript interfaces
```

### Props Interface

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.types.ts

import { SupportedLanguage } from '@/types';

export interface TranslationBannerProps {
  /** Original language of the content */
  sourceLanguage: SupportedLanguage;
  /** Callback to view original content */
  onViewOriginal: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

### Component Specifications

| Specification | Value |
|---------------|-------|
| Background Color | Light blue `#E3F2FD` (`bg-[#E3F2FD]`) |
| Icon | Globe from Lucide React |
| Text | "Translated from [Language] - View original" |
| Text Size | 14px (`text-sm`) |
| Text Color | Gray (#666) (`text-gray-600`) |
| Link Color | Blue, underlined (`text-blue-600 underline`) |
| Height | ~40px (via padding) |
| Dismissible | No (always show context) |
| Full Width | Yes, spans container |
| Accessibility | `role="status"`, `aria-live="polite"` |

### Design Mockup

```
┌────────────────────────────────────────────────────────────────────┐
│ 🌐 Translated from English - View original                         │
│    [Globe]  [Text, gray]      [Link, blue underlined]              │
└────────────────────────────────────────────────────────────────────┘
```

---

## Ordered Implementation Tasks

### Task 1: Create Component Directory Structure

**Priority:** Required
**Estimated Effort:** XS

Create the directory structure for the TranslationBanner component:

- [ ] Create `/src/components/guest/` directory (if not exists)
- [ ] Create `/src/components/guest/TranslationBanner/` directory

### Task 2: Create Type Definitions File

**Priority:** Required
**Estimated Effort:** XS

Create `/src/components/guest/TranslationBanner/TranslationBanner.types.ts`:

- [ ] Import `SupportedLanguage` from `@/types`
- [ ] Define `TranslationBannerProps` interface with JSDoc comments
- [ ] Export the interface

### Task 3: Implement TranslationBanner Component

**Priority:** Required
**Estimated Effort:** S

Create `/src/components/guest/TranslationBanner/TranslationBanner.tsx`:

- [ ] Add 'use client' directive
- [ ] Add component JSDoc header with module info and last modified date
- [ ] Import dependencies (React, Globe icon, cn utility, types, formatLanguageName)
- [ ] Implement component with:
  - Light blue background (#E3F2FD)
  - Globe icon on the left
  - "Translated from [Language]" text using `formatLanguageName()`
  - "View original" clickable link
  - Full width with appropriate padding
  - Mobile responsive styling
- [ ] Add accessibility attributes (`role="status"`, `aria-live="polite"`)
- [ ] Export component as both named and default export

### Task 4: Create Barrel Export File

**Priority:** Required
**Estimated Effort:** XS

Create `/src/components/guest/TranslationBanner/index.ts`:

- [ ] Export `TranslationBanner` component
- [ ] Export `TranslationBannerProps` type

### Task 5: Create Guest Components Index (if not exists)

**Priority:** Required
**Estimated Effort:** XS

Create or update `/src/components/guest/index.ts`:

- [ ] Export all TranslationBanner exports
- [ ] Prepare for future guest component exports

### Task 6: Add Unit Tests (Optional for S-size)

**Priority:** Optional (Nice-to-have)
**Estimated Effort:** S

Create `/src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`:

- [ ] Test banner renders with correct source language
- [ ] Test onViewOriginal callback fires when link clicked
- [ ] Test accessibility attributes are present
- [ ] Test custom className is applied

---

## Acceptance Criteria

- [ ] Component renders a banner with a light blue background color (#E3F2FD)
- [ ] Banner displays a globe icon on the left side of the text
- [ ] Banner shows text "Translated from [Language]" where [Language] is replaced with the source language name
- [ ] Banner includes a "View original" clickable text or link element
- [ ] Banner spans the full width of its container with appropriate padding
- [ ] Component is not dismissible and remains visible as long as translated content is displayed
- [ ] Component accepts properties for source language code and an onClick handler for the view original action
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Banner is visually distinct from content but not overly prominent or distracting
- [ ] Component works correctly on mobile viewports without horizontal scrolling
- [ ] Screen readers announce the banner content and "View original" action appropriately
- [ ] Component follows established patterns for informational banners in the application

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Main component implementation |
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | TypeScript interface definitions |
| `/src/components/guest/TranslationBanner/index.ts` | Barrel exports for the component |
| `/src/components/guest/index.ts` | Barrel exports for all guest components |

### Files That May Need Updates

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | May need to export l10n types (if REQ-304 is complete) |

### Directories to Create

| Directory Path | Purpose |
|----------------|---------|
| `/src/components/guest/` | Guest-facing components |
| `/src/components/guest/TranslationBanner/` | TranslationBanner component directory |

---

## Code Examples

### TranslationBanner.types.ts

```typescript
/**
 * TranslationBanner Types
 *
 * Type definitions for the TranslationBanner component.
 *
 * @module guest/TranslationBanner/types
 * @lastModified 2026-01-18 (REQ-312)
 */

import { SupportedLanguage } from '@/types';

/**
 * Props for the TranslationBanner component
 */
export interface TranslationBannerProps {
  /** Original language code of the content (e.g., 'en', 'fr') */
  sourceLanguage: SupportedLanguage;
  /** Callback triggered when "View original" is clicked */
  onViewOriginal: () => void;
  /** Additional CSS classes for customization */
  className?: string;
}
```

### TranslationBanner.tsx (Skeleton)

```typescript
'use client';

/**
 * TranslationBanner Component
 *
 * Displays an informational banner indicating content has been translated
 * from another language, with an option to view the original content.
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
 * @see Plan-111-L10N-Epic4-Guest-Experience.md Task 3.2
 * @lastModified 2026-01-18 (REQ-312)
 */

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatLanguageName } from '@/lib/translations/translation-utils';
import type { TranslationBannerProps } from './TranslationBanner.types';

/**
 * TranslationBanner displays a persistent info banner for translated content.
 *
 * Features:
 * - Light blue background (#E3F2FD) for information context
 * - Globe icon indicating translation
 * - Source language display using native language names
 * - "View original" action link
 * - Non-dismissible (always visible for context)
 * - Accessible with proper ARIA attributes
 */
export function TranslationBanner({
  sourceLanguage,
  onViewOriginal,
  className,
}: TranslationBannerProps) {
  const languageName = formatLanguageName(sourceLanguage);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2.5',
        'bg-[#E3F2FD]',
        'text-sm text-gray-600',
        'w-full',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Globe
        className="w-4 h-4 flex-shrink-0 text-gray-500"
        aria-hidden="true"
      />
      <span>
        Translated from {languageName}
        {' - '}
        <button
          type="button"
          onClick={onViewOriginal}
          className={cn(
            'text-blue-600 underline',
            'hover:text-blue-800',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'transition-colors duration-200'
          )}
        >
          View original
        </button>
      </span>
    </div>
  );
}

export default TranslationBanner;
```

### index.ts (Barrel Export)

```typescript
/**
 * TranslationBanner - Public Exports
 *
 * @module guest/TranslationBanner
 * @lastModified 2026-01-18 (REQ-312)
 */

export { TranslationBanner, default } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner.types';
```

---

## Integration Points

### Usage in ItemDisplay Component

```tsx
// In /src/components/ItemDisplay.tsx (future integration in Task 5.2)

import { TranslationBanner } from '@/components/guest';

// Inside component:
{translationMeta.isShowingTranslation && !showOriginal && (
  <TranslationBanner
    sourceLanguage={translationMeta.sourceLanguage}
    onViewOriginal={toggleOriginal}
  />
)}
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `formatLanguageName` not available | Medium | High | Create fallback to return language code if utility not ready |
| `SupportedLanguage` type not defined | Medium | High | Define local type or use string until REQ-304 complete |
| Layout breaks with long language names | Low | Low | German is typically longest; test and truncate if needed |

### Fallback Strategy

If dependencies from earlier tasks (REQ-304, REQ-310) are not yet available, implement with:

```typescript
// Temporary fallback types until REQ-304 is complete
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// Temporary fallback function until REQ-310 is complete
const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  nl: 'Dutch',
  it: 'Italian',
};

function formatLanguageName(code: SupportedLanguage): string {
  return languageNames[code] || code;
}
```

---

## Testing Checklist

- [ ] Banner renders correctly with English source language
- [ ] Banner renders correctly with all 6 supported languages
- [ ] "View original" button triggers callback
- [ ] Banner has correct background color (#E3F2FD)
- [ ] Globe icon is visible
- [ ] Text is properly formatted
- [ ] Banner is responsive on mobile (320px width)
- [ ] Screen reader announces content correctly
- [ ] Custom className prop applies correctly
- [ ] Component has no horizontal scroll on mobile

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-312
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 3.2
- **Design Specifications:** Plan-111 Section "Design Specifications (From PRD)" - Translation Banner
- **Pattern Reference:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- **Pattern Reference:** `/src/components/ItemCapture/components/shared/ValidationMessage.tsx`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 3 Task 3.2*
