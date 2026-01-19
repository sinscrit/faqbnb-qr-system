# REQ-354: Create Translation Management Page - Implementation Overview

**Document Created:** 2026-01-19 23:45 UTC
**Last Modified:** 2026-01-19 23:45 UTC
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.3
**Size:** L (Large)

---

## 1. Summary

Create a centralized Translation Management page at `/dashboard2/translations` where property owners can view, filter, and manage translations for all their content (items, articles, and links) across all six supported languages in a unified interface.

---

## 2. Current Behavior

- No dedicated translation management interface exists
- Translation status is not visible at a glance across all content
- Owners cannot filter or search content by translation status
- Bulk translation operations require manual processing of individual items
- No way to see which content is fully translated, partially translated, pending, or failed

---

## 3. Expected Behavior

- Full-width responsive table displaying all translatable content (items, articles, links)
- Each row shows: content name, content type badge, language status indicators (6 dots/icons), and action menu
- Filter bar with Type (Item/Article/Link), Language (6 options), and Status (All/Complete/Partial/Pending/Failed/Manual) filters
- Checkbox selection on each row for bulk operations
- "Select All" checkbox in table header selects all visible (filtered) rows
- BulkTranslationBar appears when items are selected, offering Re-translate actions
- Clicking a row or "View" action opens TranslationPreviewPanel for detailed translation view
- Real-time status updates via Supabase Realtime subscriptions
- Page integrates with existing dashboard layout and navigation

---

## 4. Dependencies

### Epic Dependencies
- **Epic 1 (Foundation):** Translation tables (`article_translations`, `item_translations`, `link_translations`, `tag_translations`, `translation_jobs`), RLS policies, translation service
- **Epic 3 (Dynamic Content Translation):** Translation trigger system, status tracking, job processor

### Component Dependencies (from prior Epic 5 tasks)
- **Task 1.1:** Translation Status API (`/api/translations/status/route.ts`) - required for fetching status data
- **Task 2.1:** `TranslationManagement.types.ts` - shared type definitions
- **Task 3.2:** `TranslationStatusColumn` - compact status indicator for table columns
- **Task 3.3:** `TranslationStatusFilter` - filter dropdown component
- **Task 4.1:** `BulkTranslationBar` - floating action bar for bulk operations
- **Task 4.2:** `LanguageSelectorDialog` - language picker for bulk re-translate

### Existing Codebase Patterns
- Dashboard layout: `/src/app/dashboard2/layout.tsx`
- Table/List patterns: `/src/components/ItemManager/components/ItemList.tsx`
- Filter panel: `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- Bulk actions: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- Locale types: `/src/contexts/LocaleContext.tsx` (SupportedLanguage)
- Translation types: `/src/lib/translation-service/translation-service.types.ts`

---

## 5. Technical Approach

### Page Structure
The Translation Management page will be a client component using the existing dashboard layout. It will:

1. Fetch all translatable content (items, articles, links) for the authenticated user
2. Display content in a responsive table with sortable columns
3. Implement client-side filtering with URL query parameter sync for shareable filter states
4. Use Supabase Realtime for live translation status updates
5. Integrate with BulkTranslationBar for multi-item operations

### Data Fetching Strategy
- Use the Translation Status API (`GET /api/translations/status`) with filters
- Aggregate data from multiple translation tables
- Join with parent entity tables for names/titles
- Filter by authenticated user's owned properties

### Filter Implementation
Three filter categories:
1. **Type Filter:** Dropdown with options: All, Items, Articles, Links
2. **Language Filter:** Multi-select for 6 languages (en, fr, es, de, nl, it)
3. **Status Filter:** Dropdown with: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited

### Table Columns
| Column | Description | Width |
|--------|-------------|-------|
| Checkbox | Selection for bulk operations | 40px |
| Name | Content name/title with type badge | flex |
| Type | Item/Article/Link badge | 80px |
| EN | English status indicator | 40px |
| FR | French status indicator | 40px |
| ES | Spanish status indicator | 40px |
| DE | German status indicator | 40px |
| NL | Dutch status indicator | 40px |
| IT | Italian status indicator | 40px |
| Actions | Menu with View/Re-translate/Edit | 60px |

### Status Indicators (per language)
- `●` Blue (text-blue-500): Original/Source language
- `✓` Green (text-green-500): Completed
- `✎` Purple (text-violet-500): Manually edited
- `⏳` Orange (text-amber-500): Pending/Processing
- `❌` Red (text-red-500): Failed

### State Management
```typescript
interface TranslationManagementState {
  // Data
  items: TranslationStatusItem[];
  isLoading: boolean;
  error: string | null;

  // Filters
  typeFilter: 'all' | 'item' | 'article' | 'link';
  languageFilter: SupportedLanguage[];
  statusFilter: 'all' | 'complete' | 'partial' | 'pending' | 'failed' | 'manual';
  searchQuery: string;

  // Selection
  selectedIds: Set<string>;
  isSelectAll: boolean;

