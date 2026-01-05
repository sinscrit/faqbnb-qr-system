/**
 * ConfirmExitDialog Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmExitDialog } from '../ConfirmExitDialog';

describe('ConfirmExitDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirmExit: jest.fn(),
    itemCount: 0,
    hasUnsavedChanges: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<ConfirmExitDialog {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog when isOpen is true', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('displays title "Exit Workflow?"', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    expect(screen.getByText('Exit Workflow?')).toBeInTheDocument();
  });

  it('displays correct message with no items and no unsaved changes', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    expect(screen.getByText('Are you sure you want to exit the workflow?')).toBeInTheDocument();
  });

  it('displays correct message with items', () => {
    render(<ConfirmExitDialog {...defaultProps} itemCount={3} />);
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it('displays correct message with 1 item (singular)', () => {
    render(<ConfirmExitDialog {...defaultProps} itemCount={1} />);
    expect(screen.getByText(/1 item in this session/)).toBeInTheDocument();
    // Should not have 's' after 'item'
    expect(screen.queryByText(/1 items/)).not.toBeInTheDocument();
  });

  it('displays correct message with unsaved changes only', () => {
    render(<ConfirmExitDialog {...defaultProps} hasUnsavedChanges={true} />);
    expect(screen.getByText(/unsaved changes/)).toBeInTheDocument();
  });

  it('displays correct message with both items and unsaved changes', () => {
    render(<ConfirmExitDialog {...defaultProps} itemCount={2} hasUnsavedChanges={true} />);
    const message = screen.getByText(/unsaved changes and 2 items/);
    expect(message).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirmExit when Exit Workflow clicked', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Exit Workflow'));
    expect(defaultProps.onConfirmExit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    const backdrop = screen.getByRole('alertdialog');
    // Click the backdrop (parent of the dialog)
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when dialog content clicked', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    // Click on the title inside the dialog
    fireEvent.click(screen.getByText('Exit Workflow?'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape pressed', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for other key presses', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Enter' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('has correct aria attributes', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'exit-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'exit-dialog-description');
  });

  it('renders Cancel and Exit Workflow buttons', () => {
    render(<ConfirmExitDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Exit Workflow')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ConfirmExitDialog {...defaultProps} className="custom-class" />);
    // Find the dialog container (the white card, not the backdrop)
    const dialogContent = screen.getByRole('alertdialog').querySelector('.custom-class');
    expect(dialogContent).toBeInTheDocument();
  });
});
