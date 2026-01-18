# Implementation Plan: ItemManager Component

**Generated:** 2026-01-02T16:45:00
**Last Modified:** 2026-01-02T16:45:00
**PRD Reference:** `/docs/prd/PRD_Item-capture-manager_Component.md`

---

## Overview

This plan details the implementation of `ItemManager`, a standalone, self-contained React component for browsing, organizing, searching, filtering, and managing instructional content items. The component follows a "props in, callbacks out" architecture with zero backend dependencies, enabling property owners to efficiently manage their content library.

The implementation leverages the existing Next.js 15 + React 19 + TypeScript + Tailwind CSS stack, maintaining consistency with established codebase patterns and the existing `ItemCapture` component architecture.

---

## Technical Context

### Existing Stack

| Technology | Version/Details | Source |
|------------|-----------------|--------|
| Framework | Next.js 15.5.9 with Turbopack | `package.json` |
| React | 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x | `tailwind.config.js`, `globals.css` |
| Icons | Lucide React 0.525.0 | `package.json` |
| Path Aliases | `@/*` maps to `./src/*` | `tsconfig.json` |
| UI Primitives | Radix UI (dialog, dropdown, toast) | `package.json` |
| Utility Library | clsx + tailwind-merge via `cn()` | `src/lib/utils.ts` |

### Established Patterns (Observed in Codebase)

| Pattern | Example File | Notes |
|---------|--------------|-------|
| Client components | `'use client'` directive | All components in `/src/components/` use this |
| Modal pattern | `src/components/ConfirmationModal.tsx` | Fixed overlay with centered white card |
| List management | `src/components/ItemsManagement.tsx` | Search, filter, table layout pattern |
| Props interface | `src/components/ItemCapture/ItemCapture.types.ts` | Comprehensive interface definitions |
| State machine | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based state management |
| Utility functions | `src/lib/utils.ts` | `cn()` for class merging |
| Type exports | `src/types/index.ts` | Central type definitions with re-exports |

### Existing ItemCapture Types (To Reuse)

The `ItemCapture` component already defines types that `ItemManager` will consume:

```typescript
// From src/components/ItemCapture/ItemCapture.types.ts
export interface ItemRecord {
  id: string;
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}
```

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered | Recommendation |
|---------|---------|-------------|------------------------|----------------|
| None (native APIs) | Drag-and-drop reorder | 0 KB | react-beautiful-dnd (~30KB) | Use native HTML5 DnD or lightweight alternative |
| @dnd-kit/core | Drag-and-drop for asset reordering | ~15KB | react-beautiful-dnd | Recommended - modern, accessible, smaller |
| None (existing) | Search/filter | 0 KB | fusejs (~10KB) | Use native array methods for simple filtering |

**Dependency Decision Summary:**
- Phase 1-3: No new dependencies (use native APIs)
- Phase 4+: Consider @dnd-kit/core for asset panel drag-and-drop if native DnD proves insufficient
- Defer complex search libraries unless performance issues arise with large item counts

---

## Architecture

### Component Hierarchy

```
ItemManager/
├── index.ts                          # Public export: ItemManager, ItemManagerProps
├── ItemManager.tsx                   # Main orchestrator component
├── ItemManager.types.ts              # All TypeScript interfaces
├── hooks/
│   ├── useItemManagerState.ts        # Central state for selection, filters, sort
│   ├── useItemSearch.ts              # Search/filter logic
│   ├── useItemSelection.ts           # Multi-select handling
│   └── useAssetManagement.ts         # Asset panel state and operations
├── components/
│   ├── ItemToolbar.tsx               # Search, filters, sort, view toggle
│   ├── ItemGrid.tsx                  # Grid view layout
│   ├── ItemList.tsx                  # List view layout
│   ├── ItemCard.tsx                  # Grid item card
│   ├── ItemRow.tsx                   # List item row
│   ├── ItemPreview/
│   │   ├── ItemPreviewModal.tsx      # Detail preview modal/drawer
│   │   ├── MediaGallery.tsx          # Swipeable media viewer
│   │   └── InstructionsViewer.tsx    # Markdown instructions display
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx            # Asset management drawer
│   │   ├── AssetItem.tsx             # Individual asset row
│   │   └── AssetDropZone.tsx         # Add media drop zone
│   ├── BulkActions/
│   │   ├── BulkActionsBar.tsx        # Floating bar when items selected
│   │   ├── BulkTagDialog.tsx         # Add/remove tags dialog
│   │   └── BulkMoveDialog.tsx        # Move to property dialog
│   ├── dialogs/
│   │   ├── ConfirmDeleteDialog.tsx   # Delete confirmation
│   │   ├── FilterPanel.tsx           # Advanced filter panel (mobile)
│   │   └── SortMenu.tsx              # Sort options dropdown
│   └── shared/
│       ├── ItemThumbnail.tsx         # Thumbnail with type badge
│       ├── ContentTypeBadge.tsx      # Content type indicator
│       ├── TagChip.tsx               # Tag display/edit chip
│       ├── EmptyState.tsx            # Empty state component
│       ├── LoadingState.tsx          # Loading skeleton
│       └── InlineEdit.tsx            # Inline text editing
└── utils/
    ├── filterUtils.ts                # Filter logic helpers
    ├── sortUtils.ts                  # Sort comparators
    ├── thumbnailUtils.ts             # Thumbnail extraction helpers
    └── constants.ts                  # Default config values
```

