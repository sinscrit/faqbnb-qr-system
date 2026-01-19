# REQ-345: Create GuestLanguageSwitcher Component - Implementation Overview

**Document Created:** 2026-01-19 04:15 UTC
**Last Modified:** 2026-01-19 04:15 UTC
**Request ID:** REQ-345
**Type:** NEW FEATURE
**Size:** M
**Phase:** 3 - Guest UI Components (Task 3.1)
**Epic:** L10N Epic 4 - Guest Experience
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## 1. Summary

Create a dedicated language selection dropdown component for guest-facing pages that displays all six supported languages with their native names and flag icons. The component must indicate which languages have translations available for the current content using checkmark indicators, while languages without available translations appear visually distinct but remain selectable. The implementation uses Radix UI dropdown primitives for full accessibility support including keyboard navigation and screen reader compatibility.

---

## 2. Current State Analysis

### Existing Infrastructure

| Resource | Location | Status |
|----------|----------|--------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Available - Exports `locales`, `localeMetadata`, `SupportedLocale` |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | Available - Provides `useLocale()`, `useSetLocale()` hooks |
| Existing LanguageSwitcher | `/src/components/LanguageSwitcher/` | Available - For authenticated users (custom dropdown, not Radix) |
| Radix UI Dropdown | `@radix-ui/react-dropdown-menu` v2.1.15 | Installed - Used in SortMenu, GuideColumnSettingsPopup |
| Lucide Icons | `lucide-react` v0.525.0 | Installed - Provides Globe, ChevronDown, Check icons |
| Utility Functions | `/src/lib/utils.ts` | Available - `cn()` for Tailwind class composition |

### Database Schema

Translation tables are in place with RLS enabled:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `item_translations` | Item name/description translations | `item_id`, `language`, `translation_status` |
| `article_translations` | Article title/description translations | `article_id`, `language`, `translation_status` |
| `link_translations` | Link title translations | `link_id`, `language`, `translation_status` |
| `tag_translations` | Tag value translations | `tag_key`, `language`, `translated_value` |

Translation status values: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`

### Locale Configuration from Epic 1

```typescript
// From /src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};
```

### Relevant Existing Patterns

**Radix UI Dropdown Pattern** (from `/src/components/ItemManager/components/dialogs/SortMenu.tsx`):
```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button>...</button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.RadioGroup value={value} onValueChange={setValue}>
        <DropdownMenu.RadioItem value="option1">...</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

---

## 3. Requirements Mapping

| PRD Acceptance Criteria | Implementation Task |
|------------------------|---------------------|
| Dropdown with all 6 languages | Use `locales` from config, render all 6 options |
| Show flags and native names | Use `localeMetadata` for flag emoji and `nativeName` |
| Indicate which languages have translations (checkmark) | Accept `availableTranslations` prop, show checkmark icon |
| Gray out unavailable translations (but still selectable) | Apply `opacity-50` or `text-gray-400` class, keep `onClick` active |
| Use Radix UI dropdown for accessibility | Implement with `@radix-ui/react-dropdown-menu` |
| Full keyboard navigation | Radix UI provides ArrowUp/Down, Enter, Escape natively |
| Screen reader support | Radix UI provides ARIA attributes automatically |

---

## 4. Technical Design

### Component Architecture

```
/src/components/guest/
├── index.ts                                  # Barrel exports for all guest components
└── GuestLanguageSwitcher/
    ├── index.ts                              # Component re-export
    ├── GuestLanguageSwitcher.tsx             # Main component implementation
    └── GuestLanguageSwitcher.types.ts        # TypeScript interfaces
```

### Props Interface

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts

import type { SupportedLocale } from '@/lib/i18n/config';

export interface GuestLanguageSwitcherProps {
  /** Currently selected language code */
  currentLanguage: SupportedLocale;

  /** Languages that have translations available for current content */
  availableTranslations: SupportedLocale[];

  /** Source/original language of the content */
  sourceLanguage: SupportedLocale;

  /** Callback invoked when user selects a different language */
  onLanguageChange: (language: SupportedLocale) => void;

  /** Compact variant for tight spaces (mobile headers) */
  compact?: boolean;

  /** Additional CSS classes for custom styling */
  className?: string;

  /** Disable the dropdown */
  disabled?: boolean;
}
```

### Component Implementation Outline

```tsx
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx
'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { locales, localeMetadata } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher.types';

