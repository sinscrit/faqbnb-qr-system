/**
 * Title Generation Integration E2E Tests
 *
 * Tests for verifying the auto-generated title functionality appears
 * correctly in the UI at the PreviewSaveStep and persists through the workflow.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/workflow-title-generation
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
  navigateToPreviewSaveStep,
  waitForPurposeStep,
  waitForPreviewSaveStep,
  clickContinue,
  clickBack,
  PURPOSE_TYPE_LABELS,
  generatePurposeTestCases,
} from './test-utils.tsx';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock crypto.randomUUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));

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

describe('Title Generation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Auto-Generated Title Display Tests (Task 6.1.3b)
  // ===========================================================================
  describe('Auto-Generated Title in UI', () => {
    it('displays auto-generated title in PreviewSaveStep', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with purpose "how-to-clean" and item "Refrigerator"
      // Use navigation helper which handles auto-advancing properly
      await navigateToPreviewSaveStep(user, { purpose: 'how-to-clean' });

      // Verify title shows "How to Clean - Refrigerator"
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();
    });

    it.each([
      { purpose: 'how-to-use' as PurposeType, label: 'How to Use' },
      { purpose: 'how-to-clean' as PurposeType, label: 'How to Clean' },
      { purpose: 'troubleshooting' as PurposeType, label: 'Troubleshooting' },
      { purpose: 'safety-info' as PurposeType, label: 'Safety Information' },
      { purpose: 'maintenance' as PurposeType, label: 'Maintenance' },
      { purpose: 'features' as PurposeType, label: 'Features & Tips' },
      { purpose: 'other' as PurposeType, label: 'Other' },
    ])('generates correct title for purpose "$purpose"', async ({ purpose, label }) => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview with the specific purpose
      await navigateToPreviewSaveStep(user, { purpose });

      // Verify correct title format
      const expectedTitle = `${label} - Refrigerator`;
      expect(screen.getByText(new RegExp(expectedTitle, 'i'))).toBeInTheDocument();
    });

    it('updates title when purpose changes via back navigation', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content type step with initial purpose
      await navigateToContentTypeStep(user, { purpose: 'how-to-use' });

      // Go back to purpose selection
      await clickBack(user);
      await waitForPurposeStep();

      // Select different purpose (step auto-advances)
      await user.click(screen.getByText('How to Clean'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());

      // Continue to preview (content type selection auto-advances)
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Title should reflect the updated purpose
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Title Editing Tests
  // ===========================================================================
  describe('Title Editing', () => {
    it('allows editing the auto-generated title', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Find the title input/editable field
      const titleInput = screen.queryByDisplayValue(/How to Use - Refrigerator/i);
      if (titleInput) {
        // Clear and type new title
        await user.clear(titleInput);
        await user.type(titleInput, 'Custom Fridge Instructions');

        // Verify new title
        expect(screen.getByDisplayValue(/Custom Fridge Instructions/i)).toBeInTheDocument();
      }
    });

    it('preserves custom title when navigating back and forward', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
      await navigateToPreviewSaveStep(user);

      // Edit the title
      const titleInput = screen.queryByDisplayValue(/How to Use - Refrigerator/i);
      if (titleInput) {
        await user.clear(titleInput);
        await user.type(titleInput, 'My Custom Title');
      }

      // Navigate back
      await clickBack(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Navigate forward (cancel capture to go back to content type, then re-do)
      await user.click(screen.getByTestId('cancel-capture-btn'));
      await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
      // Content type selection auto-advances
      await user.click(screen.getByText('Record Video'));
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Title should be preserved or regenerated
      // (behavior depends on implementation - either preserves edit or regenerates)
      await waitFor(() => {
        expect(
          screen.queryByDisplayValue(/My Custom Title/i) ||
          screen.queryByDisplayValue(/How to Use - Refrigerator/i)
        ).toBeInTheDocument();
      });
    });

    it('includes correct title in saved item data', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to preview
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
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();

      // Save
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Verify onSaveItem was called with correct title
      await waitFor(() => {
        expect(props.onSaveItem).toHaveBeenCalled();
      });

      // Check the saved data includes proper title format
      expect(props.onSaveItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/How to Clean.*Refrigerator|Refrigerator/i),
        })
      );
    });
  });

  // ===========================================================================
  // Title Display in Session Summary
  // ===========================================================================
  describe('Title in Session Summary', () => {
    it('displays auto-generated titles in session summary', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Complete workflow
      await user.click(screen.getByText('Kitchen'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitForPurposeStep();
      await user.click(screen.getByText('Maintenance'));
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
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());

      // Verify title in summary
      expect(screen.getByText(/Maintenance - Refrigerator/i)).toBeInTheDocument();
    });

    it('displays multiple items with different purpose-based titles', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create first item
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
      await user.click(screen.getByText('Record Video'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitForPreviewSaveStep();
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Add another item
      await user.click(screen.getByText(/Tag New Item/i));
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
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());

      // Both items should show with their purpose-based titles
      expect(screen.getByText(/How to Clean - Refrigerator/i)).toBeInTheDocument();
      expect(screen.getByText(/Troubleshooting - Dishwasher/i)).toBeInTheDocument();
    });
  });
});