### State Management Architecture

The component uses local state with a reducer pattern for predictable state management:

```typescript
// Simplified state structure
interface ItemManagerState {
  // View
  viewMode: 'grid' | 'list';

  // Search & Filter
  searchQuery: string;
  filters: FilterState;
  sortBy: SortOption;

  // Selection
  selectedIds: Set<string>;
  isSelectionMode: boolean;

  // UI
  previewItem: ItemRecord | null;
  assetPanelItem: ItemRecord | null;
  isFilterPanelOpen: boolean;

  // Inline edit
  editingItemId: string | null;
  editingField: 'title' | 'location' | 'tags' | null;
}

type ItemManagerAction =
  // View
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }

  // Search & Filter
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SortOption }

  // Selection
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_SELECTION_MODE' }

  // Preview & Panels
  | { type: 'OPEN_PREVIEW'; payload: ItemRecord }
  | { type: 'CLOSE_PREVIEW' }
  | { type: 'OPEN_ASSET_PANEL'; payload: ItemRecord }
  | { type: 'CLOSE_ASSET_PANEL' }
  | { type: 'TOGGLE_FILTER_PANEL' }

  // Inline edit
  | { type: 'START_INLINE_EDIT'; payload: { itemId: string; field: string } }
  | { type: 'END_INLINE_EDIT' };
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ItemManager                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              useItemManagerState                         │   │
│  │  (reducer-based local state)                             │   │
│  │  - View mode, search, filters, sort                      │   │
│  │  - Selection state                                       │   │
│  │  - UI panel states                                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│      ┌──────────────────┼──────────────────────┐               │
│      ▼                  ▼                      ▼               │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐       │
│  │ Toolbar  │   │ ItemGrid/    │   │ Preview/Asset    │       │
│  │ Search   │   │ ItemList     │   │ Panels           │       │
│  │ Filter   │   │              │   │                  │       │
│  │ Sort     │   │ - ItemCard   │   │ - MediaGallery   │       │
│  └────┬─────┘   │ - ItemRow    │   │ - AssetPanel     │       │
│       │         │ - Selection  │   │ - Dialogs        │       │
│       │         └──────┬───────┘   └────────┬─────────┘       │
│       │                │                    │                  │
│       └────────────────┼────────────────────┘                  │
│                        │                                        │
│                        ▼                                        │
│              ┌─────────────────┐                               │
│              │  Callback       │                               │
│              │  Emission       │                               │
│              │  - onEditItem   │                               │
│              │  - onDeleteItems│                               │
│              │  - onUpdateItem │                               │
│              └────────┬────────┘                               │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
              Parent Application
              (handles persistence, navigation)
```

---

## Integration Contract

### Props Interface

