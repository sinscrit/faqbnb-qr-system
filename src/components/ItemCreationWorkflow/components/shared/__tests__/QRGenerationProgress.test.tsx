/**
 * QRGenerationProgress Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/QRGenerationProgress
 * @see docs/REQ-111-qr-code-integration-overview.md
 * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRGenerationProgress } from '../QRGenerationProgress';
import type { QRProgressItem, QRGenerationProgressProps } from '../QRGenerationProgress';

// =============================================================================
// Test Fixtures
// =============================================================================

const createMockItem = (
  id: string,
  name: string,
  status: QRProgressItem['status']
): QRProgressItem => ({
  id,
  name,
  status,
  qrCodeUrl: status === 'completed' ? `qr-${id}` : undefined,
});

const createDefaultProps = (overrides?: Partial<QRGenerationProgressProps>): QRGenerationProgressProps => ({
  isGenerating: false,
  progress: 0,
  stats: { total: 0, completed: 0, failed: 0, remaining: 0 },
  items: [],
  error: null,
  ...overrides,
});

// =============================================================================
// Test Suites
// =============================================================================

describe('QRGenerationProgress', () => {
  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders nothing when items array is empty', () => {
      const { container } = render(
        <QRGenerationProgress {...createDefaultProps()} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders progress bar and item list when items exist', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Item 1', 'pending')],
            stats: { total: 1, completed: 0, failed: 0, remaining: 1 },
          })}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('displays correct progress percentage', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            progress: 50,
            items: [createMockItem('1', 'Item 1', 'completed')],
            stats: { total: 2, completed: 1, failed: 0, remaining: 1 },
          })}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  // ===========================================================================
  // Progress Bar Status Message Tests
  // ===========================================================================

  describe('progress bar status messages', () => {
    it('shows "Ready to generate" when no items yet', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Item 1', 'pending')],
            stats: { total: 0, completed: 0, failed: 0, remaining: 0 },
          })}
        />
      );

      expect(screen.getByText('Ready to generate')).toBeInTheDocument();
    });

    it('shows generating message during generation', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: true,
            progress: 25,
            items: [
              createMockItem('1', 'Item 1', 'completed'),
              createMockItem('2', 'Item 2', 'generating'),
            ],
            stats: { total: 2, completed: 1, failed: 0, remaining: 1 },
          })}
        />
      );

      expect(screen.getByText('Generating QR code 2 of 2...')).toBeInTheDocument();
    });

    it('shows "Complete!" when all succeed', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            progress: 100,
            items: [createMockItem('1', 'Item 1', 'completed')],
            stats: { total: 1, completed: 1, failed: 0, remaining: 0 },
          })}
        />
      );

      expect(screen.getByText('Complete!')).toBeInTheDocument();
    });

    it('shows failure count when some fail', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            progress: 100,
            items: [
              createMockItem('1', 'Item 1', 'completed'),
              createMockItem('2', 'Item 2', 'failed'),
            ],
            stats: { total: 2, completed: 1, failed: 1, remaining: 0 },
          })}
        />
      );

      expect(screen.getByText('1 completed, 1 failed')).toBeInTheDocument();
    });

    it('shows "Generation failed" when all fail', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            progress: 100,
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
          })}
        />
      );

      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Item Status Display Tests
  // ===========================================================================

  describe('item status display', () => {
    it('shows correct icons for each status', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: true,
            items: [
              createMockItem('1', 'Pending Item', 'pending'),
              createMockItem('2', 'Generating Item', 'generating'),
              createMockItem('3', 'Completed Item', 'completed'),
              createMockItem('4', 'Failed Item', 'failed'),
            ],
            stats: { total: 4, completed: 1, failed: 1, remaining: 2 },
          })}
        />
      );

      // All item names should be visible
      expect(screen.getByText('Pending Item')).toBeInTheDocument();
      expect(screen.getByText('Generating Item')).toBeInTheDocument();
      expect(screen.getByText('Completed Item')).toBeInTheDocument();
      expect(screen.getByText('Failed Item')).toBeInTheDocument();

      // Screen reader status labels
      expect(screen.getAllByText('Pending')).toHaveLength(1);
      expect(screen.getAllByText('Generating...')).toHaveLength(1);
      expect(screen.getAllByText('Completed')).toHaveLength(1);
      expect(screen.getAllByText('Failed')).toHaveLength(1);
    });

    it('applies error styling to failed items', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Failed Item', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
          })}
        />
      );

      const failedItem = screen.getByText('Failed Item');
      expect(failedItem).toHaveClass('text-[#FF5A5F]');
    });
  });

  // ===========================================================================
  // Cancel Button Tests
  // ===========================================================================

  describe('cancel button', () => {
    it('shows cancel button only during generation', () => {
      const onCancel = vi.fn();

      const { rerender } = render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: true,
            items: [createMockItem('1', 'Item 1', 'generating')],
            stats: { total: 1, completed: 0, failed: 0, remaining: 1 },
            onCancel,
          })}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      // Re-render with isGenerating false
      rerender(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            items: [createMockItem('1', 'Item 1', 'completed')],
            stats: { total: 1, completed: 1, failed: 0, remaining: 0 },
            onCancel,
          })}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();

      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: true,
            items: [createMockItem('1', 'Item 1', 'generating')],
            stats: { total: 1, completed: 0, failed: 0, remaining: 1 },
            onCancel,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Retry Button Tests
  // ===========================================================================

  describe('retry buttons', () => {
    it('shows retry button on failed items', () => {
      const onRetryItem = vi.fn();

      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Failed Item', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
            onRetryItem,
          })}
        />
      );

      expect(screen.getByRole('button', { name: /retry qr generation for failed item/i })).toBeInTheDocument();
    });

    it('calls onRetryItem with item ID when retry clicked', () => {
      const onRetryItem = vi.fn();

      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('item-123', 'Failed Item', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
            onRetryItem,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /retry qr generation for failed item/i }));
      expect(onRetryItem).toHaveBeenCalledWith('item-123');
    });

    it('does not show retry on non-failed items', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [
              createMockItem('1', 'Pending Item', 'pending'),
              createMockItem('2', 'Completed Item', 'completed'),
            ],
            stats: { total: 2, completed: 1, failed: 0, remaining: 1 },
          })}
        />
      );

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error Banner Tests
  // ===========================================================================

  describe('error banner', () => {
    it('shows error banner when error exists and not generating', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            error: 'Network error occurred',
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
          })}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('shows failed count in error banner when no error message', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
          })}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('1 item failed to generate')).toBeInTheDocument();
    });

    it('shows pluralized message for multiple failures', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            items: [
              createMockItem('1', 'Item 1', 'failed'),
              createMockItem('2', 'Item 2', 'failed'),
            ],
            stats: { total: 2, completed: 0, failed: 2, remaining: 0 },
          })}
        />
      );

      expect(screen.getByText('2 items failed to generate')).toBeInTheDocument();
    });

    it('does not show error banner during generation', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: true,
            error: 'Some error',
            items: [createMockItem('1', 'Item 1', 'generating')],
            stats: { total: 1, completed: 0, failed: 0, remaining: 1 },
          })}
        />
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls onRetry when Retry Failed clicked', () => {
      const onRetry = vi.fn();

      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
            onRetry,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /retry failed/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onContinue when Skip & Continue clicked', () => {
      const onContinue = vi.fn();

      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
            onContinue,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /skip & continue/i }));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible progressbar', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            progress: 50,
            items: [createMockItem('1', 'Item 1', 'completed')],
            stats: { total: 2, completed: 1, failed: 0, remaining: 1 },
          })}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-label', 'QR code generation progress');
    });

    it('has accessible list', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Item 1', 'pending')],
            stats: { total: 1, completed: 0, failed: 0, remaining: 1 },
          })}
        />
      );

      expect(screen.getByRole('list', { name: 'QR code generation status' })).toBeInTheDocument();
    });

    it('has screen reader labels for status', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            items: [createMockItem('1', 'Item 1', 'completed')],
            stats: { total: 1, completed: 1, failed: 0, remaining: 0 },
          })}
        />
      );

      // Check for sr-only status text
      const srText = screen.getByText('Completed');
      expect(srText).toHaveClass('sr-only');
    });

    it('error banner has alert role', () => {
      render(
        <QRGenerationProgress
          {...createDefaultProps({
            isGenerating: false,
            error: 'Error',
            items: [createMockItem('1', 'Item 1', 'failed')],
            stats: { total: 1, completed: 0, failed: 1, remaining: 0 },
          })}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
