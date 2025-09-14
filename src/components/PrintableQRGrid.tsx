'use client';

import { useEffect } from 'react';
import QRCode from 'react-qr-code';

interface QRData {
  id: number;
  label: string;
}

interface PrintableQRGridProps {
  qrData: QRData[];
}

export default function PrintableQRGrid({ qrData }: PrintableQRGridProps) {
  useEffect(() => {
    // Auto-trigger print after a short delay to ensure rendering
    const timer = setTimeout(() => {
      window.print();
      // Close window after print dialog closes
      window.close();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-grid">
      {qrData.map((item) => (
        <div key={item.id} className="print-item">
          <QRCode value={`item:${item.id}`} size={113} className="print-qr" />
          <div className="print-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
