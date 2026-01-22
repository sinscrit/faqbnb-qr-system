'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
// REQ-023: Unified Route Architecture - Navigation Integration
import { DashboardSection, PERMISSIONS } from '@/types/permissions';
import type { AccountRole } from '@/types';
import { CompactAccountSelector } from './AccountSelector';
import { RoleBasedNavigation } from './RoleBasedNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Account, Property } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showAccountSelector?: boolean;
  className?: string;
}

export function DashboardLayout({
  children,
  title = 'FAQBNB Dashboard',
  showAccountSelector = true,
  className = ''
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // REQ-E02-053: Translation hook for i18n
  const t = useTranslations('dashboard');

  const {
    user,
    loading: authLoading,
    signOut,
    isAdmin,
    selectedProperty,
    setSelectedProperty,
    dashboardPermissions,
    currentDashboardSection,
    permissionsLoading,
    canNavigateToSection
  } = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();

  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [accountRole, setAccountRole] = useState<AccountRole | null>(null);

  // Load properties for the current account context
  useEffect(() => {
    const loadProperties = async () => {
      if (!user || !currentAccount) {
        setAvailableProperties([]);
        return;
      }

      setLoadingProperties(true);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-current-account': currentAccount.id
        };

        const response = await fetch('/api/admin/properties', {
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvailableProperties(data.data || []);
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

    if (user && currentAccount) {
      loadProperties();
    }
  }, [user, currentAccount]);

  // Determine account role from the current account's userRole field
  useEffect(() => {
    if (currentAccount && user) {
      // The userRole is already populated on the Account object
      setAccountRole(currentAccount.userRole || null);
    } else {
      setAccountRole(null);
    }
  }, [currentAccount, user]);

  // Persist account and property selection across route changes (REQ-023)
  useEffect(() => {
    if (!user || !currentAccount) return;

    // Persist current account in localStorage for route changes
    const accountData = {
      id: currentAccount.id,
      name: currentAccount.name,
      timestamp: Date.now()
    };
    localStorage.setItem('dashboard_current_account', JSON.stringify(accountData));

    // Persist selected property if it exists
    if (selectedProperty) {
      const propertyData = {
        id: selectedProperty.id,
        name: selectedProperty.nickname,
        accountId: currentAccount.id,
        timestamp: Date.now()
      };
      localStorage.setItem('dashboard_selected_property', JSON.stringify(propertyData));
    }
  }, [user, currentAccount, selectedProperty]);

  // Restore account and property selection on component mount
  useEffect(() => {
    if (!user) return;

    try {
      // Restore selected property if it belongs to current account
      const savedProperty = localStorage.getItem('dashboard_selected_property');
      if (savedProperty && currentAccount) {
        const propertyData = JSON.parse(savedProperty);
        if (propertyData.accountId === currentAccount.id && propertyData.timestamp > Date.now() - 24 * 60 * 60 * 1000) { // 24 hours
          // Property selection would be restored here if we had the property object
          // For now, we'll just ensure the property is cleared on account changes
        }
      }
    } catch (error) {
      console.warn('Failed to restore dashboard state:', error);
      localStorage.removeItem('dashboard_selected_property');
    }
  }, [user, currentAccount]);

  // Handle account change with state persistence
  const handleAccountChange = (account: Account | null) => {
    console.log('Account changed in dashboard layout:', account?.name || 'none');

    // Clear property selection when account changes
    setSelectedProperty(null);

    // Clear persisted property data for old account
    localStorage.removeItem('dashboard_selected_property');

    // The new account will be persisted in the useEffect above
  };

  // Handle navigation with dashboard section tracking (REQ-023)
  const handleNavigation = (href: string, section?: DashboardSection) => {
    console.log('Navigation triggered:', { href, section, currentSection: currentDashboardSection });

    // Validate navigation permission if section is provided
    if (section && !canNavigateToSection(section)) {
      console.warn('Navigation blocked: insufficient permissions for section', section);
      return;
    }

    router.push(href);
  };

  // Loading state (REQ-023 enhanced)
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {permissionsLoading ? t('loading.permissions') : t('loading.dashboard')}
          </p>
        </div>
      </div>
    );
  }

  // Authentication required state
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
          <p className="text-gray-600 mb-6">{t('auth.pleaseLogin')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('auth.goHome')}
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('auth.goLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 print:bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Title, section info, and user info */}
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  {/* Current dashboard section indicator (REQ-023) */}
                  {currentDashboardSection && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      currentDashboardSection === DashboardSection.systemAdmin
                        ? 'bg-purple-100 text-purple-800'
                        : currentDashboardSection === DashboardSection.analytics
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentDashboardSection === DashboardSection.dashboard && `📊 ${t('section.dashboard')}`}
                      {currentDashboardSection === DashboardSection.items && `📦 ${t('section.items')}`}
                      {currentDashboardSection === DashboardSection.instructions && `📄 ${t('section.guides')}`}
                      {currentDashboardSection === DashboardSection.properties && `🏠 ${t('section.properties')}`}
                      {currentDashboardSection === DashboardSection.analytics && `📈 ${t('section.analytics')}`}
                      {currentDashboardSection === DashboardSection.systemAdmin && `👑 ${t('section.systemAdmin')}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAdmin ? `👑 ${t('role.systemAdmin')}` : `👤 ${t('role.user')}`}
                  </span>
                  {accountRole && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {accountRole === 'owner' && `🏠 ${t('role.owner')}`}
                      {accountRole === 'admin' && `⚙️ ${t('role.admin')}`}
                      {accountRole === 'member' && `👥 ${t('role.member')}`}
                      {accountRole === 'viewer' && `👁️ ${t('role.viewer')}`}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Right side - Language switcher, Account selector and logout */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <LanguageSwitcher
                variant="compact"
                size="sm"
                className="w-32"
              />

              {/* Account Selector */}
              {showAccountSelector && (
                <CompactAccountSelector
                  onAccountChange={handleAccountChange}
                  className="w-64"
                />
              )}

              {/* Logout Button */}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
                title={t('auth.logoutTitle')}
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation (REQ-023 enhanced) */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RoleBasedNavigation
            onNavigate={handleNavigation}
            showSystemAdminItems={true}
            compactMode={false}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Property Context Provider Component
interface PropertyContextProviderProps {
  children: ReactNode;
}

export function PropertyContextProvider({ children }: PropertyContextProviderProps) {
  const { user, selectedProperty, setSelectedProperty } = useAuth();
  const { currentAccount } = useAccountContext();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  // Load properties when account changes
  useEffect(() => {
    const loadProperties = async () => {
      if (!user || !currentAccount) {
        setProperties([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/admin/properties', {
          headers: {
            'Content-Type': 'application/json',
            'x-current-account': currentAccount.id
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data.success ? data.data || [] : []);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [user, currentAccount]);

  const value = {
    properties,
    loading,
    selectedProperty,
    setSelectedProperty,
    currentAccount
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

// Property Context (can be used by child components)
import { createContext, useContext } from 'react';

interface PropertyContextValue {
  properties: Property[];
  loading: boolean;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  currentAccount: Account | null;
}

export const PropertyContext = createContext<PropertyContextValue | null>(null);

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within a PropertyContextProvider');
  }
  return context;
}
