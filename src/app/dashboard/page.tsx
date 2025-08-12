'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { Property, Account } from '@/types';
import { formatDate } from '@/lib/utils';
import { Home, Building, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboardPage() {
  const { user, signOut } = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProperties();
    }
  }, [user, currentAccount]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Include current account in request if available
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      const response = await fetch('/api/user/properties', {
        headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProperties(data.data || []);
        } else {
          setError(data.error || 'Failed to load properties');
        }
      } else {
        setError('Failed to load properties');
      }
    } catch (err) {
      setError('Error loading properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthGuard requireAdmin={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                  <p className="text-sm text-gray-500">Manage your properties and account settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Account Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <User className="h-10 w-10 text-blue-600 mr-4" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{user?.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="text-sm text-gray-900">{user?.fullName || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Current Account</dt>
                        <dd className="text-sm text-gray-900">{currentAccount?.name || 'No account selected'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Accounts</dt>
                        <dd className="text-sm text-gray-900">{userAccounts?.length || 0}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">My Properties</h2>
                  </div>
                  {currentAccount && (
                    <span className="text-sm text-gray-500">
                      Account: {currentAccount.name}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading properties...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={loadUserProperties}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any properties in this account yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                      <div key={property.id} className="bg-gray-50 rounded-lg p-4 border">
                        <h3 className="font-medium text-gray-900 mb-2">{property.name}</h3>
                        {property.description && (
                          <p className="text-sm text-gray-600 mb-2">{property.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          <p>Created: {formatDate(property.created_at)}</p>
                          {property.updated_at && property.updated_at !== property.created_at && (
                            <p>Updated: {formatDate(property.updated_at)}</p>
                          )}
                        </div>
                        <div className="mt-3">
                          <Link
                            href={`/dashboard/properties/${property.id}`}
                            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Switching */}
            {userAccounts && userAccounts.length > 1 && (
              <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Switch Account</h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {userAccounts.map((account) => (
                      <div
                        key={account.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          currentAccount?.id === account.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{account.name}</h3>
                        {account.description && (
                          <p className="text-sm text-gray-600">{account.description}</p>
                        )}
                        {currentAccount?.id === account.id && (
                          <span className="text-xs text-blue-600 font-medium">Current</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}