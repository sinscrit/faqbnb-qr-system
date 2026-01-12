/**
 * Test Utility Functions for ItemCreationWorkflow Integration Tests
 *
 * Provides shared test utilities, render helpers, and constants for
 * consistent test setup and common test patterns.
 *
 * @module ItemCreationWorkflow/__tests__/helpers/testUtils
 * @lastModified 2026-01-10 (REQ-172 E2E Flow Testing)
 */

import React from 'react';
import { render, screen, waitFor, type RenderOptions } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type {
  ItemCreationWorkflowProps,
  WorkflowStep,
  SessionItem,
  CompletedSession,
  PartialSession,
  PrintScope,
} from '../../ItemCreationWorkflow.types';

// =============================================================================
// Test Constants
// =============================================================================

/**
 * Common room values for test parameterization.
 */
export const TEST_ROOMS = ['kitchen', 'laundry', 'bedroom'] as const;

/**
 * Common item type values for test parameterization.
 */
export const TEST_ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;

/**
 * Common content type values for test parameterization.
 */
export const TEST_CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;

/**
 * Purpose type values for test parameterization (REQ-171).
 */
export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

/**
 * Purpose labels mapping for test display validation (REQ-171).
 */
export const PURPOSE_LABELS: Record<string, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

/**
 * Ordered list of all workflow steps for navigation testing.
 * Updated for Plan-094: removed content-source-selection, added purpose-selection
 */
export const WORKFLOW_STEPS_ORDER: WorkflowStep[] = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',
  'content-type-selection',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
];

/**
 * Step labels as displayed in the UI.
 * Updated for Plan-094: removed content-source-selection, added purpose-selection
 */
export const STEP_DISPLAY_LABELS: Record<WorkflowStep, string> = {
  'room-selection': 'Room Selection',
  'item-type-selection': 'Item Type',
  'specific-item-selection': 'Specific Item',
  'purpose-selection': 'Purpose',
  'content-type-selection': 'Content Type',
  'content-creation': 'Content Creation',
  'preview-save': 'Preview',
  'next-action': 'Next Action',
  'session-summary': 'Session Summary',
};

// =============================================================================
// Render Utilities
// =============================================================================

/**
 * Interface for extended render options.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  // Add any additional options here if needed
}

/**
 * Renders a component with any required providers.
 * Currently no providers are needed, but this allows easy extension.
 *
 * @param ui - React element to render
 * @param options - Additional render options
 * @returns Render result
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: ExtendedRenderOptions
) => {
  return render(ui, { ...options });
};

// =============================================================================
// Mock Props Factory
// =============================================================================

/**
 * Creates a complete set of mock props for ItemCreationWorkflow.
 * All callbacks are jest mock functions with sensible default implementations.
 *
 * @param overrides - Partial props to override defaults
 * @returns Complete ItemCreationWorkflowProps with mocks
 */
export const createMockWorkflowProps = (
  overrides?: Partial<ItemCreationWorkflowProps>
): ItemCreationWorkflowProps => ({
  onSessionComplete: vi.fn((session: CompletedSession) => {}),
  onSessionExit: vi.fn((session: PartialSession) => {}),
  onGeneratePDF: vi.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
  onPrintDirect: vi.fn().mockResolvedValue(undefined),
  onFetchExistingItems: vi.fn().mockResolvedValue([]),
  onSaveItem: vi.fn().mockResolvedValue({ id: 'saved-item-id', qrCodeUrl: 'data:image/png;base64,mockQR' }),
  config: {
    maxItemsPerSession: 50,
    enableUrlPreview: true,
    debug: false,
  },
  ...overrides,
});

// =============================================================================
// Wait Utilities
// =============================================================================

/**
 * Waits for a step transition by checking for step-specific text.
 *
 * @param stepText - Text that indicates the target step
 * @param timeout - Maximum time to wait (default: 5000ms)
 */
