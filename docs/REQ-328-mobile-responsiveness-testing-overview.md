# REQ-328: Mobile Responsiveness Testing for Guest Localization Components

**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Type:** TESTING
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish (Task 7.4)
**Epic:** L10N Epic 4 - Guest Experience
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create comprehensive mobile responsiveness testing to ensure all guest-facing localization components (language switcher, translation banners, toggle controls) function correctly and remain accessible on small screen devices.

---

## Dependencies

### Prerequisites from Earlier Phases

| Dependency | Phase | Status | Required By |
|------------|-------|--------|-------------|
| GuestLanguageSwitcher component | Phase 3 (Task 3.1) | Pending | This task |
| TranslationBanner component | Phase 3 (Task 3.2) | Pending | This task |
| MissingTranslationBanner component | Phase 3 (Task 3.3) | Pending | This task |
| ViewOriginalToggle component | Phase 3 (Task 3.4) | Pending | This task |
| LanguageIndicator component | Phase 3 (Task 3.5) | Pending | This task |
| Updated ItemDisplay component | Phase 5 (Task 5.2) | Pending | This task |

### Testing Infrastructure (Already Available)

| Dependency | Location | Status |
|------------|----------|--------|
| Vitest test framework | `vitest.config.ts` | Available |
| Testing Library React | `@testing-library/react` | Available |
| Accessibility testing | `vitest-axe` | Available |
| a11y test utilities | `src/components/ItemCreationWorkflow/__tests__/helpers/a11yTestUtils.ts` | Available |
| useIsMobile hook | `src/components/ItemManager/hooks/useIsMobile.ts` | Available |

---

## Implementation Overview

### Test Scope

This task creates tests for mobile responsiveness across all guest localization components. Tests will validate:

1. **Language Switcher Dropdown** - Proper rendering on small screens without overflow
2. **Translation Banners** - Correct display without obscuring content
3. **Interactive Elements** - Touch-friendly button sizing (minimum 44x44px)
4. **Layout Stability** - No horizontal scrolling or content overlap

### Test Breakpoints

Following the project's Tailwind CSS breakpoints:

| Breakpoint | Width | Description |
|------------|-------|-------------|
| xs | 320px | iPhone SE / small Android |
| sm | 375px | iPhone 12/13/14 |
| md | 414px | iPhone Plus / large Android |
| lg | 768px | Tablet portrait |

### Testing Strategy

The tests will use a combination of:
- **Unit tests**: Component rendering at different viewport sizes
- **Accessibility tests**: Touch target size validation
- **Visual regression tests**: Layout stability checks

---

## Ordered Implementation Tasks

### Task 1: Create Mobile Viewport Testing Utilities

**File:** `src/components/guest/__tests__/helpers/mobileTestUtils.ts`

Create reusable test utilities for mobile viewport simulation.

**Functions to implement:**
- `setViewportWidth(width: number)` - Set window.innerWidth for tests
- `mockMatchMedia(matches: boolean)` - Mock matchMedia for breakpoint tests
- `verifyTouchTarget(element: HTMLElement, minSize?: number)` - Verify minimum 44x44px touch targets
- `verifyNoOverflow(container: HTMLElement)` - Check for horizontal overflow
- `MOBILE_BREAKPOINTS` - Export constants for test breakpoints

**Pattern Reference:** `src/components/ItemManager/hooks/useIsMobile.ts` (line 56)

---

### Task 2: Create GuestLanguageSwitcher Mobile Tests

