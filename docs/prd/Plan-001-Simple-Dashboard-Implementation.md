# Implementation Plan: Dashboard 2 - Simple Dashboard

**Generated:** 2026-01-06 11:45:00 UTC
**Last Modified:** 2026-01-06 11:45:00 UTC
**PRD Reference:** PRD_Dashboard_2_Simple_Dashboard.md
**Design System Reference:** airbnb_designsystem.md

---

## Overview

This plan implements a simplified dashboard for property owners managing a single account with one or more properties. The dashboard provides at-a-glance statistics (items, rooms, tags), primary action buttons (Create Item, View Items, Print QR Code), property management, and a QR code printing flow. The implementation will follow the existing codebase patterns, utilize the Airbnb Design System, and align with the existing database schema.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext), React useState/useReducer |
| UI Components | Custom components + Radix UI primitives |
| Icons | Lucide React, Heroicons |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Authentication | Supabase Auth with custom AuthContext |
| API Pattern | Next.js API Routes with `apiRequest` helper |
| Build Tool | Next.js with Turbopack |

### Existing Database Schema Analysis

The current database includes:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `items` | Item records | id, public_id, name, description, qr_code_url, created_at |
| `item_links` | Links/content per item | id, item_id, title, link_type, url, display_order |
| `admin_users` | Admin user accounts | id, email, full_name, role |
| `mailing_list_subscribers` | Email subscriptions | id, email, status |

**TypeScript Types (from `/src/types/index.ts`):**

| Type | Purpose |
|------|---------|
| `Property` | Property entity with user_id, property_type_id, nickname, address |
| `PropertyType` | Property type classification |
| `Item` | Item with propertyId association |
| `Account` | Multi-tenant account management |

**Critical Observation:** The PRD references `rooms` and `tags` as statistics, but the current database schema shows:
- **Rooms:** Items have a `location` field (from ItemRecord) but no dedicated `rooms` table
- **Tags:** Items have a `tags?: string[]` field stored in ItemCapture records

The implementation will derive statistics from:
- **Item Count:** Count from `items` table filtered by property
- **Room Count:** Distinct count of `location` values from items
- **Tag Count:** Distinct count of unique tags across items

### Design System Alignment (Airbnb DLS)

The implementation will use these design tokens from `airbnb_designsystem.md`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | #222222 | Primary text |
| `--color-text-secondary` | #717171 | Secondary text |
| `--color-brand-primary` | #FF385C | CTAs (gradient buttons) |
| `--color-background` | #FFFFFF | Card backgrounds |
| `--color-border` | #DDDDDD | Card borders |
| `--radius-md` | 8px | Buttons |
| `--radius-lg` | 12px | Cards |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 24px | Section spacing |
| `--space-6` | 32px | Large gaps |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All required libraries already installed | N/A | N/A |

**Existing libraries to leverage:**
- `react-qr-code` - QR code generation (already installed)
- `pdf-lib` - PDF generation for QR print (already installed)
- `lucide-react` - Icons (already installed)
- `@radix-ui/react-dialog` - Modal dialogs (already installed)

---

## Architecture

### Component Structure

```
src/
  components/
    SimpleDashboard/
      index.ts                        # Public exports
      SimpleDashboard.tsx             # Main dashboard component
      SimpleDashboard.types.ts        # Type definitions
      hooks/
        useDashboardStats.ts          # Stats fetching hook
        usePropertyManagement.ts      # Property CRUD hook
      components/
        StatisticsCards.tsx           # Items/Rooms/Tags cards
        ActionButtons.tsx             # Create/View/Print buttons
        PropertySection.tsx           # My Property display
        PropertyList.tsx              # Multi-property list
        PropertyEditModal.tsx         # Property edit form modal
        AddPropertyModal.tsx          # Add new property modal
        WelcomeHeader.tsx             # Welcome message
      utils/
        statsCalculation.ts           # Stats derivation logic
  app/
    dashboard2/
      page.tsx                        # Update existing page
      layout.tsx                      # Layout (existing)
      properties/
        [propertyId]/
          page.tsx                    # Property detail view
          edit/
            page.tsx                  # Property edit page
      print/
        page.tsx                      # QR print flow entry
        [propertyId]/
          page.tsx                    # Property-specific print
```

### State Management

```typescript
// Dashboard state managed via hooks
interface DashboardState {
  // Statistics (derived, cached)
  stats: {
    itemCount: number;
    roomCount: number;
    tagCount: number;
    loading: boolean;
    error: string | null;
  };

  // Properties (from AuthContext or fetched)
  properties: Property[];
  selectedPropertyId: string | null;

  // UI state
  isPropertyEditOpen: boolean;
  isAddPropertyOpen: boolean;
  editingProperty: Property | null;
}
```

### Data Flow

