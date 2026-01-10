# REQ-174: Accessibility Compliance Verification for Upload Flow - Technical Overview

**Created**: 2026-01-09 23:45:00 UTC
**Last Modified**: 2026-01-09 23:45:00 UTC
**Request Reference**: `docs/gen_requests.md` - REQ-174
**Implementation Plan**: `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 6, Task 6.3
**Type**: ENHANCEMENT (Accessibility Audit)
**Size**: M
**Status**: Pending Implementation

---

## Executive Summary

This task performs a comprehensive accessibility audit of all new and modified components in the Item Creation Workflow to ensure WCAG 2.1 AA compliance. The audit focuses on four key areas:

1. **ARIA Labels**: Verify all interactive components have appropriate semantic labels
2. **Keyboard Navigation**: Test complete workflow traversal using keyboard-only input
3. **Screen Reader Announcements**: Validate meaningful context announcements at transitions
4. **Focus Management**: Ensure proper focus handling on step transitions

---

## Request Context

### From gen_requests.md (REQ-174)

> **Summary**: All components and interactions within the upload flow must meet accessibility standards to ensure equal access for users with disabilities.

### Acceptance Criteria (from source)

- [ ] All interactive components have appropriate ARIA labels that describe their purpose
- [ ] Complete upload workflow can be navigated using only keyboard (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader testing confirms meaningful announcements at step transitions and state changes
- [ ] Focus management correctly moves to relevant elements when transitioning between steps
- [ ] All form inputs, buttons, and custom controls are keyboard accessible
- [ ] Focus visible indicators meet contrast requirements and are never hidden

---

## Technical Context

### Existing Accessibility Infrastructure

The codebase has robust accessibility utilities in `/src/components/ItemCreationWorkflow/utils/accessibility.ts`:

| Utility | Purpose | Usage |
|---------|---------|-------|
| `useReducedMotion()` | Detect user's reduced motion preference | Animation control |
| `useFocusTrap()` | Trap focus within modals/dialogs | Dialogs, panels |
| `useAnnounce()` | Screen reader live region announcements | Step transitions |
| `useFocusOnMount()` | Focus element when condition is met | Step activation |
| `createKeyboardNavigator()` | Grid/list keyboard navigation | Selection steps |
| `getStepAnnouncement()` | Generate step context strings | Navigation feedback |
| `STEP_NAMES` | Human-readable step names | Announcements |

### Components to Audit

Based on Plan-094, the following components require accessibility verification:

#### New Components (created in earlier phases)
| Component | Type | Primary A11y Concerns |
|-----------|------|----------------------|
| `PurposeStep.tsx` | NEW | ARIA labels, keyboard grid navigation, auto-advance |
| `ContentPreview.tsx` | NEW | Alt text for media, loading states, error states |
| `titleGenerator.ts` | NEW | N/A (utility - no UI) |

#### Modified Components
| Component | Change | A11y Verification Needs |
|-----------|--------|------------------------|
| `ContentTypeStep.tsx` | Label updates | aria-label accuracy |
| `PreviewSaveStep.tsx` | Major redesign | Focus order, drag-drop a11y, grid navigation |
| `NextActionStep.tsx` | Simplified | Card navigation, confirmation dialog a11y |
| `TextEditorStep.tsx` | Nav removal | Keyboard focus, escape handling |
| `FileUploadStep.tsx` | Nav removal | Drop zone a11y, keyboard activation |
| `VideoCaptureStep.tsx` | Nav removal | Media controls a11y |
| `PhotoCaptureStep.tsx` | Nav removal | Capture button a11y |
| `UrlInputStep.tsx` | Nav removal | Input field a11y |

#### Shared Components
| Component | A11y Pattern |
|-----------|--------------|
| `RoomCard.tsx` | `role="radio"`, roving tabindex |
| `ItemTypeCard.tsx` | `role="radio"`, roving tabindex |
| `ConfirmExitDialog.tsx` | Focus trap, `role="alertdialog"` |
| `SortableContentPieceCard.tsx` | Drag-drop a11y, keyboard reorder |
| `WorkflowHeader.tsx` | Navigation landmarks |

---

## Implementation Approach

### Task 6.3.1: Verify All New Components Have ARIA Labels

**Scope**: All components listed above

**Verification Checklist**:

1. **PurposeStep.tsx** (NEW):
   - [ ] Grid container has `role="radiogroup"` and `aria-label`
   - [ ] Each purpose card has `role="radio"` and `aria-checked` state
   - [ ] Cards have descriptive `aria-label` combining title and description
   - [ ] Helper text for keyboard navigation uses `aria-describedby`

2. **ContentPreview.tsx** (NEW):
   - [ ] Images have meaningful `alt` text (not "image" or "photo")
   - [ ] Video previews have `aria-label` describing content type
   - [ ] PDF previews announce page count in accessible manner
   - [ ] Loading states have `aria-busy="true"` and status text
   - [ ] Error states are announced via live region

3. **PreviewSaveStep.tsx** (MODIFIED):
   - [ ] Item details section has proper heading hierarchy
   - [ ] Editable title field has `aria-label` and edit affordance announcement
   - [ ] Content grid has `role="list"` with item roles
   - [ ] "Add More" link has descriptive `aria-label`
   - [ ] Remove buttons have `aria-label` identifying which content

4. **NextActionStep.tsx** (MODIFIED):
   - [ ] Action cards container has `role="group"` with `aria-label`
   - [ ] Each card's `aria-label` combines title and description
   - [ ] Cancel confirmation dialog follows `alertdialog` pattern

5. **Content Input Steps** (TextEditor, FileUpload, VideoCapture, PhotoCapture, UrlInput):
   - [ ] Primary action buttons have descriptive labels
   - [ ] Cancel/Back buttons are keyboard accessible
   - [ ] Form inputs have associated labels
   - [ ] Error messages use `aria-describedby` pattern

**Testing Method**:
- Static code review for ARIA attributes
- Chrome DevTools Accessibility tree inspection
- axe-core automated scan

---

### Task 6.3.2: Test Keyboard Navigation Through Entire Flow

**Keyboard Navigation Requirements**:

| Key | Expected Behavior |
|-----|-------------------|
| Tab | Move to next focusable element in DOM order |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate buttons, select options |
| Space | Activate buttons, toggle checkboxes, select options |
| Arrow Keys | Navigate within grids/lists (roving tabindex) |
| Escape | Close dialogs, cancel operations |
| Home | Jump to first item in list/grid |
| End | Jump to last item in list/grid |

**Full Flow Test Scenarios**:

1. **Happy Path Navigation**:
   ```
   Tab to Start → Room Selection (Arrow keys) →
   Tab to Continue → Item Type (Arrow keys) →
   Tab to Continue → Specific Item (text input) →
   Tab to Continue → Purpose Selection (Arrow keys) →
   Tab to Continue → Content Type (Arrow keys) →
   Tab to Continue → Content Creation →
   Tab to Save → Preview/Save →
   Tab to Action Cards → Next Action
   ```

2. **Exit Flow Test**:
   - Tab to Exit button
   - Enter to open dialog
   - Tab within dialog (trapped)
   - Enter to confirm / Escape to cancel

3. **Grid Navigation Test** (Purpose, Room, Item Type steps):
   - Focus first grid item
   - ArrowRight → next item
   - ArrowDown → next row
   - ArrowLeft → previous item
   - ArrowUp → previous row
   - Home → first item
   - End → last item
   - Tab → exit grid to next element

4. **Content Reorder Test** (PreviewSaveStep):
   - Focus content item
   - Keyboard command to enter reorder mode
   - Arrow keys to move item position
   - Enter to confirm new position
   - Escape to cancel reorder

**Testing Tools**:
- Manual keyboard testing in Chrome, Firefox, Safari
- Keyboard Accessibility Checker extension
- Unit tests with keyboard event simulation

---

### Task 6.3.3: Test Screen Reader Announcements

**Screen Reader Test Matrix**:

| Browser | Screen Reader | Priority |
|---------|--------------|----------|
| Chrome | NVDA (Windows) | High |
| Safari | VoiceOver (macOS) | High |
| Chrome | ChromeVox | Medium |
| Firefox | NVDA | Medium |

**Announcement Verification Points**:

1. **Step Transitions**:
   - On step change: "Step X of Y: [Step Name]"
   - Example: "Step 4 of 9: Select your purpose"
   - Uses `useAnnounce()` hook with `aria-live="polite"`

2. **Selection Confirmations**:
   - Room selection: "Kitchen selected"
   - Item type: "Appliance selected"
   - Purpose: "How to Clean selected"

3. **Content Actions**:
   - Upload complete: "Video uploaded successfully"
   - Upload error: "Upload failed: [reason]"
   - Content removed: "[Content name] removed"
   - Content reordered: "[Content name] moved to position X"

4. **Dialog Announcements**:
   - Dialog open: Title + description announced
   - Focus on safe action (Cancel button)
   - Escape key behavior announced

5. **Form Validation**:
   - Error: Associated with input via `aria-describedby`
   - Success: Live region announcement

**Testing Protocol**:
```
1. Enable screen reader
2. Navigate to workflow start page
3. Begin at Step 1 (Room Selection)
4. Make selection - verify announcement
5. Proceed to Step 2 - verify step announcement
6. Continue through all steps
7. Test error scenarios
8. Test dialog interactions
9. Complete flow - verify summary announcements
```

---

### Task 6.3.4: Verify Focus Management on Step Transitions

**Focus Management Requirements**:

1. **Step Transition Focus**:
   - On step change, focus moves to step heading
   - Heading made focusable with `tabindex="-1"`
   - Focus ring visible but not intrusive

2. **Dialog Focus**:
   - Opening: Focus moves to first focusable or safe action
   - Closing: Focus returns to trigger element
   - Uses `useFocusTrap()` hook

3. **Content Addition/Removal**:
   - After adding content: Focus on newly added preview
   - After removing content: Focus on next content item or container

4. **Error State Focus**:
   - On validation error: Focus moves to first invalid field
   - Error message linked via `aria-describedby`

**Implementation Patterns to Verify**:

```typescript
// Step transition focus (in ItemCreationWorkflow.tsx)
useEffect(() => {
  if (previousStepRef.current !== state.currentStep) {
    const heading = mainContentRef.current?.querySelector('h2, h3, [role="heading"]');
    if (heading && heading instanceof HTMLElement) {
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1');
      }
      heading.focus();
    }
    previousStepRef.current = state.currentStep;
  }
}, [state.currentStep]);
```

**Testing Method**:
- Visual focus indicator inspection
- `document.activeElement` console logging during navigation
- Automated focus order testing with axe-core

---

## Authorized Files and Functions for Modification

### Files Requiring Accessibility Updates

| File Path | Modification Type | Specific Functions/Areas |
|-----------|-------------------|-------------------------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | AUDIT/FIX | `role`, `aria-*` attributes, keyboard handlers |
| `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | AUDIT/FIX | `alt` text, `aria-label`, loading states |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | AUDIT/FIX | Grid a11y, reorder a11y, edit a11y |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | AUDIT/FIX | Card navigation, dialog a11y |
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | AUDIT/FIX | Subcomponent a11y delegation |
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | AUDIT/FIX | Label accuracy |
| `src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | AUDIT/FIX | Drag-drop keyboard alternative |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | AUDIT | Focus management, announcements |
| `src/components/ItemCreationWorkflow/utils/accessibility.ts` | EXTEND IF NEEDED | Add utilities for new patterns |

### Test Files to Update

| File Path | Test Coverage |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx` | Add a11y assertions |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx` | Add a11y assertions |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Add a11y assertions |
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` | Full flow keyboard test |

