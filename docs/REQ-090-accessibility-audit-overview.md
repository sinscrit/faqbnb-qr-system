# Implementation Breakdown: ItemManager Accessibility Audit

**Request Reference**: Task 6.5 from ItemManager Implementation Plan (Phase 6 - Inline Edit & Polish)
**Related PRD**: `/docs/prd/item-capture-manager-implementation-plan.md`
**Document Type**: Technical Implementation Breakdown
**Created**: 2026-01-03
**Last Modified**: 2026-01-03

---

## Summary

Conduct a comprehensive accessibility audit of the ItemManager component to ensure WCAG 2.1 AA compliance. This audit covers keyboard navigation, focus management in modals/dialogs, ARIA labels and roles, and screen reader compatibility. The goal is to ensure the component is fully usable by people with disabilities, following the accessibility patterns established in the existing ItemCapture component.

---

## Task Context

| Attribute | Value |
|-----------|-------|
| **Phase** | 6 - Inline Edit & Polish |
| **Task ID** | 6.5 |
| **Title** | Accessibility audit |
| **Dependencies** | Tasks 6.1-6.4 (InlineEdit component, title/location/tags inline edit, mobile polish) |
| **Complexity** | Medium (M) |

### Task Requirements (from Implementation Plan)

- Keyboard navigation throughout
- Focus management in modals
- ARIA labels and roles
- Screen reader testing

---

## Accessibility Standards Reference

### WCAG 2.1 AA Key Requirements

| Guideline | Description | Relevance to ItemManager |
|-----------|-------------|--------------------------|
| 1.3.1 Info and Relationships | Programmatic structure matches visual | Grid/list layouts, dialogs, toolbar |
| 1.4.3 Contrast Minimum | 4.5:1 for normal text, 3:1 for large text | All UI elements |
| 2.1.1 Keyboard | All functionality via keyboard | All interactive elements |
| 2.1.2 No Keyboard Trap | Users can navigate away | Modals, panels, dialogs |
| 2.4.3 Focus Order | Logical, meaningful focus sequence | Tab order throughout component |
| 2.4.7 Focus Visible | Visible keyboard focus indicator | All focusable elements |
| 4.1.2 Name, Role, Value | ARIA for custom controls | Custom buttons, dialogs, grids |

### Existing Codebase Accessibility Patterns

Based on analysis of `src/components/ItemCapture/`:

| Pattern | Example | Location |
|---------|---------|----------|
| `role="radiogroup"` with `aria-checked` | Content type selection | `ContentTypeStep.tsx:125-179` |
| `role="tablist"` with `aria-selected` | Editor/preview tabs | `MarkdownEditor.tsx:127-166` |
| `role="toolbar"` with labeled buttons | Formatting toolbar | `MarkdownEditor.tsx:196-227` |
| `role="region"` with `aria-label` | Wizard container | `CaptureWizard.tsx:110-111` |
| `role="progressbar"` | Character counter | `MarkdownEditor.tsx:92-108` |
| `aria-hidden="true"` on decorative icons | All icons in buttons | Throughout |
| `min-h-[44px]` touch targets | All interactive elements | WCAG 2.5.5 compliance |
| `focus:ring-2 focus:ring-blue-500` | Focus indicators | Consistent pattern |
| `aria-label` for icon-only buttons | Back/Next navigation | `StepNavigation.tsx:114-127` |
| `aria-live="polite"` for dynamic content | Character count updates | `MarkdownEditor.tsx:86-87` |

---

## Component Audit Scope

### Components to Audit

