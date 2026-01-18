/**
 * ItemCreationWorkflow Integration Tests
 *
 * Comprehensive integration tests for the ItemCreationWorkflow component.
 * Tests complete user flows, step navigation, state persistence, and error handling.
 *
 * @module ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration
 * @see docs/REQ-116-integration-tests-detailed.md
 * @lastModified 2026-01-05 (REQ-116 Integration Tests)
 */

import React from 'react';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWorkflow } from '../ItemCreationWorkflow';
import {
  createMockWorkflowProps,
  createMockSessionQRGenerationHook,
  WORKFLOW_STEPS_ORDER,
  TEST_ROOMS,
  TEST_ITEM_TYPES,
  TEST_CONTENT_TYPES,
} from './helpers';
import {
  createMockSessionItem,
  createMockItemRecord,
  createMockContentPiece,
} from './helpers/mockFactories';
import type { ItemRecord, ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

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
const mockQRHook = createMockSessionQRGenerationHook();
vi.mock('@/hooks/useQRCodeGeneration', () => ({
  useQRCodeGeneration: vi.fn(() => ({
    qrCodes: mockQRHook.qrCodes,
    isGenerating: mockQRHook.isGenerating,
    progress: mockQRHook.progress,
    error: mockQRHook.error,
    failedItems: mockQRHook.failedItemIds,
    generateQRCodes: mockQRHook.generateForItems,
    retryFailedItems: mockQRHook.retryFailed,
    clearQRCache: mockQRHook.clear,
    getStats: vi.fn().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 }),
  })),
}));

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Helper to select a room and wait for transition.
 */
const selectRoom = async (user: ReturnType<typeof userEvent.setup>, roomLabel: string) => {
  await user.click(screen.getByText(roomLabel));
};

/**
 * Helper to click Continue button.
 */
const clickContinue = async (user: ReturnType<typeof userEvent.setup>) => {
  const continueBtn = screen.getByRole('button', { name: /continue/i });
  await user.click(continueBtn);
};

// =============================================================================
// Test Suites
// =============================================================================