```typescript
// File: src/components/ItemManager/ItemManager.types.ts

/**
 * Main component props for ItemManager.
 */
export interface ItemManagerProps {
  // Required data
  /** Array of item records to display and manage */
  items: ItemRecord[];

  // Optional data
  /** Available properties for multi-property mode */
  properties?: Property[];
  /** Loading state from parent */
  loading?: boolean;
  /** Error state from parent */
  error?: Error | null;

  // Required callbacks
  /** Called when user wants to edit an item (triggers ItemCapture edit mode) */
  onEditItem: (item: ItemRecord) => void;
  /** Called for single or bulk delete operations */
  onDeleteItems: (ids: string[]) => void;
  /** Called when item metadata or assets change */
  onUpdateItem: (item: ItemRecord) => void;

  // Optional callbacks
  /** Called when assets are added via quick add */
  onAddAssets?: (itemId: string, assets: File[]) => void;
  /** Called when assets are removed via asset panel */
  onRemoveAssets?: (itemId: string, assetIds: string[]) => void;
  /** Called when assets are reordered via asset panel */
  onReorderAssets?: (itemId: string, orderedIds: string[]) => void;
  /** Called to duplicate an item */
  onDuplicateItem?: (item: ItemRecord) => void;
  /** Called when selection changes (for parent tracking) */
  onSelectionChange?: (selectedIds: string[]) => void;

  // Configuration
  config?: ItemManagerConfig;

  // Render customization
  renderItem?: (item: ItemRecord, actions: ItemActions) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: (error: Error) => React.ReactNode;
  renderToolbar?: (props: ToolbarRenderProps) => React.ReactNode;
  renderItemPreview?: (item: ItemRecord) => React.ReactNode;
  renderConfirmDialog?: (props: ConfirmDialogProps) => React.ReactNode;

  // Styling
  classNames?: ItemManagerClassNames;
}

/**
 * Configuration options for ItemManager behavior.
 */
export interface ItemManagerConfig {
  // View options
  /** Default view mode (default: 'grid') */
  defaultView?: 'grid' | 'list';
  /** Allow toggling between grid/list views (default: true) */
  allowViewToggle?: boolean;

  // Feature flags
  /** Enable multi-select and bulk operations (default: true) */
  enableBulkActions?: boolean;
  /** Enable inline editing of title/location/tags (default: true) */
  enableInlineEdit?: boolean;
  /** Enable asset management panel (default: true) */
  enableAssetManagement?: boolean;
  /** Enable item duplication (default: false) */
  enableDuplicate?: boolean;
  /** Enable search functionality (default: true) */
  enableSearch?: boolean;
  /** Enable filter functionality (default: true) */
  enableFilters?: boolean;
  /** Enable sort functionality (default: true) */
  enableSort?: boolean;

  // Multi-property
  /** Enable multi-property features (default: false, auto-enabled if properties prop provided) */
  multiPropertyMode?: boolean;

  // Constraints
  /** Maximum items that can be selected at once (default: 100) */
  maxBulkSelection?: number;

  // Labels (for i18n)
  labels?: ItemManagerLabels;
}

/**
 * Customizable labels for internationalization.
 */
export interface ItemManagerLabels {
  searchPlaceholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  // ... additional labels
}

/**
 * CSS class name overrides for styling customization.
 */
export interface ItemManagerClassNames {
  container?: string;
  toolbar?: string;
  searchInput?: string;
  filterPanel?: string;
  itemGrid?: string;
  itemList?: string;
  itemCard?: string;
  itemRow?: string;
  selectedItem?: string;
  previewModal?: string;
  assetPanel?: string;
  confirmDialog?: string;
  emptyState?: string;
  loadingState?: string;
}
```

### Shared Types (Extended from ItemCapture)

```typescript
/**
 * Extended ItemRecord with manager-specific properties.
 * Note: Extends the existing ItemCapture ItemRecord type.
 */
export interface ItemRecordExtended extends ItemRecord {
  /** Property ID for multi-property mode */
  propertyId?: string;
  /** Last modified timestamp */
  updatedAt?: Date;
  /** URL for already-uploaded media (vs local File/Blob) */
  mediaUrls?: Record<string, string>;
}

/**
 * Property definition for multi-property mode.
 */
export interface Property {
  id: string;
  name: string;
  address?: string;
}

/**
 * Filter state structure.
 */
export interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}

/**
 * Sort option type.
 */
export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';

/**
 * Actions available for each item.
 */
export interface ItemActions {
  edit: () => void;
  delete: () => void;
  duplicate: () => void;
  manageAssets: () => void;
  select: () => void;
  deselect: () => void;
  isSelected: boolean;
}
```

### Usage Example

```tsx
// Example integration in parent application
import { ItemManager, ItemRecord } from '@/components/ItemManager';

function ManageItemsPage() {
  const [items, setItems] = useState<ItemRecord[]>(mockItems);
  const router = useRouter();

  const handleEditItem = (item: ItemRecord) => {
    // Navigate to ItemCapture in edit mode
    router.push(`/items/${item.id}/edit`);
  };

  const handleDeleteItems = async (ids: string[]) => {
    // Persist deletion to backend
    await deleteItemsFromDatabase(ids);
    // Update local state
    setItems(items.filter(i => !ids.includes(i.id)));
  };

  const handleUpdateItem = async (updatedItem: ItemRecord) => {
    // Persist update to backend
    await updateItemInDatabase(updatedItem);
    // Update local state
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  return (
    <ItemManager
      items={items}
      onEditItem={handleEditItem}
      onDeleteItems={handleDeleteItems}
      onUpdateItem={handleUpdateItem}
      config={{
        enableBulkActions: true,
        enableAssetManagement: true,
        defaultView: 'grid',
      }}
    />
  );
}
```

---

## Implementation Approach

