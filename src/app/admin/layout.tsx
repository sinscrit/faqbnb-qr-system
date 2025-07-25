'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import LogoutButton from '@/components/LogoutButton';
import { Home, Settings, Users, BarChart } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminHeader() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const getNavLinkClasses = (path: string, isMobile = false) => {
    const baseClasses = 'transition-colors flex items-center';
    const mobileClasses = isMobile ? 'text-sm' : '';
    const activeClasses = isActive(path) 
      ? 'text-blue-600 font-medium' 
      : 'text-gray-600 hover:text-gray-900';
    
    return `${baseClasses} ${mobileClasses} ${activeClasses}`.trim();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">FAQBNB Admin</h1>
                <p className="text-xs text-gray-500">Content Management System</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin"
              className={getNavLinkClasses('/admin')}
            >
              Items
            </Link>
            <Link
              href="/admin/analytics"
              className={getNavLinkClasses('/admin/analytics')}
            >
              <BarChart className="w-4 h-4 mr-1" />
              Analytics
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-1" />
              View Site
            </Link>
          </nav>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Admin'}
              </p>
            </div>

            {/* Logout Button */}
            <LogoutButton variant="text" size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-center space-x-6">
            <Link
              href="/admin"
              className={getNavLinkClasses('/admin', true)}
            >
              Items
            </Link>
            <Link
              href="/admin/analytics"
              className={getNavLinkClasses('/admin/analytics', true)}
            >
              <BarChart className="w-3 h-3 mr-1" />
              Analytics
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm flex items-center"
            >
              <Home className="w-3 h-3 mr-1" />
              View Site
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <BarChart className="w-4 h-4 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            Items Management
          </Link>
          <Link
            href="/admin/items/new"
            className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Users className="w-4 h-4 mr-3" />
            Add New Item
          </Link>
        </nav>
      </div>
    </aside>
  );
}

function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2024 FAQBNB Admin Panel. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-xs text-gray-400">
              Built with Next.js & Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Admin Panel</h2>
        <p className="text-gray-600">Verifying your admin credentials...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard fallback={<AdminLoadingFallback />}>
      <div className="min-h-screen flex flex-col">
        {/* Main Layout */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <AdminHeader />
            
            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <AdminFooter />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 