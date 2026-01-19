# REQ-353: Create BulkTranslationBar Component - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-353
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.1
**Size:** M (Medium)

---

## Summary

Create the `BulkTranslationBar` component that provides property owners with bulk translation actions when items are selected. The component appears as a floating action bar at the bottom of the viewport (following the existing `BulkActionsBar` pattern) and enables re-translation of multiple items at once, with a progress indicator during bulk operations.

---

## Background & Context

### Problem Statement

Property owners managing multiple items need the ability to:
1. Re-translate selected content in bulk when translations are stale or failed
2. Target specific languages for re-translation across multiple items
3. Monitor progress of bulk translation operations
4. Exit selection mode after completing bulk operations

Currently, owners must manually trigger re-translations for each item individually, which is time-consuming for content with many items.

### Dependencies

**Required from Epic 1 (Foundation):**
- Translation tables: `article_translations`, `item_translations`, `link_translations`, `tag_translations`
- Translation jobs table: `translation_jobs`
- Translation service: `/src/lib/translation-service/`
- Job queue: `/src/lib/job-queue/`
- SupportedLanguage type and SUPPORTED_LANGUAGES constant

**Required from Epic 3 (Dynamic Content Translation):**
- Translation trigger system (re-translation jobs queued here)
- Translation status tracking

**Required API Endpoint (from Plan Task 1.3):**
- `POST /api/translations/retranslate` - Must be created before this component can function

### Related Components

| Component | Location | Relationship |
|-----------|----------|--------------|
| BulkActionsBar | `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | UI pattern reference |
| BulkTagDialog | `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern reference |
| LanguageSelectorDialog | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | To be created (Task 4.2) |
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Selection source |

---

## Technical Approach

### Component Architecture

```
BulkTranslationBar/
├── index.ts                    # Public exports
├── BulkTranslationBar.tsx      # Main component
├── BulkTranslationBar.types.ts # Type definitions
└── LanguageSelectorDialog.tsx  # Language picker (Task 4.2)
```

### Component Behavior

1. **Visibility**: Renders only when `selectedCount > 0`
2. **Position**: Fixed at viewport bottom with iOS safe area support
3. **Animation**: Slide-up entrance animation matching `BulkActionsBar`
4. **Actions**:
   - **Re-translate All**: Re-translate all selected items to all non-source languages
   - **Re-translate Languages...**: Opens `LanguageSelectorDialog` for specific language selection
   - **Cancel**: Exit selection mode
5. **Progress State**: Shows spinner and progress text during bulk operations

### Props Interface

```typescript
interface BulkTranslationBarProps {
  /** Number of items currently selected */
  selectedCount: number;

  /** Selected item IDs with their entity types */
  selectedItems: Array<{
    id: string;
    entityType: 'article' | 'item' | 'link';
  }>;

  /** Callback to re-translate all selected items to all languages */
  onRetranslateAll: () => Promise<void>;

  /** Callback to re-translate selected items to specific languages */
  onRetranslateLanguages: (languages: SupportedLanguage[]) => Promise<void>;

  /** Callback to exit selection mode */
  onExitSelection: () => void;

  /** Whether a bulk operation is in progress */
  loading?: boolean;

  /** Progress information during bulk operations */
  progress?: {
    current: number;
    total: number;
    message?: string;
  };

  /** Whether to warn about overwriting manual edits */
  hasManualEdits?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### State Management

The component itself is stateless - it receives all state via props from the parent (typically the Translation Management page or ItemGrid). The parent manages:
- Selection state (which items are selected)
- Loading/progress state during API calls
- Manual edit detection

### API Integration

The component will call the re-translate API endpoint:

```typescript
// POST /api/translations/retranslate
const response = await fetch('/api/translations/retranslate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entities: selectedItems.map(item => ({
      type: item.entityType,
      id: item.id
    })),
    languages: selectedLanguages, // Optional: all if omitted
    overwriteManual: false // Default: preserve manual edits
  })
});
```

---

## Implementation Tasks

### Task 1: Create Type Definitions
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts`

Define:
- `BulkTranslationBarProps` interface
- `BulkTranslationProgress` interface
- `SelectedTranslationItem` type

### Task 2: Create BulkTranslationBar Component
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

Implement:
- Fixed-position floating bar at viewport bottom
- iOS safe area padding (`pb-[env(safe-area-inset-bottom)]`)
- Selection count indicator with check icon
- "Re-translate All" button (primary variant)
- "Re-translate Languages..." button (secondary variant, opens dialog)
- Cancel button
- Loading state with spinner and optional progress
- Slide-up animation on appear
- Accessibility: `role="toolbar"`, proper ARIA labels
- 44px minimum touch targets for all buttons

### Task 3: Create Internal ActionButton Component
**File:** Same as Task 2 (internal component)

Reusable button with:
- Consistent styling matching `BulkActionsBar.ActionButton`
- Variant support: `primary`, `secondary`, `destructive`
- Icon + label pattern (label hidden on mobile)
- Disabled state handling
- Focus ring for keyboard navigation