### Phase Dependencies

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     PHASE 1                              │
                    │                    Foundation                            │
                    │  (Types, Directory, State Hook, Basic List Display)      │
                    └─────────────────────┬───────────────────────────────────┘
                                          │
                    ┌─────────────────────┴───────────────────────┐
                    │                                             │
                    ▼                                             ▼
    ┌───────────────────────────────┐         ┌───────────────────────────────┐
    │          PHASE 2              │         │          PHASE 3              │
    │    Search, Filter, Sort       │         │    Selection & Bulk Actions   │
    │  (Toolbar, Filter UI, Sort)   │         │  (Multi-select, Bulk bar)     │
    └───────────────┬───────────────┘         └───────────────┬───────────────┘
                    │                                         │
                    │       ┌─────────────────────────┐       │
                    └──────►│        PHASE 4          │◄──────┘
                            │    Item Preview/Detail  │
                            │  (Modal, Media gallery) │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │        PHASE 5          │
                            │   Asset Management      │
                            │ (Panel, Reorder, Add)   │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │        PHASE 6          │
                            │   Inline Edit & Polish  │
                            │ (Inline edit, Mobile,   │
                            │  Accessibility, Testing)│
                            └─────────────────────────┘
```

#### Dependency Rules

| Phase | Hard Dependencies | Can Start After | Parallelizable With |
|-------|-------------------|-----------------|---------------------|
| **Phase 1** | None | Immediately | None (must complete first) |
| **Phase 2** | Phase 1 complete | Phase 1 | Phase 3 |
| **Phase 3** | Phase 1 complete | Phase 1 | Phase 2 |
| **Phase 4** | Phase 1 complete | Phase 1 | Phase 2, Phase 3 |
| **Phase 5** | Phase 4 complete | Phase 4 | None |
| **Phase 6** | Phases 1-5 complete | Phase 5 | None (integration phase) |

#### Critical Path

The critical path (longest sequential chain) is:

```
Phase 1 → Phase 4 → Phase 5 → Phase 6
   │         │         │         │
  2-3d      3-4d      3-4d      2-3d  = 10-14 days minimum
```

Phases 2 and 3 can complete during Phase 1/4 without extending timeline if parallelized.

---

### Phase 1: Foundation (Estimated: 2-3 days)

**Goal:** Establish core infrastructure, types, and basic item display.

#### Task Dependencies (Phase 1)

```
1.1 Directory Structure & Types
         │
         ▼
1.2 State Management Hook
         │
         ▼
1.3 Basic ItemManager Shell
         │
    ┌────┴────┐
    ▼         ▼
  1.4       1.5
ItemCard  ItemRow
  Step    Component
    │         │
    └────┬────┘
         ▼
1.6 Grid/List Views
         │
         ▼
1.7 Empty & Loading States
```

#### Tasks

- [ ] **1.1 Create component directory structure and types** *(No dependencies)*
  - Create `/src/components/ItemManager/` directory
  - Create `ItemManager.types.ts` with all interfaces from PRD
  - Set up barrel exports in `index.ts`
  - Import shared types from ItemCapture

- [ ] **1.2 Implement core state management hook** *(Depends on: 1.1)*
  - Create `useItemManagerState.ts` with reducer
  - Implement view mode toggle
  - Implement basic filter/sort state
  - Implement selection state

- [ ] **1.3 Build basic ItemManager shell** *(Depends on: 1.2)*
  - Create `ItemManager.tsx` main component
  - Wire up props to state
  - Implement basic layout structure
  - Add config defaults handling

- [ ] **1.4 Implement ItemCard component** *(Depends on: 1.3 | Parallel with: 1.5)*
  - Create `ItemCard.tsx` for grid view
  - Display thumbnail, title, location, content type badge
  - Handle click for preview open
  - Handle selection checkbox (when in selection mode)

- [ ] **1.5 Implement ItemRow component** *(Depends on: 1.3 | Parallel with: 1.4)*
  - Create `ItemRow.tsx` for list view
  - Display more metadata (tags, dates) in row format
  - Handle action menu (kebab menu)
  - Handle selection checkbox

- [ ] **1.6 Implement Grid and List views** *(Depends on: 1.4, 1.5)*
  - Create `ItemGrid.tsx` with responsive grid
  - Create `ItemList.tsx` with table-like layout
  - Wire up view mode toggle

- [ ] **1.7 Implement Empty and Loading states** *(Depends on: 1.3)*
  - Create `EmptyState.tsx` component
  - Create `LoadingState.tsx` with skeleton
  - Integrate into main component

---

### Phase 2: Search, Filter & Sort (Estimated: 2-3 days)

**Goal:** Complete search, filter, and sort functionality.

#### Task Dependencies (Phase 2)

```
2.1 useItemSearch Hook
         │
         ▼
2.2 ItemToolbar Component
         │
    ┌────┴────┐
    ▼         ▼
  2.3       2.4
Search    Filter
  UI      Panel
    │         │
    └────┬────┘
         ▼
2.5 Sort Menu
         │
         ▼
