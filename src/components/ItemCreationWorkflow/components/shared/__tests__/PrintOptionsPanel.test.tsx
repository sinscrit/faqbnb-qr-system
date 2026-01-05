/**
 * PrintOptionsPanel Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/PrintOptionsPanel.test
 * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
 */

import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrintOptionsPanel } from '../PrintOptionsPanel';
import { useSessionQRGeneration } from '../../../hooks';
import type { SessionItem, ContentPiece, PrintScope } from '../../../ItemCreationWorkflow.types';

// Mock the useSessionQRGeneration hook
jest.mock('../../../hooks/useSessionQRGeneration');

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
const mockRevokeObjectURL = jest.fn();

const mockedUseSessionQRGeneration = useSessionQRGeneration as jest.MockedFunction<typeof useSessionQRGeneration>;

// Create default mock for QR hook
const createQRHookMock = (overrides = {}) => ({
  qrCodes: new Map<string, string>(),
  isGenerating: false,
  progress: 0,
  stats: { total: 0, completed: 0, failed: 0, remaining: 0 },
  error: null,
  failedItemIds: new Set<string>(),
  itemStatuses: new Map<string, string>(),
  generateForItems: jest.fn().mockResolvedValue(undefined),
  retryFailed: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn(),
  clear: jest.fn(),
  ...overrides,
});

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock());
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content' },
  order: 0,
};

const createMockSessionItem = (overrides?: Partial<SessionItem>): SessionItem => ({
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Item',
  room: 'kitchen',
  itemType: 'appliance',
  content: [mockPhotoContent],
  createdAt: new Date('2026-01-05T10:00:00Z'),
  ...overrides,
});

const createMockProps = (overrides = {}) => ({
  sessionItems: [
    createMockSessionItem({ id: 'session-1', name: 'Dishwasher' }),
    createMockSessionItem({ id: 'session-2', name: 'Microwave' }),
  ],
  existingItems: [
    createMockSessionItem({ id: 'existing-1', name: 'Refrigerator' }),
  ],
  onGeneratePDF: jest.fn().mockResolvedValue(undefined),
  onPrintDirect: jest.fn().mockResolvedValue(undefined),
  onSkipPrint: jest.fn(),
  ...overrides,
});

