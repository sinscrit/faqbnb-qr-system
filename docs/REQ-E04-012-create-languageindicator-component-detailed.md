# Create LanguageIndicator Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:03
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #12)
- Overview: docs/REQ-E04-012-create-languageindicator-component-overview.md
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

- [ ] **1.1** Create directory at `src/components/guest/LanguageIndicator/`
- [ ] **1.2** Verify directory structure matches existing guest component patterns in codebase
- [ ] **1.3** Confirm no naming conflicts with existing components
- [ ] **1.4** Create placeholder `.gitkeep` file if directory tooling requires it (delete after adding actual files)

## 2. Define TypeScript Interfaces and Type Definitions

**Context:** The component is a read-only presentational component that displays language information. It needs interfaces for props and language metadata. The component imports from REQ-E04-001 (l10n types) and existing utilities.

**Files to modify:**
- Create: `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add `'use client'` directive at the very top of the file
- [ ] **2.2** Import utility function: `import { cn } from '@/lib/utils'`
- [ ] **2.3** Import SupportedLanguage type: `import type { SupportedLanguage } from '@/types'`
- [ ] **2.4** Define LanguageIndicatorProps interface with required prop: `displayLanguage`
- [ ] **2.5** Add optional props: `originalLanguage`, `showTranslationContext` (default true), `size` ('sm' | 'md', default 'md'), `className`
- [ ] **2.6** Add JSDoc comment to interface documenting each prop with @param tags
- [ ] **2.7** Document that displayLanguage is the currently shown language
- [ ] **2.8** Document that originalLanguage triggers subtitle display when different from displayLanguage
- [ ] **2.9** Export the LanguageIndicatorProps interface for external use
- [ ] **2.10** Define LanguageMetadata interface with: `name`, `nativeName`, `flag` (all strings)
- [ ] **2.11** Verify all imports resolve correctly with TypeScript compiler

## 3. Define Language Metadata Constant

**Context:** The LANGUAGE_METADATA constant maps each SupportedLanguage to its flag emoji, English name, and native name. This MUST match LocaleContext.tsx SUPPORTED_LOCALES exactly for consistency across authenticated and guest experiences.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Create constant: `const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata>`
- [ ] **3.2** Add mapping for English: `en: { name: 'English', nativeName: 'English', flag: '🇬🇧' }`
- [ ] **3.3** Add mapping for French: `fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' }`
- [ ] **3.4** Add mapping for Spanish: `es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }`
- [ ] **3.5** Add mapping for German: `de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }`
- [ ] **3.6** Add mapping for Dutch: `nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' }`
- [ ] **3.7** Add mapping for Italian: `it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }`
- [ ] **3.8** Add JSDoc comment explaining this matches LocaleContext.tsx SUPPORTED_LOCALES
- [ ] **3.9** Add comment with reference: "Consistent with LocaleContext.tsx lines 79-86"
- [ ] **3.10** Verify flag emojis render correctly in editor and browser
- [ ] **3.11** Cross-check with src/contexts/LocaleContext.tsx to ensure exact match

## 4. Implement Helper Function for Language Metadata Lookup

**Context:** Create a simple helper function that retrieves language metadata by code. This encapsulates the lookup logic and provides a clean API.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Create helper function: `function getLanguageMetadata(lang: SupportedLanguage): LanguageMetadata`
- [ ] **4.2** Add JSDoc comment explaining function retrieves language metadata by code
- [ ] **4.3** Implement function body: `return LANGUAGE_METADATA[lang]`
- [ ] **4.4** Verify TypeScript correctly infers return type as LanguageMetadata
- [ ] **4.5** Place function before component definition for organization

## 5. Implement Component Function Signature and JSDoc

**Context:** The component needs comprehensive documentation explaining its purpose within Epic 4 - Guest Experience, its read-only nature, and compact design for headers.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Add module-level JSDoc comment block above component function
- [ ] **5.2** Include description: "Compact display of current language with flag emoji and optional translation context"
- [ ] **5.3** Add @component tag to JSDoc
- [ ] **5.4** Add @since tag: "Epic 4 - Guest Experience"
- [ ] **5.5** Add @example block showing simple usage (display language only)
- [ ] **5.6** Add second @example block showing usage with translation context
- [ ] **5.7** Document design decision: Read-only component suitable for headers (not interactive)
- [ ] **5.8** Document accessibility features: role="status", aria-label, aria-hidden on flag
- [ ] **5.9** Create component function: `export function LanguageIndicator({ displayLanguage, originalLanguage, showTranslationContext = true, size = 'md', className }: LanguageIndicatorProps)`
- [ ] **5.10** Add JSDoc @param comments for each parameter with descriptions
- [ ] **5.11** Add JSDoc @returns tag describing JSX.Element return type

