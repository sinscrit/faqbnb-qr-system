# Detailed Task Breakdown: Mobile Responsiveness Testing

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-025 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 19:59 |
| Overview Document | REQ-E04-025-mobile-responsiveness-testing-overview.md |
| Breakdown Created | 2026-01-23 00:02 |
| Phase | 7 - Testing & Polish |
| Task ID | 7.4 |
| Title | Mobile responsiveness testing |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command | Description |
|--------|---------|-------------|
| Type Check | `npm run typecheck` | Verify TypeScript types |
| Unit Tests | `npm test` | Run all tests with Vitest |
| Mobile Tests | `npm test mobile` | Run mobile-specific tests |
| Coverage | `npm run test:coverage` | Generate coverage report |
| Build | `npm run build` | Build production bundle |
| Lint | `npm run lint` | Run ESLint |

---

## Overview

This document provides a detailed task breakdown for **REQ-E04-025: Mobile Responsiveness Testing**. This task creates comprehensive tests to verify that all guest-facing localization components (language switcher, translation banners, toggle buttons) work correctly on mobile devices, meet touch target size requirements (44x44px minimum), and display properly across all mobile viewport sizes from 320px to 768px width.

**Key objectives:**
1. Create mobile test helper utilities for viewport simulation and touch target validation
2. Test GuestLanguageSwitcher on mobile (dropdown, touch targets, positioning)
3. Test TranslationBanner and MissingTranslationBanner on mobile (wrapping, legibility)
4. Test ViewOriginalToggle and LanguageIndicator on mobile (touch-friendliness)
5. Create integration tests for complete mobile layout
6. Verify all interactive elements meet WCAG 2.5.5 touch target guidelines (44x44px)
7. Test at key breakpoints: 320px (small), 375px (medium), 768px (tablet)
8. Verify text legibility (minimum 14px for body text)
9. Verify dropdowns don't extend beyond viewport
10. Ensure no horizontal scrolling or content overflow

This is a **SPECIFICATION** document for work that WILL BE DONE by the implementation agent (Agent 04). All checkboxes are **unchecked** by default. Agent 04 will check them off as work progresses.

**Status:** PENDING

---

## Phase 1: Setup Mobile Test Infrastructure

### Task 1.1: Create Mobile Test Helper Utilities File

**ID:** **1.1**

Create `src/components/__tests__/fixtures/mobileTestHelpers.ts` with viewport simulation and validation utilities.

**Context:** Mobile testing requires consistent viewport simulation, touch target validation, and responsive style checking across all component tests.

**Files to modify:**
- Create: `src/components/__tests__/fixtures/mobileTestHelpers.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.1.1** Create fixtures directory at `src/components/__tests__/fixtures/` if it doesn't exist
- [ ] **1.1.2** Create `mobileTestHelpers.ts` file with module header and REQ-E04-025 reference
- [ ] **1.1.3** Import React Testing Library utilities: `render`, `RenderOptions`
- [ ] **1.1.4** Import React types: `ReactElement`
- [ ] **1.1.5** Export `MOBILE_BREAKPOINTS` constant object
- [ ] **1.1.6** Define breakpoints: `small: 320`, `medium: 375`, `large: 414`, `tablet: 768`
- [ ] **1.1.7** Export `setMobileViewport(width: number)` function
- [ ] **1.1.8** Function sets `window.innerWidth` using `Object.defineProperty`
- [ ] **1.1.9** Function dispatches resize event: `window.dispatchEvent(new Event('resize'))`
- [ ] **1.1.10** Export `renderWithMobileViewport` function
- [ ] **1.1.11** Function accepts `ui`, `width` (default: MOBILE_BREAKPOINTS.medium), `options`
- [ ] **1.1.12** Function calls `setMobileViewport(width)` before rendering
- [ ] **1.1.13** Function returns result of `render(ui, options)`
- [ ] **1.1.14** Export `isTouchTargetAccessible(element: HTMLElement)` function
- [ ] **1.1.15** Function gets `element.getBoundingClientRect()`
- [ ] **1.1.16** Function returns `true` if width >= 44 AND height >= 44
- [ ] **1.1.17** Export `getResponsiveStyles(element: HTMLElement)` function
- [ ] **1.1.18** Function returns object with display, width, height, fontSize, padding
- [ ] **1.1.19** Uses `window.getComputedStyle()` for CSS properties
- [ ] **1.1.20** Uses `getBoundingClientRect()` for dimensions
- [ ] **1.1.21** Export `simulateTouch(element: HTMLElement)` function
- [ ] **1.1.22** Function creates TouchEvent with touchstart type
- [ ] **1.1.23** Function includes Touch object with identifier, target, clientX, clientY
- [ ] **1.1.24** Function dispatches touch event to element
- [ ] **1.1.25** Add JSDoc comments for all exported functions
- [ ] **1.1.26** Run `npm run typecheck` to verify no type errors
- [ ] **1.1.27** Verify file compiles without errors

**Implementation Notes:**
- Window properties must be writable and configurable for tests
- Touch target size of 44x44px is WCAG 2.5.5 guideline
- Helper functions enable consistent mobile testing across all component tests

**Verification Steps:**
1. Verify file created at correct path
2. Verify all exports are present and properly typed
3. Import helpers in a test file to verify they're usable
4. Run `npm run typecheck` to ensure no TypeScript errors
5. Test viewport simulation manually with a simple component

---

## Phase 2: GuestLanguageSwitcher Mobile Tests

### Task 2.1: Create GuestLanguageSwitcher Mobile Test File

**ID:** **2.1**

Create `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx` with test structure.

**Context:** Language switcher is critical mobile UI - dropdown must work well with touch input.

**Files to modify:**
- Create: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.1.1** Create test file at `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`
- [ ] **2.1.2** Add file header with module documentation and REQ-E04-025 reference
- [ ] **2.1.3** Import Vitest utilities: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`
- [ ] **2.1.4** Import React Testing Library: `screen`, `within`
- [ ] **2.1.5** Import `userEvent` from '@testing-library/user-event'
- [ ] **2.1.6** Import GuestLanguageSwitcher component
- [ ] **2.1.7** Import all mobile test helpers from fixtures
- [ ] **2.1.8** Create top-level describe block: 'GuestLanguageSwitcher - Mobile Responsiveness'
- [ ] **2.1.9** Define mock functions and test data in describe block
- [ ] **2.1.10** Add beforeEach to clear mocks
- [ ] **2.1.11** Add afterEach to reset viewport to 1024px
- [ ] **2.1.12** Run `npm run typecheck` to verify structure
- [ ] **2.1.13** Run `npm test` to verify file loads without errors

