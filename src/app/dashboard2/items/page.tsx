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
import { ItemManager, ItemRecord } from '@/components/ItemManager';
import { Loader2, PlusCircle } from 'lucide-react';

export default function ItemsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

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
      const response = await adminApi.listItems(undefined, undefined, 1, 100, headers);

      if (response.success && response.data) {
        // Convert API response to ItemRecord format
        const itemRecords: ItemRecord[] = response.data.map((item) => ({
          id: item.id,
          publicId: item.publicId,
          name: item.name,
          description: item.description || '',
          propertyId: item.propertyId,
          qrCodeUrl: item.qrCodeUrl || `${window.location.origin}/items/${item.publicId}`,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          links: item.links || [],
          media: [],
          assets: [],
        }));

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
  }, [user, currentAccount]);

  // Fetch items on mount and when account changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Edit item handler
  const handleEditItem = useCallback(
    (item: ItemRecord) => {
      console.log('Edit item:', item);
      // Navigate to edit page (using existing dashboard route)
      router.push(`/dashboard/items/${item.publicId}/edit`);
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
          if (item) {
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
        await adminApi.updateItem(
          item.publicId,
          {
            name: item.name,
            description: item.description,
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
        await adminApi.createItem({
          publicId: newPublicId,
          name: `${item.name} (Copy)`,
          description: item.description,
          propertyId: item.propertyId,
          links: item.links || [],
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
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
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Item
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
          defaultViewMode: 'grid',
          enableSearch: true,
          enableFilters: true,
          enableBulkActions: true,
          enableQRPreview: true,
        }}
      />
    </div>
  );
}
