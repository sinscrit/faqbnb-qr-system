'use client';

import { useCallback, useRef } from 'react';

interface QRCodeData {
  id: number;
  label: string;
}

export function usePrintWindow() {
  const windowRef = useRef<Window | null>(null);

  const openPrintWindow = useCallback((propertyId: string, data: QRCodeData[]) => {
    // Close any existing print window
    if (windowRef.current) {
      try {
        windowRef.current.close();
      } catch (error) {
        console.error('Failed to close existing print window:', error);
      }
    }

    // Prepare URL parameters
    const params = new URLSearchParams({
      data: JSON.stringify(data)
    });

    // Open new window
    const url = `/print/qr-codes/${propertyId}?${params}`;
    const newWindow = window.open(url, 'qr-print', 'width=800,height=600');

    if (newWindow) {
      windowRef.current = newWindow;

      // Handle window close
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkWindow);
          windowRef.current = null;
        }
      }, 500);
    } else {
      console.error('Failed to open print window. Check if popups are blocked.');
    }
  }, []);

  return { openPrintWindow };
}