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
