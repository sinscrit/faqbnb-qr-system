# Create TranslationBanner Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:51
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #9)
- Overview: docs/REQ-E04-009-create-translationbanner-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

## 1. Create Component Directory Structure

**Context:** Following the existing pattern for guest components where each component has its own directory under `src/components/guest/`. This provides clear organization and makes the component self-contained.

**Files to modify:** None (creating new directory structure)

**Estimated effort:** 1 story point

- [ ] **1.1** Create directory at `src/components/guest/TranslationBanner/`
- [ ] **1.2** Verify directory structure matches existing guest component patterns in codebase
- [ ] **1.3** Confirm no naming conflicts with existing components
- [ ] **1.4** Create placeholder `.gitkeep` file if directory tooling requires it (delete after adding actual files)

## 2. Define TypeScript Interfaces and Imports

**Context:** The component is a controlled, stateless component that accepts source language, a callback for viewing original content, and optional className. It imports from REQ-E04-001 (l10n types), lucide-react icons, and existing utilities.

**Files to modify:**
- Create: `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add `'use client'` directive at the very top of the file
- [ ] **2.2** Import Globe icon from lucide-react: `import { Globe } from 'lucide-react'`
- [ ] **2.3** Import utility function: `import { cn } from '@/lib/utils'`
- [ ] **2.4** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/types'`
- [ ] **2.5** Define TranslationBannerProps interface with required props: `sourceLanguage`, `onViewOriginal`, optional `className`
- [ ] **2.6** Add JSDoc comment to interface documenting each prop with @param tags
- [ ] **2.7** Document that sourceLanguage is the original content language (not display language)
- [ ] **2.8** Document that onViewOriginal callback should switch to original content display
- [ ] **2.9** Export the TranslationBannerProps interface for external use
- [ ] **2.10** Verify all imports resolve correctly with TypeScript compiler

## 3. Implement Component Function Signature and JSDoc

**Context:** The component needs comprehensive documentation explaining its purpose within Epic 4 - Guest Experience, its controlled component pattern, and non-dismissible design decision.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add module-level JSDoc comment block above component function
- [ ] **3.2** Include description: "Banner indicating content is being shown in a translated language with link to view original"
- [ ] **3.3** Add @component tag to JSDoc
- [ ] **3.4** Add @since tag: "Epic 4 - Guest Experience"
- [ ] **3.5** Add @example block showing typical usage with isTranslated conditional rendering
- [ ] **3.6** Document design decision: Non-dismissible to maintain translation context awareness
- [ ] **3.7** Document accessibility features: ARIA status role, keyboard navigation
- [ ] **3.8** Create component function: `export function TranslationBanner({ sourceLanguage, onViewOriginal, className }: TranslationBannerProps)`
- [ ] **3.9** Add JSDoc @param comments for each parameter with descriptions
- [ ] **3.10** Add JSDoc @returns tag describing JSX.Element return type

## 4. Implement Language Name Formatting Function

**Context:** Need to display source language name in English (e.g., "Translated from French"). This is intentionally in English for all users as it's meta-information about content. The function maps SupportedLanguage codes to English names.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create internal function `formatLanguageName` that accepts a `SupportedLanguage` parameter and returns string
- [ ] **4.2** Add JSDoc comment explaining this shows English names for all users (meta-information)
- [ ] **4.3** Define Record type mapping: `const languageNames: Record<SupportedLanguage, string>`
- [ ] **4.4** Add mapping: `en: 'English'`
- [ ] **4.5** Add mapping: `fr: 'French'`
- [ ] **4.6** Add mapping: `es: 'Spanish'`
- [ ] **4.7** Add mapping: `de: 'German'`
- [ ] **4.8** Add mapping: `nl: 'Dutch'`
- [ ] **4.9** Add mapping: `it: 'Italian'`
- [ ] **4.10** Return language name: `return languageNames[lang]`
- [ ] **4.11** Add comment explaining why English names are used (avoids circular translation dependency)
- [ ] **4.12** Verify TypeScript correctly infers return type as string

## 5. Implement Banner Container Structure with ARIA

