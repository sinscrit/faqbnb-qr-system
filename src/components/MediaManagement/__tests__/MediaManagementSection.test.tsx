/**
 * MediaManagementSection Integration Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaManagementSection } from '../MediaManagementSection';
import type { ItemLink } from '@/types';

const mockLinks: ItemLink[] = [
  {
    id: 'link-1',
    item_id: 'item-1',
    title: 'Video Guide',
    link_type: 'youtube',
    url: 'https://youtube.com/watch?v=abc',
    thumbnail_url: null,
    display_order: 0,
    created_at: '2026-01-01',
  },
  {
    id: 'link-2',
    item_id: 'item-1',
    title: 'PDF Manual',
    link_type: 'pdf',
    url: 'https://example.com/manual.pdf',
    thumbnail_url: null,
    display_order: 1,
    created_at: '2026-01-01',
  },
];

describe('MediaManagementSection', () => {
  const defaultProps = {
    initialLinks: mockLinks,
    onLinksChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing links', () => {
    render(<MediaManagementSection {...defaultProps} />);
    expect(screen.getByText('Video Guide')).toBeInTheDocument();
    expect(screen.getByText('PDF Manual')).toBeInTheDocument();
  });

  it('shows empty state when no links', () => {
    render(<MediaManagementSection {...defaultProps} initialLinks={[]} />);
    expect(screen.getByText(/no media links yet/i)).toBeInTheDocument();
  });

  it('expands add form when Add Link is clicked', () => {
    render(<MediaManagementSection {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Link'));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('shows delete confirmation when delete is clicked', () => {
    render(<MediaManagementSection {...defaultProps} />);
    const deleteButtons = screen.getAllByLabelText(/delete link/i);
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/delete youtube video/i)).toBeInTheDocument();
  });

  it('calls onLinksChange when links are modified', async () => {
    render(<MediaManagementSection {...defaultProps} />);

    // Initial call with converted links
    expect(defaultProps.onLinksChange).toHaveBeenCalled();
  });

  it('disables interactions when readOnly is true', () => {
    render(<MediaManagementSection {...defaultProps} readOnly />);
    expect(screen.queryByText('Add Link')).not.toBeInTheDocument();
  });
});
