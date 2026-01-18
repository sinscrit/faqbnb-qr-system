# REQ-314: Create ViewOriginalToggle Component - Implementation Overview

**Date Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Type:** NEW FEATURE
**Size:** S (Small)
**Priority:** P1 - High
**Phase:** 3 - Guest UI Components
**Task ID:** 3.4
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Request Source:** `/docs/gen_requests_epic4.md` - Request #314

---

## 1. Summary

Create a dedicated toggle component that allows guests viewing translated content to switch between the translated version and the original language version. The component displays as a secondary-styled button with dynamic label text that changes based on the current view state ("View in original (English)" vs "View translation") with a swap icon.

---

## 2. Current Behavior

No dedicated toggle component exists for switching between translated and original content views. Guests viewing translations must rely on other mechanisms such as banner links or language switcher dropdowns to access original content, creating inconsistent interaction patterns across different contexts.

---

## 3. Expected Behavior

A secondary-styled button component displays with dynamic label text that changes based on the current view state:
- When viewing a translation: Button shows "View in original (English)" with a swap icon
- When viewing the original: Button shows "View translation" with the same swap icon

The source language name is dynamically inserted into the label (not hardcoded as "English"). Clicking the toggle switches between the two states and triggers the appropriate content display change through the provided onClick handler. The component follows the secondary button style from the design system (white background, dark border, outline style).

---

## 4. User Impact

- Guests can quickly toggle between translated and original content without navigating through dropdowns
- Dynamic labeling makes the current state and available action immediately clear
- Swap icon provides visual reinforcement of the toggle behavior
- Interaction is intuitive for users who may not fully understand the text labels
- Bilingual users can easily compare translations with originals

---

## 5. Business Value

- Provides a streamlined interaction pattern for accessing original content
- Creates a reusable component for consistent toggle behavior across multiple features
- Improves usability for international audiences
- Supports translation verification use cases
- Enhances trust by allowing users to validate translation accuracy

---

## 6. Technical Approach

### Component Architecture

The component will be a client-side React component following the existing component patterns in the codebase.

**File Structure:**
```
/src/components/guest/
├── ViewOriginalToggle/
│   ├── index.ts                      # Barrel export
│   ├── ViewOriginalToggle.tsx        # Main component
│   └── ViewOriginalToggle.types.ts   # TypeScript interfaces
```

### Props Interface

Based on the implementation plan (`Plan-111-L10N-Epic4-Guest-Experience.md`):

```typescript
// /src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts

import { SupportedLanguage } from '@/types/l10n';

export interface ViewOriginalToggleProps {
  /** Whether currently showing original content (true) or translation (false) */
  isShowingOriginal: boolean;
  /** Original/source language code (e.g., 'en', 'fr') */
  sourceLanguage: SupportedLanguage;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional disabled state */
  disabled?: boolean;
}
```

### Styling Approach

Follow the established secondary button pattern from `ActionButtons.tsx`:

```typescript
// Secondary button style (outline variant)
const secondaryButtonClasses = `
  flex items-center justify-center gap-2
  min-h-[48px] px-6 py-3.5
  rounded-lg font-medium text-base
  transition-all duration-200 ease-out
  bg-white border border-[#222222] text-[#222222]
  hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#222222] focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;
```

### Icon Usage

Use `ArrowRightLeft` icon from Lucide React (swap icon as specified in the plan):

```typescript
import { ArrowRightLeft } from 'lucide-react';
```

### Language Name Formatting

The component needs to format language codes to human-readable names. This will use the `formatLanguageName` utility from the translation utilities module (REQ-310), or fall back to a local lookup using the `SUPPORTED_LANGUAGES` constant from `/src/types/l10n.ts`.

### Dependencies

| Dependency | Type | Location |
|------------|------|----------|
| `SupportedLanguage` type | Type | `/src/types/l10n.ts` (created in REQ-304) |
| `SUPPORTED_LANGUAGES` constant | Constant | `/src/types/l10n.ts` (created in REQ-304) |
| `formatLanguageName` utility | Function | `/src/lib/translations/translation-utils.ts` (created in REQ-310) |
| `cn` utility | Function | `/src/lib/utils.ts` (existing) |
| Lucide React icons | Library | Already installed |

---

## 7. Acceptance Criteria

- [ ] Component renders as a button using the secondary button style from the design system
- [ ] Label dynamically displays "View in original (English)" when currently viewing a translation
- [ ] Label dynamically displays "View translation" when currently viewing the original content
- [ ] Source language name is dynamically inserted into the label (not hardcoded)
- [ ] Swap icon (ArrowRightLeft) appears in the button, positioned consistently with label text
- [ ] Icon comes from Lucide React (project's established icon library)
- [ ] Component accepts `isShowingOriginal` property for current view state
- [ ] Component accepts `sourceLanguage` property to generate correct labels
- [ ] Component accepts `onToggle` handler called when button is clicked
- [ ] Button follows accessibility patterns with proper ARIA attributes and keyboard support
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Component works correctly on mobile viewports with appropriate touch target sizing (48px minimum)
- [ ] Button visual style clearly indicates it is interactive through hover and focus states

---

## 8. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/ViewOriginalToggle/index.ts` | Barrel export for the component |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main component implementation |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | TypeScript type definitions |

### Files to Modify

| File Path | Changes | Functions/Exports Affected |
|-----------|---------|----------------------------|
| `/src/components/guest/index.ts` | Add export for ViewOriginalToggle | Add `export * from './ViewOriginalToggle'` |

### Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `/src/types/l10n.ts` | Import `SupportedLanguage` type and `SUPPORTED_LANGUAGES` constant |
| `/src/lib/utils.ts` | Import `cn` utility function |
| `/src/lib/translations/translation-utils.ts` | Import `formatLanguageName` utility (if available) |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Reference for button styling patterns |

---

## 9. Design Specifications

### Visual Design (From PRD)

| Aspect | Specification |
|--------|---------------|
| Button Style | Secondary (outline) variant |
| Background | White (`bg-white`) |
| Border | 1px solid `#222222` |
| Text Color | `#222222` |
| Hover | Scale 1.02, background `#F7F7F7` |
| Active | Scale 0.98 |
| Focus | Ring 2px `#222222` with 2px offset |
| Min Height | 48px (WCAG 2.5.5 touch target) |
| Padding | `px-6 py-3.5` |
| Border Radius | `rounded-lg` |
| Font | Medium weight, base size |
| Icon | `ArrowRightLeft` from Lucide, `w-5 h-5` |

### Label Text

| State | Label Text |
|-------|------------|
| Viewing translation | "View in original ({sourceLanguageName})" |
| Viewing original | "View translation" |

### Layout

```
┌─────────────────────────────────────────┐
│  [🔄]  View in original (English)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [🔄]  View translation                 │
└─────────────────────────────────────────┘
```

---

## 10. Implementation Tasks

### Task 1: Create Type Definitions
- Create `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`
- Define `ViewOriginalToggleProps` interface
- Export types for external use

### Task 2: Implement Main Component
- Create `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- Import dependencies (React, Lucide icon, cn utility, types)
- Implement button with dynamic label logic
- Apply secondary button styling
- Handle onClick event
- Add accessibility attributes (aria-pressed, aria-label)

### Task 3: Create Barrel Export
- Create `/src/components/guest/ViewOriginalToggle/index.ts`
- Export component and types

### Task 4: Update Guest Components Index
- Update `/src/components/guest/index.ts` to export ViewOriginalToggle
- Ensure consistent export pattern with other guest components

### Task 5: Verification
- Test component renders correctly in both states
- Verify accessibility with keyboard navigation
- Confirm mobile touch targets meet requirements
- Validate styling matches design system

---

## 11. Testing Considerations

### Unit Tests

- Component renders with correct label when `isShowingOriginal` is `true`
- Component renders with correct label when `isShowingOriginal` is `false`
- Source language name is correctly formatted in label
- `onToggle` callback is called when button is clicked
- Component is disabled when `disabled` prop is `true`
- Custom `className` prop is applied correctly

### Accessibility Tests

- Button has proper `aria-pressed` attribute reflecting state
- Button is focusable and keyboard-activatable (Enter/Space)
- Screen reader announces button purpose and current state
- Focus ring is visible when button is focused

### Visual Tests

- Button matches secondary button style from design system
- Hover and active states work correctly
- Component is responsive on mobile viewports
- Icon is properly positioned relative to text

---

## 12. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Unknown language code | Fall back to displaying the language code itself |
| Missing `formatLanguageName` utility | Use local lookup from `SUPPORTED_LANGUAGES` |
| Very long language names | Allow text to wrap or truncate with ellipsis |
| RTL languages (future) | Component should support RTL text direction |

---

## 13. Related Requests

| Request ID | Title | Relationship |
|------------|-------|--------------|
| REQ-304 | Create Localization Types File | Provides `SupportedLanguage` type |
| REQ-310 | Create Translation Utility Helpers | Provides `formatLanguageName` function |
| REQ-311 | Create Guest Language Switcher Component | Related guest UI component |
| REQ-312 | Create TranslationBanner Component | Uses this toggle via "View original" action |

---

## 14. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 3, Task 3.4)
- Request Source: `/docs/gen_requests_epic4.md` (REQ-314)
- Button Pattern Reference: `/src/components/SimpleDashboard/ActionButtons.tsx`
- Design System: Airbnb-inspired styling with Tailwind CSS
- Icon Library: Lucide React (`lucide-react`)