| Component | File Path | Priority | Key A11y Concerns |
|-----------|-----------|----------|-------------------|
| ItemManager | `ItemManager.tsx` | High | Container role, live regions |
| ItemToolbar | `components/ItemToolbar.tsx` | High | Search input, toolbar role |
| ItemGrid | `components/ItemGrid.tsx` | High | Grid role, keyboard nav |
| ItemList | `components/ItemList.tsx` | High | Table/list role, row navigation |
| ItemCard | `components/ItemCard.tsx` | High | Card role, action buttons |
| ItemRow | `components/ItemRow.tsx` | High | Row role, selection checkbox |
| ItemPreviewModal | `components/ItemPreview/ItemPreviewModal.tsx` | Critical | Focus trap, escape handling |
| MediaGallery | `components/ItemPreview/MediaGallery.tsx` | High | Carousel navigation |
| AssetPanel | `components/AssetPanel/AssetPanel.tsx` | Critical | Drawer focus management |
| BulkActionsBar | `components/BulkActions/BulkActionsBar.tsx` | High | Floating bar announcement |
| ConfirmDeleteDialog | `components/dialogs/ConfirmDeleteDialog.tsx` | Critical | Dialog role, focus trap |
| BulkTagDialog | `components/BulkActions/BulkTagDialog.tsx` | Critical | Dialog, combobox pattern |
| FilterPanel | `components/dialogs/FilterPanel.tsx` | Medium | Collapsible panel |
| SortMenu | `components/dialogs/SortMenu.tsx` | Medium | Menu role, keyboard nav |
| InlineEdit | `components/shared/InlineEdit.tsx` | High | Focus management on edit |
| EmptyState | `components/shared/EmptyState.tsx` | Low | Informative text |
| LoadingState | `components/shared/LoadingState.tsx` | Medium | Live region, busy state |

---

## Technical Approach

### 1. Keyboard Navigation Matrix

Define expected keyboard behavior for all interactive elements:

| Element | Tab | Enter/Space | Arrow Keys | Escape | Home/End |
|---------|-----|-------------|------------|--------|----------|
| Search input | Focus | N/A | N/A | Clear? | N/A |
| View toggle | Focus | Activate | Switch views | N/A | N/A |
| Filter button | Focus | Open panel | N/A | N/A | N/A |
| Sort dropdown | Focus | Open menu | Navigate options | Close | First/Last |
| Item card | Focus | Open preview | Grid nav (optional) | N/A | First/Last item |
| Item row | Focus | Open preview | N/A | N/A | First/Last item |
| Checkbox | Focus | Toggle selection | N/A | N/A | N/A |
| Bulk action bar | Focus first | Activate action | Next action | Exit selection | N/A |
| Modal | Focus first focusable | N/A | N/A | Close modal | N/A |
| Asset panel | Focus first | N/A | N/A | Close panel | N/A |
| Inline edit | Focus | Enter edit mode | N/A | Cancel edit | N/A |
| Gallery | Focus | Zoom/play | Prev/Next media | Close fullscreen | First/Last |

### 2. Focus Management Requirements

#### Modal/Dialog Focus Handling

```typescript
// Pattern for modal focus management
const useFocusTrap = (isOpen: boolean, modalRef: RefObject<HTMLElement>) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();
    } else if (previousFocusRef.current) {
      // Restore focus on close
      previousFocusRef.current.focus();
    }
  }, [isOpen, modalRef]);
};
```

#### Inline Edit Focus Flow

1. Click to enter edit mode → Focus text input
2. Enter/blur to save → Return focus to element that triggered edit
3. Escape to cancel → Return focus to element that triggered edit

### 3. ARIA Implementation Patterns

#### Grid Layout (ItemGrid)

```tsx
<div
  role="grid"
  aria-label="Item collection"
  aria-rowcount={items.length}
>
  {items.map((item, index) => (
    <div
      key={item.id}
      role="gridcell"
      aria-rowindex={index + 1}
      tabIndex={0}
    >
      <ItemCard item={item} />
    </div>
  ))}
</div>
```

#### Selection Announcement

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {selectedIds.length > 0
    ? `${selectedIds.length} items selected`
    : 'No items selected'}
</div>
```

#### Dialog Pattern

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">{title}</h2>
  <p id="dialog-description">{message}</p>
  {/* Dialog content */}
</div>
```

