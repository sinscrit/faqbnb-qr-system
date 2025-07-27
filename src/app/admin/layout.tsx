'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth, useAccountContext } from '@/contexts/AuthContext';
import { CompactAccountSelector } from '@/components/AccountSelector';
import { Account } from '@/types';
import { Property } from '@/lib/auth';

// Property Context for admin layout
interface PropertyContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  availableProperties: Property[];
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut, isAdmin, userProperties, selectedProperty, setSelectedProperty } = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();
  
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Load properties for the current account context
  useEffect(() => {
    const loadProperties = async () => {
      if (!user) {
        setAvailableProperties([]);
        return;
      }

      setLoadingProperties(true);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Include current account in request if available
        if (currentAccount) {
          headers['x-current-account'] = currentAccount.id;
        }

        const response = await fetch('/api/admin/properties', {
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvailableProperties(data.data || []);
            
            // Clear selected property if it's not available in current account
            if (selectedProperty && data.data) {
              const propertyExists = data.data.some((p: Property) => p.id === selectedProperty.id);
              if (!propertyExists) {
                setSelectedProperty(null);
              }
            }
          } else {
            console.warn('Failed to load properties:', data.error);
            setAvailableProperties([]);
          }
        } else {
          console.warn('Properties request failed:', response.status);
          setAvailableProperties([]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setAvailableProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    if (user) {
      loadProperties();
    }
  }, [user, currentAccount, selectedProperty, setSelectedProperty]);

  // Handle account change
  const handleAccountChange = (account: Account | null) => {
    console.log('Account changed in admin layout:', account?.name || 'none');
    // Properties will be reloaded automatically due to the useEffect dependency on currentAccount
    // Clear current property selection since we're switching accounts
    setSelectedProperty(null);
  };

  // Navigation items based on user role and account context
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Items', href: '/admin/items', icon: '📦' },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { name: 'Properties', href: '/admin/properties', icon: '🏠' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      ];
    } else {
      return [
        ...baseItems,
        { name: 'My Properties', href: '/admin/properties', icon: '🏠' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin panel.</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Title and user info */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">FAQBNB Admin</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAdmin ? '👑 Admin' : '👤 User'}
                  </span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  {currentAccount && (
                    <span className="text-xs text-gray-500">
                      • {currentAccount.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center - Account Selector and Property Filter */}
            <div className="flex items-center space-x-6">
              {/* Account Selector */}
              {userAccounts.length > 0 && (
                <div className="min-w-0">
                  <CompactAccountSelector
                    onAccountChange={handleAccountChange}
                    className="w-64"
                  />
                </div>
              )}

              {/* Property Filter (only show if properties are available) */}
              {availableProperties.length > 0 && (
                <div className="flex items-center space-x-2 min-w-0">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Property:</label>
                  <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => {
                      const propertyId = e.target.value;
                      const property = propertyId ? availableProperties.find(p => p.id === propertyId) : null;
                      setSelectedProperty(property || null);
                    }}
                    className="block px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                    disabled={loadingProperties}
                  >
                    <option value="">
                      {loadingProperties ? 'Loading...' : 'All Properties'}
                    </option>
                    {availableProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Account Context Info */}
              {!currentAccount && userAccounts.length > 0 && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Please select an account
                </div>
              )}
            </div>

            {/* Right side - Logout */}
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Admin Navigation">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Status indicators */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {/* Property context info for users */}
        {!isAdmin && selectedProperty && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-medium">Current Property</div>
              <div>{selectedProperty.nickname}</div>
            </div>
          </div>
        )}

        {/* Account context info */}
        {currentAccount && (
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-medium">Active Account</div>
              <div className="flex items-center space-x-1">
                <span>{currentAccount.name}</span>
                {user?.currentAccount?.isOwner && <span>👑</span>}
              </div>
              <div className="text-xs opacity-90">
                Role: {user?.currentAccount?.role || 'member'}
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loadingProperties && (
          <div className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-sm flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              <span>Loading properties...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AuthProvider>
  );
}