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
 * REQ-136: Added progressive UI based on property count
 * REQ-137: Added new user welcome state and empty state guidance
 * REQ-140: Added responsive padding and layout for mobile
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-06 16:52:00 UTC
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Home } from 'lucide-react';
import {
  ActionButtons,
  PropertySection,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { Property } from '@/types';
import PropertySelector from '@/components/PropertySelector';
import { GroupingOption } from '@/components/SimpleDashboard/PropertyGroupingControl';

export default function Dashboard2Page() {
  const router = useRouter();
  const { user, getUserProperties, userProperties } = useAuth();

  // REQ-136: Get user preferences
  const { preferences, setPreference } = useDashboardPreferences();

  // REQ-136: Get tier configuration with preference overrides
  const tierConfig = useDashboardTier(userProperties?.length ?? 0, {
    forceAdvancedTools: preferences.forceAdvancedTools,
    forcePortfolioView: preferences.forcePortfolioView,
  });

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

  // REQ-136: State for bulk operations
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [currentGrouping, setCurrentGrouping] = useState<GroupingOption>('none');

  const firstName = user?.email?.split('@')[0] || 'there';

  // REQ-137: Detect brand new user (no properties and no items)
  const isNewUser = (!userProperties || userProperties.length === 0) &&
    (stats?.itemCount === 0 || stats?.itemCount === undefined);

  // REQ-137: Handler for empty state create item CTA
  const handleCreateItem = useCallback(() => {
    router.push('/dashboard2/create');
  }, [router]);

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

  // REQ-136: Handler for selecting all properties
  const handleSelectAll = useCallback(() => {
    if (userProperties) {
      setSelectedPropertyIds(userProperties.map((p) => p.id));
    }
  }, [userProperties]);

  // REQ-136: Handler for deselecting all properties
  const handleDeselectAll = useCallback(() => {
    setSelectedPropertyIds([]);
  }, []);

  // REQ-136: Handler for printing selected properties
  const handlePrintSelected = useCallback(() => {
    if (selectedPropertyIds.length === 0) return;

    // Navigate to print flow with selected property IDs
    const propertyIdsParam = selectedPropertyIds.join(',');
    router.push(`/dashboard2/print?propertyIds=${propertyIdsParam}`);
  }, [selectedPropertyIds, router]);

  // REQ-136: Handler for grouping change
  const handleGroupChange = useCallback((option: GroupingOption) => {
    setCurrentGrouping(option);
  }, []);

  // REQ-136: Dynamic spacing based on tier
  const mainSpacing = tierConfig.tier === 'single' ? 'space-y-6' : 'space-y-8';

  return (
    <div className={mainSpacing}>
      {/* REQ-132: Success Message Banner */}
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

      {/* REQ-137: New User Welcome State */}
      {isNewUser && !isLoading ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyStateCard
            icon={Home}
            title="Welcome to FAQBNB!"
            description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
            actionLabel="Add Your First Property"
            onAction={handleAddProperty}
            variant="welcome"
          />
        </div>
      ) : (
        <>
          {/* Welcome Section with Settings - REQ-140: Responsive padding */}
          <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
            {/* REQ-136: Settings Popover */}
            <div className="absolute top-4 right-4">
              <DashboardSettingsPopover
                preferences={preferences}
                onPreferenceChange={setPreference}
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
            <p className="text-white/80 text-lg">Create and manage your QR code items</p>
          </div>

          {/* REQ-136: Property Filter - using tier config instead of hardcoded check */}
          {/* REQ-140: Responsive layout - stacks vertically on mobile */}
          {tierConfig.showPropertySelector && userProperties && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-sm font-medium text-[#222222]">
                View statistics for:
              </label>
              <div className="w-full sm:w-64">
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

          {/* REQ-136: Progressive Statistics Section */}
          {/* REQ-137: Pass onCreateItem for empty state CTA */}
          <ProgressiveStatisticsSection
            stats={stats}
            isLoading={isLoading}
            error={error}
            overrides={{
              forceAdvancedTools: preferences.forceAdvancedTools,
              forcePortfolioView: preferences.forcePortfolioView,
            }}
            onCreateItem={handleCreateItem}
          />

          {/* REQ-136: Advanced Dashboard Tools */}
          <AdvancedDashboardTools
            selectedPropertyIds={selectedPropertyIds}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onPrintSelected={handlePrintSelected}
            onGroupChange={handleGroupChange}
            currentGrouping={currentGrouping}
          />

          {/* Action Buttons - REQ-126 */}
          <ActionButtons />

          {/* Property Section - REQ-130, REQ-136: Now with tier prop */}
          <PropertySection
            tier={tierConfig.tier}
            onPropertyEdit={handlePropertyEdit}
            onAddProperty={handleAddProperty}
          />
        </>
      )}

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
