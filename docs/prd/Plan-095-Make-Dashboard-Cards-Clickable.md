# Implementation Plan: Make Dashboard Cards Clickable

**Generated:** 2026-01-11 20:15:00 UTC
**Last Modified:** 2026-01-11 20:15:00 UTC
**Plan Number:** 095
**PRD Source:** `/docs/prd/intake/prd-make-dashboard-cards-clickable-20260111-200139.md`

---

## Overview

This plan implements clickable navigation for dashboard statistics cards, allowing users to click on Items, Rooms, or Tags counts to navigate directly to filtered list views. This is a standard dashboard UX pattern that enables drill-down functionality from summary statistics.

### Key Changes:
1. Make StatisticsCards clickable with navigation to corresponding list pages
2. Items card navigates to existing `/dashboard2/items` page
3. Rooms card navigates to `/dashboard2/items?filter=room` (filtered view)
4. Tags card navigates to `/dashboard2/items?filter=tag` (filtered view)

### Implementation Strategy:
Since dedicated Rooms and Tags pages do not currently exist, we will leverage the existing Items page with filter parameters. The ItemManager already supports filtering by tags and can be extended for room filtering. This approach provides immediate value without requiring new pages.

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **State Management:** Custom hooks (useReducer pattern)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Relevant Existing Patterns:**
  - `/src/components/SimpleDashboard/StatisticsCards.tsx` - Target component for modification
  - `/src/app/dashboard2/items/page.tsx` - Existing items list page
  - `/src/components/ItemManager/` - Item list management with filtering support
  - `/src/hooks/useDashboardStats.ts` - Statistics data hook

### Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `StatisticsCards.tsx` | MODIFY | Add click handlers and navigation to stat cards |
| `ProgressiveStatisticsSection.tsx` | MODIFY | Pass navigation callbacks to StatisticsCards |
| `dashboard2/page.tsx` | MODIFY | Wire up card click handlers with router navigation |
| `dashboard2/items/page.tsx` | MODIFY | Handle filter query params for rooms/tags views |
| `ItemManager/ItemManager.tsx` | MODIFY | Support room grouping filter mode |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | N/A | N/A | All requirements achievable with existing Next.js router |

---

## Architecture

### Component Hierarchy

```
dashboard2/page.tsx
└── ProgressiveStatisticsSection
    └── StatisticsCards
        ├── StatCard (Items) → onClick → /dashboard2/items
        ├── StatCard (Rooms) → onClick → /dashboard2/items?filter=room
        └── StatCard (Tags) → onClick → /dashboard2/items?filter=tag
```

### Navigation Flow

```
User clicks "3 Items" card
         │
         ▼
StatCard onClick handler fires
         │
         ▼
onCardClick callback called with 'items'
         │
         ▼
router.push('/dashboard2/items')
         │
         ▼
Items page renders with full item list
```

```
User clicks "2 Tags" card
         │
         ▼
StatCard onClick handler fires
         │
         ▼
onCardClick callback called with 'tags'
         │
         ▼
router.push('/dashboard2/items?filter=tag')
         │
         ▼
Items page renders with tag grouping/filter active
```

### State Management

No new state is required. Navigation is handled via Next.js router and URL query parameters.

### Data Flow

```
URL Query Param → ItemsPage → ItemManager (filter prop) → Filtered Display
```

---

## Integration Contract

### StatisticsCards Props Interface (Updated)

```typescript
// src/components/SimpleDashboard/StatisticsCards.tsx

export interface StatisticsCardsProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Loading state - shows skeleton when true */
  isLoading: boolean;
  /** Optional error message */
  error?: string | null;
  /** REQ-136: Optional tier for tier-aware display */
  tier?: DashboardTier;
  /** REQ-136: Optional flag to show comparison view */
  showComparisonView?: boolean;
  /** REQ-136: Optional flag to show trend indicators */
  showTrendIndicators?: boolean;
  /** REQ-137: Callback for empty state CTA */
  onCreateItem?: () => void;
  /** NEW: Callback when a stat card is clicked */
  onCardClick?: (cardType: 'items' | 'rooms' | 'tags') => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

### StatCard Sub-component Props (Updated)

```typescript
interface StatCardProps {
  /** Card configuration */
  config: StatCardConfig;
  /** Numeric value to display */
  value: number;
  /** NEW: Click handler for navigation */
  onClick?: () => void;
}
```

### Items Page Filter Interface

```typescript
// URL: /dashboard2/items?filter=room|tag

