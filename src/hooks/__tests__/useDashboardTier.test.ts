// src/hooks/__tests__/useDashboardTier.test.ts
// REQ-136: Unit Tests for Dashboard Tier Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06

import {
  getDashboardTier,
  getTierConfig,
  useDashboardTier,
  DashboardTier,
  DashboardTierConfig,
  TIER_THRESHOLDS,
} from '../useDashboardTier';

describe('getDashboardTier', () => {
  describe('tier boundaries', () => {
    it('should return "single" for 0 properties', () => {
      expect(getDashboardTier(0)).toBe('single');
    });

    it('should return "single" for 1 property', () => {
      expect(getDashboardTier(1)).toBe('single');
    });

    it('should return "few" for 2 properties', () => {
      expect(getDashboardTier(2)).toBe('few');
    });

    it('should return "few" for 5 properties', () => {
      expect(getDashboardTier(5)).toBe('few');
    });

    it('should return "multiple" for 6 properties', () => {
      expect(getDashboardTier(6)).toBe('multiple');
    });

    it('should return "multiple" for 15 properties', () => {
      expect(getDashboardTier(15)).toBe('multiple');
    });

    it('should return "many" for 16 properties', () => {
      expect(getDashboardTier(16)).toBe('many');
    });

    it('should return "many" for 100 properties', () => {
      expect(getDashboardTier(100)).toBe('many');
    });
  });

  describe('edge cases', () => {
    it('should return "single" for negative numbers', () => {
      expect(getDashboardTier(-1)).toBe('single');
      expect(getDashboardTier(-100)).toBe('single');
    });

    it('should return "single" for NaN', () => {
      expect(getDashboardTier(NaN)).toBe('single');
    });

    it('should return "single" for Infinity', () => {
      expect(getDashboardTier(Infinity)).toBe('single');
      expect(getDashboardTier(-Infinity)).toBe('single');
    });
  });
});

describe('getTierConfig', () => {
  describe('single tier', () => {
    it('should return minimal config for single tier', () => {
      const config = getTierConfig('single', 1);

      expect(config.tier).toBe('single');
      expect(config.propertyCount).toBe(1);
      expect(config.showPropertySelector).toBe(false);
      expect(config.showFilteringControls).toBe(false);
      expect(config.showGroupingControls).toBe(false);
      expect(config.showAdvancedTools).toBe(false);
      expect(config.showPortfolioAnalytics).toBe(false);
      expect(config.showBulkOperations).toBe(false);
      expect(config.showSearchBar).toBe(false);
    });
  });

  describe('few tier', () => {
    it('should enable property selector for few tier', () => {
      const config = getTierConfig('few', 3);

      expect(config.tier).toBe('few');
      expect(config.showPropertySelector).toBe(true);
      expect(config.showFilteringControls).toBe(false);
      expect(config.showGroupingControls).toBe(false);
      expect(config.showAdvancedTools).toBe(false);
      expect(config.showPortfolioAnalytics).toBe(false);
      expect(config.showBulkOperations).toBe(false);
      expect(config.showSearchBar).toBe(false);
    });
  });

  describe('multiple tier', () => {
    it('should enable filtering and grouping for multiple tier', () => {
      const config = getTierConfig('multiple', 10);

      expect(config.tier).toBe('multiple');
      expect(config.showPropertySelector).toBe(true);
      expect(config.showFilteringControls).toBe(true);
      expect(config.showGroupingControls).toBe(true);
      expect(config.showAdvancedTools).toBe(false);
      expect(config.showPortfolioAnalytics).toBe(false);
      expect(config.showBulkOperations).toBe(false);
      expect(config.showSearchBar).toBe(false);
    });
  });

  describe('many tier', () => {
    it('should enable all features for many tier', () => {
      const config = getTierConfig('many', 20);

      expect(config.tier).toBe('many');
      expect(config.showPropertySelector).toBe(true);
      expect(config.showFilteringControls).toBe(true);
      expect(config.showGroupingControls).toBe(true);
      expect(config.showAdvancedTools).toBe(true);
      expect(config.showPortfolioAnalytics).toBe(true);
      expect(config.showBulkOperations).toBe(true);
      expect(config.showSearchBar).toBe(true);
    });
  });
});

describe('useDashboardTier', () => {
  describe('without overrides', () => {
    it('should return correct config for 0 properties', () => {
      const config = useDashboardTier(0);
      expect(config.tier).toBe('single');
      expect(config.propertyCount).toBe(0);
    });

    it('should return correct config for 1 property', () => {
      const config = useDashboardTier(1);
      expect(config.tier).toBe('single');
      expect(config.showPropertySelector).toBe(false);
    });

    it('should return correct config for 3 properties', () => {
      const config = useDashboardTier(3);
      expect(config.tier).toBe('few');
      expect(config.showPropertySelector).toBe(true);
    });

    it('should return correct config for 8 properties', () => {
      const config = useDashboardTier(8);
      expect(config.tier).toBe('multiple');
      expect(config.showFilteringControls).toBe(true);
      expect(config.showGroupingControls).toBe(true);
    });

    it('should return correct config for 20 properties', () => {
      const config = useDashboardTier(20);
      expect(config.tier).toBe('many');
      expect(config.showAdvancedTools).toBe(true);
      expect(config.showBulkOperations).toBe(true);
    });
  });

  describe('with overrides', () => {
    it('should enable advanced tools when forceAdvancedTools is true', () => {
      const config = useDashboardTier(1, { forceAdvancedTools: true });

      expect(config.tier).toBe('single');
      expect(config.showAdvancedTools).toBe(true);
      expect(config.showFilteringControls).toBe(true);
      expect(config.showGroupingControls).toBe(true);
      expect(config.showBulkOperations).toBe(true);
      expect(config.showSearchBar).toBe(true);
    });

    it('should enable portfolio view when forcePortfolioView is true', () => {
      const config = useDashboardTier(1, { forcePortfolioView: true });

      expect(config.tier).toBe('single');
      expect(config.showPortfolioAnalytics).toBe(true);
      // Other features should remain at tier defaults
      expect(config.showAdvancedTools).toBe(false);
    });

    it('should combine multiple overrides', () => {
      const config = useDashboardTier(1, {
        forceAdvancedTools: true,
        forcePortfolioView: true,
      });

      expect(config.showAdvancedTools).toBe(true);
      expect(config.showPortfolioAnalytics).toBe(true);
    });

    it('should not disable features that are already enabled by tier', () => {
      // forceAdvancedTools: false should not disable features for 'many' tier
      const config = useDashboardTier(20, { forceAdvancedTools: false });

      expect(config.tier).toBe('many');
      expect(config.showAdvancedTools).toBe(true); // Still true from tier
    });
  });
});

describe('TIER_THRESHOLDS', () => {
  it('should have correct threshold values', () => {
    expect(TIER_THRESHOLDS.TIER_SINGLE_MAX).toBe(1);
    expect(TIER_THRESHOLDS.TIER_FEW_MAX).toBe(5);
    expect(TIER_THRESHOLDS.TIER_MULTIPLE_MAX).toBe(15);
  });
});
