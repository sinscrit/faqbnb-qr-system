'use client';

/**
 * StepNavigation Component
 *
 * Provides navigation controls for the ItemCapture wizard.
 * Includes Cancel, Back, and Next/Submit buttons with appropriate
 * disabled states and loading indicators.
 *
 * @module ItemCapture/components/shared/StepNavigation
 * @lastModified 2025-12-31 (REQ-033 Tasks 5-6)
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the StepNavigation component.
 */
export interface StepNavigationProps {
  /** Callback for next/continue action */
  onNext: () => void;
  /** Callback for back action */
  onBack: () => void;
  /** Callback for cancel action */
  onCancel: () => void;
  /** Whether next button is enabled */
  canGoNext: boolean;
  /** Whether back button is enabled/visible */
  canGoBack: boolean;
  /** Whether this is the first step (hide back) */
  isFirstStep?: boolean;
  /** Whether this is the last step (show submit instead of next) */
  isLastStep?: boolean;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Custom label for next button (default: "Continue" or "Submit") */
  nextLabel?: string;
  /** Custom label for back button (default: "Back") */
  backLabel?: string;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * StepNavigation provides the wizard navigation controls.
 *
 * Features:
 * - Cancel button always visible on left
 * - Back button hidden on first step
 * - Next button shows "Continue" or "Submit" based on step
 * - Loading state with spinner
 * - Disabled states with reduced opacity
 * - Minimum 44px touch targets for accessibility
 *
 * @example
 * ```tsx
 * <StepNavigation
 *   onNext={() => goNext()}
 *   onBack={() => goBack()}
 *   onCancel={() => closeWizard()}
 *   canGoNext={isFormValid}
 *   canGoBack={!isFirstStep}
 *   isFirstStep={currentStep === 'metadata'}
 *   isLastStep={currentStep === 'review'}
 * />
 * ```
 */
export function StepNavigation({
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  nextLabel,
  backLabel = 'Back',
  className,
}: StepNavigationProps) {
  const resolvedNextLabel = nextLabel || (isLastStep ? 'Submit' : 'Continue');

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left side: Cancel */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Cancel and exit wizard"
      >
        Cancel
      </button>

      {/* Right side: Back + Next */}
      <div className="flex items-center space-x-3">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center min-h-[44px]"
            aria-label="Go to previous step"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            {backLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center min-h-[44px]"
          aria-label={isLastStep ? "Submit item" : "Go to next step"}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
          {resolvedNextLabel}
          {!isLoading && !isLastStep && <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />}
          {!isLoading && isLastStep && <Check className="w-4 h-4 ml-2" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export default StepNavigation;
