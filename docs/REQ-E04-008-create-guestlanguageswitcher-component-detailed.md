# Create GuestLanguageSwitcher Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:47
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #8)
- Overview: docs/REQ-E04-008-create-guestlanguageswitcher-component-overview.md
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

**Context:** Following the existing pattern of component organization with dedicated directories for each component. This provides clear separation and makes components self-contained with their own files and tests.

**Files to modify:** None (creating new directory structure)

**Estimated effort:** 1 story point

- [ ] **1.1** Create directory at `src/components/guest/GuestLanguageSwitcher/`
- [ ] **1.2** Verify directory structure matches existing component patterns in codebase
- [ ] **1.3** Confirm no naming conflicts with existing components
- [ ] **1.4** Create placeholder `.gitkeep` file if directory tooling requires it (delete after adding actual files)

## 2. Define TypeScript Interfaces and Imports

**Context:** The component needs to import from REQ-E04-001 (l10n types), REQ-E04-002 (guest-language utilities), and existing UI libraries (Radix UI, Lucide icons). The SUPPORTED_LOCALES constant is available from `/src/contexts/LocaleContext.tsx` (lines 79-86) which provides flag emoji, code, native name, and English name for all 6 supported languages.

**Files to modify:**
- Create: `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add `'use client'` directive at the very top of the file
- [ ] **2.2** Import React (no hooks needed - Radix UI manages dropdown state)
- [ ] **2.3** Import Radix UI DropdownMenu: `import * as DropdownMenu from '@radix-ui/react-dropdown-menu'`
- [ ] **2.4** Import icons from lucide-react: `Check`, `ChevronDown`, `Globe`
- [ ] **2.5** Import utility function: `import { cn } from '@/lib/utils'`
- [ ] **2.6** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/types'`
- [ ] **2.7** Import SUPPORTED_LOCALES constant: `import { SUPPORTED_LOCALES } from '@/contexts/LocaleContext'`
- [ ] **2.8** Import setGuestLanguageCookie function: `import { setGuestLanguageCookie } from '@/lib/i18n/guest-language'`
- [ ] **2.9** Define GuestLanguageSwitcherProps interface with required props: `currentLanguage`, `availableLanguages`, `onLanguageChange`, optional `className`
- [ ] **2.10** Add JSDoc comment to interface documenting each prop with @param tags
- [ ] **2.11** Export the GuestLanguageSwitcherProps interface for external use
- [ ] **2.12** Verify all imports resolve correctly with TypeScript compiler

## 3. Implement Component Function Signature and JSDoc

**Context:** The component needs comprehensive documentation explaining its purpose within Epic 4 - Guest Experience. The JSDoc should include usage examples and cross-references to related components.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add module-level JSDoc comment block above component function
- [ ] **3.2** Include description: "Language selector dropdown for guest users viewing shared items"
- [ ] **3.3** Add @component tag to JSDoc
- [ ] **3.4** Add @since tag: "Epic 4 - Guest Experience"
- [ ] **3.5** Add @example block with typical usage showing all props
- [ ] **3.6** Document accessibility features in JSDoc: keyboard navigation, ARIA support
- [ ] **3.7** Create component function: `export function GuestLanguageSwitcher({ currentLanguage, availableLanguages, onLanguageChange, className }: GuestLanguageSwitcherProps)`
- [ ] **3.8** Add JSDoc @param comments for each parameter with descriptions
- [ ] **3.9** Add JSDoc @returns tag describing JSX.Element return type
- [ ] **3.10** Verify JSDoc renders correctly in IDE tooltips

## 4. Implement Language Change Handler with Cookie Persistence

**Context:** When a guest selects a language, we need to call the parent's callback AND persist the selection via cookie for returning guests. Cookie setting may fail due to browser privacy settings, but this should not break the UX - log a warning and continue.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create internal function `handleLanguageChange` that accepts a `SupportedLanguage` parameter
- [ ] **4.2** Add JSDoc comment to handleLanguageChange explaining cookie persistence behavior
- [ ] **4.3** Inside handleLanguageChange, call `onLanguageChange(language)` prop callback first
- [ ] **4.4** Wrap cookie setting in try-catch block for error handling
- [ ] **4.5** Call `setGuestLanguageCookie(language, 'client')` to persist selection
- [ ] **4.6** In catch block, log warning with `console.warn('[GuestLanguageSwitcher] Failed to set cookie:', error)`
- [ ] **4.7** Add comment explaining that cookie failure is non-critical and UX should continue
- [ ] **4.8** Verify function signature is correct: `const handleLanguageChange = (language: SupportedLanguage) => void`
- [ ] **4.9** Test error handling by simulating cookie setting failure

