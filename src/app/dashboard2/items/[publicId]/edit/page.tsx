'use client';

/**
 * Edit Item Page
 *
 * Page for editing existing items - Simplified version for metadata editing only.
 * Fetches item data and renders edit form with room/type selectors and tags.
 *
 * REQ-142: Enhanced Item Management
 * REQ-215: Simplified Item Edit Page
 * @route /dashboard2/items/[publicId]/edit
 * @created 2026-01-08
 * @updated 2026-01-13 (REQ-215)
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, ArrowLeft, Save, Globe } from 'lucide-react';
import Link from 'next/link';
import { RoomSelector, ItemTypeSelector, ItemInstructionsList } from '@/components/ItemEditForm';
import { TagsInlineEdit } from '@/components/ItemManager/components/shared/TagsInlineEdit';
import { extractRoomFromTags, setRoomInTags } from '@/lib/room-utils';
import { extractItemTypeFromTags, setItemTypeInTags } from '@/lib/item-type-utils';
import type { RoomTypeConst, ItemTypeConst } from '@/components/ItemCreationWorkflow/utils/constants';
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

type ItemForEdit = {
  id: string;
  publicId: string;
  name: string;
  description: string;
  tags: string[];
  propertyId?: string | null;
  property?: { id: string };
  articles?: any[];
};

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const publicId = params.publicId as string;
  const t = useTranslations('items.edit');
  const tLoading = useTranslations('common.loading');

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

  const [item, setItem] = useState<ItemForEdit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // REQ-E05-029: Translation panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

  // REQ-E05-029: Translation status hook
  const { summary: translationStatus, isLoading: statusLoading, refetch: refetchStatus } = useTranslationStatus({
    entityType: 'item',
    entityId: publicId,
    enabled: !!publicId && !loading,
  });

  // Derived state for room and item type from tags
  const selectedRoom = useMemo<RoomTypeConst | null>(() => {
    const roomTag = tags.find((tag) => tag.startsWith('#room.'));
    if (!roomTag) return null;
    return roomTag.substring('#room.'.length) as RoomTypeConst;
  }, [tags]);

  const selectedItemType = useMemo<ItemTypeConst | null>(() => {
    return extractItemTypeFromTags(tags) as ItemTypeConst | null;
  }, [tags]);

  // Compute custom tags (excluding room and item type tags)
  const customTags = useMemo(() => {
    return tags.filter((tag) => {
      // Exclude room tags
      if (tag.startsWith('#room.')) return false;
      // Exclude item type tags
      if (['appliance', 'room-item', 'general-info'].includes(tag)) return false;
      return true;
    });
  }, [tags]);

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
        const propertyId =
          (response.data as any).propertyId ||
          (response.data as any).property?.id ||
          (response.data as any).property_id ||
          null;

        const nextItem: ItemForEdit = {
          id: response.data.id,
          publicId: response.data.publicId,
          name: response.data.name || '',
          description: response.data.description || '',
          tags: (response.data as { tags?: string[] }).tags || [],
          propertyId,
          property: (response.data as any).property,
          articles: (response.data as { articles?: any[] }).articles || []
        };

        setItem(nextItem);
        setName(nextItem.name);
        setDescription(nextItem.description);
        setTags(nextItem.tags);
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

  // REQ-E05-029: Auto-open translation panel after save when translations need attention
  useEffect(() => {
    if (shouldAutoOpenPanel && translationStatus) {
      const shouldOpen = (translationStatus.pending > 0) || (translationStatus.failed > 0);
      if (shouldOpen) {
        console.log('[REQ-E05-029] Auto-opening translation panel:', {
          pending: translationStatus.pending,
          failed: translationStatus.failed,
        });
        setIsPanelOpen(true);
      }
      setShouldAutoOpenPanel(false);
    }
  }, [shouldAutoOpenPanel, translationStatus]);

  // Handle room selection change
  const handleRoomChange = useCallback((room: RoomTypeConst | null) => {
    setTags((prevTags) => setRoomInTags(prevTags, room));
  }, []);

  // Handle item type selection change
  const handleItemTypeChange = useCallback((type: ItemTypeConst | null) => {
    setTags((prevTags) => setItemTypeInTags(prevTags, type));
  }, []);

  // Handle custom tags save
  const handleCustomTagsSave = useCallback(async (newCustomTags: string[]) => {
    // Preserve current room and item type tags
    const roomTag = tags.find((tag) => tag.startsWith('#room.'));
    const itemTypeTag = extractItemTypeFromTags(tags);

    const updatedTags = [...newCustomTags];
    if (roomTag) updatedTags.push(roomTag);
    if (itemTypeTag) updatedTags.push(itemTypeTag);

    setTags(updatedTags);
  }, [tags]);

  // Handle edit instruction navigation
  const handleEditInstruction = useCallback((articleId: string) => {
    router.push(`/dashboard2/instructions/${articleId}/edit`);
  }, [router]);

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
        id: item.id,
        publicId,
        name,
        description,
        propertyId,
        tags,
        links: [], // REQ-215: Media management removed from this page
      }, headers);

      if (response.success) {
        // REQ-E05-029: Refresh translation status and trigger auto-open check
        await refetchStatus();
        setShouldAutoOpenPanel(true);

        // Conditional redirect: stay on page if translations need attention
        // The setTimeout allows the auto-open check to run before redirect decision
        setTimeout(() => {
          if (!isPanelOpen) {
            router.push('/dashboard2/items');
          } else {
            console.log('[REQ-E05-029] Staying on page to show translation panel');
          }
        }, 1500);
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
        <p className="text-gray-600">{t('loginRequired')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/dashboard2/items"
            className="text-[#FF385C] hover:underline"
          >
            {t('returnToItems')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {/* REQ-E05-029: Header row with back button and translations button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/dashboard2/items')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToItems')}
          </button>

          {/* REQ-E05-029: Translations button with status badges */}
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            disabled={!publicId || loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label={t('translationsTooltip')}
          >
            <Globe className="w-4 h-4" />
            <span>{t('translations')}</span>
            {translationStatus?.pending && translationStatus.pending > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {translationStatus.pending}
              </span>
            )}
            {translationStatus?.failed && translationStatus.failed > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {translationStatus.failed}
              </span>
            )}
            {statusLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
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
              {t('form.nameLabel')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50"
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.descriptionLabel')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-none disabled:opacity-50"
              placeholder={t('form.descriptionPlaceholder')}
            />
          </div>

          {/* Room Selector */}
          <RoomSelector
            value={selectedRoom}
            onChange={handleRoomChange}
            disabled={saving}
          />

          {/* Item Type Selector */}
          <ItemTypeSelector
            value={selectedItemType}
            onChange={handleItemTypeChange}
            disabled={saving}
          />

          {/* Additional Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.tagsLabel')}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t('form.tagsHelper')}
            </p>
            <TagsInlineEdit
              tags={customTags}
              onSave={handleCustomTagsSave}
              disabled={saving}
              placeholder={t('form.tagsPlaceholder')}
            />
          </div>

          {/* Instructions List */}
          {item && (
            <ItemInstructionsList
              articles={item.articles || []}
              itemName={item.name}
              onEditInstruction={handleEditInstruction}
              loading={false}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard2/items')}
            disabled={saving}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('buttons.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('buttons.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('buttons.save')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* REQ-E05-029: Translation Preview Panel */}
      <TranslationPreviewPanel
        entityId={publicId}
        entityType="item"
        sourceLanguage="en"
        sourceContent={{
          title: name,
          description: description || undefined,
        }}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onTranslationEdited={(language) => {
          router.push(`/dashboard2/translations/item/${publicId}/${language}/edit`);
        }}
      />
    </div>
  );
}