---

## Implementation Tasks

### Task 1: Audit Container and Main Component

**File**: `src/components/ItemManager/ItemManager.tsx`

**Actions**:
1. Add `role="region"` and `aria-label="Item manager"` to container
2. Add live region for selection/filter state announcements
3. Ensure logical tab order follows visual layout
4. Verify all callback-triggering actions are keyboard accessible

**ARIA Additions**:
```tsx
// Main container
<div role="region" aria-label="Item manager">

  {/* Live region for announcements */}
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {announcement}
  </div>

  {/* Component content */}
</div>
```

**Verification**:
- Screen reader announces component name on focus
- Selection changes are announced

---

### Task 2: Audit Toolbar Component

**File**: `src/components/ItemManager/components/ItemToolbar.tsx`

**Actions**:
1. Add `role="toolbar"` to container
2. Add `aria-label` to search input
3. Add `aria-expanded` to filter/sort dropdown triggers
4. Verify button groups have proper keyboard navigation
5. Add screen reader text for view toggle state

**ARIA Additions**:
```tsx
<div role="toolbar" aria-label="Item management controls">
  <input
    type="search"
    aria-label="Search items"
    role="searchbox"
    aria-describedby="search-hint"
  />
  <span id="search-hint" className="sr-only">
    Search by title, location, or tags
  </span>

  <button
    aria-expanded={isFilterOpen}
    aria-controls="filter-panel"
    aria-label="Filter items"
  >
    <Filter aria-hidden="true" />
  </button>

  {/* View toggle with aria-pressed */}
  <button
    aria-pressed={viewMode === 'grid'}
    aria-label="Grid view"
  >
    <Grid aria-hidden="true" />
  </button>
</div>
```

**Verification**:
- Tab navigates between toolbar controls
- Arrow keys navigate within button groups (optional enhancement)
- Screen reader announces control purposes

---

### Task 3: Audit Grid and List Views

**Files**:
- `src/components/ItemManager/components/ItemGrid.tsx`
- `src/components/ItemManager/components/ItemList.tsx`

**Actions**:
1. Add `role="grid"` or `role="list"` to containers
2. Add `aria-label` describing the content
3. Add roving tabindex for grid navigation (optional)
4. Announce loading states with `aria-busy`
5. Announce empty states with appropriate message

**Grid Pattern**:
```tsx
<div
  role="grid"
  aria-label={`${items.length} items`}
  aria-busy={loading}
  aria-describedby={items.length === 0 ? 'empty-message' : undefined}
>
  {items.map((item, idx) => (
    <div
      key={item.id}
      role="gridcell"
      tabIndex={idx === focusedIndex ? 0 : -1}
      onKeyDown={handleGridKeyDown}
    >
      {/* Item content */}
    </div>
  ))}
</div>
```

**List Pattern**:
```tsx
<div
  role="list"
  aria-label={`${items.length} items`}
>
  {items.map(item => (
    <div key={item.id} role="listitem">
      {/* Item content */}
    </div>
  ))}
</div>
```

**Verification**:
- Screen reader announces list/grid and item count
- Keyboard navigation between items works
- Selection state is announced

---

### Task 4: Audit ItemCard and ItemRow

**Files**:
- `src/components/ItemManager/components/ItemCard.tsx`
- `src/components/ItemManager/components/ItemRow.tsx`

**Actions**:
1. Add `aria-label` describing item (title + type)
2. Add `aria-selected` for selection state
3. Ensure action buttons have accessible labels
4. Add `aria-hidden` to decorative thumbnails (text already describes item)
5. Make card/row focusable with `tabIndex={0}`

