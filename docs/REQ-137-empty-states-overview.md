# REQ-137: Empty State Guidance with Contextual CTAs - Implementation Overview
*Generated: 2026-01-06 15:00:00 UTC*
*Last Modified: 2026-01-06 15:00:00 UTC*

## Reference
- **Request**: REQ-137 (Empty State Guidance with Contextual CTAs)
- **Source**: docs/gen_requests.md
- **Implementation Plan**: docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md
- **Type**: Enhancement
- **Phase**: 6 - Polish & Accessibility
- **Task ID**: 6.1
- **Size**: M

## Goals
1. Display friendly, helpful empty states for new users with no items
2. Show encouraging empty state for users without properties
3. Implement Airbnb-style tone with welcoming language
4. Provide clear call-to-action buttons in all empty states
5. Ensure visual distinction from error states
6. Maintain consistency with existing empty state patterns in the codebase

## Context from Implementation Plan

### PRD Feature Reference
Per Plan-001-Simple-Dashboard-Implementation-REVISED.md, Phase 6.1 specifies:

```
Task 6.1: Empty States
- [ ] New user with no items: "Create your first item" CTA
- [ ] No properties: Prompt to add property
- [ ] Friendly messaging per Airbnb tone
```

### Airbnb Design System Requirements
Per the implementation plan, the following tokens must be applied:

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| Primary CTA | `bg-gradient-to-r from-[#E61E4D] to-[#D70466]` | Action buttons |
| Primary Text | `text-[#222222]` | Headings |
| Secondary Text | `text-[#717171]` | Descriptions |
| Background | `bg-[#F7F7F7]` | Icon containers |
| Card Radius | `rounded-xl` (12px) | Container cards |
| Button Radius | `rounded-lg` (8px) | CTA buttons |

### Existing Empty State Patterns in Codebase

Based on codebase investigation, the following patterns exist:

| Component | Location | Pattern |
|-----------|----------|---------|
| `EmptyState` | `/src/components/ItemManager/components/shared/EmptyState.tsx` | Generic reusable component with icon, title, description, action |
| `PropertySection EmptyState` | `/src/components/SimpleDashboard/PropertySection.tsx:88-100` | Inline empty state for no properties |
| `Print Page EmptyState` | `/src/app/dashboard2/print/page.tsx:34-55` | No properties state with CTA |

### Existing Component Reference: ItemManager EmptyState
```typescript
// src/components/ItemManager/components/shared/EmptyState.tsx
export function EmptyState({
  title = 'No items yet',
  description = 'Create your first item to get started',
  icon,
  action,
  className,
}: EmptyStateProps)
```

Features:
- Role="status" with aria-label for accessibility
- Customizable icon (default: Package)
- Customizable title and description
- Optional action CTA slot

## Implementation Order

### Step 1: Create SimpleDashboard EmptyStateCard Component

Create a reusable empty state component specifically for the SimpleDashboard that follows Airbnb design patterns.

**File to create:** `/src/components/SimpleDashboard/EmptyStateCard.tsx`

**Props interface:**
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

**Implementation requirements:**
- Centered layout with icon, title, description
- Airbnb gradient CTA button
- Icon in rounded container with `bg-[#F7F7F7]`
- Typography per Airbnb DLS
- Aria-label for accessibility

### Step 2: Update StatisticsCards for Empty State

Modify StatisticsCards to display a welcoming empty state when all counts are zero and user is new.

**File to modify:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

**Changes:**
- Add logic to detect "new user" state (all stats are 0)
- Show EmptyStateCard when stats indicate empty
- Maintain current display for users with any data
- Pass through navigation callback for CTA

### Step 3: Update ProgressiveStatisticsSection for Empty State

The progressive statistics section should also handle empty states gracefully.

**File to modify:** `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`

**Changes:**
- Detect empty state (itemCount === 0)
- Render EmptyStateCard with "Create your first item" messaging
- Link CTA to `/dashboard2/create`

### Step 4: Update PropertySection Empty State

Enhance the existing PropertySection empty state with Airbnb tone.

**File to modify:** `/src/components/SimpleDashboard/PropertySection.tsx`

**Current implementation (lines 88-100):**
```typescript
function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Home className="w-6 h-6 text-[#717171]" />
      </div>
      <p className="text-[#222222] font-medium mb-1">No properties yet</p>
      <p className="text-[#717171] text-sm">
        Add your first property to get started
      </p>
    </div>
  );
}
```

**Required changes:**
- Update to use welcoming Airbnb tone
- Change title to: "Welcome! Let's get started"
- Change description to: "Add your first property to begin creating QR codes for your items"
- Add built-in CTA button (currently CTA is outside in parent)
- Larger icon container per Airbnb patterns

### Step 5: Update Dashboard Page for Empty User State

Modify the main dashboard page to show a comprehensive welcome experience for new users.

**File to modify:** `/src/app/dashboard2/page.tsx`

**Changes:**
- Detect new user state (no properties AND no items)
- Show full-page welcome empty state for brand new users
- Progressive disclosure: show simplified UI until user has data
- Maintain existing layout for users with data

