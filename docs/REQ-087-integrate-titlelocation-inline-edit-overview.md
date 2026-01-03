# REQ-087: Integrate Title/Location Inline Edit - Implementation Overview

**Document Created:** 2026-01-03T11:30:00
**Last Modified:** 2026-01-03T11:30:00
**Request Reference:** `/docs/gen_requests.md` - REQ-087
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.2
**Status:** PENDING

---

## Overview

This document provides the technical implementation breakdown for integrating inline editing of titles and locations into the ItemCard and ItemRow components. This task leverages the InlineEdit component created in Task 6.1 (REQ-086) to enable users to edit item titles and locations directly in place without navigating to a separate editing interface.

### Purpose

Enable property managers to make quick edits to item titles and locations directly within the item list/grid view, reducing workflow friction and improving content management efficiency.

### Key Deliverables

1. Add InlineEdit component to ItemCard for title and location fields
2. Add InlineEdit component to ItemRow for title and location fields
3. Connect inline edits to the `onUpdateItem` callback
4. Implement `enableInlineEdit` configuration flag support
5. Provide visual feedback for editable fields

### Context Within ItemManager

As per the implementation plan, this is Task 6.2 in Phase 6:

```
6.1 InlineEdit Component (REQ-086) - PREREQUISITE
         │
         ▼
6.2 Title/Location Inline Edit (THIS TASK)
         │
         ▼
6.3 Tags Inline Edit (REQ-088)
```

---

## Dependencies

### Hard Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| InlineEdit component | REQ-086 / Task 6.1 | Must be complete |
| ItemCard component | REQ-058 / Task 1.4 | Must be complete |
| ItemRow component | REQ-059 / Task 1.5 | Must be complete |
| useItemManagerState hook | Task 1.2 | Must be complete |
| ItemManagerConfig type | Task 1.1 | Must be complete |

### Technical Dependencies

| Dependency | Source | Purpose |
|------------|--------|---------|
| InlineEdit | `@/components/ItemManager/components/shared/InlineEdit` | Reusable inline edit component |
| cn() utility | `src/lib/utils.ts` | Class name merging with Tailwind |
| ItemRecord type | `ItemManager.types.ts` | Item data structure |
| ItemManagerConfig type | `ItemManager.types.ts` | Configuration with enableInlineEdit flag |

---

## Component Architecture

### Configuration Interface

The `enableInlineEdit` flag is defined in `ItemManagerConfig`:

```typescript
// From ItemManager.types.ts (already defined)
export interface ItemManagerConfig {
  // ... other options
  /** Enable inline editing of title/location/tags (default: true) */
  enableInlineEdit?: boolean;
  // ...
}
```

### Props Changes Required

#### ItemCard Props Update

```typescript
// File: src/components/ItemManager/components/ItemCard.tsx

export interface ItemCardProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  isSelected: boolean;
  isSelectionMode: boolean;
  className?: string;

  // NEW: Inline edit support
  /** Enable inline editing of title/location (controlled by config.enableInlineEdit) */
  enableInlineEdit?: boolean;

  /** Callback when item is updated via inline edit */
  onUpdateItem?: (item: ItemRecord) => Promise<void>;
}
```

#### ItemRow Props Update

```typescript
// File: src/components/ItemManager/components/ItemRow.tsx

export interface ItemRowProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  isSelected: boolean;
  isSelectionMode: boolean;
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;
  className?: string;

  // NEW: Inline edit support
  /** Enable inline editing of title/location (controlled by config.enableInlineEdit) */
  enableInlineEdit?: boolean;

  /** Callback when item is updated via inline edit */
  onUpdateItem?: (item: ItemRecord) => Promise<void>;
}
```

---

## Implementation Details

### 1. ItemCard Integration

#### Title Field Integration

Replace static title display with conditional InlineEdit:

