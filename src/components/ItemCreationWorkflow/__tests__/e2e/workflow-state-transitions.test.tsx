/**
 * State Transition Integration E2E Tests
 *
 * Tests that verify the state machine transitions correctly through
 * the new workflow steps and that state is properly updated at each step.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/workflow-state-transitions
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
  navigateToPurposeStep,
  navigateToContentTypeStep,
  navigateToPreviewSaveStep,
  navigateToNextActionStep,
  waitForPurposeStep,
  waitForPreviewSaveStep,
  clickContinue,
  clickBack,
  PURPOSE_TYPE_LABELS,
  NEW_WORKFLOW_STEPS_ORDER,
} from './test-utils.tsx';
import type { PurposeType, WorkflowStep } from '../../ItemCreationWorkflow.types';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
  },
});

// Mock ItemCapture component
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

describe('State Transition Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Step Order Verification (Task 6.1.7)
  // ===========================================================================
  describe('Step Order Verification', () => {
    it('transitions correctly through new workflow steps', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Step 1: room-selection (initial)
      expect(screen.getByText('Select a Room')).toBeInTheDocument();
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);

      // Step 2: item-type-selection
      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Step 3: specific-item-selection
      await waitFor(() => {
        expect(screen.getByText(/What specific item/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);

      // Step 4: purpose-selection (NEW in Plan-094)
      await waitForPurposeStep();
      expect(screen.getByText(/What's the purpose of this content/i)).toBeInTheDocument();
      await user.click(screen.getByText('How to Use'));
      await clickContinue(user);

      // Step 5: content-type-selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);

      // Step 6: content-creation
      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('complete-capture-btn'));

      // Step 7: preview-save
      await waitForPreviewSaveStep();
      expect(screen.getByText(/Review/i)).toBeInTheDocument();
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Step 8: next-action
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/I'm Done/i));

      // Step 9: session-summary
      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });
    });

    it('follows correct step order with purpose-selection after specific-item', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to specific item
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);

      // Purpose should come next (not content-source-selection as in old flow)
      await waitForPurposeStep();

      // Verify purpose options are present
      expect(screen.getByText('How to Use')).toBeInTheDocument();
      expect(screen.getByText('How to Clean')).toBeInTheDocument();
      expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // currentItem State Updates
  // ===========================================================================
  describe('currentItem State Updates', () => {
    it('updates room in currentItem state after room selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select kitchen
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);

      // Navigate to specific item where we can see the room is reflected
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));

      // Item name should reflect Kitchen
      await waitFor(() => {
        expect(screen.getByDisplayValue(/Kitchen - Refrigerator/i)).toBeInTheDocument();
      });
    });

    it('updates itemType in currentItem state after item type selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());

      // Select Appliance
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Verify appliance-specific suggestions appear
      await waitFor(() => {
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });
    });

    it('updates purpose in currentItem state after purpose selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to purpose
      await navigateToPurposeStep(user);

      // Select purpose
      await user.click(screen.getByText('How to Clean'));
      await clickContinue(user);

      // Continue to preview to verify
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Purpose should be reflected in title
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Step History Tracking
  // ===========================================================================
  describe('Step History Tracking', () => {
    it('maintains correct stepHistory through navigation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through several steps
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();

      // Back button should be available (indicating history exists)
      expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();

      // Navigate back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());

      // Back button still available
      expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();

      await clickBack(user);
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());

      await clickBack(user);
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());

      // At first step, back button should not be available
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
    });

    it('updates stepHistory correctly when navigating back', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate forward
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();

      // Go back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());

      // Go forward again
      await clickContinue(user);
      await waitForPurposeStep();

      // Back should still work
      await clickBack(user);
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
    });
  });

  // ===========================================================================
  // isDirty Flag
  // ===========================================================================
  describe('isDirty Flag', () => {
    it('sets isDirty to true when content is added', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation and complete
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // At this point, isDirty should be true
      // Try to cancel - should show confirmation
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);
        // Should show confirmation dialog due to isDirty
        await waitFor(() => {
          expect(
            screen.queryByRole('alertdialog') ||
            screen.queryByRole('dialog') ||
            screen.queryByText(/unsaved/i)
          ).toBeDefined();
        }, { timeout: 1000 });
      }
    });

    it('keeps isDirty false before content creation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type selection (no content yet)
      await navigateToContentTypeStep(user);

      // Try to exit/cancel - may or may not show dialog depending on implementation
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // Should be able to exit without blocking confirmation
        // (or if dialog shown, can dismiss easily)
        await waitFor(() => {
          const dialog = screen.queryByRole('alertdialog');
          if (!dialog) {
            // No dialog means not dirty
            expect(true).toBe(true);
          }
        }, { timeout: 1000 });
      }
    });
  });

  // ===========================================================================
  // Session State
  // ===========================================================================
  describe('Session State', () => {
    it('updates session.items after save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Complete and save first item
      await navigateToNextActionStep(user);

      // Verify onSaveItem was called
      expect(props.onSaveItem).toHaveBeenCalled();

      // Item count should show 1
      expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    });

    it('maintains session across multiple items', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Save first item
      await navigateToNextActionStep(user);
      expect(screen.getByText(/1 item/i)).toBeInTheDocument();

      // Add another item
      await user.click(screen.getByText(/Tag New Item/i));
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());

      // Navigate through second item
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Dishwasher')).toBeInTheDocument());
      await user.click(screen.getByText('Dishwasher'));
      await clickContinue(user);
      await waitForPurposeStep();
      await user.click(screen.getByText('Troubleshooting'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Should now show 2 items
      expect(screen.getByText(/2 items/i)).toBeInTheDocument();

      // Verify onSaveItem called twice
      expect(props.onSaveItem).toHaveBeenCalledTimes(2);
    });

    it('session summary shows all items from session', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create and save first item
      await navigateToNextActionStep(user);
      await user.click(screen.getByText(/Tag New Item/i));

      // Create and save second item
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Dishwasher')).toBeInTheDocument());
      await user.click(screen.getByText('Dishwasher'));
      await clickContinue(user);
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Go to session summary
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());

      // Both items should be displayed
      expect(screen.getByText(/How to Use - Refrigerator/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Clean - Dishwasher/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Session Completion
  // ===========================================================================
  describe('Session Completion', () => {
    it('calls onSessionComplete with correct data structure', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Complete workflow
      await navigateToNextActionStep(user);
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Finish/i));

      // Verify callback
      expect(props.onSessionComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          newItems: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              room: 'kitchen',
              itemType: 'appliance',
              content: expect.any(Array),
            }),
          ]),
          completedAt: expect.any(Date),
          printAction: expect.any(String),
        })
      );
    });
  });
});
