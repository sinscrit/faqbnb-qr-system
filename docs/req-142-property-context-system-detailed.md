# REQ-142: Property Context System and Enhanced Item Management - Detailed Implementation Tasks

**Generated:** 2026-01-08 17:32:00 UTC
**Reference Documents:**
- Requirements: docs/gen_requests.md (Request #142)
- Overview: docs/req-142-property-context-system-overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- This document contains 16 tasks, each approximately 1 story point
- Complete tasks in order unless explicitly noted as parallelizable

---

## Task 1: Create PropertyContext Type Definitions

**Context:** The codebase uses TypeScript with centralized type definitions in `src/types/index.ts`. The Property and PropertyType interfaces already exist. We need to add new interfaces for the property context system.
**Files to modify:** `src/types/index.ts`
**Estimated effort:** 1 story point

- [x] Open `src/types/index.ts` and add the following interfaces after the existing `PropertySelectorProps` interface (around line 285): ---implemented: Added PropertyContextState, PropertyContextValue, ItemViewModalProps, ItemWithDetails, and DeleteItemDialogProps interfaces to src/types/index.ts-

```typescript
// REQ-142: Property Context System Types

/**
 * Property context state for dashboard filtering
 */
export interface PropertyContextState {
  /** Currently selected property ID, null means "All Properties" */
  selectedPropertyId: string | null;
  /** List of available properties for the current user */
  properties: Property[];
  /** Loading state for properties */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether the context has been initialized */
  isInitialized: boolean;
}

/**
 * Property context value exposed by the provider
 */
export interface PropertyContextValue extends PropertyContextState {
  /** Set the selected property ID */
  setSelectedPropertyId: (propertyId: string | null) => void;
  /** Refresh the properties list */
  refreshProperties: () => Promise<void>;
  /** Get the currently selected property object */
  selectedProperty: Property | null;
  /** Check if a specific property is selected */
  isPropertySelected: (propertyId: string) => boolean;
}

/**
 * Props for ItemViewModal component
 */
export interface ItemViewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** The item to display */
  item: ItemWithDetails | null;
  /** Callback when edit is clicked */
  onEdit?: (item: ItemWithDetails) => void;
  /** Callback when delete is clicked */
  onDelete?: (item: ItemWithDetails) => void;
}

/**
 * Extended item type with full details for view modal
 */
export interface ItemWithDetails {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  propertyId: string;
  property?: Property;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
  links: ItemLink[];
  /** Count of associated media files for delete warning */
  mediaCount?: number;
}

/**
 * Props for DeleteItemDialog component
 */
export interface DeleteItemDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** The item to delete */
  item: ItemWithDetails | null;
  /** Callback when deletion is confirmed */
  onConfirm: () => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Loading state during deletion */
  isDeleting?: boolean;
}
```

- [x] Verify the file saves without TypeScript errors by running: `npx tsc --noEmit src/types/index.ts` -unit tested-
- [x] Confirm no import errors exist in the types file -unit tested-

---

## Task 2: Create PropertyContext Provider

**Context:** The codebase uses React Context for state management (see `src/contexts/AuthContext.tsx` for patterns). The PropertyContext will manage the selected property across dashboard routes and persist to localStorage.
**Files to modify:** `src/contexts/PropertyContext.tsx` (CREATE)
**Estimated effort:** 1 story point

- [x] Create the file `src/contexts/PropertyContext.tsx` with the following content: ---implemented: Created PropertyContext.tsx with PropertyProvider component, localStorage persistence, and usePropertyContext hook-

```typescript
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
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [properties, loadPersistedSelection]);

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
```

- [x] Verify the file compiles: `npx tsc --noEmit src/contexts/PropertyContext.tsx` -unit tested-
- [x] Check that imports from `@/types` and `@/contexts/AuthContext` resolve correctly -unit tested-

---

## Task 3: Create usePropertyContext Hook Export

**Context:** The codebase uses custom hooks for context access. Create a separate hook file for cleaner imports and testability.
**Files to modify:** `src/hooks/usePropertyContext.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/hooks/usePropertyContext.ts`:

```typescript
/**
 * usePropertyContext Hook
 *
 * Re-exports the usePropertyContext hook from PropertyContext.
 * Provides a clean import path for components.
 *
 * REQ-142: Property Context System
 * @created 2026-01-08
 */

export { usePropertyContext } from '@/contexts/PropertyContext';
export type { PropertyContextValue, PropertyContextState } from '@/types';
```

- [ ] Verify the file compiles without errors

---

## Task 4: Create PropertyDropdown Component

**Context:** The dashboard uses the Airbnb-style design system with `#FF385C` as the primary color. The existing `PropertySelector` component (see `src/components/PropertySelector.tsx`) is designed for filter panels. This new dropdown is optimized for the navigation bar with a compact design.
**Files to modify:** `src/components/dashboard/PropertyDropdown.tsx` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the directory if it doesn't exist: `src/components/dashboard/`
- [ ] Create the file `src/components/dashboard/PropertyDropdown.tsx`:

```typescript
'use client';

/**
 * PropertyDropdown Component
 *
 * Compact property selector for the dashboard navigation bar.
 * Displays current property with dropdown for switching.
 *
 * REQ-142: Property Context System
 * @created 2026-01-08
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, Check, Loader2 } from 'lucide-react';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { cn } from '@/lib/utils';

export interface PropertyDropdownProps {
  /** Additional CSS classes */
  className?: string;
}

export function PropertyDropdown({ className }: PropertyDropdownProps) {
  const {
    selectedPropertyId,
    selectedProperty,
    properties,
    isLoading,
    setSelectedPropertyId,
  } = usePropertyContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Handle property selection
  const handleSelect = (propertyId: string | null) => {
    setSelectedPropertyId(propertyId);
    setIsOpen(false);
  };

  // Display text for the button
  const displayText = selectedProperty?.nickname || 'All Properties';

  // Don't render if only 0 or 1 property (no need for selector)
  if (!isLoading && properties.length <= 1) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select property"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'border border-gray-200 bg-white',
          'text-sm font-medium text-gray-700',
          'hover:bg-gray-50 hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
          'transition-colors duration-150',
          'min-w-[160px] max-w-[240px]',
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
      >
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
        <span className="truncate flex-1 text-left">{displayText}</span>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Property list"
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'min-w-full w-max max-w-[280px]',
            'bg-white rounded-lg shadow-lg border border-gray-200',
            'py-1 max-h-[320px] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          {/* All Properties Option */}
          <button
            type="button"
            role="option"
            aria-selected={!selectedPropertyId}
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5',
              'text-sm text-left',
              'hover:bg-gray-50 transition-colors',
              !selectedPropertyId && 'bg-gray-50'
            )}
          >
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 font-medium text-gray-700">All Properties</span>
            {!selectedPropertyId && (
              <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" aria-hidden="true" />
            )}
          </button>

          {/* Divider */}
          {properties.length > 0 && (
            <div className="border-t border-gray-100 my-1" role="separator" />
          )}

          {/* Property Options */}
          {properties.map((property) => (
            <button
              key={property.id}
              type="button"
              role="option"
              aria-selected={selectedPropertyId === property.id}
              onClick={() => handleSelect(property.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5',
                'text-sm text-left',
                'hover:bg-gray-50 transition-colors',
                selectedPropertyId === property.id && 'bg-gray-50'
              )}
            >
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-700 truncate">{property.nickname}</div>
                {property.address && (
                  <div className="text-xs text-gray-500 truncate">{property.address}</div>
                )}
              </div>
              {selectedPropertyId === property.id && (
                <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}

          {/* Empty state */}
          {properties.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No properties found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyDropdown;
```

- [ ] Verify the component compiles without errors

---

## Task 5: Create Dashboard Components Barrel Export

**Context:** The codebase uses barrel exports for component organization (see `src/components/SimpleDashboard/index.ts`). Create a barrel file for the new dashboard components.
**Files to modify:** `src/components/dashboard/index.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/components/dashboard/index.ts`:

```typescript
/**
 * Dashboard Components Barrel Export
 *
 * REQ-142: Property Context System and Enhanced Item Management
 * @created 2026-01-08
 */

// Property Context Components
export { PropertyDropdown } from './PropertyDropdown';
export type { PropertyDropdownProps } from './PropertyDropdown';

// Item Management Components (to be added in later tasks)
// export { ItemViewModal } from './ItemViewModal';
// export { ItemActionButtons } from './ItemActionButtons';
// export { DeleteItemDialog } from './DeleteItemDialog';
```

- [ ] Verify exports compile correctly

---

## Task 6: Integrate PropertyProvider and PropertyDropdown into Dashboard Layout

**Context:** The dashboard layout is at `src/app/dashboard2/layout.tsx`. It already wraps children with `AuthProvider`. We need to add `PropertyProvider` inside `AuthProvider` and add the `PropertyDropdown` to the header.
**Files to modify:** `src/app/dashboard2/layout.tsx`
**Estimated effort:** 1 story point

- [ ] Add imports at the top of the file (after existing imports around line 17):
```typescript
import { PropertyProvider } from '@/contexts/PropertyContext';
import { PropertyDropdown } from '@/components/dashboard';
```

- [ ] In the `Dashboard2LayoutContent` function, locate the header section (around line 86-106). Add the `PropertyDropdown` between the title and logout button. Replace the header section with:

```typescript
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
            </div>

            {/* Center - Property Dropdown (REQ-142) */}
            <div className="flex-1 flex justify-center px-4">
              <PropertyDropdown />
            </div>

            {/* Right side - Logout */}
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
```

- [ ] Wrap the return of `Dashboard2Layout` function (around line 145-151) with `PropertyProvider`:

```typescript
export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Dashboard2LayoutContent>{children}</Dashboard2LayoutContent>
      </PropertyProvider>
    </AuthProvider>
  );
}
```

- [ ] Verify the layout compiles without errors
- [ ] Test that the dashboard loads correctly with the new dropdown

---

## Task 7: Create property-utils.ts for Default Property Creation

**Context:** New users need a default property created automatically. This utility handles the logic for detecting new users and creating a default property.
**Files to modify:** `src/lib/property-utils.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/lib/property-utils.ts`:

```typescript
/**
 * Property Utility Functions
 *
 * Helper functions for property management including
 * default property creation for new users.
 *
 * REQ-142: Property Context System
 * @created 2026-01-08
 */

import { Property, PropertyType } from '@/types';

/**
 * Default property configuration for new users
 */
export const DEFAULT_PROPERTY_CONFIG = {
  nickname: 'My Property',
  address: null,
  // Will use the first available property type
} as const;

/**
 * Check if a user needs a default property created
 * @param properties - Current list of user properties
 * @returns true if user has no properties
 */
export function needsDefaultProperty(properties: Property[] | null | undefined): boolean {
  return !properties || properties.length === 0;
}

/**
 * Get default property type from available types
 * Prefers 'home' or 'house' type, falls back to first available
 * @param propertyTypes - Available property types
 * @returns The default property type or null if none available
 */
export function getDefaultPropertyType(propertyTypes: PropertyType[]): PropertyType | null {
  if (!propertyTypes || propertyTypes.length === 0) {
    return null;
  }

  // Prefer common residential types
  const preferredTypes = ['home', 'house', 'apartment', 'condo'];
  for (const preferred of preferredTypes) {
    const found = propertyTypes.find(
      pt => pt.name.toLowerCase() === preferred || pt.display_name.toLowerCase().includes(preferred)
    );
    if (found) return found;
  }

  // Fall back to first available
  return propertyTypes[0];
}

/**
 * Create default property request payload
 * @param userId - User ID for the property
 * @param propertyTypeId - Property type ID to use
 * @returns Property creation request body
 */
export function createDefaultPropertyPayload(userId: string, propertyTypeId: string) {
  return {
    nickname: DEFAULT_PROPERTY_CONFIG.nickname,
    address: DEFAULT_PROPERTY_CONFIG.address,
    propertyTypeId,
    userId,
  };
}

/**
 * Validate property can be created
 * @param userId - User ID
 * @param propertyTypeId - Property type ID
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePropertyCreation(
  userId: string | undefined | null,
  propertyTypeId: string | undefined | null
): { isValid: boolean; error?: string } {
  if (!userId) {
    return { isValid: false, error: 'User ID is required' };
  }
  if (!propertyTypeId) {
    return { isValid: false, error: 'Property type ID is required' };
  }
  return { isValid: true };
}
```

- [ ] Verify the file compiles without errors

---

## Task 8: Create Default Property API Endpoint

**Context:** The API structure follows the pattern in `src/app/api/`. This endpoint creates a default property for new users.
**Files to modify:** `src/app/api/user/properties/default/route.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the directory structure: `src/app/api/user/properties/default/`
- [ ] Create the file `src/app/api/user/properties/default/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  needsDefaultProperty,
  getDefaultPropertyType,
  createDefaultPropertyPayload,
  validatePropertyCreation
} from '@/lib/property-utils';

