'use client';

/**
 * SessionSummaryStep Component - Step 9 (final step) of the workflow
 *
 * Displays all items created in the current session with options
 * to add more items, proceed to printing, or finish without printing.
 * Shows session progress and allows item removal/editing.
 *
 * ## Features
 * - Session progress bar with item count
 * - Collapsible existing items section
 * - Item removal with confirmation dialog
 * - Print options integration
 *
 * @example
 * ```tsx
 * <SessionSummaryStep
 *   sessionItems={session.items}
 *   existingItems={existingItems}
 *   onAddMore={startNewItem}
 *   onProceedToPrint={() => setShowPrintOptions(true)}
 *   onFinish={handleComplete}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/steps/SessionSummaryStep
 * @see PrintOptionsPanel for print configuration
 * @lastModified 2026-01-22 (REQ-E02-065 i18n Integration)
 */

import { useState, useCallback } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp, Plus, Printer, SkipForward, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { TranslationFn } from '@/types/i18n';
import type { SessionItem } from '../../ItemCreationWorkflow.types';
import { SessionProgressBar } from '../shared/SessionProgressBar';
import { SessionItemCard } from '../shared/SessionItemCard';
import { RemoveItemDialog } from '../shared/RemoveItemDialog';

// =============================================================================
// Type Definitions
// =============================================================================

export interface SessionSummaryStepProps {
  /** Items created in the current session */
  sessionItems: SessionItem[];
  /** Previously existing items (from database) */
  existingItems?: SessionItem[];
  /** Whether existing items are being loaded */
  isLoadingExisting?: boolean;
  /** Callback when user clicks edit on an item */
  onEditItem: (itemId: string) => void;
  /** Callback when user removes an item */
  onRemoveItem: (itemId: string) => void;
  /** Callback when user wants to add more items */
  onAddMoreItems: () => void;
  /** Callback when user wants to proceed to print */
  onProceedToPrint: () => void;
  /** Callback when user wants to finish without printing */
  onFinishWithoutPrint: () => void;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Empty State Component
// =============================================================================

interface EmptySessionStateProps {
  onAddItem: () => void;
  /** Translation function for sessionSummary namespace (REQ-E02-065) */
  t: TranslationFn;
}

function EmptySessionState({ onAddItem, t }: EmptySessionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-[#222222] mb-2">
        {t('empty.title')}
      </h3>
      <p className="text-[#717171] mb-6 max-w-sm">
        {t('empty.description')}
      </p>
      <button
        type="button"
        onClick={onAddItem}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
          'bg-[#FF385C] text-white font-medium',
          'hover:bg-[#E31C5F] active:bg-[#C81856]',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
          'min-h-[48px]'
        )}
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        {t('empty.addButton')}
      </button>
    </div>
  );
}

