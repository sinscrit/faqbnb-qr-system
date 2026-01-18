# REQ-173: Mobile Responsiveness and Touch Interaction Support - Implementation Overview

**Generated:** 2026-01-09 21:15:00 UTC
**Last Modified:** 2026-01-09 21:15:00 UTC
**Request ID:** REQ-173
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 6 - Integration & Polish
**Task ID:** 6.2

---

## Summary

This implementation ensures the application provides an optimal mobile experience with proper responsive layouts, appropriately sized touch targets (minimum 48px), and fully functional touch interactions including drag-to-reorder capabilities. Testing will verify all functionality works correctly at viewport widths as small as 320px.

---

## Technical Context

### Current Architecture
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Styling:** Tailwind CSS v4 with responsive breakpoints (`sm:`, `md:`, `lg:`)
- **Drag-and-Drop:** @dnd-kit with `PointerSensor`, `TouchSensor`, and `KeyboardSensor`
- **Touch Target Constant:** `TOUCH_TARGET_MIN_SIZE = 48` defined in constants.ts

### Existing Mobile Patterns
The codebase already implements mobile-first responsive patterns:

1. **Touch Target Sizing:**
   - `RoomCard.tsx`: Uses `min-h-[100px] p-4 sm:min-h-[120px] sm:p-6`
   - `ItemTypeCard.tsx`: Uses `min-h-[120px] p-4 sm:min-h-[140px] sm:p-6`
   - `ContentPieceCard.tsx`: Action buttons use `min-w-[44px] min-h-[44px]`
   - Drag handle: `min-w-[44px] min-h-[44px]` with `touch-none` for drag isolation

2. **Touch Optimization Classes:**
   - `touch-manipulation` - Removes 300ms tap delay
   - `select-none` - Prevents text selection during interactions
   - `touch-none` - Used on drag handles to prevent scroll conflicts

3. **Responsive Grids:**
   - `PreviewSaveStep.tsx`: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`
   - `FileUploadStep.tsx`: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`

4. **Touch Sensor Configuration:**
   - `TouchSensor` with `activationConstraint: { delay: 250, tolerance: 5 }`
   - Prevents accidental drag start while allowing intentional gestures

---

## Scope of Work

### Task 6.2.1: Small Viewport Testing (320px width)

**Files to Verify:**
| Component | File Path | Mobile Concern |
|-----------|-----------|----------------|
| ItemCreationWorkflow | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main layout container overflow |
| RoomSelectionStep | `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Room card grid at 320px |
| ItemTypeStep | `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Horizontal card layout |
| SpecificItemStep | `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Input and suggestion buttons |
| ContentTypeStep | `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Content option cards |
| PreviewSaveStep | `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Content grid and buttons |
| NextActionStep | `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Action cards layout |
| SessionSummaryStep | `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Item list cards |
| WorkflowHeader | `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Navigation and progress bar |

**Testing Criteria:**
- [ ] No horizontal scrolling on primary content at 320px width
- [ ] All text remains readable (no text overflow or clipping)
- [ ] Progress bar and navigation elements remain accessible
- [ ] Form inputs don't overflow their containers
- [ ] Spacing remains appropriate (not too cramped or wasteful)

---

### Task 6.2.2: Touch Target Verification (48px minimum)

**Interactive Elements to Audit:**

| Component | Element | Current Size | Notes |
|-----------|---------|--------------|-------|
| RoomCard | Card button | `min-h-[100px]` | Exceeds minimum |
| ItemTypeCard | Card button | `min-h-[120px]` | Exceeds minimum |
| ContentPieceCard | Remove button | `min-w-[44px] min-h-[44px]` | **Below 48px - needs update** |
| ContentPieceCard | Retake button | `min-w-[44px] min-h-[44px]` | **Below 48px - needs update** |
| ContentPieceCard | Drag handle | `min-w-[44px] min-h-[44px]` | **Below 48px - needs update** |
| WorkflowHeader | Back button | `p-2` (approx 36px) | **Needs verification** |
| WorkflowHeader | Close button | `p-2` (approx 36px) | **Needs verification** |
| SuggestionButton | Button | Inherits from Tailwind | **Needs audit** |
| ItemNameEditor | Input field | Standard height | **Needs audit** |
| FileUploadStep | Remove button | `p-2` (approx 36px) | **Below 48px - needs update** |

