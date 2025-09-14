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

  useEffect(() => {
    // Validate and parse QR data
    if (!searchParams.data) {
      notFound();
      return;
    }

    try {
      const qrData = JSON.parse(searchParams.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to parse QR data:', error);
      notFound();
    }
  }, [searchParams.data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  try {
    const qrData = JSON.parse(searchParams.data!);
    return <PrintableQRGrid qrData={qrData} />;
  } catch (error) {
    console.error('Failed to parse QR data:', error);
    return notFound();
  }
}
