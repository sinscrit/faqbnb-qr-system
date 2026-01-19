# REQ-352: Integrate Translation Status Widget into Dashboard Layout - Detailed Implementation

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19 23:55:00 UTC
**Request ID:** REQ-352
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.4
**Estimated Story Points:** 1

---

## Document Purpose

This detailed implementation document provides step-by-step, actionable tasks for integrating the TranslationStatusWidget component into the main dashboard page. Each task is designed to be completed in approximately one story point or less and includes precise file locations, line numbers, and code changes.

---

## Prerequisites

Before starting this implementation, ensure the following dependencies are complete:

| Dependency | Task ID | Description | Verification |
|------------|---------|-------------|--------------|
| REQ-336 | Phase 1, Task 1.1 | Translation Status API endpoint | `GET /api/translations/status` returns data |
| REQ-350 | Phase 3, Task 3.1 | TranslationStatusWidget component | Component exists at `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` |
| TranslationManagement exports | Phase 3 | Barrel export includes widget | `import { TranslationStatusWidget } from '@/components/TranslationManagement'` works |

**Verification Commands:**
```bash
# Check widget component exists
ls -la src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx

# Check API route exists
ls -la src/app/api/translations/status/route.ts

# Check barrel export
grep -l "TranslationStatusWidget" src/components/TranslationManagement/index.ts
```

---

## Implementation Tasks

### Task 1: Update File Header Comment
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** 1-19
**Complexity:** Trivial
**Estimated Time:** 2 minutes

#### Current Code (Lines 1-19):
```typescript
'use client';

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

#### Required Changes:
1. Add REQ-352 reference to the REQ list
2. Update `@modified` timestamp

#### Target Code:
```typescript
'use client';

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
 * REQ-352: Added TranslationStatusWidget for translation visibility
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-19 23:55:00 UTC
 */
```

#### Acceptance Criteria:
- [ ] REQ-352 line added after REQ-140 line
- [ ] `@modified` date updated to current timestamp
- [ ] No syntax errors in comment block

---

### Task 2: Add TranslationStatusWidget Import
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** 21-39 (imports section)
**Complexity:** Trivial
**Estimated Time:** 2 minutes

#### Current Imports (Lines 21-39):
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
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { Property } from '@/types';
import { GroupingOption } from '@/components/SimpleDashboard/PropertyGroupingControl';
import { usePropertyContext } from '@/hooks/usePropertyContext';
```

#### Required Change:
Add import for TranslationStatusWidget after the existing component imports.

#### Target Code (insert after line 39):
```typescript
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

#### Full Updated Imports Section:
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
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { Property } from '@/types';
import { GroupingOption } from '@/components/SimpleDashboard/PropertyGroupingControl';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

#### Acceptance Criteria:
- [ ] Import statement added
- [ ] No TypeScript import errors
- [ ] Build completes without errors

---

### Task 3: Add TranslationStatusWidget to JSX Layout
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** 209-211 (after ProgressiveStatisticsSection, before AdvancedDashboardTools)
**Complexity:** Simple
**Estimated Time:** 5 minutes

#### Current Code (Lines 198-222):
```tsx
          {/* REQ-142: Property selection moved to header PropertyDropdown */}

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

#### Required Change:
Insert TranslationStatusWidget between ProgressiveStatisticsSection and AdvancedDashboardTools.

#### Target Code (insert between lines 209 and 211):
```tsx
          {/* REQ-352: Translation Status Widget - Translation visibility in dashboard */}
          <TranslationStatusWidget
            propertyId={selectedPropertyId || undefined}
            onViewDetails={() => router.push('/dashboard2/translations')}
          />
```

