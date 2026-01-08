'use client';

/**
 * Edit Item Page
 *
 * Page for editing existing items.
 * Fetches item data and renders edit form.
 *
 * REQ-142: Enhanced Item Management
 * @route /dashboard2/items/[publicId]/edit
 * @created 2026-01-08
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { ItemWithDetails } from '@/types';
import { MediaManagementSection } from '@/components/MediaManagement';
import type { EditableMediaLink } from '@/components/MediaManagement';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const publicId = params.publicId as string;

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Media links state
  const [mediaLinks, setMediaLinks] = useState<EditableMediaLink[]>([]);

  // Fetch item data
  const fetchItem = useCallback(async () => {
    if (!user || !publicId) return;

    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      const response = await adminApi.getItem(publicId, headers);

      if (response.success && response.data) {
        setItem(response.data as ItemWithDetails);
        setName(response.data.name || '');
        setDescription(response.data.description || '');
      } else {
        setError(response.error || 'Failed to fetch item');
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  }, [user, publicId, currentAccount]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Handle media links change from MediaManagementSection
  const handleMediaLinksChange = useCallback((links: EditableMediaLink[]) => {
    setMediaLinks(links);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    setSaving(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      // Get propertyId from item.propertyId or item.property.id
      const propertyId = item.propertyId || item.property?.id;
      if (!propertyId) {
        setError('Property ID is missing');
        setSaving(false);
        return;
      }

      const response = await adminApi.updateItem(publicId, {
        name,
        description,
        propertyId,
        links: mediaLinks.map((link, index) => ({
          id: link.id, // undefined for new links
          title: link.title,
          linkType: link.linkType,
          url: link.url,
          thumbnailUrl: link.thumbnailUrl,
          displayOrder: link.displayOrder,
        })),
      }, headers);

      if (response.success) {
        router.push('/dashboard2/items');
      } else {
        setError(response.error || 'Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to edit items.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard2/items')}
            className="text-[#FF385C] hover:underline"
          >
            Return to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard2/items')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              placeholder="Enter item name"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-none"
              placeholder="Enter item description (optional)"
            />
          </div>

          {/* Property Display (read-only) */}
          {item?.property && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {item.property.nickname}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Property cannot be changed after creation
              </p>
            </div>
          )}

          {/* Media Management Section */}
          <div className="pt-4 border-t border-gray-200">
            <MediaManagementSection
              initialLinks={item?.links || []}
              onLinksChange={handleMediaLinksChange}
              readOnly={saving}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard2/items')}
            disabled={saving}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