interface ItemsPageSearchParams {
  filter?: 'room' | 'tag';
}
```

### Usage Example

```tsx
// In dashboard2/page.tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleCardClick = (cardType: 'items' | 'rooms' | 'tags') => {
  switch (cardType) {
    case 'items':
      router.push('/dashboard2/items');
      break;
    case 'rooms':
      router.push('/dashboard2/items?filter=room');
      break;
    case 'tags':
      router.push('/dashboard2/items?filter=tag');
      break;
  }
};

<ProgressiveStatisticsSection
  stats={stats}
  isLoading={isLoading}
  error={error}
  onCardClick={handleCardClick}
  onCreateItem={handleCreateItem}
/>
```

---

## Implementation Approach

### Phase 1: Make StatCards Clickable (0.5 day)

#### Task 1.1: Update StatCard Component
- [ ] Add `onClick` prop to StatCardProps interface
- [ ] Add cursor-pointer and hover styles to clickable cards
- [ ] Add focus-visible styles for keyboard navigation
- [ ] Add appropriate ARIA attributes (role="button", aria-label)
- [ ] Wrap card content in clickable element (button or Link)

**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

```typescript
// Updated StatCard component
function StatCard({ config, value, onClick }: StatCardProps) {
  const Icon = config.icon;

  const cardContent = (
    <>
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
      </div>

      {/* Value and Label */}
      <div>
        <p className="text-[32px] font-bold text-[#222222] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[#717171]">
          {config.label}
        </p>
      </div>
    </>
  );

  // If clickable, render as button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 w-full text-left
                   cursor-pointer transition-all duration-200
                   hover:shadow-md hover:scale-[1.02]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2
                   active:scale-[0.98]"
        aria-label={`View ${config.label}: ${value} ${config.label.toLowerCase()}`}
      >
        {cardContent}
      </button>
    );
  }

  // Non-clickable version (for empty states or loading)
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
      role="group"
      aria-label={`${config.label}: ${value}`}
    >
      {cardContent}
    </div>
  );
}
```

#### Task 1.2: Add onCardClick Prop to StatisticsCards
- [ ] Add `onCardClick` prop to StatisticsCardsProps
- [ ] Pass onClick handler to each StatCard with appropriate card type
- [ ] Maintain backward compatibility (cards still work without onClick)

**Code Changes:**

```typescript
// In StatisticsCards function component
export function StatisticsCards({
  stats,
  isLoading,
  error,
  tier,
  showComparisonView,
  showTrendIndicators,
  onCreateItem,
  onCardClick,  // NEW
  className = ''
}: StatisticsCardsProps) {
  // ... existing code ...

  return (
    <div className={className}>
      {/* ... property context ... */}

      {/* Statistics cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cardConfigs.map((config) => (
          <StatCard
            key={config.key}
            config={config}
            value={stats?.[config.key] ?? 0}
            onClick={onCardClick ? () => onCardClick(config.key as 'items' | 'rooms' | 'tags') : undefined}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Task 1.3: Update Card Config Keys
- [ ] Ensure cardConfigs use consistent keys that map to navigation types
- [ ] Rename keys if needed: `itemCount` -> `items`, `roomCount` -> `rooms`, `tagCount` -> `tags`

**Note:** The current keys (`itemCount`, `roomCount`, `tagCount`) need to be mapped:

```typescript
// Map stat keys to navigation types
const keyToNavType: Record<NumericStatKey, 'items' | 'rooms' | 'tags'> = {
  itemCount: 'items',
  roomCount: 'rooms',
  tagCount: 'tags',
};

// In StatCard rendering:
onClick={onCardClick ? () => onCardClick(keyToNavType[config.key]) : undefined}
```

**Deliverables:**
- StatCard component with optional click handling
- Hover and focus styles for interactive state
- Keyboard accessible cards

---

### Phase 2: Wire Up Navigation (0.5 day)

#### Task 2.1: Update ProgressiveStatisticsSection
- [ ] Add `onCardClick` prop to ProgressiveStatisticsSectionProps
- [ ] Pass `onCardClick` through to StatisticsCards

**File:** `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`

```typescript
export interface ProgressiveStatisticsSectionProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Loading state - shows skeleton when true */
  isLoading: boolean;
  /** Optional error message */
  error?: string | null;
  /** Optional tier overrides for user preferences */
  overrides?: DashboardTierOverrides;
  /** REQ-137: Callback for empty state CTA */
  onCreateItem?: () => void;
  /** NEW: Callback when a stat card is clicked */
  onCardClick?: (cardType: 'items' | 'rooms' | 'tags') => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

#### Task 2.2: Update Dashboard Page with Navigation Handlers
- [ ] Import useRouter from next/navigation
- [ ] Create handleCardClick function with routing logic
- [ ] Pass handler to ProgressiveStatisticsSection

**File:** `/src/app/dashboard2/page.tsx`

```typescript
// Add to Dashboard2Page component
const handleCardClick = useCallback((cardType: 'items' | 'rooms' | 'tags') => {
  switch (cardType) {
    case 'items':
      router.push('/dashboard2/items');
      break;
    case 'rooms':
      router.push('/dashboard2/items?filter=room');
      break;
    case 'tags':
      router.push('/dashboard2/items?filter=tag');
      break;
  }
}, [router]);

// In JSX
<ProgressiveStatisticsSection
  stats={stats}
  isLoading={isLoading}
  error={error}
  overrides={{
    forceAdvancedTools: preferences.forceAdvancedTools,
    forcePortfolioView: preferences.forcePortfolioView,
  }}
  onCreateItem={handleCreateItem}
  onCardClick={handleCardClick}
/>
```

#### Task 2.3: Update SimpleDashboard Index Exports
- [ ] Ensure new prop types are exported from index.ts

**Deliverables:**
- Working navigation from dashboard cards
- URL-based filter routing

---

### Phase 3: Handle Filter on Items Page (1 day)

#### Task 3.1: Parse Filter Query Parameter
- [ ] Read `filter` search param from URL
- [ ] Pass filter mode to ItemManager component

**File:** `/src/app/dashboard2/items/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
// ... other imports

export default function ItemsPage() {
  const searchParams = useSearchParams();
  const filterMode = searchParams.get('filter') as 'room' | 'tag' | null;

  // ... existing code ...

  return (
    <div>
      {/* Header - Show filter context */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filterMode === 'room' ? 'Items by Room' :
             filterMode === 'tag' ? 'Items by Tag' :
             'My Items'}
          </h1>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} total
            {filterMode && ` (grouped by ${filterMode})`}
          </p>
        </div>
        {/* ... existing buttons ... */}
      </div>

      {/* Clear filter link when filtered */}
      {filterMode && (
        <div className="mb-4">
          <button
            onClick={() => router.push('/dashboard2/items')}
            className="text-sm text-[#FF385C] hover:underline"
          >
            Clear filter - Show all items
          </button>
        </div>
      )}

      {/* ItemManager Component with filter mode */}
      <ItemManager
        items={items}
        loading={loading}
        error={error}
        onEditItem={handleEditItem}
        onDeleteItems={handleDeleteItems}
        onUpdateItem={handleUpdateItem}
        onDuplicateItem={handleDuplicateItem}
        config={{
          defaultViewMode: 'grid',
          enableSearch: true,
          enableFilters: true,
          enableBulkActions: true,
          enableQRPreview: true,
          defaultGroupBy: filterMode || undefined,  // NEW: Pass filter mode
        }}
      />
    </div>
  );
}
```

#### Task 3.2: Update ItemManager to Support Default Grouping
- [ ] Add `defaultGroupBy` to ItemManager config
- [ ] Initialize grouping state from config prop
- [ ] Show appropriate grouping UI when active

**File:** `/src/components/ItemManager/ItemManager.types.ts`

```typescript
export interface ItemManagerConfig {
  // ... existing props ...
  /** Default grouping mode ('room' | 'tag' | undefined) */
  defaultGroupBy?: 'room' | 'tag';
}
```

#### Task 3.3: Implement Room/Tag Grouping View
- [ ] Group items by room location when `defaultGroupBy: 'room'`
- [ ] Group items by tags when `defaultGroupBy: 'tag'`
- [ ] Display grouped sections with headers

**Note:** ItemManager already has tag filtering via `FilterPanel`. For room grouping, we may need to:
1. Use existing LocationFilter if available
2. Or group items by their room/location property and display in sections

**Alternative Approach:** If full grouping is complex, implement as a filter that highlights the grouping dimension:
- Room filter: Show items with room filter pre-selected
- Tag filter: Show tag filter panel expanded

**Deliverables:**
- Items page responds to filter query param
- Grouped/filtered view displays appropriately
- Clear filter option available

---

### Phase 4: Testing & Polish (0.5 day)

#### Task 4.1: Manual Testing
- [ ] Test clicking each card navigates correctly
- [ ] Test filter parameter is parsed correctly on Items page
- [ ] Test "Clear filter" returns to unfiltered view
- [ ] Test keyboard navigation (Tab to card, Enter to activate)
- [ ] Test on mobile viewport

#### Task 4.2: Accessibility Verification
- [ ] Verify cards have appropriate ARIA labels
- [ ] Verify focus states are visible
- [ ] Test with screen reader

#### Task 4.3: Update File Headers
- [ ] Add `@lastModified` to StatisticsCards.tsx
- [ ] Add `@lastModified` to ProgressiveStatisticsSection.tsx
- [ ] Add `@lastModified` to dashboard2/page.tsx
- [ ] Add `@lastModified` to items/page.tsx

**Deliverables:**
- Verified working implementation
- Accessible navigation
- Updated file documentation

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Reuse Items page with filters | Query params | Avoids creating new pages; leverages existing ItemManager |
| Button element for cards | `<button>` | Semantically correct for clickable elements; better accessibility |
| Hover scale effect | scale-[1.02] | Consistent with existing ActionButtons pattern |
| Focus ring style | ring-[#222222] | Matches existing focus styling in codebase |
| Filter via URL params | searchParams | Enables deep linking, shareable URLs, browser history |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemManager doesn't support room grouping | Medium | Medium | Fall back to standard list with room info displayed; implement basic grouping |
| Cards lose click area on mobile | Low | Medium | Ensure full card is clickable with proper touch targets |
| Filter state lost on navigation | Low | Low | URL params persist state; add to browser history |
| Zero count cards confusing when clicked | Low | Low | Still navigate; empty state shown on target page |

---

## Testing Strategy

### Unit Tests
- StatCard renders correctly with onClick prop
- StatCard keyboard activation (Enter key)
- Dashboard page handleCardClick routes correctly

### Integration Tests
- Full navigation flow from dashboard to items page
- Filter param correctly applied on items page
- Clear filter returns to unfiltered state

### Manual E2E Tests
- Click each card type and verify navigation
- Test on mobile device/viewport
- Test with keyboard only navigation
- Test with screen reader

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 1: Make StatCards Clickable | Update StatCard, add props | 0.5 day | High |
| Phase 2: Wire Up Navigation | Route handlers, prop threading | 0.5 day | High |
| Phase 3: Handle Filter on Items Page | Query params, grouping UI | 1 day | Medium |
| Phase 4: Testing & Polish | Manual testing, a11y, docs | 0.5 day | High |
| **Total** | | **2.5 days** | **High** |

---

## Open Questions

1. **Room data availability:** Do items have a `room` or `location` field that can be used for grouping? Need to verify data model.

2. **Tag display preference:** Should tag grouping show items listed under each tag (item appears multiple times if multiple tags), or a single list with tag badges?

3. **Empty state behavior:** When clicking a stat card with count 0, should it still navigate to show the empty state, or disable clicking on zero-count cards?

**Recommendation:** Navigate even for zero counts - the empty state on the target page provides guidance for creating items.

---

## References

- PRD Source: `/docs/prd/intake/prd-make-dashboard-cards-clickable-20260111-200139.md`
- StatisticsCards Component: `/src/components/SimpleDashboard/StatisticsCards.tsx`
- Items Page: `/src/app/dashboard2/items/page.tsx`
- Dashboard Page: `/src/app/dashboard2/page.tsx`
- ItemManager Component: `/src/components/ItemManager/ItemManager.tsx`
- ActionButtons Pattern: `/src/components/SimpleDashboard/ActionButtons.tsx`
- Dashboard Stats Hook: `/src/hooks/useDashboardStats.ts`

---

## Appendix A: Visual Design Reference

### Current Card (Non-clickable)
```
┌─────────────────────────────────┐
│  [Icon]   32                    │
│           Items                 │
└─────────────────────────────────┘
```

### Updated Card (Clickable)
```
┌─────────────────────────────────┐
│  [Icon]   32           →        │  ← Cursor: pointer
│           Items                 │    Hover: shadow-md, scale 1.02
└─────────────────────────────────┘    Focus: ring-2
```

### Hover State
- Shadow increases from `shadow-sm` to `shadow-md`
- Slight scale up `scale-[1.02]`
- Transition duration 200ms

### Active State
- Scale down `scale-[0.98]`
- Provides tactile feedback

---

## Appendix B: URL Structure

| Card Clicked | Target URL | Behavior |
|--------------|------------|----------|
| Items | `/dashboard2/items` | Full item list |
| Rooms | `/dashboard2/items?filter=room` | Items grouped by room |
| Tags | `/dashboard2/items?filter=tag` | Items grouped by tag |

---

## Appendix C: Implementation Checklist

### Pre-Implementation
- [ ] Verify items have room/location data for grouping
- [ ] Review ItemManager filter capabilities
- [ ] Confirm routing approach with team

### Implementation
- [ ] Phase 1: StatCard click handling
- [ ] Phase 2: Navigation wiring
- [ ] Phase 3: Filter handling on Items page
- [ ] Phase 4: Testing and polish

### Post-Implementation
- [ ] Update PRD acceptance criteria checkboxes
- [ ] Mark PRD as implemented
- [ ] Move PRD from intake to completed folder
