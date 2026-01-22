# REQ-E05-013: Create TranslationStatusWidget Component - Implementation Overview

**Created**: 2026-01-22 19:28
**Last Modified**: 2026-01-22 19:28
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.1

---

## 1. Goal

Create a dashboard widget component that displays a summary of translation status for a property. The widget shows:
- Overall translation progress as a percentage with visual progress bar
- Count breakdowns by status (Complete, Partial, Pending, Failed)
- Optional "View Details" link for navigation to detailed view
- Support for both standard and compact display modes
- Property-specific filtering via optional propertyId prop

**Component File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

**Key Features**:
- Integration with `useTranslationStatus` hook for data fetching
- Responsive grid layout for status cards
- Loading skeleton with accessibility support
- Error state handling with user-friendly messages
- Empty state when no translation data exists
- i18n support via next-intl
- ARIA labels for accessibility

---

## 2. Implementation Plan

### Step 1: Create Component Directory Structure
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/` (new directory)

Create the component directory following the established pattern from SimpleDashboard components.

**Actions**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusWidget/`
- Will contain: `TranslationStatusWidget.tsx`, `StatusCard.tsx`, `index.ts`

### Step 2: Create StatusCard Subcomponent
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx` (new)

Create a reusable card component for displaying individual status counts.

**Pattern Reference**: `/src/components/SimpleDashboard/StatisticsCards.tsx` (lines 50-82) - StatCard component
- Card-based layout with icon, value, and label
- Color variants based on status type
- Hover effects and transitions
- Responsive sizing

**Implementation Details**:
```typescript
interface StatusCardProps {
  status: 'complete' | 'partial' | 'pending' | 'failed';
  count: number;
  label: string;
  icon: React.ReactNode;
  compact?: boolean;
}
```

**Status Color Mapping**:
- Complete: Green (`text-green-600`, `bg-green-50`)
- Partial: Blue (`text-blue-600`, `bg-blue-50`)
- Pending: Orange (`text-orange-600`, `bg-orange-50`)
- Failed: Red (`text-red-600`, `bg-red-50`)

**Actions**:
- Create StatusCard component with props interface
- Implement responsive card layout
- Add conditional styling based on status type
- Add compact mode styling (reduced padding, smaller text)
- Ensure ARIA attributes for accessibility

### Step 3: Define Main Component Interface
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` (new)

Define the props interface and component structure.

**Implementation Details**:
```typescript
interface TranslationStatusWidgetProps {
  propertyId?: string;           // Optional property filter
  compact?: boolean;             // Compact mode for sidebar
  showViewDetailsLink?: boolean; // Show/hide "View Details" link
  onViewDetails?: () => void;    // Optional callback for link click
  className?: string;            // Additional styling
}
```

**Actions**:
- Create props interface with JSDoc comments
- Import necessary dependencies (React, next-intl, icons)
- Import useTranslationStatus hook from `@/hooks`
- Import TranslationProgressBar from sibling component
- Import StatusCard subcomponent

### Step 4: Implement useTranslations Hook Integration
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Set up internationalization for all UI text.

**Pattern Reference**: All SimpleDashboard components use `useTranslations` from next-intl

**Translation Namespace**: `translationManagement.widget`

**Required Translation Keys**:
- `title`: "Translation Status"
- `viewDetails`: "View Details"
- `statusLabels.complete`: "Complete"
- `statusLabels.partial`: "Partial"
- `statusLabels.pending`: "Pending"
- `statusLabels.failed`: "Failed"
- `loading`: "Loading translation status..."
- `error`: "Failed to load translation status"
- `empty`: "No translation data available"
- `progress`: "{percent}% Complete"

**Actions**:
- Add `'use client'` directive at top of file
- Import and call `useTranslations('translationManagement.widget')`
- Use `t()` function for all user-facing text
- Document required translation keys in component JSDoc

### Step 5: Integrate useTranslationStatus Hook
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Fetch translation status data using the custom hook.

**Hook Import**: `import { useTranslationStatus } from '@/hooks';`

**Pattern Reference**: `/src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 25-30) - hook usage pattern

**Implementation Details**:
```typescript
const {
  status: translationStatus,
  isLoading,
  error,
  refetch
} = useTranslationStatus({
  scope: propertyId ? 'property' : 'entity',
  propertyId,
  entityType: 'property', // or determine dynamically
  entityId: propertyId
});
```

**Actions**:
- Call useTranslationStatus with appropriate parameters
- Destructure loading, error, and data states
- Handle undefined/null data gracefully
- Add error boundary consideration

### Step 6: Create Loading Skeleton
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Implement loading state with skeleton UI for accessibility.

**Pattern Reference**: `/src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 35-56) - loading skeleton wrapped in SkeletonBase

