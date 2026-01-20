# Implementation Overview: REQ-E04-012 - Create LanguageIndicator Component

**Request ID:** REQ-E04-012
**Title:** Create Language Indicator Component
**Type:** NEW FEATURE
**Size:** S (Small)
**Priority:** P1 - High
**Epic:** Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.5

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

Create a compact LanguageIndicator component for the application header that displays the current content language with an appropriate flag icon. When viewing translated content, the component should show an optional subtitle indicating the source language (e.g., "translated from Spanish"). The component must be designed for minimal header space usage while remaining readable and accessible.

---

## 2. Requirements Reference

### From gen_requests_epic4.md (Request #12)

**Summary:** Guests should see a compact, visual indicator in the header that displays the current content language with an appropriate flag icon and optional subtitle showing the source language when viewing translations.

**Key Acceptance Criteria:**
- [ ] A component renders in the application header with minimal width suitable for compact header placement
- [ ] The component displays a flag icon representing the currently displayed language
- [ ] The component displays the language name or code beside the flag icon
- [ ] When viewing translated content, an optional subtitle appears showing "translated from [source language]"
- [ ] The subtitle uses smaller font size and muted color compared to the main language label
- [ ] The subtitle positioning (below or beside) adapts appropriately for mobile and desktop viewports
- [ ] The component accepts the current display language as a prop
- [ ] The component accepts an optional source language prop for displaying translation origin
- [ ] When no source language is provided, the subtitle does not appear
- [ ] The component integrates visually with the existing header design system
- [ ] Typography, spacing, and colors match the header's visual style
- [ ] The component remains readable on both light and dark header backgrounds
- [ ] The component is responsive and scales appropriately on mobile devices
- [ ] The component integrates with accessibility standards (appropriate text alternatives for flag icons)
- [ ] The component handles undefined or null language props gracefully

### From Implementation Plan (Plan-111-L10N-Epic4-Guest-Experience.md)

**Task 3.5: Create LanguageIndicator component**
- File: `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- Shows current display language with flag
- Optional: "translated from X" subtitle
- Compact for header use

**Props Interface (from Plan):**
```typescript
export interface LanguageIndicatorProps {
  /** Current display language */
  currentLanguage: SupportedLanguage;
  /** Whether content is translated */
  isTranslated: boolean;
  /** Source language if translated */
  sourceLanguage?: SupportedLanguage;
  /** Additional CSS classes */
  className?: string;
}
```

---

## 3. Technical Investigation

### Existing Patterns Identified

#### Compact Badge Component Pattern
**Reference:** `/src/components/ItemManager/components/shared/VisitCountBadge.tsx:17-111`

```typescript
// Compact badge pattern from VisitCountBadge
export interface VisitCountBadgeProps {
  count: number;
  size?: 'small' | 'medium';
  className?: string;
  loading?: boolean;
}

// Size classes pattern
const sizeClasses = {
  small: 'text-xs px-1.5 py-0.5 gap-1',
  medium: 'text-sm px-2 py-1 gap-1.5',
};

// Rendering pattern
return (
  <span
    className={cn(
      'inline-flex items-center rounded-full',
      'bg-gray-100 text-gray-600 border border-gray-200',
      'font-medium',
      sizeClasses[size],
      className
    )}
    aria-label={`${count} views`}
  >
    <Eye className={cn(iconSize, 'flex-shrink-0')} aria-hidden="true" />
    <span>{formatCount(count)}</span>
  </span>
);
```

#### TagChip Component Pattern
**Reference:** `/src/components/ItemManager/components/shared/TagChip.tsx:51-133`

```typescript
// Compact display component with consistent styling
const chipStyles = cn(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
  'transition-colors',
  variant === 'default' && 'bg-blue-100 text-blue-800 border border-blue-200',
  variant === 'outline' && 'bg-white text-gray-700 border border-gray-300',
  disabled && 'opacity-60 cursor-not-allowed',
  className
);
```

#### Locale Metadata Configuration
**Reference:** `/src/lib/i18n/config.ts:82-119`

```typescript
export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  // ... more languages
};
```

#### Language Types and Constants
**Reference:** `/src/contexts/LocaleContext.tsx:79-86`

```typescript
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