// =============================================================================
// Loading Skeleton Component
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
          <div className="w-12 h-12 rounded-md bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function SessionSummaryStep({
  sessionItems,
  existingItems = [],
  isLoadingExisting = false,
  onEditItem,
  onRemoveItem,
  onAddMoreItems,
  onProceedToPrint,
  onFinishWithoutPrint,
  className,
}: SessionSummaryStepProps) {
  // Translation hooks (REQ-E02-065)
  const t = useTranslations('workflow.steps.sessionSummary');

  // State for collapsible existing items section
  const [isExistingExpanded, setIsExistingExpanded] = useState(false);

  // State for remove confirmation dialog
  const [itemToRemove, setItemToRemove] = useState<SessionItem | null>(null);

  // Handle remove button click - show confirmation dialog
  const handleRemoveClick = useCallback((itemId: string) => {
    const item = sessionItems.find(i => i.id === itemId);
    if (item) {
      setItemToRemove(item);
    }
  }, [sessionItems]);

  // Handle confirm removal
  const handleConfirmRemove = useCallback(() => {
    if (itemToRemove) {
      onRemoveItem(itemToRemove.id);
      setItemToRemove(null);
    }
  }, [itemToRemove, onRemoveItem]);

  // Handle cancel removal
  const handleCancelRemove = useCallback(() => {
    setItemToRemove(null);
  }, []);

  const hasSessionItems = sessionItems.length > 0;
  const hasExistingItems = existingItems.length > 0;

  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        {/* Page Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#222222]">{t('header.title')}</h2>
          <p className="text-base text-[#717171] mt-2">
            {t('header.subtitle')}
          </p>
        </div>

        {/* Session Progress */}
        <div role="status" aria-live="polite">
          <SessionProgressBar itemsCreated={sessionItems.length} />
        </div>

        {/* New Items Section */}
        <section aria-labelledby="new-items-heading">
          <h3
            id="new-items-heading"
            className="text-lg font-semibold text-[#222222] mb-3"
          >
            {t('newItems.title', { count: sessionItems.length })}
          </h3>

          {hasSessionItems ? (
            <div className="space-y-3 border-l-2 border-[#FF385C] pl-4">
              {sessionItems.map((item) => (
                <SessionItemCard
                  key={item.id}
                  item={item}
                  isNew={true}
                  onEdit={onEditItem}
                  onRemove={handleRemoveClick}
                />
              ))}
            </div>
          ) : (
            <EmptySessionState onAddItem={onAddMoreItems} t={t} />
          )}

          {/* Add More Items Button */}
          {hasSessionItems && (
            <button
              type="button"
              onClick={onAddMoreItems}
              className={cn(
                'mt-4 w-full inline-flex items-center justify-center gap-2',
                'px-4 py-3 rounded-lg',
                'border-2 border-dashed border-gray-300',
                'text-[#717171] font-medium',
                'hover:border-[#FF385C] hover:text-[#FF385C]',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                'min-h-[48px]'
              )}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              {t('newItems.addMore')}
            </button>
          )}
        </section>

        {/* Previously Created Items Section (Collapsible) */}
        {(hasExistingItems || isLoadingExisting) && (
          <Collapsible.Root
            open={isExistingExpanded}
            onOpenChange={setIsExistingExpanded}
            asChild
          >
            <section aria-labelledby="existing-items-heading">
              <Collapsible.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    'w-full flex items-center justify-between',
                    'py-3 px-4 rounded-lg',
                    'bg-gray-50 hover:bg-gray-100',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                    'min-h-[48px]'
                  )}
                  aria-expanded={isExistingExpanded}
                >
                  <h3
                    id="existing-items-heading"
                    className="text-lg font-semibold text-[#222222]"
                  >
                    {t('existingItems.title', { count: existingItems.length })}
                  </h3>
                  {isExistingExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#717171]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#717171]" aria-hidden="true" />
                  )}
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="mt-3">
                {isLoadingExisting ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {existingItems.map((item) => (
                      <SessionItemCard
                        key={item.id}
                        item={item}
                        isNew={false}
                        onEdit={onEditItem}
                        // No onRemove for existing items
                      />
                    ))}
                  </div>
                )}
              </Collapsible.Content>
            </section>
          </Collapsible.Root>
        )}
      </div>

      {/* Sticky Footer with Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 space-y-3">
        {/* Print QR Codes Button */}
        <button
          type="button"
          onClick={onProceedToPrint}
          disabled={!hasSessionItems}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2',
            'px-6 py-3 rounded-lg',
            'bg-[#FF385C] text-white font-medium',
            'hover:bg-[#E31C5F] active:bg-[#C81856]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          <Printer className="w-5 h-5" aria-hidden="true" />
          {t('actions.printQRCodes')}
        </button>

        {/* Skip & Finish Button */}
        <button
          type="button"
          onClick={onFinishWithoutPrint}
          disabled={!hasSessionItems}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2',
            'px-6 py-3 rounded-lg',
            'border border-gray-300 text-[#717171] font-medium',
            'hover:bg-gray-50 hover:text-[#222222]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          <SkipForward className="w-5 h-5" aria-hidden="true" />
          {t('actions.skipFinish')}
        </button>
      </div>

      {/* Remove Confirmation Dialog */}
      <RemoveItemDialog
        isOpen={itemToRemove !== null}
        itemName={itemToRemove?.name || ''}
        onClose={handleCancelRemove}
        onConfirmRemove={handleConfirmRemove}
      />

      {/* Screen Reader Announcements (REQ-E02-065) */}
      <div aria-live="polite" className="sr-only">
        {t('announcements.stepSummary', { count: sessionItems.length })}
      </div>
    </div>
  );
}

export default SessionSummaryStep;
