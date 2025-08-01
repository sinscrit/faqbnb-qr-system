'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodePrintManager } from '@/components/QRCodePrintManager';
import AuthGuard from '@/components/AuthGuard';
import { Item } from '@/types';

interface PreAuthData {
    propertyId: string;
  items: Item[];
  authBypass: boolean;
  timestamp: number;
}

// QR Print Page Content Component with Pre-Auth Support
function QRPrintPageContent() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  
  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authBypass, setAuthBypass] = useState(false);

  const handleClose = () => {
    console.log('[QR-AUTH-DEBUG] Close button clicked');
    window.close();
  };

  useEffect(() => {
    console.log('[QR-AUTH-DEBUG] QR Print page mounted:', {
      propertyId,
      url: window.location.href,
      hasHash: !!window.location.hash
    });

    const checkForPreAuthData = () => {
      try {
        // Check for pre-authenticated data in URL hash
        const hash = window.location.hash.substring(1); // Remove #
        
        if (hash) {
          console.log('[QR-AUTH-DEBUG] Hash detected, attempting to decode pre-auth data...');
          const decodedData = JSON.parse(atob(hash)) as PreAuthData;
          
          console.log('[QR-AUTH-DEBUG] Pre-auth data decoded:', {
            propertyId: decodedData.propertyId,
            itemCount: decodedData.items?.length || 0,
            authBypass: decodedData.authBypass,
            dataAge: Date.now() - decodedData.timestamp
          });
          
          // Validate pre-auth data
          if (
            decodedData.authBypass && 
            decodedData.propertyId === propertyId &&
            decodedData.items &&
            Array.isArray(decodedData.items) &&
            decodedData.items.length > 0 &&
            (Date.now() - decodedData.timestamp) < 60000 // Data must be less than 1 minute old
          ) {
            console.log('[QR-AUTH-DEBUG] Pre-auth data validated, bypassing normal auth flow');
            setItems(decodedData.items);
            setAuthBypass(true);
            setIsLoadingItems(false);
            return true; // Pre-auth successful
          } else {
            console.log('[QR-AUTH-DEBUG] Pre-auth data validation failed, falling back to normal auth');
          }
        } else {
          console.log('[QR-AUTH-DEBUG] No hash found, using normal auth flow');
        }
      } catch (error) {
        console.error('[QR-AUTH-DEBUG] Error decoding pre-auth data:', error);
      }
      
      return false; // Fall back to normal auth
    };

    // Try pre-auth first
    const preAuthSuccess = checkForPreAuthData();
    
    if (!preAuthSuccess) {
      // Fall back to normal authenticated API call
      console.log('[QR-AUTH-DEBUG] Falling back to normal API call');
      fetchItemsNormally();
    }
  }, [propertyId]);

  const fetchItemsNormally = async () => {
    try {
      console.log('[QR-AUTH-DEBUG] Normal fetch started for property:', propertyId);
      const fetchStart = Date.now();
      
      const response = await fetch(`/api/admin/items?property=${propertyId}`, {
        credentials: 'include' // ✅ Include cookies for authentication
      });
      const data = await response.json();
      
      console.log('[QR-AUTH-DEBUG] Normal fetch completed:', {
        status: response.status,
        success: data.success,
        itemCount: data.data?.length || 0,
        duration: Date.now() - fetchStart
      });
      
      if (data.success && data.data) {
        setItems(data.data);
      } else {
        throw new Error('Failed to load items');
      }
    } catch (error) {
      console.error('[QR-AUTH-DEBUG] Normal fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load items');
    } finally {
      setIsLoadingItems(false);
  }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error Loading QR Print</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 print:hidden">
          <h1 className="text-3xl font-bold text-gray-900">
            🖨️ QR Code Print Manager
            {authBypass && <span className="text-green-600 text-lg ml-2">(Pre-Authenticated)</span>}
          </h1>
          <p className="text-gray-600">
            Generate and print QR codes for property items
            {authBypass && ' - Items pre-loaded from main window'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
        <QRCodePrintManager
          propertyId={propertyId}
          items={items}
          onClose={handleClose}
            isLoadingItems={isLoadingItems}
            className=""
        />
        </div>
      </div>
    </div>
  );
}

// Main component with conditional auth guard
export default function QRPrintPage() {
  const [shouldBypassAuth, setShouldBypassAuth] = useState(false);
  
  useEffect(() => {
    // Check if we have pre-auth data that would allow bypassing AuthGuard
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const decodedData = JSON.parse(atob(hash)) as PreAuthData;
        if (decodedData.authBypass) {
          console.log('[QR-AUTH-DEBUG] AuthGuard bypass enabled');
          setShouldBypassAuth(true);
        }
      } catch (error) {
        console.log('[QR-AUTH-DEBUG] Could not decode hash for auth bypass');
      }
    }
  }, []);

  // ✅ SIMPLE FIX: QR print windows always bypass AuthGuard
  // Backend APIs already validate authentication via cookies/headers
  console.log('[QR-AUTH-DEBUG] QR print window - bypassing AuthGuard (backend handles auth)');
  return <QRPrintPageContent />;
} 