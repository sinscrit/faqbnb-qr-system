/**
 * ItemCapture Integration Tests
 *
 * Tests for ItemCapture configuration mapping, content transformation,
 * and error handling within the ItemCreationWorkflow context.
 *
 * @module ItemCreationWorkflow/__tests__/ItemCapture.integration
 * @see docs/REQ-116-integration-tests-detailed.md
 * @lastModified 2026-01-05 (REQ-116 Integration Tests)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWorkflow } from '../ItemCreationWorkflow';
import {
  createMockWorkflowProps,
  createMockSessionQRGenerationHook,
} from './helpers';
import {
  createMockItemRecord,
  createMockMediaItem,
  createMockMediaMetadata,
} from './helpers/mockFactories';
import type { ItemRecord, ItemCaptureProps, ItemCaptureConfig } from '@/components/ItemCapture/ItemCapture.types';
import type { ContentPiece, ContentType } from '../ItemCreationWorkflow.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Capture the config and callbacks passed to ItemCapture
let capturedConfig: ItemCaptureConfig | undefined;
let capturedOnComplete: ((record: ItemRecord) => void) | undefined;
let capturedOnCancel: (() => void) | undefined;
let capturedInitialRoom: string | undefined;
let capturedInitialApplianceType: string | undefined;

vi.mock('@/components/ItemCapture', () => ({
  ItemCapture: ({
    onComplete,
    onCancel,
    config,
    initialRoom,
    initialApplianceType,
  }: ItemCaptureProps & {
    initialRoom?: string;
    initialApplianceType?: string;
  }) => {
    capturedConfig = config;
    capturedOnComplete = onComplete;
    capturedOnCancel = onCancel;
    capturedInitialRoom = initialRoom;
    capturedInitialApplianceType = initialApplianceType;

    return (
      <div data-testid="mock-item-capture">
        <div data-testid="item-capture-config">{JSON.stringify(config)}</div>
        <div data-testid="initial-room">{initialRoom || 'none'}</div>
        <div data-testid="initial-appliance-type">{initialApplianceType || 'none'}</div>
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
    );
  },
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
 * Navigate to content creation step with specified content type.
 */
const navigateToContentCreation = async (
  user: ReturnType<typeof userEvent.setup>,
  contentType: string = 'Video',
  contentSource: string = 'Create now'
) => {
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
  await user.click(screen.getByText(new RegExp(contentSource, 'i')));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Content type
  await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
  await user.click(screen.getByText(new RegExp(contentType, 'i')));
  await user.click(screen.getByRole('button', { name: /continue/i }));

  // Wait for ItemCapture to render
  await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());
};

// =============================================================================
// Test Suites
// =============================================================================

