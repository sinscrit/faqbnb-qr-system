// src/hooks/useDashboardPreferences.ts
// REQ-136: Dashboard Preferences Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Dashboard preferences interface
 * Stored in localStorage
 */
export interface DashboardPreferences {
  /** Force advanced tools to show regardless of tier */
  forceAdvancedTools: boolean;
  /** Force portfolio summary to show regardless of tier */
  forcePortfolioView: boolean;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: DashboardPreferences = {
  forceAdvancedTools: false,
  forcePortfolioView: false,
};

/**
 * LocalStorage key for dashboard preferences
 */
const STORAGE_KEY = 'faqbnb_dashboard_prefs';

/**
 * Gets preferences from localStorage
 * Returns defaults if storage is unavailable or data is invalid
 */
function getStoredPreferences(): DashboardPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);

    // Validate parsed data has expected shape
    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_PREFERENCES;
    }

    return {
      forceAdvancedTools: typeof parsed.forceAdvancedTools === 'boolean'
        ? parsed.forceAdvancedTools
        : DEFAULT_PREFERENCES.forceAdvancedTools,
      forcePortfolioView: typeof parsed.forcePortfolioView === 'boolean'
        ? parsed.forcePortfolioView
        : DEFAULT_PREFERENCES.forcePortfolioView,
    };
  } catch (error) {
    // JSON parse error or other issue - return defaults
    console.warn('[useDashboardPreferences] Failed to parse stored preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Saves preferences to localStorage
 */
function savePreferences(preferences: DashboardPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('[useDashboardPreferences] Failed to save preferences:', error);
  }
}

/**
 * Return type for useDashboardPreferences hook
 */
export interface UseDashboardPreferencesReturn {
  /** Current preferences */
  preferences: DashboardPreferences;
  /** Update a single preference */
  setPreference: <K extends keyof DashboardPreferences>(
    key: K,
    value: DashboardPreferences[K]
  ) => void;
  /** Update multiple preferences at once */
  setPreferences: (updates: Partial<DashboardPreferences>) => void;
  /** Reset to default preferences */
  resetPreferences: () => void;
}

/**
 * Hook for managing dashboard preferences
 * Persists preferences in localStorage
 *
 * @returns Object with preferences and setter functions
 *
 * @example
 * ```tsx
 * const { preferences, setPreference, resetPreferences } = useDashboardPreferences();
 *
 * // Toggle advanced tools
 * setPreference('forceAdvancedTools', true);
 *
 * // Use in tier configuration
 * const tierConfig = useDashboardTier(propertyCount, {
 *   forceAdvancedTools: preferences.forceAdvancedTools,
 *   forcePortfolioView: preferences.forcePortfolioView,
 * });
 * ```
 */
export function useDashboardPreferences(): UseDashboardPreferencesReturn {
  // Initialize with stored preferences (or defaults on server)
  const [preferences, setPreferencesState] = useState<DashboardPreferences>(() =>
    getStoredPreferences()
  );

  // Hydrate from localStorage on mount (handles SSR)
  useEffect(() => {
    const stored = getStoredPreferences();
    setPreferencesState(stored);
  }, []);

  // Update a single preference
  const setPreference = useCallback(<K extends keyof DashboardPreferences>(
    key: K,
    value: DashboardPreferences[K]
  ) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated);
      return updated;
    });
  }, []);

  // Update multiple preferences at once
  const setPreferences = useCallback((updates: Partial<DashboardPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    setPreference,
    setPreferences,
    resetPreferences,
  };
}

export default useDashboardPreferences;
