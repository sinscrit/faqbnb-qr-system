# REQ-323: Create Translation Management Page - Implementation Breakdown

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic5.md - Request #323
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.3
**Epic:** L10N Epic 5 - Owner Translation Management

---

## Table of Contents

1. [Summary](#summary)
2. [Request Details](#request-details)
3. [Dependencies](#dependencies)
4. [Technical Investigation](#technical-investigation)
5. [Database Schema Context](#database-schema-context)
6. [Implementation Tasks](#implementation-tasks)
7. [Authorized Files and Functions for Modification](#authorized-files-and-functions-for-modification)
8. [Component Architecture](#component-architecture)
9. [Integration Contracts](#integration-contracts)
10. [Risk Assessment](#risk-assessment)
11. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)

---

## Summary

Create a dedicated Translation Management page at `/dashboard2/translations` that provides property owners and account administrators with a centralized interface to view and manage all translatable content. The page features a full-width data table showing items, articles, and links with their translation status across six supported languages (en, fr, es, de, nl, it), along with filtering, sorting, and bulk selection capabilities.

### Key Deliverables

1. **Translation Management Page** (`/src/app/dashboard2/translations/page.tsx`)
2. **Data Table Component** with sortable columns and row selection
3. **Filter Bar** with Type, Language, and Status dropdowns
4. **Bulk Selection Support** integrating with BulkTranslationBar
5. **Navigation Integration** adding "Translations" to dashboard nav

---

## Request Details

### From gen_requests_epic5.md (REQ-323)

**Type:** NEW FEATURE
**Size:** L (Large)
**Date:** 2026-01-18

### Current Behavior

No centralized translation management interface exists. Property owners managing multilingual content must navigate to individual items, properties, or FAQ sections to check translation status and perform translation operations. There is no unified view showing all translatable content across different entity types in one place.

### Expected Behavior

The Translation Management page displays a full-width data table showing all translatable content belonging to the authenticated user's account. Key features include:

- **Table Display:** Each row represents one translatable entity (item, article, or link)
- **Columns:** Entity name, entity type, translation status indicators for all six languages, action controls
- **Filter Bar:** Dropdowns to filter by content type, specific language, and translation status
- **Bulk Selection:** Checkboxes for multi-item operations via BulkTranslationBar
- **Click Interaction:** Clicking translation status column opens TranslationPreviewPanel
- **Sorting:** By entity name, type, and overall translation completion percentage
- **Pagination:** When content exceeds one page, with configurable items per page

---

## Dependencies

### Epic 1 (Foundation) Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| Translation tables | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | **REQUIRED** - Tables exist |
| Translation jobs table | `translation_jobs` | **REQUIRED** - Table exists |
| Translation status enum | `pending`, `processing`, `completed`, `failed`, `manual` | **REQUIRED** - Defined |
| Source language columns | `items.source_language`, `item_articles.source_language`, `item_links.source_language` | **REQUIRED** - Columns exist |

### Epic 3 (Dynamic Content Translation) Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Translation trigger system | Queue re-translation jobs | **REQUIRED** |
| Translation status API | `GET /api/translations/status` | **REQUIRED** |

### Epic 5 Phase Dependencies (Must Complete Before REQ-323)

| Task | Component | Status |
|------|-----------|--------|
| 1.1 | Translation Status API endpoint | **REQUIRED** |
| 2.1 | TranslationManagement types file | **REQUIRED** |
| 3.2 | TranslationStatusColumn component | **REQUIRED** |
| 3.3 | TranslationStatusFilter component | **REQUIRED** |
| 4.1 | BulkTranslationBar component | **REQUIRED** |
| 4.2 | LanguageSelectorDialog component | **REQUIRED** |

### Component Dependencies

| Component | Location | Purpose |
|-----------|----------|---------|
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Compact language status display in table rows |
| TranslationStatusFilter | `/src/components/TranslationManagement/TranslationStatusFilter/` | Status filter dropdown |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk actions when items selected |
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Slide-in panel for translation details |
| useTranslationStatus | `/src/hooks/useTranslationStatus.ts` | Data fetching hook |
| useTranslationRealtime | `/src/hooks/useTranslationRealtime.ts` | Real-time subscription hook |

---

## Technical Investigation

### Existing Patterns to Follow

#### 1. Dashboard Layout Pattern

**File:** `/src/app/dashboard2/layout.tsx`

Navigation structure follows NavItem interface:
```typescript
interface NavItem {
  name: string;
  mobileLabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
```

Add new navigation item:
```typescript
import { Languages } from 'lucide-react';

// Add to navigationItems array
{
  name: 'Translations',
  mobileLabel: 'Trans.',
  href: '/dashboard2/translations',
  icon: Languages,
}
```

#### 2. ItemManager Table/List Pattern

**File:** `/src/components/ItemManager/components/ItemList.tsx`

Key patterns:
- **SortableColumnHeader:** Reusable sortable column component with ascending/descending toggle
- **Checkbox selection:** Per-row checkbox with "select all" header
- **Row actions:** MoreVertical menu with edit/delete options
- **Responsive design:** Mobile-first with hidden columns on small screens

#### 3. Filter Panel Pattern

**File:** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`

Filter architecture:
```typescript
interface FilterState {
  search?: string;
  contentTypes?: string[];
  tags?: string[];
  // ... other filters
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  // ... other props
}
```

#### 4. State Management Pattern

**File:** `/src/components/ItemManager/hooks/useItemManagerState.ts`

Uses useReducer for complex state:
```typescript
const [state, dispatch] = useReducer(reducer, config, createInitialState);
```

Action types for translation page:
- `SET_VIEW_MODE`
- `SET_SEARCH_QUERY`
- `SET_FILTERS`
- `CLEAR_FILTERS`
- `SET_SORT`
- `TOGGLE_SELECTION`
- `SELECT_ALL`
- `CLEAR_SELECTION`

#### 5. Bulk Selection Pattern

**File:** `/src/components/ItemManager/hooks/useItemSelection.ts`

Selection state with Set<string>:
```typescript
interface SelectionState {
  selectedIds: Set<string>;
  isSelectionMode: boolean;
}
```

---

## Database Schema Context

### Translation Tables (from Supabase)

#### item_translations
```sql
- item_id: uuid (FK to items.id)
- language: varchar (en, fr, es, de, nl, it)
- name: varchar
- description: text (nullable)
- translated_at: timestamptz
- translation_status: varchar ('pending', 'processing', 'completed', 'failed', 'manual')
- created_at, updated_at: timestamptz
```

#### article_translations
```sql
- article_id: uuid (FK to item_articles.id)
- language: varchar (en, fr, es, de, nl, it)
- title: varchar
- description: text (nullable)
- translated_at: timestamptz
- reviewed_by: uuid (FK to users.id)
- translation_status: varchar
- created_at, updated_at: timestamptz
```

#### link_translations
```sql
- link_id: uuid (FK to item_links.id)
- language: varchar (en, fr, es, de, nl, it)
- title: varchar
- translated_at: timestamptz
- translation_status: varchar
- created_at, updated_at: timestamptz
```

### Source Language Columns

All source entities have:
- `items.source_language` (default 'en')
- `item_articles.source_language` (default 'en')
- `item_links.source_language` (default 'en')

### Supported Languages

Six languages are supported (defined in schema CHECK constraints):
- `en` - English (default)
- `fr` - French
- `es` - Spanish
- `de` - German
- `nl` - Dutch
- `it` - Italian

---

## Implementation Tasks

### Task 4.3.1: Create Translation Management Page Structure

**File:** `/src/app/dashboard2/translations/page.tsx`

**Steps:**
1. Create page directory and file
2. Implement 'use client' directive and imports
3. Add authentication check (useAuth)
4. Set up property context integration (usePropertyContext)
5. Initialize state management hook
6. Add page container with proper heading and description

**Estimated Effort:** 0.5 story points

### Task 4.3.2: Implement Translation Data Fetching

**Steps:**
1. Use `useTranslationStatus` hook for initial data fetch
2. Integrate `useTranslationRealtime` for live updates
3. Handle loading, error, and empty states
4. Filter data by selected property from PropertyContext
5. Implement data transformation for table display

**Estimated Effort:** 1 story point

### Task 4.3.3: Build Filter Bar Component

**File:** `/src/app/dashboard2/translations/page.tsx` (inline or extract to component)

**Filter Options:**
```typescript
interface TranslationFilters {
  type: 'all' | 'item' | 'article' | 'link';
  language: 'all' | 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
  status: 'all' | 'complete' | 'partial' | 'pending' | 'failed' | 'manual';
}
```

**UI Pattern (following FilterPanel):**
- Horizontal flex container above table
- Three dropdown selects: Type, Language, Status
- Clear filters button when any filter is active
- Result count indicator

**Estimated Effort:** 1 story point

### Task 4.3.4: Build Data Table Structure

**Columns:**
1. **Selection checkbox** (fixed width 40px)
2. **Entity Name** (flex-grow, sortable)
3. **Type** (fixed width 80px, sortable) - Item/Article/Link badge
4. **EN Status** (fixed width 44px) - Language indicator
5. **FR Status** (fixed width 44px) - Language indicator
6. **ES Status** (fixed width 44px) - Language indicator
7. **DE Status** (fixed width 44px) - Language indicator
8. **NL Status** (fixed width 44px) - Language indicator
9. **IT Status** (fixed width 44px) - Language indicator
10. **Actions** (fixed width 48px) - MoreVertical menu

**Row Structure:**
```typescript
interface TranslationTableRow {
  id: string;
  entityType: 'item' | 'article' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: TranslationStatus;
      translatedAt?: string;
      isManual?: boolean;
    };
  };
  completionPercent: number; // 0-100 for sorting
}
```

**Estimated Effort:** 2 story points

### Task 4.3.5: Implement Row Selection & Bulk Actions

**Steps:**
1. Add checkbox column with select-all in header
2. Track selected row IDs with Set<string>
3. Show BulkTranslationBar when selection count > 0
4. Wire up bulk re-translate actions
5. Clear selection after bulk operation completes

**Estimated Effort:** 1 story point

### Task 4.3.6: Add TranslationStatusColumn Click Handling

**Steps:**
1. Make language columns clickable
2. Track which entity is being previewed
3. Open TranslationPreviewPanel on click
4. Pass entity data to panel
5. Handle panel close event

**Estimated Effort:** 0.5 story points

### Task 4.3.7: Implement Sorting

**Sortable Columns:**
- Entity Name (A-Z, Z-A)
- Type (alphabetical)
- Completion Percent (highest first, lowest first)

**Sort State:**
```typescript
type SortOption =
  | 'name-asc' | 'name-desc'
  | 'type-asc' | 'type-desc'
  | 'completion-asc' | 'completion-desc';
```

**Estimated Effort:** 0.5 story points

### Task 4.3.8: Implement Pagination

**Steps:**
1. Add pagination state (page, pageSize)
2. Calculate total pages from filtered data
3. Implement page navigation controls
4. Add page size selector (10, 25, 50, 100)
5. Show "Showing X-Y of Z items" text

**Pagination Component Pattern:**
```tsx
<div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
  <div className="text-sm text-gray-700">
    Showing <span className="font-medium">{startIdx + 1}</span> to{' '}
    <span className="font-medium">{Math.min(endIdx, totalCount)}</span> of{' '}
    <span className="font-medium">{totalCount}</span> results
  </div>
  <div className="flex items-center gap-2">
    <button disabled={page === 1} onClick={() => setPage(1)}>First</button>
    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
    <span>Page {page} of {totalPages}</span>
    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
    <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>Last</button>
  </div>
</div>
```

**Estimated Effort:** 1 story point

### Task 4.3.9: Add Loading and Empty States

**Loading State:**
- Skeleton loader for table rows
- Preserve filter bar visibility
- Disable interactions during load

**Empty States:**
1. **No content exists:** "No translatable content found. Create items to start managing translations."
2. **No filter matches:** "No content matches your filters. Try adjusting your search criteria."

**Estimated Effort:** 0.5 story points

### Task 4.3.10: Add Navigation Link

**File:** `/src/app/dashboard2/layout.tsx`

**Steps:**
1. Import Languages icon from lucide-react
2. Add navigation item to navigationItems array
3. Position after Properties in navigation order

**Estimated Effort:** 0.25 story points

### Task 4.3.11: Implement Accessibility

**Requirements:**
- Keyboard navigation for all interactive elements
- ARIA labels for status indicators
- Focus management when opening/closing panels
- Screen reader announcements for selection changes
- Skip link to main content

**Estimated Effort:** 0.5 story points

### Task 4.3.12: Responsive Design

**Breakpoint Adjustments:**
- **Desktop (>1024px):** Full table with all columns
- **Tablet (768-1024px):** Hide some language columns, collapse to compact view
- **Mobile (<768px):** Card-based layout instead of table, stacked filters

**Estimated Effort:** 1 story point

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/translations/page.tsx` | Main translation management page |

### Existing Files to Modify

| File Path | Changes | Functions/Sections |
|-----------|---------|-------------------|
| `/src/app/dashboard2/layout.tsx` | Add Translations nav item | `navigationItems` array |

### Component Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Import and use in table rows |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Import and use in filter bar |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Import and render when items selected |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Import and render on row click |
| `/src/hooks/useTranslationStatus.ts` | Import for data fetching |
| `/src/hooks/useTranslationRealtime.ts` | Import for live updates |
| `/src/contexts/PropertyContext.tsx` | Use for property filtering |
| `/src/contexts/AuthContext.tsx` | Use for authentication |

---

## Component Architecture

### Page Component Structure

```
TranslationsPage
├── Header Section
│   ├── Page Title: "Translation Management"
│   └── Page Description
│
├── Filter Bar
│   ├── TypeFilter (dropdown)
│   ├── LanguageFilter (dropdown)
│   ├── StatusFilter (dropdown)
│   ├── Clear Filters Button
│   └── Result Count
│
├── Translation Table
│   ├── Table Header
│   │   ├── Select All Checkbox
│   │   ├── Name (Sortable)
│   │   ├── Type (Sortable)
│   │   ├── EN | FR | ES | DE | NL | IT (Status columns)
│   │   └── Actions
│   │
│   └── Table Body
│       └── TranslationTableRow (for each entity)
│           ├── Selection Checkbox
│           ├── Entity Name
│           ├── Type Badge
│           ├── TranslationStatusColumn (clickable)
│           └── Actions Menu
│
├── Pagination Controls
│   ├── Page Info ("Showing X-Y of Z")
│   ├── Page Navigation
│   └── Page Size Selector
│
├── BulkTranslationBar (conditional, when items selected)
│
└── TranslationPreviewPanel (conditional, on status column click)
```

### State Shape

```typescript
interface TranslationsPageState {
  // Data
  entities: TranslationTableRow[];
  isLoading: boolean;
  error: Error | null;

  // Filters
  filters: {
    type: 'all' | 'item' | 'article' | 'link';
    language: 'all' | SupportedLanguage;
    status: 'all' | 'complete' | 'partial' | 'pending' | 'failed' | 'manual';
  };

  // Sorting
  sortBy: SortOption;

  // Pagination
  page: number;
  pageSize: number;

  // Selection
  selectedIds: Set<string>;

  // Preview Panel
  previewEntity: TranslationTableRow | null;
  isPreviewOpen: boolean;
}
```

---

## Integration Contracts

### API Endpoints Used

#### GET /api/translations/status

**Request:**
```typescript
GET /api/translations/status?propertyId={propertyId}&entityType={entityType}&status={status}
```

**Response:**
```typescript
interface TranslationStatusResponse {
  summary: {
    total: number;
    complete: number;
    partial: number;
    pending: number;
    failed: number;
  };
  items: TranslationStatusItem[];
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}
```

### Component Props Interfaces

#### TranslationStatusColumn (from REQ-317)
```typescript
interface TranslationStatusColumnProps {
  translations: {
    [K in SupportedLanguage]?: {
      status: TranslationStatus;
      isManual?: boolean;
    };
  };
  onClick: () => void;
  className?: string;
}
```

#### TranslationStatusFilter (from REQ-318)
```typescript
interface TranslationStatusFilterProps {
  value: TranslationFilterStatus;
  onChange: (value: TranslationFilterStatus) => void;
  className?: string;
}
```

#### BulkTranslationBar (from REQ-321)
```typescript
interface BulkTranslationBarProps {
  selectedCount: number;
  onRetranslateAll: () => Promise<void>;
  onRetranslateLanguage: (languages: SupportedLanguage[]) => Promise<void>;
  onDismiss: () => void;
  loading?: boolean;
  className?: string;
}
```

#### TranslationPreviewPanel (from REQ-310)
```typescript
interface TranslationPreviewPanelProps {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  sourceLanguage: SupportedLanguage;
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onTranslationEdited?: (language: SupportedLanguage) => void;
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready (REQ-304) | Medium | High | Create mock data layer for development; feature flag to hide until API ready |
| TranslationStatusColumn not implemented | Medium | High | Use placeholder colored dots; implement basic version inline if needed |
| Performance with large datasets | Low | Medium | Implement pagination server-side; add virtual scrolling if needed |
| Mobile responsiveness issues | Medium | Medium | Start with desktop, iterate on mobile; consider card layout fallback |
| Realtime subscription failures | Low | Low | Fall back to polling; add manual refresh button |

---

## Acceptance Criteria Checklist

From REQ-323 in gen_requests_epic5.md:

- [ ] Page renders at dashboard route `/dashboard2/translations` showing full-width table layout
- [ ] Table displays all translatable entities owned by authenticated user's account
- [ ] Table columns include entity name, entity type, translation status for each of six languages, and action controls
- [ ] Translation status column uses TranslationStatusColumn component showing visual indicators per language
- [ ] Filter bar appears above table offering type, language, and status filter dropdowns
- [ ] Type filter allows selection of specific entity types or all types
- [ ] Language filter allows selection of specific language or all languages
- [ ] Status filter allows selection by translation completion state
- [ ] Applying filters immediately updates table to show only matching content
- [ ] Table supports row selection via checkboxes for bulk operations
- [ ] Selecting one or more rows activates BulkTranslationBar with bulk action controls
- [ ] Clicking translation status column in any row opens TranslationPreviewPanel for that entity
- [ ] Table supports sorting by entity name, type, and overall translation completion
- [ ] Pagination controls appear when content exceeds page size threshold
- [ ] Page size selector allows choosing items per page
- [ ] Loading state displays during initial data fetch and filter changes
- [ ] Empty state displays when no translatable content exists
- [ ] Empty state displays when active filters match no content
- [ ] Page is responsive and usable on tablet and desktop viewports
- [ ] Page is keyboard accessible with proper focus management for all interactive controls
- [ ] Page only displays content belonging to authenticated user's account
- [ ] Unauthorized users are redirected to appropriate error or login page

---

## References

- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-323)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Related Epic 1 Documentation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **ItemManager Pattern Reference:** `/src/components/ItemManager/`
- **Dashboard Layout:** `/src/app/dashboard2/layout.tsx`

---

*End of Implementation Breakdown Document*
