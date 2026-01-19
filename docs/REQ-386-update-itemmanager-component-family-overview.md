# REQ-386: Update ItemManager Component Family for Localization - Implementation Overview
*Generated: 2026-01-19 00:00:00 UTC*
*Last Modified: 2026-01-19 00:00:00 UTC*

## Reference
- **Request**: REQ-386 (Update ItemManager Component Family)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement (Localization)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2D - Item Management
- **Task ID**: 2D.2
- **Size**: L (Large)
- **Priority**: Seventh (per recommended order in Plan-111)

## Goals
1. Internationalize all ItemManager components to support multilingual item management experiences
2. Replace all hardcoded English strings with next-intl translation calls
3. Support 6 languages: English, French, Spanish, German, Dutch, Italian
4. Maintain backward compatibility with existing component interfaces
5. Ensure accessibility features (ARIA labels) are properly translated
6. Enable consistent user experience across all item management workflows

## Context from Implementation Plan

### Sub-Epic 2D Scope (Per Plan-111)
Sub-Epic 2D focuses on Item Management components:
- **Estimated Strings**: ~400
- **Priority**: Seventh in recommended order
- **Components**: 50+ files in ItemManager family
- **Prerequisite**: REQ-385 (items namespace structure)

### Current State Analysis

The ItemManager component family currently:
- Has all text hardcoded in English across 50+ component files
- Uses a partial `labels` configuration pattern in some components (ItemManager.tsx, FilterPanel.tsx, SortMenu.tsx)
- Contains hardcoded strings in utility constants (e.g., `SORT_OPTIONS` in constants.ts)
- Has inconsistent localization patterns across different component categories

### Target State
All ItemManager components will:
- Use `useTranslations('items')` hook to access translation keys
- Render all user-visible text from `/messages/*.json` files
- Support dynamic pluralization using ICU format
- Translate all accessibility attributes (aria-label, title, placeholder)
- Follow established translation key patterns from REQ-385

## Codebase Analysis

### Component Inventory (50+ Files)

#### Core Components (7 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| ItemManager.tsx | `/src/components/ItemManager/ItemManager.tsx` | ~15 | HIGH |
| ItemToolbar.tsx | `.../components/ItemToolbar.tsx` | ~12 | HIGH |
| SearchInput.tsx | `.../components/SearchInput.tsx` | ~3 | MEDIUM |
| ItemCard.tsx | `.../components/ItemCard.tsx` | ~10 | HIGH |
| ItemRow.tsx | `.../components/ItemRow.tsx` | ~8 | HIGH |
| ItemGrid.tsx | `.../components/ItemGrid.tsx` | ~5 | MEDIUM |
| ItemList.tsx | `.../components/ItemList.tsx` | ~8 | MEDIUM |

#### Dialog Components (9 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| ConfirmDeleteDialog.tsx | `.../dialogs/ConfirmDeleteDialog.tsx` | ~10 | HIGH |
| FilterPanel.tsx | `.../dialogs/FilterPanel.tsx` | ~12 | HIGH |
| SortMenu.tsx | `.../dialogs/SortMenu.tsx` | ~8 | MEDIUM |
| ContentTypeFilter.tsx | `.../dialogs/ContentTypeFilter.tsx` | ~5 | MEDIUM |
| TagFilter.tsx | `.../dialogs/TagFilter.tsx` | ~5 | MEDIUM |
| LocationFilter.tsx | `.../dialogs/LocationFilter.tsx` | ~5 | MEDIUM |
| PropertyFilter.tsx | `.../dialogs/PropertyFilter.tsx` | ~5 | MEDIUM |
| ColumnSettingsPopup.tsx | `.../dialogs/ColumnSettingsPopup.tsx` | ~8 | LOW |

#### Bulk Action Components (4 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| BulkActionsBar.tsx | `.../BulkActions/BulkActionsBar.tsx` | ~12 | HIGH |
| BulkTagDialog.tsx | `.../BulkActions/BulkTagDialog.tsx` | ~10 | HIGH |
| BulkMoveDialog.tsx | `.../BulkActions/BulkMoveDialog.tsx` | ~10 | HIGH |
| index.ts | `.../BulkActions/index.ts` | 0 | N/A |