**Implementation Notes:**
- afterEach resets viewport to prevent test interference
- Mock functions needed: `onLanguageChange`
- Available languages: ['en', 'fr', 'es', 'de', 'nl', 'it']

**Verification Steps:**
1. Verify file created at correct path
2. Verify all imports resolve correctly
3. Run tests to ensure structure is valid
4. Check that viewport resets between tests

---

### Task 2.2: Test Small Mobile Rendering (320px)

**ID:** **2.2**

Write tests for 320px viewport (smallest mobile size).

**Context:** iPhone SE and similar small devices require special attention to ensure UI doesn't break.

**Files to modify:**
- Edit: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.2.1** Create describe block: 'Small Mobile (320px)'
- [ ] **2.2.2** Write test: 'renders correctly at 320px width'
- [ ] **2.2.3** Use `renderWithMobileViewport` with `MOBILE_BREAKPOINTS.small`
- [ ] **2.2.4** Render GuestLanguageSwitcher with test props
- [ ] **2.2.5** Find trigger button by role 'button' with name matching /language/i
- [ ] **2.2.6** Verify trigger is in document
- [ ] **2.2.7** Write test: 'trigger button meets touch target size requirements'
- [ ] **2.2.8** Render component at 320px viewport
- [ ] **2.2.9** Get trigger button element
- [ ] **2.2.10** Use `isTouchTargetAccessible(trigger)` helper
- [ ] **2.2.11** Verify result is `true` (button is >= 44x44px)
- [ ] **2.2.12** Run `npm test mobile` to verify tests pass
- [ ] **2.2.13** Verify tests detect size violations if button is made smaller

**Implementation Notes:**
- 320px is smallest common mobile viewport (iPhone SE)
- Touch target validation is critical for usability
- Tests should fail if button is too small

**Verification Steps:**
1. Run tests and verify they pass
2. Temporarily reduce button size and verify test fails
3. Check that touch target validation works correctly
4. Verify component renders without overflow

---

### Task 2.3: Test Medium Mobile Functionality (375px)

**ID:** **2.3**

Write tests for 375px viewport (most common mobile size).

**Context:** iPhone 12/13 size is most common mobile viewport. Dropdown must open and work correctly.

**Files to modify:**
- Edit: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.3.1** Create describe block: 'Medium Mobile (375px)'
- [ ] **2.3.2** Write test: 'dropdown opens correctly on mobile'
- [ ] **2.3.3** Set up userEvent: `const user = userEvent.setup()`
- [ ] **2.3.4** Render component at 375px viewport
- [ ] **2.3.5** Get trigger button
- [ ] **2.3.6** Click trigger: `await user.click(trigger)`
- [ ] **2.3.7** Verify menu appears: `expect(screen.getByRole('menu')).toBeInTheDocument()`
- [ ] **2.3.8** Write test: 'all language options meet touch target requirements'
- [ ] **2.3.9** Render component and open dropdown
- [ ] **2.3.10** Get all menu items: `screen.getAllByRole('menuitem')`
- [ ] **2.3.11** Use forEach to check each item with `isTouchTargetAccessible`
- [ ] **2.3.12** Verify all items are >= 44x44px
- [ ] **2.3.13** Write test: 'dropdown closes when selecting a language'
- [ ] **2.3.14** Render component and open dropdown
- [ ] **2.3.15** Get French option by role 'menuitem' with name /français/i
- [ ] **2.3.16** Click French option
- [ ] **2.3.17** Verify `onLanguageChange` called with 'fr'
- [ ] **2.3.18** Verify menu is closed: `expect(screen.queryByRole('menu')).not.toBeInTheDocument()`
- [ ] **2.3.19** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- userEvent provides realistic user interactions
- All dropdown items must be touch-friendly
- Dropdown should close after selection

**Verification Steps:**
1. Run tests and verify all pass
2. Check that dropdown opens and closes correctly
3. Verify all menu items are accessible
4. Test language selection callback

---

### Task 2.4: Test Tablet Width (768px)

**ID:** **2.4**

Write tests for 768px viewport (tablet size).