/**
 * POST /api/user/properties/default
 *
 * Creates a default property for a new user if they have none.
 * Returns existing properties if user already has some.
 *
 * REQ-142: Default Property Auto-Creation
 * @created 2026-01-08
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Default property API: Starting...');

    // Create Supabase client and get authenticated user
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Default property API: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Default property API: User authenticated:', user.email);

    // Check if user already has properties
    const { data: existingProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, nickname, property_type_id, address, created_at')
      .eq('user_id', user.id);

    if (propertiesError) {
      console.error('Default property API: Error fetching properties:', propertiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing properties' },
        { status: 500 }
      );
    }

    // If user already has properties, return them
    if (!needsDefaultProperty(existingProperties)) {
      console.log('Default property API: User already has properties:', existingProperties?.length);
      return NextResponse.json({
        success: true,
        data: existingProperties,
        message: 'User already has properties',
        created: false,
      });
    }

    console.log('Default property API: User needs default property');

    // Get available property types
    const { data: propertyTypes, error: typesError } = await supabase
      .from('property_types')
      .select('id, name, display_name');

    if (typesError || !propertyTypes || propertyTypes.length === 0) {
      console.error('Default property API: No property types available:', typesError);
      return NextResponse.json(
        { success: false, error: 'No property types available' },
        { status: 500 }
      );
    }

    // Get default property type
    const defaultType = getDefaultPropertyType(propertyTypes);
    if (!defaultType) {
      return NextResponse.json(
        { success: false, error: 'Could not determine default property type' },
        { status: 500 }
      );
    }

    console.log('Default property API: Using property type:', defaultType.name);

    // Validate creation parameters
    const validation = validatePropertyCreation(user.id, defaultType.id);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get user's account for property association
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (accountError) {
      console.warn('Default property API: Could not get user account:', accountError);
      // Continue without account_id - property will still be created
    }

    // Create default property
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        property_type_id: defaultType.id,
        account_id: accountUser?.account_id || null,
        nickname: 'My Property',
        address: null,
      })
      .select('id, nickname, property_type_id, address, created_at, account_id')
      .single();

    if (createError) {
      console.error('Default property API: Failed to create property:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create default property' },
        { status: 500 }
      );
    }

    console.log('Default property API: Created property:', newProperty.id);

    return NextResponse.json({
      success: true,
      data: [newProperty],
      message: 'Default property created successfully',
      created: true,
    });

  } catch (error) {
    console.error('Default property API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] Verify the endpoint compiles without errors
- [ ] Test the endpoint manually by calling it from a browser or curl

---

## Task 9: Add Default Property Check to AuthContext

**Context:** The `AuthContext` at `src/contexts/AuthContext.tsx` manages authentication state. We need to add logic to check for and create default properties during authentication flow.
**Files to modify:** `src/contexts/AuthContext.tsx`
**Estimated effort:** 1 story point

- [ ] Add a new function `ensureDefaultProperty` inside the `AuthProvider` component (add after the `refreshAccountContext` function around line 1545):

```typescript
  // REQ-142: Ensure user has at least one property
  const ensureDefaultProperty = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      console.log('REQ-142: Checking for default property...');

      const response = await fetch('/api/user/properties/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        if (result.created) {
          console.log('REQ-142: Default property created');
          // Refresh user properties to include the new default
          if (getUserProperties) {
            await getUserProperties();
          }
        } else {
          console.log('REQ-142: User already has properties');
        }
      } else {
        console.error('REQ-142: Failed to ensure default property:', result.error);
      }
    } catch (error) {
      console.error('REQ-142: Error ensuring default property:', error);
    }
  }, [user, getUserProperties]);
```

- [ ] Call `ensureDefaultProperty` in the authentication state machine when user becomes authenticated. Find the `case AuthState.AUTHENTICATED` block (around line 1263) and add the call:

```typescript
      case AuthState.AUTHENTICATED: {
        // Log authenticated state
        console.log(`${DEBUG_PREFIX} Authenticated state active`, {
        userId: user?.id,
        currentAccountId: currentAccount?.id,
          userAccountsCount: userAccounts?.length || 0
        });

        // Load dashboard permissions when authenticated
        if (user && currentAccount) {
          loadDashboardPermissions();
        }

        // REQ-142: Ensure user has default property
        if (user) {
          ensureDefaultProperty();
        }

        break;
      }
```

- [ ] Add `ensureDefaultProperty` to the dependencies array of the useEffect if needed
- [ ] Verify the context compiles without errors

---

## Task 10: Update Items API to Accept Property Filter

**Context:** The `/api/admin/items` endpoint already has property filtering via the `property` query parameter. We need to ensure the `useDashboardStats` hook and dashboard pages pass this parameter correctly.
**Files to modify:** `src/hooks/useDashboardStats.ts`
**Estimated effort:** 1 story point

- [ ] The hook already accepts `propertyId` parameter (see line 78). Verify the endpoint URL construction (around line 105-107) correctly includes the propertyId:

```typescript
      // REQ-134: Include propertyId in API request when provided
      const endpoint = propertyId
        ? `/user/dashboard/stats?propertyId=${encodeURIComponent(propertyId)}`
        : '/user/dashboard/stats';
```

This is already implemented. No changes needed for this file.

- [ ] Update the Items page to use property context. Open `src/app/dashboard2/items/page.tsx` and add imports:

```typescript
import { usePropertyContext } from '@/hooks/usePropertyContext';
```

- [ ] In the `ItemsPage` component, add the property context hook (after the existing hooks around line 23):

```typescript
  const { selectedPropertyId } = usePropertyContext();
```

- [ ] Update the `fetchItems` callback to include propertyId in the API call. Find the `adminApi.listItems` call (around line 43) and modify it:

```typescript
    try {
      // REQ-142: Include property filter from context
      const response = await adminApi.listItems(
        undefined, // search
        selectedPropertyId || undefined, // propertyId filter
        1,
        100,
        headers
      );
```

- [ ] Add `selectedPropertyId` to the `fetchItems` dependency array (around line 77):

```typescript
  }, [user, currentAccount, selectedPropertyId]);
```

- [ ] Verify the page compiles without errors

---

## Task 11: Update Dashboard Home Page to Use Property Context

**Context:** The dashboard home page at `src/app/dashboard2/page.tsx` uses its own state for property selection. We need to integrate it with the new PropertyContext.
**Files to modify:** `src/app/dashboard2/page.tsx`
**Estimated effort:** 1 story point

- [ ] Add import for property context (after existing imports around line 31):

```typescript
import { usePropertyContext } from '@/hooks/usePropertyContext';
```

- [ ] Replace the local `selectedPropertyId` state with the context value. Find and remove this line (around line 55):

```typescript
  // REQ-134: State for property filter
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
```

- [ ] Add the property context hook after the tier config (around line 53):

```typescript
  // REQ-142: Get property context for filtering
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyContext();
```

- [ ] Update the `useDashboardStats` call to use the context value (around line 58-60). The existing code already passes `selectedPropertyId` so this should work automatically.

- [ ] In the PropertySelector section (around line 198-214), the code already uses `selectedPropertyId` and `setSelectedPropertyId` from state. Since we've replaced these with context values, no changes needed to the JSX.

- [ ] Verify the page compiles without errors

---

## Task 12: Update Item Creation to Use Property Context

**Context:** The create item page at `src/app/dashboard2/create/page.tsx` currently uses the first available property. We need to update it to prefer the currently selected property from context.
**Files to modify:** `src/app/dashboard2/create/page.tsx`
**Estimated effort:** 1 story point

- [ ] Add import for property context (after existing imports around line 15):

```typescript
import { usePropertyContext } from '@/hooks/usePropertyContext';
```

- [ ] Add the property context hook in the component (after line 28):

```typescript
  const { selectedPropertyId, selectedProperty } = usePropertyContext();
```

- [ ] Update the `handleSaveItem` callback to prefer the selected property. Find the property selection logic (around lines 55-67) and replace it with:

```typescript
      try {
        let propertyId: string | undefined;

        // REQ-142: Prefer currently selected property from context
        if (selectedPropertyId) {
          propertyId = selectedPropertyId;
          console.log('Using selected property from context:', propertyId);
        } else {
          // Fall back to first available property
          const propertiesResponse = await adminApi.listProperties(headers);
          if (propertiesResponse.success && propertiesResponse.data && propertiesResponse.data.length > 0) {
            propertyId = propertiesResponse.data[0].id;
            console.log('Using first available property:', propertyId);
          }
        }

        if (!propertyId) {
          throw new Error('No property available. Please create a property first.');
        }
```

- [ ] Verify the page compiles without errors

---

## Task 13: Create ItemViewModal Component

**Context:** The codebase has an existing `ItemPreviewModal` component in `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` that can serve as a reference. This new modal is specifically for the dashboard item view without QR code display.
**Files to modify:** `src/components/dashboard/ItemViewModal.tsx` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/components/dashboard/ItemViewModal.tsx`:

```typescript
'use client';

/**
 * ItemViewModal Component
 *
 * Modal for viewing item details in the dashboard.
 * Displays item metadata, links, and action buttons.
 * Explicitly excludes QR code display per REQ-142.
 *
 * REQ-142: Enhanced Item Management
 * @created 2026-01-08
 */

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  Link as LinkIcon,
  FileText,
  Youtube,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItemViewModalProps, ItemWithDetails, ItemLink } from '@/types';

