# Update ItemDisplay Component (Client Component) - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:24
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #17 - REQ-E04-017)
- Overview: docs/REQ-E04-017-update-itemdisplay-component-client-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

**Last Modified:** 2026-01-22 23:24

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

Update the ItemDisplay client component (`src/components/ItemDisplay.tsx`) to integrate all Epic 4 guest language features, including language switching, translation banners, and original content toggling. This is the final integration point that brings together all guest UI components (REQ-E04-008 through REQ-E04-012), the useGuestLanguage hook (REQ-E04-014), and translation metadata from the server component (REQ-E04-016).

**Key Features:**
- Accept `translationMeta` prop from server component with language information
- Integrate `useGuestLanguage` hook for client-side language state management
- Add `GuestLanguageSwitcher` to header for language selection (desktop: dropdown, mobile: compact indicator)
- Add `TranslationBanner` when displaying translated content
- Add `MissingTranslationBanner` when translation unavailable (fallback language)
- Add `ViewOriginalToggle` button for switching between translation and original
- Handle client-side content display based on `showOriginal` state
- Maintain backward compatibility with existing non-translated items
- Responsive design for mobile and desktop

**Size:** L (8-10 hours estimated effort)

---

## 1. Review Existing ItemDisplay Component

**Context:** Before making changes, understand the current component structure and functionality.

**Files to reference:** `src/components/ItemDisplay.tsx` (current implementation)

**Estimated effort:** 1 story point

- [ ] **1.1** Read `src/components/ItemDisplay.tsx` to understand current structure
- [ ] **1.2** Identify the current props interface (ItemDisplayProps)
- [ ] **1.3** Review existing state management (useState hooks)
- [ ] **1.4** Review existing useEffect hooks (visit tracking, reactions)
- [ ] **1.5** Identify the header section structure
- [ ] **1.6** Identify content sections (description, reactions, links, articles)
- [ ] **1.7** Note existing responsive design patterns (sm:, md:, hidden, block)
- [ ] **1.8** Document existing imports and dependencies
- [ ] **1.9** Understand how item data is currently rendered
- [ ] **1.10** Note existing className patterns and Tailwind usage

---

## 2. Verify TranslationMeta Interface Exists

**Context:** Ensure the TranslationMeta interface is defined (should be from REQ-E04-016).

**Files to reference:** `src/types/index.ts` (or wherever types are defined)

**Estimated effort:** 1 story point

- [ ] **2.1** Read `src/types/index.ts` to check for TranslationMeta interface
- [ ] **2.2** Verify interface has requestedLanguage property
- [ ] **2.3** Verify interface has displayLanguage property
- [ ] **2.4** Verify interface has availableLanguages array
- [ ] **2.5** Verify interface has isTranslated boolean
- [ ] **2.6** Verify interface has originalLanguage property
- [ ] **2.7** Verify ItemDisplayProps has optional translationMeta prop
- [ ] **2.8** If interfaces don't exist, document that REQ-E04-016 must complete first
- [ ] **2.9** Verify SupportedLanguage type is available from '@/types'

---

## 3. Add Guest Component and Hook Imports

**Context:** Import all guest UI components and the useGuestLanguage hook.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Locate import section at top of ItemDisplay.tsx
- [ ] **3.2** Add guest components import section comment: `// Epic 4: Guest Experience Components`
- [ ] **3.3** Add import: `import {`
- [ ] **3.4** Import GuestLanguageSwitcher: `  GuestLanguageSwitcher,`
- [ ] **3.5** Import TranslationBanner: `  TranslationBanner,`
- [ ] **3.6** Import MissingTranslationBanner: `  MissingTranslationBanner,`
- [ ] **3.7** Import ViewOriginalToggle: `  ViewOriginalToggle,`
- [ ] **3.8** Import LanguageIndicator: `  LanguageIndicator,`
- [ ] **3.9** Close import: `} from '@/components/guest';`
- [ ] **3.10** Add hook import: `import { useGuestLanguage } from '@/hooks';`
- [ ] **3.11** Verify existing imports remain intact (useState, useEffect, useTranslations, etc.)
- [ ] **3.12** Verify no duplicate imports
- [ ] **3.13** Run TypeScript compiler to verify imports resolve

---

## 4. Integrate useGuestLanguage Hook

**Context:** Add the useGuestLanguage hook to manage language state.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Locate the ItemDisplay function definition
- [ ] **4.2** After existing useState hooks, add comment: `// Guest language state management`
- [ ] **4.3** Call useGuestLanguage hook: `const {`
- [ ] **4.4** Destructure currentLanguage: `  currentLanguage,`
- [ ] **4.5** Destructure showOriginal: `  showOriginal,`
- [ ] **4.6** Destructure setLanguage: `  setLanguage,`
- [ ] **4.7** Destructure toggleOriginal: `  toggleOriginal,`
- [ ] **4.8** Destructure isLoading with alias: `  isLoading: languageLoading,`
- [ ] **4.9** Destructure setAvailableLanguages: `  setAvailableLanguages,`
- [ ] **4.10** Close destructuring: `} = useGuestLanguage();`
- [ ] **4.11** Verify TypeScript recognizes all destructured values
- [ ] **4.12** Add comment explaining hook manages client-side language state

