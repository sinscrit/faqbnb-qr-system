'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GoogleOAuthButtonProps {
  accessCode?: string;
  email?: string;
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
  disabled?: boolean;
}

export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  
  // Rate limiting: max 3 attempts per 5 minutes
  const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    if (disabled || isLoading) return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    // Reset attempt count if rate limit window has passed
    if (now - lastAttempt >= RATE_LIMIT_WINDOW) {
      setAttemptCount(0);
    }

    try {
      setIsLoading(true);
      setLastAttempt(now);
      setAttemptCount(prev => prev + 1);
      onAuthStart?.();

      // Prepare OAuth options with state for access code validation
      const oauthOptions: any = {
        provider: 'google' as const,
        options: {
          scopes: 'openid email profile',
          redirectTo: `${window.location.origin}/auth/oauth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      };

      // Include access code and email in redirect URL for PKCE flow
      // Note: We cannot use custom state parameter with PKCE as Supabase manages state internally
      if (accessCode || email) {
        const params = new URLSearchParams();
        if (accessCode) params.set('accessCode', accessCode);
        if (email) params.set('email', encodeURIComponent(email));
        
        // Set redirect URL with parameters
        oauthOptions.options.redirectTo = `${window.location.origin}/auth/oauth/callback?${params.toString()}`;
      }

      console.log('🔗 OAUTH_BUTTON: Initiating Google OAuth', {
        timestamp: new Date().toISOString(),
        hasAccessCode: !!accessCode,
        hasEmail: !!email,
        redirectTo: oauthOptions.options.redirectTo
      });

      const { data, error } = await supabase.auth.signInWithOAuth(oauthOptions);

      if (error) {
        console.error('🔗 OAUTH_BUTTON: OAuth initiation failed', {
          timestamp: new Date().toISOString(),
          error: error.message,
          code: error.name
        });
        
        const errorMessage = error.message || 'Failed to start OAuth authentication';
        onAuthError?.(errorMessage);
        setIsLoading(false);
        return;
      }

      console.log('🔗 OAUTH_BUTTON: OAuth initiated successfully', {
        timestamp: new Date().toISOString(),
        provider: data?.provider,
        url: data?.url
      });

      // OAuth redirect will happen automatically, so we don't reset loading here
      // The loading state will be reset when the component unmounts or page changes

    } catch (error) {
      console.error('🔗 OAUTH_BUTTON: Unexpected OAuth error', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg 
        shadow-sm bg-white text-gray-700 font-medium transition-all duration-200
        hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
        ${isLoading ? 'opacity-75' : ''}
      `}
      aria-label="Continue with Google"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <svg
            className="w-5 h-5 mr-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}