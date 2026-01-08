'use client';

/**
 * My Properties Page
 *
 * REQ-141: Dedicated page for property management
 * Moved from dashboard home to reduce clutter and provide focused property management.
 *
 * @route /dashboard2/properties
 * @created 2026-01-08
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import {
  PropertySection,
  PropertyEditModal,
  AddPropertyModal,
} from '@/components/SimpleDashboard';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { Property } from '@/types';

export default function PropertiesPage() {
  const { user, getUserProperties, userProperties } = useAuth();

  // Get tier configuration for property display
  const tierConfig = useDashboardTier(userProperties?.length ?? 0);

  // State for PropertyEditModal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // State for AddPropertyModal
  const [addModalOpen, setAddModalOpen] = useState(false);

  // State for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handler for property edit click
  const handlePropertyEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  // Handler for property save success
  const handlePropertySave = async (updatedProperty: Property) => {
    // Refresh user properties via AuthContext
    await getUserProperties?.();
    // Show success message
    setSuccessMessage('Property updated successfully');
    // Clear after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handler for edit modal close
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedProperty(null);
  };

  // Handler for add property click
  const handleAddProperty = () => {
    setAddModalOpen(true);
  };

  // Handler for property creation success
  const handlePropertyAdded = async (newProperty: Property) => {
    // Refresh user properties via AuthContext
    await getUserProperties?.();
    // Close the modal
    setAddModalOpen(false);
    // Show success message
    setSuccessMessage('Property created successfully');
    // Clear after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <p className="text-gray-600 mt-1">
          Manage your properties and their settings
        </p>
      </div>

      {/* Success Message Banner */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#00A699] text-white px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Property Section - reusing existing component */}
      <PropertySection
        tier={tierConfig.tier}
        onPropertyEdit={handlePropertyEdit}
        onAddProperty={handleAddProperty}
      />

      {/* Property Edit Modal */}
      <PropertyEditModal
        isOpen={editModalOpen}
        property={selectedProperty}
        onClose={handleEditModalClose}
        onSave={handlePropertySave}
      />

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handlePropertyAdded}
      />
    </div>
  );
}
