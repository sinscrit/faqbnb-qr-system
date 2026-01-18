'use client';

/**
 * ProgressIndicator Component
 *
 * Displays visual progress through the ItemCapture wizard.
 * - Mobile: Simple progress bar with step count
 * - Desktop: Step indicators with labels and connector lines
 *
 * @module ItemCapture/components/shared/ProgressIndicator
 * @lastModified 2026-01-12 (REQ-188: Added 'whats-next' step support)
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from '../../ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Step definition for progress display.
 * Maps wizard steps to user-friendly labels.
 */
export interface StepDefinition {
  /** Unique stage identifier */
  id: string;
  /** Display label for desktop view */
  label: string;
  /** Short label for mobile view */
  shortLabel?: string;
}

/**
 * Props for the ProgressIndicator component.
 */
export interface ProgressIndicatorProps {
  /** Current active wizard step */
  currentStep: WizardStep;
  /** Optional CSS class for customization */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Simplified stages for progress display.
 * Multiple wizard steps map to single display stages.
 */
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];

/**
 * Maps internal wizard steps to display stage indices.
 * Used to determine which progress stage to highlight.
 * Steps with index -1 are post-workflow and hide the progress indicator.
 */
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
  'whats-next': -1,     // Post-workflow: not displayed in progress indicator
};

/**
 * Gets the display stage index for a given wizard step.
 * @param step - Current wizard step
 * @returns Zero-based stage index (0-3), or -1 for post-workflow steps
 *          that should not be displayed in the progress indicator
 */
export function getCurrentStageIndex(step: WizardStep): number {
  return STEP_TO_STAGE_INDEX[step] ?? 0;
}

// =============================================================================
// Component
// =============================================================================

/**
 * ProgressIndicator displays the user's position in the wizard flow.
 *
 * Features:
 * - Mobile: Compact progress bar with step count text
 * - Desktop: Visual step indicators with checkmarks for completed stages
 * - Smooth transitions between steps
 * - Full ARIA accessibility support
 * - Hides automatically for post-workflow steps (e.g., 'whats-next')
 *
 * @example
 * ```tsx
 * <ProgressIndicator currentStep="content-type" />
 * ```
 */
export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  // Hide progress indicator for post-workflow steps
  // These steps have index -1 in STEP_TO_STAGE_INDEX
  if (currentStep === 'whats-next') {
    return null;
  }

  const currentIndex = getCurrentStageIndex(currentStep);
  const totalStages = PROGRESS_STAGES.length;
  const progressPercent = ((currentIndex + 1) / totalStages) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Step {currentIndex + 1} of {totalStages}</span>
          <span className="font-medium">{PROGRESS_STAGES[currentIndex]?.label}</span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-1.5"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${currentIndex + 1} of ${totalStages}: ${PROGRESS_STAGES[currentIndex]?.label}`}
        >
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden md:flex items-center justify-between">
        {PROGRESS_STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={stage.id}>
              {/* Step indicator */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                    isActive && "border-blue-600 bg-blue-600 text-white",
                    isCompleted && "border-green-600 bg-green-600 text-white",
                    !isActive && !isCompleted && "border-gray-300 bg-white text-gray-500"
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-500"
                  )}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line (except last) */}
              {index < PROGRESS_STAGES.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressIndicator;