**Card Pattern**:
```tsx
<div
  role="article"
  aria-label={`${item.title}, ${item.contentType}`}
  aria-selected={isSelected}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(item);
    }
  }}
>
  {/* Selection checkbox - must be labeled */}
  <input
    type="checkbox"
    aria-label={`Select ${item.title}`}
    checked={isSelected}
    onChange={() => onToggleSelect(item.id)}
  />

  {/* Thumbnail is decorative if title is announced */}
  <img
    src={thumbnailUrl}
    alt=""
    aria-hidden="true"
  />

  {/* Action menu */}
  <button
    aria-label={`Actions for ${item.title}`}
    aria-haspopup="menu"
    aria-expanded={isMenuOpen}
  >
    <MoreVertical aria-hidden="true" />
  </button>
</div>
```

**Verification**:
- Screen reader announces item details on focus
- Checkbox selection is keyboard accessible
- Action menu is keyboard navigable

---

### Task 5: Audit Modal Components

**Files**:
- `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

**Actions**:
1. Add `role="dialog"` and `aria-modal="true"`
2. Add `aria-labelledby` pointing to dialog title
3. Implement focus trap (focus stays within dialog)
4. Implement focus restoration on close
5. Add Escape key handler for closing
6. Ensure close button has accessible label

**Focus Trap Implementation**:
```tsx
// Create reusable hook
function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
}
```

**Dialog Pattern**:
```tsx
<div
  ref={dialogRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }}
>
  <h2 id="dialog-title">{title}</h2>
  <p id="dialog-description">{description}</p>

  {/* Dialog content */}

  <button aria-label="Close dialog" onClick={onClose}>
    <X aria-hidden="true" />
  </button>
</div>
```

**Verification**:
- Tab cycles within dialog only
- Escape closes dialog
- Focus returns to trigger element on close
- Screen reader announces dialog title

---

### Task 6: Audit AssetPanel (Drawer)

**File**: `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

**Actions**:
1. Add `role="dialog"` with `aria-modal="true"` (if blocks interaction)
2. Alternatively use `role="complementary"` if non-modal
3. Add `aria-label="Asset management panel"`
4. Implement focus trap for modal drawer
5. Add drag-and-drop accessibility alternatives (up/down buttons)
6. Add keyboard reorder support

**Drag-and-Drop Alternatives**:
```tsx
{/* For each asset item */}
<div role="listitem" aria-label={`${asset.name}, position ${index + 1}`}>
  {/* Move controls for keyboard users */}
  <button
    aria-label={`Move ${asset.name} up`}
    disabled={index === 0}
    onClick={() => moveAsset(index, index - 1)}
  >
    <ChevronUp aria-hidden="true" />
  </button>
  <button
    aria-label={`Move ${asset.name} down`}
    disabled={index === assets.length - 1}
    onClick={() => moveAsset(index, index + 1)}
  >
    <ChevronDown aria-hidden="true" />
  </button>
</div>
```

**Verification**:
- Panel can be navigated without mouse
- Asset order can be changed with keyboard
- Close action is keyboard accessible

---

### Task 7: Audit Bulk Actions Bar

**File**: `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`

**Actions**:
1. Add `role="toolbar"` with `aria-label`
2. Announce bar appearance via live region
3. Ensure all actions have keyboard access
4. Add selection count to screen reader

**Pattern**:
```tsx
<div
  role="toolbar"
  aria-label={`Bulk actions for ${selectedCount} selected items`}
>
  <span aria-live="polite" className="sr-only">
    {selectedCount} items selected. Bulk actions available.
  </span>

  <button aria-label="Delete selected items">
    <Trash2 aria-hidden="true" />
    <span>Delete</span>
  </button>

  <button aria-label="Add tag to selected items">
    <Tag aria-hidden="true" />
    <span>Add Tag</span>
  </button>

  <button aria-label="Clear selection">
    <X aria-hidden="true" />
  </button>
</div>
```

**Verification**:
- Screen reader announces selection count
- All bulk actions are keyboard accessible
- Clear selection is prominent

---

### Task 8: Audit InlineEdit Component

**File**: `src/components/ItemManager/components/shared/InlineEdit.tsx`

