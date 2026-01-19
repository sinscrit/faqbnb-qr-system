# REQ-348: Create ViewOriginalToggle Component - Implementation Overview

**Created**: 2026-01-19 19:45 UTC
**Last Modified**: 2026-01-19 19:45 UTC
**Request Type**: NEW FEATURE
**Size**: S (Small)
**Epic**: L10N Epic 4 - Guest Experience
**Phase**: 3 - Guest UI Components
**Task ID**: 3.4

---

## Summary

Create a toggle button component that allows guests viewing translated content to switch between the translated version and the original source language version. The component displays a secondary-styled button with dynamic labels that change based on the current view state, accompanied by a swap icon for universal visual reinforcement.

---

## Current State Analysis

### Existing Infrastructure

1. **i18n Configuration** (`/src/lib/i18n/config.ts`):
   - `SupportedLocale` type: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
   - `localeMetadata` with English and native names
   - `getLocaleMetadata()` helper function

2. **LocaleContext** (`/src/contexts/LocaleContext.tsx`):
   - `SupportedLanguage` type (same as `SupportedLocale`)
   - `SUPPORTED_LOCALES` array with full metadata
   - `getLocaleName(code, useNative?)` helper

3. **Types Export** (`/src/types/index.ts`):
   - Exports `SupportedLanguage` from LocaleContext
   - Existing component prop patterns

4. **Guest Components Directory**:
   - `/src/components/guest/` does NOT currently exist
   - Will need to be created as part of this Epic

### Existing Design Patterns

**Secondary Button Style** (from `/src/components/SimpleDashboard/ActionButtons.tsx`):
```typescript
const secondaryClasses = `bg-white border border-[#222222] text-[#222222]
  hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]`;

const baseClasses = `
  flex items-center justify-center gap-2
  min-h-[48px] px-6 py-3.5
  rounded-lg font-medium text-base
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#222222] focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;
```

**Toggle Component Pattern** (from `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`):
```typescript
export interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  disabled?: boolean;
  className?: string;
}
```

**Icon Usage** (Lucide React):
```typescript
import { ArrowRightLeft } from 'lucide-react';
// Usage: <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
```

**Utility Function** (`/src/lib/utils.ts`):
```typescript
import { cn } from '@/lib/utils';
```

---

## Implementation Approach

### Component Structure

```
/src/components/guest/
├── ViewOriginalToggle/
│   ├── index.ts                        # Barrel export
│   ├── ViewOriginalToggle.tsx          # Main component
│   └── ViewOriginalToggle.types.ts     # TypeScript interfaces
```

### Type Definitions

**File**: `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`

```typescript
import type { SupportedLanguage } from '@/types';

/**
 * Props for the ViewOriginalToggle component
 *
 * @example
 * <ViewOriginalToggle
 *   isShowingOriginal={false}
 *   sourceLanguage="en"
 *   onToggle={() => setShowOriginal(!showOriginal)}
 * />
 */
export interface ViewOriginalToggleProps {
  /** Whether currently showing original content (vs. translation) */
  isShowingOriginal: boolean;

  /** Source/original language code of the content */
  sourceLanguage: SupportedLanguage;

  /** Callback when toggle button is clicked */
  onToggle: () => void;

  /** Whether the toggle is disabled */
  disabled?: boolean;

  /** Additional CSS classes for customization */
  className?: string;
}
```

### Component Implementation

**File**: `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

Key implementation details:
1. **Dynamic Label Logic**:
   - When `isShowingOriginal === false`: "View in original (English)"
   - When `isShowingOriginal === true`: "View translation"

2. **Language Name Resolution**:
   - Use `getLocaleMetadata(sourceLanguage)?.name` for English language name
   - Fallback to code if metadata not found

3. **Swap Icon**: Use `ArrowRightLeft` from `lucide-react`

4. **Accessibility**:
   - `aria-pressed` attribute for toggle state
   - `aria-label` for screen readers
   - Proper `type="button"` attribute
   - Keyboard support via native button behavior

5. **Styling**:
   - Secondary button style (white background, dark border)
   - 48px minimum height for touch targets
   - Hover, focus, and active states
   - Icon positioned with `gap-2` from label

### Barrel Export

**File**: `/src/components/guest/ViewOriginalToggle/index.ts`

```typescript
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';
```

---

## Dependencies

### Required (Already Exist)

| Dependency | Location | Purpose |
|------------|----------|---------|
| `SupportedLanguage` type | `/src/types/index.ts` | Language code typing |
| `getLocaleMetadata()` | `/src/lib/i18n/config.ts` | Language name lookup |
| `cn()` utility | `/src/lib/utils.ts` | Class name merging |
| `lucide-react` | `package.json` | ArrowRightLeft icon |

### Required (Must Be Created)

| Dependency | Location | Purpose |
|------------|----------|---------|
| Guest components directory | `/src/components/guest/` | Component organization |
| Guest barrel export | `/src/components/guest/index.ts` | Central exports |

---

## Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| Component file at correct path | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` |
| Secondary button style | Use established pattern from ActionButtons.tsx |
| Dynamic label "View in original (X)" | Conditional rendering based on `isShowingOriginal` prop |
| Dynamic label "View translation" | Rendered when `isShowingOriginal === true` |
| Source language name dynamically inserted | Use `getLocaleMetadata(sourceLanguage)?.name` |
| Accepts source language code prop | `sourceLanguage: SupportedLanguage` in props interface |
| Swap icon displayed | `<ArrowRightLeft />` from lucide-react |
| Icon from project library | lucide-react (already used throughout codebase) |
| Accepts current view state prop | `isShowingOriginal: boolean` in props interface |
| Accepts onClick handler | `onToggle: () => void` in props interface |
| Proper ARIA attributes | `aria-pressed`, `aria-label` |
| Keyboard support | Native button provides Enter/Space activation |
| Design system typography/spacing | Follow existing baseClasses pattern |
| Mobile touch targets (44x44 min) | `min-h-[48px]` ensures compliance |
| Visual states (hover/focus/active) | Tailwind classes for all states |
| Screen reader announcement | Descriptive `aria-label` with current state |
| TypeScript prop types | `ViewOriginalToggleProps` interface |
| Proper handling of missing props | Optional props have defaults, required props validated |
| Sufficient contrast | Dark border/text on white background |
| Visual consistency | Matches ActionButtons secondary style |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Main component implementation |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts` | TypeScript type definitions |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Barrel exports for component |
| `/src/components/guest/index.ts` | Barrel exports for guest components directory |

### Files to Modify

| File Path | Changes Required |
|-----------|------------------|
| None | This is a new isolated component with no required modifications to existing files |

### Functions/Exports to Create

| Export | File | Purpose |
|--------|------|---------|
| `ViewOriginalToggle` | ViewOriginalToggle.tsx | React component |
| `ViewOriginalToggleProps` | ViewOriginalToggle.types.ts | Props interface |

---

## Implementation Tasks

### Task 1: Create Guest Components Directory Structure
- Create `/src/components/guest/` directory
- Create `/src/components/guest/index.ts` barrel export

### Task 2: Create Type Definitions
- Create `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.types.ts`
- Define `ViewOriginalToggleProps` interface with JSDoc comments

### Task 3: Implement ViewOriginalToggle Component
- Create `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- Implement component following existing patterns
- Add proper accessibility attributes
- Apply secondary button styling

### Task 4: Create Barrel Exports
- Create `/src/components/guest/ViewOriginalToggle/index.ts`
- Update `/src/components/guest/index.ts` to export ViewOriginalToggle

### Task 5: Verify Implementation
- Ensure TypeScript compiles without errors
- Verify all acceptance criteria are met
- Check accessibility with keyboard navigation

---

## Design Specifications

### Visual Design

| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border | `border border-[#222222]` |
| Text Color | `text-[#222222]` |
| Font | `font-medium text-base` |
| Height | `min-h-[48px]` (touch target) |
| Padding | `px-6 py-3.5` |
| Border Radius | `rounded-lg` |
| Gap (icon to text) | `gap-2` |

### Interactive States

| State | Style |
|-------|-------|
| Default | White background, dark border |
| Hover | `hover:scale-[1.02] hover:bg-[#F7F7F7]` |
| Active | `active:scale-[0.98]` |
| Focus | `focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |

### Icon Specifications

| Property | Value |
|----------|-------|
| Icon | `ArrowRightLeft` from lucide-react |
| Size | `w-4 h-4` |
| Accessibility | `aria-hidden="true"` |

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { ViewOriginalToggle } from '@/components/guest';

function TranslatedContentPage({ sourceLanguage }: { sourceLanguage: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it' }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div>
      <ViewOriginalToggle
        isShowingOriginal={showOriginal}
        sourceLanguage={sourceLanguage}
        onToggle={() => setShowOriginal(!showOriginal)}
      />

      <div className="mt-4">
        {showOriginal ? (
          <p>Original content here...</p>
        ) : (
          <p>Translated content here...</p>
        )}
      </div>
    </div>
  );
}
```

---

## Testing Considerations

1. **Unit Tests**:
   - Renders correct label when showing translation
   - Renders correct label when showing original
   - Calls onToggle when clicked
   - Disabled state prevents interaction
   - Source language name appears in label

2. **Accessibility Tests**:
   - `aria-pressed` reflects current state
   - Keyboard activation works (Enter/Space)
   - Focus visible styles appear

3. **Visual Tests**:
   - Hover state styling
   - Active state styling
   - Disabled state styling

---

## References

- **PRD**: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Source**: `/docs/gen_requests_epic4.md` (REQ-348)
- **Button Pattern Reference**: `/src/components/SimpleDashboard/ActionButtons.tsx`
- **Toggle Pattern Reference**: `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
- **i18n Config**: `/src/lib/i18n/config.ts`
- **Types**: `/src/types/index.ts`

---

*Implementation overview generated for REQ-348: Create ViewOriginalToggle Component*
