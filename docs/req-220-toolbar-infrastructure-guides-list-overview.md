# Implementation Overview: Full Toolbar Infrastructure for Guides List Page

## Header
| Field | Value |
|-------|-------|
| Request Reference | #220 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 21:30 |
| Breakdown Created | 2026-01-13 22:15 PST |
| T-shirt Size | M |
| Estimated Effort | 6-8 hours |

## Goals

1. **Add Search Functionality**: Implement debounced search input to filter guides by title, item name, or purpose category
2. **Add View Toggle**: Enable switching between grid/tile view and list/table view
3. **Add Property Column**: Display property information in list view (hidden by default, toggleable via gear icon)
4. **Add Purpose Filter**: Implement filter dropdown to filter by purpose type (how-to-use, troubleshooting, etc.)
5. **Maintain Consistency**: Match the visual design and interaction patterns from Items list page

### Assumptions & Clarifications
- Reuse existing components from ItemManager where applicable (SearchInput, ViewToggle pattern)
- Reuse the existing `useDebounce` hook from ItemManager
- Grid view will show guide cards similar to ItemCard pattern
- Property column needs to fetch property name from item data
- All changes scoped to `/dashboard2/instructions` route only
- The existing sorting and column visibility infrastructure from REQ-219 will be extended

## Implementation Plan

### Step 1: Create useGuideSearch Hook
- **Description**: Create a custom hook for filtering and sorting guides, similar to `useItemSearch`
- **Rationale**: Centralizes search/filter/sort logic for guides, enables reuse and testing
- **Estimated Effort**: S (1-2 hours)

### Step 2: Create GuideToolbar Component
- **Description**: Build toolbar component matching ItemToolbar layout with search, view toggle, and purpose filter
- **Rationale**: Provides consistent UX with Items list; encapsulates toolbar concerns
- **Estimated Effort**: M (2-3 hours)

### Step 3: Create GuideGrid Component
- **Description**: Build grid view component for displaying guides as tiles
- **Rationale**: Enables visual grid layout matching Items list grid view
- **Estimated Effort**: S (1 hour)

### Step 4: Create GuideCard Component
- **Description**: Build individual guide card component for grid view display
- **Rationale**: Shows guide info in tile format with purpose badge, item name
- **Estimated Effort**: S (1 hour)

### Step 5: Extend InstructionsTable for Property Column
- **Description**: Add optional Property column to existing table, update column settings
- **Rationale**: Enables multi-property users to see which property each guide belongs to
- **Estimated Effort**: S (30 min)

### Step 6: Integrate in Page Component
- **Description**: Wire up all components in the instructions page with state management
- **Rationale**: Final integration to enable full toolbar functionality
- **Estimated Effort**: S (1 hour)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/hooks/useGuideSearch.ts` | - | Create |
| `src/components/InstructionsTable/GuideToolbar.tsx` | - | Create |
| `src/components/InstructionsTable/GuideGrid.tsx` | - | Create |
| `src/components/InstructionsTable/GuideCard.tsx` | - | Create |

### Existing Files to Modify

| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/InstructionsTable.tsx` | Add Property column | Modify |
| `src/components/InstructionsTable/InstructionsTable.types.ts` | Add new types | Extend |
| `src/components/InstructionsTable/useGuideColumnVisibility.ts` | Add property column | Modify |
| `src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | Add property option | Modify |
| `src/components/InstructionsTable/index.ts` | Export new components | Extend |
| `src/app/dashboard2/instructions/page.tsx` | Integrate toolbar/views | Modify |

### Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Toolbar pattern reference |
| `src/components/ItemManager/components/SearchInput.tsx` | Search input component to reuse |
| `src/components/ItemManager/hooks/useDebounce.ts` | Debounce hook to reuse |
| `src/components/ItemManager/hooks/useColumnVisibility.ts` | Column visibility pattern |
| `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | Gear dropdown pattern |
| `src/components/ItemManager/components/ItemGrid.tsx` | Grid layout pattern |
| `src/components/ItemManager/components/ItemCard.tsx` | Card component pattern |

## Dependencies

### Internal Dependencies
- REQ-219 (Sortable Table Headers) - Already implemented, provides sorting foundation
- REQ-212 (Instructions List Page) - Base implementation being extended

### External Dependencies
- `@radix-ui/react-dropdown-menu` - Already used for column settings popup
- `lucide-react` - Already used for icons

## Risks and Considerations

### Potential Side Effects
- Changes to column visibility state structure may require migration for existing users
- View mode changes need to persist in session storage
- Property data must be available from item relationship in article data

### Testing Requirements
- Test search filtering with various query strings (title, item name, purpose)
- Test view toggle between grid and list views
- Test property column visibility toggle
- Test purpose filter dropdown functionality
- Test responsive behavior on mobile devices
- Test keyboard navigation for accessibility

### Open Questions
- [ ] Should view mode preference persist across sessions (localStorage vs sessionStorage)?
- [ ] Should purpose filter support multi-select or single-select?
- [ ] Is the property data already available in the article response, or does it need a join?

## Out of Scope
- Changes to the original dashboard (/dashboard/) - only /dashboard2/ is affected
- Backend API modifications - using existing data structures
- Bulk selection and actions for guides (future enhancement)
- Advanced filtering by date range or other criteria
- Export/import functionality

---
*Document generated: 2026-01-13 22:15 PST*