**Actions**:
1. Add `aria-label` describing what is being edited
2. Announce edit mode entry/exit
3. Handle focus properly on mode transitions
4. Add save/cancel keyboard shortcuts announcement

**Pattern**:
```tsx
{isEditing ? (
  <input
    ref={inputRef}
    type="text"
    value={editValue}
    onChange={(e) => setEditValue(e.target.value)}
    onBlur={handleSave}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') handleCancel();
    }}
    aria-label={`Edit ${fieldName}`}
    aria-describedby="edit-hint"
  />
  <span id="edit-hint" className="sr-only">
    Press Enter to save, Escape to cancel
  </span>
) : (
  <button
    onClick={startEditing}
    aria-label={`Edit ${fieldName}: ${currentValue}`}
  >
    <span>{currentValue}</span>
    <Edit2 aria-hidden="true" className="opacity-0 group-hover:opacity-100" />
  </button>
)}
```

**Verification**:
- Focus moves to input on edit start
- Focus returns to button after save/cancel
- Screen reader announces editable nature

---

### Task 9: Audit Filter and Sort Components

**Files**:
- `src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- `src/components/ItemManager/components/dialogs/SortMenu.tsx`

**Actions**:
1. Add `role="listbox"` or `role="menu"` as appropriate
2. Add `aria-expanded` to triggers
3. Add keyboard navigation (arrows for menu items)
4. Add `aria-checked` for filter checkboxes
5. Announce active filters

**Filter Panel**:
```tsx
<div
  role="group"
  aria-labelledby="filter-heading"
  aria-expanded={isOpen}
>
  <h3 id="filter-heading">Filter options</h3>

  <fieldset>
    <legend>Content type</legend>
    {contentTypes.map(type => (
      <label key={type.value}>
        <input
          type="checkbox"
          checked={activeFilters.includes(type.value)}
          onChange={() => toggleFilter(type.value)}
          aria-describedby={`filter-${type.value}-count`}
        />
        <span>{type.label}</span>
        <span id={`filter-${type.value}-count`} className="sr-only">
          ({getFilterCount(type.value)} items)
        </span>
      </label>
    ))}
  </fieldset>
</div>
```

**Sort Menu**:
```tsx
<div role="menu" aria-labelledby="sort-button">
  {sortOptions.map(option => (
    <button
      key={option.value}
      role="menuitemradio"
      aria-checked={currentSort === option.value}
      onClick={() => setSort(option.value)}
    >
      {option.label}
      {currentSort === option.value && (
        <Check aria-hidden="true" />
      )}
    </button>
  ))}
</div>
```

**Verification**:
- Filters are keyboard navigable
- Active state is announced
- Sort option can be changed via keyboard

---

### Task 10: Audit Loading and Empty States

**Files**:
- `src/components/ItemManager/components/shared/LoadingState.tsx`
- `src/components/ItemManager/components/shared/EmptyState.tsx`

**Actions**:
1. Add `aria-busy="true"` to loading container
2. Add `role="status"` with loading message
3. Ensure empty state has clear, announced message
4. Make call-to-action in empty state focusable

**Loading State**:
```tsx
<div
  role="status"
  aria-busy="true"
  aria-label="Loading items"
>
  <span className="sr-only">Loading items, please wait...</span>
  {/* Visual skeleton */}
</div>
```

**Empty State**:
```tsx
<div role="status" aria-label="No items found">
  <p>{message}</p>
  {showAction && (
    <button onClick={onAction}>
      {actionLabel}
    </button>
  )}
</div>
```

**Verification**:
- Screen reader announces loading state
- Empty state message is clear
- Action button is keyboard accessible

---

### Task 11: Create Accessibility Testing Utilities

**File**: `src/components/ItemManager/utils/a11yUtils.ts`

**Actions**:
1. Create focus trap hook
2. Create focus restoration hook
3. Create keyboard navigation utilities
4. Create announcement hook for live regions

**Utilities**:
```typescript
// src/components/ItemManager/utils/a11yUtils.ts

