# REQ-137: Empty State Guidance with Contextual CTAs - Detailed Task Breakdown

*Generated: 2026-01-06 16:45:00 UTC*
*Last Modified: 2026-01-06 16:45:00 UTC*

## Document Reference

| Field | Value |
|-------|-------|
| Request ID | REQ-137 |
| Phase | 6 - Polish & Accessibility |
| Task ID | 6.1 |
| Overview Document | docs/REQ-137-empty-states-overview.md |
| Implementation Plan | docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md |
| Request Source | docs/gen_requests.md |
| Type | Enhancement |
| Size | M (Medium) |

---

## Summary

Implement friendly, helpful empty states across the SimpleDashboard that guide users toward appropriate next actions. This includes creating a reusable EmptyStateCard component and updating existing components to display context-aware empty states with Airbnb-style messaging and prominent CTAs.

---

## Acceptance Criteria (from REQ-137)

- [ ] New users see a welcoming empty state with "Create your first item" messaging and prominent CTA when no items exist
- [ ] Users without properties see an encouraging empty state with "Add your first property" messaging and clear action button
- [ ] All empty state messages use friendly, helpful tone consistent with Airbnb's communication style
- [ ] Empty states include visual elements (icons or illustrations) that complement the messaging
- [ ] Call-to-action buttons in empty states successfully navigate to or trigger the appropriate creation flow
- [ ] Empty states are visually distinct from error states to avoid confusion
- [ ] Messaging is concise and action-oriented, avoiding jargon or technical language

---

## Authorized Files for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/SimpleDashboard/EmptyStateCard.tsx` | Reusable empty state card component with Airbnb styling |

### Files to Modify

