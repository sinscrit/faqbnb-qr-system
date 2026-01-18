# Implementation Overview: Instructions List Page

## Header
| Field | Value |
|-------|-------|
| Request Reference | #212 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-12 |
| Breakdown Created | 2026-01-12 20:43:02 CET |
| T-shirt Size | M |
| Estimated Effort | 8-12 hours |

## Goals
Create a dedicated Instructions List Page at `/dashboard2/instructions` that displays all instruction articles (`item_articles` table) for the selected property. Each row shows the instruction title, associated item name, and room information extracted from item tags. The page should follow the existing dashboard2 patterns established in the Items page and include proper loading and empty states.

### Assumptions & Clarifications
- The current `/dashboard2/instructions/page.tsx` is a help/guidance page (REQ-207) and needs to be moved or renamed
- Instructions list will be moved to a new route, likely `/dashboard2/instructions-list` or the help page moved to `/dashboard2/help`
- Room information is extracted from item tags using the format `#room.roomname`
- The page will respect the property filter from PropertyContext (similar to Items page)
- No inline editing required - clicking an instruction will navigate to edit mode (REQ-213 dependency)
- The `item_articles` table does not currently have a `description` field, only `title` and `purpose`

## Implementation Plan

### Step 1: Resolve Route Conflict
- **Description**: Decide on final routes for help page vs instructions list page. Either move current instructions page to `/dashboard2/help` or create instructions list at `/dashboard2/instructions-list`
- **Rationale**: Cannot have two pages at the same route. Current page at `/dashboard2/instructions` serves as help documentation, not an instructions list
- **Estimated Effort**: S (1 hour)
- **Decision Required**: Confirm with user which approach is preferred

### Step 2: Create API Integration in api.ts
- **Description**: Add `listArticles()` method to `adminApi` in `src/lib/api.ts` to fetch articles with optional property filtering
- **Rationale**: Follows established pattern from `listItems()`, leverages existing `/api/admin/articles` endpoint
- **Estimated Effort**: M (2-3 hours)

### Step 3: Create Instructions List Page Component
- **Description**: Build main page component that fetches articles, joins with items data, extracts room tags, and displays in a table or list format
- **Rationale**: Follows pattern established in `/dashboard2/items/page.tsx` with authentication, property context, loading states, and empty states
- **Estimated Effort**: L (4-5 hours)

### Step 4: Create Instructions Table Component
- **Description**: Build reusable table component to display instructions with columns for title, item name, room, purpose, and actions
- **Rationale**: Separates presentation logic from data fetching, makes component testable and reusable
- **Estimated Effort**: M (2-3 hours)

### Step 5: Update Navigation
- **Description**: Ensure "Instructions" navigation item in dashboard2 layout points to the correct route
- **Rationale**: Navigation already exists in layout.tsx, just needs route confirmation
- **Estimated Effort**: S (30 minutes)

## Authorized Files and Functions for Modification

> Warning: **APPROVED SCOPE**: Changes outside this list require review

### Step 1: Route Resolution
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/page.tsx` | Entire file | Move/Rename |
| `src/app/dashboard2/help/page.tsx` | — | Create (if help page moves) |
| `src/app/dashboard2/instructions-list/page.tsx` | — | Create (if list uses new route) |

### Step 2: API Integration
| File | Target | Type |
|------|--------|------|
| `src/lib/api.ts` | `adminApi` object | Extend |
| `src/lib/api.ts` | `listArticles()` function | Create |

### Step 3: Instructions List Page
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/instructions/page.tsx` OR `src/app/dashboard2/instructions-list/page.tsx` | Entire file | Create |

### Step 4: Instructions Table Component
| File | Target | Type |
|------|--------|------|
| `src/components/InstructionsTable/InstructionsTable.tsx` | — | Create |
| `src/components/InstructionsTable/InstructionsTable.types.ts` | — | Create |
| `src/components/InstructionsTable/index.ts` | — | Create |

### Step 5: Navigation Update
| File | Target | Type |
|------|--------|------|
| `src/app/dashboard2/layout.tsx` | `navigationItems` array | Verify/Update |

## Dependencies

### Internal Dependencies
- **REQ-213**: Edit Instruction Flow depends on REQ-212 (this request) for the list page to link from
- **REQ-142**: Property Context System (already implemented) - used for property filtering
- **REQ-148**: `item_articles` table (already implemented)
- **REQ-151**: Articles API endpoints (already implemented at `/api/admin/articles`)

### External Dependencies
- Supabase database with `item_articles`, `items`, and `properties` tables
- Next.js 14 App Router
- React 18+
- Authentication via AuthContext
- Property filtering via PropertyContext