export function GuestLanguageSwitcher({
  currentLanguage,
  availableTranslations,
  sourceLanguage,
  onLanguageChange,
  compact = false,
  className,
  disabled = false,
}: GuestLanguageSwitcherProps) {
  const currentLocale = localeMetadata[currentLanguage];

  const hasTranslation = (lang: SupportedLocale) =>
    lang === sourceLanguage || availableTranslations.includes(lang);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {/* Trigger button showing current language */}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup
            value={currentLanguage}
            onValueChange={(val) => onLanguageChange(val as SupportedLocale)}
          >
            {locales.map((lang) => (
              <DropdownMenu.RadioItem key={lang} value={lang}>
                {/* Flag, native name, checkmark indicator */}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### Visual Design Specifications

| Element | Specification |
|---------|---------------|
| Trigger Button | White background, gray border, rounded corners (8px), min-width 140px |
| Trigger Content | Flag emoji (16px), native name, ChevronDown icon |
| Dropdown Content | White background, shadow-lg, rounded-md, z-50 |
| Menu Item | Padding 8px 12px, hover bg-gray-100, cursor-pointer |
| Available Language | Full opacity, checkmark icon (green) on right |
| Unavailable Language | Opacity 50%, no checkmark, still selectable |
| Current Selection | Background gray-100, checkmark visible |
| Touch Target | Minimum 44x44px for accessibility |

### Styling Classes (Tailwind)

```tsx
// Trigger button
const triggerClasses = cn(
  'inline-flex items-center justify-between gap-2',
  'min-w-[140px] px-3 py-2',
  'bg-white border border-gray-300 rounded-lg',
  'text-sm font-medium text-gray-700',
  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  compact && 'min-w-[100px] px-2 py-1.5 text-xs'
);

// Dropdown content
const contentClasses = cn(
  'min-w-[180px] bg-white rounded-md shadow-lg',
  'border border-gray-200 py-1 z-50',
  'animate-in fade-in-0 zoom-in-95'
);

// Menu item
const itemClasses = (isAvailable: boolean, isSelected: boolean) => cn(
  'flex items-center justify-between gap-2 px-3 py-2',
  'text-sm cursor-pointer outline-none',
  'hover:bg-gray-100 focus:bg-gray-100',
  isSelected && 'bg-gray-100',
  !isAvailable && 'opacity-50'
);
```

---

## 5. Dependencies

### Required from Epic 1/3

| Dependency | Source | Status |
|------------|--------|--------|
| `locales` constant | `/src/lib/i18n/config.ts` | ✅ Available |
| `localeMetadata` constant | `/src/lib/i18n/config.ts` | ✅ Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | ✅ Available |
| Translation tables | Supabase database | ✅ Available |

### NPM Dependencies (Already Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-dropdown-menu` | ^2.1.15 | Accessible dropdown primitive |
| `lucide-react` | ^0.525.0 | Icons (Globe, ChevronDown, Check) |
| `clsx` | ^2.1.1 | Class name utility |
| `tailwind-merge` | ^2.6.0 | Tailwind class merging |

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/index.ts` | Barrel exports for guest components |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Component re-export |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Main component |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | TypeScript interfaces |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Import `locales`, `localeMetadata`, `SupportedLocale` |
| `/src/lib/utils.ts` | Import `cn` utility function |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Reference Radix UI dropdown pattern |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Reference existing language switcher patterns |

### Functions to Implement

| Function | Location | Description |
|----------|----------|-------------|
| `GuestLanguageSwitcher` | `GuestLanguageSwitcher.tsx` | Main React component |
| `hasTranslation` | Internal helper | Check if language has translation available |

---

## 7. Implementation Tasks

### Task 1: Create Directory Structure
- Create `/src/components/guest/` directory
- Create `/src/components/guest/GuestLanguageSwitcher/` directory

### Task 2: Create Type Definitions
- Create `GuestLanguageSwitcher.types.ts` with `GuestLanguageSwitcherProps` interface
- Import and use `SupportedLocale` from config

### Task 3: Implement Main Component
- Create `GuestLanguageSwitcher.tsx` using Radix UI dropdown
- Implement trigger button with current language display
- Implement dropdown menu with all 6 languages
- Add translation availability indicators (checkmarks)
- Apply visual distinction for unavailable translations
- Ensure all items remain selectable

### Task 4: Implement Accessibility Features
- Verify keyboard navigation works (Arrow keys, Enter, Escape)
- Verify screen reader announces options correctly
- Ensure focus management is proper
- Add appropriate ARIA labels

### Task 5: Create Barrel Exports
- Create `index.ts` in GuestLanguageSwitcher directory
- Create/update `index.ts` in guest directory

### Task 6: Add Mobile Responsiveness
- Implement `compact` variant for smaller screens
- Ensure touch targets are minimum 44x44px
- Test dropdown positioning on mobile viewports

---

## 8. Testing Requirements

### Unit Tests

| Test Case | Description |
|-----------|-------------|
| Renders with current language | Trigger shows correct flag and native name |
| Shows all 6 languages | Dropdown contains all supported locales |
| Indicates available translations | Checkmark appears for available languages |
| Visual distinction for unavailable | Unavailable languages have reduced opacity |
| Calls onLanguageChange | Selecting a language triggers callback |
| Supports compact variant | Compact mode renders smaller |
| Handles disabled state | Disabled prop prevents interaction |

### Accessibility Tests

| Test Case | Description |
|-----------|-------------|
| Keyboard navigation | Arrow keys navigate, Enter selects, Escape closes |
| Focus management | Focus returns to trigger after selection |
| Screen reader announcements | Current selection and options are announced |
| ARIA attributes | Proper roles and states are applied |

### Visual Tests

| Test Case | Description |
|-----------|-------------|
| Default state renders correctly | Trigger button matches design spec |
| Dropdown positioning | Content doesn't overflow viewport |
| Mobile viewport | Component works on 320px width |
| Available vs unavailable styling | Visual distinction is clear |

---

## 9. Integration Points

### With useGuestLanguage Hook (Task 4.1)

```tsx
// Example integration in ItemDisplay.tsx
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import { GuestLanguageSwitcher } from '@/components/guest';

function ItemDisplay({ translationMeta }) {
  const { currentLanguage, setLanguage } = useGuestLanguage({
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
  });

  return (
    <GuestLanguageSwitcher
      currentLanguage={currentLanguage}
      availableTranslations={translationMeta.availableTranslations}
      sourceLanguage={translationMeta.sourceLanguage}
      onLanguageChange={setLanguage}
    />
  );
}
```

### With ItemDisplay Component (Task 5.2)

The component will be placed in the header area of the guest item page, receiving:
- `currentLanguage` from useGuestLanguage hook state
- `availableTranslations` from server-fetched translation metadata
- `sourceLanguage` from item data
- `onLanguageChange` callback from useGuestLanguage hook

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Radix UI dropdown z-index conflicts | Low | Medium | Use Portal with explicit z-50 class |
| Mobile dropdown positioning issues | Medium | Low | Test on various viewports, use collision detection |
| Flag emoji rendering inconsistently | Low | Low | Emojis are consistent in modern browsers; could fallback to SVG flags |
| Performance with many re-renders | Low | Low | Memoize localeMetadata lookups if needed |

---

## 11. Acceptance Criteria Checklist

- [ ] Component displays a Radix UI dropdown trigger showing the current language with flag and native name
- [ ] Dropdown opens to show all six supported languages (English, Spanish, French, German, Italian, Dutch)
- [ ] Each language entry displays a flag emoji and the language's native name
- [ ] Visual checkmark indicator appears next to languages that have translations available
- [ ] Languages without available translations are styled with reduced opacity (50%) but remain clickable
- [ ] Selecting any language (available or unavailable) triggers the onLanguageChange callback
- [ ] Component is fully keyboard navigable (Arrow keys, Enter, Escape)
- [ ] Screen readers announce the current selection and available options
- [ ] Compact variant renders smaller for mobile/header use
- [ ] Component follows project design system (Tailwind CSS, Airbnb DLS patterns)
- [ ] Component is responsive and works on viewports as small as 320px
- [ ] Touch targets are minimum 44x44px for mobile accessibility
- [ ] TypeScript types are properly defined and exported
- [ ] Barrel exports enable clean imports from `@/components/guest`

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-311, REQ-345)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Existing LanguageSwitcher:** `/src/components/LanguageSwitcher/`
- **Radix UI Dropdown Docs:** https://www.radix-ui.com/primitives/docs/components/dropdown-menu
- **Radix UI Example Pattern:** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
