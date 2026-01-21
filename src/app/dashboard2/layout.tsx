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
 * @modified 2026-01-15 - Added logo to header
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
    name: 'Guides',
    mobileLabel: 'Guide',
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
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const t = useTranslations('common.loading');

  // Show loading spinner while auth is initializing or in LOADING state
  if (loading || authState === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t('pages.dashboard')}</p>
        </div>
      </div>
    );
  }

  // Only redirect if authState is definitively UNAUTHORIZED (not just !user)
  // and we haven't already started redirecting
  if (authState === 'UNAUTHORIZED' && !hasRedirected) {
    if (typeof window !== 'undefined') {
      setHasRedirected(true);
      window.location.href = '/login';
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t('auth.completingAuth')}</p>
        </div>
      </div>
    );
  }

  // If auth errored or user is null but not unauthorized, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t('generic.loading')}</p>
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
            {/* Left side - Logo and Title */}
            <Link href="/dashboard2" className="flex items-center space-x-2">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">FAQBNB</h1>
            </Link>

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
                  {/* REQ-206: Desktop shows full label, Mobile shows abbreviated */}
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">{item.mobileLabel || item.name}</span>
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