## 5. Find Current Locale Metadata

**Context:** We need to display the current language's flag and native name in the trigger button. The SUPPORTED_LOCALES array contains this metadata for all languages.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Use `SUPPORTED_LOCALES.find()` to locate the locale object matching `currentLanguage`
- [ ] **5.2** Store result in variable: `const currentLocale = SUPPORTED_LOCALES.find(l => l.code === currentLanguage)`
- [ ] **5.3** Add optional chaining when accessing currentLocale properties (e.g., `currentLocale?.flag`)
- [ ] **5.4** Add comment explaining that currentLocale should always exist for valid SupportedLanguage values
- [ ] **5.5** Verify TypeScript correctly infers currentLocale type as `LocaleInfo | undefined`

## 6. Implement Radix UI Dropdown Structure

**Context:** Following the SortMenu component pattern (reference: `src/components/ItemManager/components/dialogs/SortMenu.tsx`), we use Radix UI DropdownMenu primitives for accessibility. The structure is: Root → Trigger (button) → Portal → Content (dropdown menu items).

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Create component return statement with `<DropdownMenu.Root>` as outermost element
- [ ] **6.2** Add comment explaining Radix UI manages open/close state internally (no useState needed)
- [ ] **6.3** Inside Root, create `<DropdownMenu.Trigger>` with `asChild` prop for custom styling
- [ ] **6.4** Inside Trigger, create a `<button>` element with `type="button"`
- [ ] **6.5** Add `aria-label="Select language"` to button for screen readers
- [ ] **6.6** After Trigger, create `<DropdownMenu.Portal>` to render dropdown in document root
- [ ] **6.7** Inside Portal, create `<DropdownMenu.Content>` for the dropdown menu items
- [ ] **6.8** Add `align="end"` prop to Content (aligns to right edge of trigger)
- [ ] **6.9** Add `sideOffset={8}` prop to Content for spacing from trigger
- [ ] **6.10** Verify structure matches Radix UI DropdownMenu documentation and SortMenu pattern

## 7. Style Trigger Button with Current Language Display

