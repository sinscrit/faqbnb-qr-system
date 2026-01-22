# Create ViewOriginalToggle Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:58
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #11)
- Overview: docs/REQ-E04-011-create-vieworiginaltoggle-component-overview.md
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

- [ ] **1.1** Create directory at `src/components/guest/ViewOriginalToggle/`
- [ ] **1.2** Verify directory structure matches existing guest component patterns in codebase
- [ ] **1.3** Confirm no naming conflicts with existing components
- [ ] **1.4** Create placeholder `.gitkeep` file if directory tooling requires it (delete after adding actual files)

## 2. Define TypeScript Interfaces and Imports

**Context:** The component is a controlled, stateless button that accepts toggle state (isViewingOriginal), original language, callback function, and optional props. It imports from REQ-E04-001 (l10n types), lucide-react icons, and existing utilities.

**Files to modify:**
- Create: `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add `'use client'` directive at the very top of the file
- [ ] **2.2** Import Languages icon from lucide-react: `import { Languages } from 'lucide-react'`
- [ ] **2.3** Import utility function: `import { cn } from '@/lib/utils'`
- [ ] **2.4** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/types'`
- [ ] **2.5** Define ViewOriginalToggleProps interface with required props: `isViewingOriginal`, `originalLanguage`, `onToggle`
- [ ] **2.6** Add optional props: `className`, `disabled` (default false)
- [ ] **2.7** Add JSDoc comment to interface documenting each prop with @param tags
- [ ] **2.8** Document that isViewingOriginal indicates current view state (true = original, false = translated)
- [ ] **2.9** Document that onToggle callback should toggle between views
- [ ] **2.10** Export the ViewOriginalToggleProps interface for external use
- [ ] **2.11** Verify all imports resolve correctly with TypeScript compiler

## 3. Implement Component Function Signature and JSDoc

**Context:** The component needs comprehensive documentation explaining its purpose within Epic 4 - Guest Experience, its controlled component pattern, and integration with secondary button styling from ActionButtons component.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add module-level JSDoc comment block above component function
- [ ] **3.2** Include description: "Toggle button for switching between translated content and original content"
- [ ] **3.3** Add @component tag to JSDoc
- [ ] **3.4** Add @since tag: "Epic 4 - Guest Experience"
- [ ] **3.5** Add @example block showing typical usage with state management
- [ ] **3.6** Document design decision: Uses secondary button styling consistent with ActionButtons
- [ ] **3.7** Document accessibility features: aria-pressed for toggle state, aria-label for context
- [ ] **3.8** Document controlled component pattern (parent manages state)
- [ ] **3.9** Create component function: `export function ViewOriginalToggle({ isViewingOriginal, originalLanguage, onToggle, className, disabled = false }: ViewOriginalToggleProps)`
- [ ] **3.10** Add JSDoc @param comments for each parameter with descriptions
- [ ] **3.11** Add JSDoc @returns tag describing JSX.Element return type

## 4. Implement Language Name Formatting Helper Function

**Context:** Need to display original language name in button text (e.g., "View in original (English)"). This matches the TranslationBanner and MissingTranslationBanner approach for consistency.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create helper function `formatLanguageName` outside component (module-level) that accepts `SupportedLanguage` and returns string
- [ ] **4.2** Add JSDoc comment explaining this shows English names for all users (consistent with banners)
- [ ] **4.3** Define Record type mapping: `const languageNames: Record<SupportedLanguage, string>`
- [ ] **4.4** Add mapping: `en: 'English'`
- [ ] **4.5** Add mapping: `fr: 'French'`
- [ ] **4.6** Add mapping: `es: 'Spanish'`
- [ ] **4.7** Add mapping: `de: 'German'`
- [ ] **4.8** Add mapping: `nl: 'Dutch'`
- [ ] **4.9** Add mapping: `it: 'Italian'`
- [ ] **4.10** Return language name: `return languageNames[lang]`
- [ ] **4.11** Verify TypeScript correctly infers return type as string

## 5. Implement Dynamic Button Text Logic

