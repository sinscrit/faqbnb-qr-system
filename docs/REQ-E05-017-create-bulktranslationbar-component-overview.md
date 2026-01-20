# REQ-E05-017: Create BulkTranslationBar Component - Implementation Overview

**Document Created:** 2026-01-20 18:00 UTC
**Last Modified:** 2026-01-20 18:00 UTC
**Request ID:** REQ-E05-017
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.1
**Size:** M (Medium)

---

## Summary

Property owners need a contextual action bar that appears when multiple content items are selected, providing bulk translation operations including re-translate all languages and re-translate specific languages with visual progress feedback. This component enables efficient management of translations across multiple items simultaneously.

---

## Current State

No bulk translation operation interface exists for property owners to manage translations across multiple content items simultaneously. Currently, owners must:
- Open each item individually to view translation status
- Navigate to separate translation pages for each item
- Apply the same translation action to many items one at a time
- No visual progress feedback during translation operations

---

## Desired State

A fixed-position action bar slides up from the bottom of the screen when one or more items are selected in list views:
- Displays the selection count
- Offers "Re-translate All" action (queues translation jobs for all languages across all selected items)
- Offers "Re-translate Specific Language" action (opens language selector dialog)
- Shows "Skip Manual Edits" checkbox to preserve human-reviewed translations
- Progress indicator displays during job queuing
- Success/error notifications on completion
- Integrates with existing ItemManager selection patterns

---

## Dependencies

### Epic Dependencies
| Dependency | Status | Description |
|------------|--------|-------------|
| Epic 1 (Foundation) | Required | Translation tables, translation service, language preferences |
| Epic 3 (Dynamic Content Translation) | Required | Translation trigger system, job queue |
| REQ-E05-003 | Required | Bulk Content Re-Translation Request API Endpoint |

### Internal Dependencies (This Epic)
| Component | File | Purpose |
|-----------|------|---------|
| LanguageSelectorDialog | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Language picker for bulk re-translation (Task 4.2) |
| TranslationManagement.types.ts | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions |

### External Pattern Dependencies
| Component | Location | Pattern Used |
|-----------|----------|--------------|
| BulkActionsBar | `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Fixed bottom action bar pattern |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern with focus trap |
| useItemSelection | `/src/components/ItemManager/hooks/useItemSelection.ts` | Selection state management |

---

## Technical Approach

### Component Architecture

```
/src/components/TranslationManagement/BulkTranslationBar/
├── index.ts                          # Barrel exports
├── BulkTranslationBar.tsx           # Main action bar component
├── BulkTranslationBar.types.ts      # Component-specific types
└── LanguageSelectorDialog.tsx       # Language picker dialog (Task 4.2)
```

### Key Patterns to Follow

#### 1. Action Bar Pattern (from BulkActionsBar.tsx)
- Fixed positioning at viewport bottom with `z-40`
- iOS safe area support: `pb-[env(safe-area-inset-bottom)]`
- Slide-up animation: `animate-in slide-in-from-bottom duration-300`
- Shadow for elevation: `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]`
- Three-section layout: selection indicator (left), actions (center), cancel (right)
- Minimum 44x44px touch targets for accessibility

#### 2. ActionButton Pattern
```typescript
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};
```

#### 3. Dialog Pattern (from BulkTagDialog.tsx)
- Fixed overlay with backdrop: `fixed inset-0 bg-black bg-opacity-50 z-50`
- Focus trap using `useFocusTrap` hook
- Body scroll prevention: `document.body.style.overflow = 'hidden'`
- Escape key handling
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

### Type Definitions

```typescript
// BulkTranslationBar.types.ts

import type { SupportedLanguage } from '@/types/localization';

export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Array of selected item IDs */
  selectedItemIds: string[];
  /** Entity type being managed */
  entityType: 'item' | 'article' | 'link';
  /** Callback when "Re-translate All" is clicked */
  onRetranslateAll: (options: RetranslateOptions) => Promise<void>;
  /** Callback when specific languages are selected for re-translation */
  onRetranslateLanguages: (languages: SupportedLanguage[], options: RetranslateOptions) => Promise<void>;
  /** Callback to exit selection mode / clear selection */
  onExitSelection: () => void;
  /** Optional: Callback when bulk operation completes */
  onComplete?: (result: BulkTranslationResult) => void;
  /** Whether any bulk operation is in progress */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

export interface RetranslateOptions {
  /** Skip items with manual translations (preserve human edits) */
  skipManualEdits: boolean;
}

