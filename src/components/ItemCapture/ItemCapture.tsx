'use client';

/**
 * ItemCapture Component
 *
 * Main orchestrating component for the item capture wizard. This component
 * combines the wizard steps, state management, and handles the final submission
 * by assembling the ItemRecord and calling the onComplete callback.
 *
 * @module ItemCapture/ItemCapture
 * @see docs/REQ-053-implement-oncomplete-assembly-detailed.md
 * @lastModified 2025-12-31 (REQ-053 Task 5)
 */

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useItemCaptureState } from './hooks/useItemCaptureState';
import { assembleItemRecord } from './utils/assembleItemRecord';
import { validateItemCapture } from './utils/validation';
import { CaptureWizard } from './components/CaptureWizard';
import { MetadataStep } from './components/steps/MetadataStep';
import { ContentTypeStep } from './components/steps/ContentTypeStep';
import { VideoCaptureStep } from './components/steps/VideoCaptureStep';
import { PhotoCaptureStep } from './components/steps/PhotoCaptureStep';
import { FileUploadStep } from './components/steps/FileUploadStep';
import { TextEditorStep } from './components/steps/TextEditorStep';
import { UrlInputStep } from './components/steps/UrlInputStep';
import { MediaEditorStep } from './components/steps/MediaEditorStep';
import { ReviewStep } from './components/steps/ReviewStep';
import { WhatsNextStep } from './components/steps/WhatsNextStep';
import type {
  ItemCaptureProps,
  ItemRecord,
  WizardStep,
  MediaItem,
  UrlItem,
} from './ItemCapture.types';
import type { ContentType } from './components/steps/ContentTypeStep';

// =============================================================================
// Component
// =============================================================================

/**
 * ItemCapture is the main wizard component for capturing item information.
 *
 * Features:
 * - Multi-step wizard flow (metadata → content type → capture/upload → review)
 * - State management via useItemCaptureState hook
 * - Validation via useItemValidation hook
 * - Final assembly via assembleItemRecord utility
 * - Emits ItemRecord via onComplete callback
 * - Supports cancel flow via onCancel callback
 *
 * @example
 * ```tsx
 * <ItemCapture
 *   onComplete={(record) => {
 *     console.log('Submitted:', record);
 *     // Handle the completed item record
 *   }}
 *   onCancel={() => {
 *     // Handle cancellation
 *     router.back();
 *   }}
 *   config={{ debug: true }}
 * />
 * ```
 */
