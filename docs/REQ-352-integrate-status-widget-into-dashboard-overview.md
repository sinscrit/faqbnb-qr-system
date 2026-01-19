# REQ-352: Integrate Translation Status Widget into Dashboard Layout - Implementation Overview

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19 23:45:00 UTC
**Request ID:** REQ-352
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.4

---

## Summary

Integrate the TranslationStatusWidget component into the main dashboard page (`/src/app/dashboard2/page.tsx`) so property owners can see their translation status summary automatically when viewing their dashboard. The widget should fetch translation status data on page load and display translation coverage metrics in a visually consistent manner with other dashboard elements.

---

## Dependencies

### Epic Dependencies
| Dependency | Description | Status |
|------------|-------------|--------|
| Epic 1 (Foundation) | Translation tables, job queue, translation service | Required |
| Epic 3 (Dynamic Content Translation) | Translation trigger system, status tracking | Required |
| REQ-336 | Translation Status API endpoint (`/api/translations/status`) | Required (Phase 1) |
| REQ-350 | TranslationStatusWidget component | Required (Phase 3, Task 3.1) |

### Technical Dependencies
| Dependency | Location | Purpose |
|------------|----------|---------|
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Widget component to integrate |
| Translation Status API | `/src/app/api/translations/status/route.ts` | Provides translation summary data |
| Dashboard page | `/src/app/dashboard2/page.tsx` | Target file for integration |
| PropertyContext | `/src/hooks/usePropertyContext.ts` | Property filtering for widget |

---

## Technical Context

### Target File Analysis

**File:** `/src/app/dashboard2/page.tsx`

The dashboard page currently includes:
- Welcome banner section (gradient header with user name)
- Success message banner (conditional)
- New user welcome state / empty state handling
- `ProgressiveStatisticsSection` component (Stats cards: Items, Rooms, Tags)
- `AdvancedDashboardTools` component (for multi-property users)
- `ActionButtons` component (quick actions)
- `PropertyEditModal` and `AddPropertyModal` dialogs

**Current Imports:**
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

### Existing Patterns to Follow

1. **Property Filtering Pattern:**
   - The page uses `usePropertyContext` to get `selectedPropertyId`
   - This ID is passed to `useDashboardStats` for filtering
   - Widget should receive the same `selectedPropertyId` for consistent filtering

2. **Component Layout Pattern:**
   - Components are rendered in vertical stacks with `space-y-6` or `space-y-8` spacing
   - Each section is rendered conditionally based on tier/state
   - Error/loading states are handled at component level

3. **Data Refresh Pattern:**
   - `useDashboardStats` provides a `refresh()` function
   - Widget should optionally expose refresh callback for consistency

### Widget Placement Decision

Based on the dashboard layout analysis, the TranslationStatusWidget should be placed:
- **After** the `ProgressiveStatisticsSection` (items/rooms/tags stats)
- **Before** the `AdvancedDashboardTools` section
- **Within** the main content area (not in the new user welcome state)

This placement ensures:
- Translation status is visible alongside other key metrics
- Widget doesn't interfere with the onboarding flow for new users
- Natural reading order from overview stats to detailed status

---

## Implementation Tasks

### Task 1: Import TranslationStatusWidget Component
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** ~21-39 (imports section)

Add import statement for the TranslationStatusWidget:

```typescript
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

**Acceptance Criteria:**
- [ ] Import statement added to imports section
- [ ] No TypeScript errors from import

---

### Task 2: Add TranslationStatusWidget to Dashboard Layout
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** ~198-222 (after ProgressiveStatisticsSection, before AdvancedDashboardTools)

Add the widget component with proper property filtering:

```typescript
{/* REQ-352: Translation Status Widget */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}
  onViewDetails={() => router.push('/dashboard2/translations')}
  className="mt-6"
/>
```

**Placement in JSX:**
```tsx
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

{/* REQ-352: Translation Status Widget */}
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

