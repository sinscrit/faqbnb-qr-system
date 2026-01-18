'use client';

/**
 * VideoCaptureAdapter Component
 *
 * Adapter component that bridges VideoCaptureStep (which uses ItemCaptureState)
 * with ItemCreationWorkflow (which uses CurrentItemState). Converts between
 * state types and maps callbacks appropriately.
 *
 * State Mapping:
 * - CurrentItemState -> synthetic ItemCaptureState
 * - ContentPiece <- MediaItem conversion
 *
 * @module ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React, { useMemo, useCallback } from 'react';
import VideoCaptureStep from '@/components/ItemCapture/components/steps/VideoCaptureStep';
import type {
  ItemCaptureState,
  ItemCaptureConfig,
  MediaItem,
  WizardStep,
} from '@/components/ItemCapture/ItemCapture.types';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';
import { generateUUID } from '@/components/ItemCapture/utils/generateUUID';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for VideoCaptureAdapter component.
 */
export interface VideoCaptureAdapterProps {
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
    type: 'video',
    data: {
      type: 'video',
      file: mediaItem.file,
      duration: mediaItem.metadata.duration,
    },
    order,
    thumbnail: mediaItem.thumbnail,
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * VideoCaptureAdapter bridges VideoCaptureStep with ItemCreationWorkflow state.
 */
export default function VideoCaptureAdapter({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
}: VideoCaptureAdapterProps) {
  // Create synthetic ItemCaptureState from CurrentItemState
  const syntheticState: ItemCaptureState = useMemo(
    () => ({
      currentStep: 'capture-video' as WizardStep,
      stepHistory: [],
      metadata: {
        title: currentItem.itemName,
        location: currentItem.room,
        applianceType: undefined,
        tags: [],
      },
      mediaItems: [], // VideoCaptureStep manages its own capture state internally
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
      maxVideoDuration: 300, // 5 minutes
      maxFileSize: 100 * 1024 * 1024, // 100MB
      enableUrlPreview: false,
      debug: false,
    }),
    []
  );

  // Map addMedia callback: convert MediaItem to ContentPiece
  const handleAddMedia = useCallback(
    (mediaItem: MediaItem) => {
      const contentPiece = mediaItemToContentPiece(mediaItem, currentItem.content.length);
      onAddContent(contentPiece);
    },
    [currentItem.content.length, onAddContent]
  );

  // Map goToStep callback: when navigating to next step, call onComplete
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      // VideoCaptureStep calls goToStep('add-more') after accepting video
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
    <VideoCaptureStep
      state={syntheticState}
      addMedia={handleAddMedia}
      goToStep={handleGoToStep}
      prevStep={handlePrevStep}
      config={syntheticConfig}
    />
  );
}