---

## 5. Initialize Available Languages from translationMeta

**Context:** Sync available languages with the hook when translationMeta changes.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Locate or create useEffect section after hook declarations
- [ ] **5.2** Add comment: `// Initialize available languages from server metadata`
- [ ] **5.3** Create useEffect: `useEffect(() => {`
- [ ] **5.4** Check if translationMeta exists: `if (translationMeta?.availableLanguages) {`
- [ ] **5.5** Call setAvailableLanguages: `setAvailableLanguages(translationMeta.availableLanguages);`
- [ ] **5.6** Close conditional: `}`
- [ ] **5.7** Add dependency array: `}, [translationMeta?.availableLanguages, setAvailableLanguages]);`
- [ ] **5.8** Verify useEffect runs when translationMeta changes
- [ ] **5.9** Add comment explaining synchronization purpose

---

## 6. Calculate Display Content and Fallback State

**Context:** Determine which content to display based on showOriginal state.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** After useEffect hooks, add comment: `// Determine display content based on showOriginal state`
- [ ] **6.2** Define displayContent: `const displayContent = showOriginal ? item : item;`
- [ ] **6.3** Add comment explaining API already returns translated content in item
- [ ] **6.4** Add comment: `// Check if showing fallback language`
- [ ] **6.5** Calculate isShowingFallback: `const isShowingFallback =`
- [ ] **6.6** Check isTranslated: `  translationMeta?.isTranslated &&`
- [ ] **6.7** Check not showing original: `  !showOriginal &&`
- [ ] **6.8** Check language mismatch: `  translationMeta.requestedLanguage !== translationMeta.displayLanguage;`
- [ ] **6.9** Add comment explaining this means translation was requested but unavailable
- [ ] **6.10** Verify TypeScript types for all calculated values

---

## 7. Update Header Section - Add Responsive Language Controls

**Context:** Add language switcher to header with responsive desktop/mobile variants.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Locate the header section (`<div className="bg-white shadow-sm border-b border-gray-200">`)
- [ ] **7.2** Locate the right side of header (where VisitCounter is)
- [ ] **7.3** Find the container with VisitCounter: `<div className="ml-4 flex items-center gap-3 flex-shrink-0">`
- [ ] **7.4** Before VisitCounter, add comment: `{/* Language Controls (only if translations available) */}`
- [ ] **7.5** Add conditional wrapper: `{translationMeta && translationMeta.availableLanguages.length > 1 && (`
- [ ] **7.6** Add fragment: `<>`
- [ ] **7.7** Add desktop comment: `{/* Desktop: Language Switcher */}`
- [ ] **7.8** Add desktop wrapper: `<div className="hidden sm:block">`
- [ ] **7.9** Add GuestLanguageSwitcher component with props
- [ ] **7.10** Close desktop wrapper: `</div>`
- [ ] **7.11** Add mobile comment: `{/* Mobile: Language Indicator (compact) */}`
- [ ] **7.12** Add mobile wrapper: `<div className="sm:hidden">`
- [ ] **7.13** Add LanguageIndicator component with props
- [ ] **7.14** Close mobile wrapper: `</div>`
- [ ] **7.15** Close fragment: `</>`
- [ ] **7.16** Close conditional: `)}`
- [ ] **7.17** Verify VisitCounter remains after language controls
- [ ] **7.18** Verify responsive classes work correctly

---

## 8. Add GuestLanguageSwitcher Props

**Context:** Configure the GuestLanguageSwitcher component with correct props.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Inside desktop GuestLanguageSwitcher, add opening tag: `<GuestLanguageSwitcher`
- [ ] **8.2** Add currentLanguage prop: `currentLanguage={currentLanguage}`
- [ ] **8.3** Add availableLanguages prop: `availableLanguages={translationMeta.availableLanguages}`
- [ ] **8.4** Add onLanguageChange prop: `onLanguageChange={setLanguage}`
- [ ] **8.5** Close component: `/>`
- [ ] **8.6** Verify all props match GuestLanguageSwitcher interface
- [ ] **8.7** Verify TypeScript validates prop types

---

## 9. Add LanguageIndicator Props (Mobile)

**Context:** Configure the LanguageIndicator component for mobile header.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Inside mobile LanguageIndicator, add opening tag: `<LanguageIndicator`
- [ ] **9.2** Add displayLanguage prop: `displayLanguage={currentLanguage}`
- [ ] **9.3** Add originalLanguage prop: `originalLanguage={translationMeta.originalLanguage}`
- [ ] **9.4** Add size prop for mobile: `size="sm"`
- [ ] **9.5** Close component: `/>`
- [ ] **9.6** Verify all props match LanguageIndicator interface
- [ ] **9.7** Verify compact display on mobile

