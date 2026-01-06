'use client';

/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 *
 * @route /dashboard2
 * @created 2026-01-06
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Package, ArrowRight, Sparkles } from 'lucide-react';

export default function Dashboard2Page() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Item Card */}
        <button
          onClick={() => router.push('/dashboard2/create')}
          className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-[#FF385C] p-8 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="bg-[#FFEEEF] rounded-xl p-4 group-hover:bg-[#FF385C] transition-colors">
              <PlusCircle className="w-8 h-8 text-[#FF385C] group-hover:text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-[#FF385C] transition-colors" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Create New Item</h2>
          <p className="text-gray-600">
            Start the guided workflow to create a new QR code item with step-by-step instructions.
          </p>
          <div className="flex items-center gap-2 mt-4 text-[#FF385C]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Guided 8-step workflow</span>
          </div>
        </button>

        {/* View Items Card */}
        <button
          onClick={() => router.push('/dashboard2/items')}
          className="group bg-white rounded-xl border border-gray-200 hover:border-green-500 p-8 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="bg-green-100 rounded-xl p-4 group-hover:bg-green-500 transition-colors">
              <Package className="w-8 h-8 text-green-600 group-hover:text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-green-500 transition-colors" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">View My Items</h2>
          <p className="text-gray-600">
            Browse, search, and manage all your existing items. Edit, duplicate, or delete as
            needed.
          </p>
          <div className="flex items-center gap-2 mt-4 text-green-600">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Grid & list views available</span>
          </div>
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Select Room</h4>
              <p className="text-sm text-gray-600">Choose where the item is located</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Name Your Item</h4>
              <p className="text-sm text-gray-600">Get smart suggestions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Add Content</h4>
              <p className="text-sm text-gray-600">Instructions, photos, videos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">4</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Generate QR</h4>
              <p className="text-sm text-gray-600">Print-ready codes instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