## 6. Implement Language Metadata Retrieval

**Context:** Retrieve metadata for the display language and optionally the original language. This provides the flag emoji and native names needed for rendering.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Inside component function, retrieve display language metadata: `const displayMeta = getLanguageMetadata(displayLanguage)`
- [ ] **6.2** Conditionally retrieve original language metadata: `const originalMeta = originalLanguage ? getLanguageMetadata(originalLanguage) : null`
- [ ] **6.3** Add comment explaining displayMeta is always present, originalMeta may be null
- [ ] **6.4** Verify TypeScript correctly infers originalMeta type as `LanguageMetadata | null`

## 7. Implement Subtitle Display Logic

**Context:** The subtitle "Translated from [Language]" should only appear when viewing translated content. This requires checking if translation context is enabled, originalLanguage is provided, and languages differ.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Calculate showSubtitle boolean: `const showSubtitle = showTranslationContext && originalLanguage && originalLanguage !== displayLanguage`
- [ ] **7.2** Add comment explaining all three conditions must be true for subtitle to appear
- [ ] **7.3** Add comment documenting logic: shows subtitle only when viewing translation (not original)
- [ ] **7.4** Verify logic handles edge case where originalLanguage === displayLanguage (no subtitle)
- [ ] **7.5** Verify logic handles case where originalLanguage is undefined (no subtitle)

## 8. Define Size Variant Classes

**Context:** Support two size variants (sm and md) for different use cases. Small for mobile/compact headers, medium for desktop/normal spaces. Each size affects flag, name, and subtitle text sizes.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Create sizeClasses object with sm and md keys
- [ ] **8.2** Define sm variant classes: `{ flag: 'text-base', name: 'text-sm', subtitle: 'text-xs' }`
- [ ] **8.3** Define md variant classes: `{ flag: 'text-lg', name: 'text-base', subtitle: 'text-sm' }`
- [ ] **8.4** Add comment explaining sm is for mobile/compact, md is for desktop/normal
- [ ] **8.5** Extract classes for current size: `const classes = sizeClasses[size]`
- [ ] **8.6** Verify TypeScript correctly infers classes type

## 9. Implement Container Element with ARIA Attributes

**Context:** The container uses semantic HTML and ARIA attributes for accessibility. role="status" indicates read-only status information. aria-label provides full context for screen readers.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Create component return statement with outer `<div>` element
- [ ] **9.2** Add className with cn() utility: `inline-flex items-center gap-2`
- [ ] **9.3** Merge className prop at end of cn() call
- [ ] **9.4** Add `role="status"` attribute (identifies as status indicator, not interactive)
- [ ] **9.5** Add `aria-label` attribute with dynamic content
- [ ] **9.6** Build aria-label content: `` `Content displayed in ${displayMeta.nativeName}` ``
- [ ] **9.7** Append to aria-label when subtitle shown: `` ${showSubtitle ? `, translated from ${originalMeta?.name}` : ''} ``
- [ ] **9.8** Add comment explaining aria-label provides full context including translation info
- [ ] **9.9** Verify aria-label builds correctly for all language combinations

## 10. Implement Flag Emoji Display

**Context:** The flag emoji is displayed first (left side) with aria-hidden since it's decorative. Screen readers should announce the language name, not the emoji.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Inside container div, create span for flag: `<span>`
- [ ] **10.2** Add className with size-specific flag class: `cn(classes.flag, 'flex-shrink-0')`
- [ ] **10.3** Add `aria-hidden="true"` attribute (flag is decorative, not informative)
- [ ] **10.4** Insert flag emoji from metadata: `{displayMeta.flag}`
- [ ] **10.5** Close flag span
- [ ] **10.6** Add comment explaining flex-shrink-0 prevents flag from shrinking
- [ ] **10.7** Add comment explaining aria-hidden prevents screen reader announcement
- [ ] **10.8** Verify flag renders correctly in browser

