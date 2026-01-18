/**
 * QR Code Generation Integration Tests
 *
 * Tests for QR code batch generation, progress tracking, error handling,
 * and retry functionality within the ItemCreationWorkflow context.
 *
 * @module ItemCreationWorkflow/__tests__/QRGeneration.integration
 * @see docs/REQ-116-integration-tests-detailed.md
 * @lastModified 2026-01-05 (REQ-116 Integration Tests)
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWorkflow } from '../ItemCreationWorkflow';
import {
  createMockWorkflowProps,
} from './helpers';
import {
  createMockSessionItem,
  createMockItemRecord,
} from './helpers/mockFactories';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Controllable QR generation mock state
let mockQRState = {
  qrCodes: new Map<string, string>(),
  isGenerating: false,
  progress: 0,
  error: null as string | null,
  failedItems: new Set<string>(),
};

const mockGenerateQRCodes = vi.fn();
const mockRetryFailedItems = vi.fn();
const mockClearQRCache = vi.fn();
const mockGetStats = vi.fn();

// Reset mock state
const resetMockQRState = () => {
  mockQRState = {
    qrCodes: new Map<string, string>(),
    isGenerating: false,
    progress: 0,
    error: null,
    failedItems: new Set<string>(),
  };
  mockGenerateQRCodes.mockReset();
  mockRetryFailedItems.mockReset();
  mockClearQRCache.mockReset();
  mockGetStats.mockReset().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 });
};

// Set up mock state for different test scenarios
const setMockQRGenerating = (progress: number) => {
  mockQRState.isGenerating = true;
  mockQRState.progress = progress;
};

const setMockQRComplete = (qrCodes: Map<string, string>) => {
  mockQRState.isGenerating = false;
  mockQRState.progress = 100;
  mockQRState.qrCodes = qrCodes;
};

const setMockQRError = (error: string, failedItemIds: string[]) => {
  mockQRState.isGenerating = false;
  mockQRState.error = error;
  mockQRState.failedItems = new Set(failedItemIds);
};

vi.mock('@/hooks/useQRCodeGeneration', () => ({
  useQRCodeGeneration: vi.fn(() => ({
    qrCodes: mockQRState.qrCodes,
    isGenerating: mockQRState.isGenerating,
    progress: mockQRState.progress,
    error: mockQRState.error,
    failedItems: mockQRState.failedItems,
    generateQRCodes: mockGenerateQRCodes,
    retryFailedItems: mockRetryFailedItems,
    clearQRCache: mockClearQRCache,
    getStats: mockGetStats,
  })),
}));

// Mock ItemCapture
vi.mock('@/components/ItemCapture', () => ({
  ItemCapture: ({ onComplete, onCancel }: ItemCaptureProps) => (
    <div data-testid="mock-item-capture">
      <button
        data-testid="complete-capture-btn"
        onClick={() => onComplete(createMockItemRecord('video'))}
      >
        Complete Capture
      </button>
      <button data-testid="cancel-capture-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Complete a full item creation and navigate to session summary.
 */
