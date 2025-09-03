'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, AccountRole } from '../types';

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
  requiredPermission?: string;
}

interface RoleBasedNavigationProps {
  user: User | null;
  isAdmin: boolean;
  accountRole: AccountRole | null;
  currentPath: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function RoleBasedNavigation({
  user,
  isAdmin,
  accountRole,
  currentPath,
  onNavigate,
  className = ''
}: RoleBasedNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get navigation items based on user role and permissions
  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return [];

    const baseItems: NavigationItem[] = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        description: 'Overview and key metrics'
      },
      {
        name: 'Items',
        href: '/dashboard/items',
        icon: '📦',
        description: 'Manage QR code items'
      },
      {
        name: 'Properties',
        href: '/dashboard/properties',
        icon: '🏠',
        description: 'Property management'
      }
    ];

    // Analytics access based on account permissions
    const analyticsItem: NavigationItem = {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: '📈',
      description: 'View analytics and insights',
      requiredPermission: 'VIEW_ANALYTICS'
    };

    // Admin system access only for system admins
    const adminSystemItem: NavigationItem = {
      name: 'Admin System',
      href: '/admin/system',
      icon: '👑',
      description: 'System administration',
      requiredPermission: 'ACCESS_SYSTEM_ADMIN'
    };

    // Build navigation items based on role hierarchy
    let items = [...baseItems];

    // Add analytics if user has appropriate permissions
    if (canAccessAnalytics(user, isAdmin, accountRole)) {
      items.push(analyticsItem);
    }

    // Add admin system only for system admins
    if (isAdmin) {
      items.push(adminSystemItem);
    }

    return items;
  };

  // Check if user can access analytics based on role
  const canAccessAnalytics = (user: User | null, isAdmin: boolean, accountRole: AccountRole | null): boolean => {
    if (!user) return false;

    // System admins can always access analytics
    if (isAdmin) return true;

    // Account owners can always access analytics for their accounts
    if (accountRole === AccountRole.OWNER) return true;

    // Account admins and members can access analytics
    if (accountRole === AccountRole.ADMIN || accountRole === AccountRole.MEMBER) return true;

    // Viewers cannot access analytics
    return false;
  };

  // Handle navigation click
  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false); // Close mobile menu

    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  };

  const navigationItems = getNavigationItems();

  // Desktop navigation component
  const DesktopNavigation = () => (
    <nav className="hidden md:flex space-x-8" aria-label="Dashboard Navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.href)}
            className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            title={item.description}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
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
                              (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <div>
                      <div>{item.name}</div>
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

// Utility function to get navigation items (can be used independently)
export function getNavigationItemsForUser(
  user: User | null,
  isAdmin: boolean,
  accountRole: AccountRole | null
): NavigationItem[] {
  if (!user) return [];

  const baseItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      description: 'Overview and key metrics'
    },
    {
      name: 'Items',
      href: '/dashboard/items',
      icon: '📦',
      description: 'Manage QR code items'
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: '🏠',
      description: 'Property management'
    }
  ];

  // Analytics access based on account permissions
  const analyticsItem: NavigationItem = {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: '📈',
    description: 'View analytics and insights'
  };

  // Admin system access only for system admins
  const adminSystemItem: NavigationItem = {
    name: 'Admin System',
    href: '/admin/system',
    icon: '👑',
    description: 'System administration'
  };

  // Build navigation items based on role hierarchy
  let items = [...baseItems];

  // Add analytics if user has appropriate permissions
  if (canAccessAnalyticsForUser(user, isAdmin, accountRole)) {
    items.push(analyticsItem);
  }

  // Add admin system only for system admins
  if (isAdmin) {
    items.push(adminSystemItem);
  }

  return items;
}

// Helper function for analytics access check
function canAccessAnalyticsForUser(user: User | null, isAdmin: boolean, accountRole: AccountRole | null): boolean {
  if (!user) return false;

  // System admins can always access analytics
  if (isAdmin) return true;

  // Account owners can always access analytics for their accounts
  if (accountRole === AccountRole.OWNER) return true;

  // Account admins and members can access analytics
  if (accountRole === AccountRole.ADMIN || accountRole === AccountRole.MEMBER) return true;

  // Viewers cannot access analytics
  return false;
}
