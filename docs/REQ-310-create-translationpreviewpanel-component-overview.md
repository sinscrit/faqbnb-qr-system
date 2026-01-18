# REQ-310: Create TranslationPreviewPanel Component - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-310
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Core UI Components
**Task ID:** 2.2
**PRD Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-309 (TranslationManagement types)

---

## Summary

Create a slide-in panel component that displays comprehensive translation information for a selected content item. The panel will show source content at the top, list all six supported languages with their translation status, and provide action buttons for editing translations, requesting re-translation, or retrying failed translations.

---

## User Story

As a **property owner managing multilingual content**, I want to **view a detailed preview of all translations for a selected content item in a slide-in panel** so that I can **quickly assess translation coverage across all languages and take actions like editing or requesting re-translation without navigating away from my current view**.

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | Panel slides in from the right side of the viewport when triggered | Visual inspection, animation testing |
| AC-2 | Panel width is exactly 400 pixels | CSS inspection, responsive testing |
| AC-3 | Source content is displayed prominently at the top of the panel | Visual inspection |
| AC-4 | All six supported languages are listed with their current translation status | Visual inspection, data verification |
| AC-5 | Status indicators clearly differentiate between complete, pending, failed, and manually edited states | Visual inspection with test data |
| AC-6 | Edit button allows modification of translation content for selected language | Click handler verification |
| AC-7 | Re-translate button triggers re-translation for selected language | Click handler verification |
| AC-8 | Retry button appears for failed translations and triggers retry operation | Conditional rendering verification |
| AC-9 | Panel closes when user clicks outside the panel or activates a close control | User interaction testing |
| AC-10 | Panel does not disrupt the main content layout when open | Visual inspection, layout testing |
| AC-11 | Panel is keyboard accessible for navigation and actions | WCAG 2.1 AA testing |

---

## Technical Approach

### Architecture Overview

The TranslationPreviewPanel will be built using the existing Radix UI Dialog pattern as a foundation but adapted for a slide-in panel behavior. It will follow the established component conventions from ItemPreviewModal while implementing the specific requirements for translation management.

```
TranslationPreviewPanel/
├── index.ts                         # Public exports
├── TranslationPreviewPanel.tsx      # Main slide-out panel component
├── TranslationPreviewPanel.types.ts # Panel-specific type definitions
├── TranslationStatusItem.tsx        # Single language status row (deferred to REQ-311)
└── TranslationProgressBar.tsx       # Overall progress indicator (deferred to REQ-312)
```

### Component Structure

The TranslationPreviewPanel will use Radix UI Dialog with custom positioning for the slide-in effect:

```tsx
<Dialog.Root>
  <Dialog.Portal>
    <Dialog.Overlay />  // Semi-transparent backdrop
    <Dialog.Content />  // Fixed right-side panel (400px width)
  </Dialog.Portal>
</Dialog.Root>
```

### State Management

The component will manage local state for:
- Loading state during initial data fetch
- Individual language action states (editing, re-translating, retrying)
- Error states for failed operations

Props will receive:
- Entity type and ID for the content item
- Source content for display
- Source language
- Open/close state and handlers
- Callbacks for translation actions

### Styling Approach

