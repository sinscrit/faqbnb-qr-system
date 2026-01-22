'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Home, BarChart3, Crown, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { User, AccountRole } from '../types';
// REQ-023: Unified Route Architecture - Navigation Integration
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';

export interface NavigationItem {
  name: string;
  /** Shorter label for mobile viewports. Falls back to name if not specified. */
  mobileName?: string;
  href: string;
  icon: React.ReactNode;
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

  // REQ-E02-053: Translation hooks for i18n
  const t = useTranslations('dashboard.nav');
  const tLoading = useTranslations('dashboard.loading');

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
        name: compactMode ? t('home') : t('dashboard'),
        mobileName: t('dashboardMobile'),
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        description: t('dashboardDescription'),
        dashboardSection: DashboardSection.dashboard,
        requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
      });
    }

    // Items management - check permissions
    if (dashboardPermissions.canAccessItems) {
      items.push({
        name: t('items'),
        mobileName: t('items'),
        href: '/dashboard/items',
        icon: <Package className="h-5 w-5" />,
        description: t('itemsDescription'),
        dashboardSection: DashboardSection.items,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });

      // Instructions - uses same permissions as items (REQ-195)
      items.push({
        name: t('guides'),
        mobileName: t('guidesMobile'),
        href: '/dashboard/instructions',
        icon: <FileText className="h-5 w-5" />,
        description: t('guidesDescription'),
        dashboardSection: DashboardSection.instructions,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });
    }

    // Properties management - check permissions
    if (dashboardPermissions.canAccessProperties) {
      items.push({
        name: t('properties'),
        mobileName: t('propertiesMobile'),
        href: '/dashboard/properties',
        icon: <Home className="h-5 w-5" />,
        description: t('propertiesDescription'),
        dashboardSection: DashboardSection.properties,
        requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
      });
    }

    // Analytics - only for admin users
    if (isAdmin && dashboardPermissions.canAccessAnalytics) {
      items.push({
        name: t('analytics'),
        mobileName: t('analytics'),
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
        description: t('analyticsDescription'),
        dashboardSection: DashboardSection.analytics,
        requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
      });
    }

    // System admin section - only for system admins and if enabled
    if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
      items.push({
        name: compactMode ? t('admin') : t('systemAdmin'),
        mobileName: t('systemAdminMobile'),
        href: '/admin/system',
        icon: <Crown className="h-5 w-5" />,
        description: t('systemAdminDescription'),
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

    let currentSection: typeof DashboardSection[keyof typeof DashboardSection] = DashboardSection.dashboard;

    if (pathname.startsWith('/dashboard/items')) {
      currentSection = DashboardSection.items;
    } else if (pathname.startsWith('/dashboard/instructions')) {
      currentSection = DashboardSection.instructions; // REQ-195
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
        <span className="ml-2 text-sm text-gray-600">{tLoading('navigation')}</span>
      </div>
    );
  }

  // Desktop navigation component
  const DesktopNavigation = () => (
    <nav className="hidden md:flex space-x-8" aria-label={t('ariaLabel')}>
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
                {t('adminBadge')}
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
        <span className="sr-only">{t('openMenu')}</span>
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
                        <span>{item.mobileName || item.name}</span>
                        {item.systemAdminOnly && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            {t('adminBadge')}
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

// Navigation translation keys interface for utility function
export interface NavigationTranslations {
  dashboard: string;
  home: string;
  dashboardMobile: string;
  dashboardDescription: string;
  items: string;
  itemsDescription: string;
  guides: string;
  guidesMobile: string;
  guidesDescription: string;
  properties: string;
  propertiesMobile: string;
  propertiesDescription: string;
  analytics: string;
  analyticsDescription: string;
  systemAdmin: string;
  admin: string;
  systemAdminMobile: string;
  systemAdminDescription: string;
}

// Default English translations for backward compatibility
const defaultTranslations: NavigationTranslations = {
  dashboard: 'Dashboard',
  home: 'Home',
  dashboardMobile: 'D/B',
  dashboardDescription: 'Overview and key metrics',
  items: 'Items',
  itemsDescription: 'Manage QR code items',
  guides: 'Guides',
  guidesMobile: 'Guide',
  guidesDescription: 'View and manage guides',
  properties: 'Properties',
  propertiesMobile: 'Prop.',
  propertiesDescription: 'Property management',
  analytics: 'Analytics',
  analyticsDescription: 'View analytics and insights',
  systemAdmin: 'System Admin',
  admin: 'Admin',
  systemAdminMobile: 'Admin',
  systemAdminDescription: 'System administration',
};

// Utility function to get navigation items (can be used independently) - REQ-023 enhanced
// REQ-E02-053: Added translations parameter for i18n support
export function getNavigationItemsForUser(
  user: User | null,
  isAdmin: boolean,
  dashboardPermissions: any,
  accountRole: AccountRole | null,
  showSystemAdminItems: boolean = true,
  compactMode: boolean = false,
  translations?: Partial<NavigationTranslations>
): NavigationItem[] {
  if (!user || !dashboardPermissions) return [];

  // Merge provided translations with defaults for backward compatibility
  const t = { ...defaultTranslations, ...translations };

  const items: NavigationItem[] = [];

  // Dashboard - always available if user has dashboard access
  if (dashboardPermissions.canAccessDashboard) {
    items.push({
      name: compactMode ? t.home : t.dashboard,
      mobileName: t.dashboardMobile,
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: t.dashboardDescription,
      dashboardSection: DashboardSection.dashboard,
      requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
    });
  }

  // Items management - check permissions
  if (dashboardPermissions.canAccessItems) {
    items.push({
      name: t.items,
      mobileName: t.items,
      href: '/dashboard/items',
      icon: <Package className="h-5 w-5" />,
      description: t.itemsDescription,
      dashboardSection: DashboardSection.items,
      requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
    });

    // Instructions - uses same permissions as items
    items.push({
      name: t.guides,
      mobileName: t.guidesMobile,
      href: '/dashboard/instructions',
      icon: <FileText className="h-5 w-5" />,
      description: t.guidesDescription,
      dashboardSection: DashboardSection.items,
      requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
    });
  }

  // Properties management - check permissions
  if (dashboardPermissions.canAccessProperties) {
    items.push({
      name: t.properties,
      mobileName: t.propertiesMobile,
      href: '/dashboard/properties',
      icon: <Home className="h-5 w-5" />,
      description: t.propertiesDescription,
      dashboardSection: DashboardSection.properties,
      requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
    });
  }

  // Analytics - only for admin users
  if (isAdmin && dashboardPermissions.canAccessAnalytics) {
    items.push({
      name: t.analytics,
      mobileName: t.analytics,
      href: '/dashboard/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: t.analyticsDescription,
      dashboardSection: DashboardSection.analytics,
      requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
    });
  }

  // System admin section - only for system admins and if enabled
  if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
    items.push({
      name: compactMode ? t.admin : t.systemAdmin,
      mobileName: t.systemAdminMobile,
      href: '/admin/system',
      icon: <Crown className="h-5 w-5" />,
      description: t.systemAdminDescription,
      dashboardSection: DashboardSection.systemAdmin,
      systemAdminOnly: true,
      requiredPermissions: [PERMISSIONS.ACCESS_SYSTEM_ADMIN]
    });
  }

  return items;
}
