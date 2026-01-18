# REQ-315: Create LanguageIndicator Component - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-315
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** Epic 4 - Guest Experience, Phase 3.5 - Guest UI Components
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a compact visual indicator component that displays the current language being viewed by guests, designed for placement in header areas and other space-constrained contexts. The component shows the current language with a flag icon and optionally displays a "translated from X" subtitle when viewing translated content.

---

## Current Behavior

No dedicated component exists to show the current display language in a compact, visually clear format. Headers and navigation areas lack a consistent way to communicate which language the guest is currently viewing, forcing reliance on larger dropdown components or leaving language status ambiguous.

---

## Expected Behavior

A small, inline component displays the current language using a flag icon and language code or abbreviation. The component occupies minimal horizontal space, making it suitable for placement in headers, toolbars, and other compact layouts. Optionally, when viewing translated content, the component can show a subtle subtitle such as "translated from Spanish" beneath the main language indicator. The component is read-only and serves as a status display rather than an interactive control, though it may be clickable to trigger language selection when integrated with other components.

---

## Technical Approach

### Component Architecture

The LanguageIndicator will be implemented as a client component following the project's established patterns:

1. **Directory-based structure** under `/src/components/guest/LanguageIndicator/`
2. **Separate types file** for TypeScript definitions
3. **Barrel export** through `index.ts`
4. **Compact inline design** suitable for header placement

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component location | `/src/components/guest/LanguageIndicator/` | Follows plan architecture, separates guest components |
| Flag representation | Emoji flags from `SUPPORTED_LANGUAGES` constant | Simple, no additional assets, good cross-platform support |
| Icon library | Lucide React (`Globe` as fallback) | Already in project, consistent with other components |
| Styling | Tailwind CSS with `cn()` utility | Project standard |
| Interactivity | Optional via `onClick` prop | Can be standalone display or trigger for language switcher |

### Props Interface

```typescript
export interface LanguageIndicatorProps {
  /** Current display language code */
  currentLanguage: SupportedLanguage;
  /** Whether the content being viewed is translated */
  isTranslated?: boolean;
  /** Source language when displaying translation status */
  sourceLanguage?: SupportedLanguage;
  /** Show "translated from X" subtitle */
  showTranslationSource?: boolean;
  /** Optional click handler for making the indicator interactive */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

### Visual Design

```
┌─────────────────────────┐
│ 🇫🇷 Français            │  ← Flag + native language name
│ translated from English │  ← Optional subtitle (smaller, muted)
└─────────────────────────┘

Compact mode (header):
┌──────────────┐
│ 🇫🇷 FR       │  ← Flag + abbreviated code
└──────────────┘
```

### Component States

1. **Default (read-only)**: Shows current language with flag
2. **With translation source**: Shows current language + "translated from X" subtitle
3. **Interactive**: Clickable with hover/focus states (when `onClick` provided)
4. **Compact**: Minimal width using abbreviated language codes

---

## Dependencies

### Required from Epic 1/Epic 4

| Dependency | Location | Purpose |
|------------|----------|---------|
| `SupportedLanguage` type | `/src/types/l10n.ts` | Language code type constraint |
| `SUPPORTED_LANGUAGES` constant | `/src/types/l10n.ts` | Language metadata (names, flags) |
| `formatLanguageName()` | `/src/lib/translations/translation-utils.ts` | Format language codes for display |

### Existing Project Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `lucide-react` | ^0.525.0 | Globe icon fallback |
| `@/lib/utils` (cn) | N/A | Class name utility |
| Tailwind CSS | 4.x | Styling |

---

## Implementation Tasks

### Task 1: Create Types File
**File:** `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts`

- Define `LanguageIndicatorProps` interface
- Define internal `LanguageDisplayConfig` type for styling variants
- Export all types

### Task 2: Create Main Component
**File:** `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

- Implement component with `'use client'` directive
- Support both compact and full display modes
- Show flag emoji from `SUPPORTED_LANGUAGES`
- Show language name (native or English based on context)
- Conditionally render "translated from X" subtitle
- Support optional click handler for interactivity
- Implement accessible ARIA attributes
- Apply Tailwind styling with proper spacing

### Task 3: Create Barrel Export
**File:** `/src/components/guest/LanguageIndicator/index.ts`

- Export component as default and named export
- Export props type
- Include JSDoc documentation

### Task 4: Update Guest Components Index
**File:** `/src/components/guest/index.ts`

- Add LanguageIndicator export
- Export LanguageIndicatorProps type

---

## Acceptance Criteria