---

## 10. Add Translation Banners Section

**Context:** Add translation status banners below header, before main content.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Locate main content area (after header, before description)
- [ ] **10.2** Find the div: `<div className="max-w-4xl mx-auto px-4 py-8">`
- [ ] **10.3** At the beginning of content, add comment: `{/* Translation Banners */}`
- [ ] **10.4** Add conditional wrapper: `{translationMeta && !showOriginal && (`
- [ ] **10.5** Add fragment: `<>`
- [ ] **10.6** Add success banner comment: `{/* Show TranslationBanner when successfully translated */}`
- [ ] **10.7** Add success banner conditional: `{translationMeta.isTranslated && !isShowingFallback && (`
- [ ] **10.8** Add TranslationBanner component (configured in next task)
- [ ] **10.9** Close success conditional: `)}`
- [ ] **10.10** Add blank line for spacing
- [ ] **10.11** Add fallback banner comment: `{/* Show MissingTranslationBanner when fallback language displayed */}`
- [ ] **10.12** Add fallback banner conditional: `{isShowingFallback && (`
- [ ] **10.13** Add MissingTranslationBanner component (configured in next task)
- [ ] **10.14** Close fallback conditional: `)}`
- [ ] **10.15** Close fragment: `</>`
- [ ] **10.16** Close outer conditional: `)}`

---

## 11. Add TranslationBanner Props

**Context:** Configure the TranslationBanner component with correct props.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Inside TranslationBanner conditional, add opening tag: `<TranslationBanner`
- [ ] **11.2** Add sourceLanguage prop: `sourceLanguage={translationMeta.originalLanguage}`
- [ ] **11.3** Add onViewOriginal prop: `onViewOriginal={toggleOriginal}`
- [ ] **11.4** Add className for spacing: `className="mb-6"`
- [ ] **11.5** Close component: `/>`
- [ ] **11.6** Verify all props match TranslationBanner interface
- [ ] **11.7** Verify banner only shows when actually translated

---

## 12. Add MissingTranslationBanner Props

**Context:** Configure the MissingTranslationBanner component with correct props.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** Inside MissingTranslationBanner conditional, add opening tag: `<MissingTranslationBanner`
- [ ] **12.2** Add requestedLanguage prop: `requestedLanguage={translationMeta.requestedLanguage}`
- [ ] **12.3** Add fallbackLanguage prop: `fallbackLanguage={translationMeta.displayLanguage}`
- [ ] **12.4** Add className for spacing: `className="mb-6"`
- [ ] **12.5** Close component: `/>`
- [ ] **12.6** Verify all props match MissingTranslationBanner interface
- [ ] **12.7** Verify banner only shows when fallback language is displayed

---

## 13. Add ViewOriginalToggle Component

**Context:** Add the toggle button for switching between translation and original content.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** After translation banners, before description section, add comment: `{/* View Original Toggle (when translation exists) */}`
- [ ] **13.2** Add conditional wrapper: `{translationMeta && translationMeta.isTranslated && (`
- [ ] **13.3** Add ViewOriginalToggle opening tag: `<ViewOriginalToggle`
- [ ] **13.4** Add isViewingOriginal prop: `isViewingOriginal={showOriginal}`
- [ ] **13.5** Add originalLanguage prop: `originalLanguage={translationMeta.originalLanguage}`
- [ ] **13.6** Add onToggle prop: `onToggle={toggleOriginal}`
- [ ] **13.7** Add className for spacing: `className="mb-6"`
- [ ] **13.8** Close component: `/>`
- [ ] **13.9** Close conditional: `)}`
- [ ] **13.10** Verify toggle only shows when translation exists
- [ ] **13.11** Verify toggle state syncs with showOriginal

---

## 14. Update Description Section to Use displayContent

**Context:** Replace item references with displayContent for translated text.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **14.1** Locate description section: `{item.description && (`
- [ ] **14.2** Change conditional to use displayContent: `{displayContent.description && (`
- [ ] **14.3** Locate description text rendering: `<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">`
- [ ] **14.4** Change to use displayContent: `{displayContent.description}`
- [ ] **14.5** Verify TypeScript validates displayContent.description
- [ ] **14.6** Verify description section still renders correctly

---

## 15. Update Header Title to Use displayContent

**Context:** Ensure the header title shows translated name.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Locate header h1 title: `<h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">`
- [ ] **15.2** Find the content: `{item.name}`
- [ ] **15.3** Change to use displayContent: `{displayContent.name}`
- [ ] **15.4** Verify item.publicId remains using item (never translates)
- [ ] **15.5** Verify TypeScript validates displayContent.name
- [ ] **15.6** Verify title updates when language changes

---

## 16. Update Links Section to Use displayContent

