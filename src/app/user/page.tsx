'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, RefreshCw, Home } from 'lucide-react';

export default function UserPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = useTranslations('common.loading');

  // Redirect to unified dashboard after authentication check
  useEffect(() => {
    if (!loading && user) {
      // Small delay to show the redirect message, then redirect
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('generic.loading')}</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // IMMEDIATE redirect without delay - the layout is causing issues
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Immediate redirect for authenticated users
        console.log('🔄 REDIRECTING: User authenticated, redirecting to /dashboard');
        window.location.href = '/dashboard';
      } else {
        // For non-authenticated users, redirect to login
        console.log('🔄 REDIRECTING: User not authenticated, redirecting to /login');
        window.location.href = '/login';
      }
    }
  }, [user, loading]);

  // Show a minimal redirect message
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          padding: '32px' 
        }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              color: '#2563eb', 
              margin: '0 auto 16px',
              fontSize: '48px'
            }}>🏠</div>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>

          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>Redirecting to Unified Dashboard</h1>

          <p style={{ 
            color: '#6b7280', 
            marginBottom: '24px', 
            lineHeight: '1.5' 
          }}>
            Taking you to the new unified dashboard experience...
          </p>

          <div style={{ 
            backgroundColor: '#dbeafe', 
            border: '1px solid #93c5fd', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              color: '#1e40af' 
            }}>
              <span style={{ fontSize: '16px' }}>↗️</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>New Location: /dashboard</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            <p>Redirecting automatically...</p>
            <p style={{ marginTop: '4px' }}>
              If redirect doesn't work, {' '}
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                click here
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
