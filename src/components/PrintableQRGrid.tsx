'use client';

import { useEffect } from 'react';
import QRCode from 'react-qr-code';

interface QRData {
  id: string;
  label: string;
}

interface PrintableQRGridProps {
  qrData: QRData[];
}

export default function PrintableQRGrid({ qrData }: PrintableQRGridProps) {
  useEffect(() => {
    // Auto-trigger print after a longer delay to ensure QR codes are rendered
    const timer = setTimeout(() => {
      window.print();
      // Close window after print dialog closes
      window.close();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-grid">
      {qrData.map((item) => (
        <div key={item.id} className="print-item">
          <QRCode 
            value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/item/${item.id}`} 
            size={151} // 40mm at 96 DPI
            level="H" // High error correction
            className="print-qr"
            style={{ display: 'block', maxWidth: '100%' }}
          />
          <div className="print-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