export const waitForStepTransition = async (
  stepText: string | RegExp,
  timeout: number = 5000
): Promise<void> => {
  await waitFor(
    () => {
      const matcher = typeof stepText === 'string'
        ? screen.getByText(stepText)
        : screen.getByText(stepText);
      expect(matcher).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Waits for loading state to clear.
 *
 * @param timeout - Maximum time to wait (default: 5000ms)
 */
export const waitForLoadingToFinish = async (timeout: number = 5000): Promise<void> => {
  await waitFor(
    () => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    },
    { timeout }
  );
};

// =============================================================================
// Navigation Utilities
// =============================================================================

/**
 * Action type for step navigation simulation.
 */
export interface NavigationAction {
  /** Type of action to perform */
  type: 'click' | 'type' | 'select';
  /** Text or role to find the target element */
  target: string;
  /** Method to find the target ('text', 'role', 'testId') */
  findBy?: 'text' | 'role' | 'testId';
  /** Value for type actions */
  value?: string;
}

/**
 * Simulates step navigation by executing a sequence of actions.
 * Waits for transitions between steps.
 *
 * @param user - UserEvent instance
 * @param actions - Array of navigation actions to execute
 */
export const simulateStepNavigation = async (
  user: UserEvent,
  actions: NavigationAction[]
): Promise<void> => {
  for (const action of actions) {
    const findBy = action.findBy ?? 'text';
    let element: HTMLElement;

    switch (findBy) {
      case 'role':
        element = screen.getByRole(action.target as Parameters<typeof screen.getByRole>[0]);
        break;
      case 'testId':
        element = screen.getByTestId(action.target);
        break;
      case 'text':
      default:
        element = screen.getByText(action.target);
        break;
    }

    switch (action.type) {
      case 'click':
        await user.click(element);
        break;
      case 'type':
        if (action.value) {
          await user.type(element, action.value);
        }
        break;
      case 'select':
        if (action.value) {
          await user.selectOptions(element, action.value);
        }
        break;
    }

    // Small delay to allow state updates
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

// =============================================================================
// Navigation Path Helpers
// =============================================================================

/**
 * Navigates to room selection step (initial step).
 * This is a no-op since it's the initial step.
 */
export const navigateToRoomSelection = async (user: UserEvent): Promise<void> => {
  // Already at room selection on initial render
};

/**
 * Navigates from room-selection to item-type-selection.
 *
 * @param user - UserEvent instance
 * @param room - Room to select (default: 'Kitchen')
 */
export const navigateToItemTypeSelection = async (
  user: UserEvent,
  room: string = 'Kitchen'
): Promise<void> => {
  await user.click(screen.getByText(room));
  await waitForStepTransition(/Item Type/i);
};

/**
 * Navigates from initial state to specific-item-selection.
 *
 * @param user - UserEvent instance
 * @param room - Room to select (default: 'Kitchen')
 * @param itemType - Item type to select (default: 'Appliance')
 */
export const navigateToSpecificItemSelection = async (
  user: UserEvent,
  room: string = 'Kitchen',
  itemType: string = 'Appliance'
): Promise<void> => {
  await navigateToItemTypeSelection(user, room);
  await user.click(screen.getByText(itemType));
  await waitForStepTransition(/Specific Item/i);
};

/**
 * Navigates from initial state to purpose-selection step (Plan-094 new flow).
 *
 * @param user - UserEvent instance
 * @param room - Room to select (default: 'Kitchen')
 * @param itemType - Item type to select (default: 'Appliance')
 * @param specificItem - Specific item to select (default: 'Refrigerator')
 */
export const navigateToPurposeSelection = async (
  user: UserEvent,
  room: string = 'Kitchen',
  itemType: string = 'Appliance',
  specificItem: string = 'Refrigerator'
): Promise<void> => {
  await navigateToSpecificItemSelection(user, room, itemType);
  await user.click(screen.getByText(specificItem));
  await waitForPurposeStep();
};

/**
 * Waits for the purpose selection step to be displayed.
 */
export const waitForPurposeStep = async (timeout: number = 5000): Promise<void> => {
  await waitFor(
    () => {
      expect(screen.getByText(/What's the purpose of this content/i)).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Navigates from initial state to content-source-selection.
 * @deprecated Use navigateToPurposeSelection for new workflow.
 *
 * @param user - UserEvent instance
 */
export const navigateToContentSourceSelection = async (
  user: UserEvent
): Promise<void> => {
  await navigateToSpecificItemSelection(user);
  await user.click(screen.getByText('Refrigerator'));
  await waitForStepTransition(/Content Source/i);
};

/**
 * Navigates from initial state to content-type-selection.
 * Updated for Plan-094: Now goes through purpose-selection step.
 *
 * @param user - UserEvent instance
 * @param purposeLabel - Purpose to select (default: 'How to Use')
 */
export const navigateToContentTypeSelection = async (
  user: UserEvent,
  purposeLabel: string = 'How to Use'
): Promise<void> => {
  await navigateToPurposeSelection(user);
  await user.click(screen.getByText(purposeLabel));
  await waitForStepTransition(/What content would you like to add/i);
};

/**
 * Navigates from initial state to content-creation step.
 *
 * @param user - UserEvent instance
 * @param contentType - Content type to select (default: 'Record Video')
 */
export const navigateToContentCreation = async (
  user: UserEvent,
  contentType: string = 'Record Video'
): Promise<void> => {
  await navigateToContentTypeSelection(user);
  await user.click(screen.getByText(contentType));
  // Wait for content creation step
  await waitFor(() => {
    expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
  });
};

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Asserts that an element with the given text is in the document.
 *
 * @param text - Text to find
 */
export const assertTextInDocument = (text: string | RegExp): void => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

/**
 * Asserts that the current step matches the expected step.
 *
 * @param expectedStep - Expected step label or indicator
 */
export const assertCurrentStep = async (expectedStep: string | RegExp): Promise<void> => {
  await waitFor(() => {
    expect(screen.getByText(expectedStep)).toBeInTheDocument();
  });
};

/**
 * Asserts that a specific step number is shown in progress.
 *
 * @param stepNumber - Expected step number (1-9)
 */
export const assertStepNumber = (stepNumber: number): void => {
  expect(screen.getByText(`Step ${stepNumber} of 9`)).toBeInTheDocument();
};

// =============================================================================
// Mock Setup Helpers
// =============================================================================

/**
 * Creates a mock for the useQRCodeGeneration hook.
 *
 * @param overrides - Partial hook return to override defaults
 * @returns Mock hook return object
 */
export const createMockQRGenerationHook = (overrides = {}) => ({
  qrCodes: new Map<string, string>(),
  isGenerating: false,
  progress: 0,
  error: null,
  failedItems: new Set<string>(),
  generateQRCodes: vi.fn().mockResolvedValue(undefined),
  retryFailedItems: vi.fn().mockResolvedValue(undefined),
  clearQRCache: vi.fn(),
  getStats: vi.fn().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 }),
  ...overrides,
});

/**
 * Creates a mock for the useSessionQRGeneration hook.
 *
 * @param overrides - Partial hook return to override defaults
 * @returns Mock hook return object
 */
export const createMockSessionQRGenerationHook = (overrides = {}) => ({
  qrCodes: new Map<string, string>(),
  isGenerating: false,
  progress: 0,
  stats: { total: 0, completed: 0, failed: 0, remaining: 0 },
  error: null,
  failedItemIds: new Set<string>(),
  itemStatuses: new Map<string, string>(),
  generateForItems: vi.fn().mockResolvedValue(undefined),
  retryFailed: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});
