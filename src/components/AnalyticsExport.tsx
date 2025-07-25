'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp, Loader2 } from 'lucide-react';

interface ExportOptions {
  timeRange: '24h' | '7d' | '30d' | '1y' | 'all';
  includeVisits: boolean;
  includeReactions: boolean;
  includeItemDetails: boolean;
  format: 'csv' | 'json';
}

interface AnalyticsExportProps {
  className?: string;
  variant?: 'button' | 'card';
  defaultTimeRange?: '24h' | '7d' | '30d' | '1y' | 'all';
}

export default function AnalyticsExport({ 
  className = '', 
  variant = 'button',
  defaultTimeRange = '30d'
}: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [options, setOptions] = useState<ExportOptions>({
    timeRange: defaultTimeRange,
    includeVisits: true,
    includeReactions: true,
    includeItemDetails: true,
    format: 'csv'
  });
  const [error, setError] = useState<string | null>(null);

  // Generate CSV content from analytics data
  const generateCSV = (data: any): string => {
    const headers = [];
    const rows = [];

    // Build headers based on options
    if (options.includeItemDetails) {
      headers.push('Item Name', 'Public ID', 'Created Date', 'Links Count');
    }
    
    if (options.includeVisits) {
      headers.push('Total Views', '24h Views', '7d Views', '30d Views');
    }
    
    if (options.includeReactions) {
      headers.push('Total Reactions', 'Likes', 'Loves', 'Confused', 'Dislikes', 'Engagement Rate');
    }

    // Add timestamp header
    headers.push('Export Date');

    // Process data rows
    if (data.itemDetails && Array.isArray(data.itemDetails)) {
      data.itemDetails.forEach((item: any) => {
        const row = [];
        
        if (options.includeItemDetails) {
          row.push(
            `"${(item.name || '').replace(/"/g, '""')}"`,
            item.publicId || '',
            item.createdAt || '',
            item.linksCount || 0
          );
        }
        
        if (options.includeVisits) {
          const visits = item.analytics?.visitCounts || {};
          row.push(
            visits.allTime || 0,
            visits.last24Hours || 0,
            visits.last7Days || 0,
            visits.last30Days || 0
          );
        }
        
        if (options.includeReactions) {
          const reactions = item.analytics?.reactionCounts || {};
          const totalVisits = item.analytics?.visitCounts?.allTime || 0;
          const engagementRate = totalVisits > 0 ? ((reactions.total || 0) / totalVisits * 100).toFixed(2) : '0.00';
          
          row.push(
            reactions.total || 0,
            reactions.like || 0,
            reactions.love || 0,
            reactions.confused || 0,
            reactions.dislike || 0,
            `${engagementRate}%`
          );
        }

        row.push(new Date().toISOString());
        rows.push(row);
      });
    }

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  };

  // Generate JSON content from analytics data
  const generateJSON = (data: any): string => {
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        timeRange: options.timeRange,
        options: options
      },
      summary: {
        totalItems: data.itemDetails?.length || 0,
        totalViews: data.timeBasedVisits?.allTime || 0,
        totalReactions: data.reactionTrends?.total || 0
      },
      items: data.itemDetails?.map((item: any) => {
        const exportItem: any = {};
        
        if (options.includeItemDetails) {
          exportItem.details = {
            name: item.name,
            publicId: item.publicId,
            createdAt: item.createdAt,
            linksCount: item.linksCount
          };
        }
        
        if (options.includeVisits) {
          exportItem.visits = item.analytics?.visitCounts || {};
        }
        
        if (options.includeReactions) {
          exportItem.reactions = item.analytics?.reactionCounts || {};
          if (options.includeVisits) {
            const totalVisits = item.analytics?.visitCounts?.allTime || 0;
            exportItem.engagementRate = totalVisits > 0 ? 
              ((item.analytics?.reactionCounts?.total || 0) / totalVisits * 100) : 0;
          }
        }
        
        return exportItem;
      }) || []
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  // Trigger file download
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle export
  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setError(null);

    try {
      // Fetch analytics data
      const response = await fetch(`/api/admin/analytics?timeRange=${options.timeRange}&detailed=true&export=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }

      const data = result.data;

      // Generate file content
      let content: string;
      let filename: string;
      let mimeType: string;

      if (options.format === 'csv') {
        content = generateCSV(data);
        filename = `faqbnb-analytics-${options.timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = generateJSON(data);
        filename = `faqbnb-analytics-${options.timeRange}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json;charset=utf-8;';
      }

      // Trigger download
      downloadFile(content, filename, mimeType);
      
      // Close options modal
      setShowOptions(false);
      
    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Quick export (with default options)
  const handleQuickExport = async () => {
    await handleExport();
  };

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleQuickExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Export analytics data as CSV"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
        
        {error && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 whitespace-nowrap z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
        </div>
        <TrendingUp className="w-5 h-5 text-gray-500" />
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6">
        Export your analytics data for external analysis or reporting. Choose your preferred format and data range.
      </p>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { value: '24h', label: '24 Hours' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '1y', label: '1 Year' },
              { value: 'all', label: 'All Time' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setOptions(prev => ({ ...prev, timeRange: range.value as any }))}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  options.timeRange === range.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Inclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
          <div className="space-y-2">
            {[
              { key: 'includeItemDetails', label: 'Item Details (name, ID, creation date)' },
              { key: 'includeVisits', label: 'Visit Analytics (views by time period)' },
              { key: 'includeReactions', label: 'Reaction Data (likes, loves, etc.)' }
            ].map((option) => (
              <label key={option.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options[option.key as keyof ExportOptions] as boolean}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    [option.key]: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'csv', label: 'CSV (Spreadsheet)', icon: '📊' },
              { value: 'json', label: 'JSON (Data)', icon: '🔧' }
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                className={`p-3 text-left rounded-md border transition-colors ${
                  options.format === format.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{format.icon}</span>
                  <span className="text-sm font-medium">{format.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || (!options.includeVisits && !options.includeReactions && !options.includeItemDetails)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export Analytics Data</span>
          </>
        )}
      </button>

      {/* Export Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Export Preview</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Time Range: {options.timeRange === '24h' ? '24 hours' : 
                           options.timeRange === '7d' ? '7 days' : 
                           options.timeRange === '30d' ? '30 days' : 
                           options.timeRange === '1y' ? '1 year' : 'All time'}</div>
          <div>Format: {options.format.toUpperCase()}</div>
          <div>Includes: {[
            options.includeItemDetails && 'Item Details',
            options.includeVisits && 'Visits',
            options.includeReactions && 'Reactions'
          ].filter(Boolean).join(', ') || 'Nothing selected'}</div>
        </div>
      </div>
    </div>
  );
} 