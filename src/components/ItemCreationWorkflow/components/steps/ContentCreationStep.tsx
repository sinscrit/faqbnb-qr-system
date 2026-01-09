'use client';

/**
 * ContentCreationStep Component
 *
 * Step 6 of the item creation workflow.
 * Wraps ItemCapture component and transforms its output to ContentPiece format.
 *
 * @module ItemCreationWorkflow/components/steps/ContentCreationStep
 * @see docs/REQ-105-content-creation-step-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ItemCapture } from '@/components/ItemCapture';
import { mapRoomTypeToLocation } from '@/components/ItemCapture/utils/roomMapping';
import { mapSpecificItemToApplianceType } from '@/components/ItemCapture/utils/itemTypeMapping';
import { generateUUID } from '@/components/ItemCapture/utils/generateUUID';
import type {
  ContentType,
  ContentPiece,
  ContentData,
  CurrentItemState,
} from '../../ItemCreationWorkflow.types';
import type {
  ItemRecord,
  ItemCaptureConfig,
} from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ContentCreationStepProps {
  /** Current content type selection from workflow state */
  currentContentType: ContentType;
  /** Current content source from workflow state */
  currentContentSource: 'existing' | 'create-new';
  /** Current item state for context (room, itemType, specificItem, itemName) */
  currentItem: CurrentItemState;
  /** Handler to add content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Handler to navigate to next step (preview-save) */
  onNext: () => void;
  /** Handler to navigate back (cancel) */
  onCancel: () => void;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Maps workflow ContentType to ItemCaptureConfig.allowedMediaTypes.
 * Returns empty array for text and url (they don't use media types).
 *
 * @param contentType - The workflow content type
 * @returns Array of allowed media types for ItemCapture
 */
function mapContentTypeToMediaTypes(
  contentType: ContentType
): ('video' | 'image' | 'pdf')[] {
  switch (contentType) {
    case 'video':
      return ['video'];
    case 'photo':
      return ['image'];
    case 'pdf':
      return ['pdf'];
    case 'text':
      return [];
    case 'url':
      return [];
    default:
      return ['video', 'image', 'pdf'];
  }
}

/**
 * Builds ItemCaptureConfig based on workflow content type and source.
 *
 * @param contentType - The selected content type
 * @param contentSource - Whether using existing content or creating new
 * @returns Configuration object for ItemCapture
 */
function buildItemCaptureConfig(
  contentType: ContentType,
  contentSource: 'existing' | 'create-new'
): ItemCaptureConfig {
  // When user selects "I have content" (existing), allow all media types
  // since they can upload videos, photos, or PDFs
  // When "create-new", respect the specific content type selected
  const allowedMediaTypes = contentSource === 'existing'
    ? ['video', 'image', 'pdf'] as ('video' | 'image' | 'pdf')[]
    : mapContentTypeToMediaTypes(contentType);

  return {
    allowedMediaTypes,
    maxVideoDuration: 120,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    debug: process.env.NODE_ENV === 'development',
  };
}

/**
 * Transforms an ItemRecord from ItemCapture into a ContentPiece for the workflow.
 *
 * @param record - The ItemRecord from ItemCapture completion
 * @param contentType - The workflow content type
 * @returns A ContentPiece suitable for workflow state
 * @throws Error if required media is not found for the content type
 */
function transformRecordToContentPiece(
  record: ItemRecord,
  contentType: ContentType
): ContentPiece {
  const id = generateUUID();
  const order = 0; // First piece in this creation step

  // Extract thumbnail from first media item if available
  const thumbnail = record.media.length > 0 ? record.media[0].thumbnail : undefined;

  let data: ContentData;

  switch (contentType) {
    case 'video': {
      const videoMedia = record.media.find(m => m.type === 'video');
      if (!videoMedia) throw new Error('No video found in record');
      data = {
        type: 'video',
        file: videoMedia.file,
        duration: videoMedia.metadata.duration,
      };
      break;
    }

    case 'photo': {
      const imageMedia = record.media.find(m => m.type === 'image');
      if (!imageMedia) throw new Error('No photo found in record');
      data = {
        type: 'photo',
        file: imageMedia.file,
      };
      break;
    }

    case 'pdf': {
      const pdfMedia = record.media.find(m => m.type === 'pdf');
      if (!pdfMedia) throw new Error('No PDF found in record');
      data = {
        type: 'pdf',
        file: pdfMedia.file,
        pageCount: pdfMedia.metadata.pageCount,
      };
      break;
    }

    case 'text': {
      data = { type: 'text', text: record.instructions || '' };
      break;
    }

    case 'url': {
      const urlMedia = record.media.find(m => m.type === 'url');
      if (!urlMedia) throw new Error('No URL found in record');
      data = {
        type: 'url',
        url: urlMedia.metadata.url || '',
        title: urlMedia.metadata.pageTitle,
        thumbnailUrl: urlMedia.metadata.thumbnailUrl,
        faviconUrl: urlMedia.metadata.faviconUrl,
      };
      break;
    }

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  return {
    id,
    type: contentType,
    data,
    order,
    thumbnail,
  };
}

// =============================================================================
// Main Component
// =============================================================================

export function ContentCreationStep({
  currentContentType,
  currentContentSource,
  currentItem,
  onAddContent,
  onNext,
  onCancel,
  className,
}: ContentCreationStepProps) {
  // Compute ItemCapture configuration based on workflow state
  const config = useMemo(
    () => buildItemCaptureConfig(currentContentType, currentContentSource),
    [currentContentType, currentContentSource]
  );

  // Map workflow room selection to ItemCapture location format
  const initialRoom = useMemo(() => {
    if (!currentItem?.room) return undefined;
    return mapRoomTypeToLocation(currentItem.room);
  }, [currentItem?.room]);

  // Map workflow specific item to ItemCapture appliance type
  const initialApplianceType = useMemo(() => {
    if (!currentItem?.specificItem) return undefined;
    return mapSpecificItemToApplianceType(currentItem.specificItem);
  }, [currentItem?.specificItem]);

  // Handle ItemCapture completion - transform and add content
  const handleComplete = useCallback(
    (record: ItemRecord) => {
      try {
        const contentPiece = transformRecordToContentPiece(record, currentContentType);
        onAddContent(contentPiece);
        onNext();
      } catch (error) {
        console.error('Failed to transform ItemRecord:', error);
        // Error handling - could show toast/alert in future enhancement
      }
    },
    [currentContentType, onAddContent, onNext]
  );

  // Handle cancel - navigate back to content type selection
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div className={cn('flex flex-col flex-1', className)}>
      <ItemCapture
        config={config}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialRoom={initialRoom}
        initialApplianceType={initialApplianceType}
      />
    </div>
  );
}

export default ContentCreationStep;
