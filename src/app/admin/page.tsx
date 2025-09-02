'use client';

import { useAuth } from '@/contexts/AuthContext';
import KPIDashboardOverview from '@/components/KPIDashboardOverview';

export default function AdminPage() {
  const { user, loading } = useAuth();

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by middleware, but show a basic message
  if (!user) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600">Please log in to access the admin dashboard.</p>
        </div>
    </div>
  );
  }

  return <KPIDashboardOverview />;
}