export interface BulkTranslationResult {
  /** Number of translation jobs successfully queued */
  jobsQueued: number;
  /** Number of translations skipped (e.g., manual edits preserved) */
  jobsSkipped: number;
  /** Whether the operation was successful overall */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
}

export interface TranslationProgress {
  /** Current state of the bulk operation */
  status: 'idle' | 'queuing' | 'completed' | 'error';
  /** Number of items processed so far */
  processedCount: number;
  /** Total number of items to process */
  totalCount: number;
  /** Error message if any */
  error?: string;
}
```

### State Management

```typescript
// Internal state for BulkTranslationBar
interface BulkTranslationBarState {
  // Dialog states
  isLanguageSelectorOpen: boolean;

  // Options
  skipManualEdits: boolean;

  // Progress tracking
  progress: TranslationProgress;

  // Auto-dismiss timer
  autoDismissTimeout: NodeJS.Timeout | null;
}
```

### API Integration

Uses the bulk re-translate API endpoint (REQ-E05-003):

```typescript
// POST /api/translations/retranslate
interface RetranslateRequest {
  entities: { type: 'article' | 'item' | 'link'; id: string }[];
  languages?: SupportedLanguage[];  // All languages if omitted
  skipManualEdits?: boolean;
  overwriteManualEdits?: boolean;
}

interface RetranslateResponse {
  success: boolean;
  jobsQueued: number;
  skipped: number;
  skippedReason?: string;
}
```

---

## Implementation Tasks

### Task 1: Create BulkTranslationBar Type Definitions
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts`

- [ ] Define `BulkTranslationBarProps` interface
- [ ] Define `RetranslateOptions` interface
- [ ] Define `BulkTranslationResult` interface
- [ ] Define `TranslationProgress` interface
- [ ] Export all types

### Task 2: Create BulkTranslationBar Component
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

- [ ] Create fixed-position container at viewport bottom
- [ ] Implement slide-up animation on appear
- [ ] Add iOS safe area support
- [ ] Implement three-section layout (selection count, actions, cancel)
- [ ] Create selection count indicator with styled badge
- [ ] Add "Re-translate All" button (primary variant)
- [ ] Add "Re-translate Languages" button (secondary variant)
- [ ] Add "Skip Manual Edits" checkbox control
- [ ] Implement loading state with spinner and "Queuing translations..." message
- [ ] Implement progress indicator showing "Processing X of Y items..."
- [ ] Add success state with auto-dismiss (2-second delay)
- [ ] Add error state with error message display
- [ ] Implement cancel/exit selection button
- [ ] Handle null selection state (return null when selectedCount === 0)
- [ ] Add ARIA attributes for accessibility (`role="toolbar"`, etc.)
- [ ] Ensure keyboard navigation support

### Task 3: Implement Progress Tracking
**Within BulkTranslationBar.tsx**

- [ ] Create internal progress state management
- [ ] Update progress as API calls complete
- [ ] Display progress count during operation
- [ ] Handle partial failures gracefully

### Task 4: Create Barrel Export
**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

- [ ] Export BulkTranslationBar component
- [ ] Export all types from types file
- [ ] Re-export LanguageSelectorDialog (once created in Task 4.2)

### Task 5: Update TranslationManagement Barrel Export
**File:** `/src/components/TranslationManagement/index.ts`

- [ ] Add BulkTranslationBar exports

---

## Acceptance Criteria

### Functional Requirements
- [ ] Action bar appears at bottom of viewport when one or more items are selected
- [ ] Action bar slides up from bottom with smooth animation (300ms transition)
- [ ] Action bar remains fixed at bottom during page scrolling
- [ ] Selection count displays showing number of selected items (e.g., "3 items selected")
- [ ] "Re-translate All" button triggers translation jobs for all six supported languages for all selected items
- [ ] "Re-translate Specific Language" button opens language selection dialog
- [ ] Checkbox or toggle control for "Skip Manual Edits" option is clearly labeled
- [ ] Progress indicator displays during bulk job creation showing "Queuing translations..."
- [ ] Progress indicator shows completion count as jobs are queued (e.g., "Processing 5 of 12 items...")
- [ ] Success notification displays when all jobs are successfully queued with total count
- [ ] Error notification displays if job creation fails for any items with specific error details
- [ ] "Cancel" or "Clear Selection" button dismisses action bar and deselects all items
- [ ] Action bar automatically dismisses after successful completion with 2-second delay

