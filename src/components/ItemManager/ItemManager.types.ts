/**
 * ItemManager Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the ItemManager
 * component. These types define the component's props, configuration options,
 * data models, and internal state management.
 *
 * @module ItemManager/types
 * @see docs/prd/item-capture-manager-implementation-plan.md
 * @lastModified 2026-01-03 (REQ-080 Task 2 - Added asset management type definitions)
 */

import type { ItemRecord, MediaItem, MediaMetadata, ApplianceType } from '@/components/ItemCapture';

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration options for ItemManager behavior.
 * All properties are optional with sensible defaults.
 */
export interface ItemManagerConfig {
  /**
   * Default view mode when component mounts.
   * @default 'grid'
   */
  defaultView?: 'grid' | 'list';

  /**
   * Whether to allow toggling between grid and list views.
   * @default true
   */
  allowViewToggle?: boolean;

  /**
   * Enable bulk selection and actions on multiple items.
   * @default true
   */
  enableBulkActions?: boolean;

  /**
   * Enable inline editing of item fields (title, location, tags).
   * @default true
   */
  enableInlineEdit?: boolean;

  /**
   * Enable the asset management panel for adding/removing/reordering media.
   * @default true
   */
  enableAssetManagement?: boolean;

  /**
   * Enable item duplication functionality.
   * @default true
   */
  enableDuplicate?: boolean;

  /**
   * Enable search functionality.
   * @default true
   */
  enableSearch?: boolean;

  /**
   * Enable filter panel with content type, tags, and location filters.
   * @default true
   */
  enableFilters?: boolean;

  /**
   * Enable sort functionality.
   * @default true
   */
  enableSort?: boolean;

  /**
   * Enable multi-property mode for managing items across properties.
   * @default false
   */
  multiPropertyMode?: boolean;

  /**
   * Maximum number of items that can be selected at once for bulk actions.
   * @default 50
   */
  maxBulkSelection?: number;

  /**
   * Custom labels for UI text customization.
   */
  labels?: ItemManagerLabels;
}

/**
 * Customizable UI labels for the ItemManager component.
 * Allows consumers to override default text for localization or branding.
 */
export interface ItemManagerLabels {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;

  /** Title shown when no items exist */
  emptyStateTitle?: string;

  /** Description shown when no items exist */
  emptyStateDescription?: string;

  /** Title for the delete confirmation dialog */
  deleteConfirmTitle?: string;

  /** Message for the delete confirmation dialog (supports {count} placeholder) */
  deleteConfirmMessage?: string;

  /** Label for the edit action */
  editLabel?: string;

  /** Label for the delete action */
  deleteLabel?: string;

  /** Label for the duplicate action */
  duplicateLabel?: string;

  /** Label for the manage assets action */
  manageAssetsLabel?: string;

  /** Label for grid view toggle */
  gridViewLabel?: string;

  /** Label for list view toggle */
  listViewLabel?: string;

  /** Label for the filters button */
  filtersLabel?: string;

  /** Label for the sort dropdown */
  sortLabel?: string;

  /** Label shown when search yields no results */
  noResultsTitle?: string;

  /** Description shown when search yields no results */
  noResultsDescription?: string;
}

/**
 * CSS class name overrides for styling the ItemManager component.
 * Allows consumers to apply custom styling to specific elements.
 */
export interface ItemManagerClassNames {
  /** Root container element */
  container?: string;

  /** Toolbar/header section */
  toolbar?: string;

  /** Search input element */
  searchInput?: string;

  /** Filter panel container */
  filterPanel?: string;

  /** Grid view container */
  itemGrid?: string;

  /** List view container */
  itemList?: string;

  /** Individual item card (grid view) */
  itemCard?: string;

  /** Individual item row (list view) */
  itemRow?: string;

  /** Applied to selected items */
  selectedItem?: string;

  /** Preview modal container */
  previewModal?: string;

  /** Asset panel container */
  assetPanel?: string;

  /** Confirmation dialog container */
  confirmDialog?: string;

  /** Empty state container */
  emptyState?: string;