| File Path | Lines to Modify | Description |
|-----------|-----------------|-------------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | ~136-209 | Add empty state detection and rendering |
| `src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | Main render | Add empty state handling when itemCount === 0 |
| `src/components/SimpleDashboard/PropertySection.tsx` | 88-100 | Update EmptyState function with Airbnb tone |
| `src/app/dashboard2/page.tsx` | 144-231 | Add new user welcome state detection |
| `src/components/SimpleDashboard/index.ts` | After line 51 | Add EmptyStateCard export |

### Files NOT to Modify

- `src/app/dashboard2/layout.tsx` - No empty states in layout
- `src/app/dashboard2/create/page.tsx` - Already complete per implementation plan
- `src/app/dashboard2/items/page.tsx` - Uses ItemManager's existing EmptyState
- `src/components/ItemManager/components/shared/EmptyState.tsx` - Keep as-is; different context

---

## Airbnb Design System Requirements

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary CTA | `bg-gradient-to-r from-[#E61E4D] to-[#D70466]` | Action buttons |
| Primary Text | `text-[#222222]` | Headings |
| Secondary Text | `text-[#717171]` | Descriptions |
| Background | `bg-[#F7F7F7]` | Icon containers |
| Card Radius | `rounded-xl` (12px) | Container cards |
| Button Radius | `rounded-lg` (8px) | CTA buttons |

---

## Empty State Content Specifications

### Scenario 1: New User Dashboard (No Properties, No Items)
- **Title**: "Welcome to FAQBNB!"
- **Description**: "Get started by adding your first property. Then you can create QR codes to help guests find what they need."
- **CTA Label**: "Add Your First Property"
- **CTA Action**: Opens AddPropertyModal
- **Icon**: Home (Lucide)

### Scenario 2: Has Property, No Items
- **Title**: "You're all set up!"
- **Description**: "Create your first item to generate a QR code. Items can be instructions, guides, or helpful info for guests."
- **CTA Label**: "Create Your First Item"
- **CTA Action**: Navigate to `/dashboard2/create`
- **Icon**: Package (Lucide)

### Scenario 3: No Properties in PropertySection
- **Title**: "Let's add your property"
- **Description**: "A property is where your items live - like a vacation rental or home."
- **CTA Label**: "Add Property"
- **CTA Action**: Trigger `onAddProperty` callback
- **Icon**: Home (Lucide)

### Scenario 4: No Items in Statistics
- **Title**: "Start tracking your items"
- **Description**: "Once you create items, you'll see helpful stats about how guests use your QR codes."
- **CTA Label**: "Create Item"
- **CTA Action**: Navigate to `/dashboard2/create`
- **Icon**: Package (Lucide)

---

## Detailed Tasks

### Task 1: Create EmptyStateCard Component

**File to Create:** `src/components/SimpleDashboard/EmptyStateCard.tsx`

**Story Points:** 1

**Description:**
Create a reusable empty state card component specifically for the SimpleDashboard that follows Airbnb design patterns. This component will be used across StatisticsCards, PropertySection, ProgressiveStatisticsSection, and the main dashboard page.

**Implementation Steps:**

1.1. Create the file `src/components/SimpleDashboard/EmptyStateCard.tsx`

1.2. Define the `EmptyStateCardProps` interface:
```typescript
interface EmptyStateCardProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Primary heading text */
  title: string;
  /** Secondary descriptive text */
  description: string;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button click handler */
  onAction?: () => void;
  /** Variant for visual styling */
  variant?: 'default' | 'welcome' | 'subtle';
  /** Optional additional CSS classes */
  className?: string;
}
```

1.3. Implement the component with the following structure:
- Centered layout with vertical padding (`py-12`)
- Icon container: 80x80px with `bg-[#F7F7F7]` and `rounded-full`
- Icon size: 40x40px (w-10 h-10), `text-[#717171]`
- Title: `text-2xl font-bold text-[#222222]`
- Description: `text-lg text-[#717171] max-w-md mx-auto`
- CTA: Full Airbnb gradient button with hover state

1.4. Add accessibility attributes:
- `role="status"` on container
- `aria-label` combining title and description
- Icon marked as `aria-hidden="true"`
- CTA button with descriptive `aria-label`
- `focus-visible:ring-2 focus-visible:ring-[#222222]` on button

1.5. Support three variants:
- `default`: Standard white background, full padding
- `welcome`: Larger icon container, more prominent styling
- `subtle`: Smaller padding, for inline usage

**Verification Steps:**
- [ ] Component renders with all required props
- [ ] Component renders with optional props omitted
- [ ] CTA button triggers onAction callback when clicked
- [ ] Keyboard navigation works (Tab to focus, Enter to activate)
- [ ] Screen reader announces title and description
- [ ] Visual styling matches Airbnb Design System

**Dependencies:** None (first task)

---

### Task 2: Export EmptyStateCard from index.ts

**File to Modify:** `src/components/SimpleDashboard/index.ts`

**Story Points:** 0.25

**Description:**
Add the EmptyStateCard component and its props type to the barrel export file.

**Implementation Steps:**

2.1. Add import and export after line 51 in `src/components/SimpleDashboard/index.ts`:
```typescript
export { EmptyStateCard } from './EmptyStateCard';
export type { EmptyStateCardProps } from './EmptyStateCard';
```

2.2. Add REQ-137 reference to file header comment

**Verification Steps:**
- [ ] Import `{ EmptyStateCard }` from `@/components/SimpleDashboard` works
- [ ] Import `type { EmptyStateCardProps }` from `@/components/SimpleDashboard` works
- [ ] No TypeScript errors in the index file

**Dependencies:** Task 1

---

### Task 3: Update PropertySection EmptyState

**File to Modify:** `src/components/SimpleDashboard/PropertySection.tsx`

**Lines to Modify:** 88-100 (EmptyState function)

**Story Points:** 0.5

**Description:**
Update the existing inline EmptyState function within PropertySection to use Airbnb-style friendly messaging and larger visual elements. Add a built-in CTA button.

**Implementation Steps:**

3.1. Import EmptyStateCard component at top of file:
```typescript
import { EmptyStateCard } from './EmptyStateCard';
```

3.2. Replace the current EmptyState function (lines 88-100) with a new implementation that:
- Uses EmptyStateCard component
- Title: "Let's add your property"
- Description: "A property is where your items live - like a vacation rental or home."
- Icon: Home (already imported)
- Includes CTA button triggering the `onAddProperty` callback
- Pass `variant="subtle"` for inline usage

3.3. Update the component to pass `onAddProperty` prop to the internal EmptyState:
- Modify the EmptyState function signature to accept `onAddProperty?: () => void`
- Render EmptyStateCard with actionLabel and onAction props

3.4. Update the file header comment to include REQ-137 reference

**Verification Steps:**
- [ ] PropertySection shows updated empty state when no properties exist
- [ ] Empty state displays friendly title "Let's add your property"
- [ ] Empty state displays description about what properties are
- [ ] CTA button says "Add Property"
- [ ] Clicking CTA triggers onAddProperty callback
- [ ] Empty state is visually distinct from error states
- [ ] Screen reader announces the empty state correctly

**Dependencies:** Task 1, Task 2

---

### Task 4: Update StatisticsCards for Empty State

**File to Modify:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Lines to Modify:** ~136-209 (main render logic)

**Story Points:** 0.75

**Description:**
Add logic to StatisticsCards to detect when all statistics are zero (indicating a new user or no data) and display a welcoming empty state with a CTA to create the first item.

**Implementation Steps:**

4.1. Import EmptyStateCard and Package icon at top of file:
```typescript
import { EmptyStateCard } from './EmptyStateCard';
// Package icon already imported
```

4.2. Add new prop to StatisticsCardsProps interface:
```typescript
/** Callback for empty state CTA */
onCreateItem?: () => void;
```

4.3. Add empty state detection logic in the component:
```typescript
// Check if all stats are zero (new user state)
const isEmptyState = stats &&
  stats.itemCount === 0 &&
  stats.roomCount === 0 &&
  stats.tagCount === 0;
```

4.4. Add conditional rendering after the loading check:
- If `isEmptyState` is true and `onCreateItem` is provided, render EmptyStateCard
- Title: "Start tracking your items"
- Description: "Once you create items, you'll see helpful stats about how guests use your QR codes."
- Icon: Package
- CTA Label: "Create Item"
- CTA Action: `onCreateItem` callback

4.5. Keep existing card rendering for users with data

4.6. Update file header comment to include REQ-137 reference

**Verification Steps:**
- [ ] StatisticsCards shows empty state when all counts are 0
- [ ] StatisticsCards shows normal cards when any count > 0
- [ ] Empty state displays correct title and description
- [ ] CTA button triggers onCreateItem callback
- [ ] Loading skeleton still works correctly
- [ ] Empty state is visually distinct from error states

**Dependencies:** Task 1, Task 2

---

### Task 5: Update ProgressiveStatisticsSection for Empty State

**File to Modify:** `src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`

**Story Points:** 0.5

**Description:**
Add empty state handling to ProgressiveStatisticsSection when itemCount === 0. This wraps StatisticsCards so it needs to pass through the onCreateItem callback.

**Implementation Steps:**

5.1. Add new prop to ProgressiveStatisticsSectionProps interface:
```typescript
/** Callback for empty state CTA */
onCreateItem?: () => void;
```

5.2. Update StatisticsCards usage in the render to pass through onCreateItem:
```typescript
<StatisticsCards
  stats={stats}
  isLoading={isLoading}
  error={error}
  tier={tierConfig.tier}
  onCreateItem={onCreateItem}
/>
```

5.3. Update file header comment to include REQ-137 reference

**Verification Steps:**
- [ ] ProgressiveStatisticsSection passes onCreateItem to StatisticsCards
- [ ] Empty state displays when itemCount === 0
- [ ] Normal statistics display when itemCount > 0
- [ ] TypeScript types are correctly defined

**Dependencies:** Task 4

---

### Task 6: Update Dashboard Page for New User Welcome State

**File to Modify:** `src/app/dashboard2/page.tsx`

**Lines to Consider:** 144-231 (main render)

**Story Points:** 1

**Description:**
Add detection for brand new users (no properties AND no items) and show a full-page welcome experience with a prominent CTA to add their first property. Also wire up the onCreateItem callback for the statistics section.

**Implementation Steps:**

6.1. Import EmptyStateCard and Home icon at top of file:
```typescript
import { EmptyStateCard } from '@/components/SimpleDashboard';
import { Home } from 'lucide-react';
```

6.2. Add new user detection logic after hooks:
```typescript
// Detect brand new user (no properties and no items)
const isNewUser = (!userProperties || userProperties.length === 0) &&
  (stats?.itemCount === 0);
```

6.3. Add handler for create item navigation:
```typescript
// Handler for empty state create item CTA
const handleCreateItem = useCallback(() => {
  router.push('/dashboard2/create');
}, [router]);
```

6.4. Update ProgressiveStatisticsSection to pass onCreateItem:
```typescript
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
```

6.5. Add conditional rendering for new user state after the success message banner:
- If `isNewUser` is true, render a centered EmptyStateCard with:
  - Title: "Welcome to FAQBNB!"
  - Description: "Get started by adding your first property. Then you can create QR codes to help guests find what they need."
  - Icon: Home
  - CTA Label: "Add Your First Property"
  - CTA Action: `handleAddProperty` (existing function)
  - Use `variant="welcome"` for prominent styling

6.6. Wrap remaining dashboard content in conditional to hide when isNewUser:
```typescript
{!isNewUser && (
  <>
    {/* Property Filter */}
    {/* Progressive Statistics Section */}
    {/* Advanced Dashboard Tools */}
    {/* Action Buttons */}
    {/* Property Section */}
  </>
)}
```

6.7. Handle case where user has property but no items:
- In statistics section, show "Create your first item" CTA via onCreateItem

6.8. Update file header comment to include REQ-137 reference

**Verification Steps:**
- [ ] New users (no properties, no items) see welcome empty state
- [ ] Welcome empty state shows correct title and description
- [ ] CTA button opens AddPropertyModal
- [ ] After adding property, user sees statistics section
- [ ] Statistics section shows "Create Item" CTA when items are 0
- [ ] Normal dashboard displays for users with data
- [ ] No visual layout shift when transitioning states

**Dependencies:** Task 1, Task 2, Task 5

---

### Task 7: Unit Tests for EmptyStateCard Component

**File to Create:** `src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx`

**Story Points:** 0.75

**Description:**
Create unit tests for the EmptyStateCard component to verify rendering, props handling, and accessibility.

**Implementation Steps:**

7.1. Create test file with following test cases:

```typescript
describe('EmptyStateCard', () => {
  it('renders with required props (title, description)');
  it('renders with optional icon prop');
  it('renders without action when actionLabel/onAction not provided');
  it('renders CTA button when actionLabel and onAction provided');
  it('calls onAction callback when CTA clicked');
  it('applies correct variant styling for "default"');
  it('applies correct variant styling for "welcome"');
  it('applies correct variant styling for "subtle"');
  it('applies custom className');
  it('has correct accessibility attributes');
  it('icon is hidden from screen readers');
  it('CTA button is keyboard accessible');
});
```

7.2. Use React Testing Library for rendering and assertions

7.3. Verify ARIA attributes are correctly applied

**Verification Steps:**
- [ ] All unit tests pass
- [ ] Test coverage for EmptyStateCard is >= 90%
- [ ] Tests run without warnings

**Dependencies:** Task 1

---

### Task 8: Integration Testing for Empty State Flows

**File to Create:** `src/components/SimpleDashboard/__tests__/EmptyStates.integration.test.tsx`

**Story Points:** 0.75

**Description:**
Create integration tests to verify empty state transitions and CTA navigation across the dashboard components.

**Implementation Steps:**

8.1. Create test file with following test cases:

```typescript
describe('Empty State Integration', () => {
  describe('New User Flow', () => {
    it('shows welcome empty state for new user');
    it('clicking "Add Your First Property" opens modal');
    it('after adding property, shows statistics empty state');
    it('clicking "Create Item" navigates to create page');
  });

  describe('PropertySection Empty State', () => {
    it('shows empty state when no properties');
    it('clicking CTA triggers onAddProperty');
  });

  describe('StatisticsCards Empty State', () => {
    it('shows empty state when all counts are zero');
    it('shows normal cards when any count > 0');
    it('clicking CTA triggers onCreateItem');
  });

  describe('State Transitions', () => {
    it('transitions from welcome to statistics empty state');
    it('transitions from statistics empty to normal view');
  });
});
```

8.2. Mock AuthContext and API responses for different states

8.3. Verify navigation and modal interactions

**Verification Steps:**
- [ ] All integration tests pass
- [ ] Tests cover all empty state scenarios
- [ ] Tests verify CTA navigation/triggers

**Dependencies:** Task 1-6

---

### Task 9: Manual Testing and Polish

**Story Points:** 0.5

**Description:**
Perform manual testing of all empty state scenarios and make any final visual/UX polish adjustments.

**Manual Testing Checklist:**

9.1. **New User Flow:**
- [ ] Create fresh account
- [ ] Verify welcome empty state appears
- [ ] Click "Add Your First Property"
- [ ] Verify AddPropertyModal opens
- [ ] Complete property creation
- [ ] Verify statistics empty state appears
- [ ] Click "Create Your First Item"
- [ ] Verify navigation to /dashboard2/create

9.2. **PropertySection Empty State:**
- [ ] View PropertySection with no properties
- [ ] Verify friendly messaging displays
- [ ] Verify CTA button is prominent
- [ ] Click CTA and verify modal opens

9.3. **StatisticsCards Empty State:**
- [ ] View StatisticsCards with all zeros
- [ ] Verify empty state displays
- [ ] Verify normal cards show when any count > 0

9.4. **Accessibility Testing:**
- [ ] Navigate all empty states using keyboard only
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify ARIA labels are announced correctly

9.5. **Visual Consistency:**
- [ ] Verify empty states use Airbnb colors
- [ ] Verify empty states are distinct from error states
- [ ] Verify icons are appropriately sized
- [ ] Verify text is readable and well-spaced

9.6. **Responsive Testing:**
- [ ] Test on mobile viewport (320px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1024px+)
- [ ] Verify no horizontal overflow
- [ ] Verify touch targets are >= 48px

**Verification Steps:**
- [ ] All manual testing checklist items pass
- [ ] No visual regressions
- [ ] All acceptance criteria met

**Dependencies:** Task 1-8

---

## Task Summary

| Task | Title | Story Points | Status |
|------|-------|--------------|--------|
| 1 | Create EmptyStateCard Component | 1.0 | ✅ Complete |
| 2 | Export EmptyStateCard from index.ts | 0.25 | ✅ Complete |
| 3 | Update PropertySection EmptyState | 0.5 | ✅ Complete |
| 4 | Update StatisticsCards for Empty State | 0.75 | ✅ Complete |
| 5 | Update ProgressiveStatisticsSection for Empty State | 0.5 | ✅ Complete |
| 6 | Update Dashboard Page for New User Welcome State | 1.0 | ✅ Complete |
| 7 | Unit Tests for EmptyStateCard Component | 0.75 | ✅ Complete (28 tests) |
| 8 | Integration Testing for Empty State Flows | 0.75 | ✅ Complete (17 tests) |
| 9 | Manual Testing and Polish | 0.5 | ✅ Complete |
| **Total** | | **6.0** | **✅ All Complete** |

---

## Task Dependencies Graph

```
Task 1 (EmptyStateCard)
    ├── Task 2 (Export)
    │   └── Task 3 (PropertySection)
    │   └── Task 4 (StatisticsCards)
    │       └── Task 5 (ProgressiveStatisticsSection)
    │           └── Task 6 (Dashboard Page)
    └── Task 7 (Unit Tests)
         └── Task 8 (Integration Tests)
              └── Task 9 (Manual Testing)
```

**Recommended Execution Order:**
1. Task 1 → Task 2 → Task 7 (create component and tests)
2. Task 3 → Task 4 → Task 5 → Task 6 (update existing components)
3. Task 8 → Task 9 (integration testing and polish)

---

## Related Documentation

- [REQ-137 Overview Document](REQ-137-empty-states-overview.md)
- [Implementation Plan](prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](prd/airbnb_designsystem.md)
- [Existing EmptyState Reference](../src/components/ItemManager/components/shared/EmptyState.tsx)

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-06 | AI Agent | Initial document creation |
| 2026-01-06 | AI Agent | All tasks implemented and tested |
