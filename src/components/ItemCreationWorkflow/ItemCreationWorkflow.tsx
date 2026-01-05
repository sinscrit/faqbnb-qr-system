'use client';

/**
 * ItemCreationWorkflow Component
 *
 * Main orchestrating component for the multi-step item creation workflow.
 * Manages step rendering, integrates state management, and handles navigation.
 *
 * @module ItemCreationWorkflow
 * @see docs/REQ-095-main-workflow-component-overview.md
 * @see docs/REQ-111-qr-code-integration-overview.md
 * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
 */

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ItemCreationWorkflowProps, PrintScope } from './ItemCreationWorkflow.types';
import { useWorkflowState } from './hooks';
import { WorkflowHeader, ConfirmExitDialog, PrintOptionsPanel } from './components/shared';
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
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
    removeSessionItem,
  } = useWorkflowState();

  // Save operation state
  const [isSaving, setIsSaving] = useState(false);

  // Exit confirmation dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Existing items state (for session summary)
  const [existingItems, setExistingItems] = useState<SessionItem[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // Task 4.14: Print panel state
  const [showPrintPanel, setShowPrintPanel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printStatus, setPrintStatus] = useState<string | undefined>(undefined);

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

  // Fetch existing items when entering session-summary step
  useEffect(() => {
    if (state.currentStep === 'session-summary') {
      setIsLoadingExisting(true);
      onFetchExistingItems()
        .then(items => setExistingItems(items))
        .catch(err => {
          console.error('Failed to fetch existing items:', err);
          setExistingItems([]);
        })
        .finally(() => setIsLoadingExisting(false));
    }
  }, [state.currentStep, onFetchExistingItems]);

  // Handle edit item (placeholder for Phase 7)
  const handleEditItem = useCallback((itemId: string) => {
    // TODO: Implement edit flow in Phase 7
    console.warn('Edit item not yet implemented:', itemId);
  }, []);

  // Task 4.14: Handle proceed to print - show PrintOptionsPanel
  const handleProceedToPrint = useCallback(() => {
    setShowPrintPanel(true);
    setPrintError(null);
  }, []);

  // Task 4.14: Handle back from print panel
  const handleBackFromPrint = useCallback(() => {
    setShowPrintPanel(false);
    setPrintError(null);
  }, []);

  // Task 4.14: Helper to get items for a given scope
  const getItemsForPrintScope = useCallback((scope: PrintScope): SessionItem[] => {
    switch (scope.type) {
      case 'all':
        return [...state.session.items, ...existingItems];
      case 'new-only':
        return state.session.items;
      case 'selected':
        const allItems = [...state.session.items, ...existingItems];
        return allItems.filter(item => scope.itemIds.includes(item.id));
    }
  }, [state.session.items, existingItems]);

  // Task 4.14: Handle generate PDF
  const handleGeneratePDFFromPanel = useCallback(async (scope: PrintScope) => {
    setIsPrinting(true);
    setPrintError(null);
    setPrintStatus('Generating PDF...');

    try {
      const itemsToInclude = getItemsForPrintScope(scope);
      await onGeneratePDF(itemsToInclude, scope);

      // Complete session with PDF action
      onSessionComplete({
        id: state.session.id,
        newItems: state.session.items,
        existingItems: existingItems,
        completedAt: new Date(),
        printAction: 'pdf',
        printScope: scope,
      });
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsPrinting(false);
      setPrintStatus(undefined);
    }
  }, [getItemsForPrintScope, onGeneratePDF, state.session, existingItems, onSessionComplete]);

  // Task 4.14: Handle print directly
  const handlePrintDirectFromPanel = useCallback(async (scope: PrintScope) => {
    setIsPrinting(true);
    setPrintError(null);
    setPrintStatus('Sending to printer...');

    try {
      const itemsToInclude = getItemsForPrintScope(scope);
      await onPrintDirect(itemsToInclude, scope);

      // Complete session with direct print action
      onSessionComplete({
        id: state.session.id,
        newItems: state.session.items,
        existingItems: existingItems,
        completedAt: new Date(),
        printAction: 'direct',
        printScope: scope,
      });
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : 'Failed to print');
    } finally {
      setIsPrinting(false);
      setPrintStatus(undefined);
    }
  }, [getItemsForPrintScope, onPrintDirect, state.session, existingItems, onSessionComplete]);

  // Task 4.14: Handle skip print from panel
  const handleSkipPrintFromPanel = useCallback(() => {
    onSessionComplete({
      id: state.session.id,
      newItems: state.session.items,
      existingItems: existingItems,
      completedAt: new Date(),
      printAction: 'skipped',
    });
  }, [state.session, existingItems, onSessionComplete]);

  // Task 4.14: Handle QR generation complete callback
  const handleQRGenerationComplete = useCallback((qrCodes: Map<string, string>) => {
    // Update session items with generated QR codes
    // Note: This could be enhanced with a dispatch to update state,
    // but for now the PrintOptionsPanel manages this internally
    console.log('QR codes generated:', qrCodes.size);
  }, []);

  // Task 4.14: Clear print error
  const handleClearPrintError = useCallback(() => {
    setPrintError(null);
  }, []);

  // Handle finish without print
  const handleFinishWithoutPrint = useCallback(() => {
    onSessionComplete({
      id: state.session.id,
      newItems: state.session.items,
      existingItems: existingItems,
      completedAt: new Date(),
      printAction: 'skipped',
    });
  }, [state.session, existingItems, onSessionComplete]);

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
        return (
          <SessionSummaryStep
            sessionItems={state.session.items}
            existingItems={existingItems}
            isLoadingExisting={isLoadingExisting}
            onEditItem={handleEditItem}
            onRemoveItem={removeSessionItem}
            onAddMoreItems={startNewItem}
            onProceedToPrint={handleProceedToPrint}
            onFinishWithoutPrint={handleFinishWithoutPrint}
          />
        );
      default:
        return <StepPlaceholder step={state.currentStep} {...commonProps} />;
    }
  }, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint]);

  return (
    <div className={cn("flex flex-col min-h-screen bg-white", className)}>
      <WorkflowHeader
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
        canGoBack={showPrintPanel ? true : canGoBack}
        onBack={showPrintPanel ? handleBackFromPrint : prevStep}
        onExit={handleExitClick}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {/* Task 4.14: Show PrintOptionsPanel when user proceeds to print */}
        {showPrintPanel ? (
          <PrintOptionsPanel
            sessionItems={state.session.items}
            existingItems={existingItems}
            onGeneratePDF={handleGeneratePDFFromPanel}
            onPrintDirect={handlePrintDirectFromPanel}
            onSkipPrint={handleSkipPrintFromPanel}
            isProcessing={isPrinting}
            processingStatus={printStatus}
            error={printError}
            onClearError={handleClearPrintError}
            onQRGenerationComplete={handleQRGenerationComplete}
          />
        ) : (
          renderCurrentStep()
        )}
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
