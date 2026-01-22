'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import PrintableQRGrid from '@/components/PrintableQRGrid';

export default function PrintQRCodesPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const [isLoading, setIsLoading] = useState(true);
  const [qrData, setQRData] = useState<any[]>([]);

  useEffect(() => {
    // Validate and parse QR data
    if (!resolvedSearchParams.data) {
      notFound();
      return;
    }

    try {
      const parsedData = JSON.parse(resolvedSearchParams.data);
      setQRData(parsedData);
      setIsLoading(false);

      // Focus window and trigger print
      window.focus();
      const timer = setTimeout(() => {
        window.print();
      }, 1000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Failed to parse QR data:', error);
      notFound();
    }
  }, [resolvedSearchParams.data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return <PrintableQRGrid qrData={qrData} />;
}
