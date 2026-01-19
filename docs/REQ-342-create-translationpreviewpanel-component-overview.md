# REQ-342: Create TranslationPreviewPanel Component - Implementation Overview

**Last Modified:** 2026-01-19
**Request ID:** REQ-342
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Core UI Components
**Task ID:** 2.2
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-341 (TranslationManagement.types.ts)

---

## Summary

Create a slide-in panel component that displays comprehensive translation information for a selected content item. The panel will slide in from the right side of the screen (400px width), show source content at the top, list all six supported languages with their translation status, and provide action buttons for editing translations, triggering re-translation, or retrying failed translations.

---

## User Story

As a **property owner managing multilingual content**, I want to **view a detailed preview of all translations for a selected content item in a slide-in panel** so that I can **quickly assess translation coverage across all languages and take actions like editing or requesting re-translation without navigating away from my current view**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | Component file is created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | File existence check |
| AC-2 | Panel slides in from the right side of the screen with smooth animation | Visual inspection, animation testing |
| AC-3 | Panel width is fixed at 400 pixels for consistent layout | CSS inspection, responsive testing |
| AC-4 | Panel displays source content at the top with clear labeling indicating it is the original version | Visual inspection |
| AC-5 | Panel lists all six supported languages (en, fr, es, de, nl, it) below the source content | Visual inspection, data verification |
| AC-6 | Each language row displays the language name in a user-friendly format with flag emoji | Visual inspection |
| AC-7 | Each language row displays a visual status indicator showing translation state | Visual inspection with test data |
| AC-8 | Status indicators clearly differentiate between pending, completed, failed, processing, and manually edited states using specified colors | Visual inspection |
| AC-9 | Each language row shows a preview of translated content when translation is available | Visual inspection with populated data |
| AC-10 | Edit button appears for each language allowing owners to manually modify translations | Click handler verification |
| AC-11 | Re-translate button appears for completed/manual translations to trigger fresh translation generation | Click handler verification |
| AC-12 | Retry button appears only for failed translations to reprocess the translation job | Conditional rendering verification |
| AC-13 | Close button allows owners to dismiss the panel and return to editing | User interaction testing |
| AC-14 | Panel handles different entity types appropriately (article, item, link) | Props testing |
| AC-15 | Component uses types from TranslationManagement.types.ts file | TypeScript compilation |
| AC-16 | Loading states display appropriately while fetching translation data | Visual inspection |
| AC-17 | Error states display appropriately if translation data cannot be loaded | Error simulation testing |
| AC-18 | Panel is keyboard accessible (Tab, Escape to close) | WCAG 2.1 AA testing |

---

## Technical Approach

### Architecture Overview

The TranslationPreviewPanel will be built using Radix UI Dialog as the foundation, adapted for slide-in panel behavior from the right side. It follows the established component patterns from `ItemPreviewModal.tsx` while implementing specific requirements for translation management.

```
TranslationPreviewPanel/
├── index.ts                         # Public exports
├── TranslationPreviewPanel.tsx      # Main slide-in panel component
└── TranslationPreviewPanel.types.ts # Panel-specific type definitions (optional, may use shared types)
```

### Component Structure

The TranslationPreviewPanel will use Radix UI Dialog with custom positioning for the slide-in effect:

