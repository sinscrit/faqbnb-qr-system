'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, QrCode } from 'lucide-react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Property {
  id: string;
  nickname: string;
  property_type: {
    id: string;
    name: string;
    display_name: string;
  };
  created_at: string;
  updated_at: string;
}

export default function UserPropertiesPage() {
  const { user, loading } = useAuth();
  const { currentAccount } = useAccountContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user, currentAccount]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      const response = await fetch('/api/admin/properties', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to load properties: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all associated items.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete property: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setProperties(prev => prev.filter(property => property.id !== propertyId));
      } else {
        throw new Error(result.error || 'Failed to delete property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your properties and their QR codes</p>
        </div>
        <Link
          href="/user/properties/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading properties</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingProperties && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        </div>
      )}

      {/* Properties List */}
      {!loadingProperties && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first property.</p>
              <div className="mt-6">
                <Link
                  href="/user/properties/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{property.nickname}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {property.property_type?.display_name || property.property_type?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/user/properties/${property.id}`}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View property"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/user/properties/${property.id}/qr-print`}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                            title="Print QR codes"
                          >
                            <QrCode className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/user/properties/${property.id}/edit`}
                            className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                            title="Edit property"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