**Context:** Ensure links show translated titles.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **16.1** Locate links section: `{item.links && item.links.length > 0 && (`
- [ ] **16.2** Change conditional to use displayContent: `{displayContent.links && displayContent.links.length > 0 && (`
- [ ] **16.3** Locate links map: `{item.links.map((link) => (`
- [ ] **16.4** Change to use displayContent: `{displayContent.links.map((link) => (`
- [ ] **16.5** Verify LinkCard receives translated link data
- [ ] **16.6** Verify links section renders correctly

---

## 17. Update Articles Section to Use displayContent (If Exists)

**Context:** Ensure articles show translated content if articles feature exists.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Search for articles section in component
- [ ] **17.2** If articles section exists, locate: `{item.articles && item.articles.length > 0 && (`
- [ ] **17.3** Change conditional to use displayContent: `{displayContent.articles && displayContent.articles.length > 0 && (`
- [ ] **17.4** Locate articles map: `{item.articles.map((article) => (`
- [ ] **17.5** Change to use displayContent: `{displayContent.articles.map((article) => (`
- [ ] **17.6** Verify article cards receive translated data
- [ ] **17.7** If no articles section exists, skip this task
- [ ] **17.8** Document whether articles were updated

---

## 18. Verify ID Fields Still Use item (Never Translate)

**Context:** Ensure IDs and non-translatable fields continue using item directly.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **18.1** Verify item.id is never changed to displayContent.id
- [ ] **18.2** Verify item.publicId is never changed to displayContent.publicId
- [ ] **18.3** Verify any userId or ownerId fields use item
- [ ] **18.4** Verify createdAt, updatedAt timestamps use item
- [ ] **18.5** Verify qrCodeUrl uses item (not translated)
- [ ] **18.6** Document all fields that should NOT use displayContent
- [ ] **18.7** Add comments where needed to clarify ID usage

---

## 19. Handle Backward Compatibility for No translationMeta

**Context:** Ensure component works correctly when translationMeta is undefined.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **19.1** Verify all translationMeta access uses optional chaining: `translationMeta?.property`
- [ ] **19.2** Verify displayContent defaults to item when no translationMeta
- [ ] **19.3** Verify no guest UI components render without translationMeta
- [ ] **19.4** Verify useGuestLanguage hook doesn't crash without translationMeta
- [ ] **19.5** Test component renders with just item prop (no translationMeta)
- [ ] **19.6** Verify existing functionality unchanged without translationMeta
- [ ] **19.7** Add comments explaining optional prop behavior

---

## 20. Verify TypeScript Compilation

**Context:** Ensure all changes compile without TypeScript errors.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **20.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **20.2** Verify no errors in `src/components/ItemDisplay.tsx`
- [ ] **20.3** Verify all guest component imports resolve
- [ ] **20.4** Verify useGuestLanguage hook import resolves
- [ ] **20.5** Verify TranslationMeta type is recognized
- [ ] **20.6** Verify all component props match expected interfaces
- [ ] **20.7** Verify displayContent type is correct (same as item)
- [ ] **20.8** Fix any TypeScript errors found
- [ ] **20.9** Re-run type check until all errors resolved

---

## 21. Test Component Rendering Without translationMeta

**Context:** Verify backward compatibility with existing usage.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Start development server: `npm run dev`
- [ ] **21.2** Visit item page for demo data (no translations)
- [ ] **21.3** Verify component renders correctly
- [ ] **21.4** Verify no language controls appear in header
- [ ] **21.5** Verify no translation banners appear
- [ ] **21.6** Verify no ViewOriginalToggle appears
- [ ] **21.7** Verify existing functionality works (reactions, links, visit counter)
- [ ] **21.8** Verify no console errors or warnings
- [ ] **21.9** Verify component doesn't crash
- [ ] **21.10** Document backward compatibility test results

---

## 22. Test Component Rendering With translationMeta

**Context:** Verify translation UI appears correctly when metadata provided.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Visit item page with translation: `/item/abc123?lang=fr`
- [ ] **22.2** Verify GuestLanguageSwitcher appears in header (desktop)
- [ ] **22.3** Verify LanguageIndicator appears on mobile (resize to < 640px)
- [ ] **22.4** Verify TranslationBanner appears if translated
- [ ] **22.5** Verify banner shows correct source language
- [ ] **22.6** Verify ViewOriginalToggle appears
- [ ] **22.7** Verify translated content displays correctly
- [ ] **22.8** Verify item name is translated in header
- [ ] **22.9** Verify item description is translated
- [ ] **22.10** Verify links have translated titles
- [ ] **22.11** Document translation UI test results

---

## 23. Test Language Switching

**Context:** Verify language switcher changes language correctly.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Visit item page with default language
- [ ] **23.2** Open GuestLanguageSwitcher dropdown
- [ ] **23.3** Verify all available languages are listed
- [ ] **23.4** Verify current language has checkmark
- [ ] **23.5** Select a different language (e.g., French)
- [ ] **23.6** Verify URL parameter updates: `?lang=fr`
- [ ] **23.7** Verify cookie is set: FAQBNB_GUEST_LANG
- [ ] **23.8** Verify content updates to French (if available)
- [ ] **23.9** Refresh page and verify language persists
- [ ] **23.10** Test switching between all supported languages
- [ ] **23.11** Document language switching test results

