# Implementation Breakdown: REQ-347 - Create MissingTranslationBanner Component

**Document Created:** 2026-01-19 16:45:00 UTC
**Last Modified:** 2026-01-19 16:45:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - REQ-347
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md (Phase 3, Task 3.3)
**Epic:** L10N Epic 4 - Guest Experience
**Size:** S (Small)
**Priority:** P1 - High

---

## 1. Overview

### 1.1 Summary
Create a subtle informational banner component that displays when a guest requests content in a language for which no translation is available. The banner explains that the content is being shown in the original language instead, using muted, non-alarming styling to inform without creating concern.

### 1.2 Business Context
When guests select a language preference but the requested translation is unavailable, the application silently displays the original language content. This creates confusion about why content appears in a different language than selected. The MissingTranslationBanner provides transparency about translation availability while maintaining a calm, professional tone that manages user expectations without suggesting an error has occurred.

### 1.3 User Story
As a guest viewing content with a language preference set, I want to see a gentle notification when my requested translation is not available, so that I understand why the content appears in the original language and know my preference was recognized.

---

## 2. Technical Context

### 2.1 Dependencies from Epic 1 (Foundation)

| Dependency | Location | Purpose |
|------------|----------|---------|
| i18n Configuration | `/src/lib/i18n/config.ts` | `localeMetadata` for language display names |
| SupportedLocale Type | `/src/lib/i18n/config.ts` | Type-safe language code handling |
| LocaleContext Types | `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type definition |

### 2.2 Related Components

| Component | Location | Relationship |
|-----------|----------|--------------|
| TranslationBanner | `/src/components/guest/TranslationBanner/` | Sister component for showing translated content (blue styling) |
| SessionRecoveryBanner | `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Pattern reference for banner structure and accessibility |
| ItemDisplay | `/src/components/ItemDisplay.tsx` | Consumer - will render MissingTranslationBanner when translation unavailable |

### 2.3 Technology Stack

| Technology | Usage |
|------------|-------|
| React 18+ | Component framework |
| TypeScript 5.x | Type-safe props and state |
| Tailwind CSS 4.x | Styling with `cn()` utility |
| Lucide React | Info icon (`Info` or `AlertCircle`) |

---

## 3. Implementation Details

### 3.1 Component Structure

```
/src/components/guest/MissingTranslationBanner/
├── index.ts                                    # Barrel export
├── MissingTranslationBanner.tsx               # Main component
└── MissingTranslationBanner.types.ts          # TypeScript interfaces
```

### 3.2 Props Interface

```typescript
// /src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts

import { SupportedLocale } from '@/lib/i18n/config';

export interface MissingTranslationBannerProps {
  /** Language code that was requested by the guest */
  requestedLanguage: SupportedLocale;
  /** Language code of the content being displayed (source/original language) */
  displayLanguage: SupportedLocale;
  /** Additional CSS classes for container customization */
  className?: string;
}
```

### 3.3 Design Specifications

| Property | Value | Rationale |
|----------|-------|-----------|
| Background Color | `#F5F5F5` (gray-100) | Muted, neutral - avoids alarm |
| Text Color | `#6B7280` (gray-500) | Subdued, less prominent than content |
| Border | None or subtle `border-gray-200` | Non-intrusive appearance |
| Icon | Lucide `Info` icon | Calm informational indicator, not warning |
| Icon Color | `#9CA3AF` (gray-400) | Subtle, matches muted theme |
| Font Size | `text-sm` (14px) | Smaller than primary content |
| Padding | `p-3` or `px-4 py-3` | Comfortable but compact |
| Width | Full width of container | Consistent banner appearance |
| Dismissible | No | Remains visible while mismatch exists |

### 3.4 Message Format

The banner message follows this pattern:
```
[RequestedLanguageName] translation not available. Showing content in [DisplayLanguageName].
```

Examples:
- "French translation not available. Showing content in English."
- "German translation not available. Showing content in Spanish."
- "Dutch translation not available. Showing content in Italian."

### 3.5 Component Implementation Approach