---

## Accessibility Testing Tooling

### Automated Tools

1. **axe-core / @axe-core/react**:
   - Integrate into test suite
   - Run on each component render
   - Catch common violations

2. **jest-axe**:
   - Add `toHaveNoViolations()` assertions
   - Example:
     ```typescript
     const { container } = render(<PurposeStep {...props} />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
     ```

3. **eslint-plugin-jsx-a11y**:
   - Already in project (verify configuration)
   - Catches missing alt, role misuse, etc.

### Manual Testing Checklist

- [ ] Complete flow with keyboard only (no mouse)
- [ ] Complete flow with screen reader (VoiceOver)
- [ ] Test with browser zoom at 200%
- [ ] Test with forced colors mode (Windows)
- [ ] Test with prefers-reduced-motion enabled
- [ ] Verify color contrast on all text (4.5:1 ratio)
- [ ] Verify focus indicators visible in all states

---

## Dependencies

### Prerequisites
- Phase 1-5 components must be implemented
- PurposeStep component exists with basic functionality
- ContentPreview component exists with basic functionality
- PreviewSaveStep redesign complete

### Blocks
- Documentation update (REQ-175) - can proceed in parallel
- Final release - requires audit completion

---

## Success Metrics

| Metric | Target |
|--------|--------|
| axe-core violations | 0 critical, 0 serious |
| Keyboard-only completion rate | 100% of flows |
| Screen reader announcement coverage | 100% of state changes |
| Focus visible states | 100% of interactive elements |
| WCAG 2.1 AA compliance | Full compliance |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing ARIA on new components | Medium | High | Code review checklist |
| Drag-drop not keyboard accessible | High | High | Add keyboard alternatives |
| Screen reader conflicts with live regions | Low | Medium | Test multiple screen readers |
| Focus lost during async operations | Medium | Medium | Track and restore focus |
| Complex grid navigation broken | Medium | High | Comprehensive keyboard tests |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| 6.3.1 - ARIA Label Verification | 2-3 hours |
| 6.3.2 - Keyboard Navigation Testing | 3-4 hours |
| 6.3.3 - Screen Reader Testing | 2-3 hours |
| 6.3.4 - Focus Management Verification | 2-3 hours |
| Bug fixes and remediation | 4-6 hours |
| **Total** | **13-19 hours (1.5-2.5 days)** |

