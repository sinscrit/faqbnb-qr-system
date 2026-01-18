# REQ-319: Integrate Translation Status Widget into Dashboard - Overview

**Generated:** 2026-01-18 19:30:00 UTC
**Last Modified:** 2026-01-18 19:30:00 UTC
**Request Reference:** docs/gen_requests_epic5.md - Request #319
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.4
**Size:** M (Medium)
**Priority:** P2 - Medium

---

## Summary

Integrate the TranslationStatusWidget component into the dashboard page (`/src/app/dashboard2/page.tsx`) to provide property owners with immediate visibility into translation coverage when they log in. The widget should display overall translation progress, counts by status, and provide a direct link to detailed translation management.

---

## Current State Analysis

### Dashboard Page Structure

The dashboard page (`/src/app/dashboard2/page.tsx`) currently includes:
- Welcome banner with user greeting
- `ProgressiveStatisticsSection` - displays item/room/tag counts with tier-aware rendering
- `AdvancedDashboardTools` - bulk operations toolbar (for multi-property users)
- `ActionButtons` - quick action buttons for creating items, etc.
- `PropertyEditModal` and `AddPropertyModal` - modals for property management

The page uses established patterns:
- `useDashboardStats` hook for fetching statistics data
- `usePropertyContext` for property filtering
- `useDashboardTier` for tier-aware UI rendering
- `useDashboardPreferences` for user preference overrides

### Component Import Pattern

Components are imported from the `@/components/SimpleDashboard` barrel export:
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
```

### Existing Widget Patterns

The `StatisticsCards` component (`/src/components/SimpleDashboard/StatisticsCards.tsx`) provides the pattern for dashboard summary cards:
- Card-based layout with icons, counts, and navigation links
- Loading skeleton state with shimmer animation
- Error state handling
- Empty state with CTA button
- Tier-aware rendering

---

## Dependencies

### Epic Dependencies (Must Be Complete First)

| Dependency | Source Epic | Status Required |
|------------|-------------|-----------------|
| Translation tables schema | Epic 1 (Foundation) | Required |
| `useTranslationStatus` hook | Epic 5 Task 2.6 | Required |
| `TranslationStatusWidget` component | Epic 5 Task 3.1 | Required |
| Translation status API endpoint | Epic 5 Task 1.1 | Required |

### Internal Dependencies (Same Epic)

| Dependency | Task ID | Description |
|------------|---------|-------------|
| REQ-316: TranslationStatusWidget | Task 3.1 | The widget component to integrate |
| REQ-314: useTranslationStatus hook | Task 2.6 | Data fetching hook for translation status |
| REQ-304: Translation Status API | Task 1.1 | `/api/translations/status` endpoint |

### Database Dependencies

The translation tables do **not yet exist** in the database. The following tables from Epic 1 are required:
- `article_translations`
- `item_translations`
- `link_translations`
- `translation_jobs`

---

## Technical Approach

### Integration Strategy

1. **Import the Widget**: Add `TranslationStatusWidget` to the imports from `@/components/TranslationManagement`
2. **Position in Layout**: Place widget in a prominent position after the `ProgressiveStatisticsSection`
3. **Data Fetching**: The widget uses `useTranslationStatus` hook internally to fetch data
4. **Property Context**: Pass `selectedPropertyId` from `usePropertyContext` for property-specific filtering
5. **Navigation Handler**: Implement `onViewDetails` callback to navigate to `/dashboard2/translations`

### Widget Placement Options

Based on the PRD specification: "Widget is positioned in a prominent location within the dashboard layout."

**Recommended Placement:** After `ProgressiveStatisticsSection`, before `AdvancedDashboardTools`:
```tsx
{/* REQ-136: Progressive Statistics Section */}
<ProgressiveStatisticsSection ... />

{/* REQ-319: Translation Status Widget */}
<TranslationStatusWidget
  propertyId={selectedPropertyId || undefined}
  onViewDetails={() => router.push('/dashboard2/translations')}
/>

