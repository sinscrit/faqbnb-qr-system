'use client';

/**
 * ItemCreationWorkflow Component
 *
 * Main orchestrator component for the multi-step item creation workflow.
 * Manages step navigation, state, and integration with ItemCapture component.
 *
 * Workflow Steps (REQ-176):
 * 1. room-selection → 2. item-type-selection → 3. specific-item-selection →
 * 4. purpose-selection → 5. content-type-selection → 6. media-capture (NEW) →
 * 7. content-creation (DEPRECATED) → 8. preview-save → 9. next-action → 10. session-summary
 *
 * Key Changes (Plan-094):
 * - Added step 4 (purpose-selection) for content purpose/intent
 * - Removed content-source-selection step (consolidated into content-type-selection)
 * - Updated step rendering for PurposeStep component
 * - Updated progress calculation for new step order
 *
 * Key Changes (REQ-176):
 * - Added step 6 (media-capture) for direct routing to capture components
 * - Deprecated content-creation step (kept for backward compatibility)
 * - MediaCaptureStep routes to appropriate adapter based on content type/source
 *
 * @module ItemCreationWorkflow/ItemCreationWorkflow
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md
 * @see docs/req-176-media-capture-step-detailed.md
 * @see useWorkflowState hook for state machine logic
 * @lastModified 2026-01-12 (REQ-198 Hide step counter on post-workflow screens)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ItemCreationWorkflowProps, PrintScope } from './ItemCreationWorkflow.types';
import { useWorkflowState } from './hooks';
import { WorkflowHeader, ConfirmExitDialog, PrintOptionsPanel, SessionRecoveryBanner } from './components/shared';
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentTypeStep, MediaCaptureStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
import type { SessionItem, CurrentItemState, ContentType } from './ItemCreationWorkflow.types';
import { loadMostRecentWorkflowState, getContentNeedingReUpload, clearAllWorkflowStates } from './utils/sessionStorage';
import { useAnnounce, STEP_NAMES, getStepAnnouncement } from './utils/accessibility';
import { generateUUID } from '@/components/ItemCapture/utils/generateUUID';
import { POST_WORKFLOW_SCREENS } from './utils/constants';

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
    setTags,
    selectPurpose,
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

  // REQ-198: Determine if current step is a post-workflow screen
  // Post-workflow screens (next-action, session-summary) should not show step counter
  const isPostWorkflow = (POST_WORKFLOW_SCREENS as readonly string[]).includes(state.currentStep);

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

  // Task 5.3 (REQ-113): Session recovery state
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [recoveredItemCount, setRecoveredItemCount] = useState(0);
  const [contentNeedingReUpload, setContentNeedingReUpload] = useState(0);

  // REQ-114: Accessibility - refs and hooks for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<string>(state.currentStep);
  const { announce } = useAnnounce();

  // Task 5.3: Check for recoverable session on mount
  useEffect(() => {
    // Only check on initial mount when no items exist
    if (itemCount === 0 && state.currentStep === 'room-selection') {
      const recoveredState = loadMostRecentWorkflowState();
      if (recoveredState && recoveredState.session?.items && recoveredState.session.items.length > 0) {
        const itemsToRecover = recoveredState.session.items.length;
        const reUploadCount = getContentNeedingReUpload(recoveredState);
        setRecoveredItemCount(itemsToRecover);
        setContentNeedingReUpload(reUploadCount);
        setShowRecoveryBanner(true);
      }
    }
  }, []); // Only run once on mount

  // REQ-114: Announce step changes to screen readers and manage focus
  useEffect(() => {
    // Only announce if step actually changed
    if (previousStepRef.current !== state.currentStep) {
      const stepName = STEP_NAMES[state.currentStep] || state.currentStep;
      const announcement = getStepAnnouncement(currentStepIndex + 1, totalSteps, stepName);
      announce(announcement);

      // Focus main content area for keyboard navigation
      if (mainContentRef.current) {
        // Find the first heading in the step content and focus it
        const heading = mainContentRef.current.querySelector('h2, h3, [role="heading"]');
        if (heading && heading instanceof HTMLElement) {
          // Make heading focusable if it isn't already
          if (!heading.hasAttribute('tabindex')) {
            heading.setAttribute('tabindex', '-1');
          }
          heading.focus();
        }
      }

      previousStepRef.current = state.currentStep;
    }
  }, [state.currentStep, currentStepIndex, totalSteps, announce]);

  // Task 5.3: Handle continue with recovered session
  const handleRecoveryContinue = useCallback(() => {
    // The session has already been loaded by the useWorkflowState hook
    // We just need to dismiss the banner
    setShowRecoveryBanner(false);
  }, []);

  // Task 5.3: Handle start fresh (clear recovered session)
  const handleRecoveryStartFresh = useCallback(() => {
    clearAllWorkflowStates();
    reset();
    setShowRecoveryBanner(false);
  }, [reset]);

  // Task 5.3: Handle recovery banner dismiss
  const handleRecoveryDismiss = useCallback(() => {
    setShowRecoveryBanner(false);
  }, []);

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
      purpose: null,  // Reset purpose when adding more content
      contentSource: 'existing',
      contentType: null,
      content: lastItem.content,
      tags: lastItem.tags || [],
    };

    addMoreToItem(restoredItem);
  }, [state.session.items, addMoreToItem]);

  // REQ-162: Handle unified content selection
  const handleUnifiedContentSelect = useCallback((
    contentType: ContentType | 'file-upload',
    contentSource: 'existing' | 'create-new'
  ) => {
    selectContentSource(contentSource);
    if (contentType !== 'file-upload') {
      selectContentType(contentType as ContentType);
    }
    // For 'file-upload', contentType will be determined by FileUploadStep
  }, [selectContentSource, selectContentType]);

  // Handle save item
  const handleSaveItem = useCallback(async () => {
    if (!state.currentItem) {
      throw new Error('No current item to save');
    }

    setIsSaving(true);
    try {
      const sessionItem: SessionItem = {
        id: generateUUID(),
        name: state.currentItem.itemName,
        room: state.currentItem.room,
        itemType: state.currentItem.itemType,
        content: state.currentItem.content,
        tags: state.currentItem.tags || [],
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

  // Task 6.4.7: Handle PDF generation complete callback
  const handlePDFGenerated = useCallback((
    items: SessionItem[],
    scope: PrintScope,
    blob: Blob
  ) => {
    // Track that PDF was generated in session state for analytics
    console.log(`PDF generated with ${items.length} items, scope: ${scope.type}`);
    // Could also emit analytics event here if needed
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
      case 'purpose-selection':
        return (
          <PurposeStep
            currentPurpose={state.currentItem?.purpose ?? null}
            onSelectPurpose={selectPurpose}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'content-type-selection':
        return (
          <ContentTypeStep
            currentSelection={state.currentItem?.contentType ?? null}
            onSelectContent={handleUnifiedContentSelect}
            onNext={nextStep}
            canNext={canGoNext}
          />
        );
      case 'media-capture':
        return (
          <MediaCaptureStep
            currentItem={state.currentItem!}
            onAddContent={addContentPiece}
            onComplete={() => goToStep('preview-save')}
            onBack={() => goToStep('content-type-selection')}
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
            onUpdateTags={setTags}
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
        // Determine if user has unsaved content that would be lost on cancel
        const hasUnsavedContent = state.currentItem !== null && (
          state.currentItem.content.length > 0 || state.isDirty
        );
        return (
          <NextActionStep
            itemsCreated={itemCount}
            hasUnsavedContent={hasUnsavedContent}
            onReviewSubmit={() => {
              // If currentItem is null (already saved), go to session summary or exit
              if (state.currentItem === null) {
                // Item was already saved, go to session summary to review all items
                goToStep('session-summary');
              } else {
                goToStep('preview-save');
              }
            }}
            onAddMoreContent={() => goToStep('content-type-selection')}
            onCancel={handleExitClick}
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
  }, [state.currentStep, state.currentItem, state.session.items, state.isDirty, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectPurpose, handleUnifiedContentSelect, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, startNewItem, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint, handleExitClick]);

  return (
    <div className={cn("flex flex-col min-h-screen bg-white", className)}>
      {/* REQ-114: Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'absolute top-4 left-4 z-50',
          'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
        )}
      >
        Skip to main content
      </a>

      {/* REQ-198: Hide step counter on post-workflow screens */}
      <WorkflowHeader
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
        canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}
        onBack={showPrintPanel ? handleBackFromPrint : prevStep}
        onExit={handleExitClick}
        showStepCounter={!isPostWorkflow}
      />

      {/* Task 5.3 (REQ-113): Session recovery banner */}
      {showRecoveryBanner && (
        <div className="px-4 pt-4">
          <SessionRecoveryBanner
            itemCount={recoveredItemCount}
            contentNeedingReUpload={contentNeedingReUpload}
            onContinue={handleRecoveryContinue}
            onStartFresh={handleRecoveryStartFresh}
            onDismiss={handleRecoveryDismiss}
            autoDismiss={true}
            autoDismissDelay={10000}
          />
        </div>
      )}

      {/* Main content area */}
      <main
        id="main-content"
        ref={mainContentRef}
        className="flex-1 flex flex-col"
        tabIndex={-1}
      >
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
            onPDFGenerated={handlePDFGenerated}
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
