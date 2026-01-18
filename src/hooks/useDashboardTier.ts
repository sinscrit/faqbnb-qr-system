// src/hooks/useDashboardTier.ts
// REQ-136: Dashboard Progressive UI - Tier Determination Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06

/**
 * Dashboard tier type based on property count
 * - single: 0-1 properties - Streamlined, focused view
 * - few: 2-5 properties - Property selector and basic features
 * - multiple: 6-15 properties - Filtering, grouping, summary stats
 * - many: 16+ properties - Advanced navigation, bulk ops, portfolio analytics
 */
export type DashboardTier = 'single' | 'few' | 'multiple' | 'many';

/**
 * Configuration object containing tier and feature flags
 */
export interface DashboardTierConfig {
  /** Current tier based on property count */
  tier: DashboardTier;
  /** Number of properties used for tier calculation */
  propertyCount: number;
  /** Whether to show property selector dropdown */
  showPropertySelector: boolean;
  /** Whether to show filtering controls */
  showFilteringControls: boolean;
  /** Whether to show grouping controls */
  showGroupingControls: boolean;
  /** Whether to show advanced tools section */
  showAdvancedTools: boolean;
  /** Whether to show portfolio-level analytics */
  showPortfolioAnalytics: boolean;
  /** Whether to show bulk operations toolbar */
  showBulkOperations: boolean;
  /** Whether to show search bar for properties */
  showSearchBar: boolean;
}

/**
 * Tier threshold constants
 * These can be adjusted to change tier boundaries
 */
export const TIER_THRESHOLDS = {
  /** Maximum count for single tier (0-1) */
  TIER_SINGLE_MAX: 1,
  /** Maximum count for few tier (2-5) */
  TIER_FEW_MAX: 5,
  /** Maximum count for multiple tier (6-15) */
  TIER_MULTIPLE_MAX: 15,
} as const;

/**
 * Determines the dashboard tier based on property count
 *
 * @param count - Number of properties the user has
 * @returns The appropriate DashboardTier
 */
export function getDashboardTier(count: number): DashboardTier {
  // Handle edge cases
  if (count < 0 || !Number.isFinite(count)) {
    return 'single';
  }

  if (count <= TIER_THRESHOLDS.TIER_SINGLE_MAX) {
    return 'single';
  }
  if (count <= TIER_THRESHOLDS.TIER_FEW_MAX) {
    return 'few';
  }
  if (count <= TIER_THRESHOLDS.TIER_MULTIPLE_MAX) {
    return 'multiple';
  }
  return 'many';
}

/**
 * Gets the feature configuration for a given tier and property count
 *
 * Feature flags by tier:
 * | Feature              | single | few  | multiple | many |
 * |----------------------|--------|------|----------|------|
 * | showPropertySelector | false  | true | true     | true |
 * | showFilteringControls| false  | false| true     | true |
 * | showGroupingControls | false  | false| true     | true |
 * | showAdvancedTools    | false  | false| false    | true |
 * | showPortfolioAnalytics| false | false| false    | true |
 * | showBulkOperations   | false  | false| false    | true |
 * | showSearchBar        | false  | false| false    | true |
 *
 * @param tier - The DashboardTier to get configuration for
 * @param propertyCount - The property count
 * @returns DashboardTierConfig with all feature flags
 */
export function getTierConfig(tier: DashboardTier, propertyCount: number): DashboardTierConfig {
  const baseConfig: DashboardTierConfig = {
    tier,
    propertyCount,
    showPropertySelector: false,
    showFilteringControls: false,
    showGroupingControls: false,
    showAdvancedTools: false,
    showPortfolioAnalytics: false,
    showBulkOperations: false,
    showSearchBar: false,
  };

  switch (tier) {
    case 'single':
      // Minimal UI, no extra controls needed
      return baseConfig;

    case 'few':
      // Enable property selector for switching between properties
      return {
        ...baseConfig,
        showPropertySelector: true,
      };

    case 'multiple':
      // Add filtering and grouping for better organization
      return {
        ...baseConfig,
        showPropertySelector: true,
        showFilteringControls: true,
        showGroupingControls: true,
      };

    case 'many':
      // Full feature set for portfolio management
      return {
        ...baseConfig,
        showPropertySelector: true,
        showFilteringControls: true,
        showGroupingControls: true,
        showAdvancedTools: true,
        showPortfolioAnalytics: true,
        showBulkOperations: true,
        showSearchBar: true,
      };

    default:
      return baseConfig;
  }
}

/**
 * Optional overrides for tier configuration
 * Used for user preferences that force certain features on/off
 */
export interface DashboardTierOverrides {
  /** Force advanced tools to show regardless of tier */
  forceAdvancedTools?: boolean;
  /** Force portfolio analytics to show regardless of tier */
  forcePortfolioView?: boolean;
}

/**
 * Hook that determines dashboard tier and feature flags based on property count
 *
 * @param propertyCount - Number of properties the user has
 * @param overrides - Optional overrides for user preferences
 * @returns DashboardTierConfig with tier and feature flags
 *
 * @example
 * ```tsx
 * const { tier, showPropertySelector, showAdvancedTools } = useDashboardTier(userProperties?.length ?? 0);
 *
 * // Use in JSX
 * {showPropertySelector && <PropertySelector ... />}
 * ```
 */
export function useDashboardTier(
  propertyCount: number,
  overrides?: DashboardTierOverrides
): DashboardTierConfig {
  const tier = getDashboardTier(propertyCount);
  const config = getTierConfig(tier, propertyCount);

  // Apply overrides if provided
  if (overrides) {
    return {
      ...config,
      showAdvancedTools: config.showAdvancedTools || (overrides.forceAdvancedTools ?? false),
      showPortfolioAnalytics: config.showPortfolioAnalytics || (overrides.forcePortfolioView ?? false),
      // If advanced tools are forced on, also show related features
      showFilteringControls: config.showFilteringControls || (overrides.forceAdvancedTools ?? false),
      showGroupingControls: config.showGroupingControls || (overrides.forceAdvancedTools ?? false),
      showBulkOperations: config.showBulkOperations || (overrides.forceAdvancedTools ?? false),
      showSearchBar: config.showSearchBar || (overrides.forceAdvancedTools ?? false),
    };
  }

  return config;
}

export default useDashboardTier;
