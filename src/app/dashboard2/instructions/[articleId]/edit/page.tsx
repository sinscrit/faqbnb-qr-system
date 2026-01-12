'use client';

/**
 * REQ-213: Edit Instruction Flow - Edit Page
 * Created: 2026-01-12
 * Last Modified: 2026-01-12
 *
 * Edit page for existing instruction articles.
 * Routes to /dashboard2/instructions/[articleId]/edit
 * Loads article data and displays ItemCreationWorkflow in edit mode.
 *
 * @route /dashboard2/instructions/[articleId]/edit
 * @see docs/req-213-edit-instruction-flow-detailed.md
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';
import type {
  EditModeData,
  RoomType,
  ItemType,
  PurposeType,
  ContentPiece,
  ContentType,
  ContentData
} from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';

/**
 * Helper function to map link_type to ContentType
 * @param linkType The link type from database (youtube, pdf, image, text, video)
 * @returns ContentType for workflow
 */
function mapLinkTypeToContentType(linkType: string): ContentType {
  switch (linkType.toLowerCase()) {
    case 'youtube':
    case 'video':
      return 'video';
    case 'pdf':
      return 'pdf';
    case 'image':
    case 'photo':
      return 'photo';
    case 'text':
      return 'text';
    default:
      return 'url';
  }
}

/**
 * Helper function to extract RoomType from item tags
 * Tags use format: #room.roomname (e.g., #room.kitchen)
 * @param tags Array of tag strings
 * @returns RoomType or 'other' if not found
 */
function extractRoomType(tags: string[]): RoomType {
  if (!tags || tags.length === 0) {
    return 'other';
  }

  // Find the first tag that starts with #room.
  const roomTag = tags.find((tag) => tag.startsWith('#room.'));

  if (!roomTag) {
    return 'other';
  }

  // Extract the room name after the dot
  const roomName = roomTag.substring('#room.'.length);

  // Map to RoomType
  const roomMap: Record<string, RoomType> = {
    'kitchen': 'kitchen',
    'laundry': 'laundry',
    'bedroom': 'bedroom',
    'bathroom': 'bathroom',
    'living-room': 'living-room',
    'garage': 'garage',
    'outdoor': 'outdoor',
    'general': 'general',
  };

  return roomMap[roomName] || 'other';
}

/**
 * Helper function to extract ItemType from item tags
 * @param tags Array of tag strings
 * @returns ItemType (appliance, room-item, or general-info)
 */
