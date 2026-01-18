/**
 * AddMediaLinkForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddMediaLinkForm } from '../AddMediaLinkForm';

describe('AddMediaLinkForm', () => {
  const defaultProps = {
    onAdd: vi.fn(),
    onCancel: vi.fn(),
    isExpanded: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields when expanded', () => {
    render(<AddMediaLinkForm {...defaultProps} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
  });

  it('does not render when not expanded', () => {
    render(<AddMediaLinkForm {...defaultProps} isExpanded={false} />);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it('auto-detects YouTube link type', async () => {
    render(<AddMediaLinkForm {...defaultProps} />);
    const urlInput = screen.getByLabelText(/url/i);
    await userEvent.type(urlInput, 'https://youtube.com/watch?v=abc');

    await waitFor(() => {
      expect(screen.getByDisplayValue('youtube')).toBeInTheDocument();
    });
  });

  it('validates URL format', async () => {
    render(<AddMediaLinkForm {...defaultProps} />);
    const urlInput = screen.getByLabelText(/url/i);
    await userEvent.type(urlInput, 'not-a-url');

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('calls onAdd with form data on submit', async () => {
    render(<AddMediaLinkForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'Test Link');
    await userEvent.type(screen.getByLabelText(/url/i), 'https://example.com');

    fireEvent.click(screen.getByText('Add Link'));

    await waitFor(() => {
      expect(defaultProps.onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Link',
          url: 'https://example.com',
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AddMediaLinkForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
