# Implementation Overview: Usage Statistics and User Reactions Integration

## Header
| Field | Value |
|-------|-------|
| Request Reference | #REQ-091 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-05 |
| Breakdown Created | 2026-01-05 00:20:55 CET |
| Implementation Completed | 2026-01-05 |
| T-shirt Size | M |
| Estimated Effort | 3-4 days (24-32 hours) |

## Goals

Integrate existing analytics and reactions data into the ItemManager component to surface engagement metrics for items:

1. **Extend Data Model**: Add optional `visitStats` and `reactionCounts` fields to `ItemRecordExtended` interface
2. **Display Metrics in Views**: Render view counts and reaction summaries in `ItemCard` (grid) and `ItemRow` (list) components
3. **Fetch Analytics Data**: Create a new hook (`useItemAnalytics`) to fetch and cache analytics data for items
4. **Back Office Integration**: Enable property managers to view item-level engagement metrics through the existing admin interfaces
5. **Visual Engagement Indicators**: Distinguish high-engagement items from low-engagement items visually

### Assumptions & Clarifications

- The existing database tables (`item_visits`, `item_reactions`) and API routes are functional and production-ready
- Analytics data should be fetched on-demand or lazily to avoid performance degradation for large item collections
- Real-time updates ("without requiring page refresh") can be achieved via polling or SWR-style revalidation; WebSockets are out of scope
- "Visual indicators" for engagement levels will use badge/chip styling similar to content type badges
- The admin authentication pattern from existing analytics routes will be reused
- Visit counts will be displayed as "X views" and reactions as emoji-based summaries (e.g., "5 likes, 2 loves")

## Implementation Plan

### Step 1: Extend Type Definitions

- **Description**: Add new interfaces for analytics data and extend `ItemRecordExtended` to include optional analytics fields
- **Rationale**: Type-first approach ensures all downstream components have proper typing support and enables IntelliSense
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Create `ItemVisitStats` interface matching `VisitAnalytics` structure
2. Create `ItemReactionSummary` interface matching `ReactionCounts` structure
3. Extend `ItemRecordExtended` with optional `visitStats?: ItemVisitStats` and `reactions?: ItemReactionSummary` fields
4. Export new types from barrel files

### Step 2: Create useItemAnalytics Hook

- **Description**: Build a custom hook to fetch, cache, and manage analytics data for items with support for batch fetching
- **Rationale**: Centralizes data fetching logic, enables caching to prevent redundant API calls, and provides a clean API for components
- **Estimated Effort**: M (6-8 hours)

**Sub-tasks:**
1. Create hook with state for loading, error, and cached analytics data
2. Implement single-item fetch using existing `/api/admin/items/[publicId]/analytics` endpoint
3. Implement single-item reactions fetch using existing `/api/items/[publicId]/reactions` endpoint
4. Add batch fetching capability for multiple items (reduce API calls)
5. Implement caching with configurable TTL (time-to-live)
6. Add manual refresh/invalidation methods
7. Support polling interval option for "without page refresh" requirement
8. Write unit tests

### Step 3: Create Analytics Display Components

- **Description**: Build reusable UI components for displaying visit counts and reaction summaries
- **Rationale**: Modular components ensure consistent styling across grid and list views; can be reused in preview modals
- **Estimated Effort**: M (4-6 hours)

**Sub-tasks:**
1. Create `VisitCountBadge` component showing "X views" with icon
2. Create `ReactionSummary` component showing reaction counts with emoji icons
3. Create `EngagementIndicator` component for high/medium/low engagement visual distinction
4. Apply Airbnb design system styling consistent with existing badges
5. Ensure accessibility with proper ARIA labels

### Step 4: Integrate Analytics into ItemCard

- **Description**: Extend `ItemCard` component to display view count and reaction summary
- **Rationale**: Grid view is the default view mode; users expect to see engagement at a glance
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Add optional `visitStats` and `reactions` props to `ItemCardProps`
2. Integrate `VisitCountBadge` in card footer area
3. Integrate `ReactionSummary` below title or in footer
4. Add `EngagementIndicator` overlay/badge for high-engagement items
5. Ensure loading states display gracefully when analytics are not yet loaded