**Remediation Pattern:**
```tsx
// Before
className="p-2 ..."  // ~36px touch target

// After (ensure 48px minimum)
className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center ..."
```

---

### Task 6.2.3: Drag-to-Reorder Mobile Testing

**Current Implementation:**
- Location: `PreviewSaveStep.tsx` lines 174-184
- Uses @dnd-kit with configured sensors:
  ```typescript
  useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  })
  ```

**Testing Requirements:**
- [ ] Touch-and-hold initiates drag after 250ms delay
- [ ] Dragging content doesn't conflict with page scrolling
- [ ] Drag overlay (floating preview) displays correctly on mobile
- [ ] Drop animation provides visual feedback
- [ ] Screen reader announcements work during drag operations
- [ ] No "stuck" drag states when touch ends unexpectedly

**Potential Issues to Check:**
1. Touch vs scroll disambiguation on iOS Safari
2. Viewport scaling during drag on Android
3. Drag handle visibility on touch devices (currently hover-dependent via `group-hover`)

**Mobile Visibility Fix Pattern:**
```tsx
// Before (hidden on mobile until hover - problematic)
className="opacity-0 group-hover:opacity-100"

// After (visible on mobile, hover effect only on desktop)
className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
```

---

### Task 6.2.4: Content Preview Scaling

**Preview Components to Test:**
| Component | Content Type | Scaling Concern |
|-----------|--------------|-----------------|
| ContentPieceCard | Video | `object-cover` maintains aspect ratio |
| ContentPieceCard | Photo | `object-cover` maintains aspect ratio |
| ContentPieceCard | PDF | Icon + page count visibility |
| ContentPieceCard | Text | Text truncation at small sizes |
| ContentPieceCard | URL | Favicon and domain text |
| MediaThumbnail | All | Shared thumbnail component |
| UrlPreview | URLs | Preview card scaling |

**Testing Criteria:**
- [ ] Thumbnails remain square (`aspect-square` applied)
- [ ] Text overlays (duration, page count) remain legible
- [ ] Type badges don't overlap with content
- [ ] Content grid reflows correctly (2-col minimum on mobile)

---

## Implementation Tasks

### Phase 1: Audit & Testing (No Code Changes)

#### Task 1.1: Manual Testing at 320px Viewport
1. Open Chrome DevTools → Device Toolbar
2. Set custom viewport: 320 × 568 (iPhone SE)
3. Navigate through complete workflow
4. Document any overflow, clipping, or layout issues

#### Task 1.2: Touch Target Measurement
1. Use Chrome DevTools to inspect computed sizes
2. Document all interactive elements below 48px
3. Create list of elements requiring updates

#### Task 1.3: Drag-to-Reorder Mobile Testing
1. Test on physical iOS device (Safari)
2. Test on physical Android device (Chrome)
3. Document any scroll/drag conflicts

---

### Phase 2: Touch Target Remediation

#### Task 2.1: Update ContentPieceCard Touch Targets
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Changes:**
- Update drag handle button: `min-w-[48px] min-h-[48px]`
- Update remove button: `min-w-[48px] min-h-[48px]`
- Update retake button: `min-w-[48px] min-h-[48px]`

#### Task 2.2: Update WorkflowHeader Touch Targets
**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Changes:**
- Ensure back button meets 48px minimum
- Ensure close/exit button meets 48px minimum

