'use client';

/**
 * PhotoCaptureAdapter Component
 *
 * Adapter component that bridges PhotoCaptureStep (which uses ItemCaptureState)
 * with ItemCreationWorkflow (which uses CurrentItemState). Converts between
 * state types and maps callbacks appropriately.
 *
 * State Mapping:
 * - CurrentItemState -> synthetic ItemCaptureState
 * - ContentPiece <- MediaItem (type: 'image') conversion
 *
 * @module ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React, { useMemo, useCallback } from 'react';
import PhotoCaptureStep from '@/components/ItemCapture/components/steps/PhotoCaptureStep';
import type {
  ItemCaptureState,
  ItemCaptureConfig,
  MediaItem,
  WizardStep,
} from '@/components/ItemCapture/ItemCapture.types';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for PhotoCaptureAdapter component.
 */
export interface PhotoCaptureAdapterProps {
  /** Current item being created */
  currentItem: CurrentItemState;
  /** Callback to add a content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Callback when capture is complete */
  onComplete: () => void;
  /** Callback to go back to previous step */
  onBack: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts a MediaItem (from ItemCapture) to a ContentPiece (for ItemCreationWorkflow).
 */
function mediaItemToContentPiece(mediaItem: MediaItem, order: number): ContentPiece {
  return {
    id: mediaItem.id,
    type: 'photo',
    data: {
      type: 'photo',
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
 * PhotoCaptureAdapter bridges PhotoCaptureStep with ItemCreationWorkflow state.
 */
export default function PhotoCaptureAdapter({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
}: PhotoCaptureAdapterProps) {
  // Create synthetic ItemCaptureState from CurrentItemState
  const syntheticState: ItemCaptureState = useMemo(
    () => ({
      currentStep: 'capture-photo' as WizardStep,
      stepHistory: [],
      metadata: {
        title: currentItem.itemName,
        location: currentItem.room,
        applianceType: undefined,
        tags: [],
      },
      mediaItems: [], // PhotoCaptureStep manages its own capture state internally
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
      maxPhotos: 10,
      maxFileSize: 100 * 1024 * 1024, // 100MB
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

  // Map goToStep callback: when navigating to next step, call onComplete
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      // PhotoCaptureStep calls goToStep('add-more') when user clicks Continue
      // Map this to onComplete to proceed to preview-save in workflow
      if (step === 'add-more') {
        onComplete();
      } else if (step === 'upload-file') {
        // Fallback option when camera fails - also complete
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
    <PhotoCaptureStep
      state={syntheticState}
      addMedia={handleAddMedia}
      goToStep={handleGoToStep}
      prevStep={handlePrevStep}
      config={syntheticConfig}
    />
  );
}
