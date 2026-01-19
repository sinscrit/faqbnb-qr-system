# REQ-346: Create TranslationBanner Component - Implementation Overview

**Last Modified:** 2026-01-19 13:55:00 UTC
**Request ID:** REQ-346
**Type:** NEW FEATURE
**Size:** S (Small)
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.2
**Status:** Ready for Implementation

---

## Summary

Create a persistent informational banner component that displays when guests view translated content. The banner indicates the source language and provides a clickable "View original" action. This component is part of the guest-facing localization experience and ensures transparency about translation status.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Banner Component | `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Reference pattern for banner styling, accessibility, and layout |
| Icon Usage | `lucide-react` (ExternalLink, ArrowLeft in ItemDisplay) | Use Lucide for Globe icon |
| Styling Utility | `/src/lib/utils.ts` - `cn()` function | Use for class merging |
| Component Types | Separate `.types.ts` files (pattern in implementation plan) | Follow for TranslationBanner.types.ts |
| Client Component | `'use client'` directive (SessionRecoveryBanner, ItemDisplay) | Required for interactive banner |

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `lucide-react` | Existing | Globe icon from project's established icon library |
| `@/lib/utils` | Existing | `cn()` utility for class merging |
| L10N Types | Epic 4 Dependency | `SupportedLanguage` type from `/src/types/l10n.ts` |
| Translation Utils | Epic 4 Dependency | `formatLanguageName()` from `/src/lib/translations/translation-utils.ts` |

### Design Specifications (from PRD)

| Property | Value |
|----------|-------|
| Background Color | Light blue (#E3F2FD) |
| Icon | Globe icon (from Lucide React) |
| Text | "Translated from [Language] - View original" |
| Text Size | 14px, gray (#666) |
| Link Text | "View original" - Blue, underlined |
| Height | ~40px (with padding) |
| Dismissible | No (always visible when showing translated content) |
| Width | Full width of container |

---

## Implementation Approach

### File Structure

```
/src/components/guest/TranslationBanner/
├── index.ts                      # Barrel export
├── TranslationBanner.tsx         # Main component
└── TranslationBanner.types.ts    # TypeScript interfaces
```

### Component Props Interface

```typescript
// /src/components/guest/TranslationBanner/TranslationBanner.types.ts

import { SupportedLanguage } from '@/types/l10n';

export interface TranslationBannerProps {
  /** Original language code of the content (e.g., 'en', 'es') */
  sourceLanguage: SupportedLanguage;
  /** Callback function when "View original" is clicked */
  onViewOriginal: () => void;
  /** Additional CSS classes for customization */
  className?: string;
}
```

### Component Implementation Overview

1. **Imports**: Use `Globe` icon from `lucide-react`, `cn` utility from `@/lib/utils`
2. **Language Name Formatting**: Import `formatLanguageName` from translation utils (or implement inline mapping if not yet available)
3. **Styling**:
   - Container: Light blue background (`#E3F2FD`), full width, padding
   - Flex layout with icon on left, text center/left, action on right
   - Non-dismissible (no close button)
4. **Accessibility**:
   - `role="banner"` or `role="status"` for semantic meaning
   - `aria-live="polite"` for screen reader announcement
   - "View original" should be a button or link with proper focus states
5. **Responsive**: Text wraps appropriately on mobile without horizontal scrolling

### Visual Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 🌐  Translated from English - View original                  │
│                                        ^                     │
│                                        └─ Clickable link     │
└──────────────────────────────────────────────────────────────┘
  ^    ^
  │    └─ Dynamic language name
  └─ Globe icon (lucide-react)

Background: #E3F2FD (light blue)
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/TranslationBanner/index.ts` | Barrel export file |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Main React component |
| `/src/components/guest/TranslationBanner/TranslationBanner.types.ts` | TypeScript type definitions |

### Files to Potentially Update

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/components/guest/index.ts` | Addition | Add export for TranslationBanner (if barrel file exists) |

### Directory Structure Note

The `/src/components/guest/` directory does not currently exist and should be created as part of Epic 4 component creation. If it doesn't exist, create it.

---

## Acceptance Criteria

Based on REQ-346 from gen_requests_epic4.md:

- [ ] Component file exists at `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Component renders a banner with light blue background color (#E3F2FD)
- [ ] Banner displays a globe icon positioned on the left side of the text content
- [ ] Banner shows the text "Translated from [Language] - View original" with dynamic language name insertion
- [ ] Component accepts a property for the source language code to generate the correct language name
- [ ] Component accepts an onClick handler property for the "View original" action
- [ ] "View original" text is styled as clickable with appropriate hover and focus states
- [ ] Banner spans the full width of its container with appropriate internal padding
- [ ] Component is non-dismissible with no close button or dismiss functionality
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Banner is visually distinct from content while maintaining a calm, informational appearance
- [ ] Component works correctly on mobile viewports without horizontal scrolling or layout breaks
- [ ] Banner text wraps appropriately on narrow screens without truncating important information
- [ ] Screen readers announce the banner content and "View original" action with appropriate semantics
- [ ] Component follows established patterns for informational banners used elsewhere in the application
- [ ] Globe icon is sourced from the project's established icon library (lucide-react)
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component includes proper handling for missing or invalid prop values
- [ ] Component remains accessible with proper ARIA attributes and keyboard navigation support

---

## Implementation Steps

1. **Create directory structure** (if not exists)
   - Create `/src/components/guest/TranslationBanner/` directory

2. **Create types file** (`TranslationBanner.types.ts`)
   - Define `TranslationBannerProps` interface
   - Import `SupportedLanguage` type

3. **Create main component** (`TranslationBanner.tsx`)
   - Add `'use client'` directive
   - Import dependencies (Globe icon, cn utility, types)
   - Implement language name lookup/formatting
   - Build JSX structure with proper accessibility attributes
   - Apply Tailwind CSS styles matching design spec

4. **Create barrel export** (`index.ts`)
   - Export component and types

5. **Verify TypeScript compilation**
   - Ensure no type errors

6. **Test component** (manual or automated)
   - Verify visual appearance matches design
   - Test click handler functionality
   - Test mobile responsiveness
   - Verify accessibility with screen reader

---

## Code Reference Examples

### Similar Banner Pattern (from SessionRecoveryBanner)

```typescript
// Reference styling pattern from existing banner
<div
  role="alert"
  aria-live="polite"
  className={cn(
    'relative overflow-hidden',
    'bg-green-50 border border-green-200 rounded-lg',
    'shadow-sm',
    className
  )}
>
```

### Icon Usage Pattern (from ItemDisplay)

```typescript
import { ExternalLink, ArrowLeft } from 'lucide-react';
// Usage: <ExternalLink className="w-12 h-12 mx-auto" />
```

### Language Mapping (from Implementation Plan)

```typescript
// Expected SUPPORTED_LANGUAGES constant (from l10n.ts)
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

---

## Dependencies and Prerequisites

### Required Before Implementation

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| `/src/types/l10n.ts` exists | Check | SupportedLanguage type and SUPPORTED_LANGUAGES constant |
| `/src/components/guest/` directory | Create if missing | Parent directory for guest components |
| Translation utils module | Check | formatLanguageName function (can implement inline if not available) |

### If Dependencies Not Ready

If `SupportedLanguage` type or `formatLanguageName` utility are not yet available from earlier Epic 4 tasks:

1. **Option A**: Define a local type and mapping in the component file temporarily
2. **Option B**: Create the types file (`/src/types/l10n.ts`) as part of this task if it's a blocking dependency

---

## Testing Considerations

### Unit Tests

- Props are correctly applied (sourceLanguage, onViewOriginal, className)
- Language name is correctly formatted for each supported language
- Click handler is called when "View original" is clicked
- Component renders without errors when props are valid
- Component handles edge cases (invalid language codes)

### Accessibility Tests

- Banner has appropriate ARIA attributes
- "View original" is keyboard accessible
- Focus states are visible
- Screen reader announces content appropriately

### Visual/Integration Tests

- Banner appears correctly in ItemDisplay context
- Background color matches #E3F2FD
- Mobile responsiveness (no horizontal scroll)
- Text wrapping on narrow screens

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| L10N types not yet created | Medium | Medium | Implement local type definitions if needed |
| Parent directory doesn't exist | Low | Low | Create directory as part of task |
| Design spec mismatch | Low | Low | Follow PRD exactly, use specified colors |
| Accessibility issues | Low | Medium | Follow established banner patterns, use ARIA properly |

---

## References

- **PRD**: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Definition**: `/docs/gen_requests_epic4.md` (REQ-312/REQ-346)
- **Existing Banner Pattern**: `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- **ItemDisplay Component**: `/src/components/ItemDisplay.tsx`
- **Utility Functions**: `/src/lib/utils.ts`

---

*Implementation Overview generated for REQ-346 - TranslationBanner Component*