**Context:** The trigger button shows the current language's flag emoji and native name, plus a chevron icon to indicate it's a dropdown. Styling follows existing button patterns with Tailwind CSS using the cn() utility for className merging.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Apply base layout classes to button: `inline-flex items-center justify-between gap-3`
- [ ] **7.2** Add sizing classes: `px-3 py-2 min-w-[160px]`
- [ ] **7.3** Add border and background: `border border-gray-300 bg-white rounded-lg`
- [ ] **7.4** Add text styling: `text-sm font-medium text-gray-700`
- [ ] **7.5** Add hover states: `hover:bg-gray-50 hover:border-gray-400`
- [ ] **7.6** Add focus ring: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`
- [ ] **7.7** Add transition: `transition-colors duration-150`
- [ ] **7.8** Add disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] **7.9** Use cn() utility to merge className prop: `className={cn('...classes...', className)}`
- [ ] **7.10** Inside button, create `<span>` wrapper with `flex items-center gap-2` for flag and name
- [ ] **7.11** Add `<span className="text-lg">{currentLocale?.flag}</span>` for flag emoji
- [ ] **7.12** Add `<span>{currentLocale?.nativeName}</span>` for language name
- [ ] **7.13** Add ChevronDown icon after language display: `<ChevronDown className="w-4 h-4" />`
- [ ] **7.14** Test button appearance in light mode and verify all states (default, hover, focus, disabled)

## 8. Style Dropdown Content Container

**Context:** The dropdown content needs proper z-index, shadow, border, and animation classes to appear above other content and provide smooth transitions. Following SortMenu pattern for consistency.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Add width and padding to Content: `w-64 p-1`
- [ ] **8.2** Add background and border: `bg-white border border-gray-200 rounded-lg`
- [ ] **8.3** Add shadow for depth: `shadow-lg`
- [ ] **8.4** Add z-index to appear above other content: `z-50`
- [ ] **8.5** Add entry animation classes: `animate-in fade-in-0 zoom-in-95`
- [ ] **8.6** Add directional slide animations: `data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2`
- [ ] **8.7** Verify dropdown appears correctly when opened (not cut off by viewport or overflow)
- [ ] **8.8** Test on mobile viewport to ensure dropdown doesn't extend beyond screen

## 9. Render Language Options List

**Context:** Map over SUPPORTED_LOCALES to create menu items for all 6 languages. Each item needs to show flag, native name, and conditional checkmark for available translations. The visual appearance changes based on availability and selection state.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Inside Content, map over SUPPORTED_LOCALES array
- [ ] **9.2** For each language, calculate `isAvailable` boolean: check if `lang.code` is in `availableLanguages` array
- [ ] **9.3** Calculate `isSelected` boolean: check if `lang.code === currentLanguage`
- [ ] **9.4** Create `<DropdownMenu.Item>` element with `key={lang.code}` prop
- [ ] **9.5** Add `onSelect={() => handleLanguageChange(lang.code)}` to Item
- [ ] **9.6** Inside Item, create layout wrapper: `<span className="flex items-center justify-between gap-3">`
- [ ] **9.7** Create left section with flag and name: `<span className="flex items-center gap-3">`
- [ ] **9.8** Add flag with conditional opacity: `<span className={cn('text-xl', !isAvailable && 'opacity-50')}>{lang.flag}</span>`
- [ ] **9.9** Add native name: `<span>{lang.nativeName}</span>`
- [ ] **9.10** Close left section span
- [ ] **9.11** Add conditional checkmark: `{isAvailable && <Check className="w-4 h-4 text-green-600" />}`
- [ ] **9.12** Close layout wrapper span
- [ ] **9.13** Verify all 6 languages render with correct flag emojis and native names

## 10. Style Language Menu Items with State Indicators

**Context:** Menu items need different styling based on three states: selected (current language), available (has translation), and unavailable (no translation). States can combine (e.g., selected + unavailable). Touch targets must be at least 48px height for mobile accessibility.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Add base layout classes to Item: `flex items-center justify-between gap-3`
- [ ] **10.2** Add sizing for touch-friendly targets: `px-3 py-2.5 min-h-[48px]`
- [ ] **10.3** Add base text and interaction: `text-sm rounded-md outline-none cursor-pointer`
- [ ] **10.4** Add transition: `transition-colors duration-150`
- [ ] **10.5** Add conditional selected styling: `isSelected && 'bg-blue-50 text-blue-900 font-semibold'`
- [ ] **10.6** Add conditional available (not selected) styling: `!isSelected && isAvailable && 'text-gray-900 hover:bg-blue-50'`
- [ ] **10.7** Add conditional unavailable styling: `!isAvailable && 'text-gray-400 italic hover:bg-gray-50'`
- [ ] **10.8** Add focus state: `focus:bg-blue-50` (for keyboard navigation)
- [ ] **10.9** Use cn() to combine all conditional classes
- [ ] **10.10** Test visual appearance of all state combinations: selected+available, selected+unavailable, unselected+available, unselected+unavailable
- [ ] **10.11** Verify touch targets are at least 48px height on mobile devices
- [ ] **10.12** Test hover states work correctly for all item states

## 11. Test Keyboard Navigation and Accessibility

**Context:** Radix UI provides keyboard navigation out of the box, but we need to verify it works correctly with our styling and structure. Screen reader support is critical for accessibility compliance.

**Files to modify:** None (testing existing implementation)

**Estimated effort:** 1 story point

- [ ] **11.1** Test opening dropdown with Enter key when trigger is focused
- [ ] **11.2** Test opening dropdown with Space key when trigger is focused
- [ ] **11.3** Test closing dropdown with Escape key
- [ ] **11.4** Test navigating through menu items with Arrow Down key
- [ ] **11.5** Test navigating through menu items with Arrow Up key
- [ ] **11.6** Test selecting a language with Enter key
- [ ] **11.7** Test selecting a language with Space key
- [ ] **11.8** Verify dropdown closes automatically after selection
- [ ] **11.9** Test with screen reader (VoiceOver on Mac or NVDA on Windows): verify trigger announces as button with correct label
- [ ] **11.10** Verify screen reader announces each menu item with language name
- [ ] **11.11** Verify focus visible indicators appear on trigger and menu items during keyboard navigation
- [ ] **11.12** Document any accessibility issues found and create follow-up tasks if needed

## 12. Create Barrel Export File

**Context:** Following the component organization pattern where each component folder has an index.ts file that re-exports the main component and its types for cleaner imports.

**Files to modify:**
- Create: `src/components/guest/GuestLanguageSwitcher/index.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Create file at `src/components/guest/GuestLanguageSwitcher/index.ts`
- [ ] **12.2** Add file-level comment explaining this is a barrel export
- [ ] **12.3** Export component: `export { GuestLanguageSwitcher } from './GuestLanguageSwitcher'`
- [ ] **12.4** Export prop types: `export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher'`
- [ ] **12.5** Add JSDoc comment describing the component for IDE tooltips
- [ ] **12.6** Verify import works: `import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher'`
- [ ] **12.7** Run TypeScript compiler to verify exports resolve correctly