**File:** `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

Test the language switcher dropdown on mobile viewports.

**Test Cases:**
1. Dropdown renders fully visible on 320px width without horizontal overflow
2. Dropdown does not extend beyond viewport boundaries on small screens
3. Dropdown items remain readable and selectable on mobile viewports
4. Language switcher touch target is at least 44x44 pixels for comfortable finger tapping
5. Dropdown menus close properly when tapping outside on touch devices
6. Flag icons render at appropriate sizes for mobile displays

**Assertions:**
- `element.getBoundingClientRect().width <= window.innerWidth`
- `element.offsetWidth >= 44 && element.offsetHeight >= 44`
- No scrollbar appears in container

---

### Task 3: Create TranslationBanner Mobile Tests

**File:** `src/components/guest/TranslationBanner/__tests__/TranslationBanner.mobile.test.tsx`

Test the translation banner on mobile viewports.

**Test Cases:**
1. Banner displays correctly on mobile without obscuring page header or navigation
2. Banner text wraps appropriately on narrow screens without truncation of important information
3. Banner "View original" action is easily tappable with appropriate touch target size
4. Banner maintains proper z-index stacking on mobile to prevent content overlap issues
5. Banner works correctly in both portrait and landscape orientations

**Pattern Reference:** `src/components/ReactionButtons.tsx` (lines 279-282) for touch target styling

---

### Task 4: Create MissingTranslationBanner Mobile Tests

**File:** `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.mobile.test.tsx`

Test the missing translation banner on mobile viewports.

**Test Cases:**
1. Banner does not push main content below the fold on small screens
2. Banner stacks correctly when multiple informational elements are present on mobile
3. Banner text remains readable on narrow screens

---

### Task 5: Create ViewOriginalToggle Mobile Tests

**File:** `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.mobile.test.tsx`

Test the toggle button on mobile viewports.

**Test Cases:**
1. Toggle button has minimum 44x44 pixel touch target for accessibility compliance
2. Toggle button label text remains readable on small screens, wrapping or abbreviating as needed
3. All interactive elements have visible focus states for keyboard navigation on tablets
4. Touch interactions do not conflict with native mobile browser gestures such as swipe navigation

**Accessibility Reference:** WCAG 2.1 AA Target Size (Success Criterion 2.5.5)

---

### Task 6: Create LanguageIndicator Mobile Tests

**File:** `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.mobile.test.tsx`

Test the language indicator on mobile viewports.

**Test Cases:**
1. Language indicator component scales appropriately for mobile header contexts
2. Flag icons in language components render at appropriate sizes for mobile displays
3. Component layout stacks vertically on extremely small viewports if needed to maintain readability

---

### Task 7: Create Component Integration Mobile Tests

**File:** `src/components/guest/__tests__/guest-components.mobile.integration.test.tsx`

Test all guest localization components together on mobile viewports.

**Test Cases:**
1. Responsive breakpoints at 320px, 375px, 414px, and 768px cover common mobile device sizes
2. No horizontal scrolling is introduced by localization components on any tested viewport size
3. Components function correctly in both portrait and landscape orientations
4. Banners stack correctly when multiple banners are present

---

### Task 8: Update ItemDisplay Mobile Tests

**File:** `src/components/__tests__/ItemDisplay.mobile.test.tsx`

Extend ItemDisplay tests to verify localization components work properly within the context.

**Test Cases:**
1. Language switcher renders properly in ItemDisplay header on mobile
2. Translation banner integrates without layout issues
3. All localization controls maintain accessibility on mobile

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/guest/__tests__/helpers/mobileTestUtils.ts` | Mobile viewport testing utilities |
| `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.mobile.test.tsx` | Language switcher mobile tests |
| `src/components/guest/TranslationBanner/__tests__/TranslationBanner.mobile.test.tsx` | Translation banner mobile tests |
| `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.mobile.test.tsx` | Missing translation banner mobile tests |
| `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.mobile.test.tsx` | View original toggle mobile tests |
| `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.mobile.test.tsx` | Language indicator mobile tests |
| `src/components/guest/__tests__/guest-components.mobile.integration.test.tsx` | Integration mobile tests |
| `src/components/__tests__/ItemDisplay.mobile.test.tsx` | ItemDisplay mobile tests |

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Test structure | `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Standard test organization |
| a11y test utilities | `src/components/ItemCreationWorkflow/__tests__/helpers/a11yTestUtils.ts` | Reuse accessibility helpers |
| useIsMobile hook | `src/components/ItemManager/hooks/useIsMobile.ts` | Viewport detection pattern |
| Touch target sizing | `src/components/ReactionButtons.tsx` (lines 279-282) | 44x44 min-size pattern |

### Files That May Need Minor Updates

| File Path | Potential Update |
|-----------|------------------|
| `vitest.setup.ts` | Add ResizeObserver mock if needed for viewport tests |
| `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | May need responsive class adjustments based on test findings |
| `src/components/guest/TranslationBanner/TranslationBanner.tsx` | May need text wrapping adjustments based on test findings |
| `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | May need touch target adjustments based on test findings |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Language switcher dropdown renders fully visible on screens 320px wide | Task 2 |
| Language switcher dropdown does not extend beyond viewport boundaries | Task 2 |
| Language switcher dropdown items remain readable and selectable | Task 2 |
| Language switcher touch target is at least 44x44 pixels | Task 2, Task 1 |
| Translation banner displays correctly without obscuring header/navigation | Task 3 |
| Translation banner text wraps appropriately without truncation | Task 3 |
| Translation banner "View original" action is easily tappable | Task 3 |
| Missing translation banner doesn't push content below fold | Task 4 |
| Banners stack correctly when multiple elements present | Task 4, Task 7 |
| ViewOriginalToggle button has minimum 44x44 pixel touch target | Task 5 |
| Toggle button label text remains readable, wrapping as needed | Task 5 |
| Language indicator scales appropriately for mobile header contexts | Task 6 |
| Flag icons render at appropriate sizes for mobile displays | Task 6, Task 2 |
| Dropdown menus close properly when tapping outside | Task 2 |
| Components function in both portrait and landscape orientations | Task 3, Task 7 |
| Responsive breakpoints at 320px, 375px, 414px, 768px covered | Task 7 |
| No horizontal scrolling introduced by localization components | Task 7 |
| Touch interactions don't conflict with native browser gestures | Task 5 |
| All interactive elements have visible focus states on tablets | Task 5 |
| Proper z-index stacking on mobile prevents content overlap | Task 3, Task 7 |

---

## Test Implementation Details

### Mobile Viewport Simulation Strategy

```typescript
// Pattern from vitest.setup.ts - extend for mobile testing
beforeEach(() => {
  // Set up ResizeObserver mock
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mobile test utility pattern
function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}
```

### Touch Target Verification Pattern

```typescript
// Based on WCAG 2.1 AA Success Criterion 2.5.5 (Target Size)
function verifyTouchTarget(element: HTMLElement, minSize = 44): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= minSize && rect.height >= minSize;
}
```

### Overflow Detection Pattern

```typescript
// Check for horizontal overflow that would cause scrolling
function hasHorizontalOverflow(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guest components not yet implemented | High | Blocks testing | Wait for Phase 3 completion; create test stubs first |
| Viewport mocking complexity | Medium | Test accuracy | Use proven patterns from useIsMobile hook |
| Test flakiness on resize | Low | CI reliability | Use proper async/await patterns with act() |
| Component responsive styles insufficient | Medium | Test failures | Tests will identify issues; fix in component code |

---

## Notes

- This task depends on guest components being implemented in Phase 3
- Tests should be written before components are complete (TDD approach recommended)
- Mobile-first design principle: test smallest viewport first, then expand
- All measurements in pixels to match Tailwind's breakpoint system
- Consider using Playwright or Cypress for true end-to-end mobile testing in the future
