'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth, useAccountContext } from '@/contexts/AuthContext';
import { Account } from '@/types';
import { Property } from '@/lib/auth';

function SystemAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut, isAdmin } = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();

  // Navigation items for system admin area
  const getNavigationItems = () => {
    return [
      { name: 'Back to Dashboard', href: '/dashboard', icon: '⬅️' },
      { name: 'Back Office', href: '/admin/system/back-office', icon: '👑' },
      { name: 'User Management', href: '/admin/system/user-management', icon: '👥' },
      { name: 'System Analytics', href: '/admin/system/analytics', icon: '📊' },
    ];
  };

  const navigationItems = getNavigationItems();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 text-lg">Loading system admin panel...</p>
        </div>
      </div>
    );
  }

  // Check if user is system admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            This area is restricted to system administrators only. You need elevated admin privileges to access this section.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={async () => {
                try {
                  await signOut();
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Logout failed:', error);
                  window.location.href = '/login';
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout & Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 print:bg-white">
      {/* System Admin Header */}
      <div className="border-b border-red-200 bg-red-900 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Title and user info */}
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h1 className="text-xl font-bold text-white">FAQBNB System Admin</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-700 text-red-100">
                    👑 System Admin
                  </span>
                  <span className="text-sm text-red-200">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Right side - Logout */}
            <button
              onClick={() => signOut()}
              className="text-sm text-red-200 hover:text-white border border-red-700 px-3 py-1.5 rounded-md hover:bg-red-800 whitespace-nowrap transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-red-100 border-b border-red-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex py-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a
                  href="/dashboard"
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/dashboard');
                  }}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-red-900 text-sm font-medium">System Admin</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="System Admin Navigation">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-red-500 text-red-600'
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
      <main className="flex-1 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SystemAdminLayoutContent>
        {children}
      </SystemAdminLayoutContent>
    </AuthProvider>
  );
}