```typescript
// Current implementation (static display)
<h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
  {item.title}
</h3>

// Updated implementation (conditional inline edit)
{enableInlineEdit && onUpdateItem ? (
  <InlineEdit
    value={item.title}
    onSave={async (newTitle) => {
      await onUpdateItem({ ...item, title: newTitle });
    }}
    placeholder="Enter title..."
    ariaLabel={`Edit title for ${item.title}`}
    maxLength={100}
    minLength={1}
    className="font-semibold text-gray-900 text-sm leading-tight"
    displayClassName="line-clamp-2 group-hover:text-blue-600 transition-colors"
  />
) : (
  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
    {item.title}
  </h3>
)}
```

#### Location Field Integration

Replace static location display with conditional InlineEdit:

```typescript
// Current implementation (static display)
{item.location && (
  <p className="text-xs text-gray-500 mt-1 truncate">
    {item.location}
  </p>
)}

// Updated implementation (conditional inline edit)
{enableInlineEdit && onUpdateItem ? (
  <InlineEdit
    value={item.location || ''}
    onSave={async (newLocation) => {
      await onUpdateItem({
        ...item,
        location: newLocation || undefined
      });
    }}
    placeholder="Add location..."
    ariaLabel={`Edit location for ${item.title}`}
    maxLength={100}
    allowEmpty
    className="text-xs text-gray-500 mt-1"
    displayClassName="truncate"
  />
) : (
  item.location && (
    <p className="text-xs text-gray-500 mt-1 truncate">
      {item.location}
    </p>
  )
)}
```

### 2. ItemRow Integration

#### Title Field Integration

```typescript
// Current implementation
<h3 className="font-medium text-gray-900 truncate">{item.title}</h3>

// Updated implementation
{enableInlineEdit && onUpdateItem ? (
  <InlineEdit
    value={item.title}
    onSave={async (newTitle) => {
      await onUpdateItem({ ...item, title: newTitle });
    }}
    placeholder="Enter title..."
    ariaLabel={`Edit title for ${item.title}`}
    maxLength={100}
    minLength={1}
    className="font-medium text-gray-900"
    displayClassName="truncate"
    inputClassName="text-base"
  />
) : (
  <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
)}
```

#### Location Field Integration

```typescript
// Current implementation
<div className="hidden md:flex w-24 items-center text-sm text-gray-500 truncate">
  {item.location || '-'}
</div>

// Updated implementation
<div className="hidden md:flex w-24 items-center">
  {enableInlineEdit && onUpdateItem ? (
    <InlineEdit
      value={item.location || ''}
      onSave={async (newLocation) => {
        await onUpdateItem({
          ...item,
          location: newLocation || undefined
        });
      }}
      placeholder="Add location"
      ariaLabel={`Edit location for ${item.title}`}
      maxLength={100}
      allowEmpty
      className="text-sm text-gray-500 w-full"
      displayClassName="truncate"
    />
  ) : (
    <span className="text-sm text-gray-500 truncate">
      {item.location || '-'}
    </span>
  )}
</div>
```

### 3. ItemGrid and ItemList Prop Propagation

Both ItemGrid and ItemList must pass the new props to their child components:

```typescript
// ItemGrid.tsx
{filteredItems.map((item) => (
  <ItemCard
    key={item.id}
    item={item}
    onPreviewClick={onPreviewClick}
    onSelectionChange={onSelectionChange}
    isSelected={selectedIds.has(item.id)}
    isSelectionMode={isSelectionMode}
    enableInlineEdit={enableInlineEdit}
    onUpdateItem={onUpdateItem}
  />
))}

// ItemList.tsx
{filteredItems.map((item) => (
  <ItemRow
    key={item.id}
    item={item}
    onPreviewClick={onPreviewClick}
    onSelectionChange={onSelectionChange}
    isSelected={selectedIds.has(item.id)}
    isSelectionMode={isSelectionMode}
    onEdit={onEdit}
    onDelete={onDelete}
    onManageAssets={onManageAssets}
    onDuplicate={onDuplicate}
    enableInlineEdit={enableInlineEdit}
    onUpdateItem={onUpdateItem}
  />
))}
```

### 4. ItemManager Main Component Updates

Pass configuration and callback through to view components:

```typescript
// ItemManager.tsx
const config = {
  ...DEFAULT_CONFIG,
  ...props.config,
};

// In render:
<ItemGrid
  items={filteredItems}
  // ... other props
  enableInlineEdit={config.enableInlineEdit}
  onUpdateItem={async (item) => {
    await props.onUpdateItem(item);
  }}
/>
```

