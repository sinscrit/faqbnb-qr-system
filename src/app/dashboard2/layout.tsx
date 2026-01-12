'use client';

/**
 * Dashboard2 Layout
 *
 * New dashboard layout integrating ItemCreationWorkflow and ItemManager.
 * Features simplified navigation focused on item creation and management.
 * REQ-140: Improved navigation touch targets on mobile
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-08 - Mobile header optimization
 */

import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
import { PropertyProvider } from '@/contexts/PropertyContext';
import { PropertyDropdown } from '@/components/dashboard';

/**
 * Navigation item configuration for dashboard navigation menu.
 * REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
 */
interface NavItem {
  /** Display name for the navigation item */
  name: string;
  /** Optional abbreviated label for mobile viewports */
  mobileLabel?: string;
  /** Route path for navigation */
  href: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>;
}

// Navigation items for the dashboard
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
// Order: Dashboard → Items → Instructions → Properties
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];

function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
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
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => (window.location.href = '/')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => (window.location.href = '/login')}
              className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
            </div>

            {/* Center - Property Dropdown (REQ-142) */}
            <div className="flex-1 flex justify-center px-4">
              <PropertyDropdown />
            </div>

            {/* Right side - Logout */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 p-1.5 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard2' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-[#FF385C] text-[#FF385C]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}

export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Dashboard2LayoutContent>{children}</Dashboard2LayoutContent>
      </PropertyProvider>
    </AuthProvider>
  );
}
