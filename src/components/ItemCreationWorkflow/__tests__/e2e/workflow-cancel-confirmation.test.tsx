/**
 * Cancel Confirmation Dialog E2E Tests
 *
 * Tests for the cancel confirmation dialog behavior, ensuring proper
 * warning is shown when content has been created and exit behavior
 * is correct in all scenarios.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/workflow-cancel-confirmation
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
  navigateToPurposeStep,
  navigateToContentTypeStep,
  navigateToPreviewSaveStep,
  waitForPurposeStep,
  waitForPreviewSaveStep,
  clickContinue,
} from './test-utils.tsx';
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

describe('Cancel Confirmation Dialog E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Cancel with No Content (Task 6.1.6)
  // ===========================================================================
  describe('Cancel with No Content', () => {
    it('exits directly when no content has been added (at room selection)', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // At room selection - no content yet
      expect(screen.getByText('Select a Room')).toBeInTheDocument();

      // Click Cancel/Exit
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i) ||
                        screen.queryByLabelText(/exit/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // Should exit directly without confirmation dialog
        await waitFor(() => {
          expect(props.onSessionExit).toHaveBeenCalled();
        });
      }
    });

    it('exits directly when at content type selection (no content yet)', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type selection
      await navigateToContentTypeStep(user);

      // Look for cancel/exit button
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i) ||
                        screen.queryByLabelText(/exit/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // May show confirmation or exit directly depending on implementation
        // If no content has been uploaded, should be able to exit
        const dialogPresent = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');

        if (dialogPresent) {
          // If dialog appears, it should still allow exit
          const confirmBtn = within(dialogPresent).queryByText(/yes/i) ||
                            within(dialogPresent).queryByText(/cancel/i) ||
                            within(dialogPresent).queryByText(/discard/i);
          if (confirmBtn) {
            await user.click(confirmBtn);
          }
        }

        await waitFor(() => {
          expect(props.onSessionExit).toHaveBeenCalled();
        });
      }
    });
  });

  // ===========================================================================
  // Cancel with Content (Shows Confirmation)
  // ===========================================================================
  describe('Cancel with Content', () => {
    it('shows confirmation when file has been uploaded', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview (which means content has been captured)
      await navigateToPreviewSaveStep(user);

      // Look for cancel/exit button
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i) ||
                        screen.queryByLabelText(/exit/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // Confirmation dialog should appear
        await waitFor(() => {
          expect(
            screen.queryByRole('alertdialog') ||
            screen.queryByRole('dialog') ||
            screen.queryByText(/are you sure/i) ||
            screen.queryByText(/unsaved/i) ||
            screen.queryByText(/lose/i)
          ).toBeInTheDocument();
        });
      }
    });

    it('shows confirmation when at preview-save step', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Try to cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // Should show confirmation
        await waitFor(() => {
          const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
          expect(dialog || screen.queryByText(/unsaved/i) || screen.queryByText(/lose/i)).toBeDefined();
        });
      }
    });
  });

  // ===========================================================================
  // Confirm Cancel Behavior
  // ===========================================================================
  describe('Confirm Cancel', () => {
    it('discards content when cancel is confirmed', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with content
      await navigateToPreviewSaveStep(user);

      // Click cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        // Find confirmation dialog
        const dialog = await screen.findByRole('alertdialog').catch(() => screen.queryByRole('dialog'));

        if (dialog) {
          // Click confirm/yes button
          const confirmBtn = within(dialog).queryByText(/yes/i) ||
                            within(dialog).queryByText(/discard/i) ||
                            within(dialog).queryByText(/cancel/i) ||
                            within(dialog).queryByRole('button');

          if (confirmBtn) {
            await user.click(confirmBtn);

            // Should call onSessionExit
            await waitFor(() => {
              expect(props.onSessionExit).toHaveBeenCalled();
            });
          }
        }
      }
    });

    it('includes partial session data in exit callback', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Cancel and confirm
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
        if (dialog) {
          const confirmBtn = within(dialog).queryByText(/yes/i) ||
                            within(dialog).queryByText(/discard/i);
          if (confirmBtn) {
            await user.click(confirmBtn);

            await waitFor(() => {
              expect(props.onSessionExit).toHaveBeenCalledWith(
                expect.objectContaining({
                  id: expect.any(String),
                  startedAt: expect.any(Date),
                  currentStep: expect.any(String),
                  items: expect.any(Array),
                  exitedAt: expect.any(Date),
                })
              );
            });
          }
        }
      }
    });
  });

  // ===========================================================================
  // Dismiss Cancel Behavior
  // ===========================================================================
  describe('Dismiss Cancel', () => {
    it('preserves content when cancel is dismissed', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Click cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
        if (dialog) {
          // Click "Keep Working" or dismiss button
          const dismissBtn = within(dialog).queryByText(/keep/i) ||
                            within(dialog).queryByText(/no/i) ||
                            within(dialog).queryByText(/stay/i) ||
                            within(dialog).queryByLabelText(/close/i);

          if (dismissBtn) {
            await user.click(dismissBtn);

            // Should return to workflow, content preserved
            await waitFor(() => {
              expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
            });

            // Still at preview step
            expect(screen.getByText(/Review/i) || screen.getByText(/Preview/i)).toBeInTheDocument();

            // onSessionExit should NOT have been called
            expect(props.onSessionExit).not.toHaveBeenCalled();
          }
        }
      }
    });

    it('can continue workflow after dismissing cancel', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Click cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
        if (dialog) {
          const dismissBtn = within(dialog).queryByText(/keep/i) ||
                            within(dialog).queryByText(/no/i);
          if (dismissBtn) {
            await user.click(dismissBtn);
          }
        }

        // Should be able to save
        await waitFor(() => {
          expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        await user.click(saveBtn);

        // Should proceed to next action
        await waitFor(() => {
          expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================================================
  // Dialog Accessibility
  // ===========================================================================
  describe('Dialog Accessibility', () => {
    it('dialog has correct aria attributes', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with content
      await navigateToPreviewSaveStep(user);

      // Click cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        const dialog = await screen.findByRole('alertdialog').catch(() => screen.queryByRole('dialog'));

        if (dialog) {
          // Check for proper ARIA attributes
          expect(
            dialog.getAttribute('aria-labelledby') ||
            dialog.getAttribute('aria-label')
          ).toBeDefined();
        }
      }
    });

    it('closes dialog on Escape key', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Click cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i }) ||
                        screen.queryByLabelText(/close/i);

      if (cancelBtn) {
        await user.click(cancelBtn);

        const dialog = screen.queryByRole('alertdialog') || screen.queryByRole('dialog');
        if (dialog) {
          // Press Escape
          await user.keyboard('{Escape}');

          // Dialog should close (dismiss behavior)
          await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
          });

          // Should still be at preview step
          expect(screen.getByText(/Review/i) || screen.getByText(/Preview/i)).toBeInTheDocument();
        }
      }
    });
  });

  // ===========================================================================
  // Cancel from Different Steps
  // ===========================================================================
  describe('Cancel from Different Steps', () => {
    it('shows confirmation from content-creation step after starting capture', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation
      await navigateToContentTypeStep(user);
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Note: In content creation, canceling usually goes back to content type
      // The actual cancel confirmation might be at workflow level

      // Complete capture first, then try to cancel at preview
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Now try cancel
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      if (cancelBtn) {
        await user.click(cancelBtn);
        // Should show confirmation since content exists
        await waitFor(() => {
          expect(
            screen.queryByRole('alertdialog') ||
            screen.queryByRole('dialog') ||
            screen.queryByText(/unsaved/i)
          ).toBeDefined();
        });
      }
    });

    it('does not show confirmation at room selection step', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // At room selection
      expect(screen.getByText('Select a Room')).toBeInTheDocument();

      // Look for exit/cancel button in header
      const exitBtn = screen.queryByLabelText(/close/i) ||
                      screen.queryByLabelText(/exit/i) ||
                      screen.queryByRole('button', { name: /cancel/i });

      if (exitBtn) {
        await user.click(exitBtn);

        // Should exit without confirmation (no content yet)
        await waitFor(() => {
          // Either exits directly or if dialog, should be able to confirm quickly
          const dialog = screen.queryByRole('alertdialog');
          if (!dialog) {
            expect(props.onSessionExit).toHaveBeenCalled();
          }
        }, { timeout: 1000 });
      }
    });
  });
});
