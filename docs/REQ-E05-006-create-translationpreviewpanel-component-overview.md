# REQ-E05-006: Create TranslationPreviewPanel Component - Implementation Overview

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 12:00 UTC
**Request ID:** REQ-E05-006
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.2
**Status:** Ready for Detailed Breakdown

---

## 1. Document References

| Reference | Location |
|-----------|----------|
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-E05-007) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Panel Pattern Reference | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` |
| Types File Reference | `/src/components/TranslationManagement/TranslationManagement.types.ts` |
| Base Dialog Pattern | `@radix-ui/react-dialog` |
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` |

---

## 2. Request Summary

**From gen_requests_epic5.md (REQ-E05-007):**

Property owners need a slide-in panel that displays translation status and content for a selected item, showing the source content alongside all available language translations with their current state and available actions.

**Implementation Plan Task 2.2:**
- File: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- Slide-in panel from right (400px width)
- Shows source content at top
- Lists all 6 languages with status
- Action buttons: Edit, Re-translate, Retry

---

## 3. Component Overview

### Purpose

The TranslationPreviewPanel is a slide-in drawer component that provides property owners with a comprehensive view of translation status for any content entity (article, item, or link). It enables quick assessment of translation coverage and provides immediate action capabilities for managing translations.

### Key Features

1. **Slide-in Animation**: 400px wide panel slides in from the right side with smooth 300ms transition
2. **Source Content Display**: Original language content shown at top for reference
3. **Language Status List**: All 6 supported languages displayed with visual status indicators
4. **Action Buttons**: Contextual Edit, Re-translate, and Retry buttons per language
5. **Progress Indicator**: Overall translation progress bar showing completion status
6. **Realtime Updates**: Status updates automatically via Supabase realtime subscription
7. **Responsive Design**: Adapts to tablet viewports (768px and below)
8. **Accessibility**: Full keyboard navigation, ARIA labels, focus management

---

## 4. Technical Context

### Existing Patterns to Follow

| Pattern | Reference File | Usage |
|---------|----------------|-------|
| Modal/Dialog structure | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Radix Dialog base, overlay handling, scroll lock |
| Component props typing | `/src/components/ItemManager/ItemManager.types.ts` | Interface definition patterns, JSDoc comments |
| Utility functions | `/src/lib/utils.ts` | `cn()` for conditional classnames |
| Status indicators | `/src/components/ItemManager/components/shared/TagChip.tsx` | Badge/chip styling patterns |
| Confirm dialogs | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog action buttons, focus management |

### Technology Stack

- **UI Framework**: React 18+ with 'use client' directive
- **Dialog Primitive**: `@radix-ui/react-dialog` for accessible modal base
- **Styling**: Tailwind CSS 4.x with custom animation classes
- **Icons**: Lucide React for status icons
- **State**: Component-local state with optional hook integration

### Dependencies

| Dependency | Purpose |
|------------|---------|
| `@radix-ui/react-dialog` | Accessible dialog/modal primitive (already installed) |
| `lucide-react` | Icon library (already installed) |
| TranslationManagement.types.ts | Type definitions (REQ-E05-005) |
| useTranslationStatus hook | Status data fetching (Phase 2, Task 2.6) |
| useTranslationRealtime hook | Realtime updates (Phase 2, Task 2.7) |

---

## 5. Component Architecture

### File Structure

```
/src/components/TranslationManagement/
├── TranslationPreviewPanel/
│   ├── index.ts                         # Barrel exports
│   ├── TranslationPreviewPanel.tsx      # Main panel component
│   ├── TranslationPreviewPanel.types.ts # Local types (if needed)
│   ├── TranslationStatusItem.tsx        # Single language status row
│   └── TranslationProgressBar.tsx       # Progress indicator
```

### Component Hierarchy

```
TranslationPreviewPanel (main container)
├── Dialog.Portal
│   ├── Dialog.Overlay (backdrop)
│   └── Dialog.Content (slide-in panel)
│       ├── Header Section
│       │   ├── Dialog.Title (entity name)
│       │   └── Dialog.Close (X button)
│       ├── Source Content Section
│       │   └── Source language content display
│       ├── Progress Section
│       │   └── TranslationProgressBar
│       ├── Languages Section (scrollable)
│       │   └── TranslationStatusItem × 6
│       └── Footer Section
│           └── Action buttons (Re-translate All, Close)
```

### Props Interface

