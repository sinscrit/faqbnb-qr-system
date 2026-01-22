# REQ-E05-016: Integrate TranslationStatusWidget into Dashboard - Implementation Overview

**Created**: 2026-01-22 19:40
**Last Modified**: 2026-01-22 19:40
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.4

---

## 1. Goal

Integrate the TranslationStatusWidget component into the main dashboard (`/src/app/dashboard2/page.tsx`) to provide property owners with at-a-glance visibility into their translation status. The widget should fetch translation summary data on page load, display aggregate statistics (complete, pending, failed counts), and provide quick navigation to detailed translation management views.

**Primary File**: `/src/app/dashboard2/page.tsx` (modify)

**Key Features**:
- Add TranslationStatusWidget to dashboard layout
- Fetch translation status data on component mount
- Display loading skeleton while data loads
- Handle error states with retry capability
- Respect selected property context for filtering
- Provide "View Details" navigation to translation management
- Integrate seamlessly with existing dashboard structure

---

## 2. Implementation Plan

### Step 1: Investigate Dashboard Layout Structure
**File**: `/src/app/dashboard2/page.tsx` (existing)

Understand the current dashboard structure to determine optimal widget placement.

**Current Structure** (from investigation):
- Lines 0-247: Dashboard page component
- Line 202-211: ProgressiveStatisticsSection (existing widget area)
- Line 214-221: AdvancedDashboardTools
- Line 224: ActionButtons
- Modular layout with progressive display based on property count

**Actions**:
- Review ProgressiveStatisticsSection integration pattern
- Identify where to place TranslationStatusWidget (after statistics, before action buttons)
- Note existing patterns for data fetching (useDashboardStats hook)
- Check property context handling (usePropertyContext hook)

### Step 2: Import TranslationStatusWidget Component
**File**: `/src/app/dashboard2/page.tsx`

Add import statement for the TranslationStatusWidget component.

**Pattern Reference**: Lines 25-33 show existing component imports from SimpleDashboard

**Implementation Details**:
```typescript
import {
  ActionButtons,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';

// ADD THIS:
import { TranslationStatusWidget } from '@/components/TranslationManagement/TranslationStatusWidget';
```

**Actions**:
- Add import after existing SimpleDashboard imports (line ~34)
- Use consistent import style with existing code

### Step 3: Determine Widget Placement Strategy
**File**: `/src/app/dashboard2/page.tsx`

Decide where in the dashboard layout to place the widget.

**Placement Options** (from REQ-E05-016 specification):
1. **After ProgressiveStatisticsSection** (Recommended)
   - Natural flow: stats → translation status → tools → actions
   - Dedicated section between analytics and tools
   - Clear visual separation

2. **Within ProgressiveStatisticsSection**
   - Requires modifying ProgressiveStatisticsSection component
   - More complex integration
   - Better for unified analytics view

3. **Sidebar** (Future enhancement)
   - Requires dashboard layout refactor
   - Out of scope for this task

**Decision**: Place after ProgressiveStatisticsSection, before AdvancedDashboardTools (between lines 211 and 213).

**Actions**:
- Document placement decision
- Plan for responsive wrapper
- Consider conditional rendering (only show for users with translatable content)

### Step 4: Add TranslationStatusWidget to JSX
**File**: `/src/app/dashboard2/page.tsx`

Insert the widget component into the dashboard layout.

**Pattern Reference**: Lines 202-211 show how ProgressiveStatisticsSection is integrated

**Implementation Details**:
```tsx
{/* REQ-136: Progressive Statistics Section */}
{/* REQ-137: Pass onCreateItem for empty state CTA */}
<ProgressiveStatisticsSection
  stats={stats}
  isLoading={isLoading}
  error={error}
  overrides={{
    forceAdvancedTools: preferences.forceAdvancedTools,
    forcePortfolioView: preferences.forcePortfolioView,
  }}
  onCreateItem={handleCreateItem}
/>

{/* REQ-E05-016: Translation Status Widget */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}
  onViewDetails={handleViewTranslations}
/>

{/* REQ-136: Advanced Dashboard Tools */}
<AdvancedDashboardTools
  // ... existing props
/>
```