Following existing patterns:
- Tailwind CSS for all styling
- `cn()` utility for conditional class composition
- Responsive design (though panel is fixed 400px)
- Status colors per PRD spec:
  - Complete: `text-green-500` (#22C55E)
  - Manual: `text-violet-500` (#8B5CF6)
  - Pending: `text-amber-500` (#F59E0B)
  - Failed: `text-red-500` (#EF4444)
  - Stale: `text-yellow-500` (#EAB308)

### Accessibility Requirements

- Focus trap within panel (Radix provides this)
- Keyboard navigation (Tab, Escape)
- ARIA labels for status icons
- `aria-live` regions for status changes
- Screen reader announcements
- Minimum touch targets (48px mobile, 44px desktop)

---

## Component Props Interface

```typescript
/**
 * Props for TranslationPreviewPanel component
 * @see Plan-111-L10N-Epic5 Task 2.2
 */
export interface TranslationPreviewPanelProps {
  /** Entity type being previewed ('article' | 'item' | 'link') */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for fetching translation data */
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

  /** Optional callback when a translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;

  /** Optional callback when re-translation is requested */
  onRetranslate?: (language: SupportedLanguage) => void;

  /** Optional callback when retry is requested for failed translation */
  onRetry?: (language: SupportedLanguage) => void;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Supported language codes for the application
 * Six languages as specified in PRD
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Translation status values
 */
export type TranslationStatusType =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual';

/**
 * Translation data for a single language
 */
export interface TranslationData {
  language: SupportedLanguage;
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
```

---

## Implementation Tasks

### Task 1: Create directory structure and index exports
**Effort:** XS (< 15 min)

Create the TranslationPreviewPanel directory and set up the index.ts file for public exports.

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

### Task 2: Create TranslationPreviewPanel.types.ts
**Effort:** S (15-30 min)

Define all TypeScript interfaces and types specific to the TranslationPreviewPanel component.

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.types.ts`

**Type Definitions:**
- `TranslationPreviewPanelProps`
- `TranslationData`
- `TranslationStatusType` (if not in shared types)
- Internal state interfaces

### Task 3: Implement main TranslationPreviewPanel.tsx component
**Effort:** L (2-4 hours)

Build the main panel component with:
- Radix Dialog foundation
- Slide-in animation from right
- Fixed 400px width
- Source content display section
- Language list section (placeholder for TranslationStatusItem)
- Footer with bulk actions
- Close button in header

**Files:**
- Create: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Implementation Details:**
```tsx
// Key structural elements:
// 1. Dialog.Root with controlled open state
// 2. Dialog.Portal for rendering outside DOM tree
// 3. Dialog.Overlay with click-to-close behavior
// 4. Dialog.Content with fixed positioning:
//    - position: fixed
//    - right: 0
//    - top: 0
//    - height: 100vh
//    - width: 400px
//    - z-index: 50
// 5. Slide-in animation using Tailwind:
//    - data-[state=open]:animate-slide-in-right
//    - data-[state=closed]:animate-slide-out-right
```

### Task 4: Add slide-in/slide-out animations
**Effort:** S (15-30 min)

Add custom Tailwind animations for the panel slide effect.

**Files:**
- Modify: `/tailwind.config.ts` (add custom keyframes if not present)

**Animation Definitions:**
```typescript
// In tailwind.config.ts extend section:
keyframes: {
  'slide-in-right': {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' }
  },
  'slide-out-right': {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(100%)' }
  }
},
animation: {
  'slide-in-right': 'slide-in-right 0.3s ease-out',
  'slide-out-right': 'slide-out-right 0.3s ease-in'
}
```

### Task 5: Implement inline translation status rendering
**Effort:** M (1-2 hours)

Within the panel, render the six language rows with status indicators, preview text, and action buttons. This is an inline implementation; the separate TranslationStatusItem component is deferred to REQ-311.

**Inline Elements per Language:**
- Language flag emoji/icon
- Language name
- Status icon with appropriate color
- Truncated preview of translation content
- Action buttons (Edit, Re-translate, Retry based on status)

**Status Icon Mapping:**
| Status | Icon | Color Class |
|--------|------|-------------|
| completed | `✓` (CheckCircle) | `text-green-500` |
| manual | `✎` (PencilLine) | `text-violet-500` |
| pending | `⏳` (Clock) | `text-amber-500` |
| processing | `⏳` (Loader2 animated) | `text-amber-500` |
| failed | `❌` (XCircle) | `text-red-500` |

### Task 6: Implement action button handlers
**Effort:** M (1-2 hours)

Wire up the Edit, Re-translate, and Retry action buttons with proper callback invocations and loading states.

**Button Logic:**
- **Edit:** Always visible for completed/manual translations. Opens TranslationEditor (deferred component).
- **Re-translate:** Always visible for completed/manual translations. Shows confirmation if manual.
- **Retry:** Only visible for failed translations.

### Task 7: Implement accessibility features
**Effort:** S (30 min - 1 hour)

Add comprehensive accessibility support:
- ARIA labels for all buttons and icons
- Screen reader announcements for status changes
- Keyboard navigation within panel
- Focus management on open/close
- `aria-describedby` for status explanations

### Task 8: Update TranslationManagement index.ts exports
**Effort:** XS (< 15 min)

Export the TranslationPreviewPanel from the parent TranslationManagement index.

**Files:**
- Modify: `/src/components/TranslationManagement/index.ts`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Public exports for panel component |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main slide-in panel component |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.types.ts` | Panel-specific TypeScript types |

### Files to Modify

| File Path | Changes | Functions/Sections Affected |
|-----------|---------|----------------------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationPreviewPanel export | Export statements |
| `/tailwind.config.ts` | Add slide animations (if not present) | `theme.extend.keyframes`, `theme.extend.animation` |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Radix Dialog patterns, animation implementation |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared translation types (from REQ-309) |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## Dependencies

### Internal Dependencies

| Dependency | Location | Required For |
|------------|----------|--------------|
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions (REQ-309) |
| cn utility | `/src/lib/utils.ts` | Class name composition |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@radix-ui/react-dialog` | (existing) | Accessible dialog foundation |
| `lucide-react` | (existing) | Icons (X, CheckCircle, Clock, XCircle, PencilLine, Loader2, RotateCcw, Edit) |

### Epic Dependencies

| Epic/Request | Dependency Type | Notes |
|--------------|-----------------|-------|
| Epic 1 | Required | Translation tables, translation service must exist |
| Epic 3 | Required | Translation status tracking, manual override API |
| REQ-309 | Required | TranslationManagement.types.ts must be created first |

---

## API Interactions

The panel will consume data from these APIs (created in Phase 1):

### GET /api/translations/status
Fetches translation status for the specified entity.

**Query Parameters:**
- `entityType`: 'article' | 'item' | 'link'
- `entityId`: string

**Response Structure:**
```typescript
interface TranslationStatusResponse {
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  sourceLanguage: SupportedLanguage;
  translations: {
    [key in SupportedLanguage]?: {
      status: TranslationStatusType;
      content?: { title?: string; description?: string; name?: string };
      translatedAt?: string;
      isStale?: boolean;
      reviewedBy?: string;
    };
  };
}
```

### Note on API Dependencies
The panel will initially be implemented with mock data or loading states if APIs from Phase 1 are not yet available. The `useTranslationStatus` hook (Task 2.6) will provide the data fetching abstraction.

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
│ FR Francais ✓ Completed                          [Edit] [↻]    │
│    Comment utiliser le lave-vaisselle                          │
│                                                                 │
│ ES Espanol ✓ Completed                           [Edit] [↻]    │
│    Como usar el lavavajillas                                   │
│                                                                 │
│ DE Deutsch ⏳ In Progress                                       │
│    Translating...                                              │
│                                                                 │
│ NL Nederlands ✓ Completed                        [Edit] [↻]    │
│    Hoe de vaatwasser te gebruiken                              │
│                                                                 │
│ IT Italiano ❌ Failed                            [Retry]        │
│    Translation failed. Click to retry.                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Re-translate All] [Close]        │
└─────────────────────────────────────────────────────────────────┘
```

**Panel Dimensions:**
- Width: 400px (fixed)
- Height: 100vh
- Position: Fixed, right: 0, top: 0

---

## Testing Considerations

### Unit Tests (deferred to Phase 7)
- Component renders with required props
- Status indicators display correct icons and colors
- Action buttons call appropriate callbacks
- Panel opens/closes correctly
- Accessibility attributes present

### Manual Testing Checklist
- [ ] Panel slides in smoothly from right
- [ ] Panel width is exactly 400px
- [ ] Source content displays correctly
- [ ] All 6 languages are shown
- [ ] Status colors match specification
- [ ] Edit button opens editor (when available)
- [ ] Re-translate button triggers callback
- [ ] Retry button appears only for failed status
- [ ] Click outside closes panel
- [ ] Close button closes panel
- [ ] Escape key closes panel
- [ ] Tab navigation works within panel
- [ ] Focus returns to trigger element on close

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1/3 APIs not ready | Medium | Medium | Use mock data, feature flag |
| Animation performance on low-end devices | Low | Low | Use CSS transforms, avoid layout thrashing |
| Focus management conflicts with parent modals | Low | Medium | Test with ItemPreviewModal open |
| Translation data fetching latency | Medium | Low | Implement skeleton loading states |

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Full implementation plan
- [ItemPreviewModal.tsx](/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx) - Radix Dialog pattern reference
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
- [WCAG 2.1 Focus Management](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
