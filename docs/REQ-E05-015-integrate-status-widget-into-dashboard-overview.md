# Implementation Overview: REQ-E05-015 - Dashboard Translation Status Widget Integration

**Document Created:** 2026-01-20 18:30 UTC
**Last Modified:** 2026-01-20 18:30 UTC
**Request ID:** REQ-E05-015 (corresponds to gen_requests_epic5.md #15: REQ-E05-016)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.4

---

## Request Summary

**Title:** Dashboard Translation Status Widget Integration

**Type:** ENHANCEMENT

**Size:** M (Medium)

**Description:** Property owners need the translation status widget integrated into their main dashboard view so they can monitor translation coverage immediately upon login without navigating to specialized translation management pages.

---

## Background & Context

### Current State
The dashboard at `/dashboard2/page.tsx` displays:
- Welcome banner with user greeting
- ProgressiveStatisticsSection (Items, Rooms, Tags counts)
- AdvancedDashboardTools (bulk operations, grouping controls)
- ActionButtons (create items CTA)
- PropertyEditModal and AddPropertyModal

No visibility into translation status exists on the main dashboard. Property owners must remember to navigate to separate translation pages to check translation completeness.

### Target State
The dashboard includes the `TranslationStatusWidget` component:
- Displays immediately upon dashboard load
- Shows overall translation progress with visual progress bar
- Displays status counts (complete, partial, pending, failed)
- Provides "View Details" link to full translation management page
- Updates in real-time as translation jobs complete
- Integrates seamlessly with existing dashboard layout and styling

### Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Foundation | Translation tables, job queue | Required | Database schema exists |
| REQ-E05-001 | Translation Status Query API | Required | `GET /api/translations/status` endpoint |
| REQ-E05-010 | useTranslationStatus hook | Required | Data fetching hook |
| REQ-E05-011 | useTranslationRealtime hook | Required | Real-time updates |
| REQ-E05-013 | TranslationStatusWidget component | Required | Widget to integrate |

---

## Technical Analysis

### Existing Dashboard Structure

**Reference:** `/src/app/dashboard2/page.tsx:1-245`

Current component hierarchy:
```tsx
<div className={mainSpacing}>
  {/* Success Message Banner */}
  {successMessage && ...}

  {/* New User Welcome State OR Main Dashboard */}
  {isNewUser && !isLoading ? (
    <EmptyStateCard ... />
  ) : (
    <>
      {/* Welcome Banner with Settings */}
      <div className="bg-gradient-to-r from-[#E61E4D]...">...</div>

      {/* Progressive Statistics Section */}
      <ProgressiveStatisticsSection ... />

      {/* Advanced Dashboard Tools */}
      <AdvancedDashboardTools ... />

      {/* Action Buttons */}
      <ActionButtons />
    </>
  )}

  {/* Modals */}
  <PropertyEditModal ... />
  <AddPropertyModal ... />
</div>
```

### Integration Point

The TranslationStatusWidget should be inserted **after** the ProgressiveStatisticsSection and **before** the AdvancedDashboardTools section:

```tsx
{/* Progressive Statistics Section */}
<ProgressiveStatisticsSection ... />

{/* NEW: Translation Status Widget */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || 'all'}
  className=""
  onViewDetails={() => router.push('/dashboard2/translations')}
/>

{/* Advanced Dashboard Tools */}
<AdvancedDashboardTools ... />
```

### Existing Patterns to Follow

#### 1. SimpleDashboard Component Imports
**Reference:** `/src/app/dashboard2/page.tsx:23-33`

```tsx
import {
  ActionButtons,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';
```

#### 2. PropertyContext Usage for Property ID
**Reference:** `/src/app/dashboard2/page.tsx:55`

```tsx
const { selectedPropertyId, setSelectedPropertyId } = usePropertyContext();
```

#### 3. Dashboard Stats Hook Pattern
**Reference:** `/src/app/dashboard2/page.tsx:58-60`

```tsx
const { stats, isLoading, error, refresh } = useDashboardStats(
  selectedPropertyId || undefined
);
```

#### 4. Router Navigation Pattern
**Reference:** `/src/app/dashboard2/page.tsx:83-85`

```tsx
const handleCreateItem = useCallback(() => {
  router.push('/dashboard2/create');
}, [router]);
```

### Color & Styling Guidelines

The dashboard uses Airbnb Design Language System:
- **Card Background:** `bg-white rounded-xl shadow-sm`
- **Spacing:** `space-y-6` or `space-y-8` based on tier
- **Grid:** `grid grid-cols-1 md:grid-cols-3 gap-4`
- **Primary Color:** `#FF385C` (Airbnb Red)
- **Secondary Color:** `#00A699` (Teal)
- **Text Colors:** `text-[#222222]` (primary), `text-[#717171]` (secondary)

---

## Implementation Details

### Component Import Statement

```typescript
// Add to existing imports at top of file
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

### Widget Integration Code

Insert the widget in the main render section:

```tsx
{/* REQ-E05-016: Translation Status Widget */}
{!isNewUser && !isLoading && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId || ''}
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}
```

### Conditional Rendering Logic

The widget should:
1. **Not render for new users** - They have no content to translate yet
2. **Not render during initial load** - Wait for dashboard data to load
3. **Render with selected property ID** - Scope translations to current property filter
4. **Handle "All Properties" state** - When `selectedPropertyId` is null

```tsx
// Determine if widget should render
const showTranslationWidget =
  !isNewUser &&
  !isLoading &&
  userProperties &&
  userProperties.length > 0;

