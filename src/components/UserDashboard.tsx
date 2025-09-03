'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Building2, Eye, Plus, TrendingUp, RefreshCw, Calendar, Activity } from 'lucide-react';

// Recent Activity Item Interface
interface RecentActivityItem {
  id: string;
  name: string;
  type: 'item' | 'property';
  action: 'created' | 'updated' | 'viewed';
  timestamp: string;
  publicId?: string;
  propertyId?: string;
  propertyName?: string;
}

// User Stats Interface
interface UserStats {
  totalProperties: number;
  totalItems: number;
  recentItems: number;
  totalViews: number;
  last7DaysViews: number;
}

// Property Summary Interface
interface PropertySummary {
  id: string;
  nickname: string;
  itemCount: number;
  lastActivity: string | null;
  totalViews: number;
}

interface UserDashboardProps {
  className?: string;
}

export function UserDashboard({ className = '' }: UserDashboardProps) {
  const router = useRouter();
  const { user, selectedProperty, userProperties } = useAuth();

  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    totalItems: 0,
    recentItems: 0,
    totalViews: 0,
    last7DaysViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [propertySummaries, setPropertySummaries] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user statistics
      const statsResponse = await fetch('/api/user/stats', {
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/user/activity?limit=5&days=7', {
        credentials: 'include'
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.data);
        }
      }

      // Fetch property summaries
      const propertiesResponse = await fetch('/api/user/properties/summary', {
        credentials: 'include'
      });

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        if (propertiesData.success) {
          setPropertySummaries(propertiesData.data);
        }
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Quick action buttons
  const quickActions = [
    {
      title: 'Create New Item',
      description: 'Add a new QR code item',
      href: '/dashboard/items/new',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      primary: true
    },
    {
      title: 'View All Items',
      description: 'Browse your items',
      href: '/dashboard/items',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      title: 'Manage Properties',
      description: 'Add or edit properties',
      href: '/dashboard/properties',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Analytics',
      description: 'See your insights',
      href: '/dashboard/analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  // Stats cards
  const statsCards = [
    {
      title: 'Properties',
      value: stats.totalProperties,
      subtitle: 'Total properties',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Items',
      value: stats.totalItems,
      subtitle: `${stats.recentItems} created recently`,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      subtitle: `${stats.last7DaysViews} in last 7 days`,
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Activity',
      value: recentActivity.length,
      subtitle: 'Recent actions',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'item') {
      return action === 'created' ? <Plus className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />;
    }
    return <Building2 className="w-4 h-4" />;
  };

  const getActivityColor = (type: string, action: string) => {
    if (action === 'created') return 'bg-green-100 text-green-600';
    if (action === 'updated') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName || user?.email}!
            {selectedProperty && ` Currently viewing: ${selectedProperty.nickname}`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <div className={`p-2 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {loading ? '...' : card.value}
              </span>
            </div>
            {card.subtitle && (
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className={`block p-4 ${action.color} text-white rounded-lg transition-colors duration-200 hover:shadow-lg ${action.primary ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {action.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type, activity.action)}`}>
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action === 'created' && 'Created '}
                      {activity.action === 'updated' && 'Updated '}
                      {activity.action === 'viewed' && 'Viewed '}
                      {activity.name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                      {activity.propertyName && (
                        <span className="ml-2">• {activity.propertyName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Property Overview */}
      {propertySummaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertySummaries.map((property) => (
              <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 truncate">{property.nickname}</h4>
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{property.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{property.totalViews}</span>
                  </div>
                  {property.lastActivity && (
                    <div className="text-xs text-gray-500 mt-2">
                      Last activity: {new Date(property.lastActivity).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