**Component Import**: `import { SkeletonBase } from '@/components/Skeleton';`

**Implementation Details**:
- Wrap skeleton in `<SkeletonBase label={t('loading')}>`
- Match layout of actual content (header + progress bar + status cards)
- Use Tailwind `animate-pulse` for shimmer effect
- Respect `compact` prop for skeleton sizing

**Actions**:
- Create conditional render for `isLoading` state
- Build skeleton structure matching widget layout
- Add proper ARIA labels via SkeletonBase
- Test with screen reader

### Step 7: Create Error State Component
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Handle error state with user-friendly message and retry option.

**Pattern Reference**: Common error pattern across SimpleDashboard components

**Implementation Details**:
- Display error message from `error` state
- Show generic fallback if error message is undefined
- Include retry button that calls `refetch()`
- Use red/warning color scheme
- Maintain widget dimensions

**Actions**:
- Create conditional render for `error` state
- Display translated error message
- Add retry button with click handler
- Style with warning colors and icons
- Ensure error is announced to screen readers

### Step 8: Create Empty State Component
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Handle case where no translation data exists.

**Implementation Details**:
- Display when `translationStatus` is null/undefined but no error
- Show friendly empty state message
- Optional icon (e.g., empty folder or language icon)
- Maintain widget dimensions

**Actions**:
- Create conditional render for empty state
- Display translated empty message
- Add appropriate icon
- Style consistently with other empty states in app

### Step 9: Implement Widget Header
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Create the widget header with title and gradient background.