#### Utility Function
**Reference:** `/src/lib/utils.ts:5-7`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Guest Component Directory Structure
**Reference:** Implementation Plan and existing REQ-E04-011 overview

The `/src/components/guest/` directory pattern is established for guest-facing components:

```
/src/components/guest/
├── index.ts                         # Barrel exports
├── GuestLanguageSwitcher/           # REQ-E04-008
├── TranslationBanner/               # REQ-E04-009
├── MissingTranslationBanner/        # REQ-E04-010
├── ViewOriginalToggle/              # REQ-E04-011
└── LanguageIndicator/               # REQ-E04-012 (this task)
    ├── index.ts                     # Component export
    ├── LanguageIndicator.tsx        # Indicator component
    └── LanguageIndicator.types.ts   # Component types
```

---

## 4. Implementation Tasks

### Task 1: Create Types File
**Complexity:** XS | **Risk:** Low

Create the TypeScript type definitions for the LanguageIndicator component.

**Files to Create:**
- `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts`

**Implementation Details:**
```typescript
// LanguageIndicator.types.ts
import type { SupportedLanguage } from '@/types';

/**
 * Props for the LanguageIndicator component
 */
export interface LanguageIndicatorProps {
  /** Current display language code */
  currentLanguage: SupportedLanguage;
  /** Whether the content is translated from another language */
  isTranslated: boolean;
  /** Source language code if content is translated (optional) */
  sourceLanguage?: SupportedLanguage;
  /** Size variant for the indicator */
  size?: 'compact' | 'default';
  /** Whether to show the language name or just the flag */
  showName?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

---

### Task 2: Create LanguageIndicator Component
**Complexity:** S | **Risk:** Low

Implement the main LanguageIndicator component with flag icon and optional subtitle.

**Files to Create:**
- `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Implementation Details:**
1. Use `'use client'` directive if needed (stateless display component may not require it)
2. Import `SUPPORTED_LOCALES` from `@/types` for language metadata
3. Import `cn` utility from `@/lib/utils`
4. Display flag emoji from locale metadata
5. Display language name beside flag
6. Show "translated from [language]" subtitle when `isTranslated` is true and `sourceLanguage` is provided
7. Implement responsive layout for subtitle (below on mobile, inline on desktop)
8. Apply accessible text alternatives for flag emojis
9. Handle missing/invalid language codes gracefully

**Component Structure:**
```typescript
'use client';

/**
 * LanguageIndicator Component
 *
 * Displays the current content language with a flag icon in a compact
 * header-friendly format. Optionally shows translation source information.
 *
 * @module guest/LanguageIndicator
 * @lastModified 2026-01-20 (REQ-E04-012)
 */

import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES } from '@/types';
import type { LanguageIndicatorProps } from './LanguageIndicator.types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get language metadata by code
 */
function getLanguageInfo(code: string) {
  return SUPPORTED_LOCALES.find(l => l.code === code);
}

// =============================================================================
// Component
// =============================================================================

export function LanguageIndicator({
  currentLanguage,
  isTranslated,
  sourceLanguage,
  size = 'default',
  showName = true,
  className,
}: LanguageIndicatorProps) {
  // Get language metadata
  const currentLangInfo = getLanguageInfo(currentLanguage);
  const sourceLangInfo = sourceLanguage ? getLanguageInfo(sourceLanguage) : null;

  // Fallback values for invalid language codes
  const flag = currentLangInfo?.flag || '🌐';
  const languageName = currentLangInfo?.name || currentLanguage.toUpperCase();

  // Show subtitle only when translated and source language is provided
  const showSubtitle = isTranslated && sourceLangInfo;
  const sourceLanguageName = sourceLangInfo?.name || sourceLanguage?.toUpperCase();

  // Size-based styling
  const sizeClasses = {
    compact: {
      container: 'gap-1',
      flag: 'text-base',
      name: 'text-xs',
      subtitle: 'text-[10px]',
    },
    default: {
      container: 'gap-1.5',
      flag: 'text-lg',
      name: 'text-sm',
      subtitle: 'text-xs',
    },
  };

  const styles = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center',
        styles.container,
        className
      )}
      role="status"
      aria-label={`Content language: ${languageName}${showSubtitle ? `, translated from ${sourceLanguageName}` : ''}`}
    >
      {/* Flag Icon */}
      <span
        className={cn(styles.flag, 'flex-shrink-0')}
        aria-hidden="true"
        role="img"
      >
        {flag}
      </span>

      {/* Language Name and Subtitle Container */}
      <div className="flex flex-col leading-tight">
        {/* Language Name */}
        {showName && (
          <span className={cn(styles.name, 'font-medium text-gray-800')}>
            {languageName}
          </span>
        )}

        {/* Translation Subtitle */}
        {showSubtitle && (
          <span className={cn(styles.subtitle, 'text-gray-500')}>
            translated from {sourceLanguageName}
          </span>
        )}
      </div>
    </div>
  );
}

export default LanguageIndicator;
```

