# REQ-106: Preview and Save Step Implementation Overview

**Created:** 2026-01-05 18:45:00 UTC
**Last Modified:** 2026-01-05 18:45:00 UTC
**Request Reference:** REQ-106 from docs/gen_requests.md
**Implementation Plan:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 4, Task 4.2)

---

## 1. Summary

This document provides the implementation breakdown for the Preview and Save Step (Step 7) of the Item Creation Workflow. This step allows users to preview their created content, edit the item name, replace content if needed, and save the completed item with success confirmation feedback.

---

## 2. Context from Implementation Plan

### Phase Context
- **Phase:** 4 - Content Creation & Preview (Steps 6-7)
- **Task ID:** 4.2
- **Predecessor:** Task 4.1 (ContentCreationStep) - Must be complete
- **Successor:** Phase 5 (NextActionStep) - Will use saved item data

### Component Location in Architecture
```
ItemCreationWorkflow/
├── components/
│   ├── steps/
│   │   ├── ContentCreationStep.tsx   # Step 6 - Predecessor
│   │   ├── PreviewSaveStep.tsx       # Step 7 - THIS COMPONENT
│   │   └── NextActionStep.tsx        # Step 8 - Successor
│   └── shared/
│       ├── ContentPieceCard.tsx      # New shared component
│       └── ItemNameEditor.tsx        # Existing - reuse
```

### Workflow State at This Step
When PreviewSaveStep renders, the workflow state contains:
```typescript
{
  currentStep: 'preview-save',
  currentItem: {
    room: RoomType,           // e.g., 'kitchen'
    itemType: ItemType,       // e.g., 'appliance'
    specificItem: string,     // e.g., 'Dishwasher'
    itemName: string,         // e.g., 'Kitchen - Dishwasher'
    contentSource: 'existing' | 'create-new',
    contentType: ContentType, // e.g., 'video'
    content: ContentPiece[],  // Array of captured content
  }
}
```

---

## 3. Technical Requirements

### 3.1 PreviewSaveStep Component

**Purpose:** Display content preview with editing capabilities and save functionality

**Props Interface:**
```typescript
export interface PreviewSaveStepProps {
  /** Current item state from workflow */
  currentItem: CurrentItemState;

  /** Callback when item name changes */
  onUpdateItemName: (name: string) => void;

  /** Callback to remove a content piece */
  onRemoveContent: (contentId: string) => void;

  /** Callback to reorder content pieces */
  onReorderContent: (fromIndex: number, toIndex: number) => void;

  /** Callback to retake/replace content - navigates back to content creation */
  onRetake: () => void;

  /** Callback when save is triggered */
  onSave: () => Promise<{ id: string; qrCodeUrl: string }>;

  /** Callback when user cancels (goes back) */
  onCancel: () => void;

  /** Whether save operation is in progress */
  isSaving?: boolean;

  /** Optional CSS class */
  className?: string;
}
```

**State Management:**
- Local state for editing mode (`isEditingName: boolean`)
- Local state for success confirmation (`showSuccess: boolean`)
- Local state for saved item result (`savedResult: { id: string; qrCodeUrl: string } | null`)
- Receive `isSaving` as prop from parent (workflow manages submission state)

### 3.2 ContentPieceCard Component

**Purpose:** Display individual content piece with type-appropriate preview

**Props Interface:**
```typescript
export interface ContentPieceCardProps {
  /** Content piece data */
  content: ContentPiece;

  /** Callback when remove is clicked */
  onRemove?: (id: string) => void;

  /** Callback when retake/replace is clicked */
  onRetake?: (id: string) => void;

  /** Whether actions are disabled (during save) */
  disabled?: boolean;

  /** Optional CSS class */
  className?: string;
}
```

**Content Type Display Requirements:**

| Content Type | Preview Display | Badge Color | Icon |
|--------------|-----------------|-------------|------|
| video | Video thumbnail + duration overlay | Purple (`bg-purple-100 text-purple-700`) | `Video` |
| photo | Image thumbnail | Blue (`bg-blue-100 text-blue-700`) | `Image` |
| pdf | PDF icon + page count | Amber (`bg-amber-100 text-amber-700`) | `FileText` |
| text | Text preview (truncated markdown) | Green (`bg-green-100 text-green-700`) | `Type` |
| url | URL card with title, domain, favicon | Indigo (`bg-indigo-100 text-indigo-700`) | `Link` |

---

## 4. Dependencies

### Internal Dependencies
| Component/Hook | Location | Purpose |
|----------------|----------|---------|
| `ItemNameEditor` | `components/shared/ItemNameEditor.tsx` | Inline name editing with character count |
| `UrlPreview` | `@/components/ItemCapture/components/shared/UrlPreview.tsx` | URL metadata display |
| `useQRCodeGeneration` | `@/hooks/useQRCodeGeneration.ts` | QR code generation on save |
| `generateQRCodeWithCache` | `@/lib/qrcode-utils.ts` | Cached QR generation |
| Workflow State Types | `../../ItemCreationWorkflow.types.ts` | ContentPiece, ContentType, etc. |