  /** Loading state container */
  loadingState?: string;
}

// =============================================================================
// Data Model Types
// =============================================================================

/**
 * Extended item record with additional properties for the manager context.
 * Extends the base ItemRecord from ItemCapture with manager-specific fields.
 */
export interface ItemRecordExtended extends ItemRecord {
  /**
   * Associated property ID for multi-property mode.
   */
  propertyId?: string;

  /**
   * Last update timestamp (for sorting and display).
   */
  updatedAt?: Date;

  /**
   * Pre-signed URLs for media items (populated by backend).
   * Maps media item IDs to their accessible URLs.
   */
  mediaUrls?: Record<string, string>;
}

/**
 * Property definition for multi-property mode.
 * Represents a rental property that can contain multiple items.
 *
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.7 - Extended with nickname and property_types)
 */
export interface Property {
  /** Unique identifier for the property */
  id: string;

  /** Display name of the property */
  name?: string;

  /** Friendly nickname for the property */
  nickname?: string;

  /** Optional physical address */
  address?: string;

  /** Property type information */
  property_types?: {
    display_name: string;
  };
}

/**
 * Filter state for filtering items in the list.
 * All fields are optional - omitted fields are not applied as filters.
 */
export interface FilterState {
  /** Search query string for title/location matching */
  search?: string;

  /**
   * Filter by content type(s).
   * Note: 'media' maps to both 'video' and 'image' content types.
   */
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;

  /** Filter by tag(s) - items must have at least one matching tag */
  tags?: string[];

  /** Filter by location(s) - items must match at least one location */
  locations?: string[];

  /** Filter by property ID(s) - for multi-property mode */
  propertyIds?: string[];
}

/**
 * Sort options for ordering the item list.
 * Format: field-direction (e.g., 'title-asc' = sort by title ascending).
 */
export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';

// =============================================================================
// Action Types
// =============================================================================

/**
 * Available actions for each item in the manager.
 * Provided to custom render functions for item interaction.
 */
export interface ItemActions {
  /**
   * Navigate to edit the item (full edit flow).
   */
  edit: () => void;

  /**
   * Delete the item (shows confirmation dialog).
   */
  delete: () => void;

  /**
   * Duplicate the item (creates a copy).
   */
  duplicate: () => void;

  /**
   * Open the asset management panel for this item.
   */
  manageAssets: () => void;

  /**
   * Add this item to the current selection.
   */
  select: () => void;

  /**
   * Remove this item from the current selection.
   */
  deselect: () => void;

  /**
   * Whether this item is currently selected.
   */
  isSelected: boolean;
}

// =============================================================================
// Render Props Types
// =============================================================================

/**
 * Props provided to custom toolbar render function.
 * Exposes all toolbar state and callbacks for custom implementations.
 */
export interface ToolbarRenderProps {
  /** Current search query string */
  searchQuery: string;

  /** Callback to update search query */
  onSearchChange: (query: string) => void;

  /** Current filter state */
  filters: FilterState;

  /** Callback to update filters (partial update supported) */
  onFiltersChange: (filters: Partial<FilterState>) => void;

  /** Callback to clear all filters */
  onClearFilters: () => void;

  /** Current sort option */
  sortBy: SortOption;

  /** Callback to change sort option */
  onSortChange: (sort: SortOption) => void;

  /** Current view mode */
  viewMode: 'grid' | 'list';

  /** Callback to change view mode */
  onViewModeChange: (mode: 'grid' | 'list') => void;

  /** Number of currently selected items */
  selectedCount: number;

  /** Total number of items (unfiltered) */
  totalCount: number;

  /** Number of items after filtering */
  filteredCount: number;

  /** Whether any filters are currently applied */
  hasFilters: boolean;

  /** Whether the filter panel is currently open */
  isFilterPanelOpen: boolean;

  /** Callback to toggle the filter panel */
  onToggleFilterPanel: () => void;

  /** Current configuration (read-only) */
  config: Required<ItemManagerConfig>;
}

