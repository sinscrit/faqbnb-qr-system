'use client';

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading login page...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  console.log('🔄 LOGIN_PAGE_COMPONENT: Login page component is rendering!');
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
} 