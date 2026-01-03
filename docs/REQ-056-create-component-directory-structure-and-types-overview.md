# REQ-056: ItemManager Component Directory Structure and Types - Implementation Overview
*Generated: 2026-01-03 14:30:00*
*Last Modified: 2026-01-03 14:30:00*

## Reference
- **Request**: REQ-056 (ItemManager Component Foundation and Type System)
- **Source**: docs/gen_requests.md
- **Implementation Plan**: docs/prd/item-capture-manager-implementation-plan.md
- **Type**: New Feature (Foundation Setup)
- **Phase**: 1 - Foundation
- **Task ID**: 1.1
- **Size**: S

## Goals
1. Create `/src/components/ItemManager/` directory structure
2. Create `ItemManager.types.ts` with all TypeScript interfaces from the PRD
3. Set up barrel exports in `index.ts` for clean imports
4. Import and re-export shared types from the existing ItemCapture component
5. Ensure zero compilation errors or TypeScript warnings
6. Follow existing project component organization patterns (mirror ItemCapture structure)

## Context from Implementation Plan

### Component Hierarchy (Target Structure)
Per the implementation plan, Task 1.1 establishes the foundation for this hierarchy:

```
ItemManager/
├── index.ts                          # Public export: ItemManager, ItemManagerProps
├── ItemManager.tsx                   # Main orchestrator component (Phase 1.3+)
├── ItemManager.types.ts              # All TypeScript interfaces (THIS TASK)
├── hooks/
│   ├── useItemManagerState.ts        # Central state for selection, filters, sort (Phase 1.2)
│   ├── useItemSearch.ts              # Search/filter logic (Phase 2)
│   ├── useItemSelection.ts           # Multi-select handling (Phase 3)
│   └── useAssetManagement.ts         # Asset panel state and operations (Phase 5)
├── components/
│   ├── ItemToolbar.tsx               # Search, filters, sort, view toggle
│   ├── ItemGrid.tsx                  # Grid view layout
│   ├── ItemList.tsx                  # List view layout
│   ├── ItemCard.tsx                  # Grid item card
│   ├── ItemRow.tsx                   # List item row
│   ├── ItemPreview/                  # Detail preview modal/drawer
│   ├── AssetPanel/                   # Asset management drawer
│   ├── BulkActions/                  # Bulk operations
│   ├── dialogs/                      # Confirmation dialogs
│   └── shared/                       # Shared UI components
└── utils/
    ├── filterUtils.ts                # Filter logic helpers
    ├── sortUtils.ts                  # Sort comparators
    ├── thumbnailUtils.ts             # Thumbnail extraction helpers
    └── constants.ts                  # Default config values
```

### Task Dependencies
- **This Task (1.1)**: No dependencies - can start immediately
- **Task 1.2** (State Management Hook): Depends on this task completing
- **Task 1.3** (Basic ItemManager Shell): Depends on Task 1.2
- **Task 1.4-1.7** (Grid/List views, ItemCard, ItemRow): Depend on Task 1.3

### Existing Patterns to Follow
Per implementation plan analysis of existing codebase:

| Pattern | Example File | Application to This Task |
|---------|--------------|-------------------------|
| Client components | `'use client'` directive | Will be needed in `ItemManager.tsx` (Task 1.3) |
| Props interface | `src/components/ItemCapture/ItemCapture.types.ts` | Interface defined in separate types file |
| Type exports | `src/components/ItemCapture/index.ts` | Central type definitions with re-exports |
| State machine | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based state management |
| List management | `src/components/ItemsManagement.tsx` | Search, filter, table layout pattern |

### Shared Types from ItemCapture
The following types must be imported from ItemCapture (not duplicated):

```typescript
// From src/components/ItemCapture/ItemCapture.types.ts
import type { ItemRecord, MediaItem, MediaMetadata, ApplianceType } from '@/components/ItemCapture';
```

## Implementation Order

### Step 1: Create Directory Structure
Create the base directory and subdirectories for the ItemManager component.

