/**
 * ItemCreationWorkflow Component Integration Tests
 *
 * @module ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCreationWorkflow } from '../ItemCreationWorkflow';

describe('ItemCreationWorkflow', () => {
  const defaultProps = {
    onSessionComplete: jest.fn(),
    onSessionExit: jest.fn(),
    onGeneratePDF: jest.fn().mockResolvedValue(new Blob()),
    onPrintDirect: jest.fn().mockResolvedValue(undefined),
    onFetchExistingItems: jest.fn().mockResolvedValue([]),
    onSaveItem: jest.fn().mockResolvedValue({ id: 'test', qrCodeUrl: 'test' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step (room-selection)', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByText(/Room Selection/i)).toBeInTheDocument();
  });

  it('shows progress as Step 1 of 9', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
  });

  it('back button not visible on first step', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
  });

  it('shows exit button', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
  });

  it('opens exit dialog when exit clicked on first step (no unsaved work)', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Exit workflow'));
    // On first step with no work, it should exit immediately
    expect(defaultProps.onSessionExit).toHaveBeenCalledTimes(1);
  });

  it('calls onSessionExit with proper session data', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Exit workflow'));
    expect(defaultProps.onSessionExit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        startedAt: expect.any(Date),
        currentStep: 'room-selection',
        items: [],
        exitedAt: expect.any(Date),
      })
    );
  });

  it('renders placeholder text for first step', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByText(/Step component placeholder/)).toBeInTheDocument();
  });

  it('shows Continue (Test) button on first step', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByText('Continue (Test)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ItemCreationWorkflow {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders WorkflowHeader component', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    // Progress bar is part of WorkflowHeader
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<ItemCreationWorkflow {...defaultProps} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