**Context:** Tablet size is upper bound of mobile testing. Component should maintain functionality.

**Files to modify:**
- Edit: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.4.1** Create describe block: 'Tablet (768px)'
- [ ] **2.4.2** Write test: 'maintains functionality at tablet width'
- [ ] **2.4.3** Set up userEvent
- [ ] **2.4.4** Render component at 768px viewport
- [ ] **2.4.5** Click trigger button
- [ ] **2.4.6** Verify menu appears
- [ ] **2.4.7** Verify all 6 language options are present
- [ ] **2.4.8** Expect `screen.getAllByRole('menuitem')).toHaveLength(6)`
- [ ] **2.4.9** Run `npm test mobile` to verify test passes

**Implementation Notes:**
- Tablet is largest mobile viewport we test
- All 6 languages should be in dropdown
- Functionality should be same as smaller viewports

**Verification Steps:**
1. Run test and verify it passes
2. Check that all languages appear
3. Verify dropdown works at tablet size

---

### Task 2.5: Test Dropdown Positioning

**ID:** **2.5**

Write tests to verify dropdown doesn't extend beyond viewport edges.

**Context:** Dropdown menus can extend off-screen on narrow viewports. Must position correctly.

**Files to modify:**
- Edit: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.5.1** Create describe block: 'Dropdown Positioning'
- [ ] **2.5.2** Write test: 'dropdown does not extend beyond viewport on small screens'
- [ ] **2.5.3** Set up userEvent
- [ ] **2.5.4** Render component at 320px viewport
- [ ] **2.5.5** Open dropdown by clicking trigger
- [ ] **2.5.6** Get menu element: `screen.getByRole('menu')`
- [ ] **2.5.7** Get menu bounding rect: `menu.getBoundingClientRect()`
- [ ] **2.5.8** Verify `menuRect.right <= window.innerWidth`
- [ ] **2.5.9** Verify `menuRect.left >= 0`
- [ ] **2.5.10** Run `npm test mobile` to verify test passes

**Implementation Notes:**
- Dropdown should not extend beyond viewport edges
- Left edge should be >= 0, right edge should be <= viewport width
- Critical for usability on small screens

**Verification Steps:**
1. Run test and verify positioning is correct
2. Check that dropdown is fully visible
3. Test at different viewport sizes

---

### Task 2.6: Test Text Legibility

**ID:** **2.6**

Write test to verify text remains readable at all mobile sizes.

**Context:** Text must be legible on mobile. Minimum 14px font size for usability.

**Files to modify:**
- Edit: `src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.6.1** Create describe block: 'Text Legibility'
- [ ] **2.6.2** Write test: 'text remains readable at all mobile sizes'
- [ ] **2.6.3** Create array of breakpoints to test: small, medium, tablet
- [ ] **2.6.4** Use forEach to test each breakpoint
- [ ] **2.6.5** Render component at current breakpoint width
- [ ] **2.6.6** Get trigger button element
- [ ] **2.6.7** Get computed font size: `window.getComputedStyle(trigger).fontSize`
- [ ] **2.6.8** Parse font size to number: `parseInt(fontSize, 10)`
- [ ] **2.6.9** Verify font size >= 14px: `expect(fontSizeNum).toBeGreaterThanOrEqual(14)`
- [ ] **2.6.10** Run `npm test mobile` to verify test passes

**Implementation Notes:**
- 14px minimum for body text legibility
- Test at all three major breakpoints
- Use computed styles to get actual rendered size

**Verification Steps:**
1. Run test and verify font sizes are adequate
2. Check that text is legible at all sizes
3. Verify test fails if font is too small

---

## Phase 3: Banner Components Mobile Tests

### Task 3.1: Create Banner Mobile Test File

**ID:** **3.1**

Create `src/components/__tests__/TranslationBanners.mobile.test.tsx` with test structure.

**Context:** Banners must display correctly on mobile without obscuring content.

**Files to modify:**
- Create: `src/components/__tests__/TranslationBanners.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.1.1** Create test file at specified path
- [ ] **3.1.2** Add file header with module documentation and REQ reference
- [ ] **3.1.3** Import Vitest utilities
- [ ] **3.1.4** Import React Testing Library: `screen`
- [ ] **3.1.5** Import TranslationBanner component
- [ ] **3.1.6** Import MissingTranslationBanner component
- [ ] **3.1.7** Import mobile test helpers
- [ ] **3.1.8** Create top-level describe block: 'Translation Banners - Mobile Responsiveness'
- [ ] **3.1.9** Add afterEach to reset viewport
- [ ] **3.1.10** Run `npm run typecheck` to verify structure
- [ ] **3.1.11** Run `npm test` to verify file loads

**Implementation Notes:**
- Two banner components to test: TranslationBanner and MissingTranslationBanner
- Both must work on mobile without layout issues

**Verification Steps:**
1. Verify file created correctly
2. Verify imports resolve
3. Run tests to check structure

---

### Task 3.2: Test TranslationBanner Mobile Rendering

**ID:** **3.2**

Write tests for TranslationBanner on mobile screens.

**Context:** Banner must display without obscuring content, with touch-friendly links.