**Actions**:
- Insert widget between lines 211 and 213
- Pass selectedPropertyId from usePropertyContext (line 56)
- Create handleViewTranslations callback (next step)
- Add REQ comment for traceability

### Step 5: Create Navigation Handler for "View Details"
**File**: `/src/app/dashboard2/page.tsx`

Implement callback function to navigate to translation management page.

**Pattern Reference**: Lines 84-86 show handleCreateItem navigation callback

**Implementation Details**:
```typescript
// REQ-E05-016: Handler for translation status "View Details" click
const handleViewTranslations = useCallback(() => {
  router.push('/dashboard2/translations');
}, [router]);
```

**Actions**:
- Add handler after existing handlers (around line ~125)
- Use useCallback for optimization
- Depend on router from useRouter hook (line 42)
- Navigate to `/dashboard2/translations` route (will be created in separate task)

### Step 6: Verify Property Context Integration
**File**: `/src/app/dashboard2/page.tsx`

Ensure widget respects the currently selected property for filtering.

**Existing Integration** (lines 55-61):
- `usePropertyContext` hook provides selectedPropertyId
- useDashboardStats already uses selectedPropertyId for filtering
- Pattern is established and working

**Implementation Details**:
```tsx
// Widget receives property context
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}  // Convert null to undefined
  onViewDetails={handleViewTranslations}
/>
```

**Actions**:
- Pass selectedPropertyId to widget (convert null to undefined)
- Widget will fetch filtered data when propertyId is provided
- Widget shows all-properties data when propertyId is undefined
- No additional state management needed (context handles it)

### Step 7: Consider Conditional Rendering Logic
**File**: `/src/app/dashboard2/page.tsx`

Determine if widget should be conditionally rendered based on user state.

**Conditional Rendering Options**:
1. **Always show** - Widget handles empty state internally (Recommended)
2. **Hide for new users** - Only show if user has items with translatable content
3. **Hide for specific tiers** - Only show for certain property counts

**Decision**: Always show widget; let TranslationStatusWidget handle empty state internally.

**Rationale**:
- Widget has empty state handling (from REQ-E05-013)
- Consistent user experience
- Simpler integration logic
- Users become aware of translation features early

**Actions**:
- No conditional wrapping needed
- Widget renders for all users (new and existing)
- Empty state handled by widget component

### Step 8: Add Section Comment and Documentation
**File**: `/src/app/dashboard2/page.tsx`

Add clear comment explaining the widget integration.

**Pattern Reference**: Existing REQ comments throughout file

**Implementation Details**:
```tsx
{/* REQ-E05-016: Translation Status Widget
  * Displays translation coverage summary for owner's content
  * - Shows completion percentage with progress bar
  * - Displays status counts (complete, partial, pending, failed)
  * - Respects selected property filter
  * - Provides quick navigation to translation management
  * - Handles loading, error, and empty states internally
  */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}
  onViewDetails={handleViewTranslations}
/>
```

**Actions**:
- Add multi-line comment above widget
- Reference REQ-E05-016
- Document key features
- Explain integration decisions

### Step 9: Update Dashboard Page Documentation
**File**: `/src/app/dashboard2/page.tsx`

Update file-level JSDoc comment to document the widget integration.

**Current JSDoc** (lines 2-18):
```typescript
/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * REQ-131: Added PropertyEditModal integration
 * REQ-132: Added AddPropertyModal integration
 * REQ-134: Added per-property statistics filtering
 * REQ-136: Added progressive UI based on property count
 * REQ-137: Added new user welcome state and empty state guidance
 * REQ-140: Added responsive padding and layout for mobile
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-06 16:52:00 UTC
 */
```

**Updated JSDoc**:
```typescript
/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * REQ-131: Added PropertyEditModal integration
 * REQ-132: Added AddPropertyModal integration
 * REQ-134: Added per-property statistics filtering
 * REQ-136: Added progressive UI based on property count
 * REQ-137: Added new user welcome state and empty state guidance
 * REQ-140: Added responsive padding and layout for mobile
 * REQ-E05-016: Added TranslationStatusWidget integration
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-22 19:40
 */
```

**Actions**:
- Add REQ-E05-016 entry to change log
- Update @modified timestamp
- Maintain chronological order

### Step 10: Test Widget Responsiveness
**Context**: Manual testing in dashboard layout

