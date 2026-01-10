'use client';

/**
 * NextActionStep Component
 * Step 8 of ItemCreationWorkflow - Decision point after content creation.
 * Presents exactly three options: Review & Submit, Add More Content, or Cancel.
 *
 * @module ItemCreationWorkflow/components/steps/NextActionStep
 * @see docs/REQ-166-fix-nextactionstep-overview.md
 * @lastModified 2026-01-10 (REQ-166 Fix NextActionStep)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, Plus, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionProgressBar } from '../shared/SessionProgressBar';
import { useFocusTrap } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for the ActionCard internal sub-component.
 */
interface ActionCardProps {
  /** Icon component or element */
  icon: React.ReactNode;
  /** Background color for icon circle */
  iconBgColor: string;
  /** Action title */
  title: string;
  /** Action description */
  description: string;
  /** Click handler */
  onClick: () => void;
  /** Optional additional styles */
  className?: string;
}

/**
 * Props for the NextActionStep component.
 */
export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Whether user has added any content that would be lost on cancel */
  hasUnsavedContent: boolean;
  /** Callback when user selects "Review & Submit" */
  onReviewSubmit: () => void;
  /** Callback when user selects "Add More Content" */
  onAddMoreContent: () => void;
  /** Callback when user confirms cancel action */
  onCancel: () => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// ActionCard Sub-Component
// =============================================================================

/**
 * Internal ActionCard component for displaying action options.
 * Provides consistent styling and accessibility for all action cards.
 */
function ActionCard({
  icon,
  iconBgColor,
  title,
  description,
  onClick,
  className,
}: ActionCardProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${title}: ${description}`}
      className={cn(
        // Base styles
        'border border-gray-200 rounded-lg p-4 md:p-6',
        'flex items-start gap-4',
        'cursor-pointer select-none',
        // Hover and focus states
        'hover:bg-gray-50 transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
        // Touch-friendly min height
        'min-h-[80px]',
        className
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
          iconBgColor
        )}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-[#222222]">{title}</h3>
        <p className="text-sm text-[#717171] mt-1">{description}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function NextActionStep({
  itemsCreated,
  hasUnsavedContent,
  onReviewSubmit,
  onAddMoreContent,
  onCancel,
  className,
}: NextActionStepProps) {
  // State for cancel confirmation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Refs for keyboard navigation and focus management
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepWorkingButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for the dialog
  useFocusTrap(dialogRef, showCancelDialog);

  // Handle Cancel card click - show dialog if unsaved content, otherwise cancel directly
  const handleCancelClick = useCallback(() => {
    if (hasUnsavedContent) {
      setShowCancelDialog(true);
    } else {
      // No unsaved content, cancel immediately
      onCancel();
    }
  }, [hasUnsavedContent, onCancel]);

  // Handle confirm cancel from dialog
  const handleConfirmCancel = useCallback(() => {
    setShowCancelDialog(false);
    onCancel();
  }, [onCancel]);

  // Handle keep working from dialog
  const handleKeepWorking = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  // Auto-focus "Keep Working" button when dialog opens
  useEffect(() => {
    if (showCancelDialog && keepWorkingButtonRef.current) {
      requestAnimationFrame(() => {
        keepWorkingButtonRef.current?.focus();
      });
    }
  }, [showCancelDialog]);

  // Handle arrow key navigation between cards
  const handleContainerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const currentIndex = cardRefs.current.findIndex(
        (ref) => ref === document.activeElement
      );

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, cardRefs.current.length - 1);
        cardRefs.current[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        cardRefs.current[prevIndex]?.focus();
      }
    },
    []
  );

  // Set ref for a card at a specific index
  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  // Fixed array of exactly three action cards
  const cards = [
    {
      key: 'review-submit',
      icon: <Check className="w-6 h-6 text-green-600" aria-hidden="true" />,
      iconBgColor: 'bg-green-100',
      title: 'Review & Submit',
      description: 'Review your content and submit this item',
      onClick: onReviewSubmit,
    },
    {
      key: 'add-more-content',
      icon: <Plus className="w-6 h-6 text-blue-600" aria-hidden="true" />,
      iconBgColor: 'bg-blue-100',
      title: 'Add More Content',
      description: 'Add another video, photo, or document',
      onClick: onAddMoreContent,
    },
    {
      key: 'cancel',
      icon: <X className="w-6 h-6 text-red-600" aria-hidden="true" />,
      iconBgColor: 'bg-red-100',
      title: 'Cancel',
      description: 'Discard changes and exit',
      onClick: handleCancelClick,
    },
  ];

  return (
    <div
      className={cn('flex flex-col gap-6 p-4 md:p-6', className)}
      aria-label="Choose your next action"
    >
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#222222]">What's Next?</h2>
        <p className="text-[#717171] mt-2">
          Choose what you'd like to do next
        </p>
      </div>

      {/* Session Progress */}
      <div role="status" aria-live="polite">
        <SessionProgressBar itemsCreated={itemsCreated} />
      </div>

      {/* Action Cards Container */}
      <div
        role="group"
        aria-label="Action options"
        className="flex flex-col gap-3"
        onKeyDown={handleContainerKeyDown}
      >
        {cards.map((card, index) => (
          <div key={card.key} ref={setCardRef(index)}>
            <ActionCard
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              title={card.title}
              description={card.description}
              onClick={card.onClick}
            />
          </div>
        ))}
      </div>

      {/* Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        Step: What's Next? - {itemsCreated} items created in this session.
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div
          ref={dialogRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && handleKeepWorking()}
          onKeyDown={(e) => e.key === 'Escape' && handleKeepWorking()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-description"
        >
          <div
            className={cn(
              "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
              "animate-in fade-in zoom-in-95 duration-200",
              "motion-reduce:animate-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with warning icon */}
            <div className="flex items-start gap-4 p-6 pb-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3
                  id="cancel-dialog-title"
                  className="text-lg font-semibold text-[#222222]"
                >
                  Cancel Item Creation?
                </h3>
                <p
                  id="cancel-dialog-description"
                  className="mt-2 text-sm text-[#717171]"
                >
                  You will lose any unsaved content. Are you sure you want to cancel?
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
              <button
                ref={keepWorkingButtonRef}
                type="button"
                onClick={handleKeepWorking}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
                  "text-gray-700 bg-gray-100",
                  "hover:bg-gray-200 active:bg-gray-300",
                  "transition-colors duration-150",
                  "motion-reduce:transition-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                )}
              >
                Keep Working
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
                  "text-white bg-red-500",
                  "hover:bg-red-600 active:bg-red-700",
                  "transition-colors duration-150",
                  "motion-reduce:transition-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                )}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NextActionStep;
