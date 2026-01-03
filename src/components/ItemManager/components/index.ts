/**
 * ItemManager Components Barrel Export
 *
 * @module ItemManager/components
 * @lastModified 2026-01-03 (REQ-086 - Added InlineEdit component)
 */

// Core display components
export { ItemCard } from './ItemCard';
export { ItemRow } from './ItemRow';
export { ItemGrid } from './ItemGrid';
export { ItemList } from './ItemList';

// Toolbar component
export { ItemToolbar } from './ItemToolbar';
export type { ItemToolbarProps } from '../ItemManager.types';

// Shared components
export { ViewModeToggle } from './shared/ViewModeToggle';
export { EmptyState } from './shared/EmptyState';
export { InlineEdit } from './shared/InlineEdit';
export type { InlineEditProps, InlineEditState } from './shared/InlineEdit';

// Asset management components (REQ-081)
export { AssetPanel } from './AssetPanel';
export type { AssetPanelProps } from '../ItemManager.types';