#### Shared Components (11 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| EmptyState.tsx | `.../shared/EmptyState.tsx` | ~4 | HIGH |
| LoadingState.tsx | `.../shared/LoadingState.tsx` | ~3 | MEDIUM |
| ViewModeToggle.tsx | `.../shared/ViewModeToggle.tsx` | ~4 | MEDIUM |
| InlineEdit.tsx | `.../shared/InlineEdit.tsx` | ~6 | MEDIUM |
| TagsInlineEdit.tsx | `.../shared/TagsInlineEdit.tsx` | ~6 | MEDIUM |
| TagChip.tsx | `.../shared/TagChip.tsx` | ~2 | LOW |
| VisitCountBadge.tsx | `.../shared/VisitCountBadge.tsx` | ~4 | MEDIUM |
| ReactionSummary.tsx | `.../shared/ReactionSummary.tsx` | ~4 | MEDIUM |
| EngagementIndicator.tsx | `.../shared/EngagementIndicator.tsx` | ~4 | MEDIUM |
| TouchButton.tsx | `.../shared/TouchButton.tsx` | 0 | N/A |
| BottomSheet.tsx | `.../shared/BottomSheet.tsx` | ~2 | LOW |

#### Asset Panel Components (6 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| AssetPanel.tsx | `.../AssetPanel/AssetPanel.tsx` | ~8 | MEDIUM |
| AssetDropZone.tsx | `.../AssetPanel/AssetDropZone.tsx` | ~6 | MEDIUM |
| AssetItem.tsx | `.../AssetPanel/AssetItem.tsx` | ~4 | MEDIUM |
| SortableAssetList.tsx | `.../AssetPanel/SortableAssetList.tsx` | ~2 | LOW |
| AssetRemoveConfirmDialog.tsx | `.../AssetPanel/AssetRemoveConfirmDialog.tsx` | ~6 | MEDIUM |

#### Preview Components (8 files)
| Component | Location | Hardcoded Strings | Priority |
|-----------|----------|-------------------|----------|
| ItemPreviewModal.tsx | `.../ItemPreview/ItemPreviewModal.tsx` | ~10 | HIGH |
| MediaGallery.tsx | `.../ItemPreview/MediaGallery.tsx` | ~6 | MEDIUM |
| VideoPlayer.tsx | `.../ItemPreview/VideoPlayer.tsx` | ~4 | LOW |
| InstructionsViewer.tsx | `.../ItemPreview/InstructionsViewer.tsx` | ~4 | MEDIUM |
| AnalyticsSection.tsx | `.../ItemPreview/AnalyticsSection.tsx` | ~8 | MEDIUM |
| PhotoViewer.tsx | `.../viewers/PhotoViewer.tsx` | ~2 | LOW |
| PDFViewer.tsx | `.../viewers/PDFViewer.tsx` | ~2 | LOW |

#### Utility Files (1 file with strings)
| File | Location | Hardcoded Strings | Priority |
|------|----------|-------------------|----------|
| constants.ts | `.../utils/constants.ts` | ~9 (SORT_OPTIONS) | HIGH |

### Identified Hardcoded String Categories

Based on component analysis, the following string categories need translation:

1. **Toolbar Controls** (~20 strings)
   - View mode toggles: "Grid view", "List view"
   - Search placeholder: "Search items..."
   - Filter indicators: "Clear filters", "X filters active"
   - Selection count: "X selected", "Select all"

2. **Action Labels** (~15 strings)
   - "Delete", "Edit", "Save", "Cancel"
   - "Add Tag", "Remove Tag"
   - "Move to Property"
   - "Processing...", "Deleting..."

3. **Dialog Content** (~30 strings)
   - Confirmation titles: "Delete Item", "Delete Items"
   - Confirmation messages: "Are you sure you want to delete..."
   - Button labels: "Confirm", "Cancel"
   - Dialog titles: "Add Tags", "Remove Tags", "Move Items"

4. **Filter Panel Labels** (~15 strings)
   - "Filters", "Clear All", "Apply Filters"
   - Category labels: "Content Type", "Tags", "Location", "Property"

5. **Sort Options** (~10 strings)
   - "Sort", "Sort by"
   - Options: "Newest First", "Oldest First", "Name (A-Z)", "Name (Z-A)", "Most Viewed"