```tsx
<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay />   // Semi-transparent backdrop (click to close)
    <Dialog.Content />   // Fixed right-side panel (400px width, 100vh height)
  </Dialog.Portal>
</Dialog.Root>
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dialog Foundation | Radix UI Dialog | Provides built-in focus trap, ARIA, keyboard nav, accessibility |
| Panel Type | Slide-in from right | Matches PRD spec, non-blocking UX, consistent with existing preview patterns |
| Panel Width | 400px fixed | PRD specification, sufficient for content display |
| Animation | CSS transforms | Hardware-accelerated, smooth performance |
| State Management | Props + local state | Panel is stateless, receives data via props, manages local UI state |
| Status Colors | Tailwind utility classes | Matches PRD spec, consistent with codebase patterns |

### Styling Approach

Following existing patterns:
- Tailwind CSS for all styling
- `cn()` utility from `@/lib/utils` for conditional class composition
- Fixed width (400px), full viewport height
- Status colors per PRD specification:

| Status | Icon | Tailwind Class | Hex Color |
|--------|------|----------------|-----------|
| Original (source) | `●` | `text-blue-500` | N/A |
| Completed | `✓` (CheckCircle) | `text-green-500` | #22C55E |
| Manual | `✎` (PencilLine) | `text-violet-500` | #8B5CF6 |
| Pending | `⏳` (Clock) | `text-amber-500` | #F59E0B |
| Processing | Spinner (Loader2 animated) | `text-amber-500` | #F59E0B |
| Failed | `❌` (XCircle) | `text-red-500` | #EF4444 |
| Stale | `⚠️` (AlertTriangle) | `text-yellow-500` | #EAB308 |

### Accessibility Requirements

- Focus trap within panel (provided by Radix Dialog)
- Keyboard navigation (Tab between elements, Escape to close)
- ARIA labels for all status icons and buttons
- `aria-live="polite"` region for status change announcements
- Minimum 44px touch targets for action buttons
- Focus returns to trigger element on close

---

## Component Props Interface

```typescript
/**
 * Props for TranslationPreviewPanel component
 * @see Plan-111-L10N-Epic5 Task 2.2
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for identifying the content */
  entityId: string;

  /** Source language of the content */
  sourceLanguage: SupportedLanguage;

  /** Source content for display at top of panel */
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };

  /** Whether panel is currently open */
  isOpen: boolean;

  /** Handler called when panel should close */
  onClose: () => void;

  /** Translation data for all languages (fetched externally or passed in) */
  translations?: TranslationStatusMap;

  /** Loading state while fetching translation data */
  isLoading?: boolean;

  /** Error message if translation data fetch failed */
  error?: string | null;

  /** Optional callback when Edit button is clicked for a language */
  onEdit?: (language: SupportedLanguage) => void;

  /** Optional callback when Re-translate button is clicked for a language */
  onRetranslate?: (language: SupportedLanguage) => void;

  /** Optional callback when Retry button is clicked for failed translation */
  onRetry?: (language: SupportedLanguage) => void;

  /** Optional callback for Re-translate All button */
  onRetranslateAll?: () => void;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Translation status map for all languages
 */
export type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationData>>;

/**
 * Translation data for a single language
 */
export interface TranslationData {
  status: TranslationStatusType;
  content?: {
    title?: string;
    description?: string;
    name?: string;
  };
  translatedAt?: string;
  isStale?: boolean;
  reviewedBy?: string;
}

/**
 * Translation status values
 */
export type TranslationStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
```

---

## Implementation Tasks

### Task 1: Create directory structure and index exports
**Effort:** XS (< 15 min)

Create the TranslationPreviewPanel directory under TranslationManagement and set up the index.ts file for public exports.

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Content:**
```typescript
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';
```

### Task 2: Add slide-in/slide-out animations to tailwind.config.js
**Effort:** S (15-30 min)

Add custom Tailwind keyframes and animations for the panel slide effect from the right side.

**Files:**
- Modify: `/tailwind.config.js`

**Implementation Details:**
Add to `theme.extend.keyframes`:
```javascript
'slide-in-right': {
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' }
},
'slide-out-right': {
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' }
},
'fade-in': {
  from: { opacity: '0' },
  to: { opacity: '1' }
},
'fade-out': {
  from: { opacity: '1' },
  to: { opacity: '0' }
}
```

Add to `theme.extend.animation`:
```javascript
'slide-in-right': 'slide-in-right 0.3s ease-out',
'slide-out-right': 'slide-out-right 0.2s ease-in',
'fade-in': 'fade-in 0.2s ease-out',
'fade-out': 'fade-out 0.2s ease-in'
```

### Task 3: Implement main TranslationPreviewPanel.tsx component
**Effort:** L (2-4 hours)

Build the main panel component with all sections:
- Header with title "Translations" and close button
- Source content display section
- Progress indicator (X/5 complete)
- Language list with status rows
- Footer with "Re-translate All" and "Close" buttons

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Component Structure:**
```tsx
'use client';

import { useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  CheckCircle,
  Clock,
  XCircle,
  PencilLine,
  Loader2,
  RefreshCw,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupportedLanguage } from '@/contexts/LocaleContext';
import { SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';
// ... types

export function TranslationPreviewPanel({
  entityType,
  entityId,
  sourceLanguage,
  sourceContent,
  isOpen,
  onClose,
  translations = {},
  isLoading = false,
  error = null,
  onEdit,
  onRetranslate,
  onRetry,
  onRetranslateAll,
  className,
}: TranslationPreviewPanelProps) {
  // ... implementation
}
```

**Key Implementation Points:**

1. **Dialog structure** with overlay and content:
   - `Dialog.Overlay`: fixed inset, bg-black/50, fade animation
   - `Dialog.Content`: fixed, right-0, top-0, h-screen, w-[400px], bg-white, slide-in animation

2. **Source content section**:
   - Label: "Source ({sourceLanguage})"
   - Display title and/or description/name from sourceContent
   - Blue left border indicator for source

3. **Progress indicator**:
   - Calculate completed count from translations
   - Display "3/5 Complete" format with progress bar

4. **Language list**:
   - Iterate through SUPPORTED_LANGUAGES (excluding source language)
   - Each row: Flag emoji, language name, status icon, preview text, action buttons

5. **Footer**:
   - "Re-translate All" button (disabled if no onRetranslateAll provided)
   - "Close" button

### Task 4: Implement language status row rendering
**Effort:** M (1-2 hours)

Create the inline rendering logic for each language row with proper status icons, preview text truncation, and conditional action buttons.

**Within TranslationPreviewPanel.tsx:**

**Status Icon Mapping:**
```typescript
const getStatusIcon = (status: TranslationStatusType, isStale?: boolean) => {
  if (isStale) {
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  }
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'manual':
      return <PencilLine className="w-4 h-4 text-violet-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};
```

**Action Buttons Logic:**
- Edit: Visible for 'completed' and 'manual' status
- Re-translate: Visible for 'completed' and 'manual' status
- Retry: Visible only for 'failed' status

**Preview Text:**
- Truncate to ~60 characters with ellipsis
- Show "Translating..." for 'processing' status
- Show "Translation failed. Click to retry." for 'failed' status
- Show "Translation pending..." for 'pending' status

### Task 5: Implement loading and error states
**Effort:** S (30 min - 1 hour)

Add proper loading skeleton and error display states within the panel.

**Loading State:**
- Skeleton animation for source content area
- Skeleton animation for each language row
- Disable all action buttons

**Error State:**
- Display error message with red styling
- Retry button to refetch data
- Icon indicator (AlertTriangle or XCircle)

### Task 6: Implement accessibility features
**Effort:** S (30 min - 1 hour)

Add comprehensive accessibility support following WCAG 2.1 AA guidelines.

**Implementation:**
- ARIA labels for all icon buttons: `aria-label="Edit French translation"`
- Status descriptions: `aria-describedby` linking to status text
- Screen reader announcements: `aria-live="polite"` region for status changes
- Focus management: Focus close button on open
- Keyboard navigation: Escape closes panel (Radix handles this)
- Touch targets: Minimum 44px for all buttons

### Task 7: Update TranslationManagement index.ts exports
**Effort:** XS (< 15 min)

Export the TranslationPreviewPanel from the parent TranslationManagement index file.

**Files:**
- Create (if not exists): `/src/components/TranslationManagement/index.ts`
- Or Modify (if exists): Add TranslationPreviewPanel export

**Content:**
```typescript
// TranslationManagement component exports
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';

// Re-export types from shared types file when available
```

### Task 8: Create parent TranslationManagement directory if needed
**Effort:** XS (< 15 min)

Ensure the parent `/src/components/TranslationManagement/` directory exists with proper structure.

**Files:**
- Create directory: `/src/components/TranslationManagement/`
- Create: `/src/components/TranslationManagement/index.ts`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Public exports for TranslationManagement components |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Public exports for panel component |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main slide-in panel component |

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/tailwind.config.js` | Add slide-in/slide-out animations | `theme.extend.keyframes`, `theme.extend.animation` |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Radix Dialog patterns, animation implementation, accessibility patterns |
| `/src/lib/utils.ts` | `cn()` utility function for class composition |
| `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type, `SUPPORTED_LOCALES` constant |
| `/src/lib/translation-service/translation-service.types.ts` | Translation types, `SUPPORTED_LANGUAGES`, `TranslationStatus` |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| cn utility | `/src/lib/utils.ts` | Class name composition |
| SupportedLanguage type | `/src/contexts/LocaleContext.tsx` | Language code types |
| SUPPORTED_LANGUAGES | `/src/lib/translation-service/translation-service.types.ts` | Language metadata (flags, names) |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@radix-ui/react-dialog` | (existing) | Accessible dialog foundation |
| `lucide-react` | (existing) | Icons (X, CheckCircle, Clock, XCircle, PencilLine, Loader2, RefreshCw, Edit, AlertTriangle) |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation tables must exist in database |
| Epic 3 | Required | Translation status tracking, manual override API endpoints |
| REQ-341 (TranslationManagement.types.ts) | Soft | Shared types file; can inline types if not yet created |

---

## Visual Design Reference

Per PRD specification:

```
┌─────────────────────────────────────────────────────────────────┐
│ Translations                                              [X]   │
├─────────────────────────────────────────────────────────────────┤
│ Source (English):                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ How to Use the Dishwasher                                   │ │
│ │ Load dishes on the lower and upper racks...                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Translations:    [3/5 Complete] ████████░░                     │
│                                                                 │
│ 🇫🇷 Français ✓ Completed                        [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
│                                                                 │
│ 🇪🇸 Español ✓ Completed                         [Edit] [↻]    │
│    Como usar el lavavajillas                                   │
│                                                                 │
│ 🇩🇪 Deutsch ⏳ In Progress                                     │
│    Translating...                                              │
│                                                                 │
│ 🇳🇱 Nederlands ✓ Completed                      [Edit] [↻]    │
│    Hoe de vaatwasser te gebruiken                              │
│                                                                 │
│ 🇮🇹 Italiano ❌ Failed                          [Retry]        │
│    Translation failed. Click to retry.                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Re-translate All] [Close]        │
└─────────────────────────────────────────────────────────────────┘
```

**Panel Specifications:**
- Width: 400px (fixed)
- Height: 100vh (full viewport height)
- Position: Fixed, right: 0, top: 0
- Z-index: 50 (above main content, below modals)
- Animation: 300ms slide-in from right, 200ms slide-out

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Panel slides in smoothly from right when opened
- [ ] Panel slides out smoothly when closed
- [ ] Panel width is exactly 400px
- [ ] Source content displays correctly with language label
- [ ] All 6 languages are shown (or 5 if source is excluded)
- [ ] Status icons match specification colors
- [ ] Edit button appears for completed/manual translations
- [ ] Re-translate button appears for completed/manual translations
- [ ] Retry button appears only for failed status
- [ ] Click outside (overlay) closes panel
- [ ] Close button (X) closes panel
- [ ] Escape key closes panel
- [ ] Tab navigation works within panel
- [ ] Focus returns to trigger element on close
- [ ] Loading skeleton displays while fetching
- [ ] Error message displays when fetch fails
- [ ] "Re-translate All" button triggers callback
- [ ] Panel handles article, item, and link entity types

### Unit Tests (deferred to Phase 7)

- Component renders with required props
- Status indicators display correct icons and colors
- Action buttons call appropriate callbacks
- Panel opens/closes correctly
- Accessibility attributes present
- Loading and error states render correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1/3 APIs not ready | Medium | Medium | Component receives data via props; can use mock data for development |
| Animation performance on low-end devices | Low | Low | Use CSS transforms only (hardware accelerated), avoid layout thrashing |
| Focus management conflicts with parent modals | Low | Medium | Test with ItemPreviewModal open simultaneously |
| Translation data fetching latency | Medium | Low | Loading skeleton provides feedback; data fetching handled by parent |
| TranslationManagement.types.ts not created | Medium | Low | Inline types in component if shared types file not yet available |

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full implementation plan
- [ItemPreviewModal.tsx](/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx) - Radix Dialog pattern reference
- [LocaleContext.tsx](/src/contexts/LocaleContext.tsx) - SupportedLanguage type, SUPPORTED_LOCALES
- [translation-service.types.ts](/src/lib/translation-service/translation-service.types.ts) - Translation types reference
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
- [WCAG 2.1 Focus Management](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
- [gen_requests_epic5.md](/docs/gen_requests_epic5.md) - Original request REQ-342

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Phase 2, Task 2.2: Create TranslationPreviewPanel component*