### Step 5: Integrate Analytics into ItemRow

- **Description**: Extend `ItemRow` component to display view count and reaction summary in the list view
- **Rationale**: List view shows comprehensive metadata; analytics columns enhance information density
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Add optional `visitStats` and `reactions` props to `ItemRowProps`
2. Add new "Views" column after the Date column (hidden on mobile)
3. Add new "Reactions" column or inline display
4. Ensure column widths are responsive and don't break layout

### Step 6: Update ItemManager to Orchestrate Analytics Loading

- **Description**: Integrate `useItemAnalytics` hook into the main `ItemManager` component to provide analytics data to child components
- **Rationale**: ItemManager is the orchestrator; it should manage analytics loading and pass data to ItemCard/ItemRow
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Add `enableAnalytics` option to `ItemManagerConfig`
2. Integrate `useItemAnalytics` hook in ItemManager
3. Map analytics data to items when rendering ItemCard/ItemRow
4. Add loading state handling for analytics (skeleton or spinner)
5. Handle errors gracefully (show items without analytics if fetch fails)

### Step 7: Extend ItemPreviewModal for Detailed Analytics

- **Description**: Add detailed analytics section to the item preview modal
- **Rationale**: Users clicking into an item expect to see complete engagement data, not just summaries
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Add analytics section to preview modal content
2. Display time-based visit breakdown (24h, 7d, 30d, all-time)
3. Display reaction breakdown by type with visual bars/charts
4. Fetch fresh analytics when modal opens (ensure data is current)

### Step 8: Performance Optimization

- **Description**: Ensure analytics loading doesn't degrade performance for large item collections
- **Rationale**: Acceptance criteria requires acceptable performance with large collections
- **Estimated Effort**: S (2-3 hours)

**Sub-tasks:**
1. Implement virtualized/windowed loading of analytics (only fetch visible items)
2. Add request debouncing/throttling to prevent API flooding during rapid scrolling
3. Consider batch API endpoint if individual fetches become a bottleneck
4. Profile and optimize React renders (memoization where needed)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Type Definitions (Step 1)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/ItemManager.types.ts` | `ItemRecordExtended` interface (lines 203-219) | Modify |
| `src/components/ItemManager/ItemManager.types.ts` | New `ItemVisitStats` interface | Create (add near line 195) |
| `src/components/ItemManager/ItemManager.types.ts` | New `ItemReactionSummary` interface | Create (add near line 195) |
| `src/components/ItemManager/ItemManager.types.ts` | `ItemCardProps` interface (lines 420-447) | Modify |
| `src/components/ItemManager/ItemManager.types.ts` | `ItemRowProps` interface (lines 459-488) | Modify |
| `src/components/ItemManager/ItemManager.types.ts` | `ItemManagerConfig` interface (lines 23-94) | Modify |
| `src/components/ItemManager/index.ts` | Export new types | Modify |

### Hook Implementation (Step 2)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/hooks/useItemAnalytics.ts` | — | Create |
| `src/components/ItemManager/hooks/__tests__/useItemAnalytics.test.ts` | — | Create |
| `src/components/ItemManager/hooks/index.ts` | Export `useItemAnalytics` | Modify |

### Display Components (Step 3)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/shared/VisitCountBadge.tsx` | — | Create |
| `src/components/ItemManager/components/shared/ReactionSummary.tsx` | — | Create |
| `src/components/ItemManager/components/shared/EngagementIndicator.tsx` | — | Create |
| `src/components/ItemManager/components/shared/index.ts` | Export new components | Modify |

### ItemCard Integration (Step 4)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemCard.tsx` | Component JSX and props | Modify |

### ItemRow Integration (Step 5)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemRow.tsx` | Component JSX and props | Modify |

### ItemManager Orchestration (Step 6)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/ItemManager.tsx` | Component implementation | Modify |

### Preview Modal Extension (Step 7)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Modal content section | Modify |
| `src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx` | — | Create |
| `src/components/ItemManager/components/ItemPreview/index.ts` | Export new component | Modify |

### Existing API Routes (Reference Only - No Modifications)

