'use client';

/**
 * PropertyContext
 *
 * Manages property selection state across dashboard routes.
 * Provides filtering context for items, rooms, and statistics.
 * Persists selected property to localStorage.
 *
 * REQ-142: Property Context System
 * @created 2026-01-08
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Property, PropertyContextValue, PropertyContextState } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// LocalStorage key for persisting property selection
const STORAGE_KEY = 'faqbnb_selected_property_id';

// Create the context with undefined default
const PropertyContext = createContext<PropertyContextValue | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

/**
 * PropertyProvider component
 * Wraps dashboard routes to provide property context
 */
export function PropertyProvider({ children }: PropertyProviderProps) {
  const { user, userProperties, getUserProperties } = useAuth();

  // State
  const [selectedPropertyId, setSelectedPropertyIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derived: get properties from AuthContext
  const properties = userProperties || [];

  // Derived: get selected property object
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, properties]);

  /**
   * Load persisted property selection from localStorage
   * Validate that the stored property still exists
   */
  const loadPersistedSelection = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      // Validate the stored ID exists in current properties
      const exists = properties.some(p => p.id === stored);
      if (!exists) {
        // Clear invalid selection
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return stored;
    } catch (err) {
      console.error('PropertyContext: Error loading persisted selection:', err);
      return null;
    }
  }, [properties]);

  /**
   * Set selected property ID with localStorage persistence
   */
  const setSelectedPropertyId = useCallback((propertyId: string | null) => {
    setSelectedPropertyIdState(propertyId);

    if (typeof window === 'undefined') return;

    try {
      if (propertyId) {
        localStorage.setItem(STORAGE_KEY, propertyId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('PropertyContext: Error persisting selection:', err);
    }
  }, []);

  /**
   * Refresh properties from the server
   */
  const refreshProperties = useCallback(async () => {
    if (!user || !getUserProperties) return;

    setIsLoading(true);
    setError(null);

    try {
      await getUserProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh properties');
    } finally {
      setIsLoading(false);
    }
  }, [user, getUserProperties]);

  /**
   * Check if a specific property is selected
   */
  const isPropertySelected = useCallback((propertyId: string): boolean => {
    return selectedPropertyId === propertyId;
  }, [selectedPropertyId]);

  // Initialize on mount and when properties change
  useEffect(() => {
    if (properties.length === 0) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    // Try to load persisted selection
    const persistedId = loadPersistedSelection();
    if (persistedId) {
      setSelectedPropertyIdState(persistedId);
    } else {
      // REQ-142: Default to first property if no persisted selection
      const firstProperty = properties[0];
      if (firstProperty) {
        console.log('PropertyContext: Defaulting to first property', { propertyId: firstProperty.id, nickname: firstProperty.nickname });
        setSelectedPropertyId(firstProperty.id);
      }
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [properties, loadPersistedSelection, setSelectedPropertyId]);

  // Handle case where selected property is deleted
  useEffect(() => {
    if (!isInitialized) return;

    if (selectedPropertyId && properties.length > 0) {
      const exists = properties.some(p => p.id === selectedPropertyId);
      if (!exists) {
        console.log('PropertyContext: Selected property no longer exists, clearing selection');
        setSelectedPropertyId(null);
      }
    }
  }, [selectedPropertyId, properties, isInitialized, setSelectedPropertyId]);

  // Context value
  const contextValue: PropertyContextValue = useMemo(() => ({
    selectedPropertyId,
    properties,
    isLoading,
    error,
    isInitialized,
    selectedProperty,
    setSelectedPropertyId,
    refreshProperties,
    isPropertySelected,
  }), [
    selectedPropertyId,
    properties,
    isLoading,
    error,
    isInitialized,
    selectedProperty,
    setSelectedPropertyId,
    refreshProperties,
    isPropertySelected,
  ]);

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
}

/**
 * Hook to access property context
 * @throws Error if used outside PropertyProvider
 */
export function usePropertyContext(): PropertyContextValue {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}

export default PropertyContext;