/**
 * Props for custom confirmation dialog render function.
 * Used for delete confirmations and other destructive actions.
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is currently open */
  isOpen: boolean;

  /** Dialog title */
  title: string;

  /** Dialog message/content */
  message: string;

  /** Label for the confirm button (default: 'Confirm') */
  confirmLabel?: string;

  /** Label for the cancel button (default: 'Cancel') */
  cancelLabel?: string;

  /** Whether this is a destructive action (affects button styling) */
  isDestructive?: boolean;

  /** Callback when user confirms */
  onConfirm: () => void;

  /** Callback when user cancels */
  onCancel: () => void;
}

// =============================================================================
// Item Card Props Interface
// =============================================================================

/**
 * Props for the ItemCard component.
 * Used for displaying items in grid view.
 */
export interface ItemCardProps {
  /** The item record to display */
  item: ItemRecord;
  /** Callback when card is clicked (for preview) */
  onPreviewClick: (item: ItemRecord) => void;
  /** Callback when selection checkbox changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Whether the card is currently selected */
  isSelected: boolean;
  /** Whether selection mode is active (shows checkbox) */
  isSelectionMode: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Item Row Props Interface (REQ-059)
// =============================================================================

/**
 * Props for the ItemRow component.
 * Used for displaying items in list view with comprehensive metadata.
 *
 * @lastModified 2026-01-03 (REQ-059 Task 1)
 */
export interface ItemRowProps {
  /** The item record to display */
  item: ItemRecord;
  /** Callback when row is clicked (for preview) */
  onPreviewClick: (item: ItemRecord) => void;
  /** Callback when selection checkbox changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Whether the row is currently selected */
  isSelected: boolean;
  /** Whether selection mode is active (shows checkbox) */
  isSelectionMode: boolean;
  /** Callback when edit action is triggered */
  onEdit: (item: ItemRecord) => void;
  /** Callback when delete action is triggered */
  onDelete: (item: ItemRecord) => void;
  /** Optional callback for manage assets action */
  onManageAssets?: (item: ItemRecord) => void;
  /** Optional callback for duplicate action */
  onDuplicate?: (item: ItemRecord) => void;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Grid and List View Props Interfaces (REQ-060)
// =============================================================================

/**
 * Props for the ItemGrid component.
 * Renders items in a responsive multi-column grid layout.
 *
 * @lastModified 2026-01-03 (REQ-060 Task 1)
 */
export interface ItemGridProps {
  /** Array of item records to display */
  items: ItemRecord[];
  /** Callback when an item card is clicked for preview */
  onItemPreview: (item: ItemRecord) => void;
  /** Callback when selection state changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Set of currently selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the ItemList component.
 * Renders items in a vertical list layout with table-like structure.
 *
 * @lastModified 2026-01-03 (REQ-060 Task 1)
 */
export interface ItemListProps {
  /** Array of item records to display */
  items: ItemRecord[];
  /** Callback when an item row is clicked for preview */
  onItemPreview: (item: ItemRecord) => void;
  /** Callback when selection state changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Set of currently selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Callback when edit action is triggered */
  onEdit: (item: ItemRecord) => void;
  /** Callback when delete action is triggered */
  onDelete: (item: ItemRecord) => void;
  /** Optional callback for asset management action */
  onManageAssets?: (item: ItemRecord) => void;
  /** Optional callback for duplicate action */
  onDuplicate?: (item: ItemRecord) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the ViewModeToggle component.
 * Toggle control for switching between grid and list views.
 *
 * @lastModified 2026-01-03 (REQ-060 Task 1)
 */
export interface ViewModeToggleProps {
  /** Current view mode */
  viewMode: 'grid' | 'list';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Empty and Loading State Props Interfaces (REQ-061)
// =============================================================================

/**
 * Props for the EmptyState component.
 * Displays when the item collection is empty.
 *
 * @lastModified 2026-01-03 (REQ-061 Task 1.7.1)
 */
export interface EmptyStateProps {
  /** Title text for empty state (default: "No items yet") */
  title?: string;
  /** Description text for empty state (default: "Create your first item to get started") */
  description?: string;
  /** Custom icon component to display (default: Package icon) */
  icon?: React.ReactNode;
  /** Call-to-action element (button, link, etc.) */
  action?: React.ReactNode;
  /** Additional CSS classes for styling customization */
  className?: string;
}

/**
 * Props for the LoadingState component.
 * Displays skeleton animation while content is loading.
 *
 * @lastModified 2026-01-03 (REQ-061 Task 1.7.1)
 */
export interface LoadingStateProps {
  /** View mode to determine skeleton layout ('grid' | 'list') */
  viewMode?: 'grid' | 'list';
  /** Number of skeleton items to display (default: 6 for grid, 5 for list) */
  itemCount?: number;
  /** Additional CSS classes for styling customization */
  className?: string;
}

// =============================================================================
// Main Component Props Interface
// =============================================================================

/**
 * Main props interface for the ItemManager component.
 * Provides comprehensive control over data, callbacks, configuration, and rendering.
 */
export interface ItemManagerProps {
  // ---------------------------------------------------------------------------
  // Required Data
  // ---------------------------------------------------------------------------

