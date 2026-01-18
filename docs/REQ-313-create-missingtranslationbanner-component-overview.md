# REQ-313: Create MissingTranslationBanner Component - Implementation Overview

**Last Modified:** 2026-01-18 17:30:00 UTC
**Request ID:** REQ-313
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Guest UI Components
**Task ID:** 3.3
**Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a `MissingTranslationBanner` component that displays a subtle, non-alarming informational banner when a guest requests content in a language that does not have a translation available. The banner explains that the original language content is being shown instead.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Banner Component | `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Structure, accessibility, Tailwind styling |
| Utility Function | `/src/lib/utils.ts` | `cn()` function for className composition |
| Types Index | `/src/types/index.ts` | Type export patterns |

### Component Architecture Notes

1. **File Location:** The component will be placed in `/src/components/guest/MissingTranslationBanner/` as specified in the plan
2. **No existing guest directory:** This component will be one of the first in the `/src/components/guest/` namespace
3. **Design System:** Uses Tailwind CSS with muted, neutral styling (gray tones) per acceptance criteria
4. **Icon Library:** Uses Lucide React icons (consistent with project patterns)

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `/src/types/l10n.ts` | NOT CREATED | Types for `SupportedLanguage` - needs to exist first |
| Lucide React | EXISTS | For `Info` or `Globe2` icon |
| `cn` utility | EXISTS | From `/src/lib/utils.ts` |
| Tailwind CSS | EXISTS | For styling |

---

## Implementation Tasks

### Task 1: Create Type Definition File (if not exists)

**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts`

```typescript
/**
 * Type definitions for MissingTranslationBanner component
 * @module guest/MissingTranslationBanner/types
 */

// Note: SupportedLanguage type should be imported from /src/types/l10n.ts
// when that file is created. For now, define locally.
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface MissingTranslationBannerProps {
  /** Language that was requested by the user */
  requestedLanguage: SupportedLanguage;
  /** Language that is being shown instead (source/original language) */
  displayLanguage: SupportedLanguage;
  /** Optional additional CSS classes */
  className?: string;
}
```

### Task 2: Create Main Component

**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Key Requirements:**
1. Muted, neutral background color (light gray: `bg-gray-100`)
2. Info icon that is calm and non-alarming (`Info` from lucide-react with `text-gray-500`)
3. Message format: "[Requested Language] translation not available. Showing content in [Source Language]."
4. Subdued text colors (`text-gray-600` for main text, `text-gray-500` for secondary)
5. Full-width container with appropriate padding
6. Not dismissible (always visible while language mismatch exists)
7. Proper accessibility attributes (`role="status"`, `aria-live="polite"`)
8. Mobile responsive (no horizontal scrolling)
9. Smaller/less prominent font sizing (`text-sm`)

**Component Structure:**
```typescript
'use client';

/**
 * MissingTranslationBanner Component
 *
 * Displays a subtle informational banner when a guest's requested
 * language translation is not available, indicating the content
 * is being shown in the original language instead.
 *
 * @example
 * ```tsx
 * <MissingTranslationBanner
 *   requestedLanguage="fr"
 *   displayLanguage="en"
 * />
 * ```
 *
 * @module guest/MissingTranslationBanner
 * @lastModified 2026-01-18
 */

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';

// Language display name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  nl: 'Dutch',
  it: 'Italian',
};

export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className,
}: MissingTranslationBannerProps) {
  const requestedName = LANGUAGE_NAMES[requestedLanguage] || requestedLanguage;
  const displayName = LANGUAGE_NAMES[displayLanguage] || displayLanguage;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'w-full px-4 py-3',
        'bg-gray-100 border-b border-gray-200',
        'flex items-center gap-3',
        className
      )}
    >
      <Info
        className="w-4 h-4 flex-shrink-0 text-gray-500"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-600">
        <span className="font-medium">{requestedName}</span> translation not available.
        {' '}Showing content in <span className="font-medium">{displayName}</span>.
      </p>
    </div>
  );
}

export default MissingTranslationBanner;
```

### Task 3: Create Barrel Export

**File:** `/src/components/guest/MissingTranslationBanner/index.ts`

```typescript
/**
 * MissingTranslationBanner component exports
 * @module guest/MissingTranslationBanner
 */
export { MissingTranslationBanner, default } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps, SupportedLanguage } from './MissingTranslationBanner.types';
```