**Pattern Reference**: `/src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 61-72) - gradient header

**Implementation Details**:
- Use gradient background: `bg-gradient-to-r from-purple-600 to-indigo-600` (or brand colors)
- White text with proper contrast
- Rounded top corners
- Responsive padding
- Display translated title

**Actions**:
- Create header div with gradient classes
- Add translated title text
- Apply proper spacing and typography
- Ensure color contrast meets WCAG AA standards
- Respect `compact` prop for header sizing

### Step 10: Implement Progress Bar Section
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Display overall translation progress using TranslationProgressBar component.

**Component Import**: `import { TranslationProgressBar } from '../TranslationProgressBar';`

**Pattern Reference**: REQ-E05-009 - TranslationProgressBar component

**Implementation Details**:
- Calculate overall completion percentage from status data
- Pass `percentage` prop to TranslationProgressBar
- Use `size="md"` in standard mode, `size="sm"` in compact mode
- Display percentage text above or beside progress bar
- Show animated state if any translations are "pending" or "processing"

**Actions**:
- Calculate completion percentage from translationStatus data
- Render TranslationProgressBar with appropriate props
- Add percentage label with i18n formatting
- Handle edge cases (0%, 100%, undefined)
- Apply responsive spacing

### Step 11: Implement Status Cards Grid
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Display status breakdown cards in responsive grid.

**Pattern Reference**: `/src/components/SimpleDashboard/StatisticsCards.tsx` (lines 28-45) - grid layout

**Implementation Details**:
- Grid layout: `grid grid-cols-2 md:grid-cols-4 gap-4` (standard mode)
- Compact mode: `grid grid-cols-2 gap-2`
- One StatusCard per status type (complete, partial, pending, failed)
- Extract counts from translationStatus data
- Pass appropriate icons for each status type

**Status Icons** (from lucide-react or radix-ui):
- Complete: CheckCircle2 (green)
- Partial: AlertCircle (blue)
- Pending: Clock (orange)
- Failed: XCircle (red)

**Actions**:
- Create responsive grid container
- Render StatusCard for each status type
- Extract and pass count data from translationStatus
- Pass translated labels to each card
- Handle zero counts gracefully
- Ensure grid adapts to compact mode

### Step 12: Implement View Details Link
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Add optional link/button to view detailed translation status.

**Pattern Reference**: Common link patterns in dashboard components

**Implementation Details**:
- Conditionally render based on `showViewDetailsLink` prop
- If `onViewDetails` callback provided, render as button
- Otherwise, render as Link to translation management page
- Display translated "View Details" text
- Include ChevronRight icon
- Style with hover effects

**Actions**:
- Create conditional render for link section
- Implement button variant with onClick handler
- Implement Link variant with href
- Add icon and translated text
- Style with hover/focus states
- Ensure keyboard navigation works

### Step 13: Apply Widget Container Styling
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Wrap widget content in styled container matching dashboard patterns.

**Pattern Reference**: `/src/components/SimpleDashboard/PortfolioSummary.tsx` (lines 58-60) - container styling

**Implementation Details**:
- Outer container with shadow and border
- Rounded corners: `rounded-lg`
- Background: `bg-white dark:bg-gray-800`
- Shadow: `shadow-md hover:shadow-lg transition-shadow`
- Responsive padding
- Merge with optional `className` prop

**Actions**:
- Create outer container div with base classes
- Apply responsive padding classes
- Add hover effects for interactivity
- Support dark mode variants
- Merge with user-provided className using `cn()` utility
- Ensure proper spacing between sections

### Step 14: Create Barrel Export
**File**: `/src/components/TranslationManagement/TranslationStatusWidget/index.ts` (new)

Create index file for clean imports.

**Pattern Reference**: All component directories have barrel exports

**Actions**:
- Export TranslationStatusWidget as default and named export
- Export TranslationStatusWidgetProps type
- Export StatusCard if it should be usable externally

### Step 15: Update Parent Barrel Export
**File**: `/src/components/TranslationManagement/index.ts`

Add TranslationStatusWidget to parent namespace exports.

**Pattern Reference**: Existing TranslationManagement barrel exports

**Actions**:
- Add export statement for TranslationStatusWidget
- Add export statement for TranslationStatusWidgetProps type
- Maintain alphabetical or logical ordering

### Step 16: Add Translation Keys to Message Files
**Files**:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Add required translation keys for the widget.

**English Template** (`/messages/en.json`):
```json
{
  "translationManagement": {
    "widget": {
      "title": "Translation Status",
      "viewDetails": "View Details",
      "statusLabels": {
        "complete": "Complete",
        "partial": "Partial",
        "pending": "Pending",
        "failed": "Failed"
      },
      "loading": "Loading translation status...",
      "error": "Failed to load translation status",
      "empty": "No translation data available",
      "progress": "{percent}% Complete"
    }
  }
}
```

**Actions**:
- Add keys to English file first (source language)
- Copy structure to all target language files (fr, es, de, nl, it)
- Translate text appropriately for each language
- Ensure consistent key structure across all files
- Validate JSON syntax

### Step 17: Manual Integration Testing
**Context**: Dashboard integration testing

Test the widget in actual dashboard context.

**Test Scenarios**:
1. Widget displays correctly on dashboard with real data
2. Loading skeleton appears during data fetch
3. Error state displays and retry works
4. Empty state displays when no data
5. Progress bar reflects accurate percentage
6. Status cards show correct counts
7. View Details link/button works correctly
8. Compact mode renders appropriately
9. Property filtering works (when propertyId provided)
10. Responsive layout adapts to screen sizes
11. Dark mode styling works correctly
12. i18n works for all supported languages

**Actions**:
- Import and render widget in SimpleDashboard or test page
- Test all loading/error/empty/success states
- Test with different propertyId values
- Test compact and standard modes
- Test View Details navigation
- Verify accessibility with screen reader
- Test responsive breakpoints
- Validate in all supported languages

---

## 3. Authorized Files for Modification

### New Files to Create:
1. `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
   - Main widget component
   - Lines: ~250-300 (estimated)

2. `/src/components/TranslationManagement/TranslationStatusWidget/StatusCard.tsx`
   - Status card subcomponent
   - Lines: ~60-80 (estimated)

3. `/src/components/TranslationManagement/TranslationStatusWidget/index.ts`
   - Barrel export file
   - Lines: ~5-10

### Existing Files to Modify:
4. `/src/components/TranslationManagement/index.ts`
   - Add TranslationStatusWidget exports
   - Modification: Add 2-3 export lines

5. `/messages/en.json`
   - Add widget translation keys
   - Modification: Add `translationManagement.widget` namespace

6. `/messages/fr.json`
   - Add widget translation keys
   - Modification: Add `translationManagement.widget` namespace

7. `/messages/es.json`
   - Add widget translation keys
   - Modification: Add `translationManagement.widget` namespace

8. `/messages/de.json`
   - Add widget translation keys
   - Modification: Add `translationManagement.widget` namespace

9. `/messages/nl.json`
   - Add widget translation keys
   - Modification: Add `translationManagement.widget` namespace