  /**
   * Array of item records to display and manage.
   * Must be provided even if empty (use [] for no items).
   */
  items: ItemRecord[];

  // ---------------------------------------------------------------------------
  // Optional Data
  // ---------------------------------------------------------------------------

  /**
   * Array of properties for multi-property mode.
   * Only used when config.multiPropertyMode is true.
   */
  properties?: Property[];

  /**
   * Whether the item list is currently loading.
   * Shows loading state UI when true.
   */
  loading?: boolean;

  /**
   * Error state for the item list.
   * Shows error state UI when not null.
   */
  error?: Error | null;

  // ---------------------------------------------------------------------------
  // Required Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Called when user requests to edit an item (opens edit flow).
   * @param item - The item to edit
   */
  onEditItem: (item: ItemRecord) => void;

  /**
   * Called when user confirms deletion of one or more items.
   * @param ids - Array of item IDs to delete
   */
  onDeleteItems: (ids: string[]) => void;

  /**
   * Called when an item is updated (e.g., inline edit).
   * @param item - The updated item record
   */
  onUpdateItem: (item: ItemRecord) => void;

  // ---------------------------------------------------------------------------
  // Optional Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Called when user adds assets to an item.
   * @param itemId - ID of the item receiving assets
   * @param assets - Array of File objects to add
   */
  onAddAssets?: (itemId: string, assets: File[]) => void;

  /**
   * Called when user removes assets from an item.
   * @param itemId - ID of the item
   * @param assetIds - Array of asset IDs to remove
   */
  onRemoveAssets?: (itemId: string, assetIds: string[]) => void;

  /**
   * Called when user reorders assets within an item.
   * @param itemId - ID of the item
   * @param orderedIds - Array of asset IDs in new order
   */
  onReorderAssets?: (itemId: string, orderedIds: string[]) => void;

  /**
   * Called when user duplicates an item.
   * @param item - The item to duplicate
   */
  onDuplicateItem?: (item: ItemRecord) => void;

  /**
   * Called when selection changes (for bulk actions).
   * @param selectedIds - Array of currently selected item IDs
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  /**
   * Configuration options for ItemManager behavior.
   */
  config?: ItemManagerConfig;

  // ---------------------------------------------------------------------------
  // Render Customization
  // ---------------------------------------------------------------------------

  /**
   * Custom render function for individual items.
   * @param item - The item to render
   * @param actions - Available actions for the item
   * @returns React node to render
   */
  renderItem?: (item: ItemRecord, actions: ItemActions) => React.ReactNode;

  /**
   * Custom render function for empty state (no items).
   * @returns React node to render
   */
  renderEmptyState?: () => React.ReactNode;

  /**
   * Custom render function for loading state.
   * @returns React node to render
   */
  renderLoadingState?: () => React.ReactNode;

  /**
   * Custom render function for error state.
   * @param error - The error object
   * @returns React node to render
   */
  renderErrorState?: (error: Error) => React.ReactNode;

