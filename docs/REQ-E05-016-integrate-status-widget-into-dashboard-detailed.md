# REQ-E05-016: Integrate TranslationStatusWidget into Dashboard - DETAILED TASK BREAKDOWN

**Generated**: 2026-01-22 23:17
**Request**: REQ-E05-016
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.4

**Reference Documents**:
- Requirements: `/docs/gen_requests_epic5.md` (REQ-E05-016)
- Overview: `/docs/REQ-E05-016-integrate-status-widget-into-dashboard-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task 1: Read Dashboard Page Structure

**Context**: Understand the current dashboard layout structure to determine optimal widget placement and integration approach.

**Files to modify**:
- `/src/app/dashboard2/page.tsx` (read only in this task)

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **1.1** Open and read `/src/app/dashboard2/page.tsx` file ---implemented: read file---
- [x] **1.2** Locate ProgressiveStatisticsSection component (around line 202-211) ---implemented: found at lines 202-211---
- [x] **1.3** Locate AdvancedDashboardTools component (around line 214-221) ---implemented: found at lines 214-221---
- [x] **1.4** Identify insertion point between these two sections (around line 212-213) ---implemented: found at line 212---
- [x] **1.5** Review existing import statements (lines 25-40) ---implemented: reviewed---
- [x] **1.6** Review usePropertyContext hook usage (around line 55-61) ---implemented: found at line 57---
- [x] **1.7** Review existing navigation handlers (around line 84-125) ---implemented: reviewed---
- [x] **1.8** Note file-level JSDoc comment structure (lines 2-18) ---implemented: reviewed---
- [x] **1.9** Understand component placement pattern and spacing ---implemented: understood pattern---

---

## Task 2: Add TranslationStatusWidget Import

**Context**: Import the TranslationStatusWidget component following the established pattern for SimpleDashboard component imports.

**Files to modify**:
- `/src/app/dashboard2/page.tsx`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **2.1** Locate existing SimpleDashboard imports (around lines 25-33) ---implemented: located---
- [x] **2.2** Add new import line after SimpleDashboard imports (around line 34) ---implemented---
- [x] **2.3** Add: `import { TranslationStatusWidget } from '@/components/TranslationManagement/TranslationStatusWidget';` ---implemented---
- [x] **2.4** Add blank line after import for visual separation ---implemented: no extra blank needed---
- [x] **2.5** Verify import path matches component location ---implemented: verified---
- [x] **2.6** Save file ---implemented---

---

## Task 3: Verify Property Context Hook Availability

**Context**: Confirm that usePropertyContext hook is already available and provides selectedPropertyId.

**Files to modify**:
- `/src/app/dashboard2/page.tsx` (read only)

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **3.1** Locate usePropertyContext hook call (around line 55-61) ---implemented: found at line 57---
- [x] **3.2** Verify selectedPropertyId is destructured from hook ---implemented: verified---
- [x] **3.3** Note that selectedPropertyId can be null (need to convert to undefined) ---implemented: noted---
- [x] **3.4** Confirm hook is already imported and working ---implemented: verified---
- [x] **3.5** No additional code needed for property context ---implemented: confirmed---

---

## Task 4: Create Navigation Handler for View Details

**Context**: Implement handleViewTranslations callback function to navigate to translation management page, following the pattern of existing handlers like handleCreateItem.

**Files to modify**:
- `/src/app/dashboard2/page.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **4.1** Locate existing navigation handlers section (around lines 84-125) ---implemented: located---
- [x] **4.2** Find appropriate placement for new handler (after existing handlers) ---implemented: after handleGroupChange---
- [x] **4.3** Add blank line for separation ---implemented---
- [x] **4.4** Add comment: `// REQ-E05-016: Handler for translation status "View Details" click` ---implemented---
- [x] **4.5** Define handler: `const handleViewTranslations = useCallback(() => {` ---implemented---
- [x] **4.6** Add navigation: `router.push('/dashboard2/translations');` ---implemented---
- [x] **4.7** Close callback: `}, [router]);` ---implemented---
- [x] **4.8** Verify router is available from useRouter hook (imported around line 42) ---implemented: verified---
- [x] **4.9** Add blank line after handler ---implemented---
- [x] **4.10** Save file ---implemented---

---

## Task 5: Add Widget Section Comment

**Context**: Add comprehensive comment block explaining the widget integration, following the pattern of existing section comments in the dashboard.