---

## References

- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Accessibility Utilities**: `/src/components/ItemCreationWorkflow/utils/accessibility.ts`
- **Previous A11y Work**: `docs/REQ-114-accessibility-mobile-optimization-overview.md`
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Testing Tools**:
  - axe DevTools: https://www.deque.com/axe/devtools/
  - NVDA: https://www.nvaccess.org/
  - VoiceOver: Built into macOS

---

## Appendix A: ARIA Attribute Reference for Components

### Selection Grid Pattern (PurposeStep, RoomSelectionStep)

```tsx
<div
  role="radiogroup"
  aria-label="Select your purpose for this content"
  aria-describedby="purpose-help"
>
  {purposes.map((purpose, index) => (
    <button
      key={purpose.id}
      role="radio"
      aria-checked={selectedPurpose === purpose.id}
      aria-describedby={`purpose-${purpose.id}-desc`}
      tabIndex={index === activeIndex ? 0 : -1}
      onClick={() => handleSelect(purpose.id)}
    >
      <span>{purpose.label}</span>
      <span id={`purpose-${purpose.id}-desc`} className="sr-only">
        {purpose.description}
      </span>
    </button>
  ))}
</div>
<p id="purpose-help" className="sr-only">
  Use arrow keys to navigate. Press Enter or Space to select.
</p>
```

