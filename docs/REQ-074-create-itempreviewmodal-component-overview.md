# REQ-074: Create ItemPreviewModal Component - Technical Overview

**Document Created:** 2026-01-03
**Last Modified:** 2026-01-03
**Request Reference:** REQ-074 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 4 - Item Preview/Detail
**Task ID:** 4.1
**Estimated Effort:** 1 story point

---

## Summary

Create the `ItemPreviewModal` component as the container for displaying item details in a responsive modal/drawer format. This component serves as the foundation for Phase 4 (Item Preview/Detail) and will host the MediaGallery and InstructionsViewer components in subsequent tasks.

The modal displays as a centered overlay on desktop/tablet screens and transforms into a mobile-friendly slide-up drawer on smaller viewports. It implements proper keyboard navigation, focus trapping, and accessibility features.

---

## Technical Context

### Existing Stack
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.5.9 | With Turbopack |
| React | 19.1.0 | |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | 0.525.0 | Icon library |
| Radix UI Dialog | 1.1.14 | **Already installed** - accessible dialog primitive |

### Relevant Existing Patterns

| Pattern | Source File | Notes |
|---------|-------------|-------|
| Simple modal | `src/components/ConfirmationModal.tsx` | Fixed overlay with centered card, manual implementation |
| State management | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based state |
| Utility function | `src/lib/utils.ts` | `cn()` for class merging |
| Type definitions | `src/components/ItemCapture/ItemCapture.types.ts` | Comprehensive interface patterns |

### Target Architecture (from Implementation Plan)

```
src/components/ItemManager/
├── components/
│   ├── ItemPreview/
│   │   ├── ItemPreviewModal.tsx    <-- THIS TASK
│   │   ├── MediaGallery.tsx        (Task 4.2)
│   │   └── InstructionsViewer.tsx  (Task 4.5)
```

---

## Dependencies

### Phase Dependencies
- **Requires:** Phase 1 complete (directory structure, types, basic state management)
- **Parallel with:** Phases 2 and 3
- **Blocks:** Tasks 4.2-4.6 (MediaGallery, video/photo viewer, InstructionsViewer, preview actions)

### Task Dependencies
```
4.1 ItemPreviewModal Component  <-- THIS TASK
         │
         ▼
4.2 MediaGallery Component
         │
    ┌────┴────┐
    ▼         ▼
  4.3       4.4
Video     Photo/PDF
Player    Viewer
    │         │
    └────┬────┘
         ▼
4.5 InstructionsViewer
         │
         ▼
4.6 Preview Actions
```

---

## Implementation Requirements

### Core Functionality

1. **Modal Container**
   - Renders as a full-screen overlay with semi-transparent backdrop
   - Content centered on desktop/tablet (viewport ≥768px)
   - Content as slide-up drawer on mobile (viewport <768px)

2. **Close Behavior**
   - Close button in top-right corner
   - Click/tap on overlay backdrop closes modal
   - Escape key closes modal
   - Body scroll lock when modal is open

3. **Animation**
   - Smooth fade-in/fade-out for overlay
   - Slide-up animation for mobile drawer
   - Scale/fade animation for desktop modal
   - Transitions complete within 300ms

4. **Accessibility**
   - Focus trapped within modal when open
   - Focus returns to trigger element on close
   - ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
   - Screen reader announcements for open/close

### Props Interface

```typescript
// src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx

interface ItemPreviewModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;

  /** Callback when modal should close */
  onClose: () => void;

  /** The item being previewed (null when closed) */
  item: ItemRecord | null;

  /** Optional title override (defaults to item.title) */
  title?: string;

  /** Content to render inside the modal */
  children: React.ReactNode;

  /** Optional CSS class for customization */
  className?: string;

  /** Optional CSS class for content container */
  contentClassName?: string;
}
```

### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≥768px (md+) | Centered modal overlay with max-width, rounded corners |
| <768px | Full-width drawer sliding up from bottom, rounded top corners |

### Visual Specifications

**Desktop Modal (≥768px)**
- Backdrop: `bg-black/50`
- Content: `bg-white`, `rounded-lg`, max-width `640px` (adjustable), max-height `90vh`
- Close button: `X` icon, top-right, 48x48px touch target
- Padding: `p-6` for content area

**Mobile Drawer (<768px)**
- Backdrop: `bg-black/50`
- Content: `bg-white`, `rounded-t-xl`, full-width, max-height `85vh`
- Drag handle indicator at top (optional visual affordance)
- Close button: `X` icon, top-right, 48x48px touch target
- Padding: `p-4` for content area

