'use client';

import { Building2, Eye, TrendingUp, Users } from 'lucide-react';

interface PropertiesMetricsCardProps {
  totalProperties: number;
  totalVisits: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  averageItemsPerProperty: number;
  activeItems: number;
  loading?: boolean;
}

export default function PropertiesMetricsCard({
  totalProperties,
  totalVisits,
  last24Hours,
  last7Days,
  last30Days,
  averageItemsPerProperty,
  activeItems,
  loading
}: PropertiesMetricsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Properties & Views</h3>
        <Building2 className="w-8 h-8 text-blue-600" />
      </div>

      <div className="space-y-4">
        {/* Properties Overview */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Properties</p>
            <p className="text-2xl font-bold text-blue-600">{totalProperties}</p>
          </div>
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>

        {/* Items per Property */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-green-900">Avg Items per Property</p>
            <p className="text-2xl font-bold text-green-600">{averageItemsPerProperty}</p>
          </div>
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>

        {/* Total Visits */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-purple-900">Total Visits</p>
            <p className="text-2xl font-bold text-purple-600">{totalVisits.toLocaleString()}</p>
            <p className="text-xs text-purple-700">{last24Hours} in last 24h</p>
          </div>
          <Eye className="w-6 h-6 text-purple-600" />
        </div>

        {/* Active Items */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-orange-900">Active Items</p>
            <p className="text-2xl font-bold text-orange-600">{activeItems}</p>
            <p className="text-xs text-orange-700">With visits in last 30 days</p>
          </div>
          <Users className="w-6 h-6 text-orange-600" />
        </div>

        {/* Visit Trends */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Visit Trends</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">24h</p>
              <p className="text-lg font-semibold text-gray-900">{last24Hours}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">7d</p>
              <p className="text-lg font-semibold text-gray-900">{last7Days}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">30d</p>
              <p className="text-lg font-semibold text-gray-900">{last30Days}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