function extractItemType(tags: string[]): ItemType {
  if (!tags || tags.length === 0) {
    return 'appliance';
  }

  // Check for item type tags
  if (tags.some(tag => tag.startsWith('#appliance'))) {
    return 'appliance';
  }
  if (tags.some(tag => tag.startsWith('#room-item'))) {
    return 'room-item';
  }
  if (tags.some(tag => tag.startsWith('#general-info'))) {
    return 'general-info';
  }

  // Default to appliance
  return 'appliance';
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editData, setEditData] = useState<EditModeData | null>(null);

  /**
   * Fetch article data and transform it into EditModeData format
   * @param articleId The UUID of the article to load
   */
  const fetchArticleData = useCallback(async (articleId: string) => {
    if (!user || !articleId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      // Fetch article data
      const articleResponse = await adminApi.getArticle(articleId, headers);

      if (!articleResponse.success || !articleResponse.data) {
        throw new Error(articleResponse.error || 'Failed to fetch article');
      }

      const article = articleResponse.data;

      // Fetch the associated item to get item name, tags, and other details
      const itemResponse = await adminApi.getItem(article.itemId, headers);

      if (!itemResponse.success || !itemResponse.data) {
        throw new Error(itemResponse.error || 'Failed to fetch item data');
      }

      const item = itemResponse.data;

      // Extract tags from item (use type assertion for now until ItemResponse is updated)
      const itemTags = (item as any).tags || [];

      // Extract room from item tags
      const room = extractRoomType(itemTags);

      // Extract item type from item tags
      const itemType = extractItemType(itemTags);

      // Transform article links into ContentPiece format
      const existingContent: ContentPiece[] = (article.links || []).map((link: any, index: number) => {
        const contentType = mapLinkTypeToContentType(link.linkType);

        // Create appropriate ContentData based on type
        let data: ContentData;
        if (contentType === 'text') {
          data = {
            type: 'text',
            text: link.url // Assuming text content is stored in url field
          };
        } else if (contentType === 'url') {
          data = {
            type: 'url',
            url: link.url,
            title: link.title,
            thumbnailUrl: link.thumbnailUrl,
          };
        } else if (contentType === 'video') {
          data = {
            type: 'video',
            file: new Blob(), // Will be handled differently in edit mode
            url: link.url,
            title: link.title,
            thumbnailUrl: link.thumbnailUrl,
          } as any; // Type workaround for existing content
        } else if (contentType === 'photo') {
          data = {
            type: 'photo',
            file: new Blob(), // Will be handled differently in edit mode
            url: link.url,
            thumbnailUrl: link.thumbnailUrl,
          } as any;
        } else if (contentType === 'pdf') {
          data = {
            type: 'pdf',
            file: new Blob(), // Will be handled differently in edit mode
            url: link.url,
            title: link.title,
          } as any;
        } else {
          data = {
            type: 'url',
            url: link.url,
            title: link.title,
            thumbnailUrl: link.thumbnailUrl,
          };
        }

        return {
          id: link.id,
          type: contentType,
          data,
          order: link.displayOrder,
        };
      });

      // Construct EditModeData object
      const editModeData: EditModeData = {
        articleId: article.id,
        itemId: item.id,
        itemName: item.name,
        room,
        itemType,
        purpose: article.purpose as PurposeType,
        tags: itemTags,
        existingContent,
      };

      setEditData(editModeData);
      console.log('Loaded edit data:', editModeData);
    } catch (err) {
      console.error('Error fetching article data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load article data'));
    } finally {
      setLoading(false);
    }
  }, [user, currentAccount]);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, router]);

  // Fetch article data on mount
  useEffect(() => {
    if (user && articleId) {
      fetchArticleData(articleId);
    }
  }, [articleId, user, fetchArticleData]);

  // Authentication check rendering
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading article data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Article</h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/dashboard2/instructions')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Instructions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Callback handlers for ItemCreationWorkflow
  const handleSessionComplete = useCallback(() => {
    // REQ-213: Navigate back to instructions list with success message
    sessionStorage.setItem('editSuccess', 'true');
    router.push('/dashboard2/instructions');
  }, [router]);

  const handleSessionExit = useCallback(() => {
    // REQ-213: Navigate back to instructions list
    router.push('/dashboard2/instructions');
  }, [router]);

  const handleGeneratePDF = useCallback(async () => {
    // Not supported in edit mode
    throw new Error('PDF generation not supported in edit mode');
  }, []);

  const handlePrintDirect = useCallback(async () => {
    // Not supported in edit mode
    throw new Error('Direct print not supported in edit mode');
  }, []);

  const handleFetchExistingItems = useCallback(async () => {
    // Not needed in edit mode
    return [];
  }, []);

  const handleSaveItem = useCallback(async () => {
    // REQ-213: Will be implemented in Task 7
    // For now, simulate save and return dummy data
    console.log('Save handler - to be implemented in Task 7');
    return {
      id: articleId,
      qrCodeUrl: '',
      itemName: editData?.itemName,
    };
  }, [articleId, editData]);

  // Render ItemCreationWorkflow in edit mode
  if (!editData) {
    return null; // Should not reach here due to loading/error checks above
  }

  return (
    <ItemCreationWorkflow
      editMode={true}
      initialArticleId={articleId}
      initialArticleData={editData}
      onSessionComplete={handleSessionComplete}
      onSessionExit={handleSessionExit}
      onGeneratePDF={handleGeneratePDF}
      onPrintDirect={handlePrintDirect}
      onFetchExistingItems={handleFetchExistingItems}
      onSaveItem={handleSaveItem}
    />
  );
}
