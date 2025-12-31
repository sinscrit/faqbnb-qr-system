/**
 * Unit Tests for Wizard Navigation Components
 *
 * Tests for ProgressIndicator, StepNavigation, and CaptureWizard components.
 *
 * @module ItemCapture/components/__tests__/wizard-navigation
 * @lastModified 2025-12-31 (REQ-033 Task 10)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressIndicator, getCurrentStageIndex, PROGRESS_STAGES } from '../shared/ProgressIndicator';
import { StepNavigation } from '../shared/StepNavigation';
import { CaptureWizard } from '../CaptureWizard';
import type { WizardStep } from '../../ItemCapture.types';

// =============================================================================
// ProgressIndicator Tests
// =============================================================================

describe('ProgressIndicator', () => {
  describe('getCurrentStageIndex', () => {
    it('returns 0 for metadata step', () => {
      expect(getCurrentStageIndex('metadata')).toBe(0);
    });

    it('returns 1 for content capture steps', () => {
      const contentSteps: WizardStep[] = ['content-type', 'capture-video', 'capture-photo', 'upload-file', 'write-text', 'add-more'];
      contentSteps.forEach(step => {
        expect(getCurrentStageIndex(step)).toBe(1);
      });
    });

    it('returns 2 for edit-media step', () => {
      expect(getCurrentStageIndex('edit-media')).toBe(2);
    });

    it('returns 3 for review step', () => {
      expect(getCurrentStageIndex('review')).toBe(3);
    });
  });

  describe('rendering', () => {
    it('displays correct step count on mobile', () => {
      render(<ProgressIndicator currentStep="metadata" />);
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('displays current step label on mobile', () => {
      render(<ProgressIndicator currentStep="metadata" />);
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders progress bar with correct width', () => {
      const { container } = render(<ProgressIndicator currentStep="content-type" />);
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows 4 stages on desktop', () => {
      render(<ProgressIndicator currentStep="metadata" />);
      PROGRESS_STAGES.forEach(stage => {
        expect(screen.getByText(stage.label)).toBeInTheDocument();
      });
    });

    it('updates step count for different steps', () => {
      const { rerender } = render(<ProgressIndicator currentStep="metadata" />);
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

      rerender(<ProgressIndicator currentStep="content-type" />);
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();

      rerender(<ProgressIndicator currentStep="edit-media" />);
      expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();

      rerender(<ProgressIndicator currentStep="review" />);
      expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<ProgressIndicator currentStep="metadata" className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has progressbar role with aria attributes', () => {
      render(<ProgressIndicator currentStep="metadata" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '25');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has descriptive aria-label on progressbar', () => {
      render(<ProgressIndicator currentStep="content-type" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Step 2 of 4: Content');
    });
  });
});

// =============================================================================
// StepNavigation Tests
// =============================================================================

describe('StepNavigation', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    onCancel: jest.fn(),
    canGoNext: true,
    canGoBack: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders Cancel button', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders Back button by default', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('hides Back button on first step', () => {
      render(<StepNavigation {...defaultProps} isFirstStep />);
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('shows Continue by default', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('shows Submit on last step', () => {
      render(<StepNavigation {...defaultProps} isLastStep />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('shows custom next label when provided', () => {
      render(<StepNavigation {...defaultProps} nextLabel="Save Draft" />);
      expect(screen.getByText('Save Draft')).toBeInTheDocument();
    });

    it('shows custom back label when provided', () => {
      render(<StepNavigation {...defaultProps} backLabel="Previous" />);
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<StepNavigation {...defaultProps} className="custom-nav" />);
      expect(container.firstChild).toHaveClass('custom-nav');
    });
  });

  describe('button states', () => {
    it('disables Next when canGoNext is false', () => {
      render(<StepNavigation {...defaultProps} canGoNext={false} />);
      expect(screen.getByText('Continue').closest('button')).toBeDisabled();
    });

    it('disables Back when canGoBack is false', () => {
      render(<StepNavigation {...defaultProps} canGoBack={false} />);
      expect(screen.getByText('Back').closest('button')).toBeDisabled();
    });

    it('disables all buttons when loading', () => {
      render(<StepNavigation {...defaultProps} isLoading />);
      expect(screen.getByText('Cancel').closest('button')).toBeDisabled();
      expect(screen.getByText('Back').closest('button')).toBeDisabled();
      expect(screen.getByText('Continue').closest('button')).toBeDisabled();
    });

    it('shows loading spinner when isLoading', () => {
      render(<StepNavigation {...defaultProps} isLoading />);
      const button = screen.getByText('Continue').closest('button');
      expect(button?.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('has minimum touch target height', () => {
      render(<StepNavigation {...defaultProps} />);
      const nextButton = screen.getByText('Continue').closest('button');
      expect(nextButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('interactions', () => {
    it('calls onNext when Continue is clicked', () => {
      render(<StepNavigation {...defaultProps} />);
      fireEvent.click(screen.getByText('Continue'));
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('calls onBack when Back is clicked', () => {
      render(<StepNavigation {...defaultProps} />);
      fireEvent.click(screen.getByText('Back'));
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel is clicked', () => {
      render(<StepNavigation {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onNext when button is disabled', () => {
      render(<StepNavigation {...defaultProps} canGoNext={false} />);
      const button = screen.getByText('Continue').closest('button');
      fireEvent.click(button!);
      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('does not call onBack when button is disabled', () => {
      render(<StepNavigation {...defaultProps} canGoBack={false} />);
      const button = screen.getByText('Back').closest('button');
      fireEvent.click(button!);
      expect(defaultProps.onBack).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has aria-label on Cancel button', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Cancel').closest('button')).toHaveAttribute('aria-label', 'Cancel and exit wizard');
    });

    it('has aria-label on Back button', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Back').closest('button')).toHaveAttribute('aria-label', 'Go to previous step');
    });

    it('has appropriate aria-label on Next button', () => {
      render(<StepNavigation {...defaultProps} />);
      expect(screen.getByText('Continue').closest('button')).toHaveAttribute('aria-label', 'Go to next step');
    });

    it('has submit aria-label on last step', () => {
      render(<StepNavigation {...defaultProps} isLastStep />);
      expect(screen.getByText('Submit').closest('button')).toHaveAttribute('aria-label', 'Submit item');
    });
  });
});

// =============================================================================
// CaptureWizard Tests
// =============================================================================

describe('CaptureWizard', () => {
  const defaultProps = {
    currentStep: 'metadata' as WizardStep,
    onNext: jest.fn(),
    onBack: jest.fn(),
    onCancel: jest.fn(),
    canGoNext: true,
    canGoBack: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders children in content area', () => {
      render(
        <CaptureWizard {...defaultProps}>
          <div data-testid="step-content">Step Content</div>
        </CaptureWizard>
      );
      expect(screen.getByTestId('step-content')).toBeInTheDocument();
    });

    it('renders progress indicator', () => {
      render(
        <CaptureWizard {...defaultProps}>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('renders navigation controls', () => {
      render(
        <CaptureWizard {...defaultProps}>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('hides Back button on first step (metadata)', () => {
      render(
        <CaptureWizard {...defaultProps} currentStep="metadata">
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('shows Back button on non-first steps', () => {
      render(
        <CaptureWizard {...defaultProps} currentStep="content-type" canGoBack>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('shows Submit on review step', () => {
      render(
        <CaptureWizard {...defaultProps} currentStep="review" canGoBack>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('step transitions', () => {
    it('updates progress indicator when step changes', () => {
      const { rerender } = render(
        <CaptureWizard {...defaultProps} currentStep="metadata">
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

      rerender(
        <CaptureWizard {...defaultProps} currentStep="content-type" canGoBack>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });

    it('updates navigation buttons when step changes', () => {
      const { rerender } = render(
        <CaptureWizard {...defaultProps} currentStep="metadata">
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.queryByText('Back')).not.toBeInTheDocument();

      rerender(
        <CaptureWizard {...defaultProps} currentStep="content-type" canGoBack>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has region role with aria-label', () => {
      render(
        <CaptureWizard {...defaultProps}>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Item capture wizard');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CaptureWizard {...defaultProps} className="custom-class">
          <div>Content</div>
        </CaptureWizard>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has minimum height', () => {
      const { container } = render(
        <CaptureWizard {...defaultProps}>
          <div>Content</div>
        </CaptureWizard>
      );
      expect(container.firstChild).toHaveClass('min-h-[500px]');
    });

    it('has card styling', () => {
      const { container } = render(
        <CaptureWizard {...defaultProps}>
          <div>Content</div>
        </CaptureWizard>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('bg-white');
      expect(wrapper).toHaveClass('rounded-lg');
      expect(wrapper).toHaveClass('shadow-sm');
      expect(wrapper).toHaveClass('border');
    });
  });

  describe('loading state', () => {
    it('passes loading state to navigation', () => {
      render(
        <CaptureWizard {...defaultProps} isLoading>
          <div>Content</div>
        </CaptureWizard>
      );
      const continueButton = screen.getByText('Continue').closest('button');
      expect(continueButton).toBeDisabled();
      expect(continueButton?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });
});
