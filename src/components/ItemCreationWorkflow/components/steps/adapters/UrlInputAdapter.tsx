'use client';

/**
 * UrlInputAdapter Component
 *
 * Adapter component that bridges UrlInputStep (which uses ItemCaptureState)
 * with ItemCreationWorkflow (which uses CurrentItemState). Handles URL
 * input capture and conversion to ContentPiece format.
 *
 * State Mapping:
 * - CurrentItemState -> synthetic ItemCaptureState
 * - ContentPiece <- UrlItem conversion
 *
 * @module ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React, { useMemo, useCallback } from 'react';
import UrlInputStep from '@/components/ItemCapture/components/steps/UrlInputStep';
import type {
  ItemCaptureState,
  UrlItem,
  WizardStep,
} from '@/components/ItemCapture/ItemCapture.types';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for UrlInputAdapter component.
 */
export interface UrlInputAdapterProps {
  /** Current item being created */
  currentItem: CurrentItemState;
  /** Callback to add a content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Callback when URL input is complete */
  onComplete: () => void;
  /** Callback to go back to previous step */
  onBack: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts a UrlItem (from ItemCapture) to a ContentPiece (for ItemCreationWorkflow).
 */
function urlItemToContentPiece(urlItem: UrlItem, order: number): ContentPiece {
  return {
    id: urlItem.id,
    type: 'url',
    data: {
      type: 'url',
      url: urlItem.metadata.url,
      title: urlItem.metadata.title,
      thumbnailUrl: urlItem.metadata.thumbnailUrl,
      faviconUrl: urlItem.metadata.faviconUrl,
    },
    order,
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * UrlInputAdapter bridges UrlInputStep with ItemCreationWorkflow state.
 */
export default function UrlInputAdapter({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
}: UrlInputAdapterProps) {
  // Create synthetic ItemCaptureState from CurrentItemState
  const syntheticState: ItemCaptureState = useMemo(
    () => ({
      currentStep: 'add-url' as WizardStep,
      stepHistory: [],
      metadata: {
        title: currentItem.itemName,
        location: currentItem.room,
        applianceType: undefined,
        tags: [],
      },
      mediaItems: [],
      urlItems: [], // UrlInputStep manages its own URL state internally
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

  // Map addUrl callback: convert UrlItem to ContentPiece
  const handleAddUrl = useCallback(
    (urlItem: UrlItem) => {
      const contentCount = currentItem.content?.length ?? 0;
      const contentPiece = urlItemToContentPiece(urlItem, contentCount);
      onAddContent(contentPiece);
    },
    [currentItem.content, onAddContent]
  );

  // Map goToStep callback: when navigating to next step, call onComplete
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      // UrlInputStep calls goToStep('add-more') when user confirms URL
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
    <UrlInputStep
      state={syntheticState}
      addUrl={handleAddUrl}
      goToStep={handleGoToStep}
      prevStep={handlePrevStep}
      config={{ debug: false }}
    />
  );
}