  /**
   * Custom render function for the toolbar.
   * @param props - Toolbar render props with state and callbacks
   * @returns React node to render
   */
  renderToolbar?: (props: ToolbarRenderProps) => React.ReactNode;

  /**
   * Custom render function for item preview modal content.
   * @param item - The item being previewed
   * @returns React node to render
   */
  renderItemPreview?: (item: ItemRecord) => React.ReactNode;

  /**
   * Custom render function for confirmation dialogs.
   * @param props - Dialog props with state and callbacks
   * @returns React node to render
   */
  renderConfirmDialog?: (props: ConfirmDialogProps) => React.ReactNode;

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * CSS class name overrides for component elements.
   */
  classNames?: ItemManagerClassNames;
}

// =============================================================================
// Internal State Types (for component development)
// =============================================================================

/**
 * Internal state for the ItemManager component.
 * Managed by useItemManagerState hook using reducer pattern.
 */
export interface ItemManagerState {
  // ---------------------------------------------------------------------------
  // View State
  // ---------------------------------------------------------------------------

  /** Current view mode (grid or list) */
  viewMode: 'grid' | 'list';

  // ---------------------------------------------------------------------------
  // Search & Filter State
  // ---------------------------------------------------------------------------

  /** Current search query */
  searchQuery: string;

  /** Current filter state */
  filters: FilterState;

  /** Current sort option */
  sortBy: SortOption;

  // ---------------------------------------------------------------------------
  // Selection State
  // ---------------------------------------------------------------------------

  /** Set of currently selected item IDs */
  selectedIds: Set<string>;

  /** Whether selection mode is active (for mobile/touch UI) */
  isSelectionMode: boolean;

  // ---------------------------------------------------------------------------
  // UI State
  // ---------------------------------------------------------------------------

  /** Item currently being previewed (null if preview closed) */
  previewItem: ItemRecord | null;

  /** Item with asset panel open (null if panel closed) */
  assetPanelItem: ItemRecord | null;

  /** Whether the filter panel is expanded */
  isFilterPanelOpen: boolean;

  // ---------------------------------------------------------------------------
  // Inline Edit State
  // ---------------------------------------------------------------------------

  /** ID of item currently being edited inline (null if not editing) */
  editingItemId: string | null;

  /** Field currently being edited inline (null if not editing) */
  editingField: 'title' | 'location' | 'tags' | null;
}

/**
 * All actions that can be dispatched to modify ItemManager state.
 * Uses discriminated union pattern for type safety.
 */
export type ItemManagerAction =
  // ---------------------------------------------------------------------------
  // View Actions
  // ---------------------------------------------------------------------------

  /** Set the view mode to grid or list */
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }

  // ---------------------------------------------------------------------------
  // Search & Filter Actions
  // ---------------------------------------------------------------------------

  /** Set the search query string */
  | { type: 'SET_SEARCH_QUERY'; payload: string }

  /** Update filters (partial update supported) */
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }

  /** Clear all filters and search */
  | { type: 'CLEAR_FILTERS' }

  /** Set the sort option */
  | { type: 'SET_SORT'; payload: SortOption }

  // ---------------------------------------------------------------------------
  // Selection Actions
  // ---------------------------------------------------------------------------

  /** Add an item to the selection */
  | { type: 'SELECT_ITEM'; payload: string }

  /** Remove an item from the selection */
  | { type: 'DESELECT_ITEM'; payload: string }

  /** Select all items (from provided IDs) */
  | { type: 'SELECT_ALL'; payload: string[] }

  /** Clear all selections */
  | { type: 'CLEAR_SELECTION' }

  /** Toggle selection mode on/off */
  | { type: 'TOGGLE_SELECTION_MODE' }

  // ---------------------------------------------------------------------------
  // Preview & Panel Actions
  // ---------------------------------------------------------------------------

  /** Open the item preview modal */
  | { type: 'OPEN_PREVIEW'; payload: ItemRecord }

  /** Close the item preview modal */
  | { type: 'CLOSE_PREVIEW' }