```
AuthContext (user, currentAccount)
       |
       v
SimpleDashboard (orchestrates)
       |
       +---> useDashboardStats() --> /api/user/dashboard/stats
       |
       +---> usePropertyManagement() --> /api/admin/properties
       |
       v
Child Components (StatisticsCards, ActionButtons, PropertySection)
```

---

## Integration Contract

### Props Interface

```typescript
// /src/components/SimpleDashboard/SimpleDashboard.types.ts

export interface SimpleDashboardProps {
  /** Optional CSS class name */
  className?: string;
}

export interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
}

export interface PropertyAddress {
  line1?: string;
  line2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface DashboardProperty {
  id: string;
  name: string;
  address?: PropertyAddress;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatisticsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export interface ActionButtonsProps {
  onCreateItem: () => void;
  onViewItems: () => void;
  onPrintQRCode: () => void;
  propertyCount: number;
}

export interface PropertySectionProps {
  properties: DashboardProperty[];
  onPropertyClick: (propertyId: string) => void;
  onAddProperty: () => void;
}

export interface PropertyEditModalProps {
  property: DashboardProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: PropertyFormData) => Promise<void>;
  loading?: boolean;
}

export interface PropertyFormData {
  name: string;
  address: PropertyAddress;
}
```

### API Endpoints Required

| Endpoint | Method | Purpose | Existing? |
|----------|--------|---------|-----------|
| `/api/user/dashboard/stats` | GET | Get dashboard statistics | **NEW** |
| `/api/admin/properties` | GET | List user properties | Existing |
| `/api/admin/properties` | POST | Create property | Existing |
| `/api/admin/properties/[id]` | PUT | Update property | Existing |
| `/api/admin/items` | GET | List items (for print selection) | Existing |

### New API Endpoint: Dashboard Stats

```typescript
// GET /api/user/dashboard/stats
// Response:
{
  success: boolean;
  data: {
    itemCount: number;
    roomCount: number;     // Distinct locations
    tagCount: number;      // Distinct tags
    propertyBreakdown?: {  // Optional per-property stats
      [propertyId: string]: {
        itemCount: number;
        roomCount: number;
        tagCount: number;
      }
    }
  };
  error?: string;
}
```

### Usage Example

```tsx
// /src/app/dashboard2/page.tsx
import { SimpleDashboard } from '@/components/SimpleDashboard';

export default function Dashboard2Page() {
  return (
    <SimpleDashboard className="max-w-4xl mx-auto" />
  );
}
```

---

## Implementation Approach

### Phase 1: Core Dashboard Shell (MVP) - 2-3 days

**Goal:** Basic dashboard layout with static/mock data

**Tasks:**

- [ ] **1.1** Create `/src/components/SimpleDashboard/` directory structure
- [ ] **1.2** Define types in `SimpleDashboard.types.ts`
- [ ] **1.3** Implement `WelcomeHeader.tsx` component
  - Display "Welcome back, [FirstName]" or "Welcome back"
  - Extract firstName from `user.fullName` or `user.email`
  - Follow Airbnb typography: 32px bold heading
- [ ] **1.4** Implement `StatisticsCards.tsx` component
  - Three cards: Items, Rooms, Tags
  - Card design: white bg, 12px border-radius, subtle shadow
  - Large number display with label below
  - Loading skeleton state
  - Zero state display ("0" not "No data")
  - Icons from Lucide: `Package`, `Home`, `Tag`
- [ ] **1.5** Implement `ActionButtons.tsx` component
  - Three buttons: "Create New Item", "View Items", "Print QR Code"
  - Large touch targets (min 48x48px)
  - Icons + text labels
  - Use Airbnb button patterns: dark primary, outline secondary
- [ ] **1.6** Create `SimpleDashboard.tsx` main component
  - Compose all subcomponents
  - Use mock data initially
- [ ] **1.7** Update `/src/app/dashboard2/page.tsx` to use SimpleDashboard
- [ ] **1.8** Create Storybook stories / visual tests (optional)

**Acceptance Criteria Phase 1:**
- Dashboard renders with mock statistics
- Welcome message displays user name
- Three action buttons are visible and styled
- Layout matches PRD wireframe

---

### Phase 2: Statistics & Data Integration - 2-3 days

**Goal:** Real data from API, property section

**Tasks:**

- [ ] **2.1** Create `/api/user/dashboard/stats/route.ts` endpoint
  - Query items table for current user's properties
  - Calculate distinct rooms (locations) from items
  - Calculate distinct tags from items
  - Filter by account context
- [ ] **2.2** Implement `useDashboardStats.ts` hook
  - Fetch from `/api/user/dashboard/stats`
  - Handle loading, error, and refetch states
  - Cache with SWR or simple state
- [ ] **2.3** Update `StatisticsCards.tsx` to use real data
  - Connect to useDashboardStats hook
  - Add refresh button functionality
  - Implement error state display