### API Endpoints Used
- `GET /api/admin/articles?item_id=xxx` (existing) - needs property-level filtering added
- `GET /api/admin/items` (existing) - for joining item names

## Technical Architecture

### Database Query Pattern
```typescript
// Fetch articles with item details
// JOIN item_articles -> items -> properties
// Filter by selected property from context
// Extract room from items.tags array (#room.xxx format)
```

### Component Structure
```
InstructionsListPage (page.tsx)
├── useAuth() - authentication
├── usePropertyContext() - property filtering
├── useEffect() - fetch articles via API
├── Loading State
├── Empty State
└── InstructionsTable
    ├── Table Header (Title, Item, Room, Purpose)
    ├── Table Rows
    │   ├── Instruction Title
    │   ├── Item Name
    │   ├── Room (extracted from tags)
    │   └── Purpose Badge
    └── Actions Column
        └── View/Edit Button (REQ-213)
```

### Data Flow
1. Page loads with property context from PropertyContext
2. Fetch articles via `adminApi.listArticles(propertyId)`
3. Backend joins `item_articles` -> `items` -> `properties`
4. Frontend extracts room from `items.tags` array
5. Display in table with proper formatting

### Room Extraction Logic
```typescript
// Tags format: ['#room.kitchen', '#appliance.coffee-maker']
// Extract room: tags.find(t => t.startsWith('#room.'))?.split('.')[1]
```

## Risks and Considerations

### Potential Side Effects
- Route conflict resolution may temporarily break navigation if not coordinated properly
- The current help/instructions page has existing users who may expect it at `/dashboard2/instructions`

### Testing Requirements
- Test with no instructions (empty state)
- Test with instructions from multiple items
- Test property filtering works correctly
- Test room extraction from various tag formats
- Test with items that have no room tags
- Test loading state appearance during fetch
- Test error handling for API failures
- Test navigation to edit flow (once REQ-213 implemented)

### Performance Considerations
- Query may be slow if user has many items/articles
- Consider pagination if list grows large (not in scope for M-sized task)
- Room extraction happens client-side, could be optimized with database function

### Open Questions
- [ ] **CRITICAL**: Should the help page move to `/dashboard2/help` or should the list page use `/dashboard2/instructions-list`?
- [ ] Should the table include article creation date?
- [ ] Should the table support sorting by column?
- [ ] Should the table include a quick preview of content items count?
- [ ] What happens when an item has multiple articles? Display all separately?
- [ ] Should there be a filter to show only specific purposes (how-to-use, troubleshooting, etc.)?

## Out of Scope
- Inline editing of instruction titles or content
- Edit instruction flow (covered in REQ-213)
- Bulk operations on instructions (delete multiple, move, etc.)
- Pagination or infinite scroll (will display all articles)
- Advanced filtering by purpose, room, or date
- Search functionality within instructions
- Exporting instructions list
- Analytics for instruction views
- Reordering instructions in the list

## Detailed Implementation Notes

### API Method Signature (Step 2)
```typescript
// src/lib/api.ts
adminApi.listArticles(
  propertyId?: string,
  page?: number,
  limit?: number,
  headers?: Record<string, string>
): Promise<ArticlesListResponse>
```

### Page Component Structure (Step 3)
Follow the pattern from `src/app/dashboard2/items/page.tsx`:
- Client component with `'use client'` directive
- Import hooks: `useAuth`, `usePropertyContext`, `useRouter`
- State management: `articles`, `loading`, `error`
- `fetchArticles` callback with property filtering
- Authentication check
- Property context integration
- Header with title and item count
- Error state display
- Loading state with spinner
- Empty state when no articles
- Main content area with InstructionsTable

### Table Component Structure (Step 4)
```typescript
interface InstructionRow {
  id: string;
  articleTitle: string;
  itemName: string;
  itemId: string;
  room: string | null;
  purpose: PurposeType;
  createdAt: string;
}

interface InstructionsTableProps {
  instructions: InstructionRow[];
  onEdit?: (articleId: string) => void;
}
```

### Room Extraction Utility
```typescript
// src/lib/item-utils.ts or inline
export function extractRoomFromTags(tags: string[]): string | null {
  const roomTag = tags.find(tag => tag.startsWith('#room.'));
  if (!roomTag) return null;
  const room = roomTag.split('.')[1];
  return room ? room.replace(/-/g, ' ') : null;
}
```

---
*Document generated: 2026-01-12 20:43:02 CET*
*Last modified: 2026-01-12 20:43:02 CET*
