'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('property');

  // Immediately redirect to dashboard items without showing any message
  useEffect(() => {
    const targetUrl = propertyId 
      ? `/dashboard/items?property=${propertyId}`
      : '/dashboard/items';
    router.replace(targetUrl);
  }, [router, propertyId]);

  // Show minimal loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}