**Context:** Button text changes based on current view state. When viewing translated content, show "View in original ([Language])". When viewing original, show "View translation". The text describes the action that will occur on click.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Inside component function, create buttonText variable using ternary operator
- [ ] **5.2** When isViewingOriginal is true, set buttonText to: `'View translation'`
- [ ] **5.3** When isViewingOriginal is false, set buttonText to: `` `View in original (${formatLanguageName(originalLanguage)})` ``
- [ ] **5.4** Use template literal for dynamic language name insertion
- [ ] **5.5** Add comment explaining button text describes action (not current state)
- [ ] **5.6** Verify button text is clear and actionable for all 6 languages
- [ ] **5.7** Test longest language name ("Spanish"/"Italian") to ensure it fits on mobile

## 6. Implement ARIA Label for Accessibility

**Context:** Screen readers need clear context about what the button does. The aria-label provides more detail than the visual button text, explaining the full action that will occur.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Create ariaLabel variable using ternary operator based on isViewingOriginal
- [ ] **6.2** When isViewingOriginal is true, set ariaLabel to: `'Switch to translated version'`
- [ ] **6.3** When isViewingOriginal is false, set ariaLabel to: `` `Switch to original ${formatLanguageName(originalLanguage)} version` ``
- [ ] **6.4** Add comment explaining aria-label provides context for screen readers
- [ ] **6.5** Verify aria-label clearly describes action for all toggle states
- [ ] **6.6** Test with screen reader to ensure label is announced correctly

## 7. Implement Button Element with Base Structure

**Context:** Following ActionButtons secondary variant pattern from SimpleDashboard/ActionButtons.tsx (lines 68-83). Button uses native <button> element with proper type and event handlers.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Create component return statement with `<button>` element
- [ ] **7.2** Add `type="button"` attribute (explicit button type, not submit)
- [ ] **7.3** Add `onClick={onToggle}` event handler
- [ ] **7.4** Add `disabled={disabled}` attribute
- [ ] **7.5** Add `aria-label={ariaLabel}` for screen reader context
- [ ] **7.6** Add `aria-pressed={isViewingOriginal}` to indicate toggle state
- [ ] **7.7** Add comment explaining aria-pressed indicates current toggle state (true/false)
- [ ] **7.8** Verify button element is correctly structured

## 8. Apply Base Button Styling Classes

**Context:** Following exact styling pattern from ActionButtons.tsx. These base classes apply to all button variants and ensure consistent sizing, transitions, and accessibility features (48px touch target for WCAG 2.5.5).

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Start className with cn() utility function
- [ ] **8.2** Add base layout classes: `flex items-center justify-center gap-2`
- [ ] **8.3** Add touch-friendly sizing: `min-h-[48px] px-6 py-3.5`
- [ ] **8.4** Add border radius and typography: `rounded-lg font-medium text-base`
- [ ] **8.5** Add smooth transitions: `transition-all duration-200 ease-out`
- [ ] **8.6** Add focus ring for keyboard users: `focus-visible:outline-none focus-visible:ring-2`
- [ ] **8.7** Add focus ring color: `focus-visible:ring-[#222222] focus-visible:ring-offset-2`
- [ ] **8.8** Add comment indicating these are base classes from ActionButtons pattern
- [ ] **8.9** Verify 48px minimum height meets WCAG touch target requirements

## 9. Apply Secondary Variant Styling Classes

**Context:** Secondary variant uses white background with dark border (outline style) rather than filled primary button. This matches the ActionButtons secondary variant exactly.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Add secondary variant background and border: `bg-white border border-[#222222] text-[#222222]`
- [ ] **9.2** Add hover effect with scale and background: `hover:scale-[1.02] hover:bg-[#F7F7F7]`
- [ ] **9.3** Add active effect with scale: `active:scale-[0.98]`
- [ ] **9.4** Add disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] **9.5** Add className prop at end of cn() for external customization
- [ ] **9.6** Add comment indicating these are secondary variant classes from ActionButtons
- [ ] **9.7** Verify styling matches ActionButtons.tsx exactly
- [ ] **9.8** Test hover and active states work correctly