2.6 Filter/Sort Utilities
```

#### Tasks

- [ ] **2.1 Create useItemSearch hook** *(No dependencies within phase)*
  - Implement search query matching (title, location, tags, instructions)
  - Implement filter application logic
  - Implement sort comparators
  - Return filtered/sorted items array

- [ ] **2.2 Build ItemToolbar component** *(Depends on: 2.1)*
  - Create main toolbar layout
  - Integrate view toggle buttons
  - Add result count display
  - Add "clear filters" action

- [ ] **2.3 Implement search UI** *(Depends on: 2.2 | Parallel with: 2.4)*
  - Search input with debounced updates
  - Clear search button
  - Search icon and styling

- [ ] **2.4 Implement FilterPanel** *(Depends on: 2.2 | Parallel with: 2.3)*
  - Content type filter (checkbox/chip group)
  - Tag filter (multi-select with existing tags)
  - Location filter (dropdown)
  - Property filter (multi-property mode)
  - Mobile-friendly collapsible panel

- [ ] **2.5 Implement SortMenu** *(Depends on: 2.2)*
  - Dropdown with sort options
  - Current sort indicator
  - Mobile-friendly touch targets

- [ ] **2.6 Create filter/sort utilities** *(Independent - can start anytime)*
  - `filterUtils.ts` with filter logic
  - `sortUtils.ts` with comparator functions
  - Unit testable pure functions

---

### Phase 3: Selection & Bulk Actions (Estimated: 2-3 days)

**Goal:** Multi-select functionality with bulk operations.

#### Task Dependencies (Phase 3)

```
3.1 useItemSelection Hook
         │
         ▼
3.2 Selection UI Integration
         │
         ▼
3.3 BulkActionsBar Component
         │
    ┌────┴────────┐
    ▼             ▼
  3.4           3.5
Bulk Delete   Bulk Tag
  Dialog       Dialog
         │
         ▼
3.6 Bulk Move Dialog (Multi-property)
```

#### Tasks

- [ ] **3.1 Create useItemSelection hook** *(No dependencies within phase)*
  - Manage selection Set
  - Select/deselect individual items
  - Select all (filtered) items
  - Clear selection
  - Selection mode toggle

- [ ] **3.2 Integrate selection UI** *(Depends on: 3.1)*
  - Add checkboxes to ItemCard and ItemRow
  - Long-press to enter selection mode (mobile)
  - Visual highlight for selected items
  - Selection count display

- [ ] **3.3 Build BulkActionsBar component** *(Depends on: 3.2)*
  - Floating action bar when items selected
  - Delete, Add Tag, Remove Tag buttons
  - Move to Property button (multi-property)
  - Exit selection mode button

- [ ] **3.4 Implement ConfirmDeleteDialog** *(Depends on: 3.3 | Parallel with: 3.5)*
  - Single item delete confirmation
  - Bulk delete confirmation with item count
  - Show item titles (up to 5, then "and X more")
  - Destructive button styling

- [ ] **3.5 Implement BulkTagDialog** *(Depends on: 3.3 | Parallel with: 3.4)*
  - Add tag mode
  - Remove tag mode
  - Tag input with suggestions
  - Preview of affected items

- [ ] **3.6 Implement BulkMoveDialog** *(Depends on: 3.3)*
  - Property selector
  - Preview of affected items
  - Only shown in multi-property mode

---

### Phase 4: Item Preview/Detail (Estimated: 3-4 days)

**Goal:** Full item preview modal with media gallery.

#### Task Dependencies (Phase 4)

```
4.1 ItemPreviewModal Component
         │
         ▼
4.2 MediaGallery Component
         │
    ┌────┴────┐
    ▼         ▼
  4.3       4.4
Video     Photo/PDF
Player    Viewer
         │
         ▼
4.5 InstructionsViewer
         │
         ▼
4.6 Preview Actions
```

#### Tasks

- [ ] **4.1 Create ItemPreviewModal component** *(No dependencies within phase)*
  - Modal/drawer container
  - Close button and overlay
  - Mobile-friendly slide-up drawer
  - Keyboard navigation (Escape to close)

- [ ] **4.2 Build MediaGallery component** *(Depends on: 4.1)*
  - Swipeable media carousel
  - Thumbnail strip navigation
  - Full-screen toggle
  - Media type indicators

- [ ] **4.3 Implement video playback** *(Depends on: 4.2 | Parallel with: 4.4)*
  - Video player with controls
  - Play/pause, seek, volume
  - Full-screen support

- [ ] **4.4 Implement photo/PDF viewer** *(Depends on: 4.2 | Parallel with: 4.3)*
  - Photo zoom on tap/pinch
  - PDF page navigation
  - PDF page count display

- [ ] **4.5 Create InstructionsViewer** *(Depends on: 4.1)*
  - Render markdown instructions
  - Scrollable text area
  - Use existing react-markdown dependency

- [ ] **4.6 Add preview actions** *(Depends on: 4.1, 4.2, 4.5)*
  - Edit button (triggers onEditItem)
  - Manage Assets button (opens asset panel)
  - Delete button (with confirmation)
  - Metadata display (title, location, tags)

---

### Phase 5: Asset Management (Estimated: 3-4 days)

**Goal:** Quick asset add/remove/reorder panel.

#### Task Dependencies (Phase 5)

```
5.1 useAssetManagement Hook
         │
         ▼