**Acceptance Criteria:**
- [ ] Widget renders below statistics cards
- [ ] Widget receives `propertyId` from property context
- [ ] `onViewDetails` navigates to `/dashboard2/translations`
- [ ] Widget inherits vertical spacing from parent layout

---

### Task 3: Handle Conditional Rendering
**File:** `/src/app/dashboard2/page.tsx`

Ensure the widget only renders when:
1. User is NOT in the new user welcome state
2. Content exists (not during initial load with no data)

The current structure already handles this with the `isNewUser` conditional:
```tsx
{isNewUser && !isLoading ? (
  // New user welcome state - NO widget here
) : (
  <>
    // Existing dashboard components
    // Widget should be HERE
  </>
)}
```

**Acceptance Criteria:**
- [ ] Widget does NOT render for brand new users with no properties
- [ ] Widget renders for existing users with content
- [ ] Widget handles its own loading/error states internally

---

### Task 4: Add REQ Reference Comment
**File:** `/src/app/dashboard2/page.tsx`
**Lines:** ~1-19 (file header comment)

Update file header to include REQ-352:

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
 * REQ-352: Added TranslationStatusWidget for translation visibility
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-19 23:45:00 UTC
 */
```

**Acceptance Criteria:**
- [ ] REQ-352 reference added to file header
- [ ] Last modified date updated

---

### Task 5: Verify Integration Behavior
**Verification Steps:**

1. **Load Test:**
   - Navigate to `/dashboard2`
   - Verify widget appears below statistics cards
   - Verify no layout breaking

2. **Property Filter Test:**
   - Select a specific property from dropdown
   - Verify widget updates to show filtered stats

3. **Navigation Test:**
   - Click "View Details" link on widget
   - Verify navigation to `/dashboard2/translations`

4. **New User Test:**
   - As a user with no properties
   - Verify widget does NOT appear
   - Verify welcome state still renders correctly

**Acceptance Criteria:**
- [ ] Widget integrates without breaking existing layout
- [ ] Property filtering works consistently with other components
- [ ] Navigation to translation management page works
- [ ] New user flow unaffected

---

## Authorized Files and Functions for Modification

### Files to Modify
| File Path | Section | Modification |
|-----------|---------|--------------|
| `/src/app/dashboard2/page.tsx` | Imports (lines ~21-39) | Add `TranslationStatusWidget` import |
| `/src/app/dashboard2/page.tsx` | Header comment (lines ~1-19) | Add REQ-352 reference, update modified date |
| `/src/app/dashboard2/page.tsx` | JSX (lines ~198-222) | Add `<TranslationStatusWidget>` component |

### Functions/Hooks Used (Read-Only Context)
| Hook/Function | Usage |
|---------------|-------|
| `usePropertyContext` | Get `selectedPropertyId` for filtering |
| `router.push()` | Navigate to translation management page |

### Dependencies Required (Must Exist)
| Component/Module | Location | Task |
|------------------|----------|------|
| `TranslationStatusWidget` | `/src/components/TranslationManagement/TranslationStatusWidget/` | REQ-350 |
| TranslationManagement exports | `/src/components/TranslationManagement/index.ts` | REQ-350 |
| Translation Status API | `/src/app/api/translations/status/route.ts` | REQ-336 |

---

## Code Changes Summary

### Final Code Changes

**Import Addition:**
```typescript
// Add to existing imports
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

**JSX Addition (after ProgressiveStatisticsSection):**
```tsx
{/* REQ-352: Translation Status Widget - Translation visibility in dashboard */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}
  onViewDetails={() => router.push('/dashboard2/translations')}
/>
```

---

## UI Specifications