## 11. Implement Language Info Container

**Context:** The language info (native name and optional subtitle) is wrapped in a flex-col div for vertical stacking. This allows the subtitle to appear below the language name.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** After flag span, create div for language info: `<div className="flex flex-col">`
- [ ] **11.2** Add comment explaining this div stacks name and subtitle vertically
- [ ] **11.3** Verify flex-col layout is correct for vertical stacking

## 12. Implement Native Language Name Display

**Context:** Display the language name in its native form (e.g., "Français" not "French"). This is the primary text that users see and is styled with medium weight and dark color for readability.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Inside language info div, create span for native name: `<span>`
- [ ] **12.2** Add className with size and style: `cn(classes.name, 'font-medium text-gray-900')`
- [ ] **12.3** Insert native name from metadata: `{displayMeta.nativeName}`
- [ ] **12.4** Close native name span
- [ ] **12.5** Add comment explaining use of native name (user recognition)
- [ ] **12.6** Verify text color provides adequate contrast on typical backgrounds

## 13. Implement Translation Context Subtitle

**Context:** The subtitle "Translated from [Language]" appears below the native name when viewing translated content. It uses English name (not native) for clarity and is styled with smaller text and muted color.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** After native name span, add conditional rendering: `{showSubtitle && originalMeta && (`
- [ ] **13.2** Create span for subtitle: `<span>`
- [ ] **13.3** Add className with size and style: `cn(classes.subtitle, 'text-gray-500')`
- [ ] **13.4** Add text content: `Translated from {originalMeta.name}`
- [ ] **13.5** Use English name (originalMeta.name) not native name for clarity
- [ ] **13.6** Close subtitle span
- [ ] **13.7** Close conditional rendering: `)}`
- [ ] **13.8** Close language info div
- [ ] **13.9** Close container div
- [ ] **13.10** Add comment explaining subtitle uses English name for consistency
- [ ] **13.11** Verify subtitle appears correctly when conditions are met

## 14. Add Export Statements

**Context:** Export the component as default export and named export for flexibility in imports, matching other guest component patterns.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Add named export for the component (already exported inline with function declaration)
- [ ] **14.2** Add default export at bottom of file: `export default LanguageIndicator;`
- [ ] **14.3** Verify both import styles work: `import { LanguageIndicator } from ...` and `import LanguageIndicator from ...`
- [ ] **14.4** Add comment explaining both import styles are supported

## 15. Create Barrel Export File

**Context:** Following the component organization pattern where each component folder has an index.ts file that re-exports the main component and its types for cleaner imports.

**Files to modify:**
- Create: `src/components/guest/LanguageIndicator/index.ts`

**Estimated effort:** 1 story point

- [ ] **15.1** Create file at `src/components/guest/LanguageIndicator/index.ts`
- [ ] **15.2** Add file-level comment explaining this is a barrel export
- [ ] **15.3** Export component: `export { LanguageIndicator } from './LanguageIndicator'`
- [ ] **15.4** Export prop types: `export type { LanguageIndicatorProps } from './LanguageIndicator'`
- [ ] **15.5** Add JSDoc comment describing the component for IDE tooltips
- [ ] **15.6** Verify import works: `import { LanguageIndicator } from '@/components/guest/LanguageIndicator'`
- [ ] **15.7** Run TypeScript compiler to verify exports resolve correctly

## 16. Write Component Unit Tests - Setup and Basic Rendering

**Context:** Using React Testing Library and Vitest (already installed). Tests should verify rendering of flag, native name, metadata correctness, and basic display logic.

