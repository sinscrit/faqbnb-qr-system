# REQ-321: Create BulkTranslationBar Component - Implementation Overview

**Date Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-321
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.1

---

## Summary

Create a BulkTranslationBar component that provides bulk translation operations for multiple selected content items. The bar appears as a fixed footer when items are selected, offering actions to re-translate all languages or specific languages across all selected items, with a progress indicator during bulk operations.

---

## Current Behavior

No bulk translation action interface exists. Property owners who need to re-translate multiple items must open each item individually and request re-translation one at a time. This repetitive workflow becomes time-consuming when managing translation updates across many content items.

---

## Expected Behavior

When a property owner selects one or more content items from the translation management interface:

1. A floating action bar appears at the bottom of the viewport
2. The bar displays the count of selected items (e.g., "5 items selected")
3. Two bulk translation actions are offered:
   - **Re-translate All Languages**: Queues re-translation jobs for all six supported languages across all selected items
   - **Re-translate Specific Language**: Opens a language selector dialog to choose specific language(s) for re-translation
4. During bulk operations, the bar displays a progress indicator showing completion status (e.g., "Processing 3 of 5 items")
5. A dismiss control allows owners to clear the selection and hide the bar
6. The bar remains fixed at the bottom during scrolling, ensuring bulk actions remain accessible

---

## Dependencies

### Epic Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 1 (Foundation) | Required | Translation tables, job queue |
| Epic 3 (Dynamic Content) | Required | Re-translation API endpoints |

### Required APIs (from Epic 5 Phase 1)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/translations/retranslate` | Queue re-translation jobs for multiple entities |

### Required Components (from Epic 5)

| Component | Status | Purpose |
|-----------|--------|---------|
| LanguageSelectorDialog | Phase 4.2 | Select languages for bulk re-translation |
| TranslationManagement.types.ts | Phase 2.1 | Shared type definitions |

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| BulkActionsBar | `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Primary pattern for fixed footer bulk action bar |
| useItemSelection | `/src/components/ItemManager/hooks/useItemSelection.ts` | Selection state management pattern |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern for bulk operations |
| Dialog styling | Existing dialogs use manual modal patterns with focus trap | Focus management and accessibility |

### Styling Patterns

```typescript
// Fixed bottom bar positioning (from BulkActionsBar)
'fixed bottom-0 left-0 right-0 z-40'
'bg-white border-t border-gray-200'
'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
'pb-[env(safe-area-inset-bottom)]'  // iOS safe area
'animate-in slide-in-from-bottom duration-300'

// Touch target sizing
'min-h-[44px] min-w-[44px]'

// Button variants
Primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
Secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
```

### Supported Languages

The system supports six languages for translation:
- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

---

## Component Architecture

### Directory Structure

```
/src/components/TranslationManagement/
└── BulkTranslationBar/
    ├── index.ts                     # Public exports
    ├── BulkTranslationBar.tsx       # Main component
    └── LanguageSelectorDialog.tsx   # Language picker (Task 4.2)
```

### Props Interface

```typescript
/**
 * Props for the BulkTranslationBar component.
 */