**Directories to create:**
- `/src/components/ItemManager/`
- `/src/components/ItemManager/hooks/`
- `/src/components/ItemManager/components/`
- `/src/components/ItemManager/components/ItemPreview/`
- `/src/components/ItemManager/components/AssetPanel/`
- `/src/components/ItemManager/components/BulkActions/`
- `/src/components/ItemManager/components/dialogs/`
- `/src/components/ItemManager/components/shared/`
- `/src/components/ItemManager/utils/`

### Step 2: Create TypeScript Types File
Create `ItemManager.types.ts` with all interfaces defined in the implementation plan.

**Interfaces to implement:**

#### Main Component Props
1. `ItemManagerProps` - Main component props
2. `ItemManagerConfig` - Configuration options for component behavior
3. `ItemManagerLabels` - Customizable labels for internationalization
4. `ItemManagerClassNames` - CSS class name overrides for styling

#### Extended/New Types
5. `ItemRecordExtended` - Extended ItemRecord with manager-specific properties
6. `Property` - Property definition for multi-property mode
7. `FilterState` - Filter state structure
8. `SortOption` - Sort option type (union type)
9. `ItemActions` - Actions available for each item

#### State Management Types
10. `ItemManagerState` - State machine state interface
11. `ItemManagerAction` - Action types for reducer (discriminated union)

#### Render Props Types
12. `ToolbarRenderProps` - Props passed to custom toolbar renderer
13. `ConfirmDialogProps` - Props for confirm dialog customization

### Step 3: Create Barrel Export File
Create `index.ts` with exports for public consumption.

**Exports:**
- All public types from `ItemManager.types.ts`
- Re-export relevant types from ItemCapture (`ItemRecord`, `MediaItem`, etc.)
- Placeholder export comment for future `ItemManager` component

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from barrel export
- Confirm ItemCapture types are correctly re-exported

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/components/ItemManager/index.ts`
- **Purpose**: Barrel export file for clean imports
- **Exports**:
  - All public types from `ItemManager.types.ts`
  - Re-exported types from ItemCapture: `ItemRecord`, `MediaItem`, `MediaMetadata`, `ApplianceType`
  - Future: `ItemManager` component (Task 1.3)

#### `/src/components/ItemManager/ItemManager.types.ts`
- **Purpose**: Central TypeScript type definitions for ItemManager
- **Interfaces**:
  - `ItemManagerProps` - Main component props (items, callbacks, config, classNames)
  - `ItemManagerConfig` - Configuration options (view mode, feature flags, constraints, labels)
  - `ItemManagerLabels` - Customizable UI text labels
  - `ItemManagerClassNames` - CSS class overrides for styling customization
  - `ItemRecordExtended` - Extended ItemRecord with propertyId, updatedAt, mediaUrls
  - `Property` - Property definition (id, name, address)
  - `FilterState` - Filter state (search, contentTypes, tags, locations, propertyIds)
  - `ItemActions` - Actions per item (edit, delete, duplicate, select, etc.)
  - `ItemManagerState` - Complete state object for reducer
  - `ToolbarRenderProps` - Props for custom toolbar rendering
  - `ConfirmDialogProps` - Props for confirm dialog customization
- **Types**:
  - `SortOption` - String literal union for sort options
  - `ItemManagerAction` - Discriminated union for reducer actions

### Directories to Create
- `/src/components/ItemManager/` - Root directory
- `/src/components/ItemManager/hooks/` - Custom React hooks
- `/src/components/ItemManager/components/` - Sub-components root
- `/src/components/ItemManager/components/ItemPreview/` - Item preview modal components
- `/src/components/ItemManager/components/AssetPanel/` - Asset management panel components
- `/src/components/ItemManager/components/BulkActions/` - Bulk actions components
- `/src/components/ItemManager/components/dialogs/` - Dialog components
- `/src/components/ItemManager/components/shared/` - Shared UI components
- `/src/components/ItemManager/utils/` - Utility functions

### Existing Files (No Modification Required)
This task does not require modification of any existing files. All changes are additive.

The existing ItemCapture component will be imported from, but not modified:
- `/src/components/ItemCapture/ItemCapture.types.ts` - Types to import
- `/src/components/ItemCapture/index.ts` - Barrel exports to import from

## Technical Specifications

### Main Props Interface (From Implementation Plan)

```typescript
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
```

### Configuration Interface (From Implementation Plan)

```typescript
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
```

### State Interface (From Implementation Plan)

```typescript
/**
 * Complete state object managed by useItemManagerState hook.
 */
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
```

### Sort Options (From Implementation Plan Appendix)

```typescript
type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';
```

### Filter State (From Implementation Plan)

```typescript
interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}
```

## Success Validation Checklist

### Directory Structure
- [ ] `/src/components/ItemManager/` directory exists
- [ ] `/src/components/ItemManager/hooks/` directory exists
- [ ] `/src/components/ItemManager/components/` directory exists
- [ ] `/src/components/ItemManager/components/ItemPreview/` directory exists
- [ ] `/src/components/ItemManager/components/AssetPanel/` directory exists
- [ ] `/src/components/ItemManager/components/BulkActions/` directory exists
- [ ] `/src/components/ItemManager/components/dialogs/` directory exists
- [ ] `/src/components/ItemManager/components/shared/` directory exists
- [ ] `/src/components/ItemManager/utils/` directory exists

### Type Definitions
- [ ] `ItemManager.types.ts` contains all required interfaces
- [ ] `ItemManagerProps` interface is complete with all props from implementation plan
- [ ] `ItemManagerConfig` interface is complete with all feature flags
- [ ] `ItemManagerLabels` interface is defined
- [ ] `ItemManagerClassNames` interface is defined
- [ ] `ItemRecordExtended` interface extends ItemRecord correctly
- [ ] `Property` interface is defined
- [ ] `FilterState` interface is defined
- [ ] `SortOption` type is defined
- [ ] `ItemActions` interface is defined
- [ ] Internal state types (`ItemManagerState`, `ItemManagerAction`) are defined
- [ ] Render props types (`ToolbarRenderProps`, `ConfirmDialogProps`) are defined

### Barrel Export
- [ ] `index.ts` exports all public types
- [ ] `index.ts` re-exports ItemCapture types (ItemRecord, MediaItem, etc.)
- [ ] Import `@/components/ItemManager` resolves correctly
- [ ] Named imports work: `import { ItemManagerProps, ItemRecord } from '@/components/ItemManager'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase or ItemCapture types

