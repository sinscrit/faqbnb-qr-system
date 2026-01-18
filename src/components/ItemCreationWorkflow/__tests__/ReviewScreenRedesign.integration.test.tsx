/**
 * Review Screen Redesign Integration Tests
 *
 * Integration tests for the complete review screen flow including
 * pre-populated fields, content previews, and title generation.
 *
 * @module ItemCreationWorkflow/__tests__/ReviewScreenRedesign.integration
 * @lastModified 2026-01-10 (REQ-171 Update Tests)
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ItemCreationWorkflow } from '../ItemCreationWorkflow';
import { createMockWorkflowProps, createMockItemRecord } from './helpers';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

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
// Integration Tests
// =============================================================================

describe('Review Screen Redesign Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Helper to navigate through workflow to preview step.
   * Navigates: Room -> Item Type -> Specific Item -> Purpose -> Content Type -> Content Creation -> Preview
   */
  const navigateToPreviewStep = async (user: ReturnType<typeof userEvent.setup>) => {
    // Room selection
    await user.click(screen.getByText('Kitchen'));

    // Wait for item type step
    await waitFor(() => expect(screen.getByText(/What type of item/i)).toBeInTheDocument());

    // Item type selection
    await user.click(screen.getByText('Appliance'));

    // Wait for specific item step
    await waitFor(() => expect(screen.getByText(/Which appliance/i)).toBeInTheDocument());

    // Specific item selection
    await user.click(screen.getByText('Refrigerator'));

    // Wait for purpose selection step
    await waitFor(() => expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument());

    // Purpose selection
    await user.click(screen.getByText(/How to Clean/i));

    // Wait for content type step
    await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());

    // Content type selection - Record Video
    await user.click(screen.getByText(/Record Video/i));

    // Wait for content creation step
    await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

    // Complete capture
    await user.click(screen.getByTestId('complete-capture-btn'));

    // Should now be at preview step
    await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
  };

  // ===========================================================================
  // Complete Flow Tests
  // ===========================================================================

  describe('complete flow', () => {
    it('displays pre-populated fields after workflow navigation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Verify pre-populated fields
      await waitFor(() => {
        expect(screen.getByText('Kitchen')).toBeInTheDocument();
        expect(screen.getByText('Appliance')).toBeInTheDocument();
      });
    });

    it('shows auto-generated title based on purpose selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Title should be auto-generated with purpose
      await waitFor(() => {
        const nameInput = screen.getByRole('textbox');
        expect(nameInput).toHaveValue(expect.stringContaining('Refrigerator'));
      });
    });

    it('allows title editing and saves correct value', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Edit the title
      const nameInput = screen.getByRole('textbox');
      await user.clear(nameInput);
      await user.type(nameInput, 'Custom Item Title');

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(props.onSaveItem).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Custom Item Title',
          })
        );
      });
    });

    it('renders content pieces in preview grid', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Content should be displayed
      await waitFor(() => {
        expect(screen.getByText('Content (1 piece)')).toBeInTheDocument();
      });
    });

    it('saves item with correct data', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Save the item
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(props.onSaveItem).toHaveBeenCalledTimes(1);
        expect(props.onSaveItem).toHaveBeenCalledWith(
          expect.objectContaining({
            room: 'kitchen',
            itemType: 'appliance',
            content: expect.any(Array),
          })
        );
      });
    });
  });

  // ===========================================================================
  // Content Type Display Tests
  // ===========================================================================

  describe('content types in context', () => {
    it('video content displays with type indicator in preview', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Video preview should show type indicator
      await waitFor(() => {
        expect(screen.getByText('Video')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('navigation from preview', () => {
    it('back button returns to content creation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Click back
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      // Should return to content creation
      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
    });

    it('retake button navigates to content type selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Click retake
      const retakeButton = screen.getByRole('button', { name: /retake/i });
      await user.click(retakeButton);

      // Should go to content type selection
      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Success State Tests
  // ===========================================================================

  describe('save success flow', () => {
    it('shows success message after save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/Item Saved/i)).toBeInTheDocument();
      });
    });

    it('shows QR code after successful save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const qrImage = screen.getByAltText(/QR code/i);
        expect(qrImage).toBeInTheDocument();
      });
    });

    it('continue button advances to next action', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/Item Saved/i)).toBeInTheDocument();
      });

      // Click continue
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Should advance to next action step
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('shows error message on save failure', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps({
        onSaveItem: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Try to save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'item-1', qrCodeUrl: 'data:image/png;base64,test' });

      const props = createMockWorkflowProps({
        onSaveItem: mockSave,
      });
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // First attempt fails
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      // Dismiss error
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      // Retry should succeed
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/Item Saved/i)).toBeInTheDocument();
      });
    });
  });
});