## 13. Write Component Unit Tests - Setup and Basic Rendering

**Context:** Using React Testing Library and Vitest (already installed). Tests should verify rendering, interaction, and state management. Mock the setGuestLanguageCookie function to avoid side effects during tests.

**Files to modify:**
- Create: `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** Create test file at `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`
- [ ] **13.2** Import necessary testing utilities: `describe`, `it`, `expect`, `vi` from vitest
- [ ] **13.3** Import React Testing Library: `render`, `screen`, `fireEvent`, `waitFor` from @testing-library/react
- [ ] **13.4** Import userEvent from @testing-library/user-event for realistic interactions
- [ ] **13.5** Import component under test: `import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher'`
- [ ] **13.6** Import type: `import type { SupportedLanguage } from '@/types'`
- [ ] **13.7** Mock setGuestLanguageCookie: `vi.mock('@/lib/i18n/guest-language', () => ({ setGuestLanguageCookie: vi.fn() }))`
- [ ] **13.8** Create helper function to render component with default props
- [ ] **13.9** Write test: "renders trigger button with current language"
- [ ] **13.10** Write test: "displays current language flag and native name in trigger"
- [ ] **13.11** Write test: "applies custom className prop to trigger button"
- [ ] **13.12** Run tests with `npm test` and verify all pass

## 14. Write Component Unit Tests - Dropdown Interaction

**Context:** Test that the dropdown opens, displays all languages, and shows correct visual indicators (checkmarks, grayed out states). Verify touch-friendly sizing.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Write test: "opens dropdown when trigger button clicked"
- [ ] **14.2** Write test: "displays all 6 supported languages in dropdown"
- [ ] **14.3** Write test: "shows checkmark icon for available languages"
- [ ] **14.4** Write test: "does not show checkmark for unavailable languages"
- [ ] **14.5** Write test: "highlights current language with selected styling"
- [ ] **14.6** Write test: "applies grayed out styling to unavailable languages"
- [ ] **14.7** Write test: "applies italic styling to unavailable languages"
- [ ] **14.8** Write test: "unavailable languages are still clickable (not disabled)"
- [ ] **14.9** Write test: "menu items have minimum 48px height for touch targets"
- [ ] **14.10** Run tests with `npm test` and verify all pass

## 15. Write Component Unit Tests - Language Selection and Cookie Persistence

**Context:** Test that selecting a language calls the callback, sets the cookie, and closes the dropdown. Also test error handling when cookie setting fails.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Write test: "calls onLanguageChange callback when language selected"
- [ ] **15.2** Write test: "calls onLanguageChange with correct language code"
- [ ] **15.3** Write test: "calls setGuestLanguageCookie with selected language and 'client' mode"
- [ ] **15.4** Write test: "closes dropdown after language selection"
- [ ] **15.5** Write test: "handles cookie setting failure gracefully (logs warning, continues)"
- [ ] **15.6** Write test: "can select unavailable language (for fallback viewing)"
- [ ] **15.7** Write test: "selecting same language closes dropdown without error"
- [ ] **15.8** Mock console.warn to verify warning is logged on cookie failure
- [ ] **15.9** Clear mocks between tests with beforeEach hook
- [ ] **15.10** Run tests with `npm test` and verify all pass

