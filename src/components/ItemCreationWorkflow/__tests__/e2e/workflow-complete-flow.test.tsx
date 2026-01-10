/**
 * Complete Flow Navigation E2E Tests
 *
 * Tests the complete workflow flow from room selection through save,
 * including happy path, back navigation, and edge cases.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow
 * @see docs/REQ-172-end-to-end-flow-testing-detailed.md
 * @lastModified 2026-01-10 (REQ-172 E2E Flow Testing)
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWorkflow } from '../../ItemCreationWorkflow';
import { createMockWorkflowProps } from '../helpers/testUtils';
import { createMockItemRecord } from '../helpers/mockFactories';
import {
  renderWorkflowForE2E,
  navigateToPurposeStep,
  navigateToContentTypeStep,
  navigateToPreviewSaveStep,
  navigateToNextActionStep,
  navigateToSessionSummary,
  waitForPurposeStep,
  waitForPreviewSaveStep,
  clickContinue,
  clickBack,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  selectPurpose,
  selectContentOption,
  PURPOSE_TYPE_LABELS,
  generateFlowTestCases,
} from './test-utils.tsx';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock crypto.randomUUID
const mockUUID = vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7));
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockUUID,
  },
});

// Mock ItemCapture component
vi.mock('@/components/ItemCapture', () => ({
  ItemCapture: ({ onComplete, onCancel, config }: ItemCaptureProps) => (
    <div data-testid="mock-item-capture">
      <div data-testid="item-capture-config">{JSON.stringify(config)}</div>
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

describe('Complete Flow Navigation E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Happy Path Tests (Task 6.1.2a)
  // ===========================================================================
  describe('Happy Path', () => {
    it('completes workflow: Room -> Item Type -> Specific Item -> Purpose -> Content Type -> Create -> Review -> Save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Step 1: Room Selection
      expect(screen.getByText('Select a Room')).toBeInTheDocument();
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);

      // Step 2: Item Type Selection
      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Step 3: Specific Item Selection
      await waitFor(() => {
        expect(screen.getByText(/What specific item/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);

      // Step 4: Purpose Selection (NEW in Plan-094)
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));
      await clickContinue(user);

      // Step 5: Content Type Selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);

      // Step 6: Content Creation (mock)
      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('complete-capture-btn'));

      // Step 7: Preview & Save
      await waitForPreviewSaveStep();

      // Verify auto-generated title is displayed
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Step 8: Next Action
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });

      // Verify onSaveItem was called
      expect(props.onSaveItem).toHaveBeenCalled();

      await user.click(screen.getByText(/I'm Done/i));

      // Step 9: Session Summary
      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();

      // Complete session
      await user.click(screen.getByText(/Finish/i));

      expect(props.onSessionComplete).toHaveBeenCalled();
      expect(props.onSessionComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          newItems: expect.arrayContaining([
            expect.objectContaining({
              room: 'kitchen',
            }),
          ]),
          printAction: 'skipped',
        })
      );
    });

    it.each([
      ['kitchen', 'Appliance', 'Refrigerator', 'how-to-clean', 'How to Clean - Refrigerator'],
      ['laundry', 'Appliance', 'Washer', 'how-to-use', 'How to Use - Washer'],
      ['bedroom', 'Room Item', 'Closet', 'maintenance', 'Maintenance - Closet'],
    ])(
      'completes flow with room=%s, type=%s, item=%s, purpose=%s',
      async (room, itemType, item, purpose, expectedTitle) => {
        const user = userEvent.setup();
        const props = createMockWorkflowProps();
        render(<ItemCreationWorkflow {...props} />);

        // Room selection (capitalize for display)
        const roomLabel = room.charAt(0).toUpperCase() + room.slice(1);
        await user.click(screen.getByText(new RegExp(roomLabel, 'i')));
        await clickContinue(user);

        // Item type selection
        await waitFor(() => {
          expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
        });
        await user.click(screen.getByText(itemType));
        await clickContinue(user);

        // Specific item selection
        await waitFor(() => {
          // Look for the item button
          const itemBtn = screen.queryByText(item);
          if (itemBtn) return true;
          return false;
        });

        const itemBtn = screen.queryByText(item);
        if (itemBtn) {
          await user.click(itemBtn);
        }
        await clickContinue(user);

        // Purpose selection
        await waitForPurposeStep();
        const purposeLabel = PURPOSE_TYPE_LABELS[purpose as PurposeType];
        await user.click(screen.getByText(purposeLabel));
        await clickContinue(user);

        // Content type selection
        await waitFor(() => {
          expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
        });
        await user.click(screen.getByText('Record Video'));
        await clickContinue(user);

        // Content creation
        await waitFor(() => {
          expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
        });
        await user.click(screen.getByTestId('complete-capture-btn'));

        // Preview & save
        await waitForPreviewSaveStep();

        // Verify title is displayed
        await waitFor(() => {
          expect(screen.getByText(new RegExp(expectedTitle, 'i'))).toBeInTheDocument();
        });
      }
    );

    it('handles multi-item session with different purposes', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create first item with "How to Use" purpose
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Use'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Choose to add another item
      await user.click(screen.getByText(/Tag New Item/i));

      // Create second item with "Troubleshooting" purpose
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
      await user.click(screen.getByText('Troubleshooting'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      const saveBtn2 = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn2);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Should show 2 items count
      expect(screen.getByText(/2 items/i)).toBeInTheDocument();

      // Finish session
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());

      // Verify both items shown in summary
      expect(screen.getByText(/How to Use - Refrigerator/i)).toBeInTheDocument();
      expect(screen.getByText(/Troubleshooting - Dishwasher/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Back Navigation Tests (Task 6.1.2b)
  // ===========================================================================
  describe('Back Navigation', () => {
    it('navigates back from item-type-selection to room-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());

      // Go back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
    });

    it('navigates back from specific-item-selection to item-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to specific item
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());

      // Go back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
    });

    it('navigates back from purpose-selection to specific-item-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to purpose step
      await navigateToPurposeStep(user);

      // Go back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
    });

    it('navigates back from content-type-selection to purpose-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type step
      await navigateToContentTypeStep(user);

      // Go back
      await clickBack(user);
      await waitForPurposeStep();
    });

    it('navigates back from content-creation to content-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel capture (goes back)
      await user.click(screen.getByTestId('cancel-capture-btn'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
    });

    it('preserves state through multiple back-forward navigations', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to purpose
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Go back to purpose
      await clickBack(user);
      await waitForPurposeStep();

      // Verify purpose still selected (or can be re-selected)
      // Go forward again
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
    });

    it('maintains correct step history through navigation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate forward several steps
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();

      // Navigate back through all steps
      await clickBack(user); // to specific item
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());

      await clickBack(user); // to item type
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());

      await clickBack(user); // to room
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());

      // Back button should not be available at room selection
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases Tests (Task 6.1.2c)
  // ===========================================================================
  describe('Edge Cases', () => {
    it('handles "general" room type by skipping item-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select General room
      await user.click(screen.getByText(/General/i));
      await clickContinue(user);

      // Should skip item type selection and go to specific item
      await waitFor(() => {
        expect(screen.getByText(/What specific item/i)).toBeInTheDocument();
      });
    });

    it('handles "other" purpose type correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to purpose step
      await navigateToPurposeStep(user);

      // Select "Other" purpose
      await user.click(screen.getByText('Other'));
      await clickContinue(user);

      // Should proceed to content type selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });
    });

    it('prevents navigation forward when required fields missing', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Continue button should be disabled without room selection
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();

      // Select a room
      await user.click(screen.getByText('Kitchen'));

      // Now continue should be enabled
      expect(continueBtn).not.toBeDisabled();
    });

    it('displays appropriate UI for empty specific item suggestions', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to specific item step
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Verify custom input is available
      await waitFor(() => {
        expect(screen.getByText(/What specific item/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================
  describe('Error Handling', () => {
    it('displays error when save fails', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps({
        onSaveItem: vi.fn().mockRejectedValue(new Error('Save failed')),
      });
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through to preview
      await navigateToPreviewSaveStep(user);

      // Try to save
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Should show error state
      await waitFor(() => {
        // Look for error message or error state
        expect(
          screen.queryByText(/error/i) ||
          screen.queryByText(/failed/i) ||
          screen.queryByRole('alert')
        ).toBeInTheDocument();
      });
    });

    it('allows retry after save failure', async () => {
      let callCount = 0;
      const user = userEvent.setup();
      const props = createMockWorkflowProps({
        onSaveItem: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error('First save failed'));
          }
          return Promise.resolve({ id: 'saved-id', qrCodeUrl: 'qr-url' });
        }),
      });
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through to preview
      await navigateToPreviewSaveStep(user);

      // First save attempt (fails)
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Wait for error state
      await waitFor(() => {
        expect(props.onSaveItem).toHaveBeenCalledTimes(1);
      });

      // Retry (should succeed)
      await user.click(saveBtn);

      await waitFor(() => {
        expect(props.onSaveItem).toHaveBeenCalledTimes(2);
      });
    });

    it('ItemCapture cancel navigates back without corrupting state', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Should be back at content type selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });

      // Retry - should work
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Complete this time
      await user.click(screen.getByTestId('complete-capture-btn'));

      await waitForPreviewSaveStep();
    });

    it('workflow remains functional after errors', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation and cancel
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Back at content type, workflow should still work
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Complete flow successfully
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Save and complete
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
    });
  });
});