**Files to modify:**
- Create: `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Create test file at `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`
- [ ] **16.2** Import necessary testing utilities: `describe`, `it`, `expect` from vitest
- [ ] **16.3** Import React Testing Library: `render`, `screen` from @testing-library/react
- [ ] **16.4** Import component under test: `import { LanguageIndicator } from '../LanguageIndicator'`
- [ ] **16.5** Import type: `import type { SupportedLanguage } from '@/types'`
- [ ] **16.6** Create helper function to render component with default props
- [ ] **16.7** Write test: "renders flag emoji for display language"
- [ ] **16.8** Write test: "renders native language name for display language"
- [ ] **16.9** Write test: "renders English (en) correctly with flag 🇬🇧 and name 'English'"
- [ ] **16.10** Write test: "renders French (fr) correctly with flag 🇫🇷 and name 'Français'"
- [ ] **16.11** Write test: "renders Spanish (es) correctly with flag 🇪🇸 and name 'Español'"
- [ ] **16.12** Write test: "applies custom className prop to container"
- [ ] **16.13** Run tests with `npm test` and verify all pass

## 17. Write Component Unit Tests - All Six Languages

**Context:** Verify all 6 supported languages render correctly with proper flag emojis and native names. This ensures the LANGUAGE_METADATA mapping is correct.

**Files to modify:** `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Write test: "renders German (de) with flag 🇩🇪 and name 'Deutsch'"
- [ ] **17.2** Write test: "renders Dutch (nl) with flag 🇳🇱 and name 'Nederlands'"
- [ ] **17.3** Write test: "renders Italian (it) with flag 🇮🇹 and name 'Italiano'"
- [ ] **17.4** Write comprehensive loop test: "renders all 6 languages correctly"
- [ ] **17.5** In loop test, define arrays for: languages, nativeNames, flags
- [ ] **17.6** Loop through languages and verify flag and native name for each
- [ ] **17.7** Verify flag emojis are exactly as expected (not similar characters)
- [ ] **17.8** Verify native names match exact spelling with accents
- [ ] **17.9** Run tests with `npm test` and verify all pass

## 18. Write Component Unit Tests - Subtitle Display Logic

**Context:** Test the complex logic for when the "Translated from [Language]" subtitle should appear. This requires testing multiple conditions and edge cases.

**Files to modify:** `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`

**Estimated effort:** 1 story point

- [ ] **18.1** Write test: "shows subtitle when viewing translation (originalLanguage different from displayLanguage)"
- [ ] **18.2** Write test: "subtitle contains 'Translated from' text"
- [ ] **18.3** Write test: "subtitle shows English name of original language"
- [ ] **18.4** Write test: "hides subtitle when originalLanguage equals displayLanguage (viewing original)"
- [ ] **18.5** Write test: "hides subtitle when originalLanguage is undefined"
- [ ] **18.6** Write test: "hides subtitle when showTranslationContext is false"
- [ ] **18.7** Write test: "shows subtitle when showTranslationContext is true (default)"
- [ ] **18.8** Test edge case: displayLanguage=fr, originalLanguage=en, showTranslationContext=false → no subtitle
- [ ] **18.9** Test edge case: displayLanguage=en, originalLanguage=en → no subtitle
- [ ] **18.10** Run tests with `npm test` and verify all pass

## 19. Write Component Unit Tests - Size Variants

**Context:** Test that both size variants (sm and md) apply correct text size classes for flag, name, and subtitle.

**Files to modify:** `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`

**Estimated effort:** 1 story point

- [ ] **19.1** Write test: "applies small size classes when size='sm'"
- [ ] **19.2** Verify sm variant has: flag text-base, name text-sm, subtitle text-xs
- [ ] **19.3** Write test: "applies medium size classes when size='md'"
- [ ] **19.4** Verify md variant has: flag text-lg, name text-base, subtitle text-sm
- [ ] **19.5** Write test: "defaults to medium size when size prop not provided"
- [ ] **19.6** Use container.querySelector or getByText with class matchers
- [ ] **19.7** Verify flag has flex-shrink-0 class regardless of size
- [ ] **19.8** Run tests with `npm test` and verify all pass

## 20. Write Component Unit Tests - Accessibility

**Context:** Verify ARIA attributes are correctly applied for screen reader support. Test role, aria-label, and aria-hidden attributes.

**Files to modify:** `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx`

**Estimated effort:** 1 story point