#### Task 2.3: Update FileUploadStep Touch Targets
**File:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`
**Changes:**
- Update file card remove buttons to 48px minimum

---

### Phase 3: Mobile Visibility Fixes

#### Task 3.1: Always-Visible Drag Handles on Mobile
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Current:** Drag handle only visible on hover
**Fix:** Show drag handle always on mobile (touch devices don't hover)

#### Task 3.2: Always-Visible Action Buttons on Mobile
**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Current:** Action buttons in gradient overlay, hover-only
**Fix:** Always visible on mobile, hover-reveal on desktop

---

### Phase 4: Responsive Layout Fixes (If Needed)

#### Task 4.1: 320px Width Overflow Fixes
Based on Phase 1 audit, address any horizontal overflow issues:
- Add `max-w-full` or `overflow-hidden` where needed
- Adjust padding/margins for tighter viewports
- Update grid columns if needed (`grid-cols-1` fallback)

#### Task 4.2: Text Truncation Adjustments
If text overflows at small widths:
- Apply `truncate` class for single-line truncation
- Use `line-clamp-2` for multi-line text with ellipsis
- Add `title` attributes for full text on hover

---

## Authorized Files and Functions for Modification

### ItemCreationWorkflow Components
| File | Authorized Modifications |
|------|-------------------------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Touch target sizes, mobile visibility classes |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | Drag behavior props if needed |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Touch target sizes for nav buttons |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Touch optimization verification |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Touch optimization verification |
| `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Touch target verification |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Input touch target |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Grid responsive classes |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Card layout classes |
| `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Item list layout |

### ItemCapture Components
| File | Authorized Modifications |
|------|-------------------------|
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | File card touch targets |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Preview scaling |

### Utility Files
| File | Authorized Modifications |
|------|-------------------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Update `TOUCH_TARGET_MIN_SIZE` if needed |

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Chrome DevTools at 320px width - complete workflow navigation
- [ ] Chrome DevTools at 375px width (iPhone 12/13)
- [ ] Chrome DevTools at 390px width (iPhone 14)
- [ ] Physical iOS device - drag-to-reorder functionality
- [ ] Physical Android device - drag-to-reorder functionality
- [ ] Touch target accessibility audit via Lighthouse

### Automated Testing (Existing)
- Unit tests in `__tests__/` directories verify component rendering
- No new automated tests required for this task

### Acceptance Verification
Per REQ-173 Acceptance Criteria:
- [ ] All screens display correctly at 320px viewport width
- [ ] Interactive elements meet 48px touch target minimum
- [ ] Drag-to-reorder responds to touch without scroll conflicts
- [ ] Content previews scale proportionally and remain readable
- [ ] No horizontal scrolling required for primary content
- [ ] Touch interactions feel responsive with visual feedback
- [ ] Forms display appropriate mobile keyboard types

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Touch target size | 48px minimum | WCAG 2.1 AAA Target Size; aligns with existing constant |
| Mobile visibility pattern | `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` | Shows on mobile (no hover), hides until hover on desktop |
| Drag activation delay | Keep 250ms | Current value works well for touch vs scroll disambiguation |
| Grid minimum columns | 2 columns at 320px | Maintains visual hierarchy while fitting narrow viewports |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari drag behavior differences | Medium | Medium | Test on physical device; use @dnd-kit documented workarounds |
| Touch target increases affect visual design | Low | Low | Use padding not size increase; maintain visual compactness |
| Existing tests may break | Low | Low | Tests use semantic queries not pixel-specific selectors |
| Performance on low-end mobile | Low | Medium | Avoid heavy DOM during drag; use CSS transforms |

---

## Dependencies

- No new dependencies required
- Relies on existing @dnd-kit configuration
- Existing Tailwind responsive utilities sufficient

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Phase 1: Audit & Testing | 2-3 hours | High |
| Phase 2: Touch Target Remediation | 1-2 hours | High |
| Phase 3: Mobile Visibility Fixes | 1 hour | High |
| Phase 4: Responsive Layout Fixes | 0-2 hours | Medium (depends on audit) |
| **Total** | **4-8 hours** | Medium-High |

---

## References

- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 6, Task 6.2
- Request: `/docs/gen_requests.md` - REQ-173
- WCAG 2.1 AAA Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- @dnd-kit Touch Sensor: https://docs.dndkit.com/api-documentation/sensors/touch

---

## Appendix A: Tailwind Responsive Breakpoints

| Prefix | Min Width | Use Case |
|--------|-----------|----------|
| (none) | 0px | Mobile-first base styles |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

---

## Appendix B: Touch Target Sizing Reference

```css
/* 48px minimum touch target pattern */
.touch-target-48 {
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Alternative: Use padding to achieve 48px total */
.touch-target-padded {
  padding: 12px; /* 12px × 2 + 24px icon = 48px */
}
```

---

## Appendix C: Mobile Visibility Pattern

```tsx
// Pattern for mobile-first interactive element visibility
// Shows on mobile (where hover doesn't exist), hover-reveals on desktop

<button
  className={cn(
    // Base positioning
    'absolute top-2 right-2',
    // Touch target minimum
    'min-w-[48px] min-h-[48px]',
    'flex items-center justify-center',
    // Mobile: always visible, Desktop: hover-reveals
    'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
    // Ensure visibility on focus for keyboard users
    'focus:opacity-100',
    // Transitions
    'transition-opacity duration-200',
  )}
>
  <Icon className="w-5 h-5" />
</button>
```