10. `/messages/it.json`
    - Add widget translation keys
    - Modification: Add `translationManagement.widget` namespace

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-009**: TranslationProgressBar component
  - Required for displaying overall progress
  - Import: `@/components/TranslationManagement/TranslationProgressBar`

- **REQ-E05-011**: useTranslationStatus hook
  - Required for fetching translation status data
  - Import: `@/hooks/useTranslationStatus`

### External Dependencies (Existing):
- **next-intl**: For internationalization
  - `useTranslations` hook

- **React**: Core framework (v18+)
  - useState, useEffect, useMemo

- **lucide-react**: Icon library
  - CheckCircle2, AlertCircle, Clock, XCircle, ChevronRight

- **Tailwind CSS**: Styling utility classes

- **@/components/Skeleton**: Loading skeleton component
  - SkeletonBase for accessible loading states

- **@/lib/utils**: Utility functions
  - `cn()` for className merging

---

## 5. Key Technical Decisions

### 5.1 Layout Modes
**Decision**: Support both standard and compact modes via `compact` prop.

**Rationale**:
- Standard mode: Full dashboard widget with all features
- Compact mode: Sidebar-friendly condensed layout
- Allows reuse in different contexts without separate components

**Implementation**: Conditional styling based on `compact` boolean prop.

### 5.2 Status Color System
**Decision**: Use semantic colors matching status severity.

**Color Mapping**:
- Complete: Green (success)
- Partial: Blue (informational)
- Pending: Orange (warning)
- Failed: Red (error)

**Rationale**: Matches user expectations for status indicators across the application.

### 5.3 View Details Action
**Decision**: Support both callback and navigation patterns via optional props.

**Options**:
1. `onViewDetails` callback: Parent controls navigation
2. No callback: Default Link to `/properties/[id]/translations` or similar

**Rationale**: Flexibility for different integration contexts (modal vs page navigation).

### 5.4 Data Fetching Strategy
**Decision**: Use useTranslationStatus hook with optional propertyId filtering.

**Rationale**:
- Consistent data fetching pattern across Epic 5
- Property filtering enables scoped dashboard views
- Hook handles loading, error, and refresh logic

### 5.5 Responsive Grid Strategy
**Decision**: 2x2 grid on mobile, 1x4 grid on desktop.

**Breakpoint**: md (768px)

**Rationale**:
- Four status cards fit naturally in 2x2 or 1x4 layouts
- Compact mode uses 2x2 regardless of screen size
- Matches SimpleDashboard grid patterns

---

## 6. Risks and Mitigations

### Risk 1: useTranslationStatus Hook Dependency
**Risk**: Widget cannot function without REQ-E05-011 completed.

**Impact**: High - Blocks all functionality

**Mitigation**:
- Ensure REQ-E05-011 is completed first
- Use mock data for initial UI development if needed
- Add error boundaries for graceful failure

**Likelihood**: Low (task dependency is clear)

### Risk 2: Translation Status Data Shape
**Risk**: Actual API data shape may differ from expected interface.

**Impact**: Medium - Requires component adjustments

**Mitigation**:
- Define clear interface contract in REQ-E05-011
- Add runtime type checking or validation
- Use optional chaining for data access
- Test with real API data early

**Likelihood**: Low (interfaces defined in previous tasks)

### Risk 3: Performance with Large Datasets
**Risk**: Widget may be slow if translation status involves many entities.

**Impact**: Low - Widget shows aggregated data, not entity lists

**Mitigation**:
- useTranslationStatus hook should return aggregated counts
- No client-side aggregation needed in widget
- Use React.memo if re-renders become excessive

**Likelihood**: Very Low

### Risk 4: Dark Mode Color Contrast
**Risk**: Status colors may not meet WCAG contrast in dark mode.

**Impact**: Medium - Accessibility issue

**Mitigation**:
- Test all status colors in dark mode
- Adjust color shades if needed (e.g., darker greens, lighter backgrounds)
- Use contrast checking tools
- Add explicit dark mode variants in Tailwind

**Likelihood**: Medium (common issue with semantic colors)

### Risk 5: i18n Key Conflicts
**Risk**: Translation key namespace may conflict with existing keys.

**Impact**: Low - Compile-time error, easy to fix

**Mitigation**:
- Use scoped namespace: `translationManagement.widget`
- Check existing message files before adding keys
- Follow established naming conventions

**Likelihood**: Very Low

---

## 7. Out of Scope

### 7.1 Real-time Updates
- Widget does NOT subscribe to Supabase realtime for live updates
- Rationale: Dashboard widgets typically refresh on page load or manual refresh
- Future Enhancement: Could integrate useTranslationRealtime hook for live updates