**Files to modify**:
- `/src/app/dashboard2/page.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **5.1** Locate insertion point between ProgressiveStatisticsSection and AdvancedDashboardTools (around line 212) ---implemented: located---
- [x] **5.2** Add blank line for spacing ---implemented---
- [x] **5.3** Add multi-line comment block: `{/* REQ-E05-016: Translation Status Widget` ---implemented---
- [x] **5.4** Add description line: ` * Displays translation coverage summary for owner's content` ---implemented---
- [x] **5.5** Add feature bullet: ` * - Shows completion percentage with progress bar` ---implemented---
- [x] **5.6** Add feature bullet: ` * - Displays status counts (complete, partial, pending, failed)` ---implemented---
- [x] **5.7** Add feature bullet: ` * - Respects selected property filter` ---implemented---
- [x] **5.8** Add feature bullet: ` * - Provides quick navigation to translation management` ---implemented---
- [x] **5.9** Add feature bullet: ` * - Handles loading, error, and empty states internally` ---implemented---
- [x] **5.10** Close comment: ` */}` ---implemented---
- [x] **5.11** Verify comment formatting matches existing REQ comments in file ---implemented---

---

## Task 6: Add TranslationStatusWidget Component to JSX

**Context**: Insert the widget component into the dashboard layout between ProgressiveStatisticsSection and AdvancedDashboardTools.

**Files to modify**:
- `/src/app/dashboard2/page.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **6.1** Position cursor after widget comment block (from Task 5) ---implemented---
- [x] **6.2** Add widget component opening tag: `<TranslationStatusWidget` ---implemented---
- [x] **6.3** Add propertyId prop on new line with proper indentation: `propertyId={selectedPropertyId || undefined}` ---implemented---
- [x] **6.4** Add comment explaining null to undefined conversion: `{/* Convert null to undefined */}` ---implemented: inline in prop---
- [x] **6.5** Add onViewDetails prop on new line: `onViewDetails={handleViewTranslations}` ---implemented---
- [x] **6.6** Close component tag: `/>` ---implemented---
- [x] **6.7** Add blank line after widget for spacing ---implemented---
- [x] **6.8** Verify indentation matches surrounding components ---implemented---
- [x] **6.9** Verify props match TranslationStatusWidget interface ---implemented---
- [x] **6.10** Save file ---implemented---

---

## Task 7: Update File-Level JSDoc Comment

**Context**: Update the file-level JSDoc to document the widget integration, maintaining chronological order of REQ entries.

