'use client';

/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 * REQ-130: Added PropertySection component
 * REQ-131: Added PropertyEditModal integration
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-06 23:30:00 UTC
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatisticsCards, ActionButtons, PropertySection, PropertyEditModal } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Property } from '@/types';

export default function Dashboard2Page() {
  const { user, getUserProperties } = useAuth();
  const { stats, isLoading, error, refresh } = useDashboardStats();

  // REQ-131: State for PropertyEditModal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Action Buttons - REQ-126 */}
      <ActionButtons />

      {/* Property Section - REQ-130 */}
      <PropertySection
        onPropertyEdit={handlePropertyEdit}
        onAddProperty={() => {
          // TODO: Implement in Task 4.3 (AddPropertyModal)
          console.log('[Dashboard2] Add new property');
        }}
      />

      {/* Property Edit Modal - REQ-131 */}
      <PropertyEditModal
        isOpen={editModalOpen}
        property={selectedProperty}
        onClose={handleEditModalClose}
        onSave={handlePropertySave}
      />
    </div>
  );
}
