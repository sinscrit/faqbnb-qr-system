# Update LinkCard Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:28
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #18 - REQ-E04-018)
- Overview: docs/REQ-E04-018-update-linkcard-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

**Last Modified:** 2026-01-22 23:28

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

Update the LinkCard component (`src/components/LinkCard.tsx`) to support displaying either translated or original link titles based on guest user preferences. When a guest toggles "View Original", link cards should display the original title instead of the translated version.

**Key Features:**
- Accept optional `originalTitle` prop for the untranslated title
- Accept optional `showOriginal` prop to control which title displays
- Display translated title by default (from `title` prop)
- Display original title when `showOriginal` is true and `originalTitle` exists
- Graceful fallback if `originalTitle` is missing
- Maintain backward compatibility (works without new props)
- No visual changes to card layout or styling

**Size:** S (2-3 hours estimated effort)

---

## 1. Review Existing LinkCard Component

**Context:** Before making changes, understand the current LinkCard implementation.

**Files to reference:** `src/components/LinkCard.tsx` (current implementation)

**Estimated effort:** 1 story point

- [ ] **1.1** Read `src/components/LinkCard.tsx` to understand current structure
- [ ] **1.2** Locate LinkCardProps interface definition (around line 1-11)
- [ ] **1.3** Review existing props: title, linkType, url, thumbnailUrl, onClick
- [ ] **1.4** Locate the component function signature (around line 8)
- [ ] **1.5** Find where title is rendered in the JSX (around line 129)
- [ ] **1.6** Review existing state and handlers (isHovering, handleClick)
- [ ] **1.7** Understand the thumbnail/icon logic
- [ ] **1.8** Note the badge display logic (linkType badges)
- [ ] **1.9** Document current className patterns and styling
- [ ] **1.10** Verify component is a client component or server component

---

## 2. Update LinkCardProps Interface

**Context:** Add new optional props to support translation toggling.

**Files to modify:** `src/components/LinkCard.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Locate LinkCardProps interface (around line 1-11)
- [ ] **2.2** After title property, add comment: `// Original untranslated title`
- [ ] **2.3** Add originalTitle property: `originalTitle?: string;`
- [ ] **2.4** Add comment: `// Whether to display original vs translated content`
- [ ] **2.5** Add showOriginal property: `showOriginal?: boolean;`
- [ ] **2.6** Verify interface syntax is correct
- [ ] **2.7** Verify all properties use proper TypeScript types
- [ ] **2.8** Verify optional properties use `?` modifier
- [ ] **2.9** Run TypeScript compiler to verify interface is valid
- [ ] **2.10** Document that these props are optional for backward compatibility

---

## 3. Update Component Function Signature

**Context:** Add new props to the component's destructured parameters.