// In render:
{showTranslationWidget && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId || ''}
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}
```

### Full Modified Dashboard Section

```tsx
{/* REQ-137: New User Welcome State */}
{isNewUser && !isLoading ? (
  <div className="bg-white rounded-xl shadow-sm">
    <EmptyStateCard
      icon={Home}
      title="Welcome to FAQBNB!"
      description="Get started by adding your first property..."
      actionLabel="Add Your First Property"
      onAction={handleAddProperty}
      variant="welcome"
    />
  </div>
) : (
  <>
    {/* Welcome Section with Settings */}
    <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
      <div className="absolute top-4 right-4">
        <DashboardSettingsPopover ... />
      </div>
      <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
      <p className="text-white/80 text-lg">Create and manage your QR code items</p>
    </div>

    {/* Progressive Statistics Section */}
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

    {/* REQ-E05-016: Translation Status Widget Integration */}
    {!isLoading && (
      <TranslationStatusWidget
        propertyId={selectedPropertyId || ''}
        onViewDetails={() => router.push('/dashboard2/translations')}
      />
    )}

    {/* Advanced Dashboard Tools */}
    <AdvancedDashboardTools
      selectedPropertyIds={selectedPropertyIds}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      onPrintSelected={handlePrintSelected}
      onGroupChange={handleGroupChange}
      currentGrouping={currentGrouping}
    />

    {/* Action Buttons */}
    <ActionButtons />
  </>
)}
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Function/Section | Change Description |
|-----------|------------------|-------------------|
| `/src/app/dashboard2/page.tsx` | Import statements | Add `TranslationStatusWidget` import from `@/components/TranslationManagement` |
| `/src/app/dashboard2/page.tsx` | Main render section | Insert `<TranslationStatusWidget>` between `ProgressiveStatisticsSection` and `AdvancedDashboardTools` |

### Files for Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Widget component implementation |
| `/src/components/TranslationManagement/index.ts` | Verify export exists |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Card styling patterns |
| `/src/hooks/usePropertyContext.ts` | Property context usage |
| `/src/hooks/useDashboardStats.ts` | Dashboard data fetching pattern |

### Prerequisite Components (Must Exist)

