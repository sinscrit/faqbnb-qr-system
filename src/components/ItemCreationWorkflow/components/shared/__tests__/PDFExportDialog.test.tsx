/**
 * PDFExportDialog Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test
 * @see docs/REQ-112-pdf-generation-integration-overview.md
 * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PDFExportDialog } from '../PDFExportDialog';
import type { PDFExportSettings } from '@/types/pdf';

// Mock PDFExportOptions component
vi.mock('@/components/PDFExportOptions', () => ({
  PDFExportOptions: ({ settings, onSettingsChange, disabled }: any) => (
    <div data-testid="pdf-export-options" data-disabled={disabled}>
      <button onClick={() => onSettingsChange({ qrSize: 50 })}>
        Update Settings
      </button>
      <span>Page Format: {settings.pageFormat}</span>
    </div>
  ),
}));

// =============================================================================
// Test Fixtures
// =============================================================================

const createDefaultSettings = (): PDFExportSettings => ({
  pageFormat: 'Letter',
  margins: 10,
  qrSize: 40,
  qrSizeMm: 40,
  includeCutlines: true,
  includeLabels: true,
  showLabels: true,
  itemsPerRow: 4,
});

const createDefaultProps = () => ({
  isOpen: true,
  onClose: vi.fn(),
  onExport: vi.fn().mockResolvedValue(undefined),
  itemCount: 5,
  settings: createDefaultSettings(),
  onSettingsChange: vi.fn(),
  isGenerating: false,
  error: null,
  onClearError: vi.fn(),
});

// =============================================================================
// Test Suites
// =============================================================================

describe('PDFExportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('returns null when isOpen is false', () => {
      const props = createDefaultProps();
      const { container } = render(<PDFExportDialog {...props} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders dialog when isOpen is true', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('displays the correct title', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);
      expect(screen.getByText('Export QR Codes as PDF')).toBeInTheDocument();
    });

    it('displays the item count badge', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} itemCount={5} />);
      expect(screen.getByText('5 items')).toBeInTheDocument();
    });

    it('displays singular item text for 1 item', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} itemCount={1} />);
      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('renders PDFExportOptions component', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);
      expect(screen.getByTestId('pdf-export-options')).toBeInTheDocument();
    });

    it('renders Cancel and Export PDF buttons', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Dialog Behavior Tests
  // ===========================================================================

  describe('dialog behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      await userEvent.click(screen.getByText('Cancel'));
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close button (X) is clicked', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      const closeButton = screen.getByLabelText('Close dialog');
      await userEvent.click(closeButton);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when dialog content is clicked', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      await userEvent.click(screen.getByText('Export QR Codes as PDF'));
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when isGenerating', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('does not close on backdrop click when isGenerating', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Export Tests
  // ===========================================================================

  describe('export behavior', () => {
    it('calls onExport with settings when Export PDF button is clicked', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      await userEvent.click(screen.getByText('Export PDF'));

      expect(props.onExport).toHaveBeenCalledWith(props.settings);
    });

    it('passes settings changes through onSettingsChange', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      // Click the mocked "Update Settings" button
      await userEvent.click(screen.getByText('Update Settings'));

      expect(props.onSettingsChange).toHaveBeenCalledWith({ qrSize: 50 });
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('loading state', () => {
    it('shows generating state in button when isGenerating is true', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    it('disables Cancel button when isGenerating', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    it('disables close button when isGenerating', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      expect(screen.getByLabelText('Close dialog')).toBeDisabled();
    });

    it('disables PDFExportOptions when isGenerating', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} isGenerating={true} />);

      const options = screen.getByTestId('pdf-export-options');
      expect(options).toHaveAttribute('data-disabled', 'true');
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('error state', () => {
    it('displays error banner when error is provided', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} error="PDF generation failed" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('PDF generation failed')).toBeInTheDocument();
    });

    it('displays generic error title', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} error="Some error" />);

      expect(screen.getByText('PDF generation failed')).toBeInTheDocument();
    });

    it('calls onClearError when dismiss button is clicked', async () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} error="Test error" />);

      await userEvent.click(screen.getByLabelText('Dismiss error'));

      expect(props.onClearError).toHaveBeenCalledTimes(1);
    });

    it('does not show error banner when error is null', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} error={null} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has correct aria attributes on dialog', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'pdf-export-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'pdf-export-dialog-description');
    });

    it('has hidden description for screen readers', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      const description = screen.getByText(/Configure PDF export settings/);
      expect(description).toHaveClass('sr-only');
    });

    it('close button has accessible label', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} />);

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Custom Class Tests
  // ===========================================================================

  describe('custom styling', () => {
    it('applies custom className', () => {
      const props = createDefaultProps();
      render(<PDFExportDialog {...props} className="custom-dialog-class" />);

      // Find the dialog content container with the custom class
      const dialogContent = screen.getByRole('dialog').querySelector('.custom-dialog-class');
      expect(dialogContent).toBeInTheDocument();
    });
  });
});