- [ ] **2.4** Implement `PropertySection.tsx` component
  - Display "My Property" for single property
  - Show property name as clickable element
  - Arrow/chevron icon indicating interaction
- [ ] **2.5** Connect property data from AuthContext
  - Use existing `userProperties` or fetch via API
- [ ] **2.6** Implement real-time stats update
  - Refresh stats after item creation
  - Use event-based or polling approach

**Acceptance Criteria Phase 2:**
- Statistics show real counts from database
- Zero counts display gracefully
- Stats update after CRUD operations
- Property section shows actual property name

---

### Phase 3: Property Management - 2-3 days

**Goal:** View/edit property details, add new properties

**Tasks:**

- [ ] **3.1** Implement `PropertyEditModal.tsx` component
  - Form fields: Name (required), Address fields (optional)
  - Validation: Name required, max lengths per PRD
  - Save and Cancel buttons
  - Loading state during save
  - Success toast notification
  - Airbnb form styling: floating labels, focus states
- [ ] **3.2** Create `/api/admin/properties/[id]/route.ts` if not existing
  - Handle PUT for updates
  - Validate required fields
  - Return updated property
- [ ] **3.3** Implement `usePropertyManagement.ts` hook
  - CRUD operations for properties
  - Optimistic updates
  - Error handling
- [ ] **3.4** Implement `AddPropertyModal.tsx` component
  - Same form as edit modal
  - Create new property on save
- [ ] **3.5** Connect "My Property" click to edit modal
- [ ] **3.6** Connect "Add New Property" to add modal
- [ ] **3.7** Handle form validation errors
  - Field-level error messages
  - Required field indication (asterisk)

**Acceptance Criteria Phase 3:**
- Clicking property opens edit modal
- All PRD fields present and editable
- Save persists changes to database
- Cancel discards unsaved changes
- Validation prevents empty name
- Success confirmation shown after save

---

### Phase 4: Multi-Property Support - 2-3 days

**Goal:** Support users with multiple properties

**Tasks:**

- [ ] **4.1** Implement `PropertyList.tsx` component
  - List all properties with name and item count
  - Clickable rows to view/edit
  - Visual indicator for expandable row
- [ ] **4.2** Update `PropertySection.tsx` for multi-property
  - Show list when 2+ properties
  - Show single property when 1 property
- [ ] **4.3** Update statistics to show totals or per-property
  - Add "(all properties)" label when multiple
  - Consider property filter dropdown
- [ ] **4.4** Update action button behavior
  - "Create Item" navigates to ItemCapture (uses selected property)
  - "View Items" navigates to items list (with property filter)
  - "Print QR Code" requires property selection if 2+ properties
- [ ] **4.5** Implement property selector for print flow
  - Modal or dropdown to select property
  - Then proceed to print

**Acceptance Criteria Phase 4:**
- Multi-property users see list of properties
- Can add additional properties
- Statistics adapt to show totals
- Print flow prompts for property selection

---

### Phase 5: Print QR Code Flow - 3-4 days

**Goal:** Complete QR code printing workflow

**Tasks:**

- [ ] **5.1** Create `/src/app/dashboard2/print/page.tsx`
  - Entry point for print flow
  - Property selector if multiple properties
- [ ] **5.2** Create `/src/app/dashboard2/print/[propertyId]/page.tsx`
  - Item selection interface for chosen property
- [ ] **5.3** Implement item selection UI
  - Checkbox list of items
  - Select all / deselect all
  - Show item name and QR code preview
  - Search/filter items
- [ ] **5.4** Implement print format selector
  - Options: Single page, Multiple per page, Labels
  - Preview thumbnail of each format
- [ ] **5.5** Integrate existing QRCodePrintManager component
  - Pass selected items and format
  - Generate PDF preview
- [ ] **5.6** Implement print/download actions
  - Print button opens system print dialog
  - Download PDF button saves file
- [ ] **5.7** Add QR code includes item name/label
  - Label below or beside QR code
- [ ] **5.8** Handle empty states
  - No items to print message
  - Link to create first item

**Acceptance Criteria Phase 5:**
- Single property: Direct to item selection
- Multiple properties: Property selector first
- Can select specific items for print batch
- Preview shows QR codes before printing
- Multiple format options available
- Can print to printer or download PDF
- Each QR code shows item name

---

### Phase 6: Polish & Edge Cases - 1-2 days

**Goal:** Refinement, accessibility, error handling

**Tasks:**

- [ ] **6.1** Implement empty states
  - New user with no items: "Create your first item" CTA
  - No properties: Prompt to add property
- [ ] **6.2** Add loading skeletons
  - Shimmer effect for statistics cards
  - Skeleton for property list
- [ ] **6.3** Implement error boundaries
  - Graceful error display
  - Retry functionality