**Files to modify**:
- `/src/app/dashboard2/page.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **7.1** Locate file-level JSDoc comment (lines 2-18) ---implemented: located---
- [x] **7.2** Find the list of REQ entries ---implemented: found---
- [x] **7.3** Add new entry after REQ-140: ` * REQ-E05-016: Added TranslationStatusWidget integration` ---implemented---
- [x] **7.4** Update @modified date to current date: ` * @modified 2026-01-24` ---implemented---
- [x] **7.5** Verify chronological order is maintained ---implemented: verified---
- [x] **7.6** Verify formatting matches existing entries ---implemented: verified---
- [x] **7.7** Save file ---implemented---

---

## Task 8: Verify TypeScript Compilation

**Context**: Ensure all TypeScript code compiles without errors after integration.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **8.1** Run `npm run typecheck` from project root ---implemented: passed---
- [x] **8.2** Verify no TypeScript errors in dashboard2/page.tsx ---implemented: no errors---
- [x] **8.3** Check that TranslationStatusWidget import resolves correctly ---implemented: resolves---
- [x] **8.4** Verify handleViewTranslations type signature is correct ---implemented: verified---
- [x] **8.5** Verify propertyId prop type matches widget interface ---implemented: string | undefined---
- [x] **8.6** Verify onViewAll prop type matches widget interface ---implemented: fixed prop name from onViewDetails to onViewAll---
- [x] **8.7** Check that all dependencies are properly typed ---implemented: verified---
- [x] **8.8** Fix any type errors if present ---implemented: fixed prop name---

---

## Task 9: Verify Build Success

**Context**: Ensure dashboard page builds correctly for production after widget integration.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **9.1** Run `npm run build` from project root ---implemented: completed---
- [x] **9.2** Verify no build errors related to dashboard2/page.tsx ---implemented: no errors from this file---
- [x] **9.3** Check that TranslationStatusWidget is included in build ---implemented: compiled---
- [x] **9.4** Verify no missing dependency warnings ---implemented: no missing deps---
- [x] **9.5** Check build output size is reasonable ---implemented: normal---
- [x] **9.6** Verify no circular dependency warnings ---implemented: none---

---

## Task 10: Manual Testing - Initial Rendering

**Context**: Test that widget renders correctly on dashboard load.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **10.1** Start dev server: `npm run dev`
- [ ] **10.2** Navigate to `/dashboard2` in browser
- [ ] **10.3** Verify dashboard loads without errors
- [ ] **10.4** Check browser console for any errors or warnings
- [ ] **10.5** Verify widget appears after statistics section
- [ ] **10.6** Confirm widget is before AdvancedDashboardTools section
- [ ] **10.7** Check that widget has proper spacing above and below
- [ ] **10.8** Verify widget displays loading skeleton initially
- [ ] **10.9** Wait for data to load
- [ ] **10.10** Verify widget displays translation status data
- [ ] **10.11** Check that widget doesn't overlap other components

---

## Task 11: Manual Testing - Loading State

**Context**: Verify widget displays loading skeleton correctly during data fetch.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **11.1** Reload dashboard page
- [ ] **11.2** Observe widget during initial load
- [ ] **11.3** Verify loading skeleton appears
- [ ] **11.4** Check that skeleton matches widget dimensions
- [ ] **11.5** Verify loading doesn't block page rendering
- [ ] **11.6** Confirm other dashboard components render normally
- [ ] **11.7** Wait for widget to finish loading
- [ ] **11.8** Verify smooth transition from skeleton to content

---

## Task 12: Manual Testing - Data Display

**Context**: Verify widget displays translation status data correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **12.1** After widget loads, verify header displays
- [ ] **12.2** Check that gradient header shows "Translation Status" title
- [ ] **12.3** Verify "View Details" link appears in header
- [ ] **12.4** Confirm progress bar displays with percentage
- [ ] **12.5** Verify status cards show correct counts
- [ ] **12.6** Check that 4 status cards display (complete, partial, pending, failed)
- [ ] **12.7** Verify icons and colors match status types
- [ ] **12.8** Confirm all text is properly translated (if testing in non-English locale)

---

## Task 13: Manual Testing - Empty State

**Context**: Verify widget handles empty state when user has no translation data.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **13.1** Test with new user account (no items/translations)
- [ ] **13.2** Navigate to dashboard
- [ ] **13.3** Verify widget displays empty state message
- [ ] **13.4** Check that empty state icon appears
- [ ] **13.5** Verify empty state text is user-friendly
- [ ] **13.6** Confirm no error message is shown
- [ ] **13.7** Verify widget maintains proper dimensions in empty state

---

## Task 14: Manual Testing - Error State

**Context**: Verify widget handles API errors gracefully with retry capability.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **14.1** Simulate API error (disconnect network or mock API failure)
- [ ] **14.2** Reload dashboard page
- [ ] **14.3** Verify widget displays error state
- [ ] **14.4** Check that error icon appears (red X or similar)
- [ ] **14.5** Verify error message is displayed
- [ ] **14.6** Confirm retry button appears
- [ ] **14.7** Click retry button
- [ ] **14.8** Verify widget attempts to refetch data
- [ ] **14.9** Restore network/API connection
- [ ] **14.10** Click retry button again
- [ ] **14.11** Verify widget recovers and displays data correctly

---

## Task 15: Manual Testing - Property Filtering

**Context**: Verify widget respects property selection from header dropdown and updates when property changes.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **15.1** Ensure user has multiple properties in account
- [ ] **15.2** Load dashboard with "All Properties" selected
- [ ] **15.3** Verify widget shows aggregated data for all properties
- [ ] **15.4** Open property dropdown in dashboard header
- [ ] **15.5** Select a specific property
- [ ] **15.6** Observe widget behavior
- [ ] **15.7** Verify widget shows loading state during refetch
- [ ] **15.8** Confirm widget updates to show data for selected property only
- [ ] **15.9** Check that status counts change appropriately
- [ ] **15.10** Select a different property
- [ ] **15.11** Verify widget updates again
- [ ] **15.12** Switch back to "All Properties"
- [ ] **15.13** Confirm widget shows aggregated data again
- [ ] **15.14** Verify no console errors during property switching

---

## Task 16: Manual Testing - View Details Navigation

**Context**: Verify "View Details" button navigates correctly to translation management page.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **16.1** Load dashboard page
- [ ] **16.2** Wait for widget to load
- [ ] **16.3** Locate "View Details" link in widget header
- [ ] **16.4** Click "View Details" link
- [ ] **16.5** Verify navigation occurs
- [ ] **16.6** Check that URL changes to `/dashboard2/translations`
- [ ] **16.7** Verify translation management page loads (or appropriate placeholder if not yet implemented)
- [ ] **16.8** Use browser back button
- [ ] **16.9** Confirm return to dashboard
- [ ] **16.10** Verify widget state is preserved
- [ ] **16.11** Note: If /dashboard2/translations doesn't exist, document as expected dependency

---

## Task 17: Manual Testing - Responsive Layout Desktop

**Context**: Verify widget displays correctly on desktop screen sizes.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **17.1** View dashboard on desktop browser (1920px or larger)
- [ ] **17.2** Verify widget uses full available width
- [ ] **17.3** Check that status cards display in 4-column grid
- [ ] **17.4** Verify progress bar is clearly visible
- [ ] **17.5** Confirm spacing matches other dashboard sections
- [ ] **17.6** Check that widget doesn't appear cramped or stretched
- [ ] **17.7** Verify text is readable at this size

---

## Task 18: Manual Testing - Responsive Layout Tablet

**Context**: Verify widget adapts correctly to tablet screen sizes.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **18.1** Resize browser to tablet width (~768px)
- [ ] **18.2** Verify widget adapts to narrower width
- [ ] **18.3** Check if status cards reflow appropriately
- [ ] **18.4** Verify progress bar scales correctly
- [ ] **18.5** Confirm header remains readable
- [ ] **18.6** Check that "View Details" link is accessible
- [ ] **18.7** Verify no horizontal scrolling is needed

---

## Task 19: Manual Testing - Responsive Layout Mobile

**Context**: Verify widget displays correctly on mobile screen sizes.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **19.1** Resize browser to mobile width (~375px)
- [ ] **19.2** Verify widget stacks appropriately
- [ ] **19.3** Check that status cards adjust to 2-column grid
- [ ] **19.4** Verify all content remains readable
- [ ] **19.5** Confirm touch targets are appropriately sized
- [ ] **19.6** Check that widget doesn't break dashboard layout
- [ ] **19.7** Verify vertical spacing is appropriate on mobile

---

## Task 20: Manual Testing - Keyboard Accessibility

**Context**: Verify widget is fully accessible via keyboard navigation.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **20.1** Load dashboard page
- [ ] **20.2** Use Tab key to navigate through page
- [ ] **20.3** Verify Tab reaches widget section
- [ ] **20.4** Confirm "View Details" link is keyboard focusable
- [ ] **20.5** Check that focus indicator is visible on link
- [ ] **20.6** Press Enter while focused on "View Details"
- [ ] **20.7** Verify navigation occurs
- [ ] **20.8** Test with Shift+Tab to navigate backwards
- [ ] **20.9** Verify focus order is logical
- [ ] **20.10** Confirm no keyboard traps exist in widget

---

## Task 21: Accessibility Testing - Screen Reader

**Context**: Verify widget provides accessible experience for screen reader users.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **21.1** Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] **21.2** Navigate to dashboard page
- [ ] **21.3** Navigate to widget section with screen reader
- [ ] **21.4** Verify widget region is announced with appropriate label
- [ ] **21.5** Check that header title is announced
- [ ] **21.6** Verify progress bar value is announced
- [ ] **21.7** Navigate through status cards
- [ ] **21.8** Confirm each status label and count is announced
- [ ] **21.9** Navigate to "View Details" link
- [ ] **21.10** Verify link purpose is clear from announcement
- [ ] **21.11** Check that loading state is announced appropriately
- [ ] **21.12** Verify error state is announced if applicable

---

## Task 22: Integration Testing - Dashboard Features

**Context**: Verify widget integration doesn't break existing dashboard functionality.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **22.1** Test ProgressiveStatisticsSection still renders correctly
- [ ] **22.2** Verify statistics data loads and displays
- [ ] **22.3** Test AdvancedDashboardTools section functionality
- [ ] **22.4** Check ActionButtons section still works
- [ ] **22.5** Verify PropertyEditModal opens correctly
- [ ] **22.6** Test AddPropertyModal functionality
- [ ] **22.7** Check DashboardSettingsPopover works
- [ ] **22.8** Test property dropdown filtering
- [ ] **22.9** Verify "Create Item" button functionality
- [ ] **22.10** Check that preferences are preserved
- [ ] **22.11** Test dashboard refresh/reload
- [ ] **22.12** Verify no console errors during testing

---

## Task 23: Performance Verification

**Context**: Verify widget integration doesn't negatively impact dashboard performance.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **23.1** Open browser DevTools Performance tab
- [ ] **23.2** Record dashboard page load
- [ ] **23.3** Check total page load time
- [ ] **23.4** Verify widget loading doesn't block page render
- [ ] **23.5** Check Network tab for API requests
- [ ] **23.6** Verify only one request to /api/translations/status
- [ ] **23.7** Check for duplicate or unnecessary requests
- [ ] **23.8** Open React DevTools Profiler
- [ ] **23.9** Profile property selection change
- [ ] **23.10** Verify widget re-renders are minimal
- [ ] **23.11** Check that property change doesn't cause full page re-render
- [ ] **23.12** Confirm performance is acceptable (<3s initial load)

---

## Task 24: Internationalization Testing

**Context**: Verify all widget text displays correctly in all supported languages.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **24.1** Test dashboard in English locale
- [ ] **24.2** Verify widget title and labels are in English
- [ ] **24.3** Switch app language to French
- [ ] **24.4** Reload dashboard
- [ ] **24.5** Verify widget text is translated to French
- [ ] **24.6** Switch to Spanish and verify translations
- [ ] **24.7** Switch to German and verify translations
- [ ] **24.8** Switch to Dutch and verify translations
- [ ] **24.9** Switch to Italian and verify translations
- [ ] **24.10** Verify text doesn't overflow widget in any language
- [ ] **24.11** Check that all status labels are translated
- [ ] **24.12** Confirm "View Details" link is translated

---

## Task 25: Cross-Browser Testing

**Context**: Verify widget works correctly in different browsers.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **25.1** Test in Chrome/Chromium
- [ ] **25.2** Verify widget renders and functions correctly
- [ ] **25.3** Test in Firefox
- [ ] **25.4** Verify no browser-specific issues
- [ ] **25.5** Test in Safari (if on macOS)
- [ ] **25.6** Check for any Safari-specific rendering issues
- [ ] **25.7** Test in Edge (if available)
- [ ] **25.8** Verify consistent behavior across browsers
- [ ] **25.9** Check that hover effects work in all browsers
- [ ] **25.10** Verify focus indicators are visible in all browsers

---

## Task 26: Error Handling Verification

**Context**: Verify widget handles various error scenarios gracefully without crashing dashboard.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **26.1** Test with API endpoint returning 500 error
- [ ] **26.2** Verify widget shows error state, dashboard continues working
- [ ] **26.3** Test with API endpoint returning 404 error
- [ ] **26.4** Confirm appropriate error message is displayed
- [ ] **26.5** Test with API endpoint timing out
- [ ] **26.6** Verify timeout is handled gracefully
- [ ] **26.7** Test with malformed API response
- [ ] **26.8** Confirm widget doesn't crash
- [ ] **26.9** Test with network disconnect during fetch
- [ ] **26.10** Verify error recovery works
- [ ] **26.11** Check that retry functionality works in all error scenarios

---

## Task 27: Verify Dashboard Doesn't Depend on Widget

**Context**: Ensure dashboard continues to function if widget fails or is removed.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **27.1** Comment out widget component temporarily
- [ ] **27.2** Reload dashboard
- [ ] **27.3** Verify dashboard loads without widget
- [ ] **27.4** Check that no errors occur
- [ ] **27.5** Verify other dashboard sections still work
- [ ] **27.6** Uncomment widget component
- [ ] **27.7** Verify widget appears again
- [ ] **27.8** Confirm this demonstrates loose coupling

---

## Task 28: Documentation Review

**Context**: Verify all code comments and documentation are clear and accurate.

**Files to modify**:
- None (review only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **28.1** Review import statement comment
- [ ] **28.2** Review handleViewTranslations comment
- [ ] **28.3** Review widget section comment block
- [ ] **28.4** Verify REQ-E05-016 references are correct
- [ ] **28.5** Check that file-level JSDoc is updated
- [ ] **28.6** Verify @modified timestamp is current
- [ ] **28.7** Confirm all comments are helpful and accurate
- [ ] **28.8** Check for any TODO or FIXME comments

---

## Task 29: Final Code Review

**Context**: Perform final review of all changes before completion.

**Files to modify**:
- None (review only)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **29.1** Review all changes in `/src/app/dashboard2/page.tsx`
- [ ] **29.2** Verify import statement is correct
- [ ] **29.3** Check handleViewTranslations implementation
- [ ] **29.4** Verify widget component props
- [ ] **29.5** Confirm JSDoc update is accurate
- [ ] **29.6** Check code formatting and indentation
- [ ] **29.7** Verify no debug code or console.logs remain
- [ ] **29.8** Confirm changes follow existing code patterns
- [ ] **29.9** Verify no unnecessary changes were made
- [ ] **29.10** Check that all changes are documented

---

## Task 30: Run Final Verification Commands

**Context**: Run all verification commands to ensure code quality before completion.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **30.1** Run `npm run typecheck`
- [ ] **30.2** Verify no TypeScript errors
- [ ] **30.3** Run `npm run lint`
- [ ] **30.4** Fix any lint warnings or errors
- [ ] **30.5** Run `npm run build`
- [ ] **30.6** Verify successful build
- [ ] **30.7** Run `npm run dev`
- [ ] **30.8** Verify dev server starts without errors
- [ ] **30.9** Load dashboard in browser
- [ ] **30.10** Perform final smoke test

---

## Task 31: Document Integration Completion

**Context**: Update project documentation and prepare completion notes.

**Files to modify**:
- `/CLAUDE.md` (if project documentation exists)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **31.1** Open `/CLAUDE.md` if it exists
- [ ] **31.2** Add entry for REQ-E05-016 integration
- [ ] **31.3** Document widget location in dashboard
- [ ] **31.4** Note dependencies (REQ-E05-013, REQ-E05-011, REQ-E05-001)
- [ ] **31.5** Document navigation target: `/dashboard2/translations`
- [ ] **31.6** Note that widget is self-contained (handles own data fetching)
- [ ] **31.7** Document property filtering behavior
- [ ] **31.8** Update Last Modified date in CLAUDE.md
- [ ] **31.9** Save file

---

## Task 32: Create Completion Summary

**Context**: Summarize what was accomplished and any notes for future work.

**Files to modify**:
- None (documentation only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **32.1** Verify all tasks are complete
- [ ] **32.2** Note: TranslationStatusWidget successfully integrated into dashboard
- [ ] **32.3** Note: Widget placed between ProgressiveStatisticsSection and AdvancedDashboardTools
- [ ] **32.4** Note: Property filtering works via selectedPropertyId prop
- [ ] **32.5** Note: Navigation handler navigates to /dashboard2/translations
- [ ] **32.6** Note: Widget is responsive and accessible
- [ ] **32.7** Note: All tests passed successfully
- [ ] **32.8** Note: No regressions in existing dashboard functionality
- [ ] **32.9** Document any issues encountered and resolutions
- [ ] **32.10** List any recommendations for future enhancements

---

## Task 33: Commit Changes

**Context**: Commit the integration changes with appropriate message.

**Files to modify**:
- None (git operation)

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **33.1** Stage changes: `git add src/app/dashboard2/page.tsx`
- [ ] **33.2** Stage documentation changes if applicable: `git add CLAUDE.md`
- [ ] **33.3** Review staged changes: `git diff --staged`
- [ ] **33.4** Verify only intended changes are staged
- [ ] **33.5** Commit with message: `git commit -m "[REQ-E05-016] Integrate TranslationStatusWidget into dashboard"`
- [ ] **33.6** Verify commit was created successfully
- [ ] **33.7** Update pipeline state or task tracker to mark REQ-E05-016 complete

---

**END OF DETAILED TASK BREAKDOWN**

*Total Estimated Effort: ~5-6 hours*
*Total Tasks: 33*
*Total Subtasks: 334*

---

## Notes

- All subtask checkboxes are intentionally UNCHECKED (- [ ])
- Implementation agent will check off subtasks as completed
- This is a SPECIFICATION document for future work
- This is a simple integration task; widget component (REQ-E05-013) handles complexity
- Dashboard already has excellent patterns for component integration
- Property context handling is well-established via usePropertyContext hook
- Navigation target `/dashboard2/translations` will be created in separate task
- Widget is self-contained and doesn't require dashboard-level data fetching
- Testing should focus on integration points and avoiding regressions
- Most effort is in thorough testing and verification across scenarios
- Widget placement: After ProgressiveStatisticsSection, before AdvancedDashboardTools
- Property filtering: Pass selectedPropertyId from usePropertyContext
- Navigation: Simple router.push to /dashboard2/translations route

---

*Document Last Modified: 2026-01-22 23:17*
