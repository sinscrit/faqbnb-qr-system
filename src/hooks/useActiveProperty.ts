// src/hooks/useActiveProperty.ts
// REQ-135: Active Property Persistence Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06
//
// Custom hook to manage active property state persistence using localStorage.
// Provides session persistence for the last selected property in print flow.

'use client';

import { useState, useEffect, useCallback } from 'react';

// Constants
const ACTIVE_PROPERTY_KEY = 'faqbnb_active_property_id';

// Hook interface
interface UseActivePropertyReturn {
  activePropertyId: string | null;
  setActiveProperty: (propertyId: string) => void;
  clearActiveProperty: () => void;
  isLoading: boolean;
}

/**
 * Hook to manage active property state with localStorage persistence.
 *
 * Features:
 * - Reads active property ID from localStorage on mount
 * - Provides setter to update active property
 * - Handles SSR (checks for window before localStorage access)
 * - Optional validation against available property IDs
 *
 * @param availablePropertyIds - Optional array of valid property IDs to validate against
 * @returns UseActivePropertyReturn - Active property state and management functions
 */
export function useActiveProperty(
  availablePropertyIds?: string[]
): UseActivePropertyReturn {
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    // Handle SSR - only access localStorage on client
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const storedValue = localStorage.getItem(ACTIVE_PROPERTY_KEY);

      if (storedValue) {
        // If availablePropertyIds provided, validate the stored value
        if (availablePropertyIds && availablePropertyIds.length > 0) {
          if (availablePropertyIds.includes(storedValue)) {
            setActivePropertyId(storedValue);
          } else {
            // Stored value is invalid, clear it
            localStorage.removeItem(ACTIVE_PROPERTY_KEY);
            setActivePropertyId(null);
          }
        } else {
          // No validation, just use stored value
          setActivePropertyId(storedValue);
        }
      }
    } catch (error) {
      // Handle localStorage access errors (e.g., in private browsing)
      console.warn('Failed to read active property from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [availablePropertyIds]);

  // Set active property and persist to localStorage
  const setActiveProperty = useCallback((propertyId: string) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ACTIVE_PROPERTY_KEY, propertyId);
      setActivePropertyId(propertyId);
    } catch (error) {
      console.warn('Failed to save active property to localStorage:', error);
      // Still update state even if localStorage fails
      setActivePropertyId(propertyId);
    }
  }, []);

  // Clear active property from localStorage and state
  const clearActiveProperty = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(ACTIVE_PROPERTY_KEY);
      setActivePropertyId(null);
    } catch (error) {
      console.warn('Failed to clear active property from localStorage:', error);
      // Still clear state even if localStorage fails
      setActivePropertyId(null);
    }
  }, []);

  return {
    activePropertyId,
    setActiveProperty,
    clearActiveProperty,
    isLoading
  };
}

export default useActiveProperty;