/**
 * Hook to manage focus trap within a container.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean
): void;

/**
 * Hook to restore focus to previous element on close.
 */
export function useFocusRestore(isOpen: boolean): void;

/**
 * Hook to announce messages to screen readers.
 */
export function useAnnounce(): {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  AnnouncerRegion: React.FC;
};

/**
 * Keyboard navigation handler for lists/grids.
 */
export function createKeyboardNavigator(options: {
  orientation: 'horizontal' | 'vertical' | 'grid';
  wrap: boolean;
  itemCount: number;
  onNavigate: (newIndex: number) => void;
}): (event: KeyboardEvent) => void;
```

**Verification**: Utilities compile and can be imported

---

### Task 12: Screen Reader Testing

**Manual Testing Checklist**:

Execute with VoiceOver (macOS), NVDA (Windows), or TalkBack (Android):

#### General Navigation
- [ ] Component region is announced on entry
- [ ] Toolbar controls are announced with purpose
- [ ] Search input purpose is clear
- [ ] View mode toggle state is announced
- [ ] Item count is announced

#### Item Interaction
- [ ] Item title and type announced on focus
- [ ] Selection state announced
- [ ] Action menu purpose is clear
- [ ] Preview opens with Enter/Space

#### Selection Mode
- [ ] Selection count announced on change
- [ ] Bulk action bar announced when items selected
- [ ] Bulk action purposes are clear

#### Dialogs
- [ ] Dialog title announced on open
- [ ] Focus moves to dialog on open
- [ ] Dialog content is readable
- [ ] Escape closes dialog
- [ ] Focus returns to trigger on close

#### Asset Panel
- [ ] Panel purpose announced
- [ ] Asset list is navigable
- [ ] Reorder actions are accessible
- [ ] Add/remove actions are clear

#### Inline Edit
- [ ] Editable state announced
- [ ] Edit mode change announced
- [ ] Save/cancel keys explained
- [ ] Successful edit confirmed

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/utils/a11yUtils.ts` | Accessibility utility hooks and helpers |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/ItemManager/ItemManager.tsx` | Add container role, live region |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add toolbar role, search aria |
| `src/components/ItemManager/components/ItemGrid.tsx` | Add grid role, keyboard nav |
| `src/components/ItemManager/components/ItemList.tsx` | Add list role, row semantics |
| `src/components/ItemManager/components/ItemCard.tsx` | Add article role, selection aria |
| `src/components/ItemManager/components/ItemRow.tsx` | Add row semantics, selection aria |
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Add dialog role, focus trap |
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Add drawer accessibility, reorder controls |
| `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Add toolbar role, announcements |
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Add dialog role, focus management |
| `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Add dialog role, focus trap |
| `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Add dialog role, focus trap |
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Add group role, checkbox aria |
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | Add menu role, radio semantics |
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | Add edit mode aria, focus management |
| `src/components/ItemManager/components/shared/EmptyState.tsx` | Add status role |
| `src/components/ItemManager/components/shared/LoadingState.tsx` | Add busy state, status message |

### Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Reference for radiogroup pattern |
| `src/components/ItemCapture/components/shared/StepNavigation.tsx` | Reference for button aria-labels |
| `src/components/ItemCapture/editors/MarkdownEditor.tsx` | Reference for tab, toolbar, progressbar patterns |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Reference for region role |

---

## Acceptance Criteria

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows logical visual flow
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within groups (optional enhancement)
- [ ] Escape closes modals and cancels inline edits
- [ ] No keyboard traps exist

### Focus Management
- [ ] Focus visible on all interactive elements
- [ ] Focus moves to dialog on open
- [ ] Focus trapped within open dialogs
- [ ] Focus returns to trigger on dialog close
- [ ] Focus moves to input on inline edit start
- [ ] Focus returns after inline edit save/cancel