### Task 4: Create Barrel Export
**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

Export:
- `BulkTranslationBar` component
- `BulkTranslationBarProps` type
- Related types

### Task 5: Update TranslationManagement Index
**File:** `/src/components/TranslationManagement/index.ts`

Add export for `BulkTranslationBar` and related types.

### Task 6: Add Confirmation Dialog for Manual Edits
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

When `hasManualEdits` is true and user clicks "Re-translate All":
- Show confirmation dialog warning about manual edits
- Options: "Keep Manual Edits" (skip those), "Re-translate Everything" (overwrite)
- Cancel option

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts` | Type definitions |

### Existing Files to Modify

| File Path | Changes | Functions Affected |
|-----------|---------|-------------------|
| `/src/components/TranslationManagement/index.ts` | Add BulkTranslationBar export | N/A (exports only) |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | UI pattern, styling |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern |
| `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage type |
| `/src/lib/i18n/config.ts` | Locale metadata for language display |
| `/src/lib/utils.ts` | `cn()` utility for class merging |

---

## UI/UX Specifications

### Visual Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ✓ 5 selected    [Re-translate All] [Languages...] │ [Cancel]    │   │
│ └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                            (Fixed at bottom)
```

**Loading State:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ✓ 5 selected    [⟳ Re-translating... 3/5]              │ [Cancel]│   │
│ └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Colors and Styling

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Background | White | `bg-white` |
| Border | Gray 200 | `border-t border-gray-200` |
| Shadow | Elevated | `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]` |
| Primary button | Brand pink | `bg-[#FF385C] text-white hover:bg-[#E31C5F]` |
| Secondary button | Gray 100 | `bg-gray-100 text-gray-700 hover:bg-gray-200` |
| Selection indicator | Pink background | `bg-[#FFF0F3]` with pink check icon |
| Cancel button | Gray text | `text-gray-500 hover:text-gray-700` |

### Responsive Behavior

- **Mobile (<640px)**: Buttons show icons only, labels hidden
- **Desktop (>=640px)**: Full button labels visible
- Safe area padding for iOS devices with home indicator

### Accessibility

- `role="toolbar"` on container
- `aria-label` describing the toolbar purpose and selection count
- Individual `aria-label` and `title` on each button
- Focus ring: `focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2`
- All buttons minimum 44x44px touch target
- Screen reader announcement for selection state

---

## Testing Requirements

### Unit Tests

1. **Rendering**
   - Does not render when `selectedCount === 0`
   - Renders with correct selection count
   - Shows/hides language selector based on prop

2. **Actions**
   - Calls `onRetranslateAll` when "Re-translate All" clicked
   - Calls `onExitSelection` when "Cancel" clicked
   - Opens language dialog when "Languages..." clicked

3. **Loading State**
   - Shows spinner when `loading === true`
   - Disables all action buttons during loading
   - Shows progress when provided

4. **Manual Edit Warning**
   - Shows confirmation dialog when `hasManualEdits === true`
   - Respects user choice to keep or overwrite manual edits

### Accessibility Tests

1. Proper ARIA attributes present
2. Keyboard navigation works
3. Focus management correct
4. Touch targets meet 44px minimum

---

## Dependencies & Blockers

### Must Be Completed First

1. **Task 1.3**: Create re-translate API endpoint (`POST /api/translations/retranslate`)
2. **Task 2.1**: Create TranslationManagement types file (shared types)
3. **TranslationManagement folder structure** must exist

### Blocked By

- Nothing - can proceed after above dependencies

### Blocks

- **Task 4.2**: LanguageSelectorDialog (can develop in parallel, integrated later)
- **Task 4.3**: Translation Management page (needs this component)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API endpoint not ready | High | Can develop UI with mock callbacks; integrate later |
| Large selection performance | Medium | Limit displayed count; batch API calls |
| Race conditions during bulk ops | Medium | Disable actions during loading; use loading state |
| Accessibility on mobile | Low | Test with VoiceOver/TalkBack; ensure touch targets |

---

## Acceptance Criteria

- [ ] Component renders when items are selected
- [ ] Component does not render when no items are selected
- [ ] "Re-translate All" triggers re-translation for all selected items
- [ ] "Languages..." opens language selection dialog
- [ ] Cancel button exits selection mode
- [ ] Loading state shows spinner and disables buttons
- [ ] Progress indicator updates during bulk operations
- [ ] Manual edit warning shown when applicable
- [ ] Minimum 44px touch targets on all interactive elements
- [ ] Proper ARIA labels for accessibility
- [ ] Responsive layout (icons-only on mobile)
- [ ] iOS safe area support

---

## References

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Task 4.1
- [BulkActionsBar.tsx](/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx) - UI pattern reference
- [translation-service.types.ts](/src/lib/translation-service/translation-service.types.ts) - Type definitions