---

## 24. Test View Original Toggle

**Context:** Verify toggling between translation and original works.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** Visit item page with translated content: `/item/abc123?lang=fr`
- [ ] **24.2** Verify ViewOriginalToggle button is present
- [ ] **24.3** Verify button text shows: "View in original (English)" or similar
- [ ] **24.4** Click ViewOriginalToggle button
- [ ] **24.5** Verify showOriginal state toggles to true
- [ ] **24.6** Verify content switches to original language
- [ ] **24.7** Verify TranslationBanner disappears
- [ ] **24.8** Verify button text changes to: "View translation"
- [ ] **24.9** Click button again to toggle back
- [ ] **24.10** Verify content switches back to translation
- [ ] **24.11** Verify TranslationBanner reappears
- [ ] **24.12** Verify toggle state persists during session
- [ ] **24.13** Document toggle functionality test results

---

## 25. Test MissingTranslationBanner Display

**Context:** Verify fallback banner shows when translation unavailable.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Visit item page requesting unavailable language: `/item/abc123?lang=it` (if Italian not available)
- [ ] **25.2** Verify MissingTranslationBanner appears
- [ ] **25.3** Verify banner shows requested language (Italian)
- [ ] **25.4** Verify banner shows fallback language (e.g., English)
- [ ] **25.5** Verify content is displayed in fallback language
- [ ] **25.6** Verify TranslationBanner does NOT appear
- [ ] **25.7** Verify isShowingFallback calculation is correct
- [ ] **25.8** Test with multiple unavailable languages
- [ ] **25.9** Document fallback banner test results

---

## 26. Test Responsive Design

**Context:** Verify responsive layout works on mobile and desktop.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Open browser DevTools and enable responsive mode
- [ ] **26.2** Test at 320px width (small mobile)
- [ ] **26.3** Verify LanguageIndicator appears (not GuestLanguageSwitcher)
- [ ] **26.4** Verify header elements don't overflow or wrap poorly
- [ ] **26.5** Verify translation banners are readable
- [ ] **26.6** Verify ViewOriginalToggle fits on screen
- [ ] **26.7** Test at 640px width (tablet breakpoint)
- [ ] **26.8** Verify GuestLanguageSwitcher appears at sm: breakpoint
- [ ] **26.9** Test at 1024px width (desktop)
- [ ] **26.10** Verify all elements have proper spacing
- [ ] **26.11** Test on actual mobile device if available
- [ ] **26.12** Document responsive design test results

---

## 27. Test Header Layout with All Elements

**Context:** Verify header accommodates logo, title, language controls, and visit counter.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **27.1** Visit item page with translation
- [ ] **27.2** Verify logo appears and is properly sized (40x40px)
- [ ] **27.3** Verify title truncates properly if too long
- [ ] **27.4** Verify public ID displays below title
- [ ] **27.5** Verify GuestLanguageSwitcher doesn't push other elements off screen
- [ ] **27.6** Verify VisitCounter remains visible
- [ ] **27.7** Test with very long item names (50+ characters)
- [ ] **27.8** Verify ellipsis (...) appears for truncated text
- [ ] **27.9** Test header at different viewport widths
- [ ] **27.10** Verify no elements overlap
- [ ] **27.11** Document header layout test results

---

## 28. Test useGuestLanguage Hook Integration

**Context:** Verify hook state updates correctly trigger component re-renders.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **28.1** Open React DevTools > Components tab
- [ ] **28.2** Locate ItemDisplay component in tree
- [ ] **28.3** Inspect useGuestLanguage hook state
- [ ] **28.4** Verify currentLanguage matches URL parameter
- [ ] **28.5** Verify showOriginal is initially false
- [ ] **28.6** Change language via switcher
- [ ] **28.7** Verify currentLanguage updates in hook state
- [ ] **28.8** Toggle original content
- [ ] **28.9** Verify showOriginal updates in hook state
- [ ] **28.10** Verify component re-renders with new state
- [ ] **28.11** Check for unnecessary re-renders (performance)
- [ ] **28.12** Document hook integration test results

---

## 29. Test State Synchronization

**Context:** Verify state stays synchronized across URL, cookie, and component.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **29.1** Visit item page with URL parameter: `?lang=fr`
- [ ] **29.2** Verify currentLanguage matches URL (fr)
- [ ] **29.3** Verify cookie is set: FAQBNB_GUEST_LANG=fr
- [ ] **29.4** Refresh page
- [ ] **29.5** Verify language persists (fr)
- [ ] **29.6** Remove URL parameter (visit base URL)
- [ ] **29.7** Verify language persists from cookie
- [ ] **29.8** Clear cookie and URL parameter
- [ ] **29.9** Verify fallback to Accept-Language or default
- [ ] **29.10** Change language via switcher
- [ ] **29.11** Verify URL parameter updates
- [ ] **29.12** Verify cookie updates
- [ ] **29.13** Document state synchronization test results