### Dialog Pattern (ConfirmExitDialog)

```tsx
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Exit Workflow?</h2>
  <p id="dialog-description">
    You have unsaved changes. Are you sure you want to exit?
  </p>
  <button ref={cancelButtonRef}>Cancel</button>
  <button>Exit Workflow</button>
</div>
```

### Content Preview Pattern (ContentPreview)

```tsx
<div
  role="listitem"
  aria-label={`${contentType} content: ${title}`}
>
  {/* For images */}
  <img alt={`Preview of ${title}`} />

  {/* For videos */}
  <div aria-label={`Video preview: ${title}, duration ${duration}`}>
    <video aria-hidden="true" />
  </div>

  {/* For PDFs */}
  <div aria-label={`PDF document: ${title}, ${pageCount} pages`}>
    {/* Preview content */}
  </div>

  <button
    aria-label={`Remove ${title} from content`}
    onClick={onRemove}
  >
    <XIcon aria-hidden="true" />
  </button>
</div>
```

---

## Appendix B: Keyboard Navigation Test Script

```markdown
## Manual Keyboard Test Script

### Prerequisites
- Fresh browser session
- Keyboard only (disconnect/disable mouse)
- Browser dev tools open to Console

### Test Execution

1. **Navigate to workflow start**
   - Press Tab until focus on "Add Item" button
   - Press Enter to start workflow
   - Expected: Focus on Room Selection heading

2. **Room Selection (Step 1)**
   - Press Tab to enter room grid
   - Press ArrowRight 3 times
   - Expected: Focus moves through rooms
   - Press Enter to select
   - Expected: "Kitchen selected" announcement, advance to Step 2

3. **Item Type Selection (Step 2)**
   - Expected: Focus on heading
   - Press Tab to enter grid
   - Navigate with arrows
   - Press Space to select
   - Expected: Advance to Step 3

4. **Specific Item (Step 3)**
   - Expected: Focus on heading
   - Press Tab to text input
   - Type "Dishwasher"
   - Press Tab to Continue
   - Press Enter
   - Expected: Advance to Step 4

5. **Purpose Selection (Step 4)**
   - Navigate grid, select "How to Clean"
   - Expected: Advance to Step 5

6. **Content Type Selection (Step 5)**
   - Select "Upload File"
   - Expected: Advance to content creation

7. **Content Creation (Step 6)**
   - Tab to file input
   - Press Space/Enter to open file dialog
   - Tab through controls
   - Tab to Save/Continue

8. **Preview/Save (Step 7)**
   - Tab through content previews
   - Press arrow keys in grid
   - Tab to Save
   - Press Enter

9. **Next Action (Step 8)**
   - Arrow through action cards
   - Select "I'm Done"

10. **Exit Flow Test**
    - At any step, Tab to X button
    - Press Enter
    - Expected: Dialog opens, focus trapped
    - Tab through dialog buttons
    - Press Escape
    - Expected: Dialog closes, focus returns to X button
```

---

*Document generated as Technical Lead overview for REQ-174 Accessibility Audit implementation.*
