// src/app/dashboard2/print/[propertyId]/page.tsx
// REQ-127: Print Flow Page - QR Code printing with QRCodePrintManager integration
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { QRCodePrintManager } from '@/components/QRCodePrintManager';
import { Item, Property } from '@/types';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Loading state component
 */
function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-[#717171] text-lg">{message}</p>
      </div>
    </div>
  );
}

/**
 * Error state component with retry functionality
 */
function ErrorState({
  message,
  onRetry,
  isRetrying = false
}: {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-[#222222] mb-2">
        Something went wrong
      </h2>
      <p className="text-[#717171] mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white rounded-lg font-medium hover:scale-[1.02] hover:brightness-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
          aria-label="Retry loading items"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Try Again
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Breadcrumb navigation component
 */
function Breadcrumb({
  property,
  showPropertySelector,
  onNavigateDashboard,
  onNavigateSelector
}: {
  property: Property | null;
  showPropertySelector: boolean;
  onNavigateDashboard: () => void;
  onNavigateSelector: () => void;
}) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      <button
        onClick={onNavigateDashboard}
        className="text-[#717171] hover:text-[#FF385C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 rounded"
      >
        Dashboard
      </button>
      <span className="text-[#717171]">/</span>
      {showPropertySelector && (
        <>
          <button
            onClick={onNavigateSelector}
            className="text-[#717171] hover:text-[#FF385C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 rounded"
          >
            Print QR Codes
          </button>
          <span className="text-[#717171]">/</span>
        </>
      )}
      <span className="text-[#222222] font-medium">
        {property?.nickname || 'Loading...'}
      </span>
    </nav>
  );
}

/**
 * Page header component
 */
function PageHeader({
  property,
  showPropertySelector,
  onBack
}: {
  property: Property | null;
  showPropertySelector: boolean;
  onBack: () => void;
}) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#222222] hover:text-[#FF385C] transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 rounded-lg p-1 -ml-1"
        aria-label={showPropertySelector ? 'Go back to property selector' : 'Go back to dashboard'}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">
          {showPropertySelector ? 'Back to Properties' : 'Back to Dashboard'}
        </span>
      </button>
      {property && (
        <h1 className="text-2xl font-bold text-[#222222]">
          Print QR Codes - {property.nickname}
        </h1>
      )}
    </div>
  );
}

/**
 * PrintFlowPage - QR Code printing workflow page
 *
 * This page displays the QRCodePrintManager for a specific property.
 * It handles:
 * - Property access validation
 * - Items fetching from API
 * - Integration with QRCodePrintManager component
 * - Error states and retry functionality
 *
 * Navigation:
 * - Single property users come directly from ActionButtons
 * - Multi-property users come from the property selector
 */
export default function PrintFlowPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { userProperties, loading: authLoading } = useAuth();

  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find current property from user properties
  const property = userProperties?.find((p) => p.id === propertyId) || null;
  const isValidProperty = userProperties?.some((p) => p.id === propertyId);
  const showPropertySelector = userProperties && userProperties.length > 1;

  /**
   * Fetch items for the property from API
   */
  const fetchItems = useCallback(async () => {
    if (!propertyId || !isValidProperty) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/properties/${propertyId}/items`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch items (${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch items');
      }

      // Transform API response to Item type
      const transformedItems: Item[] = (data.data || []).map((item: any) => ({
        id: item.id,
        publicId: item.public_id,
        name: item.name,
        description: item.description,
        qrCodeUrl: item.qr_code_url,
        qrCodeUploadedAt: null,
        propertyId: item.property_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setItems(transformedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching items');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [propertyId, isValidProperty]);

  // Redirect to property selector if property is invalid
  useEffect(() => {
    if (!authLoading && userProperties !== undefined && !isValidProperty) {
      console.log('Invalid property access, redirecting to selector');
      router.replace('/dashboard2/print');
    }
  }, [authLoading, userProperties, isValidProperty, router]);

  // Fetch items when property is valid
  useEffect(() => {
    if (!authLoading && isValidProperty) {
      fetchItems();
    }
  }, [authLoading, isValidProperty, fetchItems]);

  // Handle retry
  const handleRetry = () => {
    setIsRetrying(true);
    fetchItems();
  };

  // Navigation handlers
  const handleNavigateDashboard = () => {
    router.push('/dashboard2');
  };

  const handleNavigateSelector = () => {
    router.push('/dashboard2/print');
  };

  const handleBack = () => {
    if (showPropertySelector) {
      router.push('/dashboard2/print');
    } else {
      router.push('/dashboard2');
    }
  };

  const handleClose = () => {
    router.push('/dashboard2');
  };

  // Loading auth state
  if (authLoading) {
    return <LoadingState message="Verifying access..." />;
  }

  // Invalid property - show loading while redirect happens
  if (!isValidProperty) {
    return <LoadingState message="Redirecting..." />;
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div>
        <Breadcrumb
          property={property}
          showPropertySelector={showPropertySelector || false}
          onNavigateDashboard={handleNavigateDashboard}
          onNavigateSelector={handleNavigateSelector}
        />
        <ErrorState
          message={error}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

  // Main render with QRCodePrintManager
  return (
    <div className="space-y-4">
      <Breadcrumb
        property={property}
        showPropertySelector={showPropertySelector || false}
        onNavigateDashboard={handleNavigateDashboard}
        onNavigateSelector={handleNavigateSelector}
      />
      <PageHeader
        property={property}
        showPropertySelector={showPropertySelector || false}
        onBack={handleBack}
      />
      <QRCodePrintManager
        propertyId={propertyId}
        items={items}
        onClose={handleClose}
        isLoadingItems={isLoading}
        className="mt-4"
      />
    </div>
  );
}
