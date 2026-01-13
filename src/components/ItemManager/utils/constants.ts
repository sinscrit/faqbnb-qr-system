/**
 * Constants for ItemManager component.
 *
 * Provides centralized configuration values used across the ItemManager
 * component and its sub-components.
 *
 * @module ItemManager/utils/constants
 * @see docs/prd/item-capture-manager-implementation-plan.md
 * @lastModified 2026-01-04 (REQ-066 Task 2.5.1)
 */

import type { SortOption } from '../ItemManager.types';

// =============================================================================
// Sort Options
// =============================================================================

/**
 * Sort option item structure for the menu.
 */
export interface SortOptionItem {
  value: SortOption;
  label: string;
  icon?: 'asc' | 'desc' | 'none';
}

/**
 * Available sort options for ItemManager.
 * Used by SortMenu and useItemSearch.
 */
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', label: 'Title (A-Z)', icon: 'asc' },
  { value: 'title-desc', label: 'Title (Z-A)', icon: 'desc' },
  { value: 'created-desc', label: 'Newest First', icon: 'desc' },
  { value: 'created-asc', label: 'Oldest First', icon: 'asc' },
  { value: 'updated-desc', label: 'Recently Modified', icon: 'desc' },
  { value: 'updated-asc', label: 'Least Recently Modified', icon: 'asc' },
  { value: 'location-asc', label: 'Location (A-Z)', icon: 'asc' },
  { value: 'instructions-desc', label: 'Most Instructions', icon: 'desc' },
  { value: 'instructions-asc', label: 'Fewest Instructions', icon: 'asc' },
];

/**
 * Default sort option.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';