#### Full Updated Section:
```tsx
          {/* REQ-142: Property selection moved to header PropertyDropdown */}

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

          {/* REQ-352: Translation Status Widget - Translation visibility in dashboard */}
          <TranslationStatusWidget
            propertyId={selectedPropertyId || undefined}
            onViewDetails={() => router.push('/dashboard2/translations')}
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

#### Props Explanation:
| Prop | Value | Purpose |
|------|-------|---------|
| `propertyId` | `selectedPropertyId \|\| undefined` | Filters translation stats by selected property; uses all properties if none selected |
| `onViewDetails` | `() => router.push('/dashboard2/translations')` | Navigates to translation management page on "View Details" click |

#### Acceptance Criteria:
- [ ] Widget renders between statistics cards and advanced tools
- [ ] Widget receives `propertyId` from `usePropertyContext`
- [ ] Widget receives `onViewDetails` callback using existing `router`
- [ ] No TypeScript errors on props
- [ ] Widget inherits spacing from parent `space-y-6` or `space-y-8` container

---

### Task 4: Verify Conditional Rendering Context
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** 169-226
**Complexity:** Review/Verify (No code change)
**Estimated Time:** 3 minutes

#### Context Review:

The widget is placed inside the conditional block that excludes new users:

```tsx
{isNewUser && !isLoading ? (
  // New user welcome state - Widget NOT rendered here
  <div className="bg-white rounded-xl shadow-sm">
    <EmptyStateCard ... />
  </div>
) : (
  <>
    // Welcome banner
    // ProgressiveStatisticsSection
    // TranslationStatusWidget  <-- Widget renders HERE
    // AdvancedDashboardTools
    // ActionButtons
  </>
)}
```

#### Verification Points:
1. **New User Check (Line 79):**
   ```typescript
   const isNewUser = (!userProperties || userProperties.length === 0) &&
     (stats?.itemCount === 0 || stats?.itemCount === undefined);
   ```
   - Widget will NOT render for users with no properties AND no items

2. **Widget Placement:**
   - Inside the `else` branch (`:`) of the ternary
   - This is correct - existing users see the widget

3. **Loading State:**
   - Widget handles its own loading state internally via `useTranslationStatus` hook
   - Dashboard loading (`isLoading`) doesn't need to block widget

#### Acceptance Criteria:
- [ ] Widget does NOT appear in new user welcome state
- [ ] Widget appears for existing users with content
- [ ] Widget handles internal loading/error states

---

### Task 5: Build and Type Verification
**File:** N/A (Build process)
**Complexity:** Verification
**Estimated Time:** 5 minutes

#### Build Commands:
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run Next.js build
npm run build

# Or run dev server to verify
npm run dev
```

#### Expected Results:
- No TypeScript errors related to TranslationStatusWidget import
- No TypeScript errors related to widget props
- Build completes successfully
- Dev server starts without errors

#### Common Issues and Solutions:

| Issue | Solution |
|-------|----------|
| `Cannot find module '@/components/TranslationManagement'` | Verify REQ-350 is complete and exports widget |
| `Property 'propertyId' does not exist on type...` | Check widget props interface matches |
| `Property 'onViewDetails' does not exist...` | Check widget props interface matches |

#### Acceptance Criteria:
- [ ] `npx tsc --noEmit` passes without errors
- [ ] `npm run build` completes successfully
- [ ] No console errors on page load

---

## Complete Code Diff

### `/src/app/dashboard2/page.tsx`

```diff
 'use client';

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
+ * REQ-352: Added TranslationStatusWidget for translation visibility
  *
  * @route /dashboard2
  * @created 2026-01-06
- * @modified 2026-01-06 16:52:00 UTC
+ * @modified 2026-01-19 23:55:00 UTC
  */

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
 import { useDashboardStats } from '@/hooks/useDashboardStats';
 import { useDashboardTier } from '@/hooks/useDashboardTier';
 import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
 import { Property } from '@/types';
 import { GroupingOption } from '@/components/SimpleDashboard/PropertyGroupingControl';
 import { usePropertyContext } from '@/hooks/usePropertyContext';
+import { TranslationStatusWidget } from '@/components/TranslationManagement';

 export default function Dashboard2Page() {
   // ... (no changes to component body until JSX)

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

+          {/* REQ-352: Translation Status Widget - Translation visibility in dashboard */}
+          <TranslationStatusWidget
+            propertyId={selectedPropertyId || undefined}
+            onViewDetails={() => router.push('/dashboard2/translations')}
+          />

           {/* REQ-136: Advanced Dashboard Tools */}
           <AdvancedDashboardTools
```

