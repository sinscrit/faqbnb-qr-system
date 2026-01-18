'use client';

import { useCallback, useRef } from 'react';

interface QRCodeData {
  id: string;
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
    console.log('Opening print window with URL:', url);
    const newWindow = window.open(url, 'qr-print', 'width=800,height=600');

    if (newWindow) {
      windowRef.current = newWindow;

      // Focus the new window
      newWindow.focus();

      // Handle window close and focus
      const checkWindow = setInterval(() => {
        try {
          if (newWindow.closed) {
            console.log('Print window closed');
            clearInterval(checkWindow);
            windowRef.current = null;
          } else {
            // Keep window focused
            newWindow.focus();
          }
        } catch (error) {
          // Handle cross-origin errors
          console.error('Failed to check window state:', error);
          clearInterval(checkWindow);
          windowRef.current = null;
        }
      }, 500);

      // Add window event listeners
      window.addEventListener('focus', () => {
        if (windowRef.current && !windowRef.current.closed) {
          console.log('Main window focused, refocusing print window');
          windowRef.current.focus();
        }
      });
    } else {
      console.error('Failed to open print window. Check if popups are blocked.');
    }
  }, []);

  return { openPrintWindow };
}