5.2 AssetPanel Component
         │
    ┌────┴────┐
    ▼         ▼
  5.3       5.4
AssetItem  AssetDropZone
         │
         ▼
5.5 Drag-and-Drop Reorder
         │
         ▼
5.6 Asset Remove Confirmation
```

#### Tasks

- [ ] **5.1 Create useAssetManagement hook** *(No dependencies within phase)*
  - Track pending changes (adds, removes, reorders)
  - Batch changes until "Done"
  - Provide add, remove, reorder actions

- [ ] **5.2 Build AssetPanel component** *(Depends on: 5.1)*
  - Slide-in drawer from right
  - Asset list with thumbnails
  - "Add Media" button
  - "Done" and "Cancel" buttons

- [ ] **5.3 Implement AssetItem component** *(Depends on: 5.2 | Parallel with: 5.4)*
  - Thumbnail display
  - Type indicator (video/photo/PDF)
  - Duration/page count for video/PDF
  - Remove button

- [ ] **5.4 Implement AssetDropZone** *(Depends on: 5.2 | Parallel with: 5.3)*
  - Drag-and-drop file upload area
  - File picker click fallback
  - File type validation
  - Preview of queued files

- [ ] **5.5 Add drag-and-drop reordering** *(Depends on: 5.3)*
  - Drag handle on AssetItem
  - Visual feedback during drag
  - Drop position indicator
  - Consider @dnd-kit/core if native DnD insufficient

- [ ] **5.6 Add asset remove confirmation** *(Depends on: 5.3)*
  - Confirmation for single asset removal
  - Show asset thumbnail in confirmation

---

### Phase 6: Inline Edit & Polish (Estimated: 2-3 days)

**Goal:** Inline editing, accessibility, mobile polish, and testing.

#### Task Dependencies (Phase 6)

```
6.1 InlineEdit Component
         │
         ▼
6.2 Title/Location Inline Edit
         │
         ▼
6.3 Tags Inline Edit
         │
         ▼
6.4 Mobile Polish
         │
         ▼
6.5 Accessibility Audit
         │
         ▼