## 16. Write Component Unit Tests - Keyboard Navigation

**Context:** Verify keyboard interactions work correctly using userEvent for realistic keyboard events. This ensures accessibility compliance.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Write test: "opens dropdown when Enter key pressed on trigger"
- [ ] **16.2** Write test: "opens dropdown when Space key pressed on trigger"
- [ ] **16.3** Write test: "closes dropdown when Escape key pressed"
- [ ] **16.4** Write test: "arrow down key moves focus to next language option"
- [ ] **16.5** Write test: "arrow up key moves focus to previous language option"
- [ ] **16.6** Write test: "Enter key selects focused language option"
- [ ] **16.7** Write test: "Space key selects focused language option"
- [ ] **16.8** Write test: "focus returns to trigger after closing dropdown"
- [ ] **16.9** Use userEvent.tab() to test Tab key navigation if applicable
- [ ] **16.10** Run tests with `npm test` and verify all pass
- [ ] **16.11** Verify test coverage is above 80% with `npm run test:coverage`

## 17. Add Component-Level Documentation and Usage Example

**Context:** Create comprehensive documentation within the component file itself, including a usage example that shows how parent components should integrate this component.

**Files to modify:** `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Add detailed comment block at top of file explaining component purpose
- [ ] **17.2** Document integration with Epic 4 - Guest Experience
- [ ] **17.3** Add usage example in JSDoc showing typical implementation in a parent component
- [ ] **17.4** Document relationship to other components: TranslationBanner, MissingTranslationBanner
- [ ] **17.5** Document dependencies: REQ-E04-001 (types), REQ-E04-002 (guest-language utilities)
- [ ] **17.6** Add inline comments explaining Radix UI behavior (auto-managed state, keyboard support)
- [ ] **17.7** Add comment explaining why unavailable languages are still clickable (fallback viewing)
- [ ] **17.8** Document accessibility features: ARIA labels, keyboard navigation, screen reader support
- [ ] **17.9** Add @see tags referencing SortMenu as pattern reference
- [ ] **17.10** Verify documentation renders correctly in IDE tooltips and intellisense

## 18. Responsive Design Testing and Mobile Optimization

**Context:** The component must work well on mobile devices with touch interactions and small viewports. The dropdown should not extend beyond the viewport or be cut off.

**Files to modify:** None (testing and potential adjustments)

**Estimated effort:** 1 story point

- [ ] **18.1** Test component on iPhone SE viewport (375px width)
- [ ] **18.2** Test component on standard mobile viewport (390px width)
- [ ] **18.3** Test component on tablet viewport (768px width)
- [ ] **18.4** Verify trigger button text doesn't overflow on narrow screens
- [ ] **18.5** Verify dropdown width adjusts appropriately (currently fixed at w-64 = 256px)
- [ ] **18.6** Test dropdown positioning when trigger is near right edge of viewport
- [ ] **18.7** Verify touch targets are easily tappable (min 44x44px iOS guideline, we use 48px)
- [ ] **18.8** Test in mobile Safari (iOS) for any specific rendering issues
- [ ] **18.9** Test in Chrome mobile (Android) for any specific rendering issues
- [ ] **18.10** Verify dropdown closes when tapping outside (Radix UI should handle this)
- [ ] **18.11** Test in landscape orientation on mobile devices
- [ ] **18.12** Document any mobile-specific issues and create follow-up tasks if needed

## 19. Cross-Browser Testing

**Context:** Ensure the component works correctly across major browsers. Radix UI provides good cross-browser compatibility, but custom styling and interactions should be verified.

**Files to modify:** None (testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Test in Chrome (latest version) - primary development browser
- [ ] **19.2** Test in Firefox (latest version) - verify Radix UI dropdown behavior
- [ ] **19.3** Test in Safari (latest version) - test on macOS if available
- [ ] **19.4** Test in Edge (latest version) - verify Chromium-based behavior
- [ ] **19.5** Verify flag emojis render correctly in all browsers (may appear differently)
- [ ] **19.6** Verify transitions and animations work smoothly across browsers
- [ ] **19.7** Test focus ring appearance across browsers (different default styles)
- [ ] **19.8** Verify hover states work correctly (especially important in Firefox)
- [ ] **19.9** Document any browser-specific rendering differences
- [ ] **19.10** Create follow-up tasks for any critical cross-browser issues found

## 20. Performance Validation

**Context:** The component should render quickly and respond to interactions instantly. Language switching should update state without noticeable lag.

**Files to modify:** None (performance testing)

**Estimated effort:** 1 story point

- [ ] **20.1** Measure component initial render time in development mode
- [ ] **20.2** Measure component initial render time in production build
- [ ] **20.3** Verify dropdown opens in under 50ms after click
- [ ] **20.4** Verify language selection triggers callback in under 50ms
- [ ] **20.5** Check component bundle size impact with `npm run build` and analyze output
- [ ] **20.6** Verify no unnecessary re-renders with React DevTools Profiler
- [ ] **20.7** Test with 50+ rapid language switches to verify no memory leaks
- [ ] **20.8** Verify cookie setting doesn't block UI (should be async/non-blocking)
- [ ] **20.9** Test component performance on low-end mobile device or CPU throttling in DevTools
- [ ] **20.10** Document performance metrics and create follow-up optimization tasks if needed

## 21. Integration Testing Preparation

**Context:** While full integration testing will happen in REQ-E04-017 (Update ItemDisplay Component), we need to prepare by creating a simple usage example that demonstrates integration.

**Files to modify:**
- Create: `src/components/guest/GuestLanguageSwitcher/__tests__/integration.example.tsx` (documentation/example file, not a test)

**Estimated effort:** 1 story point

- [ ] **21.1** Create example file showing how to use component in a parent page
- [ ] **21.2** Include example of fetching available languages from API endpoint (REQ-E04-006)
- [ ] **21.3** Show example of managing language state with useState or useGuestLanguage hook
- [ ] **21.4** Demonstrate passing availableLanguages prop correctly
- [ ] **21.5** Show example of onLanguageChange callback that updates content
- [ ] **21.6** Include example of typical parent component structure with header placement
- [ ] **21.7** Add comments explaining integration points with other Epic 4 components
- [ ] **21.8** Document common pitfalls or integration issues to watch for
- [ ] **21.9** Add reference to this example in main component JSDoc
- [ ] **21.10** Verify example code is valid TypeScript with `npx tsc --noEmit`

## 22. Final TypeScript Compilation and Linting

**Context:** Run full TypeScript compilation and linting to ensure no errors were introduced and all code follows project standards.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **22.1** Run full TypeScript compilation: `npx tsc --noEmit`
- [ ] **22.2** Verify no TypeScript errors in component file
- [ ] **22.3** Verify no TypeScript errors in test file
- [ ] **22.4** Verify no TypeScript errors in barrel export file
- [ ] **22.5** Run linter: `npm run lint`
- [ ] **22.6** Fix any linting errors or warnings (preferably none)
- [ ] **22.7** Verify no unused imports in component file
- [ ] **22.8** Verify no unused variables in component file
- [ ] **22.9** Run prettier/formatter if configured in project
- [ ] **22.10** Verify all files follow project code style guidelines

## 23. Build Verification

**Context:** Run a full production build to ensure the component doesn't break the build process and doesn't introduce excessive bundle size.

**Files to modify:** None (build verification)

**Estimated effort:** 1 story point

- [ ] **23.1** Run production build: `npm run build`
- [ ] **23.2** Verify build completes successfully without errors
- [ ] **23.3** Check build output for any warnings related to new component
- [ ] **23.4** Analyze bundle size impact (should be minimal - mostly Radix UI already included)
- [ ] **23.5** Verify component is tree-shakeable (exports are properly structured)
- [ ] **23.6** Check that flag emojis don't cause unexpected encoding issues in build
- [ ] **23.7** Test production build locally with `npm run start`
- [ ] **23.8** Verify component works correctly in production mode (no dev-only issues)
- [ ] **23.9** Check browser console for any warnings or errors in production build
- [ ] **23.10** Document build size impact in implementation notes

## 24. Create Component Demo/Storybook (Optional)

**Context:** If the project uses Storybook or a similar component documentation tool, create a story/demo showing all component states and variations.

**Files to modify:**
- Create: `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.stories.tsx` (if Storybook configured)

**Estimated effort:** 1 story point

- [ ] **24.1** Check if Storybook is configured in the project (look for .storybook directory)
- [ ] **24.2** If Storybook exists, create story file for component
- [ ] **24.3** Create default story showing component with all languages available
- [ ] **24.4** Create story showing component with some languages unavailable
- [ ] **24.5** Create story showing component with current language = unavailable language
- [ ] **24.6** Create story demonstrating compact mode (if className can simulate this)
- [ ] **24.7** Add controls for interacting with props (currentLanguage, availableLanguages)
- [ ] **24.8** Add documentation text explaining component purpose and usage
- [ ] **24.9** Test all stories render correctly in Storybook
- [ ] **24.10** If no Storybook, skip this task and note in implementation summary

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Component implementation | Create |
| `src/components/guest/GuestLanguageSwitcher/index.ts` | Barrel export | Create |
| `src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx` | Unit tests | Create |
| `src/components/guest/GuestLanguageSwitcher/__tests__/integration.example.tsx` | Integration example (documentation) | Create |
| `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.stories.tsx` | Storybook story (if applicable) | Create |

### Reference Files (Read Only - For Pattern Guidance)

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix UI DropdownMenu pattern reference |
| `src/components/dashboard/PropertyDropdown.tsx` | Dropdown component pattern reference |
| `src/contexts/LocaleContext.tsx` | Import SUPPORTED_LOCALES constant (lines 79-86) |
| `src/lib/i18n/guest-language.ts` | Import setGuestLanguageCookie() (from REQ-E04-002) |
| `src/types/l10n.ts` | Import SupportedLanguage type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage` type and related interfaces
- **REQ-E04-002** (Create Guest Language Utility Module): Provides `setGuestLanguageCookie()` function