### ARIA Implementation
- [ ] All custom controls have appropriate roles
- [ ] All interactive elements have accessible names
- [ ] Dynamic content updates announced via live regions
- [ ] Selection state communicated via aria-selected/aria-checked
- [ ] Expanded/collapsed state communicated via aria-expanded
- [ ] Dialogs use role="dialog" with aria-modal="true"
- [ ] Decorative icons hidden with aria-hidden="true"

### Screen Reader Testing
- [ ] VoiceOver (macOS) testing complete
- [ ] NVDA (Windows) testing complete (if applicable)
- [ ] All major interactions work without visual reference
- [ ] Announcements are timely and informative
- [ ] No duplicate or confusing announcements

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex grid keyboard navigation | Medium | Medium | Start with simple tab-through; roving tabindex as enhancement |
| Focus trap conflicts with portal dialogs | Medium | High | Test thoroughly; use Radix Dialog if needed |
| VoiceOver Safari quirks | Medium | Medium | Test early; document workarounds |
| Announcement timing issues | Low | Medium | Use debounced announcements for rapid changes |
| Drag-and-drop inaccessibility | High | Medium | Always provide button alternatives for reordering |

---

## Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| axe DevTools | Automated WCAG testing | Run on each component |
| VoiceOver | macOS screen reader | Manual testing |
| NVDA | Windows screen reader | Manual testing |
| Lighthouse | Accessibility score | CI/CD integration |
| Tab key | Keyboard navigation | Manual verification |
| Chrome DevTools | Accessibility tree | Inspect ARIA |

---

## Related Documentation

- [ItemManager Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Full component specification
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Pattern implementations
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) - Component library patterns
- [ItemCapture ContentTypeStep](/src/components/ItemCapture/components/steps/ContentTypeStep.tsx) - Existing radiogroup pattern
- [ItemCapture MarkdownEditor](/src/components/ItemCapture/editors/MarkdownEditor.tsx) - Existing tab/toolbar patterns

---

## Appendix A: Screen Reader Test Script

```markdown
## VoiceOver Test Procedure (macOS)

### Setup
1. Enable VoiceOver: Cmd+F5
2. Navigate to ItemManager test page
3. Enable VoiceOver cursor tracking

### Test 1: Initial Load
1. Navigate to ItemManager region
2. Verify: "Item manager, region" announced
3. Navigate to first item
4. Verify: Item title and type announced

### Test 2: Selection
1. Navigate to item checkbox
2. Verify: "Select [item name], checkbox, unchecked" announced
3. Press Space to select
4. Verify: "checked" announced
5. Navigate to bulk actions bar
6. Verify: Selection count announced

### Test 3: Preview Modal
1. Navigate to item
2. Press Enter to open preview
3. Verify: Dialog title announced
4. Verify: Focus in dialog
5. Navigate with Tab
6. Press Escape to close
7. Verify: Focus returned to item

### Test 4: Inline Edit
1. Navigate to item title
2. Verify: Editable nature announced
3. Press Enter to edit
4. Verify: Focus in text field
5. Type new value
6. Press Enter to save
7. Verify: New value confirmed
```

---

## Appendix B: Focus Trap Hook Implementation

```typescript
// src/components/ItemManager/utils/a11yUtils.ts

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previous focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift+Tab from first element goes to last
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab from last element goes to first
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus on cleanup
      previousFocusRef.current?.focus();
    };
  }, [containerRef, isActive]);
}

export function useFocusRestore(isOpen: boolean): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);
}

export function useAnnounce() {
  const [message, setMessage] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((text: string, politeness: 'polite' | 'assertive' = 'polite') => {
    // Clear previous message for re-announcement
    setMessage('');

    // Small delay to ensure announcement
    timeoutRef.current = setTimeout(() => {
      setMessage(text);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const AnnouncerRegion: React.FC = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, AnnouncerRegion };
}
```