| Component | File Path | Status |
|-----------|-----------|--------|
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/` | Required (REQ-E05-013) |
| useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Required (REQ-E05-010) |
| useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Required (REQ-E05-011) |
| Translation Status API | `/src/app/api/translations/status/route.ts` | Required (REQ-E05-001) |

---

## Acceptance Criteria Validation

| Criteria | Implementation | Status |
|----------|---------------|--------|
| TranslationStatusWidget component is imported and rendered | Add import statement and JSX element | Planned |
| Widget displays in prominent position visible without scrolling on desktop | Placed after statistics section, above advanced tools | Planned |
| Widget receives propertyId from current user's active property context | Pass `selectedPropertyId` from `usePropertyContext()` | Planned |
| Dashboard fetches translation status data on initial page load | Widget internally uses `useTranslationStatus` hook | Planned |
| Widget displays loading skeleton during initial data fetch | Widget component handles loading state | Planned |
| Widget displays error state with retry option if status fetch fails | Widget component handles error state | Planned |
| Widget shows zero state when no content has been created yet | Widget component handles empty state | Planned |
| Widget updates automatically when translation jobs complete | Widget uses `useTranslationRealtime` hook | Planned |
| Widget placement maintains consistent positioning | Fixed placement in component hierarchy | Planned |
| Widget does not cause layout shift when loading/updating | Widget has fixed height structure | Planned |
| Widget is responsive and adapts layout for tablet viewports | Widget component handles responsive design | Planned |
| Widget is fully accessible with proper ARIA labels | Widget component includes accessibility | Planned |
| "View Details" link navigates to `/dashboard2/translations` | `onViewDetails` callback with router.push | Planned |
| Widget integrates with existing dashboard grid/card layout system | Uses same styling patterns as other cards | Planned |
| Widget maintains visual consistency with other dashboard widgets | Follows Airbnb DLS guidelines | Planned |
| Dashboard page performance remains acceptable | Lazy loading via suspense, efficient hooks | Planned |
| Widget handles missing or invalid property context gracefully | Fallback to empty string propertyId | Planned |
| Integration preserves existing dashboard functionality | No changes to existing components | Planned |

---

## Integration Checklist

### Pre-Integration Verification

Before integrating, verify these components exist:

- [ ] `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` exists
- [ ] `/src/components/TranslationManagement/index.ts` exports `TranslationStatusWidget`
- [ ] `/src/hooks/useTranslationStatus.ts` exists and is functional
- [ ] `/src/hooks/useTranslationRealtime.ts` exists and is functional
- [ ] `/src/app/api/translations/status/route.ts` exists and responds correctly

### Post-Integration Testing

After integration, verify:

- [ ] Dashboard loads without errors
- [ ] Widget appears in correct position (after statistics, before advanced tools)
- [ ] Widget shows loading state on initial render
- [ ] Widget displays translation data correctly
- [ ] "View Details" link navigates to `/dashboard2/translations`
- [ ] Widget updates when property filter changes
- [ ] New user state does NOT show the widget
- [ ] Mobile/tablet responsiveness works correctly

---

## Edge Cases & Error Handling

### Edge Case 1: No Properties Yet
**Condition:** User has no properties (`userProperties.length === 0`)
**Behavior:** Widget should not render (new user state shows instead)

### Edge Case 2: All Properties Selected
**Condition:** `selectedPropertyId` is null (showing all properties)
**Behavior:** Pass empty string to widget; widget should aggregate all properties

### Edge Case 3: Translation API Unavailable
**Condition:** API returns 500 or network error
**Behavior:** Widget shows error state with retry button

### Edge Case 4: Realtime Connection Lost
**Condition:** Supabase realtime disconnects
**Behavior:** Widget continues to show last known data, polls for updates

### Edge Case 5: No Content Created Yet
**Condition:** User has properties but no items/articles
**Behavior:** Widget shows empty state "No translations yet"

---

## Performance Considerations

1. **Lazy Loading:** The widget fetches data independently from dashboard stats, allowing parallel loading

2. **Caching:** The `useTranslationStatus` hook should cache results to prevent redundant API calls when switching between dashboard views

3. **Polling Control:** Auto-disable polling when no pending translation jobs exist to reduce unnecessary API calls

4. **Render Optimization:** Widget uses loading skeleton to prevent layout shifts during data fetching

5. **Bundle Size:** Widget component imports should be tree-shakeable; no additional dependencies required

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Verify prerequisite components exist | 0.25 hours |
| Add import statement | 0.1 hours |
| Add widget JSX with props | 0.25 hours |
| Add conditional rendering logic | 0.25 hours |
| Test integration | 0.5 hours |
| Test edge cases | 0.5 hours |
| **Total** | **1.85 hours** |

---

## Notes

1. **Component Prerequisites:** This integration task assumes REQ-E05-013 (TranslationStatusWidget), REQ-E05-010 (useTranslationStatus), and REQ-E05-011 (useTranslationRealtime) are already implemented. If not, stub implementations returning mock data should be used.

2. **Translations Page:** The widget links to `/dashboard2/translations` which may not exist yet (Phase 4 - REQ-E05-017). If the page doesn't exist, the link should still work and can display a "Coming Soon" or redirect until the page is implemented.

3. **Feature Flag (Optional):** Consider wrapping the widget in a feature flag for staged rollout:
   ```tsx
   {FEATURE_FLAGS.TRANSLATION_MANAGEMENT && (
     <TranslationStatusWidget ... />
   )}
   ```

4. **Dark Mode:** The widget implementation should already support dark mode via Tailwind's `dark:` prefixes if/when dark mode is added to the dashboard.

---

## References

- **Request:** REQ-E05-016 in `/docs/gen_requests_epic5.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 3.4)
- **Widget Component:** `/docs/REQ-E05-013-create-translationstatuswidget-component-overview.md`
- **useTranslationStatus Hook:** `/docs/REQ-E05-010-create-usetranslationstatus-hook-overview.md`
- **Dashboard Page:** `/src/app/dashboard2/page.tsx`
- **Dashboard Layout:** `/src/app/dashboard2/layout.tsx`
- **SimpleDashboard Components:** `/src/components/SimpleDashboard/`
