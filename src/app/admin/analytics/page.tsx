'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Eye, Heart, Users, Activity } from 'lucide-react';

interface TimeRange {
  id: string;
  label: string;
  value: string;
}

const TIME_RANGES: TimeRange[] = [
  { id: '24h', label: '24 Hours', value: '1' },
  { id: '7d', label: '7 Days', value: '7' },
  { id: '30d', label: '30 Days', value: '30' },
  { id: '1y', label: '1 Year', value: '365' }
];

interface OverviewCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');

  // Placeholder data for overview cards
  const overviewCards: OverviewCard[] = [
    {
      title: 'Total Views',
      value: '12,345',
      change: '+12.5%',
      changeType: 'increase',
      icon: <Eye className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Total Reactions',
      value: '1,234',
      change: '+8.3%',
      changeType: 'increase',
      icon: <Heart className="w-6 h-6" />,
      color: 'red'
    },
    {
      title: 'Active Items',
      value: '89',
      change: '+2.1%',
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Unique Visitors',
      value: '5,678',
      change: '-1.2%',
      changeType: 'decrease',
      icon: <Users className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const getCardColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getChangeColorClasses = (changeType: 'increase' | 'decrease' | 'neutral') => {
    const changeMap = {
      increase: 'text-green-600',
      decrease: 'text-red-600',
      neutral: 'text-gray-600'
    };
    return changeMap[changeType];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">View visit analytics and reaction data</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Time Range</h3>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedTimeRange(range.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeRange === range.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg border ${getCardColorClasses(card.color)}`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${getChangeColorClasses(card.changeType)}`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts/Tables */}
      <div className="space-y-6">
        {/* Visit Trends Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Visit Trends</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Visit trends chart placeholder</p>
              <p className="text-sm text-gray-500 mt-1">Charts will be implemented in future tasks</p>
            </div>
          </div>
        </div>

        {/* Reaction Breakdown Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reaction Breakdown</h3>
            <Heart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">👍</div>
              <p className="text-lg font-semibold text-gray-900">456</p>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">❤️</div>
              <p className="text-lg font-semibold text-gray-900">234</p>
              <p className="text-sm text-gray-600">Loves</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">😕</div>
              <p className="text-lg font-semibold text-gray-900">123</p>
              <p className="text-sm text-gray-600">Confused</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">👎</div>
              <p className="text-lg font-semibold text-gray-900">45</p>
              <p className="text-sm text-gray-600">Dislikes</p>
            </div>
          </div>
        </div>

        {/* Top Items Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Items</h3>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reactions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'Getting Started Guide', views: 1234, reactions: 89, engagement: '7.2%' },
                  { name: 'Advanced Features', views: 987, reactions: 67, engagement: '6.8%' },
                  { name: 'FAQ Collection', views: 756, reactions: 45, engagement: '6.0%' },
                  { name: 'Troubleshooting', views: 543, reactions: 32, engagement: '5.9%' },
                  { name: 'API Documentation', views: 432, reactions: 21, engagement: '4.9%' }
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{item.reactions}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.engagement}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Export Report</p>
                  <p className="text-sm text-gray-600">Download analytics data</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Detailed Reports</p>
                  <p className="text-sm text-gray-600">See granular analytics</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Schedule Report</p>
                  <p className="text-sm text-gray-600">Set up automated reports</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-100 text-blue-600 rounded">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Development Note</p>
            <p className="text-sm text-blue-700">
              This is the analytics dashboard structure. Charts and real-time data integration will be added in subsequent tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 