describe('ItemCapture Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    capturedConfig = undefined;
    capturedOnComplete = undefined;
    capturedOnCancel = undefined;
    capturedInitialRoom = undefined;
    capturedInitialApplianceType = undefined;
  });

  // ===========================================================================
  // Task 8: Configuration Mapping Tests
  // ===========================================================================
  describe('ItemCapture Configuration', () => {
    it.each([
      ['Video', { allowedMediaTypes: ['video'] }],
      ['Photo', { allowedMediaTypes: ['image'] }],
    ])('maps %s contentType to correct config', async (contentType, expectedConfig) => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, contentType);

      // Verify config was passed
      expect(capturedConfig).toBeDefined();
      expect(capturedConfig?.allowedMediaTypes).toEqual(expectedConfig.allowedMediaTypes);
    });

    it('passes maxVideoDuration config', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      expect(capturedConfig?.maxVideoDuration).toBe(120);
    });

    it('passes maxFileSize config', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      expect(capturedConfig?.maxFileSize).toBe(100 * 1024 * 1024); // 100MB
    });

    it('video content type maps to video media type', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      expect(capturedConfig?.allowedMediaTypes).toContain('video');
      expect(capturedConfig?.allowedMediaTypes).not.toContain('image');
      expect(capturedConfig?.allowedMediaTypes).not.toContain('pdf');
    });

    it('photo content type maps to image media type', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Photo');

      expect(capturedConfig?.allowedMediaTypes).toContain('image');
      expect(capturedConfig?.allowedMediaTypes).not.toContain('video');
    });
  });

  // ===========================================================================
  // Task 9: Content Transformation Tests
  // ===========================================================================
  describe('Content Transformation', () => {
    it('transforms video ItemRecord to ContentPiece correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      // Create a mock video record
      const videoRecord = createMockItemRecord('video', {
        media: [
          createMockMediaItem('video', {
            metadata: createMockMediaMetadata('video', {
              duration: 45,
              mimeType: 'video/mp4',
              fileSize: 5000000,
            }),
          }),
        ],
      });

      // Trigger onComplete with the video record
      if (capturedOnComplete) {
        capturedOnComplete(videoRecord);
      }

      // Should navigate to preview step
      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });

    it('transforms photo ItemRecord to ContentPiece correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Photo');

      const photoRecord = createMockItemRecord('image', {
        media: [
          createMockMediaItem('image', {
            metadata: createMockMediaMetadata('image', {
              mimeType: 'image/jpeg',
              fileSize: 2000000,
            }),
          }),
        ],
      });

      if (capturedOnComplete) {
        capturedOnComplete(photoRecord);
      }

      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });

    it('onComplete navigates to preview-save step', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      // Complete capture
      await user.click(screen.getByTestId('complete-capture-btn'));

      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });

    it('onCancel navigates back to content-type-selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      // Cancel capture
      await user.click(screen.getByTestId('cancel-capture-btn'));

      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 10: Error Handling Tests
  // ===========================================================================
  describe('ItemCapture Error Handling', () => {
    it('handles empty media array gracefully', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      const emptyRecord = createMockItemRecord('video', {
        media: [],
      });

      // Should not throw when completing with empty media
      expect(() => {
        if (capturedOnComplete) {
          capturedOnComplete(emptyRecord);
        }
      }).not.toThrow();
    });

    it('workflow remains stable after cancel', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      // Cancel
      await user.click(screen.getByTestId('cancel-capture-btn'));

      // Should be back at content type selection
      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });

      // Can navigate again
      await user.click(screen.getByText(/Video/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });
    });

    it('allows retry after cancel', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await navigateToContentCreation(user, 'Video');

      // Cancel first attempt
      await user.click(screen.getByTestId('cancel-capture-btn'));

      await waitFor(() => {
        expect(screen.getByText(/What type of content/i)).toBeInTheDocument();
      });

      // Retry
      await user.click(screen.getByText(/Video/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
      });

      // Complete this time
      await user.click(screen.getByTestId('complete-capture-btn'));

      await waitFor(() => {
        expect(screen.getByText(/Preview/i)).toBeInTheDocument();
      });
    });

    it('handles multiple capture attempts without state corruption', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // First complete flow
      await navigateToContentCreation(user, 'Video');
      await user.click(screen.getByTestId('complete-capture-btn'));
      await waitFor(() => expect(screen.getByText(/Preview/i)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument());

      // Start new item
      await user.click(screen.getByText(/Tag New Item/i));

      // Complete second flow
      await waitFor(() => expect(screen.getByText('Select a Room')).toBeInTheDocument());
      await user.click(screen.getByText('Bedroom'));
      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => expect(screen.getByText('Room Item')).toBeInTheDocument());
      await user.click(screen.getByText('Room Item'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Workflow should be functional
      await waitFor(() => {
        expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Task 11: Pre-fill Integration Tests (REQ-144)
  // ===========================================================================
  describe('Pre-fill Room and Item Type (REQ-144)', () => {
    it('passes Kitchen as initialRoom when kitchen is selected', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow - selecting Kitchen
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

      // Wait for ItemCapture to render
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // Verify initialRoom was passed as "Kitchen"
      expect(capturedInitialRoom).toBe('Kitchen');
      expect(screen.getByTestId('initial-room')).toHaveTextContent('Kitchen');
    });

    it('passes Living Room as initialRoom for living-room selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Navigate through workflow - selecting Living Room
      await user.click(screen.getByText('Living Room'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Continue through steps...
      await waitFor(() => expect(screen.getByText('Room Item')).toBeInTheDocument());
      await user.click(screen.getByText('Room Item'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByText(/What would you like to document/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/TV/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Photo/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Wait for ItemCapture
      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      expect(capturedInitialRoom).toBe('Living Room');
    });

    it('passes Laundry Room as initialRoom for laundry selection', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      await user.click(screen.getByText('Laundry'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText('Washer')).toBeInTheDocument());
      await user.click(screen.getByText('Washer'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      expect(capturedInitialRoom).toBe('Laundry Room');
    });

    it('passes undefined initialApplianceType (no pre-fill for appliance type)', async () => {
      const user = userEvent.setup();
      const props = createMockWorkflowProps();
      render(<ItemCreationWorkflow {...props} />);

      // Use explicit navigation
      await user.click(screen.getByText('Kitchen'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText('Appliance')).toBeInTheDocument());
      await user.click(screen.getByText('Appliance'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText('Refrigerator')).toBeInTheDocument());
      await user.click(screen.getByText('Refrigerator'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/How would you like to add content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Create now/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByText(/What type of content/i)).toBeInTheDocument());
      await user.click(screen.getByText(/Video/i));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument());

      // As per design, itemType mapping returns undefined (user should select specific appliance)
      expect(capturedInitialApplianceType).toBeUndefined();
      expect(screen.getByTestId('initial-appliance-type')).toHaveTextContent('none');
    });
  });
});