### External Dependencies (Already Installed)
| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | Existing | Icons (Video, Image, FileText, Link, Check, RotateCcw, Trash2, Pencil) |
| `@/lib/utils` (cn) | Existing | Class name merging |
| `react-markdown` | Existing | Text content preview (optional) |

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]           Preview Your Item                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Item Name                                           │   │
│  │  ┌─────────────────────────────────────┬─────────┐  │   │
│  │  │ Kitchen - Dishwasher                │ [Edit]  │  │   │
│  │  └─────────────────────────────────────┴─────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Content                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │  │ [Video Badge]   │  │ [Photo Badge]   │  ...      │   │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │           │   │
│  │  │ │  Thumbnail  │ │  │ │  Thumbnail  │ │           │   │
│  │  │ │   + 0:45    │ │  │ │             │ │           │   │
│  │  │ └─────────────┘ │  │ └─────────────┘ │           │   │
│  │  │ [Retake][Remove]│  │ [Retake][Remove]│           │   │
│  │  └─────────────────┘  └─────────────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           [Retake / Replace All]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               [✓ Save Item]                          │   │
│  │           (Primary CTA - Full Width)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Success Confirmation State

After successful save, the component displays:
```
┌─────────────────────────────────────────────────────────────┐
│                      ✓ Item Saved!                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌───────────────────────┐                         │
│           │      [QR Code]        │                         │
│           │                       │                         │
│           │    Kitchen -          │                         │
│           │    Dishwasher         │                         │
│           └───────────────────────┘                         │
│                                                             │
│              Your item has been saved                       │
│           and is ready for your guests!                     │
│                                                             │
│         ┌───────────────────────────────┐                   │
│         │        [Continue →]            │                   │
│         └───────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Accessibility Requirements

- All interactive elements must have `aria-label` attributes
- Focus management: focus first editable element on mount
- Keyboard navigation: Tab through all interactive elements
- Screen reader announcements for save success/failure
- Touch targets minimum 48x48px (mobile)
- Reduced motion support for success animations

### 5.4 Design System Tokens (Airbnb)

```css
/* Colors */
--color-text-primary: #222222;
--color-text-secondary: #717171;
--color-brand-primary: #FF385C;    /* Save button */
--color-success: #00A699;          /* Success state */
--color-error: #FF5A5F;            /* Error state */

/* Spacing */
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

/* Border Radius */
--radius-md: 8px;
--radius-lg: 12px;
```

---

## 6. Implementation Tasks

### Task 1: Create ContentPieceCard Component
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Estimate:** 1 story point

**Subtasks:**
- [ ] Create component file with TypeScript interface
- [ ] Implement content type detection and badge rendering
- [ ] Implement video thumbnail display with duration overlay
- [ ] Implement photo thumbnail display
- [ ] Implement PDF preview with page count
- [ ] Implement text preview with truncation
- [ ] Implement URL preview card (reuse UrlPreview if suitable)
- [ ] Add retake and remove action buttons
- [ ] Apply Airbnb design tokens for styling
- [ ] Add accessibility attributes (aria-label, role)

### Task 2: Create PreviewSaveStep Component
**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Estimate:** 2 story points

**Subtasks:**
- [ ] Create component file with TypeScript interface
- [ ] Implement item name display section with ItemNameEditor integration
- [ ] Implement content grid using ContentPieceCard components
- [ ] Implement "Retake/Replace All" button with navigation
- [ ] Implement "Save Item" primary CTA button
- [ ] Add loading state handling during save
- [ ] Add error state handling with retry option
- [ ] Implement success confirmation overlay
- [ ] Display generated QR code after save
- [ ] Implement "Continue" button to advance workflow
- [ ] Add accessibility attributes and focus management
- [ ] Apply responsive layout (mobile/tablet/desktop)

### Task 3: Update Barrel Exports
**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Export PreviewSaveStep component
- [ ] Export PreviewSaveStepProps type

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Export ContentPieceCard component
- [ ] Export ContentPieceCardProps type

### Task 4: Integrate with Workflow State
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimate:** 0.5 story points

**Subtasks:**
- [ ] Add case for 'preview-save' step in step renderer
- [ ] Wire up onUpdateItemName to dispatch SET_ITEM_NAME action
- [ ] Wire up onRemoveContent to dispatch REMOVE_CONTENT_PIECE action
- [ ] Wire up onReorderContent to dispatch REORDER_CONTENT action
- [ ] Wire up onRetake to dispatch GO_TO_STEP('content-creation') action
- [ ] Wire up onSave to call parent's onSaveItem callback
- [ ] Wire up onCancel to dispatch PREV_STEP action
- [ ] Handle save success by dispatching SAVE_ITEM and GO_TO_STEP('next-action')

### Task 5: Add Missing Workflow Actions (if needed)
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimate:** 0.5 story points

**Subtasks:**
- [ ] Verify SET_ITEM_NAME action exists (add if missing)
- [ ] Verify REMOVE_CONTENT_PIECE action exists (add if missing)
- [ ] Verify REORDER_CONTENT action exists (add if missing)
- [ ] Update STEP_TRANSITIONS to allow preview-save → content-creation (for retake)
- [ ] Update STEP_TRANSITIONS to allow preview-save → next-action (after save)

---

## 7. Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content piece display card |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Main preview and save step |

### Existing Files to Modify
| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add PreviewSaveStep export |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add ContentPieceCard export |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add step rendering case |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Add/verify actions and step transitions |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add PreviewSaveStepProps if not colocated |

### Files to Reference (Read-Only)
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Content preview patterns |
| `src/components/ItemCapture/components/shared/UrlPreview.tsx` | URL preview component |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Name editing pattern |
| `src/hooks/useQRCodeGeneration.ts` | QR generation hook usage |
| `src/lib/qrcode-utils.ts` | QR code generation utilities |

---

## 8. Integration Points

### 8.1 Workflow State Integration

**Actions to Dispatch:**
```typescript
// Update item name
dispatch({ type: 'SET_ITEM_NAME', payload: newName });

