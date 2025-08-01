'use client';

import { useState, useEffect } from 'react';
import { QRCodePrintManager } from '@/components/QRCodePrintManager';
import { Item } from '@/types';

export default function QRTestPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propertyId = 'd3d4df29-3a10-47b0-8813-5ef26544982b';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log('🎯 QR Test: Fetching items for property:', propertyId);
        
        // Fallback with hardcoded test data from the database query we did earlier
                  const baseUrl = window.location.origin;
          const testItems: Item[] = [
            {
              id: '9659f771-6f3b-40cc-a906-57bbb451788f',
              public_id: '9659f771-6f3b-40cc-a906-57bbb451788f',
              name: 'Samsung 65" QLED Smart TV',
              description: 'Living room smart TV with 4K resolution and streaming capabilities',
              qr_code_url: `${baseUrl}/item/9659f771-6f3b-40cc-a906-57bbb451788f`,
              qr_code_uploaded_at: null,
              property_id: propertyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
                      {
              id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5',
              public_id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5',
              name: 'Keurig K-Elite Coffee Maker',
              description: 'Single-serve coffee maker in the kitchen. Supports K-Cup pods',
              qr_code_url: `${baseUrl}/item/f2b82987-a2a4-4de2-94db-f8924dc096d5`,
              qr_code_uploaded_at: null,
              property_id: propertyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
                      {
              id: '0d92cbeb-a61f-4492-9346-6ab03363fdab',
              public_id: '0d92cbeb-a61f-4492-9346-6ab03363fdab',
              name: 'Nest Learning Thermostat',
              description: 'Smart thermostat that learns your schedule and preferences',
              qr_code_url: `${baseUrl}/item/0d92cbeb-a61f-4492-9346-6ab03363fdab`,
              qr_code_uploaded_at: null,
              property_id: propertyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb',
              public_id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb',
              name: 'Bosch 800 Series Dishwasher',
              description: 'Quiet dishwasher with multiple wash cycles',
              qr_code_url: `${baseUrl}/item/1c8e4723-5186-41f3-b4bd-11b614a77bdb`,
              qr_code_uploaded_at: null,
              property_id: propertyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '8d678bd0-e4f7-495f-b4cd-43756813e23a',
              public_id: '8d678bd0-e4f7-495f-b4cd-43756813e23a',
              name: 'Samsung WF45T6000AW Washing Machine',
              description: 'Front-loading washing machine with steam cleaning',
              qr_code_url: `${baseUrl}/item/8d678bd0-e4f7-495f-b4cd-43756813e23a`,
              qr_code_uploaded_at: null,
              property_id: propertyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
        ];
        console.log('✅ QR Test: Using test data with 5 items from property d3d4df29-3a10-47b0-8813-5ef26544982b');
        setItems(testItems);
        setLoading(false);
      } catch (error) {
        console.error('❌ QR Test: Error loading items:', error);
        setError('Failed to load items for testing');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleClose = () => {
    console.log('QR Test: Close clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QR Test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🧪 QR Code Test - REQ-012 Validation</h1>
          <p className="text-gray-600">Testing QR Code generation for Property: {propertyId} (Legacy Items)</p>
          <p className="text-sm text-gray-500 mt-1">
            Items loaded: {items.length} • No authentication required • Direct QR generation test
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <QRCodePrintManager
            propertyId={propertyId}
            items={items}
            onClose={handleClose}
            isLoadingItems={false}
            className=""
          />
        </div>
      </div>
    </div>
  );
} 