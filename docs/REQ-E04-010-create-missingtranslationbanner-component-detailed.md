# Create MissingTranslationBanner Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:55
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #10)
- Overview: docs/REQ-E04-010-create-missingtranslationbanner-component-overview.md
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

- [ ] **1.1** Create directory at `src/components/guest/MissingTranslationBanner/`
- [ ] **1.2** Verify directory structure matches existing guest component patterns in codebase
- [ ] **1.3** Confirm no naming conflicts with existing components
- [ ] **1.4** Create placeholder `.gitkeep` file if directory tooling requires it (delete after adding actual files)

## 2. Define TypeScript Interfaces and Imports

**Context:** The component is a stateless, presentational component that accepts requested language, fallback language, and optional className. It imports from REQ-E04-001 (l10n types), lucide-react icons, and existing utilities. Unlike TranslationBanner, this has no callbacks - it's purely informational.

**Files to modify:**
- Create: `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add `'use client'` directive at the very top of the file
- [ ] **2.2** Import Info icon from lucide-react: `import { Info } from 'lucide-react'`
- [ ] **2.3** Import utility function: `import { cn } from '@/lib/utils'`
- [ ] **2.4** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/types'`
- [ ] **2.5** Define MissingTranslationBannerProps interface with required props: `requestedLanguage`, `fallbackLanguage`, optional `className`
- [ ] **2.6** Add JSDoc comment to interface documenting each prop with @param tags
- [ ] **2.7** Document that requestedLanguage is the language user wanted but is unavailable
- [ ] **2.8** Document that fallbackLanguage is the language being displayed instead
- [ ] **2.9** Export the MissingTranslationBannerProps interface for external use
- [ ] **2.10** Verify all imports resolve correctly with TypeScript compiler

## 3. Implement Component Function Signature and JSDoc

**Context:** The component needs comprehensive documentation explaining its purpose within Epic 4 - Guest Experience, its muted design philosophy, and when it should be displayed (fallback scenarios only).

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add module-level JSDoc comment block above component function
- [ ] **3.2** Include description: "Banner displaying when requested translation is not available and content is shown in a fallback language"
- [ ] **3.3** Add @component tag to JSDoc
- [ ] **3.4** Add @since tag: "Epic 4 - Guest Experience"
- [ ] **3.5** Add @example block showing typical usage with fallback language conditional
- [ ] **3.6** Document design decision: Muted gray styling to inform without alarming users
- [ ] **3.7** Document difference from TranslationBanner: No action button, purely informational
- [ ] **3.8** Document accessibility features: ARIA status role, polite announcements
- [ ] **3.9** Create component function: `export function MissingTranslationBanner({ requestedLanguage, fallbackLanguage, className }: MissingTranslationBannerProps)`
- [ ] **3.10** Add JSDoc @param comments for each parameter with descriptions
- [ ] **3.11** Add JSDoc @returns tag describing JSX.Element return type

## 4. Implement Language Name Formatting Function

**Context:** Need to display both requested and fallback language names in English (e.g., "French translation not available. Showing content in English."). This matches the TranslationBanner approach and keeps the banner text clear for all users.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create internal function `formatLanguageName` that accepts a `SupportedLanguage` parameter and returns string
- [ ] **4.2** Add JSDoc comment explaining this shows English names for all users (consistent with TranslationBanner)
- [ ] **4.3** Define Record type mapping: `const languageNames: Record<SupportedLanguage, string>`
- [ ] **4.4** Add mapping: `en: 'English'`
- [ ] **4.5** Add mapping: `fr: 'French'`
- [ ] **4.6** Add mapping: `es: 'Spanish'`
- [ ] **4.7** Add mapping: `de: 'German'`
- [ ] **4.8** Add mapping: `nl: 'Dutch'`
- [ ] **4.9** Add mapping: `it: 'Italian'`
- [ ] **4.10** Return language name: `return languageNames[lang]`
- [ ] **4.11** Create variables for formatted names: `const requestedLangName = formatLanguageName(requestedLanguage)`
- [ ] **4.12** Create variables for formatted names: `const fallbackLangName = formatLanguageName(fallbackLanguage)`
- [ ] **4.13** Verify TypeScript correctly infers return type as string

## 5. Implement Banner Container Structure with ARIA