Verify widget adapts to dashboard responsive grid.

**Test Scenarios**:
1. Desktop view (lg breakpoint): Widget displays with full width
2. Tablet view (md breakpoint): Widget adapts to narrower width
3. Mobile view (sm breakpoint): Widget stacks properly
4. New user empty state: Widget shows appropriate empty message
5. Loading state: Widget shows skeleton during data fetch
6. Error state: Widget displays error with retry option
7. Property filtering: Widget updates when property selection changes

**Actions**:
- Test on multiple screen sizes
- Verify widget doesn't break dashboard layout
- Check spacing matches existing dashboard spacing
- Ensure widget is keyboard accessible

### Step 11: Verify Data Fetching Integration
**Context**: useTranslationStatus hook integration

Ensure widget fetches data correctly using internal hook.

**Widget's Data Fetching** (from REQ-E05-013):
- Widget uses useTranslationStatus hook internally (REQ-E05-011)
- Hook handles loading, error, and data states
- No additional data fetching needed in dashboard page
- Widget is self-contained for data management

**Actions**:
- Confirm widget fetches on mount
- Verify property filtering works when selectedPropertyId changes
- Check that data refreshes appropriately
- No dashboard-level data fetching code needed

### Step 12: Test Navigation to Translation Management
**Context**: "View Details" button functionality

Verify navigation works correctly.

**Test Scenarios**:
1. Click "View Details" button
2. Should navigate to `/dashboard2/translations`
3. Navigation preserves property context if applicable
4. Back button returns to dashboard

**Future Enhancement**:
- Pass propertyId to translation management route
- Example: `/dashboard2/translations?propertyId=${selectedPropertyId}`

**Actions**:
- Test navigation callback
- Verify route exists (will be created in separate task)
- Consider adding propertyId to route for context preservation

### Step 13: Manual Integration Testing
**Context**: Full dashboard integration testing

Test widget in complete dashboard context.

**Test Scenarios**:
1. Widget renders without errors
2. Widget displays after statistics section, before tools section
3. Loading state appears briefly on initial page load
4. Data loads and displays correctly
5. Widget respects property selection from PropertyDropdown
6. Changing property updates widget data
7. "View Details" navigation works
8. Widget doesn't interfere with existing dashboard features
9. All text is internationalized (next-intl)
10. No console errors or warnings
11. Widget is accessible via keyboard navigation
12. Screen reader announces widget content correctly

**Actions**:
- Perform comprehensive integration testing
- Test with various data states (empty, partial, complete)
- Verify property context switching
- Check accessibility with screen reader
- Validate responsive behavior

### Step 14: Performance Verification
**Context**: Ensure widget doesn't impact dashboard performance

Verify widget integration is performant.

**Checks**:
1. Widget doesn't slow down initial dashboard load
2. Data fetching is async and doesn't block rendering
3. No unnecessary re-renders triggered
4. Property context changes don't cause full page re-render
5. Widget uses React.memo or similar optimization (if needed)

**Actions**:
- Profile dashboard load time before and after
- Check Network tab for API requests
- Verify no duplicate API calls
- Monitor React DevTools for render counts

### Step 15: Update Dashboard E2E Tests (Future)
**File**: `/src/app/dashboard2/__tests__/page.test.tsx` (future)

Plan for future test updates.

**Test Cases to Add**:
- Dashboard renders TranslationStatusWidget
- Widget receives correct propertyId prop
- Clicking "View Details" navigates to translations page
- Widget respects property context changes

**Actions**:
- Document test requirements
- Note for future implementation
- Follow existing dashboard test patterns

---

## 3. Authorized Files for Modification

### Existing Files to Modify:
1. `/src/app/dashboard2/page.tsx`
   - Add TranslationStatusWidget import (line ~34)
   - Add handleViewTranslations callback (line ~125)
   - Add widget to JSX layout (between lines 211-213)
   - Update file-level JSDoc (lines 2-18)
   - Modification: ~15-20 lines added

