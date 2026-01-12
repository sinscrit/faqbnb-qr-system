'use client';

/**
 * Rooms Page
 *
 * REQ-204: Placeholder route for Rooms navigation from dashboard cards.
 * Shows overview of rooms used in item organization.
 * Future enhancement: Full room management interface.
 *
 * @route /dashboard2/rooms
 * @created 2026-01-12
 * @lastModified 2026-01-12
 */

import { useAuth } from '@/contexts/AuthContext';
import { Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RoomsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view rooms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <p className="text-gray-600 mt-1">
          View items organized by room location
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div
          className="mx-auto w-16 h-16 bg-[#E6F7F6] rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <Home className="w-8 h-8 text-[#00A699]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Room Management Coming Soon
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Soon you&apos;ll be able to browse and manage items by room. For now, you can see all your items in the Items view.
        </p>
        <Link
          href="/dashboard2/items"
          className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          View All Items
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