---

### Task 3: Create Component Barrel Export
**Complexity:** XS | **Risk:** Low

Create the index.ts barrel export for the LanguageIndicator component.

**Files to Create:**
- `/src/components/guest/LanguageIndicator/index.ts`

**Implementation:**
```typescript
export { LanguageIndicator, default } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator.types';
```

---

### Task 4: Update Guest Components Barrel Export
**Complexity:** XS | **Risk:** Low

Add LanguageIndicator to the root barrel export for all guest components.

**Files to Modify:**
- `/src/components/guest/index.ts`

**Implementation:**
```typescript
// Guest-facing components for translated content display
export * from './GuestLanguageSwitcher';
export * from './TranslationBanner';
export * from './MissingTranslationBanner';
export * from './ViewOriginalToggle';
export * from './LanguageIndicator';  // NEW
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE (New)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/LanguageIndicator/index.ts` | Component barrel export |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main indicator component |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | TypeScript type definitions |

### Files to MODIFY (Existing)

| File Path | Changes |
|-----------|---------|
| `/src/components/guest/index.ts` | Add LanguageIndicator export (if file exists from previous tasks) |

### Functions/Components to CREATE

| Function/Component | Location | Description |
|-------------------|----------|-------------|
| `LanguageIndicator` | `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Main indicator display component |
| `LanguageIndicatorProps` | `/src/components/guest/LanguageIndicator/LanguageIndicator.types.ts` | Props interface |
| `getLanguageInfo` | `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Helper to lookup language metadata |

### Dependencies (External Packages)

| Package | Import | Usage |
|---------|--------|-------|
| `clsx` | Via `cn()` | Class name merging |
| `tailwind-merge` | Via `cn()` | Tailwind class deduplication |

### Dependencies (Internal Modules)

| Module | Import | Usage |
|--------|--------|-------|
| `@/lib/utils` | `cn` | Class name utility |
| `@/types` | `SupportedLanguage`, `SUPPORTED_LOCALES` | Language type definitions |

---

## 6. Design Specifications

### Visual Design

**Container:**
- Display: `inline-flex items-center`
- Gap: `gap-1.5` (default), `gap-1` (compact)
- No background or border (transparent for header integration)

**Flag Icon:**
- Type: Emoji flag from locale metadata
- Size: `text-lg` (default), `text-base` (compact)
- Flex behavior: `flex-shrink-0`

**Language Name:**
- Font: `text-sm font-medium` (default), `text-xs font-medium` (compact)
- Color: `text-gray-800`

**Subtitle (Translation Source):**
- Font: `text-xs` (default), `text-[10px]` (compact)
- Color: `text-gray-500` (muted)
- Format: "translated from [SourceLanguage]"
- Display: Below language name

### Size Variants

| Size | Flag | Name | Subtitle | Use Case |
|------|------|------|----------|----------|
| `default` | text-lg | text-sm | text-xs | Standard header |
| `compact` | text-base | text-xs | text-[10px] | Mobile header, tight spaces |

### States

| State | Appearance |
|-------|------------|
| Standard (not translated) | Flag + Language name only |
| Translated (with source) | Flag + Language name + "translated from X" subtitle |
| Missing language | Globe icon (🌐) + Language code uppercase |

### Responsive Behavior