---

## Interaction Design

### Click Behavior Matrix

| Context | Click on Title | Result |
|---------|---------------|--------|
| `enableInlineEdit: true` | Single click | Enters edit mode |
| `enableInlineEdit: true` | Click outside | Saves and exits edit mode |
| `enableInlineEdit: false` | Single click | Triggers preview (via card click) |
| Selection mode active | Any click | Selection toggle (not edit) |

### Visual Indicators

When inline edit is enabled:

1. **Hover State**: Subtle underline or pencil icon appears on hover
2. **Edit Mode**: Field transforms to input with focus ring
3. **Saving State**: Loading spinner, field disabled
4. **Error State**: Red border, error message below

### Selection Mode Interaction

When `isSelectionMode === true`, inline editing should be **disabled** to prevent accidental edits during bulk operations:

```typescript
const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode;
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File | Modification |
|------|--------------|
| `src/components/ItemManager/components/ItemCard.tsx` | Add InlineEdit integration for title and location |
| `src/components/ItemManager/components/ItemRow.tsx` | Add InlineEdit integration for title and location |
| `src/components/ItemManager/components/ItemGrid.tsx` | Pass enableInlineEdit and onUpdateItem props |
| `src/components/ItemManager/components/ItemList.tsx` | Pass enableInlineEdit and onUpdateItem props |
| `src/components/ItemManager/ItemManager.tsx` | Propagate config.enableInlineEdit and onUpdateItem |
| `src/components/ItemManager/ItemManager.types.ts` | Update ItemCardProps and ItemRowProps interfaces |

### Files to Import From (Read Only)

| File | Imports |
|------|---------|
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | `InlineEdit`, `InlineEditProps` |
| `src/lib/utils.ts` | `cn` utility function |

### Files NOT to Modify

- InlineEdit.tsx (use as-is from REQ-086)
- Core ItemCapture components
- Global utility files
- Test files (update separately if needed)

---

## Validation and Error Handling

### Title Validation

```typescript
// Title constraints
minLength: 1,        // Required field
maxLength: 100,      // Reasonable length limit
trimOnSave: true,    // Remove whitespace
allowEmpty: false,   // Title is required
```

### Location Validation

```typescript
// Location constraints
maxLength: 100,      // Reasonable length limit
trimOnSave: true,    // Remove whitespace
allowEmpty: true,    // Location is optional
```

### Error Handling Flow

1. **Validation Error**: InlineEdit displays error, field remains in edit mode
2. **Save Error**: onUpdateItem throws, InlineEdit shows error from exception
3. **Network Error**: Parent wraps onUpdateItem to handle network issues

```typescript
// Parent (ItemManager) wraps the callback
const handleUpdateItem = async (item: ItemRecord) => {
  try {
    await props.onUpdateItem(item);
  } catch (error) {
    // InlineEdit will display error.message
    throw error;
  }
};
```

---

## Accessibility Requirements

### Keyboard Navigation

1. **Tab**: Navigate to editable fields
2. **Enter/Space**: Activate edit mode on focused field
3. **Escape**: Cancel edit, revert to original value
4. **Enter (in edit)**: Save changes
5. **Tab (in edit)**: Save changes, move to next field

### Screen Reader Support

```typescript
<InlineEdit
  ariaLabel={`Edit title for ${item.title}`}
  // InlineEdit internally provides:
  // - aria-invalid for error state
  // - role="alert" for error messages
  // - aria-describedby linking to error