## Notes

### Pattern Alignment
- Follow existing project conventions observed in `src/components/ItemCapture/`
- Mirror the ItemCapture types file structure and documentation style
- Use JSDoc comments for interface properties (matches implementation plan documentation style)
- Export types using ES module syntax
- Use descriptive section comments (e.g., `// =============================================================================`)

### Future Integration Points
- Types will be consumed by state management hook (Task 1.2)
- `ItemManagerProps` will be used by main ItemManager component (Task 1.3)
- `ItemActions` interface will be used by ItemCard and ItemRow components (Tasks 1.4, 1.5)
- `FilterState` and `SortOption` will be used by search/filter hooks (Phase 2)
- `ItemRecordExtended` provides additional fields for manager-specific operations

### Shared Type Strategy
Per the implementation plan:
- **Import from ItemCapture**: `ItemRecord`, `MediaItem`, `MediaMetadata`, `ApplianceType`
- **Extend for ItemManager**: `ItemRecordExtended` adds `propertyId`, `updatedAt`, `mediaUrls`
- **New for ItemManager**: All manager-specific types (config, state, actions, filters, etc.)

This ensures:
1. Type consistency across the item lifecycle (capture → manage)
2. No type duplication or drift between components
3. Clear separation of concerns (capture types vs. manager types)

## Dependencies
- TypeScript 5.x (existing in project)
- React 19.x types (existing in project)
- ItemCapture component types (existing in project)
- No new npm packages required
- No runtime dependencies (types-only file)

## Risk Assessment
- **Risk Level**: Very Low
- **Rationale**:
  - Purely additive changes (no modifications to existing code)
  - Type-only files have no runtime impact
  - Standard directory creation operations
  - No external dependencies
  - Mirror of proven ItemCapture pattern
  - All types defined in the reviewed implementation plan
