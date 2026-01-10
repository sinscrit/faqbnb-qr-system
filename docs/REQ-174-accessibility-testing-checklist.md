# ItemCreationWorkflow Accessibility Testing Checklist

**Request ID**: REQ-174
**Phase**: 6 - Integration & Polish
**Task**: 6.3 Accessibility Audit
**Last Modified**: 2026-01-10

---

## Overview

This document provides a comprehensive manual testing checklist for verifying WCAG 2.1 AA compliance of the ItemCreationWorkflow component. Use this checklist alongside automated tests to ensure full accessibility coverage.

---

## 1. Keyboard Navigation

### 1.1 Tab Order
- [ ] Tab order follows logical visual order (left-to-right, top-to-bottom)
- [ ] All interactive elements are reachable via Tab
- [ ] Skip links work correctly (if present)
- [ ] No keyboard traps exist

### 1.2 Arrow Key Navigation
- [ ] **RoomSelectionStep**: Grid navigation works with arrow keys (4-column grid)
- [ ] **ItemTypeStep**: Vertical list navigation with Up/Down arrows
- [ ] **PurposeStep**: Vertical navigation with Up/Down arrows, Space/Enter to select
- [ ] **ContentTypeStep**: Grid navigation works
- [ ] **PreviewSaveStep**: Content grid supports drag-and-drop reordering via keyboard
- [ ] **NextActionStep**: Action cards navigable with arrow keys

### 1.3 Focus Management
- [ ] Focus moves to step heading when navigating between steps
- [ ] Focus is trapped in modal dialogs
- [ ] Focus returns to trigger element when dialogs close
- [ ] Focus indicator is visible on all interactive elements

---

## 2. Screen Reader Testing

### 2.1 Announcements
Test with VoiceOver (macOS), NVDA, or JAWS:

- [ ] Step transitions are announced ("Step X of Y: Step Name")
- [ ] Selection confirmations are announced
- [ ] Error messages are announced assertively
- [ ] Loading states are announced
- [ ] Success messages are announced

### 2.2 Semantic Structure
- [ ] Heading hierarchy is logical (h2 for step titles, h3 for sections)
- [ ] Lists are announced with item counts
- [ ] Form controls have associated labels
- [ ] Images have appropriate alt text or are marked decorative

### 2.3 ARIA Attributes
- [ ] `role="radiogroup"` on PurposeStep options
- [ ] `aria-checked` on radio buttons reflects selection state
- [ ] `role="dialog"` and `aria-modal="true"` on modals
- [ ] `aria-label` on icon-only buttons
- [ ] `aria-live` regions for dynamic content updates
- [ ] `aria-describedby` links controls to help text

---

## 3. Visual Testing

### 3.1 Color Contrast
- [ ] Text meets 4.5:1 contrast ratio (WCAG AA)
- [ ] Large text meets 3:1 contrast ratio
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Non-text elements meet 3:1 contrast ratio

### 3.2 Focus Indicators
- [ ] All interactive elements have visible focus rings
- [ ] Focus indicators have sufficient contrast
- [ ] Focus is not hidden by other elements

### 3.3 Text Sizing
- [ ] Content is readable at 200% zoom
- [ ] No horizontal scrolling at 320px viewport width
- [ ] Text reflows properly when zoomed

---

## 4. Touch Target Testing

### 4.1 Size Requirements (WCAG 2.5.5 AAA, target 48x48px minimum)
- [ ] **ContentPieceCard** buttons: Remove and Retake are at least 48x48px
- [ ] **PurposeStep** cards: Minimum touch target height of 100px
- [ ] **NextActionStep** cards: Minimum 80px height
- [ ] **PreviewSaveStep** back button: Appropriate touch target
- [ ] **Dialog buttons**: Adequate size for touch interaction

### 4.2 Spacing
- [ ] Sufficient spacing between touch targets
- [ ] No overlapping touch targets

---

## 5. Reduced Motion Testing

### 5.1 prefers-reduced-motion Support
Enable reduced motion in system preferences and verify:

- [ ] Animations are disabled or reduced
- [ ] Transitions are instant or minimal
- [ ] Content remains fully functional
- [ ] `motion-reduce` CSS classes are applied

---

## 6. Component-Specific Tests

### 6.1 PurposeStep
- [ ] Radiogroup has `role="radiogroup"` and `aria-label`
- [ ] Each option has `role="radio"` and `aria-checked`
- [ ] Keyboard help text is announced
- [ ] Selection auto-advances after brief delay
- [ ] Continue button reflects selection state

### 6.2 ContentPreview
- [ ] Photo alt text is descriptive
- [ ] Video has `aria-hidden` on decorative elements
- [ ] Loading skeleton has `role="status"` and `aria-busy`
- [ ] Remove button has descriptive `aria-label`
- [ ] Type badge is hidden from screen readers

### 6.3 PreviewSaveStep
- [ ] Metadata uses `<dl>/<dt>/<dd>` semantic structure
- [ ] Sections have `aria-labelledby` pointing to headings
- [ ] Drag-and-drop has screen reader announcements
- [ ] Removal confirmation dialog is properly labeled
- [ ] Error and success states are announced

### 6.4 NextActionStep
- [ ] Action cards are announced with title and description
- [ ] Escape key closes cancel dialog
- [ ] Focus trap works in cancel confirmation dialog
- [ ] Session progress is announced in live region

---

## 7. Test Scenarios

### 7.1 Complete Workflow Test
1. Start from RoomSelectionStep
2. Navigate through all steps using only keyboard
3. Verify announcements at each step transition
4. Complete item creation
5. Verify success state is announced

### 7.2 Error Recovery Test
1. Try to proceed without making required selections
2. Verify error messages are announced
3. Navigate to fix errors using keyboard
4. Confirm errors are cleared

### 7.3 Dialog Focus Test
1. Open cancel confirmation dialog
2. Verify focus is trapped within dialog
3. Close dialog with Escape key
4. Verify focus returns to trigger element

---

## 8. Testing Tools

### Automated Testing
- **vitest-axe**: Run `npm test -- --grep "a11y"` for accessibility tests
- **axe DevTools**: Browser extension for live testing

### Manual Testing
- **VoiceOver**: macOS built-in screen reader (Cmd + F5)
- **NVDA**: Free Windows screen reader
- **Accessibility Inspector**: Chrome DevTools > Accessibility panel
- **Lighthouse**: Chrome DevTools > Lighthouse > Accessibility audit

---

## 9. Known Issues & Workarounds

| Issue | Status | Workaround |
|-------|--------|------------|
| None currently identified | - | - |

---

## 10. Sign-off

| Tester | Date | Status |
|--------|------|--------|
| | | |

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [dnd-kit Accessibility](https://docs.dndkit.com/guides/accessibility)
