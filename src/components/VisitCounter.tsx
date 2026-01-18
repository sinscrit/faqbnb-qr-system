'use client';

import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Calendar, Clock } from 'lucide-react';
import { AnalyticsResponse } from '@/types/analytics';

interface VisitCounterProps {
  publicId: string;
  showDetailed?: boolean; // Admin view with time breakdowns
}

interface VisitCounts {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
}

/**
 * Formats numbers with appropriate suffixes (K, M, B)
 * @param num The number to format
 * @returns Formatted string (e.g., "1.2K", "2.5M")
 */
function formatNumber(num: number): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum < 1000) {
    return num.toLocaleString();
  } else if (absNum < 1000000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands.toFixed(0)}K` : `${thousands.toFixed(1)}K`;
  } else if (absNum < 1000000000) {
    const millions = num / 1000000;
    return millions % 1 === 0 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`;
  } else {
    const billions = num / 1000000000;
    return billions % 1 === 0 ? `${billions.toFixed(0)}B` : `${billions.toFixed(1)}B`;
  }
}

/**
 * Returns a human-readable label for visit counts
 * @param count The visit count
 * @returns Appropriate label (e.g., "view", "views")
 */
function getViewLabel(count: number): string {
  return count === 1 ? 'view' : 'views';
}

/**
 * Loading skeleton component for visit counter
 */
function VisitCounterSkeleton({ showDetailed }: { showDetailed?: boolean }) {
  return (
    <div className="visit-counter-skeleton">
      {/* Basic counter skeleton */}
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Detailed breakdown skeleton */}
      {showDetailed && (
        <div className="mt-3 space-y-2">
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-2 space-y-1">
                <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisitCounter({ publicId, showDetailed = false }: VisitCounterProps) {
  const [visitCounts, setVisitCounts] = useState<VisitCounts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitCounts = async () => {
      if (!publicId) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch analytics data from the admin analytics endpoint
        const response = await fetch(`/api/admin/items/${publicId}/analytics`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Item not found - set zero counts
            setVisitCounts({
              last24Hours: 0,
              last7Days: 0,
              last30Days: 0,
              allTime: 0
            });
          } else {
            throw new Error(`Failed to fetch analytics: ${response.status}`);
          }
        } else {
          const analyticsData: AnalyticsResponse = await response.json();
          
          if (analyticsData.success && analyticsData.data) {
            setVisitCounts({
              last24Hours: analyticsData.data.last24Hours || 0,
              last7Days: analyticsData.data.last7Days || 0,
              last30Days: analyticsData.data.last30Days || 0,
              allTime: analyticsData.data.allTime || 0
            });
          } else {
            throw new Error(analyticsData.error || 'Invalid analytics response');
          }
        }
      } catch (error) {
        console.error('Failed to fetch visit counts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load visit counts');
        
        // Set zero counts as fallback
        setVisitCounts({
          last24Hours: 0,
          last7Days: 0,
          last30Days: 0,
          allTime: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisitCounts();
  }, [publicId]);

  if (loading) {
    return <VisitCounterSkeleton showDetailed={showDetailed} />;
  }

  if (!visitCounts) {
    return (
      <div className="visit-counter-error flex items-center space-x-2 text-gray-500">
        <Eye className="w-4 h-4" />
        <span className="text-sm">Views unavailable</span>
      </div>
    );
  }

  const primaryCount = visitCounts.allTime;
  const hasVisits = primaryCount > 0;

  return (
    <div className="visit-counter">
      {/* Primary Counter Display */}
      <div className={`flex items-center space-x-2 ${hasVisits ? 'text-gray-700' : 'text-gray-500'}`}>
        <Eye className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">
          {hasVisits ? (
            <>
              {formatNumber(primaryCount)} {getViewLabel(primaryCount)}
            </>
          ) : (
            'No views yet'
          )}
        </span>
      </div>

      {/* Detailed Breakdown */}
      {showDetailed && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Visit Breakdown</h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 24 Hours */}
            <div className="text-center p-2 bg-white rounded border">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">24h</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatNumber(visitCounts.last24Hours)}
              </div>
            </div>
            
            {/* 7 Days */}
            <div className="text-center p-2 bg-white rounded border">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">7d</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatNumber(visitCounts.last7Days)}
              </div>
            </div>
            
            {/* 30 Days */}
            <div className="text-center p-2 bg-white rounded border">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">30d</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatNumber(visitCounts.last30Days)}
              </div>
            </div>
            
            {/* All Time */}
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-600">Total</span>
              </div>
              <div className="text-sm font-semibold text-blue-900">
                {formatNumber(visitCounts.allTime)}
              </div>
            </div>
          </div>
          
          {/* Zero state message for detailed view */}
          {!hasVisits && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                This item hasn't been visited yet
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && !showDetailed && (
        <div className="mt-1">
          <p className="text-xs text-red-500" title={error}>
            Failed to load views
          </p>
        </div>
      )}

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && visitCounts && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-gray-600">
            <div>Public ID: {publicId}</div>
            <div>24h: {visitCounts.last24Hours}</div>
            <div>7d: {visitCounts.last7Days}</div>
            <div>30d: {visitCounts.last30Days}</div>
            <div>All: {visitCounts.allTime}</div>
            <div>Detailed: {showDetailed ? 'Yes' : 'No'}</div>
          </div>
        </details>
      )}
    </div>
  );
} 