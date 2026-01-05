'use client';

/**
 * ItemCreationWorkflow Component
 *
 * Main orchestrating component for the multi-step item creation workflow.
 * Manages step rendering, integrates state management, and handles navigation.
 *
 * @module ItemCreationWorkflow
 * @see docs/REQ-095-main-workflow-component-overview.md
 * @lastModified 2026-01-05 (REQ-107 Task 11)
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ItemCreationWorkflowProps } from './ItemCreationWorkflow.types';
import { useWorkflowState } from './hooks';
import { WorkflowHeader, ConfirmExitDialog } from './components/shared';
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep } from './components/steps';
import type { SessionItem, CurrentItemState } from './ItemCreationWorkflow.types';

// =============================================================================
// Step Placeholder Component
// =============================================================================

/**
 * Temporary placeholder component for workflow steps.
 * Will be replaced by actual step components in later phases.
 */
interface StepPlaceholderProps {
  step: string;
  onNext?: () => void;
  canNext?: boolean;
}

function StepPlaceholder({ step, onNext, canNext }: StepPlaceholderProps) {
  // Format step name for display
  const formattedStepName = step
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {formattedStepName}
        </h2>
        <p className="text-[#717171] mb-8">
          Step component placeholder - Implementation coming in later phases
        </p>

        {/* Temporary navigation for testing */}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className={cn(
              "px-6 py-3 rounded-lg font-medium text-white",
              "transition-colors duration-150",
              canNext
                ? "bg-[#FF385C] hover:bg-[#E31C5F]"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            Continue (Test)
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ItemCreationWorkflow({
  onSessionComplete,
  onSessionExit,
  onGeneratePDF,
  onPrintDirect,
  onFetchExistingItems,
  onSaveItem,
  initialSession,
  config,
  className,
}: ItemCreationWorkflowProps) {
  // State management hook
  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    canGoBack,
    canGoNext,
    progressPercent,
    currentStepIndex,
    totalSteps,
    itemCount,
    reset,
    selectRoom,
    selectItemType,
    selectSpecificItem,
    setItemName,
    selectContentSource,
    selectContentType,
    addContentPiece,
    removeContentPiece,
    reorderContent,
    saveItem,
    startNewItem,
    completeSession,
    addMoreToItem,
  } = useWorkflowState();

  // Save operation state
  const [isSaving, setIsSaving] = useState(false);

  // Exit confirmation dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Handle exit button click
  const handleExitClick = useCallback(() => {
    if (state.isDirty || itemCount > 0) {
      setShowExitDialog(true);
    } else {
      // No unsaved work, exit immediately
      onSessionExit({
        id: state.session.id,
        startedAt: state.session.startedAt,
        currentStep: state.currentStep,
        items: state.session.items,
        exitedAt: new Date(),
      });
    }
  }, [state.isDirty, state.session, state.currentStep, itemCount, onSessionExit]);

  // Handle confirmed exit
  const handleConfirmExit = useCallback(() => {
    setShowExitDialog(false);
    onSessionExit({
      id: state.session.id,
      startedAt: state.session.startedAt,
      currentStep: state.currentStep,
      items: state.session.items,
      exitedAt: new Date(),
    });
  }, [state.session, state.currentStep, onSessionExit]);

  // Handle cancel exit
  const handleCancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  // Handle "Add More to This Item" from NextActionStep
  const handleAddMore = useCallback(() => {
    const lastItem = state.session.items[state.session.items.length - 1];
    if (!lastItem) return;

    // Reconstruct CurrentItemState from SessionItem
    const restoredItem: CurrentItemState = {
      room: lastItem.room,
      itemType: lastItem.itemType,
      specificItem: lastItem.name.includes(' - ')
        ? lastItem.name.split(' - ')[1]
        : lastItem.name,
      itemName: lastItem.name,
      contentSource: 'existing',
      contentType: null,
      content: lastItem.content,
    };

    addMoreToItem(restoredItem);
  }, [state.session.items, addMoreToItem]);

  // Handle save item
  const handleSaveItem = useCallback(async () => {
    if (!state.currentItem) {
      throw new Error('No current item to save');
    }

    setIsSaving(true);
    try {
      const sessionItem: SessionItem = {
        id: crypto.randomUUID(),
        name: state.currentItem.itemName,
        room: state.currentItem.room,
        itemType: state.currentItem.itemType,
        content: state.currentItem.content,
        createdAt: new Date(),
      };

      const result = await onSaveItem(sessionItem);

      // Save to session state
      saveItem({ ...sessionItem, qrCodeUrl: result.qrCodeUrl });

      return result;
    } finally {
      setIsSaving(false);
    }
  }, [state.currentItem, onSaveItem, saveItem]);

  // Render current step content
  const renderCurrentStep = useCallback(() => {
    const commonProps = {
      onNext: nextStep,
      canNext: canGoNext,
    };

    switch (state.currentStep) {
      case 'room-selection':
        return (
          <RoomSelectionStep
            currentRoom={state.currentItem?.room ?? null}
            onSelectRoom={selectRoom}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'item-type-selection':
        return (
          <ItemTypeStep
            currentItemType={state.currentItem?.itemType ?? null}
            onSelectItemType={selectItemType}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'specific-item-selection':
        return (
          <SpecificItemStep
            currentRoom={state.currentItem?.room ?? 'other'}
            currentItemType={state.currentItem?.itemType ?? 'general-info'}
            currentSpecificItem={state.currentItem?.specificItem ?? ''}
            currentItemName={state.currentItem?.itemName ?? ''}
            existingSessionItems={state.session.items}
            onSelectSpecificItem={selectSpecificItem}
            onSetItemName={setItemName}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'content-source-selection':
        return (
          <ContentSourceStep
            currentContentSource={state.currentItem?.contentSource ?? null}
            onSelectContentSource={selectContentSource}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'content-type-selection':
        return (
          <ContentTypeStep
            currentContentSource={state.currentItem?.contentSource ?? 'existing'}
            currentContentType={state.currentItem?.contentType ?? null}
            onSelectContentType={selectContentType}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'content-creation':
        return (
          <ContentCreationStep
            currentContentType={state.currentItem?.contentType ?? 'video'}
            currentContentSource={state.currentItem?.contentSource ?? 'existing'}
            currentItem={state.currentItem!}
            onAddContent={addContentPiece}
            onNext={() => goToStep('preview-save')}
            onCancel={() => goToStep('content-type-selection')}
          />
        );
      case 'preview-save':
        return (
          <PreviewSaveStep
            currentItem={state.currentItem!}
            onUpdateItemName={setItemName}
            onRemoveContent={removeContentPiece}
            onReorderContent={reorderContent}
            onRetake={() => goToStep('content-creation')}
            onSave={handleSaveItem}
            onCancel={prevStep}
            onComplete={() => goToStep('next-action')}
            isSaving={isSaving}
          />
        );
      case 'next-action': {
        const lastSavedItem = state.session.items[state.session.items.length - 1] || null;
        return (
          <NextActionStep
            itemsCreated={itemCount}
            lastSavedItem={lastSavedItem}
            onAddMore={handleAddMore}
            onTagNewItem={startNewItem}
            onDone={completeSession}
          />
        );
      }
      case 'session-summary':
        // Session summary is the final step, no Continue button
        return <StepPlaceholder step="session-summary" />;
      default:
        return <StepPlaceholder step={state.currentStep} {...commonProps} />;
    }
  }, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession]);

  return (
    <div className={cn("flex flex-col min-h-screen bg-white", className)}>
      <WorkflowHeader
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
        canGoBack={canGoBack}
        onBack={prevStep}
        onExit={handleExitClick}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {renderCurrentStep()}
      </main>

      {/* Exit confirmation dialog */}
      <ConfirmExitDialog
        isOpen={showExitDialog}
        onClose={handleCancelExit}
        onConfirmExit={handleConfirmExit}
        itemCount={itemCount}
        hasUnsavedChanges={state.isDirty}
      />
    </div>
  );
}

export default ItemCreationWorkflow;