---

## Implementation Approach

### Option 1: Use Radix UI Dialog (Recommended)

Leverage the existing `@radix-ui/react-dialog` dependency for accessibility and focus management out of the box.

**Pros:**
- Accessibility built-in (focus trap, ARIA, keyboard navigation)
- Well-tested, production-ready
- Consistent with existing codebase dependencies

**Cons:**
- Mobile drawer behavior requires additional styling/logic
- Less control over animations

**Implementation Pattern:**
```tsx
import * as Dialog from '@radix-ui/react-dialog';

export function ItemPreviewModal({ isOpen, onClose, item, children }: ItemPreviewModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="..." />
        <Dialog.Content className="...">
          <Dialog.Title>{item?.title}</Dialog.Title>
          <Dialog.Close />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Option 2: Custom Implementation

Build from scratch following the existing `ConfirmationModal.tsx` pattern.

**Pros:**
- Full control over behavior and animations
- No additional learning curve

**Cons:**
- Must implement accessibility manually (focus trap, ARIA)
- More code to maintain
- Risk of accessibility gaps

**Recommendation:** Use Option 1 (Radix UI Dialog) as the foundation, with custom styling for responsive drawer behavior.

---

## Authorized Files and Functions for Modification

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Main modal component |
| `src/components/ItemManager/components/ItemPreview/index.ts` | Barrel export for ItemPreview directory |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemPreviewModalProps` interface if not using inline |
| `src/components/ItemManager/index.ts` | Re-export ItemPreviewModal if needed for external use |

### Functions/Components to Create

| Name | Location | Purpose |
|------|----------|---------|
| `ItemPreviewModal` | `ItemPreview/ItemPreviewModal.tsx` | Main component |
| `useMediaQuery` | Consider creating in `hooks/` | Detect viewport for responsive behavior (optional - can use CSS) |

---

## Acceptance Criteria

From REQ-074:

- [ ] Preview interface opens immediately after successful item capture
- [ ] On desktop/tablet (viewport width ≥768px), content appears as a centered modal overlay
- [ ] On mobile (viewport width <768px), content appears as a drawer sliding up from bottom
- [ ] Close button is visible and accessible in all viewport sizes
- [ ] Clicking/tapping the overlay background closes the preview
- [ ] Pressing the Escape key closes the preview
- [ ] Opening the preview prevents scrolling of content behind it
- [ ] Closing the preview restores normal scrolling behavior
- [ ] Transition animations are smooth and complete within 300ms
- [ ] Keyboard focus is trapped within the modal when open
- [ ] Screen readers announce the modal opening and closing appropriately

### Additional Technical Criteria

- [ ] Component uses TypeScript with strict types
- [ ] Component follows `'use client'` directive pattern
- [ ] Styling uses Tailwind CSS with `cn()` utility
- [ ] Component renders `null` when `isOpen` is false
- [ ] Focus returns to triggering element on close
- [ ] No console errors or warnings during use

---

## Testing Approach

### Manual Testing
- [ ] Open/close modal on desktop (Chrome, Firefox, Safari)
- [ ] Open/close modal on mobile (iOS Safari, Chrome Android)
- [ ] Verify Escape key closes modal
- [ ] Verify overlay click closes modal
- [ ] Verify close button works
- [ ] Verify scroll lock on body
- [ ] Verify focus trap (Tab/Shift+Tab)
- [ ] Test with VoiceOver/NVDA screen reader

### Test Harness Integration
Add to `/src/app/test/item-manager/page.tsx`:
```tsx
<ItemPreviewModal
  isOpen={previewOpen}
  onClose={() => setPreviewOpen(false)}
  item={selectedItem}
>
  <p>Preview content placeholder</p>
</ItemPreviewModal>
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mobile drawer animation jank | Medium | Low | Use CSS transforms, test on real devices |
| Focus trap issues on iOS | Medium | Medium | Test extensively on iOS Safari, consider Radix UI |
| Body scroll leak on iOS | High | Medium | Use `overflow: hidden` on both html and body, consider touch-action |

---

## References

- [Radix UI Dialog Documentation](https://www.radix-ui.com/docs/primitives/components/dialog)
- [WAI-ARIA Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/)
- [Existing ConfirmationModal](/src/components/ConfirmationModal.tsx)
- [Implementation Plan Phase 4](/docs/prd/item-capture-manager-implementation-plan.md#phase-4-item-previewdetail-estimated-3-4-days)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
