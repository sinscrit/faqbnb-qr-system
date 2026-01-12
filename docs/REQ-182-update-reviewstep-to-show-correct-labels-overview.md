# REQ-182: Update ReviewStep Labels to Distinguish Item Name from Article Purpose

**Document Generated:** 2026-01-12 17:30:00
**Last Modified:** 2026-01-12 17:30:00
**Request ID:** REQ-182
**Type:** ENHANCEMENT
**Size:** S (Small)
**Implementation Plan Reference:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Overview

This task updates the ReviewStep component to display clearer labels that distinguish between the physical item being tagged and any associated article/instructional content. The review screen currently shows a generic "Title" label that does not communicate the semantic meaning of the data model where Items (physical objects) are separate from Articles (instructional content).

The changes align with REQ-2 (Phase 0) of the comprehensive implementation plan, establishing consistent Item vs Article terminology throughout the ItemCapture workflow.

---

## Current State Analysis

### ReviewStep.tsx (Line 420-426)

The current implementation displays the item name under a generic "Title" label:

```tsx
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

### Issues

1. **Label Confusion:** "Title" is ambiguous and doesn't convey that this represents a physical item name
2. **No Article Purpose Section:** The review screen doesn't show article/purpose information when applicable
3. **No QR Code Context:** There's no QR code preview to reinforce that the item name will appear on the QR label
4. **Inconsistent with MetadataStep:** MetadataStep already uses "Item Name" label (updated in REQ-181)

### Related Component State

- **MetadataStep.tsx** - Already updated with "Item Name" label and helper text (REQ-181)
- **ItemCapture.types.ts** - Defines `ItemMetadata.title` field (internally named `title` for backward compatibility)
- **useQRCodeGeneration.ts** - Uses `item.name` for QR code URL, not article purpose

---

## Required Changes

### Task 1: Update "Title" Label to "Item Name"

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** Lines 420-426

Change the label from "Title" to "Item Name" to match MetadataStep terminology:

```tsx
{/* Item Name */}
<div>
  <dt className="text-sm font-medium text-gray-500">Item Name</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

### Task 2: Add Optional Article Purpose Section

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** After the Item Name field in the metadata summary section

Add a conditional section that displays when the workflow captures article-based content. Since the current ItemCapture workflow doesn't yet capture article purpose during initial creation (deferred per Plan-105 Task 0.3), this section should be prepared but may remain hidden until the Content Purpose dropdown is added in a future iteration.

For now, add a placeholder structure that can be enabled when article purpose data becomes available:

```tsx
{/* Purpose/Article (conditional - shown when workflow captures article info) */}
{metadata.articlePurpose && (
  <div>
    <dt className="text-sm font-medium text-gray-500">Purpose/Article</dt>
    <dd className="mt-1 text-sm text-gray-900">{metadata.articlePurpose}</dd>
  </div>
)}
```

**Note:** The `articlePurpose` field doesn't exist in `ItemMetadata` yet. This task should add the conditional render logic, and the field will be wired up when REQ-183 (Content Purpose Dropdown) is implemented.

### Task 3: Add QR Code Preview Context

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** Within the metadata summary section or as a new subsection

Add a visual cue that reinforces the item name will be used on the QR code label. This can be a small informational note:

```tsx
{/* QR Code Label Preview */}
<div className="mt-4 pt-4 border-t border-gray-100">
  <p className="text-xs text-gray-500">
    <span className="font-medium">QR Code Label:</span> {metadata.title.trim() || 'Item Name'}
  </p>
</div>
```

This helps users understand that only the item name (not article purpose) will appear on the physical QR code tag.

---

## Dependencies

### Depends On (upstream)

- **Task 0.1 (REQ-181):** MetadataStep labels update - COMPLETED
  - Reason: ReviewStep labels should match MetadataStep terminology for consistency

### Blocks (downstream)

- **Phase 1 (REQ-5):** Workflow step count fix
  - Reason: Must use correct terminology when referencing "Save Item" as final step
- **Phase 2 (REQ-3):** What's Next screen redesign
  - Reason: WhatsNextStep will reference the saved "Item Name" in success message
- **REQ-183:** Content Purpose Dropdown (future)
  - Reason: The Purpose/Article section added here will display data from that feature

### Parallel Safety

- **Files touched:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
- **Conflicts with:** None currently - ReviewStep is not modified by other Phase 0 tasks
- **Safe to parallelize with:**
  - Task 0.3: Add Article Purpose Field (future enhancement - different scope)
  - Task 0.4: Update QR Code Label Display (touches `useQRCodeGeneration.ts`, not ReviewStep)
  - Phase 3 (REQ-1): Dashboard cards clickable (different components)
  - Phase 4 (REQ-4): Navigation menu update (different components)

---

## Authorized Files and Functions for Modification

### Primary File

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Lines 420-426 (Title section), Lines 463 area (after Tags section) | Label change, new conditional section |

### Detailed Modifications

1. **ReviewStep.tsx Line 420-426**
   - Change: `<dt>Title</dt>` → `<dt>Item Name</dt>`
   - Change: Comment from `{/* Title */}` → `{/* Item Name */}`

2. **ReviewStep.tsx Line ~463 (after Tags section)**
   - Add: Conditional `Purpose/Article` display section
   - Add: QR Code Label preview note

### Type Definitions (Future Enhancement)

| File | Types | Modification Type |
|------|-------|-------------------|
| `src/components/ItemCapture/ItemCapture.types.ts` | `ItemMetadata` interface | Add optional `articlePurpose?: string` field (deferred to REQ-183) |

---

## Implementation Notes

### Backward Compatibility

- The internal field name `metadata.title` remains unchanged to avoid breaking changes
- Only the display label changes from "Title" to "Item Name"
- No database schema changes required

### Accessibility Considerations

- Maintain existing `aria-labelledby` patterns
- Ensure new sections have proper heading hierarchy
- QR Code preview note should be informational, not interactive

### Testing Checklist

- [ ] Review screen displays "Item Name" label instead of "Title"
- [ ] Item name value displays correctly (including empty state)
- [ ] Layout remains consistent with existing design
- [ ] Mobile responsive behavior unchanged
- [ ] Accessibility: screen readers announce "Item Name" correctly

---

## Visual Design Reference

### Current Layout (Before)
```
┌─────────────────────────────────────┐
│ Item Details                   Edit │
├─────────────────────────────────────┤
│ Title          │ Room              │
│ Steamer        │ Kitchen           │
├─────────────────────────────────────┤
│ Item Type      │ Tags              │
│ Kitchen        │ appliance, ...    │
└─────────────────────────────────────┘
```

### Updated Layout (After)
```
┌─────────────────────────────────────┐
│ Item Details                   Edit │
├─────────────────────────────────────┤
│ Item Name      │ Room              │
│ Steamer        │ Kitchen           │
├─────────────────────────────────────┤
│ Item Type      │ Tags              │
│ Kitchen        │ appliance, ...    │
├─────────────────────────────────────┤
│ QR Code Label: Steamer             │
└─────────────────────────────────────┘
```

---

## References

- **Source Request:** docs/gen_requests.md - REQ-182
- **Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
- **Related Component:** src/components/ItemCapture/components/steps/MetadataStep.tsx
- **Type Definitions:** src/components/ItemCapture/ItemCapture.types.ts
- **Data Model Types:** src/types/index.ts (Item, ItemArticle interfaces)
