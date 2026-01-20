# Implementation Overview: REQ-E04-008 - Create GuestLanguageSwitcher Component

**Request ID:** REQ-E04-008
**Title:** Create Guest Language Switcher Component
**Type:** NEW FEATURE
**Size:** M
**Phase:** 3 - Guest UI Components
**Task ID:** 3.1

**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Source Request:** `/docs/gen_requests_epic4.md` - Request #8

**Last Modified:** 2026-01-20 14:45 UTC

---

## 1. Overview

### 1.1 Summary

Create a `GuestLanguageSwitcher` component that provides guest users with an accessible dropdown to select their preferred display language. The component displays all six supported languages with flag icons and native names, visually indicates translation availability for each language, and allows selection of any language regardless of whether translations exist.

### 1.2 Context

This component is part of Epic 4 (Guest Experience) and builds upon the existing `LanguageSwitcher` component used for authenticated users. The GuestLanguageSwitcher is specifically designed for the guest-facing item view pages where unauthenticated users scan QR codes and view translated content.

### 1.3 Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Epic 1 Foundation (i18n infrastructure) | `/src/lib/i18n/` | Required |
| `SupportedLanguage` type | `/src/types/l10n.ts` or `/src/contexts/LocaleContext` | Available |
| `SUPPORTED_LOCALES` constant | `/src/components/LanguageSwitcher/constants.ts` | Available |
| Radix UI `@radix-ui/react-dropdown-menu` | `package.json` | Installed v2.1.15 |
| Guest language utilities | `/src/lib/i18n/guest-language.ts` | From Epic 4 Task 1.2 |
| Cookie utilities | `/src/lib/i18n/guest-language.ts` | From Epic 4 Task 4.2 |

---

## 2. Requirements Analysis

### 2.1 Functional Requirements

From the acceptance criteria in REQ-E04-008:

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Dropdown renders with all six supported languages | Must Have |
| FR-02 | Each option displays a flag icon representing the language | Must Have |
| FR-03 | Each option shows the language name in native form (e.g., "Espanol", "Francais") | Must Have |
| FR-04 | Languages with available translations display a checkmark indicator | Must Have |
| FR-05 | Languages without translations appear visually distinct (grayed/dimmed) | Must Have |
| FR-06 | Languages without translations remain selectable | Must Have |
| FR-07 | Dropdown uses Radix UI primitives for accessibility | Must Have |
| FR-08 | Component supports keyboard navigation (arrow keys, enter, escape) | Must Have |
| FR-09 | Component includes proper ARIA attributes for screen readers | Must Have |
| FR-10 | Language selection persists via cookie or state | Must Have |
| FR-11 | Currently selected language is visually highlighted | Must Have |
| FR-12 | Component accepts translation availability data as a prop | Must Have |
| FR-13 | Component emits callback when language selection changes | Must Have |
| FR-14 | Component handles loading states during translation data fetch | Should Have |
| FR-15 | Component displays error state if availability cannot be determined | Should Have |
| FR-16 | Dropdown trigger shows currently selected language with flag | Must Have |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Language switch response time | < 100ms (client-side) |
| NFR-02 | Accessibility compliance | WCAG 2.1 AA |
| NFR-03 | Mobile touch target size | Min 44x44px |
| NFR-04 | Bundle size impact | Minimal (uses existing Radix UI) |

---

## 3. Technical Design

### 3.1 Component Architecture

```
/src/components/guest/GuestLanguageSwitcher/
  ├── index.ts                           # Barrel exports
  ├── GuestLanguageSwitcher.tsx          # Main component using Radix UI
  └── GuestLanguageSwitcher.types.ts     # Component types
```

### 3.2 Component Props Interface

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts

import type { SupportedLanguage } from '@/types';

/**
 * Props for GuestLanguageSwitcher component
 */
export interface GuestLanguageSwitcherProps {
  /** Currently selected language */
  currentLanguage: SupportedLanguage;

  /** Languages that have translations available for the current content */
  availableTranslations: SupportedLanguage[];

  /** Source/original language of the content */
  sourceLanguage: SupportedLanguage;

  /** Callback when language is changed */
  onLanguageChange: (language: SupportedLanguage) => void;

  /** Compact mode for mobile or constrained spaces */
  compact?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Loading state while fetching translation availability */
  isLoading?: boolean;

  /** Error state if translation availability cannot be determined */
  hasError?: boolean;

  /** Disable the component */
  disabled?: boolean;
}

/**
 * Internal state for language option rendering
 */