| File | Purpose | Type |
|------|---------|------|
| `src/app/api/visits/route.ts` | Visit tracking (POST) | Reference |
| `src/app/api/reactions/route.ts` | Reaction submission (POST/DELETE) | Reference |
| `src/app/api/items/[publicId]/reactions/route.ts` | Get reactions for item (GET) | Reference |
| `src/app/api/admin/items/[publicId]/analytics/route.ts` | Get visit analytics (GET, admin) | Reference |
| `src/app/api/admin/analytics/reactions/route.ts` | Aggregate reaction analytics (GET, admin) | Reference |

### Existing Type Definitions (Reference Only)

| File | Types | Type |
|------|-------|------|
| `src/types/reactions.ts` | `ReactionType`, `ReactionCounts`, `ReactionResponse` | Reference |
| `src/types/analytics.ts` | `VisitAnalytics`, `AnalyticsResponse`, `SystemAnalyticsResponse` | Reference |

## Dependencies

### Internal Dependencies

- None identified. This feature extends existing components without blocking or being blocked by other features.

### External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Supabase `item_visits` table | Source for visit data | Exists |
| Supabase `item_reactions` table | Source for reaction data | Exists |
| `/api/items/[publicId]/reactions` route | Fetch reaction counts | Exists |
| `/api/admin/items/[publicId]/analytics` route | Fetch visit analytics | Exists |
| Supabase Auth | Admin authentication for analytics endpoints | Exists |

## Risks and Considerations

### Potential Side Effects

1. **Increased API Load**: Fetching analytics for each item could significantly increase API requests. Mitigate with:
   - Batch fetching
   - Aggressive caching
   - Lazy loading (only visible items)
   - Consider a new batch endpoint if needed

2. **Component Re-renders**: Adding analytics data to items may cause unnecessary re-renders. Mitigate with:
   - Memoization of analytics components
   - Separate analytics state from item state
   - Use React.memo for ItemCard/ItemRow

3. **Layout Shifts**: Adding new columns/badges may cause layout issues on smaller screens. Mitigate with:
   - Hide analytics on mobile
   - Use responsive column widths
   - Test across viewport sizes

### Testing Requirements

- [ ] Unit tests for `useItemAnalytics` hook (fetch, cache, polling, error handling)
- [ ] Unit tests for display components (VisitCountBadge, ReactionSummary, EngagementIndicator)
- [ ] Integration tests for ItemCard with analytics props
- [ ] Integration tests for ItemRow with analytics props
- [ ] Performance tests with 100+ items to ensure acceptable load times
- [ ] Accessibility audit for new components (ARIA labels, color contrast)

### Open Questions

- [ ] **Batch Endpoint**: Should we create a new API endpoint that fetches analytics for multiple items in one request? This would significantly reduce API calls.
- [ ] **Polling Interval**: What is an acceptable polling interval for "without page refresh" updates? 30 seconds? 60 seconds?
- [ ] **Engagement Thresholds**: What view/reaction counts define "high", "medium", and "low" engagement? Should this be configurable?
- [ ] **Admin vs User Access**: Should non-admin users (property managers) be able to see their own item analytics? Current `/api/admin/items/[publicId]/analytics` requires admin role.
- [ ] **Caching Strategy**: Should analytics be cached in localStorage/sessionStorage for persistence across page reloads?

## Out of Scope

Per the original request, the following are explicitly out of scope:

1. **WebSocket/Real-time Updates**: Polling-based refresh is acceptable; no WebSocket implementation
2. **New Analytics Collection**: This feature surfaces existing data; no new tracking mechanisms
3. **Analytics Dashboard**: The feature adds item-level metrics to ItemManager; a dedicated analytics dashboard is separate work
4. **Historical Trend Charts**: Time-series visualizations beyond the time-based breakdown (24h, 7d, 30d) are not included
5. **Export/Download of Analytics**: No CSV/Excel export functionality for analytics data
6. **Notification System**: No alerts or notifications for engagement milestones
7. **A/B Testing Integration**: No integration with experimentation platforms

---
*Document generated: 2026-01-05 00:20:55 CET*