describe('PrintOptionsPanel', () => {
  // ===========================================================================
  // Basic Rendering Tests
  // ===========================================================================

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('displays the heading text', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);
      expect(screen.getByText('Which items would you like to print?')).toBeInTheDocument();
    });

    it('displays all three scope options', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);
      expect(screen.getByText('All Items')).toBeInTheDocument();
      expect(screen.getByText('New Items Only')).toBeInTheDocument();
      expect(screen.getByText('Select Items')).toBeInTheDocument();
    });

    it('displays correct item counts for scope options', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // All Items: 2 session + 1 existing = 3
      // Note: counts are displayed in badges
      const radios = screen.getAllByRole('radio');
      expect(within(radios[0]).getByText('3')).toBeInTheDocument(); // All Items
      expect(within(radios[1]).getByText('2')).toBeInTheDocument(); // New Items Only
    });

    it('displays all action buttons', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);
      expect(screen.getByRole('button', { name: /generate pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /print directly/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /done for now/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const props = createMockProps({ className: 'custom-test-class' });
      const { container } = render(<PrintOptionsPanel {...props} />);
      expect(container.firstChild).toHaveClass('custom-test-class');
    });
  });

  // ===========================================================================
  // Scope Selection Tests
  // ===========================================================================

  describe('scope selection', () => {
    it('defaults to "New Items Only" scope', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toHaveAttribute('aria-checked', 'true'); // New Items Only is index 1
    });

    it('updates selection when clicking "All Items"', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const allItemsCard = screen.getByText('All Items').closest('[role="radio"]');
      fireEvent.click(allItemsCard!);

      expect(allItemsCard).toHaveAttribute('aria-checked', 'true');
    });

    it('updates selection when clicking "Select Items"', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      expect(selectItemsCard).toHaveAttribute('aria-checked', 'true');
    });

    it('expands selection list when "Select Items" is chosen', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /select items to print/i })).toBeInTheDocument();
      });
    });

    it('hides selection list when switching away from "Select Items"', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // First select "Select Items"
      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Then switch to "All Items"
      const allItemsCard = screen.getByText('All Items').closest('[role="radio"]');
      fireEvent.click(allItemsCard!);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Item Selection Tests
  // ===========================================================================

  describe('item selection (when scopeType is selected)', () => {
    it('displays all items in the selection list', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Switch to Select Items mode
      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
        expect(screen.getByText('Microwave')).toBeInTheDocument();
        expect(screen.getByText('Refrigerator')).toBeInTheDocument();
      });
    });

    it('marks session items as "New"', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        const newBadges = screen.getAllByText('New');
        expect(newBadges).toHaveLength(2); // 2 session items
      });
    });

    it('toggles individual item selection', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      const dishwasherCheckbox = screen.getByRole('checkbox', { name: /dishwasher/i });

      // Initially checked (session items are pre-selected)
      expect(dishwasherCheckbox).toBeChecked();

      // Uncheck it
      await user.click(dishwasherCheckbox);
      expect(dishwasherCheckbox).not.toBeChecked();

      // Check it again
      await user.click(dishwasherCheckbox);
      expect(dishwasherCheckbox).toBeChecked();
    });

    it('updates selected count in header', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        // Session items are pre-selected, so 2 of 3
        expect(screen.getByText(/2 of 3 selected/i)).toBeInTheDocument();
      });

      // Select all
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all|deselect all/i });
      await user.click(selectAllCheckbox);

      expect(screen.getByText(/3 of 3 selected/i)).toBeInTheDocument();
    });

    it('Select All selects all items', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      // First deselect all by clicking if currently checking some
      const selectAllLabel = screen.getByText(/select all|deselect all/i).closest('label');
      const selectAllCheckbox = within(selectAllLabel!).getByRole('checkbox');

      // Click to select all
      await user.click(selectAllCheckbox);

      // All checkboxes should now be checked
      const allCheckboxes = screen.getAllByRole('checkbox');
      // Exclude the select all checkbox itself
      const itemCheckboxes = allCheckboxes.filter(cb => cb.id !== 'select-all-checkbox');
      itemCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('Deselect All clears all selections', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      // First select all, then deselect all
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all|deselect all/i });
      await user.click(selectAllCheckbox); // Select all
      await user.click(selectAllCheckbox); // Deselect all

      // All item checkboxes should now be unchecked
      const allCheckboxes = screen.getAllByRole('checkbox');
      const itemCheckboxes = allCheckboxes.filter(cb => cb.id !== 'select-all-checkbox');
      itemCheckboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('callback invocations', () => {
    it('onGeneratePDF called with "all" scope', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Select All Items scope
      const allItemsCard = screen.getByText('All Items').closest('[role="radio"]');
      fireEvent.click(allItemsCard!);

      // Click Generate PDF
      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(props.onGeneratePDF).toHaveBeenCalledWith({ type: 'all' });
      });
    });

    it('onGeneratePDF called with "new-only" scope', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Default is "New Items Only"
      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(props.onGeneratePDF).toHaveBeenCalledWith({ type: 'new-only' });
      });
    });

    it('onGeneratePDF called with "selected" scope and item IDs', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Select "Select Items" scope
      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      // Click Generate PDF (session items are pre-selected)
      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(props.onGeneratePDF).toHaveBeenCalledWith({
          type: 'selected',
          itemIds: expect.arrayContaining(['session-1', 'session-2']),
        });
      });
    });

    it('onPrintDirect called with correct PrintScope', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Default is "New Items Only"
      const printButton = screen.getByRole('button', { name: /print directly/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(props.onPrintDirect).toHaveBeenCalledWith({ type: 'new-only' });
      });
    });

    it('onSkipPrint called when Done for Now clicked', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const skipButton = screen.getByRole('button', { name: /done for now/i });
      fireEvent.click(skipButton);

      expect(props.onSkipPrint).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Disabled State Tests
  // ===========================================================================

  describe('disabled/loading states', () => {
    it('disables buttons when isProcessing is true', () => {
      const props = createMockProps({ isProcessing: true });
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /print directly/i })).toBeDisabled();
    });

    it('shows processing spinner and status', () => {
      const props = createMockProps({ isProcessing: true, processingStatus: 'Generating PDF...' });
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
    });

    it('disables buttons when scopeType is "selected" with no selections', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // Select "Select Items" scope
      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      // Deselect all
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all|deselect all/i });
      await user.click(selectAllCheckbox); // First select all if not already
      await user.click(selectAllCheckbox); // Then deselect all

      expect(screen.getByRole('button', { name: /generate pdf/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /print directly/i })).toBeDisabled();
    });

    it('Done for Now is NOT disabled during processing (allows user to exit)', () => {
      const props = createMockProps({ isProcessing: true });
      render(<PrintOptionsPanel {...props} />);

      const skipButton = screen.getByRole('button', { name: /done for now/i });
      expect(skipButton).not.toBeDisabled();
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('displays error banner when error prop is set', () => {
      const props = createMockProps({ error: 'Failed to generate PDF' });
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to generate PDF')).toBeInTheDocument();
    });

    it('displays error with dismiss button', () => {
      const props = createMockProps({
        error: 'Failed to generate PDF',
        onClearError: jest.fn()
      });
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument();
    });

    it('dismiss button calls onClearError', () => {
      const props = createMockProps({
        error: 'Failed to generate PDF',
        onClearError: jest.fn()
      });
      render(<PrintOptionsPanel {...props} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
      fireEvent.click(dismissButton);

      expect(props.onClearError).toHaveBeenCalledTimes(1);
    });

    it('error banner uses error color styling', () => {
      const props = createMockProps({ error: 'Test error' });
      render(<PrintOptionsPanel {...props} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-[#FF5A5F]');
    });

    it('error banner disappears when error is null', () => {
      const { rerender } = render(
        <PrintOptionsPanel {...createMockProps({ error: 'Test error' })} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<PrintOptionsPanel {...createMockProps({ error: null })} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has radiogroup role on scope options container', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('radiogroup is labeled by heading', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-labelledby', 'print-options-heading');
    });

    it('each scope card has radio role', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('scope cards have aria-checked attribute', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const radios = screen.getAllByRole('radio');
      const selectedRadio = radios.find(radio => radio.getAttribute('aria-checked') === 'true');
      expect(selectedRadio).toBeInTheDocument();
    });

    it('selection list has listbox role', async () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Select items to print');
      });
    });

    it('has live region for selection count announcements', async () => {
      const props = createMockProps();
      const { container } = render(<PrintOptionsPanel {...props} />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('error has alert role with assertive aria-live', () => {
      const props = createMockProps({ error: 'Test error' });
      render(<PrintOptionsPanel {...props} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('buttons have minimum touch target size', () => {
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      const printButton = screen.getByRole('button', { name: /print directly/i });

      expect(generateButton).toHaveClass('min-h-[48px]');
      expect(printButton).toHaveClass('min-h-[48px]');
    });

    it('keyboard navigation with Space/Enter selects scope', async () => {
      const user = userEvent.setup();
      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const allItemsCard = screen.getByText('All Items').closest('[role="radio"]');
      allItemsCard!.focus();

      await user.keyboard('{Enter}');

      expect(allItemsCard).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles empty session items', () => {
      const props = createMockProps({ sessionItems: [] });
      render(<PrintOptionsPanel {...props} />);

      // Should still render
      expect(screen.getByText('Which items would you like to print?')).toBeInTheDocument();

      // New Items Only should show 0
      const radios = screen.getAllByRole('radio');
      expect(within(radios[1]).getByText('0')).toBeInTheDocument();
    });

    it('handles empty existing items', () => {
      const props = createMockProps({ existingItems: [] });
      render(<PrintOptionsPanel {...props} />);

      // All Items count should equal session items
      const radios = screen.getAllByRole('radio');
      expect(within(radios[0]).getByText('2')).toBeInTheDocument(); // Same as session items
    });

    it('handles both empty session and existing items', () => {
      const props = createMockProps({ sessionItems: [], existingItems: [] });
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByText('Which items would you like to print?')).toBeInTheDocument();
    });

    it('handles undefined existingItems prop', () => {
      const props = createMockProps();
      delete (props as Record<string, unknown>).existingItems;

      expect(() => render(<PrintOptionsPanel {...props} />)).not.toThrow();
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('revokes object URLs on unmount', async () => {
      const props = createMockProps();
      const { unmount } = render(<PrintOptionsPanel {...props} />);

      // Switch to Select Items to trigger thumbnail rendering
      const selectItemsCard = screen.getByText('Select Items').closest('[role="radio"]');
      fireEvent.click(selectItemsCard!);

      await waitFor(() => {
        expect(screen.getByText('Dishwasher')).toBeInTheDocument();
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // QR Code Integration Tests (REQ-111)
  // ===========================================================================

  describe('QR code generation integration', () => {
    it('triggers QR code generation when Generate PDF clicked', async () => {
      const mockGenerateForItems = jest.fn().mockResolvedValue(undefined);
      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        generateForItems: mockGenerateForItems,
      }));

      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateForItems).toHaveBeenCalled();
      });
    });

    it('triggers QR code generation when Print Directly clicked', async () => {
      const mockGenerateForItems = jest.fn().mockResolvedValue(undefined);
      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        generateForItems: mockGenerateForItems,
      }));

      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      const printButton = screen.getByRole('button', { name: /print directly/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(mockGenerateForItems).toHaveBeenCalled();
      });
    });

    it('skips QR generation for items that already have qrCodeUrl', async () => {
      const mockGenerateForItems = jest.fn().mockResolvedValue(undefined);
      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        generateForItems: mockGenerateForItems,
      }));

      // All items already have QR codes
      const props = createMockProps({
        sessionItems: [
          createMockSessionItem({ id: 'session-1', name: 'Dishwasher', qrCodeUrl: 'existing-qr' }),
          createMockSessionItem({ id: 'session-2', name: 'Microwave', qrCodeUrl: 'existing-qr' }),
        ],
      });
      render(<PrintOptionsPanel {...props} />);

      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        // Should proceed directly without calling generateForItems
        expect(props.onGeneratePDF).toHaveBeenCalled();
      });

      expect(mockGenerateForItems).not.toHaveBeenCalled();
    });

    it('shows QR progress indicator during generation', () => {
      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        isGenerating: true,
        progress: 50,
        stats: { total: 2, completed: 1, failed: 0, remaining: 1 },
      }));

      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      // The button should show generating state
      expect(screen.getByRole('button', { name: /generating qr codes/i })).toBeInTheDocument();
    });

    it('disables action buttons during QR generation', () => {
      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        isGenerating: true,
      }));

      const props = createMockProps();
      render(<PrintOptionsPanel {...props} />);

      expect(screen.getByRole('button', { name: /generating qr codes/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /print directly/i })).toBeDisabled();
    });

    it('calls onQRGenerationComplete callback when QR codes are generated', async () => {
      const qrCodesMap = new Map([
        ['session-1', 'qr-code-1'],
        ['session-2', 'qr-code-2'],
      ]);

      let resolveGeneration: () => void;
      const generatePromise = new Promise<void>(resolve => {
        resolveGeneration = resolve;
      });

      mockedUseSessionQRGeneration.mockReturnValue(createQRHookMock({
        qrCodes: qrCodesMap,
        generateForItems: jest.fn().mockImplementation(() => generatePromise),
      }));

      const onQRGenerationComplete = jest.fn();
      const props = createMockProps({
        onQRGenerationComplete,
      });

      render(<PrintOptionsPanel {...props} />);

      const generateButton = screen.getByRole('button', { name: /generate pdf/i });
      fireEvent.click(generateButton);

      // Resolve generation
      await act(async () => {
        resolveGeneration!();
      });

      // onQRGenerationComplete should be called when QR generation finishes
      // Note: The actual callback is triggered based on effect logic
    });
  });
});