  /** Open the asset panel for an item */
  | { type: 'OPEN_ASSET_PANEL'; payload: ItemRecord }

  /** Close the asset panel */
  | { type: 'CLOSE_ASSET_PANEL' }

  /** Toggle the filter panel open/closed */
  | { type: 'TOGGLE_FILTER_PANEL' }

  // ---------------------------------------------------------------------------
  // Inline Edit Actions
  // ---------------------------------------------------------------------------

  /** Start inline editing of an item field */
  | { type: 'START_INLINE_EDIT'; payload: { itemId: string; field: 'title' | 'location' | 'tags' } }

  /** End inline editing (commit or cancel) */
  | { type: 'END_INLINE_EDIT' };

// =============================================================================
// ItemToolbar Types (REQ-063)
// =============================================================================

/**
 * CSS class name overrides for ItemToolbar sub-components.
 * Allows consumers to apply custom styling to specific toolbar elements.
 *
 * @lastModified 2026-01-03 (REQ-063 Task 2.2.1)
 */
export interface ItemToolbarClassNames {
  /** Main toolbar container */
  container?: string;
  /** View toggle button group wrapper */
  viewToggle?: string;
  /** Search input wrapper */
  searchContainer?: string;
  /** Filters section wrapper */
  filtersContainer?: string;
  /** Sort menu wrapper */
  sortContainer?: string;
  /** Result count display */
  resultCount?: string;
  /** Clear filters button */
  clearButton?: string;
}

/**
 * Props for the ItemToolbar component.
 * Provides comprehensive control over toolbar display, search, filters, and sort.
 *
 * @lastModified 2026-01-03 (REQ-063 Task 2.2.1)
 */
export interface ItemToolbarProps {
  // ---------------------------------------------------------------------------
  // View Mode Props
  // ---------------------------------------------------------------------------

  /** Current view mode ('grid' or 'list') */
  viewMode: 'grid' | 'list';

  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void;

  /**
   * Whether to show the view toggle buttons.
   * @default true
   */
  allowViewToggle?: boolean;

  // ---------------------------------------------------------------------------
  // Search Props
  // ---------------------------------------------------------------------------

  /** Current search query string */
  searchQuery: string;

  /** Callback when search query changes */
  onSearchChange: (query: string) => void;

  /**
   * Whether to enable search functionality.
   * @default true
   */
  enableSearch?: boolean;

  // ---------------------------------------------------------------------------
  // Filter Props
  // ---------------------------------------------------------------------------

  /** Current filter state */
  filters: FilterState;

  /** Callback when filters change (supports partial updates) */
  onFiltersChange: (filters: Partial<FilterState>) => void;

  /** Callback to clear all filters and search */
  onClearFilters: () => void;

  /**
   * Whether to enable filter functionality.
   * @default true
   */
  enableFilters?: boolean;

  /**
   * Available filter options extracted from items.
   * Used to populate filter dropdowns/chips.
   */
  filterOptions?: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
  };

  // ---------------------------------------------------------------------------
  // Sort Props
  // ---------------------------------------------------------------------------

  /** Current sort option */
  sortBy: SortOption;

  /** Callback when sort option changes */
  onSortChange: (sort: SortOption) => void;

  /**
   * Whether to enable sort functionality.
   * @default true
   */
  enableSort?: boolean;

  // ---------------------------------------------------------------------------
  // Result Props
  // ---------------------------------------------------------------------------

  /** Number of items after filtering */
  resultCount: number;

  /** Total number of items before filtering */
  totalCount: number;

  /** Whether any filters or search is currently active */
  isFiltered: boolean;

  // ---------------------------------------------------------------------------
  // Customization Props
  // ---------------------------------------------------------------------------

  /** Custom labels for UI text customization */
  labels?: ItemManagerLabels;

  /** CSS class name overrides for sub-components */
  classNames?: ItemToolbarClassNames;

  // ---------------------------------------------------------------------------
  // Render Overrides
  // ---------------------------------------------------------------------------

  /**
   * Custom render function for the search input.
   * Receives value, onChange callback, and placeholder text.
   */
  renderSearch?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => React.ReactNode;