## 10. Add Languages Icon to Button

**Context:** The Languages icon from lucide-react represents translation/language switching. It's positioned before the button text with appropriate spacing and is marked decorative for screen readers.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Inside button element, add Languages icon: `<Languages className="w-5 h-5" aria-hidden="true" />`
- [ ] **10.2** Add `aria-hidden="true"` attribute to icon (decorative, text conveys meaning)
- [ ] **10.3** Use w-5 h-5 sizing (20px, consistent with other icons)
- [ ] **10.4** Verify gap-2 spacing between icon and text works correctly
- [ ] **10.5** Add comment explaining Languages icon represents translation toggle
- [ ] **10.6** Test icon renders correctly in all browsers
- [ ] **10.7** Verify icon color inherits from text color (text-[#222222])

## 11. Add Button Text Span Element

**Context:** Button text is wrapped in a span for proper layout and potential styling customization. The text comes from the dynamically computed buttonText variable.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** After Languages icon, add span element: `<span>{buttonText}</span>`
- [ ] **11.2** Close button element after span
- [ ] **11.3** Verify button text displays correctly for both states
- [ ] **11.4** Test button text wraps naturally on narrow screens if needed
- [ ] **11.5** Verify language name in parentheses displays correctly for all 6 languages

## 12. Add Export Statements

**Context:** Export the component as default export and named export for flexibility in imports, matching other guest component patterns.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Add named export for the component (already exported inline with function declaration)
- [ ] **12.2** Add default export at bottom of file: `export default ViewOriginalToggle;`
- [ ] **12.3** Verify both import styles work: `import { ViewOriginalToggle } from ...` and `import ViewOriginalToggle from ...`
- [ ] **12.4** Add comment explaining both import styles are supported

## 13. Create Barrel Export File

**Context:** Following the component organization pattern where each component folder has an index.ts file that re-exports the main component and its types for cleaner imports.

**Files to modify:**
- Create: `src/components/guest/ViewOriginalToggle/index.ts`

**Estimated effort:** 1 story point

- [ ] **13.1** Create file at `src/components/guest/ViewOriginalToggle/index.ts`
- [ ] **13.2** Add file-level comment explaining this is a barrel export
- [ ] **13.3** Export component: `export { ViewOriginalToggle } from './ViewOriginalToggle'`
- [ ] **13.4** Export prop types: `export type { ViewOriginalToggleProps } from './ViewOriginalToggle'`
- [ ] **13.5** Add JSDoc comment describing the component for IDE tooltips
- [ ] **13.6** Verify import works: `import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle'`
- [ ] **13.7** Run TypeScript compiler to verify exports resolve correctly

## 14. Write Component Unit Tests - Setup and Basic Rendering

**Context:** Using React Testing Library and Vitest (already installed). Tests should verify rendering, correct button text for both states, ARIA attributes, and visual elements.

**Files to modify:**
- Create: `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Create test file at `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`
- [ ] **14.2** Import necessary testing utilities: `describe`, `it`, `expect`, `vi` from vitest
- [ ] **14.3** Import React Testing Library: `render`, `screen`, `fireEvent` from @testing-library/react
- [ ] **14.4** Import userEvent from @testing-library/user-event for realistic interactions
- [ ] **14.5** Import component under test: `import { ViewOriginalToggle } from '../ViewOriginalToggle'`
- [ ] **14.6** Import type: `import type { SupportedLanguage } from '@/types'`
- [ ] **14.7** Create helper function to render component with default props
- [ ] **14.8** Write test: "renders 'View in original' text when viewing translated (isViewingOriginal=false)"
- [ ] **14.9** Write test: "renders 'View translation' text when viewing original (isViewingOriginal=true)"
- [ ] **14.10** Write test: "includes language name in button text when viewing translated"
- [ ] **14.11** Write test: "applies custom className prop to button"
- [ ] **14.12** Run tests with `npm test` and verify all pass

## 15. Write Component Unit Tests - Language Name Formatting

**Context:** Verify all 6 supported languages display correctly in button text. Test the formatLanguageName helper function indirectly through button text rendering.

**Files to modify:** `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Write test: "displays English in button text when originalLanguage='en'"
- [ ] **15.2** Write test: "displays French in button text when originalLanguage='fr'"
- [ ] **15.3** Write test: "displays Spanish in button text when originalLanguage='es'"
- [ ] **15.4** Write test: "displays German in button text when originalLanguage='de'"
- [ ] **15.5** Write test: "displays Dutch in button text when originalLanguage='nl'"
- [ ] **15.6** Write test: "displays Italian in button text when originalLanguage='it'"
- [ ] **15.7** Write test: "formats all 6 languages correctly in loop test"
- [ ] **15.8** Verify language names are capitalized correctly in button text
- [ ] **15.9** Run tests with `npm test` and verify all pass

## 16. Write Component Unit Tests - Interaction and Callback

**Context:** Test that clicking the button correctly triggers the onToggle callback. Also test keyboard activation (Enter and Space keys).

**Files to modify:** `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Write test: "calls onToggle callback when button clicked"
- [ ] **16.2** Write test: "calls onToggle exactly once per click"
- [ ] **16.3** Write test: "calls onToggle with no arguments"
- [ ] **16.4** Write test: "onToggle is called when Enter key pressed on button"
- [ ] **16.5** Write test: "onToggle is called when Space key pressed on button"
- [ ] **16.6** Use vi.fn() to create mock callback for testing
- [ ] **16.7** Clear mock between tests with beforeEach hook
- [ ] **16.8** Write test: "multiple clicks call callback multiple times"
- [ ] **16.9** Verify callback is required prop (TypeScript enforces this)
- [ ] **16.10** Run tests with `npm test` and verify all pass

## 17. Write Component Unit Tests - Button Styling

**Context:** Verify the button has correct secondary button styling matching ActionButtons component pattern. Test colors, borders, and structural classes.

**Files to modify:** `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Write test: "has white background (bg-white)"
- [ ] **17.2** Write test: "has dark border (border-[#222222])"
- [ ] **17.3** Write test: "has dark text color (text-[#222222])"
- [ ] **17.4** Write test: "has minimum 48px height (min-h-[48px])"
- [ ] **17.5** Write test: "has rounded corners (rounded-lg)"
- [ ] **17.6** Write test: "uses flex layout with items-center"
- [ ] **17.7** Write test: "has gap between icon and text (gap-2)"
- [ ] **17.8** Write test: "includes Languages icon"
- [ ] **17.9** Write test: "Languages icon has correct size (w-5 h-5)"
- [ ] **17.10** Run tests with `npm test` and verify all pass

## 18. Write Component Unit Tests - Accessibility

**Context:** Verify ARIA attributes are correctly applied for screen reader support and toggle state communication. Test keyboard navigation and disabled state.

**Files to modify:** `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx`

**Estimated effort:** 1 story point

- [ ] **18.1** Write test: "button has type='button' attribute"
- [ ] **18.2** Write test: "button has aria-label attribute"
- [ ] **18.3** Write test: "aria-label describes action correctly when viewing translated"
- [ ] **18.4** Write test: "aria-label describes action correctly when viewing original"
- [ ] **18.5** Write test: "aria-pressed is 'false' when isViewingOriginal=false"
- [ ] **18.6** Write test: "aria-pressed is 'true' when isViewingOriginal=true"
- [ ] **18.7** Write test: "Languages icon has aria-hidden='true' attribute"
- [ ] **18.8** Write test: "button is disabled when disabled prop is true"
- [ ] **18.9** Write test: "button is not disabled when disabled prop is false"
- [ ] **18.10** Write test: "disabled button does not call onToggle when clicked"
- [ ] **18.11** Run tests with `npm test` and verify all pass
- [ ] **18.12** Verify test coverage is above 80% with `npm run test:coverage`

## 19. Manual Responsive Design Testing

**Context:** Verify the button works well on different screen sizes. Test button text wrapping with longest language names on narrow viewports.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Test on iPhone SE viewport (375px width) in portrait
- [ ] **19.2** Test on iPhone SE viewport (667px width) in landscape
- [ ] **19.3** Test on standard mobile viewport (390px width) in portrait
- [ ] **19.4** Test on very narrow viewport (320px width - smallest common size)
- [ ] **19.5** Test button text with longest language name ("Spanish"/"English") on 320px width
- [ ] **19.6** Verify button text wraps naturally or stays on one line without overflow
- [ ] **19.7** Test on tablet viewport (768px width) in portrait
- [ ] **19.8** Test on tablet viewport (1024px width) in landscape
- [ ] **19.9** Test on desktop viewport (1440px+ width)
- [ ] **19.10** Verify button maintains 48px minimum height on all sizes
- [ ] **19.11** Test in mobile Safari (iOS) for any specific rendering issues
- [ ] **19.12** Test in Chrome mobile (Android) for any specific rendering issues

## 20. Manual Interactive States Testing

**Context:** Verify hover, active, focus, and disabled states work correctly and provide appropriate visual feedback. Test with mouse, keyboard, and touch interactions.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **20.1** Test hover state: verify scale-up effect (scale-[1.02]) works
- [ ] **20.2** Test hover state: verify background changes to light gray (bg-[#F7F7F7])
- [ ] **20.3** Test active state: verify scale-down effect (scale-[0.98]) works on click
- [ ] **20.4** Test focus state: verify focus ring appears when button is focused via keyboard
- [ ] **20.5** Test focus ring color: verify it's dark (ring-[#222222]) with offset
- [ ] **20.6** Test keyboard navigation: Tab key moves focus to button
- [ ] **20.7** Test keyboard activation: Enter key triggers onToggle
- [ ] **20.8** Test keyboard activation: Space key triggers onToggle
- [ ] **20.9** Test disabled state: verify opacity is reduced (opacity-50)
- [ ] **20.10** Test disabled state: verify cursor changes to not-allowed
- [ ] **20.11** Test disabled state: verify button cannot be clicked
- [ ] **20.12** Test touch interaction on mobile device or touch simulator

## 21. Cross-Browser Testing

**Context:** Ensure the button works correctly across major browsers. Pay special attention to scale effects, focus rings, and icon rendering.

**Files to modify:** None (testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Test in Chrome (latest version) - primary development browser
- [ ] **21.2** Test in Firefox (latest version) - verify scale effects and focus ring
- [ ] **21.3** Test in Safari (latest version) - test on macOS if available
- [ ] **21.4** Test in Edge (latest version) - verify Chromium-based behavior
- [ ] **21.5** Verify white background and dark border render consistently across browsers
- [ ] **21.6** Verify Languages icon from lucide-react renders correctly in all browsers
- [ ] **21.7** Verify scale effects (hover/active) work smoothly across browsers
- [ ] **21.8** Test focus ring appearance across browsers (different default styles)
- [ ] **21.9** Verify disabled state styling works consistently
- [ ] **21.10** Document any browser-specific rendering differences
- [ ] **21.11** Create follow-up tasks for any critical cross-browser issues found

## 22. Accessibility Testing with Screen Readers

**Context:** Verify the button is properly announced by screen readers with correct toggle state and action description. Test with both VoiceOver (Mac/iOS) and NVDA (Windows) if possible.

**Files to modify:** None (manual accessibility testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Test with VoiceOver on macOS: Enable with Cmd+F5
- [ ] **22.2** Verify button is announced as "button" with role
- [ ] **22.3** Verify aria-label is read: "Switch to original [Language] version" or "Switch to translated version"
- [ ] **22.4** Verify aria-pressed state is announced: "pressed" or "not pressed"
- [ ] **22.5** Verify Languages icon is not announced (aria-hidden works)
- [ ] **22.6** Verify button text is not read separately (aria-label takes precedence)
- [ ] **22.7** Test with NVDA on Windows if available (similar verification)
- [ ] **22.8** Verify activation feedback is announced when button is clicked
- [ ] **22.9** Verify disabled state is announced when button is disabled
- [ ] **22.10** Test keyboard navigation: verify focus announcement
- [ ] **22.11** Document any accessibility issues found
- [ ] **22.12** Create follow-up tasks for any accessibility improvements needed

## 23. Visual Comparison with ActionButtons

**Context:** Verify the button styling exactly matches ActionButtons secondary variant. Both buttons should look identical in appearance and behavior.

**Files to modify:** None (visual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Open SimpleDashboard/ActionButtons.tsx to view reference secondary button
- [ ] **23.2** Place ViewOriginalToggle next to ActionButtons secondary variant in test page
- [ ] **23.3** Verify both buttons have identical white background
- [ ] **23.4** Verify both buttons have identical dark border (border-[#222222])
- [ ] **23.5** Verify both buttons have identical text color (text-[#222222])
- [ ] **23.6** Verify both buttons have identical padding and height
- [ ] **23.7** Verify both buttons have identical hover effects (scale and background change)
- [ ] **23.8** Verify both buttons have identical active effects (scale down)
- [ ] **23.9** Verify both buttons have identical focus rings
- [ ] **23.10** Take screenshots of both buttons for documentation
- [ ] **23.11** Document that styling matches ActionButtons pattern exactly

## 24. Component-Level Documentation and Usage Example

**Context:** Add comprehensive in-code documentation with usage examples showing how parent components should integrate this button and manage view state.

**Files to modify:** `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`

**Estimated effort:** 1 story point

- [ ] **24.1** Enhance module-level JSDoc with detailed component description
- [ ] **24.2** Document controlled component pattern (parent manages isViewingOriginal state)
- [ ] **24.3** Document button text behavior for both toggle states
- [ ] **24.4** Add detailed usage example showing state management with useState
- [ ] **24.5** Add example showing integration with TranslationBanner and MissingTranslationBanner
- [ ] **24.6** Document typical parent component structure with view toggle logic
- [ ] **24.7** Add example of className usage for custom spacing and width
- [ ] **24.8** Document integration with other Epic 4 components (banners, language switcher)
- [ ] **24.9** Add note about when button should be displayed (when translation exists)
- [ ] **24.10** Document relationship to REQ-E04-001 (types dependency) and ActionButtons pattern
- [ ] **24.11** Add inline comments explaining key implementation decisions
- [ ] **24.12** Verify documentation renders correctly in IDE tooltips and intellisense

## 25. Create Integration Example Documentation

**Context:** Create a separate example file showing realistic integration scenarios with state management, banner coordination, and content switching logic.

**Files to modify:**
- Create: `src/components/guest/ViewOriginalToggle/__tests__/integration.example.tsx`

**Estimated effort:** 1 story point

- [ ] **25.1** Create example file (not a test, documentation only)
- [ ] **25.2** Add header comment explaining this is an integration example
- [ ] **25.3** Show example of parent component with isViewingOriginal state
- [ ] **25.4** Include example of conditional banner rendering based on view state
- [ ] **25.5** Show example of content switching logic (display original or translated content)
- [ ] **25.6** Demonstrate ViewOriginalToggle with onToggle callback that updates state
- [ ] **25.7** Show integration with TranslationBanner's onViewOriginal callback
- [ ] **25.8** Document coordination between button toggle and banner visibility
- [ ] **25.9** Add comments explaining view state management pattern
- [ ] **25.10** Add reference to this example in main component JSDoc
- [ ] **25.11** Verify example code is valid TypeScript with `npx tsc --noEmit`

## 26. Performance Validation

**Context:** Verify the component renders quickly and button interactions are responsive. The component should be very lightweight with no expensive operations.

**Files to modify:** None (performance testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Measure component initial render time in development mode
- [ ] **26.2** Measure component initial render time in production build
- [ ] **26.3** Verify button click responds instantly (under 50ms)
- [ ] **26.4** Check component bundle size impact with `npm run build` and analyze output
- [ ] **26.5** Verify no unnecessary re-renders with React DevTools Profiler
- [ ] **26.6** Test with 50+ rapid button clicks to verify no memory leaks
- [ ] **26.7** Verify component is pure (same props = same output)
- [ ] **26.8** Test component performance on low-end mobile device or CPU throttling in DevTools
- [ ] **26.9** Verify lucide-react Languages icon doesn't cause bundle bloat (tree-shaking works)
- [ ] **26.10** Compare bundle size impact with other button components
- [ ] **26.11** Document performance metrics and create follow-up optimization tasks if needed

## 27. Visual Regression Testing Preparation

**Context:** Document the expected visual appearance for future visual regression testing. Capture reference screenshots for both toggle states.

**Files to modify:** None (documentation/screenshots)

**Estimated effort:** 1 story point

- [ ] **27.1** Take screenshot of button when viewing translated (isViewingOriginal=false)
- [ ] **27.2** Take screenshot of button when viewing original (isViewingOriginal=true)
- [ ] **27.3** Take screenshot of button in hover state
- [ ] **27.4** Take screenshot of button in focus state (keyboard navigation)
- [ ] **27.5** Take screenshot of button in disabled state
- [ ] **27.6** Take screenshot showing all 6 languages in button text
- [ ] **27.7** Document exact color values: background white, border #222222, text #222222
- [ ] **27.8** Document sizing values: min-h-[48px], px-6, py-3.5, gap-2
- [ ] **27.9** Save screenshots to `src/components/guest/ViewOriginalToggle/__tests__/__screenshots__/` if visual testing configured
- [ ] **27.10** Add note about expected visual appearance in component documentation
- [ ] **27.11** Create baseline for future visual regression tests if tooling available

## 28. Final TypeScript Compilation and Linting

**Context:** Run full TypeScript compilation and linting to ensure no errors were introduced and all code follows project standards.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **28.1** Run full TypeScript compilation: `npx tsc --noEmit`
- [ ] **28.2** Verify no TypeScript errors in component file
- [ ] **28.3** Verify no TypeScript errors in test file
- [ ] **28.4** Verify no TypeScript errors in barrel export file
- [ ] **28.5** Run linter: `npm run lint`
- [ ] **28.6** Fix any linting errors or warnings (preferably none)
- [ ] **28.7** Verify no unused imports in component file
- [ ] **28.8** Verify no unused variables in component file
- [ ] **28.9** Run prettier/formatter if configured in project
- [ ] **28.10** Verify all files follow project code style guidelines

## 29. Build Verification

**Context:** Run a full production build to ensure the component doesn't break the build process and doesn't introduce excessive bundle size.

**Files to modify:** None (build verification)

**Estimated effort:** 1 story point

- [ ] **29.1** Run production build: `npm run build`
- [ ] **29.2** Verify build completes successfully without errors
- [ ] **29.3** Check build output for any warnings related to new component
- [ ] **29.4** Analyze bundle size impact (should be minimal - Languages icon is small)
- [ ] **29.5** Verify component is tree-shakeable (exports are properly structured)
- [ ] **29.6** Check that button styling classes are properly processed by Tailwind
- [ ] **29.7** Test production build locally with `npm run start`
- [ ] **29.8** Verify component works correctly in production mode (no dev-only issues)
- [ ] **29.9** Check browser console for any warnings or errors in production build
- [ ] **29.10** Document build size impact in implementation notes

## 30. Create Component Demo/Storybook (Optional)

**Context:** If the project uses Storybook or a similar component documentation tool, create a story/demo showing the component in both toggle states and various configurations.

**Files to modify:**
- Create: `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.stories.tsx` (if Storybook configured)

**Estimated effort:** 1 story point

- [ ] **30.1** Check if Storybook is configured in the project (look for .storybook directory)
- [ ] **30.2** If Storybook exists, create story file for component
- [ ] **30.3** Create default story: viewing translated content (isViewingOriginal=false)
- [ ] **30.4** Create story: viewing original content (isViewingOriginal=true)
- [ ] **30.5** Create story for each original language (all 6 languages)
- [ ] **30.6** Create story demonstrating disabled state
- [ ] **30.7** Create interactive story with working toggle (uses useState)
- [ ] **30.8** Add controls for interacting with isViewingOriginal and originalLanguage props
- [ ] **30.9** Add action logger for onToggle callback to show when button is clicked
- [ ] **30.10** Add documentation text explaining component purpose and usage
- [ ] **30.11** Test all stories render correctly in Storybook
- [ ] **30.12** If no Storybook, skip this task and note in implementation summary

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Component implementation | Create |
| `src/components/guest/ViewOriginalToggle/index.ts` | Barrel export | Create |
| `src/components/guest/ViewOriginalToggle/__tests__/ViewOriginalToggle.test.tsx` | Unit tests | Create |
| `src/components/guest/ViewOriginalToggle/__tests__/integration.example.tsx` | Integration example (documentation) | Create |
| `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.stories.tsx` | Storybook story (if applicable) | Create |

### Reference Files (Read Only - For Pattern Guidance)

| File | Purpose |
|------|---------|
| `src/components/SimpleDashboard/ActionButtons.tsx` | Secondary button styling pattern (lines 68-83) |
| `src/lib/utils.ts` | Import cn() utility for className merging |
| `src/types/l10n.ts` | Import SupportedLanguage type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage` type

### Blocks (Requires This First)
- **REQ-E04-013** (Create Barrel Exports for Guest Components): Needs this component completed
- **REQ-E04-017** (Update ItemDisplay Component): Will integrate this button into item display

### Parallel Safety
- **Files touched**: New files only (`src/components/guest/ViewOriginalToggle/*`)
- **Conflicts with**: None (new component, no file overlap)
- **Safe to parallelize with**: REQ-E04-008, REQ-E04-009, REQ-E04-010, REQ-E04-012 (all create separate components)

### External Dependencies
- **lucide-react**: Already installed (Languages icon)
- **React**: Already installed (component framework)
- **React Testing Library**: Already installed (for tests)
- **Tailwind CSS**: Already configured in project

## Verification Checklist

Before marking this task as complete, verify:

- [ ] Component renders correctly in development mode
- [ ] Button displays "View in original ([Language])" when viewing translated content
- [ ] Button displays "View translation" when viewing original content
- [ ] Language name displays correctly for all 6 supported languages
- [ ] Languages icon renders correctly before button text
- [ ] Button uses secondary button styling (white background, dark border)
- [ ] Button styling exactly matches ActionButtons secondary variant
- [ ] Hover effect works (scale up, light gray background)
- [ ] Active effect works (scale down on click)
- [ ] Focus ring visible for keyboard users
- [ ] Button has minimum 48px height (WCAG touch target)
- [ ] Button has role="button" and type="button" attributes
- [ ] Button has aria-label describing action
- [ ] Button has aria-pressed indicating toggle state
- [ ] Languages icon has aria-hidden="true" attribute
- [ ] Clicking button calls onToggle callback exactly once
- [ ] Enter key activates button
- [ ] Space key activates button
- [ ] Disabled state works correctly (opacity, cursor, no interaction)
- [ ] Button text wraps naturally on narrow screens
- [ ] Component works on mobile viewports (320px and up)
- [ ] Component works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Screen reader announces button text and toggle state correctly
- [ ] TypeScript compilation passes with no errors: `npx tsc --noEmit`
- [ ] Linting passes with no errors: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage is above 80%: `npm run test:coverage`
- [ ] Production build succeeds: `npm run build`
- [ ] Component is properly exported via barrel export file
- [ ] JSDoc documentation is comprehensive and renders correctly in IDE
- [ ] Custom className prop works correctly for external styling
- [ ] Integration example clearly demonstrates state management and content switching

---

**Last Modified:** 2026-01-22 22:58
**Agent:** Senior Developer - Task Breakdown Specialist
**Status:** PENDING
**Task ID:** 3.4 - Create ViewOriginalToggle Component
**Epic:** 4 - Guest Experience
**Phase:** 3 - Guest UI Components
