# REQ-342: Create TranslationStatusItem Component

**Document Type:** Implementation Breakdown (Tech Lead Overview)
**Request ID:** REQ-342, Task 2.3
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Phase:** 2 - Core UI Components
**Parent Epic:** L10N Epic 5 - Owner Translation Management

---

## Overview

This task creates the `TranslationStatusItem` component, a single-row component that displays the translation status for one language within the `TranslationPreviewPanel`. Each row shows a language flag, name, colored status indicator, preview of translated text, and action buttons for editing, re-translating, or retrying failed translations.

The component serves as the core display unit for translation status across the panel, enabling property owners to quickly scan which languages are complete, pending, failed, or manually edited, and take immediate action on any language.

---

## Technical Context

### Existing Stack & Patterns

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **UI Components** | Lucide React icons, existing TagChip/InlineEdit patterns |
| **State Management** | Props-based (controlled by parent TranslationPreviewPanel) |

### Related Components for Pattern Reference

| Component | Location | Relevance |
|-----------|----------|-----------|
| `TagChip` | `/src/components/ItemManager/components/shared/TagChip.tsx` | Status indicator styling with color variants |
| `InlineEdit` | `/src/components/ItemManager/components/shared/InlineEdit.tsx` | Row-based interactive component patterns |
| `LanguageSwitcher` | `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Language display with flags and native names |
| `constants.ts` | `/src/components/LanguageSwitcher/constants.ts` | Locale data structure with flags |

### Dependencies from Epic 1 (Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Available |
| `TranslationStatus` type | `/src/lib/translation-service/translation-service.types.ts` | Available |
| `SUPPORTED_LANGUAGES` | `/src/lib/translation-service/translation-service.types.ts` | Available |
| `getLanguageInfo()` | `/src/lib/translation-service/translation-service.types.ts` | Available |
| `LocaleMetadata` | `/src/lib/i18n/config.ts` | Available |
| `localeMetadata` | `/src/lib/i18n/config.ts` | Available |

---

## Requirements Summary

### From REQ-342 Task 2.3 (Implementation Plan)

```
Task 2.3: Create TranslationStatusItem component
File: /src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx
- Single row showing: flag, language name, status icon, preview text
- Action buttons per row
- Status colors per spec (green=complete, orange=pending, red=failed, purple=manual)
```

### From PRD Visual Specifications

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Original | `●` | Blue | `text-blue-500` |
| Completed | `✓` | Green | `text-green-500` (#22C55E) |
| Manual | `✎` | Purple | `text-violet-500` (#8B5CF6) |
| Pending | `⏳` | Orange | `text-amber-500` (#F59E0B) |
| Failed | `❌` | Red | `text-red-500` (#EF4444) |
| Stale | `⚠️` | Yellow | `text-yellow-500` (#EAB308) |

### Panel Layout Reference (Row Context)

```
│ FR Français ✓ Completed                          [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
```

---

## Implementation Approach

### Component Structure

The `TranslationStatusItem` component will be a controlled, stateless presentation component that:

1. **Receives all data via props** - no internal fetching
2. **Delegates actions to parent** - via callback props
3. **Handles its own visual state** - loading, hover states
4. **Provides keyboard accessibility** - focusable with proper ARIA

### Visual Layout (Grid-based)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Flag] [Language Name] [Status Icon + Label]      [Actions]     │
│        [Preview text (truncated)]                               │
└─────────────────────────────────────────────────────────────────┘
```

Grid columns:
- Column 1: Flag (fixed width ~24px)
- Column 2: Language name + preview (flex grow)
- Column 3: Status indicator (auto width)
- Column 4: Action buttons (fixed width)

### Props Interface

```typescript
interface TranslationStatusItemProps {
  /** Language code for this translation (en, fr, es, de, nl, it) */
  language: SupportedLanguage;

  /** Current translation status */
  status: TranslationStatus | 'stale';

  /** Preview of translated text (truncated if needed) */
  previewText?: string;

  /** Whether this is the source/original language */
  isSource?: boolean;

  /** Whether the translation is stale (source updated after translation) */
  isStale?: boolean;

  /** Callback when Edit button is clicked */
  onEdit?: () => void;

  /** Callback when Re-translate button is clicked */
  onRetranslate?: () => void;

  /** Callback when Retry button is clicked (for failed translations) */
  onRetry?: () => void;

  /** Whether actions are currently disabled (e.g., during processing) */
  disabled?: boolean;

  /** Loading state for this specific row */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### Status-Dependent Behavior

| Status | Available Actions | Visual Indicators |
|--------|-------------------|-------------------|
| `pending` | None (processing) | Orange indicator, spinner/hourglass |
| `processing` | None | Orange indicator, animated spinner |
| `completed` | Edit, Re-translate | Green checkmark |
| `failed` | Retry, Re-translate | Red X icon |
| `manual` | Edit, Re-translate | Purple pencil icon |
| `stale` | Edit, Re-translate | Yellow warning icon (overlay on status) |

### Accessibility Requirements

- Row should be keyboard navigable
- Status icons need ARIA labels (`aria-label="Translation completed"`)
- Action buttons need descriptive labels (`aria-label="Edit French translation"`)
- Use semantic HTML (`<li>` if in list, or `<div role="listitem">`)
- Support reduced motion preferences for any animations

---

## Tasks Breakdown

### Task 2.3.1: Create Component File Structure
**Effort:** ~15 minutes

- Create `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- Add file header with JSDoc documentation
- Import dependencies (React, Lucide icons, types, cn utility)

### Task 2.3.2: Define Props Interface and Types
**Effort:** ~15 minutes

- Define `TranslationStatusItemProps` interface
- Create helper type for status-to-color mapping
- Create helper type for status-to-icon mapping

### Task 2.3.3: Implement Status Icon Component
**Effort:** ~20 minutes

- Create `StatusIcon` sub-component (internal)
- Map each status to appropriate icon (Check, Clock, X, Pencil, AlertTriangle)
- Apply correct color classes per status
- Add animation for `processing` status (spinner)
- Include ARIA labels

### Task 2.3.4: Implement Action Buttons
**Effort:** ~25 minutes

- Create action button group with conditional rendering
- Edit button: appears for `completed`, `manual`, `stale`
- Re-translate button: appears for `completed`, `manual`, `failed`, `stale`
- Retry button: appears only for `failed`
- Style with consistent sizing (44px touch targets on mobile)
- Add loading state handling

### Task 2.3.5: Implement Main Component Layout
**Effort:** ~30 minutes

- Create grid/flex layout for row structure
- Display flag emoji from locale metadata
- Display language name (native name preferred)
- Display status indicator with color and icon
- Display preview text with truncation (max 2 lines)
- Apply hover/focus styles for interactivity

### Task 2.3.6: Add Stale Indicator Overlay
**Effort:** ~15 minutes

- When `isStale` is true, overlay yellow warning icon
- Add tooltip or title text explaining staleness
- Style to overlay main status without replacing it

### Task 2.3.7: Add Accessibility Features
**Effort:** ~15 minutes

- Add appropriate ARIA attributes
- Ensure keyboard navigation works
- Add screen reader announcements for status
- Test with keyboard-only navigation

### Task 2.3.8: Export from Index
**Effort:** ~5 minutes

- Add export to `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- Add export to `/src/components/TranslationManagement/index.ts`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Main component file |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Add export for TranslationStatusItem |
| `/src/components/TranslationManagement/index.ts` | Ensure TranslationStatusItem is exported (if not already via barrel) |

### Dependencies to Import (Read-Only Reference)

| Module | Imports |
|--------|---------|
| `react` | `React` |
| `lucide-react` | `Check`, `Clock`, `X`, `Pencil`, `AlertTriangle`, `RotateCcw`, `Loader2` |
| `@/lib/utils` | `cn` |
| `@/lib/translation-service/translation-service.types` | `SupportedLanguage`, `TranslationStatus`, `getLanguageInfo`, `SUPPORTED_LANGUAGES` |
| `@/lib/i18n/config` | `localeMetadata` (for flag emoji fallback) |

---

## Component Implementation Reference

### Suggested Implementation Structure

```typescript
'use client';

/**
 * TranslationStatusItem Component
 *
 * Displays a single language's translation status within the TranslationPreviewPanel.
 * Shows language flag, name, status indicator, preview text, and action buttons.
 *
 * Status colors follow design spec:
 * - Completed: green (#22C55E)
 * - Pending/Processing: orange (#F59E0B)
 * - Failed: red (#EF4444)
 * - Manual: purple (#8B5CF6)
 * - Stale: yellow warning overlay (#EAB308)
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @created 2026-01-19
 */

import React from 'react';
import { Check, Clock, X, Pencil, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
import { getLanguageInfo } from '@/lib/translation-service/translation-service.types';

// Types
export interface TranslationStatusItemProps {
  language: SupportedLanguage;
  status: TranslationStatus;
  previewText?: string;
  isSource?: boolean;
  isStale?: boolean;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Status configuration
const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-500', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-amber-500', label: 'Processing', animate: true },
  completed: { icon: Check, color: 'text-green-500', label: 'Completed' },
  failed: { icon: X, color: 'text-red-500', label: 'Failed' },
  manual: { icon: Pencil, color: 'text-violet-500', label: 'Manual' },
} as const;

// Component implementation...
export function TranslationStatusItem({ ... }: TranslationStatusItemProps) {
  // Implementation
}

export default TranslationStatusItem;
```

---

## Testing Considerations

### Unit Tests (to be created in Phase 7)

- Render with each status type
- Verify correct icon/color for each status
- Verify action buttons appear conditionally
- Verify callbacks are invoked correctly
- Verify disabled state prevents interactions
- Verify loading state displays correctly
- Verify stale indicator overlay

### Visual Testing

- Test all 6 languages display correctly
- Test truncation of long preview text
- Test responsive behavior (mobile touch targets)
- Test hover/focus states

---

## Dependencies

### Blocked By
- Task 2.1: TranslationManagement.types.ts must exist with shared types

### Blocks
- Task 2.2: TranslationPreviewPanel uses TranslationStatusItem for each language row

---

## Acceptance Criteria

- [ ] Component file created at specified path
- [ ] Row displays language flag icon aligned to the left
- [ ] Row displays language name (native name) adjacent to the flag
- [ ] Row displays status indicator using specified color coding
- [ ] Row displays preview text of translation, truncated appropriately
- [ ] Row includes action buttons for edit, re-translate, and retry operations
- [ ] Retry button appears only when status indicates translation failure
- [ ] Row maintains consistent height across different languages and content lengths
- [ ] Row is keyboard accessible for navigation and action triggering
- [ ] Row styling provides clear visual separation from adjacent rows
- [ ] Clicking action buttons triggers appropriate callbacks
- [ ] Stale indicator shows when isStale prop is true
- [ ] Loading state displays appropriately
- [ ] Component exported from index files

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Pattern Reference (TagChip):** `/src/components/ItemManager/components/shared/TagChip.tsx`
- **Pattern Reference (InlineEdit):** `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- **Pattern Reference (LanguageSwitcher):** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