### Blocks (Requires This First)
- **REQ-E04-017** (Update ItemDisplay Component): Will integrate this component into item display
- **REQ-E04-016** (Update Guest Item Page): May integrate this component into page layout

### Parallel Safety
- **Files touched**: New files only (`src/components/guest/GuestLanguageSwitcher/*`)
- **Conflicts with**: None (new component, no file overlap)
- **Safe to parallelize with**: REQ-E04-009, REQ-E04-010, REQ-E04-011, REQ-E04-012 (all create separate components)

### External Dependencies
- **Radix UI**: `@radix-ui/react-dropdown-menu` (already installed in package.json)
- **Lucide React**: `lucide-react` (already installed in package.json)
- **React Testing Library**: `@testing-library/react` (already installed for tests)
- **Tailwind CSS**: Already configured in project

## Verification Checklist

Before marking this task as complete, verify:

- [ ] Component renders correctly in development mode
- [ ] All 6 languages display with correct flag emojis and native names
- [ ] Checkmarks appear only for available languages
- [ ] Unavailable languages are grayed out and italic but still clickable
- [ ] Current language is highlighted with blue background and bold text
- [ ] Clicking a language calls onLanguageChange callback with correct language code
- [ ] setGuestLanguageCookie is called with selected language and 'client' mode
- [ ] Cookie setting failures are logged but don't break the UI
- [ ] Dropdown opens with click/Enter/Space and closes with Escape
- [ ] Keyboard navigation works (arrow keys, Enter/Space to select)
- [ ] Screen reader announces component correctly with proper ARIA labels
- [ ] Touch targets are at least 48px height for mobile accessibility
- [ ] Component works on mobile viewports (375px and up)
- [ ] Component works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] TypeScript compilation passes with no errors: `npx tsc --noEmit`
- [ ] Linting passes with no errors: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage is above 80%: `npm run test:coverage`
- [ ] Production build succeeds: `npm run build`
- [ ] Component is properly exported via barrel export file
- [ ] JSDoc documentation is comprehensive and renders correctly in IDE
- [ ] Custom className prop works correctly for external styling

---

**Last Modified:** 2026-01-22 22:47
**Agent:** Senior Developer - Task Breakdown Specialist
**Status:** PENDING
**Task ID:** 3.1 - Create GuestLanguageSwitcher Component
**Epic:** 4 - Guest Experience
**Phase:** 3 - Guest UI Components
