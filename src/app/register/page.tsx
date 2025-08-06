'use client';

import { Suspense } from 'react';
import RegistrationPageContent from './RegistrationPageContent';

function RegistrationPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading registration page...</p>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<RegistrationPageFallback />}>
      <RegistrationPageContent />
    </Suspense>
  );
}