**Files to modify:** `src/components/LinkCard.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Locate the LinkCard function signature (around line 8)
- [ ] **3.2** Find the destructured props: `{ title, linkType, url, thumbnailUrl, onClick }`
- [ ] **3.3** After title parameter, add: `originalTitle,`
- [ ] **3.4** After originalTitle, add: `showOriginal = false,`
- [ ] **3.5** Verify default value `= false` is set for showOriginal
- [ ] **3.6** Verify all parameters are properly comma-separated
- [ ] **3.7** Verify closing brace and parameter type: `}: LinkCardProps) {`
- [ ] **3.8** Run TypeScript compiler to verify signature is valid

---

## 4. Add displayTitle Calculation Logic

**Context:** Calculate which title to display based on showOriginal and originalTitle.

**Files to modify:** `src/components/LinkCard.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Locate the component body (after function signature, before return)
- [ ] **4.2** After existing state declarations, add comment: `// Determine which title to display based on showOriginal state`
- [ ] **4.3** Add displayTitle calculation: `const displayTitle = showOriginal && originalTitle ? originalTitle : title;`
- [ ] **4.4** Add inline comment explaining logic: `// Show original if toggled AND originalTitle exists, otherwise show translated`
- [ ] **4.5** Verify logic handles all cases:
  - showOriginal=false: use title
  - showOriginal=true, originalTitle exists: use originalTitle
  - showOriginal=true, originalTitle missing: fallback to title
- [ ] **4.6** Verify TypeScript infers correct type for displayTitle (string)

---

## 5. Update Title Rendering in JSX

**Context:** Replace hardcoded title reference with calculated displayTitle.

**Files to modify:** `src/components/LinkCard.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Locate the title rendering in JSX (around line 129)
- [ ] **5.2** Find the line that renders `{title}`
- [ ] **5.3** Replace `{title}` with `{displayTitle}`
- [ ] **5.4** Verify no other references to `title` in JSX need updating
- [ ] **5.5** Verify displayTitle is used only once (for the actual title display)
- [ ] **5.6** Verify no console.log or debug statements reference old title variable
- [ ] **5.7** Run TypeScript compiler to verify JSX is valid

---

## 6. Verify Link Type Definition Includes originalTitle

**Context:** Ensure the Link type/interface includes the originalTitle property.

**Files to reference:** `src/types/` or inline types in ItemDisplay.tsx

**Estimated effort:** 1 story point

- [ ] **6.1** Search for Link type definition in `src/types/index.ts`
- [ ] **6.2** If not found in index.ts, search in other type files
- [ ] **6.3** If not found in types directory, check inline in ItemDisplay.tsx
- [ ] **6.4** Verify Link interface includes: `originalTitle?: string;`
- [ ] **6.5** If originalTitle property is missing, document that it needs to be added
- [ ] **6.6** If missing, add originalTitle property to Link interface
- [ ] **6.7** Verify property is optional with `?` modifier
- [ ] **6.8** Run TypeScript compiler to verify type changes
- [ ] **6.9** Document location of Link type definition

---

## 7. Update ItemDisplay to Pass New Props

**Context:** Integrate LinkCard updates with ItemDisplay component.

**Files to modify:** `src/components/ItemDisplay.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Locate links mapping section in ItemDisplay (around lines 165-200)
- [ ] **7.2** Find the LinkCard component usage: `<LinkCard`
- [ ] **7.3** Verify existing props: key, title, linkType, url, thumbnailUrl, onClick
- [ ] **7.4** After title prop, add new line with proper indentation
- [ ] **7.5** Add originalTitle prop: `originalTitle={link.originalTitle}`
- [ ] **7.6** Add showOriginal prop: `showOriginal={showOriginal}`
- [ ] **7.7** Verify showOriginal comes from useGuestLanguage hook (should be in scope)
- [ ] **7.8** Verify link.originalTitle is typed correctly in Link interface
- [ ] **7.9** Run TypeScript compiler to verify prop passing is valid
- [ ] **7.10** Verify all props are properly aligned and formatted

---

## 8. Verify TypeScript Compilation

**Context:** Ensure all changes compile without TypeScript errors.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **8.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **8.2** Verify no errors in `src/components/LinkCard.tsx`
- [ ] **8.3** Verify no errors in `src/components/ItemDisplay.tsx`
- [ ] **8.4** Verify LinkCardProps interface is valid
- [ ] **8.5** Verify component function signature is valid
- [ ] **8.6** Verify displayTitle calculation type is correct
- [ ] **8.7** Verify Link type includes originalTitle if needed
- [ ] **8.8** Fix any TypeScript errors found
- [ ] **8.9** Re-run type check until all errors resolved

---

## 9. Test LinkCard with Translated Title

**Context:** Manually test that translated title displays correctly.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **9.1** Start development server: `npm run dev`
- [ ] **9.2** Visit item page with translations: `/item/abc123?lang=fr`
- [ ] **9.3** Locate link cards in the page
- [ ] **9.4** Verify link titles are displayed (should be translated from API)
- [ ] **9.5** Verify showOriginal is false by default
- [ ] **9.6** Verify translated titles display correctly
- [ ] **9.7** Check browser console for any errors
- [ ] **9.8** Verify card styling and layout unchanged
- [ ] **9.9** Document test results

---

## 10. Test View Original Toggle

**Context:** Verify that toggling to original displays original link titles.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **10.1** Visit item page with translations: `/item/abc123?lang=fr`
- [ ] **10.2** Locate the ViewOriginalToggle button
- [ ] **10.3** Note the current link titles (should be translated)
- [ ] **10.4** Click ViewOriginalToggle button to enable "show original"
- [ ] **10.5** Verify showOriginal state changes to true
- [ ] **10.6** Verify link titles switch to original language
- [ ] **10.7** Click toggle again to switch back
- [ ] **10.8** Verify link titles switch back to translated
- [ ] **10.9** Verify no console errors during toggling
- [ ] **10.10** Document toggle functionality test results

---

## 11. Test Fallback Behavior

**Context:** Verify component handles missing originalTitle gracefully.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **11.1** Identify a link without originalTitle (or temporarily remove in data)
- [ ] **11.2** Visit item page with that link
- [ ] **11.3** Verify link title displays (should show translated title)
- [ ] **11.4** Toggle to "view original"
- [ ] **11.5** Verify link title still displays (fallback to translated title)
- [ ] **11.6** Verify no console errors or warnings
- [ ] **11.7** Verify no blank title or undefined text
- [ ] **11.8** Document fallback behavior test results

---

## 12. Test Backward Compatibility

**Context:** Verify component works without new props (existing usage).

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **12.1** Visit item page without translations (demo data)
- [ ] **12.2** Verify link cards render correctly
- [ ] **12.3** Verify titles display (no undefined or null)
- [ ] **12.4** Verify no prop-related errors in console
- [ ] **12.5** Verify showOriginal defaults to false internally
- [ ] **12.6** Verify component functions identical to before updates
- [ ] **12.7** Test clicking links still works
- [ ] **12.8** Document backward compatibility test results

---

## 13. Test with Multiple Links

**Context:** Verify all links update correctly when toggling.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **13.1** Visit item page with multiple links (3+ links)
- [ ] **13.2** Verify all link titles display translated by default
- [ ] **13.3** Toggle to "view original"
- [ ] **13.4** Verify ALL link titles switch to original
- [ ] **13.5** Verify no links are missed or incorrectly displayed
- [ ] **13.6** Toggle back to translated
- [ ] **13.7** Verify ALL link titles switch back
- [ ] **13.8** Test with mix of links (some with/without originalTitle)
- [ ] **13.9** Verify mixed scenario handles correctly
- [ ] **13.10** Document multiple links test results

---

## 14. Test Link Card Styling Unchanged

**Context:** Verify no visual changes to card appearance.

**Files to modify:** None (visual inspection)

**Estimated effort:** 1 story point

- [ ] **14.1** Compare link card styling before and after changes
- [ ] **14.2** Verify thumbnail/icon display is unchanged
- [ ] **14.3** Verify title font size and weight unchanged
- [ ] **14.4** Verify card background and borders unchanged
- [ ] **14.5** Verify link type badge display unchanged
- [ ] **14.6** Verify hover effects work correctly
- [ ] **14.7** Verify spacing and padding unchanged
- [ ] **14.8** Verify responsive design unchanged
- [ ] **14.9** Test on mobile viewport (< 640px)
- [ ] **14.10** Document visual inspection results

---

## 15. Test Link Click Functionality

**Context:** Verify link clicking still works after updates.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **15.1** Visit item page with links
- [ ] **15.2** Click a link card
- [ ] **15.3** Verify onClick handler fires (if analytics enabled)
- [ ] **15.4** Verify link opens in new tab or current tab as expected
- [ ] **15.5** Verify analytics tracking still works
- [ ] **15.6** Test with different link types (website, video, document)
- [ ] **15.7** Verify no errors in console when clicking
- [ ] **15.8** Document click functionality test results

---

## 16. Verify TypeScript Types in ItemDisplay

**Context:** Ensure ItemDisplay correctly types link.originalTitle.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **16.1** Verify displayContent.links type is correct in ItemDisplay
- [ ] **16.2** Verify link.originalTitle is recognized by TypeScript
- [ ] **16.3** Verify no type errors when accessing link.originalTitle
- [ ] **16.4** Verify showOriginal prop type matches useGuestLanguage return type
- [ ] **16.5** Run TypeScript compiler on ItemDisplay.tsx specifically
- [ ] **16.6** Fix any type mismatches found
- [ ] **16.7** Document type safety verification

---

## 17. ESLint and Code Quality Verification

**Context:** Ensure code passes linting and follows conventions.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **17.1** Run ESLint: `npm run lint`
- [ ] **17.2** Verify no errors in `src/components/LinkCard.tsx`
- [ ] **17.3** Fix any linting errors found
- [ ] **17.4** Verify consistent code formatting
- [ ] **17.5** Verify consistent naming conventions
- [ ] **17.6** Verify no unused variables
- [ ] **17.7** Verify no console.log statements left in code
- [ ] **17.8** Re-run lint after fixes
- [ ] **17.9** Document code quality verification

---

## 18. Build Verification

**Context:** Ensure the updated component builds successfully.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **18.1** Run build command: `npm run build`
- [ ] **18.2** Verify build completes successfully
- [ ] **18.3** Verify no build errors related to LinkCard
- [ ] **18.4** Verify no build warnings
- [ ] **18.5** Test production build locally: `npm run start`
- [ ] **18.6** Visit item page in production mode
- [ ] **18.7** Verify link cards work correctly in production
- [ ] **18.8** Document build verification results

---

## 19. Test Edge Cases

**Context:** Verify component handles edge cases gracefully.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Test with empty title string
- [ ] **19.2** Test with very long title (100+ characters)
- [ ] **19.3** Test with title containing special characters
- [ ] **19.4** Test with title containing emojis
- [ ] **19.5** Test with null or undefined originalTitle
- [ ] **19.6** Test rapid toggling of showOriginal
- [ ] **19.7** Test with showOriginal undefined (should default to false)
- [ ] **19.8** Test with only originalTitle provided (no title)
- [ ] **19.9** Verify no crashes or errors in any scenario
- [ ] **19.10** Document edge case handling

---

## 20. Performance Verification

**Context:** Verify component doesn't introduce performance issues.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **20.1** Open React DevTools Profiler
- [ ] **20.2** Profile LinkCard rendering
- [ ] **20.3** Verify render time is acceptable (< 50ms)
- [ ] **20.4** Verify no unnecessary re-renders when parent updates
- [ ] **20.5** Profile toggle action performance
- [ ] **20.6** Test with page containing many links (10+ cards)
- [ ] **20.7** Verify smooth toggling with many cards
- [ ] **20.8** Verify displayTitle calculation is efficient
- [ ] **20.9** Document performance metrics

---

## 21. Accessibility Verification

**Context:** Ensure link cards remain accessible after changes.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **21.1** Test keyboard navigation to link cards
- [ ] **21.2** Verify links are still keyboard accessible
- [ ] **21.3** Test with screen reader (VoiceOver or NVDA)
- [ ] **21.4** Verify link titles are announced correctly
- [ ] **21.5** Verify title change is announced when toggling
- [ ] **21.6** Check ARIA attributes are still correct
- [ ] **21.7** Verify color contrast still meets standards
- [ ] **21.8** Document accessibility verification

---

## 22. Cross-Browser Testing

**Context:** Verify link cards work across different browsers.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Test in Chrome/Chromium
- [ ] **22.2** Test in Firefox
- [ ] **22.3** Test in Safari (if available)
- [ ] **22.4** Test in Edge
- [ ] **22.5** Verify title display works in all browsers
- [ ] **22.6** Verify toggle works in all browsers
- [ ] **22.7** Verify no browser-specific issues
- [ ] **22.8** Document cross-browser compatibility

---

## 23. Integration Testing with ItemDisplay

**Context:** Verify end-to-end integration with parent component.

**Files to modify:** None (integration testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Verify ItemDisplay passes correct props to LinkCard
- [ ] **23.2** Verify showOriginal prop comes from useGuestLanguage hook
- [ ] **23.3** Verify link.originalTitle is populated from API response
- [ ] **23.4** Test complete flow: language change → toggle original → links update
- [ ] **23.5** Verify state synchronization works correctly
- [ ] **23.6** Test with different language selections
- [ ] **23.7** Verify no prop type mismatches
- [ ] **23.8** Document integration test results

---

## 24. Documentation and Comments Review

**Context:** Ensure code is well-documented for future maintenance.

**Files to modify:** `src/components/LinkCard.tsx` (improve comments if needed)

**Estimated effort:** 1 story point

- [ ] **24.1** Review all added comments for clarity
- [ ] **24.2** Add JSDoc comment to LinkCard function if needed
- [ ] **24.3** Document originalTitle prop purpose in interface
- [ ] **24.4** Document showOriginal prop purpose in interface
- [ ] **24.5** Add inline comment explaining displayTitle logic
- [ ] **24.6** Document fallback behavior in comments
- [ ] **24.7** Document backward compatibility in comments
- [ ] **24.8** Verify no misleading or outdated comments
- [ ] **24.9** Add example usage in JSDoc if helpful
- [ ] **24.10** Document that component integrates with Epic 4 guest experience

---

## 25. Final Visual and Functional Review

**Context:** Perform final comprehensive review of all changes.

**Files to modify:** None (final review)

**Estimated effort:** 1 story point

- [ ] **25.1** Review all code changes in LinkCard.tsx
- [ ] **25.2** Review all code changes in ItemDisplay.tsx
- [ ] **25.3** Verify no unintended changes were introduced
- [ ] **25.4** Test complete user flow one more time
- [ ] **25.5** Verify translated titles display correctly
- [ ] **25.6** Verify original titles display when toggled
- [ ] **25.7** Verify backward compatibility maintained
- [ ] **25.8** Verify no console errors or warnings
- [ ] **25.9** Verify performance is acceptable
- [ ] **25.10** Verify accessibility is maintained
- [ ] **25.11** Document that all changes are complete and tested
- [ ] **25.12** Confirm ready for production deployment

---

## Success Criteria

The task is complete when all of the following are verified:

1. ✅ LinkCardProps interface updated with originalTitle and showOriginal props
2. ✅ Both new props are optional (use `?` modifier)
3. ✅ Component function signature includes new props
4. ✅ showOriginal defaults to false for backward compatibility
5. ✅ displayTitle calculation logic implemented correctly
6. ✅ displayTitle handles all cases: translated, original, and fallback
7. ✅ JSX updated to render displayTitle instead of title
8. ✅ Link type definition includes originalTitle property
9. ✅ ItemDisplay passes originalTitle prop to LinkCard
10. ✅ ItemDisplay passes showOriginal prop from useGuestLanguage hook
11. ✅ TypeScript compilation passes with no errors
12. ✅ ESLint passes with no errors
13. ✅ Build completes successfully
14. ✅ Translated titles display correctly by default
15. ✅ Original titles display when showOriginal is true
16. ✅ Fallback to translated title when originalTitle missing
17. ✅ Toggle between translated and original works smoothly
18. ✅ Backward compatibility maintained (works without new props)
19. ✅ Card styling and layout unchanged
20. ✅ Link clicking functionality unchanged
21. ✅ Performance is acceptable (no lag)
22. ✅ Accessibility maintained
23. ✅ Cross-browser compatibility verified
24. ✅ Integration with ItemDisplay verified
25. ✅ All edge cases handled gracefully

---

## Dependencies

**Depends On (Must Be Completed First):**
- REQ-E04-014: Create useGuestLanguage Hook (provides showOriginal state)
- REQ-E04-017: Update ItemDisplay Component (integration point, passes showOriginal)
- Backend: API must return originalTitle field in link objects

**Blocks (Cannot Start Until This Completes):**
- None - This is a leaf task in the dependency tree

**Parallel Safety:**
- ✅ Can be implemented in parallel with similar component updates (e.g., ItemArticleCard if exists)

---

## Authorized Files and Functions for Modification

### Files to Modify

1. **`src/components/LinkCard.tsx`**
   - Type: Client Component
   - Changes:
     - Update LinkCardProps interface (add originalTitle and showOriginal props)
     - Update component function signature (destructure new props with defaults)
     - Add displayTitle calculation logic
     - Update JSX to render displayTitle instead of title

2. **`src/components/ItemDisplay.tsx`**
   - Type: Client Component
   - Changes:
     - Update LinkCard usage to pass originalTitle prop
     - Update LinkCard usage to pass showOriginal prop from useGuestLanguage hook

### Files to Verify (May Need Update)

3. **`src/types/index.ts`** (or wherever Link type is defined)
   - Type: TypeScript type definitions
   - Verification:
     - Ensure Link interface includes originalTitle property
     - Add property if missing: `originalTitle?: string;`

### Files to Reference (Read-Only)

1. **`src/hooks/useGuestLanguage.ts`** (from REQ-E04-014)
   - Reference: showOriginal state from hook
   - Usage: ItemDisplay gets showOriginal and passes to LinkCard

### Dependencies

**NPM Packages:**
- No new dependencies required
- Uses existing React, TypeScript, and Next.js

---

## Notes

**Component Logic:**
```typescript
const displayTitle = showOriginal && originalTitle ? originalTitle : title;
```
This simple ternary handles three cases:
1. showOriginal=false: Always use title (translated)
2. showOriginal=true + originalTitle exists: Use originalTitle
3. showOriginal=true + originalTitle missing: Fallback to title

**Backward Compatibility:**
- All new props are optional
- showOriginal defaults to false
- Component works identically to before if new props not provided
- No breaking changes to existing LinkCard usage

**Integration Pattern:**
ItemDisplay → useGuestLanguage → showOriginal → LinkCard
```typescript
const { showOriginal } = useGuestLanguage();

<LinkCard
  title={link.title}             // Translated title from API
  originalTitle={link.originalTitle}  // Original title from API
  showOriginal={showOriginal}     // State from hook
  // ...other props
/>
```

**API Contract:**
Backend must return link objects with:
- `title`: Translated title (or original if no translation)
- `originalTitle`: Original untranslated title (optional)

If API doesn't provide originalTitle, component gracefully falls back to showing title in both cases.

**Performance:**
displayTitle calculation is very lightweight (simple ternary). No performance concerns even with many link cards.

**Testing Priority:**
1. Toggle functionality (most important)
2. Fallback behavior (critical for robustness)
3. Backward compatibility (ensures no regressions)

---

**Last Modified:** 2026-01-22 23:28