  /**
   * Custom render function for the filters section.
   * Receives current filters, onChange callback, and available options.
   */
  renderFilters?: (props: {
    filters: FilterState;
    onChange: (filters: Partial<FilterState>) => void;
    options: { contentTypes: string[]; tags: string[]; locations: string[] };
  }) => React.ReactNode;

  /**
   * Custom render function for the sort menu.
   * Receives current sort option and onChange callback.
   */
  renderSort?: (props: {
    sortBy: SortOption;
    onChange: (sort: SortOption) => void;
  }) => React.ReactNode;
}

// =============================================================================
// BulkActions Types (REQ-072)
// =============================================================================

/**
 * Props for the BulkTagDialog component.
 * Used for bulk tag add/remove operations on multiple items.
 *
 * @lastModified 2026-01-03 (REQ-072 Task 3.5.9)
 */
export interface BulkTagDialogProps {
  /** Dialog mode - determines add or remove operation */
  mode: 'add' | 'remove';
  /** Array of selected items to apply tag operation to */
  selectedItems: ItemRecord[];
  /** All existing tags in the system for autocomplete suggestions */
  existingTags: string[];
  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during operation */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the BulkMoveDialog component.
 * Used for moving multiple items to a different property in multi-property mode.
 *
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.7)
 */
export interface BulkMoveDialogProps {
  /** Array of selected items to move */
  selectedItems: ItemRecord[];
  /** Available properties to move items to */
  properties: Property[];
  /** Current property ID (will be filtered out of destination options) */
  currentPropertyId?: string;
  /** Callback when move is confirmed with destination property ID */
  onConfirm: (destinationPropertyId: string) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during move operation */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// ItemPreviewModal Types (REQ-074)
// =============================================================================

/**
 * Props for the ItemPreviewModal component.
 * Controls the modal/drawer display for item preview.
 *
 * @lastModified 2026-01-03 (REQ-079 Task 4.6 - Added preview actions support)
 */
export interface ItemPreviewModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;

  /** Callback when modal should close */
  onClose: () => void;

  /** The item being previewed (null when closed) */
  item: ItemRecord | null;

  /** Optional title override (defaults to item.title) */
  title?: string;

  /** Content to render inside the modal */
  children: React.ReactNode;

  /** Optional CSS class for the root element */
  className?: string;

  /** Optional CSS class for content container */
  contentClassName?: string;

  // ---------------------------------------------------------------------------
  // Preview Action Callbacks (REQ-079)
  // ---------------------------------------------------------------------------

  /** Callback when Edit button is clicked */
  onEditItem?: (item: ItemRecord) => void;

  /** Callback when Delete is confirmed (array format for bulk delete compatibility) */
  onDeleteItems?: (ids: string[]) => void;

  /** Callback when Manage Assets button is clicked (dispatches OPEN_ASSET_PANEL) */
  onManageAssets?: (item: ItemRecord) => void;

  // ---------------------------------------------------------------------------
  // Preview Actions Configuration (REQ-079)
  // ---------------------------------------------------------------------------