export function ItemCapture({
  onComplete,
  onCancel,
  config,
  className,
  initialRoom,
  initialApplianceType,
}: ItemCaptureProps) {
  // Prepare initial values for state hook
  const initialValues = useMemo(() => {
    if (!initialRoom && !initialApplianceType) {
      return undefined;
    }
    return {
      location: initialRoom,
      applianceType: initialApplianceType,
    };
  }, [initialRoom, initialApplianceType]);

  // Initialize state management
  const {
    state,
    goToStep,
    nextStep,
    prevStep,
    setMetadata,
    addMedia,
    removeMedia,
    updateMedia,
    reorderMedia,
    setInstructions,
    addUrl,
    removeUrl,
    updateUrl,
    setError,
    clearError,
    clearAllErrors,
    startRecording,
    stopRecording,
    activateCamera,
    deactivateCamera,
    setSubmitting,
    reset,
    canGoNext,
    canGoBack,
    canSubmit,
  } = useItemCaptureState(initialValues);

  // State for tracking saved item info for WhatsNextStep (REQ-189)
  const [savedItem, setSavedItem] = useState<{ id: string; name: string } | null>(null);

  // Debug logging helper
  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (config?.debug) {
        console.log('[ItemCapture]', ...args);
      }
    },
    [config?.debug]
  );

  // ==========================================================================
  // Submit Handler (Task 5 - Core Implementation)
  // ==========================================================================

  /**
   * Handle form submission.
   *
   * Flow:
   * 1. Validate data using validation layer
   * 2. Set errors and return early if validation fails
   * 3. Dispatch SUBMIT action
   * 4. Call assembleItemRecord() with current state
   * 5. Call onComplete(record) with assembled ItemRecord
   * 6. Dispatch SUBMIT_SUCCESS after successful emission
   * 7. Catch errors and dispatch SUBMIT_ERROR with message
   */
  const handleSubmit = useCallback(() => {
    debugLog('handleSubmit called');

    // Run validation
    const validation = validateItemCapture(
      state.metadata,
      state.mediaItems,
      state.urlItems,
      state.instructions
    );

    if (!validation.isValid) {
      debugLog('Validation failed:', validation.errors);
      // Set errors in state
      Object.entries(validation.errors).forEach(([field, error]) => {
        if (error) {
          setError(field, error);
        }
      });
      return;
    }

    // Clear any previous errors
    clearAllErrors();

    // Start submission
    setSubmitting(true);

    try {
      // Assemble the record
      const record = assembleItemRecord({
        metadata: state.metadata,
        mediaItems: state.mediaItems,
        urlItems: state.urlItems,
        instructions: state.instructions,
      });

      // Debug logging of the assembled record
      if (config?.debug) {
        console.log('=== ITEM CAPTURE OUTPUT ===');
        console.log('ItemRecord:', {
          ...record,
          media: record.media.map((m) => ({
            ...m,
            file: `[Blob: ${m.file.size} bytes, ${m.file.type}]`,
            thumbnail: m.thumbnail
              ? `[Blob: ${m.thumbnail.size} bytes]`
              : undefined,
          })),
          createdAt: record.createdAt.toISOString(),
        });
      }

      // Emit the record via callback
      onComplete(record);

      // Store saved item info for WhatsNextStep (REQ-189)
      setSavedItem({ id: record.id, name: record.title });

      // Transition to What's Next screen instead of resetting
      goToStep('whats-next');

      // Clear submitting state
      setSubmitting(false);

      debugLog('Submission successful, transitioning to whats-next');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to assemble record';
      setError('submit', message);
      setSubmitting(false);

      if (config?.debug) {
        console.error('ItemCapture assembly error:', error);
      }
    }
  }, [
    state.metadata,
    state.mediaItems,
    state.urlItems,
    state.instructions,
    onComplete,
    config?.debug,
    setError,
    clearAllErrors,
    setSubmitting,
    goToStep,
    debugLog,
  ]);

  // ==========================================================================
  // Navigation Handlers
  // ==========================================================================

  /**
   * Handle content type selection from ContentTypeStep.
   * Routes to the appropriate capture/upload/write step.
   */
  const handleContentTypeSelect = useCallback(
    (contentType: ContentType) => {
      debugLog('Content type selected:', contentType);

      switch (contentType) {
        case 'video':
          goToStep('capture-video');
          break;
        case 'photo':
          goToStep('capture-photo');
          break;
        case 'upload':
          goToStep('upload-file');
          break;
        case 'text':
          goToStep('write-text');
          break;
        case 'url':
          goToStep('add-url');
          break;
        default:
          debugLog('Unknown content type:', contentType);
      }
    },
    [goToStep, debugLog]
  );

  /**
   * Handle next from various steps - route to add-more or review.
   */
  const handleCaptureComplete = useCallback(() => {
    debugLog('Capture complete, going to add-more');
    goToStep('add-more');
  }, [goToStep, debugLog]);

  /**
   * Handle add more decision - either add more content or go to review.
   */
  const handleAddMoreDecision = useCallback(
    (addMore: boolean) => {
      if (addMore) {
        goToStep('content-type');
      } else {
        goToStep('review');
      }
    },
    [goToStep]
  );

  /**
   * Handle edit section from ReviewStep.
   */
  const handleEditSection = useCallback(
    (section: 'metadata' | 'content-type' | 'capture' | 'text' | 'url') => {
      debugLog('Edit section:', section);

      switch (section) {
        case 'metadata':
          goToStep('metadata');
          break;
        case 'content-type':
          goToStep('content-type');
          break;
        case 'capture':
          goToStep('content-type'); // Let them choose what to capture
          break;
        case 'text':
          goToStep('write-text');
          break;
        case 'url':
          goToStep('add-url');
          break;
      }
    },
    [goToStep, debugLog]
  );

  /**
   * Handle media reorder from ReviewStep.
   */
  const handleReorderMedia = useCallback(
    (mediaId: string, direction: 'up' | 'down') => {
      const index = state.mediaItems.findIndex((item) => item.id === mediaId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= state.mediaItems.length) return;

      reorderMedia(index, newIndex);
    },
    [state.mediaItems, reorderMedia]
  );

  /**
   * Handle media edit from ReviewStep.
   */
  const handleEditMedia = useCallback(
    (mediaId: string) => {
      debugLog('Edit media:', mediaId);
      // TODO: Navigate to edit-media step with the selected media
      goToStep('edit-media');
    },
    [goToStep, debugLog]
  );

  /**
   * Handle adding media from capture steps.
   */
  const handleAddMedia = useCallback(
    (media: MediaItem) => {
      addMedia(media);
      handleCaptureComplete();
    },
    [addMedia, handleCaptureComplete]
  );

  // ==========================================================================
  // WhatsNextStep Handlers (REQ-189)
  // ==========================================================================

  /**
   * Handle Edit Instructions action from WhatsNextStep.
   * TODO: Navigate to edit view for the saved item once edit route exists.
   */
  const handleEditInstructions = useCallback(() => {
    debugLog('Edit Instructions clicked for item:', savedItem?.id);
    // For now, reset and return - full implementation requires edit route
    // Future: router.push(`/dashboard/items/${savedItem?.id}/edit`)
    setSavedItem(null);
    reset();
  }, [savedItem, reset, debugLog]);

  /**
   * Handle Add New Instructions action from WhatsNextStep.
   * Keeps the saved item reference and goes to content-type step.
   */
  const handleAddNewInstructions = useCallback(() => {
    debugLog('Add New Instructions clicked');
    // Reset the media and instructions but keep going
    // Note: This implementation goes to content-type to add more content
    goToStep('content-type');
  }, [goToStep, debugLog]);

  /**
   * Handle Create New Item action from WhatsNextStep.
   * Full reset and start fresh from metadata step.
   */
  const handleCreateNewItem = useCallback(() => {
    debugLog('Create New Item clicked');
    setSavedItem(null);
    reset();
  }, [reset, debugLog]);

  /**
   * Handle Done action from WhatsNextStep.
   * Reset state and potentially navigate to dashboard.
   */
  const handleDone = useCallback(() => {
    debugLog('Done clicked, returning to initial state');
    setSavedItem(null);
    reset();
    // Parent component can handle dashboard navigation via onComplete callback
  }, [reset, debugLog]);

  // ==========================================================================
  // Step Rendering
  // ==========================================================================

  /**
   * Render the current step component.
   */
  const renderStep = useMemo(() => {
    switch (state.currentStep) {
      case 'metadata':
        return (
          <MetadataStep
            metadata={state.metadata}
            errors={state.errors}
            onUpdate={setMetadata}
            onValidate={() => {
              const validation = validateItemCapture(
                state.metadata,
                state.mediaItems,
                state.urlItems,
                state.instructions
              );
              if (!validation.isValid) {
                Object.entries(validation.errors).forEach(([field, error]) => {
                  if (error) setError(field, error);
                });
                return false;
              }
              return true;
            }}
          />
        );

      case 'content-type':
        return (
          <ContentTypeStep
            selectedType={null}
            onSelect={handleContentTypeSelect}
          />
        );

      case 'capture-video':
        return (
          <VideoCaptureStep
            state={state}
            addMedia={addMedia}
            goToStep={goToStep}
            prevStep={() => goToStep('content-type')}
            config={config || {}}
          />
        );

      case 'capture-photo':
        return (
          <PhotoCaptureStep
            state={state}
            addMedia={addMedia}
            goToStep={goToStep}
            prevStep={() => goToStep('content-type')}
            config={config || {}}
          />
        );

      case 'upload-file':
        return (
          <FileUploadStep
            state={state}
            addMedia={addMedia}
            removeMedia={removeMedia}
            goToStep={goToStep}
            prevStep={() => goToStep('content-type')}
            config={config || {}}
          />
        );

      case 'write-text':
        return (
          <TextEditorStep
            state={state}
            setInstructions={setInstructions}
            goToStep={goToStep}
            prevStep={() => goToStep('content-type')}
          />
        );

      case 'add-url':
        return (
          <UrlInputStep
            state={state}
            addUrl={addUrl}
            goToStep={goToStep}
            prevStep={() => goToStep('content-type')}
            config={config}
          />
        );

      case 'edit-media':
        // Get the first media item for editing (or could track which one)
        const editTarget = state.mediaItems[0];
        if (!editTarget) {
          goToStep('review');
          return null;
        }
        return (
          <MediaEditorStep
            mediaItem={editTarget}
            onSave={(updatedMedia) => {
              updateMedia(editTarget.id, updatedMedia);
              goToStep('review');
            }}
            onCancel={() => goToStep('review')}
          />
        );

      case 'add-more':
        // Simple decision step - add more or go to review
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Content Added Successfully
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Would you like to add more content or proceed to review?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleAddMoreDecision(true)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Add More Content
              </button>
              <button
                type="button"
                onClick={() => handleAddMoreDecision(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review & Submit
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <ReviewStep
            metadata={state.metadata}
            mediaItems={state.mediaItems}
            urlItems={state.urlItems}
            instructions={state.instructions}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            onEditSection={handleEditSection}
            onRemoveMedia={removeMedia}
            onRemoveUrl={removeUrl}
            onReorderMedia={handleReorderMedia}
            onEditMedia={handleEditMedia}
            isSubmitting={state.isSubmitting}
            debug={config?.debug}
          />
        );

      case 'whats-next':
        // REQ-189: Post-save decision screen
        if (!savedItem) {
          // Safety check - shouldn't happen but handle gracefully
          debugLog('WhatsNextStep rendered without savedItem, resetting');
          reset();
          return null;
        }
        return (
          <WhatsNextStep
            savedItemId={savedItem.id}
            savedItemName={savedItem.name}
            onEditInstructions={handleEditInstructions}
            onAddNewInstructions={handleAddNewInstructions}
            onCreateNewItem={handleCreateNewItem}
            onDone={handleDone}
          />
        );

      default:
        debugLog('Unknown step:', state.currentStep);
        return null;
    }
  }, [
    state.currentStep,
    state.metadata,
    state.mediaItems,
    state.urlItems,
    state.instructions,
    state.errors,
    state.isSubmitting,
    savedItem,
    setMetadata,
    setError,
    handleContentTypeSelect,
    handleAddMedia,
    handleCaptureComplete,
    handleAddMoreDecision,
    handleEditSection,
    handleReorderMedia,
    handleEditMedia,
    handleSubmit,
    handleEditInstructions,
    handleAddNewInstructions,
    handleCreateNewItem,
    handleDone,
    addMedia,
    updateMedia,
    removeMedia,
    setInstructions,
    goToStep,
    onCancel,
    reset,
    config,
    debugLog,
  ]);

  // ==========================================================================
  // Wizard Navigation Visibility
  // ==========================================================================

  // Don't show wizard navigation on review or whats-next steps (REQ-189)
  const showWizardNav = state.currentStep !== 'review' && state.currentStep !== 'whats-next';

  // ==========================================================================
  // Render
  // ==========================================================================

  if (!showWizardNav) {
    // Review step has its own navigation
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
        {renderStep}
      </div>
    );
  }

  return (
    <CaptureWizard
      currentStep={state.currentStep}
      onNext={nextStep}
      onBack={prevStep}
      onCancel={onCancel}
      canGoNext={canGoNext}
      canGoBack={canGoBack}
      isLoading={state.isSubmitting}
      className={className}
    >
      {renderStep}
    </CaptureWizard>
  );
}

export default ItemCapture;