/>
```

### Focus Management

- Focus returns to field after save/cancel
- Error state maintains focus on input
- Clear focus indicators in all states

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Click title in ItemCard enters edit mode
- [ ] Click title in ItemRow enters edit mode
- [ ] Enter saves title change
- [ ] Escape cancels edit without saving
- [ ] Empty title shows validation error
- [ ] Location can be cleared (empty allowed)
- [ ] Changes propagate to parent via onUpdateItem
- [ ] Loading state shows during save
- [ ] Error message displays on save failure
- [ ] Selection mode disables inline edit
- [ ] Keyboard navigation works fully
- [ ] Mobile touch targets are adequate (48px)
- [ ] Screen reader announces state changes

### Integration Test Cases

1. **Edit Title Flow**:
   - Click title → Edit mode → Type → Enter → onUpdateItem called → Display updated

2. **Cancel Edit Flow**:
   - Click title → Edit mode → Type → Escape → Original value restored

3. **Validation Error Flow**:
   - Click title → Clear text → Blur → Error displayed → Edit mode persists

4. **Save Error Flow**:
   - Click title → Type → Enter → onUpdateItem throws → Error displayed

5. **Selection Mode Conflict**:
   - Enter selection mode → Click title → No edit mode activated

---

## Task Checklist

- [ ] Update ItemCardProps interface with enableInlineEdit and onUpdateItem
- [ ] Update ItemRowProps interface with enableInlineEdit and onUpdateItem
- [ ] Import InlineEdit in ItemCard.tsx
- [ ] Import InlineEdit in ItemRow.tsx
- [ ] Implement conditional title inline edit in ItemCard
- [ ] Implement conditional location inline edit in ItemCard
- [ ] Implement conditional title inline edit in ItemRow
- [ ] Implement conditional location inline edit in ItemRow
- [ ] Update ItemGrid to pass new props
- [ ] Update ItemList to pass new props
- [ ] Update ItemManager to propagate config and callback
- [ ] Disable inline edit during selection mode
- [ ] Verify click behavior doesn't conflict with preview
- [ ] Test keyboard navigation
- [ ] Test error handling scenarios
- [ ] Test on mobile devices

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| Update type interfaces | 15 min | Props additions |
| ItemCard integration | 45 min | Title + location inline edit |
| ItemRow integration | 45 min | Title + location inline edit |
| ItemGrid/ItemList prop propagation | 20 min | Pass through props |
| ItemManager updates | 20 min | Config and callback propagation |
| Selection mode handling | 15 min | Disable during selection |
| Testing and refinement | 1 hour | Edge cases, mobile, a11y |
| **Total** | **3-4 hours** | Single developer |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Click conflict with preview | Medium | Medium | Use event.stopPropagation in InlineEdit click handlers |
| Selection mode conflict | Low | Medium | Explicitly disable inline edit when isSelectionMode=true |
| Mobile touch target issues | Low | Low | InlineEdit already designed for 48px minimum targets |
| Async save race conditions | Low | Medium | InlineEdit handles via internal status tracking |
| Performance with many items | Low | Low | InlineEdit is lightweight; minimal overhead |

---

## Implementation Notes

### Prop Drilling Consideration

The enableInlineEdit and onUpdateItem props flow through multiple levels:
```
ItemManager → ItemGrid/ItemList → ItemCard/ItemRow
```

This is acceptable for Phase 6. If this pattern expands significantly, consider:
1. React Context for config
2. Compound component pattern
3. Custom hook for item actions

### Optimistic Updates

The current design uses pessimistic updates (wait for save success). If optimistic updates are desired:

```typescript
// Optimistic pattern (optional enhancement)
const handleTitleSave = async (newTitle: string) => {
  const originalTitle = item.title;
  // Optimistically update UI
  updateLocalItem({ ...item, title: newTitle });
  try {
    await onUpdateItem({ ...item, title: newTitle });
  } catch (error) {
    // Rollback on failure
    updateLocalItem({ ...item, title: originalTitle });
    throw error;
  }
};
```

This is deferred to a future enhancement if needed.

---

## References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6 details
- [REQ-086 InlineEdit](/docs/REQ-086-create-inlineedit-component-overview.md) - Prerequisite component
- [REQ-058 ItemCard](/docs/REQ-058-implement-itemcard-component-overview.md) - Card component spec
- [REQ-059 ItemRow](/docs/REQ-059-implement-itemrow-component-overview.md) - Row component spec
- [ItemManager Types](/src/components/ItemManager/ItemManager.types.ts) - Type definitions
- [Request #087](/docs/gen_requests.md) - Original feature request

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
