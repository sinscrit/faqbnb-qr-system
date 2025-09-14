'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import PrintableQRGrid from '@/components/PrintableQRGrid';

export default function PrintQRCodesPage({
  params,
  searchParams,
}: {
  params: { propertyId: string };
  searchParams: { data?: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [qrData, setQRData] = useState<any[]>([]);

  useEffect(() => {
    // Validate and parse QR data
    if (!searchParams.data) {
      notFound();
      return;
    }

    try {
      const parsedData = JSON.parse(searchParams.data);
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
  }, [searchParams.data]);

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
