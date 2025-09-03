'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import KPIDashboardOverview from '@/components/KPIDashboardOverview';
import { UserDashboard } from '@/components/UserDashboard';

export default function DashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { useCanAccess, permissions, isLoading: permissionsLoading } = usePermissions(user, undefined, undefined);

  // Check permissions for analytics access
  const canViewAnalytics = useCanAccess('view_analytics');

  // Show loading state while authentication or permissions are being determined
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by the layout, but show a basic message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard rendering with account context integration
  if (isAdmin && canViewAnalytics.granted) {
    // System Admin: Show full KPI dashboard with REQ-022 enhancements
    // Account context is handled within KPIDashboardOverview component
    return <KPIDashboardOverview />;
  } else {
    // Regular User: Show comprehensive user dashboard with account context
    // Account filtering and context is handled within UserDashboard component
    return <UserDashboard />;
  }
}