**Context:** The banner container uses semantic HTML and ARIA attributes for accessibility. Following SessionRecoveryBanner pattern for ARIA status announcements. The container has specific background color (#E3F2FD - Material Design blue-50) as specified in requirements.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Create component return statement with outer `<div>` element
- [ ] **5.2** Add `role="status"` attribute to div (identifies as status message, not alert)
- [ ] **5.3** Add `aria-live="polite"` attribute (announces changes without interrupting user)
- [ ] **5.4** Apply base layout classes: `flex items-center justify-between gap-4`
- [ ] **5.5** Add padding: `p-4`
- [ ] **5.6** Add background color: `bg-[#E3F2FD]` (exact hex value from requirements)
- [ ] **5.7** Add border: `border border-blue-200`
- [ ] **5.8** Add border radius: `rounded-lg`
- [ ] **5.9** Add shadow: `shadow-sm`
- [ ] **5.10** Use cn() utility to merge className prop: `className={cn('...classes...', className)}`
- [ ] **5.11** Add comment explaining #E3F2FD is Material Design blue-50 color
- [ ] **5.12** Verify all ARIA attributes are correctly applied for screen reader testing

## 6. Implement Left Section with Globe Icon and Text

**Context:** The left section contains a globe icon in a circular background and the "Translated from [Language]" text. The icon is decorative (aria-hidden) since the text conveys the meaning.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Create left section wrapper: `<div className="flex items-center gap-3">`
- [ ] **6.2** Create icon container: `<div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">`
- [ ] **6.3** Add Globe icon: `<Globe className="w-5 h-5 text-blue-600" aria-hidden="true" />`
- [ ] **6.4** Add `aria-hidden="true"` to icon (decorative, text conveys meaning)
- [ ] **6.5** Close icon container div
- [ ] **6.6** Create text paragraph: `<p className="text-sm text-blue-900">`
- [ ] **6.7** Add text content: `Translated from <strong>{formatLanguageName(sourceLanguage)}</strong>`
- [ ] **6.8** Use `<strong>` element to emphasize the language name
- [ ] **6.9** Close paragraph element
- [ ] **6.10** Close left section wrapper div
- [ ] **6.11** Verify icon renders correctly in browser
- [ ] **6.12** Verify text formatting with bolded language name

## 7. Implement "View Original" Button

**Context:** The "View original" link is implemented as a button element (not anchor) for semantic correctness. It has hover effects, focus ring for keyboard users, and meets touch target size guidelines (minimum 44x44px).

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Create button element after left section: `<button type="button">`
- [ ] **7.2** Add onClick handler: `onClick={onViewOriginal}`
- [ ] **7.3** Add flex-shrink class to prevent button shrinking: `flex-shrink-0`
- [ ] **7.4** Add text styling: `text-sm font-medium text-blue-700`
- [ ] **7.5** Add hover color change: `hover:text-blue-900`
- [ ] **7.6** Add underline styling: `underline hover:no-underline`
- [ ] **7.7** Add transition: `transition-colors duration-200`
- [ ] **7.8** Add focus outline: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- [ ] **7.9** Add border radius for focus ring: `rounded`
- [ ] **7.10** Add padding for touch targets: `px-2 py-1` (ensures minimum 44px touch area)
- [ ] **7.11** Use cn() to combine all classes
- [ ] **7.12** Add button text content: "View original"
- [ ] **7.13** Close button element
- [ ] **7.14** Test button appearance in default, hover, and focus states

## 8. Add Responsive Layout for Mobile

**Context:** On very small screens (mobile), the banner should stack vertically to prevent text wrapping issues. On tablet and desktop, it remains horizontal with space-between layout.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Update container flex direction for responsive: `flex flex-col sm:flex-row`
- [ ] **8.2** Update alignment for mobile: `items-start sm:items-center`
- [ ] **8.3** Update gap spacing for mobile: `gap-3 sm:gap-4`
- [ ] **8.4** Ensure left section alignment works on mobile (items-start)
- [ ] **8.5** Verify button is easily tappable on mobile (full width on stacked layout)
- [ ] **8.6** Test on 320px viewport (iPhone SE)
- [ ] **8.7** Test on 375px viewport (standard mobile)
- [ ] **8.8** Test on 768px viewport (tablet - should be horizontal)
- [ ] **8.9** Test on 1024px+ viewport (desktop - should be horizontal)
- [ ] **8.10** Verify text doesn't wrap awkwardly at any breakpoint

## 9. Add Export Statement

**Context:** Export the component as default export and named export for flexibility in imports.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Add named export for the component (already exported inline with function declaration)
- [ ] **9.2** Add default export at bottom of file: `export default TranslationBanner;`
- [ ] **9.3** Verify both import styles work: `import { TranslationBanner } from ...` and `import TranslationBanner from ...`
- [ ] **9.4** Add comment explaining both import styles are supported

## 10. Create Barrel Export File

**Context:** Following the component organization pattern where each component folder has an index.ts file that re-exports the main component and its types for cleaner imports.

**Files to modify:**
- Create: `src/components/guest/TranslationBanner/index.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Create file at `src/components/guest/TranslationBanner/index.ts`
- [ ] **10.2** Add file-level comment explaining this is a barrel export
- [ ] **10.3** Export component: `export { TranslationBanner } from './TranslationBanner'`
- [ ] **10.4** Export prop types: `export type { TranslationBannerProps } from './TranslationBanner'`
- [ ] **10.5** Add JSDoc comment describing the component for IDE tooltips
- [ ] **10.6** Verify import works: `import { TranslationBanner } from '@/components/guest/TranslationBanner'`
- [ ] **10.7** Run TypeScript compiler to verify exports resolve correctly

## 11. Write Component Unit Tests - Setup and Basic Rendering

**Context:** Using React Testing Library and Vitest (already installed). Tests should verify rendering, correct source language display, ARIA attributes, and visual elements.

**Files to modify:**
- Create: `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Create test file at `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`
- [ ] **11.2** Import necessary testing utilities: `describe`, `it`, `expect`, `vi` from vitest
- [ ] **11.3** Import React Testing Library: `render`, `screen`, `fireEvent` from @testing-library/react
- [ ] **11.4** Import userEvent from @testing-library/user-event for realistic interactions
- [ ] **11.5** Import component under test: `import { TranslationBanner } from '../TranslationBanner'`
- [ ] **11.6** Import type: `import type { SupportedLanguage } from '@/types'`
- [ ] **11.7** Create helper function to render component with default props
- [ ] **11.8** Write test: "renders with correct source language (French)"
- [ ] **11.9** Write test: "renders with correct source language (Spanish)"
- [ ] **11.10** Write test: "renders with correct source language (German)"
- [ ] **11.11** Write test: "displays 'Translated from' text with language name"
- [ ] **11.12** Write test: "applies custom className prop to container"
- [ ] **11.13** Run tests with `npm test` and verify all pass

## 12. Write Component Unit Tests - Visual Elements

**Context:** Verify the banner has the correct background color, border, icon, and button styling as specified in requirements.

**Files to modify:** `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Write test: "has correct background color (#E3F2FD)"
- [ ] **12.2** Write test: "has border with blue-200 color"
- [ ] **12.3** Write test: "renders Globe icon"
- [ ] **12.4** Write test: "Globe icon has aria-hidden attribute"
- [ ] **12.5** Write test: "language name is bolded (strong element)"
- [ ] **12.6** Write test: "View original button has underline"
- [ ] **12.7** Write test: "View original button has correct text color (blue-700)"
- [ ] **12.8** Write test: "container has rounded corners (rounded-lg)"
- [ ] **12.9** Write test: "container has shadow (shadow-sm)"
- [ ] **12.10** Run tests with `npm test` and verify all pass

## 13. Write Component Unit Tests - Accessibility

**Context:** Verify ARIA attributes are correctly applied for screen reader support and keyboard navigation works properly.

**Files to modify:** `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Write test: "container has role='status' attribute"
- [ ] **13.2** Write test: "container has aria-live='polite' attribute"
- [ ] **13.3** Write test: "View original is a button element (not anchor)"
- [ ] **13.4** Write test: "button has type='button' attribute"
- [ ] **13.5** Write test: "button is keyboard accessible (can be focused)"
- [ ] **13.6** Write test: "button activates with Enter key press"
- [ ] **13.7** Write test: "button activates with Space key press"
- [ ] **13.8** Write test: "button has focus ring classes"
- [ ] **13.9** Verify button text is accessible to screen readers
- [ ] **13.10** Run tests with `npm test` and verify all pass

## 14. Write Component Unit Tests - Interaction and Callback

**Context:** Test that clicking "View original" button correctly triggers the onViewOriginal callback.

**Files to modify:** `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Write test: "calls onViewOriginal callback when button clicked"
- [ ] **14.2** Write test: "calls onViewOriginal exactly once per click"
- [ ] **14.3** Write test: "calls onViewOriginal with no arguments"
- [ ] **14.4** Write test: "onViewOriginal is called when Enter key pressed on button"
- [ ] **14.5** Write test: "onViewOriginal is called when Space key pressed on button"
- [ ] **14.6** Use vi.fn() to create mock callback for testing
- [ ] **14.7** Clear mock between tests with beforeEach hook
- [ ] **14.8** Write test: "multiple clicks call callback multiple times"
- [ ] **14.9** Verify callback is required prop (TypeScript enforces this)
- [ ] **14.10** Run tests with `npm test` and verify all pass
- [ ] **14.11** Verify test coverage is above 80% with `npm run test:coverage`

## 15. Write Component Unit Tests - Responsive Layout

**Context:** Verify the banner layout adapts correctly to different screen sizes (stacked on mobile, horizontal on desktop).

**Files to modify:** `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Write test: "has flex-col class for mobile layout"
- [ ] **15.2** Write test: "has sm:flex-row class for tablet/desktop layout"
- [ ] **15.3** Write test: "has items-start alignment for mobile"
- [ ] **15.4** Write test: "has sm:items-center alignment for tablet/desktop"
- [ ] **15.5** Write test: "button has flex-shrink-0 to prevent shrinking"
- [ ] **15.6** Write test: "container has appropriate gap spacing (gap-3 sm:gap-4)"
- [ ] **15.7** Test using viewport meta tag or CSS media query simulation if available
- [ ] **15.8** Document any manual responsive testing needed
- [ ] **15.9** Run tests with `npm test` and verify all pass

## 16. Manual Responsive Design Testing

**Context:** While automated tests cover class names, manual testing ensures the banner actually works well on different devices and viewports. Test both portrait and landscape orientations.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **16.1** Test on iPhone SE viewport (375px width) in portrait
- [ ] **16.2** Test on iPhone SE viewport (667px width) in landscape
- [ ] **16.3** Test on standard mobile viewport (390px width) in portrait
- [ ] **16.4** Test on tablet viewport (768px width) in portrait
- [ ] **16.5** Test on tablet viewport (1024px width) in landscape
- [ ] **16.6** Test on desktop viewport (1440px+ width)
- [ ] **16.7** Verify banner doesn't extend beyond viewport on narrow screens
- [ ] **16.8** Verify text doesn't wrap awkwardly at any breakpoint
- [ ] **16.9** Verify button is easily tappable on mobile (minimum 44x44px touch target)
- [ ] **16.10** Verify layout transitions smoothly between breakpoints
- [ ] **16.11** Test in mobile Safari (iOS) for any specific rendering issues
- [ ] **16.12** Test in Chrome mobile (Android) for any specific rendering issues

## 17. Cross-Browser Testing

**Context:** Ensure the banner works correctly across major browsers. Pay special attention to focus ring styling, color rendering, and icon display.

**Files to modify:** None (testing)

**Estimated effort:** 1 story point

- [ ] **17.1** Test in Chrome (latest version) - primary development browser
- [ ] **17.2** Test in Firefox (latest version) - verify focus ring and transitions
- [ ] **17.3** Test in Safari (latest version) - test on macOS if available
- [ ] **17.4** Test in Edge (latest version) - verify Chromium-based behavior
- [ ] **17.5** Verify #E3F2FD background color renders consistently across browsers
- [ ] **17.6** Verify Globe icon from lucide-react renders correctly in all browsers
- [ ] **17.7** Verify transitions and hover effects work smoothly across browsers
- [ ] **17.8** Test focus ring appearance across browsers (different default styles)
- [ ] **17.9** Verify underline text-decoration works consistently
- [ ] **17.10** Document any browser-specific rendering differences
- [ ] **17.11** Create follow-up tasks for any critical cross-browser issues found

## 18. Accessibility Testing with Screen Readers

**Context:** Verify the banner is properly announced by screen readers and all interactive elements are accessible. Test with both VoiceOver (Mac/iOS) and NVDA (Windows) if possible.

**Files to modify:** None (manual accessibility testing)

**Estimated effort:** 1 story point

- [ ] **18.1** Test with VoiceOver on macOS: Enable with Cmd+F5
- [ ] **18.2** Verify banner is announced as "status" region
- [ ] **18.3** Verify "Translated from [Language]" text is read correctly
- [ ] **18.4** Verify language name emphasis is conveyed (bold text)
- [ ] **18.5** Verify Globe icon is not announced (aria-hidden works)
- [ ] **18.6** Verify "View original" button is announced as button
- [ ] **18.7** Verify button activation is announced to screen reader
- [ ] **18.8** Test keyboard navigation: Tab to button, Enter/Space to activate
- [ ] **18.9** Test with NVDA on Windows if available (similar verification)
- [ ] **18.10** Verify focus indicator is visible for keyboard users
- [ ] **18.11** Document any accessibility issues found
- [ ] **18.12** Create follow-up tasks for any accessibility improvements needed

## 19. Component-Level Documentation and Usage Example

**Context:** Add comprehensive in-code documentation with usage examples showing how parent components should integrate this banner. Include typical conditional rendering patterns.

**Files to modify:** `src/components/guest/TranslationBanner/TranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **19.1** Enhance module-level JSDoc with detailed component description
- [ ] **19.2** Document controlled component pattern (parent controls visibility)
- [ ] **19.3** Document non-dismissible design decision and rationale
- [ ] **19.4** Add detailed usage example showing conditional rendering with isTranslated check
- [ ] **19.5** Add example showing integration with view mode state (translated vs original)
- [ ] **19.6** Document typical parent component structure and state management
- [ ] **19.7** Add example of className usage for custom spacing (e.g., mb-6)
- [ ] **19.8** Document integration with other Epic 4 components (GuestLanguageSwitcher, ViewOriginalToggle)
- [ ] **19.9** Add note about when banner should/shouldn't be displayed
- [ ] **19.10** Document relationship to REQ-E04-001 (types dependency)
- [ ] **19.11** Add inline comments explaining key implementation decisions
- [ ] **19.12** Verify documentation renders correctly in IDE tooltips and intellisense

## 20. Create Integration Example Documentation

**Context:** Create a separate example file showing realistic integration scenarios with full parent component context. This helps future developers understand how to use the component correctly.

**Files to modify:**
- Create: `src/components/guest/TranslationBanner/__tests__/integration.example.tsx`

**Estimated effort:** 1 story point

- [ ] **20.1** Create example file (not a test, documentation only)
- [ ] **20.2** Add header comment explaining this is an integration example
- [ ] **20.3** Show example of parent component with translation state management
- [ ] **20.4** Include example of conditional rendering (only show when isTranslated && !showOriginal)
- [ ] **20.5** Show example of onViewOriginal callback implementation (setState to toggle view mode)
- [ ] **20.6** Include example with className prop for custom spacing
- [ ] **20.7** Show integration with other guest components (GuestLanguageSwitcher)
- [ ] **20.8** Document common pitfalls or integration issues to watch for
- [ ] **20.9** Add comments explaining why banner shouldn't show when viewing original
- [ ] **20.10** Add reference to this example in main component JSDoc
- [ ] **20.11** Verify example code is valid TypeScript with `npx tsc --noEmit`

## 21. Performance Validation

**Context:** Verify the component renders quickly and doesn't cause performance issues. The component should be lightweight with minimal re-renders.

**Files to modify:** None (performance testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Measure component initial render time in development mode
- [ ] **21.2** Measure component initial render time in production build
- [ ] **21.3** Verify button click responds instantly (under 50ms)
- [ ] **21.4** Check component bundle size impact with `npm run build` and analyze output
- [ ] **21.5** Verify no unnecessary re-renders with React DevTools Profiler
- [ ] **21.6** Test with 50+ rapid button clicks to verify no memory leaks
- [ ] **21.7** Verify component is pure (same props = same output)
- [ ] **21.8** Test component performance on low-end mobile device or CPU throttling in DevTools
- [ ] **21.9** Verify lucide-react Globe icon doesn't cause bundle bloat (tree-shaking works)
- [ ] **21.10** Document performance metrics and create follow-up optimization tasks if needed

## 22. Visual Regression Testing Preparation

**Context:** Document the expected visual appearance for future visual regression testing. Capture reference screenshots if visual testing tools are available.

**Files to modify:** None (documentation/screenshots)

**Estimated effort:** 1 story point

- [ ] **22.1** Take screenshot of banner in default state on desktop viewport
- [ ] **22.2** Take screenshot of banner in default state on mobile viewport (stacked layout)
- [ ] **22.3** Take screenshot of button in hover state
- [ ] **22.4** Take screenshot of button in focus state (keyboard navigation)
- [ ] **22.5** Take screenshot showing all 6 supported languages (one banner per language)
- [ ] **22.6** Document exact hex color values: background #E3F2FD, text blue-900, button blue-700
- [ ] **22.7** Document spacing values: gap-3/4, padding p-4
- [ ] **22.8** Save screenshots to `src/components/guest/TranslationBanner/__tests__/__screenshots__/` if visual testing configured
- [ ] **22.9** Add note about expected visual appearance in component documentation
- [ ] **22.10** Create baseline for future visual regression tests if tooling available

## 23. Final TypeScript Compilation and Linting

**Context:** Run full TypeScript compilation and linting to ensure no errors were introduced and all code follows project standards.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **23.1** Run full TypeScript compilation: `npx tsc --noEmit`
- [ ] **23.2** Verify no TypeScript errors in component file
- [ ] **23.3** Verify no TypeScript errors in test file
- [ ] **23.4** Verify no TypeScript errors in barrel export file
- [ ] **23.5** Run linter: `npm run lint`
- [ ] **23.6** Fix any linting errors or warnings (preferably none)
- [ ] **23.7** Verify no unused imports in component file
- [ ] **23.8** Verify no unused variables in component file
- [ ] **23.9** Run prettier/formatter if configured in project
- [ ] **23.10** Verify all files follow project code style guidelines

## 24. Build Verification

**Context:** Run a full production build to ensure the component doesn't break the build process and doesn't introduce excessive bundle size.

**Files to modify:** None (build verification)

**Estimated effort:** 1 story point

- [ ] **24.1** Run production build: `npm run build`
- [ ] **24.2** Verify build completes successfully without errors
- [ ] **24.3** Check build output for any warnings related to new component
- [ ] **24.4** Analyze bundle size impact (should be minimal - Globe icon is small)
- [ ] **24.5** Verify component is tree-shakeable (exports are properly structured)
- [ ] **24.6** Check that background color hex value doesn't cause encoding issues
- [ ] **24.7** Test production build locally with `npm run start`
- [ ] **24.8** Verify component works correctly in production mode (no dev-only issues)
- [ ] **24.9** Check browser console for any warnings or errors in production build
- [ ] **24.10** Document build size impact in implementation notes

## 25. Create Component Demo/Storybook (Optional)

**Context:** If the project uses Storybook or a similar component documentation tool, create a story/demo showing the component in different states.

**Files to modify:**
- Create: `src/components/guest/TranslationBanner/TranslationBanner.stories.tsx` (if Storybook configured)

**Estimated effort:** 1 story point

- [ ] **25.1** Check if Storybook is configured in the project (look for .storybook directory)
- [ ] **25.2** If Storybook exists, create story file for component
- [ ] **25.3** Create default story showing banner with English source language
- [ ] **25.4** Create story for each supported language (French, Spanish, German, Dutch, Italian)
- [ ] **25.5** Create story demonstrating custom className usage (different margin/padding)
- [ ] **25.6** Create story showing mobile responsive layout (narrow viewport)
- [ ] **25.7** Add controls for interacting with sourceLanguage prop
- [ ] **25.8** Add action logger for onViewOriginal callback to show when clicked
- [ ] **25.9** Add documentation text explaining component purpose and usage
- [ ] **25.10** Test all stories render correctly in Storybook
- [ ] **25.11** If no Storybook, skip this task and note in implementation summary

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/guest/TranslationBanner/TranslationBanner.tsx` | Component implementation | Create |
| `src/components/guest/TranslationBanner/index.ts` | Barrel export | Create |
| `src/components/guest/TranslationBanner/__tests__/TranslationBanner.test.tsx` | Unit tests | Create |
| `src/components/guest/TranslationBanner/__tests__/integration.example.tsx` | Integration example (documentation) | Create |
| `src/components/guest/TranslationBanner/TranslationBanner.stories.tsx` | Storybook story (if applicable) | Create |

### Reference Files (Read Only - For Pattern Guidance)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Banner pattern reference, ARIA attributes |
| `src/lib/utils.ts` | Import cn() utility for className merging |
| `src/types/l10n.ts` | Import SupportedLanguage type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage` type

### Blocks (Requires This First)
- **REQ-E04-013** (Create Barrel Exports for Guest Components): Needs this component completed
- **REQ-E04-017** (Update ItemDisplay Component): Will integrate this banner into item display

### Parallel Safety
- **Files touched**: New files only (`src/components/guest/TranslationBanner/*`)
- **Conflicts with**: None (new component, no file overlap)
- **Safe to parallelize with**: REQ-E04-008, REQ-E04-010, REQ-E04-011, REQ-E04-012 (all create separate components)

### External Dependencies
- **lucide-react**: Already installed (Globe icon)
- **React**: Already installed (component framework)
- **React Testing Library**: Already installed (for tests)
- **Tailwind CSS**: Already configured in project

## Verification Checklist

Before marking this task as complete, verify:

- [ ] Component renders correctly in development mode
- [ ] Background color is exactly #E3F2FD (Material Design blue-50)
- [ ] Globe icon displays correctly with blue-600 color
- [ ] Source language name displays correctly for all 6 supported languages
- [ ] Language name is bold (using strong element)
- [ ] "View original" button is styled as underlined text link
- [ ] Button changes color on hover (blue-700 to blue-900)
- [ ] Button has visible focus ring for keyboard users
- [ ] Clicking button calls onViewOriginal callback exactly once
- [ ] Button is keyboard accessible (Tab, Enter, Space work correctly)
- [ ] Banner has role="status" attribute
- [ ] Banner has aria-live="polite" attribute
- [ ] Globe icon has aria-hidden="true" attribute
- [ ] Banner stacks vertically on mobile (flex-col)
- [ ] Banner is horizontal on tablet/desktop (sm:flex-row)
- [ ] Touch targets are at least 44px for mobile accessibility
- [ ] Component works on mobile viewports (375px and up)
- [ ] Component works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Screen reader announces banner content correctly
- [ ] TypeScript compilation passes with no errors: `npx tsc --noEmit`
- [ ] Linting passes with no errors: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage is above 80%: `npm run test:coverage`
- [ ] Production build succeeds: `npm run build`
- [ ] Component is properly exported via barrel export file
- [ ] JSDoc documentation is comprehensive and renders correctly in IDE
- [ ] Custom className prop works correctly for external styling
- [ ] Integration example is clear and demonstrates correct usage

---

**Last Modified:** 2026-01-22 22:51
**Agent:** Senior Developer - Task Breakdown Specialist
**Status:** PENDING
**Task ID:** 3.2 - Create TranslationBanner Component
**Epic:** 4 - Guest Experience
**Phase:** 3 - Guest UI Components
