'use client';

/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * REQ-131: Added PropertyEditModal integration
 * REQ-132: Added AddPropertyModal integration
 * REQ-134: Added per-property statistics filtering
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-06
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import { StatisticsCards, ActionButtons, PropertySection, PropertyEditModal, AddPropertyModal } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Property } from '@/types';
import PropertySelector from '@/components/PropertySelector';

export default function Dashboard2Page() {
  const { user, getUserProperties, userProperties } = useAuth();

  // REQ-134: State for property filter
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // REQ-134: Pass selected property to stats hook
  const { stats, isLoading, error, refresh } = useDashboardStats(
    selectedPropertyId || undefined
  );

  // REQ-131: State for PropertyEditModal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // REQ-132: State for AddPropertyModal
  const [addModalOpen, setAddModalOpen] = useState(false);

  // REQ-132: State for success message (Task 5)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const firstName = user?.email?.split('@')[0] || 'there';

  // REQ-131: Handler for property edit click
  const handlePropertyEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  // REQ-131: Handler for property save success
  const handlePropertySave = async (updatedProperty: Property) => {
    // Refresh user properties via AuthContext
    await getUserProperties?.();
    // Refresh stats to reflect any changes
    refresh();
  };

  // REQ-131: Handler for edit modal close
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedProperty(null);
  };

  // REQ-132: Handler for add property click
  const handleAddProperty = () => {
    setAddModalOpen(true);
  };

  // REQ-132: Handler for property creation success
  const handlePropertyAdded = async (newProperty: Property) => {
    // Refresh user properties via AuthContext
    await getUserProperties?.();
    // Refresh stats to reflect new property
    refresh();
    // Close the modal
    setAddModalOpen(false);
    // Show success message
    setSuccessMessage('Property created successfully');
    // Clear after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* REQ-132: Success Message Banner */}
      {successMessage && (
        <div className="bg-[#00A699] text-white px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* REQ-134: Property Filter - only show for multi-property users */}
      {userProperties && userProperties.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#222222]">
            View statistics for:
          </label>
          <div className="w-64">
            <PropertySelector
              properties={userProperties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={setSelectedPropertyId}
              variant="compact"
              size="md"
              placeholder="All Properties"
            />
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Action Buttons - REQ-126 */}
      <ActionButtons />

      {/* Property Section - REQ-130 */}
      <PropertySection
        onPropertyEdit={handlePropertyEdit}
        onAddProperty={handleAddProperty}
      />

      {/* Property Edit Modal - REQ-131 */}
      <PropertyEditModal
        isOpen={editModalOpen}
        property={selectedProperty}
        onClose={handleEditModalClose}
        onSave={handlePropertySave}
      />

      {/* Add Property Modal - REQ-132 */}
      <AddPropertyModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handlePropertyAdded}
      />
    </div>
  );
}