// Link type icon mapping
const linkTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  pdf: FileText,
  image: ImageIcon,
  text: FileText,
};

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ItemViewModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete,
}: ItemViewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!item) return null;

  const handleEdit = () => {
    onEdit?.(item);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(item);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Modal Content */}
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-white shadow-lg outline-none',
            'overflow-hidden flex flex-col',
            // Desktop: centered modal
            'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
            'md:rounded-lg',
            // Mobile: slide-up drawer
            'max-md:inset-x-0 max-md:bottom-0',
            'max-md:max-h-[85vh] max-md:rounded-t-xl',
            // Animations
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            'duration-300'
          )}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

            <Dialog.Title className="text-lg font-semibold text-gray-900 pr-8 truncate mt-2 md:mt-0">
              {item.name}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className={cn(
                  'absolute right-3 top-3 md:right-4 md:top-4',
                  'flex items-center justify-center',
                  'w-10 h-10 md:w-12 md:h-12',
                  'rounded-full',
                  'text-gray-500 hover:text-gray-700',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                  'transition-colors'
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )}

            {/* Property */}
            {item.property && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.property.nickname}</span>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Created: {formatDate(item.createdAt)}</span>
              </div>
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Updated: {formatDate(item.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Links Section */}
            {item.links && item.links.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Resources ({item.links.length})
                </h3>
                <div className="space-y-2">
                  {item.links.map((link: ItemLink, index: number) => {
                    const IconComponent = linkTypeIcons[link.link_type] || LinkIcon;
                    return (
                      <a
                        key={link.id || index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg',
                          'bg-gray-50 hover:bg-gray-100',
                          'transition-colors group'
                        )}
                      >
                        <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-700 truncate">{link.title}</div>
                          <div className="text-xs text-gray-500 truncate">{link.url}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty links state */}
            {(!item.links || item.links.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No resources attached to this item</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-4 border-t border-gray-200">
            {/* Edit Button */}
            <button
              type="button"
              onClick={handleEdit}
              disabled={!onEdit}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2',
                'bg-[#FF385C] text-white rounded-lg',
                'hover:bg-[#E31C5F] transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                'min-h-[44px]',
                !onEdit && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
              <span>Edit Item</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={!onDelete}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2',
                'bg-red-600 text-white rounded-lg',
                'hover:bg-red-700 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                'min-h-[44px] sm:ml-auto',
                !onDelete && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ItemViewModal;
```

- [ ] Verify the component compiles without errors
- [ ] Update the barrel export in `src/components/dashboard/index.ts` to include:
```typescript
export { ItemViewModal } from './ItemViewModal';
export type { ItemViewModalProps } from '@/types';
```

---

## Task 14: Create DeleteItemDialog Component with Media Warning

**Context:** The existing `ConfirmDeleteDialog` in `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` provides a pattern. This new dialog adds media file warning for cascading deletion.
**Files to modify:** `src/components/dashboard/DeleteItemDialog.tsx` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/components/dashboard/DeleteItemDialog.tsx`:

```typescript
'use client';

/**
 * DeleteItemDialog Component
 *
 * Confirmation dialog for item deletion with media warning.
 * Shows warning about cascading deletion of associated resources.
 *
 * REQ-142: Enhanced Item Management - Delete Confirmation
 * @created 2026-01-08
 */

import { AlertTriangle, Loader2, FileText, Image, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteItemDialogProps } from '@/types';

export function DeleteItemDialog({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteItemDialogProps) {
  if (!isOpen || !item) return null;

  const linksCount = item.links?.length || 0;
  const mediaCount = item.mediaCount || 0;
  const hasAssociatedContent = linksCount > 0 || mediaCount > 0;

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      e.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              Delete Item
            </h3>
            <p
              id="delete-dialog-description"
              className="mt-2 text-sm text-gray-600"
            >
              Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Warning about associated content */}
        {hasAssociatedContent && (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    This will also delete:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {linksCount > 0 && (
                      <li className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        <span>{linksCount} resource link{linksCount !== 1 ? 's' : ''}</span>
                      </li>
                    )}
                    {mediaCount > 0 && (
                      <li className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        <span>{mediaCount} media file{mediaCount !== 1 ? 's' : ''} from storage</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-gray-700 bg-gray-100',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-white bg-red-600',
              'hover:bg-red-700 active:bg-red-800',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteItemDialog;
```

- [ ] Update the barrel export in `src/components/dashboard/index.ts`:
```typescript
export { DeleteItemDialog } from './DeleteItemDialog';
export type { DeleteItemDialogProps } from '@/types';
```

- [ ] Verify the component compiles without errors

---

## Task 15: Create item-utils.ts for Cascading Deletion

**Context:** The DELETE endpoint at `src/app/api/admin/items/[publicId]/route.ts` already handles cascading deletion via database CASCADE. This utility adds helper functions for the frontend to check media before deletion.
**Files to modify:** `src/lib/item-utils.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the file `src/lib/item-utils.ts`:

```typescript
/**
 * Item Utility Functions
 *
 * Helper functions for item management including
 * cascading deletion and media cleanup.
 *
 * REQ-142: Enhanced Item Management
 * @created 2026-01-08
 */

import { ItemWithDetails, ItemLink } from '@/types';

/**
 * Count media files associated with an item
 * Media files are links of type 'image' or stored in Supabase storage
 * @param item - Item to check
 * @returns Number of media files
 */
export function countItemMedia(item: ItemWithDetails): number {
  if (!item.links || item.links.length === 0) return 0;

  // Count image links and any links pointing to Supabase storage
  return item.links.filter(link =>
    link.link_type === 'image' ||
    link.url?.includes('supabase.co/storage')
  ).length;
}

/**
 * Get item links count
 * @param item - Item to check
 * @returns Number of links
 */
export function getItemLinksCount(item: ItemWithDetails): number {
  return item.links?.length || 0;
}

/**
 * Check if item has associated content that will be deleted
 * @param item - Item to check
 * @returns true if item has links or media
 */
export function hasAssociatedContent(item: ItemWithDetails): boolean {
  return getItemLinksCount(item) > 0 || countItemMedia(item) > 0;
}

/**
 * Format item for deletion confirmation
 * Enriches item with media count for delete dialog
 * @param item - Item to format
 * @returns Item with mediaCount property
 */
export function formatItemForDeletion(item: ItemWithDetails): ItemWithDetails {
  return {
    ...item,
    mediaCount: countItemMedia(item),
  };
}

/**
 * Extract media URLs from item links
 * Used for storage cleanup after deletion
 * @param item - Item to extract media from
 * @returns Array of media URLs
 */
export function extractMediaUrls(item: ItemWithDetails): string[] {
  if (!item.links) return [];

  return item.links
    .filter(link =>
      link.link_type === 'image' ||
      link.url?.includes('supabase.co/storage')
    )
    .map(link => link.url);
}

/**
 * Parse Supabase storage path from URL
 * @param url - Full Supabase storage URL
 * @returns Storage path or null if not a storage URL
 */
export function parseStoragePath(url: string): string | null {
  if (!url.includes('supabase.co/storage')) return null;

  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}
```

- [ ] Verify the utility compiles without errors

---

## Task 16: Create Edit Item Page

**Context:** The items page currently navigates to `/dashboard/items/[publicId]/edit` which may not exist. We need to create an edit page under dashboard2.
**Files to modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx` (CREATE)
**Estimated effort:** 1 story point

- [ ] Create the directory structure: `src/app/dashboard2/items/[publicId]/edit/`
- [ ] Create the file `src/app/dashboard2/items/[publicId]/edit/page.tsx`:

```typescript
'use client';

/**
 * Edit Item Page
 *
 * Page for editing existing items.
 * Fetches item data and renders edit form.
 *
 * REQ-142: Enhanced Item Management
 * @route /dashboard2/items/[publicId]/edit
 * @created 2026-01-08
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { ItemWithDetails } from '@/types';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const publicId = params.publicId as string;

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch item data
  const fetchItem = useCallback(async () => {
    if (!user || !publicId) return;

    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      const response = await adminApi.getItem(publicId, headers);

      if (response.success && response.data) {
        setItem(response.data as ItemWithDetails);
        setName(response.data.name || '');
        setDescription(response.data.description || '');
      } else {
        setError(response.error || 'Failed to fetch item');
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  }, [user, publicId, currentAccount]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    setSaving(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      const response = await adminApi.updateItem(publicId, {
        name,
        description,
        propertyId: item.propertyId,
        links: item.links?.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type,
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order,
        })) || [],
      }, headers);

      if (response.success) {
        router.push('/dashboard2/items');
      } else {
        setError(response.error || 'Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to edit items.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard2/items')}
            className="text-[#FF385C] hover:underline"
          >
            Return to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard2/items')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              placeholder="Enter item name"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-none"
              placeholder="Enter item description (optional)"
            />
          </div>

          {/* Property Display (read-only) */}
          {item?.property && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {item.property.nickname}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Property cannot be changed after creation
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard2/items')}
            disabled={saving}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] Verify the page compiles without errors
- [ ] Update the items page to navigate to the correct edit route. Open `src/app/dashboard2/items/page.tsx` and update the `handleEditItem` callback (around line 85-92):

```typescript
  // Edit item handler
  const handleEditItem = useCallback(
    (item: ItemRecord) => {
      console.log('Edit item:', item);
      // REQ-142: Navigate to dashboard2 edit page
      router.push(`/dashboard2/items/${item.publicId}/edit`);
    },
    [router]
  );
```

---

## Verification Checklist

Before marking REQ-142 as complete, verify the following:

- [ ] All 16 tasks completed successfully
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] PropertyDropdown appears in dashboard navigation when user has 2+ properties
- [ ] Property selection persists across page refreshes (localStorage)
- [ ] Dashboard stats filter correctly when property is selected
- [ ] Items list filters correctly when property is selected
- [ ] New items created are associated with selected property
- [ ] New users get default property created automatically
- [ ] ItemViewModal opens and displays item details correctly
- [ ] DeleteItemDialog shows media warning when item has links
- [ ] Edit page loads item data and saves changes
- [ ] All components match the Airbnb design system (#FF385C primary color)
- [ ] Mobile responsiveness verified for all new components

---

**Document generated:** 2026-01-08 17:32:00 UTC