```typescript
interface TranslationPreviewPanelProps {
  /** Entity type being previewed */
  entityType: 'article' | 'item' | 'link';
  /** Entity unique identifier */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: SupportedLanguage;
  /** Source content for comparison */
  sourceContent: {
    title?: string;
    name?: string;
    description?: string;
  };
  /** Whether panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional: Callback when translation is manually edited */
  onTranslationEdited?: (language: SupportedLanguage) => void;
  /** Optional CSS class */
  className?: string;
}
```

---

## 6. Visual Design Specifications

### Layout (from PRD)

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

### Status Colors (Tailwind Classes)

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Source/Original | `●` | Blue | `text-blue-500` |
| Completed | `✓` | Green | `text-green-500` (#22C55E) |
| Manual | `✎` | Purple | `text-violet-500` (#8B5CF6) |
| Pending/Processing | `⏳` | Orange | `text-amber-500` (#F59E0B) |
| Failed | `❌` | Red | `text-red-500` (#EF4444) |
| Stale | `⚠️` | Yellow | `text-yellow-500` (#EAB308) |

### Dimensions

| Property | Value |
|----------|-------|
| Panel width | 400px (desktop) |
| Panel max-height | 90vh |
| Animation duration | 300ms |
| Mobile breakpoint | 768px |
| Mobile width | 100% |

---

## 7. Implementation Tasks

### Task 7.1: Create Directory Structure

**Files to Create:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/` (directory)
- `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Estimated Effort:** 1 story point

### Task 7.2: Implement TranslationProgressBar Component

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`

**Requirements:**
- Display "X/Y translations complete" text
- Visual progress bar with animated fill
- Processing state shows animated indicator
- Responsive width within panel

**Estimated Effort:** 1 story point

### Task 7.3: Implement TranslationStatusItem Component

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Requirements:**
- Display language flag/icon and name
- Status indicator with appropriate color/icon
- Preview of translated content (truncated)
- Conditional action buttons based on status:
  - Completed/Manual: [Edit] [Re-translate]
  - Failed: [Retry]
  - Pending/Processing: No actions (disabled or hidden)
- Stale indicator for manual edits with outdated source
- Min-height 44px for touch targets

**Estimated Effort:** 2 story points

### Task 7.4: Implement TranslationPreviewPanel Component

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Requirements:**
- Radix Dialog base with Portal
- Slide-in animation from right (300ms)
- Fixed 400px width on desktop
- Overlay backdrop with fade animation
- Header with title and close button
- Source content display section
- Scrollable language list section
- Footer with bulk actions
- Loading state while fetching translations
- Error state if fetch fails
- Integration point for useTranslationStatus hook
- Integration point for useTranslationRealtime hook

**Estimated Effort:** 3 story points

### Task 7.5: Create Barrel Export

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Requirements:**
- Export TranslationPreviewPanel as default and named
- Export TranslationStatusItem
- Export TranslationProgressBar
- Export any local types

**Estimated Effort:** 1 story point

### Task 7.6: Update Parent Barrel Export

**File:** `/src/components/TranslationManagement/index.ts`

**Requirements:**
- Add export for TranslationPreviewPanel directory

**Estimated Effort:** 1 story point

### Task 7.7: Add Accessibility Features

**Requirements:**
- ARIA labels for status icons
- aria-live announcements for status changes
- Keyboard navigation (Tab through language items)
- Focus trap within panel when open
- Escape key closes panel
- Screen reader announcements

**Estimated Effort:** 1 story point

### Task 7.8: Add Responsive Design

**Requirements:**
- Full-width on mobile (<768px)
- Slide-up animation on mobile (drawer pattern)
- Touch-friendly action buttons (44px targets)
- Mobile drag handle indicator

**Estimated Effort:** 1 story point

---

## 8. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Panel slides in from right side with smooth animation (300ms transition) | Task 7.4 |
| Panel width is fixed at 400 pixels on desktop viewports | Task 7.4 |
| Panel header displays the entity type and identifier or title | Task 7.4 |
| Source content section displays original language content at top of panel | Task 7.4 |
| Language list displays all six supported languages (EN, ES, FR, DE, IT, PT) | Task 7.3, 7.4 |
| Each language entry shows translation status with appropriate visual indicator | Task 7.3 |
| Each language entry displays translation completion percentage or status label | Task 7.3 |
| Edit button opens translation editor for manual content updates | Task 7.3 (click handler) |
| Re-translate button queues new translation job for selected language | Task 7.3 (click handler) |
| Retry button re-attempts failed translation jobs | Task 7.3 (click handler) |
| Action buttons are contextually enabled/disabled based on translation status | Task 7.3 |
| Close button or overlay click dismisses panel with animation | Task 7.4 |
| Panel content scrolls independently when exceeding viewport height | Task 7.4 |
| Panel is responsive and adapts layout for tablet viewports (768px and below) | Task 7.8 |
| Panel overlays content without affecting page layout or causing reflow | Task 7.4 |
| Loading states display while fetching translation data | Task 7.4 |
| Error states display when translation data cannot be loaded | Task 7.4 |
| Component accepts entity reference (entityType and entityId) as props | Task 7.4 |
| Component integrates with translation status API endpoint | Task 7.4 (hook integration) |

---

## 9. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | **PRIMARY TARGET** - Main panel component |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Single language status row |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Progress indicator |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add export for TranslationPreviewPanel |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Dialog pattern reference |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Action button patterns |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions |
| `/src/lib/translation-service/translation-service.types.ts` | Base translation types |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## 10. Dependencies and Blockers

### Required Before Implementation

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E05-005: TranslationManagement.types.ts | Required | Must have `TranslationPreviewPanelProps`, `TranslationStatusItemProps`, `TranslationProgressBarProps` |
| Translation status API (Task 1.1) | Optional | Can stub with mock data initially |
| useTranslationStatus hook (Task 2.6) | Optional | Can implement panel first, add hook later |
| useTranslationRealtime hook (Task 2.7) | Optional | Can add realtime updates as enhancement |

### Unblocks

| Task | Description |
|------|-------------|
| Task 7.1, 7.2 in Plan | Integration into article editor |
| Task 3.5 in Plan | Add translation status column to Items list |
| Task 2.5 in Plan | TranslationEditor modal (Edit button handler) |

---

## 11. Implementation Notes

### Animation Implementation

The slide-in animation should use Tailwind CSS custom animations. Add to `tailwind.config.js` or use inline styles:

```css
/* Slide from right animation */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

### State Management

The component should be "controlled" - it receives `isOpen` and `onClose` props rather than managing its own open state. This allows parent components to control when the panel appears (e.g., after save operations).

Internal state requirements:
- `translations`: Map of language to status (fetched data)
- `isLoading`: Loading indicator
- `error`: Error message if fetch fails

### API Integration Points

The component should accept the following callbacks for action buttons:

```typescript
// These will be connected to API calls or parent handlers
onEdit?: (language: SupportedLanguage) => void;
onRetranslate?: (language: SupportedLanguage) => Promise<void>;
onRetry?: (language: SupportedLanguage) => Promise<void>;
onRetranslateAll?: () => Promise<void>;
```

### Hook Integration Strategy

The panel can be implemented in two phases:
1. **Phase 1**: Static implementation with mock data, props-driven
2. **Phase 2**: Hook integration for data fetching and realtime updates

This allows the UI to be developed and tested before the hooks are ready.

---

## 12. Testing Considerations

### Unit Tests

- TranslationProgressBar renders correct count and progress percentage
- TranslationStatusItem displays correct icon/color for each status
- TranslationStatusItem shows/hides action buttons based on status
- Panel opens/closes with animation triggers
- Keyboard navigation works correctly

### Integration Tests

- Panel fetches translation status on open
- Action buttons trigger correct API calls
- Realtime updates reflect in UI
- Error states display correctly

### Accessibility Tests

- Focus trap works correctly
- Screen reader announces status changes
- All interactive elements are keyboard accessible
- Color contrast meets WCAG AA

---

## 13. Open Questions

1. **Language Order**: Should languages be displayed in a specific order? Current assumption: alphabetical by code (DE, EN, ES, FR, IT, NL) with source language always at top.

2. **Stale Indicator Priority**: When a translation is both 'manual' and stale, which indicator takes precedence? Recommendation: Show stale warning icon with manual status color.

3. **Hook Dependency**: Should the panel require hooks or accept fetched data as props? Recommendation: Support both patterns - hooks for convenience, props for flexibility.

---

## 14. Related Documents

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [gen_requests_epic5.md](./gen_requests_epic5.md) - REQ-E05-007
- [REQ-E05-005-create-translationmanagement-types-file-detailed.md](./REQ-E05-005-create-translationmanagement-types-file-detailed.md)
- ItemPreviewModal.tsx - Pattern reference

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: Create TranslationPreviewPanel Component*
