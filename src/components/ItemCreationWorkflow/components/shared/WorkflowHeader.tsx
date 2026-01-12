'use client';

/**
 * WorkflowHeader Component
 *
 * Displays workflow progress and navigation controls at the top of
 * each workflow step. Shows progress bar, step indicator, back button,
 * and exit button for consistent navigation UX.
 *
 * @example
 * ```tsx
 * <WorkflowHeader
 *   currentStepIndex={2}
 *   totalSteps={9}
 *   progressPercent={25}
 *   canGoBack={true}
 *   onBack={() => prevStep()}
 *   onExit={() => setShowExitDialog(true)}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/WorkflowHeader
 * @see ItemCreationWorkflow for usage context
 * @lastModified 2026-01-12 (REQ-198 Hide step counter on post-workflow screens)
 */

import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface WorkflowHeaderProps {
  /** Current step index (0-based) */
  currentStepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Whether back navigation is available */
  canGoBack: boolean;
  /** Called when back button is clicked */
  onBack: () => void;
  /** Called when close/exit button is clicked */
  onExit?: () => void;
  /** Optional CSS class name */
  className?: string;
  /**
   * Whether to show the step counter and progress bar.
   * Set to false for post-workflow screens (next-action, session-summary).
   * @default true
   */
  showStepCounter?: boolean;
}

// =============================================================================
// Main Component
// =============================================================================

export function WorkflowHeader({
  currentStepIndex,
  totalSteps,
  progressPercent,
  canGoBack,
  onBack,
  onExit,
  className,
  showStepCounter = true,
}: WorkflowHeaderProps) {
  return (
    <header
      className={cn(
        "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* Progress bar - conditionally rendered (REQ-198) */}
      {showStepCounter && (
        <div
          className="w-full h-1 bg-gray-200"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: '#FF385C', // Airbnb brand primary
            }}
          />
        </div>
      )}

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <div className="w-12">
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex items-center justify-center w-12 h-12",
                "rounded-lg text-gray-700",
                "hover:bg-gray-100 active:bg-gray-200",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
              )}
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Step indicator - conditionally rendered (REQ-198) */}
        {showStepCounter ? (
          <div className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}

        {/* Exit button */}
        <div className="w-12">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className={cn(
                "flex items-center justify-center w-12 h-12",
                "rounded-lg text-gray-700",
                "hover:bg-gray-100 active:bg-gray-200",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
              )}
              aria-label="Exit workflow"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default WorkflowHeader;