---

## 30. Test Loading States

**Context:** Verify component handles loading states gracefully.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **30.1** Check if languageLoading state is used in component
- [ ] **30.2** If not used, verify component doesn't flash during load
- [ ] **30.3** Visit item page and watch initial render
- [ ] **30.4** Verify no blank content flash
- [ ] **30.5** Verify guest components appear smoothly
- [ ] **30.6** Change language and observe transition
- [ ] **30.7** Verify smooth content update (no flicker)
- [ ] **30.8** Test with slow network (DevTools throttling)
- [ ] **30.9** Verify loading doesn't block interaction
- [ ] **30.10** Document loading state behavior

---

## 31. Test Existing Functionality Unchanged

**Context:** Verify all existing features still work correctly.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **31.1** Test reaction buttons (like, love, helpful)
- [ ] **31.2** Verify reactions can be added
- [ ] **31.3** Verify reaction counts update
- [ ] **31.4** Test visit counter increments
- [ ] **31.5** Test link clicks and analytics tracking
- [ ] **31.6** Verify selectedLink state works
- [ ] **31.7** Test any existing modals or dialogs
- [ ] **31.8** Verify empty states display correctly
- [ ] **31.9** Test error handling (if any)
- [ ] **31.10** Verify all existing useEffect hooks run correctly
- [ ] **31.11** Document existing functionality verification

---

## 32. Test Edge Cases and Error Scenarios

**Context:** Verify component handles edge cases gracefully.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **32.1** Test with empty availableLanguages array
- [ ] **32.2** Test with single language (no switcher should appear)
- [ ] **32.3** Test with undefined translationMeta properties
- [ ] **32.4** Test with invalid currentLanguage
- [ ] **32.5** Test rapid language switching (multiple clicks)
- [ ] **32.6** Test toggling original multiple times rapidly
- [ ] **32.7** Test with very long item names (100+ characters)
- [ ] **32.8** Test with empty item description
- [ ] **32.9** Test with no links
- [ ] **32.10** Test with malformed translationMeta
- [ ] **32.11** Verify no crashes or console errors
- [ ] **32.12** Document edge case handling

---

## 33. ESLint and Code Quality Verification

**Context:** Ensure code passes linting and follows project conventions.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **33.1** Run ESLint: `npm run lint`
- [ ] **33.2** Verify no errors in `src/components/ItemDisplay.tsx`
- [ ] **33.3** Fix any linting errors found
- [ ] **33.4** Verify consistent code formatting
- [ ] **33.5** Verify consistent Tailwind className usage
- [ ] **33.6** Verify no unused imports
- [ ] **33.7** Verify no unused variables
- [ ] **33.8** Verify proper component naming conventions
- [ ] **33.9** Verify proper comment formatting
- [ ] **33.10** Re-run lint after fixes
- [ ] **33.11** Document code quality verification

---

## 34. Build Verification

**Context:** Ensure the updated component builds successfully.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **34.1** Run build command: `npm run build`
- [ ] **34.2** Verify build completes successfully
- [ ] **34.3** Verify no build errors related to ItemDisplay
- [ ] **34.4** Verify no build warnings
- [ ] **34.5** Check build output size
- [ ] **34.6** Verify guest components are included in bundle
- [ ] **34.7** Test production build locally: `npm run start`
- [ ] **34.8** Visit item page in production mode
- [ ] **34.9** Verify all translation features work in production
- [ ] **34.10** Verify no console errors in production
- [ ] **34.11** Document build verification results

---

## 35. Performance Verification

**Context:** Verify component doesn't introduce performance issues.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **35.1** Open React DevTools Profiler
- [ ] **35.2** Profile component rendering
- [ ] **35.3** Verify render time is acceptable (< 100ms)
- [ ] **35.4** Check for unnecessary re-renders
- [ ] **35.5** Profile language switching
- [ ] **35.6** Profile original content toggling
- [ ] **35.7** Verify useCallback is used for functions in hook
- [ ] **35.8** Verify useMemo is used if needed (probably not)
- [ ] **35.9** Test with large item data (many links, long description)
- [ ] **35.10** Verify smooth scrolling and interaction
- [ ] **35.11** Document performance metrics

---

## 36. Accessibility Verification

**Context:** Ensure translation UI is accessible.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **36.1** Test keyboard navigation through translation UI
- [ ] **36.2** Verify GuestLanguageSwitcher is keyboard accessible
- [ ] **36.3** Verify ViewOriginalToggle is keyboard accessible
- [ ] **36.4** Test with screen reader (VoiceOver or NVDA)
- [ ] **36.5** Verify translation banners are announced
- [ ] **36.6** Verify language changes are announced
- [ ] **36.7** Check ARIA attributes on guest components
- [ ] **36.8** Verify focus management during language changes
- [ ] **36.9** Test tab order is logical
- [ ] **36.10** Verify color contrast meets WCAG standards
- [ ] **36.11** Document accessibility verification