describe('ItemCreationWorkflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Task 3: Room Selection Integration Tests
  // ===========================================================================
  describe('Room Selection Integration', () => {
    it('renders room selection as initial step', () => {
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      expect(screen.getByText('Select a Room')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Laundry Room')).toBeInTheDocument();
      expect(screen.getByText('Bedroom')).toBeInTheDocument();
    });

    it('displays all available room options', () => {
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Check all rooms are present
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Laundry Room')).toBeInTheDocument();
      expect(screen.getByText('Bedroom')).toBeInTheDocument();
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
      expect(screen.getByText('Living Room')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
      expect(screen.getByText(/Outdoor/i)).toBeInTheDocument();
      expect(screen.getByText(/General/i)).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('selecting a room enables Continue button', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Initially continue should be disabled
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();

      // Select kitchen
      await selectRoom(user, 'Kitchen');

      // Now continue should be enabled
      expect(continueBtn).not.toBeDisabled();
    });

    it('selecting "Other" room shows custom input field', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select "Other"
      await selectRoom(user, 'Other');

      // Custom input should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Enter room name/i)).toBeInTheDocument();
      });
    });

    it('room selection navigates to item-type-selection step', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select kitchen and continue
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      // Should be on item type selection step
      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });
    });

    it('selecting "General" room skips item-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select "General" and continue
      await selectRoom(user, /General/i);
      await clickContinue(user);

      // Should skip to specific item selection (since General implies general-info)
      await waitFor(() => {
        expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument();
      });
    });

    it('back navigation from item-type-selection returns to room-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type selection
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });

      // Click back button
      const backBtn = screen.getByLabelText('Go back to previous step');
      await user.click(backBtn);

      // Should be back on room selection
      await waitFor(() => {
        expect(screen.getByText('Select a Room')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 4: Item Type Selection Integration Tests
  // ===========================================================================
  describe('Item Type Selection Integration', () => {
    it('displays three item type options', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type selection
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText('Appliance')).toBeInTheDocument();
        expect(screen.getByText('Room Item')).toBeInTheDocument();
        expect(screen.getByText('General Info')).toBeInTheDocument();
      });
    });

    it('selecting item type enables Continue button', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type selection
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText('Appliance')).toBeInTheDocument();
      });

      // Select appliance
      await user.click(screen.getByText('Appliance'));

      // Continue should be enabled
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
    });

    it('navigates to specific-item-selection after type selected', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through steps
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText('Appliance')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Should be on specific item selection
      await waitFor(() => {
        expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument();
      });
    });

    it('back navigation returns to room-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to item type selection
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText('Appliance')).toBeInTheDocument();
      });

      // Go back
      const backBtn = screen.getByLabelText('Go back to previous step');
      await user.click(backBtn);

      await waitFor(() => {
        expect(screen.getByText('Select a Room')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 4 (continued): Specific Item Selection Integration Tests
  // ===========================================================================
  describe('Specific Item Selection Integration', () => {
    const navigateToSpecificItemStep = async (user: ReturnType<typeof userEvent.setup>) => {
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => {
        expect(screen.getByText('Appliance')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => {
        expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument();
      });
    };

    it('displays suggestions based on room and item type', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSpecificItemStep(user);

      // Kitchen appliances should show appropriate suggestions
      await waitFor(() => {
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });
    });

    it('selecting suggestion updates item name', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSpecificItemStep(user);

      // Select refrigerator
      await user.click(screen.getByText('Refrigerator'));

      // Item name should be auto-generated
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue(/Kitchen - Refrigerator/i);
        expect(nameInput).toBeInTheDocument();
      });
    });

    it('custom item name entry works correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSpecificItemStep(user);

      // Type custom item name
      const customInput = screen.getByLabelText(/Other/i) || screen.getByPlaceholderText(/Enter item name/i);
      await user.type(customInput, 'Custom Item');

      await waitFor(() => {
        expect(screen.getByDisplayValue(/Custom Item/i)).toBeInTheDocument();
      });
    });

    it('navigates to content-source-selection after item selected', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSpecificItemStep(user);

      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);

      // Should be on content source selection
      await waitFor(() => {
        expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 5: Content Selection Step Tests
  // ===========================================================================
  describe('Content Source Selection Integration', () => {
    const navigateToContentSourceStep = async (user: ReturnType<typeof userEvent.setup>) => {
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
    };

    it('displays two content source options', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentSourceStep(user);

      expect(screen.getByText(/I have content/i)).toBeInTheDocument();
      expect(screen.getByText(/Create now/i)).toBeInTheDocument();
    });

    it('selecting "I have content" enables continue', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentSourceStep(user);

      await user.click(screen.getByText(/I have content/i));

      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
    });

    it('navigates to content-type-selection after selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentSourceStep(user);

      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);

      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Type Selection Integration', () => {
    const navigateToContentTypeStep = async (user: ReturnType<typeof userEvent.setup>) => {
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
    };

    it('displays content type options based on source', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentTypeStep(user);

      // "Create now" source should show record/take/write options
      expect(screen.getByText(/Video/i)).toBeInTheDocument();
      expect(screen.getByText(/Photo/i)).toBeInTheDocument();
    });

    it('selecting content type enables Continue', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentTypeStep(user);

      await user.click(screen.getByText(/Video/i));

      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
    });

    it('navigates to content-creation step after selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentTypeStep(user);

      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);

      // Should show mock ItemCapture component
      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 6: Preview Save and Next Action Step Tests
  // ===========================================================================
  describe('Preview & Save Integration', () => {
    const navigateToPreviewStep = async (user: ReturnType<typeof userEvent.setup>) => {
      // Navigate through all steps to preview
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      // Complete capture
      await user.click(screen.getByTestId('complete-capture-btn'));
    };

    it('displays content piece preview after capture', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      // Should show preview step
      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });

    it('shows item name with edit option', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      await waitFor(() => {
        // Item name should be displayed
        expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();
      });
    });

    it('save item adds to session and navigates to next-action', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToPreviewStep(user);

      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });

      // Click save
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Should be on next action step
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });
    });
  });

  describe('Next Action Integration', () => {
    const navigateToNextActionStep = async (user: ReturnType<typeof userEvent.setup>) => {
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
    };

    it('displays three action options', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToNextActionStep(user);

      expect(screen.getByText(/Add More/i)).toBeInTheDocument();
      expect(screen.getByText(/Tag New Item/i)).toBeInTheDocument();
      expect(screen.getByText(/I'm Done/i)).toBeInTheDocument();
    });

    it('"Tag New Item" resets workflow to room-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToNextActionStep(user);

      await user.click(screen.getByText(/Tag New Item/i));

      await waitFor(() => {
        expect(screen.getByText('Select a Room')).toBeInTheDocument();
      });
    });

    it('"I\'m Done" navigates to session-summary', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToNextActionStep(user);

      await user.click(screen.getByText(/I'm Done/i));

      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });
    });

    it('displays session progress indicator', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToNextActionStep(user);

      // Should show item count
      expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 7: Session Summary Step Tests
  // ===========================================================================
  describe('Session Summary Integration', () => {
    const navigateToSessionSummary = async (user: ReturnType<typeof userEvent.setup>) => {
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());
      await user.click(screen.getByText(/I'm Done/i));
      await waitFor(() => expect(screen.getByText(/Session Summary/i)).toBeInTheDocument());
    };

    it('displays session items list', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Should show the created item
      expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();
    });

    it('displays print options', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      // Should have print/finish options
      expect(screen.getByText(/Print QR Codes/i)).toBeInTheDocument();
      expect(screen.getByText(/Finish/i)).toBeInTheDocument();
    });

    it('finish without print calls onSessionComplete', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToSessionSummary(user);

      await user.click(screen.getByText(/Finish/i));

      await waitFor(() => {
        expect(props.onSessionComplete).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Task 14: Cross-Step Data Persistence Tests
  // ===========================================================================
  describe('Cross-Step Data Persistence', () => {
    it('room selection persists through all subsequent steps', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Select kitchen
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      // Navigate to specific item step
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Verify room is reflected in auto-generated name
      await waitFor(() => {
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Refrigerator'));

      // Should see "Kitchen - Refrigerator" format
      await waitFor(() => {
        expect(screen.getByDisplayValue(/Kitchen - Refrigerator/i)).toBeInTheDocument();
      });
    });

    it('itemType selection persists through content steps', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through steps
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());

      // Select appliance
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Verify appliance-specific suggestions appear
      await waitFor(() => {
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });
    });

    it('content pieces persist through preview and save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through to content creation
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Complete capture
      await user.click(screen.getByTestId('complete-capture-btn'));

      // Should show preview with content
      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 15: Error Handling Integration Tests
  // ===========================================================================
  describe('Error Handling Integration', () => {
    it('ItemCapture cancel navigates back without corrupting state', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel capture
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Should be back at content type selection
      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });
    });

    it('workflow remains functional after errors', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate to content creation and cancel
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Retry - should work
      await waitFor(() => expect(screen.getByText(/Video/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Complete this time
      await user.click(screen.getByTestId('complete-capture-btn'));

      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 16: Complete Workflow End-to-End Test
  // ===========================================================================
  describe('Complete Workflow Flow', () => {
    it('completes full workflow from room selection to session summary', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Step 1: Room Selection
      expect(screen.getByText('Select a Room')).toBeInTheDocument();
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);

      // Step 2: Item Type Selection
      await waitFor(() => {
        expect(screen.getByText('What type of item is this?')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);

      // Step 3: Specific Item Selection
      await waitFor(() => {
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);

      // Step 4: Content Source
      await waitFor(() => {
        expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);

      // Step 5: Content Type
      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);

      // Step 6: Content Creation (mock)
      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('complete-capture-btn'));

      // Step 7: Preview & Save
      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      // Step 8: Next Action
      await waitFor(() => {
        expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/I'm Done/i));

      // Step 9: Session Summary
      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();

      // Complete session
      await user.click(screen.getByText(/Finish/i));

      expect(props.onSessionComplete).toHaveBeenCalled();
      expect(props.onSessionComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          newItems: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining('Kitchen'),
              room: 'kitchen',
            }),
          ]),
          printAction: 'skipped',
        })
      );
    });

    it('handles multi-item session correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Create first item
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Choose "Tag New Item" to create second item
      await user.click(screen.getByText(/Tag New Item/i));

      // Create second item
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
      await selectRoom(user, 'Bedroom');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Room Item')).toBeInTheDocument());
      await user.click(screen.getByText('Room Item'));
      await clickContinue(user);
      // Select an item
      await waitFor(() => {
        const closetBtn = screen.queryByText('Closet') || screen.queryByText(/closet/i);
        if (closetBtn) {
          return true;
        }
        return false;
      });

      // If Closet exists, select it; otherwise look for another option
      const closetBtn = screen.queryByText('Closet');
      if (closetBtn) {
        await user.click(closetBtn);
      } else {
        // Find any suggestion button and click it
        const suggestionBtns = screen.queryAllByRole('button');
        const itemBtn = suggestionBtns.find(btn => btn.textContent && !btn.textContent.includes('Continue'));
        if (itemBtn) await user.click(itemBtn);
      }

      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Photo/i));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
      const saveBtn2 = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn2);
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Now we have 2 items - finish
      expect(screen.getByText(/2 items/i)).toBeInTheDocument();

      await user.click(screen.getByText(/I'm Done/i));

      await waitFor(() => {
        expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      });

      // Should show both items
      expect(screen.getByText(/Kitchen - Refrigerator/i)).toBeInTheDocument();
    });

    it('handles back navigation at each step correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate forward a few steps
      await selectRoom(user, 'Kitchen');
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await clickContinue(user);
      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());

      // Now go back
      const backBtn = screen.getByLabelText('Go back to previous step');

      // Back to item type
      await user.click(backBtn);
      await waitFor(() => expect(screen.getByText('What type of item is this?')).toBeInTheDocument());

      // Back to room selection
      await user.click(backBtn);
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());

      // Should not be able to go back further
      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
    });
  });
});