**Files to modify:**
- Edit: `src/components/__tests__/TranslationBanners.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.2.1** Create describe block: 'TranslationBanner'
- [ ] **3.2.2** Write test: 'renders without obscuring content on small mobile'
- [ ] **3.2.3** Render banner with mock content div at 320px
- [ ] **3.2.4** Get banner element using text /translated from/i
- [ ] **3.2.5** Get content element using testid
- [ ] **3.2.6** Verify both are in document
- [ ] **3.2.7** Get banner computed style
- [ ] **3.2.8** Verify position is not 'absolute' (shouldn't cover content)
- [ ] **3.2.9** Write test: 'view original link is touch-friendly'
- [ ] **3.2.10** Render banner at 375px
- [ ] **3.2.11** Get "view original" link element
- [ ] **3.2.12** Get bounding rect
- [ ] **3.2.13** Verify height >= 40px (adequate touch padding)
- [ ] **3.2.14** Write test: 'text wraps correctly on narrow screens'
- [ ] **3.2.15** Render banner at 320px
- [ ] **3.2.16** Get banner width from getBoundingClientRect
- [ ] **3.2.17** Verify width <= 320px (no overflow)
- [ ] **3.2.18** Write test: 'maintains visibility in portrait orientation'
- [ ] **3.2.19** Render banner at 375px
- [ ] **3.2.20** Verify banner is visible: `expect(banner).toBeVisible()`
- [ ] **3.2.21** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Banner should not have absolute positioning that covers content
- "View original" link needs adequate padding for touch
- Text must wrap, not overflow horizontally

**Verification Steps:**
1. Run tests and verify all pass
2. Check banner positioning is correct
3. Verify link is touch-friendly
4. Test text wrapping on narrow screens

---

### Task 3.3: Test MissingTranslationBanner Mobile Rendering

**ID:** **3.3**

Write tests for MissingTranslationBanner on mobile screens.

**Context:** Missing translation banner must also work well on mobile.

**Files to modify:**
- Edit: `src/components/__tests__/TranslationBanners.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.3.1** Create describe block: 'MissingTranslationBanner'
- [ ] **3.3.2** Write test: 'renders without obscuring content on small mobile'
- [ ] **3.3.3** Render banner with mock content at 320px
- [ ] **3.3.4** Get banner using text /translation not available/i
- [ ] **3.3.5** Verify banner and content both present
- [ ] **3.3.6** Write test: 'message text is readable at mobile sizes'
- [ ] **3.3.7** Render banner at 320px
- [ ] **3.3.8** Get banner text element
- [ ] **3.3.9** Get computed font size
- [ ] **3.3.10** Parse to number
- [ ] **3.3.11** Verify font size >= 14px
- [ ] **3.3.12** Write test: 'adapts to narrow viewport without horizontal scroll'
- [ ] **3.3.13** Render banner at 320px
- [ ] **3.3.14** Get banner width
- [ ] **3.3.15** Verify width <= 320px
- [ ] **3.3.16** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Similar requirements to TranslationBanner
- Focus on text legibility and no overflow

**Verification Steps:**
1. Run tests and verify they pass
2. Check banner renders correctly
3. Verify text is readable
4. Test for horizontal overflow

---

### Task 3.4: Test Multiple Banners Stacking

**ID:** **3.4**

Write test to verify both banners display without overlapping on mobile.

**Context:** Multiple banners might appear simultaneously. Must stack correctly, not overlap.

**Files to modify:**
- Edit: `src/components/__tests__/TranslationBanners.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.4.1** Create describe block: 'Multiple Banners Stacking'
- [ ] **3.4.2** Write test: 'both banners display without overlapping on mobile'
- [ ] **3.4.3** Render both TranslationBanner and MissingTranslationBanner at 375px
- [ ] **3.4.4** Add mock content div below banners
- [ ] **3.4.5** Get both banner elements
- [ ] **3.4.6** Get content element
- [ ] **3.4.7** Verify all three elements are in document
- [ ] **3.4.8** Get bounding rects for both banners
- [ ] **3.4.9** Calculate if banners overlap: check if `tb.bottom <= mb.top || mb.bottom <= tb.top`
- [ ] **3.4.10** Verify result is true (banners don't overlap)
- [ ] **3.4.11** Run `npm test mobile` to verify test passes

**Implementation Notes:**
- Banners should stack vertically
- No overlapping allowed
- Both should remain fully visible

**Verification Steps:**
1. Run test and verify banners stack correctly
2. Check that no overlap occurs
3. Verify both banners are visible

---

## Phase 4: View Controls Mobile Tests

### Task 4.1: Create View Controls Mobile Test File

**ID:** **4.1**

Create `src/components/__tests__/ViewControls.mobile.test.tsx` with test structure.

**Context:** Toggle and indicator components must be touch-friendly on mobile.

**Files to modify:**
- Create: `src/components/__tests__/ViewControls.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.1.1** Create test file at specified path
- [ ] **4.1.2** Add file header with documentation and REQ reference
- [ ] **4.1.3** Import Vitest utilities
- [ ] **4.1.4** Import React Testing Library
- [ ] **4.1.5** Import userEvent
- [ ] **4.1.6** Import ViewOriginalToggle component
- [ ] **4.1.7** Import LanguageIndicator component
- [ ] **4.1.8** Import mobile test helpers
- [ ] **4.1.9** Create describe block: 'View Controls - Mobile Responsiveness'
- [ ] **4.1.10** Add afterEach to reset viewport
- [ ] **4.1.11** Run `npm run typecheck` to verify
- [ ] **4.1.12** Run `npm test` to verify file loads