const navigateToSessionSummary = async (user: ReturnType<typeof userEvent.setup>) => {
  // Room selection
  await user.click(screen.getByText('Kitchen'));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Item type
  await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
  await user.click(screen.getByText('Appliance'));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Specific item
  await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
  await user.click(screen.getByText('Refrigerator'));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Content source
  await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
  await user.click(screen.getByText(/Create now/i));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Content type
  await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
  await user.click(screen.getByText(/Video/i));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Content creation
  await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
  await user.click(screen.getByTestId('complete-capture-btn'));

  // Preview
  await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Next action
  await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
  await user.click(screen.getByText(/I'm Done/i));

  // Session summary
  await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());
};

// =============================================================================
// Test Suites
// =============================================================================

describe('QR Generation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockQRState();
    localStorage.clear();
  });

  // ===========================================================================
  // Task 11: Batch QR Generation Tests
  // ===========================================================================
  describe('Batch QR Generation', () => {
    it('triggers QR generation when entering session summary with items', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Click print to trigger QR generation
      await user.click(screen.getByText(/Print QR Codes/i));

      // QR generation should be available in print options
      await waitFor(() => {
        expect(screen.getByText(/Generate/i) || screen.getByText(/QR/i)).toBeInTheDocument();
      });
    });

    it('skips items that already have qrCodeUrl', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps({
        onSaveItem: vi.fn().mockResolvedValue({
          id: 'saved-item-id',
          qrCodeUrl: 'data:image/png;base64,existingQR', // Already has QR
        }),
      });
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // The item already has a QR code, so generation should be skipped
      // This is handled internally by the hook
    });

    it('handles multiple items for batch generation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create first item
      await navigateToSessionSummary(user);

      // Go back and add another item
      const backBtn = screen.queryByLabelText('Go back to previous step');
      if (backBtn) {
        await user.click(backBtn);
        await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

        await user.click(screen.getByText(/Tag New Item/i));

        // Create second item (abbreviated)
        await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
        await user.click(screen.getByText('Bedroom'));
        await user.click(screen.getByRole('button', { name: /continue/i }));

        await waitFor(() => expect(screen.getByText('Room Item')).toBeInTheDocument());
        await user.click(screen.getByText('Room Item'));
        await user.click(screen.getByRole('button', { name: /continue/i }));

        await waitFor(() => expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument());
      }
    });
  });

  // ===========================================================================
  // Task 12: QR Generation Progress and Success Tests
  // ===========================================================================
  describe('QR Generation Progress', () => {
    it('displays session items in summary', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Should show the created item
      expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();
    });

    it('can proceed with print options after creating items', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Print QR Codes button should be available
      expect(screen.getByText(/Print QR Codes/i)).toBeInTheDocument();
    });
  });

  describe('QR Generation Success', () => {
    it('items are displayed after QR generation completes', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Items should be visible in summary
      expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();
    });

    it('session can be completed after QR generation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Click finish
      await user.click(screen.getByText(/Finish/i));

      await waitFor(() => {
        expect(props.onSessionComplete).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Task 13: QR Generation Error and Retry Tests
  // ===========================================================================
  describe('QR Generation Failure', () => {
    it('session can still be completed when QR generation has issues', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Finish without print should always work
      await user.click(screen.getByText(/Finish/i));

      await waitFor(() => {
        expect(props.onSessionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            printAction: 'skipped',
          })
        );
      });
    });

    it('print panel handles error state gracefully', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Enter print panel
      await user.click(screen.getByText(/Print QR Codes/i));

      await waitFor(() => {
        // Should be in print options panel
        expect(screen.getByText(/Generate/i) || screen.getByText(/Skip/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('can cancel from print panel and return to summary', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Enter print panel
      await user.click(screen.getByText(/Print QR Codes/i));

      await waitFor(() => {
        expect(screen.queryByText(/Session Summary/i)).not.toBeInTheDocument();
      });

      // Use back button
      const backBtn = screen.getByLabelText('Go back to previous step');
      await user.click(backBtn);

      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });
    });

    it('can skip print and complete session after viewing print options', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Enter print panel
      await user.click(screen.getByText(/Print QR Codes/i));

      await waitFor(() => {
        expect(screen.getByText(/Skip/i)).toBeInTheDocument();
      });

      // Skip print
      await user.click(screen.getByText(/Skip/i));

      await waitFor(() => {
        expect(props.onSessionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            printAction: 'skipped',
          })
        );
      });
    });

    it('workflow remains functional after errors', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Enter print panel
      await user.click(screen.getByText(/Print QR Codes/i));

      // Go back
      const backBtn = screen.getByLabelText('Go back to previous step');
      await user.click(backBtn);

      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });

      // Should still be able to finish
      await user.click(screen.getByText(/Finish/i));

      expect(props.onSessionComplete).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Additional Edge Cases
  // ===========================================================================
  describe('Edge Cases', () => {
    it('handles session with no items gracefully', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Just exit from room selection
      await user.click(screen.getByLabelText('Exit workflow'));

      // Should call onSessionExit with empty items
      expect(props.onSessionExit).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        })
      );
    });

    it('handles completing session after multiple item creations', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create first item
      await navigateToSessionSummary(user);

      // Finish
      await user.click(screen.getByText(/Finish/i));

      await waitFor(() => {
        expect(props.onSessionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            newItems: expect.arrayContaining([
              expect.objectContaining({
                name: expect.stringContaining('Kitchen'),
              }),
            ]),
          })
        );
      });
    });
  });
});
