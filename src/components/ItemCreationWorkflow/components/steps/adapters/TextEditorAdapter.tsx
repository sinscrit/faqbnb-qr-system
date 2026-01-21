'use client';

/**
 * TextEditorAdapter Component
 *
 * Adapter component that bridges TextEditorStep (which uses ItemCaptureState)
 * with ItemCreationWorkflow (which uses CurrentItemState). Handles text
 * instruction capture and conversion to ContentPiece format.
 *
 * State Mapping:
 * - CurrentItemState -> synthetic ItemCaptureState
 * - ContentPiece <- text instructions conversion
 *
 * @module ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React, { useMemo, useCallback, useState } from 'react';
import TextEditorStep from '@/components/ItemCapture/components/steps/TextEditorStep';
import type {
  ItemCaptureState,
  WizardStep,
} from '@/components/ItemCapture/ItemCapture.types';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';
import { generateUUID } from '@/components/ItemCapture/utils/generateUUID';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for TextEditorAdapter component.
 */
export interface TextEditorAdapterProps {
  /** Current item being created */
  currentItem: CurrentItemState;
  /** Callback to add a content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Callback when editing is complete */
  onComplete: () => void;
  /** Callback to go back to previous step */
  onBack: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * TextEditorAdapter bridges TextEditorStep with ItemCreationWorkflow state.
 */
export default function TextEditorAdapter({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
}: TextEditorAdapterProps) {
  // Track text content locally
  const [textContent, setTextContent] = useState<string>('');

  // Create synthetic ItemCaptureState from CurrentItemState
  const syntheticState: ItemCaptureState = useMemo(
    () => ({
      currentStep: 'write-text' as WizardStep,
      stepHistory: [],
      metadata: {
        title: currentItem.itemName,
        location: currentItem.room,
        applianceType: undefined,
        tags: [],
      },
      mediaItems: [],
      urlItems: [],
      instructions: textContent,
      errors: {},
      isRecording: false,
      isCameraActive: false,
      isSubmitting: false,
      submitError: null,
      isDirty: false,
    }),
    [currentItem, textContent]
  );

  // Map setInstructions callback: update local state
  const handleSetInstructions = useCallback((text: string) => {
    setTextContent(text);
  }, []);

  // Map goToStep callback: when navigating to next step, create ContentPiece and call onComplete
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      // TextEditorStep calls goToStep('add-more') when user clicks Continue
      // Create ContentPiece from text content and proceed to preview-save
      if (step === 'add-more' && textContent.trim()) {
        const contentCount = currentItem.content?.length ?? 0;
        const contentPiece: ContentPiece = {
          id: generateUUID(),
          type: 'text',
          data: {
            type: 'text',
            text: textContent,
          },
          order: contentCount,
        };
        onAddContent(contentPiece);
        onComplete();
      } else if (step === 'add-more' && !textContent.trim()) {
        // No text entered, just complete without adding content
        onComplete();
      }
    },
    [textContent, currentItem.content, onAddContent, onComplete]
  );

  // Map prevStep callback directly to onBack
  const handlePrevStep = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <TextEditorStep
      state={syntheticState}
      setInstructions={handleSetInstructions}
      goToStep={handleGoToStep}
      prevStep={handlePrevStep}
    />
  );
}
