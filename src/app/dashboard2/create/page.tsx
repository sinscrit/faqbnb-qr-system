'use client';

/**
 * Create Item Page
 *
 * Integrates the ItemCreationWorkflow component with real backend callbacks
 * for saving items, generating QR codes, and PDF export.
 *
 * @route /dashboard2/create
 * @created 2026-01-06
 */

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import {
  ItemCreationWorkflow,
  CompletedSession,
  PartialSession,
  SessionItem,
  PrintScope,
} from '@/components/ItemCreationWorkflow';
import { usePropertyContext } from '@/hooks/usePropertyContext';

export default function CreateItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId, selectedProperty } = usePropertyContext();
  const [error, setError] = useState<string | null>(null);

  // Generate UUID for new items
  const generateUUID = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  // Save a single item to the backend
  const handleSaveItem = useCallback(
    async (item: SessionItem): Promise<{ id: string; qrCodeUrl: string }> => {
      console.log('Saving item:', item);

      // Generate a public ID for this item
      const publicId = generateUUID();

      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      try {
        let propertyId: string | undefined;

        // REQ-142: Prefer currently selected property from context
        if (selectedPropertyId) {
          propertyId = selectedPropertyId;
          console.log('Using selected property from context:', propertyId);
        } else {
          // Fall back to first available property
          const propertiesResponse = await adminApi.listProperties(headers);
          if (propertiesResponse.success && propertiesResponse.data && propertiesResponse.data.length > 0) {
            propertyId = propertiesResponse.data[0].id;
            console.log('Using first available property:', propertyId);
          }
        }

        if (!propertyId) {
          throw new Error('No property available. Please create a property first.');
        }

        // Create the item
        const itemData = {
          publicId,
          name: item.name,
          description: item.room ? `${item.room} - ${item.itemType || 'item'}` : undefined,
          propertyId,
          // Content from the workflow will be stored as links
          links: item.content?.map((c) => ({
            type: c.type,
            title: c.type === 'url' ? 'Link' : c.type,
            url: c.type === 'url' && c.data && typeof c.data === 'object' && 'url' in c.data ? (c.data as { url: string }).url : undefined,
            content: c.type === 'text' && c.data && typeof c.data === 'object' && 'text' in c.data ? (c.data as { text: string }).text : undefined,
          })) || [],
        };

        const response = await adminApi.createItem(itemData);

        if (response.success && response.data) {
          // Generate QR code URL - this would be the item's public page
          const qrCodeUrl = `${window.location.origin}/items/${publicId}`;
          return {
            id: publicId,
            qrCodeUrl,
          };
        } else {
          throw new Error(response.error || 'Failed to create item');
        }
      } catch (err) {
        console.error('Error saving item:', err);
        throw err;
      }
    },
    [currentAccount, generateUUID]
  );

  // Fetch existing items for the user
  const handleFetchExistingItems = useCallback(async (): Promise<SessionItem[]> => {
    console.log('Fetching existing items...');

    // Prepare headers with account context
    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      const response = await adminApi.listItems(undefined, undefined, 1, 100, headers);

      if (response.success && response.data) {
        // Convert API items to SessionItem format
        return response.data.map((item) => ({
          id: item.publicId,
          name: item.name,
          room: undefined, // Room info not stored in current API
          itemType: undefined,
          content: [],
          createdAt: item.createdAt,
        }));
      }

      return [];
    } catch (err) {
      console.error('Error fetching existing items:', err);
      return [];
    }
  }, [currentAccount]);

  // Generate PDF for items
  const handleGeneratePDF = useCallback(
    async (items: SessionItem[], scope: PrintScope): Promise<Blob> => {
      console.log('Generating PDF for', items.length, 'items with scope:', scope);

      // For now, create a simple text-based PDF placeholder
      // In production, you'd use a PDF generation library like jsPDF or react-pdf
      const content = items
        .map(
          (item) =>
            `Item: ${item.name}\nRoom: ${item.room || 'N/A'}\nType: ${item.itemType || 'N/A'}\n\n`
        )
        .join('---\n\n');

      const blob = new Blob([content], { type: 'text/plain' });
      return blob;
    },
    []
  );

  // Direct print
  const handlePrintDirect = useCallback(
    async (items: SessionItem[], scope: PrintScope): Promise<void> => {
      console.log('Printing', items.length, 'items directly with scope:', scope);

      // Open print dialog
      window.print();
    },
    []
  );

  // Session completed - all items saved
  const handleSessionComplete = useCallback(
    (session: CompletedSession) => {
      console.log('Session completed:', session);

      // Redirect to items list after successful completion
      router.push('/dashboard2/items');
    },
    [router]
  );

  // User exited workflow early
  const handleSessionExit = useCallback(
    (session: PartialSession) => {
      console.log('Session exited:', session);

      // If they have items, ask if they want to save
      if (session.items && session.items.length > 0) {
        // For now, just redirect back
        router.push('/dashboard2');
      } else {
        router.push('/dashboard2');
      }
    },
    [router]
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to create items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <ItemCreationWorkflow
        onSessionComplete={handleSessionComplete}
        onSessionExit={handleSessionExit}
        onGeneratePDF={handleGeneratePDF}
        onPrintDirect={handlePrintDirect}
        onFetchExistingItems={handleFetchExistingItems}
        onSaveItem={handleSaveItem}
        config={{
          enableSessionPersistence: true,
          enableUrlPreview: true,
          maxItemsPerSession: 50,
        }}
      />
    </div>
  );
}