```typescript
// Pseudocode structure
'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localeMetadata, SupportedLocale } from '@/lib/i18n/config';
import { MissingTranslationBannerProps } from './MissingTranslationBanner.types';

export function MissingTranslationBanner({
  requestedLanguage,
  displayLanguage,
  className,
}: MissingTranslationBannerProps) {
  // Get language display names from metadata
  const requestedName = localeMetadata[requestedLanguage]?.name || requestedLanguage;
  const displayName = localeMetadata[displayLanguage]?.name || displayLanguage;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'w-full bg-gray-100 px-4 py-3',
        'flex items-center gap-3',
        'text-sm text-gray-500',
        className
      )}
    >
      <Info
        className="w-4 h-4 text-gray-400 flex-shrink-0"
        aria-hidden="true"
      />
      <span>
        {requestedName} translation not available. Showing content in {displayName}.
      </span>
    </div>
  );
}
```

---

## 4. Ordered Implementation Tasks

### Task 1: Create Type Definitions File
**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts`
**Effort:** XS

**Actions:**
1. Create the types file with proper JSDoc documentation
2. Define `MissingTranslationBannerProps` interface
3. Import `SupportedLocale` from i18n config for type safety
4. Document each prop with JSDoc comments

**Acceptance Criteria:**
- [ ] Type file compiles without errors
- [ ] Props interface includes `requestedLanguage`, `displayLanguage`, and optional `className`
- [ ] Both language props use `SupportedLocale` type from i18n config
- [ ] JSDoc comments explain each property's purpose

---

### Task 2: Create Main Component
**File:** `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
**Effort:** S

**Actions:**
1. Create client component with `'use client'` directive
2. Import dependencies: `lucide-react`, `cn` utility, locale metadata, types
3. Implement component with muted gray styling per design specs
4. Get language display names from `localeMetadata`
5. Render banner with Info icon and formatted message
6. Add accessibility attributes (`role="status"`, `aria-live="polite"`)
7. Support `className` prop for customization via `cn()` merge