### 7.2 Detailed Translation List
- Widget shows summary only, not individual translation items
- Rationale: Detailed view is handled by separate pages/components
- Use Case: Click "View Details" to see full translation list

### 7.3 Inline Translation Editing
- No editing capabilities in the widget itself
- Rationale: Widget is read-only dashboard component
- Future Enhancement: Modal popup with TranslationEditor could be added

### 7.4 Historical Trend Data
- No charts or graphs showing translation status over time
- Rationale: Current requirement is snapshot view only
- Future Enhancement: Could add sparkline or mini chart

### 7.5 Multi-Property Comparison
- Widget shows one property at a time
- Rationale: Property filtering is via single propertyId prop
- Future Enhancement: Portfolio-level widget could show all properties

### 7.6 Export Functionality
- No CSV/PDF export of translation status
- Rationale: Not required for dashboard widget
- Future Enhancement: Export button could be added

### 7.7 Status Filtering/Sorting
- Widget displays all status types, no filtering UI
- Rationale: Summary view should show complete picture
- Use Case: Detailed view handles filtering/sorting

### 7.8 Custom Status Definitions
- Hard-coded status types: complete, partial, pending, failed
- Rationale: Status types are defined by translation service architecture
- Out of Scope: User-defined custom statuses

---

## 8. Testing Considerations

### Unit Tests (Future):
- StatusCard renders with correct colors for each status type
- Widget displays loading skeleton when isLoading=true
- Widget displays error message when error exists
- Widget displays empty state when data is null
- Progress percentage calculated correctly
- Compact mode applies correct styling
- View Details link/button renders conditionally

### Integration Tests (Future):
- Widget fetches data via useTranslationStatus hook
- Property filtering works with propertyId prop
- Refetch function updates widget data
- Navigation to detail view works correctly

### Manual Testing (Required):
- Visual verification in dashboard context
- Responsive layout testing (mobile, tablet, desktop)
- Dark mode styling verification
- i18n testing for all supported languages
- Accessibility testing with screen reader
- Color contrast verification (WCAG AA)

---

## 9. Estimated Effort

**Total Effort**: 6-8 hours

**Breakdown**:
- Component structure and interfaces: 1 hour
- StatusCard subcomponent: 1 hour
- Main widget layout and styling: 2 hours
- Loading/error/empty states: 1 hour
- Data integration and logic: 1.5 hours
- Translation keys and i18n: 0.5 hours
- Testing and refinement: 1-2 hours

**Complexity**: Medium
- Multiple UI states to handle (loading, error, empty, success)
- Responsive grid layout with two modes
- Integration with custom hook
- Multi-language support
- Accessibility requirements

---

## 10. Success Criteria

This task is complete when:

1. ✅ TranslationStatusWidget component renders on dashboard
2. ✅ Widget displays translation progress bar with accurate percentage
3. ✅ Status cards show correct counts for each status type
4. ✅ Loading skeleton appears during data fetch
5. ✅ Error state displays with retry functionality
6. ✅ Empty state displays when no data exists
7. ✅ Compact mode renders appropriately for sidebar use
8. ✅ Property filtering works via propertyId prop
9. ✅ View Details link/button navigates correctly
10. ✅ All UI text is internationalized for 6 languages
11. ✅ Widget is responsive across mobile, tablet, desktop
12. ✅ Dark mode styling works correctly
13. ✅ ARIA labels provide accessible experience
14. ✅ Color contrast meets WCAG AA standards
15. ✅ Component exports are added to parent namespace

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **REQ-E05-009**: TranslationProgressBar component (dependency)
- **REQ-E05-011**: useTranslationStatus hook (dependency)
- **Translation Service Architecture**: (reference existing translation docs)
- **SimpleDashboard Patterns**: `/src/components/SimpleDashboard/` (pattern reference)
- **next-intl Documentation**: https://next-intl-docs.vercel.app/

---

## 12. Notes

- This widget provides a high-level summary view, not detailed translation management
- The component is designed for reusability in different dashboard contexts
- Real-time updates are out of scope but could be added later via useTranslationRealtime hook
- The status color system should remain consistent across all translation UI components
- Consider adding skeleton animation timing that matches other dashboard widgets
- The gradient header color should match the TranslationManagement theme (purple/indigo vs pink/red)

---

**Document Status**: Ready for Implementation
**Next Step**: Begin implementation starting with Step 1 (directory structure)