### Widget Placement Visual
```
┌───────────────────────────────────────────────────────────────────┐
│  Welcome back, [User]!                                    ⚙️     │
│  Create and manage your QR code items                             │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  📦 12          │ │  🏠 5           │ │  🏷️ 8          │
│  Items      →   │ │  Rooms      →   │ │  Tags       →   │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 🌐 Translation Status                                     [↻]     │
├───────────────────────────────────────────────────────────────────┤
│ Translation Progress                                        75%   │
│ ████████████████████████████████░░░░░░░░░░░                      │
├───────────────────────────────────────────────────────────────────┤
│  ✓ 45 Complete    ◐ 12 Partial    ⏳ 8 Pending    ❌ 3 Failed    │
├───────────────────────────────────────────────────────────────────┤
│                                              View Details →       │
└───────────────────────────────────────────────────────────────────┘

[Advanced Dashboard Tools section - for multi-property users]

[Action Buttons: New Item, Manage Items, etc.]
```

### Responsive Behavior
- Widget should be full-width on all screen sizes
- Internal layout handled by TranslationStatusWidget component
- Consistent spacing with `space-y-6` or `space-y-8` parent container

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationStatusWidget not ready (REQ-350) | High | High | Verify component exists before integration; implement feature flag if needed |
| Translation Status API not ready (REQ-336) | High | High | Widget handles loading/error states internally |
| Layout disruption on mobile | Low | Medium | Widget uses responsive design; test on multiple viewports |
| Performance impact from additional API call | Low | Low | Widget manages its own data fetching; no duplicate calls |

---

## Testing Requirements

### Manual Testing
- [ ] Widget appears below statistics cards on dashboard
- [ ] Widget shows correct translation status summary
- [ ] Property filter affects widget data when property selected
- [ ] "View Details" navigates to `/dashboard2/translations`
- [ ] Widget not shown for new users (no properties/items)
- [ ] Loading state displays appropriately on initial load
- [ ] Error state displays with retry if API fails
- [ ] Dashboard maintains acceptable performance with widget

### Automated Testing (Future)
- [ ] Integration test: widget renders in dashboard context
- [ ] E2E test: full user flow from dashboard to translation management

---

## Acceptance Criteria Checklist

From REQ-352:
- [ ] TranslationStatusWidget component is imported and rendered within the dashboard page layout
- [ ] Widget appears in a visually prominent location within the dashboard that does not obscure other critical dashboard information
- [ ] Dashboard fetches translation status summary data on page load using the appropriate API endpoint or database query
- [ ] Fetched data is passed to the TranslationStatusWidget component through props
- [ ] Loading state displays appropriately while translation statistics are being fetched on initial dashboard load
- [ ] Error state displays appropriately if translation statistics cannot be loaded, without breaking the entire dashboard
- [ ] Widget integrates seamlessly with the existing dashboard layout responsive grid or flex structure
- [ ] Dashboard page maintains acceptable performance with the added translation status query
- [ ] Translation statistics refresh appropriately when the owner performs actions that affect translation status
- [ ] Widget positioning and styling match the visual design of other dashboard summary cards

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-352)
- **Widget Component Spec:** `/docs/REQ-350-create-translationstatuswidget-component-overview.md`
- **Target File:** `/src/app/dashboard2/page.tsx`
- **Pattern Reference:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

---

## Implementation Notes

1. **Dependency Order:** This task (REQ-352) requires REQ-350 (TranslationStatusWidget) and REQ-336 (Translation Status API) to be completed first. If these are not ready, consider:
   - Adding a feature flag to conditionally render the widget
   - Using mock data for development testing
   - Implementing a stub widget that shows "Coming Soon" state

2. **Property Context:** The `selectedPropertyId` comes from `usePropertyContext`, which is already used by the dashboard. The widget should receive this value to maintain consistency with the filtered statistics view.

3. **Navigation Handling:** The `onViewDetails` callback uses `router.push()` to navigate to the translations management page. Ensure `/dashboard2/translations` route exists (REQ-356 or similar).

4. **File Header Convention:** The project maintains REQ references in file header comments. Follow the existing pattern when adding REQ-352.
