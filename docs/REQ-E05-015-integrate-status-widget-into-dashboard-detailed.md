# Detailed Task Breakdown: REQ-E05-015 - Dashboard Translation Status Widget Integration

**Document Created:** 2026-01-20 19:15 UTC
**Last Modified:** 2026-01-20 19:15 UTC
**Request ID:** REQ-E05-015 (corresponds to gen_requests_epic5.md #16: REQ-E05-016)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.4
**Complexity:** M (Medium)
**Estimated Effort:** 1.5-2 hours

---

## Overview

This document provides detailed, step-by-step implementation tasks for integrating the TranslationStatusWidget component into the main dashboard page at `/src/app/dashboard2/page.tsx`. The widget will display translation coverage statistics immediately upon login, providing property owners with visibility into their multilingual content status without requiring navigation to specialized translation management pages.

---

## Prerequisites

Before implementing this task, verify the following components exist and are functional:

| Component | File Path | Required By |
|-----------|-----------|-------------|
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | REQ-E05-013 |
| useTranslationStatus hook | `/src/hooks/useTranslationStatus.ts` | REQ-E05-011 |
| useTranslationRealtime hook | `/src/hooks/useTranslationRealtime.ts` | REQ-E05-012 |
| Translation Status API | `/src/app/api/translations/status/route.ts` | REQ-E05-001 |
| TranslationManagement barrel export | `/src/components/TranslationManagement/index.ts` | REQ-E05-013 |

**Pre-implementation verification command:**
```bash
# Verify required files exist
ls -la src/components/TranslationManagement/TranslationStatusWidget/
ls -la src/hooks/useTranslationStatus.ts
ls -la src/hooks/useTranslationRealtime.ts
ls -la src/app/api/translations/status/route.ts
```

---

## Tasks

### Task 1: Add TranslationStatusWidget Import Statement

**File:** `/src/app/dashboard2/page.tsx`
**Location:** Import statements section (lines 21-39)
**Type:** Addition

**Current State:**
```typescript
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Home } from 'lucide-react';
import {
  ActionButtons,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';
// ... other imports
```

**Target State:**
```typescript
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Home } from 'lucide-react';
import {
  ActionButtons,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';
import { TranslationStatusWidget } from '@/components/TranslationManagement';
// ... other imports
```

**Implementation Details:**
1. Add the import statement after the SimpleDashboard imports block
2. The import uses the barrel export from the TranslationManagement index.ts
3. If the barrel export doesn't exist yet, use the full path: `'@/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget'`

**Acceptance Criteria:**
- [ ] Import statement added without TypeScript errors
- [ ] No unused import warnings (component will be used in subsequent task)

---

### Task 2: Insert TranslationStatusWidget in Dashboard Layout

**File:** `/src/app/dashboard2/page.tsx`
**Location:** Main render section, between ProgressiveStatisticsSection and AdvancedDashboardTools (approximately line 209-212)
**Type:** Addition

**Current State (lines 198-219):**
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

{/* REQ-136: Advanced Dashboard Tools */}
<AdvancedDashboardTools
  selectedPropertyIds={selectedPropertyIds}
  onSelectAll={handleSelectAll}
  onDeselectAll={handleDeselectAll}
  onPrintSelected={handlePrintSelected}
  onGroupChange={handleGroupChange}
  currentGrouping={currentGrouping}
/>
```

**Target State:**
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

{/* REQ-E05-015: Translation Status Widget Integration */}
{!isLoading && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId || ''}
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}

{/* REQ-136: Advanced Dashboard Tools */}
<AdvancedDashboardTools
  selectedPropertyIds={selectedPropertyIds}
  onSelectAll={handleSelectAll}
  onDeselectAll={handleDeselectAll}
  onPrintSelected={handlePrintSelected}
  onGroupChange={handleGroupChange}
  currentGrouping={currentGrouping}
/>
```

**Implementation Details:**
1. Place the widget after `ProgressiveStatisticsSection` and before `AdvancedDashboardTools`
2. Wrap in conditional rendering `{!isLoading && (...)}` to prevent showing widget during initial dashboard load
3. Pass `selectedPropertyId` from `usePropertyContext()` to scope widget to selected property
4. When `selectedPropertyId` is null (All Properties view), pass empty string
5. The `onViewDetails` callback navigates to `/dashboard2/translations` (translation management page)

**Props Explanation:**
| Prop | Value | Purpose |
|------|-------|---------|
| `propertyId` | `selectedPropertyId \|\| ''` | Scopes translation status to selected property, or all properties if empty |
| `onViewDetails` | `() => router.push('/dashboard2/translations')` | Navigation callback for "View Details" link |

**Acceptance Criteria:**
- [ ] Widget renders after statistics section
- [ ] Widget is conditionally hidden during initial load
- [ ] Widget receives correct propertyId prop
- [ ] View Details link navigates to translations page

---

### Task 3: Verify Widget Does Not Render for New Users

**File:** `/src/app/dashboard2/page.tsx`
**Location:** Existing conditional rendering block (lines 169-226)
**Type:** Verification (No code change needed)

**Current Behavior:**
The dashboard already has conditional rendering for new users:
```tsx
{isNewUser && !isLoading ? (
  <div className="bg-white rounded-xl shadow-sm">
    <EmptyStateCard ... />
  </div>
) : (
  <>
    {/* All dashboard content including new widget */}
  </>
)}
```

**Verification:**
The widget is placed inside the `else` branch of the `isNewUser` conditional, so it will automatically NOT render for new users who have no properties and no items.

**Implementation Details:**
1. No code changes required for this task
2. The widget placement in Task 2 is already within the non-new-user branch
3. The `isNewUser` check at line 79 ensures new users see the welcome state instead

**Acceptance Criteria:**
- [ ] Widget does NOT appear when `isNewUser` is true
- [ ] Widget does NOT appear during initial loading state
- [ ] New users see the EmptyStateCard with "Welcome to FAQBNB!" instead

---

### Task 4: Handle Empty Property Selection Edge Case

**File:** `/src/app/dashboard2/page.tsx`
**Location:** Widget props in render section
**Type:** Already handled in Task 2

**Edge Case Analysis:**
| Scenario | `selectedPropertyId` Value | Widget `propertyId` Prop | Expected Behavior |
|----------|----------------------------|--------------------------|-------------------|
| Single property selected | `"uuid-123"` | `"uuid-123"` | Shows status for that property |
| All Properties view | `null` | `""` (empty string) | Shows aggregated status for all properties |
| No properties yet | N/A | N/A | Widget doesn't render (new user state) |

**Implementation Details:**
1. The `|| ''` fallback in `propertyId={selectedPropertyId || ''}` handles the null case
2. The TranslationStatusWidget component should internally handle empty string to aggregate all properties
3. This behavior should be documented in the widget component's props interface

**Acceptance Criteria:**
- [ ] Widget accepts empty string propertyId without errors
- [ ] Widget shows aggregated data when propertyId is empty
- [ ] No TypeScript errors for null/undefined handling

---

### Task 5: Add Comment Documentation

**File:** `/src/app/dashboard2/page.tsx`
**Location:** File header comment block (lines 1-19)
**Type:** Modification

**Current State (partial):**
```typescript
/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * ...
 * REQ-140: Added responsive padding and layout for mobile
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-06 16:52:00 UTC
 */
```

**Target State:**
```typescript
/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * ...
 * REQ-140: Added responsive padding and layout for mobile
 * REQ-E05-015: Added TranslationStatusWidget integration for translation coverage visibility
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-20 19:15:00 UTC
 */
```

**Implementation Details:**
1. Add REQ-E05-015 entry to the requirements list in the file header
2. Update the `@modified` timestamp to current UTC time

**Acceptance Criteria:**
- [ ] File header includes REQ-E05-015 documentation
- [ ] Modified timestamp is updated

---

## Complete Modified File Section

For reference, here is the complete modified section of the dashboard page showing all changes:

```tsx
// ... imports section
import { TranslationStatusWidget } from '@/components/TranslationManagement';
// ... rest of imports

export default function Dashboard2Page() {
  // ... existing hooks and state (unchanged)

  return (
    <div className={mainSpacing}>
      {/* REQ-132: Success Message Banner */}
      {successMessage && (
        // ... unchanged
      )}

      {/* REQ-137: New User Welcome State */}
      {isNewUser && !isLoading ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyStateCard
            icon={Home}
            title="Welcome to FAQBNB!"
            description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
            actionLabel="Add Your First Property"
            onAction={handleAddProperty}
            variant="welcome"
          />
        </div>
      ) : (
        <>
          {/* Welcome Section with Settings - REQ-140: Responsive padding */}
          <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
            {/* ... unchanged */}
          </div>

          {/* REQ-136: Progressive Statistics Section */}
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

          {/* REQ-E05-015: Translation Status Widget Integration */}
          {!isLoading && (
            <TranslationStatusWidget
              propertyId={selectedPropertyId || ''}
              onViewDetails={() => router.push('/dashboard2/translations')}
            />
          )}

          {/* REQ-136: Advanced Dashboard Tools */}
          <AdvancedDashboardTools
            selectedPropertyIds={selectedPropertyIds}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onPrintSelected={handlePrintSelected}
            onGroupChange={handleGroupChange}
            currentGrouping={currentGrouping}
          />

          {/* Action Buttons - REQ-126 */}
          <ActionButtons />
        </>
      )}

      {/* Property Edit Modal - REQ-131 */}
      <PropertyEditModal ... />

      {/* Add Property Modal - REQ-132 */}
      <AddPropertyModal ... />
    </div>
  );
}
```

---

## Testing Checklist

### Functional Tests

- [ ] Dashboard loads without errors after changes
- [ ] TranslationStatusWidget appears in correct position (after statistics, before advanced tools)
- [ ] Widget shows loading skeleton during initial data fetch (handled internally by widget)
- [ ] Widget displays translation status data correctly
- [ ] "View Details" link navigates to `/dashboard2/translations`
- [ ] Widget updates when property filter changes via header dropdown
- [ ] Widget does NOT appear for new users (no properties, no items)
- [ ] Widget does NOT appear during initial page load (`isLoading === true`)

### Edge Case Tests

- [ ] All Properties view (null propertyId) - widget shows aggregated data
- [ ] Single property selected - widget shows property-specific data
- [ ] API error handling - widget shows error state with retry option
- [ ] No content created yet - widget shows appropriate empty state

### Visual/Layout Tests

- [ ] Widget maintains consistent positioning without layout shifts
- [ ] Widget is visible without scrolling on desktop (1920x1080)
- [ ] Widget responsive design works on tablet (768px width)
- [ ] Widget responsive design works on mobile (375px width)
- [ ] Widget styling matches other dashboard cards (shadow, rounded corners, spacing)

### Accessibility Tests

- [ ] Widget has proper ARIA labels
- [ ] Widget is keyboard navigable
- [ ] Screen reader announces widget content correctly
- [ ] Focus management is correct when interacting with widget

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate Rollback:** Remove the TranslationStatusWidget JSX and import
2. **Partial Rollback:** Wrap widget in feature flag check:
   ```tsx
   {process.env.NEXT_PUBLIC_FEATURE_TRANSLATION_WIDGET === 'true' && !isLoading && (
     <TranslationStatusWidget ... />
   )}
   ```

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| REQ-E05-013 (TranslationStatusWidget) | Hard | Component must exist |
| REQ-E05-011 (useTranslationStatus hook) | Hard | Widget uses this hook internally |
| REQ-E05-012 (useTranslationRealtime hook) | Soft | Provides real-time updates; widget works without it |
| REQ-E05-001 (Translation Status API) | Hard | Widget fetches data from this endpoint |
| REQ-E05-017 (Translations Management Page) | Soft | "View Details" links here; page can show 404/coming soon |

---

## Performance Considerations

1. **Parallel Loading:** Widget fetches translation status independently from dashboard stats, allowing parallel loading
2. **Conditional Rendering:** Widget only renders after initial load completes, reducing initial paint blocking
3. **Internal Caching:** Widget's useTranslationStatus hook should cache results to prevent redundant API calls
4. **Realtime Efficiency:** Widget auto-disables polling when no pending translation jobs exist

---

## References

- **Overview Document:** `/docs/REQ-E05-015-integrate-status-widget-into-dashboard-overview.md`
- **Requirements:** `/docs/gen_requests_epic5.md` (REQ-E05-016)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 3.4)
- **Dashboard Page:** `/src/app/dashboard2/page.tsx`
- **Widget Component:** `/src/components/TranslationManagement/TranslationStatusWidget/`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