- [ ] Component renders a flag icon corresponding to the current display language
- [ ] Component displays the language name or abbreviated language code next to the flag
- [ ] Component occupies minimal horizontal space suitable for header placement
- [ ] Component optionally displays a subtitle line showing "translated from [Language]" when viewing a translation
- [ ] Subtitle display is controlled through a component property and defaults to hidden
- [ ] Component accepts a property for the current language code to determine display content
- [ ] Component accepts an optional property for the source language when displaying translation status
- [ ] Flag icons are sourced from the `SUPPORTED_LANGUAGES` constant (emoji flags)
- [ ] Typography is scaled appropriately for compact display without sacrificing readability
- [ ] Component layout stacks vertically on extremely small viewports if needed to maintain readability
- [ ] Component follows the project's design system for spacing, colors, and typography
- [ ] Component can optionally accept an onClick handler to make it interactive when used with language switcher functionality
- [ ] Screen readers announce the current language and translation status appropriately
- [ ] Component remains visually balanced and professional when placed alongside other header elements

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main component implementation |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | TypeScript type definitions |
| `/src/components/guest/LanguageIndicator/index.ts` | Barrel exports |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/guest/index.ts` | Add LanguageIndicator export (create if doesn't exist) |

### Dependencies Required

| File Path | Dependency Type |
|-----------|-----------------|
| `/src/types/l10n.ts` | Import `SupportedLanguage`, `SUPPORTED_LANGUAGES` |
| `/src/lib/translations/translation-utils.ts` | Import `formatLanguageName()` (if available) |
| `/src/lib/utils.ts` | Import `cn()` utility |
| `lucide-react` | Import `Globe` icon (optional fallback) |

---

## Code Examples

### Component Usage

```tsx
// Basic usage - read-only indicator
<LanguageIndicator currentLanguage="fr" />

// With translation source subtitle
<LanguageIndicator
  currentLanguage="fr"
  isTranslated={true}
  sourceLanguage="en"
  showTranslationSource={true}
/>

// Interactive mode (triggers language switcher)
<LanguageIndicator
  currentLanguage="de"
  onClick={() => setLanguageSwitcherOpen(true)}
/>

// Compact mode for tight spaces
<LanguageIndicator
  currentLanguage="es"
  className="text-sm"
/>
```

### Integration with Header

```tsx
// In ItemDisplay.tsx or similar guest page header
<header className="bg-white shadow-sm">
  <div className="flex justify-between items-center p-4">
    <Logo />
    <div className="flex items-center gap-2">
      <LanguageIndicator
        currentLanguage={translationMeta.displayLanguage}
        isTranslated={translationMeta.isShowingTranslation}
        sourceLanguage={translationMeta.sourceLanguage}
        showTranslationSource={true}
        onClick={() => setLanguageSwitcherOpen(true)}
      />
    </div>
  </div>
</header>
```

---

## Styling Specifications

| Element | Style |
|---------|-------|
| Container | `inline-flex items-center gap-1.5` |
| Flag emoji | 16-20px natural size |
| Language text | 14px, `text-gray-900` (or `text-[#222222]` per Airbnb) |
| Subtitle text | 12px, `text-gray-500` (muted) |
| Interactive hover | `hover:bg-gray-100 cursor-pointer` |
| Focus ring | `focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Padding (interactive) | `px-2 py-1 rounded-md` |

---

## Testing Considerations

1. **Rendering tests:**
   - Correct flag and language name for each supported language
   - Subtitle appears/hides based on `showTranslationSource` prop
   - Interactive mode shows cursor and hover states

2. **Accessibility tests:**
   - Screen reader announces language correctly
   - Keyboard navigation works for interactive mode
   - Focus visible on interactive state

3. **Visual regression:**
   - Consistent spacing across all 6 supported languages
   - No overflow or wrapping on typical header widths
   - Mobile viewport renders correctly

---

## Related Requests

| Request | Relationship |
|---------|--------------|
| REQ-304 | Depends on: Creates `SupportedLanguage` type and `SUPPORTED_LANGUAGES` constant |
| REQ-310 | Depends on: Creates `formatLanguageName()` utility |
| REQ-311 | Related: GuestLanguageSwitcher may embed or sit alongside LanguageIndicator |
| REQ-312 | Related: TranslationBanner provides alternative translation status display |

---

## Open Questions

1. **Compact mode**: Should there be an explicit `compact` prop, or rely on className overrides for sizing?
   - *Recommendation:* Add `compact?: boolean` prop for explicit compact mode support

2. **Native vs English names**: Should language names be displayed in native language (e.g., "Français") or English (e.g., "French")?
   - *Recommendation:* Native names by default (more internationally recognizable), with option to show English

3. **Click behavior**: When clicked, should the component handle opening a language switcher dropdown internally, or always delegate via onClick?
   - *Recommendation:* Always delegate via onClick for flexibility and separation of concerns

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-315)
- Design System: Airbnb design system colors and typography
- Similar Components: `LoadingIndicator`, `GuideColumnSettingsPopup` (for patterns)
