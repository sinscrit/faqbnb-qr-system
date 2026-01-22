/**
 * Constants for ItemManager component.
 *
 * Provides centralized configuration values used across the ItemManager
 * component and its sub-components.
 *
 * @module ItemManager/utils/constants
 * @see docs/prd/item-capture-manager-implementation-plan.md
 * @lastModified 2026-01-22 (REQ-E02-079 - i18n translation keys)
 */

import type { SortOption } from '../ItemManager.types';

// =============================================================================
// Sort Options
// =============================================================================

/**
 * Sort option item structure for the menu.
 * Uses labelKey for i18n translations (translated at render time).
 */
export interface SortOptionItem {
  value: SortOption;
  /** Translation key relative to 'items.sort.options' namespace */
  labelKey: string;
  icon?: 'asc' | 'desc' | 'none';
}

/**
 * Available sort options for ItemManager.
 * Used by SortMenu and useItemSearch.
 * Components should translate labelKey at render time using t(`sort.options.${labelKey}`).
 */
export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'title-asc', labelKey: 'nameAZ', icon: 'asc' },
  { value: 'title-desc', labelKey: 'nameZA', icon: 'desc' },
  { value: 'created-desc', labelKey: 'newest', icon: 'desc' },
  { value: 'created-asc', labelKey: 'oldest', icon: 'asc' },
  { value: 'updated-desc', labelKey: 'recentlyViewed', icon: 'desc' },
  { value: 'updated-asc', labelKey: 'oldest', icon: 'asc' },
  { value: 'location-asc', labelKey: 'nameAZ', icon: 'asc' },
  { value: 'instructions-desc', labelKey: 'mostViewed', icon: 'desc' },
  { value: 'instructions-asc', labelKey: 'newest', icon: 'asc' },
];

/**
 * Default sort option.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';