### Step 6: Update index.ts Barrel Export

**File to modify:** `/src/components/SimpleDashboard/index.ts`

**Add export:**
```typescript
export { EmptyStateCard } from './EmptyStateCard';
export type { EmptyStateCardProps } from './EmptyStateCard';
```

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/components/SimpleDashboard/EmptyStateCard.tsx`
- **Purpose**: Reusable empty state card component with Airbnb styling
- **Exports**: `EmptyStateCard`, `EmptyStateCardProps`
- **Dependencies**: `lucide-react` icons

### Files to Modify

#### `/src/components/SimpleDashboard/StatisticsCards.tsx`
- **Lines to modify**: ~136-209 (main render logic)
- **Functions to modify**: `StatisticsCards` component
- **Changes**: Add empty state detection and rendering

#### `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`
- **Functions to modify**: Main component render
- **Changes**: Add empty state handling when itemCount === 0

#### `/src/components/SimpleDashboard/PropertySection.tsx`
- **Lines to modify**: 88-100 (EmptyState function)
- **Functions to modify**: `EmptyState` internal component
- **Changes**: Update messaging and styling per Airbnb tone

#### `/src/app/dashboard2/page.tsx`
- **Lines to consider**: 144-231 (main render)
- **Functions to modify**: `Dashboard2Page` component
- **Changes**: Add new user welcome state detection and rendering

#### `/src/components/SimpleDashboard/index.ts`
- **Lines to add**: After line 25
- **Changes**: Add EmptyStateCard export

### Files NOT to Modify
- `/src/app/dashboard2/layout.tsx` - No empty states in layout
- `/src/app/dashboard2/create/page.tsx` - Already complete per implementation plan
- `/src/app/dashboard2/items/page.tsx` - Uses ItemManager's existing EmptyState
- `/src/components/ItemManager/components/shared/EmptyState.tsx` - Keep as-is; different context

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

## Visual Design Requirements

### Layout
- Centered content with generous vertical padding (py-12 minimum)
- Icon container: 80x80px with `bg-[#F7F7F7]` and `rounded-full`
- Icon size: 40x40px (w-10 h-10)
- Title: `text-2xl font-bold text-[#222222]`
- Description: `text-lg text-[#717171] max-w-md mx-auto`
- CTA: Full Airbnb gradient button with hover state

### Accessibility
- `role="status"` on container
- `aria-label` combining title and description
- Icon marked as `aria-hidden="true"`
- CTA must have descriptive `aria-label`
- Focus-visible ring on interactive elements

### Responsive
- Maintain centered layout on all breakpoints
- No horizontal overflow
- Touch-friendly CTA (min 48px height)

## Testing Considerations

### Unit Tests Required
- EmptyStateCard renders with all prop combinations
- EmptyStateCard CTA triggers onAction callback
- StatisticsCards shows empty state when all counts are 0
- PropertySection EmptyState renders correctly

### Integration Tests Required
- New user flow shows appropriate empty states
- CTA navigation works correctly
- Empty states transition to normal states after data creation

### Manual Testing Scenarios
1. Create fresh account - verify welcome empty state
2. Add property - verify "no items" empty state
3. Create item - verify statistics populate
4. Delete all items - verify empty state returns
5. Verify keyboard navigation through empty state CTAs

## Dependencies

### Existing Dependencies (No New Additions)
- `lucide-react` for icons (already used throughout dashboard)
- `next/navigation` for routing (already used)

### Component Dependencies
- `EmptyStateCard` used by: StatisticsCards, PropertySection, ProgressiveStatisticsSection
- Parent components must provide action callbacks

## Estimated Implementation Effort

| Task | Estimate |
|------|----------|
| Step 1: Create EmptyStateCard | 0.5 hours |
| Step 2: Update StatisticsCards | 0.5 hours |
| Step 3: Update ProgressiveStatisticsSection | 0.5 hours |
| Step 4: Update PropertySection | 0.25 hours |
| Step 5: Update Dashboard Page | 0.5 hours |
| Step 6: Update index.ts | 0.1 hours |
| Testing & Polish | 0.5 hours |
| **Total** | **~3 hours** |

## Acceptance Criteria

From REQ-137 in gen_requests.md:

- [ ] New users see a welcoming empty state with "Create your first item" messaging and prominent CTA when no items exist
- [ ] Users without properties see an encouraging empty state with "Add your first property" messaging and clear action button
- [ ] All empty state messages use friendly, helpful tone consistent with Airbnb's communication style
- [ ] Empty states include visual elements (icons or illustrations) that complement the messaging
- [ ] Call-to-action buttons in empty states successfully navigate to or trigger the appropriate creation flow
- [ ] Empty states are visually distinct from error states to avoid confusion
- [ ] Messaging is concise and action-oriented, avoiding jargon or technical language

## Related Files for Context

- `/src/components/ItemManager/components/shared/EmptyState.tsx` - Existing pattern reference
- `/src/app/dashboard2/print/page.tsx` - EmptyState example at lines 34-55
- `/docs/prd/airbnb_designsystem.md` - Design tokens reference
- `/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md` - Implementation plan context
