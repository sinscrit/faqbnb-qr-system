'use client';

/**
 * Dashboard Page - Redirects to Dashboard2
 *
 * This page now redirects to the new simplified dashboard at /dashboard2.
 * The new dashboard integrates ItemCreationWorkflow and ItemManager components.
 *
 * @route /dashboard
 * @lastModified 2026-01-06
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard2');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
