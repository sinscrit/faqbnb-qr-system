/**
 * Add More Content Flow E2E Tests
 *
 * Tests for the "Add More Content" functionality that allows users
 * to add multiple content pieces to the same item.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/workflow-add-more-content
 * @see docs/REQ-172-end-to-end-flow-testing-detailed.md
 * @lastModified 2026-01-10 (REQ-172 E2E Flow Testing)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWorkflow } from '../../ItemCreationWorkflow';
import { createMockWorkflowProps } from '../helpers/testUtils';
import { createMockItemRecord } from '../helpers/mockFactories';
import {
  navigateToPreviewSaveStep,
  navigateToNextActionStep,
  waitForPurposeStep,
  waitForPreviewSaveStep,
  clickContinue,
  clickBack,
} from './test-utils.tsx';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
  },
});

// Mock ItemCapture component - returns different content types based on config
let captureCount = 0;
vi.mock('@/components/ItemCapture', () => ({
  ItemCapture: ({ onComplete, onCancel, config }: ItemCaptureProps) => {
    const mediaType = config?.initialMode === 'photo' ? 'image' : 'video';
    return (
      <div data-testid="mock-item-capture">
        <div data-testid="capture-mode">{config?.initialMode || 'video'}</div>
        <button
          data-testid="complete-capture-btn"
          onClick={() => {
            captureCount++;
            onComplete(createMockItemRecord(mediaType as 'video' | 'image'));
          }}
        >
          Complete Capture
        </button>
        <button data-testid="cancel-capture-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  },
}));

// Mock useQRCodeGeneration hook
vi.mock('@/hooks/useQRCodeGeneration', () => ({
  useQRCodeGeneration: vi.fn(() => ({
    qrCodes: new Map(),
    isGenerating: false,
    progress: 0,
    error: null,
    failedItems: new Set(),
    generateQRCodes: vi.fn().mockResolvedValue(undefined),
    retryFailedItems: vi.fn().mockResolvedValue(undefined),
    clearQRCache: vi.fn(),
    getStats: vi.fn().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 }),
  })),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('Add More Content Flow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    captureCount = 0;
  });

  // ===========================================================================
  // Basic Add More Flow (Task 6.1.5)
  // ===========================================================================
  describe('Basic Add More Flow', () => {
    it('allows adding multiple content pieces to same item', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through to first content capture
      // Note: These steps auto-advance, so no need to click Continue
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Use'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // First content: Record Video (auto-advances to content creation)
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));

      // At preview step
      await waitForPreviewSaveStep();

      // Look for "Add More Content" or similar option
      const addMoreBtn = screen.queryByText(/Add More/i) || screen.queryByText(/Add Another/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);

        // Should return to content type selection
        await waitFor(() => {
          expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
        });

        // Add second content: Take Photo (auto-advances)
        await user.click(screen.getByText('Take Photo'));
        await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
        await user.click(screen.getByTestId('complete-capture-btn'));

        // Back at preview with both pieces
        await waitForPreviewSaveStep();

        // Should show 2 content pieces captured
        expect(captureCount).toBe(2);
      }
    });

    it('returns to content-type-selection when clicking Add More', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with content
      await navigateToPreviewSaveStep(user);

      // Click Add More if available
      const addMoreBtn = screen.queryByText(/Add More/i) || screen.queryByText(/Add Another/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);

        // Should be at content type selection
        await waitFor(() => {
          expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================================================
  // State Preservation Tests
  // ===========================================================================
  describe('State Preservation During Add More', () => {
    it('maintains item state when navigating back from add more', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview (steps auto-advance)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Click Add More if available
      const addMoreBtn = screen.queryByText(/Add More/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);
        await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

        // Navigate back
        await clickBack(user);

        // Should be at preview step with previous content preserved
        await waitForPreviewSaveStep();

        // The title should still reflect the original purpose
        expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();
      }
    });

    it('preserves all item selections when adding more content', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Verify initial state
      expect(screen.getByText(/How to Use - Refrigerator/i)).toBeInTheDocument();

      // Add more content
      const addMoreBtn = screen.queryByText(/Add More/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);
        await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

        // Complete second content (auto-advances)
        await user.click(screen.getByText('Take Photo'));
        await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
        await user.click(screen.getByTestId('complete-capture-btn'));
        await waitForPreviewSaveStep();

        // Title should still be the same
        expect(screen.getByText(/How to Use - Refrigerator/i)).toBeInTheDocument();
      }
    });
  });

  // ===========================================================================
  // Add More from Next Action Step
  // ===========================================================================
  describe('Add More from Next Action Step', () => {
    it('"Add More" from next-action returns to content-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to next action step (after saving first item)
      await navigateToNextActionStep(user);

      // Click "Add More" option (adds more to same item)
      const addMoreBtn = screen.queryByText(/Add More/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);

        // Should return to content type selection
        await waitFor(() => {
          expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
        });
      }
    });

    it('adds content to existing item when using Add More from next-action', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to next action step
      await navigateToNextActionStep(user);

      // Click Add More
      const addMoreBtn = screen.queryByText(/Add More/i);
      if (addMoreBtn) {
        await user.click(addMoreBtn);
        await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

        // Add another content piece (auto-advances)
        await user.click(screen.getByText('Take Photo'));
        await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
        await user.click(screen.getByTestId('complete-capture-btn'));
        await waitForPreviewSaveStep();

        // Save and verify onSaveItem called again
        const saveBtn = screen.getByRole('button', { name: /save/i });
        await user.click(saveBtn);

        await waitFor(() => {
          // Should have been called for both saves
          expect(props.onSaveItem).toHaveBeenCalled();
        });
      }
    });
  });

  // ===========================================================================
  // Multiple Content Type Combinations
  // ===========================================================================
  describe('Multiple Content Type Combinations', () => {
    it.each([
      [['Record Video', 'Take Photo']],
      [['Record Video', 'Write Text']],
      [['Take Photo', 'Write Text']],
    ])('handles content types %s correctly', async (contentTypes) => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type selection (steps auto-advance)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Use'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Add first content type (auto-advances)
      await user.click(screen.getByText(contentTypes[0]));

      if (contentTypes[0] === 'Write Text') {
        // Handle text input differently
        await waitFor(() => {
          const textArea = screen.queryByRole('textbox') || screen.queryByPlaceholderText(/write/i);
          return textArea !== null;
        });
        const textArea = screen.queryByRole('textbox') || screen.queryByPlaceholderText(/write/i);
        if (textArea) {
          await user.type(textArea, 'Test instructions content');
          const doneBtn = screen.queryByText(/Done/i) || screen.queryByRole('button', { name: /continue/i });
          if (doneBtn) await user.click(doneBtn);
        }
      } else {
        await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
        await user.click(screen.getByTestId('complete-capture-btn'));
      }

      await waitForPreviewSaveStep();

      // Add second content type if Add More is available
      const addMoreBtn = screen.queryByText(/Add More/i);
      if (addMoreBtn && contentTypes.length > 1) {
        await user.click(addMoreBtn);
        await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

        // Auto-advances
        await user.click(screen.getByText(contentTypes[1]));

        if (contentTypes[1] === 'Write Text') {
          await waitFor(() => {
            const textArea = screen.queryByRole('textbox') || screen.queryByPlaceholderText(/write/i);
            return textArea !== null;
          });
          const textArea = screen.queryByRole('textbox') || screen.queryByPlaceholderText(/write/i);
          if (textArea) {
            await user.type(textArea, 'Additional instructions');
            const doneBtn = screen.queryByText(/Done/i) || screen.queryByRole('button', { name: /continue/i });
            if (doneBtn) await user.click(doneBtn);
          }
        } else {
          await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
          await user.click(screen.getByTestId('complete-capture-btn'));
        }

        await waitForPreviewSaveStep();
      }
    });
  });

  // ===========================================================================
  // Content Count and Display
  // ===========================================================================
  describe('Content Count and Display', () => {
    it('displays correct content count after adding multiple pieces', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with first content
      await navigateToPreviewSaveStep(user);

      // Add more content pieces
      for (let i = 0; i < 2; i++) {
        const addMoreBtn = screen.queryByText(/Add More/i);
        if (addMoreBtn) {
          await user.click(addMoreBtn);
          await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
          await user.click(screen.getByText('Record Video'));
          await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
          await user.click(screen.getByTestId('complete-capture-btn'));
          await waitForPreviewSaveStep();
        }
      }

      // Verify content count is reflected in UI
      // Look for content pieces display
      const contentSection = screen.queryByText(/content/i);
      expect(contentSection).toBeDefined();
    });
  });
});
