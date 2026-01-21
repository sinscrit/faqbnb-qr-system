'use client';

/**
 * FileUploadAdapter Component
 *
 * Adapter component that bridges FileUploadStep (which uses ItemCaptureState)
 * with ItemCreationWorkflow (which uses CurrentItemState). Handles file uploads
 * for PDF, video, and image files.
 *
 * State Mapping:
 * - CurrentItemState -> synthetic ItemCaptureState
 * - ContentPiece <- MediaItem conversion (handles mixed file types)
 *
 * @module ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React, { useMemo, useCallback } from 'react';
import FileUploadStep from '@/components/ItemCapture/components/steps/FileUploadStep';
import type {
  ItemCaptureState,
  ItemCaptureConfig,
  MediaItem,
  WizardStep,
} from '@/components/ItemCapture/ItemCapture.types';
import type { CurrentItemState, ContentPiece, ContentType } from '../../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for FileUploadAdapter component.
 */
export interface FileUploadAdapterProps {
  /** Current item being created */
  currentItem: CurrentItemState;
  /** Callback to add a content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Callback when upload is complete */
  onComplete: () => void;
  /** Callback to go back to previous step */
  onBack: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Maps MediaItem type to ContentPiece type.
 */
function mapMediaTypeToContentType(mediaType: 'video' | 'image' | 'pdf' | 'url'): ContentType {
  switch (mediaType) {
    case 'video':
      return 'video';
    case 'image':
      return 'photo';
    case 'pdf':
      return 'pdf';
    case 'url':
      return 'url';
    default:
      return 'pdf'; // fallback
  }
}

/**
 * Converts a MediaItem (from ItemCapture) to a ContentPiece (for ItemCreationWorkflow).
 */
function mediaItemToContentPiece(mediaItem: MediaItem, order: number): ContentPiece {
  const contentType = mapMediaTypeToContentType(mediaItem.type);

  if (mediaItem.type === 'video') {
    return {
      id: mediaItem.id,
      type: contentType,
      data: {
        type: 'video',
        file: mediaItem.file,
        duration: mediaItem.metadata.duration,
      },
      order,
      thumbnail: mediaItem.thumbnail,
    };
  } else if (mediaItem.type === 'image') {
    return {
      id: mediaItem.id,
      type: contentType,
      data: {
        type: 'photo',
        file: mediaItem.file,
      },
      order,
      thumbnail: mediaItem.thumbnail,
    };
  } else if (mediaItem.type === 'pdf') {
    return {
      id: mediaItem.id,
      type: contentType,
      data: {
        type: 'pdf',
        file: mediaItem.file,
        pageCount: mediaItem.metadata.pageCount,
      },
      order,
      thumbnail: mediaItem.thumbnail,
    };
  }

  // Fallback for unexpected types
  return {
    id: mediaItem.id,
    type: 'pdf',
    data: {
      type: 'pdf',
      file: mediaItem.file,
    },
    order,
    thumbnail: mediaItem.thumbnail,
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * FileUploadAdapter bridges FileUploadStep with ItemCreationWorkflow state.
 */
export default function FileUploadAdapter({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
}: FileUploadAdapterProps) {
  // Create synthetic ItemCaptureState from CurrentItemState
  const syntheticState: ItemCaptureState = useMemo(
    () => ({
      currentStep: 'upload-file' as WizardStep,
      stepHistory: [],
      metadata: {
        title: currentItem.itemName,
        location: currentItem.room,
        applianceType: undefined,
        tags: [],
      },
      mediaItems: [], // FileUploadStep manages its own upload state internally
      urlItems: [],
      instructions: '',
      errors: {},
      isRecording: false,
      isCameraActive: false,
      isSubmitting: false,
      submitError: null,
      isDirty: false,
    }),
    [currentItem]
  );

  // Create synthetic ItemCaptureConfig with appropriate defaults
  const syntheticConfig: ItemCaptureConfig = useMemo(
    () => ({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxTotalSize: 200 * 1024 * 1024, // 200MB
      allowedMediaTypes: ['video', 'image', 'pdf'],
      debug: false,
    }),
    []
  );

  // Map addMedia callback: convert MediaItem to ContentPiece
  const handleAddMedia = useCallback(
    (mediaItem: MediaItem) => {
      const contentCount = currentItem.content?.length ?? 0;
      const contentPiece = mediaItemToContentPiece(mediaItem, contentCount);
      onAddContent(contentPiece);
    },
    [currentItem.content, onAddContent]
  );

  // Map removeMedia callback: not used in workflow context (user manages via preview)
  const handleRemoveMedia = useCallback((id: string) => {
    // No-op: removal will be handled in preview-save step
  }, []);

  // Map goToStep callback: when navigating to next step, call onComplete
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      // FileUploadStep calls goToStep('add-more') when user clicks Continue
      // Map this to onComplete to proceed to preview-save in workflow
      if (step === 'add-more') {
        onComplete();
      }
    },
    [onComplete]
  );

  // Map prevStep callback directly to onBack
  const handlePrevStep = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <FileUploadStep
      state={syntheticState}
      addMedia={handleAddMedia}
      removeMedia={handleRemoveMedia}
      goToStep={handleGoToStep}
      prevStep={handlePrevStep}
      config={syntheticConfig}
    />
  );
}
