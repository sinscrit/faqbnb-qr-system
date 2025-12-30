'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, AccountRole } from '../types';
// REQ-023: Unified Route Architecture - Navigation Integration
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}

interface RoleBasedNavigationProps {
  onNavigate?: (href: string, section?: DashboardSection) => void;
  className?: string;
  showSystemAdminItems?: boolean;
  compactMode?: boolean;
}

export function RoleBasedNavigation({
  onNavigate,
  className = '',
  showSystemAdminItems = true,
  compactMode = false
}: RoleBasedNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // REQ-023: Use enhanced AuthContext for navigation state management
  const {
    user,
    loading: authLoading,
    isAdmin,
    dashboardPermissions,
    permissionsLoading,
    currentDashboardSection,
    navigateToSection,
    canNavigateToSection,
    hasPermission,
    getAccountRole
  } = useAuth();

  // Get current account role
  const accountRole = getAccountRole();

  // Get navigation items based on user role and permissions (REQ-023)
  const getNavigationItems = (): NavigationItem[] => {
    if (!user || !dashboardPermissions || permissionsLoading) return [];

    const items: NavigationItem[] = [];

    // Dashboard - always available if user has dashboard access
    if (dashboardPermissions.canAccessDashboard) {
      items.push({
        name: compactMode ? 'Home' : 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        description: 'Overview and key metrics',
        dashboardSection: DashboardSection.dashboard,
        requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
      });
    }

    // Items management - check permissions
    if (dashboardPermissions.canAccessItems) {
      items.push({
        name: 'Items',
        href: '/dashboard/items',
        icon: '📦',
        description: 'Manage QR code items',
        dashboardSection: DashboardSection.items,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });
    }

    // Properties management - check permissions
    if (dashboardPermissions.canAccessProperties) {
      items.push({
        name: 'Properties',
        href: '/dashboard/properties',
        icon: '🏠',
        description: 'Property management',
        dashboardSection: DashboardSection.properties,
        requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
      });
    }

    // Analytics - only for admin users
    if (isAdmin && dashboardPermissions.canAccessAnalytics) {
      items.push({
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: '📈',
        description: 'View analytics and insights',
        dashboardSection: DashboardSection.analytics,
        requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
      });
    }

    // System admin section - only for system admins and if enabled
    if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
      items.push({
        name: compactMode ? 'Admin' : 'System Admin',
        href: '/admin/system',
        icon: '👑',
        description: 'System administration',
        dashboardSection: DashboardSection.systemAdmin,
        systemAdminOnly: true,
        requiredPermissions: [PERMISSIONS.ACCESS_SYSTEM_ADMIN]
      });
    }

    return items;
  };

  // Handle navigation click with dashboard section tracking (REQ-023)
  const handleNavigation = (href: string, item?: NavigationItem) => {
    setIsMobileMenuOpen(false); // Close mobile menu

    // Update dashboard section in auth context if provided
    if (item?.dashboardSection && navigateToSection) {
      navigateToSection(item.dashboardSection);
    }

    if (onNavigate) {
      onNavigate(href, item?.dashboardSection);
    } else {
      router.push(href);
    }
  };

  // Track current section based on pathname
  useEffect(() => {
    if (!pathname || !dashboardPermissions) return;

    let currentSection = DashboardSection.dashboard;

    if (pathname.startsWith('/dashboard/items')) {
      currentSection = DashboardSection.items;
    } else if (pathname.startsWith('/dashboard/properties')) {
      currentSection = DashboardSection.properties;
    } else if (pathname.startsWith('/dashboard/analytics')) {
      currentSection = DashboardSection.analytics;
    } else if (pathname.startsWith('/admin/system')) {
      currentSection = DashboardSection.systemAdmin;
    }

    // Only update if the section has changed to avoid unnecessary re-renders
    if (currentDashboardSection !== currentSection && navigateToSection) {
      navigateToSection(currentSection, false); // Don't preserve history for automatic updates
    }
  }, [pathname, dashboardPermissions, currentDashboardSection, navigateToSection]);

  const navigationItems = getNavigationItems();

  // Show loading state while permissions are loading
  if (authLoading || permissionsLoading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading navigation...</span>
      </div>
    );
  }

  // Desktop navigation component
  const DesktopNavigation = () => (
    <nav className="hidden md:flex space-x-8" aria-label="Dashboard Navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                        (item.dashboardSection === currentDashboardSection);

        return (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.href, item)}
            className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${item.systemAdminOnly ? 'text-purple-600' : ''}`}
            title={item.description}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
            {item.systemAdminOnly && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  // Mobile navigation component
  const MobileNavigation = () => (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded="false"
      >
        <span className="sr-only">Open main menu</span>
        {/* Hamburger icon */}
        <svg
          className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {/* Close icon */}
        <svg
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                              (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                              (item.dashboardSection === currentDashboardSection);

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item)}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  } ${item.systemAdminOnly ? 'border-purple-500 bg-purple-50' : ''}`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span>{item.name}</span>
                        {item.systemAdminOnly && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <DesktopNavigation />
      <MobileNavigation />
    </div>
  );
}

// Utility function to get navigation items (can be used independently) - REQ-023 enhanced
export function getNavigationItemsForUser(
  user: User | null,
  isAdmin: boolean,
  dashboardPermissions: any,
  accountRole: AccountRole | null,
  showSystemAdminItems: boolean = true,
  compactMode: boolean = false
): NavigationItem[] {
  if (!user || !dashboardPermissions) return [];

  const items: NavigationItem[] = [];

  // Dashboard - always available if user has dashboard access
  if (dashboardPermissions.canAccessDashboard) {
    items.push({
      name: compactMode ? 'Home' : 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      description: 'Overview and key metrics',
      dashboardSection: DashboardSection.dashboard,
      requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
    });
  }

  // Items management - check permissions
  if (dashboardPermissions.canAccessItems) {
    items.push({
      name: 'Items',
      href: '/dashboard/items',
      icon: '📦',
      description: 'Manage QR code items',
      dashboardSection: DashboardSection.items,
      requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
    });
  }

  // Properties management - check permissions
  if (dashboardPermissions.canAccessProperties) {
    items.push({
      name: 'Properties',
      href: '/dashboard/properties',
      icon: '🏠',
      description: 'Property management',
      dashboardSection: DashboardSection.properties,
      requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
    });
  }

  // Analytics - only for admin users
  if (isAdmin && dashboardPermissions.canAccessAnalytics) {
    items.push({
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: '📈',
      description: 'View analytics and insights',
      dashboardSection: DashboardSection.analytics,
      requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
    });
  }

  // System admin section - only for system admins and if enabled
  if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
    items.push({
      name: compactMode ? 'Admin' : 'System Admin',
      href: '/admin/system',
      icon: '👑',
      description: 'System administration',
      dashboardSection: DashboardSection.systemAdmin,
      systemAdminOnly: true,
      requiredPermissions: [PERMISSIONS.ACCESS_SYSTEM_ADMIN]
    });
  }

  return items;
}