### Files Referenced (No Modification):
2. `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
   - Referenced: Widget component being integrated
   - No modification needed

3. `/src/hooks/usePropertyContext.tsx`
   - Referenced: For selectedPropertyId state
   - No modification needed

4. `/src/hooks/useDashboardStats.ts`
   - Referenced: Pattern for data fetching hooks
   - No modification needed

### Future Files (Out of Scope):
5. `/src/app/dashboard2/translations/page.tsx` (future)
   - Future: Translation management page (separate task)
   - Not created in this task

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-013**: TranslationStatusWidget component
  - Required for: Widget to import and render
  - Import: `@/components/TranslationManagement/TranslationStatusWidget`
  - Status: Must be completed before this task

- **REQ-E05-011**: useTranslationStatus hook
  - Required for: Widget's internal data fetching
  - Import: Used internally by TranslationStatusWidget
  - Status: Must be completed before this task (dependency of REQ-E05-013)

- **REQ-E05-009**: TranslationProgressBar component
  - Required for: Widget's progress visualization
  - Import: Used internally by TranslationStatusWidget
  - Status: Must be completed before this task (dependency of REQ-E05-013)

- **REQ-E05-001**: Translation Status API endpoint
  - Required for: Backend data source for useTranslationStatus hook
  - Endpoint: `/api/translations/status`
  - Status: Must be completed and deployed

### External Dependencies (Existing):
- **next/navigation**: Router for navigation
  - Usage: useRouter hook for handleViewTranslations

- **next-intl**: Internationalization
  - Usage: Widget uses translations internally

- **React**: Core framework (v18+)
  - Usage: useCallback for navigation handler

- **usePropertyContext**: Property context hook
  - Usage: selectedPropertyId for filtering

### Blocks (This Must Complete First):
- **REQ-E05-017**: Add Translation Status Column to Items List
  - Integration: May reference dashboard integration pattern
  - Not a hard blocker, but benefits from this pattern

---

## 5. Key Technical Decisions

### 5.1 Widget Placement in Dashboard Layout
**Decision**: Place widget after ProgressiveStatisticsSection, before AdvancedDashboardTools.

**Rationale**:
- Natural information hierarchy: overall stats → translation status → management tools → actions
- Clear visual separation between sections
- Doesn't disrupt existing dashboard flow
- Easy to find and scan

**Alternative Considered**: Place within ProgressiveStatisticsSection alongside other stats
- Rejected: Requires modifying ProgressiveStatisticsSection component
- More complex integration
- Harder to maintain separation of concerns

**Implementation**: Simple insertion between existing sections.

### 5.2 Data Fetching Strategy
**Decision**: Widget handles its own data fetching via useTranslationStatus hook.

**Rationale**:
- Widget is self-contained and reusable
- Follows existing dashboard pattern (ProgressiveStatisticsSection also self-fetches)
- Simplifies dashboard page logic
- Widget manages its own loading/error states

**Alternative Considered**: Dashboard page fetches translation data and passes to widget
- Rejected: Creates coupling between dashboard and translation data
- More complex state management in dashboard
- Violates separation of concerns

**Implementation**: Widget receives only propertyId and onViewDetails callback.

### 5.3 Property Context Integration
**Decision**: Pass selectedPropertyId from usePropertyContext to widget.

**Rationale**:
- Consistent with existing dashboard pattern (useDashboardStats uses same approach)
- Widget automatically filters data when property is selected
- No additional state management needed
- Property selector already exists in dashboard header

**Implementation**: `propertyId={selectedPropertyId || undefined}`

### 5.4 Navigation Target
**Decision**: Navigate to `/dashboard2/translations` route on "View Details" click.

**Rationale**:
- Consistent with dashboard routing pattern (/dashboard2/*)
- Separate page for translation management provides space for complex UI
- Easy to bookmark and share
- Follows RESTful routing conventions

**Future Enhancement**: Pass propertyId as query parameter for filtered view
- Example: `/dashboard2/translations?propertyId=abc123`

**Implementation**: Simple router.push in callback.

### 5.5 Conditional Rendering Strategy
**Decision**: Always render widget; let widget handle empty state internally.

**Rationale**:
- Widget has built-in empty state handling (from REQ-E05-013)
- Consistent user experience for all users
- Introduces translation features to new users
- Simpler integration logic (no conditional checks needed)

**Alternative Considered**: Only show widget if user has translatable content
- Rejected: Adds complexity to dashboard
- Harder to discover feature for new users
- Widget already handles empty state gracefully

**Implementation**: Widget always rendered (no conditional wrapper).

---

## 6. Risks and Mitigations

### Risk 1: Translation Status API Not Available
**Risk**: /api/translations/status endpoint doesn't exist or isn't ready.

**Impact**: High - Widget won't function without API

**Mitigation**:
- Verify REQ-E05-001 is completed before integration
- Test API endpoint availability before deploying dashboard changes
- Widget's error state will handle API failures gracefully
- Add API health check to integration testing

**Likelihood**: Low (dependencies are clear)

### Risk 2: Performance Impact on Dashboard Load
**Risk**: Adding widget slows down dashboard initial load time.

**Impact**: Medium - User experience degradation

**Mitigation**:
- Widget fetches data asynchronously (doesn't block page render)
- Widget shows skeleton during loading (perceived performance)
- Use React.memo if widget re-renders unnecessarily
- Monitor dashboard load time before and after integration
- Consider lazy loading widget if performance issues arise

**Likelihood**: Low (widget is self-contained)

### Risk 3: Layout Breakage on Mobile
**Risk**: Widget doesn't render correctly on small screens.

**Impact**: Medium - Mobile UX issue

**Mitigation**:
- Widget is designed to be responsive (from REQ-E05-013)
- Test on multiple screen sizes during integration
- Use dashboard's existing responsive utilities
- Widget supports compact mode if needed

**Likelihood**: Low (widget has responsive design)

### Risk 4: Property Context Switching Issues
**Risk**: Widget doesn't update when property selection changes.

**Impact**: Medium - Incorrect data displayed

**Mitigation**:
- useTranslationStatus hook should watch propertyId changes
- Test property switching thoroughly
- Verify useEffect dependencies in hook
- Add debug logging if issues occur

**Likelihood**: Low (pattern established by useDashboardStats)

### Risk 5: Navigation Route Doesn't Exist
**Risk**: `/dashboard2/translations` route isn't created yet.

**Impact**: High - Broken navigation

**Mitigation**:
- Coordinate with team to ensure route is created
- Add temporary placeholder page if needed
- Could navigate to existing route (e.g., /dashboard2/items) temporarily
- Document dependency clearly

**Likelihood**: Medium (depends on task ordering)

### Risk 6: i18n Translation Keys Missing
**Risk**: Widget translation keys not added to message files.

**Impact**: Medium - Untranslated text in widget

**Mitigation**:
- Verify REQ-E05-013 includes translation key additions
- Widget should handle missing keys gracefully
- Add fallback English text in widget
- Test in multiple languages before release

**Likelihood**: Low (REQ-E05-013 handles translations)

---

## 7. Out of Scope

### 7.1 Create Translation Management Page
- Not creating `/dashboard2/translations/page.tsx` in this task
- Rationale: Separate feature, separate task
- Future Task: REQ-E05-018 or similar

### 7.2 Sidebar Widget Placement
- Not implementing sidebar layout for widget
- Rationale: Dashboard doesn't have sidebar currently
- Future Enhancement: If dashboard adds sidebar, widget could move there

### 7.3 Auto-Refresh Widget Data
- No polling or websocket for real-time updates
- Rationale: Dashboard doesn't use auto-refresh for other stats
- Future Enhancement: Could add refresh interval if valuable

### 7.4 Widget Customization Settings
- No user preferences for widget display (hide/show, position, size)
- Rationale: Dashboard doesn't support widget customization yet
- Future Enhancement: Add to dashboard preferences system

### 7.5 Multiple Widgets for Different Entity Types
- Only one widget showing aggregated translation status
- Not creating separate widgets for items, articles, links
- Rationale: Single summary widget is sufficient
- Use Case: Detailed breakdown in translation management page

### 7.6 Export Translation Status
- No CSV/PDF export from widget
- Rationale: Export functionality belongs in detailed view
- Out of Scope: Dashboard widget is read-only summary

### 7.7 Inline Translation Editing
- Widget doesn't allow editing translations directly
- Rationale: Widget is for status overview only
- Use Case: Click "View Details" to access editing UI

### 7.8 Historical Trend Data
- No charts showing translation status over time
- Rationale: Current requirement is snapshot view only
- Future Enhancement: Add trend chart in detailed view

---

## 8. Testing Considerations

### Manual Testing (Required):
- Dashboard renders without errors after integration
- Widget appears in correct position (after stats, before tools)
- Widget displays loading skeleton on initial load
- Widget shows translation status data when loaded
- Widget respects property selection from header dropdown
- Changing property updates widget data appropriately
- Widget displays error state when API fails
- Retry button works in error state
- Widget displays empty state for new users
- "View Details" button navigates to translations page
- Widget is responsive on mobile, tablet, desktop
- All text is properly internationalized
- Widget is keyboard accessible (Tab to focus, Enter to click)
- Screen reader announces widget content correctly
- No console errors or warnings
- Existing dashboard features still work correctly

### Integration Testing (Future):
- Dashboard page renders with TranslationStatusWidget
- Widget receives correct propertyId prop
- Property context changes trigger widget data refresh
- Navigation callback works correctly
- Widget doesn't interfere with other dashboard components

### Performance Testing (Required):
- Dashboard load time not significantly impacted
- Widget data fetching is async and non-blocking
- No unnecessary re-renders on property changes
- API request count is reasonable (no duplicate calls)

---

## 9. Estimated Effort

**Total Effort**: 2-3 hours

**Breakdown**:
- Investigation and planning: 0.5 hours (completed in this doc)
- Import and integration: 0.5 hours
- Navigation handler: 0.25 hours
- Testing and refinement: 1-1.5 hours
- Documentation updates: 0.25 hours

**Complexity**: Low
- Simple component integration (widget is self-contained)
- Follows established dashboard patterns
- Minimal state management required
- Most complexity is in testing and verification

**Assumptions**:
- TranslationStatusWidget component is complete and working (REQ-E05-013)
- Translation Status API endpoint is available (REQ-E05-001)
- No major issues discovered during testing

---

## 10. Success Criteria

This task is complete when:

1. ✅ TranslationStatusWidget is imported in dashboard page
2. ✅ Widget is rendered in dashboard layout (after stats, before tools)
3. ✅ Widget receives selectedPropertyId from usePropertyContext
4. ✅ handleViewTranslations navigation callback is implemented
5. ✅ Widget displays on dashboard load without errors
6. ✅ Widget fetches and displays translation status data
7. ✅ Widget respects property filtering from header dropdown
8. ✅ Changing property updates widget data appropriately
9. ✅ "View Details" button navigates to /dashboard2/translations
10. ✅ Widget is responsive on all screen sizes
11. ✅ Widget handles loading, error, and empty states correctly
12. ✅ Widget doesn't break existing dashboard functionality
13. ✅ No console errors or warnings related to widget
14. ✅ File-level JSDoc is updated with REQ-E05-016
15. ✅ Integration is tested on multiple screen sizes
16. ✅ Accessibility is verified with keyboard and screen reader

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Source Request**: `/docs/gen_requests_epic5.md` (Request #16, lines 2235-2349)
- **REQ-E05-013**: TranslationStatusWidget component (dependency)
- **REQ-E05-011**: useTranslationStatus hook (indirect dependency)
- **REQ-E05-009**: TranslationProgressBar component (indirect dependency)
- **REQ-E05-001**: Translation Status API endpoint (dependency)
- **Dashboard Pattern**: `/src/app/dashboard2/page.tsx` (integration target)
- **Data Fetching Pattern**: `/src/hooks/useDashboardStats.ts` (reference pattern)
- **Property Context**: `/src/hooks/usePropertyContext.tsx` (context provider)

---

## 12. Notes

- This is a simple integration task; most complexity is in the widget component itself (REQ-E05-013)
- The dashboard page already has excellent patterns for component integration (ProgressiveStatisticsSection, ActionButtons, etc.)
- Property context handling is well-established via usePropertyContext hook
- The navigation target `/dashboard2/translations` will be created in a separate task
- Consider adding propertyId to navigation route for filtered view in future enhancement
- Widget is self-contained and doesn't require dashboard-level data fetching code
- Testing should focus on integration points and ensuring no regressions in existing dashboard features

---

**Document Status**: Ready for Implementation
**Next Step**: Verify REQ-E05-013 is complete, then begin integration with Step 2 (import statement)
