# REQ-311: Create Guest Language Switcher Component - Implementation Overview

**Generated:** 2026-01-18 16:30:00 UTC
**Last Modified:** 2026-01-18 16:30:00 UTC
**Request Type:** NEW FEATURE
**Size Estimate:** M (Medium)
**Phase:** 3 - Guest UI Components
**Task ID:** 3.1
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a dedicated GuestLanguageSwitcher component for guest-facing pages that displays all six supported languages with visual indicators of translation availability. This component uses a Radix UI dropdown for accessibility and allows guests to select their preferred language when viewing public content.

---

## Technical Context

### Existing Stack
| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 with App Router |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x with `cn()` utility |
| UI Components | Radix UI primitives (`@radix-ui/react-dropdown-menu: ^2.1.15`) |
| Icons | Lucide React, Heroicons |
| Build Tool | Next.js with Turbopack |

### Relevant Existing Patterns

| Pattern | Location | Usage for This Component |
|---------|----------|--------------------------|
| Radix Dropdown Menu | `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | **Primary pattern to follow** - Uses `DropdownMenu.RadioGroup` for single selection |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Integration target - where component will be used |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Client component where switcher will be embedded |
| cn() Utility | `/src/lib/utils.ts` | Class merging utility (`clsx` + `tailwind-merge`) |
| Types Index | `/src/types/index.ts` | Pattern for type exports |

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| `@radix-ui/react-dropdown-menu` | package.json | Already installed (`^2.1.15`) |
| Lucide React | package.json | Already installed |
| Localization types (`SupportedLanguage`, `LanguageInfo`) | Epic 4 Task 1.1 | Required - must be created first |
| Guest language utilities | Epic 4 Task 1.2 | Required for language persistence |

---

## Requirements from Request

### Acceptance Criteria (from REQ-311)

- [ ] **AC-1:** Component displays a dropdown showing all six supported languages
- [ ] **AC-2:** Each language entry shows a flag icon and the language's native name
- [ ] **AC-3:** Visual checkmark indicator appears next to languages that have translations for the current item
- [ ] **AC-4:** Languages without available translations are visually distinct through styling such as reduced opacity or gray coloring
- [ ] **AC-5:** All languages remain selectable regardless of translation availability
- [ ] **AC-6:** Component uses Radix UI dropdown primitives for proper accessibility support
- [ ] **AC-7:** Dropdown is keyboard navigable with arrow keys, Enter to select, and Escape to close
- [ ] **AC-8:** Screen readers announce the current language selection and available options
- [ ] **AC-9:** Selecting a language updates the guest's language preference and triggers content refresh
- [ ] **AC-10:** Component accepts a property indicating which languages have translations available for the current content
- [ ] **AC-11:** Component displays the currently selected language in the closed state
- [ ] **AC-12:** Dropdown positioning works correctly in various layout contexts without overflow issues
- [ ] **AC-13:** Component follows the project's established styling patterns and design system

---

## Architecture

### Component Structure

```
/src/components/guest/
├── index.ts                                    # Barrel exports for all guest components
└── GuestLanguageSwitcher/
    ├── index.ts                                # Component re-export
    ├── GuestLanguageSwitcher.tsx               # Main component
    └── GuestLanguageSwitcher.types.ts          # TypeScript interfaces
```

### Props Interface

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts

import type { SupportedLanguage } from '@/types';

/**
 * Props for the GuestLanguageSwitcher component.
 *
 * @example
 * <GuestLanguageSwitcher
 *   currentLanguage="en"
 *   availableTranslations={['en', 'fr', 'de']}
 *   sourceLanguage="en"
 *   onLanguageChange={(lang) => handleLanguageChange(lang)}
 * />
 */
export interface GuestLanguageSwitcherProps {
  /** Currently selected/displayed language */
  currentLanguage: SupportedLanguage;

  /** Languages that have translations available for the current item */
  availableTranslations: SupportedLanguage[];

  /** Source/original language of the content */
  sourceLanguage: SupportedLanguage;

  /** Callback when a language is selected */
  onLanguageChange: (language: SupportedLanguage) => void;

  /** Compact mode for mobile layouts (optional) */
  compact?: boolean;

  /** Additional CSS classes for the root element */
  className?: string;

  /** Whether the dropdown is disabled */
  disabled?: boolean;

  /** Dropdown alignment relative to trigger (default: 'end') */
  align?: 'start' | 'center' | 'end';

  /** Side of trigger to display dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}
```