6.6 Test Harness & Documentation
```

#### Tasks

- [ ] **6.1 Create InlineEdit component** *(No dependencies within phase)*
  - Click-to-edit text field
  - Escape to cancel, Enter/blur to save
  - Loading state during save
  - Error display

- [ ] **6.2 Integrate title/location inline edit** *(Depends on: 6.1)*
  - Add inline edit to ItemCard/ItemRow
  - Connect to onUpdateItem callback
  - Configurable via `enableInlineEdit` flag

- [ ] **6.3 Implement tags inline edit** *(Depends on: 6.1)*
  - Add/remove tags in place
  - Tag suggestions from existing items
  - Chip-based UI

- [ ] **6.4 Mobile polish** *(Depends on: 6.1, 6.2, 6.3)*
  - Touch target sizing (min 48x48px)
  - Swipe actions (optional)
  - Filter panel collapse on mobile
  - Preview as bottom sheet

- [ ] **6.5 Accessibility audit** *(Depends on: 6.4)*
  - Keyboard navigation throughout
  - Focus management in modals
  - ARIA labels and roles
  - Screen reader testing

- [ ] **6.6 Create test harness** *(Depends on: 6.4)*
  - Standalone page at `/test/item-manager`
  - Mock data with various item types
  - Console output of all callbacks
  - Network monitor confirmation (zero requests)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | useReducer + local state | Matches PRD "no global state" requirement; consistent with ItemCapture pattern |
| Search implementation | Native array filter | Simple, performant for expected item counts (<1000); no added dependencies |
| Filter logic | Client-side filtering | Items passed as props; parent handles pagination if needed |
| View persistence | Session storage | Preserve view mode within session; no localStorage for privacy |
| Drag-and-drop | Native HTML5 DnD first | Attempt native first; upgrade to @dnd-kit only if accessibility issues |
| Modal pattern | Existing ConfirmationModal pattern | Consistent with `src/components/ConfirmationModal.tsx` |
| Styling | Tailwind + cn() | Matches existing codebase; utility-first; className overrides supported |
| Icons | Lucide React | Already in codebase; consistent with existing components |
| Thumbnail display | Reuse MediaThumbnail from ItemCapture | Code reuse; consistent appearance |
| Markdown rendering | react-markdown | Already in codebase; XSS-safe |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with large item lists (>500) | Medium | Medium | Implement virtualization in V2; recommend pagination in parent |
| Touch drag-and-drop issues | Medium | Medium | Test extensively on iOS/Android; fallback to up/down buttons |
| Accessibility gaps in custom components | Medium | High | Audit with screen reader; follow WCAG AA guidelines |
| State synchronization with parent | Low | Medium | Clear callback contracts; parent is source of truth |
| Complex filter combinations | Low | Low | AND logic as specified; clear filter state display |
| Mobile keyboard covering inputs | Medium | Low | Use `visualViewport` API; scroll into view on focus |

---

## Browser Compatibility Matrix

| Feature | iOS Safari 15+ | Chrome Android 90+ | Chrome Desktop | Firefox | Edge |
|---------|---------------|-------------------|----------------|---------|------|
| CSS Grid | Yes | Yes | Yes | Yes | Yes |
| CSS Flexbox | Yes | Yes | Yes | Yes | Yes |
| HTML5 DnD | Limited | Yes | Yes | Yes | Yes |
| Touch events | Yes | Yes | Yes | Yes | Yes |
| ResizeObserver | Yes | Yes | Yes | Yes | Yes |
| IntersectionObserver | Yes | Yes | Yes | Yes | Yes |

**iOS Safari Notes:**
- HTML5 Drag and Drop has limitations; may need touch polyfill for asset reordering
- Touch events well-supported for swipe gestures in preview

---

## File Modifications Required

### New Files to Create

```
src/components/ItemManager/
├── index.ts
├── ItemManager.tsx
├── ItemManager.types.ts
├── hooks/
│   ├── useItemManagerState.ts
│   ├── useItemSearch.ts
│   ├── useItemSelection.ts
│   └── useAssetManagement.ts
├── components/
│   ├── ItemToolbar.tsx
│   ├── ItemGrid.tsx
│   ├── ItemList.tsx
│   ├── ItemCard.tsx
│   ├── ItemRow.tsx
│   ├── ItemPreview/
│   │   ├── ItemPreviewModal.tsx
│   │   ├── MediaGallery.tsx
│   │   └── InstructionsViewer.tsx
│   ├── AssetPanel/
│   │   ├── AssetPanel.tsx
│   │   ├── AssetItem.tsx
│   │   └── AssetDropZone.tsx
│   ├── BulkActions/
│   │   ├── BulkActionsBar.tsx
│   │   ├── BulkTagDialog.tsx
│   │   └── BulkMoveDialog.tsx
│   ├── dialogs/
│   │   ├── ConfirmDeleteDialog.tsx
│   │   ├── FilterPanel.tsx
│   │   └── SortMenu.tsx
│   └── shared/
│       ├── ItemThumbnail.tsx
│       ├── ContentTypeBadge.tsx
│       ├── TagChip.tsx
│       ├── EmptyState.tsx
│       ├── LoadingState.tsx
│       └── InlineEdit.tsx
└── utils/
    ├── filterUtils.ts
    ├── sortUtils.ts
    └── constants.ts

src/app/test/item-manager/
└── page.tsx
```

### Existing Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemCapture/index.ts` | May export shared types if needed |
| `src/components/ItemCapture/ItemCapture.types.ts` | May add `updatedAt` field to ItemRecord |

---

## Testing Approach

### Unit Tests
- State reducer transitions
- Filter utilities
- Sort comparators
- Search matching logic

### Integration Tests
- Selection state management
- Callback emission verification
- Filter + sort combination behavior

### Manual Testing Checklist
- [ ] iOS Safari 15 on iPhone
- [ ] iOS Safari 15 on iPad
- [ ] Chrome on Android phone
- [ ] Chrome on Android tablet
- [ ] Chrome/Firefox/Edge on desktop
- [ ] Grid view display and interactions
- [ ] List view display and interactions
- [ ] Search functionality
- [ ] All filter combinations
- [ ] All sort options
- [ ] Single item selection
- [ ] Multi-select and bulk delete
- [ ] Bulk tag operations
- [ ] Item preview modal
- [ ] Media gallery swipe/navigation
- [ ] Asset panel add/remove/reorder
- [ ] Inline editing
- [ ] Keyboard navigation throughout
- [ ] Screen reader testing

### Test Harness Validation

