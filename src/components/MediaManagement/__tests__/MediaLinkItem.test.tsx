/**
 * MediaLinkItem Component Tests
 *
 * @see docs/req-143-media-management-Overview.md
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MediaLinkItem } from '../MediaLinkItem';
import type { EditableMediaLink } from '../MediaManagement.types';

const mockLink: EditableMediaLink = {
  id: 'link-1',
  title: 'Test Video',
  linkType: 'youtube',
  url: 'https://youtube.com/watch?v=abc123',
  displayOrder: 0,
};

describe('MediaLinkItem', () => {
  const defaultProps = {
    link: mockLink,
    index: 0,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSave: vi.fn(),
    onCancelEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders link title and URL', () => {
    render(<MediaLinkItem {...defaultProps} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('https://youtube.com/watch?v=abc123')).toBeInTheDocument();
  });

  it('renders correct icon for YouTube links', () => {
    render(<MediaLinkItem {...defaultProps} />);
    expect(screen.getByText('youtube')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<MediaLinkItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Edit link'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockLink);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<MediaLinkItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Delete link'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockLink);
  });

  it('shows edit form when isEditing is true', () => {
    render(<MediaLinkItem {...defaultProps} isEditing />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
  });

  it('shows drag handle when showDragHandle is true', () => {
    render(<MediaLinkItem {...defaultProps} showDragHandle />);
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
  });
});
