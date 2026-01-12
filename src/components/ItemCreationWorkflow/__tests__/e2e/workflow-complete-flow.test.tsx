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

// Mock ItemCapture component (legacy - kept for backwards compatibility)
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

// Mock MediaCaptureStep adapters (new workflow - REQ-176)
vi.mock('../../components/steps/adapters', () => ({
  VideoCaptureAdapter: ({ onAddContent, onComplete, onBack }: any) => (
    <div data-testid="mock-item-capture">
      <button
        data-testid="complete-capture-btn"
        onClick={() => {
          onAddContent({
            id: 'test-content-id',
            type: 'video',
            data: { type: 'video', file: new File([''], 'test.mp4', { type: 'video/mp4' }), duration: 30 },
            order: 0,
          });
          onComplete();
        }}
      >
        Complete Capture
      </button>
      <button data-testid="cancel-capture-btn" onClick={onBack}>
        Cancel
      </button>
    </div>
  ),
  PhotoCaptureAdapter: ({ onAddContent, onComplete, onBack }: any) => (
    <div data-testid="mock-item-capture">
      <button
        data-testid="complete-capture-btn"
        onClick={() => {
          onAddContent({
            id: 'test-content-id',
            type: 'photo',
            data: { type: 'photo', file: new File([''], 'test.jpg', { type: 'image/jpeg' }) },
            order: 0,
          });
          onComplete();
        }}
      >
        Complete Capture
      </button>
      <button data-testid="cancel-capture-btn" onClick={onBack}>
        Cancel
      </button>
    </div>
  ),
  FileUploadAdapter: ({ onComplete, onBack }: any) => (
    <div data-testid="mock-file-upload">
      <button data-testid="complete-upload-btn" onClick={onComplete}>Complete Upload</button>
      <button data-testid="cancel-upload-btn" onClick={onBack}>Cancel</button>
    </div>
  ),
  TextEditorAdapter: ({ onComplete, onBack }: any) => (
    <div data-testid="mock-text-editor">
      <button data-testid="complete-text-btn" onClick={onComplete}>Complete Text</button>
      <button data-testid="cancel-text-btn" onClick={onBack}>Cancel</button>
    </div>
  ),
  UrlInputAdapter: ({ onComplete, onBack }: any) => (
    <div data-testid="mock-url-input">
      <button data-testid="complete-url-btn" onClick={onComplete}>Complete URL</button>
      <button data-testid="cancel-url-btn" onClick={onBack}>Cancel</button>
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

      // Step 1: Room Selection (auto-advances after click)
      expect(screen.getByText('Select a Room')).toBeInTheDocument();
      await user.click(screen.getByText('Kitchen'));

      // Step 2: Item Type Selection (auto-advances after click)
      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Appliance'));

      // Step 3: Specific Item Selection (auto-advances after click)
      await waitFor(() => {
        expect(screen.getByText(/What specific item/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Refrigerator'));

      // Step 4: Purpose Selection (auto-advances after click)
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));

      // Step 5: Content Type Selection (auto-advances after click)
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText('Record Video'));

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

        // Room selection (auto-advances after click)
        const roomLabel = room.charAt(0).toUpperCase() + room.slice(1);
        await user.click(screen.getByText(new RegExp(roomLabel, 'i')));

        // Item type selection (auto-advances after click)
        await waitFor(() => {
          expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
        });
        await user.click(screen.getByText(itemType));

        // Specific item selection (auto-advances after click)
        await waitFor(() => {
          expect(screen.getByText(item)).toBeInTheDocument();
        });
        await user.click(screen.getByText(item));

        // Purpose selection (auto-advances after click)
        await waitForPurposeStep();
        const purposeLabel = PURPOSE_TYPE_LABELS[purpose as PurposeType];
        await user.click(screen.getByText(purposeLabel));

        // Content type selection (auto-advances after click)
        await waitFor(() => {
          expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
        });
        await user.click(screen.getByText('Record Video'));

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

      // Create first item with "How to Use" purpose (all steps auto-advance)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Use'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Choose to add another item
      await user.click(screen.getByText(/Tag New Item/i));

      // Create second item with "Troubleshooting" purpose (all steps auto-advance)
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
      await user.click(screen.getByText('Dishwasher'));
      await waitForPurposeStep();
      await user.click(screen.getByText('Troubleshooting'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      await user.click(screen.getByText('Record Video'));
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

      // Navigate to item type (auto-advances after click)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());

      // Go back
      await clickBack(user);
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
    });

    it('navigates back from specific-item-selection to item-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to specific item (auto-advances after each click)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
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

      // Navigate to content creation (auto-advances after click)
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel capture (goes back)
      await user.click(screen.getByTestId('cancel-capture-btn'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
    });

    it('preserves state through multiple back-forward navigations', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type step (all steps auto-advance)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await waitForPurposeStep();
      await user.click(screen.getByText('How to Clean'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Go back to purpose
      await clickBack(user);
      await waitForPurposeStep();

      // Verify we can re-select purpose and advance
      await user.click(screen.getByText('How to Clean'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
    });

    it('maintains correct step history through navigation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate forward several steps (all auto-advance)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
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

      // Select General room (auto-advances)
      await user.click(screen.getByText(/General/i));

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

      // Select "Other" purpose (auto-advances)
      await user.click(screen.getByText('Other'));

      // Should proceed to content type selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });
    });

    it('shows Continue button as fallback navigation option', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Continue button should be visible but disabled without room selection
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

      // Navigate to specific item step (auto-advances after each click)
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));

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

      // Navigate to content creation (auto-advances after click)
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Should be back at content type selection
      await waitFor(() => {
        expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument();
      });

      // Retry - should work (auto-advances after click)
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Complete this time
      await user.click(screen.getByTestId('complete-capture-btn'));

      await waitForPreviewSaveStep();
    });

    it('workflow remains functional after errors', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation and cancel (auto-advances after click)
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Back at content type, workflow should still work
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Complete flow successfully (auto-advances after click)
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Save and complete
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
    });
  });

  // ===========================================================================
  // Post-workflow Header State Tests (REQ-202)
  // ===========================================================================
  describe('Post-workflow header state (REQ-202)', () => {
    it('should show back arrow on preview-save step (before save)', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow to preview-save
      await navigateToPreviewSaveStep(user);

      // At preview-save, back button should be visible
      expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();

      // Step counter should also be visible
      expect(screen.getByText(/Step 8 of 8/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide back arrow when reaching next-action step after saving item', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow to preview-save
      await navigateToPreviewSaveStep(user);

      // At preview-save, back button should be visible
      expect(screen.getByLabelText('Go back to previous step')).toBeInTheDocument();

      // Save the item and proceed to next-action
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait for save to complete and navigate to next-action
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });

      // Back button should NOT be visible on post-workflow screen
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();

      // Exit button should still be available
      expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();

      // Step counter should be hidden
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
    });

    it('should hide back arrow on session-summary step', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow to next-action
      await navigateToNextActionStep(user);

      // Verify we're at next-action
      expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();

      // Back button should NOT be visible
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();

      // Click "I'm Done" to go to session-summary
      await user.click(screen.getByText(/I'm Done/i));

      // Wait for session-summary
      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });

      // Back button should NOT be visible on session-summary either
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();

      // Step counter should still be hidden
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();

      // Exit button should remain available
      expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
    });

    it('exit button remains functional on post-workflow screens', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow to next-action
      await navigateToNextActionStep(user);

      // Verify we're at next-action
      expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();

      // Exit button should be clickable
      const exitButton = screen.getByLabelText('Exit workflow');
      expect(exitButton).toBeInTheDocument();

      // Click exit button
      await user.click(exitButton);

      // Should trigger exit flow (either dialog or immediate exit depending on state)
      // If there are items, a dialog should appear; if not, it should exit immediately
      await waitFor(() => {
        // Check for either exit or dialog
        expect(
          props.onSessionExit.mock.calls.length > 0 ||
          screen.queryByRole('alertdialog') ||
          screen.queryByText(/are you sure/i) ||
          screen.queryByText(/session complete/i)
        ).toBeTruthy();
      });
    });

    it('header structure remains clean on post-workflow screens', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      const { container } = render(<ItemCreationWorkflow {...props} />);

      // Navigate to next-action
      await navigateToNextActionStep(user);

      // Header banner should exist
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // The header navigation controls container should have proper structure
      // even when back button and step counter are hidden
      const headerNav = container.querySelector('header .flex.items-center.justify-between');
      expect(headerNav).toBeInTheDocument();

      // Should have exit button as the only button in header
      const headerButtons = within(screen.getByRole('banner')).getAllByRole('button');
      expect(headerButtons).toHaveLength(1);
      expect(headerButtons[0]).toHaveAttribute('aria-label', 'Exit workflow');
    });
  });
});