### Task 4: Create Guest Components Barrel Export (if not exists)

**File:** `/src/components/guest/index.ts`

```typescript
/**
 * Guest-facing components
 *
 * Components in this directory are designed for public/guest users
 * viewing content without authentication.
 *
 * @module guest
 */

// Translation Status Banners
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';
```

---

## Design Specifications

### Visual Design

| Property | Value | Notes |
|----------|-------|-------|
| Background | `bg-gray-100` | Muted, non-alarming |
| Border | `border-b border-gray-200` | Subtle bottom border |
| Icon | `Info` from lucide-react | 16x16px, `text-gray-500` |
| Text Color (primary) | `text-gray-600` | Subdued but readable |
| Text Color (emphasis) | `font-medium` | For language names |
| Font Size | `text-sm` (14px) | Less prominent than content |
| Padding | `px-4 py-3` | Comfortable spacing |
| Gap | `gap-3` | Between icon and text |

### Accessibility

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `"status"` | Non-urgent informational update |
| `aria-live` | `"polite"` | Announced without interruption |
| Icon `aria-hidden` | `"true"` | Decorative icon |

### Responsive Behavior

- Full width on all screen sizes
- No horizontal scrolling on mobile
- Single-line text that wraps naturally if needed

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Main component |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | Type definitions |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Barrel export |
| `/src/components/guest/index.ts` | Guest components barrel export (if not exists) |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| None | This is a new, self-contained component |

### Functions to CREATE

| Function | Location | Purpose |
|----------|----------|---------|
| `MissingTranslationBanner` | `MissingTranslationBanner.tsx` | Main React component |

### Dependencies to IMPORT

| Import | From | Purpose |
|--------|------|---------|
| `Info` | `lucide-react` | Icon component |
| `cn` | `@/lib/utils` | ClassName utility |

---

## Acceptance Criteria Checklist

From REQ-313:

- [ ] Component renders a banner with muted, neutral background color (light gray)
- [ ] Banner displays an information icon that is calm and non-alarming in style
- [ ] Banner shows text indicating which translation was requested and which language is being displayed instead
- [ ] Message format follows the pattern "[Requested Language] translation not available. Showing content in [Source Language]."
- [ ] Banner uses subdued text colors and styling to avoid drawing excessive attention or creating alarm
- [ ] Component spans the full width of its container with appropriate padding
- [ ] Component is not dismissible and remains visible while the language mismatch exists
- [ ] Component accepts properties for requested language code and source language code
- [ ] Typography uses smaller or less prominent font sizing compared to primary content
- [ ] Banner works correctly on mobile viewports without horizontal scrolling
- [ ] Screen readers announce the banner content with appropriate informational tone
- [ ] Component follows established patterns for non-critical informational banners

---

## Testing Recommendations

### Unit Tests

1. Renders correctly with all supported language pairs
2. Displays correct language names in the message
3. Falls back to language codes when names not found
4. Applies custom className when provided
5. Has correct accessibility attributes

### Visual Tests

1. Mobile viewport (320px) - no horizontal scroll
2. Tablet viewport (768px) - proper spacing
3. Desktop viewport (1024px) - appropriate width

### Integration Tests

1. Banner appears when requested language differs from display language
2. Banner does not appear when languages match
3. Banner remains visible (not dismissible)

---

## Notes

1. **Type Dependency:** The `SupportedLanguage` type is defined locally in the types file. When `/src/types/l10n.ts` is created (REQ-304), this should be updated to import from there.

2. **Language Names:** The component includes a local `LANGUAGE_NAMES` mapping. This should eventually be consolidated with the `SUPPORTED_LANGUAGES` constant from `/src/types/l10n.ts`.

3. **Comparison with TranslationBanner:** Unlike the sibling `TranslationBanner` component (REQ-312) which uses light blue (`#E3F2FD`) for translated content, this component uses gray tones to indicate a neutral/informational state rather than an active translation.

---

## Related Requests

| Request | Description | Relationship |
|---------|-------------|--------------|
| REQ-304 | Create Localization Types File | Provides `SupportedLanguage` type |
| REQ-311 | Create Guest Language Switcher Component | Triggers language changes |
| REQ-312 | Create TranslationBanner Component | Sibling component for translated content |

---

*Generated for FAQBNB L10N Epic 4 - Guest Experience*