{/* REQ-136: Advanced Dashboard Tools */}
<AdvancedDashboardTools ... />
```

### Conditional Rendering Considerations

The widget should:
1. **Not render for new users** (follow `isNewUser` pattern from dashboard)
2. **Show loading state** during initial data fetch
3. **Handle empty state** when no translatable content exists
4. **Display error state** if translation status API fails
5. **Update on property change** when user switches property context

### State Management

No new state management needed in the dashboard page. The `TranslationStatusWidget` component manages its own internal state via the `useTranslationStatus` hook.

However, the dashboard should pass:
- `propertyId?: string` - For property-specific filtering
- `onViewDetails: () => void` - Navigation callback

---

## Implementation Tasks

### Task 1: Add Widget Import (Required)

**File:** `/src/app/dashboard2/page.tsx`

Add import for the TranslationStatusWidget component:
```typescript
import { TranslationStatusWidget } from '@/components/TranslationManagement';
```

**Estimated Effort:** 5 minutes

### Task 2: Add Widget to Layout (Required)

**File:** `/src/app/dashboard2/page.tsx`

Insert the TranslationStatusWidget component after `ProgressiveStatisticsSection` and before `AdvancedDashboardTools`, within the conditional render block (not in `isNewUser` branch).

```tsx
{/* REQ-319: Translation Status Widget */}
{!isNewUser && (
  <TranslationStatusWidget
    propertyId={selectedPropertyId || undefined}
    onViewDetails={() => router.push('/dashboard2/translations')}
  />
)}
```

**Estimated Effort:** 15 minutes

### Task 3: Verify Navigation (Required)

Ensure the "View Details" link in the widget correctly navigates to `/dashboard2/translations`. This route must exist (created in Epic 5 Task 4.3).

**Estimated Effort:** 10 minutes

### Task 4: Test Integration (Required)

- Verify widget appears on dashboard for authenticated users
- Verify widget hides for new users (no content)
- Verify property filtering updates widget data
- Verify loading/error/empty states display correctly
- Verify responsive layout on mobile and desktop

**Estimated Effort:** 30 minutes

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes | Rationale |
|-----------|---------|-----------|
| `/src/app/dashboard2/page.tsx` | Add import, add TranslationStatusWidget component | Primary integration target |

### Functions/Components to Modify

| Component/Function | File | Changes |
|-------------------|------|---------|
| `Dashboard2Page` | `/src/app/dashboard2/page.tsx` | Add TranslationStatusWidget in JSX return |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/components/TranslationManagement/*` | Widget component created separately in Task 3.1 |
| `/src/hooks/useTranslationStatus.ts` | Hook created separately in Task 2.6 |
| `/src/app/api/translations/*` | API routes created separately in Phase 1 |
| `/src/components/SimpleDashboard/*` | Existing components, no changes needed |

---

## Acceptance Criteria Mapping

| PRD Acceptance Criteria | Implementation |
|------------------------|----------------|
| TranslationStatusWidget component is imported into the dashboard page file | Task 1: Add widget import |
| Widget is positioned in a prominent location within the dashboard layout | Task 2: Position after ProgressiveStatisticsSection |
| Dashboard fetches translation status summary data when the page loads | Widget handles internally via useTranslationStatus hook |
| Widget receives translation status data through props or context | Props: propertyId, onViewDetails callback |
| Widget displays loading state during initial data fetch | Widget component responsibility (Task 3.1) |
| Widget updates automatically if translation status changes while dashboard is visible | useTranslationRealtime hook (Task 2.7) integration in widget |
| Widget maintains responsive layout on tablet and desktop viewports | Widget component responsibility (Task 3.1) |
| Widget does not break dashboard layout when added to the page | Task 2: Proper positioning and spacing |
| Widget is keyboard accessible and integrates with dashboard navigation flow | Widget component responsibility (Task 3.1) |
| Widget only displays for authenticated users with appropriate permissions | Dashboard already handles auth; widget inherits |

---

## Testing Checklist

### Unit Tests
- [ ] Widget renders when translation data exists
- [ ] Widget shows loading skeleton during fetch
- [ ] Widget displays empty state when no translatable content
- [ ] Widget displays error state on API failure
- [ ] "View Details" link navigates to `/dashboard2/translations`

### Integration Tests
- [ ] Dashboard loads with widget visible
- [ ] Widget updates when property filter changes
- [ ] Widget displays correct counts from API
- [ ] No layout breaks on various screen sizes

### Manual Testing
- [ ] Login as user with translations - widget shows data
- [ ] Login as new user - widget hidden or shows empty state
- [ ] Switch property - widget data updates
- [ ] Click "View Details" - navigates correctly
- [ ] Mobile view - widget responsive and accessible

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1/3 dependencies not complete | High | High | Feature flag to hide widget until ready |
| Translation status API not available | High | High | Show graceful error state, retry option |
| Performance impact from extra API call | Low | Low | Widget fetches independently, doesn't block dashboard |
| Layout disruption on mobile | Low | Medium | Widget uses responsive patterns from StatisticsCards |

---

## Open Questions

1. **Feature Flag:** Should the widget be hidden behind a feature flag until Epic 1/3 are complete?
   - **Recommendation:** Yes, add conditional render based on feature flag or translation tables existence

2. **Real-time Updates:** Should the widget subscribe to real-time updates via `useTranslationRealtime`?
   - **Recommendation:** Yes, for optimal UX. Implemented in widget component (Task 3.1)

3. **Caching:** Should translation status be cached or always fetched fresh?
   - **Recommendation:** Use `useTranslationStatus` hook's built-in caching

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Definition: `/docs/gen_requests_epic5.md` - REQ-319
- Dashboard Pattern: `/src/app/dashboard2/page.tsx`
- Widget Pattern: `/src/components/SimpleDashboard/StatisticsCards.tsx`
- Hook Pattern: `/src/hooks/useDashboardStats.ts`
- Radix Dialog Pattern: `/src/components/SimpleDashboard/AddPropertyModal.tsx`

---

*Overview document for FAQBNB Localization Epic 5 - Task 3.4: Integrate Status Widget into Dashboard*