  /** Configuration options for preview actions */
  config?: {
    /** Enable asset management button (default: true) */
    enableAssetManagement?: boolean;
  };
}

// =============================================================================
// Asset Management Types (REQ-080)
// =============================================================================

/**
 * Error codes for asset management operations.
 */
export type AssetManagementErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'COMMIT_FAILED'
  | 'SESSION_NOT_FOUND'
  | 'UNKNOWN_ERROR';

/**
 * Structured error for asset management operations.
 */
export interface AssetManagementError {
  /** Error code for programmatic handling */
  code: AssetManagementErrorCode;
  /** User-friendly error message */
  message: string;
}

/**
 * Represents an asset pending addition (not yet committed).
 */
export interface PendingAsset {
  /** Temporary UUID for this pending asset */
  id: string;
  /** The file to be added */
  file: File;
  /** Generated preview URL (object URL) */
  previewUrl: string;
  /** Detected media type */
  type: 'video' | 'image' | 'pdf';
  /** Timestamp when added */
  addedAt: Date;
}

/**
 * Complete state for asset management operations.
 */
export interface AssetManagementState {
  /** The item whose assets are being managed */
  itemId: string | null;
  /** Original committed assets (read-only reference) */
  originalAssets: MediaItem[];
  /** Assets added but not yet committed */
  pendingAdditions: PendingAsset[];
  /** IDs of assets marked for removal */
  pendingRemovals: Set<string>;
  /** Current order of all assets (committed + pending additions, minus removals) */
  currentOrder: string[];
  /** Whether any changes have been made */
  isDirty: boolean;
  /** Whether a commit operation is in progress */
  isCommitting: boolean;
  /** Error from last operation */
  error: AssetManagementError | null;
}

/**
 * Actions for the asset management reducer.
 */
export type AssetManagementAction =
  // Session management
  | { type: 'START_SESSION'; payload: { itemId: string; assets: MediaItem[] } }
  | { type: 'END_SESSION' }
  // Asset operations
  | { type: 'ADD_ASSET'; payload: PendingAsset }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'REORDER_ASSETS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UNDO_REMOVAL'; payload: string }
  // Commit/discard
  | { type: 'START_COMMIT' }
  | { type: 'COMMIT_SUCCESS' }
  | { type: 'COMMIT_ERROR'; payload: string }
  | { type: 'DISCARD_CHANGES' }
  // Error handling
  | { type: 'SET_ERROR'; payload: AssetManagementError }
  | { type: 'CLEAR_ERROR' };

/**
 * Configuration options for useAssetManagement hook.
 */
export interface UseAssetManagementOptions {
  /** Callback when assets are added during commit */
  onAddAssets?: (itemId: string, assets: File[]) => Promise<void>;
  /** Callback when assets are removed during commit */
  onRemoveAssets?: (itemId: string, assetIds: string[]) => Promise<void>;
  /** Callback when assets are reordered during commit */
  onReorderAssets?: (itemId: string, orderedIds: string[]) => Promise<void>;
  /** Allowed media types for validation */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Return type for useAssetManagement hook.
 */
export interface UseAssetManagementReturn {
  // State
  /** Whether a management session is active */
  isActive: boolean;
  /** Current assets (committed + pending additions - removals, in order) */
  currentAssets: (MediaItem | PendingAsset)[];
  /** Assets pending addition */
  pendingAdditions: PendingAsset[];
  /** IDs of assets pending removal */
  pendingRemovalIds: string[];
  /** Whether any changes have been made */
  isDirty: boolean;
  /** Whether commit is in progress */
  isCommitting: boolean;
  /** Current error state */
  error: AssetManagementError | null;

  // Session Actions
  /** Start managing assets for an item */
  startSession: (itemId: string, assets: MediaItem[]) => void;
  /** End session (must commit or discard first) */
  endSession: () => void;

  // Asset Actions
  /** Add a file to pending additions */
  addAsset: (file: File) => Promise<boolean>;
  /** Add multiple files to pending additions */
  addAssets: (files: File[]) => Promise<{ success: File[]; failed: File[] }>;
  /** Mark an asset for removal */
  removeAsset: (assetId: string) => void;
  /** Undo a pending removal (restore asset) */
  undoRemoval: (assetId: string) => void;
  /** Reorder assets */
  reorderAssets: (fromIndex: number, toIndex: number) => void;

  // Commit/Discard
  /** Commit all pending changes */
  commit: () => Promise<boolean>;
  /** Discard all pending changes */
  discard: () => void;

  // Computed
  /** Get an asset by ID (from current assets) */
  getAssetById: (id: string) => MediaItem | PendingAsset | null;
  /** Check if an asset is pending addition */
  isPendingAddition: (id: string) => boolean;
  /** Check if an asset is pending removal */
  isPendingRemoval: (id: string) => boolean;
  /** Get the effective order (all asset IDs in current order) */
  getOrderedIds: () => string[];

  // Error handling
  /** Clear current error */
  clearError: () => void;
}