  // Preview panel
  previewEntityType: 'article' | 'item' | 'link' | null;
  previewEntityId: string | null;
  isPreviewOpen: boolean;
}
```

---

## 6. Ordered Implementation Tasks

### Task 1: Create page file structure and basic layout
- Create `/src/app/dashboard2/translations/page.tsx`
- Add page metadata and 'use client' directive
- Implement basic layout with header, filter bar placeholder, table placeholder
- Add loading state
- **Acceptance:** Page renders at /dashboard2/translations with header

### Task 2: Implement data fetching hook
- Create custom hook `useTranslationManagement` or extend `useTranslationStatus`
- Fetch from `/api/translations/status` with property filter
- Handle loading, error, and success states
- Parse and normalize response data
- **Acceptance:** Console log shows fetched translation status data

### Task 3: Build table structure with static columns
- Create table element with proper semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- Add column headers with checkbox in header
- Implement responsive layout (horizontal scroll on mobile)
- Style with Tailwind matching existing dashboard patterns
- **Acceptance:** Table displays with headers and empty state message

### Task 4: Implement table row rendering
- Map fetched data to table rows
- Display content name with truncation
- Add type badge (Item/Article/Link)
- Render checkbox for each row
- **Acceptance:** Rows display content names and types

### Task 5: Integrate TranslationStatusColumn for language indicators
- Import TranslationStatusColumn component (from Task 3.2)
- Render 6 language columns per row with status indicators
- Apply color-coded status icons per spec
- **Acceptance:** Language status indicators display correctly

### Task 6: Implement row selection logic
- Add selection state management
- Handle individual row checkbox clicks
- Implement Select All/Deselect All in header
- Highlight selected rows with background color
- **Acceptance:** Rows can be selected/deselected, count updates

### Task 7: Build filter bar component
- Create horizontal filter bar above table
- Add Type filter dropdown
- Add Language multi-select filter (or use TranslationStatusFilter)
- Add Status filter dropdown
- Add search input for content name filtering
- **Acceptance:** Filters render and show selected values

### Task 8: Connect filters to data
- Implement client-side filtering logic
- Filter by type, language status, overall status
- Filter by search query (name/title)
- Update displayed results count
- **Acceptance:** Filtering works correctly on all criteria

### Task 9: Integrate BulkTranslationBar
- Import BulkTranslationBar component (from Task 4.1)
- Show bar when selectedCount > 0
- Connect Re-translate actions to API
- Show loading state during bulk operations
- Clear selection after successful operation
- **Acceptance:** Bulk bar appears with selection, actions work

### Task 10: Add row actions menu
- Add actions column with dropdown/icon button
- Include: "View Translations", "Re-translate All", "Re-translate Failed"
- Wire up handlers for each action
- **Acceptance:** Actions menu works for individual rows

### Task 11: Integrate TranslationPreviewPanel
- Import TranslationPreviewPanel component (from Task 2.2)
- Open panel when "View Translations" clicked
- Pass entity type, ID, and source content
- Handle close event
- **Acceptance:** Preview panel opens with correct content

### Task 12: Add Supabase Realtime subscription
- Subscribe to translation table changes
- Update specific row status on change events
- Show visual feedback on status change
- Cleanup subscription on unmount
- **Acceptance:** Real-time updates appear without page refresh

### Task 13: Add empty state handling
- Design empty state for no content
- Design empty state for no filter results
- Add helpful message and action buttons
- **Acceptance:** Appropriate empty states display

### Task 14: Add URL query parameter sync
- Sync filter state to URL params
- Parse URL params on page load
- Enable shareable filtered views
- **Acceptance:** Filters persist in URL, can be shared

### Task 15: Add accessibility features
- Add proper ARIA labels to table and filters
- Ensure keyboard navigation works
- Add screen reader announcements for status changes
- Test with keyboard-only navigation
- **Acceptance:** Page is accessible per WCAG 2.1 AA

### Task 16: Add loading and error states
- Show skeleton loader during initial load
- Display error message with retry button on failure
- Show inline loading for filter changes
- **Acceptance:** Loading/error states display appropriately

---

## 7. Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/translations/page.tsx` | Main Translation Management page component |

### Files to Modify
| File Path | Modification Purpose |
|-----------|---------------------|
| `/src/app/dashboard2/layout.tsx` | Add "Translations" navigation item (see Task 4.4 - separate from this task but related) |

### Components to Import/Integrate
| Component | Source Location | Usage |
|-----------|-----------------|-------|
| TranslationStatusColumn | `/src/components/TranslationManagement/TranslationStatusColumn/` | Language status indicators |
| TranslationStatusFilter | `/src/components/TranslationManagement/TranslationStatusFilter/` | Status filter dropdown |
| BulkTranslationBar | `/src/components/TranslationManagement/BulkTranslationBar/` | Bulk action bar |
| LanguageSelectorDialog | `/src/components/TranslationManagement/BulkTranslationBar/` | Language picker dialog |
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Slide-out preview |