- [ ] **6.4** Add keyboard navigation
  - Tab order through action buttons
  - Enter to activate buttons
  - Escape to close modals
- [ ] **6.5** Add ARIA labels and roles
  - Region labels for sections
  - Button descriptions
  - Live regions for stats updates
- [ ] **6.6** Mobile responsive testing
  - Stack cards vertically on mobile
  - Full-width buttons on small screens
  - Touch-friendly tap targets
- [ ] **6.7** Add analytics tracking (optional)
  - Track button clicks
  - Track print completions

**Acceptance Criteria Phase 6:**
- Graceful handling of all error states
- Accessible via keyboard
- Screen reader compatible
- Responsive on all breakpoints
- Empty states guide new users

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React hooks + Context | Matches existing patterns (AuthContext, useDashboardStats similar to useAuth) |
| API design | REST endpoints | Consistent with existing `/api/admin/*` and `/api/user/*` routes |
| Statistics calculation | Server-side aggregation | More efficient than client-side, reduces data transfer |
| Property form | Modal dialog | PRD shows inline edit, but modal is cleaner for mobile and follows existing patterns (PropertyEditModal) |
| QR print flow | Separate pages | Complex flow warrants dedicated routes for state management |
| Component styling | Tailwind + Airbnb tokens | Matches design system spec, uses existing CSS custom properties |
| Statistics caching | Client-side with refresh | Simple approach, can upgrade to SWR/React Query if needed |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database schema mismatch for rooms/tags | Medium | Medium | Derive from item locations/tags fields; document assumptions |
| QR print complexity | Medium | High | Leverage existing QRCodePrintManager; phase 5 timebox |
| Multi-property UX confusion | Low | Medium | Progressive disclosure; only show when 2+ properties |
| Real-time stats performance | Low | Medium | Cache with short TTL; debounce refresh |
| Property edit validation | Low | Low | Client + server validation; clear error messages |
| Mobile responsiveness | Low | Medium | Test early; use Tailwind responsive classes |

---

## Open Questions

| # | Question | Impact | Recommendation |
|---|----------|--------|----------------|
| 1 | Should statistics show totals or per-selected-property? | UX | Show totals with "(all properties)" label; add filter later if requested |
| 2 | Default property when adding second property? | UX | No default needed; user selects when required (print) |
| 3 | Property deletion allowed? | Data integrity | Out of scope per PRD; flag for future consideration |
| 4 | Empty state for brand new users? | Onboarding | Create "Get Started" card with CTA to create first item |
| 5 | Where does "View Items" navigate? | Navigation | `/dashboard2/items` - use existing ItemManager component |

---

## Recommended Spike Work

**Spike Goal:** Validate statistics aggregation query performance and accuracy

**Timebox:** 2 hours

**Tasks:**
1. Write SQL query to aggregate item count, distinct locations, distinct tags per property
2. Test with existing data in development database
3. Verify performance with 100+ items
4. Confirm tags are stored and accessible in current schema

**Success Criteria:**
- Query returns accurate counts
- Query executes in < 500ms
- Tags field is queryable from items or related table

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: Core Dashboard Shell | 2-3 days | High |
| Phase 2: Statistics & Data Integration | 2-3 days | High |
| Phase 3: Property Management | 2-3 days | Medium |
| Phase 4: Multi-Property Support | 2-3 days | Medium |
| Phase 5: Print QR Code Flow | 3-4 days | Medium |
| Phase 6: Polish & Edge Cases | 1-2 days | High |
| **Total** | **12-18 days** | Medium |

**Notes:**
- Estimates assume single developer
- Phase 5 has highest uncertainty due to print complexity
- Can parallelize Phase 3 and Phase 4 with two developers

---

## File References

| File | Purpose |
|------|---------|
| `/src/types/index.ts` | Existing Property, Item, Account types |
| `/src/types/dashboard.ts` | Existing dashboard-related types |
| `/src/contexts/AuthContext.tsx` | Authentication and account context |
| `/src/lib/api.ts` | API request helpers |
| `/src/components/UserDashboard.tsx` | Reference for dashboard patterns |
| `/src/components/ItemManager/` | Reference for item management UI |
| `/src/components/ItemCapture/` | Item creation workflow |
| `/src/components/QRCodePrintManager.tsx` | QR code printing functionality |
| `/src/components/PropertyForm.tsx` | Existing property form component |
| `/src/app/dashboard2/page.tsx` | Current dashboard2 page |
| `/src/app/dashboard2/layout.tsx` | Dashboard2 layout wrapper |
| `/docs/prd/airbnb_designsystem.md` | Design system tokens and patterns |

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [Existing UserDashboard Component](/src/components/UserDashboard.tsx)
- [ItemManager Documentation](/docs/prd/item-capture-manager-implementation-plan.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