export interface LanguageOptionState {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  hasTranslation: boolean;
  isSource: boolean;
  isSelected: boolean;
}
```

### 3.3 Component Implementation Pattern

The component should follow the existing `LanguageSwitcher` pattern with these key differences:

1. **Uses Radix UI Dropdown** instead of custom dropdown (per acceptance criteria)
2. **Shows translation availability** via checkmarks and gray-out styling
3. **No database persistence** - guests use cookies only
4. **No page reload** - uses callback for client-side state management

```tsx
// Pseudocode structure
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button>
      {currentFlag} {currentNativeName}
      <ChevronDown />
    </button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.RadioGroup value={currentLanguage} onValueChange={onLanguageChange}>
        {SUPPORTED_LOCALES.map(locale => (
          <DropdownMenu.RadioItem
            key={locale.code}
            value={locale.code}
            className={!hasTranslation ? 'opacity-50' : ''}
          >
            <span>{locale.flag}</span>
            <span>{locale.nativeName}</span>
            {hasTranslation && <DropdownMenu.ItemIndicator><Check /></DropdownMenu.ItemIndicator>}
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

### 3.4 Radix UI Integration

Use the following Radix UI components:
- `DropdownMenu.Root` - Container with open state management
- `DropdownMenu.Trigger` - Accessible trigger button
- `DropdownMenu.Portal` - Portals dropdown to body
- `DropdownMenu.Content` - Dropdown panel with animation
- `DropdownMenu.RadioGroup` - Single selection group
- `DropdownMenu.RadioItem` - Individual language options
- `DropdownMenu.ItemIndicator` - Checkmark for selected item

### 3.5 Styling Approach

Following the existing codebase patterns:

| Element | Styling |
|---------|---------|
| Trigger button | `bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#FF385C]` |
| Dropdown content | `bg-white border border-gray-200 rounded-lg shadow-lg` |
| Option (available) | `px-4 py-2 hover:bg-gray-50 cursor-pointer` |
| Option (unavailable) | `px-4 py-2 hover:bg-gray-50 cursor-pointer opacity-50 text-gray-400` |
| Option (selected) | `bg-[#FFEEEF] text-[#222222]` |
| Checkmark | `text-[#FF385C]` (brand color) |

### 3.6 Accessibility Requirements

| Feature | Implementation |
|---------|----------------|
| Keyboard navigation | Arrow keys, Enter, Escape, Home, End (provided by Radix UI) |
| Screen reader support | `aria-label` on trigger, `role="menu"` on content |
| Focus management | Auto-focus first item, return focus on close |
| Touch targets | Minimum 44px height for mobile |

---

## 4. Implementation Tasks

### Task 4.1: Create Types File
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts`
**Effort:** XS

- Define `GuestLanguageSwitcherProps` interface
- Define `LanguageOptionState` internal type
- Add JSDoc comments for all properties

### Task 4.2: Create Main Component
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`
**Effort:** M

- Import Radix UI DropdownMenu components
- Import `SUPPORTED_LOCALES` from LanguageSwitcher constants or create local copy
- Implement dropdown using Radix UI pattern
- Add visual indicators for translation availability (checkmark)
- Add visual distinction for unavailable translations (opacity/gray)
- Implement loading state with spinner
- Implement error state with fallback UI
- Add comprehensive keyboard navigation support
- Apply Tailwind CSS styling matching codebase patterns

### Task 4.3: Create Barrel Exports
**File:** `/src/components/guest/GuestLanguageSwitcher/index.ts`
**Effort:** XS

- Export main component
- Export types

### Task 4.4: Update Guest Components Barrel (if exists)
**File:** `/src/components/guest/index.ts`
**Effort:** XS

- Create file if it doesn't exist
- Export GuestLanguageSwitcher

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Main component implementation |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | TypeScript type definitions |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Barrel exports |
| `/src/components/guest/index.ts` | Guest components barrel (create if not exists) |

### 5.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| None | This component is new and self-contained |

### 5.3 Files to Reference (Read-Only)

| File Path | Usage |
|-----------|-------|
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Pattern reference for dropdown implementation |
| `/src/components/LanguageSwitcher/constants.ts` | `SUPPORTED_LOCALES` constant, `getLocaleByCode()` utility |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type patterns reference |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix UI dropdown pattern reference |
| `/src/types/index.ts` | Central type exports |

### 5.4 Functions to Implement

| Function | File | Description |
|----------|------|-------------|
| `GuestLanguageSwitcher` | `GuestLanguageSwitcher.tsx` | Main React component |
| `getLanguageOptionState` | `GuestLanguageSwitcher.tsx` | Helper to compute option state from props |

### 5.5 Constants to Use

| Constant | Source | Description |
|----------|--------|-------------|
| `SUPPORTED_LOCALES` | `/src/components/LanguageSwitcher/constants.ts` | Array of supported languages with metadata |
| `DEFAULT_LOCALE` | `/src/components/LanguageSwitcher/constants.ts` | Fallback locale ('en') |

---

## 6. Integration Points

### 6.1 Usage in ItemDisplay Component

The GuestLanguageSwitcher will be integrated into the updated `ItemDisplay.tsx` component (Task 5.2 in the implementation plan):

```tsx
// In /src/components/ItemDisplay.tsx
import { GuestLanguageSwitcher } from '@/components/guest';

function ItemDisplay({ item, translationMeta }) {
  const { currentLanguage, setLanguage } = useGuestLanguage({...});

  return (
    <header>
      <GuestLanguageSwitcher
        currentLanguage={currentLanguage}
        availableTranslations={translationMeta.availableTranslations}
        sourceLanguage={translationMeta.sourceLanguage}
        onLanguageChange={setLanguage}
      />
    </header>
  );
}
```

### 6.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Server Component (page.tsx)                │
│  - Fetches item + translations                                  │
│  - Determines availableTranslations array                       │
│  - Passes translationMeta to client component                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Client Component (ItemDisplay)                │
│  - Uses useGuestLanguage hook for state                         │
│  - Renders GuestLanguageSwitcher                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GuestLanguageSwitcher                       │
│  Props:                                                         │
│    - currentLanguage: from hook state                           │
│    - availableTranslations: from server                         │
│    - sourceLanguage: from server                                │
│    - onLanguageChange: calls hook's setLanguage                 │
│                                                                 │
│  On selection:                                                  │
│    1. Calls onLanguageChange(newLang)                           │
│    2. Hook updates cookie + state                               │
│    3. Content updates via client-side state swap                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Testing Considerations

### 7.1 Unit Tests

| Test Case | Description |
|-----------|-------------|
| Renders all 6 languages | Verify all SUPPORTED_LOCALES appear in dropdown |
| Shows flags correctly | Verify flag emojis render for each option |
| Shows native names | Verify nativeName displayed (not English name) |
| Checkmark on available | Verify checkmark appears for availableTranslations |
| Gray-out unavailable | Verify opacity/styling for languages not in availableTranslations |
| Current language highlighted | Verify currentLanguage option has selected styling |
| Callback on selection | Verify onLanguageChange called with correct code |
| Loading state | Verify spinner/disabled when isLoading=true |
| Error state | Verify fallback UI when hasError=true |
| Keyboard navigation | Verify arrow keys, enter, escape work |

### 7.2 Accessibility Tests

| Test | Expected |
|------|----------|
| Screen reader announces options | Each option readable with full context |
| Focus visible | Clear focus indicator on keyboard navigation |
| Escape closes dropdown | Focus returns to trigger |
| Tab closes dropdown | Focus moves to next element |

---

## 8. Design Specifications

From PRD design specs:

| Element | Specification |
|---------|---------------|
| Dropdown style | Radix UI (accessible) |
| Flag display | Flag emoji + native language name |
| Current language | Checkmark indicator |
| Unavailable languages | Grayed but selectable |
| Trigger | Shows current language with flag |
| Animation | Smooth open/close transition |

### Visual Reference

```
┌─────────────────────────────┐
│ 🇫🇷 Francais         ▼     │  ← Trigger button
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│ 🇬🇧 English          ✓     │  ← Has translation (checked if selected)
│ 🇳🇱 Nederlands       ✓     │  ← Has translation
│ 🇫🇷 Francais         ✓     │  ← Currently selected (highlighted bg)
│ 🇩🇪 Deutsch                │  ← No translation (dimmed, no check)
│ 🇮🇹 Italiano               │  ← No translation (dimmed)
│ 🇪🇸 Espanol                │  ← No translation (dimmed)
└─────────────────────────────┘
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Radix UI version incompatibility | Low | Medium | Lock to tested version in package.json |
| Flag emoji rendering issues | Low | Low | Provide text fallback |
| Touch target too small on mobile | Medium | Medium | Enforce min 44px height |
| Slow translation availability fetch | Medium | Low | Loading state UI prevents confusion |

---

## 10. Success Criteria

- [ ] Component renders dropdown with all 6 supported languages
- [ ] Each option shows flag emoji and native name
- [ ] Languages with translations show checkmark indicator
- [ ] Languages without translations appear visually dimmed but remain selectable
- [ ] Keyboard navigation works (arrow keys, enter, escape)
- [ ] Screen readers announce options correctly
- [ ] Selection triggers onLanguageChange callback with correct language code
- [ ] Currently selected language is visually highlighted
- [ ] Loading and error states render appropriately
- [ ] Component follows existing codebase patterns and styling
- [ ] TypeScript compilation succeeds without errors

---

## 11. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 3, Task 3.1)
- Request Source: `/docs/gen_requests_epic4.md` (REQ-E04-008)
- Existing Pattern: `/src/components/LanguageSwitcher/` (full implementation reference)
- Radix UI Docs: https://www.radix-ui.com/primitives/docs/components/dropdown-menu