### Technical Requirements
- [ ] Component accepts array of selected item IDs as required prop
- [ ] Component accepts entity type as required prop (item, article, link)
- [ ] Component accepts onComplete callback that fires when bulk operations finish
- [ ] Component handles API errors gracefully without disrupting other selected items
- [ ] Component integrates with bulk re-translate API endpoint passing selected item IDs
- [ ] Component displays loading state with disabled controls during operation
- [ ] Component works correctly with filtered and sorted list views
- [ ] Component handles edge cases like zero selections gracefully without displaying

### Accessibility Requirements
- [ ] Action bar is fully keyboard accessible with proper focus management
- [ ] Action bar includes appropriate ARIA labels and roles for screen readers
- [ ] All buttons have minimum 44x44px touch targets
- [ ] Focus ring styling matches existing patterns

### Visual Requirements
- [ ] Action bar adapts to mobile viewports maintaining usability at narrow widths
- [ ] Action bar z-index ensures it overlays other content without being obscured
- [ ] Visual design matches application design system with consistent spacing and typography
- [ ] Action buttons use appropriate colors: primary action (Airbnb pink #FF385C)
- [ ] Responsive labels (icons only on mobile, with labels on desktop)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts` | Type definitions |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add BulkTranslationBar exports |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Action bar pattern |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog and loading state patterns |
| `/src/components/ItemManager/hooks/useItemSelection.ts` | Selection state patterns |
| `/src/components/ItemManager/ItemManager.types.ts` | Type definition patterns |
| `/src/components/ItemManager/utils/a11yUtils.ts` | Focus trap utility |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## Testing Requirements

### Unit Tests
- [ ] Renders correctly with various selection counts
- [ ] Does not render when selectedCount is 0
- [ ] "Re-translate All" button triggers correct callback with options
- [ ] "Re-translate Languages" button opens language selector
- [ ] "Skip Manual Edits" checkbox toggles correctly
- [ ] Loading state disables all action buttons
- [ ] Progress updates display correctly
- [ ] Error state displays error message
- [ ] Cancel button calls onExitSelection

### Integration Tests
- [ ] Works correctly within ItemManager selection flow
- [ ] API calls are made with correct payload
- [ ] Handles API errors gracefully
- [ ] Auto-dismisses after successful completion

### Accessibility Tests
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announcements are correct
- [ ] Focus management is correct
- [ ] ARIA attributes are properly set

---

## UI Mockup Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │                             [Content Area]                               ││
│ │                                                                          ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌───────────────────────── BulkTranslationBar ─────────────────────────────┐│
│ │  ┌─────┐                                                                 ││
│ │  │ ✓ │ 5 selected  [Re-translate All] [Re-translate...] [□ Skip Manual]│X││
│ │  └─────┘                                                                 ││
│ └───────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

Loading State:
┌───────────────────────── BulkTranslationBar ─────────────────────────────┐
│  ┌─────┐                                                                 │
│  │ ✓ │ 5 selected     ⟳ Processing 3 of 5 items...                     │X│
│  └─────┘                                                                 │
└───────────────────────────────────────────────────────────────────────────┘

Success State (before auto-dismiss):
┌───────────────────────── BulkTranslationBar ─────────────────────────────┐
│  ┌─────┐                                                                 │
│  │ ✓ │ ✓ 30 translation jobs queued successfully                       │X│
│  └─────┘                                                                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limiting during bulk operations | Medium | Medium | Implement request batching, show progress |
| Large selection causes timeout | Low | Medium | Set reasonable max selection limit (100 items) |
| User navigates away during operation | Medium | Low | Clear state on unmount, show confirmation if dirty |
| Manual translations accidentally overwritten | Medium | High | "Skip Manual Edits" checkbox is checked by default |

---

## Related Documents

- [Epic 5 Implementation Plan](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [REQ-E05-003 - Bulk Re-Translation API](/docs/gen_requests_epic5.md)
- [BulkActionsBar Reference](/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx)
- [ItemManager Types Reference](/src/components/ItemManager/ItemManager.types.ts)

---

## Notes

- The "Skip Manual Edits" checkbox should be **checked by default** to prevent accidental overwriting of human-curated translations
- The component should integrate with the existing ItemManager selection mechanism through props rather than managing its own selection state
- Progress tracking should be optimistic to provide immediate feedback, then reconcile with actual API response
- Consider adding a "Cancel" option during bulk operations if the API supports job cancellation