```tsx
// /src/app/test/item-manager/page.tsx
'use client';

import { useState } from 'react';
import { ItemManager } from '@/components/ItemManager';
import type { ItemRecord } from '@/components/ItemCapture';

const mockItems: ItemRecord[] = [
  {
    id: '1',
    title: 'Coffee Maker',
    location: 'Kitchen',
    tags: ['appliances', 'morning'],
    contentType: 'media',
    media: [{ id: 'm1', type: 'video', order: 0, file: new Blob(), metadata: { mimeType: 'video/mp4', fileSize: 1024, source: 'capture' } }],
    instructions: 'Press the power button...',
    createdAt: new Date('2024-01-15'),
  },
  // ... more mock items
];

export default function TestItemManager() {
  const [items, setItems] = useState(mockItems);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">ItemManager Test Harness</h1>
      <ItemManager
        items={items}
        onEditItem={(item) => {
          console.log('=== EDIT ITEM ===', item.id);
        }}
        onDeleteItems={(ids) => {
          console.log('=== DELETE ITEMS ===', ids);
          setItems(items.filter(i => !ids.includes(i.id)));
        }}
        onUpdateItem={(item) => {
          console.log('=== UPDATE ITEM ===', item);
          setItems(items.map(i => i.id === item.id ? item : i));
        }}
        config={{
          enableBulkActions: true,
          enableInlineEdit: true,
          enableAssetManagement: true,
        }}
      />
    </div>
  );
}
```

---

## Effort Estimate

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 1 | Foundation (structure, state, basic display) | 2-3 days | High |
| Phase 2 | Search, Filter, Sort | 2-3 days | High |
| Phase 3 | Selection & Bulk Actions | 2-3 days | High |
| Phase 4 | Item Preview/Detail | 3-4 days | Medium |
| Phase 5 | Asset Management | 3-4 days | Medium |
| Phase 6 | Inline Edit & Polish | 2-3 days | High |
| **Total** | **Complete ItemManager component** | **14-20 days** | Medium |

**Confidence Notes:**
- Phases 4 & 5 have medium confidence due to media handling and drag-drop complexity
- Estimates assume single developer, focused work
- Additional buffer recommended for cross-device testing

---

## Open Questions

These are non-blocking but may affect implementation details:

1. **Pagination vs. infinite scroll:** For large item counts, which pattern is preferred? (PRD open question)

2. **Optimistic updates:** Should UI update before callback confirms success? (PRD open question)

3. **Undo support:** Should delete actions be reversible within session? (PRD open question)

4. **Virtual scrolling:** At what item count should we implement virtualization?

5. **Asset upload handling:** Should `onAddAssets` receive File objects or pre-validated MediaItem objects?

6. **Property sync:** How should multi-property mode handle items moving between properties?

---

## References

- [ItemCapture Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Reference architecture
- [ItemCapture Component](/src/components/ItemCapture/) - Existing implementation patterns
- [ItemsManagement Component](/src/components/ItemsManagement.tsx) - Existing list management patterns
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Modal pattern reference
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [@dnd-kit](https://dndkit.com/) - Potential drag-and-drop library
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

---

## Appendix A: Filter State Reference

```typescript
// Example filter combinations
const emptyFilter: FilterState = {};

const singleTypeFilter: FilterState = {
  contentTypes: ['video'],
};

const combinedFilter: FilterState = {
  search: 'coffee',
  contentTypes: ['video', 'image'],
  tags: ['kitchen', 'appliances'],
  locations: ['Kitchen'],
};

const multiPropertyFilter: FilterState = {
  propertyIds: ['property-1', 'property-2'],
  tags: ['important'],
};
```

---

## Appendix B: Sort Comparators Reference

```typescript
// src/components/ItemManager/utils/sortUtils.ts

export const sortComparators: Record<SortOption, (a: ItemRecord, b: ItemRecord) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'created-desc': (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  'created-asc': (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  'updated-desc': (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
  'updated-asc': (a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0),
  'location-asc': (a, b) => (a.location ?? '').localeCompare(b.location ?? ''),
};
```

---

## Appendix C: Default Configuration

```typescript
// src/components/ItemManager/utils/constants.ts

export const DEFAULT_CONFIG: Required<ItemManagerConfig> = {
  defaultView: 'grid',
  allowViewToggle: true,
  enableBulkActions: true,
  enableInlineEdit: true,
  enableAssetManagement: true,
  enableDuplicate: false,
  enableSearch: true,
  enableFilters: true,
  enableSort: true,
  multiPropertyMode: false,
  maxBulkSelection: 100,
  labels: {
    searchPlaceholder: 'Search items...',
    emptyStateTitle: 'No items yet',
    emptyStateDescription: 'Create your first item to get started',
    deleteConfirmTitle: 'Delete Item',
    deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
  },
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Modified' },
  { value: 'updated-asc', label: 'Least Recently Modified' },
  { value: 'location-asc', label: 'Location (A-Z)' },
];

export const CONTENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Photo' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text-only', label: 'Text Only' },
  { value: 'mixed', label: 'Mixed' },
];
```
