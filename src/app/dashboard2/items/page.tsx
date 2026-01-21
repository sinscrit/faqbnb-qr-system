'use client';

/**
 * Items Page
 *
 * Integrates the ItemManager component with real backend callbacks
 * for managing existing items.
 *
 * @route /dashboard2/items
 * @created 2026-01-06
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { ItemManager, ItemRecordExtended as ItemRecord } from '@/components/ItemManager';
import { Loader2, PlusCircle } from 'lucide-react';
import { usePropertyContext } from '@/hooks/usePropertyContext';

export default function ItemsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch items from the backend
  const fetchItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Prepare headers with account context
    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      // REQ-142: Include property filter from context
      const response = await adminApi.listItems(
        undefined, // search
        selectedPropertyId || undefined, // propertyId filter
        1,
        100,
        headers
      );

      if (response.success && response.data) {
        // Convert API response to ItemRecord format
        // Note: API uses 'name' but ItemRecord uses 'title'
        const itemRecords: ItemRecord[] = response.data.map((item) => ({
          id: item.id,
          title: item.name, // Map API 'name' to ItemRecord 'title'
          location: undefined, // API doesn't provide location
          tags: [], // API doesn't provide tags
          contentType: 'mixed' as const, // Default content type
          media: [], // Media items would need separate fetch
          instructions: item.description || undefined,
          createdAt: new Date(item.createdAt),
          // Extended fields for ItemManager
          publicId: item.publicId,
          description: item.description || '',
          propertyId: item.propertyId,
          qrCodeUrl: item.qrCodeUrl || `${window.location.origin}/items/${item.publicId}`,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
          links: item.links || [],
          name: item.name, // Keep name for backward compatibility
          articlesCount: item.articlesCount ?? 0,
        } as ItemRecord));

        setItems(itemRecords);
      } else {
        setError(new Error(response.error || 'Failed to fetch items'));
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, [user, currentAccount, selectedPropertyId]);

  // Fetch items on mount and when account changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Edit item handler
  const handleEditItem = useCallback(
    (item: ItemRecord) => {
      console.log('Edit item:', item);
      // REQ-142: Navigate to dashboard2 edit page
      router.push(`/dashboard2/items/${item.publicId}/edit`);
    },
    [router]
  );

  // Delete items handler
  const handleDeleteItems = useCallback(
    async (ids: string[]) => {
      console.log('Delete items:', ids);

      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      try {
        // Delete each item
        for (const id of ids) {
          // Find the item to get its publicId
          const item = items.find((i) => i.id === id || i.publicId === id);
          if (item?.publicId) {
            await adminApi.deleteItem(item.publicId, headers);
          }
        }

        // Refresh the list
        await fetchItems();
      } catch (err) {
        console.error('Error deleting items:', err);
        setError(err instanceof Error ? err : new Error('Failed to delete items'));
      }
    },
    [currentAccount, items, fetchItems]
  );

  // Update item handler
  const handleUpdateItem = useCallback(
    async (item: ItemRecord) => {
      console.log('Update item:', item);

      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      try {
        // Use title (which maps to API's name field) or fall back to name
        const itemName = item.title || (item as ItemRecord & { name?: string }).name || '';
        const extendedItem = item as ItemRecord & { publicId?: string; propertyId?: string; links?: Array<{ title: string; url: string; linkType: string }> };
        if (!extendedItem.publicId) {
          throw new Error('Missing publicId for item update');
        }

        await adminApi.updateItem(
          extendedItem.publicId,
          {
            id: item.id,
            publicId: extendedItem.publicId,
            name: itemName,
            description: item.instructions || (item as ItemRecord & { description?: string }).description || '',
            propertyId: extendedItem.propertyId || '',
            links: (extendedItem.links || []).map((link, index) => ({
              title: link.title,
              linkType: link.linkType as 'youtube' | 'pdf' | 'image' | 'text',
              url: link.url,
              displayOrder: index
            }))
          },
          headers
        );

        // Refresh the list
        await fetchItems();
      } catch (err) {
        console.error('Error updating item:', err);
        setError(err instanceof Error ? err : new Error('Failed to update item'));
      }
    },
    [currentAccount, fetchItems]
  );

  // Duplicate item handler
  const handleDuplicateItem = useCallback(
    async (item: ItemRecord) => {
      console.log('Duplicate item:', item);

      // Generate new UUID
      const newPublicId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      try {
        // Use title (which maps to API's name field) or fall back to name
        const itemName = item.title || (item as ItemRecord & { name?: string }).name || 'Untitled';
        const extendedItem = item as ItemRecord & { propertyId?: string; description?: string; links?: Array<{ title: string; url: string; linkType: string }> };
        await adminApi.createItem({
          publicId: newPublicId,
          name: `${itemName} (Copy)`,
          description: item.instructions || extendedItem.description || '',
          propertyId: extendedItem.propertyId || '',
          links: (extendedItem.links || []).map((link, index) => ({
            title: link.title,
            linkType: link.linkType as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            displayOrder: index
          })),
        });

        // Refresh the list
        await fetchItems();
      } catch (err) {
        console.error('Error duplicating item:', err);
        setError(err instanceof Error ? err : new Error('Failed to duplicate item'));
      }
    },
    [fetchItems]
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view items.</p>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} total
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard2/create')}
          className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New QR Code Item
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error.message}</p>
          <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ItemManager Component */}
      <ItemManager
        items={items}
        loading={loading}
        error={error}
        onEditItem={handleEditItem}
        onDeleteItems={handleDeleteItems}
        onUpdateItem={handleUpdateItem}
        onDuplicateItem={handleDuplicateItem}
        config={{
          defaultView: 'grid',
          enableSearch: true,
          enableFilters: true,
          enableBulkActions: true,
        }}
      />
    </div>
  );
}