export interface BulkTranslationBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Array of selected entity references for bulk operations */
  selectedEntities: Array<{
    type: 'article' | 'item' | 'link';
    id: string;
  }>;

  /** Callback when "Re-translate All Languages" is triggered */
  onRetranslateAll: () => Promise<void>;

  /** Callback when specific language(s) re-translation is confirmed */
  onRetranslateLanguages: (languages: SupportedLanguage[]) => Promise<void>;

  /** Callback when exit/cancel is triggered */
  onExitSelection: () => void;

  /** Whether a bulk operation is in progress */
  loading?: boolean;

  /** Progress state during bulk operations */
  progress?: {
    current: number;
    total: number;
  };

  /** Error message from failed operation */
  error?: string | null;

  /** Success message after completed operation */
  success?: string | null;

  /** Optional additional CSS classes */
  className?: string;
}
```

### State Management

```typescript
// Internal state for language selector
interface BulkTranslationBarState {
  isLanguageSelectorOpen: boolean;
  selectedLanguages: Set<SupportedLanguage>;
}
```

---

## UI Layout Specification

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐  ┌────────────────────────────┐  ┌───────────────────┐  │
│ │ ☑ 5 selected    │  │ [Re-translate All] [Lang▼] │  │ │ | Cancel        │  │
│ └─────────────────┘  └────────────────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

During Operation:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐  ┌────────────────────────────┐  ┌───────────────────┐  │
│ │ ☑ 5 selected    │  │ ⟳ Processing 3 of 5...    │  │     [Cancel]      │  │
│ └─────────────────┘  └────────────────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section Layout

1. **Left Section**: Selection indicator
   - Checkmark icon in pink circle (consistent with BulkActionsBar)
   - Count text: "{n} selected"

2. **Center Section**: Action buttons OR progress indicator
   - When not loading:
     - "Re-translate All" button (primary variant)
     - "Re-translate Language" dropdown button (secondary variant, opens dialog)
   - When loading:
     - Spinner icon with "Processing X of Y items..." text

3. **Right Section**: Cancel/dismiss controls
   - Vertical divider (hidden on mobile)
   - X icon cancel button with "Cancel" label (label hidden on mobile)

---

## Implementation Tasks

### Task 4.1.1: Create Types File (if not exists)
- Ensure `TranslationManagement.types.ts` includes `BulkTranslationBarProps`
- Add `SupportedLanguage` type if not already defined
- Add progress state interface

### Task 4.1.2: Create BulkTranslationBar Component Shell
- Create component file at specified path
- Implement fixed bottom positioning with iOS safe area
- Add slide-in animation from bottom
- Implement conditional rendering (return null when selectedCount === 0)

### Task 4.1.3: Implement Selection Indicator Section
- Pink circle with checkmark icon
- Selection count display
- Screen reader announcement for selected count

### Task 4.1.4: Implement Action Buttons Section
- "Re-translate All Languages" primary button with Languages icon
- "Re-translate Specific Language" secondary button with ChevronDown icon
- Loading state replacement with spinner and progress text
- Success/error message display

### Task 4.1.5: Implement Cancel Section
- Vertical divider (responsive)
- X icon cancel button
- Label visibility (hidden on mobile)

### Task 4.1.6: Add Progress Indicator
- Progress text format: "Processing X of Y items"
- Animated spinner during operations
- Optional progress bar visualization

### Task 4.1.7: Implement Concurrent Operation Prevention
- Disable action buttons when loading is true
- Prevent triggering multiple concurrent bulk operations

### Task 4.1.8: Add Accessibility Features
- ARIA role="toolbar" on container
- ARIA label describing selected count
- Keyboard navigation between action buttons
- Focus management for cancel button

### Task 4.1.9: Create Index Export
- Export component and types from index.ts
- Add to main TranslationManagement index.ts

---

## Acceptance Criteria

- [ ] Action bar appears when one or more content items are selected
- [ ] Bar displays the count of currently selected items in the format "X items selected"
- [ ] Bar offers "Re-translate All Languages" action button
- [ ] Bar offers "Re-translate Specific Language" action button that opens language selector
- [ ] Clicking "Re-translate All Languages" triggers callback with all six languages
- [ ] Language selector allows choosing specific language(s) for targeted bulk re-translation
- [ ] Bar displays progress indicator during bulk operations showing completion status
- [ ] Progress indicator shows format "Processing X of Y items"
- [ ] Bar includes dismiss control that triggers onExitSelection callback
- [ ] Bar remains fixed at bottom of viewport during scrolling
- [ ] Bar prevents triggering multiple concurrent bulk operations (disabled state)
- [ ] Bar displays error state if bulk operations encounter failures
- [ ] Bar provides success confirmation when all bulk operations complete
- [ ] Component is keyboard accessible for all actions
- [ ] Component is responsive and usable on tablet and desktop viewports
- [ ] iOS safe area is respected with bottom padding

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Public exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Main component |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Add BulkTranslationBar export |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add BulkTranslationBarProps interface |

### Patterns to Reference (Read-Only)

| File Path | Pattern |
|-----------|---------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Fixed footer styling, ActionButton component, loading state |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern, focus trap usage |
| `/src/components/ItemManager/hooks/useItemSelection.ts` | Selection state management |
| `/src/lib/utils.ts` | cn utility function |

---

## Error Handling

### Error States

1. **Network/API Error**: Display error message in bar, provide retry option
2. **Partial Failure**: Show count of successful/failed items
3. **Authorization Error**: Display appropriate message, suggest re-authentication

### Error Display

```typescript
// Error message in center section when error prop is set
{error && (
  <div className="flex items-center gap-2 text-red-600">
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm">{error}</span>
    <button onClick={onRetranslateAll}>Retry</button>
  </div>
)}
```

---

## Success Handling

### Success State

After successful completion, display a brief success message before allowing the bar to be dismissed or used for another operation.

```typescript
// Success message in center section when success prop is set
{success && (
  <div className="flex items-center gap-2 text-green-600">
    <Check className="h-4 w-4" />
    <span className="text-sm">{success}</span>
  </div>
)}
```

---

## Responsive Behavior

### Desktop (≥ 640px)
- Full layout with all labels visible
- Vertical divider shown
- Button labels: "Re-translate All" and "Choose Language"

### Mobile (< 640px)
- Compact layout with icons only on action buttons
- Vertical divider hidden
- Cancel label hidden (icon only)
- Touch targets remain 44x44px minimum

---

## Testing Considerations

1. **Unit Tests**
   - Render when selectedCount > 0
   - Not render when selectedCount === 0
   - Display correct count text
   - Call onRetranslateAll when button clicked
   - Call onExitSelection when cancel clicked
   - Show loading state correctly
   - Display progress during operations
   - Display error/success messages

2. **Accessibility Tests**
   - Keyboard navigation works
   - Screen reader announces selection count
   - ARIA attributes are correct

3. **Integration Tests**
   - Works with selection state from parent component
   - Triggers API calls correctly
   - Handles API errors gracefully

---

## Related Documentation

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 Requests: `/docs/gen_requests_epic5.md`
- REQ-321 (this request)
- REQ-322 (LanguageSelectorDialog - Task 4.2)
- Existing BulkActionsBar: `/docs/REQ-070-build-bulkactionsbar-component-overview.md`

---

## Notes

- This component follows the established BulkActionsBar pattern but is specifically designed for translation operations
- The LanguageSelectorDialog (Task 4.2) will be a sibling component in the same directory
- Progress tracking assumes the parent component manages the actual API calls and passes progress state
- Error and success states are transient - parent component should clear them after display