**Acceptance Criteria:**
- [ ] Component renders banner with muted gray background (#F5F5F5 / gray-100)
- [ ] Info icon appears on left, styled with gray-400 color
- [ ] Message correctly displays requested and display language names
- [ ] Text uses subdued gray-500 color and smaller font size (text-sm)
- [ ] Component spans full width with appropriate padding
- [ ] No dismiss button (non-dismissible requirement)
- [ ] Works correctly on mobile viewports without horizontal scrolling
- [ ] Screen readers announce content appropriately

**Implementation Notes:**
- Use `localeMetadata[code]?.name` to get English language names
- Fallback to raw code if metadata lookup fails
- Avoid warning/error colors (red, orange, yellow) - keep styling calm

---

### Task 3: Create Barrel Export
**File:** `/src/components/guest/MissingTranslationBanner/index.ts`
**Effort:** XS

**Actions:**
1. Create index.ts file
2. Export component and types for clean imports
3. Add file header comment

**Acceptance Criteria:**
- [ ] Named export for `MissingTranslationBanner` component
- [ ] Named export for `MissingTranslationBannerProps` type
- [ ] Can import using `from '@/components/guest/MissingTranslationBanner'`

---

### Task 4: Update Guest Components Barrel Export
**File:** `/src/components/guest/index.ts`
**Effort:** XS

**Actions:**
1. Create or update the guest components barrel file
2. Re-export `MissingTranslationBanner` and its types
3. Ensure consistent export pattern with other guest components

**Acceptance Criteria:**
- [ ] MissingTranslationBanner exported from `/src/components/guest`
- [ ] Can import using `from '@/components/guest'`
- [ ] Export pattern consistent with other guest components (if barrel exists)

---

### Task 5: Add Unit Tests
**File:** `/src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`
**Effort:** S

**Actions:**
1. Create test file with standard testing setup
2. Test component renders with all required props
3. Test language names are correctly displayed for all 6 supported locales
4. Test message format follows expected pattern
5. Test accessibility attributes are present
6. Test className prop merges correctly
7. Test edge cases (missing metadata, invalid codes)

**Test Cases:**
```typescript
describe('MissingTranslationBanner', () => {
  it('renders with correct message format');
  it('displays correct language names from metadata');
  it('has role="status" for accessibility');
  it('has aria-live="polite" for non-urgent announcement');
  it('displays Info icon');
  it('applies custom className');
  it('handles all 6 supported language combinations');
  it('gracefully handles unknown language codes');
});
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage includes rendering, accessibility, and edge cases
- [ ] Tests verify message format correctness
- [ ] Tests verify all 6 supported languages display correctly

---

## 5. Authorized Files and Functions for Modification

### New Files (Create)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.types.ts` | TypeScript interface definitions |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Main component implementation |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Barrel exports |
| `/src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx` | Unit tests |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/guest/index.ts` | Add MissingTranslationBanner export (create if doesn't exist) |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Locale metadata for language display names |
| `/src/lib/utils.ts` | `cn()` utility function |
| `/src/contexts/LocaleContext.tsx` | Type definitions reference |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Pattern reference for banner structure |

---

## 6. Dependencies and Integration

### 6.1 Required Before This Task
- Epic 1 Foundation complete (i18n config with locale metadata)
- Lucide React icons available (already in project)

### 6.2 Consumers of This Component
- `ItemDisplay.tsx` - Will render when guest language differs from displayed language
- `useGuestLanguage` hook - Will provide language state for conditional rendering

### 6.3 Conditional Rendering Logic
The component should be rendered when:
```typescript
// In ItemDisplay or similar consumer
{translationMeta.requestedLanguage !== translationMeta.displayLanguage && (
  <MissingTranslationBanner
    requestedLanguage={translationMeta.requestedLanguage}
    displayLanguage={translationMeta.displayLanguage}
  />
)}
```

---

## 7. Visual Design Reference

### 7.1 Banner Appearance
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⓘ  French translation not available. Showing content in English.      │
└─────────────────────────────────────────────────────────────────────────┘
   ↑                              ↑
   Info icon                      Muted text
   (gray-400)                     (gray-500, text-sm)

Background: gray-100 (#F5F5F5)
```

### 7.2 Contrast with TranslationBanner
| Property | TranslationBanner | MissingTranslationBanner |
|----------|-------------------|--------------------------|
| Background | Light blue (#E3F2FD) | Light gray (#F5F5F5) |
| Purpose | "Content is translated" | "Translation not available" |
| Icon | Globe | Info |
| Action | "View original" link | None |
| Tone | Informative, positive | Neutral, explanatory |

---

## 8. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Screen Reader | `role="status"` announces as status message |
| Live Region | `aria-live="polite"` for non-intrusive updates |
| Icon | `aria-hidden="true"` - decorative only |
| Color Contrast | Gray-500 on gray-100 meets WCAG AA (4.48:1 ratio) |
| Mobile | Full width, text wraps appropriately |

---

## 9. Error Handling

| Scenario | Handling |
|----------|----------|
| Unknown language code | Display raw code as fallback (e.g., "xyz" instead of "Xyz") |
| Missing locale metadata | Graceful fallback to code string |
| Null/undefined props | TypeScript enforcement prevents at compile time |

---

## 10. Testing Strategy

### 10.1 Unit Tests (Task 5)
- Rendering with various language combinations
- Accessibility attributes
- CSS class merging
- Language name resolution

### 10.2 Integration Testing (Future - REQ-320)
- Rendering within ItemDisplay when translation unavailable
- Conditional display based on language state
- Mobile responsiveness

### 10.3 Visual Regression (Future - REQ-328)
- Banner appearance on various screen sizes
- Stacking with other banners
- Dark mode compatibility (if applicable)

---

## 11. Performance Considerations

| Aspect | Approach |
|--------|----------|
| Bundle Size | Minimal - single component with Lucide icon |
| Render Performance | Stateless component, no side effects |
| Memory | No state management required |
| Re-renders | Only when props change |

---

## 12. Future Considerations

1. **Internationalization of Banner Text**: Currently message is in English. Future enhancement could translate the banner message itself using next-intl.

2. **Translation Request Feature**: Could add optional "Request translation" link to allow guests to express interest in translations for specific languages.

3. **Analytics Integration**: Could track when missing translation banners are displayed to inform translation priority decisions.

---

## 13. Definition of Done

- [ ] All 5 implementation tasks completed
- [ ] Component renders correctly with all language combinations
- [ ] Styling matches design specifications (muted gray, subtle)
- [ ] Accessibility requirements met
- [ ] Unit tests pass with good coverage
- [ ] TypeScript compiles without errors
- [ ] Can be imported from barrel exports
- [ ] Code follows project conventions and patterns
- [ ] Mobile responsive without horizontal scroll
- [ ] Reviewed and approved

---

## References

- **Request:** `/docs/gen_requests_epic4.md` (REQ-347)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Pattern Reference:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Design System:** Tailwind CSS with `cn()` utility from `/src/lib/utils.ts`