---

## Manual Testing Checklist

### Test Case 1: Widget Renders Correctly
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard2` | Dashboard loads |
| 2 | Observe page layout | Widget appears below statistics cards |
| 3 | Check widget content | Shows progress bar, status counts |
| 4 | Inspect responsive layout | Widget full-width on all viewports |

### Test Case 2: Property Filtering
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select a property from header dropdown | Property selected |
| 2 | Observe widget | Stats update to show only selected property |
| 3 | Select "All Properties" | Stats update to show all properties |

### Test Case 3: View Details Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "View Details" link on widget | Navigates to `/dashboard2/translations` |
| 2 | Verify URL | URL is `/dashboard2/translations` |

### Test Case 4: New User State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create new account with no properties | Account created |
| 2 | Navigate to `/dashboard2` | Welcome state shows |
| 3 | Observe page | TranslationStatusWidget NOT visible |
| 4 | Only EmptyStateCard with "Add Your First Property" visible | ✓ |

### Test Case 5: Loading States
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hard refresh `/dashboard2` | Page reloads |
| 2 | Observe widget during load | Widget shows skeleton/loading state |
| 3 | After data loads | Widget shows populated data |

### Test Case 6: Error Handling
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate API failure (offline/network tab) | API fails |
| 2 | Observe widget | Error state with retry option |
| 3 | Dashboard remains functional | Other components still work |

---

## Acceptance Criteria Verification

From REQ-352 requirements:

| Criteria | Task | Verification |
|----------|------|--------------|
| TranslationStatusWidget imported and rendered | Task 2, 3 | Widget visible on dashboard |
| Widget in prominent location | Task 3 | Between stats and advanced tools |
| Fetches data on page load | Widget internal | Network shows API call |
| Data passed via props | Task 3 | `propertyId` prop passed |
| Loading state displays | Widget internal | Skeleton visible during load |
| Error state doesn't break dashboard | Widget internal | Dashboard still functional |
| Integrates with responsive layout | Task 3 | Inherits parent spacing |
| Maintains acceptable performance | Task 5 | No significant page load delay |
| Statistics refresh on actions | Widget internal | Realtime or manual refresh |
| Styling matches other cards | Widget internal (REQ-350) | Consistent visual design |

---

## Rollback Instructions

If issues arise, revert changes:

```bash
# Revert the single file change
git checkout HEAD -- src/app/dashboard2/page.tsx

# Or if committed, revert the commit
git revert HEAD
```

---

## Dependencies Graph

```
REQ-336 (Translation Status API)
    │
    ▼
REQ-350 (TranslationStatusWidget)
    │
    ▼
REQ-352 (Dashboard Integration) ◀── You are here
    │
    ▼
Translation Management Page (REQ-3XX)
```

---

## References

- **Overview Document:** `/docs/REQ-352-integrate-status-widget-into-dashboard-overview.md`
- **Requirements:** `/docs/gen_requests_epic5.md` (REQ-352)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Widget Spec:** `/docs/REQ-350-create-translationstatuswidget-component-overview.md`
- **Target File:** `/src/app/dashboard2/page.tsx`
- **Widget Component:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- **API Endpoint:** `/src/app/api/translations/status/route.ts`

---

## Implementation Summary

| Task | Description | File | Complexity |
|------|-------------|------|------------|
| 1 | Update file header comment | `page.tsx` | Trivial |
| 2 | Add TranslationStatusWidget import | `page.tsx` | Trivial |
| 3 | Add widget to JSX layout | `page.tsx` | Simple |
| 4 | Verify conditional rendering | `page.tsx` | Review |
| 5 | Build and type verification | Build | Verify |

**Total Estimated Time:** 15-20 minutes
**Total Story Points:** 1

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
