# Implementation Overview: Sortable Table Headers and Column Settings for Guides List

## Header
| Field | Value |
|-------|-------|
| Request Reference | #219 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 16:47 |
| Breakdown Created | 2026-01-13 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals

Add sortable column headers, column visibility controls, and proper header row infrastructure to the Guides list page (`/dashboard2/instructions`) to match the functionality available on the Items list page (`/dashboard2/items`).

Technical requirements:
1. Implement clickable sortable column headers for Title, Item, Purpose, and Created columns
2. Add sort direction indicators (ascending/descending arrows) on active column
3. Integrate column settings gear icon with visibility toggle dropdown
4. Apply consistent header row styling matching the Items list design
5. Persist column visibility preferences in session storage
6. Maintain backward compatibility with existing data fetching and edit functionality

### Assumptions & Clarifications
- The Room column is not included in sortable columns (only Title, Item, Purpose, Created per acceptance criteria)
- The existing `InstructionRow` type already has `createdAt` field which supports sorting by date
- Column visibility will be managed by a new hook similar to `useColumnVisibility.ts` from ItemManager
- The sorting logic will be client-side initially (data is already fetched in full)
- The `ColumnSettingsPopup` component from ItemManager can be reused or adapted

## Implementation Plan

### Step 1: Define Sort Types and Column Visibility State
- **Description**: Create TypeScript types for guide sort options and column visibility state in `InstructionsTable.types.ts`
- **Rationale**: Type definitions must be established first to ensure type safety throughout implementation
- **Estimated Effort**: S (30 minutes)

### Step 2: Create SortableColumnHeader Component for Guides
- **Description**: Either extract and adapt `SortableColumnHeader` from `ItemList.tsx` into a reusable component, or create an inline version in `InstructionsTable.tsx` following the same pattern
- **Rationale**: The sortable header pattern is already proven in ItemList; reusing the same approach ensures consistency
- **Estimated Effort**: S (30 minutes)

### Step 3: Create useGuideColumnVisibility Hook
- **Description**: Create a new hook in `InstructionsTable/` directory for managing column visibility state with session storage persistence
- **Rationale**: Separating visibility logic into a hook follows the established pattern from ItemManager and enables reuse
- **Estimated Effort**: S (45 minutes)

### Step 4: Create ColumnSettingsPopup for Guides
- **Description**: Create or adapt a `ColumnSettingsPopup` component for the Guides list with appropriate column options
- **Rationale**: The gear icon dropdown pattern from ItemList should be replicated for consistency
- **Estimated Effort**: S (30 minutes)

### Step 5: Update InstructionsTable Component with Sortable Headers
- **Description**: Refactor `InstructionsTable.tsx` to include sortable column headers, column settings popup, and proper header row styling matching ItemList
- **Rationale**: Main integration point where all new components come together
- **Estimated Effort**: M (1.5 hours)

### Step 6: Implement Client-Side Sorting Logic
- **Description**: Add sorting logic to the instructions page to sort data based on selected column and direction
- **Rationale**: Sorting must be implemented at the page level to manage state and re-sort when user changes preference
- **Estimated Effort**: M (1 hour)

### Step 7: Update Instructions Page to Wire Up Sorting and Column Visibility
- **Description**: Modify `page.tsx` for `/dashboard2/instructions` to integrate the new sorting and column visibility features with InstructionsTable
- **Rationale**: The page component orchestrates all state and passes props to InstructionsTable
- **Estimated Effort**: S (45 minutes)

### Step 8: Testing and Polish
- **Description**: Test all sorting combinations, column visibility toggles, session persistence, and responsive behavior
- **Rationale**: Ensure feature works correctly across all scenarios before completion
- **Estimated Effort**: S (30 minutes)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Type Definitions (Step 1)
| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/InstructionsTable.types.ts` | `GuideSortOption` type | Create |
| `src/components/InstructionsTable/InstructionsTable.types.ts` | `GuideColumnVisibilityState` interface | Create |
| `src/components/InstructionsTable/InstructionsTable.types.ts` | `InstructionsTableProps` interface | Modify |

### Components (Steps 2, 4, 5)
| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/InstructionsTable.tsx` | `SortableColumnHeader` function | Create |
| `src/components/InstructionsTable/InstructionsTable.tsx` | `InstructionsTable` function | Modify |
| `src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | `GuideColumnSettingsPopup` component | Create |
| `src/components/InstructionsTable/index.ts` | exports | Modify |

### Hooks (Step 3)
| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/useGuideColumnVisibility.ts` | `useGuideColumnVisibility` hook | Create |

### Page Integration (Steps 6, 7)
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/page.tsx` | `InstructionsPage` component | Modify |

### Reference Files (Read-Only)
| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/ItemList.tsx` | Reference implementation for SortableColumnHeader |
| `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | Reference implementation for column settings |
| `src/components/ItemManager/hooks/useColumnVisibility.ts` | Reference implementation for visibility hook |
| `src/components/ItemManager/ItemManager.types.ts` | Reference for SortOption and ColumnVisibilityState patterns |

## Dependencies

### Internal Dependencies
- None - this feature is standalone

### External Dependencies
- `@radix-ui/react-dropdown-menu` - Already used in codebase for ColumnSettingsPopup
- `lucide-react` - Already used for icons (ArrowUp, ArrowDown, ArrowUpDown, Settings2, Check)
- `@/lib/utils` - Already used for `cn()` utility

## Risks and Considerations

### Potential Side Effects
- The InstructionsTable component interface will change (new props added) - ensure backward compatibility
- Session storage key for column visibility should be unique (e.g., `instructionsTable.columns`) to avoid conflicts with ItemManager's `itemManager.columns`

### Testing Requirements
- Verify all sort columns work correctly (Title A-Z, Z-A, Item A-Z, Z-A, Purpose A-Z, Z-A, Created newest first, oldest first)
- Test column visibility toggle persists across page refreshes within session
- Test responsive behavior - headers should work on mobile and desktop
- Test loading and empty states still render correctly with new header structure

### Open Questions
- [ ] Should the Created column default to descending (newest first) initially?
- [ ] Are there any additional columns that should be toggleable beyond what's in the requirements?
- [ ] Should sorting preference also persist in session storage?

## Out of Scope
- Server-side sorting - sorting will be client-side on already-fetched data
- Pagination - not mentioned in requirements
- Advanced filtering - not part of this request
- Column reordering via drag-and-drop
- Changes to the edit functionality or navigation
- Changes to other dashboard pages (Items, Properties, etc.)
- API changes for sorting parameters

---
*Document generated: 2026-01-13*