**Context:** The banner container uses semantic HTML and ARIA attributes for accessibility. Following SessionRecoveryBanner pattern for ARIA status announcements. The container has muted gray styling (bg-gray-50, border-gray-200) as specified to avoid alarming users.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Create component return statement with outer `<div>` element
- [ ] **5.2** Add `role="status"` attribute to div (identifies as status message, not alert/warning)
- [ ] **5.3** Add `aria-live="polite"` attribute (announces changes without interrupting user)
- [ ] **5.4** Apply base layout classes: `flex items-center gap-3`
- [ ] **5.5** Add padding: `p-4`
- [ ] **5.6** Add background color: `bg-gray-50` (muted light gray)
- [ ] **5.7** Add border: `border border-gray-200` (subtle gray border)
- [ ] **5.8** Add border radius: `rounded-lg`
- [ ] **5.9** Add shadow: `shadow-sm`
- [ ] **5.10** Use cn() utility to merge className prop: `className={cn('...classes...', className)}`
- [ ] **5.11** Add comment explaining muted gray colors are intentional (inform without alarm)
- [ ] **5.12** Verify all ARIA attributes are correctly applied for screen reader testing

## 6. Implement Info Icon with Gray Styling

**Context:** The Info icon is rendered in a circular gray background to complement the muted styling. Unlike TranslationBanner's Globe icon, this uses Info to convey neutral informational message without suggesting success or active translation.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Create icon container: `<div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">`
- [ ] **6.2** Add Info icon: `<Info className="w-5 h-5 text-gray-500" aria-hidden="true" />`
- [ ] **6.3** Add `aria-hidden="true"` to icon (decorative, text conveys meaning)
- [ ] **6.4** Use gray-500 color for icon (medium gray, muted but visible)
- [ ] **6.5** Use gray-100 background for icon container (slightly darker than banner background)
- [ ] **6.6** Verify icon sizing matches TranslationBanner pattern (w-5 h-5)
- [ ] **6.7** Close icon container div
- [ ] **6.8** Verify icon renders correctly in browser with muted appearance
- [ ] **6.9** Test icon visibility against gray-50 background (should be clearly visible)

## 7. Implement Message Text with Language Names

**Context:** The message follows the format: "[Requested Language] translation not available. Showing content in [Fallback Language]." Both language names are bolded with <strong> tags for emphasis and easier scanning. Text color is gray-600 for readability on gray-50 background.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Create text paragraph: `<p className="text-sm text-gray-600">`
- [ ] **7.2** Add first part of message: `<strong>{requestedLangName}</strong> translation not available.`
- [ ] **7.3** Add space between sentences
- [ ] **7.4** Add second part of message: `Showing content in <strong>{fallbackLangName}</strong>.`
- [ ] **7.5** Use `<strong>` elements to bold both language names for emphasis
- [ ] **7.6** Ensure proper spacing and punctuation (period after each sentence)
- [ ] **7.7** Close paragraph element
- [ ] **7.8** Close banner container div
- [ ] **7.9** Verify message format is grammatically correct
- [ ] **7.10** Test with all 6 language combinations to ensure natural reading
- [ ] **7.11** Verify text wraps naturally on narrow screens without awkward breaks

## 8. Add Export Statements

**Context:** Export the component as default export and named export for flexibility in imports, matching TranslationBanner pattern.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Add named export for the component (already exported inline with function declaration)
- [ ] **8.2** Add default export at bottom of file: `export default MissingTranslationBanner;`
- [ ] **8.3** Verify both import styles work: `import { MissingTranslationBanner } from ...` and `import MissingTranslationBanner from ...`
- [ ] **8.4** Add comment explaining both import styles are supported

## 9. Create Barrel Export File

**Context:** Following the component organization pattern where each component folder has an index.ts file that re-exports the main component and its types for cleaner imports.

**Files to modify:**
- Create: `src/components/guest/MissingTranslationBanner/index.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Create file at `src/components/guest/MissingTranslationBanner/index.ts`
- [ ] **9.2** Add file-level comment explaining this is a barrel export
- [ ] **9.3** Export component: `export { MissingTranslationBanner } from './MissingTranslationBanner'`
- [ ] **9.4** Export prop types: `export type { MissingTranslationBannerProps } from './MissingTranslationBanner'`
- [ ] **9.5** Add JSDoc comment describing the component for IDE tooltips
- [ ] **9.6** Verify import works: `import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner'`
- [ ] **9.7** Run TypeScript compiler to verify exports resolve correctly