// Remove content piece
dispatch({ type: 'REMOVE_CONTENT_PIECE', payload: contentId });

// Reorder content
dispatch({ type: 'REORDER_CONTENT', payload: { fromIndex, toIndex } });

// Go back to content creation (retake)
dispatch({ type: 'GO_TO_STEP', payload: 'content-creation' });

// Save item and proceed
dispatch({ type: 'SAVE_ITEM', payload: savedItem });
dispatch({ type: 'GO_TO_STEP', payload: 'next-action' });
```

### 8.2 Parent Component Callback

The save operation should call the parent's `onSaveItem` callback:
```typescript
// In ItemCreationWorkflow.tsx
const handleSave = async () => {
  setIsSaving(true);
  try {
    const sessionItem: SessionItem = {
      id: generateId(),
      name: state.currentItem.itemName,
      room: state.currentItem.room,
      itemType: state.currentItem.itemType,
      content: state.currentItem.content,
      createdAt: new Date(),
    };

    const result = await onSaveItem(sessionItem);
    // result contains { id, qrCodeUrl }

    dispatch({ type: 'SAVE_ITEM', payload: { ...sessionItem, qrCodeUrl: result.qrCodeUrl } });
    return result;
  } finally {
    setIsSaving(false);
  }
};
```

### 8.3 QR Code Generation

After successful save, display the generated QR code:
```typescript
// QR code is returned from onSaveItem callback
// Display using img tag with data URL
<img
  src={savedResult.qrCodeUrl}
  alt={`QR code for ${currentItem.itemName}`}
  className="w-32 h-32"
/>
```

---

## 9. Acceptance Criteria

Based on REQ-106 requirements:

- [ ] **AC1:** Preview step displays after content creation with appropriate content visualization for all supported content types (video, photo, PDF, text, URL)
- [ ] **AC2:** Item name is shown prominently with an edit option that allows inline modification
- [ ] **AC3:** Retake or replace option allows users to return to content creation without losing other workflow data
- [ ] **AC4:** Save button is clearly visible and triggers item persistence to the database
- [ ] **AC5:** Success confirmation is displayed immediately after successful save
- [ ] **AC6:** Multi-content items display all content pieces through a dedicated card component
- [ ] **AC7:** Content preview accurately represents how the item will appear to end users
- [ ] **AC8:** All workflow state (room, item type, specific item, content) is preserved during preview

---

## 10. Testing Considerations

### Unit Tests
- ContentPieceCard renders correctly for each content type
- PreviewSaveStep displays all content pieces
- Item name editing updates state correctly
- Remove content piece removes from state
- Save button triggers save callback
- Success state displays after save completes
- Error state displays on save failure

### Integration Tests
- Complete flow from content creation through preview to save
- QR code generation after save
- Navigation back to content creation (retake)
- Workflow state preservation during operations

### Accessibility Tests
- Keyboard navigation through all elements
- Screen reader announces success/error states
- Focus management on step entry
- Touch target sizes on mobile

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large video thumbnails cause performance issues | Medium | Medium | Use lazy loading, generate thumbnails on content creation |
| URL preview fails to load | Medium | Low | Graceful fallback to URL text display |
| Save operation fails | Low | High | Clear error message with retry option |
| Multi-content reordering is confusing | Low | Medium | Clear drag handles, visual feedback |

---

## 12. Open Questions

1. **Thumbnail Generation:** Should video/photo thumbnails be generated during ContentCreationStep or on-demand in PreviewSaveStep?
   - **Recommendation:** Generate during ContentCreationStep to avoid delay in preview

2. **Edit Name Length:** What is the maximum character limit for item names?
   - **Recommendation:** Use existing ItemNameEditor limit (100 characters)

3. **Multi-Content Reordering:** Should users be able to reorder content pieces in preview?
   - **From Plan:** Yes, using @dnd-kit (Phase 5, Task 5.2)
   - **For V1:** Can defer reordering to Phase 5, focus on display only

---

*Implementation Overview generated on 2026-01-05 for REQ-106: Preview and Save Step*