- [ ] **20.1** Write test: "container has role='status' attribute"
- [ ] **20.2** Write test: "container has aria-label attribute"
- [ ] **20.3** Write test: "aria-label includes display language native name"
- [ ] **20.4** Write test: "aria-label includes translation context when showing subtitle"
- [ ] **20.5** Write test: "aria-label format: 'Content displayed in [Language], translated from [Language]'"
- [ ] **20.6** Write test: "flag emoji has aria-hidden='true' attribute"
- [ ] **20.7** Write test: "flag is hidden from screen readers"
- [ ] **20.8** Write test: "native language name is accessible to screen readers (not aria-hidden)"
- [ ] **20.9** Write test: "subtitle is accessible to screen readers when shown"
- [ ] **20.10** Run tests with `npm test` and verify all pass
- [ ] **20.11** Verify test coverage is above 80% with `npm run test:coverage`

## 21. Manual Cross-Platform Flag Emoji Testing

**Context:** Flag emojis may render differently or not at all on different platforms. Test across major operating systems and browsers to ensure consistent display.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Test flag emojis on iOS Safari (iPhone/iPad)
- [ ] **21.2** Test flag emojis on Android Chrome (various devices)
- [ ] **21.3** Test flag emojis on Windows 11 Chrome
- [ ] **21.4** Test flag emojis on Windows 11 Edge
- [ ] **21.5** Test flag emojis on Windows 11 Firefox
- [ ] **21.6** Test flag emojis on macOS Safari
- [ ] **21.7** Test flag emojis on macOS Chrome
- [ ] **21.8** Test flag emojis on Linux Chrome/Firefox if available
- [ ] **21.9** Document any platforms where flags don't render correctly
- [ ] **21.10** Verify native language name is visible even if flag doesn't render
- [ ] **21.11** Take screenshots of flag rendering on each platform for documentation

## 22. Manual Responsive Design Testing

**Context:** Verify the component layout works well at different screen sizes with both size variants. Test compact header scenarios.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Test component with size="sm" on 320px viewport (iPhone SE)
- [ ] **22.2** Test component with size="sm" on 375px viewport (standard mobile)
- [ ] **22.3** Test component with size="md" on 768px viewport (tablet)
- [ ] **22.4** Test component with size="md" on 1024px+ viewport (desktop)
- [ ] **22.5** Verify flag and text maintain proper gap spacing at all sizes
- [ ] **22.6** Test longest native name ("Nederlands") at 320px width
- [ ] **22.7** Verify subtitle wraps naturally if needed on narrow screens
- [ ] **22.8** Test component in typical header layout (flex justify-between with other elements)
- [ ] **22.9** Verify component doesn't overflow container on any screen size
- [ ] **22.10** Test with and without subtitle at various widths
- [ ] **22.11** Test in mobile Safari (iOS) for any specific rendering issues
- [ ] **22.12** Test in Chrome mobile (Android) for any specific rendering issues

## 23. Cross-Browser Testing

**Context:** Ensure the component works correctly across major browsers. Pay special attention to flag emoji rendering, flexbox layout, and text display.