---

## 37. Cross-Browser Testing

**Context:** Verify component works across different browsers.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **37.1** Test in Chrome/Chromium
- [ ] **37.2** Test in Firefox
- [ ] **37.3** Test in Safari (if available)
- [ ] **37.4** Test in Edge
- [ ] **37.5** Verify language switcher works in all browsers
- [ ] **37.6** Verify translation banners display correctly
- [ ] **37.7** Verify responsive design works in all browsers
- [ ] **37.8** Check for browser-specific CSS issues
- [ ] **37.9** Verify no JavaScript errors in any browser
- [ ] **37.10** Document cross-browser compatibility

---

## 38. Integration Testing with Server Component

**Context:** Verify server component correctly passes data to client component.

**Files to modify:** None (integration testing)

**Estimated effort:** 1 story point

- [ ] **38.1** Verify server component (page.tsx) passes translationMeta prop
- [ ] **38.2** Open React DevTools > Components
- [ ] **38.3** Inspect ItemDisplay props
- [ ] **38.4** Verify translationMeta object is present
- [ ] **38.5** Verify all translationMeta properties are correct
- [ ] **38.6** Verify item data is correctly formatted
- [ ] **38.7** Test with different language parameters
- [ ] **38.8** Verify server detection matches client display
- [ ] **38.9** Test with demo data (no translationMeta)
- [ ] **38.10** Verify integration works end-to-end
- [ ] **38.11** Document integration test results

---

## 39. Final Visual Inspection

**Context:** Perform final visual review of all translation UI.

**Files to modify:** None (visual inspection)

**Estimated effort:** 1 story point

- [ ] **39.1** Review header layout and spacing
- [ ] **39.2** Verify GuestLanguageSwitcher styling matches design
- [ ] **39.3** Verify TranslationBanner styling is correct (light blue)
- [ ] **39.4** Verify MissingTranslationBanner styling is correct (gray)
- [ ] **39.5** Verify ViewOriginalToggle styling matches secondary buttons
- [ ] **39.6** Verify LanguageIndicator is compact and readable
- [ ] **39.7** Check spacing between all new elements
- [ ] **39.8** Verify consistent font sizes and weights
- [ ] **39.9** Verify consistent colors match design system
- [ ] **39.10** Check for any visual bugs or misalignments
- [ ] **39.11** Compare with design mockups if available
- [ ] **39.12** Document visual inspection results

---

## 40. Documentation and Comments Review

**Context:** Ensure code is well-documented for future maintenance.

**Files to modify:** `src/components/ItemDisplay.tsx` (add/improve comments)

**Estimated effort:** 1 story point

- [ ] **40.1** Review all added comments for clarity
- [ ] **40.2** Verify Epic 4 context is mentioned in comments
- [ ] **40.3** Add JSDoc comment to ItemDisplay function if needed
- [ ] **40.4** Document translationMeta prop in function documentation
- [ ] **40.5** Add inline comments explaining complex logic
- [ ] **40.6** Document displayContent calculation
- [ ] **40.7** Document isShowingFallback calculation
- [ ] **40.8** Add comments explaining conditional rendering
- [ ] **40.9** Document responsive design patterns
- [ ] **40.10** Add TODO comments for future improvements if any
- [ ] **40.11** Verify no misleading or outdated comments
- [ ] **40.12** Document that component is backward compatible

---

## Success Criteria

The task is complete when all of the following are verified:

1. ✅ File `src/components/ItemDisplay.tsx` updated with translation UI
2. ✅ All guest components imported from `@/components/guest`
3. ✅ useGuestLanguage hook integrated for state management
4. ✅ GuestLanguageSwitcher appears in header (desktop: dropdown, mobile: compact)
5. ✅ TranslationBanner appears when viewing translated content
6. ✅ MissingTranslationBanner appears when translation unavailable
7. ✅ ViewOriginalToggle button switches between translation and original
8. ✅ displayContent calculated based on showOriginal state
9. ✅ All rendered text uses displayContent (name, description, links, articles)
10. ✅ ID fields continue using item directly (never translate)
11. ✅ Backward compatibility maintained (works without translationMeta)
12. ✅ Responsive design works on mobile and desktop
13. ✅ TypeScript compilation passes with no errors
14. ✅ ESLint passes with no errors
15. ✅ Build completes successfully
16. ✅ All translation features work correctly in testing
17. ✅ Language switching updates content
18. ✅ Toggle original switches content instantly
19. ✅ State synchronizes across URL, cookie, and component
20. ✅ Existing functionality unchanged (reactions, links, visit tracking)
21. ✅ Performance is acceptable (no lag or flicker)
22. ✅ Accessibility verified (keyboard navigation, screen reader)
23. ✅ Cross-browser compatibility verified
24. ✅ Integration with server component verified
25. ✅ Epic 4 guest experience complete and functional