## 10. Verify Color Contrast for Accessibility

**Context:** Muted gray colors must still meet WCAG AA contrast standards. The text-gray-600 on bg-gray-50 combination should provide a 4.5:1 contrast ratio (AA standard). This is a critical accessibility requirement.

**Files to modify:** None (verification task)

**Estimated effort:** 1 story point

- [ ] **10.1** Use WebAIM Contrast Checker or similar tool to verify text-gray-600 (#4B5563) on bg-gray-50 (#F9FAFB)
- [ ] **10.2** Confirm contrast ratio is at least 4.5:1 (WCAG AA standard for normal text)
- [ ] **10.3** Test with Chrome DevTools color picker contrast ratio feature
- [ ] **10.4** Verify strong tags (bold text) maintain adequate contrast
- [ ] **10.5** Test icon visibility: text-gray-500 (#6B7280) on bg-gray-100 (#F3F4F6)
- [ ] **10.6** Document actual contrast ratios in implementation notes
- [ ] **10.7** If contrast fails, adjust colors: consider text-gray-700 for text or bg-gray-25 for background
- [ ] **10.8** Re-verify after any color adjustments
- [ ] **10.9** Test appearance in light mode (primary use case)
- [ ] **10.10** Document final color choices with rationale

## 11. Write Component Unit Tests - Setup and Basic Rendering

**Context:** Using React Testing Library and Vitest (already installed). Tests should verify rendering, correct language names, ARIA attributes, and visual elements.

**Files to modify:**
- Create: `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Create test file at `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`
- [ ] **11.2** Import necessary testing utilities: `describe`, `it`, `expect` from vitest
- [ ] **11.3** Import React Testing Library: `render`, `screen` from @testing-library/react
- [ ] **11.4** Import component under test: `import { MissingTranslationBanner } from '../MissingTranslationBanner'`
- [ ] **11.5** Import type: `import type { SupportedLanguage } from '@/types'`
- [ ] **11.6** Create helper function to render component with default props
- [ ] **11.7** Write test: "renders with correct requested language name (French)"
- [ ] **11.8** Write test: "renders with correct fallback language name (English)"
- [ ] **11.9** Write test: "displays 'translation not available' message"
- [ ] **11.10** Write test: "displays 'Showing content in' message"
- [ ] **11.11** Write test: "applies custom className prop to container"
- [ ] **11.12** Run tests with `npm test` and verify all pass

## 12. Write Component Unit Tests - Language Name Formatting

**Context:** Verify all 6 supported languages are formatted correctly when used as either requested or fallback language. This ensures the language name mapping function works for all combinations.

**Files to modify:** `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Write test: "formats English language name correctly"
- [ ] **12.2** Write test: "formats French language name correctly"
- [ ] **12.3** Write test: "formats Spanish language name correctly"
- [ ] **12.4** Write test: "formats German language name correctly"
- [ ] **12.5** Write test: "formats Dutch language name correctly"
- [ ] **12.6** Write test: "formats Italian language name correctly"
- [ ] **12.7** Write test: "handles all language combinations (loop through all 6 as requested lang)"
- [ ] **12.8** Write test: "handles all language combinations (loop through all 6 as fallback lang)"
- [ ] **12.9** Verify language names are capitalized correctly
- [ ] **12.10** Run tests with `npm test` and verify all pass

## 13. Write Component Unit Tests - Visual Elements and Styling

**Context:** Verify the banner has the correct muted gray colors, border, icon, and text styling as specified in requirements. This ensures the intentional muted design is implemented correctly.

**Files to modify:** `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Write test: "has correct muted background color (bg-gray-50)"
- [ ] **13.2** Write test: "has border with gray-200 color"
- [ ] **13.3** Write test: "renders Info icon"
- [ ] **13.4** Write test: "Info icon has aria-hidden attribute"
- [ ] **13.5** Write test: "icon has gray-500 color (text-gray-500)"
- [ ] **13.6** Write test: "icon container has gray-100 background (bg-gray-100)"
- [ ] **13.7** Write test: "language names are bolded (strong elements)"
- [ ] **13.8** Write test: "text has gray-600 color (text-gray-600)"
- [ ] **13.9** Write test: "container has rounded corners (rounded-lg)"
- [ ] **13.10** Write test: "container has shadow (shadow-sm)"
- [ ] **13.11** Write test: "uses flex layout with items-center"
- [ ] **13.12** Run tests with `npm test` and verify all pass

## 14. Write Component Unit Tests - Accessibility

**Context:** Verify ARIA attributes are correctly applied for screen reader support. Unlike TranslationBanner, this component has no interactive elements, so focus is on status announcements.

**Files to modify:** `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Write test: "container has role='status' attribute"
- [ ] **14.2** Write test: "container has aria-live='polite' attribute"
- [ ] **14.3** Write test: "Info icon has aria-hidden='true' attribute"
- [ ] **14.4** Write test: "no interactive elements present (purely informational)"
- [ ] **14.5** Write test: "text content is accessible to screen readers"
- [ ] **14.6** Write test: "strong tags are properly structured for emphasis"
- [ ] **14.7** Verify message structure is logical for screen reader linearization
- [ ] **14.8** Run tests with `npm test` and verify all pass
- [ ] **14.9** Verify test coverage is above 80% with `npm run test:coverage`

## 15. Write Component Unit Tests - Message Format Variations

**Context:** Test various language combinations to ensure the message format is always grammatically correct and clear. This includes edge cases like same language for both params (should not happen in practice but should not break).

**Files to modify:** `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Write test: "message format for French → English fallback"
- [ ] **15.2** Write test: "message format for Spanish → English fallback"
- [ ] **15.3** Write test: "message format for German → French fallback (non-English fallback)"
- [ ] **15.4** Write test: "message format for Dutch → English fallback"
- [ ] **15.5** Write test: "message format for Italian → English fallback"
- [ ] **15.6** Write test: "both language names are present in message"
- [ ] **15.7** Write test: "message contains 'not available' text"
- [ ] **15.8** Write test: "message contains 'Showing content in' text"
- [ ] **15.9** Write test: "message ends with period"
- [ ] **15.10** Run tests with `npm test` and verify all pass

## 16. Manual Responsive Design Testing

**Context:** Verify the banner layout works well on different screen sizes. Unlike TranslationBanner which stacks vertically on mobile, this banner uses a single row layout that should work on all sizes with natural text wrapping.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **16.1** Test on iPhone SE viewport (375px width) in portrait
- [ ] **16.2** Test on iPhone SE viewport (667px width) in landscape
- [ ] **16.3** Test on standard mobile viewport (390px width) in portrait
- [ ] **16.4** Test on very narrow viewport (320px width - smallest common size)
- [ ] **16.5** Test on tablet viewport (768px width) in portrait
- [ ] **16.6** Test on tablet viewport (1024px width) in landscape
- [ ] **16.7** Test on desktop viewport (1440px+ width)
- [ ] **16.8** Verify text wraps naturally without awkward line breaks
- [ ] **16.9** Verify icon remains aligned at top when text wraps to multiple lines
- [ ] **16.10** Verify banner doesn't extend beyond viewport on narrow screens
- [ ] **16.11** Test in mobile Safari (iOS) for any specific rendering issues
- [ ] **16.12** Test in Chrome mobile (Android) for any specific rendering issues

## 17. Cross-Browser Testing

**Context:** Ensure the banner works correctly across major browsers. Pay special attention to gray color rendering consistency and icon display.

**Files to modify:** None (testing)

**Estimated effort:** 1 story point

- [ ] **17.1** Test in Chrome (latest version) - primary development browser
- [ ] **17.2** Test in Firefox (latest version) - verify gray colors render consistently
- [ ] **17.3** Test in Safari (latest version) - test on macOS if available
- [ ] **17.4** Test in Edge (latest version) - verify Chromium-based behavior
- [ ] **17.5** Verify gray-50 background color renders consistently across browsers
- [ ] **17.6** Verify gray-600 text color renders consistently across browsers
- [ ] **17.7** Verify Info icon from lucide-react renders correctly in all browsers
- [ ] **17.8** Verify shadow-sm renders consistently
- [ ] **17.9** Verify border-gray-200 renders consistently
- [ ] **17.10** Document any browser-specific rendering differences
- [ ] **17.11** Create follow-up tasks for any critical cross-browser issues found

## 18. Accessibility Testing with Screen Readers

**Context:** Verify the banner is properly announced by screen readers and conveys the missing translation information clearly. Test with both VoiceOver (Mac/iOS) and NVDA (Windows) if possible.

**Files to modify:** None (manual accessibility testing)

**Estimated effort:** 1 story point

- [ ] **18.1** Test with VoiceOver on macOS: Enable with Cmd+F5
- [ ] **18.2** Verify banner is announced as "status" region
- [ ] **18.3** Verify full message is read: "[Language] translation not available. Showing content in [Language]."
- [ ] **18.4** Verify language names are emphasized appropriately (strong tags)
- [ ] **18.5** Verify Info icon is not announced (aria-hidden works)
- [ ] **18.6** Verify announcement is polite (doesn't interrupt current reading)
- [ ] **18.7** Test with NVDA on Windows if available (similar verification)
- [ ] **18.8** Verify message is clear and understandable when read aloud
- [ ] **18.9** Test that banner appearance doesn't disrupt navigation flow
- [ ] **18.10** Document any accessibility issues found
- [ ] **18.11** Create follow-up tasks for any accessibility improvements needed

## 19. Visual Comparison with TranslationBanner

**Context:** Verify the visual difference between MissingTranslationBanner (gray, muted) and TranslationBanner (blue, positive) is clear and appropriate. Both banners should feel cohesive but convey different tones.

**Files to modify:** None (visual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Place both banners side by side in browser for visual comparison
- [ ] **19.2** Verify MissingTranslationBanner is clearly more muted than TranslationBanner
- [ ] **19.3** Verify gray tones convey neutral/informational tone (not alarm)
- [ ] **19.4** Verify blue tones in TranslationBanner convey positive/successful tone
- [ ] **19.5** Verify both banners use similar layout structure (consistent design language)
- [ ] **19.6** Verify icon sizes are consistent (both w-5 h-5)
- [ ] **19.7** Verify text sizes are consistent (both text-sm)
- [ ] **19.8** Verify both use similar padding and spacing
- [ ] **19.9** Take screenshots of both banners for documentation
- [ ] **19.10** Document design rationale for color choices in implementation notes

## 20. Component-Level Documentation and Usage Example

**Context:** Add comprehensive in-code documentation with usage examples showing how parent components should integrate this banner and when it should be displayed vs. TranslationBanner.

**Files to modify:** `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`

**Estimated effort:** 1 story point

- [ ] **20.1** Enhance module-level JSDoc with detailed component description
- [ ] **20.2** Document when to show this banner vs. TranslationBanner
- [ ] **20.3** Document muted design philosophy and rationale
- [ ] **20.4** Add detailed usage example showing conditional rendering based on fallback detection
- [ ] **20.5** Add example showing mutual exclusivity with TranslationBanner
- [ ] **20.6** Document typical parent component structure and translation metadata requirements
- [ ] **20.7** Add example of className usage for custom spacing (e.g., mb-6)
- [ ] **20.8** Document integration with other Epic 4 components (GuestLanguageSwitcher)
- [ ] **20.9** Add note about when banner should/shouldn't be displayed
- [ ] **20.10** Document relationship to REQ-E04-001 (types dependency) and REQ-E04-009 (TranslationBanner)
- [ ] **20.11** Add inline comments explaining key implementation decisions
- [ ] **20.12** Verify documentation renders correctly in IDE tooltips and intellisense

## 21. Create Integration Example Documentation

**Context:** Create a separate example file showing realistic integration scenarios with both MissingTranslationBanner and TranslationBanner. This demonstrates the mutual exclusivity logic and typical state management patterns.

**Files to modify:**
- Create: `src/components/guest/MissingTranslationBanner/__tests__/integration.example.tsx`

**Estimated effort:** 1 story point

- [ ] **21.1** Create example file (not a test, documentation only)
- [ ] **21.2** Add header comment explaining this is an integration example
- [ ] **21.3** Show example of parent component with translation metadata
- [ ] **21.4** Include example of conditional rendering: show MissingTranslationBanner when `requestedLang !== displayLang`
- [ ] **21.5** Include example of conditional rendering: show TranslationBanner when `isTranslated && requestedLang === displayLang`
- [ ] **21.6** Show example of mutual exclusivity logic (only one banner at a time)
- [ ] **21.7** Demonstrate integration with GuestLanguageSwitcher
- [ ] **21.8** Document logic for determining fallback scenarios
- [ ] **21.9** Add comments explaining why only one banner should display at a time
- [ ] **21.10** Add reference to this example in main component JSDoc
- [ ] **21.11** Verify example code is valid TypeScript with `npx tsc --noEmit`

## 22. Performance Validation

**Context:** Verify the component renders quickly and doesn't cause performance issues. The component should be very lightweight with no interactive elements or state.

**Files to modify:** None (performance testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Measure component initial render time in development mode
- [ ] **22.2** Measure component initial render time in production build
- [ ] **22.3** Check component bundle size impact with `npm run build` and analyze output
- [ ] **22.4** Verify no unnecessary re-renders with React DevTools Profiler
- [ ] **22.5** Verify component is pure (same props = same output)
- [ ] **22.6** Test component performance on low-end mobile device or CPU throttling in DevTools
- [ ] **22.7** Verify lucide-react Info icon doesn't cause bundle bloat (tree-shaking works)
- [ ] **22.8** Compare bundle size impact with TranslationBanner (should be similar or smaller)
- [ ] **22.9** Verify no memory leaks with rapid prop changes
- [ ] **22.10** Document performance metrics and create follow-up optimization tasks if needed

## 23. Visual Regression Testing Preparation

**Context:** Document the expected visual appearance for future visual regression testing. Capture reference screenshots if visual testing tools are available.

**Files to modify:** None (documentation/screenshots)

**Estimated effort:** 1 story point

- [ ] **23.1** Take screenshot of banner in default state on desktop viewport
- [ ] **23.2** Take screenshot of banner in default state on mobile viewport
- [ ] **23.3** Take screenshot showing all 6 languages as requested language
- [ ] **23.4** Take screenshot showing all 6 languages as fallback language
- [ ] **23.5** Take screenshot of banner with text wrapping on narrow viewport
- [ ] **23.6** Document exact color values: background gray-50, text gray-600, icon gray-500
- [ ] **23.7** Document spacing values: gap-3, padding p-4
- [ ] **23.8** Save screenshots to `src/components/guest/MissingTranslationBanner/__tests__/__screenshots__/` if visual testing configured
- [ ] **23.9** Add note about expected visual appearance in component documentation
- [ ] **23.10** Create baseline for future visual regression tests if tooling available

## 24. Final TypeScript Compilation and Linting

**Context:** Run full TypeScript compilation and linting to ensure no errors were introduced and all code follows project standards.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **24.1** Run full TypeScript compilation: `npx tsc --noEmit`
- [ ] **24.2** Verify no TypeScript errors in component file
- [ ] **24.3** Verify no TypeScript errors in test file
- [ ] **24.4** Verify no TypeScript errors in barrel export file
- [ ] **24.5** Run linter: `npm run lint`
- [ ] **24.6** Fix any linting errors or warnings (preferably none)
- [ ] **24.7** Verify no unused imports in component file
- [ ] **24.8** Verify no unused variables in component file
- [ ] **24.9** Run prettier/formatter if configured in project
- [ ] **24.10** Verify all files follow project code style guidelines

## 25. Build Verification

**Context:** Run a full production build to ensure the component doesn't break the build process and doesn't introduce excessive bundle size.

**Files to modify:** None (build verification)

**Estimated effort:** 1 story point

- [ ] **25.1** Run production build: `npm run build`
- [ ] **25.2** Verify build completes successfully without errors
- [ ] **25.3** Check build output for any warnings related to new component
- [ ] **25.4** Analyze bundle size impact (should be minimal - Info icon is small)
- [ ] **25.5** Verify component is tree-shakeable (exports are properly structured)
- [ ] **25.6** Check that gray color classes don't cause encoding issues
- [ ] **25.7** Test production build locally with `npm run start`
- [ ] **25.8** Verify component works correctly in production mode (no dev-only issues)
- [ ] **25.9** Check browser console for any warnings or errors in production build
- [ ] **25.10** Document build size impact in implementation notes

## 26. Create Component Demo/Storybook (Optional)

**Context:** If the project uses Storybook or a similar component documentation tool, create a story/demo showing the component with different language combinations.

**Files to modify:**
- Create: `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.stories.tsx` (if Storybook configured)

**Estimated effort:** 1 story point

- [ ] **26.1** Check if Storybook is configured in the project (look for .storybook directory)
- [ ] **26.2** If Storybook exists, create story file for component
- [ ] **26.3** Create default story: French requested → English fallback
- [ ] **26.4** Create story for each requested language (all 6 languages)
- [ ] **26.5** Create story showing non-English fallback (e.g., German → French)
- [ ] **26.6** Create story demonstrating custom className usage (different margin/padding)
- [ ] **26.7** Create story showing mobile responsive layout (narrow viewport)
- [ ] **26.8** Create side-by-side comparison story with TranslationBanner for visual contrast
- [ ] **26.9** Add controls for interacting with requestedLanguage and fallbackLanguage props
- [ ] **26.10** Add documentation text explaining component purpose and muted design rationale
- [ ] **26.11** Test all stories render correctly in Storybook
- [ ] **26.12** If no Storybook, skip this task and note in implementation summary

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Component implementation | Create |
| `src/components/guest/MissingTranslationBanner/index.ts` | Barrel export | Create |
| `src/components/guest/MissingTranslationBanner/__tests__/MissingTranslationBanner.test.tsx` | Unit tests | Create |
| `src/components/guest/MissingTranslationBanner/__tests__/integration.example.tsx` | Integration example (documentation) | Create |
| `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.stories.tsx` | Storybook story (if applicable) | Create |

### Reference Files (Read Only - For Pattern Guidance)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Banner pattern reference, ARIA attributes |
| `src/components/guest/TranslationBanner/TranslationBanner.tsx` | Language name formatting function, similar banner pattern |
| `src/lib/utils.ts` | Import cn() utility for className merging |
| `src/types/l10n.ts` | Import SupportedLanguage type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage` type

### Blocks (Requires This First)
- **REQ-E04-013** (Create Barrel Exports for Guest Components): Needs this component completed
- **REQ-E04-017** (Update ItemDisplay Component): Will integrate this banner into item display

### Parallel Safety
- **Files touched**: New files only (`src/components/guest/MissingTranslationBanner/*`)
- **Conflicts with**: None (new component, no file overlap)
- **Safe to parallelize with**: REQ-E04-008, REQ-E04-009, REQ-E04-011, REQ-E04-012 (all create separate components)

### External Dependencies
- **lucide-react**: Already installed (Info icon)
- **React**: Already installed (component framework)
- **React Testing Library**: Already installed (for tests)
- **Tailwind CSS**: Already configured in project

## Verification Checklist

Before marking this task as complete, verify:

- [ ] Component renders correctly in development mode
- [ ] Background color is muted gray-50 (light gray)
- [ ] Border is subtle gray-200
- [ ] Info icon displays correctly with gray-500 color
- [ ] Icon container has gray-100 background
- [ ] Text color is gray-600 (readable on gray-50 background)
- [ ] Both requested and fallback language names display correctly for all 6 supported languages
- [ ] Language names are bold (using strong elements)
- [ ] Message format is grammatically correct: "[Language] translation not available. Showing content in [Language]."
- [ ] Message ends with period
- [ ] Banner has role="status" attribute
- [ ] Banner has aria-live="polite" attribute
- [ ] Info icon has aria-hidden="true" attribute
- [ ] No interactive elements present (purely informational)
- [ ] Text wraps naturally on narrow screens without awkward breaks
- [ ] Component works on mobile viewports (320px and up)
- [ ] Component works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Screen reader announces banner content correctly
- [ ] Color contrast meets WCAG AA standards (4.5:1 or better)
- [ ] Visual appearance is clearly more muted than TranslationBanner
- [ ] Muted styling does not alarm users (visual QA confirmation)
- [ ] TypeScript compilation passes with no errors: `npx tsc --noEmit`
- [ ] Linting passes with no errors: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage is above 80%: `npm run test:coverage`
- [ ] Production build succeeds: `npm run build`
- [ ] Component is properly exported via barrel export file
- [ ] JSDoc documentation is comprehensive and renders correctly in IDE
- [ ] Custom className prop works correctly for external styling
- [ ] Integration example clearly demonstrates when to use vs. TranslationBanner

---

**Last Modified:** 2026-01-22 22:55
**Agent:** Senior Developer - Task Breakdown Specialist
**Status:** PENDING
**Task ID:** 3.3 - Create MissingTranslationBanner Component
**Epic:** 4 - Guest Experience
**Phase:** 3 - Guest UI Components