6. **Empty States** (~8 strings)
   - "No items yet"
   - "Create your first item to get started"
   - "No matching items"
   - "Try adjusting your search or filters"

7. **Loading States** (~5 strings)
   - "Loading items, please wait..."
   - "Processing..."

8. **Bulk Actions** (~15 strings)
   - Selection indicators: "X items selected"
   - Action buttons: "Delete", "Add Tag", "Remove Tag", "Move"
   - Confirmation counts with pluralization

9. **Inline Editing** (~10 strings)
   - Placeholders: "Enter title...", "Add tags..."
   - Tooltips: "Click to edit", "Press Enter to save"

10. **Asset Management** (~12 strings)
    - "Manage Assets", "Upload files"
    - "Drag and drop", "or click to browse"
    - "Remove asset", "Reorder assets"

11. **Preview Modal** (~15 strings)
    - Tab labels: "Content", "QR Code", "Analytics", "Settings"
    - Navigation: "Previous", "Next"
    - Actions: "Close", "Edit", "Delete"

12. **ARIA Labels** (~15 strings)
    - "Item manager", "Bulk actions for X selected items"
    - "Clear search", "Close dialog"
    - Grid/list view labels

### Existing Patterns to Follow

#### Pattern 1: Labels Configuration (ItemManager.tsx)
```typescript
// Current pattern in ItemManager.tsx (lines 55-61)
const DEFAULT_CONFIG = {
  labels: {
    searchPlaceholder: 'Search items...',
    emptyStateTitle: 'No items yet',
    emptyStateDescription: 'Create your first item to get started',
    deleteConfirmTitle: 'Delete Item',
    deleteConfirmMessage: 'Are you sure...',
  }
};

// Target pattern with i18n
import { useTranslations } from 'next-intl';

function ItemManager() {
  const t = useTranslations('items');

  const DEFAULT_CONFIG = {
    labels: {
      searchPlaceholder: t('search.placeholder'),
      emptyStateTitle: t('list.empty.title'),
      emptyStateDescription: t('list.empty.description'),
      deleteConfirmTitle: t('delete.title'),
      deleteConfirmMessage: t('delete.message'),
    }
  };
}
```

#### Pattern 2: Filter Panel Labels (FilterPanel.tsx)
```typescript
// Current pattern (lines 90-97)
const DEFAULT_LABELS = {
  title: 'Filters',
  clearAll: 'Clear All',
  contentType: 'Content Type',
  tags: 'Tags',
  location: 'Location',
  property: 'Property',
  applyFilters: 'Apply Filters',
  close: 'Close'
};

// Target pattern with i18n
const t = useTranslations('items.filters');
const DEFAULT_LABELS = {
  title: t('title'),
  clearAll: t('clearAll'),
  contentType: t('contentType'),
  // ...
};
```

