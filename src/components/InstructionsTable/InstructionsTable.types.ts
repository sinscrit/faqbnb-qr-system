/**
 * InstructionsTable Types
 * Created: 2026-01-12
 * REQ-212: Instructions List Page
 * @lastModified 2026-01-13 (REQ-220 - Added property column and view mode types)
 *
 * Type definitions for the instructions table component.
 */

/**
 * Instruction row data for table display
 * @lastModified 2026-01-13 (REQ-220 - Added propertyId and propertyName)
 */
export interface InstructionRow {
  id: string;
  articleId: string;
  articleTitle: string;
  itemName: string;
  itemId: string;
  room: string | null;
  purpose: string;
  createdAt: string;
  /** Property ID for multi-property filtering (REQ-220) */
  propertyId?: string;
  /** Property name for display in Property column (REQ-220) */
  propertyName?: string;
}

/**
 * Sort options for ordering the guides list.
 * Format: field-direction (e.g., 'title-asc' = sort by title ascending).
 * @lastModified 2026-01-13 (REQ-219)
 */
export type GuideSortOption =
  | 'title-asc'
  | 'title-desc'
  | 'item-asc'
  | 'item-desc'
  | 'purpose-asc'
  | 'purpose-desc'
  | 'created-desc'
  | 'created-asc';

/**
 * Column visibility state for InstructionsTable view.
 * Controls which optional columns are displayed.
 * @lastModified 2026-01-13 (REQ-220 - Added property column)
 */
export interface GuideColumnVisibilityState {
  /** Whether the Room column is visible (default: true) */
  room: boolean;
  /** Whether the Purpose column is visible (default: true) */
  purpose: boolean;
  /** Whether the Property column is visible (default: false) (REQ-220) */
  property: boolean;
}

/**
 * Props for InstructionsTable component
 * @lastModified 2026-01-13 (REQ-219 - Added sorting and column visibility props)
 */
export interface InstructionsTableProps {
  instructions: InstructionRow[];
  onEdit?: (articleId: string) => void;
  loading?: boolean;
  /** Current sort option for highlighting active column (REQ-219) */
  currentSort?: GuideSortOption;
  /** Callback when column header is clicked to change sort (REQ-219) */
  onSortChange?: (sort: GuideSortOption) => void;
  /** Column visibility state (REQ-219) */
  columnVisibility?: GuideColumnVisibilityState;
  /** Callback to toggle column visibility (REQ-219) */
  onToggleColumn?: (column: keyof GuideColumnVisibilityState) => void;
}
