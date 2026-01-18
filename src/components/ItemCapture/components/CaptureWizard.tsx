'use client';

/**
 * CaptureWizard Component
 *
 * Container component that combines the progress indicator, step content,
 * and navigation controls into a cohesive wizard interface.
 *
 * @module ItemCapture/components/CaptureWizard
 * @lastModified 2025-12-31 (REQ-033 Tasks 7-8)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './shared/ProgressIndicator';
import { StepNavigation } from './shared/StepNavigation';
import type { WizardStep } from '../ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the CaptureWizard container component.
 */
export interface CaptureWizardProps {
  /** Current wizard step */
  currentStep: WizardStep;
  /** Navigation callback for next action */
  onNext: () => void;
  /** Navigation callback for back action */
  onBack: () => void;
  /** Navigation callback for cancel action */
  onCancel: () => void;
  /** Whether next navigation is allowed */
  canGoNext: boolean;
  /** Whether back navigation is allowed */
  canGoBack: boolean;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Step content to render */
  children: React.ReactNode;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * CaptureWizard is the main container for the item capture wizard.
 *
 * Features:
 * - Fixed header with progress indicator
 * - Scrollable content area for step components
 * - Fixed footer with navigation controls
 * - Minimum height ensures consistent layout
 * - Responsive padding for mobile/desktop
 * - ARIA region for accessibility
 *
 * Layout:
 * ```
 * ┌─────────────────────────┐
 * │  Progress Indicator     │  <- Fixed header
 * ├─────────────────────────┤
 * │                         │
 * │   Step Content          │  <- Scrollable content
 * │   (children)            │
 * │                         │
 * ├─────────────────────────┤
 * │  Cancel    [Back] [Next]│  <- Fixed footer
 * └─────────────────────────┘
 * ```
 *
 * @example
 * ```tsx
 * <CaptureWizard
 *   currentStep={state.currentStep}
 *   onNext={handleNext}
 *   onBack={handleBack}
 *   onCancel={handleCancel}
 *   canGoNext={isStepValid}
 *   canGoBack={canNavigateBack}
 * >
 *   <MetadataStep />
 * </CaptureWizard>
 * ```
 */
export function CaptureWizard({
  currentStep,
  onNext,
  onBack,
  onCancel,
  canGoNext,
  canGoBack,
  isLoading = false,
  children,
  className,
}: CaptureWizardProps) {
  const isFirstStep = currentStep === 'metadata';
  const isLastStep = currentStep === 'review';

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col",
        className
      )}
      role="region"
      aria-label="Item capture wizard"
    >
      {/* Header with progress indicator */}
      <div className="px-4 py-4 md:px-6 border-b border-gray-200">
        <ProgressIndicator currentStep={currentStep} />
      </div>

      {/* Step content area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </div>

      {/* Footer with navigation */}
      <div className="px-4 py-4 md:px-6 border-t border-gray-200">
        <StepNavigation
          onNext={onNext}
          onBack={onBack}
          onCancel={onCancel}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default CaptureWizard;