#### Pattern 3: Pluralization (BulkActionsBar.tsx)
```typescript
// Current pattern
`${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`

// Target pattern with ICU format
t('bulk.selected', { count: selectedCount })
// Translation key: "bulk.selected": "{count, plural, one {# item selected} other {# items selected}}"
```

## Implementation Order

### Phase 1: Core Components (Highest Impact)
1. **ItemManager.tsx** - Main orchestrator with DEFAULT_CONFIG pattern
2. **BulkActionsBar.tsx** - High visibility, complex pluralization
3. **ConfirmDeleteDialog.tsx** - User-facing confirmation dialogs
4. **ItemToolbar.tsx** - Search and view controls
5. **FilterPanel.tsx** - Already has labels pattern, needs i18n integration

### Phase 2: Display Components
6. **EmptyState.tsx** - Default strings need translation
7. **LoadingState.tsx** - Screen reader text
8. **ItemCard.tsx** - Card display strings
9. **ItemRow.tsx** - List row strings
10. **ItemGrid.tsx** - Grid container strings
11. **ItemList.tsx** - List container strings

### Phase 3: Dialog Components
12. **BulkTagDialog.tsx** - Tag management dialog
13. **BulkMoveDialog.tsx** - Property move dialog
14. **SortMenu.tsx** - Sort options
15. **ContentTypeFilter.tsx** - Filter options
16. **TagFilter.tsx** - Tag filter
17. **LocationFilter.tsx** - Location filter
18. **PropertyFilter.tsx** - Property filter
19. **ColumnSettingsPopup.tsx** - Column configuration

### Phase 4: Shared Components
20. **ViewModeToggle.tsx** - View mode labels
21. **InlineEdit.tsx** - Editing placeholders
22. **TagsInlineEdit.tsx** - Tag editing
23. **VisitCountBadge.tsx** - Analytics labels
24. **ReactionSummary.tsx** - Engagement labels
25. **EngagementIndicator.tsx** - Analytics labels
26. **SearchInput.tsx** - Search placeholder

### Phase 5: Asset & Preview Components
27. **AssetPanel.tsx** - Asset management
28. **AssetDropZone.tsx** - Upload prompts
29. **AssetItem.tsx** - Item actions
30. **AssetRemoveConfirmDialog.tsx** - Removal confirmation
31. **ItemPreviewModal.tsx** - Preview interface
32. **MediaGallery.tsx** - Gallery navigation
33. **AnalyticsSection.tsx** - Analytics labels
34. **InstructionsViewer.tsx** - Section headers
35. **VideoPlayer.tsx** - Player controls
36. **PhotoViewer.tsx** - Viewer controls
37. **PDFViewer.tsx** - Viewer controls

### Phase 6: Utilities
38. **constants.ts** - SORT_OPTIONS labels

## Authorized Files and Functions for Modification

### Primary Component Files (Core)

#### `/src/components/ItemManager/ItemManager.tsx`
- **Purpose**: Main orchestrator component
- **Changes Required**:
  - Add `import { useTranslations } from 'next-intl'`
  - Add `const t = useTranslations('items')` at component top
  - Update `DEFAULT_CONFIG.labels` to use translation keys
  - Update all hardcoded strings in JSX (lines 345, 347, 590-591, 731, 794, 800)
  - Update selection count formatting to use pluralization
- **Estimated Strings**: ~15
- **Functions to Modify**: Component body, `handleSelectionChange`, render sections

#### `/src/components/ItemManager/components/ItemToolbar.tsx`
- **Purpose**: Toolbar with search, view toggles, and controls
- **Changes Required**:
  - Add useTranslations import and hook call
  - Update aria-labels (lines 70, 90, 121, 392)
  - Update button labels (lines 134, 184, 212)
  - Update default placeholder (line 387)
- **Estimated Strings**: ~12
- **Functions to Modify**: Component body, render methods

#### `/src/components/ItemManager/components/SearchInput.tsx`
- **Purpose**: Search input with placeholder
- **Changes Required**:
  - Add useTranslations import
  - Update default placeholder (line 55)
  - Update aria-label (line 215)
- **Estimated Strings**: ~3
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/ItemCard.tsx`
- **Purpose**: Card view item display
- **Changes Required**:
  - Add useTranslations import
  - Update tooltips, status badges, action labels
  - Update content type labels
- **Estimated Strings**: ~10
- **Functions to Modify**: Component body, render sections

#### `/src/components/ItemManager/components/ItemRow.tsx`
- **Purpose**: List row item display
- **Changes Required**:
  - Add useTranslations import
  - Update column headers, action labels
  - Update tooltips and status indicators
- **Estimated Strings**: ~8
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/ItemGrid.tsx`
- **Purpose**: Grid container for item cards
- **Changes Required**:
  - Add useTranslations import
  - Update aria-labels for grid container
- **Estimated Strings**: ~5
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/ItemList.tsx`
- **Purpose**: List container for item rows
- **Changes Required**:
  - Add useTranslations import
  - Update column header labels
  - Update aria-labels
- **Estimated Strings**: ~8
- **Functions to Modify**: Component body

### Dialog Component Files

#### `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- **Purpose**: Delete confirmation dialog
- **Changes Required**:
  - Add useTranslations import
  - Update title generation (lines 62, 73, 75)
  - Update button labels (lines 86, 88)
  - Update overflow text (line 230)
  - Update cancel label (line 252)
  - Update deleting state (line 271)
- **Estimated Strings**: ~10
- **Functions to Modify**: Component body, pluralization logic

#### `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- **Purpose**: Filter panel with multiple filter types
- **Changes Required**:
  - Add useTranslations import
  - Update DEFAULT_LABELS object (lines 90-97)
  - Update aria-label (line 305)
- **Estimated Strings**: ~12
- **Functions to Modify**: DEFAULT_LABELS initialization

#### `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- **Purpose**: Sort dropdown menu
- **Changes Required**:
  - Add useTranslations import
  - Update default labels (lines 69, 125-126)
  - Update aria-label (line 164)
- **Estimated Strings**: ~8
- **Functions to Modify**: mergedLabels initialization

#### `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
- **Purpose**: Content type filter component
- **Changes Required**:
  - Add useTranslations import
  - Update filter labels
- **Estimated Strings**: ~5

#### `/src/components/ItemManager/components/dialogs/TagFilter.tsx`
- **Purpose**: Tag filter component
- **Changes Required**:
  - Add useTranslations import
  - Update filter labels
- **Estimated Strings**: ~5

#### `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`
- **Purpose**: Location filter component
- **Changes Required**:
  - Add useTranslations import
  - Update filter labels
- **Estimated Strings**: ~5

#### `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
- **Purpose**: Property filter component
- **Changes Required**:
  - Add useTranslations import
  - Update filter labels
- **Estimated Strings**: ~5

#### `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
- **Purpose**: Column visibility configuration
- **Changes Required**:
  - Add useTranslations import
  - Update column names and controls
- **Estimated Strings**: ~8

### Bulk Action Component Files

#### `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- **Purpose**: Bulk actions toolbar
- **Changes Required**:
  - Add useTranslations import
  - Update aria-label (line 155)
  - Update selection display (lines 182, 186)
  - Update processing state (line 196)
  - Update button labels (lines 203, 212, 221, 231, 253, 267)
- **Estimated Strings**: ~12
- **Functions to Modify**: Component body, render methods

#### `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- **Purpose**: Bulk tag add/remove dialog
- **Changes Required**:
  - Add useTranslations import
  - Update title (lines 321-322)
  - Update aria-label (line 334)
  - Update form labels (lines 347, 382, 384, 400, 427, 432)
  - Update button labels (lines 493, 510)
- **Estimated Strings**: ~10
- **Functions to Modify**: Component body, title/label generation

#### `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- **Purpose**: Bulk move to property dialog
- **Changes Required**:
  - Add useTranslations import
  - Update placeholder (line 100)
  - Update empty state (line 197)
  - Update aria-label (line 214)
  - Update labels (lines 334, 344, 352, 487, 500, 514, 518, 526, 552, 567)
- **Estimated Strings**: ~10
- **Functions to Modify**: Component body

### Shared Component Files

#### `/src/components/ItemManager/components/shared/EmptyState.tsx`
- **Purpose**: Empty state display
- **Changes Required**:
  - Add useTranslations import
  - Update DEFAULT_TITLE (line 23)
  - Update DEFAULT_DESCRIPTION (line 24)
- **Estimated Strings**: ~4
- **Functions to Modify**: Default constants

#### `/src/components/ItemManager/components/shared/LoadingState.tsx`
- **Purpose**: Loading state display
- **Changes Required**:
  - Add useTranslations import
  - Update screen reader text (lines 116, 138)
- **Estimated Strings**: ~3
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
- **Purpose**: Grid/list view toggle
- **Changes Required**:
  - Add useTranslations import
  - Update aria-labels for toggle buttons
- **Estimated Strings**: ~4
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- **Purpose**: Inline text editing
- **Changes Required**:
  - Add useTranslations import
  - Update placeholders, tooltips
- **Estimated Strings**: ~6
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
- **Purpose**: Inline tag editing
- **Changes Required**:
  - Add useTranslations import
  - Update placeholders, tooltips
- **Estimated Strings**: ~6
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/shared/TagChip.tsx`
- **Purpose**: Tag chip display
- **Changes Required**:
  - Add useTranslations import if tooltips exist
  - Update any action tooltips
- **Estimated Strings**: ~2

#### `/src/components/ItemManager/components/shared/VisitCountBadge.tsx`
- **Purpose**: Visit count display
- **Changes Required**:
  - Add useTranslations import
  - Update count labels with pluralization
- **Estimated Strings**: ~4
- **Functions to Modify**: Component body

#### `/src/components/ItemManager/components/shared/ReactionSummary.tsx`
- **Purpose**: Reaction summary display
- **Changes Required**:
  - Add useTranslations import
  - Update labels
- **Estimated Strings**: ~4

#### `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
- **Purpose**: Engagement metrics display
- **Changes Required**:
  - Add useTranslations import
  - Update metric labels
- **Estimated Strings**: ~4

#### `/src/components/ItemManager/components/shared/BottomSheet.tsx`
- **Purpose**: Mobile bottom sheet
- **Changes Required**:
  - Add useTranslations import if close labels exist
- **Estimated Strings**: ~2

### Asset Panel Component Files

#### `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- **Purpose**: Asset management panel
- **Changes Required**:
  - Add useTranslations import
  - Update panel title, action labels
- **Estimated Strings**: ~8

#### `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
- **Purpose**: File upload drop zone
- **Changes Required**:
  - Add useTranslations import
  - Update upload prompts
- **Estimated Strings**: ~6

#### `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- **Purpose**: Individual asset item
- **Changes Required**:
  - Add useTranslations import
  - Update action labels, tooltips
- **Estimated Strings**: ~4

#### `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
- **Purpose**: Sortable asset list
- **Changes Required**:
  - Add useTranslations import if any labels
- **Estimated Strings**: ~2

#### `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- **Purpose**: Asset removal confirmation
- **Changes Required**:
  - Add useTranslations import
  - Update confirmation dialog strings
- **Estimated Strings**: ~6

### Preview Component Files

#### `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Purpose**: Item preview modal
- **Changes Required**:
  - Add useTranslations import
  - Update tab labels, action buttons
- **Estimated Strings**: ~10

#### `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
- **Purpose**: Media gallery viewer
- **Changes Required**:
  - Add useTranslations import
  - Update navigation labels
- **Estimated Strings**: ~6

#### `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
- **Purpose**: Video player component
- **Changes Required**:
  - Add useTranslations import
  - Update player control labels
- **Estimated Strings**: ~4

#### `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
- **Purpose**: Instructions display
- **Changes Required**:
  - Add useTranslations import
  - Update section headers
- **Estimated Strings**: ~4

#### `/src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`
- **Purpose**: Analytics display
- **Changes Required**:
  - Add useTranslations import
  - Update metric labels
- **Estimated Strings**: ~8

#### `/src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx`
- **Purpose**: Photo viewer
- **Changes Required**:
  - Add useTranslations import if any labels
- **Estimated Strings**: ~2

#### `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`
- **Purpose**: PDF viewer
- **Changes Required**:
  - Add useTranslations import if any labels
- **Estimated Strings**: ~2

### Utility Files

#### `/src/components/ItemManager/utils/constants.ts`
- **Purpose**: Constants including SORT_OPTIONS
- **Changes Required**:
  - Export raw sort option values only (without labels)
  - Labels will be provided via translation keys in components
  - Create a utility function or mapping for sort labels
- **Estimated Strings**: ~9 (SORT_OPTIONS labels)
- **Pattern Change**: Labels should NOT be in constants.ts; components using sort options should translate labels

### Files Referenced (Read-Only)

#### `/src/lib/i18n/config.ts`
- **Purpose**: Verify i18n configuration
- **Reference**: Confirm next-intl setup

#### `/messages/en.json`
- **Purpose**: Reference for items namespace structure
- **Reference**: Keys to use from REQ-385

#### `/src/components/ItemManager/ItemManager.types.ts`
- **Purpose**: Type definitions reference
- **Reference**: Understand component prop types

## Technical Specifications

### Import Pattern for All Components
```typescript
'use client'; // Required for client components using useTranslations

import { useTranslations } from 'next-intl';
```

### Hook Usage Pattern
```typescript
function ComponentName() {
  const t = useTranslations('items');

  // Use sub-namespace for specific areas
  const tBulk = useTranslations('items.bulk');
  const tFilters = useTranslations('items.filters');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{tBulk('delete')}</button>
    </div>
  );
}
```

### Pluralization Pattern (ICU Format)
```typescript
// Translation file
"bulk.selected": "{count, plural, one {# item selected} other {# items selected}}"

// Component usage
t('bulk.selected', { count: selectedCount })
```

### Variable Interpolation Pattern
```typescript
// Translation file
"delete.message": "Are you sure you want to delete \"{name}\"? This action cannot be undone."

// Component usage
t('delete.message', { name: item.name })
```

### ARIA Label Pattern
```typescript
// Before
aria-label="Item manager"

// After
aria-label={t('accessibility.itemManager')}
```

### Conditional Text Pattern
```typescript
// Before
count === 1 ? 'item' : 'items'

// After - use ICU pluralization
t('bulk.itemCount', { count })
```

## Success Validation Checklist

### Code Changes
- [ ] All 50+ ItemManager component files updated with useTranslations
- [ ] No hardcoded English strings remain in any component
- [ ] All ARIA labels translated
- [ ] All placeholders translated
- [ ] All tooltips translated
- [ ] All button labels translated
- [ ] All dialog titles and messages translated
- [ ] Pluralization uses ICU format
- [ ] Variable interpolation uses proper format

### Functional Verification
- [ ] Components render correctly with English translations
- [ ] Components render correctly with other languages
- [ ] Pluralization works for 0, 1, 2, many counts
- [ ] Long translations (German, Dutch) don't break layouts
- [ ] Special characters render correctly
- [ ] Selection count indicators update properly
- [ ] Bulk action dialogs display correct item counts
- [ ] Filter/sort options display translated labels

### Accessibility
- [ ] All ARIA labels are translated
- [ ] Screen reader text is translated
- [ ] No broken accessibility due to translation changes

### Testing
- [ ] Existing tests pass or are updated
- [ ] Manual testing in all 6 languages completed
- [ ] Text overflow scenarios tested

## Dependencies

### Prerequisites (Must be complete)
- [x] REQ-230: Create i18n configuration module
- [x] REQ-231: Update next.config.ts for i18n
- [ ] REQ-385: Create items namespace structure in translation files

### Related Tasks
- REQ-387: Update ItemGrid and ItemCard (can run in parallel if items namespace ready)
- REQ-388: Update filter and sort components
- REQ-389: Update bulk action dialogs
- REQ-390: Update item detail/edit pages
- REQ-391: Generate translations for 5 non-English languages

## Risk Assessment

### Risk Level: Medium

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translations cause UI breaks | Medium | High | Use fallback to English, build-time validation |
| Pluralization edge cases | Medium | Medium | Test with 0, 1, 2, large numbers |
| Long translations break layouts | Medium | Medium | Test German/Dutch, use text-overflow CSS |
| Test file updates needed | High | Low | Update test assertions for translated text |
| Performance impact from translation calls | Low | Low | next-intl optimizes translation loading |
| Type errors from translation keys | Medium | Low | Use TypeScript path autocomplete, IDE support |

### Mitigation Strategies
1. **Fallback mechanism**: next-intl falls back to English for missing keys
2. **Build validation**: Run i18n:check script before deployment
3. **Visual testing**: Screenshot tests for layout verification
4. **Progressive rollout**: Update components in phases, verify each phase

## Effort Estimate

### Total: 15-20 hours

### Breakdown by Phase

| Phase | Components | Strings | Hours |
|-------|------------|---------|-------|
| Phase 1: Core Components | 5 | ~55 | 4-5 |
| Phase 2: Display Components | 6 | ~30 | 2-3 |
| Phase 3: Dialog Components | 8 | ~55 | 3-4 |
| Phase 4: Shared Components | 10 | ~40 | 2-3 |
| Phase 5: Asset & Preview | 11 | ~45 | 2-3 |
| Phase 6: Utilities | 1 | ~9 | 1 |
| Testing & QA | - | - | 2-3 |

### Parallelization
- Phases 2 and 4 can run in parallel
- Phases 3 and 5 can run in parallel
- Phase 1 must complete first (establishes patterns)

## Notes

### Pattern Consistency
- Maintain consistent hook naming (`t`, `tBulk`, `tFilters`)
- Use the same namespace depth across similar components
- Prefer descriptive key names over abbreviations

### Testing Strategy
- Unit tests may need mock translation providers
- Integration tests should verify actual translated text
- Consider adding language-specific snapshot tests

### Future Extensibility
- Structure supports adding new languages easily
- Key organization allows component-level scoping
- ICU format supports complex pluralization rules

### Known Limitations
- Some components receive labels via props; ensure parent components also translate
- Constants file pattern change required for sort options
- Test files will need updates to handle translations