### Component Dependencies Diagram

```
GuestLanguageSwitcher.tsx
├── imports from
│   ├── @radix-ui/react-dropdown-menu (DropdownMenu.*)
│   ├── lucide-react (Check, ChevronDown, Globe)
│   ├── @/lib/utils (cn)
│   └── @/types (SupportedLanguage, SUPPORTED_LANGUAGES)
├── receives props
│   ├── currentLanguage: SupportedLanguage
│   ├── availableTranslations: SupportedLanguage[]
│   ├── sourceLanguage: SupportedLanguage
│   └── onLanguageChange: (lang) => void
└── renders
    ├── DropdownMenu.Trigger (button showing current selection)
    ├── DropdownMenu.Portal
    │   └── DropdownMenu.Content
    │       ├── Header ("Select Language")
    │       └── DropdownMenu.RadioGroup
    │           └── DropdownMenu.RadioItem (for each language)
    │               ├── Flag emoji
    │               ├── Native language name
    │               ├── Checkmark (if translation available)
    │               └── Gray styling (if no translation)
    └── Styling: Tailwind CSS via cn()
```

---

## Implementation Tasks

### Task 1: Create Types File
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts`

Create the TypeScript interface file containing:
- `GuestLanguageSwitcherProps` interface (as defined above)
- JSDoc comments for each prop
- Export statement

**Acceptance Criteria:**
- [ ] Types file exports `GuestLanguageSwitcherProps`
- [ ] All props are properly typed with `SupportedLanguage` type
- [ ] JSDoc documentation included for component usage

---

### Task 2: Create Main Component
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

Create the main component following the `SortMenu.tsx` pattern:

**Structure:**
1. 'use client' directive
2. Import statements (Radix UI, Lucide icons, cn utility, types)
3. Helper function: `getLanguageInfo(code)` - returns language metadata
4. Helper function: `hasTranslation(code, available)` - checks availability
5. Main component implementation

**Visual Design (from PRD):**
- **Trigger Button:**
  - Globe icon + current language flag + native name + chevron
  - Min height 44px for mobile touch targets
  - Border: `border-gray-300`, hover: `border-gray-400`
  - Focus ring: `ring-2 ring-blue-500`

- **Dropdown Content:**
  - Header: "Select Language" (uppercase, gray-500, text-xs)
  - Each item: 48px min height for touch targets
  - Flag emoji + native name + optional checkmark
  - Unavailable languages: `opacity-60` or `text-gray-400`
  - Selected language: `bg-blue-50 text-blue-700`

**Acceptance Criteria:**
- [ ] Uses Radix UI `DropdownMenu.RadioGroup` pattern
- [ ] Shows all 6 languages with flags and native names
- [ ] Checkmark indicator for available translations
- [ ] Gray/muted styling for unavailable translations
- [ ] All languages remain selectable
- [ ] Keyboard navigable (Arrow keys, Enter, Escape)
- [ ] Mobile touch targets (44px trigger, 48px items)
- [ ] Proper ARIA labels for accessibility

---

### Task 3: Create Index Export
**File:** `/src/components/guest/GuestLanguageSwitcher/index.ts`

Create barrel export:
```typescript
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher.types';
```

---

### Task 4: Create Guest Components Barrel Export
**File:** `/src/components/guest/index.ts`

Create or update the guest components barrel export to include:
```typescript
export * from './GuestLanguageSwitcher';
// Future: export * from './TranslationBanner';
// Future: export * from './ViewOriginalToggle';
```

---

### Task 5: Verify Localization Types Exist
**Prerequisite Check:** `/src/types/l10n.ts` or localization types in `/src/types/index.ts`

Before component implementation, verify these types exist (from Task 1.1 of Epic 4):
- `SupportedLanguage` type: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `LanguageInfo` interface with `code`, `name`, `nativeName`, `flag`
- `SUPPORTED_LANGUAGES` constant array

**If types don't exist:** Component should define local types temporarily and mark for refactor when Epic 4 Task 1.1 completes.

---

## Language Data Reference

The component will use this language data (should come from shared types):

```typescript
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Main component implementation |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | TypeScript interfaces |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Component barrel export |
| `/src/components/guest/index.ts` | Guest components barrel export (if doesn't exist) |

### Files to Reference (Read-Only for Pattern)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix dropdown pattern reference |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/src/types/index.ts` | Type export pattern reference |

### Files That May Need Updates (Future Integration)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemDisplay.tsx` | Will integrate GuestLanguageSwitcher in header (Task 5.2 of Epic 4) |
| `/src/app/item/[publicId]/page.tsx` | Will pass translation props (Task 5.1 of Epic 4) |

---

## Code Reference: SortMenu Pattern to Follow

The `SortMenu.tsx` component at `/src/components/ItemManager/components/dialogs/SortMenu.tsx:112-258` provides the exact pattern to follow:

**Key structural elements:**
- Lines 137-173: Trigger button with icon + label + chevron
- Lines 175-256: Portal with content, header, and RadioGroup
- Lines 206-254: RadioItem mapping with checkmark and styling
- Lines 142-162: Tailwind classes for styling (touch targets, focus states)

---

## Testing Considerations

### Manual Testing Scenarios

1. **Visual Verification:**
   - All 6 languages display with correct flags and native names
   - Current language shows in trigger button
   - Available translations show checkmark
   - Unavailable translations appear grayed but clickable

2. **Interaction Testing:**
   - Click opens dropdown
   - Click outside closes dropdown
   - Selecting language calls `onLanguageChange`
   - Escape key closes dropdown

3. **Keyboard Navigation:**
   - Tab focuses trigger button
   - Enter/Space opens dropdown
   - Arrow keys navigate items
   - Enter selects item
   - Escape closes without selection

4. **Accessibility Testing:**
   - Screen reader announces current selection
   - Screen reader announces available options
   - Focus is trapped in dropdown when open
   - Focus returns to trigger on close

5. **Responsive Testing:**
   - Touch targets adequate on mobile (44px/48px)
   - Dropdown positions correctly on small screens
   - Compact mode (if implemented) works properly

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Localization types not yet created | High | Medium | Define local types temporarily; refactor when types available |
| Integration with ItemDisplay delayed | Medium | Low | Component is self-contained; can be integrated later |
| Flag emoji rendering inconsistent | Low | Low | Flags are decorative; component works without them |
| Dropdown positioning on edge of screen | Low | Low | Radix UI handles positioning automatically |

---

## Dependencies and Blockers

### Blocking Dependencies
- **None** - Component can be built standalone with local type definitions

### Soft Dependencies (Nice to Have)
- Epic 4 Task 1.1 (Localization Types) - For shared `SupportedLanguage` and `SUPPORTED_LANGUAGES`
- Epic 4 Task 4.1 (useGuestLanguage hook) - For integration with language persistence

---

## Estimated Effort

| Task | Estimate | Confidence |
|------|----------|------------|
| Create types file | 0.5 hours | High |
| Create main component | 2-3 hours | High |
| Create barrel exports | 0.25 hours | High |
| Testing and refinement | 1 hour | Medium |
| **Total** | **4-5 hours** | High |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` (REQ-311)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Pattern Reference:** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- **Radix UI Docs:** https://www.radix-ui.com/docs/primitives/components/dropdown-menu

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 3, Task 3.1*