**Implementation Notes:**
- Two components to test: ViewOriginalToggle and LanguageIndicator
- Both need touch-friendly targets

**Verification Steps:**
1. Verify file created correctly
2. Verify imports resolve
3. Run tests to check structure

---

### Task 4.2: Test ViewOriginalToggle Touch Targets

**ID:** **4.2**

Write tests for ViewOriginalToggle button on mobile.

**Context:** Toggle button is primary interaction for switching between translation and original.

**Files to modify:**
- Edit: `src/components/__tests__/ViewControls.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.2.1** Create describe block: 'ViewOriginalToggle'
- [ ] **4.2.2** Define mock `onToggle` function
- [ ] **4.2.3** Write test: 'button meets touch target requirements on mobile'
- [ ] **4.2.4** Render component at 320px
- [ ] **4.2.5** Get button by role 'button' with name /view in original/i
- [ ] **4.2.6** Use `isTouchTargetAccessible(button)`
- [ ] **4.2.7** Verify result is true
- [ ] **4.2.8** Write test: 'button text remains readable on small screens'
- [ ] **4.2.9** Render at 320px
- [ ] **4.2.10** Get button element
- [ ] **4.2.11** Get computed font size
- [ ] **4.2.12** Verify font size >= 14px
- [ ] **4.2.13** Write test: 'button is easily tappable with touch input'
- [ ] **4.2.14** Set up userEvent
- [ ] **4.2.15** Render at 375px
- [ ] **4.2.16** Click button
- [ ] **4.2.17** Verify `onToggle` called once
- [ ] **4.2.18** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Button must be >= 44x44px
- Text must be >= 14px
- Click interaction must work

**Verification Steps:**
1. Run tests and verify all pass
2. Check button is touch-friendly
3. Verify text is readable
4. Test click interaction

---

### Task 4.3: Test ViewOriginalToggle Icon and Reflow

**ID:** **4.3**

Write tests for icon scaling and button reflow on mobile.

**Context:** Icon and text must scale appropriately on narrow screens.

**Files to modify:**
- Edit: `src/components/__tests__/ViewControls.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.3.1** Write test: 'icon scales appropriately on mobile'
- [ ] **4.3.2** Render component at 320px
- [ ] **4.3.3** Get button element
- [ ] **4.3.4** Query for svg within button: `button.querySelector('svg')`
- [ ] **4.3.5** Verify icon exists
- [ ] **4.3.6** Get icon bounding rect
- [ ] **4.3.7** Verify icon width >= 16px (visible)
- [ ] **4.3.8** Verify icon width <= 32px (not oversized)
- [ ] **4.3.9** Write test: 'button reflows correctly in narrow containers'
- [ ] **4.3.10** Render button in container with width 280px at 320px viewport
- [ ] **4.3.11** Get button width
- [ ] **4.3.12** Verify button width <= 280px (doesn't overflow container)
- [ ] **4.3.13** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Icon should be visible but not dominate button
- Button should reflow within narrow containers
- No horizontal overflow allowed

**Verification Steps:**
1. Run tests and verify they pass
2. Check icon scaling is appropriate
3. Verify button reflows correctly

---

### Task 4.4: Test LanguageIndicator Mobile Display

**ID:** **4.4**

Write tests for LanguageIndicator on mobile screens.

**Context:** Indicator shows current language. Must be visible and readable on mobile.

**Files to modify:**
- Edit: `src/components/__tests__/ViewControls.mobile.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.4.1** Create describe block: 'LanguageIndicator'
- [ ] **4.4.2** Write test: 'displays flag and text on small mobile screens'
- [ ] **4.4.3** Render component at 320px with currentLanguage: 'fr'
- [ ] **4.4.4** Verify text /fr/i is in document
- [ ] **4.4.5** Write test: 'remains readable at all mobile breakpoints'
- [ ] **4.4.6** Use forEach over all three breakpoints
- [ ] **4.4.7** Render at each breakpoint
- [ ] **4.4.8** Get indicator text element
- [ ] **4.4.9** Get computed font size
- [ ] **4.4.10** Verify font size >= 12px (smaller text allowed for indicator)
- [ ] **4.4.11** Write test: 'clickable indicator meets touch target requirements'
- [ ] **4.4.12** Render with onClick prop at 375px
- [ ] **4.4.13** Get indicator element (button or parent)
- [ ] **4.4.14** If element is button, verify touch target accessible
- [ ] **4.4.15** Write test: 'subtitle text wraps appropriately on narrow screens'
- [ ] **4.4.16** Render with showTranslatedFrom at 320px
- [ ] **4.4.17** Get indicator container width
- [ ] **4.4.18** Verify width <= 320px
- [ ] **4.4.19** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Indicator text can be slightly smaller (12px minimum)
- If clickable, must meet touch target requirements
- Subtitle text must wrap on narrow screens

**Verification Steps:**
1. Run tests and verify all pass
2. Check indicator is visible
3. Verify readability at all sizes
4. Test touch targets if clickable

---

## Phase 5: Mobile Integration Tests

### Task 5.1: Create Mobile Integration Test File

**ID:** **5.1**

Create `src/components/__tests__/ItemDisplay.mobile.integration.test.tsx` with test structure.

**Context:** Integration tests verify complete mobile layout with all components together.

**Files to modify:**
- Create: `src/components/__tests__/ItemDisplay.mobile.integration.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.1.1** Create test file at specified path
- [ ] **5.1.2** Add file header with documentation and REQ reference
- [ ] **5.1.3** Import Vitest utilities
- [ ] **5.1.4** Import React Testing Library: `render`, `screen`
- [ ] **5.1.5** Import userEvent
- [ ] **5.1.6** Import ItemDisplay component
- [ ] **5.1.7** Import mobile test helpers
- [ ] **5.1.8** Import types: `Item`, `TranslationMeta`
- [ ] **5.1.9** Create describe block: 'ItemDisplay - Mobile Integration'
- [ ] **5.1.10** Define mock Item data with translations
- [ ] **5.1.11** Define mock TranslationMeta
- [ ] **5.1.12** Add afterEach to reset viewport
- [ ] **5.1.13** Run `npm run typecheck` to verify
- [ ] **5.1.14** Run `npm test` to verify file loads

**Implementation Notes:**
- Integration tests use complete ItemDisplay with all subcomponents
- Tests verify layout, stacking, and interactions work together

**Verification Steps:**
1. Verify file created correctly
2. Verify imports and mocks are set up
3. Run tests to check structure

---

### Task 5.2: Test Complete Mobile Layout

**ID:** **5.2**

Write tests for complete layout rendering on mobile.

**Context:** All components must render together without layout issues.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.mobile.integration.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.2.1** Write test: 'renders complete layout on small mobile screen'
- [ ] **5.2.2** Set viewport to 320px
- [ ] **5.2.3** Render ItemDisplay with mock data
- [ ] **5.2.4** Verify translated title is present
- [ ] **5.2.5** Verify language switcher button is present
- [ ] **5.2.6** Verify translation banner is present
- [ ] **5.2.7** Write test: 'components stack vertically without overlapping'
- [ ] **5.2.8** Set viewport to 375px
- [ ] **5.2.9** Render ItemDisplay
- [ ] **5.2.10** Get banner and content bounding rects
- [ ] **5.2.11** Verify banner.bottom <= content.top (banner above content)
- [ ] **5.2.12** Write test: 'language switcher is accessible at top of viewport'
- [ ] **5.2.13** Render at 375px
- [ ] **5.2.14** Get language switcher element
- [ ] **5.2.15** Get bounding rect
- [ ] **5.2.16** Verify rect.top >= 0 (visible)
- [ ] **5.2.17** Verify rect.top < 200 (near top of page)
- [ ] **5.2.18** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- All key components must be present
- Components should stack vertically
- Language switcher should be near top for easy access

**Verification Steps:**
1. Run tests and verify layout is correct
2. Check all components are visible
3. Verify vertical stacking without overlap

---

### Task 5.3: Test Content Visibility and Touch Interactions

**ID:** **5.3**

Write tests for content visibility and mobile interactions.

**Context:** Main content must not be obscured, and all touch interactions must work.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.mobile.integration.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.3.1** Write test: 'main content is not obscured by fixed elements'
- [ ] **5.3.2** Set viewport to 375px
- [ ] **5.3.3** Render ItemDisplay
- [ ] **5.3.4** Get main content element
- [ ] **5.3.5** Verify content is visible
- [ ] **5.3.6** Get bounding rect
- [ ] **5.3.7** Verify rect.left >= 0
- [ ] **5.3.8** Verify rect.right <= window.innerWidth
- [ ] **5.3.9** Write test: 'all interactive elements are touch-friendly'
- [ ] **5.3.10** Set up userEvent
- [ ] **5.3.11** Render at 375px
- [ ] **5.3.12** Click language switcher
- [ ] **5.3.13** Verify menu opens
- [ ] **5.3.14** Click "view original" link
- [ ] **5.3.15** Verify interaction works
- [ ] **5.3.16** Write test: 'page scrolls correctly with banners visible'
- [ ] **5.3.17** Render at 375px
- [ ] **5.3.18** Simulate scroll: set window.scrollY = 100
- [ ] **5.3.19** Dispatch scroll event
- [ ] **5.3.20** Verify banner remains accessible
- [ ] **5.3.21** Run `npm test mobile` to verify tests pass

**Implementation Notes:**
- Content must be within viewport bounds
- All touch interactions should work smoothly
- Scrolling should not break layout

**Verification Steps:**
1. Run tests and verify all pass
2. Check content visibility
3. Test touch interactions
4. Verify scrolling behavior

---

### Task 5.4: Test Mobile Layout Integrity

**ID:** **5.4**

Write test for complete mobile layout without horizontal overflow.

**Context:** Mobile layout must not cause horizontal scrolling.

**Files to modify:**
- Edit: `src/components/__tests__/ItemDisplay.mobile.integration.test.tsx`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.4.1** Write test: 'maintains usability in portrait orientation'
- [ ] **5.4.2** Set viewport to 375px
- [ ] **5.4.3** Render ItemDisplay
- [ ] **5.4.4** Verify language switcher is present
- [ ] **5.4.5** Verify title is present
- [ ] **5.4.6** Verify banner is present
- [ ] **5.4.7** Get body element
- [ ] **5.4.8** Check body.scrollWidth
- [ ] **5.4.9** Verify scrollWidth <= viewport width + 20px (small margin for padding)
- [ ] **5.4.10** Run `npm test mobile` to verify test passes

**Implementation Notes:**
- No horizontal overflow allowed
- Small margin (20px) accounts for padding
- All elements should fit within viewport width

**Verification Steps:**
1. Run test and verify it passes
2. Check that no horizontal scroll appears
3. Verify all content fits within viewport

---

## Phase 6: Test Execution and Verification

### Task 6.1: Run All Mobile Tests

**ID:** **6.1**

Execute all mobile tests and verify they pass.

**Context:** Complete test suite must pass before task is considered complete.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.1.1** Run `npm test mobile` command
- [ ] **6.1.2** Verify all GuestLanguageSwitcher mobile tests pass
- [ ] **6.1.3** Verify all banner mobile tests pass
- [ ] **6.1.4** Verify all view controls mobile tests pass
- [ ] **6.1.5** Verify all integration mobile tests pass
- [ ] **6.1.6** Check exit code is 0 (all tests passed)
- [ ] **6.1.7** Review test output for warnings or errors
- [ ] **6.1.8** Fix any failing tests before proceeding

**Implementation Notes:**
- All mobile tests must pass
- No warnings or errors allowed
- Test output should be clean

**Verification Steps:**
1. Run complete mobile test suite
2. Verify all tests pass
3. Check for any warnings
4. Review test coverage

---

### Task 6.2: Run Full Test Suite

**ID:** **6.2**

Execute complete test suite to ensure no regressions.

**Context:** Mobile tests must not break existing functionality.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.2.1** Run `npm test` command (all tests)
- [ ] **6.2.2** Verify all existing tests still pass
- [ ] **6.2.3** Verify all new mobile tests pass
- [ ] **6.2.4** Check that no new failures introduced
- [ ] **6.2.5** Run `npm run typecheck` to verify TypeScript
- [ ] **6.2.6** Check exit code is 0
- [ ] **6.2.7** Review any warnings or errors

**Implementation Notes:**
- Full suite includes normal tests + mobile tests
- All must pass before committing

**Verification Steps:**
1. Run complete test suite
2. Verify no regressions
3. Check TypeScript compilation
4. Review test output

---

### Task 6.3: Generate Coverage Report

**ID:** **6.3**

Generate coverage report and verify mobile test coverage.

**Context:** Coverage report helps identify untested mobile scenarios.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.3.1** Run `npm run test:coverage` command
- [ ] **6.3.2** Open coverage report (coverage/index.html)
- [ ] **6.3.3** Review coverage for guest components
- [ ] **6.3.4** Check GuestLanguageSwitcher coverage
- [ ] **6.3.5** Check TranslationBanner coverage
- [ ] **6.3.6** Check ViewOriginalToggle coverage
- [ ] **6.3.7** Identify any uncovered mobile scenarios
- [ ] **6.3.8** Add tests for critical gaps if needed
- [ ] **6.3.9** Document coverage metrics

**Implementation Notes:**
- Focus on mobile-specific code paths
- 100% coverage not required, but major scenarios should be covered
- Document any known gaps

**Verification Steps:**
1. Generate and review coverage report
2. Check coverage for guest components
3. Identify gaps
4. Add tests for critical gaps

---

### Task 6.4: Perform Manual Mobile Testing

**ID:** **6.4**

Manually test on real devices or browser dev tools.

**Context:** Automated tests don't catch everything. Manual validation is important.

**Files to modify:**
- None (manual testing only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.4.1** Start dev server: `npm run dev`
- [ ] **6.4.2** Open Chrome DevTools responsive mode
- [ ] **6.4.3** Test at 320px width (small mobile)
- [ ] **6.4.4** Verify language switcher opens and works
- [ ] **6.4.5** Verify banners display correctly
- [ ] **6.4.6** Verify toggle button is touch-friendly
- [ ] **6.4.7** Test at 375px width (medium mobile)
- [ ] **6.4.8** Verify all interactions work smoothly
- [ ] **6.4.9** Test at 768px width (tablet)
- [ ] **6.4.10** Verify layout remains functional
- [ ] **6.4.11** Test with real device if available (iPhone or Android)
- [ ] **6.4.12** Verify no horizontal scrolling
- [ ] **6.4.13** Check that all text is readable
- [ ] **6.4.14** Verify dropdown positioning is correct
- [ ] **6.4.15** Document any issues found

**Implementation Notes:**
- Manual testing catches issues automated tests miss
- Test in multiple browsers if possible
- Real device testing is ideal but dev tools acceptable

**Verification Steps:**
1. Complete all manual test scenarios
2. Document results
3. Create bug tickets for any issues
4. Verify critical paths work

---

## Phase 7: Finalization

### Task 7.1: Update Test Documentation

**ID:** **7.1**

Ensure all test files have clear documentation.

**Context:** Well-documented tests are maintainable tests.

**Files to modify:**
- Edit: All mobile test files

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.1.1** Review all mobile test files for documentation completeness
- [ ] **7.1.2** Verify each describe block has clear description
- [ ] **7.1.3** Verify each test has clear, descriptive name
- [ ] **7.1.4** Add comments for complex test logic where needed
- [ ] **7.1.5** Ensure module-level JSDoc is present
- [ ] **7.1.6** Add usage examples to helper functions
- [ ] **7.1.7** Update README if needed to mention mobile tests

**Implementation Notes:**
- Documentation helps future maintainers
- Clear test names reduce need for extensive comments
- Helper functions should have usage examples

**Verification Steps:**
1. Review all test files for clarity
2. Check that test names are descriptive
3. Verify documentation is helpful
4. Get peer review if available

---

### Task 7.2: Commit Changes

**ID:** **7.2**

Commit all mobile test files with proper message.

**Context:** Follow project git conventions for commits.

**Files to modify:**
- None (git operations only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.2.1** Run `git status` to review changed files
- [ ] **7.2.2** Verify only test files are included (no source code changes)
- [ ] **7.2.3** Run `git add .` to stage all changes
- [ ] **7.2.4** Create commit with message: `[REQ-E04-025] Mobile responsiveness testing`
- [ ] **7.2.5** Add second line: blank
- [ ] **7.2.6** Add third line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- [ ] **7.2.7** Verify commit succeeds
- [ ] **7.2.8** Run `git log` to verify commit appears correctly
- [ ] **7.2.9** Push to remote if appropriate

**Implementation Notes:**
- Follow project commit message format exactly
- Include Co-Authored-By line per project standards
- Only test files should be in commit

**Verification Steps:**
1. Review git status
2. Verify commit message format
3. Check commit appears in log
4. Push if required by workflow

---

## Dependencies

**Depends On (Must Complete First):**
- REQ-E04-008: GuestLanguageSwitcher component must exist
- REQ-E04-009: TranslationBanner component must exist
- REQ-E04-010: MissingTranslationBanner component must exist
- REQ-E04-011: ViewOriginalToggle component must exist
- REQ-E04-012: LanguageIndicator component must exist
- REQ-E04-017: ItemDisplay component with translation support must exist

**Blocks (Cannot Start Until This Completes):**
- None - Testing task doesn't block other work

**Parallel Safety:**
- Safe to run in parallel with REQ-E04-026 (Performance Validation)
- Safe to run in parallel with other testing tasks
- Only creates test files, doesn't modify source code

---

## Technical Context

**Project Stack:**
- Next.js 15 (App Router)
- TypeScript 5.x
- Vitest (testing framework)
- React Testing Library (@testing-library/react)
- @testing-library/user-event

**Key Files:**
- `src/components/guest/GuestLanguageSwitcher.tsx` - Component under test
- `src/components/guest/TranslationBanner.tsx` - Component under test
- `src/components/guest/MissingTranslationBanner.tsx` - Component under test
- `src/components/guest/ViewOriginalToggle.tsx` - Component under test
- `src/components/guest/LanguageIndicator.tsx` - Component under test
- `src/components/ItemDisplay.tsx` - Integration component under test

**Mobile Testing Standards:**
- **Touch Target Size**: Minimum 44x44px (WCAG 2.5.5)
- **Text Legibility**: Minimum 14px for body, 12px for small text
- **Viewport Range**: 320px to 768px width
- **Key Breakpoints**: 320px (small), 375px (medium), 768px (tablet)

---

## Acceptance Criteria Summary

This task is complete when:

1. **Mobile Test Helpers Created:**
   - [ ] Helper utilities file created with viewport simulation
   - [ ] Touch target validation function working
   - [ ] Responsive style checking functions working

2. **Component Tests Written:**
   - [ ] GuestLanguageSwitcher mobile tests (touch targets, positioning, legibility)
   - [ ] TranslationBanner mobile tests (wrapping, touch links)
   - [ ] MissingTranslationBanner mobile tests (legibility, overflow)
   - [ ] ViewOriginalToggle mobile tests (touch targets, icon scaling)
   - [ ] LanguageIndicator mobile tests (visibility, readability)

3. **Integration Tests Written:**
   - [ ] Complete ItemDisplay mobile layout tests
   - [ ] Component stacking verified
   - [ ] Touch interactions verified
   - [ ] No horizontal overflow verified

4. **All Tests Pass:**
   - [ ] Mobile test suite passes: `npm test mobile`
   - [ ] Full test suite passes: `npm test`
   - [ ] No regressions in existing tests
   - [ ] TypeScript compilation succeeds

5. **Touch Target Requirements Met:**
   - [ ] All interactive elements >= 44x44px
   - [ ] Touch target tests verify size requirements

6. **Text Legibility Verified:**
   - [ ] All text >= 14px (body text)
   - [ ] All text >= 12px (small text)
   - [ ] Legibility tests verify at all breakpoints

7. **Manual Testing Complete:**
   - [ ] Tested in Chrome DevTools responsive mode
   - [ ] Tested at 320px, 375px, 768px viewports
   - [ ] Verified no horizontal scrolling
   - [ ] Verified dropdown positioning
   - [ ] Real device testing (if available)

8. **Documentation Complete:**
   - [ ] All tests have clear descriptions
   - [ ] Module documentation added
   - [ ] Helper functions documented with examples

9. **Changes Committed:**
   - [ ] All test files committed with proper message
   - [ ] Co-Authored-By line included

---

## Notes

- **Touch Target Priority:** 44x44px minimum is critical for mobile usability
- **Text Legibility:** 14px minimum ensures readability on small screens
- **Viewport Range:** 320px to 768px covers vast majority of mobile devices
- **No Horizontal Scroll:** Critical for good mobile UX
- **Dropdown Positioning:** Must stay within viewport bounds
- **Component Stacking:** Vertical stacking prevents overlap issues
- **Real Device Testing:** Ideal but dev tools acceptable for validation
- **WCAG Compliance:** Tests verify WCAG 2.5.5 touch target guidelines

---

*Document created: 2026-01-23 00:02*
*Status: PENDING - Ready for implementation by Agent 04*