**Files to modify:** None (testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Test in Chrome (latest version) - primary development browser
- [ ] **23.2** Test in Firefox (latest version) - verify flexbox and text rendering
- [ ] **23.3** Test in Safari (latest version) - test on macOS if available
- [ ] **23.4** Test in Edge (latest version) - verify Chromium-based behavior
- [ ] **23.5** Verify flag emojis render consistently across browsers (may vary by OS font)
- [ ] **23.6** Verify native names with accents render correctly (Français, Español, Deutsch)
- [ ] **23.7** Verify inline-flex layout works consistently
- [ ] **23.8** Verify gap spacing between flag and text
- [ ] **23.9** Verify text colors (text-gray-900, text-gray-500) render consistently
- [ ] **23.10** Document any browser-specific rendering differences
- [ ] **23.11** Create follow-up tasks for any critical cross-browser issues found

## 24. Accessibility Testing with Screen Readers

**Context:** Verify the component is properly announced by screen readers with correct language information and translation context. Test that flag emoji is not announced.

**Files to modify:** None (manual accessibility testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Test with VoiceOver on macOS: Enable with Cmd+F5
- [ ] **24.2** Verify component is announced as "status" region
- [ ] **24.3** Verify aria-label is read: "Content displayed in [Language]"
- [ ] **24.4** Verify translation context is read when subtitle shown: ", translated from [Language]"
- [ ] **24.5** Verify flag emoji is NOT announced (aria-hidden works)
- [ ] **24.6** Verify native language name is NOT read separately (aria-label takes precedence)
- [ ] **24.7** Test with NVDA on Windows if available (similar verification)
- [ ] **24.8** Verify component doesn't interrupt navigation flow
- [ ] **24.9** Test that component is discoverable but not intrusive
- [ ] **24.10** Document any accessibility issues found
- [ ] **24.11** Create follow-up tasks for any accessibility improvements needed

## 25. Verify Consistency with LocaleContext

**Context:** Critical verification that LANGUAGE_METADATA exactly matches LocaleContext.tsx SUPPORTED_LOCALES. This ensures visual consistency across authenticated and guest experiences.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **25.1** Open src/contexts/LocaleContext.tsx file
- [ ] **25.2** Locate SUPPORTED_LOCALES constant (lines 79-86)
- [ ] **25.3** Compare flag emojis: English 🇬🇧
- [ ] **25.4** Compare flag emojis: French 🇫🇷
- [ ] **25.5** Compare flag emojis: Spanish 🇪🇸
- [ ] **25.6** Compare flag emojis: German 🇩🇪
- [ ] **25.7** Compare flag emojis: Dutch 🇳🇱
- [ ] **25.8** Compare flag emojis: Italian 🇮🇹
- [ ] **25.9** Compare native names for all 6 languages
- [ ] **25.10** Compare English names for all 6 languages
- [ ] **25.11** Document any discrepancies and fix immediately
- [ ] **25.12** Add comment in code referencing LocaleContext for future consistency

## 26. Component-Level Documentation and Usage Examples

**Context:** Add comprehensive in-code documentation with usage examples showing typical header integration, size variants, and translation context scenarios.

**Files to modify:** `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`

**Estimated effort:** 1 story point

- [ ] **26.1** Enhance module-level JSDoc with detailed component description
- [ ] **26.2** Document read-only nature (not interactive like GuestLanguageSwitcher)
- [ ] **26.3** Document compact design suitable for headers
- [ ] **26.4** Add detailed usage example: simple display (language only)
- [ ] **26.5** Add usage example: with translation context (showing subtitle)
- [ ] **26.6** Add usage example: size variants (sm for mobile, md for desktop)
- [ ] **26.7** Add usage example: typical header integration
- [ ] **26.8** Document when to show subtitle vs. hide it
- [ ] **26.9** Document relationship to other components: GuestLanguageSwitcher (interactive), TranslationBanner
- [ ] **26.10** Document relationship to REQ-E04-001 (types dependency) and LocaleContext (flag consistency)
- [ ] **26.11** Add inline comments explaining key implementation decisions
- [ ] **26.12** Verify documentation renders correctly in IDE tooltips and intellisense

## 27. Create Integration Example Documentation

**Context:** Create a separate example file showing realistic header integration with LanguageIndicator and GuestLanguageSwitcher together, demonstrating their complementary roles.

**Files to modify:**
- Create: `src/components/guest/LanguageIndicator/__tests__/integration.example.tsx`

**Estimated effort:** 1 story point

- [ ] **27.1** Create example file (not a test, documentation only)
- [ ] **27.2** Add header comment explaining this is an integration example
- [ ] **27.3** Show example of guest page header layout
- [ ] **27.4** Include LanguageIndicator (read-only display)
- [ ] **27.5** Include GuestLanguageSwitcher (interactive control)
- [ ] **27.6** Demonstrate responsive sizing (sm on mobile, md on desktop)
- [ ] **27.7** Show translation context subtitle appearing when viewing translation
- [ ] **27.8** Document typical flex layout with justify-between for header
- [ ] **27.9** Add comments explaining complementary roles of indicator and switcher
- [ ] **27.10** Add reference to this example in main component JSDoc
- [ ] **27.11** Verify example code is valid TypeScript with `npx tsc --noEmit`

## 28. Visual Comparison Testing

**Context:** Verify the component visually integrates well with other guest components and matches the design intent. Test compact appearance in headers.

**Files to modify:** None (visual testing)

**Estimated effort:** 1 story point

- [ ] **28.1** Render component in isolation at both sizes
- [ ] **28.2** Render component in typical header layout
- [ ] **28.3** Place component next to GuestLanguageSwitcher to verify visual harmony
- [ ] **28.4** Verify flag emoji and text align properly horizontally
- [ ] **28.5** Verify subtitle aligns correctly under native name
- [ ] **28.6** Test visual appearance with all 6 languages (different text lengths)
- [ ] **28.7** Test visual appearance with longest native name (Nederlands)
- [ ] **28.8** Verify text colors provide adequate contrast
- [ ] **28.9** Verify component is visually compact and unobtrusive
- [ ] **28.10** Take screenshots for documentation
- [ ] **28.11** Document any visual improvements needed

## 29. Performance Validation

**Context:** Verify the component renders quickly and doesn't cause performance issues. The component should be very lightweight with no expensive operations.

**Files to modify:** None (performance testing)

**Estimated effort:** 1 story point

- [ ] **29.1** Measure component initial render time in development mode
- [ ] **29.2** Measure component initial render time in production build
- [ ] **29.3** Check component bundle size impact with `npm run build` and analyze output
- [ ] **29.4** Verify no unnecessary re-renders with React DevTools Profiler
- [ ] **29.5** Verify component is pure (same props = same output)
- [ ] **29.6** Test component performance on low-end mobile device or CPU throttling in DevTools
- [ ] **29.7** Verify no memory leaks with rapid prop changes
- [ ] **29.8** Compare bundle size with other similar components
- [ ] **29.9** Verify flag emojis don't cause encoding or rendering performance issues
- [ ] **29.10** Document performance metrics and create follow-up optimization tasks if needed

## 30. Final TypeScript Compilation and Linting

**Context:** Run full TypeScript compilation and linting to ensure no errors were introduced and all code follows project standards.

**Files to modify:** None (verification)

**Estimated effort:** 1 story point

- [ ] **30.1** Run full TypeScript compilation: `npx tsc --noEmit`
- [ ] **30.2** Verify no TypeScript errors in component file
- [ ] **30.3** Verify no TypeScript errors in test file
- [ ] **30.4** Verify no TypeScript errors in barrel export file
- [ ] **30.5** Run linter: `npm run lint`
- [ ] **30.6** Fix any linting errors or warnings (preferably none)
- [ ] **30.7** Verify no unused imports in component file
- [ ] **30.8** Verify no unused variables in component file
- [ ] **30.9** Run prettier/formatter if configured in project
- [ ] **30.10** Verify all files follow project code style guidelines

## 31. Build Verification

**Context:** Run a full production build to ensure the component doesn't break the build process and doesn't introduce excessive bundle size.

**Files to modify:** None (build verification)

**Estimated effort:** 1 story point

- [ ] **31.1** Run production build: `npm run build`
- [ ] **31.2** Verify build completes successfully without errors
- [ ] **31.3** Check build output for any warnings related to new component
- [ ] **31.4** Analyze bundle size impact (should be minimal - no external dependencies)
- [ ] **31.5** Verify component is tree-shakeable (exports are properly structured)
- [ ] **31.6** Check that flag emojis are properly encoded in production build
- [ ] **31.7** Test production build locally with `npm run start`
- [ ] **31.8** Verify component works correctly in production mode (no dev-only issues)
- [ ] **31.9** Check browser console for any warnings or errors in production build
- [ ] **31.10** Document build size impact in implementation notes

## 32. Create Component Demo/Storybook (Optional)

**Context:** If the project uses Storybook or a similar component documentation tool, create a story/demo showing the component in various configurations.

**Files to modify:**
- Create: `src/components/guest/LanguageIndicator/LanguageIndicator.stories.tsx` (if Storybook configured)

**Estimated effort:** 1 story point

- [ ] **32.1** Check if Storybook is configured in the project (look for .storybook directory)
- [ ] **32.2** If Storybook exists, create story file for component
- [ ] **32.3** Create default story: displaying French with no translation context
- [ ] **32.4** Create story: displaying French with translation from English (subtitle shown)
- [ ] **32.5** Create story: small size variant
- [ ] **32.6** Create story: medium size variant
- [ ] **32.7** Create story showing all 6 languages in a grid
- [ ] **32.8** Create story: showTranslationContext disabled
- [ ] **32.9** Add controls for interacting with displayLanguage, originalLanguage, size, showTranslationContext
- [ ] **32.10** Add documentation text explaining component purpose and read-only nature
- [ ] **32.11** Test all stories render correctly in Storybook
- [ ] **32.12** If no Storybook, skip this task and note in implementation summary

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Component implementation | Create |
| `src/components/guest/LanguageIndicator/index.ts` | Barrel export | Create |
| `src/components/guest/LanguageIndicator/__tests__/LanguageIndicator.test.tsx` | Unit tests | Create |
| `src/components/guest/LanguageIndicator/__tests__/integration.example.tsx` | Integration example (documentation) | Create |
| `src/components/guest/LanguageIndicator/LanguageIndicator.stories.tsx` | Storybook story (if applicable) | Create |

### Reference Files (Read Only - For Pattern Guidance)

| File | Purpose |
|------|---------|
| `src/contexts/LocaleContext.tsx` | SUPPORTED_LOCALES for flag emoji consistency (lines 79-86) |
| `src/lib/utils.ts` | Import cn() utility for className merging |
| `src/types/l10n.ts` | Import SupportedLanguage type (from REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage` type

### Blocks (Requires This First)
- **REQ-E04-013** (Create Barrel Exports for Guest Components): Needs this component completed
- **REQ-E04-017** (Update ItemDisplay Component): May integrate this component in header

### Parallel Safety
- **Files touched**: New files only (`src/components/guest/LanguageIndicator/*`)
- **Conflicts with**: None (new component, no file overlap)
- **Safe to parallelize with**: REQ-E04-008, REQ-E04-009, REQ-E04-010, REQ-E04-011 (all create separate components)

### External Dependencies
- **React**: Already installed (component framework)
- **React Testing Library**: Already installed (for tests)
- **Tailwind CSS**: Already configured in project
- **No icon libraries needed**: Uses native Unicode flag emojis

## Verification Checklist

Before marking this task as complete, verify:

- [ ] Component renders correctly in development mode
- [ ] Flag emoji displays for all 6 supported languages
- [ ] Native language names display correctly (Français, Español, Deutsch, Nederlands, Italiano)
- [ ] Subtitle "Translated from [Language]" appears when viewing translation
- [ ] Subtitle hidden when viewing original (originalLanguage === displayLanguage)
- [ ] Subtitle hidden when originalLanguage is undefined
- [ ] Subtitle hidden when showTranslationContext is false
- [ ] Small size variant uses correct text sizes (flag text-base, name text-sm, subtitle text-xs)
- [ ] Medium size variant uses correct text sizes (flag text-lg, name text-base, subtitle text-sm)
- [ ] Container has role="status" attribute
- [ ] Container has aria-label with full context
- [ ] Flag emoji has aria-hidden="true" attribute
- [ ] Flag emojis exactly match LocaleContext.tsx SUPPORTED_LOCALES
- [ ] Native names exactly match LocaleContext.tsx SUPPORTED_LOCALES
- [ ] Component uses inline-flex layout with gap-2
- [ ] Flag has flex-shrink-0 to prevent shrinking
- [ ] Language info uses flex-col for vertical stacking
- [ ] Text colors provide adequate contrast (text-gray-900, text-gray-500)
- [ ] Flag emojis render correctly on iOS, Android, Windows, macOS
- [ ] Component fits well in header layouts
- [ ] Component is visually compact and unobtrusive
- [ ] Component works on mobile viewports (320px and up)
- [ ] Component works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Screen reader announces language correctly (not flag emoji)
- [ ] ARIA label includes translation context when applicable
- [ ] TypeScript compilation passes with no errors: `npx tsc --noEmit`
- [ ] Linting passes with no errors: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Test coverage is above 80%: `npm run test:coverage`
- [ ] Production build succeeds: `npm run build`
- [ ] Component is properly exported via barrel export file
- [ ] JSDoc documentation is comprehensive and renders correctly in IDE
- [ ] Custom className prop works correctly for external styling
- [ ] Integration example clearly demonstrates header usage

---

**Last Modified:** 2026-01-22 23:03
**Agent:** Senior Developer - Task Breakdown Specialist
**Status:** PENDING
**Task ID:** 3.5 - Create LanguageIndicator Component
**Epic:** 4 - Guest Experience
**Phase:** 3 - Guest UI Components