---

## Dependencies

**Depends On (Must Be Completed First):**
- REQ-E04-008: Create GuestLanguageSwitcher Component (provides language dropdown)
- REQ-E04-009: Create TranslationBanner Component (provides translation context banner)
- REQ-E04-010: Create MissingTranslationBanner Component (provides fallback banner)
- REQ-E04-011: Create ViewOriginalToggle Component (provides toggle button)
- REQ-E04-012: Create LanguageIndicator Component (provides compact indicator)
- REQ-E04-013: Create Barrel Exports for Guest Components (provides centralized import)
- REQ-E04-014: Create useGuestLanguage Hook (provides language state management)
- REQ-E04-016: Update Guest Item Page Server Component (provides translationMeta prop)

**Blocks (Cannot Start Until This Completes):**
- None - This is the final integration task for Epic 4 guest experience

**Parallel Safety:**
- ❌ Cannot be parallelized - This task depends on ALL previous Epic 4 tasks

---

## Authorized Files and Functions for Modification

### Files to Modify

1. **`src/components/ItemDisplay.tsx`**
   - Type: Client Component (Next.js 15 'use client')
   - Changes:
     - Add guest component imports from '@/components/guest'
     - Add useGuestLanguage hook import from '@/hooks'
     - Integrate useGuestLanguage hook for state management
     - Initialize available languages from translationMeta
     - Calculate displayContent based on showOriginal
     - Calculate isShowingFallback for banner display
     - Add GuestLanguageSwitcher to header (responsive: desktop dropdown, mobile indicator)
     - Add TranslationBanner below header
     - Add MissingTranslationBanner for fallback scenarios
     - Add ViewOriginalToggle before content sections
     - Replace all item references with displayContent for translated fields
     - Keep item references for non-translatable fields (id, publicId)
     - Add responsive design patterns for mobile/desktop

2. **`src/types/index.ts`** (if needed)
   - Type: TypeScript type definitions
   - Changes:
     - Verify TranslationMeta interface exists (should be from REQ-E04-016)
     - Verify ItemDisplayProps has optional translationMeta prop
     - Add interfaces if not already present

### Files to Reference (Read-Only)

1. **`src/components/guest/index.ts`** (from REQ-E04-013)
   - Reference: Barrel export of all guest components
   - Usage: Import all guest UI components

2. **`src/hooks/useGuestLanguage.ts`** (from REQ-E04-014)
   - Reference: Guest language state management hook
   - Usage: Manage language state, toggle original, sync with URL/cookie

3. **`src/app/item/[publicId]/page.tsx`** (from REQ-E04-016)
   - Reference: Server component that passes translationMeta
   - Usage: Understand prop contract and data flow

4. **`src/components/guest/*`** (from REQ-E04-008 through REQ-E04-012)
   - Reference: All guest UI component implementations
   - Usage: Understand component props and behavior

### Dependencies

**NPM Packages:**
- `react` (already installed) - useState, useEffect hooks
- `next-intl` (already installed) - useTranslations
- `@/components/guest` (from REQ-E04-013) - All guest UI components
- `@/hooks` (from REQ-E04-014) - useGuestLanguage hook

---

## Notes

**Component Architecture:**
ItemDisplay is a client component that:
- Receives item data and translationMeta from server component
- Uses useGuestLanguage hook for client-side language state
- Renders guest UI components conditionally based on translationMeta
- Handles content display toggle without refetching from server

**displayContent Pattern:**
```typescript
const displayContent = showOriginal ? item : item;
```
Note: API returns translated content in the item object already, so both branches use item. The showOriginal flag just tells UI components which language is being shown (affects banners and toggle button text).

**Responsive Design:**
- **Desktop (sm: and above)**: Full GuestLanguageSwitcher dropdown
- **Mobile (< sm:)**: Compact LanguageIndicator
- Pattern: `<div className="hidden sm:block">` and `<div className="sm:hidden">`

**Backward Compatibility:**
All translation UI is conditional:
```typescript
{translationMeta && <GuestComponents />}
```
Component works without translationMeta (existing behavior preserved).

**State Synchronization:**
useGuestLanguage hook handles:
- Reading from URL parameter
- Syncing with cookie
- Updating URL on language change
- ItemDisplay just consumes the state

**Banner Logic:**
- TranslationBanner: Show when `isTranslated && !isShowingFallback && !showOriginal`
- MissingTranslationBanner: Show when `isShowingFallback && !showOriginal`
- Only one banner at a time (mutually exclusive)

**Performance:**
- useGuestLanguage hook uses useCallback for functions (prevents unnecessary re-renders)
- Conditional rendering is efficient (React optimizes)
- No unnecessary API calls (server component handles fetching)

---

**Last Modified:** 2026-01-22 23:24