- **Desktop:** Horizontal layout, subtitle below name
- **Mobile:** Same layout, uses `compact` size variant for space efficiency
- **Container adapts:** Parent component can control size via `size` prop

### Accessibility

- `role="status"`: Indicates this is a status indicator
- `aria-label`: Full text description of language state
- Flag emoji: `aria-hidden="true"` with `role="img"` (decorative, described in aria-label)
- No interactive elements (display only)

---

## 7. Testing Considerations

### Unit Tests to Create

1. **Render Tests:**
   - Renders without crashing with minimal props (currentLanguage, isTranslated=false)
   - Displays correct flag emoji for each supported language
   - Displays correct language name for each supported language
   - Shows subtitle when `isTranslated` is true and `sourceLanguage` is provided
   - Hides subtitle when `isTranslated` is false
   - Hides subtitle when `sourceLanguage` is not provided

2. **Size Variant Tests:**
   - Applies correct classes for 'default' size
   - Applies correct classes for 'compact' size

3. **showName Prop Tests:**
   - Shows language name when `showName` is true (default)
   - Hides language name when `showName` is false

4. **Edge Cases:**
   - Handles unknown language codes gracefully (shows globe icon + code)
   - Handles undefined sourceLanguage when isTranslated is true
   - Handles null className without errors

5. **Accessibility Tests:**
   - Has correct `role="status"` attribute
   - Has descriptive `aria-label` including language name
   - `aria-label` includes source language when translated

### Integration Testing Notes

- Test within guest item page header context
- Test with different header background colors
- Verify text remains readable on light and dark backgrounds
- Test responsiveness on various screen sizes

---

## 8. Implementation Order

1. **Task 1:** Create types file (LanguageIndicator.types.ts)
2. **Task 2:** Create main component (LanguageIndicator.tsx)
3. **Task 3:** Create component barrel export (index.ts)
4. **Task 4:** Update guest components barrel export (/guest/index.ts)

**Estimated Effort:** 1-2 hours

---

## 9. Usage Example

```tsx
// In guest item page header
import { LanguageIndicator } from '@/components/guest';

function GuestItemHeader({ translationMeta }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Logo />

      <div className="flex items-center gap-4">
        {/* Language Indicator */}
        <LanguageIndicator
          currentLanguage={translationMeta.displayLanguage}
          isTranslated={translationMeta.isShowingTranslation}
          sourceLanguage={translationMeta.sourceLanguage}
        />

        {/* Language Switcher */}
        <GuestLanguageSwitcher
          currentLanguage={translationMeta.displayLanguage}
          availableTranslations={translationMeta.availableTranslations}
          sourceLanguage={translationMeta.sourceLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    </header>
  );
}

// Compact variant for mobile
function MobileHeader({ translationMeta }) {
  return (
    <header className="flex items-center justify-between p-2 bg-white">
      <LanguageIndicator
        currentLanguage={translationMeta.displayLanguage}
        isTranslated={translationMeta.isShowingTranslation}
        sourceLanguage={translationMeta.sourceLanguage}
        size="compact"
      />
    </header>
  );
}

// Flag only (no name) variant
function MinimalIndicator({ language }) {
  return (
    <LanguageIndicator
      currentLanguage={language}
      isTranslated={false}
      showName={false}
      size="compact"
    />
  );
}
```

---

## 10. Related Documents

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Epic 4 Requests:** `/docs/gen_requests_epic4.md` (Request #12)
- **Related Components:**
  - GuestLanguageSwitcher (REQ-E04-008)
  - TranslationBanner (REQ-E04-009)
  - MissingTranslationBanner (REQ-E04-010)
  - ViewOriginalToggle (REQ-E04-011)

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Flag emojis render inconsistently across browsers/OS | Medium | Low | Use fallback globe icon (🌐) and rely on text for primary information |
| SUPPORTED_LOCALES not available at import | Low | Medium | Add null check and fallback to language code display |
| Header background affects text readability | Low | Medium | Use high-contrast text colors (gray-800, gray-500) |
| Guest directory may not exist yet | Medium | Low | Create directory structure as part of Task 1 if needed |
| Subtitle causes layout shift on load | Low | Low | Reserve space or use consistent line-height |

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
