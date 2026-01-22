'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Home, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function RegistrationSuccess() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);

  // Translation hooks for internationalization
  const t = useTranslations('auth.register.success');
  const tCommon = useTranslations('common');

  // Pre-translate error message for use in useEffect
  const autoLoginFailedMessage = t('error.autoLoginFailed');

  // REQ-021 Task 3.3: OAuth-enhanced auto-redirect logic
  useEffect(() => {
    const DEBUG_PREFIX = "🎉 SUCCESS_PAGE_DEBUG:";
    
    console.log(`${DEBUG_PREFIX} SUCCESS_PAGE_MOUNTED`, {
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      hasSession: !!session,
      authLoading: authLoading,
      userId: user?.id
    });

    // Check if user is authenticated (OAuth scenario)
    if (!authLoading && user && session) {
      console.log(`${DEBUG_PREFIX} OAUTH_USER_DETECTED`, {
        timestamp: new Date().toISOString(),
        message: 'User is authenticated, proceeding with automatic login to dashboard',
        userId: user.id,
        email: user.email
      });

      setIsAutoLoggingIn(true);

      // Auto-redirect to dashboard for authenticated users (OAuth scenario)
      const timer = setTimeout(() => {
        console.log(`${DEBUG_PREFIX} AUTO_LOGIN_REDIRECT`, {
          timestamp: new Date().toISOString(),
          redirectTarget: '/dashboard2'
        });

        try {
          router.push('/dashboard2');
        } catch (error) {
          console.error(`${DEBUG_PREFIX} AUTO_LOGIN_ERROR:`, error);
          setAutoLoginError(autoLoginFailedMessage);
          setIsAutoLoggingIn(false);
        }
      }, 2000); // 2 seconds for OAuth users

      return () => clearTimeout(timer);
    } 
    // Fallback: Traditional auto-redirect to login for non-authenticated users
    else if (!authLoading && !user) {
      console.log(`${DEBUG_PREFIX} NON_OAUTH_USER`, {
        timestamp: new Date().toISOString(),
        message: 'No authenticated user, using traditional login redirect'
      });
      
      const timer = setTimeout(() => {
        router.push('/login');
      }, 5000); // 5 seconds for non-OAuth users

      return () => clearTimeout(timer);
    }
  }, [router, user, session, authLoading, autoLoginFailedMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
                <p className="text-sm text-gray-600">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h2>
          {isAutoLoggingIn ? (
            <p className="text-blue-600 mb-6 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('autoLoginInProgress')}</span>
            </p>
          ) : autoLoginError ? (
            <p className="text-red-600 mb-6">
              {autoLoginError}
            </p>
          ) : user && session ? (
            <p className="text-green-600 mb-6">
              {t('oauthSuccess')}
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              {t('accountCreated')}
            </p>
          )}

          {/* What was created */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{t('setupComplete')}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ {t('setup.userAccount')}</li>
              <li>✅ {t('setup.defaultAccount')}</li>
              <li>✅ {t('setup.adminPrivileges')}</li>
              <li>✅ {t('setup.accessCodeValidated')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {user && session ? (
              <>
                <Link
                  href="/dashboard2"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('actions.goToDashboard')}</span>
                </Link>

                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>{tCommon('navigation.backToHome')}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('actions.continueToLogin')}</span>
                </Link>

                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>{tCommon('navigation.backToHome')}</span>
                </Link>
              </>
            )}
          </div>

          {/* Auto-redirect notice */}
          {isAutoLoggingIn ? (
            <p className="text-xs text-blue-500 mt-4">
              {t('redirecting.autoLogin')}
            </p>
          ) : autoLoginError ? (
            <p className="text-xs text-red-500 mt-4">
              {t('redirecting.autoLoginFailed')}
            </p>
          ) : user && session ? (
            <p className="text-xs text-green-500 mt-4">
              {t('redirecting.toDashboard')}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-4">
              {t('redirecting.toLogin')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}