### API Endpoints to Use
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/translations/status` | GET | Fetch translation status list |
| `/api/translations/retranslate` | POST | Trigger re-translation jobs |

### Hooks to Use/Create
| Hook | Purpose |
|------|---------|
| `useTranslationStatus` | Fetch translation status (from Task 2.6) |
| `useTranslationRealtime` | Realtime subscription (from Task 2.7) |
| `useAuth` | Authentication context |
| `usePropertyContext` | Property selection context |

---

## 8. UI Specifications

### Page Layout
```
┌────────────────────────────────────────────────────────────────────┐
│ Translation Management                                              │
├────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ [Search...    ] [Type ▼] [Languages ▼] [Status ▼] [Clear All]│   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Showing 42 of 156 items                                            │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────────┤
│ │ ☐ │ Name                    │Type   │EN│FR│ES│DE│NL│IT│Actions │ │
│ ├───┼─────────────────────────┼───────┼──┼──┼──┼──┼──┼──┼────────┤ │
│ │ ☐ │ How to Use Dishwasher   │Article│● │✓ │✓ │⏳│✓ │❌│  ⋮     │ │
│ │ ☐ │ Coffee Machine          │Item   │● │✓ │✓ │✓ │✓ │✓ │  ⋮     │ │
│ │ ☑ │ WiFi Password Card      │Item   │● │✓ │⏳│⏳│⏳│⏳│  ⋮     │ │
│ │ ☑ │ Safety Instructions     │Article│● │✎ │✓ │✓ │❌│✓ │  ⋮     │ │
│ │ ☐ │ YouTube Tutorial        │Link   │● │✓ │✓ │✓ │✓ │✓ │  ⋮     │ │
│ └──────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ ✓ 2 selected    [Re-translate All] [Re-translate Failed]  ✕ │   │
│ └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Color Palette (Status Icons)
| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Original/Source | ● | Blue | `text-blue-500` |
| Completed | ✓ | Green | `text-green-500` |
| Manual Edit | ✎ | Purple | `text-violet-500` |
| Pending/Processing | ⏳ | Orange | `text-amber-500` |
| Failed | ❌ | Red | `text-red-500` |

### Type Badges
| Type | Badge Color | Tailwind Classes |
|------|-------------|-----------------|
| Item | Blue | `bg-blue-100 text-blue-800` |
| Article | Green | `bg-green-100 text-green-800` |
| Link | Purple | `bg-purple-100 text-purple-800` |

---

## 9. Type Definitions

```typescript
// From TranslationManagement.types.ts
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

type TranslationTypeFilter = 'all' | 'item' | 'article' | 'link';
type TranslationStatusFilter = 'all' | 'complete' | 'partial' | 'pending' | 'failed' | 'manual';

interface TranslationManagementFilters {
  type: TranslationTypeFilter;
  languages: SupportedLanguage[];
  status: TranslationStatusFilter;
  search: string;
}
```

---

## 10. Testing Considerations

### Unit Tests
- Filter logic functions (type, language, status, search)
- Selection logic (select, deselect, select all)
- Status aggregation (determine if row is complete/partial/etc.)

### Integration Tests
- Page renders with mock data
- Filters update displayed content
- Selection triggers BulkTranslationBar
- Actions menu triggers correct handlers

### E2E Scenarios
- Navigate to /dashboard2/translations
- Apply filters and verify results
- Select multiple items and perform bulk action
- Click row to open preview panel
- Verify real-time status updates (if testable)

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large dataset performance | Medium | Medium | Implement pagination, virtual scrolling for 100+ items |
| Component dependencies not ready | Medium | High | Use stub components initially, integrate when available |
| Realtime subscription issues | Low | Low | Fallback to manual refresh button |
| Complex filter combinations | Low | Medium | Thorough testing of filter interactions |

---

## 12. Acceptance Criteria (from PRD)

- [ ] Page accessible at /dashboard2/translations route requiring authenticated owner access
- [ ] Table displays all content items, articles, and links owned by the current authenticated user
- [ ] Each table row shows content name, content type, and individual status indicators for all six supported languages
- [ ] Filter bar includes dropdowns or multi-select controls for Type, Language, and Status filtering
- [ ] Applied filters update the table content dynamically without full page reload
- [ ] Table rows support individual selection via checkbox with visual indication of selected state
- [ ] Bulk selection control in table header selects or deselects all visible rows
- [ ] Bulk action bar appears when one or more rows are selected, offering relevant translation operations
- [ ] Each row includes an actions menu or buttons providing access to translation preview, editing, or retranslation

---

## 13. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic Request Document: `/docs/gen_requests_epic5.md` (REQ-354)
- Dashboard Layout Pattern: `/src/app/dashboard2/layout.tsx`
- Table/List Pattern: `/src/components/ItemManager/components/ItemList.tsx`
- Filter Panel Pattern: `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- Bulk Actions Pattern: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- Locale Types: `/src/contexts/LocaleContext.tsx`

---

*Document generated as part of FAQBNB L10N Epic 5 implementation pipeline*
